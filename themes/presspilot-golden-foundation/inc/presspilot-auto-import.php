<?php
// inc/presspilot-auto-import.php

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Runs once on theme activation.
 * Reads presspilot-kit.json from the theme root and:
 * - Creates pages if they don't exist
 * - Creates/assigns a nav menu
 * - Sets the front page
 */
function presspilot_maybe_auto_import() {
    // Debug marker: function started
    update_option('presspilot_import_debug', 'started');

    // Prevent this from running more than once (use v1 to avoid old install conflicts)
    $already_done = get_option('presspilot_import_done_v1');
    if ($already_done) {
        update_option('presspilot_import_debug', 'already_done');
        return;
    }

    $theme_dir = get_stylesheet_directory();
    $kit_path  = $theme_dir . '/presspilot-kit.json';

    if (!file_exists($kit_path)) {
        // No kit JSON found; bail out gracefully.
        update_option('presspilot_import_debug', 'no_kit_file');
        return;
    }

    $json = file_get_contents($kit_path);
    if (!$json) {
        update_option('presspilot_import_debug', 'kit_file_empty');
        return;
    }

    $data = json_decode($json, true);
    if (!is_array($data)) {
        update_option('presspilot_import_debug', 'kit_json_invalid');
        return;
    }

    $wp_import = isset($data['wp_import']) ? $data['wp_import'] : null;
    if (!$wp_import || !is_array($wp_import)) {
        update_option('presspilot_import_debug', 'no_wp_import');
        return;
    }

    update_option('presspilot_import_debug', 'processing');

    // 1) Create pages
    $slug_to_id = array();

    if (isset($wp_import['pages']) && is_array($wp_import['pages'])) {
        foreach ($wp_import['pages'] as $page_def) {
            $slug  = isset($page_def['slug']) ? sanitize_title($page_def['slug']) : '';
            $title = isset($page_def['title']) ? sanitize_text_field($page_def['title']) : '';

            if (!$slug || !$title) {
                continue;
            }

            // Skip if page with this slug already exists
            $existing = get_page_by_path($slug);
            if ($existing && $existing->ID) {
                $slug_to_id[$slug] = (int) $existing->ID;
                continue;
            }

            $page_id = wp_insert_post(array(
                'post_title'   => $title,
                'post_name'    => $slug,
                'post_status'  => 'publish',
                'post_type'    => 'page',
                'post_content' => '', // content can be enhanced later
            ));

            if (!is_wp_error($page_id) && $page_id) {
                $slug_to_id[$slug] = (int) $page_id;
            }
        }
    }

    // 2) Set front page if specified
    if (!empty($wp_import['front_page_slug'])) {
        $front_slug = sanitize_title($wp_import['front_page_slug']);
        if (isset($slug_to_id[$front_slug])) {
            update_option('show_on_front', 'page');
            update_option('page_on_front', $slug_to_id[$front_slug]);
        }
    }

    // 3) Create and assign menu
    if (isset($wp_import['menu']) && is_array($wp_import['menu'])) {
        $menu_conf = $wp_import['menu'];

        $location_key = !empty($menu_conf['location'])
            ? sanitize_key($menu_conf['location'])
            : 'primary';

        $menu_name = !empty($menu_conf['name'])
            ? sanitize_text_field($menu_conf['name'])
            : 'Main Menu';

        // Delete any existing menu with the same name to avoid conflicts
        $existing_menu = wp_get_nav_menu_object($menu_name);
        if ($existing_menu && isset($existing_menu->term_id)) {
            wp_delete_nav_menu($existing_menu->term_id);
        }

        // Create a fresh menu
        $menu_id = wp_create_nav_menu($menu_name);

        if (!is_wp_error($menu_id) && $menu_id) {
            // Add items in the provided order (items array contains slugs in correct order)
            $items_slugs = isset($menu_conf['items']) && is_array($menu_conf['items'])
                ? $menu_conf['items']
                : array();

            $menu_order = 0;
            foreach ($items_slugs as $slug) {
                $slug = sanitize_title($slug);
                if (!isset($slug_to_id[$slug])) {
                    continue; // page not found, skip
                }

                $menu_order++;
                $menu_item_id = wp_update_nav_menu_item($menu_id, 0, array(
                    'menu-item-object-id'   => $slug_to_id[$slug],
                    'menu-item-object'      => 'page',
                    'menu-item-type'        => 'post_type',
                    'menu-item-status'      => 'publish',
                    'menu-item-title'       => get_the_title($slug_to_id[$slug]),
                ));

                // Set menu order explicitly
                if ($menu_item_id && !is_wp_error($menu_item_id)) {
                    update_post_meta($menu_item_id, '_menu_item_menu_item_parent', 0);
                    update_post_meta($menu_item_id, '_menu_item_position', $menu_order);
                }
            }

            // Assign to theme location
            $locations = get_theme_mod('nav_menu_locations');
            if (!is_array($locations)) {
                $locations = array();
            }

            $locations[$location_key] = $menu_id;
            set_theme_mod('nav_menu_locations', $locations);
        }
    }

    // 4) Mark as done
    update_option('presspilot_import_done_v1', 1);
    update_option('presspilot_import_debug', 'done');
}

