<?php
/**
 * REST API - Exposes endpoints for theme generation
 *
 * Endpoints:
 * - POST /wp-json/presspilot/v1/generate  - Generate theme (legacy block builder)
 * - POST /wp-json/presspilot/v2/generate  - Generate theme (pattern assembly)
 * - GET  /wp-json/presspilot/v1/status    - Health check
 * - GET  /wp-json/presspilot/v1/export/{slug} - Download theme ZIP
 * - POST /wp-json/presspilot/v1/cleanup   - Clean old themes
 *
 * @package PressPilot_Factory
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class PressPilot_REST_API {

    /**
     * API namespace
     */
    const NAMESPACE   = 'presspilot/v1';
    const NAMESPACE_V2 = 'presspilot/v2';

    /**
     * Register all REST routes
     */
    public function register_routes() {
        // v2 pattern-assembly generation endpoint
        register_rest_route( self::NAMESPACE_V2, '/generate', array(
            'methods'             => 'POST',
            'callback'            => array( $this, 'generate_theme_v2' ),
            'permission_callback' => array( $this, 'check_api_key' ),
        ) );

        // Health check endpoint
        register_rest_route( self::NAMESPACE, '/status', array(
            'methods'             => 'GET',
            'callback'            => array( $this, 'get_status' ),
            'permission_callback' => '__return_true',
        ) );

        // Main generation endpoint
        register_rest_route( self::NAMESPACE, '/generate', array(
            'methods'             => 'POST',
            'callback'            => array( $this, 'generate_theme' ),
            'permission_callback' => array( $this, 'check_api_key' ),
            'args'                => $this->get_generate_args(),
        ) );

        // Export/download endpoint
        register_rest_route( self::NAMESPACE, '/export/(?P<slug>[a-z0-9-]+)', array(
            'methods'             => 'GET',
            'callback'            => array( $this, 'export_theme' ),
            'permission_callback' => array( $this, 'check_api_key' ),
            'args'                => array(
                'slug' => array(
                    'required'          => true,
                    'type'              => 'string',
                    'sanitize_callback' => 'sanitize_title',
                ),
            ),
        ) );

        // List generated themes
        register_rest_route( self::NAMESPACE, '/themes', array(
            'methods'             => 'GET',
            'callback'            => array( $this, 'list_themes' ),
            'permission_callback' => array( $this, 'check_api_key' ),
        ) );

        // Cleanup old themes
        register_rest_route( self::NAMESPACE, '/cleanup', array(
            'methods'             => 'POST',
            'callback'            => array( $this, 'cleanup_themes' ),
            'permission_callback' => array( $this, 'check_api_key' ),
            'args'                => array(
                'max_age_hours' => array(
                    'default' => 24,
                    'type'    => 'integer',
                ),
            ),
        ) );
    }

    /**
     * Health check endpoint
     */
    public function get_status( $request ) {
        return rest_ensure_response( array(
            'status'    => 'ok',
            'version'   => PRESSPILOT_FACTORY_VERSION,
            'wordpress' => get_bloginfo( 'version' ),
            'php'       => PHP_VERSION,
            'timestamp' => current_time( 'c' ),
            'endpoints' => array(
                'generate' => rest_url( self::NAMESPACE . '/generate' ),
                'status'   => rest_url( self::NAMESPACE . '/status' ),
                'export'   => rest_url( self::NAMESPACE . '/export/{slug}' ),
                'themes'   => rest_url( self::NAMESPACE . '/themes' ),
                'cleanup'  => rest_url( self::NAMESPACE . '/cleanup' ),
            ),
        ) );
    }

    /**
     * Main theme generation endpoint
     */
    public function generate_theme( $request ) {
        $start_time = microtime( true );

        // Get instructions from request body
        $instructions = $request->get_json_params();

        if ( empty( $instructions ) ) {
            return new WP_Error(
                'missing_instructions',
                'Request body must contain JSON generation instructions',
                array( 'status' => 400 )
            );
        }

        // Get factory instance and generate
        $factory = PressPilot_Factory::get_instance();
        $result = $factory->generate_theme( $instructions );

        if ( is_wp_error( $result ) ) {
            return $result;
        }

        // Add timing info
        $result['generation_time'] = round( microtime( true ) - $start_time, 3 ) . 's';

        return rest_ensure_response( $result );
    }

    /**
     * v2 theme generation endpoint — pattern assembly.
     *
     * Expects JSON body with: selected_patterns, strings, images, brand_colors, business.
     */
    public function generate_theme_v2( $request ) {
        $start_time = microtime( true );

        $content = $request->get_json_params();

        if ( empty( $content ) ) {
            return new WP_Error(
                'missing_content',
                'Request body must contain JSON with selected_patterns, strings, images, brand_colors, business',
                array( 'status' => 400 )
            );
        }

        $factory = PressPilot_Factory::get_instance();
        $result  = $factory->generate_theme_v2( $content );

        if ( is_wp_error( $result ) ) {
            return $result;
        }

        $result['generation_time'] = round( microtime( true ) - $start_time, 3 ) . 's';

        return rest_ensure_response( $result );
    }

    /**
     * Export/download a generated theme
     */
    public function export_theme( $request ) {
        $slug = $request->get_param( 'slug' );
        $exporter = new PressPilot_Theme_Exporter();

        $download_url = $exporter->get_download_url( $slug );

        if ( ! $download_url ) {
            return new WP_Error(
                'theme_not_found',
                'Theme not found: ' . $slug,
                array( 'status' => 404 )
            );
        }

        $size = $exporter->get_zip_size( $slug );

        return rest_ensure_response( array(
            'slug'         => $slug,
            'download_url' => $download_url,
            'file_size'    => $size,
            'file_size_mb' => round( $size / 1048576, 2 ),
        ) );
    }

    /**
     * List all generated themes
     */
    public function list_themes( $request ) {
        $generated_dir = PRESSPILOT_GENERATED_THEMES_DIR;
        $themes = array();

        if ( ! is_dir( $generated_dir ) ) {
            return rest_ensure_response( array( 'themes' => array() ) );
        }

        $items = scandir( $generated_dir );
        $exporter = new PressPilot_Theme_Exporter();

        foreach ( $items as $item ) {
            if ( $item === '.' || $item === '..' ) {
                continue;
            }

            // Only include directories (actual themes, not ZIPs)
            $item_path = $generated_dir . $item;
            if ( is_dir( $item_path ) && file_exists( $item_path . '/style.css' ) ) {
                $zip_size = $exporter->get_zip_size( $item );
                
                $themes[] = array(
                    'slug'         => $item,
                    'created'      => date( 'c', filectime( $item_path ) ),
                    'modified'     => date( 'c', filemtime( $item_path ) ),
                    'has_zip'      => $zip_size !== false,
                    'zip_size_mb'  => $zip_size ? round( $zip_size / 1048576, 2 ) : null,
                    'download_url' => $exporter->get_download_url( $item ),
                );
            }
        }

        // Sort by modified date, newest first
        usort( $themes, function( $a, $b ) {
            return strtotime( $b['modified'] ) - strtotime( $a['modified'] );
        } );

        return rest_ensure_response( array(
            'count'  => count( $themes ),
            'themes' => $themes,
        ) );
    }

    /**
     * Clean up old generated themes
     */
    public function cleanup_themes( $request ) {
        $max_age_hours = $request->get_param( 'max_age_hours' );
        $exporter = new PressPilot_Theme_Exporter();

        $cleaned = $exporter->cleanup_old_themes( $max_age_hours );

        return rest_ensure_response( array(
            'success'      => true,
            'cleaned'      => $cleaned,
            'max_age_hours' => $max_age_hours,
        ) );
    }

    /**
     * Check API key for protected endpoints
     *
     * @param WP_REST_Request $request
     * @return bool|WP_Error
     */
    public function check_api_key( $request ) {
        // Get API key from options or environment
        $valid_key = defined( 'PRESSPILOT_API_KEY' )
            ? PRESSPILOT_API_KEY
            : get_option( 'presspilot_api_key', '' );

        // If no key is set, allow all requests (for development)
        if ( empty( $valid_key ) ) {
            return true;
        }

        // Check Authorization header
        $auth_header = $request->get_header( 'Authorization' );

        if ( empty( $auth_header ) ) {
            return new WP_Error(
                'missing_api_key',
                'API key required. Include Authorization: Bearer YOUR_API_KEY header.',
                array( 'status' => 401 )
            );
        }

        // Parse Bearer token
        if ( preg_match( '/Bearer\s+(.+)$/i', $auth_header, $matches ) ) {
            $provided_key = $matches[1];

            if ( hash_equals( $valid_key, $provided_key ) ) {
                return true;
            }
        }

        return new WP_Error(
            'invalid_api_key',
            'Invalid API key',
            array( 'status' => 403 )
        );
    }

    /**
     * Get argument schema for generate endpoint
     */
    private function get_generate_args() {
        return array(
            'theme_slug' => array(
                'type'              => 'string',
                'sanitize_callback' => 'sanitize_title',
                'description'       => 'Unique slug for the generated theme',
            ),
            'business' => array(
                'type'        => 'object',
                'required'    => true,
                'description' => 'Business information',
                'properties'  => array(
                    'name' => array(
                        'type'     => 'string',
                        'required' => true,
                    ),
                    'type' => array(
                        'type' => 'string',
                    ),
                    'description' => array(
                        'type' => 'string',
                    ),
                ),
            ),
            'brand' => array(
                'type'        => 'object',
                'description' => 'Brand customization',
                'properties'  => array(
                    'primary_color'   => array( 'type' => 'string' ),
                    'secondary_color' => array( 'type' => 'string' ),
                    'logo_url'        => array( 'type' => 'string', 'format' => 'uri' ),
                    'heading_font'    => array( 'type' => 'string' ),
                    'body_font'       => array( 'type' => 'string' ),
                ),
            ),
            'content' => array(
                'type'        => 'object',
                'description' => 'Page content configuration',
                'properties'  => array(
                    'header' => array(
                        'type' => 'object',
                    ),
                    'hero' => array(
                        'type' => 'object',
                    ),
                    'sections' => array(
                        'type'  => 'array',
                        'items' => array( 'type' => 'object' ),
                    ),
                    'footer' => array(
                        'type' => 'object',
                    ),
                ),
            ),
        );
    }
}
