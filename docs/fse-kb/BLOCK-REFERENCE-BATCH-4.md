# BLOCK-REFERENCE.md - BATCH 4
**WordPress Core Blocks Markup Reference for AI Coding Agents**  
*Target: WordPress 6.7+ Block Library*

**BATCH 4: INTERACTIVE BLOCKS**

---

## 1. BUTTONS BLOCK

**Block Name:** `core/buttons`

**Purpose:** Container for button blocks, controls layout and alignment of button groups.

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `layout` | object | `{"type":"flex"}` | Layout configuration for button arrangement |
| `align` | string | undefined | Block alignment (`"left"`, `"center"`, `"right"`, `"wide"`, `"full"`) |
| `anchor` | string | undefined | HTML ID attribute |
| `className` | string | undefined | Additional CSS classes |

### HTML Structure

**Basic Buttons (Horizontal):**
```html
<!-- wp:buttons -->
<div class="wp-block-buttons">
  <!-- wp:button -->
  <div class="wp-block-button">
    <a class="wp-block-button__link wp-element-button" href="https://example.com">Click Me</a>
  </div>
  <!-- /wp:button -->
</div>
<!-- /wp:buttons -->
```

**Multiple Buttons:**
```html
<!-- wp:buttons -->
<div class="wp-block-buttons">
  <!-- wp:button -->
  <div class="wp-block-button">
    <a class="wp-block-button__link wp-element-button" href="/learn-more">Learn More</a>
  </div>
  <!-- /wp:button -->
  
  <!-- wp:button {"className":"is-style-outline"} -->
  <div class="wp-block-button is-style-outline">
    <a class="wp-block-button__link wp-element-button" href="/contact">Contact Us</a>
  </div>
  <!-- /wp:button -->
</div>
<!-- /wp:buttons -->
```

**Centered Buttons:**
```html
<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
<div class="wp-block-buttons is-content-justification-center">
  <!-- button blocks -->
</div>
<!-- /wp:buttons -->
```

**Vertical Buttons:**
```html
<!-- wp:buttons {"layout":{"type":"flex","orientation":"vertical"}} -->
<div class="wp-block-buttons is-vertical">
  <!-- button blocks -->
</div>
<!-- /wp:buttons -->
```

### Allowed Inner Blocks

**ONLY `core/button` blocks** - Buttons container holds individual button blocks.

### CSS Classes Applied

**Base class:** `wp-block-buttons` (always present)

**Layout classes:**
- `is-content-justification-left` when `justifyContent: "left"`
- `is-content-justification-center` when `justifyContent: "center"`
- `is-content-justification-right` when `justifyContent: "right"`
- `is-content-justification-space-between` when `justifyContent: "space-between"`

**Orientation classes:**
- `is-vertical` when `layout.orientation: "vertical"`
- No class when horizontal (default)

**Alignment classes:**
- `alignwide` when `align: "wide"`
- `alignfull` when `align: "full"`

### Common Mistakes

❌ **WRONG:** Putting non-button blocks inside buttons
```html
<div class="wp-block-buttons">
  <p>Text here</p>
</div>
```

✅ **CORRECT:** Only button blocks allowed
```html
<div class="wp-block-buttons">
  <!-- wp:button -->
  <div class="wp-block-button">...</div>
  <!-- /wp:button -->
</div>
```

---

## 2. BUTTON BLOCK

**Block Name:** `core/button`

**Purpose:** Individual button or link styled as a button. MUST be child of core/buttons.

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `text` | rich-text | `""` | Button text content |
| `url` | string | undefined | Link destination URL |
| `linkTarget` | string | undefined | Link target (`"_blank"` for new tab) |
| `rel` | string | undefined | Link relationship (e.g., `"nofollow"`, `"noreferrer"`) |
| `placeholder` | string | undefined | Placeholder text when empty |
| `backgroundColor` | string | undefined | Background color slug |
| `textColor` | string | undefined | Text color slug |
| `gradient` | string | undefined | Gradient slug |
| `width` | number | undefined | Button width percentage |
| `tagName` | string | `"a"` | HTML element (`"a"` or `"button"`) |
| `type` | string | `"button"` | Button type attribute (when tagName is button) |
| `title` | string | undefined | Title attribute for accessibility |
| `className` | string | undefined | Additional CSS classes |

### HTML Structure

**Basic Button (Link):**
```html
<!-- wp:button -->
<div class="wp-block-button">
  <a class="wp-block-button__link wp-element-button" href="https://example.com">Click Me</a>
</div>
<!-- /wp:button -->
```

