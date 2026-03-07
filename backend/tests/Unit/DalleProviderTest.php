<?php

namespace Tests\Unit;

use App\Services\DalleProvider;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class DalleProviderTest extends TestCase
{
    public function test_fetch_returns_url_from_openai_response(): void
    {
        Http::fake([
            'api.openai.com/*' => Http::response([
                'data' => [['url' => 'https://oaidalleapiprodscus.blob.core.windows.net/test-image.png']],
            ]),
        ]);

        $provider = new DalleProvider;
        $result = $provider->fetch('modern restaurant interior', 1920, 800, [
            'businessName' => 'Bella Trattoria',
            'category' => 'restaurant_cafe',
        ]);

        $this->assertArrayHasKey('url', $result);
        $this->assertStringContainsString('oaidalleapiprodscus', $result['url']);
        Http::assertSentCount(1);
    }

    public function test_fetch_throws_on_missing_api_key(): void
    {
        config(['services.openai.key' => null]);

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Missing OpenAI API key');

        $provider = new DalleProvider;
        $provider->fetch('test', 800, 600);
    }

    public function test_fetch_throws_on_api_error(): void
    {
        Http::fake([
            'api.openai.com/*' => Http::response(['error' => ['message' => 'Rate limit']], 429),
        ]);

        $this->expectException(\RuntimeException::class);

        $provider = new DalleProvider;
        $provider->fetch('test', 800, 600);
    }
}
