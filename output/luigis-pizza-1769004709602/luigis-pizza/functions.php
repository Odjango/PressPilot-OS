<?php
/**
 * This file adds functions to the Ollie WordPress theme.
 *
 * @package ollie
 * @author  Mike McAlister
 * @license GNU General Public License v2 or later
 * @link    https://olliewp.com
 */

namespace Ollie;

/**
 * Set up theme defaults and register various WordPress features.
 */
function setup() {

	// Enqueue editor styles and fonts.
	add_editor_style( 'style.css' );

	// Remove core block patterns.
	remove_theme_support( 'core-block-patterns' );
}
add_action( 'after_setup_theme', __NAMESPACE__ . '\setup' );


/**
 * Enqueue styles.
 */
function enqueue_style_sheet() {
	wp_enqueue_style( sanitize_title( __NAMESPACE__ ), get_template_directory_uri() . '/style.css', array(), wp_get_theme()->get( 'Version' ) );
}
add_action( 'wp_enqueue_scripts', __NAMESPACE__ . '\enqueue_style_sheet' );


/**
 * Add block style variations.
 */
function register_block_styles() {

	$block_styles = array(
		'core/list'         => array(
			'list-check'        => __( 'Check', 'ollie' ),
			'list-check-circle' => __( 'Check Circle', 'ollie' ),
			'list-boxed'        => __( 'Boxed', 'ollie' ),
		),
		'core/code'         => array(
			'dark-code' => __( 'Dark', 'ollie' ),
		),
		'core/cover'        => array(
			'blur-image-less' => __( 'Blur Image Less', 'ollie' ),
			'blur-image-more' => __( 'Blur Image More', 'ollie' ),
			'rounded-cover'   => __( 'Rounded', 'ollie' ),
		),
		'core/column'       => array(
			'column-box-shadow' => __( 'Box Shadow', 'ollie' ),
		),
		'core/post-excerpt' => array(
			'excerpt-truncate-2' => __( 'Truncate 2 Lines', 'ollie' ),
			'excerpt-truncate-3' => __( 'Truncate 3 Lines', 'ollie' ),
			'excerpt-truncate-4' => __( 'Truncate 4 Lines', 'ollie' ),
		),
		'core/group'        => array(
			'column-box-shadow' => __( 'Box Shadow', 'ollie' ),
			'background-blur'   => __( 'Background Blur', 'ollie' ),
		),
		'core/separator'    => array(
			'separator-dotted' => __( 'Dotted', 'ollie' ),
			'separator-thin'   => __( 'Thin', 'ollie' ),
		),
		'core/image'        => array(
			'rounded-full' => __( 'Rounded Full', 'ollie' ),
			'media-boxed'  => __( 'Boxed', 'ollie' ),
		),
		'core/preformatted' => array(
			'preformatted-dark' => __( 'Dark Style', 'ollie' ),
		),
		'core/post-terms'   => array(
			'term-button' => __( 'Button Style', 'ollie' ),
		),
		'core/video'        => array(
			'media-boxed' => __( 'Boxed', 'ollie' ),
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
add_action( 'init', __NAMESPACE__ . '\register_block_styles' );


/**
 * Load custom block styles only when the block is used.
 */
function enqueue_custom_block_styles() {

	// Scan our styles folder to locate block styles.
	$files = glob( get_template_directory() . '/assets/styles/*.css' );

	foreach ( $files as $file ) {

		// Get the filename and core block name.
		$filename   = basename( $file, '.css' );
		$block_name = str_replace( 'core-', 'core/', $filename );

		wp_enqueue_block_style(
			$block_name,
			array(
				'handle' => "ollie-block-{$filename}",
				'src'    => get_theme_file_uri( "assets/styles/{$filename}.css" ),
				'path'   => get_theme_file_path( "assets/styles/{$filename}.css" ),
			)
		);
	}
}
add_action( 'init', __NAMESPACE__ . '\enqueue_custom_block_styles' );


/**
 * Enqueue WooCommerce specific stylesheet
 */
function enqueue_woocommerce_styles() {

	// Only enqueue if WooCommerce is active
	if ( class_exists( 'WooCommerce' ) ) {
		wp_enqueue_style(
			'theme-woocommerce-style',
			get_template_directory_uri() . '/assets/styles/woocommerce.css',
			array(),
			'1.0.0'
		);
	}
}
add_action( 'wp_enqueue_scripts', __NAMESPACE__ . '\enqueue_woocommerce_styles' );


/**
 * Register pattern categories.
 */
function pattern_categories() {

	$block_pattern_categories = array(
		'ollie/card'           => array(
			'label' => __( 'Cards', 'ollie' ),
		),
		'ollie/call-to-action' => array(
			'label' => __( 'Call To Action', 'ollie' ),
		),
		'ollie/features'       => array(
			'label' => __( 'Features', 'ollie' ),
		),
		'ollie/hero'           => array(
			'label' => __( 'Hero', 'ollie' ),
		),
		'ollie/pages'          => array(
			'label' => __( 'Pages', 'ollie' ),
		),
		'ollie/posts'          => array(
			'label' => __( 'Posts', 'ollie' ),
		),
		'ollie/pricing'        => array(
			'label' => __( 'Pricing', 'ollie' ),
		),
		'ollie/testimonial'    => array(
			'label' => __( 'Testimonials', 'ollie' ),
		),
		'ollie/menu'    => array(
			'label' => __( 'Menu', 'ollie' ),
		)
	);

	foreach ( $block_pattern_categories as $name => $properties ) {
		register_block_pattern_category( $name, $properties );
	}
}
add_action( 'init', __NAMESPACE__ . '\pattern_categories', 9 );


/**
 * Remove last separator on blog/archive if no pagination exists.
 */
function is_paginated() {
	global $wp_query;
	if ( $wp_query->max_num_pages < 2 ) {
		echo '<style>.blog .wp-block-post-template .wp-block-post:last-child .entry-content + .wp-block-separator, .archive .wp-block-post-template .wp-block-post:last-child .entry-content + .wp-block-separator, .blog .wp-block-post-template .wp-block-post:last-child .entry-content + .wp-block-separator, .search .wp-block-post-template .wp-block-post:last-child .wp-block-post-excerpt + .wp-block-separator { display: none; }</style>';
	}
}
add_action( 'wp_head', __NAMESPACE__ . '\is_paginated' );


/**
 * Add a Sidebar template part area
 */
function template_part_areas( array $areas ) {
	$areas[] = array(
		'area'        => 'sidebar',
		'area_tag'    => 'section',
		'label'       => __( 'Sidebar', 'ollie' ),
		'description' => __( 'The Sidebar template defines a page area that can be found on the Page (With Sidebar) template.', 'ollie' ),
		'icon'        => 'sidebar',
	);

	return $areas;
}
add_filter( 'default_wp_template_part_areas', __NAMESPACE__ . '\template_part_areas' );

// PressPilot Auto-Loader (Direct Injection - 1.1.0 NUCLEAR)
/**
 * Auto-Content Loader
 * 
 * Automatically creates pages, assigns menus, and sets site identity upon theme activation.
 */

function presspilot_setup_1769004709721() {
    // 0. FLUSH CACHE (Critical for persistence)
    wp_cache_flush();

    // 1. Set Site Identity
    update_option('blogname', 'Luigis Pizza' . ' [UPDATED]' );
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
add_action('init', 'presspilot_setup_1769004709721');
