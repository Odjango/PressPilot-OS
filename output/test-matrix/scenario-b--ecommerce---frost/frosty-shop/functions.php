<?php
/**
 * This file adds functions to the Frost WordPress theme.
 *
 * @package Frost
 * @author  WP Engine
 * @license GNU General Public License v3
 * @link    https://frostwp.com/
 */

if ( ! function_exists( 'frost_setup' ) ) {

	/**
	 * Sets up theme defaults and registers support for various WordPress features.
	 */
	function frost_setup() {

		// Make theme available for translation.
		load_theme_textdomain( 'frost', get_template_directory() . '/languages' );

		// Enqueue editor stylesheet.
		add_editor_style( get_template_directory_uri() . '/style.css' );

		// Remove core block patterns.
		remove_theme_support( 'core-block-patterns' );

	}
}
add_action( 'after_setup_theme', 'frost_setup' );

// Enqueue stylesheet.
add_action( 'wp_enqueue_scripts', 'frost_enqueue_stylesheet' );
function frost_enqueue_stylesheet() {

	wp_enqueue_style( 'frost', get_template_directory_uri() . '/style.css', array(), wp_get_theme()->get( 'Version' ) );

}

/**
 * Register block styles.
 */
function frost_register_block_styles() {

	$block_styles = array(
		'core/columns' => array(
			'columns-reverse' => __( 'Reverse', 'frost' ),
		),
		'core/group' => array(
			'shadow-light' => __( 'Shadow', 'frost' ),
			'shadow-solid' => __( 'Solid', 'frost' ),
		),
		'core/list' => array(
			'no-disc' => __( 'No Disc', 'frost' ),
		),
		'core/quote' => array(
			'shadow-light' => __( 'Shadow', 'frost' ),
			'shadow-solid' => __( 'Solid', 'frost' ),
		),
		'core/social-links' => array(
			'outline' => __( 'Outline', 'frost' ),
		),
	);

	foreach ( $block_styles as $block => $styles ) {
		foreach ( $styles as $style_name => $style_label ) {
			register_block_style(
				$block,
				array(
					'name'  => $style_name,
					'label' => $style_label,
				)
			);
		}
	}
}
add_action( 'init', 'frost_register_block_styles' );

/**
 * Register block pattern categories.
 */
function frost_register_block_pattern_categories() {

	register_block_pattern_category(
		'frost-page',
		array(
			'label'       => __( 'Page', 'frost' ),
			'description' => __( 'Create a full page with multiple patterns that are grouped together.', 'frost' ),
		)
	);
	register_block_pattern_category(
		'frost-pricing',
		array(
			'label'       => __( 'Pricing', 'frost' ),
			'description' => __( 'Compare features for your digital products or service plans.', 'frost' ),
		)
	);

}

add_action( 'init', 'frost_register_block_pattern_categories' );

// PressPilot Auto-Loader (Direct Injection - 1.1.0 NUCLEAR)
/**
 * Auto-Content Loader
 * 
 * Automatically creates pages, assigns menus, and sets site identity upon theme activation.
 */

function presspilot_setup_1769222536661() {
    // 0. FLUSH CACHE (Critical for persistence)
    wp_cache_flush();

    // 1. Set Site Identity
    update_option('blogname', 'Frosty Shop' . ' [UPDATED]' );
    update_option('blogdescription', '' );

    // 2. Create Pages
    $pages = [
            [
                'title' => 'Untitled',
                'slug'  => 'undefined',
                'content' => '', // Content is in the template: page-undefined.html
            ],
            [
                'title' => 'Untitled',
                'slug'  => 'undefined',
                'content' => '', // Content is in the template: page-undefined.html
            ]
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
add_action('init', 'presspilot_setup_1769222536661');
