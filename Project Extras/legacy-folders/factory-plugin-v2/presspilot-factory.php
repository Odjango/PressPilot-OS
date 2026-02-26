<?php
/**
 * Plugin Name: PressPilot Factory
 * Plugin URI: https://presspilot.io
 * Description: WordPress theme generation engine - pattern assembly + block APIs
 * Version: 2.1.0
 * Author: PressPilot
 * License: GPL-2.0+
 * Text Domain: presspilot-factory
 * 
 * @package PressPilot_Factory
 */

// Prevent direct access
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Plugin constants
define( 'PRESSPILOT_FACTORY_VERSION', '2.1.0' );
define( 'PRESSPILOT_FACTORY_PATH', plugin_dir_path( __FILE__ ) );
define( 'PRESSPILOT_FACTORY_URL', plugin_dir_url( __FILE__ ) );
define( 'PRESSPILOT_GENERATED_THEMES_DIR', WP_CONTENT_DIR . '/themes/generated/' );

/**
 * Main Plugin Class
 */
class PressPilot_Factory {

    /**
     * Singleton instance
     */
    private static $instance = null;

    /**
     * Get singleton instance
     */
    public static function get_instance() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Constructor
     */
    private function __construct() {
        $this->load_dependencies();
        $this->init_hooks();
    }

    /**
     * Load required files
     */
    private function load_dependencies() {
        require_once PRESSPILOT_FACTORY_PATH . 'includes/class-block-builder.php';
        require_once PRESSPILOT_FACTORY_PATH . 'includes/class-pattern-factory.php';
        require_once PRESSPILOT_FACTORY_PATH . 'includes/class-theme-exporter.php';
        require_once PRESSPILOT_FACTORY_PATH . 'includes/class-rest-api.php';
        require_once PRESSPILOT_FACTORY_PATH . 'includes/class-pattern-assembler-bridge.php';
    }

    /**
     * Initialize WordPress hooks
     */
    private function init_hooks() {
        add_action( 'rest_api_init', array( $this, 'register_rest_routes' ) );
        add_action( 'init', array( $this, 'ensure_directories' ) );
    }

    /**
     * Register REST API routes
     */
    public function register_rest_routes() {
        $rest_api = new PressPilot_REST_API();
        $rest_api->register_routes();
    }

    /**
     * Ensure required directories exist
     */
    public function ensure_directories() {
        if ( ! file_exists( PRESSPILOT_GENERATED_THEMES_DIR ) ) {
            wp_mkdir_p( PRESSPILOT_GENERATED_THEMES_DIR );
        }
    }

    /**
     * v2 generation method — uses pattern assembly instead of raw block generation.
     * Called by the v2 REST endpoint with AI-generated JSON content.
     *
     * @param array $content AI-generated JSON with selected_patterns, strings, images, brand_colors, business.
     * @return array|WP_Error Generation result or error.
     */
    public function generate_theme_v2( array $content ) {
        try {
            $bridge = new PressPilot_Pattern_Assembler_Bridge();
            return $bridge->generate( $content );
        } catch ( Exception $e ) {
            return new WP_Error(
                'generation_failed',
                $e->getMessage(),
                array( 'status' => 500 )
            );
        }
    }

