<?php
/**
 * Plugin Name: PressPilot - AI WordPress Site Generator
 * Plugin URI: https://presspilotapp.com
 * Description: Generate complete 5-page WordPress websites in 90 seconds using AI. Upload logo + business info = instant professional site.
 * Version: 6.3.0
 * Author: Mort (PP Theme Builder)
 * Author URI: https://inventithere.com
 * License: GPL v2 or later
 * Text Domain: presspilot
 * 
 * Architecture: Modular (Hasan's 3 AI Coding Tricks Applied)
 * - Modularization: Each feature is independent module
 * - Patterns: Business type templates for consistent results
 * - Documentation Injection: API docs embedded for AI integration
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('PRESSPILOT_VERSION', '6.3.0');
define('PRESSPILOT_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('PRESSPILOT_PLUGIN_URL', plugin_dir_url(__FILE__));
define('PRESSPILOT_ASSETS_URL', PRESSPILOT_PLUGIN_URL . 'assets/');

// OpenAI API Key - NOW STORED SECURELY IN DATABASE
// Use presspilot_get_api_key() function to retrieve
// Set via WordPress Admin → PressPilot → Settings

/**
 * Core PressPilot Class - Modular Architecture
 */
class PressPilot {
    
    private static $instance = null;
    
    /**
     * Singleton instance
     */
    public static function get_instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Constructor - Load modules
     */
    private function __construct() {
        $this->load_modules();
        $this->init_hooks();
        
        // Initialize AI Agent Bridge
        $this->init_agent_bridge();
        
        // Activation hook
        register_activation_hook(__FILE__, array($this, 'activate'));
    }
    
    /**
     * Load all modular components
     * Following Hasan's Modularization principle
     */
    private function load_modules() {
        // Original generator modules
        require_once PRESSPILOT_PLUGIN_DIR . 'modules/input-handler.php';
        require_once PRESSPILOT_PLUGIN_DIR . 'modules/color-extractor.php';
        require_once PRESSPILOT_PLUGIN_DIR . 'modules/language-helper.php';
        require_once PRESSPILOT_PLUGIN_DIR . 'modules/content-generator.php';
        require_once PRESSPILOT_PLUGIN_DIR . 'modules/theme-matcher.php';
        require_once PRESSPILOT_PLUGIN_DIR . 'modules/site-assembler.php';
        require_once PRESSPILOT_PLUGIN_DIR . 'modules/export-handler.php';
        
        // Security module (load first)
        require_once PRESSPILOT_PLUGIN_DIR . 'modules/secure-settings.php';
        
        // CORS handler (load before API modules)
        require_once PRESSPILOT_PLUGIN_DIR . 'modules/cors-handler.php';
        
        // New AI Agent modules
        require_once PRESSPILOT_PLUGIN_DIR . 'modules/agent-auth.php';
        require_once PRESSPILOT_PLUGIN_DIR . 'modules/agent-bridge.php';
        require_once PRESSPILOT_PLUGIN_DIR . 'modules/mcp-server.php';
    }
    
    /**
     * Initialize WordPress hooks
     */
    private function init_hooks() {
        // Admin menu
        add_action('admin_menu', array($this, 'add_admin_menu'));
        
        // Enqueue admin assets
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_assets'));
        
        // AJAX handlers
        add_action('wp_ajax_presspilot_generate', array($this, 'handle_generation'));
        add_action('wp_ajax_presspilot_upload_logo', array($this, 'handle_logo_upload'));
        
        // Frontend logo scaling CSS
        add_action('wp_head', array($this, 'add_logo_scaling_css'));
    }
    
    /**
     * Add admin menu page
     */
    public function add_admin_menu() {
        add_menu_page(
            'PressPilot',
            'PressPilot',
            'manage_options',
            'presspilot',
            array($this, 'render_admin_page'),
            'dashicons-admin-site-alt3',
            30
        );
        
        // Add Settings submenu
        add_submenu_page(
            'presspilot',
            'Agent Settings',
            'Agent Settings',
            'manage_options',
            'presspilot-agent',
            array($this, 'render_agent_settings_page')
        );
    }
    
