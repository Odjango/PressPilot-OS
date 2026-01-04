
import { PageData } from '../types';
import { getUniversalHomeContent } from './universal-home';

export const getUniversalHeaderContent = (pages?: PageData[]) => {
    // 1. Build Navigation Items
    let navItems = '';

    // Always add Home
    navItems += `<!-- wp:navigation-link {"label":"Home","url":"/","kind":"custom","isTopLevelLink":true} /-->\n`;

    // Add Custom Pages
    if (pages && pages.length > 0) {
        navItems += pages.map(p =>
            `<!-- wp:navigation-link {"label":"${p.title}","url":"/${p.slug}","kind":"custom","isTopLevelLink":true} /-->`
        ).join('\n');
    }

    // Add Blog (Standard)
    navItems += `<!-- wp:navigation-link {"label":"Blog","url":"/blog","kind":"custom","isTopLevelLink":true} /-->\n`;


    return `
<!-- wp:group {"metadata":{"name":"Header"},"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|medium","bottom":"var:preset|spacing|medium","right":"var:preset|spacing|medium","left":"var:preset|spacing|medium"}},"elements":{"link":{"color":{"text":"var:preset|color|main"}}},"border":{"bottom":{"color":"var:preset|color|border-light","width":"1px"},"top":[],"right":[],"left":[]}},"backgroundColor":"base","layout":{"inherit":true,"type":"constrained"}} -->
<div class="wp-block-group alignfull has-base-background-color has-background has-link-color" style="border-bottom-color:var(--wp--preset--color--border-light);border-bottom-width:1px;padding-top:var(--wp--preset--spacing--medium);padding-right:var(--wp--preset--spacing--medium);padding-bottom:var(--wp--preset--spacing--medium);padding-left:var(--wp--preset--spacing--medium)">
    <!-- wp:group {"align":"wide","layout":{"type":"flex","justifyContent":"space-between"}} -->
    <div class="wp-block-group alignwide">
        <!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap"}} -->
        <div class="wp-block-group">
            <!-- wp:site-logo {"width":120} /-->
            <!-- wp:site-title {"level":0} /-->
        </div>
        <!-- /wp:group -->

        <!-- wp:navigation {"openSubmenusOnClick":true,"icon":"menu","style":{"spacing":{"blockGap":"var:preset|spacing|small"},"layout":{"selfStretch":"fit","flexSize":null}},"fontSize":"small"} -->
            ${navItems}
        <!-- /wp:navigation -->
    </div>
    <!-- /wp:group -->
</div>
<!-- /wp:group -->
`;
};

export const getUniversalBlogContent = () => `
<!-- wp:template-part {"slug":"header","tagName":"header"} /-->
<!-- wp:group {"tagName":"main","layout":{"inherit":true}} -->
<main class="wp-block-group">
    <!-- wp:heading {"level":1,"align":"wide","style":{"spacing":{"padding":{"top":"4rem","bottom":"2rem"}}}} -->
    <h1 class="wp-block-heading alignwide" style="padding-top:4rem;padding-bottom:2rem">Latest Updates</h1>
    <!-- /wp:heading -->

    <!-- wp:query {"query":{"perPage":6,"pages":0,"offset":0,"postType":"post","order":"desc","orderBy":"date","author":"","search":"","exclude":[],"sticky":"","inherit":false},"align":"wide","layout":{"type":"constrained"}} -->
    <div class="wp-block-query alignwide">
        <!-- wp:post-template -->
        <!-- wp:group {"layout":{"type":"flex","orientation":"vertical"}} -->
        <div class="wp-block-group">
            <!-- wp:post-featured-image {"isLink":true,"aspectRatio":"3/2"} /-->
            <!-- wp:post-title {"isLink":true,"fontSize":"large"} /-->
            <!-- wp:post-excerpt /-->
            <!-- wp:post-date /-->
        </div>
        <!-- /wp:group -->
        <!-- /wp:post-template -->
        
        <!-- wp:query-pagination -->
            <!-- wp:query-pagination-previous /-->
            <!-- wp:query-pagination-numbers /-->
            <!-- wp:query-pagination-next /-->
        <!-- /wp:query-pagination -->
    </div>
    <!-- /wp:query -->
</main>
<!-- /wp:group -->
<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->
`;

