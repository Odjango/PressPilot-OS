/**
 * NOTE: Keep in sync with PHP variants in:
 * src/preview/heroPreviewInjector.ts (pp_hero_* functions)
 *
 * This TypeScript file generates hero markup at build time for the final theme.
 * The PHP mirror generates the same markup at runtime for hero preview screenshots.
 * Both must produce identical HTML/block structures for visual consistency.
 */
import { PageContent, HeroLayout } from '../types';

/**
 * Hero Layout Variants - TT4-Aligned
 *
 * Four distinct hero layouts for homepage customization:
 * - fullBleed: Full-screen image hero with dark overlay (default)
 * - fullWidth: Solid color band hero (no image)
 * - split: Text left, image right columns
 * - minimal: Clean text-only on white background
 *
 * All variants use TT4 semantic color tokens for consistent theming.
 *
 * Hero Best Practices Applied:
 * 1. Clear text-background contrast: 75% overlay on image heroes
 * 2. Overlay color: Using accent-3 for branded overlay on busy images
 * 3. Max text width: ~900px (contentSize) for optimal readability
 * 4. Generous vertical spacing: spacing|60 (tall) and spacing|50 (medium)
 * 5. CTA differentiation: Primary is solid button, secondary is outline
 */

/**
 * Full-Bleed Hero
 * Immersive full-screen background image with 75% dark overlay.
 * Uses accent-3 for branded overlay color.
 * Navigation is EMBEDDED inside the cover block for transparent overlay effect.
 *
 * Key visual characteristics:
 * - 100vh minimum height for immersive feel
 * - Transparent nav bar overlaid on the hero image (light text on dark overlay)
 * - LEFT-aligned text (not centered)
 * - Large heading: clamp(3rem, 6vw, 5rem)
 * - Generous padding: spacing|70
 */
export function getFullBleedHero(
    content?: PageContent,
    businessName?: string,
    pages?: { title: string, slug: string }[],
    hasLogo?: boolean
): string {
    const title = content?.hero_title || 'Welcome';
    const sub = content?.hero_sub || 'We enable businesses to grow.';
    const heroImage = content?.hero_image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80';
    const siteName = businessName || 'PressPilot Site';

    // Build navigation links for the embedded transparent nav
    const navPages = pages && pages.length > 0 ? pages : [
        { title: 'Home', slug: '' },
        { title: 'About', slug: 'about' },
        { title: 'Services', slug: 'services' },
        { title: 'Contact', slug: 'contact' }
    ];
    const navLinks = navPages.map(page => {
        const url = page.slug === 'home' || page.slug === '' ? '/' : `/${page.slug}`;
        return `<!-- wp:navigation-link {"label":"${page.title}","url":"${url}","kind":"custom","isTopLevelLink":true} /-->`;
    }).join('\n                    ');

    // Logo block (site-logo or site-title)
    const logoBlock = hasLogo
        ? `<!-- wp:site-logo {"width":60} /-->`
        : '';
    const siteTitleBlock = `<!-- wp:site-title {"level":0,"style":{"typography":{"fontStyle":"normal","fontWeight":"700","fontSize":"1.5rem"}},"textColor":"base"} /-->`;

    return `<!-- wp:cover {"url":"${heroImage}","dimRatio":75,"overlayColor":"accent-3","minHeight":100,"minHeightUnit":"vh","align":"full","style":{"spacing":{"padding":{"top":"0","bottom":"var:preset|spacing|70","left":"0","right":"0"}}},"layout":{"type":"default"}} -->
<div class="wp-block-cover alignfull" style="padding-top:0;padding-bottom:var(--wp--preset--spacing--70);padding-left:0;padding-right:0;min-height:100vh">
    <span aria-hidden="true" class="wp-block-cover__background has-accent-3-background-color has-background-dim-80 has-background-dim"></span>
    <img class="wp-block-cover__image-background" alt="" src="${heroImage}" data-object-fit="cover"/>
    <div class="wp-block-cover__inner-container">
        <!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|30","bottom":"var:preset|spacing|30","left":"var:preset|spacing|50","right":"var:preset|spacing|50"}}},"layout":{"type":"flex","justifyContent":"space-between","flexWrap":"nowrap"}} -->
        <div class="wp-block-group alignfull" style="padding-top:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--30);padding-left:var(--wp--preset--spacing--50);padding-right:var(--wp--preset--spacing--50)">
            <!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap"},"style":{"spacing":{"blockGap":"var:preset|spacing|20"}}} -->
            <div class="wp-block-group">
                ${logoBlock}
                ${siteTitleBlock}
            </div>
            <!-- /wp:group -->
            <!-- wp:navigation {"textColor":"base","layout":{"type":"flex","justifyContent":"right","orientation":"horizontal"},"style":{"typography":{"fontWeight":"600","fontSize":"1rem"},"spacing":{"blockGap":"var:preset|spacing|30"}}} -->
                    ${navLinks}
            <!-- /wp:navigation -->
        </div>
        <!-- /wp:group -->
        <!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|60","left":"var:preset|spacing|50","right":"var:preset|spacing|50"}}},"layout":{"type":"constrained","contentSize":"900px","justifyContent":"left"}} -->
        <div class="wp-block-group" style="padding-top:var(--wp--preset--spacing--60);padding-left:var(--wp--preset--spacing--50);padding-right:var(--wp--preset--spacing--50)">
            <!-- wp:heading {"textAlign":"left","level":1,"style":{"typography":{"fontSize":"clamp(3rem, 6vw, 5rem)","lineHeight":"1.1"}},"textColor":"base"} -->
            <h1 class="wp-block-heading has-text-align-left has-base-color has-text-color" style="font-size:clamp(3rem, 6vw, 5rem);line-height:1.1">${title}</h1>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"fontSize":"large","textColor":"base","style":{"spacing":{"margin":{"top":"var:preset|spacing|20"}}}} -->
            <p class="has-base-color has-text-color has-large-font-size" style="margin-top:var(--wp--preset--spacing--20)">${sub}</p>
            <!-- /wp:paragraph -->
            <!-- wp:buttons {"style":{"spacing":{"margin":{"top":"var:preset|spacing|40"}}}} -->
            <div class="wp-block-buttons" style="margin-top:var(--wp--preset--spacing--40)">
                <!-- wp:button {"backgroundColor":"base","textColor":"contrast"} -->
                <div class="wp-block-button"><a class="wp-block-button__link has-contrast-color has-base-background-color has-text-color has-background wp-element-button">Get Started</a></div>
                <!-- /wp:button -->
                <!-- wp:button {"style":{"border":{"width":"2px"}},"borderColor":"base","textColor":"base","className":"is-style-outline"} -->
                <div class="wp-block-button is-style-outline"><a class="wp-block-button__link has-base-color has-text-color has-border-color has-base-border-color wp-element-button" style="border-width:2px">Learn More</a></div>
                <!-- /wp:button -->
            </div>
            <!-- /wp:buttons -->
        </div>
        <!-- /wp:group -->
    </div>
</div>
<!-- /wp:cover -->`;
}

