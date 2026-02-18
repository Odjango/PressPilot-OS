# PressPilot Deployment Guide

## Infrastructure Overview
- **VPS**: DigitalOcean Droplet (134.209.167.43)
- **Orchestration**: Coolify v4
- **Containers**:
  - presspilot-nextjs-frontend
  - laravel-app (backend API)
  - laravel-horizon (queue worker)
  - pp-redis (queue storage)
  - wordpress-factory (preview/activation)

## Environment Variables

### Frontend (presspilot-nextjs-frontend)
- `BACKEND_URL` - Laravel internal IP (currently http://10.0.1.10:8080)
- `WP_PREVIEW_URL` - WordPress Factory URL (https://factory.presspilotapp.com)
- `WP_PREVIEW_USER` - WordPress admin username
- `WP_PREVIEW_PASS` - WordPress admin password
- `NEXT_PUBLIC_FACTORY_URL` - Public WordPress URL
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` - /usr/bin/chromium

### Backend (Laravel)
- `REDIS_HOST` - pp-redis (not "redis" to avoid Coolify conflict)
- `DATABASE_URL` - Supabase PostgreSQL connection
- `SUPABASE_SERVICE_ROLE_KEY` - For storage uploads

## Docker Network Notes
- All services must be on Coolify network for inter-container communication
- Laravel IP may change after redeploy - verify with:
```bash
  docker inspect $(docker ps --format "{{.Names}}" | grep laravel-app) --format '{{range .NetworkSettings.Networks}}{{.IPAddress}} {{end}}'
```
- Update BACKEND_URL in frontend if IP changes

## Common Issues & Solutions

### "No space left on device"
```bash
docker system prune -af --volumes
```
Then redeploy affected services.

### Redis WRONGPASS or DNS conflict
The Redis service is named `pp-redis` (not `redis`) to avoid DNS conflict with Coolify's internal `coolify-redis`.

### WordPress login failed
Credentials are in `WP_PREVIEW_USER` and `WP_PREVIEW_PASS` (not WP_ADMIN_*).
Reset password:
```bash
docker exec wordpress-moosc0gwkg48kss04c8cgkc4 wp user update admin --user_pass=NewPassword123 --allow-root
```

### Generator "file not found" errors
Ensure Horizon Dockerfile copies all required paths:
- src/generator
- lib
- proven-cores
- assets (includes patterns/)
- bin
- tsconfig.json
