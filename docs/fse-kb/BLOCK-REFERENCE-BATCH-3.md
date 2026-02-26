# BLOCK-REFERENCE.md - BATCH 3
**WordPress Core Blocks Markup Reference for AI Coding Agents**  
*Target: WordPress 6.7+ Block Library*

**BATCH 3: MEDIA BLOCKS**

---

## 1. IMAGE BLOCK

**Block Name:** `core/image`

**Purpose:** Insert and display images with responsive sizing, linking, and caption options.

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `url` | string | undefined | Image source URL |
| `alt` | string | `""` | Alternative text for accessibility |
| `id` | number | undefined | Attachment ID from media library |
| `caption` | rich-text | `""` | Image caption text |
| `sizeSlug` | string | undefined | Image size preset (`"thumbnail"`, `"medium"`, `"large"`, `"full"`) |
| `width` | number | undefined | Custom width in pixels |
| `height` | number | undefined | Custom height in pixels |
| `align` | string | undefined | Block alignment (`"left"`, `"center"`, `"right"`, `"wide"`, `"full"`) |
| `href` | string | undefined | Link URL when image is clicked |
| `linkDestination` | string | undefined | Link target (`"none"`, `"media"`, `"attachment"`, `"custom"`) |
| `linkTarget` | string | undefined | Link target attribute (`"_blank"`, `"_self"`) |
| `rel` | string | undefined | Link rel attribute |
| `linkClass` | string | undefined | CSS class for link element |
| `aspectRatio` | string | undefined | Aspect ratio (e.g., `"16/9"`, `"4/3"`) |
| `scale` | string | undefined | Object-fit behavior (`"cover"`, `"contain"`) |
| `focalPoint` | object | undefined | Focal point for cropping `{x: 0.5, y: 0.5}` |
| `title` | string | undefined | Image title attribute |
| `lightbox` | object | undefined | Lightbox settings `{enabled: true}` |
| `anchor` | string | undefined | HTML ID attribute |
| `className` | string | undefined | Additional CSS classes |

### HTML Structure

**Basic Image:**
```html
<!-- wp:image {"id":123,"sizeSlug":"large","linkDestination":"none"} -->
<figure class="wp-block-image size-large">
  <img src="https://example.com/image.jpg" alt="" class="wp-image-123"/>
</figure>
<!-- /wp:image -->
```

**Image with Alt Text:**
```html
<!-- wp:image {"id":456,"alt":"Sunset over mountains"} -->
<figure class="wp-block-image">
  <img src="https://example.com/sunset.jpg" alt="Sunset over mountains" class="wp-image-456"/>
</figure>
<!-- /wp:image -->
```

**Image with Caption:**
```html
<!-- wp:image {"id":789,"sizeSlug":"medium"} -->
<figure class="wp-block-image size-medium">
  <img src="https://example.com/photo.jpg" alt="" class="wp-image-789"/>
  <figcaption class="wp-element-caption">A beautiful landscape photo</figcaption>
</figure>
<!-- /wp:image -->
```

**Image with Link to Media File:**
```html
<!-- wp:image {"id":123,"linkDestination":"media"} -->
<figure class="wp-block-image">
  <a href="https://example.com/full-size.jpg">
    <img src="https://example.com/medium.jpg" alt="" class="wp-image-123"/>
  </a>
</figure>
<!-- /wp:image -->
```

**Image with Custom Dimensions:**
```html
<!-- wp:image {"id":456,"width":300,"height":200} -->
<figure class="wp-block-image is-resized">
  <img src="https://example.com/image.jpg" alt="" class="wp-image-456" width="300" height="200"/>
</figure>
<!-- /wp:image -->
```

**Aligned Image (Center):**
```html
<!-- wp:image {"id":123,"align":"center"} -->
<figure class="wp-block-image aligncenter">
  <img src="https://example.com/image.jpg" alt="" class="wp-image-123"/>
</figure>
<!-- /wp:image -->
```

**Image with Object-Fit Cover:**
```html
<!-- wp:image {"id":456,"width":400,"height":300,"scale":"cover"} -->
<figure class="wp-block-image is-resized">
  <img src="https://example.com/image.jpg" alt="" class="wp-image-456" style="object-fit:cover" width="400" height="300"/>
</figure>
<!-- /wp:image -->
```

