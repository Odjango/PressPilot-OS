<?php

namespace App\Services;

use RuntimeException;
use ZipArchive;

class ThemeAssembler
{
    /**
     * @param  array<string, mixed>  $project
     * @param  array<string, mixed>  $patterns
     * @param  array<string, string>  $images
     * @return array{themeDir: string, zipPath: string}
     */
    public function assemble(array $project, array $patterns, array $images = []): array
    {
        $slug = $this->resolveSlug($project);
        $themeDir = sys_get_temp_dir()."/pp-themes/{$slug}";

        $this->resetDirectory($themeDir);
        $this->copyBaseFiles($themeDir);
        $this->writeStyleSheet($themeDir, $project);
        $this->writeThemeJson($themeDir, $project);
        $this->writeTemplates($themeDir, $slug, $patterns);
        $this->writeParts($themeDir, $slug, $patterns, $project);
        $this->writePatterns($themeDir, $slug, $patterns);
        $this->copyImages($themeDir, $images);

        $zipPath = $this->zipTheme($themeDir, $slug);

        return [
            'themeDir' => $themeDir,
            'zipPath' => $zipPath,
        ];
    }

    /**
     * @param  array<string, mixed>  $project
     */
    private function resolveSlug(array $project): string
    {
        $slug = $project['slug'] ?? $project['name'] ?? 'presspilot-theme';
        $slug = strtolower(trim((string) $slug));
        $slug = preg_replace('/[^a-z0-9\-]+/', '-', $slug) ?? 'presspilot-theme';

        return trim($slug, '-');
    }

    private function resetDirectory(string $themeDir): void
    {
        if (is_dir($themeDir)) {
            $this->deleteDirectory($themeDir);
        }

        if (! mkdir($themeDir, 0755, true) && ! is_dir($themeDir)) {
            throw new RuntimeException("Unable to create theme directory at {$themeDir}");
        }
    }

    public function deleteDirectory(string $directory): void
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

    private function copyBaseFiles(string $themeDir): void
    {
        $baseDir = base_path('../proven-cores/ollie');
        $baseFiles = ['functions.php', 'index.php'];

        foreach ($baseFiles as $file) {
            $source = $baseDir.DIRECTORY_SEPARATOR.$file;
            $destination = $themeDir.DIRECTORY_SEPARATOR.$file;

            if (! file_exists($source)) {
                throw new RuntimeException("Base file missing: {$source}");
            }

            copy($source, $destination);
        }
    }

    /**
     * @param  array<string, mixed>  $project
     */
    private function writeStyleSheet(string $themeDir, array $project): void
    {
        $name = (string) ($project['name'] ?? 'PressPilot Theme');
        $slug = $this->resolveSlug($project);

        $header = "/*\n".
            "Theme Name: {$name} Theme\n".
            "Theme URI: https://presspilotapp.com\n".
            "Author: PressPilot\n".
            "Author URI: https://presspilotapp.com\n".
            "Description: Custom FSE theme for {$name}\n".
            "Version: 1.0.0\n".
            "Requires at least: 6.0\n".
            "Tested up to: 6.4\n".
            "Requires PHP: 7.4\n".
            "License: GNU General Public License v2 or later\n".
            "License URI: http://www.gnu.org/licenses/gpl-2.0.html\n".
            "Text Domain: {$slug}\n".
            "*/\n";

        file_put_contents($themeDir.'/style.css', $header);
    }

