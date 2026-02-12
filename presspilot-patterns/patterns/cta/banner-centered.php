<?php
/**
 * Title: Centered CTA Banner
 * Slug: presspilot/cta-banner-centered
 * Categories: cta, call-to-action
 * Block Types: core/group
 */

$title    = presspilot_string( 'cta/title', 'Ready to Experience Something Special?' );
$subtitle = presspilot_string( 'cta/subtitle', 'Book your table today and discover why we\'re the city\'s favorite dining destination.' );
$button   = presspilot_string( 'cta/button', 'Reserve Your Table' );
?>
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60","left":"var:preset|spacing|30","right":"var:preset|spacing|30"}}},"backgroundColor":"primary","layout":{"type":"constrained","contentSize":"700px"}} -->
<div id="reserve" class="wp-block-group alignfull has-primary-background-color has-background" style="padding-top:var(--wp--preset--spacing--60);padding-right:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--60);padding-left:var(--wp--preset--spacing--30)">
	<!-- wp:heading {"textAlign":"center","style":{"typography":{"fontSize":"clamp(1.5rem, 3vw, 2.25rem)","fontWeight":"700"}},"textColor":"background"} -->
	<h2 class="wp-block-heading has-text-align-center has-background-color has-text-color" style="font-size:clamp(1.5rem, 3vw, 2.25rem);font-weight:700"><?php echo esc_html( $title ); ?></h2>
	<!-- /wp:heading -->

	<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"1.1rem"},"spacing":{"margin":{"top":"var:preset|spacing|10"}}},"textColor":"background"} -->
	<p class="has-text-align-center has-background-color has-text-color" style="margin-top:var(--wp--preset--spacing--10);font-size:1.1rem"><?php echo esc_html( $subtitle ); ?></p>
	<!-- /wp:paragraph -->

	<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"margin":{"top":"var:preset|spacing|30"}}}} -->
	<div class="wp-block-buttons" style="margin-top:var(--wp--preset--spacing--30)">
		<!-- wp:button {"backgroundColor":"background","textColor":"primary","style":{"border":{"radius":"4px"},"spacing":{"padding":{"top":"var:preset|spacing|15","bottom":"var:preset|spacing|15","left":"var:preset|spacing|40","right":"var:preset|spacing|40"}}}} -->
		<div class="wp-block-button"><a class="wp-block-button__link has-primary-color has-background-background-color has-text-color has-background wp-element-button" href="/contact/" style="border-radius:4px;padding-top:var(--wp--preset--spacing--15);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--15);padding-left:var(--wp--preset--spacing--40)"><?php echo esc_html( $button ); ?></a></div>
		<!-- /wp:button -->
	</div>
	<!-- /wp:buttons -->
</div>
<!-- /wp:group -->
