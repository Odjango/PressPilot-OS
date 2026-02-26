<?php
// MODULE: Theme Matcher (The Universal Matcher)

add_action('after_setup_theme', function () {
    // Universal Standard: Ollie
    // In the future, this can accept 'business_type' to select different themes.
    if (get_option('template') !== 'ollie') {
        switch_theme('ollie');
    }
});
