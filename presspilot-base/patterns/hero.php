<?php
/**
 * Title: Modern Hero Section
 * Slug: presspilot/hero-modern
 * Categories: featured, banner
 * Viewport Width: 1400
 */
?>
<!-- wp:cover {"url":"https://s.w.org/images/core/5.3/MtBlanc1.jpg","dimRatio":60,"overlayColor":"black","align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|80","bottom":"var:preset|spacing|80"}}}} -->
<div class="wp-block-cover alignfull has-black-background-color has-background-dim-60 has-background-dim"
    style="padding-top:var(--wp--preset--spacing--80);padding-bottom:var(--wp--preset--spacing--80)">
    <span aria-hidden="true"
        class="wp-block-cover__background has-black-background-color has-background-dim-60 has-background-dim"></span>
    <img class="wp-block-cover__image-background" src="https://s.w.org/images/core/5.3/MtBlanc1.jpg" alt="Mount Blanc"
        data-object-fit="cover" />

    <div class="wp-block-cover__inner-container">
        <!-- wp:group {"layout":{"type":"constrained"}} -->
        <div class="wp-block-group">

            <!-- wp:heading {"textAlign":"center","style":{"typography":{"fontSize":"var:preset|font-size|x-large","fontWeight":"800"}},"textColor":"white"} -->
            <h1 class="wp-block-heading has-white-color has-text-color has-text-align-center"
                style="font-size:var(--wp--preset--font-size--x-large);font-weight:800">
                Launch Your Vision with PressPilot
            </h1>
            <!-- /wp:heading -->

            <!-- wp:paragraph {"align":"center","textColor":"cyan-bluish-gray","style":{"typography":{"fontSize":"var:preset|font-size|medium"}}} -->
            <p class="has-text-align-center has-cyan-bluish-gray-color has-text-color"
                style="font-size:var(--wp--preset--font-size--medium)">
                A scalable, modern foundation for your next big idea. Generated in seconds, built to last.
            </p>
            <!-- /wp:paragraph -->

            <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"margin":{"top":"var:preset|spacing|40"}}}} -->
            <div class="wp-block-buttons" style="margin-top:var(--wp--preset--spacing--40)">
                <!-- wp:button {"borderRadius":4,"backgroundColor":"white","textColor":"black"} -->
                <div class="wp-block-button"><a
                        class="wp-block-button__link has-black-color has-white-background-color has-text-color has-background"
                        style="border-radius:4px">Get Started</a></div>
                <!-- /wp:button -->

                <!-- wp:button {"borderRadius":4,"className":"is-style-outline","textColor":"white"} -->
                <div class="wp-block-button is-style-outline"><a
                        class="wp-block-button__link has-white-color has-text-color" style="border-radius:4px">Learn
                        More</a></div>
                <!-- /wp:button -->
            </div>
            <!-- /wp:buttons -->
        </div>
        <!-- /wp:group -->
    </div>
</div>
<!-- /wp:cover -->