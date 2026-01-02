<?php
/**
 * Module: Input Handler
 * Purpose: Handle business name, type, and logo upload
 * Architecture: Modular - can be updated independently
 */

if (!defined('ABSPATH')) {
    exit;
}

class PressPilot_Input_Handler {
    
    /**
     * Render input form in admin
     */
    public function render_form() {
        // Check for existing PressPilot pages
        $existing_pages = $this->check_existing_pages();
        ?>
        <div class="wrap presspilot-wrap">
            <h1>🚀 PressPilot - AI WordPress Site Generator</h1>
            <p class="description">Generate a complete 5-page WordPress website in 90 seconds</p>
            
            <?php if (!empty($existing_pages)) : ?>
            <div class="notice notice-warning">
                <p><strong>⚠️ Warning:</strong> Previous PressPilot pages detected. Generating a new site will create duplicate pages.</p>
                <p><strong>Recommended:</strong> Delete existing pages first:</p>
                <ul>
                    <?php foreach ($existing_pages as $page) : ?>
                    <li><?php echo esc_html($page['title']); ?> - <a href="<?php echo get_delete_post_link($page['id']); ?>">Delete</a> | <a href="<?php echo get_edit_post_link($page['id']); ?>">Edit</a></li>
                    <?php endforeach; ?>
                </ul>
                <p><em>Or click "Generate" to create new pages alongside existing ones.</em></p>
            </div>
            <?php endif; ?>
            
            <div class="presspilot-container">
                <div class="presspilot-form-card">
                    <h2>Step 1: Tell Us About Your Business</h2>
                    
                    <form id="presspilot-form" method="post" enctype="multipart/form-data">
                        
                        <!-- Business Name -->
                        <div class="form-group">
                            <label for="business_name">Business Name *</label>
                            <input 
                                type="text" 
                                id="business_name" 
                                name="business_name" 
                                class="form-control"
                                placeholder="e.g., Joe's Pizza House"
                                required
                            />
                        </div>
                        
                        <!-- Business Tagline -->
                        <div class="form-group">
                            <label for="business_tagline">Business Tagline</label>
                            <input 
                                type="text" 
                                id="business_tagline" 
                                name="business_tagline" 
                                class="form-control"
                                placeholder="Short catchy phrase that summarizes your value (e.g., 'Advanced Computing Solutions for Everyone')"
                            />
                            <small class="form-text">📝 Optional but recommended - appears in hero sections and helps AI understand your brand</small>
                        </div>
                        
                        <!-- Business Description -->
                        <div class="form-group">
                            <label for="business_description">Business Description *</label>
                            <textarea 
                                id="business_description" 
                                name="business_description" 
                                class="form-control"
                                rows="3"
                                placeholder="Describe what your business does in 2-3 lines. This helps AI generate accurate content. (e.g., 'We sell computer hardware, software, and tech accessories for gamers and professionals.')"
                                required
                            ></textarea>
                            <small class="form-text">💡 This prevents AI confusion (e.g., 'Apple Pie Tech Store' being treated as a restaurant)</small>
                        </div>
                        
                        <!-- Content Language -->
                        <div class="form-group">
                            <label for="content_language">Content Language *</label>
                            <select id="content_language" name="content_language" class="form-control" required>
                                <option value="en">🇺🇸 English</option>
                                <option value="es">🇪🇸 Spanish (Español)</option>
                                <option value="fr">🇫🇷 French (Français)</option>
                                <option value="de">🇩🇪 German (Deutsch)</option>
                                <option value="it">🇮🇹 Italian (Italiano)</option>
                                <option value="pt">🇧🇷 Portuguese (Português)</option>
                                <option value="nl">🇳🇱 Dutch (Nederlands)</option>
                                <option value="zh">🇨🇳 Chinese (中文)</option>
                                <option value="ja">🇯🇵 Japanese (日本語)</option>
                                <option value="ko">🇰🇷 Korean (한국어)</option>
                                <option value="ar">🇸🇦 Arabic (العربية)</option>
                                <option value="hi">🇮🇳 Hindi (हिन्दी)</option>
                                <option value="ru">🇷🇺 Russian (Русский)</option>
                            </select>
                            <small class="form-text">🌍 AI will generate all website content in the selected language</small>
                        </div>
                        
                        <!-- Business Type -->
                        <div class="form-group">
                            <label for="business_type">Business Type *</label>
                            <select id="business_type" name="business_type" class="form-control" required>
                                <option value="">-- Select Your Industry --</option>
                                <option value="restaurant">🍕 Restaurant / Food Service</option>
                                <option value="fitness">💪 Fitness / Gym / Wellness</option>
                                <option value="corporate">💼 Corporate / Professional Services</option>
                                <option value="ecommerce">🛒 E-commerce / Online Store</option>
                            </select>
                        </div>
                        
                        <!-- Logo Upload -->
                        <div class="form-group">
                            <label for="business_logo">Business Logo *</label>
                            <div class="logo-upload-area" id="logo-upload-area">
                                <div class="upload-placeholder">
                                    <span class="dashicons dashicons-upload"></span>
                                    <p>Click to upload or drag & drop</p>
                                    <small>PNG, JPG, or SVG (Max 5MB)</small>
                                </div>
                                <img id="logo-preview" src="" alt="Logo preview" style="display:none;" />
                            </div>
                            <input 
                                type="file" 
                                id="business_logo" 
                                name="business_logo" 
                                accept="image/*"
                                style="display:none;"
                                required
                            />
                        </div>
                        
                        <!-- Generate Button -->
                        <div class="form-group">
                            <button type="submit" class="button button-primary button-hero" id="generate-btn">
                                <span class="dashicons dashicons-magic"></span>
                                Generate My Website
                            </button>
                        </div>
                        
                    </form>
                    
                    <!-- Progress Section -->
                    <div id="generation-progress" style="display:none;">
                        <div class="progress-bar">
                            <div class="progress-fill" id="progress-fill"></div>
                        </div>
                        <p class="progress-text" id="progress-text">Analyzing your logo...</p>
                    </div>
                    
                    <!-- Results Section -->
                    <div id="generation-results" style="display:none;">
                        <h2>✨ Your Website is Ready!</h2>
                        <div id="results-content"></div>
                    </div>
                    
                </div>
                
                <!-- Info Sidebar -->
                <div class="presspilot-sidebar">
                    <div class="info-card">
                        <h3>What You'll Get:</h3>
                        <ul class="feature-list">
                            <li><span class="dashicons dashicons-yes"></span> Professional Home Page</li>
                            <li><span class="dashicons dashicons-yes"></span> About Us Page</li>
                            <li><span class="dashicons dashicons-yes"></span> Services/Products Page</li>
                            <li><span class="dashicons dashicons-yes"></span> Contact Page</li>
                            <li><span class="dashicons dashicons-yes"></span> Blog/News Page</li>
                        </ul>
                    </div>
                    
                    <div class="info-card">
                        <h3>⚡ Powered By:</h3>
                        <ul class="tech-list">
                            <li>OpenAI GPT-3.5 Turbo</li>
                            <li>WordPress.org Themes</li>
                            <li>Smart Color Extraction</li>
                            <li>Industry Best Practices</li>
                        </ul>
                    </div>
                    
                    <div class="info-card version-info">
                        <small>PressPilot MVP v1.0.0</small>
                        <small>Built with modular architecture</small>
                    </div>
                </div>
            </div>
        </div>
        <?php
    }
    
