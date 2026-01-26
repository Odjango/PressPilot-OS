<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Ok, I'll paste my app vision here and I need you yo give me a document that gives the AI agent all the needed technicals and detailed steps that doesn't leave a chance for the AI agent to improvise or invent techniques that doesn't align with "AND MUST OBEY" the FSE Gutenberg and ACF rules to build a successful app / SaaS that should be solid and not collapse under users pressure and designed/structured for a scale operations === here is my app vision ===>  A web App that lets user input his business information and choose between some options and features that through using an AI engine from OpenAI that supports content “text \& Images” generation related to the business description fields “not Only 1 field, to avoid for example a business name is Apple Pie” it is a computer store online business for example “ to prevent mistakes of generate content based on name only”.

User input

- [ ] Business Name
- [ ] Business Logo
- [ ] Business Tagline
- [ ] Business Description

All these fields guide the AI engine in generating relevant content and images, “Unsplash \& Dall-E” for different tiers.
App should have and support GOOGLE fonts

Generated WP themes' “websites “ should follow the best practices of FSE Gutenberg Block modern theme style, applying the style, spaces, and layout.

The free and open source libraries of Themes, Templates and Patterns and Block Sections are HUGE that giving all possibilities and flexibility to generate a lot of different Design Styles and Layouts, it just needs the right link to file or any other suitable technology.

In the input UI, there must be 2 main options that need specific attention

- 1st one is E-Commerce, when the user chooses this option in the input fields form “need to see design “, the generated 2 sites should be integrated with WooCommerce population automatically, “Ready to run when activated”.
- 2nd one is for the Restaurants \& Cafe category, the user must have input fields specialized for menu information and prices, and description input fields to be auto-formatted in text accordingly. And have the option to upload the menu in digital format, like “Word, text, or PDF files“
 So this should automatically populate a nav/menu item which is “Menu”; this is a very important option.

The Uploaded logo should be a source of the Brand Colors that must be used as a website’s main brand colors and we could add more related color pallets to give user more color variety.
The user also should have the option to choose from 5-7 color pallets
Also choose from 5-7 font styles “Google Fonts” and then hit enter or the generate button

User needs to see 3 website’s Homepage “preview only” options, It could be 3 tabs in the same frame/window”  with his content to choose between, then when the user chooses a design, a generation animation should happen.

The UI of the SaaS Landing page and also the generated website ”theme” should have the language options which include “English, Spanish, French, Italian And Arabic RTL” support

And then the user should see the window with 2 options of the generated site, “the user can download both if he wants.”

During generation, users see a progress bar or other loading animation

Below is a **complete technical specification document** you can hand to an AI coding agent verbatim. It is structured to eliminate improvisation and enforce FSE/Gutenberg/ACF rules at every layer.

***

# Theme Factory SaaS — Technical Specification Document

## 0. Purpose and constraints

### 0.1 Product goal

Build a web application that collects business information from a user, uses OpenAI APIs for content and image generation, extracts brand colors from an uploaded logo, and outputs **two downloadable WordPress block themes** (FSE-native, no plugin lock-in) ready to activate on any self-hosted WordPress site.[^1][^2]

### 0.2 Non-negotiable rules

1. **All generated themes MUST be pure FSE block themes.** No classic PHP template files. Templates live in `/templates/*.html`, parts in `/parts/*.html`, patterns in `/patterns/*.php` or `/patterns/*.html`.[^3][^4]
2. **All styling MUST flow through `theme.json`.** No inline hex colors, no hardcoded font sizes. Every color, spacing, and typography value references a preset defined in `theme.json`.[^2][^1]
3. **Patterns MUST use semantic blocks and tokens.** For example, `<!-- wp:button {"backgroundColor":"primary"} -->` not `style="background:#ff0000"`.[^5][^2]
4. **WooCommerce integration MUST use official WooCommerce blocks**, not shortcodes or legacy widgets.[^1]
5. **ACF (if used) MUST register fields via PHP or JSON**, never manually in wp-admin. ACF blocks MUST follow the `acf_register_block_type` API and render via block.json + render callback or render template.[^1]
6. **RTL support MUST be handled via `theme.json` settings and logical CSS properties** (margin-inline-start, etc.), not separate RTL stylesheets.
7. **Google Fonts MUST be enqueued via `theme.json` `fontFamilies` with `fontFace` declarations**, not via `wp_enqueue_style` or external `<link>` tags, to comply with GDPR and performance best practices.[^4]
8. **No theme may require a proprietary plugin to function.** Themes must work with vanilla WordPress + Gutenberg (and WooCommerce for e-commerce tier).

