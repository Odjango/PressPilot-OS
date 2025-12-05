PressPilot Theme Activation Contract (Safe Mode)
Goal
Every AI-generated PressPilot block theme must safely prepare the site on activation without deleting existing content.
The activation logic runs on the after_switch_theme hook in functions.php.
Safe Mode Principle
The theme never deletes existing:
Pages (post_type = page)
Navigation entities (post_type = wp_navigation)
Posts, menus, or any other content
The theme only adds or updates content when something is missing or unset.
Required Behavior on after_switch_theme
Seed Core Pages (Non-destructive)
Input: a list of desired pages from config (slug, title, content).
For each configured page:
If a page with that post_name (slug) already exists, do nothing.
If it does not exist, create it with wp_insert_post(), status publish.
Ensure a Front Page Exists
If show_on_front and page_on_front are not already set:
Find the page whose slug matches the configured home_slug (e.g. "home").
If found, set:
show_on_front = 'page'
page_on_front = {home_page_ID}
If a front page is already set, do not change it.
Seed Navigation (Non-destructive)
If any wp_navigation posts already exist, do nothing (respect existing nav).
If no wp_navigation posts exist:
Create a new wp_navigation post titled “Main Navigation”.
Its post_content is a Navigation block containing links to the configured pages
(Home, About, Contact, etc.).
Example structure (conceptual):
<!-- wp:navigation -->
A navigation-link block per configured page (if the page exists).
<!-- /wp:navigation -->
Site Title Behavior
Input: site_title from config (optional).
If a site_title value is provided and the current blogname:
is empty, or
is one of the known defaults (e.g. “Just another WordPress site”),
then update blogname to the configured site_title.
If blogname has a non-default value, do not override it.
Idempotency (Safe Re-Activation)
The activation logic must be idempotent:
Running it multiple times must not duplicate pages, navs, or break settings.
It should always “repair” missing configured pages/nav if they were deleted later,
but never delete user content.
Optional Behavior (Future)
A separate Override Mode may be introduced later, where the theme can:
Trash existing pages and navigation.
Recreate everything from config.
Override Mode must only run when explicitly configured and must never be the default.
Summary
Safe Mode guarantees that activating a PressPilot theme will:
Ensure the key pages exist.
Ensure navigation exists.
Ensure a home page is set (if none was set before).
Optionally fix a default/empty site title.
…without deleting anything the user already has in their site.