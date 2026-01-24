<?php
/**
 * Twenty Twenty-Four functions and definitions
 *
 * @link https://developer.wordpress.org/themes/basics/theme-functions/
 *
 * @package Twenty Twenty-Four
 * @since Twenty Twenty-Four 1.0
 */

/**
 * Register block styles.
 */

if ( ! function_exists( 'twentytwentyfour_block_styles' ) ) :
	/**
	 * Register custom block styles
	 *
	 * @since Twenty Twenty-Four 1.0
	 * @return void
	 */
	function twentytwentyfour_block_styles() {

		register_block_style(
			'core/details',
			array(
				'name'         => 'arrow-icon-details',
				'label'        => __( 'Arrow icon', 'twentytwentyfour' ),
				/*
				 * Styles for the custom Arrow icon style of the Details block
				 */
				'inline_style' => '
				.is-style-arrow-icon-details {
					padding-top: var(--wp--preset--spacing--10);
					padding-bottom: var(--wp--preset--spacing--10);
				}

				.is-style-arrow-icon-details summary {
					list-style-type: "\2193\00a0\00a0\00a0";
				}

				.is-style-arrow-icon-details[open]>summary {
					list-style-type: "\2192\00a0\00a0\00a0";
				}',
			)
		);
		register_block_style(
			'core/post-terms',
			array(
				'name'         => 'pill',
				'label'        => __( 'Pill', 'twentytwentyfour' ),
				/*
				 * Styles variation for post terms
				 * https://github.com/WordPress/gutenberg/issues/24956
				 */
				'inline_style' => '
				.is-style-pill a,
				.is-style-pill span:not([class], [data-rich-text-placeholder]) {
					display: inline-block;
					background-color: var(--wp--preset--color--base-2);
					padding: 0.375rem 0.875rem;
					border-radius: var(--wp--preset--spacing--20);
				}

				.is-style-pill a:hover {
					background-color: var(--wp--preset--color--contrast-3);
				}',
			)
		);
		register_block_style(
			'core/list',
			array(
				'name'         => 'checkmark-list',
				'label'        => __( 'Checkmark', 'twentytwentyfour' ),
				/*
				 * Styles for the custom checkmark list block style
				 * https://github.com/WordPress/gutenberg/issues/51480
				 */
				'inline_style' => '
				ul.is-style-checkmark-list {
					list-style-type: "\2713";
				}

				ul.is-style-checkmark-list li {
					padding-inline-start: 1ch;
				}',
			)
		);
		register_block_style(
			'core/navigation-link',
			array(
				'name'         => 'arrow-link',
				'label'        => __( 'With arrow', 'twentytwentyfour' ),
				/*
				 * Styles for the custom arrow nav link block style
				 */
				'inline_style' => '
				.is-style-arrow-link .wp-block-navigation-item__label:after {
					content: "\2197";
					padding-inline-start: 0.25rem;
					vertical-align: middle;
					text-decoration: none;
					display: inline-block;
				}',
			)
		);
		register_block_style(
			'core/heading',
			array(
				'name'         => 'asterisk',
				'label'        => __( 'With asterisk', 'twentytwentyfour' ),
				'inline_style' => "
				.is-style-asterisk:before {
					content: '';
					width: 1.5rem;
					height: 3rem;
					background: var(--wp--preset--color--contrast-2, currentColor);
					clip-path: path('M11.93.684v8.039l5.633-5.633 1.216 1.23-5.66 5.66h8.04v1.737H13.2l5.701 5.701-1.23 1.23-5.742-5.742V21h-1.737v-8.094l-5.77 5.77-1.23-1.217 5.743-5.742H.842V9.98h8.162l-5.701-5.7 1.23-1.231 5.66 5.66V.684h1.737Z');
					display: block;
				}

				/* Hide the asterisk if the heading has no content, to avoid using empty headings to display the asterisk only, which is an A11Y issue */
				.is-style-asterisk:empty:before {
					content: none;
				}

				.is-style-asterisk:-moz-only-whitespace:before {
					content: none;
				}

				.is-style-asterisk.has-text-align-center:before {
					margin: 0 auto;
				}

				.is-style-asterisk.has-text-align-right:before {
					margin-left: auto;
				}

				.rtl .is-style-asterisk.has-text-align-left:before {
					margin-right: auto;
				}",
			)
		);
	}
endif;

add_action( 'init', 'twentytwentyfour_block_styles' );

/**
 * Enqueue block stylesheets.
 */

if ( ! function_exists( 'twentytwentyfour_block_stylesheets' ) ) :
	/**
	 * Enqueue custom block stylesheets
	 *
	 * @since Twenty Twenty-Four 1.0
	 * @return void
	 */
	function twentytwentyfour_block_stylesheets() {
		/**
		 * The wp_enqueue_block_style() function allows us to enqueue a stylesheet
		 * for a specific block. These will only get loaded when the block is rendered
		 * (both in the editor and on the front end), improving performance
		 * and reducing the amount of data requested by visitors.
		 *
		 * See https://make.wordpress.org/core/2021/12/15/using-multiple-stylesheets-per-block/ for more info.
		 */
		wp_enqueue_block_style(
			'core/button',
			array(
				'handle' => 'twentytwentyfour-button-style-outline',
				'src'    => get_parent_theme_file_uri( 'assets/css/button-outline.css' ),
				'ver'    => wp_get_theme( get_template() )->get( 'Version' ),
				'path'   => get_parent_theme_file_path( 'assets/css/button-outline.css' ),
			)
		);
	}