**Rounded Image with Border:**
```html
<!-- wp:image {"id":789,"className":"is-style-rounded"} -->
<figure class="wp-block-image is-style-rounded">
  <img src="https://example.com/image.jpg" alt="" class="wp-image-789"/>
</figure>
<!-- /wp:image -->
```

### Allowed Inner Blocks

**NONE** - Images are self-contained (figcaption is attribute-based, not InnerBlocks).

### CSS Classes Applied

**Base class:** `wp-block-image` (always present)

**Size classes:**
- `size-thumbnail` when `sizeSlug: "thumbnail"`
- `size-medium` when `sizeSlug: "medium"`
- `size-large` when `sizeSlug: "large"`
- `size-full` when `sizeSlug: "full"`

**Alignment classes:**
- `alignleft` when `align: "left"`
- `aligncenter` when `align: "center"`
- `alignright` when `align: "right"`
- `alignwide` when `align: "wide"`
- `alignfull` when `align: "full"`

**Resize indicator:**
- `is-resized` when custom `width` or `height` is set

**Image-specific classes:**
- `wp-image-{id}` class on `<img>` tag (CRITICAL - always present when id exists)

**Style variations:**
- `is-style-rounded` - rounded corners
- `is-style-default` - default style

### Common Mistakes

❌ **WRONG:** Missing `wp-image-{id}` class on img tag
```html
<figure class="wp-block-image">
  <img src="image.jpg" alt=""/>
</figure>
```

✅ **CORRECT:** Always include wp-image-{id} when id exists
```html
<figure class="wp-block-image">
  <img src="image.jpg" alt="" class="wp-image-123"/>
</figure>
```

❌ **WRONG:** Missing `is-resized` class when dimensions are set
```html
<!-- wp:image {"width":300} -->
<figure class="wp-block-image">
  <img src="image.jpg" alt="" width="300"/>
</figure>
```

✅ **CORRECT:** Include is-resized class
```html
<!-- wp:image {"width":300} -->
<figure class="wp-block-image is-resized">
  <img src="image.jpg" alt="" width="300"/>
</figure>
```

❌ **WRONG:** Using old figcaption class
```html
<figcaption>Caption text</figcaption>
```

✅ **CORRECT:** Modern figcaption uses wp-element-caption
```html
<figcaption class="wp-element-caption">Caption text</figcaption>
```

❌ **WRONG:** Size slug in attribute but not in class
```html
<!-- wp:image {"sizeSlug":"large"} -->
<figure class="wp-block-image">
  <img src="image.jpg"/>
</figure>
```

✅ **CORRECT:** Class must match sizeSlug
```html
<!-- wp:image {"sizeSlug":"large"} -->
<figure class="wp-block-image size-large">
  <img src="image.jpg"/>
</figure>
```

---

## 2. GALLERY BLOCK

**Block Name:** `core/gallery`

**Purpose:** Display multiple images in a grid layout. Uses nested image blocks as children.

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `images` | array | `[]` | Legacy: Array of image objects (deprecated in favor of InnerBlocks) |
| `ids` | array | `[]` | Array of attachment IDs |
| `columns` | number | undefined | Number of columns in grid |
| `caption` | rich-text | `""` | Gallery caption |
| `imageCrop` | boolean | `true` | Whether to crop images to aspect ratio |
| `fixedHeight` | boolean | `true` | Use fixed height for images |
| `linkTarget` | string | undefined | Link target for all images |
| `linkTo` | string | undefined | Link destination (`"none"`, `"media"`, `"attachment"`) |
| `sizeSlug` | string | `"large"` | Default image size for children |
| `allowResize` | boolean | `true` | Allow resizing gallery |
| `align` | string | undefined | Block alignment |
| `className` | string | undefined | Additional CSS classes |

### HTML Structure

**Basic Gallery (Modern - InnerBlocks):**
```html
<!-- wp:gallery {"linkTo":"none"} -->
<figure class="wp-block-gallery has-nested-images columns-default is-cropped">
  <!-- wp:image {"id":123,"sizeSlug":"large","linkDestination":"none"} -->
  <figure class="wp-block-image size-large">
    <img src="https://example.com/image1.jpg" alt="" class="wp-image-123"/>
  </figure>
  <!-- /wp:image -->
  
  <!-- wp:image {"id":456,"sizeSlug":"large","linkDestination":"none"} -->
  <figure class="wp-block-image size-large">
    <img src="https://example.com/image2.jpg" alt="" class="wp-image-456"/>
  </figure>
  <!-- /wp:image -->
  
  <!-- wp:image {"id":789,"sizeSlug":"large","linkDestination":"none"} -->
  <figure class="wp-block-image size-large">
    <img src="https://example.com/image3.jpg" alt="" class="wp-image-789"/>
  </figure>
  <!-- /wp:image -->
</figure>
<!-- /wp:gallery -->
```

