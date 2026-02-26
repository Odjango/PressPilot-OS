<?php
/**
 * Pattern: Testimonials Grid
 * 
 * 3 column grid of customer testimonials with quotes and names.
 * 
 * @package PressPilot
 */

$section_title = presspilot_string( 'section-title', 'What Our Customers Say' );

$testimonial_1_quote = presspilot_string( 'testimonial-1-quote', 'Absolutely amazing experience! The quality exceeded my expectations and the service was impeccable.' );
$testimonial_1_name  = presspilot_string( 'testimonial-1-name', 'Sarah Johnson' );
$testimonial_1_role  = presspilot_string( 'testimonial-1-role', 'Local Customer' );

$testimonial_2_quote = presspilot_string( 'testimonial-2-quote', 'I\'ve been coming here for years and they never disappoint. Highly recommend to anyone looking for quality.' );
$testimonial_2_name  = presspilot_string( 'testimonial-2-name', 'Michael Chen' );
$testimonial_2_role  = presspilot_string( 'testimonial-2-role', 'Regular Customer' );

$testimonial_3_quote = presspilot_string( 'testimonial-3-quote', 'The best in town, hands down. Professional, friendly, and always delivers excellence.' );
$testimonial_3_name  = presspilot_string( 'testimonial-3-name', 'Emily Rodriguez' );
$testimonial_3_role  = presspilot_string( 'testimonial-3-role', 'Happy Customer' );
?>
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|80","bottom":"var:preset|spacing|80","left":"var:preset|spacing|50","right":"var:preset|spacing|50"}}},"backgroundColor":"tertiary","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-tertiary-background-color has-background" style="padding-top:var(--wp--preset--spacing--80);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--80);padding-left:var(--wp--preset--spacing--50)">

<!-- wp:heading {"textAlign":"center","style":{"typography":{"fontSize":"2.25rem","fontWeight":"700"},"spacing":{"margin":{"bottom":"var:preset|spacing|60"}}},"textColor":"foreground"} -->
<h2 class="wp-block-heading has-text-align-center has-foreground-color has-text-color" style="margin-bottom:var(--wp--preset--spacing--60);font-size:2.25rem;font-weight:700"><?php echo esc_html( $section_title ); ?></h2>
<!-- /wp:heading -->

<!-- wp:columns {"style":{"spacing":{"blockGap":{"left":"var:preset|spacing|50"}}}} -->
<div class="wp-block-columns">

<!-- wp:column -->
<div class="wp-block-column">
<!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50","left":"var:preset|spacing|50","right":"var:preset|spacing|50"}},"border":{"radius":"8px"}},"backgroundColor":"background","layout":{"type":"constrained"}} -->
<div class="wp-block-group has-background-background-color has-background" style="border-radius:8px;padding-top:var(--wp--preset--spacing--50);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--50);padding-left:var(--wp--preset--spacing--50)">

