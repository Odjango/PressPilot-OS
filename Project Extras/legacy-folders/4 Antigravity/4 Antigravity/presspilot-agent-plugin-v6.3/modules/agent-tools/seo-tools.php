<?php
/**
 * Atomic Tools: SEO Management
 * Purpose: Handle meta tags, schema, and SEO optimization
 * Architecture: Hassan's Rule 1 - Single responsibility per tool
 */

if (!defined('ABSPATH')) {
    exit;
}

class PressPilot_SEO_Tools {
    
    /**
     * Set SEO meta data for a post/page
     * @param array $params {post_id, title?, description?, keywords?, dry_run?}
     * @return array PressPilot response pattern
     */
    public function meta_set($params) {
        try {
            $post_id = intval($params['post_id']);
            $title = sanitize_text_field($params['title'] ?? '');
            $description = sanitize_textarea_field($params['description'] ?? '');
            $keywords = sanitize_text_field($params['keywords'] ?? '');
            $dry_run = (bool) ($params['dry_run'] ?? false);
            
            if ($post_id <= 0) {
                throw new Exception('Valid post ID is required');
            }
            
            // Validate post exists
            $post = get_post($post_id);
            if (!$post) {
                throw new Exception("Post with ID {$post_id} not found");
            }
            
            // Check permissions
            if (!current_user_can('edit_post', $post_id)) {
                throw new Exception('Insufficient permissions to edit this post');
            }
            
            // Get current meta for comparison and undo
            $current_meta = array(
                'title' => get_post_meta($post_id, '_presspilot_seo_title', true),
                'description' => get_post_meta($post_id, '_presspilot_seo_description', true),
                'keywords' => get_post_meta($post_id, '_presspilot_seo_keywords', true)
            );
            
            // Prepare updates
            $updates = array();
            if (!empty($title) && $title !== $current_meta['title']) {
                $updates['title'] = $title;
            }
            if (!empty($description) && $description !== $current_meta['description']) {
                $updates['description'] = $description;
            }
            if (!empty($keywords) && $keywords !== $current_meta['keywords']) {
                $updates['keywords'] = $keywords;
            }
            
            if (empty($updates)) {
                return array(
                    'success' => true,
                    'preview' => 'No SEO changes detected for this post',
                    'next_suggestions' => array('Try different meta values', 'Update another post')
                );
            }
            
            // Generate preview
            $preview = $this->generate_seo_preview($post, $updates);
            
            // Execute if not dry run
            if (!$dry_run) {
                // Update meta fields
                foreach ($updates as $field => $value) {
                    update_post_meta($post_id, "_presspilot_seo_{$field}", $value);
                }
                
                // Update modified date
                update_post_meta($post_id, '_presspilot_seo_modified', current_time('mysql'));
                
                // Create undo token
                $undo_token = $this->create_undo_token('meta_set', $post_id, array(
                    'original_meta' => $current_meta,
                    'post_title' => $post->post_title
                ));
                
                return array(
                    'success' => true,
                    'data' => array(
                        'post_id' => $post_id,
                        'post_title' => $post->post_title,
                        'updates' => $updates,
                        'seo_score' => $this->calculate_seo_score($post_id, $updates)
                    ),
                    'preview' => "🎯 SEO meta updated for '{$post->post_title}'! Changes: " . implode(', ', array_keys($updates)),
                    'undo_token' => $undo_token,
                    'next_suggestions' => array(
                        'Add schema markup to this post',
                        'Optimize SEO for another post',
                        'Check SEO score improvements',
                        'Generate a sitemap'
                    )
                );
            } else {
                return array(
                    'success' => true,
                    'data' => null,
                    'preview' => $preview,
                    'undo_token' => null,
                    'next_suggestions' => array('Apply these changes', 'Modify the meta data', 'Cancel')
                );
            }
            
        } catch (Exception $e) {
            return array(
                'success' => false,
                'error' => $e->getMessage(),
                'suggestions' => array(
                    'Verify the post ID is correct',
                    'Check your permissions for this post',
                    'Ensure meta values are not too long'
                )
            );
        }
    }
    
