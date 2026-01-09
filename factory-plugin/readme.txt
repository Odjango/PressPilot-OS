=== PressPilot Factory ===
Contributors: presspilot
Tags: theme-generator, fse, full-site-editing, block-patterns, rest-api
Requires at least: 6.4
Tested up to: 6.5
Requires PHP: 8.0
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Generate complete WordPress FSE themes programmatically via REST API.

== Description ==

PressPilot Factory is a powerful WordPress plugin that generates complete Full Site Editing (FSE) themes through a REST API. Perfect for SaaS platforms, agencies, and developers who need to create customized WordPress sites at scale.

= Features =

* **REST API Generation** - Generate complete themes via POST request to `/wp-json/presspilot/v1/generate`
* **Category-Aware Templates** - Different page structures for corporate, restaurant, and ecommerce sites
* **Brand Application** - Apply custom colors, fonts, and logos automatically
* **Pattern Library** - Pre-built FSE patterns including heroes, features, testimonials, CTAs, and more
* **Style Variations** - Original, high-contrast, and inverted color schemes
* **Theme Export** - Export customized themes as ZIP files
* **Static Export** - Integration with Simply Static for static site generation
* **Cleanup System** - Easy cleanup of generated content

= API Endpoints =

**POST /wp-json/presspilot/v1/generate**

Generate a complete site with theme.

Request body:
```json
{
    "businessName": "My Business",
    "tagline": "Your tagline here",
    "description": "Business description",
    "category": "corporate|restaurant|ecommerce",
    "colors": {
        "primary": "#1e40af",
        "secondary": "#64748b",
        "accent": "#f59e0b",
        "background": "#ffffff",
        "text": "#1f2937"
    },
    "fonts": {
        "heading": "Inter",
        "body": "Inter"
    },
    "logo": "https://example.com/logo.png",
    "variation": "original|high-contrast|inverted",
    "content": {}
}
```

Response:
```json
{
    "success": true,
    "generation_id": "gen_uuid",
    "preview_url": "https://site.com/",
    "downloads": {
        "theme_zip": "https://site.com/wp-content/uploads/presspilot-factory/themes/theme.zip",
        "static_zip": "https://site.com/wp-content/uploads/presspilot-factory/static/static.zip"
    }
}
```

**POST /wp-json/presspilot/v1/cleanup**

Remove all generated content.

**GET /wp-json/presspilot/v1/status/{id}**

Check generation status.

= Categories =

* **Corporate** - Standard business pages: Home, About, Services, Contact
* **Restaurant** - Adds Menu page with price list formatting
* **E-commerce** - Adds WooCommerce pages: Shop, Cart, Checkout, My Account

= Pattern Library =

* `hero-centered` - Full-width hero with centered text
* `hero-split` - Two-column hero with text and image
* `hero-minimal` - Dark background with bold typography
* `features-grid` - Feature cards in columns with repeater support
* `testimonials` - Customer quotes in card layout
* `cta-banner` - Colored call-to-action section
* `about-content` - About section with text and image
* `services-grid` - Service cards with icons
* `contact-form` - Contact information and form

= Template Syntax =

Patterns support placeholder syntax:
* `{{placeholder}}` - Simple value replacement
* `{{#items}}...{{/items}}` - Repeater blocks for arrays
* `{{#if condition}}...{{/if}}` - Conditional blocks

== Installation ==

1. Upload the `factory-plugin` folder to `/wp-content/plugins/`
2. Activate the plugin through the 'Plugins' menu
3. Configure API key in Settings > PressPilot Factory (optional)
4. Install and activate a base theme like Ollie
5. Start generating via the REST API

== Frequently Asked Questions ==

= What base theme does this use? =

By default, PressPilot Factory uses the Ollie theme as a base. If Ollie is not installed, it falls back to the active theme.

= How do I authenticate API requests? =

You can authenticate using either:
1. WordPress user with `manage_options` capability
2. API key passed in `X-PressPilot-Key` header

= Does this work with WooCommerce? =

Yes! When the category is set to "ecommerce", the plugin automatically creates WooCommerce pages (Shop, Cart, Checkout) if WooCommerce is active.

= How do I clean up generated content? =

Use the cleanup endpoint: `POST /wp-json/presspilot/v1/cleanup`

All generated content is marked with `_presspilot_generated` meta and can be safely removed.

== Changelog ==

= 1.0.0 =
* Initial release
* REST API for site generation
* Pattern library with 9 patterns
* 3 style variations (original, high-contrast, inverted)
* Theme ZIP export
* Simply Static integration
* Category-aware page generation
* Navigation menu builder
* Brand application (colors, fonts, logo)
* Cleanup system

== Upgrade Notice ==

= 1.0.0 =
Initial release of PressPilot Factory.
