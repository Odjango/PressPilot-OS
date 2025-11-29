<?php
/**
 * PressPilot FSE v2 Theme helpers.
 *
 * This file handles content provisioning and theme configuration.
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * ==========================================
 * THEME GENERATOR CONFIGURATION
 * The generator will update these values based on user input.
 * ==========================================
 */
define('PP_THEME_TYPE', 'universal'); // Options: 'restaurant', 'ecommerce', 'universal'
define('PP_ENABLE_WOOCOMMERCE', false); // Set to true for E-commerce
define('PP_SITE_TITLE', 'PressPilot Site'); // Generator will replace this

/**
 * Theme Configuration (Runs on every request)
 */
function presspilot_fse_v2_config()
{
    // Enable Classic Menus support so "Appearance > Menus" is visible in Dashboard
    add_theme_support('menus');

    // Add other standard supports
    add_theme_support('post-thumbnails');
    add_theme_support('automatic-feed-links');
    add_theme_support('title-tag');

    // Conditional WooCommerce Support
    if (PP_ENABLE_WOOCOMMERCE) {
        add_theme_support('woocommerce');
    }
}
add_action('after_setup_theme', 'presspilot_fse_v2_config');

/**
 * Content Setup Logic (Runs only on switch or version update)
 * WARNING: This function DELETES existing content.
 */
