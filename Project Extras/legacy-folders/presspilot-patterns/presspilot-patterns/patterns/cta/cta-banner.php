<?php
/**
 * Pattern: CTA Banner
 * 
 * Full-width colored banner with headline and button.
 * 
 * @package PressPilot
 */

$headline    = presspilot_string( 'headline', 'Ready to Get Started?' );
$subtext     = presspilot_string( 'subtext', 'Contact us today and let\'s discuss how we can help you achieve your goals.' );
$button_text = presspilot_string( 'button-text', 'Contact Us' );
?>
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|70","bottom":"var:preset|spacing|70","left":"var:preset|spacing|50","right":"var:preset|spacing|50"}}},"backgroundColor":"primary","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-primary-background-color has-background" style="padding-top:var(--wp--preset--spacing--70);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--70);padding-left:var(--wp--preset--spacing--50)">

<!-- wp:group {"layout":{"type":"constrained","contentSize":"700px"}} -->
<div class="wp-block-group">

<!-- wp:heading {"textAlign":"center","style":{"typography":{"fontSize":"2rem","fontWeight":"700"}},"textColor":"background"} -->
<h2 class="wp-block-heading has-text-align-center has-background-color has-text-color" style="font-size:2rem;font-weight:700"><?php echo esc_html( $headline ); ?></h2>
<!-- /wp:heading -->

<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"1.125rem"},"spacing":{"margin":{"top":"var:preset|spacing|30"}}},"textColor":"background"} -->
<p class="has-text-align-center has-background-color has-text-color" style="margin-top:var(--wp--preset--spacing--30);font-size:1.125rem"><?php echo esc_html( $subtext ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"margin":{"top":"var:preset|spacing|50"}}}} -->
<div class="wp-block-buttons" style="margin-top:var(--wp--preset--spacing--50)">

<!-- wp:button {"backgroundColor":"background","textColor":"primary","style":{"border":{"radius":"4px"},"spacing":{"padding":{"top":"0.875rem","bottom":"0.875rem","left":"2rem","right":"2rem"}}}} -->
<div class="wp-block-button"><a class="wp-block-button__link has-primary-color has-background-background-color has-text-color has-background wp-element-button" style="border-radius:4px;padding-top:0.875rem;padding-right:2rem;padding-bottom:0.875rem;padding-left:2rem"><?php echo esc_html( $button_text ); ?></a></div>
<!-- /wp:button -->

</div>
<!-- /wp:buttons -->

</div>
<!-- /wp:group -->

</div>
<!-- /wp:group -->
