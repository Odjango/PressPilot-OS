# PressPilot v3 — Master Roadmap

> **CRITICAL: Any AI agent working on this project MUST read this entire document before making changes.**
> **DO NOT skip sections. DO NOT assume steps are complete without verification.**

---

## Project Overview

**What PressPilot Does:** Generates complete WordPress FSE themes from business descriptions using AI.

**The v2 Problem:** AI generated raw WordPress block markup → validation errors → "Attempt Recovery" crashes in Site Editor.

**The v3 Solution:** AI generates JSON content only → pre-validated PHP patterns assemble the theme → zero block errors by design.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PRESSPILOT V3 FLOW                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  [User Input]                                                           │
│       │                                                                 │
│       ▼                                                                 │
│  [n8n Workflow]                                                         │
│       │                                                                 │
│       ├──► Transform Input (normalize business data)                    │
│       │                                                                 │
│       ├──► AI Generate Content Node ◄── ai-content-generator-prompt.md │
│       │         │                                                       │
│       │         ▼                                                       │
│       │    JSON Output:                                                 │
│       │    - selected_patterns[]                                        │
│       │    - strings{}                                                  │
│       │    - images{}                                                   │
│       │    - brand_colors{}                                             │
│       │    - business{}                                                 │
│       │    - menu_items[] (if restaurant)                               │
│       │                                                                 │
│       ├──► Format for Factory API                                       │
│       │                                                                 │
│       ▼                                                                 │
│  [Factory Plugin REST API]                                              │
│       │                                                                 │
│       ├──► Content_Handler::init(json)                                  │
│       │                                                                 │
│       ├──► Pattern_Assembler::assemble_page()                           │
│       │         │                                                       │
│       │         ├── Load pattern PHP files                              │
│       │         ├── presspilot_string() replaces text                   │
│       │         ├── presspilot_image() replaces URLs                    │
│       │         └── Output: valid block markup                          │
│       │                                                                 │
│       ├──► Generate theme.json (inject brand colors)                    │
│       │                                                                 │
│       ├──► Generate style.css (theme metadata)                          │
│       │                                                                 │
│       ├──► Create ZIP                                                   │
│       │                                                                 │
│       ├──► *** VALIDATION GATE *** ◄── MUST PASS BEFORE DELIVERY        │
│       │         │                                                       │
│       │         ├── ZIP structure check                                 │
│       │         ├── Required files check                                │
│       │         ├── theme.json validity                                 │
│       │         ├── style.css headers                                   │
│       │         └── Playground CLI test (block validation)              │
│       │                                                                 │
│       ▼                                                                 │
│  [Deliver ZIP to User]                                                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Component Status Tracker

| Component | Status | Location | Notes |
|-----------|--------|----------|-------|
| Pattern Library | ✅ DONE | `/presspilot-patterns/` | 30+ patterns |
| Content Handler | ✅ DONE | `/presspilot-patterns/inc/class-content-handler.php` | Placeholder system |
| Pattern Assembler | ✅ DONE | `/presspilot-patterns/class-pattern-assembler.php` | Orchestrator |
| Pattern Registry | ✅ DONE | `/presspilot-patterns/pattern-registry.json` | AI contract |
| AI System Prompt | ✅ DONE | `/n8n/ai-content-generator-prompt.md` | 382 lines |
| n8n Workflow Update | ✅ DONE | `/n8n/presspilot-factory-v2.json` | Added AI node |
| Factory Plugin Bridge | ✅ DONE | `/factory-plugin-v2/class-pattern-assembler-bridge.php` | Connects library |
| REST API v2 Endpoint | ✅ DONE | `/factory-plugin-v2/class-rest-api.php` | POST /presspilot/v2/generate |
| Content Tests | ✅ DONE | `/scripts/test-pattern-assembly.php` | 9/9 patterns pass |
| ZIP Structure Validation | ✅ DONE | `/scripts/validate-zip-structure.php` | Catches nesting, missing files, invalid JSON |
| WordPress Packaging Validation | ✅ DONE | Integrated in bridge + generator | realpath() fix for macOS symlink bug |
| Validation Gate (Bridge) | ✅ DONE | `/factory-plugin-v2/includes/class-pattern-assembler-bridge.php` | Blocks delivery if ZIP invalid |
| Logo Handling | ✅ DONE | `generate-coastal-cafe.php` §4a | Upload validation or fallback SVG; auto-import on activation |
| Multi-Page Templates | ✅ DONE | `generate-coastal-cafe.php` + `theme.json.template` | 4 pages: Home, Menu, About, Contact; auto-created on activation |
| Color Slug Mapping | ✅ DONE | All pattern PHP files | TT4 `contrast`→`foreground`, `base`→`background`; all patterns use palette-valid slugs |
| Page Creation (init hook) | ✅ DONE | `generate-coastal-cafe.php` functions.php | `init` hook with `get_option()` flag; survives theme updates |
| Business Type Docs | ✅ DONE | `/docs/business-types/restaurant.md` | Reservation handling, menu editing, FAQ |
| **Playground CLI Integration** | ❌ NOT DONE | — | Block validation |
| **WordPress Agent Skills** | ❌ NOT DONE | — | Never integrated |
| **End-to-End Test** | ❌ NOT DONE | — | Full n8n → ZIP flow |

