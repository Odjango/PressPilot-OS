<?php
/**
 * Title: FAQ
 * Slug: ollie/faq
 * Description:
 * Categories: ollie/features
 * Keywords: faq, text, features
 * Viewport Width: 1500
 * Block Types:
 * Post Types:
 * Inserter: true
 */
?>
<!-- wp:group {"metadata":{"name":"Frequently Asked"},"align":"full","className":"feature-boxes","style":{"spacing":{"margin":{"top":"0px"},"padding":{"top":"var:preset|spacing|xx-large","bottom":"var:preset|spacing|xx-large","right":"var:preset|spacing|medium","left":"var:preset|spacing|medium"},"blockGap":"var:preset|spacing|x-large"}},"layout":{"inherit":true,"type":"constrained"}} -->
<div class="wp-block-group alignfull feature-boxes"
    style="margin-top:0px;padding-top:var(--wp--preset--spacing--xx-large);padding-right:var(--wp--preset--spacing--medium);padding-bottom:var(--wp--preset--spacing--xx-large);padding-left:var(--wp--preset--spacing--medium)">
    <!-- wp:group {"metadata":{"name":"Titles"},"style":{"spacing":{"blockGap":"var:preset|spacing|small"}}} -->
    <div class="wp-block-group">
        <!-- wp:paragraph {"align":"center","style":{"typography":{"fontStyle":"normal","fontWeight":"500"}},"textColor":"primary","fontSize":"small"} -->
        <p class="has-text-align-center has-primary-color has-text-color has-small-font-size"
            style="font-style:normal;font-weight:500">FAQ</p>
        <!-- /wp:paragraph -->

        <!-- wp:heading {"textAlign":"center"} -->
        <h2 class="wp-block-heading has-text-align-center">{{FAQ_TITLE}}</h2>
        <!-- /wp:heading -->

        <!-- wp:paragraph {"align":"center"} -->
        <p class="has-text-align-center">Got a question? We've got you covered! Check out the resources below and be
            sure to let us know if we can answer anything else.</p>
        <!-- /wp:paragraph -->
    </div>
    <!-- /wp:group -->

    <!-- wp:group {"metadata":{"name":"FAQ"},"align":"wide","style":{"spacing":{"blockGap":"var:preset|spacing|large"}},"layout":{"type":"flex","orientation":"vertical"}} -->
    <div class="wp-block-group alignwide">
        <!-- wp:columns {"align":"wide","style":{"spacing":{"margin":{"top":"0px","bottom":"0px"},"blockGap":{"top":"var:preset|spacing|large","left":"var:preset|spacing|large"}}}} -->
        <div class="wp-block-columns alignwide" style="margin-top:0px;margin-bottom:0px">
            <!-- wp:column {"className":"is-style-default","style":{"spacing":{"blockGap":"var:preset|spacing|medium"}}} -->
            <div class="wp-block-column is-style-default">
                <!-- wp:group {"metadata":{"name":"Entry"},"style":{"spacing":{"blockGap":"var:preset|spacing|medium"},"border":{"radius":"5px"}},"layout":{"type":"constrained"}} -->
                <div class="wp-block-group" style="border-radius:5px">
                    <!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|small"}},"layout":{"type":"constrained"}} -->
                    <div class="wp-block-group"><!-- wp:heading {"level":3,"fontSize":"medium"} -->
                        <h3 class="wp-block-heading has-medium-font-size">{{FAQ_1_QUESTION}}</h3>
                        <!-- /wp:heading -->

                        <!-- wp:paragraph -->
                        <p>{{FAQ_1_ANSWER}}</p>
                        <!-- /wp:paragraph -->
                    </div>
                    <!-- /wp:group -->
                </div>
                <!-- /wp:group -->

                <!-- wp:group {"metadata":{"name":"Entry"},"style":{"spacing":{"blockGap":"var:preset|spacing|medium"},"border":{"radius":"5px"}},"layout":{"type":"constrained"}} -->
                <div class="wp-block-group" style="border-radius:5px">
                    <!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|small"}},"layout":{"type":"constrained"}} -->
                    <div class="wp-block-group"><!-- wp:heading {"level":3,"fontSize":"medium"} -->
                        <h3 class="wp-block-heading has-medium-font-size">{{FAQ_2_QUESTION}}</h3>
                        <!-- /wp:heading -->

                        <!-- wp:paragraph -->
                        <p>{{FAQ_2_ANSWER}}</p>
                        <!-- /wp:paragraph -->
                    </div>
                    <!-- /wp:group -->
                </div>
                <!-- /wp:group -->
            </div>
            <!-- /wp:column -->

            <!-- wp:column {"className":"is-style-default","style":{"spacing":{"blockGap":"var:preset|spacing|medium"}}} -->
            <div class="wp-block-column is-style-default">
                <!-- wp:group {"metadata":{"name":"Entry"},"style":{"spacing":{"blockGap":"var:preset|spacing|medium"},"border":{"radius":"5px"}},"layout":{"type":"constrained"}} -->
                <div class="wp-block-group" style="border-radius:5px">
                    <!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|small"}},"layout":{"type":"constrained"}} -->
                    <div class="wp-block-group"><!-- wp:heading {"level":3,"fontSize":"medium"} -->
                        <h3 class="wp-block-heading has-medium-font-size">{{FAQ_3_QUESTION}}</h3>
                        <!-- /wp:heading -->

                        <!-- wp:paragraph -->
                        <p>{{FAQ_3_ANSWER}}</p>
                        <!-- /wp:paragraph -->
                    </div>
                    <!-- /wp:group -->
                </div>
                <!-- /wp:group -->

                <!-- wp:group {"metadata":{"name":"Entry"},"style":{"spacing":{"blockGap":"var:preset|spacing|medium"},"border":{"radius":"5px"}},"layout":{"type":"constrained"}} -->
                <div class="wp-block-group" style="border-radius:5px">
                    <!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|small"}},"layout":{"type":"constrained"}} -->
                    <div class="wp-block-group"><!-- wp:heading {"level":3,"fontSize":"medium"} -->
                        <h3 class="wp-block-heading has-medium-font-size">{{FAQ_4_QUESTION}}</h3>
                        <!-- /wp:heading -->

                        <!-- wp:paragraph -->
                        <p>{{FAQ_4_ANSWER}}</p>
                        <!-- /wp:paragraph -->
                    </div>
                    <!-- /wp:group -->
                </div>
                <!-- /wp:group -->
            </div>
            <!-- /wp:column -->
        </div>
        <!-- /wp:columns -->
    </div>
    <!-- /wp:group -->

    <!-- wp:group {"metadata":{"name":"CTA Bar"},"align":"wide","style":{"spacing":{"padding":{"top":"var:preset|spacing|medium","right":"var:preset|spacing|medium","bottom":"var:preset|spacing|medium","left":"var:preset|spacing|medium"}},"border":{"radius":"5px"}},"backgroundColor":"tertiary","layout":{"type":"constrained"}} -->
    <div class="wp-block-group alignwide has-tertiary-background-color has-background"
        style="border-radius:5px;padding-top:var(--wp--preset--spacing--medium);padding-right:var(--wp--preset--spacing--medium);padding-bottom:var(--wp--preset--spacing--medium);padding-left:var(--wp--preset--spacing--medium)">
        <!-- wp:group {"align":"wide","layout":{"type":"flex","flexWrap":"wrap","justifyContent":"space-between"}} -->
        <div class="wp-block-group alignwide">
            <!-- wp:group {"metadata":{"name":"Text"},"layout":{"type":"constrained","wideSize":"700px"}} -->
            <div class="wp-block-group"><!-- wp:group {"layout":{"type":"flex","flexWrap":"wrap"}} -->
                <div class="wp-block-group">
                    <!-- wp:image {"id":58,"width":"76px","sizeSlug":"full","linkDestination":"none","className":"is-style-rounded-full"} -->
                    <figure class="wp-block-image size-full is-resized is-style-rounded-full"><img
                            src="<?php echo esc_url(get_template_directory_uri()); ?>/patterns/images/avatar-3.webp"
                            alt="" class="wp-image-58" style="width:76px" /></figure>
                    <!-- /wp:image -->

                    <!-- wp:group {"style":{"spacing":{"blockGap":"5px"}},"layout":{"type":"flex","orientation":"vertical"}} -->
                    <div class="wp-block-group">
                        <!-- wp:paragraph {"style":{"typography":{"fontStyle":"normal","fontWeight":"600"}},"fontSize":"medium"} -->
                        <p class="has-medium-font-size" style="font-style:normal;font-weight:600">
                            Still have questions?</p>
                        <!-- /wp:paragraph -->

                        <!-- wp:paragraph -->
                        <p>Can't find what you're looking for? Let's have a chat!
                        </p>
                        <!-- /wp:paragraph -->
                    </div>
                    <!-- /wp:group -->
                </div>
                <!-- /wp:group -->
            </div>
            <!-- /wp:group -->

            <!-- wp:buttons -->
            <div class="wp-block-buttons"><!-- wp:button -->
                <div class="wp-block-button"><a
                        class="wp-block-button__link wp-element-button">Contact Us →</a>
                </div>
                <!-- /wp:button -->
            </div>
            <!-- /wp:buttons -->
        </div>
        <!-- /wp:group -->
    </div>
    <!-- /wp:group -->
</div>
<!-- /wp:group -->