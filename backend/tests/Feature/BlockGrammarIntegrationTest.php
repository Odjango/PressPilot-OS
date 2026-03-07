<?php

namespace Tests\Feature;

use App\Services\TokenInjector;
use Tests\TestCase;

/**
 * End-to-end block grammar validation across all skeleton patterns.
 *
 * For each skeleton in skeleton-registry.json:
 *   1. Load the skeleton HTML
 *   2. Build a realistic token map (including adversarial characters)
 *   3. Inject tokens via TokenInjector::processSkeletons() (production path)
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
     * Test the production code path: processSkeletons() with full token maps.
     *
     * This exercises the same pipeline GenerateThemeJob uses:
     * loadSkeleton → required-token validation → injectTokens → validateBlockGrammar
     *
     * @dataProvider skeletonProvider
     */
    public function test_skeleton_injection_produces_valid_block_grammar(string $skeletonId): void
    {
        $entry = $this->registry[$skeletonId];
        $requiredTokens = $entry['required_tokens'] ?? [];

        // Build realistic token values (including adversarial characters)
        $tokens = $this->buildTokenMap($requiredTokens);

        // Use processSkeletons() — the actual production path in GenerateThemeJob
        $skeletonSelections = [
            'front-page' => [$entry],
        ];

        $results = $this->injector->processSkeletons($skeletonSelections, $tokens);

        $this->assertArrayHasKey('front-page', $results, "processSkeletons() must return front-page key for {$skeletonId}");

        $output = $results['front-page'];
        $this->assertNotEmpty($output, "processSkeletons() produced empty output for {$skeletonId}");

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
     * Also exercise individual helpers for finer-grained failure diagnostics.
     *
     * @dataProvider skeletonProvider
     */
    public function test_individual_helpers_produce_valid_block_grammar(string $skeletonId): void
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
     * Provides skeleton IDs from the registry as test cases.
     *
     * Uses __DIR__ instead of base_path() because static data providers
     * run before Laravel's application container is booted.
     *
     * @return array<string, array{0: string}>
     */
    public static function skeletonProvider(): array
    {
        // __DIR__ = tests/Feature, so we traverse up to backend/, then to pattern-library/
        $registryPath = dirname(__DIR__, 2) . '/../pattern-library/skeleton-registry.json';
        if (! file_exists($registryPath)) {
            throw new \RuntimeException("skeleton-registry.json not found at {$registryPath}");
        }

        $registry = json_decode(file_get_contents($registryPath), true, 512, JSON_THROW_ON_ERROR);
        if (! is_array($registry) || $registry === []) {
            throw new \RuntimeException('skeleton-registry.json is empty or invalid');
        }

        $cases = [];
        foreach (array_keys($registry) as $id) {
            $cases[$id] = [$id];
        }

        return $cases;
    }

    /**
     * Build a realistic token value map from a list of required token names.
     *
     * Includes adversarial characters (quotes, HTML entities, backslashes)
     * to stress-test the escaping pipeline in TokenInjector.
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
     *
     * Values include adversarial characters (double quotes, backslashes,
     * HTML angle brackets, ampersands) to test JSON/HTML escaping robustness.
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

        // Address tokens — includes ampersand
        if (str_contains($tokenName, '_ADDRESS')) {
            return '123 Main Street & Suite 200, Anytown, USA';
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

        // CTA tokens — includes quotes
        if (str_contains($tokenName, '_CTA') || str_contains($tokenName, '_BUTTON')) {
            return 'Get "Started" Now';
        }

        // Question tokens (FAQ) — includes quotes and ampersand
        if (str_ends_with($tokenName, '_Q')) {
            return 'What makes our "service" unique & reliable?';
        }

        // Answer tokens (FAQ) — includes backslash and angle brackets
        if (str_ends_with($tokenName, '_A')) {
            return 'We deliver exceptional quality with a personal touch \\ every time <guaranteed>.';
        }

        // Title tokens — includes ampersand
        if (str_contains($tokenName, '_TITLE') || str_contains($tokenName, '_NAME')) {
            return 'Sample Title & More for ' . $tokenName;
        }

        // Text/description/bio tokens — includes quotes, backslash, angle brackets
        if (str_contains($tokenName, '_TEXT') || str_contains($tokenName, '_DESC') || str_contains($tokenName, '_BIO') || str_contains($tokenName, '_SUBTITLE') || str_contains($tokenName, '_LABEL') || str_contains($tokenName, '_ROLE')) {
            return 'Lorem ipsum "dolor" & more <details> with a \\ slash.';
        }

        // ALT text tokens
        if (str_contains($tokenName, '_ALT')) {
            return 'Descriptive alt text for "portfolio" image';
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

        // Fallback: generic placeholder with adversarial chars
        return 'Sample "value" for ' . $tokenName;
    }
}
