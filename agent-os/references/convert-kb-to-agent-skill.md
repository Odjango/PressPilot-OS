# Converting Your FSE Knowledge Base to an Agent Skill

A step-by-step guide for non-coders. No scripting required — it's all markdown files and a few terminal commands.

---

## What You're Building

An **Agent Skill** is just a folder of markdown files, organized in a specific way, that AI agents (Claude Code, Codex, Cursor, etc.) automatically read and follow. Think of it as turning your knowledge base into a "plugin" that any AI coding tool can use.

Your current knowledge base → restructured into this format:

```
fse-html-converter/
├── SKILL.md                          ← Main instructions (the "brain")
├── references/                       ← Deep-dive docs (one per topic)
│   ├── block-markup-syntax.md
│   ├── template-structure.md
│   ├── theme-json-guide.md
│   ├── html-to-block-mapping.md
│   ├── image-handling.md
│   ├── navigation-patterns.md
│   ├── layout-patterns.md
│   └── common-failures.md
└── scripts/                          ← Optional: validation helpers
    └── (empty for now — you can add later)
```

---

## Step 1: Create the Folder Structure

Open your terminal and run:

```bash
mkdir -p fse-html-converter/references
mkdir -p fse-html-converter/scripts
```

That's it. You now have the skeleton.

---

## Step 2: Create the SKILL.md File

This is the most important file. It tells the AI agent **when** to use this skill and **how** to follow it. The format has specific sections the agent expects.

Create `fse-html-converter/SKILL.md` and use this template. **Replace the placeholder content with your actual knowledge base content** — I've marked where your existing docs map in.

