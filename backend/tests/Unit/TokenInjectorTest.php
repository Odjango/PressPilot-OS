<?php

namespace Tests\Unit;

use App\Exceptions\BlockGrammarException;
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
        // Check no unresolved {{TOKEN}} placeholders remain (but allow }} in JSON)
        $this->assertDoesNotMatchRegularExpression('/\{\{\w+\}\}/', $output);
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

    public function test_image_url_with_query_params_preserves_block_json(): void
    {
        $injector = new TokenInjector();

        $html = <<<'HTML'
<!-- wp:cover {"url":"{{IMAGE_HERO}}"} -->
<div class="wp-block-cover"></div>
<!-- /wp:cover -->
HTML;

        $tokens = [
            'IMAGE_HERO' => 'https://example.com/image.jpg?w=1200&q=80',
        ];

        $result = $injector->injectTokens($html, $tokens);

        // Extract JSON from block comment
        preg_match('/<!-- wp:cover (\{[^}]*\}) -->/', $result, $matches);
        $this->assertNotEmpty($matches, 'Block comment JSON not found');

        $jsonStr = $matches[1];
        $decoded = json_decode($jsonStr);
        $this->assertNotNull($decoded, 'Block comment JSON is invalid: ' . json_last_error_msg());
        $this->assertStringContainsString('https://example.com/image.jpg?w=1200&q=80', $jsonStr);
    }

    public function test_text_token_in_html_is_escaped_but_not_in_block_json(): void
    {
        $injector = new TokenInjector();

        $html = <<<'HTML'
<!-- wp:paragraph -->
<p>{{HERO_TITLE}}</p>
<!-- /wp:paragraph -->
<!-- wp:cover {"title":"{{HERO_TITLE}}"} -->
<div class="wp-block-cover"></div>
<!-- /wp:cover -->
HTML;

        $tokens = [
            'HERO_TITLE' => 'Roma & Sons <Best>',
        ];

        $result = $injector->injectTokens($html, $tokens);

        // Check HTML content is escaped
        $this->assertStringContainsString('Roma &amp; Sons &lt;Best&gt;', $result);

        // Check JSON has the value escaped for JSON (no HTML entities)
        $this->assertStringContainsString('"title":"Roma & Sons <Best>"', $result);
    }

    public function test_nested_json_block_comment_stays_valid(): void
    {
        $injector = new TokenInjector();

        $html = <<<'HTML'
<!-- wp:cover {"url":"{{IMAGE_HERO}}","style":{"spacing":{"margin":{"top":"0"}}}} -->
<div class="wp-block-cover"></div>
<!-- /wp:cover -->
HTML;

        $tokens = [
            'IMAGE_HERO' => 'https://example.com/hero.jpg',
        ];

        $result = $injector->injectTokens($html, $tokens);

        // Extract nested JSON and validate
        preg_match('/<!-- wp:cover (\{.*?\}) -->/', $result, $matches);
        $this->assertNotEmpty($matches, 'Block comment with nested JSON not found');

        $jsonStr = $matches[1];
        $decoded = json_decode($jsonStr);
        $this->assertNotNull($decoded, 'Nested JSON is invalid: ' . json_last_error_msg());
        $this->assertObjectHasProperty('style', $decoded);
        $this->assertObjectHasProperty('spacing', $decoded->style);
    }

    public function test_validate_block_grammar_catches_nested_json_errors(): void
    {
        $injector = new TokenInjector();

        // Valid nested JSON
        $validHtml = <<<'HTML'
<!-- wp:cover {"url":"https://example.com/hero.jpg","style":{"spacing":{"margin":{"top":"0"}}}} -->
<div class="wp-block-cover"></div>
<!-- /wp:cover -->
HTML;

        $errors = $injector->validateBlockGrammar($validHtml);
        $this->assertEmpty($errors, 'Valid nested JSON should not produce errors');
    }

    public function test_validate_block_grammar_catches_broken_nested_json(): void
    {
        $injector = new TokenInjector();

        // Missing closing brace in nested structure
        $brokenHtml = <<<'HTML'
<!-- wp:cover {"url":"https://example.com/hero.jpg","style":{"spacing":{"margin":{"top":"0"}} -->
<div class="wp-block-cover"></div>
<!-- /wp:cover -->
HTML;

        $errors = $injector->validateBlockGrammar($brokenHtml);
        $this->assertNotEmpty($errors, 'Broken nested JSON should produce validation errors');
        $this->assertTrue(
            count(array_filter($errors, fn ($e) => str_contains($e, 'Invalid JSON') || str_contains($e, 'Unbalanced'))) > 0,
            'Error should mention JSON or braces: ' . implode('; ', $errors)
        );
    }

    public function test_process_skeletons_throws_on_block_grammar_errors(): void
    {
        $injector = new TokenInjector();

        $skeletonSelections = [
            'home' => [
                [
                    'id' => 'hero-cover',
                    'file' => 'tokenized/ollie/broken-hero.html',
                    'required_tokens' => [],
                ],
            ],
        ];

        $tokens = [];

        // Mock loadSkeleton to return broken HTML
        $mockInjector = $this->createPartialMock(TokenInjector::class, ['loadSkeleton']);
        $mockInjector->method('loadSkeleton')->willReturn(
            '<!-- wp:paragraph --><p>Unclosed paragraph'
        );

        $this->expectException(BlockGrammarException::class);
        $mockInjector->processSkeletons($skeletonSelections, $tokens);
    }
}
