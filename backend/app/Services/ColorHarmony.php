<?php

namespace App\Services;

class ColorHarmony
{
    /**
     * Convert hex color to HSL.
     * @return array{h: int, s: int, l: int}  h: 0-360, s: 0-100, l: 0-100
     */
    public function hexToHsl(string $hex): array
    {
        $hex = ltrim($hex, '#');
        if (strlen($hex) === 3) {
            $hex = $hex[0].$hex[0].$hex[1].$hex[1].$hex[2].$hex[2];
        }

        $r = hexdec(substr($hex, 0, 2)) / 255;
        $g = hexdec(substr($hex, 2, 2)) / 255;
        $b = hexdec(substr($hex, 4, 2)) / 255;

        $max = max($r, $g, $b);
        $min = min($r, $g, $b);
        $l = ($max + $min) / 2;

        if ($max === $min) {
            $h = $s = 0;
        } else {
            $d = $max - $min;
            $s = $l > 0.5 ? $d / (2 - $max - $min) : $d / ($max + $min);

            $h = match ($max) {
                $r => (($g - $b) / $d + ($g < $b ? 6 : 0)) / 6,
                $g => (($b - $r) / $d + 2) / 6,
                $b => (($r - $g) / $d + 4) / 6,
            };
        }

        return [
            'h' => (int) round($h * 360),
            's' => (int) round($s * 100),
            'l' => (int) round($l * 100),
        ];
    }

    /**
     * Convert HSL to hex.
     */
    public function hslToHex(int $h, int $s, int $l): string
    {
        $h = $h / 360;
        $s = $s / 100;
        $l = $l / 100;

        if ($s === 0.0) {
            $r = $g = $b = $l;
        } else {
            $q = $l < 0.5 ? $l * (1 + $s) : $l + $s - $l * $s;
            $p = 2 * $l - $q;
            $r = $this->hueToRgb($p, $q, $h + 1/3);
            $g = $this->hueToRgb($p, $q, $h);
            $b = $this->hueToRgb($p, $q, $h - 1/3);
        }

        return sprintf('#%02x%02x%02x',
            (int) round($r * 255),
            (int) round($g * 255),
            (int) round($b * 255)
        );
    }

    private function hueToRgb(float $p, float $q, float $t): float
    {
        if ($t < 0) $t += 1;
        if ($t > 1) $t -= 1;
        if ($t < 1/6) return $p + ($q - $p) * 6 * $t;
        if ($t < 1/2) return $q;
        if ($t < 2/3) return $p + ($q - $p) * (2/3 - $t) * 6;
        return $p;
    }

    /**
     * Adjust lightness by a delta (-100 to +100).
     */
    public function adjustLightness(string $hex, int $delta): string
    {
        $hsl = $this->hexToHsl($hex);
        $hsl['l'] = max(0, min(100, $hsl['l'] + $delta));
        return $this->hslToHex($hsl['h'], $hsl['s'], $hsl['l']);
    }

    /**
     * Adjust saturation by a delta (-100 to +100).
     */
    public function adjustSaturation(string $hex, int $delta): string
    {
        $hsl = $this->hexToHsl($hex);
        $hsl['s'] = max(0, min(100, $hsl['s'] + $delta));
        return $this->hslToHex($hsl['h'], $hsl['s'], $hsl['l']);
    }

    /**
     * Set lightness to an absolute value (0-100) while preserving hue and saturation.
     */
    public function setLightness(string $hex, int $lightness): string
    {
        $hsl = $this->hexToHsl($hex);
        return $this->hslToHex($hsl['h'], $hsl['s'], max(0, min(100, $lightness)));
    }

    /**
     * Set saturation to an absolute value while preserving hue and lightness.
     */
    public function setSaturation(string $hex, int $saturation): string
    {
        $hsl = $this->hexToHsl($hex);
        return $this->hslToHex($hsl['h'], max(0, min(100, $saturation)), $hsl['l']);
    }

    /**
     * Calculate WCAG 2.1 contrast ratio between two colors.
     * @return float  Ratio from 1.0 (same) to 21.0 (black/white)
     */
    public function contrastRatio(string $hex1, string $hex2): float
    {
        $l1 = $this->relativeLuminance($hex1);
        $l2 = $this->relativeLuminance($hex2);

        $lighter = max($l1, $l2);
        $darker = min($l1, $l2);

        return ($lighter + 0.05) / ($darker + 0.05);
    }

    /**
     * Darken a foreground color until it meets the target contrast ratio against background.
     */
    public function ensureContrast(string $foreground, string $background, float $targetRatio = 4.5): string
    {
        $current = $foreground;
        $hsl = $this->hexToHsl($current);

        // Try darkening first (up to 50 steps)
        for ($i = 0; $i < 50; $i++) {
            $ratio = $this->contrastRatio($current, $background);
            if ($ratio >= $targetRatio) {
                return $current;
            }
            $hsl['l'] = max(0, $hsl['l'] - 2);
            $current = $this->hslToHex($hsl['h'], $hsl['s'], $hsl['l']);
        }

        return $current;
    }

