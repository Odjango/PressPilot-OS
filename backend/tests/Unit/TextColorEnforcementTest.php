<?php

namespace Tests\Unit;

use App\Services\TokenInjector;
use Tests\TestCase;

class TextColorEnforcementTest extends TestCase
{
    private TokenInjector $injector;

    protected function setUp(): void
    {
        parent::setUp();
        $this->injector = new TokenInjector();
    }

    /** @test */
    public function it_strips_primary_textcolor_from_normal_paragraph(): void
    {
        $html = <<<HTML
<!-- wp:paragraph {"textColor":"primary"} -->
<p class="has-primary-color has-text-color">This is a normal body paragraph.</p>
<!-- /wp:paragraph -->
HTML;

        $result = $this->injector->enforceTextColorRules($html);

        // textColor attribute should be removed
        $this->assertStringNotContainsString('"textColor":"primary"', $result);
        // has-primary-color class should be removed
        $this->assertStringNotContainsString('has-primary-color', $result);
        // Utility classes like has-text-color should remain
        $this->assertStringContainsString('has-text-color', $result);
    }

    /** @test */
    public function it_preserves_base_textcolor(): void
    {
        $html = <<<HTML
<!-- wp:paragraph {"textColor":"base"} -->
<p class="has-base-color has-text-color">This paragraph has base color.</p>
<!-- /wp:paragraph -->
HTML;

        $result = $this->injector->enforceTextColorRules($html);

        // base textColor should be preserved
        $this->assertStringContainsString('"textColor":"base"', $result);
        $this->assertStringContainsString('has-base-color', $result);
    }

    /** @test */
    public function it_preserves_foreground_textcolor(): void
    {
        $html = <<<HTML
<!-- wp:paragraph {"textColor":"foreground"} -->
<p class="has-foreground-color has-text-color">This paragraph has foreground color.</p>
<!-- /wp:paragraph -->
HTML;

        $result = $this->injector->enforceTextColorRules($html);

        // foreground textColor should be preserved
        $this->assertStringContainsString('"textColor":"foreground"', $result);
        $this->assertStringContainsString('has-foreground-color', $result);
    }

    /** @test */
    public function it_preserves_brand_color_on_small_eyebrow_paragraph(): void
    {
        $html = <<<HTML
<!-- wp:paragraph {"fontSize":"small","textColor":"primary"} -->
<p class="has-small-font-size has-primary-color has-text-color">Featured Product</p>
<!-- /wp:paragraph -->
HTML;

        $result = $this->injector->enforceTextColorRules($html);

        // Small eyebrow paragraphs should keep their brand color
        $this->assertStringContainsString('"textColor":"primary"', $result);
        $this->assertStringContainsString('has-primary-color', $result);
    }

    /** @test */
    public function it_preserves_brand_color_on_price_paragraph(): void
    {
        $html = <<<HTML
<!-- wp:paragraph {"textColor":"secondary"} -->
<p class="has-secondary-color has-text-color">$49.99</p>
<!-- /wp:paragraph -->
HTML;

        $result = $this->injector->enforceTextColorRules($html);

        // Price paragraphs should keep their brand color
        $this->assertStringContainsString('"textColor":"secondary"', $result);
        $this->assertStringContainsString('has-secondary-color', $result);
    }

    /** @test */
    public function it_handles_price_with_currency_at_end(): void
    {
        $html = <<<HTML
<!-- wp:paragraph {"textColor":"accent"} -->
<p class="has-accent-color has-text-color">99 USD</p>
<!-- /wp:paragraph -->
HTML;

        $result = $this->injector->enforceTextColorRules($html);

        // Price paragraphs should keep their brand color
        $this->assertStringContainsString('"textColor":"accent"', $result);
        $this->assertStringContainsString('has-accent-color', $result);
    }

    /** @test */
    public function it_strips_brand_color_from_paragraph_without_attributes(): void
    {
        $html = <<<HTML
<!-- wp:paragraph {} -->
<p class="has-primary-color has-text-color">Body text with brand color class.</p>
<!-- /wp:paragraph -->
HTML;

        $result = $this->injector->enforceTextColorRules($html);

        // has-primary-color class should be removed even when textColor attribute is absent
        $this->assertStringNotContainsString('has-primary-color', $result);
        $this->assertStringContainsString('has-text-color', $result);
    }

    /** @test */
    public function it_handles_x_small_eyebrow_fontSize(): void
    {
        $html = <<<HTML
<!-- wp:paragraph {"fontSize":"x-small","textColor":"secondary"} -->
<p class="has-x-small-font-size has-secondary-color has-text-color">Label</p>
<!-- /wp:paragraph -->
HTML;

        $result = $this->injector->enforceTextColorRules($html);

        // x-small eyebrow paragraphs should keep their brand color
        $this->assertStringContainsString('"textColor":"secondary"', $result);
        $this->assertStringContainsString('has-secondary-color', $result);
    }

    /** @test */
    public function it_preserves_paragraph_without_color(): void
    {
        $html = <<<HTML
<!-- wp:paragraph {"align":"center"} -->
<p class="has-text-align-center">Plain paragraph.</p>
<!-- /wp:paragraph -->
HTML;

        $result = $this->injector->enforceTextColorRules($html);

        // Should remain unchanged
        $this->assertEquals($html, $result);
    }

    /** @test */
    public function it_handles_multiple_paragraphs_with_mixed_rules(): void
    {
        $html = <<<HTML
<!-- wp:paragraph {"textColor":"primary"} -->
<p class="has-primary-color has-text-color">Normal body text.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"fontSize":"small","textColor":"accent"} -->
<p class="has-small-font-size has-accent-color has-text-color">Small label</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"textColor":"base"} -->
<p class="has-base-color has-text-color">Base color paragraph.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"textColor":"secondary"} -->
<p class="has-secondary-color has-text-color">$29.99</p>
<!-- /wp:paragraph -->
HTML;

        $result = $this->injector->enforceTextColorRules($html);

        // First paragraph: brand color removed
        $this->assertStringNotContainsString('has-primary-color', $result);

        // Second paragraph: small eyebrow keeps brand color
        $lines = explode("\n", $result);
        $smallLabelLine = array_filter($lines, fn($l) => str_contains($l, 'Small label'));
        $this->assertNotEmpty($smallLabelLine);

        // Third paragraph: base color preserved
        $this->assertStringContainsString('"textColor":"base"', $result);
        $this->assertStringContainsString('has-base-color', $result);

        // Fourth paragraph: price keeps brand color
        $priceLines = array_filter($lines, fn($l) => str_contains($l, '$29.99'));
        $this->assertNotEmpty($priceLines);
    }
}
