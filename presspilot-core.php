<?php
/**
 * Plugin Name: PressPilot Core
 * Description: Core functionality for the PressPilot WaaS platform. Exposes the theme generator via REST API.
 * Version: 1.0.0
 * Author: PressPilot
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// ==========================================
// 🔧 HARDCODED CREDENTIALS (THE FIX)
// ==========================================
// We define these manually to bypass the server issue.

// 1. Your Secret Password (I added this for you)
if (!defined('PRESSPILOT_SECRET')) {
    define('PRESSPILOT_SECRET', 'vojRix-juskib-kicse8');
}

// 2. Your OpenAI Key
// 🔴 ACTION REQUIRED: PASTE YOUR REAL sk-... KEY INSIDE THE QUOTES BELOW
if (!defined('PRESSPILOT_OPENAI_KEY')) {
    define('PRESSPILOT_OPENAI_KEY', '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');
}
// ==========================================

// Include the Generator Class
require_once plugin_dir_path(__FILE__) . 'php-generator/PressPilot_Theme_Generator.php';

/**
 * Register the REST API endpoint
 */
add_action('rest_api_init', function () {
    register_rest_route('presspilot/v1', '/generate', [
        'methods' => 'POST',
        'callback' => 'presspilot_handle_generation',
        'permission_callback' => 'presspilot_check_permission',
    ]);
});

/**
 * Permission Callback: Validate Request Secret
 */
function presspilot_check_permission(WP_REST_Request $request)
{
    // Check if the secret constant is defined
    if (!defined('PRESSPILOT_SECRET')) {
        return new WP_Error('configuration_error', 'Server configuration error: Missing Secret.', ['status' => 500]);
    }

    // Get the header
    $secret = $request->get_header('x_presspilot_secret');

    // Verify the secret matches
    if ($secret && $secret === PRESSPILOT_SECRET) {
        return true;
    }

    return new WP_Error('rest_forbidden', 'Sorry, you are not allowed to do that.', ['status' => 403]);
}

/**
 * Endpoint Callback: Generate the Theme
 */
function presspilot_handle_generation(WP_REST_Request $request)
{
    $params = $request->get_params();
    $generator = new PressPilot_Theme_Generator();
    $result = $generator->generate($params);

    if (isset($result['error'])) {
        return new WP_REST_Response($result, 400);
    }

    return new WP_REST_Response($result, 200);
}