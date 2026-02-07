# PressPilot BRAIN - AI Knowledge Base

**Last Updated:** 2026-02-06 | **Phase:** Generator 2.0 Phase 4 Complete (Ecommerce Vertical)

The BRAIN is a "Designer-First" operating system where logic is controlled via text files. This document serves as the navigation map for both AI agents and human developers.

---

## Quick Navigation

| Concept | Canonical File | Purpose | Status |
|---------|---------------|---------|--------|
| **Business Vision** | [VISION/project-vision.md](VISION/project-vision.md) | What we build | Locked |
| **Product Principles** | [VISION/product-principles.md](VISION/product-principles.md) | Quality rules | Locked |
| **FSE Technical Laws** | [CONSTITUTION/fse_laws.md](CONSTITUTION/fse_laws.md) | WordPress FSE reference (1,840 lines) | Active |
| **Market Constraints** | [CONSTITUTION/core_directives.md](CONSTITUTION/core_directives.md) | Zero-dependency rules | Locked |
| **Design System** | [CONSTITUTION/design_system.md](CONSTITUTION/design_system.md) | Styling governance | Active |
| **Restaurant Rules** | [CONSTITUTION/verticals/restaurant_architect.md](CONSTITUTION/verticals/restaurant_architect.md) | Menu patterns | Active |
| **WooCommerce Rules** | [CONSTITUTION/verticals/woocommerce_architect.md](CONSTITUTION/verticals/woocommerce_architect.md) | Shop patterns | Active |
| **Current State** | [MEMORY/project_state.md](MEMORY/project_state.md) | Learned patterns | Updated |
| **Phase History** | [MEMORY/phase-history.md](MEMORY/phase-history.md) | Development log | Active |
| **Project Roadmap** | [../docs/PROJECT_ROADMAP.md](../docs/PROJECT_ROADMAP.md) | Phase timeline | Active |
| **Agent Contract** | [../CLAUDE.md](../CLAUDE.md) | Operational rules | Active |

---

## Folder Structure

```
BRAIN/
├── README.md                  ← You are here (navigation map)
│
├── VISION/                    # WHAT we build (locked, rarely changes)
│   ├── project-vision.md      # Business mandate - source of truth
│   ├── product-principles.md  # 7 product quality rules
│   └── WP Theme Output Checker.md  # Validation skill
│
├── CONSTITUTION/              # HOW we build (rules & laws)
│   ├── fse_laws.md            # ⭐ Comprehensive FSE reference
│   ├── core_directives.md     # Market positioning (zero-dependency)
│   ├── design_system.md       # Styling governance (CSS variables)
│   └── verticals/             # Industry-specific rules
│       ├── restaurant_architect.md
│       ├── woocommerce_architect.md
│       ├── fitness_architect.md
│       └── portfolio_architect.md
│
├── MEMORY/                    # WHAT we learned (evolves each phase)
│   ├── project_state.md       # Current "save game" state
│   └── phase-history.md       # Consolidated phase log
│
└── ARCHIVE/                   # Deprecated docs (reference only)
    ├── PRD.md                 # Original spec (superseded by VISION/)
    ├── FACTORY_BUILD_REPORT.md # Old plugin architecture
    ├── ROADMAP.md             # Old roadmap (use docs/PROJECT_ROADMAP.md)
    ├── master-prompt.md       # Historical orchestrator prompt
    └── PROJECT_LOG.md         # Raw dev log (use MEMORY/phase-history.md)
```

---

## Authority Hierarchy

When instructions conflict, follow this priority:

1. **VISION/** - Business mandate (locked, overrides everything)
2. **CONSTITUTION/** - Technical laws (stable, enforced by hard gates)
3. **MEMORY/** - Learned patterns (evolves, captures lessons)
4. **ARCHIVE/** - Deprecated (reference only, never authoritative)

**If any document conflicts with this hierarchy, follow the higher-priority document.**

---

## For AI Agents

### Before Starting Work

1. Read [VISION/project-vision.md](VISION/project-vision.md) to understand the product
2. Read [CONSTITUTION/fse_laws.md](CONSTITUTION/fse_laws.md) for technical rules
3. Check [MEMORY/project_state.md](MEMORY/project_state.md) for current state
4. Check [../docs/PROJECT_ROADMAP.md](../docs/PROJECT_ROADMAP.md) for current phase

### Key Rules from CONSTITUTION

- **Zero-Dependency Rule:** No external plugins (Elementor, ACF, Redux). All native PHP/JS.
- **Blueprint Rule:** File-based structure (.zip), not database layouts
- **Semantic Ownership:** Standard WordPress hierarchy (archive.php, single.php)
- **Paragraph Links in Footer:** Never use `core/navigation` block in footer (causes errors)
- **Preset Tokens Only:** Never hardcode hex colors; use theme.json presets

### Updating MEMORY

After completing a phase or solving a significant problem:
1. Update `MEMORY/project_state.md` with new learnings
2. Add phase summary to `MEMORY/phase-history.md`
3. Keep updates focused on stable, reusable patterns

---

## For Human Developers

### To Change a Rule
Edit the appropriate file in `CONSTITUTION/`

### To Start a New Feature
1. Check [../docs/PROJECT_ROADMAP.md](../docs/PROJECT_ROADMAP.md) for current phase
2. Drop specs/screenshots in `VISION/` if needed
3. AI agents will pick up context from these files

### To Understand Current State
1. Read `MEMORY/project_state.md` for learned patterns
2. Read `MEMORY/phase-history.md` for development history (canonical summary)
3. For raw detail, see `ARCHIVE/PROJECT_LOG.md` (supplementary only)
4. Check recent commits in git log

---

## Related Documentation

| Location | Purpose |
|----------|---------|
| [docs/DATA_FLOW.md](../docs/DATA_FLOW.md) | Data pipeline architecture |
| [docs/generator-architecture.md](../docs/generator-architecture.md) | Generator design |
| [docs/pp-hard-gates.md](../docs/pp-hard-gates.md) | Validation enforcement |
| [docs/hero-system.md](../docs/hero-system.md) | Hero layout specifications |
| [CLAUDE.md](../CLAUDE.md) | High-level context only; see [agent-protocol.md](CONSTITUTION/agent-protocol.md) for rules |

---

## Version History

| Date | Change |
|------|--------|
| 2026-02-06 | Updated to Generator 2.0 Phase 4 - ecommerce vertical, design system, recipe engine |
| 2026-02-02 | Created as part of documentation rationalization (Phase 15 prep) |
| 2026-02-02 | Absorbed content from master-prompt.md |
| 2026-02-02 | Added ARCHIVE/ for deprecated documents |
