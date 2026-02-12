#!/usr/bin/env php
<?php
/**
 * PressPilot Pattern Assembly — Local Test Script
 *
 * Run: php scripts/test-pattern-assembly.php
 *
 * Simulates the full v2 generation flow without WordPress:
 * 1. Loads pattern helpers
 * 2. Sets AI-generated content (strings + images)
 * 3. Renders each selected pattern
 * 4. Writes a complete theme directory to /tmp
 * 5. Validates the output
 *
 * @package PressPilot
 */

// Stub WordPress functions so pattern files can run outside WP
if ( ! defined( 'ABSPATH' ) ) {
    define( 'ABSPATH', __DIR__ . '/../' );
}

if ( ! function_exists( 'esc_html' ) ) {
    function esc_html( $text ) {
        return htmlspecialchars( $text, ENT_QUOTES, 'UTF-8' );
    }
}

if ( ! function_exists( 'esc_attr' ) ) {
    function esc_attr( $text ) {
        return htmlspecialchars( $text, ENT_QUOTES, 'UTF-8' );
    }
}

if ( ! function_exists( 'esc_url' ) ) {
    function esc_url( $url ) {
        return filter_var( $url, FILTER_SANITIZE_URL ) ?: '';
    }
}

if ( ! function_exists( 'wp_kses_post' ) ) {
    function wp_kses_post( $text ) {
        return $text; // Pass through for testing — WP would sanitize HTML
    }
}

// ──────────────────────────────────────────────────
// 1. Load pattern helpers
// ──────────────────────────────────────────────────
$patterns_base = __DIR__ . '/../presspilot-patterns/';
$patterns_dir  = $patterns_base . 'patterns/';

require_once $patterns_dir . 'pattern-helpers.php';

// Stub presspilot_footer_credit() — defined in Content_Handler class, not pattern-helpers
if ( ! function_exists( 'presspilot_footer_credit' ) ) {
    function presspilot_footer_credit() {
        $year = date( 'Y' );
        return '&copy; ' . $year . ' Bella Cucina. Powered by <a href="https://presspilot.io">PressPilot</a>';
    }
}

// Stub presspilot_business() — defined in Content_Handler class
if ( ! function_exists( 'presspilot_business' ) ) {
    function presspilot_business( $key = '' ) {
        global $presspilot_business;
        if ( empty( $key ) ) {
            return $presspilot_business ?? array();
        }
        return $presspilot_business[ $key ] ?? '';
    }
}

echo "=== PressPilot Pattern Assembly Test ===\n\n";

