<?php

namespace Tests\Unit;

use App\Services\ThemeAssembler;
use Tests\TestCase;
use ZipArchive;

class ThemeAssemblerTest extends TestCase
{
    private array $cleanupPaths = [];

    protected function tearDown(): void
    {
        foreach ($this->cleanupPaths as $path) {
            if (is_dir($path)) {
                $this->deleteDirectory($path);
            } elseif (file_exists($path)) {
                unlink($path);
            }
        }

        $this->cleanupPaths = [];

        parent::tearDown();
    }

    public function test_assemble_creates_required_theme_files(): void
    {
        [$assembler, $project, $patterns] = $this->makeAssemblerFixture('Test Project');

        $result = $assembler->assemble($project, $patterns, []);
        $themeDir = $result['themeDir'];
        $this->registerCleanup($themeDir, $result['zipPath']);

        $this->assertFileExists($themeDir.'/style.css');
        $this->assertFileExists($themeDir.'/theme.json');
        $this->assertFileExists($themeDir.'/functions.php');
        $this->assertFileExists($themeDir.'/index.php');
        $this->assertFileExists($themeDir.'/templates/front-page.html');
        $this->assertFileExists($themeDir.'/templates/index.html');
        $this->assertFileExists($themeDir.'/parts/header.html');
        $this->assertFileExists($themeDir.'/parts/footer.html');
    }

    public function test_style_css_contains_correct_header(): void
    {
        [$assembler, $project, $patterns] = $this->makeAssemblerFixture('Cedar Bistro');

        $result = $assembler->assemble($project, $patterns, []);
        $this->registerCleanup($result['themeDir'], $result['zipPath']);

        $style = file_get_contents($result['themeDir'].'/style.css');

        $this->assertStringContainsString('Theme Name: Cedar Bistro Theme', $style);
        $this->assertStringContainsString('Author: PressPilot', $style);
        $this->assertStringContainsString('Text Domain: cedar-bistro', $style);
    }

    public function test_footer_contains_presspilot_credit(): void
    {
        [$assembler, $project, $patterns] = $this->makeAssemblerFixture('Lumen Studio');

        $result = $assembler->assemble($project, $patterns, []);
        $this->registerCleanup($result['themeDir'], $result['zipPath']);

        $footer = file_get_contents($result['themeDir'].'/parts/footer.html');

        $this->assertStringContainsString('presspilotapp.com', $footer);
    }

    public function test_theme_json_is_valid_json(): void
    {
        [$assembler, $project, $patterns] = $this->makeAssemblerFixture('Solace Labs');

        $result = $assembler->assemble($project, $patterns, []);
        $this->registerCleanup($result['themeDir'], $result['zipPath']);

        $payload = json_decode(file_get_contents($result['themeDir'].'/theme.json'), true);

        $this->assertNotNull($payload);
    }

    public function test_zip_file_is_created(): void
    {
        [$assembler, $project, $patterns] = $this->makeAssemblerFixture('Northwind Co');

        $result = $assembler->assemble($project, $patterns, []);
        $this->registerCleanup($result['themeDir'], $result['zipPath']);

        $this->assertFileExists($result['zipPath']);

        $zip = new ZipArchive;
        $this->assertTrue($zip->open($result['zipPath']) === true);
        $zip->close();
    }

    /**
     * @return array{0: ThemeAssembler, 1: array<string, mixed>, 2: array<string, mixed>}
     */
    private function makeAssemblerFixture(string $name): array
    {
        $baseDir = base_path('../proven-cores/ollie');
        if (! is_dir($baseDir)) {
            mkdir($baseDir, 0755, true);
        }

        file_put_contents($baseDir.'/functions.php', "<?php\n// test functions\n");
        file_put_contents($baseDir.'/index.php', "<?php\n// test index\n");
        file_put_contents($baseDir.'/theme.json', json_encode([
            '$schema' => 'https://schemas.wp.org/trunk/theme.json',
            'version' => 3,
            'settings' => [
                'color' => [
                    'palette' => [
                        ['slug' => 'primary', 'color' => '#000000'],
                        ['slug' => 'secondary', 'color' => '#111111'],
                        ['slug' => 'primary-alt', 'color' => '#222222'],
                        ['slug' => 'base', 'color' => '#ffffff'],
                        ['slug' => 'main', 'color' => '#333333'],
                    ],
                ],
                'typography' => [
                    'fontFamilies' => [
                        ['fontFamily' => 'System', 'name' => 'System'],
                    ],
                ],
            ],
        ], JSON_PRETTY_PRINT));

        $project = [
            'name' => $name,
            'slug' => $this->slugify($name),
            'colors' => [
                'primary' => '#112233',
                'secondary' => '#223344',
                'accent' => '#334455',
                'background' => '#ffffff',
                'foreground' => '#111111',
            ],
            'fontFamily' => 'Inter',
        ];

        $patterns = [
            'home' => [
                [
                    'pattern_id' => 'test/hero',
                    'slug' => 'hero',
                    'category' => 'hero',
                    'content' => "<?php\n?>\n<!-- wp:group --><div class=\"wp-block-group\">Hero</div><!-- /wp:group -->\n",
                ],
            ],
            'blog' => [
                [
                    'pattern_id' => 'test/blog',
                    'slug' => 'blog',
                    'category' => 'blog',
                    'content' => "<?php\n?>\n<!-- wp:group --><div class=\"wp-block-group\">Blog</div><!-- /wp:group -->\n",
                ],
            ],
            'header' => [
                [
                    'pattern_id' => 'test/header',
                    'slug' => 'header',
                    'category' => 'header',
                    'content' => "<?php\n?>\n<!-- wp:group --><div class=\"wp-block-group\"><!-- wp:paragraph --><p><a href=\"/\">Home</a></p><!-- /wp:paragraph --></div><!-- /wp:group -->\n",
                ],
            ],
            'footer' => [
                [
                    'pattern_id' => 'test/footer',
                    'slug' => 'footer',
                    'category' => 'footer',
                    'content' => "<?php\n?>\n<!-- wp:group --><div class=\"wp-block-group\">Footer</div><!-- /wp:group -->\n",
                ],
            ],
        ];

        return [new ThemeAssembler, $project, $patterns];
    }

    private function registerCleanup(string $themeDir, string $zipPath): void
    {
        $this->cleanupPaths[] = $themeDir;
        $this->cleanupPaths[] = $zipPath;
    }

    private function deleteDirectory(string $directory): void
    {
        $items = array_diff(scandir($directory) ?: [], ['.', '..']);

        foreach ($items as $item) {
            $path = $directory.DIRECTORY_SEPARATOR.$item;

            if (is_dir($path)) {
                $this->deleteDirectory($path);
            } else {
                unlink($path);
            }
        }

        rmdir($directory);
    }

    private function slugify(string $value): string
    {
        $value = strtolower(trim($value));
        $value = preg_replace('/[^a-z0-9\-]+/', '-', $value) ?? 'presspilot';

        return trim($value, '-');
    }
}
