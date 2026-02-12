/**
 * Ecommerce Trust Badges Section - Generator 2.0 Phase 4
 *
 * 4-column grid of trust indicators (free shipping, secure payment, etc.)
 * Builds customer confidence before checkout.
 *
 * Token mappings:
 * - Section padding: tokens.spacing.sectionPadding
 * - Column gap: tokens.spacing.columnGap
 */

import type { SectionContext } from '../../recipes/types';
import { tokenToCSS } from '../../utils/BlockHelpers';

export function getEcommerceTrustBadgesSectionWithContext(ctx: SectionContext): string {
    const { tokens, section } = ctx;

    // Token-driven values
    const sectionPadding = tokens.spacing.sectionPadding;
    const columnGap = tokens.spacing.columnGap;

    const badges = [
        { icon: '🚚', title: 'Free Shipping', description: 'On orders over $50' },
        { icon: '🔒', title: 'Secure Checkout', description: '256-bit SSL encryption' },
        { icon: '↩️', title: '30-Day Returns', description: 'Hassle-free exchanges' },
        { icon: '💬', title: '24/7 Support', description: 'Always here to help' }
    ];

    const badgeColumns = badges.map(badge => `
        <!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:group {"layout":{"type":"constrained"}} -->
            <div class="wp-block-group">
                <!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"2.5rem"}}} -->
                <p class="has-text-align-center" style="font-size:2.5rem">${badge.icon}</p>
                <!-- /wp:paragraph -->
                <!-- wp:heading {"textAlign":"center","level":4,"textColor":"contrast"} -->
                <h4 class="wp-block-heading has-text-align-center has-contrast-color has-text-color">${badge.title}</h4>
                <!-- /wp:heading -->
                <!-- wp:paragraph {"align":"center","textColor":"contrast-2","fontSize":"small"} -->
                <p class="has-text-align-center has-contrast-2-color has-text-color has-small-font-size">${badge.description}</p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->`).join('\n');

    const bgColor = section.backgroundColor || 'base-2';

    return `<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"${sectionPadding}","bottom":"${sectionPadding}"}}},"backgroundColor":"${bgColor}","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-${bgColor}-background-color has-background" style="padding-top:${tokenToCSS(sectionPadding)};padding-bottom:${tokenToCSS(sectionPadding)}">
    <!-- wp:columns {"align":"wide","style":{"spacing":{"blockGap":{"left":"${columnGap}"}}}} -->
    <div class="wp-block-columns alignwide">
        ${badgeColumns}
    </div>
    <!-- /wp:columns -->
</div>
<!-- /wp:group -->`;
}
