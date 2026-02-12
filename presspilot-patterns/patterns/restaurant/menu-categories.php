<?php
/**
 * Title: Restaurant Menu with Categories
 * Slug: presspilot/restaurant-menu-categories
 * Categories: restaurant, featured
 * Block Types: core/group
 */

$section_title    = presspilot_string( 'menu/section-title', 'Our Menu' );
$section_subtitle = presspilot_string( 'menu/section-subtitle', 'Crafted with love, served with passion' );
$cat1_name        = presspilot_string( 'menu/category-1-name', 'Appetizers' );
$cat2_name        = presspilot_string( 'menu/category-2-name', 'Main Courses' );
$cat3_name        = presspilot_string( 'menu/category-3-name', 'Desserts' );

// Menu items - these would be populated from AI-generated JSON
$appetizers = array(
    array( 'name' => presspilot_string( 'menu/item-1-name', 'Bruschetta Classica' ), 'description' => presspilot_string( 'menu/item-1-desc', 'Grilled bread topped with fresh tomatoes, garlic, basil, and olive oil' ), 'price' => presspilot_string( 'menu/item-1-price', '$12' ) ),
    array( 'name' => presspilot_string( 'menu/item-2-name', 'Calamari Fritti' ), 'description' => presspilot_string( 'menu/item-2-desc', 'Crispy fried calamari served with marinara sauce' ), 'price' => presspilot_string( 'menu/item-2-price', '$16' ) ),
    array( 'name' => presspilot_string( 'menu/item-3-name', 'Caprese Salad' ), 'description' => presspilot_string( 'menu/item-3-desc', 'Fresh mozzarella, tomatoes, and basil with balsamic glaze' ), 'price' => presspilot_string( 'menu/item-3-price', '$14' ) ),
);

$mains = array(
    array( 'name' => presspilot_string( 'menu/item-4-name', 'Margherita Pizza' ), 'description' => presspilot_string( 'menu/item-4-desc', 'San Marzano tomatoes, fresh mozzarella, basil, extra virgin olive oil' ), 'price' => presspilot_string( 'menu/item-4-price', '$18' ) ),
    array( 'name' => presspilot_string( 'menu/item-5-name', 'Spaghetti Carbonara' ), 'description' => presspilot_string( 'menu/item-5-desc', 'Classic Roman pasta with pancetta, egg, pecorino, and black pepper' ), 'price' => presspilot_string( 'menu/item-5-price', '$22' ) ),
    array( 'name' => presspilot_string( 'menu/item-6-name', 'Osso Buco' ), 'description' => presspilot_string( 'menu/item-6-desc', 'Braised veal shanks with gremolata and saffron risotto' ), 'price' => presspilot_string( 'menu/item-6-price', '$38' ) ),
);

