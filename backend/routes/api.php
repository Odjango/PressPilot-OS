<?php

use App\Http\Controllers\InternalController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| M0 Internal API Routes
|--------------------------------------------------------------------------
|
| These routes are for pipeline verification only.
| They are NOT exposed publicly — access via SSH tunnel or Docker network.
|
*/

Route::prefix('internal')->group(function () {
    Route::get('/health', [InternalController::class, 'health']);
    Route::post('/jobs/test-dispatch', [InternalController::class, 'testDispatch']);
    Route::get('/jobs/{job_id}', [InternalController::class, 'show']);
});
