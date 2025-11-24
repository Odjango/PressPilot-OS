<?php
/**
 * PressPilot Golden Foundation helpers.
 */

if (!defined('ABSPATH')) {
    exit;
}

// Register menu locations (ensure "primary" exists)
function presspilot_register_menus() {
    register_nav_menus(
        array(
            'primary' => __('Primary menu', 'presspilot'),
        )
    );
}
add_action('after_setup_theme', 'presspilot_register_menus');

// Load activation bootstrap module
require_once get_stylesheet_directory() . '/inc/presspilot-activate.php';

// Run activation bootstrap on theme activation
add_action('after_switch_theme', 'presspilot_run_activation_bootstrap');

// Optionally, also run once on first admin load if the flag isn't set
function presspilot_maybe_run_activation_bootstrap() {
    if (!get_option('presspilot_activation_v1_done')) {
        presspilot_run_activation_bootstrap();
    }
}
add_action('admin_init', 'presspilot_maybe_run_activation_bootstrap');

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

