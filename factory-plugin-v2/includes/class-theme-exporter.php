<?php
/**
 * Theme Exporter - Packages generated themes into ZIP files
 *
 * @package PressPilot_Factory
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class PressPilot_Theme_Exporter {

    /**
     * Create a ZIP archive from a theme directory
     *
     * @param string $theme_dir Full path to theme directory
     * @param string $theme_slug Theme slug for filename
     * @return string|WP_Error Path to ZIP file or error
     */
    public function create_zip( $theme_dir, $theme_slug ) {
        // Ensure ZipArchive is available
        if ( ! class_exists( 'ZipArchive' ) ) {
            return new WP_Error(
                'zip_unavailable',
                'ZipArchive class is not available on this server',
                array( 'status' => 500 )
            );
        }

        // Normalize paths
        $theme_dir = trailingslashit( $theme_dir );
        $zip_path  = dirname( $theme_dir ) . '/' . $theme_slug . '.zip';

        // Remove existing ZIP if present
        if ( file_exists( $zip_path ) ) {
            unlink( $zip_path );
        }

        // Create ZIP
        $zip = new ZipArchive();
        $result = $zip->open( $zip_path, ZipArchive::CREATE | ZipArchive::OVERWRITE );

        if ( $result !== true ) {
            return new WP_Error(
                'zip_create_failed',
                'Failed to create ZIP archive: ' . $result,
                array( 'status' => 500 )
            );
        }

        // Add files recursively
        $this->add_directory_to_zip( $zip, $theme_dir, $theme_slug );

        // Close and save
        $zip->close();

        if ( ! file_exists( $zip_path ) ) {
            return new WP_Error(
                'zip_save_failed',
                'ZIP file was not saved',
                array( 'status' => 500 )
            );
        }

        return $zip_path;
    }

    /**
     * Recursively add a directory to a ZIP archive
     *
     * @param ZipArchive $zip       ZIP archive object
     * @param string     $dir       Directory to add
     * @param string     $base_name Base name for files in archive
     */
    private function add_directory_to_zip( $zip, $dir, $base_name ) {
        $dir = trailingslashit( $dir );
        $files = scandir( $dir );

        foreach ( $files as $file ) {
            if ( $file === '.' || $file === '..' ) {
                continue;
            }

            $file_path = $dir . $file;
            $zip_path  = $base_name . '/' . $file;

            if ( is_dir( $file_path ) ) {
                $zip->addEmptyDir( $zip_path );
                $this->add_directory_to_zip( $zip, $file_path, $zip_path );
            } else {
                $zip->addFile( $file_path, $zip_path );
            }
        }
    }

    /**
     * Validate theme structure before export
     *
     * @param string $theme_dir Theme directory path
     * @return bool|WP_Error True if valid, error otherwise
     */
    public function validate_theme( $theme_dir ) {
        $required_files = array(
            'style.css',
            'theme.json',
            'templates/index.html',
        );

        $missing = array();

        foreach ( $required_files as $file ) {
            if ( ! file_exists( trailingslashit( $theme_dir ) . $file ) ) {
                $missing[] = $file;
            }
        }

        if ( ! empty( $missing ) ) {
            return new WP_Error(
                'invalid_theme',
                'Theme is missing required files: ' . implode( ', ', $missing ),
                array( 'status' => 400, 'missing_files' => $missing )
            );
        }

        // Validate style.css has required headers
        $style_content = file_get_contents( trailingslashit( $theme_dir ) . 'style.css' );
        if ( strpos( $style_content, 'Theme Name:' ) === false ) {
            return new WP_Error(
                'invalid_style_css',
                'style.css is missing Theme Name header',
                array( 'status' => 400 )
            );
        }

        return true;
    }

    /**
     * Clean up old generated themes
     *
     * @param int $max_age_hours Maximum age in hours before deletion
     * @return int Number of themes cleaned up
     */
    public function cleanup_old_themes( $max_age_hours = 24 ) {
        $count = 0;
        $generated_dir = PRESSPILOT_GENERATED_THEMES_DIR;

        if ( ! is_dir( $generated_dir ) ) {
            return 0;
        }

        $max_age_seconds = $max_age_hours * 3600;
        $now = time();

        $items = scandir( $generated_dir );

        foreach ( $items as $item ) {
            if ( $item === '.' || $item === '..' ) {
                continue;
            }

            $item_path = $generated_dir . $item;
            $mod_time = filemtime( $item_path );

            if ( ( $now - $mod_time ) > $max_age_seconds ) {
                if ( is_dir( $item_path ) ) {
                    $this->recursive_delete( $item_path );
                    $count++;
                } elseif ( pathinfo( $item, PATHINFO_EXTENSION ) === 'zip' ) {
                    unlink( $item_path );
                    $count++;
                }
            }
        }

        return $count;
    }

    /**
     * Recursively delete a directory
     *
     * @param string $dir Directory to delete
     */
    private function recursive_delete( $dir ) {
        if ( ! is_dir( $dir ) ) {
            return;
        }

        $items = scandir( $dir );

        foreach ( $items as $item ) {
            if ( $item === '.' || $item === '..' ) {
                continue;
            }

            $item_path = $dir . '/' . $item;

            if ( is_dir( $item_path ) ) {
                $this->recursive_delete( $item_path );
            } else {
                unlink( $item_path );
            }
        }

        rmdir( $dir );
    }

    /**
     * Get download URL for a generated theme
     *
     * @param string $theme_slug Theme slug
     * @return string|false URL or false if not found
     */
    public function get_download_url( $theme_slug ) {
        $zip_path = PRESSPILOT_GENERATED_THEMES_DIR . $theme_slug . '.zip';

        if ( ! file_exists( $zip_path ) ) {
            return false;
        }

        return content_url( 'themes/generated/' . $theme_slug . '.zip' );
    }

    /**
     * Get file size of generated theme ZIP
     *
     * @param string $theme_slug Theme slug
     * @return int|false File size in bytes or false
     */
    public function get_zip_size( $theme_slug ) {
        $zip_path = PRESSPILOT_GENERATED_THEMES_DIR . $theme_slug . '.zip';

        if ( ! file_exists( $zip_path ) ) {
            return false;
        }

        return filesize( $zip_path );
    }
}
