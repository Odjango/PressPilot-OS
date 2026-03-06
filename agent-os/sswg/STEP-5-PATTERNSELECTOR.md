# STEP 5: Rewrite PatternSelector.php

> **Depends on:** Step 2 (needs skeleton-registry.json + vertical-recipes.json)
> **Estimated effort:** 1-2 hours
> **Output file:** `backend/app/Services/PatternSelector.php` (REWRITE)

---

## WHAT YOU'RE DOING

Rewriting PatternSelector to use the new skeleton registry + vertical recipes instead of the old pattern registry with affinity scoring.

## CURRENT FILE

Read `backend/app/Services/PatternSelector.php` to understand the existing structure. Currently it loads `pattern-library/registry.json`, scores patterns by vertical_affinity and style_affinity, and picks 2 per category.

## NEW BEHAVIOR

Much simpler. No scoring. The vertical recipe directly specifies which skeletons to use for each page.

### New constructor

```php
public function __construct(?string $registryPath = null, ?string $recipesPath = null)
{
    $registryPath ??= base_path('../pattern-library/skeleton-registry.json');
    $recipesPath ??= base_path('../pattern-library/vertical-recipes.json');

    $this->skeletonRegistry = json_decode(file_get_contents($registryPath), true) ?? [];
    $this->verticalRecipes = json_decode(file_get_contents($recipesPath), true) ?? [];
}
```

### New select method

```php
/**
 * @param string $category Business vertical (restaurant, ecommerce, saas, portfolio, local_service)
 * @return array<string, array<string, string>> Keyed by page type, each containing skeleton IDs and their file paths
 */
public function select(string $category): array
{
    $recipe = $this->verticalRecipes[$category]
        ?? $this->verticalRecipes['local_service']
        ?? [];

    $result = [];
    foreach ($recipe as $pageType => $skeletonIds) {
        $result[$pageType] = [];
        foreach ($skeletonIds as $skeletonId) {
            $skeleton = $this->skeletonRegistry[$skeletonId] ?? null;
            if ($skeleton && isset($skeleton['file'])) {
                $result[$pageType][] = [
                    'id' => $skeletonId,
                    'file' => $skeleton['file'],
                    'required_tokens' => $skeleton['required_tokens'] ?? [],
                ];
            }
        }
    }

    return $result;
}
```

### Return format

```php
[
    'home' => [
        ['id' => 'hero-cover', 'file' => 'skeletons/hero-cover.html', 'required_tokens' => [...]],
        ['id' => 'about-story', 'file' => 'skeletons/about-story.html', 'required_tokens' => [...]],
        // ...
    ],
    'about' => [...],
    'services' => [...],
    'contact' => [...],
]
```

### Remove old methods

- Remove the old `selectPatterns()` / `select()` method with scoring
- Remove the old `registry.json` loading
- Remove offset-based retry logic (not needed — skeleton selection is deterministic)

## IMPORTANT

Check how `GenerateThemeJob.php` currently calls PatternSelector. Match the new method signature so the job can call it without breaking. If the old method is `selectPatterns($category, $offset)`, the new one should be `select($category)`.

## VERIFICATION

```bash
# PHP syntax check
php -l backend/app/Services/PatternSelector.php

# Quick test
php -r "
require 'vendor/autoload.php';
\$selector = new App\Services\PatternSelector();
\$result = \$selector->select('restaurant');
echo 'Pages: ' . implode(', ', array_keys(\$result)) . PHP_EOL;
echo 'Home sections: ' . count(\$result['home']) . PHP_EOL;
foreach (\$result['home'] as \$s) { echo '  - ' . \$s['id'] . PHP_EOL; }
"
```

Check that:
- Restaurant gets menu-2col, chef-highlight, hours-location, reservation-cta
- SaaS gets pricing-3col, stats-numbers, faq-accordion
- Every skeleton file referenced actually exists in `pattern-library/skeletons/`
