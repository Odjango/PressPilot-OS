import { PageData } from '../types';

export const generateContentLoader = (pages: PageData[], businessName: string, tagline: string): string => {
    // 0. Define Starter Content
    const getStarterContent = (slug: string) => {
        // Safe Layouts: Single line strings to avoid parser errors
        const aboutContent = '<!-- wp:group {"align":"wide","layout":{"type":"constrained"}} --><div class="wp-block-group alignwide"><!-- wp:columns {"align":"wide"} --><div class="wp-block-columns alignwide"><!-- wp:column --><div class="wp-block-column"><!-- wp:image {"sizeSlug":"large","linkDestination":"none"} --><figure class="wp-block-image size-large"><img src="https://placehold.co/600x400" alt="About Us"/></figure><!-- /wp:image --></div><!-- /wp:column --><!-- wp:column {"verticalAlignment":"center"} --><div class="wp-block-column is-vertically-aligned-center"><!-- wp:heading --><h2>Our Story</h2><!-- /wp:heading --><!-- wp:paragraph --><p>We started with a simple idea: make software that just works. Today, we help thousands of businesses streamline their operations.</p><!-- /wp:paragraph --><!-- wp:buttons --><div class="wp-block-buttons"><!-- wp:button --><div class="wp-block-button"><a class="wp-block-button__link wp-element-button">Learn More</a></div><!-- /wp:button --></div><!-- /wp:buttons --></div><!-- /wp:column --></div><!-- /wp:columns --></div><!-- /wp:group -->';

        const contactContent = '<!-- wp:group {"align":"wide","layout":{"type":"constrained"}} --><div class="wp-block-group alignwide"><!-- wp:columns {"align":"wide"} --><div class="wp-block-columns alignwide"><!-- wp:column --><div class="wp-block-column"><!-- wp:heading --><h2>Get Requirements</h2><!-- /wp:heading --><!-- wp:paragraph --><p>Email: contact@presspilot.com</p><!-- /wp:paragraph --><!-- wp:paragraph --><p>Phone: +1 555-0199</p><!-- /wp:paragraph --><!-- wp:separator --><hr class="wp-block-separator has-alpha-channel-opacity"/><!-- /wp:separator --><!-- wp:heading {"level":3} --><h3>Office</h3><!-- /wp:heading --><!-- wp:paragraph --><p>123 Innovation Dr.<br>Tech City, TC 90210</p><!-- /wp:paragraph --></div><!-- /wp:column --><!-- wp:column --><div class="wp-block-column"><!-- wp:image {"sizeSlug":"large","linkDestination":"none"} --><figure class="wp-block-image size-large"><img src="https://placehold.co/600x300" alt="Map"/></figure><!-- /wp:image --></div><!-- /wp:column --></div><!-- /wp:columns --></div><!-- /wp:group -->';

        if (slug.includes('about')) return aboutContent.replace(/'/g, "\\'");
        if (slug.includes('contact')) return contactContent.replace(/'/g, "\\'");
        return '';
    };

    // 1. Prepare Pages Array
    const pagesArrayPhp = pages && pages.length > 0 ? pages.map(p => `
            [
                'title' => '${(p.title || p.slug || "Untitled").replace(/'/g, "\\'")}',
                'slug'  => '${p.slug}',
                'content' => '${getStarterContent(p.slug)}',
            ]`).join(',') : '';

    const timestamp = Date.now();
    const funcName = `presspilot_safe_setup_${timestamp}`;

    return `<?php
/**
 * Safe Auto-Content Loader
 * 
 * Automatically creates pages, assigns menus, and sets site identity 
 * ONLY upon theme activation. Non-destructive.
 */

function ${funcName}() {
    // 0. FLUSH CACHE
    wp_cache_flush();

    // 1. Set Site Identity
    update_option('blogname', '${businessName.replace(/'/g, "\\'")}' );
    update_option('blogdescription', '${tagline.replace(/'/g, "\\'")}' );

    // 1.5 CLEANUP: Aggressive Default Content Removal
    // Standard IDs
    wp_delete_post(1, true); // Hello World
    wp_delete_post(2, true); // Sample Page
    wp_delete_post(3, true); // Privacy Policy

    // Targeted Query for "Hello from Playground" or other artifacts
    $junk_posts = get_posts([
        'post_type' => ['post', 'page'],
        'post_status' => ['publish', 'draft', 'private', 'trash'],
        'numberposts' => -1,
        's' => 'Hello', // Search for "Hello" (World / Playground)
    ]);
    foreach ($junk_posts as $junk) {
        wp_delete_post($junk->ID, true);
    }

    $privacy = get_page_by_path('privacy-policy');
    if ($privacy) wp_delete_post($privacy->ID, true);

    // NUKE DATABASE TEMPLATE PARTS so file-based parts take precedence
    // This fixes "Double Menu" or "Broken Footer" persistence issues.
    $customized_parts = get_posts(['post_type' => 'wp_template_part', 'numberposts' => -1]);
    foreach ($customized_parts as $part) {
         wp_delete_post($part->ID, true);
    }

    // 2. Create Pages
    $pages = [${pagesArrayPhp}
    ];

    $created_page_ids = [];

    // Ensure Home Page Exists
    $home_page = get_page_by_path('home');
    if (!$home_page) {
        $home_id = wp_insert_post([
            'post_title'    => 'Home',
            'post_name'     => 'home',
            'post_content'  => '',
            'post_status'   => 'publish',
            'post_type'     => 'page',
        ]);
        $created_page_ids['Home'] = $home_id;
    } else {
        $created_page_ids['Home'] = $home_page->ID;
    }
    
    // Set Static Front Page
    if (isset($created_page_ids['Home'])) {
        update_option('show_on_front', 'page');
        update_option('page_on_front', $created_page_ids['Home']);
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

    // 3. Create & Assign Menu (Only if not exists)
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
        if (!empty($pages)) {
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
        }

        // Assign to Theme Location 'primary'
        $locations = get_theme_mod('nav_menu_locations'); 
        // Ensure locations array is initialized
        if (!is_array($locations)) {
            $locations = [];
        }
        $locations['primary'] = $menu_id;
        set_theme_mod('nav_menu_locations', $locations);
    }
}
add_action('after_switch_theme', __NAMESPACE__ . '\\${funcName}');
`;
};