// ──────────────────────────────────────────────────
// 2. Simulate AI-generated content (restaurant)
// ──────────────────────────────────────────────────
$ai_content = array(
    'selected_patterns' => array(
        'headers/centered-logo',
        'heroes/cover-cta',
        'features/icon-grid-3',
        'restaurant/menu-categories',
        'restaurant/chef-highlight',
        'testimonials/grid-3',
        'restaurant/hours-location',
        'cta/banner-centered',
        'footers/restaurant',
    ),
    'strings' => array(
        // Header
        'header/nav-item-1'  => 'Home',
        'header/nav-item-2'  => 'Menu',
        'header/nav-item-3'  => 'About',
        'header/nav-item-4'  => 'Contact',
        'header/cta-button'  => 'Reserve Table',
        // Hero
        'hero/title'            => 'Authentic Italian Since 1985',
        'hero/subtitle'         => 'Experience handcrafted pasta and wood-fired specialties in the heart of downtown',
        'hero/button-primary'   => 'View Our Menu',
        'hero/button-secondary' => 'Reserve a Table',
        // Features
        'features/section-title'    => 'Why Dine With Us',
        'features/section-subtitle' => 'Three reasons to choose Bella Cucina',
        'features/feature-1-title'  => 'Handmade Pasta',
        'features/feature-1-desc'   => 'Fresh pasta made daily using traditional Italian techniques.',
        'features/feature-2-title'  => 'Wood-Fired Oven',
        'features/feature-2-desc'   => 'Our Neapolitan oven reaches 900°F for the perfect crust.',
        'features/feature-3-title'  => 'Local Ingredients',
        'features/feature-3-desc'   => 'We partner with local farms for the freshest seasonal produce.',
        // Menu
        'menu/section-title'    => 'Our Menu',
        'menu/section-subtitle' => 'Crafted with love, served with passion',
        'menu/category-1-name'  => 'Antipasti',
        'menu/category-2-name'  => 'Primi Piatti',
        'menu/category-3-name'  => 'Dolci',
        'menu/item-1-name'  => 'Bruschetta Classica',
        'menu/item-1-desc'  => 'Grilled bread with fresh tomatoes, garlic, and basil',
        'menu/item-1-price' => '$12',
        'menu/item-2-name'  => 'Calamari Fritti',
        'menu/item-2-desc'  => 'Crispy fried calamari with marinara sauce',
        'menu/item-2-price' => '$16',
        'menu/item-3-name'  => 'Caprese Salad',
        'menu/item-3-desc'  => 'Fresh mozzarella, tomatoes, and basil',
        'menu/item-3-price' => '$14',
        'menu/item-4-name'  => 'Margherita Pizza',
        'menu/item-4-desc'  => 'San Marzano tomatoes, fresh mozzarella, basil',
        'menu/item-4-price' => '$18',
        'menu/item-5-name'  => 'Spaghetti Carbonara',
        'menu/item-5-desc'  => 'Classic Roman pasta with pancetta and egg',
        'menu/item-5-price' => '$22',
        'menu/item-6-name'  => 'Osso Buco',
        'menu/item-6-desc'  => 'Braised veal shanks with gremolata',
        'menu/item-6-price' => '$38',
        'menu/item-7-name'  => 'Tiramisu',
        'menu/item-7-desc'  => 'Espresso-soaked ladyfingers with mascarpone',
        'menu/item-7-price' => '$12',
        'menu/item-8-name'  => 'Panna Cotta',
        'menu/item-8-desc'  => 'Vanilla bean cream with berry compote',
        'menu/item-8-price' => '$10',
        // Chef
        'chef/name'  => 'Chef Marco Rossi',
        'chef/title' => 'Executive Chef',
        'chef/bio'   => 'With over 20 years of culinary experience, Chef Marco brings authentic Italian flavors to every dish. Trained in Rome and Milan.',
        'chef/quote' => 'Cooking is love made visible. Every dish tells a story.',
        // Testimonials
        'testimonials/section-title' => 'What Our Guests Say',
        'testimonials/quote-1' => 'The best Italian food outside of Italy. Incredible pasta!',
        'testimonials/name-1'  => 'Sarah Johnson',
        'testimonials/role-1'  => 'Food Blogger',
        'testimonials/quote-2' => 'We celebrate every special occasion here. Never disappoints.',
        'testimonials/name-2'  => 'Michael Chen',
        'testimonials/role-2'  => 'Regular Guest',
        'testimonials/quote-3' => 'From appetizers to dessert, everything was perfect.',
        'testimonials/name-3'  => 'Emily Rodriguez',
        'testimonials/role-3'  => 'Local Resident',
        // Hours/Location
        'info/section-title'  => 'Visit Us',
        'info/hours-weekday'  => 'Mon-Fri: 5:00 PM - 10:00 PM',
        'info/hours-weekend'  => 'Sat-Sun: 4:00 PM - 11:00 PM',
        'info/address'        => '742 Evergreen Terrace, Springfield, IL 62704',
        'info/phone'          => '(555) 867-5309',
        'info/email'          => 'info@bellacucina.com',
        // CTA
        'cta/title'    => 'Ready for an Unforgettable Evening?',
        'cta/subtitle' => 'Book your table today and let us take you on a culinary journey through Italy.',
        'cta/button'   => 'Reserve Your Table',
        // Footer
        'footer/tagline' => 'Authentic Italian cuisine since 1985',
        'footer/address' => '742 Evergreen Terrace, Springfield',
        'footer/phone'   => '(555) 867-5309',
        'footer/email'   => 'info@bellacucina.com',
        'footer/hours'   => 'Open Daily: 4PM - 11PM',
    ),
    'images' => array(
        'hero/background' => 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1920',
        'chef/photo'      => 'https://images.pexels.com/photos/3814446/pexels-photo-3814446.jpeg?auto=compress&cs=tinysrgb&w=600',
        'info/map-image'  => 'https://images.pexels.com/photos/2290738/pexels-photo-2290738.jpeg?auto=compress&cs=tinysrgb&w=800',
    ),
    'brand_colors' => array(
        'primary'   => '#9F1239',
        'secondary' => '#78716C',
        'accent'    => '#D97706',
    ),
    'business' => array(
        'name'    => 'Bella Cucina',
        'tagline' => 'Authentic Italian Since 1985',
        'phone'   => '(555) 867-5309',
        'email'   => 'info@bellacucina.com',
        'address' => '742 Evergreen Terrace, Springfield, IL 62704',
    ),
);

