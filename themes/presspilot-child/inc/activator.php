<?php
/**
 * Theme Activator
 * Sets up Site Identity (Title, Logo) from generated config.
 */

if (!defined('ABSPATH')) {
    exit;
}

function presspilot_setup_site_identity()
{
    // 1. Check if we have already run (optional, but good for perf)
    // In a "generator" context, we might want to force it every time the theme is switched to.

    // 2. Read site-info.json
    $info_file = get_stylesheet_directory() . '/site-info.json';
    if (!file_exists($info_file)) {
        return;
    }

    $info = json_decode(file_get_contents($info_file), true);
    if (!$info) {
        return;
    }

    // 3. Set Site Title & Tagline
    if (!empty($info['name'])) {
        update_option('blogname', sanitize_text_field($info['name']));
    }
    if (!empty($info['tagline'])) {
        update_option('blogdescription', sanitize_text_field($info['tagline']));
    }

    // 4. Handle Logo (if remote URL provided)
    if (!empty($info['logo'])) {
        presspilot_sideload_logo($info['logo'], $info['name']);
    }
}
add_action('after_switch_theme', 'presspilot_setup_site_identity');

/**
 * Helper: Download and Set Logo
 */
function presspilot_sideload_logo($url, $desc)
{
    require_once(ABSPATH . 'wp-admin/includes/media.php');
    require_once(ABSPATH . 'wp-admin/includes/file.php');
    require_once(ABSPATH . 'wp-admin/includes/image.php');

    // Check if valid URL
    if (filter_var($url, FILTER_VALIDATE_URL) === false) {
        return;
    }

    // Download to temp
    $temp_file = download_url($url);
    if (is_wp_error($temp_file)) {
        return;
    }

    // Array based on $_FILES keys
    $file = array(
        'name' => basename(parse_url($url, PHP_URL_PATH)),
        'tmp_name' => $temp_file,
    );

    if (empty($file['name'])) {
        $file['name'] = 'logo.png';
    }

    // Upload to Media Library
    $attachment_id = media_handle_sideload($file, 0, $desc . ' Logo');

    if (!is_wp_error($attachment_id)) {
        // Set as Custom Logo
        set_theme_mod('custom_logo', $attachment_id);
    }

    // Cleanup
    @unlink($temp_file);
}
