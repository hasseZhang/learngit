var pageName = "SEARCH";

var CATEGORYID = "999999";

var firstKeyType = "";

var keyType = "T9";

var T9Heart = " .T9_heartBox";

var dftHeart = "#T9_4";

var lastPlug = "";

var searchText = "";

var flag = false;

var changeList = false;

var isRight = false;//记录右移位置

var freePkg = "1100000021";

var pageInfo = $.initPageInfo(pageName, [ "hot", "search", "kb", "text", "lastPlug", "input" ], {
    hot: {
        isActive: false
    },
    search: {
        isActive: false
    }
});

// cms搜索频道图
var channelImgMap = null;
var channelImgId = $.getVariable("EPG:isTest") ? "1100008578" : "1100008580";
$.s.guidance.get({
    id: channelImgId
}, {
    success: function(list) {
        channelImgMap = {};
        $.UTIL.each(list, function(item) {
            channelImgMap[item.contentUri] = $.getPic(item.pics, [101])
        });
    }
});
function _moveLeft(){
    $("#wrap").addClass("move");
    $(".searchPanel").css("-webkit-transform","translate(-720px)");
}
function _moveRight(){
    changeList = false;
    $("#wrap").removeClass("move");
    $(".searchPanel").css("-webkit-transform","translate(0px)");
}
function activeRight() {
    if (!input.get() || $(".hotPanel.nosearch").length) {
        if (s_hot.hasData()) {
            $.pTool.active("s_hot");
        }
    } else {
        if (flag) {
            isRight ? $.pTool.active("s_classList"): $.pTool.active("s_searchList");
            $("#detailCon").show();
            _moveLeft()
        }
    }
}

function load() {
    initPlug();
    detailContent.init();
    $.recodeData(pageName, "access");
    request.queryKeyType(function(res) {
        if (res.data) {
            keyType = res.data;
        }
        firstKeyType = keyType;
        kb.show();
        swichKb.addChossClass();
        initCfg();
    }, function() {
        kb.show();
        swichKb.addChossClass();
        initCfg();
    });
    
}

function initCfg() {
    if (!pageInfo.hot.isActive && !pageInfo.search.isActive) {
        $.pTool.active(kb.key);
        s_hot.show();
        return;
    }
    if (pageInfo.hot.isActive) {
        lastPlug = pageInfo.lastPlug;
        if (lastPlug === "s_input") {
            s_input.setFocus("#delete");
        }
        kb.setState(pageInfo.kb);
        s_hot.setCfg({
            focusIndex: pageInfo.hot.focusIndex,
            firstLineIndex: pageInfo.hot.firstLineIndex
        });
        s_hot.show(pageInfo.hot.isNoS, 0, !0, function() {
            $.pTool.active(s_hot.key);
        });
        input.set(pageInfo.text);
        return;
    }
    if (pageInfo.search.isActive) {
        lastPlug = pageInfo.lastPlug;
        if (lastPlug === "s_input") {
            s_input.setFocus("#delete");
        }
        kb.setState(pageInfo.kb);
        input.set(pageInfo.text);
        searchResult.show();
        searchResult.setIndex(pageInfo.search);
        searchResult.renderList(pageInfo.search.index);
        $("#wrap").addClass("move");
        changeList = true;
        searchResult.init({
            type: pageInfo.text,
            cat: pageInfo.search.cat,
            isBack: true,
            classIndex: pageInfo.search.index,
            total: pageInfo.search.total,
            cb: function() {
                $.pTool.active("s_searchList");
            }
        });
    }
}

function initPlug() {
    $.pTool.add(kb.key, kb.plug);
    $.pTool.add(s_input.key, s_input.plug);
    $.pTool.add(swichKb.key, swichKb.plug);
    $.pTool.add(s_T9heart.key, s_T9heart.plug);
    $.pTool.add(s_hot.key, s_hot.plug);
    $.pTool.add(searchResult.classListPlug.key, searchResult.classListPlug);
    $.pTool.add(searchResult.searchPlug().key, searchResult.searchPlug());
}

var getKey = function() {
    return $.activeObj.el;
};

function debounce(fn, wait) {
    var timer;
    return function(args) {
        var context = this;
        clearTimeout(timer);
        timer = setTimeout(function() {
            fn.apply(context, [ args ]);
        }, wait);
    };
}

function unload() {
    if (keyType !== firstKeyType && firstKeyType) {
        $.s.kb.add({
            keyboardType: keyType
        });
    }
    var saveInfo = {
        hot: s_hot.getState(),
        search: searchResult.getState(),
        text: input.get(),
        lastPlug: lastPlug,
        kb: kb.getState(),
        input: s_input.getState()
    };
    $.savePageInfo(pageName, saveInfo);
}

