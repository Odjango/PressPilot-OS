# PressPilot Theme Generator – Stage Snapshot (2025-12-03)

## High-Level Decision

- No permanent "starter theme" in WordPress.
- The AI generator always produces a **complete block theme ZIP** from scratch.
- We define a strict **contract** for the generated theme; this contract is the "source of truth."

## Output Structure

The generator must create a theme folder:

wp-content/themes/{theme-slug}/
  style.css
  theme.json
  functions.php
  templates/
    index.html
    front-page.html
    page.html
    single.html
    archive.html
    404.html
  parts/
    header.html
    footer.html

## style.css

- Used only to register the theme, no CSS required.
- Must include:
  - Theme Name, Theme URI, Author, Description, Version
  - Requires at least: 6.4
  - Tested up to: 6.7
  - Requires PHP: 7.4
  - Tags: full-site-editing, block-theme

## theme.json

- Must use:
  - "$schema": "https://schemas.wp.org/trunk/theme.json"
  - "version": 3
- Contains minimal-safe settings for:
  - layout.contentSize / wideSize
  - spacing.units
  - typography.fontSizes
  - color.palette (base, accent, background)
- templateParts must include:
  - header (area: header)
  - footer (area: footer)
- templateParts names must match files in /parts/.

## Templates

- All main templates must include header and footer template parts.
- For templates that display a single page/post:
  - Structure:
    - <!-- wp:template-part {"slug":"header"} /-->
    - <!-- wp:post-content /-->
    - <!-- wp:template-part {"slug":"footer"} /-->
- index/front-page/archive/single use simple Gutenberg block markup
  (query + post-template for index/archive, constrained groups for front-page/single).

## Header and Footer

- header.html:
  - Site logo + site title + navigation block.
  - Default navigation uses:
    - <!-- wp:navigation {"overlayMenu":"never"} -->
      <!-- wp:page-list /-->
    - <!-- /wp:navigation -->
- footer.html:
  - Simple group with a paragraph including:
    - © [site-title] — Powered by WordPress.

## Activation Logic (functions.php)

On after_switch_theme:

- (Optional, controlled via a flag) Trash all existing:
  - page posts
  - wp_navigation posts
- Create a fixed list of new pages based on config (Home, About, Contact, etc.).
- Set front page to the new "Home" page.
- (Optional) Create a wp_navigation post with navigation links to the new pages.
- Update site title using update_option('blogname', '{SITE_TITLE_FROM_CONFIG}').

## Config Layer (Upstream)

The generator expects an input config (e.g. from PressPilot / Antigravity) that includes:

- theme_name, theme_slug
- site_title
- pages[] = list of {slug, title, content}
- destructive_mode (true/false)
- optional brand colors (base, accent, background) to map into theme.json.

This document represents the baseline stage to roll back to if future iterations break.