```markdown
---
name: fse-html-converter
description: >
  Converts static HTML/CSS/JS websites into WordPress Full Site Editing (FSE)
  block themes. Use when transforming HTML templates, static sites, or
  exported website files into valid WordPress block markup, theme.json,
  templates, template-parts, and patterns. Covers HTML-to-block mapping
  decisions, block comment syntax, layout conversion, image handling,
  SVG treatment, navigation structures, and visual fidelity preservation.
---

# HTML to WordPress FSE Block Theme Conversion

## When to Use This Skill

Use this skill when:
- Converting static HTML/CSS/JS files into a WordPress block theme
- Mapping HTML elements to WordPress block types
- Generating theme.json from existing CSS
- Creating block templates from HTML page layouts
- Building template-parts (header, footer) from HTML sections
- Registering patterns from repeating HTML components
- Debugging block validation errors after conversion
- Fixing visual fidelity issues between original HTML and converted theme

## Conversion Procedure

### Phase 1: Analyze the Source HTML

1. Inventory all HTML files — identify which become templates vs. patterns
2. Identify the site structure: header, footer, main content areas, sidebar
3. Catalog all CSS — separate what can go into theme.json vs. what stays in style.css
4. List all images, SVGs, fonts, and media assets
5. Note any JavaScript interactions that need preservation

### Phase 2: Map HTML to Block Types

Follow the decision tree in `references/html-to-block-mapping.md`.

Key mapping rules:

| HTML Pattern | WordPress Block |
|---|---|
| `<header>` containing logo + nav | Template-part (`header`) with site-title + navigation blocks |
| `<nav>` with links | `<!-- wp:navigation -->` |
| `<section>` or `<div>` wrapper | `<!-- wp:group -->` with appropriate layout type |
| `<div>` with flex/grid children | `<!-- wp:group {"layout":{"type":"flex"}}` or `<!-- wp:columns -->` |
| `<img>` | `<!-- wp:image -->` |
| `<figure>` with `<img>` + `<figcaption>` | `<!-- wp:image -->` with caption |
| `<h1>` through `<h6>` | `<!-- wp:heading {"level": N} -->` |
| `<p>` | `<!-- wp:paragraph -->` |
| `<a>` styled as button | `<!-- wp:buttons -->` containing `<!-- wp:button -->` |
| `<ul>` / `<ol>` | `<!-- wp:list -->` with `<!-- wp:list-item -->` children |
| `<footer>` | Template-part (`footer`) |
| Hero section with background | `<!-- wp:cover -->` |
| Multi-column layout | `<!-- wp:columns -->` with `<!-- wp:column -->` children |
| Repeating card/grid items | Pattern (PHP file) |

### Phase 3: Generate Theme Structure

Create these files in order:

1. **style.css** — Theme metadata header + custom CSS that cannot be expressed in theme.json
2. **theme.json** — See `references/theme-json-guide.md`
3. **templates/index.html** — Main template with template-part references
4. **templates/** — Additional templates (page.html, single.html, 404.html, etc.)
5. **parts/header.html** — Header template-part
6. **parts/footer.html** — Footer template-part
7. **patterns/** — Reusable content sections as PHP files
8. **functions.php** — Only if enqueuing scripts or registering features
9. **assets/** — Images, fonts, and other media

### Phase 4: Block Markup Rules

Every block MUST follow this exact syntax:

```html
<!-- wp:blockname {"jsonAttributes":"here"} -->
<htmltag class="wp-block-blockname">content</htmltag>
<!-- /wp:blockname -->
```

**Critical rules:**
- The opening comment, the HTML tag, and the closing comment must ALL match
- JSON attributes in the comment must be valid JSON (double quotes only)
- The HTML wrapper class must match the block type
- Self-closing blocks use: `<!-- wp:blockname {"attr":"val"} /-->`
- Nested blocks go INSIDE the HTML wrapper, BETWEEN the comments

See `references/block-markup-syntax.md` for the complete syntax reference.

### Phase 5: Verify Conversion

1. Activate theme in WordPress Site Editor
2. Check for "Attempt Recovery" errors — indicates invalid block markup
3. Compare visual output against original HTML side-by-side
4. Verify all images load correctly
5. Test responsive behavior at mobile/tablet/desktop breakpoints
6. Confirm navigation links work
7. Check that SVGs render properly (not as raw code)

## Failure Modes

| Symptom | Likely Cause | Fix |
|---|---|---|
| "Attempt Recovery" in editor | Block comment doesn't match HTML wrapper | Check opening/closing comments match the HTML tag and class |
| Images don't load | Wrong asset path or missing from theme | Ensure images are in `/assets/images/` and paths use `<?php echo esc_url( get_template_directory_uri() ); ?>/assets/images/` in patterns |
| SVG shows as raw code | SVG placed as text instead of image block | Use `<!-- wp:image -->` with SVG file path, or inline SVG in a custom HTML block |
| Layout doesn't match original | Wrong layout type on group block | Check: constrained vs. flex vs. grid. Constrained = centered content, flex = horizontal row, grid = CSS grid |
| Fonts look different | Fonts not registered in theme.json | Add font family definitions to `settings.typography.fontFamilies` in theme.json |
| Colors don't match | CSS colors not mapped to palette | Extract exact hex values and add to `settings.color.palette` in theme.json |
| Navigation missing items | Static links instead of navigation block | Use `<!-- wp:navigation -->` with `<!-- wp:navigation-link -->` children |
| Custom CSS not applying | CSS in style.css not specific enough | Block themes load CSS differently — may need to target `.wp-block-*` classes |
| Spacing is off | Padding/margin not in theme.json | Use `settings.spacing.spacingSizes` and apply via block attributes |

## Verification Checklist

- [ ] Theme activates without PHP errors
- [ ] Site Editor loads all templates without "Attempt Recovery"
- [ ] Header renders correctly with logo and navigation
- [ ] Footer renders correctly
- [ ] Homepage layout matches original
- [ ] All images display properly
- [ ] Typography matches (fonts, sizes, weights, line-heights)
- [ ] Colors match original design
- [ ] Responsive layout works
- [ ] SVGs render as graphics, not code
- [ ] Interactive elements function (if preserved)
```

---

## Step 3: Create Your Reference Files

Take sections from your existing knowledge base and split them into focused reference docs. Each file covers ONE topic deeply. Here are the templates for the key ones:

### references/block-markup-syntax.md

