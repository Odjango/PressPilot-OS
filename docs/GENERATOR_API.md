# PressPilot Generator API Documentation

> **Authoritative reference for the PressPilot theme generator architecture, field mappings, and content placeholders.**

---

## 1. Architecture Overview

### The v1 → v2 Shift

| Version | Approach | Result |
|---------|----------|--------|
| **v1** | AI generates raw WordPress block markup | "Attempt Recovery" validation errors |
| **v2** | AI generates JSON content only → pre-validated patterns inject content | Zero block errors |

### Data Flow

```
Business Input → ContentBuilder → StyleEngine → PatternInjector →
ContentEngine → Templates + Parts + Patterns → ZIP
```

### Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `types.ts` | `src/generator/types.ts` | All interfaces and type definitions (including PageContent) |
| `index.ts` | `src/generator/index.ts` | Main orchestrator, entry point |
| `ContentBuilder.ts` | `src/generator/modules/` | Builds content JSON from user data, spreads all fields through |
| `ContentEngine.ts` | `src/generator/engine/` | Assembles templates, injects page-specific content |
| `PatternInjector.ts` | `src/generator/engine/` | Injects content into pattern placeholders |
| `StyleEngine.ts` | `src/generator/engine/` | Applies design tokens to theme.json |
| `ImageProvider.ts` | `src/generator/utils/` | Fetches Unsplash images (falls back to Picsum) |

---

## 2. CLI Contract

### JSON stdin Format

```json
{
  "data": {
    "name": "Business Name",
    "hero_headline": "Main Headline",
    "hero_subheadline": "Supporting tagline",
    "industry": "restaurant",
    "brandMode": "modern",
    "description": "Business description",
    "logo": "/path/to/logo.png",
    "images": ["/path/to/image1.jpg"],
    "pages": [...],
    "menus": [...],
    "email": "hello@example.com",
    "phone": "(555) 123-4567",
    "address": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "country": "USA",
    "openingHours": {
      "Monday": "9:00 AM - 6:00 PM"
    },
    "socialLinks": {
      "facebook": "https://facebook.com/example",
      "instagram": "https://instagram.com/example"
    }
  },
  "mode": "standard",
  "slug": "theme-slug",
  "outDir": "/path/to/output",
  "brandMode": "modern"
}
```

---

## 3. Field Reference Table

### ⚠️ Common Naming Mistakes

| What You Mean | ❌ Wrong | ✅ Correct |
|---------------|----------|------------|
| Business name | `businessName` | `name` |
| Hero title | `headline`, `title` | `hero_headline` |
| Hero subtitle | `tagline`, `subtitle` | `hero_subheadline` |
| Phone number | `phone` | `phone` or `phone_number` |

---

## 4. Supported Verticals

| Vertical | Industry Value | Recipes Available |
|----------|----------------|-------------------|
| Restaurant | `restaurant` | `classic-bistro`, `modern-dining`, `cafe-bakery`, etc. |
| SaaS | `saas` | `startup-landing`, `enterprise-product` |
| Portfolio | `portfolio` | `creative-professional`, `freelancer`, `talent-agency` |
| Local Service | `local-service` | `home-services`, `professional-services`, `wellness-services` |
| Ecommerce | `ecommerce` | `boutique-store`, `product-showcase`, `artisan-shop` |

---

## 5. Brand Modes

| Mode | Description |
|------|-------------|
| `modern` | Clean lines, neutral palette, professional feel |
| `playful` | Warm colors, rounded corners, friendly vibe |
| `bold` | High contrast, strong typography, impactful |
| `minimal` | Stripped back, whitespace-focused, elegant |

---

## 6. Pattern Placeholder Reference

### Universal Placeholders

| Placeholder | Description | Example Value |
|-------------|-------------|---------------|
| `{{name}}` | Business name | "Bella Vista" |
| `{{business_name}}` | Business name (alt) | "Bella Vista" |
| `{{tagline}}` | Business tagline | "Fine Italian Dining" |
| `{{description}}` | Business description | "Family-owned since 1985..." |
| `{{email}}` | Contact email | "hello@bellavista.com" |
| `{{phone}}` | Phone number | "(555) 123-4567" |
| `{{phone_number}}` | Phone number (alt) | "(555) 123-4567" |
| `{{address}}` | Street address | "123 Main Street" |
| `{{city}}` | City | "New York" |
| `{{service_area}}` | Service coverage | "Greater NYC Metro" |

