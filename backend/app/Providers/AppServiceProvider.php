<?php

namespace App\Providers;

use App\Services\MetricsLogger;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(MetricsLogger::class, function () {
            return new MetricsLogger();
        });
    }

    public function boot(): void
    {
        if ($this->app->environment('production')) {
            $request = request();
            $isInternalApi = $request->is('api/internal/*');
            $isInternalIp = in_array($request->ip(), ['127.0.0.1', '10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16'])
                || str_starts_with($request->ip() ?? '', '10.');

            if (! $isInternalApi && ! $isInternalIp) {
                URL::forceScheme('https');
            }
        }
    }
}
