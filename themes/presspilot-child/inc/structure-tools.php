<?php
/**
 * Atomic Tools: Structure Management
 * Purpose: Handle menus, navigation, and site structure
 * Architecture: Hassan's Rule 1 - Single responsibility per tool
 */

if (!defined('ABSPATH')) {
    exit;
}

class PressPilot_Structure_Tools
{

    /**
     * Add item to navigation menu
     * @param array $params {menu_location, page_id?, label, url?, dry_run?}
     * @return array PressPilot response pattern
     */
    public function menu_add_item($params)
    {
        try {
            $menu_location = sanitize_text_field($params['menu_location']);
            $page_id = intval($params['page_id'] ?? 0);
            $label = sanitize_text_field($params['label']);
            $url = esc_url_raw($params['url'] ?? '');
            $dry_run = (bool) ($params['dry_run'] ?? false);

            if (empty($menu_location) || empty($label)) {
                throw new Exception('Menu location and label are required');
            }

            // Validate menu location exists
            $menu_locations = get_registered_nav_menus();
            if (!isset($menu_locations[$menu_location])) {
                throw new Exception("Menu location '{$menu_location}' is not registered");
            }

            // Get or create menu for this location
            $menu = $this->get_or_create_menu($menu_location);

            // Validate page exists if page_id provided
            if ($page_id > 0) {
                $page = get_post($page_id);
                if (!$page || $page->post_type !== 'page') {
                    throw new Exception("Page with ID {$page_id} not found");
                }
                $url = get_permalink($page_id);
            }

            // Validate URL if no page_id
            if ($page_id <= 0 && empty($url)) {
                throw new Exception('Either page_id or url must be provided');
            }

            // Generate preview
            $preview = $this->generate_menu_preview('add_item', $menu, $label, $url);

            // Execute if not dry run
            if (!$dry_run) {
                // Add menu item
                $menu_item_id = $this->add_menu_item($menu->term_id, $label, $url, $page_id);

                // Create undo token
                $undo_token = $this->create_undo_token('menu_add_item', $menu_item_id, array(
                    'menu_id' => $menu->term_id,
                    'menu_item_id' => $menu_item_id
                ));

                return array(
                    'success' => true,
                    'data' => array(
                        'menu_item_id' => $menu_item_id,
                        'menu_location' => $menu_location,
                        'label' => $label,
                        'url' => $url,
                        'menu_name' => $menu->name
                    ),
                    'preview' => "📋 Added '{$label}' to {$menu_location} menu successfully!",
                    'undo_token' => $undo_token,
                    'next_suggestions' => array(
                        'Add another menu item',
                        'Reorder menu items',
                        'Create a submenu item',
                        'Preview the menu on the frontend'
                    )
                );
            } else {
                return array(
                    'success' => true,
                    'data' => null,
                    'preview' => $preview,
                    'undo_token' => null,
                    'next_suggestions' => array('Add this menu item', 'Try different settings', 'Cancel')
                );
            }

        } catch (Exception $e) {
            return array(
                'success' => false,
                'error' => $e->getMessage(),
                'suggestions' => array(
                    'Check available menu locations: ' . implode(', ', array_keys(get_registered_nav_menus())),
                    'Verify the page ID is correct',
                    'Ensure the URL is valid'
                )
            );
        }
    }

