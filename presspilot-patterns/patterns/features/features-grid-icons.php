<?php
/**
 * Pattern: Features Grid with Icons
 * 
 * 4 column grid with emoji icons, titles, and descriptions.
 * 
 * @package PressPilot
 */

$section_title = presspilot_string( 'section-title', 'Why Choose Us' );

$feature_1_icon  = presspilot_string( 'feature-1-icon', '⭐' );
$feature_1_title = presspilot_string( 'feature-1-title', 'Quality First' );
$feature_1_desc  = presspilot_string( 'feature-1-desc', 'We never compromise on quality. Every detail matters to us.' );

$feature_2_icon  = presspilot_string( 'feature-2-icon', '🚀' );
$feature_2_title = presspilot_string( 'feature-2-title', 'Fast Delivery' );
$feature_2_desc  = presspilot_string( 'feature-2-desc', 'Quick turnaround times without sacrificing excellence.' );

$feature_3_icon  = presspilot_string( 'feature-3-icon', '💎' );
$feature_3_title = presspilot_string( 'feature-3-title', 'Best Value' );
$feature_3_desc  = presspilot_string( 'feature-3-desc', 'Premium quality at competitive prices. Great value guaranteed.' );

$feature_4_icon  = presspilot_string( 'feature-4-icon', '🤝' );
$feature_4_title = presspilot_string( 'feature-4-title', 'Expert Support' );
$feature_4_desc  = presspilot_string( 'feature-4-desc', 'Our team is here to help you every step of the way.' );
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
<!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50","left":"var:preset|spacing|40","right":"var:preset|spacing|40"}},"border":{"radius":"8px"}},"backgroundColor":"tertiary","layout":{"type":"constrained"}} -->
<div class="wp-block-group has-tertiary-background-color has-background" style="border-radius:8px;padding-top:var(--wp--preset--spacing--50);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--50);padding-left:var(--wp--preset--spacing--40)">

<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"2.5rem"}}} -->
<p class="has-text-align-center" style="font-size:2.5rem"><?php echo esc_html( $feature_1_icon ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:heading {"textAlign":"center","level":3,"style":{"typography":{"fontSize":"1.125rem","fontWeight":"600"},"spacing":{"margin":{"top":"var:preset|spacing|30"}}},"textColor":"foreground"} -->
<h3 class="wp-block-heading has-text-align-center has-foreground-color has-text-color" style="margin-top:var(--wp--preset--spacing--30);font-size:1.125rem;font-weight:600"><?php echo esc_html( $feature_1_title ); ?></h3>
<!-- /wp:heading -->

<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"0.9rem"}},"textColor":"secondary"} -->
<p class="has-text-align-center has-secondary-color has-text-color" style="font-size:0.9rem"><?php echo esc_html( $feature_1_desc ); ?></p>
<!-- /wp:paragraph -->

</div>
<!-- /wp:group -->
</div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column">
<!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50","left":"var:preset|spacing|40","right":"var:preset|spacing|40"}},"border":{"radius":"8px"}},"backgroundColor":"tertiary","layout":{"type":"constrained"}} -->
<div class="wp-block-group has-tertiary-background-color has-background" style="border-radius:8px;padding-top:var(--wp--preset--spacing--50);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--50);padding-left:var(--wp--preset--spacing--40)">

<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"2.5rem"}}} -->
<p class="has-text-align-center" style="font-size:2.5rem"><?php echo esc_html( $feature_2_icon ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:heading {"textAlign":"center","level":3,"style":{"typography":{"fontSize":"1.125rem","fontWeight":"600"},"spacing":{"margin":{"top":"var:preset|spacing|30"}}},"textColor":"foreground"} -->
<h3 class="wp-block-heading has-text-align-center has-foreground-color has-text-color" style="margin-top:var(--wp--preset--spacing--30);font-size:1.125rem;font-weight:600"><?php echo esc_html( $feature_2_title ); ?></h3>
<!-- /wp:heading -->

<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"0.9rem"}},"textColor":"secondary"} -->
<p class="has-text-align-center has-secondary-color has-text-color" style="font-size:0.9rem"><?php echo esc_html( $feature_2_desc ); ?></p>
<!-- /wp:paragraph -->

</div>
<!-- /wp:group -->
</div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column">
<!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50","left":"var:preset|spacing|40","right":"var:preset|spacing|40"}},"border":{"radius":"8px"}},"backgroundColor":"tertiary","layout":{"type":"constrained"}} -->
<div class="wp-block-group has-tertiary-background-color has-background" style="border-radius:8px;padding-top:var(--wp--preset--spacing--50);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--50);padding-left:var(--wp--preset--spacing--40)">

<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"2.5rem"}}} -->
<p class="has-text-align-center" style="font-size:2.5rem"><?php echo esc_html( $feature_3_icon ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:heading {"textAlign":"center","level":3,"style":{"typography":{"fontSize":"1.125rem","fontWeight":"600"},"spacing":{"margin":{"top":"var:preset|spacing|30"}}},"textColor":"foreground"} -->
<h3 class="wp-block-heading has-text-align-center has-foreground-color has-text-color" style="margin-top:var(--wp--preset--spacing--30);font-size:1.125rem;font-weight:600"><?php echo esc_html( $feature_3_title ); ?></h3>
<!-- /wp:heading -->

<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"0.9rem"}},"textColor":"secondary"} -->
<p class="has-text-align-center has-secondary-color has-text-color" style="font-size:0.9rem"><?php echo esc_html( $feature_3_desc ); ?></p>
<!-- /wp:paragraph -->

</div>
<!-- /wp:group -->
</div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column">
<!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50","left":"var:preset|spacing|40","right":"var:preset|spacing|40"}},"border":{"radius":"8px"}},"backgroundColor":"tertiary","layout":{"type":"constrained"}} -->
<div class="wp-block-group has-tertiary-background-color has-background" style="border-radius:8px;padding-top:var(--wp--preset--spacing--50);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--50);padding-left:var(--wp--preset--spacing--40)">

<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"2.5rem"}}} -->
<p class="has-text-align-center" style="font-size:2.5rem"><?php echo esc_html( $feature_4_icon ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:heading {"textAlign":"center","level":3,"style":{"typography":{"fontSize":"1.125rem","fontWeight":"600"},"spacing":{"margin":{"top":"var:preset|spacing|30"}}},"textColor":"foreground"} -->
<h3 class="wp-block-heading has-text-align-center has-foreground-color has-text-color" style="margin-top:var(--wp--preset--spacing--30);font-size:1.125rem;font-weight:600"><?php echo esc_html( $feature_4_title ); ?></h3>
<!-- /wp:heading -->

<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"0.9rem"}},"textColor":"secondary"} -->
<p class="has-text-align-center has-secondary-color has-text-color" style="font-size:0.9rem"><?php echo esc_html( $feature_4_desc ); ?></p>
<!-- /wp:paragraph -->

</div>
<!-- /wp:group -->
</div>
<!-- /wp:column -->

</div>
<!-- /wp:columns -->

</div>
<!-- /wp:group -->
