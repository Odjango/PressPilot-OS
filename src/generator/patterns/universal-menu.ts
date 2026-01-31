import { PageContent } from '../types';

export const getUniversalMenuContent = (content?: PageContent) => {
    const menus = (content?.menus && content.menus.length > 0) ? content.menus : [{
        title: 'Our Menu',
        items: [
            { name: 'Margherita Pizza', description: 'Tomato, Mozzarella, Basil', price: '$14.00' },
            { name: 'Pepperoni Feast', description: 'Tomato, Mozzarella, Pepperoni', price: '$16.00' },
            { name: 'Vegetarian', description: 'Peppers, Mushrooms, Onions, Olives', price: '$15.00' },
            { name: 'Tiramisu', description: 'Classic Italian Dessert', price: '$8.00' }
        ]
    }];

    const menuBlocks = menus.map(menu => {
        const items = menu.items || [];
        const leftColItems = items.filter((_, i) => i % 2 === 0);
        const rightColItems = items.filter((_, i) => i % 2 !== 0);

        const renderItem = (item: any) => `
            <!-- wp:group {"style":{"spacing":{"margin":{"bottom":"var:preset|spacing|40"}},"border":{"bottom":{"color":"var:preset|color|contrast","width":"1px"}}},"layout":{"type":"constrained"}} -->
            <div class="wp-block-group" style="border-bottom-color:var(--wp--preset--color--contrast);border-bottom-width:1px;margin-bottom:var(--wp--preset--spacing--40)">
                <!-- wp:group {"layout":{"type":"flex","justifyContent":"space-between"}} -->
                <div class="wp-block-group">
                    <!-- wp:heading {"level":4,"style":{"typography":{"fontSize":"1.2rem","fontWeight":"700"}}} -->
                    <h4 class="wp-block-heading" style="font-size:1.2rem;font-weight:700">${item.name}</h4>
                    <!-- /wp:heading -->
                    <!-- wp:paragraph {"style":{"typography":{"fontWeight":"700"}}} -->
                    <p style="font-weight:700">${item.price}</p>
                    <!-- /wp:paragraph -->
                </div>
                <!-- /wp:group -->
                <!-- wp:paragraph {"style":{"typography":{"fontStyle":"italic"}},"fontSize":"small"} -->
                <p class="has-small-font-size" style="font-style:italic">${item.description || ''}</p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:group -->
        `;

        return `
            <!-- wp:columns {"align":"wide","style":{"spacing":{"blockGap":{"left":"var:preset|spacing|50"}}}} -->
            <div class="wp-block-columns alignwide">
                <!-- wp:column -->
                <div class="wp-block-column">
                    ${leftColItems.map(renderItem).join('')}
                </div>
                <!-- /wp:column -->
                <!-- wp:column -->
                <div class="wp-block-column">
                    ${rightColItems.map(renderItem).join('')}
                </div>
                <!-- /wp:column -->
            </div>
            <!-- /wp:columns -->
        `;
    }).join('');

    return `
    <!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}},"backgroundColor":"base","layout":{"type":"constrained"}} -->
    <div class="wp-block-group alignfull has-base-background-color has-background" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)">
        
        <!-- wp:heading {"textAlign":"center","level":1,"style":{"spacing":{"margin":{"bottom":"var:preset|spacing|50"}}}} -->
        <h1 class="wp-block-heading has-text-align-center" style="margin-bottom:var(--wp--preset--spacing--50)">Our Menu</h1>
        <!-- /wp:heading -->

        ${menuBlocks}

    </div>
    <!-- /wp:group -->
    `;
};