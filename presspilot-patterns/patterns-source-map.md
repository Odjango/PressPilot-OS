# PressPilot Pattern Source Map

All patterns MUST be extracted from the `proven-cores/` vault.
Hand-written block markup is FORBIDDEN.

## Extraction Rules

1. Find the pattern file in `proven-cores/[theme]/patterns/`
2. Copy the EXACT block markup
3. Replace ONLY text content with `presspilot_string()` calls
4. Replace ONLY image URLs with `presspilot_image()` calls
5. Color slug mapping is allowed (mechanical transformation, not structural)
6. Test in WordPress — must show ZERO "Attempt Recovery" warnings

## Extracted Patterns

| Pattern | Source Theme | Source File | Color Mapping | Adaptations |
|---------|-------------|-------------|---------------|-------------|
| footer-restaurant | Tove | `footer-standard.php` | `contrast`→`foreground`, `base`→`background` | Added 2 nav links (5 total), contact info in col 3 |
| header-default | Frost | `header-default.php` | None | Added inline `wp:navigation-link` blocks + CTA button |
| chef-highlight | TT4 | `cta-services-image-left.php` | `accent-5`→`tertiary` | Text replacement only |
| hours-location | TT4 | `text-title-left-image-right.php` | `accent`→`tertiary` | Text replacement only |
| restaurant-about | TT4 | `text-title-left-image-right.php` | `accent`→`tertiary` | Removed `fontFamily:"heading"`, removed button, added 2nd paragraph |
| restaurant-reservation | Tove | `cta-vertical.php` | `senary`→`tertiary` | Removed `is-style-tove-shaded`, removed `inherit:true`, added phone paragraph |

## Color Slug Mapping Reference

| Source Slug | Our Slug | Reason |
|-------------|----------|--------|
| `contrast` | `foreground` | Dark color (TT4/Tove convention) |
| `base` | `background` | Light color (TT4/Tove convention) |
| `accent-5` | `tertiary` | Light section background |
| `accent` | `tertiary` | Light section background (kept `accent` if available) |

## Proven-Cores Vault

| Theme | Directory | Best For |
|-------|-----------|----------|
| tove | `proven-cores/tove/` | Restaurant menus, niche layouts, footers |
| ollie | `proven-cores/ollie/` | E-commerce, cards, contact details |
| frost | `proven-cores/frost/` | Clean headers, minimal layouts |
| spectra-one | `proven-cores/spectra-one/` | Business services, contact forms |
| blockbase | `proven-cores/blockbase/` | Minimal, content-only |
| twentytwentyfour | `proven-cores/twentytwentyfour/` | Universal patterns, accessibility gold standard |
