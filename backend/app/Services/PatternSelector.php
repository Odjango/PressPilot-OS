<?php

namespace App\Services;

use RuntimeException;

class PatternSelector
{
    private array $patterns;
    private array $knownVerticals;

    public function __construct(
        private ?string $registryPath = null,
    ) {
        $this->registryPath ??= base_path('../pattern-library/registry.json');
        $this->patterns = $this->loadRegistry($this->registryPath);
        $this->knownVerticals = $this->collectKnownVerticals($this->patterns);
    }

    /**
     * @return array<int, string>
     */
    public function selectForPage(string $pageType, ?string $vertical = null, ?string $style = null): array
    {
        return $this->selectForPageWithOffset($pageType, $vertical, $style, 0);
    }

    /**
     * @return array<int, string>
     */
    public function selectForPageWithOffset(
        string $pageType,
        ?string $vertical = null,
        ?string $style = null,
        int $offset = 0
    ): array {
        $categories = $this->categoriesForPage($pageType);
        $resolvedVertical = $this->resolveVertical($vertical);
        $forceCore = $resolvedVertical === null ? 'ollie' : null;

        $selected = [];

        foreach ($categories as $category) {
            $categoryPatterns = $this->selectByCategory($category, $resolvedVertical, $style, $forceCore, $offset);
            $selected = array_merge($selected, $categoryPatterns);
        }

        if (count($selected) < 4) {
            $selected = array_values(array_unique(array_merge(
                $selected,
                $this->selectByCategory('hero', $resolvedVertical, $style, $forceCore, $offset)
            )));
        }

        return array_values(array_unique($selected));
    }

    /**
     * @return array<int, string>
     */
    private function selectByCategory(
        string $category,
        ?string $vertical,
        ?string $style,
        ?string $forceCore,
        int $offset
    ): array {
        $matches = array_values(array_filter($this->patterns, function (array $pattern) use ($category, $forceCore) {
            if (($pattern['category'] ?? null) !== $category) {
                return false;
            }

            if ($forceCore !== null) {
                return ($pattern['source_core'] ?? null) === $forceCore;
            }

            return true;
        }));

        if (empty($matches)) {
            return [];
        }

        usort($matches, function (array $a, array $b) use ($category, $vertical, $style) {
            return $this->scorePattern($b, $category, $vertical, $style) <=> $this->scorePattern($a, $category, $vertical, $style);
        });

        $start = $offset * 2;
        $top = array_slice($matches, $start, 2);

        if (empty($top)) {
            $top = array_slice($matches, 0, 2);
        }

        return array_values(array_map(fn (array $pattern) => $pattern['pattern_id'], $top));
    }

    private function scorePattern(array $pattern, string $category, ?string $vertical, ?string $style): int
    {
        $score = 0;
        $verticalAffinity = $pattern['vertical_affinity'] ?? [];
        $styleAffinity = $pattern['style_affinity'] ?? [];
        $sourceCore = $pattern['source_core'] ?? '';
        $complexity = $pattern['complexity'] ?? null;

        if ($vertical && in_array($vertical, $verticalAffinity, true)) {
            $score += 3;
        }

        if ($vertical === 'restaurant' && $sourceCore === 'tove') {
            $score += 2;
        }

        if ($style && in_array($style, $styleAffinity, true)) {
            $score += 2;
        }

        if ($style === 'minimal' && $sourceCore === 'frost') {
            $score += 2;
        }

        $preferredComplexity = $this->preferredComplexity($category);
        if ($preferredComplexity !== null && $complexity === $preferredComplexity) {
            $score += 1;
        }

        if ($sourceCore === 'ollie') {
            $score += 1;
        }

        return $score;
    }

    /**
     * @return array<int, string>
     */
    private function categoriesForPage(string $pageType): array
    {
        $pageType = strtolower(trim($pageType));

        return match ($pageType) {
            'home' => ['hero', 'features', 'testimonials', 'cta'],
            'about' => ['hero', 'about', 'team', 'cta'],
            'services' => ['hero', 'features', 'pricing', 'cta'],
            'contact' => ['hero', 'contact', 'faq', 'cta'],
            'blog' => ['hero', 'blog', 'newsletter', 'cta'],
            'header' => ['header'],
            'footer' => ['footer'],
            default => ['hero', 'features', 'cta'],
        };
    }

    private function preferredComplexity(string $category): ?string
    {
        return match ($category) {
            'hero' => 'complex',
            'footer' => 'simple',
            'header' => 'simple',
            'contact' => 'simple',
            'cta' => 'simple',
            'gallery' => 'simple',
            default => 'moderate',
        };
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function loadRegistry(string $path): array
    {
        if (! file_exists($path)) {
            throw new RuntimeException("Registry not found at {$path}");
        }

        $payload = json_decode(file_get_contents($path), true);
        if (! is_array($payload) || ! isset($payload['patterns'])) {
            throw new RuntimeException('Invalid registry payload');
        }

        return $payload['patterns'];
    }

    /**
     * @param  array<int, array<string, mixed>>  $patterns
     * @return array<int, string>
     */
    private function collectKnownVerticals(array $patterns): array
    {
        $verticals = [];
        foreach ($patterns as $pattern) {
            foreach (($pattern['vertical_affinity'] ?? []) as $vertical) {
                if (! in_array($vertical, $verticals, true)) {
                    $verticals[] = $vertical;
                }
            }
        }

        return $verticals;
    }

    private function resolveVertical(?string $vertical): ?string
    {
        $normalized = strtolower(trim((string) $vertical));
        if ($normalized === '') {
            return 'general';
        }

        if (! in_array($normalized, $this->knownVerticals, true)) {
            return null;
        }

        return $normalized;
    }
}
