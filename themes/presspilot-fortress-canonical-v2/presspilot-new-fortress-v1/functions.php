<?php
/**
 * PressPilot Golden V1 functions.
 *
 * @package presspilot-new-fortress-v1
 */

if (!function_exists('presspilot_new_fortress_v1_setup')) {
    /**
     * Theme setup.
     */
    function presspilot_new_fortress_v1_setup()
    {
        // Core block theme supports.
        add_theme_support('wp-block-styles');
        add_theme_support('editor-styles');
        add_theme_support('responsive-embeds');
        add_theme_support('automatic-feed-links');
    }
}
add_action('after_setup_theme', 'presspilot_new_fortress_v1_setup');

/**
 * Enqueue front-end styles if needed.
 * Keep empty or minimal to encourage theme.json-driven styling.
 */
function presspilot_new_fortress_v1_enqueue_styles()
{
    // Intentionally minimal: rely on theme.json for most styling.
    wp_enqueue_style(
        'presspilot-new-fortress-v1-style',
        get_stylesheet_uri(),
        array(),
        wp_get_theme()->get('Version')
    );
}
add_action('wp_enqueue_scripts', 'presspilot_new_fortress_v1_enqueue_styles');

/**
 * Activation Logic: Create Pages & Navigation
 */
add_action( 'after_switch_theme', 'presspilot_new_fortress_v1_activate' );
function presspilot_new_fortress_v1_activate() {
    $destructive = true;
    
    if ($destructive) {
        $pages = get_posts(['post_type'=>'page','numberposts'=>-1]);
        foreach($pages as $p) wp_trash_post($p->ID);
        $navs = get_posts(['post_type'=>'wp_navigation','numberposts'=>-1]);
        foreach($navs as $n) wp_trash_post($n->ID);
    }

    // Create Pages
    $pages_config = [
        'home' => ['title' => 'Home', 'content' => 'Welcome to New Fortress.'],
        'security' => ['title' => 'Security', 'content' => 'Advanced protection.'],
        'network' => ['title' => 'Network', 'content' => 'Global coverage.'],
        'contact' => ['title' => 'Contact', 'content' => 'Secure lines open.'],
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

    update_option('blogname', 'New Fortress');

    // Auto-Logo Sideload
    $upload_dir = wp_upload_dir();
    $filename = 'logo.svg';
    $source = get_theme_file_path('/assets/logo.svg');
    $dest = $upload_dir['path'] . '/' . $filename;
    
    if (file_exists($source) && !get_theme_mod('custom_logo')) {
         copy($source, $dest);
         $attachment = [
             'guid'           => $upload_dir['url'] . '/' . $filename, 
             'post_mime_type' => 'image/svg+xml',
             'post_title'     => 'Site Logo',
             'post_content'   => '',
             'post_status'    => 'inherit'
         ];
         $attach_id = wp_insert_attachment( $attachment, $dest );
         if (!is_wp_error($attach_id)) {
            require_once(ABSPATH . 'wp-admin/includes/image.php');
            $attach_data = wp_generate_attachment_metadata( $attach_id, $dest );
            wp_update_attachment_metadata( $attach_id, $attach_data );
            set_theme_mod( 'custom_logo', $attach_id );
         }
    }
}
