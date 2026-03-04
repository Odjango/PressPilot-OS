<?php

namespace App\Services;

use App\Exceptions\MissingTokenException;
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
                $this->assertValidImageUrl($value, $tokenKey);
                $replace[] = $value;
            } else {
                $replace[] = htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
            }
        }

        $output = str_replace($search, $replace, $contents);

        if (str_contains($output, '{{') || str_contains($output, '}}')) {
            throw new RuntimeException('Unresolved tokens remain after injection');
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
            if (! array_key_exists($token, $tokens) || $tokens[$token] === '') {
                $missing[] = $token;
            }
        }

        if (! empty($missing)) {
            throw new MissingTokenException('Missing required tokens: '.implode(', ', $missing));
        }
    }

    private function assertValidImageUrl(string $value, string $tokenKey): void
    {
        $url = trim($value);
        if ($url === '') {
            throw new RuntimeException("Image token {$tokenKey} is empty");
        }

        if (! filter_var($url, FILTER_VALIDATE_URL)) {
            throw new RuntimeException("Invalid image URL for {$tokenKey}");
        }
    }
}
