<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HealthEndpointTest extends TestCase
{
    public function test_health_endpoint_returns_json(): void
    {
        $response = $this->getJson('/api/internal/health');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'checks' => [
                    'database',
                    'redis',
                    'storage',
                ],
            ]);
    }

    public function test_health_endpoint_reports_ok_when_all_services_connected(): void
    {
        $response = $this->getJson('/api/internal/health');

        $response->assertStatus(200)
            ->assertJson(['status' => 'ok']);
    }
}
