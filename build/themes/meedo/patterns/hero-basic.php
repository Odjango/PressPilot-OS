<?php
/**
 * Title: PressPilot – Hero Basic
 * Slug: presspilot/hero-basic
 * Categories: presspilot, presspilot-starter
 * Description: Modular hero section with badges, headline, and dual CTAs.
 */
?>
<!-- wp:group {"align":"full","backgroundColor":"soft-bg","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","right":"var:preset|spacing|40","bottom":"var:preset|spacing|60","left":"var:preset|spacing|40"}}},"layout":{"type":"constrained","contentSize":"1100px"},"className":"presspilot-pattern hero-basic"} -->
<div class="wp-block-group alignfull presspilot-pattern hero-basic has-soft-bg-background-color has-background">
  <!-- wp:group {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"blockGap":"var:preset|spacing|20"}}} -->
  <div class="wp-block-group">
    <!-- wp:paragraph {"align":"center","textColor":"muted","fontSize":"xs"} -->
    <p class="has-text-align-center has-muted-color has-xs-font-size">Built with PressPilot Golden Foundation</p>
    <!-- /wp:paragraph -->
  </div>
  <!-- /wp:group -->

  <!-- wp:heading {"textAlign":"center","level":1,"fontSize":"xxl"} -->
  <h1 class="wp-block-heading has-text-align-center has-xxl-font-size pp-hero-headline">Meedo</h1>
  <!-- /wp:heading -->

  <!-- wp:paragraph {"align":"center","fontSize":"lg"} -->
  <p class="has-text-align-center has-lg-font-size pp-hero-subheadline">Meedo needs a polished WordPress kit with modern hero copy, clear CTAs, and a tone that matches a premium web studio.</p>
  <!-- /wp:paragraph -->

  <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"margin":{"top":"var:preset|spacing|40"},"blockGap":"var:preset|spacing|30"}},"className":"pp-hero-ctas"} -->
  <div class="wp-block-buttons pp-hero-ctas" style="margin-top:var(--wp--preset--spacing--40)">
    <!-- wp:button {"className":"pp-button-primary"} -->
    <div class="wp-block-button pp-button-primary">
      <a class="wp-block-button__link pp-hero-cta-primary" href="#contact">Book a call</a>
    </div>
    <!-- /wp:button -->

    <!-- wp:button {"className":"pp-button-secondary is-style-outline"} -->
    <div class="wp-block-button pp-button-secondary is-style-outline">
      <a class="wp-block-button__link pp-hero-cta-secondary" href="#portfolio">View work</a>
    </div>
    <!-- /wp:button -->
  </div>
  <!-- /wp:buttons -->
</div>
<!-- /wp:group -->

