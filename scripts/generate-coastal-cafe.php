#!/usr/bin/env php
<?php
/**
 * PressPilot Theme Generator — Coastal Cafe
 *
 * Generates a complete WordPress FSE theme ZIP for "Coastal Cafe"
 * and saves it to /wp-content/uploads/presspilot/
 *
 * @package PressPilot
 */

// Stub WordPress functions for running outside WP
if ( ! defined( 'ABSPATH' ) ) {
    define( 'ABSPATH', __DIR__ . '/../' );
}

if ( ! function_exists( 'esc_html' ) ) {
    function esc_html( $text ) {
        return htmlspecialchars( (string) $text, ENT_COMPAT, 'UTF-8' );
    }
}

if ( ! function_exists( 'esc_attr' ) ) {
    function esc_attr( $text ) {
        return htmlspecialchars( (string) $text, ENT_COMPAT, 'UTF-8' );
    }
}

if ( ! function_exists( 'esc_url' ) ) {
    function esc_url( $url ) {
        return filter_var( $url, FILTER_SANITIZE_URL ) ?: '';
    }
}

if ( ! function_exists( 'wp_kses_post' ) ) {
    function wp_kses_post( $text ) {
        return $text;
    }
}

// ──────────────────────────────────────────────────
// 1. Load pattern helpers
// ──────────────────────────────────────────────────
$patterns_base = __DIR__ . '/../presspilot-patterns/';
$patterns_dir  = $patterns_base . 'patterns/';

require_once $patterns_dir . 'pattern-helpers.php';

// Stub presspilot_footer_credit() — uses Content_Handler in WP
if ( ! function_exists( 'presspilot_footer_credit' ) ) {
    function presspilot_footer_credit() {
        global $presspilot_business;
        $name = $presspilot_business['name'] ?? 'PressPilot';
        $year = date( 'Y' );
        return '&copy; ' . $year . ' ' . htmlspecialchars( $name, ENT_QUOTES, 'UTF-8' ) . '. Powered by <a href="https://presspilot.io" target="_blank" rel="noopener">PressPilot</a>';
    }
}

// Stub presspilot_business()
if ( ! function_exists( 'presspilot_business' ) ) {
    function presspilot_business( $key = '' ) {
        global $presspilot_business;
        if ( empty( $key ) ) {
            return $presspilot_business ?? array();
        }
        return $presspilot_business[ $key ] ?? '';
    }
}

echo "=== PressPilot Theme Generator — Coastal Cafe ===\n\n";

