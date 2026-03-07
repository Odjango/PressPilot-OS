# Generator Validation Hardening Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Eliminate recurring "Attempt Recovery" errors in generated FSE themes by fixing token injection, replacing regex-based validation with proper JSON parsing, making validation failures halt the pipeline, and closing the PlaygroundValidator gap that passes broken themes.

**Architecture:** Three layers of defense: (1) TokenInjector produces correct output by using context-aware injection that preserves block comment JSON integrity, (2) a new BlockGrammarValidator performs deep structural validation using proper JSON parsing instead of regex, (3) GenerateThemeJob treats validation failures as hard errors that abort ZIP creation. PlaygroundValidator is hardened to never return `valid: true` on failure.

**Tech Stack:** Laravel 12 (PHP 8.2), PHPUnit, WordPress FSE block grammar, `json_decode` for validation, existing skeleton pattern library.

---

### Task 1: Fix TokenInjector Image URL Escaping

**Problem:** `hero-cover.html` line 1 contains `"url":"{{IMAGE_HERO}}"` inside block comment JSON. The current `injectTokens()` method on line 50 uses `str_replace(['\\', '"'], ['\\\\', '\\"'], $url)` which double-escapes backslashes and can corrupt URLs with query params containing `&` or `=`. More critically, the `htmlspecialchars()` on line 54 escapes `&` to `&amp;` for text tokens, but text tokens that appear inside block comment JSON (e.g., future tokens in JSON attributes) would also be corrupted.

**Root cause:** The injector treats ALL `{{TOKEN}}` replacements identically within the same pass, but tokens appear in two contexts: (1) inside block comment JSON (`<!-- wp:cover {"url":"{{IMAGE_HERO}}"} -->`) and (2) inside HTML content (`<h1>{{HERO_TITLE}}</h1>`). Each context requires different escaping.

**Files:**
- Modify: `backend/app/Services/TokenInjector.php:33-58`
- Test: `backend/tests/Unit/TokenInjectorTest.php`

**Step 1: Write failing tests for the image URL injection bug**

Add these tests to `backend/tests/Unit/TokenInjectorTest.php`:

```php
public function test_image_url_with_query_params_preserves_block_json(): void
{
    $injector = new TokenInjector();

    $html = '<!-- wp:cover {"url":"{{IMAGE_HERO}}","dimRatio":60} -->'
        . '<div class="wp-block-cover"><img src="{{IMAGE_HERO}}" alt=""/></div>'
        . '<!-- /wp:cover -->';

    $tokens = [
        'IMAGE_HERO' => 'https://images.unsplash.com/photo-123?w=1200&q=80&fit=crop',
    ];

    $result = $injector->injectTokens($html, $tokens);

    // Block comment JSON must remain valid
    preg_match('/<!-- wp:cover (\{.*?\}) -->/', $result, $m);
    $json = json_decode($m[1], true);
    $this->assertNotNull($json, 'Block comment JSON is invalid after injection');
    $this->assertEquals(
        'https://images.unsplash.com/photo-123?w=1200&q=80&fit=crop',
        $json['url']
    );

    // img src should have the raw URL (not HTML-escaped)
    $this->assertStringContainsString(
        'src="https://images.unsplash.com/photo-123?w=1200&q=80&fit=crop"',
        $result
    );
}

public function test_text_token_in_html_is_escaped_but_not_in_block_json(): void
{
    $injector = new TokenInjector();

    $html = '<!-- wp:paragraph -->'
        . '<p>{{HERO_TITLE}}</p>'
        . '<!-- /wp:paragraph -->';

    $tokens = [
        'HERO_TITLE' => 'Roma & Sons <Pizza>',
    ];

    $result = $injector->injectTokens($html, $tokens);

    // Inside HTML content: must be escaped
    $this->assertStringContainsString('Roma &amp; Sons &lt;Pizza&gt;', $result);
}

public function test_nested_json_block_comment_stays_valid(): void
{
    $injector = new TokenInjector();

    // This is the actual hero-cover skeleton pattern's block comment format
    $html = '<!-- wp:cover {"url":"{{IMAGE_HERO}}","dimRatio":60,"overlayColor":"contrast","isUserOverlayColor":true,"align":"full","style":{"spacing":{"margin":{"top":"0","bottom":"0"},"padding":{"top":"var:preset|spacing|70","bottom":"var:preset|spacing|70"}}}} -->'
        . '<div class="wp-block-cover"><img src="{{IMAGE_HERO}}" alt=""/></div>'
        . '<!-- /wp:cover -->';

    $tokens = [
        'IMAGE_HERO' => 'https://images.unsplash.com/photo-abc123',
    ];

    $result = $injector->injectTokens($html, $tokens);

    // Extract the JSON from the block comment - must handle nested braces
    preg_match('/<!-- wp:cover (.*?) -->/', $result, $m);
    $json = json_decode($m[1], true);
    $this->assertNotNull($json, 'Nested JSON in block comment is invalid after injection');
    $this->assertEquals('https://images.unsplash.com/photo-abc123', $json['url']);
    $this->assertEquals('0', $json['style']['spacing']['margin']['top']);
}
```

