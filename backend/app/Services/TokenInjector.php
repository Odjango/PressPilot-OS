<?php

namespace App\Services;

use App\Exceptions\BlockGrammarException;
use App\Exceptions\MissingTokenException;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class TokenInjector
{
    /**
     * The active proven-core slug (defaults to 'ollie').
     * Set via setCore() before processSkeletons() to enable cross-core color rewriting.
     */
    private string $coreSlug = 'ollie';

    /**
     * Set the target proven-core for color slug rewriting.
     * Must be called before processSkeletons() when using a non-Ollie core.
     */
    public function setCore(string $coreSlug): self
    {
        $this->coreSlug = $coreSlug;

        return $this;
    }

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
        // Capture the optional self-closing marker (/) to preserve it in reconstruction
        $result = preg_replace_callback(
            '/<!-- wp:(\S+)\s+(\{[^<]*?\})\s*(\/?)-->/',
            function ($matches) use ($tokens) {
                $blockName = $matches[1];
                $jsonStr = $matches[2];
                $selfClosing = $matches[3]; // '/' or ''

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

                // Reconstruct block comment, preserving self-closing marker
                $closing = $selfClosing ? ' /-->' : ' -->';
                return "<!-- wp:{$blockName} {$jsonStr}{$closing}";
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

            // IMAGE_* tokens in HTML content: must HTML-escape for img src attributes (&→&amp;)
            if (str_starts_with($tokenName, 'IMAGE_')) {
                $url = trim((string) $value);
                if ($url === '' || !filter_var($url, FILTER_VALIDATE_URL)) {
                    return 'https://placehold.co/1200x600';
                }
                return htmlspecialchars($url, ENT_QUOTES, 'UTF-8');
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
        // Use negative lookahead (?:(?!-->).)* to match any content up to -->
        // This correctly handles hyphens in JSON values (URLs, CSS custom properties, slugs)
        preg_match_all('/<!-- wp:(\S+)(?:\s+(?:(?!-->).)*?)?\s*-->/', $html, $openings);
        preg_match_all('/<!-- \/wp:(\S+)\s*-->/', $html, $closings);

        $openCounts = array_count_values($openings[1] ?? []);
        $closeCounts = array_count_values($closings[1] ?? []);

        // Self-closing blocks don't need closers
        preg_match_all('/<!-- wp:(\S+)(?:\s+(?:(?!-->).)*?)?\s*\/-->/', $html, $selfClosing);
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
        $normalizedKeys = array_map('strtoupper', array_keys($tokens));

        foreach ($skeletonSelections as $pageType => $skeletons) {
            $pageHtml = '';
            foreach ($skeletons as $skeleton) {
                // Validate required tokens before injection.
                // IMAGE_* tokens get placeholder fallback (non-fatal) since image
                // fetching can fail for various reasons. Text tokens are fatal.
                $requiredTokens = $skeleton['required_tokens'] ?? [];
                foreach ($requiredTokens as $requiredToken) {
                    if (!in_array(strtoupper($requiredToken), $normalizedKeys, true)) {
                        if (str_starts_with(strtoupper($requiredToken), 'IMAGE_')) {
                            // Inject placeholder URL so the skeleton renders — non-fatal
                            $tokens[$requiredToken] = 'https://placehold.co/800x600/e2e8f0/64748b?text=' . urlencode(str_replace('_', ' ', $requiredToken));
                            $normalizedKeys[] = strtoupper($requiredToken);
                            logger()->warning("ImageHandler did not provide {$requiredToken} — using placeholder", [
                                'page' => $pageType,
                                'skeleton' => $skeleton['id'],
                            ]);
                        } else {
                            $allErrors[] = "[{$pageType}/{$skeleton['id']}] Missing required token: {$requiredToken}";
                        }
                    }
                }

                $html = $this->loadSkeleton($skeleton['file']);
                $injected = $this->injectTokens($html, $tokens);

                // Rewrite color slugs from canonical (Ollie) to the target core
                if ($this->coreSlug !== 'ollie') {
                    $resolver = app(CorePaletteResolver::class);
                    $injected = $resolver->rewriteHtml($injected, $this->coreSlug);
                }

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

        // Enforce text color rules on all assembled HTML
        foreach ($results as $pageType => $html) {
            $results[$pageType] = $this->enforceTextColorRules($html);
        }

        return $results;
    }

    /**
     * Enforce text color rules on assembled HTML.
     * Prevents brand colors from being applied to body text paragraphs.
     *
     * Rules:
     * - wp:paragraph blocks with textColor other than base/foreground → remove textColor
     * - <p> tags with has-*-color classes (except base/foreground) → remove class
     * - Exception: Price paragraphs (contains $ or price-like pattern) MAY keep brand color
     * - Exception: Small eyebrow/label paragraphs (fontSize small, first in group) MAY keep brand color
     *
     * @param  string  $html  Assembled HTML with all tokens injected
     * @return string  HTML with text color rules enforced
     */
    public function enforceTextColorRules(string $html): string
    {
        // Process each wp:paragraph block
        // Match both {attributes} and {} (empty attributes)
        $html = preg_replace_callback(
            '/<!-- wp:paragraph\s+(\{[^}]*\})\s*-->(.*?)<!-- \/wp:paragraph -->/s',
            function ($matches) {
                $jsonStr = $matches[1];
                $content = $matches[2];

                // Decode block attributes
                $attrs = json_decode($jsonStr, true);
                if ($attrs === null) {
                    // Malformed JSON, skip this block
                    return $matches[0];
                }

                // Check if this is a price paragraph (exception)
                if ($this->isPriceParagraph($content)) {
                    return $matches[0]; // Keep original
                }

                // Check if this is a small eyebrow/label paragraph (exception)
                if ($this->isEyebrowParagraph($attrs)) {
                    return $matches[0]; // Keep original
                }

                // Check if textColor is set to something other than base/foreground
                if (isset($attrs['textColor'])) {
                    $color = $attrs['textColor'];
                    if (!in_array($color, ['base', 'foreground'], true)) {
                        // Remove textColor attribute
                        unset($attrs['textColor']);
                        Log::info('TokenInjector: Removed brand textColor from paragraph', [
                            'removed_color' => $color,
                        ]);
                    }
                }

                // Remove brand color classes from <p> tag
                $content = $this->removeBrandColorClasses($content);

                // Reconstruct block
                $newJsonStr = empty($attrs) ? '{}' : json_encode($attrs, JSON_UNESCAPED_SLASHES);
                return "<!-- wp:paragraph {$newJsonStr} -->{$content}<!-- /wp:paragraph -->";
            },
            $html
        );

        return $html;
    }

    /**
     * Check if paragraph content represents a price.
     */
    private function isPriceParagraph(string $content): bool
    {
        // Strip HTML tags to get text content
        $text = strip_tags($content);
        $text = trim($text);

        // Check for price patterns: starts with $, ends with currency symbol, contains price-like numbers
        if (preg_match('/^\$[\d,]+(?:\.\d{2})?/', $text)) {
            return true;
        }
        if (preg_match('/[\d,]+(?:\.\d{2})?\s*(?:\$|USD|EUR|GBP)$/i', $text)) {
            return true;
        }

        return false;
    }

    /**
     * Check if paragraph is a small eyebrow/label.
     * Must be small/x-small font AND have uppercase styling (textTransform or letterSpacing).
     * This prevents menu descriptions, testimonial subtitles, etc. from being exempted.
     */
    private function isEyebrowParagraph(array $attrs): bool
    {
        $fontSize = $attrs['fontSize'] ?? null;
        if (!in_array($fontSize, ['small', 'x-small'], true)) {
            return false;
        }

        // True eyebrows have uppercase or letter-spacing styling
        $style = $attrs['style'] ?? [];
        $typography = $style['typography'] ?? [];
        $hasUppercase = ($typography['textTransform'] ?? '') === 'uppercase';
        $hasLetterSpacing = !empty($typography['letterSpacing']);

        return $hasUppercase || $hasLetterSpacing;
    }

    /**
     * Remove brand color classes from <p> tag (keep only base/foreground).
     * Keeps utility classes like has-text-color, has-text-align-center, etc.
     */
    private function removeBrandColorClasses(string $content): string
    {
        // Match <p> tags with class attribute
        $content = preg_replace_callback(
            '/<p\s+class="([^"]+)"/',
            function ($matches) {
                $classes = explode(' ', $matches[1]);
                $filtered = [];

                foreach ($classes as $class) {
                    $class = trim($class);
                    if (empty($class)) {
                        continue;
                    }

                    // Skip the utility class 'has-text-color' — it's not a color slug class
                    if ($class === 'has-text-color') {
                        $filtered[] = $class;
                        continue;
                    }

                    // Pattern: has-{colorSlug}-color (slug can contain hyphens, e.g. primary-accent)
                    // We want to REMOVE brand colors (primary, secondary, accent, primary-accent, etc.)
                    // We want to KEEP base/foreground colors AND utility classes
                    if (preg_match('/^has-([a-z0-9]+(?:-[a-z0-9]+)*)-color$/', $class, $colorMatch)) {
                        $colorSlug = $colorMatch[1];
                        // Only keep base and foreground color classes, remove all others
                        if (in_array($colorSlug, ['base', 'foreground'], true)) {
                            $filtered[] = $class; // Keep base/foreground colors
                        }
                        // Else: skip brand color classes (primary, secondary, accent, primary-accent, etc.)
                    } else {
                        // Keep all non-color classes (has-small-font-size, has-text-align-center, etc.)
                        $filtered[] = $class;
                    }
                }

                if (empty($filtered)) {
                    return '<p'; // No classes remain
                }

                return '<p class="' . implode(' ', $filtered) . '"';
            },
            $content
        );

        return $content;
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
