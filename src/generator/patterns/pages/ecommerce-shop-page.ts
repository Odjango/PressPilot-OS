import type { PageContent } from '../../types';

export const getEcommerceShopPageContent = (_content?: PageContent) => {
    return `<!-- wp:group {"align":"full","backgroundColor":"base","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-base-background-color has-background" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)">
    <!-- wp:heading {"textAlign":"center","textColor":"contrast"} -->
    <h1 class="wp-block-heading has-text-align-center has-contrast-color has-text-color">Shop</h1>
    <!-- /wp:heading -->
    <!-- wp:paragraph {"align":"center","textColor":"contrast-2"} -->
    <p class="has-text-align-center has-contrast-2-color has-text-color">Filter by: All · New · Best Sellers · Sale</p>
    <!-- /wp:paragraph -->

    <!-- wp:columns {"align":"wide","style":{"spacing":{"margin":{"top":"var:preset|spacing|50"}}}} -->
    <div class="wp-block-columns alignwide" style="margin-top:var(--wp--preset--spacing--50)">
        <!-- wp:column --><div class="wp-block-column"><!-- wp:image {"sizeSlug":"large","linkDestination":"none"} --><figure class="wp-block-image size-large"><img src="{{product_1_image}}" alt="{{product_1_title}}"/></figure><!-- /wp:image --><!-- wp:heading {"level":5,"textColor":"contrast"} --><h5 class="wp-block-heading has-contrast-color has-text-color">{{product_1_title}}</h5><!-- /wp:heading --><!-- wp:paragraph {"textColor":"accent"} --><p class="has-accent-color has-text-color"><strong>{{product_1_price}}</strong></p><!-- /wp:paragraph --></div><!-- /wp:column -->
        <!-- wp:column --><div class="wp-block-column"><!-- wp:image {"sizeSlug":"large","linkDestination":"none"} --><figure class="wp-block-image size-large"><img src="{{product_2_image}}" alt="{{product_2_title}}"/></figure><!-- /wp:image --><!-- wp:heading {"level":5,"textColor":"contrast"} --><h5 class="wp-block-heading has-contrast-color has-text-color">{{product_2_title}}</h5><!-- /wp:heading --><!-- wp:paragraph {"textColor":"accent"} --><p class="has-accent-color has-text-color"><strong>{{product_2_price}}</strong></p><!-- /wp:paragraph --></div><!-- /wp:column -->
        <!-- wp:column --><div class="wp-block-column"><!-- wp:image {"sizeSlug":"large","linkDestination":"none"} --><figure class="wp-block-image size-large"><img src="{{product_3_image}}" alt="{{product_3_title}}"/></figure><!-- /wp:image --><!-- wp:heading {"level":5,"textColor":"contrast"} --><h5 class="wp-block-heading has-contrast-color has-text-color">{{product_3_title}}</h5><!-- /wp:heading --><!-- wp:paragraph {"textColor":"accent"} --><p class="has-accent-color has-text-color"><strong>{{product_3_price}}</strong></p><!-- /wp:paragraph --></div><!-- /wp:column -->
    </div>
    <!-- /wp:columns -->

    <!-- wp:columns {"align":"wide","style":{"spacing":{"margin":{"top":"var:preset|spacing|30"}}}} -->
    <div class="wp-block-columns alignwide" style="margin-top:var(--wp--preset--spacing--30)">
        <!-- wp:column --><div class="wp-block-column"><!-- wp:image {"sizeSlug":"large","linkDestination":"none"} --><figure class="wp-block-image size-large"><img src="{{product_4_image}}" alt="{{product_4_title}}"/></figure><!-- /wp:image --><!-- wp:heading {"level":5,"textColor":"contrast"} --><h5 class="wp-block-heading has-contrast-color has-text-color">{{product_4_title}}</h5><!-- /wp:heading --><!-- wp:paragraph {"textColor":"accent"} --><p class="has-accent-color has-text-color"><strong>{{product_4_price}}</strong></p><!-- /wp:paragraph --></div><!-- /wp:column -->
        <!-- wp:column --><div class="wp-block-column"><!-- wp:image {"sizeSlug":"large","linkDestination":"none"} --><figure class="wp-block-image size-large"><img src="{{product_5_image}}" alt="{{product_5_title}}"/></figure><!-- /wp:image --><!-- wp:heading {"level":5,"textColor":"contrast"} --><h5 class="wp-block-heading has-contrast-color has-text-color">{{product_5_title}}</h5><!-- /wp:heading --><!-- wp:paragraph {"textColor":"accent"} --><p class="has-accent-color has-text-color"><strong>{{product_5_price}}</strong></p><!-- /wp:paragraph --></div><!-- /wp:column -->
        <!-- wp:column --><div class="wp-block-column"><!-- wp:image {"sizeSlug":"large","linkDestination":"none"} --><figure class="wp-block-image size-large"><img src="{{product_6_image}}" alt="{{product_6_title}}"/></figure><!-- /wp:image --><!-- wp:heading {"level":5,"textColor":"contrast"} --><h5 class="wp-block-heading has-contrast-color has-text-color">{{product_6_title}}</h5><!-- /wp:heading --><!-- wp:paragraph {"textColor":"accent"} --><p class="has-accent-color has-text-color"><strong>{{product_6_price}}</strong></p><!-- /wp:paragraph --></div><!-- /wp:column -->
    </div>
    <!-- /wp:columns -->
</div>
<!-- /wp:group -->`;
};
