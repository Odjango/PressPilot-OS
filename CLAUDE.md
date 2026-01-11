# PressPilot Factory Plugin - Project Documentation

## Overview

The PressPilot Factory Plugin is a WordPress REST API-based theme factory that generates complete FSE (Full Site Editing) themes from AI-generated content. It receives JSON content from an n8n workflow, builds WordPress pages using block patterns, applies branding, and exports both theme ZIPs and static HTML ZIPs.

## Architecture

```
┌─────────────────┐     ┌─────────────┐     ┌──────────────────────┐
│  n8n Workflow   │────▶│  REST API   │────▶│  Factory WordPress   │
│  (AI Content)   │     │  /generate  │     │  factory.presspilot  │
└─────────────────┘     └─────────────┘     └──────────────────────┘
                                                      │
                              ┌───────────────────────┼───────────────────────┐
                              ▼                       ▼                       ▼
                        ┌──────────┐           ┌──────────┐           ┌──────────┐
                        │  Pages   │           │  Theme   │           │  Static  │
                        │ Created  │           │   ZIP    │           │   ZIP    │
                        └──────────┘           └──────────┘           └──────────┘
```

## Key Principle: AI Generates CONTENT, Not MARKUP

**Critical Design Decision:** The AI agent generates pure content (headlines, descriptions, features) as JSON. WordPress builds the block markup using native functions and pattern templates. This prevents:
- Malformed block markup
- FSE compatibility issues  
- `{{placeholder}}` variables appearing in rendered pages

## Infrastructure

| Component | Location |
|-----------|----------|
| Factory WordPress | https://factory.presspilotapp.com |
| Server | DigitalOcean VPS via Coolify (134.209.167.43) |
| Base Theme | Ollie (FSE block theme) |
| Static Export | Basic HTML export (fetches rendered pages) |
| GitHub Repo | github.com/Odjango/PressPilot-OS (Private) |
| Plugin Path (server) | `/var/lib/docker/volumes/bb6b60fe00c76ab4ab0aaca0e12ded2c0814fad9aeb2295d57050c747d7068c2/_data/wp-content/plugins/factory-plugin/` |

## Plugin Structure

```
factory-plugin/
├── presspilot-factory.php          # Main plugin file, autoloader, activation
├── readme.txt                       # WordPress plugin readme
├── CLAUDE.md                        # This file
├── includes/
│   ├── class-api-handler.php        # REST endpoints, authentication
│   ├── class-content-builder.php    # wp_insert_post for pages
│   ├── class-pattern-loader.php     # Loads HTML patterns, replaces {{placeholders}}
│   ├── class-brand-applier.php      # Colors/fonts/logo via global styles
│   ├── class-navigation-builder.php # wp_create_nav_menu
│   ├── class-theme-exporter.php     # Copies Ollie + customizations to ZIP
│   ├── class-static-exporter.php    # Static HTML export (pages + assets)
│   └── class-cleanup-handler.php    # Deletes _presspilot_generated posts
├── patterns/                        # HTML block pattern templates
│   ├── hero.html / hero-centered.html
│   ├── hero-split.html / hero-minimal.html
│   ├── features.html / features-grid.html
│   ├── testimonials.html
│   ├── cta.html / cta-banner.html
│   ├── about-content.html
│   ├── services-grid.html
│   ├── contact-form.html
│   ├── menu-grid.html              # Restaurant menu items
│   ├── shop-grid.html              # WooCommerce products
│   └── woocommerce-cart.html
└── variations/                      # Layout/style variations
    ├── original.json               # Centered hero
    ├── high-contrast.json          # Split layout
    └── inverted.json               # Dark mode
```

## REST API

### Authentication
- Header: `X-PressPilot-Key: <api_key>`
- API key stored in: `wp_options` → `presspilot_api_key`

### Endpoints

#### POST /wp-json/presspilot/v1/generate
Main generation endpoint.

**Request Body:**
```json
{
  "businessName": "Acme Corp",
  "category": "corporate",
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
  "variation": "original",
  "content": {
    "hero": {
      "headline": "Transform Your Business",
      "subheadline": "We help companies grow",
      "cta_text": "Get Started",
      "cta_url": "/contact"
    },
    "about": {
      "headline": "About Us",
      "description": "Our story..."
    },
    "services": {
      "headline": "Our Services",
      "items": [
        {"title": "Service 1", "description": "..."},
        {"title": "Service 2", "description": "..."}
      ]
    },
    "testimonials": {
      "items": [
        {"quote": "...", "name": "John", "role": "CEO"}
      ]
    },
    "contact": {
      "headline": "Contact Us",
      "email": "hello@example.com",
      "phone": "(555) 123-4567"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "generation_id": "abc123",
  "preview_url": "https://factory.presspilotapp.com",
  "downloads": {
    "theme_zip": "https://factory.presspilotapp.com/wp-content/themes/acme-corp.zip",
    "static_zip": "https://factory.presspilotapp.com/wp-content/static/acme-corp-static.zip"
  }
}
```

#### POST /wp-json/presspilot/v1/cleanup
Removes all generated content (pages with `_presspilot_generated` meta).

#### GET /wp-json/presspilot/v1/status/{id}
Check generation status.

## Business Categories

| Category | Extra Pages |
|----------|-------------|
| corporate | Standard pages only |
| restaurant | + Menu page |
| ecommerce | + Shop, Cart, Checkout pages |
| fitness | Standard pages only |
| portfolio | Standard pages only |

## Pattern System

Patterns use Mustache-style placeholders:

```html
<!-- wp:heading -->
<h1>{{headline}}</h1>
<!-- /wp:heading -->

{{#items}}
<div class="feature">
  <h3>{{title}}</h3>
  <p>{{description}}</p>
</div>
{{/items}}

{{#if address}}
<p>{{address}}</p>
{{/if}}
```

