import { PageContent } from '../types';

export const getUniversalMenuContent = (content?: PageContent) => {
    return `
    <!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}},"backgroundColor":"base","layout":{"type":"constrained"}} -->
    <div class="wp-block-group alignfull has-base-background-color has-background" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)">
        
        <!-- wp:heading {"textAlign":"center","level":1,"style":{"spacing":{"margin":{"bottom":"var:preset|spacing|50"}}}} -->
        <h1 class="wp-block-heading has-text-align-center" style="margin-bottom:var(--wp--preset--spacing--50)">Our Menu</h1>
        <!-- /wp:heading -->

        <!-- wp:group {"align":"wide","layout":{"type":"grid","columnCount":2,"minimumColumnWidth":null}} -->
        <div class="wp-block-group alignwide">
            
            <!-- wp:group {"style":{"border":{"width":"1px","style":"solid","color":"var:preset|color|contrast"},"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"}}},"layout":{"type":"flex","orientation":"vertical"}} -->
            <div class="wp-block-group" style="border-style:solid;border-width:1px;border-color:var(--wp--preset--color--contrast);padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)">
                <!-- wp:heading {"level":3} -->
                <h3 class="wp-block-heading">Margherita Pizza</h3>
                <!-- /wp:heading -->
                <!-- wp:paragraph {"style":{"typography":{"fontStyle":"italic"}}} -->
                <p style="font-style:italic">Tomato, Mozzarella, Basil</p>
                <!-- /wp:paragraph -->
                <!-- wp:paragraph {"fontSize":"large"} -->
                <p class="has-large-font-size">$14.00</p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:group -->

            <!-- wp:group {"style":{"border":{"width":"1px","style":"solid","color":"var:preset|color|contrast"},"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"}}},"layout":{"type":"flex","orientation":"vertical"}} -->
            <div class="wp-block-group" style="border-style:solid;border-width:1px;border-color:var(--wp--preset--color--contrast);padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)">
                <!-- wp:heading {"level":3} -->
                <h3 class="wp-block-heading">Pepperoni Feast</h3>
                <!-- /wp:heading -->
                <!-- wp:paragraph {"style":{"typography":{"fontStyle":"italic"}}} -->
                <p style="font-style:italic">Tomato, Mozzarella, Pepperoni</p>
                <!-- /wp:paragraph -->
                <!-- wp:paragraph {"fontSize":"large"} -->
                <p class="has-large-font-size">$16.00</p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:group -->

             <!-- wp:group {"style":{"border":{"width":"1px","style":"solid","color":"var:preset|color|contrast"},"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"}}},"layout":{"type":"flex","orientation":"vertical"}} -->
            <div class="wp-block-group" style="border-style:solid;border-width:1px;border-color:var(--wp--preset--color--contrast);padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)">
                <!-- wp:heading {"level":3} -->
                <h3 class="wp-block-heading">Vegetarian</h3>
                <!-- /wp:heading -->
                <!-- wp:paragraph {"style":{"typography":{"fontStyle":"italic"}}} -->
                <p style="font-style:italic">Peppers, Mushrooms, Onions, Olives</p>
                <!-- /wp:paragraph -->
                <!-- wp:paragraph {"fontSize":"large"} -->
                <p class="has-large-font-size">$15.00</p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:group -->

             <!-- wp:group {"style":{"border":{"width":"1px","style":"solid","color":"var:preset|color|contrast"},"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"}}},"layout":{"type":"flex","orientation":"vertical"}} -->
            <div class="wp-block-group" style="border-style:solid;border-width:1px;border-color:var(--wp--preset--color--contrast);padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)">
                <!-- wp:heading {"level":3} -->
                <h3 class="wp-block-heading">Tiramisu</h3>
                <!-- /wp:heading -->
                <!-- wp:paragraph {"style":{"typography":{"fontStyle":"italic"}}} -->
                <p style="font-style:italic">Classic Italian Dessert</p>
                <!-- /wp:paragraph -->
                <!-- wp:paragraph {"fontSize":"large"} -->
                <p class="has-large-font-size">$8.00</p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:group -->

        </div>
        <!-- /wp:group -->
    </div>
    <!-- /wp:group -->
    `;
};
