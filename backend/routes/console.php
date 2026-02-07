<?php

use App\Services\MetricsLogger;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Schedule;

/*
|--------------------------------------------------------------------------
| Scheduled Tasks
|--------------------------------------------------------------------------
*/

// Emit horizon.queue_depth metric every 60 seconds
Schedule::call(function () {
    $metrics = app(MetricsLogger::class);
    $prefix = config('horizon.prefix', 'presspilot_horizon:');

    foreach (['generate', 'default'] as $queue) {
        $depth = (int) Redis::llen("{$prefix}queues:{$queue}");

        $metrics->emit('horizon.queue_depth', [
            'queue' => $queue,
            'depth' => $depth,
        ]);
    }
})->everyMinute()->name('queue-depth-metric');
