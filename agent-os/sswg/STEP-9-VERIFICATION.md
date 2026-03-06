# STEP 9: End-to-End Verification

> **Depends on:** Steps 1-8 (entire pipeline must be updated)
> **Estimated effort:** 2 hours
> **Output:** 5 generated theme ZIPs, all passing quality checks

---

## WHAT YOU'RE DOING

Generating 5 test themes (one per vertical) and verifying they meet all quality criteria. This is the final validation that the entire pipeline works correctly.

## TEST DATA

Generate themes for these 5 businesses:

### 1. Restaurant
```json
{
  "name": "Bella Trattoria",
  "description": "Authentic Italian restaurant in downtown Seattle serving handmade pasta and wood-fired pizza since 1998",
  "category": "restaurant",
  "language": "English",
  "pages": ["home", "about", "menu", "contact"]
}
```

### 2. Ecommerce
```json
{
  "name": "Nordic Naturals",
  "description": "Premium organic skincare products handcrafted in small batches using Scandinavian botanicals",
  "category": "ecommerce",
  "language": "English",
  "pages": ["home", "about", "shop", "contact"]
}
```

### 3. SaaS
```json
{
  "name": "CloudMetrics Pro",
  "description": "Real-time analytics dashboard for cloud infrastructure monitoring and cost optimization",
  "category": "saas",
  "language": "English",
  "pages": ["home", "about", "pricing", "contact"]
}
```

### 4. Portfolio
```json
{
  "name": "Sarah Chen Studio",
  "description": "Award-winning graphic design studio specializing in brand identity and packaging design",
  "category": "portfolio",
  "language": "English",
  "pages": ["home", "about", "work", "contact"]
}
```

### 5. Local Service
```json
{
  "name": "Summit Plumbing Co",
  "description": "Licensed emergency plumbing and HVAC services for residential and commercial properties in Denver metro area",
  "category": "local_service",
  "language": "English",
  "pages": ["home", "about", "services", "contact"]
}
```

## DISPATCH

Use `POST /api/generate` or `php artisan` to dispatch each job. Wait for completion.

## QUALITY CHECKLIST

For EACH of the 5 generated themes, verify ALL of the following:

### File Structure
- [ ] ZIP contains `style.css` with valid header
- [ ] ZIP contains `theme.json` with valid JSON
- [ ] ZIP contains `functions.php`
- [ ] ZIP contains `index.php`
- [ ] ZIP contains `templates/front-page.html`
- [ ] ZIP contains `templates/page-about.html`
- [ ] ZIP contains `templates/page-services.html` or equivalent
- [ ] ZIP contains `templates/page-contact.html`
- [ ] ZIP contains `templates/page.html`, `single.html`, `404.html`, `index.html`
- [ ] ZIP contains `parts/header.html`
- [ ] ZIP contains `parts/footer.html`
- [ ] `theme.json` contains `customTemplates` array

### Content Quality
- [ ] `grep -r 'Ollie' .` returns ZERO matches
- [ ] `grep -r '{{' .` returns ZERO matches (no unresolved tokens)
- [ ] `grep -r 'Lorem ipsum' .` returns ZERO matches
- [ ] `grep -r 'starter' .` returns ZERO matches (no "starter theme" references)
- [ ] All headings, paragraphs, and text are specific to the business name
- [ ] Restaurant theme has menu items with prices
- [ ] SaaS theme has pricing tiers
- [ ] Portfolio theme has process steps

### Footer
- [ ] `parts/footer.html` contains "PressPilot"
- [ ] `parts/footer.html` contains "Quick Links"
- [ ] `parts/footer.html` contains "Get In Touch"
- [ ] `parts/footer.html` contains the business name in copyright
- [ ] Footer does NOT contain any Ollie content

### Block Markup
- [ ] All `<!-- wp:` blocks have matching `<!-- /wp:` (or self-closing)
- [ ] All block attribute JSON is valid (run through JSON parser)
- [ ] Cover blocks have `url` attribute with actual image URL (not empty)
- [ ] No remaining PHP tags in any HTML file

### WordPress Installation Test (if Local WP available)
- [ ] Theme installs without errors
- [ ] Theme activates without errors
- [ ] Site Editor opens without "Attempt Recovery" errors
- [ ] Hero image renders on frontend
- [ ] All pages show content (not just header+footer)
- [ ] Footer shows 3-column PressPilot design

## SUCCESS CRITERIA

ALL 5 themes pass ALL checks = Phase 2.7 is COMPLETE.

Any failures should be logged with the specific skeleton file, token, or service that caused the issue, then fixed and re-tested.
