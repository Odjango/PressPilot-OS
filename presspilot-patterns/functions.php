<?php
/**
 * PressPilot Theme Functions
 *
 * Pattern-based FSE theme using QuickWP architecture.
 * AI generates content JSON, patterns are pre-validated - NEVER generate raw block markup.
 *
 * @package PressPilot
 */

namespace PressPilot;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Include content handler class
require_once get_template_directory() . '/inc/class-content-handler.php';

/**
 * Theme setup.
 */
function theme_setup() {
    // Add theme support
    add_theme_support( 'wp-block-styles' );
    add_theme_support( 'editor-styles' );
    add_theme_support( 'responsive-embeds' );
    add_theme_support( 'html5', array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script' ) );
    
    // WooCommerce support if installed
    add_theme_support( 'woocommerce' );
    add_theme_support( 'wc-product-gallery-zoom' );
    add_theme_support( 'wc-product-gallery-lightbox' );
    add_theme_support( 'wc-product-gallery-slider' );

    // Register navigation menus
    register_nav_menus( array(
        'primary'   => __( 'Primary Menu', 'presspilot' ),
        'footer'    => __( 'Footer Menu', 'presspilot' ),
    ) );
}
add_action( 'after_setup_theme', __NAMESPACE__ . '\\theme_setup' );

/**
 * Enqueue editor styles.
 */
function enqueue_styles() {
    // Enqueue Google Fonts
    wp_enqueue_style(
        'presspilot-fonts',
        'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap',
        array(),
        null
    );
}
add_action( 'wp_enqueue_scripts', __NAMESPACE__ . '\\enqueue_styles' );
add_action( 'enqueue_block_editor_assets', __NAMESPACE__ . '\\enqueue_styles' );

/**
 * Register block patterns.
 */
function register_block_patterns() {
    // Register pattern category
    register_block_pattern_category(
        'presspilot',
        array( 'label' => __( 'PressPilot', 'presspilot' ) )
    );

    register_block_pattern_category(
        'presspilot-headers',
        array( 'label' => __( 'Headers', 'presspilot' ) )
    );

    register_block_pattern_category(
        'presspilot-heroes',
        array( 'label' => __( 'Heroes', 'presspilot' ) )
    );

    register_block_pattern_category(
        'presspilot-features',
        array( 'label' => __( 'Features', 'presspilot' ) )
    );

    register_block_pattern_category(
        'presspilot-testimonials',
        array( 'label' => __( 'Testimonials', 'presspilot' ) )
    );

    register_block_pattern_category(
        'presspilot-cta',
        array( 'label' => __( 'Call to Action', 'presspilot' ) )
    );

    register_block_pattern_category(
        'presspilot-restaurant',
        array( 'label' => __( 'Restaurant', 'presspilot' ) )
    );

    register_block_pattern_category(
        'presspilot-ecommerce',
        array( 'label' => __( 'E-Commerce', 'presspilot' ) )
    );

    register_block_pattern_category(
        'presspilot-footers',
        array( 'label' => __( 'Footers', 'presspilot' ) )
    );

    // Pattern definitions - slug maps to file in /patterns/
    $patterns = array(
        // Headers
        'headers/centered-logo' => array(
            'title'       => __( 'Centered Logo Header', 'presspilot' ),
            'categories'  => array( 'presspilot', 'presspilot-headers', 'header' ),
            'blockTypes'  => array( 'core/template-part/header' ),
        ),
        
        // Heroes
        'heroes/cover-cta' => array(
            'title'       => __( 'Cover Hero with CTA', 'presspilot' ),
            'categories'  => array( 'presspilot', 'presspilot-heroes', 'featured' ),
        ),
        'heroes/split-image' => array(
            'title'       => __( 'Split Hero with Image', 'presspilot' ),
            'categories'  => array( 'presspilot', 'presspilot-heroes', 'featured' ),
        ),
        
        // Features
        'features/icon-grid-3' => array(
            'title'       => __( '3-Column Feature Grid', 'presspilot' ),
            'categories'  => array( 'presspilot', 'presspilot-features' ),
        ),
        
        // Testimonials
        'testimonials/grid-3' => array(
            'title'       => __( '3-Column Testimonial Grid', 'presspilot' ),
            'categories'  => array( 'presspilot', 'presspilot-testimonials' ),
        ),
        
        // CTA
        'cta/banner-centered' => array(
            'title'       => __( 'Centered CTA Banner', 'presspilot' ),
            'categories'  => array( 'presspilot', 'presspilot-cta' ),
        ),
        
        // Restaurant
        'restaurant/menu-categories' => array(
            'title'       => __( 'Restaurant Menu with Categories', 'presspilot' ),
            'categories'  => array( 'presspilot', 'presspilot-restaurant' ),
        ),
        'restaurant/chef-highlight' => array(
            'title'       => __( 'Chef Highlight', 'presspilot' ),
            'categories'  => array( 'presspilot', 'presspilot-restaurant' ),
        ),
        'restaurant/hours-location' => array(
            'title'       => __( 'Hours & Location', 'presspilot' ),
            'categories'  => array( 'presspilot', 'presspilot-restaurant' ),
        ),
        
        // E-Commerce
        'ecommerce/featured-product' => array(
            'title'       => __( 'Featured Product Hero', 'presspilot' ),
            'categories'  => array( 'presspilot', 'presspilot-ecommerce', 'featured' ),
        ),
        'ecommerce/product-grid' => array(
            'title'       => __( 'Product Grid', 'presspilot' ),
            'categories'  => array( 'presspilot', 'presspilot-ecommerce' ),
        ),
        'ecommerce/categories' => array(
            'title'       => __( 'Category Showcase', 'presspilot' ),
            'categories'  => array( 'presspilot', 'presspilot-ecommerce' ),
        ),
        'ecommerce/sale-banner' => array(
            'title'       => __( 'Sale Banner', 'presspilot' ),
            'categories'  => array( 'presspilot', 'presspilot-ecommerce' ),
        ),
        
        // Footers
        'footers/restaurant' => array(
            'title'       => __( 'Restaurant Footer', 'presspilot' ),
            'categories'  => array( 'presspilot', 'presspilot-footers', 'footer' ),
            'blockTypes'  => array( 'core/template-part/footer' ),
        ),
    );

    foreach ( $patterns as $slug => $pattern ) {
        $pattern_file = get_template_directory() . '/patterns/' . $slug . '.php';
        
        if ( file_exists( $pattern_file ) ) {
            ob_start();
            include $pattern_file;
            $content = ob_get_clean();

            register_block_pattern(
                'presspilot/' . str_replace( '/', '-', $slug ),
                array_merge(
                    $pattern,
                    array( 'content' => $content )
                )
            );
        }
    }
}
add_action( 'init', __NAMESPACE__ . '\\register_block_patterns' );

/**
 * Initialize theme with AI-generated content.
 *
 * Called by Factory Plugin with JSON from AI.
 *
 * @param array $content_json AI-generated content.
 */
function initialize_with_content( array $content_json ) {
    Content_Handler::init( $content_json );
}

/**
 * Generate complete theme from content JSON.
 *
 * This is the main entry point for the Factory Plugin.
 *
 * @param array $content_json AI-generated content.
 * @return string Path to generated theme ZIP.
 */
function generate_theme( array $content_json ): string {
    // Initialize content handler
    Content_Handler::init( $content_json );

    // Get selected patterns
    $patterns = $content_json['selected_patterns'] ?? array();
    
    // Get brand colors for theme.json
    $colors = $content_json['brand_colors'] ?? array();
    
    // Get business info
    $business = $content_json['business'] ?? array();
    
    // Theme slug from business name
    $theme_slug = sanitize_title( $business['name'] ?? 'custom-theme' );
    
    // Generate theme files
    $theme_dir = WP_CONTENT_DIR . '/themes/' . $theme_slug;
    
    // Create theme directory
    if ( ! file_exists( $theme_dir ) ) {
        wp_mkdir_p( $theme_dir );
    }
    
    // Copy base files
    copy_theme_files( get_template_directory(), $theme_dir );
    
    // Generate customized theme.json with brand colors
    generate_theme_json( $theme_dir, $colors );
    
    // Generate templates from selected patterns
    generate_templates( $theme_dir, $patterns );
    
    // Generate style.css with theme info
    generate_style_css( $theme_dir, $business );
    
    // Create ZIP
    $zip_path = create_theme_zip( $theme_dir, $theme_slug );
    
    return $zip_path;
}

/**
 * Copy theme files to new theme directory.
 */
function copy_theme_files( string $source, string $dest ) {
    $iterator = new \RecursiveIteratorIterator(
        new \RecursiveDirectoryIterator( $source, \RecursiveDirectoryIterator::SKIP_DOTS ),
        \RecursiveIteratorIterator::SELF_FIRST
    );
    
    foreach ( $iterator as $item ) {
        $target = $dest . DIRECTORY_SEPARATOR . $iterator->getSubPathname();
        if ( $item->isDir() ) {
            wp_mkdir_p( $target );
        } else {
            copy( $item, $target );
        }
    }
}

/**
 * Generate customized theme.json with brand colors.
 */
function generate_theme_json( string $theme_dir, array $colors ) {
    $theme_json_path = $theme_dir . '/theme.json';
    $theme_json = json_decode( file_get_contents( $theme_json_path ), true );
    
    // Update colors in palette
    foreach ( $theme_json['settings']['color']['palette'] as &$color_def ) {
        if ( $color_def['slug'] === 'primary' && isset( $colors['primary'] ) ) {
            $color_def['color'] = $colors['primary'];
        }
        if ( $color_def['slug'] === 'secondary' && isset( $colors['secondary'] ) ) {
            $color_def['color'] = $colors['secondary'];
        }
        if ( $color_def['slug'] === 'accent' && isset( $colors['accent'] ) ) {
            $color_def['color'] = $colors['accent'];
        }
    }
    
    file_put_contents(
        $theme_json_path,
        json_encode( $theme_json, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES )
    );
}

/**
 * Generate templates from selected patterns.
 */
function generate_templates( string $theme_dir, array $patterns ) {
    $templates_dir = $theme_dir . '/templates';
    wp_mkdir_p( $templates_dir );
    
    // Build index.html from selected patterns
    $content = "<!-- wp:template-part {\"slug\":\"header\",\"tagName\":\"header\"} /-->\n\n";
    
    foreach ( $patterns as $pattern_slug ) {
        if ( strpos( $pattern_slug, 'headers/' ) === 0 || strpos( $pattern_slug, 'footers/' ) === 0 ) {
            continue; // Skip headers/footers - they're template parts
        }
        
        $pattern_file = get_template_directory() . '/patterns/' . $pattern_slug . '.php';
        if ( file_exists( $pattern_file ) ) {
            ob_start();
            include $pattern_file;
            $content .= ob_get_clean() . "\n\n";
        }
    }
    
    $content .= "<!-- wp:template-part {\"slug\":\"footer\",\"tagName\":\"footer\"} /-->";
    
    file_put_contents( $templates_dir . '/index.html', $content );
    
    // Generate header template part
    $parts_dir = $theme_dir . '/parts';
    wp_mkdir_p( $parts_dir );
    
    foreach ( $patterns as $pattern_slug ) {
        if ( strpos( $pattern_slug, 'headers/' ) === 0 ) {
            $pattern_file = get_template_directory() . '/patterns/' . $pattern_slug . '.php';
            if ( file_exists( $pattern_file ) ) {
                ob_start();
                include $pattern_file;
                file_put_contents( $parts_dir . '/header.html', ob_get_clean() );
            }
        }
        if ( strpos( $pattern_slug, 'footers/' ) === 0 ) {
            $pattern_file = get_template_directory() . '/patterns/' . $pattern_slug . '.php';
            if ( file_exists( $pattern_file ) ) {
                ob_start();
                include $pattern_file;
                file_put_contents( $parts_dir . '/footer.html', ob_get_clean() );
            }
        }
    }
}

/**
 * Generate style.css with theme info.
 */
function generate_style_css( string $theme_dir, array $business ) {
    $theme_name = $business['name'] ?? 'Custom Theme';
    $theme_slug = sanitize_title( $theme_name );
    
    $css = <<<CSS
/*
Theme Name: {$theme_name}
Theme URI: https://presspilot.io
Author: PressPilot
Author URI: https://presspilot.io
Description: Custom FSE theme generated by PressPilot AI
Requires at least: 6.4
Tested up to: 6.7
Requires PHP: 7.4
Version: 1.0.0
License: GNU General Public License v2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html
Text Domain: {$theme_slug}
Tags: full-site-editing, block-themes, block-patterns

Generated by PressPilot - AI-powered WordPress theme generation.
https://presspilot.io
*/
CSS;

    file_put_contents( $theme_dir . '/style.css', $css );
}

/**
 * Create theme ZIP file.
 */
function create_theme_zip( string $theme_dir, string $theme_slug ): string {
    $zip_path = WP_CONTENT_DIR . '/uploads/presspilot/' . $theme_slug . '.zip';
    
    wp_mkdir_p( dirname( $zip_path ) );
    
    $zip = new \ZipArchive();
    if ( $zip->open( $zip_path, \ZipArchive::CREATE | \ZipArchive::OVERWRITE ) !== true ) {
        throw new \Exception( 'Cannot create ZIP file' );
    }
    
    $iterator = new \RecursiveIteratorIterator(
        new \RecursiveDirectoryIterator( $theme_dir, \RecursiveDirectoryIterator::SKIP_DOTS ),
        \RecursiveIteratorIterator::SELF_FIRST
    );
    
    foreach ( $iterator as $item ) {
        $path = $theme_slug . '/' . $iterator->getSubPathname();
        if ( $item->isDir() ) {
            $zip->addEmptyDir( $path );
        } else {
            $zip->addFile( $item, $path );
        }
    }
    
    $zip->close();
    
    return $zip_path;
}
