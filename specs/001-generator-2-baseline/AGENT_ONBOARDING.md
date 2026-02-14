# PressPilot Agent Onboarding

**Read Time: 2 minutes**
**Required Before: ANY code changes to PressPilot**

---

## ⚡ The One Thing You Must Know

**PressPilot uses a Node.js/TypeScript generator to create WordPress themes.**

The flow:
```
n8n → GPT-4o (content) → Laravel → Node.js Generator → ZIP → User
```

---

## 🗂️ Key File Locations

| What | Where | Language |
|------|-------|----------|
| Generator CLI | `bin/generate.ts` | TypeScript ✅ |
| Generator Core | `src/generator/index.ts` | TypeScript ✅ |
| Engine Components | `src/generator/engine/` | TypeScript ✅ |
| Validators | `src/generator/validators/` | TypeScript ✅ |
| Pattern Library | `src/generator/patterns/` | TypeScript ✅ (50+ files) |
| Proven-Cores Vault | `proven-cores/` | Mixed ✅ |
| Laravel Backend | `backend/` | PHP ✅ |
| GenerateThemeJob | `backend/app/Jobs/GenerateThemeJob.php` | PHP ✅ |

---

## 🔧 How Laravel Calls the Generator

```php
// backend/app/Jobs/GenerateThemeJob.php line ~84
$result = Process::timeout(300)
    ->path('/app/generator')
    ->input($stdinPayload)   // JSON input
    ->run('npx tsx /app/generator/bin/generate.ts');
```

**Contract:**
- stdin: `{data, mode, slug, outDir}`
- stdout: `{status, themeName, downloadPath, filename, themeDir, staticPath}`

## 🐳 Horizon Container Packaging (Coolify)

- Dockerfile: `backend/docker/horizon/Dockerfile`
- Compose service: `laravel-horizon` in `docker-compose.m0-laravel.yml`
- Build context: repo root (`.`)
- Generator code is copied into the image with `COPY`, not mounted at runtime.
- Coolify does not behave like local Docker bind-mount workflows for this deployment path.

Files copied into `/app/generator`:
- `src/generator`
- `lib`
- `proven-cores`
- `bin`
- `tsconfig.json`
- `presspilot.os.json`
- `app/mvp-demo`

---

## 📚 Files to Read First

1. `bin/generate.ts` — CLI entry point
2. `src/generator/index.ts` — Main orchestrator  
3. `proven-cores/cores.json` — Available base themes
4. `backend/app/Jobs/GenerateThemeJob.php` — Laravel integration

---

## ✅ The Generator Does This

| Component | Purpose |
|-----------|---------|
| ThemeSelector | Picks base theme from proven-cores |
| ChassisLoader | Loads the base theme files |
| StyleEngine | Generates theme.json with colors/fonts |
| PatternInjector | Injects content into patterns |
| ContentEngine | Generates page templates |
| StructureValidator | Validates ZIP structure |
| BlockValidator | Validates block grammar |
| TokenValidator | Validates content tokens |
| archiver | Creates the ZIP file |
| buildStaticSite | Creates HTML preview |

---

## 🎯 Proven-Cores Vault

All patterns should come from these tested themes:

| Theme | Codename | Best For |
|-------|----------|----------|
| Tove | Vertical Expert | Restaurant, niche |
| Frost | Masterpiece | Agency, portfolio |
| Ollie | Startup | E-commerce, modern |
| Spectra One | Performance Pro | Business, grids |
| Blockbase | Invisible Framework | Minimal |
| Twenty Twenty-Four | Gold Standard | Universal |

---

## ❌ Do NOT

1. Try to replace Node.js generator with PHP (not ready)
2. Modify GenerateThemeJob to call anything other than Node.js
3. Hand-write WordPress block markup
4. Skip validation gates

---

## 🐛 When Debugging Theme Issues

1. Check validator output (Structure, Block, Token)
2. Check if pattern came from proven-cores
3. Check theme.json color mappings
4. Test in WordPress Playground first

---

## 📖 More Documentation

| Doc | Path |
|-----|------|
| Full Spec | `specs/001-generator-2-baseline/spec.md` |
| Generator Architecture | `docs/generator-architecture.md` |
| Data Flow | `docs/DATA_FLOW.md` |
| FSE Golden Contract | `docs/pp-fse-golden-contract.md` |
| M0 Backend Spec | `output/M0_LARAVEL_BACKEND_PREP_SPEC.md` |

---

*This is part of PressPilot's constitutional documentation.*