    /**
     * Main generation method - called by REST API (v1 legacy)
     *
     * @param array $instructions Structured JSON instructions from AI
     * @return array|WP_Error Generation result or error
     */
    public function generate_theme( $instructions ) {
        try {
            // Validate instructions
            $validation = $this->validate_instructions( $instructions );
            if ( is_wp_error( $validation ) ) {
                return $validation;
            }

            // Initialize components
            $block_builder   = new PressPilot_Block_Builder( $instructions['brand'] ?? array() );
            $pattern_factory = new PressPilot_Pattern_Factory( $block_builder );
            $theme_exporter  = new PressPilot_Theme_Exporter();

            // Generate theme slug
            $theme_slug = sanitize_title( $instructions['theme_slug'] ?? 'presspilot-theme-' . time() );
            $theme_dir  = PRESSPILOT_GENERATED_THEMES_DIR . $theme_slug . '/';

            // Create theme directory structure
            $this->create_theme_structure( $theme_dir );

            // Generate theme.json with brand colors/fonts
            $theme_json = $this->generate_theme_json( $instructions );
            file_put_contents( $theme_dir . 'theme.json', wp_json_encode( $theme_json, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES ) );

            // Generate style.css
            $style_css = $this->generate_style_css( $instructions );
            file_put_contents( $theme_dir . 'style.css', $style_css );

            // Generate template parts (header, footer)
            $this->generate_template_parts( $theme_dir, $pattern_factory, $instructions );

            // Generate templates
            $this->generate_templates( $theme_dir, $pattern_factory, $instructions );

            // Generate patterns
            $this->generate_patterns( $theme_dir, $pattern_factory, $instructions );

            // Handle assets (logo, images)
            $this->process_assets( $theme_dir, $instructions );

            // Export as ZIP
            $zip_path = $theme_exporter->create_zip( $theme_dir, $theme_slug );

            return array(
                'success'    => true,
                'theme_slug' => $theme_slug,
                'theme_dir'  => $theme_dir,
                'zip_path'   => $zip_path,
                'zip_url'    => content_url( 'themes/generated/' . $theme_slug . '.zip' ),
                'message'    => 'Theme generated successfully using native WordPress APIs',
            );

        } catch ( Exception $e ) {
            return new WP_Error(
                'generation_failed',
                $e->getMessage(),
                array( 'status' => 500 )
            );
        }
    }

    /**
     * Validate incoming instructions
     */
    private function validate_instructions( $instructions ) {
        if ( empty( $instructions ) ) {
            return new WP_Error( 'empty_instructions', 'No generation instructions provided', array( 'status' => 400 ) );
        }

        if ( empty( $instructions['business']['name'] ) ) {
            return new WP_Error( 'missing_business_name', 'Business name is required', array( 'status' => 400 ) );
        }

        return true;
    }

    /**
     * Create theme directory structure
     */
    private function create_theme_structure( $theme_dir ) {
        $directories = array(
            $theme_dir,
            $theme_dir . 'templates/',
            $theme_dir . 'parts/',
            $theme_dir . 'patterns/',
            $theme_dir . 'assets/',
            $theme_dir . 'assets/images/',
            $theme_dir . 'assets/fonts/',
        );

        foreach ( $directories as $dir ) {
            if ( ! file_exists( $dir ) ) {
                wp_mkdir_p( $dir );
            }
        }
    }

    /**
     * Generate theme.json with brand customizations
     */
    private function generate_theme_json( $instructions ) {
        $brand = $instructions['brand'] ?? array();
        $business = $instructions['business'] ?? array();

        return array(
            '$schema'  => 'https://schemas.wp.org/trunk/theme.json',
            'version'  => 3,
            'settings' => array(
                'appearanceTools' => true,
                'layout' => array(
                    'contentSize' => '1200px',
                    'wideSize'    => '1400px',
                ),
                'color' => array(
                    'palette' => array(
                        array(
                            'slug'  => 'primary',
                            'color' => $brand['primary_color'] ?? '#0073aa',
                            'name'  => 'Primary',
                        ),
                        array(
                            'slug'  => 'secondary',
                            'color' => $brand['secondary_color'] ?? '#23282d',
                            'name'  => 'Secondary',
                        ),
                        array(
                            'slug'  => 'background',
                            'color' => $brand['background_color'] ?? '#ffffff',
                            'name'  => 'Background',
                        ),
                        array(
                            'slug'  => 'foreground',
                            'color' => $brand['text_color'] ?? '#1e1e1e',
                            'name'  => 'Foreground',
                        ),
                    ),
                ),
                'typography' => array(
                    'fontFamilies' => array(
                        array(
                            'fontFamily' => $brand['heading_font'] ?? 'system-ui, sans-serif',
                            'slug'       => 'heading',
                            'name'       => 'Heading',
                        ),
                        array(
                            'fontFamily' => $brand['body_font'] ?? 'system-ui, sans-serif',
                            'slug'       => 'body',
                            'name'       => 'Body',
                        ),
                    ),
                ),
                'spacing' => array(
                    'units' => array( 'px', 'em', 'rem', '%', 'vh', 'vw' ),
                ),
            ),
            'styles' => array(
                'color' => array(
                    'background' => 'var(--wp--preset--color--background)',
                    'text'       => 'var(--wp--preset--color--foreground)',
                ),
                'typography' => array(
                    'fontFamily' => 'var(--wp--preset--font-family--body)',
                ),
                'elements' => array(
                    'link' => array(
                        'color' => array(
                            'text' => 'var(--wp--preset--color--primary)',
                        ),
                    ),
                    'heading' => array(
                        'typography' => array(
                            'fontFamily' => 'var(--wp--preset--font-family--heading)',
                        ),
                    ),
                ),
            ),
            'templateParts' => array(
                array(
                    'name'  => 'header',
                    'title' => 'Header',
                    'area'  => 'header',
                ),
                array(
                    'name'  => 'footer',
                    'title' => 'Footer',
                    'area'  => 'footer',
                ),
            ),
            'customTemplates' => array(),
        );
    }