***

## 1. System architecture

### 1.1 High-level components

| Component | Technology | Responsibility |
| :-- | :-- | :-- |
| Frontend (SaaS UI) | React / Next.js | User input wizard, preview renderer, download delivery |
| Backend API | Node.js (Express or Fastify) or Python (FastAPI) | Orchestrates generation pipeline, calls OpenAI, stores projects |
| Theme Generator Core | Node.js library | Assembles theme folder from base + tokens + patterns, zips output |
| Logo Palette Extractor | Node.js (node-vibrant or similar) | Extracts dominant colors from uploaded logo image [^6][^7] |
| Content Generator | OpenAI API (GPT-4o / DALL·E 3) | Generates text (headlines, descriptions) and images |
| Image Sourcing | Unsplash API (free tier) / DALL·E (paid tier) | Provides section images based on business context |
| Database | PostgreSQL or MySQL | Stores user projects, generation configs, download links |
| File Storage | S3-compatible (AWS S3, R2, MinIO) | Stores uploaded logos, generated images, theme zips |
| Queue / Workers | Redis + BullMQ or Celery | Handles async theme generation jobs |

### 1.2 Request flow

```
User submits form
       │
       ▼
Backend validates input, stores project
       │
       ▼
Queue job: "generate_theme" with project_id
       │
       ▼
Worker:
  1. Extract palette from logo
  2. Call OpenAI for text content (headlines, taglines, section copy)
  3. Fetch/generate images (Unsplash or DALL·E based on tier)
  4. For each of 3 layout variants:
       a. Select base theme + pattern set
       b. Inject tokens into theme.json
       c. Assemble templates from patterns
       d. Write files to temp folder
       e. Validate (schema + optional WP render)
       f. Zip
  5. Store 3 zips, mark job complete
       │
       ▼
Frontend polls job status, shows progress bar
       │
       ▼
User sees 3 previews (tab UI), selects one
       │
       ▼
Backend marks selected variant, offers download of 2 final zips (variant A and variant B style variations of chosen layout)
```


***

## 2. User input schema

### 2.1 Core fields (all site types)

| Field | Type | Required | Notes |
| :-- | :-- | :-- | :-- |
| `business_name` | string | yes | Used in site title, footer, meta |
| `business_tagline` | string | yes | Used in hero subtitle, meta description seed |
| `business_description` | text (500 chars max) | yes | Primary context for OpenAI content generation |
| `business_logo` | file (PNG, JPG, SVG, max 5MB) | yes | Source for palette extraction |
| `site_type` | enum | yes | `general`, `ecommerce`, `restaurant` |
| `language` | enum | yes | `en`, `es`, `fr`, `it`, `ar` |
| `color_palette_choice` | enum (1–7) | yes | User picks from 7 generated palettes |
| `font_style_choice` | enum (1–7) | yes | User picks from 7 curated Google Font pairings |

### 2.2 E-commerce fields (when `site_type = ecommerce`)

| Field | Type | Required | Notes |
| :-- | :-- | :-- | :-- |
| `product_categories` | array of strings | yes | e.g., `["Electronics", "Accessories"]` |
| `sample_products` | array of objects | optional | `[{name, price, description, image_url}]` for demo population |
| `currency` | enum | yes | `USD`, `EUR`, `GBP`, etc. |

