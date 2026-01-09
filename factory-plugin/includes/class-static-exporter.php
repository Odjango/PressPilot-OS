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
     */
    private function export_with_simply_static( $generation_id ) {
        // Configure Simply Static
        $this->configure_simply_static( $generation_id );

        // Trigger export
        if ( class_exists( 'Simply_Static\Plugin' ) ) {
            $plugin = Simply_Static\Plugin::instance();

            // Set delivery method to local
            update_option( 'simply-static-delivery_method', 'local' );
            update_option( 'simply-static-local_dir', $this->export_dir . $generation_id . '/' );

            // Start export
            do_action( 'simply_static_start' );

            // Wait for completion (in real implementation, this would be async)
            $timeout = 60; // seconds
            $start = time();

            while ( time() - $start < $timeout ) {
                $status = get_option( 'simply-static-archive_status', [] );
                if ( isset( $status['status'] ) && $status['status'] === 'complete' ) {
                    break;
                }
                sleep( 1 );
            }
        }

        // Create ZIP from exported files
        $zip_path = $this->create_zip( $generation_id );

        // Return URL
        $upload_dir = wp_upload_dir();
        return str_replace( $upload_dir['basedir'], $upload_dir['baseurl'], $zip_path );
    }

    /**
     * Configure Simply Static settings
     */
    private function configure_simply_static( $generation_id ) {
        $options = [
            'destination_scheme'     => 'https',
            'destination_host'       => parse_url( home_url(), PHP_URL_HOST ),
            'delivery_method'        => 'local',
            'local_dir'             => $this->export_dir . $generation_id . '/',
            'additional_urls'        => '',
            'additional_files'       => '',
            'urls_to_exclude'        => implode( "\n", [
                '/wp-admin/*',
                '/wp-login.php',
                '/wp-json/presspilot/*',
            ]),
            'http_basic_auth_username' => '',
            'http_basic_auth_password' => '',
        ];

        foreach ( $options as $key => $value ) {
            update_option( 'simply-static-' . $key, $value );
        }
    }

    /**
     * Basic static export fallback
     */
    private function export_basic( $generation_id ) {
        $export_path = $this->export_dir . $generation_id;

        if ( ! file_exists( $export_path ) ) {
            wp_mkdir_p( $export_path );
        }

        // Get all published pages
        $pages = get_posts([
            'post_type'      => 'page',
            'post_status'    => 'publish',
            'posts_per_page' => -1,
            'meta_key'       => '_presspilot_generated',
            'meta_value'     => true,
        ]);

        // Export each page
        foreach ( $pages as $page ) {
            $this->export_page( $page, $export_path );
        }

        // Export front page
        $front_page_id = get_option( 'page_on_front' );
        if ( $front_page_id ) {
            $front_page = get_post( $front_page_id );
            if ( $front_page ) {
                $this->export_page( $front_page, $export_path, 'index.html' );
            }
        }

        // Export assets
        $this->export_assets( $export_path );

        // Create ZIP
        $zip_path = $this->create_zip( $generation_id );

        // Cleanup
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
            return false;
        }

        // Process HTML for static export
        $html = $this->process_html_for_static( $html );

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
    private function process_html_for_static( $html ) {
        // Make URLs relative
        $site_url = home_url();

        // Replace absolute URLs with relative
        $html = str_replace( $site_url . '/', '/', $html );
        $html = str_replace( $site_url, '/', $html );

        // Fix asset paths
        $html = preg_replace(
            '/href="\/wp-content\//',
            'href="assets/wp-content/',
            $html
        );
        $html = preg_replace(
            '/src="\/wp-content\//',
            'src="assets/wp-content/',
            $html
        );

        // Remove WordPress-specific elements
        $html = preg_replace( '/<link[^>]*wp-json[^>]*>/', '', $html );
        $html = preg_replace( '/<link[^>]*xmlrpc[^>]*>/', '', $html );
        $html = preg_replace( '/<link[^>]*wlwmanifest[^>]*>/', '', $html );

        return $html;
    }

    /**
     * Export static assets
     */
    private function export_assets( $export_path ) {
        $assets_dir = $export_path . '/assets/wp-content';
        wp_mkdir_p( $assets_dir );

        // Copy theme assets
        $theme_dir = get_stylesheet_directory();
        $this->copy_assets( $theme_dir, $assets_dir . '/themes/' . get_stylesheet() );

        // Copy uploads used by generated content
        $upload_dir = wp_upload_dir();
        $factory_uploads = $upload_dir['basedir'] . '/presspilot-factory';

        if ( file_exists( $factory_uploads ) ) {
            $this->copy_assets( $factory_uploads, $assets_dir . '/uploads/presspilot-factory' );
        }

        // Generate basic CSS
        $this->generate_inline_css( $export_path );
    }

    /**
     * Copy assets recursively
     */
    private function copy_assets( $src, $dst ) {
        if ( ! file_exists( $src ) ) {
            return;
        }

        if ( ! file_exists( $dst ) ) {
            wp_mkdir_p( $dst );
        }

        $dir = opendir( $src );
        while ( ( $file = readdir( $dir ) ) !== false ) {
            if ( $file === '.' || $file === '..' ) {
                continue;
            }

            $src_path = $src . '/' . $file;
            $dst_path = $dst . '/' . $file;

            // Only copy certain file types
            $ext = pathinfo( $file, PATHINFO_EXTENSION );
            $allowed = [ 'css', 'js', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'woff', 'woff2', 'ttf', 'eot' ];

            if ( is_dir( $src_path ) ) {
                $this->copy_assets( $src_path, $dst_path );
            } elseif ( in_array( strtolower( $ext ), $allowed ) ) {
                copy( $src_path, $dst_path );
            }
        }
        closedir( $dir );
    }

    /**
     * Generate inline CSS file
     */
    private function generate_inline_css( $export_path ) {
        $css = get_option( 'presspilot_custom_css', '' );

        if ( ! empty( $css ) ) {
            file_put_contents( $export_path . '/assets/custom.css', $css );
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
