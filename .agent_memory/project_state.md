# Project State

## Action Required
Deep-scan the existing files and the documentation already present in the project.

## Task
List exactly what is currently implemented. Identify the specific way Tailwind and the WP engine are integrated so that future tasks do not break this setup.

## Currently Implemented (Observed)

### 1. Core Generation Architecture
- Primary generator is Node.js/TypeScript (`bin/generate.ts`, `src/generator/index.ts`).
- Generator contract is JSON stdin -> JSON stdout (CLI wrapper), with progress logs on stderr.
- Pipeline modules are active: `ThemeSelector`, `ChassisLoader`, `StyleEngine`, `PatternInjector`, `ContentEngine`, validators, ZIP packaging.
- Output is native WordPress block theme artifacts: `theme.json`, `style.css`, `templates/`, `parts/`, `patterns/`.

### 2. WordPress/FSE Enforcement
- Block grammar is generated/validated using Gutenberg comment format (`<!-- wp:block --> ... <!-- /wp:block -->`).
- Validators in use: `StructureValidator`, `BlockValidator`, `TokenValidator`.
- Block allow/deny policy exists (`src/generator/validators/blocks/WordPressBlockRegistry.ts`).
- Theme styling and tokens are written into `theme.json` and augmented in `style.css` by `StyleEngine`.

### 3. Vertical + Recipe System
- Recipe system exists for `restaurant`, `ecommerce`, `saas`, `portfolio`, and `local-service` (`src/generator/recipes/`).
- Section pattern library exists under `src/generator/patterns/sections/` with vertical-specific files.
- Generator currently forces heavy mode for restaurant/ecommerce/saas/portfolio/local-service in `src/generator/index.ts`.

### 4. Brand Modes / Design Tokens
- Brand modes implemented: `modern`, `playful`, `bold`, `minimal` (`src/generator/design-system/brandModes.ts`).
- Central token resolution exists in `src/generator/design-system/` and is consumed by pattern/recipe logic.

### 5. Runtime Paths (Two Supported Flows)
- Next.js flow: `app/api/generate/route.ts` accepts Studio input, transforms payload, queues jobs.
- Next.js preview file flow: `app/api/previews/[...path]/route.ts` serves runtime-created images from `/public/tmp/previews/` via `/api/previews/*`.
- Laravel M0 flow: backend queue worker invokes generator subprocess (`backend/app/Jobs/GenerateThemeJob.php`).
- Dockerized Laravel/Horizon stack is defined in `docker-compose.m0-laravel.yml`.

### 6. Tailwind Integration (Exact Boundary)
- Tailwind is configured for the Next.js app/UI layer only:
  - `app/globals.css` imports Tailwind (`@import "tailwindcss"`).
  - PostCSS plugins use `@tailwindcss/postcss` (`postcss.config.js`, `app/postcss.config.js`).
  - App-level Tailwind config exists (`app/tailwind.config.js`).
- In generator code, no Tailwind dependency is used for theme output:
  - No `tailwind` usage in `src/generator/**`.
  - Generated WP themes are composed with Gutenberg block markup + `theme.json` presets + `style.css` rules.

## Integration Interpretation (Do-Not-Break Rules)
- Tailwind classes/utilities are for the PressPilot SaaS interface (Next.js front-end), not for generated WordPress themes.
- WordPress theme output is deterministic file generation from Node modules and FSE block patterns, validated before delivery.
- Any future task must keep this split intact: UI styling changes in app layer; theme styling logic in generator/style engine layer.

---

## Production Infrastructure (Feb 19, 2026)

### Deployment Stack
- **VPS**: DigitalOcean Basic Droplet (134.209.167.43)
- **VPS Specs**: 8 GB RAM / 160 GB disk / 4 vCPUs / $48 per month
- **Previous VPS Specs**: 4 GB RAM / 48 GB disk
- **Orchestration**: Coolify v4
- **Frontend**: https://presspilotapp.com
- **Backend API**: Laravel with Horizon (internal Docker network)
- **WordPress Factory**: https://factory.presspilotapp.com
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage (themes/, previews/ buckets)

