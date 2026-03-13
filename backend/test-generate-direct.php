<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Services\AIPlanner;
use App\Services\PatternSelector;
use App\Services\TokenInjector;
use App\Services\ImageHandler;
use App\Services\ThemeAssembler;

// Test business data
$businessData = [
    'businessName' => 'Test Diagnostics Cafe',
    'tagline' => 'Fresh food and great vibes',
    'description' => 'A modern cafe serving artisanal coffee and fresh pastries in the heart of downtown',
    'category' => 'restaurant',
    'colors' => [
        'primary' => '#2C5F2D',
        'secondary' => '#97BC62',
        'accent' => '#FF6B35'
    ],
    'fonts' => [
        'heading' => 'Playfair Display',
        'body' => 'Source Sans 3'
    ],
    'heroLayout' => 'fullBleed',
    'logo' => null
];

$vertical = 'restaurant';
$outputDir = __DIR__ . '/storage/app/test-theme-output';

// Create output directory
if (!file_exists($outputDir)) {
    mkdir($outputDir, 0755, true);
}

echo "=== THEME GENERATION TEST ===\n\n";

try {
    // Step 1: AI Planning
    echo "Step 1: Generating tokens...\n";
    $aiPlanner = app(AIPlanner::class);
    $tokens = $aiPlanner->generateTokens($businessData, $vertical);
    echo "Generated " . count($tokens) . " tokens\n\n";

    // Step 2: Pattern Selection
    echo "Step 2: Selecting patterns...\n";
    $patternSelector = app(PatternSelector::class);
    $selectedPatterns = $patternSelector->selectPatterns($vertical, $businessData['heroLayout'] ?? 'split');
    echo "Selected patterns for:\n";
    echo "- Home: " . count($selectedPatterns['home'] ?? []) . " sections\n";
    echo "- About: " . count($selectedPatterns['about'] ?? []) . " sections\n";
    echo "- Services: " . count($selectedPatterns['services'] ?? []) . " sections\n";
    echo "- Contact: " . count($selectedPatterns['contact'] ?? []) . " sections\n\n";

    // Step 3: Token Injection
    echo "Step 3: Injecting tokens into patterns...\n";
    $tokenInjector = app(TokenInjector::class);
    $injectedPatterns = $tokenInjector->injectTokens($selectedPatterns, $tokens);
    echo "Patterns processed\n\n";

    // Step 4: Image Handling
    echo "Step 4: Resolving image URLs...\n";
    $imageHandler = app(ImageHandler::class);
    $imageUrls = $imageHandler->getImageUrls($tokens, $businessData['category']);
    echo "Resolved " . count($imageUrls) . " image URLs\n\n";

    // Step 5: Theme Assembly
    echo "Step 5: Assembling theme files...\n";
    $themeAssembler = app(ThemeAssembler::class);
    $themeSlug = 'test-diagnostics-cafe';
    $themePath = $themeAssembler->assembleTheme(
        $themeSlug,
        $businessData,
        $injectedPatterns,
        $imageUrls,
        $outputDir
    );

    echo "\n=== GENERATION COMPLETE ===\n";
    echo "Theme files created in: {$outputDir}/{$themeSlug}/\n\n";

    echo "Key files to examine:\n";
    echo "- theme.json\n";
    echo "- templates/front-page.html\n";
    echo "- parts/header.html\n";
    echo "- parts/footer.html\n";

} catch (\Exception $e) {
    echo "\nERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "\nStack trace:\n" . $e->getTraceAsString() . "\n";
}