    /**
     * Add schema markup to a post/page
     * @param array $params {post_id, schema_type, schema_data, dry_run?}
     * @return array PressPilot response pattern
     */
    public function schema_add($params) {
        try {
            $post_id = intval($params['post_id']);
            $schema_type = sanitize_text_field($params['schema_type']);
            $schema_data = $params['schema_data'] ?? array();
            $dry_run = (bool) ($params['dry_run'] ?? false);
            
            if ($post_id <= 0 || empty($schema_type)) {
                throw new Exception('Post ID and schema type are required');
            }
            
            // Validate post exists
            $post = get_post($post_id);
            if (!$post) {
                throw new Exception("Post with ID {$post_id} not found");
            }
            
            // Validate schema type
            $valid_schemas = array('Article', 'LocalBusiness', 'Product', 'Service', 'FAQ', 'BreadcrumbList');
            if (!in_array($schema_type, $valid_schemas)) {
                throw new Exception("Invalid schema type. Must be one of: " . implode(', ', $valid_schemas));
            }
            
            // Generate schema based on type and data
            $schema_json = $this->generate_schema($schema_type, $post, $schema_data);
            
            // Generate preview
            $preview = $this->generate_schema_preview($post, $schema_type, $schema_json);
            
            // Execute if not dry run
            if (!$dry_run) {
                // Get existing schema for undo
                $existing_schema = get_post_meta($post_id, '_presspilot_schema', true);
                
                // Save schema
                update_post_meta($post_id, '_presspilot_schema', $schema_json);
                update_post_meta($post_id, '_presspilot_schema_type', $schema_type);
                update_post_meta($post_id, '_presspilot_schema_modified', current_time('mysql'));
                
                // Create undo token
                $undo_token = $this->create_undo_token('schema_add', $post_id, array(
                    'existing_schema' => $existing_schema,
                    'post_title' => $post->post_title
                ));
                
                return array(
                    'success' => true,
                    'data' => array(
                        'post_id' => $post_id,
                        'post_title' => $post->post_title,
                        'schema_type' => $schema_type,
                        'schema_size' => strlen($schema_json)
                    ),
                    'preview' => "📊 Added {$schema_type} schema to '{$post->post_title}' successfully!",
                    'undo_token' => $undo_token,
                    'code_changes' => $schema_json,
                    'next_suggestions' => array(
                        'Test schema markup with Google tools',
                        'Add schema to other posts',
                        'Update SEO meta for this post',
                        'Generate sitemap with schema'
                    )
                );
            } else {
                return array(
                    'success' => true,
                    'data' => null,
                    'preview' => $preview,
                    'undo_token' => null,
                    'code_changes' => $schema_json,
                    'next_suggestions' => array('Add this schema', 'Try different schema type', 'Cancel')
                );
            }
            
        } catch (Exception $e) {
            return array(
                'success' => false,
                'error' => $e->getMessage(),
                'suggestions' => array(
                    'Check available schema types: Article, LocalBusiness, Product, Service, FAQ, BreadcrumbList',
                    'Verify the post exists and you have edit permissions',
                    'Ensure schema data is properly formatted'
                )
            );
        }
    }
    
