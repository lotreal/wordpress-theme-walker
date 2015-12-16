/**
 * 用于wordpress主题开发
 *
 * @author lot / lot.real@gmail.com
 */

/*
 * 使用命名空间：ty
 */

(function() {
var $ = jQuery;

var _tycache = {};
ty.set = function(name,value) {
    _tycache[name] = value;
}
ty.get = function(name) {
    return _tycache[name];
}
ty.del = function(name) {
    delete _tycache[name];
}
function jsonDecode(jsonstr) {
  data = eval('('+jsonstr+')');
  return data;
}
function trim(str) {
    str = str.replace(/^\s+/, '');
    for (var i = str.length - 1; i > 0; i--) {
        if (/\S/.test(str.charAt(i))) {
            str = str.substring(0, i + 1);
            break;
        }
    }
    return str;
}
/*****************************************************************************

                              helper functions

 *****************************************************************************/
/*****************************************************************************
 * element functions
 * DEPEND: move the comment form in "Nested Comments"
 *****************************************************************************/
// save a seat and as space holder of the target element.
function elSaveSeat(sh, ta) { //sh:space holder,ta:target
    if(sh==null) return;
    sh.css({
        display: 'block',
        height: ta.height() + sh.height() + 'px',
        width: 0,
        overflow:'hidden'
    });
}
// resotre css after target element not need the space
function elRestoreSaveSet(sh) {
    if(sh==null) return;
    sh.css({
        display: 'inline',
        height: 'auto',
        width: 'auto'
    });
}
// align target base on the northwest of target element
function elAlign(el, ta, extraCss) {
    if(ta==null) return;
    var o = ta.offset();
    el.css({
        position: 'absolute',
        left: o.left + "px",
        top: o.top + "px"
    });
    if(extraCss) el.css(extraCss);
}
// give a icon for element
function elSetIcon(el, p) {
    if (p==undefined) return;
    el.addClass('ico');
    el.css('background-position',
        '-'+(64 * p.x) + 'px -'+(64 * p.y + 16)+'px');
}
/*****************************************************************************
 * String helper
 *****************************************************************************/
// ex: getNumFromTail('more-20') -> 20
function getNumFromTail(str) {
   return str.match(/\d+$/g)[0];
}
/*****************************************************************************
 * CSS helper
 *****************************************************************************/
function statCss(node, classnames, index) {
    for(var i=0, l=classnames.length; i<l; i++){
        node.removeClass(classnames[i]);
    }
    node.addClass(classnames[index]);
}
/*****************************************************************************
 * NOT IN USE
 *****************************************************************************/
function getParameterFromURL(s) {
  var test = /(\?|&)(\w+)=(\w+)/g;
  var ret = {};
  s.replace(test,
      function($0,$1,$2,$3) {
        ret[$2] = $3;
      }
    )
  return ret;
}

/*****************************************************************************

                              helper functions

 *****************************************************************************/
// if wordpress page type is one of the arguments,return true;
function wpPagetypeIs() {
    for(var i=0, l=arguments.length; i<l; i++){
        if(ty.wp==arguments[i]) return true;
    }
    return false;
}

ty.stateSwitcher = function(name, node, state, before_node, desc) {
    function currentState() {
        return state[state_index];
    }
    function nextState() {
        if (state_index + 1 < state.length) {
            return state[++state_index];
        } else {
            state_index = 0;
            return state[0];
        }
    }
    function setCaption(st) {
        node.text(st.caption);
    }
    function setIcon(st) {
        elSetIcon(node, st.icon);
        //node.css(icons.select(st.icon));
    }
    function setState(st) {
        st.click();
        if (enableCookie) {
            //alert(name); firebug cant know it value
            $.cookie(name, state_index, { expires: 3650, path: '/' });
        }
        var next_st = nextState();
        setCaption(next_st);
        setIcon(next_st);
    }

    if (node==null) return;

    var enableCookie = true;
    var state_index = 0;
    if (enableCookie) {
        state_index = parseInt($.cookie(name)) || 0;
    }

    setState(currentState());
    node.click(function() {
        setState(currentState());
        return false;
    });
    if(before_node!=null) node.before(before_node);
    if(desc!=null) node.attr('title',desc);
}

/*****************************************************************************

                              {ty} events

 *****************************************************************************/
ty.onMainContentResize = function(){};
ty.onPostHeaderClick = function(event) {
    if (event.target != this) return;
    var id = this.id.match(/\d+$/g)[0];
    var eds = entryDisplayStatus[id];
    if(eds == "S") {
        //alert('now show,will hidden');
        entry(id).hide();
        entryAbstract(id).show();
    } else {
        //alert('now hidden,will show');
        entryAbstract(id).hide();
        entry(id).show();
        entryAction(id).show();
    }
    entryDisplayStatus[id] = eds=='S' ? 'H' : 'S';
    event.stopPropagation();
    return false;
};
/*****************************************************************************
                           wordpress post manager (pm = posts manager)
 *****************************************************************************/
ty.EM = {};
var entryLoadStatus = {};
var entryDisplayStatus = {};
function entry(id) {return $("#entry-" + id);}
function entryAction(id) {return $("#entry-action-" + id);}
function entryAbstract(id) { return id == undefined ?
    $(".post-abstract") : $("#post-abstract-" + id); }
function entryMetadata(id) {return $("#post-metadata-" + id);}


function entryContent(id) {return $("#entry-content-" + id);}
function entryFull(id) {return $("#entry-full-" + id);}
function entryLoading(id) {return $("#entry-loading-" + id);}
function moreLink(id) { return id == undefined ?
    $(".more-link") : $("#entry-content-"+id+' .more-link'); }

function getPostById(id) {
    if ( (id in entryLoadStatus) && entryLoadStatus[id]=='S' ) {
        entryContent(id).hide();
        entryFull(id).show();
    } else {
        moreLink(id).hide();
        entryLoading(id).show();
        jQuery.ajax({
            url: ty.home + '/ajax-loadpost.php?ID='+id,
            error: function(request) {
                entryLoadStatus[id] = 'E';
                alert("error");
            },
            success: function(data) {
                entryLoadStatus[id] = 'S';
                ty.pmExpandPost(id, data);
            }
        });
    }
}
ty.entryIDs = [];
ty.pmInit = function() {
    var posts = $('.post');
    if (posts == null) return;
    $.each(posts, function(i) {
        var id = getNumFromTail(this.id);
        ty.entryIDs.push(id);
    });
    var expandTrigger = moreLink();
    if (expandTrigger == null) return;
    $.each(expandTrigger, function(i) {
        var id = getNumFromTail(this.href);
        $(this).after('<span class="entry-loading" id="entry-loading-'+id+'">正在展开 &raquo;</span>');
        entryContent(id).after('<div id="entry-full-'+id+'" style="display:none;"></div>');
    });
    expandTrigger.click(function() {
        var id = this.href.match(/\d+$/g)[0]; // get id from string like "string-78"
        getPostById(id);
        return false;
    });

    $('.post-header').click(ty.onPostHeaderClick);
    entryAbstract().click(ty.onPostHeaderClick);
}

ty.pmExpandPost = function(id, data) {
    entryContent(id).hide();
    var e = entryFull(id);
    e.html(data+
      '<p><a class="contract-link" onclick="ty.pmContractPost(\''+id+'\');" href="#post-'+id+'">&laquo; 缩进全文</a></p>');
    //e.slideDown("fast");
    e.show();
}
ty.pmContractPost = function(id) {
    entryLoading(id).hide();
    moreLink(id).show();
    //entryFull(id).slideUp("fast", function(){entryContent(id).show();});
    entryFull(id).hide();
    entryContent(id).show();
}

ty.pmShowTitleOnly = function() {
    $(".action").hide();
    $(".entry").hide();
    //$("#mainContent").addClass("showTitleOnly");
    entryAbstract().show();
    ty.onMainContentResize();

    for(var i=0,ids=ty.entryIDs,l=ids.length; i<l; i++){
        entryDisplayStatus[ids[i]] = "H"
    }
}
ty.pmShowNormal = function() {
    entryAbstract().hide();
    $(".action").show();
    $(".entry").show();
    //$("#mainContent").removeClass("showTitleOnly");
    for(var i=0,ids=ty.entryIDs,l=ids.length; i<l; i++){
        entryDisplayStatus[ids[i]] = "S"
    }
}

/* end of EM - wordpress entry manager
---------------------------------------------------------- */

function opInit() {
    /*
    new ty.stateSwitcher('setupFontSize', $("#setupFontSize"), [
        {caption:'字号：大',
         icon: 4,
         click:function(){$('#mainContent').addClass('entryBigFont'); } },
        {caption:'字号：小',
         icon: 4,
         click:function(){$('#mainContent').removeClass('entryBigFont'); } }
    ]);
    */
    var ps = new ty.stateSwitcher('setupPageLayout',
        $("#setupPageLayout"), [
        {caption:'隐藏侧边栏',
         icon: {x:0,y:1},
         click:function(){
             statCss($('body'),['layout-ms','layout-sm','layout-m'],2);
             ty.onMainContentResize();
         } },
        {caption:'显示侧边栏',
         icon: {x:0,y:2},
         click:function(){
             statCss($('body'),['layout-ms','layout-sm','layout-m'],0);
             ty.onMainContentResize();
         } },
        {caption:'侧边栏居左',
         icon: {x:0,y:3},
         click:function(){
             statCss($('body'),['layout-ms','layout-sm','layout-m'],1);
             ty.onMainContentResize();
         } }
    ], "", '设置侧边栏位置。可选：显示侧边栏|隐藏侧边栏|侧边栏居左');
    if(!wpPagetypeIs('single','page','')) {
        new ty.stateSwitcher('setupDisplayStyle', $("#setupDisplayStyle"), [
            {caption:'显示内容', click:ty.pmShowNormal },
            {caption:'只显示标题', click:ty.pmShowTitleOnly }
        ], " | ", '设置日志视图。可选：只显示日志标题|显示日志内容');
    }
}




$(document).ready(function(){
    $(".lavaLamp").lavaLamp(); // append lavaLamp menu effect
});

$(document).ready(function(){
    ty.pmInit();
    opInit();
    // 添加滚动到下一个文章的链接
    var l = ty.entryIDs.length;
    $('.next-entry').each(function(i) {
        if (i+1 < l) {
            this.href = '#post-' + ty.entryIDs[i+1];
            this.title = '下一篇日志';
        } else {
            this.href = '#';
            this.title = '回到页首';
        }
    });
});
/*****************************************************************************
                             comment manager
 *****************************************************************************/
function commentCont() { return $('.comment-count');}
function commentFormContainer() {return $('#commentform-container');}
function commentForm() { return $('#commentform');}
function commentContent() { return $('#comment');}
function commentSubmitBtn() { return $('#submit');}
function commentReplyLink(id) { return id==undefined ?
    $('.comment-reply-link') : $('#comment-reply-link-'+id); }
function commentReplyLinkC(context) {
    return $('.comment-reply-link', context);}
function cancelCommentReplyLink() { return $('.place-cf-back');}

function getCommentCount() {
    return $('.commentlist li').length;
}

// AJAX comment posting
// from regua's Ajax Comment Posting 1.2.1 (http://regua.biz)
$(document).ready(function(){
    //return;
    var form = commentForm();
    var submitBtn = commentSubmitBtn();
    submitBtn.after('<img src="'+ty.home+'/css/icons/loading.gif" id="loading" alt="Loading..." class="alignleft" /><div id="error" class="alignleft"></div>');
    function commentLoading() {return $('#loading');}
    commentLoading().hide();
    function commentMsg() { return $('#error');}
    var msg = commentMsg();
    function msgAlert(str) { msg.html('<span class="error">'+ str +'</span>'); }
    function msgOK(str) { msg.html('<span class="success">'+ str +'</span>'); }

    /*// Ajax Edit Comments hook
    if (window.AjaxEditComments) {
        AjaxEditComments.init();
    }*/

    function submitCommentForm() {
        if(form.find('#author')[0]) {
            if(form.find('#author').val() == '') {
                msgAlert('Please enter your name.');
                return false;
            } // end if
                if(form.find('#email').val() == '') {
                msgAlert('Please enter your email address.');
                return false;
            } // end if
            var filter  = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
            if(!filter.test(form.find('#email').val())) {
                msgAlert('<span class="error" id="errd">Please enter a valid email address.</span>');
            return false;
            } // end if
        } // end if

        if(form.find('#comment').val() == '') {
            msgAlert('Please enter your comment.');
            return false;
        } // end if

        form.ajaxSubmit({
            beforeSubmit: function(a) {
                a.push( { name: 'parentId', value: ty.get('comment-parent-id') || 0 } );
                msg.empty();
                commentLoading().show();
                msgAlert('&nbsp;正在传送您的评论...');
                submitBtn.attr('disabled','disabled');
            }, // end beforeSubmit

            error: function(request){
                msg.empty();
                if (request.responseText.search(/<title>WordPress &rsaquo; 错误<\/title>/) != -1) {
                    var data = request.responseText.match(/<p>(.*)<\/p>/);
                    msgAlert(data[1]);
                } else {
                    var data = request.responseText;
                    msgAlert(data[1]);
                }
                commentLoading().hide();
                submitBtn.removeAttr("disabled");
                return false;
            }, // end error()

            success: function(data) {
                var pid = ty.get('comment-parent-id') || 0;
                var commentContainer = (pid==0) ?
                    '.commentlist' : '#comment-'+pid+' ul.children:first';
                if ($(commentContainer).length == 0 ) {
                    if (pid==0)
                        commentFormContainer().before('<ul class="commentlist"></ul>');
                    else
                        commentReplyLink(pid).before('<ul class="children"></ul>');
                }
                //$(commentContainer).append(data);

                //var newComment = $(commentContainer + " li:last");
                var newComment = $(data);
                $(commentContainer).append(newComment);

                newComment.hide();
                var cc = getCommentCount();
                statCss(newComment,['even','odd'], cc % 2);
                newComment.fadeIn("slow");
                commentCont().text(cc);

                commentLoading().hide();
                msgOK('Your comment has been added.');
                submitBtn.removeAttr("disabled");

                commentReplyLinkC(newComment).click(function(){
                    cfPlaceunder(this);
                    return false;
                });

                elAlign(commentFormContainer(), lastPlaceCFlink);
            }
        }); // end ajaxSubmit()
        return false;
    }

    // move comment form
    var lastPlaceCFlink = null;
    function cfPlaceunder(el) { // comment form under [el]element node
        ty.set('comment-parent-id', getNumFromTail(el.id)); // TODO catch error
        cancelCommentReplyLink().show();
        elRestoreSaveSet(lastPlaceCFlink);
        var link = $(el);
        elAlign(commentFormContainer(), link, {width: '500px'});
        elSaveSeat(link, commentFormContainer());
        lastPlaceCFlink = link;
    };
    function cfPlaceback() { // comment form under [el]element node
        ty.set('comment-parent-id', 0);
        cancelCommentReplyLink().hide();
        commentFormContainer().css({
            position: 'relative',
            left: 'auto',
            top: 'auto',
            width: 'auto'
        });
        elRestoreSaveSet(lastPlaceCFlink);
        lastPlaceCFlink = null;
    };

    // events
    function cmEventInit() { // TODO improve
        commentReplyLink().click(function(){
            cfPlaceunder(this);
            return false;
        });
        cancelCommentReplyLink().click(function(){
            cfPlaceback();
            return false;
        });
    }
    cmEventInit();
    form.submit(submitCommentForm); // end form.submit()
    commentContent().accesskey('ctrl+enter', submitCommentForm, true);
}); // end document.ready()

$(function() {
// show abstract of post after post title
if(!wpPagetypeIs('home','category')) return;

var mainContentDom = $('#mainContent').get(0);
var psEls = {}, mdEls = {};
for(var i=0,ids=ty.entryIDs,l=ids.length; i<l; i++){
    var id = ids[i], ps = entryAbstract(id);
    // init post abstract contents
    // TODO get need only
    ps.text(trim(entryContent(id).text()));
    psEls[id] = ps;
    mdEls[id] = entryMetadata(id);
}

// for post abstract
function eventOnResize() {
    var lastMainContentWidth = ty.get('mainContentWidth');
    //var thisMainContentWidth = $('#mainContent').width();
    thisMainContentWidth = mainContentDom.offsetWidth;
    //alert("calcPostAbstractWidth");
    if (lastMainContentWidth == undefined ||
        lastMainContentWidth!=thisMainContentWidth) {
        ty.set('mainContentWidth', thisMainContentWidth);
        //alert("calcPostAbstractWidth begin");
        for(var i=0,ids=ty.entryIDs,l=ids.length; i<l; i++){
            var id = ids[i];
            var ps = psEls[id];
            var psIsHidden = ps.css('display')=='none';
            var metadata = mdEls[id];
            ps.css('width', '0px');
            if (psIsHidden) ps.show();
            var psWidth = metadata.offset().left - ps.offset().left - 6;
            if (psIsHidden) ps.hide();
            ps.css('width', psWidth + 'px');
        }
    }
}
eventOnResize();
ty.onMainContentResize = function(){eventOnResize();};
$(window).resize(eventOnResize);
});
/*****************************************************************************
                            end of walker
 *****************************************************************************/
})();

