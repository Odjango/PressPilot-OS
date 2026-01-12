<?php
/**
 * REST API Handler for PressPilot Factory
 *
 * @package PressPilot_Factory
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class PressPilot_Factory_Api_Handler {

    private $cleanup_handler;
    private $brand_applier;
    private $content_builder;
    private $navigation_builder;
    private $theme_exporter;
    private $static_exporter;

    private $namespace = 'presspilot/v1';

    public function __construct(
        PressPilot_Factory_Cleanup_Handler $cleanup_handler,
        PressPilot_Factory_Brand_Applier $brand_applier,
        PressPilot_Factory_Content_Builder $content_builder,
        PressPilot_Factory_Navigation_Builder $navigation_builder,
        PressPilot_Factory_Theme_Exporter $theme_exporter,
        PressPilot_Factory_Static_Exporter $static_exporter
    ) {
        $this->cleanup_handler    = $cleanup_handler;
        $this->brand_applier      = $brand_applier;
        $this->content_builder    = $content_builder;
        $this->navigation_builder = $navigation_builder;
        $this->theme_exporter     = $theme_exporter;
        $this->static_exporter    = $static_exporter;
    }

    public function register_routes() {
        register_rest_route( $this->namespace, '/generate', [
            'methods'             => 'POST',
            'callback'            => [ $this, 'handle_generate' ],
            'permission_callback' => [ $this, 'check_permission' ],
            'args'                => $this->get_generate_args(),
        ]);

        register_rest_route( $this->namespace, '/cleanup', [
            'methods'             => 'POST',
            'callback'            => [ $this, 'handle_cleanup' ],
            'permission_callback' => [ $this, 'check_permission' ],
        ]);

        register_rest_route( $this->namespace, '/status/(?P<id>[a-zA-Z0-9_-]+)', [
            'methods'             => 'GET',
            'callback'            => [ $this, 'handle_status' ],
            'permission_callback' => [ $this, 'check_permission' ],
        ]);
    }

    public function check_permission( WP_REST_Request $request ) {
        // Check for API key in header
        $api_key = $request->get_header( 'X-PressPilot-Key' );
        $stored_key = get_option( 'presspilot_api_key' );

        if ( $stored_key && $api_key === $stored_key ) {
            return true;
        }

        // Fallback to capability check
        return current_user_can( 'manage_options' );
    }

    private function get_generate_args() {
        return [
            'businessName' => [
                'required'          => true,
                'type'              => 'string',
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'tagline' => [
                'required'          => false,
                'type'              => 'string',
                'sanitize_callback' => 'sanitize_text_field',
                'default'           => '',
            ],
            'description' => [
                'required'          => false,
                'type'              => 'string',
                'sanitize_callback' => 'sanitize_textarea_field',
                'default'           => '',
            ],
            'category' => [
                'required'          => true,
                'type'              => 'string',
                'enum'              => [ 'corporate', 'restaurant', 'ecommerce', 'agency', 'startup', 'local', 'healthcare', 'realestate', 'fitness', 'education' ],
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'colors' => [
                'required' => false,
                'type'     => 'object',
                'default'  => [
                    'primary'   => '#1e40af',
                    'secondary' => '#64748b',
                    'accent'    => '#f59e0b',
                    'background'=> '#ffffff',
                    'text'      => '#1f2937',
                ],
            ],
            'fonts' => [
                'required' => false,
                'type'     => 'object',
                'default'  => [
                    'heading' => 'Inter',
                    'body'    => 'Inter',
                ],
            ],
            'logo' => [
                'required'          => false,
                'type'              => 'string',
                'sanitize_callback' => 'esc_url_raw',
                'default'           => '',
            ],
            'variation' => [
                'required'          => false,
                'type'              => 'string',
                'enum'              => [ 'original', 'high-contrast', 'inverted' ],
                'default'           => 'original',
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'layout' => [
                'required'          => false,
                'type'              => 'string',
                'enum'              => [ '', 'modern', 'classic', 'minimal', 'elegant', 'bold', 'corporate', 'creative', 'startup', 'agency', 'local', 'ecommerce', 'restaurant' ],
                'default'           => '',
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'content' => [
                'required' => false,
                'type'     => 'object',
                'default'  => [],
            ],
        ];
    }

    public function handle_generate( WP_REST_Request $request ) {
        $generation_id = 'gen_' . wp_generate_uuid4();
        $start_time = microtime( true );

        try {
            // Get category first to determine recommended layout
            $category = $request->get_param( 'category' );
            $layout = $request->get_param( 'layout' );

            // If no layout specified, use category's recommended layout
            if ( empty( $layout ) ) {
                $layout = PressPilot_Factory_Category_Config::get_recommended_layout( $category );
            }

            // Extract parameters
            $params = [
                'business_name' => $request->get_param( 'businessName' ),
                'tagline'       => $request->get_param( 'tagline' ),
                'description'   => $request->get_param( 'description' ),
                'category'      => $category,
                'colors'        => $request->get_param( 'colors' ),
                'fonts'         => $request->get_param( 'fonts' ),
                'logo'          => $request->get_param( 'logo' ),
                'variation'     => $request->get_param( 'variation' ),
                'layout'        => $layout,
                'content'       => $request->get_param( 'content' ),
            ];

            // Step 1: Cleanup previous generation
            $this->cleanup_handler->cleanup();

            // Step 2: Apply branding (colors, fonts, logo)
            $this->brand_applier->apply( $params );

            // Step 3: Create pages based on category
            $pages = $this->create_pages_for_category( $params );

            // Step 4: Create navigation menu
            $menu_id = $this->navigation_builder->create_menu( $params['business_name'], $pages, $params['category'] );

            // Step 5: Store generation metadata BEFORE exporting (needed for static export colors)
            update_option( 'presspilot_last_generation', [
                'id'        => $generation_id,
                'timestamp' => current_time( 'mysql' ),
                'params'    => $params,
                'pages'     => $pages,
                'menu_id'   => $menu_id,
            ]);

            // Step 6: Export theme ZIP
            $theme_zip = $this->theme_exporter->export( $params, $generation_id );

            // Step 7: Export static site via Simply Static
            $static_zip = $this->static_exporter->export( $generation_id );

            // Calculate duration
            $duration = round( microtime( true ) - $start_time, 2 );

            return new WP_REST_Response([
                'success'       => true,
                'generation_id' => $generation_id,
                'preview_url'   => home_url( '/' ),
                'downloads'     => [
                    'theme_zip'  => $theme_zip,
                    'static_zip' => $static_zip,
                ],
                'pages_created' => count( $pages ),
                'duration'      => $duration . 's',
            ], 200 );

        } catch ( Exception $e ) {
            return new WP_REST_Response([
                'success'       => false,
                'generation_id' => $generation_id,
                'error'         => $e->getMessage(),
            ], 500 );
        }
    }

    private function create_pages_for_category( $params ) {
        $pages = [];
        $category = $params['category'];
        $content = $params['content'];

        // Get pages from category config
        $category_pages = PressPilot_Factory_Category_Config::get_pages( $category );
        $nav_order = PressPilot_Factory_Category_Config::get_nav_order( $category );

        // Create pages in nav order for proper menu generation
        foreach ( $nav_order as $slug ) {
            if ( ! isset( $category_pages[ $slug ] ) ) {
                continue;
            }

            $page_config = $category_pages[ $slug ];
            $page_content = $content[ $slug ] ?? [];

            $page_id = $this->content_builder->create_page(
                $page_config['title'],
                $slug,
                $page_config['patterns'],
                array_merge( $params, [ 'page_content' => $page_content ] )
            );

            if ( $page_id ) {
                $pages[ $slug ] = [
                    'id'    => $page_id,
                    'title' => $page_config['title'],
                    'url'   => get_permalink( $page_id ),
                ];

                // Set front page
                if ( $slug === 'home' ) {
                    update_option( 'show_on_front', 'page' );
                    update_option( 'page_on_front', $page_id );
                }
            }
        }

        return $pages;
    }

    public function handle_cleanup( WP_REST_Request $request ) {
        try {
            $count = $this->cleanup_handler->cleanup();

            return new WP_REST_Response([
                'success' => true,
                'message' => sprintf( 'Cleaned up %d items', $count ),
            ], 200 );

        } catch ( Exception $e ) {
            return new WP_REST_Response([
                'success' => false,
                'error'   => $e->getMessage(),
            ], 500 );
        }
    }

    public function handle_status( WP_REST_Request $request ) {
        $id = $request->get_param( 'id' );
        $last_gen = get_option( 'presspilot_last_generation' );

        if ( ! $last_gen || $last_gen['id'] !== $id ) {
            return new WP_REST_Response([
                'success' => false,
                'error'   => 'Generation not found',
            ], 404 );
        }

        return new WP_REST_Response([
            'success'       => true,
            'generation_id' => $last_gen['id'],
            'timestamp'     => $last_gen['timestamp'],
            'pages'         => $last_gen['pages'],
        ], 200 );
    }
}
