<?php
// MODULE: Site Assembler (The Page Builder)

add_action('rest_api_init', function () {
    register_rest_route('presspilot/v1', '/bake', [
        'methods' => 'POST',
        'callback' => 'presspilot_assemble_site',
        'permission_callback' => '__return_true',
    ]);
});

function presspilot_assemble_site($request)
{
    $recipe = $request->get_json_params();

    $site_title = $recipe['site_title'] ?? 'Koboo Pizza';
    $primary_color = $recipe['primary_color'] ?? '#D4AF37'; // Gold

    // 1. Basic Identity
    if (!empty($site_title)) {
        update_option('blogname', sanitize_text_field($site_title));
        update_option('blogdescription', 'Wood-fired excellence.');
    }

    // 2. Identify/Create Pages
    $pages = [
        'Home' => [
            'content' => '<!-- wp:cover {"url":"https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=2000","dimRatio":50,"overlayColor":"#000000","align":"full"} -->
<div class="wp-block-cover alignfull"><span aria-hidden="true" class="wp-block-cover__background has-background-dim-50 has-background-dim" style="background-color:#000000"></span><img class="wp-block-cover__image-background" alt="" src="https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=2000" data-object-fit="cover"/><div class="wp-block-cover__inner-container"><!-- wp:heading {"textAlign":"center","level":1,"style":{"typography":{"fontSize":"6rem","fontWeight":"800"}}} -->
<h1 class="wp-block-heading has-text-align-center" style="font-size:6rem;font-weight:800">' . $site_title . '</h1>
<!-- /wp:heading -->

<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"1.5rem"}}} -->
<p class="has-text-align-center" style="font-size:1.5rem">Wood-fired heritage. Modern taste.</p>
<!-- /wp:paragraph -->

<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
<div class="wp-block-buttons"><!-- wp:button {"style":{"color":{"background":"#b91c1c"}}} -->
<div class="wp-block-button"><a class="wp-block-button__link has-background wp-element-button" style="background-color:#b91c1c">Order Now</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div></div>
<!-- /wp:cover -->

<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group"><!-- wp:heading {"textAlign":"center"} -->
<h2 class="wp-block-heading has-text-align-center">Our Signature Pizzas</h2>
<!-- /wp:heading -->

<!-- wp:columns -->
<div class="wp-block-columns"><!-- wp:column -->
<div class="wp-block-column"><!-- wp:image {"aspectRatio":"16/9","scale":"cover","linkDestination":"none"} -->
<figure class="wp-block-image"><img alt="" style="aspect-ratio:16/9;object-fit:cover"/></figure>
<!-- /wp:image -->
<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">Margherita</h3>
<!-- /wp:heading -->
<!-- wp:paragraph -->
<p>Classic tomato, fresh mozzarella, basil.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column"><!-- wp:image {"aspectRatio":"16/9","scale":"cover","linkDestination":"none"} -->
<figure class="wp-block-image"><img alt="" style="aspect-ratio:16/9;object-fit:cover"/></figure>
<!-- /wp:image -->
<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">Pepperoni</h3>
<!-- /wp:heading -->
<!-- wp:paragraph -->
<p>Crispy cups, spicy honey drizzle.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column"><!-- wp:image {"aspectRatio":"16/9","scale":"cover","linkDestination":"none"} -->
<figure class="wp-block-image"><img alt="" style="aspect-ratio:16/9;object-fit:cover"/></figure>
<!-- /wp:image -->
<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">Truffle Mushroom</h3>
<!-- /wp:heading -->
<!-- wp:paragraph -->
<p>Wild mushrooms, truffle cream, thyme.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:column --></div>
<!-- /wp:columns --></div>
<!-- /wp:group -->',
            'template' => 'home',
            'order' => 1
        ],
        'Menu' => [
            'content' => '<!-- wp:heading --><h2>Full Menu</h2><!-- /wp:heading --><!-- wp:paragraph --><p>Explore our wide selection of wood-fired pizzas, fresh salads, and handmade desserts.</p><!-- /wp:paragraph -->',
            'template' => 'page',
            'order' => 2
        ],
        'About' => [
            'content' => '<!-- wp:heading --><h2>Our Story</h2><!-- /wp:heading --><!-- wp:paragraph --><p>Founded in 1985, Koboo Pizza brings the authentic taste of Napoli to your neighborhood. Our wood-fired oven runs at 900 degrees to produce the perfect leopard-spotted crust.</p><!-- /wp:paragraph -->',
            'template' => 'page',
            'order' => 3
        ],
        'Services' => [
            'content' => '<!-- wp:heading --><h2>Catering & Events</h2><!-- /wp:heading --><!-- wp:paragraph --><p>We bring the oven to you. Book our mobile pizza truck for your next event.</p><!-- /wp:paragraph -->',
            'template' => 'page',
            'order' => 4
        ],
        'Blog' => [
            'content' => '<!-- wp:heading --><h2>Latest News</h2><!-- /wp:heading --><!-- wp:latest-posts {"displayPostDate":true} /-->',
            'template' => 'page',
            'order' => 5
        ],
        'Contact' => [
            'content' => '<!-- wp:heading --><h2>Visit Us</h2><!-- /wp:heading --><!-- wp:paragraph --><p>123 Pizza Lane<br>Flavor Town, USA</p><!-- /wp:paragraph --><!-- wp:paragraph --><p>(555) 123-4567</p><!-- /wp:paragraph -->',
            'template' => 'page',
            'order' => 6
        ]
    ];

    $created_pages = [];

    foreach ($pages as $title => $data) {
        $existing = get_page_by_title($title);
        if (!$existing) {
            $page_id = wp_insert_post([
                'post_title' => $title,
                'post_content' => $data['content'],
                'post_status' => 'publish',
                'post_type' => 'page',
                'menu_order' => $data['order']
            ]);
            $created_pages[$title] = $page_id;
        } else {
            // Update existing
            $created_pages[$title] = $existing->ID;
            wp_update_post([
                'ID' => $existing->ID,
                'post_content' => $data['content'],
                'menu_order' => $data['order']
            ]);
        }
    }

    // 3. Set Home Page as Static Front Page
    if (isset($created_pages['Home'])) {
        update_option('show_on_front', 'page');
        update_option('page_on_front', $created_pages['Home']);
        if (isset($created_pages['Blog'])) {
            update_option('page_for_posts', $created_pages['Blog']);
        }
    }

    // 4. Colors (Simulated injection via prompt)
    // We would inject theme.json modifications here in a real scenario.

    return [
        'status' => 'success',
        'message' => 'Koboo Pizza Master Bake Complete.',
        'pages' => $created_pages,
        'home_url' => home_url()
    ];
}
