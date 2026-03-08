
export const getUniversalPageContent = (businessName: string) => {
    return `
    <!-- wp:template-part {"slug":"header","theme":"ollie","tagName":"header"} /-->

    <!-- wp:group {"tagName":"main","style":{"spacing":{"margin":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}},"layout":{"type":"constrained"}} -->
    <main class="wp-block-group" style="margin-top:var(--wp--preset--spacing--60);margin-bottom:var(--wp--preset--spacing--60)">
        <!-- wp:post-title {"level":1,"textAlign":"center"} /-->
        <!-- wp:post-content {"layout":{"type":"constrained"}} /-->
    </main>
    <!-- /wp:group -->

    <!-- wp:template-part {"slug":"footer","theme":"ollie","tagName":"footer"} /-->
    `;
};
