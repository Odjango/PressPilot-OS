<?php
/**
 * Title: PressPilot – CTA Contact
 * Slug: presspilot/cta-contact
 * Categories: presspilot, presspilot-starter
 * Description: Split contact panel with copy tokens for PressPilot kits.
 */
?>
<!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|60","right":"var:preset|spacing|40","bottom":"var:preset|spacing|60","left":"var:preset|spacing|40"}}},"backgroundColor":"soft-bg","layout":{"type":"constrained","contentSize":"1100px"},"className":"presspilot-section presspilot-pattern cta-contact"} -->
<div class="wp-block-group presspilot-section presspilot-pattern cta-contact has-soft-bg-background-color has-background" style="padding-top:var(--wp--preset--spacing--60);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--60);padding-left:var(--wp--preset--spacing--40)">
  <!-- wp:columns {"style":{"spacing":{"blockGap":"var:preset|spacing|40"}},"className":"cta-contact-grid"} -->
  <div class="wp-block-columns cta-contact-grid">
    <!-- wp:column -->
    <div class="wp-block-column cta-contact__copy">
      <!-- wp:heading {"level":2,"fontSize":"xl"} -->
      <h2 class="wp-block-heading has-xl-font-size pp-contact-heading">Ready to work with New Tony Pizza?</h2>
      <!-- /wp:heading -->

      <!-- wp:paragraph {"fontSize":"sm"} -->
      <p class="has-sm-font-size pp-contact-body">Tell us your party size or catering needs and we’ll confirm quickly. Reach us at hello@new-tony-pizza.com.</p>
      <!-- /wp:paragraph -->

      <!-- wp:list {"fontSize":"sm"} -->
      <ul class="has-sm-font-size"><li><strong>Email:</strong> <span class="pp-contact-email">hello@new-tony-pizza.com</span></li></ul>
      <!-- /wp:list -->
    </div>
    <!-- /wp:column -->

    <!-- wp:column -->
    <div class="wp-block-column">
      <!-- wp:group {"style":{"border":{"width":"1px","style":"dashed","color":"var:preset|color|border"},"spacing":{"padding":{"top":"var:preset|spacing|40","right":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40"}},"background":{"color":"var:preset|color|background"}},"layout":{"type":"constrained"},"className":"pp-cta-card cta-contact__card"} -->
      <div class="wp-block-group pp-cta-card cta-contact__card has-background" style="background-color:var(--wp--preset--color--background);border-color:var(--wp--preset--color--border);border-style:dashed;border-width:1px;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)">
        <!-- wp:paragraph {"fontSize":"sm"} -->
        <p class="has-sm-font-size">Call now</p>
        <!-- /wp:paragraph -->
      </div>
      <!-- /wp:group -->
    </div>
    <!-- /wp:column -->
  </div>
  <!-- /wp:columns -->
</div>
<!-- /wp:group -->