### Hours Placeholders

| Placeholder | Example Value |
|-------------|---------------|
| `{{hours_monday}}` | "9:00 AM - 6:00 PM" |
| `{{hours_tuesday}}` | "9:00 AM - 6:00 PM" |
| `{{hours_wednesday}}` | "9:00 AM - 6:00 PM" |
| `{{hours_thursday}}` | "9:00 AM - 7:00 PM" |
| `{{hours_friday}}` | "9:00 AM - 7:00 PM" |
| `{{hours_saturday}}` | "10:00 AM - 4:00 PM" |
| `{{hours_sunday}}` | "Closed" |
| `{{hours_weekday}}` | "9:00 AM - 7:00 PM" |
| `{{hours_weekend}}` | "10:00 AM - 4:00 PM" |

### Social Placeholders

| Placeholder | Example Value |
|-------------|---------------|
| `{{social_facebook}}` | "https://facebook.com/bellavista" |
| `{{social_instagram}}` | "https://instagram.com/bellavista" |
| `{{social_twitter}}` | "https://x.com/bellavista" |
| `{{instagram_handle}}` | "@bellavista" |

---

## 7. Restaurant-Specific Placeholders

### Chef/Team

| Placeholder | Description |
|-------------|-------------|
| `{{chef_name_1}}` | First chef name |
| `{{chef_role_1}}` | First chef role (e.g., "Executive Chef") |
| `{{chef_bio_1}}` | First chef biography |
| `{{chef_name_2}}` | Second chef name |
| `{{chef_role_2}}` | Second chef role |
| `{{chef_bio_2}}` | Second chef biography |
| `{{chef_name_3}}` | Third chef name |
| `{{chef_role_3}}` | Third chef role |
| `{{chef_bio_3}}` | Third chef biography |

### About Page Content

| Placeholder | Description |
|-------------|-------------|
| `{{about_paragraph_1}}` | First about paragraph |
| `{{about_paragraph_2}}` | Second about paragraph |
| `{{about_paragraph_3}}` | Third about paragraph |

### Team (Alternative Format)

| Placeholder | Description |
|-------------|-------------|
| `{{team_1_name}}` | First team member name |
| `{{team_1_role}}` | First team member role |
| `{{team_1_bio}}` | First team member bio |
| `{{team_1_photo}}` | First team member photo URL |
| `{{team_2_name}}` | Second team member name |
| `{{team_2_role}}` | Second team member role |
| `{{team_2_bio}}` | Second team member bio |
| `{{team_2_photo}}` | Second team member photo URL |
| `{{team_3_name}}` | Third team member name |
| `{{team_3_role}}` | Third team member role |
| `{{team_3_bio}}` | Third team member bio |
| `{{team_3_photo}}` | Third team member photo URL |

### Menu Items - Appetizers

| Placeholder | Description |
|-------------|-------------|
| `{{appetizer_name_1}}` | First appetizer name |
| `{{appetizer_description_1}}` | First appetizer description |
| `{{appetizer_price_1}}` | First appetizer price |
| `{{appetizer_name_2}}` | Second appetizer name |
| `{{appetizer_description_2}}` | Second appetizer description |
| `{{appetizer_price_2}}` | Second appetizer price |

### Menu Items - Mains

| Placeholder | Description |
|-------------|-------------|
| `{{main_name_1}}` | First main course name |
| `{{main_description_1}}` | First main course description |
| `{{main_price_1}}` | First main course price |
| `{{main_name_2}}` | Second main course name |
| `{{main_description_2}}` | Second main course description |
| `{{main_price_2}}` | Second main course price |

### Menu Items - Desserts

| Placeholder | Description |
|-------------|-------------|
| `{{dessert_name_1}}` | First dessert name |
| `{{dessert_description_1}}` | First dessert description |
| `{{dessert_price_1}}` | First dessert price |
| `{{dessert_name_2}}` | Second dessert name |
| `{{dessert_description_2}}` | Second dessert description |
| `{{dessert_price_2}}` | Second dessert price |

### Location

| Placeholder | Description |
|-------------|-------------|
| `{{location_address}}` | Full address |
| `{{map_embed_or_link}}` | Google Maps embed/link |
| `{{parking_info}}` | Parking instructions |