// ──────────────────────────────────────────────────
// 2. Coastal Cafe content (simulating AI output)
// ──────────────────────────────────────────────────
$ai_content = array(
    'header_pattern' => 'headers/centered-logo',
    'footer_pattern' => 'footers/restaurant',
    'pages' => array(
        'front-page' => array(
            'heroes/cover-cta',
            'features/icon-grid-3',
            'testimonials/grid-3',
            'cta/banner-centered',
        ),
        'page-menu' => array(
            'restaurant/menu-categories',
        ),
        'page-about' => array(
            'restaurant/restaurant-about',
            'restaurant/chef-highlight',
        ),
        'page-contact' => array(
            'restaurant/hours-location',
            'restaurant/restaurant-reservation',
        ),
    ),
    'strings' => array(
        // Header
        'header/nav-item-1'  => 'Home',
        'header/nav-item-2'  => 'Menu',
        'header/nav-item-3'  => 'About',
        'header/nav-item-4'  => 'Contact',
        'header/cta-button'  => 'Book a Table',

        // Hero
        'hero/title'            => 'Fresh Seafood With Ocean Views',
        'hero/subtitle'         => 'Savor the catch of the day while watching the waves roll in at Santa Monica\'s favorite coastal dining destination',
        'hero/button-primary'   => 'View Our Menu',
        'hero/button-secondary' => 'Make a Reservation',

        // Features
        'features/section-title'    => 'The Coastal Cafe Experience',
        'features/section-subtitle' => 'Why locals and visitors keep coming back',
        'features/feature-1-title'  => 'Daily Catch',
        'features/feature-1-desc'   => 'Fresh fish and shellfish delivered every morning straight from local fishermen.',
        'features/feature-2-title'  => 'Oceanfront Patio',
        'features/feature-2-desc'   => 'Dine al fresco with panoramic views of the Pacific Ocean and stunning sunsets.',
        'features/feature-3-title'  => 'Craft Cocktails',
        'features/feature-3-desc'   => 'Hand-crafted tropical cocktails and an extensive California wine list.',

        // Menu
        'menu/section-title'    => 'Our Menu',
        'menu/section-subtitle' => 'From the ocean to your plate — always fresh, always delicious',
        'menu/category-1-name'  => 'Starters',
        'menu/category-2-name'  => 'Mains',
        'menu/category-3-name'  => 'Desserts',
        'menu/item-1-name'  => 'Ahi Tuna Poke',
        'menu/item-1-desc'  => 'Sushi-grade ahi tuna, avocado, sesame, wonton crisps, ponzu drizzle',
        'menu/item-1-price' => '$18',
        'menu/item-2-name'  => 'Coconut Shrimp',
        'menu/item-2-desc'  => 'Crispy coconut-crusted jumbo shrimp with mango chili dipping sauce',
        'menu/item-2-price' => '$16',
        'menu/item-3-name'  => 'Clam Chowder',
        'menu/item-3-desc'  => 'New England-style chowder with fresh clams, potatoes, and bacon',
        'menu/item-3-price' => '$12',
        'menu/item-4-name'  => 'Grilled Mahi Mahi',
        'menu/item-4-desc'  => 'Wild-caught mahi mahi, citrus beurre blanc, roasted vegetables, jasmine rice',
        'menu/item-4-price' => '$32',
        'menu/item-5-name'  => 'Lobster Linguine',
        'menu/item-5-desc'  => 'Maine lobster tail, cherry tomatoes, garlic white wine sauce, fresh basil',
        'menu/item-5-price' => '$38',
        'menu/item-6-name'  => 'Pan-Seared Salmon',
        'menu/item-6-desc'  => 'Atlantic salmon, lemon dill cream, asparagus, fingerling potatoes',
        'menu/item-6-price' => '$29',
        'menu/item-7-name'  => 'Key Lime Pie',
        'menu/item-7-desc'  => 'Classic key lime pie with graham cracker crust and whipped cream',
        'menu/item-7-price' => '$11',
        'menu/item-8-name'  => 'Coconut Panna Cotta',
        'menu/item-8-desc'  => 'Coconut cream panna cotta with passion fruit coulis and toasted macadamia',
        'menu/item-8-price' => '$13',

        // Chef
        'chef/name'  => 'Chef Marina Santos',
        'chef/title' => 'Head Chef',
        'chef/bio'   => 'Born and raised on the coast of Portugal, Chef Marina brings a lifelong love of the sea to every plate. Fifteen years of coastal kitchens have sharpened her instinct for letting fresh seafood shine.',
        'chef/quote' => 'The ocean provides — our job is simply not to ruin it.',

        // Testimonials
        'testimonials/section-title' => 'What Our Guests Say',
        'testimonials/quote-1' => 'The grilled mahi mahi was the best fish I\'ve ever had. The ocean view makes the whole experience magical.',
        'testimonials/name-1'  => 'Jessica Torres',
        'testimonials/role-1'  => 'Travel Blogger',
        'testimonials/quote-2' => 'We come here every anniversary. The lobster linguine and sunset views never get old.',
        'testimonials/name-2'  => 'David & Priya Patel',
        'testimonials/role-2'  => 'Regular Guests',
        'testimonials/quote-3' => 'A hidden gem on the Santa Monica coast. Fresh, flavorful, and unforgettable.',
        'testimonials/name-3'  => 'Marcus Williams',
        'testimonials/role-3'  => 'Local Resident',

        // Hours/Location
        'info/section-title'  => 'Find Us',
        'info/hours-weekday'  => 'Mon-Thu: 11:30 AM - 9:00 PM',
        'info/hours-weekend'  => 'Fri-Sun: 11:00 AM - 10:00 PM',
        'info/address'        => '123 Beach Blvd, Santa Monica, CA',
        'info/phone'          => '(555) 867-5309',
        'info/email'          => 'hello@coastalcafe.com',

        // CTA
        'cta/title'    => 'Ready for a Taste of the Coast?',
        'cta/subtitle' => 'Reserve your oceanfront table and enjoy the freshest seafood in Santa Monica.',
        'cta/button'   => 'Book Your Table',

        // About page (restaurant-about.php uses bare keys)
        'section-title' => 'Our Coastal Story',
        'paragraph-1'   => 'Coastal Cafe was born from a simple dream: share the freshest catch with friends, right where the waves break. What started as a beachside shack in 2015 has grown into Santa Monica\'s favorite seafood spot.',
        'paragraph-2'   => 'Every morning, our team meets the local fishermen at the dock. Every evening, those same fish become the dishes our guests rave about. No shortcuts, no frozen imports — just honest coastal cooking.',

        // Reservation (restaurant-reservation.php uses bare keys)
        'headline'    => 'Reserve Your Table',
        'subtext'     => 'Join us for an unforgettable seaside dining experience. Book online or give us a call.',
        'button-text' => 'Make a Reservation',
        'phone'       => '(555) 867-5309',

        // Footer
        'footer/tagline'       => 'Fresh seafood with ocean views',
        'footer/address'       => '123 Beach Blvd, Santa Monica, CA',
        'footer/phone'         => '(555) 867-5309',
        'footer/email'         => 'hello@coastalcafe.com',
        'footer/business-name' => 'Coastal Cafe',
        'footer/nav-1'         => 'Home',
        'footer/nav-2'         => 'Menu',
        'footer/nav-3'         => 'About',
        'footer/nav-4'         => 'Contact',
    ),
    'images' => array(
        'hero/background' => 'https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg?auto=compress&cs=tinysrgb&w=1920',
        'chef/photo'      => 'https://images.pexels.com/photos/3814446/pexels-photo-3814446.jpeg?auto=compress&cs=tinysrgb&w=600',
        'info/map-image'  => 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=800',
        'about-image'     => 'https://images.pexels.com/photos/3338497/pexels-photo-3338497.jpeg?auto=compress&cs=tinysrgb&w=600',
    ),
    'brand_colors' => array(
        'primary'   => '#0d9488',
        'secondary' => '#64748b',
        'accent'    => '#f97316',
    ),
    'logo_url' => '', // empty = generate fallback SVG; set URL or base64 for uploaded logo
    'business' => array(
        'name'    => 'Coastal Cafe',
        'tagline' => 'Fresh seafood with ocean views',
        'phone'   => '(555) 867-5309',
        'email'   => 'hello@coastalcafe.com',
        'address' => '123 Beach Blvd, Santa Monica, CA',
    ),
);

