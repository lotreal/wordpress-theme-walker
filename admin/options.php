<?php
global $ty_walker_options;

$wkLayoutOptions = array(
    "layout-m" => "关闭侧边栏",
    "layout-ms" => "侧边栏居右",
    "layout-sm" => "侧边栏居左"
    );

?>
<?php if(isset($_POST['submit']) or isset($_GET['updated'])) { ?>
<div id="message2" class="updated fade">
    <p>Walker 选项已经更新。</p>
</div>
<?php } ?>

<div class="wrap">
    <?php if (1 == -1) { ?>
        <div class="error"><small></small></div>
    <?php } ?>



    <form name="dofollow" action="" method="post" enctype="multipart/form-data">
        <input type="hidden" name="action" value="<?php echo attribute_escape($update); ?>" />
        <input type="hidden" name="page_options" value="dofollow_timeout" />
        <input type="hidden" name="wk[version]" value="<?php echo $ty_walker_options['version']; ?>" />

        <p class="submit">
            <input type="submit" name="submit" value="保存配置 &raquo;" />
        </p>

        <style type="text/css">
        h3 {
            font: normal 1.8em Georgia;
            margin: 30px 0 0;
            color: #222;
        }

        small {
            font-size: 100%;
            color: #666;
        }

        .error {
            color #666;
            font-size: .8em;
        }

        .alignCenter {
            text-align: center;
            margin: auto;
        }

        .configstuff #k2-blogornoblog, .configstuff select  {
            width: 300px;
        }

        .configstuff p select {
            margin-left: 200px;
        }

        .configstuff input[type=file] {
            width: 220px;
            background: none;
            border: none;
            padding: 0;
        }

        .configstuff input[type=checkbox] {
            margin-right: 8px;
        }

        .configstuff {
            width: 700px;
            margin: 0 auto;
            font-size: 1.1em;
        }

        .configelap {
            text-align: center;
        }

        table {
            margin: 0 auto;
            padding: 0;
            border-spacing: 0;
        }

        table tr td {
            padding: 5px;
        }

        .sidebarradio {
            text-align: center;
            }
        .sidebarradio span {
            margin-right: 40px;
            }

        .sidebarradio span input {
            margin-right: 5px;
            }

        .sidebarno {
            margin-right: 0;
            }

        </style>

        <div class="configstuff">
            <h3>默认布局</h3>

            <p><small>Walker 现有三种布局方式：（关闭侧边栏、侧边栏居左和侧边栏居右），您可以选择一种设置为默认布局。</small></p>
            <p>
                <select id="wk-layout" name="wk[layout]">
                <?php foreach ($wkLayoutOptions as $option => $label) { ?>
                    <option value="<?php echo $option; ?>" <?php selected( get_ty_walker('layout'), $option); ?>><?php echo $label; ?></option>
                <?php } ?>
                </select>
            </p>

            <h3>RSS 地址</h3>

            <p><small>如果您想更改 wordprss 的 rss 输出地址为您自己烧制的 rss 地址，请在这里更改。</small></p>
            <p class="alignCenter">
                <input id="wk-rss" name="wk[rss]" value="<?php ty_walker('rss'); ?>" size="56" />
            </p>

            <h3>页眉设置</h3>
            <p class="checkboxelement"><input id="wk-uselogo" name="wk[uselogo]" type="checkbox" value="1" <?php checked('1', get_ty_walker('uselogo') ); ?> /> <label for="wk-uselogo">在页眉使用 logo 图.</label></p>
            <p><small>如果选中此选项，请将您的 logo 保存到主题目录下 css 文件夹里面的 logo.png (此图包含了 logo 的普通状态和鼠标激活状态，总大小为92x68。请参考下载包中自带的 logo 绘制)。</small></p>

            <h3>页脚设置</h3>
            <p><small>您在下面输入的内容将放置在页脚，通常用于放置您的站点统计代码。(可以输入 html , javascript. )
                <br /><em>&lt;!-- 统计代码示例 --&gt;&lt;div style=&quot;display:none;&quot;&gt;&lt;img src=http://js.tongji.yahoo.com.cn/0/ystat.gif&gt;&lt;/div&gt;</em></small></p>
            <p>
              <textarea id="wk-footer" tabindex="2" name="wk[footer]" cols="80" rows="8"><?php echo stripslashes(get_ty_walker('footer')); ?></textarea>
            </p>

        </div>

        <p class="submit">
            <input type="submit" name="submit" value="保存配置 &raquo;" />
        </p>

</div>

<div class="wrap">


        <div class="configstuff">
            <h3>从数据库中删除 Walker 配置</h3>

            <script type="text/javascript">
            function confirmUninstall() {
                if (confirm("确定要从数据库中删除 Walker 的配置吗？") == true) {
                    return true;
                } else {
                    return false;
                }
            }
            </script>


            <p><small>Walker 使用了 1 条数据库记录来保存您对 Walker 的选项设置，当你想<stronger>重置 Walker 选项为默认值</stronger>，或准备<stronger>卸载 Walker </stronger>时，请点这个按钮：</small></p>

            <p style="text-align: center;"><input id="uninstall" name="uninstall" type="submit" onClick="return confirmUninstall()" value="从数据库中删除 Walker 配置" /></p>
        </div>

</div>

    </form>
</div>