### Container Stack (Coolify-managed)
| Container | Purpose | Notes |
|-----------|---------|-------|
| presspilot-nextjs-frontend | Next.js app | Public-facing UI |
| laravel-app | API endpoints | Internal network only |
| laravel-horizon | Queue worker | Processes GenerateThemeJob |
| pp-redis | Redis queue | Named to avoid coolify-redis DNS conflict |
| wordpress-factory | WP instance | Theme preview/activation |

### Critical Environment Variables

**Frontend:**
- `BACKEND_URL` - Laravel internal IP (currently http://10.0.1.3:8080, was http://10.0.1.10:8080 before resize/redeploy) - **verify after redeploys**
- `WP_PREVIEW_URL` - https://factory.presspilotapp.com
- `WP_PREVIEW_USER` - WordPress admin username
- `WP_PREVIEW_PASS` - WordPress admin password
- `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` - /usr/bin/chromium

**Backend:**
- `REDIS_HOST=pp-redis` (not "redis" to avoid Coolify DNS conflict)
- `DATABASE_URL` - Supabase PostgreSQL connection string
- `SUPABASE_SERVICE_ROLE_KEY` - For storage uploads

### Docker Network Notes
- All services communicate via Coolify's internal Docker network
- Laravel IP may change after container recreation
- Verify backend IP with:
  `docker inspect $(docker ps --format "{{.Names}}" | grep laravel-app) --format '{{range .NetworkSettings.Networks}}{{.IPAddress}} {{end}}'`
- Update `BACKEND_URL` in frontend whenever this IP changes

### Deployment Fixes Applied
- Frontend Dockerfile optimized:
  - Removed duplicate Playwright Chromium install
  - Added cleanup steps to reduce image bloat and disk pressure
- Runtime preview image serving corrected via API route:
  - Added `app/api/previews/[...path]/route.ts`
  - Studio/preview URLs updated from `/tmp/previews/` to `/api/previews/`

### Common Operations

**Disk space cleanup (frequent issue):**
```bash
docker system prune -a -f && docker builder prune -a -f
```

**Check server resources:**
```bash
free -h && df -h /
```

**Reset WordPress admin password:**
```bash
docker exec wordpress-moosc0gwkg48kss04c8cgkc4 wp user update admin --user_pass=NewPassword --allow-root
```

**Check Laravel health:**
```bash
curl http://<laravel-ip>:8080/api/internal/health
```

---

## Known Issues (Priority Order)

### P1: Hero preview captures wrong section
- **Status**: Preview images display in UI now (display issue fixed), but screenshot target is incorrect.
- **Symptom**: Captures "Our Story" or another section instead of the hero block.
- **Cause**: Playwright selector matching wrong element in hero capture logic.
- **Location**: `src/preview/HeroPreviewRunner.ts`
- **Fix needed**: Narrow selector strategy to generated hero only.

### P2: Site Editor "Attempt Recovery" errors
- **Symptom**: Site Editor prompts recovery on generated testimonial sections.
- **Cause**: Invalid testimonial block markup.
- **Location**: Testimonial block pattern generation
- **Fix needed**: Correct markup and validate with WordPress parser rules.

### P3: Apostrophe encoding bug
- **Symptom**: Apostrophes appear as `&#39;` (example: `Memo&#39;s Pizza`).
- **Cause**: Over-encoding in content transformation/pattern injection.
- **Location**: Content encoding and render pipeline
- **Fix needed**: Preserve apostrophes as display text in generated output.

---

## Milestone Status

### Completed ✅
- M0: Laravel Backend Migration
- M1: Production Deployment
- End-to-end theme generation working
- Multi-page themes (Home, About, Services, Contact, Menu)
- Hero preview screenshot generation (Playwright, 4 layouts)
- Hero preview image display in UI via `/api/previews/`
- Unsplash image integration
- Brand color application (partial)
- Logo injection

### In Progress 🔄
- Fix P1-P3 quality issues

### Planned 📋
- Generate 52 theme combinations for Magazine Gallery
- Build Magazine Gallery UI (visual theme browser)
- Dark Mode toggle for generated themes
- Extra Large header font size option
