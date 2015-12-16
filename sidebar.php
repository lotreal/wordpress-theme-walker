  <div id="sidebar">
    <div id="profile" style='display:none;'><b class="bt"><b></b></b>
      <h4>lot的布拉格广场</h4>
      <p>测试版</p>
      <ul>
        <?php if(is_admin) {wp_register();} ?>
        <li><?php wp_loginout(); ?></li>
      </ul>
    <b class="bb"><b></b></b></div>
    <ul>
      <?php   /* Widgetized sidebar, if you have the plugin installed. */
          if ( !function_exists('dynamic_sidebar') || !dynamic_sidebar() ) : ?>
      <li><h2>未配置widget</h2>
      <p>在外观里配置的widget将显示在这里。</p>
      </li>
      <?php endif; ?>
    </ul>
    <!-- end #sidebar -->
  </div>