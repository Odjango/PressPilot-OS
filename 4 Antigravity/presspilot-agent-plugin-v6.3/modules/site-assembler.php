<?php
/**
 * Module: Site Assembler
 * Purpose: Combine all pieces and create WordPress pages
 * Architecture: Modular - assembles outputs from other modules
 */

if (!defined('ABSPATH')) {
    exit;
}

class PressPilot_Site_Assembler
{

    /**
     * Assemble complete WordPress site
     */
    public function assemble($business_name, $theme, $content, $colors, $business_type = 'corporate', $logo_url = '', $business_tagline = '')
    {
        $site_data = array(
            'business_name' => $business_name,
            'business_tagline' => $business_tagline,
            'theme' => $theme,
            'colors' => $colors,
            'logo_url' => $logo_url,
            'pages' => array(),
            'timestamp' => current_time('mysql'),
            'status' => 'generated'
        );

        // Create WordPress pages based on business type
        $pages = $this->create_business_type_pages($content, $colors, $business_type, $business_tagline);

        $site_data['pages'] = $pages;
        $site_data['preview_url'] = get_permalink($pages['home']['id']);

        // Auto-publish pages (Option B enhancement)
        $this->auto_publish_pages($pages);

        // Auto-create and set up navigation menu
        $menu_id = $this->create_navigation_menu($business_name, $pages);

        // Set site logo if provided
        if (!empty($logo_url)) {
            $this->set_site_logo($logo_url, $business_name);
        }
        $site_data['menu_id'] = $menu_id;

        // Save generation record
        $this->save_generation_record($site_data);

        return $site_data;
    }

    /**
     * Create pages based on business type
     */
    private function create_business_type_pages($content, $colors, $business_type, $business_tagline = '')
    {
        $pages = array();

        if ($business_type === 'ecommerce') {
            // E-commerce specific pages
            $pages = array(
                'home' => $this->create_page('Home', $content['home'], $colors, true, $business_type, $business_tagline),
                'shop' => $this->create_page('Shop', $content['shop'], $colors, false, $business_type, $business_tagline),
                'about' => $this->create_page('About Us', $content['about'], $colors, false, $business_type, $business_tagline),
                'contact' => $this->create_page('Contact', $content['contact'], $colors, false, $business_type, $business_tagline),
                'cart' => $this->create_page('Cart', $content['cart'], $colors, false, $business_type, $business_tagline)
            );
        } else {
            // Standard business pages (restaurant, fitness, corporate, etc.)
            $pages = array(
                'home' => $this->create_page('Home', $content['home'], $colors, true, $business_type, $business_tagline),
                'about' => $this->create_page('About Us', $content['about'], $colors, false, $business_type, $business_tagline),
                'services' => $this->create_page('Services', $content['services'], $colors, false, $business_type, $business_tagline),
                'contact' => $this->create_page('Contact', $content['contact'], $colors, false, $business_type, $business_tagline),
                'blog' => $this->create_page('Blog', $content['blog'], $colors, false, $business_type, $business_tagline)
            );
        }

        return $pages;
    }

    /**
     * Create WordPress page
     */
    public function create_page($title, $content_data, $colors, $is_front = false, $business_type = 'corporate', $business_tagline = '')
    {
        // Generate HTML content from structured data
        $html_content = $this->generate_page_html($title, $content_data, $colors, $business_type, $business_tagline);

        // Create page in WordPress
        $page_data = array(
            'post_title' => $title,
            'post_content' => $html_content,
            'post_status' => 'publish', // Auto-publish for seamless experience
            'post_type' => 'page',
            'post_author' => get_current_user_id(),
            'comment_status' => 'closed'
        );

        $page_id = wp_insert_post($page_data);

        if (is_wp_error($page_id)) {
            throw new Exception('Failed to create page: ' . $title);
        }

        // Mark as PressPilot-generated for duplicate detection
        update_post_meta($page_id, '_presspilot_generated', time());

        // Hide page title to avoid duplication with H1 in content
        update_post_meta($page_id, '_wp_page_template', 'default');
        update_post_meta($page_id, 'hide_title', 'yes');
        // Support for various themes that use different meta keys
        update_post_meta($page_id, '_genesis_hide_title', true);
        update_post_meta($page_id, '_et_pb_show_title', 'off');
        update_post_meta($page_id, '_elementor_page_settings', array('hide_title' => 'yes'));

        // Set as front page if home
        if ($is_front) {
            update_option('show_on_front', 'page');
            update_option('page_on_front', $page_id);
        }

        return array(
            'id' => $page_id,
            'title' => $title,
            'url' => get_permalink($page_id),
            'edit_url' => get_edit_post_link($page_id, 'raw')
        );
    }