    /**
     * Remove item from navigation menu
     * @param array $params {menu_location, item_id, dry_run?}
     * @return array PressPilot response pattern
     */
    public function menu_remove_item($params)
    {
        try {
            $menu_location = sanitize_text_field($params['menu_location']);
            $item_id = intval($params['item_id']);
            $dry_run = (bool) ($params['dry_run'] ?? false);

            if (empty($menu_location) || $item_id <= 0) {
                throw new Exception('Menu location and item ID are required');
            }

            // Get menu for location
            $menu_id = get_nav_menu_locations()[$menu_location] ?? 0;
            if (!$menu_id) {
                throw new Exception("No menu assigned to location '{$menu_location}'");
            }

            // Validate menu item exists
            $menu_item = wp_setup_nav_menu_item(get_post($item_id));
            if (!$menu_item || $menu_item->post_type !== 'nav_menu_item') {
                throw new Exception("Menu item with ID {$item_id} not found");
            }

            // Generate preview
            $preview = $this->generate_menu_preview('remove_item', null, $menu_item->title, $menu_item->url);

            // Execute if not dry run
            if (!$dry_run) {
                // Store item data for undo
                $item_data = array(
                    'menu_id' => $menu_id,
                    'title' => $menu_item->title,
                    'url' => $menu_item->url,
                    'object_id' => $menu_item->object_id,
                    'object' => $menu_item->object,
                    'type' => $menu_item->type,
                    'menu_order' => $menu_item->menu_order,
                    'parent' => $menu_item->menu_item_parent
                );

                // Remove menu item
                wp_delete_post($item_id, true);

                // Create undo token
                $undo_token = $this->create_undo_token('menu_remove_item', $item_id, $item_data);

                return array(
                    'success' => true,
                    'data' => array(
                        'removed_item_id' => $item_id,
                        'menu_location' => $menu_location,
                        'item_title' => $menu_item->title
                    ),
                    'preview' => "🗑️ Removed '{$menu_item->title}' from {$menu_location} menu successfully!",
                    'undo_token' => $undo_token,
                    'next_suggestions' => array(
                        'Remove another menu item',
                        'Add a new menu item',
                        'Reorder remaining items'
                    )
                );
            } else {
                return array(
                    'success' => true,
                    'data' => null,
                    'preview' => $preview,
                    'undo_token' => null,
                    'next_suggestions' => array('Remove this item', 'Keep the item', 'Cancel')
                );
            }

        } catch (Exception $e) {
            return array(
                'success' => false,
                'error' => $e->getMessage(),
                'suggestions' => array(
                    'Check the menu item ID is correct',
                    'Verify the menu location exists',
                    'List current menu items first'
                )
            );
        }
    }

    /**
     * Reorder menu items
     * @param array $params {menu_location, item_orders, dry_run?}
     * @return array PressPilot response pattern
     */
    public function menu_reorder($params)
    {
        try {
            $menu_location = sanitize_text_field($params['menu_location']);
            $item_orders = $params['item_orders'] ?? array(); // array of ['item_id' => new_order]
            $dry_run = (bool) ($params['dry_run'] ?? false);

            if (empty($menu_location) || empty($item_orders)) {
                throw new Exception('Menu location and item orders are required');
            }

            // Get menu for location
            $menu_id = get_nav_menu_locations()[$menu_location] ?? 0;
            if (!$menu_id) {
                throw new Exception("No menu assigned to location '{$menu_location}'");
            }

            // Get current menu items
            $menu_items = wp_get_nav_menu_items($menu_id);
            $original_orders = array();

            foreach ($menu_items as $item) {
                $original_orders[$item->ID] = $item->menu_order;
            }

            // Generate preview
            $preview = $this->generate_reorder_preview($menu_items, $item_orders);

            // Execute if not dry run
            if (!$dry_run) {
                $updated_count = 0;

                foreach ($item_orders as $item_id => $new_order) {
                    $item_id = intval($item_id);
                    $new_order = intval($new_order);

                    if ($item_id > 0 && $new_order > 0) {
                        update_post_meta($item_id, '_menu_item_menu_item_parent', 0);

                        wp_update_post(array(
                            'ID' => $item_id,
                            'menu_order' => $new_order
                        ));

                        $updated_count++;
                    }
                }

                // Create undo token
                $undo_token = $this->create_undo_token('menu_reorder', $menu_id, array(
                    'original_orders' => $original_orders,
                    'menu_location' => $menu_location
                ));

                return array(
                    'success' => true,
                    'data' => array(
                        'menu_location' => $menu_location,
                        'items_reordered' => $updated_count
                    ),
                    'preview' => "🔄 Reordered {$updated_count} menu items in {$menu_location} menu successfully!",
                    'undo_token' => $undo_token,
                    'next_suggestions' => array(
                        'Preview the reordered menu',
                        'Add more menu items',
                        'Reorder items in another menu'
                    )
                );
            } else {
                return array(
                    'success' => true,
                    'data' => null,
                    'preview' => $preview,
                    'undo_token' => null,
                    'next_suggestions' => array('Apply new order', 'Try different order', 'Cancel')
                );
            }

        } catch (Exception $e) {
            return array(
                'success' => false,
                'error' => $e->getMessage(),
                'suggestions' => array(
                    'Check the menu location exists',
                    'Verify all item IDs are valid',
                    'Ensure order numbers are positive integers'
                )
            );
        }
    }

