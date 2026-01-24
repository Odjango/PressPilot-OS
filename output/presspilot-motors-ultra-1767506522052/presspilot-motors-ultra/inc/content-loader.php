<?php
/**
 * Auto-Content Loader
 * 
 * Automatically creates pages upon theme activation if they don't exist.
 * This ensures the "Site Generator" output works immediately.
 */

function presspilot_auto_create_pages() {
    $pages = [
            [
                'title' => 'About Us',
                'slug'  => 'about',
                'content' => '', // Content is in the template: page-about.html
            ],
            [
                'title' => 'Our Services',
                'slug'  => 'services',
                'content' => '', // Content is in the template: page-services.html
            ],
            [
                'title' => 'Contact',
                'slug'  => 'contact',
                'content' => '', // Content is in the template: page-contact.html
            ]
    ];

    foreach ($pages as $page) {
        $existing = get_page_by_path($page['slug']);
        if (!$existing) {
            wp_insert_post([
                'post_title'    => $page['title'],
                'post_name'     => $page['slug'],
                'post_content'  => $page['content'],
                'post_status'   => 'publish',
                'post_type'     => 'page',
            ]);
        }
    }
    
    // Also ensuring a static "Home" page exists if we are in Heavy mode?
    // For now, let's just Stick to the custom pages request.
}
add_action('after_switch_theme', 'presspilot_auto_create_pages');
