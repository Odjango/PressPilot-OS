import { RestaurantMenu, RestaurantMenuItem } from '../types';


/**
 * Generates a WordPress FSE Pattern for a Restaurant Menu.
 * Uses strict Columns/Group blocks to avoid validation errors.
 */
export function generateMenuPattern(menu: RestaurantMenu): string {
  const itemsHtml = menu.items.map(generateMenuItemBlock).join('\n');

  const groupAttrs = JSON.stringify({
    style: { spacing: { padding: { top: 'var:preset|spacing|50', bottom: 'var:preset|spacing|50' } } },
    layout: { type: 'constrained' }
  });

  const headingAttrs = JSON.stringify({
    textAlign: 'center',
    style: { typography: { textTransform: 'uppercase', letterSpacing: '2px' } }
  });

  const separatorAttrs = JSON.stringify({
    className: 'is-style-wide'
  });

  const columnsAttrs = JSON.stringify({
    style: { spacing: { blockGap: { top: 'var:preset|spacing|30', left: 'var:preset|spacing|40' } } }
  });

  return `<!-- wp:group ${groupAttrs} -->
<div class="wp-block-group" style="padding-top:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--50)">
  <!-- wp:heading ${headingAttrs} -->
  <h2 class="wp-block-heading has-text-align-center" style="text-transform:uppercase;letter-spacing:2px">${menu.title}</h2>
  <!-- /wp:heading -->

  <!-- wp:separator ${separatorAttrs} -->
  <hr class="wp-block-separator is-style-wide"/>
  <!-- /wp:separator -->

  <!-- wp:columns ${columnsAttrs} -->
  <div class="wp-block-columns">
    ${itemsHtml}
  </div>
  <!-- /wp:columns -->
</div>
<!-- /wp:group -->`;
}

function generateMenuItemBlock(item: RestaurantMenuItem): string {
  const columnAttrs = JSON.stringify({
    width: '50%'
  });

  const innerGroupAttrs = JSON.stringify({
    style: { spacing: { blockGap: '0.5rem' } },
    layout: { type: 'flex', flexWrap: 'nowrap', justifyContent: 'space-between' }
  });

  const itemHeadingAttrs = JSON.stringify({
    level: 4,
    style: { typography: { fontStyle: 'normal', fontWeight: '700' } }
  });

  const priceParaAttrs = JSON.stringify({
    style: { typography: { fontWeight: '600' } }
  });

  const descParaAttrs = JSON.stringify({
    style: { typography: { fontSize: 'small', fontStyle: 'italic' } }
  });

  return `<!-- wp:column ${columnAttrs} -->
<div class="wp-block-column" style="flex-basis:50%">
  <!-- wp:group ${innerGroupAttrs} -->
  <div class="wp-block-group">
    <!-- wp:heading ${itemHeadingAttrs} -->
    <h4 class="wp-block-heading" style="font-style:normal;font-weight:700">${item.name}</h4>
    <!-- /wp:heading -->

    <!-- wp:paragraph ${priceParaAttrs} -->
    <p style="font-weight:600">${item.price}</p>
    <!-- /wp:paragraph -->
  </div>
  <!-- /wp:group -->

  ${item.description ? `<!-- wp:paragraph ${descParaAttrs} -->
  <p class="has-small-font-size" style="font-style:italic">${item.description}</p>
  <!-- /wp:paragraph -->` : ''}
</div>
<!-- /wp:column -->`;
}