### 2.3 Restaurant fields (when `site_type = restaurant`)

| Field | Type | Required | Notes |
| :-- | :-- | :-- | :-- |
| `menu_items` | array of objects | yes | `[{category, name, description, price}]` |
| `menu_file` | file (PDF, DOCX, TXT) | optional | Parsed server-side to extract menu items |
| `cuisine_type` | string | yes | e.g., `Italian`, `Mexican`, `Café` |
| `operating_hours` | object | optional | `{mon: "9am-9pm", ...}` |


***

## 3. Logo palette extraction

### 3.1 Process

1. Receive uploaded logo, store in temp storage.
2. Use `node-vibrant` (or equivalent) to extract 6–8 dominant colors with population percentages.[^6][^7][^8]
3. Classify colors:
    - **Primary**: most saturated color with highest population.
    - **Secondary**: second most distinct saturated color.
    - **Accent**: third color or a complementary/analogous color generated algorithmically.
    - **Surface**: lightest extracted color (or synthesize by lightening primary to 95% luminance).
    - **Surface-alt**: second lightest or slight tint of surface.
    - **Text**: darkest extracted color (or synthesize by darkening to 10% luminance).
    - **Text-muted**: mid-gray derived from text color at 60% saturation.
4. Generate **7 palette variations** by:
    - Variation 1: original extracted mapping.
    - Variations 2–4: shift hue of accent by ±30°, ±60°.
    - Variations 5–7: swap primary/secondary, invert light/dark for dark-mode style.
5. Return all 7 palettes to frontend for user selection.

### 3.2 Output format

```json
{
  "palettes": [
    {
      "id": 1,
      "primary": "#1A5F7A",
      "secondary": "#159895",
      "accent": "#57C5B6",
      "surface": "#F9F9F9",
      "surface_alt": "#EDEDED",
      "text": "#1C1C1C",
      "text_muted": "#6B6B6B"
    },
    // ... 6 more
  ]
}
```


***

## 4. Font system

### 4.1 Curated font pairings

Define exactly **7 pairings** (heading + body):


| ID | Heading Font | Body Font | Vibe |
| :-- | :-- | :-- | :-- |
| 1 | Inter | Inter | Clean, neutral |
| 2 | Playfair Display | Source Sans 3 | Elegant, editorial |
| 3 | Poppins | Poppins | Friendly, modern |
| 4 | Montserrat | Open Sans | Professional |
| 5 | Merriweather | Merriweather Sans | Traditional, readable |
| 6 | Space Grotesk | Space Grotesk | Techy, geometric |
| 7 | Lora | Nunito | Warm, approachable |

### 4.2 theme.json font registration

Fonts MUST be registered via `settings.typography.fontFamilies` with local `fontFace` declarations pointing to self-hosted font files bundled in the theme under `/assets/fonts/`.[^4]

```json
{
  "settings": {
    "typography": {
      "fontFamilies": [
        {
          "fontFamily": "Inter, sans-serif",
          "name": "Inter",
          "slug": "body",
          "fontFace": [
            {
              "fontFamily": "Inter",
              "fontWeight": "400",
              "fontStyle": "normal",
              "src": ["file:./assets/fonts/inter-regular.woff2"]
            },
            {
              "fontFamily": "Inter",
              "fontWeight": "700",
              "fontStyle": "normal",
              "src": ["file:./assets/fonts/inter-bold.woff2"]
            }
          ]
        },
        {
          "fontFamily": "Inter, sans-serif",
          "name": "Heading",
          "slug": "heading",
          "fontFace": [
            // same or different font files
          ]
        }
      ]
    }
  }
}
```

**Do NOT use `<link>` to Google Fonts CDN.** Download font files and bundle them.[^4]

***

## 5. theme.json token structure

Every generated theme MUST use this exact token schema in `theme.json`:

