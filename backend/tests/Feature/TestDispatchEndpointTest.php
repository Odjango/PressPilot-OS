<?php

namespace Tests\Feature;

use App\Models\GenerationJob;
use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TestDispatchEndpointTest extends TestCase
{
    use RefreshDatabase;

    public function test_dispatch_requires_project_id(): void
    {
        $response = $this->postJson('/api/internal/jobs/test-dispatch', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['project_id']);
    }

    public function test_dispatch_returns_404_for_missing_project(): void
    {
        $response = $this->postJson('/api/internal/jobs/test-dispatch', [
            'project_id' => '00000000-0000-0000-0000-000000000000',
        ]);

        $response->assertStatus(404);
    }

    public function test_dispatch_creates_job_and_returns_202(): void
    {
        $project = Project::factory()->create();

        $response = $this->postJson('/api/internal/jobs/test-dispatch', [
            'project_id' => $project->id,
        ]);

        $response->assertStatus(202)
            ->assertJsonStructure(['job_id', 'status']);

        $this->assertDatabaseHas('jobs', [
            'id' => $response->json('job_id'),
            'project_id' => $project->id,
            'status' => 'pending',
            'type' => 'generate',
        ]);
    }
}
