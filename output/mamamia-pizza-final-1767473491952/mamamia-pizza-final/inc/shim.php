<?php
/**
 * Shim / Bootstrapper
 * URL: /?presspilot_bake=1
 */

add_action('init', function () {
    if (isset($_GET['presspilot_bake']) && $_GET['presspilot_bake'] == '1') {

        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }

        $assembler = new PressPilot_Site_Assembler();

        // Hardcoded Baking Data (Koboo Pizza)
        $result = $assembler->assemble(
            'Koboo Pizza',
            'twentytwentyfour', // Parent theme
            [
                'home' => [
                    'hero_headline' => 'Koboo Pizza Factory',
                    'hero_subheadline' => 'Authentic Wood-Fired Pizza delivered to your door.',
                    'cta_text' => 'Order Online'
                ],
                'about' => [],
                'services' => [],
                'contact' => [],
                'blog' => []
            ],
            ['primary' => '#ff4500'],
            'restaurant',
            '', // Logo URL
            'Best Pizza in Town'
        );

        echo "<pre>Bake Complete:\n";
        print_r($result);
        echo "</pre>";
        exit;
    }
});
