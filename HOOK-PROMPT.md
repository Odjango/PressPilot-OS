# PressPilot OS — Session Resumption Hook Prompt

> Copy everything below this line into a new Claude session to resume.

---

## Resume Context

I'm continuing a PressPilot OS dev session. Read `CLAUDE.md`, `_memory/main.md`, and `BRAIN/MEMORY/project_state.md` to get oriented.

## What Just Happened (2026-03-08)

We completed **5 theme generation quality bug fixes** discovered after the first successful production generation (Memo's Pizza). All fixes are committed:

| # | Bug | Root Cause | Fix | Commit |
|---|-----|-----------|-----|--------|
| 1 | Brand colors always red | `extractBrandColors()` existed but was never called in orchestrator | Wired into `src/generator/index.ts` BEFORE `styleBuilder.invoke()` | `ae71b0c` |
| 2 | Menu "Attempt Recovery" | Column blocks missing `{"width":"50%"}` attr + `style="flex-basis:50%"` | Fixed in `src/generator/patterns/universal-menu.ts` | `ae71b0c` |
| 3 | Pages not populated + generic site name | `after_switch_theme` doesn't fire in WP Playground; needed `init` hook fallback | Fixed in `src/generator/utils/content-loader-generator.ts` | `ae71b0c` |
| 4 | Logo missing in header/footer | `media_sideload_image` unreliable in Playground | Removed logo setup from content loader (deferred to future) | `ae71b0c` |
| 5 | Single Post "Attempt Recovery" | Base theme patterns keep original namespace (e.g., `frost/comments`) after chassis copy | Added `rewritePatternSlugs()` in `src/generator/index.ts` after `chassis.load()` | `ae71b0c` |

Documentation update committed as `0260cd9`.

## Deploy Status

Both commits (`ae71b0c` + `0260cd9`) need to be **pushed to origin** first:
```bash
cd /path/to/PressPilot-OS && git push origin main
```

Then in **Coolify**:
1. Click **Redeploy** on the Next.js app (do NOT run `git pull` in container — no git installed)
2. Set `APP_DEBUG=false` in Coolify → Laravel app → Environment Variables, then redeploy Laravel

## What to Test After Deploy

Generate a fresh theme (any business) and verify:
1. Colors extracted from logo (not default red)
2. No "Attempt Recovery" on any page (menu, single post, etc.)
3. Pages populated with real content + correct business name
4. Footer has PressPilot credit

## What's Next

Refer to `docs/PROJECT_ROADMAP.md` for the current phase. After verifying the 5 fixes work in production, likely next priorities:
- Logo injection (Bug #4 was deferred, not fully solved)
- Additional base theme testing beyond Frost
- Phase 4 planning per the roadmap

Begin by asking me what I'd like to work on, or if I have deploy/test results to share.
