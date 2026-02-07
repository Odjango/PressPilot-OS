<?php

return [
    'domain' => null,
    'path' => 'horizon',
    'use' => 'default',
    'prefix' => env('HORIZON_PREFIX', 'presspilot_horizon:'),
    'auth_token' => env('HORIZON_AUTH_TOKEN'),

    'waiter' => [
        'enabled' => false,
    ],

    'trim' => [
        'recent' => 60,
        'pending' => 60,
        'completed' => 60,
        'recent_failed' => 10080,
        'failed' => 10080,
        'monitored' => 10080,
    ],

    'silenced' => [],

    'environments' => [
        'production' => [
            'generator-supervisor' => [
                'connection' => 'redis',
                'queue' => ['generate'],
                'balance' => false,
                'processes' => 1,
                'tries' => 2,
                'timeout' => 360,
                'memory' => 512,
                'nice' => 0,
            ],
            'default-supervisor' => [
                'connection' => 'redis',
                'queue' => ['default'],
                'balance' => 'simple',
                'processes' => 3,
                'tries' => 3,
                'timeout' => 60,
                'memory' => 256,
                'nice' => 0,
            ],
        ],
        'local' => [
            'generator-supervisor' => [
                'connection' => 'redis',
                'queue' => ['generate'],
                'balance' => false,
                'processes' => 1,
                'tries' => 2,
                'timeout' => 360,
                'memory' => 512,
            ],
            'default-supervisor' => [
                'connection' => 'redis',
                'queue' => ['default'],
                'balance' => 'simple',
                'processes' => 1,
                'tries' => 3,
                'timeout' => 60,
                'memory' => 256,
            ],
        ],
    ],
];
