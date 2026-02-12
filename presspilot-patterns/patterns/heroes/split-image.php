<?php
/**
 * Title: Split Hero with Image
 * Slug: presspilot/hero-split-image
 * Categories: hero, featured
 * Block Types: core/group
 */

$title     = presspilot_string( 'hero/title', 'Elevate Your Style' );
$subtitle  = presspilot_string( 'hero/subtitle', 'Discover our curated collection of premium products designed for the modern lifestyle.' );
$btn_primary   = presspilot_string( 'hero/button-primary', 'Shop Now' );
$btn_secondary = presspilot_string( 'hero/button-secondary', 'Learn More' );
$image     = presspilot_image( 'hero/featured-image', 'https://images.pexels.com/photos/3965545/pexels-photo-3965545.jpeg?auto=compress&cs=tinysrgb&w=800' );
?>
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"0","bottom":"0","left":"0","right":"0"}}},"backgroundColor":"base","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-base-background-color has-background" style="padding-top:0;padding-right:0;padding-bottom:0;padding-left:0">
	<!-- wp:columns {"align":"full","style":{"spacing":{"blockGap":{"top":"0","left":"0"}}}} -->
	<div class="wp-block-columns alignfull">
		<!-- wp:column {"verticalAlignment":"center","width":"50%","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60","left":"var:preset|spacing|50","right":"var:preset|spacing|50"}}}} -->
		<div class="wp-block-column is-vertically-aligned-center" style="padding-top:var(--wp--preset--spacing--60);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--60);padding-left:var(--wp--preset--spacing--50);flex-basis:50%">
			<!-- wp:heading {"level":1,"style":{"typography":{"fontSize":"clamp(2rem, 4vw, 3.5rem)","fontWeight":"700","lineHeight":"1.2"}},"textColor":"contrast"} -->
			<h1 class="wp-block-heading has-contrast-color has-text-color" style="font-size:clamp(2rem, 4vw, 3.5rem);font-weight:700;line-height:1.2"><?php echo esc_html( $title ); ?></h1>
			<!-- /wp:heading -->

			<!-- wp:paragraph {"style":{"typography":{"fontSize":"1.125rem","lineHeight":"1.7"},"spacing":{"margin":{"top":"var:preset|spacing|20"}}},"textColor":"secondary"} -->
			<p class="has-secondary-color has-text-color" style="margin-top:var(--wp--preset--spacing--20);font-size:1.125rem;line-height:1.7"><?php echo esc_html( $subtitle ); ?></p>
			<!-- /wp:paragraph -->

			<!-- wp:buttons {"style":{"spacing":{"margin":{"top":"var:preset|spacing|40"}}}} -->
			<div class="wp-block-buttons" style="margin-top:var(--wp--preset--spacing--40)">
				<!-- wp:button {"backgroundColor":"primary","textColor":"base","style":{"border":{"radius":"4px"},"spacing":{"padding":{"top":"var:preset|spacing|15","bottom":"var:preset|spacing|15","left":"var:preset|spacing|30","right":"var:preset|spacing|30"}}}} -->
				<div class="wp-block-button"><a class="wp-block-button__link has-base-color has-primary-background-color has-text-color has-background wp-element-button" href="#shop" style="border-radius:4px;padding-top:var(--wp--preset--spacing--15);padding-right:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--15);padding-left:var(--wp--preset--spacing--30)"><?php echo esc_html( $btn_primary ); ?></a></div>
				<!-- /wp:button -->

				<!-- wp:button {"className":"is-style-outline","style":{"border":{"radius":"4px"},"spacing":{"padding":{"top":"var:preset|spacing|15","bottom":"var:preset|spacing|15","left":"var:preset|spacing|30","right":"var:preset|spacing|30"}}}} -->
				<div class="wp-block-button is-style-outline"><a class="wp-block-button__link wp-element-button" href="#about" style="border-radius:4px;padding-top:var(--wp--preset--spacing--15);padding-right:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--15);padding-left:var(--wp--preset--spacing--30)"><?php echo esc_html( $btn_secondary ); ?></a></div>
				<!-- /wp:button -->
			</div>
			<!-- /wp:buttons -->
		</div>
		<!-- /wp:column -->

		<!-- wp:column {"width":"50%"} -->
		<div class="wp-block-column" style="flex-basis:50%">
			<!-- wp:image {"sizeSlug":"full","linkDestination":"none","style":{"layout":{"selfStretch":"fill","flexSize":null}}} -->
			<figure class="wp-block-image size-full"><img src="<?php echo esc_url( $image ); ?>" alt=""/></figure>
			<!-- /wp:image -->
		</div>
		<!-- /wp:column -->
	</div>
	<!-- /wp:columns -->
</div>
<!-- /wp:group -->
