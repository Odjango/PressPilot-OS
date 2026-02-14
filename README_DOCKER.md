
## Docker Build & Run (Coolify)

This project includes a production `Dockerfile` set up for Coolify.

## Laravel M0 (Horizon) Deployment Note

- `laravel-horizon` uses `backend/docker/horizon/Dockerfile` with repo-root build context.
- Generator files are included with Docker `COPY` into `/app/generator`.
- Do not rely on local bind-mount patterns (for example `.:/app/generator:ro`) for Coolify deployments.

### Build
```bash
docker build -t presspilot-os .
```

### Run
```bash
docker run -p 3000:3000 --env-file .env.local presspilot-os
```