---

## 8. Ecommerce-Specific Placeholders

### Products

| Placeholder | Description |
|-------------|-------------|
| `{{product_1_title}}` | First product name |
| `{{product_1_price}}` | First product price |
| `{{product_1_image}}` | First product image URL |
| `{{product_2_title}}` | Second product name |
| `{{product_2_price}}` | Second product price |
| `{{product_2_image}}` | Second product image URL |
| ... | (continues to product_6) |

### Brand Story

| Placeholder | Description |
|-------------|-------------|
| `{{store_name}}` | Store name |
| `{{brand_story}}` | Brand narrative text |
| `{{brand_story_image}}` | Brand story image URL |
| `{{brand_value_1}}` | First brand value |
| `{{brand_value_2}}` | Second brand value |
| `{{brand_value_3}}` | Third brand value |

### Sale/Promo

| Placeholder | Description |
|-------------|-------------|
| `{{sale_headline}}` | Sale banner headline |
| `{{sale_discount}}` | Discount amount (e.g., "20%") |
| `{{sale_end_date}}` | Sale end date |
| `{{featured_collection_image}}` | Featured collection image |

### Trust Badges

| Placeholder | Description |
|-------------|-------------|
| `{{guarantee_badge}}` | Guarantee text |
| `{{certification_badge}}` | Certification text |

---

## 9. Portfolio-Specific Placeholders

### Projects

| Placeholder | Description |
|-------------|-------------|
| `{{project_1_title}}` | First project title |
| `{{project_1_image}}` | First project image |
| `{{project_1_category}}` | First project category |
| `{{project_1_description}}` | First project description |
| `{{project_1_tags}}` | First project tags |
| `{{project_2_title}}` | Second project title |
| `{{project_2_image}}` | Second project image |
| ... | (continues to project_6) |

### Skills

| Placeholder | Description |
|-------------|-------------|
| `{{skill_1}}` | First skill |
| `{{skill_2}}` | Second skill |
| `{{skill_3}}` | Third skill |

### Bio

| Placeholder | Description |
|-------------|-------------|
| `{{bio}}` | Personal/professional bio |
| `{{years_in_business}}` | Years of experience |

---

## 10. Local Service-Specific Placeholders

### Trust/Credentials

| Placeholder | Description |
|-------------|-------------|
| `{{license_badge}}` | License information |
| `{{insurance_badge}}` | Insurance information |
| `{{years_in_business}}` | Years in business |

### Logos (Client/Partner)

| Placeholder | Description |
|-------------|-------------|
| `{{logo_1_name}}` | First logo/client name |
| `{{logo_2_name}}` | Second logo/client name |
| `{{logo_3_name}}` | Third logo/client name |
| `{{logo_4_name}}` | Fourth logo/client name |
| `{{logo_5_name}}` | Fifth logo/client name |

---

## 11. Pattern Files by Vertical

### Restaurant Patterns
- `restaurant-awards-press.ts`
- `restaurant-chef-highlight.ts`
- `restaurant-chef-team.ts`
- `restaurant-gallery-grid.ts`
- `restaurant-gallery.ts`
- `restaurant-hours-location.ts`
- `restaurant-location-map.ts`
- `restaurant-location.ts`
- `restaurant-menu-categories.ts`
- `restaurant-menu-preview.ts`
- `restaurant-profile.ts`
- `restaurant-promo-band.ts`
- `restaurant-reservation-form.ts`
- `restaurant-story.ts`

### SaaS Patterns
- `saas-cta-banner.ts`
- `saas-faq.ts`
- `saas-features-grid.ts`
- `saas-hero.ts`
- `saas-how-it-works.ts`
- `saas-logos.ts`
- `saas-pricing-table.ts`
- `saas-testimonials.ts`

### Portfolio Patterns
- `portfolio-about.ts`
- `portfolio-contact.ts`
- `portfolio-cta.ts`
- `portfolio-experience.ts`
- `portfolio-gallery.ts`
- `portfolio-hero.ts`
- `portfolio-project-card.ts`
- `portfolio-skills.ts`
- `portfolio-testimonials.ts`

