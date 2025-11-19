# Stage 02 – PressPilot MVP

Goal: Use OS to ship a simple end-to-end PressPilot MVP.

## SaaS Vision
PressPilot generates complete WordPress block themes and site kits based on rich business inputs.

### User Inputs
- Business Name
- Business Logo
- Business Tagline
- Business Description (full paragraph to avoid “Apple Pie problem”)
- Optional niche/vibe tags
- Optional Logo URL
- Optional Reference Website
- Mode toggles:
  - E-Commerce Mode → auto-generate WooCommerce-ready kit
  - Restaurant/Café Mode → menu input + pricing + optional PDF import → generate “Menu” page + nav item

### Design Controls
- Choose from 5–7 color palettes
- Choose from 5–7 Google Font styles
- All fonts must be Google Fonts
- All patterns, spacing, and layouts must follow FSE best practices

### Output Flow
- Generate 3 website variations, shown as tabs or previews, all using the user’s content and pulling images from Unsplash (free) or DALL·E (paid tiers).
- When the user selects one variation:
  - Show a generation animation.
  - Produce two downloadable outputs:
    1. WordPress Block Theme (.zip) packaged from the selected variation.
    2. Static Site bundle (.zip) containing HTML/CSS/JS for the same variation.
- The final SaaS UI must display two distinct buttons: “Download WordPress Theme (.zip)” and “Download Static Site (HTML/CSS/JS)”.

### SaaS Logic
- Users may run the preview flow without an account.
- Require an account before downloading final kits.
- Multilingual support: EN, ES, FR, IT, AR (RTL included).
- Dashboard UI must support the same languages.

### Backend Planning
- Target Netlify or Coolify (start on free tier, scale up later).
- No deployment implementation in Stage 02—only architecture planning.

## Stage 02 Checklist
- [ ] Define full input schema for the SaaS form
- [ ] Define 3-theme generation workflow
- [ ] Define E-commerce mode rules
- [ ] Define Restaurant/Café mode rules
- [ ] Define color/fonts selection system
- [ ] Define multilingual/RTL requirements
- [ ] Define export structure for WordPress kits
- [ ] Define static HTML/CSS/JS export structure and location (e.g., ./build/static/{slug})
- [ ] Define `/mvp-demo` page flow
- [ ] Define preview UI for 3 variations
- [ ] Define UI behavior for the two final download buttons (WP theme + static site)

## SaaS Input Schema

### Form Sections & Field Notes

1. **brand** – Captures identity basics:
   - `business_name` (required) for hero/title usage.
   - `business_tagline` (optional) for hero and metadata.
   - `business_category` (enum; see mapping below) drives every internal mode.
   - `region_or_country` (optional) to influence tone, currency hints, compliance.

2. **language** – Sets localization strategy:
   - `primary_language` (required, SupportedLanguageCode).
   - `secondary_languages` (optional array) for future multilingual content.
   - `rtl_required` boolean stored explicitly (true whenever Arabic primary).

3. **narrative** – Rich descriptive inputs:
   - `description_long` ≥200 chars for “Apple Pie” guardrail.
   - Optional `audience_notes`, `niche_tags`, and `goals`.

4. **visualAssets** – Brand files and references:
   - `has_logo` flag, plus optional `logo_file_url`, `logo_external_url`.
   - `reference_site_url` for inspiration.
   - `image_source_preference` enum (`stock-only`, `ai-only`, `mixed`) with optional `image_keywords`.

5. **visualControls** – Tokens and CTAs:
   - `palette_id` (1 of curated palettes) and `font_pair_id` (Google Fonts pairing).
   - `layout_density` (`cozy`, `balanced`, `spacious`) and `corner_style` (`rounded`, `mixed`, `sharp`).
   - Optional `primary_ctas` array with labels + optional URLs.

6. **modes** – Derived behavior:
   - Exposes `business_category` for convenience (mirrors `brand.business_category`).
   - Derives `restaurant.enabled` and `ecommerce.enabled` automatically.
   - Restaurant block holds service flags, menu data, PDF URL, reservation/order links.
   - Ecommerce block holds store type, currency, product/category seeds, and policy snippets.

