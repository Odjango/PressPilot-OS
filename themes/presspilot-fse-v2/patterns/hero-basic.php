<?php
/**
 * Title: PressPilot – Hero Basic
 * Slug: presspilot/hero-basic
 * Categories: presspilot, presspilot-starter
 * Description: Modular hero section with badges, headline, and dual CTAs.
 */
?>
<!-- wp:group {"align":"full","backgroundColor":"soft-bg","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","right":"var:preset|spacing|40","bottom":"var:preset|spacing|60","left":"var:preset|spacing|40"}}},"layout":{"type":"constrained","contentSize":"1100px"},"className":"presspilot-section presspilot-pattern hero-basic"} -->
<div
  class="wp-block-group alignfull presspilot-section presspilot-pattern hero-basic has-soft-bg-background-color has-background">
  <!-- wp:group {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"blockGap":"var:preset|spacing|20"}}} -->
  <div class="wp-block-group">
    <!-- wp:paragraph {"align":"center","textColor":"muted","fontSize":"xs","className":"hero-eyebrow"} -->
    <p class="has-text-align-center has-muted-color has-xs-font-size hero-eyebrow">Built with PressPilot Golden
      Foundation</p>
    <!-- /wp:paragraph -->
  </div>
  <!-- /wp:group -->

  <!-- wp:heading {"textAlign":"center","level":1,"fontSize":"xxl","className":"hero-title"} -->
  <h1 class="wp-block-heading has-text-align-center has-xxl-font-size pp-hero-headline hero-title">{{HERO_TITLE}}</h1>
  <!-- /wp:heading -->

  <!-- wp:paragraph {"align":"center","fontSize":"lg","className":"hero-subtitle"} -->
  <p class="has-text-align-center has-lg-font-size pp-hero-subheadline hero-subtitle">{{HERO_SUBTITLE}}</p>
  <!-- /wp:paragraph -->

  <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"margin":{"top":"var:preset|spacing|40"},"blockGap":"var:preset|spacing|30"}}} -->
  <div class="wp-block-buttons" style="margin-top:var(--wp--preset--spacing--40)">
    <!-- wp:button {"backgroundColor":"primary","textColor":"soft-bg"} -->
    <div class="wp-block-button"><a
        class="wp-block-button__link has-soft-bg-color has-primary-background-color has-text-color has-background wp-element-button"
        href="{{HERO_PRIMARY_CTA_URL}}">{{HERO_PRIMARY_CTA}}</a></div>
    <!-- /wp:button -->

    <!-- wp:button {"className":"is-style-outline"} -->
    <div class="wp-block-button is-style-outline"><a class="wp-block-button__link wp-element-button"
        href="{{HERO_SECONDARY_CTA_URL}}">{{HERO_SECONDARY_CTA}}</a></div>
    <!-- /wp:button -->
  </div>
  <!-- /wp:buttons -->
</div>
<!-- /wp:group -->