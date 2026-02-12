<?php
/**
 * Title: Header Light
 * Slug: ollie/header-light
 * Description: Header with nav and social icons
 * Categories: header
 * Keywords: header, nav, links, button
 * Viewport Width: 1500
 * Block Types: core/template-part/header
 * Post Types: wp_template
 * Inserter: true
 */
?>
<!-- wp:group {"metadata":{"name":"Header"},"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|medium","bottom":"var:preset|spacing|medium","right":"var:preset|spacing|medium","left":"var:preset|spacing|medium"}},"elements":{"link":{"color":{"text":"var:preset|color|main"}}},"border":{"bottom":{"color":"var:preset|color|border-light","width":"1px"},"top":[],"right":[],"left":[]}},"backgroundColor":"base","layout":{"inherit":true,"type":"constrained"}} -->
<div class="wp-block-group alignfull has-base-background-color has-background has-link-color"
    style="border-bottom-color:var(--wp--preset--color--border-light);border-bottom-width:1px;padding-top:var(--wp--preset--spacing--medium);padding-right:var(--wp--preset--spacing--medium);padding-bottom:var(--wp--preset--spacing--medium);padding-left:var(--wp--preset--spacing--medium)">
    <!-- wp:group {"align":"wide","layout":{"type":"flex","justifyContent":"space-between","flexWrap":"nowrap"}} -->
    <div class="wp-block-group alignwide">
        <!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap","blockGap":"1rem"}} -->
        <div class="wp-block-group">
            <!-- wp:site-logo {"width":120} /-->
            <!-- wp:site-title {"level":0,"style":{"typography":{"fontWeight":"700","fontSize":"1.25rem"}}} /-->
        </div>
        <!-- /wp:group -->

        <!-- wp:navigation {"openSubmenusOnClick":true,"icon":"menu","style":{"spacing":{"blockGap":"2rem"},"typography":{"fontWeight":"500"}},"layout":{"type":"flex","justifyContent":"flex-end"},"fontSize":"small"} /-->
    </div>
    <!-- /wp:group -->
</div>
<!-- /wp:group -->