/**
 * Get the value of a cookie with the given name.
 *
 * @example $.cookie('the_cookie');
 * @desc Get the value of a cookie.
 *
 * @param String name The name of the cookie.
 * @return The value of the cookie.
 * @type String
 *
 * @name $.cookie
 * @cat Plugins/Cookie
 * @author Klaus Hartl/klaus.hartl@stilbuero.de
 */
jQuery.cookie = function(name, value, options) {
    if (typeof value != 'undefined') { // name and value given, set cookie
        options = options || {};
        if (value === null) {
            value = '';
            options.expires = -1;
        }
        var expires = '';
        if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
            var date;
            if (typeof options.expires == 'number') {
                date = new Date();
                date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
            } else {
                date = options.expires;
            }
            expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
        }
        var path = options.path ? '; path=' + options.path : '';
        var domain = options.domain ? '; domain=' + options.domain : '';
        var secure = options.secure ? '; secure' : '';
        document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
    } else { // only name given, get cookie
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
};
/*
 * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
 *
 * Uses the built In easIng capabilities added In jQuery 1.1
 * to offer multiple easIng options
 *
 * Copyright (c) 2007 George Smith
 * Licensed under the MIT License:
 *   http://www.opensource.org/licenses/mit-license.php
 */

// t: current time, b: begInnIng value, c: change In value, d: duration
jQuery.easing['jswing'] = jQuery.easing['swing'];

