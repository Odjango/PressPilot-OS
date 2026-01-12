<?php
/**
 * Color Utils - WCAG-compliant color contrast utilities
 *
 * Ensures readable text colors based on background colors
 *
 * @package PressPilot_Factory
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class PressPilot_Factory_Color_Utils {

    /**
     * Get contrasting text color (black or white) for a background
     *
     * @param string $background_hex Background color in hex format
     * @return string '#ffffff' for dark backgrounds, '#1f2937' for light backgrounds
     */
    public static function get_contrast_color( $background_hex ) {
        $luminance = self::get_relative_luminance( $background_hex );

        // Use dark gray instead of pure black for softer appearance
        return $luminance > 0.179 ? '#1f2937' : '#ffffff';
    }

    /**
     * Get relative luminance of a color (0-1)
     * Based on WCAG 2.1 formula
     *
     * @param string $hex Color in hex format
     * @return float Relative luminance (0 = black, 1 = white)
     */
    public static function get_relative_luminance( $hex ) {
        $rgb = self::hex_to_rgb( $hex );

        if ( ! $rgb ) {
            return 0.5; // Default to middle if invalid
        }

        // Convert to sRGB
        $r = $rgb['r'] / 255;
        $g = $rgb['g'] / 255;
        $b = $rgb['b'] / 255;

        // Apply gamma correction
        $r = $r <= 0.03928 ? $r / 12.92 : pow( ( $r + 0.055 ) / 1.055, 2.4 );
        $g = $g <= 0.03928 ? $g / 12.92 : pow( ( $g + 0.055 ) / 1.055, 2.4 );
        $b = $b <= 0.03928 ? $b / 12.92 : pow( ( $b + 0.055 ) / 1.055, 2.4 );

        // Calculate luminance
        return 0.2126 * $r + 0.7152 * $g + 0.0722 * $b;
    }

    /**
     * Calculate contrast ratio between two colors
     * WCAG AA requires 4.5:1 for normal text, 3:1 for large text
     *
     * @param string $color1 First color in hex
     * @param string $color2 Second color in hex
     * @return float Contrast ratio (1 to 21)
     */
    public static function get_contrast_ratio( $color1, $color2 ) {
        $l1 = self::get_relative_luminance( $color1 );
        $l2 = self::get_relative_luminance( $color2 );

        // Ensure L1 is the lighter color
        $lighter = max( $l1, $l2 );
        $darker = min( $l1, $l2 );

        return ( $lighter + 0.05 ) / ( $darker + 0.05 );
    }

    /**
     * Check if color combination meets WCAG AA standards
     *
     * @param string $foreground Foreground color in hex
     * @param string $background Background color in hex
     * @param bool $large_text Whether this is large text (14pt bold or 18pt+)
     * @return bool True if contrast is sufficient
     */
    public static function meets_wcag_aa( $foreground, $background, $large_text = false ) {
        $ratio = self::get_contrast_ratio( $foreground, $background );
        $min_ratio = $large_text ? 3.0 : 4.5;

        return $ratio >= $min_ratio;
    }

    /**
     * Ensure a color meets minimum contrast against background
     * Returns the original color if sufficient, otherwise returns black or white
     *
     * @param string $foreground Desired foreground color
     * @param string $background Background color
     * @param float $min_ratio Minimum contrast ratio (default 4.5 for WCAG AA)
     * @return string Color that meets contrast requirements
     */
    public static function ensure_contrast( $foreground, $background, $min_ratio = 4.5 ) {
        $ratio = self::get_contrast_ratio( $foreground, $background );

        if ( $ratio >= $min_ratio ) {
            return $foreground;
        }

        // Return black or white based on background
        return self::get_contrast_color( $background );
    }

    /**
     * Convert hex color to RGB array
     *
     * @param string $hex Color in hex format (#RGB, #RRGGBB, RGB, or RRGGBB)
     * @return array|false RGB array with 'r', 'g', 'b' keys, or false if invalid
     */
    public static function hex_to_rgb( $hex ) {
        // Remove # if present
        $hex = ltrim( $hex, '#' );

        // Handle 3-character hex
        if ( strlen( $hex ) === 3 ) {
            $hex = $hex[0] . $hex[0] . $hex[1] . $hex[1] . $hex[2] . $hex[2];
        }

        // Validate
        if ( strlen( $hex ) !== 6 || ! ctype_xdigit( $hex ) ) {
            return false;
        }

        return [
            'r' => hexdec( substr( $hex, 0, 2 ) ),
            'g' => hexdec( substr( $hex, 2, 2 ) ),
            'b' => hexdec( substr( $hex, 4, 2 ) ),
        ];
    }

    /**
     * Convert RGB to hex color
     *
     * @param int $r Red (0-255)
     * @param int $g Green (0-255)
     * @param int $b Blue (0-255)
     * @return string Hex color with # prefix
     */
    public static function rgb_to_hex( $r, $g, $b ) {
        return sprintf( '#%02x%02x%02x', $r, $g, $b );
    }

    /**
     * Lighten a color by a percentage
     *
     * @param string $hex Color in hex format
     * @param float $percent Percentage to lighten (0-100)
     * @return string Lightened color in hex
     */
    public static function lighten( $hex, $percent ) {
        $rgb = self::hex_to_rgb( $hex );

        if ( ! $rgb ) {
            return $hex;
        }

        $factor = $percent / 100;

        $r = min( 255, round( $rgb['r'] + ( 255 - $rgb['r'] ) * $factor ) );
        $g = min( 255, round( $rgb['g'] + ( 255 - $rgb['g'] ) * $factor ) );
        $b = min( 255, round( $rgb['b'] + ( 255 - $rgb['b'] ) * $factor ) );

        return self::rgb_to_hex( $r, $g, $b );
    }

    /**
     * Darken a color by a percentage
     *
     * @param string $hex Color in hex format
     * @param float $percent Percentage to darken (0-100)
     * @return string Darkened color in hex
     */
    public static function darken( $hex, $percent ) {
        $rgb = self::hex_to_rgb( $hex );

        if ( ! $rgb ) {
            return $hex;
        }

        $factor = 1 - ( $percent / 100 );

        $r = max( 0, round( $rgb['r'] * $factor ) );
        $g = max( 0, round( $rgb['g'] * $factor ) );
        $b = max( 0, round( $rgb['b'] * $factor ) );

        return self::rgb_to_hex( $r, $g, $b );
    }

    /**
     * Check if a color is dark
     *
     * @param string $hex Color in hex format
     * @return bool True if the color is considered dark
     */
    public static function is_dark( $hex ) {
        return self::get_relative_luminance( $hex ) <= 0.179;
    }

    /**
     * Check if a color is light
     *
     * @param string $hex Color in hex format
     * @return bool True if the color is considered light
     */
    public static function is_light( $hex ) {
        return self::get_relative_luminance( $hex ) > 0.179;
    }

    /**
     * Generate a complete color palette with contrast-safe text colors
     *
     * @param array $base_colors Base colors (primary, secondary, accent, background)
     * @return array Extended palette with text colors
     */
    public static function generate_palette( $base_colors ) {
        $palette = $base_colors;

        // Add contrast-safe text colors for each background
        if ( isset( $base_colors['primary'] ) ) {
            $palette['primary_text'] = self::get_contrast_color( $base_colors['primary'] );
        }

        if ( isset( $base_colors['secondary'] ) ) {
            $palette['secondary_text'] = self::get_contrast_color( $base_colors['secondary'] );
        }

        if ( isset( $base_colors['accent'] ) ) {
            $palette['accent_text'] = self::get_contrast_color( $base_colors['accent'] );
        }

        if ( isset( $base_colors['background'] ) ) {
            $palette['background_text'] = self::get_contrast_color( $base_colors['background'] );
        }

        // Add light/dark variants
        if ( isset( $base_colors['primary'] ) ) {
            $palette['primary_light'] = self::lighten( $base_colors['primary'], 20 );
            $palette['primary_dark'] = self::darken( $base_colors['primary'], 20 );
        }

        return $palette;
    }
}