```json
{
  "$schema": "https://schemas.wp.org/trunk/theme.json",
  "version": 3,
  "settings": {
    "color": {
      "palette": [
        { "slug": "primary", "color": "#INJECT", "name": "Primary" },
        { "slug": "secondary", "color": "#INJECT", "name": "Secondary" },
        { "slug": "accent", "color": "#INJECT", "name": "Accent" },
        { "slug": "surface", "color": "#INJECT", "name": "Surface" },
        { "slug": "surface-alt", "color": "#INJECT", "name": "Surface Alt" },
        { "slug": "text", "color": "#INJECT", "name": "Text" },
        { "slug": "text-muted", "color": "#INJECT", "name": "Text Muted" }
      ]
    },
    "typography": {
      "fontFamilies": [ /* as above */ ],
      "fontSizes": [
        { "slug": "small", "size": "0.875rem", "name": "Small" },
        { "slug": "medium", "size": "1rem", "name": "Medium" },
        { "slug": "large", "size": "1.25rem", "name": "Large" },
        { "slug": "x-large", "size": "1.5rem", "name": "X-Large" },
        { "slug": "xx-large", "size": "2.25rem", "name": "XX-Large" },
        { "slug": "huge", "size": "3rem", "name": "Huge" }
      ]
    },
    "spacing": {
      "spacingSizes": [
        { "slug": "xs", "size": "0.5rem", "name": "XS" },
        { "slug": "sm", "size": "1rem", "name": "SM" },
        { "slug": "md", "size": "1.5rem", "name": "MD" },
        { "slug": "lg", "size": "2.5rem", "name": "LG" },
        { "slug": "xl", "size": "4rem", "name": "XL" }
      ]
    },
    "layout": {
      "contentSize": "800px",
      "wideSize": "1200px"
    },
    "custom": {
      "borderRadius": {
        "small": "4px",
        "medium": "8px",
        "large": "16px",
        "full": "9999px"
      }
    }
  },
  "styles": {
    "color": {
      "background": "var(--wp--preset--color--surface)",
      "text": "var(--wp--preset--color--text)"
    },
    "typography": {
      "fontFamily": "var(--wp--preset--font-family--body)",
      "fontSize": "var(--wp--preset--font-size--medium)",
      "lineHeight": "1.6"
    },
    "elements": {
      "heading": {
        "typography": {
          "fontFamily": "var(--wp--preset--font-family--heading)",
          "fontWeight": "700"
        },
        "color": {
          "text": "var(--wp--preset--color--text)"
        }
      },
      "link": {
        "color": {
          "text": "var(--wp--preset--color--primary)"
        }
      },
      "button": {
        "color": {
          "background": "var(--wp--preset--color--primary)",
          "text": "var(--wp--preset--color--surface)"
        },
        "border": {
          "radius": "var(--wp--custom--border-radius--medium)"
        }
      }
    }
  }
}
```

**Replace `#INJECT` with actual hex values from chosen palette at generation time.**

***

## 6. Template and pattern architecture

### 6.1 Required templates

| Template file | Purpose |
| :-- | :-- |
| `index.html` | Universal fallback |
| `front-page.html` | Homepage (assembles hero + sections) |
| `page.html` | Generic page |
| `single.html` | Single post |
| `archive.html` | Blog archive |
| `404.html` | Not found |
| `search.html` | Search results |

For **e-commerce** (`site_type = ecommerce`), also include:

- `single-product.html`
- `archive-product.html`
- `page-cart.html`
- `page-checkout.html`

For **restaurant** (`site_type = restaurant`), also include:

- `page-menu.html` (displays menu pattern)


### 6.2 Required template parts

| Part file | Purpose |
| :-- | :-- |
| `header.html` | Site header with logo, nav, language switcher |
| `footer.html` | Site footer with links, copyright |
| `sidebar.html` | Optional sidebar for blog |

### 6.3 Pattern library structure