**Gallery with Specific Columns:**
```html
<!-- wp:gallery {"columns":3,"linkTo":"none"} -->
<figure class="wp-block-gallery has-nested-images columns-3 is-cropped">
  <!-- nested image blocks -->
</figure>
<!-- /wp:gallery -->
```

**Gallery with Caption:**
```html
<!-- wp:gallery {"linkTo":"none"} -->
<figure class="wp-block-gallery has-nested-images columns-default is-cropped">
  <!-- nested image blocks -->
  <figcaption class="wp-element-caption">Photo gallery from our event</figcaption>
</figure>
<!-- /wp:gallery -->
```

**Gallery Not Cropped:**
```html
<!-- wp:gallery {"imageCrop":false} -->
<figure class="wp-block-gallery has-nested-images columns-default">
  <!-- nested image blocks -->
</figure>
<!-- /wp:gallery -->
```

### Allowed Inner Blocks

**ONLY `core/image` blocks** - Gallery contains image blocks as children.

### CSS Classes Applied

**Base class:** `wp-block-gallery` (always present)

**Modern gallery indicator:**
- `has-nested-images` (indicates InnerBlocks-based gallery, not legacy)

**Column classes:**
- `columns-default` when columns not explicitly set
- `columns-{n}` when columns specified (e.g., `columns-3`, `columns-4`)

**Crop indicator:**
- `is-cropped` when `imageCrop: true` (default)
- No class when `imageCrop: false`

**Alignment classes:**
- `alignwide` when `align: "wide"`
- `alignfull` when `align: "full"`

### Common Mistakes

❌ **WRONG:** Missing `has-nested-images` class in modern gallery
```html
<figure class="wp-block-gallery columns-3">
  <!-- nested images -->
</figure>
```

✅ **CORRECT:** Modern galleries always have has-nested-images
```html
<figure class="wp-block-gallery has-nested-images columns-3">
  <!-- nested images -->
</figure>
```

❌ **WRONG:** Putting non-image blocks inside gallery
```html
<!-- wp:gallery -->
<figure class="wp-block-gallery has-nested-images">
  <!-- wp:paragraph -->
  <p>Text</p>
  <!-- /wp:paragraph -->
</figure>
<!-- /wp:gallery -->
```

✅ **CORRECT:** Only image blocks allowed
```html
<!-- wp:gallery -->
<figure class="wp-block-gallery has-nested-images">
  <!-- wp:image -->
  <figure class="wp-block-image">...</figure>
  <!-- /wp:image -->
</figure>
<!-- /wp:gallery -->
```

❌ **WRONG:** Missing `is-cropped` when imageCrop is true
```html
<!-- wp:gallery {"imageCrop":true} -->
<figure class="wp-block-gallery has-nested-images">
```

✅ **CORRECT:** Include is-cropped class
```html
<!-- wp:gallery {"imageCrop":true} -->
<figure class="wp-block-gallery has-nested-images is-cropped">
```

---

## 3. VIDEO BLOCK

**Block Name:** `core/video`

**Purpose:** Embed video files with player controls and customization options.

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `src` | string | undefined | Video source URL |
| `id` | number | undefined | Attachment ID from media library |
| `caption` | rich-text | `""` | Video caption |
| `poster` | string | undefined | Poster image URL (thumbnail before play) |
| `controls` | boolean | `true` | Show playback controls |
| `autoplay` | boolean | `false` | Autoplay on page load (requires muted) |
| `loop` | boolean | `false` | Loop video when finished |
| `muted` | boolean | `false` | Start muted (required for autoplay) |
| `playsInline` | boolean | `false` | Play inline on mobile (not fullscreen) |
| `preload` | string | `"metadata"` | Preload behavior (`"none"`, `"metadata"`, `"auto"`) |
| `tracks` | array | `[]` | Text tracks (subtitles/captions) in WebVTT format |
| `align` | string | undefined | Block alignment |
| `width` | number | undefined | Custom width |
| `height` | number | undefined | Custom height |
| `anchor` | string | undefined | HTML ID attribute |
| `className` | string | undefined | Additional CSS classes |

