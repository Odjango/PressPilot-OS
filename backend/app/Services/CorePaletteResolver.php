<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

/**
 * Maps abstract semantic color roles to concrete palette slugs for each proven-core theme.
 *
 * Problem: Each WordPress FSE core theme uses different slug names for the same
 * semantic roles (e.g., "muted body text" is `secondary` in Ollie, `contrast-2`
 * in TwentyTwentyFour, `body` in Spectra One). Skeleton HTML files need to
 * reference colors that work with whichever core is active.
 *
 * Solution: Skeletons use Ollie's slugs as the canonical standard (since Ollie
 * is the primary core). This resolver rewrites those slugs to the target core's
 * equivalents when a non-Ollie core is selected.
 *
 * Canonical (Ollie) slugs and their semantic meaning:
 *   - primary          → Brand primary color
 *   - primary-accent   → Light tint of primary
 *   - primary-alt      → Secondary brand / accent color
 *   - main             → Dark text / contrast (headings, strong text)
 *   - main-accent      → Lighter shade of main
 *   - base             → White / page background
 *   - secondary        → Muted body text (gray)
 *   - tertiary         → Light tinted background (sections, cards)
 *   - border-light     → Light border color
 *   - border-dark      → Dark border color
 */
class CorePaletteResolver
{
    /**
     * Mapping from canonical (Ollie) slug → target core slug.
     * Only entries that DIFFER from Ollie need to be listed.
     *
     * @var array<string, array<string, string>>
     */
    private const PALETTE_MAP = [
        // Ollie is canonical — no remapping needed
        'ollie' => [],

        'frost' => [
            'primary'        => 'primary',
            'primary-accent' => 'neutral',       // no exact match, use neutral as light tint
            'primary-alt'    => 'secondary',
            'main'           => 'contrast',
            'main-accent'    => 'contrast',       // frost has no mid-gray, use contrast
            'base'           => 'base',
            'secondary'      => 'contrast',       // frost has no muted text, use contrast
            'tertiary'       => 'neutral',
            'border-light'   => 'neutral',
            'border-dark'    => 'contrast',
        ],

        'tove' => [
            'primary'        => 'foreground',     // tove uses "foreground" as brand color
            'primary-accent' => 'primary',        // pink tint
            'primary-alt'    => 'secondary',      // yellow accent
            'main'           => 'quinary',        // #000000
            'main-accent'    => 'quinary',
            'base'           => 'senary',         // #FFFFFF
            'secondary'      => 'quinary',        // no muted gray in tove
            'tertiary'       => 'background',     // warm cream #FBF4EF
            'border-light'   => 'background',
            'border-dark'    => 'quinary',
        ],

        'spectra-one' => [
            'primary'        => 'primary',
            'primary-accent' => 'tertiary',       // #F6EBFE light purple
            'primary-alt'    => 'secondary',
            'main'           => 'heading',         // #1F2937
            'main-accent'    => 'neutral',         // #6E7787
            'base'           => 'background',      // #FFFFFF
            'secondary'      => 'body',            // #4B5563
            'tertiary'       => 'surface',         // #F8FAFC
            'border-light'   => 'outline',         // #E6E9EF
            'border-dark'    => 'neutral',
        ],

        'twentytwentyfour' => [
            'primary'        => 'accent-3',        // #d8613c (orange-red)
            'primary-accent' => 'accent',          // #cfcabe
            'primary-alt'    => 'accent-2',        // #c2a990
            'main'           => 'contrast',        // #111111
            'main-accent'    => 'contrast-3',      // #A4A4A4
            'base'           => 'base',            // #f9f9f9
            'secondary'      => 'contrast-2',      // #636363
            'tertiary'       => 'base-2',          // #ffffff
            'border-light'   => 'accent',
            'border-dark'    => 'contrast-2',
        ],

        // Blockbase is a bare foundation — map to Ollie since it has no palette.
        // In practice, the ThemeAssembler injects Ollie's palette into blockbase's theme.json.
        'blockbase' => [],
    ];

    /**
     * Get the list of supported core slugs.
     *
     * @return string[]
     */
    public static function supportedCores(): array
    {
        return array_keys(self::PALETTE_MAP);
    }

    /**
     * Resolve a canonical (Ollie) color slug to the target core's slug.
     *
     * @param  string  $canonicalSlug  The Ollie slug (e.g., "secondary")
     * @param  string  $coreSlug       The target core (e.g., "twentytwentyfour")
     * @return string  The resolved slug for the target core
     */
    public function resolve(string $canonicalSlug, string $coreSlug): string
    {
        $map = self::PALETTE_MAP[$coreSlug] ?? [];

        return $map[$canonicalSlug] ?? $canonicalSlug;
    }

    /**
     * Rewrite all color slugs in skeleton HTML from canonical (Ollie) to a target core.
     *
     * Handles three locations where color slugs appear in WordPress block markup:
     * 1. Block comment JSON attributes: "textColor":"secondary" → "textColor":"body"
     * 2. CSS class names: has-secondary-color → has-body-color
     * 3. CSS class names: has-tertiary-background-color → has-surface-background-color
     *
     * @param  string  $html      Skeleton HTML using canonical (Ollie) slugs
     * @param  string  $coreSlug  Target core slug
     * @return string  HTML with slugs rewritten for the target core
     */
    public function rewriteHtml(string $html, string $coreSlug): string
    {
        // Ollie and blockbase use canonical slugs — no rewriting needed
        if ($coreSlug === 'ollie' || $coreSlug === 'blockbase' || !isset(self::PALETTE_MAP[$coreSlug])) {
            return $html;
        }

        $map = self::PALETTE_MAP[$coreSlug];
        if (empty($map)) {
            return $html;
        }

        // Sort by key length descending to prevent partial replacements
        // (e.g., "primary-accent" must be replaced before "primary")
        uksort($map, fn($a, $b) => strlen($b) - strlen($a));

        foreach ($map as $canonicalSlug => $targetSlug) {
            if ($canonicalSlug === $targetSlug) {
                continue;
            }

            // 1. Block comment JSON: "textColor":"secondary" or "backgroundColor":"tertiary"
            //    Match color attribute keys followed by the exact slug value
            $html = preg_replace(
                '/"(textColor|backgroundColor|overlayColor|iconColor)":"' . preg_quote($canonicalSlug, '/') . '"/',
                '"$1":"' . $targetSlug . '"',
                $html
            );

            // 2. CSS class: has-{slug}-color (text color class)
            $html = str_replace(
                'has-' . $canonicalSlug . '-color',
                'has-' . $targetSlug . '-color',
                $html
            );

            // 3. CSS class: has-{slug}-background-color (background color class)
            $html = str_replace(
                'has-' . $canonicalSlug . '-background-color',
                'has-' . $targetSlug . '-background-color',
                $html
            );

            // 4. iconColorValue references (rare but possible)
            $html = preg_replace(
                '/"iconColor":"' . preg_quote($canonicalSlug, '/') . '"/',
                '"iconColor":"' . $targetSlug . '"',
                $html
            );
        }

        Log::debug('CorePaletteResolver: Rewrote color slugs', [
            'core' => $coreSlug,
            'mappings_applied' => count($map),
        ]);

        return $html;
    }

    /**
     * Get the full palette map for a specific core (for debugging/testing).
     *
     * @return array<string, string>
     */
    public function getMap(string $coreSlug): array
    {
        return self::PALETTE_MAP[$coreSlug] ?? [];
    }
}
