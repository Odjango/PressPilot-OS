<?php
/**
 * PressPilot theme activation bootstrap.
 * Creates pages and classic WordPress menu on theme activation.
 * Reads from presspilot-kit.json if available, otherwise uses defaults.
 * Ultra-defensive: never crashes, always creates pages + menu.
 */

if (!defined('ABSPATH')) {
    exit;
}

if (!function_exists('presspilot_run_activation_bootstrap')) {
    function presspilot_run_activation_bootstrap($force = false) {
        if (!is_admin()) {
            return;
        }

        // Simple idempotency flag.
        $flag_key = 'presspilot_activation_v1_done';
        if (!$force && get_option($flag_key)) {
            return;
        }

        // Log start
        if (function_exists('error_log')) {
            error_log('[PressPilot] Activation bootstrap started');
        }

        $theme_dir = get_stylesheet_directory();
        $kit_path = $theme_dir . '/presspilot-kit.json';

        $pages_spec = array();
        $menu_order_slugs = array();
        $front_page_slug = 'home';

        // Try to read from kit JSON - with full error handling
        if (file_exists($kit_path) && is_readable($kit_path)) {
            $json = @file_get_contents($kit_path);
            
            if ($json !== false && !empty($json)) {
                $data = @json_decode($json, true);
                
                if (is_array($data)) {
                    // Support both camelCase (wpImport) and snake_case (wp_import) for compatibility
                    $wp_import = null;
                    if (isset($data['wpImport']) && is_array($data['wpImport'])) {
                        $wp_import = $data['wpImport'];
                    } elseif (isset($data['wp_import']) && is_array($data['wp_import'])) {
                        $wp_import = $data['wp_import'];
                    }

                    if ($wp_import) {
                        // Extract pages - defensive
                        if (isset($wp_import['pages']) && is_array($wp_import['pages']) && !empty($wp_import['pages'])) {
                            foreach ($wp_import['pages'] as $page) {
                                if (isset($page['slug']) && isset($page['title']) && 
                                    is_string($page['slug']) && is_string($page['title'])) {
                                    $pages_spec[] = array(
                                        'slug' => sanitize_title($page['slug']),
                                        'title' => sanitize_text_field($page['title']),
                                    );
                                }
                            }
                        }

                        // Extract menu order - defensive
                        if (isset($wp_import['menu']['items']) && is_array($wp_import['menu']['items'])) {
                            $menu_order_slugs = array_map('sanitize_title', array_filter($wp_import['menu']['items'], 'is_string'));
                        }

                        // Extract front page slug - defensive
                        if (isset($wp_import['front_page_slug']) && is_string($wp_import['front_page_slug'])) {
                            $front_page_slug = sanitize_title($wp_import['front_page_slug']);
                        }
                    }
                }
            }
        }

        // Fallback to default pages if kit JSON is missing, invalid, or empty
        if (empty($pages_spec)) {
            if (function_exists('error_log')) {
                error_log('[PressPilot] Using fallback pages (kit JSON missing or invalid)');
            }
            
            $pages_spec = array(
                array('slug' => 'home', 'title' => 'Home'),
                array('slug' => 'about', 'title' => 'About'),
                array('slug' => 'services', 'title' => 'Services'),
                array('slug' => 'blog', 'title' => 'Blog'),
                array('slug' => 'contact', 'title' => 'Contact'),
            );
            $menu_order_slugs = array('home', 'about', 'services', 'blog', 'contact');
        }

        // Create pages - with error handling
        $page_ids = array();
        foreach ($pages_spec as $page) {
            $slug = isset($page['slug']) ? $page['slug'] : '';
            $title = isset($page['title']) ? $page['title'] : '';

            if (empty($slug) || empty($title)) {
                if (function_exists('error_log')) {
                    error_log("[PressPilot] Skipping invalid page spec: slug=$slug, title=$title");
                }
                continue;
            }

            // Check if page already exists
            $existing = get_page_by_path($slug);
            if ($existing && $existing instanceof WP_Post) {
                $page_ids[$slug] = $existing->ID;
                continue;
            }

            // Generate simple block content
            $content = "<!-- wp:heading -->\n<h2 class=\"wp-block-heading\">" . esc_html($title) . "</h2>\n<!-- /wp:heading -->\n\n<!-- wp:paragraph -->\n<p>Generated by PressPilot.</p>\n<!-- /wp:paragraph -->\n";

            // Create page with error handling
            $page_id = @wp_insert_post(
                array(
                    'post_title' => $title,
                    'post_name' => $slug,
                    'post_status' => 'publish',
                    'post_type' => 'page',
                    'post_content' => $content,
                ),
                true
            );

            if (!is_wp_error($page_id) && $page_id) {
                $page_ids[$slug] = $page_id;
            } else {
                $error_msg = is_wp_error($page_id) ? $page_id->get_error_message() : 'Unknown error';
                if (function_exists('error_log')) {
                    error_log("[PressPilot] Failed to create page '$title' (slug: $slug): $error_msg");
                }
            }
        }

        // Set front page - defensive
        if (!empty($front_page_slug) && isset($page_ids[$front_page_slug])) {
            $front_page_id = intval($page_ids[$front_page_slug]);
            if ($front_page_id > 0) {
                @update_option('show_on_front', 'page');
                @update_option('page_on_front', $front_page_id);
            }
        } elseif (!empty($page_ids['home'])) {
            // Fallback to 'home' if front_page_slug doesn't exist
            $home_id = intval($page_ids['home']);
            if ($home_id > 0) {
                @update_option('show_on_front', 'page');
                @update_option('page_on_front', $home_id);
            }
        }

        // Create or get menu - with error handling
        $menu_name = 'Main Menu';
        $menu_id = null;
        
        $menu = @wp_get_nav_menu_object($menu_name);
        if ($menu && isset($menu->term_id)) {
            $menu_id = $menu->term_id;
        } else {
            $menu_id = @wp_create_nav_menu($menu_name);
            if (is_wp_error($menu_id)) {
                if (function_exists('error_log')) {
                    error_log('[PressPilot] Failed to create menu: ' . $menu_id->get_error_message());
                }
                $menu_id = null;
            }
        }

        if ($menu_id && !is_wp_error($menu_id)) {
            // Get existing menu items to avoid duplicates
            $existing_items = @wp_get_nav_menu_items($menu_id);
            $existing_page_ids = array();
            if ($existing_items && !is_wp_error($existing_items)) {
                foreach ($existing_items as $item) {
                    if (isset($item->object) && $item->object === 'page' && isset($item->object_id)) {
                        $existing_page_ids[] = intval($item->object_id);
                    }
                }
            }

            // Add menu items in the specified order
            $position = 1;
            foreach ($menu_order_slugs as $slug) {
                if (empty($page_ids[$slug])) {
                    continue;
                }

                $page_id = intval($page_ids[$slug]);
                if ($page_id <= 0) {
                    continue;
                }

                // Skip if already in menu
                if (in_array($page_id, $existing_page_ids, true)) {
                    continue;
                }

                // Add menu item with error handling
                $menu_item_result = @wp_update_nav_menu_item(
                    $menu_id,
                    0,
                    array(
                        'menu-item-object-id' => $page_id,
                        'menu-item-object' => 'page',
                        'menu-item-type' => 'post_type',
                        'menu-item-status' => 'publish',
                        'menu-item-position' => $position,
                    )
                );

                if (is_wp_error($menu_item_result)) {
                    if (function_exists('error_log')) {
                        error_log("[PressPilot] Failed to add menu item for page ID $page_id: " . $menu_item_result->get_error_message());
                    }
                } else {
                    $position++;
                }
            }

            // Assign to primary location - defensive
            $locations = @get_theme_mod('nav_menu_locations', array());
            if (!is_array($locations)) {
                $locations = array();
            }
            $locations['primary'] = intval($menu_id);
            @set_theme_mod('nav_menu_locations', $locations);
        }

        // Mark as done - only if we got this far without fatal errors
        // Even if some pages/menu items failed, we mark it done to prevent infinite retries
        @update_option($flag_key, 1, false);
        
        if (function_exists('error_log')) {
            $pages_created = count($page_ids);
            error_log("[PressPilot] Activation bootstrap completed. Pages created: $pages_created, Menu ID: " . ($menu_id ? $menu_id : 'none'));
        }
    }
}
