<?php

namespace Tests\Feature;

use App\Models\GeneratedTheme;
use App\Models\GenerationJob;
use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * M0 Smoke Test — Pipeline Logic Verification
 *
 * Tests the job lifecycle (claim → process → complete) and API response
 * shapes WITHOUT requiring the Node subprocess or Supabase Storage.
 * Full end-to-end with subprocess is verified via m0-smoke-test.sh
 * against the deployed Docker stack.
 */
class GenerateThemeSmokeTest extends TestCase
{
    use RefreshDatabase;

    public function test_job_claim_optimistic_lock(): void
    {
        $project = Project::factory()->create();

        $job = GenerationJob::create([
            'project_id' => $project->id,
            'status' => GenerationJob::STATUS_PENDING,
            'type' => GenerationJob::TYPE_GENERATE,
        ]);

        // First claim should succeed
        $this->assertTrue($job->claimForProcessing());
        $this->assertEquals(GenerationJob::STATUS_PROCESSING, $job->status);

        // Second claim on same job should fail (optimistic lock)
        $job2 = GenerationJob::find($job->id);
        $this->assertFalse($job2->claimForProcessing());
    }

    public function test_job_mark_completed(): void
    {
        $project = Project::factory()->create();

        $job = GenerationJob::create([
            'project_id' => $project->id,
            'status' => GenerationJob::STATUS_PROCESSING,
            'type' => GenerationJob::TYPE_GENERATE,
        ]);

        $result = [
            'download_path' => "themes/{$project->id}/{$job->id}.zip",
            'static_path' => "previews/{$project->id}/{$job->id}.zip",
        ];

        $job->markCompleted($result);

        $this->assertEquals(GenerationJob::STATUS_COMPLETED, $job->fresh()->status);
        $this->assertEquals($result, $job->fresh()->result);
    }

    public function test_job_mark_failed(): void
    {
        $project = Project::factory()->create();

        $job = GenerationJob::create([
            'project_id' => $project->id,
            'status' => GenerationJob::STATUS_PROCESSING,
            'type' => GenerationJob::TYPE_GENERATE,
        ]);

        $job->markFailed('Generator subprocess exited with code 1');

        $fresh = $job->fresh();
        $this->assertEquals(GenerationJob::STATUS_FAILED, $fresh->status);
        $this->assertArrayHasKey('error', $fresh->result);
    }

    public function test_generated_theme_record_with_expiry(): void
    {
        $project = Project::factory()->create();

        $job = GenerationJob::create([
            'project_id' => $project->id,
            'status' => GenerationJob::STATUS_COMPLETED,
            'type' => GenerationJob::TYPE_GENERATE,
            'result' => ['download_path' => "themes/{$project->id}/test.zip"],
        ]);

        $theme = GeneratedTheme::create([
            'job_id' => $job->id,
            'file_path' => "themes/{$project->id}/test.zip",
            'status' => GeneratedTheme::STATUS_ACTIVE,
            'expires_at' => now()->addHours(24),
        ]);

        $this->assertEquals(GeneratedTheme::STATUS_ACTIVE, $theme->status);
        $this->assertFalse($theme->isExpired());

        // Relationships
        $this->assertEquals($job->id, $theme->generationJob->id);
        $this->assertEquals($theme->id, $job->fresh()->generatedTheme->id);
    }

    public function test_job_status_endpoint_returns_correct_shape(): void
    {
        $project = Project::factory()->create();

        $job = GenerationJob::create([
            'project_id' => $project->id,
            'status' => GenerationJob::STATUS_COMPLETED,
            'type' => GenerationJob::TYPE_GENERATE,
            'result' => [
                'download_path' => 'themes/test/test.zip',
                'static_path' => 'previews/test/test.zip',
            ],
        ]);

        $response = $this->getJson("/api/internal/jobs/{$job->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'id',
                'project_id',
                'status',
                'type',
                'result' => ['download_path', 'static_path'],
                'created_at',
                'updated_at',
            ])
            ->assertJson([
                'status' => 'completed',
                'type' => 'generate',
            ]);
    }

    public function test_job_status_endpoint_returns_404_for_missing(): void
    {
        $response = $this->getJson('/api/internal/jobs/00000000-0000-0000-0000-000000000000');

        $response->assertStatus(404);
    }

    public function test_dispatch_endpoint_creates_pending_job(): void
    {
        $project = Project::factory()->create();

        $response = $this->postJson('/api/internal/jobs/test-dispatch', [
            'project_id' => $project->id,
        ]);

        $response->assertStatus(202)
            ->assertJsonStructure(['job_id', 'status']);

        $jobId = $response->json('job_id');

        $this->assertDatabaseHas('jobs', [
            'id' => $jobId,
            'project_id' => $project->id,
            'status' => 'pending',
            'type' => 'generate',
        ]);
    }
}
