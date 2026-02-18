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
- **[BRAIN/README.md](BRAIN/README.md)** - Start here. Navigation map for the AI knowledge base.
- **[CLAUDE.md](CLAUDE.md)** - Agent operational contract and rules.
- **[docs/AGENT_CONTEXT_MASTER.md](docs/AGENT_CONTEXT_MASTER.md)** - Session context and must-read files.

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
└── ARCHIVE/      # Deprecated docs (reference only)
```

---

## 📦 Deployment

The project is configured for **Docker** deployment (Coolify/Portainer).
It typically requires ~512MB RAM minimal, but 1GB+ is recommended for parallel generation.
Verified stable with `node:20-alpine`.
