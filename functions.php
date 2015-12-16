<?php
if ( function_exists('register_sidebar') )
    register_sidebar(array(
        'before_widget' => '<li id="%1$s" class="widget %2$s">',
        'after_widget' => '</li>',
        'before_title' => '<h2 class="widgettitle"><b class="rb rb-blue-s"><b>',
        'after_title' => '</b></b></h2>',
    ));

$ty_walker_options = get_option('ty_walker');
if (!$ty_walker_options) { // no walker options record found in database
    $ty_walker_options = array(
        "version" => "s1",
        "layout" => "layout-ms",
        "rss" => get_bloginfo('rss2_url', 'display'),
        "uselogo" => '0',
        "footer" => '',
    );
}
function get_ty_walker($key) {
    global $ty_walker_options;
    return $ty_walker_options[$key];
}

function ty_walker($key) {
    echo get_ty_walker($key);
}

function ty_walker_logo_css() {
    echo get_ty_walker('uselogo')=='0' ? nologo : uselogo;
}

class tyWalkerOptions {
    function install() {
        //add_option('ty_walker', $ty_walker_options, 'This option stores walker\'s option');
    }

    function uninstall() {
        global $wpdb;
        // Delete options
        $cleanup = $wpdb->query("DELETE FROM $wpdb->options WHERE option_name = 'ty_walker'");
        // TODO delete cookie
    }

    function init() {
        if(is_admin()) {
            add_action('admin_menu', array('tyWalkerOptions', 'add_menu'));
            if($_GET['page'] == 'walker-options' and isset($_POST['uninstall'])) {
                tyWalkerTheme::uninstall();
            }
            tyWalkerOptions::update();
        }
    }

    function add_menu() {
        add_theme_page('Walker Options', 'Walker 选项', 'edit_themes', 'walker-options', array('tyWalkerOptions', 'admin'));
    }

    function admin() {
        include(TEMPLATEPATH . '/admin/options.php');
    }

    function update() {
        if(!empty($_POST)) {
            if(isset($_POST['wk'])) {
                global $ty_walker_options;
                // Set all the options
                foreach($_POST['wk'] as $option => $value) {
                    $ty_walker_options[$option] = $value;
                }
                // use logo on header
                if ( !isset($_POST['wk']['uselogo']) ) $ty_walker_options['uselogo'] = 0;
                update_option('ty_walker', $ty_walker_options);
            }
        }
    }
}

add_action('ty_walker_install', array('tyWalkerOptions', 'install'));
add_action('ty_walker_uninstall', array('tyWalkerOptions', 'uninstall'));
add_action('ty_walker_init', array('tyWalkerOptions', 'init'), 1);

class tyWalkerTheme {
    function init() {
        do_action('ty_walker_init');
        // set comment parent
        // $commentdata = apply_filters('preprocess_comment', $commentdata);
        add_filter('preprocess_comment', array('tyWalkerTheme', 'setCommentParent'));
        // for comment ajax posting
        // $location = apply_filters('comment_post_redirect', $location, $comment);
        add_filter('comment_post_redirect', array('tyWalkerTheme', 'getCommentUseAjax'), 10, 2);
    }

    function install($last_modified = 0) {
        do_action('ty_walker_install');
    }

    function uninstall() {
        // Activate the default Wordpress theme so as not to re-install walker
        // update_option('template', 'default');
        // update_option('stylesheet', 'default');

        // Call the uninstall handlers
        do_action('ty_walker_uninstall');
        // Flush the dang cache
        wp_cache_flush();
        // Go back to the themes page
        header('Location: themes.php');
        exit;
    }

    function & setCommentParent(&$commentdata) {
        $comment_parent = trim($_POST['parentId']);
        $commentdata['comment_parent'] = $comment_parent;
        return $commentdata;
    }
    function & getCommentUseAjax($location, & $comment) {
        /*
        $json = array();
        $json['id'] = $comment->comment_ID;
        $json['parent'] = $comment->comment_parent;
        $json['content'] = ty_comment($comment);
        //echo map2Json($json);
        */
        echo ty_comment($comment);
        return false; //cancel the redirect
    }
}
tyWalkerTheme::init();

class tyTreeNode {
    var $data;
    var $children = array();
    var $parentNode = null;
    var $currentFlag = FALSE;

    function setData(& $d) {
        $this->data = & $d;
    }
    function addChildren( & $node) {
        $node->parentNode = & $this;
        $this->children[] = & $node;
    }
    function & getParent() {
        return $this->parentNode;
    }
}

