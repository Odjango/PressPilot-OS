<?php
/**
 * Title: 3-Column Testimonial Grid
 * Slug: presspilot/testimonials-grid-3
 * Categories: testimonials
 * Block Types: core/group
 */

$section_title = presspilot_string( 'testimonials/section-title', 'What Our Guests Say' );
$quote1  = presspilot_string( 'testimonials/quote-1', 'The best dining experience we\'ve had in years. Every dish was absolute perfection!' );
$name1   = presspilot_string( 'testimonials/name-1', 'Sarah Johnson' );
$role1   = presspilot_string( 'testimonials/role-1', 'Food Blogger' );
$quote2  = presspilot_string( 'testimonials/quote-2', 'Incredible atmosphere and even better food. We\'ll definitely be coming back!' );
$name2   = presspilot_string( 'testimonials/name-2', 'Michael Chen' );
$role2   = presspilot_string( 'testimonials/role-2', 'Regular Customer' );
$quote3  = presspilot_string( 'testimonials/quote-3', 'From appetizers to dessert, everything was absolutely delicious. Highly recommend!' );
$name3   = presspilot_string( 'testimonials/name-3', 'Emily Rodriguez' );
$role3   = presspilot_string( 'testimonials/role-3', 'Local Resident' );
?>
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|70","bottom":"var:preset|spacing|70","left":"var:preset|spacing|30","right":"var:preset|spacing|30"}}},"backgroundColor":"background","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-background-background-color has-background" style="padding-top:var(--wp--preset--spacing--70);padding-right:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--70);padding-left:var(--wp--preset--spacing--30)">
	<!-- wp:heading {"textAlign":"center","style":{"typography":{"fontSize":"clamp(1.75rem, 3vw, 2.5rem)","fontWeight":"700"},"spacing":{"margin":{"bottom":"var:preset|spacing|50"}}},"textColor":"foreground"} -->
	<h2 class="wp-block-heading has-text-align-center has-foreground-color has-text-color" style="margin-bottom:var(--wp--preset--spacing--50);font-size:clamp(1.75rem, 3vw, 2.5rem);font-weight:700"><?php echo esc_html( $section_title ); ?></h2>
	<!-- /wp:heading -->

	<!-- wp:columns {"style":{"spacing":{"blockGap":{"top":"var:preset|spacing|30","left":"var:preset|spacing|30"}}}} -->
	<div class="wp-block-columns">
		<!-- wp:column {"style":{"spacing":{"padding":{"top":"var:preset|spacing|30","bottom":"var:preset|spacing|30","left":"var:preset|spacing|30","right":"var:preset|spacing|30"}},"border":{"radius":"8px","width":"1px"}},"borderColor":"tertiary"} -->
		<div class="wp-block-column has-border-color has-tertiary-border-color" style="border-width:1px;border-radius:8px;padding-top:var(--wp--preset--spacing--30);padding-right:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--30);padding-left:var(--wp--preset--spacing--30)">
			<!-- wp:paragraph {"style":{"typography":{"fontSize":"1.5rem"}}} -->
			<p style="font-size:1.5rem">⭐⭐⭐⭐⭐</p>
			<!-- /wp:paragraph -->

			<!-- wp:paragraph {"style":{"typography":{"fontSize":"1rem","fontStyle":"italic"}},"textColor":"foreground"} -->
			<p class="has-foreground-color has-text-color" style="font-size:1rem;font-style:italic">"<?php echo esc_html( $quote1 ); ?>"</p>
			<!-- /wp:paragraph -->

			<!-- wp:group {"style":{"spacing":{"margin":{"top":"var:preset|spacing|20"}}},"layout":{"type":"flex","flexWrap":"nowrap"}} -->
			<div class="wp-block-group" style="margin-top:var(--wp--preset--spacing--20)">
				<!-- wp:group {"layout":{"type":"constrained"}} -->
				<div class="wp-block-group">
					<!-- wp:paragraph {"style":{"typography":{"fontWeight":"600","fontSize":"0.95rem"}},"textColor":"foreground"} -->
					<p class="has-foreground-color has-text-color" style="font-size:0.95rem;font-weight:600"><?php echo esc_html( $name1 ); ?></p>
					<!-- /wp:paragraph -->
					<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.85rem"},"spacing":{"margin":{"top":"0"}}},"textColor":"secondary"} -->
					<p class="has-secondary-color has-text-color" style="margin-top:0;font-size:0.85rem"><?php echo esc_html( $role1 ); ?></p>
					<!-- /wp:paragraph -->
				</div>
				<!-- /wp:group -->
			</div>
			<!-- /wp:group -->
		</div>
		<!-- /wp:column -->

		<!-- wp:column {"style":{"spacing":{"padding":{"top":"var:preset|spacing|30","bottom":"var:preset|spacing|30","left":"var:preset|spacing|30","right":"var:preset|spacing|30"}},"border":{"radius":"8px","width":"1px"}},"borderColor":"tertiary"} -->
		<div class="wp-block-column has-border-color has-tertiary-border-color" style="border-width:1px;border-radius:8px;padding-top:var(--wp--preset--spacing--30);padding-right:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--30);padding-left:var(--wp--preset--spacing--30)">
			<!-- wp:paragraph {"style":{"typography":{"fontSize":"1.5rem"}}} -->
			<p style="font-size:1.5rem">⭐⭐⭐⭐⭐</p>
			<!-- /wp:paragraph -->

			<!-- wp:paragraph {"style":{"typography":{"fontSize":"1rem","fontStyle":"italic"}},"textColor":"foreground"} -->
			<p class="has-foreground-color has-text-color" style="font-size:1rem;font-style:italic">"<?php echo esc_html( $quote2 ); ?>"</p>
			<!-- /wp:paragraph -->

			<!-- wp:group {"style":{"spacing":{"margin":{"top":"var:preset|spacing|20"}}},"layout":{"type":"flex","flexWrap":"nowrap"}} -->
			<div class="wp-block-group" style="margin-top:var(--wp--preset--spacing--20)">
				<!-- wp:group {"layout":{"type":"constrained"}} -->
				<div class="wp-block-group">
					<!-- wp:paragraph {"style":{"typography":{"fontWeight":"600","fontSize":"0.95rem"}},"textColor":"foreground"} -->
					<p class="has-foreground-color has-text-color" style="font-size:0.95rem;font-weight:600"><?php echo esc_html( $name2 ); ?></p>
					<!-- /wp:paragraph -->
					<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.85rem"},"spacing":{"margin":{"top":"0"}}},"textColor":"secondary"} -->
					<p class="has-secondary-color has-text-color" style="margin-top:0;font-size:0.85rem"><?php echo esc_html( $role2 ); ?></p>
					<!-- /wp:paragraph -->
				</div>
				<!-- /wp:group -->
			</div>
			<!-- /wp:group -->
		</div>
		<!-- /wp:column -->

		<!-- wp:column {"style":{"spacing":{"padding":{"top":"var:preset|spacing|30","bottom":"var:preset|spacing|30","left":"var:preset|spacing|30","right":"var:preset|spacing|30"}},"border":{"radius":"8px","width":"1px"}},"borderColor":"tertiary"} -->
		<div class="wp-block-column has-border-color has-tertiary-border-color" style="border-width:1px;border-radius:8px;padding-top:var(--wp--preset--spacing--30);padding-right:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--30);padding-left:var(--wp--preset--spacing--30)">
			<!-- wp:paragraph {"style":{"typography":{"fontSize":"1.5rem"}}} -->
			<p style="font-size:1.5rem">⭐⭐⭐⭐⭐</p>
			<!-- /wp:paragraph -->

			<!-- wp:paragraph {"style":{"typography":{"fontSize":"1rem","fontStyle":"italic"}},"textColor":"foreground"} -->
			<p class="has-foreground-color has-text-color" style="font-size:1rem;font-style:italic">"<?php echo esc_html( $quote3 ); ?>"</p>
			<!-- /wp:paragraph -->

			<!-- wp:group {"style":{"spacing":{"margin":{"top":"var:preset|spacing|20"}}},"layout":{"type":"flex","flexWrap":"nowrap"}} -->
			<div class="wp-block-group" style="margin-top:var(--wp--preset--spacing--20)">
				<!-- wp:group {"layout":{"type":"constrained"}} -->
				<div class="wp-block-group">
					<!-- wp:paragraph {"style":{"typography":{"fontWeight":"600","fontSize":"0.95rem"}},"textColor":"foreground"} -->
					<p class="has-foreground-color has-text-color" style="font-size:0.95rem;font-weight:600"><?php echo esc_html( $name3 ); ?></p>
					<!-- /wp:paragraph -->
					<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.85rem"},"spacing":{"margin":{"top":"0"}}},"textColor":"secondary"} -->
					<p class="has-secondary-color has-text-color" style="margin-top:0;font-size:0.85rem"><?php echo esc_html( $role3 ); ?></p>
					<!-- /wp:paragraph -->
				</div>
				<!-- /wp:group -->
			</div>
			<!-- /wp:group -->
		</div>
		<!-- /wp:column -->
	</div>
	<!-- /wp:columns -->
</div>
<!-- /wp:group -->
