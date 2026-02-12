# PressPilot Validator Agent Spec

**Updated**: 2026-02-12
**Status**: Active

---

## Purpose

The validation pipeline ensures generated WordPress themes are valid before delivery to users.

---

## Validation Pipeline

The Node.js generator runs 3 validators in sequence:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          VALIDATION PIPELINE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [Generated Theme]                                                          │
│       │                                                                     │
│       ▼                                                                     │
│  StructureValidator                                                         │
│       │  - Single top-level folder                                          │
│       │  - No nested theme folders                                          │
│       │  - Required files at root (style.css, index.php, theme.json)        │
│       │  - templates/ directory exists                                      │
│       │  - parts/ directory exists                                          │
│       │                                                                     │
│       ▼                                                                     │
│  BlockValidator                                                             │
│       │  - Opening/closing comments balanced                                │
│       │  - No orphaned block comments                                       │
│       │  - Valid block grammar in templates                                 │
│       │                                                                     │
│       ▼                                                                     │
│  TokenValidator                                                             │
│       │  - No forbidden demo strings                                        │
│       │  - No raw placeholders ({{variable}})                               │
│       │  - No HTML entities (&#039;)                                        │
│       │  - Brand colors properly injected                                   │
│       │                                                                     │
│       ▼                                                                     │
│  [PASS] ─────► ZIP created, uploaded to S3                                  │
│  [FAIL] ─────► Error returned, job marked failed                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Validator Locations

| Validator | Path |
|-----------|------|
| StructureValidator | `src/generator/validators/StructureValidator.ts` |
| BlockValidator | `src/generator/validators/BlockValidator.ts` |
| TokenValidator | `src/generator/validators/TokenValidator.ts` |

---

## Validation Rules

### Structure Validation

| Check | Failure Condition |
|-------|-------------------|
| Root structure | More than one top-level folder |
| Nesting | Theme folder inside another folder |
| style.css | Missing from root |
| index.php | Missing from root |
| theme.json | Missing from root |
| templates/ | Directory missing |
| parts/ | Directory missing |

### Block Grammar Validation

| Check | Failure Condition |
|-------|-------------------|
| Opening comments | `<!-- wp:` without matching `<!-- /wp:` |
| Closing comments | `<!-- /wp:` without matching opening |
| Nesting depth | Unbalanced nesting levels |
| Self-closing | Invalid self-closing block syntax |

### Token Validation

| Check | Failure Condition |
|-------|-------------------|
| Demo content | Contains "Lorem ipsum", "Starter Theme", etc. |
| Raw placeholders | Contains `{{variable}}` patterns |
| HTML entities | Contains `&#039;`, `&quot;` in visible text |
| Missing colors | Color slugs not defined in theme.json |

---

## Common Errors and Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "Nested theme folder" | ZIP has double folder | Check archiver output path |
| "Missing style.css" | Wrong root path | Verify theme directory structure |
| "Unbalanced blocks" | Missing closing comment | Check pattern source in proven-cores |
| "Forbidden string" | Demo content leaked | Check content injection pipeline |

---

## When Themes Fail Validation

1. Generation stops immediately
2. Error details logged to stderr
3. Job status set to "failed" in database
4. Error message returned to user

**Note**: All validators run BEFORE ZIP creation. Invalid themes are never uploaded to S3.

---

## Testing Themes Manually

To validate a theme manually:

1. Upload ZIP to WordPress Playground
2. Activate theme
3. Open Site Editor
4. Check for "Attempt Recovery" prompts

If no recovery prompts appear, the theme passes validation.

---

*Part of PressPilot constitutional documentation*