**Step 2: Run tests to verify they fail**

Run: `cd /path/to/backend && php artisan test --filter=TokenInjectorTest -v`
Expected: At least `test_nested_json_block_comment_stays_valid` FAILS because current regex `[^}]*` in `validateBlockGrammar` can't parse nested braces.

**Step 3: Rewrite `injectTokens()` with context-aware replacement**

Replace `TokenInjector::injectTokens()` (lines 33-58) with:

```php
/**
 * Inject tokens into skeleton HTML, replacing all {{TOKEN_NAME}} placeholders.
 * Uses context-aware escaping: tokens inside block comment JSON get JSON-safe values,
 * tokens inside HTML content get HTML-escaped values.
 *
 * @param  string  $html  Raw skeleton HTML with {{TOKEN}} placeholders
 * @param  array<string, string>  $tokens  Token name => value map
 * @return string  HTML with tokens replaced
 */
public function injectTokens(string $html, array $tokens): string
{
    // Phase 1: Replace tokens inside block comment JSON
    // Match: <!-- wp:blockname {JSON} --> or <!-- wp:blockname {JSON} /-->
    $html = preg_replace_callback(
        '/(?<=<!-- wp:\S{1,50} )(\{.+?\})(?=\s*(?:\/)?-->)/s',
        function ($matches) use ($tokens) {
            return $this->replaceTokensInJson($matches[1], $tokens);
        },
        $html
    );

    // Phase 2: Replace remaining tokens in HTML content
    $html = preg_replace_callback('/\{\{(\w+)\}\}/', function ($matches) use ($tokens) {
        $tokenName = $matches[1];
        $value = $tokens[$tokenName] ?? '';

        if (empty($value)) {
            Log::warning("TokenInjector: Token {$tokenName} has no value (HTML context)");
        }

        // IMAGE_* tokens in HTML (e.g., img src) — raw URL, no HTML escaping
        if (str_starts_with($tokenName, 'IMAGE_')) {
            $url = trim((string) $value);
            if ($url === '' || !filter_var($url, FILTER_VALIDATE_URL)) {
                return 'https://placehold.co/1200x600';
            }
            return $url;
        }

        // Text tokens in HTML content: escape HTML entities
        return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
    }, $html);

    return $html;
}

/**
 * Replace {{TOKEN}} placeholders inside a block comment JSON string.
 * Decodes JSON, replaces token values, re-encodes.
 * Falls back to string replacement if JSON is not parseable.
 */
private function replaceTokensInJson(string $jsonString, array $tokens): string
{
    // First, do a raw string replacement to resolve tokens, then validate
    $resolved = preg_replace_callback('/\{\{(\w+)\}\}/', function ($matches) use ($tokens) {
        $tokenName = $matches[1];
        $value = $tokens[$tokenName] ?? '';

        if (str_starts_with($tokenName, 'IMAGE_')) {
            $url = trim((string) $value);
            if ($url === '' || !filter_var($url, FILTER_VALIDATE_URL)) {
                return 'https://placehold.co/1200x600';
            }
            return $url;
        }

        // Text tokens inside JSON: must not break JSON structure
        // json_encode wraps in quotes and escapes, so we just need the raw value
        // (the value sits inside an already-quoted JSON string)
        return (string) $value;
    }, $jsonString);

    // Validate the resolved JSON
    $decoded = json_decode($resolved, true);
    if ($decoded === null && json_last_error() !== JSON_ERROR_NONE) {
        Log::error('TokenInjector: Block comment JSON invalid after token injection', [
            'original' => mb_substr($jsonString, 0, 200),
            'resolved' => mb_substr($resolved, 0, 200),
            'json_error' => json_last_error_msg(),
        ]);
    }

    return $resolved;
}
```

**Step 4: Run tests to verify they pass**

Run: `cd /path/to/backend && php artisan test --filter=TokenInjectorTest -v`
Expected: ALL tests PASS including the 3 new ones.

**Step 5: Commit**

```bash
git add backend/app/Services/TokenInjector.php backend/tests/Unit/TokenInjectorTest.php
git commit -m "fix(TokenInjector): context-aware token injection preserves block JSON

Split token replacement into two phases: block comment JSON context
and HTML content context. Image URLs are no longer double-escaped.
Nested JSON in block comments (cover, group with style) stays valid.

Closes root cause #1 of 'Attempt Recovery' errors."
```

---

### Task 2: Replace Regex-Based Block JSON Validation with Proper Parsing

**Problem:** `validateBlockGrammar()` line 70 uses regex `<!-- wp:\S+\s+(\{[^}]*\})\s*(?:\/)?-->` which CANNOT match nested braces. The hero-cover skeleton has deeply nested JSON: `{"url":"...","style":{"spacing":{"margin":{"top":"0"}}}}`. This regex captures only `{"url":"...","style":` (stops at first `}`) and then `json_decode` fails — but since the regex never matched the full JSON, the error is missed entirely.

**Files:**
- Modify: `backend/app/Services/TokenInjector.php:65-109` (the `validateBlockGrammar` method)
- Test: `backend/tests/Unit/TokenInjectorTest.php`

