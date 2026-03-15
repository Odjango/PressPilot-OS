<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Services\AIPlanner;
use App\Services\PatternSelector;
use App\Services\TokenInjector;
use App\Services\ImageHandler;
use App\Services\ThemeAssembler;
use App\Services\PlaceholderProvider;
use App\Services\UnsplashProvider;

echo "=== RESTAURANT THEME GENERATION TEST ===\n\n";

// Test business data - Restaurant vertical
$projectData = [
    'name' => 'Bella Cucina Test',
    'slug' => 'bella-cucina-test',
    'businessName' => 'Bella Cucina Test',
    'businessCategory' => 'restaurant',
    'tagline' => 'Authentic Italian cuisine, family hospitality',
    'description' => 'A modern Italian restaurant serving artisanal pasta and fresh ingredients in the heart of downtown',
    'vertical' => 'restaurant',
    'colors' => [
        'primary' => '#8B0000',      // Dark red (like in your screenshots)
        'secondary' => '#D4AF37',    // Gold
        'accent' => '#2C5F2D',       // Dark green
        'background' => '#ffffff',   // White
        'foreground' => '#1a1a1a'    // Dark gray/black
    ],
    'fontFamily' => 'Playfair Display',
    'heroLayout' => 'fullBleed',
    'logo' => null,
    'core' => 'ollie'
];

