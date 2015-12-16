<?php get_header(); ?>
<?php get_sidebar(); ?>

  <div id="mainContent">
    <?php include (TEMPLATEPATH . '/entry-functions.php'); ?>
    <?php if (have_posts()) : ?>

    <div class="navigation">
      <div class="alignleft"><?php next_posts_link('&laquo; Older Entries') ?></div>
      <div class="alignright"><?php previous_posts_link('Newer Entries &raquo;') ?></div>
    </div>

    <?php while (have_posts()) : the_post(); ?>
    <?php
      include (TEMPLATEPATH . '/entry.php');
    ?>
    <?php endwhile; ?>

    <div class="navigation">
      <div class="alignleft"><?php next_posts_link('&laquo; Older Entries') ?></div>
      <div class="alignright"><?php previous_posts_link('Newer Entries &raquo;') ?></div>
      <?php //wp_pagebar(array('before'=>'Page: ', 'after'=>' ', 'tooltip'=>true, 'tooltip_text'=>'Page'))?>
    </div>
          <?php //wp_pagenavi(); ?>

    <?php else : ?>

    <h2 class="center">Not Found</h2>
    <p class="center">Sorry, but you are looking for something that isn't here.</p>
    <?php endif; ?>

  </div><!-- end #mainContent -->
<?php get_footer(); ?>