---

## PHASE 1: Foundation (✅ COMPLETE)

### 1.1 Pattern Library
- [x] Create Content_Handler class with placeholder functions
- [x] Create pattern-registry.json (AI contract)
- [x] Create 30+ pre-validated pattern PHP files
- [x] Organize by category: headers, heroes, features, testimonials, cta, restaurant, ecommerce, footers
- [x] Each pattern uses `presspilot_string()` and `presspilot_image()` only

### 1.2 Pattern Assembler
- [x] Create Pattern_Assembler class
- [x] Implement `assemble_pattern()` — render single pattern
- [x] Implement `assemble_page()` — render pattern list
- [x] Implement `generate_theme_json()` — inject brand colors

### 1.3 AI Integration
- [x] Create comprehensive AI system prompt
- [x] Define JSON output schema
- [x] Document all placeholder slugs
- [x] Add content quality rules

### 1.4 n8n Workflow
- [x] Add AI Generate Content node
- [x] Add Format for Factory API node
- [x] Connect to Factory Plugin v2 endpoint

### 1.5 Factory Plugin
- [x] Create bridge class for pattern library
- [x] Add v2 REST endpoint
- [x] Implement `generate_theme_v2()` method

---

## PHASE 2: Validation Layer (PARTIALLY COMPLETE)

> **2.1–2.2 and 2.5 are done. 2.3–2.4 remain.**

### 2.1 ZIP Structure Validation
**Status:** ✅ DONE — `/scripts/validate-zip-structure.php`

Create `/scripts/validate-zip-structure.php`:

```php
<?php
/**
 * Validates WordPress theme ZIP structure.
 * MUST pass before ZIP is delivered to user.
 */

function validate_zip_structure(string $zip_path): array {
    $errors = [];
    $warnings = [];
    
    // Extract to temp
    $temp_dir = sys_get_temp_dir() . '/pp-validate-' . uniqid();
    $zip = new ZipArchive();
    $zip->open($zip_path);
    $zip->extractTo($temp_dir);
    $zip->close();
    
    // Find theme folder (should be only one top-level folder)
    $top_level = glob($temp_dir . '/*', GLOB_ONLYDIR);
    if (count($top_level) !== 1) {
        $errors[] = "ZIP must contain exactly one top-level folder";
        return ['valid' => false, 'errors' => $errors];
    }
    
    $theme_dir = $top_level[0];
    $theme_name = basename($theme_dir);
    
    // CRITICAL: style.css must be at theme root
    if (!file_exists($theme_dir . '/style.css')) {
        $errors[] = "style.css missing at theme root (found at wrong path?)";
    }
    
    // Required files check
    $required = ['style.css', 'index.php', 'theme.json'];
    foreach ($required as $file) {
        if (!file_exists($theme_dir . '/' . $file)) {
            $errors[] = "Missing required file: $file";
        }
    }
    
    // Required folders check
    $required_dirs = ['templates', 'parts'];
    foreach ($required_dirs as $dir) {
        if (!is_dir($theme_dir . '/' . $dir)) {
            $errors[] = "Missing required folder: $dir/";
        }
    }
    
    // style.css headers check
    if (file_exists($theme_dir . '/style.css')) {
        $css = file_get_contents($theme_dir . '/style.css');
        if (strpos($css, 'Theme Name:') === false) {
            $errors[] = "style.css missing 'Theme Name:' header";
        }
    }
    
    // theme.json validity check
    if (file_exists($theme_dir . '/theme.json')) {
        $json = json_decode(file_get_contents($theme_dir . '/theme.json'), true);
        if ($json === null) {
            $errors[] = "theme.json is not valid JSON";
        } elseif (!isset($json['version']) || $json['version'] < 2) {
            $errors[] = "theme.json must have version 2 or 3";
        }
    }
    
    // No nested theme folders (the bug we hit)
    $subdirs = glob($theme_dir . '/*', GLOB_ONLYDIR);
    foreach ($subdirs as $subdir) {
        $subname = basename($subdir);
        if (file_exists($subdir . '/style.css')) {
            $errors[] = "NESTED THEME DETECTED: $subname/style.css exists. ZIP has wrong structure.";
        }
    }
    
    // Cleanup
    exec("rm -rf " . escapeshellarg($temp_dir));
    
    return [
        'valid' => empty($errors),
        'theme_name' => $theme_name,
        'errors' => $errors,
        'warnings' => $warnings
    ];
}
```

