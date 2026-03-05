<?php

namespace App\Services;

use App\Exceptions\MissingTokenException;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class TokenInjector
{
    /**
     * @param  array<string, string>  $tokens
     * @param  array<int, string>  $requiredTokens
     */
    public function inject(string $patternPath, array $tokens, array $requiredTokens = []): string
    {
        if (! file_exists($patternPath)) {
            throw new RuntimeException("Pattern file not found at {$patternPath}");
        }

        $contents = file_get_contents($patternPath);
        $this->ensureRequiredTokens($tokens, $requiredTokens);

        $search = [];
        $replace = [];

        foreach ($tokens as $key => $value) {
            $tokenKey = strtoupper($key);
            $search[] = '{{'.$tokenKey.'}}';

            if (str_starts_with($tokenKey, 'IMAGE_')) {
                // Use placeholder URL for empty/invalid image tokens instead of failing.
                $url = trim((string) $value);
                if ($url === '' || ! filter_var($url, FILTER_VALIDATE_URL)) {
                    $replace[] = 'https://placehold.co/1200x600';
                } else {
                    $replace[] = $url;
                }
            } else {
                $replace[] = htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
            }
        }

        $output = str_replace($search, $replace, $contents);

        // Sweep: replace any remaining {{TOKEN}} placeholders with empty string.
        // Pattern files may reference tokens outside the current schema — this
        // prevents hard failures while logging what was missed.
        if (preg_match_all('/\{\{([A-Z0-9_]+)\}\}/', $output, $matches)) {
            Log::warning('TokenInjector: Unresolved tokens replaced with empty', [
                'pattern' => basename($patternPath),
                'tokens' => $matches[1],
            ]);
            $output = preg_replace('/\{\{[A-Z0-9_]+\}\}/', '', $output);
        }

        return $output;
    }

    /**
     * @param  array<string, string>  $tokens
     * @param  array<int, string>  $requiredTokens
     */
    private function ensureRequiredTokens(array $tokens, array $requiredTokens): void
    {
        $missing = [];
        foreach ($requiredTokens as $token) {
            // Only flag truly missing keys — empty string is a valid default from AIPlanner.
            if (! array_key_exists($token, $tokens)) {
                $missing[] = $token;
            }
        }

        if (! empty($missing)) {
            Log::warning('TokenInjector: Required tokens not in payload', [
                'tokens' => $missing,
            ]);
        }
    }
}