    /**
     * Generate HTML content for page
     */
    private function generate_page_html($title, $content_data, $colors, $business_type = 'corporate', $business_tagline = '')
    {
        // Get placeholder images for this business type
        $images = $this->get_placeholder_images($business_type);
        if ($title === 'Home') {
            return $this->generate_home_html($content_data, $colors, $images);
        } elseif ($title === 'About Us') {
            return $this->generate_about_html($content_data, $colors, $images);
        } elseif ($title === 'Services') {
            return $this->generate_services_html($content_data, $colors, $images);
        } elseif ($title === 'Shop') {
            return $this->generate_shop_html($content_data, $colors, $images);
        } elseif ($title === 'Cart') {
            return $this->generate_cart_html($content_data, $colors, $images);
        } elseif ($title === 'Contact') {
            return $this->generate_contact_html($content_data, $colors, $images);
        } elseif ($title === 'Blog') {
            return $this->generate_blog_html($content_data, $colors, $images);
        }

        return '';
    }

    /**
     * Get placeholder images for business type
     */
    private function get_placeholder_images($business_type)
    {
        // All images use consistent landscape proportions with crop
        // Hero: 1920x800 (2.4:1 dramatic), About: 1200x600 (2:1), Service: 800x500 (1.6:1)
        $images = array(
            'restaurant' => array(
                'hero' => 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&h=800&fit=crop&q=80',
                'about' => 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=600&fit=crop&q=80',
                'service' => 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=500&fit=crop&q=80'
            ),
            'fitness' => array(
                'hero' => 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&h=800&fit=crop&q=80',
                'about' => 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1200&h=600&fit=crop&q=80',
                'service' => 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&h=500&fit=crop&q=80'
            ),
            'corporate' => array(
                'hero' => 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&h=800&fit=crop&q=80',
                'about' => 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop&q=80',
                'service' => 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=500&fit=crop&q=80'
            ),
            'ecommerce' => array(
                'hero' => 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1920&h=800&fit=crop&q=80',
                'about' => 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=1200&h=600&fit=crop&q=80',
                'service' => 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&h=500&fit=crop&q=80'
            )
        );

        return isset($images[$business_type]) ? $images[$business_type] : $images['corporate'];
    }

    /**
     * Generate Home page HTML using modern patterns
     */
    private function generate_home_html($data, $colors, $images, $business_tagline = '')
    {
        return $this->generate_modern_home_html($data, $colors, $images, $business_tagline);
    }

    /**
     * Generate modern Home page with patterns
     */
    private function generate_modern_home_html($data, $colors, $images, $business_tagline = '')
    {
        $pattern = $this->load_pattern('home-modern');
        if (!$pattern) {
            return $this->generate_legacy_home_html($data, $colors, $images);
        }

        $primary_color = !empty($colors['primary']) ? $colors['primary'] : '#0073aa';

        // Build hero section with tagline integration
        $hero_subheadline = $data['hero_subheadline'];

        // If we have a tagline, use it in the hero section
        if (!empty($business_tagline)) {
            $hero_subheadline = $business_tagline . ' - ' . $hero_subheadline;
        }

        $html = str_replace([
            '{{hero_image}}',
            '{{hero_headline}}',
            '{{hero_subheadline}}',
            '{{primary_color}}',
            '{{cta_text}}'
        ], [
            esc_url($images['hero']),
            esc_html($data['hero_headline']),
            esc_html($hero_subheadline),
            esc_attr($primary_color),
            esc_html($data['cta_text'])
        ], $pattern['content']['hero_section']);

        // Build features section
        $features_columns = '';
        foreach ($data['benefits'] as $index => $benefit) {
            $features_columns .= str_replace([
                '{{primary_color}}',
                '{{benefit_title}}',
                '{{benefit_description}}'
            ], [
                esc_attr($primary_color),
                'Benefit ' . ($index + 1),
                esc_html($benefit)
            ], $pattern['content']['feature_column']);
        }

        $html .= str_replace('{{features_columns}}', $features_columns, $pattern['content']['features_section']);

        // Build testimonials section
        $testimonials = $this->get_sample_testimonials();
        $testimonial_columns = '';
        foreach ($testimonials as $testimonial) {
            $testimonial_columns .= str_replace([
                '{{primary_color}}',
                '{{testimonial_text}}',
                '{{customer_name}}'
            ], [
                esc_attr($primary_color),
                esc_html($testimonial['text']),
                esc_html($testimonial['name'])
            ], $pattern['content']['testimonial_column']);
        }

        $html .= str_replace('{{testimonial_columns}}', $testimonial_columns, $pattern['content']['testimonials_section']);

        // Build CTA section
        $html .= str_replace([
            '{{primary_color}}',
            '{{cta_description}}',
            '{{cta_button_text}}'
        ], [
            esc_attr($primary_color),
            'Contact us today to learn more about our services.',
            'Get Started Today'
        ], $pattern['content']['cta_section']);

        return $html;
    }