$desserts = array(
    array( 'name' => presspilot_string( 'menu/item-7-name', 'Tiramisu' ), 'description' => presspilot_string( 'menu/item-7-desc', 'Classic Italian dessert with espresso-soaked ladyfingers and mascarpone' ), 'price' => presspilot_string( 'menu/item-7-price', '$12' ) ),
    array( 'name' => presspilot_string( 'menu/item-8-name', 'Panna Cotta' ), 'description' => presspilot_string( 'menu/item-8-desc', 'Vanilla bean cream with mixed berry compote' ), 'price' => presspilot_string( 'menu/item-8-price', '$10' ) ),
);
?>
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|70","bottom":"var:preset|spacing|70","left":"var:preset|spacing|30","right":"var:preset|spacing|30"}}},"backgroundColor":"background","layout":{"type":"constrained","contentSize":"1000px"}} -->
<div id="menu" class="wp-block-group alignfull has-background-background-color has-background" style="padding-top:var(--wp--preset--spacing--70);padding-right:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--70);padding-left:var(--wp--preset--spacing--30)">
	<!-- wp:group {"style":{"spacing":{"margin":{"bottom":"var:preset|spacing|50"}}},"layout":{"type":"constrained"}} -->
	<div class="wp-block-group" style="margin-bottom:var(--wp--preset--spacing--50)">
		<!-- wp:heading {"textAlign":"center","style":{"typography":{"fontSize":"clamp(2rem, 4vw, 3rem)","fontWeight":"700"}},"textColor":"foreground"} -->
		<h2 class="wp-block-heading has-text-align-center has-foreground-color has-text-color" style="font-size:clamp(2rem, 4vw, 3rem);font-weight:700"><?php echo esc_html( $section_title ); ?></h2>
		<!-- /wp:heading -->

		<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"1.125rem"}},"textColor":"secondary"} -->
		<p class="has-text-align-center has-secondary-color has-text-color" style="font-size:1.125rem"><?php echo esc_html( $section_subtitle ); ?></p>
		<!-- /wp:paragraph -->
	</div>
	<!-- /wp:group -->

	<!-- wp:columns {"style":{"spacing":{"blockGap":{"top":"var:preset|spacing|50","left":"var:preset|spacing|50"}}}} -->
	<div class="wp-block-columns">
		<!-- wp:column -->
		<div class="wp-block-column">
			<!-- wp:heading {"level":3,"style":{"typography":{"fontSize":"1.5rem","fontWeight":"600"},"spacing":{"margin":{"bottom":"var:preset|spacing|30"}}},"textColor":"primary"} -->
			<h3 class="wp-block-heading has-primary-color has-text-color" style="margin-bottom:var(--wp--preset--spacing--30);font-size:1.5rem;font-weight:600"><?php echo esc_html( $cat1_name ); ?></h3>
			<!-- /wp:heading -->

			<?php foreach ( $appetizers as $item ) : ?>
			<!-- wp:group {"style":{"spacing":{"margin":{"bottom":"var:preset|spacing|20"},"padding":{"bottom":"var:preset|spacing|20"}},"border":{"bottom":{"color":"var:preset|color|tertiary","width":"1px"}}},"layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"space-between","verticalAlignment":"top"}} -->
			<div class="wp-block-group" style="border-bottom-color:var(--wp--preset--color--tertiary);border-bottom-width:1px;margin-bottom:var(--wp--preset--spacing--20);padding-bottom:var(--wp--preset--spacing--20)">
				<!-- wp:group {"style":{"layout":{"selfStretch":"fill"}},"layout":{"type":"constrained"}} -->
				<div class="wp-block-group">
					<!-- wp:heading {"level":4,"style":{"typography":{"fontSize":"1.1rem","fontWeight":"600"},"spacing":{"margin":{"bottom":"4px"}}},"textColor":"foreground"} -->
					<h4 class="wp-block-heading has-foreground-color has-text-color" style="margin-bottom:4px;font-size:1.1rem;font-weight:600"><?php echo esc_html( $item['name'] ); ?></h4>
					<!-- /wp:heading -->
					<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.9rem"}},"textColor":"secondary"} -->
					<p class="has-secondary-color has-text-color" style="font-size:0.9rem"><?php echo esc_html( $item['description'] ); ?></p>
					<!-- /wp:paragraph -->
				</div>
				<!-- /wp:group -->
				<!-- wp:paragraph {"style":{"typography":{"fontWeight":"600","fontSize":"1.1rem"},"layout":{"selfStretch":"fit"}},"textColor":"primary"} -->
				<p class="has-primary-color has-text-color" style="font-size:1.1rem;font-weight:600"><?php echo esc_html( $item['price'] ); ?></p>
				<!-- /wp:paragraph -->
			</div>
			<!-- /wp:group -->
			<?php endforeach; ?>

			<!-- wp:heading {"level":3,"style":{"typography":{"fontSize":"1.5rem","fontWeight":"600"},"spacing":{"margin":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|30"}}},"textColor":"primary"} -->
			<h3 class="wp-block-heading has-primary-color has-text-color" style="margin-top:var(--wp--preset--spacing--40);margin-bottom:var(--wp--preset--spacing--30);font-size:1.5rem;font-weight:600"><?php echo esc_html( $cat3_name ); ?></h3>
			<!-- /wp:heading -->

			<?php foreach ( $desserts as $item ) : ?>
			<!-- wp:group {"style":{"spacing":{"margin":{"bottom":"var:preset|spacing|20"},"padding":{"bottom":"var:preset|spacing|20"}},"border":{"bottom":{"color":"var:preset|color|tertiary","width":"1px"}}},"layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"space-between","verticalAlignment":"top"}} -->
			<div class="wp-block-group" style="border-bottom-color:var(--wp--preset--color--tertiary);border-bottom-width:1px;margin-bottom:var(--wp--preset--spacing--20);padding-bottom:var(--wp--preset--spacing--20)">
				<!-- wp:group {"style":{"layout":{"selfStretch":"fill"}},"layout":{"type":"constrained"}} -->
				<div class="wp-block-group">
					<!-- wp:heading {"level":4,"style":{"typography":{"fontSize":"1.1rem","fontWeight":"600"},"spacing":{"margin":{"bottom":"4px"}}},"textColor":"foreground"} -->
					<h4 class="wp-block-heading has-foreground-color has-text-color" style="margin-bottom:4px;font-size:1.1rem;font-weight:600"><?php echo esc_html( $item['name'] ); ?></h4>
					<!-- /wp:heading -->
					<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.9rem"}},"textColor":"secondary"} -->
					<p class="has-secondary-color has-text-color" style="font-size:0.9rem"><?php echo esc_html( $item['description'] ); ?></p>
					<!-- /wp:paragraph -->
				</div>
				<!-- /wp:group -->
				<!-- wp:paragraph {"style":{"typography":{"fontWeight":"600","fontSize":"1.1rem"},"layout":{"selfStretch":"fit"}},"textColor":"primary"} -->
				<p class="has-primary-color has-text-color" style="font-size:1.1rem;font-weight:600"><?php echo esc_html( $item['price'] ); ?></p>
				<!-- /wp:paragraph -->
			</div>
			<!-- /wp:group -->
			<?php endforeach; ?>
		</div>
		<!-- /wp:column -->

		<!-- wp:column -->
		<div class="wp-block-column">
			<!-- wp:heading {"level":3,"style":{"typography":{"fontSize":"1.5rem","fontWeight":"600"},"spacing":{"margin":{"bottom":"var:preset|spacing|30"}}},"textColor":"primary"} -->
			<h3 class="wp-block-heading has-primary-color has-text-color" style="margin-bottom:var(--wp--preset--spacing--30);font-size:1.5rem;font-weight:600"><?php echo esc_html( $cat2_name ); ?></h3>
			<!-- /wp:heading -->

			<?php foreach ( $mains as $item ) : ?>
			<!-- wp:group {"style":{"spacing":{"margin":{"bottom":"var:preset|spacing|20"},"padding":{"bottom":"var:preset|spacing|20"}},"border":{"bottom":{"color":"var:preset|color|tertiary","width":"1px"}}},"layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"space-between","verticalAlignment":"top"}} -->
			<div class="wp-block-group" style="border-bottom-color:var(--wp--preset--color--tertiary);border-bottom-width:1px;margin-bottom:var(--wp--preset--spacing--20);padding-bottom:var(--wp--preset--spacing--20)">
				<!-- wp:group {"style":{"layout":{"selfStretch":"fill"}},"layout":{"type":"constrained"}} -->
				<div class="wp-block-group">
					<!-- wp:heading {"level":4,"style":{"typography":{"fontSize":"1.1rem","fontWeight":"600"},"spacing":{"margin":{"bottom":"4px"}}},"textColor":"foreground"} -->
					<h4 class="wp-block-heading has-foreground-color has-text-color" style="margin-bottom:4px;font-size:1.1rem;font-weight:600"><?php echo esc_html( $item['name'] ); ?></h4>
					<!-- /wp:heading -->
					<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.9rem"}},"textColor":"secondary"} -->
					<p class="has-secondary-color has-text-color" style="font-size:0.9rem"><?php echo esc_html( $item['description'] ); ?></p>
					<!-- /wp:paragraph -->
				</div>
				<!-- /wp:group -->
				<!-- wp:paragraph {"style":{"typography":{"fontWeight":"600","fontSize":"1.1rem"},"layout":{"selfStretch":"fit"}},"textColor":"primary"} -->
				<p class="has-primary-color has-text-color" style="font-size:1.1rem;font-weight:600"><?php echo esc_html( $item['price'] ); ?></p>
				<!-- /wp:paragraph -->
			</div>
			<!-- /wp:group -->
			<?php endforeach; ?>
		</div>
		<!-- /wp:column -->
	</div>
	<!-- /wp:columns -->
</div>
<!-- /wp:group -->
