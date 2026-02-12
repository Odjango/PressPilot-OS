# PressPilot Generator Security Hardening Plan

## Position in Roadmap

| Order | Task | Status |
|-------|------|--------|
| 1 | Fix Bold/Minimal contrast | ✅ Done (commit 5b975b5) |
| 2 | Commit all contrast fixes | ✅ Done |
| 3 | **Security Hardening (Phase 1)** | ⏳ **INSERT HERE** |
| 4 | D - Improve Restaurant patterns | ⏳ Pending |
| 5 | B - Add New Vertical (Ecommerce/SaaS) | ⏳ Pending |
| 6 | A - Playground navigation bug | Low priority |

> **Why here?** Security hardening should happen BEFORE adding more patterns/verticals. Every new pattern multiplies injection surfaces. Lock down the sanitization layer first, then all future code inherits protection.

---

## Phase 1: Generator Security (Current Scope)

### Threat Model

| Risk | Attack Vector | Impact |
|------|---------------|--------|
| Path Traversal | `../../../etc/passwd` in theme name | Arbitrary file write outside ZIP |
| PHP Injection | `<?php system($_GET['cmd']); ?>` in content | RCE on WordPress sites |
| Template Injection | `{{constructor.constructor('return this')()}}` | Prototype pollution |
| Null Byte Injection | `theme\x00.php` | Extension bypass |

### Files to Modify/Create

```
src/generator/
├── utils/
│   └── sanitize.ts          # NEW - sanitization utilities
├── engine/
│   └── ThemeWriter.ts       # MODIFY - apply sanitizePath()
│   └── StyleEngine.ts       # MODIFY - apply sanitizeForCSS()
├── patterns/
│   └── *.ts                  # AUDIT - ensure sanitizeForPHP() on all dynamic content
tests/
└── security/
    └── malicious-input.test.ts  # NEW - attack payload tests
```

---

## Codex Prompt: Security Hardening Phase 1

Copy and paste this to Codex:

---

> **Task: Add security hardening to the generator**
>
> **Context:**
> - Generator lives in `src/generator/`
> - Entry point is `bin/generate.ts`
> - Patterns are in `src/generator/patterns/`
> - Generated themes include PHP files, theme.json, style.css, and block templates
>
> **Part 1: Create sanitization utilities**
>
> Create `src/generator/utils/sanitize.ts` with these functions:
>
> ```typescript
> /**
>  * Sanitizes a filename/path component to prevent path traversal
>  * - Removes ../ and ..\ sequences
>  * - Removes null bytes
>  * - Strips leading/trailing whitespace
>  * - Replaces dangerous characters with safe alternatives
>  * - Returns only the basename (no directory components)
>  */
> export function sanitizePath(filename: string): string
>
> /**
>  * Escapes a string for safe embedding in PHP code
>  * - Escapes single quotes, backslashes
>  * - Removes null bytes
>  * - Safe for use in: $var = 'USER_CONTENT';
>  */
> export function sanitizeForPHP(value: string): string
>
> /**
>  * Escapes a string for safe embedding in CSS
>  * - Escapes backslashes, quotes
>  * - Removes url(), expression(), javascript:
>  * - Safe for use in: content: "USER_CONTENT";
>  */
> export function sanitizeForCSS(value: string): string
>
> /**
>  * Escapes a string for safe embedding in HTML/WordPress blocks
>  * - Converts < > & " ' to HTML entities
>  * - Safe for use in block content
>  */
> export function sanitizeForHTML(value: string): string
>
> /**
>  * Validates a theme slug
>  * - Only allows lowercase letters, numbers, hyphens
>  * - Max 50 characters
>  * - Returns sanitized slug or throws if invalid
>  */
> export function validateThemeSlug(slug: string): string
> ```
>
> **Part 2: Apply sanitization to file writing**
>
> Find all places where files are written to the ZIP/filesystem:
> - Theme directory name
> - File paths within the theme
> - Any user-provided values that become filenames
>
> Apply `sanitizePath()` to ALL paths before writing.
> Apply `validateThemeSlug()` to the theme name/slug.
>
> **Part 3: Apply sanitization to content generation**
>
> Find all places where user-provided content is embedded in:
> - PHP files (functions.php, any PHP templates) → use `sanitizeForPHP()`
> - CSS files (style.css, theme.json CSS values) → use `sanitizeForCSS()`
> - HTML/Block content → use `sanitizeForHTML()`
>
> Look specifically at:
> - Business name, tagline, descriptions
> - Menu items, prices, content
> - Any placeholder replacement (e.g., `{{business_name}}`)
>
> **Part 4: Create security tests**
>
> Create `tests/security/malicious-input.test.ts`:
>
> ```typescript
> const ATTACK_PAYLOADS = [
>   // Path traversal
>   '../../../etc/passwd',
>   '..\\..\\..\\windows\\system32',
>   'theme/../../../evil',
>   
>   // PHP injection
>   '<?php system($_GET["cmd"]); ?>',
>   '<?= shell_exec($cmd) ?>',
>   '${system("whoami")}',
>   
>   // Null bytes
>   'theme\x00.php',
>   'name\0injection',
>   
>   // Template injection
>   '{{constructor.constructor("return this")()}}',
>   '${7*7}',
>   
>   // HTML/XSS
>   '<script>alert(1)</script>',
>   '<img src=x onerror=alert(1)>',
>   'javascript:alert(1)',
>   
>   // CSS injection
>   'expression(alert(1))',
>   'url(javascript:alert(1))',
>   '</style><script>alert(1)</script>',
> ];
>
> // Test each payload through the generator
> // Verify NONE appear in raw form in any generated file
> // Verify all are either escaped or rejected
> ```
>
> **Part 5: Add npm security script**
>
> Add to `package.json`:
> ```json
> {
>   "scripts": {
>     "security:test": "jest tests/security/",
>     "security:audit": "npm audit --audit-level=high"
>   }
> }
> ```
>
> **Verification:**
> 1. Run `npm run security:test` — all tests pass
> 2. Run `npm run security:audit` — no high/critical vulnerabilities
> 3. Regenerate all 4 brand modes with a malicious business name like `../../../evil<?php system('id'); ?>` and verify the output is safe
>
> **Do NOT:**
> - Auto-patch without showing the changes
> - Skip any file that writes to disk
> - Assume any input is safe