**Button Opening in New Tab:**
```html
<!-- wp:button {"linkTarget":"_blank","rel":"noreferrer noopener"} -->
<div class="wp-block-button">
  <a class="wp-block-button__link wp-element-button" href="https://external.com" target="_blank" rel="noreferrer noopener">Visit Site</a>
</div>
<!-- /wp:button -->
```

**Outline Style Button:**
```html
<!-- wp:button {"className":"is-style-outline"} -->
<div class="wp-block-button is-style-outline">
  <a class="wp-block-button__link wp-element-button" href="/signup">Sign Up</a>
</div>
<!-- /wp:button -->
```

**Button with Custom Colors:**
```html
<!-- wp:button {"backgroundColor":"vivid-red","textColor":"white"} -->
<div class="wp-block-button">
  <a class="wp-block-button__link has-white-color has-vivid-red-background-color has-text-color has-background wp-element-button">Buy Now</a>
</div>
<!-- /wp:button -->
```

**Button with Custom Width:**
```html
<!-- wp:button {"width":50} -->
<div class="wp-block-button has-custom-width wp-block-button__width-50">
  <a class="wp-block-button__link wp-element-button">50% Width</a>
</div>
<!-- /wp:button -->
```

**Button Element (Not Link):**
```html
<!-- wp:button {"tagName":"button"} -->
<div class="wp-block-button">
  <button class="wp-block-button__link wp-element-button" type="button">Submit</button>
</div>
<!-- /wp:button -->
```

**Button with Gradient:**
```html
<!-- wp:button {"gradient":"vivid-cyan-blue-to-vivid-purple"} -->
<div class="wp-block-button">
  <a class="wp-block-button__link has-vivid-cyan-blue-to-vivid-purple-gradient-background has-background wp-element-button">Gradient Button</a>
</div>
<!-- /wp:button -->
```

### Parent Constraint

**MUST be child of `core/buttons`** - Button blocks cannot exist independently.

### CSS Classes Applied

**Wrapper classes (on `<div class="wp-block-button">`):**
- `wp-block-button` (always present)
- `is-style-outline` - outline button style
- `is-style-fill` - filled button style (usually default)
- `has-custom-width` when width is set
- `wp-block-button__width-{n}` when width is n%

**Link/Button classes (on `<a>` or `<button>`):**
- `wp-block-button__link` (always present)
- `wp-element-button` (always present)
- `has-{color-slug}-color` - text color
- `has-text-color` - indicates text color is set
- `has-{color-slug}-background-color` - background color
- `has-background` - indicates background is set
- `has-{gradient-slug}-gradient-background` - gradient background

### Common Mistakes

❌ **WRONG:** Button without parent buttons block
```html
<!-- wp:button -->
<div class="wp-block-button">
  <a class="wp-block-button__link">Click</a>
</div>
<!-- /wp:button -->
```

✅ **CORRECT:** Button inside buttons container
```html
<!-- wp:buttons -->
<div class="wp-block-buttons">
  <!-- wp:button -->
  <div class="wp-block-button">
    <a class="wp-block-button__link wp-element-button">Click</a>
  </div>
  <!-- /wp:button -->
</div>
<!-- /wp:buttons -->
```

❌ **WRONG:** Missing wp-element-button class
```html
<a class="wp-block-button__link" href="#">Click</a>
```

✅ **CORRECT:** Both required classes
```html
<a class="wp-block-button__link wp-element-button" href="#">Click</a>
```

❌ **WRONG:** Using div instead of a or button
```html
<div class="wp-block-button__link wp-element-button">Click</div>
```

✅ **CORRECT:** Use proper semantic element
```html
<a class="wp-block-button__link wp-element-button" href="#">Click</a>
<!-- OR -->
<button class="wp-block-button__link wp-element-button" type="button">Click</button>
```

---

## 3. NAVIGATION BLOCK

**Block Name:** `core/navigation`

**Purpose:** Site navigation menu system with support for hierarchical menus, responsive behavior, and custom styling.

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `ref` | number | undefined | Reference to saved navigation menu |
| `textColor` | string | undefined | Text color slug |
| `backgroundColor` | string | undefined | Background color slug |
| `showSubmenuIcon` | boolean | `true` | Show arrow icons for submenus |
| `openSubmenusOnClick` | boolean | `false` | Open submenus on click vs hover |
| `overlayMenu` | string | `"mobile"` | Overlay behavior (`"never"`, `"mobile"`, `"always"`) |
| `hasIcon` | boolean | `true` | Show hamburger icon for overlay |
| `icon` | string | `"handle"` | Icon style (`"handle"` or `"menu"`) |
| `layout` | object | `{"type":"flex"}` | Layout configuration |
| `orientation` | string | `"horizontal"` | Menu orientation (`"horizontal"` or `"vertical"`) |
| `align` | string | undefined | Block alignment |
| `className` | string | undefined | Additional CSS classes |

