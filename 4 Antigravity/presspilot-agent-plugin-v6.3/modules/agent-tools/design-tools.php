<?php
/**
 * Atomic Tools: Design Management
 * Purpose: Handle colors, typography, patterns, and visual elements
 * Architecture: Hassan's Rule 1 - Single responsibility per tool
 */

if (!defined('ABSPATH')) {
    exit;
}

class PressPilot_Design_Tools {
    
    /**
     * Update site color palette
     * @param array $params {primary?, secondary?, accent?, dry_run?}
     * @return array PressPilot response pattern
     */
    public function colors_set($params) {
        try {
            $primary = sanitize_hex_color($params['primary'] ?? '');
            $secondary = sanitize_hex_color($params['secondary'] ?? '');
            $accent = sanitize_hex_color($params['accent'] ?? '');
            $dry_run = (bool) ($params['dry_run'] ?? false);
            
            // Validate at least one color is provided
            if (empty($primary) && empty($secondary) && empty($accent)) {
                throw new Exception('At least one color must be provided');
            }
            
            // Get current theme.json or create default structure
            $theme_json = $this->get_theme_json();
            $original_colors = $theme_json['settings']['color']['palette'] ?? array();
            
            // Update color palette
            $color_updates = array();
            if (!empty($primary)) {
                $theme_json = $this->update_color_in_palette($theme_json, 'primary', $primary);
                $color_updates['primary'] = $primary;
            }
            if (!empty($secondary)) {
                $theme_json = $this->update_color_in_palette($theme_json, 'secondary', $secondary);
                $color_updates['secondary'] = $secondary;
            }
            if (!empty($accent)) {
                $theme_json = $this->update_color_in_palette($theme_json, 'accent', $accent);
                $color_updates['accent'] = $accent;
            }
            
            // Generate preview
            $preview = $this->generate_color_preview($color_updates);
            
            // Execute if not dry run
            if (!$dry_run) {
                // Save theme.json changes
                $this->save_theme_json($theme_json);
                
                // Update customizer colors as fallback
                $this->update_customizer_colors($color_updates);
                
                // Generate CSS for immediate effect
                $this->generate_color_css($color_updates);
                
                // Create undo token
                $undo_token = $this->create_undo_token('colors_set', null, array(
                    'original_colors' => $original_colors,
                    'theme_json' => $this->get_theme_json() // Get the previous version
                ));
                
                return array(
                    'success' => true,
                    'data' => array(
                        'colors_updated' => $color_updates,
                        'css_generated' => true
                    ),
                    'preview' => "🎨 Site colors updated successfully! " . $this->format_color_changes($color_updates),
                    'undo_token' => $undo_token,
                    'visual_preview' => array(
                        'type' => 'colors',
                        'colors' => $color_updates
                    ),
                    'next_suggestions' => array(
                        'Apply a design pattern that matches these colors',
                        'Update typography to complement the new colors',
                        'Preview the site to see the changes',
                        'Adjust additional accent colors'
                    )
                );
            } else {
                return array(
                    'success' => true,
                    'data' => null,
                    'preview' => $preview,
                    'undo_token' => null,
                    'visual_preview' => array(
                        'type' => 'colors',
                        'colors' => $color_updates
                    ),
                    'next_suggestions' => array('Apply these colors', 'Try different colors', 'Cancel')
                );
            }
            
        } catch (Exception $e) {
            return array(
                'success' => false,
                'error' => $e->getMessage(),
                'suggestions' => array(
                    'Use valid hex color codes (e.g., #FF0000)',
                    'Try with different color values',
                    'Check theme compatibility'
                )
            );
        }
    }
    
