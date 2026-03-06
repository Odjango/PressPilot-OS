# STEP 4: Rewrite AIPlanner.php

> **Depends on:** Steps 2 + 3 (needs vertical-recipes.json + token-schema.json)
> **Estimated effort:** 2-3 hours
> **Output file:** `backend/app/Services/AIPlanner.php` (REWRITE)

---

## WHAT YOU'RE DOING

Rewriting AIPlanner to generate complete, vertical-specific business content. Currently it sends a generic prompt and gets 81 tokens. After this, it sends a vertical-specific prompt and gets 200+ tokens.

## CURRENT FILE

Read `backend/app/Services/AIPlanner.php` to understand the existing structure.

## CHANGES REQUIRED

### 1. Load vertical recipes to determine which tokens are needed

```php
public function __construct(?string $schemaPath = null, ?string $recipesPath = null, ?string $registryPath = null)
{
    $schemaPath ??= base_path('../pattern-library/token-schema.json');
    $recipesPath ??= base_path('../pattern-library/vertical-recipes.json');
    $registryPath ??= base_path('../pattern-library/skeleton-registry.json');

    $this->tokenSchema = json_decode(file_get_contents($schemaPath), true)['tokens'] ?? [];
    $this->verticalRecipes = json_decode(file_get_contents($recipesPath), true) ?? [];
    $this->skeletonRegistry = json_decode(file_get_contents($registryPath), true) ?? [];
}
```

### 2. Determine required tokens based on vertical

For the given business category, look up the recipe, collect all skeleton IDs, then union all `required_tokens` from the registry. Only request tokens the AI actually needs to generate.

```php
private function getRequiredTokens(string $category): array
{
    $recipe = $this->verticalRecipes[$category] ?? $this->verticalRecipes['local_service'] ?? [];
    $requiredTokens = [];

    foreach ($recipe as $page => $skeletonIds) {
        foreach ($skeletonIds as $skeletonId) {
            $skeleton = $this->skeletonRegistry[$skeletonId] ?? null;
            if ($skeleton && isset($skeleton['required_tokens'])) {
                $requiredTokens = array_merge($requiredTokens, $skeleton['required_tokens']);
            }
        }
    }

    // Remove IMAGE_* tokens (handled by ImageHandler) and deduplicate
    return array_values(array_unique(array_filter(
        $requiredTokens,
        fn(string $t) => !str_starts_with($t, 'IMAGE_')
    )));
}
```

### 3. Build vertical-specific prompt

The system prompt should be compact (just token names + brief rules). The user prompt provides the business context.

**Key requirement:** The prompt must say "Write as if you ARE the business owner. Every text must be specific to {business_name}. No generic placeholder text."

Keep the system prompt SHORT to stay under rate limits. Just list the token names and give category hints, like the current implementation does after our rate-limit fix.

### 4. Keep existing retry logic

The exponential backoff retry with rate-limit awareness was just added. Keep it.

### 5. Validate all required tokens are present

After AI response, check that every required token has a non-empty value. Fill missing ones with sensible defaults:
- Missing CONTACT_EMAIL → `info@{slug}.com`
- Missing CONTACT_PHONE → `(555) 123-4567`
- Missing CTA text → `Get Started` or `Learn More`

### 6. Method signature change

```php
public function generate(array $project): array
```

The `$project` array already contains `category` (business vertical). Use it to determine the recipe.

## DO NOT CHANGE

- The `requestCompletion()` method (HTTP call to Anthropic API)
- The `extractJson()` method (strips markdown fences)
- The retry logic with backoff
- The `max_tokens` config value

## VERIFICATION

```bash
# PHP syntax check
php -l backend/app/Services/AIPlanner.php

# Run a quick test (if artisan tinker is available)
php artisan tinker --execute="
\$planner = new \App\Services\AIPlanner();
\$tokens = \$planner->generate([
    'name' => 'Bella Trattoria',
    'description' => 'Authentic Italian restaurant in downtown Seattle',
    'category' => 'restaurant',
    'language' => 'English',
    'pages' => ['home', 'about', 'menu', 'contact'],
]);
echo count(\$tokens) . ' tokens generated';
echo array_key_exists('MENU_ITEM_1_NAME', \$tokens) ? 'Has menu tokens' : 'MISSING menu tokens';
"
```

Check that:
- Restaurant generates MENU_* tokens
- SaaS generates PRICING_* tokens
- No token value contains "Ollie", "theme", "WordPress", "Lorem ipsum"
- All values are specific to the business name