### 2.2 WordPress Packaging Rules
**Status:** ✅ DONE — Root cause fixed (macOS `/var` → `/private/var` symlink bug in `getRealPath()`)

Create `/scripts/wordpress-packaging-rules.md`:

```markdown
# WordPress Theme ZIP Rules

## Structure (MUST follow exactly)
theme-name.zip
└── theme-name/           ← Single folder, matches ZIP name
    ├── style.css         ← REQUIRED at root
    ├── index.php         ← REQUIRED at root  
    ├── functions.php     ← Optional but recommended
    ├── theme.json        ← REQUIRED for FSE themes
    ├── templates/        ← REQUIRED for FSE themes
    │   ├── index.html
    │   ├── front-page.html
    │   ├── page.html
    │   ├── single.html
    │   └── 404.html
    └── parts/            ← REQUIRED for FSE themes
        ├── header.html
        └── footer.html

## style.css Headers (MUST include)
/*
Theme Name: Theme Name Here
Version: 1.0.0
Requires at least: 6.4
Tested up to: 6.7
Requires PHP: 7.4
*/

## Common Mistakes
1. Double-nested folders: theme-name/another-folder/style.css ← WRONG
2. Missing style.css at root
3. Missing Theme Name header in style.css
4. theme.json with version < 2
```

### 2.3 Playground CLI Integration
**Status:** ❌ NOT DONE

Create `/scripts/validate-with-playground.sh`:

```bash
#!/bin/bash
# Validates theme in WordPress Playground
# Requires: npm install -g @wp-playground/cli

ZIP_PATH=$1
THEME_NAME=$(basename "$ZIP_PATH" .zip)

echo "=== Playground Validation: $THEME_NAME ==="

# Start Playground with theme
npx @wp-playground/cli server \
  --mount="$ZIP_PATH:/wordpress/wp-content/themes/$THEME_NAME.zip" \
  --blueprint=<(cat <<EOF
{
  "landingPage": "/wp-admin/site-editor.php",
  "steps": [
    {"step": "login", "username": "admin", "password": "password"},
    {"step": "unzipFile", "zipPath": "/wordpress/wp-content/themes/$THEME_NAME.zip", "extractTo": "/wordpress/wp-content/themes"},
    {"step": "activateTheme", "themeFolderName": "$THEME_NAME"}
  ]
}
EOF
) &

PID=$!
sleep 10

# Check for block errors via REST API
ERRORS=$(curl -s "http://localhost:9400/wp-json/wp/v2/templates" 2>/dev/null | grep -c "invalid")

kill $PID 2>/dev/null

if [ "$ERRORS" -gt 0 ]; then
    echo "❌ FAILED: Found $ERRORS invalid blocks"
    exit 1
else
    echo "✅ PASSED: No block validation errors"
    exit 0
fi
```

### 2.4 WordPress Agent Skills Integration
**Status:** ❌ NOT DONE — We researched but never used

**Action Required:**
```bash
# Install WordPress Agent Skills
git clone https://github.com/WordPress/agent-skills.git ~/.claude/wordpress-skills

# Key skills to use:
# - wp-block-themes: Theme structure, theme.json, templates
# - wp-block-development: Block attributes, deprecations
# - wp-playground: Testing procedures
```