    /**
     * Legacy home HTML for fallback
     */
    private function generate_legacy_home_html($data, $colors, $images)
    {
        // Keep the old version as fallback
        $button_color = !empty($colors['primary']) ? $colors['primary'] : '#0073aa';

        $html = '<!-- wp:cover {"url":"' . esc_url($images['hero']) . '","dimRatio":50,"minHeight":500} -->
<div class="wp-block-cover" style="min-height:500px">
    <span aria-hidden="true" class="wp-block-cover__background has-background-dim"></span>
    <img class="wp-block-cover__image-background" alt="" src="' . esc_url($images['hero']) . '" data-object-fit="cover"/>
    <div class="wp-block-cover__inner-container">
        <!-- wp:heading {"level":1,"fontSize":"huge","style":{"color":{"text":"#ffffff"}}} -->
        <h1 class="wp-block-heading has-huge-font-size" style="color:#ffffff">' . esc_html($data['hero_headline']) . '</h1>
        <!-- /wp:heading -->
        
        <!-- wp:paragraph {"fontSize":"large","style":{"color":{"text":"#ffffff"}}} -->
        <p class="has-large-font-size" style="color:#ffffff">' . esc_html($data['hero_subheadline']) . '</p>
        <!-- /wp:paragraph -->
        
        <!-- wp:buttons -->
        <div class="wp-block-buttons">
            <!-- wp:button {"backgroundColor":"custom","style":{"color":{"background":"' . esc_attr($button_color) . '"}}} -->
            <div class="wp-block-button"><a class="wp-block-button__link has-custom-background-color has-background" style="background-color:' . esc_attr($button_color) . ';color:#ffffff">' . esc_html($data['cta_text']) . '</a></div>
            <!-- /wp:button -->
        </div>
        <!-- /wp:buttons -->
    </div>
</div>
<!-- /wp:cover -->

<!-- wp:heading {"textAlign":"center"} -->
<h2 class="wp-block-heading has-text-align-center">Why Choose Us</h2>
<!-- /wp:heading -->

<!-- wp:columns -->
<div class="wp-block-columns">';

        foreach ($data['benefits'] as $benefit) {
            $html .= '<!-- wp:column -->
<div class="wp-block-column">
    <!-- wp:paragraph {"align":"center"} -->
    <p class="has-text-align-center">✓ ' . esc_html($benefit) . '</p>
    <!-- /wp:paragraph -->
</div>
<!-- /wp:column -->';
        }

        $html .= '</div>
<!-- /wp:columns -->';

        return $html;
    }

    /**
     * Generate About page HTML
     */
    private function generate_about_html($data, $colors, $images)
    {
        // Use secondary color for accents
        $accent_color = !empty($colors['secondary']) ? $colors['secondary'] : '#333333';

        $html = '<!-- wp:image {"align":"wide","sizeSlug":"large"} -->
<figure class="wp-block-image alignwide size-large"><img src="' . esc_url($images['about']) . '" alt="About Us"/></figure>
<!-- /wp:image -->

<!-- wp:heading {"level":1,"style":{"color":{"text":"' . esc_attr($accent_color) . '"}}} -->
<h1 class="wp-block-heading" style="color:' . esc_attr($accent_color) . '">About Us</h1>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>' . esc_html($data['story']) . '</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">Our Mission</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p><em>' . esc_html($data['mission']) . '</em></p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">Our Values</h2>
<!-- /wp:heading -->

<!-- wp:list -->';

        $html .= '<ul>';
        foreach ($data['values'] as $value) {
            $html .= '<li>' . esc_html($value) . '</li>';
        }
        $html .= '</ul>
<!-- /wp:list -->';

        return $html;
    }