    /**
     * Enqueue admin styles and scripts
     */
    public function enqueue_admin_assets($hook) {
        if ($hook !== 'toplevel_page_presspilot') {
            return;
        }
        
        wp_enqueue_style(
            'presspilot-admin',
            PRESSPILOT_ASSETS_URL . 'admin.css',
            array(),
            PRESSPILOT_VERSION
        );
        
        wp_enqueue_script(
            'presspilot-admin',
            PRESSPILOT_ASSETS_URL . 'admin.js',
            array('jquery'),
            PRESSPILOT_VERSION,
            true
        );
        
        // Pass AJAX URL to JavaScript
        wp_localize_script('presspilot-admin', 'presspilot_ajax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('presspilot_nonce')
        ));
    }
    
    /**
     * Render admin page
     */
    public function render_admin_page() {
        $input_handler = new PressPilot_Input_Handler();
        $input_handler->render_form();
    }
    
    /**
     * Render Agent Settings Page
     */
    public function render_agent_settings_page() {
        // Handle settings save
        if (isset($_POST['presspilot_agent_settings'])) {
            check_admin_referer('presspilot_agent_settings');
            
            // Save OpenAI API key
            if (isset($_POST['presspilot_openai_key'])) {
                $api_key = sanitize_text_field($_POST['presspilot_openai_key']);
                if (!empty($api_key)) {
                    presspilot_save_api_key($api_key);
                }
            }
            
            echo '<div class="notice notice-success"><p>Settings saved!</p></div>';
        }
        
        // Get current API key (encrypted)
        $api_key_set = !empty(presspilot_get_api_key());
        
        // Get or generate access token
        $tokens = get_option('presspilot_access_tokens', array());
        if (empty($tokens)) {
            $token = PressPilot_CORS_Handler::generate_access_token();
            $tokens = get_option('presspilot_access_tokens', array());
        }
        $token = !empty($tokens) ? array_key_first($tokens) : '';
        
        ?>
        <div class="wrap">
            <h1>PressPilot Agent Settings</h1>
            <p>Configure your AI Agent connection and authentication.</p>
            
            <form method="post" action="">
                <?php wp_nonce_field('presspilot_agent_settings'); ?>
                
                <table class="form-table">
                    <tr>
                        <th scope="row">OpenAI API Key</th>
                        <td>
                            <input type="password" 
                                   name="presspilot_openai_key" 
                                   class="regular-text" 
                                   placeholder="sk-proj-..." 
                                   value="<?php echo $api_key_set ? '••••••••••••••••' : ''; ?>" />
                            <p class="description">
                                <?php if ($api_key_set): ?>
                                    ✅ API key is configured (enter new key to update)
                                <?php else: ?>
                                    ⚠️ API key not set. <a href="https://platform.openai.com/api-keys" target="_blank">Get your key here</a>
                                <?php endif; ?>
                            </p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">Access Token</th>
                        <td>
                            <input type="text" 
                                   readonly 
                                   value="<?php echo esc_attr($token); ?>" 
                                   class="large-text code" 
                                   id="presspilot_access_token"
                                   style="background:#f9f9f9;" />
                            <button type="button" 
                                    class="button button-secondary" 
                                    onclick="navigator.clipboard.writeText(document.getElementById('presspilot_access_token').value); this.textContent='✓ Copied!'; setTimeout(() => this.textContent='Copy Token', 2000);">
                                Copy Token
                            </button>
                            <a href="<?php echo admin_url('admin.php?page=presspilot-agent&action=regenerate_token'); ?>" 
                               class="button"
                               onclick="return confirm('Generate a new token? Your old token will stop working.');">
                                Generate New Token
                            </a>
                            <p class="description">
                                <strong>Use this token in your Netlify app</strong> to authenticate API requests.<br>
                                Token expires in 24 hours. Keep it secure - it allows access to your WordPress site.<br>
                                <strong>Your Netlify URL:</strong> https://majestic-otter-78f7e5.netlify.app
                            </p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">API Endpoints</th>
                        <td>
                            <p><strong>MCP Endpoint:</strong> <code><?php echo get_site_url(); ?>/wp-json/presspilot/v1/mcp</code></p>
                            <p><strong>Health Check:</strong> <code><?php echo get_site_url(); ?>/wp-json/presspilot/v1/health</code></p>
                            <p><strong>Nonce:</strong> <code><?php echo get_site_url(); ?>/wp-json/presspilot/v1/nonce</code></p>
                            <p class="description">
                                <a href="<?php echo get_site_url(); ?>/wp-json/presspilot/v1/health" target="_blank">Test health endpoint</a>
                            </p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">CORS Configuration</th>
                        <td>
                            <p><strong>Allowed Origin:</strong> https://majestic-otter-78f7e5.netlify.app</p>
                            <p class="description">
                                Your Netlify app is pre-configured to access this WordPress site.
                            </p>
                        </td>
                    </tr>
                </table>
                
                <input type="hidden" name="presspilot_agent_settings" value="1" />
                <?php submit_button('Save Settings'); ?>
            </form>
            
            <hr>
            
            <h2>Quick Setup Guide</h2>
            <ol>
                <li><strong>Copy your Access Token</strong> (click "Copy Token" button above)</li>
                <li><strong>Update your Netlify app</strong> with the token</li>
                <li><strong>Deploy to Netlify</strong></li>
                <li><strong>Go to /agent</strong> and connect to your site</li>
                <li><strong>Start chatting!</strong> Try "Create a page called Test"</li>
            </ol>
            
            <h3>Test Connection</h3>
            <p>
                <a href="<?php echo get_site_url(); ?>/wp-json/presspilot/v1/nonce" 
                   class="button button-primary" 
                   target="_blank">
                    Test API Endpoint
                </a>
            </p>
        </div>
        <?php
    }
    
    /**
     * Handle AJAX site generation
     */
    public function handle_generation() {
        // Verify nonce
        check_ajax_referer('presspilot_nonce', 'nonce');
        
        // Get input data
        $business_name = sanitize_text_field($_POST['business_name']);
        $business_tagline = sanitize_text_field($_POST['business_tagline'] ?? '');
        $business_description = sanitize_textarea_field($_POST['business_description']);
        $content_language = sanitize_text_field($_POST['content_language'] ?? 'en');
        $business_type = sanitize_text_field($_POST['business_type']);
        $logo_url = esc_url_raw($_POST['logo_url']);
        
        // Process through modular pipeline
        try {
            // Step 1: Extract colors from logo
            $color_extractor = new PressPilot_Color_Extractor();
            $colors = $color_extractor->extract($logo_url);
            
            // Step 2: Match WordPress theme
            $theme_matcher = new PressPilot_Theme_Matcher();
            $theme = $theme_matcher->match($business_type, $colors);
            
            // Step 3: Generate content with OpenAI (multi-language support)
            $content_generator = new PressPilot_Content_Generator();
            $content = $content_generator->generate($business_name, $business_tagline, $business_description, $content_language, $business_type, $colors);
            
            // Step 4: Assemble site (pass tagline for integration)
            $site_assembler = new PressPilot_Site_Assembler();
            $result = $site_assembler->assemble($business_name, $theme, $content, $colors, $business_type, $logo_url, $business_tagline);
            
            wp_send_json_success($result);
            
        } catch (Exception $e) {
            wp_send_json_error(array('message' => $e->getMessage()));
        }
    }
    
    /**
     * Handle logo upload AJAX
     */
    public function handle_logo_upload() {
        check_ajax_referer('presspilot_nonce', 'nonce');
        
        if (empty($_FILES['file'])) {
            wp_send_json_error(array('message' => 'No file uploaded'));
        }
        
        $input_handler = new PressPilot_Input_Handler();
        
        try {
            $input_handler->validate_logo($_FILES['file']);
            $logo_url = $input_handler->upload_logo($_FILES['file']);
            
            wp_send_json_success(array('url' => $logo_url));
        } catch (Exception $e) {
            wp_send_json_error(array('message' => $e->getMessage()));
        }
    }
    
    /**
     * Add CSS to scale logo properly in frontend
     */
    public function add_logo_scaling_css() {
        // Get all PressPilot-generated page IDs
        $args = array(
            'post_type' => 'page',
            'meta_key' => '_presspilot_generated',
            'posts_per_page' => -1,
            'fields' => 'ids'
        );
        $presspilot_pages = get_posts($args);
        
        $css = '<style>' . "\n";
        $css .= '/* PressPilot Logo Scaling */' . "\n";
        $css .= '.custom-logo-link img, .site-logo img, .custom-logo {' . "\n";
        $css .= '    max-height: 80px;' . "\n";
        $css .= '    width: auto;' . "\n";
        $css .= '    height: auto;' . "\n";
        $css .= '}' . "\n";
        $css .= '.custom-logo-link, .site-logo {' . "\n";
        $css .= '    display: inline-block;' . "\n";
        $css .= '    max-height: 80px;' . "\n";
        $css .= '}' . "\n";
        
        if (!empty($presspilot_pages)) {
            $css .= '/* Hide page titles on PressPilot-generated pages */' . "\n";
            // Build aggressive selectors for hiding titles
            foreach ($presspilot_pages as $page_id) {
                $css .= '.page-id-' . $page_id . ' .entry-title,' . "\n";
                $css .= '.page-id-' . $page_id . ' .page-title,' . "\n";
                $css .= '.page-id-' . $page_id . ' h1.entry-title,' . "\n";
                $css .= '.page-id-' . $page_id . ' .entry-header .entry-title,' . "\n";
                $css .= '.page-id-' . $page_id . ' header.entry-header h1,' . "\n";
                $css .= '.postid-' . $page_id . ' .entry-title,' . "\n";
                $css .= '.postid-' . $page_id . ' .page-title {' . "\n";
                $css .= '    display: none !important;' . "\n";
                $css .= '    visibility: hidden !important;' . "\n";
                $css .= '    height: 0 !important;' . "\n";
                $css .= '    margin: 0 !important;' . "\n";
                $css .= '    padding: 0 !important;' . "\n";
                $css .= '}' . "\n";
            }
        }
        
        $css .= '</style>' . "\n";
        
        echo $css;
    }
    
    /**
     * Initialize AI Agent Bridge
     */
    private function init_agent_bridge() {
        if (class_exists('PressPilot_Agent_Bridge')) {
            new PressPilot_Agent_Bridge();
        }
    }
    
    /**
     * Plugin activation
     */
    public function activate() {
        global $wpdb;
        
        // Original generations table
        $table_name = $wpdb->prefix . 'presspilot_generations';
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE IF NOT EXISTS $table_name (
            id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            business_name varchar(255) NOT NULL,
            theme_slug varchar(100) NOT NULL,
            colors text,
            pages_data text,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            status varchar(50) DEFAULT 'generated',
            PRIMARY KEY (id)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
        
        // AI Agent tables
        $this->create_agent_tables();
        
        // CRITICAL: Flush rewrite rules to register new REST routes
        flush_rewrite_rules();
    }
    
    /**
     * Create tables for AI Agent functionality
     */
    private function create_agent_tables() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();
        
        // Agent request log table
        $agent_log_table = $wpdb->prefix . 'presspilot_agent_log';
        $sql_agent_log = "CREATE TABLE IF NOT EXISTS $agent_log_table (
            id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id bigint(20) UNSIGNED NOT NULL,
            tool_name varchar(100) NOT NULL,
            parameters longtext,
            request_id varchar(255),
            timestamp datetime DEFAULT CURRENT_TIMESTAMP,
            ip_address varchar(45),
            user_agent text,
            PRIMARY KEY (id),
            KEY user_requests (user_id, timestamp),
            KEY tool_usage (tool_name),
            KEY request_tracking (request_id)
        ) $charset_collate;";
        
        // Undo log table
        $undo_log_table = $wpdb->prefix . 'presspilot_undo_log';
        $sql_undo_log = "CREATE TABLE IF NOT EXISTS $undo_log_table (
            id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            undo_token varchar(255) NOT NULL,
            user_id bigint(20) UNSIGNED NOT NULL,
            tool_name varchar(100) NOT NULL,
            parameters longtext,
            undo_data longtext,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            expires_at datetime NOT NULL,
            PRIMARY KEY (id),
            UNIQUE KEY undo_tokens (undo_token),
            KEY user_undos (user_id, created_at),
            KEY cleanup (expires_at)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql_agent_log);
        dbDelta($sql_undo_log);
    }
}

/**
 * Initialize PressPilot
 */
function presspilot_init() {
    return PressPilot::get_instance();
}

// Start the plugin
add_action('plugins_loaded', 'presspilot_init');
