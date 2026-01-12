<?php
/**
 * Static Exporter - Integration with Simply Static plugin
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

        // Check if Simply Static is available
        if ( $this->is_simply_static_available() ) {
            return $this->export_with_simply_static( $generation_id );
        }

        // Fallback to basic static export
        return $this->export_basic( $generation_id );
    }

    /**
     * Check if Simply Static plugin is available
     */
    private function is_simply_static_available() {
        return class_exists( 'Simply_Static\Plugin' ) ||
               class_exists( 'Simply_Static_Plugin' ) ||
               function_exists( 'simply_static_run_static_export' );
    }

    /**
     * Export using Simply Static
     *
     * Note: Simply Static's internal API is complex and version-dependent.
     * For reliability, we use the basic export method which produces
     * consistent results across all environments.
     */
    private function export_with_simply_static( $generation_id ) {
        // Simply Static integration is unreliable for programmatic use.
        // Use the basic export which provides consistent, working results.
        error_log( 'PressPilot Static Export - Using basic export method for reliability' );
        return $this->export_basic( $generation_id );
    }

    /**
     * Configure Simply Static settings
     */
    private function configure_simply_static( $generation_id ) {
        // Get existing Simply Static options (stored as a single serialized array)
        $ss_options = get_option( 'simply-static', [] );

        // Update the options we need
        $ss_options['destination_scheme'] = 'https://';
        $ss_options['destination_host'] = parse_url( home_url(), PHP_URL_HOST );
        $ss_options['delivery_method'] = 'local';
        $ss_options['local_dir'] = $this->export_dir . $generation_id . '/';
        $ss_options['urls_to_exclude'] = "/wp-admin/*\n/wp-login.php\n/wp-json/presspilot/*";
        $ss_options['clear_directory_before_export'] = true;

        // Save back the combined options array
        update_option( 'simply-static', $ss_options );

        // Also set individual options as fallback for some SS versions
        update_option( 'simply-static-delivery_method', 'local' );
        update_option( 'simply-static-local_dir', $this->export_dir . $generation_id . '/' );
    }

    /**
     * Basic static export fallback
     */
    private function export_basic( $generation_id ) {
        $export_path = $this->export_dir . $generation_id;

        if ( ! file_exists( $export_path ) ) {
            wp_mkdir_p( $export_path );
        }

        error_log( 'PressPilot Static Export - Starting basic export to: ' . $export_path );

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

        // If no pages found with meta, try getting all recent pages as fallback
        if ( empty( $pages ) ) {
            $pages = get_posts([
                'post_type'      => 'page',
                'post_status'    => 'publish',
                'posts_per_page' => 10,
                'orderby'        => 'date',
                'order'          => 'DESC',
            ]);
            error_log( 'PressPilot Static Export - Fallback: exporting ' . count( $pages ) . ' recent pages' );
        }

        $exported_count = 0;

        // Export each page
        foreach ( $pages as $page ) {
            if ( $this->export_page( $page, $export_path ) ) {
                $exported_count++;
            }
        }

        // Export front page as index.html
        $front_page_id = get_option( 'page_on_front' );
        if ( $front_page_id ) {
            $front_page = get_post( $front_page_id );
            if ( $front_page ) {
                $this->export_page( $front_page, $export_path, 'index.html' );
            }
        }

        error_log( 'PressPilot Static Export - Exported ' . $exported_count . ' pages' );

        // Export assets
        $this->export_assets( $export_path );

        // Create ZIP
        $zip_path = $this->create_zip( $generation_id );

        if ( empty( $zip_path ) ) {
            error_log( 'PressPilot Static Export - Failed to create ZIP from: ' . $export_path );
            return '';
        }

        $zip_size = file_exists( $zip_path ) ? filesize( $zip_path ) : 0;
        error_log( 'PressPilot Static Export - Created ZIP: ' . $zip_path . ' (' . $zip_size . ' bytes)' );

        // Cleanup exported directory (keep the ZIP)
        $this->cleanup_directory( $export_path );

        // Return URL
        $upload_dir = wp_upload_dir();
        return str_replace( $upload_dir['basedir'], $upload_dir['baseurl'], $zip_path );
    }

    /**
     * Export a single page
     */
    private function export_page( $page, $export_path, $filename = null ) {
        // Get rendered HTML
        $url = get_permalink( $page->ID );
        $html = $this->fetch_page_html( $url );

        if ( empty( $html ) ) {
            error_log( 'PressPilot Static Export - Failed to fetch: ' . $url );
            return false;
        }

        // Determine if this is the index page (affects relative path calculation)
        $is_index = ( $filename === 'index.html' );

        // Process HTML for static export
        $html = $this->process_html_for_static( $html, $is_index );

        // Determine filename
        if ( ! $filename ) {
            $slug = $page->post_name;
            $page_dir = $export_path . '/' . $slug;
            wp_mkdir_p( $page_dir );
            $filename = $page_dir . '/index.html';
        } else {
            $filename = $export_path . '/' . $filename;
        }

        file_put_contents( $filename, $html );
        error_log( 'PressPilot Static Export - Exported: ' . $filename );

        return true;
    }

    /**
     * Fetch page HTML
     */
    private function fetch_page_html( $url ) {
        $response = wp_remote_get( $url, [
            'timeout'   => 30,
            'sslverify' => false,
        ]);

        if ( is_wp_error( $response ) ) {
            return '';
        }

        return wp_remote_retrieve_body( $response );
    }

    /**
     * Process HTML for static export
     */
    private function process_html_for_static( $html, $is_index = false ) {
        $site_url = home_url();
        $site_host = parse_url( $site_url, PHP_URL_HOST );

        // Determine relative path prefix based on page depth
        // Index pages are at root, other pages are in subdirectories
        $asset_prefix = $is_index ? './' : '../';

        // Step 1: Fix asset URLs FIRST (before making URLs relative)
        // Replace wp-content paths with local asset paths
        $html = preg_replace(
            '/(href|src)="' . preg_quote( $site_url, '/' ) . '\/wp-content\//',
            '$1="' . $asset_prefix . 'assets/wp-content/',
            $html
        );
        $html = preg_replace(
            '/(href|src)="\/wp-content\//',
            '$1="' . $asset_prefix . 'assets/wp-content/',
            $html
        );

        // Step 2: Fix wp-includes paths (for block library CSS, etc)
        $html = preg_replace(
            '/(href|src)="' . preg_quote( $site_url, '/' ) . '\/wp-includes\//',
            '$1="' . $asset_prefix . 'assets/wp-includes/',
            $html
        );
        $html = preg_replace(
            '/(href|src)="\/wp-includes\//',
            '$1="' . $asset_prefix . 'assets/wp-includes/',
            $html
        );

        // Step 3: Fix navigation links (internal pages)
        // Keep navigation links working between pages
        $html = preg_replace( '/href="' . preg_quote( $site_url, '/' ) . '\/([^"]*)"/', 'href="' . $asset_prefix . '$1"', $html );
        $html = preg_replace( '/href="\/([a-zA-Z][^"]*)"/', 'href="' . $asset_prefix . '$1/"', $html );

        // Step 4: Fix root home links
        $html = str_replace( 'href="/"', 'href="' . $asset_prefix . '"', $html );
        $html = str_replace( 'href="' . $site_url . '"', 'href="' . $asset_prefix . '"', $html );
        $html = str_replace( 'href="' . $site_url . '/"', 'href="' . $asset_prefix . '"', $html );

        // Step 5: Remove WordPress-specific elements (REST API, etc)
        $html = preg_replace( '/<link[^>]*wp-json[^>]*>/', '', $html );
        $html = preg_replace( '/<link[^>]*xmlrpc[^>]*>/', '', $html );
        $html = preg_replace( '/<link[^>]*wlwmanifest[^>]*>/', '', $html );
        $html = preg_replace( '/<link[^>]*oembed[^>]*>/', '', $html );
        $html = preg_replace( '/<link[^>]*pingback[^>]*>/', '', $html );
        $html = preg_replace( '/<link[^>]*EditURI[^>]*>/', '', $html );

        // Step 6: Remove admin bar if present
        $html = preg_replace( '/<style[^>]*id="admin-bar-[^"]*"[^>]*>.*?<\/style>/s', '', $html );
        $html = preg_replace( '/<div[^>]*id="wpadminbar"[^>]*>.*?<\/div>/s', '', $html );

        return $html;
    }

    /**
     * Export static assets
     */
    private function export_assets( $export_path ) {
        $assets_dir = $export_path . '/assets';
        wp_mkdir_p( $assets_dir . '/wp-content' );
        wp_mkdir_p( $assets_dir . '/wp-includes/css' );

        // Copy theme assets (only essential files)
        $theme_dir = get_stylesheet_directory();
        $this->copy_assets_limited( $theme_dir, $assets_dir . '/wp-content/themes/' . get_stylesheet() );

        // Copy parent theme if using child theme
        if ( get_template_directory() !== $theme_dir ) {
            $this->copy_assets_limited( get_template_directory(), $assets_dir . '/wp-content/themes/' . get_template() );
        }

        // Copy only essential WordPress CSS files (not entire blocks directory)
        $wp_includes = ABSPATH . 'wp-includes';
        $essential_css = [
            'css/dist/block-library/style.min.css',
            'css/dist/block-library/theme.min.css',
        ];
        foreach ( $essential_css as $css_file ) {
            $src = $wp_includes . '/' . $css_file;
            if ( file_exists( $src ) ) {
                $dst_dir = $assets_dir . '/wp-includes/' . dirname( $css_file );
                wp_mkdir_p( $dst_dir );
                copy( $src, $assets_dir . '/wp-includes/' . $css_file );
            }
        }

        // Generate the global styles CSS (this captures all the theme.json styles)
        $this->generate_global_styles_css( $export_path );

        error_log( 'PressPilot Static Export - Assets copied to: ' . $assets_dir );
    }

    /**
     * Copy assets with file limit to prevent timeout
     */
    private function copy_assets_limited( $src, $dst, $max_files = 200 ) {
        if ( ! file_exists( $src ) ) {
            return;
        }

        if ( ! file_exists( $dst ) ) {
            wp_mkdir_p( $dst );
        }

        $file_count = 0;
        $this->copy_assets_recursive( $src, $dst, $file_count, $max_files );
    }

    /**
     * Recursive copy with counter
     */
    private function copy_assets_recursive( $src, $dst, &$file_count, $max_files ) {
        if ( $file_count >= $max_files ) {
            return;
        }

        $dir = opendir( $src );
        while ( ( $file = readdir( $dir ) ) !== false ) {
            if ( $file === '.' || $file === '..' ) {
                continue;
            }

            if ( $file_count >= $max_files ) {
                break;
            }

            $src_path = $src . '/' . $file;
            $dst_path = $dst . '/' . $file;

            // Skip node_modules, .git, and other dev directories
            if ( in_array( $file, [ 'node_modules', '.git', 'vendor', 'tests' ] ) ) {
                continue;
            }

            $ext = pathinfo( $file, PATHINFO_EXTENSION );
            $allowed = [ 'css', 'js', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'woff', 'woff2', 'ttf', 'eot', 'json' ];

            if ( is_dir( $src_path ) ) {
                if ( ! file_exists( $dst_path ) ) {
                    wp_mkdir_p( $dst_path );
                }
                $this->copy_assets_recursive( $src_path, $dst_path, $file_count, $max_files );
            } elseif ( in_array( strtolower( $ext ), $allowed ) ) {
                copy( $src_path, $dst_path );
                $file_count++;
            }
        }
        closedir( $dir );
    }

    /**
     * Generate global styles CSS from WordPress
     */
    private function generate_global_styles_css( $export_path ) {
        // Get the global styles CSS that WordPress generates
        if ( function_exists( 'wp_get_global_stylesheet' ) ) {
            $global_css = wp_get_global_stylesheet();
            if ( ! empty( $global_css ) ) {
                file_put_contents( $export_path . '/assets/global-styles.css', $global_css );
            }
        }

        // Get custom CSS if any
        $custom_css = get_option( 'presspilot_custom_css', '' );
        if ( ! empty( $custom_css ) ) {
            file_put_contents( $export_path . '/assets/custom.css', $custom_css );
        }

        // Get the generated theme's colors and create a fallback CSS
        $last_gen = get_option( 'presspilot_last_generation' );
        if ( $last_gen && ! empty( $last_gen['params']['colors'] ) ) {
            $colors = $last_gen['params']['colors'];
            $fallback_css = ":root {\n";
            $fallback_css .= "  --wp--preset--color--base: " . ( $colors['background'] ?? '#ffffff' ) . ";\n";
            $fallback_css .= "  --wp--preset--color--contrast: " . ( $colors['text'] ?? '#1f2937' ) . ";\n";
            $fallback_css .= "  --wp--preset--color--primary: " . ( $colors['primary'] ?? '#1e40af' ) . ";\n";
            $fallback_css .= "  --wp--preset--color--secondary: " . ( $colors['secondary'] ?? '#64748b' ) . ";\n";
            $fallback_css .= "  --wp--preset--color--accent: " . ( $colors['accent'] ?? '#f59e0b' ) . ";\n";
            $fallback_css .= "}\n";
            $fallback_css .= "body { background-color: var(--wp--preset--color--base); color: var(--wp--preset--color--contrast); }\n";
            $fallback_css .= ".has-primary-color { color: var(--wp--preset--color--primary); }\n";
            $fallback_css .= ".has-primary-background-color { background-color: var(--wp--preset--color--primary); }\n";
            $fallback_css .= ".has-secondary-color { color: var(--wp--preset--color--secondary); }\n";
            $fallback_css .= ".has-secondary-background-color { background-color: var(--wp--preset--color--secondary); }\n";
            $fallback_css .= ".has-base-color { color: var(--wp--preset--color--base); }\n";
            $fallback_css .= ".has-base-background-color { background-color: var(--wp--preset--color--base); }\n";
            $fallback_css .= ".has-contrast-color { color: var(--wp--preset--color--contrast); }\n";
            $fallback_css .= ".has-contrast-background-color { background-color: var(--wp--preset--color--contrast); }\n";

            file_put_contents( $export_path . '/assets/fallback-colors.css', $fallback_css );
        }
    }

    /**
     * Create ZIP from exported files
     */
    private function create_zip( $generation_id ) {
        $source_dir = $this->export_dir . $generation_id;
        $zip_file = $this->export_dir . 'static-' . $generation_id . '.zip';

        if ( ! file_exists( $source_dir ) ) {
            // If Simply Static was used, the export might be in a different location
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
