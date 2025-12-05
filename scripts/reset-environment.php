<?php
/**
 * PressPilot Environment Reset Script
 * Usage: wp eval-file scripts/reset-environment.php
 */

// Try to load WordPress
$possible_paths = [
    __DIR__ . '/../wp-load.php',
    __DIR__ . '/../../wp-load.php',
    __DIR__ . '/../../../wp-load.php',
    __DIR__ . '/../../../../wp-load.php',
    $_SERVER['PWD'] . '/wp-load.php'
];

$loaded = false;
foreach ($possible_paths as $path) {
    if (file_exists($path)) {
        require_once $path;
        $loaded = true;
        break;
    }
}

if (!$loaded && !defined('ABSPATH')) {
    die("Error: Could not find wp-load.php. Please run this script from within a WordPress installation.\n");
}

echo "=== PressPilot Environment Reset ===\n";

// 1. Delete All Content
$post_types = ['page', 'post', 'wp_navigation', 'wp_template', 'wp_template_part', 'wp_global_styles', 'nav_menu_item'];
foreach ($post_types as $pt) {
    $posts = get_posts(['post_type' => $pt, 'numberposts' => -1, 'post_status' => 'any']);
    $count = count($posts);
    foreach ($posts as $p) {
        wp_delete_post($p->ID, true);
    }
    echo "Deleted $count items of type '$pt'.\n";
}

// 2. Reset Options
update_option('show_on_front', 'posts');
update_option('page_on_front', 0);
update_option('blogname', 'WordPress');
echo "Reset site options (show_on_front, blogname).\n";

// 3. Flush Rewrite Rules
flush_rewrite_rules();
echo "Flushed rewrite rules.\n";

echo "=== Reset Complete ===\n";
echo "You may now activate the theme.\n";
