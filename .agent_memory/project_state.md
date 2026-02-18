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

## Production Infrastructure (Feb 17, 2026)

### Deployment Stack
- **VPS**: DigitalOcean Droplet (134.209.167.43)
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
- `BACKEND_URL` - Laravel internal IP (currently http://10.0.1.10:8080) - **verify after redeploys**
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
- Verify connectivity: `docker inspect <container> --format '{{range .NetworkSettings.Networks}}{{.IPAddress}} {{end}}'`

### Common Operations

**Disk space cleanup (frequent issue):**
```bash
docker system prune -af --volumes
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

### P1: Hero Previews Not Displaying
- **Symptom**: Screenshots captured successfully but images show 404 in UI
- **Cause**: `/tmp/previews/` path not served as static files by Next.js
- **Location**: Frontend static file configuration
- **Fix needed**: Configure public serving of preview images or change output path

### P2: Brand Colors Incomplete
- **Symptom**: Logo with multiple colors (green, red, orange) only applies one color (red) to theme
- **Cause**: Color extraction not capturing full palette from logo
- **Location**: `src/generator/modules/` color extraction, `TT4TokenMapper`
- **Fix needed**: Improve multi-color extraction and mapping to theme tokens
- **Example**: Luigi Pizza logo has green/red/golden but theme only shows red tones

### P3: Hero Style Mismatch
- **Symptom**: User selects "Full Bleed" hero but gets "Full Width" layout
- **Cause**: Hero style preference not passed correctly through generation pipeline
- **Location**: Frontend -> Backend -> Generator parameter chain
- **Fix needed**: Trace `heroStyle` parameter through entire flow

### P4: ZIP Download Format
- **Symptom**: Theme downloads as folder instead of .zip file
- **Cause**: Frontend download handler or response content-type issue
- **Location**: Frontend download logic in generate/download flow
- **Fix needed**: Ensure proper ZIP streaming with correct headers

### P5: Design Quality
- **Symptom**: Generated themes need visual refinement
- **Areas for improvement**:
  - More business-specific images per vertical
  - Better section layouts and spacing
  - Richer AI-generated content
  - Typography pairing improvements
- **Location**: Generator recipes, patterns, content builders

---

## Milestone Status

### Completed ✅
- M0: Laravel Backend Migration
- M1: Production Deployment
- End-to-end theme generation working
- Multi-page themes (Home, About, Services, Contact, Menu)
- Unsplash image integration
- Brand color application (partial)
- Logo injection

### In Progress 🔄
- Fix P1-P5 issues (generator quality)

### Planned 📋
- Generate 52 theme combinations for Magazine Gallery
- Build Magazine Gallery UI (visual theme browser)
- Dark Mode toggle for generated themes
- Extra Large header font size option
