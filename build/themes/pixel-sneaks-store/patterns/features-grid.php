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
  <h2 class="wp-block-heading has-text-align-center has-xl-font-size">Tools for modern storefronts</h2>
  <!-- /wp:heading -->

  <!-- wp:columns {"style":{"spacing":{"blockGap":"var:preset|spacing|40","margin":{"top":"var:preset|spacing|40"}}},"className":"feature-grid"} -->
  <div class="wp-block-columns feature-grid" style="margin-top:var(--wp--preset--spacing--40)">
    <!-- wp:column -->
    <div class="wp-block-column">
      <!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|20"},"border":{"width":"1px","style":"solid","color":"var:preset|color|border"},"padding":{"top":"var:preset|spacing|30","right":"var:preset|spacing|30","bottom":"var:preset|spacing|30","left":"var:preset|spacing|30"}},"backgroundColor":"soft-bg","className":"pp-card feature-card"} -->
      <div class="wp-block-group has-soft-bg-background-color pp-card feature-card has-background" style="border-color:var(--wp--preset--color--border);border-style:solid;border-width:1px;padding-top:var(--wp--preset--spacing--30);padding-right:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--30);padding-left:var(--wp--preset--spacing--30)">
        <!-- wp:heading {"level":3,"fontSize":"lg"} -->
        <h3 class="wp-block-heading has-lg-font-size pp-feature-title">🛒 Product storytelling</h3>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"fontSize":"sm"} -->
        <p class="has-sm-font-size pp-feature-body">Hero, feature, and testimonial blocks geared for merch drops and launches.</p>
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
        <h3 class="wp-block-heading has-lg-font-size pp-feature-title">💳 Payment-ready sections</h3>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"fontSize":"sm"} -->
        <p class="has-sm-font-size pp-feature-body">Highlight offers, bundles, and flexible pricing with purpose-built cards.</p>
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
        <h3 class="wp-block-heading has-lg-font-size pp-feature-title">📦 Catalog friendly</h3>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"fontSize":"sm"} -->
        <p class="has-sm-font-size pp-feature-body">Grid layouts optimized for MOQ, bundle, or SKU callouts.</p>
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
        <h3 class="wp-block-heading has-lg-font-size pp-feature-title">📈 Marketing ready</h3>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"fontSize":"sm"} -->
        <p class="has-sm-font-size pp-feature-body">Sections for promos, reviews, and newsletter capture built-in.</p>
        <!-- /wp:paragraph -->
      </div>
      <!-- /wp:group -->
    </div>
    <!-- /wp:column -->
  </div>
  <!-- /wp:columns -->
</div>
<!-- /wp:group -->
