<?php
/**
 * Module: Theme Matcher
 * Purpose: Select best WordPress theme based on business type
 * Architecture: Modular - MVP uses curated list, can upgrade to WordPress.org API
 */

if (!defined('ABSPATH')) {
    exit;
}

class PressPilot_Theme_Matcher {
    
    /**
     * Match theme to business type
     * MVP: Curated list of proven themes
     * Future: WordPress.org API integration for 6000+ themes
     */
    public function match($business_type, $colors) {
        $themes = $this->get_curated_themes();
        
        if (isset($themes[$business_type])) {
            $matched_theme = $themes[$business_type];
        } else {
            // Fallback to versatile theme
            $matched_theme = $themes['corporate'];
        }
        
        return array(
            'slug' => $matched_theme['slug'],
            'name' => $matched_theme['name'],
            'description' => $matched_theme['description'],
            'preview_url' => $matched_theme['preview_url'],
            'download_url' => $matched_theme['download_url'],
            'why_selected' => $matched_theme['why']
        );
    }
    
    /**
     * Curated list of high-quality WordPress.org themes
     * Tested and proven for each business type
     */
    private function get_curated_themes() {
        return array(
            'restaurant' => array(
                'slug' => 'astra',
                'name' => 'Astra',
                'description' => 'Fast, customizable theme perfect for restaurants with beautiful menus and galleries',
                'preview_url' => 'https://wpastra.com/demos/',
                'download_url' => 'https://downloads.wordpress.org/theme/astra.latest-stable.zip',
                'why' => 'Optimized for food photography, fast loading, mobile-friendly menus'
            ),
            
            'fitness' => array(
                'slug' => 'neve',
                'name' => 'Neve',
                'description' => 'Modern, energetic theme ideal for gyms and fitness businesses',
                'preview_url' => 'https://demosites.io/personal-trainer/',
                'download_url' => 'https://downloads.wordpress.org/theme/neve.latest-stable.zip',
                'why' => 'Dynamic layouts, class schedules, trainer profiles, mobile-first design'
            ),
            
            'corporate' => array(
                'slug' => 'kadence',
                'name' => 'Kadence',
                'description' => 'Professional, trustworthy theme for business and corporate sites',
                'preview_url' => 'https://www.kadencewp.com/kadence-demos/',
                'download_url' => 'https://downloads.wordpress.org/theme/kadence.latest-stable.zip',
                'why' => 'Professional appearance, service showcases, team pages, contact forms'
            ),
            
            'ecommerce' => array(
                'slug' => 'blocksy',
                'name' => 'Blocksy',
                'description' => 'Conversion-focused theme built for online stores and e-commerce',
                'preview_url' => 'https://creativethemes.com/blocksy/demos/',
                'download_url' => 'https://downloads.wordpress.org/theme/blocksy.latest-stable.zip',
                'why' => 'WooCommerce ready, product showcases, optimized checkout, fast performance'
            )
        );
    }
    
    /**
     * Get theme installation instructions
     */
    public function get_install_instructions($theme_slug) {
        return array(
            'automatic' => array(
                'step1' => 'Go to Appearance > Themes in WordPress',
                'step2' => 'Click "Add New"',
                'step3' => 'Search for "' . $theme_slug . '"',
                'step4' => 'Click "Install" then "Activate"'
            ),
            'manual' => array(
                'step1' => 'Download theme ZIP file',
                'step2' => 'Go to Appearance > Themes > Add New',
                'step3' => 'Click "Upload Theme"',
                'step4' => 'Select ZIP file and install'
            )
        );
    }
    
    /**
     * Check if theme is already installed
     */
    public function is_theme_installed($theme_slug) {
        $theme = wp_get_theme($theme_slug);
        return $theme->exists();
    }
    
    /**
     * Check if theme is active
     */
    public function is_theme_active($theme_slug) {
        return (get_stylesheet() === $theme_slug);
    }
    
    /**
     * Get theme compatibility info
     */
    public function get_compatibility_info($theme_slug) {
        return array(
            'min_php' => '7.4',
            'min_wp' => '5.8',
            'tested_wp' => '6.4',
            'gutenberg_ready' => true,
            'woocommerce_ready' => in_array($theme_slug, array('astra', 'blocksy', 'neve'))
        );
    }
}
