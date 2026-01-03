<?php
/**
 * PressPilot Child Theme Functions
 *
 * @package PressPilot
 * @author  WP Modern Architect
 * @since   1.0.0
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

/**
 * 1. Global Theme Setup
 * Handles basic FSE support and asset loading.
 */
function presspilot_theme_setup()
{
    // Add support for block styles.
    add_theme_support('wp-block-styles');

    // Enqueue editor styles.
    add_theme_support('editor-styles');
    add_editor_style('assets/css/editor-style.css'); // Optional: for strict editor overrides

    // Add support for full and wide align images.
    add_theme_support('align-wide');

    // Add support for responsive embeds.
    add_theme_support('responsive-embeds');

    // Add support for custom line heights.
    add_theme_support('custom-line-height');

    // Add support for post thumbnails (images).
    add_theme_support('post-thumbnails');

    // Restore Classic Menus & Widgets
    add_theme_support('menus');
    add_theme_support('widgets');
}
add_action('after_setup_theme', 'presspilot_theme_setup');


/**
 * 2. Enqueue Scripts & Styles
 * Note: specific block styles are loaded via block.json, not here!
 */

/**
 * 2. Enqueue Scripts & Styles
 * Note: specific block styles are loaded via block.json, not here!
 */
function presspilot_enqueue_assets()
{
    // Enqueue the main stylesheet (metadata + fallback).
    wp_enqueue_style(
        'presspilot-style',
        get_stylesheet_uri(),
        array(),
        wp_get_theme()->get('Version')
    );

    // Enqueue Projects Grid Assets
    if (is_front_page() || is_home() || is_page_template('page-templates/projects.php')) {
        wp_enqueue_style(
            'presspilot-projects',
            get_theme_file_uri('assets/css/projects.css'),
            array(),
            '1.0.0'
        );

        wp_enqueue_script(
            'presspilot-projects-filter',
            get_theme_file_uri('assets/js/project-filter.js'),
            array(),
            '1.0.0',
            true // In footer
        );
    }
}
add_action('wp_enqueue_scripts', 'presspilot_enqueue_assets');


/**
 * 5. Load Custom Post Types
 */
require_once get_theme_file_path('inc/projects-cpt.php');


/**
 * 3. The "Drop-in" ACF Block Auto-Loader ⚡️
 * Automatically registers any block found in the /blocks/ directory.
 */
function presspilot_register_acf_blocks()
{

    // 1. Check if blocks directory exists
    $blocks_directory = get_theme_file_path('/blocks/');
    if (!file_exists($blocks_directory)) {
        return;
    }

    // 2. Find all block.json files inside subdirectories
    $block_json_files = glob($blocks_directory . '*/block.json');

    // 3. Register each block found
    if ($block_json_files) {
        foreach ($block_json_files as $filename) {
            register_block_type($filename);
        }
    }
}
add_action('init', 'presspilot_register_acf_blocks');


/**
 * 4. ACF Local JSON Sync (Crucial for Version Control)
 * Saves your Field Group configurations to the /acf-json/ folder.
 */
function presspilot_acf_json_save_point($path)
{
    $path = get_stylesheet_directory() . '/acf-json';
    return $path;
}
add_filter('acf/settings/save_json', 'presspilot_acf_json_save_point');

function presspilot_acf_json_load_point($paths)
{
    unset($paths[0]);
    $paths[] = get_stylesheet_directory() . '/acf-json';
    return $paths;
}
add_filter('acf/settings/load_json', 'presspilot_acf_json_load_point');


/**
 * 6. Load Demo Content & Identity Setup
 * (Legacy Hotwire - replaced by Trojan Horse below, but keeping for safety if needed, 
 * actually removing to prevent conflicts as requested)
 */
// require_once get_theme_file_path( 'inc/demo-content.php' ); 

/**
 * 7. Register Navigation Menus
 */
function presspilot_register_menus()
{
    register_nav_menus(
        array(
            'primary' => esc_html__('Primary Menu', 'presspilot-child'),
        )
    );
}
add_action('after_setup_theme', 'presspilot_register_menus');


/**
 * 8. Trojan Horse Installer 🐴
 * Self-installs content and structure upon activation.
 */
require_once get_stylesheet_directory() . '/inc/site-assembler.php';

function presspilot_run_trojan_horse()
{
    // Guard: Run only once
    if (get_option('presspilot_trojan_horse_ran_v3')) {
        return;
    }

    if (!class_exists('PressPilot_Site_Assembler')) {
        return;
    }

    $assembler = new PressPilot_Site_Assembler();

    // Data definition
    $business_name = get_bloginfo('name');
    if ($business_name === 'Just another WordPress site' || empty($business_name)) {
        $business_name = 'Prego Pizza';
    }

    // Basic content for generic install
    $content = array(
        'home' => array(
            'hero_headline' => 'Welcome to ' . $business_name,
            'hero_subheadline' => 'Best Pizza in Town',
            'cta_text' => 'Order Now',
            'benefits' => array('Fresh Ingredients', 'Fast Delivery', 'Wood Fired')
        ),
        'about' => array(
            'story' => 'Our story began with a passion for dough.',
            'mission' => 'To serve the best pizza in the world.',
            'values' => array('Quality', 'Service', 'Taste')
        ),
        'services' => array('intro' => 'We offer catering and delivery.'),
        'contact' => array(
            'headline' => 'Get in Touch',
            'intro' => 'We love hearing from you.',
            'hours_text' => 'Mon-Sun 9am-10pm',
            'response_promise' => 'We reply within 24 hours.'
        ),
        'blog' => array(
            'intro' => 'Latest news',
            'sample_posts' => array('Grand Opening', 'New Menu Items')
        )
    );

    $colors = array('primary' => '#ff6b6b', 'secondary' => '#333333');

    // Run assembly
    $assembler->assemble($business_name, 'presspilot-child', $content, $colors);

    update_option('presspilot_trojan_horse_ran_v3', true);
}
// Trigger on Theme Switch
add_action('after_switch_theme', 'presspilot_run_trojan_horse');
// Trigger on Admin Init (for immediate effect if already active)
add_action('admin_init', 'presspilot_run_trojan_horse');


/**
 * 9. Hybrid Mode: Disable FSE Editor
 * We use theme.json for styles, but we are a Classic Theme structurally.
 * This removes the broken 'Appearance > Editor' link.
 */
add_action('admin_menu', 'presspilot_disable_fse_editor', 999);

function presspilot_disable_fse_editor()
{
    remove_submenu_page('themes.php', 'site-editor.php');
    remove_submenu_page('themes.php', 'site-editor.php?path=/patterns');
}
