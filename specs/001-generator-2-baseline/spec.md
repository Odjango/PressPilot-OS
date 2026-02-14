# Feature Specification: Generator 2.0 Baseline

**Feature Branch**: `001-generator-2-baseline`
**Created**: 2026-02-12
**Updated**: 2026-02-14
**Status**: Active

---

## Architecture Overview

### Current Production System: Node.js Generator

The PressPilot theme generator is a **Node.js/TypeScript system** that creates complete WordPress FSE themes from business data.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   PRESSPILOT ARCHITECTURE (CURRENT)                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [Studio UI] ─────► StudioFormInput                                         │
│       │                                                                     │
│       ▼                                                                     │
│  [Studio Adapter] ─────► StudioFormInput → PressPilotSaaSInput              │
│       │                                                                     │
│       ▼                                                                     │
│  [n8n Workflow] ─────► GPT-4o generates content                             │
│       │               (pattern content, placeholder strings, images)        │
│       │                                                                     │
│       ▼                                                                     │
│  [Data Transformer] ─────► SaaSInput → GeneratorData                        │
│       │                                                                     │
│       ▼                                                                     │
│  [Laravel API] ─────► POST /api/internal/jobs/test-dispatch                 │
│       │               Creates GenerationJob → Redis queue "generate"        │
│       │                                                                     │
│       ▼                                                                     │
│  [Horizon Worker] ─────► GenerateThemeJob::handle()                         │
│       │                                                                     │
│       │  Process::run('npx tsx /app/generator/bin/generate.ts')             │
│       │  stdin: JSON {data, mode, slug, outDir}                             │
│       │  stdout: JSON result                                                │
│       │                                                                     │
│       ▼                                                                     │
│  [Node.js Generator] ─────► bin/generate.ts                                 │
│       │                                                                     │
│       ├──► ThemeSelector (picks base from proven-cores)                     │
│       ├──► ChassisLoader (loads base theme)                                 │
│       ├──► StyleEngine (colors/fonts → theme.json)                          │
│       ├──► PatternInjector (injects content into patterns)                  │
│       ├──► ContentEngine (generates pages)                                  │
│       ├──► Validators (Structure/Block/Token)                               │
│       ├──► ZIP creation (archiver)                                          │
│       └──► Static site builder (HTML preview)                               │
│                                                                             │
│       ▼                                                                     │
│  [Supabase S3] ─────► themes/{project_id}/{job_id}.zip                      │
│                       previews/{project_id}/{job_id}.zip                    │
│       │                                                                     │
│       ▼                                                                     │
│  [Signed Download URL] ─────► User downloads ZIP                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### File Locations

| Component | Path | Language | Status |
|-----------|------|----------|--------|
| **Generator CLI** | `bin/generate.ts` | TypeScript | ✅ Production |
| **Generator Core** | `src/generator/index.ts` | TypeScript | ✅ Production |
| **Engine Components** | `src/generator/engine/` | TypeScript | ✅ Production |
| - ThemeSelector | `src/generator/engine/ThemeSelector.ts` | TypeScript | ✅ Active |
| - ChassisLoader | `src/generator/engine/ChassisLoader.ts` | TypeScript | ✅ Active |
| - StyleEngine | `src/generator/engine/StyleEngine.ts` | TypeScript | ✅ Active |
| - PatternInjector | `src/generator/engine/PatternInjector.ts` | TypeScript | ✅ Active |
| - ContentEngine | `src/generator/engine/ContentEngine.ts` | TypeScript | ✅ Active |
| **Validators** | `src/generator/validators/` | TypeScript | ✅ Production |
| **Pattern Library** | `src/generator/patterns/` | TypeScript | ✅ Production (50+ files) |
| **Proven-Cores Vault** | `proven-cores/` | Mixed | ✅ Shared |
| **Core Registry** | `proven-cores/cores.json` | JSON | ✅ Active |
| **Laravel Backend** | `backend/` | PHP | ✅ Production |
| **GenerateThemeJob** | `backend/app/Jobs/GenerateThemeJob.php` | PHP | ✅ Production |