jQuery.extend( jQuery.easing,
{
    def: 'easeOutQuad',
    swing: function (x, t, b, c, d) {
        //alert(jQuery.easing.default);
        return jQuery.easing[jQuery.easing.def](x, t, b, c, d);
    },
    easeInQuad: function (x, t, b, c, d) {
        return c*(t/=d)*t + b;
    },
    easeOutQuad: function (x, t, b, c, d) {
        return -c *(t/=d)*(t-2) + b;
    },
    easeInOutQuad: function (x, t, b, c, d) {
        if ((t/=d/2) < 1) return c/2*t*t + b;
        return -c/2 * ((--t)*(t-2) - 1) + b;
    },
    easeInCubic: function (x, t, b, c, d) {
        return c*(t/=d)*t*t + b;
    },
    easeOutCubic: function (x, t, b, c, d) {
        return c*((t=t/d-1)*t*t + 1) + b;
    },
    easeInOutCubic: function (x, t, b, c, d) {
        if ((t/=d/2) < 1) return c/2*t*t*t + b;
        return c/2*((t-=2)*t*t + 2) + b;
    },
    easeInQuart: function (x, t, b, c, d) {
        return c*(t/=d)*t*t*t + b;
    },
    easeOutQuart: function (x, t, b, c, d) {
        return -c * ((t=t/d-1)*t*t*t - 1) + b;
    },
    easeInOutQuart: function (x, t, b, c, d) {
        if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
        return -c/2 * ((t-=2)*t*t*t - 2) + b;
    },
    easeInQuint: function (x, t, b, c, d) {
        return c*(t/=d)*t*t*t*t + b;
    },
    easeOutQuint: function (x, t, b, c, d) {
        return c*((t=t/d-1)*t*t*t*t + 1) + b;
    },
    easeInOutQuint: function (x, t, b, c, d) {
        if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
        return c/2*((t-=2)*t*t*t*t + 2) + b;
    },
    easeInSine: function (x, t, b, c, d) {
        return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
    },
    easeOutSine: function (x, t, b, c, d) {
        return c * Math.sin(t/d * (Math.PI/2)) + b;
    },
    easeInOutSine: function (x, t, b, c, d) {
        return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
    },
    easeInExpo: function (x, t, b, c, d) {
        return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
    },
    easeOutExpo: function (x, t, b, c, d) {
        return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
    },
    easeInOutExpo: function (x, t, b, c, d) {
        if (t==0) return b;
        if (t==d) return b+c;
        if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
        return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
    },
    easeInCirc: function (x, t, b, c, d) {
        return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
    },
    easeOutCirc: function (x, t, b, c, d) {
        return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
    },
    easeInOutCirc: function (x, t, b, c, d) {
        if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
        return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
    },
    easeInElastic: function (x, t, b, c, d) {
        var s=1.70158;var p=0;var a=c;
        if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
        if (a < Math.abs(c)) { a=c; var s=p/4; }
        else var s = p/(2*Math.PI) * Math.asin (c/a);
        return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
    },
    easeOutElastic: function (x, t, b, c, d) {
        var s=1.70158;var p=0;var a=c;
        if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
        if (a < Math.abs(c)) { a=c; var s=p/4; }
        else var s = p/(2*Math.PI) * Math.asin (c/a);
        return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
    },
    easeInOutElastic: function (x, t, b, c, d) {
        var s=1.70158;var p=0;var a=c;
        if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
        if (a < Math.abs(c)) { a=c; var s=p/4; }
        else var s = p/(2*Math.PI) * Math.asin (c/a);
        if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
        return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
    },
    easeInBack: function (x, t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        return c*(t/=d)*t*((s+1)*t - s) + b;
    },
    easeOutBack: function (x, t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
    },
    easeInOutBack: function (x, t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
        return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
    },
    easeInBounce: function (x, t, b, c, d) {
        return c - jQuery.easing.easeOutBounce (x, d-t, 0, c, d) + b;
    },
    easeOutBounce: function (x, t, b, c, d) {
        if ((t/=d) < (1/2.75)) {
            return c*(7.5625*t*t) + b;
        } else if (t < (2/2.75)) {
            return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
        } else if (t < (2.5/2.75)) {
            return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
        } else {
            return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
        }
    },
    easeInOutBounce: function (x, t, b, c, d) {
        if (t < d/2) return jQuery.easing.easeInBounce (x, t*2, 0, c, d) * .5 + b;
        return jQuery.easing.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b;
    }
});

/* Copyright (c) 2007 Paul Bakaus (paul.bakaus@googlemail.com) and Brandon Aaron (brandon.aaron@gmail.com || http://brandonaaron.net)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 *
 * $LastChangedDate: 2007-12-20 22:43:48 +0800 (星期四, 20 十二月 2007) $
 * $Rev: 4257 $
 *
 * Version: @VERSION
 *
 * Requires: jQuery 1.2+
 */

