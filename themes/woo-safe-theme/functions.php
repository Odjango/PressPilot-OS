<?php
/**
 * PressPilot Golden V1 functions.
 *
 * @package woo-safe-theme
 */

if (!function_exists('woo_safe_theme_setup')) {
    /**
     * Theme setup.
     */
    function woo_safe_theme_setup()
    {
        // Core block theme supports.
        add_theme_support('wp-block-styles');
        add_theme_support('editor-styles');
        add_theme_support('responsive-embeds');
        add_theme_support('automatic-feed-links');

        // Navigation menu locations for the Navigation block UI.
        register_nav_menus(
            array(
                'primary' => __('Primary Menu', 'woo-safe-theme'),
            )
        );
    }
}
add_action('after_setup_theme', 'woo_safe_theme_setup');

/**
 * Enqueue front-end styles if needed.
 * Keep empty or minimal to encourage theme.json-driven styling.
 */
function woo_safe_theme_enqueue_styles()
{
    // Intentionally minimal: rely on theme.json for most styling.
    wp_enqueue_style(
        'woo-safe-theme-style',
        get_stylesheet_uri(),
        array(),
        wp_get_theme()->get('Version')
    );
}
add_action('wp_enqueue_scripts', 'woo_safe_theme_enqueue_styles');