```markdown
# Block Markup Syntax Reference

## Comment Format

Every WordPress block is an HTML comment wrapping an HTML element.

Opening: `<!-- wp:namespace/blockname {"key":"value"} -->`
Closing: `<!-- /wp:namespace/blockname -->`
Self-closing: `<!-- wp:namespace/blockname {"key":"value"} /-->`

Core blocks omit the namespace: `<!-- wp:paragraph -->` not `<!-- wp:core/paragraph -->`

## JSON Attribute Rules

- Must be valid JSON inside the opening comment
- Double quotes only (no single quotes)
- No trailing commas
- Boolean values: `true` / `false` (no quotes)
- Numbers: no quotes
- Strings: double-quoted

Correct: `<!-- wp:group {"align":"wide","className":"my-class"} -->`
Wrong: `<!-- wp:group {'align':'wide',} -->`

## HTML Wrapper Rules

The HTML element BETWEEN the comments must:
- Have the correct `class` matching the block type (e.g., `wp-block-group`, `wp-block-columns`)
- Match any alignment classes (e.g., `alignwide`, `alignfull`)
- Contain the correct semantic tag (e.g., `<div>`, `<figure>`, `<ul>`)

## Nesting

Nested blocks go INSIDE the HTML wrapper:

<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group">
  <!-- wp:heading -->
  <h2 class="wp-block-heading">Title</h2>
  <!-- /wp:heading -->
  <!-- wp:paragraph -->
  <p>Content here.</p>
  <!-- /wp:paragraph -->
</div>
<!-- /wp:group -->

## Common Block Examples

[PASTE YOUR EXISTING BLOCK EXAMPLES HERE — one for each block type
you commonly encounter during conversions]
```

### references/html-to-block-mapping.md

```markdown
# HTML to WordPress Block Decision Tree

## Decision Process

When encountering an HTML element, follow this order:

1. **Is it a page-level section?** (header, footer, main)
   → Template-part or template structure

2. **Is it a content wrapper?** (section, div, article)
   → Group block. Then determine layout type:
   - Children stacked vertically → `{"layout":{"type":"constrained"}}`
   - Children in a row → `{"layout":{"type":"flex","flexWrap":"nowrap"}}`
   - CSS grid → `{"layout":{"type":"grid"}}`

3. **Is it a media element?** (img, video, figure, svg)
   → Image, video, or cover block

4. **Is it text content?** (h1-h6, p, span, blockquote)
   → Heading, paragraph, or quote block

5. **Is it a list?** (ul, ol, li)
   → List block with list-item children

6. **Is it a link styled as button?**
   → Buttons block wrapping button block(s)

7. **Is it a repeating pattern?** (cards, testimonials, pricing tables)
   → Extract as a pattern (PHP file in /patterns/)

8. **Is it something with no block equivalent?**
   → Custom HTML block as last resort

[PASTE YOUR EXISTING DECISION TREES AND EDGE CASES HERE]
```

### references/theme-json-guide.md

```markdown
# theme.json Conversion Guide

## Structure

theme.json has two main sections:
- `settings` — what options are available (colors, fonts, spacing)
- `styles` — what defaults are applied (body background, heading sizes)

## Mapping CSS to theme.json

[PASTE YOUR EXISTING THEME.JSON DOCUMENTATION HERE]

### Colors
Extract from CSS and add to settings.color.palette:
- Background colors → palette entries
- Text colors → palette entries
- Brand/accent colors → palette entries

### Typography
Extract from CSS:
- Font families → settings.typography.fontFamilies
- Font sizes → settings.typography.fontSizes
- Line heights → styles.typography.lineHeight (never below 1.0)

### Spacing
Extract from CSS:
- Consistent padding/margin values → settings.spacing.spacingSizes
- Content width → settings.layout.contentSize
- Wide width → settings.layout.wideSize

## What CANNOT Go in theme.json

These must stay in style.css:
- Animations and transitions
- Complex hover states
- Pseudo-elements (::before, ::after)
- Media queries for non-standard breakpoints
- CSS Grid with named areas
- Complex background effects
```

### references/image-handling.md

