<?php
/**
 * Title: PressPilot – Pricing Columns
 * Slug: presspilot/pricing-columns
 * Categories: presspilot, presspilot-starter
 * Description: Three-column pricing grid for PressPilot Golden Foundation.
 */
?>
<!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|50","right":"var:preset|spacing|40","bottom":"var:preset|spacing|50","left":"var:preset|spacing|40"}}},"layout":{"type":"constrained","contentSize":"1100px"},"className":"presspilot-section presspilot-pattern pricing-columns"} -->
<div class="wp-block-group presspilot-section presspilot-pattern pricing-columns" style="padding-top:var(--wp--preset--spacing--50);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--50);padding-left:var(--wp--preset--spacing--40)">
  <!-- wp:heading {"textAlign":"center","level":2,"fontSize":"xl"} -->
  <h2 class="wp-block-heading has-text-align-center has-xl-font-size">{{PRICING_HEADING}}</h2>
  <!-- /wp:heading -->

  <!-- wp:paragraph {"align":"center","textColor":"muted","fontSize":"sm"} -->
  <p class="has-text-align-center has-muted-color has-sm-font-size">{{PRICING_SUBHEADING}}</p>
  <!-- /wp:paragraph -->

  <!-- wp:columns {"style":{"spacing":{"margin":{"top":"var:preset|spacing|40"},"blockGap":"var:preset|spacing|40"}},"className":"pricing-grid"} -->
  <div class="wp-block-columns pricing-grid" style="margin-top:var(--wp--preset--spacing--40)">
    <!-- wp:column -->
    <div class="wp-block-column">
      <!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|30"},"border":{"width":"1px","style":"solid","color":"var:preset|color|border"},"padding":{"top":"var:preset|spacing|40","right":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40"}},"layout":{"type":"constrained"},"className":"pp-pricing-card pricing-card{{PRICING_1_CARD_CLASS}}"} -->
      <div class="wp-block-group pp-pricing-card pricing-card{{PRICING_1_CARD_CLASS}}" style="border-color:var(--wp--preset--color--border);border-style:solid;border-width:1px;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)">
        <!-- wp:heading {"level":3,"fontSize":"lg"} -->
        <h3 class="wp-block-heading has-lg-font-size pp-plan-name">{{PRICING_1_NAME}}</h3>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"fontSize":"xl"} -->
        <p class="has-xl-font-size pp-plan-price">{{PRICING_1_PRICE}}</p>
        <!-- /wp:paragraph -->
        <!-- wp:list {"className":"pp-plan-list","fontSize":"sm"} -->
        <ul class="pp-plan-list has-sm-font-size">{{PRICING_1_FEATURES}}</ul>
        <!-- /wp:list -->
        <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"stretch"}} -->
        <div class="wp-block-buttons">
          <!-- wp:button {"className":"pp-button-primary btn primary","width":100} -->
          <div class="wp-block-button pp-button-primary btn primary">
            <a class="wp-block-button__link btn primary" href="#contact">{{PRICING_1_CTA}}</a>
          </div>
          <!-- /wp:button -->
        </div>
        <!-- /wp:buttons -->
      </div>
      <!-- /wp:group -->
    </div>
    <!-- /wp:column -->

    <!-- wp:column -->
    <div class="wp-block-column">
      <!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|30"},"border":{"width":"2px","style":"solid","color":"var:preset|color|primary"},"padding":{"top":"var:preset|spacing|40","right":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40"}},"layout":{"type":"constrained"},"className":"pp-pricing-card pricing-card highlight pp-pricing-card-highlight{{PRICING_2_CARD_CLASS}}"} -->
      <div class="wp-block-group pp-pricing-card pricing-card highlight pp-pricing-card-highlight{{PRICING_2_CARD_CLASS}}" style="border-color:var(--wp--preset--color--primary);border-style:solid;border-width:2px;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)">
        <!-- wp:heading {"level":3,"fontSize":"lg"} -->
        <h3 class="wp-block-heading has-lg-font-size pp-plan-name">{{PRICING_2_NAME}}</h3>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"fontSize":"xl"} -->
        <p class="has-xl-font-size pp-plan-price">{{PRICING_2_PRICE}}</p>
        <!-- /wp:paragraph -->
        <!-- wp:list {"className":"pp-plan-list","fontSize":"sm"} -->
        <ul class="pp-plan-list has-sm-font-size">{{PRICING_2_FEATURES}}</ul>
        <!-- /wp:list -->
        <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"stretch"}} -->
        <div class="wp-block-buttons">
          <!-- wp:button {"className":"pp-button-primary btn primary","width":100} -->
          <div class="wp-block-button pp-button-primary btn primary">
            <a class="wp-block-button__link btn primary" href="#contact">{{PRICING_2_CTA}}</a>
          </div>
          <!-- /wp:button -->
        </div>
        <!-- /wp:buttons -->
      </div>
      <!-- /wp:group -->
    </div>
    <!-- /wp:column -->

    <!-- wp:column -->
    <div class="wp-block-column">
      <!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|30"},"border":{"width":"1px","style":"solid","color":"var:preset|color|border"},"padding":{"top":"var:preset|spacing|40","right":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40"}},"layout":{"type":"constrained"},"className":"pp-pricing-card pricing-card{{PRICING_3_CARD_CLASS}}"} -->
      <div class="wp-block-group pp-pricing-card pricing-card{{PRICING_3_CARD_CLASS}}" style="border-color:var(--wp--preset--color--border);border-style:solid;border-width:1px;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)">
        <!-- wp:heading {"level":3,"fontSize":"lg"} -->
        <h3 class="wp-block-heading has-lg-font-size pp-plan-name">{{PRICING_3_NAME}}</h3>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"fontSize":"xl"} -->
        <p class="has-xl-font-size pp-plan-price">{{PRICING_3_PRICE}}</p>
        <!-- /wp:paragraph -->
        <!-- wp:list {"className":"pp-plan-list","fontSize":"sm"} -->
        <ul class="pp-plan-list has-sm-font-size">{{PRICING_3_FEATURES}}</ul>
        <!-- /wp:list -->
        <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"stretch"}} -->
        <div class="wp-block-buttons">
          <!-- wp:button {"className":"pp-button-primary btn primary","width":100} -->
          <div class="wp-block-button pp-button-primary btn primary">
            <a class="wp-block-button__link btn primary" href="#contact">{{PRICING_3_CTA}}</a>
          </div>
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
