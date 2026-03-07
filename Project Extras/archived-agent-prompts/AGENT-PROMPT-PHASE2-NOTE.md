# Phase 2: P5 Diagnosis — Manual Session Required

> **This phase does NOT have an agent prompt.** It requires live server access.

---

## Why No Agent Prompt

Phase 2 (diagnosing the P5 generation stall at "Building Your Assets") requires:
- SSH access to the DigitalOcean VPS
- Coolify dashboard access to view container logs
- Horizon dashboard access to inspect failed/pending jobs
- Docker container access to test subprocess execution
- Supabase dashboard access to verify storage permissions

An AI coding agent working on the local codebase cannot diagnose a production infrastructure issue. This must be done by Omar in a hands-on debugging session.

## What to Do

Refer to `GENERATOR-FIX-PLAN.md` → Phase 2 for the full diagnostic checklist (Tasks 2.1–2.6).

Quick summary:
1. Check Coolify log tab for Laravel/Horizon output
2. Check Horizon dashboard at `{BACKEND_URL}/horizon` for failed jobs
3. Test Node subprocess manually inside Horizon container
4. Check Supabase storage for upload errors
5. Fix root cause and verify E2E

## When to Do It

Phase 2 is independent of Phases 3 and 4. You can:
- Do Phase 2 first (if you want production working before adding validation)
- Do Phases 3+4 first (if you want the validation pipeline ready before touching production)
- Do them in parallel (different sessions)

## After Phase 2

Update `docs/KNOWN_ISSUES.md` to mark P5 as RESOLVED with the root cause and fix.
Update `_memory/main.md` with the diagnosis details.
