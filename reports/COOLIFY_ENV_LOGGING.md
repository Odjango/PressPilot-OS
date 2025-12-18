# COOLIFY ENV LOGGING GUIDANCE

**Date**: 2025-12-17
**Agent**: B (Coolify Log Leak Control)

## 1. The Issue
Coolify's build process often injects environment variables into the build container. If the build logic (e.g., `git`, `npm`, or internal Coolify helpers) echoes commands or environment states, secrets can be printed to the logs.

## 2. Root Cause
- **Internal Handling**: Coolify may run commands like `cat .env` or echo build arguments for debugging in its helper containers.
- **Dockerfile ARGs**: Using `ARG SECRET` makes the value visible in `docker history` and often in build logs if `RUN` instructions are simple.

## 3. Mitigation Strategy (Repo Level)
We have implemented the following strictly in `Dockerfile`:
1. **No ARGs**: Removed all `ARG` instructions for secrets (`OPENAI_API_KEY`, `SUPABASE_*`).
2. **Runtime Only**: Secrets are provided *only* to the running container, not the build process.
3. **No Echo**: Ensured no `RUN printenv` or `RUN cat .env` exists in our build steps.

## 4. Recommendation for Operator
- **Avoid "Build Options"**: Do not enable "Show Build Logs" that include environment dumping options in Coolify UI if available.
- **Rotate Keys**: If a build log ever exposes a key, consider it compromised (Agent C3 procedure).

**Status**: Repo is configured to minimize leaks.
