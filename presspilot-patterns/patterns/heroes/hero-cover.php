<?php
/**
 * Pattern: Hero Cover
 * 
 * Full-width background image with centered text overlay and CTA buttons.
 * 
 * @package PressPilot
 */

$headline         = presspilot_string( 'headline', 'Welcome to Our Business' );
$subheadline      = presspilot_string( 'subheadline', 'We provide exceptional service and quality that you can trust.' );
$button_primary   = presspilot_string( 'button-primary', 'Get Started' );
$button_secondary = presspilot_string( 'button-secondary', 'Learn More' );
$background_image = presspilot_image( 'background', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1920' );
?>
<!-- wp:cover {"url":"<?php echo esc_url( $background_image ); ?>","dimRatio":60,"overlayColor":"foreground","isUserOverlayColor":true,"minHeight":80,"minHeightUnit":"vh","align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|80","bottom":"var:preset|spacing|80","left":"var:preset|spacing|50","right":"var:preset|spacing|50"}}}} -->
<div class="wp-block-cover alignfull" style="padding-top:var(--wp--preset--spacing--80);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--80);padding-left:var(--wp--preset--spacing--50);min-height:80vh">
<span aria-hidden="true" class="wp-block-cover__background has-foreground-background-color has-background-dim-60 has-background-dim"></span>
<img class="wp-block-cover__image-background" alt="" src="<?php echo esc_url( $background_image ); ?>" data-object-fit="cover"/>

<div class="wp-block-cover__inner-container">

<!-- wp:group {"layout":{"type":"constrained","contentSize":"800px"}} -->
<div class="wp-block-group">

<!-- wp:heading {"textAlign":"center","level":1,"style":{"typography":{"fontSize":"3.5rem","fontWeight":"700","lineHeight":"1.1"}},"textColor":"background"} -->
<h1 class="wp-block-heading has-text-align-center has-background-color has-text-color" style="font-size:3.5rem;font-weight:700;line-height:1.1"><?php echo esc_html( $headline ); ?></h1>
<!-- /wp:heading -->

<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"1.25rem","lineHeight":"1.6"}},"textColor":"background"} -->
<p class="has-text-align-center has-background-color has-text-color" style="font-size:1.25rem;line-height:1.6"><?php echo esc_html( $subheadline ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"margin":{"top":"var:preset|spacing|50"}}}} -->
<div class="wp-block-buttons" style="margin-top:var(--wp--preset--spacing--50)">

<!-- wp:button {"backgroundColor":"primary","textColor":"background","style":{"border":{"radius":"4px"},"spacing":{"padding":{"top":"0.875rem","bottom":"0.875rem","left":"2rem","right":"2rem"}}}} -->
<div class="wp-block-button"><a class="wp-block-button__link has-background-color has-primary-background-color has-text-color has-background wp-element-button" style="border-radius:4px;padding-top:0.875rem;padding-right:2rem;padding-bottom:0.875rem;padding-left:2rem"><?php echo esc_html( $button_primary ); ?></a></div>
<!-- /wp:button -->

<!-- wp:button {"backgroundColor":"transparent","textColor":"background","style":{"border":{"radius":"4px","width":"2px"},"spacing":{"padding":{"top":"0.875rem","bottom":"0.875rem","left":"2rem","right":"2rem"}}},"borderColor":"background"} -->
<div class="wp-block-button"><a class="wp-block-button__link has-background-color has-transparent-background-color has-text-color has-background has-border-color has-background-border-color wp-element-button" style="border-width:2px;border-radius:4px;padding-top:0.875rem;padding-right:2rem;padding-bottom:0.875rem;padding-left:2rem"><?php echo esc_html( $button_secondary ); ?></a></div>
<!-- /wp:button -->

</div>
<!-- /wp:buttons -->

</div>
<!-- /wp:group -->

</div>
</div>
<!-- /wp:cover -->
