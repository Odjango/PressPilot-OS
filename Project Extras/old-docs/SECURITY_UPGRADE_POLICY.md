# Next.js Security Upgrade Policy

## 1. Zero-Tolerance Version Policy
We maintain a strict **pinned version** policy for `next`. 
- **NO ranges** (`^`, `~`) are allowed in `package.json`.
- **NO vulnerable versions** are allowed.
- The pipeline will **BLOCK** any PR or deployment that attempts to use a Next.js version older than the security baseline (currently 15.5.7).

## 2. Automated Upgrade Bot
We use a GitHub Action (`.github/workflows/next-security-upgrade.yml`) that runs every 6 hours to:
1.  Check the npm registry for new Next.js releases.
2.  If a new patch is found, it automatically upgrades `package.json`.
3.  It runs `npm install` and `npm run build` to verify integrity.
4.  It opens a Pull Request tagged "Security" and assigns `@Odjango`.
5.  It triggers a production deployment on Vercel if the build passes.

## 3. Safety Gate (`next-version-guard`)
A separate workflow runs on every PR and Push:
- It parses `package.json`.
- It fails inspection if the version is below the baseline.
- **Result:** You cannot merge code with an insecure Next.js version.

## 4. Notifications (N8N)
We use N8N to centralize alerts. The webhook endpoint is:
`https://n8n.presspilotapp.com/webhook/nextjs-security-alert`

Triggers:
- **Vulnerability Detected**: When the bot indicates an upgrade is available.
- **PR Created**: When the bot submits a fix.
- **Gate Blocked**: If a developer tries to push vulnerable code.

## 5. Manual Overrides (Emergency Only)
If a security patch introduces a critical regression code-wise:
1.  Temporarily update the `REQUIRED_VERSION` variable in `.github/workflows/next-version-guard.yml` to the older, working version (ACCEPTING THE RISK).
2.  Document the CVE and the reason for the downgrade in this file.
3.  Prioritize fixing the code regression immediately.