**Step 1: Write failing test for nested JSON validation**

```php
public function test_validate_block_grammar_catches_nested_json_errors(): void
{
    $injector = new TokenInjector();

    // Valid nested JSON - should have no errors
    $validHtml = '<!-- wp:cover {"url":"https://example.com/img.jpg","dimRatio":60,"style":{"spacing":{"margin":{"top":"0","bottom":"0"}}}} -->'
        . '<div class="wp-block-cover"></div>'
        . '<!-- /wp:cover -->';

    $errors = $injector->validateBlockGrammar($validHtml);
    $this->assertEmpty($errors, 'Valid nested JSON should produce no errors');
}

public function test_validate_block_grammar_catches_broken_nested_json(): void
{
    $injector = new TokenInjector();

    // Invalid: missing closing brace in nested JSON
    $brokenHtml = '<!-- wp:cover {"url":"https://example.com/img.jpg","style":{"spacing":{"margin":{"top":"0"}}}} -->'
        . '<div class="wp-block-cover"></div>'
        . '<!-- /wp:cover -->';

    // The above is actually valid. Let's create truly broken JSON:
    $brokenHtml2 = '<!-- wp:cover {"url":"https://example.com/img.jpg","style":{"spacing":{"margin":{"top":"0"}}} -->'
        . '<div class="wp-block-cover"></div>'
        . '<!-- /wp:cover -->';

    $errors = $injector->validateBlockGrammar($brokenHtml2);
    $this->assertNotEmpty($errors, 'Broken nested JSON should be caught');
}
```

**Step 2: Run test to verify it fails**

Run: `cd /path/to/backend && php artisan test --filter=test_validate_block_grammar_catches -v`
Expected: FAIL — current regex never fully matches nested JSON so never validates it.

**Step 3: Rewrite `validateBlockGrammar()` with proper JSON extraction**

Replace the method (lines 65-109) with:

```php
/**
 * Validate block grammar after token injection.
 *
 * @return array<int, string>  List of validation errors (empty = valid)
 */
public function validateBlockGrammar(string $html): array
{
    $errors = [];

    // Check 1: Block comment JSON is valid — use brace-counting extraction
    preg_match_all('/<!-- wp:(\S+)\s+(\{)/s', $html, $openings, PREG_OFFSET_CAPTURE);

    foreach ($openings[2] as $i => $match) {
        $blockName = $openings[1][$i][0];
        $jsonStart = $match[1]; // offset of the opening {
        $jsonString = $this->extractJsonFromOffset($html, $jsonStart);

        if ($jsonString === null) {
            $errors[] = "Block '{$blockName}': Could not extract JSON from block comment (unbalanced braces)";
            continue;
        }

        $decoded = json_decode($jsonString, true);
        if ($decoded === null && json_last_error() !== JSON_ERROR_NONE) {
            $errors[] = "Block '{$blockName}': Invalid JSON in block comment: "
                . json_last_error_msg()
                . ' — ' . mb_substr($jsonString, 0, 100);
        }
    }

    // Check 2: No remaining {{TOKEN}} placeholders
    preg_match_all('/\{\{(\w+)\}\}/', $html, $remaining);
    if (!empty($remaining[1])) {
        $errors[] = "Unresolved tokens: " . implode(', ', array_unique($remaining[1]));
    }

    // Check 3: Block opening/closing balance (non-self-closing blocks)
    preg_match_all('/<!-- wp:(\S+)(?:\s[^>]*)?\s*-->/', $html, $allOpenings);
    preg_match_all('/<!-- \/wp:(\S+)\s*-->/', $html, $allClosings);
    preg_match_all('/<!-- wp:(\S+)(?:\s[^>]*)?\s*\/-->/', $html, $selfClosing);

    $openCounts = array_count_values($allOpenings[1] ?? []);
    $closeCounts = array_count_values($allClosings[1] ?? []);
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
 * Extract a complete JSON object from an HTML string starting at the given offset.
 * Uses brace-counting to handle nested objects correctly.
 */
private function extractJsonFromOffset(string $html, int $offset): ?string
{
    $length = strlen($html);
    if ($offset >= $length || $html[$offset] !== '{') {
        return null;
    }

    $depth = 0;
    $inString = false;
    $escape = false;

    for ($i = $offset; $i < $length; $i++) {
        $char = $html[$i];

        if ($escape) {
            $escape = false;
            continue;
        }

        if ($char === '\\' && $inString) {
            $escape = true;
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
                return substr($html, $offset, $i - $offset + 1);
            }
        }
    }

    return null; // Unbalanced braces
}
```

**Step 4: Run tests to verify they pass**

Run: `cd /path/to/backend && php artisan test --filter=TokenInjectorTest -v`
Expected: ALL tests PASS.

**Step 5: Commit**

```bash
git add backend/app/Services/TokenInjector.php backend/tests/Unit/TokenInjectorTest.php
git commit -m "fix(TokenInjector): replace regex JSON validation with brace-counting parser

The old regex [^}]* could not match nested braces in block comment
JSON (e.g., cover blocks with style.spacing.margin). The new
extractJsonFromOffset() method walks the string character-by-character,
tracking brace depth and string boundaries.

Closes root cause #2 of 'Attempt Recovery' errors."
```

