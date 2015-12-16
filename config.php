<?php
  require_once(dirname(__FILE__)."/../../../wp-config.php");
  get_header(); ?>

  <?php get_sidebar(); ?>

  <div id="mainContent">

    <?php include (TEMPLATEPATH . '/entry-functions.php'); ?>
    <h2 class="pagetitle">选项(暂无)</h2>

    </div><!-- end #mainContent -->
<?php get_footer(); ?>