    /**
     * Generate Services page HTML
     */
    private function generate_services_html($data, $colors, $images)
    {
        // Use secondary color for heading accent
        $accent_color = !empty($colors['secondary']) ? $colors['secondary'] : '#333333';

        $html = '<!-- wp:heading {"level":1,"style":{"color":{"text":"' . esc_attr($accent_color) . '"}}} -->
<h1 class="wp-block-heading" style="color:' . esc_attr($accent_color) . '">Our Services</h1>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>' . esc_html($data['intro']) . '</p>
<!-- /wp:paragraph -->

<!-- wp:image {"align":"wide","sizeSlug":"large"} -->
<figure class="wp-block-image alignwide size-large"><img src="' . esc_url($images['service']) . '" alt="Our Services"/></figure>
<!-- /wp:image -->';

        foreach ($data['services'] as $service) {
            $html .= '<!-- wp:group {"style":{"spacing":{"padding":{"top":"20px","bottom":"20px"}}}} -->
<div class="wp-block-group" style="padding-top:20px;padding-bottom:20px">
    <!-- wp:heading {"level":3} -->
    <h3 class="wp-block-heading">' . esc_html($service['name']) . '</h3>
    <!-- /wp:heading -->
    
    <!-- wp:paragraph -->
    <p>' . esc_html($service['description']) . '</p>
    <!-- /wp:paragraph -->
    
    <!-- wp:paragraph -->
    <p><strong>Key Feature:</strong> ' . esc_html($service['feature']) . '</p>
    <!-- /wp:paragraph -->
</div>
<!-- /wp:group -->';
        }

        return $html;
    }

    /**
     * Generate Contact page HTML using modern patterns
     */
    private function generate_contact_html($data, $colors, $images)
    {
        $pattern = $this->load_pattern('contact-modern');
        if (!$pattern) {
            return $this->generate_legacy_contact_html($data, $colors);
        }

        $primary_color = !empty($colors['primary']) ? $colors['primary'] : '#0073aa';

        // Build header
        $html = str_replace([
            '{{primary_color}}',
            '{{headline}}',
            '{{intro}}'
        ], [
            esc_attr($primary_color),
            esc_html($data['headline']),
            esc_html($data['intro'])
        ], $pattern['content']['header_section']);

        // Build contact info cards
        $contact_info_cards = '';
        $contact_infos = [
            ['title' => 'Phone', 'content' => '(555) 123-4567'],
            ['title' => 'Email', 'content' => 'info@company.com'],
            ['title' => 'Address', 'content' => '123 Business St, City, State 12345']
        ];

        foreach ($contact_infos as $info) {
            $contact_info_cards .= str_replace([
                '{{primary_color}}',
                '{{info_title}}',
                '{{info_content}}'
            ], [
                esc_attr($primary_color),
                esc_html($info['title']),
                esc_html($info['content'])
            ], $pattern['content']['contact_info_card']);
        }

        $html .= str_replace('{{contact_info_cards}}', $contact_info_cards, $pattern['content']['contact_form_section']);

        // Build business hours
        $html .= str_replace([
            '{{hours_text}}',
            '{{response_promise}}'
        ], [
            esc_html($data['hours_text']),
            esc_html($data['response_promise'])
        ], $pattern['content']['business_hours_section']);

        return $html;
    }

    /**
     * Legacy contact HTML for fallback
     */
    private function generate_legacy_contact_html($data, $colors)
    {
        return '<!-- wp:heading {"level":1} -->
<h1 class="wp-block-heading">' . esc_html($data['headline']) . '</h1>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>' . esc_html($data['intro']) . '</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><strong>Business Hours:</strong> ' . esc_html($data['hours_text']) . '</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>' . esc_html($data['response_promise']) . '</p>
<!-- /wp:paragraph -->';
    }

