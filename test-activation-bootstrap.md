# Testing PressPilot Activation Bootstrap on DigitalOcean WordPress

## Prerequisites

1. WordPress installed on DigitalOcean
2. SSH access to the server
3. WordPress admin credentials
4. A generated PressPilot theme ZIP with `presspilot-kit.json`

## Step 1: Upload and Activate Theme

1. Generate a test kit (e.g., Restaurant category) via `/mvp-demo`
2. Download the WordPress theme ZIP
3. Upload to DigitalOcean WordPress: **Appearance → Themes → Add New → Upload Theme**
4. Activate the theme

## Step 2: Verify Activation Hook Execution

### Check WordPress Debug Log

Add to `wp-config.php` (if not already present):
```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```

After activation, check `/wp-content/debug.log` for:
- `[PressPilot bootstrap]` entries (if logging was added)
- Any PHP errors

### Check via Database

Connect to WordPress database and check `wp_options` table:
```sql
SELECT * FROM wp_options WHERE option_name = 'presspilot_activation_v1_done';
```

Should return: `option_value = '1'`

## Step 3: Verify Pages Created

### Via WordPress Admin
1. Go to **Pages → All Pages**
2. Should see: Home, Menu (for restaurant), About, Services, Blog, Contact

### Via WP REST API
```bash
curl https://your-site.com/wp-json/wp/v2/pages?per_page=100
```

Look for pages with slugs: `home`, `menu`, `about`, `services`, `blog`, `contact`

### Via Database
```sql
SELECT post_title, post_name, post_status 
FROM wp_posts 
WHERE post_type = 'page' 
AND post_status = 'publish'
ORDER BY post_name;
```

## Step 4: Verify Menu Created

### Via WordPress Admin
1. Go to **Appearance → Menus**
2. Should see "Main Menu" with items in order: Home, Menu, About, Services, Blog, Contact

### Via Database
```sql
-- Get menu term
SELECT * FROM wp_terms WHERE name = 'Main Menu';

-- Get menu items (replace TERM_ID with actual ID from above)
SELECT p.post_title, p.post_name, m.menu_order
FROM wp_posts p
JOIN wp_term_relationships tr ON p.ID = tr.object_id
JOIN wp_term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
JOIN wp_terms t ON tt.term_id = t.term_id
LEFT JOIN wp_postmeta m ON p.ID = m.post_id AND m.meta_key = '_menu_item_object_id'
WHERE t.name = 'Main Menu'
AND p.post_type = 'page'
ORDER BY m.menu_order;
```

### Via WP REST API
```bash
curl https://your-site.com/wp-json/wp/v2/menus
```

## Step 5: Verify Menu Location Assignment

### Via Database
```sql
SELECT * FROM wp_options WHERE option_name = 'theme_mods_presspilot-golden-foundation';
```

Should contain `nav_menu_locations` with `primary` set to the menu term_id.

### Via WordPress Admin
1. Go to **Appearance → Menus**
2. Check "Display location" - "Primary" should be checked for "Main Menu"

## Step 6: Verify Front Page Setting

### Via Database
```sql
SELECT * FROM wp_options WHERE option_name IN ('show_on_front', 'page_on_front');
```

- `show_on_front` should be `'page'`
- `page_on_front` should be the ID of the "Home" page

### Via WordPress Admin
1. Go to **Settings → Reading**
2. "Your homepage displays" should be "A static page"
3. "Homepage" should be set to "Home"

## Step 7: Manual Trigger Test

If activation didn't run, manually trigger:
```
https://your-site.com/wp-admin/?presspilot_bootstrap=1
```

Then re-check all above steps.

## Step 8: Verify presspilot-kit.json is Read

### Check File Exists
```bash
# Via SSH
ls -la /path/to/wordpress/wp-content/themes/presspilot-golden-foundation/presspilot-kit.json
```

### Check JSON Structure
```bash
cat /path/to/wordpress/wp-content/themes/presspilot-golden-foundation/presspilot-kit.json | jq '.wpImport'
```

Should show:
```json
{
  "front_page_slug": "home",
  "pages": [...],
  "menu": {
    "location": "primary",
    "name": "Main Menu",
    "items": [...]
  }
}
```

## Troubleshooting

### If pages aren't created:
1. Check PHP error log
2. Verify `presspilot-kit.json` exists and is valid JSON
3. Check WordPress file permissions
4. Verify `is_admin()` returns true (should be during activation)

### If menu isn't created:
1. Check if menu term exists: `SELECT * FROM wp_terms WHERE name = 'Main Menu';`
2. Verify menu items were added to the menu
3. Check theme mods for location assignment

### If activation flag isn't set:
1. Check for PHP errors during activation
2. Verify `update_option()` has proper permissions
3. Check if function is actually being called

## Expected Database State After Activation

```sql
-- Pages should exist
SELECT COUNT(*) FROM wp_posts WHERE post_type = 'page' AND post_status = 'publish';
-- Should be 6 for restaurant, 6 for e-commerce, 5 for others

-- Menu should exist
SELECT COUNT(*) FROM wp_terms WHERE name = 'Main Menu';
-- Should be 1

-- Activation flag should be set
SELECT option_value FROM wp_options WHERE option_name = 'presspilot_activation_v1_done';
-- Should be '1'

-- Front page should be set
SELECT option_value FROM wp_options WHERE option_name = 'page_on_front';
-- Should be a page ID (not empty)
```


