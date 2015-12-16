<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" <?php language_attributes(); ?>>
<head profile="http://gmpg.org/xfn/11">
<meta http-equiv="Content-Type" content="<?php bloginfo('html_type'); ?>; charset=<?php bloginfo('charset'); ?>" />
<?php $categoriesTree = & ty_get_categories_tree(); ?>
<title><?php bloginfo('name'); ?> <?php if ( is_single() ) { ?> &raquo; Blog Archive <?php } ?> <?php wp_title(); ?></title>
<meta name="generator" content="WordPress <?php bloginfo('version'); ?>" />
<link rel="stylesheet" href="<?php bloginfo('template_url') ?>/css/master.css" type="text/css" media="screen" />
<link rel="alternate" type="application/rss+xml" title="<?php bloginfo('name'); ?> RSS Feed" href="<?php ty_walker('rss'); ?>" />
<link rel="pingback" href="<?php bloginfo('pingback_url'); ?>" />
<!--[if IE]>
<link rel="stylesheet" type="text/css" media="screen, projection" href="<?php bloginfo('template_url') ?>/css/ie.css" />
<![endif]-->
<?php wp_head(); ?>
</head>

<body class="<?php ty_walker('layout'); ?>">
<div id="html-ct">
  <div id="header-w">
    <div id="header">
      <div id="header-pri">
        <div class="bloginfo">
          <h1 class="<?php ty_walker_logo_css(); ?>"><a href="<?php echo get_option('home'); ?>/" title="首页"><b>net2e</b></a></h1>
          <p><?php bloginfo('description'); ?></p>
        </div>
        <p><a target="_blank" href="<?php ty_walker('rss'); ?>" class='ico-notxt rss'><b class="dn">rss</b></a></p>
        <ul class="alignright menubar menu-dg">
        <?php $categoriesTree->getLvl1(); ?>
        </ul>
        <p><a href="<?php echo get_option('home'); ?>/"><?php echo $categoriesTree->getCount(); ?>篇日志-></a></p>
      </div>
      <div id="header-sec">
        <ul class="menubar page-menu">
          <li><a href="<?php echo get_option('home'); ?>/">首页</a></li>
          <?php echo wp_list_pages("depth=1&title_li="); ?>
        </ul>
        <ul class='alignright lavaLamp lavaLampBottomStyle'>
        <?php $categoriesTree->getLvl2(); ?>
        </ul>
      </div>
    </div><!-- end #header -->
  <b class="bb"><b></b></b></div>
  <div class='contents-w'><b class="bt"><b></b></b><div id='contents'>