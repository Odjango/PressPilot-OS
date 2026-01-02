<?php
/**
 * Title: PressPilot Modern Home
 * Slug: presspilot/home-modern
 * Categories: featured
 * Description: A modern homepage layout with Hero, Features, Testimonials, and CTA.
 */
?>
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"0","bottom":"0","left":"0","right":"0"}}},"layout":{"type":"default"}} -->
<div class="wp-block-group alignfull" style="padding-top:0;padding-right:0;padding-bottom:0;padding-left:0">

    <!-- wp:cover {"url":"https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&h=800&fit=crop&q=80","dimRatio":60,"overlayColor":"black","minHeight":600,"align":"full"} -->
    <div class="wp-block-cover alignfull" style="min-height:600px">
        <span aria-hidden="true"
            class="wp-block-cover__background has-black-background-color has-background-dim-60 has-background-dim"></span>
        <img class="wp-block-cover__image-background" alt=""
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&h=800&fit=crop&q=80"
            data-object-fit="cover" />
        <div class="wp-block-cover__inner-container">
            <!-- wp:heading {"textAlign":"center","level":1,"style":{"typography":{"fontSize":"4rem","lineHeight":"1.1","fontWeight":"700"}},"textColor":"white"} -->
            <h1 class="wp-block-heading has-text-align-center has-white-color has-text-color"
                style="font-size:4rem;font-weight:700;line-height:1.1">Welcome to Our Business</h1>
            <!-- /wp:heading -->

            <!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"1.5rem"}},"textColor":"white"} -->
            <p class="has-text-align-center has-white-color has-text-color" style="font-size:1.5rem">Premium Quality
                Services for Modern Needs</p>
            <!-- /wp:paragraph -->

            <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
            <div class="wp-block-buttons">
                <!-- wp:button {"backgroundColor":"vivid-cyan-blue","textColor":"white","style":{"border":{"radius":"4px"}}} -->
                <div class="wp-block-button"><a
                        class="wp-block-button__link has-white-color has-vivid-cyan-blue-background-color has-text-color has-background"
                        style="border-radius:4px">Get Started</a></div>
                <!-- /wp:button -->
            </div>
            <!-- /wp:buttons -->
        </div>
    </div>
    <!-- /wp:cover -->

    <!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|70","bottom":"var:preset|spacing|70"}}},"layout":{"type":"constrained"}} -->
    <div class="wp-block-group alignfull"
        style="padding-top:var(--wp--preset--spacing--70);padding-bottom:var(--wp--preset--spacing--70)">
        <!-- wp:columns -->
        <div class="wp-block-columns">
            <!-- wp:column -->
            <div class="wp-block-column">
                <!-- wp:heading {"level":3,"textAlign":"center"} -->
                <h3 class="wp-block-heading has-text-align-center">Premium Quality</h3>
                <!-- /wp:heading -->
                <!-- wp:paragraph {"align":"center"} -->
                <p class="has-text-align-center">We ensure the highest standards in everything we do.</p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:column -->

            <!-- wp:column -->
            <div class="wp-block-column">
                <!-- wp:heading {"level":3,"textAlign":"center"} -->
                <h3 class="wp-block-heading has-text-align-center">Fast & Reliable</h3>
                <!-- /wp:heading -->
                <!-- wp:paragraph {"align":"center"} -->
                <p class="has-text-align-center">Delivery that you can count on, every single time.</p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:column -->

            <!-- wp:column -->
            <div class="wp-block-column">
                <!-- wp:heading {"level":3,"textAlign":"center"} -->
                <h3 class="wp-block-heading has-text-align-center">Customer First</h3>
                <!-- /wp:heading -->
                <!-- wp:paragraph {"align":"center"} -->
                <p class="has-text-align-center">Your satisfaction is our top priority.</p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:column -->
        </div>
        <!-- /wp:columns -->
    </div>
    <!-- /wp:group -->

    <!-- wp:group {"align":"full","backgroundColor":"black","textColor":"white","style":{"spacing":{"padding":{"top":"var:preset|spacing|70","bottom":"var:preset|spacing|70"}}},"layout":{"type":"constrained"}} -->
    <div class="wp-block-group alignfull has-white-color has-black-background-color has-text-color has-background"
        style="padding-top:var(--wp--preset--spacing--70);padding-bottom:var(--wp--preset--spacing--70)">
        <!-- wp:heading {"textAlign":"center"} -->
        <h2 class="wp-block-heading has-text-align-center">What Our Clients Say</h2>
        <!-- /wp:heading -->

        <!-- wp:group {"style":{"spacing":{"padding":{"top":"20px","right":"20px","bottom":"20px","left":"20px"},"blockGap":"20px"},"border":{"radius":"12px"}},"backgroundColor":"cyan-bluish-gray","textColor":"black"} -->
        <div class="wp-block-group has-black-color has-cyan-bluish-gray-background-color has-text-color has-background"
            style="border-radius:12px;padding-top:20px;padding-right:20px;padding-bottom:20px;padding-left:20px">
            <!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"large","fontStyle":"italic"}}} -->
            <p class="has-text-align-center has-large-font-size" style="font-style:italic">"This is the best service I
                have ever used. Highly recommended!"</p>
            <!-- /wp:paragraph -->
            <!-- wp:paragraph {"align":"center","fontSize":"small"} -->
            <p class="has-text-align-center has-small-font-size">— Happy Customer</p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:group -->
    </div>
    <!-- /wp:group -->

</div>
<!-- /wp:group -->