<?php
/**
 * Title: Post meta
 * Slug: twentytwentyfour/hidden-post-meta
 * Inserter: no
 */
?>

<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group">
	<!-- wp:group {"style":{"spacing":{"blockGap":"0.3em"}},"layout":{"type":"flex","justifyContent":"left"}} -->
	<div class="wp-block-group">
		<!-- wp:post-date {"format":"M j, Y","isLink":true} /-->

		<!-- wp:paragraph {"textColor":"contrast-2"} -->
		<p class="has-contrast-2-color has-text-color">—</p>
		<!-- /wp:paragraph -->

		<!-- wp:paragraph {"fontSize":"small","textColor":"contrast-2"} -->
		<p class="has-small-font-size has-contrast-2-color has-text-color">by</p>
		<!-- /wp:paragraph -->

		<!-- wp:post-author-name {"isLink":true} /-->

		<!-- wp:post-terms {"term":"category","prefix":"in "} /-->

	</div>
	<!-- /wp:group -->
</div>
<!-- /wp:group -->