### HTML Structure

**Basic Horizontal Navigation:**
```html
<!-- wp:navigation -->
<nav class="wp-block-navigation" aria-label="Navigation">
  <ul class="wp-block-navigation__container">
    <!-- wp:navigation-link {"label":"Home","url":"/"} /-->
    <!-- wp:navigation-link {"label":"About","url":"/about"} /-->
    <!-- wp:navigation-link {"label":"Contact","url":"/contact"} /-->
  </ul>
</nav>
<!-- /wp:navigation -->
```

**Navigation with Submenu:**
```html
<!-- wp:navigation {"showSubmenuIcon":true} -->
<nav class="wp-block-navigation has-text-color has-background" aria-label="Navigation">
  <ul class="wp-block-navigation__container">
    <!-- wp:navigation-link {"label":"Home","url":"/"} /-->
    
    <!-- wp:navigation-submenu {"label":"Services"} -->
    <li class="wp-block-navigation-item has-child open-on-hover-click wp-block-navigation-submenu">
      <button class="wp-block-navigation-item__content wp-block-navigation-submenu__toggle" aria-expanded="false">Services</button>
      <ul class="wp-block-navigation__submenu-container">
        <!-- wp:navigation-link {"label":"Web Design","url":"/services/web"} /-->
        <!-- wp:navigation-link {"label":"SEO","url":"/services/seo"} /-->
      </ul>
    </li>
    <!-- /wp:navigation-submenu -->
  </ul>
</nav>
<!-- /wp:navigation -->
```

**Vertical Navigation:**
```html
<!-- wp:navigation {"orientation":"vertical"} -->
<nav class="wp-block-navigation is-vertical" aria-label="Navigation">
  <ul class="wp-block-navigation__container is-vertical">
    <!-- navigation items -->
  </ul>
</nav>
<!-- /wp:navigation -->
```

**Navigation with Responsive Overlay:**
```html
<!-- wp:navigation {"overlayMenu":"mobile"} -->
<nav class="wp-block-navigation is-responsive" aria-label="Navigation">
  <!-- Responsive container markup added dynamically -->
  <button aria-label="Open menu" class="wp-block-navigation__responsive-container-open">
    <svg><!-- hamburger icon --></svg>
  </button>
  <div class="wp-block-navigation__responsive-container">
    <div class="wp-block-navigation__responsive-container-content">
      <ul class="wp-block-navigation__container">
        <!-- navigation items -->
      </ul>
    </div>
  </div>
</nav>
<!-- /wp:navigation -->
```

### Allowed Inner Blocks

**Allowed blocks:**
- `core/navigation-link` - Individual menu item
- `core/navigation-submenu` - Submenu container
- `core/page-list` - Auto-generated list of pages
- `core/home-link` - Link to homepage
- `core/site-logo` - Site logo
- `core/site-title` - Site title
- `core/search` - Search form
- `core/social-links` - Social media icons
- `core/spacer` - Spacing element
- `core/buttons` - Button group

### Context Provided to Children

Navigation provides context to child blocks:
```json
{
  "textColor": "...",
  "customTextColor": "...",
  "backgroundColor": "...",
  "customBackgroundColor": "...",
  "overlayTextColor": "...",
  "overlayBackgroundColor": "...",
  "fontSize": "...",
  "customFontSize": "...",
  "showSubmenuIcon": true,
  "openSubmenusOnClick": false,
  "style": {...}
}
```

### CSS Classes Applied

**Base class:** `wp-block-navigation` (always present)

**Orientation classes:**
- `is-vertical` when `orientation: "vertical"`
- No class when horizontal (default)

**Responsive classes:**
- `is-responsive` when `overlayMenu: "mobile"` or `overlayMenu: "always"`

**Color classes:**
- `has-text-color` when text color is set
- `has-background` when background color is set
- `has-{color-slug}-color` - text color
- `has-{color-slug}-background-color` - background color

### Common Mistakes

❌ **WRONG:** Missing aria-label
```html
<nav class="wp-block-navigation">
  <ul>...</ul>
</nav>
```

