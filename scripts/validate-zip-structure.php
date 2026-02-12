#!/usr/bin/env php
<?php
/**
 * PressPilot ZIP Structure Validator
 *
 * Validates that a WordPress theme ZIP is structured correctly
 * so it installs without errors via Appearance > Themes > Upload.
 *
 * Usage:
 *   php scripts/validate-zip-structure.php /path/to/theme.zip
 *
 * Can also be required as a library:
 *   require_once 'validate-zip-structure.php';
 *   $result = validate_zip_structure('/path/to/theme.zip');
 *
 * @package PressPilot
 */

/**
 * Validate a WordPress theme ZIP structure.
 *
 * @param string $zip_path Absolute path to the ZIP file.
 * @return array{valid: bool, theme_name: string, errors: string[], warnings: string[]}
 */
function validate_zip_structure( string $zip_path ): array {
    $errors   = array();
    $warnings = array();

    // ── 1. ZIP exists and is readable ──
    if ( ! file_exists( $zip_path ) ) {
        return array(
            'valid'      => false,
            'theme_name' => '',
            'errors'     => array( "ZIP file not found: {$zip_path}" ),
            'warnings'   => array(),
        );
    }

    // ── 2. Open ZIP and read entries ──
    $zip = new ZipArchive();
    $res = $zip->open( $zip_path, ZipArchive::RDONLY );
    if ( $res !== true ) {
        return array(
            'valid'      => false,
            'theme_name' => '',
            'errors'     => array( "Cannot open ZIP (error code {$res})" ),
            'warnings'   => array(),
        );
    }

    // Collect all entry paths
    $entries = array();
    for ( $i = 0; $i < $zip->numFiles; $i++ ) {
        $entries[] = $zip->getNameIndex( $i );
    }

    // ── 3. Single top-level folder ──
    $top_level_dirs = array();
    foreach ( $entries as $entry ) {
        $parts = explode( '/', $entry );
        if ( ! empty( $parts[0] ) ) {
            $top_level_dirs[ $parts[0] ] = true;
        }
    }

    if ( count( $top_level_dirs ) !== 1 ) {
        $errors[] = 'ZIP must contain exactly one top-level folder. Found: ' . implode( ', ', array_keys( $top_level_dirs ) );
        $zip->close();
        return array(
            'valid'      => false,
            'theme_name' => implode( ',', array_keys( $top_level_dirs ) ),
            'errors'     => $errors,
            'warnings'   => $warnings,
        );
    }

    $theme_name = array_keys( $top_level_dirs )[0];

    // ── 4. Required files at theme root ──
    $required_files = array(
        'style.css',
        'index.php',
        'theme.json',
    );

    foreach ( $required_files as $file ) {
        $expected_path = $theme_name . '/' . $file;
        if ( ! in_array( $expected_path, $entries, true ) ) {
            $errors[] = "Missing required file: {$file} (expected at {$expected_path})";
        }
    }

    // ── 5. Required directories ──
    $required_dirs = array( 'templates', 'parts' );
    foreach ( $required_dirs as $dir ) {
        $dir_prefix = $theme_name . '/' . $dir . '/';
        $found      = false;
        foreach ( $entries as $entry ) {
            if ( strpos( $entry, $dir_prefix ) === 0 ) {
                $found = true;
                break;
            }
        }
        if ( ! $found ) {
            $errors[] = "Missing required folder: {$dir}/ (no files found under {$dir_prefix})";
        }
    }

    // ── 6. Key template files ──
    $key_templates = array(
        'templates/index.html',
        'templates/front-page.html',
        'parts/header.html',
        'parts/footer.html',
    );
    foreach ( $key_templates as $tmpl ) {
        $expected = $theme_name . '/' . $tmpl;
        if ( ! in_array( $expected, $entries, true ) ) {
            $warnings[] = "Missing recommended file: {$tmpl}";
        }
    }

    // ── 7. NESTED THEME DETECTION (the bug we hit) ──
    // Check if any subdirectory contains style.css — indicates double-nesting
    foreach ( $entries as $entry ) {
        // Match pattern: theme-name/*/style.css (two levels deep)
        $rel = substr( $entry, strlen( $theme_name ) + 1 );
        if ( $rel !== 'style.css' && basename( $entry ) === 'style.css' ) {
            $parent = dirname( $rel );
            $errors[] = "NESTED THEME DETECTED: {$parent}/style.css exists inside theme folder. ZIP has wrong structure (double-nesting).";
        }
    }

    // ── 8. style.css header validation ──
    $style_entry = $theme_name . '/style.css';
    if ( in_array( $style_entry, $entries, true ) ) {
        $css_content = $zip->getFromName( $style_entry );
        if ( $css_content !== false ) {
            if ( strpos( $css_content, 'Theme Name:' ) === false ) {
                $errors[] = "style.css is missing 'Theme Name:' header";
            }
            if ( strpos( $css_content, 'Version:' ) === false ) {
                $warnings[] = "style.css is missing 'Version:' header";
            }
            if ( strpos( $css_content, 'Text Domain:' ) === false ) {
                $warnings[] = "style.css is missing 'Text Domain:' header";
            }
        }
    }

    // ── 9. theme.json validation ──
    $theme_json_entry = $theme_name . '/theme.json';
    if ( in_array( $theme_json_entry, $entries, true ) ) {
        $json_content = $zip->getFromName( $theme_json_entry );
        if ( $json_content !== false ) {
            $decoded = json_decode( $json_content, true );
            if ( $decoded === null ) {
                $errors[] = 'theme.json is not valid JSON: ' . json_last_error_msg();
            } elseif ( ! isset( $decoded['version'] ) || $decoded['version'] < 2 ) {
                $errors[] = 'theme.json must have version 2 or 3 (found: ' . ( $decoded['version'] ?? 'none' ) . ')';
            }
        }
    }

    $zip->close();

    return array(
        'valid'      => empty( $errors ),
        'theme_name' => $theme_name,
        'errors'     => $errors,
        'warnings'   => $warnings,
    );
}

// ──────────────────────────────────────────────────
// CLI mode — run when executed directly
// ──────────────────────────────────────────────────
if ( php_sapi_name() === 'cli' && isset( $argv[0] ) && realpath( $argv[0] ) === realpath( __FILE__ ) ) {

    if ( ! isset( $argv[1] ) ) {
        fwrite( STDERR, "Usage: php validate-zip-structure.php <path-to-theme.zip>\n" );
        exit( 2 );
    }

    $zip_path = $argv[1];
    echo "=== PressPilot ZIP Structure Validator ===\n\n";
    echo "  File: {$zip_path}\n\n";

    $result = validate_zip_structure( $zip_path );

    echo "  Theme folder: {$result['theme_name']}\n\n";

    if ( ! empty( $result['errors'] ) ) {
        echo "  ERRORS:\n";
        foreach ( $result['errors'] as $err ) {
            echo "    [FAIL] {$err}\n";
        }
        echo "\n";
    }

    if ( ! empty( $result['warnings'] ) ) {
        echo "  WARNINGS:\n";
        foreach ( $result['warnings'] as $warn ) {
            echo "    [WARN] {$warn}\n";
        }
        echo "\n";
    }

    if ( $result['valid'] ) {
        echo "  RESULT: VALID — ZIP is correctly structured for WordPress\n\n";
        exit( 0 );
    } else {
        echo "  RESULT: INVALID — ZIP will NOT install correctly in WordPress\n\n";
        exit( 1 );
    }
}
