# PressPilot /api/generate Debug Logs

## Local Dev Server Test (Step 3.1)

### Test Command
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Fofo Cafe",
    "businessTypeId": "restaurant_cafe",
    "businessCategoryId": "restaurant_cafe",
    "primaryLanguage": "en"
  }'
```

### Result
✅ **SUCCESS** - No errors in local dev server

**Response:**
```json
{
  "slug": "presspilot-demo-co",
  "themeZipPath": "/Users/soluwrx/Downloads/PressPilot-OS/build/themes/presspilot-demo-co.zip",
  "staticZipPath": "/Users/soluwrx/Downloads/PressPilot-OS/build/static/presspilot-demo-co.zip",
  "themeUrl": "/api/download?kind=theme&slug=presspilot-demo-co",
  "staticUrl": "/api/download?kind=static&slug=presspilot-demo-co",
  "businessTypeId": "restaurant_cafe",
  "styleVariation": "restaurant-soft",
  "kitVersion": "0.6.0",
  "siteArchetype": "service",
  "navShell": [
    {"id": "home", "label": "Home"},
    {"id": "about", "label": "About"},
    {"id": "services", "label": "Services"},
    {"id": "blog", "label": "Blog"},
    {"id": "contact", "label": "Contact"}
  ]
}
```

### Conclusion
The code works fine locally. Any errors on `presspilotapp.com` are production-specific (Coolify environment, dependencies, or configuration).

---

## Production Logs (Step 3.2)

### How to Get Production Logs

**Option 1: Via Coolify Dashboard**
1. Go to Coolify dashboard
2. Navigate to your PressPilot app
3. Click on "Logs" tab
4. Filter for `/api/generate` or errors

**Option 2: Via SSH + Docker**
```bash
# SSH into DigitalOcean server
ssh user@your-do-server

# Find the container ID
docker ps | grep presspilot

# Get last 100 lines of logs
docker logs --tail 100 <container-id>

# Or follow logs in real-time
docker logs -f <container-id>
```

**Option 3: Via Coolify CLI (if installed)**
```bash
coolify logs <app-name> --tail 100
```

### Expected Log Format
Look for:
- Stack traces starting with `Error:` or `TypeError:`
- Lines containing `/api/generate`
- Next.js build/runtime errors
- Environment variable issues
- Database/API connection errors

### Paste Production Logs Here
```
[PASTE PRODUCTION LOGS HERE - Last 100 lines related to /api/generate]
```

---

## Common Production Issues

### 1. Environment Variables Missing
- `OPENAI_API_KEY` not set in Coolify
- `NEXT_PUBLIC_SUPABASE_URL` missing
- `SUPABASE_SERVICE_ROLE_KEY` missing

### 2. Build/Runtime Errors
- Next.js build failing
- Module not found errors
- TypeScript compilation errors

### 3. API/Service Errors
- OpenAI API rate limits
- Supabase connection issues
- File system permissions

### 4. Memory/Resource Limits
- Container running out of memory
- Timeout errors
- Process killed by OOM killer

---

## Next Steps

1. ✅ Local test passed - code is correct
2. ⏳ Get production logs from Coolify
3. ⏳ Compare production vs local environment
4. ⏳ Fix production-specific issues