### Proven-Cores Vault

The system uses patterns from these battle-tested FSE themes:

| Theme | Codename | Use For |
|-------|----------|---------|
| Tove | "Vertical Expert" | Restaurant menus, niche layouts |
| Frost | "Masterpiece" | High-end agencies, portfolios |
| Ollie | "Startup" | E-commerce, modern startups |
| Spectra One | "Performance Pro" | Business services, grids |
| Blockbase | "Invisible Framework" | Minimal, content-only |
| Twenty Twenty-Four | "Gold Standard" | Universal patterns, accessibility |

---

## How Laravel Invokes the Generator

In `GenerateThemeJob::handle()` (line ~84):

```php
$result = Process::timeout(300)
    ->env(['NODE_ENV' => 'production', 'UNSPLASH_ACCESS_KEY' => ...])
    ->path('/app/generator')
    ->input($stdinPayload)   // JSON: {data, mode, slug, outDir}
    ->run('npx tsx /app/generator/bin/generate.ts');
```

**Contract:**
- **stdin**: JSON with `{data, mode, slug, outDir}`
- **stdout**: JSON with `{status, themeName, downloadPath, filename, themeDir, staticPath}`
- **stderr**: Progress logs

---

## n8n Workflow

The n8n workflow (`n8n/presspilot-factory-v2.json`) orchestrates content generation:

1. Receives user input from Studio UI
2. Calls GPT-4o with the AI prompt (`n8n/ai-content-generator-prompt.md`)
3. GPT-4o generates pattern content, placeholder strings, and image URLs
4. Passes data to Laravel API

**Important**: The Node.js generator itself makes **zero AI calls** — it consumes pre-generated JSON from n8n.

---

## Docker Infrastructure

3 containers on `presspilot-m0` bridge network:

| Container | Purpose | Notes |
|-----------|---------|-------|
| `laravel-app` | PHP-FPM + nginx | Port 8080, internal only |
| `laravel-horizon` | Queue worker + Node.js generator | Generator files are copied into image at `/app/generator` during build |
| `redis` | Queues, sessions, cache | Port 6379, internal only |

The Horizon container has **Node.js 20** installed with pre-built `node_modules`.

### Horizon Build Packaging (Coolify)

- `laravel-horizon` uses `backend/docker/horizon/Dockerfile` with build context `.` (repo root).
- Generator source is packaged with `COPY` (not bind-mount) to support Coolify deployments.
- Coolify deployment model does not provide local Docker-style bind-mount behavior for this service.

`backend/docker/horizon/Dockerfile` copies these paths into `/app/generator`:
- `src/generator` → `/app/generator/src/generator`
- `lib` → `/app/generator/lib`
- `proven-cores` → `/app/generator/proven-cores`
- `bin` → `/app/generator/bin`
- `tsconfig.json` → `/app/generator/tsconfig.json`
- `presspilot.os.json` → `/app/generator/presspilot.os.json`
- `app/mvp-demo` → `/app/generator/app/mvp-demo`

---

## User Scenarios & Testing

### User Story 1 - Generate Complete WordPress Theme (Priority: P1)

A business owner visits the PressPilot Studio, enters their business information (name, tagline, description, industry category), selects visual preferences (hero layout, brand style), and receives a downloadable WordPress FSE theme ZIP file that works without errors in the WordPress Site Editor.

**Acceptance Scenarios**:

1. **Given** a user has entered valid business information, **When** they click "Generate Theme", **Then** the system produces a valid WordPress FSE theme ZIP within 90 seconds.

2. **Given** a generated theme ZIP file, **When** it is uploaded to a WordPress 6.0+ site, **Then** the theme activates without errors and the Site Editor opens without "Attempt Recovery" prompts.

3. **Given** a user selects "Restaurant" as their business category, **When** the theme is generated, **Then** the homepage includes restaurant-specific sections (menu preview, hours, location).

4. **Given** a generated theme, **When** the user activates it, **Then** the site title, tagline, and pages are automatically configured.

---

## Functional Requirements

### Theme Generation