✅ **CORRECT:** Always include aria-label
```html
<nav class="wp-block-navigation" aria-label="Navigation">
  <ul class="wp-block-navigation__container">...</ul>
</nav>
```

❌ **WRONG:** Incorrect submenu structure
```html
<li class="wp-block-navigation-submenu">
  <a>Services</a>
  <ul><!-- items --></ul>
</li>
```

✅ **CORRECT:** Submenu uses button toggle
```html
<li class="wp-block-navigation-submenu">
  <button class="wp-block-navigation-item__content wp-block-navigation-submenu__toggle" aria-expanded="false">Services</button>
  <ul class="wp-block-navigation__submenu-container"><!-- items --></ul>
</li>
```

---

## 4. SEARCH BLOCK

**Block Name:** `core/search`

**Purpose:** Search form allowing visitors to search site content.

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `label` | string | `"Search"` | Label text for search field |
| `showLabel` | boolean | `true` | Display the label visually |
| `placeholder` | string | `""` | Placeholder text in search field |
| `buttonText` | string | `"Search"` | Text on search button |
| `buttonPosition` | string | `"button-outside"` | Button position (`"button-outside"`, `"button-inside"`, `"no-button"`, `"button-only"`) |
| `buttonUseIcon` | boolean | `false` | Use icon instead of text on button |
| `query` | object | `{}` | Additional query parameters |
| `width` | number | undefined | Search field width |
| `widthUnit` | string | `"%"` | Width unit |
| `isSearchFieldHidden` | boolean | `false` | Hide search field initially (for button-only) |
| `align` | string | undefined | Block alignment |
| `className` | string | undefined | Additional CSS classes |

### HTML Structure

**Basic Search (Button Outside):**
```html
<!-- wp:search {"label":"Search","showLabel":false} /-->
<form role="search" method="get" action="/" class="wp-block-search__button-outside wp-block-search__text-button wp-block-search">
  <label class="wp-block-search__label screen-reader-text" for="wp-block-search__input-1">Search</label>
  <div class="wp-block-search__inside-wrapper">
    <input type="search" id="wp-block-search__input-1" class="wp-block-search__input" name="s" value="" placeholder="" required />
    <button type="submit" class="wp-block-search__button wp-element-button">Search</button>
  </div>
</form>
```

**Search with Icon Button:**
```html
<!-- wp:search {"label":"Search","buttonText":"Search","buttonUseIcon":true} /-->
<form role="search" method="get" action="/" class="wp-block-search__button-outside wp-block-search__icon-button wp-block-search">
  <label class="wp-block-search__label" for="wp-block-search__input-1">Search</label>
  <div class="wp-block-search__inside-wrapper">
    <input type="search" id="wp-block-search__input-1" class="wp-block-search__input" name="s" />
    <button type="submit" class="wp-block-search__button has-icon wp-element-button" aria-label="Search">
      <svg class="search-icon" viewBox="0 0 24 24" width="24" height="24">
        <path d="M13 5c-3.3 0-6 2.7-6 6 0 1.4.5 2.7 1.3 3.7l-3.8 3.8 1.1 1.1 3.8-3.8c1 .8 2.3 1.3 3.7 1.3 3.3 0 6-2.7 6-6S16.3 5 13 5zm0 10.5c-2.5 0-4.5-2-4.5-4.5s2-4.5 4.5-4.5 4.5 2 4.5 4.5-2 4.5-4.5 4.5z"></path>
      </svg>
    </button>
  </div>
</form>
```

**Button Inside Search Field:**
```html
<!-- wp:search {"buttonPosition":"button-inside"} /-->
<form role="search" method="get" action="/" class="wp-block-search__button-inside wp-block-search__text-button wp-block-search">
  <label class="wp-block-search__label" for="wp-block-search__input-1">Search</label>
  <div class="wp-block-search__inside-wrapper">
    <input type="search" id="wp-block-search__input-1" class="wp-block-search__input" name="s" />
    <button type="submit" class="wp-block-search__button wp-element-button">Search</button>
  </div>
</form>
```

**Search with No Button:**
```html
<!-- wp:search {"buttonPosition":"no-button","showLabel":false} /-->
<form role="search" method="get" action="/" class="wp-block-search__no-button wp-block-search">
  <label class="wp-block-search__label screen-reader-text" for="wp-block-search__input-1">Search</label>
  <div class="wp-block-search__inside-wrapper">
    <input type="search" id="wp-block-search__input-1" class="wp-block-search__input" name="s" />
  </div>
</form>
```

