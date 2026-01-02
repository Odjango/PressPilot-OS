<?php
/**
 * Module: Export Handler
 * Purpose: Export generated site as ZIP file
 * Architecture: Modular - future: add more export formats
 */

if (!defined('ABSPATH')) {
    exit;
}

class PressPilot_Export_Handler {
    
    /**
     * Export generated site data
     * MVP: JSON export of site data
     * Future: Full WordPress ZIP export
     */
    public function export($site_data) {
        $export_data = array(
            'version' => PRESSPILOT_VERSION,
            'export_date' => current_time('mysql'),
            'site' => $site_data,
            'instructions' => $this->get_setup_instructions($site_data)
        );
        
        return $export_data;
    }
    
    /**
     * Get setup instructions for user
     */
    private function get_setup_instructions($site_data) {
        $theme = $site_data['theme'];
        
        return array(
            'step1' => array(
                'title' => 'Install & Activate Theme',
                'description' => 'Install "' . $theme['name'] . '" theme',
                'action' => 'Go to Appearance > Themes > Add New > Search for "' . $theme['slug'] . '"'
            ),
            'step2' => array(
                'title' => 'Review Your Pages',
                'description' => '5 pages have been created as drafts',
                'action' => 'Go to Pages in WordPress admin to review and publish'
            ),
            'step3' => array(
                'title' => 'Customize Colors',
                'description' => 'Colors extracted: ' . implode(', ', $site_data['colors']),
                'action' => 'Go to Appearance > Customize to apply your brand colors'
            ),
            'step4' => array(
                'title' => 'Add Your Content',
                'description' => 'Replace placeholder content with your actual information',
                'action' => 'Edit each page and add your real business details'
            ),
            'step5' => array(
                'title' => 'Publish Your Site',
                'description' => 'When ready, publish all pages',
                'action' => 'Click "Publish" on each page to make them live'
            )
        );
    }
    
    /**
     * Generate downloadable JSON file
     */
    public function generate_download_file($site_data) {
        $export_data = $this->export($site_data);
        $filename = 'presspilot-' . sanitize_title($site_data['business_name']) . '-' . time() . '.json';
        
        header('Content-Type: application/json');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        
        echo json_encode($export_data, JSON_PRETTY_PRINT);
        exit;
    }
}