    /**
     * Apply a design pattern to a specific area
     * @param array $params {area, pattern_id, dry_run?}
     * @return array PressPilot response pattern
     */
    public function pattern_apply($params) {
        try {
            $area = sanitize_text_field($params['area']);
            $pattern_id = sanitize_text_field($params['pattern_id']);
            $dry_run = (bool) ($params['dry_run'] ?? false);
            
            if (empty($area) || empty($pattern_id)) {
                throw new Exception('Both area and pattern_id are required');
            }
            
            // Get available patterns
            $available_patterns = $this->get_available_patterns();
            if (!isset($available_patterns[$pattern_id])) {
                throw new Exception("Pattern '{$pattern_id}' not found");
            }
            
            $pattern = $available_patterns[$pattern_id];
            
            // Validate area
            $valid_areas = array('hero', 'header', 'footer', 'sidebar', 'content', 'full-page');
            if (!in_array($area, $valid_areas)) {
                throw new Exception("Invalid area '{$area}'. Must be one of: " . implode(', ', $valid_areas));
            }
            
            // Generate preview
            $preview = $this->generate_pattern_preview($area, $pattern);
            
            // Execute if not dry run
            if (!$dry_run) {
                // Get current pattern for undo
                $current_pattern = $this->get_current_pattern($area);
                
                // Apply the pattern
                $this->apply_pattern_to_area($area, $pattern);
                
                // Create undo token
                $undo_token = $this->create_undo_token('pattern_apply', null, array(
                    'area' => $area,
                    'previous_pattern' => $current_pattern
                ));
                
                return array(
                    'success' => true,
                    'data' => array(
                        'area' => $area,
                        'pattern_applied' => $pattern_id,
                        'pattern_name' => $pattern['name']
                    ),
                    'preview' => "✨ Applied '{$pattern['name']}' pattern to {$area} area successfully!",
                    'undo_token' => $undo_token,
                    'visual_preview' => array(
                        'type' => 'layout',
                        'area' => $area,
                        'sections' => $pattern['sections'] ?? array()
                    ),
                    'next_suggestions' => array(
                        'Customize the pattern colors',
                        'Apply patterns to other areas',
                        'Preview the changes on the frontend',
                        'Add content to the new pattern'
                    )
                );
            } else {
                return array(
                    'success' => true,
                    'data' => null,
                    'preview' => $preview,
                    'undo_token' => null,
                    'visual_preview' => array(
                        'type' => 'layout',
                        'area' => $area,
                        'sections' => $pattern['sections'] ?? array()
                    ),
                    'next_suggestions' => array('Apply this pattern', 'Try a different pattern', 'Cancel')
                );
            }
            
        } catch (Exception $e) {
            return array(
                'success' => false,
                'error' => $e->getMessage(),
                'suggestions' => array(
                    'Check available patterns and areas',
                    'Try a different pattern or area',
                    'Ensure the theme supports pattern application'
                )
            );
        }
    }
    
    /**
     * Get current theme.json or create default structure 
     */
    private function get_theme_json() {
        // Try to get theme.json from active theme
        $theme_json_file = get_template_directory() . '/theme.json';
        
        if (file_exists($theme_json_file)) {
            $content = file_get_contents($theme_json_file);
            $theme_json = json_decode($content, true);
        }
        
        // If no theme.json exists, create a basic structure
        if (empty($theme_json)) {
            $theme_json = array(
                'version' => 2,
                'settings' => array(
                    'color' => array(
                        'palette' => array(
                            array('name' => 'Primary', 'slug' => 'primary', 'color' => '#007cba'),
                            array('name' => 'Secondary', 'slug' => 'secondary', 'color' => '#005a87'),
                            array('name' => 'Accent', 'slug' => 'accent', 'color' => '#ff6900'),
                            array('name' => 'Base', 'slug' => 'base', 'color' => '#ffffff'),
                            array('name' => 'Contrast', 'slug' => 'contrast', 'color' => '#000000')
                        )
                    )
                )
            );
        }
        
        return $theme_json;
    }
    
    /**
     * Update a specific color in the palette
     */
    private function update_color_in_palette($theme_json, $color_slug, $color_value) {
        $palette = &$theme_json['settings']['color']['palette'];
        
        // Find existing color or add new one
        $found = false;
        foreach ($palette as &$color) {
            if ($color['slug'] === $color_slug) {
                $color['color'] = $color_value;
                $found = true;
                break;
            }
        }
        
        // Add new color if not found
        if (!$found) {
            $palette[] = array(
                'name' => ucfirst($color_slug),
                'slug' => $color_slug,
                'color' => $color_value
            );
        }
        
        return $theme_json;
    }
    
