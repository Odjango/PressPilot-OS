<?php
/**
 * Manual Bake Script
 * Replaces the need for HTTP trigger.
 */
require_once('wp-load.php');

// Correctly load the assembler from the theme folder
// Note: We need to define the constants if the theme isn't fully loaded yet in this context, 
// though wp-load should handle it if the theme is active.
// Using get_stylesheet_directory() ensures we target the active child theme.

if (get_stylesheet() !== 'presspilot-child') {
    die("Error: PressPilot Child theme must be active first.\n");
}

$inc_dir = get_stylesheet_directory() . '/inc';
require_once $inc_dir . '/site-assembler.php';
require_once $inc_dir . '/content-generator.php';

// Define CHILD constant if not already defined (just in case)
if (!defined('PRESSPILOT_CHILD_DIR')) {
    define('PRESSPILOT_CHILD_DIR', get_stylesheet_directory());
}

echo "--- STARTING MANUAL BAKE (Koboo Pizza) ---\n";

$assembler = new PressPilot_Site_Assembler();

// Hardcoded Baking Data (Koboo Pizza)
$result = $assembler->assemble(
    'Koboo Pizza',
    'twentytwentyfour', // Parent theme
    [
        'home' => [
            'hero_headline' => 'Koboo Pizza Factory',
            'hero_subheadline' => 'Authentic Wood-Fired Pizza delivered to your door.',
            'cta_text' => 'Order Online'
        ],
        'about' => [],
        'services' => [],
        'contact' => []
    ],
    ['primary' => '#ff4500'],
    'restaurant',
    '', // Logo URL
    'Best Pizza in Town'
);

echo "Bake Result: " . $result['status'] . "\n";
echo "Home Page URL: " . get_permalink($result['pages']['home']['id']) . "\n";
echo "--- BAKE COMPLETE ---\n";
