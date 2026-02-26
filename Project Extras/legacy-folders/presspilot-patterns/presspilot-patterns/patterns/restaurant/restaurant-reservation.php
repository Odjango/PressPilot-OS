<?php
/**
 * Pattern: Restaurant Reservation CTA
 *
 * Vertical call to action for table reservations.
 * Source: proven-cores/tove/patterns/cta-vertical.php
 *
 * @package PressPilot
 */

$headline    = presspilot_string( 'headline', 'Reserve Your Table' );
$subtext     = presspilot_string( 'subtext', 'Join us for an unforgettable dining experience. Call now or book online.' );
$button_text = presspilot_string( 'button-text', 'Make a Reservation' );
$phone       = presspilot_string( 'phone', '(555) 123-4567' );
?>
<!-- wp:group {"align":"wide","backgroundColor":"tertiary"} -->
<div class="wp-block-group alignwide has-tertiary-background-color has-background">
	<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|30"}},"layout":{"type":"constrained"}} -->
	<div class="wp-block-group">
		<!-- wp:heading {"textAlign":"center"} -->
		<h2 class="wp-block-heading has-text-align-center"><?php echo esc_html( $headline ); ?></h2>
		<!-- /wp:heading -->

		<!-- wp:paragraph {"align":"center"} -->
		<p class="has-text-align-center"><?php echo esc_html( $subtext ); ?></p>
		<!-- /wp:paragraph -->

		<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"1.25rem","fontWeight":"600"}}} -->
		<p class="has-text-align-center" style="font-size:1.25rem;font-weight:600"><?php echo esc_html( $phone ); ?></p>
		<!-- /wp:paragraph -->

		<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center","orientation":"horizontal"},"style":{"spacing":{"margin":{"top":"var:preset|spacing|40"}}}} -->
		<div class="wp-block-buttons" style="margin-top:var(--wp--preset--spacing--40)">
			<!-- wp:button {"className":"is-style-fill"} -->
			<div class="wp-block-button is-style-fill"><a class="wp-block-button__link wp-element-button"><?php echo esc_html( $button_text ); ?></a></div>
			<!-- /wp:button -->
		</div>
		<!-- /wp:buttons -->
	</div>
	<!-- /wp:group -->
</div>
<!-- /wp:group -->
