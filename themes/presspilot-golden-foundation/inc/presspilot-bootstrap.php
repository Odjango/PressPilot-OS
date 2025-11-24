<?php
/**
 * PressPilot FSE-native bootstrap from presspilot-kit.json
 * Creates pages, wp_navigation entity, and wires header Navigation block.
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Debug logging helper for bootstrap process.
 */
function presspilot_bootstrap_log($message, $context = array()) {
    if (!is_array($context)) {
        $context = array('value' => $context);
    }

    $entry = array(
        'time' => gmdate('c'),
        'message' => $message,
        'context' => $context,
    );

    // Store last entry in an option for quick inspection
    update_option('presspilot_bootstrap_last_debug', wp_json_encode($entry));

    // Also log to error_log if available
    if (function_exists('error_log')) {
        error_log('[PressPilot bootstrap] ' . $message . ' ' . wp_json_encode($context));
    }
}

/**
 * Bootstrap theme from presspilot-kit.json on activation.
 * Creates pages, wp_navigation entity, sets homepage, and wires header.
 */
function presspilot_bootstrap_from_kit() {
    presspilot_bootstrap_log('Bootstrap called');

    // Prevent running more than once (idempotent check)
    $already_done = get_option('presspilot_bootstrap_done_v2');
    if ($already_done) {
        presspilot_bootstrap_log('Bootstrap skipped, already done');
        return;
    }

    $theme_dir = get_stylesheet_directory();
    $kit_path = $theme_dir . '/presspilot-kit.json';

    // Guard: kit file must exist and be readable
    presspilot_bootstrap_log('Reading kit JSON', array('path' => $kit_path));
    if (!file_exists($kit_path)) {
        presspilot_bootstrap_log('Kit file missing', array('path' => $kit_path));
        update_option('presspilot_bootstrap_debug', 'no_kit_file');
        return; // Don't set done flag - allow retry
    }

    $json = file_get_contents($kit_path);
    if (!$json) {
        presspilot_bootstrap_log('Kit file empty', array('path' => $kit_path));
        update_option('presspilot_bootstrap_debug', 'kit_file_empty');
        return; // Don't set done flag - allow retry
    }

    $data = json_decode($json, true);
    if (!is_array($data)) {
        presspilot_bootstrap_log('Kit JSON invalid', array('path' => $kit_path, 'json_error' => json_last_error_msg()));
        update_option('presspilot_bootstrap_debug', 'kit_json_invalid');
        return; // Don't set done flag - allow retry
    }

    // Guard: wpImport structure must exist
    $wp_import = isset($data['wp_import']) ? $data['wp_import'] : null;
    if (!$wp_import || !is_array($wp_import)) {
        presspilot_bootstrap_log('wp_import block missing', array('data_keys' => array_keys($data)));
        update_option('presspilot_bootstrap_debug', 'no_wp_import');
        return; // Don't set done flag - allow retry
    }

    // Guard: wpImport.pages must exist
    if (!isset($wp_import['pages']) || !is_array($wp_import['pages']) || empty($wp_import['pages'])) {
        presspilot_bootstrap_log('wp_import.pages missing or empty', array('wp_import_keys' => array_keys($wp_import)));
        update_option('presspilot_bootstrap_debug', 'no_wp_import_pages');
        return; // Don't set done flag - allow retry
    }

    presspilot_bootstrap_log('Kit JSON loaded successfully', array('pages_count' => count($wp_import['pages'])));
    update_option('presspilot_bootstrap_debug', 'processing');

    // 1) Create pages
    $slug_to_id = array();
    $pages = isset($wp_import['pages']) && is_array($wp_import['pages']) ? $wp_import['pages'] : array();

    $page_slugs = array_map(function($p) { return isset($p['slug']) ? $p['slug'] : ''; }, $pages);
    presspilot_bootstrap_log('Creating pages', array('slugs' => $page_slugs));

    $pages_created = 0;
    $pages_found = 0;
    foreach ($pages as $page_def) {
        $slug = isset($page_def['slug']) ? sanitize_title($page_def['slug']) : '';
        $title = isset($page_def['title']) ? sanitize_text_field($page_def['title']) : '';

        if (!$slug || !$title) {
            continue;
        }

        // Check if page already exists
        $existing = get_page_by_path($slug);
        if ($existing && $existing->ID) {
            $slug_to_id[$slug] = (int) $existing->ID;
            $pages_found++;
            continue;
        }

        // Create page
        $page_id = wp_insert_post(array(
            'post_title' => $title,
            'post_name' => $slug,
            'post_status' => 'publish',
            'post_type' => 'page',
            'post_content' => '', // Can be enhanced later
        ));

        if (!is_wp_error($page_id) && $page_id) {
            $slug_to_id[$slug] = (int) $page_id;
            $pages_created++;
        } else {
            presspilot_bootstrap_log('Page creation failed', array('slug' => $slug, 'error' => is_wp_error($page_id) ? $page_id->get_error_message() : 'unknown'));
        }
    }

    presspilot_bootstrap_log('Pages processed', array('created' => $pages_created, 'found' => $pages_found, 'total' => count($pages)));

    // 2) Set front page
    if (!empty($wp_import['front_page_slug'])) {
        $front_slug = sanitize_title($wp_import['front_page_slug']);
        if (isset($slug_to_id[$front_slug])) {
            update_option('show_on_front', 'page');
            update_option('page_on_front', $slug_to_id[$front_slug]);
            presspilot_bootstrap_log('Front page set', array('slug' => $front_slug, 'page_id' => $slug_to_id[$front_slug]));
        } else {
            presspilot_bootstrap_log('Front page not set - slug not found', array('slug' => $front_slug, 'available_slugs' => array_keys($slug_to_id)));
        }
    }

    // 3) Create wp_navigation entity
    $menu_items = isset($wp_import['menu']['items']) && is_array($wp_import['menu']['items']) 
        ? $wp_import['menu']['items'] 
        : array();

    presspilot_bootstrap_log('Creating navigation', array('items' => $menu_items, 'pages_available' => array_keys($slug_to_id)));

    if (!empty($menu_items) && !empty($slug_to_id)) {
        // Build Navigation block content with navigation-link blocks
        $nav_blocks = array();
        foreach ($menu_items as $slug) {
            $slug = sanitize_title($slug);
            if (!isset($slug_to_id[$slug])) {
                continue;
            }

            $page_id = $slug_to_id[$slug];
            $page_title = get_the_title($page_id);
            $page_title_escaped = esc_attr($page_title);

            // Create navigation-link block for this page
            $nav_blocks[] = sprintf(
                '<!-- wp:navigation-link {"type":"page","id":%d,"label":"%s","kind":"post-type","isTopLevelLink":true} /-->',
                $page_id,
                $page_title_escaped
            );
        }

        if (!empty($nav_blocks)) {
            // Build Navigation block content with navigation-link blocks inside
            $nav_content = '<!-- wp:navigation {"overlayMenu":"never","layout":{"type":"flex","justifyContent":"right"},"style":{"spacing":{"blockGap":"var:preset|spacing|40"}},"className":"presspilot-header-nav"} -->' . "\n";
            $nav_content .= implode("\n", $nav_blocks) . "\n";
            $nav_content .= '<!-- /wp:navigation -->';

            // Create or update wp_navigation post
            $nav_title = isset($wp_import['menu']['name']) 
                ? sanitize_text_field($wp_import['menu']['name']) 
                : 'Main Navigation';

            // Check if navigation entity already exists
            $existing_nav = get_posts(array(
                'post_type' => 'wp_navigation',
                'post_status' => 'publish',
                'posts_per_page' => 1,
                'title' => $nav_title,
            ));

            if (!empty($existing_nav)) {
                $nav_id = $existing_nav[0]->ID;
                wp_update_post(array(
                    'ID' => $nav_id,
                    'post_content' => $nav_content,
                ));
            } else {
                $nav_id = wp_insert_post(array(
                    'post_title' => $nav_title,
                    'post_content' => $nav_content,
                    'post_status' => 'publish',
                    'post_type' => 'wp_navigation',
                ));
            }

            if (!is_wp_error($nav_id) && $nav_id) {
                presspilot_bootstrap_log('Navigation entity created', array('nav_id' => $nav_id, 'title' => $nav_title));
                // 4) Wire header template part to this navigation entity
                presspilot_wire_header_to_navigation($nav_id);
                presspilot_bootstrap_log('Header wired to navigation', array('nav_id' => $nav_id));
            } else {
                presspilot_bootstrap_log('Navigation creation failed', array('error' => is_wp_error($nav_id) ? $nav_id->get_error_message() : 'unknown'));
            }
        } else {
            presspilot_bootstrap_log('Navigation not created - no items or pages', array('menu_items_count' => count($menu_items), 'pages_count' => count($slug_to_id)));
        }
    } else {
        presspilot_bootstrap_log('Navigation skipped - no menu items', array('wp_import_menu' => isset($wp_import['menu']) ? $wp_import['menu'] : null));
    }

    // Mark as done only after successful completion
    // This makes the function idempotent: safe to call multiple times until it succeeds once
    presspilot_bootstrap_log('Bootstrap completed');
    update_option('presspilot_bootstrap_done_v2', 1);
    update_option('presspilot_bootstrap_debug', 'done');
}

