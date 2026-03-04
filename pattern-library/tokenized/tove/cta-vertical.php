<?php
/**
 * Title: Vertical call to action.
 * Slug: tove/cta-vertical
 * Categories: tove-cta
 */
?>
<!-- wp:group {"align":"wide","backgroundColor":"senary","className":"is-style-tove-shaded"} -->
<div class="wp-block-group alignwide is-style-tove-shaded has-senary-background-color has-background">
	<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|30"}},"layout":{"inherit":true,"type":"constrained"}} -->
	<div class="wp-block-group"><!-- wp:heading {"textAlign":"center"} -->
		<h2 class="has-text-align-center">{{CTA_TITLE}}</h2>
		<!-- /wp:heading -->

		<!-- wp:paragraph {"align":"center"} -->
		<p class="has-text-align-center">{{CTA_TEXT}}</p>
		<!-- /wp:paragraph -->

		<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center","orientation":"horizontal"},"style":{"spacing":{"margin":{"top":"var:preset|spacing|40"}}}} -->
		<div class="wp-block-buttons" style="margin-top:var(--wp--preset--spacing--40)">
			<!-- wp:button {"className":"is-style-fill"} -->
			<div class="wp-block-button is-style-fill"><a class="wp-block-button__link wp-element-button">{{CTA_BUTTON}}</a></div>
			<!-- /wp:button -->
		</div>
		<!-- /wp:buttons -->
	</div>
	<!-- /wp:group -->
</div>
<!-- /wp:group -->