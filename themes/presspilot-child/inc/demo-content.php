<?php
/**
 * Demo Content Setup (Hotwired)
 * Handles programmatic content creation immediately on admin init.
 *
 * @package PressPilot_Child
 */

function presspilot_setup_identity_hotwire()
{

    // Critical Safety Check
    if (get_option('presspilot_setup_completed')) {
        return;
    }

    // 1. Update Site Title
    update_option('blogname', 'Prego Pizza');
    update_option('blogdescription', 'Files are the new database.');

    // 2. Create Pages if they don\'t exist
    $pages = array('Home', 'About', 'Services', 'Contact');
    $page_ids = array();

    foreach ($pages as $page_title) {
        $page_check = get_page_by_title($page_title);
        if (!isset($page_check->ID)) {
            $new_page_id = wp_insert_post(array(
                'post_type' => 'page',
                'post_title' => $page_title,
                'post_content' => '<!-- wp:paragraph --><p>Content for ' . $page_title . '</p><!-- /wp:paragraph -->',
                'post_status' => 'publish',
                'post_author' => 1,
            ));
            $page_ids[$page_title] = $new_page_id;
        } else {
            $page_ids[$page_title] = $page_check->ID;
        }
    }

    // Set 'Home' as front page
    if (isset($page_ids['Home'])) {
        update_option('show_on_front', 'page');
        update_option('page_on_front', $page_ids['Home']);
    }

    // 3. Create Navigation Menu
    $menu_name = 'Primary Menu';
    $menu_exists = wp_get_nav_menu_object($menu_name);

    // We want to force ensure it exists and has items
    if (!$menu_exists) {
        $menu_id = wp_create_nav_menu($menu_name);
    } else {
        $menu_id = $menu_exists->term_id;
    }

    // Assign pages in specific order
    $order = 1;
    foreach ($pages as $page_title) {
        if (isset($page_ids[$page_title])) {

            // Check if item already exists in menu to prevent duplicates (optional but good practice)
            // For this hotwire, we just append/ensure.

            wp_update_nav_menu_item($menu_id, 0, array(
                'menu-item-title' => $page_title,
                'menu-item-object' => 'page',
                'menu-item-object-id' => $page_ids[$page_title],
                'menu-item-type' => 'post_type',
                'menu-item-status' => 'publish',
                'menu-item-position' => $order, // Force Order
            ));
            $order++;
        }
    }

    // Assign to location 'primary'
    $locations = get_theme_mod('nav_menu_locations');
    $locations['primary'] = $menu_id;
    set_theme_mod('nav_menu_locations', $locations);

    // Mark Complete
    update_option('presspilot_setup_completed', true);
}

// Change hook to admin_init for immediate execution on dashboard visit
add_action('admin_init', 'presspilot_setup_identity_hotwire');
