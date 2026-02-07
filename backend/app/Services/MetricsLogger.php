<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

/**
 * Emits structured JSON metrics to stderr (via Monolog JsonFormatter).
 *
 * All 8 required M0 metrics:
 *  1. job.dispatched
 *  2. job.started
 *  3. job.completed
 *  4. job.failed
 *  5. generator.subprocess_duration_ms
 *  6. storage.upload_duration_ms
 *  7. storage.signed_url_generated
 *  8. horizon.queue_depth
 */
class MetricsLogger
{
    public function emit(string $metric, array $fields = []): void
    {
        Log::info('metric', array_merge([
            'metric' => $metric,
            'timestamp' => now()->toIso8601ZuluString(),
        ], $fields));
    }
}
