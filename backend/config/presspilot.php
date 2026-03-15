<?php

return [
    'ai' => [
        'provider' => env('PRESSPILOT_AI_PROVIDER', 'claude'),
        'model' => env('PRESSPILOT_AI_MODEL', 'claude-sonnet-4-5-20241022'),
        'api_key' => env('PRESSPILOT_AI_KEY'),
        'endpoint' => env('PRESSPILOT_AI_ENDPOINT', 'https://api.anthropic.com/v1/messages'),
        'max_tokens' => env('PRESSPILOT_AI_MAX_TOKENS', 4096),
    ],
    'n8n_webhook_url' => env('PRESSPILOT_N8N_WEBHOOK_URL'),
    'skip_playground_validation' => env('PRESSPILOT_SKIP_PLAYGROUND_VALIDATION', false),
];
