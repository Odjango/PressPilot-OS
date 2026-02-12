<?php
/**
 * Pattern: E-Commerce Product Categories
 * 
 * Grid of product category cards with images.
 * 
 * @package PressPilot
 */

$section_title  = presspilot_string( 'section-title', 'Shop by Category' );
$category_1_name = presspilot_string( 'category-1-name', 'New Arrivals' );
$category_2_name = presspilot_string( 'category-2-name', 'Best Sellers' );
$category_3_name = presspilot_string( 'category-3-name', 'Sale Items' );
$category_4_name = presspilot_string( 'category-4-name', 'Collections' );

$category_1_image = presspilot_image( 'category-1-image', 'https://images.pexels.com/photos/5632399/pexels-photo-5632399.jpeg?auto=compress&cs=tinysrgb&w=400' );
$category_2_image = presspilot_image( 'category-2-image', 'https://images.pexels.com/photos/5632397/pexels-photo-5632397.jpeg?auto=compress&cs=tinysrgb&w=400' );
$category_3_image = presspilot_image( 'category-3-image', 'https://images.pexels.com/photos/5632398/pexels-photo-5632398.jpeg?auto=compress&cs=tinysrgb&w=400' );
$category_4_image = presspilot_image( 'category-4-image', 'https://images.pexels.com/photos/5632400/pexels-photo-5632400.jpeg?auto=compress&cs=tinysrgb&w=400' );
?>
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|80","bottom":"var:preset|spacing|80","left":"var:preset|spacing|50","right":"var:preset|spacing|50"}}},"backgroundColor":"background","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-background-background-color has-background" style="padding-top:var(--wp--preset--spacing--80);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--80);padding-left:var(--wp--preset--spacing--50)">

<!-- wp:heading {"textAlign":"center","style":{"typography":{"fontSize":"2.25rem","fontWeight":"700"},"spacing":{"margin":{"bottom":"var:preset|spacing|60"}}},"textColor":"foreground"} -->
<h2 class="wp-block-heading has-text-align-center has-foreground-color has-text-color" style="margin-bottom:var(--wp--preset--spacing--60);font-size:2.25rem;font-weight:700"><?php echo esc_html( $section_title ); ?></h2>
<!-- /wp:heading -->

<!-- wp:columns {"style":{"spacing":{"blockGap":{"left":"var:preset|spacing|40"}}}} -->
<div class="wp-block-columns">