### HTML Structure

**Basic Video:**
```html
<!-- wp:video -->
<figure class="wp-block-video">
  <video controls src="https://example.com/video.mp4"></video>
</figure>
<!-- /wp:video -->
```

**Video with Caption:**
```html
<!-- wp:video {"id":123} -->
<figure class="wp-block-video">
  <video controls src="https://example.com/video.mp4"></video>
  <figcaption class="wp-element-caption">Video demonstration</figcaption>
</figure>
<!-- /wp:video -->
```

**Video with Poster Image:**
```html
<!-- wp:video {"id":456,"poster":"https://example.com/poster.jpg"} -->
<figure class="wp-block-video">
  <video controls poster="https://example.com/poster.jpg" src="https://example.com/video.mp4"></video>
</figure>
<!-- /wp:video -->
```

**Autoplay Video (Muted & Loop):**
```html
<!-- wp:video {"autoplay":true,"loop":true,"muted":true} -->
<figure class="wp-block-video">
  <video autoplay loop muted src="https://example.com/video.mp4"></video>
</figure>
<!-- /wp:video -->
```

**Video with Preload:**
```html
<!-- wp:video {"preload":"auto"} -->
<figure class="wp-block-video">
  <video controls preload="auto" src="https://example.com/video.mp4"></video>
</figure>
<!-- /wp:video -->
```

**Video with Plays Inline:**
```html
<!-- wp:video {"playsInline":true} -->
<figure class="wp-block-video">
  <video controls playsinline src="https://example.com/video.mp4"></video>
</figure>
<!-- /wp:video -->
```

**Video with Tracks (Subtitles):**
```html
<!-- wp:video -->
<figure class="wp-block-video">
  <video controls src="https://example.com/video.mp4">
    <track kind="subtitles" src="https://example.com/subtitles.vtt" srclang="en" label="English"/>
  </video>
</figure>
<!-- /wp:video -->
```

**Aligned Video:**
```html
<!-- wp:video {"align":"center"} -->
<figure class="wp-block-video aligncenter">
  <video controls src="https://example.com/video.mp4"></video>
</figure>
<!-- /wp:video -->
```

### Allowed Inner Blocks

**NONE** - Video blocks are self-contained.

### CSS Classes Applied

**Base class:** `wp-block-video` (always present)

**Alignment classes:**
- `aligncenter` when `align: "center"`
- `alignwide` when `align: "wide"`
- `alignfull` when `align: "full"`

### Video Attributes Applied

**Boolean attributes** (present when true, absent when false):
- `controls` - Shows player controls (default true)
- `autoplay` - Auto-plays video (requires muted)
- `loop` - Loops video
- `muted` - Starts muted
- `playsinline` - Plays inline on mobile

**Value attributes:**
- `poster="url"` - Poster image
- `preload="none|metadata|auto"` - Preload behavior
- `src="url"` - Video source

### Common Mistakes

❌ **WRONG:** Autoplay without muted (browsers block this)
```html
<!-- wp:video {"autoplay":true} -->
<video autoplay src="video.mp4"></video>
```

✅ **CORRECT:** Autoplay requires muted
```html
<!-- wp:video {"autoplay":true,"muted":true} -->
<video autoplay muted src="video.mp4"></video>
```

❌ **WRONG:** Using `controls=""` instead of just `controls`
```html
<video controls="" src="video.mp4"></video>
```

✅ **CORRECT:** Boolean attributes need no value
```html
<video controls src="video.mp4"></video>
```

❌ **WRONG:** Missing figure wrapper
```html
<!-- wp:video -->
<video controls src="video.mp4"></video>
<!-- /wp:video -->
```

✅ **CORRECT:** Video wrapped in figure
```html
<!-- wp:video -->
<figure class="wp-block-video">
  <video controls src="video.mp4"></video>
</figure>
<!-- /wp:video -->
```

❌ **WRONG:** Wrong attribute name for inline playback
```html
<video playsInline src="video.mp4"></video>
```

