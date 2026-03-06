# STEP 7: Update ThemeAssembler.php

> **Depends on:** Steps 1-6 (all skeleton + service work must be done)
> **Estimated effort:** 2-3 hours
> **Output file:** `backend/app/Services/ThemeAssembler.php` (MODIFY)

---

## WHAT YOU'RE DOING

Updating ThemeAssembler to:
A. Use the PressPilot branded footer (not Ollie's)
B. Create inner page templates (about, services, contact)
C. Register custom templates in theme.json
D. Assemble pages from injected skeleton HTML

## CURRENT FILE

Read `backend/app/Services/ThemeAssembler.php`. Key methods:
- `assemble()` — main entry point, creates ZIP
- `writeTemplates()` — creates template HTML files
- `writeParts()` — creates header.html and footer.html
- `pressPilotCredit()` — appends "Powered by PressPilot" to Ollie footer
- `fallbackFooter()` — generic footer fallback

## CHANGE A: PressPilot Footer

Replace the entire footer generation with this fixed template. This is the proven 3-column footer from the old generator (`src/generator/patterns/universal-footer.ts`).

Add a new method `buildPressPilotFooter(array $project, array $tokens)` that returns this HTML:

```html
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|70","bottom":"var:preset|spacing|50"}}},"backgroundColor":"base-2","textColor":"contrast","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-contrast-color has-base-2-background-color has-text-color has-background" style="padding-top:var(--wp--preset--spacing--70);padding-bottom:var(--wp--preset--spacing--50)">

    <!-- wp:columns {"align":"wide","style":{"spacing":{"blockGap":{"left":"var:preset|spacing|70"}}}} -->
    <div class="wp-block-columns alignwide">
        <!-- wp:column {"width":"33%"} -->
        <div class="wp-block-column" style="flex-basis:33%">
            <!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"top"}} -->
            <div class="wp-block-group">
                <!-- wp:group {"layout":{"type":"flex","orientation":"vertical","justifyContent":"left"}} -->
                <div class="wp-block-group">
                    <!-- wp:site-title {"style":{"typography":{"fontStyle":"normal","fontWeight":"700","fontSize":"1.5rem"}}} /-->
                    <!-- wp:paragraph {"fontSize":"small","textColor":"contrast-2"} -->
                    <p class="has-small-font-size has-contrast-2-color has-text-color">{FOOTER_TAGLINE}</p>
                    <!-- /wp:paragraph -->
                </div>
                <!-- /wp:group -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->
        <!-- wp:column {"width":"33%"} -->
        <div class="wp-block-column" style="flex-basis:33%">
            <!-- wp:heading {"level":4,"textColor":"contrast","style":{"typography":{"fontWeight":"700","textTransform":"uppercase","letterSpacing":"1px"}},"fontSize":"small"} -->
            <h4 class="wp-block-heading has-small-font-size has-contrast-color has-text-color" style="font-weight:700;text-transform:uppercase;letter-spacing:1px">Quick Links</h4>
            <!-- /wp:heading -->
            <!-- wp:list {"style":{"spacing":{"blockGap":"0.75rem"}},"textColor":"contrast","fontSize":"small"} -->
            <ul class="has-contrast-color has-text-color has-small-font-size">
            <li>Home</li>
            <li>About</li>
            <li>Services</li>
            <li>Contact</li>
            </ul>
            <!-- /wp:list -->
        </div>
        <!-- /wp:column -->
        <!-- wp:column {"width":"33%"} -->
        <div class="wp-block-column" style="flex-basis:33%">
            <!-- wp:heading {"level":4,"textColor":"contrast","style":{"typography":{"fontWeight":"700","textTransform":"uppercase","letterSpacing":"1px"}},"fontSize":"small"} -->
            <h4 class="wp-block-heading has-small-font-size has-contrast-color has-text-color" style="font-weight:700;text-transform:uppercase;letter-spacing:1px">Get In Touch</h4>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"fontSize":"small","textColor":"contrast-2"} -->
            <p class="has-small-font-size has-contrast-2-color has-text-color">{CONTACT_TEXT}</p>
            <!-- /wp:paragraph -->
            <!-- wp:social-links {"iconColor":"contrast","iconColorValue":"currentColor","size":"has-normal-icon-size","style":{"spacing":{"blockGap":{"left":"var:preset|spacing|40"}}},"className":"is-style-logos-only"} -->
            <ul class="wp-block-social-links has-normal-icon-size has-icon-color is-style-logos-only">
                <!-- wp:social-link {"url":"#","service":"facebook"} /-->
                <!-- wp:social-link {"url":"#","service":"x"} /-->
                <!-- wp:social-link {"url":"#","service":"instagram"} /-->
            </ul>
            <!-- /wp:social-links -->
        </div>
        <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->

    <!-- wp:spacer {"height":"var:preset|spacing|50"} -->
    <div style="height:var(--wp--preset--spacing--50)" aria-hidden="true" class="wp-block-spacer"></div>
    <!-- /wp:spacer -->

    <!-- wp:paragraph {"align":"center","fontSize":"small","textColor":"contrast-2"} -->
    <p class="has-text-align-center has-small-font-size has-contrast-2-color has-text-color">&copy; {YEAR} {BUSINESS_NAME}. All rights reserved. Powered by <a href="https://www.presspilotapp.com" target="_blank" rel="noopener noreferrer" style="color:inherit">PressPilot</a>.</p>
    <!-- /wp:paragraph -->

</div>
<!-- /wp:group -->
```

Replace `{FOOTER_TAGLINE}`, `{CONTACT_TEXT}`, `{YEAR}`, `{BUSINESS_NAME}` with values from the tokens array and project data. Use `date('Y')` for year.

**Remove** the old `pressPilotCredit()` and `fallbackFooter()` methods. Remove any code that uses Ollie footer patterns.

## CHANGE B: Inner Page Templates

Update `writeTemplates()` to create templates for inner pages.

The method receives injected HTML from TokenInjector (keyed by page type: `home`, `about`, `services`, `contact`).

For each page type, create a template file:

```
templates/front-page.html  → header-part + home sections + footer-part
templates/page-about.html  → header-part + about sections + footer-part
templates/page-services.html → header-part + services sections + footer-part
templates/page-contact.html → header-part + contact sections + footer-part
templates/page.html         → header-part + wp:post-content + footer-part (keep as generic fallback)
templates/single.html       → header-part + wp:post-title + wp:post-content + footer-part
templates/404.html          → header-part + "Page not found" message + footer-part
templates/index.html        → header-part + wp:query-loop + footer-part
```

Each template wraps content with:
```html
<!-- wp:template-part {"slug":"header","tagName":"header"} /-->

{SECTION CONTENT HERE}

<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->
```

## CHANGE C: Register Custom Templates in theme.json

When writing theme.json, add the `customTemplates` array:

```json
{
  "customTemplates": [
    {"name": "page-about", "title": "About", "postTypes": ["page"]},
    {"name": "page-services", "title": "Services", "postTypes": ["page"]},
    {"name": "page-contact", "title": "Contact", "postTypes": ["page"]}
  ]
}
```

## CHANGE D: Method signature update

The `assemble()` or `writeTemplates()` method now receives the injected page HTML from the job:

```php
public function assemble(array $project, array $tokens, array $pageHtml): string
{
    // $pageHtml = ['home' => '<injected HTML>', 'about' => '...', ...]
}
```

## VERIFICATION

After a theme is generated, check the ZIP contains:
```bash
unzip -l theme.zip | grep -E 'templates/|parts/'
```

Expected files:
- `templates/front-page.html` (should have multiple sections, NOT just post-content)
- `templates/page-about.html` (should have about sections)
- `templates/page-services.html` (should have services sections)
- `templates/page-contact.html` (should have contact sections)
- `templates/page.html`, `templates/single.html`, `templates/404.html`, `templates/index.html`
- `parts/header.html`
- `parts/footer.html` (should contain "PressPilot" and "Quick Links" and "Get In Touch")

```bash
# No Ollie content in footer
grep -i 'ollie' parts/footer.html  # should return nothing

# PressPilot branding present
grep 'PressPilot' parts/footer.html  # should return the copyright line
grep 'Quick Links' parts/footer.html  # should return the nav heading
```
