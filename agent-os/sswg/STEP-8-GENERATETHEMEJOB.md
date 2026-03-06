# STEP 8: Update GenerateThemeJob.php

> **Depends on:** Steps 4-7 (all service files must be updated)
> **Estimated effort:** 1 hour
> **Output file:** `backend/app/Jobs/GenerateThemeJob.php` (MODIFY)

---

## WHAT YOU'RE DOING

Updating the orchestration job to wire the updated services together. The flow changes from old to new:

**OLD flow:**
1. AIPlanner → 81 generic tokens
2. PatternSelector → scored pattern selection with offset
3. TokenInjector → inject into PHP patterns (extractMarkup strips PHP)
4. ThemeAssembler → front-page only, Ollie footer

**NEW flow:**
1. AIPlanner → 200+ vertical-specific tokens
2. PatternSelector → recipe-based skeleton selection (deterministic)
3. TokenInjector → inject into HTML skeletons + validate block grammar
4. ImageHandler → get Unsplash URLs (unchanged)
5. ThemeAssembler → all pages with content, PressPilot footer

## CURRENT FILE

Read `backend/app/Jobs/GenerateThemeJob.php` to understand the current orchestration.

## CHANGES

### 1. Update the main handle/generate method

```php
// Step 1: AI generates content tokens
$category = $this->project['category'] ?? 'local_service';
$tokens = $this->aiPlanner->generate($this->project);

// Step 2: PatternSelector picks skeletons by vertical recipe
$skeletonSelections = $this->patternSelector->select($category);

// Step 3: ImageHandler gets Unsplash URLs (add to tokens)
$imageTokens = $this->imageHandler->fetchImages($this->project);
$allTokens = array_merge($tokens, $imageTokens);

// Step 4: TokenInjector processes skeletons with all tokens
$pageHtml = $this->tokenInjector->processSkeletons($skeletonSelections, $allTokens);

// Step 5: ThemeAssembler builds the theme ZIP
$zipPath = $this->themeAssembler->assemble($this->project, $allTokens, $pageHtml);
```

### 2. Update retry logic

The old offset-based retry (`PatternSelector::select($category, $offset)`) is no longer needed because skeleton selection is deterministic. If generation fails, retry the whole job (which is what Laravel's job retry already does).

If PlaygroundValidator fails, the retry should NOT change pattern selection — instead log the validation errors for debugging.

### 3. Pass business category to PatternSelector

Make sure `$this->project['category']` is passed correctly. Check how the project data arrives from the API request. Map any incoming category values to the 5 supported verticals: `restaurant`, `ecommerce`, `saas`, `portfolio`, `local_service`.

```php
private function normalizeCategory(string $category): string
{
    $map = [
        'restaurant' => 'restaurant',
        'food' => 'restaurant',
        'cafe' => 'restaurant',
        'ecommerce' => 'ecommerce',
        'shop' => 'ecommerce',
        'store' => 'ecommerce',
        'retail' => 'ecommerce',
        'saas' => 'saas',
        'software' => 'saas',
        'tech' => 'saas',
        'technology' => 'saas',
        'portfolio' => 'portfolio',
        'agency' => 'portfolio',
        'creative' => 'portfolio',
        'photography' => 'portfolio',
        'local_service' => 'local_service',
        'service' => 'local_service',
        'plumber' => 'local_service',
        'contractor' => 'local_service',
    ];

    return $map[strtolower($category)] ?? 'local_service';
}
```

### 4. Service initialization

Update the constructor or service resolution to use the updated service classes. If using Laravel's service container, the constructors should auto-resolve.

## VERIFICATION

```bash
# PHP syntax check
php -l backend/app/Jobs/GenerateThemeJob.php

# Dispatch a test job (via artisan or API)
curl -X POST http://localhost:8080/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Cafe",
    "description": "A cozy coffee shop in Portland",
    "category": "restaurant",
    "language": "English",
    "pages": ["home", "about", "menu", "contact"]
  }'
```

Check Laravel logs for:
- No errors in AIPlanner
- No errors in TokenInjector validation
- ZIP created successfully
- Upload to Supabase succeeded
