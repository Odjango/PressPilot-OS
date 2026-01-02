<?php
/**
 * Module: Secure Settings
 * Purpose: Encrypted API key storage and security settings management
 * Security: Industry-standard encryption for sensitive data
 */

if (!defined('ABSPATH')) {
    exit;
}

class PressPilot_Secure_Settings {
    
    private $encryption_method = 'AES-256-CBC';
    
    /**
     * Initialize settings hooks
     */
    public function __construct() {
        add_action('admin_menu', array($this, 'add_settings_page'), 20);
        add_action('admin_init', array($this, 'register_settings'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_settings_assets'));
    }
    
    /**
     * Add settings submenu page
     */
    public function add_settings_page() {
        add_submenu_page(
            'presspilot',
            'PressPilot Settings',
            'Settings',
            'manage_options',
            'presspilot-settings',
            array($this, 'render_settings_page')
        );
    }
    
    /**
     * Register settings
     */
    public function register_settings() {
        register_setting('presspilot_settings', 'presspilot_settings', array(
            'sanitize_callback' => array($this, 'sanitize_settings')
        ));
    }
    
    /**
     * Sanitize and encrypt settings before saving
     */
    public function sanitize_settings($input) {
        $sanitized = array();
        
        // Handle OpenAI API Key
        if (isset($input['openai_api_key']) && !empty($input['openai_api_key'])) {
            $api_key = sanitize_text_field($input['openai_api_key']);
            
            // Only update if it's not the masked placeholder
            if ($api_key !== '••••••••••••••••••••') {
                // Encrypt the API key
                $sanitized['openai_api_key_encrypted'] = $this->encrypt($api_key);
                
                // Test the API key
                $test_result = $this->test_openai_key($api_key);
                if (is_wp_error($test_result)) {
                    add_settings_error(
                        'presspilot_settings',
                        'invalid_api_key',
                        'Warning: API key saved but validation failed: ' . $test_result->get_error_message()
                    );
                } else {
                    add_settings_error(
                        'presspilot_settings',
                        'api_key_valid',
                        'API key saved and validated successfully!',
                        'success'
                    );
                }
            } else {
                // Keep existing encrypted key
                $current = get_option('presspilot_settings', array());
                if (isset($current['openai_api_key_encrypted'])) {
                    $sanitized['openai_api_key_encrypted'] = $current['openai_api_key_encrypted'];
                }
            }
        }
        
        // Handle other security settings
        $sanitized['https_required'] = isset($input['https_required']) ? true : false;
        $sanitized['rate_limiting_enabled'] = isset($input['rate_limiting_enabled']) ? true : false;
        $sanitized['rate_limit_attempts'] = absint($input['rate_limit_attempts'] ?? 5);
        $sanitized['rate_limit_window'] = absint($input['rate_limit_window'] ?? 15);
        
        return $sanitized;
    }
    
    /**
     * Render settings page
     */
    public function render_settings_page() {
        if (!current_user_can('manage_options')) {
            wp_die(__('You do not have sufficient permissions to access this page.'));
        }
        
        $settings = get_option('presspilot_settings', array());
        $has_api_key = !empty($settings['openai_api_key_encrypted']);
        
        ?>
        <div class="wrap presspilot-settings">
            <h1>🔒 PressPilot Security Settings</h1>
            
            <div class="notice notice-info">
                <p><strong>Security First:</strong> All sensitive data is encrypted in your database using WordPress secret keys.</p>
            </div>
            
            <form method="post" action="options.php">
                <?php settings_fields('presspilot_settings'); ?>
                
                <table class="form-table" role="presentation">
                    
                    <!-- API Key Section -->
                    <tr>
                        <th scope="row" colspan="2">
                            <h2>🔑 API Key Management</h2>
                        </th>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="openai_api_key">OpenAI API Key</label>
                        </th>
                        <td>
                            <input 
                                type="password" 
                                id="openai_api_key" 
                                name="presspilot_settings[openai_api_key]" 
                                value="<?php echo $has_api_key ? '••••••••••••••••••••' : ''; ?>" 
                                class="regular-text" 
                                placeholder="sk-proj-..."
                                autocomplete="off"
                            />
                            <p class="description">
                                <?php if ($has_api_key): ?>
                                    ✅ API key is configured and encrypted. Leave as-is to keep current key, or enter new key to update.
                                <?php else: ?>
                                    ⚠️ No API key configured. Get your key from <a href="https://platform.openai.com/api-keys" target="_blank">OpenAI Platform</a>
                                <?php endif; ?>
                            </p>
                            <button type="button" class="button" onclick="toggleApiKeyVisibility()">
                                👁️ Show/Hide Key
                            </button>
                            <?php if ($has_api_key): ?>
                                <button type="button" class="button" onclick="testApiKey()">
                                    🧪 Test Connection
                                </button>
                                <span id="api-test-result"></span>
                            <?php endif; ?>
                        </td>
                    </tr>
                    
                    <!-- Security Settings Section -->
                    <tr>
                        <th scope="row" colspan="2">
                            <h2>🛡️ Security Settings</h2>
                        </th>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="https_required">Require HTTPS</label>
                        </th>
                        <td>
                            <input 
                                type="checkbox" 
                                id="https_required" 
                                name="presspilot_settings[https_required]" 
                                value="1"
                                <?php checked(!empty($settings['https_required']), true); ?>
                            />
                            <label for="https_required">
                                Reject API requests over non-secure HTTP connections
                            </label>
                            <p class="description">
                                <?php if (is_ssl()): ?>
                                    ✅ Your site is using HTTPS. <strong>Recommended: Enable this setting.</strong>
                                <?php else: ?>
                                    ⚠️ Your site is not using HTTPS. Enable SSL certificate first.
                                <?php endif; ?>
                            </p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="rate_limiting_enabled">Rate Limiting</label>
                        </th>
                        <td>
                            <input 
                                type="checkbox" 
                                id="rate_limiting_enabled" 
                                name="presspilot_settings[rate_limiting_enabled]" 
                                value="1"
                                <?php checked(!empty($settings['rate_limiting_enabled']), true); ?>
                            />
                            <label for="rate_limiting_enabled">
                                Enable rate limiting on authentication endpoint
                            </label>
                            <p class="description">
                                <strong>Recommended: Enable</strong> - Prevents brute force attacks
                            </p>
                            
                            <div id="rate-limit-options" style="margin-top: 10px; <?php echo empty($settings['rate_limiting_enabled']) ? 'display:none;' : ''; ?>">
                                <label>
                                    Max attempts: 
                                    <input 
                                        type="number" 
                                        name="presspilot_settings[rate_limit_attempts]" 
                                        value="<?php echo esc_attr($settings['rate_limit_attempts'] ?? 5); ?>" 
                                        min="3" 
                                        max="20" 
                                        style="width: 60px;"
                                    />
                                </label>
                                <label style="margin-left: 15px;">
                                    Time window: 
                                    <input 
                                        type="number" 
                                        name="presspilot_settings[rate_limit_window]" 
                                        value="<?php echo esc_attr($settings['rate_limit_window'] ?? 15); ?>" 
                                        min="5" 
                                        max="60" 
                                        style="width: 60px;"
                                    /> minutes
                                </label>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Site Information -->
                    <tr>
                        <th scope="row" colspan="2">
                            <h2>ℹ️ Site Information</h2>
                        </th>
                    </tr>
                    
                    <tr>
                        <th scope="row">REST API Endpoint</th>
                        <td>
                            <code><?php echo esc_url(rest_url('presspilot/v1/')); ?></code>
                            <p class="description">
                                Use this URL in your SaaS application to connect to WordPress
                            </p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">WordPress Version</th>
                        <td><?php echo get_bloginfo('version'); ?></td>
                    </tr>
                    
                    <tr>
                        <th scope="row">PressPilot Version</th>
                        <td><?php echo PRESSPILOT_VERSION; ?></td>
                    </tr>
                    
                    <tr>
                        <th scope="row">PHP Version</th>
                        <td><?php echo PHP_VERSION; ?></td>
                    </tr>
                    
                    <tr>
                        <th scope="row">SSL Status</th>
                        <td>
                            <?php if (is_ssl()): ?>
                                <span style="color: green;">✅ HTTPS Enabled</span>
                            <?php else: ?>
                                <span style="color: orange;">⚠️ HTTPS Not Enabled</span>
                                <p class="description">
                                    Install an SSL certificate for secure API communication. 
                                    <a href="https://letsencrypt.org/" target="_blank">Let's Encrypt</a> offers free certificates.
                                </p>
                            <?php endif; ?>
                        </td>
                    </tr>
                    
                </table>
                
                <?php submit_button('💾 Save Security Settings'); ?>
            </form>
            
            <script>
            function toggleApiKeyVisibility() {
                const input = document.getElementById('openai_api_key');
                input.type = input.type === 'password' ? 'text' : 'password';
            }
            
            function testApiKey() {
                const resultSpan = document.getElementById('api-test-result');
                resultSpan.innerHTML = ' ⏳ Testing...';
                
                fetch('<?php echo admin_url('admin-ajax.php'); ?>', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                    body: 'action=presspilot_test_api_key&nonce=<?php echo wp_create_nonce('presspilot_test_key'); ?>'
                })
                .then(r => r.json())
                .then(data => {
                    if (data.success) {
                        resultSpan.innerHTML = ' <span style="color:green;">✅ Connection successful!</span>';
                    } else {
                        resultSpan.innerHTML = ' <span style="color:red;">❌ ' + data.data + '</span>';
                    }
                })
                .catch(err => {
                    resultSpan.innerHTML = ' <span style="color:red;">❌ Test failed</span>';
                });
            }
            
            document.getElementById('rate_limiting_enabled')?.addEventListener('change', function() {
                document.getElementById('rate-limit-options').style.display = this.checked ? 'block' : 'none';
            });
            </script>
            
            <style>
            .presspilot-settings h2 {
                border-bottom: 2px solid #0073aa;
                padding-bottom: 10px;
                margin-top: 30px;
            }
            .presspilot-settings code {
                background: #f0f0f1;
                padding: 5px 10px;
                border-radius: 3px;
                font-size: 13px;
            }
            </style>
        </div>
        <?php
    }
    
    /**
     * Enqueue settings page assets
     */
    public function enqueue_settings_assets($hook) {
        if ($hook !== 'presspilot_page_presspilot-settings') {
            return;
        }
        
        wp_enqueue_style('presspilot-settings', PRESSPILOT_ASSETS_URL . 'admin.css', array(), PRESSPILOT_VERSION);
    }
    
    /**
     * Encrypt sensitive data
     */
    private function encrypt($data) {
        if (empty($data)) {
            return '';
        }
        
        $key = $this->get_encryption_key();
        $iv = openssl_random_pseudo_bytes(openssl_cipher_iv_length($this->encryption_method));
        
        $encrypted = openssl_encrypt($data, $this->encryption_method, $key, 0, $iv);
        
        // Store IV with encrypted data
        return base64_encode($iv . '::' . $encrypted);
    }
    
    /**
     * Decrypt sensitive data
     */
    public function decrypt($encrypted_data) {
        if (empty($encrypted_data)) {
            return '';
        }
        
        $key = $this->get_encryption_key();
        $decoded = base64_decode($encrypted_data);
        
        if ($decoded === false) {
            return '';
        }
        
        $parts = explode('::', $decoded, 2);
        if (count($parts) !== 2) {
            return '';
        }
        
        list($iv, $encrypted) = $parts;
        
        return openssl_decrypt($encrypted, $this->encryption_method, $key, 0, $iv);
    }
    
    /**
     * Get encryption key from WordPress secret constants
     */
    private function get_encryption_key() {
        // Use WordPress secret keys for encryption
        $key = AUTH_KEY . SECURE_AUTH_KEY . LOGGED_IN_KEY . NONCE_KEY;
        // Hash to get consistent length for AES-256
        return hash('sha256', $key, true);
    }
    
    /**
     * Test OpenAI API key
     */
    public function test_openai_key($api_key) {
        $response = wp_remote_get('https://api.openai.com/v1/models', array(
            'headers' => array(
                'Authorization' => 'Bearer ' . $api_key
            ),
            'timeout' => 10
        ));
        
        if (is_wp_error($response)) {
            return $response;
        }
        
        $code = wp_remote_retrieve_response_code($response);
        if ($code !== 200) {
            return new WP_Error('invalid_key', 'API key validation failed (HTTP ' . $code . ')');
        }
        
        return true;
    }
}

/**
 * Global function to get decrypted API key
 */
function presspilot_get_api_key() {
    $settings = get_option('presspilot_settings', array());
    
    if (empty($settings['openai_api_key_encrypted'])) {
        return false;
    }
    
    $secure_settings = new PressPilot_Secure_Settings();
    return $secure_settings->decrypt($settings['openai_api_key_encrypted']);
}

/**
 * AJAX handler for testing API key
 */
add_action('wp_ajax_presspilot_test_api_key', function() {
    check_ajax_referer('presspilot_test_key', 'nonce');
    
    if (!current_user_can('manage_options')) {
        wp_send_json_error('Insufficient permissions');
    }
    
    $api_key = presspilot_get_api_key();
    if (!$api_key) {
        wp_send_json_error('No API key configured');
    }
    
    $secure_settings = new PressPilot_Secure_Settings();
    $test = $secure_settings->test_openai_key($api_key);
    
    if (is_wp_error($test)) {
        wp_send_json_error($test->get_error_message());
    }
    
    wp_send_json_success('API key is valid');
});

// Initialize secure settings
new PressPilot_Secure_Settings();
