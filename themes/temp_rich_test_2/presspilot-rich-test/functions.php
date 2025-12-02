<?php
/**
 * Theme functions and definitions
 */

if ( ! function_exists( 'presspilot_rich_test_support' ) ) :
	function presspilot_rich_test_support() {
		add_theme_support( 'wp-block-styles' );
		add_theme_support( 'editor-styles' );
		add_theme_support( 'block-templates' );
		add_theme_support( 'menus' );
		add_theme_support( 'post-thumbnails' );
		add_theme_support( 'automatic-feed-links' );
		add_theme_support( 'title-tag' );
	}
endif;
add_action( 'after_setup_theme', 'presspilot_rich_test_support' );

/**
 * Register block patterns
 */
function presspilot_rich_test_register_patterns() {
	register_block_pattern_category(
		'featured',
		array( 'label' => __( 'Featured', 'presspilot-rich-test' ) )
	);
}
add_action( 'init', 'presspilot_rich_test_register_patterns' );

/**
 * Content Setup - Nuke & Pave
 *
 * - Deletes existing pages + nav
 * - Creates Home/Menu/About/Services/Blog/Contact
 * - Each page gets 3 sections of blocks
 * - Creates a wp_navigation post with links to all pages
 * - Sets front page + posts page
 */
function presspilot_rich_test_content_setup() {
	// 1. Nuke existing pages.
	$all_pages = get_posts(
		array(
			'post_type'   => 'page',
			'numberposts' => -1,
			'post_status' => 'any',
		)
	);

	foreach ( $all_pages as $p ) {
		wp_delete_post( $p->ID, true );
	}

	// 1b. Nuke classic nav menus.
	$nav_menus = get_terms(
		array(
			'taxonomy'   => 'nav_menu',
			'hide_empty' => false,
		)
	);

	if ( ! is_wp_error( $nav_menus ) ) {
		foreach ( $nav_menus as $menu ) {
			wp_delete_nav_menu( $menu->term_id );
		}
	}

	// 1c. Nuke wp_navigation posts.
	$nav_posts = get_posts(
		array(
			'post_type'   => 'wp_navigation',
			'numberposts' => -1,
			'post_status' => 'any',
		)
	);

	foreach ( $nav_posts as $p ) {
		wp_delete_post( $p->ID, true );
	}

	// 2. Update Site Title.
	update_option( 'blogname', 'MooZoo Pizza' );
	update_option( 'blogdescription', 'The Best Pizza in Town' );

	// 3. Create Pages with Rich Content (3 sections).
	$user_id = get_current_user_id();
	if ( ! $user_id ) {
		$users   = get_users(
			array(
				'role' => 'administrator',
			)
		);
		$user_id = ! empty( $users ) ? $users[0]->ID : 1;
	}

	$pages_data = array(
		'Home'     => 'Welcome to MooZoo Pizza.',
		'Menu'     => 'Explore our mouth-watering menu.',
		'About'    => 'Our story began in a small barn...',
		'Services' => 'We deliver happiness to your door.',
		'Blog'     => 'Pizza news and cheesy updates.',
		'Contact'  => 'Visit us at the farm.',
	);

	$page_ids = array();

	foreach ( $pages_data as $title => $desc ) {

		// Section 1: Hero.
		$hero_html = '<!-- wp:group {"align":"wide","style":{"spacing":{"padding":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50"},"blockGap":"var:preset|spacing|30"}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignwide" style="padding-top:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--50)">
	<!-- wp:heading {"level":1,"style":{"typography":{"fontSize":"var:preset|font-size|xx-large"}}} -->
	<h1 style="font-size:var(--wp--preset--font-size--xx-large)">' . $title . '</h1>
	<!-- /wp:heading -->
	<!-- wp:paragraph {"style":{"typography":{"fontSize":"var:preset|font-size|medium"}}} -->
	<p style="font-size:var(--wp--preset--font-size--medium)">' . $desc . '</p>
	<!-- /wp:paragraph -->
</div>
<!-- /wp:group -->';

		// Section 2: Main content.
		$content_html = '<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group">
	<!-- wp:heading -->
	<h2>Details</h2>
	<!-- /wp:heading -->
	<!-- wp:paragraph -->
	<p>Here at MooZoo, we take pride in our ingredients. Every slice is a masterpiece of flavor and texture. This section contains the main details for the ' . $title . ' page.</p>
	<!-- /wp:paragraph -->
	<!-- wp:paragraph -->
	<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
	<!-- /wp:paragraph -->
</div>
<!-- /wp:group -->';

		// Section 3: Services/features (reuse home-services pattern).
		$features_html = '<!-- wp:pattern {"slug":"presspilot/home-services"} /-->';

		$full_content = $hero_html . $content_html . $features_html;

		$page_id = wp_insert_post(
			array(
				'post_title'   => $title,
				'post_content' => $full_content,
				'post_status'  => 'publish',
				'post_type'    => 'page',
				'post_author'  => $user_id,
			)
		);

		if ( ! is_wp_error( $page_id ) ) {
			$page_ids[ $title ] = $page_id;
		}
	}

	// 4. Set Front Page & Posts Page.
	if ( isset( $page_ids['Home'], $page_ids['Blog'] ) ) {
		update_option( 'show_on_front', 'page' );
		update_option( 'page_on_front', $page_ids['Home'] );
		update_option( 'page_for_posts', $page_ids['Blog'] );
	}

	// 5. Create Navigation (wp_navigation post with links to all pages).
	if ( ! empty( $page_ids ) ) {
		$menu_items_html = '';

		foreach ( $page_ids as $title => $id ) {
			$menu_items_html .= '<!-- wp:navigation-link {"label":"' . esc_html( $title ) . '","type":"page","id":' . (int) $id . ',"url":"' . esc_url( get_permalink( $id ) ) . '","kind":"post-type"} /-->';
		}

		$nav_post_id = wp_insert_post(
			array(
				'post_title'   => 'Primary Navigation',
				'post_content' => $menu_items_html,
				'post_status'  => 'publish',
				'post_type'    => 'wp_navigation',
				'post_name'    => 'primary-navigation',
				'post_author'  => $user_id,
			)
		);

		if ( ! is_wp_error( $nav_post_id ) ) {
			update_option( 'presspilot_rich_test_nav_id', $nav_post_id );
		}
	}
}

// Run content setup once on theme switch.
add_action( 'after_switch_theme', 'presspilot_rich_test_content_setup' );

// Safety: version-based trigger so we can re-run setup after updates.
function presspilot_rich_test_version_check() {
	$ver = '1.0.0';
	$opt = get_option( 'presspilot_rich_test_version' );
	if ( $opt !== $ver ) {
		presspilot_rich_test_content_setup();
		update_option( 'presspilot_rich_test_version', $ver );
	}
}
add_action( 'admin_init', 'presspilot_rich_test_version_check' );
