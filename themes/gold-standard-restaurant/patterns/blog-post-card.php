<?php
/**
 * Title: Blog Post Card
 * Slug: gold-standard-restaurant/blog-post-card
 * Description: A single post card for use inside a post template / query loop.
 * Categories: gold-standard-restaurant/posts
 * Keywords: blog, post, card, loop
 * Viewport Width: 600
 * Block Types: core/post-template
 * Post Types:
 * Inserter: false
 */
?>
<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|small","padding":{"bottom":"var:preset|spacing|large"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group" style="padding-bottom:var(--wp--preset--spacing--large)">
	<!-- wp:post-featured-image {"isLink":true,"style":{"border":{"radius":"5px"}}} /-->

	<!-- wp:group {"style":{"spacing":{"blockGap":"5px"}},"layout":{"type":"constrained"}} -->
	<div class="wp-block-group">
		<!-- wp:post-title {"level":3,"isLink":true,"fontSize":"medium"} /-->
		<!-- wp:post-date {"fontSize":"x-small"} /-->
	</div>
	<!-- /wp:group -->

	<!-- wp:post-excerpt {"moreText":"Read More","excerptLength":25} /-->
</div>
<!-- /wp:group -->
