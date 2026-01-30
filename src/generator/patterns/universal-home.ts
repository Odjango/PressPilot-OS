
import { PageContent } from '../types';

export const getUniversalHomeContent = (content?: PageContent) => {
    const title = content?.hero_title || 'Welcome';
    const sub = content?.hero_sub || 'We enable businesses to grow.';

    const coverAttrs = JSON.stringify({
        url: 'https://s.w.org/images/core/5.3/MtBlanc1.jpg',
        dimRatio: 60,
        overlayColor: 'black',
        align: 'full',
        layout: { type: 'constrained' }
    });

    const heroHeadingAttrs = JSON.stringify({
        textAlign: 'center',
        level: 1,
        style: { typography: { fontSize: '4rem' } }
    });

    const heroParaAttrs = JSON.stringify({
        align: 'center',
        fontSize: 'large'
    });

    const buttonsContainerAttrs = JSON.stringify({
        layout: { type: 'flex', justifyContent: 'center' }
    });

    const fillButtonAttrs = JSON.stringify({
        className: 'is-style-fill'
    });

    const outlineButtonAttrs = JSON.stringify({
        className: 'is-style-outline'
    });

    const featuresGroupAttrs = JSON.stringify({
        align: 'full',
        style: {
            spacing: {
                padding: { top: 'var:preset|spacing|60', bottom: 'var:preset|spacing|60' }
            }
        },
        backgroundColor: 'base',
        layout: { type: 'constrained' }
    });

    const columnsAttrs = JSON.stringify({
        align: 'wide'
    });

    const colHeadingAttrs = JSON.stringify({
        level: 3
    });

    return `
    <!-- wp:cover ${coverAttrs} -->
    <div class="wp-block-cover alignfull has-black-background-color has-background-dim-60 has-background-dim"><span aria-hidden="true" class="wp-block-cover__background has-black-background-color has-background-dim-60 has-background-dim"></span><img class="wp-block-cover__image-background" src="https://s.w.org/images/core/5.3/MtBlanc1.jpg" alt="" data-object-fit="cover"/>
        <div class="wp-block-cover__inner-container">
            <!-- wp:heading ${heroHeadingAttrs} -->
            <h1 class="wp-block-heading has-text-align-center" style="font-size:4rem">${title}</h1>
            <!-- /wp:heading -->

            <!-- wp:paragraph ${heroParaAttrs} -->
            <p class="has-text-align-center has-large-font-size">${sub}</p>
            <!-- /wp:paragraph -->

            <!-- wp:buttons ${buttonsContainerAttrs} -->
            <div class="wp-block-buttons">
                <!-- wp:button ${fillButtonAttrs} -->
                <div class="wp-block-button is-style-fill"><a class="wp-block-button__link wp-element-button">Get Started</a></div>
                <!-- /wp:button -->
                
                <!-- wp:button ${outlineButtonAttrs} -->
                <div class="wp-block-button is-style-outline"><a class="wp-block-button__link wp-element-button">Learn More</a></div>
                <!-- /wp:button -->
            </div>
            <!-- /wp:buttons -->
        </div>
    </div>
    <!-- /wp:cover -->

    <!-- wp:group ${featuresGroupAttrs} -->
    <div class="wp-block-group alignfull has-base-background-color has-background" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)">
        <!-- wp:columns ${columnsAttrs} -->
        <div class="wp-block-columns alignwide">
            <!-- wp:column -->
            <div class="wp-block-column">
                <!-- wp:heading ${colHeadingAttrs} -->
                <h3 class="wp-block-heading">Fresh Ingredients</h3>
                <!-- /wp:heading -->
                <!-- wp:paragraph -->
                <p>We source only the best local produce for our dishes.</p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:column -->
            <!-- wp:column -->
            <div class="wp-block-column">
                <!-- wp:heading ${colHeadingAttrs} -->
                <h3 class="wp-block-heading">Expert Chefs</h3>
                <!-- /wp:heading -->
                <!-- wp:paragraph -->
                <p>Culinary masters dedicated to the perfect taste.</p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:column -->
            <!-- wp:column -->
            <div class="wp-block-column">
                <!-- wp:heading ${colHeadingAttrs} -->
                <h3 class="wp-block-heading">Fast Delivery</h3>
                <!-- /wp:heading -->
                <!-- wp:paragraph -->
                <p>Hot and fresh to your door in header than 30 minutes.</p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:column -->
        </div>
        <!-- /wp:columns -->
    </div>
    <!-- /wp:group -->
    `;
};