    /**
     * Generate Shop page HTML for e-commerce
     */
    private function generate_shop_html($data, $colors, $images)
    {
        $primary_color = !empty($colors['primary']) ? $colors['primary'] : '#0073aa';

        $html = '<!-- wp:heading {"level":1,"style":{"color":{"text":"' . esc_attr($primary_color) . '"}}} -->
<h1 class="wp-block-heading" style="color:' . esc_attr($primary_color) . '">Our Products</h1>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>' . esc_html($data['intro']) . '</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">Featured Products</h2>
<!-- /wp:heading -->

<!-- wp:columns -->
<div class="wp-block-columns">';

        foreach ($data['products'] as $product) {
            $html .= '<!-- wp:column -->
<div class="wp-block-column">
    <!-- wp:group {"style":{"border":{"radius":"10px"},"spacing":{"padding":{"top":"20px","bottom":"20px","left":"20px","right":"20px"}},"color":{"background":"#f8f9fa"}}} -->
    <div class="wp-block-group has-background" style="background-color:#f8f9fa;border-radius:10px;padding:20px">
        <!-- wp:image {"sizeSlug":"medium"} -->
        <figure class="wp-block-image size-medium"><img src="' . esc_url($images['service']) . '" alt="Product Image"/></figure>
        <!-- /wp:image -->
        
        <!-- wp:heading {"level":3} -->
        <h3 class="wp-block-heading">' . esc_html($product['name']) . '</h3>
        <!-- /wp:heading -->
        
        <!-- wp:paragraph -->
        <p>' . esc_html($product['description']) . '</p>
        <!-- /wp:paragraph -->
        
        <!-- wp:buttons -->
        <div class="wp-block-buttons">
            <!-- wp:button {"backgroundColor":"custom","style":{"color":{"background":"' . esc_attr($primary_color) . '"}}} -->
            <div class="wp-block-button"><a class="wp-block-button__link has-custom-background-color has-background" style="background-color:' . esc_attr($primary_color) . ';color:#ffffff">View Details</a></div>
            <!-- /wp:button -->
        </div>
        <!-- /wp:buttons -->
    </div>
    <!-- /wp:group -->
</div>
<!-- /wp:column -->';
        }

        $html .= '</div>
<!-- /wp:columns -->';

        return $html;
    }

    /**
     * Generate Cart page HTML for e-commerce
     */
    private function generate_cart_html($data, $colors, $images)
    {
        $primary_color = !empty($colors['primary']) ? $colors['primary'] : '#0073aa';

        return '<!-- wp:heading {"level":1,"style":{"color":{"text":"' . esc_attr($primary_color) . '"}}} -->
<h1 class="wp-block-heading" style="color:' . esc_attr($primary_color) . '">Shopping Cart</h1>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Your cart is currently empty.</p>
<!-- /wp:paragraph -->

<!-- wp:buttons -->
<div class="wp-block-buttons">
    <!-- wp:button {"backgroundColor":"custom","style":{"color":{"background":"' . esc_attr($primary_color) . '"}}} -->
    <div class="wp-block-button"><a class="wp-block-button__link has-custom-background-color has-background" style="background-color:' . esc_attr($primary_color) . ';color:#ffffff">Continue Shopping</a></div>
    <!-- /wp:button -->
</div>
<!-- /wp:buttons -->';
    }

    /**
     * Generate Blog page HTML
     */
    private function generate_blog_html($data, $colors, $images)
    {
        $html = '<!-- wp:heading {"level":1} -->
<h1 class="wp-block-heading">Blog</h1>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>' . esc_html($data['intro']) . '</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">Coming Soon</h2>
<!-- /wp:heading -->

<!-- wp:list -->';

        $html .= '<ul>';
        foreach ($data['sample_posts'] as $post) {
            $html .= '<li>' . esc_html($post) . '</li>';
        }
        $html .= '</ul>
<!-- /wp:list -->';

        return $html;
    }

    /**
     * Auto-publish all generated pages
     */
    private function auto_publish_pages($pages)
    {
        foreach ($pages as $page) {
            wp_update_post(array(
                'ID' => $page['id'],
                'post_status' => 'publish'
            ));
        }
    }