7. **system** – Internal metadata for experiments, plan tier, AI/image tier, and optional external request IDs.

### Category → Mode Mapping (Explicit Rules)

- If `business_category === "restaurant_cafe"`:  
  - `modes.restaurant.enabled = true`, `modes.ecommerce.enabled = false`.  
  - Restaurant-specific fields become required when available (menu sections, PDF, reservation/order links).  
  - Navigation must auto-include a “Menu” item when `menu_sections` exist.

- If `business_category === "ecommerce"`:  
  - `modes.ecommerce.enabled = true`, `modes.restaurant.enabled = false`.  
  - Ecommerce fields surface (categories, products, policies, currency/store type).  
  - Navigation must auto-include a “Shop” item.

- For all other categories (`service`, `fitness`, `corporate`, `local_store`, `portfolio`, `other`):  
  - Both `modes.restaurant.enabled` and `modes.ecommerce.enabled` default to false.  
  - Restaurant/ecommerce-specific UI stays collapsed unless user manually provides data for reference purposes.

> Modes are **never chosen via manual toggles**—the single “Business Category” dropdown controls everything.

### Submission Payload Interface
```ts
type SupportedLanguageCode = "en" | "es" | "fr" | "it" | "ar";

type BusinessCategory =
  | "restaurant_cafe"
  | "ecommerce"
  | "service"
  | "fitness"
  | "corporate"
  | "local_store"
  | "portfolio"
  | "other";

interface CTAItem {
  label: string;
  url?: string;
}

interface RestaurantMenuSection {
  name: string;
  description?: string;
  items: {
    name: string;
    description?: string;
    price?: string;          // Store as string until pricing model decided
    currency?: string;       // ISO 4217
    dietary_tags?: string[];
  }[];
}

interface EcommerceProduct {
  name: string;
  description?: string;
  price?: number;
  image_prompt?: string;
}

interface PressPilotSaaSInput {
  brand: {
    business_name: string;
    business_tagline?: string;
    business_category: BusinessCategory;
    region_or_country?: string;
  };
  language: {
    primary_language: SupportedLanguageCode;
    secondary_languages?: SupportedLanguageCode[];
    rtl_required: boolean;
  };
  narrative: {
    description_long: string;
    audience_notes?: string;
    niche_tags?: string[];
    goals?: string;
  };
  visualAssets: {
    has_logo: boolean;
    logo_file_url?: string;
    logo_external_url?: string;
    reference_site_url?: string;
    image_source_preference: "stock-only" | "ai-only" | "mixed";
    image_keywords?: string[];
  };
  visualControls: {
    palette_id: string;
    font_pair_id: string;
    layout_density: "cozy" | "balanced" | "spacious";
    corner_style: "rounded" | "mixed" | "sharp";
    primary_ctas?: CTAItem[];
  };
  modes: {
    business_category: BusinessCategory; // Mirrors brand.business_category
    restaurant: {
      enabled: boolean;
      supports_dine_in?: boolean;
      supports_takeout?: boolean;
      supports_delivery?: boolean;
      menu_sections?: RestaurantMenuSection[];
      menu_pdf_url?: string;
      reservation_link?: string;
      order_online_link?: string;
    } | null;
    ecommerce: {
      enabled: boolean;
      store_type?: "physical" | "digital" | "both";
      currency?: string;
      product_categories?: string[];
      sample_products?: EcommerceProduct[];
      policies?: {
        shipping?: string;
        returns?: string;
        privacy?: string;
      };
    } | null;
  };
  system?: {
    plan_tier?: "free" | "pro" | "enterprise";
    ai_model_tier?: "default" | "advanced";
    image_tier?: "stock" | "dalle" | "mixed";
    external_ref_id?: string;
  };
}
```

### Variation Manifest Types (for 3-option preview)

