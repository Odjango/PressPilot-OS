# COOLIFY SECRETS POSTURE & ROTATION PLAN

**Date**: 2025-12-17
**Status**: CLEAN
**Agent**: C2 (Secrets Hygiene)

## 1. Build-Time Secrets Posture
- **Audit**: `Dockerfile.coolify` scanned.
- **Finding**: No `ARG` instructions found for specific secrets (e.g., `OPENAI_API_KEY`, `SUPABASE_KEY`).
- **Policy**: STRICTLY DISALLOW build-time secret injection via `ARG`. All secrets must be injected at runtime via Coolify Environment Variables.

## 2. Configuration Validated
- `ENV` instructions in Dockerfile are limited to public configuration (`NODE_ENV`, `PORT`).
- **Action Taken**: None required (Artifact was already clean).

## 3. Incident Response: Key Rotation (Agent C3)
Due to potential exposure in previous build logs (before this fix), the following keys **MUST BE ROTATED immediately**:

### A. OpenAI API Key
- **Action**: Revoke old key -> Generate new key -> Update Coolify `OPENAI_API_KEY`.
- **Status**: [ ] Pending User Action

### B. Supabase Service Role Key
- **Action**: In Supabase Dashboard > Settings > API -> Generate new Service Role Key -> Update Coolify `SUPABASE_SERVICE_ROLE_KEY`.
- **Status**: [ ] Pending User Action

### C. Supabase Anon Key (Recommended)
- **Action**: Rotate if listed in build args previously.
- **Status**: [ ] Pending User Action

## 4. Verification Check
After rotation, redeploy and verify logs do not print these values.
