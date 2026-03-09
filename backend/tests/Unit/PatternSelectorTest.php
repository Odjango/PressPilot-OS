<?php

namespace Tests\Unit;

use App\Services\PatternSelector;
use Tests\TestCase;

class PatternSelectorTest extends TestCase
{
    public function test_restaurant_returns_expected_page_types(): void
    {
        $selector = new PatternSelector;

        $result = $selector->select('restaurant');

        $this->assertArrayHasKey('home', $result);
        $this->assertArrayHasKey('about', $result);
        $this->assertArrayHasKey('menu', $result);
        $this->assertArrayHasKey('services', $result);
        $this->assertArrayHasKey('contact', $result);
    }

    public function test_unknown_vertical_falls_back_to_local_service(): void
    {
        $selector = new PatternSelector;

        $result = $selector->select('unknown-vertical');

        $this->assertNotEmpty($result);
        $this->assertArrayHasKey('home', $result);
        $this->assertNotEmpty($result['home']);
    }

    public function test_every_page_type_returns_at_least_one_skeleton(): void
    {
        $selector = new PatternSelector;

        $result = $selector->select('restaurant');

        foreach (['home', 'about', 'menu', 'services', 'contact'] as $pageType) {
            $this->assertGreaterThanOrEqual(1, count($result[$pageType]), "{$pageType} returned no skeletons");
        }
    }

    public function test_hero_layout_override_still_works(): void
    {
        $selector = new PatternSelector;

        $result = $selector->select('restaurant', 'split');

        $heroId = $result['home'][0]['id'];
        $this->assertEquals('hero-split', $heroId);
    }

    public function test_pipe_delimited_alternatives_resolve_to_valid_skeleton(): void
    {
        // Create a temporary recipes file with pipe alternatives
        $recipes = [
            'restaurant' => [
                'home' => ['hero-cover | hero-split', 'about-story', 'testimonials-3col'],
            ],
        ];
        $recipesPath = tempnam(sys_get_temp_dir(), 'recipes_') . '.json';
        file_put_contents($recipesPath, json_encode($recipes));

        $registryPath = base_path('../pattern-library/skeleton-registry.json');
        $selector = new PatternSelector($registryPath, $recipesPath);
        $result = $selector->select('restaurant');

        // First skeleton should be one of the two hero variants
        $heroId = $result['home'][0]['id'];
        $this->assertContains($heroId, ['hero-cover', 'hero-split']);

        unlink($recipesPath);
    }

    public function test_plain_entries_still_work(): void
    {
        $selector = new PatternSelector();
        $result = $selector->select('restaurant');

        $this->assertNotEmpty($result['home']);
        $this->assertArrayHasKey('id', $result['home'][0]);
        $this->assertArrayHasKey('file', $result['home'][0]);
    }

    public function test_hero_layout_override_with_pipe_alternatives(): void
    {
        // Create a temporary recipes file with pipe alternatives in hero
        $recipes = [
            'restaurant' => [
                'home' => ['hero-cover | hero-split | hero-minimal', 'about-story'],
            ],
        ];
        $recipesPath = tempnam(sys_get_temp_dir(), 'recipes_') . '.json';
        file_put_contents($recipesPath, json_encode($recipes));

        $registryPath = base_path('../pattern-library/skeleton-registry.json');
        $selector = new PatternSelector($registryPath, $recipesPath);

        // Request specific hero layout - should override the random selection
        $result = $selector->select('restaurant', 'split');

        $heroId = $result['home'][0]['id'];
        $this->assertEquals('hero-split', $heroId);

        unlink($recipesPath);
    }
}