// ──────────────────────────────────────────────────
// 3. Set globals for pattern rendering
// ──────────────────────────────────────────────────
presspilot_set_strings( $ai_content['strings'] );
presspilot_set_images( $ai_content['images'] );
$GLOBALS['presspilot_business'] = $ai_content['business'];

// ──────────────────────────────────────────────────
// 4. Build theme directory
// ──────────────────────────────────────────────────
$theme_slug = 'coastal-cafe';
$build_dir  = sys_get_temp_dir() . '/presspilot-' . $theme_slug . '-' . time() . '/';
$theme_dir  = $build_dir . $theme_slug . '/';

mkdir( $theme_dir, 0755, true );
mkdir( $theme_dir . 'templates', 0755, true );
mkdir( $theme_dir . 'parts', 0755, true );
mkdir( $theme_dir . 'assets/images', 0755, true );

// ──────────────────────────────────────────────────
// 4a. Logo handling (uploaded OR generated fallback)
// ──────────────────────────────────────────────────
$logo_url   = $ai_content['logo_url'] ?? '';
$logo_source = 'none';

if ( ! empty( $logo_url ) ) {
    // ── PATH 1: User uploaded logo ──
    echo "Logo: validating uploaded file...\n";

    // Decode base64 or download URL
    if ( strpos( $logo_url, 'data:' ) === 0 ) {
        // base64 data URI
        $logo_data = file_get_contents( $logo_url );
    } else {
        $logo_data = @file_get_contents( $logo_url );
    }

    if ( $logo_data === false ) {
        echo "  [WARN] Could not fetch logo from URL — falling back to generated\n";
        $logo_url = ''; // fall through to fallback
    } else {
        $logo_size = strlen( $logo_data );

        // Detect format
        $finfo     = new finfo( FILEINFO_MIME_TYPE );
        $mime_type = $finfo->buffer( $logo_data );
        $is_svg    = ( $mime_type === 'image/svg+xml' || strpos( $logo_data, '<svg' ) !== false );
        $is_png    = ( $mime_type === 'image/png' );

        // Validate: PNG or SVG only
        if ( ! $is_svg && ! $is_png ) {
            echo "  [FAIL] Logo must be PNG or SVG (got: {$mime_type})\n";
            $logo_url = ''; // fall through to fallback
        }
        // Validate: Max 500KB
        elseif ( $logo_size > 512000 ) {
            $kb = round( $logo_size / 1024 );
            echo "  [FAIL] Logo exceeds 500KB limit ({$kb}KB)\n";
            $logo_url = ''; // fall through to fallback
        } else {
            // Dimension validation (PNG only — SVG is vector)
            if ( $is_png ) {
                $tmp_logo = tempnam( sys_get_temp_dir(), 'pp_logo_' );
                file_put_contents( $tmp_logo, $logo_data );
                $img_info = getimagesize( $tmp_logo );
                unlink( $tmp_logo );

                if ( $img_info ) {
                    $w = $img_info[0];
                    $h = $img_info[1];
                    if ( $w < 200 || $h < 200 ) {
                        echo "  [FAIL] Logo too small ({$w}x{$h}) — min 200x200\n";
                        $logo_url = '';
                    } elseif ( $w > 1000 || $h > 1000 ) {
                        echo "  [FAIL] Logo too large ({$w}x{$h}) — max 1000x1000\n";
                        $logo_url = '';
                    }
                }
            }

            // If still valid, save
            if ( ! empty( $logo_url ) ) {
                $ext       = $is_svg ? 'svg' : 'png';
                $logo_file = "logo.{$ext}";
                file_put_contents( $theme_dir . 'assets/images/' . $logo_file, $logo_data );
                $logo_source = 'uploaded';
                $kb = round( $logo_size / 1024, 1 );
                echo "  [OK] Uploaded logo saved — {$logo_file} ({$kb}KB)\n";
            }
        }
    }
}