var swichKb = function() {
    var key = "s_swich";
    var keys = [ "#t9keyBtn", "#allkeyBtn" ];
    var kType = "";
    var active = function() {
        kType = keyType;
        isActive = true;
        $.focusTo({
            el: keyType === "T9" ? keys[0] : keys[1]
        });
    };
    var deactive = function() {
        lastPlug = key;
    };
    function swichKeys() {
        if (getKey() === keys[1] && keyType === "T9") {
            $("#allKey").show();
            $("#T9Key").hide();
            keyType = "Full";
        }
        if (getKey() === keys[0] && keyType === "Full") {
            $("#allKey").hide();
            $("#T9Key").show();
            keyType = "T9";
        }
        $(getKey()).addClass("choose");
    }
    function addChossClass() {
        if (keyType === "T9") {
            $(keys[0]).addClass("choose");
            $(keys[1]).removeClass("choose");
            return;
        }
        if (keyType === "Full") {
            $(keys[1]).addClass("choose");
            $(keys[0]).removeClass("choose");
            return;
        }
    }
    var keysMap = {
        KEY_LEFT: function() {
            if (getKey() === keys[1]) {
                $.focusTo({
                    el: keys[0]
                });
                swichKeys();
                addChossClass();
            }
            return true;
        },
        KEY_RIGHT: function() {
            if (getKey() === keys[0]) {
                $.focusTo({
                    el: keys[1]
                });
                swichKeys();
                addChossClass();
                return true;
            }
            activeRight();
            return true;
        },
        KEY_UP: function() {
            if (kType !== keyType) {
                kb.reset();
                kb.setDft();
            }
            $.pTool.active("s_keyBoard");
            return true;
        }
    };
    var plug = {
        key: key,
        keysMap: keysMap,
        active: active,
        deactive: deactive
    };
    return {
        key: key,
        plug: plug,
        addChossClass: addChossClass
    };
}();

var kb = function() {
    var T9 = {
        pre: "T9_",
        col: 3,
        row: 3,
        nowC: 1,
        nowR: 1,
        size: 3 * 3,
        dft: "#T9_4"
    };
    var allKey = {
        pre: "allKey",
        col: 6,
        row: 6,
        nowC: 2,
        nowR: 2,
        size: 6 * 6,
        dft: "#allKey14"
    };
    var key = "s_keyBoard";
    var assignF = "";
    var active = function() {
        isActive = true;
        var type = getKeyType();
        var el = type.dft;
        if (assignF && assignF.replace(type.pre, "") === assignF) {
            kb.setDft();
        }
        $.focusTo({
            el: assignF || el
        });
    };
    var deactive = function() {
        isActive = false;
        assignF = getKey();
        lastPlug = key;
    };
    var getKeyType = function() {
        if (keyType === "Full") {
            return allKey;
        }
        return T9;
    };
    var keysMap = {
        KEY_DOWN: function() {
            var kb = getKeyType();
            kb.nowR++;
            var index = kb.nowR * kb.col + kb.nowC % kb.col;
            var key = "#" + kb.pre + index;
            if ($(key).length) {
                $.focusTo({
                    el: key
                });
            } else {
                kb.nowR--;
                $.pTool.active("s_swich");
            }
            return true;
        },
        KEY_UP: function() {
            var kb = getKeyType();
            if (kb.nowR <= 0) {
                if (kb.nowC >= Math.ceil(kb.col / 2)) {
                    s_input.setFocus(s_input.keys[1]);
                }
                $.pTool.active("s_input");
            } else {
                kb.nowR--;
                var index = kb.nowR * kb.col + kb.nowC % kb.col;
                var key = "#" + kb.pre + index;
                $.focusTo({
                    el: key
                });
            }
            return true;
        },
        KEY_LEFT: function() {
            var kb = getKeyType();
            if (kb.nowC === 0) {
                return true;
            }
            kb.nowC--;
            var index = kb.nowR * kb.col + kb.nowC % kb.col;
            var key = "#" + kb.pre + index;
            $.focusTo({
                el: key
            });
            return true;
        },
        KEY_RIGHT: function() {
            var kb = getKeyType();
            kb.nowC++;
            if (kb.nowC >= kb.col) {
                kb.nowC--;
                activeRight();
            } else {
                var index = kb.nowR * kb.col + kb.nowC % kb.col;
                var key = "#" + kb.pre + index;
                $.focusTo({
                    el: key
                });
            }
            return true;
        },
        KEY_OK: function() {
            if (keyType === "T9") {
                dftHeart = getKey();
                $.pTool.active("s_T9heart");
            } else {
                var nowtext = input.get();
                if (nowtext.length >= 10) {
                    return true;
                }
                var text = nowtext + $(getKey() + " span").html();
                searchResult.initFocus();
                input.set(text);
                clearTimeout(this.tiemr);
                flag = false;
                this.tiemr = setTimeout(function() {
                    searchResult.init({
                        type: text,
                        cat: 0
                    });
                }, 500);
            }
            return true;
        }
    };
    var plug = {
        key: key,
        keysMap: keysMap,
        active: active,
        deactive: deactive
    };
    var getState = function() {
        return {
            assignF: assignF,
            keyType: getKeyType()
        };
    };
    var setState = function(opt) {
        assignF = opt.assignF;
        if (opt.keyType && opt.keyType.pre) {
            if (opt.keyType.pre === "T9" && keyType == "T9") {
                T9 = opt.keyType;
            } else {
                allKey = opt.keyType;
            }
        }
    };
    var show = function() {
        if (keyType === "T9") {
            $("#T9Key").show();
        } else {
            $("#allKey").show();
        }
    };
    return {
        key: key,
        plug: plug,
        reset: function() {
            T9 = {
                pre: "T9_",
                col: 3,
                row: 3,
                nowC: 0,
                nowR: 0,
                size: 3 * 3,
                dft: "#T9_4"
            };
            allKey = {
                pre: "allKey",
                col: 6,
                row: 6,
                nowC: 0,
                nowR: 0,
                size: 6 * 6,
                dft: "#allKey14"
            };
        },
        setDft: function() {
            if (keyType === "T9") {
                assignF = "#T9_0";
            } else {
                assignF = "#allKey0";
            }
        },
        getState: getState,
        setState: setState,
        show: show
    };
}();

