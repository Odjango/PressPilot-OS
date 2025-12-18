# SECRET ROTATION PROOF (INCIDENT RESPONSE)

**Date**: 2025-12-17
**Status**: PENDING USER ACTION
**Agent**: C3 (Incident Response)

## 1. Context
Previous build logs may have exposed build arguments. To secure the environment, keys must be rotated.

## 2. Rotation Checklist
The USER certifies the following actions:

### [ ] OpenAI API Key
1. **Revoke**: Old key revoked in OpenAI Dashboard.
2. **Generate**: New key generated.
3. **Update**: New key saved in Coolify Environment Variables (`OPENAI_API_KEY`).

### [ ] Supabase Service Role Key
1. **Regenerate**: Settings > API > Service Role > Generate New Secret.
2. **Update**: New key saved in Coolify Environment Variables (`SUPABASE_SERVICE_ROLE_KEY`).

### [ ] Supabase Anon Key (Optional but Recommended)
1. **Regenerate**: Settings > API > Anon Public > Generate New Secret.
2. **Update**: New key saved in Coolify Environment Variables (`NEXT_PUBLIC_SUPABASE_ANON_KEY`).

### [ ] Redeploy Triggered
1. Coolify Deployment manually triggered (or via Agent C4) to pick up new env vars.

## 3. Operations Handover
Once keys are rotated and Coolify Env updated, please command: **"KEYS ROTATED"**.
Agent C4 will then verify the deployment logic (logs, container output).