### Ecommerce Patterns
- `ecommerce-about-brand.ts`
- `ecommerce-banner-sale.ts`
- `ecommerce-categories.ts`
- `ecommerce-category-grid.ts`
- `ecommerce-featured-products.ts`
- `ecommerce-hero.ts`
- `ecommerce-instagram.ts`
- `ecommerce-newsletter.ts`
- `ecommerce-product-grid.ts`
- `ecommerce-testimonials.ts`
- `ecommerce-trust-badges.ts`

### Local Service Patterns
- `local-about.ts`
- `local-booking-cta.ts`
- `local-faq.ts`
- `local-hero.ts`
- `local-hours.ts`
- `local-location.ts`
- `local-services-grid.ts`
- `local-team.ts`
- `local-testimonials.ts`
- `local-trust-badges.ts`

### Universal Patterns
- `faq-section.ts`
- `final-cta.ts`
- `services-grid.ts`
- `social-proof.ts`
- `value-proposition.ts`
- `universal-about.ts` — Handles chef/team content from flattened fields
- `universal-contact.ts`
- `universal-home.ts`
- `universal-menu.ts`
- `universal-reservation.ts`

---

## 12. Showcase Catalog Structure

### Location
`showcase/catalog.json`

### Theme Definition Schema

```json
{
  "id": "001",
  "slug": "bella-vista",
  "name": "Bella Vista",
  "vertical": "restaurant",
  "brandMode": "modern",
  "recipe": "classic-bistro",
  "tagline": "Culinary experiences crafted with character.",
  "tags": ["restaurant", "classic-bistro", "modern"],
  "colors": {
    "primary": "#1f2937",
    "accent": "#2563eb"
  },
  "content": {
    "name": "Bella Vista",
    "industry": "restaurant",
    "chef_name_1": "Levi Parker",
    "chef_role_1": "Executive Chef",
    "chef_bio_1": "...",
    "about_paragraph_1": "...",
    "appetizer_name_1": "Charred Octopus",
    "appetizer_price_1": "$13"
  }
}
```

### Restaurant Themes (8 total)
1. Bella Vista
2. Ember & Oak
3. The Cozy Cup
4. White Linen
5. Slate & Stone
6. Fire & Spice
7. Sunday Brunch
8. Pure Plate

---

## 13. Image Pipeline

### Environment Setup
```bash
# .env.local
UNSPLASH_ACCESS_KEY=your-key-here
```

### Loading in Scripts
```typescript
// At the TOP of showcase/scripts/generate-all.ts
import { config } from 'dotenv';
config({ path: '.env.local' });
```

### Category Keywords (ImageProvider.ts)

| Industry | Search Keywords |
|----------|-----------------|
| `restaurant` | restaurant interior, food plating, chef cooking, cafe ambiance, dining table |
| `saas` | software dashboard, team collaboration, modern office, laptop workspace, tech startup |
| `ecommerce` | online shopping, product photography, retail store, packaging, delivery |
| `portfolio` | creative workspace, design studio, architecture, art gallery, photography |
| `corporate` | corporate office, business meeting, professional team, conference room |

---

## 14. TypeScript Interfaces

### PageContent Interface

Located in `src/generator/types.ts`. This interface defines what fields can be passed to page template patterns.

```typescript
export interface PageContent {
    // Hero fields
    hero_title?: string;
    hero_sub?: string;
    hero_image?: string;
    
    // Features & Team arrays
    features?: Array<{ title: string; desc: string }>;
    team?: Array<{ name: string; role: string }>;
    menus?: RestaurantMenu[];
    
    // Contact fields (Phase 13)
    business_name?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    full_address?: string;
    social_facebook?: string;
    social_instagram?: string;
    social_twitter?: string;
    opening_hours?: Record<string, string>;
    business_type?: string;
    
    // About page fields (Phase 3 - Rich Content)
    name?: string;
    about_paragraph_1?: string;
    about_paragraph_2?: string;
    about_paragraph_3?: string;
    
    // Chef fields
    chef_name_1?: string;
    chef_role_1?: string;
    chef_bio_1?: string;
    chef_name_2?: string;
    chef_role_2?: string;
    chef_bio_2?: string;
    chef_name_3?: string;
    chef_role_3?: string;
    chef_bio_3?: string;
    
    // Team fields (alternative format)
    team_1_name?: string;
    team_1_role?: string;
    team_1_bio?: string;
    team_1_photo?: string;
    team_2_name?: string;
    team_2_role?: string;
    team_2_bio?: string;
    team_2_photo?: string;
    team_3_name?: string;
    team_3_role?: string;
    team_3_bio?: string;
    team_3_photo?: string;
}
```

