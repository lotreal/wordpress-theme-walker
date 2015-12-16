<?php
/*
Template Name: Links
*/
?>

<?php get_header(); ?>
<?php get_sidebar(); ?>

      <div id="mainContent">
        <?php include (TEMPLATEPATH . '/entry-functions.php'); ?>

<h2>Links:</h2>
<ul>
<?php get_links_list(); ?>
</ul>

    </div><!-- end #mainContent -->
<?php get_footer(); ?>