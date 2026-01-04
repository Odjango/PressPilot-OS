<?php
/**
 * Load Scripts
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

/**
 * Enqueue Frontend Scripts.
 *
 * @since 0.0.1
 * @return void
 */
function enqueue_frontend_scripts(): void {
	if ( false === apply_filters( 'swt_enqueue_frontend_scripts', true ) ) {
		return;
	}

	$file_prefix = defined( 'SWT_DEBUG' ) && SWT_DEBUG ? '' : '.min';
	$dir_name    = defined( 'SWT_DEBUG' ) && SWT_DEBUG ? 'unminified' : 'minified';


	$js_uri = defined( 'SWT_DEBUG' ) && SWT_DEBUG ? get_uri() . 'build/' : get_uri() . 'assets/js/';
	$asset  = defined( 'SWT_DEBUG' ) && SWT_DEBUG ? require SWT_DIR . 'build/script.asset.php' : require SWT_DIR . 'assets/js/script.asset.php';
	$deps   = $asset['dependencies'];

	$css_uri = get_uri() . 'assets/css/' . $dir_name . '/';

	/* RTL */
	if ( is_rtl() ) {
		$file_prefix .= '-rtl';
	}

	/* Load Theme Styles*/
	wp_enqueue_style( SWT_SLUG, $css_uri . 'style' . $file_prefix . '.css', array(), SWT_VER );

	wp_enqueue_style( SWT_SLUG . '-gutenberg', $css_uri . 'gutenberg' . $file_prefix . '.css', array(), SWT_VER );

	$swt_inline_css = apply_filters( 'swt_dynamic_theme_css', '' );
	if ( $swt_inline_css ) {
		wp_add_inline_style( SWT_SLUG, $swt_inline_css );
	}

	/* Load Woocommerce Styles */
	if ( class_exists( 'WooCommerce' ) ) {
		wp_enqueue_style( SWT_SLUG . '-woocommerce', $css_uri . 'compatibility/woocommerce' . $file_prefix . '.css', array(), SWT_VER );
	}

	/* Load Theme Scripts*/
	wp_register_script( SWT_SLUG, $js_uri . 'script.js', $deps, SWT_VER, true );

	wp_enqueue_script( SWT_SLUG );

	$swt_inline_js = apply_filters( 'swt_dynamic_theme_js', '' );

	if ( $swt_inline_js ) {
		wp_add_inline_script( SWT_SLUG, $swt_inline_js );
	}
}

add_action( 'wp_enqueue_scripts', SWT_NS . 'enqueue_frontend_scripts' );

/**
 * Enqueue Editor Scripts.
 *
 * @since 0.0.1
 *
 * @return void
 */
function enqueue_editor_scripts(): void {
	if ( false === apply_filters( 'swt_enqueue_editor_scripts', true ) ) {
		return;
	}

	$file_prefix = defined( 'SWT_DEBUG' ) && SWT_DEBUG ? '' : '.min';
	$dir_name    = defined( 'SWT_DEBUG' ) && SWT_DEBUG ? 'unminified' : 'minified';

	$css_uri = get_uri() . 'assets/css/' . $dir_name . '/';

	/* RTL */
	if ( is_rtl() ) {
		$file_prefix .= '-rtl';
	}

	

	$js    = defined( 'SWT_DEBUG' ) && SWT_DEBUG ? get_uri() . 'build/' : get_uri() . 'assets/js/';
	$asset = defined( 'SWT_DEBUG' ) && SWT_DEBUG ? require SWT_DIR . 'build/editor.asset.php' : require SWT_DIR . 'assets/js/editor.asset.php';
	$deps  = $asset['dependencies'];    
	array_push( $deps, 'updates' );
	
	wp_enqueue_style( SWT_SLUG . '-gutenberg-editor', $css_uri . 'gutenberg-editor' . $file_prefix . '.css', array(), SWT_VER );

	wp_register_script( SWT_SLUG . '-editor', $js . 'editor.js', $deps, SWT_VER, true );

	wp_enqueue_script( SWT_SLUG . '-editor' );

	$editor_script_data = localize_editor_script();
	if ( is_array( $editor_script_data ) ) {
		wp_localize_script(
			SWT_SLUG . '-editor',
			SWT_LOC,
			$editor_script_data
		);
	}
}

add_action( 'enqueue_block_editor_assets', SWT_NS . 'enqueue_editor_scripts' );

/**
 * Localize Editor Script.
 *
 * @since 0.0.1
 *
 * @return mixed|void
 */
function localize_editor_script() {

	return apply_filters(
		'swt_editor_localize',
		array(
			'is_spectra_plugin' => defined( 'UAGB_VER' ),
			'disable_sections'  => get_disable_section_fields(),
			'pluginStatus'      => is_spectra_plugin_status(),
			'pluginSlug'        => 'ultimate-addons-for-gutenberg',
			'nonce'				=> wp_create_nonce( 'wp_rest' ),
			'activationUrl'     => esc_url(
				add_query_arg(
					array(
						'plugin_status' => 'all',
						'paged'         => '1',
						'action'        => 'activate',
						'plugin'        => rawurlencode( 'ultimate-addons-for-gutenberg/ultimate-addons-for-gutenberg.php' ),
						'_wpnonce'      => wp_create_nonce( 'activate-plugin_ultimate-addons-for-gutenberg/ultimate-addons-for-gutenberg.php' ),
					),
					admin_url( 'plugins.php' )
				)
			),
		)
	);
}

/**
 * Enqueue Editor Scripts.
 *
 * @since 0.0.1
 *
 * @return void
 */
function enqueue_editor_block_styles(): void {

	// Disable Core Block Patterns.
	remove_theme_support( 'core-block-patterns' );

	$file_prefix = defined( 'SWT_DEBUG' ) && SWT_DEBUG ? '' : '.min';
	$dir_name    = defined( 'SWT_DEBUG' ) && SWT_DEBUG ? 'unminified' : 'minified';

	$css_uri = get_uri() . 'assets/css/' . $dir_name . '/';

	// Add support for block styles.
	add_theme_support( 'wp-block-styles' );

	// Enqueue editor styles.
	add_editor_style( $css_uri . 'editor' . $file_prefix . '.css' );

	add_editor_style( $css_uri . 'gutenberg' . $file_prefix . '.css' );
}

add_action( 'after_setup_theme', SWT_NS . 'enqueue_editor_block_styles' );

/**
 * Enqueue Editor Scripts.
 *
 * @since 0.0.3
 *
 * @return void
 */
function spectra_one_setup(): void {
	/*
	* Make theme available for translation.
	* Translations can be filed at WordPress.org. See: https://translate.wordpress.org/projects/wp-themes/twentyfifteen
	* If you're building a theme based on spectra-one, use a find and replace
	* to change 'spectra-one' to the name of your theme in all the template files
	*/
	load_theme_textdomain( 'spectra-one', get_uri() . 'languages' );
}

add_action( 'after_setup_theme', SWT_NS . 'spectra_one_setup' );



/**
 * Pattern categories.
 *
 * @since 1.0.0
 *
 * @return void
 */
function pattern_categories(): void {

	$block_pattern_categories = array(
		'pages'   => array(
			'label' => __( 'Pages', 'spectra-one' ),
		),
		'contact' => array(
			'label' => __( 'Contact', 'spectra-one' ),
		),
		'pricing' => array(
			'label' => __( 'Pricing', 'spectra-one' ),
		),
	);

	foreach ( $block_pattern_categories as $name => $properties ) {
		register_block_pattern_category( $name, $properties );
	}

}

add_action( 'after_setup_theme', SWT_NS . 'pattern_categories' );
