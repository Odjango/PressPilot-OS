<?php

/**
 * Class PressPilot_Theme_Generator
 *
 * Handles the server-side generation of a Twenty Twenty-Four child theme
 * based on user input, using OpenAI for content generation.
 */
class PressPilot_Theme_Generator
{

    private $base_temp_dir;
    private $uploads_url;
    private $api_key;

    public function __construct()
    {
        if (function_exists('wp_upload_dir')) {
            $upload_dir = wp_upload_dir();
            $this->base_temp_dir = $upload_dir['basedir'] . '/presspilot-temp/';
            $this->uploads_url = $upload_dir['baseurl'] . '/presspilot-generated/';
        } else {
            $this->base_temp_dir = sys_get_temp_dir() . '/presspilot-temp/';
            $this->uploads_url = '/uploads/presspilot-generated/';
        }

        if (defined('PRESSPILOT_OPENAI_KEY')) {
            $this->api_key = PRESSPILOT_OPENAI_KEY;
        }
    }

    public function generate($request_data)
    {
        // Validation
        if (empty($request_data['business_name'])) {
            return ['error' => 'Business Name is required.'];
        }

        $unique_id = uniqid();
        $theme_slug = 'presspilot-' . $unique_id;
        $industry = $request_data['business_type'];

        // 1. Prepare Data
        $patterns = $this->get_patterns_for_industry($industry);
        $colors = $this->get_branding_colors($industry, $request_data['business_description']);
        $nav_links = $this->get_navigation_links($industry);

        $theme_data = [
            'business_name' => $request_data['business_name'],
            'business_tagline' => $request_data['business_tagline'] ?? '',
            'description' => $request_data['business_description'],
            'language' => $request_data['content_language'] ?? 'English',
            'industry' => $industry,
            'colors' => $colors,
            'fonts' => ['heading' => 'Inter', 'body' => 'Inter'],
            'patterns' => $patterns,
            'navigation' => $nav_links
        ];

        // 2. Call OpenAI API
        $system_prompt = "You are a professional web copywriter. Output valid JSON only.";
        $user_prompt = $this->construct_content_prompt($theme_data);
        $ai_content = $this->call_openai_api($system_prompt, $user_prompt, $patterns);

        // 3. Setup Directory
        $theme_dir = $this->setup_directory($unique_id, $theme_slug);
        if (!$theme_dir) {
            return ['error' => 'Failed to create directory.'];
        }

        // 4. Create Essential Files
        $this->create_style_css($theme_dir, $theme_slug);
        $this->create_theme_json($theme_dir, $theme_data);

        // 5. Assemble Templates (The Fix is Here)
        $this->assemble_homepage($theme_dir, $theme_data, $ai_content);

        // 6. Generate Special Pages
        $this->generate_special_pages($theme_dir, $theme_data, $ai_content);

        // 7. Package
        $zip_url = $this->package_theme($theme_dir, $unique_id, $theme_slug);

        return [
            'success' => true,
            'download_url' => $zip_url,
            'unique_id' => $unique_id
        ];
    }

    // --- LOGIC: ASSEMBLE HOMEPAGE (SAFE MODE) ---