    /**
     * Save theme.json changes
     */
    private function save_theme_json($theme_json) {
        // For now, store in customizer/options
        // In a full implementation, this would write to theme.json file
        update_option('presspilot_theme_json', $theme_json);
        
        // Also store in theme mods for immediate CSS generation
        $colors = array();
        if (isset($theme_json['settings']['color']['palette'])) {
            foreach ($theme_json['settings']['color']['palette'] as $color) {
                $colors[$color['slug']] = $color['color'];
            }
        }
        
        set_theme_mod('presspilot_colors', $colors);
    }
    
    /**
     * Update customizer colors as fallback
     */
    private function update_customizer_colors($color_updates) {
        foreach ($color_updates as $type => $color) {
            set_theme_mod($type . '_color', $color);
        }
    }
    
    /**
     * Generate CSS for immediate color effect
     */
    private function generate_color_css($color_updates) {
        $css = "/* PressPilot Agent Color Updates */\n";
        
        foreach ($color_updates as $type => $color) {
            $css .= ":root { --wp--preset--color--{$type}: {$color}; }\n";
            $css .= ".has-{$type}-color { color: {$color} !important; }\n";
            $css .= ".has-{$type}-background-color { background-color: {$color} !important; }\n";
        }
        
        // Store CSS for wp_head output
        update_option('presspilot_agent_custom_css', $css);
    }
    
    /**
     * Generate color preview
     */
    private function generate_color_preview($color_updates) {
        $preview = "🎨 **Color Update Preview**\n\n";
        $preview .= "The following colors will be updated:\n\n";
        
        foreach ($color_updates as $type => $color) {
            $preview .= "• **" . ucfirst($type) . ":** {$color}\n";
        }
        
        $preview .= "\nThese colors will be applied to:\n";
        $preview .= "• Theme color palette\n";
        $preview .= "• Block editor colors\n";
        $preview .= "• Frontend styling\n";
        $preview .= "• Customizer settings\n\n";
        
        $preview .= "Changes will take effect immediately across your site.";
        
        return $preview;
    }
    
    /**
     * Get available design patterns
     */
    private function get_available_patterns() {
        return array(
            'hero-minimal' => array(
                'name' => 'Minimal Hero',
                'description' => 'Clean hero section with centered text and CTA',
                'areas' => array('hero'),
                'sections' => array('Large heading', 'Subtitle text', 'Call-to-action button')
            ),
            'hero-split' => array(
                'name' => 'Split Hero',
                'description' => 'Hero with image on one side, content on the other',
                'areas' => array('hero'),
                'sections' => array('Split layout', 'Text content', 'Feature image', 'CTA button')
            ),
            'services-grid' => array(
                'name' => 'Services Grid',
                'description' => '3-column grid layout for services or features',
                'areas' => array('content'),
                'sections' => array('Grid header', '3-column layout', 'Icon + text blocks')
            ),
            'contact-form' => array(
                'name' => 'Contact Section',
                'description' => 'Contact form with company information',
                'areas' => array('content', 'footer'),
                'sections' => array('Contact heading', 'Form fields', 'Contact info')
            )
        );
    }
    
    /**
     * Generate pattern preview
     */
    private function generate_pattern_preview($area, $pattern) {
        $preview = "✨ **Pattern Application Preview**\n\n";
        $preview .= "• **Area:** " . ucfirst($area) . "\n";
        $preview .= "• **Pattern:** {$pattern['name']}\n";
        $preview .= "• **Description:** {$pattern['description']}\n\n";
        
        if (!empty($pattern['sections'])) {
            $preview .= "**Sections that will be added:**\n";
            foreach ($pattern['sections'] as $section) {
                $preview .= "• {$section}\n";
            }
        }
        
        $preview .= "\nThis pattern will replace the current {$area} layout.";
        
        return $preview;
    }
    
    /**
     * Get current pattern for an area (for undo functionality)
     */
    private function get_current_pattern($area) {
        // This would typically query the current blocks/template parts
        // For now, return a placeholder
        return array(
            'area' => $area,
            'content' => get_option("presspilot_pattern_{$area}", ''),
            'timestamp' => current_time('mysql')
        );
    }
    
    /**
     * Apply pattern to specific area
     */
    private function apply_pattern_to_area($area, $pattern) {
        // This would typically update template parts or create blocks
        // For now, store the pattern information
        update_option("presspilot_pattern_{$area}", array(
            'pattern_id' => $pattern['name'],
            'applied_at' => current_time('mysql'),
            'applied_by' => get_current_user_id()
        ));
    }
    
