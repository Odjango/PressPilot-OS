<?php
/**
 * PressPilot Child Theme Functions
 * Acts as the bootstrapper for the Factory Logic.
 */

if (!defined('PRESSPILOT_CHILD_DIR')) {
    define('PRESSPILOT_CHILD_DIR', get_stylesheet_directory());
}

if (!defined('PRESSPILOT_CHILD_URI')) {
    define('PRESSPILOT_CHILD_URI', get_stylesheet_directory_uri());
}

function presspilot_child_enqueue_styles()
{
    wp_enqueue_style('parent-style', get_template_directory_uri() . '/style.css');
    wp_enqueue_style('child-style', get_stylesheet_directory_uri() . '/style.css', array('parent-style'));
}
add_action('wp_enqueue_scripts', 'presspilot_child_enqueue_styles');

/**
 * Load Factory Engine
 * Ported from v6.3 Plugin Logic
 */
require_once PRESSPILOT_CHILD_DIR . '/inc/site-assembler.php';
require_once PRESSPILOT_CHILD_DIR . '/inc/content-generator.php'; // Optional, if we need to generate new text
require_once PRESSPILOT_CHILD_DIR . '/inc/shim.php'; // CLI/Trigger Shim

/**
 * Register Patterns Category
 */
function presspilot_register_patterns()
{
    register_block_pattern_category(
        'presspilot',
        array('label' => __('PressPilot Factory', 'presspilot-child'))
    );
}
add_action('init', 'presspilot_register_patterns');