**Button Only (Expandable):**
```html
<!-- wp:search {"buttonPosition":"button-only","buttonUseIcon":true} /-->
<form role="search" method="get" action="/" class="wp-block-search__button-only wp-block-search__icon-button wp-block-search">
  <div class="wp-block-search__inside-wrapper">
    <input type="search" class="wp-block-search__input" name="s" aria-hidden="true" tabindex="-1" />
    <button type="button" class="wp-block-search__button has-icon wp-element-button" aria-label="Expand search field" aria-expanded="false">
      <svg class="search-icon">...</svg>
    </button>
  </div>
</form>
```

### Allowed Inner Blocks

**NONE** - Search is a self-contained dynamic block.

### CSS Classes Applied

**Base class:** `wp-block-search` (always present)

**Button position classes (mutually exclusive):**
- `wp-block-search__button-outside` when `buttonPosition: "button-outside"` (default)
- `wp-block-search__button-inside` when `buttonPosition: "button-inside"`
- `wp-block-search__no-button` when `buttonPosition: "no-button"`
- `wp-block-search__button-only` when `buttonPosition: "button-only"`

**Button style classes:**
- `wp-block-search__text-button` when `buttonUseIcon: false`
- `wp-block-search__icon-button` when `buttonUseIcon: true`

### Common Mistakes

❌ **WRONG:** Missing role="search" on form
```html
<form method="get" action="/" class="wp-block-search">
```

✅ **CORRECT:** Always include role
```html
<form role="search" method="get" action="/" class="wp-block-search">
```

❌ **WRONG:** Missing label element
```html
<form role="search" class="wp-block-search">
  <input type="search" name="s" />
</form>
```

✅ **CORRECT:** Always include label (can be screen-reader-text)
```html
<form role="search" class="wp-block-search">
  <label class="wp-block-search__label screen-reader-text" for="wp-block-search__input-1">Search</label>
  <input type="search" id="wp-block-search__input-1" name="s" />
</form>
```

---

## 5. SOCIAL-LINKS BLOCK

**Block Name:** `core/social-links`

**Purpose:** Container for social media link icons with consistent styling.

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `iconColor` | string | undefined | Icon color slug |
| `iconColorValue` | string | undefined | Icon color hex value |
| `iconBackgroundColor` | string | undefined | Icon background color slug |
| `iconBackgroundColorValue` | string | undefined | Icon background hex value |
| `openInNewTab` | boolean | `false` | Open links in new tab |
| `showLabels` | boolean | `false` | Show text labels next to icons |
| `size` | string | undefined | Icon size class |
| `align` | string | undefined | Block alignment |
| `className` | string | undefined | Additional CSS classes |

### HTML Structure

**Basic Social Links:**
```html
<!-- wp:social-links -->
<ul class="wp-block-social-links">
  <!-- wp:social-link {"url":"https://twitter.com/username","service":"twitter"} /-->
  <!-- wp:social-link {"url":"https://facebook.com/page","service":"facebook"} /-->
  <!-- wp:social-link {"url":"https://instagram.com/username","service":"instagram"} /-->
</ul>
<!-- /wp:social-links -->
```

**Social Links with Custom Colors:**
```html
<!-- wp:social-links {"iconColor":"white","iconBackgroundColor":"vivid-cyan-blue","className":"has-icon-color has-icon-background-color"} -->
<ul class="wp-block-social-links has-icon-color has-icon-background-color">
  <!-- social-link blocks inherit colors via context -->
</ul>
<!-- /wp:social-links -->
```

**Social Links with Labels:**
```html
<!-- wp:social-links {"showLabels":true} -->
<ul class="wp-block-social-links has-visible-labels">
  <!-- social-link blocks show text labels -->
</ul>
<!-- /wp:social-links -->
```

**Logos Only Style:**
```html
<!-- wp:social-links {"className":"is-style-logos-only"} -->
<ul class="wp-block-social-links is-style-logos-only">
  <!-- icons without circular backgrounds -->
</ul>
<!-- /wp:social-links -->
```

**Pill Shape Style:**
```html
<!-- wp:social-links {"className":"is-style-pill-shape"} -->
<ul class="wp-block-social-links is-style-pill-shape">
  <!-- icons with pill-shaped backgrounds -->
</ul>
<!-- /wp:social-links -->
```

### Allowed Inner Blocks

**ONLY `core/social-link` blocks** - Container for individual social media links.

### Context Provided to Children

