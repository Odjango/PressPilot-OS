<?php
/**
 * Module: Agent Authentication
 * Purpose: Handle secure token generation for SaaS ↔ WordPress connection
 * Architecture: Simple, secure JWT-based authentication
 */

if (!defined('ABSPATH')) {
    exit;
}

class PressPilot_Agent_Auth {
    
    private $token_expiry = 2592000; // 30 days in seconds
    
    /**
     * Initialize authentication hooks
     */
    public function __construct() {
        add_action('rest_api_init', array($this, 'register_auth_routes'));
    }
    
    /**
     * Register REST API authentication routes
     */
    public function register_auth_routes() {
        // Generate token endpoint
        register_rest_route('presspilot/v1', '/auth/token', array(
            'methods' => 'POST',
            'callback' => array($this, 'generate_token'),
            'permission_callback' => '__return_true', // Public endpoint with username/password verification
            'args' => array(
                'username' => array(
                    'required' => true,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_user'
                ),
                'password' => array(
                    'required' => true,
                    'type' => 'string'
                )
            )
        ));
        
        // Verify token endpoint
        register_rest_route('presspilot/v1', '/auth/verify', array(
            'methods' => 'POST',
            'callback' => array($this, 'verify_token'),
            'permission_callback' => '__return_true',
            'args' => array(
                'token' => array(
                    'required' => true,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field'
                )
            )
        ));
        
        // Revoke token endpoint
        register_rest_route('presspilot/v1', '/auth/revoke', array(
            'methods' => 'POST',
            'callback' => array($this, 'revoke_token'),
            'permission_callback' => array($this, 'verify_token_permission'),
            'args' => array(
                'token' => array(
                    'required' => true,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field'
                )
            )
        ));
    }
    
    /**
     * Check if HTTPS is required and enforced
     */
    private function check_https_requirement() {
        $settings = get_option('presspilot_settings', array());
        $https_required = !empty($settings['https_required']);
        
        if ($https_required && !is_ssl() && !defined('WP_DEBUG')) {
            return new WP_Error(
                'https_required',
                'HTTPS is required for secure authentication. Please enable SSL on your WordPress site.',
                array('status' => 403)
            );
        }
        
        return true;
    }
    
    /**
     * Check rate limiting
     */
    private function check_rate_limit($username) {
        $settings = get_option('presspilot_settings', array());
        
        if (empty($settings['rate_limiting_enabled'])) {
            return true; // Rate limiting disabled
        }
        
        $max_attempts = absint($settings['rate_limit_attempts'] ?? 5);
        $window_minutes = absint($settings['rate_limit_window'] ?? 15);
        
        $attempts_key = 'presspilot_auth_attempts_' . md5($username . $_SERVER['REMOTE_ADDR']);
        $attempts = get_transient($attempts_key);
        
        if ($attempts === false) {
            $attempts = 0;
        }
        
        if ($attempts >= $max_attempts) {
            return new WP_Error(
                'rate_limit_exceeded',
                sprintf('Too many login attempts. Please wait %d minutes and try again.', $window_minutes),
                array('status' => 429)
            );
        }
        
        // Increment attempts
        set_transient($attempts_key, $attempts + 1, $window_minutes * MINUTE_IN_SECONDS);
        
        return true;
    }
    
    /**
     * Clear rate limit on successful auth
     */
    private function clear_rate_limit($username) {
        $attempts_key = 'presspilot_auth_attempts_' . md5($username . $_SERVER['REMOTE_ADDR']);
        delete_transient($attempts_key);
    }
    
