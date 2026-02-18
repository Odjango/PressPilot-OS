# Known Issues & Future Work

## Current Issues (as of Feb 17, 2026)

### P1 - Hero Previews Not Displaying
- **Symptom**: Screenshots captured but images show broken/404
- **Cause**: `/tmp/previews/` path not served as static files
- **Location**: Frontend static file configuration
- **Fix needed**: Configure Next.js to serve `/public/tmp/previews/` or change output path

### P2 - Brand Colors Incomplete
- **Symptom**: Logo has green, red, golden orange but only red applied to theme
- **Cause**: Color extraction not capturing full palette from logo
- **Location**: `src/generator/modules/` - color extraction logic, `TT4TokenMapper`
- **Fix needed**: Improve multi-color extraction and mapping to theme tokens

### P3 - Hero Style Mismatch
- **Symptom**: User selects "Full Bleed" but gets "Full Width" layout
- **Cause**: Hero style preference not passed through generation pipeline
- **Location**: Frontend -> Backend -> Generator parameter passing
- **Fix needed**: Trace heroStyle parameter through entire flow

### P4 - Download as Folder Instead of ZIP
- **Symptom**: Theme downloads as folder, not .zip file
- **Cause**: Frontend download handler or response content-type
- **Location**: Frontend download logic
- **Fix needed**: Ensure proper ZIP streaming/download

### P5 - Design Quality
- **Symptom**: Generated themes need more polish
- **Areas**:
  - More business-specific images
  - Better section layouts
  - Richer content generation
- **Location**: Generator recipes, patterns, content builders

## Resolved Issues (Feb 17, 2026)

- ✅ Redis DNS conflict - renamed service to pp-redis
- ✅ WordPress Factory connection - added WP_PREVIEW_URL
- ✅ WordPress login - correct env vars (WP_PREVIEW_USER/PASS)
- ✅ Playwright chromium - switched to node:20-slim, installed system chromium
- ✅ Docker network connectivity - updated BACKEND_URL to coolify network IP
- ✅ Missing assets/patterns - added COPY to Horizon Dockerfile
- ✅ Disk space issues - documented prune procedure
