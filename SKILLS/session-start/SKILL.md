# Session Start Protocol

> **Trigger:** Beginning of every coding/development session, or when user says "start session", "new session", "session start", or "pick up where we left off".
> **Purpose:** Load project context so the agent understands the current state, what was done last, and what to work on next.
> **Time:** 1-2 minutes. Read-only — no file changes.

---

## MANDATORY STEPS (Execute in order)

### Step 1: Load Project Context

Read these files in this exact order:

1. **`docs/PROJECT_ROADMAP.md`** — understand which phase is active, what's next, and the overall plan
2. **`_memory/main.md`** — current project state, recent commits, bug fix chains, lessons learned
3. **`DECISIONS.md`** — locked decisions, tech stack, change log (scan the Change Log table and Session Log for recent changes)
4. **`BRAIN/MEMORY/project_state.md`** — header line + SSWG Pipeline Status section (for quick status confirmation)

### Step 2: Identify Current Task

From the files above, determine:
- What **phase** are we in? (e.g., "SSWG Phase 3: Frontend Integration")
- What is the **specific next task**? (e.g., "Task 3.1: Wire Studio form to Laravel /api/generate")
- What was the **last completed work**? (check changelog.md top entry and Session Log)
- Are there any **blockers or open bugs**?

### Step 3: Check for Phase Spec

If the current phase has a detailed spec file, read it:
- SSWG phases: `agent-os/sswg/PHASE-{0-4}.md`
- The spec is the source of truth for task requirements and verification criteria

### Step 4: Report to User

Present a brief status report:

```
Session started. Here's where we are:

Current phase: [phase name and status]
Last completed: [what was done in the previous session]
Next task: [specific task to work on]
Key context: [any blockers, recent decisions, or important notes]

Ready to proceed with [next task]. Should I start?
```

---

## RULES

1. **Read before you write.** Never start coding without loading context first.
2. **Don't assume.** If the memory files say Phase X is next, work on Phase X — don't jump ahead or revisit completed work.
3. **Check DECISIONS.md.** If you're about to suggest something, verify it doesn't contradict a locked decision.
4. **Respect the SSWG Protocol.** For SSWG work, `agent-os/sswg/PROTOCOL.md` overrides `BRAIN/CONSTITUTION/agent-protocol.md`. Read the Protocol's "Forbidden Practices" before generating any code.
5. **Don't modify documentation at session start.** This protocol is read-only. Documentation updates happen at session closeout (`SKILLS/session-closeout/SKILL.md`).

---

## OPTIONAL: Deep Context (Read if needed for current task)

These files provide deeper context but are NOT required at session start. Read them only when the current task touches their domain:

| File | When to Read |
|------|-------------|
| `docs/AGENT_CONTEXT_MASTER.md` | First time working on this project |
| `BRAIN/VISION/project-vision.md` | Making product-level decisions |
| `BRAIN/CONSTITUTION/agent-protocol.md` | Writing WordPress block markup |
| `agent-os/sswg/PROTOCOL.md` | Any SSWG pipeline work |
| `.claude/rules/WP_FSE_SKILL.md` | Generating WordPress templates/patterns |
| `docs/fse-kb/FSE-KNOWLEDGE-BASE-INDEX.md` | Working with specific WordPress blocks |
| `CLAUDE.md` | Understanding the full agent contract |
