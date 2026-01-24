# PressPilot OS

**The "Zero-Dependency" WordPress FSE Theme Factory.**

PressPilot OS is a Next.js 16 + Node.js application that autonomously generates professional WordPress Block Themes (Full Site Editing compatible) based on simple user inputs. Unlike traditional "wizard" plugins, it produces **standalone .zip theme files** that users own forever, with no reliance on external plugins or page builders.

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

### 3. Triple-Layout Generation
Simultaneously generates 3 distinct architectural variations for every request:
- **Original:** Classic Split Hero (Image Left, Text Right).
- **High Contrast:** Modern Full-Bleed (Immersive Cover).
- **Inverted:** Minimal Centered (Clean SaaS/Startup aesthetic).

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

## 📦 Deployment

The project is configured for **Docker** deployment (Coolify/Portainer).
It typically requires ~512MB RAM minimal, but 1GB+ is recommended for parallel generation.
Verified stable with `node:20-alpine`.
