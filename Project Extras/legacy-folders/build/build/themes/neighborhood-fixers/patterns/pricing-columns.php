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
  <h2 class="wp-block-heading has-text-align-center has-xl-font-size">Plans for every service</h2>
  <!-- /wp:heading -->

  <!-- wp:paragraph {"align":"center","textColor":"muted","fontSize":"sm"} -->
  <p class="has-text-align-center has-muted-color has-sm-font-size">Neighborhood Fixers can switch tiers any time—kits stay in sync automatically.</p>
  <!-- /wp:paragraph -->

  <!-- wp:columns {"style":{"spacing":{"margin":{"top":"var:preset|spacing|40"},"blockGap":"var:preset|spacing|40"}},"className":"pricing-grid"} -->
  <div class="wp-block-columns pricing-grid" style="margin-top:var(--wp--preset--spacing--40)">
    <!-- wp:column -->
    <div class="wp-block-column">
      <!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|30"},"border":{"width":"1px","style":"solid","color":"var:preset|color|border"},"padding":{"top":"var:preset|spacing|40","right":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40"}},"layout":{"type":"constrained"},"className":"pp-pricing-card pricing-card"} -->
      <div class="wp-block-group pp-pricing-card pricing-card" style="border-color:var(--wp--preset--color--border);border-style:solid;border-width:1px;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)">
        <!-- wp:heading {"level":3,"fontSize":"lg"} -->
        <h3 class="wp-block-heading has-lg-font-size pp-plan-name">Starter</h3>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"fontSize":"xl"} -->
        <p class="has-xl-font-size pp-plan-price">$19 / month</p>
        <!-- /wp:paragraph -->
        <!-- wp:list {"className":"pp-plan-list","fontSize":"sm"} -->
        <ul class="pp-plan-list has-sm-font-size"><li class="pp-plan-feature">1 brand setup</li><li class="pp-plan-feature">Basic analytics</li><li class="pp-plan-feature">Email support</li></ul>
        <!-- /wp:list -->
        <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"stretch"}} -->
        <div class="wp-block-buttons">
          <!-- wp:button {"className":"pp-button-primary btn primary","width":100} -->
          <div class="wp-block-button pp-button-primary btn primary">
            <a class="wp-block-button__link btn primary" href="#contact">Choose Starter</a>
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
      <!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|30"},"border":{"width":"2px","style":"solid","color":"var:preset|color|primary"},"padding":{"top":"var:preset|spacing|40","right":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40"}},"layout":{"type":"constrained"},"className":"pp-pricing-card pricing-card highlight pp-pricing-card-highlight highlight"} -->
      <div class="wp-block-group pp-pricing-card pricing-card highlight pp-pricing-card-highlight highlight" style="border-color:var(--wp--preset--color--primary);border-style:solid;border-width:2px;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)">
        <!-- wp:heading {"level":3,"fontSize":"lg"} -->
        <h3 class="wp-block-heading has-lg-font-size pp-plan-name">Growth</h3>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"fontSize":"xl"} -->
        <p class="has-xl-font-size pp-plan-price">$49 / month</p>
        <!-- /wp:paragraph -->
        <!-- wp:list {"className":"pp-plan-list","fontSize":"sm"} -->
        <ul class="pp-plan-list has-sm-font-size"><li class="pp-plan-feature">Unlimited kits</li><li class="pp-plan-feature">Mode-aware add-ons</li><li class="pp-plan-feature">Priority support</li></ul>
        <!-- /wp:list -->
        <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"stretch"}} -->
        <div class="wp-block-buttons">
          <!-- wp:button {"className":"pp-button-primary btn primary","width":100} -->
          <div class="wp-block-button pp-button-primary btn primary">
            <a class="wp-block-button__link btn primary" href="#contact">Choose Growth</a>
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
      <!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|30"},"border":{"width":"1px","style":"solid","color":"var:preset|color|border"},"padding":{"top":"var:preset|spacing|40","right":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40"}},"layout":{"type":"constrained"},"className":"pp-pricing-card pricing-card"} -->
      <div class="wp-block-group pp-pricing-card pricing-card" style="border-color:var(--wp--preset--color--border);border-style:solid;border-width:1px;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)">
        <!-- wp:heading {"level":3,"fontSize":"lg"} -->
        <h3 class="wp-block-heading has-lg-font-size pp-plan-name">Pro</h3>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"fontSize":"xl"} -->
        <p class="has-xl-font-size pp-plan-price">$99 / month</p>
        <!-- /wp:paragraph -->
        <!-- wp:list {"className":"pp-plan-list","fontSize":"sm"} -->
        <ul class="pp-plan-list has-sm-font-size"><li class="pp-plan-feature">Dedicated strategist</li><li class="pp-plan-feature">Custom exports</li><li class="pp-plan-feature">Training & SLA</li></ul>
        <!-- /wp:list -->
        <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"stretch"}} -->
        <div class="wp-block-buttons">
          <!-- wp:button {"className":"pp-button-primary btn primary","width":100} -->
          <div class="wp-block-button pp-button-primary btn primary">
            <a class="wp-block-button__link btn primary" href="#contact">Choose Pro</a>
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
