<?php get_header(); ?>
<?php get_sidebar(); ?>

      <div id="mainContent">
        <?php include (TEMPLATEPATH . '/entry-functions.php'); ?>

  <?php if (have_posts()) : while (have_posts()) : the_post(); ?>

    <div class="navigation">
      <div class="alignleft"><?php previous_post_link('&laquo; %link') ?></div>
      <div class="alignright"><?php next_post_link('%link &raquo;') ?></div>
    </div>
  <?php include (TEMPLATEPATH . '/entry.php'); ?>
    <div class="navigation">
      <div class="alignleft"><?php previous_post_link('&laquo; %link') ?></div>
      <div class="alignright"><?php next_post_link('%link &raquo;') ?></div>
    </div>
  <?php comments_template(); ?>

  <?php endwhile; else: ?>

    <p>Sorry, no posts matched your criteria.</p>

<?php endif; ?>

    </div><!-- end #mainContent -->
<?php get_footer(); ?>