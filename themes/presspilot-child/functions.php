<?php
/**
 * PressPilot FSE Theme Functions
 */

if (!defined('ABSPATH')) {
    exit;
}

function presspilot_clean_setup()
{
    // Add support for block styles
    add_theme_support('wp-block-styles');
    add_theme_support('editor-styles');
    add_editor_style('style.css');
}
add_action('after_setup_theme', 'presspilot_clean_setup');

/**
 * Register Pattern Categories
 */
function presspilot_register_pattern_categories()
{
    register_block_pattern_category(
        'presspilot',
        array('label' => __('PressPilot', 'presspilot'))
    );
}
add_action('init', 'presspilot_register_pattern_categories');
