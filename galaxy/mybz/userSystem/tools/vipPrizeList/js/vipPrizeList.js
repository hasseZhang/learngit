var mineList = function() {
    var ap = null;
    var key = "mineList";
    var isActive = false;
    var cfg = null;
    var $progressBar = null, $strip = null, $panel = null, $leftBtn = null, $rightBtn = null, $panelTitle = null, $pageNum = null;
    var $listContent = null;
    var $listWrap = null;
    var $noContent = null;
    var init = function(opt) {
        $.pTool.add(key, p_mineList());
        cfg = opt;
        if (!cfg.total) {
            aotuShowNoContent();
            return;
        }
        $listWrap = $('<div id="listWrap"></div>').appendTo("body");
        ap = _initAP();
        $listContent = $(".listContent");
        showLineNum();
    };
    function _initAP() {
        return new $.AnimatePanel({
            lineHeight: cfg.lineHeight,
            shadowLine: cfg.shadowLine,
            showLine: cfg.showLine,
            columnSize: cfg.columnSize,
            total: cfg.total,
            firstLineIndex: cfg.firstLineIndex,
            className: cfg.contentClassName || "listContent",
            paddingItem: cfg.paddingItem,
            appendTo: $listWrap[0],
            render: _renderList,
            update: updateInfo
        });
    }
    function updateInfo(info) {
        cfg.firstLineIndex = info.firstLineIndex;
        if (info.turnLine) {
            cfg.focusIndex -= info.columnSize * info.turnLine;
            cfg.focusIndex = Math.max(Math.min(cfg.focusIndex, info.total - 1), 0);
        }
    }
    function focusTo() {
        var pre = cfg.pre, index = cfg.focusIndex;
        var marquee = cfg.marquee || [ "#" + pre + index + " .autoText" ];
        $.focusTo({
            el: "#" + pre + index,
            marquee: marquee
        });
        showLineNum();
    }
    function _getState() {
        return {
            firstLineIndex: 0,
            isActive: isActive,
            focusIndex: 0,
            menuIndex: cfg.menuIndex
        };
    }
    function _renderList(begin, end) {
        return cfg.renderList(cfg.data, begin, end);
    }
    function p_mineList() {
        var keysMap = {
            getTotalLine: function() {
                return Math.ceil(cfg.total / cfg.columnSize);
            },
            getFirstIndex: function() {
                return cfg.firstLineIndex * cfg.columnSize;
            },
            KEY_DOWN: function() {
                if (Math.floor(cfg.focusIndex / cfg.columnSize) === this.getTotalLine() - 1) {
                    return true;
                }
                if (cfg.focusIndex >= this.getFirstIndex() + cfg.columnSize * (cfg.showLine - 1)) {
                    ap.dragUp();
                } else {
                    if (cfg.focusIndex + cfg.columnSize < cfg.total) {
                        cfg.focusIndex += cfg.columnSize;
                    } else {
                        if (Math.floor(cfg.focusIndex / cfg.columnSize) != this.getTotalLine() - 1) {
                            cfg.focusIndex = cfg.total - 1;
                        }
                    }
                }
                focusTo();
                return true;
            },
            KEY_LEFT: function() {
                if (cfg.focusIndex % cfg.columnSize == 0) {
                    if ($listContent.hasClass("del")) {
                        return true;
                    }
                    cfg.left && cfg.left();
                } else {
                    cfg.focusIndex--;
                    focusTo();
                }
                return true;
            },
            KEY_RIGHT: function() {
                if ((cfg.focusIndex + 1) % cfg.columnSize != 0 && cfg.focusIndex + 1 != cfg.total) {
                    cfg.focusIndex++;
                    focusTo();
                }
                return true;
            },
            KEY_UP: function() {
                if (cfg.focusIndex < cfg.columnSize) {
                    cfg.up && cfg.up();
                    return true;
                }
                if (cfg.focusIndex < this.getFirstIndex() + cfg.columnSize) {
                    ap.dragDown();
                } else {
                    cfg.focusIndex -= cfg.columnSize;
                }
                focusTo();
                return true;
            },
            KEY_PAGEDOWN: function() {
                if (cfg.firstLineIndex >= this.getTotalLine() - cfg.showLine) {
                    return true;
                }
                ap.dragPageUp();
                focusTo();
                return true;
            },
            KEY_PAGEUP: function() {
                if (cfg.firstLineIndex == 0) {
                    return true;
                }
                ap.dragPageDown();
                focusTo();
                return true;
            },
            KEY_RETURN: function() {
                if ($listContent.hasClass("del")) {
                    $listContent.removeClass("del");
                    setFocusIsFirst();
                    cfg.left && cfg.left();
                    return true;
                }
            },
            KEY_OK: function() {
                cfg.ok && cfg.ok(cfg.data[cfg.focusIndex] || {});
                return true;
            }
        };
        function active() {
            isActive = true;
            focusTo();
        }
        function deactive() {
            isActive = false;
        }
        return {
            key: key,
            keysMap: keysMap,
            active: active,
            deactive: deactive,
            cover: function() {
                return true;
            },
            uncover: function() {
                return true;
            }
        };
    }
    function aotuShowNoContent() {
        if (!$noContent) {
            $noContent = $('<div class="no_content hide ' + cfg.noContentClass + '"></div>');
            $noContent.appendTo("body");
        }
        if (cfg.total) {
            $noContent.hide();
        } else {
            $noContent.show();
        }
    }
    function setFocusIsFirst() {
        cfg.focusIndex = cfg.firstLineIndex * cfg.columnSize;
    }
    function showLineNum() {
        if (!cfg.hasLine) {
            return;
        }
        if (!$pageNum) {
            $pageNum = $('<div id="pageNum" class="hide"><span class="nowLine"></span><span class="all"></span></div>');
            $pageNum.appendTo("body");
        }
        if (!cfg.total) {
            $pageNum.hide();
            return;
        }
        var totalNum = Math.ceil(cfg.total / cfg.columnSize);
        var num = num || Math.floor(cfg.focusIndex / cfg.columnSize) + 1;
        var last = "/" + totalNum + "行";
        $(".nowLine").html(num);
        $(".all").html(last);
        $pageNum.show();
    }
    return {
        key: key,
        init: init,
        getState: _getState,
        setFocusIsFirst: setFocusIsFirst
    };
}();