    /**
     * @param  array<string, mixed>  $project
     */
    private function writeThemeJson(string $themeDir, array $project): void
    {
        $basePath = base_path('../proven-cores/ollie/theme.json');
        if (! file_exists($basePath)) {
            throw new RuntimeException('Base theme.json not found.');
        }

        $themeJson = json_decode(file_get_contents($basePath), true, 512, JSON_THROW_ON_ERROR);

        $colors = $project['colors'] ?? [];
        $paletteOverrides = [
            'primary' => $colors['primary'] ?? null,
            'secondary' => $colors['secondary'] ?? null,
            'primary-alt' => $colors['accent'] ?? null,
            'base' => $colors['background'] ?? null,
            'main' => $colors['foreground'] ?? null,
        ];

        if (isset($themeJson['settings']['color']['palette'])) {
            foreach ($themeJson['settings']['color']['palette'] as $index => $entry) {
                $slug = $entry['slug'] ?? null;
                if ($slug && array_key_exists($slug, $paletteOverrides) && $paletteOverrides[$slug]) {
                    $themeJson['settings']['color']['palette'][$index]['color'] = $paletteOverrides[$slug];
                }
            }
        }

        $fontFamily = $project['fontFamily'] ?? ($project['fonts']['primary'] ?? null);
        if ($fontFamily && isset($themeJson['settings']['typography']['fontFamilies'][0])) {
            $themeJson['settings']['typography']['fontFamilies'][0]['fontFamily'] = $fontFamily.', system-ui, sans-serif';
            $themeJson['settings']['typography']['fontFamilies'][0]['name'] = $fontFamily;
        }

        file_put_contents($themeDir.'/theme.json', json_encode($themeJson, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    }

    /**
     * @param  array<string, mixed>  $patterns
     */
    private function writeTemplates(string $themeDir, string $slug, array $patterns): void
    {
        $templatesDir = $themeDir.'/templates';
        if (! is_dir($templatesDir)) {
            mkdir($templatesDir, 0755, true);
        }

        $homePatterns = $patterns['home'] ?? [];
        $blogPattern = $patterns['blog'][0] ?? ($patterns['home'][0] ?? null);

        $frontPageBlocks = $this->patternReferences($slug, $homePatterns);
        $blogReference = $blogPattern ? $this->patternReference($slug, $blogPattern) : '';

        $frontPage = $this->wrapTemplate($frontPageBlocks);
        $indexTemplate = $this->wrapTemplate($blogReference);

        file_put_contents($templatesDir.'/front-page.html', $frontPage);
        file_put_contents($templatesDir.'/index.html', $indexTemplate);
        file_put_contents($templatesDir.'/page.html', $this->defaultPageTemplate());
        file_put_contents($templatesDir.'/single.html', $this->defaultSingleTemplate());
        file_put_contents($templatesDir.'/404.html', $this->default404Template());
    }

    /**
     * @param  array<string, mixed>  $patterns
     * @param  array<string, mixed>  $project
     */
    private function writeParts(string $themeDir, string $slug, array $patterns, array $project): void
    {
        $partsDir = $themeDir.'/parts';
        if (! is_dir($partsDir)) {
            mkdir($partsDir, 0755, true);
        }

        $header = $patterns['header'][0]['content'] ?? '';
        $footer = $patterns['footer'][0]['content'] ?? '';

        $headerMarkup = $this->extractMarkup($header);
        if (trim($headerMarkup) === '' || str_contains($headerMarkup, '<!-- wp:navigation')) {
            $headerMarkup = $this->fallbackHeader($project);
        }

        $footerMarkup = $this->extractMarkup($footer);
        if (trim($footerMarkup) === '') {
            $footerMarkup = $this->fallbackFooter($project);
        }

        file_put_contents($partsDir.'/header.html', $headerMarkup);
        file_put_contents($partsDir.'/footer.html', $footerMarkup.$this->pressPilotCredit($project));
    }

    /**
     * @param  array<string, mixed>  $patterns
     */
    private function writePatterns(string $themeDir, string $slug, array $patterns): void
    {
        $patternsDir = $themeDir.'/patterns';
        if (! is_dir($patternsDir)) {
            mkdir($patternsDir, 0755, true);
        }

        foreach ($this->flattenPatterns($patterns) as $pattern) {
            $patternSlug = $pattern['slug'] ?? ($pattern['pattern_id'] ?? 'pattern');
            $patternSlug = str_replace('/', '-', $patternSlug);
            $title = $pattern['title'] ?? ($pattern['pattern_id'] ?? $patternSlug);
            $title = str_replace('/', ' ', $title);
            $category = $pattern['category'] ?? 'sections';
            $content = $this->extractMarkup((string) ($pattern['content'] ?? ''));

            $header = "<?php\n/**\n * Title: {$title}\n * Slug: {$slug}/{$patternSlug}\n * Categories: presspilot/{$category}\n */\n?>\n";

            file_put_contents($patternsDir.'/'.$patternSlug.'.php', $header.$content);
        }
    }

    /**
     * @param  array<string, string>  $images
     */
    private function copyImages(string $themeDir, array $images): void
    {
        if (empty($images)) {
            return;
        }

        $assetsDir = $themeDir.'/assets/images';
        if (! is_dir($assetsDir)) {
            mkdir($assetsDir, 0755, true);
        }

        foreach ($images as $token => $path) {
            if (! file_exists($path)) {
                continue;
            }

            $destination = $assetsDir.'/'.strtolower($token).'.jpg';
            copy($path, $destination);
        }
    }

    private function zipTheme(string $themeDir, string $slug): string
    {
        $zipPath = sys_get_temp_dir()."/pp-themes/{$slug}.zip";
        $zip = new ZipArchive;

        if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            throw new RuntimeException('Unable to create zip archive.');
        }

        $files = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($themeDir, \FilesystemIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::SELF_FIRST
        );

        foreach ($files as $file) {
            $filePath = $file->getRealPath();
            if (! $filePath) {
                continue;
            }

            $relativePath = substr($filePath, strlen($themeDir) + 1);

            if ($file->isDir()) {
                $zip->addEmptyDir($relativePath);
            } else {
                $zip->addFile($filePath, $relativePath);
            }
        }

        $zip->close();

        return $zipPath;
    }

    /**
     * @param  array<int, array<string, mixed>>  $patterns
     */
    private function patternReferences(string $slug, array $patterns): string
    {
        $markup = '';
        foreach ($patterns as $pattern) {
            $markup .= $this->patternReference($slug, $pattern);
        }

        return $markup;
    }

    /**
     * @param  array<string, mixed>  $pattern
     */
    private function patternReference(string $slug, array $pattern): string
    {
        $patternSlug = $pattern['slug'] ?? ($pattern['pattern_id'] ?? 'pattern');
        $patternSlug = str_replace('/', '-', $patternSlug);

        return "<!-- wp:pattern {\"slug\":\"{$slug}/{$patternSlug}\"} /-->\n\n";
    }

    private function wrapTemplate(string $content): string
    {
        return "<!-- wp:template-part {\"slug\":\"header\",\"tagName\":\"header\"} /-->\n\n".
            "<!-- wp:group {\"tagName\":\"main\"} -->\n".
            "<main class=\"wp-block-group\">\n".
            $content.
            "</main>\n".
            "<!-- /wp:group -->\n\n".
            "<!-- wp:template-part {\"slug\":\"footer\",\"tagName\":\"footer\"} /-->\n";
    }

    private function defaultPageTemplate(): string
    {
        return "<!-- wp:template-part {\"slug\":\"header\",\"tagName\":\"header\"} /-->\n\n".
            "<!-- wp:group {\"tagName\":\"main\"} -->\n".
            "<main class=\"wp-block-group\">\n".
            "<!-- wp:post-content /-->\n".
            "</main>\n".
            "<!-- /wp:group -->\n\n".
            "<!-- wp:template-part {\"slug\":\"footer\",\"tagName\":\"footer\"} /-->\n";
    }

    private function defaultSingleTemplate(): string
    {
        return $this->defaultPageTemplate();
    }

    private function default404Template(): string
    {
        return "<!-- wp:template-part {\"slug\":\"header\",\"tagName\":\"header\"} /-->\n\n".
            "<!-- wp:group {\"tagName\":\"main\"} -->\n".
            "<main class=\"wp-block-group\">\n".
            "<!-- wp:heading -->\n".
            "<h2>Page not found</h2>\n".
            "<!-- /wp:heading -->\n".
            "<!-- wp:paragraph -->\n".
            "<p>The page you are looking for could not be found.</p>\n".
            "<!-- /wp:paragraph -->\n".
            "</main>\n".
            "<!-- /wp:group -->\n\n".
            "<!-- wp:template-part {\"slug\":\"footer\",\"tagName\":\"footer\"} /-->\n";
    }

    /**
     * @param  array<string, mixed>  $patterns
     * @return array<int, array<string, mixed>>
     */
    private function flattenPatterns(array $patterns): array
    {
        $flattened = [];

        foreach ($patterns as $group) {
            if (! is_array($group)) {
                continue;
            }

            foreach ($group as $pattern) {
                if (is_array($pattern)) {
                    $flattened[] = $pattern;
                }
            }
        }

        return $flattened;
    }

    private function extractMarkup(string $patternContent): string
    {
        $closePos = strpos($patternContent, '?>');
        if ($closePos === false) {
            return $patternContent;
        }

        return substr($patternContent, $closePos + 2);
    }

    /**
     * @param  array<string, mixed>  $project
     */
    private function pressPilotCredit(array $project): string
    {
        $name = (string) ($project['name'] ?? 'PressPilot');

        return "\n<!-- wp:paragraph -->\n".
            "<p>© ".date('Y')." {$name}. Powered by <a href=\"https://presspilotapp.com\">PressPilot</a>.</p>\n".
            "<!-- /wp:paragraph -->\n";
    }

    /**
     * @param  array<string, mixed>  $project
     */
    private function fallbackHeader(array $project): string
    {
        $name = (string) ($project['name'] ?? 'PressPilot');

        return "<!-- wp:group {\"align\":\"full\",\"layout\":{\"type\":\"flex\",\"flexWrap\":\"nowrap\",\"justifyContent\":\"space-between\"}} -->\n".
            "<div class=\"wp-block-group alignfull\">\n".
            "<!-- wp:site-title {\"level\":0} -->\n".
            "<h1 class=\"wp-block-site-title\"><a href=\"/\" rel=\"home\">{$name}</a></h1>\n".
            "<!-- /wp:site-title -->\n".
            "<!-- wp:group {\"layout\":{\"type\":\"flex\",\"flexWrap\":\"nowrap\",\"justifyContent\":\"right\"}} -->\n".
            "<div class=\"wp-block-group\">\n".
            "<!-- wp:paragraph --><p><a href=\"/\">Home</a></p><!-- /wp:paragraph -->\n".
            "<!-- wp:paragraph --><p><a href=\"/about\">About</a></p><!-- /wp:paragraph -->\n".
            "<!-- wp:paragraph --><p><a href=\"/services\">Services</a></p><!-- /wp:paragraph -->\n".
            "<!-- wp:paragraph --><p><a href=\"/contact\">Contact</a></p><!-- /wp:paragraph -->\n".
            "<!-- wp:paragraph --><p><a href=\"/blog\">Blog</a></p><!-- /wp:paragraph -->\n".
            "</div><!-- /wp:group -->\n".
            "</div><!-- /wp:group -->\n";
    }

    /**
     * @param  array<string, mixed>  $project
     */
    private function fallbackFooter(array $project): string
    {
        $name = (string) ($project['name'] ?? 'PressPilot');

        return "<!-- wp:group {\"align\":\"full\",\"layout\":{\"type\":\"constrained\"}} -->\n".
            "<div class=\"wp-block-group alignfull\">\n".
            "<!-- wp:paragraph -->\n".
            "<p>© ".date('Y')." {$name}. All rights reserved.</p>\n".
            "<!-- /wp:paragraph -->\n".
            "</div><!-- /wp:group -->\n";
    }
}