- **FR-001**: System MUST generate valid WordPress FSE theme ZIP files.
- **FR-002**: System MUST produce themes that activate without "Attempt Recovery" errors.
- **FR-003**: System MUST support multiple hero layout options.
- **FR-004**: System MUST inject user-provided business information into theme content.

### Validation

- **FR-005**: System MUST validate ZIP structure (style.css at root, no nested folders).
- **FR-006**: System MUST validate required files (style.css, index.php, theme.json, templates/, parts/).
- **FR-007**: System MUST validate theme.json is valid JSON with version >= 2.
- **FR-008**: System MUST validate block grammar (balanced opening/closing comments).
- **FR-009**: System MUST check for forbidden demo strings.

### Vertical Support

- **FR-010**: System MUST support Restaurant vertical with menu, hours, location sections.
- **FR-011**: System MUST route verticals to appropriate proven-cores themes.

### Laravel Backend

- **FR-012**: Laravel MUST queue theme generation jobs via Horizon.
- **FR-013**: Laravel MUST invoke Node.js generator via subprocess with JSON stdin/stdout.
- **FR-014**: Laravel MUST upload completed ZIPs to Supabase S3 and return signed URLs.
- **FR-015**: Laravel MUST provide job status endpoints (queued, processing, completed, failed).
- **FR-016**: Laravel MUST handle failures with clear error messages.

### Theme Activation

- **FR-017**: Generated themes MUST auto-configure site title and tagline on activation.
- **FR-018**: Generated themes MUST auto-create required pages (Home, Menu, About, Contact).
- **FR-019**: Generated themes MUST set front page and configure static front page mode.

---

## Success Criteria

- **SC-001**: 100% of generated themes activate without "Attempt Recovery" errors.
- **SC-002**: Theme generation completes within 90 seconds.
- **SC-003**: Content validation catches 100% of forbidden demo strings.
- **SC-004**: New verticals can be added without modifying core generator logic.
- **SC-005**: Laravel job queue processes requests with < 1 second latency.
- **SC-006**: Failed jobs provide actionable error messages.
- **SC-007**: ZIP validation catches structure errors before delivery.

---

## Implementation Status

### Current Production ✅

| Component | Status | Notes |
|-----------|--------|-------|
| Node.js Generator | ✅ Production | `bin/generate.ts` + `src/generator/` |
| Proven-Cores Vault | ✅ Complete | 6 themes in `proven-cores/` |
| Restaurant Vertical | ✅ Complete | 4 pages, working navigation |
| Validation Pipeline | ✅ Complete | Structure, Block, Token validators |
| ZIP Creation | ✅ Complete | archiver library |
| Static Preview | ✅ Complete | buildStaticSite() |
| Laravel Integration | ✅ Production | GenerateThemeJob calls Node.js |
| Docker Infrastructure | ✅ Production | 3 containers, Horizon + Node.js |

### Future Improvements

| Component | Status | Notes |
|-----------|--------|-------|
| Brand Modes (4 styles) | ⏳ Planned | playful, modern, minimal, bold |
| Ecommerce Vertical | ⏳ Planned | Product grid, categories |
| Preview System | ⏳ Planned | Screenshot generation |
| Additional Hero Layouts | ⏳ Planned | fullBleed, minimal |

---

## Related Documentation

| Document | Path | Content |
|----------|------|---------|
| Agent Context Master | `docs/AGENT_CONTEXT_MASTER.md` | High-level operational context |
| Generator Architecture | `docs/generator-architecture.md` | Engine design details |
| Data Flow | `docs/DATA_FLOW.md` | Full pipeline documentation |
| FSE Golden Contract | `docs/pp-fse-golden-contract.md` | Navigation rules, presets |
| Hard Gates | `docs/pp-hard-gates.md` | 5 crash-prevention gates |
| M0 Backend Spec | `output/M0_LARAVEL_BACKEND_PREP_SPEC.md` | Laravel implementation |
| OpenAPI Spec | `output/contracts/openapi.laravel-target.yaml` | API documentation |

---

*Last Updated: 2026-02-12*
*Architecture: Node.js Generator + Laravel Backend*