Social-links provides context to child social-link blocks:
```json
{
  "openInNewTab": false,
  "showLabels": false,
  "iconColor": "...",
  "iconColorValue": "#...",
  "iconBackgroundColor": "...",
  "iconBackgroundColorValue": "#..."
}
```

### CSS Classes Applied

**Base class:** `wp-block-social-links` (always present)

**Color indicator classes:**
- `has-icon-color` when icon color is set
- `has-icon-background-color` when background color is set

**Label class:**
- `has-visible-labels` when `showLabels: true`

**Size classes:**
- `has-small-icon-size` when `size: "has-small-icon-size"`
- `has-normal-icon-size` when `size: "has-normal-icon-size"`
- `has-large-icon-size` when `size: "has-large-icon-size"`
- `has-huge-icon-size` when `size: "has-huge-icon-size"`

**Style variations:**
- `is-style-logos-only` - icons without background circles
- `is-style-pill-shape` - pill-shaped icon backgrounds
- `is-style-default` - default circular backgrounds

### Common Mistakes

❌ **WRONG:** Using div instead of ul
```html
<div class="wp-block-social-links">
  <!-- social links -->
</div>
```

✅ **CORRECT:** Always use ul element
```html
<ul class="wp-block-social-links">
  <!-- social links -->
</ul>
```

❌ **WRONG:** Putting non-social-link blocks inside
```html
<ul class="wp-block-social-links">
  <p>Follow us!</p>
</ul>
```

✅ **CORRECT:** Only social-link blocks
```html
<ul class="wp-block-social-links">
  <!-- wp:social-link -->
  <li>...</li>
  <!-- /wp:social-link -->
</ul>
```

---

## 6. SOCIAL-LINK BLOCK

**Block Name:** `core/social-link`

**Purpose:** Individual social media link icon. MUST be child of core/social-links.

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `url` | string | `""` | Link destination URL |
| `service` | string | undefined | Social service identifier (e.g., `"twitter"`, `"facebook"`, `"instagram"`) |
| `label` | string | undefined | Custom label text (overrides service name) |
| `rel` | string | undefined | Link relationship attribute |

### Supported Services

WordPress includes built-in support for these services (service attribute values):
- `amazon` - Amazon
- `bandcamp` - Bandcamp  
- `behance` - Behance
- `bluesky` - Bluesky
- `codepen` - CodePen
- `deviantart` - DeviantArt
- `dribbble` - Dribbble
- `dropbox` - Dropbox
- `etsy` - Etsy
- `facebook` - Facebook
- `feed` - RSS Feed
- `fivehundredpx` - 500px
- `flickr` - Flickr
- `foursquare` - Foursquare
- `github` - GitHub
- `goodreads` - Goodreads
- `google` - Google
- `instagram` - Instagram
- `lastfm` - Last.fm
- `linkedin` - LinkedIn
- `mail` - Email
- `mastodon` - Mastodon
- `medium` - Medium
- `meetup` - Meetup
- `patreon` - Patreon
- `pinterest` - Pinterest
- `pocket` - Pocket
- `reddit` - Reddit
- `skype` - Skype
- `snapchat` - Snapchat
- `soundcloud` - SoundCloud
- `spotify` - Spotify
- `telegram` - Telegram
- `threads` - Threads
- `tiktok` - TikTok
- `tumblr` - Tumblr
- `twitch` - Twitch
- `twitter` - Twitter/X
- `vimeo` - Vimeo
- `vk` - VK
- `wordpress` - WordPress
- `x` - X (Twitter rebrand)
- `yelp` - Yelp
- `youtube` - YouTube

### HTML Structure

**Basic Social Link (Rendered Dynamically):**
```html
<!-- wp:social-link {"url":"https://twitter.com/username","service":"twitter"} /-->

<!-- Renders on frontend as: -->
<li class="wp-social-link wp-social-link-twitter">
  <a href="https://twitter.com/username" class="wp-block-social-link-anchor">
    <svg width="24" height="24" viewBox="0 0 24 24"><!-- Twitter icon SVG --></svg>
    <span class="wp-block-social-link-label screen-reader-text">Twitter</span>
  </a>
</li>
```

**Social Link with Label Visible:**
```html
<!-- When parent has showLabels:true -->
<li class="wp-social-link wp-social-link-facebook">
  <a href="https://facebook.com/page" class="wp-block-social-link-anchor">
    <svg><!-- Facebook icon --></svg>
    <span class="wp-block-social-link-label">Facebook</span>
  </a>
</li>
```