    private function relativeLuminance(string $hex): float
    {
        $hex = ltrim($hex, '#');
        $r = hexdec(substr($hex, 0, 2)) / 255;
        $g = hexdec(substr($hex, 2, 2)) / 255;
        $b = hexdec(substr($hex, 4, 2)) / 255;

        $r = $r <= 0.03928 ? $r / 12.92 : (($r + 0.055) / 1.055) ** 2.4;
        $g = $g <= 0.03928 ? $g / 12.92 : (($g + 0.055) / 1.055) ** 2.4;
        $b = $b <= 0.03928 ? $b / 12.92 : (($b + 0.055) / 1.055) ** 2.4;

        return 0.2126 * $r + 0.7152 * $g + 0.0722 * $b;
    }

    /**
     * Generate all derived palette colors from 5 brand inputs using HSL manipulation.
     *
     * IMPORTANT: Returns the SAME slug keys as ThemeAssembler::$fullPalette currently uses.
     * This is a drop-in replacement — do NOT add or remove keys.
     *
     * @return array<string, string>  slug => hex color
     */
    public function generateDerivedPalette(
        string $primary,
        string $secondary,
        string $accent,
        string $background,
        string $foreground,
    ): array {
        $primaryHsl = $this->hexToHsl($primary);
        $bgHsl = $this->hexToHsl($background);
        $fgHsl = $this->hexToHsl($foreground);
        $isLightBg = $bgHsl['l'] >= 50;

        // --- Tertiary: a subtle tint of primary (very light, low saturation) ---
        // Keep primary's hue, drop saturation heavily, push lightness very high
        $tertiaryL = $isLightBg ? 93 : 15;
        $tertiaryS = max(5, (int)($primaryHsl['s'] * 0.25));
        $tertiary = $this->hslToHex($primaryHsl['h'], $tertiaryS, $tertiaryL);

        // --- Borders: tinted with primary hue, moderate to light ---
        $borderLightL = $isLightBg ? 88 : 25;
        $borderDarkL = $isLightBg ? 75 : 40;
        $borderL = $isLightBg ? 82 : 30;
        $borderS = max(5, (int)($primaryHsl['s'] * 0.20));

        $border = $this->hslToHex($primaryHsl['h'], $borderS, $borderL);
        $borderLight = $this->hslToHex($primaryHsl['h'], $borderS, $borderLightL);
        $borderDark = $this->hslToHex($primaryHsl['h'], $borderS + 5, $borderDarkL);

        // --- Accent variants ---
        $primaryAccentL = $isLightBg ? 90 : 18;
        $primaryAccent = $this->hslToHex($primaryHsl['h'], max(8, (int)($primaryHsl['s'] * 0.30)), $primaryAccentL);

        $mainAccentL = $isLightBg ? min($fgHsl['l'] + 25, 65) : max($fgHsl['l'] - 20, 35);
        $mainAccent = $this->hslToHex($fgHsl['h'], max(5, (int)($fgHsl['s'] * 0.6)), $mainAccentL);

        // --- Background variants: very light tints preserving original hue ---
        $primaryBg = $this->hslToHex($primaryHsl['h'], max(5, (int)($primaryHsl['s'] * 0.15)), $isLightBg ? 96 : 8);
        $secondaryBg = $this->hslToHex(
            $this->hexToHsl($secondary)['h'],
            max(5, (int)($this->hexToHsl($secondary)['s'] * 0.15)),
            $isLightBg ? 96 : 8
        );
        $tertiaryBg = $this->hslToHex($primaryHsl['h'], max(3, (int)($primaryHsl['s'] * 0.10)), $isLightBg ? 97 : 6);
        $mainBg = $this->hslToHex($fgHsl['h'], max(2, (int)($fgHsl['s'] * 0.08)), $isLightBg ? 97 : 6);
        $borderLightBg = $this->hslToHex($primaryHsl['h'], max(3, (int)($primaryHsl['s'] * 0.08)), $isLightBg ? 95 : 10);
        $borderDarkBg = $this->hslToHex($primaryHsl['h'], max(3, (int)($primaryHsl['s'] * 0.12)), $isLightBg ? 92 : 14);

        // --- Border variants for has-*-border-color ---
        $baseBorderL = $isLightBg ? 90 : 20;
        $baseBorder = $this->hslToHex($bgHsl['h'], max(2, $bgHsl['s']), $baseBorderL);

        // --- Icon colors ---
        $iconBg = $this->hslToHex($primaryHsl['h'], max(5, (int)($primaryHsl['s'] * 0.15)), $isLightBg ? 95 : 10);

        return [
            'tertiary'              => $tertiary,
            'border'                => $border,
            'border-light'          => $borderLight,
            'border-dark'           => $borderDark,
            'primary-accent'        => $primaryAccent,
            'main-accent'           => $mainAccent,
            'primary-background'    => $primaryBg,
            'secondary-background'  => $secondaryBg,
            'tertiary-background'   => $tertiaryBg,
            'base-background'       => $background,
            'main-background'       => $mainBg,
            'border-light-background' => $borderLightBg,
            'border-dark-background'  => $borderDarkBg,
            'tertiary-border'       => $tertiary,
            'border-light-border'   => $borderLight,
            'primary-border'        => $primary,
            'base-border'           => $baseBorder,
            'icon'                  => $primary,
            'icon-background'       => $iconBg,
            'link'                  => $primary,
            'text'                  => $foreground,
            'inline'                => $foreground,
        ];
    }
}
