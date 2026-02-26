<?php
/**
 * PressPilot Content Handler
 * 
 * Manages placeholder replacement for patterns.
 * Based on QuickWP architecture - AI generates JSON, we replace content.
 * Block structure NEVER changes, only content inside placeholders.
 *
 * @package PressPilot
 */

namespace PressPilot;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Content_Handler {

    /**
     * Content data from AI generation.
     *
     * @var array
     */
    private static $content = array();

    /**
     * Images data from AI/Pexels.
     *
     * @var array
     */
    private static $images = array();

    /**
     * Brand colors.
     *
     * @var array
     */
    private static $brand_colors = array(
        'primary'   => '#1e40af',
        'secondary' => '#64748b',
        'accent'    => '#f59e0b',
    );

    /**
     * Business info.
     *
     * @var array
     */
    private static $business = array(
        'name'    => 'Business Name',
        'tagline' => 'Your tagline here',
        'phone'   => '(555) 123-4567',
        'email'   => 'hello@example.com',
        'address' => '123 Main Street, City, State 12345',
        'hours'   => array(
            'weekdays' => '9:00 AM - 9:00 PM',
            'weekend'  => '10:00 AM - 10:00 PM',
        ),
    );

    /**
     * Initialize content from AI-generated JSON.
     *
     * @param array $data AI-generated content data.
     */
    public static function init( array $data ) {
        if ( isset( $data['strings'] ) ) {
            self::$content = $data['strings'];
        }
        if ( isset( $data['images'] ) ) {
            self::$images = $data['images'];
        }
        if ( isset( $data['brand_colors'] ) ) {
            self::$brand_colors = array_merge( self::$brand_colors, $data['brand_colors'] );
        }
        if ( isset( $data['business'] ) ) {
            self::$business = array_merge( self::$business, $data['business'] );
        }
    }

    /**
     * Get a string by slug with fallback to default.
     *
     * @param string $slug    The placeholder slug (e.g., 'hero-centered/title').
     * @param string $default Default value if not found.
     * @return string
     */
    public static function get_string( string $slug, string $default = '' ): string {
        if ( isset( self::$content[ $slug ] ) && ! empty( self::$content[ $slug ] ) ) {
            return esc_html( self::$content[ $slug ] );
        }
        return esc_html( $default );
    }

    /**
     * Get an image URL by slug.
     *
     * @param string $slug    The image slug.
     * @param string $default Default URL if not found.
     * @return string
     */
    public static function get_image( string $slug, string $default = '' ): string {
        if ( isset( self::$images[ $slug ] ) && ! empty( self::$images[ $slug ] ) ) {
            return esc_url( self::$images[ $slug ] );
        }
        return esc_url( $default );
    }

    /**
     * Get brand color.
     *
     * @param string $type Color type (primary, secondary, accent).
     * @return string
     */
    public static function get_color( string $type = 'primary' ): string {
        return self::$brand_colors[ $type ] ?? self::$brand_colors['primary'];
    }

    /**
     * Get all brand colors.
     *
     * @return array
     */
    public static function get_colors(): array {
        return self::$brand_colors;
    }

    /**
     * Get business info.
     *
     * @param string $key Optional specific key.
     * @return mixed
     */
    public static function get_business( string $key = '' ) {
        if ( empty( $key ) ) {
            return self::$business;
        }
        return self::$business[ $key ] ?? '';
    }

    /**
     * Get PressPilot footer credit.
     *
     * @return string
     */
    public static function get_footer_credit(): string {
        $business_name = self::get_business( 'name' );
        $year = date( 'Y' );
        return sprintf(
            '© %s %s. Powered by <a href="https://presspilot.io" target="_blank" rel="noopener">PressPilot</a>',
            $year,
            esc_html( $business_name )
        );
    }

    /**
     * Process a pattern file and replace all placeholders.
     *
     * @param string $pattern_path Path to pattern file.
     * @return string Processed pattern content.
     */
    public static function process_pattern( string $pattern_path ): string {
        if ( ! file_exists( $pattern_path ) ) {
            return '';
        }

        ob_start();
        include $pattern_path;
        return ob_get_clean();
    }

    /**
     * Generate menu items HTML for restaurant patterns.
     *
     * @param array $items Menu items from AI.
     * @return string
     */
    public static function generate_menu_items( array $items ): string {
        $output = '';
        
        foreach ( $items as $item ) {
            $name = esc_html( $item['name'] ?? 'Menu Item' );
            $description = esc_html( $item['description'] ?? '' );
            $price = esc_html( $item['price'] ?? '$0' );
            
            $output .= <<<HTML
<!-- wp:group {"className":"menu-item","layout":{"type":"flex","justifyContent":"space-between","flexWrap":"nowrap"}} -->
<div class="wp-block-group menu-item">
    <!-- wp:group {"layout":{"type":"constrained"}} -->
    <div class="wp-block-group">
        <!-- wp:heading {"level":4,"style":{"spacing":{"margin":{"bottom":"0"}}}} -->
        <h4 style="margin-bottom:0">{$name}</h4>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"style":{"typography":{"fontSize":"0.9rem"},"color":{"text":"#6b7280"}}} -->
        <p style="font-size:0.9rem;color:#6b7280">{$description}</p>
        <!-- /wp:paragraph -->
    </div>
    <!-- /wp:group -->
    <!-- wp:paragraph {"style":{"typography":{"fontWeight":"600"}}} -->
    <p style="font-weight:600">{$price}</p>
    <!-- /wp:paragraph -->
</div>
<!-- /wp:group -->

HTML;
        }
        
        return $output;
    }
}

/**
 * Helper function for patterns - get string.
 *
 * @param string $slug    Placeholder slug.
 * @param string $default Default value.
 * @return string
 */
function presspilot_string( string $slug, string $default = '' ): string {
    return Content_Handler::get_string( $slug, $default );
}

/**
 * Helper function for patterns - get image.
 *
 * @param string $slug    Image slug.
 * @param string $default Default URL.
 * @return string
 */
function presspilot_image( string $slug, string $default = '' ): string {
    return Content_Handler::get_image( $slug, $default );
}

/**
 * Helper function - get business info.
 *
 * @param string $key Info key.
 * @return mixed
 */
function presspilot_business( string $key = '' ) {
    return Content_Handler::get_business( $key );
}

/**
 * Helper function - get footer credit.
 *
 * @return string
 */
function presspilot_footer_credit(): string {
    return Content_Handler::get_footer_credit();
}
