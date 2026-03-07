<?php

namespace App\Services;

use App\Exceptions\BlockGrammarException;
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
        $basePath = base_path('../');
        $path = $basePath . $skeletonFile;

        if (!file_exists($path)) {
            throw new RuntimeException("Skeleton file not found: {$path}");
        }

        return file_get_contents($path);
    }

    /**
     * Inject tokens into skeleton HTML, replacing all {{TOKEN_NAME}} placeholders.
     * Uses two-phase approach: block comment JSON first (no HTML escaping), then HTML content.
     *
     * @param  string  $html  Raw skeleton HTML with {{TOKEN}} placeholders
     * @param  array<string, string>  $tokens  Token name => value map
     * @return string  HTML with tokens replaced
     */
    public function injectTokens(string $html, array $tokens): string
    {
        // Phase 1: Replace tokens inside block comment JSON
        $result = preg_replace_callback(
            '/<!-- wp:(\S+)\s+(\{[^<]*?\})\s*(?:\/)?-->/',
            function ($matches) use ($tokens) {
                $blockName = $matches[1];
                $jsonStr = $matches[2];

                // Replace tokens inside this JSON, preserving JSON validity
                $jsonStr = preg_replace_callback('/\{\{(\w+)\}\}/', function ($tokenMatches) use ($tokens) {
                    $tokenName = $tokenMatches[1];
                    $value = $tokens[$tokenName] ?? '';

                    if (empty($value)) {
                        Log::warning("TokenInjector: Token {$tokenName} has no value");
                    }

                    // Inside JSON: IMAGE_* tokens must be JSON-safe (no HTML escaping)
                    if (str_starts_with($tokenName, 'IMAGE_')) {
                        $url = trim((string) $value);
                        if ($url === '' || !filter_var($url, FILTER_VALIDATE_URL)) {
                            $url = 'https://placehold.co/1200x600';
                        }
                        // Escape only JSON-breaking characters: backslash and double quote
                        return addcslashes($url, '\\\"');
                    }

                    // Text tokens in JSON: no HTML escaping, just JSON escape
                    return addcslashes((string) $value, '\\\"');
                }, $jsonStr);

                // Reconstruct block comment
                return "<!-- wp:{$blockName} {$jsonStr} -->";
            },
            $html
        );

        // Phase 2: Replace remaining tokens in HTML content (outside block comments)
        $result = preg_replace_callback('/\{\{(\w+)\}\}/', function ($matches) use ($tokens) {
            $tokenName = $matches[1];
            $value = $tokens[$tokenName] ?? '';

            if (empty($value)) {
                Log::warning("TokenInjector: Token {$tokenName} has no value");
            }

            // IMAGE_* tokens in HTML content: raw URLs (no escaping needed for img src)
            if (str_starts_with($tokenName, 'IMAGE_')) {
                $url = trim((string) $value);
                if ($url === '' || !filter_var($url, FILTER_VALIDATE_URL)) {
                    return 'https://placehold.co/1200x600';
                }
                return $url;
            }

            // Text tokens: HTML escape for content
            return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
        }, $result);

        return $result;
    }

    /**
     * Extract JSON from a block comment by counting braces, handling string boundaries.
     * Walks from opening { to matching }, tracking depth and escaped quotes.
     *
     * @return string|null  The complete JSON string, or null if unbalanced
     */
    private function extractJsonFromOffset(string $html, int $offset): ?string
    {
        if ($offset >= strlen($html) || $html[$offset] !== '{') {
            return null;
        }

        $depth = 0;
        $inString = false;
        $escaped = false;
        $start = $offset;

        for ($i = $offset; $i < strlen($html); $i++) {
            $char = $html[$i];

            if ($escaped) {
                $escaped = false;
                continue;
            }

            if ($char === '\\') {
                $escaped = true;
                continue;
            }

            if ($char === '"') {
                $inString = !$inString;
                continue;
            }

            if ($inString) {
                continue;
            }

            if ($char === '{') {
                $depth++;
            } elseif ($char === '}') {
                $depth--;
                if ($depth === 0) {
                    return substr($html, $start, $i - $start + 1);
                }
            }
        }

        return null;
    }

    /**
     * Validate block grammar after token injection.
     * Uses brace-counting extraction to handle nested JSON.
     *
     * @return array<int, string>  List of validation errors (empty = valid)
     */
    public function validateBlockGrammar(string $html): array
    {
        $errors = [];

        // Check 1: Block comment JSON is valid (handles nested braces)
        preg_match_all('/<!-- wp:\S+\s+/', $html, $blockStarts, PREG_OFFSET_CAPTURE);

        foreach ($blockStarts[0] as $match) {
            $commentStart = $match[1];
            $jsonStart = $commentStart + strlen($match[0]);

            // Find the opening brace
            if ($jsonStart < strlen($html) && $html[$jsonStart] === '{') {
                $jsonStr = $this->extractJsonFromOffset($html, $jsonStart);

                if ($jsonStr === null) {
                    $errors[] = "Unbalanced JSON braces in block comment at position {$jsonStart}";
                } else {
                    $decoded = json_decode($jsonStr);
                    if ($decoded === null && json_last_error() !== JSON_ERROR_NONE) {
                        $preview = mb_substr($jsonStr, 0, 100);
                        $errors[] = "Invalid JSON in block comment: {$preview}";
                    }
                }
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
     * Throws BlockGrammarException if any skeleton fails validation.
     *
     * @param  array<string, array<int, array{id: string, file: string, required_tokens: array}>>  $skeletonSelections
     * @param  array<string, string>  $tokens
     * @return array<string, string>  Keyed by page type, each containing the full injected HTML
     *
     * @throws BlockGrammarException
     */
    public function processSkeletons(array $skeletonSelections, array $tokens): array
    {
        $results = [];
        $allErrors = [];

        foreach ($skeletonSelections as $pageType => $skeletons) {
            $pageHtml = '';
            foreach ($skeletons as $skeleton) {
                $html = $this->loadSkeleton($skeleton['file']);
                $injected = $this->injectTokens($html, $tokens);
                $errors = $this->validateBlockGrammar($injected);

                if (!empty($errors)) {
                    foreach ($errors as $error) {
                        $allErrors[] = "[{$pageType}/{$skeleton['id']}] {$error}";
                    }
                }

                $pageHtml .= $injected . "\n\n";
            }
            $results[$pageType] = trim($pageHtml);
        }

        // Halt pipeline if any validation errors occurred
        if (!empty($allErrors)) {
            throw new BlockGrammarException($allErrors, 'processSkeletons');
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

        // Normalize token keys to uppercase for backward compatibility
        $normalizedTokens = [];
        foreach ($tokens as $key => $value) {
            $normalizedTokens[strtoupper($key)] = $value;
        }

        return $this->injectTokens($contents, $normalizedTokens);
    }

    /**
     * @param  array<string, string>  $tokens
     * @param  array<int, string>  $requiredTokens
     */
    private function ensureRequiredTokens(array $tokens, array $requiredTokens): void
    {
        $normalizedKeys = array_map('strtoupper', array_keys($tokens));
        $missing = [];
        foreach ($requiredTokens as $token) {
            if (! in_array(strtoupper($token), $normalizedKeys, true)) {
                $missing[] = $token;
            }
        }

        if (! empty($missing)) {
            throw new MissingTokenException(
                'Missing required tokens: ' . implode(', ', $missing)
            );
        }
    }
}
