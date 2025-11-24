<?php
/**
 * WP-CLI script to test PressPilot activation bootstrap
 * 
 * Usage: wp eval-file test-bootstrap-wp-cli.php
 * Or: php test-bootstrap-wp-cli.php (if run from WordPress root)
 */

// Load WordPress
if (file_exists(__DIR__ . '/wp-load.php')) {
    require_once __DIR__ . '/wp-load.php';
} elseif (file_exists(__DIR__ . '/../../wp-load.php')) {
    require_once __DIR__ . '/../../wp-load.php';
} else {
    die("Error: Could not find wp-load.php\n");
}

// Check if function exists
if (!function_exists('presspilot_run_activation_bootstrap')) {
    die("Error: presspilot_run_activation_bootstrap function not found. Make sure the theme is active.\n");
}

echo "=== PressPilot Activation Bootstrap Test ===\n\n";

// 1. Check if presspilot-kit.json exists
$theme_dir = get_stylesheet_directory();
$kit_path = $theme_dir . '/presspilot-kit.json';

echo "1. Checking presspilot-kit.json...\n";
if (file_exists($kit_path)) {
    echo "   ✅ File exists: $kit_path\n";
    $json = file_get_contents($kit_path);
    $data = json_decode($json, true);
    if (is_array($data) && isset($data['wpImport'])) {
        echo "   ✅ Valid JSON with wpImport block\n";
        echo "   Pages: " . count($data['wpImport']['pages'] ?? []) . "\n";
        echo "   Menu items: " . count($data['wpImport']['menu']['items'] ?? []) . "\n";
    } else {
        echo "   ⚠️  JSON exists but wpImport block not found\n";
    }
} else {
    echo "   ⚠️  File not found: $kit_path\n";
    echo "   Will use fallback pages\n";
}

// 2. Clear activation flag to force rerun
echo "\n2. Clearing activation flag...\n";
delete_option('presspilot_activation_v1_done');
echo "   ✅ Flag cleared\n";

// 3. Run bootstrap
echo "\n3. Running activation bootstrap...\n";
presspilot_run_activation_bootstrap(true);
echo "   ✅ Bootstrap function executed\n";

// 4. Check activation flag
echo "\n4. Checking activation flag...\n";
$flag = get_option('presspilot_activation_v1_done');
if ($flag) {
    echo "   ✅ Flag set: presspilot_activation_v1_done = $flag\n";
} else {
    echo "   ❌ Flag NOT set - bootstrap may have failed\n";
}

// 5. Check pages created
echo "\n5. Checking pages created...\n";
$pages = get_pages(array('post_status' => 'publish'));
$expected_slugs = array('home', 'menu', 'about', 'services', 'blog', 'contact');
$found_slugs = array();

foreach ($pages as $page) {
    if (in_array($page->post_name, $expected_slugs)) {
        $found_slugs[] = $page->post_name;
        echo "   ✅ Page: {$page->post_title} (slug: {$page->post_name}, ID: {$page->ID})\n";
    }
}

$missing = array_diff($expected_slugs, $found_slugs);
if (!empty($missing)) {
    echo "   ⚠️  Missing pages: " . implode(', ', $missing) . "\n";
}

// 6. Check menu created
echo "\n6. Checking menu created...\n";
$menu = wp_get_nav_menu_object('Main Menu');
if ($menu) {
    echo "   ✅ Menu exists: Main Menu (ID: {$menu->term_id})\n";
    
    $menu_items = wp_get_nav_menu_items($menu->term_id);
    if ($menu_items) {
        echo "   ✅ Menu items: " . count($menu_items) . "\n";
        foreach ($menu_items as $item) {
            if ($item->object === 'page') {
                $page = get_post($item->object_id);
                echo "      - {$page->post_title} (slug: {$page->post_name})\n";
            }
        }
    } else {
        echo "   ⚠️  No menu items found\n";
    }
} else {
    echo "   ❌ Menu 'Main Menu' not found\n";
}

// 7. Check menu location assignment
echo "\n7. Checking menu location assignment...\n";
$locations = get_theme_mod('nav_menu_locations', array());
if (isset($locations['primary']) && $locations['primary'] == $menu->term_id) {
    echo "   ✅ Menu assigned to 'primary' location\n";
} else {
    echo "   ❌ Menu NOT assigned to 'primary' location\n";
}

// 8. Check front page setting
echo "\n8. Checking front page setting...\n";
$show_on_front = get_option('show_on_front');
$page_on_front = get_option('page_on_front');
if ($show_on_front === 'page' && $page_on_front) {
    $front_page = get_post($page_on_front);
    echo "   ✅ Front page set to: {$front_page->post_title} (ID: $page_on_front)\n";
} else {
    echo "   ⚠️  Front page not set (show_on_front: $show_on_front, page_on_front: $page_on_front)\n";
}

echo "\n=== Test Complete ===\n";