var input = function() {
    var $input = function() {
        return $("#search #inputPanel");
    };
    var $mark = function() {
        return $("#search #markwords");
    };
    function getVal() {
        return $input().html() || "";
    }
    function setVal(str) {
        $input().html(str);
        markShowOrHide();
        searchText = str || "";
    }
    function markShowOrHide() {
        if (getVal()) {
            $mark().hide();
        } else {
            $mark().show();
        }
    }
    return {
        get: getVal,
        set: setVal,
        markShowOrHide: markShowOrHide
    };
}();

var s_input = function() {
    var key = "s_input";
    var isActvie = false;
    var keys = [ "#empty", "#delete" ];
    var defaultF = keys[0];
    var assignF = "";
    var active = function() {
        isActvie = true;
        $.focusTo({
            el: assignF || defaultF
        });
    };
    var deactive = function() {
        defaultF = getKey();
        isActvie = false;
        lastPlug = key;
    };
    var getState = function() {
        return {
            isActvie: isActvie,
            assignF: assignF
        };
    };
    var setAssignF = function(el) {
        if (!assignF) {
            assignF = el;
        }
    };
    var emptyBtn = function() {
        searchResult.hide();
        s_hot.show(0, 1);
        $("#searchList .classList").hide();
        $("#searchList .title").hide();
        $("#searchList .qbTotal").hide();
        $("#detailCon").hide()
    };
    var keysMap = {
        KEY_DOWN: function() {
            assignF = getKey();
            $.pTool.active("s_keyBoard");
            return true;
        },
        KEY_LEFT: function() {
            if (getKey() === keys[0]) {
                return true;
            }
            $.focusTo({
                el: keys[0]
            });
            return true;
        },
        KEY_RIGHT: function() {
            if (getKey() === keys[0]) {
                $.focusTo({
                    el: keys[1]
                });
            } else {
                activeRight();
            }
            return true;
        },
        KEY_OK: function() {
            if (!input.get()) {
                return;
            }
            searchResult.initFocus();
            if (getKey() === keys[0]) {
                input.set("");
                input.markShowOrHide();
                emptyBtn();
                searchResult.sText("");
                return;
            }
            if (getKey() === keys[1]) {
                var text = input.get().slice(0, -1);
                input.set(text);
                if (!text) {
                    input.markShowOrHide();
                    emptyBtn();
                    searchResult.sText("");
                } else {
                    clearTimeout(this.tiemr);
                    flag = false;
                    this.tiemr = setTimeout(function() {
                        searchResult.init({
                            type: text,
                            cat: 0
                        });
                    }, 500);
                }
            }
            return true;
        }
    };
    var plug = {
        key: key,
        keysMap: keysMap,
        active: active,
        deactive: deactive
    };
    return {
        plug: plug,
        key: key,
        getState: getState,
        setFocus: setAssignF,
        keys: keys
    };
}();

var request = function() {
    var queryKeyType = function(success, error) {
        $.s.kb.query(null, {
            success: success,
            error: error
        });
    };
    var saveKeyType = function(type) {
        $.s.kb.add({
            keyboardType: type
        });
    };
    var hot = function(success, error) {
        $.s.search.topN(24, {
            success: function(res) {
                success && success(res);
            },
            error: function() {
                error && error();
            }
        });
    };
    var result = function(type, success, error) {
        $.s.search.getByN(type, {
            success: function(res) {
                success && success(res);
            },
            error: function() {
                error && error();
            }
        });
    };
    var detail = function(contentId, success, error) {
        $.s.detail.get({
            id: contentId
        }, {
            success: function(res) {
                success && success(res);
            },
            error: function() {
                error && error();
            }
        });
    };
    return {
        queryKeyType: queryKeyType,
        saveKeyType: saveKeyType,
        hot: hot,
        result: result,
        detail: detail
    };
}();

