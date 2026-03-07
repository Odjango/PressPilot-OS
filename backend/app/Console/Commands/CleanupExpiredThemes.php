<?php

namespace App\Console\Commands;

use App\Models\GeneratedTheme;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class CleanupExpiredThemes extends Command
{
    protected $signature = 'themes:cleanup';
    protected $description = 'Delete expired theme ZIPs from Supabase storage';

    public function handle(): int
    {
        $expired = GeneratedTheme::where('status', GeneratedTheme::STATUS_ACTIVE)
            ->where('expires_at', '<', now())
            ->get();

        $deleted = 0;
        foreach ($expired as $theme) {
            try {
                Storage::disk('supabase')->delete($theme->file_path);
                $theme->update(['status' => GeneratedTheme::STATUS_ARCHIVED]);
                $deleted++;
            } catch (\Throwable $e) {
                Log::warning('CleanupExpiredThemes: Failed to delete', [
                    'theme_id' => $theme->id,
                    'path' => $theme->file_path,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $this->info("Cleaned up {$deleted} expired themes.");
        Log::info("CleanupExpiredThemes: Deleted {$deleted} expired ZIPs");

        return self::SUCCESS;
    }
}
