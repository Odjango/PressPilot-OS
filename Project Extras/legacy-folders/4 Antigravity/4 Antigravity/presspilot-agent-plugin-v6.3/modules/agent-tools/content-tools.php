<?php
/**
 * Atomic Tools: Content Management
 * Purpose: Handle page, post, and media operations
 * Architecture: Hassan's Rule 1 - Single responsibility per tool
 */

if (!defined('ABSPATH')) {
    exit;
}

class PressPilot_Content_Tools
{

    /**
     * Create a new WordPress page
     * @param array $params {title, slug?, content?, template?, dry_run?}
     * @return array PressPilot response pattern
     */
    public function page_create($params)
    {
        try {
            // Sanitize and validate inputs
            $title = sanitize_text_field($params['title']);
            $slug = sanitize_title($params['slug'] ?? $title);
            $content = wp_kses_post($params['content'] ?? '');
            $template = sanitize_text_field($params['template'] ?? '');
            $dry_run = (bool) ($params['dry_run'] ?? false);

            if (empty($title)) {
                throw new Exception('Page title is required');
            }

            // Check for duplicate slug
            $existing_page = get_page_by_path($slug);
            if ($existing_page) {
                $slug = $slug . '-' . uniqid();
            }

            // Prepare page data
            $page_data = array(
                'post_title' => $title,
                'post_name' => $slug,
                'post_content' => $content,
                'post_status' => $dry_run ? 'draft' : 'publish',
                'post_type' => 'page',
                'post_author' => get_current_user_id(),
                'meta_input' => array(
                    '_presspilot_generated' => true,
                    '_presspilot_agent_created' => current_time('mysql')
                )
            );

            if (!empty($template)) {
                $page_data['page_template'] = $template;
            }

            // Generate preview
            $preview = $this->generate_page_preview('create', $page_data);

            // Execute if not dry run
            if (!$dry_run) {
                // Use PressPilot Site Assembler to ensure patterns are applied
                // Hassan's Rule 2: Patterns - Always use the assembler
                if (class_exists('PressPilot_Site_Assembler')) {
                    $assembler = new PressPilot_Site_Assembler();

                    // Create content structure expected by assembler
                    $content_data = array(
                        'home' => $content, // Map content to home/generic slot
                        'about' => $content,
                        'services' => $content,
                        'contact' => $content,
                        'blog' => $content,
                        'shop' => $content,
                        'cart' => $content
                    );

                    // Use defaults for required assembler params
                    $colors = array('primary' => '#0073aa', 'secondary' => '#333333');

                    // Call assembler to create the page with patterns
                    $result = $assembler->create_page(
                        $title,
                        $content_data,
                        $colors,
                        false, // Not front page by default
                        'corporate', // Default business type
                        '' // No tagline by default
                    );

                    $page_id = $result['id'];
                } else {
                    // Fallback if assembler is missing (should not happen in full plugin)
                    $page_id = wp_insert_post($page_data);

                    if (is_wp_error($page_id)) {
                        throw new Exception($page_id->get_error_message());
                    }
                }

                // Generate undo token
                $undo_token = $this->create_undo_token('page_create', $page_id, $page_data);

                // Get the created page URL
                $page_url = get_permalink($page_id);

                return array(
                    'success' => true,
                    'data' => array(
                        'page_id' => $page_id,
                        'title' => $title,
                        'slug' => $slug,
                        'url' => $page_url,
                        'status' => 'published'
                    ),
                    'preview' => "✅ Created page '{$title}' successfully! You can view it at: {$page_url}",
                    'undo_token' => $undo_token,
                    'next_suggestions' => array(
                        'Add this page to the navigation menu',
                        'Set a featured image for this page',
                        'Add more content to this page',
                        'Create another page'
                    )
                );
            } else {
                return array(
                    'success' => true,
                    'data' => null,
                    'preview' => $preview,
                    'undo_token' => null,
                    'next_suggestions' => array('Apply these changes', 'Modify the content', 'Cancel')
                );
            }

        } catch (Exception $e) {
            return array(
                'success' => false,
                'error' => $e->getMessage(),
                'suggestions' => array(
                    'Try with a different page title',
                    'Check if you have permission to create pages',
                    'Ensure the content is properly formatted'
                )
            );
        }
    }