export const getUniversalLandingContent = () => `
<!-- wp:template-part {"slug":"header","tagName":"header"} /-->
<!-- wp:group {"tagName":"main","layout":{"inherit":true}} -->
<main class="wp-block-group">
    <!-- wp:pattern {"slug":"presspilot/universal-heavy"} /-->
</main>
<!-- /wp:group -->
<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->
`;

export const getUniversalFooterContent = (footerName: string) => `
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull" style="padding-top:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--50)">
    <!-- wp:group {"align":"wide","layout":{"type":"flex","justifyContent":"space-between"}} -->
    <div class="wp-block-group alignwide">
        <!-- wp:paragraph {"fontSize":"small"} -->
        <p class="has-small-font-size">© ${new Date().getFullYear()} ${footerName} · Powered by PressPilot</p>
        <!-- /wp:paragraph -->
        
        <!-- wp:paragraph {"fontSize":"small"} -->
        <p class="has-small-font-size"><a href="#">Facebook</a> · <a href="#">LinkedIn</a></p>
        <!-- /wp:paragraph -->
    </div>
    <!-- /wp:group -->
</div>
<!-- /wp:group -->
`;

export const getArchiveContent = () => `
<!-- wp:template-part {"slug":"header","tagName":"header"} /-->
<!-- wp:group {"tagName":"main","layout":{"inherit":true}} -->
<main class="wp-block-group">
    <!-- wp:query-title {"type":"archive","align":"wide","style":{"spacing":{"padding":{"top":"4rem","bottom":"2rem"}}}} /-->
    <!-- wp:query {"query":{"perPage":6,"pages":0,"offset":0,"postType":"post","order":"desc","orderBy":"date","author":"","search":"","exclude":[],"sticky":"","inherit":true},"align":"wide","layout":{"type":"constrained"}} -->
    <div class="wp-block-query alignwide">
        <!-- wp:post-template -->
        <!-- wp:group {"layout":{"type":"flex","orientation":"vertical"}} -->
        <div class="wp-block-group">
            <!-- wp:post-featured-image {"isLink":true,"aspectRatio":"3/2"} /-->
            <!-- wp:post-title {"isLink":true,"fontSize":"large"} /-->
            <!-- wp:post-excerpt /-->
            <!-- wp:post-date /-->
        </div>
        <!-- /wp:group -->
        <!-- /wp:post-template -->
        <!-- wp:query-pagination -->
            <!-- wp:query-pagination-previous /-->
            <!-- wp:query-pagination-numbers /-->
            <!-- wp:query-pagination-next /-->
        <!-- /wp:query-pagination -->
    </div>
    <!-- /wp:query -->
</main>
<!-- /wp:group -->
<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->
`;

export const getSearchContent = () => `
<!-- wp:template-part {"slug":"header","tagName":"header"} /-->
<!-- wp:group {"tagName":"main","layout":{"inherit":true}} -->
<main class="wp-block-group">
    <!-- wp:heading {"level":1,"align":"wide","style":{"spacing":{"padding":{"top":"4rem","bottom":"2rem"}}}} -->
    <h1 class="wp-block-heading alignwide" style="padding-top:4rem;padding-bottom:2rem">Search Results</h1>
    <!-- /wp:heading -->

    <!-- wp:query {"query":{"perPage":6,"pages":0,"offset":0,"postType":"post","order":"desc","orderBy":"date","author":"","search":"","exclude":[],"sticky":"","inherit":true},"align":"wide","layout":{"type":"constrained"}} -->
    <div class="wp-block-query alignwide">
        <!-- wp:post-template -->
        <!-- wp:group {"layout":{"type":"flex","orientation":"vertical"}} -->
        <div class="wp-block-group">
            <!-- wp:post-featured-image {"isLink":true,"aspectRatio":"3/2"} /-->
            <!-- wp:post-title {"isLink":true,"fontSize":"large"} /-->
            <!-- wp:post-excerpt /-->
            <!-- wp:post-date /-->
        </div>
        <!-- /wp:group -->
        <!-- /wp:post-template -->
        <!-- wp:query-pagination -->
            <!-- wp:query-pagination-previous /-->
            <!-- wp:query-pagination-numbers /-->
            <!-- wp:query-pagination-next /-->
        <!-- /wp:query-pagination -->
    </div>
    <!-- /wp:query -->
</main>
<!-- /wp:group -->
<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->
`;

export { getUniversalHomeContent };
