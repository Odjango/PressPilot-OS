<?php
/**
 * Module: MCP Server
 * Purpose: Model Context Protocol server implementation for WordPress
 * Architecture: Hassan's Rule 1 - Modular atomic tools with single responsibility
 */

if (!defined('ABSPATH')) {
    exit;
}

class PressPilot_MCP_Server
{

    private $tools = array();
    private $tool_instances = array();

    /**
     * Initialize MCP server and load atomic tools
     */
    public function __construct()
    {
        $this->load_atomic_tools();
        $this->register_default_tools();
    }

    /**
     * Load atomic tool modules (Hassan's Rule 1: Modularization)
     */
    private function load_atomic_tools()
    {
        $tool_files = array(
            'content-tools.php',
            'design-tools.php',
            'structure-tools.php',
            'seo-tools.php',
            'commerce-tools.php',
            'safety-tools.php',
            'site-tools.php' // The Macro Tool
        );

        foreach ($tool_files as $file) {
            $file_path = PRESSPILOT_PLUGIN_DIR . 'modules/agent-tools/' . $file;
            if (file_exists($file_path)) {
                require_once $file_path;
            }
        }
    }

    /**
     * Register all atomic tools with their documentation
     * (Hassan's Rule 3: Documentation Injection)
     */
    private function register_default_tools()
    {
        // Content Tools
        if (class_exists('PressPilot_Content_Tools')) {
            $content_tools = new PressPilot_Content_Tools();
            $this->tool_instances['content'] = $content_tools;

            $this->register_tool('content.page.create', array(
                'callback' => array($content_tools, 'page_create'),
                'description' => 'Create a new WordPress page with title and content',
                'category' => 'content',
                'parameters' => array(
                    'title' => array('type' => 'string', 'required' => true),
                    'slug' => array('type' => 'string', 'required' => false),
                    'content' => array('type' => 'string', 'required' => false),
                    'template' => array('type' => 'string', 'required' => false),
                    'dry_run' => array('type' => 'boolean', 'required' => false)
                ),
                'documentation' => $this->get_wp_pages_api_docs(),
                'safe' => true,
                'reversible' => true
            ));

            $this->register_tool('content.page.update', array(
                'callback' => array($content_tools, 'page_update'),
                'description' => 'Update an existing WordPress page',
                'category' => 'content',
                'parameters' => array(
                    'page_id' => array('type' => 'integer', 'required' => true),
                    'title' => array('type' => 'string', 'required' => false),
                    'content' => array('type' => 'string', 'required' => false),
                    'dry_run' => array('type' => 'boolean', 'required' => false)
                ),
                'documentation' => $this->get_wp_pages_api_docs(),
                'safe' => true,
                'reversible' => true
            ));

            $this->register_tool('content.post.generate', array(
                'callback' => array($content_tools, 'post_generate'),
                'description' => 'Generate a new blog post with AI assistance',
                'category' => 'content',
                'parameters' => array(
                    'topic' => array('type' => 'string', 'required' => true),
                    'tone' => array('type' => 'string', 'required' => false),
                    'length' => array('type' => 'string', 'required' => false),
                    'dry_run' => array('type' => 'boolean', 'required' => false)
                ),
                'safe' => true,
                'reversible' => true
            ));
        }

        // Design Tools
        if (class_exists('PressPilot_Design_Tools')) {
            $design_tools = new PressPilot_Design_Tools();
            $this->tool_instances['design'] = $design_tools;

            $this->register_tool('design.colors.set', array(
                'callback' => array($design_tools, 'colors_set'),
                'description' => 'Update site color palette (primary, secondary, accent)',
                'category' => 'design',
                'parameters' => array(
                    'primary' => array('type' => 'string', 'required' => false),
                    'secondary' => array('type' => 'string', 'required' => false),
                    'accent' => array('type' => 'string', 'required' => false),
                    'dry_run' => array('type' => 'boolean', 'required' => false)
                ),
                'documentation' => $this->get_theme_json_docs(),
                'safe' => true,
                'reversible' => true
            ));

            $this->register_tool('design.pattern.apply', array(
                'callback' => array($design_tools, 'pattern_apply'),
                'description' => 'Apply a design pattern to a specific area',
                'category' => 'design',
                'parameters' => array(
                    'area' => array('type' => 'string', 'required' => true), // 'hero', 'footer', etc.
                    'pattern_id' => array('type' => 'string', 'required' => true),
                    'dry_run' => array('type' => 'boolean', 'required' => false)
                ),
                'safe' => true,
                'reversible' => true
            ));

            $this->register_tool('design.css.inject', array(
                'callback' => array($design_tools, 'css_inject'),
                'description' => 'Inject custom CSS for specific styling fixes',
                'category' => 'design',
                'parameters' => array(
                    'css_rules' => array('type' => 'string', 'required' => true),
                    'identifier' => array('type' => 'string', 'required' => false),
                    'dry_run' => array('type' => 'boolean', 'required' => false)
                ),
                'safe' => true,
                'reversible' => true
            ));

            $this->register_tool('design.layout.fix', array(
                'callback' => array($design_tools, 'layout_fix'),
                'description' => 'Apply common layout fixes (hero fullwidth, logo display, etc.)',
                'category' => 'design',
                'parameters' => array(
                    'fixes' => array('type' => 'array', 'required' => true), // ['hero_fullwidth', 'logo_display', etc.]
                    'dry_run' => array('type' => 'boolean', 'required' => false)
                ),
                'safe' => true,
                'reversible' => true
            ));
        }

        // Structure Tools
        if (class_exists('PressPilot_Structure_Tools')) {
            $structure_tools = new PressPilot_Structure_Tools();
            $this->tool_instances['structure'] = $structure_tools;

            $this->register_tool('structure.menu.add', array(
                'callback' => array($structure_tools, 'menu_add_item'),
                'description' => 'Add a new item to navigation menu',
                'category' => 'structure',
                'parameters' => array(
                    'menu_location' => array('type' => 'string', 'required' => true),
                    'page_id' => array('type' => 'integer', 'required' => false),
                    'label' => array('type' => 'string', 'required' => true),
                    'url' => array('type' => 'string', 'required' => false),
                    'dry_run' => array('type' => 'boolean', 'required' => false)
                ),
                'safe' => true,
                'reversible' => true
            ));

            $this->register_tool('structure.menu.reorder', array(
                'callback' => array($structure_tools, 'menu_reorder'),
                'description' => 'Reorder menu items by ID and position',
                'category' => 'structure',
                'parameters' => array(
                    'menu_location' => array('type' => 'string', 'required' => true),
                    'item_orders' => array('type' => 'array', 'required' => true),
                    'dry_run' => array('type' => 'boolean', 'required' => false)
                ),
                'safe' => true,
                'reversible' => true
            ));

            $this->register_tool('structure.menu.fix_order', array(
                'callback' => array($structure_tools, 'menu_fix_order'),
                'description' => 'Fix menu order by page names/slugs (easier than reorder)',
                'category' => 'structure',
                'parameters' => array(
                    'menu_location' => array('type' => 'string', 'required' => true),
                    'page_order' => array('type' => 'array', 'required' => true), // ['Home', 'About Us', 'Shop', 'Contact']
                    'dry_run' => array('type' => 'boolean', 'required' => false)
                ),
                'safe' => true,
                'reversible' => true
            ));
        }

        // SEO Tools
        if (class_exists('PressPilot_SEO_Tools')) {
            $seo_tools = new PressPilot_SEO_Tools();
            $this->tool_instances['seo'] = $seo_tools;

            $this->register_tool('seo.meta.set', array(
                'callback' => array($seo_tools, 'meta_set'),
                'description' => 'Set SEO meta title and description for a page',
                'category' => 'seo',
                'parameters' => array(
                    'post_id' => array('type' => 'integer', 'required' => true),
                    'title' => array('type' => 'string', 'required' => false),
                    'description' => array('type' => 'string', 'required' => false),
                    'dry_run' => array('type' => 'boolean', 'required' => false)
                ),
                'safe' => true,
                'reversible' => true
            ));
        }

        // Safety Tools
        if (class_exists('PressPilot_Safety_Tools')) {
            $safety_tools = new PressPilot_Safety_Tools();
            $this->tool_instances['safety'] = $safety_tools;

            $this->register_tool('safety.backup.create', array(
                'callback' => array($safety_tools, 'backup_create'),
                'description' => 'Create a backup of current site state',
                'category' => 'safety',
                'parameters' => array(
                    'scope' => array('type' => 'string', 'required' => false) // 'full', 'content', 'theme'
                ),
                'safe' => true,
                'reversible' => false
            ));

            $this->register_tool('safety.undo.execute', array(
                'callback' => array($safety_tools, 'undo_execute'),
                'description' => 'Undo a previous action using its undo token',
                'category' => 'safety',
                'parameters' => array(
                    'undo_token' => array('type' => 'string', 'required' => true)
                ),
                'safe' => true,
                'reversible' => false
            ));
        }

        // Site Tools (The Magic Button)
        if (class_exists('PressPilot_Site_Tools')) {
            $site_tools = new PressPilot_Site_Tools();
            $this->tool_instances['site'] = $site_tools;

            $this->register_tool('site.generate_complete', array(
                'callback' => array($site_tools, 'generate_complete'),
                'description' => 'Generate a complete website from scratch (Colors, Theme, Content, Assembly)',
                'category' => 'site',
                'parameters' => array(
                    'business_name' => array('type' => 'string', 'required' => true),
                    'business_type' => array('type' => 'string', 'required' => true),
                    'business_description' => array('type' => 'string', 'required' => true),
                    'logo_url' => array('type' => 'string', 'required' => false),
                    'language' => array('type' => 'string', 'required' => false),
                    'tagline' => array('type' => 'string', 'required' => false)
                ),
                'safe' => true,
                'reversible' => false
            ));
        }
    }