---

## Expected Output

After Codex completes, you should have:

```
src/generator/utils/sanitize.ts       # New file
tests/security/malicious-input.test.ts # New file
package.json                           # Updated scripts
+ modifications to ThemeWriter, patterns, etc.
```

## Commit Message (after review)

```
git add src/generator/utils/sanitize.ts tests/security/ package.json
git add -u  # any modified files
git commit -m "security(generator): add input sanitization and attack payload tests

- Add sanitize.ts with path/PHP/CSS/HTML sanitization utilities
- Apply sanitizePath() to all file write operations
- Apply sanitizeForPHP/CSS/HTML to user content in templates
- Add malicious input test suite with attack payloads
- Add npm security:test and security:audit scripts

Protects against: path traversal, PHP injection, XSS, null byte attacks"
```

---

## Phase 2: CI Integration (After Phase 1 Merges)

Add `.github/workflows/security.yml`:

```yaml
name: Security Gate

on:
  pull_request:
  push:
    branches: [main, 001-generator-2-baseline]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - name: Security tests
        run: npm run security:test
      - name: Dependency audit
        run: npm audit --audit-level=high
```

---

## Phase 3: Laravel API Security (Future)

When Laravel calls the generator via subprocess:

```php
// In Laravel controller/service

// NEVER do this:
// exec("node bin/generate.ts --name=" . $request->input('name'));

// ALWAYS do this:
$name = $request->input('name');
$safeName = preg_replace('/[^a-z0-9\-]/', '', strtolower($name));
$process = new Process(['node', 'bin/generate.ts', '--name', $safeName]);
$process->run();
```

---

## Reference: Artor Security Document

The full security framework from the Artor agent chat is preserved for future reference when building Auth, Billing, and n8n integration layers. Key concepts to implement later:

- Module-based scan map (`security-scan-map.json`)
- Hard-fail deploy rules for critical findings
- Security gate reports (`security_gate_report.md`)
- Stripe webhook signature verification
- n8n webhook authentication
- Domain memory access control
