<?php
/**
 * Skeleton File Linter
 *
 * Validates all skeleton files before they ship.
 * Usage: php scripts/lint-skeletons.php
 */

$skeletonsDir = __DIR__ . '/../pattern-library/skeletons';
$errors = [];
$warnings = [];
$filesProcessed = 0;

// Get all .html files
$files = glob($skeletonsDir . '/*.html');

if (empty($files)) {
    echo "ERROR: No skeleton files found in $skeletonsDir\n";
    exit(1);
}

foreach ($files as $filePath) {
    $filesProcessed++;
    $filename = basename($filePath);
    $content = file_get_contents($filePath);

    // CHECK A: No brand colors on body paragraphs
    preg_match_all('/<p[^>]*class="[^"]*has-(primary|secondary)-color[^"]*"[^>]*>([^<]+)<\/p>/', $content, $matches, PREG_SET_ORDER);
    foreach ($matches as $match) {
        $fullTag = $match[0];
        $colorType = $match[1];
        $textContent = $match[2];

        // Check if it's an eyebrow (small font, uppercase, or specific styling)
        $isEyebrow = (
            strpos($fullTag, 'has-x-small-font-size') !== false ||
            strpos($fullTag, 'has-small-font-size') !== false ||
            strpos($fullTag, 'text-transform:uppercase') !== false ||
            strpos($fullTag, 'letter-spacing') !== false
        );

        // Check if it's a price (contains $ or price token)
        $isPrice = (
            strpos($textContent, '$') !== false ||
            strpos($textContent, 'PRICE') !== false
        );

        // Check if it's stars (rating)
        $isStars = strpos($textContent, '★') !== false;

        // Check if it's a large decorative number (like "01", "02" with font-size:3rem)
        $isLargeNumber = (
            preg_match('/^\d+$/', trim($textContent)) && // Is a number
            strpos($fullTag, 'font-size:3rem') !== false // Has large font size
        );

        if (!$isEyebrow && !$isPrice && !$isStars && !$isLargeNumber) {
            $errors[] = [
                'file' => $filename,
                'check' => 'CHECK A',
                'severity' => 'ERROR',
                'message' => "Brand color on body paragraph: has-{$colorType}-color on non-eyebrow/non-price paragraph"
            ];
        }
    }

    // CHECK B: No data-aos on block wrappers
    preg_match_all('/class="wp-block-[^"]*"[^>]*data-aos=/', $content, $blockAosMatches);
    if (!empty($blockAosMatches[0])) {
        foreach ($blockAosMatches[0] as $match) {
            $errors[] = [
                'file' => $filename,
                'check' => 'CHECK B',
                'severity' => 'ERROR',
                'message' => "data-aos attribute on WordPress block wrapper - must be on outer wrapper div"
            ];
        }
    }

    // CHECK C: All wp:image blocks have aspectRatio
    preg_match_all('/<!-- wp:image \{([^}]+)\} -->/', $content, $imageMatches, PREG_SET_ORDER);
    foreach ($imageMatches as $match) {
        $blockJson = '{' . $match[1] . '}';
        if (strpos($blockJson, 'aspectRatio') === false && strpos($blockJson, '"style"') === false) {
            $warnings[] = [
                'file' => $filename,
                'check' => 'CHECK C',
                'severity' => 'WARNING',
                'message' => "wp:image block missing aspectRatio in style attribute"
            ];
        }
    }

    // CHECK D: Valid JSON in all block comments
    preg_match_all('/<!-- wp:\w+(?:\/\w+)? (\{[^}]+\}) -->/', $content, $jsonMatches, PREG_SET_ORDER);
    foreach ($jsonMatches as $match) {
        $blockJson = $match[1];

        // Fix common JSON issues for validation
        $testJson = str_replace("'", '"', $blockJson);
        $testJson = preg_replace('/(\w+):/', '"$1":', $testJson); // Add quotes to keys if missing

        $decoded = json_decode($blockJson);
        if (json_last_error() !== JSON_ERROR_NONE) {
            $errors[] = [
                'file' => $filename,
                'check' => 'CHECK D',
                'severity' => 'ERROR',
                'message' => "Invalid JSON in block comment: " . json_last_error_msg() . " - " . substr($blockJson, 0, 100)
            ];
        }
    }

    // CHECK E: No navigation ref attributes
    if (preg_match('/"ref"\s*:\s*\d+/', $content)) {
        $errors[] = [
            'file' => $filename,
            'check' => 'CHECK E',
            'severity' => 'ERROR',
            'message' => "wp:navigation block contains 'ref' attribute (violates PressPilot hard rule)"
        ];
    }

    // CHECK F: Block tag balance
    $opens = substr_count($content, '<!-- wp:');
    $closes = substr_count($content, '<!-- /wp:');
    $selfClosing = substr_count($content, '/-->');
    $expectedCloses = $opens - $selfClosing;

    if ($closes !== $expectedCloses) {
        $errors[] = [
            'file' => $filename,
            'check' => 'CHECK F',
            'severity' => 'ERROR',
            'message' => "Block tag mismatch — {$opens} opens, {$selfClosing} self-closing, {$closes} closes (expected {$expectedCloses} closes)"
        ];
    }
}

// Output results
$hasOutput = false;

if (!empty($errors)) {
    echo "\n=== ERRORS ===\n";
    foreach ($errors as $error) {
        echo "{$error['file']} | {$error['check']} | {$error['severity']} | {$error['message']}\n";
    }
    $hasOutput = true;
}

if (!empty($warnings)) {
    echo "\n=== WARNINGS ===\n";
    foreach ($warnings as $warning) {
        echo "{$warning['file']} | {$warning['check']} | {$warning['severity']} | {$warning['message']}\n";
    }
    $hasOutput = true;
}

// Summary
echo "\n=== SUMMARY ===\n";
echo "Files processed: $filesProcessed\n";
echo "Errors: " . count($errors) . "\n";
echo "Warnings: " . count($warnings) . "\n";

if (!$hasOutput) {
    echo "\n✓ All checks passed!\n";
}

// Exit code
exit(count($errors) > 0 ? 1 : 0);
