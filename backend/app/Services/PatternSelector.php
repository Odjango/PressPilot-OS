<?php

namespace App\Services;

use RuntimeException;

class PatternSelector
{
    private array $skeletonRegistry;
    private array $verticalRecipes;

    public function __construct(?string $registryPath = null, ?string $recipesPath = null)
    {
        $registryPath ??= base_path('../pattern-library/skeleton-registry.json');
        $recipesPath ??= base_path('../pattern-library/vertical-recipes.json');

        if (! file_exists($registryPath)) {
            throw new RuntimeException("Skeleton registry not found at {$registryPath}");
        }
        if (! file_exists($recipesPath)) {
            throw new RuntimeException("Vertical recipes not found at {$recipesPath}");
        }

        $this->skeletonRegistry = json_decode(file_get_contents($registryPath), true) ?? [];
        $this->verticalRecipes = json_decode(file_get_contents($recipesPath), true) ?? [];
    }

    /**
     * Select skeletons for all pages based on the business vertical recipe.
     *
     * @param string $category Business vertical (restaurant, ecommerce, saas, portfolio, local_service)
     * @param string|null $heroLayout User's hero layout choice (fullBleed, fullWidth, split, minimal)
     * @return array<string, array<int, array{id: string, file: string, required_tokens: array}>>
     *         Keyed by page type (home, about, services, contact), each containing skeleton entries
     */
    public function select(string $category, ?string $heroLayout = null): array
    {
        $category = strtolower(trim($category));
        $recipe = $this->verticalRecipes[$category]
            ?? $this->verticalRecipes['local_service']
            ?? [];

        if (empty($recipe)) {
            throw new RuntimeException("No recipe found for category: {$category}");
        }

        $result = [];
        foreach ($recipe as $pageType => $skeletonIds) {
            $result[$pageType] = [];
            foreach ($skeletonIds as $skeletonId) {
                // Override hero skeleton on home page if heroLayout is provided
                if ($pageType === 'home' && $skeletonId === 'hero-cover' && $heroLayout) {
                    $heroMap = [
                        'fullBleed' => 'hero-fullbleed',
                        'fullWidth' => 'hero-cover',
                        'split' => 'hero-split',
                        'minimal' => 'hero-cover',
                    ];
                    $mappedSkeletonId = $heroMap[$heroLayout] ?? $skeletonId;
                    \Illuminate\Support\Facades\Log::info(
                        "PatternSelector: Overriding hero skeleton",
                        ['requested' => $heroLayout, 'mapped_to' => $mappedSkeletonId]
                    );
                    $skeletonId = $mappedSkeletonId;
                }

                $skeleton = $this->skeletonRegistry[$skeletonId] ?? null;
                if ($skeleton && isset($skeleton['file'])) {
                    $result[$pageType][] = [
                        'id' => $skeletonId,
                        'file' => $skeleton['file'],
                        'required_tokens' => $skeleton['required_tokens'] ?? [],
                    ];
                } else {
                    // Log missing skeleton but don't fail — allows partial generation
                    \Illuminate\Support\Facades\Log::warning(
                        "PatternSelector: Skeleton '{$skeletonId}' not found in registry",
                        ['category' => $category, 'page' => $pageType]
                    );
                }
            }
        }

        return $result;
    }

    /**
     * Get available verticals from the recipes config.
     *
     * @return array<int, string>
     */
    public function getAvailableVerticals(): array
    {
        return array_keys($this->verticalRecipes);
    }
}
