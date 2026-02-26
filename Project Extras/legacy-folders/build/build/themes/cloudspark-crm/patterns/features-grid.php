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
  <h2 class="wp-block-heading has-text-align-center has-xl-font-size">Everything you need to ship faster</h2>
  <!-- /wp:heading -->

  <!-- wp:columns {"style":{"spacing":{"blockGap":"var:preset|spacing|40","margin":{"top":"var:preset|spacing|40"}}},"className":"feature-grid"} -->
  <div class="wp-block-columns feature-grid" style="margin-top:var(--wp--preset--spacing--40)">
    <!-- wp:column -->
    <div class="wp-block-column">
      <!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|20"},"border":{"width":"1px","style":"solid","color":"var:preset|color|border"},"padding":{"top":"var:preset|spacing|30","right":"var:preset|spacing|30","bottom":"var:preset|spacing|30","left":"var:preset|spacing|30"}},"backgroundColor":"soft-bg","className":"pp-card feature-card"} -->
      <div class="wp-block-group has-soft-bg-background-color pp-card feature-card has-background" style="border-color:var(--wp--preset--color--border);border-style:solid;border-width:1px;padding-top:var(--wp--preset--spacing--30);padding-right:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--30);padding-left:var(--wp--preset--spacing--30)">
        <!-- wp:heading {"level":3,"fontSize":"lg"} -->
        <h3 class="wp-block-heading has-lg-font-size pp-feature-title">🚀 Fast builds</h3>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"fontSize":"sm"} -->
        <p class="has-sm-font-size pp-feature-body">Generate complete landing pages and patterns in minutes, not weeks.</p>
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
        <h3 class="wp-block-heading has-lg-font-size pp-feature-title">🎨 Flexible styles</h3>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"fontSize":"sm"} -->
        <p class="has-sm-font-size pp-feature-body">Swap between curated palettes and typography without touching code.</p>
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
        <h3 class="wp-block-heading has-lg-font-size pp-feature-title">🌍 Multilingual-ready</h3>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"fontSize":"sm"} -->
        <p class="has-sm-font-size pp-feature-body">Serve global audiences with RTL-aware content and layouts.</p>
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
        <h3 class="wp-block-heading has-lg-font-size pp-feature-title">🔐 Production ready</h3>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"fontSize":"sm"} -->
        <p class="has-sm-font-size pp-feature-body">Clean block markup, solid theme tokens, and exportable static builds.</p>
        <!-- /wp:paragraph -->
      </div>
      <!-- /wp:group -->
    </div>
    <!-- /wp:column -->
  </div>
  <!-- /wp:columns -->
</div>
<!-- /wp:group -->
