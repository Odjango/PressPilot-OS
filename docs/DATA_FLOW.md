# PressPilot Generator Data Flow Architecture

**Last Updated:** 2026-02-02
**Phase:** 14 - Restaurant Theme Fixes

---

## Overview

This document describes how user data flows from the Studio UI through the generator pipeline to final theme output.

## Data Flow Pipeline

```
┌─────────────────────┐
│   Studio UI         │  User inputs business name, contact, branding
│   (StudioClient.tsx)│
└─────────┬───────────┘
          │ studioInput()
          ▼
┌─────────────────────┐
│   StudioFormInput   │  TypeScript interface in studioAdapter.ts
│                     │
└─────────┬───────────┘
          │ buildSaaSInputFromStudioInput()
          ▼
┌─────────────────────┐
│  PressPilotSaaSInput│  API-ready format in types/presspilot.ts
│                     │
└─────────┬───────────┘
          │ transformSaaSInputToGeneratorData()
          ▼
┌─────────────────────┐
│   GeneratorData     │  Internal generator format in src/generator/types.ts
│                     │
└─────────┬───────────┘
          │ ContentBuilder.invoke()
          ▼
┌─────────────────────┐
│   ContentJSON       │  Slots dictionary + page content
│   (slots, pages)    │
└─────────┬───────────┘
          │ PatternInjector methods
          ▼
┌─────────────────────┐
│   Final Theme       │  WordPress FSE theme files
│   (.html, .php)     │
└─────────────────────┘
```

---

## Key Interfaces

### StudioFormInput (lib/presspilot/studioAdapter.ts)

The UI-facing interface containing all form field values:

```typescript
interface StudioFormInput {
    // Core business info
    businessName: string;
    tagline: string;
    shortDescription: string;
    industry: string;
    category: string;

    // Contact fields (Phase 13 addition)
    contactEmail?: string;
    contactPhone?: string;
    contactAddress?: string;
    contactCity?: string;
    contactState?: string;
    contactZip?: string;
    contactCountry?: string;
    openingHours?: Record<string, string>;
    socialLinks?: {
        facebook?: string;
        instagram?: string;
        twitter?: string;
        linkedin?: string;
        youtube?: string;
        tiktok?: string;
    };

    // Visual controls
    heroLayout?: TT4HeroLayout;
    brandStyle?: TT4BrandStyle;
    // ... other visual settings
}
```

### PressPilotSaaSInput (types/presspilot.ts)

The API contract format:

```typescript
interface PressPilotSaaSInput {
    businessName: string;
    businessDescription: string;

    // Contact section (Phase 13 addition)
    contact?: {
        email?: string;
        phone?: string;
        address?: string;
        city?: string;
        state?: string;
        zip?: string;
        country?: string;
        openingHours?: Record<string, string>;
        socialLinks?: Record<string, string>;
    };

    visualControls?: {
        heroLayout?: string;
        brandStyle?: string;
        // ...
    };
}
```

### GeneratorData (src/generator/types.ts)

The internal generator format with flattened fields:

```typescript
interface GeneratorData {
    name: string;
    tagline: string;
    industry?: string;

    // Contact fields (flattened)
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    neighborhood?: string;
    openingHours?: Record<string, string>;
    socialLinks?: Record<string, string>;

    // Layout options
    heroLayout?: HeroLayout;
    brandStyle?: BrandStyle;
}
```

---

## Content Injection System

### Slot-Based Injection (Primary)

ContentBuilder creates a `slots` dictionary with `{{PLACEHOLDER}}` format:

```typescript
// src/generator/modules/ContentBuilder.ts

slots['{{BUSINESS_NAME}}'] = userData.name;
slots['{{CONTACT_EMAIL}}'] = userData.email || '';
slots['{{CONTACT_PHONE}}'] = userData.phone || '';
slots['{{CONTACT_ADDRESS}}'] = userData.address || '';
slots['{{CONTACT_CITY}}'] = userData.city || '';
slots['{{CONTACT_FULL_ADDRESS}}'] = addressParts.join(', ');
slots['{{SOCIAL_FACEBOOK}}'] = userData.socialLinks?.facebook || '#';
slots['{{SOCIAL_INSTAGRAM}}'] = userData.socialLinks?.instagram || '#';
```

PatternInjector applies these via `applySlotReplacements()`:

```typescript
// src/generator/engine/PatternInjector.ts

private applySlotReplacements(content: string, slots: Record<string, string>): string {
    for (const [search, replace] of Object.entries(slots)) {
        const regex = new RegExp(escapedSearch, 'g');
        content = content.replace(regex, replace);
    }
    return content;
}
```

### Legacy Replacement (Compatibility Layer)

For base themes with hardcoded demo content (Frost, Tove, TT4):

```typescript
// src/generator/engine/PatternInjector.ts

const LEGACY_DEMO_CONTENT = {
    frost: {
        replacements: [
            { pattern: /Build with Frost/g, key: 'name', fallback: 'Our Services' },
            { pattern: /Allison Taylor, Designer/g, fallback: 'Sarah M., Regular Guest' },
            { pattern: /Anthony Breck, Developer/g, fallback: 'Michael T., Satisfied Customer' },
            { pattern: /Rebecca Jones, Coach/g, fallback: 'Jennifer L., Happy Diner' },
            // Also handles names without titles for testimonials-image patterns
            { pattern: /Allison Taylor/g, fallback: 'Sarah M.' },
            // ...
        ]
    },
    tove: {
        replacements: [
            { pattern: /Niofika Café/g, key: 'name', fallback: 'Our Business' },
            { pattern: /Hammarby Kaj 10/g, key: 'address', fallback: '123 Main Street' },
            // ...
        ]
    },
    tt4: {
        replacements: [
            { pattern: /Études/g, key: 'name', fallback: 'PressPilot' }
        ]
    }
};
```

