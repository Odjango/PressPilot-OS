<?php
/**
 * Title: PressPilot – Pricing Columns
 * Slug: presspilot/pricing-columns
 * Categories: presspilot, presspilot-starter
 * Description: Three-column pricing grid for PressPilot Golden Foundation.
 */
?>
<!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|50","right":"var:preset|spacing|40","bottom":"var:preset|spacing|50","left":"var:preset|spacing|40"}}},"layout":{"type":"constrained","contentSize":"1100px"},"className":"presspilot-pattern pricing-columns"} -->
<div class="wp-block-group presspilot-pattern pricing-columns" style="padding-top:var(--wp--preset--spacing--50);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--50);padding-left:var(--wp--preset--spacing--40)">
  <!-- wp:heading {"textAlign":"center","level":2,"fontSize":"xl"} -->
  <h2 class="wp-block-heading has-text-align-center has-xl-font-size">Transparent pricing for every stage</h2>
  <!-- /wp:heading -->

  <!-- wp:paragraph {"align":"center","textColor":"muted","fontSize":"sm"} -->
  <p class="has-text-align-center has-muted-color has-sm-font-size">Launch-ready kits, feature toggles, and support tiers that scale with your roadmap.</p>
  <!-- /wp:paragraph -->

  <!-- wp:columns {"style":{"spacing":{"margin":{"top":"var:preset|spacing|40"},"blockGap":"var:preset|spacing|40"}}} -->
  <div class="wp-block-columns" style="margin-top:var(--wp--preset--spacing--40)">
    <!-- wp:column -->
    <div class="wp-block-column">
      <!-- wp:group {"style":{"border":{"width":"1px","style":"solid","color":"var:preset|color|border"},"spacing":{"padding":{"top":"var:preset|spacing|40","right":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40"}}},"layout":{"type":"constrained"}} -->
      <div class="wp-block-group" style="border-color:var(--wp--preset--color--border);border-style:solid;border-width:1px;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)">
        <!-- wp:heading {"level":3,"fontSize":"lg"} -->
        <h3 class="wp-block-heading has-lg-font-size pp-plan-name">Starter</h3>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"fontSize":"xl"} -->
        <p class="has-xl-font-size pp-plan-price"><strong>$19</strong> / month</p>
        <!-- /wp:paragraph -->
        <!-- wp:list {"className":"is-style-checkmark","fontSize":"sm"} -->
        <ul class="is-style-checkmark has-sm-font-size"><li class="pp-plan-feature">1 brand setup</li><li class="pp-plan-feature">Basic analytics</li><li class="pp-plan-feature">Email support</li></ul>
        <!-- /wp:list -->
        <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"stretch"}} -->
        <div class="wp-block-buttons">
          <!-- wp:button {"text":"Choose Starter","width":100} /-->
        </div>
        <!-- /wp:buttons -->
      </div>
      <!-- /wp:group -->
    </div>
    <!-- /wp:column -->

    <!-- wp:column -->
    <div class="wp-block-column">
      <!-- wp:group {"style":{"border":{"width":"2px","style":"solid","color":"var:preset|color|primary"},"spacing":{"padding":{"top":"var:preset|spacing|40","right":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40"}}},"layout":{"type":"constrained"}} -->
      <div class="wp-block-group" style="border-color:var(--wp--preset--color--primary);border-style:solid;border-width:2px;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)">
        <!-- wp:heading {"level":3,"fontSize":"lg"} -->
        <h3 class="wp-block-heading has-lg-font-size pp-plan-name">Growth</h3>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"fontSize":"xl"} -->
        <p class="has-xl-font-size pp-plan-price"><strong>$49</strong> / month</p>
        <!-- /wp:paragraph -->
        <!-- wp:list {"className":"is-style-checkmark","fontSize":"sm"} -->
        <ul class="is-style-checkmark has-sm-font-size"><li class="pp-plan-feature">Unlimited kits</li><li class="pp-plan-feature">Woo + Menu add-ons</li><li class="pp-plan-feature">Priority support</li></ul>
        <!-- /wp:list -->
        <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"stretch"}} -->
        <div class="wp-block-buttons">
          <!-- wp:button {"text":"Choose Growth","width":100} /-->
        </div>
        <!-- /wp:buttons -->
      </div>
      <!-- /wp:group -->
    </div>
    <!-- /wp:column -->

    <!-- wp:column -->
    <div class="wp-block-column">
      <!-- wp:group {"style":{"border":{"width":"1px","style":"solid","color":"var:preset|color|border"},"spacing":{"padding":{"top":"var:preset|spacing|40","right":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40"}}},"layout":{"type":"constrained"}} -->
      <div class="wp-block-group" style="border-color:var(--wp--preset--color--border);border-style:solid;border-width:1px;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)">
        <!-- wp:heading {"level":3,"fontSize":"lg"} -->
        <h3 class="wp-block-heading has-lg-font-size pp-plan-name">Pro</h3>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"fontSize":"xl"} -->
        <p class="has-xl-font-size pp-plan-price"><strong>$99</strong> / month</p>
        <!-- /wp:paragraph -->
        <!-- wp:list {"className":"is-style-checkmark","fontSize":"sm"} -->
        <ul class="is-style-checkmark has-sm-font-size"><li class="pp-plan-feature">Dedicated strategist</li><li class="pp-plan-feature">Custom exports</li><li class="pp-plan-feature">SLA &amp; training</li></ul>
        <!-- /wp:list -->
        <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"stretch"}} -->
        <div class="wp-block-buttons">
          <!-- wp:button {"text":"Choose Pro","width":100} /-->
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
