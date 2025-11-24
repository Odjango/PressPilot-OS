<?php
/**
 * PressPilot Golden Foundation helpers.
 */

if (!defined('ABSPATH')) {
    exit;
}

// Load FSE-native bootstrap module
require_once get_stylesheet_directory() . '/inc/presspilot-bootstrap.php';

// Run bootstrap on theme activation (ideal path)
add_action('after_switch_theme', 'presspilot_bootstrap_from_kit');

// Fallback: run bootstrap on admin init if not done yet (self-healing)
function presspilot_maybe_bootstrap_on_admin() {
    if (get_option('presspilot_bootstrap_done_v2')) {
        return;
    }

    if (!is_admin()) {
        return;
    }

    if (!current_user_can('manage_options')) {
        return;
    }

    if (!function_exists('presspilot_bootstrap_from_kit')) {
        return;
    }

    presspilot_bootstrap_from_kit();
}
add_action('admin_init', 'presspilot_maybe_bootstrap_on_admin');

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