```markdown
# Image Handling During Conversion

[PASTE YOUR EXISTING IMAGE/SVG HANDLING DOCS HERE]

## Static Images in Templates
- Place in theme `/assets/images/` directory
- Reference via get_template_directory_uri() in patterns

## Images in Patterns (PHP files)
Use escaped PHP to build the URL:
<?php echo esc_url( get_template_directory_uri() ); ?>/assets/images/photo.jpg

## SVG Handling
[YOUR SVG-SPECIFIC DOCUMENTATION]

## Common Image Failures
[YOUR DOCUMENTED IMAGE ISSUES AND FIXES]
```

### references/common-failures.md

```markdown
# Common Conversion Failures and Fixes

[PASTE ALL YOUR DOCUMENTED EDGE CASES, BUGS, AND FIXES HERE]

This is where all the hard-won knowledge from your WPaify debugging
sessions goes. Every "Attempt Recovery" error you've solved,
every visual fidelity issue you've fixed — document it here.
```

---

## Step 4: Install the Skill into Claude Code

You have two options. Pick the one that fits your workflow:

### Option A: Drop It Into Your Project (Recommended to Start)

Just copy the folder into your WPaify or PressPilot project:

```bash
# From your project root
mkdir -p .claude/skills
cp -r /path/to/fse-html-converter .claude/skills/
```

Claude Code automatically discovers skills in `.claude/skills/`. Next time you start a session, it will read and use your skill.

### Option B: Install Globally (Use Across All Projects)

```bash
# Copy to your global Claude Code skills directory
mkdir -p ~/.claude/skills
cp -r /path/to/fse-html-converter ~/.claude/skills/
```

Now every Claude Code session on your machine has access to this skill.

---

## Step 5: Verify It Works

Open Claude Code in your project and ask it something like:

> "Convert the uploaded HTML file into a WordPress FSE block theme"

If the skill is loaded, the agent should follow your documented procedure (phases 1-5) rather than guessing. You'll notice it:
- References your specific block mapping rules
- Follows your template structure order
- Checks your failure modes

If it doesn't seem to pick it up, check:
1. The folder is in `.claude/skills/` (project) or `~/.claude/skills/` (global)
2. The file is named exactly `SKILL.md` (capital letters, .md extension)
3. The YAML frontmatter at the top has `name:` and `description:` fields

---

## Step 6: Also Install WordPress's Official Skills (Complementary)

Your skill handles the **conversion logic**. WordPress's official skills handle **block theme correctness**. Use both together:

```bash
# Install the official WordPress agent skills for block themes
npx skills add https://github.com/WordPress/agent-skills --agent claude-code --global --skills wp-block-themes
```

This gives you two layers:
- **Your skill** = "How to convert HTML to FSE" (your unique process)
- **Official skill** = "What correct FSE looks like" (Automattic's reference)

---

## Key Formatting Rules for SKILL.md

To keep the skill effective, follow these guidelines:

| Rule | Why |
|---|---|
| Keep SKILL.md under 500 lines | Longer files waste context window space |
| Push deep details into `references/` | Agent loads these only when needed |
| Use checklists and tables, not prose | Agents follow procedures better than paragraphs |
| Include "Failure Modes" section | Helps the agent self-correct |
| Include "Verification" section | Gives the agent a way to check its own work |
| Start with "When to Use" | Helps the agent decide if this skill applies |

---

## What About MCP? When to Consider It

You do NOT need an MCP server right now. Convert to a skill first.

Consider MCP later only if:
- Your knowledge base grows beyond ~500 lines of SKILL.md + references
- You need the agent to query specific conversion rules dynamically
- You're building a shared service that multiple team members or products query
- You want WPaify's conversion pipeline to call the knowledge base via API

When that time comes, the skill content becomes the data source for the MCP server — so nothing you build now is wasted.

---

## Maintenance

When you discover new edge cases during WPaify development:

1. Add them to the relevant `references/*.md` file
2. If it's a new failure mode, add a row to the Failure Modes table in SKILL.md
3. If it's a new mapping rule, update `references/html-to-block-mapping.md`

That's it. The skill updates take effect on your next Claude Code session.
