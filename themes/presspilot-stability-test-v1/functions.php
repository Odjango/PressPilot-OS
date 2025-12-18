<?php
/**
 * PressPilot Golden V1 functions.
 *
 * @package presspilot-stability-test-v1
 */

if (!function_exists('presspilot_stability_test_v1_setup')) {
    /**
     * Theme setup.
     */
    function presspilot_stability_test_v1_setup()
    {
        // Core block theme supports.
        add_theme_support('wp-block-styles');
        add_theme_support('editor-styles');
        add_theme_support('responsive-embeds');
        add_theme_support('automatic-feed-links');
    }
}
add_action('after_setup_theme', 'presspilot_stability_test_v1_setup');

/**
 * Enqueue front-end styles if needed.
 * Keep empty or minimal to encourage theme.json-driven styling.
 */
function presspilot_stability_test_v1_enqueue_styles()
{
    // Intentionally minimal: rely on theme.json for most styling.
    wp_enqueue_style(
        'presspilot-stability-test-v1-style',
        get_stylesheet_uri(),
        array(),
        wp_get_theme()->get('Version')
    );
}
add_action('wp_enqueue_scripts', 'presspilot_stability_test_v1_enqueue_styles');

/**
 * AI Theme Seeder: Automates clean install and content injection.
 */
class presspilot_stability_test_v1_Seeder {

    public function __construct() {
        add_action( 'after_switch_theme', array( $this, 'activation_logic' ) );
    }

    public function activation_logic() {
        // 1. Guard Clause: Prevent re-running if already seeded
        if ( get_option( 'presspilot_stability_test_v1_seeded' ) ) {
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
        update_option( 'presspilot_stability_test_v1_seeded', true );
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
                'content' => '<!-- wp:paragraph --><p>Welcome to the Stability Systems homepage. We are testing the architectural integrity of the generated WordPress content. This page contains a significant amount of text to ensure the database insertion logic handles larger payloads correctly without truncation or encoding errors. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p><!-- /wp:paragraph -->'
            ),
            'about' => array(
                'title' => 'About Our Stability',
                'content' => '<!-- wp:paragraph --><p>Our mission is to provide rock-solid themes. Founded in 2024, we adhere to the strictest Golden Specifications. Our team consists of AI agents dedicated to correct PHP syntax and valid JSON schemas. We believe in Silence is Golden (index.php) and Fluid Typography (theme.json). Join us on our journey to 100% build success rates.</p><!-- /wp:paragraph -->'
            ),
            'services' => array(
                'title' => 'Services',
                'content' => '<!-- wp:paragraph --><p>1. Theme Generation: We build FSE themes. 2. Content Seeding: We populate your site automatically. 3. Menu Creation: We wire up your navigation using a hybrid approach. 4. Zip Validation: We ensure your package is ready for upload.</p><!-- /wp:paragraph -->'
            ),
            'faq' => array(
                'title' => 'F.A.Q.',
                'content' => '<!-- wp:paragraph --><p>Q: Is this stable? A: Yes, that is the point of this test. Q: Can I edit this? A: Yes, it is fully block-based. Q: Why is this text all one paragraph? A: Because the V1.2 Seeder currently wraps input in a single paragraph block for simplicity.</p><!-- /wp:paragraph -->'
            ),
            'contact' => array(
                'title' => 'Contact Us',
                'content' => '<!-- wp:paragraph --><p>Reach us at test@example.com or visit our office at 123 Boolean Blvd, Null City.</p><!-- /wp:paragraph -->'
            ),
            'legacy' => array(
                'title' => 'Legacy Systems',
                'content' => '<!-- wp:paragraph --><p>This page tests the handling of potential special characters: \'Quotes\', "Double Quotes", Ampersands & Symbols @ # $ % ^ *. The seeder must escape these correctly.</p><!-- /wp:paragraph -->'
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
        // Note: FSE themes don't register_nav_menus() traditionally, but Navigation Block can look for them.
    }

    private function update_site_options( $pages ) {
        // [Spec 5.3.3] Site Identity and Homepage
        update_option( 'blogname', 'Stability Systems' );

        if ( isset( $pages['home'] ) ) {
            update_option( 'show_on_front', 'page' );
            update_option( 'page_on_front', $pages['home'] );
        }
    }
}

new presspilot_stability_test_v1_Seeder();