var s_T9heart = function() {
    var key = "s_T9heart";
    var active = function() {
        $("#shadow").show();
        $(getKey() + T9Heart).show();
        if ($(getKey() + T9Heart + " .mid").length) {
            $.focusTo({
                el: $(getKey() + T9Heart + " .mid")
            });
        } else {
            $.focusTo({
                el: $(getKey() + T9Heart + " .left")
            });
        }
    };
    var deactvie = function() {
        $("#shadow").hide();
        $(dftHeart + " .T9_heartBox").hide();
    };
    var keysMap = {
        getKey: function() {
            var className = $(".focusBorder")[0].className;
            if (/mid/.test(className)) {
                return "mid";
            }
            if (/top/.test(className)) {
                return "top";
            }
            if (/right/.test(className)) {
                return "right";
            }
            if (/left/.test(className)) {
                return "left";
            }
            if (/bottom/.test(className)) {
                return "bottom";
            }
            return null;
        },
        KEY_UP: function() {
            var key = this.getKey();
            if (!key) {
                return true;
            }
            var nextKey = "";
            if (key === "bottom") {
                nextKey = $(dftHeart + " .mid");
                $.focusTo({
                    el: nextKey
                });
            } else {
                nextKey = $(dftHeart + " .top");
                if (!nextKey.length) {
                    return true;
                }
                $.focusTo({
                    el: nextKey
                });
            }
            return true;
        },
        KEY_LEFT: function() {
            var key = this.getKey();
            var nextKey = $(dftHeart + " .mid");
            if (key === "right" && nextKey.length) {
                $.focusTo({
                    el: nextKey
                });
            } else {
                nextKey = $(dftHeart + " .left");
                $.focusTo({
                    el: nextKey
                });
            }
            return true;
        },
        KEY_RIGHT: function() {
            var key = this.getKey();
            if (!key) {
                return true;
            }
            var nextKey = $(dftHeart + " .mid");
            if (key === "left" && nextKey.length) {
                $.focusTo({
                    el: nextKey
                });
            } else {
                nextKey = $(dftHeart + " .right");
                $.focusTo({
                    el: nextKey
                });
            }
            return true;
        },
        KEY_DOWN: function() {
            var key = this.getKey();
            if (!key) {
                return true;
            }
            var nextKey = "";
            if (key === "top") {
                nextKey = $(dftHeart + " .mid");
                $.focusTo({
                    el: nextKey
                });
            } else {
                nextKey = $(dftHeart + " .bottom");
                if (!nextKey.length) {
                    return true;
                }
                $.focusTo({
                    el: nextKey
                });
            }
            return true;
        },
        KEY_OK: function() {
            var nowtext = input.get();
            if (nowtext.length >= 10) {
                this.KEY_RETURN();
                return true;
            }
            var text = nowtext + $(dftHeart + " ." + this.getKey()).html();
            searchResult.initFocus();
            input.set(text);
            clearTimeout(this.tiemr);
            flag = false;
            this.tiemr = setTimeout(function() {
                searchResult.init({
                    type: text,
                    cat: 0
                });
            }, 500);
            this.KEY_RETURN();
            return true;
        },
        KEY_RETURN: function() {
            $.pTool.active("s_keyBoard");
            return true;
        }
    };
    var plug = {
        key: key,
        keysMap: keysMap,
        active: active,
        deactive: deactvie
    };
    return {
        key: key,
        plug: plug
    };
}();

