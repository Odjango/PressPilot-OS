
## Docker Build & Run (Coolify)

This project includes a production `Dockerfile` set up for Coolify.

### Build
```bash
docker build -t presspilot-os .
```

### Run
```bash
docker run -p 3000:3000 --env-file .env.local presspilot-os
```
