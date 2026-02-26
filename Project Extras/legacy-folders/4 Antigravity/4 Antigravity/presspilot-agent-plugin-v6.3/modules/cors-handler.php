<?php
/**
 * CORS Handler for PressPilot Agent
 * Allows cross-origin requests from your Netlify deployment
 */

if (!defined('ABSPATH')) exit;

class PressPilot_CORS_Handler {
    
    public function __construct() {
        // Add CORS headers very early
        add_action('init', array($this, 'handle_preflight'));
        add_action('rest_api_init', array($this, 'add_cors_support'));
        add_filter('rest_pre_serve_request', array($this, 'add_cors_headers_to_response'), 15);
    }
    
    /**
     * Add CORS headers directly to response
     */
    public function add_cors_headers_to_response($served) {
        $this->send_cors_headers();
        return $served;
    }
    
    /**
     * Add CORS headers to REST API responses
     */
    public function add_cors_support() {
        $this->send_cors_headers();
    }
    
    /**
     * Send CORS headers
     */
    private function send_cors_headers() {
        // Get allowed origins from settings
        $allowed_origins = get_option('presspilot_allowed_origins', '');
        
        // Default allowed origins
        $origins = array(
            'https://majestic-otter-78f7e5.netlify.app', // Your Netlify site
            'http://localhost:5173', // Local development
            'http://localhost:3000'  // Alternative local dev
        );
        
        // Add custom origins from settings
        if (!empty($allowed_origins)) {
            $custom_origins = explode("\n", $allowed_origins);
            $custom_origins = array_map('trim', $custom_origins);
            $custom_origins = array_filter($custom_origins);
            $origins = array_merge($origins, $custom_origins);
        }
        
        // Get current origin
        $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
        
        // Check if origin is allowed
        if (in_array($origin, $origins) || strpos($origin, '.netlify.app') !== false) {
            if (!headers_sent()) {
                header('Access-Control-Allow-Origin: ' . $origin);
                header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
                header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-WP-Nonce');
                header('Access-Control-Allow-Credentials: true');
                header('Access-Control-Max-Age: 86400'); // Cache for 1 day
                header('Vary: Origin');
            }
        }
    }
    
    /**
     * Handle preflight OPTIONS requests
     */
    public function handle_preflight() {
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            $this->add_cors_support();
            status_header(200);
            exit;
        }
    }
    
    /**
     * Generate access token for frontend
     */
    public static function generate_access_token() {
        // Generate a secure random token
        $token = wp_generate_password(64, false);
        
        // Store token with expiration (24 hours)
        $tokens = get_option('presspilot_access_tokens', array());
        $token_data = array(
            'token' => $token,
            'created' => time(),
            'expires' => time() + (24 * 60 * 60), // 24 hours
            'last_used' => null
        );
        
        $tokens[$token] = $token_data;
        update_option('presspilot_access_tokens', $tokens);
        
        return $token;
    }
    
    /**
     * Validate access token
     */
    public static function validate_token($token) {
        if (empty($token)) {
            return false;
        }
        
        $tokens = get_option('presspilot_access_tokens', array());
        
        if (!isset($tokens[$token])) {
            return false;
        }
        
        $token_data = $tokens[$token];
        
        // Check if token is expired
        if ($token_data['expires'] < time()) {
            // Remove expired token
            unset($tokens[$token]);
            update_option('presspilot_access_tokens', $tokens);
            return false;
        }
        
        // Update last used timestamp
        $tokens[$token]['last_used'] = time();
        update_option('presspilot_access_tokens', $tokens);
        
        return true;
    }
    
    /**
     * Clean up expired tokens
     */
    public static function cleanup_expired_tokens() {
        $tokens = get_option('presspilot_access_tokens', array());
        $current_time = time();
        
        foreach ($tokens as $token => $data) {
            if ($data['expires'] < $current_time) {
                unset($tokens[$token]);
            }
        }
        
        update_option('presspilot_access_tokens', $tokens);
    }
}

// Initialize CORS handler
new PressPilot_CORS_Handler();

// Add settings page section for CORS
add_action('admin_init', 'presspilot_cors_settings');
function presspilot_cors_settings() {
    add_settings_section(
        'presspilot_cors_section',
        'CORS & Access Control',
        'presspilot_cors_section_callback',
        'presspilot-agent'
    );
    
    register_setting('presspilot_agent', 'presspilot_allowed_origins');
    
    add_settings_field(
        'presspilot_allowed_origins',
        'Allowed Origins',
        'presspilot_allowed_origins_callback',
        'presspilot-agent',
        'presspilot_cors_section'
    );
    
    register_setting('presspilot_agent', 'presspilot_access_token_readonly');
}

function presspilot_cors_section_callback() {
    echo '<p>Configure which domains can access your WordPress site via the PressPilot Agent.</p>';
}

function presspilot_allowed_origins_callback() {
    $value = get_option('presspilot_allowed_origins', '');
    echo '<textarea name="presspilot_allowed_origins" rows="5" cols="50" class="large-text">' . esc_textarea($value) . '</textarea>';
    echo '<p class="description">Add one origin per line (e.g., https://your-app.netlify.app)</p>';
    echo '<p><strong>Currently allowed:</strong> https://majestic-otter-78f7e5.netlify.app</p>';
}

// Add access token display
add_action('presspilot_settings_after_api_key', 'presspilot_show_access_token');
function presspilot_show_access_token() {
    // Generate token if none exists
    $tokens = get_option('presspilot_access_tokens', array());
    if (empty($tokens)) {
        $token = PressPilot_CORS_Handler::generate_access_token();
    } else {
        // Get first valid token
        $token = array_key_first($tokens);
    }
    
    ?>
    <tr>
        <th scope="row">Access Token</th>
        <td>
            <input type="text" 
                   readonly 
                   value="<?php echo esc_attr($token); ?>" 
                   class="large-text code" 
                   id="presspilot_access_token"
                   style="background:#f0f0f0;" />
            <button type="button" 
                    class="button button-secondary" 
                    onclick="navigator.clipboard.writeText(document.getElementById('presspilot_access_token').value); this.textContent='Copied!';">
                Copy Token
            </button>
            <button type="button" 
                    class="button" 
                    onclick="location.href='<?php echo admin_url('admin.php?page=presspilot-agent&action=regenerate_token'); ?>'">
                Generate New Token
            </button>
            <p class="description">
                Use this token in your Netlify app to authenticate API requests. 
                <br><strong>Keep this token secure!</strong> It allows access to your WordPress site.
                <br>Token expires in 24 hours. Generate a new one when needed.
            </p>
        </td>
    </tr>
    <?php
}

// Handle token regeneration
add_action('admin_init', 'presspilot_handle_token_regeneration');
function presspilot_handle_token_regeneration() {
    if (isset($_GET['page']) && $_GET['page'] === 'presspilot-agent' && 
        isset($_GET['action']) && $_GET['action'] === 'regenerate_token') {
        
        // Clear old tokens
        update_option('presspilot_access_tokens', array());
        
        // Generate new token
        PressPilot_CORS_Handler::generate_access_token();
        
        // Redirect back to settings
        wp_redirect(admin_url('admin.php?page=presspilot-agent&token_regenerated=1'));
        exit;
    }
}

// Schedule token cleanup
if (!wp_next_scheduled('presspilot_cleanup_tokens')) {
    wp_schedule_event(time(), 'daily', 'presspilot_cleanup_tokens');
}
add_action('presspilot_cleanup_tokens', array('PressPilot_CORS_Handler', 'cleanup_expired_tokens'));
