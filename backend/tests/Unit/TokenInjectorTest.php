<?php

namespace Tests\Unit;

use App\Exceptions\MissingTokenException;
use App\Services\TokenInjector;
use Tests\TestCase;

class TokenInjectorTest extends TestCase
{
    public function test_injects_tokens_into_hero_light_pattern(): void
    {
        $injector = new TokenInjector;
        $patternPath = base_path('../pattern-library/tokenized/ollie/hero-light.php');

        $tokens = [
            'HERO_TITLE' => 'Roma Pizza',
            'HERO_TEXT' => 'Authentic Italian restaurant in NYC',
            'HERO_CTA' => 'Reserve a Table',
            'HERO_CTA_SECONDARY' => 'View Menu',
            'IMAGE_HERO' => 'https://images.example.com/hero.jpg',
        ];

        $output = $injector->inject($patternPath, $tokens, array_keys($tokens));

        $this->assertStringContainsString('Roma Pizza', $output);
        $this->assertStringNotContainsString('{{', $output);
        $this->assertStringNotContainsString('}}', $output);
    }

    public function test_missing_required_token_throws_exception(): void
    {
        $injector = new TokenInjector;
        $patternPath = base_path('../pattern-library/tokenized/ollie/hero-light.php');

        $this->expectException(MissingTokenException::class);

        $injector->inject($patternPath, [
            'HERO_TITLE' => 'Roma Pizza',
        ], ['HERO_TITLE', 'HERO_TEXT']);
    }

    public function test_escapes_text_tokens(): void
    {
        $injector = new TokenInjector;
        $patternPath = base_path('../pattern-library/tokenized/ollie/hero-light.php');

        $tokens = [
            'HERO_TITLE' => 'Roma & Sons <Best>',
            'HERO_TEXT' => "Chef's specials",
            'HERO_CTA' => 'Book Now',
            'HERO_CTA_SECONDARY' => 'View Menu',
            'IMAGE_HERO' => 'https://images.example.com/hero.jpg',
        ];

        $output = $injector->inject($patternPath, $tokens, array_keys($tokens));

        $this->assertStringContainsString('Roma &amp; Sons &lt;Best&gt;', $output);
        $this->assertStringContainsString('Chef&#039;s specials', $output);
    }

    public function test_block_comment_json_is_unchanged(): void
    {
        $injector = new TokenInjector;
        $patternPath = base_path('../pattern-library/tokenized/ollie/hero-light.php');
        $original = file_get_contents($patternPath);

        $tokens = [
            'HERO_TITLE' => 'Roma Pizza',
            'HERO_TEXT' => 'Authentic Italian restaurant in NYC',
            'HERO_CTA' => 'Reserve a Table',
            'HERO_CTA_SECONDARY' => 'View Menu',
            'IMAGE_HERO' => 'https://images.example.com/hero.jpg',
        ];

        $output = $injector->inject($patternPath, $tokens, array_keys($tokens));

        $this->assertSame($this->extractBlockComments($original), $this->extractBlockComments($output));
    }

    /**
     * @return array<int, string>
     */
    private function extractBlockComments(string $contents): array
    {
        preg_match_all('/<!--\s*wp:[^>]+-->/m', $contents, $matches);

        return $matches[0] ?? [];
    }
}