**For AI Agents:** Before generating ANY WordPress theme files, read:
- `~/.claude/wordpress-skills/skills/wp-block-themes/SKILL.md`
- `~/.claude/wordpress-skills/skills/wp-block-themes/references/theme-structure.md`

### 2.5 Integrated Validation Gate
**Status:** ✅ DONE — Added to `class-pattern-assembler-bridge.php` step 14 + `generate-coastal-cafe.php`

Add to `generate_theme_v2()` in Factory Plugin:

```php
// AFTER creating ZIP, BEFORE returning URL
$validation = validate_zip_structure($zip_path);

if (!$validation['valid']) {
    // Log errors
    error_log('PressPilot ZIP validation failed: ' . print_r($validation['errors'], true));
    
    // Return error to n8n
    return new WP_Error(
        'validation_failed',
        'Theme ZIP validation failed',
        ['errors' => $validation['errors']]
    );
}

// Only return ZIP URL if validation passes
return ['zip_url' => $zip_url, 'validation' => $validation];
```

---

## PHASE 3: Testing & Verification

### 3.1 Unit Tests
- [ ] Test each pattern renders without PHP errors
- [ ] Test Content_Handler with various inputs
- [ ] Test Pattern_Assembler with all pattern combinations
- [ ] Test theme.json generation with various brand colors

### 3.2 Integration Tests
- [ ] Test n8n workflow end-to-end
- [ ] Test AI generates valid JSON (not block markup)
- [ ] Test Factory Plugin processes AI output correctly
- [ ] Test ZIP is downloadable and installable

### 3.3 WordPress Validation Tests
- [ ] Test theme activates without errors
- [ ] Test Site Editor opens without "Attempt Recovery"
- [ ] Test all pages render correctly
- [ ] Test brand colors applied throughout
- [ ] Test PressPilot footer credit appears

### 3.4 Test Matrix

| Business Type | Required Patterns | Validation Points |
|---------------|-------------------|-------------------|
| Restaurant | header, hero, menu, chef, testimonials, hours, cta, footer | Menu items display, hours correct |
| E-Commerce | header, hero, featured-product, product-grid, categories, cta, footer | Product placeholders work |
| Business | header, hero, features, testimonials, cta, footer | Feature icons display |

---

## PHASE 4: Production Deployment

### 4.1 Pre-Deployment Checklist
- [ ] All Phase 2 validation scripts created and tested
- [ ] All Phase 3 tests passing
- [ ] n8n workflow tested with real AI calls
- [ ] Error handling for AI failures
- [ ] Error handling for validation failures
- [ ] Logging configured

### 4.2 Deployment Steps
1. Upload pattern library to production server
2. Update Factory Plugin on production
3. Import updated n8n workflow
4. Test with one real generation
5. Monitor logs for errors

### 4.3 Monitoring
- [ ] Log all theme generations
- [ ] Log validation results
- [ ] Alert on validation failures
- [ ] Track success rate

---

## MANDATORY CHECKPOINTS

> **AI Agents: You MUST verify these checkpoints. Do not proceed if any fail.**

### Before Generating Any Theme:
1. ✅ Pattern library exists at expected path
2. ✅ Content_Handler class is loaded
3. ✅ Pattern_Assembler class is loaded
4. ✅ All required patterns exist for business type

### Before Creating ZIP:
1. ✅ All patterns rendered without PHP errors
2. ✅ theme.json is valid JSON with version 3
3. ✅ style.css has required headers
4. ✅ templates/ folder has index.html and front-page.html
5. ✅ parts/ folder has header.html and footer.html

### Before Delivering ZIP:
1. ✅ ZIP structure validation passes
2. ✅ style.css is at theme root (NOT nested)
3. ✅ No nested theme folders detected
4. ✅ (Optional) Playground CLI test passes

### Before Marking Task Complete:
1. ✅ Theme installs in WordPress without error
2. ✅ Theme activates without error
3. ✅ Site Editor opens without "Attempt Recovery"
4. ✅ Frontend displays all sections correctly

---

## File Locations Reference

