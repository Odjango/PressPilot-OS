<?php
/**
 * BeeBoo Pizza – core theme functions
 *
 * Keep this file boring and safe:
 * - Theme supports
 * - Pattern category
 * - One-time content seed (pages only, no menu tricks)
 */

/**
 * Theme supports.
 */
if ( ! function_exists( 'presspilot_onion_setup' ) ) :
	function presspilot_onion_setup() {
		add_theme_support( 'wp-block-styles' );
		add_theme_support( 'editor-styles' );
		add_theme_support( 'block-templates' );
		add_theme_support( 'responsive-embeds' );
		add_theme_support( 'title-tag' );
		add_theme_support( 'menus' );
	}
endif;
add_action( 'after_setup_theme', 'presspilot_onion_setup' );

/**
 * Pattern category for any Onion-specific patterns.
 */
function presspilot_onion_register_pattern_category() {
	register_block_pattern_category(
		'presspilot-onion',
		array(
			'label' => __( 'PressPilot / Onion', 'presspilot-onion' ),
		)
	);
}
add_action( 'init', 'presspilot_onion_register_pattern_category' );

/**
 * One-time content seed.
 *
 * Extremely defensive:
 * - Runs only in admin.
 * - Runs only once per version.
 * - Only creates pages if they do NOT already exist.
 * - Does NOT delete anything.
 * - Does NOT try to create or wire navigation posts.
 */
function presspilot_onion_seed_content() {
	// Debug logging
	error_log( 'Onion Seeding: Checking...' );

	if ( ! is_admin() ) {
		return;
	}

	// Bump this when you change seeded content.
	$version     = '1.0.0';
	$stored_ver  = get_option( 'presspilot_onion_seed_version' );

	// Already seeded for this version.
	if ( $stored_ver === $version ) {
		error_log( 'Onion Seeding: Already run for ' . $version );
		return;
	}

	error_log( 'Onion Seeding: Running for ' . $version );

	// Pick an author.
	$user_id = get_current_user_id();
	if ( ! $user_id ) {
		$admins = get_users(
			array(
				'role'   => 'administrator',
				'number' => 1,
			)
		);
		if ( ! empty( $admins ) ) {
			$user_id = $admins[0]->ID;
		} else {
			$user_id = 1;
		}
	}

	// Titles + short descriptions per page.
	$pages = array(
		'Home'    => 'Welcome to Onion Pizza, your cozy neighborhood slice shop.',
		'Menu'    => 'Explore our hand-crafted pizzas, salads, and desserts.',
		'About'   => 'Learn how Onion grew from a tiny oven to a local favorite.',
		'Services'=> 'Catering, delivery, and office lunches made easy.',
		'Blog'    => 'Behind-the-scenes stories from the Onion kitchen.',
		'Contact' => 'Find us, call us, or send a message.',
	);

	$page_ids = array();

	foreach ( $pages as $title => $desc ) {

		// If a page with this title already exists, reuse it.
		$existing = get_page_by_title( $title );
		if ( $existing instanceof WP_Post ) {
			$page_ids[ $title ] = $existing->ID;
			error_log( 'Onion Seeding: Page already exists: ' . $title );
			continue;
		}

		// Section 1: Hero.
		$hero_html = <<<HTML
<!-- wp:group {"align":"wide","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|40"},"blockGap":"var:preset|spacing|30"}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignwide" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--40)">
	<!-- wp:heading {"level":1} -->
	<h1>{$title}</h1>
	<!-- /wp:heading -->

	<!-- wp:paragraph -->
	<p>{$desc}</p>
	<!-- /wp:paragraph -->
</div>
<!-- /wp:group -->
HTML;

		// Section 2: Details.
		$details_html = <<<HTML
<!-- wp:group {"align":"wide","style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40"},"blockGap":"var:preset|spacing|20"}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignwide">
	<!-- wp:heading {"level":2} -->
	<h2>Details</h2>
	<!-- /wp:heading -->

	<!-- wp:paragraph -->
	<p>Here at Onion, we bake slow and serve fast. This section holds the main content for the {$title} page.</p>
	<!-- /wp:paragraph -->

	<!-- wp:paragraph -->
	<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
	<!-- /wp:paragraph -->
</div>
<!-- /wp:group -->
HTML;

		// Section 3: Services / features.
		$features_html = <<<HTML
<!-- wp:group {"align":"wide","style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|60"},"blockGap":"var:preset|spacing|30"},"border":{"top":{"color":"var:preset|color|contrast","width":"1px"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignwide" style="border-top-width:1px;border-top-style:solid">
	<!-- wp:heading {"level":2} -->
	<h2>What we provide</h2>
	<!-- /wp:heading -->

	<!-- wp:columns {"align":"wide"} -->
	<div class="wp-block-columns alignwide">
		<!-- wp:column -->
		<div class="wp-block-column">
			<!-- wp:heading {"level":3} -->
			<h3>Service One</h3>
			<!-- /wp:heading -->
			<!-- wp:paragraph -->
			<p>Short description of the first key service. Fully editable in the Site Editor.</p>
			<!-- /wp:paragraph -->
		</div>
		<!-- /wp:column -->

		<!-- wp:column -->
		<div class="wp-block-column">
			<!-- wp:heading {"level":3} -->
			<h3>Service Two</h3>
			<!-- /wp:heading -->
			<!-- wp:paragraph -->
			<p>Short description of the second key service. Designed for reuse across pages.</p>
			<!-- /wp:paragraph -->
		</div>
		<!-- /wp:column -->

		<!-- wp:column -->
		<div class="wp-block-column">
			<!-- wp:heading {"level":3} -->
			<h3>Service Three</h3>
			<!-- /wp:heading -->
			<!-- wp:paragraph -->
			<p>Short description of the third key service. Safe defaults with a clean layout.</p>
			<!-- /wp:paragraph -->
		</div>
		<!-- /wp:column -->
	</div>
	<!-- /wp:columns -->
</div>
<!-- /wp:group -->
HTML;

		$content = $hero_html . "\n\n" . $details_html . "\n\n" . $features_html;

		$page_id = wp_insert_post(
			array(
				'post_title'   => $title,
				'post_content' => $content,
				'post_status'  => 'publish',
				'post_type'    => 'page',
				'post_author'  => $user_id,
			)
		);

		if ( ! is_wp_error( $page_id ) ) {
			$page_ids[ $title ] = $page_id;
			error_log( 'Onion Seeding: Created page ' . $title );
		} else {
			error_log( 'Onion Seeding: Failed to create page ' . $title . ': ' . $page_id->get_error_message() );
		}
	}

	// Set front page + posts page if we have them.
	if ( isset( $page_ids['Home'], $page_ids['Blog'] ) ) {
		update_option( 'show_on_front', 'page' );
		update_option( 'page_on_front', $page_ids['Home'] );
		update_option( 'page_for_posts', $page_ids['Blog'] );
	}

	// Create Navigation (wp_navigation post with links to all pages).
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
			error_log( 'Onion Seeding: Created Navigation Post' );
		} else {
			error_log( 'Onion Seeding: Failed to create Navigation Post' );
		}
	}

	update_option( 'presspilot_onion_seed_version', $version );
}
add_action( 'admin_init', 'presspilot_onion_seed_content' );
