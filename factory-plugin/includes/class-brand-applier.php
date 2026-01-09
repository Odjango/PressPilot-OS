<?php
/**
 * Brand Applier - Applies colors, fonts, logo via global styles
 *
 * @package PressPilot_Factory
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class PressPilot_Factory_Brand_Applier {

    private $variations_dir;

    public function __construct() {
        $this->variations_dir = PRESSPILOT_FACTORY_VARIATIONS;
    }

    /**
     * Apply brand settings
     */
    public function apply( $params ) {
        $colors = $params['colors'] ?? [];
        $fonts = $params['fonts'] ?? [];
        $logo = $params['logo'] ?? '';
        $variation = $params['variation'] ?? 'original';

        // Apply variation first
        $this->apply_variation( $variation, $params );

        // Apply custom colors
        if ( ! empty( $colors ) ) {
            $this->apply_colors( $colors );
        }

        // Apply fonts
        if ( ! empty( $fonts ) ) {
            $this->apply_fonts( $fonts );
        }

        // Apply logo
        if ( ! empty( $logo ) ) {
            $this->apply_logo( $logo, $params['business_name'] ?? '' );
        }

        // Store applied branding
        update_option( 'presspilot_applied_branding', [
            'colors'    => $colors,
            'fonts'     => $fonts,
            'logo'      => $logo,
            'variation' => $variation,
            'timestamp' => current_time( 'mysql' ),
        ]);
    }

    /**
     * Apply color variation
     */
    private function apply_variation( $variation, $params ) {
        $file = $this->variations_dir . $variation . '.json';

        if ( ! file_exists( $file ) ) {
            return;
        }

        $variation_data = json_decode( file_get_contents( $file ), true );

        if ( empty( $variation_data ) ) {
            return;
        }

        // Merge variation colors with provided colors
        if ( isset( $variation_data['colors'] ) && empty( $params['colors'] ) ) {
            $this->apply_colors( $variation_data['colors'] );
        }

        // Apply variation-specific styles
        if ( isset( $variation_data['styles'] ) ) {
            $this->apply_global_styles( $variation_data['styles'] );
        }
    }

    /**
     * Apply colors to global styles
     */
    public function apply_colors( $colors ) {
        $palette = [];

        $color_map = [
            'primary'    => [ 'slug' => 'primary', 'name' => 'Primary' ],
            'secondary'  => [ 'slug' => 'secondary', 'name' => 'Secondary' ],
            'accent'     => [ 'slug' => 'accent', 'name' => 'Accent' ],
            'background' => [ 'slug' => 'base', 'name' => 'Base' ],
            'text'       => [ 'slug' => 'contrast', 'name' => 'Contrast' ],
            'surface'    => [ 'slug' => 'surface', 'name' => 'Surface' ],
        ];

        foreach ( $colors as $key => $value ) {
            if ( isset( $color_map[ $key ] ) ) {
                $palette[] = [
                    'slug'  => $color_map[ $key ]['slug'],
                    'name'  => $color_map[ $key ]['name'],
                    'color' => sanitize_hex_color( $value ),
                ];
            }
        }

        // Add surface color if not provided
        if ( ! isset( $colors['surface'] ) && isset( $colors['background'] ) ) {
            $palette[] = [
                'slug'  => 'surface',
                'name'  => 'Surface',
                'color' => $this->adjust_brightness( $colors['background'], -5 ),
            ];
        }

        // Update global styles
        $this->update_theme_color_palette( $palette );
    }

    /**
     * Apply fonts to global styles
     */
    public function apply_fonts( $fonts ) {
        $heading_font = $fonts['heading'] ?? 'Inter';
        $body_font = $fonts['body'] ?? 'Inter';

        $font_families = [
            [
                'slug'       => 'heading',
                'name'       => 'Heading',
                'fontFamily' => $this->get_font_stack( $heading_font ),
                'fontFace'   => $this->get_google_font_face( $heading_font ),
            ],
            [
                'slug'       => 'body',
                'name'       => 'Body',
                'fontFamily' => $this->get_font_stack( $body_font ),
                'fontFace'   => $this->get_google_font_face( $body_font ),
            ],
        ];

        $this->update_theme_font_families( $font_families );
    }

    /**
     * Get font stack for a font name
     */
    private function get_font_stack( $font_name ) {
        $fallbacks = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif';
        return "'{$font_name}', {$fallbacks}";
    }

    /**
     * Get Google Font face definition
     */
    private function get_google_font_face( $font_name ) {
        $weights = [ '400', '500', '600', '700' ];
        $faces = [];

        foreach ( $weights as $weight ) {
            $faces[] = [
                'fontFamily' => $font_name,
                'fontStyle'  => 'normal',
                'fontWeight' => $weight,
                'src'        => [
                    sprintf(
                        'https://fonts.gstatic.com/s/%s/v1/%s.woff2',
                        strtolower( str_replace( ' ', '', $font_name ) ),
                        $weight
                    ),
                ],
            ];
        }

        return $faces;
    }

    /**
     * Apply logo
     */
    private function apply_logo( $logo_url, $business_name ) {
        // Download and add to media library if external URL
        $attachment_id = $this->maybe_sideload_image( $logo_url, $business_name . ' Logo' );

        if ( $attachment_id ) {
            // Set as custom logo
            set_theme_mod( 'custom_logo', $attachment_id );

            // Store for later use
            update_option( 'presspilot_logo_id', $attachment_id );
        }

        // Also set site icon if square
        $this->maybe_set_site_icon( $attachment_id );
    }

    /**
     * Sideload image to media library
     */
    private function maybe_sideload_image( $url, $description = '' ) {
        if ( empty( $url ) ) {
            return 0;
        }

        // Check if already in media library
        $existing = attachment_url_to_postid( $url );
        if ( $existing ) {
            return $existing;
        }

        // Download external image
        require_once ABSPATH . 'wp-admin/includes/media.php';
        require_once ABSPATH . 'wp-admin/includes/file.php';
        require_once ABSPATH . 'wp-admin/includes/image.php';

        $tmp = download_url( $url );

        if ( is_wp_error( $tmp ) ) {
            return 0;
        }

        $file_array = [
            'name'     => basename( $url ),
            'tmp_name' => $tmp,
        ];

        $attachment_id = media_handle_sideload( $file_array, 0, $description );

        if ( is_wp_error( $attachment_id ) ) {
            @unlink( $tmp );
            return 0;
        }

        // Mark as generated
        update_post_meta( $attachment_id, '_presspilot_generated', true );

        return $attachment_id;
    }

    /**
     * Maybe set site icon
     */
    private function maybe_set_site_icon( $attachment_id ) {
        if ( ! $attachment_id ) {
            return;
        }

        $metadata = wp_get_attachment_metadata( $attachment_id );

        if ( ! $metadata ) {
            return;
        }

        // Check if roughly square
        $width = $metadata['width'] ?? 0;
        $height = $metadata['height'] ?? 0;

        if ( $width > 0 && $height > 0 ) {
            $ratio = $width / $height;
            if ( $ratio >= 0.8 && $ratio <= 1.2 ) {
                update_option( 'site_icon', $attachment_id );
            }
        }
    }

    /**
     * Update theme color palette in global styles
     */
    private function update_theme_color_palette( $palette ) {
        // Get current global styles
        $global_styles = wp_get_global_styles();

        // This would typically update the theme.json or custom user global styles
        // For now, we store in options and let theme handle it
        update_option( 'presspilot_color_palette', $palette );

        // Also create CSS custom properties
        $css = ':root {' . "\n";
        foreach ( $palette as $color ) {
            $css .= sprintf(
                '  --wp--preset--color--%s: %s;' . "\n",
                $color['slug'],
                $color['color']
            );
        }
        $css .= '}';

        update_option( 'presspilot_custom_css', $css );
    }

    /**
     * Update theme font families
     */
    private function update_theme_font_families( $font_families ) {
        update_option( 'presspilot_font_families', $font_families );

        // Generate Google Fonts import
        $fonts_to_load = [];
        foreach ( $font_families as $font ) {
            if ( ! empty( $font['fontFace'] ) ) {
                $font_name = str_replace( ' ', '+', $font['fontFace'][0]['fontFamily'] ?? '' );
                if ( $font_name ) {
                    $fonts_to_load[] = $font_name . ':wght@400;500;600;700';
                }
            }
        }

        if ( ! empty( $fonts_to_load ) ) {
            $import_url = 'https://fonts.googleapis.com/css2?family=' . implode( '&family=', array_unique( $fonts_to_load ) ) . '&display=swap';
            update_option( 'presspilot_google_fonts_url', $import_url );
        }
    }

    /**
     * Apply global styles
     */
    private function apply_global_styles( $styles ) {
        update_option( 'presspilot_global_styles', $styles );
    }

    /**
     * Adjust color brightness
     */
    private function adjust_brightness( $hex, $percent ) {
        $hex = ltrim( $hex, '#' );

        $r = hexdec( substr( $hex, 0, 2 ) );
        $g = hexdec( substr( $hex, 2, 2 ) );
        $b = hexdec( substr( $hex, 4, 2 ) );

        $r = max( 0, min( 255, $r + ( $r * $percent / 100 ) ) );
        $g = max( 0, min( 255, $g + ( $g * $percent / 100 ) ) );
        $b = max( 0, min( 255, $b + ( $b * $percent / 100 ) ) );

        return sprintf( '#%02x%02x%02x', $r, $g, $b );
    }

    /**
     * Generate theme.json compatible settings
     */
    public function get_theme_json_settings() {
        $palette = get_option( 'presspilot_color_palette', [] );
        $fonts = get_option( 'presspilot_font_families', [] );

        return [
            'settings' => [
                'color' => [
                    'palette' => $palette,
                ],
                'typography' => [
                    'fontFamilies' => $fonts,
                ],
            ],
        ];
    }
}
