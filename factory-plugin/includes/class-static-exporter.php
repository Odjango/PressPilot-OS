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

            $html = $this->build_page_html( $page, $header_html, $footer_html, $head_css );
            file_put_contents( $page_dir . '/index.html', $html );
            error_log( 'PressPilot Static Export - Built: ' . $page->post_name . '/index.html' );
            $exported_count++;
        }

        // Export home as index.html at root
        if ( $home_page ) {
            $html = $this->build_page_html( $home_page, $header_html, $footer_html, $head_css );
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
    private function build_page_html( $page, $header_html, $footer_html, $head_css ) {
        $title = esc_html( $page->post_title );
        $content = $page->post_content;

        // Process Gutenberg blocks to HTML
        $content_html = do_blocks( $content );
        $content_html = wptexturize( $content_html );
        // Note: wpautop() removed - it breaks block HTML structure by adding extra </p> tags

        // Build full HTML document - fully self-contained, no external dependencies
        $html = <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{$title}</title>
    <link rel="stylesheet" href="/assets/styles.css">
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
        $html = $this->fix_links( $html );

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

        // Navigation links based on category (use root-relative paths for static site)
        $nav_links = '<a href="/" style="text-decoration:none;color:inherit;padding:0.5rem 1rem">Home</a>';
        if ( $category === 'restaurant' ) {
            $nav_links .= '<a href="/menu/" style="text-decoration:none;color:inherit;padding:0.5rem 1rem">Menu</a>';
        } else {
            $nav_links .= '<a href="/services/" style="text-decoration:none;color:inherit;padding:0.5rem 1rem">Services</a>';
        }
        $nav_links .= '<a href="/about/" style="text-decoration:none;color:inherit;padding:0.5rem 1rem">About</a>';
        $nav_links .= '<a href="/contact/" style="text-decoration:none;color:inherit;padding:0.5rem 1rem">Contact</a>';

        return <<<HTML
<div class="wp-block-group has-background" style="background-color:{$bg_color};padding:1rem 2rem">
    <div style="display:flex;justify-content:space-between;align-items:center;max-width:1200px;margin:0 auto;flex-wrap:wrap;gap:1rem">
        <div style="display:flex;align-items:center;gap:1rem">
            {$logo_block}
            <a href="/" style="font-size:1.5rem;font-weight:700;text-decoration:none;color:{$text_color}">{$business_name}</a>
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
     * Get page-specific inline CSS (minimal - main styles are in external file)
     */
    private function get_head_css( $params ) {
        // Main styles are in /assets/styles.css
        // This is only for page-specific overrides if needed
        return '/* Page-specific styles loaded from /assets/styles.css */';
    }

    /**
     * Fix internal links for static site (use root-relative paths)
     */
    private function fix_links( $html ) {
        $site_url = home_url();

        // Convert WordPress absolute URLs to root-relative paths
        $html = str_replace( 'href="' . $site_url . '/"', 'href="/"', $html );
        $html = str_replace( 'href="' . $site_url . '"', 'href="/"', $html );
        $html = preg_replace( '/href="' . preg_quote( $site_url, '/' ) . '\/([^"]+)"/', 'href="/$1/"', $html );

        // Ensure internal page links have trailing slashes and are root-relative
        // Match links that start with / but don't have trailing slash (exclude assets, mailto, tel, #)
        $html = preg_replace( '/href="\/([a-z][a-z0-9-]*)"(?![\/#])/', 'href="/$1/"', $html );

        // Fix mailto and tel links (don't add trailing slash)
        $html = preg_replace( '/href="(mailto:[^"]+)\/"/', 'href="$1"', $html );
        $html = preg_replace( '/href="(tel:[^"]+)\/"/', 'href="$1"', $html );

        return $html;
    }

    /**
     * Export static assets - generates a single self-contained styles.css with fonts
     */
    private function export_assets( $export_path, $params ) {
        $assets_dir = $export_path . '/assets';
        $fonts_dir = $assets_dir . '/fonts';
        wp_mkdir_p( $fonts_dir );

        // Copy Mona Sans font from Ollie theme
        $this->copy_fonts( $fonts_dir );

        // Generate single self-contained CSS file
        $css = $this->generate_complete_css( $params );
        file_put_contents( $assets_dir . '/styles.css', $css );

        error_log( 'PressPilot Static Export - Generated self-contained styles.css with Mona Sans font' );
    }

    /**
     * Copy fonts from Ollie theme to static export
     */
    private function copy_fonts( $fonts_dir ) {
        // Path to Ollie theme fonts
        $ollie_fonts_dir = get_template_directory() . '/assets/fonts/mona-sans/';

        if ( file_exists( $ollie_fonts_dir ) ) {
            // Copy all font files
            $font_files = glob( $ollie_fonts_dir . '*' );
            foreach ( $font_files as $font_file ) {
                $filename = basename( $font_file );
                copy( $font_file, $fonts_dir . '/' . $filename );
            }
            error_log( 'PressPilot Static Export - Copied Mona Sans fonts from Ollie theme' );
        } else {
            error_log( 'PressPilot Static Export - Ollie fonts not found at: ' . $ollie_fonts_dir );
        }
    }

    /**
     * Generate complete self-contained CSS (no WordPress dependencies)
     */
    private function generate_complete_css( $params ) {
        $colors = $params['colors'] ?? [];
        $primary = $colors['primary'] ?? '#1e40af';
        $secondary = $colors['secondary'] ?? '#64748b';
        $accent = $colors['accent'] ?? '#f59e0b';
        $background = $colors['background'] ?? '#ffffff';
        $text = $colors['text'] ?? '#1f2937';

        $css = <<<CSS
/* PressPilot Generated Styles - Fully Self-Contained */

/* Mona Sans Font - Variable Font from Ollie Theme */
@font-face {
    font-family: 'Mona Sans';
    font-style: normal;
    font-weight: 300 900;
    font-stretch: 75% 125%;
    font-display: swap;
    src: url('/assets/fonts/Mona-Sans.woff2') format('woff2');
}

/* CSS Variables */
:root {
    --wp--preset--color--base: {$background};
    --wp--preset--color--contrast: {$text};
    --wp--preset--color--primary: {$primary};
    --wp--preset--color--secondary: {$secondary};
    --wp--preset--color--accent: {$accent};
    --wp--preset--color--surface: #f8fafc;
    --wp--preset--font-family--primary: 'Mona Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --wp--preset--spacing--20: clamp(0.5rem, 2vw, 0.75rem);
    --wp--preset--spacing--30: clamp(1rem, 3vw, 1.5rem);
    --wp--preset--spacing--40: clamp(1.5rem, 4vw, 2rem);
    --wp--preset--spacing--50: clamp(2rem, 5vw, 2.5rem);
    --wp--preset--spacing--60: clamp(2.5rem, 6vw, 3rem);
    --wp--preset--spacing--70: clamp(3rem, 7vw, 4rem);
    --wp--preset--spacing--80: clamp(4rem, 8vw, 6rem);
}

/* Reset & Base */
*, *::before, *::after { box-sizing: border-box; }
html { line-height: 1.6; -webkit-text-size-adjust: 100%; }
body {
    margin: 0;
    padding: 0;
    background-color: {$background};
    color: {$text};
    font-family: var(--wp--preset--font-family--primary);
    font-size: 1rem;
    font-weight: 430;
    line-height: 1.6;
}

/* Typography - Matching Ollie Theme */
h1, h2, h3, h4, h5, h6 {
    margin-top: 0;
    margin-bottom: 0.5em;
    font-family: var(--wp--preset--font-family--primary);
    font-weight: 600;
    line-height: 1.2;
}
h1 { font-size: clamp(2rem, 5vw, 3.5rem); }
h2 { font-size: clamp(1.5rem, 4vw, 2.5rem); }
h3 { font-size: clamp(1.25rem, 3vw, 1.75rem); }
h4 { font-size: 1.25rem; }
h5 { font-size: 1rem; }
h6 { font-size: 0.875rem; }
p { margin-top: 0; margin-bottom: 1rem; }
a { color: {$primary}; text-decoration: none; }
a:hover { text-decoration: underline; }
img { max-width: 100%; height: auto; display: block; }
figure { margin: 0; }

/* WordPress Block Classes */
.wp-site-blocks { min-height: 100vh; display: flex; flex-direction: column; }
.wp-site-blocks > main { flex: 1; }
.wp-block-group { box-sizing: border-box; }
.wp-block-heading { margin-top: 0; }

/* Layout */
.alignfull { width: 100%; max-width: 100%; margin-left: 0; margin-right: 0; }
.alignwide { max-width: 1200px; margin-left: auto; margin-right: auto; }

/* Columns */
.wp-block-columns { display: flex; flex-wrap: wrap; gap: 2em; }
.wp-block-column { flex: 1; min-width: 280px; }
@media (max-width: 781px) {
    .wp-block-columns { flex-direction: column; }
    .wp-block-column { flex-basis: 100% !important; min-width: 100%; }
}

/* Cover Block */
.wp-block-cover {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    padding: 2rem;
    background-size: cover;
    background-position: center;
}
.wp-block-cover__background {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
}
.wp-block-cover__inner-container {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
}

/* Buttons */
.wp-block-buttons { display: flex; flex-wrap: wrap; gap: 0.75em; }
.wp-block-button__link, .wp-element-button {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.2s;
}
.wp-block-button__link:hover, .wp-element-button:hover {
    opacity: 0.9;
    transform: translateY(-1px);
    text-decoration: none;
}

/* Color Classes */
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
.has-white-color { color: #ffffff !important; }
.has-white-background-color { background-color: #ffffff !important; }

/* Text Alignment */
.has-text-align-center { text-align: center; }
.has-text-align-left { text-align: left; }
.has-text-align-right { text-align: right; }

/* WordPress Layout Classes - CRITICAL for columns/flex layouts */
.is-layout-flex { display: flex; flex-wrap: wrap; gap: 2em; align-items: stretch; }
.is-layout-flow > * { margin-top: 0; margin-bottom: 0; }
.is-layout-flow > * + * { margin-top: 1.25em; }
.is-layout-constrained { max-width: 1200px; margin-left: auto; margin-right: auto; padding-left: 1rem; padding-right: 1rem; }
.is-layout-grid { display: grid; gap: 2em; }

/* WordPress dynamic layout classes (generated by do_blocks) */
.wp-block-columns-is-layout-flex { display: flex; flex-wrap: wrap; gap: 2em; }
.wp-block-column-is-layout-flow { flex: 1; min-width: 280px; }
.wp-block-buttons-is-layout-flex { display: flex; flex-wrap: wrap; gap: 0.75em; }
.wp-block-group-is-layout-flex { display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; }
.wp-block-group-is-layout-constrained { max-width: 1200px; margin-left: auto; margin-right: auto; }

/* Content justification */
.is-content-justification-center { justify-content: center; }
.is-content-justification-space-between { justify-content: space-between; }
.is-content-justification-left { justify-content: flex-start; }
.is-content-justification-right { justify-content: flex-end; }

/* Flex modifiers */
.is-nowrap { flex-wrap: nowrap; }
.is-vertically-aligned-center { align-items: center; }
.is-vertically-aligned-top { align-items: flex-start; }
.is-vertically-aligned-bottom { align-items: flex-end; }

/* Global padding for constrained layouts */
.has-global-padding { padding-left: 1rem; padding-right: 1rem; }

/* Navigation */
.wp-block-navigation { display: flex; gap: 1rem; flex-wrap: wrap; }
.wp-block-navigation a { color: inherit; text-decoration: none; padding: 0.5rem 1rem; }
.wp-block-navigation a:hover { opacity: 0.8; }

/* Spacer */
.wp-block-spacer { display: block; }

/* Separator */
.wp-block-separator {
    border: none;
    border-top: 1px solid {$secondary};
    margin: 2rem 0;
}

/* Quote */
.wp-block-quote {
    border-left: 4px solid {$primary};
    padding-left: 1.5rem;
    margin: 1.5rem 0;
    font-style: italic;
}

/* List */
.wp-block-list { padding-left: 1.5rem; }
.wp-block-list li { margin-bottom: 0.5rem; }

/* Image */
.wp-block-image { margin: 0; }
.wp-block-image img { border-radius: 8px; }
.wp-block-image.is-style-rounded img { border-radius: 50%; }

/* Form Elements */
input, textarea, select {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 1rem;
    font-family: inherit;
    background: #ffffff;
    color: {$text};
    transition: border-color 0.2s, box-shadow 0.2s;
}
input:focus, textarea:focus, select:focus {
    outline: none;
    border-color: {$primary};
    box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1);
}
label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
}

/* Utility Classes */
.has-background { padding: 1.5rem; }
.has-text-color { }
.screen-reader-text {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
}

/* Print Styles */
@media print {
    body { background: white; color: black; }
    a { color: black; text-decoration: underline; }
    .wp-block-button, nav { display: none; }
}
CSS;

        return $css;
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
