<?php
/**
 * Title: PressPilot – Pricing Columns
 * Slug: presspilot/pricing-columns
 * Categories: presspilot, presspilot-starter
 * Description: Three-column pricing grid for PressPilot Golden Foundation.
 */
?>
<!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|50","right":"var:preset|spacing|40","bottom":"var:preset|spacing|50","left":"var:preset|spacing|40"}}},"layout":{"type":"constrained","contentSize":"1100px"}} -->
<div class="wp-block-group"
  style="padding-top:var(--wp--preset--spacing--50);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--50);padding-left:var(--wp--preset--spacing--40)">
  <!-- wp:heading {"textAlign":"center","level":2,"fontSize":"xl"} -->
  <h2 class="wp-block-heading has-text-align-center has-xl-font-size">{{PRICING_HEADING}}</h2>
  <!-- /wp:heading -->

  <!-- wp:paragraph {"align":"center","textColor":"muted","fontSize":"sm"} -->
  <p class="has-text-align-center has-muted-color has-sm-font-size">{{PRICING_SUBHEADING}}</p>
  <!-- /wp:paragraph -->

  <!-- wp:columns {"style":{"spacing":{"margin":{"top":"var:preset|spacing|40"},"blockGap":"var:preset|spacing|40"}}} -->
  <div class="wp-block-columns" style="margin-top:var(--wp--preset--spacing--40)">
    <!-- wp:column -->
    <div class="wp-block-column">
      <!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|30"},"border":{"width":"1px","style":"solid","color":"var:preset|color|border"},"padding":{"top":"var:preset|spacing|40","right":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40"},"shadow":"var:preset|shadow|card"},"layout":{"type":"constrained"},"className":"{{PRICING_1_CARD_CLASS}}"} -->
      <div class="wp-block-group {{PRICING_1_CARD_CLASS}}"
        style="border-color:var(--wp--preset--color--border);border-style:solid;border-width:1px;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40);box-shadow:var(--wp--preset--shadow--card)">
        <!-- wp:heading {"level":3,"fontSize":"lg"} -->
        <h3 class="wp-block-heading has-lg-font-size">{{PRICING_1_NAME}}</h3>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"fontSize":"xl"} -->
        <p class="has-xl-font-size">{{PRICING_1_PRICE}}</p>
        <!-- /wp:paragraph -->
        <!-- wp:list {"fontSize":"sm"} -->
        <ul class="has-sm-font-size">{{PRICING_1_FEATURES}}</ul>
        <!-- /wp:list -->
        <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"stretch"}} -->
        <div class="wp-block-buttons">
          <!-- wp:button {"width":100,"backgroundColor":"primary","textColor":"soft-bg","style":{"shadow":"var:preset|shadow|primary-glow"}} -->
          <div class="wp-block-button has-custom-width wp-block-button__width-100"><a
              class="wp-block-button__link has-soft-bg-color has-primary-background-color has-text-color has-background wp-element-button"
              style="box-shadow:var(--wp--preset--shadow--primary-glow)" href="#contact">{{PRICING_1_CTA}}</a></div>
          <!-- /wp:button -->
        </div>
        <!-- /wp:buttons -->
      </div>
      <!-- /wp:group -->
    </div>
    <!-- /wp:column -->

    <!-- wp:column -->
    <div class="wp-block-column">
      <!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|30"},"border":{"width":"2px","style":"solid","color":"var:preset|color|primary"},"padding":{"top":"var:preset|spacing|40","right":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40"},"shadow":"var:preset|shadow|primary-glow"},"layout":{"type":"constrained"},"className":"{{PRICING_2_CARD_CLASS}}"} -->
      <div class="wp-block-group {{PRICING_2_CARD_CLASS}}"
        style="border-color:var(--wp--preset--color--primary);border-style:solid;border-width:2px;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40);box-shadow:var(--wp--preset--shadow--primary-glow)">
        <!-- wp:heading {"level":3,"fontSize":"lg"} -->
        <h3 class="wp-block-heading has-lg-font-size">{{PRICING_2_NAME}}</h3>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"fontSize":"xl"} -->
        <p class="has-xl-font-size">{{PRICING_2_PRICE}}</p>
        <!-- /wp:paragraph -->
        <!-- wp:list {"fontSize":"sm"} -->
        <ul class="has-sm-font-size">{{PRICING_2_FEATURES}}</ul>
        <!-- /wp:list -->
        <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"stretch"}} -->
        <div class="wp-block-buttons">
          <!-- wp:button {"width":100,"backgroundColor":"primary","textColor":"soft-bg","style":{"shadow":"var:preset|shadow|primary-glow"}} -->
          <div class="wp-block-button has-custom-width wp-block-button__width-100"><a
              class="wp-block-button__link has-soft-bg-color has-primary-background-color has-text-color has-background wp-element-button"
              style="box-shadow:var(--wp--preset--shadow--primary-glow)" href="#contact">{{PRICING_2_CTA}}</a></div>
          <!-- /wp:button -->
        </div>
        <!-- /wp:buttons -->
      </div>
      <!-- /wp:group -->
    </div>
    <!-- /wp:column -->

    <!-- wp:column -->
    <div class="wp-block-column">
      <!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|30"},"border":{"width":"1px","style":"solid","color":"var:preset|color|border"},"padding":{"top":"var:preset|spacing|40","right":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40"},"shadow":"var:preset|shadow|card"},"layout":{"type":"constrained"},"className":"{{PRICING_3_CARD_CLASS}}"} -->
      <div class="wp-block-group {{PRICING_3_CARD_CLASS}}"
        style="border-color:var(--wp--preset--color--border);border-style:solid;border-width:1px;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40);box-shadow:var(--wp--preset--shadow--card)">
        <!-- wp:heading {"level":3,"fontSize":"lg"} -->
        <h3 class="wp-block-heading has-lg-font-size">{{PRICING_3_NAME}}</h3>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"fontSize":"xl"} -->
        <p class="has-xl-font-size">{{PRICING_3_PRICE}}</p>
        <!-- /wp:paragraph -->
        <!-- wp:list {"fontSize":"sm"} -->
        <ul class="has-sm-font-size">{{PRICING_3_FEATURES}}</ul>
        <!-- /wp:list -->
        <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"stretch"}} -->
        <div class="wp-block-buttons">
          <!-- wp:button {"width":100,"backgroundColor":"primary","textColor":"soft-bg","style":{"shadow":"var:preset|shadow|primary-glow"}} -->
          <div class="wp-block-button has-custom-width wp-block-button__width-100"><a
              class="wp-block-button__link has-soft-bg-color has-primary-background-color has-text-color has-background wp-element-button"
              style="box-shadow:var(--wp--preset--shadow--primary-glow)" href="#contact">{{PRICING_3_CTA}}</a></div>
          <!-- /wp:button -->
        </div>
        <!-- /wp:buttons -->
      </div>
      <!-- /wp:group -->
    </div>
    <!-- /wp:column -->
  </div>
  <!-- /wp:columns -->
</div>
<!-- /wp:group -->