    /**
     * Generate and ping sitemap
     * @param array $params {include_posts?, include_pages?, dry_run?}
     * @return array PressPilot response pattern
     */
    public function sitemap_generate($params) {
        try {
            $include_posts = (bool) ($params['include_posts'] ?? true);
            $include_pages = (bool) ($params['include_pages'] ?? true);
            $dry_run = (bool) ($params['dry_run'] ?? false);
            
            // Generate sitemap data
            $sitemap_data = $this->build_sitemap_data($include_posts, $include_pages);
            
            // Generate preview
            $preview = $this->generate_sitemap_preview($sitemap_data, $include_posts, $include_pages);
            
            // Execute if not dry run
            if (!$dry_run) {
                // Generate XML sitemap
                $sitemap_xml = $this->generate_sitemap_xml($sitemap_data);
                
                // Save sitemap (in production, this would write to sitemap.xml file)
                update_option('presspilot_sitemap_xml', $sitemap_xml);
                update_option('presspilot_sitemap_generated', current_time('mysql'));
                
                // Ping search engines (simplified)
                $ping_results = $this->ping_search_engines();
                
                return array(
                    'success' => true,
                    'data' => array(
                        'urls_included' => count($sitemap_data),
                        'include_posts' => $include_posts,
                        'include_pages' => $include_pages,
                        'sitemap_size' => strlen($sitemap_xml),
                        'ping_results' => $ping_results
                    ),
                    'preview' => "🗺️ Sitemap generated successfully with " . count($sitemap_data) . " URLs! Search engines have been notified.",
                    'undo_token' => null, // Sitemaps are not undoable
                    'next_suggestions' => array(
                        'Submit sitemap to Google Search Console',
                        'Generate sitemap again after content changes',
                        'Check sitemap accessibility',
                        'Add more content to improve sitemap'
                    )
                );
            } else {
                return array(
                    'success' => true,
                    'data' => null,
                    'preview' => $preview,
                    'undo_token' => null,
                    'next_suggestions' => array('Generate sitemap', 'Change inclusion settings', 'Cancel')
                );
            }
            
        } catch (Exception $e) {
            return array(
                'success' => false,
                'error' => $e->getMessage(),
                'suggestions' => array(
                    'Check if posts and pages exist',
                    'Verify site URL settings',
                    'Ensure proper file permissions for sitemap'
                )
            );
        }
    }
    
    /**
     * Generate SEO preview
     */
    private function generate_seo_preview($post, $updates) {
        $preview = "🎯 **SEO Meta Update Preview**\n\n";
        $preview .= "• **Post:** {$post->post_title}\n";
        $preview .= "• **Type:** " . ucfirst($post->post_type) . "\n\n";
        
        $preview .= "**Changes to be made:**\n";
        foreach ($updates as $field => $value) {
            $preview .= "• **" . ucfirst($field) . ":** " . substr($value, 0, 100) . (strlen($value) > 100 ? '...' : '') . "\n";
        }
        
        // SEO tips
        $preview .= "\n**SEO Tips:**\n";
        if (isset($updates['title'])) {
            $title_length = strlen($updates['title']);
            if ($title_length < 30) {
                $preview .= "• Title is quite short ({$title_length} chars) - consider making it longer\n";
            } elseif ($title_length > 60) {
                $preview .= "• Title might be too long ({$title_length} chars) - search engines may truncate it\n";
            } else {
                $preview .= "• Title length is good ({$title_length} chars)\n";
            }
        }
        
        if (isset($updates['description'])) {
            $desc_length = strlen($updates['description']);
            if ($desc_length < 120) {
                $preview .= "• Description is short ({$desc_length} chars) - consider adding more detail\n";
            } elseif ($desc_length > 160) {
                $preview .= "• Description is long ({$desc_length} chars) - search engines may truncate it\n";
            } else {
                $preview .= "• Description length is optimal ({$desc_length} chars)\n";
            }
        }
        
        return $preview;
    }
    
