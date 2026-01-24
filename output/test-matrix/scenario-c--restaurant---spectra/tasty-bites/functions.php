<?php
/**
 * Functions and definitions
 *
 * @package Spectra One
 * @author Brainstorm Force
 * @since 0.0.1
 */

declare( strict_types=1 );

namespace Swt;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

const SWT_VER  = '1.1.7';
const SWT_SLUG = 'spectra-one';
const SWT_NAME = 'Spectra One';
const SWT_PFX  = 'swt';
const SWT_LOC  = 'spectraOne';
const SWT_NS   = __NAMESPACE__ . '\\';
const SWT_DS   = DIRECTORY_SEPARATOR;
const SWT_DIR  = __DIR__ . SWT_DS;

/**
 * Setup base spectra one functions
 */
require_once SWT_DIR . 'inc/utilities/all.php';
require_once SWT_DIR . 'inc/theme-options.php';
require_once SWT_DIR . 'inc/theme-updater.php';
require_once SWT_DIR . 'inc/scripts.php';
require_once SWT_DIR . 'inc/blocks/all.php';
require_once SWT_DIR . 'inc/compatibility/all.php';
require_once SWT_DIR . 'inc/extensions/all.php';
require_once SWT_DIR . 'inc/block-styles/all.php';

/**
 * Admin functions
 */

require_once SWT_DIR . 'inc/admin/welcome-notice.php';
require_once SWT_DIR . 'inc/admin/settings.php';

// PressPilot Auto-Loader (Direct Injection - 1.1.0 NUCLEAR)
/**
 * Auto-Content Loader
 * 
 * Automatically creates pages, assigns menus, and sets site identity upon theme activation.
 */

function presspilot_setup_1769222536906() {
    // 0. FLUSH CACHE (Critical for persistence)
    wp_cache_flush();

    // 1. Set Site Identity
    update_option('blogname', 'Tasty Bites' . ' [UPDATED]' );
    update_option('blogdescription', '' );

    // 2. Create Pages
    $pages = [
    ];

    $created_page_ids = [];

    // Ensure Home Page Exists (if not in custom pages)
    $home_page = get_page_by_path('home');
    if (!$home_page) {
        $home_id = wp_insert_post([
            'post_title'    => 'Home',
            'post_name'     => 'home',
            'post_content'  => '',
            'post_status'   => 'publish',
            'post_type'     => 'page',
        ]);
        update_option('show_on_front', 'page');
        update_option('page_on_front', $home_id);
        $created_page_ids['Home'] = $home_id;
    } else {
        $created_page_ids['Home'] = $home_page->ID;
        update_option('show_on_front', 'page');
        update_option('page_on_front', $home_page->ID);
    }

    foreach ($pages as $page) {
        $existing = get_page_by_path($page['slug']);
        if (!$existing) {
            $id = wp_insert_post([
                'post_title'    => $page['title'],
                'post_name'     => $page['slug'],
                'post_content'  => $page['content'],
                'post_status'   => 'publish',
                'post_type'     => 'page',
            ]);
            $created_page_ids[$page['title']] = $id;
        } else {
            $created_page_ids[$page['title']] = $existing->ID;
        }
    }

    // 3. CLEAN SLATE: Delete ALL customized Template Parts (Nuclear Option)
    // We remove the tax_query to ensure we catch ANY 'ghost' parts, regardless of theme slug.
    $parts = get_posts([
        'post_type' => 'wp_template_part',
        'post_status' => ['publish', 'draft', 'auto-draft', 'trash'], // Include trash too
        'numberposts' => -1,
    ]);

    foreach ($parts as $part) {
        // Only delete header and footer customizations to be safe, or just zap all for a clean generation.
        // Let's zap all to ensure the fresh site is 100% fresh.
        wp_delete_post($part->ID, true);
    }

    // 4. Create & Assign Menu
    $menu_name = 'Primary Menu';
    
    // FORCE RESET: Delete existing menu if it exists to ensure order is corrected
    $menu_exists = wp_get_nav_menu_object($menu_name);
    if ($menu_exists) {
        wp_delete_nav_menu($menu_name);
    }

    $menu_id = wp_create_nav_menu($menu_name);

    // Add Home Link
    if (isset($created_page_ids['Home'])) {
        wp_update_nav_menu_item($menu_id, 0, [
            'menu-item-title'  => 'Home',
            'menu-item-object-id' => $created_page_ids['Home'],
            'menu-item-object' => 'page',
            'menu-item-status' => 'publish',
            'menu-item-type'   => 'post_type',
        ]);
    }

    // Add Custom Pages
    foreach ($pages as $page) {
        if (isset($created_page_ids[$page['title']])) {
            wp_update_nav_menu_item($menu_id, 0, [
                'menu-item-title'  => $page['title'],
                'menu-item-object-id' => $created_page_ids[$page['title']],
                'menu-item-object' => 'page',
                'menu-item-status' => 'publish',
                'menu-item-type'   => 'post_type',
            ]);
        }
    }

    // Assign to Theme Location 'primary' (Common standard)
    $locations = get_theme_mod('nav_menu_locations');
    $locations['primary'] = $menu_id;
    set_theme_mod('nav_menu_locations', $locations);
}
add_action('init', 'presspilot_setup_1769222536906');
