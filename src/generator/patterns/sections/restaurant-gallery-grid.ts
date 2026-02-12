import type { SectionContext } from '../../recipes/types';
import { tokenToCSS } from '../../utils/BlockHelpers';
import { getRestaurantProfile } from './restaurant-profile';

export function getRestaurantGalleryGridSectionWithContext(ctx: SectionContext): string {
    const { tokens, render } = ctx;
    const profile = getRestaurantProfile(render.content, render.businessType);
    const sectionPadding = tokens.spacing.sectionPadding;
    const columnGap = tokens.spacing.columnGap;
    const cardRadius = tokens.radius.card;
    const images = [
        'https://placehold.co/800x600/efefef/222222?text=Dining+Room',
        'https://placehold.co/800x600/e7e7e7/222222?text=Signature+Dish',
        'https://placehold.co/800x600/f2f2f2/222222?text=Chef+at+Work',
        'https://placehold.co/800x600/ededed/222222?text=Cocktail+Bar'
    ];

    const card = (label: string, image: string) => `<!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:image {"sizeSlug":"large","linkDestination":"none","style":{"border":{"radius":"${cardRadius}"}}} -->
            <figure class="wp-block-image size-large has-custom-border"><img src="${image}" alt="${label}" style="border-radius:${cardRadius}"/></figure>
            <!-- /wp:image -->
            <!-- wp:paragraph {"textColor":"contrast-2","fontSize":"small"} -->
            <p class="has-contrast-2-color has-text-color has-small-font-size"><strong>${label}</strong></p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:column -->`;

    return `<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"${sectionPadding}","bottom":"${sectionPadding}"}}},"backgroundColor":"base-2","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-base-2-background-color has-background" style="padding-top:${tokenToCSS(sectionPadding)};padding-bottom:${tokenToCSS(sectionPadding)}">
    <!-- wp:heading {"textAlign":"center","textColor":"contrast"} -->
    <h2 class="wp-block-heading has-text-align-center has-contrast-color has-text-color">${profile.galleryHeadline}</h2>
    <!-- /wp:heading -->
    <!-- wp:paragraph {"align":"center","textColor":"contrast-2"} -->
    <p class="has-text-align-center has-contrast-2-color has-text-color">${profile.gallerySubheadline}</p>
    <!-- /wp:paragraph -->
    <!-- wp:columns {"align":"wide","style":{"spacing":{"blockGap":{"left":"${columnGap}"},"margin":{"top":"${columnGap}"}}}} -->
    <div class="wp-block-columns alignwide" style="margin-top:${tokenToCSS(columnGap)}">
        ${card('Service Moments', images[0])}
        ${card('Seasonal Plates', images[1])}
    </div>
    <!-- /wp:columns -->
    <!-- wp:columns {"align":"wide","style":{"spacing":{"blockGap":{"left":"${columnGap}"},"margin":{"top":"${tokens.spacing.cardPadding}"}}}} -->
    <div class="wp-block-columns alignwide" style="margin-top:${tokenToCSS(tokens.spacing.cardPadding)}">
        ${card('Behind the Pass', images[2])}
        ${card('Social Favorites', images[3])}
    </div>
    <!-- /wp:columns -->
</div>
<!-- /wp:group -->`;
}
