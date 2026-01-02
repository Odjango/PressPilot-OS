<?php
/**
 * Module: Agent Bridge
 * Purpose: Handle secure communication between PressPilot SaaS and WordPress
 * Architecture: Following Hassan's 3 Rules - Modular, Pattern-based, Documentation-injected
 */

if (!defined('ABSPATH')) {
    exit;
}

class PressPilot_Agent_Bridge {
    
    private $mcp_server;
    private $security;
    
    /**
     * Initialize the bridge
     */
    public function __construct() {
        $this->security = new PressPilot_Security();
        $this->mcp_server = new PressPilot_MCP_Server();
        
        $this->init_hooks();
    }
    
    /**
     * Initialize WordPress hooks
     */
    private function init_hooks() {
        // REST API endpoints
        add_action('rest_api_init', array($this, 'register_rest_routes'));
        
        // AJAX handlers for non-REST requests
        add_action('wp_ajax_presspilot_agent_action', array($this, 'handle_legacy_request'));
        
        // Admin enqueue scripts for connection testing
        add_action('admin_enqueue_scripts', array($this, 'enqueue_bridge_assets'));
        
        // Health check endpoint
        add_action('wp_head', array($this, 'add_agent_meta_tags'));
    }
    
    /**
     * Register REST API routes for MCP communication
     */
    public function register_rest_routes() {
        // Main MCP endpoint
        register_rest_route('presspilot/v1', '/mcp', array(
            'methods' => 'POST',
            'callback' => array($this, 'handle_mcp_request'),
            'permission_callback' => array($this, 'verify_agent_permissions'),
            'args' => array(
                'tool' => array(
                    'required' => true,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field'
                ),
                'parameters' => array(
                    'required' => true,
                    'type' => 'object'
                )
            )
        ));
        
        // Health check endpoint
        register_rest_route('presspilot/v1', '/health', array(
            'methods' => 'GET,POST',
            'callback' => array($this, 'health_check'),
            'permission_callback' => array($this, 'verify_agent_permissions')
        ));
        
        // Nonce endpoint for security (public access)
        register_rest_route('presspilot/v1', '/nonce', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_nonce'),
            'permission_callback' => '__return_true' // Public endpoint
        ));
        
        // Token generation endpoint (requires nonce)
        register_rest_route('presspilot/v1', '/token', array(
            'methods' => 'POST',
            'callback' => array($this, 'generate_token'),
            'permission_callback' => array($this, 'verify_nonce_for_token')
        ));
        
