<?php

return [
    'default' => env('FILESYSTEM_DISK', 'local'),

    'disks' => [
        'local' => [
            'driver' => 'local',
            'root' => storage_path('app'),
            'throw' => false,
        ],

        'supabase' => [
            'driver' => 's3',
            'key' => env('SUPABASE_S3_ACCESS_KEY'),
            'secret' => env('SUPABASE_S3_SECRET_KEY'),
            'region' => env('SUPABASE_S3_REGION', 'us-east-1'),
            'bucket' => 'generated-themes',
            'endpoint' => 'https://' . env('SUPABASE_PROJECT_REF') . '.supabase.co/storage/v1/s3',
            'use_path_style_endpoint' => true,
            'throw' => true,
        ],
    ],
];