    private function assemble_homepage($theme_dir, $theme_data, $ai_content)
    {
        // 1. Navigation Links (Safe Self-Closing Tags)
        $header_nav_html = '';
        foreach ($theme_data['navigation']['header'] as $link) {
            $header_nav_html .= '<!-- wp:navigation-link {"label":"' . $link['label'] . '","url":"' . $link['url'] . '","kind":"custom","isTopLevelLink":true} /-->';
        }

        $footer_nav_html = '';
        foreach ($theme_data['navigation']['footer'] as $link) {
            $footer_nav_html .= '<!-- wp:navigation-link {"label":"' . $link['label'] . '","url":"' . $link['url'] . '","kind":"custom","isTopLevelLink":true} /-->';
        }

        $bg_color = $theme_data['colors']['primary'] ?? '#000000';
        $business_name = $theme_data['business_name'];
        $tagline = $theme_data['business_tagline'];
        $year = date('Y');

        // 2. HEADER
        // "Keep inner flex containers". Using a clean Group block with Navigation.
        $header = <<<HTML
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|30","bottom":"var:preset|spacing|30","left":"var:preset|spacing|30","right":"var:preset|spacing|30"}}},"layout":{"type":"flex","justifyContent":"space-between"}} -->
<div class="wp-block-group alignfull" style="padding-top:var(--wp--preset--spacing--30);padding-right:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--30);padding-left:var(--wp--preset--spacing--30)">
    <!-- wp:group {"layout":{"type":"flex"}} -->
    <div class="wp-block-group">
        <!-- wp:site-logo /-->
    </div>
    <!-- /wp:group -->
    <!-- wp:navigation {"layout":{"type":"flex","orientation":"horizontal"}} -->
    <nav class="wp-block-navigation is-layout-flex wp-container-nav">
        $header_nav_html
    </nav>
    <!-- /wp:navigation -->
</div>
<!-- /wp:group -->
HTML;

        // 3. HERO SECTION (Standard core/cover block, no outer group)
        $hero = <<<HTML
<!-- wp:cover {"minHeight":600,"align":"full","style":{"color":{"background":"$bg_color"}}} -->
<div class="wp-block-cover alignfull" style="min-height:600px;background-color:$bg_color">
    <span aria-hidden="true" class="wp-block-cover__background has-background-dim-100 has-background-dim"></span>
    <div class="wp-block-cover__inner-container">
        <!-- wp:group {"layout":{"type":"constrained"}} -->
        <div class="wp-block-group">
            <!-- wp:heading {"textAlign":"center","style":{"typography":{"fontSize":"4rem"}}} -->
            <h1 class="wp-block-heading has-text-align-center" style="font-size:4rem">$business_name</h1>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"1.5rem"}}} -->
            <p class="has-text-align-center" style="font-size:1.5rem">$tagline</p>
            <!-- /wp:paragraph -->
            <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
            <div class="wp-block-buttons">
                <!-- wp:button {"className":"is-style-fill"} -->
                <div class="wp-block-button is-style-fill"><a class="wp-block-button__link wp-element-button">Get Started</a></div>
                <!-- /wp:button -->
            </div>
            <!-- /wp:buttons -->
        </div>
        <!-- /wp:group -->
    </div>
</div>
<!-- /wp:cover -->
HTML;

        // 4. BODY PATTERNS (Naked Strategy: No wrappers, just pattern slugs)
        $body = '';
        foreach ($theme_data['patterns'] as $pattern_slug) {
            if ($pattern_slug === 'hero')
                continue;

            // Map keywords to Safe Core Patterns
            $safe_slug = 'twentytwentyfour/text-centered-grid-3-col'; // Default fallback

            if (strpos($pattern_slug, 'pricing') !== false)
                $safe_slug = 'twentytwentyfour/pricing';
            if (strpos($pattern_slug, 'contact') !== false)
                $safe_slug = 'twentytwentyfour/call-to-action';
            if (strpos($pattern_slug, 'testimonials') !== false)
                $safe_slug = 'twentytwentyfour/testimonial-centered';

            // Just the pattern, NO groups
            $body .= "\n<!-- wp:pattern {\"slug\":\"$safe_slug\"} /-->\n";
        }

        // 5. FOOTER
        $footer = <<<HTML
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50"}}},"backgroundColor":"contrast","textColor":"base","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-base-color has-contrast-background-color has-text-color has-background" style="padding-top:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--50)">
    <!-- wp:group {"align":"wide","layout":{"type":"flex","justifyContent":"center"}} -->
    <div class="wp-block-group alignwide">
        <!-- wp:paragraph {"fontSize":"small"} -->
        <p class="has-small-font-size">© $year $business_name</p>
        <!-- /wp:paragraph -->
        <!-- wp:navigation {"layout":{"type":"flex","orientation":"horizontal"}} -->
        <nav class="wp-block-navigation is-layout-flex wp-container-nav">
            $footer_nav_html
        </nav>
        <!-- /wp:navigation -->
    </div>
    <!-- /wp:group -->
