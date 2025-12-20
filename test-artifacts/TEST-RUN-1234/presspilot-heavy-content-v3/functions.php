<?php
/**
 * PressPilot Golden V1 functions.
 *
 * @package presspilot-heavy-content-v3
 */

if (!function_exists('presspilot_heavy_content_v3_setup')) {
    /**
     * Theme setup.
     */
    function presspilot_heavy_content_v3_setup()
    {
        // Core block theme supports.
        add_theme_support('wp-block-styles');
        add_theme_support('editor-styles');
        add_theme_support('responsive-embeds');
        add_theme_support('automatic-feed-links');

        // Navigation menu locations for the Navigation block UI.
        register_nav_menus(
            array(
                'primary' => __('Primary Menu', 'presspilot-heavy-content-v3'),
            )
        );
    }
}
add_action('after_setup_theme', 'presspilot_heavy_content_v3_setup');

/**
 * Enqueue front-end styles if needed.
 * Keep empty or minimal to encourage theme.json-driven styling.
 */
function presspilot_heavy_content_v3_enqueue_styles()
{
    // Intentionally minimal: rely on theme.json for most styling.
    wp_enqueue_style(
        'presspilot-heavy-content-v3-style',
        get_stylesheet_uri(),
        array(),
        wp_get_theme()->get('Version')
    );
}
add_action('wp_enqueue_scripts', 'presspilot_heavy_content_v3_enqueue_styles');
