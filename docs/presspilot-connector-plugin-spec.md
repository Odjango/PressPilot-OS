docs/presspilot-connector-plugin-spec.md
PressPilot Connector Plugin – v1 Spec

Goal: Let WordPress users pull themes from PressPilot SaaS into their site, without exposing AI keys or generator logic. The plugin is a thin connector; the “brain” stays on PressPilot servers.

1. User experience in wp‑admin

Menu & screens

Add a top‑level menu: PressPilot

Sub‑item: Dashboard (v1 only)

Dashboard layout

Connection status panel

Shows:

“Status: Connected as {email}” or “Status: Not connected”.

Buttons:

If disconnected: “Connect PressPilot Account”

If connected: “Manage Account in Studio” (links to SaaS account page)

Projects & themes panel

Controls:

Dropdown: “Select PressPilot project” (fetched from SaaS)

Button: “Open Studio” (opens Studio in new tab)

Button: “Sync latest theme to this site”

Installed theme status

Shows:

Current active theme name.

If it’s a PressPilot theme, show version and project name.

Buttons:

“Activate this theme” (if not active).

“Re‑sync theme files” (re‑download from SaaS, optional v1.1).

2. Core flows

Flow A – Connect site to PressPilot

User opens PressPilot → Dashboard.

If not connected, they see a “Connect PressPilot Account” button.

Clicking it opens a new tab to PressPilot Studio:

URL format (example):
https://studio.presspilot.com/connect?site_url={encoded_site_url}&nonce={nonce}

In Studio (SaaS):

User logs in (or signs up).

Sees a “Connect this WordPress site?” confirmation.

After approval:

PressPilot backend stores a mapping:

{ site_url, site_id, user_id, connector_token }.

Redirects back to wp‑admin with a short success message.

Plugin stores connector_token (or similar) in site options for authenticated API calls.

Security:

connector_token is scoped per site and cannot be used to call AI providers directly.

Flow B – Generate a theme (in Studio)

From Dashboard, user clicks “Open Studio”.

Plugin opens https://studio.presspilot.com/?site_id={site_id}&token={short_lived_token} in a new tab.

In Studio, user:

Creates or selects a PressPilot project.

Configures vertical, brand mode, hero layout, etc.

Clicks “Generate Theme”.

SaaS generator runs (PressPilot‑OS), stores theme package as e.g. project_id + version.

Studio shows “Theme v3 generated. You can now sync this to your WordPress site using the PressPilot Connector plugin.”

Flow C – Sync latest theme into WordPress

Back in wp‑admin Dashboard, plugin calls:

GET /api/projects?site_id={site_id}

Response example:

json
[
  { "id": "proj_123", "name": "Bella Cucina Trattoria", "latest_theme_version": 3 },
  { "id": "proj_456", "name": "Atlas Running Store", "latest_theme_version": 2 }
]
User selects a project in the dropdown and clicks “Sync latest theme to this site”.

Plugin sends:

POST /api/sites/{site_id}/themes/sync with body { "project_id": "proj_123" }.

Backend responds with either:

A short‑lived download URL (download_url) for a ZIP, or

Raw ZIP bytes in the response.

Plugin:

Downloads ZIP (if URL).

Uses WordPress theme APIs to install/update the theme:

If first time: create new theme (e.g. presspilot-bella-cucina).

If already installed: update files in that theme folder.

After success:

Dashboard shows:

“Installed theme: PressPilot – Bella Cucina (v3)”

Button: “Activate theme”.

When user clicks “Activate theme”, plugin calls the standard switch_theme() API.

3. Backend API endpoints (SaaS side)

All endpoints are on your PressPilot API and authenticated with connector_token or a derived short‑lived token.

POST /api/sites/connect

Input: { site_url, nonce, code } or similar.

Effect: create/update site record and return site_id + connector_token.

GET /api/projects

Query: ?site_id=...

Returns projects associated with this user/site.

GET /api/projects/{project_id}/theme

Returns metadata about latest theme version (used mostly for UI).

POST /api/sites/{site_id}/themes/sync

Body: { project_id }

Validates ownership and returns { download_url } or ZIP stream.

You can extend this later (list versions, rollbacks), but this is enough for v1.

4. What the plugin must not do

Never store or expose AI provider keys.

Never run generator logic (pattern assembly, theme building) in PHP/JS on the customer site.

Never expose internal PressPilot repo paths or implementation details.

It should only:

Handle connection/auth.

Call your backend via HTTPS.

Install/update WordPress themes from ZIPs your backend provides.

5. Implementation notes

Tech stack: small PHP plugin + minimal JS for the Dashboard screen.

UI: can use plain HTML/admin styles initially; later you can upgrade to @wordpress/components to match core wp‑admin.

Versioning: embed PressPilot theme metadata in style.css headers (e.g. PressPilot-Project: proj_123, PressPilot-Version: 3) so the plugin can read which project/version is installed.