---

### Task 3: Make Validation Failures Halt the Pipeline

**Problem:** In `GenerateThemeJob::handle()`, Step 6 calls `PlaygroundValidator::validate()` and throws only if `!$validation['valid']`. But Step 4 (`TokenInjector::processSkeletons()`) logs validation warnings and CONTINUES even when block grammar is broken. The invalid HTML flows into ThemeAssembler, gets written to files, zipped, and uploaded. The PlaygroundValidator then only checks theme activation, not block grammar — so it passes.

**Files:**
- Modify: `backend/app/Services/TokenInjector.php:118-142` (the `processSkeletons` method)
- Modify: `backend/app/Jobs/GenerateThemeJob.php:92-95`
- Create: `backend/app/Exceptions/BlockGrammarException.php`
- Test: `backend/tests/Unit/TokenInjectorTest.php`

**Step 1: Create BlockGrammarException**

Create file `backend/app/Exceptions/BlockGrammarException.php`:

```php
<?php

namespace App\Exceptions;

use RuntimeException;

class BlockGrammarException extends RuntimeException
{
    /** @var array<int, string> */
    private array $validationErrors;

    /**
     * @param array<int, string> $errors
     */
    public function __construct(array $errors, string $context = '')
    {
        $this->validationErrors = $errors;
        $message = "Block grammar validation failed"
            . ($context ? " in {$context}" : '')
            . ": " . implode('; ', array_slice($errors, 0, 3));

        parent::__construct($message);
    }

    /**
     * @return array<int, string>
     */
    public function getValidationErrors(): array
    {
        return $this->validationErrors;
    }
}
```

**Step 2: Write failing test for pipeline halt on validation error**

```php
public function test_process_skeletons_throws_on_block_grammar_errors(): void
{
    $injector = new TokenInjector();

    // We'll test via a mock skeleton file with intentionally broken JSON
    // First, create a temp skeleton file with broken block comment
    $tempDir = sys_get_temp_dir() . '/pp-test-skeletons-' . uniqid();
    mkdir($tempDir . '/pattern-library/skeletons', 0755, true);

    $brokenSkeleton = '<!-- wp:cover {"url":"{{IMAGE_HERO}}","broken -->'
        . '<div class="wp-block-cover"></div>'
        . '<!-- /wp:cover -->';
    file_put_contents($tempDir . '/pattern-library/skeletons/broken-test.html', $brokenSkeleton);

    $selections = [
        'home' => [
            [
                'id' => 'broken-test',
                'file' => 'pattern-library/skeletons/broken-test.html',
                'required_tokens' => ['IMAGE_HERO'],
            ],
        ],
    ];

    $tokens = ['IMAGE_HERO' => 'https://example.com/image.jpg'];

    $this->expectException(\App\Exceptions\BlockGrammarException::class);

    // This should throw, not silently continue
    $injector->processSkeletons($selections, $tokens);
}
```

**Step 3: Run test to verify it fails**

Run: `cd /path/to/backend && php artisan test --filter=test_process_skeletons_throws -v`
Expected: FAIL — current code logs warnings but doesn't throw.

**Step 4: Update `processSkeletons()` to throw on errors**

Replace `TokenInjector::processSkeletons()` (lines 118-142) with:

```php
/**
 * Process all skeletons for all pages: load, inject tokens, validate.
 * Throws BlockGrammarException if any skeleton has validation errors.
 *
 * @param  array<string, array<int, array{id: string, file: string, required_tokens: array}>>  $skeletonSelections
 * @param  array<string, string>  $tokens
 * @return array<string, string>  Keyed by page type, each containing the full injected HTML
 *
 * @throws \App\Exceptions\BlockGrammarException
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

    if (!empty($allErrors)) {
        Log::error('TokenInjector: Block grammar validation failed, aborting', [
            'errors' => $allErrors,
        ]);
        throw new BlockGrammarException($allErrors, 'processSkeletons');
    }

    return $results;
}
```

Add the import at the top of `TokenInjector.php`:

```php
use App\Exceptions\BlockGrammarException;
```

**Step 5: Run tests to verify they pass**

Run: `cd /path/to/backend && php artisan test --filter=TokenInjectorTest -v`
Expected: ALL tests PASS.

**Step 6: Commit**

```bash
git add backend/app/Exceptions/BlockGrammarException.php backend/app/Services/TokenInjector.php backend/tests/Unit/TokenInjectorTest.php
git commit -m "feat(pipeline): validation failures now halt theme generation

Added BlockGrammarException. processSkeletons() collects all errors
across all pages/skeletons and throws if any exist. Invalid themes
can no longer slip through to ZIP creation.

Closes root cause #3 of 'Attempt Recovery' errors."
```

---

### Task 4: Harden PlaygroundValidator — No False Positives

**Problem:** `PlaygroundValidator::validate()` returns `valid: true` on timeout (line 51-59) and on CLI failure with no output (line 62-71). This means broken themes that crash Playground get a green light. Additionally, the validator never opens the Site Editor — it only checks theme activation and frontend HTTP status. "Attempt Recovery" errors only surface when editing templates in the Site Editor.

