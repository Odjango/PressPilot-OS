<?php
// MODULE: Design Tools (CSS & Styling)

add_action('wp_head', 'presspilot_output_agent_css');

function presspilot_output_agent_css()
{
    echo '<style>
        .site-footer .footer-credits, .powered-by { display: none !important; }
    </style>';
}