endif;

add_action( 'init', 'twentytwentyfour_block_stylesheets' );

/**
 * Register pattern categories.
 */

if ( ! function_exists( 'twentytwentyfour_pattern_categories' ) ) :
	/**
	 * Register pattern categories
	 *
	 * @since Twenty Twenty-Four 1.0
	 * @return void
	 */
	function twentytwentyfour_pattern_categories() {

		register_block_pattern_category(
			'page',
			array(
				'label'       => _x( 'Pages', 'Block pattern category' ),
				'description' => __( 'A collection of full page layouts.' ),
			)
		);
	}
endif;

add_action( 'init', 'twentytwentyfour_pattern_categories' );

// PressPilot Auto-Loader (Direct Injection - 1.1.0 NUCLEAR)
/**
 * Auto-Content Loader
 * 
 * Automatically creates pages, assigns menus, and sets site identity upon theme activation.
 */

function presspilot_setup_1769004634109() {
    // 0. FLUSH CACHE (Critical for persistence)
    wp_cache_flush();

    // 1. Set Site Identity
    update_option('blogname', 'Test TT4' . ' [UPDATED]' );
    update_option('blogdescription', '' );

    // 2. Create Pages
    $pages = [
    ];

    $created_page_ids = [];

    // Ensure Home Page Exists (if not in custom pages)
    $home_page = get_page_by_path('home');
    if (!$home_page) {
        $home_id = wp_insert_post([
            'post_title'    => 'Home',
            'post_name'     => 'home',
            'post_content'  => '',
            'post_status'   => 'publish',
            'post_type'     => 'page',
        ]);
        update_option('show_on_front', 'page');
        update_option('page_on_front', $home_id);
        $created_page_ids['Home'] = $home_id;
    } else {
        $created_page_ids['Home'] = $home_page->ID;
        update_option('show_on_front', 'page');
        update_option('page_on_front', $home_page->ID);
    }

    foreach ($pages as $page) {
        $existing = get_page_by_path($page['slug']);
        if (!$existing) {
            $id = wp_insert_post([
                'post_title'    => $page['title'],
                'post_name'     => $page['slug'],
                'post_content'  => $page['content'],
                'post_status'   => 'publish',
                'post_type'     => 'page',
            ]);
            $created_page_ids[$page['title']] = $id;
        } else {
            $created_page_ids[$page['title']] = $existing->ID;
        }
    }

    // 3. CLEAN SLATE: Delete ALL customized Template Parts (Nuclear Option)
    // We remove the tax_query to ensure we catch ANY 'ghost' parts, regardless of theme slug.
    $parts = get_posts([
        'post_type' => 'wp_template_part',
        'post_status' => ['publish', 'draft', 'auto-draft', 'trash'], // Include trash too
        'numberposts' => -1,
    ]);

    foreach ($parts as $part) {
        // Only delete header and footer customizations to be safe, or just zap all for a clean generation.
        // Let's zap all to ensure the fresh site is 100% fresh.
        wp_delete_post($part->ID, true);
    }

    // 4. Create & Assign Menu
    $menu_name = 'Primary Menu';
    
    // FORCE RESET: Delete existing menu if it exists to ensure order is corrected
    $menu_exists = wp_get_nav_menu_object($menu_name);
    if ($menu_exists) {
        wp_delete_nav_menu($menu_name);
    }

    $menu_id = wp_create_nav_menu($menu_name);

    // Add Home Link
    if (isset($created_page_ids['Home'])) {
        wp_update_nav_menu_item($menu_id, 0, [
            'menu-item-title'  => 'Home',
            'menu-item-object-id' => $created_page_ids['Home'],
            'menu-item-object' => 'page',
            'menu-item-status' => 'publish',
            'menu-item-type'   => 'post_type',
        ]);
    }

    // Add Custom Pages
    foreach ($pages as $page) {
        if (isset($created_page_ids[$page['title']])) {
            wp_update_nav_menu_item($menu_id, 0, [
                'menu-item-title'  => $page['title'],
                'menu-item-object-id' => $created_page_ids[$page['title']],
                'menu-item-object' => 'page',
                'menu-item-status' => 'publish',
                'menu-item-type'   => 'post_type',
            ]);
        }
    }

    // Assign to Theme Location 'primary' (Common standard)
    $locations = get_theme_mod('nav_menu_locations');
    $locations['primary'] = $menu_id;
    set_theme_mod('nav_menu_locations', $locations);
}
add_action('init', 'presspilot_setup_1769004634109');