    /**
     * Format color changes for display
     */
    private function format_color_changes($color_updates) {
        $changes = array();
        foreach ($color_updates as $type => $color) {
            $changes[] = ucfirst($type) . ": {$color}";
        }
        return implode(', ', $changes);
    }
    
    /**
     * Inject custom CSS for specific fixes
     * @param array $params {css_rules, identifier, dry_run?}
     * @return array PressPilot response pattern
     */
    public function css_inject($params) {
        try {
            $css_rules = sanitize_textarea_field($params['css_rules']);
            $identifier = sanitize_key($params['identifier'] ?? 'custom');
            $dry_run = (bool) ($params['dry_run'] ?? false);
            
            if (empty($css_rules)) {
                throw new Exception('CSS rules are required');
            }
            
            // Validate CSS (basic check)
            if (strpos($css_rules, '<?') !== false || strpos($css_rules, '?>') !== false) {
                throw new Exception('Invalid characters in CSS');
            }
            
            // Generate preview
            $preview = $this->generate_css_preview($css_rules, $identifier);
            
            // Execute if not dry run
            if (!$dry_run) {
                // Get existing custom CSS
                $existing_css = get_option('presspilot_agent_custom_css', '');
                
                // Add new CSS with identifier
                $css_block = "\n\n/* PressPilot: {$identifier} */\n{$css_rules}\n/* End: {$identifier} */\n";
                $new_css = $existing_css . $css_block;
                
                // Store CSS
                update_option('presspilot_agent_custom_css', $new_css);
                
                // Create undo token
                $undo_token = $this->create_undo_token('css_inject', null, array(
                    'identifier' => $identifier,
                    'previous_css' => $existing_css
                ));
                
                return array(
                    'success' => true,
                    'data' => array(
                        'identifier' => $identifier,
                        'css_length' => strlen($css_rules)
                    ),
                    'preview' => "🎨 Custom CSS injected successfully! Identifier: {$identifier}\n\nThe CSS will be applied to the frontend immediately.",
                    'undo_token' => $undo_token,
                    'next_suggestions' => array(
                        'Preview the changes on the frontend',
                        'Add more custom CSS',
                        'Remove this CSS if it doesn\'t look right'
                    )
                );
            } else {
                return array(
                    'success' => true,
                    'data' => null,
                    'preview' => $preview,
                    'undo_token' => null,
                    'next_suggestions' => array('Apply this CSS', 'Modify the CSS', 'Cancel')
                );
            }
            
        } catch (Exception $e) {
            return array(
                'success' => false,
                'error' => $e->getMessage(),
                'suggestions' => array(
                    'Check CSS syntax is valid',
                    'Ensure no dangerous code is included',
                    'Try simpler CSS rules'
                )
            );
        }
    }
    
