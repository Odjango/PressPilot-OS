
import { PageData } from '../types';


export const generateContentLoader = (pages: PageData[], businessName: string, tagline: string): string => {
    // 1. Prepare Pages Array
    const pagesArrayPhp = pages && pages.length > 0 ? pages.map(p => `
            [
                'title' => '${p.title.replace(/'/g, "\\'")}',
                'slug'  => '${p.slug}',
                'content' => '', // Content is in the template: page-${p.slug}.html
            ]`).join(',') : '';

    return `<?php
/**
 * Auto-Content Loader
 * 
 * Automatically creates pages, assigns menus, and sets site identity upon theme activation.
 */

function presspilot_auto_setup() {
    // 1. Set Site Identity
    update_option('blogname', '${businessName.replace(/'/g, "\\'")}');
    update_option('blogdescription', '${tagline.replace(/'/g, "\\'")}');

    // 2. Create Pages
    $pages = [${pagesArrayPhp}
    ];

    $created_page_ids = [];

    // Ensure Home Page Exists (if not in custom pages)
    $home_page = get_page_by_path('home');
    if (!$home_page) {
        $home_id = wp_insert_post([
            'post_title'    => 'Home',
            'post_name'     => 'home',
            'post_content'  => '',
            'post_status'   => 'publish',
            'post_type'     => 'page',
        ]);
        update_option('show_on_front', 'page');
        update_option('page_on_front', $home_id);
        $created_page_ids['Home'] = $home_id;
    } else {
        $created_page_ids['Home'] = $home_page->ID;
        update_option('show_on_front', 'page');
        update_option('page_on_front', $home_page->ID);
    }

    foreach ($pages as $page) {
        $existing = get_page_by_path($page['slug']);
        if (!$existing) {
            $id = wp_insert_post([
                'post_title'    => $page['title'],
                'post_name'     => $page['slug'],
                'post_content'  => $page['content'],
                'post_status'   => 'publish',
                'post_type'     => 'page',
            ]);
            $created_page_ids[$page['title']] = $id;
        } else {
            $created_page_ids[$page['title']] = $existing->ID;
        }
    }

    // 3. Create & Assign Menu
    $menu_name = 'Primary Menu';
    $menu_exists = wp_get_nav_menu_object($menu_name);

    if (!$menu_exists) {
        $menu_id = wp_create_nav_menu($menu_name);

        // Add Home Link
        if (isset($created_page_ids['Home'])) {
            wp_update_nav_menu_item($menu_id, 0, [
                'menu-item-title'  => 'Home',
                'menu-item-object-id' => $created_page_ids['Home'],
                'menu-item-object' => 'page',
                'menu-item-status' => 'publish',
                'menu-item-type'   => 'post_type',
            ]);
        }

        // Add Custom Pages
        foreach ($pages as $page) {
            if (isset($created_page_ids[$page['title']])) {
                wp_update_nav_menu_item($menu_id, 0, [
                    'menu-item-title'  => $page['title'],
                    'menu-item-object-id' => $created_page_ids[$page['title']],
                    'menu-item-object' => 'page',
                    'menu-item-status' => 'publish',
                    'menu-item-type'   => 'post_type',
                ]);
            }
        }

        // Assign to Theme Location 'primary' (Common standard)
        $locations = get_theme_mod('nav_menu_locations');
        $locations['primary'] = $menu_id;
        set_theme_mod('nav_menu_locations', $locations);
    }
}
add_action('after_switch_theme', 'presspilot_auto_setup');
`;
};