```
/PressPilot-OS/
├── presspilot-patterns/           # Pattern library
│   ├── inc/
│   │   └── class-content-handler.php
│   ├── patterns/
│   │   ├── headers/
│   │   ├── heroes/
│   │   ├── features/
│   │   ├── testimonials/
│   │   ├── cta/
│   │   ├── restaurant/
│   │   ├── ecommerce/
│   │   └── footers/
│   ├── class-pattern-assembler.php
│   ├── pattern-registry.json
│   ├── patterns-source-map.md
│   └── functions.php
│
├── factory-plugin-v2/             # WordPress plugin
│   ├── class-rest-api.php         # REST endpoints
│   ├── class-pattern-assembler-bridge.php
│   └── presspilot-factory.php     # Main plugin file
│
├── n8n/                           # Workflow files
│   ├── presspilot-factory-v2.json # Updated workflow
│   └── ai-content-generator-prompt.md
│
├── scripts/                       # Utility scripts
│   ├── test-pattern-assembly.php
│   ├── generate-coastal-cafe.php
│   ├── validate-zip-structure.php  # ❌ NEEDS CREATION
│   └── validate-with-playground.sh # ❌ NEEDS CREATION
│
├── docs/business-types/           # Business type guides
│   └── restaurant.md              # Restaurant reservations, menus, FAQ
│
├── .hintrc                        # Webhint config (suppresses no-inline-styles)
├── .vscode/settings.json          # Workspace settings
│
└── PRESSPILOT-V3-ROADMAP.md       # THIS FILE
```

---

## PROVEN-CORES VAULT (Source of Truth)

Location: `/proven-cores/`

| Theme | Codename | Use For |
|-------|----------|---------|
| tove | "Vertical Expert" | Restaurant menus, niche layouts, footers |
| ollie | "Startup" | E-commerce, style variations, contact |
| frost | "Masterpiece" | High-end headers, minimal layouts |
| spectra-one | "Performance Pro" | Business services, grids, contact forms |
| blockbase | "Invisible Framework" | Minimal, content-only |
| twentytwentyfour | "Gold Standard" | Universal patterns, accessibility |

### MANDATORY RULE
All patterns MUST be extracted from proven-cores.
Hand-written block markup is FORBIDDEN.
See `/presspilot-patterns/patterns-source-map.md` for extraction details.

---

## LOGO HANDLING SPEC

### User Upload Path
| Check | Requirement |
|-------|-------------|
| Format | PNG or SVG only |
| Size | Max 500KB |
| Dimensions | 200-1000px (PNG only; SVG is vector) |
| Background | Transparent recommended |

### Fallback Generation
| Theme Style | Background | Text |
|-------------|------------|------|
| Standard | Primary brand color | White |
| Minimal | #333333 | White |

### SVG Template (the ONLY template)
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="12" fill="{BACKGROUND_COLOR}"/>
  <text x="50" y="65" font-family="system-ui, sans-serif" font-size="36"
        font-weight="600" fill="#FFFFFF" text-anchor="middle">{INITIALS}</text>