**Social Link with Custom Colors (from parent context):**
```html
<li class="wp-social-link wp-social-link-instagram has-white-color has-vivid-cyan-blue-background-color" style="color:#ffffff;background-color:#0693e3;">
  <a href="https://instagram.com/user" class="wp-block-social-link-anchor">
    <svg><!-- Instagram icon --></svg>
    <span class="wp-block-social-link-label screen-reader-text">Instagram</span>
  </a>
</li>
```

**Social Link Opening in New Tab:**
```html
<!-- When parent has openInNewTab:true -->
<li class="wp-social-link wp-social-link-youtube">
  <a href="https://youtube.com/channel" target="_blank" rel="noopener nofollow" class="wp-block-social-link-anchor">
    <svg><!-- YouTube icon --></svg>
    <span class="wp-block-social-link-label screen-reader-text">YouTube</span>
  </a>
</li>
```

### Parent Constraint

**MUST be child of `core/social-links`** - Social-link blocks cannot exist independently.

### CSS Classes Applied

**Base classes (always):**
- `wp-social-link` (on `<li>`)
- `wp-social-link-{service}` (e.g., `wp-social-link-twitter`)
- `wp-block-social-link-anchor` (on `<a>`)

**Color classes (inherited from parent via context):**
- `has-{color-slug}-color` - icon color
- `has-{color-slug}-background-color` - background color

**Label class:**
- `screen-reader-text` on label when `showLabels: false` (default)
- No class on label when `showLabels: true`

### Common Mistakes

❌ **WRONG:** Social link without parent social-links block
```html
<!-- wp:social-link {"service":"twitter","url":"..."} /-->
```

✅ **CORRECT:** Social link inside social-links container
```html
<!-- wp:social-links -->
<ul class="wp-block-social-links">
  <!-- wp:social-link {"service":"twitter","url":"..."} /-->
</ul>
<!-- /wp:social-links -->
```

❌ **WRONG:** Missing service attribute
```html
<!-- wp:social-link {"url":"https://example.com"} /-->
```

✅ **CORRECT:** Service attribute is required
```html
<!-- wp:social-link {"url":"https://example.com","service":"twitter"} /-->
```

❌ **WRONG:** Hardcoding SVG icon in saved content
```html
<li class="wp-social-link">
  <a href="...">
    <svg><!-- icon --></svg>
  </a>
</li>
```

✅ **CORRECT:** Icons rendered dynamically (self-closing comment)
```html
<!-- wp:social-link {"url":"...","service":"twitter"} /-->
```

**Note:** Social-link is a dynamic block - the icon SVG and label are rendered server-side based on the service attribute, not saved in the post content.

---

## BATCH 4 SUMMARY

**Interactive blocks documented:** 6  
✅ buttons  
✅ button  
✅ navigation  
✅ search  
✅ social-links  
✅ social-link

**Key Patterns to Remember:**

1. **Buttons/Button** - Container/child relationship required
2. **Button** - Two element options: `<a>` (default) or `<button>`
3. **Button** - Always has both `wp-block-button__link` AND `wp-element-button` classes
4. **Navigation** - Provides context to children via block context API
5. **Search** - Dynamic block with four buttonPosition configurations
6. **Social-links/Social-link** - Container/child relationship, icons rendered server-side

**Critical Validation Points:**

**Buttons:**
- Button MUST be child of buttons container
- Button link/button element MUST have both `wp-block-button__link` and `wp-element-button` classes
- Parent-child relationship is MANDATORY

**Navigation:**
- MUST have `aria-label` attribute on `<nav>` element
- Submenu uses `<button>` toggle with `aria-expanded` attribute
- Container is `<ul class="wp-block-navigation__container">`
- Context passed to children for consistent styling

**Search:**
- MUST have `role="search"` on form
- MUST include label element (can be screen-reader-text)
- Input MUST have unique ID matching label's `for` attribute
- Button position class MUST match buttonPosition attribute

**Social Links:**
- Container MUST be `<ul>` element
- ONLY social-link blocks allowed as children
- Colors set on parent, inherited by children via context
- Service attribute required on each social-link

**Social Link:**
- MUST be child of social-links block
- Service attribute is REQUIRED and MUST match supported service
- Icons rendered dynamically server-side, NOT saved in content
- Self-closing comment block format: `<!-- wp:social-link {...} /-->`

**Context Propagation Pattern:**

Both navigation and social-links use WordPress Block Context API:

```
Parent Block (provides context)
  ↓ context values passed down
Child Blocks (consume context)
```

