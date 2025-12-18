# FSE & Theme Generator Research: Gemini SaaS Insights

**Source**: `FSE Rules/Gemini SaaS Chat.rtfd` (Deep analysis via grep/pattern matching)
**Date**: 2025-12-15

## Executive Summary
The analyzed conversation outlines a robust architecture for a "SaaS-to-WordPress" generator. The core philosophy is **"Do not generate PHP. Generate FSE Templates."** This aligns with modern WordPress standards and minimizes the risk of generating broken PHP code.

## Key Technical Details

### 1. The "Empty Theme" Strategy
Instead of asking AI to write complex `functions.php` or `header.php` logic, the system should strictly generate **Full Site Editing (FSE) Block Templates** (`.html` files).

*   **Structure**:
    *   `style.css` (Standard header)
    *   `theme.json` (Global settings)
    *   `templates/index.html` (Fallback)
    *   `templates/front-page.html` (The generated homepage)
    *   No PHP creation (except for a static, pre-written `functions.php` in the base theme).

### 2. Smart Sideload Logic (The "Magic" Trick)
To handle external images (which don't have WordPress Media IDs when generating the HTML), the proposed solution is a "Sideloading Script" included in the base theme's `functions.php`.

**Mechanism**:
1.  **Define**: The theme (or a JSON configuration) holds a list of remote image URLs (e.g., Unsplash/Pexels).
2.  **Sideload**: On theme activation (or first run), the script iterates through this list.
3.  **Fetch**: Uses `media_sideload_image($url, 0, null, 'id')` to download the image into the local Media Library.
4.  **Inject**: The script then effectively "patches" the generated content (or acts as a placeholder replacement system) to use the new local Attachment ID.

**Code Snippet (Extracted & Reconstructed)**:
```php
$remote_images = array(
    'hero_image' => 'https://example.com/image.jpg',
    // ...
);

$sideloaded_ids = array();
foreach ($remote_images as $key => $url) {
    // 0 = post_id (unattached), null = desc, 'id' = return type
    $id = media_sideload_image($url, 0, null, 'id');
    
    if ( !is_wp_error($id) ) {
        $sideloaded_ids[$key] = $id;
    }
}

// Updating logic follows...
// e.g., finding the front page and replacing the header image ID
$front_page = get_page_by_path('home');
if ($front_page && isset($sideloaded_ids['hero_image'])) {
    $local_url = wp_get_attachment_url($sideloaded_ids['hero_image']);
    // Update block attributes or post content...
}
```

### 3. Content Provisioning via Arrays
The chat suggests provisioning pages and menus programmatically using arrays, rather than relying solely on XML imports.

*   **Pages**: `post_title`, `post_content`, `page_template`.
*   **Menus**: `wp_create_nav_menu`, `wp_update_nav_menu_item`.
*   **Home/Blog Assignment**: `update_option('page_on_front', $id)`.

### 4. Technical Constants
*   **Parser**: Use `@wordpress/block-serialization-default-parser` for validating generic content before it hits WordPress.
*   **Core Blocks Only**: Strictly limit output to standard `wp:group`, `wp:image`, `wp:heading`, etc., to avoid plugin dependencies.

## Implications for PressPilot
1.  **Base Theme**: Your "Golden Base Theme" is the correct approach. It should remain "dumb" (no generated PHP) and serve as the container for generated HTML templates.
2.  **Image Handling**: The current generator might be using hotlinked images. Adopting the "Smart Sideload" pattern would make the themes truly independent and "native" upon installation.
3.  **Validation**: The suggestion to use the official parser confirms the need for your "Hard Gates" to ensure block syntax correctness.
