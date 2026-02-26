<?php
/**
 * Activate PressPilot Child Theme
 */
require_once('wp-load.php');

$theme = 'presspilot-child';

if (get_stylesheet() !== $theme) {
    echo "Switching theme to $theme...\n";
    switch_theme($theme);
    echo "Theme switched to: " . get_stylesheet() . "\n";
} else {
    echo "Theme $theme is already active.\n";
}
