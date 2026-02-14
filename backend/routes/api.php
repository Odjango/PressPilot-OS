<?php

use App\Http\Controllers\InternalController;
use App\Http\Controllers\GenerationController;
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

/*
|--------------------------------------------------------------------------
| M1 Public Generation Routes
|--------------------------------------------------------------------------
*/
Route::post('/generate', [GenerationController::class, 'generate']);
Route::post('/regenerate', [GenerationController::class, 'regenerate']);
Route::get('/status', [GenerationController::class, 'status']);
Route::get('/download', [GenerationController::class, 'download']);
