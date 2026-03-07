<?php

namespace App\Jobs;

use App\Services\AIPlanner;
use App\Services\ImageHandler;
use App\Services\MetricsLogger;
use App\Services\PatternSelector;
use App\Services\PlaygroundValidator;
use App\Services\PlaceholderProvider;
use App\Services\ThemeAssembler;
use App\Services\TokenInjector;
use App\Services\UnsplashProvider;
use App\Models\GeneratedTheme;
use App\Models\GenerationJob;
use App\Exceptions\BlockGrammarException;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
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

        $job = GenerationJob::find($this->jobId);
        if (! $job || ! $job->claimForProcessing()) {
            Log::warning('GenerateThemeJob: Could not claim job', [
                'job_id' => $this->jobId,
            ]);

            return;
        }

        $tempDir = "/tmp/pp-jobs/{$this->jobId}";
        if (! is_dir($tempDir)) {
            mkdir($tempDir, 0755, true);
        }

        try {
            $project = $job->project;
            if (! $project) {
                throw new \RuntimeException("Project not found: {$this->projectId}");
            }

            $projectData = $project->data ?? [];
            $projectData['name'] = $projectData['name'] ?? $project->name;
            $projectData['slug'] = $projectData['slug'] ?? $this->jobId;
            $projectData['businessCategory'] = $projectData['businessCategory'] ?? $project->site_type;
            $projectData['language'] = $projectData['language'] ?? $project->language;

            // Step 1: AI generates content tokens
            $aiPlanner = app(AIPlanner::class);
            $tokens = $aiPlanner->generate($projectData);

            // Step 2: PatternSelector picks skeletons by vertical recipe
            $category = $this->normalizeCategory($projectData['businessCategory'] ?? $projectData['category'] ?? 'local_service');
            $patternSelector = app(PatternSelector::class);
            $skeletonSelections = $patternSelector->select($category);

            // Step 3: ImageHandler gets Unsplash URLs and merge into tokens
            $imageHandler = new ImageHandler(new UnsplashProvider, new PlaceholderProvider);
            $imageTokens = $this->extractImageTokens($skeletonSelections);
            $imageUrls = $imageHandler->generateImages($projectData, $tempDir . '/assets/images', $imageTokens);
            $allTokens = array_merge($tokens, $imageUrls);

            // Step 4: TokenInjector processes skeletons with all tokens
            $tokenInjector = app(TokenInjector::class);
            $pageHtml = $tokenInjector->processSkeletons($skeletonSelections, $allTokens);

            // Step 5: ThemeAssembler builds the theme ZIP
            $themeAssembler = app(ThemeAssembler::class);
            $assembled = $themeAssembler->assemble($projectData, $allTokens, $pageHtml);

            // Step 6: Validate assembled theme
            $validator = app(PlaygroundValidator::class);
            $validation = $validator->validate($assembled['themeDir']);

            if (! $validation['valid']) {
                throw new \RuntimeException('Theme failed Playground validation: ' . ($validation['errors'][0] ?? 'Unknown error'));
            }

            if (! file_exists($assembled['zipPath'])) {
                throw new \RuntimeException('Theme ZIP not found.');
            }

            // Step 7: Upload and finalize
            $themeStoragePath = "themes/{$this->projectId}/{$this->jobId}.zip";
            $this->uploadFile($assembled['zipPath'], $themeStoragePath, $metrics);

            $job->markCompleted([
                'download_path' => $themeStoragePath,
            ]);

            GeneratedTheme::create([
                'job_id' => $this->jobId,
                'file_path' => $themeStoragePath,
                'status' => GeneratedTheme::STATUS_ACTIVE,
                'expires_at' => now()->addHours(24),
            ]);

            $downloadUrl = $this->createSignedUrl($themeStoragePath, $metrics);
            $this->sendWelcomeEmail($projectData, $downloadUrl);

            $totalDuration = (int) ((microtime(true) - $startTime) * 1000);
            $metrics->emit('job.completed', [
                'job_id' => $this->jobId,
                'duration_ms' => $totalDuration,
            ]);
        } catch (BlockGrammarException $e) {
            Log::error('GenerateThemeJob: Block grammar validation failed', [
                'job_id' => $this->jobId,
                'errors' => $e->getValidationErrors(),
                'attempt' => $this->attempts(),
            ]);
            $this->fail($e);
        } catch (Throwable $e) {
            Log::error('GenerateThemeJob: Unexpected error', [
                'job_id' => $this->jobId,
                'error_class' => get_class($e),
                'error_message' => $e->getMessage(),
                'attempt' => $this->attempts(),
            ]);
            throw $e;
        } finally {
            $this->cleanupTempDir($tempDir);
        }
    }

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

    /**
     * Normalize business category to vertical key
     */
    private function normalizeCategory(string $category): string
    {
        $map = [
            'restaurant' => 'restaurant',
            'food' => 'restaurant',
            'cafe' => 'restaurant',
            'ecommerce' => 'ecommerce',
            'shop' => 'ecommerce',
            'store' => 'ecommerce',
            'retail' => 'ecommerce',
            'saas' => 'saas',
            'software' => 'saas',
            'tech' => 'saas',
            'technology' => 'saas',
            'portfolio' => 'portfolio',
            'agency' => 'portfolio',
            'creative' => 'portfolio',
            'photography' => 'portfolio',
            'local_service' => 'local_service',
            'service' => 'local_service',
            'plumber' => 'local_service',
            'contractor' => 'local_service',
        ];

        return $map[strtolower($category)] ?? 'local_service';
    }

    /**
     * Extract image token names from skeleton selections
     *
     * @param  array<string, array<int, array<string, mixed>>>  $skeletonSelections
     * @return array<int, string>
     */
    private function extractImageTokens(array $skeletonSelections): array
    {
        $imageTokens = [];

        foreach ($skeletonSelections as $pageType => $skeletons) {
            foreach ($skeletons as $skeleton) {
                $requiredTokens = $skeleton['required_tokens'] ?? [];
                foreach ($requiredTokens as $token) {
                    // Collect image-related tokens (IMAGE_* convention)
                    if (strpos($token, 'IMAGE_') === 0 && ! in_array($token, $imageTokens, true)) {
                        $imageTokens[] = $token;
                    }
                }
            }
        }

        return $imageTokens;
    }

    private function sendWelcomeEmail(array $projectData, string $downloadPath): void
    {
        $webhook = config('presspilot.n8n_webhook_url');
        if (! $webhook) {
            return;
        }

        Http::post($webhook, [
            'user_email' => $projectData['email'] ?? null,
            'business_name' => $projectData['name'] ?? 'PressPilot',
            'download_url' => $downloadPath,
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

    private function createSignedUrl(string $storagePath, MetricsLogger $metrics): string
    {
        $disk = Storage::disk('supabase');

        if (method_exists($disk, 'temporaryUrl')) {
            $signedUrl = $disk->temporaryUrl($storagePath, now()->addHours(24));
        } else {
            $signedUrl = $storagePath;
        }

        $metrics->emit('storage.signed_url_generated', [
            'job_id' => $this->jobId,
            'path' => $storagePath,
        ]);

        return $signedUrl;
    }

    private function cleanupTempDir(string $dir): void
    {
        if (is_dir($dir)) {
            app(ThemeAssembler::class)->deleteDirectory($dir);
        }
    }
}
