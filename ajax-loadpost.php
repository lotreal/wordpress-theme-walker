<?php
require_once(dirname(__FILE__)."/../../../wp-config.php");
header('Content-Type: text/html; charset=utf-8');
$post_ID = (int) $_GET['ID'];
query_posts('p='.$post_ID);

global $more;
// set $more to 0 in order to only get the first part of the post
$more = 0;

// the Loop
while (have_posts()) : the_post();
  // the content of the post
  the_content('Read the full post »');
endwhile;
?>