/**
 * Update header template part to reference the navigation entity.
 * In FSE, template parts are stored as posts, but we update the file directly
 * since the theme file is the source of truth for new installs.
 */
function presspilot_wire_header_to_navigation($nav_id) {
    $theme_dir = get_stylesheet_directory();
    $header_file = $theme_dir . '/parts/header.html';
    
    if (!file_exists($header_file)) {
        return;
    }

    $header_content = file_get_contents($header_file);
    $updated_content = presspilot_update_navigation_ref($header_content, $nav_id);
    
    if ($updated_content !== $header_content) {
        file_put_contents($header_file, $updated_content);
        
        // Also try to update the template part in database if it exists
        $query = new WP_Query(array(
            'post_type' => 'wp_template_part',
            'post_status' => 'publish',
            'posts_per_page' => 1,
            'meta_query' => array(
                array(
                    'key' => 'wp_template_part_area',
                    'value' => 'header',
                ),
            ),
        ));

        if ($query->have_posts()) {
            $header_part = $query->posts[0];
            wp_update_post(array(
                'ID' => $header_part->ID,
                'post_content' => $updated_content,
            ));
        }
    }
}

/**
 * Update Navigation block in content to reference nav_id.
 */
function presspilot_update_navigation_ref($content, $nav_id) {
    // Pattern to match Navigation block opening tag
    $pattern = '/(<!--\s*wp:navigation\s+)(\{[^}]*\})(\s*-->)/';
    
    $replacement = function($matches) use ($nav_id) {
        $attrs_json = $matches[2];
        $attrs = json_decode($attrs_json, true);
        
        if (!is_array($attrs)) {
            $attrs = array();
        }
        
        // Set ref to the navigation entity ID
        $attrs['ref'] = (int) $nav_id;
        
        $new_attrs_json = json_encode($attrs, JSON_UNESCAPED_SLASHES);
        
        return $matches[1] . $new_attrs_json . $matches[3];
    };
    
    return preg_replace_callback($pattern, $replacement, $content);
}

