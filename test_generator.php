<?php
// Mock WP constants if needed or just let the class handle it.
// The class handles missing WP functions.

require_once 'php-generator/PressPilot_Theme_Generator.php';

$generator = new PressPilot_Theme_Generator();

$request_data = [
    'business_name' => 'Test Business',
    'business_type' => 'Restaurant',
    'business_description' => 'A great place to eat.',
    'navigation' => [
        'header' => [['label' => 'Home', 'url' => '/']],
        'footer' => [['label' => 'Contact', 'url' => '/contact']]
    ]
];

$result = $generator->generate($request_data);

print_r($result);

if (isset($result['success']) && $result['success']) {
    echo "\nGenerator Success! URL: " . $result['download_url'] . "\n";
} else {
    echo "\nGenerator Failed.\n";
    exit(1);
}
