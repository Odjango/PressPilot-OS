# PressPilot OS

**WordPress FSE Themes — Without Editor Errors.**

PressPilot OS generates production-ready WordPress Full Site Editing themes that pass strict validation gates. Built on proven base themes (Frost, Tove, TT4) and hardened by AI-assisted pattern cleaning, every theme is client-safe and free of "Attempt Recovery" warnings. Zero external plugin dependencies—themes you own forever.

## 🚀 Key Features

### 1. Internal Generator Engine 
Moved away from external N8N workflows to a robust, internal Node.js pipeline.
- **Deterministic Output:** 100% predictable HTML/block grammar generation.
- **Zero-Dependency:** Generated themes require NO plugins (No Elementor, No ACFs).
- **Standards Compliant:** Validated against WordPress FSE Schema v2.

### 2. Intelligent "Trinity" Color System
- **Smart Extraction:** Analyzing uploaded logos to extract a 3-color palette (Primary, Secondary, Accent).
- **Frontend Editor:** Users can fine-tune the extraction before generation.
- **WCAG Compliance:** Auto-calculation of contrast ratios for accessible text layers.

### 3. Generator 2.0 — Recipe-Driven Themes
Data-driven theme generation with centralized design system:
- **Design Tokens:** Centralized `getDesignTokens(brandMode, vertical)` API for consistent styling.
- **Recipe Engine:** LayoutRecipes define section order, backgrounds, and config per vertical.
- **4 Brand Modes:** Playful (pill buttons, generous spacing), Modern (sharp edges, compact), Minimal (maximum whitespace), Bold (high contrast).
- **Vertical Support:** Restaurant and Ecommerce verticals with industry-specific section patterns.
- **WCAG AA Compliance:** Safe token pairs for hero overlays, promo bands, and CTAs.

## FSE Knowledge Base

PressPilot uses a comprehensive WordPress Full Site Editing (FSE) Knowledge Base to generate WordPress-compliant themes.

### What is the FSE Knowledge Base?

The FSE KB contains exact specifications for all WordPress 6.7+ core blocks, including:
- Block attributes and defaults
- Parent-child constraints
- CSS class patterns
- HTML structure
- Validation rules

### Why We Use It

**Before FSE KB:**
- Hardcoded block strings
- Missing default attributes
- Validation errors in WordPress
- Manual updates for each block

**After FSE KB:**
- Automatic attribute defaults
- Zero validation errors
- WordPress 6.7+ compliance
- Single source of truth

### Knowledge Base Location

All FSE documentation is in `docs/fse-kb/`:
- `FSE-FUNDAMENTALS.md` - FSE architecture overview
- `BLOCK-MARKUP-SPEC.md` - Universal markup rules
- `BLOCK-REFERENCE-BATCH-*.md` - Block specifications (Batches 1-7)
- `FSE-KNOWLEDGE-BASE-INDEX.md` - Quick lookup reference

### How It Works

```typescript
// Old way (hardcoded)
const logo = `<!-- wp:site-logo {"width":120} /-->`;

// New way (FSE KB)
import { getBlockGenerator } from './lib/fse-kb';
const gen = getBlockGenerator();
const logo = gen.generate('site-logo', { width: 120 });
// Generates: <!-- wp:core/site-logo {"width":120,"isLink":true} /-->
```

The FSE KB automatically adds required defaults like `isLink:true`.

## Pattern Library (STABLE - March 2026)

PressPilot's pattern library is **production-ready** and passes all quality gates.

### Pattern Inventory
- **362 total patterns** (31 skeletons + 331 proven-cores)
- **0 linting violations** across all files
- **Proven-cores:** 5 themes (Frost, Ollie, Spectra-One, Tove, TwentyTwentyFour)

### Stabilization Achievements
- ✅ All hardcoded hex colors replaced with theme.json tokens
- ✅ All banned `wp:navigation` ref attributes removed
- ✅ All redundant iconColorValue/iconBackgroundColorValue attributes cleaned
- ✅ All Ollie px widths audited and confirmed safe (77 instances)

### Pattern Quality Standards

**Run linter before committing pattern changes:**
```bash
tools/lint-patterns.sh
```

**Banned Patterns:**
- ❌ Hardcoded hex colors (e.g., `#E3E3F0`) — use theme.json tokens
- ❌ `wp:navigation` with `ref` attribute — causes broken menus
- ❌ `iconColorValue`/`iconBackgroundColorValue` — use semantic slugs only
- ❌ Dangerous fixed px widths on layout blocks

**Token Standards:**
- Border colors: `var:preset|color|tertiary` (JSON) or `var(--wp--preset--color--tertiary)` (inline)
- Social-links: Use semantic slugs without `*Value` duplicates
- All color references must map to theme.json palette

## 🛠 Tech Stack

