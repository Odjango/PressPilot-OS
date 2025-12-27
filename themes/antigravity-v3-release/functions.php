<?php
/**
 * PressPilot Golden V1 functions.
 *
 * @package antigravity-v3-release
 */

if (!function_exists('antigravity_v3_release_setup')) {
    /**
     * Theme setup.
     */
    function antigravity_v3_release_setup()
    {
        // Core block theme supports.
        add_theme_support('wp-block-styles');
        add_theme_support('editor-styles');
        add_theme_support('responsive-embeds');
        add_theme_support('automatic-feed-links');

        // Navigation menu locations for the Navigation block UI.
        register_nav_menus(
            array(
                'primary' => __('Primary Menu', 'antigravity-v3-release'),
            )
        );
    }
}
add_action('after_setup_theme', 'antigravity_v3_release_setup');

/**
 * Enqueue front-end styles if needed.
 * Keep empty or minimal to encourage theme.json-driven styling.
 */
function antigravity_v3_release_enqueue_styles()
{
    // Intentionally minimal: rely on theme.json for most styling.
    wp_enqueue_style(
        'antigravity-v3-release-style',
        get_stylesheet_uri(),
        array(),
        wp_get_theme()->get('Version')
    );
}
add_action('wp_enqueue_scripts', 'antigravity_v3_release_enqueue_styles');