Organize patterns by site type and section:

```
/patterns/
  /core/
    hero-centered.php
    hero-split.php
    hero-video.php
    features-grid.php
    features-alternating.php
    testimonials-carousel.php
    testimonials-grid.php
    cta-simple.php
    cta-split.php
    faq-accordion.php
    contact-form.php
    team-grid.php
  /ecommerce/
    products-featured.php
    products-grid.php
    categories-grid.php
    cart-summary.php
  /restaurant/
    menu-list.php
    menu-grid.php
    hours-location.php
    reservation-cta.php
```


### 6.4 Pattern file format

Each pattern MUST be a PHP file using the WordPress pattern registration format:

```php
<?php
/**
 * Title: Hero Centered
 * Slug: theme-factory/hero-centered
 * Categories: hero
 * Block Types: core/template-part/header
 */
?>
<!-- wp:cover {"overlayColor":"surface-alt","minHeight":80,"minHeightUnit":"vh","align":"full"} -->
<div class="wp-block-cover alignfull" style="min-height:80vh">
  <span aria-hidden="true" class="wp-block-cover__background has-surface-alt-background-color has-background-dim-100 has-background-dim"></span>
  <div class="wp-block-cover__inner-container">
    <!-- wp:heading {"textAlign":"center","level":1,"fontSize":"huge"} -->
    <h1 class="wp-block-heading has-text-align-center has-huge-font-size">{{headline}}</h1>
    <!-- /wp:heading -->
    <!-- wp:paragraph {"align":"center","fontSize":"large","textColor":"text-muted"} -->
    <p class="has-text-align-center has-text-muted-color has-large-font-size">{{subheadline}}</p>
    <!-- /wp:paragraph -->
    <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
    <div class="wp-block-buttons">
      <!-- wp:button {"backgroundColor":"primary","textColor":"surface"} -->
      <div class="wp-block-button"><a class="wp-block-button__link has-surface-color has-primary-background-color has-text-color has-background">{{cta_text}}</a></div>
      <!-- /wp:button -->
    </div>
    <!-- /wp:buttons -->
  </div>
</div>
<!-- /wp:cover -->
```

**Placeholders** like `{{headline}}` are replaced by the generator with OpenAI-generated content.

**CRITICAL**: Every color, font size, and spacing MUST reference presets (`"backgroundColor":"primary"`, `"fontSize":"large"`), NEVER raw values.

***

## 7. Content generation (OpenAI integration)

### 7.1 System prompt for text generation

```
You are a professional website copywriter. Generate concise, engaging website copy for a business.

Business context:
- Name: {{business_name}}
- Tagline: {{business_tagline}}
- Description: {{business_description}}
- Industry: {{site_type}}
- Language: {{language}}

Generate the following content in {{language}}:
1. Hero headline (max 8 words)
2. Hero subheadline (max 20 words)
3. Primary CTA button text (max 4 words)
4. About section headline (max 6 words)
5. About section paragraph (max 50 words)
6. Services/Features section headline (max 6 words)
7. Three feature titles (max 5 words each)
8. Three feature descriptions (max 25 words each)
9. Testimonial quote (max 30 words)
10. Testimonial attribution (name and title)
11. CTA section headline (max 8 words)
12. CTA section paragraph (max 25 words)
13. Footer tagline (max 10 words)

Return as JSON with keys: hero_headline, hero_subheadline, cta_primary, about_headline, about_paragraph, features_headline, feature_1_title, feature_1_desc, feature_2_title, feature_2_desc, feature_3_title, feature_3_desc, testimonial_quote, testimonial_attribution, cta_headline, cta_paragraph, footer_tagline
```


### 7.2 Image generation / sourcing

- **Free tier**: Use Unsplash API with search query derived from `business_description` and `site_type`. Cache results.
- **Paid tier**: Use DALL·E 3 with prompt: `"Professional photograph for {{site_type}} business website, showing {{scene_description}}, modern, high quality, no text"`

