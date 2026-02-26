<?php
/**
 * Module: Site Tools
 * Purpose: High-level orchestration for complete site generation
 * Architecture: "The Macro" - Connects all atomic modules into a single pipeline
 */

if (!defined('ABSPATH')) {
    exit;
}

class PressPilot_Site_Tools
{

    /**
     * Generate complete site from a single request
     * 
     * Pipeline:
     * 1. Extract Colors (from Logo)
     * 2. Match Theme (from Business Type)
     * 3. Generate Content (AI)
     * 4. Assemble Site (Patterns)
     */
    public function generate_complete($params)
    {
        // 1. Validate Inputs
        $business_name = sanitize_text_field($params['business_name']);
        $business_type = sanitize_text_field($params['business_type']);
        $business_description = sanitize_textarea_field($params['business_description']);
        $logo_url = esc_url_raw($params['logo_url']);
        $language = sanitize_text_field($params['language'] ?? 'en');
        $tagline = sanitize_text_field($params['tagline'] ?? '');

        if (empty($business_name) || empty($business_type)) {
            throw new Exception('Business Name and Type are required.');
        }

        // 2. Extract Colors
        $colors = $this->run_color_extraction($logo_url);

        // 3. Match Theme
        $theme = $this->run_theme_matching($business_type, $colors);

        // 4. Generate Content (The "Brain")
        $content = $this->run_content_generation(
            $business_name,
            $tagline,
            $business_description,
            $language,
            $business_type,
            $colors
        );

        // 5. Assemble Site (The "Body")
        $site_data = $this->run_site_assembly(
            $business_name,
            $theme,
            $content,
            $colors,
            $business_type,
            $logo_url,
            $tagline
        );

        return $site_data;
    }

    /**
     * Step 1: Color Extraction
     */
    private function run_color_extraction($logo_url)
    {
        if (!class_exists('PressPilot_Color_Extractor')) {
            $this->load_module('color-extractor.php');
        }

        $extractor = new PressPilot_Color_Extractor();
        if (!empty($logo_url)) {
            return $extractor->extract($logo_url);
        }

        // Default colors if no logo
        return [
            'primary' => '#0073aa',
            'secondary' => '#111111',
            'accent' => '#00a0d2',
            'neutral' => '#ffffff',
            'dark' => '#333333'
        ];
    }

    /**
     * Step 2: Theme Matching
     */
    private function run_theme_matching($business_type, $colors)
    {
        if (!class_exists('PressPilot_Theme_Matcher')) {
            $this->load_module('theme-matcher.php');
        }

        $matcher = new PressPilot_Theme_Matcher();
        return $matcher->match($business_type, $colors);
    }

    /**
     * Step 3: Content Generation
     */
    private function run_content_generation($name, $tagline, $desc, $lang, $type, $colors)
    {
        if (!class_exists('PressPilot_Content_Generator')) {
            $this->load_module('content-generator.php');
        }

        $generator = new PressPilot_Content_Generator();
        return $generator->generate($name, $tagline, $desc, $lang, $type, $colors);
    }

    /**
     * Step 4: Site Assembly
     */
    private function run_site_assembly($name, $theme, $content, $colors, $type, $logo, $tagline)
    {
        if (!class_exists('PressPilot_Site_Assembler')) {
            $this->load_module('site-assembler.php');
        }

        $assembler = new PressPilot_Site_Assembler();
        return $assembler->assemble($name, $theme, $content, $colors, $type, $logo, $tagline);
    }

    /**
     * Helper to load modules from sibling directory
     */
    private function load_module($filename)
    {
        $path = PRESSPILOT_PLUGIN_DIR . 'modules/' . $filename;
        if (file_exists($path)) {
            require_once $path;
        } else {
            throw new Exception("Required module not found: $filename");
        }
    }
}
