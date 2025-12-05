<?php
/**
 * Title: Hero - Default
 * Slug: presspilot/hero-default
 * Categories: presspilot, text
 * Block Types: core/post-content
 * Description: Simple hero with heading, text and button.
 */
?>
<!-- wp:group {"layout":{"type":"constrained"},"style":{"spacing":{"blockGap":"1rem","padding":{"top":"2rem","bottom":"2rem"}}}} -->
<div class="wp-block-group">
    <!-- wp:heading {"level":1,"fontSize":"xl"} -->
    <h1 class="has-xl-font-size">Grow your business with a modern WordPress site.</h1>
    <!-- /wp:heading -->

    <!-- wp:paragraph {"fontSize":"md"} -->
    <p class="has-md-font-size">Launch fast, stay flexible, and keep full control over your content with a clean,
        block-based theme.</p>
    <!-- /wp:paragraph -->

    <!-- wp:buttons -->
    <div class="wp-block-buttons">
        <!-- wp:button -->
        <div class="wp-block-button">
            <a class="wp-block-button__link">Get started</a>
        </div>
        <!-- /wp:button -->

        <!-- wp:button {"className":"is-style-outline"} -->
        <div class="wp-block-button is-style-outline">
            <a class="wp-block-button__link">View services</a>
        </div>
        <!-- /wp:button -->
    </div>
    <!-- /wp:buttons -->
</div>
<!-- /wp:group -->