(function($){

$.dimensions = {
    version: '@VERSION'
};

// Create innerHeight, innerWidth, outerHeight and outerWidth methods
$.each( [ 'Height', 'Width' ], function(i, name){

    // innerHeight and innerWidth
    $.fn[ 'inner' + name ] = function() {
        if (!this[0]) return;

        var torl = name == 'Height' ? 'Top'    : 'Left',  // top or left
            borr = name == 'Height' ? 'Bottom' : 'Right'; // bottom or right

        return this.is(':visible') ? this[0]['client' + name] : num( this, name.toLowerCase() ) + num(this, 'padding' + torl) + num(this, 'padding' + borr);
    };

    // outerHeight and outerWidth
    $.fn[ 'outer' + name ] = function(options) {
        if (!this[0]) return;

        var torl = name == 'Height' ? 'Top'    : 'Left',  // top or left
            borr = name == 'Height' ? 'Bottom' : 'Right'; // bottom or right

        options = $.extend({ margin: false }, options || {});

        var val = this.is(':visible') ?
                this[0]['offset' + name] :
                num( this, name.toLowerCase() )
                    + num(this, 'border' + torl + 'Width') + num(this, 'border' + borr + 'Width')
                    + num(this, 'padding' + torl) + num(this, 'padding' + borr);

        return val + (options.margin ? (num(this, 'margin' + torl) + num(this, 'margin' + borr)) : 0);
    };
});

// Create scrollLeft and scrollTop methods
$.each( ['Left', 'Top'], function(i, name) {
    $.fn[ 'scroll' + name ] = function(val) {
        if (!this[0]) return;

        return val != undefined ?

            // Set the scroll offset
            this.each(function() {
                this == window || this == document ?
                    window.scrollTo(
                        name == 'Left' ? val : $(window)[ 'scrollLeft' ](),
                        name == 'Top'  ? val : $(window)[ 'scrollTop'  ]()
                    ) :
                    this[ 'scroll' + name ] = val;
            }) :

            // Return the scroll offset
            this[0] == window || this[0] == document ?
                self[ (name == 'Left' ? 'pageXOffset' : 'pageYOffset') ] ||
                    $.boxModel && document.documentElement[ 'scroll' + name ] ||
                    document.body[ 'scroll' + name ] :
                this[0][ 'scroll' + name ];
    };
});

$.fn.extend({
    position: function() {
        var left = 0, top = 0, elem = this[0], offset, parentOffset, offsetParent, results;

        if (elem) {
            // Get *real* offsetParent
            offsetParent = this.offsetParent();

            // Get correct offsets
            offset       = this.offset();
            parentOffset = offsetParent.offset();

            // Subtract element margins
            offset.top  -= num(elem, 'marginTop');
            offset.left -= num(elem, 'marginLeft');

            // Add offsetParent borders
            parentOffset.top  += num(offsetParent, 'borderTopWidth');
            parentOffset.left += num(offsetParent, 'borderLeftWidth');

            // Subtract the two offsets
            results = {
                top:  offset.top  - parentOffset.top,
                left: offset.left - parentOffset.left
            };
        }

        return results;
    },

    offsetParent: function() {
        var offsetParent = this[0].offsetParent;
        while ( offsetParent && (!/^body|html$/i.test(offsetParent.tagName) && $.css(offsetParent, 'position') == 'static') )
            offsetParent = offsetParent.offsetParent;
        return $(offsetParent);
    }
});

function num(el, prop) {
    return parseInt($.curCSS(el.jquery?el[0]:el,prop,true))||0;
};

})(jQuery);
/**
 * LavaLamp - A menu plugin for jQuery with cool hover effects.
 * @requires jQuery v1.1.3.1 or above
 *
 * http://gmarwaha.com/blog/?p=7
 *
 * Copyright (c) 2007 Ganeshji Marwaha (gmarwaha.com)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 * Version: 0.1.0
 */

/**
 * Creates a menu with an unordered list of menu-items. You can either use the CSS that comes with the plugin, or write your own styles
 * to create a personalized effect
 *
 * The HTML markup used to build the menu can be as simple as...
 *
 *       <ul class="lavaLamp">
 *           <li><a href="#">Home</a></li>
 *           <li><a href="#">Plant a tree</a></li>
 *           <li><a href="#">Travel</a></li>
 *           <li><a href="#">Ride an elephant</a></li>
 *       </ul>
 *
 * Once you have included the style sheet that comes with the plugin, you will have to include
 * a reference to jquery library, easing plugin(optional) and the LavaLamp(this) plugin.
 *
 * Use the following snippet to initialize the menu.
 *   $(function() { $(".lavaLamp").lavaLamp({ fx: "backout", speed: 700}) });
 *
 * Thats it. Now you should have a working lavalamp menu.
 *
 * @param an options object - You can specify all the options shown below as an options object param.
 *
 * @option fx - default is "linear"
 * @example
 * $(".lavaLamp").lavaLamp({ fx: "backout" });
 * @desc Creates a menu with "backout" easing effect. You need to include the easing plugin for this to work.
 *
 * @option speed - default is 500 ms
 * @example
 * $(".lavaLamp").lavaLamp({ speed: 500 });
 * @desc Creates a menu with an animation speed of 500 ms.
 *
 * @option click - no defaults
 * @example
 * $(".lavaLamp").lavaLamp({ click: function(event, menuItem) { return false; } });
 * @desc You can supply a callback to be executed when the menu item is clicked.
 * The event object and the menu-item that was clicked will be passed in as arguments.
 */
(function($) { //lavaLamp
$.fn.lavaLamp = function(o) {
    o = $.extend({ fx: "easeOutBack", speed: 500, click: function(){} }, o || {});

    return this.each(function() {
        var me = $(this), noop = function(){},
            $back = $('<li class="back"><div class="left"></div></li>').appendTo(me),
            $li = $("li", this), curr = $("li.selected", this)[0] || $("li", this)[0]; //$($li[0]).addClass("selected")[0];

        $li.not(".back").hover(function() {
            move(this);
        }, noop);

        $(this).hover(noop, function() {
            move(curr);
        });

        $li.click(function(e) {
            setCurr(this);
            return o.click.apply(this, [e, this]);
        });

        //setCurr(curr);
        $back.css({ "left": curr.offsetLeft+"px", "width": curr.offsetWidth+"px" });
        function setCurr(el) {
            $(curr).removeClass('selected');
            $back.css({ "left": el.offsetLeft+"px", "width": el.offsetWidth+"px" });
            curr = el;
            $(curr).addClass('selected');
        };

        function move(el) {
            $back.each(function() {
                $(this).dequeue("fx"); }
            ).animate({
                width: el.offsetWidth,
                left: el.offsetLeft
            }, o.speed, o.fx);
        };

    });
};
})(jQuery);