    /**
     * Register a single atomic tool
     */
    public function register_tool($name, $config)
    {
        $this->tools[$name] = array_merge(array(
            'name' => $name,
            'callback' => null,
            'description' => 'No description provided',
            'category' => 'general',
            'parameters' => array(),
            'documentation' => '',
            'safe' => false,
            'reversible' => false
        ), $config);
    }

    /**
     * Execute a tool with safety checks and pattern enforcement
     * (Hassan's Rule 2: Patterns)
     */
    public function execute_tool($tool_name, $parameters)
    {
        $start_time = microtime(true);

        // Validate tool exists
        if (!isset($this->tools[$tool_name])) {
            throw new Exception("Tool '{$tool_name}' not found");
        }

        $tool = $this->tools[$tool_name];

        // Validate parameters
        $validated_params = $this->validate_parameters($tool['parameters'], $parameters);

        // Execute tool callback
        if (!is_callable($tool['callback'])) {
            throw new Exception("Tool '{$tool_name}' callback is not callable");
        }

        $result = call_user_func($tool['callback'], $validated_params);

        // Ensure result follows PressPilot pattern
        $formatted_result = $this->format_tool_result($result, $tool_name, microtime(true) - $start_time);

        // Log execution for undo system
        if ($tool['reversible'] && !empty($formatted_result['undo_token'])) {
            $this->log_reversible_action($tool_name, $validated_params, $formatted_result);
        }

        return $formatted_result;
    }