</div>
<!-- /wp:group -->
HTML;

        // 6. ASSEMBLE (Concatenation)
        $full_html = $header . "\n" . $hero . "\n" . $body . "\n" . $footer;

        file_put_contents($theme_dir . '/templates/front-page.html', $this->sanitize_block_html($full_html));
    }

    /**
     * Sanitizer Guardrail: Prevents "Attempt Recovery" errors.
     * Replaces newlines/multi-spaces with single space, removes spaces between tags.
     */
    private function sanitize_block_html($html)
    {
        $html = preg_replace('/\s+/', ' ', $html);
        $html = preg_replace('/>\s+</', '><', $html);
        return trim($html);
    }

    // --- LOGIC: SUPPORT METHODS ---

    private function get_navigation_links($industry)
    {
        $header = [
            ['label' => 'Home', 'url' => '/'],
            ['label' => 'About', 'url' => '/about'],
        ];
        $footer = [
            ['label' => 'Privacy', 'url' => '/privacy'],
            ['label' => 'Contact', 'url' => '/contact'],
        ];
        return ['header' => $header, 'footer' => $footer];
    }

    private function get_patterns_for_industry($industry)
    {
        // Simple list that maps to our new Safe Slugs
        if (stripos($industry, 'Restaurant') !== false)
            return ['hero', 'text-centered-grid-3-col', 'contact'];
        if (stripos($industry, 'Fitness') !== false)
            return ['hero', 'pricing', 'contact'];
        return ['hero', 'text-centered-grid-3-col', 'pricing'];
    }

    private function get_branding_colors($industry, $desc)
    {
        if (stripos($industry, 'Food') !== false)
            return ['primary' => '#ef4444', 'secondary' => '#78350f', 'base' => '#ffffff', 'contrast' => '#000000'];
        return ['primary' => '#000000', 'secondary' => '#ffffff', 'base' => '#ffffff', 'contrast' => '#000000'];
    }

    private function construct_content_prompt($data)
    {
        return "Generate content for " . $data['business_name'];
    }

    private function call_openai_api($sys, $user, $patterns)
    {
        // Returning empty array because we are using Core Patterns for now to fix validation
        return [];
    }

    private function setup_directory($unique_id, $theme_slug)
    {
        $path = $this->base_temp_dir . $unique_id . '/' . $theme_slug;
        if (!is_dir($path))
            mkdir($path, 0755, true);
        if (!is_dir($path . '/templates'))
            mkdir($path . '/templates', 0755, true);
        return $path;
    }

    private function create_style_css($dir, $slug)
    {
        file_put_contents($dir . '/style.css', "/*\nTheme Name: PressPilot Generated Theme\nTemplate: twentytwentyfour\n*/");
    }

    private function create_theme_json($dir, $data)
    {
        $json = ['version' => 2, 'settings' => ['color' => ['palette' => []]]];
        foreach ($data['colors'] as $k => $v)
            $json['settings']['color']['palette'][] = ['slug' => $k, 'color' => $v, 'name' => ucfirst($k)];
        file_put_contents($dir . '/theme.json', json_encode($json, JSON_PRETTY_PRINT));
    }

    private function package_theme($dir, $id, $slug)
    {
        $zip_filename = $slug . '.zip';
        $public_dir = wp_upload_dir()['basedir'] . '/presspilot-generated/';
        if (!is_dir($public_dir))
            mkdir($public_dir, 0755, true);

        $zip = new ZipArchive();
        if ($zip->open($public_dir . $zip_filename, ZipArchive::CREATE | ZipArchive::OVERWRITE)) {
            $files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir), RecursiveIteratorIterator::LEAVES_ONLY);
            foreach ($files as $file) {
                if (!$file->isDir())
                    $zip->addFile($file->getRealPath(), substr($file->getRealPath(), strlen($this->base_temp_dir . $id . '/')));
            }
            $zip->close();
        }
        return $this->uploads_url . $zip_filename;
    }

    private function generate_special_pages($theme_dir, $theme_data, $ai_content)
    {
        $business_name = $theme_data['business_name'];
        $year = date('Y');

        // Navigation for Header/Footer (Reused logic for consistency)
        $header_nav_html = '';
        foreach ($theme_data['navigation']['header'] as $link) {
            $header_nav_html .= '<!-- wp:navigation-link {"label":"' . $link['label'] . '","url":"' . $link['url'] . '","kind":"custom","isTopLevelLink":true} /-->';
        }
        $footer_nav_html = '';
        foreach ($theme_data['navigation']['footer'] as $link) {
            $footer_nav_html .= '<!-- wp:navigation-link {"label":"' . $link['label'] . '","url":"' . $link['url'] . '","kind":"custom","isTopLevelLink":true} /-->';
        }

        // Common Header (Naked)
        $header = <<<HTML
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|30","bottom":"var:preset|spacing|30","left":"var:preset|spacing|30","right":"var:preset|spacing|30"}}},"layout":{"type":"flex","justifyContent":"space-between"}} -->
<div class="wp-block-group alignfull" style="padding-top:var(--wp--preset--spacing--30);padding-right:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--30);padding-left:var(--wp--preset--spacing--30)">
    <!-- wp:group {"layout":{"type":"flex"}} -->
    <div class="wp-block-group">
        <!-- wp:site-logo /-->
    </div>
    <!-- /wp:group -->
    <!-- wp:navigation {"layout":{"type":"flex","orientation":"horizontal"}} -->
    <nav class="wp-block-navigation is-layout-flex wp-container-nav">
        $header_nav_html
    </nav>
    <!-- /wp:navigation -->
</div>
<!-- /wp:group -->
HTML;

        // Common Footer (Naked)
        $footer = <<<HTML
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50"}}},"backgroundColor":"contrast","textColor":"base","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-base-color has-contrast-background-color has-text-color has-background" style="padding-top:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--50)">
    <!-- wp:group {"align":"wide","layout":{"type":"flex","justifyContent":"center"}} -->
    <div class="wp-block-group alignwide">
        <!-- wp:paragraph {"fontSize":"small"} -->
        <p class="has-small-font-size">© $year $business_name</p>
        <!-- /wp:paragraph -->
        <!-- wp:navigation {"layout":{"type":"flex","orientation":"horizontal"}} -->
        <nav class="wp-block-navigation is-layout-flex wp-container-nav">
            $footer_nav_html
        </nav>
        <!-- /wp:navigation -->
    </div>
    <!-- /wp:group -->
