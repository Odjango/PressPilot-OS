<?php
/**
 * Title: Footer five columns menu inline
 * Slug: spectra-one/footer-4
 * Categories: footer
 * Block Types: core/template-part/footer
 */

$get_url = trailingslashit(get_template_directory_uri());

$images = [
    $get_url . 'assets/image/logo.svg',
];

?>

<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|medium","padding":{"top":"var:preset|spacing|x-large","bottom":"var:preset|spacing|medium"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group" style="padding-top:var(--wp--preset--spacing--x-large);padding-bottom:var(--wp--preset--spacing--medium)"><!-- wp:columns {"align":"wide","style":{"spacing":{"blockGap":{"top":"var:preset|spacing|medium","left":"var:preset|spacing|medium"}}}} -->
<div class="wp-block-columns alignwide"><!-- wp:column {"width":"","style":{"spacing":{"padding":{"bottom":"var:preset|spacing|xx-small"}}}} -->
<div class="wp-block-column" style="padding-bottom:var(--wp--preset--spacing--xx-small)"><!-- wp:columns {"isStackedOnMobile":false,"style":{"spacing":{"blockGap":{"top":"32px","left":"32px"}}}} -->
<div class="wp-block-columns is-not-stacked-on-mobile"><!-- wp:column {"style":{"spacing":{}}} -->
<div class="wp-block-column"><!-- wp:image {"id":1048,"sizeSlug":"full","linkDestination":"none","style":{"color":{"duotone":"var:preset|duotone|secondary"}},"className":"swt-duotone-secondary site-logo-img"} -->
<figure class="wp-block-image size-full swt-duotone-secondary site-logo-img"><img src="<?php echo esc_url( $images[0] ); ?>" alt="" class="wp-image-1048"/></figure>
<!-- /wp:image --></div>
<!-- /wp:column -->
<!-- wp:column {"style":{"spacing":{}}} -->
<div class="wp-block-column"><!-- wp:paragraph {"style":{"typography":{"textTransform":"uppercase","letterSpacing":"1px","fontStyle":"normal","fontWeight":"500"}},"textColor":"heading","fontSize":"x-small"} -->
<p class="has-heading-color has-text-color has-x-small-font-size" style="font-style:normal;font-weight:500;letter-spacing:1px;text-transform:uppercase">Products</p>
<!-- /wp:paragraph -->
<!-- wp:navigation {"overlayMenu":"never","layout":{"type":"flex","setCascadingProperties":true,"justifyContent":"left","orientation":"vertical"},"style":{"spacing":{"blockGap":"var:preset|spacing|xx-small"}}} -->
<!-- wp:navigation-link {"label":"Products List","url":"#","kind":"custom","isTopLevelLink":true} /-->
<!-- wp:navigation-link {"label":"Plans \u0026amp; Pricing","url":"#","kind":"custom","isTopLevelLink":true} /-->
<!-- wp:navigation-link {"label":"Services","url":"#","kind":"custom","isTopLevelLink":true} /-->
<!-- wp:navigation-link {"label":"Partners","url":"#","kind":"custom","isTopLevelLink":true} /-->
<!-- /wp:navigation --></div>
<!-- /wp:column --></div>
<!-- /wp:columns --></div>
<!-- /wp:column -->
<!-- wp:column {"style":{"spacing":{"padding":{"bottom":"var:preset|spacing|xx-small"}}}} -->
<div class="wp-block-column" style="padding-bottom:var(--wp--preset--spacing--xx-small)"><!-- wp:columns {"isStackedOnMobile":false,"style":{"spacing":{"blockGap":{"top":"32px","left":"32px"}}}} -->
<div class="wp-block-columns is-not-stacked-on-mobile"><!-- wp:column {"style":{"spacing":{}}} -->
<div class="wp-block-column"><!-- wp:paragraph {"style":{"typography":{"textTransform":"uppercase","letterSpacing":"1px","fontStyle":"normal","fontWeight":"500"}},"textColor":"heading","fontSize":"x-small"} -->
<p class="has-heading-color has-text-color has-x-small-font-size" style="font-style:normal;font-weight:500;letter-spacing:1px;text-transform:uppercase">Company</p>
<!-- /wp:paragraph -->
<!-- wp:navigation {"overlayMenu":"never","layout":{"type":"flex","setCascadingProperties":true,"justifyContent":"left","orientation":"vertical"},"style":{"spacing":{"blockGap":"var:preset|spacing|xx-small"}}} -->
<!-- wp:navigation-link {"label":"About Us","url":"#","kind":"custom","isTopLevelLink":true} /-->
<!-- wp:navigation-link {"label":"News","url":"#","kind":"custom","isTopLevelLink":true} /-->
<!-- wp:navigation-link {"label":"Contact Us","url":"#","kind":"custom","isTopLevelLink":true} /-->
<!-- wp:navigation-link {"label":"Meet Our Team","url":"#","kind":"custom","isTopLevelLink":true} /-->
<!-- /wp:navigation --></div>
<!-- /wp:column -->
<!-- wp:column {"style":{"spacing":{}}} -->
<div class="wp-block-column"><!-- wp:paragraph {"style":{"typography":{"textTransform":"uppercase","letterSpacing":"1px","fontStyle":"normal","fontWeight":"500"}},"textColor":"heading","fontSize":"x-small"} -->
<p class="has-heading-color has-text-color has-x-small-font-size" style="font-style:normal;font-weight:500;letter-spacing:1px;text-transform:uppercase">Resources</p>
<!-- /wp:paragraph -->
<!-- wp:navigation {"overlayMenu":"never","layout":{"type":"flex","setCascadingProperties":true,"justifyContent":"left","orientation":"vertical"},"style":{"spacing":{"blockGap":"var:preset|spacing|xx-small"}}} -->
<!-- wp:navigation-link {"label":"Gallery","url":"#","kind":"custom","isTopLevelLink":true} /-->
<!-- wp:navigation-link {"label":"Blog Articles","url":"#","kind":"custom","isTopLevelLink":true} /-->
<!-- wp:navigation-link {"label":"Brand Assets","url":"#","kind":"custom","isTopLevelLink":true} /-->
<!-- wp:navigation-link {"label":"Brand Guidelines","url":"#","kind":"custom","isTopLevelLink":true} /-->
<!-- /wp:navigation --></div>
<!-- /wp:column --></div>
<!-- /wp:columns --></div>
<!-- /wp:column -->
<!-- wp:column {"style":{"spacing":{"padding":{"bottom":"var:preset|spacing|xx-small"}}}} -->
<div class="wp-block-column" style="padding-bottom:var(--wp--preset--spacing--xx-small)"><!-- wp:columns {"isStackedOnMobile":false,"style":{"spacing":{"blockGap":{"top":"32px","left":"32px"}}}} -->
<div class="wp-block-columns is-not-stacked-on-mobile"><!-- wp:column {"style":{"spacing":{}}} -->
<div class="wp-block-column"><!-- wp:paragraph {"style":{"typography":{"textTransform":"uppercase","letterSpacing":"1px","fontStyle":"normal","fontWeight":"500"}},"textColor":"heading","fontSize":"x-small"} -->
<p class="has-heading-color has-text-color has-x-small-font-size" style="font-style:normal;font-weight:500;letter-spacing:1px;text-transform:uppercase">Support</p>
<!-- /wp:paragraph -->
<!-- wp:navigation {"overlayMenu":"never","layout":{"type":"flex","setCascadingProperties":true,"justifyContent":"left","orientation":"vertical"},"style":{"spacing":{"blockGap":"var:preset|spacing|xx-small"}}} -->
<!-- wp:navigation-link {"label":"Knowledge Base","url":"#","kind":"custom","isTopLevelLink":true} /-->
<!-- wp:navigation-link {"label":"Contact Support","url":"#","kind":"custom","isTopLevelLink":true} /-->
<!-- wp:navigation-link {"label":"Privacy Policy","url":"#","kind":"custom","isTopLevelLink":true} /-->
<!-- wp:navigation-link {"label":"TOS","url":"#","kind":"custom","isTopLevelLink":true} /-->
<!-- /wp:navigation --></div>
<!-- /wp:column -->
<!-- wp:column {"style":{"spacing":{}}} -->
<div class="wp-block-column"><!-- wp:paragraph {"style":{"typography":{"textTransform":"uppercase","letterSpacing":"1px","fontStyle":"normal","fontWeight":"500"}},"textColor":"heading","fontSize":"x-small"} -->
<p class="has-heading-color has-text-color has-x-small-font-size" style="font-style:normal;font-weight:500;letter-spacing:1px;text-transform:uppercase">Need help?</p>
<!-- /wp:paragraph -->
<!-- wp:navigation {"overlayMenu":"never","layout":{"type":"flex","setCascadingProperties":true,"justifyContent":"left","orientation":"vertical"},"style":{"spacing":{"blockGap":"var:preset|spacing|xx-small"}}} -->
<!-- wp:navigation-link {"label":"What’s New","url":"#","kind":"custom","isTopLevelLink":true} /-->
<!-- wp:navigation-link {"label":"How to Videos","url":"#","kind":"custom","isTopLevelLink":true} /-->
<!-- wp:navigation-link {"label":"Ask the Community","url":"#","kind":"custom","isTopLevelLink":true} /-->
<!-- wp:navigation-link {"label":"Learn More","url":"#","kind":"custom","isTopLevelLink":true} /-->
<!-- /wp:navigation --></div>
<!-- /wp:column --></div>
<!-- /wp:columns --></div>
<!-- /wp:column --></div>
<!-- /wp:columns -->
<!-- wp:separator {"align":"wide","backgroundColor":"outline","className":"is-style-wide"} -->
<hr class="wp-block-separator alignwide has-text-color has-outline-color has-alpha-channel-opacity has-outline-background-color has-background is-style-wide"/>
<!-- /wp:separator -->
<!-- wp:group {"align":"wide","layout":{"type":"flex","flexWrap":"wrap","justifyContent":"space-between"}} -->
<div class="wp-block-group alignwide"><!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|xx-small"}},"layout":{"type":"flex","flexWrap":"nowrap"}} -->
<div class="wp-block-group"><!-- wp:paragraph {"align":"center","fontSize":"x-small"} -->
<p class="has-text-align-center has-x-small-font-size"><?php echo sprintf( __( '© %d ·', 'spectra-one' ), date_i18n( 'Y' ) ); ?></p>
<!-- /wp:paragraph -->
<!-- wp:site-title {"style":{"typography":{"fontStyle":"normal","fontWeight":"400"}},"fontSize":"x-small"} /-->
<!-- wp:paragraph {"align":"center","fontSize":"x-small"} -->
<p class="has-text-align-center has-x-small-font-size">· All rights reserved</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->
<!-- wp:social-links {"iconColor":"heading","iconColorValue":"var(--wp--preset--color--heading)","openInNewTab":true,"size":"has-small-icon-size","style":{"spacing":{"blockGap":{"top":"var:preset|spacing|x-small","left":"var:preset|spacing|x-small"}}},"className":"is-style-logos-only"} -->
<ul class="wp-block-social-links has-small-icon-size has-icon-color is-style-logos-only"><!-- wp:social-link {"url":"#","service":"facebook"} /-->
<!-- wp:social-link {"url":"#","service":"twitter"} /-->
<!-- wp:social-link {"url":"#","service":"youtube"} /-->
<!-- wp:social-link {"url":"#","service":"linkedin"} /--></ul>
<!-- /wp:social-links --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->