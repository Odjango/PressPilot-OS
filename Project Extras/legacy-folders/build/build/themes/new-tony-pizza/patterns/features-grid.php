<?php
/**
 * Title: PressPilot – Features Grid
 * Slug: presspilot/features-grid
 * Categories: presspilot, presspilot-starter
 * Description: Responsive four-card feature grid using PressPilot tokens.
 */
?>
<!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|50","right":"var:preset|spacing|40","bottom":"var:preset|spacing|50","left":"var:preset|spacing|40"}}},"layout":{"type":"constrained","contentSize":"1100px"},"className":"presspilot-section presspilot-pattern features-grid"} -->
<div class="wp-block-group presspilot-section presspilot-pattern features-grid" style="padding-top:var(--wp--preset--spacing--50);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--50);padding-left:var(--wp--preset--spacing--40)">
  <!-- wp:heading {"textAlign":"center","level":2,"fontSize":"xl"} -->
  <h2 class="wp-block-heading has-text-align-center has-xl-font-size">Made for dining experiences</h2>
  <!-- /wp:heading -->

  <!-- wp:columns {"style":{"spacing":{"blockGap":"var:preset|spacing|40","margin":{"top":"var:preset|spacing|40"}}},"className":"feature-grid"} -->
  <div class="wp-block-columns feature-grid" style="margin-top:var(--wp--preset--spacing--40)">
    <!-- wp:column -->
    <div class="wp-block-column">
      <!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|20"},"border":{"width":"1px","style":"solid","color":"var:preset|color|border"},"padding":{"top":"var:preset|spacing|30","right":"var:preset|spacing|30","bottom":"var:preset|spacing|30","left":"var:preset|spacing|30"}},"backgroundColor":"soft-bg","className":"pp-card feature-card"} -->
      <div class="wp-block-group has-soft-bg-background-color pp-card feature-card has-background" style="border-color:var(--wp--preset--color--border);border-style:solid;border-width:1px;padding-top:var(--wp--preset--spacing--30);padding-right:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--30);padding-left:var(--wp--preset--spacing--30)">
        <!-- wp:heading {"level":3,"fontSize":"lg"} -->
        <h3 class="wp-block-heading has-lg-font-size pp-feature-title">🍕 Menu storytelling</h3>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"fontSize":"sm"} -->
        <p class="has-sm-font-size pp-feature-body">Highlight signature dishes, chef notes, and seasonal specials.</p>
        <!-- /wp:paragraph -->
      </div>
      <!-- /wp:group -->
    </div>
    <!-- /wp:column -->

    <!-- wp:column -->
    <div class="wp-block-column">
      <!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|20"},"border":{"width":"1px","style":"solid","color":"var:preset|color|border"},"padding":{"top":"var:preset|spacing|30","right":"var:preset|spacing|30","bottom":"var:preset|spacing|30","left":"var:preset|spacing|30"}},"backgroundColor":"soft-bg","className":"pp-card feature-card"} -->
      <div class="wp-block-group has-soft-bg-background-color pp-card feature-card has-background" style="border-color:var(--wp--preset--color--border);border-style:solid;border-width:1px;padding-top:var(--wp--preset--spacing--30);padding-right:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--30);padding-left:var(--wp--preset--spacing--30)">
        <!-- wp:heading {"level":3,"fontSize":"lg"} -->
        <h3 class="wp-block-heading has-lg-font-size pp-feature-title">☎️ Reservation ready</h3>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"fontSize":"sm"} -->
        <p class="has-sm-font-size pp-feature-body">Clear CTAs for booking, phone orders, and walk-ins.</p>
        <!-- /wp:paragraph -->
      </div>
      <!-- /wp:group -->
    </div>
    <!-- /wp:column -->

    <!-- wp:column -->
    <div class="wp-block-column">
      <!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|20"},"border":{"width":"1px","style":"solid","color":"var:preset|color|border"},"padding":{"top":"var:preset|spacing|30","right":"var:preset|spacing|30","bottom":"var:preset|spacing|30","left":"var:preset|spacing|30"}},"backgroundColor":"soft-bg","className":"pp-card feature-card"} -->
      <div class="wp-block-group has-soft-bg-background-color pp-card feature-card has-background" style="border-color:var(--wp--preset--color--border);border-style:solid;border-width:1px;padding-top:var(--wp--preset--spacing--30);padding-right:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--30);padding-left:var(--wp--preset--spacing--30)">
        <!-- wp:heading {"level":3,"fontSize":"lg"} -->
        <h3 class="wp-block-heading has-lg-font-size pp-feature-title">🛵 Delivery & pickup</h3>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"fontSize":"sm"} -->
        <p class="has-sm-font-size pp-feature-body">Promote delivery partners, takeout links, and order hours.</p>
        <!-- /wp:paragraph -->
      </div>
      <!-- /wp:group -->
    </div>
    <!-- /wp:column -->

    <!-- wp:column -->
    <div class="wp-block-column">
      <!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|20"},"border":{"width":"1px","style":"solid","color":"var:preset|color|border"},"padding":{"top":"var:preset|spacing|30","right":"var:preset|spacing|30","bottom":"var:preset|spacing|30","left":"var:preset|spacing|30"}},"backgroundColor":"soft-bg","className":"pp-card feature-card"} -->
      <div class="wp-block-group has-soft-bg-background-color pp-card feature-card has-background" style="border-color:var(--wp--preset--color--border);border-style:solid;border-width:1px;padding-top:var(--wp--preset--spacing--30);padding-right:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--30);padding-left:var(--wp--preset--spacing--30)">
        <!-- wp:heading {"level":3,"fontSize":"lg"} -->
        <h3 class="wp-block-heading has-lg-font-size pp-feature-title">📍 Location friendly</h3>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"fontSize":"sm"} -->
        <p class="has-sm-font-size pp-feature-body">Map, hours, and neighborhood callouts keep guests oriented.</p>
        <!-- /wp:paragraph -->
      </div>
      <!-- /wp:group -->
    </div>
    <!-- /wp:column -->
  </div>
  <!-- /wp:columns -->
</div>
<!-- /wp:group -->
