<?php
/**
 * PressPilot Golden Foundation helpers.
 */

if (!defined('ABSPATH')) {
    exit;
}

// Register menu locations (ensure "primary" exists)
function presspilot_register_menus()
{
    register_nav_menus(
        array(
            'primary' => __('Primary menu', 'presspilot'),
        )
    );
}
add_action('after_setup_theme', 'presspilot_register_menus');

// Load activation bootstrap module
require_once get_stylesheet_directory() . '/inc/presspilot-activate.php';

// Run activation bootstrap on theme activation
add_action('after_switch_theme', 'presspilot_run_activation_bootstrap');

// Optionally, also run once on first admin load if the flag isn't set
function presspilot_maybe_run_activation_bootstrap()
{
    if (!get_option('presspilot_activation_v1_done')) {
        presspilot_run_activation_bootstrap();
    }
}
add_action('admin_init', 'presspilot_maybe_run_activation_bootstrap');

// Manual trigger via admin URL for debugging
function presspilot_maybe_manual_bootstrap()
{
    if (!is_admin()) {
        return;
    }

    if (!current_user_can('manage_options')) {
        return;
    }

    // phpcs:ignore WordPress.Security.NonceVerification.Recommended
    if (empty($_GET['presspilot_bootstrap'])) {
        return;
    }

    if (!function_exists('presspilot_run_activation_bootstrap')) {
        return;
    }

    // Force rerun by passing true
    presspilot_run_activation_bootstrap(true);
}
add_action('admin_init', 'presspilot_maybe_manual_bootstrap');

if (!function_exists('presspilot_apply_brand_identity')) {
    add_action('after_switch_theme', 'presspilot_apply_brand_identity');

    function presspilot_apply_brand_identity()
    {
        $kit_path = get_theme_file_path('presspilot-kit.json');
        if (!file_exists($kit_path)) {
            return;
        }

        $contents = file_get_contents($kit_path);
        $data = json_decode($contents, true);

        if (!is_array($data)) {
            return;
        }

        if (!empty($data['brandName'])) {
            update_option('blogname', sanitize_text_field($data['brandName']));
        }

        if (!empty($data['tagline'])) {
            update_option('blogdescription', sanitize_text_field($data['tagline']));
        }
    }
}


function presspilot_setup_fse_navigation()
{
    // Check if the menu already exists to ensure idempotency.
    $existing_nav = get_posts(array(
        'post_type' => 'wp_navigation',
        'title' => 'Main Menu',
        'fields' => 'ids',
        'numberposts' => 1,
    ));

    if (!empty($existing_nav)) {
        return $existing_nav[0]; // Return existing ID
    }

    // Define the content for the navigation post.
    // Using page-list as a default dynamic menu
    $nav_content = '<!-- wp:page-list /-->';

    // Insert the post.
    $nav_post_id = wp_insert_post(array(
        'import_id' => 1000, // Force ID to match header template
        'post_title' => 'Main Menu',
        'post_name' => 'main-menu-fse-nav',
        'post_content' => $nav_content,
        'post_status' => 'publish',
        'post_type' => 'wp_navigation',
    ), true);

    if (!is_wp_error($nav_post_id)) {
        return $nav_post_id;
    }

    return false;
}
add_action('after_switch_theme', 'presspilot_setup_fse_navigation');

/**
 * Universal function to create required pages on theme activation.
 */
function presspilot_create_required_pages()
{
    // Universal set of pages to create: [ 'Page Title' => 'page-slug' ]
    $pages_to_create = array(
        'Home' => 'home',
        'About' => 'about',
        'Services' => 'services',
        'Menu' => 'menu',
        'Blog' => 'blog',
        'Contact' => 'contact'
    );

    foreach ($pages_to_create as $page_title => $page_slug) {
        // Check if the page already exists (by slug)
        if (!get_page_by_path($page_slug)) {
            $page_data = array(
                'post_type' => 'page',
                'post_title' => $page_title,
                'post_name' => $page_slug,
                'post_content' => 'This is the ' . $page_title . ' page.',
                'post_status' => 'publish',
                'post_author' => 1
            );
            wp_insert_post($page_data);
        }
    }

    // Set 'Home' as the static front page and 'Blog' as the posts page.
    $home_page = get_page_by_path('home');
    $blog_page = get_page_by_path('blog');

    if ($home_page) {
        update_option('page_on_front', $home_page->ID);
        update_option('show_on_front', 'page');
    }
    if ($blog_page) {
        update_option('page_for_posts', $blog_page->ID);
    }
}
// Hook runs when ANY PressPilot theme is activated.
add_action('after_switch_theme', 'presspilot_create_required_pages');
