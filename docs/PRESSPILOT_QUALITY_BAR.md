PressPilot Quality Bar

Goal: Every generated site should look like a polished, premium block theme—not a demo mishmash. These rules are non‑negotiable.

1. Page‑level quality

Every homepage must:

Tell a clear story:

Above the fold: who it’s for, what it does, primary CTA.

Mid‑page: proof (testimonials, logos, menu preview, features).

End: decisive CTA (“Book a table”, “Start free trial”).

Show visual rhythm:

Alternate light/dark or image/solid sections (no 4–5 same‑tone bands in a row).

Alternate dense content sections with airy ones; at least one “breather” band between heavy blocks.

Have a clear focal path:

Hero heading → primary CTA.

Next key section (menu/feature grid).

Social proof.

Final CTA.

If the page cannot be read along that path, it does not meet the bar.

2. Layout and composition

Hero section:

Exactly one H1, 1–2 short paragraphs, and 1–2 primary CTAs.

One strong visual (photo or illustration) unless intentionally in a minimal text‑only mode.

Primary CTA visually dominant and clearly contrasted with background.

Section hierarchy:

Each major section starts with H2.

Sub‑content uses H3/H4 only as needed; no jump H1 → H4 without H2/H3.

Grid & alignment:

Cards/columns align to a consistent grid (2–4 columns on desktop).

Text and buttons line up vertically across sections; no off‑grid buttons.

3. Visual system and tokens

Tokens only:

Patterns use design tokens for colors, spacing, radii, shadows—not raw hex or arbitrary pixel values.

Spacing comes from a scale (XS–XL); no random 17px, 23px.

Brand modes must feel distinct:

Playful: pastel bands, softer radii, friendly typography.

Modern: neutral backgrounds, sharper radii, bold typography, photo‑driven.

Minimal: lots of white/negative space, very limited color, simple shapes.

Bold: strong color blocks, high contrast, fewer subtle grays.

If two modes of the same vertical look nearly identical, the mode implementation fails this bar.

4. Section‑level contracts (examples)

Each section type has a contract that patterns must follow.

Restaurant menu preview:

4–8 items, consistent card/frame style, with name + short descriptor + price.

Items arranged in a clean grid (2×2, 3×2, etc.), not a single long column.

Testimonials / social proof:

Up to 3 cards per row on desktop; each card has quote, name, and role.

Optional logo row or rating, but no large wall of text.

SaaS feature section:

3–6 features, each with icon, title, and one‑line explanation.

At least one CTA link or button inside or adjacent to the section.

These contracts should be implemented as schemas keyed by SectionType.

5. Spacing and structure

Vertical rhythm:

Consistent section padding across the page; responsive adjustments controlled by tokens.

No extra blank band above header or below footer; hero starts close to top, footer hugs content.

Nesting limits:

Max 3 levels of Groups/Stacks per section.

Prefer Stack/Columns over deeply nested Groups.

Patterns exceeding nesting or spacing rules should fail linting or tests.

6. Accessibility and contrast

Contrast:

All text meets WCAG AA contrast for its size.

High‑risk areas (hero, promo bands, buttons) must use predefined safe token pairs.

Click/tap targets:

Buttons and primary CTAs are at least 44×44 CSS pixels.

CTAs are not tiny links in large empty bands.

Semantics:

Exactly one H1 per page.

Logical heading structure inside sections.

Main content wrapped correctly (when landmarks are used).

Themes failing basic contrast or heading rules are invalid.

7. Reference gallery and regression

Maintain at least 2 approved homepages per vertical × brand mode as reference.

Visual regression compares new outputs to these for:

Section order and presence.

Broad color/contrast and spacing.

Overall silhouette (no unexpected layout jumps).

Drift from the gallery without explicit design approval should fail tests or raise a high‑severity warning.