✅ **CORRECT:** Lowercase playsinline
```html
<video playsinline src="video.mp4"></video>
```

---

## 4. AUDIO BLOCK

**Block Name:** `core/audio`

**Purpose:** Embed audio files with player controls and customization options.

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `src` | string | undefined | Audio source URL |
| `id` | number | undefined | Attachment ID from media library |
| `caption` | rich-text | `""` | Audio caption |
| `autoplay` | boolean | `false` | Autoplay on page load |
| `loop` | boolean | `false` | Loop audio when finished |
| `preload` | string | `"none"` | Preload behavior (`"none"`, `"metadata"`, `"auto"`) |
| `align` | string | undefined | Block alignment (`"left"`, `"center"`, `"right"`, `"wide"`, `"full"`) |
| `anchor` | string | undefined | HTML ID attribute |
| `className` | string | undefined | Additional CSS classes |

### HTML Structure

**Basic Audio:**
```html
<!-- wp:audio -->
<figure class="wp-block-audio">
  <audio controls src="https://example.com/audio.mp3"></audio>
</figure>
<!-- /wp:audio -->
```

**Audio with Caption:**
```html
<!-- wp:audio {"id":123} -->
<figure class="wp-block-audio">
  <audio controls src="https://example.com/podcast.mp3"></audio>
  <figcaption class="wp-element-caption">Episode 1: Introduction</figcaption>
</figure>
<!-- /wp:audio -->
```

**Audio with Autoplay and Loop:**
```html
<!-- wp:audio {"autoplay":true,"loop":true} -->
<figure class="wp-block-audio">
  <audio autoplay loop controls src="https://example.com/music.mp3"></audio>
</figure>
<!-- /wp:audio -->
```

**Audio with Preload:**
```html
<!-- wp:audio {"preload":"metadata"} -->
<figure class="wp-block-audio">
  <audio controls preload="metadata" src="https://example.com/audio.mp3"></audio>
</figure>
<!-- /wp:audio -->
```

**Aligned Audio:**
```html
<!-- wp:audio {"align":"center"} -->
<figure class="wp-block-audio aligncenter">
  <audio controls src="https://example.com/audio.mp3"></audio>
</figure>
<!-- /wp:audio -->
```

**Audio with All Options:**
```html
<!-- wp:audio {"id":456,"autoplay":true,"loop":true,"preload":"auto"} -->
<figure class="wp-block-audio">
  <audio autoplay loop controls preload="auto" src="https://example.com/background.mp3"></audio>
  <figcaption class="wp-element-caption">Background music</figcaption>
</figure>
<!-- /wp:audio -->
```

### Allowed Inner Blocks

**NONE** - Audio blocks are self-contained.

### CSS Classes Applied

**Base class:** `wp-block-audio` (always present)

**Alignment classes:**
- `alignleft` when `align: "left"`
- `aligncenter` when `align: "center"`
- `alignright` when `align: "right"`
- `alignwide` when `align: "wide"`
- `alignfull` when `align: "full"`

### Audio Attributes Applied

**Boolean attributes** (present when true, absent when false):
- `controls` - Shows player controls (ALWAYS present for accessibility)
- `autoplay` - Auto-plays audio (use with caution)
- `loop` - Loops audio

**Value attributes:**
- `preload="none|metadata|auto"` - Preload behavior
- `src="url"` - Audio source

**Preload behavior:**
- `none` - Nothing downloaded automatically (default, fastest)
- `metadata` - Only file metadata downloaded
- `auto` - Entire file downloaded with page

### Common Mistakes

❌ **WRONG:** Missing controls attribute
```html
<figure class="wp-block-audio">
  <audio src="audio.mp3"></audio>
</figure>
```

✅ **CORRECT:** Always include controls
```html
<figure class="wp-block-audio">
  <audio controls src="audio.mp3"></audio>
</figure>
```

❌ **WRONG:** Missing figure wrapper
```html
<!-- wp:audio -->
<audio controls src="audio.mp3"></audio>
<!-- /wp:audio -->
```

✅ **CORRECT:** Audio wrapped in figure
```html
<!-- wp:audio -->
<figure class="wp-block-audio">
  <audio controls src="audio.mp3"></audio>
</figure>
<!-- /wp:audio -->
```

❌ **WRONG:** Using `controls=""` instead of just `controls`
```html
<audio controls="" src="audio.mp3"></audio>
```