- **Frontend:** Next.js 16 (App Router), TailwindCSS, Framer Motion.
- **Backend:** Node.js, Archiver (Zip generation), Jimp (Image processing).
- **Deployment:** Dockerized container (Coolify on DigitalOcean).
- **Output:** Native WordPress Block Themes (`theme.json` + `html` templates).

## 🚦 Running Locally

```bash
# Install dependencies
npm install --legacy-peer-deps

# Run development server
npm run dev

# Build for production
npm run build
```

### FSE Knowledge Base Verification

The FSE Knowledge Base is pre-configured and initializes automatically.

```bash
npm run test:fse-kb
# or
npx tsx src/test-fse.ts
```

**Expected output:**
```
Initializing FSE Knowledge Base...
Loaded 9 block specifications
FSE Knowledge Base ready
Available blocks: template-part, group, site-logo, navigation, heading, paragraph, cover, buttons, button
```

### Local WordPress for Hero Previews

The **Real Hero Preview** feature (Studio Step 4) requires a local WordPress instance to render pixel-accurate theme screenshots.

**Default Configuration:**
- **URL:** `http://localhost:8089`
- **Credentials:** `admin` / `password123`

**Start WordPress via Docker:**
```bash
docker-compose up -d wordpress
```

**Environment Variables (optional):**
```bash
WP_PREVIEW_URL=http://localhost:8089
WP_PREVIEW_USER=admin
WP_PREVIEW_PASS=password123
```

When WordPress is unavailable, the hero preview feature gracefully falls back—users can still proceed with the simulated preview in Step 3 and generate themes without real screenshots.

## Deployment Status

### Current Production Status (Feb 17, 2026)
- **Frontend**: https://presspilotapp.com (Coolify - Running)
- **Laravel Backend**: Coolify Docker Compose stack (Running)
- **WordPress Factory**: https://factory.presspilotapp.com (Running)
- **Database**: Supabase PostgreSQL
- **Queue**: Redis with Laravel Horizon

### Architecture
- Next.js frontend -> Laravel API -> Horizon Queue -> TypeScript Generator
- Theme generation uses proven-cores from Vault
- Unsplash API for industry-specific images

## 📚 Documentation

### For AI Agents
- **[CLAUDE.md](CLAUDE.md)** - Agent operational contract and rules. Start here.
- **[docs/AGENT_CONTEXT_MASTER.md](docs/AGENT_CONTEXT_MASTER.md)** - Session context, current mission, and must-read files.
- **[_memory/main.md](_memory/main.md)** - Most current project state: git commits, active issues, planned work.
- **[BRAIN/README.md](BRAIN/README.md)** - Navigation map for the full AI knowledge base.
- **[BRAIN/MEMORY/project_state.md](BRAIN/MEMORY/project_state.md)** - Canonical memory: architecture, learned patterns, lessons.

### For Developers
- **[docs/PROJECT_ROADMAP.md](docs/PROJECT_ROADMAP.md)** - Current phase and development timeline.
- **[docs/DATA_FLOW.md](docs/DATA_FLOW.md)** - Data pipeline architecture.
- **[docs/generator-architecture.md](docs/generator-architecture.md)** - Generator design overview.
- **[docs/pp-hard-gates.md](docs/pp-hard-gates.md)** - Validation gates and quality enforcement.

### Knowledge Structure
```
BRAIN/
├── VISION/       # Business mandate & product principles (locked)
├── CONSTITUTION/ # Technical rules & FSE laws (stable)
├── MEMORY/       # Learned patterns & phase history (evolves)
│   ├── project_state.md     # Canonical project state (CURRENT)
│   ├── coding_standards.md  # Coding rules extracted from codebase
│   ├── user_profile.md      # Owner profile and working style
│   ├── phase-history.md     # Full development history
│   └── marketing-seeds.md   # Marketing content seeds
└── ARCHIVE/      # Deprecated docs (reference only)

_memory/          # OneContext plugin memory (mirrors BRAIN/MEMORY key state)
├── main.md       # Master roadmap & repo state
├── commit.md     # Commit log
└── log.md        # Work log

Project Extras/   # Archived clutter (NOT active codebase)
├── debug-logs/        # Error logs, manual fix files, playwright reports
├── test-zips/         # Old test theme ZIPs
├── old-scripts/       # Debug and cleanup scripts
├── old-workflows/     # Old n8n/workflow JSONs
├── old-docs/          # Superseded documentation
├── test-output-runs/  # Historical generator output (341 test runs)
├── legacy-folders/    # Old project phases and experiments
├── archived-memory/   # Retired memory systems (.agent_memory, memory/)
└── archived-instructions/ # Retired agent instruction files
```

---

## 📦 Deployment

The project is configured for **Docker** deployment (Coolify/Portainer).
It typically requires ~512MB RAM minimal, but 1GB+ is recommended for parallel generation.
Verified stable with `node:20-alpine`.
