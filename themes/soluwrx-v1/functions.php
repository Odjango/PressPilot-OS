<?php
/**
 * PressPilot Golden V1 functions.
 *
 * @package soluwrx-v1
 */

if (!function_exists('soluwrx_v1_setup')) {
    /**
     * Theme setup.
     */
    function soluwrx_v1_setup()
    {
        // Core block theme supports.
        add_theme_support('wp-block-styles');
        add_theme_support('editor-styles');
        add_theme_support('responsive-embeds');
        add_theme_support('automatic-feed-links');
    }
}
add_action('after_setup_theme', 'soluwrx_v1_setup');

/**
 * Enqueue front-end styles if needed.
 * Keep empty or minimal to encourage theme.json-driven styling.
 */
function soluwrx_v1_enqueue_styles()
{
    // Intentionally minimal: rely on theme.json for most styling.
    wp_enqueue_style(
        'soluwrx-v1-style',
        get_stylesheet_uri(),
        array(),
        wp_get_theme()->get('Version')
    );
}
add_action('wp_enqueue_scripts', 'soluwrx_v1_enqueue_styles');

/**
 * AI Theme Seeder: Automates clean install and content injection.
 */
class soluwrx_v1_Seeder {

    public function __construct() {
        add_action( 'after_switch_theme', array( $this, 'activation_logic' ) );
    }

    public function activation_logic() {
        // 1. Guard Clause: Prevent re-running if already seeded
        if ( get_option( 'soluwrx_v1_seeded' ) ) {
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

        // 6. Set Flag
        update_option( 'soluwrx_v1_seeded', true );
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
                'content' => '<!-- wp:paragraph --><p><!-- wp:cover {"url":"https://s.w.org/images/core/5.3/MtBlanc1.jpg","id":1,"dimRatio":50,"overlayColor":"primary","align":"full"} -->
<div class="wp-block-cover alignfull"><span aria-hidden="true" class="wp-block-cover__background has-primary-background-color has-background-dim-50 has-background-dim"></span><img class="wp-block-cover__image-background wp-image-1" alt="" src="https://s.w.org/images/core/5.3/MtBlanc1.jpg" data-object-fit="cover"/><div class="wp-block-cover__inner-container"><!-- wp:heading {"textAlign":"center","level":1} -->
<h1 class="has-text-align-center">Welcome to SoluWRX</h1>
<!-- /wp:heading -->

<!-- wp:paragraph {"align":"center","fontSize":"large"} -->
<p class="has-text-align-center has-large-font-size">Innovating the Future of PressPilot Themes.</p>
<!-- /wp:paragraph -->

<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
<div class="wp-block-buttons"><!-- wp:button {"className":"is-style-fill"} -->
<div class="wp-block-button is-style-fill"><a class="wp-block-button__link wp-element-button">Get Started</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div></div>
<!-- /wp:cover -->

<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group"><!-- wp:heading {"textAlign":"center"} -->
<h2 class="has-text-align-center">Our Services</h2>
<!-- /wp:heading -->

<!-- wp:columns {"align":"wide"} -->
<div class="wp-block-columns alignwide"><!-- wp:column -->
<div class="wp-block-column"><!-- wp:heading {"level":3} -->
<h3>Strategy</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>We plan for success with data-driven insights.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column"><!-- wp:heading {"level":3} -->
<h3>Design</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Beautiful, functional, and compliant designs.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column"><!-- wp:heading {"level":3} -->
<h3>Development</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Robust code that scales with your business.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:column --></div>
<!-- /wp:columns --></div>
<!-- /wp:group --></p><!-- /wp:paragraph -->'
            ),
            'about' => array(
                'title' => 'About Us',
                'content' => '<!-- wp:paragraph --><p><!-- wp:paragraph --><p>We are SoluWRX. We build things.</p><!-- /wp:paragraph --></p><!-- /wp:paragraph -->'
            ),
            'contact' => array(
                'title' => 'Contact',
                'content' => '<!-- wp:paragraph --><p><!-- wp:paragraph --><p>Get in touch with us today.</p><!-- /wp:paragraph --></p><!-- /wp:paragraph -->'
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
        update_option( 'blogname', 'SoluWRX' );

        if ( isset( $pages['home'] ) ) {
            update_option( 'show_on_front', 'page' );
            update_option( 'page_on_front', $pages['home'] );
        }
    }
}

new soluwrx_v1_Seeder();