Example:
```
core/social-links (provides iconColor, showLabels, openInNewTab)
  ↓
core/social-link (consumes context for styling)
```

**PressPilot Specific Applications:**

**Call-to-Action Sections (Buttons):**
```html
<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
<div class="wp-block-buttons is-content-justification-center">
  <!-- wp:button {"backgroundColor":"vivid-red"} -->
  <div class="wp-block-button">
    <a class="wp-block-button__link has-vivid-red-background-color has-background wp-element-button" href="/get-started">Get Started</a>
  </div>
  <!-- /wp:button -->
  
  <!-- wp:button {"className":"is-style-outline"} -->
  <div class="wp-block-button is-style-outline">
    <a class="wp-block-button__link wp-element-button" href="/learn-more">Learn More</a>
  </div>
  <!-- /wp:button -->
</div>
<!-- /wp:buttons -->
```

**Header Navigation:**
```html
<!-- wp:navigation {"overlayMenu":"mobile","showSubmenuIcon":true} -->
<nav class="wp-block-navigation is-responsive" aria-label="Main Navigation">
  <ul class="wp-block-navigation__container">
    <!-- wp:navigation-link {"label":"Home","url":"/"} /-->
    <!-- wp:navigation-link {"label":"Services","url":"/services"} /-->
    <!-- wp:navigation-link {"label":"About","url":"/about"} /-->
    <!-- wp:navigation-link {"label":"Contact","url":"/contact"} /-->
  </ul>
</nav>
<!-- /wp:navigation -->
```

**Header Search:**
```html
<!-- wp:search {"label":"Search","showLabel":false,"buttonUseIcon":true,"buttonPosition":"button-inside"} /-->
```
Compact search that fits well in headers with icon-based button.

**Footer Social Links:**
```html
<!-- wp:social-links {"iconColor":"white","iconBackgroundColor":"primary","className":"has-icon-color has-icon-background-color"} -->
<ul class="wp-block-social-links has-icon-color has-icon-background-color">
  <!-- wp:social-link {"url":"https://facebook.com/business","service":"facebook"} /-->
  <!-- wp:social-link {"url":"https://twitter.com/business","service":"twitter"} /-->
  <!-- wp:social-link {"url":"https://instagram.com/business","service":"instagram"} /-->
  <!-- wp:social-link {"url":"https://linkedin.com/company/business","service":"linkedin"} /-->
</ul>
<!-- /wp:social-links -->
```

### Design Patterns

**Button Styles:**
- **Primary CTA:** Filled button with brand color
- **Secondary CTA:** Outline button
- **Destructive:** Red background for delete/cancel actions
- **Width:** Use `width: 100` for full-width mobile buttons

**Navigation Patterns:**
- **Desktop:** Horizontal, hover-activated submenus
- **Mobile:** Overlay menu with hamburger icon
- **Vertical:** Sidebar navigation, footer menus

**Search Placement:**
- **Header:** `buttonPosition: "button-inside"` with icon
- **Hero:** `buttonPosition: "button-outside"` with text
- **Sidebar:** `buttonPosition: "no-button"` for minimal UI

**Social Link Styles:**
- **Logos Only:** Brand-colored icons without backgrounds
- **Default:** Icons with circular backgrounds
- **Pill Shape:** Icons with pill-shaped backgrounds
- **With Labels:** Show service names for accessibility

### Accessibility Requirements

**Buttons:**
- Use `<a>` for navigation, `<button>` for actions
- Always provide meaningful text (avoid "Click Here")
- Include `rel="noreferrer noopener"` when `target="_blank"`

**Navigation:**
- Always include `aria-label` on `<nav>`
- Submenu toggles need `aria-expanded` attribute
- Keyboard navigation MUST work (Tab, Enter, Esc)

**Search:**
- Label MUST be present (can be `screen-reader-text`)
- Input MUST have matching ID and label `for` attribute
- Submit button MUST have accessible text or `aria-label`

**Social Links:**
- Each link MUST have label text (can be `screen-reader-text`)
- Icons MUST have `aria-hidden="true"` on SVG
- Use descriptive service names, not just "Link"

**Next Batches:**
- BATCH 5: Site Blocks (site-title, site-logo, site-tagline)
- BATCH 6: Query Blocks (query, post-template, post-title, etc.)
- BATCH 7: Template Blocks (template-part)

---

*Document version: 1.0*  
*Batch 4 completed: February 2025*  
*Based on: WordPress 6.7+ Block Library*  
*Sources: Gutenberg block.json files, WordPress Core Blocks Reference, Official Documentation*