✅ **CORRECT:** Boolean attributes need no value
```html
<audio controls src="audio.mp3"></audio>
```

❌ **WRONG:** Old figcaption class
```html
<figcaption>Caption</figcaption>
```

✅ **CORRECT:** Modern figcaption uses wp-element-caption
```html
<figcaption class="wp-element-caption">Caption</figcaption>
```

---

## BATCH 3 SUMMARY

**Media blocks documented:** 4  
✅ image  
✅ gallery  
✅ video  
✅ audio

**Key Patterns to Remember:**

1. **Image block** requires `wp-image-{id}` class on `<img>` tag when id exists
2. **Gallery block** uses `has-nested-images` class for modern InnerBlocks-based galleries
3. **Video block** autoplay REQUIRES muted attribute (browser policy)
4. **Audio block** ALWAYS includes `controls` attribute for accessibility
5. **All media blocks** wrap their content in `<figure class="wp-block-{type}">` element
6. **Captions** use `<figcaption class="wp-element-caption">` (modern standard)

**Critical Validation Points:**

**Image:**
- `wp-image-{id}` class on img tag is MANDATORY when id exists
- `is-resized` class required when width/height set
- Size class (`size-large`) must match `sizeSlug` attribute
- Caption uses `wp-element-caption` class, not old classes

**Gallery:**
- `has-nested-images` class indicates modern gallery (not legacy)
- ONLY image blocks allowed as children
- `is-cropped` class when `imageCrop: true`
- Column class (`columns-3`) must match `columns` attribute

**Video:**
- `autoplay` REQUIRES `muted` (browsers block unmuted autoplay)
- `playsinline` attribute (lowercase) enables inline mobile playback
- Boolean attributes: no value needed (`controls`, not `controls=""`)
- Always wrapped in `<figure class="wp-block-video">`

**Audio:**
- `controls` attribute ALWAYS present (accessibility requirement)
- Default `preload: "none"` for performance (unlike video's `"metadata"`)
- Boolean attributes: no value needed
- Always wrapped in `<figure class="wp-block-audio">`

**Media Block Commonalities:**
```
All media blocks follow this pattern:
<figure class="wp-block-{type}">
  <{media-element} attributes>
  [<figcaption class="wp-element-caption">Caption</figcaption>]
</figure>
```

**PressPilot Specific Applications:**

**Hero Sections (Image/Video):**
- Full-width images: `align: "full"`
- Background videos: `autoplay: true, muted: true, loop: true, playsInline: true`
- Poster images for videos improve perceived performance

**Product Galleries:**
- Use gallery block with `linkTo: "media"` for lightbox effect
- Set appropriate columns for responsive grid
- `imageCrop: true` for consistent aspect ratios

**Feature Sections:**
- Image blocks with `align: "wide"` or `align: "center"`
- Always include descriptive alt text for accessibility
- Use appropriate image sizes (`sizeSlug`) for performance

**Audio Content:**
- Podcast embeds with captions for episode info
- `preload: "metadata"` shows duration without loading full file
- Avoid autoplay on audio (poor UX)

### Performance Best Practices

**Image Optimization:**
- Always specify `sizeSlug` for responsive images
- Use `loading="lazy"` (WordPress adds automatically)
- Include width/height to prevent layout shift

**Video Optimization:**
- Always provide `poster` image for perceived performance
- Use `preload: "metadata"` (default) for balance
- Consider `preload: "none"` for pages with multiple videos
- Background videos: `autoplay, muted, loop, playsInline`

**Audio Optimization:**
- Default `preload: "none"` is optimal (user-initiated play)
- Use `preload: "metadata"` if showing duration is critical
- Avoid `preload: "auto"` unless necessary (bandwidth impact)

**Next Batches:**
- BATCH 4: Interactive Blocks (buttons, button, navigation, search, social-links, social-link)
- BATCH 5: Site Blocks (site-title, site-logo, site-tagline)
- BATCH 6: Query Blocks (query, post-template, post-title, etc.)
- BATCH 7: Template Blocks (template-part)

---

*Document version: 1.0*  
*Batch 3 completed: February 2025*  
*Based on: WordPress 6.7+ Block Library*  
*Sources: Gutenberg block.json files, WordPress Core Blocks Reference, Official Documentation*
