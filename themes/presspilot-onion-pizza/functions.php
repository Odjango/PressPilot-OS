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
 */
function presspilot_onion_seed_content() {
	// Debug logging
	error_log( 'Onion Seeding: Checking...' );

	if ( ! is_admin() ) {
		return;
	}

	// Bump this when you change seeded content.
	$version     = '1.0.9';
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

    // Section 1: Hero (Canonical).
    $hero_html = <<<HTML
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|40"},"blockGap":"var:preset|spacing|30"}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull"
    style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--40)">
    <!-- wp:heading {"textAlign":"center","level":1} -->
    <h1 class="has-text-align-center">{{HERO_TITLE}}</h1>
    <!-- /wp:heading -->

    <!-- wp:paragraph {"align":"center"} -->
    <p class="has-text-align-center">{{HERO_SUBTITLE}}</p>
    <!-- /wp:paragraph -->
</div>
<!-- /wp:group -->
HTML;
    // Replace placeholders
    $hero_html = str_replace( '{{HERO_TITLE}}', $title, $hero_html );
    $hero_html = str_replace( '{{HERO_SUBTITLE}}', $desc, $hero_html );

		// Section 2: Details.
		$details_html = <<<HTML
<!-- wp:group {"align":"wide","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignwide">
    <!-- wp:heading {"level":2} -->
    <h2>Details</h2>
    <!-- /wp:heading -->

    <!-- wp:paragraph -->
    <p>Here at Onion, we bake slow and serve fast. This section holds the main content for the {$title} page.</p>
    <!-- /wp:paragraph -->

    <!-- wp:paragraph -->
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore
        magna aliqua.</p>
    <!-- /wp:paragraph -->
</div>
<!-- /wp:group -->
HTML;
    $details_html = str_replace( '{$title}', $title, $details_html );

		// Section 3: Services / features.
		$features_html = <<<HTML
<!-- wp:group {"align":"wide","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignwide">
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
    $nav_blueprint = json_decode( '[
    {
        "label": "{{HOME_PAGE_TITLE}}",
        "type": "page",
        "id": "{{HOME_PAGE_ID}}",
        "url": "{{HOME_PAGE_URL}}",
        "kind": "post-type"
    },
    {
        "label": "{{MENU_PAGE_TITLE}}",
        "type": "page",
        "id": "{{MENU_PAGE_ID}}",
        "url": "{{MENU_PAGE_URL}}",
        "kind": "post-type"
    },
    {
        "label": "{{ABOUT_PAGE_TITLE}}",
        "type": "page",
        "id": "{{ABOUT_PAGE_ID}}",
        "url": "{{ABOUT_PAGE_URL}}",
        "kind": "post-type"
    },
    {
        "label": "{{SERVICES_PAGE_TITLE}}",
        "type": "page",
        "id": "{{SERVICES_PAGE_ID}}",
        "url": "{{SERVICES_PAGE_URL}}",
        "kind": "post-type"
    },
    {
        "label": "{{BLOG_PAGE_TITLE}}",
        "type": "page",
        "id": "{{BLOG_PAGE_ID}}",
        "url": "{{BLOG_PAGE_URL}}",
        "kind": "post-type"
    },
    {
        "label": "{{CONTACT_PAGE_TITLE}}",
        "type": "page",
        "id": "{{CONTACT_PAGE_ID}}",
        "url": "{{CONTACT_PAGE_URL}}",
        "kind": "post-type"
    }
]', true );
		$menu_items_html = '';

    if ( $nav_blueprint ) {
      foreach ( $nav_blueprint as $item ) {
        // Replace placeholders
        $label = $item['label'];
        $id_placeholder = $item['id']; // e.g. {{HOME_PAGE_ID}}
        
        // Extract page key from placeholder (e.g. HOME_PAGE_ID -> Home)
        // Simple mapping for now
        $page_key = '';
        if ( strpos( $id_placeholder, 'HOME' ) !== false ) $page_key = 'Home';
        elseif ( strpos( $id_placeholder, 'MENU' ) !== false ) $page_key = 'Menu';
        elseif ( strpos( $id_placeholder, 'ABOUT' ) !== false ) $page_key = 'About';
        elseif ( strpos( $id_placeholder, 'SERVICES' ) !== false ) $page_key = 'Services';
        elseif ( strpos( $id_placeholder, 'BLOG' ) !== false ) $page_key = 'Blog';
        elseif ( strpos( $id_placeholder, 'CONTACT' ) !== false ) $page_key = 'Contact';

        if ( $page_key && isset( $page_ids[ $page_key ] ) ) {
          $page_id = $page_ids[ $page_key ];
          $url = get_permalink( $page_id );
          
          // Construct block markup
          $menu_items_html .= '<!-- wp:navigation-link {"label":"' . $page_key . '","type":"page","id":' . $page_id . ',"url":"' . $url . '","kind":"post-type"} /-->';
        }
      }
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

      // Wire Header to this Navigation
      $header_tpl = <<<HTML
<!-- wp:group {"align":"wide","style":{"spacing":{"padding":{"top":"20px","bottom":"20px"}}},"backgroundColor":"base","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignwide has-base-background-color has-background" style="padding-top:20px;padding-bottom:20px">
	<!-- wp:group {"align":"wide","layout":{"type":"flex","justifyContent":"space-between","flexWrap":"wrap"}} -->
	<div class="wp-block-group alignwide">
		<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|20"},"layout":{"selfStretch":"fit","flexSize":null}},"layout":{"type":"flex"}} -->
		<div class="wp-block-group">
			<!-- wp:site-logo {"width":60} /-->
			<!-- wp:group {"style":{"spacing":{"blockGap":"0px"}}} -->
			<div class="wp-block-group">
				<!-- wp:site-title {"level":0} /-->
			</div>
			<!-- /wp:group -->
		</div>
		<!-- /wp:group -->

		<!-- wp:group {"layout":{"type":"flex","flexWrap":"wrap","justifyContent":"left"}} -->
		<div class="wp-block-group">
			<!-- wp:navigation {"layout":{"type":"flex","justifyContent":"right","orientation":"horizontal"},"style":{"spacing":{"margin":{"top":"0"},"blockGap":"var:preset|spacing|20"},"layout":{"selfStretch":"fit","flexSize":null}}} /-->
		</div>
		<!-- /wp:group -->
	</div>
	<!-- /wp:group -->
</div>
<!-- /wp:group -->

HTML;
      // Inject ref into wp:navigation block
      // Replaces '<!-- wp:navigation {' with '<!-- wp:navigation {"ref":123,'
      $header_content = str_replace(
          '<!-- wp:navigation {',
          '<!-- wp:navigation {"ref":' . $nav_post_id . ',',
          $header_tpl
      );

      // Create Header Template Part
      $header_post_id = wp_insert_post( array(
          'post_title'   => 'header',
          'post_name'    => 'presspilot-onion-pizza//header',
          'post_content' => $header_content,
          'post_status'  => 'publish',
          'post_type'    => 'wp_template_part',
          'tax_input'    => array(
              'wp_theme_json_file_part_area' => array( 'header' )
          )
      ) );

      if ( ! is_wp_error( $header_post_id ) ) {
           // Ensure taxonomy term is set
           wp_set_object_terms( $header_post_id, 'header', 'wp_theme_json_file_part_area' );
           error_log( 'Onion Seeding: Wired Header Template Part' );
      } else {
           error_log( 'Onion Seeding: Failed to wire Header: ' . $header_post_id->get_error_message() );
      }

		} else {
			error_log( 'Onion Seeding: Failed to create Navigation Post' );
		}
	}

	update_option( 'presspilot_onion_seed_version', $version );
}
add_action( 'admin_init', 'presspilot_onion_seed_content' );
