var email = function() {
    var maxSize = 100;
    var editActive = false;
    var $listContent = null;
    var $emailList = null;
    var $mostShow = null;
    var $progressBar = null,
    $strip = null,
    $panel = null,
    $leftBtn = null,
    $rightBtn = null,
    $panelTitle = null;
    var $noContent = null,
    $loading = null;
    var panelKeys = ["#leftBtn", "#rightBtn"];
    var cfg = {
        pre: "email_item",
        focusIndex: 0,
        firstLineIndex: 0,
        lineHeight: 132,
        showLine: 7,
        shadowLine: 1,
        columnSize: 1,
        data: [],
        focusArr: [],
        total: 0,
        maxSize: maxSize,
        isActive: false,
        panel: {
            title: "删除消息?",
            delTitle: "确定清空全部消息?",
            delAll: delAll,
            delOne: delOne
        },
        ok: function(d) {
            $.s.email.read({
                id: d._id
            },
            {
                success: function(res) {
                    if (res.code) {
                        var url = $.getVariable("EPG:pathRes") + "/mybz/email/class/?id=" + d.emailId + "&userEmailId=" + d._id;
                        $.forward(url)
                    }
                },
                error: function() {}
            })
        },
        lock: false
    };
    function _init(opt) {
        cfg.firstLineIndex = opt.firstLineIndex || 0;
        cfg.afterLoadData = opt.afterLoadData;
        cfg.focusIndex = opt.focusIndex || 0;
        cfg.left = opt.left ||
        function() {};
        email.focus = opt.focus || "";
        $emailList = $("#listContent .emailList");
        $listContent = $("#listContent");
        $progressBar = $("#progressBar");
        $strip = $("#progressBar #strip");
        $panel = $(".panel");
        $noContent = $("#noContent");
        $loading = $("#loading");
        $leftBtn = $(".panel " + panelKeys[0]);
        $rightBtn = $(".panel " + panelKeys[1]);
        $panelTitle = $(".panel .title")
    }
    function _initCfg(type) {
        cfg.type = type;
        loadShow();
        $.s.email.count(null, {
            success: function(r) {
                if (r && r.code) {
                    getData()
                }
            },
            error: function() {
                getData()
            }
        })
    }
    function getData(callback) {
        $.s.email.all({
            beginNum: 0,
            endNum: maxSize
        },
        {
            success: function(res) {
                cfg.total = res.allEmailCount > maxSize ? maxSize: res.allEmailCount;
                cfg.data = res.data || [];
                if (cfg.total) {
                    renderList()
                }
                aotuShowNoContent();
                loadHide();
                progress();
                $.UTIL.apply(cfg.afterLoadData)
            },
            error: function() {
                cfg.total = 0;
                cfg.data = [];
                aotuShowNoContent();
                loadHide();
                $.UTIL.apply(cfg.error)
            }
        })
    }
    function loadShow() {
        $noContent.hide();
        $loading.show()
    }
    function loadHide() {
        $loading.hide()
    }
    function clearPanel() {
        if ($emailList.length) {
            $emailList.html("")
        }
    }
    function renderList() {
        var html = "";
        var title = "";
        var readSign = "";
        var date = "";
        var $date = "";
        var data = cfg.data;
        for (var i = 0; i < cfg.total; i++) {
            readSign = data[i].status == 0 ? '<div class="noread"></div>': '<div class="read"></div>';
            title = '<div class="email_title autoText">' + data[i].title + "</div>";
            date = data[i].createTime.slice(0, 4) + "/" + data[i].createTime.slice(4, 6) + "/" + data[i].createTime.slice(6, 8);
            $date = '<div class="email_date">' + date + "</div>";
            html += '<div id="email_item' + i + '" class="email_item"><div class="email_content">' + readSign + title + $date + '<div class="email_delposter"></div></div></div>';
            cfg.focusArr.push("#email_item" + i)
        }
        $emailList.html(html);
        showLine();
        if (cfg.firstLineIndex != 0) {
            translateE()
        }
        setTimeout(function() {
            $emailList.addClass("trans")
        },
        0);
        progress()
    }
    function translateE() {
        $emailList.css({
            webkitTransform: "translateY(-" + cfg.lineHeight * cfg.firstLineIndex + "px)"
        })
    }
    function setFocusIsFirst() {
        cfg.focusIndex = cfg.firstLineIndex * cfg.columnSize
    }
    function _renderPage(con) {
        if (con.current === cfg.type) {
            return
        }
        clearPanel();
        _initCfg(con.current);
        progress()
    }
    function autoShowMost() {
        if (cfg.total < 100) {
            if ($mostShow) {
                $mostShow.hide()
            }
            return
        }
        if (!$mostShow) {
            $mostShow = $('<div class="mostShow hide"><div><  最多显示' + cfg.maxSize + "条内容  ></div></div>");
            $mostShow.appendTo("body")
        }
        if (cfg.firstLineIndex + cfg.showLine >= cfg.total) {
            $mostShow.show()
        } else {
            $mostShow.hide()
        }
    }
    function progress() {
        var index = cfg.focusIndex || 0;
        if (cfg.total <= cfg.showLine * cfg.columnSize) {
            $progressBar.hide();
            return
        }
        var len = $progressBar.clientHeight() - 110;
        var everyMove = len / (Math.ceil(cfg.total / cfg.columnSize) - 1);
        var num = +index >= cfg.columnSize ? Math.floor(cfg.focusIndex / cfg.columnSize) : 0;
        $strip.css("top", everyMove * num + "px");
        $progressBar.show()
    }
    function aotuShowNoContent() {
        var $menuOption = $("#container #menuOption"),
        $returnOption = $("#returnPrompt");
        if (!cfg.data.length) {
            $noContent.show();
            $menuOption.hide();
            $progressBar.hide();
            $returnOption.hide();
            $("#showLine").hide();
            return
        }
        $noContent.hide();
        if (!$("#listContent.del").length) {
            $menuOption.show();
            $returnOption.hide();
        } else {
            $menuOption.hide();
            $returnOption.show();
        }
    }
    function emailList() {
        var key = "emailList";
        var keysMap = {
            KEY_DOWN: function() {
                if(editActive){
                    editActive = false;
                    if($('#' + cfg.pre + cfg.focusIndex).length){
                        cfg.focusIndex = 0
                        $.focusTo({el:'#' + cfg.pre + cfg.focusIndex});
                        return;
                    }else{
                        cfg.focusIndex = -1
                    }
                };
                if (cfg.focusIndex === cfg.total - 1) {
                    return true
                }
                if (cfg.focusIndex >= cfg.firstLineIndex + cfg.columnSize * (cfg.showLine - 1)) {
                    if (cfg.lock) return;
                    cfg.lock = true;
                    cfg.firstLineIndex++;
                    cfg.focusIndex++;
                    translateE();
                    setTimeout(function() {
                        cfg.lock = false;
                        focusTo()
                    },
                    200)
                } else {
                    if (cfg.focusIndex + cfg.columnSize < cfg.total) {
                        cfg.focusIndex += cfg.columnSize
                    } else {
                        if (cfg.focusIndex != cfg.total - 1) {
                            cfg.focusIndex = cfg.total - 1
                        }
                    }
                    focusTo()
                }
                showLine();
                return true
            },
            KEY_LEFT: function() {
                if(editActive){
                    cfg.left();
                    editActive = false;
                    return true
                }
                if ($("#listContent").hasClass("del")) {
                    return true
                }
                email.focus = cfg.pre + cfg.focusIndex;
                cfg.left && cfg.left();
                return true
            },
            KEY_UP: function() {
                if (cfg.focusIndex < cfg.columnSize) {
                    if($listContent.hasClass("del")){
                        return true
                    }
                    $.focusTo({el:'#menuOption'});
                    editActive = true;
                    return true
                }
                if (cfg.focusIndex < cfg.firstLineIndex + cfg.columnSize) {
                    if (cfg.lock) return;
                    cfg.lock = true;
                    cfg.firstLineIndex--;
                    cfg.focusIndex--;
                    translateE();
                    setTimeout(function() {
                        focusTo();
                        cfg.lock = false
                    },
                    300)
                } else {
                    cfg.focusIndex -= cfg.columnSize;
                    focusTo()
                }
                showLine();
                return true
            },
            KEY_PAGEDOWN: function() {
                if(editActive){
                    return true
                }
                if (cfg.firstLineIndex >= cfg.total - cfg.showLine) {
                    return true
                }
                if (cfg.lock) return;
                cfg.lock = true;
                cfg.focusIndex += cfg.showLine;
                if (cfg.focusIndex >= cfg.total) {
                    cfg.focusIndex = cfg.total - 1
                }
                cfg.firstLineIndex += cfg.showLine;
                if (cfg.firstLineIndex >= cfg.total) {
                    cfg.firstLineIndex = cfg.total - 1
                }
                translateE();
                setTimeout(function() {
                    focusTo();
                    cfg.lock = false
                },
                500);
                showLine();
                return true
            },
            KEY_PAGEUP: function() {
                if(editActive){
                    return true
                }
                if (cfg.firstLineIndex == 0) {
                    return true
                }
                if (cfg.lock) return;
                cfg.lock = true;
                cfg.focusIndex -= cfg.showLine;
                if (cfg.focusIndex < 0) {
                    cfg.focusIndex = 0
                }
                cfg.firstLineIndex -= cfg.showLine;
                if (cfg.firstLineIndex < 0) {
                    cfg.firstLineIndex = 0
                }
                translateE();
                setTimeout(function() {
                    focusTo();
                    cfg.lock = false
                },
                500);
                showLine();
                return true
            },
            KEY_OK: function() {
                if(editActive){
                    _activePanel();
                    return true
                }
                if ($listContent.hasClass("del")) {
                    cfg.panel.delOne(cfg.data[cfg.focusIndex],
                    function() {
                        delOneCallBack()
                    },
                    function() {});
                    return true
                }
                cfg.ok && cfg.ok(cfg.data[cfg.focusIndex] || {});
                return true
            },
            KEY_RETURN: function() {
                if ($listContent.hasClass("del")) {
                    $listContent.removeClass("del");
                    $("#menuOption").show();
                    $("#returnPrompt").hide();
                    return true
                }
            }
        };
        var deactive = function() {
            cfg.isActive = false
        };
        return {
            key: key,
            keysMap: keysMap,
            active: emailActive,
            deactive: deactive,
            cover: function() {
                return true
            },
            decover: function() {
                return true
            }
        }
    }
    function _activePanel(option) {
        var plug = option && option.plug || "mineDelPanel";
        var fn = option && option.fn || p_panel;
        _activPlug(plug, fn)
    }
    function p_panel() {
        var key = "mineDelPanel";
        function active() {
            $panelTitle.html(cfg.panel.title || "");
            $leftBtn.html("逐条删除");
            $rightBtn.html("全部清空");
            $panel.show();
            keysMap.KEY_LEFT()
        }
        function deactive() {
            $panel.hide()
        }
        var keysMap = {
            KEY_LEFT: function() {
                $.focusTo({
                    el: $leftBtn
                });
                return true
            },
            KEY_RIGHT: function() {
                $.focusTo({
                    el: $rightBtn
                });
                return true
            },
            KEY_OK: function() {
                if ($.activeObj.el === panelKeys[0]) {
                    editActive = false; //更新编辑按钮失去焦点状态
                    $listContent.addClass("del");
                    setFocusIsFirst();
                    showLine();
                    var option = {
                        plug: "emailList",
                        fn: emailList
                    };
                    _activePanel(option);
                    aotuShowNoContent();
                    return true
                }
                if ($.activeObj.el === panelKeys[1]) {
                    var option = {
                        plug: "delAllPanel",
                        fn: delAllPanel
                    };
                    _activePanel(option)
                }
                return true
            },
            KEY_RETURN: function() {
                $listContent.removeClass("del");
                $("#menuOption").show();
                $("#returnPrompt").hide();
                var option = {
                    plug: "emailList",
                    fn: emailList
                };
                _activePanel(option);
                return true
            }
        };
        return {
            key: key,
            keysMap: keysMap,
            active: active,
            deactive: deactive
        }
    }
    function _activPlug(plug, fn) {
        if (!$.pTool.get(plug)) {
            $.pTool.add(plug, fn())
        }
        $.pTool.active(plug)
    }
    function _getState() {
        return {
            firstLineIndex: cfg.firstLineIndex,
            isActive: cfg.isActive,
            focusIndex: cfg.focusIndex,
            focus: "email_item" + cfg.focusIndex
        }
    }
    function _resetConfig() {
        cfg.focusIndex = 0;
        cfg.firstLineIndex = 0;
        email.focus = null
    }
    function _addToPtool() {
        $.pTool.add("email_list", emailList())
    }
    function focusTo() {
        var index = cfg.focusIndex;
        if(editActive){
            $.focusTo({
                el: "#menuOption"
            });
        }else{
            $.focusTo({
                el: cfg.focusArr[index],
                marquee: [cfg.focusArr[index] + " .autoText"]
            });
        }
        progress();
        autoShowMost()
    }
    function _active() {
        if (!cfg.isActive) {
            _activPlug("email_list", emailList)
        }
    }
    function emailActive() {
        if (!cfg.data.length) {
            return
        }
        focusTo();
        cfg.isActive = true
    }
    function _blur() {
        cfg.isActive = false
    }
    function delAll(success, error) {
        $.s.email.empty(null, {
            success: function(res) {
                if (res.code == 1) {
                    success && success()
                }
            },
            error: function() {
                error && error()
            }
        })
    }
    function delOne(data, success, error) {
        $.s.email.remove({
            id: data._id
        },
        {
            success: function(res) {
                if (res.code == 1) {
                    success && success()
                }
            },
            error: function() {
                error && error()
            }
        })
    }
    function delAllPanel() {
        var key = "delAllPanel";
        function active() {
            $panelTitle.html(cfg.panel.delTitle || "");
            $leftBtn.html("确定");
            $rightBtn.html("取消");
            $panel.show();
            keysMap.KEY_LEFT()
        }
        function deactive() {
            $panel.hide()
        }
        var keysMap = {
            KEY_LEFT: function() {
                $.focusTo({
                    el: $leftBtn
                });
                return true
            },
            KEY_RIGHT: function() {
                $.focusTo({
                    el: $rightBtn
                });
                return true
            },
            KEY_OK: function() {
                if ($.activeObj.el === panelKeys[0]) {
                    cfg.panel.delAll(function() {
                        cfg.data = [];
                        cfg.total = 0;
                        cfg.firstLineIndex = 0;
                        $emailList.hide();
                        aotuShowNoContent();
                        progress();
                        autoShowMost();
                        cfg.left()
                    },
                    function() {});
                    return true
                }
                if ($.activeObj.el === panelKeys[1]) {
                    this.KEY_RETURN()
                }
                return true
            },
            KEY_RETURN: function() {
                $("#menuOption").show();
                $("#returnPrompt").hide();
                $(".panel").hide();
                $listContent.removeClass("del");
                var option = {
                    plug: "emailList",
                    fn: emailList
                };
                _activePanel(option);
                return true
            }
        };
        return {
            key: key,
            keysMap: keysMap,
            active: active,
            deactive: deactive
        }
    }
    function delOneCallBack() {
        cfg.data.splice(cfg.focusIndex, 1);
        $(cfg.focusArr[cfg.focusIndex]).remove();
        cfg.focusArr.splice(cfg.focusIndex, 1);
        if (cfg.focusIndex === cfg.data.length && cfg.firstLineIndex > 0 && cfg.focusIndex / cfg.columnSize === cfg.firstLineIndex) {
            cfg.firstLineIndex--;
            translateE()
        }
        cfg.total = cfg.data.length;
        cfg.focusIndex = cfg.focusIndex === cfg.total ? cfg.focusIndex - 1 : cfg.focusIndex;
        if (!cfg.data.length) {
            cfg.left();
            $listContent.removeClass("del");
            aotuShowNoContent();
            return
        }
        focusTo();
        progress();
        autoShowMost();
        showLine()
    }
    function _addDelOneClass() {
        $("#container").addClass("del")
    }
    function _romoveDelOneClass() {
        $("#container").removeClass("del")
    }
    function showLine() {
        var str = '<span class="current">' + (cfg.focusIndex + 1) + "</span>/" + cfg.total + "行";
        $("#showLine").html(str)
    }
    return {
        init: _init,
        active: _active,
        blur: _blur,
        addToPtool: _addToPtool,
        renderPage: _renderPage,
        getState: _getState,
        resetConfig: _resetConfig,
        hasData: function() {
            return cfg.data.length
        },
        setCallBack: function(fn, error) {
            cfg.afterLoadData = fn;
            cfg.error = error
        }
    }
} ();
