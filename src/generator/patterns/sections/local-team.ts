import type { SectionContext } from '../../recipes/types';
import { tokenToCSS } from '../../utils/BlockHelpers';

export function getLocalTeamSectionWithContext(ctx: SectionContext): string {
    const { tokens, section } = ctx;
    const sectionPadding = tokens.spacing.sectionPadding;
    const cardPadding = tokens.spacing.cardPadding;
    const bgColor = section.backgroundColor || 'base';

    const member = (n: number) => `<!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:group {"backgroundColor":"base-2","style":{"border":{"radius":"${tokens.radius.card}"},"spacing":{"padding":{"top":"${cardPadding}","right":"${cardPadding}","bottom":"${cardPadding}","left":"${cardPadding}"}}},"layout":{"type":"constrained"}} -->
            <div class="wp-block-group has-base-2-background-color has-background" style="border-radius:${tokens.radius.card};padding-top:${tokenToCSS(cardPadding)};padding-right:${tokenToCSS(cardPadding)};padding-bottom:${tokenToCSS(cardPadding)};padding-left:${tokenToCSS(cardPadding)}">
                <!-- wp:image {"sizeSlug":"medium","linkDestination":"none","style":{"border":{"radius":"${tokens.radius.image}"}}} -->
                <figure class="wp-block-image size-medium"><img src="{{team_${n}_photo}}" alt="{{team_${n}_name}}" style="border-radius:${tokens.radius.image}"/></figure>
                <!-- /wp:image -->
                <!-- wp:heading {"level":4,"textColor":"contrast","style":{"spacing":{"margin":{"top":"${tokens.spacing.cardPadding}"}}}} -->
                <h4 class="wp-block-heading has-contrast-color has-text-color" style="margin-top:${tokenToCSS(tokens.spacing.cardPadding)}">{{team_${n}_name}}</h4>
                <!-- /wp:heading -->
                <!-- wp:paragraph {"textColor":"accent"} -->
                <p class="has-accent-color has-text-color"><strong>{{team_${n}_role}}</strong></p>
                <!-- /wp:paragraph -->
                <!-- wp:paragraph {"textColor":"contrast-2"} -->
                <p class="has-contrast-2-color has-text-color">{{team_${n}_bio}}</p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->`;

    return `<!-- wp:group {"align":"full","backgroundColor":"${bgColor}","style":{"spacing":{"padding":{"top":"${sectionPadding}","bottom":"${sectionPadding}"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-${bgColor}-background-color has-background" style="padding-top:${tokenToCSS(sectionPadding)};padding-bottom:${tokenToCSS(sectionPadding)}">
    <!-- wp:group {"align":"wide","layout":{"type":"constrained"}} -->
    <div class="wp-block-group alignwide">
        <!-- wp:heading {"textAlign":"center","textColor":"contrast"} -->
        <h2 class="wp-block-heading has-text-align-center has-contrast-color has-text-color">Meet Our Team</h2>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"align":"center","textColor":"contrast-2"} -->
        <p class="has-text-align-center has-contrast-2-color has-text-color">Skilled professionals committed to quality and care.</p>
        <!-- /wp:paragraph -->
    </div>
    <!-- /wp:group -->
    <!-- wp:columns {"align":"wide","style":{"spacing":{"margin":{"top":"${tokens.spacing.columnGap}"}}}} -->
    <div class="wp-block-columns alignwide" style="margin-top:${tokenToCSS(tokens.spacing.columnGap)}">
        ${member(1)}
        ${member(2)}
        ${member(3)}
    </div>
    <!-- /wp:columns -->
</div>
<!-- /wp:group -->`;
}
