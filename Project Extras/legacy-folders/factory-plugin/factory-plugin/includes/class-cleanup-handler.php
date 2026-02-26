<?php
/**
 * Cleanup Handler - Deletes pages/posts with _presspilot_generated meta
 *
 * @package PressPilot_Factory
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class PressPilot_Factory_Cleanup_Handler {

    /**
     * Cleanup all generated content
     */
    public function cleanup() {
        $count = 0;

        // Clean up pages
        $count += $this->cleanup_posts( 'page' );

        // Clean up posts
        $count += $this->cleanup_posts( 'post' );

        // Clean up attachments
        $count += $this->cleanup_attachments();

        // Clean up navigation menus
        $count += $this->cleanup_menus();

        // Clean up options
        $this->cleanup_options();

        // Reset front page settings
        $this->reset_front_page();

        return $count;
    }

    /**
     * Cleanup posts of specific type
     */
    private function cleanup_posts( $post_type ) {
        $args = [
            'post_type'      => $post_type,
            'posts_per_page' => -1,
            'post_status'    => 'any',
            'meta_key'       => '_presspilot_generated',
            'meta_value'     => true,
            'fields'         => 'ids',
        ];

        $posts = get_posts( $args );
        $count = 0;

        foreach ( $posts as $post_id ) {
            $result = wp_delete_post( $post_id, true );
            if ( $result ) {
                $count++;
            }
        }

        return $count;
    }

    /**
     * Cleanup generated attachments
     */
    private function cleanup_attachments() {
        $args = [
            'post_type'      => 'attachment',
            'posts_per_page' => -1,
            'post_status'    => 'any',
            'meta_key'       => '_presspilot_generated',
            'meta_value'     => true,
            'fields'         => 'ids',
        ];

        $attachments = get_posts( $args );
        $count = 0;

        foreach ( $attachments as $attachment_id ) {
            $result = wp_delete_attachment( $attachment_id, true );
            if ( $result ) {
                $count++;
            }
        }

        return $count;
    }

    /**
     * Cleanup generated menus
     */
    private function cleanup_menus() {
        $menus = wp_get_nav_menus();
        $count = 0;

        foreach ( $menus as $menu ) {
            $is_generated = get_term_meta( $menu->term_id, '_presspilot_generated', true );

            if ( $is_generated ) {
                wp_delete_nav_menu( $menu->term_id );
                $count++;
            }
        }

        return $count;
    }

    /**
     * Cleanup PressPilot options
     */
    private function cleanup_options() {
        $options_to_delete = [
            'presspilot_last_generation',
            'presspilot_applied_branding',
            'presspilot_color_palette',
            'presspilot_font_families',
            'presspilot_custom_css',
            'presspilot_google_fonts_url',
            'presspilot_global_styles',
            'presspilot_logo_id',
        ];

        foreach ( $options_to_delete as $option ) {
            delete_option( $option );
        }
    }

    /**
     * Reset front page settings
     */
    private function reset_front_page() {
        // Check if current front page was generated
        $front_page_id = get_option( 'page_on_front' );

        if ( $front_page_id ) {
            $is_generated = get_post_meta( $front_page_id, '_presspilot_generated', true );

            if ( $is_generated ) {
                update_option( 'show_on_front', 'posts' );
                update_option( 'page_on_front', 0 );
            }
        }
    }

    /**
     * Cleanup exported files
     */
    public function cleanup_exports() {
        $upload_dir = wp_upload_dir();
        $factory_dir = $upload_dir['basedir'] . '/presspilot-factory';

        if ( ! file_exists( $factory_dir ) ) {
            return 0;
        }

        $count = 0;

        // Clean themes directory
        $themes_dir = $factory_dir . '/themes';
        if ( file_exists( $themes_dir ) ) {
            $count += $this->cleanup_directory( $themes_dir );
        }

        // Clean static directory
        $static_dir = $factory_dir . '/static';
        if ( file_exists( $static_dir ) ) {
            $count += $this->cleanup_directory( $static_dir );
        }

        // Clean temp directory
        $temp_dir = $factory_dir . '/temp';
        if ( file_exists( $temp_dir ) ) {
            $count += $this->cleanup_directory( $temp_dir );
        }

        return $count;
    }

    /**
     * Cleanup directory contents
     */
    private function cleanup_directory( $dir ) {
        if ( ! file_exists( $dir ) ) {
            return 0;
        }

        $count = 0;
        $files = glob( $dir . '/*' );

        foreach ( $files as $file ) {
            if ( is_dir( $file ) ) {
                $count += $this->recursive_delete( $file );
            } else {
                if ( unlink( $file ) ) {
                    $count++;
                }
            }
        }

        return $count;
    }

    /**
     * Recursively delete directory
     */
    private function recursive_delete( $dir ) {
        $count = 0;

        if ( ! file_exists( $dir ) ) {
            return 0;
        }

        $files = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator( $dir, RecursiveDirectoryIterator::SKIP_DOTS ),
            RecursiveIteratorIterator::CHILD_FIRST
        );

        foreach ( $files as $file ) {
            if ( $file->isDir() ) {
                rmdir( $file->getRealPath() );
            } else {
                if ( unlink( $file->getRealPath() ) ) {
                    $count++;
                }
            }
        }

        rmdir( $dir );

        return $count;
    }

    /**
     * Get cleanup preview (what would be deleted)
     */
    public function get_cleanup_preview() {
        $preview = [
            'pages'       => [],
            'posts'       => [],
            'attachments' => [],
            'menus'       => [],
        ];

        // Pages
        $pages = get_posts([
            'post_type'      => 'page',
            'posts_per_page' => -1,
            'meta_key'       => '_presspilot_generated',
            'meta_value'     => true,
        ]);

        foreach ( $pages as $page ) {
            $preview['pages'][] = [
                'id'    => $page->ID,
                'title' => $page->post_title,
                'url'   => get_permalink( $page->ID ),
            ];
        }

        // Posts
        $posts = get_posts([
            'post_type'      => 'post',
            'posts_per_page' => -1,
            'meta_key'       => '_presspilot_generated',
            'meta_value'     => true,
        ]);

        foreach ( $posts as $post ) {
            $preview['posts'][] = [
                'id'    => $post->ID,
                'title' => $post->post_title,
            ];
        }

        // Attachments
        $attachments = get_posts([
            'post_type'      => 'attachment',
            'posts_per_page' => -1,
            'meta_key'       => '_presspilot_generated',
            'meta_value'     => true,
        ]);

        foreach ( $attachments as $attachment ) {
            $preview['attachments'][] = [
                'id'    => $attachment->ID,
                'title' => $attachment->post_title,
                'url'   => wp_get_attachment_url( $attachment->ID ),
            ];
        }

        // Menus
        $menus = wp_get_nav_menus();
        foreach ( $menus as $menu ) {
            $is_generated = get_term_meta( $menu->term_id, '_presspilot_generated', true );
            if ( $is_generated ) {
                $preview['menus'][] = [
                    'id'   => $menu->term_id,
                    'name' => $menu->name,
                ];
            }
        }

        $preview['total'] = count( $preview['pages'] ) +
                           count( $preview['posts'] ) +
                           count( $preview['attachments'] ) +
                           count( $preview['menus'] );

        return $preview;
    }
}
