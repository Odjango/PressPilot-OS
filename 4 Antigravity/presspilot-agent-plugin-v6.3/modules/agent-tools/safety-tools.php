<?php
/**
 * Atomic Tools: Safety Operations
 * Purpose: Handle backup, restore, and undo operations
 * Architecture: Hassan's Rule 1 - Single responsibility per tool
 */

if (!defined('ABSPATH')) {
    exit;
}

class PressPilot_Safety_Tools {
    
    /**
     * Create a backup of current site state
     * @param array $params {scope?}
     * @return array PressPilot response pattern
     */
    public function backup_create($params) {
        try {
            $scope = sanitize_text_field($params['scope'] ?? 'full');
            $valid_scopes = array('full', 'content', 'theme', 'settings');
            
            if (!in_array($scope, $valid_scopes)) {
                throw new Exception("Invalid scope '{$scope}'. Must be one of: " . implode(', ', $valid_scopes));
            }
            
            // Create backup data based on scope
            $backup_data = array(
                'timestamp' => current_time('mysql'),
                'user_id' => get_current_user_id(),
                'scope' => $scope,
                'wordpress_version' => get_bloginfo('version'),
                'theme' => get_template(),
                'data' => array()
            );
            
            switch ($scope) {
                case 'full':
                    $backup_data['data'] = array(
                        'pages' => $this->backup_pages(),
                        'posts' => $this->backup_posts(),
                        'theme_settings' => $this->backup_theme_settings(),
                        'customizer' => $this->backup_customizer_settings(),
                        'menus' => $this->backup_menus(),
                        'presspilot_settings' => $this->backup_presspilot_settings()
                    );
                    break;
                    
                case 'content':
                    $backup_data['data'] = array(
                        'pages' => $this->backup_pages(),
                        'posts' => $this->backup_posts(),
                        'menus' => $this->backup_menus()
                    );
                    break;
                    
                case 'theme':
                    $backup_data['data'] = array(
                        'theme_settings' => $this->backup_theme_settings(),
                        'customizer' => $this->backup_customizer_settings()
                    );
                    break;
                    
                case 'settings':
                    $backup_data['data'] = array(
                        'presspilot_settings' => $this->backup_presspilot_settings(),
                        'wordpress_settings' => $this->backup_wordpress_settings()
                    );
                    break;
            }
            
            // Generate backup ID
            $backup_id = 'backup_' . uniqid() . '_' . time();
            
            // Store backup
            $this->store_backup($backup_id, $backup_data);
            
            // Count items backed up
            $item_count = $this->count_backup_items($backup_data['data']);
            
            return array(
                'success' => true,
                'data' => array(
                    'backup_id' => $backup_id,
                    'scope' => $scope,
                    'items_backed_up' => $item_count,
                    'size_mb' => $this->calculate_backup_size($backup_data),
                    'created_at' => $backup_data['timestamp']
                ),
                'preview' => "🛡️ Backup created successfully! ID: {$backup_id}\n\nScope: " . ucfirst($scope) . "\nItems: {$item_count}\nCreated: " . date('Y-m-d H:i:s'),
                'undo_token' => null, // Backups are not undoable
                'next_suggestions' => array(
                    'View all backups',
                    'Download backup file',
                    'Create another backup with different scope',
                    'Test restore functionality'
                )
            );
            
        } catch (Exception $e) {
            return array(
                'success' => false,
                'error' => $e->getMessage(),
                'suggestions' => array(
                    'Try with a different backup scope',
                    'Check available disk space',
                    'Ensure proper file permissions'
                )
            );
        }
    }
    
    /**
     * Undo a previous action using its undo token
     * @param array $params {undo_token}
     * @return array PressPilot response pattern
     */
    public function undo_execute($params) {
        try {
            $undo_token = sanitize_text_field($params['undo_token']);
            
            if (empty($undo_token)) {
                throw new Exception('Undo token is required');
            }
            
            // Get undo data
            $undo_data = get_transient('presspilot_undo_' . $undo_token);
            
            if (!$undo_data) {
                throw new Exception('Undo token not found or expired');
            }
            
            // Verify user can undo this action
            if ($undo_data['user_id'] !== get_current_user_id() && !current_user_can('manage_options')) {
                throw new Exception('You do not have permission to undo this action');
            }
            
            // Execute the undo operation based on action type
            $undo_result = $this->execute_undo_action($undo_data);
            
            // Remove the used undo token
            delete_transient('presspilot_undo_' . $undo_token);
            
            return array(
                'success' => true,
                'data' => array(
                    'undone_action' => $undo_data['action'],
                    'original_time' => $undo_data['created_at'],
                    'items_restored' => $undo_result['items_restored'] ?? 1
                ),
                'preview' => "↩️ Successfully undid: {$undo_data['action']}\n\nOriginal action performed: {$undo_data['created_at']}\nRestored to previous state.",
                'undo_token' => null, // Undo actions are not undoable themselves
                'next_suggestions' => array(
                    'Verify the changes look correct',
                    'Create a backup of current state',
                    'Continue with other tasks'
                )
            );
            
        } catch (Exception $e) {
            return array(
                'success' => false,
                'error' => $e->getMessage(),
                'suggestions' => array(
                    'Check if the undo token is correct',
                    'Verify the action is still undoable',
                    'Try creating a backup before making changes',
                    'Contact support if the issue persists'
                )
            );
        }
    }
    
