import { PageData } from '../types';
import { PhpEscaper } from './PhpEscaper';

export const generateContentLoader = (pages: PageData[], businessName: string, tagline: string, logoPath?: string): string => {
    // 0. Define Starter Content
    const getStarterContent = (slug: string) => {
        // Safe Layouts: Single line strings to avoid parser errors
        const aboutContent = '<!-- wp:group {"align":"wide","layout":{"type":"constrained"}} --><div class="wp-block-group alignwide"><!-- wp:columns {"align":"wide"} --><div class="wp-block-columns alignwide"><!-- wp:column --><div class="wp-block-column"><!-- wp:image {"sizeSlug":"large","linkDestination":"none"} --><figure class="wp-block-image size-large"><img src="https://placehold.co/600x400" alt="About Us"/></figure><!-- /wp:image --></div><!-- /wp:column --><!-- wp:column {"verticalAlignment":"center"} --><div class="wp-block-column is-vertically-aligned-center"><!-- wp:heading --><h2>Our Story</h2><!-- /wp:heading --><!-- wp:paragraph --><p>We started with a simple idea: make software that just works. Today, we help thousands of businesses streamline their operations.</p><!-- /wp:paragraph --><!-- wp:buttons --><div class="wp-block-buttons"><!-- wp:button --><div class="wp-block-button"><a class="wp-block-button__link wp-element-button">Learn More</a></div><!-- /wp:button --></div><!-- /wp:buttons --></div><!-- /wp:column --></div><!-- /wp:columns --></div><!-- /wp:group -->';

        const contactContent = '<!-- wp:group {"align":"wide","layout":{"type":"constrained"}} --><div class="wp-block-group alignwide"><!-- wp:columns {"align":"wide"} --><div class="wp-block-columns alignwide"><!-- wp:column --><div class="wp-block-column"><!-- wp:heading --><h2>Get Requirements</h2><!-- /wp:heading --><!-- wp:paragraph --><p>Email: contact@presspilot.com</p><!-- /wp:paragraph --><!-- wp:paragraph --><p>Phone: +1 555-0199</p><!-- /wp:paragraph --><!-- wp:separator --><hr class="wp-block-separator has-alpha-channel-opacity"/><!-- /wp:separator --><!-- wp:heading {"level":3} --><h3>Office</h3><!-- /wp:heading --><!-- wp:paragraph --><p>123 Innovation Dr.<br>Tech City, TC 90210</p><!-- /wp:paragraph --></div><!-- /wp:column --><!-- wp:column --><div class="wp-block-column"><!-- wp:image {"sizeSlug":"large","linkDestination":"none"} --><figure class="wp-block-image size-large"><img src="https://placehold.co/600x300" alt="Map"/></figure><!-- /wp:image --></div><!-- /wp:column --></div><!-- /wp:columns --></div><!-- /wp:group -->';

        if (slug.includes('about')) return PhpEscaper.escapeSingleQuoted(aboutContent);
        if (slug.includes('contact')) return PhpEscaper.escapeSingleQuoted(contactContent);
        return '';
    };

    // 1. Prepare Pages Array
    const pagesArrayPhp = pages && pages.length > 0 ? pages.map(p => `
            [
                'title' => '${PhpEscaper.escapeSingleQuoted(p.title || p.slug || "Untitled")}',
                'slug'  => '${p.slug}',
                'content' => '${getStarterContent(p.slug)}',
            ]`).join(',') : '';

    const timestamp = Date.now();
    const funcName = `pp_setup_${timestamp}`;

    return `<?php
/**
 * Safe Auto-Content Loader
 * 
 * Automatically creates pages, assigns menus, and sets site identity 
 * ONLY upon theme activation. Non-destructive.
 */

    if (!function_exists('${funcName}')) {
        function ${funcName}() {
            // 1. Set Site Identity
            update_option('blogname', '${PhpEscaper.escapeSingleQuoted(businessName)}' );
            update_option('blogdescription', '${PhpEscaper.escapeSingleQuoted(tagline)}' );

            // 1.2 Logo: handled by PatternInjector.addLogoAutoSetup() using
            // wp_upload_bits() which is more reliable in all WP environments.

            // 1.5 CLEANUP: Default Content Removal (safe — only deletes posts/pages, never template parts)
            foreach ([1, 2, 3] as $default_id) {
                $p = get_post($default_id);
                if ($p && in_array($p->post_type, ['post', 'page'], true)) {
                    wp_delete_post($default_id, true);
                }
            }

            $junk_posts = get_posts([
                'post_type' => ['post', 'page'],
                'post_status' => ['publish', 'draft', 'private', 'trash'],
                'numberposts' => -1,
                's' => 'Hello',
            ]);
            foreach ($junk_posts as $junk) {
                wp_delete_post($junk->ID, true);
            }

            $privacy = get_page_by_path('privacy-policy');
            if ($privacy) wp_delete_post($privacy->ID, true);

            // 2. Create Pages
            $pages = [${pagesArrayPhp}
            ];

            $created_page_ids = [];

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
            
            if (isset($created_page_ids['Home']) && is_numeric($created_page_ids['Home'])) {
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

            // 3. Create & Assign Menu
            $menu_name = 'Primary Menu';
            $menu_exists = wp_get_nav_menu_object($menu_name);

            if (!$menu_exists) {
                $menu_id = wp_create_nav_menu($menu_name);

                if (!empty($menu_id) && !is_wp_error($menu_id)) {
                    if (isset($created_page_ids['Home'])) {
                        wp_update_nav_menu_item($menu_id, 0, [
                            'menu-item-title'  => 'Home',
                            'menu-item-object-id' => $created_page_ids['Home'],
                            'menu-item-object' => 'page',
                            'menu-item-status' => 'publish',
                            'menu-item-type'   => 'post_type',
                        ]);
                    }

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

                    $locations = get_theme_mod('nav_menu_locations'); 
                    if (!is_array($locations)) {
                        $locations = [];
                    }
                    $locations['primary'] = $menu_id;
                    set_theme_mod('nav_menu_locations', $locations);
                }
            }
        }
        // Mark as done so we only run once
        update_option('${funcName}_done', true);
        }
        $setup_func = ( __NAMESPACE__ ? __NAMESPACE__ . '\\\\' : '' ) . '${funcName}';
        add_action('after_switch_theme', $setup_func);

        // Also run on init if after_switch_theme didn't fire (e.g. WordPress Playground)
        function ${funcName}_maybe_run() {
            if (!get_option('${funcName}_done')) {
                ${funcName}();
            }
        }
        $init_func = ( __NAMESPACE__ ? __NAMESPACE__ . '\\\\' : '' ) . '${funcName}_maybe_run';
        add_action('init', $init_func);
    }
`;
};
