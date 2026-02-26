<?php
/**
 * Title: PressPilot – Hero Centered
 * Slug: presspilot/hero-centered
 * Categories: presspilot, presspilot-starter
 * Description: Centered hero layout for PressPilot Golden Foundation.
 */
?>
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60","left":"var:preset|spacing|40","right":"var:preset|spacing|40"}}},"layout":{"type":"constrained","contentSize":"960px"}} -->
<div class="wp-block-group alignfull" style="padding-top:var(--wp--preset--spacing--60);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--60);padding-left:var(--wp--preset--spacing--40)">
  <!-- wp:heading {"textAlign":"center","level":1,"fontSize":"xxl"} -->
  <h1 class="wp-block-heading has-text-align-center has-xxl-font-size pp-hero-headline">SoluWRX</h1>
  <!-- /wp:heading -->

  <!-- wp:paragraph {"align":"center","fontSize":"lg"} -->
  <p class="has-text-align-center has-lg-font-size pp-hero-subheadline">SoluWRX helps operators ship AI-ready workflows.</p>
  <!-- /wp:paragraph -->

  <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"margin":{"top":"var:preset|spacing|40"}}}} -->
  <div class="wp-block-buttons" style="margin-top:var(--wp--preset--spacing--40)">
    <!-- wp:button -->
    <div class="wp-block-button"><a class="wp-block-button__link wp-element-button pp-hero-cta-primary">Book a call</a></div>
    <!-- /wp:button -->

    <!-- wp:button {"className":"is-style-outline"} -->
    <div class="wp-block-button is-style-outline"><a class="wp-block-button__link wp-element-button pp-hero-cta-secondary">View work</a></div>
    <!-- /wp:button -->
  </div>
  <!-- /wp:buttons -->
</div>
<!-- /wp:group -->
