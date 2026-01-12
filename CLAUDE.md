# PressPilot - Complete Project Guide

> **THIS IS THE SINGLE SOURCE OF TRUTH FOR CLAUDE CLI**

---

## 1. PROJECT VISION

PressPilot is an **AI-powered website orchestration engine** that:
- **Orchestrates** free, open-source themes, templates, and patterns
- **Applies** brand identity through logo and brand colors
- **Generates** contextual AI content seamlessly integrated into templates
- **Delivers** production-ready, branded websites without custom development

### Core Principles
- **Free/Open-Source Only:** All dependencies must be free and open-source
- **AI Generates CONTENT, Not MARKUP:** AI produces JSON content; WordPress builds block markup
- **Factory Pattern:** Modular factories handle theme selection, branding, content, and assembly

---

## 2. SYSTEM ARCHITECTURE

```
┌─────────────────┐     ┌─────────────────────────────────────────────────┐
│  n8n Workflow   │────▶│  https://factory.presspilotapp.com              │
│  (Claude AI)    │     │  POST /wp-json/presspilot/v1/generate           │
└─────────────────┘     └─────────────────────────────────────────────────┘
                                          │
                        ┌─────────────────┴─────────────────┐
                        ▼                                   ▼
              ┌─────────────────┐                 ┌─────────────────┐
              │   Theme ZIP     │                 │   Static ZIP    │
              │   (WordPress)   │                 │   (HTML/CSS)    │
              └─────────────────┘                 └─────────────────┘
```

### Infrastructure
| Component | Location |
|-----------|----------|
| Factory WordPress | https://factory.presspilotapp.com |
| Server | DigitalOcean VPS (134.209.167.43) |
| Base Theme | Ollie (FSE block theme) |
| GitHub Repo | github.com/Odjango/PressPilot-OS |

---

## 3. CODE LOCATIONS

### Project Root
```
/Users/soluwrx/Downloads/PressPilot-OS/PressPilot-OS/
```

### Factory Plugin (MAIN WORK AREA)
```
/Users/soluwrx/Downloads/PressPilot-OS/PressPilot-OS/factory-plugin/
├── presspilot-factory.php          # Main plugin file
├── includes/
│   ├── class-api-handler.php        # REST API + page creation logic
│   ├── class-content-builder.php    # Creates pages using patterns
│   ├── class-pattern-loader.php     # Loads HTML, replaces {{placeholders}}
│   ├── class-brand-applier.php      # Colors/fonts/logo
│   ├── class-navigation-builder.php # Menu creation
│   ├── class-theme-exporter.php     # Theme ZIP export
│   └── class-static-exporter.php    # Static HTML export
├── patterns/                        # HTML block pattern templates
│   ├── hero.html                    # ✅ Has layout
│   ├── features.html                # ✅ Has {{icon}} placeholder
│   ├── features-grid.html           # ✅ Has {{icon}} placeholder
│   ├── about-content.html           # ✅ Has story layout
│   ├── services-grid.html           # ✅ Has service cards
│   ├── contact-form.html            # ✅ Has form with inputs
│   ├── menu-grid.html               # ⚠️ Needs category headers
│   └── testimonials.html            # ✅ Has quotes
└── variations/
    └── original.json                # Default style config
```

### Production Server Path
```
/var/lib/docker/volumes/bb6b60fe00c76ab4ab0aaca0e12ded2c0814fad9aeb2295d57050c747d7068c2/_data/wp-content/plugins/factory-plugin/
```

---

## 4. HOW GENERATION WORKS

### API Request Flow
1. **n8n workflow** sends POST to `/wp-json/presspilot/v1/generate`
2. **class-api-handler.php** validates request and orchestrates:
   - Calls `cleanup_handler->cleanup()` (removes old content)
   - Calls `brand_applier->apply()` (sets colors/logo)
   - Calls `create_pages_for_category()` (builds all pages)
   - Calls `navigation_builder->create_menu()` (creates nav)
   - Calls `theme_exporter->export()` (creates theme.zip)
   - Calls `static_exporter->export()` (creates static.zip)

### Page Creation Logic (class-api-handler.php lines 190-240)
```php
$common_pages = [
    'home' => ['patterns' => ['hero', 'features', 'testimonials', 'cta']],
    'about' => ['patterns' => ['about-content']],
    'services' => ['patterns' => ['services-grid']],
    'contact' => ['patterns' => ['contact-form']],
];

// Restaurant adds:
'menu' => ['patterns' => ['menu-grid']]

// E-commerce adds:
'shop', 'cart', 'checkout'
```

### Pattern Loading (class-pattern-loader.php)
- Loads `patterns/{name}.html`
- Replaces `{{variable}}` with data from request
- Supports `{{#items}}...{{/items}}` for loops
- Supports `{{#if condition}}...{{/if}}` for conditionals

---

## 5. WHAT'S WORKING ✅

Based on code audit:

| Feature | Status | Notes |
|---------|--------|-------|
| Hero section | ✅ | Pattern exists, renders correctly |
| Features with icons | ✅ | Pattern has `{{icon}}` placeholder |
| Contact form | ✅ | Pattern has full form with inputs |
| Services grid | ✅ | Pattern exists |
| Testimonials | ✅ | Pattern exists |
| Theme ZIP export | ✅ | ~2MB output |
| Static ZIP export | ✅ | ~60MB output |
| API authentication | ✅ | X-PressPilot-Key header |

---

## 6. REMAINING ISSUES ⚠️

Based on screenshots and code audit:

### Issue 1: No Values Section on About Page
- **Problem:** About page only has story, no "Our Values" section with icons
- **Root Cause:** No `values-section.html` pattern exists
- **Fix:** 
  1. Create `patterns/values-section.html` with 3 cards + icons
  2. Add `'values-section'` to About page patterns in class-api-handler.php line 205