    /**
     * Generate style.css with theme headers
     */
    private function generate_style_css( $instructions ) {
        $business = $instructions['business'] ?? array();
        $theme_name = $business['name'] ?? 'PressPilot Theme';
        
        return <<<CSS
/*
Theme Name: {$theme_name}
Theme URI: https://presspilot.io
Author: PressPilot
Author URI: https://presspilot.io
Description: Custom WordPress theme generated by PressPilot using AI-powered design
Version: 1.0.0
Requires at least: 6.4
Tested up to: 6.7
Requires PHP: 8.0
License: GNU General Public License v2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html
Text Domain: presspilot-generated
Tags: full-site-editing, block-patterns, custom-colors, custom-logo

Generated by PressPilot - AI-Powered WordPress Theme Generator
https://presspilot.io
*/

/* Theme styles are defined in theme.json */
CSS;
    }

    /**
     * Generate template parts (header, footer)
     */
    private function generate_template_parts( $theme_dir, $pattern_factory, $instructions ) {
        $content = $instructions['content'] ?? array();

        // Generate header
        $header_content = $pattern_factory->create_header( $content['header'] ?? array() );
        file_put_contents( $theme_dir . 'parts/header.html', $header_content );

        // Generate footer (PressPilot branded)
        $footer_content = $pattern_factory->create_footer( $content['footer'] ?? array() );
        file_put_contents( $theme_dir . 'parts/footer.html', $footer_content );
    }

    /**
     * Generate main templates
     */
    private function generate_templates( $theme_dir, $pattern_factory, $instructions ) {
        $templates = array(
            'index.html'      => $this->generate_index_template(),
            'front-page.html' => $pattern_factory->create_front_page( $instructions['content'] ?? array() ),
            'single.html'     => $this->generate_single_template(),
            'page.html'       => $this->generate_page_template(),
            'archive.html'    => $this->generate_archive_template(),
            '404.html'        => $this->generate_404_template(),
        );

        foreach ( $templates as $filename => $content ) {
            file_put_contents( $theme_dir . 'templates/' . $filename, $content );
        }
    }

    /**
     * Generate patterns
     */
    private function generate_patterns( $theme_dir, $pattern_factory, $instructions ) {
        $content = $instructions['content'] ?? array();
        $sections = $content['sections'] ?? array();

        foreach ( $sections as $index => $section ) {
            $pattern_content = $pattern_factory->create_section( $section );
            $pattern_name = sanitize_title( $section['type'] ?? 'section-' . $index );
            
            $pattern_file = $this->wrap_as_pattern( $pattern_content, $section );
            file_put_contents( $theme_dir . 'patterns/' . $pattern_name . '.php', $pattern_file );
        }
    }

    /**
     * Wrap block content as a registered pattern
     */
    private function wrap_as_pattern( $content, $section ) {
        $title = ucfirst( $section['type'] ?? 'Section' );
        $slug = sanitize_title( $section['type'] ?? 'section' );
        
        return <<<PHP
<?php
/**
 * Title: {$title}
 * Slug: presspilot/{$slug}
 * Categories: presspilot
 */
?>
{$content}
PHP;
    }

