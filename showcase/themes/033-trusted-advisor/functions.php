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
	 * Registers custom block styles.
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
	 * Enqueues custom block stylesheets.
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
	 * Registers pattern categories.
	 *
	 * @since Twenty Twenty-Four 1.0
	 * @return void
	 */
	function twentytwentyfour_pattern_categories() {

		register_block_pattern_category(
			'twentytwentyfour_page',
			array(
				'label'       => _x( 'Pages', 'Block pattern category', 'twentytwentyfour' ),
				'description' => __( 'A collection of full page layouts.', 'twentytwentyfour' ),
			)
		);
	}
endif;

add_action( 'init', 'twentytwentyfour_pattern_categories' );

// PressPilot Safe Loader (Activation Only)
/**
 * Safe Auto-Content Loader
 * 
 * Automatically creates pages, assigns menus, and sets site identity 
 * ONLY upon theme activation. Non-destructive.
 */

    if (!function_exists('pp_setup_1770944525880')) {
        function pp_setup_1770944525880() {
            // 1. Set Site Identity
            update_option('blogname', 'Trusted Advisor' );
            update_option('blogdescription', 'Designed for the local-service space, Trusted Advisor blends modern aesthetics with practical conversion-focused content.' );

            // 1.2 Handle Logo (If exists in assets)
            $logo_rel_path = '/assets/images/logo.png';
            $logo_abs_path = get_template_directory() . $logo_rel_path;
            
            if ( file_exists( $logo_abs_path ) && ! get_option( 'site_logo' ) ) {
                require_once( ABSPATH . 'wp-admin/includes/image.php' );
                require_once( ABSPATH . 'wp-admin/includes/file.php' );
                require_once( ABSPATH . 'wp-admin/includes/media.php' );

                $url = get_template_directory_uri() . $logo_rel_path;
                $desc = 'Trusted Advisor Logo';
                
                // Sideload the image
                $id = media_sideload_image( $url, 0, $desc, 'id' );
                
                if ( ! is_wp_error( $id ) ) {
                    update_option( 'site_logo', $id );
                }
            }

            // 1.5 CLEANUP: Default Content Removal (safe — only deletes posts/pages, never template parts)
            foreach ([1, 2, 3] as $default_id) {
                $p = get_post($default_id);
                if ($p && in_array($p->post_type, ['post', 'page'], true)) {
                    wp_delete_post($default_id, true);
                }
            }

            $junk_posts = get_posts([
                'post_type' => ['post', 'page'],
                'post_status' => ['publish', 'draft', 'private', 'trash'],
                'numberposts' => -1,
                's' => 'Hello',
            ]);
            foreach ($junk_posts as $junk) {
                wp_delete_post($junk->ID, true);
            }

            $privacy = get_page_by_path('privacy-policy');
            if ($privacy) wp_delete_post($privacy->ID, true);

            // 2. Create Pages
            $pages = [
            [
                'title' => 'Home',
                'slug'  => 'home',
                'content' => '',
            ],
            [
                'title' => 'Services',
                'slug'  => 'services',
                'content' => '',
            ],
            [
                'title' => 'About',
                'slug'  => 'about',
                'content' => '<!-- wp:group {"align":"wide","layout":{"type":"constrained"}} --><div class="wp-block-group alignwide"><!-- wp:columns {"align":"wide"} --><div class="wp-block-columns alignwide"><!-- wp:column --><div class="wp-block-column"><!-- wp:image {"sizeSlug":"large","linkDestination":"none"} --><figure class="wp-block-image size-large"><img src="https://placehold.co/600x400" alt="About Us"/></figure><!-- /wp:image --></div><!-- /wp:column --><!-- wp:column {"verticalAlignment":"center"} --><div class="wp-block-column is-vertically-aligned-center"><!-- wp:heading --><h2>Our Story</h2><!-- /wp:heading --><!-- wp:paragraph --><p>We started with a simple idea: make software that just works. Today, we help thousands of businesses streamline their operations.</p><!-- /wp:paragraph --><!-- wp:buttons --><div class="wp-block-buttons"><!-- wp:button --><div class="wp-block-button"><a class="wp-block-button__link wp-element-button">Learn More</a></div><!-- /wp:button --></div><!-- /wp:buttons --></div><!-- /wp:column --></div><!-- /wp:columns --></div><!-- /wp:group -->',
            ],
            [
                'title' => 'FAQ',
                'slug'  => 'faq',
                'content' => '',
            ],
            [
                'title' => 'Contact',
                'slug'  => 'contact',
                'content' => '<!-- wp:group {"align":"wide","layout":{"type":"constrained"}} --><div class="wp-block-group alignwide"><!-- wp:columns {"align":"wide"} --><div class="wp-block-columns alignwide"><!-- wp:column --><div class="wp-block-column"><!-- wp:heading --><h2>Get Requirements</h2><!-- /wp:heading --><!-- wp:paragraph --><p>Email: contact@presspilot.com</p><!-- /wp:paragraph --><!-- wp:paragraph --><p>Phone: +1 555-0199</p><!-- /wp:paragraph --><!-- wp:separator --><hr class="wp-block-separator has-alpha-channel-opacity"/><!-- /wp:separator --><!-- wp:heading {"level":3} --><h3>Office</h3><!-- /wp:heading --><!-- wp:paragraph --><p>123 Innovation Dr.<br>Tech City, TC 90210</p><!-- /wp:paragraph --></div><!-- /wp:column --><!-- wp:column --><div class="wp-block-column"><!-- wp:image {"sizeSlug":"large","linkDestination":"none"} --><figure class="wp-block-image size-large"><img src="https://placehold.co/600x300" alt="Map"/></figure><!-- /wp:image --></div><!-- /wp:column --></div><!-- /wp:columns --></div><!-- /wp:group -->',
            ]
            ];

            $created_page_ids = [];

            $home_page = get_page_by_path('home');
            if (!$home_page) {
                $home_id = wp_insert_post([
                    'post_title'    => 'Home',
                    'post_name'     => 'home',
                    'post_content'  => '',
                    'post_status'   => 'publish',
                    'post_type'     => 'page',
                ]);
                $created_page_ids['Home'] = $home_id;
            } else {
                $created_page_ids['Home'] = $home_page->ID;
            }
            
            if (isset($created_page_ids['Home']) && is_numeric($created_page_ids['Home'])) {
                update_option('show_on_front', 'page');
                update_option('page_on_front', $created_page_ids['Home']);
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

            // 3. Create & Assign Menu
            $menu_name = 'Primary Menu';
            $menu_exists = wp_get_nav_menu_object($menu_name);

            if (!$menu_exists) {
                $menu_id = wp_create_nav_menu($menu_name);

                if (!empty($menu_id) && !is_wp_error($menu_id)) {
                    if (isset($created_page_ids['Home'])) {
                        wp_update_nav_menu_item($menu_id, 0, [
                            'menu-item-title'  => 'Home',
                            'menu-item-object-id' => $created_page_ids['Home'],
                            'menu-item-object' => 'page',
                            'menu-item-status' => 'publish',
                            'menu-item-type'   => 'post_type',
                        ]);
                    }

                    if (!empty($pages)) {
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
                    }

                    $locations = get_theme_mod('nav_menu_locations'); 
                    if (!is_array($locations)) {
                        $locations = [];
                    }
                    $locations['primary'] = $menu_id;
                    set_theme_mod('nav_menu_locations', $locations);
                }
            }
        }
        $setup_func = 'pp_setup_1770944525880';
        add_action('after_switch_theme', $setup_func);
    }
