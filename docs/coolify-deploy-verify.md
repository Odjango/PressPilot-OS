# Coolify Deployment Verification (Git SHA Lock)
*Release*: Hard Gates + Core Parse Proof
*Date*: 2025-12-15

## 1. Release Identity
-   **Tag**: `stage-hard-gates-locked-2025-12-15`
-   **Git SHA**: `7c4e678c12fee7e695769b2ed001b7ac8d04f7d5`
-   **Message**: `Lock: Hard Gates + Core Parse Proof (Attempt Recovery eliminated)`

## 2. Verification Steps (Coolify UI)
Log in to your Coolify dashboard and navigate to the project deployment.

### A. Confirm Build Context
1.  Go to **Deployments** tab.
2.  Click the latest deployment (Status: **Success**).
3.  Check **Build Log** header or "Source" info.
4.  ✅ Verify **Commit SHA** matches: `7c4e678...` (first 7 chars).

### B. Confirm Runtime State
1.  Go to **Logs** tab (Container Logs).
2.  Restart the container if needed to see startup logs.
3.  ✅ Verify the application started successfully with the new code.
4.  (Optional) If your app implies a version endpoint, verify it returns version `1.2` or the current timestamp.

## 3. Deployment Action
If the current live deployment does not match the SHA above:
1.  Click **Deploy** (or **Redeploy**).
2.  Select **Tag** or **Branch** (main/HEAD).
3.  Wait for "Build Success".
4.  Repeat verification steps.