    /**
     * Create navigation menu with proper page order
     * Order: Home → About Us → Services → Blog → Contact
     */
    private function create_navigation_menu($business_name, $pages)
    {
        // Create menu
        $menu_name = $business_name . ' Main Menu';
        $menu_id = wp_create_nav_menu($menu_name);

        if (is_wp_error($menu_id)) {
            // Menu might already exist, try to get it
            $menu = wp_get_nav_menu_object($menu_name);
            if ($menu) {
                $menu_id = $menu->term_id;
            } else {
                return false;
            }
        }

        // CRITICAL FIX: Disable Auto-Add Pages immediately to prevent order chaos
        wp_update_nav_menu_object($menu_id, array('auto_add' => false));

        // CRITICAL FIX: Clear existing items to ensure precise ordering
        $existing_items = wp_get_nav_menu_items($menu_id);
        if ($existing_items) {
            foreach ($existing_items as $item) {
                wp_delete_post($item->ID);
            }
        }

        // Define menu order based on page types
        if (isset($pages['shop'])) {
            // E-commerce menu order
            $menu_order = array(
                'home',      // 1. Home (homepage)
                'shop',      // 2. Shop (products)
                'about',     // 3. About Us (learn about business)
                'contact',   // 4. Contact (get in touch)
                'cart'       // 5. Cart (shopping cart)
            );
        } else {
            // Standard business menu order
            $menu_order = array(
                'home',      // 1. Home (homepage)
                'about',     // 2. About Us (learn about business)
                'services',  // 3. Services (what we offer)
                'blog',      // 4. Blog (content/updates)
                'contact'    // 5. Contact (get in touch)
            );
        }

        // Add pages to menu in correct order
        $position = 1;
        foreach ($menu_order as $page_key) {
            if (isset($pages[$page_key])) {
                wp_update_nav_menu_item($menu_id, 0, array(
                    'menu-item-title' => $pages[$page_key]['title'],
                    'menu-item-object' => 'page',
                    'menu-item-object-id' => $pages[$page_key]['id'],
                    'menu-item-type' => 'post_type',
                    'menu-item-status' => 'publish',
                    'menu-item-position' => $position
                ));
                $position++;
            }
        }

        // Set as primary menu location
        $locations = get_theme_mod('nav_menu_locations');
        if (!is_array($locations)) {
            $locations = array();
        }

        // Try common menu location names
        $possible_locations = array('primary', 'main', 'primary-menu', 'header-menu', 'top', 'header');
        foreach ($possible_locations as $location) {
            $locations[$location] = $menu_id;
        }

        set_theme_mod('nav_menu_locations', $locations);

        return $menu_id;
    }

    /**
     * Save generation record to database
     */
    private function save_generation_record($site_data)
    {
        global $wpdb;
        $table_name = $wpdb->prefix . 'presspilot_generations';

        $wpdb->insert($table_name, array(
            'business_name' => $site_data['business_name'],
            'theme_slug' => $site_data['theme']['slug'],
            'colors' => json_encode($site_data['colors']),
            'pages_data' => json_encode($site_data['pages']),
            'created_at' => $site_data['timestamp'],
            'status' => $site_data['status']
        ));
    }

    /**
     * Load pattern from JSON file
     */
    private function load_pattern($pattern_name)
    {
        $pattern_file = PRESSPILOT_PLUGIN_DIR . 'patterns/' . $pattern_name . '.json';

        if (!file_exists($pattern_file)) {
            return false;
        }

        $pattern_content = file_get_contents($pattern_file);
        $pattern = json_decode($pattern_content, true);

        return $pattern ? $pattern : false;
    }

    /**
     * Get sample testimonials
     */
    private function get_sample_testimonials()
    {
        return [
            ['text' => 'Excellent service and professional team. Highly recommended!', 'name' => 'Sarah Johnson'],
            ['text' => 'Outstanding results that exceeded our expectations.', 'name' => 'Mike Chen'],
            ['text' => 'Professional, reliable, and delivers on time every time.', 'name' => 'Emily Rodriguez']
        ];
    }

    /**
     * Set site logo in WordPress customizer
     */
    private function set_site_logo($logo_url, $business_name)
    {
        // Download logo to media library if it's not already there
        require_once(ABSPATH . 'wp-admin/includes/media.php');
        require_once(ABSPATH . 'wp-admin/includes/file.php');
        require_once(ABSPATH . 'wp-admin/includes/image.php');

        // Check if this is already a media library attachment
        $attachment_id = attachment_url_to_postid($logo_url);

        if (!$attachment_id) {
            // Logo is external URL, need to import it
            $tmp = download_url($logo_url);

            if (is_wp_error($tmp)) {
                return false;
            }

            $file_array = array(
                'name' => $business_name . '-logo.png',
                'tmp_name' => $tmp
            );

            $attachment_id = media_handle_sideload($file_array, 0);

            if (is_wp_error($attachment_id)) {
                @unlink($tmp);
                return false;
            }
        }

        // Set as site logo (custom_logo theme mod)
        set_theme_mod('custom_logo', $attachment_id);

        // Also set site title to business name
        update_option('blogname', $business_name);

        return true;
    }
}
