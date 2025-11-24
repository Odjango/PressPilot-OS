<?php
/**
 * PressPilot Golden Foundation helpers.
 */

if (!defined('ABSPATH')) {
    exit;
}

// Load auto import module
require_once get_stylesheet_directory() . '/inc/presspilot-auto-import.php';

// Register menu locations (ensure "primary" exists)
function presspilot_register_menus() {
    register_nav_menus(array(
        'primary' => __('Primary Menu', 'presspilot'),
    ));
}
add_action('after_setup_theme', 'presspilot_register_menus');

// Run auto-import once when theme is activated
function presspilot_on_theme_activate() {
    if (function_exists('presspilot_maybe_auto_import')) {
        presspilot_maybe_auto_import();
    }
}
add_action('after_switch_theme', 'presspilot_on_theme_activate');

if (! function_exists('presspilot_apply_brand_identity')) {
	add_action('after_switch_theme', 'presspilot_apply_brand_identity');

	function presspilot_apply_brand_identity() {
		$kit_path = get_theme_file_path('presspilot-kit.json');
		if (! file_exists($kit_path)) {
			return;
		}

		$contents = file_get_contents($kit_path);
		$data     = json_decode($contents, true);

		if (! is_array($data)) {
			return;
		}

		if (! empty($data['brandName'])) {
			update_option('blogname', sanitize_text_field($data['brandName']));
		}

		if (! empty($data['tagline'])) {
			update_option('blogdescription', sanitize_text_field($data['tagline']));
		}
	}
}

