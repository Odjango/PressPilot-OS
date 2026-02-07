<?php

namespace App\Providers;

use Illuminate\Support\Facades\Gate;
use Laravel\Horizon\Horizon;
use Laravel\Horizon\HorizonApplicationServiceProvider;

class HorizonServiceProvider extends HorizonApplicationServiceProvider
{
    public function boot(): void
    {
        parent::boot();

        Horizon::auth(function ($request) {
            $token = $request->bearerToken() ?? $request->query('token');

            return $token === config('horizon.auth_token');
        });
    }

    protected function gate(): void
    {
        Gate::define('viewHorizon', function ($user = null) {
            // No user auth in M0 — gate handled by Horizon::auth above
            return true;
        });
    }
}