Store generated/fetched images in `/assets/images/` within the theme and reference via `file:./assets/images/hero.jpg` in patterns.

***

## 8. E-commerce integration (WooCommerce)

### 8.1 Theme compatibility

The generated theme MUST declare WooCommerce support in `functions.php`:

```php
add_action('after_setup_theme', function() {
    add_theme_support('woocommerce');
    add_theme_support('wc-product-gallery-zoom');
    add_theme_support('wc-product-gallery-lightbox');
    add_theme_support('wc-product-gallery-slider');
});
```


### 8.2 WooCommerce block patterns

Use official WooCommerce blocks in patterns:

- `woocommerce/product-collection` for product grids
- `woocommerce/featured-product` for featured products
- `woocommerce/product-categories` for category display
- `woocommerce/cart` and `woocommerce/checkout` for cart/checkout pages

Example pattern:

```php
<!-- wp:woocommerce/product-collection {"query":{"perPage":4,"pages":1,"offset":0,"postType":"product","featured":true}} -->
<div class="wp-block-woocommerce-product-collection">
  <!-- wp:woocommerce/product-template -->
    <!-- wp:woocommerce/product-image /-->
    <!-- wp:post-title {"isLink":true,"fontSize":"medium"} /-->
    <!-- wp:woocommerce/product-price /-->
    <!-- wp:woocommerce/product-button /-->
  <!-- /wp:woocommerce/product-template -->
</div>
<!-- /wp:woocommerce/product-collection -->
```


### 8.3 Demo product population

Generate a `demo-content.xml` (WXR format) or a setup script that creates:

- 3 product categories (from user input)
- 6 sample products with:
    - Title (from `sample_products` or AI-generated)
    - Price (from input or default)
    - Description (AI-generated)
    - Featured image (from Unsplash/DALL·E)

Include in theme under `/demo-content/` with instructions or auto-import via `after_switch_theme` hook (optional).

***

## 9. Restaurant menu integration

### 9.1 Menu data handling

If user provides `menu_items` array, use directly. If user uploads `menu_file`:

1. Parse file server-side:
    - PDF: Use `pdf-parse` or similar
    - DOCX: Use `mammoth` or similar
    - TXT: Direct read
2. Send extracted text to OpenAI with prompt:
```
Extract menu items from the following text. Return as JSON array:
[{"category": "string", "name": "string", "description": "string", "price": "string"}]

Text:
{{extracted_text}}
```


### 9.2 Menu pattern

Create `patterns/restaurant/menu-list.php`:

```php
<?php
/**
 * Title: Restaurant Menu
 * Slug: theme-factory/menu-list
 * Categories: restaurant
 */
?>
<!-- wp:group {"align":"wide","style":{"spacing":{"padding":{"top":"var:preset|spacing|xl","bottom":"var:preset|spacing|xl"}}}} -->
<div class="wp-block-group alignwide">
  <!-- wp:heading {"textAlign":"center"} -->
  <h2 class="wp-block-heading has-text-align-center">{{menu_headline}}</h2>
  <!-- /wp:heading -->
  
  {{#each menu_categories}}
  <!-- wp:heading {"level":3,"fontSize":"x-large"} -->
  <h3 class="wp-block-heading has-x-large-font-size">{{category}}</h3>
  <!-- /wp:heading -->
  
  {{#each items}}
  <!-- wp:group {"layout":{"type":"flex","justifyContent":"space-between"}} -->
  <div class="wp-block-group">
    <!-- wp:group -->
    <div class="wp-block-group">
      <!-- wp:heading {"level":4,"fontSize":"large"} -->
      <h4 class="wp-block-heading has-large-font-size">{{name}}</h4>
      <!-- /wp:heading -->
      <!-- wp:paragraph {"textColor":"text-muted","fontSize":"small"} -->
      <p class="has-text-muted-color has-small-font-size">{{description}}</p>
      <!-- /wp:paragraph -->
    </div>
    <!-- /wp:group -->
    <!-- wp:paragraph {"fontSize":"large"} -->
    <p class="has-large-font-size">{{price}}</p>
    <!-- /wp:paragraph -->
  </div>
  <!-- /wp:group -->
  {{/each}}
  {{/each}}
</div>
<!-- /wp:group -->
```


