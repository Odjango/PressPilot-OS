<?php

namespace Tests\Feature;

use App\Models\GeneratedTheme;
use App\Models\GenerationJob;
use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PublicGenerationEndpointsTest extends TestCase
{
    use RefreshDatabase;

    public function test_generate_requires_payload_or_input(): void
    {
        $response = $this->postJson('/api/generate', []);

        $response->assertStatus(400)
            ->assertJsonStructure(['error', 'details']);
    }

    public function test_generate_enqueues_job_and_returns_202(): void
    {
        $payload = [
            'payload' => [
                'brand' => [
                    'business_name' => 'FlowPilot',
                    'business_tagline' => 'Ship faster',
                    'business_category' => 'saas_product',
                ],
                'narrative' => [
                    'description_long' => 'Product update automation platform.',
                ],
                'language' => [
                    'primary_language' => 'en',
                    'rtl_required' => false,
                ],
                'visualAssets' => [
                    'has_logo' => false,
                    'image_source_preference' => 'mixed',
                ],
                'visualControls' => [
                    'palette_id' => 'pp-slate',
                    'font_pair_id' => 'pp-inter',
                    'layout_density' => 'balanced',
                    'corner_style' => 'rounded',
                ],
                'modes' => [
                    'business_category' => 'saas_product',
                    'restaurant' => ['enabled' => false],
                    'ecommerce' => ['enabled' => false],
                ],
            ],
        ];

        $response = $this->postJson('/api/generate', $payload);

        $response->assertStatus(202)
            ->assertJsonStructure(['success', 'jobId', 'projectId']);

        $this->assertDatabaseHas('projects', [
            'id' => $response->json('projectId'),
            'name' => 'FlowPilot',
        ]);

        $this->assertDatabaseHas('jobs', [
            'id' => $response->json('jobId'),
            'project_id' => $response->json('projectId'),
            'status' => 'pending',
            'type' => 'generate',
        ]);
    }

    public function test_regenerate_returns_404_for_missing_project(): void
    {
        $response = $this->postJson('/api/regenerate', [
            'projectId' => '00000000-0000-0000-0000-000000000000',
        ]);

        $response->assertStatus(404);
    }

    public function test_regenerate_enqueues_new_job(): void
    {
        $project = Project::factory()->create();

        $response = $this->postJson('/api/regenerate', [
            'projectId' => $project->id,
        ]);

        $response->assertStatus(202)
            ->assertJsonStructure(['success', 'jobId']);

        $this->assertDatabaseHas('jobs', [
            'id' => $response->json('jobId'),
            'project_id' => $project->id,
            'status' => 'pending',
            'type' => 'regenerate',
        ]);
    }

    public function test_status_returns_expected_shape_with_urls_when_completed(): void
    {
        Storage::fake('supabase');

        $project = Project::factory()->create();
        $job = GenerationJob::create([
            'project_id' => $project->id,
            'status' => GenerationJob::STATUS_COMPLETED,
            'type' => GenerationJob::TYPE_GENERATE,
            'result' => [
                'download_path' => "themes/{$project->id}/{$project->id}.zip",
                'static_path' => "previews/{$project->id}/{$project->id}.zip",
            ],
        ]);

        GeneratedTheme::create([
            'job_id' => $job->id,
            'file_path' => "themes/{$project->id}/{$project->id}.zip",
            'status' => GeneratedTheme::STATUS_ACTIVE,
            'expires_at' => now()->addHours(24),
        ]);

        $response = $this->getJson("/api/status?id={$job->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'id',
                'project_id',
                'status',
                'type',
                'result',
                'generated_theme',
                'themeUrl',
                'staticUrl',
            ]);
    }
}