/**
 * Full-Width Band Hero
 * Image hero band with branded overlay, positioned below the standard header.
 * Uses accent-3 for branded overlay on background image.
 *
 * Key visual characteristics:
 * - 60vh height (shorter than fullBleed, not full-screen)
 * - Background image with 70% overlay (lighter than fullBleed)
 * - CENTERED text (vs fullBleed's left-aligned)
 * - Smaller heading: clamp(2rem, 4vw, 3rem)
 * - Narrower content: 800px
 * - Standard header is shown separately above this hero
 */
export function getFullWidthHero(content?: PageContent): string {
    const title = content?.hero_title || 'Welcome';
    const sub = content?.hero_sub || 'We enable businesses to grow.';
    const heroImage = content?.hero_image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80';

    return `<!-- wp:cover {"url":"${heroImage}","dimRatio":70,"overlayColor":"accent-3","minHeight":60,"minHeightUnit":"vh","align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60","left":"var:preset|spacing|50","right":"var:preset|spacing|50"}}},"layout":{"type":"constrained","contentSize":"800px"}} -->
<div class="wp-block-cover alignfull" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60);padding-left:var(--wp--preset--spacing--50);padding-right:var(--wp--preset--spacing--50);min-height:60vh">
    <span aria-hidden="true" class="wp-block-cover__background has-accent-3-background-color has-background-dim-70 has-background-dim"></span>
    <img class="wp-block-cover__image-background" alt="" src="${heroImage}" data-object-fit="cover"/>
    <div class="wp-block-cover__inner-container">
        <!-- wp:heading {"textAlign":"center","level":1,"style":{"typography":{"fontSize":"clamp(2rem, 4vw, 3rem)"}},"textColor":"base"} -->
        <h1 class="wp-block-heading has-text-align-center has-base-color has-text-color" style="font-size:clamp(2rem, 4vw, 3rem)">${title}</h1>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"align":"center","fontSize":"medium","textColor":"base"} -->
        <p class="has-text-align-center has-base-color has-text-color has-medium-font-size">${sub}</p>
        <!-- /wp:paragraph -->
        <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"margin":{"top":"var:preset|spacing|20"}}}} -->
        <div class="wp-block-buttons is-layout-flex is-content-justification-center" style="margin-top:var(--wp--preset--spacing--20)">
            <!-- wp:button {"backgroundColor":"base","textColor":"accent-3"} -->
            <div class="wp-block-button"><a class="wp-block-button__link has-accent-3-color has-base-background-color has-text-color has-background wp-element-button">Get Started</a></div>
            <!-- /wp:button -->
            <!-- wp:button {"style":{"border":{"width":"2px"}},"borderColor":"base","textColor":"base","className":"is-style-outline"} -->
            <div class="wp-block-button is-style-outline"><a class="wp-block-button__link has-base-color has-text-color has-border-color has-base-border-color wp-element-button" style="border-width:2px">Learn More</a></div>
            <!-- /wp:button -->
        </div>
        <!-- /wp:buttons -->
    </div>
</div>
<!-- /wp:cover -->`;
}

