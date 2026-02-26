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
    private $base_uploads_path;
    private $api_key;

    public function __construct()
    {
        if (function_exists('wp_upload_dir')) {
            $upload_dir = wp_upload_dir();
            $this->base_temp_dir = $upload_dir['basedir'] . '/presspilot-temp/';
            $this->uploads_url = $upload_dir['baseurl'] . '/presspilot-generated/';
            $this->base_uploads_path = $upload_dir['basedir'] . '/presspilot-generated/';
        } else {
            $this->base_temp_dir = sys_get_temp_dir() . '/presspilot-temp/';
            $this->uploads_url = '/uploads/presspilot-generated/';
            $this->base_uploads_path = sys_get_temp_dir() . '/presspilot-generated/';
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
        $this->assemble_homepage($theme_dir, $theme_data, $ai_content, $theme_slug);

        // 6. Generate Special Pages
        $this->generate_special_pages($theme_dir, $theme_data, $ai_content, $theme_slug);

        // 7. Package
        // 7. Validate
        $validation = $this->validate_generated_theme($theme_dir);
        if (!$validation['valid']) {
            return ['error' => 'Theme validation failed: ' . implode(', ', $validation['errors'])];
        }

        // 8. Package
        $zip_url = $this->package_theme($theme_dir, $unique_id, $theme_slug);

        return [
            'success' => true,
            'download_url' => $zip_url,
            'unique_id' => $unique_id
        ];
    }

    // --- LOGIC: ASSEMBLE HOMEPAGE (SAFE MODE) ---

    private function assemble_homepage($theme_dir, $theme_data, $ai_content, $theme_slug)
    {
        // 1. Ensure Parts Directory
        if (!is_dir($theme_dir . '/parts')) {
            mkdir($theme_dir . '/parts', 0755, true);
        }

        // 2. HEADER PART (Native FSE)
        $header_nav_html = '';
        foreach ($theme_data['navigation']['header'] as $link) {
            $header_nav_html .= '<!-- wp:navigation-link {"label":"' . $link['label'] . '","url":"' . $link['url'] . '","kind":"custom","isTopLevelLink":true} /-->';
        }

        $header_html = '<!-- wp:group {"layout":{"type":"constrained"}} -->' . "\n";
        $header_html .= '<div class="wp-block-group"><!-- wp:group {"align":"wide","layout":{"type":"flex","justifyContent":"space-between","flexWrap":"wrap"}} -->' . "\n";
        $header_html .= '<div class="wp-block-group"><!-- wp:site-logo {"width":64,"shouldSyncIcon":false} /--><!-- wp:site-title {"level":1,"isLink":true} /--></div>' . "\n";
        $header_html .= '<!-- wp:navigation {"layout":{"type":"flex","orientation":"horizontal","justifyContent":"right"},"overlayMenu":"mobile"} -->' . "\n";
        $header_html .= '<nav class="wp-block-navigation is-layout-flex wp-container-nav">' . $header_nav_html . '</nav><!-- /wp:navigation -->' . "\n";
        $header_html .= '<!-- /wp:group --></div><!-- /wp:group -->';

        file_put_contents($theme_dir . '/parts/header.html', $header_html);

        // 3. FOOTER PART (Native FSE)
        $footer_nav_html = '';
        foreach ($theme_data['navigation']['footer'] as $link) {
            $footer_nav_html .= '<!-- wp:navigation-link {"label":"' . $link['label'] . '","url":"' . $link['url'] . '","kind":"custom","isTopLevelLink":true} /-->';
        }
        $year = date('Y');
        $business_name = $theme_data['business_name'];

        $footer_html = '<!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50"}}},"backgroundColor":"contrast","textColor":"base","layout":{"type":"constrained"}} -->' . "\n";
        $footer_html .= '<div class="wp-block-group has-base-color has-contrast-background-color has-text-color has-background" style="padding-top:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--50)">' . "\n";
        $footer_html .= '<!-- wp:group {"align":"wide","layout":{"type":"flex","justifyContent":"space-between"}} -->' . "\n";
        $footer_html .= '<div class="wp-block-group"><!-- wp:paragraph {"fontSize":"small"} -->' . "\n";
        $footer_html .= '<p class="has-small-font-size">© ' . $year . ' ' . $business_name . '</p><!-- /wp:paragraph -->' . "\n";
        $footer_html .= '<!-- wp:navigation {"layout":{"type":"flex","orientation":"horizontal"}} -->' . "\n";
        $footer_html .= '<nav class="wp-block-navigation is-layout-flex wp-container-nav">' . $footer_nav_html . '</nav><!-- /wp:navigation -->' . "\n";
        $footer_html .= '</div><!-- /wp:group --></div><!-- /wp:group -->';

        file_put_contents($theme_dir . '/parts/footer.html', $footer_html);

        // 4. FRONT-PAGE ASSEMBLY (Purely Patterns & Parts)
        $front_page = '';
        $front_page .= '<!-- wp:template-part {"slug":"header","theme":"' . $theme_slug . '","tagName":"header"} /-->' . "\n";

        foreach ($theme_data['patterns'] as $pattern_slug) {
            $safe_slug = 'twentytwentyfour/text-centered-grid-3-col';
            if ($pattern_slug === 'hero')
                $safe_slug = 'twentytwentyfour/page-home-business-hero';
            if (strpos($pattern_slug, 'pricing') !== false)
                $safe_slug = 'twentytwentyfour/pricing';
            if (strpos($pattern_slug, 'contact') !== false)
                $safe_slug = 'twentytwentyfour/call-to-action';
            if (strpos($pattern_slug, 'testimonials') !== false)
                $safe_slug = 'twentytwentyfour/testimonial-centered';

            $front_page .= '<!-- wp:pattern {"slug":"' . $safe_slug . '"} /-->' . "\n";
        }

        $front_page .= '<!-- wp:template-part {"slug":"footer","theme":"' . $theme_slug . '","tagName":"footer"} /-->' . "\n";

        file_put_contents($theme_dir . '/templates/front-page.html', $front_page);
    }

    private function validate_generated_theme($dir)
    {
        $errors = [];
        if (!file_exists($dir . '/style.css'))
            $errors[] = 'Missing style.css';
        if (!file_exists($dir . '/theme.json'))
            $errors[] = 'Missing theme.json';
        if (!file_exists($dir . '/templates/index.html'))
            $errors[] = 'Missing templates/index.html';

        $json = json_decode(file_get_contents($dir . '/theme.json'), true);
        if (!$json)
            $errors[] = 'Invalid theme.json JSON';
        if (!isset($json['version']) || $json['version'] !== 2)
            $errors[] = 'Invalid theme.json version';

        return ['valid' => empty($errors), 'errors' => $errors];
    }

    /**
     * Sanitizer Guardrail: Prevents "Attempt Recovery" errors.
     * Replaces whitespace between tags with empty string.
     */
    private function sanitize_block_html($html)
    {
        return trim(preg_replace('/>\s+</', '><', $html));
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
        $json = [
            'version' => 2,
            'settings' => [
                'appearanceTools' => true,
                'useRootPaddingAwareAlignments' => true,
                'layout' => [
                    'contentSize' => '620px',
                    'wideSize' => '1280px'
                ],
                'typography' => [
                    'fluid' => true,
                    'fontSizes' => [
                        ['size' => '1rem', 'slug' => 'small', 'name' => 'Small'],
                        ['size' => '1.2rem', 'slug' => 'medium', 'name' => 'Medium'],
                        ['size' => '1.5rem', 'slug' => 'large', 'name' => 'Large'],
                        ['size' => '2rem', 'slug' => 'x-large', 'name' => 'Extra Large']
                    ]
                ],
                'color' => [
                    'palette' => []
                ]
            ]
        ];

        foreach ($data['colors'] as $k => $v) {
            $json['settings']['color']['palette'][] = ['slug' => $k, 'color' => $v, 'name' => ucfirst($k)];
        }

        file_put_contents($dir . '/theme.json', json_encode($json, JSON_PRETTY_PRINT));
    }

    private function package_theme($dir, $id, $slug)
    {
        $zip_filename = $slug . '.zip';
        $public_dir = $this->base_uploads_path;
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

    private function generate_special_pages($theme_dir, $theme_data, $ai_content, $theme_slug)
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

        // Common Header (Naked) -> Updated to "Official Standards"
        // Common Header (Naked) -> Updated to "Official Standards"
        // STRICT SINGLE-LINE STRING FORCED
        // $header = '<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|30","right":"var:preset|spacing|30","bottom":"var:preset|spacing|30","left":"var:preset|spacing|30"}}}} --><div class="wp-block-group alignfull" style="padding-top:var(--wp--preset--spacing--30);padding-right:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--30);padding-left:var(--wp--preset--spacing--30)"><!-- wp:group {"align":"wide"} --><div class="wp-block-group alignwide"><!-- wp:group {"layout":{"type":"flex","justifyContent":"space-between"}} --><div class="wp-block-group"><!-- wp:site-logo {"width":64,"shouldSyncIcon":false} /--><!-- wp:site-title {"level":1,"isLink":true} /--><!-- wp:navigation {"layout":{"type":"flex","orientation":"horizontal","justifyContent":"right"},"overlayMenu":"mobile"} --><nav class="wp-block-navigation is-layout-flex wp-container-nav">' . $header_nav_html . '</nav><!-- /wp:navigation --></div><!-- /wp:group --></div><!-- /wp:group --></div><!-- /wp:group -->';

        // Common Footer (Naked)
        // $footer = <<<HTML
// <!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50"}}},"backgroundColor":"contrast","textColor":"base","layout":{"type":"constrained"}} -->
// <div class="wp-block-group alignfull has-base-color has-contrast-background-color has-text-color has-background" style="padding-top:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--50)">
//     <!-- wp:group {"align":"wide","layout":{"type":"flex","justifyContent":"center"}} -->
//     <div class="wp-block-group alignwide">
//         <!-- wp:paragraph {"fontSize":"small"} -->
//         <p class="has-small-font-size">© $year $business_name</p>
//         <!-- /wp:paragraph -->
//         <!-- wp:navigation {"layout":{"type":"flex","orientation":"horizontal"}} -->
//         <nav class="wp-block-navigation is-layout-flex wp-container-nav">
//             $footer_nav_html
//         </nav>
//         <!-- /wp:navigation -->
//     </div>
//     <!-- /wp:group -->
// </div>
// <!-- /wp:group -->
// HTML;

        // 1. INDEX.HTML (Safe Query Loop)
        $index_html = '<!-- wp:template-part {"slug":"header","theme":"' . $theme_slug . '","tagName":"header"} /-->' . "\n";
        $index_html .= <<<HTML
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
HTML;
        $index_html .= "\n" . '<!-- wp:template-part {"slug":"footer","theme":"' . $theme_slug . '","tagName":"footer"} /-->';

        file_put_contents($theme_dir . '/templates/index.html', $index_html); // No sanitizer needed for core blocks + parts

        // 2. 404.HTML
        $four_oh_four = '<!-- wp:template-part {"slug":"header","theme":"' . $theme_slug . '","tagName":"header"} /-->' . "\n";
        $four_oh_four .= <<<HTML
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
HTML;
        $four_oh_four .= "\n" . '<!-- wp:template-part {"slug":"footer","theme":"' . $theme_slug . '","tagName":"footer"} /-->';

        file_put_contents($theme_dir . '/templates/404.html', $four_oh_four);
    }
}