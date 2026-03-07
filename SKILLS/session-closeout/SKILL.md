# Session Closeout Protocol

> **Trigger:** End of every coding/development session, or when user says "close session", "wrap up", "end session", "update docs", or "session closeout".
> **Purpose:** Ensure all project documentation stays accurate and consistent across sessions and agents.
> **Time:** 2-5 minutes. No code changes — documentation only.

---

## MANDATORY STEPS (Execute in order)

### Step 1: Gather Session Facts

Before updating any file, compile a mental summary:
- What was the **main task** this session?
- What **files were created or modified**?
- What **bugs were fixed** (with root cause)?
- What **decisions were made** (and why)?
- What is the **current project state** after this session?
- What is the **next task** the following agent should pick up?
- Were any **previous decisions changed**? If yes, document the old value, new value, and reason.

### Step 2: Update `changelog.md`

Add a new dated entry at the top of the `## Entries` section following this format:

```markdown
## [YYYY-MM-DD] — Short Title

### Added
- What was built or created

### Changed
- What was modified and why

### Fixed
- What bugs were fixed (with root cause summary)

### Archived / Removed
- What was cleaned up or deprecated
```

Rules:
- Only log meaningful, stable changes (not WIP or experiments)
- Include commit hashes where available
- Keep entries concise — one line per item

### Step 3: Update `_memory/main.md`

This is the master project memory. Update:
- **Phase status** — mark completed phases, update "in progress" and "next" labels
- **Recent commits** — add new commits to the relevant section
- **Bug fixes** — add to the bug fix chain if applicable
- **Lessons learned** — add any new operational insights discovered this session
- **"Last updated" date** at the top

### Step 4: Update `BRAIN/MEMORY/project_state.md`

Update:
- **Header line** — current phase status
- **Top-level update note** — one-line summary of what changed
- **SSWG Pipeline Status** (or equivalent active work stream section)

### Step 5: Update `DECISIONS.md` (only if decisions changed)

If any architectural decisions, tech stack choices, or product constraints were changed this session:
- Update the relevant section with the new value
- Add a "Changed: YYYY-MM-DD" note inline explaining old → new
- Add a row to the **Change Log** table at the bottom
- Add a row to the **Session Log** table

If no decisions changed, still add a Session Log entry summarizing what was done.

### Step 6: Update `docs/PROJECT_ROADMAP.md` (only if phase status changed)

If a phase was completed, started, or the next task changed:
- Update the phase status markers
- Update the "Last updated" header
- Add a Patch Note entry if significant work was done

### Step 7: Verify Consistency

Quick cross-check — all files must agree on:
- Current phase status (what's done, what's next)
- Tech stack (AI model, infrastructure, tools)
- Active decisions (brand modes, output format, etc.)

If any contradiction is found, fix it immediately.

### Step 8: Report to User

End with a brief summary:
```
Session closeout complete:
- changelog.md: [what was added]
- _memory/main.md: [what was updated]
- BRAIN/MEMORY/project_state.md: [what was updated]
- DECISIONS.md: [updated / no changes]
- PROJECT_ROADMAP.md: [updated / no changes]
- Next task for next agent: [description]
```

---

## FILES TOUCHED BY THIS PROTOCOL

| File | Always Updated | Condition |
|------|---------------|-----------|
| `changelog.md` | YES | Every session |
| `_memory/main.md` | YES | Every session |
| `BRAIN/MEMORY/project_state.md` | YES | Every session |
| `DECISIONS.md` | CONDITIONAL | Only if decisions changed or need session log entry |
| `docs/PROJECT_ROADMAP.md` | CONDITIONAL | Only if phase status changed |

---

## RULES

1. **Never skip this protocol.** Even if the session was short, at minimum update changelog.md and _memory/main.md.
2. **Document WHY, not just WHAT.** Every decision change must include the reason.
3. **Date everything.** Use ISO format (YYYY-MM-DD).
4. **Don't rewrite history.** Add new entries — don't modify old ones unless they contain errors.
5. **Be honest about status.** If something is broken, say it's broken. If a fix is a workaround, say so.
6. **Include commit hashes** where available for traceability.
7. **Flag what's next** so the next agent knows exactly where to start.
