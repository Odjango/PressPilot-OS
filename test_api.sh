#!/bin/bash
# 1. Trigger Generation
echo "Triggering API..."
curl -s -X POST https://presspilotapp.com/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "brand": {
      "business_name": "Test Pizza",
      "business_category": "restaurant_cafe",
      "slug": "test-pizza"
    },
    "language": {
      "primary_language": "en",
      "rtl_required": false
    },
    "narrative": {
      "description_long": "A test pizza place."
    },
    "visualAssets": {
      "has_logo": false,
      "image_source_preference": "stock-only"
    },
    "visualControls": {
      "palette_id": "default",
      "font_pair_id": "default",
      "layout_density": "balanced",
      "corner_style": "rounded"
    },
    "modes": {
      "business_category": "restaurant_cafe",
      "restaurant": { "enabled": true },
      "ecommerce": { "enabled": false }
    }
  }' > response.json

# 2. Extract URL (Primitive JSON parsing)
# Looking for "themeUrl": "..."
THEME_PATH=$(grep -o '"themeUrl":"[^"]*"' response.json | cut -d'"' -f4)
FULL_URL="https://presspilotapp.com${THEME_PATH}"

echo "Downloading Theme from: $FULL_URL"

# 3. Download Zip
curl -s -o test_theme.zip "$FULL_URL"

# 4. Inspect Header
echo "Inspecting parts/header.html..."
unzip -p test_theme.zip parts/header.html > extracted_header.html

if grep -q "wp:site-logo" extracted_header.html; then
  echo "✅ SUCCESS: Header contains FSE blocks!"
  exit 0
else
  echo "❌ FAILURE: Header missing FSE blocks."
  cat extracted_header.html
  exit 1
fi
