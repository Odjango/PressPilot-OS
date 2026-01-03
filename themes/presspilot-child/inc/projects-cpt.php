<?php
/**
 * Register Projects Custom Post Type and Taxonomy
 *
 * @package PressPilot_Child
 */

function presspilot_register_projects_cpt()
{
    $labels = array(
        'name' => _x('Projects', 'Post Type General Name', 'presspilot-child'),
        'singular_name' => _x('Project', 'Post Type Singular Name', 'presspilot-child'),
        'menu_name' => __('Projects', 'presspilot-child'),
        'name_admin_bar' => __('Project', 'presspilot-child'),
        'archives' => __('Project Archives', 'presspilot-child'),
        'attributes' => __('Project Attributes', 'presspilot-child'),
        'parent_item_colon' => __('Parent Project:', 'presspilot-child'),
        'all_items' => __('All Projects', 'presspilot-child'),
        'add_new_item' => __('Add New Project', 'presspilot-child'),
        'add_new' => __('Add New', 'presspilot-child'),
        'new_item' => __('New Project', 'presspilot-child'),
        'edit_item' => __('Edit Project', 'presspilot-child'),
        'update_item' => __('Update Project', 'presspilot-child'),
        'view_item' => __('View Project', 'presspilot-child'),
        'view_items' => __('View Projects', 'presspilot-child'),
        'search_items' => __('Search Project', 'presspilot-child'),
        'not_found' => __('Not found', 'presspilot-child'),
        'not_found_in_trash' => __('Not found in Trash', 'presspilot-child'),
        'featured_image' => __('Featured Image', 'presspilot-child'),
        'set_featured_image' => __('Set featured image', 'presspilot-child'),
        'remove_featured_image' => __('Remove featured image', 'presspilot-child'),
        'use_featured_image' => __('Use as featured image', 'presspilot-child'),
        'insert_into_item' => __('Insert into project', 'presspilot-child'),
        'uploaded_to_this_item' => __('Uploaded to this project', 'presspilot-child'),
        'items_list' => __('Projects list', 'presspilot-child'),
        'items_list_navigation' => __('Projects list navigation', 'presspilot-child'),
        'filter_items_list' => __('Filter projects list', 'presspilot-child'),
    );
    $args = array(
        'label' => __('Project', 'presspilot-child'),
        'description' => __('Portfolio Projects', 'presspilot-child'),
        'labels' => $labels,
        'supports' => array('title', 'editor', 'thumbnail', 'excerpt'),
        'taxonomies' => array('project_category'),
        'hierarchical' => false,
        'public' => true,
        'show_ui' => true,
        'show_in_menu' => true,
        'menu_position' => 5,
        'menu_icon' => 'dashicons-portfolio',
        'show_in_admin_bar' => true,
        'show_in_nav_menus' => true,
        'can_export' => true,
        'has_archive' => true,
        'exclude_from_search' => false,
        'publicly_queryable' => true,
        'capability_type' => 'post',
        'show_in_rest' => true, // Important for Block Editor
    );
    register_post_type('project', $args);
}
add_action('init', 'presspilot_register_projects_cpt', 0);

// Register Custom Taxonomy
function presspilot_register_project_taxonomy()
{

    $labels = array(
        'name' => _x('Project Categories', 'Taxonomy General Name', 'presspilot-child'),
        'singular_name' => _x('Project Category', 'Taxonomy Singular Name', 'presspilot-child'),
        'menu_name' => __('Categories', 'presspilot-child'),
        'all_items' => __('All Categories', 'presspilot-child'),
        'parent_item' => __('Parent Category', 'presspilot-child'),
        'parent_item_colon' => __('Parent Category:', 'presspilot-child'),
        'new_item_name' => __('New Category Name', 'presspilot-child'),
        'add_new_item' => __('Add New Category', 'presspilot-child'),
        'edit_item' => __('Edit Category', 'presspilot-child'),
        'update_item' => __('Update Category', 'presspilot-child'),
        'view_item' => __('View Category', 'presspilot-child'),
        'separate_items_with_commas' => __('Separate categories with commas', 'presspilot-child'),
        'add_or_remove_items' => __('Add or remove categories', 'presspilot-child'),
        'choose_from_most_used' => __('Choose from the most used', 'presspilot-child'),
        'popular_items' => __('Popular Categories', 'presspilot-child'),
        'search_items' => __('Search Categories', 'presspilot-child'),
        'not_found' => __('Not Found', 'presspilot-child'),
        'no_terms' => __('No categories', 'presspilot-child'),
        'items_list' => __('Categories list', 'presspilot-child'),
        'items_list_navigation' => __('Categories list navigation', 'presspilot-child'),
    );
    $args = array(
        'labels' => $labels,
        'hierarchical' => true,
        'public' => true,
        'show_ui' => true,
        'show_admin_column' => true,
        'show_in_nav_menus' => true,
        'show_tagcloud' => true,
        'show_in_rest' => true,
    );
    register_taxonomy('project_category', array('project'), $args);

}
add_action('init', 'presspilot_register_project_taxonomy', 0);
