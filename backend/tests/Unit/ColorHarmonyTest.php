<?php

namespace Tests\Unit;

use App\Services\ColorHarmony;
use Tests\TestCase;

class ColorHarmonyTest extends TestCase
{
    private ColorHarmony $harmony;

    protected function setUp(): void
    {
        parent::setUp();
        $this->harmony = new ColorHarmony();
    }

    // --- HSL Conversion ---

    public function test_hex_to_hsl_red(): void
    {
        $hsl = $this->harmony->hexToHsl('#ff0000');
        $this->assertEquals(0, $hsl['h']);
        $this->assertEquals(100, $hsl['s']);
        $this->assertEquals(50, $hsl['l']);
    }

    public function test_hex_to_hsl_white(): void
    {
        $hsl = $this->harmony->hexToHsl('#ffffff');
        $this->assertEquals(0, $hsl['h']);
        $this->assertEquals(0, $hsl['s']);
        $this->assertEquals(100, $hsl['l']);
    }

    public function test_hex_to_hsl_and_back_roundtrip(): void
    {
        $colors = ['#1e3a5f', '#4a90d9', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6'];
        foreach ($colors as $hex) {
            $hsl = $this->harmony->hexToHsl($hex);
            $result = $this->harmony->hslToHex($hsl['h'], $hsl['s'], $hsl['l']);
            // Allow ±1 difference per channel due to rounding
            $this->assertColorClose($hex, $result, "Roundtrip failed for {$hex}");
        }
    }

    // --- Lightness Manipulation ---

    public function test_lighten_increases_lightness(): void
    {
        $original = '#1e3a5f';
        $lighter = $this->harmony->adjustLightness($original, 30);
        $origHsl = $this->harmony->hexToHsl($original);
        $lightHsl = $this->harmony->hexToHsl($lighter);
        $this->assertGreaterThan($origHsl['l'], $lightHsl['l']);
    }

    public function test_darken_decreases_lightness(): void
    {
        $original = '#4a90d9';
        $darker = $this->harmony->adjustLightness($original, -20);
        $origHsl = $this->harmony->hexToHsl($original);
        $darkHsl = $this->harmony->hexToHsl($darker);
        $this->assertLessThan($origHsl['l'], $darkHsl['l']);
    }

    public function test_lightness_clamps_to_0_100(): void
    {
        $light = $this->harmony->adjustLightness('#ffffff', 50);
        $dark = $this->harmony->adjustLightness('#000000', -50);
        $lightHsl = $this->harmony->hexToHsl($light);
        $darkHsl = $this->harmony->hexToHsl($dark);
        $this->assertLessThanOrEqual(100, $lightHsl['l']);
        $this->assertGreaterThanOrEqual(0, $darkHsl['l']);
    }

    // --- Saturation Manipulation ---

    public function test_desaturate_reduces_saturation(): void
    {
        $original = '#ff0000'; // fully saturated red
        $muted = $this->harmony->adjustSaturation($original, -40);
        $mutedHsl = $this->harmony->hexToHsl($muted);
        $this->assertLessThan(100, $mutedHsl['s']);
    }

    // --- Contrast Ratio ---

    public function test_contrast_ratio_black_white(): void
    {
        $ratio = $this->harmony->contrastRatio('#000000', '#ffffff');
        $this->assertEqualsWithDelta(21.0, $ratio, 0.1);
    }

    public function test_contrast_ratio_same_color(): void
    {
        $ratio = $this->harmony->contrastRatio('#336699', '#336699');
        $this->assertEqualsWithDelta(1.0, $ratio, 0.01);
    }

    public function test_ensure_contrast_adjusts_when_needed(): void
    {
        // Light yellow text on white background = bad contrast
        $adjusted = $this->harmony->ensureContrast('#ffffcc', '#ffffff', 4.5);
        $ratio = $this->harmony->contrastRatio($adjusted, '#ffffff');
        $this->assertGreaterThanOrEqual(4.5, $ratio);
    }

    // --- Palette Generation ---

    public function test_generate_derived_palette_returns_all_required_keys(): void
    {
        $palette = $this->harmony->generateDerivedPalette(
            primary: '#1e3a5f',
            secondary: '#4a90d9',
            accent: '#2ecc71',
            background: '#ffffff',
            foreground: '#333333'
        );

        $requiredKeys = [
            'tertiary', 'border', 'border-light', 'border-dark',
            'primary-accent', 'main-accent',
            'primary-background', 'secondary-background', 'tertiary-background',
            'base-background', 'main-background',
            'border-light-background', 'border-dark-background',
            'tertiary-border', 'border-light-border', 'primary-border', 'base-border',
            'icon', 'icon-background', 'link', 'text', 'inline',
        ];

        foreach ($requiredKeys as $key) {
            $this->assertArrayHasKey($key, $palette, "Missing derived color: {$key}");
            $this->assertMatchesRegularExpression('/^#[0-9a-f]{6}$/i', $palette[$key], "Invalid hex for {$key}");
        }
    }

    public function test_derived_palette_backgrounds_are_light(): void
    {
        $palette = $this->harmony->generateDerivedPalette(
            primary: '#1e3a5f',
            secondary: '#4a90d9',
            accent: '#2ecc71',
            background: '#ffffff',
            foreground: '#333333'
        );

        $bgKeys = ['primary-background', 'secondary-background', 'main-background', 'base-background'];
        foreach ($bgKeys as $key) {
            $hsl = $this->harmony->hexToHsl($palette[$key]);
            $this->assertGreaterThanOrEqual(85, $hsl['l'], "{$key} should be very light (L >= 85), got L={$hsl['l']}");
        }
    }

    public function test_derived_palette_borders_have_visible_contrast_against_background(): void
    {
        $palette = $this->harmony->generateDerivedPalette(
            primary: '#1e3a5f',
            secondary: '#4a90d9',
            accent: '#2ecc71',
            background: '#ffffff',
            foreground: '#333333'
        );

        // Borders should be visible against white background (ratio >= 1.3)
        $borderKeys = ['border', 'border-light', 'border-dark'];
        foreach ($borderKeys as $key) {
            $ratio = $this->harmony->contrastRatio($palette[$key], '#ffffff');
            $this->assertGreaterThanOrEqual(1.2, $ratio, "{$key} is invisible against white (ratio {$ratio})");
        }
    }

    public function test_warm_palette_stays_warm(): void
    {
        // Warm orange primary
        $palette = $this->harmony->generateDerivedPalette(
            primary: '#e67e22',
            secondary: '#d35400',
            accent: '#f39c12',
            background: '#fffaf5',
            foreground: '#2c1810'
        );

        // Tertiary should stay in the warm hue range (not drift to cool blue)
        $hsl = $this->harmony->hexToHsl($palette['tertiary']);
        // Warm hues: 0-60 or 300-360
        $isWarm = ($hsl['h'] >= 0 && $hsl['h'] <= 80) || ($hsl['h'] >= 300 && $hsl['h'] <= 360);
        $this->assertTrue($isWarm, "Tertiary hue {$hsl['h']} drifted to cool range");
    }

    // --- Helper ---

    private function assertColorClose(string $expected, string $actual, string $message = ''): void
    {
        $e = $this->hexToRgb($expected);
        $a = $this->hexToRgb($actual);
        $diff = abs($e['r'] - $a['r']) + abs($e['g'] - $a['g']) + abs($e['b'] - $a['b']);
        $this->assertLessThanOrEqual(5, $diff, $message . " (diff={$diff})");
    }

    private function hexToRgb(string $hex): array
    {
        $hex = ltrim($hex, '#');
        return [
            'r' => hexdec(substr($hex, 0, 2)),
            'g' => hexdec(substr($hex, 2, 2)),
            'b' => hexdec(substr($hex, 4, 2)),
        ];
    }
}
