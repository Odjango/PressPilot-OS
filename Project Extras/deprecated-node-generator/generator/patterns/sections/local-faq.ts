import type { SectionContext } from '../../recipes/types';
import { tokenToCSS } from '../../utils/BlockHelpers';

export function getLocalFAQSectionWithContext(ctx: SectionContext): string {
    const { tokens, section } = ctx;
    const sectionPadding = tokens.spacing.sectionPadding;
    const cardPadding = tokens.spacing.cardPadding;
    const bgColor = section.backgroundColor || 'base';

    const qa = (n: number) => `<!-- wp:details {"style":{"spacing":{"margin":{"top":"${n === 1 ? '0px' : tokens.spacing.cardPadding}"}}}} -->
            <details style="margin-top:${n === 1 ? '0px' : tokenToCSS(tokens.spacing.cardPadding)}">
                <summary>{{faq_${n}_question}}</summary>
                <!-- wp:paragraph {"textColor":"contrast-2"} -->
                <p class="has-contrast-2-color has-text-color">{{faq_${n}_answer}}</p>
                <!-- /wp:paragraph -->
            </details>
            <!-- /wp:details -->`;

    return `<!-- wp:group {"align":"full","backgroundColor":"${bgColor}","style":{"spacing":{"padding":{"top":"${sectionPadding}","bottom":"${sectionPadding}"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-${bgColor}-background-color has-background" style="padding-top:${tokenToCSS(sectionPadding)};padding-bottom:${tokenToCSS(sectionPadding)}">
    <!-- wp:group {"align":"wide","layout":{"type":"constrained"}} -->
    <div class="wp-block-group alignwide">
        <!-- wp:heading {"textAlign":"center","textColor":"contrast"} -->
        <h2 class="wp-block-heading has-text-align-center has-contrast-color has-text-color">Frequently Asked Questions</h2>
        <!-- /wp:heading -->
        <!-- wp:group {"backgroundColor":"base-2","style":{"border":{"radius":"${tokens.radius.card}"},"spacing":{"padding":{"top":"${cardPadding}","right":"${cardPadding}","bottom":"${cardPadding}","left":"${cardPadding}"},"margin":{"top":"${tokens.spacing.columnGap}"}}},"layout":{"type":"constrained"}} -->
        <div class="wp-block-group has-base-2-background-color has-background" style="border-radius:${tokens.radius.card};margin-top:${tokenToCSS(tokens.spacing.columnGap)};padding-top:${tokenToCSS(cardPadding)};padding-right:${tokenToCSS(cardPadding)};padding-bottom:${tokenToCSS(cardPadding)};padding-left:${tokenToCSS(cardPadding)}">
            ${qa(1)}
            ${qa(2)}
            ${qa(3)}
            ${qa(4)}
        </div>
        <!-- /wp:group -->
    </div>
    <!-- /wp:group -->
</div>
<!-- /wp:group -->`;
}
