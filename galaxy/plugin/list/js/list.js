var list = function() {
    function getStyle() {
        return listModule.getListStyle();
    }
    function clearListDom() {
        if ($("#content .viewEL").length) {
            $("#content .viewEL").remove();
            return;
        }
        if ($("#content .listContent").length) {
            $(".listContent", "#content", true).remove();
        }
        if ($("#content .tabWrap").length) {
            $(".tabWrap", "#content", true).remove();
        }
        // if ($("#content .listContent").length) {
        //     $(".listContent", "#content", true).remove();
        // }
    }
    function _renderListBefore() {
        getStyle() && getStyle().destroy && getStyle().destroy();
        var progressBar = $("#content #progressBar");
        var loading = $("#content #loading");
        var strip = '<div id="strip"></div>';
        progressBar.hide().html(strip);
        $("#pageNum").hide();
        // $("#pageTotalRow").hide();
        $("#noData").hide();
        loading.show();
    }
    function _renderPageNum(curName) {
        if (!listModule.getCon().id) {
            return;
        }
        if(isKm){
            totolRow = Math.ceil(listModule.getCon().total / listModule.getListStyle().columnSize) || '';
            $("#pageTotalRow").show().html(currentRow +'/'+ totolRow + '行')
        }else{
            var last = listModule.getCon().id.length === 32 ? "部" : "个";
            $("#pageNum").show().html(curName + listModule.getCon().total + last)
        }
    }
    function getKeysMap() {
        return listModule.getKeysMap();
    }
    function p_list() {
        var key = "p_list";
        var keysMap = {
            KEY_DOWN: function() {
                getKeysMap().down();
                return true;
            },
            KEY_LEFT: function() {
                getKeysMap().left();
                return true;
            },
            KEY_RIGHT: function() {
                getKeysMap().right();
                return true;
            },
            KEY_UP: function() {
                getKeysMap().up();
                return true;
            },
            KEY_PAGEDOWN: function() {
                getKeysMap().pageDown();
                return true;
            },
            KEY_PAGEUP: function() {
                getKeysMap().pageUp();
                return true;
            },
            KEY_OK: function() {
                getKeysMap().ok();
                return true;
            }
        };
        return {
            key: key,
            keysMap: keysMap,
            active: _active,
            deactive: deacitve,
            cover: function() {
                return true;
            },
            uncover: function() {
                return true;
            }
        };
    }
    function deacitve() {
        var m = getStyle();
        m.deactive && m.deactive();
    }
    function init(opt) {
        $.pTool.add("p_list", p_list());
        listModule.init(opt);
    }
    function _render(opt) {
        _renderListBefore();
        listModule.initCon(opt);
        var m = getStyle();
        if (!m.render) {
            return;
        }
        m.render();
    }
    function _active() {
        var nowStyle = getStyle();
        listModule.changeActive();
        nowStyle.active();
    }
    function _getState() {
        var m = listModule.getCon();
        var state = {
            firstLineIndex: m.firstLineIndex || 0,
            isActive: m.isActive,
            focusIndex: m.focusIndex
        };
        return state;
    }
    return {
        init: init,
        active: _active,
        resetFocus: listModule.resetCon,
        renderPageNum: _renderPageNum,
        render: _render,
        getState: _getState,
        getStyle: listModule.getListStyle,
        getTotal: function() {
            return listModule.getCon().total;
        },
        clearListDom:clearListDom
    };
}();