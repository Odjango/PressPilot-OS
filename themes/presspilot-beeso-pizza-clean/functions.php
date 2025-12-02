<?php
/**
 * Clean functions.php for content provisioning.
 * Focuses on essential logic: page creation and site settings.
 */

// Universal function to create required pages on theme activation.
// Universal function to create required pages
function presspilot_create_required_pages()
{
    $pages_created = false;
    // Universal set of pages to create
    $pages_to_create = array(
        'Home' => 'home',
        'Menu' => 'menu',
        'About' => 'about',
        'Services' => 'services',
        'Blog' => 'blog',
        'Contact' => 'contact'
    );

    foreach ($pages_to_create as $page_title => $page_slug) {
        // Check if the page already exists (by slug)
        if (!get_page_by_path($page_slug)) {
            $page_data = array(
                'post_type' => 'page',
                'post_title' => $page_title,
                'post_name' => $page_slug,
                'post_content' => '<!-- wp:paragraph --><p>This is the ' . $page_title . ' page. Edit this content via Dashboard > Pages.</p><!-- /wp:paragraph -->',
                'post_status' => 'publish',
                'post_author' => 1
            );
            wp_insert_post($page_data);
            $pages_created = true;
        }
    }

    // Set 'Home' as the static front page and 'Blog' as the posts page.
    $home_page = get_page_by_path('home');
    $blog_page = get_page_by_path('blog');

    if ($home_page) {
        update_option('page_on_front', $home_page->ID);
        update_option('show_on_front', 'page');
    }
    if ($blog_page) {
        update_option('page_for_posts', $blog_page->ID);
    }

    return $pages_created;
}

// Hook into theme activation
add_action('after_switch_theme', 'presspilot_create_required_pages');

// Robust fallback: Check on admin_init if content is missing
// Robust fallback: Check on admin_init if content is missing
// Robust fallback: Check on admin_init if content is missing
// Robust fallback: Check on admin_init if content is missing
// Robust fallback: Check on admin_init if content is missing
// Robust fallback: Check on admin_init if content is missing
function presspilot_ensure_content_on_admin()
{
    // Check if setup has already run for this version
    if (get_option('presspilot_setup_v1_8_0')) {
        return;
    }

    // 1. Ensure Pages Exist
    $pages_created = false;
    $pages_to_create = array(
        'Home' => 'home',
        'Menu' => 'menu',
        'About' => 'about',
        'Services' => 'services',
        'Blog' => 'blog',
        'Contact' => 'contact'
    );

    $created_page_ids = array();

    foreach ($pages_to_create as $page_title => $page_slug) {
        $existing_page = get_page_by_path($page_slug);

        if ($existing_page) {
            $created_page_ids[$page_slug] = $existing_page->ID;
        } else {
            // Define Hero Content
            $hero_cta = '';
            if ($page_title === 'Home') {
                $hero_cta = '<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
<div class="wp-block-buttons">
    <!-- wp:button {"className":"is-style-fill"} -->
    <div class="wp-block-button is-style-fill"><a class="wp-block-button__link wp-element-button">Order Now</a></div>
    <!-- /wp:button -->
</div>
<!-- /wp:buttons -->';
            }

            // Simplified Cover Block to avoid validation errors, matching user's index.html fix
            $hero_section = '<!-- wp:cover {"url":"https://s.w.org/images/core/5.3/MtBlanc1.jpg","align":"full"} -->
<div class="wp-block-cover alignfull"><img class="wp-block-cover__image-background" alt="" src="https://s.w.org/images/core/5.3/MtBlanc1.jpg" data-object-fit="cover"/><span aria-hidden="true" class="wp-block-cover__background has-background-dim-100 has-background-dim"></span><div class="wp-block-cover__inner-container"><!-- wp:heading {"textAlign":"center","level":1,"textColor":"white"} -->
<h1 class="wp-block-heading has-white-color has-text-color has-text-align-center">' . $page_title . '</h1>
<!-- /wp:heading -->

<!-- wp:paragraph {"align":"center","textColor":"white","fontSize":"large"} -->
<p class="has-text-align-center has-white-color has-text-color has-large-font-size">Welcome to our ' . strtolower($page_title) . ' page.</p>
<!-- /wp:paragraph -->

' . $hero_cta . '
</div></div>
<!-- /wp:cover -->';

            $content = $hero_section . '

<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group">
    <!-- wp:heading -->
    <h2>Section 1: Introduction</h2>
    <!-- /wp:heading -->
    <!-- wp:paragraph -->
    <p>This is the first test section for the ' . $page_title . ' page. It demonstrates a standard content block.</p>
    <!-- /wp:paragraph -->
</div>
<!-- /wp:group -->

<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group">
    <!-- wp:heading -->
    <h2>Section 2: Details</h2>
    <!-- /wp:heading -->
    <!-- wp:paragraph -->
    <p>This is the second test section. It adds more depth to the ' . $page_title . ' page content.</p>
    <!-- /wp:paragraph -->
</div>
<!-- /wp:group -->';

            $page_data = array(
                'post_type' => 'page',
                'post_title' => $page_title,
                'post_name' => $page_slug,
                'post_content' => $content,
                'post_status' => 'publish',
                'post_author' => 1
            );
            $new_page_id = wp_insert_post($page_data);
            if (!is_wp_error($new_page_id)) {
                $created_page_ids[$page_slug] = $new_page_id;
            }
        }
    }

    // Set 'Home' as the static front page and 'Blog' as the posts page.
    if (isset($created_page_ids['home'])) {
        update_option('page_on_front', $created_page_ids['home']);
        update_option('show_on_front', 'page');
    }
    if (isset($created_page_ids['blog'])) {
        update_option('page_for_posts', $created_page_ids['blog']);
    }

    // 2. Ensure Classic Menu Exists and is Populated
    $menu_name = 'Primary Menu';
    $menu_exists = wp_get_nav_menu_object($menu_name);

    if (!$menu_exists) {
        $menu_id = wp_create_nav_menu($menu_name);
    } else {
        $menu_id = $menu_exists->term_id;
    }

    // Always ensure pages are in the menu during this one-time setup
    $pages_to_add = array('home', 'menu', 'about', 'services', 'blog', 'contact');
    foreach ($pages_to_add as $slug) {
        if (isset($created_page_ids[$slug])) {
            $page_id = $created_page_ids[$slug];
            $page_title = get_the_title($page_id);

            // Check if item already exists in menu to avoid duplicates
            $existing_items = wp_get_nav_menu_items($menu_id);
            $is_in_menu = false;
            if ($existing_items) {
                foreach ($existing_items as $item) {
                    if ($item->object_id == $page_id) {
                        $is_in_menu = true;
                        break;
                    }
                }
            }

            if (!$is_in_menu) {
                wp_update_nav_menu_item($menu_id, 0, array(
                    'menu-item-title' => $page_title,
                    'menu-item-object' => 'page',
                    'menu-item-object-id' => $page_id,
                    'menu-item-type' => 'post_type',
                    'menu-item-status' => 'publish'
                ));
            }
        }
    }

    // Assign to theme location
    $locations = get_theme_mod('nav_menu_locations');
    $locations['primary'] = $menu_id;
    set_theme_mod('nav_menu_locations', $locations);

    // Mark setup as complete
    update_option('presspilot_setup_v1_8_0', true);
}
add_action('admin_init', 'presspilot_ensure_content_on_admin');

// Register the menu location to make the "Menus" screen appear
function presspilot_register_menus()
{
    register_nav_menus(array(
        'primary' => __('Primary Menu', 'presspilot'),
    ));
}
add_action('after_setup_theme', 'presspilot_register_menus');
