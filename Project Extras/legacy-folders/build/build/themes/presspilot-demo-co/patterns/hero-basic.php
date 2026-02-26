<?php
/**
 * Title: PressPilot – Hero Basic
 * Slug: presspilot/hero-basic
 * Categories: presspilot, presspilot-starter
 * Description: Modular hero section with badges, headline, and dual CTAs.
 */
?>
<!-- wp:group {"align":"full","backgroundColor":"soft-bg","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","right":"var:preset|spacing|40","bottom":"var:preset|spacing|60","left":"var:preset|spacing|40"}}},"layout":{"type":"constrained","contentSize":"1100px"},"className":"presspilot-section presspilot-pattern hero-basic"} -->
<div class="wp-block-group alignfull presspilot-section presspilot-pattern hero-basic has-soft-bg-background-color has-background">
  <!-- wp:group {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"blockGap":"var:preset|spacing|20"}}} -->
  <div class="wp-block-group">
    <!-- wp:paragraph {"align":"center","textColor":"muted","fontSize":"xs","className":"hero-eyebrow"} -->
    <p class="has-text-align-center has-muted-color has-xs-font-size hero-eyebrow">Built with PressPilot Golden Foundation</p>
    <!-- /wp:paragraph -->
  </div>
  <!-- /wp:group -->

  <!-- wp:heading {"textAlign":"center","level":1,"fontSize":"xxl","className":"hero-title"} -->
  <h1 class="wp-block-heading has-text-align-center has-xxl-font-size pp-hero-headline hero-title">PressPilot Demo Co.</h1>
  <!-- /wp:heading -->

  <!-- wp:paragraph {"align":"center","fontSize":"lg","className":"hero-subtitle"} -->
  <p class="has-text-align-center has-lg-font-size pp-hero-subheadline hero-subtitle">A modern business generated via PressPilot.</p>
  <!-- /wp:paragraph -->

  <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"margin":{"top":"var:preset|spacing|40"},"blockGap":"var:preset|spacing|30"}},"className":"pp-hero-ctas hero-ctas"} -->
  <div class="wp-block-buttons pp-hero-ctas hero-ctas" style="margin-top:var(--wp--preset--spacing--40)">
    <!-- wp:button {"className":"pp-button-primary btn primary","textColor":"contrast","style":{"elements":{"link":{"color":{"text":"var:preset|color|contrast"}}}}} -->
    <div class="wp-block-button pp-button-primary btn primary has-contrast-color has-text-color has-link-color"><a class="wp-block-button__link wp-element-button pp-hero-cta-primary btn primary" href="#reserve">Reserve a table</a></div>
    <!-- /wp:button -->

    <!-- wp:button {"className":"pp-button-secondary is-style-outline btn secondary","style":{"border":{"width":"1px"}}} -->
    <div class="wp-block-button pp-button-secondary is-style-outline btn secondary has-custom-border wp-element-button" style="border-width:1px"><a class="wp-block-button__link wp-element-button pp-hero-cta-secondary btn secondary" href="#menu">View full menu</a></div>
    <!-- /wp:button -->
  </div>
  <!-- /wp:buttons -->
</div>
<!-- /wp:group -->