        // Available tools endpoint
        register_rest_route('presspilot/v1', '/tools', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_available_tools'),
            'permission_callback' => array($this, 'verify_agent_permissions')
        ));
    }
    
    /**
     * Handle MCP protocol requests (Hassan's Rule 2: Patterns)
     * Always returns: {success, data, preview, undo_token, next_suggestions}
     */
    public function handle_mcp_request($request) {
        try {
            // Security verification
            $security_check = $this->security->verify_agent_request($request);
            if (is_wp_error($security_check)) {
                return $this->format_error_response($security_check);
            }
            
            // Extract MCP data
            $data = $request->get_json_params();
            $tool_name = sanitize_text_field($data['tool']);
            $parameters = $data['parameters'];
            $request_id = sanitize_text_field($data['requestId'] ?? '');
            
            // Log the request
            $this->log_agent_request($tool_name, $parameters, $request_id);
            
            // Execute through MCP server
            $result = $this->mcp_server->execute_tool($tool_name, $parameters);
            
            // Format response following PressPilot pattern
            return $this->format_success_response($result, $tool_name);
            
        } catch (Exception $e) {
            error_log('PressPilot Agent Bridge Error: ' . $e->getMessage());
            return $this->format_error_response(new WP_Error(
                'agent_execution_failed',
                $e->getMessage()
            ));
        }
    }
    
    /**
     * Health check for SaaS connection testing
     */
    public function health_check($request) {
        $health_data = array(
            'status' => 'healthy',
            'timestamp' => current_time('mysql'),
            'wordpress_version' => get_bloginfo('version'),
            'presspilot_version' => PRESSPILOT_VERSION,
            'mcp_supported' => true,
            'available_tools' => count($this->mcp_server->get_registered_tools()),
            'memory_usage' => memory_get_usage(true),
            'max_execution_time' => ini_get('max_execution_time'),
            'site_info' => array(
                'name' => get_bloginfo('name'),
                'url' => get_site_url(),
                'admin_email' => get_option('admin_email'),
                'theme' => get_template(),
                'plugins_active' => count(get_option('active_plugins', array()))
            )
        );
        
        return rest_ensure_response($health_data);
    }
    
    /**
     * Get fresh nonce for security
     */
    public function get_nonce($request) {
        return rest_ensure_response(array(
            'nonce' => wp_create_nonce('presspilot_agent'),
            'expires' => time() + (12 * HOUR_IN_SECONDS) // 12 hours
        ));
    }
    
    /**
     * Generate access token (requires valid nonce)
     */
    public function generate_token($request) {
        $token = PressPilot_CORS_Handler::generate_access_token();
        
        return rest_ensure_response(array(
            'token' => $token,
            'expires' => time() + (24 * HOUR_IN_SECONDS), // 24 hours
            'type' => 'Bearer'
        ));
    }
    
    /**
     * Verify nonce for token generation
     */
    public function verify_nonce_for_token($request) {
        $nonce = $request->get_header('X-WP-Nonce');
        
        if (!$nonce) {
            return new WP_Error('no_nonce', 'Nonce header missing', array('status' => 400));
        }
        
        if (!wp_verify_nonce($nonce, 'presspilot_agent')) {
            return new WP_Error('invalid_nonce', 'Invalid nonce', array('status' => 401));
        }
        
        return true;
    }
    
    /**
     * Get available tools for SaaS interface
     */
    public function get_available_tools($request) {
        $tools = $this->mcp_server->get_registered_tools();
        
        $formatted_tools = array();
        foreach ($tools as $name => $tool) {
            $formatted_tools[] = array(
                'name' => $name,
                'description' => $tool['description'] ?? 'No description available',
                'category' => $tool['category'] ?? 'general',
                'parameters' => $tool['parameters'] ?? array(),
                'safe' => $tool['safe'] ?? true,
                'reversible' => $tool['reversible'] ?? false
            );
        }
        
        return rest_ensure_response(array(
            'tools' => $formatted_tools,
            'count' => count($formatted_tools),
            'categories' => $this->get_tool_categories()
        ));
    }
    
    /**
     * Check HTTPS requirement
     */
    private function check_https_requirement() {
        $settings = get_option('presspilot_settings', array());
        $https_required = !empty($settings['https_required']);
        
        if ($https_required && !is_ssl() && !defined('WP_DEBUG')) {
            return new WP_Error(
                'https_required',
                'HTTPS is required for API requests',
                array('status' => 403)
            );
        }
        
        return true;
    }
    
    /**
     * Verify permissions for agent requests
     * Now uses JWT token-based authentication
     */
    public function verify_agent_permissions($request) {
        // For /nonce endpoint, allow unauthenticated access
        $route = $request->get_route();
        if ($route === '/presspilot/v1/nonce' || $route === '/presspilot/v1/health') {
            return true; // Allow public access to nonce and health endpoints
        }
        
        // Check HTTPS requirement first
        $https_check = $this->check_https_requirement();
        if (is_wp_error($https_check)) {
            return $https_check;
        }
        
        // Try to get token from Authorization header
        $auth_header = $request->get_header('Authorization');
        
        if (!$auth_header) {
            return new WP_Error('no_auth_header', 'Authorization header missing', array('status' => 401));
        }
        
        // Extract token (Bearer token format)
        $token = str_replace('Bearer ', '', $auth_header);
        
        if (!$token) {
            return new WP_Error('no_token', 'Token missing from Authorization header', array('status' => 401));
        }
        
        // Validate token using CORS handler
        if (!PressPilot_CORS_Handler::validate_token($token)) {
            return new WP_Error('invalid_token', 'Token is invalid or expired', array('status' => 401));
        }
        
        // Token is valid
        return true;
    }
    
    /**
     * Format successful response (Hassan's Rule 2: Patterns)
     */
    private function format_success_response($result, $tool_name) {
        $response = array(
            'jsonrpc' => '2.0',
            'result' => array(
                'success' => true,
                'data' => $result['data'] ?? null,
                'preview' => $result['preview'] ?? 'Action completed successfully',
                'undo_token' => $result['undo_token'] ?? null,
                'next_suggestions' => $result['next_suggestions'] ?? array(),
                'tool_name' => $tool_name,
                'timestamp' => current_time('mysql'),
                'execution_time' => $result['execution_time'] ?? null
            )
        );
        
        return rest_ensure_response($response);
    }
    
    /**
     * Format error response
     */
    private function format_error_response($error) {
        $response = array(
            'jsonrpc' => '2.0',
            'error' => array(
                'code' => $error->get_error_code(),
                'message' => $error->get_error_message(),
                'data' => $error->get_error_data(),
                'timestamp' => current_time('mysql'),
                'suggestions' => $this->get_error_suggestions($error)
            )
        );
        
        return rest_ensure_response($response);
    }
    
    /**
     * Log agent requests for debugging and undo functionality
     */
    private function log_agent_request($tool_name, $parameters, $request_id) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'presspilot_agent_log';
        
        $wpdb->insert(
            $table_name,
            array(
                'user_id' => get_current_user_id(),
                'tool_name' => $tool_name,
                'parameters' => json_encode($parameters),
                'request_id' => $request_id,
                'timestamp' => current_time('mysql'),
                'ip_address' => $_SERVER['REMOTE_ADDR'] ?? '',
                'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? ''
            ),
            array('%d', '%s', '%s', '%s', '%s', '%s', '%s')
        );
    }
    
    /**
     * Get tool categories for organization
     */
    private function get_tool_categories() {
        return array(
            'content' => array(
                'name' => 'Content',
                'description' => 'Create and manage pages, posts, and media',
                'icon' => 'edit'
            ),
            'design' => array(
                'name' => 'Design',
                'description' => 'Modify colors, typography, and visual elements',
                'icon' => 'art'
            ),
            'structure' => array(
                'name' => 'Structure',
                'description' => 'Manage menus, navigation, and site structure',
                'icon' => 'menu'
            ),
            'seo' => array(
                'name' => 'SEO',
                'description' => 'Optimize for search engines and performance',
                'icon' => 'search'
            ),
            'commerce' => array(
                'name' => 'Commerce',
                'description' => 'Manage products, orders, and e-commerce features',
                'icon' => 'cart'
            ),
            'safety' => array(
                'name' => 'Safety',
                'description' => 'Backup, restore, and undo operations',
                'icon' => 'shield'
            )
        );
    }
    
    /**
     * Get error recovery suggestions
     */
    private function get_error_suggestions($error) {
        $suggestions = array();
        
        switch ($error->get_error_code()) {
            case 'insufficient_permissions':
                $suggestions[] = 'Contact your site administrator to grant proper permissions';
                $suggestions[] = 'Ensure you are logged in with an editor or administrator account';
                break;
                
            case 'tool_not_found':
                $suggestions[] = 'Check if the requested tool is available in your PressPilot version';
                $suggestions[] = 'Try refreshing the available tools list';
                break;
                
            case 'invalid_parameters':
                $suggestions[] = 'Verify all required parameters are provided';
                $suggestions[] = 'Check parameter formatting and data types';
                break;
                
            default:
                $suggestions[] = 'Try the action again in a few moments';
                $suggestions[] = 'Contact support if the problem persists';
        }
        
        return $suggestions;
    }
    
    /**
     * Enqueue assets for bridge functionality
     */
    public function enqueue_bridge_assets($hook) {
        // Only load on PressPilot admin pages
        if (strpos($hook, 'presspilot') === false) {
            return;
        }
        
        wp_enqueue_script(
            'presspilot-agent-bridge',
            PRESSPILOT_PLUGIN_URL . 'assets/agent-bridge.js',
            array('jquery'),
            PRESSPILOT_VERSION,
            true
        );
        
        wp_localize_script('presspilot-agent-bridge', 'presspilot_bridge', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'rest_url' => get_rest_url(null, 'presspilot/v1/'),
            'nonce' => wp_create_nonce('presspilot_agent'),
            'current_user' => get_current_user_id(),
            'site_url' => get_site_url()
        ));
    }
    
    /**
     * Add meta tags for SaaS detection
     */
    public function add_agent_meta_tags() {
        echo '<meta name="presspilot-agent" content="enabled" />' . "\n";
        echo '<meta name="presspilot-version" content="' . esc_attr(PRESSPILOT_VERSION) . '" />' . "\n";
        echo '<link rel="presspilot-mcp" href="' . esc_url(get_rest_url(null, 'presspilot/v1/mcp')) . '" />' . "\n";
    }
    
    /**
     * Handle legacy AJAX requests (fallback)
     */
    public function handle_legacy_request() {
        // Fallback for older integrations
        check_ajax_referer('presspilot_agent', 'nonce');
        
        $action = sanitize_text_field($_POST['agent_action'] ?? '');
        $data = $_POST['data'] ?? array();
        
        // Convert to MCP format
        $mcp_request = new WP_REST_Request('POST', '/presspilot/v1/mcp');
        $mcp_request->set_body_params(array(
            'tool' => $action,
            'parameters' => $data
        ));
        
        $response = $this->handle_mcp_request($mcp_request);
        wp_send_json($response->get_data());
    }
}

