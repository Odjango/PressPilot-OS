<?php

namespace App\Services;

use App\Exceptions\MissingTokenException;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class TokenInjector
{
    /**
     * Load a skeleton HTML file directly (no PHP stripping needed).
     */
    public function loadSkeleton(string $skeletonFile): string
    {
        $basePath = base_path('../pattern-library/');
        $path = $basePath . $skeletonFile;

        if (!file_exists($path)) {
            throw new RuntimeException("Skeleton file not found: {$path}");
        }

        return file_get_contents($path);
    }

    /**
     * Inject tokens into skeleton HTML, replacing all {{TOKEN_NAME}} placeholders.
     *
     * @param  string  $html  Raw skeleton HTML with {{TOKEN}} placeholders
     * @param  array<string, string>  $tokens  Token name => value map
     * @return string  HTML with tokens replaced
     */
    public function injectTokens(string $html, array $tokens): string
    {
        $result = preg_replace_callback('/\{\{(\w+)\}\}/', function ($matches) use ($tokens) {
            $tokenName = $matches[1];
            $value = $tokens[$tokenName] ?? '';

            if (empty($value)) {
                Log::warning("TokenInjector: Token {$tokenName} has no value");
            }

            // IMAGE_* tokens go into block comment JSON and img src — must be JSON-safe
            if (str_starts_with($tokenName, 'IMAGE_')) {
                $url = trim((string) $value);
                if ($url === '' || !filter_var($url, FILTER_VALIDATE_URL)) {
                    return 'https://placehold.co/1200x600';
                }
                // Escape characters that could break JSON in block comments
                return str_replace(['\\', '"'], ['\\\\', '\\"'], $url);
            }

            // Text tokens: escape HTML entities
            return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
        }, $html);

        return $result;
    }

    /**
     * Validate block grammar after token injection.
     *
     * @return array<int, string>  List of validation errors (empty = valid)
     */
    public function validateBlockGrammar(string $html): array
    {
        $errors = [];

        // Check 1: Block comment JSON is valid
        preg_match_all('/<!-- wp:\S+\s+(\{[^}]*\})\s*(?:\/)?-->/', $html, $jsonMatches);
        foreach ($jsonMatches[1] as $jsonStr) {
            $decoded = json_decode($jsonStr);
            if ($decoded === null && json_last_error() !== JSON_ERROR_NONE) {
                $errors[] = "Invalid JSON in block comment: " . mb_substr($jsonStr, 0, 100);
            }
        }

        // Check 2: No remaining {{TOKEN}} placeholders
        preg_match_all('/\{\{(\w+)\}\}/', $html, $remaining);
        if (!empty($remaining[1])) {
            $errors[] = "Unresolved tokens: " . implode(', ', $remaining[1]);
        }

        // Check 3: Basic opening/closing balance (non-self-closing blocks)
        preg_match_all('/<!-- wp:(\S+)(?:\s+\{[^}]*\})?\s*-->/', $html, $openings);
        preg_match_all('/<!-- \/wp:(\S+)\s*-->/', $html, $closings);

        $openCounts = array_count_values($openings[1] ?? []);
        $closeCounts = array_count_values($closings[1] ?? []);

        // Self-closing blocks don't need closers
        preg_match_all('/<!-- wp:(\S+)(?:\s+\{[^}]*\})?\s*\/-->/', $html, $selfClosing);
        $selfCloseCounts = array_count_values($selfClosing[1] ?? []);

        foreach ($openCounts as $block => $count) {
            $closeCount = $closeCounts[$block] ?? 0;
            $selfCloseCount = $selfCloseCounts[$block] ?? 0;
            $expectedClose = $count - $selfCloseCount;
            if ($closeCount < $expectedClose) {
                $errors[] = "Block '{$block}' has {$count} openings but only {$closeCount} closings (expected {$expectedClose})";
            }
        }

        if (!empty($errors)) {
            Log::warning('TokenInjector: Block grammar issues', ['errors' => $errors]);
        }

        return $errors;
    }

    /**
     * Process all skeletons for all pages: load, inject tokens, validate.
     *
     * @param  array<string, array<int, array{id: string, file: string, required_tokens: array}>>  $skeletonSelections
     * @param  array<string, string>  $tokens
     * @return array<string, string>  Keyed by page type, each containing the full injected HTML
     */
    public function processSkeletons(array $skeletonSelections, array $tokens): array
    {
        $results = [];

        foreach ($skeletonSelections as $pageType => $skeletons) {
            $pageHtml = '';
            foreach ($skeletons as $skeleton) {
                $html = $this->loadSkeleton($skeleton['file']);
                $injected = $this->injectTokens($html, $tokens);
                $errors = $this->validateBlockGrammar($injected);

                if (!empty($errors)) {
                    Log::warning("TokenInjector: Validation issues in {$skeleton['id']}", [
                        'errors' => $errors,
                        'page' => $pageType,
                    ]);
                }

                $pageHtml .= $injected . "\n\n";
            }
            $results[$pageType] = trim($pageHtml);
        }

        return $results;
    }

    /**
     * Legacy method: inject tokens into a single pattern file (for backward compatibility).
     *
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
