<?php
/**
 * Pattern: Restaurant Menu
 * 
 * Food menu with categories, items, descriptions, and prices.
 * 
 * @package PressPilot
 */

$section_title = presspilot_string( 'section-title', 'Our Menu' );

// Category 1 - Appetizers
$category_1_name = presspilot_string( 'category-1-name', 'Appetizers' );
$item_1_1_name   = presspilot_string( 'item-1-1-name', 'Bruschetta' );
$item_1_1_desc   = presspilot_string( 'item-1-1-desc', 'Toasted bread topped with fresh tomatoes, basil, and garlic' );
$item_1_1_price  = presspilot_string( 'item-1-1-price', '$9' );
$item_1_2_name   = presspilot_string( 'item-1-2-name', 'Calamari' );
$item_1_2_desc   = presspilot_string( 'item-1-2-desc', 'Crispy fried squid rings with marinara sauce' );
$item_1_2_price  = presspilot_string( 'item-1-2-price', '$14' );
$item_1_3_name   = presspilot_string( 'item-1-3-name', 'Caprese Salad' );
$item_1_3_desc   = presspilot_string( 'item-1-3-desc', 'Fresh mozzarella, tomatoes, and basil with balsamic glaze' );
$item_1_3_price  = presspilot_string( 'item-1-3-price', '$12' );

// Category 2 - Main Courses
$category_2_name = presspilot_string( 'category-2-name', 'Main Courses' );
$item_2_1_name   = presspilot_string( 'item-2-1-name', 'Margherita Pizza' );
$item_2_1_desc   = presspilot_string( 'item-2-1-desc', 'San Marzano tomatoes, fresh mozzarella, basil' );
$item_2_1_price  = presspilot_string( 'item-2-1-price', '$18' );
$item_2_2_name   = presspilot_string( 'item-2-2-name', 'Spaghetti Carbonara' );
$item_2_2_desc   = presspilot_string( 'item-2-2-desc', 'Classic Roman pasta with pancetta, egg, and pecorino' );
$item_2_2_price  = presspilot_string( 'item-2-2-price', '$22' );
$item_2_3_name   = presspilot_string( 'item-2-3-name', 'Grilled Salmon' );
$item_2_3_desc   = presspilot_string( 'item-2-3-desc', 'Fresh Atlantic salmon with lemon butter and seasonal vegetables' );
$item_2_3_price  = presspilot_string( 'item-2-3-price', '$28' );
?>
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|80","bottom":"var:preset|spacing|80","left":"var:preset|spacing|50","right":"var:preset|spacing|50"}}},"backgroundColor":"background","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-background-background-color has-background" style="padding-top:var(--wp--preset--spacing--80);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--80);padding-left:var(--wp--preset--spacing--50)">

<!-- wp:heading {"textAlign":"center","style":{"typography":{"fontSize":"2.5rem","fontWeight":"700"},"spacing":{"margin":{"bottom":"var:preset|spacing|70"}}},"textColor":"foreground"} -->
<h2 class="wp-block-heading has-text-align-center has-foreground-color has-text-color" style="margin-bottom:var(--wp--preset--spacing--70);font-size:2.5rem;font-weight:700"><?php echo esc_html( $section_title ); ?></h2>
<!-- /wp:heading -->

<!-- wp:columns {"style":{"spacing":{"blockGap":{"left":"var:preset|spacing|70"}}}} -->
<div class="wp-block-columns">

<!-- wp:column -->
<div class="wp-block-column">

<!-- wp:heading {"level":3,"style":{"typography":{"fontSize":"1.5rem","fontWeight":"600"},"spacing":{"margin":{"bottom":"var:preset|spacing|50"}}},"textColor":"primary"} -->
<h3 class="wp-block-heading has-primary-color has-text-color" style="margin-bottom:var(--wp--preset--spacing--50);font-size:1.5rem;font-weight:600"><?php echo esc_html( $category_1_name ); ?></h3>
<!-- /wp:heading -->

