<?php

namespace Tests\Feature;

use App\Services\TokenInjector;
use Tests\TestCase;

/**
 * End-to-end block grammar validation across all skeleton patterns.
 *
 * For each skeleton in skeleton-registry.json:
 *   1. Load the skeleton HTML
 *   2. Build a realistic token map from the registry's required_tokens
 *   3. Inject tokens via TokenInjector::injectTokens()
 *   4. Validate block grammar (JSON validity, balanced tags, no unresolved tokens)
 */
class BlockGrammarIntegrationTest extends TestCase
{
    private TokenInjector $injector;

    /** @var array<string, array{file: string, required_tokens: array<int, string>}> */
    private array $registry;

    protected function setUp(): void
    {
        parent::setUp();

        $this->injector = new TokenInjector;

        $registryPath = base_path('../pattern-library/skeleton-registry.json');
        $this->assertTrue(file_exists($registryPath), "skeleton-registry.json not found at {$registryPath}");

        $this->registry = json_decode(file_get_contents($registryPath), true);
        $this->assertNotEmpty($this->registry, 'skeleton-registry.json is empty or invalid JSON');
    }

    /**
     * @dataProvider skeletonProvider
     */
    public function test_skeleton_injection_produces_valid_block_grammar(string $skeletonId): void
    {
        $entry = $this->registry[$skeletonId];
        $skeletonFile = $entry['file'];
        $requiredTokens = $entry['required_tokens'] ?? [];

        // Load the skeleton
        $html = $this->injector->loadSkeleton($skeletonFile);
        $this->assertNotEmpty($html, "Skeleton {$skeletonId} loaded empty");

        // Build realistic token values
        $tokens = $this->buildTokenMap($requiredTokens);

        // Inject tokens
        $output = $this->injector->injectTokens($html, $tokens);
        $this->assertNotEmpty($output, "Injection produced empty output for {$skeletonId}");

        // No unresolved {{TOKEN}} placeholders
        $this->assertDoesNotMatchRegularExpression(
            '/\{\{\w+\}\}/',
            $output,
            "Unresolved token placeholders remain in {$skeletonId}"
        );

        // Validate block grammar
        $errors = $this->injector->validateBlockGrammar($output);
        $this->assertEmpty(
            $errors,
            "Block grammar errors in {$skeletonId}: " . implode('; ', $errors)
        );
    }

    /**
     * @return array<string, array{0: string}>
     */
    public static function skeletonProvider(): array
    {
        $registryPath = base_path('../pattern-library/skeleton-registry.json');
        if (! file_exists($registryPath)) {
            return [];
        }

        $registry = json_decode(file_get_contents($registryPath), true);
        $cases = [];
        foreach (array_keys($registry) as $id) {
            $cases[$id] = [$id];
        }

        return $cases;
    }

    /**
     * Build a realistic token value map from a list of required token names.
     *
     * @param  array<int, string>  $tokenNames
     * @return array<string, string>
     */
    private function buildTokenMap(array $tokenNames): array
    {
        $tokens = [];
        foreach ($tokenNames as $name) {
            $tokens[$name] = $this->generateTokenValue($name);
        }

        return $tokens;
    }

    /**
     * Generate a realistic value for a given token name.
     */
    private function generateTokenValue(string $tokenName): string
    {
        // IMAGE tokens need valid URLs
        if (str_starts_with($tokenName, 'IMAGE_')) {
            return 'https://placehold.co/1200x600';
        }

        // Price tokens
        if (str_contains($tokenName, '_PRICE')) {
            return '$29.99';
        }

        // Phone tokens
        if (str_contains($tokenName, '_PHONE')) {
            return '(555) 123-4567';
        }

        // Email tokens
        if (str_contains($tokenName, '_EMAIL')) {
            return 'info@example.com';
        }

        // Address tokens
        if (str_contains($tokenName, '_ADDRESS')) {
            return '123 Main Street, Anytown, USA';
        }

        // Hours tokens
        if (str_contains($tokenName, '_HOURS') || str_contains($tokenName, 'WEEKDAY') || str_contains($tokenName, 'WEEKEND')) {
            return 'Mon-Fri 9:00 AM - 5:00 PM';
        }

        // Number/stat tokens
        if (str_contains($tokenName, '_NUMBER')) {
            return '1,500+';
        }

        // Period tokens (pricing)
        if (str_contains($tokenName, '_PERIOD')) {
            return '/month';
        }

        // CTA tokens
        if (str_contains($tokenName, '_CTA') || str_contains($tokenName, '_BUTTON')) {
            return 'Get Started Now';
        }

        // Question tokens (FAQ)
        if (str_ends_with($tokenName, '_Q')) {
            return 'What makes our service unique?';
        }

        // Answer tokens (FAQ)
        if (str_ends_with($tokenName, '_A')) {
            return 'We deliver exceptional quality with a personal touch that sets us apart.';
        }

        // Title tokens
        if (str_contains($tokenName, '_TITLE') || str_contains($tokenName, '_NAME')) {
            return 'Sample Title for ' . $tokenName;
        }

        // Text/description/bio tokens
        if (str_contains($tokenName, '_TEXT') || str_contains($tokenName, '_DESC') || str_contains($tokenName, '_BIO') || str_contains($tokenName, '_SUBTITLE') || str_contains($tokenName, '_LABEL') || str_contains($tokenName, '_ROLE')) {
            return 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt.';
        }

        // ALT text tokens
        if (str_contains($tokenName, '_ALT')) {
            return 'Descriptive alt text for image';
        }

        // Feature tokens
        if (str_contains($tokenName, '_FEATURE')) {
            return 'Premium feature included';
        }

        // Service area tokens
        if (str_contains($tokenName, 'SERVICE_AREA_') && preg_match('/\d+$/', $tokenName)) {
            return 'Downtown & Surrounding Areas';
        }

        // License text
        if (str_contains($tokenName, 'LICENSE')) {
            return 'Licensed and insured since 2010';
        }

        // Fallback: generic placeholder
        return 'Sample value for ' . $tokenName;
    }
}
