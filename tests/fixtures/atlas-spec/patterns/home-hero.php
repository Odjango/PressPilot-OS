<?php
/**
 * Title: Home Hero
 * Slug: presspilot/home-hero
 * Categories: presspilot
 */
?>
<!-- wp:cover {"url":"/assets/images/hero-placeholder-home.jpg","dimRatio":50,"align":"full"} -->
<!-- wp:heading {"level":1,"textAlign":"center","style":{"typography":{"fontSize":"var:preset|font-size|xl"}}} -->
<h1 class="wp-block-heading has-text-align-center" style="font-size:var(--wp--preset--font-size--xl)">{{HERO_TITLE}}
</h1>
<!-- /wp:heading -->

<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"var:preset|font-size|base","lineHeight":"1.6"}}} -->
<p class="has-text-align-center" style="font-size:var(--wp--preset--font-size--base);line-height:1.6">{{HERO_SUBTITLE}}
</p>
<!-- /wp:paragraph -->

<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
<!-- wp:button -->
<div class="wp-block-button"><a class="wp-block-button__link wp-element-button">Get started</a></div>
<!-- /wp:button -->
<!-- /wp:buttons -->
<!-- /wp:cover -->