/*
 * jQuery Form Plugin
 * version: 2.02 (12/16/2007)
 * @requires jQuery v1.1 or later
 *
 * Examples at: http://malsup.com/jquery/form/
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * Revision: $Id: jquery.form.js 4332 2007-12-29 23:25:28Z malsup $
 */
 (function($) {
/**
 * ajaxSubmit() provides a mechanism for submitting an HTML form using AJAX.
 *
 * ajaxSubmit accepts a single argument which can be either a success callback function
 * or an options Object.  If a function is provided it will be invoked upon successful
 * completion of the submit and will be passed the response from the server.
 * If an options Object is provided, the following attributes are supported:
 *
 *  target:   Identifies the element(s) in the page to be updated with the server response.
 *            This value may be specified as a jQuery selection string, a jQuery object,
 *            or a DOM element.
 *            default value: null
 *
 *  url:      URL to which the form data will be submitted.
 *            default value: value of form's 'action' attribute
 *
 *  type:     The method in which the form data should be submitted, 'GET' or 'POST'.
 *            default value: value of form's 'method' attribute (or 'GET' if none found)
 *
 *  data:     Additional data to add to the request, specified as key/value pairs (see $.ajax).
 *
 *  beforeSubmit:  Callback method to be invoked before the form is submitted.
 *            default value: null
 *
 *  success:  Callback method to be invoked after the form has been successfully submitted
 *            and the response has been returned from the server
 *            default value: null
 *
 *  dataType: Expected dataType of the response.  One of: null, 'xml', 'script', or 'json'
 *            default value: null
 *
 *  semantic: Boolean flag indicating whether data must be submitted in semantic order (slower).
 *            default value: false
 *
 *  resetForm: Boolean flag indicating whether the form should be reset if the submit is successful
 *
 *  clearForm: Boolean flag indicating whether the form should be cleared if the submit is successful
 *
 *
 * The 'beforeSubmit' callback can be provided as a hook for running pre-submit logic or for
 * validating the form data.  If the 'beforeSubmit' callback returns false then the form will
 * not be submitted. The 'beforeSubmit' callback is invoked with three arguments: the form data
 * in array format, the jQuery object, and the options object passed into ajaxSubmit.
 * The form data array takes the following form:
 *
 *     [ { name: 'username', value: 'jresig' }, { name: 'password', value: 'secret' } ]
 *
 * If a 'success' callback method is provided it is invoked after the response has been returned
 * from the server.  It is passed the responseText or responseXML value (depending on dataType).
 * See jQuery.ajax for further details.
 *
 *
 * The dataType option provides a means for specifying how the server response should be handled.
 * This maps directly to the jQuery.httpData method.  The following values are supported:
 *
 *      'xml':    if dataType == 'xml' the server response is treated as XML and the 'success'
 *                   callback method, if specified, will be passed the responseXML value
 *      'json':   if dataType == 'json' the server response will be evaluted and passed to
 *                   the 'success' callback, if specified
 *      'script': if dataType == 'script' the server response is evaluated in the global context
 *
 *
 * Note that it does not make sense to use both the 'target' and 'dataType' options.  If both
 * are provided the target will be ignored.
 *
 * The semantic argument can be used to force form serialization in semantic order.
 * This is normally true anyway, unless the form contains input elements of type='image'.
 * If your form must be submitted with name/value pairs in semantic order and your form
 * contains an input of type='image" then pass true for this arg, otherwise pass false
 * (or nothing) to avoid the overhead for this logic.
 *
 *
 * When used on its own, ajaxSubmit() is typically bound to a form's submit event like this:
 *
 * $("#form-id").submit(function() {
 *     $(this).ajaxSubmit(options);
 *     return false; // cancel conventional submit
 * });
 *
 * When using ajaxForm(), however, this is done for you.
 *
 * @example
 * $('#myForm').ajaxSubmit(function(data) {
 *     alert('Form submit succeeded! Server returned: ' + data);
 * });
 * @desc Submit form and alert server response
 *
 *
 * @example
 * var options = {
 *     target: '#myTargetDiv'
 * };
 * $('#myForm').ajaxSubmit(options);
 * @desc Submit form and update page element with server response
 *
 *
 * @example
 * var options = {
 *     success: function(responseText) {
 *         alert(responseText);
 *     }
 * };
 * $('#myForm').ajaxSubmit(options);
 * @desc Submit form and alert the server response
 *
 *
 * @example
 * var options = {
 *     beforeSubmit: function(formArray, jqForm) {
 *         if (formArray.length == 0) {
 *             alert('Please enter data.');
 *             return false;
 *         }
 *     }
 * };
 * $('#myForm').ajaxSubmit(options);
 * @desc Pre-submit validation which aborts the submit operation if form data is empty
 *
 *
 * @example
 * var options = {
 *     url: myJsonUrl.php,
 *     dataType: 'json',
 *     success: function(data) {
 *        // 'data' is an object representing the the evaluated json data
 *     }
 * };
 * $('#myForm').ajaxSubmit(options);
 * @desc json data returned and evaluated
 *
 *
 * @example
 * var options = {
 *     url: myXmlUrl.php,
 *     dataType: 'xml',
 *     success: function(responseXML) {
 *        // responseXML is XML document object
 *        var data = $('myElement', responseXML).text();
 *     }
 * };
 * $('#myForm').ajaxSubmit(options);
 * @desc XML data returned from server
 *
 *
 * @example
 * var options = {
 *     resetForm: true
 * };
 * $('#myForm').ajaxSubmit(options);
 * @desc submit form and reset it if successful
 *
 * @example
 * $('#myForm).submit(function() {
 *    $(this).ajaxSubmit();
 *    return false;
 * });
 * @desc Bind form's submit event to use ajaxSubmit
 *
 *
 * @name ajaxSubmit
 * @type jQuery
 * @param options  object literal containing options which control the form submission process
 * @cat Plugins/Form
 * @return jQuery
 */
$.fn.ajaxSubmit = function(options) {
    if (typeof options == 'function')
        options = { success: options };

    options = $.extend({
        url:  this.attr('action') || window.location.toString(),
        type: this.attr('method') || 'GET'
    }, options || {});

    // hook for manipulating the form data before it is extracted;
    // convenient for use with rich editors like tinyMCE or FCKEditor
    var veto = {};
    $.event.trigger('form.pre.serialize', [this, options, veto]);
    if (veto.veto) return this;

    var a = this.formToArray(options.semantic);
    if (options.data) {
        for (var n in options.data)
            a.push( { name: n, value: options.data[n] } );
    }

    // give pre-submit callback an opportunity to abort the submit
    if (options.beforeSubmit && options.beforeSubmit(a, this, options) === false) return this;

    // fire vetoable 'validate' event
    $.event.trigger('form.submit.validate', [a, this, options, veto]);
    if (veto.veto) return this;

    var q = $.param(a);//.replace(/%20/g,'+');

    if (options.type.toUpperCase() == 'GET') {
        options.url += (options.url.indexOf('?') >= 0 ? '&' : '?') + q;
        options.data = null;  // data is null for 'get'
    }
    else
        options.data = q; // data is the query string for 'post'

    var $form = this, callbacks = [];
    if (options.resetForm) callbacks.push(function() { $form.resetForm(); });
    if (options.clearForm) callbacks.push(function() { $form.clearForm(); });

    // perform a load on the target only if dataType is not provided
    if (!options.dataType && options.target) {
        var oldSuccess = options.success || function(){};
        callbacks.push(function(data) {
            if (this.evalScripts)
                $(options.target).attr("innerHTML", data).evalScripts().each(oldSuccess, arguments);
            else // jQuery v1.1.4
                $(options.target).html(data).each(oldSuccess, arguments);
        });
    }
    else if (options.success)
        callbacks.push(options.success);

    options.success = function(data, status) {
        for (var i=0, max=callbacks.length; i < max; i++)
            callbacks[i](data, status, $form);
    };

    // are there files to upload?
    var files = $('input:file', this).fieldValue();
    var found = false;
    for (var j=0; j < files.length; j++)
        if (files[j])
            found = true;

    // options.iframe allows user to force iframe mode
   if (options.iframe || found) {
       // hack to fix Safari hang (thanks to Tim Molendijk for this)
       // see:  http://groups.google.com/group/jquery-dev/browse_thread/thread/36395b7ab510dd5d
       if ($.browser.safari && options.closeKeepAlive)
           $.get(options.closeKeepAlive, fileUpload);
       else
           fileUpload();
       }
   else
       $.ajax(options);

    // fire 'notify' event
    $.event.trigger('form.submit.notify', [this, options]);
    return this;


    // private function for handling file uploads (hat tip to YAHOO!)
    function fileUpload() {
        var form = $form[0];
        var opts = $.extend({}, $.ajaxSettings, options);

        var id = 'jqFormIO' + $.fn.ajaxSubmit.counter++;
        var $io = $('<iframe id="' + id + '" name="' + id + '" />');
        var io = $io[0];
        var op8 = $.browser.opera && window.opera.version() < 9;
        if ($.browser.msie || op8) io.src = 'javascript:false;document.write("");';
        $io.css({ position: 'absolute', top: '-1000px', left: '-1000px' });

        var xhr = { // mock object
            responseText: null,
            responseXML: null,
            status: 0,
            statusText: 'n/a',
            getAllResponseHeaders: function() {},
            getResponseHeader: function() {},
            setRequestHeader: function() {}
        };

        var g = opts.global;
        // trigger ajax global events so that activity/block indicators work like normal
        if (g && ! $.active++) $.event.trigger("ajaxStart");
        if (g) $.event.trigger("ajaxSend", [xhr, opts]);

        var cbInvoked = 0;
        var timedOut = 0;

        // take a breath so that pending repaints get some cpu time before the upload starts
        setTimeout(function() {
            // make sure form attrs are set
            var encAttr = form.encoding ? 'encoding' : 'enctype';
            var t = $form.attr('target');
            $form.attr({
                target:   id,
                method:  'POST',
                action:   opts.url
            });
            form[encAttr] = 'multipart/form-data';

            // support timout
            if (opts.timeout)
                setTimeout(function() { timedOut = true; cb(); }, opts.timeout);

            // add iframe to doc and submit the form
            $io.appendTo('body');
            io.attachEvent ? io.attachEvent('onload', cb) : io.addEventListener('load', cb, false);
            form.submit();
            $form.attr('target', t); // reset target
        }, 10);

        function cb() {
            if (cbInvoked++) return;

            io.detachEvent ? io.detachEvent('onload', cb) : io.removeEventListener('load', cb, false);

            var ok = true;
            try {
                if (timedOut) throw 'timeout';
                // extract the server response from the iframe
                var data, doc;
                doc = io.contentWindow ? io.contentWindow.document : io.contentDocument ? io.contentDocument : io.document;
                xhr.responseText = doc.body ? doc.body.innerHTML : null;
                xhr.responseXML = doc.XMLDocument ? doc.XMLDocument : doc;

                if (opts.dataType == 'json' || opts.dataType == 'script') {
                    var ta = doc.getElementsByTagName('textarea')[0];
                    data = ta ? ta.value : xhr.responseText;
                    if (opts.dataType == 'json')
                        eval("data = " + data);
                    else
                        $.globalEval(data);
                }
                else if (opts.dataType == 'xml') {
                    data = xhr.responseXML;
                    if (!data && xhr.responseText != null)
                        data = toXml(xhr.responseText);
                }
                else {
                    data = xhr.responseText;
                }
            }
            catch(e){
                ok = false;
                $.handleError(opts, xhr, 'error', e);
            }

            // ordering of these callbacks/triggers is odd, but that's how $.ajax does it
            if (ok) {
                opts.success(data, 'success');
                if (g) $.event.trigger("ajaxSuccess", [xhr, opts]);
            }
            if (g) $.event.trigger("ajaxComplete", [xhr, opts]);
            if (g && ! --$.active) $.event.trigger("ajaxStop");
            if (opts.complete) opts.complete(xhr, ok ? 'success' : 'error');

            // clean up
            setTimeout(function() {
                $io.remove();
                xhr.responseXML = null;
            }, 100);
        };

        function toXml(s, doc) {
            if (window.ActiveXObject) {
                doc = new ActiveXObject('Microsoft.XMLDOM');
                doc.async = 'false';
                doc.loadXML(s);
            }
            else
                doc = (new DOMParser()).parseFromString(s, 'text/xml');
            return (doc && doc.documentElement && doc.documentElement.tagName != 'parsererror') ? doc : null;
        };
    };
};
$.fn.ajaxSubmit.counter = 0; // used to create unique iframe ids

/**
 * ajaxForm() provides a mechanism for fully automating form submission.
 *
 * The advantages of using this method instead of ajaxSubmit() are:
 *
 * 1: This method will include coordinates for <input type="image" /> elements (if the element
 *    is used to submit the form).
 * 2. This method will include the submit element's name/value data (for the element that was
 *    used to submit the form).
 * 3. This method binds the submit() method to the form for you.
 *
 * Note that for accurate x/y coordinates of image submit elements in all browsers
 * you need to also use the "dimensions" plugin (this method will auto-detect its presence).
 *
 * The options argument for ajaxForm works exactly as it does for ajaxSubmit.  ajaxForm merely
 * passes the options argument along after properly binding events for submit elements and
 * the form itself.  See ajaxSubmit for a full description of the options argument.
 *
 *
 * @example
 * var options = {
 *     target: '#myTargetDiv'
 * };
 * $('#myForm').ajaxSForm(options);
 * @desc Bind form's submit event so that 'myTargetDiv' is updated with the server response
 *       when the form is submitted.
 *
 *
 * @example
 * var options = {
 *     success: function(responseText) {
 *         alert(responseText);
 *     }
 * };
 * $('#myForm').ajaxSubmit(options);
 * @desc Bind form's submit event so that server response is alerted after the form is submitted.
 *
 *
 * @example
 * var options = {
 *     beforeSubmit: function(formArray, jqForm) {
 *         if (formArray.length == 0) {
 *             alert('Please enter data.');
 *             return false;
 *         }
 *     }
 * };
 * $('#myForm').ajaxSubmit(options);
 * @desc Bind form's submit event so that pre-submit callback is invoked before the form
 *       is submitted.
 *
 *
 * @name   ajaxForm
 * @param  options  object literal containing options which control the form submission process
 * @return jQuery
 * @cat    Plugins/Form
 * @type   jQuery
 */
$.fn.ajaxForm = function(options) {
    return this.ajaxFormUnbind().submit(submitHandler).each(function() {
        // store options in hash
        this.formPluginId = $.fn.ajaxForm.counter++;
        $.fn.ajaxForm.optionHash[this.formPluginId] = options;
        $(":submit,input:image", this).click(clickHandler);
    });
};

$.fn.ajaxForm.counter = 1;
$.fn.ajaxForm.optionHash = {};

function clickHandler(e) {
    var $form = this.form;
    $form.clk = this;
    if (this.type == 'image') {
        if (e.offsetX != undefined) {
            $form.clk_x = e.offsetX;
            $form.clk_y = e.offsetY;
        } else if (typeof $.fn.offset == 'function') { // try to use dimensions plugin
            var offset = $(this).offset();
            $form.clk_x = e.pageX - offset.left;
            $form.clk_y = e.pageY - offset.top;
        } else {
            $form.clk_x = e.pageX - this.offsetLeft;
            $form.clk_y = e.pageY - this.offsetTop;
        }
    }
    // clear form vars
    setTimeout(function() { $form.clk = $form.clk_x = $form.clk_y = null; }, 10);
};

function submitHandler() {
    // retrieve options from hash
    var id = this.formPluginId;
    var options = $.fn.ajaxForm.optionHash[id];
    $(this).ajaxSubmit(options);
    return false;
};

/**
 * ajaxFormUnbind unbinds the event handlers that were bound by ajaxForm
 *
 * @name   ajaxFormUnbind
 * @return jQuery
 * @cat    Plugins/Form
 * @type   jQuery
 */
$.fn.ajaxFormUnbind = function() {
    this.unbind('submit', submitHandler);
    return this.each(function() {
        $(":submit,input:image", this).unbind('click', clickHandler);
    });

};

/**
 * formToArray() gathers form element data into an array of objects that can
 * be passed to any of the following ajax functions: $.get, $.post, or load.
 * Each object in the array has both a 'name' and 'value' property.  An example of
 * an array for a simple login form might be:
 *
 * [ { name: 'username', value: 'jresig' }, { name: 'password', value: 'secret' } ]
 *
 * It is this array that is passed to pre-submit callback functions provided to the
 * ajaxSubmit() and ajaxForm() methods.
 *
 * The semantic argument can be used to force form serialization in semantic order.
 * This is normally true anyway, unless the form contains input elements of type='image'.
 * If your form must be submitted with name/value pairs in semantic order and your form
 * contains an input of type='image" then pass true for this arg, otherwise pass false
 * (or nothing) to avoid the overhead for this logic.
 *
 * @example var data = $("#myForm").formToArray();
 * $.post( "myscript.cgi", data );
 * @desc Collect all the data from a form and submit it to the server.
 *
 * @name formToArray
 * @param semantic true if serialization must maintain strict semantic ordering of elements (slower)
 * @type Array<Object>
 * @cat Plugins/Form
 */
$.fn.formToArray = function(semantic) {
    var a = [];
    if (this.length == 0) return a;

    var form = this[0];
    var els = semantic ? form.getElementsByTagName('*') : form.elements;
    if (!els) return a;
    for(var i=0, max=els.length; i < max; i++) {
        var el = els[i];
        var n = el.name;
        if (!n) continue;

        if (semantic && form.clk && el.type == "image") {
            // handle image inputs on the fly when semantic == true
            if(!el.disabled && form.clk == el)
                a.push({name: n+'.x', value: form.clk_x}, {name: n+'.y', value: form.clk_y});
            continue;
        }

        var v = $.fieldValue(el, true);
        if (v && v.constructor == Array) {
            for(var j=0, jmax=v.length; j < jmax; j++)
                a.push({name: n, value: v[j]});
        }
        else if (v !== null && typeof v != 'undefined')
            a.push({name: n, value: v});
    }

    if (!semantic && form.clk) {
        // input type=='image' are not found in elements array! handle them here
        var inputs = form.getElementsByTagName("input");
        for(var i=0, max=inputs.length; i < max; i++) {
            var input = inputs[i];
            var n = input.name;
            if(n && !input.disabled && input.type == "image" && form.clk == input)
                a.push({name: n+'.x', value: form.clk_x}, {name: n+'.y', value: form.clk_y});
        }
    }
    return a;
};


/**
 * Serializes form data into a 'submittable' string. This method will return a string
 * in the format: name1=value1&amp;name2=value2
 *
 * The semantic argument can be used to force form serialization in semantic order.
 * If your form must be submitted with name/value pairs in semantic order then pass
 * true for this arg, otherwise pass false (or nothing) to avoid the overhead for
 * this logic (which can be significant for very large forms).
 *
 * @example var data = $("#myForm").formSerialize();
 * $.ajax('POST', "myscript.cgi", data);
 * @desc Collect all the data from a form into a single string
 *
 * @name formSerialize
 * @param semantic true if serialization must maintain strict semantic ordering of elements (slower)
 * @type String
 * @cat Plugins/Form
 */
$.fn.formSerialize = function(semantic) {
    //hand off to jQuery.param for proper encoding
    return $.param(this.formToArray(semantic));
};


/**
 * Serializes all field elements in the jQuery object into a query string.
 * This method will return a string in the format: name1=value1&amp;name2=value2
 *
 * The successful argument controls whether or not serialization is limited to
 * 'successful' controls (per http://www.w3.org/TR/html4/interact/forms.html#successful-controls).
 * The default value of the successful argument is true.
 *
 * @example var data = $("input").formSerialize();
 * @desc Collect the data from all successful input elements into a query string
 *
 * @example var data = $(":radio").formSerialize();
 * @desc Collect the data from all successful radio input elements into a query string
 *
 * @example var data = $("#myForm :checkbox").formSerialize();
 * @desc Collect the data from all successful checkbox input elements in myForm into a query string
 *
 * @example var data = $("#myForm :checkbox").formSerialize(false);
 * @desc Collect the data from all checkbox elements in myForm (even the unchecked ones) into a query string
 *
 * @example var data = $(":input").formSerialize();
 * @desc Collect the data from all successful input, select, textarea and button elements into a query string
 *
 * @name fieldSerialize
 * @param successful true if only successful controls should be serialized (default is true)
 * @type String
 * @cat Plugins/Form
 */
$.fn.fieldSerialize = function(successful) {
    var a = [];
    this.each(function() {
        var n = this.name;
        if (!n) return;
        var v = $.fieldValue(this, successful);
        if (v && v.constructor == Array) {
            for (var i=0,max=v.length; i < max; i++)
                a.push({name: n, value: v[i]});
        }
        else if (v !== null && typeof v != 'undefined')
            a.push({name: this.name, value: v});
    });
    //hand off to jQuery.param for proper encoding
    return $.param(a);
};


/**
 * Returns the value(s) of the element in the matched set.  For example, consider the following form:
 *
 *  <form><fieldset>
 *      <input name="A" type="text" />
 *      <input name="A" type="text" />
 *      <input name="B" type="checkbox" value="B1" />
 *      <input name="B" type="checkbox" value="B2"/>
 *      <input name="C" type="radio" value="C1" />
 *      <input name="C" type="radio" value="C2" />
 *  </fieldset></form>
 *
 *  var v = $(':text').fieldValue();
 *  // if no values are entered into the text inputs
 *  v == ['','']
 *  // if values entered into the text inputs are 'foo' and 'bar'
 *  v == ['foo','bar']
 *
 *  var v = $(':checkbox').fieldValue();
 *  // if neither checkbox is checked
 *  v === undefined
 *  // if both checkboxes are checked
 *  v == ['B1', 'B2']
 *
 *  var v = $(':radio').fieldValue();
 *  // if neither radio is checked
 *  v === undefined
 *  // if first radio is checked
 *  v == ['C1']
 *
 * The successful argument controls whether or not the field element must be 'successful'
 * (per http://www.w3.org/TR/html4/interact/forms.html#successful-controls).
 * The default value of the successful argument is true.  If this value is false the value(s)
 * for each element is returned.
 *
 * Note: This method *always* returns an array.  If no valid value can be determined the
 *       array will be empty, otherwise it will contain one or more values.
 *
 * @example var data = $("#myPasswordElement").fieldValue();
 * alert(data[0]);
 * @desc Alerts the current value of the myPasswordElement element
 *
 * @example var data = $("#myForm :input").fieldValue();
 * @desc Get the value(s) of the form elements in myForm
 *
 * @example var data = $("#myForm :checkbox").fieldValue();
 * @desc Get the value(s) for the successful checkbox element(s) in the jQuery object.
 *
 * @example var data = $("#mySingleSelect").fieldValue();
 * @desc Get the value(s) of the select control
 *
 * @example var data = $(':text').fieldValue();
 * @desc Get the value(s) of the text input or textarea elements
 *
 * @example var data = $("#myMultiSelect").fieldValue();
 * @desc Get the values for the select-multiple control
 *
 * @name fieldValue
 * @param Boolean successful true if only the values for successful controls should be returned (default is true)
 * @type Array<String>
 * @cat Plugins/Form
 */
$.fn.fieldValue = function(successful) {
    for (var val=[], i=0, max=this.length; i < max; i++) {
        var el = this[i];
        var v = $.fieldValue(el, successful);
        if (v === null || typeof v == 'undefined' || (v.constructor == Array && !v.length))
            continue;
        v.constructor == Array ? $.merge(val, v) : val.push(v);
    }
    return val;
};

/**
 * Returns the value of the field element.
 *
 * The successful argument controls whether or not the field element must be 'successful'
 * (per http://www.w3.org/TR/html4/interact/forms.html#successful-controls).
 * The default value of the successful argument is true.  If the given element is not
 * successful and the successful arg is not false then the returned value will be null.
 *
 * Note: If the successful flag is true (default) but the element is not successful, the return will be null
 * Note: The value returned for a successful select-multiple element will always be an array.
 * Note: If the element has no value the return value will be undefined.
 *
 * @example var data = jQuery.fieldValue($("#myPasswordElement")[0]);
 * @desc Gets the current value of the myPasswordElement element
 *
 * @name fieldValue
 * @param Element el The DOM element for which the value will be returned
 * @param Boolean successful true if value returned must be for a successful controls (default is true)
 * @type String or Array<String> or null or undefined
 * @cat Plugins/Form
 */
$.fieldValue = function(el, successful) {
    var n = el.name, t = el.type, tag = el.tagName.toLowerCase();
    if (typeof successful == 'undefined') successful = true;

    if (successful && (!n || el.disabled || t == 'reset' || t == 'button' ||
        (t == 'checkbox' || t == 'radio') && !el.checked ||
        (t == 'submit' || t == 'image') && el.form && el.form.clk != el ||
        tag == 'select' && el.selectedIndex == -1))
            return null;

    if (tag == 'select') {
        var index = el.selectedIndex;
        if (index < 0) return null;
        var a = [], ops = el.options;
        var one = (t == 'select-one');
        var max = (one ? index+1 : ops.length);
        for(var i=(one ? index : 0); i < max; i++) {
            var op = ops[i];
            if (op.selected) {
                // extra pain for IE...
                var v = $.browser.msie && !(op.attributes['value'].specified) ? op.text : op.value;
                if (one) return v;
                a.push(v);
            }
        }
        return a;
    }
    return el.value;
};


/**
 * Clears the form data.  Takes the following actions on the form's input fields:
 *  - input text fields will have their 'value' property set to the empty string
 *  - select elements will have their 'selectedIndex' property set to -1
 *  - checkbox and radio inputs will have their 'checked' property set to false
 *  - inputs of type submit, button, reset, and hidden will *not* be effected
 *  - button elements will *not* be effected
 *
 * @example $('form').clearForm();
 * @desc Clears all forms on the page.
 *
 * @name clearForm
 * @type jQuery
 * @cat Plugins/Form
 */
$.fn.clearForm = function() {
    return this.each(function() {
        $('input,select,textarea', this).clearFields();
    });
};

/**
 * Clears the selected form elements.  Takes the following actions on the matched elements:
 *  - input text fields will have their 'value' property set to the empty string
 *  - select elements will have their 'selectedIndex' property set to -1
 *  - checkbox and radio inputs will have their 'checked' property set to false
 *  - inputs of type submit, button, reset, and hidden will *not* be effected
 *  - button elements will *not* be effected
 *
 * @example $('.myInputs').clearFields();
 * @desc Clears all inputs with class myInputs
 *
 * @name clearFields
 * @type jQuery
 * @cat Plugins/Form
 */
$.fn.clearFields = $.fn.clearInputs = function() {
    return this.each(function() {
        var t = this.type, tag = this.tagName.toLowerCase();
        if (t == 'text' || t == 'password' || tag == 'textarea')
            this.value = '';
        else if (t == 'checkbox' || t == 'radio')
            this.checked = false;
        else if (tag == 'select')
            this.selectedIndex = -1;
    });
};


/**
 * Resets the form data.  Causes all form elements to be reset to their original value.
 *
 * @example $('form').resetForm();
 * @desc Resets all forms on the page.
 *
 * @name resetForm
 * @type jQuery
 * @cat Plugins/Form
 */
$.fn.resetForm = function() {
    return this.each(function() {
        // guard against an input with the name of 'reset'
        // note that IE reports the reset function as an 'object'
        if (typeof this.reset == 'function' || (typeof this.reset == 'object' && !this.reset.nodeType))
            this.reset();
    });
};


/**
 * Enables or disables any matching elements.
 *
 * @example $(':radio').enabled(false);
 * @desc Disables all radio buttons
 *
 * @name select
 * @type jQuery
 * @cat Plugins/Form
 */
$.fn.enable = function(b) {
    if (b == undefined) b = true;
    return this.each(function() {
        this.disabled = !b
    });
};

/**
 * Checks/unchecks any matching checkboxes or radio buttons and
 * selects/deselects and matching option elements.
 *
 * @example $(':checkbox').selected();
 * @desc Checks all checkboxes
 *
 * @name select
 * @type jQuery
 * @cat Plugins/Form
 */
$.fn.select = function(select) {
    if (select == undefined) select = true;
    return this.each(function() {
        var t = this.type;
        if (t == 'checkbox' || t == 'radio')
            this.checked = select;
        else if (this.tagName.toLowerCase() == 'option') {
            var $sel = $(this).parent('select');
            if (select && $sel[0] && $sel[0].type == 'select-one') {
                // deselect all other options
                $sel.find('option').select(false);
            }
            this.selected = select;
        }
    });
};

})(jQuery);
/**
 * This function allows the binding of certain functions to a user defined key combination.
 * similar to the accesskey property of the hyperlinks.
 *
 * Heavily based upon the code:
 * http://www.openjs.com/scripts/events/keyboard_shortcuts/shortcuts.js
 *
 * Port made to jQuery, code cleaned up and improved performance.
 *
 *
 * The following code fires the  "sCombi" when "fCallback" is pressed on this element,
 * and bPropagate(s) if needed.
 *
 * @example $('input#someid').accesskey(sCombi, fCallback, bPropagate);
 *
 * @name                        accesskey
 * @type                        jQuery
 * @param String        The combination to check for.
 * @param Function  The callback to fire when the combination matches.
 * @param Boolean       Wether we need to propagate or just continue.
 * @cat Plugins/UI
 */
