<?php
/**
 * Navigation Builder - Creates nav menus with wp_create_nav_menu
 *
 * @package PressPilot_Factory
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class PressPilot_Factory_Navigation_Builder {

    private $menu_name = 'PressPilot Primary';

    /**
     * Create navigation menu
     */
    public function create_menu( $business_name, $pages, $category ) {
        // Delete existing menu if present
        $this->delete_existing_menu();

        // Create new menu
        $menu_name = $business_name . ' Navigation';
        $menu_id = wp_create_nav_menu( $menu_name );

        if ( is_wp_error( $menu_id ) ) {
            // Menu might already exist
            $menu = wp_get_nav_menu_object( $menu_name );
            if ( $menu ) {
                $menu_id = $menu->term_id;
                // Clear existing items
                $this->clear_menu_items( $menu_id );
            } else {
                return false;
            }
        }

        // Get ordered pages based on category
        $ordered_pages = $this->get_ordered_pages( $pages, $category );

        // Add menu items
        $position = 0;
        foreach ( $ordered_pages as $slug => $page_info ) {
            $position += 10;

            wp_update_nav_menu_item( $menu_id, 0, [
                'menu-item-title'     => $page_info['title'],
                'menu-item-object'    => 'page',
                'menu-item-object-id' => $page_info['id'],
                'menu-item-type'      => 'post_type',
                'menu-item-status'    => 'publish',
                'menu-item-position'  => $position,
            ]);
        }

        // Assign menu to primary location
        $this->assign_menu_location( $menu_id );

        // Mark menu as generated
        update_term_meta( $menu_id, '_presspilot_generated', true );

        return $menu_id;
    }

    /**
     * Get pages in category-specific order
     */
    private function get_ordered_pages( $pages, $category ) {
        // Define order based on category
        $order_map = [
            'corporate' => [ 'home', 'about', 'services', 'contact' ],
            'restaurant' => [ 'home', 'menu', 'about', 'contact' ],
            'ecommerce' => [ 'home', 'shop', 'about', 'cart', 'contact' ],
        ];

        $order = $order_map[ $category ] ?? $order_map['corporate'];

        $ordered = [];
        foreach ( $order as $slug ) {
            if ( isset( $pages[ $slug ] ) ) {
                $ordered[ $slug ] = $pages[ $slug ];
            }
        }

        // Add any remaining pages not in order
        foreach ( $pages as $slug => $page_info ) {
            if ( ! isset( $ordered[ $slug ] ) ) {
                $ordered[ $slug ] = $page_info;
            }
        }

        return $ordered;
    }

    /**
     * Delete existing PressPilot menu
     */
    private function delete_existing_menu() {
        // Find menus marked as generated
        $menus = wp_get_nav_menus();

        foreach ( $menus as $menu ) {
            $is_generated = get_term_meta( $menu->term_id, '_presspilot_generated', true );
            if ( $is_generated ) {
                wp_delete_nav_menu( $menu->term_id );
            }
        }
    }

    /**
     * Clear all items from a menu
     */
    private function clear_menu_items( $menu_id ) {
        $menu_items = wp_get_nav_menu_items( $menu_id );

        if ( $menu_items ) {
            foreach ( $menu_items as $item ) {
                wp_delete_post( $item->ID, true );
            }
        }
    }

    /**
     * Assign menu to theme location
     */
    private function assign_menu_location( $menu_id ) {
        $locations = get_theme_mod( 'nav_menu_locations', [] );

        // Try common location names
        $primary_locations = [
            'primary',
            'main',
            'header',
            'main-menu',
            'primary-menu',
            'header-menu',
        ];

        // Get registered locations
        $registered = get_registered_nav_menus();

        foreach ( $primary_locations as $location ) {
            if ( isset( $registered[ $location ] ) ) {
                $locations[ $location ] = $menu_id;
                break;
            }
        }

        // If no match, use first registered location
        if ( empty( $locations ) && ! empty( $registered ) ) {
            $first_location = array_key_first( $registered );
            $locations[ $first_location ] = $menu_id;
        }

        set_theme_mod( 'nav_menu_locations', $locations );
    }

    /**
     * Create footer menu
     */
    public function create_footer_menu( $business_name, $pages ) {
        $menu_name = $business_name . ' Footer';
        $menu_id = wp_create_nav_menu( $menu_name );

        if ( is_wp_error( $menu_id ) ) {
            return false;
        }

        // Footer usually has fewer items
        $footer_pages = [ 'about', 'contact', 'services' ];
        $position = 0;

        foreach ( $footer_pages as $slug ) {
            if ( isset( $pages[ $slug ] ) ) {
                $position += 10;
                wp_update_nav_menu_item( $menu_id, 0, [
                    'menu-item-title'     => $pages[ $slug ]['title'],
                    'menu-item-object'    => 'page',
                    'menu-item-object-id' => $pages[ $slug ]['id'],
                    'menu-item-type'      => 'post_type',
                    'menu-item-status'    => 'publish',
                    'menu-item-position'  => $position,
                ]);
            }
        }

        // Mark as generated
        update_term_meta( $menu_id, '_presspilot_generated', true );

        // Assign to footer location
        $locations = get_theme_mod( 'nav_menu_locations', [] );
        $footer_locations = [ 'footer', 'footer-menu', 'secondary' ];
        $registered = get_registered_nav_menus();

        foreach ( $footer_locations as $location ) {
            if ( isset( $registered[ $location ] ) ) {
                $locations[ $location ] = $menu_id;
                set_theme_mod( 'nav_menu_locations', $locations );
                break;
            }
        }

        return $menu_id;
    }

    /**
     * Add social menu items
     */
    public function create_social_menu( $social_links ) {
        if ( empty( $social_links ) ) {
            return false;
        }

        $menu_name = 'Social Links';
        $menu_id = wp_create_nav_menu( $menu_name );

        if ( is_wp_error( $menu_id ) ) {
            return false;
        }

        $position = 0;
        foreach ( $social_links as $platform => $url ) {
            if ( ! empty( $url ) ) {
                $position += 10;
                wp_update_nav_menu_item( $menu_id, 0, [
                    'menu-item-title'  => ucfirst( $platform ),
                    'menu-item-url'    => esc_url( $url ),
                    'menu-item-type'   => 'custom',
                    'menu-item-status' => 'publish',
                    'menu-item-position' => $position,
                    'menu-item-classes' => 'social-link social-' . sanitize_html_class( $platform ),
                ]);
            }
        }

        update_term_meta( $menu_id, '_presspilot_generated', true );

        return $menu_id;
    }

    /**
     * Delete all generated menus
     */
    public function delete_generated_menus() {
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
}
