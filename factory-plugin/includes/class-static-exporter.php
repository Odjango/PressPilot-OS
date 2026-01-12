<?php
/**
 * Static Exporter - Builds static HTML from generated content
 *
 * @package PressPilot_Factory
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class PressPilot_Factory_Static_Exporter {

    private $export_dir;

    public function __construct() {
        $upload_dir = wp_upload_dir();
        $this->export_dir = $upload_dir['basedir'] . '/presspilot-factory/static/';
    }

    /**
     * Export static site
     */
    public function export( $generation_id ) {
        // Create export directory
        if ( ! file_exists( $this->export_dir ) ) {
            wp_mkdir_p( $this->export_dir );
        }

        return $this->export_direct( $generation_id );
    }

    /**
     * Export by building HTML directly (not fetching from WP)
     * This ensures we use the generated header/footer, not the factory site's
     */
    private function export_direct( $generation_id ) {
        $export_path = $this->export_dir . $generation_id;

        if ( ! file_exists( $export_path ) ) {
            wp_mkdir_p( $export_path );
        }

        error_log( 'PressPilot Static Export - Starting direct build to: ' . $export_path );

        // Get generation params
        $last_gen = get_option( 'presspilot_last_generation' );
        $params = $last_gen['params'] ?? [];

        // Build header and footer HTML
        $header_html = $this->build_header_html( $params );
        $footer_html = $this->build_footer_html( $params );
        $head_css = $this->get_head_css( $params );

        // Get all published pages with _presspilot_generated meta
        $pages = get_posts([
            'post_type'      => 'page',
            'post_status'    => 'publish',
            'posts_per_page' => -1,
            'meta_query'     => [
                [
                    'key'     => '_presspilot_generated',
                    'compare' => 'EXISTS',
                ],
            ],
        ]);

        error_log( 'PressPilot Static Export - Found ' . count( $pages ) . ' pages to export' );

        $exported_count = 0;
        $home_page = null;

        // Export each page
        foreach ( $pages as $page ) {
            // Track home page for index.html
            if ( $page->post_name === 'home' ) {
                $home_page = $page;
            }

            $page_dir = $export_path . '/' . $page->post_name;
            wp_mkdir_p( $page_dir );

            $html = $this->build_page_html( $page, $header_html, $footer_html, $head_css, false );
            file_put_contents( $page_dir . '/index.html', $html );
            error_log( 'PressPilot Static Export - Built: ' . $page->post_name . '/index.html' );
            $exported_count++;
        }

        // Export home as index.html at root
        if ( $home_page ) {
            $html = $this->build_page_html( $home_page, $header_html, $footer_html, $head_css, true );
            file_put_contents( $export_path . '/index.html', $html );
            error_log( 'PressPilot Static Export - Built: index.html' );
        }

        error_log( 'PressPilot Static Export - Exported ' . $exported_count . ' pages' );

        // Export assets
        $this->export_assets( $export_path, $params );

        // Create ZIP
        $zip_path = $this->create_zip( $generation_id );

        if ( empty( $zip_path ) ) {
            error_log( 'PressPilot Static Export - Failed to create ZIP' );
            return '';
        }

        // Cleanup exported directory (keep the ZIP)
        $this->cleanup_directory( $export_path );

        // Return URL
        $upload_dir = wp_upload_dir();
        return str_replace( $upload_dir['basedir'], $upload_dir['baseurl'], $zip_path );
    }

    /**
     * Build complete HTML page from parts
     */
    private function build_page_html( $page, $header_html, $footer_html, $head_css, $is_root = false ) {
        $title = esc_html( $page->post_title );
        $content = $page->post_content;

        // Process Gutenberg blocks to HTML
        $content_html = do_blocks( $content );
        $content_html = wptexturize( $content_html );
        $content_html = wpautop( $content_html );

        // Adjust asset paths based on page depth
        $asset_prefix = $is_root ? './' : '../';

        // Build full HTML document
        $html = <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{$title}</title>
    <link rel="stylesheet" href="{$asset_prefix}assets/wp-content/themes/ollie/style.css">
    <link rel="stylesheet" href="{$asset_prefix}assets/global-styles.css">
    <link rel="stylesheet" href="{$asset_prefix}assets/fallback-colors.css">
    <style id="presspilot-inline-css">
{$head_css}
    </style>
</head>
<body class="wp-site-blocks">
    <header class="wp-block-template-part">
{$header_html}
    </header>

    <main class="wp-block-group" style="margin-top:0;margin-bottom:0">
{$content_html}
    </main>

    <footer class="wp-block-template-part">
{$footer_html}
    </footer>
</body>
</html>
HTML;

        // Fix internal links for static site
        $html = $this->fix_links( $html, $is_root );

        return $html;
    }

    /**
     * Build header HTML from params
     */
    private function build_header_html( $params ) {
        $business_name = esc_html( $params['business_name'] ?? 'My Business' );
        $logo_url = esc_url( $params['logo'] ?? '' );
        $category = $params['category'] ?? 'corporate';
        $bg_color = $params['colors']['background'] ?? '#ffffff';
        $text_color = $params['colors']['text'] ?? '#1f2937';

        // Logo block
        $logo_block = '';
        if ( ! empty( $logo_url ) ) {
            $logo_block = '<img src="' . $logo_url . '" alt="' . $business_name . ' Logo" style="width:50px;height:50px;object-fit:contain">';
        }

        // Navigation links based on category
        $nav_links = '<a href="./" style="text-decoration:none;color:inherit;padding:0.5rem 1rem">Home</a>';
        if ( $category === 'restaurant' ) {
            $nav_links .= '<a href="./menu/" style="text-decoration:none;color:inherit;padding:0.5rem 1rem">Menu</a>';
        } else {
            $nav_links .= '<a href="./services/" style="text-decoration:none;color:inherit;padding:0.5rem 1rem">Services</a>';
        }
        $nav_links .= '<a href="./about/" style="text-decoration:none;color:inherit;padding:0.5rem 1rem">About</a>';
        $nav_links .= '<a href="./contact/" style="text-decoration:none;color:inherit;padding:0.5rem 1rem">Contact</a>';

        return <<<HTML
<div class="wp-block-group has-background" style="background-color:{$bg_color};padding:1rem 2rem">
    <div style="display:flex;justify-content:space-between;align-items:center;max-width:1200px;margin:0 auto;flex-wrap:wrap;gap:1rem">
        <div style="display:flex;align-items:center;gap:1rem">
            {$logo_block}
            <a href="./" style="font-size:1.5rem;font-weight:700;text-decoration:none;color:{$text_color}">{$business_name}</a>
        </div>
        <nav style="display:flex;gap:0.5rem;flex-wrap:wrap">
            {$nav_links}
        </nav>
    </div>
</div>
HTML;
    }

    /**
     * Build footer HTML from params
     */
    private function build_footer_html( $params ) {
        $business_name = esc_html( $params['business_name'] ?? 'My Business' );
        $year = date( 'Y' );
        $primary_color = $params['colors']['primary'] ?? '#1e40af';

        return <<<HTML
<div class="wp-block-group alignfull" style="background-color:{$primary_color};color:#ffffff;padding:24px;text-align:center">
    <p style="color:#ffffff;font-size:0.9rem;margin:0">© {$year} {$business_name}. All rights reserved. · Powered by <a href="https://presspilot.io" target="_blank" rel="noopener" style="color:#ffffff;text-decoration:underline;">PressPilot</a></p>
</div>
HTML;
    }

    /**
     * Get head CSS for inline styles
     */
    private function get_head_css( $params ) {
        $colors = $params['colors'] ?? [];
        $primary = $colors['primary'] ?? '#1e40af';
        $secondary = $colors['secondary'] ?? '#64748b';
        $accent = $colors['accent'] ?? '#f59e0b';
        $background = $colors['background'] ?? '#ffffff';
        $text = $colors['text'] ?? '#1f2937';

        return <<<CSS
:root {
    --wp--preset--color--base: {$background};
    --wp--preset--color--contrast: {$text};
    --wp--preset--color--primary: {$primary};
    --wp--preset--color--secondary: {$secondary};
    --wp--preset--color--accent: {$accent};
    --wp--preset--color--surface: #f8fafc;
    --wp--preset--spacing--20: clamp(0.5rem, 2vw, 0.75rem);
    --wp--preset--spacing--30: clamp(1rem, 3vw, 1.5rem);
    --wp--preset--spacing--40: clamp(1.5rem, 4vw, 2rem);
    --wp--preset--spacing--50: clamp(2rem, 5vw, 2.5rem);
    --wp--preset--spacing--60: clamp(2.5rem, 6vw, 3rem);
    --wp--preset--spacing--70: clamp(3rem, 7vw, 4rem);
    --wp--preset--spacing--80: clamp(4rem, 8vw, 6rem);
}
* { box-sizing: border-box; }
body { background-color: {$background}; color: {$text}; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; }
img { max-width: 100%; height: auto; }
.has-primary-color { color: {$primary} !important; }
.has-primary-background-color { background-color: {$primary} !important; }
.has-secondary-color { color: {$secondary} !important; }
.has-secondary-background-color { background-color: {$secondary} !important; }
.has-accent-color { color: {$accent} !important; }
.has-accent-background-color { background-color: {$accent} !important; }
.has-base-color { color: {$background} !important; }
.has-base-background-color { background-color: {$background} !important; }
.has-contrast-color { color: {$text} !important; }
.has-contrast-background-color { background-color: {$text} !important; }
.has-surface-background-color { background-color: #f8fafc !important; }
.has-text-color { }
.has-background { }
.has-text-align-center { text-align: center; }
.has-text-align-left { text-align: left; }
.has-text-align-right { text-align: right; }
.alignfull { width: 100%; max-width: 100%; margin-left: 0; margin-right: 0; }
.alignwide { max-width: 1200px; margin-left: auto; margin-right: auto; }
.wp-block-group { box-sizing: border-box; }
.wp-block-columns { display: flex; flex-wrap: wrap; gap: 2em; }
.wp-block-column { flex: 1; min-width: 250px; }
.wp-block-cover { position: relative; display: flex; align-items: center; justify-content: center; min-height: 300px; }
.wp-block-cover__background { position: absolute; top: 0; left: 0; right: 0; bottom: 0; }
.wp-block-cover__inner-container { position: relative; z-index: 1; width: 100%; }
.wp-block-button__link { display: inline-block; text-decoration: none; padding: 0.75rem 1.5rem; cursor: pointer; border-radius: 6px; }
.wp-block-buttons { display: flex; flex-wrap: wrap; gap: 0.5em; }
.wp-block-navigation { display: flex; gap: 1rem; }
.wp-element-button { border: none; cursor: pointer; }
.is-layout-flex { display: flex; }
.is-layout-grid { display: grid; }
.is-content-justification-center { justify-content: center; }
.is-content-justification-space-between { justify-content: space-between; }
.is-nowrap { flex-wrap: nowrap; }
.is-vertically-aligned-center { align-items: center; }
.wp-block-heading { margin-top: 0; }
figure { margin: 0; }
@media (max-width: 781px) {
    .wp-block-columns { flex-direction: column; }
    .wp-block-column { flex-basis: 100% !important; min-width: 100%; }
}
CSS;
    }

    /**
     * Fix internal links for static site
     */
    private function fix_links( $html, $is_root ) {
        $site_url = home_url();
        $prefix = $is_root ? './' : '../';

        // Fix absolute URLs to relative
        $html = str_replace( 'href="' . $site_url . '/"', 'href="' . $prefix . '"', $html );
        $html = str_replace( 'href="' . $site_url . '"', 'href="' . $prefix . '"', $html );
        $html = preg_replace( '/href="' . preg_quote( $site_url, '/' ) . '\/([^"]+)"/', 'href="' . $prefix . '$1/"', $html );

        // Fix root links
        $html = preg_replace( '/href="\/([a-z][^"]*)"/', 'href="' . $prefix . '$1/"', $html );
        $html = str_replace( 'href="/"', 'href="' . $prefix . '"', $html );

        // Fix mailto and tel links (don't add trailing slash)
        $html = preg_replace( '/href="(mailto:[^"]+)\/"/', 'href="$1"', $html );
        $html = preg_replace( '/href="(tel:[^"]+)\/"/', 'href="$1"', $html );

        return $html;
    }

    /**
     * Export static assets
     */
    private function export_assets( $export_path, $params ) {
        $assets_dir = $export_path . '/assets';
        wp_mkdir_p( $assets_dir . '/wp-content/themes/ollie' );

        // Copy essential theme files
        $theme_dir = get_theme_root() . '/ollie';
        if ( file_exists( $theme_dir . '/style.css' ) ) {
            copy( $theme_dir . '/style.css', $assets_dir . '/wp-content/themes/ollie/style.css' );
        }

        // Generate global styles and fallback colors
        $this->generate_global_styles_css( $export_path, $params );

        error_log( 'PressPilot Static Export - Assets created at: ' . $assets_dir );
    }

    /**
     * Generate global styles CSS
     */
    private function generate_global_styles_css( $export_path, $params ) {
        $colors = $params['colors'] ?? [];

        // Global styles
        if ( function_exists( 'wp_get_global_stylesheet' ) ) {
            $global_css = wp_get_global_stylesheet();
            if ( ! empty( $global_css ) ) {
                file_put_contents( $export_path . '/assets/global-styles.css', $global_css );
            }
        } else {
            file_put_contents( $export_path . '/assets/global-styles.css', '/* Global styles */' );
        }

        // Fallback colors
        $fallback_css = ":root {\n";
        $fallback_css .= "  --wp--preset--color--base: " . ( $colors['background'] ?? '#ffffff' ) . ";\n";
        $fallback_css .= "  --wp--preset--color--contrast: " . ( $colors['text'] ?? '#1f2937' ) . ";\n";
        $fallback_css .= "  --wp--preset--color--primary: " . ( $colors['primary'] ?? '#1e40af' ) . ";\n";
        $fallback_css .= "  --wp--preset--color--secondary: " . ( $colors['secondary'] ?? '#64748b' ) . ";\n";
        $fallback_css .= "  --wp--preset--color--accent: " . ( $colors['accent'] ?? '#f59e0b' ) . ";\n";
        $fallback_css .= "}\n";

        file_put_contents( $export_path . '/assets/fallback-colors.css', $fallback_css );
    }

    /**
     * Create ZIP from exported files
     */
    private function create_zip( $generation_id ) {
        $source_dir = $this->export_dir . $generation_id;
        $zip_file = $this->export_dir . 'static-' . $generation_id . '.zip';

        if ( ! file_exists( $source_dir ) ) {
            return '';
        }

        $zip = new ZipArchive();
        if ( $zip->open( $zip_file, ZipArchive::CREATE | ZipArchive::OVERWRITE ) !== true ) {
            return '';
        }

        $files = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator( $source_dir ),
            RecursiveIteratorIterator::LEAVES_ONLY
        );

        foreach ( $files as $file ) {
            if ( ! $file->isDir() ) {
                $file_path = $file->getRealPath();
                $relative_path = substr( $file_path, strlen( $source_dir ) + 1 );
                $zip->addFile( $file_path, $relative_path );
            }
        }

        $zip->close();

        return $zip_file;
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
     * Get export status
     */
    public function get_status( $generation_id ) {
        $zip_file = $this->export_dir . 'static-' . $generation_id . '.zip';

        if ( file_exists( $zip_file ) ) {
            return [
                'status' => 'complete',
                'file'   => $zip_file,
                'size'   => filesize( $zip_file ),
            ];
        }

        return [
            'status' => 'pending',
        ];
    }
}
