<?php
/**
 * Module: Color Extractor
 * Ported from: presspilot-agent-plugin-v6.3
 * Purpose: Extract dominant colors from logo using PHP GD
 */

if (!defined('ABSPATH')) {
    exit;
}

class PressPilot_Color_Extractor
{

    /**
     * Extract colors from logo image
     */
    public function extract($image_url)
    {
        // Ensure dependecies are loaded for download_url
        if (!function_exists('download_url')) {
            require_once ABSPATH . 'wp-admin/includes/file.php';
        }

        try {
            $colors = $this->get_dominant_colors($image_url);

            return array(
                'primary' => $colors[0],
                'secondary' => $colors[1] ?? $colors[0],
                'accent' => $colors[2] ?? $colors[0],
                'neutral' => '#FFFFFF',
                'dark' => '#333333'
            );
        } catch (Exception $e) {
            // Fallback to safe default colors
            return $this->get_fallback_colors();
        }
    }

    /**
     * Get dominant colors from image
     */
    private function get_dominant_colors($image_url, $num_colors = 3)
    {
        // Download image temporarily
        $temp_file = download_url($image_url);

        if (is_wp_error($temp_file)) {
            throw new Exception('Could not download logo for color analysis');
        }

        // Create image resource
        $image_info = getimagesize($temp_file);
        $mime_type = $image_info['mime'];

        switch ($mime_type) {
            case 'image/jpeg':
            case 'image/jpg':
                $image = imagecreatefromjpeg($temp_file);
                break;
            case 'image/png':
                $image = imagecreatefrompng($temp_file);
                break;
            case 'image/webp':
                $image = imagecreatefromwebp($temp_file);
                break;
            default:
                @unlink($temp_file);
                throw new Exception('Unsupported image format');
        }

        if (!$image) {
            @unlink($temp_file);
            throw new Exception('Failed to create image resource');
        }

        // Resize for faster processing
        $resized = imagescale($image, 150);
        $width = imagesx($resized);
        $height = imagesy($resized);

        // Extract colors
        $colors = array();
        $step = 10; // Sample every 10 pixels for speed

        for ($x = 0; $x < $width; $x += $step) {
            for ($y = 0; $y < $height; $y += $step) {
                $rgb = imagecolorat($resized, $x, $y);
                $r = ($rgb >> 16) & 0xFF;
                $g = ($rgb >> 8) & 0xFF;
                $b = $rgb & 0xFF;

                // Skip very light or very dark colors (filtering noise)
                if (($r + $g + $b) < 50 || ($r + $g + $b) > 700) {
                    continue;
                }

                $hex = sprintf("#%02x%02x%02x", $r, $g, $b);
                $colors[] = $hex;
            }
        }

        // Clean up
        imagedestroy($image);
        imagedestroy($resized);
        @unlink($temp_file);

        // Get most common colors
        if (empty($colors)) {
            return $this->get_fallback_colors_simple();
        }

        $color_counts = array_count_values($colors);
        arsort($color_counts);
        $dominant = array_slice(array_keys($color_counts), 0, $num_colors);

        return $dominant;
    }

    private function get_fallback_colors()
    {
        return array(
            'primary' => '#2563EB',    // Professional blue
            'secondary' => '#7C3AED',   // Purple accent
            'accent' => '#F59E0B',      // Warm orange
            'neutral' => '#FFFFFF',     // White
            'dark' => '#1F2937'         // Dark gray
        );
    }

    private function get_fallback_colors_simple()
    {
        return ['#2563EB', '#7C3AED', '#F59E0B'];
    }

    /**
     * Generate complementary color palette
     */
    public function generate_palette_expanded($primary_color)
    {
        // Generate a 5-color palette based on primary
        $palette = array();
        $palette[] = $primary_color;
        $palette[] = $this->lighten_color($primary_color, 20);
        $palette[] = $this->darken_color($primary_color, 20);

        // Complementary logic (simplified)
        $r = hexdec(substr($primary_color, 1, 2));
        $g = hexdec(substr($primary_color, 3, 2));
        $b = hexdec(substr($primary_color, 5, 2));
        $comp = sprintf("#%02x%02x%02x", 255 - $r, 255 - $g, 255 - $b);

        $palette[] = $comp;
        $palette[] = $this->lighten_color($comp, 10);

        return $palette; // Returns index array of hex codes
    }

    private function lighten_color($hex, $percent)
    {
        $r = hexdec(substr($hex, 1, 2));
        $g = hexdec(substr($hex, 3, 2));
        $b = hexdec(substr($hex, 5, 2));

        $r = min(255, $r + ($percent * 255 / 100));
        $g = min(255, $g + ($percent * 255 / 100));
        $b = min(255, $b + ($percent * 255 / 100));

        return sprintf("#%02x%02x%02x", $r, $g, $b);
    }

    private function darken_color($hex, $percent)
    {
        $r = hexdec(substr($hex, 1, 2));
        $g = hexdec(substr($hex, 3, 2));
        $b = hexdec(substr($hex, 5, 2));

        $r = max(0, $r - ($percent * 255 / 100));
        $g = max(0, $g - ($percent * 255 / 100));
        $b = max(0, $b - ($percent * 255 / 100));

        return sprintf("#%02x%02x%02x", $r, $g, $b);
    }
}