    /**
     * Generate authentication token for SaaS app
     * 
     * @param WP_REST_Request $request
     * @return WP_REST_Response|WP_Error
     */
    public function generate_token($request) {
        // Check HTTPS requirement
        $https_check = $this->check_https_requirement();
        if (is_wp_error($https_check)) {
            return $https_check;
        }
        $username = $request->get_param('username');
        $password = $request->get_param('password');
        
        // Check rate limiting
        $rate_check = $this->check_rate_limit($username);
        if (is_wp_error($rate_check)) {
            return $rate_check;
        }
        
        // Authenticate user with WordPress
        $user = wp_authenticate($username, $password);
        
        if (is_wp_error($user)) {
            return new WP_Error(
                'authentication_failed',
                'Invalid username or password',
                array('status' => 401)
            );
        }
        
        // Check if user has sufficient capabilities
        if (!user_can($user->ID, 'edit_posts')) {
            return new WP_Error(
                'insufficient_permissions',
                'User must have at least Editor role to use PressPilot Agent',
                array('status' => 403)
            );
        }
        
        // Generate secure token
        $token_data = array(
            'user_id' => $user->ID,
            'username' => $user->user_login,
            'email' => $user->user_email,
            'roles' => $user->roles,
            'issued_at' => time(),
            'expires_at' => time() + $this->token_expiry,
            'token_id' => wp_generate_uuid4()
        );
        
        // Create JWT-style token (simplified for WordPress)
        $token = $this->create_token($token_data);
        
        // Store token in user meta for validation and revocation
        $user_tokens = get_user_meta($user->ID, 'presspilot_agent_tokens', true);
        if (!is_array($user_tokens)) {
            $user_tokens = array();
        }
        
        $user_tokens[$token_data['token_id']] = array(
            'token' => $token,
            'issued_at' => $token_data['issued_at'],
            'expires_at' => $token_data['expires_at'],
            'last_used' => time(),
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown'
        );
        
        // Keep only last 5 tokens per user
        if (count($user_tokens) > 5) {
            array_shift($user_tokens);
        }
        
        update_user_meta($user->ID, 'presspilot_agent_tokens', $user_tokens);
        
        // Clear rate limit on successful auth
        $this->clear_rate_limit($username);
        
        // Return token and user info
        return rest_ensure_response(array(
            'success' => true,
            'token' => $token,
            'user' => array(
                'id' => $user->ID,
                'username' => $user->user_login,
                'email' => $user->user_email,
                'display_name' => $user->display_name,
                'roles' => $user->roles
            ),
            'site' => array(
                'name' => get_bloginfo('name'),
                'url' => get_site_url(),
                'wordpress_version' => get_bloginfo('version'),
                'presspilot_version' => defined('PRESSPILOT_VERSION') ? PRESSPILOT_VERSION : '2.0.0'
            ),
            'expires_in' => $this->token_expiry,
            'expires_at' => $token_data['expires_at']
        ));
    }
    
    /**
     * Verify if token is valid
     * 
     * @param WP_REST_Request $request
     * @return WP_REST_Response|WP_Error
     */
    public function verify_token($request) {
        $token = $request->get_param('token');
        
        $token_data = $this->decode_token($token);
        
        if (!$token_data) {
            return new WP_Error(
                'invalid_token',
                'Token is invalid or malformed',
                array('status' => 401)
            );
        }
        
        // Check expiration
        if ($token_data['expires_at'] < time()) {
            return new WP_Error(
                'token_expired',
                'Token has expired',
                array('status' => 401)
            );
        }
        
        // Verify token exists in user meta
        $user_id = $token_data['user_id'];
        $user_tokens = get_user_meta($user_id, 'presspilot_agent_tokens', true);
        
        if (!is_array($user_tokens) || !isset($user_tokens[$token_data['token_id']])) {
            return new WP_Error(
                'token_revoked',
                'Token has been revoked',
                array('status' => 401)
            );
        }
        
        // Update last used timestamp
        $user_tokens[$token_data['token_id']]['last_used'] = time();
        update_user_meta($user_id, 'presspilot_agent_tokens', $user_tokens);
        
        return rest_ensure_response(array(
            'success' => true,
            'valid' => true,
            'user_id' => $user_id,
            'username' => $token_data['username'],
            'expires_at' => $token_data['expires_at']
        ));
    }
    
    /**
     * Revoke a token
     * 
     * @param WP_REST_Request $request
     * @return WP_REST_Response|WP_Error
     */
    public function revoke_token($request) {
        $token = $request->get_param('token');
        
        $token_data = $this->decode_token($token);
        
        if (!$token_data) {
            return new WP_Error(
                'invalid_token',
                'Token is invalid',
                array('status' => 400)
            );
        }
        
        // Remove token from user meta
        $user_id = $token_data['user_id'];
        $user_tokens = get_user_meta($user_id, 'presspilot_agent_tokens', true);
        
        if (is_array($user_tokens) && isset($user_tokens[$token_data['token_id']])) {
            unset($user_tokens[$token_data['token_id']]);
            update_user_meta($user_id, 'presspilot_agent_tokens', $user_tokens);
        }
        
        return rest_ensure_response(array(
            'success' => true,
            'message' => 'Token revoked successfully'
        ));
    }
    