    /**
     * Get or create menu for location
     */
    private function get_or_create_menu($menu_location)
    {
        $locations = get_nav_menu_locations();

        // Check if menu already exists for this location
        if (isset($locations[$menu_location])) {
            $menu = wp_get_nav_menu_object($locations[$menu_location]);
            if ($menu) {
                return $menu;
            }
        }

        // Create new menu
        $menu_name = ucfirst(str_replace('_', ' ', $menu_location)) . ' Menu';
        $menu_id = wp_create_nav_menu($menu_name);

        if (is_wp_error($menu_id)) {
            throw new Exception('Failed to create menu: ' . $menu_id->get_error_message());
        }

        // Assign menu to location
        $locations[$menu_location] = $menu_id;
        set_theme_mod('nav_menu_locations', $locations);

        return wp_get_nav_menu_object($menu_id);
    }

    /**
     * Add menu item to menu
     */
    private function add_menu_item($menu_id, $label, $url, $page_id = 0)
    {
        $menu_item_data = array(
            'menu-item-title' => $label,
            'menu-item-url' => $url,
            'menu-item-status' => 'publish'
        );

        if ($page_id > 0) {
            $menu_item_data['menu-item-object-id'] = $page_id;
            $menu_item_data['menu-item-object'] = 'page';
            $menu_item_data['menu-item-type'] = 'post_type';
        } else {
            $menu_item_data['menu-item-type'] = 'custom';
        }

        $menu_item_id = wp_update_nav_menu_item($menu_id, 0, $menu_item_data);

        if (is_wp_error($menu_item_id)) {
            throw new Exception('Failed to add menu item: ' . $menu_item_id->get_error_message());
        }

        return $menu_item_id;
    }

    /**
     * Generate menu preview
     */
    private function generate_menu_preview($operation, $menu, $label, $url)
    {
        switch ($operation) {
            case 'add_item':
                $preview = "📋 **Menu Item Addition Preview**\n\n";
                $preview .= "• **Menu:** {$menu->name}\n";
                $preview .= "• **Label:** {$label}\n";
                $preview .= "• **URL:** {$url}\n\n";
                $preview .= "This item will be added to the end of the menu.";
                break;

            case 'remove_item':
                $preview = "🗑️ **Menu Item Removal Preview**\n\n";
                $preview .= "• **Item to Remove:** {$label}\n";
                $preview .= "• **Current URL:** {$url}\n\n";
                $preview .= "This item will be permanently removed from the menu.";
                break;

            default:
                $preview = "Menu operation preview";
        }

        return $preview;
    }

    /**
     * Generate reorder preview
     */
    private function generate_reorder_preview($menu_items, $new_orders)
    {
        $preview = "🔄 **Menu Reorder Preview**\n\n";
        $preview .= "**New menu order:**\n";

        // Create array of items with their new orders
        $reordered_items = array();
        foreach ($menu_items as $item) {
            $new_order = $new_orders[$item->ID] ?? $item->menu_order;
            $reordered_items[] = array(
                'title' => $item->title,
                'order' => $new_order,
                'changed' => isset($new_orders[$item->ID])
            );
        }

        // Sort by new order
        usort($reordered_items, function ($a, $b) {
            return $a['order'] - $b['order'];
        });

        foreach ($reordered_items as $index => $item) {
            $position = $index + 1;
            $indicator = $item['changed'] ? ' 🔄' : '';
            $preview .= "{$position}. {$item['title']}{$indicator}\n";
        }

        $preview .= "\n🔄 = Items that will be moved";

        return $preview;
    }

    /**
     * Get menu structure for display
     */
    public function get_menu_structure($menu_location)
    {
        $menu_id = get_nav_menu_locations()[$menu_location] ?? 0;

        if (!$menu_id) {
            return array();
        }

        $menu_items = wp_get_nav_menu_items($menu_id);
        $structure = array();

        foreach ($menu_items as $item) {
            $structure[] = array(
                'id' => $item->ID,
                'title' => $item->title,
                'url' => $item->url,
                'order' => $item->menu_order,
                'parent' => $item->menu_item_parent,
                'object_id' => $item->object_id,
                'type' => $item->type
            );
        }

        return $structure;
    }

