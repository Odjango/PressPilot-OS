<?php
namespace Tests\Unit;
use App\Services\PlaygroundValidator;
use Tests\TestCase;

class PlaygroundValidatorTest extends TestCase
{
    public function test_timeout_detection_works(): void
    {
        $validator = new PlaygroundValidator();
        $reflection = new \ReflectionMethod($validator, 'isTimeoutError');
        $reflection->setAccessible(true);

        $this->assertTrue($reflection->invoke($validator, 'Error: connection timed out'));
        $this->assertTrue($reflection->invoke($validator, 'ETIMEDOUT'));
        $this->assertFalse($reflection->invoke($validator, 'normal output'));
    }

    public function test_parse_output_with_block_errors(): void
    {
        $validator = new PlaygroundValidator();
        $reflection = new \ReflectionMethod($validator, 'parseOutput');
        $reflection->setAccessible(true);

        $output = 'PLAYGROUND_HEALTH::' . json_encode([
            'active_theme' => 'test-theme',
            'switched' => true,
            'theme_errors' => [],
            'front_status' => 200,
            'front_error' => null,
            'white_screen' => false,
            'front_body_length' => 5000,
            'block_errors' => ['Invalid JSON in block comment: {"broken'],
        ]);

        $result = $reflection->invoke($validator, $output, 'test-theme');
        $this->assertNotEmpty($result['errors']);
        $this->assertEquals('BLOCK_GRAMMAR_ERROR', $result['errors'][0]['type']);
    }

    public function test_parse_output_without_health_payload(): void
    {
        $validator = new PlaygroundValidator();
        $reflection = new \ReflectionMethod($validator, 'parseOutput');
        $reflection->setAccessible(true);

        $result = $reflection->invoke($validator, 'some random output', 'test-theme');
        $this->assertNotEmpty($result['warnings']);
    }

    public function test_skipped_validation_returns_valid(): void
    {
        config(['presspilot.skip_playground_validation' => true]);

        $validator = new PlaygroundValidator();
        $result = $validator->validate('/nonexistent/path');

        $this->assertTrue($result['valid']);
        $this->assertNotEmpty($result['warnings']);

        config(['presspilot.skip_playground_validation' => false]);
    }
}