var s_hot = function() {
    var key = "s_hot";
    var picType = [ 102, 6 ];
    var isActive = false;
    var isNoS = false;
    var total = 24, firstLineIndex = 0, columnSize = 4, showLine = 2, totalLine = Math.ceil(total / columnSize), focusIndex = 0, pre = "hot_item_";
    var ap = null, data = [];
    var hide = function() {
        $("#hot .title").hide();
        $(".hotPanel").hide();
        $("#detailCon").hide();
    };
    var show = function(isNoSearch, isRefresh, isBack, cb) {
        if (!data.length) {
            getData(function() {
                $(".hotPanel").show();
                if (isNoSearch) {
                    isNoS = true;
                    showLine = 1;
                    $("#noSearch").show();
                    $("#hot .title").hide();
                    $(".hotPanel").hide();
                } else {
                    $("#hot .title").show();
                    isNoS = false;
                    showLine = 2;
                    $("#noSearch").hide();
                    $("#hot .title").show();
                }
                if ((isRefresh || focusIndex) && !isBack) {
                    if ($(".hotPanel").length) {
                        $(".hotPanel").remove();
                    }
                    focusIndex = 0;
                    firstLineIndex = 0;
                    ap = initAP();
                    if (isNoSearch) {
                        isNoS = true;
                        $("#noSearch").show();
                        $("#hot .title").hide();
                        $(".hotPanel").hide();
                    } else {
                        $("#hot .title").show();
                        isNoS = false;
                        $("#noSearch").hide();
                        $("#hot .title").show();
                    }
                }
                cb && cb();
            }), function() {
                flag = false;
                hide();
                $("#error").show();
            };
        } else {
            $(".hotPanel").hide();
            $("#error").hide();
            if (isNoSearch) {
                isNoS = true;
                if ($(".hotPanel").length) {
                    $(".hotPanel").remove();
                }
                showLine = 1;
                focusIndex = 0;
                firstLineIndex = 0;
                ap = initAP();
                $(".hotPanel").remove();
                $("#noSearch").hide();
            } else {
                $("#hot .title").show();
                isNoS = false;
                if ($(".hotPanel").length) {
                    $(".hotPanel").remove();
                }
                showLine = 2;
                ap = initAP();
                $("#noSearch").hide();
            }
            if ((isRefresh || focusIndex) && !isBack) {
                if ($(".hotPanel").length) {
                    $(".hotPanel").remove();
                }
                focusIndex = 0;
                firstLineIndex = 0;
                ap = initAP();
                if (isNoSearch) {
                    isNoS = true;
                    $("#noSearch").show();
                } else {
                    $("#hot .title").show();
                    isNoS = false;
                    $("#noSearch").hide();
                }
            }
            cb && cb();
        }
    };
    var rederData = function(begin, end) {
        return data.slice(begin, end);
    };
    var renderList = function(begin, end) {
        var html = "", src = "", title = "";
        var data = rederData(begin, end);
        for (var i = 0; i < data.length; i++) {
            src = $.getPic(data[i].pics, picType, {
                picType: "type",
                picPath: "uri"
            });
            title = data[i].name;
            html += '<div class="hot_item" id="hot_item_' + (begin + i) + '"><div class="hot_content"><div class="poster noPic"><img src="' + src + '">' + '</div><div class="poster-name autoText">' + title + "</div></div></div>";
        }
        return html;
    };
    var updateInfo = function(info) {
        firstLineIndex = info.firstLineIndex;
        if (info.turnLine) {
            focusIndex -= info.columnSize * info.turnLine;
            focusIndex = Math.max(Math.min(focusIndex, info.total - 1), 0);
        }
    };
    var initAP = function() {
        return new $.AnimatePanel({
            lineHeight: 440,
            shadowLine: 1,
            showLine: showLine,
            columnSize: columnSize,
            total: total,
            firstLineIndex: firstLineIndex,
            className: "hotPanel",
            paddingItem: '<div class="hot_item"></div>',
            transition: "all .6s",
            render: renderList,
            update: updateInfo
        });
    };
    var getData = function(callBack) {
        function error() {
            $("#error").removeClass("noClass").show();
            hide();
        }
        function success(res) {
            if (res.code !== 0 || !res.data.total) {
                error();
                return;
            }
            if (res.data.total <= 24) {
                total = res.data.total;
            }
            data = res.data.list;
            if (!ap) {
                showLine = pageInfo.hot.isNoS ? 1 : 2;
                ap = initAP();
            }
            callBack && callBack();
        }
        request.hot(success, error);
    };
    var focusTo = function() {
        $.focusTo({
            el: "#" + pre + focusIndex,
            marquee: [ "#" + pre + focusIndex + " .autoText" ]
        });
    };
    var goToDetail = function(d) {
        $.gotoDetail({
            contentId: d.id,
            categoryId: CATEGORYID,
            contentType: d.seriesFlag
        });
    };
    var active = function() {
        isActive = true;
        focusTo();
    };
    var deactive = function() {
        isActive = false;
    };
    var getFirstIndex = function() {
        return firstLineIndex * columnSize;
    };
    var keysMap = {
        KEY_DOWN: function() {
            if (Math.floor(focusIndex / columnSize) === totalLine - 1) {
                return true;
            }
            if (focusIndex >= getFirstIndex() + columnSize * (showLine - 1)) {
                ap.dragUp();
            } else {
                if (focusIndex + columnSize < data.length) {
                    focusIndex += columnSize;
                } else {
                    if (Math.floor(focusIndex / columnSize) != totalLine - 1) {
                        focusIndex = data.length - 1;
                    }
                }
            }
            focusTo();
            return true;
        },
        KEY_LEFT: function() {
            if (focusIndex % columnSize === 0) {
                $.pTool.active(lastPlug);
                return true;
            }
            focusIndex--;
            focusTo();
            return true;
        },
        KEY_UP: function() {
            if (focusIndex < columnSize) {
                return true;
            }
            if (focusIndex < getFirstIndex() + columnSize) {
                ap.dragDown();
            } else {
                focusIndex -= columnSize;
            }
            focusTo();
            return true;
        },
        KEY_RIGHT: function() {
            if ((focusIndex + 1) % columnSize != 0 && focusIndex + 1 !== data.length) {
                focusIndex++;
                focusTo();
            }
            return true;
        },
        KEY_PAGEDOWN: function() {
            if (firstLineIndex >= totalLine - showLine) {
                return true;
            }
            ap.dragPageUp();
            focusTo();
            return true;
        },
        KEY_PAGEUP: function() {
            if (firstLineIndex == 0) {
                return true;
            }
            ap.dragPageDown();
            focusTo();
            return true;
        },
        KEY_OK: function() {
            var d = data[focusIndex];
            goToDetail(d);
            return true;
        }
    };
    var plug = {
        key: key,
        keysMap: keysMap,
        active: active,
        deactive: deactive
    };
    var getState = function() {
        return {
            isActive: isActive,
            isNoS: isNoS,
            focusIndex: focusIndex,
            firstLineIndex: firstLineIndex
        };
    };
    var setCfg = function(opt) {
        focusIndex = opt.focusIndex;
        firstLineIndex = opt.firstLineIndex;
        isNoS = opt.isNoS;
    };
    return {
        key: key,
        show: show,
        hide: hide,
        plug: plug,
        hasData: function() {
            return !(data.length === 0);
        },
        getState: getState,
        setCfg: setCfg
    };
}();

