<?php
/**
 * PressPilot Golden V1 functions.
 *
 * @package presspilot-roma-pizza-v1-2
 */

if (!function_exists('presspilot_roma_pizza_v1_2_setup')) {
    /**
     * Theme setup.
     */
    function presspilot_roma_pizza_v1_2_setup()
    {
        // Core block theme supports.
        add_theme_support('wp-block-styles');
        add_theme_support('editor-styles');
        add_theme_support('responsive-embeds');
        add_theme_support('automatic-feed-links');

        // Navigation menu locations for the Navigation block UI.
        register_nav_menus(
            array(
                'primary' => __('Primary Menu', 'presspilot-roma-pizza-v1-2'),
            )
        );
    }
}
add_action('after_setup_theme', 'presspilot_roma_pizza_v1_2_setup');

/**
 * Enqueue front-end styles if needed.
 * Keep empty or minimal to encourage theme.json-driven styling.
 */
function presspilot_roma_pizza_v1_2_enqueue_styles()
{
    // Intentionally minimal: rely on theme.json for most styling.
    wp_enqueue_style(
        'presspilot-roma-pizza-v1-2-style',
        get_stylesheet_uri(),
        array(),
        wp_get_theme()->get('Version')
    );
}
add_action('wp_enqueue_scripts', 'presspilot_roma_pizza_v1_2_enqueue_styles');

/**
 * AI Theme Seeder: Automates clean install and content injection.
 */
class presspilot_roma_pizza_v1_2_Seeder {

    public function __construct() {
        add_action( 'after_switch_theme', array( $this, 'activation_logic' ) );
    }

    public function activation_logic() {
        // 1. Guard Clause: Prevent re-running if already seeded
        if ( get_option( 'presspilot_roma_pizza_v1_2_seeded' ) ) {
            return;
        }

        // Check destructive mode (default true for generated themes)
        $destructive = true;

        if ( $destructive ) {
            $this->wipe_content();
        }

        // 3. Create Content
        $pages = $this->create_pages();

        // 4. Setup Menus
        $this->setup_menus( $pages );

        // 5. Update Options
        $this->update_site_options( $pages );

        // 6. Setup Logo
        $this->setup_logo();

        // 7. Set Flag
        update_option( 'presspilot_roma_pizza_v1_2_seeded', true );
    }

    private function setup_logo() {
        // [Spec 5.4] Logo Seeding
        // Check if logo is already set
        if ( get_theme_mod( 'custom_logo' ) ) {
            return;
        }

        // Sideload logic
        $logo_path = get_template_directory() . '/assets/logo.png';
        if ( ! file_exists( $logo_path ) ) {
            return;
        }

        // Create attachment
        $upload_dir = wp_upload_dir();
        $filename   = 'logo.png';
        $dest_path  = $upload_dir['path'] . '/' . $filename;
        
        copy( $logo_path, $dest_path );

        $filetype = wp_check_filetype( $filename, null );
        $attachment = array(
            'post_mime_type' => $filetype['type'],
            'post_title'     => 'Site Logo',
            'post_content'   => '',
            'post_status'    => 'inherit'
        );

        $attach_id = wp_insert_attachment( $attachment, $dest_path );
        require_once( ABSPATH . 'wp-admin/includes/image.php' );
        $attach_data = wp_generate_attachment_metadata( $attach_id, $dest_path );
        wp_update_attachment_metadata( $attach_id, $attach_data );

        // Set as custom logo
        set_theme_mod( 'custom_logo', $attach_id );
    }


    private function wipe_content() {
        // Delete all Pages
        $pages = get_posts( array( 'post_type' => 'page', 'numberposts' => -1 ) );
        foreach( $pages as $p ) {
            wp_delete_post( $p->ID, true );
        }
        
        // Delete all Menus
        $menus = wp_get_nav_menus();
        foreach ( $menus as $menu ) {
            wp_delete_nav_menu( $menu->term_id );
        }
    }

    private function create_pages() {
        $created_ids = array();
        $pages_config = array(
            'home' => array(
                'title' => 'Home',
                'content' => '<!-- wp:paragraph {} --><p>Welcome to our V1.2 site.</p><!-- /wp:paragraph -->'
            ),
            'about' => array(
                'title' => 'About Us',
                'content' => '<!-- wp:paragraph {} --><p>We make the best pizza.</p><!-- /wp:paragraph -->'
            ),
            'services' => array(
                'title' => 'Services',
                'content' => '<!-- wp:paragraph {} --><p>Dine-in, Takeout, Delivery.</p><!-- /wp:paragraph -->'
            ),
            'contact' => array(
                'title' => 'Contact',
                'content' => '<!-- wp:paragraph {} --><p>Call us at 555-0199.</p><!-- /wp:paragraph -->'
            ),
            'menu' => array(
                'title' => 'Menu',
                'content' => '<!-- wp:paragraph {} --><p>Pizza, Pasta, Salads.</p><!-- /wp:paragraph -->'
            ),
        );

        foreach ( $pages_config as $slug => $data ) {
            $id = wp_insert_post( array(
                'post_title'    => $data['title'],
                'post_content'  => $data['content'],
                'post_status'   => 'publish',
                'post_type'     => 'page',
                'post_name'     => $slug
            ) );
            if ( ! is_wp_error( $id ) ) {
                $created_ids[$slug] = $id;
            }
        }
        return $created_ids;
    }

    private function setup_menus( $pages ) {
        // [Spec 5.3.2] Approach B: Hybrid Way (Classic Menu Injection)
        $menu_name = 'Primary Menu';
        $menu_id = wp_create_nav_menu( $menu_name );

        if ( is_wp_error( $menu_id ) ) {
            return;
        }

        // Add pages to menu
        foreach ( $pages as $slug => $page_id ) {
            wp_update_nav_menu_item( $menu_id, 0, array(
                'menu-item-title'  => get_the_title( $page_id ),
                'menu-item-object-id' => $page_id,
                'menu-item-object' => 'page',
                'menu-item-type'   => 'post_type',
                'menu-item-status' => 'publish'
            ) );
        }

        // Assign to location if theme has one (Core FSE often relies on just the name, but setting location is safe)
    }

    private function update_site_options( $pages ) {
        // [Spec 5.3.3] Site Identity and Homepage
        update_option( 'blogname', 'Roma Pizza' );

        if ( isset( $pages['home'] ) ) {
            update_option( 'show_on_front', 'page' );
            update_option( 'page_on_front', $pages['home'] );
        }
    }
}

new presspilot_roma_pizza_v1_2_Seeder();
