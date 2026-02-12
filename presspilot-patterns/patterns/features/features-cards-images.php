<?php
/**
 * Pattern: Feature Cards with Images
 * 
 * 3 column cards with images, titles, and descriptions.
 * 
 * @package PressPilot
 */

$section_title = presspilot_string( 'section-title', 'What We Offer' );

$card_1_title = presspilot_string( 'card-1-title', 'Premium Quality' );
$card_1_desc  = presspilot_string( 'card-1-desc', 'We source only the finest materials and ingredients to ensure exceptional quality in everything we deliver.' );
$card_1_image = presspilot_image( 'card-1-image', 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400' );

$card_2_title = presspilot_string( 'card-2-title', 'Expert Service' );
$card_2_desc  = presspilot_string( 'card-2-desc', 'Our experienced team brings years of expertise to deliver personalized service that exceeds expectations.' );
$card_2_image = presspilot_image( 'card-2-image', 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=400' );

$card_3_title = presspilot_string( 'card-3-title', 'Customer First' );
$card_3_desc  = presspilot_string( 'card-3-desc', 'Your satisfaction is our priority. We go above and beyond to ensure you have the best experience possible.' );
$card_3_image = presspilot_image( 'card-3-image', 'https://images.pexels.com/photos/3184293/pexels-photo-3184293.jpeg?auto=compress&cs=tinysrgb&w=400' );
?>
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|80","bottom":"var:preset|spacing|80","left":"var:preset|spacing|50","right":"var:preset|spacing|50"}}},"backgroundColor":"background","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-background-background-color has-background" style="padding-top:var(--wp--preset--spacing--80);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--80);padding-left:var(--wp--preset--spacing--50)">

<!-- wp:heading {"textAlign":"center","style":{"typography":{"fontSize":"2.25rem","fontWeight":"700"},"spacing":{"margin":{"bottom":"var:preset|spacing|60"}}},"textColor":"foreground"} -->
<h2 class="wp-block-heading has-text-align-center has-foreground-color has-text-color" style="margin-bottom:var(--wp--preset--spacing--60);font-size:2.25rem;font-weight:700"><?php echo esc_html( $section_title ); ?></h2>
<!-- /wp:heading -->

<!-- wp:columns {"style":{"spacing":{"blockGap":{"left":"var:preset|spacing|50"}}}} -->
<div class="wp-block-columns">

<!-- wp:column -->
<div class="wp-block-column">
<!-- wp:group {"style":{"border":{"radius":"12px"},"spacing":{"padding":{"top":"0","bottom":"var:preset|spacing|50","left":"0","right":"0"}}},"backgroundColor":"tertiary","layout":{"type":"constrained"}} -->
<div class="wp-block-group has-tertiary-background-color has-background" style="border-radius:12px;padding-top:0;padding-right:0;padding-bottom:var(--wp--preset--spacing--50);padding-left:0">

<!-- wp:image {"sizeSlug":"large","linkDestination":"none","style":{"border":{"radius":{"topLeft":"12px","topRight":"12px"}}}} -->
<figure class="wp-block-image size-large"><img src="<?php echo esc_url( $card_1_image ); ?>" alt="" style="border-top-left-radius:12px;border-top-right-radius:12px"/></figure>
<!-- /wp:image -->

<!-- wp:group {"style":{"spacing":{"padding":{"left":"var:preset|spacing|50","right":"var:preset|spacing|50","top":"var:preset|spacing|40"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group" style="padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--50);padding-left:var(--wp--preset--spacing--50)">

<!-- wp:heading {"level":3,"style":{"typography":{"fontSize":"1.25rem","fontWeight":"600"}},"textColor":"foreground"} -->
<h3 class="wp-block-heading has-foreground-color has-text-color" style="font-size:1.25rem;font-weight:600"><?php echo esc_html( $card_1_title ); ?></h3>
<!-- /wp:heading -->

<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.9375rem","lineHeight":"1.7"},"spacing":{"margin":{"top":"var:preset|spacing|30"}}},"textColor":"secondary"} -->
<p class="has-secondary-color has-text-color" style="margin-top:var(--wp--preset--spacing--30);font-size:0.9375rem;line-height:1.7"><?php echo esc_html( $card_1_desc ); ?></p>
<!-- /wp:paragraph -->

</div>
<!-- /wp:group -->

</div>
<!-- /wp:group -->
</div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column">
<!-- wp:group {"style":{"border":{"radius":"12px"},"spacing":{"padding":{"top":"0","bottom":"var:preset|spacing|50","left":"0","right":"0"}}},"backgroundColor":"tertiary","layout":{"type":"constrained"}} -->
<div class="wp-block-group has-tertiary-background-color has-background" style="border-radius:12px;padding-top:0;padding-right:0;padding-bottom:var(--wp--preset--spacing--50);padding-left:0">

<!-- wp:image {"sizeSlug":"large","linkDestination":"none","style":{"border":{"radius":{"topLeft":"12px","topRight":"12px"}}}} -->
<figure class="wp-block-image size-large"><img src="<?php echo esc_url( $card_2_image ); ?>" alt="" style="border-top-left-radius:12px;border-top-right-radius:12px"/></figure>
<!-- /wp:image -->

<!-- wp:group {"style":{"spacing":{"padding":{"left":"var:preset|spacing|50","right":"var:preset|spacing|50","top":"var:preset|spacing|40"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group" style="padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--50);padding-left:var(--wp--preset--spacing--50)">

<!-- wp:heading {"level":3,"style":{"typography":{"fontSize":"1.25rem","fontWeight":"600"}},"textColor":"foreground"} -->
<h3 class="wp-block-heading has-foreground-color has-text-color" style="font-size:1.25rem;font-weight:600"><?php echo esc_html( $card_2_title ); ?></h3>
<!-- /wp:heading -->

<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.9375rem","lineHeight":"1.7"},"spacing":{"margin":{"top":"var:preset|spacing|30"}}},"textColor":"secondary"} -->
<p class="has-secondary-color has-text-color" style="margin-top:var(--wp--preset--spacing--30);font-size:0.9375rem;line-height:1.7"><?php echo esc_html( $card_2_desc ); ?></p>
<!-- /wp:paragraph -->

</div>
<!-- /wp:group -->

</div>
<!-- /wp:group -->
</div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column">
<!-- wp:group {"style":{"border":{"radius":"12px"},"spacing":{"padding":{"top":"0","bottom":"var:preset|spacing|50","left":"0","right":"0"}}},"backgroundColor":"tertiary","layout":{"type":"constrained"}} -->
<div class="wp-block-group has-tertiary-background-color has-background" style="border-radius:12px;padding-top:0;padding-right:0;padding-bottom:var(--wp--preset--spacing--50);padding-left:0">

<!-- wp:image {"sizeSlug":"large","linkDestination":"none","style":{"border":{"radius":{"topLeft":"12px","topRight":"12px"}}}} -->
<figure class="wp-block-image size-large"><img src="<?php echo esc_url( $card_3_image ); ?>" alt="" style="border-top-left-radius:12px;border-top-right-radius:12px"/></figure>
<!-- /wp:image -->

<!-- wp:group {"style":{"spacing":{"padding":{"left":"var:preset|spacing|50","right":"var:preset|spacing|50","top":"var:preset|spacing|40"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group" style="padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--50);padding-left:var(--wp--preset--spacing--50)">

<!-- wp:heading {"level":3,"style":{"typography":{"fontSize":"1.25rem","fontWeight":"600"}},"textColor":"foreground"} -->
<h3 class="wp-block-heading has-foreground-color has-text-color" style="font-size:1.25rem;font-weight:600"><?php echo esc_html( $card_3_title ); ?></h3>
<!-- /wp:heading -->

<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.9375rem","lineHeight":"1.7"},"spacing":{"margin":{"top":"var:preset|spacing|30"}}},"textColor":"secondary"} -->
<p class="has-secondary-color has-text-color" style="margin-top:var(--wp--preset--spacing--30);font-size:0.9375rem;line-height:1.7"><?php echo esc_html( $card_3_desc ); ?></p>
<!-- /wp:paragraph -->

</div>
<!-- /wp:group -->

</div>
<!-- /wp:group -->
</div>
<!-- /wp:column -->

</div>
<!-- /wp:columns -->

</div>
<!-- /wp:group -->
