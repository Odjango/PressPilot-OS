<?php

namespace App\Http\Controllers;

use App\Jobs\GenerateThemeJob;
use App\Models\GenerationJob;
use App\Models\Project;
use App\Services\MetricsLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Storage;

class InternalController extends Controller
{
    /**
     * GET /api/internal/health
     *
     * Returns connectivity status for DB, Redis, and Storage.
     */
    public function health(): JsonResponse
    {
        $checks = [];
        $httpStatus = 200;

        // Database check
        try {
            DB::connection()->getPdo();
            $checks['database'] = [
                'status' => 'connected',
                'driver' => config('database.default'),
            ];
        } catch (\Throwable $e) {
            $checks['database'] = [
                'status' => 'error',
                'error' => $e->getMessage(),
            ];
            $httpStatus = 503;
        }

        // Redis check
        try {
            Redis::ping();
            $checks['redis'] = ['status' => 'connected'];
        } catch (\Throwable $e) {
            $checks['redis'] = [
                'status' => 'error',
                'error' => $e->getMessage(),
            ];
            $httpStatus = 503;
        }

        // Supabase Storage check
        try {
            Storage::disk('supabase')->exists('health-check-probe');
            $checks['storage'] = ['status' => 'connected'];
        } catch (\Throwable $e) {
            $checks['storage'] = [
                'status' => 'error',
                'error' => $e->getMessage(),
            ];
            $httpStatus = 503;
        }

        return response()->json([
            'status' => $httpStatus === 200 ? 'ok' : 'degraded',
            'checks' => $checks,
        ], $httpStatus);
    }

    /**
     * POST /api/internal/jobs/test-dispatch
     *
     * Creates a job row with status=pending and dispatches
     * GenerateThemeJob to Horizon. For pipeline verification only.
     */
    public function testDispatch(Request $request, MetricsLogger $metrics): JsonResponse
    {
        $validated = $request->validate([
            'project_id' => 'required|uuid',
        ]);

        $project = Project::find($validated['project_id']);
        if (! $project) {
            return response()->json(['error' => 'Project not found'], 404);
        }

        $generationJob = GenerationJob::create([
            'project_id' => $validated['project_id'],
            'status' => GenerationJob::STATUS_PENDING,
            'type' => GenerationJob::TYPE_GENERATE,
        ]);

        GenerateThemeJob::dispatch($generationJob);

        $metrics->emit('job.dispatched', [
            'job_id' => $generationJob->id,
            'project_id' => $validated['project_id'],
            'queue' => 'generate',
        ]);

        return response()->json([
            'job_id' => $generationJob->id,
            'status' => 'dispatched',
        ], 202);
    }

    /**
     * GET /api/internal/jobs/{job_id}
     *
     * Returns the full state of a generation job, including result JSON
     * and signed download URLs for completed jobs (TTL 3600s).
     */
    public function show(string $jobId, MetricsLogger $metrics): JsonResponse
    {
        $job = GenerationJob::with(['project', 'generatedTheme'])->find($jobId);

        if (! $job) {
            return response()->json(['error' => 'Job not found'], 404);
        }

        $response = [
            'id' => $job->id,
            'project_id' => $job->project_id,
            'status' => $job->status,
            'type' => $job->type,
            'result' => $job->result,
            'created_at' => $job->created_at?->toIso8601String(),
            'updated_at' => $job->updated_at?->toIso8601String(),
        ];

        // Signed download URLs for completed jobs
        if ($job->status === GenerationJob::STATUS_COMPLETED && $job->result) {
            $urls = [];

            if (! empty($job->result['download_path'])) {
                try {
                    $urls['theme_zip'] = Storage::disk('supabase')
                        ->temporaryUrl($job->result['download_path'], now()->addSeconds(3600));
                    $metrics->emit('storage.signed_url_generated', [
                        'path' => $job->result['download_path'],
                        'ttl_seconds' => 3600,
                    ]);
                } catch (\Throwable $e) {
                    $urls['theme_zip_error'] = $e->getMessage();
                }
            }

            if (! empty($job->result['static_path'])) {
                try {
                    $urls['static_zip'] = Storage::disk('supabase')
                        ->temporaryUrl($job->result['static_path'], now()->addSeconds(3600));
                    $metrics->emit('storage.signed_url_generated', [
                        'path' => $job->result['static_path'],
                        'ttl_seconds' => 3600,
                    ]);
                } catch (\Throwable $e) {
                    $urls['static_zip_error'] = $e->getMessage();
                }
            }

            if (! empty($urls)) {
                $response['download_urls'] = $urls;
            }
        }

        return response()->json($response);
    }
}
