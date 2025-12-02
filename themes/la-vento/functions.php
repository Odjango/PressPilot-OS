<?php
/**
 * PressPilot FSE v2 Theme helpers.
 *
 * This file handles content provisioning and theme configuration.
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Theme Configuration (Runs on every request)
 */
function la_vento_config()
{
    // Enable Classic Menus support so "Appearance > Menus" is visible in Dashboard
    add_theme_support('menus');

    // Add other standard supports
    add_theme_support('post-thumbnails');
    add_theme_support('automatic-feed-links');
    add_theme_support('title-tag');
}
add_action('after_setup_theme', 'la_vento_config');

/**
 * Content Setup Logic (Runs only on switch or version update)
 * WARNING: This function DELETES existing content.
 */
function la_vento_content_setup()
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
    $all_menus = get_terms('nav_menu', array('hide_empty' => false)); // Changed to false to get empty ones too
    if (!is_wp_error($all_menus) && !empty($all_menus)) {
        foreach ($all_menus as $menu) {
            wp_delete_nav_menu($menu->term_id);
        }
    }

    // Also delete FSE navigation posts
    $all_nav_posts = get_posts(array(
        'post_type' => 'wp_navigation',
        'numberposts' => -1,
        'post_status' => 'any'
    ));
    foreach ($all_nav_posts as $nav_post) {
        wp_delete_post($nav_post->ID, true);
    }

    // 3. UPDATE: Site Title
    update_option('blogname', 'La Vento');

    // 4. PAVE: Create required pages

    // Find a valid author (admin)
    $admin_user = get_users(array('role' => 'administrator', 'number' => 1));
    $author_id = !empty($admin_user) ? $admin_user[0]->ID : get_current_user_id();
    if (!$author_id) {
        $author_id = 1; // Fallback
    }

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
        // We just deleted everything, so we can just create them.
        $page_content_template = '<!-- wp:heading -->
        <h2 class="wp-block-heading">' . $page_title . ' Page Content</h2>
        <!-- /wp:heading -->
        <!-- wp:paragraph -->
        <p>This is the initial content for the ' . $page_title . ' page. You can customize this layout in the Editor.</p>
        <!-- /wp:paragraph -->
        <!-- wp:cover {"overlayColor":"brand","dimRatio":50,"minHeight":300,"minHeightUnit":"px","align":"full"} -->
        <div class="wp-block-cover alignfull" style="min-height:300px"><span aria-hidden="true" class="wp-block-cover__background has-brand-background-color has-background-dim"></span><div class="wp-block-cover__inner-container"><!-- wp:paragraph {"align":"center","placeholder":"Write title...","fontSize":"large"} -->
        <p class="has-text-align-center has-large-font-size">Welcome to ' . $page_title . '</p>
        <!-- /wp:paragraph --></div></div>
        <!-- /wp:cover -->';

        $page_data = array(
            'post_type' => 'page',
            'post_title' => $page_title,
            'post_name' => $page_slug,
            'post_content' => $page_content_template,
            'post_status' => 'publish',
            'post_author' => $author_id
        );
        $page_id = wp_insert_post($page_data);
        if ($page_id && !is_wp_error($page_id)) {
            $created_pages[$page_slug] = $page_id;
        }
    }

    // Set 'Home' as the static front page and 'Blog' as the posts page.
    if (isset($created_pages['home'])) {
        update_option('page_on_front', $created_pages['home']);
        update_option('show_on_front', 'page');
    }
    if (isset($created_pages['blog'])) {
        update_option('page_for_posts', $created_pages['blog']);
    }

    // 5. CREATE: Navigation Menu (FSE)
    // Only proceed if we actually created pages
    if (!empty($created_pages)) {
        // A. FSE Navigation Post
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

        // B. Classic Menu (for Dashboard "Appearance > Menus")
        $menu_name = 'Primary Menu';
        $menu_id = wp_create_nav_menu($menu_name);

        if (!is_wp_error($menu_id)) {
            foreach ($created_pages as $slug => $id) {
                $title = ucfirst($slug);
                wp_update_nav_menu_item($menu_id, 0, array(
                    'menu-item-title' => $title,
                    'menu-item-object-id' => $id,
                    'menu-item-object' => 'page',
                    'menu-item-status' => 'publish',
                    'menu-item-type' => 'post_type',
                ));
            }
        }
    }

    // Update the stored version so we don't run this again until the next version bump
    update_option('la_vento_version', '4.0.0');
}

/**
 * Check version on admin init and run setup if needed.
 * This handles the case where the user updates the theme files but doesn't deactivate/reactivate.
 */
function la_vento_version_check()
{
    $current_version = '4.0.0';
    $installed_version = get_option('la_vento_version');

    if ($installed_version !== $current_version) {
        la_vento_content_setup();
    }
}
add_action('admin_init', 'la_vento_version_check');
add_action('after_switch_theme', 'la_vento_content_setup');
