<?php
// Mock WordPress Environment
define('ABSPATH', __DIR__ . '/');
define('PRESSPILOT_PLUGIN_DIR', __DIR__ . '/4 Antigravity/presspilot-agent-plugin-v6.3/');

// Mock WP Functions
function sanitize_text_field($str)
{
    return trim($str);
}
function sanitize_title($str)
{
    return strtolower(str_replace(' ', '-', $str));
}
function wp_kses_post($str)
{
    return $str;
}
function get_page_by_path($path)
{
    return null;
} // Simulate no duplicate
function get_current_user_id()
{
    return 1;
}
function current_time($type)
{
    return date('Y-m-d H:i:s');
}
function is_wp_error($thing)
{
    return false;
}
function get_permalink($id)
{
    return "http://example.com/?p=$id";
}
function get_edit_post_link($id, $context)
{
    return "http://example.com/wp-admin/post.php?post=$id&action=edit";
}
function esc_url($url)
{
    return $url;
}
function esc_html($html)
{
    return htmlspecialchars($html);
}
function esc_attr($attr)
{
    return htmlspecialchars($attr);
}
function update_post_meta($id, $key, $val)
{
    return true;
}
function update_option($opt, $val)
{
    return true;
}
function get_option($opt)
{
    return false;
}
function set_transient($name, $val, $exp)
{
    return true;
}

// Capture inserted posts
$inserted_posts = [];
function wp_insert_post($data)
{
    global $inserted_posts;
    $id = count($inserted_posts) + 100;
    $inserted_posts[$id] = $data;
    return $id;
}
function get_post($id)
{
    global $inserted_posts;
    return isset($inserted_posts[$id]) ? (object) $inserted_posts[$id] : null;
}

// Load Files
require_once PRESSPILOT_PLUGIN_DIR . 'modules/site-assembler.php';
require_once PRESSPILOT_PLUGIN_DIR . 'modules/agent-tools/content-tools.php';

// Execute Test
echo "Starting Smoke Test...\n";

$tool = new PressPilot_Content_Tools();
$params = [
    'title' => 'Home',
    'business_type' => 'corporate',
    'content' => '', // Empty to trigger generation
    'dry_run' => false
];

try {
    $result = $tool->page_create($params);
    echo "Tool execution complete.\n";

    // Verification
    if ($result['success']) {
        $page_id = $result['data']['page_id'];
        $post = $inserted_posts[$page_id];
        $content = $post['post_content'];

        echo "Created Page Title: " . $post['post_title'] . "\n";
        echo "Content Length: " . strlen($content) . " chars\n";

        // Critical Check
        if (strpos($content, '<!-- wp:cover') !== false) {
            echo "PASS: Found '<!-- wp:cover' in content.\n";
            echo "First 500 chars of content:\n" . substr($content, 0, 500) . "\n";
        } else {
            echo "FAIL: '<!-- wp:cover' NOT found in content.\n";
            echo "FAIL: Content sample:\n" . substr($content, 0, 500) . "\n";
        }
    } else {
        echo "FAIL: Tool execution returned success=false.\n";
        var_dump($result);
    }
} catch (Exception $e) {
    echo "FAIL: Exception thrown: " . $e->getMessage() . "\n";
}
