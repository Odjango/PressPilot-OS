<?php
/**
 * Pattern: Hero Minimal
 * 
 * Clean text-focused hero with no background image. Elegant typography.
 * 
 * @package PressPilot
 */

$headline    = presspilot_string( 'headline', 'We Create Beautiful Digital Experiences' );
$subheadline = presspilot_string( 'subheadline', 'Design studio focused on crafting memorable brands and websites.' );
?>
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|80","bottom":"var:preset|spacing|80","left":"var:preset|spacing|50","right":"var:preset|spacing|50"}}},"backgroundColor":"background","layout":{"type":"constrained","contentSize":"900px"}} -->
<div class="wp-block-group alignfull has-background-background-color has-background" style="padding-top:var(--wp--preset--spacing--80);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--80);padding-left:var(--wp--preset--spacing--50)">

<!-- wp:heading {"textAlign":"center","level":1,"style":{"typography":{"fontSize":"4rem","fontWeight":"700","lineHeight":"1.1","letterSpacing":"-0.02em"}},"textColor":"foreground"} -->
<h1 class="wp-block-heading has-text-align-center has-foreground-color has-text-color" style="font-size:4rem;font-weight:700;letter-spacing:-0.02em;line-height:1.1"><?php echo esc_html( $headline ); ?></h1>
<!-- /wp:heading -->

<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"1.375rem","lineHeight":"1.6"},"spacing":{"margin":{"top":"var:preset|spacing|40"}}},"textColor":"secondary"} -->
<p class="has-text-align-center has-secondary-color has-text-color" style="margin-top:var(--wp--preset--spacing--40);font-size:1.375rem;line-height:1.6"><?php echo esc_html( $subheadline ); ?></p>
<!-- /wp:paragraph -->

</div>
<!-- /wp:group -->
