<?php
/**
 * Pattern: Header Minimal
 * 
 * Simple text logo with hamburger menu. Mobile-first design.
 * 
 * @package PressPilot
 */

$site_title = presspilot_string( 'site-title', 'Studio' );
?>
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50","left":"var:preset|spacing|50","right":"var:preset|spacing|50"}}},"backgroundColor":"background","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-background-background-color has-background" style="padding-top:var(--wp--preset--spacing--50);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--50);padding-left:var(--wp--preset--spacing--50)">

<!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"space-between"}} -->
<div class="wp-block-group">

<!-- wp:site-title {"style":{"typography":{"fontStyle":"normal","fontWeight":"600","fontSize":"1.125rem","textTransform":"uppercase","letterSpacing":"0.1em"}}} /-->

<!-- wp:navigation {"overlayMenu":"always","icon":"menu","layout":{"type":"flex","justifyContent":"right"},"style":{"typography":{"fontSize":"0.875rem"}}} -->
<!-- wp:navigation-link {"label":"Home","url":"#","kind":"custom","isTopLevelLink":true} /-->
<!-- wp:navigation-link {"label":"Work","url":"#work","kind":"custom","isTopLevelLink":true} /-->
<!-- wp:navigation-link {"label":"About","url":"#about","kind":"custom","isTopLevelLink":true} /-->
<!-- wp:navigation-link {"label":"Contact","url":"#contact","kind":"custom","isTopLevelLink":true} /-->
<!-- /wp:navigation -->

</div>
<!-- /wp:group -->

</div>
<!-- /wp:group -->
