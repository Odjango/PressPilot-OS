# Theme Debugging Reference

## Theme Activation Crash - Deep Dive

When a generated theme crashes WordPress on activation, work through these checks in order.

### 1. Required Files Check

Every FSE theme MUST have:
```
theme-name/
├── style.css          (with valid header)
├── theme.json         (FSE configuration)
├── functions.php      (can be empty but must exist)
├── index.php          (can just have comment)
└── templates/
    └── index.html     (main block template)
```

### 2. style.css Header Validation

Must have these exact comment fields:
```css
/*
Theme Name: Theme Name Here
Theme URI: https://presspilotapp.com
Author: PressPilot
Author URI: https://presspilotapp.com
Description: AI-generated theme
Version: 1.0.0
Requires at least: 6.0
Tested up to: 6.4
Requires PHP: 7.4
License: GNU General Public License v2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html
Text Domain: theme-slug
*/
```

**Common errors**:
- Missing colon after field name
- Extra spaces or tabs
- Non-ASCII characters

### 3. theme.json Validation

```bash
# Test if valid JSON
cat theme.json | python -m json.tool

# Or use jq
jq . theme.json
```

**Required structure**:
```json
{
  "$schema": "https://schemas.wp.org/trunk/theme.json",
  "version": 3,
  "settings": {},
  "styles": {}
}
```

**Common errors**:
- Trailing commas (not allowed in JSON)
- Unescaped quotes in strings
- Invalid color values
- Missing version field

### 4. functions.php Syntax Check

```bash
php -l functions.php
```

**Common errors**:
- Missing opening `<?php`
- Unclosed strings or brackets
- Using undefined functions
- Short tags `<?` instead of `<?php`

### 5. Block Template Validation

Check `templates/index.html`:
- Must be valid HTML with WordPress block comments
- Block comments format: `<!-- wp:block-name {"attr":"value"} -->`
- All blocks must be properly closed

**Valid example**:
```html
<!-- wp:template-part {"slug":"header","tagName":"header"} /-->
<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group">
    <!-- wp:post-content /-->
</div>
<!-- /wp:group -->
<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->
```

### 6. PHP Error Log Check

After failed activation, check WordPress error log:
```bash
tail -100 /var/log/apache2/error.log
# or
tail -100 wp-content/debug.log
```

Enable debug logging in wp-config.php:
```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```

### 7. Manual Theme Test Process

1. Unzip generated theme
2. Create fresh WordPress install (use Local or Docker)
3. Copy theme to wp-content/themes/
4. Enable WP_DEBUG
5. Try activation
6. Check debug.log for specific error
7. Fix and re-test

### 8. Common Fix Patterns

**"Invalid theme" error**:
- Check style.css header format
- Ensure theme folder name matches Text Domain

**"White screen" on activation**:
- PHP fatal error - check functions.php syntax
- Check for require/include of missing files

**"Template not found"**:
- Missing templates/index.html
- Block template has invalid syntax

**"theme.json invalid"**:
- Run JSON validation
- Check for trailing commas
- Verify all referenced styles exist
