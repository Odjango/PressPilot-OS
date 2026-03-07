<?php

namespace App\Jobs;

use App\Models\GeneratedTheme;
use App\Models\GenerationJob;
use App\Services\DalleProvider;
use App\Services\ImageHandler;
use App\Services\PlaceholderProvider;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Throwable;
use ZipArchive;

class UpgradeThemeImagesJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 1;
    public int $timeout = 300; // 5 minutes

    private string $jobId;

    public function __construct(
        string $jobId,
    ) {
        $this->jobId = $jobId;
        $this->onQueue('generate');
    }

    public function handle(): void
    {
        $job = GenerationJob::findOrFail($this->jobId);
        $theme = GeneratedTheme::where('job_id', $this->jobId)->firstOrFail();

        $imageTokens = data_get($job->result, 'image_tokens', []);
        $projectData = data_get($job->result, 'project_data', []);

        if (empty($imageTokens)) {
            Log::warning('UpgradeThemeImagesJob: No image tokens to upgrade', ['job_id' => $this->jobId]);
            return;
        }

        // Filter out IMAGE_HERO — already upgraded at preview time
        $tokensToUpgrade = array_values(array_filter(
            $imageTokens,
            fn (string $token) => $token !== 'IMAGE_HERO'
        ));

        if (empty($tokensToUpgrade)) {
            Log::info('UpgradeThemeImagesJob: Only IMAGE_HERO present, nothing to upgrade', [
                'job_id' => $this->jobId,
            ]);
            return;
        }

        $tempDir = sys_get_temp_dir() . '/upgrade-' . $this->jobId;
        $zipPath = $tempDir . '/theme.zip';

        try {
            mkdir($tempDir, 0755, true);

            // Download ZIP from Supabase
            $contents = Storage::disk('supabase')->get($theme->file_path);
            file_put_contents($zipPath, $contents);

            // Generate DALL-E images
            $imageHandler = new ImageHandler(new DalleProvider(), new PlaceholderProvider());
            $context = [
                'category' => $projectData['category'] ?? 'business',
                'businessName' => $projectData['businessName'] ?? '',
            ];
            $imagesDir = $tempDir . '/dalle-images';
            mkdir($imagesDir, 0755, true);
            $newImages = $imageHandler->generateImages($context, $imagesDir, $tokensToUpgrade);

            // Open ZIP and replace images
            $zip = new ZipArchive();
            if ($zip->open($zipPath) !== true) {
                throw new \RuntimeException('Failed to open theme ZIP');
            }

            // Find theme slug (first directory in ZIP)
            $themeSlug = '';
            for ($i = 0; $i < $zip->numFiles; $i++) {
                $name = $zip->getNameIndex($i);
                if (str_contains($name, '/')) {
                    $themeSlug = explode('/', $name)[0];
                    break;
                }
            }

            foreach ($newImages as $token => $localPath) {
                if (! file_exists($localPath)) {
                    Log::warning("UpgradeThemeImagesJob: DALL-E image missing for {$token}, skipping", [
                        'job_id' => $this->jobId,
                    ]);
                    continue;
                }
                $zipEntryName = $themeSlug . '/assets/images/' . strtolower($token) . '.jpg';
                $zip->addFile($localPath, $zipEntryName);
            }

            $zip->close();

            // Re-upload to Supabase (same path, overwrite)
            Storage::disk('supabase')->put($theme->file_path, file_get_contents($zipPath));

            Log::info('UpgradeThemeImagesJob: Images upgraded successfully', [
                'job_id' => $this->jobId,
                'tokens_upgraded' => count($newImages),
            ]);

            // Update job result with upgrade status
            $result = $job->result ?? [];
            $result['images_upgraded'] = true;
            $result['images_upgraded_at'] = now()->toIso8601String();
            $job->update(['result' => $result]);

        } finally {
            // Cleanup temp files
            if (is_dir($tempDir)) {
                $this->deleteDirectory($tempDir);
            }
        }
    }

    private function deleteDirectory(string $dir): void
    {
        if (! is_dir($dir)) {
            return;
        }

        $files = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($dir, \FilesystemIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::CHILD_FIRST
        );

        foreach ($files as $file) {
            if ($file->isDir()) {
                rmdir($file->getRealPath());
            } else {
                unlink($file->getRealPath());
            }
        }

        rmdir($dir);
    }

    public function failed(?Throwable $exception): void
    {
        Log::error('UpgradeThemeImagesJob failed', [
            'job_id' => $this->jobId,
            'error' => $exception?->getMessage(),
        ]);

        // Mark job result so frontend knows upgrade failed but theme is still downloadable
        $job = GenerationJob::find($this->jobId);
        if ($job) {
            $result = $job->result ?? [];
            $result['images_upgraded'] = false;
            $result['images_upgrade_error'] = mb_substr($exception?->getMessage() ?? 'Unknown error', 0, 500);
            $job->update(['result' => $result]);
        }
    }
}
