<?php
/**
 * Pattern: E-Commerce Sale Banner
 * 
 * Promotional banner for sales and special offers.
 * 
 * @package PressPilot
 */

$headline     = presspilot_string( 'headline', 'Summer Sale' );
$discount     = presspilot_string( 'discount', 'Up to 50% Off' );
$description  = presspilot_string( 'description', 'Limited time offer on selected items. Don\'t miss out on these incredible savings!' );
$button_text  = presspilot_string( 'button-text', 'Shop the Sale' );
$banner_image = presspilot_image( 'banner-image', 'https://images.pexels.com/photos/5632381/pexels-photo-5632381.jpeg?auto=compress&cs=tinysrgb&w=1920' );
?>
<!-- wp:cover {"url":"<?php echo esc_url( $banner_image ); ?>","dimRatio":70,"overlayColor":"primary","isUserOverlayColor":true,"minHeight":400,"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|70","bottom":"var:preset|spacing|70","left":"var:preset|spacing|50","right":"var:preset|spacing|50"}}}} -->
<div class="wp-block-cover alignfull" style="padding-top:var(--wp--preset--spacing--70);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--70);padding-left:var(--wp--preset--spacing--50);min-height:400px">
<span aria-hidden="true" class="wp-block-cover__background has-primary-background-color has-background-dim-70 has-background-dim"></span>
<img class="wp-block-cover__image-background" alt="" src="<?php echo esc_url( $banner_image ); ?>" data-object-fit="cover"/>

<div class="wp-block-cover__inner-container">

<!-- wp:group {"layout":{"type":"constrained","contentSize":"700px"}} -->
<div class="wp-block-group">

<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"1rem","textTransform":"uppercase","letterSpacing":"0.15em","fontWeight":"600"}},"textColor":"background"} -->
<p class="has-text-align-center has-background-color has-text-color" style="font-size:1rem;font-weight:600;letter-spacing:0.15em;text-transform:uppercase"><?php echo esc_html( $headline ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:heading {"textAlign":"center","level":2,"style":{"typography":{"fontSize":"3.5rem","fontWeight":"800","lineHeight":"1.1"},"spacing":{"margin":{"top":"var:preset|spacing|30"}}},"textColor":"background"} -->
<h2 class="wp-block-heading has-text-align-center has-background-color has-text-color" style="margin-top:var(--wp--preset--spacing--30);font-size:3.5rem;font-weight:800;line-height:1.1"><?php echo esc_html( $discount ); ?></h2>
<!-- /wp:heading -->

<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"1.125rem"},"spacing":{"margin":{"top":"var:preset|spacing|40"}}},"textColor":"background"} -->
<p class="has-text-align-center has-background-color has-text-color" style="margin-top:var(--wp--preset--spacing--40);font-size:1.125rem"><?php echo esc_html( $description ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"margin":{"top":"var:preset|spacing|50"}}}} -->
<div class="wp-block-buttons" style="margin-top:var(--wp--preset--spacing--50)">

<!-- wp:button {"backgroundColor":"background","textColor":"primary","style":{"border":{"radius":"4px"},"spacing":{"padding":{"top":"1rem","bottom":"1rem","left":"2.5rem","right":"2.5rem"}},"typography":{"fontWeight":"600"}}} -->
<div class="wp-block-button"><a class="wp-block-button__link has-primary-color has-background-background-color has-text-color has-background wp-element-button" style="border-radius:4px;padding-top:1rem;padding-right:2.5rem;padding-bottom:1rem;padding-left:2.5rem;font-weight:600"><?php echo esc_html( $button_text ); ?></a></div>
<!-- /wp:button -->

</div>
<!-- /wp:buttons -->

</div>
<!-- /wp:group -->

</div>
</div>
<!-- /wp:cover -->
