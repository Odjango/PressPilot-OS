<?php
/**
 * PressPilot Golden V1 functions.
 *
 * @package restaurant-nav-theme
 */

if (!function_exists('restaurant_nav_theme_setup')) {
    /**
     * Theme setup.
     */
    function restaurant_nav_theme_setup()
    {
        // Core block theme supports.
        add_theme_support('wp-block-styles');
        add_theme_support('editor-styles');
        add_theme_support('responsive-embeds');
        add_theme_support('automatic-feed-links');

        // Navigation menu locations for the Navigation block UI.
        register_nav_menus(
            array(
                'primary' => __('Primary Menu', 'restaurant-nav-theme'),
            )
        );
    }
}
add_action('after_setup_theme', 'restaurant_nav_theme_setup');

/**
 * Enqueue front-end styles if needed.
 * Keep empty or minimal to encourage theme.json-driven styling.
 */
function restaurant_nav_theme_enqueue_styles()
{
    // Intentionally minimal: rely on theme.json for most styling.
    wp_enqueue_style(
        'restaurant-nav-theme-style',
        get_stylesheet_uri(),
        array(),
        wp_get_theme()->get('Version')
    );
}
add_action('wp_enqueue_scripts', 'restaurant_nav_theme_enqueue_styles');
