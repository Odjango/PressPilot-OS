<?php
/**
 * Stabilize Content Script
 * 1. Configures Home Hero (Removes "Home" if present).
 * 2. Adds 1000px spacers to internal pages.
 */
require_once('wp-load.php');

echo "--- STABILIZING CONTENT ---\n";

// 1. Fix Home
$home = get_page_by_title('Home');
if ($home) {
    echo "Processing Home (ID: {$home->ID})...\n";
    $content = $home->post_content;

    // User asked to "Remove the word 'Home' from the homepage hero."
    // Current assumption: The Title "Home" might be appearing, or implicit text.
    // We will do a safe check: if the content explicitly contains "Home" inside an H1, replace it.
    // But our bake uses "Koboo Pizza".
    // Let's ensure the content is purely what we expect. 
    // We won't blindly strip "Home" as it might be in text.
    // The CSS `.wp-block-post-title { display: none }` handles the Title output.
    // We will ensure the post_title is preserved for admin, but verify content integrity.

    echo "Home content length: " . strlen($content) . "\n";
    // No specific string replacement requested other than "Remove 'Home'".
    // Use case: Defaults often put "Home" in H1. Our bake puts "Koboo Pizza".
    // We'll leave it unless we detect "Home" in H1.
    if (strpos($content, '<h1 class="wp-block-heading">Home</h1>') !== false) {
        $content = str_replace('<h1 class="wp-block-heading">Home</h1>', '', $content);
        echo "Removed 'Home' H1 from content.\n";
        wp_update_post(['ID' => $home->ID, 'post_content' => $content]);
    } else {
        echo "Clean Hero verified (No 'Home' H1 found).\n";
    }
}

// 2. Inject Spacers
$internal_pages = ['About', 'Services', 'Blog', 'Contact', 'Menu'];
$spacer = '<!-- wp:spacer {"height":"1000px"} --><div style="height:1000px" aria-hidden="true" class="wp-block-spacer"></div><!-- /wp:spacer -->';

foreach ($internal_pages as $title) {
    $page = get_page_by_title($title);
    if ($page) {
        if (strpos($page->post_content, 'wp-block-spacer') === false) {
            echo "Injecting Spacer into $title (ID: {$page->ID})...\n";
            $updated_content = $page->post_content . "\n\n" . $spacer;
            wp_update_post(['ID' => $page->ID, 'post_content' => $updated_content]);
        } else {
            echo "Spacer already present in $title.\n";
        }
    } else {
        echo "Page '$title' not found.\n";
    }
}

echo "--- STABILIZATION COMPLETE ---\n";
