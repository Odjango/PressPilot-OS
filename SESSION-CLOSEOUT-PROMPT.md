# Standard Session Prompts

> **Copy and paste these at the start and end of every coding session.**
> Works with any AI coding agent (Claude, Cursor, Windsurf, Copilot, etc.)

---

## SESSION START PROMPT

```
New session. Read SKILLS/session-start/SKILL.md and execute all steps.

Load project context from: PROJECT_ROADMAP.md, _memory/main.md, DECISIONS.md, BRAIN/MEMORY/project_state.md.

Tell me: what phase are we in, what was done last session, and what's the next task. Then read the relevant phase spec if one exists.

Remember: I'm not a coder. Give me exact commands or do the work yourself.
```

### Short Version
```
New session. Read SKILLS/session-start/SKILL.md. Load context, report status, identify next task.
```

---

## SESSION CLOSEOUT PROMPT

```
Session closeout. Read SKILLS/session-closeout/SKILL.md and execute all steps.

Update these files with what was accomplished this session:
1. changelog.md — add dated entry for today's work
2. _memory/main.md — update phase status, commits, lessons learned
3. BRAIN/MEMORY/project_state.md — update header and current status
4. DECISIONS.md — add to session log, update change log if any decisions changed
5. docs/PROJECT_ROADMAP.md — update phase status if it changed

Then verify all 5 files are consistent with each other (same phase status, same tech stack, no contradictions).

End with a summary of what was updated and what the next agent should work on.
```

### Short Version
```
Close session. Update changelog.md, _memory/main.md, BRAIN/MEMORY/project_state.md, DECISIONS.md session log, and PROJECT_ROADMAP.md with today's work. Verify consistency.
```