    /**
     * Create a secure token
     * 
     * @param array $data Token payload
     * @return string Encoded token
     */
    private function create_token($data) {
        // Create signature using WordPress secret keys
        $header = array(
            'typ' => 'JWT',
            'alg' => 'HS256'
        );
        
        $payload = $data;
        
        $header_encoded = $this->base64url_encode(json_encode($header));
        $payload_encoded = $this->base64url_encode(json_encode($payload));
        
        $signature = hash_hmac(
            'sha256',
            $header_encoded . '.' . $payload_encoded,
            wp_salt('auth') . SECURE_AUTH_KEY,
            true
        );
        
        $signature_encoded = $this->base64url_encode($signature);
        
        return $header_encoded . '.' . $payload_encoded . '.' . $signature_encoded;
    }
    
    /**
     * Decode and verify token
     * 
     * @param string $token
     * @return array|false Token data or false if invalid
     */
    private function decode_token($token) {
        $parts = explode('.', $token);
        
        if (count($parts) !== 3) {
            return false;
        }
        
        list($header_encoded, $payload_encoded, $signature_encoded) = $parts;
        
        // Verify signature
        $signature = hash_hmac(
            'sha256',
            $header_encoded . '.' . $payload_encoded,
            wp_salt('auth') . SECURE_AUTH_KEY,
            true
        );
        
        $signature_check = $this->base64url_encode($signature);
        
        if (!hash_equals($signature_check, $signature_encoded)) {
            return false;
        }
        
        // Decode payload
        $payload = json_decode($this->base64url_decode($payload_encoded), true);
        
        if (!$payload) {
            return false;
        }
        
        return $payload;
    }
    
    /**
     * Verify token permission for REST API
     */
    public function verify_token_permission($request) {
        $token = $request->get_header('Authorization');
        
        if (!$token) {
            $token = $request->get_param('token');
        }
        
        if (!$token) {
            return false;
        }
        
        // Remove "Bearer " prefix if present
        $token = str_replace('Bearer ', '', $token);
        
        $token_data = $this->decode_token($token);
        
        if (!$token_data) {
            return false;
        }
        
        // Check expiration
        if ($token_data['expires_at'] < time()) {
            return false;
        }
        
        // Set current user for WordPress
        wp_set_current_user($token_data['user_id']);
        
        return true;
    }
    
    /**
     * Get token data from request header
     * 
     * @param WP_REST_Request $request
     * @return array|false Token data or false
     */
    public function get_token_from_request($request) {
        $auth_header = $request->get_header('Authorization');
        
        if (!$auth_header) {
            return false;
        }
        
        // Extract token (Bearer token format)
        $token = str_replace('Bearer ', '', $auth_header);
        
        return $this->decode_token($token);
    }
    
    /**
     * Base64 URL encode
     */
    private function base64url_encode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
    
    /**
     * Base64 URL decode
     */
    private function base64url_decode($data) {
        return base64_decode(strtr($data, '-_', '+/'));
    }
    
    /**
     * Clean expired tokens (called daily via cron)
     */
    public function cleanup_expired_tokens() {
        global $wpdb;
        
        $users = get_users(array(
            'meta_key' => 'presspilot_agent_tokens'
        ));
        
        foreach ($users as $user) {
            $user_tokens = get_user_meta($user->ID, 'presspilot_agent_tokens', true);
            
            if (!is_array($user_tokens)) {
                continue;
            }
            
            $cleaned = false;
            foreach ($user_tokens as $token_id => $token_info) {
                if ($token_info['expires_at'] < time()) {
                    unset($user_tokens[$token_id]);
                    $cleaned = true;
                }
            }
            
            if ($cleaned) {
                update_user_meta($user->ID, 'presspilot_agent_tokens', $user_tokens);
            }
        }
    }
}

// Initialize authentication
$presspilot_agent_auth = new PressPilot_Agent_Auth();

// Schedule daily token cleanup
if (!wp_next_scheduled('presspilot_cleanup_tokens')) {
    wp_schedule_event(time(), 'daily', 'presspilot_cleanup_tokens');
}

add_action('presspilot_cleanup_tokens', array($presspilot_agent_auth, 'cleanup_expired_tokens'));
