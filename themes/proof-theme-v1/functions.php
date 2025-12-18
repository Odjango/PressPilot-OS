<?php
/**
 * PressPilot Golden V1 functions.
 *
 * @package proof-theme-v1
 */

if (!function_exists('proof_theme_v1_setup')) {
    /**
     * Theme setup.
     */
    function proof_theme_v1_setup()
    {
        // Core block theme supports.
        add_theme_support('wp-block-styles');
        add_theme_support('editor-styles');
        add_theme_support('responsive-embeds');
        add_theme_support('automatic-feed-links');

        // Navigation menu locations for the Navigation block UI.
        register_nav_menus(
            array(
                'primary' => __('Primary Menu', 'proof-theme-v1'),
            )
        );
    }
}
add_action('after_setup_theme', 'proof_theme_v1_setup');

/**
 * Enqueue front-end styles if needed.
 * Keep empty or minimal to encourage theme.json-driven styling.
 */
function proof_theme_v1_enqueue_styles()
{
    // Intentionally minimal: rely on theme.json for most styling.
    wp_enqueue_style(
        'proof-theme-v1-style',
        get_stylesheet_uri(),
        array(),
        wp_get_theme()->get('Version')
    );
}
add_action('wp_enqueue_scripts', 'proof_theme_v1_enqueue_styles');
