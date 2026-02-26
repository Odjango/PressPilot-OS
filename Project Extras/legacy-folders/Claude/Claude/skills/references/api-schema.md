# Factory Plugin API Reference

## Base URL

```
https://factory.presspilotapp.com/wp-json/starter/v1/
```

## Endpoints

### Health Check
```
GET /health
```
Returns plugin status. Use to verify factory is running.

### Generate Theme
```
POST /generate
Content-Type: application/json
```

## Generate Theme Payload Schema

```json
{
  "business_name": "string (required)",
  "business_category": "string (required) - e-commerce|restaurant|...",
  "business_description": "string (required)",
  "tagline": "string (optional)",
  "brand_colors": {
    "primary": "#hexcolor",
    "secondary": "#hexcolor",
    "accent": "#hexcolor"
  },
  "content": {
    "hero_title": "string",
    "hero_subtitle": "string",
    "about_text": "string",
    "services": ["string array"],
    "features": [
      {
        "title": "string",
        "description": "string",
        "icon": "string (optional)"
      }
    ],
    "cta_text": "string",
    "cta_button": "string"
  },
  "images": {
    "hero": "url string",
    "about": "url string",
    "gallery": ["url strings"]
  },
  "contact": {
    "email": "string",
    "phone": "string",
    "address": "string"
  },
  "social": {
    "facebook": "url",
    "instagram": "url",
    "twitter": "url"
  },
  "language": "en|es|fr|it|ar",
  "theme_options": {
    "dark_mode": "boolean",
    "base_theme": "string (optional - auto-selected if not provided)"
  }
}
```

## Response Schema

### Success (200)
```json
{
  "success": true,
  "theme_url": "https://factory.presspilotapp.com/themes/generated/theme-slug.zip",
  "theme_slug": "business-name-theme",
  "preview_url": "https://factory.presspilotapp.com/preview/theme-slug"
}
```

### Error (400/500)
```json
{
  "success": false,
  "error": "Error message here",
  "code": "ERROR_CODE"
}
```

## n8n HTTP Request Node Config

```
Method: POST
URL: https://factory.presspilotapp.com/wp-json/starter/v1/generate
Authentication: None (or Bearer Token if configured)
Headers:
  Content-Type: application/json
Body: JSON from previous workflow nodes
```

## Common Payload Mistakes

1. **Sending to wrong endpoint**: Must be `factory.presspilotapp.com`, not `presspilotapp.com`
2. **Missing required fields**: Always include business_name, business_category, business_description
3. **Invalid hex colors**: Must be full 6-digit hex with # prefix
4. **Empty arrays**: Don't send empty arrays, omit the field instead
5. **Wrong content-type**: Must be `application/json`
