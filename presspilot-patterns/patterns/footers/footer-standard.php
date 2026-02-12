<?php
/**
 * Pattern: Footer Standard
 * 
 * Multi-column footer with contact info, hours, and PressPilot credit.
 * 
 * @package PressPilot
 */

$business_name  = presspilot_string( 'business-name', 'Your Business' );
$tagline        = presspilot_string( 'tagline', 'Quality service you can trust.' );
$address        = presspilot_string( 'address', '123 Main Street' );
$city_state_zip = presspilot_string( 'city-state-zip', 'Anytown, ST 12345' );
$phone          = presspilot_string( 'phone', '(555) 123-4567' );
$email          = presspilot_string( 'email', 'hello@example.com' );
$hours_weekday  = presspilot_string( 'hours-weekday', 'Mon-Fri: 9AM - 6PM' );
$hours_weekend  = presspilot_string( 'hours-weekend', 'Sat-Sun: 10AM - 4PM' );
$current_year   = date( 'Y' );
?>
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|70","bottom":"var:preset|spacing|50","left":"var:preset|spacing|50","right":"var:preset|spacing|50"}}},"backgroundColor":"foreground","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-foreground-background-color has-background" style="padding-top:var(--wp--preset--spacing--70);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--50);padding-left:var(--wp--preset--spacing--50)">

<!-- wp:columns {"style":{"spacing":{"blockGap":{"left":"var:preset|spacing|60"}}}} -->
<div class="wp-block-columns">

<!-- wp:column {"width":"40%"} -->
<div class="wp-block-column" style="flex-basis:40%">

<!-- wp:heading {"level":3,"style":{"typography":{"fontSize":"1.25rem","fontWeight":"700"}},"textColor":"background"} -->
<h3 class="wp-block-heading has-background-color has-text-color" style="font-size:1.25rem;font-weight:700"><?php echo esc_html( $business_name ); ?></h3>
<!-- /wp:heading -->

<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.9rem"},"spacing":{"margin":{"top":"var:preset|spacing|30"}}},"textColor":"secondary"} -->
<p class="has-secondary-color has-text-color" style="margin-top:var(--wp--preset--spacing--30);font-size:0.9rem"><?php echo esc_html( $tagline ); ?></p>
<!-- /wp:paragraph -->

</div>
<!-- /wp:column -->

<!-- wp:column {"width":"30%"} -->
<div class="wp-block-column" style="flex-basis:30%">

<!-- wp:heading {"level":4,"style":{"typography":{"fontSize":"0.875rem","fontWeight":"600","textTransform":"uppercase","letterSpacing":"0.05em"}},"textColor":"background"} -->
<h4 class="wp-block-heading has-background-color has-text-color" style="font-size:0.875rem;font-weight:600;letter-spacing:0.05em;text-transform:uppercase">Contact</h4>
<!-- /wp:heading -->

<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.9rem"},"spacing":{"margin":{"top":"var:preset|spacing|30"}}},"textColor":"secondary"} -->
<p class="has-secondary-color has-text-color" style="margin-top:var(--wp--preset--spacing--30);font-size:0.9rem"><?php echo esc_html( $address ); ?><br><?php echo esc_html( $city_state_zip ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.9rem"},"spacing":{"margin":{"top":"var:preset|spacing|20"}}},"textColor":"secondary"} -->
<p class="has-secondary-color has-text-color" style="margin-top:var(--wp--preset--spacing--20);font-size:0.9rem"><?php echo esc_html( $phone ); ?><br><?php echo esc_html( $email ); ?></p>
<!-- /wp:paragraph -->

</div>
<!-- /wp:column -->

<!-- wp:column {"width":"30%"} -->
<div class="wp-block-column" style="flex-basis:30%">

<!-- wp:heading {"level":4,"style":{"typography":{"fontSize":"0.875rem","fontWeight":"600","textTransform":"uppercase","letterSpacing":"0.05em"}},"textColor":"background"} -->
<h4 class="wp-block-heading has-background-color has-text-color" style="font-size:0.875rem;font-weight:600;letter-spacing:0.05em;text-transform:uppercase">Hours</h4>
<!-- /wp:heading -->

<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.9rem"},"spacing":{"margin":{"top":"var:preset|spacing|30"}}},"textColor":"secondary"} -->
<p class="has-secondary-color has-text-color" style="margin-top:var(--wp--preset--spacing--30);font-size:0.9rem"><?php echo esc_html( $hours_weekday ); ?><br><?php echo esc_html( $hours_weekend ); ?></p>
<!-- /wp:paragraph -->

</div>
<!-- /wp:column -->

</div>
<!-- /wp:columns -->

<!-- wp:separator {"style":{"spacing":{"margin":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|40"}}},"backgroundColor":"secondary","className":"is-style-wide"} -->
<hr class="wp-block-separator has-text-color has-secondary-color has-alpha-channel-opacity has-secondary-background-color has-background is-style-wide" style="margin-top:var(--wp--preset--spacing--60);margin-bottom:var(--wp--preset--spacing--40)"/>
<!-- /wp:separator -->

<!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"space-between"}} -->
<div class="wp-block-group">

<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.8rem"}},"textColor":"secondary"} -->
<p class="has-secondary-color has-text-color" style="font-size:0.8rem">© <?php echo esc_html( $current_year ); ?> <?php echo esc_html( $business_name ); ?>. All rights reserved.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.8rem"}},"textColor":"secondary"} -->
<p class="has-secondary-color has-text-color" style="font-size:0.8rem">Powered by <a href="https://presspilot.io" style="color: inherit;">PressPilot</a></p>
<!-- /wp:paragraph -->

</div>
<!-- /wp:group -->

</div>
<!-- /wp:group -->