(function($) {
    //
    // Helper object
    $.accesskey = {
        aShiftKeys: {           // Workaround for Shift key bug created by using lowercase - as a result the shift+num combination was broken
                "`": "~",
                "1": "!",
                "2": "@",
                "3": "#",
                "4": "$",
                "5": "%",
                "6": "^",
                "7": "&",
                "8": "*",
                "9": "(",
                "0": ")",
                "-": "_",
                "=": "+",
                ";": ": ",
                "'": "\"",
                ",": "<",
                ".": ">",
                "/": "?",
                "\\": "|"
            },
        aSpecialKeys: {     // Holds the array of the specialkeys
                'esc': 27,
                'escape': 27,
                'tab': 9,
                'space': 32,
                'return': 13,
                'enter': 13,
                'backspace': 8,
                'scrolllock': 145,
                'capslock': 20,
                'numlock': 144,
                'pause': 19,
                'break': 19,
                'insert': 45,
                'home': 36,
                'delete': 46,
                'end': 35,
                'pageup': 33,
                'pagedown': 34,
                'left': 37,
                'up': 38,
                'right': 39,
                'down': 40,
                'f1': 112,
                'f2': 113,
                'f3': 114,
                'f4': 115,
                'f5': 116,
                'f6': 117,
                'f7': 118,
                'f8': 119,
                'f9': 120,
                'f10': 121,
                'f11': 122,
                'f12': 123
            },
        fCallback: null,
        oEvent: null
    };

    // Actual code:
    $.fn.accesskey = function(sCombi, fCallback, bPropagate) {
        //
        // Split the combination to check for
        var aKeys = sCombi.toLowerCase().split('+');

        // Assign keydown function
        $(this).keydown(function(oEvent) {
                // Get information from event
                var iKey = oEvent.charCode ? oEvent.charCode : oEvent.keyCode ? oEvent.keyCode : -1;
                var sKey = String.fromCharCode(iKey).toLowerCase();

                //
                // Test to see if the combination matches
                var iMatch = 0;
                for(var iCurrent=0; iCurrent<aKeys.length; iCurrent++) {
                    sCurrent = aKeys[iCurrent];

                    // Test modifiers
                    if ((sCurrent == 'ctrl' || sCurrent == 'control') && (oEvent.ctrlKey)) {
                        iMatch++;
                    } else if ((sCurrent == 'shift') && (oEvent.shiftKey)) {
                        iMatch++;
                    } else if ((sCurrent == 'alt') && (oEvent.altKey)) {
                        iMatch++;
                    } else if ((sCurrent.length > 1) && ($.accesskey.aSpecialKeys[sCurrent] == iKey)) {
                        iMatch++;                                           // Special key!
                    } else if (sKey == sCurrent) {
                        iMatch++;                                           // Normal key!
                    } else if (($.accesskey.aShiftKeys[sCurrent] && e.shiftKey) && ($.accesskey.aShiftKeys[sCurrent] == sCurrent)) {
                        iMatch++;                                           // Stupid Shift key bug created by using lowercase
                    }
                }

                //
                // If the keycount matches, there is a match
                if (iMatch == aKeys.length) {
                        // If we want to stop the "default" behaviour, e.g. ctrl+s to display "Save As.." dialog,
                        // we (only) have to trigger the function in a timer, and return "false" to stop the event.
                        // jQuery handles the rest internally.
                        if (!bPropagate) {
                            //
                            // Assign temp variables
                            $.accesskey.fCallback = fCallback;
                            $.accesskey.oEvent = oEvent;

                            //
                            // Trigger the event in a timer, and reset the temp variables
                            window.setTimeout("$.accesskey.fCallback($.accesskey.oEvent); $.accesskey.fCallback = null; $.accesskey.oEvent = null;", 50);

                            //
                            // Always return false
                            return false;
                        } else {
                            //
                            // Process the callback
                            return fCallback(oEvent);
                        }
                }
            });
    };

})(jQuery);