if ( empty( $logo_url ) ) {
    // ── PATH 2: Generate fallback SVG ──
    $biz_name      = $ai_content['business']['name'];
    $primary_color = $ai_content['brand_colors']['primary'];

    $initials = '';
    $words    = explode( ' ', $biz_name );
    foreach ( $words as $word ) {
        $w = trim( $word );
        if ( strlen( $w ) > 0 ) {
            $initials .= strtoupper( substr( $w, 0, 1 ) );
        }
    }
    $initials = substr( $initials, 0, 2 );

    $logo_svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' . "\n"
        . '  <rect width="100" height="100" rx="12" fill="' . $primary_color . '"/>' . "\n"
        . '  <text x="50" y="65" font-family="system-ui, sans-serif" font-size="36" font-weight="600" fill="#FFFFFF" text-anchor="middle">' . htmlspecialchars( $initials, ENT_XML1 ) . '</text>' . "\n"
        . '</svg>';

    file_put_contents( $theme_dir . 'assets/images/logo.svg', $logo_svg );
    $logo_source = 'generated';
    $logo_file   = 'logo.svg';
    echo "  [OK] Generated fallback SVG logo — initials: {$initials}, color: {$primary_color}\n";
}

$rendered_count = 0;
$total_patterns = 0;
$errors         = array();

// ── Render header ──
echo "Rendering header/footer...\n";
$header_file = $patterns_dir . $ai_content['header_pattern'] . '.php';
if ( file_exists( $header_file ) ) {
    ob_start();
    include $header_file;
    $header_html = ob_get_clean();
    $rendered_count++;
    echo "  [OK] {$ai_content['header_pattern']} — " . strlen( $header_html ) . " bytes\n";
} else {
    $errors[] = "MISSING: {$ai_content['header_pattern']}";
    $header_html = '';
}
$total_patterns++;

// ── Render footer ──
$footer_file = $patterns_dir . $ai_content['footer_pattern'] . '.php';
if ( file_exists( $footer_file ) ) {
    ob_start();
    include $footer_file;
    $footer_html = ob_get_clean();
    $rendered_count++;
    echo "  [OK] {$ai_content['footer_pattern']} — " . strlen( $footer_html ) . " bytes\n";
} else {
    $errors[] = "MISSING: {$ai_content['footer_pattern']}";
    $footer_html = '';
}
$total_patterns++;

// Write parts
file_put_contents( $theme_dir . 'parts/header.html', $header_html );
file_put_contents( $theme_dir . 'parts/footer.html', $footer_html );

// ── Render per-page patterns ──
$page_content = array();
foreach ( $ai_content['pages'] as $page_slug => $page_patterns ) {
    echo "\nRendering {$page_slug}...\n";
    $page_body = '';

    foreach ( $page_patterns as $slug ) {
        $total_patterns++;
        $file = $patterns_dir . $slug . '.php';

        if ( ! file_exists( $file ) ) {
            $errors[] = "MISSING: {$slug}";
            echo "  [SKIP] {$slug} — file not found\n";
            continue;
        }

        ob_start();
        include $file;
        $html = ob_get_clean();
        $rendered_count++;

        echo "  [OK] {$slug} — " . strlen( $html ) . " bytes\n";
        $page_body .= "\n" . $html . "\n";
    }

    $page_content[ $page_slug ] = $page_body;
}

// ── Write page templates ──
$template_wrapper_start  = "<!-- wp:template-part {\"slug\":\"header\",\"tagName\":\"header\"} /-->\n\n";
$template_wrapper_start .= "<!-- wp:group {\"tagName\":\"main\",\"layout\":{\"type\":\"default\"}} -->\n";
$template_wrapper_start .= "<main class=\"wp-block-group\">\n";
$template_wrapper_end    = "</main>\n<!-- /wp:group -->\n\n";
$template_wrapper_end   .= "<!-- wp:template-part {\"slug\":\"footer\",\"tagName\":\"footer\"} /-->";

foreach ( $page_content as $page_slug => $body ) {
    $template = $template_wrapper_start . $body . $template_wrapper_end;
    file_put_contents( $theme_dir . "templates/{$page_slug}.html", $template );
}

// Write templates/index.html
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
file_put_contents( $theme_dir . 'templates/index.html', $index );

