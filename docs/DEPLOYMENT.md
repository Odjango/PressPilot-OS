# PressPilot Deployment Guide

## Current State (Feb 19, 2026)
- **VPS provider**: DigitalOcean Basic Droplet (`134.209.167.43`)
- **VPS upgrade**: from `4 GB RAM / 48 GB disk` to `8 GB RAM / 160 GB disk`
- **Compute/cost**: `4 vCPUs`, `$48/mo`
- **Orchestration**: Coolify v4
- **Containers**:
  - `presspilot-nextjs-frontend`
  - `laravel-app` (backend API)
  - `laravel-horizon` (queue worker)
  - `pp-redis` (queue storage)
  - `wordpress-factory` (preview/activation)

## Deployment Notes

### Frontend Dockerfile optimization
- Removed duplicate Playwright Chromium install step.
- Added cleanup commands in image build flow to reduce layer bloat and disk pressure.

### Backend connectivity (Docker DNS) — RESOLVED
- **Production value:** `BACKEND_URL=http://laravel-app:8080` (Docker Compose service name)
- Stable across redeploys — no manual IP lookup needed.
- **Coolify v4 behavior:** ignores `container_name` from docker-compose; the Docker Compose **service name** is what resolves.
- Cross-app DNS confirmed working (Feb 21): `laravel-app` resolves from the frontend container via the shared `coolify` external network.
- Same pattern as Redis: `REDIS_HOST=pp-redis` (service name, not IP).

### Runtime preview file serving
- Next.js does not reliably serve runtime-created files from `/public/tmp/previews/`.
- Preview images are now served through API route:
  - Route: `app/api/previews/[...path]/route.ts`
  - Public URL shape: `/api/previews/<sessionId>/<file>.png`
- Hero preview endpoints/runners should reference `/api/previews/` instead of `/tmp/previews/`.

### Code path updates for previews
- `app/api/previews/[...path]/route.ts` added to stream preview files from `/app/public/tmp/previews/` at runtime.
- `app/api/studio/hero-previews/route.ts` line 231 updated from `/tmp/previews/` to `/api/previews/`.
- `src/preview/HeroPreviewRunner.ts` line 192 updated from `/tmp/previews/` to `/api/previews/`.
- `src/preview/HeroPreviewRunner.ts` line 254 updated from `/tmp/previews/` to `/api/previews/`.

## Environment Variables

### Frontend (`presspilot-nextjs-frontend`)
- `BACKEND_URL` - `http://laravel-app:8080` (Docker Compose service name, stable across redeploys)
- `WP_PREVIEW_URL` - WordPress Factory URL (`https://factory.presspilotapp.com`)
- `WP_PREVIEW_USER` - WordPress admin username
- `WP_PREVIEW_PASS` - WordPress admin password
- `NEXT_PUBLIC_FACTORY_URL` - Public WordPress URL
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` - `/usr/bin/chromium`

### Backend (Laravel)
- `REDIS_HOST` - `pp-redis` (not `redis`, to avoid Coolify conflict)
- `DATABASE_URL` - Supabase PostgreSQL connection
- `SUPABASE_SERVICE_ROLE_KEY` - storage uploads

## Verification Commands

### Verify backend connectivity
```bash
# From Coolify > frontend container > Terminal (curl not available, use node):
node -e "require('http').get('http://laravel-app:8080/up', r => { console.log(r.statusCode === 200 ? 'DNS OK' : 'DNS FAIL'); r.resume(); }).on('error', () => console.log('DNS FAIL'))"
```

### Check server resources
```bash
free -h && df -h /
```

### Clean Docker to free disk
```bash
docker system prune -a -f && docker builder prune -a -f
```

## Common Issues & Solutions

### "No space left on device"
Run:
```bash
docker system prune -a -f && docker builder prune -a -f
```
Then redeploy affected services.

### Redis WRONGPASS or DNS conflict
Redis service must be named `pp-redis` (not `redis`) to avoid collision with Coolify internal services.

### WordPress login failed
Credentials are `WP_PREVIEW_USER` / `WP_PREVIEW_PASS` (not `WP_ADMIN_*`).
Reset password:
```bash
docker exec wordpress-moosc0gwkg48kss04c8cgkc4 wp user update admin --user_pass=NewPassword123 --allow-root
```
