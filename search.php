<?php get_header(); ?>
<?php get_sidebar(); ?>

      <div id="mainContent">
        <?php include (TEMPLATEPATH . '/entry-functions.php'); ?>

  <?php if (have_posts()) : ?>

    <h2 class="pagetitle">搜寻结果</h2>

    <div class="navigation">
      <div class="alignleft"><?php next_posts_link('&laquo; Older Entries') ?></div>
      <div class="alignright"><?php previous_posts_link('Newer Entries &raquo;') ?></div>
    </div>


    <?php while (have_posts()) : the_post(); ?>

    <?php include (TEMPLATEPATH . '/entry.php'); ?>

    <?php endwhile; ?>

    <div class="navigation">
      <div class="alignleft"><?php next_posts_link('&laquo; Older Entries') ?></div>
      <div class="alignright"><?php previous_posts_link('Newer Entries &raquo;') ?></div>
    </div>

  <?php else : ?>

    <h2 class="pagetitle">No posts found. Try a different search?</h2>

  <?php endif; ?>

    </div><!-- end #mainContent -->
<?php get_footer(); ?>