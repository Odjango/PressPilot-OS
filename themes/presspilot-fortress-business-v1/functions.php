<?php
/**
 * PressPilot Golden V1 functions.
 *
 * @package presspilot-fortress-business-v1
 */

if (!function_exists('presspilot_fortress_business_v1_setup')) {
    /**
     * Theme setup.
     */
    function presspilot_fortress_business_v1_setup()
    {
        // Core block theme supports.
        add_theme_support('wp-block-styles');
        add_theme_support('editor-styles');
        add_theme_support('responsive-embeds');
        add_theme_support('automatic-feed-links');

        // Navigation menu locations for the Navigation block UI.
        register_nav_menus(
            array(
                'primary' => __('Primary Menu', 'presspilot-fortress-business-v1'),
            )
        );
    }
}
add_action('after_setup_theme', 'presspilot_fortress_business_v1_setup');

/**
 * Enqueue front-end styles if needed.
 * Keep empty or minimal to encourage theme.json-driven styling.
 */
function presspilot_fortress_business_v1_enqueue_styles()
{
    // Intentionally minimal: rely on theme.json for most styling.
    wp_enqueue_style(
        'presspilot-fortress-business-v1-style',
        get_stylesheet_uri(),
        array(),
        wp_get_theme()->get('Version')
    );
}
add_action('wp_enqueue_scripts', 'presspilot_fortress_business_v1_enqueue_styles');

/**
 * Activation Logic: Create Pages & Navigation
 */
add_action( 'after_switch_theme', 'presspilot_fortress_business_v1_activate' );
function presspilot_fortress_business_v1_activate() {
    $destructive = true;
    
    if ($destructive) {
        $pages = get_posts(['post_type'=>'page','numberposts'=>-1]);
        foreach($pages as $p) wp_trash_post($p->ID);
        $navs = get_posts(['post_type'=>'wp_navigation','numberposts'=>-1]);
        foreach($navs as $n) wp_trash_post($n->ID);
    }

    // Create Pages
    $pages_config = [
        'home' => ['title' => 'Home', 'content' => 'Welcome to Fortress Business.'],
        'about' => ['title' => 'About', 'content' => 'Secure and stable.'],
        'services' => ['title' => 'Services', 'content' => 'We protect your business.'],
        'contact' => ['title' => 'Contact', 'content' => 'Reach out securely.'],
    ];

    $created_ids = [];
    foreach ($pages_config as $slug => $data) {
        // Wrap content in paragraph block automatically
        $content_block = '<!-- wp:paragraph --><p>' . $data['content'] . '</p><!-- /wp:paragraph -->';
        $id = wp_insert_post([
            'post_type' => 'page',
            'post_title' => $data['title'],
            'post_name' => $slug,
            'post_content' => $content_block,
            'post_status' => 'publish'
        ]);
        if (!is_wp_error($id)) $created_ids[$slug] = $id;
    }

    if (isset($created_ids['home'])) {
        update_option('show_on_front', 'page');
        update_option('page_on_front', $created_ids['home']);
    }

    // Create Navigation
    if (!empty($created_ids)) {
        $nav_content = '<!-- wp:navigation -->';
        foreach ($created_ids as $slug => $id) {
            $nav_content .= sprintf(
                '<!-- wp:navigation-link {"label":"%s","type":"page","id":%d} /-->',
                get_the_title($id), $id
            );
        }
        $nav_content .= '<!-- /wp:navigation -->';
        
        wp_insert_post([
            'post_type' => 'wp_navigation',
            'post_title' => 'Main Navigation',
            'post_content' => $nav_content,
            'post_status' => 'publish'
        ]);
    }
    
    update_option('blogname', 'Fortress Business');
}