/**
 * Split Hero
 * Two-column layout: text on left, image on right.
 * White/base background with contrast text.
 *
 * Key visual characteristics:
 * - 2-column layout with text left, image right
 * - Larger column gap: spacing|60
 * - Image card with prominent shadow and 20px radius
 * - Rounded buttons (8px radius)
 * - Generous padding: spacing|60
 */
export function getSplitHero(content?: PageContent): string {
    const title = content?.hero_title || 'Welcome';
    const sub = content?.hero_sub || 'We enable businesses to grow.';
    const heroImage = content?.hero_image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80';

    return `<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}},"backgroundColor":"base","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-base-background-color has-background" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)">
    <!-- wp:columns {"align":"wide","style":{"spacing":{"blockGap":{"left":"var:preset|spacing|60"}}}} -->
    <div class="wp-block-columns alignwide">
        <!-- wp:column {"verticalAlignment":"center","width":"50%"} -->
        <div class="wp-block-column is-vertically-aligned-center" style="flex-basis:50%">
            <!-- wp:heading {"level":1,"style":{"typography":{"fontSize":"clamp(2.5rem, 5vw, 4rem)","lineHeight":"1.15"}},"textColor":"contrast"} -->
            <h1 class="wp-block-heading has-contrast-color has-text-color" style="font-size:clamp(2.5rem, 5vw, 4rem);line-height:1.15">${title}</h1>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"fontSize":"large","textColor":"contrast-2","style":{"spacing":{"margin":{"top":"var:preset|spacing|20"}}}} -->
            <p class="has-contrast-2-color has-text-color has-large-font-size" style="margin-top:var(--wp--preset--spacing--20)">${sub}</p>
            <!-- /wp:paragraph -->
            <!-- wp:buttons {"style":{"spacing":{"margin":{"top":"var:preset|spacing|40"}}}} -->
            <div class="wp-block-buttons" style="margin-top:var(--wp--preset--spacing--40)">
                <!-- wp:button {"backgroundColor":"contrast","textColor":"base","style":{"border":{"radius":"8px"}}} -->
                <div class="wp-block-button"><a class="wp-block-button__link has-base-color has-contrast-background-color has-text-color has-background wp-element-button" style="border-radius:8px">Get Started</a></div>
                <!-- /wp:button -->
                <!-- wp:button {"style":{"border":{"width":"2px","radius":"8px"}},"borderColor":"accent","textColor":"accent","className":"is-style-outline"} -->
                <div class="wp-block-button is-style-outline"><a class="wp-block-button__link has-accent-color has-text-color has-border-color has-accent-border-color wp-element-button" style="border-width:2px;border-radius:8px">Learn More</a></div>
                <!-- /wp:button -->
            </div>
            <!-- /wp:buttons -->
        </div>
        <!-- /wp:column -->
        <!-- wp:column {"width":"50%"} -->
        <div class="wp-block-column" style="flex-basis:50%">
            <!-- wp:image {"sizeSlug":"large","style":{"border":{"radius":"20px"},"shadow":"0 10px 40px rgba(0,0,0,0.15)"}} -->
            <figure class="wp-block-image size-large has-custom-border" style="border-radius:20px;box-shadow:0 10px 40px rgba(0,0,0,0.15)"><img src="${heroImage}" alt=""/></figure>
            <!-- /wp:image -->
        </div>
        <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->
</div>
<!-- /wp:group -->`;
}

