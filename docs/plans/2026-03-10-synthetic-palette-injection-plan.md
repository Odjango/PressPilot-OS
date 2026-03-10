# Follow-Up: Synthetic Palette Injection for Incomplete Cores

**Date:** 2026-03-10
**Depends on:** CorePaletteResolver (already merged)
**Trigger:** When Frost or Tove become selectable cores in production
**Priority:** Low (blocked until multi-core UI is implemented)

---

## Problem

Frost and Tove have no natural "muted body text" color in their palettes:
- **Frost:** Only has `base` (#fff), `contrast` (#000), `primary` (#00f), `secondary` (#009), `neutral` (#eee)
- **Tove:** Only has `foreground` (#374AC8), `background` (#FBF4EF), `primary`-`quaternary` (pastels), `quinary` (#000), `senary` (#fff)

The CorePaletteResolver currently maps `secondary` (muted text) to:
- Frost → `contrast` (#000000) — **too harsh**, should be a mid-gray
- Tove → `quinary` (#000000) — **same problem**, black instead of muted

## Solution: Inject a Synthetic `muted` Palette Entry

In `ThemeAssembler::writeThemeJson()`, after loading the core's theme.json, detect if the resolved `secondary` slug points to the same hex as the `main`/dark slug (meaning no real distinction exists). If so, compute a 40% lighter variant and inject it as a new palette entry.

### Implementation (~15 lines in ThemeAssembler)

```php
// After loading themeJson and resolving palette overrides, check for
// cores that lack a distinct muted text color
$resolver = app(CorePaletteResolver::class);
$mainSlug = $resolver->resolve('main', $this->coreSlug);
$mutedSlug = $resolver->resolve('secondary', $this->coreSlug);

// If both resolve to the same palette slug, inject a synthetic muted color
if ($mainSlug === $mutedSlug) {
    // Find the main color's hex value
    $mainHex = null;
    foreach ($themeJson['settings']['color']['palette'] as $entry) {
        if (($entry['slug'] ?? '') === $mainSlug) {
            $mainHex = $entry['color'];
            break;
        }
    }

    if ($mainHex) {
        // Lighten by mixing 40% toward white
        $mutedHex = $this->lightenColor($mainHex, 0.4);

        // Inject as a new palette entry
        $themeJson['settings']['color']['palette'][] = [
            'slug' => 'pp-muted',
            'color' => $mutedHex,
            'name' => 'Muted Text',
        ];

        // Update the PALETTE_MAP override so the resolver knows about it
        // (This is a runtime override, not a static map change)
        Log::info('ThemeAssembler: Injected synthetic muted color', [
            'core' => $this->coreSlug,
            'from' => $mainHex,
            'muted' => $mutedHex,
        ]);
    }
}
```

Also add the `lightenColor()` helper:

```php
private function lightenColor(string $hex, float $amount): string
{
    $hex = ltrim($hex, '#');
    $r = hexdec(substr($hex, 0, 2));
    $g = hexdec(substr($hex, 2, 2));
    $b = hexdec(substr($hex, 4, 2));

    $r = (int) ($r + (255 - $r) * $amount);
    $g = (int) ($g + (255 - $g) * $amount);
    $b = (int) ($b + (255 - $b) * $amount);

    return '#' . str_pad(dechex($r), 2, '0', STR_PAD_LEFT)
              . str_pad(dechex($g), 2, '0', STR_PAD_LEFT)
              . str_pad(dechex($b), 2, '0', STR_PAD_LEFT);
}
```

### CorePaletteResolver Update

Update the PALETTE_MAP for frost and tove to point `secondary` to `pp-muted`:

```php
'frost' => [
    // ... existing mappings ...
    'secondary' => 'pp-muted',  // synthetic, injected at assembly time
],
'tove' => [
    // ... existing mappings ...
    'secondary' => 'pp-muted',  // synthetic, injected at assembly time
],
```

### Why This Works

- `pp-muted` gets injected into the theme.json palette array, so WordPress registers it as a real preset color
- Block editor color picker shows it
- CSS custom property `--wp--preset--color--pp-muted` gets auto-generated
- No skeleton changes needed — the resolver just maps `secondary` to `pp-muted`
- Ollie, Spectra One, and TT4 are unaffected (they have natural muted colors)

### Testing

1. Generate a theme with `'core' => 'frost'`
2. Verify theme.json contains a `pp-muted` entry with a mid-gray hex
3. Verify skeleton paragraphs render with visible gray (not black) text
4. Verify block editor color picker shows "Muted Text" option
5. Verify Ollie-based themes are completely unchanged

---

## Execution Strategy for Claude Code

This is a **single-agent task** — no parallelism needed:

1. Read this plan
2. Add `lightenColor()` to ThemeAssembler
3. Add the detection + injection logic in `writeThemeJson()`
4. Update CorePaletteResolver PALETTE_MAP for frost + tove
5. Run `cd backend && php artisan test` — all must pass
6. Commit with message: `feat: inject synthetic muted color for cores lacking a muted text slot`