    /**
     * Process and copy assets
     */
    private function process_assets( $theme_dir, $instructions ) {
        $brand = $instructions['brand'] ?? array();

        // Handle logo
        if ( ! empty( $brand['logo_url'] ) ) {
            $logo_content = file_get_contents( $brand['logo_url'] );
            if ( $logo_content ) {
                $extension = pathinfo( parse_url( $brand['logo_url'], PHP_URL_PATH ), PATHINFO_EXTENSION ) ?: 'png';
                file_put_contents( $theme_dir . 'assets/images/logo.' . $extension, $logo_content );
            }
        }
    }

    // Basic template generators
    private function generate_index_template() {
        return <<<HTML
<!-- wp:template-part {"slug":"header","area":"header"} /-->

<!-- wp:group {"tagName":"main","layout":{"type":"constrained"}} -->
<main class="wp-block-group">
    <!-- wp:query {"queryId":1,"query":{"perPage":10,"pages":0,"offset":0,"postType":"post","order":"desc","orderBy":"date"}} -->
    <div class="wp-block-query">
        <!-- wp:post-template -->
            <!-- wp:post-title {"isLink":true} /-->
            <!-- wp:post-excerpt /-->
        <!-- /wp:post-template -->
        <!-- wp:query-pagination -->
            <!-- wp:query-pagination-previous /-->
            <!-- wp:query-pagination-numbers /-->
            <!-- wp:query-pagination-next /-->
        <!-- /wp:query-pagination -->
    </div>
    <!-- /wp:query -->
</main>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer","area":"footer"} /-->
HTML;
    }

    private function generate_single_template() {
        return <<<HTML
<!-- wp:template-part {"slug":"header","area":"header"} /-->

<!-- wp:group {"tagName":"main","layout":{"type":"constrained"}} -->
<main class="wp-block-group">
    <!-- wp:post-title {"level":1} /-->
    <!-- wp:post-content {"layout":{"type":"constrained"}} /-->
</main>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer","area":"footer"} /-->
HTML;
    }

    private function generate_page_template() {
        return <<<HTML
<!-- wp:template-part {"slug":"header","area":"header"} /-->

<!-- wp:group {"tagName":"main","layout":{"type":"constrained"}} -->
<main class="wp-block-group">
    <!-- wp:post-title {"level":1} /-->
    <!-- wp:post-content {"layout":{"type":"constrained"}} /-->
</main>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer","area":"footer"} /-->
HTML;
    }

    private function generate_archive_template() {
        return <<<HTML
<!-- wp:template-part {"slug":"header","area":"header"} /-->

<!-- wp:group {"tagName":"main","layout":{"type":"constrained"}} -->
<main class="wp-block-group">
    <!-- wp:query-title {"type":"archive"} /-->
    <!-- wp:query {"queryId":1,"query":{"perPage":10,"inherit":true}} -->
    <div class="wp-block-query">
        <!-- wp:post-template -->
            <!-- wp:post-title {"isLink":true} /-->
            <!-- wp:post-excerpt /-->
        <!-- /wp:post-template -->
        <!-- wp:query-pagination -->
            <!-- wp:query-pagination-previous /-->
            <!-- wp:query-pagination-numbers /-->
            <!-- wp:query-pagination-next /-->
        <!-- /wp:query-pagination -->
    </div>
    <!-- /wp:query -->
</main>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer","area":"footer"} /-->
HTML;
    }

    private function generate_404_template() {
        return <<<HTML
<!-- wp:template-part {"slug":"header","area":"header"} /-->

<!-- wp:group {"tagName":"main","layout":{"type":"constrained"}} -->
<main class="wp-block-group">
    <!-- wp:heading {"level":1} -->
    <h1>Page Not Found</h1>
    <!-- /wp:heading -->
    <!-- wp:paragraph -->
    <p>The page you're looking for doesn't exist. Please check the URL or return to the homepage.</p>
    <!-- /wp:paragraph -->
    <!-- wp:buttons -->
    <div class="wp-block-buttons">
        <!-- wp:button -->
        <div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="/">Return Home</a></div>
        <!-- /wp:button -->
    </div>
    <!-- /wp:buttons -->
</main>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer","area":"footer"} /-->
HTML;
    }
}

// Initialize plugin
function presspilot_factory_init() {
    return PressPilot_Factory::get_instance();
}
add_action( 'plugins_loaded', 'presspilot_factory_init' );
