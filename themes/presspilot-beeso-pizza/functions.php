<?php
/**
 * Theme functions and definitions
 */

if (!function_exists('presspilot_beeso_pizza_support')):
    function presspilot_beeso_pizza_support()
    {
        add_theme_support('wp-block-styles');
        add_theme_support('editor-styles');
        add_theme_support('block-templates');
        add_theme_support('menus');
        add_theme_support('post-thumbnails');
        add_theme_support('automatic-feed-links');
        add_theme_support('title-tag');
    }
endif;
add_action('after_setup_theme', 'presspilot_beeso_pizza_support');

/**
 * Register block patterns
 */
function presspilot_beeso_pizza_register_patterns()
{
    register_block_pattern_category(
        'featured',
        array('label' => __('Featured', 'presspilot-beeso-pizza'))
    );
}
add_action('init', 'presspilot_beeso_pizza_register_patterns');

/**
 * Content Setup - Nuke & Pave
 * Creates default pages and menu on theme activation.
 */
function presspilot_beeso_pizza_content_setup()
{
    // 1. Nuke existing content (Pages, Navigation)
    $all_pages = get_posts(array('post_type' => 'page', 'numberposts' => -1, 'post_status' => 'any'));
    foreach ($all_pages as $p) {
        wp_delete_post($p->ID, true);
    }

    $nav_menus = get_terms(array('taxonomy' => 'nav_menu', 'hide_empty' => false));
    if (!is_wp_error($nav_menus)) {
        foreach ($nav_menus as $menu) {
            wp_delete_nav_menu($menu->term_id);
        }
    }

    $nav_posts = get_posts(array('post_type' => 'wp_navigation', 'numberposts' => -1, 'post_status' => 'any'));
    foreach ($nav_posts as $p) {
        wp_delete_post($p->ID, true);
    }

    // 2. Update Site Title
    update_option('blogname', 'CooCoo Pizza');
    update_option('blogdescription', 'Premium Pizza & Design');

    // 3. Create Pages
    $user_id = get_current_user_id();
    if (!$user_id) {
        $users = get_users(array('role' => 'administrator'));
        $user_id = !empty($users) ? $users[0]->ID : 1;
    }

    $pages = array(
        'Home' => 'Welcome to CooCoo Pizza. This is the front page.',
        'Menu' => 'Our delicious pizza menu.',
        'About' => 'About our pizzeria.',
        'Services' => 'Catering and delivery services.',
        'Blog' => 'Latest news and updates.',
        'Contact' => 'Get in touch with us.'
    );

    $page_ids = array();
    foreach ($pages as $title => $content) {
        $page_id = wp_insert_post(array(
            'post_title' => $title,
            'post_content' => '<!-- wp:paragraph --><p>' . $content . '</p><!-- /wp:paragraph -->',
            'post_status' => 'publish',
            'post_type' => 'page',
            'post_author' => $user_id
        ));
        if (!is_wp_error($page_id)) {
            $page_ids[$title] = $page_id;
        }
    }

    // 4. Set Front Page & Posts Page
    if (isset($page_ids['Home']) && isset($page_ids['Blog'])) {
        update_option('show_on_front', 'page');
        update_option('page_on_front', $page_ids['Home']);
        update_option('page_for_posts', $page_ids['Blog']);
    }

    // 5. Create Navigation Menu (FSE Style)
    // We create a wp_navigation post that references the pages we just created.

    $menu_items_html = '';
    foreach ($page_ids as $title => $id) {
        $permalink = get_permalink($id);
        $menu_items_html .= '<!-- wp:navigation-link {"label":"' . $title . '","type":"page","id":' . $id . ',"url":"' . $permalink . '","kind":"post-type"} /-->';
    }



    // Create the Navigation Post
    // Create the Navigation Post
    $nav_post_id = wp_insert_post(array(
        'post_title' => 'Primary Navigation',
        'post_content' => $menu_items_html,
        'post_status' => 'publish',
        'post_type' => 'wp_navigation',
        'post_name' => 'primary-navigation',
        'post_author' => $user_id
    ));
}

// Run setup on theme switch
add_action('after_switch_theme', 'presspilot_beeso_pizza_content_setup');

// Version check to force run if needed
function presspilot_beeso_pizza_version_check()
{
    $ver = '1.0.0';
    $opt = get_option('presspilot_beeso_pizza_version');
    if ($opt !== $ver) {
        presspilot_beeso_pizza_content_setup();
        update_option('presspilot_beeso_pizza_version', $ver);
    }
}
add_action('admin_init', 'presspilot_beeso_pizza_version_check');
