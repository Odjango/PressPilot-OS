import { RestaurantMenu, RestaurantMenuItem } from '../types';

/**
 * Generates a WordPress FSE Pattern for a Restaurant Menu.
 * Uses strict Columns/Group blocks to avoid validation errors.
 */
export function generateMenuPattern(menu: RestaurantMenu): string {
    const itemsHtml = menu.items.map(generateMenuItemBlock).join('\n');

    return `<!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group" style="padding-top:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--50)">
  <!-- wp:heading {"textAlign":"center","style":{"typography":{"textTransform":"uppercase","letterSpacing":"2px"}}} -->
  <h2 class="wp-block-heading has-text-align-center" style="text-transform:uppercase;letter-spacing:2px">${menu.title}</h2>
  <!-- /wp:heading -->

  <!-- wp:separator {"className":"is-style-wide"} -->
  <hr class="wp-block-separator is-style-wide"/>
  <!-- /wp:separator -->

  <!-- wp:columns {"style":{"spacing":{"blockGap":{"top":"var:preset|spacing|30","left":"var:preset|spacing|40"}}}} -->
  <div class="wp-block-columns">
    ${itemsHtml}
  </div>
  <!-- /wp:columns -->
</div>
<!-- /wp:group -->`;
}

function generateMenuItemBlock(item: RestaurantMenuItem): string {
    // Each item is a column (for a Grid Layout)
    // Or valid row. Let's use a Column per item if we want a grid, or a group per item if we want a list.
    // The plan called for "Columns Block". Let's assume a 2-column grid layout for items.
    // Actually, standard menu is typically a list.
    // Let's make it a 2-column grid of items.

    return `<!-- wp:column {"width":"50%"} -->
<div class="wp-block-column" style="flex-basis:50%">
  <!-- wp:group {"style":{"spacing":{"blockGap":"0.5rem"}},"layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"space-between"}} -->
  <div class="wp-block-group">
    <!-- wp:heading {"level":4,"style":{"typography":{"fontStyle":"normal","fontWeight":"700"}}} -->
    <h4 class="wp-block-heading" style="font-style:normal;font-weight:700">${item.name}</h4>
    <!-- /wp:heading -->

    <!-- wp:paragraph {"style":{"typography":{"fontWeight":"600"}}} -->
    <p style="font-weight:600">${item.price}</p>
    <!-- /wp:paragraph -->
  </div>
  <!-- /wp:group -->

  ${item.description ? `<!-- wp:paragraph {"style":{"typography":{"fontSize":"small","fontStyle":"italic"}}} -->
  <p class="has-small-font-size" style="font-style:italic">${item.description}</p>
  <!-- /wp:paragraph -->` : ''}
</div>
<!-- /wp:column -->`;
}