    /**
     * Fix common layout issues (hero full-width, logo display, etc.)
     * @param array $params {fixes, dry_run?}
     * @return array PressPilot response pattern
     */
    public function layout_fix($params) {
        try {
            $fixes = $params['fixes'] ?? array(); // array of fix identifiers
            $dry_run = (bool) ($params['dry_run'] ?? false);
            
            if (empty($fixes)) {
                throw new Exception('At least one fix must be specified');
            }
            
            $available_fixes = array(
                'hero_fullwidth' => ".wp-block-cover,\n.hero-section,\n.wp-block-group.alignfull {\n    margin-left: calc(-50vw + 50%);\n    margin-right: calc(-50vw + 50%);\n    max-width: 100vw;\n    width: 100vw;\n}",
                'logo_display' => ".site-logo,\n.custom-logo,\n.site-branding img {\n    display: block !important;\n    max-height: 60px;\n    width: auto;\n    opacity: 1 !important;\n    visibility: visible !important;\n}",
                'remove_page_title' => ".page-title,\n.entry-title.single-title {\n    display: none !important;\n}",
                'container_fullwidth' => ".alignfull {\n    margin-left: calc(-50vw + 50%) !important;\n    margin-right: calc(-50vw + 50%) !important;\n    max-width: 100vw !important;\n    width: 100vw !important;\n}"
            );
            
            // Validate fixes
            $valid_fixes = array();
            foreach ($fixes as $fix) {
                if (isset($available_fixes[$fix])) {
                    $valid_fixes[$fix] = $available_fixes[$fix];
                }
            }
            
            if (empty($valid_fixes)) {
                throw new Exception('No valid fixes specified. Available: ' . implode(', ', array_keys($available_fixes)));
            }
            
            // Combine CSS
            $combined_css = '';
            foreach ($valid_fixes as $fix_id => $css) {
                $combined_css .= "\n/* Fix: {$fix_id} */\n{$css}\n";
            }
            
            // Generate preview
            $preview = "🔧 **Layout Fixes Preview**\n\n";
            $preview .= "The following fixes will be applied:\n\n";
            foreach ($valid_fixes as $fix_id => $css) {
                $preview .= "• **" . str_replace('_', ' ', ucwords($fix_id, '_')) . "**\n";
            }
            
            // Execute if not dry run
            if (!$dry_run) {
                // Get existing custom CSS
                $existing_css = get_option('presspilot_agent_custom_css', '');
                
                // Add fixes
                $css_block = "\n\n/* PressPilot: Layout Fixes */\n{$combined_css}\n/* End: Layout Fixes */\n";
                $new_css = $existing_css . $css_block;
                
                // Store CSS
                update_option('presspilot_agent_custom_css', $new_css);
                
                // Create undo token
                $undo_token = $this->create_undo_token('layout_fix', null, array(
                    'fixes' => array_keys($valid_fixes),
                    'previous_css' => $existing_css
                ));
                
                return array(
                    'success' => true,
                    'data' => array(
                        'fixes_applied' => array_keys($valid_fixes)
                    ),
                    'preview' => "🔧 Applied " . count($valid_fixes) . " layout fixes successfully!\n\n" . implode(', ', array_map(function($f) { return str_replace('_', ' ', ucwords($f, '_')); }, array_keys($valid_fixes))),
                    'undo_token' => $undo_token,
                    'next_suggestions' => array(
                        'Preview the changes on the frontend',
                        'Apply additional fixes if needed',
                        'Adjust colors or styling'
                    )
                );
            } else {
                return array(
                    'success' => true,
                    'data' => null,
                    'preview' => $preview,
                    'undo_token' => null,
                    'next_suggestions' => array('Apply these fixes', 'Try different fixes', 'Cancel')
                );
            }
            
        } catch (Exception $e) {
            return array(
                'success' => false,
                'error' => $e->getMessage(),
                'suggestions' => array(
                    'Check available fixes: hero_fullwidth, logo_display, remove_page_title, container_fullwidth',
                    'Try one fix at a time',
                    'Preview the site first'
                )
            );
        }
    }
    
    /**
     * Generate CSS preview
     */
    private function generate_css_preview($css_rules, $identifier) {
        $preview = "🎨 **Custom CSS Preview**\n\n";
        $preview .= "• **Identifier:** {$identifier}\n";
        $preview .= "• **CSS Length:** " . strlen($css_rules) . " characters\n\n";
        $preview .= "**CSS Code:**\n```css\n" . substr($css_rules, 0, 200);
        
        if (strlen($css_rules) > 200) {
            $preview .= "...\n```\n\n(Showing first 200 characters)";
        } else {
            $preview .= "\n```";
        }
        
        $preview .= "\n\nThis CSS will be injected into the site's <head> section.";
        
        return $preview;
    }
    
    /**
     * Create undo token for reversible actions
     */
    private function create_undo_token($action, $item_id, $data) {
        $token = 'pp_undo_' . uniqid() . '_' . time();
        
        $undo_data = array(
            'action' => $action,
            'item_id' => $item_id,
            'data' => $data,
            'created_at' => current_time('mysql'),
            'user_id' => get_current_user_id()
        );
        
        set_transient('presspilot_undo_' . $token, $undo_data, 7 * DAY_IN_SECONDS);
        
        return $token;
    }
}

/**
 * Hook to output custom CSS in wp_head
 */
function presspilot_output_agent_css() {
    $css = get_option('presspilot_agent_custom_css', '');
    if (!empty($css)) {
        echo "<style type='text/css'>\n{$css}\n</style>\n";
    }
}
add_action('wp_head', 'presspilot_output_agent_css');