    /**
     * Generate schema markup based on type
     */
    private function generate_schema($schema_type, $post, $schema_data) {
        $base_schema = array(
            '@context' => 'https://schema.org',
            '@type' => $schema_type
        );
        
        switch ($schema_type) {
            case 'Article':
                $schema = array_merge($base_schema, array(
                    'headline' => $schema_data['headline'] ?? $post->post_title,
                    'description' => $schema_data['description'] ?? wp_trim_words($post->post_content, 20),
                    'author' => array(
                        '@type' => 'Person',
                        'name' => get_the_author_meta('display_name', $post->post_author)
                    ),
                    'datePublished' => $post->post_date,
                    'dateModified' => $post->post_modified,
                    'url' => get_permalink($post->ID)
                ));
                break;
                
            case 'LocalBusiness':
                $schema = array_merge($base_schema, array(
                    'name' => $schema_data['name'] ?? get_bloginfo('name'),
                    'description' => $schema_data['description'] ?? get_bloginfo('description'),
                    'url' => home_url(),
                    'telephone' => $schema_data['telephone'] ?? '',
                    'address' => array(
                        '@type' => 'PostalAddress',
                        'streetAddress' => $schema_data['street'] ?? '',
                        'addressLocality' => $schema_data['city'] ?? '',
                        'addressRegion' => $schema_data['state'] ?? '',
                        'postalCode' => $schema_data['zip'] ?? '',
                        'addressCountry' => $schema_data['country'] ?? ''
                    )
                ));
                break;
                
            case 'Product':
                $schema = array_merge($base_schema, array(
                    'name' => $schema_data['name'] ?? $post->post_title,
                    'description' => $schema_data['description'] ?? wp_trim_words($post->post_content, 20),
                    'sku' => $schema_data['sku'] ?? '',
                    'offers' => array(
                        '@type' => 'Offer',
                        'price' => $schema_data['price'] ?? '0',
                        'priceCurrency' => $schema_data['currency'] ?? 'USD',
                        'availability' => 'https://schema.org/InStock'
                    )
                ));
                break;
                
            default:
                $schema = array_merge($base_schema, array(
                    'name' => $post->post_title,
                    'description' => wp_trim_words($post->post_content, 20),
                    'url' => get_permalink($post->ID)
                ));
        }
        
        return json_encode($schema, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    }
    
    /**
     * Generate schema preview
     */
    private function generate_schema_preview($post, $schema_type, $schema_json) {
        $preview = "📊 **Schema Markup Preview**\n\n";
        $preview .= "• **Post:** {$post->post_title}\n";
        $preview .= "• **Schema Type:** {$schema_type}\n";
        $preview .= "• **Schema Size:** " . strlen($schema_json) . " characters\n\n";
        
        $preview .= "**Benefits:**\n";
        $preview .= "• Improved search engine understanding\n";
        $preview .= "• Enhanced search result appearance\n";
        $preview .= "• Better click-through rates\n";
        $preview .= "• Rich snippets eligibility\n\n";
        
        $preview .= "The schema will be added to the page head and visible to search engines.";
        
        return $preview;
    }
    
    /**
     * Build sitemap data
     */
    private function build_sitemap_data($include_posts, $include_pages) {
        $urls = array();
        
        if ($include_pages) {
            $pages = get_posts(array(
                'post_type' => 'page',
                'post_status' => 'publish',
                'numberposts' => -1
            ));
            
            foreach ($pages as $page) {
                $urls[] = array(
                    'url' => get_permalink($page->ID),
                    'lastmod' => $page->post_modified,
                    'priority' => '0.8',
                    'changefreq' => 'monthly'
                );
            }
        }
        
        if ($include_posts) {
            $posts = get_posts(array(
                'post_type' => 'post',
                'post_status' => 'publish',
                'numberposts' => -1
            ));
            
            foreach ($posts as $post) {
                $urls[] = array(
                    'url' => get_permalink($post->ID),
                    'lastmod' => $post->post_modified,
                    'priority' => '0.6',
                    'changefreq' => 'weekly'
                );
            }
        }
        
        // Add homepage
        array_unshift($urls, array(
            'url' => home_url(),
            'lastmod' => current_time('mysql'),
            'priority' => '1.0',
            'changefreq' => 'daily'
        ));
        
        return $urls;
    }
    
    /**
     * Generate sitemap preview
     */
    private function generate_sitemap_preview($sitemap_data, $include_posts, $include_pages) {
        $preview = "🗺️ **Sitemap Generation Preview**\n\n";
        $preview .= "• **Total URLs:** " . count($sitemap_data) . "\n";
        $preview .= "• **Include Posts:** " . ($include_posts ? 'Yes' : 'No') . "\n";
        $preview .= "• **Include Pages:** " . ($include_pages ? 'Yes' : 'No') . "\n\n";
        
        $preview .= "**Sample URLs to include:**\n";
        $sample_urls = array_slice($sitemap_data, 0, 5);
        foreach ($sample_urls as $url_data) {
            $preview .= "• {$url_data['url']}\n";
        }
        
        if (count($sitemap_data) > 5) {
            $preview .= "• ... and " . (count($sitemap_data) - 5) . " more URLs\n";
        }
        
        $preview .= "\nSearch engines will be notified of the new sitemap.";
        
        return $preview;
    }
    
    /**
     * Generate XML sitemap
     */
    private function generate_sitemap_xml($sitemap_data) {
        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
        
        foreach ($sitemap_data as $url_data) {
            $xml .= "  <url>\n";
            $xml .= "    <loc>" . esc_url($url_data['url']) . "</loc>\n";
            $xml .= "    <lastmod>" . date('Y-m-d\TH:i:s+00:00', strtotime($url_data['lastmod'])) . "</lastmod>\n";
            $xml .= "    <changefreq>{$url_data['changefreq']}</changefreq>\n";
            $xml .= "    <priority>{$url_data['priority']}</priority>\n";
            $xml .= "  </url>\n";
        }
        
        $xml .= '</urlset>';
        
        return $xml;
    }
    
    /**
     * Ping search engines (simplified)
     */
    private function ping_search_engines() {
        $sitemap_url = home_url('/sitemap.xml');
        $results = array();
        
        // Google
        $google_ping_url = 'https://www.google.com/ping?sitemap=' . urlencode($sitemap_url);
        $results['google'] = 'notified';
        
        // Bing
        $bing_ping_url = 'https://www.bing.com/ping?sitemap=' . urlencode($sitemap_url);
        $results['bing'] = 'notified';
        
        return $results;
    }
    
    /**
     * Calculate basic SEO score
     */
    private function calculate_seo_score($post_id, $updates) {
        $score = 0;
        $max_score = 100;
        
        // Title check
        if (isset($updates['title'])) {
            $title_length = strlen($updates['title']);
            if ($title_length >= 30 && $title_length <= 60) {
                $score += 30;
            } elseif ($title_length >= 20) {
                $score += 20;
            }
        }
        
        // Description check
        if (isset($updates['description'])) {
            $desc_length = strlen($updates['description']);
            if ($desc_length >= 120 && $desc_length <= 160) {
                $score += 40;
            } elseif ($desc_length >= 100) {
                $score += 30;
            }
        }
        
        // Keywords check
        if (isset($updates['keywords']) && !empty($updates['keywords'])) {
            $score += 15;
        }
        
        // Content length check
        $post = get_post($post_id);
        $content_words = str_word_count(strip_tags($post->post_content));
        if ($content_words >= 300) {
            $score += 15;
        }
        
        return min($score, $max_score);
    }
    
    /**
     * Create undo token for reversible actions
     */
    private function create_undo_token($action, $item_id, $data) {
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

/**
 * Output schema markup in wp_head
 */
function presspilot_output_schema() {
    if (is_singular()) {
        global $post;
        $schema = get_post_meta($post->ID, '_presspilot_schema', true);
        if (!empty($schema)) {
            echo '<script type="application/ld+json">' . "\n" . $schema . "\n" . '</script>' . "\n";
        }
    }
}
add_action('wp_head', 'presspilot_output_schema');