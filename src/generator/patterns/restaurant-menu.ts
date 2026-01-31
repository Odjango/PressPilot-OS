import { RestaurantMenu, RestaurantMenuItem } from '../types';

/**
 * Generates a WordPress FSE Pattern for a Restaurant Menu.
 * Uses strict Columns/Group blocks with proper 2-column layout.
 */
export function generateMenuPattern(menu: RestaurantMenu): string {
  // Split items into pairs for 2-column layout
  const rows: string[] = [];
  for (let i = 0; i < menu.items.length; i += 2) {
    const leftItem = menu.items[i];
    const rightItem = menu.items[i + 1];
    rows.push(generateMenuRow(leftItem, rightItem));
  }

  return `<!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group" style="padding-top:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--50)">
  <!-- wp:heading {"textAlign":"center","style":{"typography":{"textTransform":"uppercase","letterSpacing":"2px"}}} -->
  <h2 class="wp-block-heading has-text-align-center" style="text-transform:uppercase;letter-spacing:2px">${menu.title}</h2>
  <!-- /wp:heading -->
  <!-- wp:separator {"className":"is-style-wide"} -->
  <hr class="wp-block-separator is-style-wide"/>
  <!-- /wp:separator -->
  ${rows.join('\n')}
</div>
<!-- /wp:group -->`;
}

function generateMenuRow(leftItem: RestaurantMenuItem, rightItem?: RestaurantMenuItem): string {
  const leftColumn = generateMenuItemColumn(leftItem);
  const rightColumn = rightItem ? generateMenuItemColumn(rightItem) : `<!-- wp:column -->
<div class="wp-block-column"></div>
<!-- /wp:column -->`;

  return `<!-- wp:columns {"style":{"spacing":{"blockGap":{"left":"var:preset|spacing|50"},"margin":{"bottom":"var:preset|spacing|30"}}}} -->
<div class="wp-block-columns" style="margin-bottom:var(--wp--preset--spacing--30)">
  ${leftColumn}
  ${rightColumn}
</div>
<!-- /wp:columns -->`;
}

function generateMenuItemColumn(item: RestaurantMenuItem): string {
  return `<!-- wp:column -->
<div class="wp-block-column">
  <!-- wp:group {"style":{"spacing":{"blockGap":"0"}},"layout":{"type":"constrained"}} -->
  <div class="wp-block-group">
    <!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"space-between"}} -->
    <div class="wp-block-group">
      <!-- wp:heading {"level":4,"style":{"typography":{"fontStyle":"normal","fontWeight":"700"}}} -->
      <h4 class="wp-block-heading" style="font-style:normal;font-weight:700">${item.name}</h4>
      <!-- /wp:heading -->
      <!-- wp:paragraph {"style":{"typography":{"fontWeight":"600"}}} -->
      <p style="font-weight:600">${item.price}</p>
      <!-- /wp:paragraph -->
    </div>
    <!-- /wp:group -->
    ${item.description ? `<!-- wp:paragraph {"style":{"typography":{"fontStyle":"italic"}},"fontSize":"small"} -->
    <p class="has-small-font-size" style="font-style:italic">${item.description}</p>
    <!-- /wp:paragraph -->` : ''}
  </div>
  <!-- /wp:group -->
</div>
<!-- /wp:column -->`;
}
