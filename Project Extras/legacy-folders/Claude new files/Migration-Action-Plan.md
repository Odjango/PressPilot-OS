# PressPilot Migration Action Plan
## Based on Antigravity Audit (2026-01-29)

---

## 🎯 Summary: What's Wrong & How to Fix It

| Issue | Root Cause | Fix | Effort |
|-------|------------|-----|--------|
| "Attempt Recovery" errors | JSON syntax from string templates | Use `JSON.stringify()` via `renderBlock()` | 4h |
| Unstable social icons | Using `wp:html` block | Switch to `core/social-links` | 2h |
| Limited FSE features | theme.json v2 | Upgrade to v3 | 2h |

**Total estimated fix time: 1-2 days**

---

## 📋 Step-by-Step Migration

### STEP 1: Add the Safe Block Generator (TODAY - 30 min)

1. **Copy `block-generator.ts` to your project:**
   ```
   src/generator/
   └── utils/
       └── block-generator.ts  ← ADD THIS FILE
   ```

2. **The file provides:**
   - `renderBlock()` - Safe JSON serialization
   - `renderGroup()`, `renderCover()`, `renderColumns()` - Common patterns
   - `renderSocialLinks()` - Replaces `wp:html` social icons
   - `escapeHtml()` - Sanitizes user content
   - `validateBlockMarkup()` - Catches errors before ZIP

---

### STEP 2: Migrate `universal-footer.ts` (Proof of Concept - 1 hour)

**Current code (BROKEN):**
```typescript
return `
<!-- wp:group {"backgroundColor":"${colors.darkBg}"} -->
  <!-- wp:html -->
  <div class="social-icons">
    <a href="${slots.facebookUrl}"><svg>...</svg></a>
  </div>
  <!-- /wp:html -->
<!-- /wp:group -->
`;
```

**New code (SAFE):**
```typescript
import { renderGroup, renderSocialLinks, renderParagraph } from '../utils/block-generator';

export function universalFooter(colors, slots) {
  const socialLinks = [];
  if (slots.facebookUrl) socialLinks.push({ service: 'facebook', url: slots.facebookUrl });
  if (slots.instagramUrl) socialLinks.push({ service: 'instagram', url: slots.instagramUrl });

  const social = renderSocialLinks(socialLinks, { iconColor: colors.lightText });
  const copyright = renderParagraph(`© ${slots.year} ${slots.businessName}`, { align: 'center' });

  return renderGroup(`${social}\n${copyright}`, {
    backgroundColor: colors.darkBg
  });
}
```

**Test it:**
1. Generate a theme
2. Open in WordPress
3. Verify NO "Attempt Recovery" error
4. Edit footer in Site Editor - should work!

---

### STEP 3: Migrate Remaining Patterns (This Week)

| File | Priority | Status |
|------|----------|--------|
| `universal-footer.ts` | 🔴 P0 | ⬜ To Do |
| `universal-header.ts` | 🔴 P0 | ⬜ To Do |
| `universal-home.ts` | 🔴 P0 | ⬜ To Do |
| Hero patterns | 🟠 P1 | ⬜ To Do |
| Services patterns | 🟠 P1 | ⬜ To Do |
| About patterns | 🟡 P2 | ⬜ To Do |
| CTA patterns | 🟡 P2 | ⬜ To Do |
| Testimonial patterns | 🟡 P2 | ⬜ To Do |
| Contact patterns | 🟡 P2 | ⬜ To Do |

**For each file:**
1. Import block-generator helpers
2. Replace string templates with `renderBlock()` calls
3. Replace `wp:html` with proper core blocks
4. Test output in WordPress

---

### STEP 4: Upgrade theme.json to Version 3 (2 hours)

**Find your theme.json generation code** (likely in `src/generator/engine/` or similar)

**Change:**
```json
{
  "$schema": "https://schemas.wp.org/trunk/theme.json",
  "version": 2,  // ← CHANGE THIS
  ...
}
```

**To:**
```json
{
  "$schema": "https://schemas.wp.org/trunk/theme.json",
  "version": 3,  // ← NOW VERSION 3
  ...
}
```

**Benefits of v3:**
- Better layout controls
- Improved spacing system
- Shadow support
- Aspect ratio support
- Required for WordPress 6.6+ features

---

### STEP 5: Add Validation to Build Pipeline (Next Week)

**In your main generator file** (likely `src/generator/index.ts`):

```typescript
import { validateBlockMarkup } from './utils/block-generator';

// Before creating ZIP, validate all templates
function validateTheme(templates: Record<string, string>): void {
  for (const [filename, content] of Object.entries(templates)) {
    if (filename.endsWith('.html')) {
      const result = validateBlockMarkup(content);
      if (!result.valid) {
        throw new Error(`Invalid markup in ${filename}: ${result.errors.join(', ')}`);
      }
    }
  }
  console.log('✅ All templates validated successfully');
}
```

---

## 🧪 Testing Checklist

After migration, verify:

- [ ] Theme ZIP is created successfully
- [ ] Theme activates in WordPress without errors
- [ ] Site Editor opens without "Attempt Recovery"
- [ ] Header template part edits correctly
- [ ] Footer template part edits correctly
- [ ] Home template edits correctly
- [ ] All patterns are editable
- [ ] Social links work and show icons
- [ ] Colors apply correctly from theme.json
- [ ] Fonts load correctly

---

## 🚀 Quick Win: Add This to ANY Pattern Right Now

If you want to test the fix immediately without full migration:

```typescript
// At the top of ANY pattern file
function safeJson(obj: any): string {
  return JSON.stringify(obj);
}

// Replace this:
`<!-- wp:group {"backgroundColor":"${color}"} -->`

// With this:
`<!-- wp:group ${safeJson({ backgroundColor: color })} -->`
```

This one change will fix 90% of your "Attempt Recovery" errors!

---

## 📁 Files Created for You

| File | Purpose |
|------|---------|
| `block-generator.ts` | Core safe block rendering utilities |
| `pattern-refactoring-examples.ts` | Before/after examples for each pattern type |

**Copy these to your project and start migrating!**

---

## 💬 Prompt for Antigravity to Continue

Give this to Antigravity to start the actual migration:

```
Based on the audit findings, I need you to migrate the PressPilot patterns 
to use the safe block generator approach.

Here's the block-generator.ts utility:
[paste the block-generator.ts content]

Start by migrating these files in order:
1. universal-footer.ts
2. universal-header.ts  
3. universal-home.ts

For each file:
1. Show me the current code
2. Show me the migrated code using renderBlock() helpers
3. Explain what changed and why it's safer

After migration, the generated themes should open in WordPress 
WITHOUT "Attempt Recovery" errors.
```

---

*Action Plan v1.0 | Based on Audit 2026-01-29*