    /**
     * Validate tool parameters
     */
    private function validate_parameters($schema, $parameters)
    {
        $validated = array();

        foreach ($schema as $param_name => $param_config) {
            $is_required = $param_config['required'] ?? false;
            $param_type = $param_config['type'] ?? 'string';
            $param_value = $parameters[$param_name] ?? null;

            // Check required parameters
            if ($is_required && empty($param_value)) {
                throw new Exception("Required parameter '{$param_name}' is missing");
            }

            // Type validation and sanitization
            if ($param_value !== null) {
                $validated[$param_name] = $this->sanitize_parameter($param_value, $param_type);
            }
        }

        // Add any extra parameters that aren't in schema (for flexibility)
        foreach ($parameters as $key => $value) {
            if (!isset($validated[$key])) {
                $validated[$key] = $this->sanitize_parameter($value, 'string');
            }
        }

        return $validated;
    }

    /**
     * Sanitize parameter based on type
     */
    private function sanitize_parameter($value, $type)
    {
        switch ($type) {
            case 'integer':
                return intval($value);
            case 'boolean':
                return (bool) $value;
            case 'array':
                return is_array($value) ? $value : array();
            case 'string':
            default:
                return sanitize_text_field($value);
        }
    }

    /**
     * Format tool result to follow PressPilot pattern
     * (Hassan's Rule 2: Patterns)
     */
    private function format_tool_result($result, $tool_name, $execution_time)
    {
        // If result is already properly formatted, return as-is
        if (is_array($result) && isset($result['success'])) {
            $result['tool_name'] = $tool_name;
            $result['execution_time'] = round($execution_time * 1000, 2) . 'ms';
            return $result;
        }

        // Format raw result into pattern
        return array(
            'success' => true,
            'data' => $result,
            'preview' => "Executed {$tool_name} successfully",
            'undo_token' => null,
            'next_suggestions' => array(),
            'tool_name' => $tool_name,
            'execution_time' => round($execution_time * 1000, 2) . 'ms'
        );
    }

