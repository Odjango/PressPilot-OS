<?php
/**
 * Gold Standard Restaurant Theme Functions
 *
 * @package gold-standard-restaurant
 * @author  PressPilot
 * @license GNU General Public License v2 or later
 * @link    https://presspilot.app
 */

/**
 * Set up theme defaults and register various WordPress features.
 */
function gold_standard_restaurant_setup() {

	// Enqueue editor styles and fonts.
	add_editor_style( 'style.css' );

	// Remove core block patterns.
	remove_theme_support( 'core-block-patterns' );
	
	// Add support for custom logo.
	add_theme_support( 'custom-logo' );
	
	// Add support for featured images.
	add_theme_support( 'post-thumbnails' );
}
add_action( 'after_setup_theme', 'gold_standard_restaurant_setup' );


/**
 * Enqueue styles.
 */
function gold_standard_restaurant_enqueue_styles() {
	wp_enqueue_style( 
		'gold-standard-restaurant-style', 
		get_template_directory_uri() . '/style.css', 
		array(), 
		wp_get_theme()->get( 'Version' ) 
	);
}
add_action( 'wp_enqueue_scripts', 'gold_standard_restaurant_enqueue_styles' );


/**
 * Register pattern categories for Gold Standard Restaurant.
 */
function gold_standard_restaurant_pattern_categories() {

	$block_pattern_categories = array(
		'gold-standard-restaurant/sections' => array(
			'label' => __( 'Sections', 'gold-standard-restaurant' ),
		),
		'gold-standard-restaurant/hero' => array(
			'label' => __( 'Heroes', 'gold-standard-restaurant' ),
		),
		'gold-standard-restaurant/features' => array(
			'label' => __( 'Features', 'gold-standard-restaurant' ),
		),
		'gold-standard-restaurant/restaurant' => array(
			'label' => __( 'Restaurant', 'gold-standard-restaurant' ),
		),
		'gold-standard-restaurant/call-to-action' => array(
			'label' => __( 'Call to Action', 'gold-standard-restaurant' ),
		),
		'gold-standard-restaurant/card' => array(
			'label' => __( 'Cards', 'gold-standard-restaurant' ),
		),
		'gold-standard-restaurant/posts' => array(
			'label' => __( 'Posts', 'gold-standard-restaurant' ),
		),
		'gold-standard-restaurant/testimonial' => array(
			'label' => __( 'Testimonials', 'gold-standard-restaurant' ),
		),
	);

	foreach ( $block_pattern_categories as $name => $properties ) {
		register_block_pattern_category( $name, $properties );
	}
}
add_action( 'init', 'gold_standard_restaurant_pattern_categories', 9 );