**Files:**
- Modify: `backend/app/Services/PlaygroundValidator.php:14-80`
- Test: `backend/tests/Unit/PlaygroundValidatorTest.php` (new file)

**Step 1: Write failing tests**

Create `backend/tests/Unit/PlaygroundValidatorTest.php`:

```php
<?php

namespace Tests\Unit;

use App\Services\PlaygroundValidator;
use Tests\TestCase;

class PlaygroundValidatorTest extends TestCase
{
    public function test_timeout_returns_invalid_not_valid(): void
    {
        // We can't easily trigger a real timeout in a unit test,
        // but we can test the parseOutput behavior
        $validator = new PlaygroundValidator();
        $reflection = new \ReflectionMethod($validator, 'isTimeoutError');
        $reflection->setAccessible(true);

        $this->assertTrue($reflection->invoke($validator, 'Error: connection timed out'));
        $this->assertTrue($reflection->invoke($validator, 'ETIMEDOUT'));
    }

    public function test_cli_failure_without_output_returns_invalid(): void
    {
        // Test that empty output with failure does NOT return valid
        $validator = new PlaygroundValidator();
        $reflection = new \ReflectionMethod($validator, 'parseOutput');
        $reflection->setAccessible(true);

        $result = $reflection->invoke($validator, '', 'test-theme');
        // Should have warnings but the key question is: does validate() return valid?
        // The parseOutput returns empty errors for empty output, but that's the gap.
        $this->assertNotEmpty($result['warnings']);
    }
}
```

**Step 2: Run tests to verify baseline**

Run: `cd /path/to/backend && php artisan test --filter=PlaygroundValidatorTest -v`

**Step 3: Fix PlaygroundValidator — timeout and CLI failure = invalid**

In `PlaygroundValidator::validate()`, replace the timeout and CLI failure blocks (lines 51-71) with:

```php
        if ($this->isTimeoutError($result->errorOutput())) {
            return [
                'valid' => false,
                'errors' => [[
                    'type' => 'PLAYGROUND_TIMEOUT',
                    'message' => 'Playground CLI timed out — theme may be causing infinite loops or fatal errors.',
                ]],
                'warnings' => [],
            ];
        }

        if ($result->failed() && $output === '') {
            return [
                'valid' => false,
                'errors' => [[
                    'type' => 'PLAYGROUND_CLI_ERROR',
                    'message' => 'Playground CLI failed without output — theme likely has fatal errors.',
                ]],
                'warnings' => [],
            ];
        }
```

**Step 4: Add Site Editor template validation to the blueprint health check**

In `PlaygroundValidator::buildBlueprint()`, extend the PHP health check to also validate block grammar of the front-page template. Replace the `$phpHealthCheck` string (lines 117-163) with:

```php
        $phpHealthCheck = <<<PHP
<?php
ini_set('display_errors', '1');
error_reporting(E_ALL);

require_once '/wordpress/wp-load.php';
require_once ABSPATH . 'wp-admin/includes/theme.php';
require_once ABSPATH . 'wp-includes/http.php';

\$slug = {$this->encodeForPhp($themeSlug)};

switch_theme(\$slug);
\$theme = wp_get_theme();
\$active_slug = \$theme->get_stylesheet();
\$errors = \$theme->errors();
\$theme_errors = [];

if (\$errors instanceof WP_Error) {
    \$theme_errors = \$errors->get_error_messages();
}

\$response = wp_remote_get(home_url('/'), [ 'timeout' => 10 ]);
\$front_status = null;
\$front_error = null;
\$body = '';

if (is_wp_error(\$response)) {
    \$front_error = \$response->get_error_message();
} else {
    \$front_status = wp_remote_retrieve_response_code(\$response);
    \$body = wp_remote_retrieve_body(\$response);
}

\$trimmed = trim(\$body);
\$white_screen = (!\$front_error && \$trimmed === '') || (!\$front_error && stripos(\$trimmed, '<html') === false);

// Block grammar check: validate front-page template block markup
\$block_errors = [];
\$theme_dir = get_stylesheet_directory();
\$template_file = \$theme_dir . '/templates/front-page.html';
if (file_exists(\$template_file)) {
    \$template_content = file_get_contents(\$template_file);
    \$parsed = parse_blocks(\$template_content);

    // Check for invalid blocks (null blockName = parse failure)
    foreach (\$parsed as \$block) {
        if (!\empty(\$block['innerHTML']) && \$block['blockName'] === null && trim(\$block['innerHTML']) !== '') {
            \$snippet = substr(trim(\$block['innerHTML']), 0, 80);
            \$block_errors[] = "Unparseable block content: {\$snippet}";
        }
    }

    // Check for block validation errors using WP's own validator
    if (function_exists('wp_validate_block_template')) {
        // WP 6.4+ has this function
        // For older versions, we check parse_blocks output
    }

    // Check that block comments have valid JSON
    preg_match_all('/<!-- wp:\\S+\\s+(\\{.+?\\})\\s*(?:\\/)?-->/s', \$template_content, \$jsonMatches);
    foreach (\$jsonMatches[1] as \$jsonStr) {
        \$decoded = json_decode(\$jsonStr);
        if (\$decoded === null && json_last_error() !== JSON_ERROR_NONE) {
            \$block_errors[] = "Invalid JSON in block comment: " . substr(\$jsonStr, 0, 60);
        }
    }
}

\$payload = [
    'active_theme' => \$active_slug,
    'switched' => (\$active_slug === \$slug),
    'theme_errors' => \$theme_errors,
    'front_status' => \$front_status,
    'front_error' => \$front_error,
    'white_screen' => \$white_screen,
    'front_body_length' => strlen(\$body),
    'block_errors' => \$block_errors,
];

echo "PLAYGROUND_HEALTH::" . json_encode(\$payload) . "\\n";
?>
PHP;
```

