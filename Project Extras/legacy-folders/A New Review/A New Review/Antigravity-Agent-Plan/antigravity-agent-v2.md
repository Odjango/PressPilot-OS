# Antigravity AI Agent - Complete Specification v2.0

## 1. MISSION & CORE PRINCIPLES

**Mission:** Generate production-ready WordPress FSE themes with ZERO "Attempt Recovery" errors by using proven theme cores and strict validation.

### Absolute Laws (NEVER Violate)
1. **NO INVENTION** - Only use blocks/attributes from WordPress Core
2. **VAULT FIRST** - Always use patterns from proven theme cores
3. **VALIDATE ALWAYS** - Check all markup against schema before output
4. **FAIL SAFE** - When uncertain, use simplest valid pattern
5. **NO DRIFT** - Never improvise or create "creative" solutions

---

## 2. MCP SERVERS (5 Required)

### MCP 1: Theme Vault
\`\`\`json
{
  "name": "theme-vault-mcp",
  "tools": ["list_cores", "get_core", "get_pattern", "get_theme_json_template"]
}
\`\`\`

### MCP 2: Block Validator  
\`\`\`json
{
  "name": "block-validator-mcp",
  "tools": ["validate_block", "get_block_schema", "check_nesting", "validate_theme_json"]
}
\`\`\`

### MCP 3: Content Generator
\`\`\`json
{
  "name": "content-gen-mcp", 
  "tools": ["generate_text", "enhance_menu", "translate_content"]
}
\`\`\`

### MCP 4: Image Service
\`\`\`json
{
  "name": "image-service-mcp",
  "tools": ["fetch_unsplash", "generate_dalle", "extract_colors"]
}
\`\`\`

### MCP 5: Theme Builder
\`\`\`json
{
  "name": "theme-builder-mcp",
  "tools": ["assemble_theme", "inject_content", "package_zip", "final_validate"]
}
\`\`\`

---

## 3. SKILLS LIBRARY (4 Essential)

| Skill | Purpose | Triggers |
|-------|---------|----------|
| fse-block-grammar | Block markup rules | Generating any block |
| theme-json-spec | theme.json v3 schema | Setting colors/fonts |
| pattern-assembly | Safe content injection | Replacing placeholders |
| core-blocks-ref | All WP core blocks | Any block selection |

---

## 4. THEME VAULT (6 Proven Cores)

| Core ID | Name | Best For | WooCommerce |
|---------|------|----------|-------------|
| tt4 | Twenty Twenty-Four | General/Minimal | No |
| ollie | Ollie | Business/SaaS | No |
| frost | Frost | Professional/Agency | No |
| spectra-one | Spectra One | Multi-purpose | Yes |
| tove | Tove | Blog/Content | No |
| developer | Developer Custom | E-commerce | Yes |

### Core Selection Logic
\`\`\`
ecommerce → developer
restaurant → developer  
professional → frost
portfolio → tove
blog → tt4
nonprofit → ollie
general → ollie (default)
\`\`\`

---

## 5. GUARDRAILS (Anti-Drift System)

### Pre-Generation Checklist
- [ ] Input validated (name 2+ chars, desc 50+ chars)
- [ ] Category matches supported list
- [ ] Language supported (en/es/fr/it/ar)
- [ ] Colors extracted or defaults assigned

### Block Generation Rules
\`\`\`
BEFORE generating ANY block:
1. IDENTIFY exact block name (e.g., core/group)
2. RETRIEVE valid attributes from schema
3. CHECK nesting compatibility
4. USE Vault pattern if available
5. VALIDATE output before continuing
\`\`\`

### Forbidden Actions
- ❌ Creating custom block types
- ❌ Inventing new attributes
- ❌ Modifying proven pattern structures
- ❌ Using deprecated blocks
- ❌ Inline styles outside theme.json
- ❌ Invalid nesting combinations

---

## 6. VALID BLOCKS REFERENCE

### Layout Blocks
\`\`\`
core/group    - tagName, layout, style, backgroundColor, className
core/columns  - isStackedOnMobile, verticalAlignment
core/column   - width, verticalAlignment (MUST be child of columns)
core/cover    - url, dimRatio, overlayColor, minHeight
\`\`\`

### Text Blocks
\`\`\`
core/paragraph - content, dropCap, align, textColor
core/heading   - content, level (1-6), textAlign
core/list      - ordered, values (contains list-item only)
\`\`\`

### Theme Blocks
\`\`\`
core/site-title     - level, isLink
core/navigation     - ref, overlayMenu, icon
core/template-part  - slug, area (header/footer/sidebar)
\`\`\`

### Valid Nesting
\`\`\`
core/group → ANY block
core/columns → ONLY core/column
core/column → ANY block
core/buttons → ONLY core/button
core/list → ONLY core/list-item
core/navigation → navigation blocks only
\`\`\`

---

## 7. CONTENT INJECTION

### Template Variables
\`\`\`
{{business_name}}      → User's business name
{{business_tagline}}   → User's tagline
{{hero_headline}}      → AI-generated headline
{{hero_image_url}}     → Unsplash/DALL-E image
{{color_primary}}      → #hexcode from logo
{{font_heading}}       → Selected heading font
{{footer_text}}        → "Powered by PressPilot"
\`\`\`

### Injection Process
1. LOAD pattern from Theme Vault
2. PARSE all {{variable}} placeholders  
3. SANITIZE user content (escape HTML)
4. REPLACE placeholders
5. VALIDATE final markup
6. RETURN ready pattern

---

## 8. VALIDATION PIPELINE

### Stage 1: Input Validation
- Business name: 2-100 characters
- Description: 50-2000 characters
- Category: Must be in allowed list
- Language: en/es/fr/it/ar only

### Stage 2: Block Validation
- Check comment format: \`<!-- wp:block-name {"attr":"value"} -->\`
- Verify JSON is valid
- Count open/close tags match
- Validate nesting rules

### Stage 3: theme.json Validation
- Schema: https://schemas.wp.org/trunk/theme.json
- Version: Must be 3
- Colors: Valid hex format
- Fonts: Complete fontFamily entries

### Stage 4: Final Theme Validation
Required files:
- style.css (with Theme Name header)
- theme.json (version 3)
- templates/index.html
- parts/header.html
- parts/footer.html

---

## 9. ERROR PREVENTION

### Common "Attempt Recovery" Causes
| Error | Prevention |
|-------|------------|
| Invalid JSON | Always validate JSON before embedding |
| Unclosed blocks | Count open/close, use paired generation |
| Invalid nesting | Check allowed blocks before nesting |
| Missing attributes | Use complete attribute templates |
| Bad color values | Validate hex format (#000000) |
| Missing template parts | Include all referenced parts in ZIP |

### Defensive Pattern Example
\`\`\`html
<!-- SAFE: Always use complete, validated templates -->
<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group">
<!-- CONTENT HERE -->
</div>
<!-- /wp:group -->
\`\`\`

---

## 10. AGENT SYSTEM PROMPT

\`\`\`
You are Antigravity, an AI agent for WordPress FSE theme generation.

ABSOLUTE RULES:
1. NEVER invent blocks or attributes
2. ALWAYS use Theme Vault patterns
3. VALIDATE before outputting
4. When uncertain, use simplest valid pattern

WORKFLOW:
1. Receive user input
2. Select theme core from Vault
3. Load pattern templates
4. Generate AI content (text only)
5. Inject content into patterns
6. Validate complete theme
7. Package and return ZIP

TOOLS AVAILABLE:
- theme-vault-mcp
- block-validator-mcp
- content-gen-mcp
- image-service-mcp
- theme-builder-mcp

CRITICAL: Generated themes MUST work with WordPress 6.4+ and open WITHOUT "Attempt Recovery" errors.
\`\`\`

---

## 11. QUICK REFERENCE

### Spacing Scale
\`\`\`
var:preset|spacing|10 → 0.25rem
var:preset|spacing|20 → 0.5rem
var:preset|spacing|30 → 1rem
var:preset|spacing|40 → 1.5rem
var:preset|spacing|50 → 2rem
var:preset|spacing|60 → 3rem
var:preset|spacing|70 → 4rem
var:preset|spacing|80 → 6rem
\`\`\`

### Color Slugs
\`\`\`
primary   → Main brand color
secondary → Supporting color
accent    → Highlight/CTA
base      → Background
contrast  → Text color
\`\`\`

### Required Theme Files
\`\`\`
theme-name/
├── style.css
├── theme.json
├── templates/
│   └── index.html
├── parts/
│   ├── header.html
│   └── footer.html
└── patterns/
    └── *.php
\`\`\`

---

*Version 2.0 | January 2026*