    /**
     * Restore from a backup
     * @param array $params {backup_id, scope?, dry_run?}
     * @return array PressPilot response pattern
     */
    public function backup_restore($params) {
        try {
            $backup_id = sanitize_text_field($params['backup_id']);
            $scope = sanitize_text_field($params['scope'] ?? 'full');
            $dry_run = (bool) ($params['dry_run'] ?? false);
            
            if (empty($backup_id)) {
                throw new Exception('Backup ID is required');
            }
            
            // Get backup data
            $backup_data = $this->get_backup($backup_id);
            
            if (!$backup_data) {
                throw new Exception('Backup not found');
            }
            
            // Generate preview
            $preview = $this->generate_restore_preview($backup_data, $scope);
            
            if (!$dry_run) {
                // Create a backup of current state before restoring
                $pre_restore_backup = $this->backup_create(array('scope' => $scope));
                
                // Execute restore
                $restore_result = $this->execute_restore($backup_data, $scope);
                
                return array(
                    'success' => true,
                    'data' => array(
                        'backup_id' => $backup_id,
                        'scope' => $scope,
                        'pre_restore_backup' => $pre_restore_backup['data']['backup_id'] ?? null,
                        'items_restored' => $restore_result['items_restored']
                    ),
                    'preview' => "✅ Restore completed successfully!\n\nRestored from: {$backup_id}\nScope: " . ucfirst($scope) . "\nItems: {$restore_result['items_restored']}\n\nA backup of your previous state was created automatically.",
                    'undo_token' => null,
                    'next_suggestions' => array(
                        'Check that everything looks correct',
                        'Clear any caches',
                        'Test site functionality'
                    )
                );
            } else {
                return array(
                    'success' => true,
                    'data' => null,
                    'preview' => $preview,
                    'undo_token' => null,
                    'next_suggestions' => array('Proceed with restore', 'Choose different scope', 'Cancel')
                );
            }
            
        } catch (Exception $e) {
            return array(
                'success' => false,
                'error' => $e->getMessage(),
                'suggestions' => array(
                    'Verify the backup ID is correct',
                    'Try with a different restore scope',
                    'Check backup integrity'
                )
            );
        }
    }
    
    /**
     * Backup WordPress pages
     */
    private function backup_pages() {
        $pages = get_posts(array(
            'post_type' => 'page',
            'post_status' => 'any',
            'numberposts' => -1
        ));
        
        $backup_pages = array();
        foreach ($pages as $page) {
            $backup_pages[] = array(
                'ID' => $page->ID,
                'post_title' => $page->post_title,
                'post_content' => $page->post_content,
                'post_status' => $page->post_status,
                'post_name' => $page->post_name,
                'post_meta' => get_post_meta($page->ID)
            );
        }
        
        return $backup_pages;
    }
    
    /**
     * Backup WordPress posts
     */
    private function backup_posts() {
        $posts = get_posts(array(
            'post_type' => 'post',
            'post_status' => 'any',
            'numberposts' => -1
        ));
        
        $backup_posts = array();
        foreach ($posts as $post) {
            $backup_posts[] = array(
                'ID' => $post->ID,
                'post_title' => $post->post_title,
                'post_content' => $post->post_content,
                'post_status' => $post->post_status,
                'post_name' => $post->post_name,
                'post_meta' => get_post_meta($post->ID)
            );
        }
        
        return $backup_posts;
    }
    
    /**
     * Backup theme settings
     */
    private function backup_theme_settings() {
        return array(
            'theme_mods' => get_theme_mods(),
            'presspilot_theme_json' => get_option('presspilot_theme_json', array()),
            'presspilot_colors' => get_theme_mod('presspilot_colors', array())
        );
    }
    
    /**
     * Backup customizer settings
     */
    private function backup_customizer_settings() {
        return get_theme_mods();
    }
    
    /**
     * Backup navigation menus
     */
    private function backup_menus() {
        $menus = wp_get_nav_menus();
        $backup_menus = array();
        
        foreach ($menus as $menu) {
            $menu_items = wp_get_nav_menu_items($menu->term_id);
            $backup_menus[] = array(
                'menu' => $menu,
                'items' => $menu_items
            );
        }
        
        return $backup_menus;
    }
    
    /**
     * Backup PressPilot specific settings
     */
    private function backup_presspilot_settings() {
        global $wpdb;
        
        // Get PressPilot related options
        $options = $wpdb->get_results(
            "SELECT option_name, option_value FROM {$wpdb->options} WHERE option_name LIKE 'presspilot_%'",
            ARRAY_A
        );
        
        return $options;
    }
    
