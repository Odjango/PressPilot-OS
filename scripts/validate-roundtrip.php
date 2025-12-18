<?php
/**
 * WP PHP Round-Trip Validator (Authoritative)
 *
 * Usage:
 *   wp eval-file scripts/validate-roundtrip.php -- /absolute/or/relative/theme-dir
 *
 * This checks that WordPress can parse and then serialize the markup back
 * to the same string (after newline normalization + trim).
 */

if (!isset($args) || !is_array($args)) {
    $args = [];
}

$themeDir = $args[0] ?? null;
if (!$themeDir) {
    fwrite(STDERR, "Usage: wp eval-file scripts/validate-roundtrip.php -- <theme-dir>\n");
    exit(1);
}

if (!is_dir($themeDir)) {
    $themeDir = getcwd() . '/' . ltrim($themeDir, '/');
}

if (!is_dir($themeDir)) {
    fwrite(STDERR, "Theme dir not found: $themeDir\n");
    exit(1);
}

function norm($s)
{
    $s = str_replace("\r\n", "\n", $s);
    return trim($s);
}

function scan($root, $subdir, $extensions)
{
    $dir = rtrim($root, '/') . '/' . $subdir;
    if (!is_dir($dir))
        return [];

    $rii = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir));
    $files = [];
    foreach ($rii as $file) {
        if ($file->isDir())
            continue;
        $ext = strtolower(pathinfo($file->getPathname(), PATHINFO_EXTENSION));
        if (in_array($ext, $extensions, true)) {
            $files[] = $file->getPathname();
        }
    }
    return $files;
}

$errors = 0;

fwrite(STDOUT, "🛡️  WP PHP Round-Trip Validator\n");
fwrite(STDOUT, "Scanning theme: $themeDir\n\n");

$targets = [
    ['templates', ['html']],
    ['parts', ['html']],
    ['patterns', ['php', 'html']], // patterns often PHP
];

foreach ($targets as [$sub, $exts]) {
    $files = scan($themeDir, $sub, $exts);

    foreach ($files as $filePath) {
        $rel = str_replace(rtrim($themeDir, '/') . '/', '', $filePath);
        $content = file_get_contents($filePath);

        // Only validate files containing block comments
        if (strpos($content, '<!-- wp:') === false) {
            continue;
        }

        try {
            $blocks = parse_blocks($content);
            $re = serialize_blocks($blocks);

            if (norm($content) !== norm($re)) {
                $errors++;
                fwrite(STDERR, "❌ ROUND-TRIP FAIL: $rel\n");

                // Print first mismatch line (helpful, cheap diff)
                $a = explode("\n", norm($content));
                $b = explode("\n", norm($re));
                $max = min(count($a), count($b));
                for ($i = 0; $i < $max; $i++) {
                    if ($a[$i] !== $b[$i]) {
                        fwrite(STDERR, "   Diff @ line " . ($i + 1) . ":\n");
                        fwrite(STDERR, "   ORG: " . substr($a[$i], 0, 140) . "\n");
                        fwrite(STDERR, "   NEW: " . substr($b[$i], 0, 140) . "\n");
                        break;
                    }
                }
            } else {
                fwrite(STDOUT, "✅ PASS: $rel\n");
            }
        } catch (Throwable $e) {
            $errors++;
            fwrite(STDERR, "❌ ERROR: $rel :: " . $e->getMessage() . "\n");
        }
    }
}

if ($errors > 0) {
    fwrite(STDERR, "\nFAILED: $errors round-trip issues.\n");
    exit(1);
}

fwrite(STDOUT, "\nSUCCESS: All files passed WordPress round-trip.\n");
exit(0);