### ContentJSON Interface

Located in `src/generator/modules/ContentBuilder.ts`. This is what ContentBuilder returns.

```typescript
export interface ContentJSON {
    hero: {
        headline: string;
        subheadline: string;
        pretitle: string;
        images: string[];
    };
    pages: PageData[];
    menus: RestaurantMenu[];
    slots: Record<string, string>;
    baseName: string;
    businessName: string;
    industry: string;
    heroLayout?: HeroLayout;
    [key: string]: unknown;  // Allows pass-through of all userData fields
}
```

**Important**: The `[key: string]: unknown` line enables all fields from the original user data to pass through ContentBuilder, which is essential for rich content to reach the patterns.

---

## 15. Content Flow (How Data Reaches Patterns)

### For Page Templates (About, Contact, Menu, etc.)

1. **Catalog** defines `content` object with all fields
2. **generate-all.ts** calls `buildData(theme)` which spreads `...content`
3. **ContentBuilder.invoke()** spreads `...safeUserData` into return object
4. **ContentEngine.generatePages()** injects page-specific data:
   - For `universal-menu`: Adds `menus` array
   - For `universal-about`: Adds chef/team fields
5. **Pattern function** (e.g., `getUniversalAboutContent()`) reads fields from `content`

### Critical: ContentEngine Page-Specific Injection

Located in `src/generator/engine/ContentEngine.ts`:

```typescript
// Add menus for menu pages
if (page.template === 'universal-menu' && contentJson.menus) {
    page.content = { ...page.content, menus: contentJson.menus };
}

// Add chef/team data for about pages
if (page.template === 'universal-about') {
    const c = contentJson as Record<string, unknown>;
    page.content = {
        ...page.content,
        business_name: String(c.business_name || c.name || ''),
        name: String(c.name || ''),
        about_paragraph_1: String(c.about_paragraph_1 || ''),
        about_paragraph_2: String(c.about_paragraph_2 || ''),
        about_paragraph_3: String(c.about_paragraph_3 || ''),
        chef_name_1: String(c.chef_name_1 || ''),
        chef_role_1: String(c.chef_role_1 || ''),
        chef_bio_1: String(c.chef_bio_1 || ''),
        chef_name_2: String(c.chef_name_2 || ''),
        chef_role_2: String(c.chef_role_2 || ''),
        chef_bio_2: String(c.chef_bio_2 || ''),
        chef_name_3: String(c.chef_name_3 || ''),
        chef_role_3: String(c.chef_role_3 || ''),
        chef_bio_3: String(c.chef_bio_3 || ''),
        team_1_name: String(c.team_1_name || ''),
        team_1_role: String(c.team_1_role || ''),
        team_1_bio: String(c.team_1_bio || ''),
        team_1_photo: String(c.team_1_photo || ''),
        team_2_name: String(c.team_2_name || ''),
        team_2_role: String(c.team_2_role || ''),
        team_2_bio: String(c.team_2_bio || ''),
        team_2_photo: String(c.team_2_photo || ''),
        team_3_name: String(c.team_3_name || ''),
        team_3_role: String(c.team_3_role || ''),
        team_3_bio: String(c.team_3_bio || ''),
        team_3_photo: String(c.team_3_photo || ''),
    };
}
```

---

## 16. Troubleshooting

| Error | Cause | Solution |
|-------|-------|----------|
| "Missing Business Name" | Using `businessName` instead of `name` | Use `name` field |
| Generic "Welcome" text | `front-page.html` not synced | Generator now copies `home.html` to `front-page.html` |
| "Attempt Recovery" | Invalid block markup | Check pattern closing tags |
| Recipe not found | Wrong vertical/industry string | Check vertical detection in index.ts |
| Picsum fallback images | Unsplash key not loaded | Add `config({ path: '.env.local' })` to script |
| Chef names not showing | ContentEngine not injecting data | Check `universal-about` handling in ContentEngine |
| About page generic text | Pattern not reading content fields | Check `universal-about.ts` reads from `content` param |
| TypeScript error on new field | Field not in PageContent interface | Add field to `PageContent` in `types.ts` |

---

## 17. Quick Start Examples

