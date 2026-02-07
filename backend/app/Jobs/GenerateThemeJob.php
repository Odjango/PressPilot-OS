<?php

namespace App\Jobs;

use App\Models\GeneratedTheme;
use App\Models\GenerationJob;
use App\Services\MetricsLogger;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Storage;
use Throwable;

class GenerateThemeJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 2;
    public int $timeout = 350;
    public array $backoff = [30];

    private string $jobId;
    private string $projectId;

    public function __construct(
        private GenerationJob $generationJob,
    ) {
        $this->jobId = $generationJob->id;
        $this->projectId = $generationJob->project_id;
        $this->onQueue('generate');
    }

    public function handle(MetricsLogger $metrics): void
    {
        $startTime = microtime(true);

        $metrics->emit('job.started', [
            'job_id' => $this->jobId,
            'worker_id' => gethostname(),
        ]);

        // 1. Optimistic lock: claim the job
        $job = GenerationJob::find($this->jobId);
        if (! $job || ! $job->claimForProcessing()) {
            Log::warning('GenerateThemeJob: Could not claim job', [
                'job_id' => $this->jobId,
            ]);

            return;
        }

        $tempDir = "/tmp/pp-jobs/{$this->jobId}";

        // Create workspace (generator also creates via fs.emptyDir,
        // but this ensures the path exists before subprocess launch)
        if (! is_dir($tempDir)) {
            mkdir($tempDir, 0755, true);
        }

        try {
            // 2. Load project data
            $project = $job->project;
            if (! $project) {
                throw new \RuntimeException("Project not found: {$this->projectId}");
            }

            $generatorData = $project->data ?? [];
            if (empty($generatorData['name'])) {
                $generatorData['name'] = $project->name;
            }

            // 3. Build stdin JSON for generator subprocess
            $stdinPayload = json_encode([
                'data' => $generatorData,
                'mode' => 'standard',
                'slug' => $this->jobId,
                'outDir' => $tempDir,
            ], JSON_THROW_ON_ERROR);

            // 4. Invoke Node generator subprocess
            $subprocessStart = microtime(true);

            $result = Process::timeout(300)
                ->env([
                    'NODE_ENV' => 'production',
                    'UNSPLASH_ACCESS_KEY' => config('services.unsplash.key'),
                ])
                ->path('/app/generator')
                ->input($stdinPayload)
                ->run('npx tsx /app/generator/bin/generate.ts');

            $subprocessDuration = (int) ((microtime(true) - $subprocessStart) * 1000);

            $metrics->emit('generator.subprocess_duration_ms', [
                'job_id' => $this->jobId,
                'exit_code' => $result->exitCode(),
                'duration_ms' => $subprocessDuration,
            ]);

            // Log stderr (generator progress messages)
            if ($result->errorOutput()) {
                Log::info('generator.stderr', [
                    'job_id' => $this->jobId,
                    'stderr' => mb_substr($result->errorOutput(), 0, 10000),
                ]);
            }

            if ($result->failed()) {
                throw new \RuntimeException(
                    "Generator subprocess failed (exit {$result->exitCode()}): "
                    .mb_substr($result->errorOutput(), 0, 2000)
                );
            }

            // 5. Parse stdout JSON and validate against GeneratorOutput schema
            $output = json_decode(trim($result->output()), true, 512, JSON_THROW_ON_ERROR);

            if (($output['status'] ?? '') !== 'success') {
                throw new \RuntimeException(
                    'Generator returned non-success: '.($output['error'] ?? 'unknown')
                );
            }

            // Validate required GeneratorOutput fields
            foreach (['themeName', 'downloadPath', 'filename', 'themeDir'] as $field) {
                if (empty($output[$field]) || ! is_string($output[$field])) {
                    throw new \RuntimeException(
                        "Generator output missing required field: {$field}"
                    );
                }
            }

            // 6. Upload theme ZIP to Supabase Storage
            if (! file_exists($output['downloadPath'])) {
                throw new \RuntimeException(
                    "Theme ZIP not found at: {$output['downloadPath']}"
                );
            }

            $themeStoragePath = "themes/{$this->projectId}/{$this->jobId}.zip";
            $this->uploadFile($output['downloadPath'], $themeStoragePath, $metrics);

            // 7. Upload static ZIP to Supabase Storage (if produced)
            $staticStoragePath = "previews/{$this->projectId}/{$this->jobId}.zip";
            if (! empty($output['staticPath']) && file_exists($output['staticPath'])) {
                $this->uploadFile($output['staticPath'], $staticStoragePath, $metrics);
            }

            // 8. Update job status to completed
            $job->markCompleted([
                'download_path' => $themeStoragePath,
                'static_path' => $staticStoragePath,
            ]);

            // 9. Insert generated_themes record (24h expiry)
            GeneratedTheme::create([
                'job_id' => $this->jobId,
                'file_path' => $themeStoragePath,
                'status' => GeneratedTheme::STATUS_ACTIVE,
                'expires_at' => now()->addHours(24),
            ]);

            $totalDuration = (int) ((microtime(true) - $startTime) * 1000);

            $metrics->emit('job.completed', [
                'job_id' => $this->jobId,
                'duration_ms' => $totalDuration,
            ]);
        } catch (Throwable $e) {
            throw $e;
        } finally {
            // 10. Clean up temp directory
            $this->cleanupTempDir($tempDir);
        }
    }

    /**
     * Handle final job failure (after all retries exhausted).
     */
    public function failed(?Throwable $exception): void
    {
        $job = GenerationJob::find($this->jobId);
        $job?->markFailed($exception?->getMessage() ?? 'Unknown error');

        app(MetricsLogger::class)->emit('job.failed', [
            'job_id' => $this->jobId,
            'error' => $exception?->getMessage(),
            'attempt' => $this->attempts(),
        ]);
    }

    private function uploadFile(string $localPath, string $storagePath, MetricsLogger $metrics): void
    {
        $uploadStart = microtime(true);
        $fileSize = filesize($localPath);

        Storage::disk('supabase')->put(
            $storagePath,
            file_get_contents($localPath),
            ['ContentType' => 'application/zip']
        );

        $uploadDuration = (int) ((microtime(true) - $uploadStart) * 1000);

        $metrics->emit('storage.upload_duration_ms', [
            'job_id' => $this->jobId,
            'path' => $storagePath,
            'duration_ms' => $uploadDuration,
            'bytes' => $fileSize,
        ]);
    }

    private function cleanupTempDir(string $dir): void
    {
        if (is_dir($dir)) {
            Process::run('rm -rf '.escapeshellarg($dir));
        }
    }
}