</div>
<!-- /wp:group -->
HTML;

        // 1. INDEX.HTML (Safe Query Loop)
        $index_html = <<<HTML
$header

<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group">
    <!-- wp:query {"query":{"perPage":10,"pages":0,"offset":0,"postType":"post","order":"desc","orderBy":"date","author":"","search":"","exclude":[],"sticky":"","inherit":true}} -->
    <div class="wp-block-query">
        <!-- wp:post-template -->
            <!-- wp:post-title {"isLink":true} /-->
            <!-- wp:post-excerpt /-->
            <!-- wp:post-date /-->
        <!-- /wp:post-template -->
        <!-- wp:query-pagination -->
            <!-- wp:query-pagination-previous /-->
            <!-- wp:query-pagination-numbers /-->
            <!-- wp:query-pagination-next /-->
        <!-- /wp:query-pagination -->
    </div>
    <!-- /wp:query -->
</div>
<!-- /wp:group -->

$footer
HTML;
        file_put_contents($theme_dir . '/templates/index.html', $this->sanitize_block_html($index_html));

        // 2. 404.HTML
        $four_oh_four = <<<HTML
$header

<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group">
    <!-- wp:heading {"textAlign":"center","level":1} -->
    <h1 class="wp-block-heading has-text-align-center">Page Not Found</h1>
    <!-- /wp:heading -->
    <!-- wp:paragraph {"align":"center"} -->
    <p class="has-text-align-center">The page you are looking for does not exist.</p>
    <!-- /wp:paragraph -->
    <!-- wp:search {"label":"Search","showLabel":false,"buttonText":"Search"} /-->
</div>
<!-- /wp:group -->

$footer
HTML;
        file_put_contents($theme_dir . '/templates/404.html', $this->sanitize_block_html($four_oh_four));
    }
}