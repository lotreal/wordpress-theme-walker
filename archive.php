<?php get_header(); ?>
<?php get_sidebar(); ?>

      <div id="mainContent">
        <?php include (TEMPLATEPATH . '/entry-functions.php'); ?>

<?php is_tag(); ?>
    <?php if (have_posts()) : ?>

    <?php $post = $posts[0]; // Hack. Set $post so that the_date() works. ?>
    <?php /* If this is a category archive */ if (is_category()) { ?>
    <?php /*
<h2 class="pagetitle"><?php //ty_category_link(); ?><a href="<?php echo get_option('home'); ?>/"><strong>首页</strong></a> / 分类 / <?php single_cat_title(); ?></h2>
        <a href="<?php bloginfo('template_url') ?>/categories.php">分类</a>
        <div class="cat-desc"><?php echo category_description(); ?></div>
        */ ?>

    <?php /* If this is a tag archive */ } elseif( is_tag() ) { ?>
    <h2 class="pagetitle"><a href="<?php echo get_option('home'); ?>/"><strong>首页</strong></a> / Tags / <?php single_tag_title(); ?></h2>
    <?php /* If this is a daily archive */ } elseif (is_day()) { ?>
    <h2 class="pagetitle">Archive for <?php the_time('F jS, Y'); ?></h2>
    <?php /* If this is a monthly archive */ } elseif (is_month()) { ?>
    <h2 class="pagetitle">Archive for <?php the_time('F, Y'); ?></h2>
    <?php /* If this is a yearly archive */ } elseif (is_year()) { ?>
    <h2 class="pagetitle">Archive for <?php the_time('Y'); ?></h2>
    <?php /* If this is an author archive */ } elseif (is_author()) { ?>
    <h2 class="pagetitle">Author Archive</h2>
    <?php /* If this is a paged archive */ } elseif (isset($_GET['paged']) && !empty($_GET['paged'])) { ?>
    <h2 class="pagetitle">Blog Archives</h2>
    <?php } ?>


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

    <h2 class="center">Not Found</h2>

  <?php endif; ?>

    </div><!-- end #mainContent -->
<?php get_footer(); ?>