try {
    // Step 1: Use manual tokens (skip AI generation)
    echo "Step 1: Using manual content tokens (AI skipped)...\n";
    $tokens = [
        'BUSINESS_NAME' => 'Bella Cucina Test',

        // Hero Section
        'HERO_PRETITLE' => 'Welcome to',
        'HERO_TITLE' => 'Bella Cucina',
        'HERO_HEADLINE' => 'Authentic Italian Dining',
        'HERO_SUBHEADLINE' => 'Experience the flavors of Italy in every bite',
        'HERO_TEXT' => 'Discover traditional Italian cuisine prepared with passion and the finest ingredients.',
        'HERO_CTA' => 'View Menu',
        'HERO_CTA_PRIMARY' => 'View Menu',
        'HERO_CTA_SECONDARY' => 'Make Reservation',

        // About Section
        'ABOUT_TITLE' => 'Our Story',
        'ABOUT_TEXT' => 'Since 2010, Bella Cucina has been serving authentic Italian cuisine made with love and the finest ingredients.',
        'ABOUT_TEXT_2' => 'Our family recipes, passed down through generations, bring the true taste of Italy to your table.',

        // Features Section
        'FEATURES_TITLE' => 'Why Choose Us',
        'FEATURES_SUBTITLE' => 'What makes our Italian restaurant special',
        'FEATURE_1_TITLE' => 'Authentic Recipes',
        'FEATURE_1_TEXT' => 'Traditional Italian recipes from our family kitchen',
        'FEATURE_2_TITLE' => 'Fresh Ingredients',
        'FEATURE_2_TEXT' => 'Locally sourced produce and imported Italian specialty items',
        'FEATURE_3_TITLE' => 'Expert Chefs',
        'FEATURE_3_TEXT' => 'Trained in Italy with decades of culinary experience',

        // Services Section
        'SERVICES_TITLE' => 'What We Offer',
        'SERVICE_1_TITLE' => 'Fine Dining',
        'SERVICE_1_DESC' => 'Exceptional Italian cuisine in an elegant atmosphere',
        'SERVICE_2_TITLE' => 'Private Events',
        'SERVICE_2_DESC' => 'Host your special occasions in our private dining room',
        'SERVICE_3_TITLE' => 'Catering',
        'SERVICE_3_DESC' => 'Bring authentic Italian flavors to your next event',

        // Menu Section
        'MENU_TITLE' => 'Our Menu',
        'MENU_SUBTITLE' => 'Explore our selection of authentic Italian dishes',
        'MENU_CAT_1_NAME' => 'Appetizers',
        'MENU_ITEM_1_NAME' => 'Bruschetta al Pomodoro',
        'MENU_ITEM_1_DESC' => 'Toasted bread with fresh tomatoes, basil, and garlic',
        'MENU_ITEM_1_PRICE' => '$8.95',
        'MENU_ITEM_2_NAME' => 'Calamari Fritti',
        'MENU_ITEM_2_DESC' => 'Lightly fried squid served with marinara sauce',
        'MENU_ITEM_2_PRICE' => '$12.95',
        'MENU_ITEM_3_NAME' => 'Caprese Salad',
        'MENU_ITEM_3_DESC' => 'Fresh mozzarella, tomatoes, and basil with balsamic',
        'MENU_ITEM_3_PRICE' => '$10.95',
        'MENU_CAT_2_NAME' => 'Main Courses',
        'MENU_ITEM_4_NAME' => 'Spaghetti Carbonara',
        'MENU_ITEM_4_DESC' => 'Classic Roman pasta with pancetta and eggs',
        'MENU_ITEM_4_PRICE' => '$18.95',
        'MENU_ITEM_5_NAME' => 'Chicken Parmigiana',
        'MENU_ITEM_5_DESC' => 'Breaded chicken breast with marinara and mozzarella',
        'MENU_ITEM_5_PRICE' => '$22.95',
        'MENU_ITEM_6_NAME' => 'Risotto ai Funghi',
        'MENU_ITEM_6_DESC' => 'Creamy mushroom risotto with porcini',
        'MENU_ITEM_6_PRICE' => '$19.95',

        // Specials Section
        'SPECIALS_TITLE' => "Today's Specials",
        'SPECIALS_SUBTITLE' => 'Chef-selected dishes featuring seasonal ingredients',
        'SPECIAL_1_NAME' => 'Osso Buco',
        'SPECIAL_1_DESC' => 'Braised veal shanks with saffron risotto',
        'SPECIAL_1_PRICE' => '$32.95',
        'SPECIAL_2_NAME' => 'Linguine alle Vongole',
        'SPECIAL_2_DESC' => 'Fresh clams in white wine sauce',
        'SPECIAL_2_PRICE' => '$24.95',
        'SPECIAL_3_NAME' => 'Tiramisu',
        'SPECIAL_3_DESC' => 'Classic Italian dessert with espresso',
        'SPECIAL_3_PRICE' => '$8.95',

        // Hours & Location
        'HOURS_WEEKDAY_LABEL' => 'Tuesday - Friday',
        'HOURS_WEEKDAY_TIMES' => '5:00 PM - 10:00 PM',
        'HOURS_WEEKEND_LABEL' => 'Saturday - Sunday',
        'HOURS_WEEKEND_TIMES' => '12:00 PM - 11:00 PM',
        'LOCATION_ADDRESS' => '123 Main Street, Downtown',
        'LOCATION_PHONE' => '(555) 123-4567',
        'LOCATION_NOTE' => 'Closed Mondays',

        // Chef Section
        'CHEF_NAME' => 'Chef Marco Rossi',
        'CHEF_TITLE' => 'Executive Chef',
        'CHEF_BIO' => 'With 25 years of experience in Italian kitchens, Chef Marco brings authentic flavors from his hometown in Tuscany.',

        // Team Section
        'TEAM_TITLE' => 'Meet Our Team',
        'TEAM_SUBTITLE' => 'Passionate professionals dedicated to your dining experience',
        'TEAM_1_NAME' => 'Marco Rossi',
        'TEAM_1_ROLE' => 'Executive Chef',
        'TEAM_1_BIO' => '25 years of culinary expertise from Tuscany',
        'TEAM_2_NAME' => 'Sofia Bellini',
        'TEAM_2_ROLE' => 'Sous Chef',
        'TEAM_2_BIO' => 'Specializes in fresh pasta and traditional sauces',
        'TEAM_3_NAME' => 'Giovanni Costa',
        'TEAM_3_ROLE' => 'Pastry Chef',
        'TEAM_3_BIO' => 'Master of Italian desserts and artisan breads',

        // Gallery Section
        'GALLERY_TITLE' => 'Our Atmosphere',
        'GALLERY_SUBTITLE' => 'A glimpse into our Italian dining experience',
        'GALLERY_ALT_1' => 'Elegant dining room with warm lighting',
        'GALLERY_ALT_2' => 'Handmade pasta being prepared',
        'GALLERY_ALT_3' => 'Fresh ingredients and herbs',
        'GALLERY_ALT_4' => 'Signature Italian dishes',
        'GALLERY_ALT_5' => 'Wine selection and bar area',
        'GALLERY_ALT_6' => 'Chef plating a dish',

        // Testimonials
        'TESTIMONIALS_TITLE' => 'What Our Guests Say',
        'TESTIMONIAL_1_TEXT' => 'The best Italian food outside of Italy! Every dish is perfection.',
        'TESTIMONIAL_1_NAME' => 'Maria Gonzalez',
        'TESTIMONIAL_1_ROLE' => 'Food Critic',
        'TESTIMONIAL_2_TEXT' => 'Wonderful atmosphere and incredible pasta. Highly recommend!',
        'TESTIMONIAL_2_NAME' => 'John Smith',
        'TESTIMONIAL_2_ROLE' => 'Regular Customer',
        'TESTIMONIAL_3_TEXT' => 'Perfect for special occasions. The service is impeccable.',
        'TESTIMONIAL_3_NAME' => 'Sarah Williams',
        'TESTIMONIAL_3_ROLE' => 'Event Planner',

        // Reservation CTA
        'RESERVATION_TITLE' => 'Reserve Your Table Today',
        'RESERVATION_TEXT' => "Whether you're planning an intimate dinner or celebrating with loved ones, we'd love to welcome you to Bella Cucina. Call us to make your reservation or walk-ins are always welcome.",
        'RESERVATION_CTA' => 'Call (555) 123-4567 to Reserve',

        // Page Banner (for interior pages)
        'PAGE_BANNER_EYEBROW' => 'Welcome',
        'PAGE_BANNER_TITLE' => 'Bella Cucina',
        'PAGE_BANNER_TEXT' => 'Authentic Italian cuisine in the heart of downtown',

        // Contact Section
        'CONTACT_TITLE' => 'Get In Touch',
        'CONTACT_TEXT' => 'Have questions about our menu, hours, or reservations? We\'re here to help and love hearing from our guests.',
        'CONTACT_ADDRESS' => '123 Main Street, Downtown',
        'CONTACT_PHONE' => '(555) 123-4567',
        'CONTACT_EMAIL' => 'hello@bellacucina.com',
        'CONTACT_HOURS' => 'Tuesday-Sunday, 5:00 PM - 11:00 PM',
        'ADDRESS' => '123 Main Street, Downtown',
        'PHONE' => '(555) 123-4567',
        'EMAIL' => 'hello@bellacucina.com',
    ];
    echo "   ✓ Generated " . count($tokens) . " manual tokens\n\n";

    // Step 2: PatternSelector picks skeletons
    echo "Step 2: Selecting patterns for restaurant vertical...\n";
    $patternSelector = app(PatternSelector::class);
    $skeletonSelections = $patternSelector->select('restaurant', $projectData['heroLayout'] ?? null);

    echo "   Selected patterns:\n";
    foreach ($skeletonSelections as $pageType => $patterns) {
        echo "     {$pageType}: " . count($patterns) . " sections\n";
    }
    echo "\n";

    // Step 3: ImageHandler gets placeholder URLs
    echo "Step 3: Generating image URLs...\n";
    $imageHandler = new ImageHandler(new UnsplashProvider, new PlaceholderProvider);

    // Extract image tokens from skeletons
    $imageTokens = [];
    foreach ($skeletonSelections as $pageType => $patterns) {
        foreach ($patterns as $pattern) {
            $requiredTokens = $pattern['required_tokens'] ?? [];
            foreach ($requiredTokens as $token) {
                if (str_starts_with($token, 'IMAGE_')) {
                    $imageTokens[] = $token;
                }
            }
        }
    }
    $imageTokens = array_unique($imageTokens);

    $tempDir = sys_get_temp_dir() . '/bella-test-assets';
    if (!is_dir($tempDir)) {
        mkdir($tempDir, 0755, true);
    }

    $imageResult = $imageHandler->generateImages($projectData, $tempDir, $imageTokens);
    $allTokens = array_merge($tokens, $imageResult['urls']);
    echo "   ✓ Generated " . count($imageResult['urls']) . " image URLs\n\n";

    // Step 4: TokenInjector processes skeletons
    echo "Step 4: Processing skeletons with TokenInjector...\n";
    $tokenInjector = app(TokenInjector::class);
    $tokenInjector->setCore('ollie');
    $pageHtml = $tokenInjector->processSkeletons($skeletonSelections, $allTokens);

    echo "   Processed pages:\n";
    foreach ($pageHtml as $pageType => $html) {
        echo "     {$pageType}: " . number_format(strlen($html)) . " bytes\n";
    }
    echo "\n";

    // Step 5: ThemeAssembler builds the theme
    echo "Step 5: Assembling theme files...\n";
    $themeAssembler = app(ThemeAssembler::class);
    $themeAssembler->setCore('ollie');
    $assembled = $themeAssembler->assemble($projectData, $allTokens, $pageHtml);

    echo "   ✓ Theme assembled at: {$assembled['themeDir']}\n";
    echo "   ✓ ZIP created at: {$assembled['zipPath']}\n\n";

    // Extract ZIP to inspect contents
    $extractDir = sys_get_temp_dir() . '/bella-test-extracted';
    if (is_dir($extractDir)) {
        exec("rm -rf " . escapeshellarg($extractDir));
    }
    mkdir($extractDir, 0755, true);

    echo "Step 6: Extracting ZIP for inspection...\n";
    $zip = new ZipArchive;
    if ($zip->open($assembled['zipPath']) === TRUE) {
        $zip->extractTo($extractDir);
        $zip->close();
        echo "   ✓ Extracted to: {$extractDir}\n\n";
    }

    // Inspect key files
    echo "=== INSPECTION RESULTS ===\n\n";

    // Check theme.json
    $themeJsonPath = $extractDir . '/bella-cucina-test/theme.json';
    if (file_exists($themeJsonPath)) {
        echo "1. theme.json color palette:\n";
        $themeJson = json_decode(file_get_contents($themeJsonPath), true);
        if (isset($themeJson['settings']['color']['palette'])) {
            foreach ($themeJson['settings']['color']['palette'] as $colorEntry) {
                $slug = $colorEntry['slug'] ?? 'unknown';
                $color = $colorEntry['color'] ?? 'unknown';
                echo "     {$slug}: {$color}\n";
                if (in_array($slug, ['base', 'primary', 'contrast'])) {
                    echo "       ^ CRITICAL COLOR\n";
                }
            }
        }
        echo "\n";

        // Check for global styles section
        echo "2. theme.json global styles:\n";
        if (isset($themeJson['styles'])) {
            echo "   Styles section exists:\n";
            echo "   " . json_encode($themeJson['styles'], JSON_PRETTY_PRINT) . "\n";
        } else {
            echo "   ✓ No global styles section (good - no overrides)\n";
        }
        echo "\n";
    }

    // Check front-page.html for textColor attributes
    $frontPagePath = $extractDir . '/bella-cucina-test/templates/front-page.html';
    if (file_exists($frontPagePath)) {
        echo "3. front-page.html textColor analysis:\n";
        $frontPageHtml = file_get_contents($frontPagePath);

        // Count textColor occurrences
        preg_match_all('/"textColor":"([^"]+)"/', $frontPageHtml, $textColorMatches);
        $colorCounts = array_count_values($textColorMatches[1]);

        echo "   textColor usage:\n";
        foreach ($colorCounts as $color => $count) {
            echo "     {$color}: {$count} occurrences\n";
        }
        echo "\n";

        // Look for dark background sections specifically
        echo "4. Dark background sections check:\n";
        if (preg_match('/"backgroundColor":"primary"/', $frontPageHtml)) {
            echo "   Found backgroundColor:primary section\n";

            // Extract that section and check its textColor
            preg_match('/<!-- wp:group[^>]*"backgroundColor":"primary".*?-->(.*?)<!-- \/wp:group -->/s', $frontPageHtml, $primarySection);
            if (isset($primarySection[1])) {
                $sectionHtml = $primarySection[1];
                preg_match_all('/"textColor":"([^"]+)"/', $sectionHtml, $sectionColors);
                echo "   Text colors in primary background section: " . implode(', ', array_unique($sectionColors[1])) . "\n";

                // Check headings specifically
                preg_match_all('/<!-- wp:heading[^>]*({[^}]*})/', $sectionHtml, $headingMatches);
                echo "   Headings in this section:\n";
                foreach ($headingMatches[1] as $i => $json) {
                    $attrs = json_decode($json, true);
                    $textColor = $attrs['textColor'] ?? 'NOT SET';
                    echo "     Heading " . ($i+1) . ": textColor = {$textColor}\n";
                }
            }
        }
        echo "\n";
    }

    // Output file paths for manual inspection
    echo "=== FILES FOR MANUAL INSPECTION ===\n";
    echo "Extracted theme: {$extractDir}/bella-cucina-test/\n";
    echo "ZIP file: {$assembled['zipPath']}\n\n";

    echo "Key files to check:\n";
    echo "  - theme.json (color definitions)\n";
    echo "  - templates/front-page.html (HTML output)\n";
    echo "  - style.css (might have color overrides)\n\n";

} catch (\Exception $e) {
    echo "\nERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "\nStack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}

echo "=== GENERATION COMPLETE ===\n";
