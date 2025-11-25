-- SQL queries to verify PressPilot activation bootstrap on DigitalOcean WordPress
-- Run these queries in your WordPress database (phpMyAdmin, MySQL client, etc.)

-- 1. Check activation flag
SELECT 
    option_name,
    option_value,
    autoload
FROM wp_options
WHERE option_name = 'presspilot_activation_v1_done';
-- Expected: option_value = '1'

-- 2. Check pages created
SELECT 
    ID,
    post_title,
    post_name,
    post_status,
    post_type,
    post_date
FROM wp_posts
WHERE post_type = 'page'
AND post_status = 'publish'
AND post_name IN ('home', 'menu', 'about', 'services', 'blog', 'contact')
ORDER BY post_name;
-- Expected: 6 rows for restaurant, 6 for e-commerce, 5 for others

-- 3. Check menu term created
SELECT 
    t.term_id,
    t.name,
    t.slug,
    tt.taxonomy
FROM wp_terms t
JOIN wp_term_taxonomy tt ON t.term_id = tt.term_id
WHERE t.name = 'Main Menu'
AND tt.taxonomy = 'nav_menu';
-- Expected: 1 row

-- 4. Check menu items (pages in menu)
SELECT 
    p.ID as page_id,
    p.post_title,
    p.post_name,
    pmi.meta_value as menu_order,
    t.name as menu_name
FROM wp_posts p
JOIN wp_term_relationships tr ON p.ID = tr.object_id
JOIN wp_term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
JOIN wp_terms t ON tt.term_id = t.term_id
LEFT JOIN wp_postmeta pmi ON p.ID = pmi.post_id AND pmi.meta_key = '_menu_item_menu_item_parent'
WHERE t.name = 'Main Menu'
AND p.post_type = 'page'
AND p.post_status = 'publish'
ORDER BY CAST(pmi.meta_value AS UNSIGNED);
-- Expected: Multiple rows showing pages in menu order

-- 5. Check menu location assignment
SELECT 
    option_name,
    option_value
FROM wp_options
WHERE option_name = 'theme_mods_presspilot-golden-foundation';
-- Expected: option_value contains serialized array with 'nav_menu_locations' => array('primary' => menu_term_id)

-- 6. Check front page settings
SELECT 
    option_name,
    option_value
FROM wp_options
WHERE option_name IN ('show_on_front', 'page_on_front');
-- Expected: 
-- show_on_front = 'page'
-- page_on_front = ID of Home page

-- 7. Count total published pages
SELECT COUNT(*) as total_pages
FROM wp_posts
WHERE post_type = 'page'
AND post_status = 'publish';
-- Expected: At least 5-6 pages depending on category

-- 8. Verify wp_insert_post was called (check post dates)
SELECT 
    post_title,
    post_name,
    post_date,
    post_modified
FROM wp_posts
WHERE post_type = 'page'
AND post_status = 'publish'
AND post_name IN ('home', 'menu', 'about', 'services', 'blog', 'contact')
ORDER BY post_date DESC;
-- Expected: Recent post_date if pages were just created


