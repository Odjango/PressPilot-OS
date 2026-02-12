<?php
/**
 * Title: 3-Column Feature Grid
 * Slug: presspilot/features-icon-grid-3
 * Categories: features
 * Block Types: core/group
 */

$section_title    = presspilot_string( 'features/section-title', 'Why Choose Us' );
$section_subtitle = presspilot_string( 'features/section-subtitle', 'What makes us different' );
$f1_title         = presspilot_string( 'features/feature-1-title', 'Fresh Ingredients' );
$f1_desc          = presspilot_string( 'features/feature-1-desc', 'We source only the freshest, locally-grown ingredients for every dish we serve.' );
$f2_title         = presspilot_string( 'features/feature-2-title', 'Expert Chefs' );
$f2_desc          = presspilot_string( 'features/feature-2-desc', 'Our culinary team brings decades of experience from kitchens around the world.' );
$f3_title         = presspilot_string( 'features/feature-3-title', 'Cozy Atmosphere' );
$f3_desc          = presspilot_string( 'features/feature-3-desc', 'Enjoy your meal in our warm, welcoming space designed for comfort and connection.' );
?>
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|70","bottom":"var:preset|spacing|70","left":"var:preset|spacing|30","right":"var:preset|spacing|30"}}},"backgroundColor":"tertiary","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-tertiary-background-color has-background" style="padding-top:var(--wp--preset--spacing--70);padding-right:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--70);padding-left:var(--wp--preset--spacing--30)">
	<!-- wp:group {"style":{"spacing":{"margin":{"bottom":"var:preset|spacing|50"}}},"layout":{"type":"constrained"}} -->
	<div class="wp-block-group" style="margin-bottom:var(--wp--preset--spacing--50)">
		<!-- wp:heading {"textAlign":"center","style":{"typography":{"fontSize":"clamp(1.75rem, 3vw, 2.5rem)","fontWeight":"700"}},"textColor":"foreground"} -->
		<h2 class="wp-block-heading has-text-align-center has-foreground-color has-text-color" style="font-size:clamp(1.75rem, 3vw, 2.5rem);font-weight:700"><?php echo esc_html( $section_title ); ?></h2>
		<!-- /wp:heading -->

		<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"1.1rem"}},"textColor":"secondary"} -->
		<p class="has-text-align-center has-secondary-color has-text-color" style="font-size:1.1rem"><?php echo esc_html( $section_subtitle ); ?></p>
		<!-- /wp:paragraph -->
	</div>
	<!-- /wp:group -->

	<!-- wp:columns {"style":{"spacing":{"blockGap":{"top":"var:preset|spacing|40","left":"var:preset|spacing|40"}}}} -->
	<div class="wp-block-columns">
		<!-- wp:column {"style":{"spacing":{"padding":{"top":"var:preset|spacing|30","bottom":"var:preset|spacing|30","left":"var:preset|spacing|30","right":"var:preset|spacing|30"}},"border":{"radius":"8px"}},"backgroundColor":"background"} -->
		<div class="wp-block-column has-background-background-color has-background" style="border-radius:8px;padding-top:var(--wp--preset--spacing--30);padding-right:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--30);padding-left:var(--wp--preset--spacing--30)">
			<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"2.5rem"}}} -->
			<p class="has-text-align-center" style="font-size:2.5rem">🥗</p>
			<!-- /wp:paragraph -->

			<!-- wp:heading {"textAlign":"center","level":3,"style":{"typography":{"fontSize":"1.25rem","fontWeight":"600"},"spacing":{"margin":{"top":"var:preset|spacing|10"}}},"textColor":"foreground"} -->
			<h3 class="wp-block-heading has-text-align-center has-foreground-color has-text-color" style="margin-top:var(--wp--preset--spacing--10);font-size:1.25rem;font-weight:600"><?php echo esc_html( $f1_title ); ?></h3>
			<!-- /wp:heading -->

			<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"0.95rem"}},"textColor":"secondary"} -->
			<p class="has-text-align-center has-secondary-color has-text-color" style="font-size:0.95rem"><?php echo esc_html( $f1_desc ); ?></p>
			<!-- /wp:paragraph -->
		</div>
		<!-- /wp:column -->

		<!-- wp:column {"style":{"spacing":{"padding":{"top":"var:preset|spacing|30","bottom":"var:preset|spacing|30","left":"var:preset|spacing|30","right":"var:preset|spacing|30"}},"border":{"radius":"8px"}},"backgroundColor":"background"} -->
		<div class="wp-block-column has-background-background-color has-background" style="border-radius:8px;padding-top:var(--wp--preset--spacing--30);padding-right:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--30);padding-left:var(--wp--preset--spacing--30)">
			<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"2.5rem"}}} -->
			<p class="has-text-align-center" style="font-size:2.5rem">👨‍🍳</p>
			<!-- /wp:paragraph -->

			<!-- wp:heading {"textAlign":"center","level":3,"style":{"typography":{"fontSize":"1.25rem","fontWeight":"600"},"spacing":{"margin":{"top":"var:preset|spacing|10"}}},"textColor":"foreground"} -->
			<h3 class="wp-block-heading has-text-align-center has-foreground-color has-text-color" style="margin-top:var(--wp--preset--spacing--10);font-size:1.25rem;font-weight:600"><?php echo esc_html( $f2_title ); ?></h3>
			<!-- /wp:heading -->

			<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"0.95rem"}},"textColor":"secondary"} -->
			<p class="has-text-align-center has-secondary-color has-text-color" style="font-size:0.95rem"><?php echo esc_html( $f2_desc ); ?></p>
			<!-- /wp:paragraph -->
		</div>
		<!-- /wp:column -->

		<!-- wp:column {"style":{"spacing":{"padding":{"top":"var:preset|spacing|30","bottom":"var:preset|spacing|30","left":"var:preset|spacing|30","right":"var:preset|spacing|30"}},"border":{"radius":"8px"}},"backgroundColor":"background"} -->
		<div class="wp-block-column has-background-background-color has-background" style="border-radius:8px;padding-top:var(--wp--preset--spacing--30);padding-right:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--30);padding-left:var(--wp--preset--spacing--30)">
			<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"2.5rem"}}} -->
			<p class="has-text-align-center" style="font-size:2.5rem">🏠</p>
			<!-- /wp:paragraph -->

			<!-- wp:heading {"textAlign":"center","level":3,"style":{"typography":{"fontSize":"1.25rem","fontWeight":"600"},"spacing":{"margin":{"top":"var:preset|spacing|10"}}},"textColor":"foreground"} -->
			<h3 class="wp-block-heading has-text-align-center has-foreground-color has-text-color" style="margin-top:var(--wp--preset--spacing--10);font-size:1.25rem;font-weight:600"><?php echo esc_html( $f3_title ); ?></h3>
			<!-- /wp:heading -->

			<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"0.95rem"}},"textColor":"secondary"} -->
			<p class="has-text-align-center has-secondary-color has-text-color" style="font-size:0.95rem"><?php echo esc_html( $f3_desc ); ?></p>
			<!-- /wp:paragraph -->
		</div>
		<!-- /wp:column -->
	</div>
	<!-- /wp:columns -->
</div>
<!-- /wp:group -->
