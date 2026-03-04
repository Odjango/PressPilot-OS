<?php

return [
    'ai' => [
        'provider' => env('PRESSPILOT_AI_PROVIDER', 'claude'),
        'model' => env('PRESSPILOT_AI_MODEL', 'claude-sonnet-4'),
        'api_key' => env('PRESSPILOT_AI_KEY'),
        'endpoint' => env('PRESSPILOT_AI_ENDPOINT', 'https://api.anthropic.com/v1/messages'),
        'max_tokens' => env('PRESSPILOT_AI_MAX_TOKENS', 2048),
    ],
    'n8n_webhook_url' => env('PRESSPILOT_N8N_WEBHOOK_URL'),
];
