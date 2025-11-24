<?php
/**
 * PressPilot Golden Foundation helpers.
 */

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