/**
 * Security class for agent requests
 */
class PressPilot_Security {
    
    private $rate_limit_cache = array();
    
    public function verify_agent_request($request) {
        // 1. Rate limiting
        if ($this->is_rate_limited()) {
            return new WP_Error('rate_limited', 'Too many requests, please slow down');
        }
        
        // 2. Nonce verification (if provided)
        $nonce = $request->get_header('X-WP-Nonce');
        if ($nonce && !wp_verify_nonce($nonce, 'presspilot_agent')) {
            return new WP_Error('invalid_nonce', 'Invalid security token');
        }
        
        // 3. User capability check
        if (!current_user_can('edit_pages')) {
            return new WP_Error('insufficient_permissions', 'User lacks required permissions');
        }
        
        // 4. Request structure validation
        if (!$this->validate_request_structure($request)) {
            return new WP_Error('invalid_request', 'Malformed request data');
        }
        
        return true;
    }
    
    private function is_rate_limited() {
        $user_id = get_current_user_id();
        $cache_key = 'presspilot_rate_limit_' . $user_id;
        $requests = get_transient($cache_key) ?: 0;
        
        if ($requests >= 60) { // 60 requests per minute
            return true;
        }
        
        set_transient($cache_key, $requests + 1, 60);
        return false;
    }
    
    private function validate_request_structure($request) {
        // Basic validation of request structure
        $data = $request->get_json_params();
        
        if (!isset($data['tool']) || !is_string($data['tool'])) {
            return false;
        }
        
        if (!isset($data['parameters']) || !is_array($data['parameters'])) {
            return false;
        }
        
        return true;
    }
}