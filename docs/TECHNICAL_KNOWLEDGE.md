# PressPilot Technical Knowledge Base

> **Last Updated:** February 20, 2026
> **Purpose:** Prevent repeated debugging cycles by documenting architectural discoveries, root causes, and resolution patterns.

---

## Table of Contents

1. [Infrastructure & Deployment](#infrastructure--deployment)
2. [Theme Generation Pipeline](#theme-generation-pipeline)
3. [Pattern System Architecture](#pattern-system-architecture)
4. [WordPress FSE Block Grammar Rules](#wordpress-fse-block-grammar-rules)
5. [Content Sanitization & Encoding](#content-sanitization--encoding)
6. [Recipe System Flow](#recipe-system-flow)
7. [Common Issues & Root Causes](#common-issues--root-causes)
8. [Debugging Playbook](#debugging-playbook)
9. [Key File Reference](#key-file-reference)

---

## Infrastructure & Deployment

### Container Architecture (Coolify on DigitalOcean)

| Container | Purpose | Naming Pattern |
|-----------|---------|----------------|
| `hkws0oc4okw0ww408ksw4wwg-*` | Next.js frontend + generator | Random Coolify ID |
| `laravel-app-boww4s0ks4gs8k40o4k4sso0-*` | Laravel backend API | `laravel-app-{projectId}-{instanceId}` |
| `laravel-horizon-boww4s0ks4gs8k40o4k4sso0-*` | Horizon queue worker | `laravel-horizon-{projectId}-{instanceId}` |
| `pp-redis-*` | Redis cache | `pp-redis-{projectId}-{instanceId}` |
| `wordpress-*` | WordPress factory | `wordpress-{projectId}` |
| `mysql-*` | MySQL for WordPress | `mysql-{projectId}` |

**Important:** Container names include random Coolify-generated IDs. Never hardcode container names in scripts.

### Verifying Deployed Code

```bash
# 1. Find the Next.js/generator container
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"

# 2. Verify specific code is deployed (replace CONTAINER_NAME)
docker exec CONTAINER_NAME grep -r "SEARCH_TERM" /app/src/path/to/file

# 3. Check container age vs commit time
# If container "Up X hours" > your commit age, code is NOT deployed
```

### Deployment Gotchas

1. **Coolify shows "successful" for OLD deploys** — Always check container uptime vs commit timestamp
2. **Webhook may not trigger** — Manual redeploy via Coolify dashboard if push doesn't trigger build
3. **Build cache** — Coolify may use cached layers; force rebuild if code changes aren't reflected

---

## Theme Generation Pipeline

### High-Level Flow

```
User Input (Studio UI)
    ↓
Next.js API (/api/generate)
    ↓
Laravel Backend (job queue)
    ↓
TypeScript Generator Engine
    ├── Recipe Selection (by vertical + style)
    ├── Content Generation (AI or template)
    ├── Pattern Injection
    ├── Template Assembly
    └── Theme Packaging (ZIP)
    ↓
WordPress Factory (preview/validation)
    ↓
Download URL returned to user
```

### Generator Entry Points

| Vertical | Mode | Entry Function |
|----------|------|----------------|
| Restaurant | Heavy Mode (forced) | `generateHeavyMode()` → `getUniversalHomeContent()` |
| SaaS | Recipe Mode | `generateFromRecipe()` |
| Portfolio | Recipe Mode | `generateFromRecipe()` |
| Local Service | Recipe Mode | `generateFromRecipe()` |
| E-commerce | Recipe Mode | `generateFromRecipe()` |

**Key Discovery:** Restaurant generation is forced to "heavy mode" in `src/generator/index.ts`, which renders the homepage inline via `getUniversalHomeContent()`, NOT via pattern slug references.

---

## Pattern System Architecture

### Two Competing Systems (Root Cause of P2 Bug)

```
┌─────────────────────────────────────────────────────────────────┐
│                    PATTERN SOURCES                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. PatternRegistry.ts          2. Recipe Renderer               │
│     (Static .php files)            (Inline block markup)         │
│                                                                  │
│  ┌──────────────────────┐      ┌──────────────────────┐         │
│  │ general-testimonials │      │ getSocialProofSection │         │
│  │ -columns.php         │      │ () in social-proof.ts │         │
│  │                      │      │                       │         │
│  │ Copied from Tove     │      │ Generated inline      │         │
│  │ base theme           │      │ block markup          │         │
│  └──────────┬───────────┘      └───────────┬───────────┘         │
│             │                              │                     │
│             ▼                              ▼                     │
│  ┌──────────────────────┐      ┌───────────────────────┐        │
│  │ patterns/ folder     │      │ templates/front-page  │        │
│  │ in generated theme   │      │ .html (inline content)│        │
│  └──────────────────────┘      └───────────────────────┘        │
│                                                                  │
│  CONFLICT: Both systems producing testimonials content!          │
│  Static pattern file presence can confuse Site Editor            │
└─────────────────────────────────────────────────────────────────┘
```

### Resolution Pattern

**Rule:** If a section is rendered inline by the recipe system, do NOT register a static pattern file for that section in PatternRegistry.

**Implementation:**
1. Remove conflicting pattern registrations from `PatternRegistry.ts`
2. Add cleanup function in `PatternInjector.ts` to remove legacy files
3. Call cleanup from both `injectRecipe()` and `injectHeavyMode()`

### Pattern vs Inline Content Decision Tree

```
Is the section rendered by recipe renderer?
    ├── YES → Do NOT register static pattern
    │         Content is embedded inline in templates/*.html
    │
    └── NO  → Register in PatternRegistry
              Content referenced via <!-- wp:pattern {"slug":"..."} -->
```

---

## WordPress FSE Block Grammar Rules

### Critical Rules (Violations Cause "Attempt Recovery")

#### 1. Block Comment JSON Must Match Rendered HTML

```html
<!-- WRONG: JSON says backgroundColor but div doesn't have class -->
<!-- wp:group {"backgroundColor":"base"} -->
<div class="wp-block-group">

<!-- CORRECT: JSON and HTML match -->
<!-- wp:group {"backgroundColor":"base"} -->
<div class="wp-block-group has-base-background-color has-background">
```

#### 2. Styles Cannot Go Directly on wp:column

```html
<!-- WRONG: Padding/background on column triggers recovery -->
<!-- wp:column {"style":{"spacing":{"padding":{"top":"20px"}}}} -->
<div class="wp-block-column" style="padding-top:20px">

<!-- CORRECT: Wrap content in wp:group for styling -->
<!-- wp:column -->
<div class="wp-block-column">
    <!-- wp:group {"style":{"spacing":{"padding":{"top":"20px"}}}} -->
    <div class="wp-block-group" style="padding-top:20px">
        ...content...
    </div>
    <!-- /wp:group -->
</div>
<!-- /wp:column -->
```

#### 3. Layout Classes Must Be Present

```html
<!-- WRONG: Missing is-layout-* class -->
<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group">

<!-- CORRECT: Layout class matches JSON -->
<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group is-layout-constrained">
```

#### 4. Required Class Mappings

| JSON Attribute | Required HTML Class(es) |
|----------------|------------------------|
| `"backgroundColor":"base"` | `has-base-background-color has-background` |
| `"textColor":"contrast"` | `has-contrast-color has-text-color` |
| `"layout":{"type":"constrained"}` | `is-layout-constrained` |
| `"layout":{"type":"flex"}` | `is-layout-flex` |
| `"align":"wide"` | `alignwide` |
| `"align":"full"` | `alignfull` |

### Block Nesting Rules

```
wp:columns
    └── wp:column (NO styles here!)
            └── wp:group (styles go here)
                    └── content blocks

wp:group (with layout)
    └── wp:group (nested for flex items)
            └── content
```

---

## Content Sanitization & Encoding

### The Double-Encoding Problem (Root Cause of P3 Bug)

```
Original:        Luigi's Pizza
                      ↓
sanitize.ts:     Luigi&#39;s Pizza     (' → &#39;)
                      ↓
PHP Escaper:     Luigi&amp;#39;s Pizza  (& → &amp;)
                      ↓
Browser shows:   Luigi&#39;s Pizza     (wrong!)
```

### Encoding Rules

| Character | In Block Content | In PHP Strings | In JSON |
|-----------|------------------|----------------|---------|
| `'` (apostrophe) | Keep as-is | Escape as `\'` | Keep as-is |
| `"` (quote) | Keep as-is | Escape as `\"` | Escape as `\"` |
| `&` | Keep as-is | Keep as-is | Keep as-is |
| `<` | Encode as `&lt;` only if not HTML | Keep as-is | Keep as-is |
| `>` | Encode as `&gt;` only if not HTML | Keep as-is | Keep as-is |

### Safe Characters in WordPress Block Content

Apostrophes and quotes are **safe** in block content — WordPress block grammar handles them correctly. Do NOT HTML-entity encode them.

**sanitize.ts should NOT:**
- Convert `'` → `&#39;`
- Convert `"` → `&quot;`

**PHP escaping (for functions.php, etc.) DOES:**
- Convert `'` → `\'` (for single-quoted strings)
- This is correct and expected

---

## Recipe System Flow

### Section Type to Function Mapping

```typescript
// In src/generator/recipes/renderer.ts

// Template entries (line ~132)
const SECTION_TEMPLATE_HANDLERS = {
    'testimonials': (_section, ctx) => getSocialProofSection(ctx.content, ctx.industry),
    'saas-testimonials': () => '',  // Handled elsewhere
    // ...
}

// Pattern content (line ~246)
const SECTION_PATTERN_HANDLERS = {
    'testimonials': (ctx) => getSocialProofSectionWithContext(ctx),
    'saas-testimonials': (ctx) => getSaasTestimonialsSectionWithContext(ctx),
    // ...
}
```

### Recipe Definition Structure

```typescript
// Example: src/generator/recipes/restaurant/classic-bistro.ts
{
    sections: [
        { type: 'hero', id: 'hero-main', heroLayout: 'full-bleed' },
        { type: 'menu-preview', id: 'menu-section' },
        { type: 'testimonials', id: 'testimonials-customers' },  // Maps to getSocialProofSection
        { type: 'reservation', id: 'reservation-cta' },
    ]
}
```

### Vertical-Specific Testimonial Types

| Vertical | Section Type | Handler Function |
|----------|--------------|------------------|
| Restaurant | `testimonials` | `getSocialProofSection()` |
| SaaS | `saas-testimonials` | `getSaasTestimonialsSectionWithContext()` |
| Portfolio | `portfolio-testimonials` | `getPortfolioTestimonialsSectionWithContext()` |
| Local Service | `local-testimonials` | `getLocalTestimonialsSectionWithContext()` |
| E-commerce | `ecommerce-testimonials` | `getEcommerceTestimonialsSectionWithContext()` |

---

## Common Issues & Root Causes

### Issue: "Attempt Recovery" in Site Editor

| Symptom | Likely Cause | Solution |
|---------|--------------|----------|
| All blocks in a section broken | Block comment JSON doesn't match HTML | Audit all attributes vs classes |
| Single block broken | Missing layout class | Add `is-layout-constrained` or `is-layout-flex` |
| Column content broken | Styles on wp:column | Move styles to nested wp:group |
| Pattern works on frontend, breaks in editor | Static pattern file conflicts with inline content | Remove pattern from PatternRegistry |

### Issue: Encoded Characters Display Wrong

| Symptom | Cause | Solution |
|---------|-------|----------|
| `&amp;#39;` shows as `&#39;` | Double encoding | Remove HTML entity encoding from sanitizer |
| `\'` in content | PHP escaping leaked to output | Check template string boundaries |
| `&lt;br&gt;` instead of line break | Over-sanitization | Whitelist safe HTML in sanitizer |

### Issue: Wrong Section Rendered

| Symptom | Cause | Solution |
|---------|-------|----------|
| Tove default instead of custom | PatternRegistry copying base theme file | Remove from registry, use recipe renderer |
| Empty section | Handler returns `''` | Implement the handler function |
| Wrong vertical's section | Type name collision | Use vertical-prefixed type names |

---

## Debugging Playbook

### Step 1: Verify Deployed Code

```bash
# Find container
docker ps --format "{{.Names}}" | grep -v coolify | grep -v redis | grep -v mysql

# Check if your code is actually deployed
docker exec CONTAINER_NAME grep -r "YOUR_UNIQUE_STRING" /app/src/

# If not found, trigger redeploy in Coolify
```

### Step 2: Inspect Generated Output

```bash
# Download the generated theme ZIP
# Extract and examine:

# 1. Check patterns folder
ls -la patterns/

# 2. Look for conflicting files
cat patterns/general-testimonials-columns.php  # Should NOT exist for restaurant

# 3. Check front-page template
cat templates/front-page.html | grep -A 50 "testimonial\|Customers Say"

# 4. Check for encoding issues
grep -r "&#39;\|&amp;" .
```

### Step 3: Trace the Generation Path

```bash
# In VS Code terminal:

# 1. Find where section type is defined
grep -rn "type: 'testimonials'" src/generator/recipes/

# 2. Find the handler
grep -rn "'testimonials':" src/generator/recipes/renderer.ts

# 3. Find the actual generator function
grep -rn "getSocialProofSection" src/generator/
```

### Step 4: Validate Block Grammar

```bash
# Extract a block from generated template and validate:

# 1. Check JSON attributes
echo '<!-- wp:group {"backgroundColor":"base"} -->' | grep -o '{.*}'

# 2. Verify HTML has matching classes
echo '<div class="wp-block-group has-base-background-color has-background">' | grep "has-base-background-color"

# 3. Check layout consistency
grep -E "(is-layout-constrained|is-layout-flex)" templates/front-page.html
```

---

## Key File Reference

### Generator Core

| File | Purpose | Key Lines |
|------|---------|-----------|
| `src/generator/index.ts` | Entry point, mode selection | Heavy mode forcing |
| `src/generator/recipes/renderer.ts` | Section type → function mapping | 132 (templates), 246 (patterns) |
| `src/generator/recipes/types.ts` | Section type definitions | 39-80 |
| `src/generator/config/PatternRegistry.ts` | Static pattern registration | ~295-330 |
| `src/generator/engine/PatternInjector.ts` | Pattern file injection & cleanup | 129, 313, 395 |

### Pattern Generators

| File | Purpose |
|------|---------|
| `src/generator/patterns/sections/social-proof.ts` | Restaurant testimonials |
| `src/generator/patterns/sections/saas-testimonials.ts` | SaaS testimonials |
| `src/generator/patterns/sections/portfolio-testimonials.ts` | Portfolio testimonials |
| `src/generator/patterns/sections/local-testimonials.ts` | Local service testimonials |
| `src/generator/patterns/sections/ecommerce-testimonials.ts` | E-commerce testimonials |

### Utilities

| File | Purpose | Critical Lines |
|------|---------|----------------|
| `src/generator/utils/sanitize.ts` | Content sanitization | 48-53 (encoding) |
| `src/generator/utils/content-loader-generator.ts` | PHP content generation | 39 (escaping) |
| `src/generator/utils/BlockHelpers.ts` | Token → CSS conversion | tokenToCSS() |

### Templates

| File | Purpose |
|------|---------|
| `src/generator/patterns/universal-home.ts` | Homepage content generator |
| `src/generator/patterns/universal-header.ts` | Header template |
| `src/generator/patterns/universal-footer.ts` | Footer template |

---

## Prevention Checklist

Before adding new patterns or sections:

- [ ] Is this section rendered inline by recipe system? → Don't register static pattern
- [ ] Does block comment JSON match all HTML classes?
- [ ] Are styles on wp:group, not wp:column?
- [ ] Is layout class present (`is-layout-constrained` or `is-layout-flex`)?
- [ ] Are apostrophes/quotes left unencoded in block content?
- [ ] Is there a handler in renderer.ts for this section type?
- [ ] Is the section type listed in types.ts?

---

## Appendix: Terminal Commands Quick Reference

```bash
# === DEPLOYMENT VERIFICATION ===
# List containers
docker ps --format "table {{.Names}}\t{{.Status}}"

# Check code in container
docker exec CONTAINER grep -r "SEARCH" /app/src/

# View container logs
docker logs CONTAINER --tail 100

# === CODE SEARCH ===
# Find pattern references
grep -rn "pattern-name" src/generator/ --include="*.ts"

# Find section type handlers
grep -rn "'section-type':" src/generator/recipes/

# Find encoding issues
grep -rn "&#39;\|&amp;\|apostrophe" src/generator/

# === BUILD & DEPLOY ===
npm run build && git add -A && git commit -m "message" && git pull --rebase && git push
```

---

*This document should be updated whenever new architectural patterns or debugging discoveries are made.*