    /**
     * Fix menu order by page names
     * @param array $params {menu_location, page_order, dry_run?}
     * @return array PressPilot response pattern
     */
    public function menu_fix_order($params)
    {
        try {
            $menu_location = sanitize_text_field($params['menu_location']);
            $page_order = $params['page_order'] ?? array(); // array of page slugs in desired order
            $dry_run = (bool) ($params['dry_run'] ?? false);

            if (empty($menu_location) || empty($page_order)) {
                throw new Exception('Menu location and page order are required');
            }

            // Get menu for location
            $menu_id = get_nav_menu_locations()[$menu_location] ?? 0;
            if (!$menu_id) {
                throw new Exception("No menu assigned to location '{$menu_location}'");
            }

            // Get current menu items
            $menu_items = wp_get_nav_menu_items($menu_id);
            $original_orders = array();

            // Build map of page slug/title to menu item ID
            $slug_to_item = array();
            foreach ($menu_items as $item) {
                $original_orders[$item->ID] = $item->menu_order;

                // Try to get page slug
                if ($item->object === 'page' && $item->object_id > 0) {
                    $page = get_post($item->object_id);
                    if ($page) {
                        $slug_to_item[strtolower($page->post_name)] = $item->ID;
                        $slug_to_item[strtolower($item->title)] = $item->ID;
                    }
                } else {
                    // Custom link - use title
                    $slug_to_item[strtolower($item->title)] = $item->ID;
                }
            }

            // Build new order mapping
            $new_order_map = array();
            $position = 1;

            foreach ($page_order as $page_identifier) {
                $page_identifier = strtolower(trim($page_identifier));

                if (isset($slug_to_item[$page_identifier])) {
                    $new_order_map[$slug_to_item[$page_identifier]] = $position;
                    $position++;
                }
            }

            // Add any remaining items that weren't in the specified order
            foreach ($menu_items as $item) {
                if (!isset($new_order_map[$item->ID])) {
                    $new_order_map[$item->ID] = $position;
                    $position++;
                }
            }

            // Generate preview
            $preview = $this->generate_reorder_preview($menu_items, $new_order_map);

            // Execute if not dry run
            if (!$dry_run) {
                $updated_count = 0;

                foreach ($new_order_map as $item_id => $new_order) {
                    wp_update_post(array(
                        'ID' => $item_id,
                        'menu_order' => $new_order
                    ));

                    $updated_count++;
                }

                // Create undo token
                $undo_token = $this->create_undo_token('menu_fix_order', $menu_id, array(
                    'original_orders' => $original_orders,
                    'menu_location' => $menu_location
                ));

                return array(
                    'success' => true,
                    'data' => array(
                        'menu_location' => $menu_location,
                        'items_reordered' => $updated_count,
                        'new_order' => $page_order
                    ),
                    'preview' => "🔄 Fixed menu order in {$menu_location} menu successfully! New order: " . implode(' → ', $page_order),
                    'undo_token' => $undo_token,
                    'next_suggestions' => array(
                        'Preview the reordered menu on the site',
                        'Adjust menu order further',
                        'Add or remove menu items'
                    )
                );
            } else {
                return array(
                    'success' => true,
                    'data' => null,
                    'preview' => $preview,
                    'undo_token' => null,
                    'next_suggestions' => array('Apply new order', 'Try different order', 'Cancel')
                );
            }

        } catch (Exception $e) {
            return array(
                'success' => false,
                'error' => $e->getMessage(),
                'suggestions' => array(
                    'Check the menu location exists',
                    'Verify page names/slugs are correct',
                    'List current menu items first'
                )
            );
        }
    }

    /**
     * Create undo token for reversible actions
     */
    private function create_undo_token($action, $item_id, $data)
    {
        $token = 'pp_undo_' . uniqid() . '_' . time();

        $undo_data = array(
            'action' => $action,
            'item_id' => $item_id,
            'data' => $data,
            'created_at' => current_time('mysql'),
            'user_id' => get_current_user_id()
        );

        set_transient('presspilot_undo_' . $token, $undo_data, 7 * DAY_IN_SECONDS);

        return $token;
    }
}