</svg>
```

### On Theme Activation (`after_switch_theme`)
1. Set `blogname` → business name
2. Set `blogdescription` → business tagline
3. Copy logo to uploads, create media attachment
4. Set `custom_logo` (Customizer) + `site_icon` (favicon)
5. Store attachment ID to prevent duplicate imports

### Input Spec
- `logo_url`: string (optional) — User's logo URL or base64
- If empty → fallback generates automatically

### NO OTHER OPTIONS
- No grey placeholder blocks
- No logo generation APIs
- No complex decision trees
- Upload or initials. That's it.

---

## RESTAURANT RESERVATIONS

> **How PressPilot handles restaurant reservations — a static-first approach.**

### What We Generate

The restaurant template includes a **Contact page** (`page-contact.html`) with:
- Centered headline ("Reserve Your Table")
- Supporting text
- Phone number displayed prominently
- CTA button linking to `/contact/`

### Why No Built-In Booking Form

Reservation systems require real-time availability, payment processing, and calendar integrations. These vary between restaurants and change frequently. A static form would create a false promise.

### Three Options for Restaurant Owners

| Option | Effort | Best For |
|--------|--------|----------|
| **Booking Widget** (OpenTable, Resy, SimplyBook.me) | Low — paste embed code | Restaurants already using a booking service |
| **Form Plugin** (WPForms, Contact Form 7) | Medium — install plugin, create form | Restaurants wanting email-based reservations |
| **Phone/Email Only** | Zero — already included | Restaurants preferring traditional reservations |

### Documentation

Full guide with plugin recommendations, form field suggestions, and step-by-step instructions:
**`/docs/business-types/restaurant.md`**

### UI Tip (for Generation Step)

> Your theme includes a Contact page where customers can find your phone number and reach out to make a reservation. To accept online bookings, add a reservation widget (OpenTable, Resy) or a WordPress form plugin (WPForms) after installing your theme.

---

## Current Blockers (As of Feb 11, 2026)

### ~~BLOCKER 1: ZIP Structure Bug~~ — RESOLVED
**Status:** ✅ Fixed
**Root Cause:** macOS `/var` → `/private/var` symlink. `getRealPath()` resolves symlinks but `strlen($theme_dir)` used unresolved path, creating 8-char offset that turned `coastal-cafe/` into `al-cafe/`.
**Fix:** Use `realpath($theme_dir)` before computing relative paths in ZIP creation.

### ~~BLOCKER 2: No Validation Gate~~ — RESOLVED
**Status:** ✅ Implemented
**Fix:** Created `scripts/validate-zip-structure.php`, integrated into both `generate-coastal-cafe.php` and `class-pattern-assembler-bridge.php`. ZIP delivery is blocked if validation fails.

---

## Agent Instructions

### When Starting Work on This Project:

1. **READ this entire document first**
2. **Check Component Status Tracker** — know what's done vs not done
3. **Check Current Blockers** — don't duplicate work, fix blockers first
4. **Verify file locations** — make sure you're editing the right files
5. **Follow Mandatory Checkpoints** — do not skip validation

### When Adding New Features:

1. Update Component Status Tracker in this document
2. Add tests for the new feature
3. Update validation checkpoints if needed
4. Document file locations

### When Fixing Bugs:

1. Add the bug to Current Blockers if it's blocking
2. Fix the root cause, not just the symptom
3. Add validation to prevent recurrence
4. Remove from Blockers when fixed
5. Update this document

---

## Quick Commands Reference

```bash
# Run pattern tests
php scripts/test-pattern-assembly.php

# Generate test theme
php scripts/generate-coastal-cafe.php

# Check ZIP structure
unzip -l path/to/theme.zip

# Validate ZIP (once script exists)
php scripts/validate-zip-structure.php path/to/theme.zip

# Test in Playground (once script exists)
./scripts/validate-with-playground.sh path/to/theme.zip
```

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-02-11 | Initial roadmap created | Claude |
| 2026-02-11 | Phase 1 completed, Phase 2 identified as incomplete | Claude |
| 2026-02-11 | ZIP structure bug discovered | Testing |
| 2026-02-11 | Fixed ZIP nesting bug (macOS realpath), created validate-zip-structure.php, integrated validation gate | Claude |
| 2026-02-11 | Extracted 4 patterns from proven-cores vault: footer (Tove), header (Frost), chef-highlight (TT4), hours-location (TT4). Created patterns-source-map.md. Added PROVEN-CORES VAULT section to roadmap. | Claude |
| 2026-02-11 | Added simplified logo handling: upload (PNG/SVG, validated) or fallback SVG (initials + brand color). Auto-imports to Media Library on activation. Sets site identity. Added LOGO HANDLING SPEC to roadmap. | Claude |
| 2026-02-11 | Multi-page theme: 4 templates (front-page, page-menu, page-about, page-contact). Pages auto-created on activation with static front page. Header nav updated from hash anchors to real page paths. customTemplates registered in theme.json. | Claude |
| 2026-02-11 | Fixed TT4 color slug mapping across 6 pattern files (`contrast`→`foreground`, `base`→`background`). Fixed double-encoding bug in `presspilot_string()`. Fixed page creation hook (`after_switch_theme`→`init` with flag). Fixed header layout (flexWrap, site-title styling). | Claude |
| 2026-02-11 | v3 Core declared COMPLETE. Added restaurant reservations docs (`/docs/business-types/restaurant.md`), user_guidance to pattern registry, and reservation handling section to roadmap. | Claude |
| 2026-02-11 | Suppressed false-positive `no-inline-styles` linter warnings. Added `.hintrc` (webhint config) and updated `.vscode/settings.json`. Documented in CLAUDE.md why inline styles are required in WordPress FSE block markup. | Claude |

---

**END OF ROADMAP**

**Remember: This document is the single source of truth. Update it as the project evolves.**
