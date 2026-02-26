<?php
/**
 * Pattern Assembler Bridge
 *
 * Bridges the new presspilot-patterns/ library into the Factory Plugin.
 * Loads pattern helpers, Content_Handler, and renders patterns from
 * AI-generated JSON content — no raw block generation.
 *
 * @package PressPilot_Factory
 * @since 2.1.0
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class PressPilot_Pattern_Assembler_Bridge {

    /**
     * Path to the presspilot-patterns directory.
     *
     * @var string
     */
    private $patterns_base;

    /**
     * Path to pattern PHP files.
     *
     * @var string
     */
    private $patterns_dir;

    /**
     * Pattern registry data.
     *
     * @var array
     */
    private $registry;

    /**
     * Constructor.
     *
     * @param string|null $patterns_base Override path to presspilot-patterns/.
     */
    public function __construct( $patterns_base = null ) {
        $this->patterns_base = $patterns_base
            ? trailingslashit( $patterns_base )
            : trailingslashit( dirname( PRESSPILOT_FACTORY_PATH ) ) . 'presspilot-patterns/';

        $this->patterns_dir = $this->patterns_base . 'patterns/';

        $this->load_dependencies();
        $this->load_registry();
    }

    /**
     * Load helper functions and content handler.
     */
    private function load_dependencies() {
        $helpers = $this->patterns_dir . 'pattern-helpers.php';
        if ( file_exists( $helpers ) ) {
            require_once $helpers;
        }

        $content_handler = $this->patterns_base . 'inc/class-content-handler.php';
        if ( file_exists( $content_handler ) ) {
            require_once $content_handler;
        }
    }

    /**
     * Load the pattern registry JSON.
     */
    private function load_registry() {
        $registry_file = $this->patterns_base . 'config/pattern-registry.json';

        if ( ! file_exists( $registry_file ) ) {
            // Fall back to root-level registry
            $registry_file = $this->patterns_base . 'pattern-registry.json';
        }

        if ( file_exists( $registry_file ) ) {
            $this->registry = json_decode( file_get_contents( $registry_file ), true );
        } else {
            $this->registry = array( 'patterns' => array(), 'templates' => array() );
        }
    }

    /**
     * Generate a complete theme from AI content JSON.
     *
     * @param array $content AI-generated content with selected_patterns, strings, images, brand_colors, business.
     * @return array Result with theme_dir, zip_path, etc. or WP_Error on failure.
     */
    public function generate( array $content ) {
        // Validate required fields
        if ( empty( $content['selected_patterns'] ) ) {
            return new WP_Error( 'no_patterns', 'selected_patterns array is required', array( 'status' => 400 ) );
        }

        if ( empty( $content['business']['name'] ) ) {
            return new WP_Error( 'no_business_name', 'business.name is required', array( 'status' => 400 ) );
        }

        $business    = $content['business'];
        $strings     = $content['strings'] ?? array();
        $images      = $content['images'] ?? array();
        $colors      = $content['brand_colors'] ?? array();
        $patterns    = $content['selected_patterns'];
        $theme_slug  = $content['theme_slug']
            ?? sanitize_title( $business['name'] ) . '-' . time();

        $theme_dir = PRESSPILOT_GENERATED_THEMES_DIR . $theme_slug . '/';

        // 1. Create directory structure
        $this->create_dirs( $theme_dir );

        // 2. Initialize content handler with AI data
        if ( class_exists( 'PressPilot\\Content_Handler' ) ) {
            \PressPilot\Content_Handler::init( $content );
        }

        // Set globals for pattern helpers
        if ( function_exists( 'presspilot_set_strings' ) ) {
            presspilot_set_strings( $strings );
        }
        if ( function_exists( 'presspilot_set_images' ) ) {
            presspilot_set_images( $images );
        }

        // 3. Generate theme.json from brand colors
        $theme_json = $this->build_theme_json( $colors );
        file_put_contents( $theme_dir . 'theme.json', wp_json_encode( $theme_json, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES ) );

        // 4. Generate style.css
        $style_css = $this->build_style_css( $business );
        file_put_contents( $theme_dir . 'style.css', $style_css );

        // 5. Generate index.php (WP requirement)
        file_put_contents( $theme_dir . 'index.php', "<?php\n// Silence is golden. This file is required by WordPress.\n" );

        // 6. Generate functions.php (registers patterns)
        $functions_php = $this->build_functions_php( $theme_slug );
        file_put_contents( $theme_dir . 'functions.php', $functions_php );

        // 7. Render header template part
        $header_pattern = $this->find_pattern_by_category( $patterns, 'headers' );
        if ( $header_pattern ) {
            $header_html = $this->render_pattern( $header_pattern );
            file_put_contents( $theme_dir . 'parts/header.html', $header_html );
        }

        // 8. Render footer template part
        $footer_pattern = $this->find_pattern_by_category( $patterns, 'footers' );
        if ( $footer_pattern ) {
            $footer_html = $this->render_pattern( $footer_pattern );
            file_put_contents( $theme_dir . 'parts/footer.html', $footer_html );
        }

        // 9. Render body patterns and build front-page.html
        $body_patterns = array_filter( $patterns, function( $slug ) {
            return strpos( $slug, 'headers/' ) !== 0 && strpos( $slug, 'footers/' ) !== 0;
        } );

        $front_page  = "<!-- wp:template-part {\"slug\":\"header\",\"tagName\":\"header\"} /-->\n\n";
        $front_page .= "<!-- wp:group {\"tagName\":\"main\",\"layout\":{\"type\":\"default\"}} -->\n";
        $front_page .= "<main class=\"wp-block-group\">\n";

        foreach ( $body_patterns as $pattern_slug ) {
            $rendered = $this->render_pattern( $pattern_slug );
            if ( $rendered ) {
                $front_page .= "\n" . $rendered . "\n";
            }
        }

        $front_page .= "</main>\n";
        $front_page .= "<!-- /wp:group -->\n\n";
        $front_page .= "<!-- wp:template-part {\"slug\":\"footer\",\"tagName\":\"footer\"} /-->";

        file_put_contents( $theme_dir . 'templates/front-page.html', $front_page );

        // 10. Generate other standard templates
        $this->write_standard_templates( $theme_dir );

        // 11. Copy pattern files into theme (for WP pattern registration)
        $this->copy_pattern_files( $theme_dir, $patterns );

        // 12. Reset globals
        if ( function_exists( 'presspilot_set_strings' ) ) {
            presspilot_set_strings( array() );
        }
        if ( function_exists( 'presspilot_set_images' ) ) {
            presspilot_set_images( array() );
        }

        // 13. Create ZIP
        $exporter = new PressPilot_Theme_Exporter();
        $zip_path = $exporter->create_zip( $theme_dir, $theme_slug );

        if ( is_wp_error( $zip_path ) ) {
            return $zip_path;
        }

        // 14. VALIDATION GATE — ZIP must pass structure check before delivery
        $validator_file = dirname( dirname( __DIR__ ) ) . '/scripts/validate-zip-structure.php';
        if ( ! function_exists( 'validate_zip_structure' ) && file_exists( $validator_file ) ) {
            require_once $validator_file;
        }

        if ( function_exists( 'validate_zip_structure' ) ) {
            $validation = validate_zip_structure( $zip_path );

            if ( ! $validation['valid'] ) {
                error_log( 'PressPilot ZIP validation failed: ' . implode( '; ', $validation['errors'] ) );
                return new WP_Error(
                    'zip_validation_failed',
                    'Theme ZIP failed structure validation: ' . implode( '; ', $validation['errors'] ),
                    array( 'status' => 500, 'errors' => $validation['errors'] )
                );
            }
        }

        return array(
            'success'       => true,
            'theme_slug'    => $theme_slug,
            'theme_dir'     => $theme_dir,
            'zip_path'      => $zip_path,
            'zip_url'       => content_url( 'themes/generated/' . $theme_slug . '.zip' ),
            'patterns_used' => count( $patterns ),
            'validation'    => $validation ?? array( 'valid' => true, 'skipped' => true ),
            'message'       => 'Theme generated using pattern assembly (v2)',
        );
    }

    /**
     * Render a single pattern by slug.
     *
     * @param string $slug Pattern slug (e.g., "heroes/cover-cta").
     * @return string Rendered HTML or empty string.
     */
    private function render_pattern( $slug ) {
        $pattern_file = $this->patterns_dir . $slug . '.php';

        if ( ! file_exists( $pattern_file ) ) {
            return '';
        }

        ob_start();
        include $pattern_file;
        return ob_get_clean();
    }

    /**
     * Find the first pattern matching a category prefix.
     *
     * @param array  $patterns Pattern slugs.
     * @param string $category Category prefix (e.g., "headers").
     * @return string|null Pattern slug or null.
     */
    private function find_pattern_by_category( array $patterns, $category ) {
        foreach ( $patterns as $slug ) {
            if ( strpos( $slug, $category . '/' ) === 0 ) {
                return $slug;
            }
        }
        return null;
    }

    /**
     * Create theme directory structure.
     */
    private function create_dirs( $theme_dir ) {
        $dirs = array(
            $theme_dir,
            $theme_dir . 'templates/',
            $theme_dir . 'parts/',
            $theme_dir . 'patterns/',
            $theme_dir . 'assets/',
            $theme_dir . 'assets/images/',
        );

        foreach ( $dirs as $dir ) {
            if ( ! file_exists( $dir ) ) {
                wp_mkdir_p( $dir );
            }
        }
    }

    /**
     * Build theme.json with brand colors injected.
     */
    private function build_theme_json( array $colors ) {
        // Try to use the template from presspilot-patterns
        $template_file = $this->patterns_base . 'templates/theme.json.template';

        if ( file_exists( $template_file ) ) {
            $template = file_get_contents( $template_file );

            $replacements = array(
                '#PRESSPILOT_PRIMARY#'    => $colors['primary'] ?? '#2563eb',
                '#PRESSPILOT_SECONDARY#'  => $colors['secondary'] ?? '#64748b',
                '#PRESSPILOT_ACCENT#'     => $colors['accent'] ?? '#f59e0b',
                '#PRESSPILOT_BACKGROUND#' => $colors['background'] ?? '#ffffff',
                '#PRESSPILOT_FOREGROUND#' => $colors['foreground'] ?? '#1e293b',
                '#PRESSPILOT_TERTIARY#'   => $colors['tertiary'] ?? '#f8fafc',
            );

            $json_str = str_replace(
                array_keys( $replacements ),
                array_values( $replacements ),
                $template
            );

            $decoded = json_decode( $json_str, true );
            if ( $decoded ) {
                return $decoded;
            }
        }

        // Fallback: build from scratch
        return array(
            '$schema'  => 'https://schemas.wp.org/trunk/theme.json',
            'version'  => 3,
            'settings' => array(
                'appearanceTools' => true,
                'layout'          => array( 'contentSize' => '1200px', 'wideSize' => '1400px' ),
                'color'           => array(
                    'palette' => array(
                        array( 'slug' => 'primary',    'color' => $colors['primary'] ?? '#2563eb',   'name' => 'Primary' ),
                        array( 'slug' => 'secondary',  'color' => $colors['secondary'] ?? '#64748b', 'name' => 'Secondary' ),
                        array( 'slug' => 'accent',     'color' => $colors['accent'] ?? '#f59e0b',    'name' => 'Accent' ),
                        array( 'slug' => 'base',       'color' => $colors['background'] ?? '#ffffff', 'name' => 'Base' ),
                        array( 'slug' => 'contrast',   'color' => $colors['foreground'] ?? '#1e293b', 'name' => 'Contrast' ),
                    ),
                ),
            ),
            'styles' => array(
                'color' => array(
                    'background' => 'var(--wp--preset--color--base)',
                    'text'       => 'var(--wp--preset--color--contrast)',
                ),
            ),
            'templateParts' => array(
                array( 'name' => 'header', 'title' => 'Header', 'area' => 'header' ),
                array( 'name' => 'footer', 'title' => 'Footer', 'area' => 'footer' ),
            ),
        );
    }

    /**
     * Build style.css with proper theme headers.
     */
    private function build_style_css( array $business ) {
        $name = $business['name'] ?? 'PressPilot Theme';
        $slug = sanitize_title( $name );

        return <<<CSS
/*
Theme Name: {$name}
Theme URI: https://presspilot.io
Author: PressPilot
Author URI: https://presspilot.io
Description: Custom FSE theme generated by PressPilot AI
Requires at least: 6.4
Tested up to: 6.7
Requires PHP: 7.4
Version: 1.0.0
License: GNU General Public License v2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html
Text Domain: {$slug}
Tags: full-site-editing, block-patterns, custom-colors, custom-logo

Generated by PressPilot - AI-Powered WordPress Theme Generator
https://presspilot.io
*/
CSS;
    }

    /**
     * Build a minimal functions.php for the generated theme.
     */
    private function build_functions_php( $theme_slug ) {
        return <<<'PHP'
<?php
/**
 * Theme functions - Generated by PressPilot
 *
 * @package PressPilot_Generated
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Theme setup
add_action( 'after_setup_theme', function() {
    add_theme_support( 'wp-block-styles' );
    add_theme_support( 'editor-styles' );
    add_theme_support( 'responsive-embeds' );
    add_theme_support( 'html5', array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script' ) );
    add_theme_support( 'woocommerce' );
} );

// Enqueue Google Fonts
add_action( 'wp_enqueue_scripts', function() {
    wp_enqueue_style(
        'presspilot-fonts',
        'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap',
        array(),
        null
    );
} );
PHP;
    }

    /**
     * Write standard templates (index, single, page, 404, archive).
     */
    private function write_standard_templates( $theme_dir ) {
        $wrap_start = "<!-- wp:template-part {\"slug\":\"header\",\"area\":\"header\"} /-->\n\n";
        $wrap_end   = "\n\n<!-- wp:template-part {\"slug\":\"footer\",\"area\":\"footer\"} /-->";

        // index.html
        file_put_contents( $theme_dir . 'templates/index.html', $wrap_start .
            "<!-- wp:group {\"tagName\":\"main\",\"layout\":{\"type\":\"constrained\"}} -->\n" .
            "<main class=\"wp-block-group\">\n" .
            "\t<!-- wp:query {\"queryId\":1,\"query\":{\"perPage\":10,\"pages\":0,\"offset\":0,\"postType\":\"post\",\"order\":\"desc\",\"orderBy\":\"date\"}} -->\n" .
            "\t<div class=\"wp-block-query\">\n" .
            "\t\t<!-- wp:post-template -->\n" .
            "\t\t\t<!-- wp:post-title {\"isLink\":true} /-->\n" .
            "\t\t\t<!-- wp:post-excerpt /-->\n" .
            "\t\t<!-- /wp:post-template -->\n" .
            "\t\t<!-- wp:query-pagination -->\n" .
            "\t\t\t<!-- wp:query-pagination-previous /-->\n" .
            "\t\t\t<!-- wp:query-pagination-numbers /-->\n" .
            "\t\t\t<!-- wp:query-pagination-next /-->\n" .
            "\t\t<!-- /wp:query-pagination -->\n" .
            "\t</div>\n" .
            "\t<!-- /wp:query -->\n" .
            "</main>\n" .
            "<!-- /wp:group -->" . $wrap_end
        );

        // single.html
        file_put_contents( $theme_dir . 'templates/single.html', $wrap_start .
            "<!-- wp:group {\"tagName\":\"main\",\"layout\":{\"type\":\"constrained\"}} -->\n" .
            "<main class=\"wp-block-group\">\n" .
            "\t<!-- wp:post-title {\"level\":1} /-->\n" .
            "\t<!-- wp:post-content {\"layout\":{\"type\":\"constrained\"}} /-->\n" .
            "</main>\n" .
            "<!-- /wp:group -->" . $wrap_end
        );

        // page.html
        file_put_contents( $theme_dir . 'templates/page.html', $wrap_start .
            "<!-- wp:group {\"tagName\":\"main\",\"layout\":{\"type\":\"constrained\"}} -->\n" .
            "<main class=\"wp-block-group\">\n" .
            "\t<!-- wp:post-title {\"level\":1} /-->\n" .
            "\t<!-- wp:post-content {\"layout\":{\"type\":\"constrained\"}} /-->\n" .
            "</main>\n" .
            "<!-- /wp:group -->" . $wrap_end
        );

        // 404.html
        file_put_contents( $theme_dir . 'templates/404.html', $wrap_start .
            "<!-- wp:group {\"tagName\":\"main\",\"layout\":{\"type\":\"constrained\"}} -->\n" .
            "<main class=\"wp-block-group\">\n" .
            "\t<!-- wp:heading {\"level\":1} -->\n" .
            "\t<h1 class=\"wp-block-heading\">Page Not Found</h1>\n" .
            "\t<!-- /wp:heading -->\n" .
            "\t<!-- wp:paragraph -->\n" .
            "\t<p>The page you're looking for doesn't exist. Please check the URL or return to the homepage.</p>\n" .
            "\t<!-- /wp:paragraph -->\n" .
            "</main>\n" .
            "<!-- /wp:group -->" . $wrap_end
        );
    }

    /**
     * Copy selected pattern PHP files into the generated theme.
     */
    private function copy_pattern_files( $theme_dir, array $patterns ) {
        // Also copy the pattern-helpers.php
        $helpers_src = $this->patterns_dir . 'pattern-helpers.php';
        if ( file_exists( $helpers_src ) ) {
            copy( $helpers_src, $theme_dir . 'patterns/pattern-helpers.php' );
        }

        foreach ( $patterns as $slug ) {
            $src = $this->patterns_dir . $slug . '.php';
            if ( ! file_exists( $src ) ) {
                continue;
            }

            $dest_dir = $theme_dir . 'patterns/' . dirname( $slug ) . '/';
            if ( ! file_exists( $dest_dir ) ) {
                wp_mkdir_p( $dest_dir );
            }

            copy( $src, $theme_dir . 'patterns/' . $slug . '.php' );
        }
    }
}
