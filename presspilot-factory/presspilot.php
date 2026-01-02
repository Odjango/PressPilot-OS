<?php
/* Plugin Name: PressPilot Factory Orchestrator */
add_action('wp_head', function () {
    echo '<style>
        .wp-block-post-title, .entry-title, h1.has-medium-font-size { display: none !important; }
        .site-footer .footer-credits, .powered-by, .site-footer__inner > p { display: none !important; }
        .pp-factory-footer { text-align: center; color: #888; font-size: 13px; font-weight: 400; padding: 20px 0; }
    </style>';
});
add_action('wp_footer', function () {
    echo '<div class="pp-factory-footer">powered by presspilot universal factory</div>';
}, 999);
