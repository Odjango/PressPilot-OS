<?php
/**
 * Pattern: Hero Split
 * 
 * Two-column layout with text on one side and image on the other.
 * 
 * @package PressPilot
 */

$headline       = presspilot_string( 'headline', 'Transform Your Business Today' );
$subheadline    = presspilot_string( 'subheadline', 'We help companies achieve their goals with innovative solutions and expert guidance. Let us show you what\'s possible.' );
$button_primary = presspilot_string( 'button-primary', 'Get Started' );
$hero_image     = presspilot_image( 'hero-image', 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800' );
?>
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|80","bottom":"var:preset|spacing|80","left":"var:preset|spacing|50","right":"var:preset|spacing|50"}}},"backgroundColor":"background","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-background-background-color has-background" style="padding-top:var(--wp--preset--spacing--80);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--80);padding-left:var(--wp--preset--spacing--50)">

<!-- wp:columns {"verticalAlignment":"center","style":{"spacing":{"blockGap":{"left":"var:preset|spacing|70"}}}} -->
<div class="wp-block-columns are-vertically-aligned-center">

<!-- wp:column {"verticalAlignment":"center","width":"50%"} -->
<div class="wp-block-column is-vertically-aligned-center" style="flex-basis:50%">

<!-- wp:heading {"level":1,"style":{"typography":{"fontSize":"2.75rem","fontWeight":"700","lineHeight":"1.2"}},"textColor":"foreground"} -->
<h1 class="wp-block-heading has-foreground-color has-text-color" style="font-size:2.75rem;font-weight:700;line-height:1.2"><?php echo esc_html( $headline ); ?></h1>
<!-- /wp:heading -->

<!-- wp:paragraph {"style":{"typography":{"fontSize":"1.125rem","lineHeight":"1.7"}},"textColor":"secondary"} -->
<p class="has-secondary-color has-text-color" style="font-size:1.125rem;line-height:1.7"><?php echo esc_html( $subheadline ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:buttons {"style":{"spacing":{"margin":{"top":"var:preset|spacing|50"}}}} -->
<div class="wp-block-buttons" style="margin-top:var(--wp--preset--spacing--50)">

<!-- wp:button {"backgroundColor":"primary","textColor":"background","style":{"border":{"radius":"4px"},"spacing":{"padding":{"top":"1rem","bottom":"1rem","left":"2rem","right":"2rem"}}}} -->
<div class="wp-block-button"><a class="wp-block-button__link has-background-color has-primary-background-color has-text-color has-background wp-element-button" style="border-radius:4px;padding-top:1rem;padding-right:2rem;padding-bottom:1rem;padding-left:2rem"><?php echo esc_html( $button_primary ); ?></a></div>
<!-- /wp:button -->

</div>
<!-- /wp:buttons -->

</div>
<!-- /wp:column -->

<!-- wp:column {"verticalAlignment":"center","width":"50%"} -->
<div class="wp-block-column is-vertically-aligned-center" style="flex-basis:50%">

<!-- wp:image {"sizeSlug":"large","linkDestination":"none","style":{"border":{"radius":"12px"}}} -->
<figure class="wp-block-image size-large has-custom-border"><img src="<?php echo esc_url( $hero_image ); ?>" alt="" style="border-radius:12px"/></figure>
<!-- /wp:image -->

</div>
<!-- /wp:column -->

</div>
<!-- /wp:columns -->

</div>
<!-- /wp:group -->
