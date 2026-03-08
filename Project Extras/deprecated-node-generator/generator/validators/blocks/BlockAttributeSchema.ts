/**
 * BlockAttributeSchema.ts
 *
 * Defines required and recommended attributes per WordPress block type.
 * Used by BlockConfigValidator to detect incomplete block configurations
 * that would cause WordPress Site Editor "Attempt Recovery" crashes.
 *
 * Severity levels:
 *   required     → missing = CRITICAL (blocks ZIP creation)
 *   recommended  → missing = WARNING (logged only)
 *   validValues  → wrong value = ERROR (logged, blocks ZIP)
 */

export interface AttributeSpec {
    /** Attributes that MUST be present — missing causes WP crash */
    required: string[];
    /** Attributes that SHOULD be present — missing degrades UX/accessibility */
    recommended: string[];
    /** Allowed values per attribute — wrong value is flagged as error */
    validValues?: Record<string, string[]>;
    /** Known is-style-* className suffixes for this block */
    knownStyleVariations?: string[];
}

export type BlockAttributeSchemas = Record<string, AttributeSpec>;

/**
 * Known valid `service` values for core/social-link.
 * Source: WordPress Core social-link block registration.
 */
export const SOCIAL_LINK_SERVICES: string[] = [
    'wordpress',
    'facebook',
    'twitter',
    'x',
    'linkedin',
    'instagram',
    'github',
    'youtube',
    'tiktok',
    'pinterest',
    'soundcloud',
    'spotify',
    'tumblr',
    'twitch',
    'vimeo',
    'reddit',
    'telegram',
    'whatsapp',
    'discord',
    'snapchat',
    'yelp',
    'dribbble',
    'behance',
    'medium',
    'goodreads',
    'fivehundredpx',
    'bandcamp',
    'patreon',
    'chain',
    'mail',
    'mastodon',
    'bluesky',
];

/**
 * Attribute requirement schemas keyed by full block name (namespace/blockname).
 * Only blocks where missing attributes cause real problems are listed.
 * Unlisted blocks are not validated (pass through without checks).
 */
export const BLOCK_ATTRIBUTE_SCHEMA: BlockAttributeSchemas = {

    // ── Cover Block ──────────────────────────────────────────────────────────
    // dimRatio missing → overlay CSS class is wrong → text unreadable → "Attempt Recovery"
    'core/cover': {
        required: ['dimRatio'],
        recommended: ['overlayColor', 'minHeight'],
        knownStyleVariations: [],
    },

    // ── Template Part ────────────────────────────────────────────────────────
    // slug missing → WP cannot locate the part → entire template crashes
    'core/template-part': {
        required: ['slug'],
        recommended: ['tagName', 'theme'],
    },

    // ── Social Link ──────────────────────────────────────────────────────────
    // service missing or unknown → block renders with broken icon + broken link
    // url missing → dead icon, no link
    'core/social-link': {
        required: ['service', 'url'],
        recommended: [],
        validValues: {
            service: SOCIAL_LINK_SERVICES,
        },
    },

    // ── Query Loop ───────────────────────────────────────────────────────────
    // queryId + query object both required — WP throws JS error without them
    'core/query': {
        required: ['queryId', 'query'],
        recommended: [],
    },

    // ── Heading ──────────────────────────────────────────────────────────────
    // level is technically optional (defaults to 2) but explicit is required
    // per PressPilot CLAUDE.md output rules — ensures semantic correctness
    'core/heading': {
        required: ['level'],
        recommended: [],
        validValues: {
            level: ['1', '2', '3', '4', '5', '6'],
        },
        knownStyleVariations: [],
    },

    // ── Image ────────────────────────────────────────────────────────────────
    // alt is not required by WP but required for accessibility (WCAG AA)
    // url or id should be present to avoid blank images
    'core/image': {
        required: [],
        recommended: ['alt', 'url'],
        knownStyleVariations: ['rounded', 'default'],
    },

    // ── Gallery ──────────────────────────────────────────────────────────────
    'core/gallery': {
        required: [],
        recommended: ['columns'],
        knownStyleVariations: [],
    },

    // ── Button ───────────────────────────────────────────────────────────────
    // url can be '#' but must exist — href-less buttons are bad UX
    'core/button': {
        required: [],
        recommended: ['url'],
        knownStyleVariations: ['fill', 'outline'],
    },

    // ── Navigation ───────────────────────────────────────────────────────────
    // No hard-required attrs, but warn if completely empty (no ref, no children inline)
    'core/navigation': {
        required: [],
        recommended: [],
    },

    // ── Columns ──────────────────────────────────────────────────────────────
    'core/columns': {
        required: [],
        recommended: ['isStackedOnMobile'],
    },

    // ── Group ────────────────────────────────────────────────────────────────
    // layout is technically optional but strongly recommended to prevent
    // alignment issues — warn when missing
    'core/group': {
        required: [],
        recommended: ['layout'],
    },

    // ── Embed ────────────────────────────────────────────────────────────────
    // url must exist, providerNameSlug helps WP pick the right oEmbed handler
    'core/embed': {
        required: ['url'],
        recommended: ['providerNameSlug'],
    },
};
