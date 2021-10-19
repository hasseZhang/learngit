var PAGE_NAME = "listPage";
// homeMarquee为null不加载header的订购广告位
var homeMarquee = null;
var isInitMap = {
    list : false,
    listTj : false
}
var currentRow = 1;
var totolRow = 0;
var isFirstLoad = true;
var isKm = false;
var page = function() {
    var TYPE = $.page.type;
    var isHasHead = true;
    if (/TTXB/.test(TYPE)) {
        isHasHead = false;
    }
    if (/YK_/.test(TYPE)) {
        isKm = true;
    }
    var header = $.pTool.get("header");
    var renderHeader = function(activeKey) {
        if(isKm){
            header.init({
                isKm: true,
                isHasTime:true,
                custom: "",
                leaveHeader: function() {
                    $.pTool.active(page.upPlug);
                },
                activeKey: activeKey
            });
        }else{
            header.init({
                isList: true,
                custom: "",
                leaveHeader: function() {
                    $.pTool.active(page.upPlug);
                },
                activeKey: activeKey
            });
        }
      
    };
    var savePageInfo = function() {
        var info = {
            menu: menu.getState(),
            list: list.getState(),
            listTj: listTj.getInfo(),
            header: header.getInfo(),
            currentRow:currentRow,
            page: {
                upPlug: page.upPlug
            }
        };
        $.savePageInfo(PAGE_NAME, info);
    };
    var initPageInfo = function() {
        var info = $.initPageInfo(PAGE_NAME, [ "menu", "list", "listTj", "header", "page","currentRow" ], {
            menu: {
                isActive: true,
                first: 0,
                second: 0
            },
            list: {
                isActive: false,
                firstLineIndex: 0,
                focusIndex: 0
            },
            listTj: {
                isActive: false,
                activeNum : 0,
                moduleIndex: 0,
                picIndex: 0,
                module27Info :{}
            },
            header: header.getInfo(),
            page: {
                upPlug: "p_menu",
                upFocus: {
                    el: "#s_li0"
                }
            },
            currentRow:1
        });
        return info;
    };
    var up = function() {
        if (!isHasHead) {
            return
        }
        // 通用列表页
        if (list.getState().firstLineIndex && !list.getStyle().noHeader) {
            $.pTool.active("header");
        }
        page.upFocus = $.activeObj;
        $.pTool.active("header");
    };
    function init() {
        if (!$("#content").length) {
            var $content = $('<div id="content"></div>');
            $content.appendTo($("body"));
            $('<div class="viewEl"></div>').appendTo($content);
            $('<div id="loading" class="hide"></div>').appendTo($content);
            $('<div id="noData" class="hide">暂无节目,敬请期待中!</div>').appendTo($content);
            $('<div id="progressBar"><div id="strip"></div></div>').appendTo($content);
            var $video;
            var nowModule;
            $content[0].addEventListener("transitionend", function(e) {
                if (!$video) {
                    $video = $("#video.noPlayer");
                    if (!$video.length) {
                        $video = null;
                    }
                }
                nowModule = list.getStyle();
                if ($video && e.target.id === "content" && nowModule.vl && nowModule.vl.mp) {
                    if ($content.hasClass("contentMoveR")) {
                        nowModule.vl.mp.size(true, 599, 251, 996, 560);
                    } else {
                        nowModule.vl.mp.size(true, 378, 251, 996, 560);
                    }
                    $video.removeClass("noPlayer");
                    nowModule.vl.show();
                }
            });
        }
        if (!$("#pageNum").length) {
            $('<div id="pageNum"></div>').appendTo($("body"));
        }
        if (!$("#pageTotalRow").length) {
            $('<div id="pageTotalRow" class="hide"></div>').appendTo($("body"));
        }
    }
    return {
        renderHeader: renderHeader,
        savePageInfo: savePageInfo,
        initPageInfo: initPageInfo,
        up: up,
        header: header,
        init: init,
        isHasHead: isHasHead
    };
}();