### Issue 2: Menu Lacks Category Headers
- **Problem:** Menu is flat list, no category groupings with emojis
- **Root Cause:** `menu-grid.html` only iterates items, no categories
- **Fix:** Update pattern to support `{{#categories}}` with `{{icon}}`

### Issue 3: Footer Text Readability
- **Problem:** Black text on blue background (from screenshot)
- **Root Cause:** Footer template not setting text color to white
- **Fix:** Check Ollie theme footer or create custom footer pattern

### Issue 4: n8n May Not Send Icon Data
- **Problem:** Icons might not appear if n8n doesn't include `icon` in feature items
- **Root Cause:** AI content generation prompt may not request icons
- **Fix:** Verify n8n workflow sends: `{"title": "...", "description": "...", "icon": "🚀"}`

---

## 7. TASK LIST

### Task 1: Create Values Section Pattern
```
File: factory-plugin/patterns/values-section.html
Content: 3-column layout with icon + title + description per card
Placeholders: {{values_title}}, {{#items}} {{icon}} {{title}} {{description}} {{/items}}
```

### Task 2: Add Values to About Page
```
File: factory-plugin/includes/class-api-handler.php
Line: ~205
Change: 'about' => ['patterns' => ['about-content']]
To: 'about' => ['patterns' => ['about-content', 'values-section']]
```

### Task 3: Improve Menu Grid Pattern
```
File: factory-plugin/patterns/menu-grid.html
Add: Category header support with {{#categories}} wrapper
Add: {{category_icon}} and {{category_name}} placeholders
```

### Task 4: Verify n8n Sends Icons
```
Check: n8n workflow's AI prompt includes request for emoji icons
Check: Code node transforms AI output to include icon field
Test: Send manual curl request with icon data, verify they appear
```

### Task 5: Fix Footer Colors (if needed)
```
Check: Ollie theme footer template in parts/
Ensure: Text color is white on dark background
Ensure: {{business_name}} placeholder is replaced
```

---

## 8. DEPLOYMENT

### After Making Changes
```bash
# Navigate to plugin folder
cd /Users/soluwrx/Downloads/PressPilot-OS/PressPilot-OS/factory-plugin

# Deploy to server
scp -r ./* root@134.209.167.43:/var/lib/docker/volumes/bb6b60fe00c76ab4ab0aaca0e12ded2c0814fad9aeb2295d57050c747d7068c2/_data/wp-content/plugins/factory-plugin/
```

### Test API
```bash
curl -X POST https://factory.presspilotapp.com/wp-json/presspilot/v1/generate \
  -H "Content-Type: application/json" \
  -H "X-PressPilot-Key: YOUR_KEY" \
  -d '{
    "businessName": "Mamma Mia Pizza",
    "category": "restaurant",
    "colors": {"primary": "#2856A3", "secondary": "#F47920"},
    "content": {
      "hero": {"headline": "Best Pizza in Town", "cta_text": "Order Now"},
      "features": {
        "items": [
          {"title": "Fresh", "description": "Local ingredients", "icon": "🥬"},
          {"title": "Fast", "description": "30 min delivery", "icon": "⚡"},
          {"title": "Family", "description": "Since 1985", "icon": "❤️"}
        ]
      }
    }
  }'
```

---

## 9. RULES FOR CLAUDE CLI

1. **ONLY edit files in:** `/Users/soluwrx/Downloads/PressPilot-OS/PressPilot-OS/factory-plugin/`
2. **NEVER search** outside this folder
3. **NEVER request** permissions for personal folders
4. **Read this file FIRST** before any task
5. **One task at a time** - verify each before proceeding
6. **Test after deploy** - use curl or n8n to verify

---

## 10. API REFERENCE

### Request Schema
```json
{
  "businessName": "string (required)",
  "category": "corporate|restaurant|ecommerce (required)",
  "colors": {
    "primary": "#hex",
    "secondary": "#hex",
    "accent": "#hex"
  },
  "fonts": {"heading": "font", "body": "font"},
  "logo": "URL",
  "content": {
    "hero": {"headline": "...", "subheadline": "...", "cta_text": "..."},
    "features": {"items": [{"title": "...", "description": "...", "icon": "emoji"}]},
    "about": {"headline": "...", "about_text": "..."},
    "values": {"items": [{"title": "...", "description": "...", "icon": "emoji"}]},
    "contact": {"headline": "...", "email": "...", "phone": "...", "address": "..."},
    "menu": {"categories": [{"name": "...", "icon": "emoji", "items": [...]}]}
  }
}
```

### Response Schema
```json
{
  "success": true,
  "generation_id": "gen_uuid",
  "preview_url": "https://factory.presspilotapp.com",
  "downloads": {
    "theme_zip": "URL",
    "static_zip": "URL"
  }
}
```

---

## 11. DEBUG COMMANDS

```bash
# SSH to server
ssh root@134.209.167.43

# Check debug log
tail -100 /var/lib/docker/volumes/bb6b60fe00c76ab4ab0aaca0e12ded2c0814fad9aeb2295d57050c747d7068c2/_data/wp-content/debug.log

# List pattern files
ls -la /var/lib/docker/volumes/bb6b60fe00c76ab4ab0aaca0e12ded2c0814fad9aeb2295d57050c747d7068c2/_data/wp-content/plugins/factory-plugin/patterns/

# Enable debug mode (edit wp-config.php)
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
```

---

*Last Updated: January 12, 2026*
*Version: 2.0 - Merged from PressPilot_Detailed_Plan_V3.md and existing CLAUDE.md*