    /**
     * Update an existing WordPress page
     * @param array $params {page_id, title?, content?, dry_run?}
     * @return array PressPilot response pattern
     */
    public function page_update($params)
    {
        try {
            $page_id = intval($params['page_id']);
            $title = sanitize_text_field($params['title'] ?? '');
            $content = wp_kses_post($params['content'] ?? '');
            $dry_run = (bool) ($params['dry_run'] ?? false);

            // Validate page exists
            $page = get_post($page_id);
            if (!$page || $page->post_type !== 'page') {
                throw new Exception('Page not found');
            }

            // Check permissions
            if (!current_user_can('edit_page', $page_id)) {
                throw new Exception('Insufficient permissions to edit this page');
            }

            // Prepare update data
            $update_data = array('ID' => $page_id);
            $changes = array();

            if (!empty($title) && $title !== $page->post_title) {
                $update_data['post_title'] = $title;
                $changes[] = "title: '{$page->post_title}' → '{$title}'";
            }

            if (!empty($content) && $content !== $page->post_content) {
                $update_data['post_content'] = $content;
                $changes[] = 'content updated';
            }

            if (empty($changes)) {
                return array(
                    'success' => true,
                    'preview' => 'No changes detected for this page',
                    'next_suggestions' => array('Try updating different fields', 'Update another page')
                );
            }

            // Generate preview
            $preview = $this->generate_page_preview('update', $update_data, $changes);

            // Execute if not dry run
            if (!$dry_run) {
                // Store original data for undo
                $original_data = array(
                    'post_title' => $page->post_title,
                    'post_content' => $page->post_content
                );

                $result = wp_update_post($update_data);

                if (is_wp_error($result)) {
                    throw new Exception($result->get_error_message());
                }

                // Generate undo token
                $undo_token = $this->create_undo_token('page_update', $page_id, $original_data);

                return array(
                    'success' => true,
                    'data' => array(
                        'page_id' => $page_id,
                        'changes' => $changes,
                        'url' => get_permalink($page_id)
                    ),
                    'preview' => "✅ Updated page '{$page->post_title}' successfully! Changes: " . implode(', ', $changes),
                    'undo_token' => $undo_token,
                    'next_suggestions' => array(
                        'View the updated page',
                        'Make additional changes',
                        'Update another page'
                    )
                );
            } else {
                return array(
                    'success' => true,
                    'data' => null,
                    'preview' => $preview,
                    'undo_token' => null,
                    'next_suggestions' => array('Apply these changes', 'Modify the updates', 'Cancel')
                );
            }

        } catch (Exception $e) {
            return array(
                'success' => false,
                'error' => $e->getMessage(),
                'suggestions' => array(
                    'Verify the page ID is correct',
                    'Check your permissions',
                    'Try updating different fields'
                )
            );
        }
    }

