<?php
/**
 * Title: Hours & Location
 * Slug: presspilot/restaurant-hours-location
 * Categories: restaurant, contact
 * Block Types: core/group
 * Source: proven-cores/twentytwentyfour/patterns/text-title-left-image-right.php
 */

$section_title  = presspilot_string( 'info/section-title', 'Find Us' );
$hours_weekday  = presspilot_string( 'info/hours-weekday', 'Mon-Thu: 11:30 AM - 9:00 PM' );
$hours_weekend  = presspilot_string( 'info/hours-weekend', 'Fri-Sun: 11:00 AM - 10:00 PM' );
$address        = presspilot_string( 'info/address', '123 Beach Blvd, Santa Monica, CA' );
$phone          = presspilot_string( 'info/phone', '(555) 867-5309' );
$email          = presspilot_string( 'info/email', 'hello@restaurant.com' );
$map_image      = presspilot_image( 'info/map-image', 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=800' );
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

				<!-- wp:group {"layout":{"type":"constrained","contentSize":"300px","justifyContent":"left"}} -->
				<div class="wp-block-group">

					<!-- wp:paragraph {"style":{"layout":{"selfStretch":"fixed","flexSize":"50%"}}} -->
					<p><?php echo esc_html( $hours_weekday ); ?><br><?php echo esc_html( $hours_weekend ); ?><br><br><?php echo esc_html( $address ); ?><br><?php echo esc_html( $phone ); ?><br><?php echo esc_html( $email ); ?></p>
					<!-- /wp:paragraph -->

					<!-- wp:buttons -->
					<div class="wp-block-buttons">
						<!-- wp:button -->
						<div class="wp-block-button">
							<a class="wp-block-button__link wp-element-button" href="#reserve">Book a Table</a>
						</div>
						<!-- /wp:button -->
					</div>
					<!-- /wp:buttons -->
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
				<img src="<?php echo esc_url( $map_image ); ?>" alt="Restaurant location" style="aspect-ratio:3/4;object-fit:cover" />
			</figure>
			<!-- /wp:image -->
		</div>
		<!-- /wp:column -->
	</div>
	<!-- /wp:columns -->
</div>
<!-- /wp:group -->
