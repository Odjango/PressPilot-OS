# PressPilot Pattern Library v2.0

**AI generates content → Patterns stay valid → Zero block errors**

This is the new pattern-based architecture for PressPilot, inspired by QuickWP's open-source implementation. Instead of generating raw WordPress block markup (which breaks easily), we use pre-validated patterns and only replace content via JSON.

## The Problem We Solved

### Before (v1 - Fighting WordPress)
```
User Input → AI generates block markup → WordPress rejects ❌ "Attempt Recovery"
```

Block markup is extremely sensitive. A single missing attribute, wrong nesting, or incorrect innerContent structure causes WordPress to show "This block contains unexpected or invalid content."

### After (v2 - Working WITH WordPress)
```
User Input → AI selects patterns + generates JSON content → Pattern Assembler replaces placeholders → Valid WordPress blocks ✅
```

The block structure is pre-validated and NEVER changes. AI only provides content that gets inserted into the patterns.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  1. PATTERN REGISTRY (config/pattern-registry.json)            │
│     • Defines all available patterns                           │
│     • Specifies string/image placeholders                      │
│     • Includes recommendations per business type               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. PATTERN FILES (patterns/*.php)                             │
│     • Pre-validated WordPress block markup                     │
│     • Uses presspilot_string() for text placeholders           │
│     • Uses presspilot_image() for image placeholders           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. PATTERN ASSEMBLER (class-pattern-assembler.php)            │
│     • Loads patterns and replaces placeholders                 │
│     • Assembles complete pages from pattern selections         │
│     • Generates theme.json from brand colors                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. VALID WORDPRESS THEME ✅                                   │
│     • Zero block validation errors                             │
│     • Works perfectly in Site Editor                           │
│     • Professional design quality                              │
└─────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
presspilot-patterns/
├── config/
│   └── pattern-registry.json    # All patterns and their schemas
├── patterns/
│   ├── pattern-helpers.php      # Helper functions for placeholders
│   ├── headers/
│   │   ├── header-centered.php
│   │   ├── header-split.php
│   │   └── header-minimal.php
│   ├── heroes/
│   │   ├── hero-cover.php
│   │   ├── hero-split.php
│   │   └── hero-minimal.php
│   ├── features/
│   │   └── features-grid-icons.php
│   ├── testimonials/
│   │   └── testimonials-grid.php
│   ├── cta/
│   │   └── cta-banner.php
│   ├── footers/
│   │   └── footer-standard.php
│   ├── restaurant/
│   │   └── restaurant-menu.php
│   └── ecommerce/
│       └── product-grid.php
├── templates/
│   └── theme.json.template      # Theme.json with color placeholders
├── class-pattern-assembler.php  # Core assembler class
├── example-generation.php       # Usage example
└── README.md
```

## How Patterns Work

### Pattern File Structure

Each pattern is a PHP file that outputs WordPress block markup:

```php
<?php
// patterns/heroes/hero-cover.php

$headline = presspilot_string( 'headline', 'Default Headline' );
$subheadline = presspilot_string( 'subheadline', 'Default subheadline text' );
$background = presspilot_image( 'background', 'https://placeholder.com/1920x1080' );
?>
<!-- wp:cover {"url":"<?php echo esc_url( $background ); ?>","dimRatio":60} -->
<div class="wp-block-cover">
  <h1><?php echo esc_html( $headline ); ?></h1>
  <p><?php echo esc_html( $subheadline ); ?></p>
</div>
<!-- /wp:cover -->
```

### Pattern Registry Entry

Each pattern is registered in `pattern-registry.json`:

```json
{
  "id": "hero-cover",
  "slug": "presspilot/hero-cover",
  "name": "Cover Hero",
  "category": "heroes",
  "description": "Full-width background image with centered text",
  "file": "patterns/heroes/hero-cover.php",
  "recommended_for": ["restaurant", "hotel", "event"],
  "strings": [
    {"slug": "headline", "description": "Main headline", "max_length": 60},
    {"slug": "subheadline", "description": "Supporting text", "max_length": 150}
  ],
  "images": [
    {"slug": "background", "description": "Hero background image", "size": "1920x1080"}
  ]
}
```

### AI Content Output

AI generates JSON that matches the pattern schema:

```json
{
  "hero-cover": {
    "strings": {
      "headline": "Welcome to Bella Cucina",
      "subheadline": "Authentic Italian cuisine in the heart of downtown"
    },
    "images": {
      "background": "https://images.pexels.com/photos/1640777/..."
    }
  }
}
```

## Usage

### Basic Pattern Assembly

```php
require_once 'class-pattern-assembler.php';

$assembler = new PressPilot_Pattern_Assembler();

// Assemble a single pattern
$hero = $assembler->assemble_pattern( 'hero-cover', array(
    'headline' => 'Welcome to Our Restaurant',
    'subheadline' => 'Experience authentic cuisine',
), array(
    'background' => 'https://example.com/hero.jpg',
));

echo $hero; // Valid WordPress block markup
```

### Complete Page Assembly

```php
$selections = array(
    array(
        'id' => 'header-centered',
        'strings' => array( 'site-title' => 'My Restaurant' ),
        'images' => array(),
    ),
    array(
        'id' => 'hero-cover',
        'strings' => array( ... ),
        'images' => array( ... ),
    ),
    // ... more patterns
);

$homepage = $assembler->assemble_page( $selections );
```

### Generate theme.json

```php
$colors = array(
    'primary' => '#B91C1C',
    'secondary' => '#78716C',
    'accent' => '#D97706',
    'background' => '#FFFBEB',
    'foreground' => '#1C1917',
    'tertiary' => '#FEF3C7',
);

$theme_json = $assembler->generate_theme_json( $colors );
```

## Available Patterns

### Universal (All Business Types)

| Pattern ID | Name | Category |
|------------|------|----------|
| header-centered | Centered Header | headers |
| header-split | Split Header | headers |
| header-minimal | Minimal Header | headers |
| hero-cover | Cover Hero | heroes |
| hero-split | Split Hero | heroes |
| hero-minimal | Minimal Hero | heroes |
| features-grid-icons | Features Grid with Icons | features |
| testimonials-grid | Testimonials Grid | testimonials |
| cta-banner | CTA Banner | cta |
| footer-standard | Standard Footer | footers |

### Restaurant Specific

| Pattern ID | Name | Description |
|------------|------|-------------|
| restaurant-menu | Restaurant Menu | Food menu with categories and prices |

### E-Commerce (WooCommerce)

| Pattern ID | Name | Description |
|------------|------|-------------|
| ecommerce-product-grid | Product Grid | WooCommerce product collection |

## Pre-defined Templates

Templates define which patterns to use for specific business types:

```json
{
  "restaurant": {
    "patterns": [
      "header-centered",
      "hero-cover", 
      "features-grid-icons",
      "restaurant-menu",
      "testimonials-grid",
      "cta-banner",
      "footer-standard"
    ]
  }
}
```

## Integration with n8n

1. **n8n receives user input** (business description, colors, content)
2. **n8n calls AI** to generate content JSON matching pattern schemas
3. **n8n calls PressPilot Factory Plugin** with:
   - Selected pattern IDs
   - Content JSON
   - Brand colors
4. **Factory Plugin uses Pattern Assembler** to generate theme
5. **Theme ZIP returned** with zero block errors

## Validation

Before deploying, validate themes with WordPress Playground CLI:

```bash
# Install Playground CLI
npm install -g @wp-playground/cli

# Test generated theme
cd generated-theme/
npx @wp-playground/cli server --auto-mount

# Open Site Editor and verify no "Attempt Recovery" errors
```

## Adding New Patterns

1. Create pattern PHP file in appropriate category folder
2. Use `presspilot_string()` and `presspilot_image()` for placeholders
3. Add entry to `pattern-registry.json`
4. Test in WordPress Site Editor
5. Verify no block validation errors

## Credits

Architecture inspired by:
- [QuickWP](https://github.com/Codeinwp/quickwp) by ThemeIsle
- [WordPress Agent Skills](https://github.com/WordPress/agent-skills)
- [WordPress Playground](https://wordpress.org/playground/)

## License

GPL-2.0-or-later
