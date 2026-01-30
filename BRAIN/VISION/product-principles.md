# PressPilot – Product Principles

## 1. Business‑first generation
Always ground AI generation in structured business inputs (name, logo, tagline, detailed description, vertical, and special fields) rather than a single text prompt.[file:32] Avoid content that clearly mismatches the described business.

## 2. WordPress FSE excellence
Generated themes must:
- Use modern Gutenberg block patterns, templates, and theme.json.
- Respect spacing, layout, and typography best practices.
- Avoid custom hacks that break future FSE compatibility.[file:32]

## 3. Vertical‑specific intelligence
For e‑commerce:
- Auto‑configure WooCommerce for a ready‑to‑run storefront.
- Generate sensible starter products, categories, and shop templates tied to the business description.[file:32]

For restaurants and cafés:
- Provide structured menu inputs (sections, items, prices, descriptions).
- Allow uploading menus from Word, text, or PDF and convert them into a navigable “Menu” page and nav item.[file:32]

## 4. Brand‑aligned design systems
- Derive the primary color palette from the uploaded logo and offer 5–7 curated variants.
- Offer 5–7 Google Font pairings optimized for legibility and brand expression.[file:32]
- Ensure all generated layouts are responsive and accessible by default.

## 5. Multilingual and RTL support
- The SaaS UI and generated themes must support English, Spanish, French, Italian, and Arabic with proper RTL behavior where applicable.[file:32]
- Content and layout choices should be robust across these languages.

## 6. Clear user choice and feedback
- Always present three homepage concepts using the user’s content, in a simple UI (e.g., three tabs or cards) so they can compare designs side by side.[file:32]
- After selection, show a clear generation progress indicator and a final screen with two downloadable theme options.

## 7. Extensibility and clean code
- Output themes that theme developers can understand and extend without fighting generated code.
- Prefer configuration and composition (patterns, template parts, theme.json) over deeply nested custom blocks.
