Quality and Rules
Always treat these documents as mandatory:


docs/PRESSPILOT_QUALITY_BAR.md – defines what a “good” PressPilot site looks like.


docs/PROJECT_ROADMAP.md – current phases and priorities.


When you change generator logic, patterns, or design tokens, you MUST:


Follow every rule in PRESSPILOT_QUALITY_BAR.md.


Run or update tests so these rules are enforced.


Do not mark the task complete if any quality‑bar item is broken.


Before you consider the task complete, verify that:


The homepage follows the story arc: clear hero → key section (menu/features) → social proof → final CTA, with visible CTAs in hero and at the end.


Sections alternate visually (light/dark or image/solid) and include at least one airy “breather” band between dense sections.


Hero has a single H1, 1–2 short paragraphs, 1–2 CTAs, and a strong visual; primary CTA is clearly more prominent than secondary actions.


All section patterns use design tokens only (colors, spacing, radii, shadows), no raw hex values or ad‑hoc pixel spacings.


Brand modes (Playful vs Modern, etc.) look visibly different in backgrounds, radii, and typography, not just in tiny color tweaks.


Each section type respects its contract (e.g., menu preview 4–8 items in a grid; testimonials up to 3 cards per row with quote + name + role).


There are no header/footer gaps; section padding is consistent and uses the spacing scale.


Accessibility basics pass: one H1, sane heading hierarchy, safe contrast tokens in hero/promo/buttons, reasonably large CTAs.


New screenshots for each vertical × mode you touch still look close to the approved reference gallery (no obvious regressions in structure or rhythm).


All relevant tests are passing: token and recipe unit tests, semantic checks (section order, headings, contrast), and visual regression for the affected scenarios.