**Pattern Loader Features:**
- Simple placeholders: `{{variable}}`
- Repeaters: `{{#items}}...{{/items}}`
- Conditionals: `{{#if condition}}...{{/if}}`
- Fallback values for missing data
- HTML escaping for security

## n8n Workflow Integration

### CRITICAL: Correct Endpoint Configuration

**DO NOT USE:** `https://presspilotapp.com/api/generate` (Next.js - BROKEN)

**USE THIS:** `https://factory.presspilotapp.com/wp-json/presspilot/v1/generate` (WordPress Factory - WORKING)

The Next.js serverless environment cannot render WordPress blocks. The Factory Plugin at factory.presspilotapp.com was built specifically for this purpose.

### n8n HTTP Request Node Configuration
```
Method: POST
URL: https://factory.presspilotapp.com/wp-json/presspilot/v1/generate
Headers:
  Content-Type: application/json
  X-PressPilot-Key: <api_key_from_wordpress>
Body: JSON (from AI content generation step)
```

### Workflow Steps
1. Receives webhook with business info
2. Calls AI (Claude/GPT) to generate content JSON
3. Transforms AI output to API format (Code node)
4. POSTs to `https://factory.presspilotapp.com/wp-json/presspilot/v1/generate`
5. Downloads resulting ZIPs from response URLs
6. Delivers to user

### Test Script
Run `./scripts/test-factory-api.sh` to verify the factory endpoint is working.

## Development Workflow

### Local Development
```bash
cd /Users/soluwrx/Downloads/PressPilot-OS/PressPilot-OS/factory-plugin
# Edit files locally
git add -A && git commit -m "description" && git push
```

### Deploy to Server
```bash
# SSH to server
ssh root@134.209.167.43

# Plugin location
cd /var/lib/docker/volumes/bb6b60fe00c76ab4ab0aaca0e12ded2c0814fad9aeb2295d57050c747d7068c2/_data/wp-content/plugins/factory-plugin/

# Or SCP files directly
scp local/file.php root@134.209.167.43:/var/lib/docker/volumes/bb6b60fe00c76ab4ab0aaca0e12ded2c0814fad9aeb2295d57050c747d7068c2/_data/wp-content/plugins/factory-plugin/
```

### Enable Debug Mode
Edit wp-config.php on server:
```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```
Check: `/wp-content/debug.log`

## Current Status (January 2025)

### ✅ Completed
- [x] Plugin architecture designed
- [x] All PHP classes implemented
- [x] Pattern HTML files created
- [x] REST API endpoints registered
- [x] Plugin installed on factory server
- [x] API key created and configured
- [x] n8n workflow configured
- [x] API key mismatch fixed (`presspilot_api_key`)
- [x] Missing pattern files deployed
- [x] Page creation working (4 pages: Home, About, Services, Contact)
- [x] Theme ZIP export working (~2MB)
- [x] Static HTML ZIP export working (~60MB with assets)

### 📊 Current Performance
- API generation time: ~24 seconds
- Theme ZIP size: ~2MB
- Static ZIP size: ~60MB (includes HTML pages + theme assets)
- Pages created per generation: 4 (corporate), 5 (restaurant), 7 (ecommerce)

### ✅ Recently Fixed Issues
1. **Static ZIP was empty** - Fixed by switching from Simply Static plugin integration to basic HTML export
   - Simply Static's internal API was incompatible with programmatic triggering
   - Basic export fetches rendered HTML via `wp_remote_get()` and packages with assets

2. **Pages confirmed working** - API correctly creates pages with `_presspilot_generated` meta

## Debugging Checklist

When pages aren't created:

1. **Check API Key Match**
   ```bash
   # On server
   grep "presspilot_api_key" class-api-handler.php
   # Should show: get_option( 'presspilot_api_key' )
   ```

2. **Verify Patterns Exist**
   ```bash
   ls patterns/
   # Should include: hero.html, features.html, etc.
   ```

3. **Enable WP Debug**
   ```php
   define('WP_DEBUG', true);
   define('WP_DEBUG_LOG', true);
   ```

4. **Check Debug Log**
   ```bash
   tail -100 wp-content/debug.log
   ```

5. **Test API Manually**
   ```bash
   curl -X POST https://factory.presspilotapp.com/wp-json/presspilot/v1/generate \
     -H "Content-Type: application/json" \
     -H "X-PressPilot-Key: YOUR_KEY" \
     -d '{"businessName":"Test","category":"corporate",...}'
   ```

## Future Enhancements

### Phase 2
- [ ] Add more pattern variations
- [ ] Support custom page templates
- [ ] Image generation/placement integration
- [ ] Multi-language support

### Phase 3
- [ ] Queue system for multiple concurrent generations
- [ ] Webhook callbacks for generation completion
- [ ] Analytics/tracking for generated sites
- [ ] A/B testing different pattern layouts

### Phase 4
- [ ] Self-hosted deployment option
- [ ] White-label support
- [ ] API rate limiting and quotas
- [ ] Subscription/billing integration

## File Reference Quick Links

| File | Purpose |
|------|---------|
| `class-api-handler.php:63` | API key validation |
| `class-content-builder.php` | Page creation logic |
| `class-pattern-loader.php` | Template rendering |
| `patterns/hero.html` | Main hero section |
| `variations/original.json` | Default layout config |

## Contact & Support

- **Repo:** github.com/Odjango/PressPilot-OS
- **Factory URL:** https://factory.presspilotapp.com
- **Server IP:** 134.209.167.43

---

*Last Updated: January 11, 2026*
