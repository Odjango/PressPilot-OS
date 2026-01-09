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

    public function __construct() {
        $this->patterns_dir = PRESSPILOT_FACTORY_PATTERNS;
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

        return [
            // Business info
            'business_name'  => $params['business_name'] ?? 'Your Business',
            'tagline'        => $params['tagline'] ?? 'Your tagline here',
            'description'    => $params['description'] ?? 'Your business description.',

            // Page content
            'headline'       => $page_content['headline'] ?? $params['business_name'] ?? 'Welcome',
            'subheadline'    => $page_content['subheadline'] ?? $params['tagline'] ?? '',
            'cta_text'       => $page_content['cta_text'] ?? 'Get Started',
            'cta_url'        => $page_content['cta_url'] ?? '/contact',
            'secondary_cta'  => $page_content['secondary_cta'] ?? 'Learn More',
            'secondary_url'  => $page_content['secondary_url'] ?? '/about',

            // About content
            'about_title'    => $page_content['about_title'] ?? 'About Us',
            'about_text'     => $page_content['about_text'] ?? $params['description'] ?? '',
            'about_image'    => $page_content['about_image'] ?? 'https://placehold.co/600x400',

            // Features
            'features_title' => $page_content['features_title'] ?? 'Our Features',
            'items'          => $page_content['items'] ?? [],

            // Testimonials
            'testimonials'   => $page_content['testimonials'] ?? [],

            // Contact
            'contact_title'  => $page_content['contact_title'] ?? 'Contact Us',
            'contact_text'   => $page_content['contact_text'] ?? 'We\'d love to hear from you.',
            'email'          => $page_content['email'] ?? 'hello@example.com',
            'phone'          => $page_content['phone'] ?? '(555) 123-4567',
            'address'        => $page_content['address'] ?? '',

            // Hero image
            'hero_image'     => $page_content['hero_image'] ?? 'https://placehold.co/1920x1080',

            // Logo
            'logo'           => $params['logo'] ?? '',

            // Colors (for inline usage)
            'color_primary'   => $params['colors']['primary'] ?? '#1e40af',
            'color_secondary' => $params['colors']['secondary'] ?? '#64748b',
            'color_accent'    => $params['colors']['accent'] ?? '#f59e0b',
            'color_background'=> $params['colors']['background'] ?? '#ffffff',
            'color_text'      => $params['colors']['text'] ?? '#1f2937',
        ];
    }

    /**
     * Process repeater blocks
     */
    private function process_repeaters( $template, $data ) {
        // Match {{#items}}...{{/items}} blocks
        $pattern = '/\{\{#(\w+)\}\}(.*?)\{\{\/\1\}\}/s';

        return preg_replace_callback( $pattern, function( $matches ) use ( $data ) {
            $key = $matches[1];
            $inner_template = $matches[2];
            $output = '';

            if ( isset( $data[ $key ] ) && is_array( $data[ $key ] ) ) {
                foreach ( $data[ $key ] as $index => $item ) {
                    $item_content = $inner_template;

                    // Add index
                    $item['index'] = $index;

                    // Replace item placeholders
                    if ( is_array( $item ) ) {
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
        foreach ( $data as $key => $value ) {
            if ( is_string( $value ) || is_numeric( $value ) ) {
                $template = str_replace( '{{' . $key . '}}', esc_html( $value ), $template );
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
        ];
    }
}
