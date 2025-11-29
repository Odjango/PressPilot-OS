<?php
/**
 * Title: PressPilot – Hero Basic
 * Slug: presspilot/hero-basic
 * Categories: presspilot, presspilot-starter
 * Description: Modular hero section with badges, headline, and dual CTAs.
 */
?>
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","right":"var:preset|spacing|40","bottom":"var:preset|spacing|60","left":"var:preset|spacing|40"}}},"layout":{"type":"constrained","contentSize":"1100px"}} -->
<div class="wp-block-group alignfull"
  style="padding-top:var(--wp--preset--spacing--60);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--60);padding-left:var(--wp--preset--spacing--40)">
  <!-- wp:group {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"blockGap":"var:preset|spacing|20"}}} -->
  <div class="wp-block-group is-layout-flex is-content-justification-center" style="gap:var(--wp--preset--spacing--20)">
    <!-- wp:paragraph {"align":"center","textColor":"muted","fontSize":"xs","style":{"typography":{"textTransform":"uppercase","letterSpacing":"0.2em"}}} -->
    <p class="has-text-align-center has-muted-color has-xs-font-size"
      style="text-transform:uppercase;letter-spacing:0.2em">Built with PressPilot Golden Foundation</p>
    <!-- /wp:paragraph -->
  </div>
  <!-- /wp:group -->

  <!-- wp:heading {"textAlign":"center","level":1,"fontSize":"xxl","style":{"spacing":{"margin":{"bottom":"1rem"}}}} -->
  <h1 class="wp-block-heading has-text-align-center has-xxl-font-size" style="margin-bottom:1rem">{{HERO_TITLE}}</h1>
  <!-- /wp:heading -->

  <!-- wp:paragraph {"align":"center","fontSize":"lg","style":{"spacing":{"margin":{"bottom":"2rem"}}}} -->
  <p class="has-text-align-center has-lg-font-size" style="margin-bottom:2rem">{{HERO_SUBTITLE}}</p>
  <!-- /wp:paragraph -->

  <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"margin":{"top":"var:preset|spacing|40"},"blockGap":"var:preset|spacing|30"}}} -->
  <div class="wp-block-buttons is-layout-flex is-content-justification-center"
    style="margin-top:var(--wp--preset--spacing--40);gap:var(--wp--preset--spacing--30)">
    <!-- wp:button {"backgroundColor":"primary","textColor":"soft-bg","style":{"shadow":"var:preset|shadow|primary-glow"}} -->
    <div class="wp-block-button"><a
        class="wp-block-button__link has-soft-bg-color has-primary-background-color has-text-color has-background wp-element-button"
        style="box-shadow:var(--wp--preset--shadow--primary-glow)"
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