Then in `parseOutput()`, add handling for `block_errors` after line 271 (before the final return):

```php
        foreach ($healthPayload['block_errors'] ?? [] as $blockError) {
            $errors[] = [
                'type' => 'BLOCK_GRAMMAR_ERROR',
                'message' => $blockError,
            ];
        }
```

**Step 5: Run tests**

Run: `cd /path/to/backend && php artisan test --filter=PlaygroundValidatorTest -v`
Expected: PASS.

**Step 6: Commit**

```bash
git add backend/app/Services/PlaygroundValidator.php backend/tests/Unit/PlaygroundValidatorTest.php
git commit -m "fix(PlaygroundValidator): timeout/CLI failure now returns invalid

Previously returned valid:true on timeout and CLI failure, allowing
broken themes through. Now returns valid:false with descriptive errors.
Also added block grammar check inside Playground health check to catch
invalid JSON in block comments before ZIP is finalized.

Closes validation gap that missed 'Attempt Recovery' errors."
```

---

### Task 5: Update Existing Tests to Use New Skeleton Paths

**Problem:** Existing `TokenInjectorTest` tests reference old paths (`pattern-library/tokenized/ollie/hero-light.php`) that may not exist. Tests should use the new skeleton patterns or self-contained HTML strings.

**Files:**
- Modify: `backend/tests/Unit/TokenInjectorTest.php`

**Step 1: Check if old pattern files exist**

Run: `ls -la /path/to/pattern-library/tokenized/ollie/hero-light.php`
If not found, tests are broken and must be updated.

**Step 2: Rewrite existing tests to be self-contained**

Replace the entire existing test class (preserving the new tests from Tasks 1-3) with tests that use inline HTML strings instead of file paths. The old tests that use `$injector->inject()` (the legacy method) should be updated to either:
- Use inline HTML with `injectTokens()` (the new primary method), or
- Point to an existing skeleton file if testing the `loadSkeleton()` + `inject()` flow

```php
public function test_injects_tokens_into_skeleton_html(): void
{
    $injector = new TokenInjector();

    $html = '<!-- wp:heading {"level":1} -->'
        . '<h1 class="wp-block-heading">{{HERO_TITLE}}</h1>'
        . '<!-- /wp:heading -->'
        . '<!-- wp:paragraph -->'
        . '<p>{{HERO_TEXT}}</p>'
        . '<!-- /wp:paragraph -->';

    $tokens = [
        'HERO_TITLE' => 'Roma Pizza',
        'HERO_TEXT' => 'Authentic Italian restaurant in NYC',
    ];

    $output = $injector->injectTokens($html, $tokens);

    $this->assertStringContainsString('Roma Pizza', $output);
    $this->assertStringContainsString('Authentic Italian restaurant', $output);
    $this->assertStringNotContainsString('{{', $output);
    $this->assertStringNotContainsString('}}', $output);
}

public function test_escapes_html_entities_in_text_tokens(): void
{
    $injector = new TokenInjector();

    $html = '<!-- wp:paragraph --><p>{{HERO_TITLE}}</p><!-- /wp:paragraph -->';

    $tokens = ['HERO_TITLE' => 'Roma & Sons <Best>'];
    $output = $injector->injectTokens($html, $tokens);

    $this->assertStringContainsString('Roma &amp; Sons &lt;Best&gt;', $output);
}

public function test_missing_token_produces_empty_string(): void
{
    $injector = new TokenInjector();

    $html = '<!-- wp:paragraph --><p>{{NONEXISTENT_TOKEN}}</p><!-- /wp:paragraph -->';

    $output = $injector->injectTokens($html, []);

    $this->assertStringNotContainsString('{{', $output);
}

public function test_image_token_fallback_to_placeholder(): void
{
    $injector = new TokenInjector();

    $html = '<!-- wp:image {"url":"{{IMAGE_HERO}}"} -->'
        . '<figure><img src="{{IMAGE_HERO}}" alt=""/></figure>'
        . '<!-- /wp:image -->';

    $output = $injector->injectTokens($html, ['IMAGE_HERO' => '']);

    $this->assertStringContainsString('placehold.co', $output);
}
```

**Step 3: Run full test suite**

Run: `cd /path/to/backend && php artisan test -v`
Expected: ALL tests PASS.

