<?php
/**
 * PressPilot Golden V1 functions.
 *
 * @package arabic-rtl-theme
 */

if (!function_exists('arabic_rtl_theme_setup')) {
    /**
     * Theme setup.
     */
    function arabic_rtl_theme_setup()
    {
        // Core block theme supports.
        add_theme_support('wp-block-styles');
        add_theme_support('editor-styles');
        add_theme_support('responsive-embeds');
        add_theme_support('automatic-feed-links');

        // Navigation menu locations for the Navigation block UI.
        register_nav_menus(
            array(
                'primary' => __('Primary Menu', 'arabic-rtl-theme'),
            )
        );
    }
}
add_action('after_setup_theme', 'arabic_rtl_theme_setup');

/**
 * Enqueue front-end styles if needed.
 * Keep empty or minimal to encourage theme.json-driven styling.
 */
function arabic_rtl_theme_enqueue_styles()
{
    // Intentionally minimal: rely on theme.json for most styling.
    wp_enqueue_style(
        'arabic-rtl-theme-style',
        get_stylesheet_uri(),
        array(),
        wp_get_theme()->get('Version')
    );
}
add_action('wp_enqueue_scripts', 'arabic_rtl_theme_enqueue_styles');