<!-- wp:column -->
<div class="wp-block-column">
<!-- wp:group {"style":{"spacing":{"padding":{"top":"0","bottom":"0","left":"0","right":"0"}},"border":{"radius":"12px"},"position":{"type":""}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group" style="border-radius:12px;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0">

<!-- wp:cover {"url":"<?php echo esc_url( $category_1_image ); ?>","dimRatio":40,"overlayColor":"foreground","isUserOverlayColor":true,"minHeight":280,"style":{"border":{"radius":"12px"}}} -->
<div class="wp-block-cover" style="border-radius:12px;min-height:280px">
<span aria-hidden="true" class="wp-block-cover__background has-foreground-background-color has-background-dim-40 has-background-dim"></span>
<img class="wp-block-cover__image-background" alt="" src="<?php echo esc_url( $category_1_image ); ?>" data-object-fit="cover"/>
<div class="wp-block-cover__inner-container">

<!-- wp:heading {"textAlign":"center","level":3,"style":{"typography":{"fontSize":"1.25rem","fontWeight":"600"}},"textColor":"background"} -->
<h3 class="wp-block-heading has-text-align-center has-background-color has-text-color" style="font-size:1.25rem;font-weight:600"><?php echo esc_html( $category_1_name ); ?></h3>
<!-- /wp:heading -->

</div>
</div>
<!-- /wp:cover -->

</div>
<!-- /wp:group -->
</div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column">
<!-- wp:group {"style":{"spacing":{"padding":{"top":"0","bottom":"0","left":"0","right":"0"}},"border":{"radius":"12px"}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group" style="border-radius:12px;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0">

<!-- wp:cover {"url":"<?php echo esc_url( $category_2_image ); ?>","dimRatio":40,"overlayColor":"foreground","isUserOverlayColor":true,"minHeight":280,"style":{"border":{"radius":"12px"}}} -->
<div class="wp-block-cover" style="border-radius:12px;min-height:280px">
<span aria-hidden="true" class="wp-block-cover__background has-foreground-background-color has-background-dim-40 has-background-dim"></span>
<img class="wp-block-cover__image-background" alt="" src="<?php echo esc_url( $category_2_image ); ?>" data-object-fit="cover"/>
<div class="wp-block-cover__inner-container">

<!-- wp:heading {"textAlign":"center","level":3,"style":{"typography":{"fontSize":"1.25rem","fontWeight":"600"}},"textColor":"background"} -->
<h3 class="wp-block-heading has-text-align-center has-background-color has-text-color" style="font-size:1.25rem;font-weight:600"><?php echo esc_html( $category_2_name ); ?></h3>
<!-- /wp:heading -->

</div>
</div>
<!-- /wp:cover -->

</div>
<!-- /wp:group -->
</div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column">
<!-- wp:group {"style":{"spacing":{"padding":{"top":"0","bottom":"0","left":"0","right":"0"}},"border":{"radius":"12px"}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group" style="border-radius:12px;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0">

<!-- wp:cover {"url":"<?php echo esc_url( $category_3_image ); ?>","dimRatio":40,"overlayColor":"foreground","isUserOverlayColor":true,"minHeight":280,"style":{"border":{"radius":"12px"}}} -->
<div class="wp-block-cover" style="border-radius:12px;min-height:280px">
<span aria-hidden="true" class="wp-block-cover__background has-foreground-background-color has-background-dim-40 has-background-dim"></span>
<img class="wp-block-cover__image-background" alt="" src="<?php echo esc_url( $category_3_image ); ?>" data-object-fit="cover"/>
<div class="wp-block-cover__inner-container">

<!-- wp:heading {"textAlign":"center","level":3,"style":{"typography":{"fontSize":"1.25rem","fontWeight":"600"}},"textColor":"background"} -->
<h3 class="wp-block-heading has-text-align-center has-background-color has-text-color" style="font-size:1.25rem;font-weight:600"><?php echo esc_html( $category_3_name ); ?></h3>
<!-- /wp:heading -->

</div>
</div>
<!-- /wp:cover -->

</div>
<!-- /wp:group -->
</div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column">
<!-- wp:group {"style":{"spacing":{"padding":{"top":"0","bottom":"0","left":"0","right":"0"}},"border":{"radius":"12px"}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group" style="border-radius:12px;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0">

<!-- wp:cover {"url":"<?php echo esc_url( $category_4_image ); ?>","dimRatio":40,"overlayColor":"foreground","isUserOverlayColor":true,"minHeight":280,"style":{"border":{"radius":"12px"}}} -->
<div class="wp-block-cover" style="border-radius:12px;min-height:280px">
<span aria-hidden="true" class="wp-block-cover__background has-foreground-background-color has-background-dim-40 has-background-dim"></span>
<img class="wp-block-cover__image-background" alt="" src="<?php echo esc_url( $category_4_image ); ?>" data-object-fit="cover"/>
<div class="wp-block-cover__inner-container">

<!-- wp:heading {"textAlign":"center","level":3,"style":{"typography":{"fontSize":"1.25rem","fontWeight":"600"}},"textColor":"background"} -->
<h3 class="wp-block-heading has-text-align-center has-background-color has-text-color" style="font-size:1.25rem;font-weight:600"><?php echo esc_html( $category_4_name ); ?></h3>
<!-- /wp:heading -->

</div>
</div>
<!-- /wp:cover -->

</div>
<!-- /wp:group -->
</div>
<!-- /wp:column -->

</div>
<!-- /wp:columns -->

</div>
<!-- /wp:group -->