/**
 * Minimal Hero
 * Clean text-only hero on white background.
 * Large centered heading with subtle styling.
 *
 * Key visual characteristics:
 * - Maximum whitespace: spacing|80 padding
 * - Narrow content: 700px for typography-first feel
 * - Large heading: clamp(3rem, 7vw, 5rem) with tight letter-spacing
 * - SINGLE pill-shaped CTA (100px radius)
 * - Uses contrast bg for button (not accent)
 */
export function getMinimalHero(content?: PageContent): string {
    const title = content?.hero_title || 'Welcome';
    const sub = content?.hero_sub || 'We enable businesses to grow.';

    return `<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|80","bottom":"var:preset|spacing|80"}}},"backgroundColor":"base","layout":{"type":"constrained","contentSize":"700px"}} -->
<div class="wp-block-group alignfull has-base-background-color has-background" style="padding-top:var(--wp--preset--spacing--80);padding-bottom:var(--wp--preset--spacing--80)">
    <!-- wp:heading {"textAlign":"center","level":1,"style":{"typography":{"fontSize":"clamp(3rem, 7vw, 5rem)","lineHeight":"1.05","letterSpacing":"-0.02em"}},"textColor":"contrast"} -->
    <h1 class="wp-block-heading has-text-align-center has-contrast-color has-text-color" style="font-size:clamp(3rem, 7vw, 5rem);line-height:1.05;letter-spacing:-0.02em">${title}</h1>
    <!-- /wp:heading -->
    <!-- wp:paragraph {"align":"center","fontSize":"large","textColor":"contrast-2","style":{"spacing":{"margin":{"top":"var:preset|spacing|30"}}}} -->
    <p class="has-text-align-center has-contrast-2-color has-text-color has-large-font-size" style="margin-top:var(--wp--preset--spacing--30)">${sub}</p>
    <!-- /wp:paragraph -->
    <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"margin":{"top":"var:preset|spacing|50"}}}} -->
    <div class="wp-block-buttons is-layout-flex is-content-justification-center" style="margin-top:var(--wp--preset--spacing--50)">
        <!-- wp:button {"backgroundColor":"contrast","textColor":"base","style":{"border":{"radius":"100px"},"spacing":{"padding":{"left":"var:preset|spacing|50","right":"var:preset|spacing|50","top":"var:preset|spacing|20","bottom":"var:preset|spacing|20"}}}} -->
        <div class="wp-block-button"><a class="wp-block-button__link has-base-color has-contrast-background-color has-text-color has-background wp-element-button" style="border-radius:100px;padding-top:var(--wp--preset--spacing--20);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--20);padding-left:var(--wp--preset--spacing--50)">Get Started</a></div>
        <!-- /wp:button -->
    </div>
    <!-- /wp:buttons -->
</div>
<!-- /wp:group -->`;
}

/**
 * Get hero content by layout type
 */
export function getHeroByLayout(
    layout: HeroLayout | undefined,
    content?: PageContent,
    businessName?: string,
    pages?: { title: string, slug: string }[],
    hasLogo?: boolean
): string {
    const normalizedLayout = normalizeHeroLayout(layout);

    switch (normalizedLayout) {
        case 'fullBleed':
            return getFullBleedHero(content, businessName, pages, hasLogo);
        case 'fullWidth':
            return getFullWidthHero(content);
        case 'split':
            return getSplitHero(content);
        case 'minimal':
            return getMinimalHero(content);
        default:
            // Default to fullBleed
            return getFullBleedHero(content, businessName, pages, hasLogo);
    }
}

function normalizeHeroLayout(layout: HeroLayout | string | undefined): HeroLayout | undefined {
    if (typeof layout !== 'string') {
        return layout;
    }

    const normalized = layout.trim().toLowerCase();
    const compact = normalized.replace(/[\s_-]+/g, '');

    if (normalized.includes('full bleed') || compact === 'fullbleed' || compact === 'fullbleedhero') {
        return 'fullBleed';
    }

    if (normalized.includes('full width') || compact === 'fullwidth' || compact === 'fullwidthband') {
        return 'fullWidth';
    }

    if (compact === 'split' || compact === 'splithero') {
        return 'split';
    }

    if (compact === 'minimal' || compact === 'minimalhero') {
        return 'minimal';
    }

    if (layout === 'fullBleed' || layout === 'fullWidth' || layout === 'split' || layout === 'minimal') {
        return layout;
    }

    return undefined;
}
