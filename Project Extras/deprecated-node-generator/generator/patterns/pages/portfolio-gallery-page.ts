import type { PageContent } from '../../types';

export const getPortfolioGalleryPageContent = (_content?: PageContent) => {
    return `<!-- wp:group {"align":"full","backgroundColor":"base","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-base-background-color has-background" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)">
    <!-- wp:heading {"textAlign":"center","textColor":"contrast"} -->
    <h1 class="wp-block-heading has-text-align-center has-contrast-color has-text-color">Gallery</h1>
    <!-- /wp:heading -->
    <!-- wp:paragraph {"align":"center","textColor":"contrast-2"} -->
    <p class="has-text-align-center has-contrast-2-color has-text-color">All Projects · Branding · Product · Campaigns</p>
    <!-- /wp:paragraph -->

    <!-- wp:columns {"align":"wide","style":{"spacing":{"margin":{"top":"var:preset|spacing|50"}}}} -->
    <div class="wp-block-columns alignwide" style="margin-top:var(--wp--preset--spacing--50)">
        <!-- wp:column --><div class="wp-block-column"><!-- wp:image {"sizeSlug":"large","linkDestination":"none"} --><figure class="wp-block-image size-large"><img src="{{project_1_image}}" alt="{{project_1_title}}"/></figure><!-- /wp:image --><!-- wp:heading {"level":5,"textColor":"contrast"} --><h5 class="wp-block-heading has-contrast-color has-text-color">{{project_1_title}}</h5><!-- /wp:heading --></div><!-- /wp:column -->
        <!-- wp:column --><div class="wp-block-column"><!-- wp:image {"sizeSlug":"large","linkDestination":"none"} --><figure class="wp-block-image size-large"><img src="{{project_2_image}}" alt="{{project_2_title}}"/></figure><!-- /wp:image --><!-- wp:heading {"level":5,"textColor":"contrast"} --><h5 class="wp-block-heading has-contrast-color has-text-color">{{project_2_title}}</h5><!-- /wp:heading --></div><!-- /wp:column -->
        <!-- wp:column --><div class="wp-block-column"><!-- wp:image {"sizeSlug":"large","linkDestination":"none"} --><figure class="wp-block-image size-large"><img src="{{project_3_image}}" alt="{{project_3_title}}"/></figure><!-- /wp:image --><!-- wp:heading {"level":5,"textColor":"contrast"} --><h5 class="wp-block-heading has-contrast-color has-text-color">{{project_3_title}}</h5><!-- /wp:heading --></div><!-- /wp:column -->
    </div>
    <!-- /wp:columns -->

    <!-- wp:columns {"align":"wide","style":{"spacing":{"margin":{"top":"var:preset|spacing|30"}}}} -->
    <div class="wp-block-columns alignwide" style="margin-top:var(--wp--preset--spacing--30)">
        <!-- wp:column --><div class="wp-block-column"><!-- wp:image {"sizeSlug":"large","linkDestination":"none"} --><figure class="wp-block-image size-large"><img src="{{project_4_image}}" alt="{{project_4_title}}"/></figure><!-- /wp:image --><!-- wp:heading {"level":5,"textColor":"contrast"} --><h5 class="wp-block-heading has-contrast-color has-text-color">{{project_4_title}}</h5><!-- /wp:heading --></div><!-- /wp:column -->
        <!-- wp:column --><div class="wp-block-column"><!-- wp:image {"sizeSlug":"large","linkDestination":"none"} --><figure class="wp-block-image size-large"><img src="{{project_5_image}}" alt="{{project_5_title}}"/></figure><!-- /wp:image --><!-- wp:heading {"level":5,"textColor":"contrast"} --><h5 class="wp-block-heading has-contrast-color has-text-color">{{project_5_title}}</h5><!-- /wp:heading --></div><!-- /wp:column -->
        <!-- wp:column --><div class="wp-block-column"><!-- wp:image {"sizeSlug":"large","linkDestination":"none"} --><figure class="wp-block-image size-large"><img src="{{project_6_image}}" alt="{{project_6_title}}"/></figure><!-- /wp:image --><!-- wp:heading {"level":5,"textColor":"contrast"} --><h5 class="wp-block-heading has-contrast-color has-text-color">{{project_6_title}}</h5><!-- /wp:heading --></div><!-- /wp:column -->
    </div>
    <!-- /wp:columns -->
</div>
<!-- /wp:group -->`;
};
