<?php
/**
 * PressPilot Golden V1 functions.
 *
 * @package presspilot-invent-business-v1
 */

if (!function_exists('presspilot_invent_business_v1_setup')) {
    /**
     * Theme setup.
     */
    function presspilot_invent_business_v1_setup()
    {
        // Core block theme supports.
        add_theme_support('wp-block-styles');
        add_theme_support('editor-styles');
        add_theme_support('responsive-embeds');
        add_theme_support('automatic-feed-links');
    }
}
add_action('after_setup_theme', 'presspilot_invent_business_v1_setup');

/**
 * Enqueue front-end styles if needed.
 * Keep empty or minimal to encourage theme.json-driven styling.
 */
function presspilot_invent_business_v1_enqueue_styles()
{
    // Intentionally minimal: rely on theme.json for most styling.
    wp_enqueue_style(
        'presspilot-invent-business-v1-style',
        get_stylesheet_uri(),
        array(),
        wp_get_theme()->get('Version')
    );
}
add_action('wp_enqueue_scripts', 'presspilot_invent_business_v1_enqueue_styles');

/**
 * AI Theme Seeder: Automates clean install and content injection.
 */
class presspilot_invent_business_v1_Seeder {

    public function __construct() {
        add_action( 'after_switch_theme', array( $this, 'activation_logic' ) );
    }

    public function activation_logic() {
        // 1. Guard Clause: Prevent re-running if already seeded
        if ( get_option( 'presspilot_invent_business_v1_seeded' ) ) {
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
        update_option( 'presspilot_invent_business_v1_seeded', true );
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
                'content' => '<!-- wp:paragraph --><p><!-- wp:paragraph --><p>Content is driven by front-page.html template.</p><!-- /wp:paragraph --></p><!-- /wp:paragraph -->'
            ),
            'about' => array(
                'title' => 'About Us',
                'content' => '<!-- wp:paragraph --><p><!-- wp:heading --><h2>Our Journey</h2><!-- /wp:heading --><!-- wp:list --><ul><li>2020: Founded</li><li>2022: Scaled</li><li>2024: IPO</li></ul><!-- /wp:list --><!-- wp:heading --><h2>The Team</h2><!-- /wp:heading --><!-- wp:columns --><div class="wp-block-columns"><!-- wp:column --><div class="wp-block-column"><p>CEO</p></div><!-- /wp:column --><!-- wp:column --><div class="wp-block-column"><p>CTO</p></div><!-- /wp:column --></div><!-- /wp:columns --></p><!-- /wp:paragraph -->'
            ),
            'services' => array(
                'title' => 'Services',
                'content' => '<!-- wp:paragraph --><p><!-- wp:heading --><h2>What We Do</h2><!-- /wp:heading --><!-- wp:table --><figure class="wp-block-table"><table><thead><tr><th>Tier</th><th>Features</th></tr></thead><tbody><tr><td>Basic</td><td>Audit</td></tr><tr><td>Pro</td><td>Audit + Fix</td></tr></tbody></table></figure><!-- /wp:table --></p><!-- /wp:paragraph -->'
            ),
            'case-studies' => array(
                'title' => 'Case Studies',
                'content' => '<!-- wp:paragraph --><p><!-- wp:heading --><h2>Success Stories</h2><!-- /wp:heading --><!-- wp:paragraph --><p>ACME Corp improved uptime by 99%.</p><!-- /wp:paragraph --></p><!-- /wp:paragraph -->'
            ),
            'pricing' => array(
                'title' => 'Pricing',
                'content' => '<!-- wp:paragraph --><p><!-- wp:heading --><h2>Plans</h2><!-- /wp:heading --><!-- wp:paragraph --><p>See homepage for details.</p><!-- /wp:paragraph --></p><!-- /wp:paragraph -->'
            ),
            'contact' => array(
                'title' => 'Contact',
                'content' => '<!-- wp:paragraph --><p><!-- wp:heading --><h2>Get in Touch</h2><!-- /wp:heading --><!-- wp:paragraph --><p>Email: hello@invent.biz</p><!-- /wp:paragraph --><!-- wp:group {"style":{"border":{"width":"1px"}}} --><div class="wp-block-group" style="border-width:1px"><!-- wp:paragraph --><p>Name:</p><!-- /wp:paragraph --><!-- wp:paragraph --><p>Email:</p><!-- /wp:paragraph --><!-- wp:button --><div class="wp-block-button"><a class="wp-block-button__link">Send</a></div><!-- /wp:button --></div><!-- /wp:group --></p><!-- /wp:paragraph -->'
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
        update_option( 'blogname', 'Invent Business' );

        if ( isset( $pages['home'] ) ) {
            update_option( 'show_on_front', 'page' );
            update_option( 'page_on_front', $pages['home'] );
        }
    }
}

new presspilot_invent_business_v1_Seeder();
