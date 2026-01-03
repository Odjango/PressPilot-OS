<?php
/**
 * Projects Section Partial
 *
 * @package PressPilot_Child
 */

// Get all project categories
$categories = get_terms( array(
    'taxonomy'   => 'project_category',
    'hide_empty' => true,
) );

// Query latest 6 projects
$projects_query = new WP_Query( array(
    'post_type'      => 'project',
    'posts_per_page' => 6,
    'status'         => 'publish',
) );
?>

<section class="projects-section">
    <div class="projects-container">
        
        <?php if ( ! empty( $categories ) && ! is_wp_error( $categories ) ) : ?>
        <!-- Filter Bar -->
        <div class="projects-filter">
            <button class="filter-btn active" data-filter="all"><?php esc_html_e( 'All', 'presspilot-child' ); ?></button>
            <?php foreach ( $categories as $category ) : ?>
                <button class="filter-btn" data-filter="<?php echo esc_attr( $category->slug ); ?>">
                    <?php echo esc_html( $category->name ); ?>
                </button>
            <?php endforeach; ?>
        </div>
        <?php endif; ?>

        <!-- Projects Grid -->
        <div class="projects-grid">
            <?php
            if ( $projects_query->have_posts() ) :
                while ( $projects_query->have_posts() ) :
                    $projects_query->the_post();
                    $terms = get_the_terms( get_the_ID(), 'project_category' );
                    $term_slug = '';
                    $term_name = '';
                    if ( ! empty( $terms ) && ! is_wp_error( $terms ) ) {
                        // Just use the first category for filtering simplicity, or join all slugs
                        $term_slug = $terms[0]->slug;
                        $term_name = $terms[0]->name;
                    }
                    ?>
                    <article class="project-item" data-category="<?php echo esc_attr( $term_slug ); ?>">
                        <?php if ( has_post_thumbnail() ) : ?>
                            <?php the_post_thumbnail( 'large' ); ?>
                        <?php else : ?>
                            <div class="placeholder-image" style="background:#333; width:100%; height:100%;"></div>
                        <?php endif; ?>
                        
                        <a href="<?php the_permalink(); ?>" class="project-overlay">
                            <h3 class="project-title"><?php the_title(); ?></h3>
                            <?php if ( $term_name ) : ?>
                                <span class="project-category"><?php echo esc_html( $term_name ); ?></span>
                            <?php endif; ?>
                        </a>
                    </article>
                    <?php
                endwhile;
                wp_reset_postdata();
            else :
                ?>
                <p><?php esc_html_e( 'No projects found.', 'presspilot-child' ); ?></p>
            <?php endif; ?>
        </div>
    </div>
</section>