<!-- wp:paragraph {"style":{"typography":{"fontSize":"2rem","lineHeight":"1"}},"textColor":"primary"} -->
<p class="has-primary-color has-text-color" style="font-size:2rem;line-height:1">"</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"typography":{"fontSize":"1rem","lineHeight":"1.7","fontStyle":"italic"}},"textColor":"foreground"} -->
<p class="has-foreground-color has-text-color" style="font-size:1rem;font-style:italic;line-height:1.7"><?php echo esc_html( $testimonial_1_quote ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:group {"style":{"spacing":{"margin":{"top":"var:preset|spacing|40"}}},"layout":{"type":"flex","flexWrap":"nowrap"}} -->
<div class="wp-block-group" style="margin-top:var(--wp--preset--spacing--40)">

<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group">

<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.9rem","fontWeight":"600"}},"textColor":"foreground"} -->
<p class="has-foreground-color has-text-color" style="font-size:0.9rem;font-weight:600"><?php echo esc_html( $testimonial_1_name ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.8rem"},"spacing":{"margin":{"top":"0"}}},"textColor":"secondary"} -->
<p class="has-secondary-color has-text-color" style="margin-top:0;font-size:0.8rem"><?php echo esc_html( $testimonial_1_role ); ?></p>
<!-- /wp:paragraph -->

</div>
<!-- /wp:group -->

</div>
<!-- /wp:group -->

</div>
<!-- /wp:group -->
</div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column">
<!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50","left":"var:preset|spacing|50","right":"var:preset|spacing|50"}},"border":{"radius":"8px"}},"backgroundColor":"background","layout":{"type":"constrained"}} -->
<div class="wp-block-group has-background-background-color has-background" style="border-radius:8px;padding-top:var(--wp--preset--spacing--50);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--50);padding-left:var(--wp--preset--spacing--50)">

<!-- wp:paragraph {"style":{"typography":{"fontSize":"2rem","lineHeight":"1"}},"textColor":"primary"} -->
<p class="has-primary-color has-text-color" style="font-size:2rem;line-height:1">"</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"typography":{"fontSize":"1rem","lineHeight":"1.7","fontStyle":"italic"}},"textColor":"foreground"} -->
<p class="has-foreground-color has-text-color" style="font-size:1rem;font-style:italic;line-height:1.7"><?php echo esc_html( $testimonial_2_quote ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:group {"style":{"spacing":{"margin":{"top":"var:preset|spacing|40"}}},"layout":{"type":"flex","flexWrap":"nowrap"}} -->
<div class="wp-block-group" style="margin-top:var(--wp--preset--spacing--40)">

<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group">

<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.9rem","fontWeight":"600"}},"textColor":"foreground"} -->
<p class="has-foreground-color has-text-color" style="font-size:0.9rem;font-weight:600"><?php echo esc_html( $testimonial_2_name ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.8rem"},"spacing":{"margin":{"top":"0"}}},"textColor":"secondary"} -->
<p class="has-secondary-color has-text-color" style="margin-top:0;font-size:0.8rem"><?php echo esc_html( $testimonial_2_role ); ?></p>
<!-- /wp:paragraph -->

</div>
<!-- /wp:group -->

</div>
<!-- /wp:group -->

</div>
<!-- /wp:group -->
</div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column">
<!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50","left":"var:preset|spacing|50","right":"var:preset|spacing|50"}},"border":{"radius":"8px"}},"backgroundColor":"background","layout":{"type":"constrained"}} -->
<div class="wp-block-group has-background-background-color has-background" style="border-radius:8px;padding-top:var(--wp--preset--spacing--50);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--50);padding-left:var(--wp--preset--spacing--50)">

<!-- wp:paragraph {"style":{"typography":{"fontSize":"2rem","lineHeight":"1"}},"textColor":"primary"} -->
<p class="has-primary-color has-text-color" style="font-size:2rem;line-height:1">"</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"typography":{"fontSize":"1rem","lineHeight":"1.7","fontStyle":"italic"}},"textColor":"foreground"} -->
<p class="has-foreground-color has-text-color" style="font-size:1rem;font-style:italic;line-height:1.7"><?php echo esc_html( $testimonial_3_quote ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:group {"style":{"spacing":{"margin":{"top":"var:preset|spacing|40"}}},"layout":{"type":"flex","flexWrap":"nowrap"}} -->
<div class="wp-block-group" style="margin-top:var(--wp--preset--spacing--40)">

<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group">

<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.9rem","fontWeight":"600"}},"textColor":"foreground"} -->
<p class="has-foreground-color has-text-color" style="font-size:0.9rem;font-weight:600"><?php echo esc_html( $testimonial_3_name ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.8rem"},"spacing":{"margin":{"top":"0"}}},"textColor":"secondary"} -->
<p class="has-secondary-color has-text-color" style="margin-top:0;font-size:0.8rem"><?php echo esc_html( $testimonial_3_role ); ?></p>
<!-- /wp:paragraph -->

</div>
<!-- /wp:group -->

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