    /**
     * Generate a new blog post using AI assistance
     * @param array $params {topic, tone?, length?, dry_run?}
     * @return array PressPilot response pattern
     */
    public function post_generate($params)
    {
        try {
            $topic = sanitize_text_field($params['topic']);
            $tone = sanitize_text_field($params['tone'] ?? 'professional');
            $length = sanitize_text_field($params['length'] ?? 'medium');
            $dry_run = (bool) ($params['dry_run'] ?? false);

            if (empty($topic)) {
                throw new Exception('Post topic is required');
            }

            // Generate post content using existing content generator
            if (class_exists('PressPilot_Content_Generator')) {
                $content_generator = new PressPilot_Content_Generator();

                // Use the existing AI content generation
                $generated_content = $content_generator->generate_post_content($topic, $tone, $length);

                $post_data = array(
                    'post_title' => $generated_content['title'] ?? $topic,
                    'post_content' => $generated_content['content'] ?? '',
                    'post_excerpt' => $generated_content['excerpt'] ?? '',
                    'post_status' => $dry_run ? 'draft' : 'publish',
                    'post_type' => 'post',
                    'post_author' => get_current_user_id(),
                    'meta_input' => array(
                        '_presspilot_generated' => true,
                        '_presspilot_agent_created' => current_time('mysql'),
                        '_presspilot_topic' => $topic,
                        '_presspilot_tone' => $tone
                    )
                );

                // Generate preview
                $preview = $this->generate_post_preview($post_data, $topic, $tone);

                // Execute if not dry run
                if (!$dry_run) {
                    $post_id = wp_insert_post($post_data);

                    if (is_wp_error($post_id)) {
                        throw new Exception($post_id->get_error_message());
                    }

                    // Generate undo token
                    $undo_token = $this->create_undo_token('post_create', $post_id, $post_data);

                    return array(
                        'success' => true,
                        'data' => array(
                            'post_id' => $post_id,
                            'title' => $post_data['post_title'],
                            'url' => get_permalink($post_id),
                            'word_count' => str_word_count(strip_tags($post_data['post_content']))
                        ),
                        'preview' => "✅ Generated and published blog post '{$post_data['post_title']}'! Topic: {$topic}, Tone: {$tone}",
                        'undo_token' => $undo_token,
                        'next_suggestions' => array(
                            'Add tags to this post',
                            'Set a featured image',
                            'Share on social media',
                            'Generate another post'
                        )
                    );
                } else {
                    return array(
                        'success' => true,
                        'data' => array('preview_content' => $generated_content),
                        'preview' => $preview,
                        'undo_token' => null,
                        'next_suggestions' => array('Publish this post', 'Edit the content', 'Try different tone')
                    );
                }
            } else {
                throw new Exception('Content generator not available');
            }

        } catch (Exception $e) {
            return array(
                'success' => false,
                'error' => $e->getMessage(),
                'suggestions' => array(
                    'Try a different topic',
                    'Check if AI content generation is enabled',
                    'Create the post manually'
                )
            );
        }
    }

    /**
     * Generate preview for page operations
     */
    private function generate_page_preview($operation, $data, $changes = array())
    {
        switch ($operation) {
            case 'create':
                $preview = "📄 **Page Creation Preview**\n\n";
                $preview .= "• **Title:** {$data['post_title']}\n";
                $preview .= "• **URL:** /" . $data['post_name'] . "\n";
                $preview .= "• **Status:** " . ucfirst($data['post_status']) . "\n";
                if (!empty($data['post_content'])) {
                    $word_count = str_word_count(strip_tags($data['post_content']));
                    $preview .= "• **Content:** {$word_count} words\n";
                }
                $preview .= "\nThis page will be created and " . ($data['post_status'] === 'draft' ? 'saved as draft' : 'published immediately') . ".";
                break;

            case 'update':
                $preview = "✏️ **Page Update Preview**\n\n";
                $preview .= "**Changes to be made:**\n";
                foreach ($changes as $change) {
                    $preview .= "• " . ucfirst($change) . "\n";
                }
                $preview .= "\nThese changes will be applied immediately.";
                break;

            default:
                $preview = "Page operation preview";
        }

        return $preview;
    }

    /**
     * Generate preview for post operations
     */
    private function generate_post_preview($post_data, $topic, $tone)
    {
        $word_count = str_word_count(strip_tags($post_data['post_content']));

        $preview = "📝 **Blog Post Preview**\n\n";
        $preview .= "• **Title:** {$post_data['post_title']}\n";
        $preview .= "• **Topic:** {$topic}\n";
        $preview .= "• **Tone:** {$tone}\n";
        $preview .= "• **Length:** {$word_count} words\n";
        $preview .= "• **Status:** " . ucfirst($post_data['post_status']) . "\n\n";

        if (!empty($post_data['post_excerpt'])) {
            $preview .= "**Excerpt:**\n{$post_data['post_excerpt']}\n\n";
        }

        $preview .= "This post will be " . ($post_data['post_status'] === 'draft' ? 'saved as draft' : 'published immediately') . ".";

        return $preview;
    }

    /**
     * Create undo token for reversible actions
     */
    private function create_undo_token($action, $item_id, $data)
    {
        $token = 'pp_undo_' . uniqid() . '_' . time();

        // Store undo data in WordPress options (temporary solution)
        // In production, this would use a dedicated table
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