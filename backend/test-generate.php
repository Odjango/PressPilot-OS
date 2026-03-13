<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Jobs\GenerateThemeJob;
use Illuminate\Support\Facades\DB;

// Create a test project record
$projectId = DB::table('projects')->insertGetId([
    'name' => 'Test Diagnostics Cafe',
    'slug' => 'test-diagnostics-cafe',
    'user_id' => 1,
    'site_type' => 'restaurant',
    'language' => 'en',
    'data' => json_encode([
        'businessName' => 'Test Diagnostics Cafe',
        'tagline' => 'Fresh food and great vibes',
        'description' => 'A modern cafe serving artisanal coffee and fresh pastries',
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
    ]),
    'created_at' => now(),
    'updated_at' => now()
]);

echo "Created test project ID: {$projectId}\n";

// Dispatch the job synchronously
echo "Generating theme...\n";
$job = new GenerateThemeJob($projectId);
$job->handle();

echo "Theme generation complete!\n";
echo "Check backend/storage/app/themes/ for output\n";