// ──────────────────────────────────────────────────
// 3. Set globals for pattern rendering
// ──────────────────────────────────────────────────
presspilot_set_strings( $ai_content['strings'] );
presspilot_set_images( $ai_content['images'] );
$GLOBALS['presspilot_business'] = $ai_content['business'];

// ──────────────────────────────────────────────────
// 4. Render each pattern and build theme
// ──────────────────────────────────────────────────
$output_dir = sys_get_temp_dir() . '/presspilot-test-' . time() . '/';
mkdir( $output_dir );
mkdir( $output_dir . 'templates' );
mkdir( $output_dir . 'parts' );

$errors = array();
$rendered_count = 0;

// Render header
$header_slug = null;
$footer_slug = null;
$body_content = '';

foreach ( $ai_content['selected_patterns'] as $slug ) {
    $file = $patterns_dir . $slug . '.php';

    if ( ! file_exists( $file ) ) {
        $errors[] = "MISSING: {$slug} ({$file})";
        continue;
    }

    ob_start();
    include $file;
    $html = ob_get_clean();
    $rendered_count++;

    $size = strlen( $html );
    echo "  [OK] {$slug} — {$size} bytes\n";

    // Route to the right output file
    if ( strpos( $slug, 'headers/' ) === 0 ) {
        file_put_contents( $output_dir . 'parts/header.html', $html );
        $header_slug = $slug;
    } elseif ( strpos( $slug, 'footers/' ) === 0 ) {
        file_put_contents( $output_dir . 'parts/footer.html', $html );
        $footer_slug = $slug;
    } else {
        $body_content .= "\n" . $html . "\n";
    }
}

// Build front-page.html
$front_page  = "<!-- wp:template-part {\"slug\":\"header\",\"tagName\":\"header\"} /-->\n\n";
$front_page .= "<!-- wp:group {\"tagName\":\"main\",\"layout\":{\"type\":\"default\"}} -->\n";
$front_page .= "<main class=\"wp-block-group\">\n";
$front_page .= $body_content;
$front_page .= "</main>\n";
$front_page .= "<!-- /wp:group -->\n\n";
$front_page .= "<!-- wp:template-part {\"slug\":\"footer\",\"tagName\":\"footer\"} /-->";

file_put_contents( $output_dir . 'templates/front-page.html', $front_page );

// Write index.html
$index  = "<!-- wp:template-part {\"slug\":\"header\",\"area\":\"header\"} /-->\n\n";
$index .= "<!-- wp:group {\"tagName\":\"main\",\"layout\":{\"type\":\"constrained\"}} -->\n";
$index .= "<main class=\"wp-block-group\">\n";
$index .= "\t<!-- wp:query {\"queryId\":1,\"query\":{\"perPage\":10,\"postType\":\"post\",\"order\":\"desc\",\"orderBy\":\"date\"}} -->\n";
$index .= "\t<div class=\"wp-block-query\">\n";
$index .= "\t\t<!-- wp:post-template -->\n";
$index .= "\t\t\t<!-- wp:post-title {\"isLink\":true} /-->\n";
$index .= "\t\t\t<!-- wp:post-excerpt /-->\n";
$index .= "\t\t<!-- /wp:post-template -->\n";
$index .= "\t</div>\n";
$index .= "\t<!-- /wp:query -->\n";
$index .= "</main>\n";
$index .= "<!-- /wp:group -->\n\n";
$index .= "<!-- wp:template-part {\"slug\":\"footer\",\"area\":\"footer\"} /-->";

file_put_contents( $output_dir . 'templates/index.html', $index );

// Write style.css
$style_css = <<<CSS
/*
Theme Name: {$ai_content['business']['name']}
Theme URI: https://presspilot.io
Author: PressPilot
Author URI: https://presspilot.io
Description: Custom FSE theme generated by PressPilot AI
Requires at least: 6.4
Tested up to: 6.7
Requires PHP: 7.4
Version: 1.0.0
License: GNU General Public License v2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html
Text Domain: bella-cucina
Tags: full-site-editing, block-patterns, custom-colors

Generated by PressPilot
*/
CSS;

file_put_contents( $output_dir . 'style.css', $style_css );

// Write index.php
file_put_contents( $output_dir . 'index.php', "<?php\n// Silence is golden.\n" );

