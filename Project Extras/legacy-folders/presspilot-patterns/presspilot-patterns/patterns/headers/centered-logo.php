<?php
/**
 * Title: Header with site title, navigation, and CTA
 * Slug: presspilot/header-default
 * Categories: header
 * Block Types: core/template-part/header
 * Source: proven-cores/frost/patterns/header-default.php
 */

$nav1 = presspilot_string( 'header/nav-item-1', 'Home' );
$nav2 = presspilot_string( 'header/nav-item-2', 'Menu' );
$nav3 = presspilot_string( 'header/nav-item-3', 'About' );
$nav4 = presspilot_string( 'header/nav-item-4', 'Contact' );
$cta  = presspilot_string( 'header/cta-button', 'Reserve Table' );
?>
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"30px","bottom":"30px","left":"30px","right":"30px"},"margin":{"top":"0px"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull" style="margin-top:0px;padding-top:30px;padding-right:30px;padding-bottom:30px;padding-left:30px">
	<!-- wp:group {"align":"wide","layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"space-between"}} -->
	<div class="wp-block-group alignwide">
		<!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap"}} -->
		<div class="wp-block-group">
			<!-- wp:site-logo {"width":50,"shouldSyncIcon":true} /-->
			<!-- wp:site-title {"level":0,"style":{"typography":{"fontSize":"1.5rem","fontWeight":"700"}}} /-->
		</div>
		<!-- /wp:group -->
		<!-- wp:navigation {"overlayMenu":"never","layout":{"type":"flex","setCascadingProperties":true}} -->
			<!-- wp:navigation-link {"label":"<?php echo esc_attr( $nav1 ); ?>","url":"/","kind":"custom","isTopLevelLink":true} /-->
			<!-- wp:navigation-link {"label":"<?php echo esc_attr( $nav2 ); ?>","url":"/menu/","kind":"custom","isTopLevelLink":true} /-->
			<!-- wp:navigation-link {"label":"<?php echo esc_attr( $nav3 ); ?>","url":"/about/","kind":"custom","isTopLevelLink":true} /-->
			<!-- wp:navigation-link {"label":"<?php echo esc_attr( $nav4 ); ?>","url":"/contact/","kind":"custom","isTopLevelLink":true} /-->
		<!-- /wp:navigation -->
		<!-- wp:buttons -->
		<div class="wp-block-buttons">
			<!-- wp:button -->
			<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="/contact/"><?php echo esc_html( $cta ); ?></a></div>
			<!-- /wp:button -->
		</div>
		<!-- /wp:buttons -->
	</div>
	<!-- /wp:group -->
</div>
<!-- /wp:group -->