function load() {
    page.init();
    var pageInfo = page.initPageInfo();
    page.upPlug = pageInfo.page.upPlug;
    page.upFocus = pageInfo.page.upFocus;
    currentRow = pageInfo.currentRow;
    page.renderHeader(pageInfo.header.activeKey);
    if (!page.isHasHead) {
        $.pTool.get("header").hide();
    }
    if ($.isBack && pageInfo.header.isActive) {
        pageInfo.list.firstLineIndex = 0;
        pageInfo.list.focusIndex = 0;
    }
    var menuCon = {
        right: function(opt) {
            if(opt.style === 'tj'){
                $.pTool.active("p_listTj");
            }else if(list.getTotal()){
                $.pTool.active("p_list");
            }
        },
        up: function() {
            page.upPlug = "p_menu";
            page.up();
        },
        updateCallBack: function(opt) {     
            clearListDom();
            if(opt.style === 'tj'){
                baseCon.activeNum = 0;
                baseCon.moduleIndex = 0;
                baseCon.picIndex = 0;
                baseCon.module27Info = {};
                if (!isInitMap.listTj) {
                    listTj.init($.UTIL.merge(opt, baseCon));
                    isInitMap.listTj = true;
                } else {
                    listTj.render(opt);
                }
            }else {
                if (!isInitMap.list) {
                    list.init($.UTIL.merge(opt, baseCon));
                    isInitMap.list = true;
                } else {
                    list.resetFocus();
                    list.render(opt);
                }
            }
        },
        move: function(dir) {
            var style = list.getStyle();
            var isMove = style.isMove;
            if (isMove) {
                style.move(dir);
            }
        }
    };
    var menuInfo = menu.init($.UTIL.merge(menuCon, pageInfo.menu));
    var firstLoad = function() {
        if (!isFirstLoad) {
            return;
        }
        isFirstLoad = false;
        if (pageInfo.menu.isActive) {
            $.pTool.active("p_menu");
            return;
        }
        if (pageInfo.list.isActive) {
            $.pTool.active("p_list");
            menu.blur();
            return;
        }
        if (pageInfo.listTj.isActive) {
            $.pTool.active("p_listTj");
            menu.blur();
            return;
        }
        if (pageInfo.header.isActive) {
            $.pTool.active("header");
            menu.blur();
            return;
        }
        $.pTool.active("p_menu");
    };
    function clearListDom() {
        list.clearListDom();
        listTj.clearListDom();
    }
    var baseCon = {
        up: function(opt) {
            page.upPlug = "p_list";
            page.up(opt);
        },
        left: function() {
            $.pTool.active("p_menu");
        },
        renderListAfter: function() {
            if ($.page.type === "XXTY") {
                $("#progressBar").hide();
                list.renderShowLine();
            } else {
                if (menuInfo.style === "tyty") {
                    list.renderShowLine();
                } else {
                    list.renderPageNum(menu.getCurrentName());
                }
            }
            menu.addCur();
        },
        updateAfter: function(info, noHeader) {
            if (page.isHasHead) {
                page.header.show();
            }
            if (noHeader) {
                return;
            }
        },
        firstLoad: firstLoad,
        error: listError,
        firstLineIndex: pageInfo.list.firstLineIndex,
        focusIndex: pageInfo.list.focusIndex,
        isLeaveList: pageInfo.list.isLeaveList,
        activeNum: pageInfo.listTj.activeNum,
        moduleIndex: pageInfo.listTj.moduleIndex,
        picIndex: pageInfo.listTj.picIndex,
        module27Info:pageInfo.listTj.module27Info,
        listTjActive: !!pageInfo.listTj.isActive,
        // tab: pageInfo.list.tab,
        // sx_moveOnOff: pageInfo.list.sx_moveOnOff,
        listTjUp: function() {
            page.upPlug = "p_listTj";
        }
    };
    var listCon = $.UTIL.merge(menuInfo, baseCon);
    function listError() {
        if (page.isHasHead) {
            page.header.show();
        }
        if (!menu.getState().isActive && !page.header.getInfo().isActive) {
            $.pTool.active("p_menu");
        }
    }
    if(listCon.style === 'tj'){
        listTj.init(listCon);
        isInitMap.listTj = true;
    }else {
        list.init(listCon);
        isInitMap.list = true;
    }
    menu.addTransition();
}

function unload() {
    page.savePageInfo();
    if (list.getStyle() && list.getStyle().destroy) {
        list.getStyle().destroy();
    }
}
