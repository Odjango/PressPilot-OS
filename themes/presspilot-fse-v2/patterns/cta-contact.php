<?php
/**
 * Title: PressPilot – CTA Contact
 * Slug: presspilot/cta-contact
 * Categories: presspilot, presspilot-starter
 * Description: Split contact panel with copy tokens for PressPilot kits.
 */
?>
<!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|60","right":"var:preset|spacing|40","bottom":"var:preset|spacing|60","left":"var:preset|spacing|40"}}},"layout":{"type":"constrained","contentSize":"1100px"}} -->
<div class="wp-block-group is-layout-constrained"
  style="padding-top:var(--wp--preset--spacing--60);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--60);padding-left:var(--wp--preset--spacing--40)">
  <!-- wp:columns {"style":{"spacing":{"blockGap":"var:preset|spacing|40"}}} -->
  <div class="wp-block-columns" style="gap:var(--wp--preset--spacing--40)">
    <!-- wp:column -->
    <div class="wp-block-column">
      <!-- wp:heading {"level":2,"fontSize":"xl"} -->
      <h2 class="wp-block-heading has-xl-font-size">{{CONTACT_HEADLINE}}</h2>
      <!-- /wp:heading -->

      <!-- wp:paragraph {"fontSize":"sm"} -->
      <p class="has-sm-font-size">{{CONTACT_BODY}}</p>
      <!-- /wp:paragraph -->

      <!-- wp:list {"fontSize":"sm"} -->
      <ul class="has-sm-font-size">
        <li><strong>Email:</strong> <span>{{CONTACT_EMAIL}}</span></li>
      </ul>
      <!-- /wp:list -->
    </div>
    <!-- /wp:column -->

    <!-- wp:column -->
    <div class="wp-block-column">
      <!-- wp:group {"style":{"border":{"width":"1px","style":"dashed","color":"var:preset|color|border"},"spacing":{"padding":{"top":"var:preset|spacing|40","right":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40"}},"background":{"color":"var:preset|color|background"}},"layout":{"type":"constrained"}} -->
      <div class="wp-block-group has-background"
        style="background-color:var(--wp--preset--color--background);border-color:var(--wp--preset--color--border);border-style:dashed;border-width:1px;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)">
        <!-- wp:paragraph {"fontSize":"sm"} -->
        <p class="has-sm-font-size">{{CONTACT_PRIMARY_CTA}}</p>
        <!-- /wp:paragraph -->
      </div>
      <!-- /wp:group -->
    </div>
    <!-- /wp:column -->
  </div>
  <!-- /wp:columns -->
</div>
<!-- /wp:group -->