<?php
/**
 * Pattern Loader - Loads HTML patterns and replaces placeholders
 *
 * @package PressPilot_Factory
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class PressPilot_Factory_Pattern_Loader {

    private $patterns_dir;
    private $cache = [];
    private $image_provider;

    public function __construct( $image_provider = null ) {
        $this->patterns_dir = PRESSPILOT_FACTORY_PATTERNS;
        $this->image_provider = $image_provider;
    }

    /**
     * Load a pattern file
     */
    public function load( $pattern_name ) {
        if ( isset( $this->cache[ $pattern_name ] ) ) {
            return $this->cache[ $pattern_name ];
        }

        $file = $this->patterns_dir . $pattern_name . '.html';

        if ( ! file_exists( $file ) ) {
            // Try alternate naming conventions
            $alternates = [
                $this->patterns_dir . str_replace( '-', '_', $pattern_name ) . '.html',
                $this->patterns_dir . 'hero-centered.html', // fallback for hero
            ];

            foreach ( $alternates as $alt_file ) {
                if ( file_exists( $alt_file ) ) {
                    $file = $alt_file;
                    break;
                }
            }
        }

        if ( ! file_exists( $file ) ) {
            return '';
        }

        $content = file_get_contents( $file );
        $this->cache[ $pattern_name ] = $content;

        return $content;
    }

    /**
     * Load and render a pattern with data
     */
    public function load_and_render( $pattern_name, $params ) {
        $template = $this->load( $pattern_name );

        if ( empty( $template ) ) {
            return '';
        }

        return $this->render( $template, $params );
    }

    /**
     * Render pattern template with data
     */
    public function render( $template, $params ) {
        $data = $this->prepare_render_data( $params );

        // Handle repeater blocks {{#items}}...{{/items}}
        $template = $this->process_repeaters( $template, $data );

        // Handle conditionals {{#if condition}}...{{/if}}
        $template = $this->process_conditionals( $template, $data );

        // Replace simple placeholders {{placeholder}}
        $template = $this->replace_placeholders( $template, $data );

        return $template;
    }

    /**
     * Prepare data for rendering
     */
    private function prepare_render_data( $params ) {
        $page_content = $params['page_content'] ?? [];
        $category = $params['category'] ?? 'corporate';

        // Get contextual images from image provider
        $images = $this->get_contextual_images( $category, $params );

        return [
            // Business info
            'business_name'  => $params['business_name'] ?? 'Your Business',
            'tagline'        => $params['tagline'] ?? 'Your tagline here',
            'description'    => $params['description'] ?? 'Your business description.',

            // Page content (hero section - check page_content first, then content.hero, then fallback)
            'headline'       => $page_content['headline']
                                ?? $params['content']['hero']['headline']
                                ?? $params['business_name']
                                ?? 'Welcome',
            'subheadline'    => $page_content['subheadline']
                                ?? $params['content']['hero']['subheadline']
                                ?? $params['tagline']
                                ?? '',
            'cta_text'       => $page_content['cta_text']
                                ?? $params['content']['hero']['cta_text']
                                ?? 'Get Started',
            'cta_url'        => $page_content['cta_url']
                                ?? $params['content']['hero']['cta_url']
                                ?? '/contact',
            'secondary_cta'  => $page_content['secondary_cta']
                                ?? $params['content']['hero']['secondary_cta']
                                ?? 'Learn More',
            'secondary_url'  => $page_content['secondary_url']
                                ?? $params['content']['hero']['secondary_url']
                                ?? '/about',

            // About content
            'about_title'    => $page_content['about_title'] ?? 'About Us',
            'about_text'     => $page_content['about_text'] ?? $params['description'] ?? '',
            'about_image'    => $page_content['about_image'] ?? $images['about_image'],

            // Features
            'features_title' => $page_content['features_title'] ?? $page_content['title'] ?? 'Our Features',
            'items'          => $page_content['items']
                                ?? $params['content']['features']['items']
                                ?? $this->get_default_features(),

            // Values section
            'values_title'    => $params['content']['values']['title'] ?? $page_content['values_title'] ?? 'Our Values',
            'values_subtitle' => $params['content']['values']['subtitle'] ?? $page_content['values_subtitle'] ?? 'What we stand for',
            'values_items'    => $params['content']['values']['items'] ?? $page_content['values_items'] ?? $this->get_default_values(),

            // Testimonials (with avatars)
            'testimonials'   => $this->prepare_testimonials_with_avatars(
                                    $page_content['testimonials']
                                    ?? $params['content']['testimonials']['items']
                                    ?? $this->get_default_testimonials(),
                                    $images
                                ),

            // Contact
            'contact_title'  => $page_content['contact_title'] ?? 'Contact Us',
            'contact_text'   => $page_content['contact_text'] ?? 'We\'d love to hear from you.',
            'email'          => $page_content['email'] ?? $params['content']['contact']['email'] ?? 'hello@example.com',
            'phone'          => $page_content['phone'] ?? $params['content']['contact']['phone'] ?? '(555) 123-4567',
            'address'        => $page_content['address'] ?? $params['content']['contact']['address'] ?? '',

            // Menu page (restaurant)
            'menu_title'      => $page_content['menu_title'] ?? $params['content']['menu']['title'] ?? 'Our Menu',
            'menu_subtitle'   => $page_content['menu_subtitle'] ?? $params['content']['menu']['subtitle'] ?? 'Delicious dishes made fresh daily',
            'menu_categories' => $page_content['menu_categories'] ?? $params['content']['menu']['categories'] ?? $this->get_default_menu_categories(),

            // Hero image - API provided, then content.hero, then generated
            'hero_image'     => $page_content['hero_image']
                                ?? $params['content']['hero']['hero_image']
                                ?? $images['hero_image'],

            // Logo
            'logo'           => $params['logo'] ?? '',

            // Colors (for inline usage)
            'color_primary'   => $params['colors']['primary'] ?? '#1e40af',
            'color_secondary' => $params['colors']['secondary'] ?? '#64748b',
            'color_accent'    => $params['colors']['accent'] ?? '#f59e0b',
            'color_background'=> $params['colors']['background'] ?? '#ffffff',
            'color_text'      => $params['colors']['text'] ?? '#1f2937',

            // Auto-calculated contrast-safe text colors (WCAG AA compliant)
            'color_primary_text'   => PressPilot_Factory_Color_Utils::get_contrast_color( $params['colors']['primary'] ?? '#1e40af' ),
            'color_secondary_text' => PressPilot_Factory_Color_Utils::get_contrast_color( $params['colors']['secondary'] ?? '#64748b' ),
            'color_accent_text'    => PressPilot_Factory_Color_Utils::get_contrast_color( $params['colors']['accent'] ?? '#f59e0b' ),

            // Color variants
            'color_primary_light'  => PressPilot_Factory_Color_Utils::lighten( $params['colors']['primary'] ?? '#1e40af', 20 ),
            'color_primary_dark'   => PressPilot_Factory_Color_Utils::darken( $params['colors']['primary'] ?? '#1e40af', 20 ),
        ];
    }

    /**
     * Get contextual images based on category
     */
    private function get_contextual_images( $category, $params ) {
        // If image provider is available, use it
        if ( $this->image_provider ) {
            return $this->image_provider->get_all_images( $category );
        }

        // Fallback to placeholder images
        return [
            'hero_image'  => 'https://placehold.co/1920x1080',
            'about_image' => 'https://placehold.co/800x600',
            'feature_1'   => 'https://placehold.co/600x400',
            'feature_2'   => 'https://placehold.co/600x400',
            'feature_3'   => 'https://placehold.co/600x400',
            'avatar_1'    => 'https://placehold.co/150x150',
            'avatar_2'    => 'https://placehold.co/150x150',
            'avatar_3'    => 'https://placehold.co/150x150',
        ];
    }

    /**
     * Prepare testimonials with avatar images
     */
    private function prepare_testimonials_with_avatars( $testimonials, $images ) {
        if ( ! is_array( $testimonials ) ) {
            return $testimonials;
        }

        $avatar_keys = [ 'avatar_1', 'avatar_2', 'avatar_3' ];

        foreach ( $testimonials as $index => &$testimonial ) {
            // Only add avatar if not already set or using placeholder
            if ( empty( $testimonial['avatar'] ) || strpos( $testimonial['avatar'], 'placehold' ) !== false ) {
                $avatar_key = $avatar_keys[ $index % 3 ];
                $testimonial['avatar'] = $images[ $avatar_key ] ?? 'https://placehold.co/150x150';
            }
        }

        return $testimonials;
    }

    /**
     * Process repeater blocks (supports nested repeaters)
     */
    private function process_repeaters( $template, $data ) {
        // Match {{#key}}...{{/key}} blocks (non-greedy for nested support)
        $pattern = '/\{\{#(\w+)\}\}(.*?)\{\{\/\1\}\}/s';

        // Process multiple times to handle nested repeaters
        $max_iterations = 5;
        $iteration = 0;

        while ( preg_match( $pattern, $template ) && $iteration < $max_iterations ) {
            $template = preg_replace_callback( $pattern, function( $matches ) use ( $data ) {
                $key = $matches[1];
                $inner_template = $matches[2];
                $output = '';

                // Get the array data for this repeater key
                $items = $data[ $key ] ?? [];

                if ( is_array( $items ) && ! empty( $items ) ) {
                    foreach ( $items as $index => $item ) {
                        $item_content = $inner_template;

                        // Add index
                        if ( is_array( $item ) ) {
                            $item['index'] = $index;

                            // First, process any nested repeaters within this item
                            // Look for nested {{#subkey}}...{{/subkey}} patterns
                            foreach ( $item as $item_key => $item_value ) {
                                if ( is_array( $item_value ) ) {
                                    // This is a nested array (like 'items' within a category)
                                    // Process nested repeater
                                    $nested_pattern = '/\{\{#' . preg_quote( $item_key, '/' ) . '\}\}(.*?)\{\{\/' . preg_quote( $item_key, '/' ) . '\}\}/s';
                                    $item_content = preg_replace_callback( $nested_pattern, function( $nested_matches ) use ( $item_value ) {
                                        $nested_template = $nested_matches[1];
                                        $nested_output = '';

                                        foreach ( $item_value as $nested_index => $nested_item ) {
                                            $nested_content = $nested_template;

                                            if ( is_array( $nested_item ) ) {
                                                $nested_item['index'] = $nested_index;
                                                foreach ( $nested_item as $nested_key => $nested_val ) {
                                                    if ( is_string( $nested_val ) || is_numeric( $nested_val ) ) {
                                                        $nested_content = str_replace(
                                                            '{{' . $nested_key . '}}',
                                                            esc_html( $nested_val ),
                                                            $nested_content
                                                        );
                                                    }
                                                }
                                            }

                                            $nested_output .= $nested_content;
                                        }

                                        return $nested_output;
                                    }, $item_content );
                                }
                            }

                            // Replace simple item placeholders
                            foreach ( $item as $item_key => $item_value ) {
                                if ( is_string( $item_value ) || is_numeric( $item_value ) ) {
                                    $item_content = str_replace(
                                        '{{' . $item_key . '}}',
                                        esc_html( $item_value ),
                                        $item_content
                                    );
                                }
                            }
                        }

                        $output .= $item_content;
                    }
                }

                return $output;
            }, $template );

            $iteration++;
        }

        return $template;
    }

    /**
     * Process conditional blocks
     */
    private function process_conditionals( $template, $data ) {
        // Match {{#if condition}}...{{/if}} blocks
        $pattern = '/\{\{#if\s+(\w+)\}\}(.*?)\{\{\/if\}\}/s';

        return preg_replace_callback( $pattern, function( $matches ) use ( $data ) {
            $condition = $matches[1];
            $inner_content = $matches[2];

            // Check if condition is truthy
            if ( isset( $data[ $condition ] ) && ! empty( $data[ $condition ] ) ) {
                return $inner_content;
            }

            return '';
        }, $template );
    }

    /**
     * Replace simple placeholders
     */
    private function replace_placeholders( $template, $data ) {
        // Keys that should not be escaped (like color values)
        $raw_keys = [
            'color_primary', 'color_secondary', 'color_accent', 'color_background', 'color_text',
            'color_primary_text', 'color_secondary_text', 'color_accent_text',
            'color_primary_light', 'color_primary_dark',
        ];

        foreach ( $data as $key => $value ) {
            if ( is_string( $value ) || is_numeric( $value ) ) {
                // Don't escape color values (they contain # which would be escaped)
                if ( in_array( $key, $raw_keys, true ) ) {
                    $template = str_replace( '{{' . $key . '}}', $value, $template );
                } else {
                    $template = str_replace( '{{' . $key . '}}', esc_html( $value ), $template );
                }
            }
        }

        // Remove any remaining unmatched placeholders
        $template = preg_replace( '/\{\{[^}]+\}\}/', '', $template );

        return $template;
    }

    /**
     * Get all available patterns
     */
    public function get_available_patterns() {
        $patterns = [];
        $files = glob( $this->patterns_dir . '*.html' );

        foreach ( $files as $file ) {
            $name = basename( $file, '.html' );
            $patterns[] = $name;
        }

        return $patterns;
    }

    /**
     * Get pattern categories map
     */
    public function get_pattern_categories() {
        return [
            'hero'         => [ 'hero-centered', 'hero-split', 'hero-minimal' ],
            'features'     => [ 'features-grid' ],
            'testimonials' => [ 'testimonials' ],
            'cta'          => [ 'cta-banner' ],
            'about'        => [ 'about-content' ],
            'services'     => [ 'services-grid' ],
            'contact'      => [ 'contact-form' ],
            'menu'         => [ 'menu-grid' ],
        ];
    }

    /**
     * Get default menu categories for restaurant sites
     */
    private function get_default_menu_categories() {
        return [
            [
                'icon' => '🍕',
                'name' => 'Pizzas',
                'items' => [
                    [ 'name' => 'Margherita', 'price' => '$14', 'description' => 'Fresh mozzarella, tomato sauce, basil' ],
                    [ 'name' => 'Pepperoni', 'price' => '$16', 'description' => 'Pepperoni, mozzarella, tomato sauce' ],
                    [ 'name' => 'Quattro Formaggi', 'price' => '$18', 'description' => 'Four cheese blend with herbs' ],
                ],
            ],
            [
                'icon' => '🍝',
                'name' => 'Pasta',
                'items' => [
                    [ 'name' => 'Spaghetti Bolognese', 'price' => '$15', 'description' => 'Traditional meat sauce with fresh herbs' ],
                    [ 'name' => 'Fettuccine Alfredo', 'price' => '$14', 'description' => 'Creamy parmesan sauce' ],
                    [ 'name' => 'Penne Arrabbiata', 'price' => '$13', 'description' => 'Spicy tomato sauce with garlic' ],
                ],
            ],
            [
                'icon' => '🥗',
                'name' => 'Appetizers & Sides',
                'items' => [
                    [ 'name' => 'Garlic Bread', 'price' => '$6', 'description' => 'Toasted with garlic butter and herbs' ],
                    [ 'name' => 'Caesar Salad', 'price' => '$9', 'description' => 'Romaine, parmesan, croutons' ],
                    [ 'name' => 'Bruschetta', 'price' => '$8', 'description' => 'Toasted bread with fresh tomatoes' ],
                ],
            ],
        ];
    }

    /**
     * Get default features for all sites
     */
    private function get_default_features() {
        return [
            [
                'icon' => '⭐',
                'title' => 'Quality First',
                'description' => 'We never compromise on quality in everything we do.',
            ],
            [
                'icon' => '🚀',
                'title' => 'Fast Service',
                'description' => 'Quick turnaround times without sacrificing quality.',
            ],
            [
                'icon' => '💬',
                'title' => 'Great Support',
                'description' => 'Our team is here to help you every step of the way.',
            ],
        ];
    }

    /**
     * Get default values for about page
     */
    private function get_default_values() {
        return [
            [
                'icon' => '⭐',
                'title' => 'Quality',
                'description' => 'We never compromise on ingredients',
            ],
            [
                'icon' => '❤️',
                'title' => 'Passion',
                'description' => 'We put love into everything we do',
            ],
            [
                'icon' => '🤝',
                'title' => 'Community',
                'description' => 'Proud to serve our local neighborhood',
            ],
        ];
    }

    /**
     * Get default testimonials
     */
    private function get_default_testimonials() {
        return [
            [
                'quote' => 'Absolutely amazing experience! The quality and service exceeded all my expectations.',
                'name' => 'Sarah Johnson',
                'role' => 'Happy Customer',
                'avatar' => 'https://placehold.co/48x48',
            ],
            [
                'quote' => 'I have been a loyal customer for years. They never disappoint!',
                'name' => 'Michael Chen',
                'role' => 'Regular Customer',
                'avatar' => 'https://placehold.co/48x48',
            ],
            [
                'quote' => 'The best in town, hands down. Highly recommend to everyone!',
                'name' => 'Emily Davis',
                'role' => 'First-time Visitor',
                'avatar' => 'https://placehold.co/48x48',
            ],
        ];
    }
}
