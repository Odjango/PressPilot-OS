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
- `BACKEND_URL` - `http://laravel-app:8080` (Docker Compose service name, stable across redeploys — verified Feb 21)
- `WP_PREVIEW_URL` - https://factory.presspilotapp.com
- `WP_PREVIEW_USER` - WordPress admin username
- `WP_PREVIEW_PASS` - WordPress admin password
- `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` - /usr/bin/chromium

**Backend:**
- `REDIS_HOST=pp-redis` (not "redis" to avoid Coolify DNS conflict)
- `DATABASE_URL` - Supabase PostgreSQL connection string
- `SUPABASE_SERVICE_ROLE_KEY` - For storage uploads

### Docker Network / DNS Notes (Resolved Feb 21, 2026)
- All services communicate via Coolify's internal Docker network (`coolify` external network)
- **Coolify v4 ignores `container_name`** from docker-compose — use service names instead
- **Docker Compose service names resolve cross-app** via shared `coolify` network (confirmed Feb 21)
- `BACKEND_URL=http://laravel-app:8080` — deployed and verified, stable across redeploys
- `curl`/`wget` not available in frontend container — use `node -e` for DNS tests

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

**Check Laravel health (from frontend container):**
```bash
node -e "require('http').get('http://laravel-app:8080/up', r => { console.log(r.statusCode === 200 ? 'OK' : 'FAIL'); r.resume(); }).on('error', () => console.log('FAIL'))"
```

---

## Known Issues (Updated Feb 21, 2026)

### P1: Hero preview captures wrong section — VERIFIED RESOLVED
- **Fix**: Commit `6b35765` added `.pp-hero-preview` marker class to all 4 hero variants
- **Verification**: `test-hero-previews.ts --industry=restaurant` confirmed all 4 layouts (fullBleed, fullWidth, split, minimal) capture correctly using `.pp-hero-preview` selector

### P2: Site Editor "Attempt Recovery" errors — FULLY RESOLVED AND VERIFIED
- **Root cause**: Block markup issues (wrong inline styles, missing layout classes, duplicate dimensions). NOT placeholder leakage.
- **Fix**: 6 commits (Feb 19–21) on `social-proof.ts` + Codex fixed 4 industry-specific testimonial files
- **Verification**: All 5 verticals passed WP smoke test — zero "Attempt Recovery" errors

### P3: Apostrophe encoding bug — FULLY RESOLVED
- **Fix**: Commit `300992c` removed apostrophe HTML-entity encoding from `sanitize.ts`
- **Root cause**: Double encoding through sanitize + PHP escaping stages

### P4: Header inside fullBleed Cover block — FULLY RESOLVED AND VERIFIED
- **Root cause**: `PatternInjector.ts:444` excluded header template part for fullBleed; `getFullBleedHero()` embedded inline transparent header inside Cover inner container
- **Architecture decision**: Header is ALWAYS a separate template part (Option A), never inside Cover
- **Spec**: `output/HEADER_SEPARATION_SPEC.md`
- **Codex changes**: Removed `getInlineTransparentHeader()` from `universal-header.ts`, simplified `getFullBleedHero()` in `hero-variants.ts`, removed fullBleed conditional in `PatternInjector.ts`
- **Verification**: `npx tsc --noEmit` passed, all 5 verticals passed WP smoke test (`theme-activation.spec.ts`)

### P5: Generation stall at "Building Your Assets" — UNDIAGNOSED
- Steps 1-4 complete, Step 5 (DELIVER) stalls indefinitely
- Laravel log not found at `/app/storage/logs/laravel.log` in container
- Need: locate log path, check Horizon dashboard, check Supabase upload

### IMPORTANT: `{{Slot}}` System Is Intentional
- `{{...}}` tokens in section files are an intentional slot system resolved by ContentBuilder + PatternInjector before output
- DO NOT convert them to inline `getText()` calls unless there is a specific block-markup reason
- 5-layer resolution pipeline ensures no `{{...}}` ever reaches theme output

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
- P1/P2/P3 quality issues — all resolved and verified (Feb 21)
- WP smoke test coverage: all 5 verticals (theme-activation.spec.ts)

### Completed ✅ (Feb 21)
- Stabilize Laravel BACKEND_URL — Docker DNS deployed (`http://laravel-app:8080`)

### Completed ✅ (Feb 21, post-DNS)
- P4: Header separation fix — Codex implemented, verified (all 5 verticals pass)

### Active 🔧
- P5: Diagnose generation stall (find Laravel logs, check Horizon)

### Planned 📋
- Generate 52 theme combinations for Magazine Gallery
- Build Magazine Gallery UI (visual theme browser)
- Dark Mode toggle for generated themes
- Extra Large header font size option
