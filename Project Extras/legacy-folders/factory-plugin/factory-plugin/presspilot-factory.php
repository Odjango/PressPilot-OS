<?php
/**
 * Plugin Name: PressPilot Factory
 * Plugin URI: https://presspilot.io
 * Description: WordPress FSE Theme Factory - Generate complete themes via REST API
 * Version: 1.0.0
 * Author: PressPilot
 * Author URI: https://presspilot.io
 * License: GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain: presspilot-factory
 * Requires at least: 6.4
 * Requires PHP: 8.0
 */

if (!defined('ABSPATH')) {
    exit;
}

define('PRESSPILOT_FACTORY_VERSION', '1.0.0');
define('PRESSPILOT_FACTORY_PATH', plugin_dir_path(__FILE__));
define('PRESSPILOT_FACTORY_URL', plugin_dir_url(__FILE__));
define('PRESSPILOT_FACTORY_INCLUDES', PRESSPILOT_FACTORY_PATH . 'includes/');
define('PRESSPILOT_FACTORY_PATTERNS', PRESSPILOT_FACTORY_PATH . 'patterns/');
define('PRESSPILOT_FACTORY_VARIATIONS', PRESSPILOT_FACTORY_PATH . 'variations/');

/**
 * PSR-4 style autoloader for PressPilot Factory classes
 */
spl_autoload_register(function ($class) {
    $prefix = 'PressPilot_Factory_';

    if (strpos($class, $prefix) !== 0) {
        return;
    }

    $class_name = str_replace($prefix, '', $class);
    $class_name = strtolower(str_replace('_', '-', $class_name));
    $file = PRESSPILOT_FACTORY_INCLUDES . 'class-' . $class_name . '.php';

    if (file_exists($file)) {
        require_once $file;
    }
});

/**
 * Main plugin class
 */
final class PressPilot_Factory
{

    private static $instance = null;

    private $api_handler;
    private $content_builder;
    private $pattern_loader;
    private $brand_applier;
    private $navigation_builder;
    private $theme_exporter;
    private $static_exporter;
    private $cleanup_handler;
    private $image_provider;

    public static function instance()
    {
        if (is_null(self::$instance)) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct()
    {
        $this->init_hooks();
    }

    private function init_hooks()
    {
        register_activation_hook(__FILE__, [$this, 'activate']);
        register_deactivation_hook(__FILE__, [$this, 'deactivate']);

        add_action('plugins_loaded', [$this, 'init']);
        add_action('rest_api_init', [$this, 'register_rest_routes']);
    }

    public function activate()
    {
        // Create required directories
        $upload_dir = wp_upload_dir();
        $factory_dir = $upload_dir['basedir'] . '/presspilot-factory';

        $dirs = [
            $factory_dir,
            $factory_dir . '/themes',
            $factory_dir . '/static',
            $factory_dir . '/temp',
        ];

        foreach ($dirs as $dir) {
            if (!file_exists($dir)) {
                wp_mkdir_p($dir);
            }
        }

        // Create .htaccess for security
        $htaccess = $factory_dir . '/.htaccess';
        if (!file_exists($htaccess)) {
            file_put_contents($htaccess, "Options -Indexes\n");
        }

        // Flush rewrite rules
        flush_rewrite_rules();

        // Set version in options
        update_option('presspilot_factory_version', PRESSPILOT_FACTORY_VERSION);
    }

    public function deactivate()
    {
        flush_rewrite_rules();
    }

    public function init()
    {
        // Load text domain
        load_plugin_textdomain('presspilot-factory', false, dirname(plugin_basename(__FILE__)) . '/languages');

        // Initialize components
        $this->image_provider = new PressPilot_Factory_Image_Provider();
        $this->pattern_loader = new PressPilot_Factory_Pattern_Loader($this->image_provider);
        $this->brand_applier = new PressPilot_Factory_Brand_Applier();
        $this->cleanup_handler = new PressPilot_Factory_Cleanup_Handler();
        $this->theme_exporter = new PressPilot_Factory_Theme_Exporter($this->brand_applier);
        $this->static_exporter = new PressPilot_Factory_Static_Exporter();
        $this->api_handler = new PressPilot_Factory_Api_Handler(
            $this->cleanup_handler,
            $this->brand_applier,
            null, // Content Builder Removed (Legacy Refactor)
            null, // Navigation Builder Removed (Legacy Refactor)
            $this->theme_exporter,
            $this->static_exporter
        );
    }

    public function register_rest_routes()
    {
        if ($this->api_handler) {
            $this->api_handler->register_routes();
        }
    }

    /**
     * Get component instance
     */
    public function get_component($name)
    {
        $property = $name;
        if (property_exists($this, $property)) {
            return $this->$property;
        }
        return null;
    }
}

/**
 * Returns the main instance of PressPilot_Factory
 */
function presspilot_factory()
{
    return PressPilot_Factory::instance();
}

// Initialize plugin
presspilot_factory();