// Write theme.json from template
$template_file = $patterns_base . 'templates/theme.json.template';
if ( file_exists( $template_file ) ) {
    $theme_json = file_get_contents( $template_file );
    $theme_json = str_replace(
        array(
            '#PRESSPILOT_PRIMARY#',
            '#PRESSPILOT_SECONDARY#',
            '#PRESSPILOT_ACCENT#',
            '#PRESSPILOT_BACKGROUND#',
            '#PRESSPILOT_FOREGROUND#',
            '#PRESSPILOT_TERTIARY#',
        ),
        array(
            $ai_content['brand_colors']['primary'],
            $ai_content['brand_colors']['secondary'],
            $ai_content['brand_colors']['accent'],
            '#ffffff',
            '#1e293b',
            '#f8fafc',
        ),
        $theme_json
    );
    file_put_contents( $output_dir . 'theme.json', $theme_json );
} else {
    $errors[] = 'MISSING: templates/theme.json.template';
}

// Reset globals
presspilot_set_strings( array() );
presspilot_set_images( array() );

// ──────────────────────────────────────────────────
// 5. Validate output
// ──────────────────────────────────────────────────
echo "\n--- Validation ---\n";

$required_files = array(
    'style.css',
    'index.php',
    'theme.json',
    'templates/index.html',
    'templates/front-page.html',
    'parts/header.html',
    'parts/footer.html',
);

$all_valid = true;

foreach ( $required_files as $file ) {
    $path = $output_dir . $file;
    if ( file_exists( $path ) && filesize( $path ) > 0 ) {
        echo "  [PASS] {$file} (" . filesize( $path ) . " bytes)\n";
    } else {
        echo "  [FAIL] {$file} — missing or empty\n";
        $all_valid = false;
    }
}

// Validate theme.json is valid JSON
$theme_json_path = $output_dir . 'theme.json';
if ( file_exists( $theme_json_path ) ) {
    $decoded = json_decode( file_get_contents( $theme_json_path ), true );
    if ( $decoded && isset( $decoded['version'] ) ) {
        echo "  [PASS] theme.json — valid JSON, version " . $decoded['version'] . "\n";
    } else {
        echo "  [FAIL] theme.json — invalid JSON\n";
        $all_valid = false;
    }
}

// Validate style.css has Theme Name header
$style_content = file_get_contents( $output_dir . 'style.css' );
if ( strpos( $style_content, 'Theme Name:' ) !== false ) {
    echo "  [PASS] style.css — has Theme Name header\n";
} else {
    echo "  [FAIL] style.css — missing Theme Name header\n";
    $all_valid = false;
}

// Check for {{placeholder}} syntax (should not exist)
$front_page_content = file_get_contents( $output_dir . 'templates/front-page.html' );
if ( preg_match( '/\{\{[^}]+\}\}/', $front_page_content ) ) {
    echo "  [FAIL] front-page.html — contains {{placeholder}} syntax!\n";
    $all_valid = false;
} else {
    echo "  [PASS] front-page.html — no raw placeholders\n";
}

// Check brand colors were injected
if ( file_exists( $theme_json_path ) ) {
    $tj_raw = file_get_contents( $theme_json_path );
    if ( strpos( $tj_raw, $ai_content['brand_colors']['primary'] ) !== false ) {
        echo "  [PASS] theme.json — brand colors injected\n";
    } else {
        echo "  [FAIL] theme.json — brand colors NOT found\n";
        $all_valid = false;
    }
}

// Check business content appears in rendered output
if ( strpos( $front_page_content, 'Authentic Italian Since 1985' ) !== false ) {
    echo "  [PASS] front-page.html — AI content injected\n";
} else {
    echo "  [FAIL] front-page.html — AI content NOT found in output\n";
    $all_valid = false;
}

// ──────────────────────────────────────────────────
// 6. Summary
// ──────────────────────────────────────────────────
echo "\n--- Summary ---\n";
echo "  Patterns rendered: {$rendered_count}/" . count( $ai_content['selected_patterns'] ) . "\n";
echo "  Output directory:  {$output_dir}\n";
echo "  Front page size:   " . strlen( $front_page ) . " bytes\n";

if ( ! empty( $errors ) ) {
    echo "\n  Errors:\n";
    foreach ( $errors as $err ) {
        echo "    - {$err}\n";
    }
}

if ( $all_valid && empty( $errors ) ) {
    echo "\n  RESULT: ALL TESTS PASSED\n\n";
    exit( 0 );
} else {
    echo "\n  RESULT: SOME TESTS FAILED\n\n";
    exit( 1 );
}