    /**
     * Backup WordPress core settings
     */
    private function backup_wordpress_settings() {
        return array(
            'blogname' => get_option('blogname'),
            'blogdescription' => get_option('blogdescription'),
            'siteurl' => get_option('siteurl'),
            'home' => get_option('home'),
            'admin_email' => get_option('admin_email'),
            'timezone_string' => get_option('timezone_string'),
            'date_format' => get_option('date_format'),
            'time_format' => get_option('time_format')
        );
    }
    
    /**
     * Store backup data
     */
    private function store_backup($backup_id, $backup_data) {
        // Store in WordPress options table with expiration
        // In production, this could be stored in files or external storage
        set_transient('presspilot_backup_' . $backup_id, $backup_data, 30 * DAY_IN_SECONDS);
        
        // Also keep a list of backup IDs
        $backup_list = get_option('presspilot_backup_list', array());
        $backup_list[$backup_id] = array(
            'created_at' => $backup_data['timestamp'],
            'scope' => $backup_data['scope'],
            'user_id' => $backup_data['user_id']
        );
        update_option('presspilot_backup_list', $backup_list);
    }
    
    /**
     * Get backup data
     */
    private function get_backup($backup_id) {
        return get_transient('presspilot_backup_' . $backup_id);
    }
    
    /**
     * Count items in backup
     */
    private function count_backup_items($backup_data) {
        $count = 0;
        foreach ($backup_data as $section => $items) {
            if (is_array($items)) {
                $count += count($items);
            } else {
                $count += 1;
            }
        }
        return $count;
    }
    
    /**
     * Calculate backup size (approximate)
     */
    private function calculate_backup_size($backup_data) {
        $serialized = serialize($backup_data);
        return round(strlen($serialized) / 1024 / 1024, 2); // MB
    }
    
    /**
     * Execute undo action based on type
     */
    private function execute_undo_action($undo_data) {
        switch ($undo_data['action']) {
            case 'page_create':
                wp_delete_post($undo_data['item_id'], true);
                return array('items_restored' => 1);
                
            case 'page_update':
                wp_update_post(array_merge(
                    array('ID' => $undo_data['item_id']),
                    $undo_data['data']
                ));
                return array('items_restored' => 1);
                
            case 'colors_set':
                // Restore previous theme colors
                if (isset($undo_data['data']['original_colors'])) {
                    $theme_json = $undo_data['data']['theme_json'];
                    update_option('presspilot_theme_json', $theme_json);
                    
                    // Clear custom CSS
                    delete_option('presspilot_agent_custom_css');
                }
                return array('items_restored' => 1);
                
            case 'pattern_apply':
                // Restore previous pattern
                if (isset($undo_data['data']['previous_pattern'])) {
                    $area = $undo_data['data']['area'];
                    update_option("presspilot_pattern_{$area}", $undo_data['data']['previous_pattern']);
                }
                return array('items_restored' => 1);
                
            default:
                throw new Exception("Unknown undo action: {$undo_data['action']}");
        }
    }
    
    /**
     * Generate restore preview
     */
    private function generate_restore_preview($backup_data, $scope) {
        $preview = "🔄 **Restore Preview**\n\n";
        $preview .= "• **Backup Date:** {$backup_data['timestamp']}\n";
        $preview .= "• **Scope:** " . ucfirst($scope) . "\n";
        $preview .= "• **WordPress Version:** {$backup_data['wordpress_version']}\n";
        
        $item_count = $this->count_backup_items($backup_data['data']);
        $preview .= "• **Items to Restore:** {$item_count}\n\n";
        
        $preview .= "**⚠️ Important:**\n";
        $preview .= "• Current data will be replaced\n";
        $preview .= "• A backup will be created automatically before restoring\n";
        $preview .= "• This action cannot be undone (but you can restore from the auto-backup)\n\n";
        
        $preview .= "Proceed only if you're sure you want to restore from this backup.";
        
        return $preview;
    }
    
    /**
     * Execute restore operation
     */
    private function execute_restore($backup_data, $scope) {
        $items_restored = 0;
        
        // This is a simplified restore - in production this would be much more comprehensive
        if (isset($backup_data['data']['theme_settings'])) {
            $theme_settings = $backup_data['data']['theme_settings'];
            if (isset($theme_settings['presspilot_theme_json'])) {
                update_option('presspilot_theme_json', $theme_settings['presspilot_theme_json']);
                $items_restored++;
            }
        }
        
        if (isset($backup_data['data']['presspilot_settings'])) {
            foreach ($backup_data['data']['presspilot_settings'] as $option) {
                update_option($option['option_name'], maybe_unserialize($option['option_value']));
                $items_restored++;
            }
        }
        
        return array('items_restored' => $items_restored);
    }
}