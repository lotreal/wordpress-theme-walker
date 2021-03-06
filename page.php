<?php get_header(); ?>
<?php get_sidebar(); ?>

      <div id="mainContent">
        <?php include (TEMPLATEPATH . '/entry-functions.php'); ?>

    <?php if (have_posts()) : while (have_posts()) : the_post(); ?>
    <div class="post" id="post-<?php the_ID(); ?>">
      <div class="post-header" id="post-header-<?php the_ID(); ?>">
        <h2><?php the_title(); ?></h2>
      </div>
      <div class="entry">
        <?php the_content('<p class="serif">Read the rest of this page &raquo;</p>'); ?>

        <?php wp_link_pages(array('before' => '<p><strong>Pages:</strong> ', 'after' => '</p>', 'next_or_number' => 'number')); ?>

      </div>
    </div>
    <?php endwhile; endif; ?>
  <?php edit_post_link('Edit this entry.', '<p>', '</p>'); ?>
 <?php comments_template(); ?>
    </div><!-- end #mainContent -->
<?php get_footer(); ?>