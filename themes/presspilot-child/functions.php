<?php
/**
 * PressPilot FSE Theme Functions
 */

if (!defined('ABSPATH')) {
    exit;
}

function presspilot_clean_setup()
{
    // Add support for block styles
    add_theme_support('wp-block-styles');
    add_theme_support('editor-styles');
    add_editor_style('style.css');
}
add_action('after_setup_theme', 'presspilot_clean_setup');

/**
 * Register Pattern Categories
 */
function presspilot_register_pattern_categories()
{
    register_block_pattern_category(
        'presspilot',
        array('label' => __('PressPilot', 'presspilot'))
    );
}
add_action('init', 'presspilot_register_pattern_categories');

/**
 * Site Identity Setup (Generates Title/Logo on activation)
 */
$presspilot_activator = get_stylesheet_directory() . '/inc/activator.php';
if (file_exists($presspilot_activator)) {
    require_once $presspilot_activator;
}

/**
 * PRESSPILOT OVEN INTAKE (Ported from FSE v2)
 * Receives JSON Recipe from n8n and updates Global Styles + Nukes Ghost Templates.
 */
add_action('rest_api_init', function () {
    register_rest_route('presspilot/v1', '/bake', [
        'methods' => 'POST',
        'callback' => 'presspilot_handle_baking_child',
        'permission_callback' => '__return_true',
    ]);
});

function presspilot_handle_baking_child($request)
{
    $recipe = $request->get_json_params();

    // 0. NUCLEAR CLEANUP: Remove ALL ghost template parts AND Pages
    // This runs on the Active Theme (PressPilot Child) to kill 'Test Pizza' ghosts.
    wp_cache_flush();

    // A. Delete Template Parts (Headers/Footers)
    $ghost_parts = get_posts([
        'post_type' => 'wp_template_part',
        'post_status' => ['publish', 'draft', 'auto-draft', 'trash'],
        'numberposts' => -1,
    ]);
    foreach ($ghost_parts as $part) {
        wp_delete_post($part->ID, true);
    }

    // B. Delete Pages (Home/About/etc) - Force Fallback to FSE Templates
    $ghost_pages = get_posts([
        'post_type' => 'page',
        'post_status' => ['publish', 'draft', 'auto-draft', 'trash'],
        'numberposts' => -1,
    ]);
    foreach ($ghost_pages as $page) {
        wp_delete_post($page->ID, true);
    }

    // C. Delete Customized Templates (The "Ception" Killer)
    // If a template was edited in Site Editor, it lives here and blocks file changes.
    $ghost_templates = get_posts([
        'post_type' => 'wp_template',
        'post_status' => ['publish', 'draft', 'auto-draft', 'trash'],
        'numberposts' => -1,
    ]);
    foreach ($ghost_templates as $template) {
        wp_delete_post($template->ID, true);
    }

    // D. [REMOVED] Reset 'show_on_front' - We will set it dynamically below
    // update_option('show_on_front', 'posts');
    // update_option('page_on_front', 0);

    // 4. INJECT HOME PAGE CONTENT (The "Hydration" Step)
    if (isset($recipe['full_site_content']) && !empty($recipe['full_site_content'])) {
        $home_page_id = wp_insert_post([
            'post_type' => 'page',
            'post_title' => isset($recipe['site_title']) ? $recipe['site_title'] : 'Home',
            'post_content' => $recipe['full_site_content'],
            'post_status' => 'publish',
            'post_slug' => 'home',
        ]);

        if ($home_page_id) {
            update_option('show_on_front', 'page');
            update_option('page_on_front', $home_page_id);
        }
    } else {
        // Fallback if no content provided: Show Posts
        update_option('show_on_front', 'posts');
        update_option('page_on_front', 0);
    }

    // 1. Update Site Title
    if (isset($recipe['site_title'])) {
        update_option('blogname', sanitize_text_field($recipe['site_title']) . ' [UPDATED]');
    }

    // 2. Map Colors to Global Styles Structure
    $styles = [
        'version' => 3,
        'isGlobalStylesUserThemeJSON' => true,
        'settings' => [
            'color' => [
                'palette' => [
                    'theme' => [
                        [
                            'slug' => 'brand-primary',
                            'color' => $recipe['colors']['primary'] ?? '#000000',
                            'name' => 'Primary'
                        ],
                        [
                            'slug' => 'brand-secondary',
                            'color' => $recipe['colors']['secondary'] ?? '#ffffff',
                            'name' => 'Secondary'
                        ]
                    ]
                ]
            ]
        ]
    ];

    // 3. Save to wp_global_styles Custom Post Type
    $recent_posts = wp_get_recent_posts([
        'post_type' => 'wp_global_styles',
        'numberposts' => 1,
        'post_status' => 'publish'
    ]);

    $content = json_encode($styles);

    if (empty($recent_posts)) {
        wp_insert_post([
            'post_type' => 'wp_global_styles',
            'post_status' => 'publish',
            'post_title' => 'Custom Styles',
            'post_content' => $content
        ]);
    } else {
        wp_update_post([
            'ID' => $recent_posts[0]['ID'],
            'post_content' => $content
        ]);
    }

    return new WP_REST_Response(['status' => 'baked_in_child'], 200);
}