    /**
     * Log reversible actions for undo system
     */
    private function log_reversible_action($tool_name, $parameters, $result)
    {
        global $wpdb;

        $table_name = $wpdb->prefix . 'presspilot_undo_log';

        $wpdb->insert(
            $table_name,
            array(
                'undo_token' => $result['undo_token'],
                'user_id' => get_current_user_id(),
                'tool_name' => $tool_name,
                'parameters' => json_encode($parameters),
                'undo_data' => json_encode($result['undo_data'] ?? array()),
                'created_at' => current_time('mysql'),
                'expires_at' => date('Y-m-d H:i:s', strtotime('+7 days')) // 7 day expiry
            ),
            array('%s', '%d', '%s', '%s', '%s', '%s', '%s')
        );
    }

    /**
     * Get registered tools list
     */
    public function get_registered_tools()
    {
        return $this->tools;
    }

    /**
     * WordPress Pages API Documentation (Hassan's Rule 3)
     */
    private function get_wp_pages_api_docs()
    {
        return "
WordPress REST API - Pages Endpoint:

GET /wp/v2/pages
- Returns: Array of page objects
- Query params: per_page, page, search, status

POST /wp/v2/pages  
Request Body:
{
  \"title\": \"Page Title\",
  \"content\": \"HTML content with Gutenberg blocks\",
  \"status\": \"publish|draft|private\",
  \"slug\": \"page-slug\",
  \"template\": \"page-template-name\"
}

Response (Success):
{
  \"id\": 123,
  \"title\": {\"rendered\": \"Page Title\"},
  \"content\": {\"rendered\": \"HTML content\"},
  \"link\": \"https://site.com/page-slug\",
  \"status\": \"publish\"
}

Gutenberg Block Structure:
<!-- wp:heading {\"level\":2} -->
<h2>Section Title</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Paragraph content goes here.</p>
<!-- /wp:paragraph -->
        ";
    }

    /**
     * Theme.json Documentation (Hassan's Rule 3)
     */
    private function get_theme_json_docs()
    {
        return "
WordPress theme.json Structure:

{
  \"version\": 2,
  \"settings\": {
    \"color\": {
      \"palette\": [
        {\"name\": \"Primary\", \"slug\": \"primary\", \"color\": \"#007cba\"},
        {\"name\": \"Secondary\", \"slug\": \"secondary\", \"color\": \"#005a87\"},
        {\"name\": \"Accent\", \"slug\": \"accent\", \"color\": \"#ff6900\"}
      ]
    },
    \"typography\": {
      \"fontSizes\": [
        {\"name\": \"Small\", \"slug\": \"small\", \"size\": \"14px\"},
        {\"name\": \"Medium\", \"slug\": \"medium\", \"size\": \"18px\"},
        {\"name\": \"Large\", \"slug\": \"large\", \"size\": \"24px\"}
      ]
    }
  }
}

Color Usage in Blocks:
<!-- wp:heading {\"textColor\":\"primary\"} -->
<h2 class=\"has-primary-color\">Colored Heading</h2>
<!-- /wp:heading -->
        ";
    }
}

/**
 * Initialize MCP Server on plugin load
 */
function presspilot_init_mcp_server()
{
    global $presspilot_mcp_server;
    $presspilot_mcp_server = new PressPilot_MCP_Server();
    return $presspilot_mcp_server;
}

// Initialize when WordPress is loaded
add_action('init', 'presspilot_init_mcp_server');