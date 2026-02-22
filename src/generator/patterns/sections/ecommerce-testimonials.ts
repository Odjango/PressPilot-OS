import type { SectionContext } from '../../recipes/types';
import { tokenToCSS } from '../../utils/BlockHelpers';
import { sanitizeForPHP } from '../../utils/sanitize';

export function getEcommerceTestimonialsSectionWithContext(ctx: SectionContext): string {
    const { tokens, section, render } = ctx;
    const sectionPadding = tokens.spacing.sectionPadding;
    const cardPadding = tokens.spacing.cardPadding;
    const bgColor = section.backgroundColor || 'base';
    const content = (render.content || {}) as Record<string, unknown>;

    const getText = (key: string, fallback: string): string => {
        const raw = content[key];
        const value = typeof raw === 'string' ? raw.trim() : '';
        return sanitizeForPHP(value || fallback);
    };

    const defaults = [
        { rating: '5.0', quote: 'Beautiful quality and fast shipping. Exactly what I hoped for.', name: 'Riley M.', product: 'Essentials Set' },
        { rating: '4.9', quote: 'The fit and finish are excellent. I immediately ordered a second one.', name: 'Casey T.', product: 'Signature Jacket' },
        { rating: '5.0', quote: 'Customer support was responsive and helpful from checkout to delivery.', name: 'Morgan A.', product: 'Travel Bundle' }
    ];

    const review = (n: number) => {
        const d = defaults[n - 1];
        const rating = getText(`testimonial_${n}_rating`, d.rating);
        const quote = getText(`testimonial_${n}_quote`, d.quote);
        const name = getText(`testimonial_${n}_name`, d.name);
        const product = getText(`testimonial_${n}_product`, d.product);

        return `<!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:group {"backgroundColor":"base-2","style":{"border":{"radius":"${tokens.radius.card}"},"spacing":{"padding":{"top":"${cardPadding}","right":"${cardPadding}","bottom":"${cardPadding}","left":"${cardPadding}"}}},"layout":{"type":"constrained"}} -->
            <div class="wp-block-group has-base-2-background-color has-background" style="border-radius:${tokens.radius.card};padding-top:${tokenToCSS(cardPadding)};padding-right:${tokenToCSS(cardPadding)};padding-bottom:${tokenToCSS(cardPadding)};padding-left:${tokenToCSS(cardPadding)}">
                <!-- wp:paragraph {"textColor":"accent"} -->
                <p class="has-accent-color has-text-color"><strong>${rating} ★</strong></p>
                <!-- /wp:paragraph -->
                <!-- wp:paragraph {"textColor":"contrast-2"} -->
                <p class="has-contrast-2-color has-text-color">“${quote}”</p>
                <!-- /wp:paragraph -->
                <!-- wp:paragraph {"textColor":"contrast","fontSize":"small"} -->
                <p class="has-contrast-color has-text-color has-small-font-size"><strong>${name}</strong> · ${product}</p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->`;
    };

    return `<!-- wp:group {"align":"full","backgroundColor":"${bgColor}","style":{"spacing":{"padding":{"top":"${sectionPadding}","bottom":"${sectionPadding}"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-${bgColor}-background-color has-background" style="padding-top:${tokenToCSS(sectionPadding)};padding-bottom:${tokenToCSS(sectionPadding)}">
    <!-- wp:heading {"textAlign":"center","textColor":"contrast"} -->
    <h2 class="wp-block-heading has-text-align-center has-contrast-color has-text-color">Customer Favorites</h2>
    <!-- /wp:heading -->
    <!-- wp:columns {"align":"wide","style":{"spacing":{"margin":{"top":"${tokens.spacing.columnGap}"}}}} -->
    <div class="wp-block-columns alignwide" style="margin-top:${tokenToCSS(tokens.spacing.columnGap)}">
        ${review(1)}
        ${review(2)}
        ${review(3)}
    </div>
    <!-- /wp:columns -->
</div>
<!-- /wp:group -->`;
}
