<?php
/**
 * Title: Cover Hero with CTA
 * Slug: presspilot/hero-cover-cta
 * Categories: hero, featured
 * Block Types: core/group
 * Source: proven-cores/twentytwentyfour/patterns (color slugs mapped)
 */

$title     = presspilot_string( 'hero/title', 'Welcome to Our Restaurant' );
$subtitle  = presspilot_string( 'hero/subtitle', 'Experience authentic flavors crafted with passion and the finest ingredients' );
$btn_primary   = presspilot_string( 'hero/button-primary', 'View Our Menu' );
$btn_secondary = presspilot_string( 'hero/button-secondary', 'Make Reservation' );
$bg_image  = presspilot_image( 'hero/background', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1920' );
?>
<!-- wp:cover {"url":"<?php echo esc_url( $bg_image ); ?>","dimRatio":60,"overlayColor":"foreground","isUserOverlayColor":true,"minHeight":80,"minHeightUnit":"vh","align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60","left":"var:preset|spacing|30","right":"var:preset|spacing|30"}}}} -->
<div class="wp-block-cover alignfull" style="padding-top:var(--wp--preset--spacing--60);padding-right:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--60);padding-left:var(--wp--preset--spacing--30);min-height:80vh">
	<span aria-hidden="true" class="wp-block-cover__background has-foreground-background-color has-background-dim-60 has-background-dim"></span>
	<img class="wp-block-cover__image-background" alt="" src="<?php echo esc_url( $bg_image ); ?>" data-object-fit="cover"/>
	<div class="wp-block-cover__inner-container">
		<!-- wp:group {"layout":{"type":"constrained","contentSize":"800px"}} -->
		<div class="wp-block-group">
			<!-- wp:heading {"textAlign":"center","level":1,"style":{"typography":{"fontSize":"clamp(2.5rem, 5vw, 4rem)","fontWeight":"700"}},"textColor":"background"} -->
			<h1 class="wp-block-heading has-text-align-center has-background-color has-text-color" style="font-size:clamp(2.5rem, 5vw, 4rem);font-weight:700"><?php echo esc_html( $title ); ?></h1>
			<!-- /wp:heading -->

			<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"1.25rem"},"spacing":{"margin":{"top":"var:preset|spacing|20"}}},"textColor":"background"} -->
			<p class="has-text-align-center has-background-color has-text-color" style="margin-top:var(--wp--preset--spacing--20);font-size:1.25rem"><?php echo esc_html( $subtitle ); ?></p>
			<!-- /wp:paragraph -->

			<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"margin":{"top":"var:preset|spacing|40"}}}} -->
			<div class="wp-block-buttons" style="margin-top:var(--wp--preset--spacing--40)">
				<!-- wp:button {"backgroundColor":"primary","textColor":"background","style":{"border":{"radius":"4px"},"spacing":{"padding":{"top":"var:preset|spacing|20","bottom":"var:preset|spacing|20","left":"var:preset|spacing|40","right":"var:preset|spacing|40"}}}} -->
				<div class="wp-block-button"><a class="wp-block-button__link has-background-color has-primary-background-color has-text-color has-background wp-element-button" href="/menu/" style="border-radius:4px;padding-top:var(--wp--preset--spacing--20);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--20);padding-left:var(--wp--preset--spacing--40)"><?php echo esc_html( $btn_primary ); ?></a></div>
				<!-- /wp:button -->

				<!-- wp:button {"backgroundColor":"background","textColor":"foreground","className":"is-style-outline","style":{"border":{"radius":"4px"},"spacing":{"padding":{"top":"var:preset|spacing|20","bottom":"var:preset|spacing|20","left":"var:preset|spacing|40","right":"var:preset|spacing|40"}}}} -->
				<div class="wp-block-button is-style-outline"><a class="wp-block-button__link has-foreground-color has-background-background-color has-text-color has-background wp-element-button" href="/contact/" style="border-radius:4px;padding-top:var(--wp--preset--spacing--20);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--20);padding-left:var(--wp--preset--spacing--40)"><?php echo esc_html( $btn_secondary ); ?></a></div>
				<!-- /wp:button -->
			</div>
			<!-- /wp:buttons -->
		</div>
		<!-- /wp:group -->
	</div>
</div>
<!-- /wp:cover -->
