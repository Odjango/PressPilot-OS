---
name: presspilot
description: PressPilot AI WordPress FSE theme generator development. Generates ONLY modern Full Site Editing block themes (never classic PHP themes). Use when working on any PressPilot codebase including Next.js frontend, WordPress factory plugin, n8n workflows, Docker containers, theme generation, or debugging theme activation issues. Triggers on mentions of PressPilot, theme generation, factory plugin, presspilotapp.com, FSE themes, or block templates.
---

# PressPilot Development

## What PressPilot Does

AI-powered WordPress **FSE (Full Site Editing) theme** generator SaaS. User provides business description → system generates complete WordPress FSE block theme with AI content, brand colors, and customization → user downloads ready-to-install theme ZIP.

**Important**: PressPilot produces modern block themes only. No classic PHP templates ever.

## Architecture Overview

```
User → Next.js Frontend → n8n Workflows → Factory Plugin → Theme ZIP
         (UI/API)         (orchestration)   (WP generation)  (output)
```

| Component | Location | Purpose |
|-----------|----------|---------|
| Next.js Frontend | `presspilot-app/` | User UI, API routes, business intake |
| Factory Plugin | `theme-starter/starter-starter/starter/` | WordPress-side theme generation |
| n8n Workflows | `n8n-workflows/` or n8n UI | Orchestration, AI calls, workflow logic |
| Docker | `docker-compose.yml` | Local dev environment |

## Key Endpoints

- **Frontend**: `https://presspilotapp.com`
- **Factory Plugin API**: `https://factory.presspilotapp.com/wp-json/starter/v1/`
- **n8n**: Local or cloud instance

## Critical Rules

1. **FSE ONLY - NO CLASSIC THEMES** - PressPilot generates modern WordPress Full Site Editing themes exclusively. Never use classic PHP templates (`header.php`, `footer.php`, `single.php`, etc.). All templates must be block-based HTML in `templates/` and `parts/` folders.
2. **All dependencies must be free/open-source** - no premium themes or paid plugins
3. **Factory plugin handles WordPress generation** - n8n calls factory, NOT Next.js endpoints
4. **Footer must include PressPilot branding**

## FSE vs Classic - Quick Reference

| Classic (NEVER USE) | FSE (ALWAYS USE) |
|---------------------|------------------|
| `header.php` | `parts/header.html` |
| `footer.php` | `parts/footer.html` |
| `single.php` | `templates/single.html` |
| `<?php the_content(); ?>` | `<!-- wp:post-content /-->` |
| `<?php get_header(); ?>` | `<!-- wp:template-part {"slug":"header"} /-->` |
| PHP template tags | Block markup in HTML |

**If you see any `.php` template files being generated (except `functions.php` and `index.php` fallback), something is wrong.**

## Current State & Known Issues

**Primary blocker**: Generated theme ZIPs crash WordPress on activation. The factory plugin correctly creates pages with proper content, but something in theme structure causes activation failure.

**Debug checklist for theme activation crash**:
1. Check `theme.json` is valid JSON and FSE-compliant
2. Verify `style.css` has required WordPress headers
3. Check `functions.php` for syntax errors
4. Ensure all template files use valid block markup
5. Check for missing required files: `index.php`, `templates/index.html`

## Workflow: Theme Generation

```
1. User submits business info via Next.js form
2. Next.js calls n8n webhook with payload
3. n8n orchestrates:
   - AI content generation (OpenAI)
   - Image selection (Unsplash or DALL-E)
   - Brand color extraction (from logo if provided)
4. n8n calls Factory Plugin API with generated content
5. Factory Plugin:
   - Selects base theme matching business category
   - Replaces placeholder content
   - Generates theme.json with brand colors
   - Packages as ZIP
6. ZIP returned to user for download
```

## File Structure Reference

**Factory Plugin key files**:
- `starter/starter.php` - Main plugin file, REST API registration
- `starter/includes/` - Theme generation logic
- `starter/themes/` - Base theme templates

**Next.js key files**:
- `app/api/` - API routes
- `components/` - UI components
- `lib/` - Utilities and helpers

## Common Tasks

**Debugging theme generation**:
1. Check n8n execution logs for errors
2. Verify factory plugin endpoint responds: `curl https://factory.presspilotapp.com/wp-json/starter/v1/health`
3. Download generated ZIP and manually inspect contents
4. Test theme in fresh WordPress install

**Adding new business category**:
1. Add category to JSON schema in `categories.json`
2. Create/assign base theme in factory plugin
3. Update n8n workflow with category-specific prompts
4. Test full flow

**Fixing n8n workflow issues**:
- Ensure webhooks call `factory.presspilotapp.com`, NOT `presspilotapp.com`
- Check HTTP Request nodes use correct authentication
- Verify JSON payloads match factory plugin expected schema

## Tech Stack Quick Reference

| Layer | Tech |
|-------|------|
| Frontend | Next.js, React, Tailwind |
| Backend/API | Next.js API routes |
| Orchestration | n8n |
| Theme Generation | Custom WordPress plugin (PHP) |
| AI | OpenAI API |
| Images | Unsplash API, DALL-E |
| Containers | Docker, Docker Compose |

## Communication Style

Omar prefers explanations "like for a 10-year-old" - clear, simple, no jargon. Focus on what to do, not deep technical theory. When explaining, use analogies and step-by-step instructions.
