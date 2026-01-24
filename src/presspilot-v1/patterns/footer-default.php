<?php
/**
 * Title: Footer with text, links.
 * Slug: frost/footer-default
 * Categories: footer
 * Block Types: core/template-part/footer
 */
?>
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|small","bottom":"var:preset|spacing|small","left":"30px","right":"30px"},"margin":{"top":"0px"}}},"layout":{"type":"constrained"},"fontSize":"small"} -->
<div class="wp-block-group alignfull has-small-font-size"
	style="margin-top:0px;padding-top:var(--wp--preset--spacing--small);padding-right:30px;padding-bottom:var(--wp--preset--spacing--small);padding-left:30px">
	<!-- wp:group {"align":"wide","layout":{"type":"flex","allowOrientation":false,"justifyContent":"space-between"}} -->
	<div class="wp-block-group alignwide">
		<!-- wp:paragraph -->
		<p>&copy; 2026 PressPilot V1. All rights reserved. <a href="https://presspilot.app" rel="nofollow">Powered by
				PressPilot</a>.</p>
		<!-- /wp:paragraph -->

		<!-- wp:social-links {"iconColor":"foreground","iconColorValue":"#000000","className":"is-style-logos-only","layout":{"type":"flex"}} -->
		<ul class="wp-block-social-links has-icon-color is-style-logos-only">
			<!-- wp:social-link {"url":"#","service":"facebook"} /-->
			<!-- wp:social-link {"url":"#","service":"x"} /-->
			<!-- wp:social-link {"url":"#","service":"instagram"} /-->
		</ul>
		<!-- /wp:social-links -->
	</div>
	<!-- /wp:group -->
</div>
<!-- /wp:group -->