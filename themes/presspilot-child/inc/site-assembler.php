<?php
/**
 * Module: Site Assembler
 * Ported from: presspilot-agent-plugin-v6.3
 * Purpose: Combine all pieces and create WordPress pages reliably.
 */

if (!defined('ABSPATH')) {
    exit;
}

class PressPilot_Site_Assembler
{

    /**
     * Assemble complete WordPress site
     */
    public function assemble($business_name, $theme_slug, $content, $colors, $business_type = 'corporate', $logo_url = '', $business_tagline = '')
    {
        // v6.3 Logic: Create pages
        $pages = $this->create_business_type_pages($content, $colors, $business_type, $business_tagline);

        // Auto-publish pages
        $this->auto_publish_pages($pages);

        // Auto-create and set up navigation menu
        $menu_id = $this->create_navigation_menu($business_name, $pages);

        // Set site logo if provided
        if (!empty($logo_url)) {
            $this->set_site_logo($logo_url, $business_name);
        }

        return [
            'status' => 'success',
            'pages' => $pages,
            'menu_id' => $menu_id,
            'preview_url' => get_home_url()
        ];
    }

    /**
     * Create pages based on business type
     */
    private function create_business_type_pages($content, $colors, $business_type, $business_tagline = '')
    {
        $pages = array();

        // Map standard pages
        $pages['home'] = $this->create_page('Home', $content['home'] ?? [], $colors, true, $business_type, $business_tagline);
        $pages['about'] = $this->create_page('About Us', $content['about'] ?? [], $colors, false, $business_type, $business_tagline);
        $pages['services'] = $this->create_page('Services', $content['services'] ?? [], $colors, false, $business_type, $business_tagline);
        $pages['contact'] = $this->create_page('Contact', $content['contact'] ?? [], $colors, false, $business_type, $business_tagline);
        $pages['blog'] = $this->create_page('Blog', $content['blog'] ?? [], $colors, false, $business_type, $business_tagline);

        if ($business_type === 'ecommerce') {
            $pages['shop'] = $this->create_page('Shop', $content['shop'] ?? [], $colors, false, $business_type, $business_tagline);
        }

        return $pages;
    }

    /**
     * Create WordPress page
     */
    private function create_page($title, $content_data, $colors, $is_front = false, $business_type = 'corporate', $business_tagline = '')
    {
        // Generate HTML content from structured data using patterns
        $html_content = $this->generate_page_html($title, $content_data, $colors, $business_type, $business_tagline);

        // Check if page exists to avoid infinite duplicates during dev
        $existing = get_page_by_title($title);
        if ($existing) {
            wp_delete_post($existing->ID, true); // Clean slate for this test
        }

        // Create page in WordPress
        $page_data = array(
            'post_title' => $title,
            'post_content' => $html_content,
            'post_status' => 'publish',
            'post_type' => 'page',
            'post_author' => 1, // Default admin
            'comment_status' => 'closed'
        );

        $page_id = wp_insert_post($page_data);

        if (is_wp_error($page_id)) {
            return false;
        }

        // Mark as PressPilot-generated
        update_post_meta($page_id, '_presspilot_generated', time());
        update_post_meta($page_id, 'hide_title', 'yes'); // Generic

        // Set as front page if home
        if ($is_front) {
            update_option('show_on_front', 'page');
            update_option('page_on_front', $page_id);
        }

        return array(
            'id' => $page_id,
            'title' => $title,
            'url' => get_permalink($page_id)
        );
    }

    /**
     * Generate HTML content for page
     */
    private function generate_page_html($title, $content_data, $colors, $business_type = 'corporate', $business_tagline = '')
    {
        // Get placeholder images (hardcoded from v6.3 for now)
        $images = $this->get_placeholder_images($business_type);

        if ($title === 'Home') {
            return $this->generate_home_html($content_data, $colors, $images, $business_tagline);
        } elseif ($title === 'About Us') {
            // For now, simplify non-home pages to standard blocks or placeholder text if content_data is empty
            return '<!-- wp:heading --><h1>About Us</h1><!-- /wp:heading --><!-- wp:paragraph --><p>Welcome to our about page.</p><!-- /wp:paragraph -->';
        }
        return '<!-- wp:paragraph --><p>Content coming soon.</p><!-- /wp:paragraph -->';
    }