class tyTree {
    var $rootNode;
    var $currentNode;
    var $lastNode;
    function tyTree() {
        $this->rootNode = & new tyTreeNode();
        $this->currentNode = & $this->rootNode;
        $this->lastNode = & $this->rootNode;
    }
    function lvlUp() {
        $this->currentNode = & $this->lastNode;
    }
    function lvlDown() {
        $this->currentNode = & $this->currentNode->getParent();
    }
    function addNode(& $node) {
        $this->currentNode->addChildren($node);
        $this->lastNode = & $node;
    }
    function outLi( & $node, $before_li='') {
        $out_html = array();
        foreach($node->children as $n) {
            $category = & $n->data;
            $cat_name = attribute_escape( $category->name);
            $cat_name = apply_filters( 'list_cats', $cat_name, $category );

            $title = ' title="';
            if ( empty($category->description) )
              $title .= sprintf(__( 'View all posts filed under %s' ), $cat_name);
            else
              $title .=  attribute_escape( apply_filters( 'category_description', $category->description, $category ));

            $cat_count = intval($category->count);
            if ( $cat_count > 0 ) $title .= ' (共' . intval($category->count) . '篇)';
            $title .= '"';

            $li_html = '<li';
            if ($n->currentFlag) $li_html .= ' class="selected"';
            $li_html .= '>';

            //if (is_category() && $n->currentFlag) {
            //     $li_html .= '<b '.$title.'>'.$cat_name.'</b>';
            //} else {
                $link = '<a href="' . get_category_link( $category->term_id ) . '" ';
                $link .= $title;
                $link .= '>';
                $link .= $cat_name . '</a>';
                $li_html .= $link;
            //}
            $li_html .= '</li>';
            $out_html[] =  $li_html;
            //  $output = apply_filters('wp_list_categories', $output);
        }
        echo implode($before_li, $out_html);
    }
    function getCount() {
        $count = 0;
        foreach($this->rootNode->children as $node) {
            $count += intval($node->data->count);
        }
        return $count;
    }
    function getLvl1() {
        //var_dump($this->rootNode);
        $this->outLi($this->rootNode);
    }
    function getLvl2($before_li='') {
        foreach($this->rootNode->children as $node) {
            if ($node->currentFlag) $this->outLi($node, $before_li);
        }
    }
}

class ty_Walker_Category extends Walker {
    var $tree_type = 'category';
    var $db_fields = array ('parent' => 'parent', 'id' => 'term_id');
    var $tyCatTree;
    var $current_category;

    function ty_Walker_Category() {
        $this->tyCatTree = new tyTree;
        $this->current_category = ty_get_current_category();
    }

    function start_lvl($output) {
        $this->tyCatTree->lvlUp();
        return $output;
    }

    function end_lvl($output) {
        $this->tyCatTree->lvlDown();
        return $output;
    }

    function start_el($output, $category) {
        $node = new tyTreeNode();
        $node->setData($category);
        $current_category = $this->current_category;
        if ( $current_category )
            $_current_category = get_category( $current_category );

        if ( $current_category && ($category->term_id == $current_category) )
            $node->currentFlag = TRUE;
        elseif ( $_current_category && ($category->term_id == $_current_category->parent) )
            $node->currentFlag = TRUE;  // $class .=  ' current-cat-parent';

        $this->tyCatTree->addNode($node);
        return $output;
    }
}

function ty_get_current_category() {
        if (is_category()) {
            global $wp_query;
            $current_category = $wp_query->get_queried_object_id();
        } elseif (is_single())  {
            $category = get_the_category();
            $current_category = $category[0]->cat_ID;
        } else {
            $current_category = null;
        }
        return $current_category;
}

function & ty_get_categories_tree($args = '') {
    $defaults = array(
        'show_option_all' => '', 'orderby' => 'name',
        'order' => 'ASC', 'show_last_update' => 0,
        'style' => 'list', 'show_count' => 1,
        'hide_empty' => 1, 'use_desc_for_title' => 1,
        'child_of' => 0, 'feed' => '',
        'feed_image' => '', 'exclude' => '',
        'hierarchical' => true, 'title_li' => __('Categories'),
        'echo' => 1
    );

    $r = wp_parse_args( $args, $defaults );

    if ( !isset( $r['pad_counts'] ) && $r['show_count'] && $r['hierarchical'] ) {
        $r['pad_counts'] = true;
    }

    if ( isset( $r['show_date'] ) ) {
        $r['include_last_update_time'] = $r['show_date'];
    }

    $categories = get_categories($r);
    /*
    foreach ( $categories as $category ) {
      echo ' + '.$category->name;
    }
    */
    $walker = new ty_Walker_Category;
    $output = $walker->walk($categories, 0, $r);
    return $walker->tyCatTree;
}

