import type { SectionContext } from '../../recipes/types';
import { tokenToCSS } from '../../utils/BlockHelpers';

export function getSaasPricingTableSectionWithContext(ctx: SectionContext): string {
    const { tokens, section } = ctx;
    const sectionPadding = tokens.spacing.sectionPadding;
    const cardPadding = tokens.spacing.cardPadding;
    const buttonRadius = tokens.radius.button;
    const buttonWeight = tokens.typography.buttonWeight;
    const bgColor = section.backgroundColor || 'base-2';

    const tier = (
        title: string,
        priceToken: string,
        f1: string,
        f2: string,
        f3: string,
        primary = false
    ) => `<!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:group {"backgroundColor":"${primary ? 'accent' : 'base'}","style":{"border":{"radius":"${tokens.radius.card}"},"spacing":{"padding":{"top":"${cardPadding}","right":"${cardPadding}","bottom":"${cardPadding}","left":"${cardPadding}"}}},"layout":{"type":"constrained"}} -->
            <div class="wp-block-group has-${primary ? 'accent' : 'base'}-background-color has-background" style="border-radius:${tokens.radius.card};padding-top:${tokenToCSS(cardPadding)};padding-right:${tokenToCSS(cardPadding)};padding-bottom:${tokenToCSS(cardPadding)};padding-left:${tokenToCSS(cardPadding)}">
                <!-- wp:heading {"level":4,"textColor":"${primary ? 'base' : 'contrast'}"} -->
                <h4 class="wp-block-heading has-${primary ? 'base' : 'contrast'}-color has-text-color">${title}</h4>
                <!-- /wp:heading -->
                <!-- wp:paragraph {"textColor":"${primary ? 'base' : 'accent'}","style":{"typography":{"fontSize":"2rem","fontWeight":"700"}}} -->
                <p class="has-${primary ? 'base' : 'accent'}-color has-text-color" style="font-size:2rem;font-weight:700">{{${priceToken}}}</p>
                <!-- /wp:paragraph -->
                <!-- wp:list {"textColor":"${primary ? 'base' : 'contrast-2'}"} -->
                <ul class="has-${primary ? 'base' : 'contrast-2'}-color has-text-color">
                    <li>{{${f1}}}</li>
                    <li>{{${f2}}}</li>
                    <li>{{${f3}}}</li>
                </ul>
                <!-- /wp:list -->
                <!-- wp:buttons {"style":{"spacing":{"margin":{"top":"${tokens.spacing.buttonMarginTop}"}}}} -->
                <div class="wp-block-buttons" style="margin-top:${tokenToCSS(tokens.spacing.buttonMarginTop)}">
                    <!-- wp:button {"width":100,"backgroundColor":"${primary ? 'base' : 'accent'}","textColor":"${primary ? 'contrast' : 'base'}","style":{"border":{"radius":"${buttonRadius}"},"typography":{"fontWeight":"${buttonWeight}"}}} -->
                    <div class="wp-block-button has-custom-width wp-block-button__width-100"><a class="wp-block-button__link has-${primary ? 'contrast' : 'base'}-color has-${primary ? 'base' : 'accent'}-background-color has-text-color has-background wp-element-button" style="border-radius:${buttonRadius};font-weight:${buttonWeight}">Choose ${title}</a></div>
                    <!-- /wp:button -->
                </div>
                <!-- /wp:buttons -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->`;

    return `<!-- wp:group {"align":"full","backgroundColor":"${bgColor}","style":{"spacing":{"padding":{"top":"${sectionPadding}","bottom":"${sectionPadding}"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-${bgColor}-background-color has-background" style="padding-top:${tokenToCSS(sectionPadding)};padding-bottom:${tokenToCSS(sectionPadding)}">
    <!-- wp:heading {"textAlign":"center","textColor":"contrast"} -->
    <h2 class="wp-block-heading has-text-align-center has-contrast-color has-text-color">Simple, Transparent Pricing</h2>
    <!-- /wp:heading -->
    <!-- wp:columns {"align":"wide","style":{"spacing":{"margin":{"top":"${tokens.spacing.columnGap}"}}}} -->
    <div class="wp-block-columns alignwide" style="margin-top:${tokenToCSS(tokens.spacing.columnGap)}">
        ${tier('Free', 'price_basic', 'price_basic_feature_1', 'price_basic_feature_2', 'price_basic_feature_3')}
        ${tier('Pro', 'price_pro', 'price_pro_feature_1', 'price_pro_feature_2', 'price_pro_feature_3', true)}
        ${tier('Enterprise', 'price_enterprise', 'price_enterprise_feature_1', 'price_enterprise_feature_2', 'price_enterprise_feature_3')}
    </div>
    <!-- /wp:columns -->
</div>
<!-- /wp:group -->`;
}