<!-- wp:group {"style":{"spacing":{"margin":{"bottom":"var:preset|spacing|40"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group" style="margin-bottom:var(--wp--preset--spacing--40)">
<!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"space-between"}} -->
<div class="wp-block-group">
<!-- wp:paragraph {"style":{"typography":{"fontSize":"1.125rem","fontWeight":"600"}},"textColor":"foreground"} -->
<p class="has-foreground-color has-text-color" style="font-size:1.125rem;font-weight:600"><?php echo esc_html( $item_1_1_name ); ?></p>
<!-- /wp:paragraph -->
<!-- wp:paragraph {"style":{"typography":{"fontSize":"1.125rem","fontWeight":"600"}},"textColor":"primary"} -->
<p class="has-primary-color has-text-color" style="font-size:1.125rem;font-weight:600"><?php echo esc_html( $item_1_1_price ); ?></p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:group -->
<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.9rem"},"spacing":{"margin":{"top":"var:preset|spacing|20"}}},"textColor":"secondary"} -->
<p class="has-secondary-color has-text-color" style="margin-top:var(--wp--preset--spacing--20);font-size:0.9rem"><?php echo esc_html( $item_1_1_desc ); ?></p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:group -->

<!-- wp:group {"style":{"spacing":{"margin":{"bottom":"var:preset|spacing|40"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group" style="margin-bottom:var(--wp--preset--spacing--40)">
<!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"space-between"}} -->
<div class="wp-block-group">
<!-- wp:paragraph {"style":{"typography":{"fontSize":"1.125rem","fontWeight":"600"}},"textColor":"foreground"} -->
<p class="has-foreground-color has-text-color" style="font-size:1.125rem;font-weight:600"><?php echo esc_html( $item_1_2_name ); ?></p>
<!-- /wp:paragraph -->
<!-- wp:paragraph {"style":{"typography":{"fontSize":"1.125rem","fontWeight":"600"}},"textColor":"primary"} -->
<p class="has-primary-color has-text-color" style="font-size:1.125rem;font-weight:600"><?php echo esc_html( $item_1_2_price ); ?></p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:group -->
<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.9rem"},"spacing":{"margin":{"top":"var:preset|spacing|20"}}},"textColor":"secondary"} -->
<p class="has-secondary-color has-text-color" style="margin-top:var(--wp--preset--spacing--20);font-size:0.9rem"><?php echo esc_html( $item_1_2_desc ); ?></p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:group -->

<!-- wp:group {"style":{"spacing":{"margin":{"bottom":"var:preset|spacing|40"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group" style="margin-bottom:var(--wp--preset--spacing--40)">
<!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"space-between"}} -->
<div class="wp-block-group">
<!-- wp:paragraph {"style":{"typography":{"fontSize":"1.125rem","fontWeight":"600"}},"textColor":"foreground"} -->
<p class="has-foreground-color has-text-color" style="font-size:1.125rem;font-weight:600"><?php echo esc_html( $item_1_3_name ); ?></p>
<!-- /wp:paragraph -->
<!-- wp:paragraph {"style":{"typography":{"fontSize":"1.125rem","fontWeight":"600"}},"textColor":"primary"} -->
<p class="has-primary-color has-text-color" style="font-size:1.125rem;font-weight:600"><?php echo esc_html( $item_1_3_price ); ?></p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:group -->
<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.9rem"},"spacing":{"margin":{"top":"var:preset|spacing|20"}}},"textColor":"secondary"} -->
<p class="has-secondary-color has-text-color" style="margin-top:var(--wp--preset--spacing--20);font-size:0.9rem"><?php echo esc_html( $item_1_3_desc ); ?></p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:group -->

</div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column">

<!-- wp:heading {"level":3,"style":{"typography":{"fontSize":"1.5rem","fontWeight":"600"},"spacing":{"margin":{"bottom":"var:preset|spacing|50"}}},"textColor":"primary"} -->
<h3 class="wp-block-heading has-primary-color has-text-color" style="margin-bottom:var(--wp--preset--spacing--50);font-size:1.5rem;font-weight:600"><?php echo esc_html( $category_2_name ); ?></h3>
<!-- /wp:heading -->

<!-- wp:group {"style":{"spacing":{"margin":{"bottom":"var:preset|spacing|40"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group" style="margin-bottom:var(--wp--preset--spacing--40)">
<!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"space-between"}} -->
<div class="wp-block-group">
<!-- wp:paragraph {"style":{"typography":{"fontSize":"1.125rem","fontWeight":"600"}},"textColor":"foreground"} -->
<p class="has-foreground-color has-text-color" style="font-size:1.125rem;font-weight:600"><?php echo esc_html( $item_2_1_name ); ?></p>
<!-- /wp:paragraph -->
<!-- wp:paragraph {"style":{"typography":{"fontSize":"1.125rem","fontWeight":"600"}},"textColor":"primary"} -->
<p class="has-primary-color has-text-color" style="font-size:1.125rem;font-weight:600"><?php echo esc_html( $item_2_1_price ); ?></p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:group -->
<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.9rem"},"spacing":{"margin":{"top":"var:preset|spacing|20"}}},"textColor":"secondary"} -->
<p class="has-secondary-color has-text-color" style="margin-top:var(--wp--preset--spacing--20);font-size:0.9rem"><?php echo esc_html( $item_2_1_desc ); ?></p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:group -->

<!-- wp:group {"style":{"spacing":{"margin":{"bottom":"var:preset|spacing|40"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group" style="margin-bottom:var(--wp--preset--spacing--40)">
<!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"space-between"}} -->
<div class="wp-block-group">
<!-- wp:paragraph {"style":{"typography":{"fontSize":"1.125rem","fontWeight":"600"}},"textColor":"foreground"} -->
<p class="has-foreground-color has-text-color" style="font-size:1.125rem;font-weight:600"><?php echo esc_html( $item_2_2_name ); ?></p>
<!-- /wp:paragraph -->
<!-- wp:paragraph {"style":{"typography":{"fontSize":"1.125rem","fontWeight":"600"}},"textColor":"primary"} -->
<p class="has-primary-color has-text-color" style="font-size:1.125rem;font-weight:600"><?php echo esc_html( $item_2_2_price ); ?></p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:group -->
<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.9rem"},"spacing":{"margin":{"top":"var:preset|spacing|20"}}},"textColor":"secondary"} -->
<p class="has-secondary-color has-text-color" style="margin-top:var(--wp--preset--spacing--20);font-size:0.9rem"><?php echo esc_html( $item_2_2_desc ); ?></p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:group -->

<!-- wp:group {"style":{"spacing":{"margin":{"bottom":"var:preset|spacing|40"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group" style="margin-bottom:var(--wp--preset--spacing--40)">
<!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"space-between"}} -->
<div class="wp-block-group">
<!-- wp:paragraph {"style":{"typography":{"fontSize":"1.125rem","fontWeight":"600"}},"textColor":"foreground"} -->
<p class="has-foreground-color has-text-color" style="font-size:1.125rem;font-weight:600"><?php echo esc_html( $item_2_3_name ); ?></p>
<!-- /wp:paragraph -->
<!-- wp:paragraph {"style":{"typography":{"fontSize":"1.125rem","fontWeight":"600"}},"textColor":"primary"} -->
<p class="has-primary-color has-text-color" style="font-size:1.125rem;font-weight:600"><?php echo esc_html( $item_2_3_price ); ?></p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:group -->
<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.9rem"},"spacing":{"margin":{"top":"var:preset|spacing|20"}}},"textColor":"secondary"} -->
<p class="has-secondary-color has-text-color" style="margin-top:var(--wp--preset--spacing--20);font-size:0.9rem"><?php echo esc_html( $item_2_3_desc ); ?></p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:group -->

</div>
<!-- /wp:column -->

</div>
<!-- /wp:columns -->

</div>
<!-- /wp:group -->
