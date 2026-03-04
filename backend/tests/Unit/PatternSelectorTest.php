<?php

namespace Tests\Unit;

use App\Services\PatternSelector;
use Tests\TestCase;

class PatternSelectorTest extends TestCase
{
    public function test_restaurant_home_page_prefers_tove_patterns(): void
    {
        $selector = new PatternSelector;

        $result = $selector->selectForPage('home', 'restaurant', 'modern');

        $this->assertNotEmpty($result);
        $this->assertGreaterThanOrEqual(4, count($result));
        $this->assertTrue($this->containsCore($result, 'tove'));
    }

    public function test_corporate_minimal_prefers_frost_or_ollie(): void
    {
        $selector = new PatternSelector;

        $result = $selector->selectForPage('home', 'corporate', 'minimal');

        $this->assertNotEmpty($result);
        $this->assertGreaterThanOrEqual(4, count($result));
        $this->assertTrue($this->containsCore($result, 'frost') || $this->containsCore($result, 'ollie'));
    }

    public function test_unknown_vertical_falls_back_to_ollie_patterns(): void
    {
        $selector = new PatternSelector;

        $result = $selector->selectForPage('home', 'unknown-vertical', 'modern');

        $this->assertNotEmpty($result);
        $this->assertGreaterThanOrEqual(4, count($result));
        $this->assertTrue($this->containsCore($result, 'ollie'));
        $this->assertFalse($this->containsCore($result, 'tove'));
    }

    public function test_every_page_type_returns_at_least_four_patterns(): void
    {
        $selector = new PatternSelector;
        $pageTypes = ['home', 'about', 'services', 'contact', 'blog'];

        foreach ($pageTypes as $pageType) {
            $result = $selector->selectForPage($pageType, 'general', 'modern');
            $this->assertGreaterThanOrEqual(4, count($result), "{$pageType} returned fewer than 4 patterns");
        }
    }

    /**
     * @param  array<int, string>  $patternIds
     */
    private function containsCore(array $patternIds, string $core): bool
    {
        foreach ($patternIds as $patternId) {
            if (str_starts_with($patternId, $core.'/')) {
                return true;
            }
        }

        return false;
    }
}