### Generate a Restaurant Theme
```bash
echo '{"data":{"name":"Bella Trattoria","hero_headline":"Authentic Italian Cuisine","hero_subheadline":"Family recipes since 1985","industry":"restaurant","brandMode":"modern"},"mode":"standard","slug":"bella","outDir":"/tmp/bella"}' | npx tsx bin/generate.ts
```

### Generate a SaaS Theme
```bash
echo '{"data":{"name":"CloudFlow","hero_headline":"Streamline Your Workflow","hero_subheadline":"The modern way to manage projects","industry":"saas","brandMode":"modern"},"mode":"standard","slug":"cloudflow","outDir":"/tmp/cloudflow"}' | npx tsx bin/generate.ts
```

### Generate Showcase Themes
```bash
# Generate all 52 themes
npx tsx showcase/scripts/generate-all.ts

# Generate just 1 theme (for testing)
npx tsx showcase/scripts/generate-all.ts --limit 1
```

---

## 18. File Locations Summary

| Purpose | Path |
|---------|------|
| Type definitions | `src/generator/types.ts` |
| Main entry point | `src/generator/index.ts` |
| Content builder | `src/generator/modules/ContentBuilder.ts` |
| Content engine | `src/generator/engine/ContentEngine.ts` |
| Pattern injector | `src/generator/engine/PatternInjector.ts` |
| Style engine | `src/generator/engine/StyleEngine.ts` |
| Image provider | `src/generator/utils/ImageProvider.ts` |
| Pattern files | `src/generator/patterns/sections/*.ts` |
| Universal patterns | `src/generator/patterns/universal-*.ts` |
| Recipe files | `src/generator/recipes/{vertical}/*.ts` |
| Showcase catalog | `showcase/catalog.json` |
| Showcase generator | `showcase/scripts/generate-all.ts` |
| Generated themes | `showcase/themes/` |
| Generated ZIPs | `showcase/zips/` |

---

## 19. Recent Fixes (February 2026)

### Phase 1: Unsplash Image Pipeline
- **Issue**: Images falling back to Picsum placeholders
- **Fix**: Added `config({ path: '.env.local' })` to `showcase/scripts/generate-all.ts`
- **File**: `showcase/scripts/generate-all.ts` line 1-2

### Phase 3: About Page Rich Content
- **Issue**: About page showing generic "make software that just works" text
- **Root Cause**: `ContentBuilder` wasn't spreading original user data through
- **Fix 1**: Updated `ContentBuilder.ts` to spread `...safeUserData` in return object
- **Fix 2**: Updated `ContentEngine.ts` to inject chef/team fields for about pages
- **Fix 3**: Updated `universal-about.ts` to read flattened field format (`chef_name_1`, etc.)
- **Fix 4**: Added chef/team fields to `PageContent` interface in `types.ts` for TypeScript support
- **Files Modified**:
  - `src/generator/types.ts` — Added chef/team fields to PageContent interface
  - `src/generator/modules/ContentBuilder.ts` — Added `[key: string]: unknown` and spread userData
  - `src/generator/engine/ContentEngine.ts` — Added about page data injection with type casting
  - `src/generator/patterns/universal-about.ts` — Updated to read flattened fields

---

## 20. Adding New Content Fields (Future Reference)

When adding new fields that need to flow to patterns:

1. **Add to `PageContent`** in `src/generator/types.ts`
2. **Add injection logic** in `ContentEngine.generatePages()` for the relevant template
3. **Update the pattern** to read the new field from `content`
4. **Add to catalog** in `showcase/catalog.json` for showcase themes

### Example: Adding a new field `specialty_dish`

**Step 1**: Add to `PageContent` in `types.ts`:
```typescript
export interface PageContent {
    // ... existing fields
    specialty_dish?: string;
}
```

**Step 2**: Add injection in `ContentEngine.ts`:
```typescript
if (page.template === 'universal-about') {
    const c = contentJson as Record<string, unknown>;
    page.content = {
        ...page.content,
        specialty_dish: String(c.specialty_dish || ''),
        // ... other fields
    };
}
```

**Step 3**: Use in pattern (`universal-about.ts`):
```typescript
const specialty = content.specialty_dish || 'Our signature creation';
```

**Step 4**: Add to catalog theme:
```json
{
  "content": {
    "specialty_dish": "Wood-fired Margherita Pizza"
  }
}
```

---

*Last updated: February 13, 2026*
