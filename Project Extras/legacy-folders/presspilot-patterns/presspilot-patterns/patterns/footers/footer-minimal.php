<?php
/**
 * Pattern: Footer Minimal
 * 
 * Simple centered footer with copyright and PressPilot credit.
 * 
 * @package PressPilot
 */

$business_name = presspilot_string( 'business-name', 'Your Business' );
$current_year  = date( 'Y' );
?>
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50","left":"var:preset|spacing|50","right":"var:preset|spacing|50"}}},"backgroundColor":"foreground","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-foreground-background-color has-background" style="padding-top:var(--wp--preset--spacing--50);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--50);padding-left:var(--wp--preset--spacing--50)">

<!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"center"}} -->
<div class="wp-block-group">

<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.875rem"}},"textColor":"secondary"} -->
<p class="has-secondary-color has-text-color" style="font-size:0.875rem">© <?php echo esc_html( $current_year ); ?> <?php echo esc_html( $business_name ); ?> · Powered by <a href="https://presspilot.io" style="color: inherit;">PressPilot</a></p>
<!-- /wp:paragraph -->

</div>
<!-- /wp:group -->

</div>
<!-- /wp:group -->
