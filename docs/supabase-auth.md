## Supabase Authentication Overview

### Required Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only; never shipped to the browser)

### Tables & RLS
- `pp_profiles`: RLS enforces `email = auth.jwt()->>'email'`
- `pp_projects`: RLS enforces `owner_email = auth.jwt()->>'email'`

All client queries also filter by the same fields to align with RLS.

### Browser Auth Flow
1. `/auth` uses Supabase email + password sign-in via the shared browser client.
2. Supabase stores the session locally (persisted session, auto-refresh).
3. `HeaderAuthStatus` (client component) reflects state:
   - Logged out → “Sign in” button linking to `/auth`
   - Logged in → “Signed in as … · Sign out” (calls `supabase.auth.signOut()` and redirects to `/auth`)

### Manual Flow
1. `/auth` → sign in → redirected to `/projects`
2. `/projects` → loads existing projects, allows create/update tied to `owner_email`
3. `/profile` → loads profile fields, allows save/upsert tied to `email`
4. Header “Sign out” → logs out and returns to `/auth`

### Troubleshooting
- **Missing env vars**: the shared client logs a warning and falls back to placeholder URL/key (development only). Production must use valid env values.
- **RLS access errors**: the client surfaces “Unable to load … Please try again”; check the console for `[ProjectsClient]` or `[ProfileClient]` logs describing the Supabase error (usually “permission denied for table …”).
- **Service role key exposure**: `SUPABASE_SERVICE_ROLE_KEY` must stay server-only. If it’s ever bundled client-side, remove it immediately and rotate the key in Supabase.