var searchResult = function() {
    var classList = [];
    var ap = null;
    var fd = null;
    var total = 0;
    var firstLineIndex = 0;
    var showLine = 8;
    var columnSize = 2;
    var focusIndex = 0;
    var isActive = false;
    var index = 0;
    var sText = "";
    var sCat = "";
    var oTotal = 0;
    function _dealData(r) {
        if (!classList.length && (!r.data || !r.data.aggrCats)) {
            return;
        }
        classList = sortAggrCats(r.data.aggrCats || classList);
        total = r.data.total;
        renderTotal(total);
    }
    function sortAggrCats(arr) {
        var resultSort = [ "channel", "movie", "tv_series", "variety_show", "children", "other" ];
        var result = [];
        for (var i = 0; i < resultSort.length; i++) {
            for (var k = 0; k < arr.length; k++) {
                if (resultSort[i] === arr[k].id) {
                    result.push(arr[k]);
                }
            }
        }
        return result;
    }
    //结果条数
    function renderTotal(num){
        var qbTotalCon = $("#searchList .qbTotal");
        var qbTotalHtml = '<span>' + num + '条结果</span>';
        qbTotalCon.html(qbTotalHtml);
        if(num == 0) {
            flag = false   
        }
    }
    function renderList(currentIndex, tot) {
        if (!$("#inputPanel").html()) {
            return;
        }
        var content = $("#searchList .classList");
        var arr = [];
        var el = "";
        $.UTIL.each(classList, function(item, i) {
            var cur = "";
            if (currentIndex === i + 1) {
                cur = "current";
            }
            el = '<li id="s_class' + (i + 1) + '" class="' + cur + '"><span>' + item.name +'</li>';
            arr.push(el);
        });
        var cName = [];
        if (currentIndex === 0) {
            cName.push("current")
        }
        arr.unshift('<li id="s_class0" class="' + cName.join("") + '" ><span>全部</span></li>');
        content.html(arr.join(""));
    }
    function noSearchAuto(total) {
        if (total == 0) {
            $("#noSearch").show();
            _hide();
        } else {
            $("#noSearch").hide();
            _show();
        }
    }
    function _init(opt) {
        if (sCat === opt.cat && opt.type === sText) {
            flag = true;
            return;
        }
        sCat = opt.cat;
        $("#searchList").show();
        if (!input.get()) {
            return;
        }
        fd = initFd(opt);
        fd.preload(firstLineIndex, 104, function(ds, begin, end, total) {
            detailContent.getDetailInfo(ds && ds[0] || null);
            flag = true;
            $("#error").hide();
            if (total != 0) {
                s_hot.hide();
            } else {
                s_hot.show(1);
            }
            if (!opt.cat) {
                oTotal = total;
                noSearchAuto(total, opt.cb);
                if (sText !== searchText) {
                    index = 0;
                    renderList(0);
                }
            }
            sText = opt.type;
            if (opt.isBack) {
                renderList(opt.classIndex, opt.total);
            }
            ap = initAP(opt.isBack);
            if (total !== 0) {
                _show();
            }
            $.UTIL.apply(opt.cb);
        }, function() {
            flag = false;
            if ($(".searchPanel").length) {
                $(".searchPanel").remove();
            }
            if ($(".classList").length && !$(".classList").hasClass("hide") && (opt.cat || $(".classList")[0].children.length)) {
                $("#error").addClass("noClass");
            } else {
                $("#error").removeClass("noClass");
            }
            $("#hot .title").hide();
            $("#noSearch").hide();
            $("#detailCon").hide();
            $("#error").show();
            s_hot.hide();
        });
    }
    function _show() {
        if (!input.get()) {
            return;
        }
        $("#searchList").show();
        $("#searchList .classList").show();
        $("#searchList .qbTotal").show();//条数
        $("#searchList .title").show();
        $("#detailCon").show();
    }
    function _hide() {
        if ($(".searchPanel").length) {
            $(".searchPanel").remove();
            $(".hotPanel").remove();
        }
        $("#searchList .classList").show();
        $("#searchList .title").show();
        $("#searchList .qbTotal").show();//条数
        $("#hot .title").hide();
        $("#detailCon").show;
    }
    var timer4Init = debounce(_init, 1e3);
    //搜索分类焦点移动
    var initList = function(index) {
        flag = false;
        initFocus();
        if (index - 1 >= 0) {
            timer4Init({
                type: input.get(),
                cat: classList[index - 1].id
            });
        } else {
            timer4Init({
                type: input.get(),
                first: true,
                cat: 0
            });
        }
    };
    function initFd(opt) {
        return new $.FetchData({
            type: opt.type,
            blockSize: 100,
            jsonp: function(type, num, onLoad, onError, isPreload) {
                (function(type, num, onLoad, onError, isPreload) {
                    var sParma = {
                        name: opt.type,
                        pageNum: num
                    };
                    if (opt.cat) {
                        sParma.cat = opt.cat;
                    }
                    request.result(sParma, function(res) {
                        _dealData(res);
                        var obj = {
                            total: res.data.total,
                            data: res.data.list,
                            rangeMin: num * 100
                        }
                        total = res.data.total;
                        $.UTIL.apply(onLoad, [ obj ]);
                        $("#error").hide();
                    }, function() {
                        onError();
                    });
                })(type, num, onLoad, onError, isPreload);
            }
        });
    }
    function initAP(isBack) {
        if (!input.get()) {
            s_hot.show();
            return;
        }
        if (!isBack) {
            firstLineIndex = 0;
        }
        if ($(".searchPanel").length) {
            $(".searchPanel").remove();
        }
        return new $.AnimatePanel({
            lineHeight: 100,
            shadowLine: 1,
            showLine: 7,
            columnSize: 2,
            total: total,
            firstLineIndex: firstLineIndex,
            className: "searchPanel",
            paddingItem: '<div class="search_item"></div>',
            transition: "all .6s",
            render: renderSearchList,
            update: updateInfo
        });
    }
    function renderSearchList(begin, end) {
        var html = "", content = "";
        var data = rederData(begin, end);
        //条数
        if (data.length === 0) {
            renderTotal(0);
            $(".searchPanel").remove();
            $("#noSearch").show();
            $("#detailCon").hide();
            return;
        }
        for (var i = 0; i < data.length; i++) {
            content = data[i].docType === "program" ? "" + data[i].channelName + " : " + data[i].nameWithCss + " " + data[i].starttime.slice(0, 8) + "" : data[i].nameWithCss;
            html += '<div class="search_item" id="search_item' + (begin + i) + '"><div class="search_content autoText"> ' + content + "</div></div>";
        }
        if(changeList){
            $(".searchPanel").css("-webkit-transform","translate(-720px)");
        }
        return html;
    }
    function rederData(begin, end) {
        return fd.sync(begin, end);
    }
    function searchFocus() {
        $.focusTo({
            el: "#search_item" + focusIndex,
            marquee: [ "#search_item" + focusIndex + " .autoText" ]
        });
        detailIndex(focusIndex)
    }
    function updateInfo(info) {
        total = info.total;
        firstLineIndex = info.firstLineIndex;
        if (info.turnLine) {
            focusIndex -= info.columnSize * info.turnLine;
            focusIndex = Math.max(Math.min(focusIndex, info.total - 1), 0);
        }
    }
    function getTotalLine() {
        return Math.ceil(total / columnSize);
    }
    function getFirstIndex() {
        return firstLineIndex * columnSize;
    }
    function detailIndex (focusIndex){
        var data = rederData(focusIndex, focusIndex + 1)[0];
        detailContent.getDetailInfo(data)
    }
    function s_searchList() {
        var key = "s_searchList";
        var keysMap = {
            KEY_DOWN: function() {
                if (Math.floor(focusIndex / columnSize) === getTotalLine() - 1) {
                    return true;
                }
                if (focusIndex >= getFirstIndex() + columnSize * (showLine - 1)) {
                    ap.dragUp();
                } else {
                    if (focusIndex + columnSize < total) {
                        focusIndex += columnSize;
                    } else {
                        if (firstLineIndex + Math.floor(focusIndex / columnSize) != getTotalLine() - 1) {
                            focusIndex = total - 1;
                        }
                    }
                }
                searchFocus();
                return true;
            },
            KEY_UP: function() {
                if (focusIndex < columnSize) {
                    $.pTool.active("s_classList");
                    isRight = true;
                    return;
                }
                if (focusIndex < getFirstIndex() + columnSize) {
                    ap.dragDown();
                    searchFocus();
                } else {
                    focusIndex -= columnSize;
                    searchFocus();
                }
                return true;
            },
            KEY_LEFT: function() {
                if (focusIndex % columnSize == 0) {
                    $.pTool.active(lastPlug);
                    _moveRight();
                } else {
                    focusIndex--;
                    searchFocus();
                }
                return true;
            },
            KEY_RIGHT: function() {
                if ((focusIndex + 1) % columnSize != 0 && focusIndex + 1 != total) {
                    focusIndex++;
                    searchFocus();
                }
                return true;
            },
            KEY_PAGEDOWN: function() {
                if (firstLineIndex >= getTotalLine() - showLine) {
                    return true;
                }
                ap.dragPageUp();
                searchFocus();
                return true;
            },
            KEY_PAGEUP: function() {
                if (firstLineIndex == 0) {
                    return true;
                }
                ap.dragPageDown();
                searchFocus();
                return true;
            },
            KEY_OK: function() {
                var data = fd.sync(focusIndex, focusIndex + 1);
                switch (data[0].docType) {
                  case "vod":
                    var detail = {
                        contentId: data[0].id,
                        categoryId: CATEGORYID,
                        contentType: data[0].seriesFlag
                    };
                    $.gotoDetail(detail);
                    break;
                  case "program":
                    var arg = {
                        channelId: data[0].channelIds[0],
                        startTime: data[0].starttime.substr(0, 12),
                        endTime: data[0].endtime.substr(0, 12)
                    };
                    if (new $.Date().format("yyyyMMddhhmmss") < data[0].endtime) {
                        delete arg.endTime;
                    }
                    $.playLiveOrRec(arg);
                }
                return true;
            }
        };
        var deactive = function() {
            isActive = false;
        };
        var active = function() {
            isActive = true;
            searchFocus();
        };
        return {
            key: key,
            keysMap: keysMap,
            active: active,
            deactive: deactive
        };
    }
    function activeNoSeach() {
        hot.active();
    }
    var initFocus = function(opt) {
        focusIndex = opt && opt.focusIndex || 0;
        firstLineIndex = opt && opt.firstLineIndex || 0;
    };
    var classP = function() {
        var key = "s_classList";
        var f = function() {
            $.focusTo({
                el: "#s_class" + index
            });
        };
        var keysMap = {
            KEY_DOWN: function() {
                if (flag) {
                    $.pTool.active("s_searchList");
                    isRight = false;
                }
                return true;
            },
            KEY_LEFT: function() {
                if (index > 0) {
                    index--;
                    initList(index, index);
                    f();
                    changeList = true;
                } else {
                    _moveRight()
                    $.pTool.active(lastPlug);
                    return true;
                }
                return true;
            },
            KEY_UP: function() {
                if(index == 0){
                    return true;
                }
            },
            KEY_RIGHT: function() {
                if (index < classList.length) {
                    index++;
                    initList(index, index);
                    f();
                    changeList = true;
                }
                return true;
            }
        };
        var active = function() {
            $("#s_class" + index).removeClass("current");
            sText = input.get();
            f();
        };
        var deactive = function() {
            $("#s_class" + index).addClass("current");
        };
        return {
            key: key,
            keysMap: keysMap,
            active: active,
            deactive: deactive
        };
    }();
    function getState() {
        return {
            isActive: isActive,
            focusIndex: focusIndex,
            index: index,
            firstLineIndex: firstLineIndex,
            classList: classList,
            cat: index ? classList[index - 1].id : 0,
            total: oTotal
        };
    }
    return {
        init: _init,
        hide: _hide,
        show: _show,
        renderList:renderList,
        noSearchAuto: noSearchAuto,
        activeNoSeach: activeNoSeach,
        s_searchList: s_searchList,
        setIndex: function(opt) {
            firstLineIndex = opt.firstLineIndex || 0;
            focusIndex = opt.focusIndex || 0;
            index = opt.index || 0;
            classList = opt.classList || [];
            total = opt.total;
        },
        initFocus: initFocus,
        classListPlug: classP,
        searchPlug: s_searchList,
        getState: getState,
        sText: function(s) {
            sText = s;
        }
    };
}();