function ty_category_link() {
    global $wp_query;
    $current_category = $wp_query->get_queried_object_id();
    echo get_category_parents($current_category);
}
function ty_get_pagetype() {
    if (is_home()) {
    return 'home';
    } elseif(is_single()) {
    return 'single';
    } elseif(is_category()) {
    return 'category';
    } elseif(is_page()) {
    return 'page';
    } elseif(is_tag()) {
    return 'tag';
    } elseif(is_search()) {
    return 'search';
    } elseif(is_date()) {
    return 'date';
    } elseif(is_author()) {
    return 'author';
    } elseif(is_404()) {
    return '404';
    } elseif(is_archive()) {
    return 'archive';
    } else {
    return '';
    }
}
function ty_get_comments_count() {
    global $id;
    $number = get_comments_number($id);
    return $number;
}

class ty_Walker_Comment extends Walker {
    var $tree_type = 'tycomment';
    var $db_fields = array ('parent' => 'comment_parent', 'id' => 'comment_ID');
    function start_lvl($output, $depth, $args) {
        $indent = str_repeat("\t", $depth);
        $output .= "$indent<ul class='children'>\n";
        return $output;
    }

    function end_lvl($output, $depth, $args) {
        $indent = str_repeat("\t", $depth);
        $output .= "$indent</ul>\n";
        return $output;
    }

    function start_el($output, $comment, $depth, $args) {
        $showreply = 0 > $args['max_reply_depth'] ||
            (0 <= $args['max_reply_depth'] && $args['max_reply_depth'] >= $depth);
        $output .=  ty_comment_start($comment, $showreply);
        return $output;
    }

    function end_el($output, $comment, $depth, $args) {
        $showreply = 0 > $args['max_reply_depth'] ||
            (0 <= $args['max_reply_depth'] && $args['max_reply_depth'] > $depth);
        $output .= ty_comment_end($comment, $showreply);
        return $output;
    }

}

function & ty_get_comment_children($root_id, $data) {
    if ( empty($data) )
        return array();
    $id_field = 'comment_ID';
    $parent_field = 'comment_parent';
    $term_list = array();

    foreach ( $data as $d ) {
        $use_id = false;
        if ( $d->$id_field == $root_id )
            continue;

        if ( $d->$parent_field == $root_id ) {
            if ( $use_id )
                $term_list[] = $d->$id_field;
            else
                $term_list[] = $d;

            if ( $children = ty_get_comment_children($d->$id_field, $data) )
                $term_list = array_merge($term_list, $children);
        }
    }

    return $term_list;
}

function ty_thread_comment( & $comments, $args = '') {
    $defaults = array(
        'max_reply_depth' => 6, 'echo' => 0
    );
    $r = wp_parse_args( $args, $defaults );

    $comments = & ty_get_comment_children(0, $comments);

    $walker = new ty_Walker_Comment;
    $output = '<ul class="commentlist">';
    $output .= $walker->walk($comments, 0, $r);
    $output .= '</ul>';
    //var_dump($output);
    echo $output;
}

function ty_comment( & $c) {
    return ty_comment_start($c) . ty_comment_end($c);
}

function ty_comment_start( & $c, $showreply = TRUE) {
    global $comment, $post; $comment = $c;
    static $oddcomment = '';
    $comment_class = ($oddcomment) ? 'even' : 'odd';$oddcomment = !$oddcomment;
    //$comment_class = '';
    ob_start();
?>
    <li class="<?php echo $comment_class;if($post->post_author==$comment->user_id) echo " highlighted"; ?>" id="comment-<?php comment_ID() ?>">
      <small class="commentmetadata"># <?php comment_ID() ?></small>
      <cite><?php comment_author_link() ?></cite> :
      <small class="commentmetadata">
        发表于 <a href="#comment-<?php comment_ID() ?>" title=""><?php comment_date() ?> <?php comment_time('H:i:s') ?></a>
        <?php edit_comment_link('edit','&nbsp;&nbsp;',''); ?>
        <?php if ($comment->comment_approved == '0') : ?>
        <u title="这是您第一次在这里发言，所以要在通过“广告别烦我”系统鉴定后才会公开显示。">鉴定中(?)</u>
        <?php endif; ?>

      </small>

      <?php comment_text() ?>

<?php
    $out = ob_get_contents();
    ob_clean();
    return $out;
}

function ty_comment_end( & $c, $showreply = TRUE) {
    global $comment, $post; $comment = $c;
    ob_start();
    if ($showreply) {
?>
      <a class="comment-reply-link btn" href="#comment-reply-<?php comment_ID() ?>" id="comment-reply-link-<?php comment_ID() ?>"><b class="rb rb-blue-s"><b>回复</b></b></a>
    <?php } ?>
    </li>

<?php
    $out = ob_get_contents();
    ob_clean();
    return $out;
}

?>