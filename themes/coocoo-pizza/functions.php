<?php
/**
 * CooCoo Pizza Theme functions.
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Theme Configuration
 */
function coocoo_pizza_config()
{
    add_theme_support('menus');
    add_theme_support('post-thumbnails');
    add_theme_support('automatic-feed-links');
    add_theme_support('title-tag');
    add_theme_support('block-templates');
}
add_action('after_setup_theme', 'coocoo_pizza_config');

/**
 * Register Patterns
 */
function coocoo_pizza_register_patterns()
{
    register_block_pattern('presspilot/home-hero', array(
        'title' => 'Home Hero',
        'categories' => array('featured'),
        'content' => file_get_contents(__DIR__ . '/patterns/home-hero.php'),
    ));
    register_block_pattern('presspilot/home-services', array(
        'title' => 'Home Services',
        'categories' => array('featured'),
        'content' => file_get_contents(__DIR__ . '/patterns/home-services.php'),
    ));
}
add_action('init', 'coocoo_pizza_register_patterns');

/**
 * Content Setup Logic
 */
function coocoo_pizza_content_setup()
{
    // 1. NUKE: Delete all existing pages
    $all_pages = get_posts(array(
        'post_type' => 'page',
        'numberposts' => -1,
        'post_status' => 'any'
    ));

    foreach ($all_pages as $page) {
        wp_delete_post($page->ID, true);
    }

    // 2. NUKE: Delete all existing menus and navigation posts
    $all_menus = get_terms('nav_menu', array('hide_empty' => false));
    if (!is_wp_error($all_menus) && !empty($all_menus)) {
        foreach ($all_menus as $menu) {
            wp_delete_nav_menu($menu->term_id);
        }
    }

    $all_nav_posts = get_posts(array(
        'post_type' => 'wp_navigation',
        'numberposts' => -1,
        'post_status' => 'any'
    ));
    foreach ($all_nav_posts as $nav_post) {
        wp_delete_post($nav_post->ID, true);
    }

    // 3. UPDATE: Site Title
    update_option('blogname', 'CooCoo Pizza');

    // 4. PAVE: Create required pages
    $admin_user = get_users(array('role' => 'administrator', 'number' => 1));
    $author_id = !empty($admin_user) ? $admin_user[0]->ID : get_current_user_id();
    if (!$author_id)
        $author_id = 1;

    $pages_to_create = array(
        'Home' => 'home',
        'Menu' => 'menu',
        'About' => 'about',
        'Services' => 'services',
        'Blog' => 'blog',
        'Contact' => 'contact'
    );

    $created_pages = array();

    foreach ($pages_to_create as $page_title => $page_slug) {
        $page_content = '<!-- wp:heading --><h2 class="wp-block-heading">' . $page_title . '</h2><!-- /wp:heading --><!-- wp:paragraph --><p>Welcome to ' . $page_title . '</p><!-- /wp:paragraph -->';

        $page_data = array(
            'post_type' => 'page',
            'post_title' => $page_title,
            'post_name' => $page_slug,
            'post_content' => $page_content,
            'post_status' => 'publish',
            'post_author' => $author_id
        );
        $page_id = wp_insert_post($page_data);
        if ($page_id && !is_wp_error($page_id)) {
            $created_pages[$page_slug] = $page_id;
        }
    }

    // Set Home and Blog
    if (isset($created_pages['home'])) {
        update_option('page_on_front', $created_pages['home']);
        update_option('show_on_front', 'page');
    }
    if (isset($created_pages['blog'])) {
        update_option('page_for_posts', $created_pages['blog']);
    }

    // 5. CREATE: Navigation
    if (!empty($created_pages)) {
        $nav_content = '';
        foreach ($created_pages as $slug => $id) {
            $title = ucfirst($slug);
            $url = get_permalink($id);
            $nav_content .= '<!-- wp:navigation-link {"label":"' . $title . '","type":"page","id":' . $id . ',"url":"' . $url . '","kind":"post-type"} /-->';
        }

        $nav_post_data = array(
            'post_title' => 'Primary Navigation',
            'post_content' => '<!-- wp:navigation {"ref":null} -->' . $nav_content . '<!-- /wp:navigation -->',
            'post_status' => 'publish',
            'post_type' => 'wp_navigation',
            'post_name' => 'primary-navigation',
            'post_author' => $author_id
        );
        wp_insert_post($nav_post_data);
    }

    update_option('coocoo_pizza_version', '1.0.0');
}

function coocoo_pizza_version_check()
{
    $current_version = '1.0.0';
    $installed_version = get_option('coocoo_pizza_version');

    if ($installed_version !== $current_version) {
        coocoo_pizza_content_setup();
    }
}
add_action('admin_init', 'coocoo_pizza_version_check');
add_action('after_switch_theme', 'coocoo_pizza_content_setup');
