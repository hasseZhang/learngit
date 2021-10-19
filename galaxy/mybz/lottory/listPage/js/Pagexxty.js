var PAGE_NAME = "listPage";
var page = (function () {
    var TYPE = $.page.type;
    var isHasHead = true;
    if(/TTXB|XXTY/.test(TYPE)){
        isHasHead  = false;
    }
    var header = $.pTool.get("header");
    var renderHeader = function (activeKey) {
        header.init({
            isList:true,
            custom:'',
            leaveHeader:function () {
                $.pTool.active(page.upPlug);
            },
            activeKey:activeKey
        });
    };
    var savePageInfo = function () {
        var info = {
            menu:menu.getState(),
            list:list.getState(),
            header:header.getInfo(),
            page:{
                upPlug : page.upPlug
            }
        };
        $.savePageInfo(PAGE_NAME,info);
    };
    var initPageInfo = function () {
        var info = $.initPageInfo(PAGE_NAME,["menu","list","header","page"],{
            menu:{
                isActive : true,
                first:0,
                second:0
            },
            list:{
                isActive : false,
                firstLineIndex:0,
                focusIndex:0
            },
            header:header.getInfo(),
            page:{
                upPlug : "p_menu",
                upFocus: {
                    el:"#s_li0"
                }
            }
        });
        return info;
    };
    var up = function () {
        if(!isHasHead){
            return;
        }
        if(list.getState().firstLineIndex && !list.getStyle().noHeader){
            return;
        }
        page.upFocus = $.activeObj;
        $.pTool.active("header");
    };
    function init() {
        if(!$("#content").length){
            var $content= $('<div id="content"></div>');
            $content.appendTo($("body"));
            $('<div class="viewEl"></div>').appendTo($content);
            $('<div id="loading" class="hide"></div>').appendTo($content);
            $('<div id="noData" class="hide">暂无节目,敬请期待中!</div>').appendTo($content);
            $('<div id="progressBar" class="hide"><div id="strip"></div></div>').appendTo($content);
            var $video;
            var nowModule;
            $content[0].addEventListener("transitionend",function(e){
                if(!$video){
                    $video = $("#video.noPlayer");
                    if(!$video.length){
                        $video = null;
                    }
                }
                nowModule = list.getStyle();            
                if( $video && e.target.id === 'content' && nowModule.vl && nowModule.vl.mp){
                    if($content.hasClass("contentMoveR")){
                        nowModule.vl.mp.size(true,599,251,996,560);
                    }else if($content.hasClass("xxty")){
                        nowModule.vl.mp.size(true,323,269,945,533);
                    }else{
                        nowModule.vl.mp.size(true,378,251,996,560);
                    }

                    $video.removeClass("noPlayer");
                    nowModule.vl.show();
                }
            });
        }
        if(!$("pageNum").length){
            $('<div id="pageNum"></div>').appendTo($("body"));
        }
    }
    return{
        renderHeader:renderHeader,
        savePageInfo:savePageInfo,
        initPageInfo:initPageInfo,
        up:up,
        header:header,
        init:init,
        isHasHead:isHasHead
    };
})();
function load() {
    page.init();
    var pageInfo = page.initPageInfo();
    page.upPlug = pageInfo.page.upPlug;
    page.upFocus = pageInfo.page.upFocus;
    page.renderHeader(pageInfo.header.activeKey);
    if(!page.isHasHead){
        $.pTool.get("header").hide();
    }
    if($.isBack && pageInfo.header.isActive){
        pageInfo.list.firstLineIndex = 0;
        pageInfo.list.focusIndex = 0;
    }
    var menuCon = {
        right:function () {
            if(!list.getTotal()){
                return;
            }
            $.pTool.active("p_list");
        },
        up:function () {
            page.upPlug = "p_menu";
            page.up();
            
        },
        updateCallBack:function (opt) {
            renderBg(opt.style,opt.bg,opt.vodBg);
            list.resetFocus();
            list.render(opt);
        },
        move:function (dir) {
            var style = list.getStyle()
            var isMove = style.isMove;
            if(isMove){
                style.move(dir);
            }
        }
    };
    var menuInfo = menu.init(menuCon);
    renderBg(menuInfo.style,menuInfo.bg,menuInfo.vodBg);
    var firstLoad = function () {
        if(pageInfo.menu.isActive){
            $.pTool.active("p_menu");
            return;
        };
        if(pageInfo.list.isActive){
            $.pTool.active("p_list");
            menu.blur();
            return;
        };
        if(pageInfo.header.isActive){
            $.pTool.active("header");
            menu.blur();
            return;
        }
        $.pTool.active("p_menu");
    };
    var listCon = $.UTIL.merge(menuInfo,{
        up:function () {
            page.upPlug = "p_list";
            page.up();
        },
        left:function () {
            $.pTool.active("p_menu");
        },
        renderListAfter:function () {
            if ($.page.type === 'XXTY') {
                $("#progressBar").hide();
                list.renderShowLine();
            } else {
                list.renderPageNum(menu.getCurrentName());
            };
            menu.addCur();
        },
        updateAfter:function (info,noHeader) {
            if(page.isHasHead){
                page.header.show();
            }
            if(noHeader){
                return;
            }
            if(info.firstLineIndex > 0){
                page.header.hide();
                return;
            }

        },
        firstLoad:firstLoad,
        error :listError,
        firstLineIndex:pageInfo.list.firstLineIndex,
        focusIndex:pageInfo.list.focusIndex
    });
    function listError() {
        if(page.isHasHead){
            page.header.show();
        }
        if(!menu.getState().isActive && !page.header.getInfo().isActive){
            $.pTool.active("p_menu");
        }
    }
    list.init(listCon);
    menu.addTransition();
}

var renderBg = (function() {
    var $content = null;
    var lastPath = '';
    return function(style,path,vodPath){
        if(!$content){
            $content = $("#content");
        }
        if((style == 3) ||(style == 'xxty2' && !vodPath)|| !path){
            lastPath = '';
            $content[0].style.removeProperty("background");
        }else{
            if(style == 'xxty2'){
                lastPath = vodPath;
                $content.css("background", 'url("' + lastPath + '") no-repeat top right');
                return;
            }
            if(lastPath != path){
                lastPath = path;
                $content.css("background", 'url("' + lastPath + '") no-repeat top right');
            }
        }
    };
})();
function unload() {
    page.savePageInfo();
    if(list.getStyle().destroy){
        list.getStyle().destroy();
    }

}
