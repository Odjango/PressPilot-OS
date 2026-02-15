<?php

namespace App\Http\Controllers;

use App\Jobs\GenerateThemeJob;
use App\Models\GeneratedTheme;
use App\Models\GenerationJob;
use App\Models\Project;
use App\Services\DataTransformer;
use App\Services\MetricsLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class GenerationController extends Controller
{
    /**
     * POST /api/generate
     */
    public function generate(Request $request, DataTransformer $transformer, MetricsLogger $metrics): JsonResponse
    {
        $validated = $request->validate([
            'payload' => 'nullable|array',
            'input' => 'nullable|array',
            'user_id' => 'nullable|uuid',
        ]);

        $payload = $this->resolvePayload(
            $validated['payload'] ?? null,
            $validated['input'] ?? null
        );

        if (! $payload) {
            return response()->json([
                'error' => 'Invalid Input',
                'details' => 'Either payload or input is required',
            ], 400);
        }

        $generatorData = $transformer->transformSaaSInputToGeneratorData($payload);
        $projectName = (string) ($generatorData['name'] ?? 'Untitled Project');

        // M1 auth bypass compatibility: resolve user_id from request or existing data.
        $userId = $validated['user_id']
            ?? config('app.presspilot_demo_user_id')
            ?? Project::query()->value('user_id')
            ?? (string) Str::uuid();

        $project = Project::create([
            'user_id' => $userId,
            'name' => $projectName,
            'site_type' => $transformer->mapBusinessCategoryToSiteType(
                (string) data_get($payload, 'brand.business_category', '')
            ),
            'language' => (string) data_get($payload, 'language.primary_language', 'en'),
            'data' => $generatorData,
        ]);

        $job = GenerationJob::create([
            'project_id' => $project->id,
            'status' => GenerationJob::STATUS_PENDING,
            'type' => GenerationJob::TYPE_GENERATE,
        ]);

        GenerateThemeJob::dispatch($job);

        $metrics->emit('job.dispatched', [
            'job_id' => $job->id,
            'project_id' => $project->id,
            'queue' => 'generate',
        ]);

        return response()->json([
            'success' => true,
            'jobId' => $job->id,
            'projectId' => $project->id,
        ], 202);
    }

    /**
     * POST /api/regenerate
     */
    public function regenerate(Request $request, MetricsLogger $metrics): JsonResponse
    {
        $validated = $request->validate([
            'projectId' => 'required|uuid',
        ]);

        $project = Project::find($validated['projectId']);
        if (! $project) {
            return response()->json(['error' => 'Project not found'], 404);
        }

        $job = GenerationJob::create([
            'project_id' => $project->id,
            'status' => GenerationJob::STATUS_PENDING,
            'type' => GenerationJob::TYPE_REGENERATE,
        ]);

        GenerateThemeJob::dispatch($job);

        $metrics->emit('job.dispatched', [
            'job_id' => $job->id,
            'project_id' => $project->id,
            'queue' => 'generate',
        ]);

        return response()->json([
            'success' => true,
            'jobId' => $job->id,
        ], 202);
    }

    /**
     * GET /api/status?id={jobId}
     */
    public function status(Request $request, MetricsLogger $metrics): JsonResponse
    {
        $jobId = (string) $request->query('id', '');
        if ($jobId === '') {
            return response()->json(['error' => 'Job ID required'], 400);
        }

        /** @var GenerationJob|null $job */
        $job = GenerationJob::find($jobId);
        if (! $job) {
            return response()->json(['error' => 'Job not found'], 404);
        }

        $themeData = null;
        $themeUrl = null;
        $staticUrl = null;

        if ($job->status === GenerationJob::STATUS_COMPLETED) {
            $theme = GeneratedTheme::where('job_id', $job->id)->first();
            if ($theme) {
                $themeData = [
                    'id' => $theme->id,
                    'job_id' => $theme->job_id,
                    'file_path' => $theme->file_path,
                    'status' => $theme->status,
                    'expires_at' => $theme->expires_at?->toIso8601String(),
                ];

                if ($theme->status === GeneratedTheme::STATUS_ACTIVE) {
                    try {
                        $themeUrl = Storage::disk('supabase')
                            ->temporaryUrl($theme->file_path, now()->addSeconds(3600));
                        $metrics->emit('storage.signed_url_generated', [
                            'path' => $theme->file_path,
                            'ttl_seconds' => 3600,
                        ]);
                    } catch (\Throwable) {
                        $themeUrl = null;
                    }
                }
            }

            $staticPath = data_get($job->result, 'static_path');
            if (is_string($staticPath) && $staticPath !== '') {
                try {
                    $staticUrl = Storage::disk('supabase')
                        ->temporaryUrl($staticPath, now()->addSeconds(3600));
                    $metrics->emit('storage.signed_url_generated', [
                        'path' => $staticPath,
                        'ttl_seconds' => 3600,
                    ]);
                } catch (\Throwable) {
                    $staticUrl = null;
                }
            }
        }

        return response()->json([
            'id' => $job->id,
            'project_id' => $job->project_id,
            'status' => $job->status,
            'type' => $job->type,
            'result' => $job->result,
            'created_at' => $job->created_at?->toIso8601String(),
            'updated_at' => $job->updated_at?->toIso8601String(),
            'generated_theme' => $themeData,
            'themeUrl' => $themeUrl,
            'staticUrl' => $staticUrl,
        ]);
    }

    /**
     * GET /api/download?kind=theme|static&jobId=... or slug=...
     */
    public function download(Request $request, MetricsLogger $metrics): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'kind' => 'required|in:theme,static',
            'jobId' => 'nullable|uuid',
            'slug' => 'nullable|string|max:80|regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
        ]);

        $jobId = (string) ($validated['jobId'] ?? $validated['slug'] ?? '');
        if ($jobId === '') {
            return response()->json(['error' => 'jobId or slug query param is required'], 400);
        }

        $job = GenerationJob::find($jobId);
        if (! $job) {
            return response()->json(['error' => 'Job not found'], 404);
        }

        $path = $validated['kind'] === 'theme'
            ? data_get($job->result, 'download_path')
            : data_get($job->result, 'static_path');

        if (! is_string($path) || $path === '') {
            return response()->json(['error' => 'File not found'], 404);
        }

        try {
            $url = Storage::disk('supabase')->temporaryUrl($path, now()->addSeconds(3600));
            $metrics->emit('storage.signed_url_generated', [
                'path' => $path,
                'ttl_seconds' => 3600,
            ]);

            return redirect()->away($url);
        } catch (\Throwable $e) {
            return response()->json([
                'error' => 'Unable to generate download URL',
                'details' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Build canonical SaaS payload from either payload or Studio input.
     *
     * @param  array<string, mixed>|null  $payload
     * @param  array<string, mixed>|null  $input
     * @return array<string, mixed>|null
     */
    private function resolvePayload(?array $payload, ?array $input): ?array
    {
        if (is_array($payload)) {
            return $payload;
        }

        if (! is_array($input)) {
            return null;
        }

        $businessName = trim((string) ($input['businessName'] ?? ''));
        $description = trim((string) ($input['businessDescription'] ?? ''));

        if ($businessName === '' || $description === '') {
            return null;
        }

        $category = $this->resolveBusinessCategory((string) ($input['businessCategory'] ?? ''));
        $language = $this->resolveLanguage((string) ($input['primaryLanguage'] ?? 'en'));
        $slug = (string) ($input['slug'] ?? Str::slug($businessName));
        $slug = mb_substr($slug, 0, 60);

        $palette = is_array($input['palette'] ?? null) ? $input['palette'] : null;

        return [
            'brand' => [
                'business_name' => $businessName,
                'business_category' => $category,
                'business_tagline' => (string) ($input['heroTitle'] ?? 'Welcome'),
                'slug' => $slug,
            ],
            'narrative' => [
                'description_long' => $description,
            ],
            'language' => [
                'primary_language' => $language,
                'rtl_required' => $language === 'ar',
            ],
            'modes' => [
                'business_category' => $category,
                'restaurant' => [
                    'enabled' => $category === 'restaurant_cafe',
                    'menus' => $input['menus'] ?? null,
                ],
                'ecommerce' => [
                    'enabled' => $category === 'ecommerce',
                ],
            ],
            'visualControls' => [
                'palette_id' => (string) ($input['paletteId'] ?? 'pp-slate'),
                'font_pair_id' => (string) ($input['fontPairId'] ?? 'pp-inter'),
                'layout_density' => 'balanced',
                'corner_style' => 'rounded',
                'custom_colors' => $palette ? [
                    'primary' => $palette['primary'] ?? null,
                    'secondary' => $palette['secondary'] ?? null,
                    'accent' => $palette['accent'] ?? null,
                ] : null,
                'selectedPaletteId' => $input['selectedPaletteId'] ?? null,
                'userEditedBrandKit' => $input['userEditedBrandKit'] ?? null,
                'fontProfile' => $input['fontProfile'] ?? null,
                'heroLayout' => $input['heroLayout'] ?? null,
                'brandStyle' => $input['brandStyle'] ?? null,
            ],
            'visualAssets' => [
                'has_logo' => ! empty($input['logoBase64']) || ! empty($input['logoPath']),
                'logo_file_url' => $input['logoBase64'] ?? $input['logoPath'] ?? null,
                'image_source_preference' => 'mixed',
                'image_keywords' => [$category, 'business'],
            ],
            'contact' => [
                'email' => $input['contactEmail'] ?? null,
                'phone' => $input['contactPhone'] ?? null,
                'address' => $input['contactAddress'] ?? null,
                'city' => $input['contactCity'] ?? null,
                'state' => $input['contactState'] ?? null,
                'zip' => $input['contactZip'] ?? null,
                'country' => $input['contactCountry'] ?? null,
                'openingHours' => $input['openingHours'] ?? null,
                'socialLinks' => $input['socialLinks'] ?? null,
            ],
        ];
    }

    private function resolveLanguage(string $code): string
    {
        $normalized = str_replace('-', '_', strtolower($code));

        return match ($normalized) {
            'en', 'en_us', 'en_gb' => 'en',
            'es', 'es_es' => 'es',
            'fr' => 'fr',
            'it' => 'it',
            'ar' => 'ar',
            'de' => 'en',
            default => 'en',
        };
    }

    private function resolveBusinessCategory(string $value): string
    {
        $normalized = strtolower(trim($value));

        return match ($normalized) {
            'service' => 'service',
            'product', 'ecommerce' => 'ecommerce',
            'restaurant', 'restaurant_cafe', 'restaurant-cafe' => 'restaurant_cafe',
            'local', 'local_store', 'local-store' => 'local_store',
            'tech / saas', 'tech_startup', 'saas', 'saas_product' => 'saas_product',
            'nonprofit', 'other' => 'other',
            default => 'service',
        };
    }
}
