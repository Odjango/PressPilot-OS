<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Services\TokenInjector;
use App\Services\CorePaletteResolver;

echo "=== DARK SECTION TEXT COLOR TRACE ===\n\n";

// Test tokens
$tokens = [
    'SPECIALS_TITLE' => "Today's Specials",
    'SPECIALS_SUBTITLE' => 'Chef-selected dishes featuring seasonal ingredients',
    'SPECIAL_1_NAME' => 'Italian Minestrone Soup',
    'SPECIAL_1_DESC' => 'Hearty vegetable and pasta soup served with garlic toast',
    'SPECIAL_1_PRICE' => '$4.25',
    'RESERVATION_TITLE' => 'Reserve Your Table Today',
    'RESERVATION_TEXT' => 'Call us to make your reservation or walk-ins are always welcome',
    'RESERVATION_CTA' => 'Call (555) 123-4567 to Reserve',
];

// Load skeleton files
$specialsPath = base_path('../pattern-library/skeletons/specials-highlight.html');
$reservationPath = base_path('../pattern-library/skeletons/reservation-cta.html');

if (!file_exists($specialsPath) || !file_exists($reservationPath)) {
    echo "ERROR: Skeleton files not found\n";
    exit(1);
}

echo "1. Loading skeleton files...\n";
$specialsHtml = file_get_contents($specialsPath);
$reservationHtml = file_get_contents($reservationPath);
echo "   ✓ Loaded specials-highlight.html (" . strlen($specialsHtml) . " bytes)\n";
echo "   ✓ Loaded reservation-cta.html (" . strlen($reservationHtml) . " bytes)\n\n";

// Check original textColor attributes
echo "2. Original skeleton textColor attributes:\n";
preg_match_all('/"textColor":"([^"]+)"/', $specialsHtml, $specialsMatches);
preg_match_all('/"textColor":"([^"]+)"/', $reservationHtml, $reservationMatches);
echo "   Specials: " . implode(', ', array_unique($specialsMatches[1])) . "\n";
echo "   Reservation: " . implode(', ', array_unique($reservationMatches[1])) . "\n\n";

// Step 1: Token Injection
echo "3. Injecting tokens...\n";
$tokenInjector = app(TokenInjector::class);
$specialsInjected = $tokenInjector->injectTokens($specialsHtml, $tokens);
$reservationInjected = $tokenInjector->injectTokens($reservationHtml, $tokens);
echo "   ✓ Tokens injected\n\n";

// Check textColor after injection
echo "4. After token injection:\n";
preg_match_all('/"textColor":"([^"]+)"/', $specialsInjected, $specialsMatches2);
preg_match_all('/"textColor":"([^"]+)"/', $reservationInjected, $reservationMatches2);
echo "   Specials: " . implode(', ', array_unique($specialsMatches2[1])) . "\n";
echo "   Reservation: " . implode(', ', array_unique($reservationMatches2[1])) . "\n\n";

// Step 2: CorePaletteResolver (using 'ollie' core - default)
echo "5. CorePaletteResolver rewriteHtml (core: ollie)...\n";
$resolver = app(CorePaletteResolver::class);
$specialsRewritten = $resolver->rewriteHtml($specialsInjected, 'ollie');
$reservationRewritten = $resolver->rewriteHtml($reservationInjected, 'ollie');
echo "   ✓ Color slugs rewritten\n\n";

// Check textColor after rewriting
echo "6. After CorePaletteResolver:\n";
preg_match_all('/"textColor":"([^"]+)"/', $specialsRewritten, $specialsMatches3);
preg_match_all('/"textColor":"([^"]+)"/', $reservationRewritten, $reservationMatches3);
echo "   Specials: " . implode(', ', array_unique($specialsMatches3[1])) . "\n";
echo "   Reservation: " . implode(', ', array_unique($reservationMatches3[1])) . "\n\n";

// Step 3: enforceTextColorRules
echo "7. Running enforceTextColorRules...\n";
$specialsFinal = $tokenInjector->enforceTextColorRules($specialsRewritten);
$reservationFinal = $tokenInjector->enforceTextColorRules($reservationRewritten);
echo "   ✓ Text color rules enforced\n\n";

// Check textColor after enforcing rules
echo "8. FINAL OUTPUT - After enforceTextColorRules:\n";
preg_match_all('/"textColor":"([^"]+)"/', $specialsFinal, $specialsMatches4);
preg_match_all('/"textColor":"([^"]+)"/', $reservationFinal, $reservationMatches4);
echo "   Specials: " . implode(', ', array_unique($specialsMatches4[1])) . "\n";
echo "   Reservation: " . implode(', ', array_unique($reservationMatches4[1])) . "\n\n";

// Check headings specifically
echo "9. Checking wp:heading blocks:\n";
preg_match_all('/<!-- wp:heading\s+(\{[^}]*\})/', $specialsFinal, $headingMatches);
foreach ($headingMatches[1] as $i => $json) {
    $attrs = json_decode($json, true);
    $textColor = $attrs['textColor'] ?? 'NOT SET';
    echo "   Specials Heading " . ($i+1) . ": textColor = {$textColor}\n";
    echo "      Full JSON: {$json}\n";
}

preg_match_all('/<!-- wp:heading\s+(\{[^}]*\})/', $reservationFinal, $headingMatches2);
foreach ($headingMatches2[1] as $i => $json) {
    $attrs = json_decode($json, true);
    $textColor = $attrs['textColor'] ?? 'NOT SET';
    echo "   Reservation Heading " . ($i+1) . ": textColor = {$textColor}\n";
    echo "      Full JSON: {$json}\n";
}

// Also check the original skeleton before any processing
echo "\n10. VERIFICATION - Original skeleton wp:heading blocks:\n";
preg_match_all('/<!-- wp:heading\s+(\{[^}]*\})/', $specialsHtml, $origHeadingMatches);
foreach ($origHeadingMatches[1] as $i => $json) {
    $attrs = json_decode($json, true);
    $textColor = $attrs['textColor'] ?? 'NOT SET';
    echo "   Specials Heading " . ($i+1) . " (ORIGINAL): textColor = {$textColor}\n";
}

echo "\n=== TRACE COMPLETE ===\n";
