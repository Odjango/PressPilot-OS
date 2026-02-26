<?php
/**
 * Pattern: Header Centered
 * 
 * Logo centered above navigation menu. Clean and balanced design.
 * 
 * @package PressPilot
 */

$site_title = presspilot_string( 'site-title', 'Your Business' );
?>
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|50","right":"var:preset|spacing|50"}}},"backgroundColor":"background","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-background-background-color has-background" style="padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--50)">

<!-- wp:group {"layout":{"type":"flex","orientation":"vertical","justifyContent":"center"}} -->
<div class="wp-block-group">

<!-- wp:site-title {"textAlign":"center","style":{"typography":{"fontStyle":"normal","fontWeight":"700","fontSize":"1.5rem"}}} /-->

<!-- wp:navigation {"layout":{"type":"flex","justifyContent":"center"},"style":{"typography":{"fontSize":"0.9rem"},"spacing":{"blockGap":"var:preset|spacing|50"}}} -->
<!-- wp:navigation-link {"label":"Home","url":"#","kind":"custom","isTopLevelLink":true} /-->
<!-- wp:navigation-link {"label":"About","url":"#about","kind":"custom","isTopLevelLink":true} /-->
<!-- wp:navigation-link {"label":"Menu","url":"#menu","kind":"custom","isTopLevelLink":true} /-->
<!-- wp:navigation-link {"label":"Contact","url":"#contact","kind":"custom","isTopLevelLink":true} /-->
<!-- /wp:navigation -->

</div>
<!-- /wp:group -->

</div>
<!-- /wp:group -->