    /**
     * Get placeholder images for business type (Ported)
     */
    private function get_placeholder_images($business_type)
    {
        $images = array(
            'restaurant' => array(
                'hero' => 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&h=800&fit=crop&q=80',
                'about' => 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=600&fit=crop&q=80',
                'service' => 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=500&fit=crop&q=80'
            ),
            'corporate' => array(
                'hero' => 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&h=800&fit=crop&q=80',
                'about' => 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop&q=80',
                'service' => 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=500&fit=crop&q=80'
            )
        );
        return isset($images[$business_type]) ? $images[$business_type] : $images['corporate'];
    }

    /**
     * Generate Home page HTML using modern patterns (Ported & Adjusted)
     */
    private function generate_home_html($data, $colors, $images, $business_tagline = '')
    {
        $pattern = $this->load_pattern('home-modern');

        // Defend against missing data
        $hero_headline = $data['hero_headline'] ?? 'Welcome to ' . $business_tagline;
        $hero_subheadline = $data['hero_subheadline'] ?? 'Serving the community with excellence.';
        $cta_text = $data['cta_text'] ?? 'Order Now';
        $primary_color = $colors['primary'] ?? '#000000';

        // Simple string replacement using the JSON pattern
        $html = str_replace([
            '{{hero_image}}',
            '{{hero_headline}}',
            '{{hero_subheadline}}',
            '{{primary_color}}',
            '{{cta_text}}'
        ], [
            $images['hero'],
            $hero_headline,
            $hero_subheadline,
            $primary_color,
            $cta_text
        ], $pattern['content']['hero_section']);

        // Append other sections (Features, Testimonials) if needed, simplified for this handover
        // $html .= ...

        return $html;
    }

    /**
     * Load pattern from JSON file (Adjusted path)
     */
    private function load_pattern($pattern_name)
    {
        $pattern_file = PRESSPILOT_CHILD_DIR . '/inc/patterns/' . $pattern_name . '.json';
        if (!file_exists($pattern_file)) {
            return false;
        }
        return json_decode(file_get_contents($pattern_file), true);
    }

    private function auto_publish_pages($pages)
    {
        foreach ($pages as $page) {
            if (isset($page['id'])) {
                wp_update_post(['ID' => $page['id'], 'post_status' => 'publish']);
            }
        }
    }

    private function create_navigation_menu($business_name, $pages)
    {
        $menu_name = $business_name . ' Menu';
        $menu_id = wp_create_nav_menu($menu_name);

        if (is_wp_error($menu_id)) {
            $menu = wp_get_nav_menu_object($menu_name);
            $menu_id = $menu ? $menu->term_id : 0;
        }

        if ($menu_id) {
            $order = ['home', 'about', 'services', 'contact'];
            $i = 1;
            foreach ($order as $key) {
                if (isset($pages[$key])) {
                    wp_update_nav_menu_item($menu_id, 0, array(
                        'menu-item-title' => $pages[$key]['title'],
                        'menu-item-object' => 'page',
                        'menu-item-object-id' => $pages[$key]['id'],
                        'menu-item-type' => 'post_type',
                        'menu-item-status' => 'publish',
                        'menu-item-position' => $i++
                    ));
                }
            }

            // Set location
            $locations = get_theme_mod('nav_menu_locations');
            $locations['primary'] = $menu_id;
            set_theme_mod('nav_menu_locations', $locations);
        }
        return $menu_id;
    }

    private function set_site_logo($logo_url, $business_name)
    {
        // Placeholder for logo logic
    }
}