    /**
     * Validate uploaded logo
     */
    public function validate_logo($file) {
        $allowed_types = array('image/jpeg', 'image/png', 'image/svg+xml', 'image/webp');
        $max_size = 5 * 1024 * 1024; // 5MB
        
        if (!in_array($file['type'], $allowed_types)) {
            throw new Exception('Invalid file type. Please upload PNG, JPG, or SVG.');
        }
        
        if ($file['size'] > $max_size) {
            throw new Exception('File too large. Maximum size is 5MB.');
        }
        
        return true;
    }
    
    /**
     * Check for existing PressPilot-generated pages
     */
    public function check_existing_pages() {
        $pages = get_posts(array(
            'post_type' => 'page',
            'post_status' => 'publish,draft',
            'posts_per_page' => -1,
            'meta_query' => array(
                array(
                    'key' => '_presspilot_generated',
                    'compare' => 'EXISTS'
                )
            )
        ));
        
        $existing = array();
        foreach ($pages as $page) {
            $existing[] = array(
                'id' => $page->ID,
                'title' => $page->post_title
            );
        }
        
        return $existing;
    }
    
    /**
     * Handle logo upload to WordPress media library
     */
    public function upload_logo($file) {
        require_once(ABSPATH . 'wp-admin/includes/file.php');
        require_once(ABSPATH . 'wp-admin/includes/media.php');
        require_once(ABSPATH . 'wp-admin/includes/image.php');
        
        $upload = wp_handle_upload($file, array('test_form' => false));
        
        if (isset($upload['error'])) {
            throw new Exception($upload['error']);
        }
        
        return $upload['url'];
    }
}