// Write templates/page.html
$page  = "<!-- wp:template-part {\"slug\":\"header\",\"area\":\"header\"} /-->\n\n";
$page .= "<!-- wp:group {\"tagName\":\"main\",\"layout\":{\"type\":\"constrained\"}} -->\n";
$page .= "<main class=\"wp-block-group\">\n";
$page .= "\t<!-- wp:post-title {\"level\":1} /-->\n";
$page .= "\t<!-- wp:post-content {\"layout\":{\"type\":\"constrained\"}} /-->\n";
$page .= "</main>\n";
$page .= "<!-- /wp:group -->\n\n";
$page .= "<!-- wp:template-part {\"slug\":\"footer\",\"area\":\"footer\"} /-->";
file_put_contents( $theme_dir . 'templates/page.html', $page );

// Write templates/single.html
$single  = "<!-- wp:template-part {\"slug\":\"header\",\"area\":\"header\"} /-->\n\n";
$single .= "<!-- wp:group {\"tagName\":\"main\",\"layout\":{\"type\":\"constrained\"}} -->\n";
$single .= "<main class=\"wp-block-group\">\n";
$single .= "\t<!-- wp:post-title {\"level\":1} /-->\n";
$single .= "\t<!-- wp:post-date /-->\n";
$single .= "\t<!-- wp:post-content {\"layout\":{\"type\":\"constrained\"}} /-->\n";
$single .= "</main>\n";
$single .= "<!-- /wp:group -->\n\n";
$single .= "<!-- wp:template-part {\"slug\":\"footer\",\"area\":\"footer\"} /-->";
file_put_contents( $theme_dir . 'templates/single.html', $single );

// Write templates/404.html
$four04  = "<!-- wp:template-part {\"slug\":\"header\",\"area\":\"header\"} /-->\n\n";
$four04 .= "<!-- wp:group {\"tagName\":\"main\",\"layout\":{\"type\":\"constrained\"}} -->\n";
$four04 .= "<main class=\"wp-block-group\">\n";
$four04 .= "\t<!-- wp:heading {\"textAlign\":\"center\",\"level\":1} -->\n";
$four04 .= "\t<h1 class=\"wp-block-heading has-text-align-center\">Page Not Found</h1>\n";
$four04 .= "\t<!-- /wp:heading -->\n\n";
$four04 .= "\t<!-- wp:paragraph {\"align\":\"center\"} -->\n";
$four04 .= "\t<p class=\"has-text-align-center\">Sorry, the page you're looking for doesn't exist. Head back to our <a href=\"/\">homepage</a>.</p>\n";
$four04 .= "\t<!-- /wp:paragraph -->\n";
$four04 .= "</main>\n";
$four04 .= "<!-- /wp:group -->\n\n";
$four04 .= "<!-- wp:template-part {\"slug\":\"footer\",\"area\":\"footer\"} /-->";
file_put_contents( $theme_dir . 'templates/404.html', $four04 );

// Write style.css
$style_css = <<<CSS
/*
Theme Name: Coastal Cafe
Theme URI: https://presspilotapp.com
Author: PressPilot
Author URI: https://presspilotapp.com
Description: Custom FSE theme for Coastal Cafe — fresh seafood with ocean views
Requires at least: 6.0
Tested up to: 6.4
Requires PHP: 7.4
Version: 1.0.0
License: GNU General Public License v2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html
Text Domain: coastal-cafe
Tags: full-site-editing, block-patterns, custom-colors, restaurant

Generated by PressPilot
*/
CSS;
file_put_contents( $theme_dir . 'style.css', $style_css );

// Write index.php
file_put_contents( $theme_dir . 'index.php', "<?php\n// Silence is golden. This file is required by WordPress.\n" );

// Write functions.php (with logo import + site identity)
$escaped_biz_name = addslashes( $ai_content['business']['name'] );
$escaped_tagline  = addslashes( $ai_content['business']['tagline'] );
$theme_prefix     = str_replace( '-', '_', $theme_slug );
$logo_ext         = pathinfo( $logo_file, PATHINFO_EXTENSION );
$logo_mime        = ( $logo_ext === 'svg' ) ? 'image/svg+xml' : 'image/png';

$functions_php = <<<PHP
<?php
/**
 * {$ai_content['business']['name']} Theme Functions
 *
 * @package CoastalCafe
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Enqueue Google Fonts.
 */
function {$theme_prefix}_enqueue_fonts() {
    wp_enqueue_style(
        '{$theme_slug}-fonts',
        'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;700&display=swap',
        array(),
        null
    );
}
add_action( 'wp_enqueue_scripts', '{$theme_prefix}_enqueue_fonts' );

/**
 * Allow SVG uploads.
 */
