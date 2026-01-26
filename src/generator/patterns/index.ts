
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
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|70","bottom":"var:preset|spacing|70"}}},"backgroundColor":"primary","textColor":"base","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-base-color has-primary-background-color has-text-color has-background" style="padding-top:var(--wp--preset--spacing--70);padding-bottom:var(--wp--preset--spacing--70)">
    <!-- wp:columns {"align":"wide","style":{"spacing":{"blockGap":{"top":"var:preset|spacing|50","left":"var:preset|spacing|50"}}}} -->
    <div class="wp-block-columns alignwide">
        <!-- wp:column {"width":"40%"} -->
        <div class="wp-block-column" style="flex-basis:40%">
            <!-- wp:site-logo {"width":60,"shouldSyncIcon":false} /-->
            <!-- wp:heading {"level":3,"style":{"typography":{"fontSize":"24px","fontWeight":"700"}}} -->
            <h3 class="wp-block-heading" style="font-size:24px;font-weight:700">${footerName}</h3>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"style":{"typography":{"lineHeight":"1.6"}}} -->
            <p style="line-height:1.6">Experience the best flavors in town. Locally sourced, prepared with passion.</p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:column -->

        <!-- wp:column {"width":"30%"} -->
        <div class="wp-block-column" style="flex-basis:30%">
            <!-- wp:heading {"level":6,"style":{"typography":{"textTransform":"uppercase","letterSpacing":"1px"}}} -->
            <h6 class="wp-block-heading" style="text-transform:uppercase;letter-spacing:1px">Company</h6>
            <!-- /wp:heading -->
            
            <!-- wp:group {"layout":{"type":"flex","orientation":"vertical"}} -->
            <div class="wp-block-group">
                <!-- wp:paragraph -->
                <p><a href="/about">About Us</a></p>
                <!-- /wp:paragraph -->
                <!-- wp:paragraph -->
                <p><a href="/contact">Contact</a></p>
                <!-- /wp:paragraph -->
                <!-- wp:paragraph -->
                <p><a href="#">Careers</a></p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->

        <!-- wp:column {"width":"30%"} -->
        <div class="wp-block-column" style="flex-basis:30%">
            <!-- wp:heading {"level":6,"style":{"typography":{"textTransform":"uppercase","letterSpacing":"1px"}}} -->
            <h6 class="wp-block-heading" style="text-transform:uppercase;letter-spacing:1px">Connect</h6>
            <!-- /wp:heading -->
             <!-- wp:social-links {"iconColor":"base","iconColorValue":"#ffffff","style":{"spacing":{"blockGap":"1rem"}}} -->
            <ul class="wp-block-social-links has-icon-color has-base-color">
                <!-- wp:social-link {"url":"#","service":"facebook"} /-->
                <!-- wp:social-link {"url":"#","service":"instagram"} /-->
                <!-- wp:social-link {"url":"#","service":"twitter"} /-->
            </ul>
            <!-- /wp:social-links -->
            <!-- wp:paragraph {"style":{"spacing":{"margin":{"top":"var:preset|spacing|20"}}}} -->
             <p style="margin-top:var(--wp--preset--spacing--20)">© ${new Date().getFullYear()} ${footerName}.<br>Powered by PressPilot OS.</p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->
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