### 9.3 Auto-create Menu page

The generator MUST:

1. Create `templates/page-menu.html` using the menu pattern
2. Include navigation item for "Menu" in header pattern
3. Populate menu content from parsed/provided data

***

## 10. RTL and i18n support

### 10.1 Language handling

- All UI text in the SaaS app must be translatable (use i18n library like `react-intl` or `next-intl`)
- Generated themes must include proper text domain and be translation-ready


### 10.2 RTL support (Arabic)

When `language = ar`:

1. Set `theme.json`:
```json
{
  "settings": {
    "custom": {
      "direction": "rtl"
    }
  }
}
```

2. Add to `functions.php`:
```php
add_action('wp_enqueue_scripts', function() {
    if (is_rtl()) {
        wp_enqueue_style('theme-rtl', get_template_directory_uri() . '/assets/css/rtl.css');
    }
});
```

3. Use logical CSS properties in any custom CSS:
    - `margin-inline-start` instead of `margin-left`
    - `padding-inline-end` instead of `padding-right`
4. Ensure patterns use Gutenberg's built-in RTL support (it handles most cases automatically)

***

## 11. Preview generation

### 11.1 Three layout variants

For each generation request, produce **3 distinct homepage layouts** by varying:


| Variant | Hero style | Feature style | Overall feel |
| :-- | :-- | :-- | :-- |
| A | Centered hero with overlay | 3-column grid | Balanced, classic |
| B | Split hero (text left, image right) | Alternating rows | Modern, asymmetric |
| C | Full-width video/image hero | Icon-led features | Bold, visual |

