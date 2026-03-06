# STEP 3: Expand Token Schema

> **Depends on:** Step 1 (scan skeleton files for token names)
> **Estimated effort:** 1 hour
> **Output file:** `pattern-library/token-schema.json` (REWRITE)

---

## WHAT YOU'RE DOING

Rewriting `pattern-library/token-schema.json` to include EVERY token used across all skeleton files. Current file has 81 text tokens + some IMAGE tokens. New file needs ~200-250 tokens.

## HOW

1. Scan ALL files in `pattern-library/skeletons/*.html` for `{{TOKEN_NAME}}` patterns
2. Collect every unique token name
3. Write token-schema.json with an entry for each token

## TOKEN SCHEMA FORMAT

```json
{
  "tokens": [
    {
      "name": "HERO_TITLE",
      "group": "hero",
      "maxLength": 80,
      "description": "Main hero headline",
      "vertical": "general"
    },
    {
      "name": "MENU_ITEM_1_NAME",
      "group": "menu",
      "maxLength": 60,
      "description": "First menu item name",
      "vertical": "restaurant"
    },
    {
      "name": "IMAGE_HERO",
      "group": "images",
      "maxLength": 500,
      "description": "Hero background image URL",
      "vertical": "general"
    }
  ]
}
```

## MAX LENGTH GUIDELINES

| Token type | maxLength |
|-----------|-----------|
| Headlines/titles | 80 |
| Subtitles | 120 |
| Short descriptions (features, menu items) | 200 |
| Paragraphs (about, bio) | 400 |
| Testimonial quotes | 300 |
| Button labels / CTA text | 40 |
| Names (people) | 60 |
| Roles/titles (people) | 60 |
| Prices | 20 |
| Phone numbers | 30 |
| Email addresses | 60 |
| Addresses | 150 |
| Hours (e.g., "Mon-Fri 9am-5pm") | 60 |
| Image URLs | 500 |
| Stats numbers (e.g., "99.9%") | 20 |
| Stats labels (e.g., "Uptime") | 40 |

## VERTICAL FIELD VALUES

- `"general"` — used by all verticals
- `"restaurant"` — only for restaurant themes
- `"ecommerce"` — only for ecommerce themes
- `"saas"` — only for SaaS themes
- `"portfolio"` — only for portfolio themes
- `"local_service"` — only for local service themes

## VERIFICATION

```bash
# Must be valid JSON
python3 -c "import json; d=json.load(open('pattern-library/token-schema.json')); print(f'{len(d[\"tokens\"])} tokens defined')"

# Every token in skeleton files must exist in schema
python3 -c "
import json, glob, re
schema = json.load(open('pattern-library/token-schema.json'))
schema_names = {t['name'] for t in schema['tokens']}
missing = set()
for f in glob.glob('pattern-library/skeletons/*.html'):
    tokens = set(re.findall(r'\{\{(\w+)\}\}', open(f).read()))
    missing.update(tokens - schema_names)
if missing:
    print(f'MISSING from schema: {missing}')
else:
    print('All skeleton tokens covered')
"
```
