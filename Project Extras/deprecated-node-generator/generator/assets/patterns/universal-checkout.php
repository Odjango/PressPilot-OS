<?php
/**
 * Title: Checkout Form
 * Slug: presspilot/checkout
 * Categories: ecommerce
 * Keywords: checkout, payment, order
 */
?>
<!-- wp:group {"align":"wide","style":{"spacing":{"padding":{"top":"var:preset|spacing|large","bottom":"var:preset|spacing|large"}}}} -->
<div class="wp-block-group alignwide" style="padding-top:var(--wp--preset--spacing--large);padding-bottom:var(--wp--preset--spacing--large)">
    <!-- wp:columns {"style":{"spacing":{"padding":{"top":"var:preset|spacing|medium"}}}} -->
    <div class="wp-block-columns" style="padding-top:var(--wp--preset--spacing--medium)">
        <!-- wp:column {"width":"60%"} -->
        <div class="wp-block-column" style="flex-basis:60%">
            <!-- wp:group {"style":{"border":{"width":"1px","color":"#e0e0e0"},"spacing":{"padding":{"top":"var:preset|spacing|medium","bottom":"var:preset|spacing|medium","left":"var:preset|spacing|medium","right":"var:preset|spacing|medium"},"blockGap":"var:preset|spacing|small"}}} -->
            <div class="wp-block-group has-border-color" style="border-color:#e0e0e0;border-width:1px;padding-top:var(--wp--preset--spacing--medium);padding-right:var(--wp--preset--spacing--medium);padding-bottom:var(--wp--preset--spacing--medium);padding-left:var(--wp--preset--spacing--medium)">
                <!-- wp:heading {"level":3,"fontSize":"medium"} -->
                <h3 class="wp-block-heading has-medium-font-size">Shipping Information</h3>
                <!-- /wp:heading -->
                <!-- wp:columns -->
                <div class="wp-block-columns">
                    <!-- wp:column -->
                    <div class="wp-block-column">
                        <!-- wp:paragraph {"style":{"typography":{"fontSize":"14px"}}} -->
                        <p style="font-size:14px"><strong>First Name</strong></p>
                        <!-- /wp:paragraph -->
                        <!-- wp:group {"style":{"border":{"width":"1px","color":"#e0e0e0"},"spacing":{"padding":{"top":"12px","bottom":"12px","left":"12px","right":"12px"}}}} -->
                        <div class="wp-block-group has-border-color" style="border-color:#e0e0e0;border-width:1px;padding-top:12px;padding-right:12px;padding-bottom:12px;padding-left:12px">
                            <!-- wp:paragraph {"textColor":"secondary"} -->
                            <p class="has-secondary-color has-text-color">John</p>
                            <!-- /wp:paragraph -->
                        </div>
                        <!-- /wp:group -->
                    </div>
                    <!-- /wp:column -->
                    <!-- wp:column -->
                    <div class="wp-block-column">
                        <!-- wp:paragraph {"style":{"typography":{"fontSize":"14px"}}} -->
                        <p style="font-size:14px"><strong>Last Name</strong></p>
                        <!-- /wp:paragraph -->
                        <!-- wp:group {"style":{"border":{"width":"1px","color":"#e0e0e0"},"spacing":{"padding":{"top":"12px","bottom":"12px","left":"12px","right":"12px"}}}} -->
                        <div class="wp-block-group has-border-color" style="border-color:#e0e0e0;border-width:1px;padding-top:12px;padding-right:12px;padding-bottom:12px;padding-left:12px">
                            <!-- wp:paragraph {"textColor":"secondary"} -->
                            <p class="has-secondary-color has-text-color">Doe</p>
                            <!-- /wp:paragraph -->
                        </div>
                        <!-- /wp:group -->
                    </div>
                    <!-- /wp:column -->
                </div>
                <!-- /wp:columns -->
                <!-- wp:paragraph {"style":{"typography":{"fontSize":"14px"}}} -->
                <p style="font-size:14px"><strong>Email Address</strong></p>
                <!-- /wp:paragraph -->
                <!-- wp:group {"style":{"border":{"width":"1px","color":"#e0e0e0"},"spacing":{"padding":{"top":"12px","bottom":"12px","left":"12px","right":"12px"}}}} -->
                <div class="wp-block-group has-border-color" style="border-color:#e0e0e0;border-width:1px;padding-top:12px;padding-right:12px;padding-bottom:12px;padding-left:12px">
                    <!-- wp:paragraph {"textColor":"secondary"} -->
                    <p class="has-secondary-color has-text-color">john.doe@example.com</p>
                    <!-- /wp:paragraph -->
                </div>
                <!-- /wp:group -->
                <!-- wp:paragraph {"style":{"typography":{"fontSize":"14px"}}} -->
                <p style="font-size:14px"><strong>Address</strong></p>
                <!-- /wp:paragraph -->
                <!-- wp:group {"style":{"border":{"width":"1px","color":"#e0e0e0"},"spacing":{"padding":{"top":"12px","bottom":"12px","left":"12px","right":"12px"}}}} -->
                <div class="wp-block-group has-border-color" style="border-color:#e0e0e0;border-width:1px;padding-top:12px;padding-right:12px;padding-bottom:12px;padding-left:12px">
                    <!-- wp:paragraph {"textColor":"secondary"} -->
                    <p class="has-secondary-color has-text-color">123 Main Street, Apt 4B</p>
                    <!-- /wp:paragraph -->
                </div>
                <!-- /wp:group -->
                <!-- wp:columns -->
                <div class="wp-block-columns">
                    <!-- wp:column -->
                    <div class="wp-block-column">
                        <!-- wp:paragraph {"style":{"typography":{"fontSize":"14px"}}} -->
                        <p style="font-size:14px"><strong>City</strong></p>
                        <!-- /wp:paragraph -->
                        <!-- wp:group {"style":{"border":{"width":"1px","color":"#e0e0e0"},"spacing":{"padding":{"top":"12px","bottom":"12px","left":"12px","right":"12px"}}}} -->
                        <div class="wp-block-group has-border-color" style="border-color:#e0e0e0;border-width:1px;padding-top:12px;padding-right:12px;padding-bottom:12px;padding-left:12px">
                            <!-- wp:paragraph {"textColor":"secondary"} -->
                            <p class="has-secondary-color has-text-color">New York</p>
                            <!-- /wp:paragraph -->
                        </div>
                        <!-- /wp:group -->
                    </div>
                    <!-- /wp:column -->
                    <!-- wp:column -->
                    <div class="wp-block-column">
                        <!-- wp:paragraph {"style":{"typography":{"fontSize":"14px"}}} -->
                        <p style="font-size:14px"><strong>ZIP Code</strong></p>
                        <!-- /wp:paragraph -->
                        <!-- wp:group {"style":{"border":{"width":"1px","color":"#e0e0e0"},"spacing":{"padding":{"top":"12px","bottom":"12px","left":"12px","right":"12px"}}}} -->
                        <div class="wp-block-group has-border-color" style="border-color:#e0e0e0;border-width:1px;padding-top:12px;padding-right:12px;padding-bottom:12px;padding-left:12px">
                            <!-- wp:paragraph {"textColor":"secondary"} -->
                            <p class="has-secondary-color has-text-color">10001</p>
                            <!-- /wp:paragraph -->
                        </div>
                        <!-- /wp:group -->
                    </div>
                    <!-- /wp:column -->
                </div>
                <!-- /wp:columns -->
            </div>
            <!-- /wp:group -->
            <!-- wp:group {"style":{"border":{"width":"1px","color":"#e0e0e0"},"spacing":{"padding":{"top":"var:preset|spacing|medium","bottom":"var:preset|spacing|medium","left":"var:preset|spacing|medium","right":"var:preset|spacing|medium"},"blockGap":"var:preset|spacing|small","margin":{"top":"var:preset|spacing|medium"}}}} -->
            <div class="wp-block-group has-border-color" style="border-color:#e0e0e0;border-width:1px;margin-top:var(--wp--preset--spacing--medium);padding-top:var(--wp--preset--spacing--medium);padding-right:var(--wp--preset--spacing--medium);padding-bottom:var(--wp--preset--spacing--medium);padding-left:var(--wp--preset--spacing--medium)">
                <!-- wp:heading {"level":3,"fontSize":"medium"} -->
                <h3 class="wp-block-heading has-medium-font-size">Payment Method</h3>
                <!-- /wp:heading -->
                <!-- wp:paragraph {"style":{"typography":{"fontSize":"14px"}}} -->
                <p style="font-size:14px"><strong>Card Number</strong></p>
                <!-- /wp:paragraph -->
                <!-- wp:group {"style":{"border":{"width":"1px","color":"#e0e0e0"},"spacing":{"padding":{"top":"12px","bottom":"12px","left":"12px","right":"12px"}}}} -->
                <div class="wp-block-group has-border-color" style="border-color:#e0e0e0;border-width:1px;padding-top:12px;padding-right:12px;padding-bottom:12px;padding-left:12px">
                    <!-- wp:paragraph {"textColor":"secondary"} -->
                    <p class="has-secondary-color has-text-color">•••• •••• •••• 4242</p>
                    <!-- /wp:paragraph -->
                </div>
                <!-- /wp:group -->
                <!-- wp:columns -->
                <div class="wp-block-columns">
                    <!-- wp:column -->
                    <div class="wp-block-column">
                        <!-- wp:paragraph {"style":{"typography":{"fontSize":"14px"}}} -->
                        <p style="font-size:14px"><strong>Expiry Date</strong></p>
                        <!-- /wp:paragraph -->
                        <!-- wp:group {"style":{"border":{"width":"1px","color":"#e0e0e0"},"spacing":{"padding":{"top":"12px","bottom":"12px","left":"12px","right":"12px"}}}} -->
                        <div class="wp-block-group has-border-color" style="border-color:#e0e0e0;border-width:1px;padding-top:12px;padding-right:12px;padding-bottom:12px;padding-left:12px">
                            <!-- wp:paragraph {"textColor":"secondary"} -->
                            <p class="has-secondary-color has-text-color">12/26</p>
                            <!-- /wp:paragraph -->
                        </div>
                        <!-- /wp:group -->
                    </div>
                    <!-- /wp:column -->
                    <!-- wp:column -->
                    <div class="wp-block-column">
                        <!-- wp:paragraph {"style":{"typography":{"fontSize":"14px"}}} -->
                        <p style="font-size:14px"><strong>CVC</strong></p>
                        <!-- /wp:paragraph -->
                        <!-- wp:group {"style":{"border":{"width":"1px","color":"#e0e0e0"},"spacing":{"padding":{"top":"12px","bottom":"12px","left":"12px","right":"12px"}}}} -->
                        <div class="wp-block-group has-border-color" style="border-color:#e0e0e0;border-width:1px;padding-top:12px;padding-right:12px;padding-bottom:12px;padding-left:12px">
                            <!-- wp:paragraph {"textColor":"secondary"} -->
                            <p class="has-secondary-color has-text-color">•••</p>
                            <!-- /wp:paragraph -->
                        </div>
                        <!-- /wp:group -->
                    </div>
                    <!-- /wp:column -->
                </div>
                <!-- /wp:columns -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->
        <!-- wp:column {"width":"40%"} -->
        <div class="wp-block-column" style="flex-basis:40%">
            <!-- wp:group {"style":{"border":{"width":"1px","color":"#e0e0e0"},"spacing":{"padding":{"top":"var:preset|spacing|medium","bottom":"var:preset|spacing|medium","left":"var:preset|spacing|medium","right":"var:preset|spacing|medium"}}}} -->
            <div class="wp-block-group has-border-color" style="border-color:#e0e0e0;border-width:1px;padding-top:var(--wp--preset--spacing--medium);padding-right:var(--wp--preset--spacing--medium);padding-bottom:var(--wp--preset--spacing--medium);padding-left:var(--wp--preset--spacing--medium)">
                <!-- wp:heading {"level":3,"fontSize":"medium"} -->
                <h3 class="wp-block-heading has-medium-font-size">Order Summary</h3>
                <!-- /wp:heading -->
                <!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|small","bottom":"var:preset|spacing|small"},"blockGap":"var:preset|spacing|small"}}} -->
                <div class="wp-block-group" style="padding-top:var(--wp--preset--spacing--small);padding-bottom:var(--wp--preset--spacing--small)">
                    <!-- wp:columns -->
                    <div class="wp-block-columns">
                        <!-- wp:column -->
                        <div class="wp-block-column">
                            <!-- wp:paragraph {"style":{"typography":{"fontSize":"14px"}}} -->
                            <p style="font-size:14px">Sample Product One × 1</p>
                            <!-- /wp:paragraph -->
                        </div>
                        <!-- /wp:column -->
                        <!-- wp:column -->
                        <div class="wp-block-column">
                            <!-- wp:paragraph {"align":"right","style":{"typography":{"fontSize":"14px"}}} -->
                            <p class="has-text-align-right" style="font-size:14px">$49.99</p>
                            <!-- /wp:paragraph -->
                        </div>
                        <!-- /wp:column -->
                    </div>
                    <!-- /wp:columns -->
                    <!-- wp:columns -->
                    <div class="wp-block-columns">
                        <!-- wp:column -->
                        <div class="wp-block-column">
                            <!-- wp:paragraph {"style":{"typography":{"fontSize":"14px"}}} -->
                            <p style="font-size:14px">Sample Product Two × 2</p>
                            <!-- /wp:paragraph -->
                        </div>
                        <!-- /wp:column -->
                        <!-- wp:column -->
                        <div class="wp-block-column">
                            <!-- wp:paragraph {"align":"right","style":{"typography":{"fontSize":"14px"}}} -->
                            <p class="has-text-align-right" style="font-size:14px">$119.98</p>
                            <!-- /wp:paragraph -->
                        </div>
                        <!-- /wp:column -->
                    </div>
                    <!-- /wp:columns -->
                    <!-- wp:separator {"className":"is-style-wide"} -->
                    <hr class="wp-block-separator has-alpha-channel-opacity is-style-wide"/>
                    <!-- /wp:separator -->
                    <!-- wp:columns -->
                    <div class="wp-block-columns">
                        <!-- wp:column -->
                        <div class="wp-block-column">
                            <!-- wp:paragraph -->
                            <p>Subtotal</p>
                            <!-- /wp:paragraph -->
                        </div>
                        <!-- /wp:column -->
                        <!-- wp:column -->
                        <div class="wp-block-column">
                            <!-- wp:paragraph {"align":"right"} -->
                            <p class="has-text-align-right">$169.97</p>
                            <!-- /wp:paragraph -->
                        </div>
                        <!-- /wp:column -->
                    </div>
                    <!-- /wp:columns -->
                    <!-- wp:columns -->
                    <div class="wp-block-columns">
                        <!-- wp:column -->
                        <div class="wp-block-column">
                            <!-- wp:paragraph -->
                            <p>Shipping</p>
                            <!-- /wp:paragraph -->
                        </div>
                        <!-- /wp:column -->
                        <!-- wp:column -->
                        <div class="wp-block-column">
                            <!-- wp:paragraph {"align":"right"} -->
                            <p class="has-text-align-right">Free</p>
                            <!-- /wp:paragraph -->
                        </div>
                        <!-- /wp:column -->
                    </div>
                    <!-- /wp:columns -->
                    <!-- wp:columns -->
                    <div class="wp-block-columns">
                        <!-- wp:column -->
                        <div class="wp-block-column">
                            <!-- wp:paragraph -->
                            <p>Tax</p>
                            <!-- /wp:paragraph -->
                        </div>
                        <!-- /wp:column -->
                        <!-- wp:column -->
                        <div class="wp-block-column">
                            <!-- wp:paragraph {"align":"right"} -->
                            <p class="has-text-align-right">$14.45</p>
                            <!-- /wp:paragraph -->
                        </div>
                        <!-- /wp:column -->
                    </div>
                    <!-- /wp:columns -->
                    <!-- wp:separator {"className":"is-style-wide"} -->
                    <hr class="wp-block-separator has-alpha-channel-opacity is-style-wide"/>
                    <!-- /wp:separator -->
                    <!-- wp:columns -->
                    <div class="wp-block-columns">
                        <!-- wp:column -->
                        <div class="wp-block-column">
                            <!-- wp:paragraph {"style":{"typography":{"fontWeight":"700","fontSize":"18px"}}} -->
                            <p style="font-size:18px;font-weight:700">Total</p>
                            <!-- /wp:paragraph -->
                        </div>
                        <!-- /wp:column -->
                        <!-- wp:column -->
                        <div class="wp-block-column">
                            <!-- wp:paragraph {"align":"right","style":{"typography":{"fontWeight":"700","fontSize":"18px"}}} -->
                            <p class="has-text-align-right" style="font-size:18px;font-weight:700">$184.42</p>
                            <!-- /wp:paragraph -->
                        </div>
                        <!-- /wp:column -->
                    </div>
                    <!-- /wp:columns -->
                </div>
                <!-- /wp:group -->
                <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"margin":{"top":"var:preset|spacing|medium"}}}} -->
                <div class="wp-block-buttons" style="margin-top:var(--wp--preset--spacing--medium)">
                    <!-- wp:button {"width":100,"style":{"color":{"background":"#16a34a"}}} -->
                    <div class="wp-block-button has-custom-width wp-block-button__width-100"><a class="wp-block-button__link has-background wp-element-button" style="background-color:#16a34a">Place Order</a></div>
                    <!-- /wp:button -->
                </div>
                <!-- /wp:buttons -->
                <!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"12px"}},"textColor":"secondary"} -->
                <p class="has-text-align-center has-secondary-color has-text-color" style="font-size:12px">🔒 Secure checkout powered by Stripe</p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->
</div>
<!-- /wp:group -->