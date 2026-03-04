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

            $aiPlanner = app(AIPlanner::class);
            $content = $aiPlanner->generate($projectData);

            $patternSelector = app(PatternSelector::class);
            $imageHandler = new ImageHandler(new UnsplashProvider, new PlaceholderProvider);
            $themeAssembler = app(ThemeAssembler::class);
            $validator = app(PlaygroundValidator::class);

            $assembled = $this->attemptAssembly(
                $patternSelector,
                $projectData,
                $content,
                $imageHandler,
                $themeAssembler,
                $validator,
                $tempDir,
                0
            );

            if (! $assembled['validation']['valid']) {
                $assembled = $this->attemptAssembly(
                    $patternSelector,
                    $projectData,
                    $content,
                    $imageHandler,
                    $themeAssembler,
                    $validator,
                    $tempDir,
                    1
                );

                if (! $assembled['validation']['valid']) {
                    throw new \RuntimeException('Theme failed Playground validation.');
                }
            }

            if (! file_exists($assembled['zipPath'])) {
                throw new \RuntimeException('Theme ZIP not found.');
            }

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
        } catch (Throwable $e) {
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
     * @param  array<string, mixed>  $projectData
     * @return array<string, array<int, string>>
     */
    private function buildPatternSelection(PatternSelector $selector, array $projectData, int $offset): array
    {
        $vertical = $projectData['businessCategory'] ?? $projectData['category'] ?? 'general';
        $style = $projectData['brandStyle'] ?? $projectData['style'] ?? 'modern';

        return [
            'home' => $this->patternsForPage($selector, 'home', $vertical, $style, $offset),
            'about' => $this->patternsForPage($selector, 'about', $vertical, $style, $offset),
            'services' => $this->patternsForPage($selector, 'services', $vertical, $style, $offset),
            'contact' => $this->patternsForPage($selector, 'contact', $vertical, $style, $offset),
            'blog' => $this->patternsForPage($selector, 'blog', $vertical, $style, $offset),
            'header' => $this->patternsForPage($selector, 'header', $vertical, $style, $offset),
            'footer' => $this->patternsForPage($selector, 'footer', $vertical, $style, $offset),
        ];
    }

    /**
     * @return array<int, string>
     */
    private function patternsForPage(
        PatternSelector $selector,
        string $pageType,
        string $vertical,
        string $style,
        int $offset
    ): array {
        return $selector->selectForPageWithOffset($pageType, $vertical, $style, $offset);
    }

    /**
     * @param  array<string, array<int, string>>  $patterns
     * @param  array<string, string>  $content
     * @return array{0: array<string, array<int, array<string, mixed>>>, 1: array<string, string>}
     */
    private function injectPatterns(array $patterns, array $content): array
    {
        $registry = $this->loadRegistry();
        $injector = app(TokenInjector::class);
        $injected = [];
        $imageTokens = [];

        foreach ($patterns as $page => $patternIds) {
            $injected[$page] = [];
            foreach ($patternIds as $patternId) {
                if (! isset($registry[$patternId])) {
                    continue;
                }

                $patternMeta = $registry[$patternId];
                $requiredTokens = $patternMeta['required_tokens'] ?? [];

                foreach ($patternMeta['image_slots'] ?? [] as $imageToken) {
                    if (isset($content[$imageToken])) {
                        $imageTokens[$imageToken] = $content[$imageToken];
                    }
                }

                $patternPath = base_path('../pattern-library/'.$patternMeta['file']);
                $patternContent = $injector->inject($patternPath, $content, $requiredTokens);

                $injected[$page][] = [
                    'pattern_id' => $patternId,
                    'slug' => $patternMeta['slug'] ?? $patternId,
                    'category' => $patternMeta['category'] ?? 'sections',
                    'content' => $patternContent,
                ];
            }
        }

        return [$injected, $imageTokens];
    }

    /**
     * @return array<string, array<string, mixed>>
     */
    private function loadRegistry(): array
    {
        $path = base_path('../pattern-library/registry.json');
        $payload = json_decode(file_get_contents($path), true, 512, JSON_THROW_ON_ERROR);
        $indexed = [];

        foreach ($payload['patterns'] ?? [] as $pattern) {
            $patternId = $pattern['pattern_id'] ?? null;
            if ($patternId) {
                $indexed[$patternId] = $pattern;
            }
        }

        return $indexed;
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

    /**
     * @param  array<string, mixed>  $projectData
     * @param  array<string, string>  $content
     * @return array{zipPath: string, themeDir: string, validation: array<string, mixed>}
     */
    private function attemptAssembly(
        PatternSelector $patternSelector,
        array $projectData,
        array $content,
        ImageHandler $imageHandler,
        ThemeAssembler $themeAssembler,
        PlaygroundValidator $validator,
        string $tempDir,
        int $offset
    ): array {
        $patterns = $this->buildPatternSelection($patternSelector, $projectData, $offset);
        [$injectedPatterns, $imageTokens] = $this->injectPatterns($patterns, $content);
        $images = $imageHandler->generateImages($projectData, $tempDir.'/assets/images', $imageTokens);
        $assembled = $themeAssembler->assemble($projectData, $injectedPatterns, $images);
        $validation = $validator->validate($assembled['themeDir']);

        return [
            'zipPath' => $assembled['zipPath'],
            'themeDir' => $assembled['themeDir'],
            'validation' => $validation,
        ];
    }
}
