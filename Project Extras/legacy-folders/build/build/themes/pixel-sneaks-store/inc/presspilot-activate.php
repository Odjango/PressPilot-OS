<?php
/**
 * PressPilot theme activation bootstrap.
 * Creates pages and classic WordPress menu on theme activation.
 */

if (!defined('ABSPATH')) {
    exit;
}

if (!function_exists('presspilot_run_activation_bootstrap')) {
    function presspilot_run_activation_bootstrap() {
        if (!is_admin()) {
            return;
        }

        // Simple idempotency flag.
        if (get_option('presspilot_activation_v1_done')) {
            return;
        }

        $pages = array(
            array(
                'slug' => 'home',
                'title' => 'Home',
                'content' => "<!-- wp:heading --><h2>Home</h2><!-- /wp:heading -->\n<!-- wp:paragraph --><p>Welcome to your new site.</p><!-- /wp:paragraph -->",
            ),
            array(
                'slug' => 'menu',
                'title' => 'Menu',
                'content' => "<!-- wp:heading --><h2>Menu</h2><!-- /wp:heading -->\n<!-- wp:paragraph --><p>Describe your menu items here.</p><!-- /wp:paragraph -->",
            ),
            array(
                'slug' => 'about',
                'title' => 'About',
                'content' => "<!-- wp:heading --><h2>About</h2><!-- /wp:heading -->\n<!-- wp:paragraph --><p>Tell your story here.</p><!-- /wp:paragraph -->",
            ),
            array(
                'slug' => 'contact',
                'title' => 'Contact',
                'content' => "<!-- wp:heading --><h2>Contact</h2><!-- /wp:heading -->\n<!-- wp:paragraph --><p>Share your contact info here.</p><!-- /wp:paragraph -->",
            ),
        );

        $page_ids_by_slug = array();

        foreach ($pages as $page) {
            $existing = get_page_by_path($page['slug']);

            if ($existing && $existing instanceof WP_Post) {
                $page_ids_by_slug[$page['slug']] = $existing->ID;
                continue;
            }

            $page_id = wp_insert_post(
                array(
                    'post_title' => $page['title'],
                    'post_name' => $page['slug'],
                    'post_status' => 'publish',
                    'post_type' => 'page',
                    'post_content' => $page['content'],
                ),
                true
            );

            if (!is_wp_error($page_id) && $page_id) {
                $page_ids_by_slug[$page['slug']] = $page_id;
            }
        }

        // Create or get menu.
        $menu_name = 'Main Menu';
        $menu = wp_get_nav_menu_object($menu_name);

        if (!$menu) {
            $menu_id = wp_create_nav_menu($menu_name);
        } else {
            $menu_id = $menu->term_id;
        }

        if ($menu_id && !is_wp_error($menu_id)) {
            $desired_order = array('home', 'menu', 'about', 'contact');

            foreach ($desired_order as $slug) {
                if (empty($page_ids_by_slug[$slug])) {
                    continue;
                }

                $page_id = $page_ids_by_slug[$slug];

                // Check if an item for this page already exists in the menu.
                $items = wp_get_nav_menu_items($menu_id);

                $already = false;
                if ($items && !is_wp_error($items)) {
                    foreach ($items as $item) {
                        if (intval($item->object_id) === intval($page_id)) {
                            $already = true;
                            break;
                        }
                    }
                }

                if ($already) {
                    continue;
                }

                wp_update_nav_menu_item(
                    $menu_id,
                    0,
                    array(
                        'menu-item-object-id' => $page_id,
                        'menu-item-object' => 'page',
                        'menu-item-type' => 'post_type',
                        'menu-item-status' => 'publish',
                    )
                );
            }

            // Assign to primary location.
            $locations = get_theme_mod('nav_menu_locations', array());
            $locations['primary'] = $menu_id;
            set_theme_mod('nav_menu_locations', $locations);
        }

        // Optional: set static front page to "Home" if it exists.
        if (!empty($page_ids_by_slug['home'])) {
            update_option('show_on_front', 'page');
            update_option('page_on_front', intval($page_ids_by_slug['home']));
        }

        update_option('presspilot_activation_v1_done', 1);
    }
}

