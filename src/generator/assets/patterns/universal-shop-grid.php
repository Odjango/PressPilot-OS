<?php
/**
 * Title: Shop Product Grid
 * Slug: presspilot/shop-grid
 * Categories: ecommerce
 * Keywords: products, shop, woocommerce
 */
?>
<!-- wp:group {"align":"wide","style":{"spacing":{"padding":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50"}}}} -->
<div class="wp-block-group alignwide"
    style="padding-top:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--50)">
    <!-- wp:heading {"textAlign":"center","level":2} -->
    <h2 class="wp-block-heading has-text-align-center">Featured Products</h2>
    <!-- /wp:heading -->

    <!-- wp:woocommerce/product-collection {"query":{"perPage":4,"pages":1,"offset":0,"postType":"product","featured":true}} -->
    <div class="wp-block-woocommerce-product-collection">
        <!-- wp:woocommerce/product-template -->
        <!-- wp:group {"style":{"border":{"width":"1px"}},"borderColor":"contrast"} -->
        <div class="wp-block-group has-border-color has-contrast-border-color" style="border-width:1px">
            <!-- wp:woocommerce/product-image /-->
            <!-- wp:post-title {"isLink":true,"fontSize":"medium"} /-->
            <!-- wp:woocommerce/product-price /-->
            <!-- wp:woocommerce/product-button /-->
        </div>
        <!-- /wp:group -->
        <!-- /wp:woocommerce/product-template -->
    </div>
    <!-- /wp:woocommerce/product-collection -->
</div>
<!-- /wp:group -->