### Pattern Cleaning (Phase 14 Addition)

After chassis loading, ALL base theme patterns are sanitized:

```typescript
// Called in src/generator/index.ts after chassis.load()

await patternInjector.cleanAllPatterns(themeDir, userData);

// This method:
// 1. Reads all .php and .html files in patterns/
// 2. Applies ALL legacy replacements (Frost, Tove, TT4)
// 3. Writes back cleaned content
// 4. Logs count of cleaned files
```

This ensures patterns in the WordPress pattern library don't contain marketing content.

### Restaurant Testimonials Conflict Prevention (Current Behavior)

- Restaurant/cafe homepages are assembled inline via `getUniversalHomeContent()` and the recipe renderer, not via a `wp:pattern` testimonial reference.
- The recipe section type `testimonials` maps to social proof section rendering (`getSocialProofSection()` / `getSocialProofSectionWithContext()`) in `src/generator/patterns/sections/social-proof.ts`.
- To prevent static-vs-inline conflicts, `PatternInjector` removes `patterns/general-testimonials-columns.php` for restaurant/cafe outputs before template assembly.
- `PatternRegistry` restaurant configuration must not include legacy testimonial patterns that compete with recipe-rendered testimonials.

---

## Sanitization & Escaping Notes

- `sanitizeForPHP()` still escapes `&`, `<`, `>`, and `"` to prevent unsafe HTML/PHP embedding.
- Apostrophes (`'`) are intentionally **not** HTML-entity encoded in sanitizer anymore.
- Safe characters in WordPress block content include apostrophes and normal quote characters when emitted through valid block grammar/serialization.
- Reason: apostrophes are safely handled later by PHP string escaping (`PhpEscaper.escapeSingleQuoted()`), and pre-encoding them caused double-encoding in output (`&amp;#39;`).
- Result: business names like `Luigi's Pizza` now render as expected in generated themes.

---

## Pattern Files Using Slots

### universal-contact.ts

```html
<p>Email: <a href="mailto:{{CONTACT_EMAIL}}">{{CONTACT_EMAIL}}</a></p>
<p>Phone: {{CONTACT_PHONE}}</p>
<p>{{CONTACT_ADDRESS}}<br>{{CONTACT_CITY}}, {{CONTACT_STATE}} {{CONTACT_ZIP}}</p>
```

### universal-footer.ts

```html
<!-- wp:social-link {"url":"{{SOCIAL_FACEBOOK}}","service":"facebook"} /-->
<!-- wp:social-link {"url":"{{SOCIAL_INSTAGRAM}}","service":"instagram"} /-->
```

---

## Quality Gate: ContentValidator

Post-generation validation prevents demo content from shipping:

```typescript
// src/generator/utils/ContentValidator.ts

const FORBIDDEN_STRINGS = [
    'Niofika Café', 'Niofika', 'hammarby@niofika.se',
    'Études', 'contact@presspilot.com', '123 Innovation Dr',
    // ...
];

// Fails if any forbidden string found in output
ContentValidator.validateContent(themeContent, filename);
```

---

## Restaurant brandStyle Routing

For restaurant vertical, `brandStyle` determines base theme:

```typescript
// src/generator/modules/ThemeSelector.ts

if (vertical === 'restaurant') {
    const brandStyle = data.brandStyle || 'playful';
    if (brandStyle === 'modern') {
        targetBase = 'frost';  // Clean, photo-driven
    } else {
        targetBase = 'tove';   // Warm, colorful
    }
}
```

---

## Testing Data Flow

Run the data flow tests:

```bash
npm test -- --grep "Data Flow"
```

Tests verify:
1. StudioFormInput → PressPilotSaaSInput transformation
2. PressPilotSaaSInput → GeneratorData transformation
3. Contact fields flow end-to-end
4. Social links flow correctly
5. Edge cases (empty strings, special characters)

---

## Adding New Fields

To add a new user data field:

1. **Add to StudioFormInput** (lib/presspilot/studioAdapter.ts)
2. **Add to PressPilotSaaSInput** (types/presspilot.ts)
3. **Add to GeneratorData** (src/generator/types.ts)
4. **Wire in buildSaaSInputFromStudioInput()** (studioAdapter.ts)
5. **Wire in transformSaaSInputToGeneratorData()** (dataTransformer.ts)
6. **Create slot in ContentBuilder** (ContentBuilder.ts)
7. **Use slot in patterns** (universal-*.ts files)
8. **Add to FORBIDDEN_STRINGS if it replaces demo content** (ContentValidator.ts)
9. **Add tests** (tests/unit/data-flow.test.ts)

---

## File Reference

| File | Purpose |
|------|---------|
| `lib/presspilot/studioAdapter.ts` | StudioFormInput interface, UI→API transform |
| `types/presspilot.ts` | PressPilotSaaSInput API contract |
| `src/generator/types.ts` | GeneratorData internal interface |
| `lib/presspilot/dataTransformer.ts` | API→Generator transform |
| `src/generator/modules/ContentBuilder.ts` | Creates slots dictionary |
| `src/generator/engine/PatternInjector.ts` | Applies slots + legacy replacements |
| `src/generator/utils/ContentValidator.ts` | Quality gate for forbidden content |
| `tests/unit/data-flow.test.ts` | Integration tests |
