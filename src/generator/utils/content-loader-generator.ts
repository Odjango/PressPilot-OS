
import { PageData } from '../types';

export const generateContentLoader = (pages: PageData[]): string => {
    if (!pages || pages.length === 0) return '';

    const pagesArrayPhp = pages.map(p => `
            [
                'title' => '${p.title.replace(/'/g, "\\'")}',
                'slug'  => '${p.slug}',
                'content' => '', // Content is in the template: page-${p.slug}.html
            ]`).join(',');

    return `<?php
/**
 * Auto-Content Loader
 * 
 * Automatically creates pages upon theme activation if they don't exist.
 * This ensures the "Site Generator" output works immediately.
 */

function presspilot_auto_create_pages() {
    $pages = [${pagesArrayPhp}
    ];

    foreach ($pages as $page) {
        $existing = get_page_by_path($page['slug']);
        if (!$existing) {
            wp_insert_post([
                'post_title'    => $page['title'],
                'post_name'     => $page['slug'],
                'post_content'  => $page['content'],
                'post_status'   => 'publish',
                'post_type'     => 'page',
            ]);
        }
    }
    
    // Also ensuring a static "Home" page exists if we are in Heavy mode?
    // For now, let's just Stick to the custom pages request.
}
add_action('after_switch_theme', 'presspilot_auto_create_pages');
`;
};