function {$theme_prefix}_allow_svg( \$mimes ) {
    \$mimes['svg'] = 'image/svg+xml';
    return \$mimes;
}
add_filter( 'upload_mimes', '{$theme_prefix}_allow_svg' );

/**
 * On theme activation: import logo, set site identity.
 */
function {$theme_prefix}_setup_on_activation() {
    // 1. Set site title and tagline
    update_option( 'blogname', '{$escaped_biz_name}' );
    update_option( 'blogdescription', '{$escaped_tagline}' );

    // 2. Import logo to Media Library
    \$logo_path = get_theme_file_path( 'assets/images/{$logo_file}' );
    if ( ! file_exists( \$logo_path ) ) {
        return;
    }

    // Check if we already imported (avoid duplicates on re-activation)
    \$existing = get_option( '{$theme_prefix}_logo_attachment_id' );
    if ( \$existing && get_post( \$existing ) ) {
        set_theme_mod( 'custom_logo', \$existing );
        update_option( 'site_icon', \$existing );
        return;
    }

    // Copy to uploads directory
    \$upload_dir = wp_upload_dir();
    \$filename   = '{$theme_slug}-{$logo_file}';
    \$dest_path  = \$upload_dir['path'] . '/' . \$filename;

    copy( \$logo_path, \$dest_path );

    \$attachment = array(
        'post_mime_type' => '{$logo_mime}',
        'post_title'     => '{$escaped_biz_name} Logo',
        'post_content'   => '',
        'post_status'    => 'inherit',
    );

    \$attach_id = wp_insert_attachment( \$attachment, \$dest_path );

    if ( ! is_wp_error( \$attach_id ) && \$attach_id ) {
        if ( '{$logo_ext}' === 'png' ) {
            require_once ABSPATH . 'wp-admin/includes/image.php';
            \$metadata = wp_generate_attachment_metadata( \$attach_id, \$dest_path );
        } else {
            // SVG — set metadata manually (no thumbnail generation)
            \$metadata = array(
                'width'  => 100,
                'height' => 100,
                'file'   => \$upload_dir['subdir'] . '/' . \$filename,
            );
        }
        wp_update_attachment_metadata( \$attach_id, \$metadata );

        set_theme_mod( 'custom_logo', \$attach_id );
        update_option( 'site_icon', \$attach_id );
        update_option( '{$theme_prefix}_logo_attachment_id', \$attach_id );
    }
}
add_action( 'after_switch_theme', '{$theme_prefix}_setup_on_activation' );

/**
 * Create theme pages on init (runs once, then sets flag).
 * Uses init instead of after_switch_theme so pages survive theme updates.
 */
function {$theme_prefix}_maybe_create_pages() {
    if ( get_option( '{$theme_prefix}_pages_created' ) ) {
        return;
    }

    \$pages = array(
        array( 'title' => 'Home',    'slug' => 'home',    'template' => '' ),
        array( 'title' => 'Menu',    'slug' => 'menu',    'template' => 'page-menu' ),
        array( 'title' => 'About',   'slug' => 'about',   'template' => 'page-about' ),
        array( 'title' => 'Contact', 'slug' => 'contact', 'template' => 'page-contact' ),
    );

    foreach ( \$pages as \$page_data ) {
        \$existing = get_page_by_path( \$page_data['slug'] );
        if ( \$existing ) {
            if ( ! empty( \$page_data['template'] ) ) {
                update_post_meta( \$existing->ID, '_wp_page_template', \$page_data['template'] );
            }
            if ( \$page_data['slug'] === 'home' ) {
                update_option( 'page_on_front', \$existing->ID );
            }
            continue;
        }

        \$page_id = wp_insert_post( array(
            'post_title'   => \$page_data['title'],
            'post_name'    => \$page_data['slug'],
            'post_status'  => 'publish',
            'post_type'    => 'page',
            'post_content' => '',
        ) );

        if ( \$page_id && ! is_wp_error( \$page_id ) ) {
            if ( ! empty( \$page_data['template'] ) ) {
                update_post_meta( \$page_id, '_wp_page_template', \$page_data['template'] );
            }
            if ( \$page_data['slug'] === 'home' ) {
                update_option( 'page_on_front', \$page_id );
            }
        }
    }

    update_option( 'show_on_front', 'page' );
    update_option( '{$theme_prefix}_pages_created', true );
}
add_action( 'init', '{$theme_prefix}_maybe_create_pages' );
PHP;
file_put_contents( $theme_dir . 'functions.php', $functions_php );

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
            '#f0fdfa',
        ),
        $theme_json
    );
    file_put_contents( $theme_dir . 'theme.json', $theme_json );
} else {
    $errors[] = 'MISSING: templates/theme.json.template';
}

// Reset globals
presspilot_set_strings( array() );
presspilot_set_images( array() );

// ──────────────────────────────────────────────────
// 5. Create ZIP
// ──────────────────────────────────────────────────
echo "\nCreating ZIP...\n";

