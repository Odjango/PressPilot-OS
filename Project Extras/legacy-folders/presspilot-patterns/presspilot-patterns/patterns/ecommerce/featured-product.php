<?php
/**
 * Pattern: E-Commerce Featured Product Hero
 * 
 * Hero section highlighting a single featured product.
 * 
 * @package PressPilot
 */

$headline      = presspilot_string( 'headline', 'Introducing Our Bestseller' );
$description   = presspilot_string( 'description', 'Discover why customers love this product. Premium quality, exceptional value, and satisfaction guaranteed.' );
$button_text   = presspilot_string( 'button-text', 'Shop Now' );
$product_image = presspilot_image( 'product-image', 'https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=600' );
?>
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|80","bottom":"var:preset|spacing|80","left":"var:preset|spacing|50","right":"var:preset|spacing|50"}}},"backgroundColor":"tertiary","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-tertiary-background-color has-background" style="padding-top:var(--wp--preset--spacing--80);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--80);padding-left:var(--wp--preset--spacing--50)">

<!-- wp:columns {"verticalAlignment":"center","style":{"spacing":{"blockGap":{"left":"var:preset|spacing|70"}}}} -->
<div class="wp-block-columns are-vertically-aligned-center">

<!-- wp:column {"verticalAlignment":"center","width":"50%"} -->
<div class="wp-block-column is-vertically-aligned-center" style="flex-basis:50%">

<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.875rem","textTransform":"uppercase","letterSpacing":"0.1em","fontWeight":"600"}},"textColor":"primary"} -->
<p class="has-primary-color has-text-color" style="font-size:0.875rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase">Featured Product</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":1,"style":{"typography":{"fontSize":"2.75rem","fontWeight":"700","lineHeight":"1.2"},"spacing":{"margin":{"top":"var:preset|spacing|30"}}},"textColor":"foreground"} -->
<h1 class="wp-block-heading has-foreground-color has-text-color" style="margin-top:var(--wp--preset--spacing--30);font-size:2.75rem;font-weight:700;line-height:1.2"><?php echo esc_html( $headline ); ?></h1>
<!-- /wp:heading -->

<!-- wp:paragraph {"style":{"typography":{"fontSize":"1.125rem","lineHeight":"1.7"},"spacing":{"margin":{"top":"var:preset|spacing|40"}}},"textColor":"secondary"} -->
<p class="has-secondary-color has-text-color" style="margin-top:var(--wp--preset--spacing--40);font-size:1.125rem;line-height:1.7"><?php echo esc_html( $description ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:buttons {"style":{"spacing":{"margin":{"top":"var:preset|spacing|50"}}}} -->
<div class="wp-block-buttons" style="margin-top:var(--wp--preset--spacing--50)">

<!-- wp:button {"backgroundColor":"primary","textColor":"background","style":{"border":{"radius":"4px"},"spacing":{"padding":{"top":"1rem","bottom":"1rem","left":"2rem","right":"2rem"}}}} -->
<div class="wp-block-button"><a class="wp-block-button__link has-background-color has-primary-background-color has-text-color has-background wp-element-button" style="border-radius:4px;padding-top:1rem;padding-right:2rem;padding-bottom:1rem;padding-left:2rem"><?php echo esc_html( $button_text ); ?></a></div>
<!-- /wp:button -->

</div>
<!-- /wp:buttons -->

</div>
<!-- /wp:column -->

<!-- wp:column {"verticalAlignment":"center","width":"50%"} -->
<div class="wp-block-column is-vertically-aligned-center" style="flex-basis:50%">

<!-- wp:image {"sizeSlug":"large","linkDestination":"none","style":{"border":{"radius":"12px"}}} -->
<figure class="wp-block-image size-large has-custom-border"><img src="<?php echo esc_url( $product_image ); ?>" alt="" style="border-radius:12px"/></figure>
<!-- /wp:image -->

</div>
<!-- /wp:column -->

</div>
<!-- /wp:columns -->

</div>
<!-- /wp:group -->