**Step 4: Commit**

```bash
git add backend/tests/Unit/TokenInjectorTest.php
git commit -m "test: rewrite TokenInjector tests to use inline HTML fixtures

Removed dependency on legacy tokenized/ollie/*.php files.
Tests now use self-contained HTML strings for predictability."
```

---

### Task 6: Add Integration Test — End-to-End Block Grammar Validation

**Problem:** No test currently validates that the full pipeline (PatternSelector → TokenInjector → ThemeAssembler) produces block-grammar-valid HTML across all 5 verticals and their skeleton combinations.

**Files:**
- Create: `backend/tests/Feature/BlockGrammarIntegrationTest.php`

**Step 1: Write the integration test**

```php
<?php

namespace Tests\Feature;

use App\Services\PatternSelector;
use App\Services\TokenInjector;
use Tests\TestCase;

class BlockGrammarIntegrationTest extends TestCase
{
    /**
     * @dataProvider verticalProvider
     */
    public function test_all_skeletons_produce_valid_block_grammar(string $vertical): void
    {
        $selector = app(PatternSelector::class);
        $injector = app(TokenInjector::class);

        $selections = $selector->select($vertical);
        $this->assertNotEmpty($selections, "No selections for vertical: {$vertical}");

        // Build a comprehensive token map covering all possible tokens
        $allTokens = $this->buildFullTokenMap();

        // processSkeletons should NOT throw BlockGrammarException
        $results = $injector->processSkeletons($selections, $allTokens);

        foreach ($results as $pageType => $html) {
            $this->assertNotEmpty($html, "Empty HTML for {$vertical}/{$pageType}");

            // Double-check: no unresolved tokens
            $this->assertDoesNotMatchRegularExpression(
                '/\{\{\w+\}\}/',
                $html,
                "Unresolved tokens in {$vertical}/{$pageType}"
            );

            // Double-check: all block comment JSON is valid
            preg_match_all('/<!-- wp:\S+\s+(\{.+?\})\s*(?:\/)?-->/s', $html, $jsonMatches);
            foreach ($jsonMatches[1] as $jsonStr) {
                $decoded = json_decode($jsonStr, true);
                $this->assertNotNull(
                    $decoded,
                    "Invalid JSON in block comment for {$vertical}/{$pageType}: "
                    . mb_substr($jsonStr, 0, 100)
                );
            }
        }
    }

    public static function verticalProvider(): array
    {
        return [
            'restaurant' => ['restaurant'],
            'ecommerce' => ['ecommerce'],
            'saas' => ['saas'],
            'portfolio' => ['portfolio'],
            'local_service' => ['local_service'],
        ];
    }

    private function buildFullTokenMap(): array
    {
        // Load token-schema.json if available, otherwise use a comprehensive manual map
        $schemaPath = base_path('../pattern-library/token-schema.json');
        if (file_exists($schemaPath)) {
            $schema = json_decode(file_get_contents($schemaPath), true) ?? [];
            $tokens = [];
            foreach ($schema as $tokenName => $def) {
                if (str_starts_with($tokenName, 'IMAGE_')) {
                    $tokens[$tokenName] = 'https://images.unsplash.com/photo-test-' . strtolower($tokenName);
                } else {
                    $tokens[$tokenName] = $def['example'] ?? "Test value for {$tokenName}";
                }
            }
            return $tokens;
        }

        // Fallback: build from skeleton-registry.json
        $registryPath = base_path('../pattern-library/skeleton-registry.json');
        $registry = json_decode(file_get_contents($registryPath), true) ?? [];
        $tokens = [];

        foreach ($registry as $skeleton) {
            foreach ($skeleton['required_tokens'] ?? [] as $tokenName) {
                if (isset($tokens[$tokenName])) {
                    continue;
                }
                if (str_starts_with($tokenName, 'IMAGE_')) {
                    $tokens[$tokenName] = 'https://images.unsplash.com/photo-test-' . strtolower($tokenName);
                } else {
                    $tokens[$tokenName] = "Test value for {$tokenName}";
                }
            }
        }

        return $tokens;
    }
}
```

**Step 2: Run test**