Each variant uses the **same** color palette and fonts (user's choices), just different pattern arrangements.

### 11.2 Preview rendering

Generate a static HTML preview (or screenshot) of each variant's homepage by:

1. Rendering the assembled `front-page.html` with Gutenberg's server-side rendering
2. Injecting the theme.json styles as inline CSS
3. Capturing as image or serving as sandboxed iframe

Display to user in tabbed interface.

***

## 12. Final output structure

### 12.1 Theme folder structure

```
theme-slug/
├── style.css                 # Theme header, minimal CSS
├── theme.json                # All design tokens
├── functions.php             # Theme setup, enqueues, WooCommerce support
├── screenshot.png            # Auto-generated from preview
├── templates/
│   ├── index.html
│   ├── front-page.html
│   ├── page.html
│   ├── single.html
│   ├── archive.html
│   ├── 404.html
│   ├── search.html
│   └── [conditional: single-product.html, page-menu.html, etc.]
├── parts/
│   ├── header.html
│   ├── footer.html
│   └── sidebar.html
├── patterns/
│   ├── hero.php
│   ├── features.php
│   ├── testimonials.php
│   ├── cta.php
│   └── [site-type specific patterns]
├── assets/
│   ├── fonts/
│   │   └── [bundled Google Font files]
│   └── images/
│       └── [generated/fetched images]
└── demo-content/             # Optional
    └── content.xml
```


### 12.2 Two download options

After user selects a layout variant, generate **2 style variations** of that layout:

- **Variation A**: Primary color dominant (buttons, links = primary)
- **Variation B**: Secondary color dominant (buttons, links = secondary), slight typography weight shift

Both are valid standalone themes. User can download both zips.

***

## 13. Validation pipeline

Before zipping, run:

1. **JSON Schema validation** on `theme.json` against `https://schemas.wp.org/trunk/theme.json`
2. **Block markup validation**: Parse each template/pattern HTML and ensure all block comments are well-formed
3. **Token reference check**: Scan all patterns for hardcoded colors (`#[0-9a-f]{3,6}`) or font sizes (`\d+px`) — fail if found
4. **Accessibility check**: Ensure heading hierarchy (h1 → h2 → h3), button labels present, color contrast passes WCAG AA for text/primary combinations

Log any failures; do not deliver invalid themes.

***

## 14. Scalability requirements

### 14.1 Queue-based generation

- All theme generation MUST happen in background workers, not in HTTP request cycle
- Use job queue (BullMQ, Celery, or similar) with configurable concurrency
- Target: handle 100 concurrent generation jobs


### 14.2 Caching

- Cache OpenAI responses by hash of input (business_description + language + site_type) for 24 hours
- Cache Unsplash image search results by query for 1 hour
- Cache extracted palettes by logo file hash indefinitely


### 14.3 Storage

- Use S3-compatible storage for all uploaded logos and generated zips
- Set expiration policy: delete zips after 30 days if not downloaded
- Stream zip downloads directly from S3, do not proxy through app server


### 14.4 Database indices

Index on:

- `projects.user_id`
- `projects.status`
- `jobs.project_id`
- `jobs.status`

***

## 15. Error handling

| Error type | Handling |
| :-- | :-- |
| Logo upload fails | Return clear error, allow retry |
| Palette extraction fails (no colors) | Provide default fallback palette, warn user |
| OpenAI API error | Retry 3 times with exponential backoff; on failure, use fallback placeholder content |
| Unsplash/DALL·E fails | Use bundled placeholder images |
| Validation fails | Log error, notify user, do not deliver invalid theme |
| Generation timeout (>5 min) | Kill job, notify user, allow retry |


***

## 16. Testing requirements

### 16.1 Unit tests

- Palette extraction: input logo → expected color roles
- Token injection: input config → valid theme.json
- Pattern assembly: input section list → valid template HTML


### 16.2 Integration tests

- Full generation pipeline: input → 3 valid theme zips
- WooCommerce variant: zip activates on WP + WooCommerce, product pages render
- Restaurant variant: menu page renders with correct items


### 16.3 E2E tests

- User completes wizard → receives download links
- Preview tabs render correctly
- Downloaded zip installs on fresh WordPress

***

## 17. Deliverables checklist

The agent MUST produce:

- [ ] Frontend: React/Next app with multi-step wizard, preview tabs, download UI
- [ ] Backend: API with endpoints for project CRUD, file upload, job status, download
- [ ] Worker: Job processor for theme generation
- [ ] Generator library: Functions for palette extraction, token injection, pattern assembly, zip creation
- [ ] Pattern library: Minimum 15 core patterns, 5 e-commerce patterns, 5 restaurant patterns
- [ ] Base theme: One FSE-native base theme with all required files
- [ ] Validation scripts: JSON Schema check, block markup check, token check
- [ ] Database schema: Tables for users, projects, jobs
- [ ] Docker setup: Containerized app, worker, database, Redis
- [ ] Documentation: README with setup, architecture, API reference

***

This document is your **binding specification**. Do not deviate from the token structure, file organization, or validation requirements. Any improvisation that breaks FSE/Gutenberg compatibility or introduces plugin dependencies is a failure condition.

<div align="center">⁂</div>

[^1]: https://www.advancedcustomfields.com/blog/wordpress-theme-json/

[^2]: https://wpvip.com/blog/using-a-design-system-with-the-wordpress-block-editor-pt-1-theme-json/

[^3]: https://motopress.com/blog/wordpress-export-theme/

[^4]: https://www.perplexity.ai/search/653e8d8f-2836-4147-9a0c-a779ede1d60d

[^5]: https://color.adobe.com/create/image

[^6]: https://coolors.co/image-picker

[^7]: https://onlinepngtools.com/find-logo-color-scheme

[^8]: https://www.canva.com/colors/color-palette-generator/