$zip_output_dir = '/Users/soluwrx/Downloads/pp-local-8081/wp-content/uploads/presspilot/';
if ( ! is_dir( $zip_output_dir ) ) {
    mkdir( $zip_output_dir, 0755, true );
}

$zip_path = $zip_output_dir . $theme_slug . '.zip';

// Remove old ZIP if exists
if ( file_exists( $zip_path ) ) {
    unlink( $zip_path );
}

$zip = new ZipArchive();
if ( $zip->open( $zip_path, ZipArchive::CREATE | ZipArchive::OVERWRITE ) !== true ) {
    echo "  [FAIL] Could not create ZIP at {$zip_path}\n";
    exit( 1 );
}

// Recursively add all theme files
// IMPORTANT: Resolve symlinks on $theme_dir to match getRealPath() output.
// macOS /var → /private/var symlink causes path length mismatch otherwise.
$theme_dir_resolved = realpath( $theme_dir ) . '/';

$files = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator( $theme_dir, RecursiveDirectoryIterator::SKIP_DOTS ),
    RecursiveIteratorIterator::LEAVES_ONLY
);

$file_count = 0;
foreach ( $files as $file_info ) {
    $real_path    = $file_info->getRealPath();
    $relative     = $theme_slug . '/' . substr( $real_path, strlen( $theme_dir_resolved ) );
    $zip->addFile( $real_path, $relative );
    $file_count++;
}

$zip->close();

$zip_size = filesize( $zip_path );

// ──────────────────────────────────────────────────
// 6. Pre-ZIP validation (build directory)
// ──────────────────────────────────────────────────
echo "\n--- Pre-ZIP Validation ---\n";

$required_files = array(
    'style.css', 'index.php', 'functions.php', 'theme.json',
    'templates/index.html', 'templates/front-page.html',
    'templates/page.html', 'templates/single.html', 'templates/404.html',
    'templates/page-menu.html', 'templates/page-about.html', 'templates/page-contact.html',
    'parts/header.html', 'parts/footer.html',
    'assets/images/' . $logo_file,
);

$all_valid = true;
foreach ( $required_files as $f ) {
    $path = $theme_dir . $f;
    if ( file_exists( $path ) && filesize( $path ) > 0 ) {
        echo "  [PASS] {$f} (" . filesize( $path ) . " bytes)\n";
    } else {
        echo "  [FAIL] {$f} — missing or empty\n";
        $all_valid = false;
    }
}

// theme.json valid JSON
$decoded = json_decode( file_get_contents( $theme_dir . 'theme.json' ), true );
if ( $decoded && isset( $decoded['version'] ) ) {
    echo "  [PASS] theme.json — valid JSON, version {$decoded['version']}\n";
} else {
    echo "  [FAIL] theme.json — invalid JSON\n";
    $all_valid = false;
}

// Brand colors
$tj_raw = file_get_contents( $theme_dir . 'theme.json' );
if ( strpos( $tj_raw, '#0d9488' ) !== false ) {
    echo "  [PASS] theme.json — brand color #0d9488 injected\n";
} else {
    echo "  [FAIL] theme.json — brand colors NOT found\n";
    $all_valid = false;
}

// Logo validation
$logo_path_check = $theme_dir . 'assets/images/' . $logo_file;
if ( file_exists( $logo_path_check ) && filesize( $logo_path_check ) > 0 ) {
    if ( $logo_source === 'generated' ) {
        $logo_content = file_get_contents( $logo_path_check );
        if ( strpos( $logo_content, $ai_content['brand_colors']['primary'] ) !== false ) {
            echo "  [PASS] {$logo_file} — generated fallback uses brand color\n";
        } else {
            echo "  [FAIL] {$logo_file} — brand color NOT found in generated logo\n";
            $all_valid = false;
        }
    } else {
        $logo_kb = round( filesize( $logo_path_check ) / 1024, 1 );
        echo "  [PASS] {$logo_file} — uploaded logo ({$logo_kb}KB)\n";
    }
} else {
    echo "  [FAIL] Logo file missing\n";
    $all_valid = false;
}

// functions.php has logo import
$func_content = file_get_contents( $theme_dir . 'functions.php' );
if ( strpos( $func_content, 'after_switch_theme' ) !== false && strpos( $func_content, 'custom_logo' ) !== false ) {
    echo "  [PASS] functions.php — logo auto-import on activation\n";
} else {
    echo "  [FAIL] functions.php — missing logo auto-import\n";
    $all_valid = false;
}

if ( strpos( $func_content, 'blogname' ) !== false && strpos( $func_content, 'blogdescription' ) !== false ) {
    echo "  [PASS] functions.php — site identity (name + tagline)\n";
} else {
    echo "  [FAIL] functions.php — missing site identity\n";
    $all_valid = false;
}