```ts
type VariationId = "variation_a" | "variation_b" | "variation_c";

interface PressPilotVariationTokens {
  palette_id: string;
  font_pair_id: string;
  layout_density: "cozy" | "balanced" | "spacious";
  corner_style: "rounded" | "mixed" | "sharp";
}

interface PressPilotVariationNavMeta {
  has_menu_nav_item: boolean;
  has_shop_nav_item: boolean;
}

interface PressPilotVariationPreviewMeta {
  id: VariationId;
  label: string;
  description: string;
  thumbnail_url?: string;
}

interface PressPilotVariationManifest {
  id: VariationId;
  tokens: PressPilotVariationTokens;
  nav: PressPilotVariationNavMeta;
  preview: PressPilotVariationPreviewMeta;
  pattern_set_id: string;
}

interface PressPilotVariationSet {
  context: PressPilotNormalizedContext;
  variations: PressPilotVariationManifest[];
}
```

### MVP Demo Page Flow (`/mvp-demo`)

- `/mvp-demo` is a guided playground that mirrors the real SaaS without shipping accounts yet.
- Top hero: one clear sentence like “Turn your business info into a WordPress kit and static site in one shot.”
- Layout = two columns (stacked on mobile):
  - **Left: PressPilotSaaSInput v2 form**, grouped by the same sections defined earlier:
    - Brand Basics (business_name, business_tagline, region_or_country).
    - Language (primary_language + optional secondary_languages, stored as BCP-47 codes).
    - Narrative (description_long, audience_notes, niche_tags, goals) to avoid the Apple-Pie problem.
    - Visual Assets (logo upload/URL, reference_site_url, image_source_preference, image_keywords).
    - Visual Controls (palette_id, font_pair_id, layout_density, corner_style, primary_ctas).
    - Business Category dropdown (single source of truth; no manual Restaurant/E-commerce toggles).
  - **Right: 3-option preview area** powered by `PressPilotVariationSet`:
    - Variations A/B/C displayed as tabs or cards.
    - Each card shows label, one-line description, thumbnail/placeholder, and a note about palette/fonts/layout.
    - Restaurant or e-commerce behavior is surfaced via badges like “Includes Menu nav” or “Includes Shop nav”, derived from the business_category → modes mapping (not user toggles).
- Primary CTA states:
  - Default: users can preview without logging in (“Preview only” mode).
  - When they click **“Generate Theme & Static Site”**:
    - If not logged in → show lightweight “Create free account to download” prompt, then return to preview state.
    - If logged in → run the export workflow, show a progress bar/animation, then reveal download buttons.
- Final Downloads panel (same page, below preview):
  - Recap: business_name, slug, primary language, selected variation label.
  - Two buttons:
    1. `Download WordPress Theme (.zip)` → points at the theme zip for that slug.
    2. `Download Static Site (HTML/CSS/JS)` → points at the static site zip for that slug.
  - Optional “View in dashboard” link placeholder for later stages.
- Everything in this flow reads/writes `PressPilotSaaSInput`, `PressPilotNormalizedContext`, and `PressPilotVariationSet` artifacts—no legacy fields or toggles.

### Generation & Storage Notes

- Stage 02 writes artifacts to the local filesystem for development:
  - WordPress theme folder: `./build/themes/{slug}` plus the kit zip: `./build/kits/{slug}.zip`.
  - Static HTML/CSS/JS folder: `./build/static/{slug}` plus the static zip: `./build/static/{slug}.zip`.
- `/mvp-demo` only needs:
  - Download URLs/paths for the two zips.
  - A lightweight JSON record tying slug, language, and the selected `PressPilotVariationManifest` id together.
- Later SaaS stages:
  - Both zips will be uploaded to object storage (Cloudflare R2 / S3 style).
  - The app stores metadata + signed URLs, not the raw files.
- Stage 02 explicitly does **not** implement uploads or full dashboard wiring; it just locks in the contract so later agents can add storage + account logic safely.

This payload feeds `apply_business_inputs`, which normalizes the data for downstream workflows (brand kit, variation generation, WooCommerce population, restaurant menu building, and dual export bundling).
