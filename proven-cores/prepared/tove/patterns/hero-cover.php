<?php
/**
 * Title: Hero with a background image, a heading and buttons.
 * Slug: tove/hero-cover
 * Categories: tove-hero
 */
?>
<!-- wp:cover {"dimRatio":50,"overlayColor":"foreground","minHeight":75,"minHeightUnit":"vh","align":"full"} -->
<div class="wp-block-cover alignfull" style="min-height:75vh">
	<span aria-hidden="true"
		class="wp-block-cover__background has-foreground-background-color has-background-dim-50 has-background-dim"></span>
	<div class="wp-block-cover__inner-container">
		<!-- wp:group {"layout":{"type":"constrained"}} -->
		<div class="wp-block-group">
			<!-- wp:heading {"level":6,"backgroundColor":"primary"} -->
			<h6 class="wp-block-heading has-primary-background-color has-background">{{HERO_PRETITLE}}</h6>
			<!-- /wp:heading -->

			<!-- wp:heading {"level":1,"textColor":"background","fontSize":"x-large"} -->
			<h1 class="wp-block-heading has-background-color has-text-color has-x-large-font-size">{{HERO_TITLE}}</h1>
			<!-- /wp:heading -->

			<!-- wp:paragraph {"textColor":"background"} -->
			<p class="has-background-color has-text-color">{{HERO_TEXT}}</p>
			<!-- /wp:paragraph -->

			<!-- wp:buttons -->
			<div class="wp-block-buttons">
				<!-- wp:button {"backgroundColor":"primary"} -->
				<div class="wp-block-button"><a
						class="wp-block-button__link has-primary-background-color has-background wp-element-button">{{HERO_CTA}}</a>
				</div>
				<!-- /wp:button -->
			</div>
			<!-- /wp:buttons -->
		</div>
		<!-- /wp:group -->
	</div>
</div>
<!-- /wp:cover -->