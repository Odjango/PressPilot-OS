<?php
/**
 * Theme Exporter - Copies Ollie theme + customizations to ZIP
 *
 * @package PressPilot_Factory
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class PressPilot_Factory_Theme_Exporter {

    private $brand_applier;
    private $base_theme = 'ollie';
    private $export_dir;

    public function __construct( PressPilot_Factory_Brand_Applier $brand_applier ) {
        $this->brand_applier = $brand_applier;

        $upload_dir = wp_upload_dir();
        $this->export_dir = $upload_dir['basedir'] . '/presspilot-factory/themes/';
    }

    /**
     * Export theme as ZIP
     */
    public function export( $params, $generation_id ) {
        // Create export directory
        if ( ! file_exists( $this->export_dir ) ) {
            wp_mkdir_p( $this->export_dir );
        }

        // Generate theme slug
        $theme_slug = $this->generate_theme_slug( $params['business_name'] );
        $theme_dir = $this->export_dir . $theme_slug;

        // Copy base theme
        $this->copy_base_theme( $theme_dir );

        // Customize theme
        $this->customize_theme( $theme_dir, $params );

        // Generate theme.json
        $this->generate_theme_json( $theme_dir, $params );

        // Generate style.css header
        $this->update_style_css( $theme_dir, $params );

        // Export templates
        $this->export_templates( $theme_dir, $params );

        // Create ZIP
        $zip_path = $this->create_zip( $theme_dir, $theme_slug, $generation_id );

        // Cleanup temp directory
        $this->cleanup_directory( $theme_dir );

        // Return URL to ZIP
        $upload_dir = wp_upload_dir();
        return str_replace( $upload_dir['basedir'], $upload_dir['baseurl'], $zip_path );
    }

    /**
     * Generate theme slug from business name
     */
    private function generate_theme_slug( $business_name ) {
        $slug = sanitize_title( $business_name );
        $slug = preg_replace( '/[^a-z0-9-]/', '', $slug );
        return substr( $slug, 0, 50 ) ?: 'presspilot-theme';
    }

    /**
     * Copy base theme files
     */
    private function copy_base_theme( $dest_dir ) {
        $base_theme_dir = get_theme_root() . '/' . $this->base_theme;

        // Check for Ollie theme
        if ( ! file_exists( $base_theme_dir ) ) {
            // Fallback to active theme
            $base_theme_dir = get_stylesheet_directory();
        }

        // Create destination
        if ( ! file_exists( $dest_dir ) ) {
            wp_mkdir_p( $dest_dir );
        }

        // Copy recursively
        $this->recursive_copy( $base_theme_dir, $dest_dir );
    }

    /**
     * Recursive directory copy
     */
    private function recursive_copy( $src, $dst ) {
        $dir = opendir( $src );

        if ( ! file_exists( $dst ) ) {
            wp_mkdir_p( $dst );
        }

        while ( ( $file = readdir( $dir ) ) !== false ) {
            if ( $file === '.' || $file === '..' ) {
                continue;
            }

            $src_path = $src . '/' . $file;
            $dst_path = $dst . '/' . $file;

            if ( is_dir( $src_path ) ) {
                $this->recursive_copy( $src_path, $dst_path );
            } else {
                copy( $src_path, $dst_path );
            }
        }

        closedir( $dir );
    }

    /**
     * Customize theme with branding
     */
    private function customize_theme( $theme_dir, $params ) {
        // Add custom patterns
        $this->add_custom_patterns( $theme_dir );

        // Update functions.php
        $this->update_functions_php( $theme_dir, $params );
    }

    /**
     * Generate theme.json with brand settings
     */
    private function generate_theme_json( $theme_dir, $params ) {
        $colors = $params['colors'] ?? [];
        $fonts = $params['fonts'] ?? [];

        $theme_json = [
            '$schema' => 'https://schemas.wp.org/trunk/theme.json',
            'version' => 3,
            'settings' => [
                'appearanceTools' => true,
                'layout' => [
                    'contentSize' => '720px',
                    'wideSize' => '1200px',
                ],
                'spacing' => [
                    'units' => [ 'px', 'em', 'rem', '%', 'vw', 'vh' ],
                    'spacingSizes' => [
                        [ 'slug' => '30', 'size' => 'clamp(1.5rem, 5vw, 2rem)', 'name' => 'Small' ],
                        [ 'slug' => '40', 'size' => 'clamp(2rem, 6vw, 2.5rem)', 'name' => 'Medium' ],
                        [ 'slug' => '50', 'size' => 'clamp(2.5rem, 7vw, 3rem)', 'name' => 'Large' ],
                        [ 'slug' => '60', 'size' => 'clamp(3rem, 8vw, 4rem)', 'name' => 'XLarge' ],
                        [ 'slug' => '80', 'size' => 'clamp(4rem, 10vw, 6rem)', 'name' => 'XXLarge' ],
                    ],
                ],
                'color' => [
                    'defaultPalette' => false,
                    'palette' => [
                        [ 'slug' => 'base', 'name' => 'Base', 'color' => $colors['background'] ?? '#ffffff' ],
                        [ 'slug' => 'contrast', 'name' => 'Contrast', 'color' => $colors['text'] ?? '#1f2937' ],
                        [ 'slug' => 'primary', 'name' => 'Primary', 'color' => $colors['primary'] ?? '#1e40af' ],
                        [ 'slug' => 'secondary', 'name' => 'Secondary', 'color' => $colors['secondary'] ?? '#64748b' ],
                        [ 'slug' => 'accent', 'name' => 'Accent', 'color' => $colors['accent'] ?? '#f59e0b' ],
                        [ 'slug' => 'surface', 'name' => 'Surface', 'color' => $this->lighten( $colors['background'] ?? '#ffffff', 5 ) ],
                    ],
                ],
                'typography' => [
                    'fontFamilies' => [
                        [
                            'slug' => 'heading',
                            'name' => 'Heading',
                            'fontFamily' => sprintf( '"%s", sans-serif', $fonts['heading'] ?? 'Inter' ),
                        ],
                        [
                            'slug' => 'body',
                            'name' => 'Body',
                            'fontFamily' => sprintf( '"%s", sans-serif', $fonts['body'] ?? 'Inter' ),
                        ],
                        [
                            'slug' => 'system',
                            'name' => 'System',
                            'fontFamily' => '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        ],
                    ],
                    'fontSizes' => [
                        [ 'slug' => 'small', 'size' => '0.875rem', 'name' => 'Small' ],
                        [ 'slug' => 'medium', 'size' => '1rem', 'name' => 'Medium' ],
                        [ 'slug' => 'large', 'size' => '1.25rem', 'name' => 'Large' ],
                        [ 'slug' => 'x-large', 'size' => '1.5rem', 'name' => 'Extra Large' ],
                        [ 'slug' => 'xx-large', 'size' => '2.5rem', 'name' => 'Huge' ],
                    ],
                ],
            ],
            'styles' => [
                'color' => [
                    'background' => 'var(--wp--preset--color--base)',
                    'text' => 'var(--wp--preset--color--contrast)',
                ],
                'typography' => [
                    'fontFamily' => 'var(--wp--preset--font-family--body)',
                    'lineHeight' => '1.6',
                ],
                'elements' => [
                    'button' => [
                        'color' => [
                            'background' => 'var(--wp--preset--color--primary)',
                            'text' => 'var(--wp--preset--color--base)',
                        ],
                        'border' => [
                            'radius' => '6px',
                        ],
                    ],
                    'link' => [
                        'color' => [
                            'text' => 'var(--wp--preset--color--primary)',
                        ],
                    ],
                    'heading' => [
                        'typography' => [
                            'fontFamily' => 'var(--wp--preset--font-family--heading)',
                            'fontWeight' => '700',
                        ],
                    ],
                ],
            ],
            'templateParts' => [
                [ 'name' => 'header', 'title' => 'Header', 'area' => 'header' ],
                [ 'name' => 'footer', 'title' => 'Footer', 'area' => 'footer' ],
            ],
        ];

        file_put_contents(
            $theme_dir . '/theme.json',
            json_encode( $theme_json, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES )
        );
    }

    /**
     * Update style.css with theme info
     */
    private function update_style_css( $theme_dir, $params ) {
        $theme_name = $params['business_name'];
        $description = $params['description'] ?? 'A custom WordPress theme generated by PressPilot.';

        $style_css = <<<CSS
/*
Theme Name: {$theme_name}
Theme URI: https://presspilot.io
Author: PressPilot
Author URI: https://presspilot.io
Description: {$description}
Version: 1.0.0
Requires at least: 6.4
Tested up to: 6.5
Requires PHP: 8.0
License: GNU General Public License v2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html
Text Domain: presspilot-generated
Tags: full-site-editing, block-themes, block-patterns
*/
CSS;

        file_put_contents( $theme_dir . '/style.css', $style_css );
    }

    /**
     * Add custom patterns to theme
     */
    private function add_custom_patterns( $theme_dir ) {
        $patterns_dir = $theme_dir . '/patterns';

        if ( ! file_exists( $patterns_dir ) ) {
            wp_mkdir_p( $patterns_dir );
        }

        // Copy patterns from plugin
        $source_patterns = PRESSPILOT_FACTORY_PATTERNS;
        if ( file_exists( $source_patterns ) ) {
            $files = glob( $source_patterns . '*.html' );
            foreach ( $files as $file ) {
                $content = file_get_contents( $file );
                $filename = basename( $file, '.html' );

                // Convert to PHP pattern
                $php_content = $this->convert_to_php_pattern( $content, $filename );
                file_put_contents( $patterns_dir . '/' . $filename . '.php', $php_content );
            }
        }
    }

    /**
     * Convert HTML pattern to PHP pattern
     */
    private function convert_to_php_pattern( $content, $name ) {
        $title = ucwords( str_replace( '-', ' ', $name ) );

        return <<<PHP
<?php
/**
 * Title: {$title}
 * Slug: presspilot/{$name}
 * Categories: presspilot
 */
?>
{$content}
PHP;
    }

    /**
     * Update functions.php
     */
    private function update_functions_php( $theme_dir, $params ) {
        $functions_file = $theme_dir . '/functions.php';
        $fonts = $params['fonts'] ?? [];

        $google_fonts = [];
        if ( ! empty( $fonts['heading'] ) ) {
            $google_fonts[] = str_replace( ' ', '+', $fonts['heading'] );
        }
        if ( ! empty( $fonts['body'] ) && $fonts['body'] !== ( $fonts['heading'] ?? '' ) ) {
            $google_fonts[] = str_replace( ' ', '+', $fonts['body'] );
        }

        $fonts_url = '';
        if ( ! empty( $google_fonts ) ) {
            $fonts_url = 'https://fonts.googleapis.com/css2?family=' . implode( '&family=', $google_fonts ) . ':wght@400;500;600;700&display=swap';
        }

        $additional_functions = <<<PHP


// PressPilot Generated Theme Functions
add_action( 'wp_enqueue_scripts', function() {
    // Google Fonts
    \$fonts_url = '{$fonts_url}';
    if ( \$fonts_url ) {
        wp_enqueue_style( 'presspilot-google-fonts', \$fonts_url, [], null );
    }
});

// Register block patterns category
add_action( 'init', function() {
    register_block_pattern_category( 'presspilot', [
        'label' => __( 'PressPilot', 'presspilot-generated' ),
    ]);
});
PHP;

        if ( file_exists( $functions_file ) ) {
            $content = file_get_contents( $functions_file );
            $content .= $additional_functions;
            file_put_contents( $functions_file, $content );
        } else {
            file_put_contents( $functions_file, "<?php\n" . $additional_functions );
        }
    }

    /**
     * Export templates
     */
    private function export_templates( $theme_dir, $params ) {
        $templates_dir = $theme_dir . '/templates';

        if ( ! file_exists( $templates_dir ) ) {
            wp_mkdir_p( $templates_dir );
        }

        // Export basic templates
        $this->create_front_page_template( $templates_dir, $params );
        $this->create_page_template( $templates_dir );
        $this->create_index_template( $templates_dir );
    }

    /**
     * Create front-page template
     */
    private function create_front_page_template( $templates_dir, $params ) {
        $template = <<<HTML
<!-- wp:template-part {"slug":"header","tagName":"header"} /-->

<!-- wp:group {"tagName":"main","style":{"spacing":{"margin":{"top":"0","bottom":"0"}}},"layout":{"type":"default"}} -->
<main class="wp-block-group" style="margin-top:0;margin-bottom:0">
    <!-- wp:post-content {"layout":{"type":"default"}} /-->
</main>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->
HTML;

        file_put_contents( $templates_dir . '/front-page.html', $template );
    }

    /**
     * Create page template
     */
    private function create_page_template( $templates_dir ) {
        $template = <<<HTML
<!-- wp:template-part {"slug":"header","tagName":"header"} /-->

<!-- wp:group {"tagName":"main","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}},"layout":{"type":"constrained"}} -->
<main class="wp-block-group" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)">
    <!-- wp:post-title {"level":1} /-->
    <!-- wp:post-content {"layout":{"type":"default"}} /-->
</main>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->
HTML;

        file_put_contents( $templates_dir . '/page.html', $template );
    }

    /**
     * Create index template
     */
    private function create_index_template( $templates_dir ) {
        $template = <<<HTML
<!-- wp:template-part {"slug":"header","tagName":"header"} /-->

<!-- wp:group {"tagName":"main","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}},"layout":{"type":"constrained"}} -->
<main class="wp-block-group" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)">
    <!-- wp:query {"queryId":1,"query":{"perPage":10,"pages":0,"offset":0,"postType":"post","order":"desc","orderBy":"date","author":"","search":"","exclude":[],"sticky":"","inherit":true}} -->
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

<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->
HTML;

        file_put_contents( $templates_dir . '/index.html', $template );
    }

    /**
     * Create ZIP file
     */
    private function create_zip( $source_dir, $theme_slug, $generation_id ) {
        $zip_file = $this->export_dir . $theme_slug . '-' . $generation_id . '.zip';

        $zip = new ZipArchive();
        if ( $zip->open( $zip_file, ZipArchive::CREATE | ZipArchive::OVERWRITE ) !== true ) {
            throw new Exception( 'Failed to create ZIP file' );
        }

        $this->add_directory_to_zip( $zip, $source_dir, $theme_slug );

        $zip->close();

        return $zip_file;
    }

    /**
     * Add directory to ZIP recursively
     */
    private function add_directory_to_zip( $zip, $dir, $base_name ) {
        $files = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator( $dir ),
            RecursiveIteratorIterator::LEAVES_ONLY
        );

        foreach ( $files as $file ) {
            if ( ! $file->isDir() ) {
                $file_path = $file->getRealPath();
                $relative_path = $base_name . '/' . substr( $file_path, strlen( $dir ) + 1 );
                $zip->addFile( $file_path, $relative_path );
            }
        }
    }

    /**
     * Cleanup directory
     */
    private function cleanup_directory( $dir ) {
        if ( ! file_exists( $dir ) ) {
            return;
        }

        $files = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator( $dir, RecursiveDirectoryIterator::SKIP_DOTS ),
            RecursiveIteratorIterator::CHILD_FIRST
        );

        foreach ( $files as $file ) {
            if ( $file->isDir() ) {
                rmdir( $file->getRealPath() );
            } else {
                unlink( $file->getRealPath() );
            }
        }

        rmdir( $dir );
    }

    /**
     * Lighten a hex color
     */
    private function lighten( $hex, $percent ) {
        $hex = ltrim( $hex, '#' );

        $r = hexdec( substr( $hex, 0, 2 ) );
        $g = hexdec( substr( $hex, 2, 2 ) );
        $b = hexdec( substr( $hex, 4, 2 ) );

        $r = min( 255, $r + ( 255 - $r ) * $percent / 100 );
        $g = min( 255, $g + ( 255 - $g ) * $percent / 100 );
        $b = min( 255, $b + ( 255 - $b ) * $percent / 100 );

        return sprintf( '#%02x%02x%02x', $r, $g, $b );
    }
}
