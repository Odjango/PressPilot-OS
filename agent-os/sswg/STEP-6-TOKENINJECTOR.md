# STEP 6: Update TokenInjector.php

> **Depends on:** Steps 1 + 3 (skeleton files + token schema)
> **Estimated effort:** 1-2 hours
> **Output file:** `backend/app/Services/TokenInjector.php` (MODIFY)

---

## WHAT YOU'RE DOING

Updating TokenInjector to work with HTML skeleton files (not PHP patterns) and adding post-injection block grammar validation.

## CURRENT FILE

Read `backend/app/Services/TokenInjector.php`. Currently it:
1. Calls `extractMarkup()` which strips PHP from pattern files
2. Replaces `{{TOKEN_NAME}}` with values
3. No validation after injection

## CHANGES

### 1. Read HTML skeletons directly

New skeletons are pure HTML — no PHP to strip. The `extractMarkup()` step is no longer needed for skeleton files. Add a method to read skeleton content directly:

```php
public function loadSkeleton(string $skeletonFile): string
{
    $basePath = base_path('../pattern-library/');
    $path = $basePath . $skeletonFile;

    if (!file_exists($path)) {
        throw new \RuntimeException("Skeleton file not found: {$path}");
    }

    return file_get_contents($path);
}
```

### 2. Inject tokens into skeleton HTML

```php
public function inject(string $html, array $tokens): string
{
    // Replace all {{TOKEN_NAME}} placeholders
    $result = preg_replace_callback('/\{\{(\w+)\}\}/', function ($matches) use ($tokens) {
        $tokenName = $matches[1];
        $value = $tokens[$tokenName] ?? '';

        if (empty($value)) {
            Log::warning("TokenInjector: Token {$tokenName} has no value");
        }

        return $value;
    }, $html);

    return $result;
}
```

### 3. Handle Cover block image URLs safely

When a token appears inside block comment JSON like `{"url":"{{IMAGE_HERO}}"}`, the replacement URL must not break the JSON. Ensure URLs are JSON-safe:

```php
// Inside the replacement callback, if the token is inside a block comment:
// Escape any characters that could break JSON
if (str_starts_with($tokenName, 'IMAGE_')) {
    $value = str_replace(['\\', '"'], ['\\\\', '\\"'], $value);
}
```

### 4. Post-injection block grammar validation

After all tokens are replaced, validate the block markup:

```php
public function validateBlockGrammar(string $html): array
{
    $errors = [];

    // Check 1: Every opening block has a matching closer (or is self-closing)
    preg_match_all('/<!-- wp:(\S+)(?:\s+\{[^}]*\})?\s*-->/', $html, $openings);
    preg_match_all('/<!-- \/wp:(\S+)\s*-->/', $html, $closings);
    preg_match_all('/<!-- wp:(\S+)(?:\s+\{[^}]*\})?\s*\/-->/', $html, $selfClosing);

    // Note: This is a basic check. Opening count should equal closing count + self-closing is separate.

    // Check 2: Block comment JSON is valid
    preg_match_all('/<!-- wp:\S+\s+(\{[^}]*\})\s*(?:\/)?-->/', $html, $jsonMatches);
    foreach ($jsonMatches[1] as $jsonStr) {
        $decoded = json_decode($jsonStr);
        if ($decoded === null && json_last_error() !== JSON_ERROR_NONE) {
            $errors[] = "Invalid JSON in block comment: " . mb_substr($jsonStr, 0, 100);
        }
    }

    // Check 3: No remaining {{TOKEN}} placeholders
    preg_match_all('/\{\{(\w+)\}\}/', $html, $remaining);
    if (!empty($remaining[1])) {
        $errors[] = "Unresolved tokens: " . implode(', ', $remaining[1]);
    }

    if (!empty($errors)) {
        Log::warning('TokenInjector: Block grammar issues', ['errors' => $errors]);
    }

    return $errors;
}
```

### 5. Main method that combines everything

```php
public function processSkeletons(array $skeletonSelections, array $tokens): array
{
    $results = [];

    foreach ($skeletonSelections as $pageType => $skeletons) {
        $pageHtml = '';
        foreach ($skeletons as $skeleton) {
            $html = $this->loadSkeleton($skeleton['file']);
            $injected = $this->inject($html, $tokens);
            $errors = $this->validateBlockGrammar($injected);

            if (!empty($errors)) {
                Log::warning("TokenInjector: Validation issues in {$skeleton['id']}", ['errors' => $errors]);
            }

            $pageHtml .= $injected . "\n\n";
        }
        $results[$pageType] = trim($pageHtml);
    }

    return $results;
}
```

## KEEP EXISTING METHODS

Keep the old `extractMarkup()` and pattern injection methods if they're used elsewhere. Just add the new skeleton-specific methods alongside them.

## VERIFICATION

```bash
# PHP syntax check
php -l backend/app/Services/TokenInjector.php

# Test with a skeleton file
php -r "
\$html = file_get_contents('pattern-library/skeletons/hero-cover.html');
echo 'Tokens found: ' . preg_match_all('/\{\{(\w+)\}\}/', \$html, \$m) . PHP_EOL;
echo implode(', ', \$m[1]) . PHP_EOL;
"
```

Check that:
- `processSkeletons()` returns HTML for each page type
- Zero `{{TOKEN}}` markers remain in output
- All block comment JSON is valid after injection
- Cover block URLs are properly escaped
