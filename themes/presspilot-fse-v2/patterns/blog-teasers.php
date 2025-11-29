<?php
/**
 * Title: PressPilot – Blog Teasers
 * Slug: presspilot/blog-teasers
 * Categories: presspilot, presspilot-starter
 * Description: Lightweight blog teaser section powered by Latest Posts.
 */
?>
<!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|50","right":"var:preset|spacing|40","bottom":"var:preset|spacing|60","left":"var:preset|spacing|40"}}},"layout":{"type":"constrained","contentSize":"1100px"}} -->
<div class="wp-block-group is-layout-constrained"
  style="padding-top:var(--wp--preset--spacing--50);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--60);padding-left:var(--wp--preset--spacing--40)">
  <!-- wp:heading {"textAlign":"center","level":2,"fontSize":"xl"} -->
  <h2 class="wp-block-heading has-text-align-center has-xl-font-size">{{UPDATES_HEADING}}</h2>
  <!-- /wp:heading -->

  <!-- wp:paragraph {"align":"center","textColor":"muted","fontSize":"sm"} -->
  <p class="has-text-align-center has-muted-color has-sm-font-size">{{UPDATES_SUBHEADING}}</p>
  <!-- /wp:paragraph -->

  <!-- wp:columns {"style":{"spacing":{"margin":{"top":"var:preset|spacing|40"},"blockGap":"var:preset|spacing|30"}}} -->
  <div class="wp-block-columns is-layout-flex"
    style="margin-top:var(--wp--preset--spacing--40);gap:var(--wp--preset--spacing--30)">
    <!-- wp:column -->
    <div class="wp-block-column">
      <!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|20"},"border":{"width":"1px","style":"solid","color":"var:preset|color|border"},"padding":{"top":"var:preset|spacing|30","right":"var:preset|spacing|30","bottom":"var:preset|spacing|30","left":"var:preset|spacing|30"},"shadow":"var:preset|shadow|card"},"backgroundColor":"soft-bg"} -->
      <div class="wp-block-group has-soft-bg-background-color has-background"
        style="border-color:var(--wp--preset--color--border);border-style:solid;border-width:1px;padding-top:var(--wp--preset--spacing--30);padding-right:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--30);padding-left:var(--wp--preset--spacing--30);box-shadow:var(--wp--preset--shadow--card)">
        <!-- wp:paragraph {"textColor":"muted","fontSize":"xs"} -->
        <p class="has-muted-color has-xs-font-size">{{UPDATE_1_EYEBROW}}</p>
        <!-- /wp:paragraph -->
        <!-- wp:heading {"level":3,"fontSize":"lg"} -->
        <h3 class="wp-block-heading has-lg-font-size">{{UPDATE_1_TITLE}}</h3>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"fontSize":"sm"} -->
        <p class="has-sm-font-size">{{UPDATE_1_BODY}}</p>
        <!-- /wp:paragraph -->
      </div>
      <!-- /wp:group -->
    </div>
    <!-- /wp:column -->

    <!-- wp:column -->
    <div class="wp-block-column">
      <!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|20"},"border":{"width":"1px","style":"solid","color":"var:preset|color|border"},"padding":{"top":"var:preset|spacing|30","right":"var:preset|spacing|30","bottom":"var:preset|spacing|30","left":"var:preset|spacing|30"},"shadow":"var:preset|shadow|card"},"backgroundColor":"soft-bg"} -->
      <div class="wp-block-group has-soft-bg-background-color has-background"
        style="border-color:var(--wp--preset--color--border);border-style:solid;border-width:1px;padding-top:var(--wp--preset--spacing--30);padding-right:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--30);padding-left:var(--wp--preset--spacing--30);box-shadow:var(--wp--preset--shadow--card)">
        <!-- wp:paragraph {"textColor":"muted","fontSize":"xs"} -->
        <p class="has-muted-color has-xs-font-size">{{UPDATE_2_EYEBROW}}</p>
        <!-- /wp:paragraph -->
        <!-- wp:heading {"level":3,"fontSize":"lg"} -->
        <h3 class="wp-block-heading has-lg-font-size">{{UPDATE_2_TITLE}}</h3>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"fontSize":"sm"} -->
        <p class="has-sm-font-size">{{UPDATE_2_BODY}}</p>
        <!-- /wp:paragraph -->
      </div>
      <!-- /wp:group -->
    </div>
    <!-- /wp:column -->

    <!-- wp:column -->
    <div class="wp-block-column">
      <!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|20"},"border":{"width":"1px","style":"solid","color":"var:preset|color|border"},"padding":{"top":"var:preset|spacing|30","right":"var:preset|spacing|30","bottom":"var:preset|spacing|30","left":"var:preset|spacing|30"},"shadow":"var:preset|shadow|card"},"backgroundColor":"soft-bg"} -->
      <div class="wp-block-group has-soft-bg-background-color has-background"
        style="border-color:var(--wp--preset--color--border);border-style:solid;border-width:1px;padding-top:var(--wp--preset--spacing--30);padding-right:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--30);padding-left:var(--wp--preset--spacing--30);box-shadow:var(--wp--preset--shadow--card)">
        <!-- wp:paragraph {"textColor":"muted","fontSize":"xs"} -->
        <p class="has-muted-color has-xs-font-size">{{UPDATE_3_EYEBROW}}</p>
        <!-- /wp:paragraph -->
        <!-- wp:heading {"level":3,"fontSize":"lg"} -->
        <h3 class="wp-block-heading has-lg-font-size">{{UPDATE_3_TITLE}}</h3>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"fontSize":"sm"} -->
        <p class="has-sm-font-size">{{UPDATE_3_BODY}}</p>
        <!-- /wp:paragraph -->
      </div>
      <!-- /wp:group -->
    </div>
    <!-- /wp:column -->
  </div>
  <!-- /wp:columns -->
</div>
<!-- /wp:group -->