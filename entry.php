    <div class="post" id="post-<?php the_ID(); ?>">
      <div class="post-header" id="post-header-<?php the_ID(); ?>">
        <h2>
          <a id="entry-title-<?php the_ID(); ?>" class="entry-title" href="<?php the_permalink() ?>" rel="bookmark"><?php the_title(); ?></a>
          <a href="<?php the_permalink() ?>" title="在新窗口打开本文" target="_blank">&raquo;</a>
        </h2>
          <?php comments_popup_link('<b class="rb rb-green-s"><b>0</b></b>', '<b class="rb rb-blue-s"><b>1</b></b>', '<b class="rb rb-blue-s"><b>%</b></b>', 'btn comment-count-sup alignleft'); ?>
        <div class="post-abstract alignleft" id="post-abstract-<?php the_ID(); ?>"></div>

        <span class="metadata" id="post-metadata-<?php the_ID(); ?>">
          <?php the_category(', ') ?>
          |
          <a class="next-entry" href="#"><?php the_time('Y-n-d') ?></a>
        </span>
      </div>
      <div class="entry" id="entry-<?php the_ID(); ?>">
        <div id="entry-content-<?php the_ID(); ?>">
          <?php
          the_content('继续阅读《' . the_title('', '', false) . '》 &raquo;');
          //the_excerpt();
          ?>
        </div>
      </div>
      <div class="action" id="entry-action-<?php the_ID(); ?>">
        <p class="postmetadata">
        <a href="#">回到页首</a>
        |
        <?php edit_post_link('编辑日志', '', ' | '); ?>
        <?php //comments_rss_link('rss'); ?>
        <!--a href="<?php trackback_url(); ?>" rel="trackback">trackback</a-->
        <!--img width="10" height="10" alt="" src="http://images.del.icio.us/static/img/delicious.small.gif"/-->
        <a href="http://del.icio.us/post?url=<?php urlencode(the_permalink()) ?>;title=<?php urlencode(the_title()); ?>" target="_blank">del.icio.us</a>
        |
        <a href="">推荐</a>
        <!--a href="#">推荐</a>
        |
        <a href="#">发给朋友</a>
        |-->
        |
        <?php comments_popup_link('<b class="rb rb-green-s"><b>0 条评论</b></b>', '<b class="rb rb-blue-s"><b>1 条评论</b></b>', '<b class="rb rb-blue-s"><b>% 条评论</b></b>', 'btn'); ?>
        <?php //the_tags('Tags: ', ', ', ''); ?>
        </p>
      </div>
    <!-- end .post --></div>