if ( strpos( $func_content, 'wp_insert_post' ) !== false && strpos( $func_content, 'page_on_front' ) !== false ) {
    echo "  [PASS] functions.php — page creation on activation\n";
} else {
    echo "  [FAIL] functions.php — missing page creation\n";
    $all_valid = false;
}

// Custom templates in theme.json
$tj_decoded = json_decode( $tj_raw, true );
$custom_templates = $tj_decoded['customTemplates'] ?? array();
$template_names = array_column( $custom_templates, 'name' );
$needed = array( 'page-menu', 'page-about', 'page-contact' );
$missing_ct = array_diff( $needed, $template_names );
if ( empty( $missing_ct ) ) {
    echo "  [PASS] theme.json — customTemplates: page-menu, page-about, page-contact\n";
} else {
    echo "  [FAIL] theme.json — missing customTemplates: " . implode( ', ', $missing_ct ) . "\n";
    $all_valid = false;
}

// Content injection
$fp = file_get_contents( $theme_dir . 'templates/front-page.html' );
if ( strpos( $fp, 'Fresh Seafood With Ocean Views' ) !== false ) {
    echo "  [PASS] front-page.html — hero title injected\n";
} else {
    echo "  [FAIL] front-page.html — hero title NOT found\n";
    $all_valid = false;
}

// Menu items moved to page-menu.html
$menu_page = file_get_contents( $theme_dir . 'templates/page-menu.html' );
if ( strpos( $menu_page, 'Grilled Mahi Mahi' ) !== false ) {
    echo "  [PASS] page-menu.html — menu items injected\n";
} else {
    echo "  [FAIL] page-menu.html — menu items NOT found\n";
    $all_valid = false;
}

// About page has content
$about_page = file_get_contents( $theme_dir . 'templates/page-about.html' );
if ( strpos( $about_page, 'Our Coastal Story' ) !== false && strpos( $about_page, 'Chef Marina Santos' ) !== false ) {
    echo "  [PASS] page-about.html — about + chef content injected\n";
} else {
    echo "  [FAIL] page-about.html — content NOT found\n";
    $all_valid = false;
}

// Contact page has content
$contact_page = file_get_contents( $theme_dir . 'templates/page-contact.html' );
if ( strpos( $contact_page, 'Find Us' ) !== false && strpos( $contact_page, 'Reserve Your Table' ) !== false ) {
    echo "  [PASS] page-contact.html — hours + reservation content injected\n";
} else {
    echo "  [FAIL] page-contact.html — content NOT found\n";
    $all_valid = false;
}

// No placeholder syntax
if ( preg_match( '/\{\{[^}]+\}\}/', $fp ) ) {
    echo "  [FAIL] front-page.html — contains {{placeholder}} syntax!\n";
    $all_valid = false;
} else {
    echo "  [PASS] front-page.html — no raw placeholders\n";
}

// ──────────────────────────────────────────────────
// 7. ZIP Structure Validation Gate
// ──────────────────────────────────────────────────
echo "\n--- ZIP Structure Validation ---\n";

require_once __DIR__ . '/validate-zip-structure.php';

$zip_validation = validate_zip_structure( $zip_path );

if ( $zip_validation['valid'] ) {
    echo "  [PASS] ZIP structure valid — theme folder: {$zip_validation['theme_name']}\n";
} else {
    $all_valid = false;
    foreach ( $zip_validation['errors'] as $zerr ) {
        echo "  [FAIL] {$zerr}\n";
    }
}

if ( ! empty( $zip_validation['warnings'] ) ) {
    foreach ( $zip_validation['warnings'] as $zwarn ) {
        echo "  [WARN] {$zwarn}\n";
    }
}

// ──────────────────────────────────────────────────
// 8. Summary
// ──────────────────────────────────────────────────
echo "\n--- Summary ---\n";
echo "  Theme:             Coastal Cafe\n";
echo "  Patterns rendered: {$rendered_count}/{$total_patterns}\n";
echo "  Build directory:   {$theme_dir}\n";
echo "  Front page size:   " . strlen( $fp ) . " bytes\n";
echo "  ZIP file:          {$zip_path}\n";
echo "  ZIP size:          " . number_format( $zip_size ) . " bytes\n";

if ( ! empty( $errors ) ) {
    echo "\n  Build errors:\n";
    foreach ( $errors as $err ) {
        echo "    - {$err}\n";
    }
}

if ( $all_valid && empty( $errors ) ) {
    echo "\n  RESULT: ALL CHECKS PASSED — ZIP ready for WordPress install\n\n";
    exit( 0 );
} else {
    echo "\n  RESULT: VALIDATION FAILED — do NOT deliver this ZIP\n\n";
    exit( 1 );
}
