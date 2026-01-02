<?php
/**
 * Module: Color Extractor
 * Purpose: Extract dominant colors from logo using AI
 * Architecture: Modular - can switch to different color extraction method easily
 */

if (!defined('ABSPATH')) {
    exit;
}

class PressPilot_Color_Extractor {
    
    /**
     * Extract colors from logo image
     * MVP: Simple dominant color extraction
     * Future: AI-powered palette generation
     */
    public function extract($image_url) {
        // For MVP: Use basic PHP image color extraction
        // Future: Can upgrade to AI-powered color analysis
        
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
    private function get_dominant_colors($image_url, $num_colors = 3) {
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
                unlink($temp_file);
                throw new Exception('Unsupported image format');
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
                
                // Skip very light or very dark colors
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
        unlink($temp_file);
        
        // Get most common colors
        if (empty($colors)) {
            return $this->get_fallback_colors();
        }
        
        $color_counts = array_count_values($colors);
        arsort($color_counts);
        $dominant = array_slice(array_keys($color_counts), 0, $num_colors);
        
        return $dominant;
    }
    
    /**
     * Fallback colors if extraction fails
     */
    private function get_fallback_colors() {
        return array(
            'primary' => '#2563EB',    // Professional blue
            'secondary' => '#7C3AED',   // Purple accent
            'accent' => '#F59E0B',      // Warm orange
            'neutral' => '#FFFFFF',     // White
            'dark' => '#1F2937'         // Dark gray
        );
    }
    
    /**
     * Generate complementary color palette
     * Future enhancement: AI-powered palette generation
     */
    public function generate_palette($primary_color) {
        // Convert hex to RGB
        $r = hexdec(substr($primary_color, 1, 2));
        $g = hexdec(substr($primary_color, 3, 2));
        $b = hexdec(substr($primary_color, 5, 2));
        
        // Generate complementary colors
        // This is simplified - can be enhanced with color theory algorithms
        
        return array(
            'primary' => $primary_color,
            'light' => $this->lighten_color($primary_color, 30),
            'dark' => $this->darken_color($primary_color, 30),
            'complement' => sprintf("#%02x%02x%02x", 255 - $r, 255 - $g, 255 - $b)
        );
    }
    
    /**
     * Lighten a color
     */
    private function lighten_color($hex, $percent) {
        $r = hexdec(substr($hex, 1, 2));
        $g = hexdec(substr($hex, 3, 2));
        $b = hexdec(substr($hex, 5, 2));
        
        $r = min(255, $r + ($percent * 255 / 100));
        $g = min(255, $g + ($percent * 255 / 100));
        $b = min(255, $b + ($percent * 255 / 100));
        
        return sprintf("#%02x%02x%02x", $r, $g, $b);
    }
    
    /**
     * Darken a color
     */
    private function darken_color($hex, $percent) {
        $r = hexdec(substr($hex, 1, 2));
        $g = hexdec(substr($hex, 3, 2));
        $b = hexdec(substr($hex, 5, 2));
        
        $r = max(0, $r - ($percent * 255 / 100));
        $g = max(0, $g - ($percent * 255 / 100));
        $b = max(0, $b - ($percent * 255 / 100));
        
        return sprintf("#%02x%02x%02x", $r, $g, $b);
    }
}
