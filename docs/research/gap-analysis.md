# Gap Analysis: PressPilot Repo vs. Gemini Vision

**Comparison Target**: `PressPilot-OS/scripts/buildWpTheme.ts` & `golden-spec` vs. `Gemini SaaS Chat.rtfd` Vision.

## 1. Architecture Alignment (High Conflict / High Potential)
| Feature | Gemini Vision | PressPilot Current | Gap |
| :--- | :--- | :--- | :--- |
| **Theme Strategy** | "Empty Theme" + FSE Templates | Golden Base + Generated Templates | **Aligned**. You are correctly following the "dumb theme" logic. |
| **Content Creation** | Programmatic "Arrays to `wp_insert_post`" | `buildWpTheme.ts` injects a custom `Seeder` class into `functions.php` | **Aligned**. Your `NAMESPACE_Seeder` logic in `buildWpTheme.ts` (lines 190-305) is exactly what Gemini proposed. |
| **Image Handling** | **"Smart Sideload"** (Auto-import remote URLs to Media Lib) | **Unknown/Missing**. Your Seeder creates pages but does *not* seem to download/attach images. | **CRITICAL GAP**. You are likely generating content with hotlinked images or placeholders, whereas Gemini proposes a self-healing import. |
| **Parser Safety** | `@wordpress/block-serialization-default-parser` | Implemented in "Hard Gates" validator | **Aligned**. You are ahead of the game here with your recent Validator updates. |

## 2. Specific Missing "Tricks"

### A. The "Smart Sideload" Logic
*   **Gemini says**: "You cannot just put a URL in `page_content`. You need to `media_sideload_image`, get the ID, and *then* build the block."
*   **You have**: A seeder that inserts text content.
*   **The Fix**: Your `Seeder` class needs a `sideload_images()` method that runs *before* page creation, creating a map of `['hero' => 101, 'about' => 102]`, so you can inject real Attachment IDs into the generated HTML.

### B. The "One Sideload" Flag
*   **Gemini says**: "Guard clause to prevent re-running."
*   **You have**: `get_option('${NAMESPACE_SLUG}_seeded')`.
*   **Status**: **Matched**. You already have this protection.

### C. The "PDF Menu" Button
*   **Gemini says**: A specific feature to auto-generate/link a PDF menu for restaurants.
*   **You have**: Standard page generation.
*   **Gap**: Minor feature gap, but relevant if targeting restaurants specifically.

## 3. Conclusion & Recommendation
You are 80% of the way there. The structure is perfect. The **only major missing piece** is the **Image Sideloading Pipeline**.

**Recommendation**:
Update `scripts/buildWpTheme.ts` to:
1.  Accept an `images` array in config.
2.  Update the injected `Seeder` class to include the `media_sideload_image` logic.
3.  Pass the resulting IDs into the content generation step.
