<?php
/**
 * PressPilot Pattern Helper Functions
 * 
 * These functions handle placeholder replacement in patterns.
 * Patterns use placeholders that are replaced with AI-generated content.
 * 
 * @package PressPilot
 * @version 2.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Global variable to store pattern strings during generation
 */
global $presspilot_strings;
$presspilot_strings = array();

/**
 * Global variable to store pattern images during generation
 */
global $presspilot_images;
$presspilot_images = array();

/**
 * Set the strings for pattern generation
 * 
 * @param array $strings Associative array of slug => value pairs
 */
function presspilot_set_strings( $strings ) {
    global $presspilot_strings;
    $presspilot_strings = $strings;
}

/**
 * Set the images for pattern generation
 * 
 * @param array $images Associative array of slug => url pairs
 */
function presspilot_set_images( $images ) {
    global $presspilot_images;
    $presspilot_images = $images;
}

/**
 * Get a string value for a pattern placeholder
 * 
 * @param string $slug    The placeholder slug (e.g., 'hero/headline')
 * @param string $default The default value if no replacement is set
 * @return string The replacement value or default
 */
function presspilot_string( $slug, $default = '' ) {
    global $presspilot_strings;
    
    if ( isset( $presspilot_strings[ $slug ] ) && ! empty( $presspilot_strings[ $slug ] ) ) {
        return $presspilot_strings[ $slug ];
    }

    return $default;
}

/**
 * Get an image URL for a pattern placeholder
 * 
 * @param string $slug    The placeholder slug (e.g., 'hero/background')
 * @param string $default The default image URL
 * @return string The image URL
 */
function presspilot_image( $slug, $default = '' ) {
    global $presspilot_images;
    
    if ( isset( $presspilot_images[ $slug ] ) && ! empty( $presspilot_images[ $slug ] ) ) {
        return esc_url( $presspilot_images[ $slug ] );
    }
    
    return esc_url( $default );
}

/**
 * Generate a pattern with content replacements
 * 
 * @param string $pattern_file Path to the pattern PHP file
 * @param array  $strings      String replacements
 * @param array  $images       Image replacements
 * @return string The generated pattern markup
 */
function presspilot_generate_pattern( $pattern_file, $strings = array(), $images = array() ) {
    presspilot_set_strings( $strings );
    presspilot_set_images( $images );
    
    ob_start();
    include $pattern_file;
    $output = ob_get_clean();
    
    // Reset globals
    presspilot_set_strings( array() );
    presspilot_set_images( array() );
    
    return $output;
}

/**
 * Assemble multiple patterns into a complete template
 * 
 * @param array $patterns Array of pattern configurations
 * @return string Complete template markup
 */
function presspilot_assemble_template( $patterns ) {
    $output = '';
    
    foreach ( $patterns as $pattern ) {
        if ( ! isset( $pattern['file'] ) ) {
            continue;
        }
        
        $strings = isset( $pattern['strings'] ) ? $pattern['strings'] : array();
        $images  = isset( $pattern['images'] ) ? $pattern['images'] : array();
        
        $output .= presspilot_generate_pattern( $pattern['file'], $strings, $images );
        $output .= "\n\n";
    }
    
    return $output;
}

/**
 * Get placeholder image from Pexels based on category
 * 
 * @param string $category Image category (restaurant, business, nature, etc.)
 * @param string $size     Desired size (e.g., '1920x1080')
 * @return string Placeholder image URL
 */
function presspilot_placeholder_image( $category = 'business', $size = '1200x800' ) {
    // Using Pexels placeholder format
    // In production, this would call the Pexels API
    $dimensions = explode( 'x', $size );
    $width  = isset( $dimensions[0] ) ? intval( $dimensions[0] ) : 1200;
    $height = isset( $dimensions[1] ) ? intval( $dimensions[1] ) : 800;
    
    // Fallback to placeholder.com for development
    return sprintf(
        'https://via.placeholder.com/%dx%d/cccccc/666666?text=%s',
        $width,
        $height,
        urlencode( ucfirst( $category ) )
    );
}

/**
 * Get brand colors from theme.json settings
 * 
 * @return array Array of brand color values
 */
function presspilot_get_brand_colors() {
    $defaults = array(
        'primary'    => '#2563eb',
        'secondary'  => '#64748b',
        'accent'     => '#f59e0b',
        'background' => '#ffffff',
        'foreground' => '#1e293b',
    );
    
    // Try to get from theme.json if available
    if ( function_exists( 'wp_get_global_settings' ) ) {
        $settings = wp_get_global_settings();
        if ( isset( $settings['color']['palette']['theme'] ) ) {
            foreach ( $settings['color']['palette']['theme'] as $color ) {
                $slug = $color['slug'];
                if ( isset( $defaults[ $slug ] ) ) {
                    $defaults[ $slug ] = $color['color'];
                }
            }
        }
    }
    
    return $defaults;
}
