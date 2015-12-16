  <br class="clearfloat" />
  </div><b class="bb"><b></b></b></div>
  <div class='footer-w'><b class="bt"><b></b></b><div id="footer">
    <small>
      Powered by
      <a href="http://wordpress.org/">WordPress</a>.
      Theme:walker.beta by
      <a href="http://blog.net2e.com">lot</a>.
    </small>
  </div><!-- end #footer --></div>
</div><!-- end #html-ct -->
<?php wp_footer(); ?>
</body>
</html>
<script language="javascript">
var ty = {
  home: "<?php bloginfo('template_url'); ?>",
  wp: "<?php echo ty_get_pagetype(); ?>"
}
</script>
<script src="<?php bloginfo('template_url') ?>/js/jquery-latest.min.js" language="javascript" type="text/javascript"></script>
<script src="<?php bloginfo('template_url') ?>/js/walker.js" language="javascript" type="text/javascript"></script>
<?php echo stripslashes(get_ty_walker('footer')); ?>