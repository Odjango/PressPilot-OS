<?php
/**
 * Title: FAQ
 * Slug: twentytwentyfour/text-faq
 * Categories: text, about, featured
 * Keywords: faq, about, frequently asked
 * Viewport width: 1400
 * Description: A FAQ section with a large FAQ heading and a group of questions and answers.
 */
?>

<!-- wp:group {"metadata":{"name":"FAQs"},"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50","left":"var:preset|spacing|50","right":"var:preset|spacing|50"},"margin":{"top":"0","bottom":"0"}},"elements":{"link":{"color":{"text":"var:preset|color|base"}}}},"backgroundColor":"contrast","textColor":"base","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-base-color has-contrast-background-color has-text-color has-background has-link-color"
	style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--50);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--50);padding-left:var(--wp--preset--spacing--50)">
	<!-- wp:heading {"align":"wide","style":{"elements":{"link":{"color":{"text":"var:preset|color|base"}}},"typography":{"fontSize":"10rem","letterSpacing":"-0.02em"}},"textColor":"base"} -->
	<h2 class="wp-block-heading alignwide has-base-color has-text-color has-link-color"
		style="font-size:10rem;letter-spacing:-0.02em">{{FAQ_TITLE}}</h2>
	<!-- /wp:heading -->

	<!-- wp:group {"align":"wide","layout":{"type":"default"}} -->
	<div class="wp-block-group alignwide">
		<!-- wp:separator {"style":{"spacing":{"margin":{"top":"var:preset|spacing|30","bottom":"var:preset|spacing|30"}}},"backgroundColor":"base","className":"is-style-wide"} -->
		<hr class="wp-block-separator has-text-color has-base-color has-alpha-channel-opacity has-base-background-color has-background is-style-wide"
			style="margin-top:var(--wp--preset--spacing--30);margin-bottom:var(--wp--preset--spacing--30)" />
		<!-- /wp:separator -->
		<!-- wp:heading {"level":3,"align":"wide","style":{"elements":{"link":{"color":{"text":"var:preset|color|base-2"}}}},"textColor":"base-2"} -->
		<h3 class="wp-block-heading alignwide has-base-2-color has-text-color has-link-color">{{FAQ_1_QUESTION}}</h3>
		<!-- /wp:heading -->
		<!-- wp:paragraph {"placeholder":"Type / to add a hidden block","style":{"elements":{"link":{"color":{"text":"var:preset|color|contrast-1"}}}},"textColor":"contrast-1"} -->
		<p class="has-contrast-1-color has-text-color has-link-color">{{FAQ_1_ANSWER}}</p>
		<!-- /wp:paragraph -->

		<!-- wp:separator {"style":{"spacing":{"margin":{"top":"var:preset|spacing|30","bottom":"var:preset|spacing|30"}}},"backgroundColor":"base","className":"is-style-wide"} -->
		<hr class="wp-block-separator has-text-color has-base-color has-alpha-channel-opacity has-base-background-color has-background is-style-wide"
			style="margin-top:var(--wp--preset--spacing--30);margin-bottom:var(--wp--preset--spacing--30)" />
		<!-- /wp:separator -->

		<!-- wp:heading {"level":3,"align":"wide","style":{"elements":{"link":{"color":{"text":"var:preset|color|base-2"}}}},"textColor":"base-2"} -->
		<h3 class="wp-block-heading alignwide has-base-2-color has-text-color has-link-color">{{FAQ_2_QUESTION}}</h3>
		<!-- /wp:heading -->
		<!-- wp:paragraph {"placeholder":"Type / to add a hidden block","style":{"elements":{"link":{"color":{"text":"var:preset|color|contrast-1"}}}},"textColor":"contrast-1"} -->
		<p class="has-contrast-1-color has-text-color has-link-color">{{FAQ_2_ANSWER}}</p>
		<!-- /wp:paragraph -->

		<!-- wp:separator {"style":{"spacing":{"margin":{"top":"var:preset|spacing|30","bottom":"var:preset|spacing|30"}}},"backgroundColor":"base","className":"is-style-wide"} -->
		<hr class="wp-block-separator has-text-color has-base-color has-alpha-channel-opacity has-base-background-color has-background is-style-wide"
			style="margin-top:var(--wp--preset--spacing--30);margin-bottom:var(--wp--preset--spacing--30)" />
		<!-- /wp:separator -->

		<!-- wp:heading {"level":3,"align":"wide","style":{"elements":{"link":{"color":{"text":"var:preset|color|base-2"}}}},"textColor":"base-2"} -->
		<h3 class="wp-block-heading alignwide has-base-2-color has-text-color has-link-color">{{FAQ_3_QUESTION}}</h3>
		<!-- /wp:heading -->
		<!-- wp:paragraph {"placeholder":"Type / to add a hidden block","style":{"elements":{"link":{"color":{"text":"var:preset|color|contrast-1"}}}},"textColor":"contrast-1"} -->
		<p class="has-contrast-1-color has-text-color has-link-color">{{FAQ_3_ANSWER}}</p>
		<!-- /wp:paragraph -->

		<!-- wp:separator {"style":{"spacing":{"margin":{"top":"var:preset|spacing|30","bottom":"var:preset|spacing|30"}}},"backgroundColor":"base","className":"is-style-wide"} -->
		<hr class="wp-block-separator has-text-color has-base-color has-alpha-channel-opacity has-base-background-color has-background is-style-wide"
			style="margin-top:var(--wp--preset--spacing--30);margin-bottom:var(--wp--preset--spacing--30)" />
		<!-- /wp:separator -->

		<!-- wp:heading {"level":3,"align":"wide","style":{"elements":{"link":{"color":{"text":"var:preset|color|base-2"}}}},"textColor":"base-2"} -->
		<h3 class="wp-block-heading alignwide has-base-2-color has-text-color has-link-color">{{FAQ_4_QUESTION}}</h3>
		<!-- /wp:heading -->
		<!-- wp:paragraph {"placeholder":"Type / to add a hidden block","style":{"elements":{"link":{"color":{"text":"var:preset|color|contrast-1"}}}},"textColor":"contrast-1"} -->
		<p class="has-contrast-1-color has-text-color has-link-color">{{FAQ_4_ANSWER}}</p>
		<!-- /wp:paragraph -->

		<!-- wp:spacer {"height":"var:preset|spacing|10","style":{"spacing":{"margin":{"top":"var:preset|spacing|10","bottom":"0"}}}} -->
		<div style="margin-top:var(--wp--preset--spacing--10);margin-bottom:0;height:var(--wp--preset--spacing--10)"
			aria-hidden="true" class="wp-block-spacer"></div>
		<!-- /wp:spacer -->
	</div>
	<!-- /wp:group -->
</div>
<!-- /wp:group -->