function presspilot_fse_v2_content_setup()
{
    // 1. NUKE: Delete all existing pages
    $all_pages = get_posts(array(
        'post_type' => 'page',
        'numberposts' => -1,
        'post_status' => 'any'
    ));

    foreach ($all_pages as $page) {
        wp_delete_post($page->ID, true);
    }

    // 2. NUKE: Delete all existing menus and navigation posts
    $all_menus = get_terms('nav_menu', array('hide_empty' => false));
    if (!is_wp_error($all_menus) && !empty($all_menus)) {
        foreach ($all_menus as $menu) {
            wp_delete_nav_menu($menu->term_id);
        }
    }

    // Also delete FSE navigation posts
    $all_nav_posts = get_posts(array(
        'post_type' => 'wp_navigation',
        'numberposts' => -1,
        'post_status' => 'any'
    ));
    foreach ($all_nav_posts as $nav_post) {
        wp_delete_post($nav_post->ID, true);
    }

    // 3. UPDATE: Site Title
    update_option('blogname', PP_SITE_TITLE);

    // 4. PAVE: Create required pages

    // Find a valid author (admin)
    $admin_user = get_users(array('role' => 'administrator', 'number' => 1));
    $author_id = !empty($admin_user) ? $admin_user[0]->ID : get_current_user_id();
    if (!$author_id) {
        $author_id = 1; // Fallback
    }

    // Base Pages
    $pages_to_create = array(
        'Home' => 'home',
        'About' => 'about',
        'Services' => 'services',
        'Blog' => 'blog',
        'Contact' => 'contact'
    );

    // Conditional Pages based on Theme Type
    if (PP_THEME_TYPE === 'restaurant') {
        $pages_to_create['Menu'] = 'menu';
    }

    // Conditional Pages for WooCommerce
    if (PP_ENABLE_WOOCOMMERCE) {
        $pages_to_create['Shop'] = 'shop';
        $pages_to_create['Cart'] = 'cart';
        $pages_to_create['Checkout'] = 'checkout';
        $pages_to_create['My Account'] = 'my-account';
    }

    $created_pages = array();

    foreach ($pages_to_create as $page_title => $page_slug) {
        $page_content_template = '';

        // Custom content for WooCommerce pages
        if (PP_ENABLE_WOOCOMMERCE && in_array($page_slug, ['shop', 'cart', 'checkout', 'my-account'])) {
            if ($page_slug === 'shop') {
                $page_content_template = '<!-- wp:woocommerce/product-collection /-->';
            } elseif ($page_slug === 'cart') {
                $page_content_template = '<!-- wp:shortcode -->[woocommerce_cart]<!-- /wp:shortcode -->';
            } elseif ($page_slug === 'checkout') {
                $page_content_template = '<!-- wp:shortcode -->[woocommerce_checkout]<!-- /wp:shortcode -->';
            } elseif ($page_slug === 'my-account') {
                $page_content_template = '<!-- wp:shortcode -->[woocommerce_my_account]<!-- /wp:shortcode -->';
            }
        } else {
            // Use Patterns for Standard Pages
            if ($page_slug === 'home') {
                $page_content_template = '<!-- wp:pattern {"slug":"presspilot/hero-basic"} /-->
                <!-- wp:pattern {"slug":"presspilot/features-grid"} /-->
                <!-- wp:pattern {"slug":"presspilot/pricing-columns"} /-->
                <!-- wp:pattern {"slug":"presspilot/cta-contact"} /-->';
            } elseif ($page_slug === 'about') {
                $page_content_template = '<!-- wp:pattern {"slug":"presspilot/hero-basic"} /-->
                <!-- wp:pattern {"slug":"presspilot/stats-row"} /-->
                <!-- wp:pattern {"slug":"presspilot/cta-large"} /-->';
            } elseif ($page_slug === 'services') {
                $page_content_template = '<!-- wp:pattern {"slug":"presspilot/hero-basic"} /-->
                <!-- wp:pattern {"slug":"presspilot/services-cards"} /-->
                <!-- wp:pattern {"slug":"presspilot/cta-contact"} /-->';
            } elseif ($page_slug === 'contact') {
                $page_content_template = '<!-- wp:pattern {"slug":"presspilot/cta-contact"} /-->
                <!-- wp:pattern {"slug":"presspilot/faq-basic"} /-->';
            } elseif ($page_slug === 'menu') {
                $page_content_template = '<!-- wp:heading {"textAlign":"center"} -->
                <h2 class="wp-block-heading has-text-align-center">Our Menu</h2>
                <!-- /wp:heading -->
                <!-- wp:paragraph {"align":"center"} -->
                <p class="has-text-align-center">Delicious items coming soon.</p>
                <!-- /wp:paragraph -->';
            } else {
                // Default fallback
                $page_content_template = '<!-- wp:pattern {"slug":"presspilot/hero-basic"} /-->';
            }
        }

        $page_data = array(
            'post_type' => 'page',
            'post_title' => $page_title,
            'post_name' => $page_slug,
            'post_content' => $page_content_template,
            'post_status' => 'publish',
            'post_author' => $author_id
        );
        $page_id = wp_insert_post($page_data);
        if ($page_id && !is_wp_error($page_id)) {
            $created_pages[$page_slug] = $page_id;
        }
    }

    // Set 'Home' as the static front page and 'Blog' as the posts page.
    if (isset($created_pages['home'])) {
        update_option('page_on_front', $created_pages['home']);
        update_option('show_on_front', 'page');
    }
    if (isset($created_pages['blog'])) {
        update_option('page_for_posts', $created_pages['blog']);
    }

    // 5. CREATE: Navigation Menu (FSE)
    if (!empty($created_pages)) {
        // A. FSE Navigation Post
        $nav_content = '';
        foreach ($created_pages as $slug => $id) {
            $title = ucfirst($slug);
            $url = get_permalink($id);
            $nav_content .=
                '<!-- wp:navigation-link {"label":"' . $title . '","type":"page","id":' . $id . ',"url":"' . $url . '","kind":"post-type"} /-->';
        }

        $nav_post_data = array(
            'post_title' => 'Primary Navigation',
            'post_content' => '<!-- wp:navigation -->' . $nav_content . '<!-- /wp:navigation -->',
            'post_status' => 'publish',
            'post_type' => 'wp_navigation',
            'post_name' => 'primary-navigation',
            'post_author' => $author_id
        );
        wp_insert_post($nav_post_data);

        // B. Classic Menu
        $menu_name = 'Primary Menu';
        $menu_id = wp_create_nav_menu($menu_name);

        if (!is_wp_error($menu_id)) {
            foreach ($created_pages as $slug => $id) {
                $title = ucfirst($slug);
                wp_update_nav_menu_item($menu_id, 0, array(
                    'menu-item-title' => $title,
                    'menu-item-object-id' => $id,
                    'menu-item-object' => 'page',
                    'menu-item-status' => 'publish',
                    'menu-item-type' => 'post_type',
                ));
            }
        }
    }

    // Update the stored version
    update_option('presspilot_fse_v2_version', '2.3.0');
}

/**
 * Check version on admin init
 */
function presspilot_fse_v2_version_check()
{
    $current_version = '2.3.0';
    $installed_version = get_option('presspilot_fse_v2_version');

    if ($installed_version !== $current_version) {
        presspilot_fse_v2_content_setup();
    }
}
add_action('admin_init', 'presspilot_fse_v2_version_check');
add_action('after_switch_theme', 'presspilot_fse_v2_content_setup');