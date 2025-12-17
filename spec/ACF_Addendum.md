# ACF Addendum & Schemas v1.0

## 1. Trigger Authority
- **Source**: `task-brief.json`
- **Property**: `acf.enabled` (Boolean)
- **Rule**: If `acf.enabled !== true`, NO ACF files shall be generated or referenced.

## 2. Task Brief Schema (Subset)
Required structure for valid execution:
```json
{
  "project_name": "String",
  "theme_slug": "String",
  "acf": {
    "enabled": "Boolean",
    "definitions": "Array<FieldGroup>"
  },
  "content_strategy": "String"
}
```

## 3. Forbidden Zones
ACF usage is **strictly prohibited** in the following contexts:
- **Presentation Logic**: Do not use ACF for spacing, colors, or fonts (Use `theme.json`).
- **Navigation**: Do not use ACF to build menus (Use Block Navigation).
- **Template Parts**: Headers and Footers should rely on Site Editing features, not ACF Options pages, unless explicitly required for Global Settings.
- **HTML Injection**: ACF fields must never output raw, unescaped HTML into templates without strict sanitization (Agent must prefer structured block usage).