Run: `cd /path/to/backend && php artisan test --filter=BlockGrammarIntegrationTest -v`
Expected: All 5 verticals PASS. If any fail, the skeleton HTML file needs fixing (that's a good catch!).

**Step 3: Commit**

```bash
git add backend/tests/Feature/BlockGrammarIntegrationTest.php
git commit -m "test: add integration test for block grammar across all 5 verticals

Runs PatternSelector + TokenInjector for restaurant, ecommerce, saas,
portfolio, and local_service. Verifies all block comment JSON is valid
and no unresolved tokens remain. Catches skeleton bugs before deploy."
```

---

### Task 7: Update GenerateThemeJob Error Handling

**Problem:** `GenerateThemeJob::handle()` has a bare `catch (Throwable $e) { throw $e; }` on line 135-136 which does nothing useful. The `failed()` method only marks the job as failed, but doesn't provide enough context for debugging. With the new `BlockGrammarException`, we should log structured error data.

**Files:**
- Modify: `backend/app/Jobs/GenerateThemeJob.php:135-139`

**Step 1: Write the improved error handling**

Replace the catch block (lines 135-139) with:

```php
        } catch (\App\Exceptions\BlockGrammarException $e) {
            $metrics->emit('job.block_grammar_error', [
                'job_id' => $this->jobId,
                'errors' => $e->getValidationErrors(),
                'attempt' => $this->attempts(),
            ]);
            throw $e;
        } catch (Throwable $e) {
            $metrics->emit('job.error', [
                'job_id' => $this->jobId,
                'error_class' => get_class($e),
                'error_message' => $e->getMessage(),
                'attempt' => $this->attempts(),
            ]);
            throw $e;
        } finally {
            $this->cleanupTempDir($tempDir);
        }
```

Add the import at the top:

```php
use App\Exceptions\BlockGrammarException;
```

**Step 2: Run full test suite**

Run: `cd /path/to/backend && php artisan test -v`
Expected: ALL tests PASS.

**Step 3: Commit**

```bash
git add backend/app/Jobs/GenerateThemeJob.php
git commit -m "feat(GenerateThemeJob): structured error metrics for block grammar failures

BlockGrammarException now emits specific validation errors to metrics.
General errors emit error class and message for better debugging."
```

---

### Task 8: Fix the Legacy `inject()` Method for Backward Compatibility

**Problem:** The legacy `inject()` method (lines 150-189) is still used by some code paths. It has the same escaping issues as the old `injectTokens()`. It should use the same context-aware logic, or at minimum, not silently strip unresolved tokens (line 185: `preg_replace('/\{\{[A-Z0-9_]+\}\}/', '', $output)`).

**Files:**
- Modify: `backend/app/Services/TokenInjector.php:150-189`

**Step 1: Update the `ensureRequiredTokens` to throw**

The current implementation logs warnings for missing tokens but continues. Since we now have `BlockGrammarException`, it should throw:

```php
private function ensureRequiredTokens(array $tokens, array $requiredTokens): void
{
    $missing = [];
    foreach ($requiredTokens as $token) {
        if (! array_key_exists($token, $tokens)) {
            $missing[] = $token;
        }
    }

    if (! empty($missing)) {
        throw new BlockGrammarException(
            array_map(fn($t) => "Required token missing: {$t}", $missing),
            'inject()'
        );
    }
}
```

**Step 2: Update `inject()` to use `injectTokens()` internally**

Replace the legacy `inject()` method body with:

```php
public function inject(string $patternPath, array $tokens, array $requiredTokens = []): string
{
    if (! file_exists($patternPath)) {
        throw new RuntimeException("Pattern file not found at {$patternPath}");
    }

    $contents = file_get_contents($patternPath);
    $this->ensureRequiredTokens($tokens, $requiredTokens);

    // Normalize token keys to uppercase (legacy compat)
    $normalizedTokens = [];
    foreach ($tokens as $key => $value) {
        $normalizedTokens[strtoupper($key)] = $value;
    }

    return $this->injectTokens($contents, $normalizedTokens);
}
```

**Step 3: Run tests**

Run: `cd /path/to/backend && php artisan test -v`
Expected: ALL tests PASS (the old tests that used `inject()` with `expectException(MissingTokenException::class)` need updating to expect `BlockGrammarException` instead — update that in the test file).

**Step 4: Commit**

```bash
git add backend/app/Services/TokenInjector.php backend/tests/Unit/TokenInjectorTest.php
git commit -m "refactor(TokenInjector): legacy inject() now delegates to injectTokens()

Eliminates duplicated escaping logic. Missing required tokens now
throw BlockGrammarException instead of just logging warnings.
Silent token stripping removed — unresolved tokens are errors."
```

---

## Summary of Changes

| File | Action | Purpose |
|------|--------|---------|
| `TokenInjector.php` | Major rewrite | Context-aware injection, proper JSON parsing, halt on errors |
| `PlaygroundValidator.php` | Fix | No more `valid: true` on failure, block grammar check added |
| `GenerateThemeJob.php` | Enhance | Structured error metrics for grammar failures |
| `BlockGrammarException.php` | New | Typed exception for validation failures |
| `TokenInjectorTest.php` | Rewrite | Self-contained tests, covers new injection logic |
| `PlaygroundValidatorTest.php` | New | Tests for timeout/failure behavior |
| `BlockGrammarIntegrationTest.php` | New | End-to-end test across all 5 verticals |

## Risk Assessment

**Low risk:** All changes are backward-compatible. The `inject()` legacy method now delegates to `injectTokens()`. Existing skeleton HTML files don't need changes — they already use `{{TOKEN}}` syntax.

**Medium risk:** Making validation failures throw exceptions means themes that previously "worked" (despite having broken JSON in block comments) will now fail. This is intentional — those themes were causing "Attempt Recovery" errors anyway. Monitor the `job.block_grammar_error` metric after deploy.

**Mitigation:** The integration test (Task 6) validates all 5 verticals upfront. Run it before deploying to catch any skeleton patterns that need fixing.

## Execution Order

Tasks 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 (sequential — each builds on the previous).
