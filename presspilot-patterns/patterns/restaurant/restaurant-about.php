<?php
/**
 * Pattern: Restaurant About/Story
 *
 * Two-column about section with text on left and image on right.
 * Source: proven-cores/twentytwentyfour/patterns/text-title-left-image-right.php
 *
 * @package PressPilot
 */

$section_title = presspilot_string( 'section-title', 'Our Story' );
$paragraph_1   = presspilot_string( 'paragraph-1', 'Founded in 2010, our restaurant began as a small family dream. What started as a passion for authentic cuisine has grown into a beloved local destination where every dish tells a story of tradition and love.' );
$paragraph_2   = presspilot_string( 'paragraph-2', 'Our chefs bring decades of experience and a commitment to using only the freshest, locally-sourced ingredients. Every meal is prepared with care, honoring time-tested recipes while embracing modern culinary techniques.' );
$about_image   = presspilot_image( 'about-image', 'https://images.pexels.com/photos/3338497/pexels-photo-3338497.jpeg?auto=compress&cs=tinysrgb&w=600' );
?>

<!-- wp:group {"align":"full","style":{"spacing":{"margin":{"top":"0","bottom":"0"},"padding":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50","left":"var:preset|spacing|50","right":"var:preset|spacing|50"}}},"backgroundColor":"tertiary","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-tertiary-background-color has-background" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--50);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--50);padding-left:var(--wp--preset--spacing--50)">
	<!-- wp:columns {"verticalAlignment":null,"align":"wide","style":{"spacing":{"blockGap":{"top":"var:preset|spacing|40","left":"var:preset|spacing|50"}}}} -->
	<div class="wp-block-columns alignwide">
		<!-- wp:column {"verticalAlignment":"stretch","width":"50%"} -->
		<div class="wp-block-column is-vertically-aligned-stretch" style="flex-basis:50%">
			<!-- wp:group {"style":{"dimensions":{"minHeight":"100%"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch","verticalAlignment":"space-between"}} -->
			<div class="wp-block-group" style="min-height:100%">

				<!-- wp:paragraph {"style":{"typography":{"lineHeight":"1.2"}},"fontSize":"x-large"} -->
				<p class="has-x-large-font-size" style="line-height:1.2"><?php echo esc_html( $section_title ); ?></p>
				<!-- /wp:paragraph -->

				<!-- wp:group {"layout":{"type":"constrained","justifyContent":"left"}} -->
				<div class="wp-block-group">

					<!-- wp:paragraph -->
					<p><?php echo esc_html( $paragraph_1 ); ?></p>
					<!-- /wp:paragraph -->

					<!-- wp:paragraph -->
					<p><?php echo esc_html( $paragraph_2 ); ?></p>
					<!-- /wp:paragraph -->

				</div>
				<!-- /wp:group -->
			</div>
			<!-- /wp:group -->
		</div>
		<!-- /wp:column -->

		<!-- wp:column {"verticalAlignment":"center","width":"50%"} -->
		<div class="wp-block-column is-vertically-aligned-center" style="flex-basis:50%">
			<!-- wp:image {"aspectRatio":"3/4","scale":"cover","sizeSlug":"large","linkDestination":"none","className":"is-style-rounded"} -->
			<figure class="wp-block-image size-large is-style-rounded">
				<img src="<?php echo esc_url( $about_image ); ?>" alt="" style="aspect-ratio:3/4;object-fit:cover" />
			</figure>
			<!-- /wp:image -->
		</div>
		<!-- /wp:column -->
	</div>
	<!-- /wp:columns -->
</div>
<!-- /wp:group -->