//右侧详情
var detailContent = function (){
    var $detailCon = null,$pic = null,$channelName = null,$channelScore = null,$yearInfo = null,$Director = null,$Actor = null,$Introduce = null;
    function init() {
        $detailCon = $("#detailCon");
        $picContent = $("#detailCon .pic");
        $pic = $("#detailCon .pic img");
        $vipCorner = $("#detailCon .vipCon");
        $channelName = $("#detailCon .channelName");
        $channelScore = $("#detailCon .channelScore");
        $yearInfo = $("#detailCon #yearInfo");
        $programName = $("#detailCon #programName");
        $crewInfo = $("#detailCon #crewInfo");
        $Director = $("#detailCon #crewInfo .Director");
        $Actor = $("#detailCon #crewInfo .Actor");
        $Introduce = $("#detailCon #crewInfo .Introduce");
        $detailError = $("#rightContent #detailError")
    }
    function render (opt){
        $pic.attr("src", opt.pics);
        var haveSinglepoint = opt.ChargesArray.indexOf("1100000184") > -1 || opt.ChargesArray.indexOf("1100000383") > -1 || opt.ChargesArray.indexOf("1100000185") > -1 || opt.ChargesArray.indexOf("1100000781") > -1;
        var vipCorner = opt.ChargesArray.indexOf("1100000761") > -1 ? '<div class="MoviesVip"></div>' : opt.ChargesArray.indexOf("1100000381") > -1 ? '<div class="childrenVip"></div>' : haveSinglepoint == true ? '<div class="SinglepointVip"></div>' : opt.ChargesArray.indexOf("1100000181") > -1 ? '<div class="Qiyivip"></div>' : opt.ChargesArray.indexOf("1100000241") > -1 ? '<div class="MoviesVip"></div>' : ''
        $vipCorner.html(vipCorner);
        $channelName.html(opt.name);
        $channelScore.html(opt.rating);
        var year = opt.onlineYear ? '<div class="year">' + opt.onlineYear + "</div>" : "";
        var type = opt.tags ? '<div class="year">' + opt.tags + "</div>" : "";
        var vip = opt.vip ? '<div class="vip"></div>' : "";
        var eps = opt.eps ? '<div class="episodeText">' + opt.eps + "</div>" : "";
        $yearInfo.html(vip + year + type + eps);
        $Director.html(opt.director);
        $Actor.html(opt.vodActordis);
        $Introduce.html($.substringElLength(opt.des, "25px", "2250px").last);
    }
    function getSeriesInfo(type, current, total) {
        var collection = "";
        if(type == 2) {
            collection = current === total ? total + "集全" : "更新至" + current + "集";
        } else if (type == 3) {
            collection = current === total ? total + "期全" : "更新至" + current + "期";
        }
        return collection;
    }
    function getDetailInfo (res){
        $detailError.hide();
        if (!res) {
            $detailCon.hide();
            $detailError.show();
            return;
        }
        if(res.docType === "program") {
            $channelName.html(res.channelName);
            $channelScore.html("");
            $programName.html(res.name);
            var img = channelImgMap[res.channelIds[0]]
            if (img) {
                $pic.attr("src", img);
            } else {
                $pic.attr("src", "");
            }
            hide();
            return
        }
        request.detail(res.id, function(data) {
            var detailObj = {
                name: data.vodName,
                onlineYear: data.onlineTimes && data.onlineTimes.substring(0, 4),
                tags: (data.vodTags || data.seriesTags || []).join(" "),
                vip: data.vipFlag !== "0",
                director: data.vodDirector.split("、").join(" "),
                vodActordis: data.vodActordis.split("、").join(" "),
                des: data.vodDescription || "",
                pics: data.vodPicMap[101] ? $.getVariable("EPG:pathPic") + "/" + data.vodPicMap[101] : "",
                rating: data.vodRatingNum,
                eps: getSeriesInfo(data.vodSeriesflag, data.currentNum, data.totalNum),
                ChargesArray: (data.jsVodChargesToCps ? data.jsVodChargesToCps : data.jsSerChargesToCps).map((item)=>{
                    return item.chargeId
                })
            };
            show()
            render(detailObj);
        }, function() {
            $detailError.show();
        });
    }
    function show(){
        $programName.hide();
        $yearInfo.show();
        $crewInfo.show();
        $detailError.hide();
        $vipCorner.show();
    }
    function hide(){
        $programName.show();
        $yearInfo.hide();
        $crewInfo.hide();
        $detailError.hide();
        $vipCorner.hide();
    }
    return {
        init: init,
        render: render,
        getDetailInfo : getDetailInfo,
    }
}();