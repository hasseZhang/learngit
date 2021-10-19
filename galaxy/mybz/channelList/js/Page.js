var pageName = "channelList";

var RECODE_DATA_KEY = "channelList";

$.recodeData(pageName, "access");

var dataChannel = $.getHelper("data:channel");

var CHANNEL_LIST_DS = dataChannel.CHANNEL_LIST_DS, CHANNEL_LIST_NAME = dataChannel.CHANNEL_LIST_NAME, channelListMap = dataChannel.channelListMap, date_ds = [], date_ds_return = [], schedule_ds = [], listState = "b", listStateArr = [ "a", "b", "c", "d" ], liveIndex = 0, $a_list = null, $a_list_wrap = null, a_list_begin = 0, a_list_index = 0, a_list_size = 7, a_list_fixed = 3, a_list_shadow = 1, $b_list = null, $b_list_wrap = null, b_list_begin = 0, b_list_index = 0, b_list_playing_index = 0, b_list_playing_content = "", b_list_size = 8, b_list_fixed = 4, b_list_shadow = 1, $c_list = null, $c_list_wrap = null, c_list_begin = 0, c_list_index = 0, c_list_size = 7, c_list_fixed = 3, c_list_total = 7, c_list_shadow = 1, $d_list = null, $d_list_wrap = null, d_list_begin = 0, d_list_playing_id = "f_D_list_0", d_list_size = 7, d_list_fixed = 3, d_list_shadow = 1, d_list_index = 0, c_d_list_map = undefined, listLineHeightObj = {};

var $focus = null;

var $cfav = null;

var cfavData = {};

var reserveData = {};

var isCfavF = false;

var channelIdOriginal = CHANNEL_LIST_DS[38].channelId;

var vipFlag = $.search.get("vipFlag");

var vipChanIndex = function() {
    var vipGroupIndex = 0;
    $.UTIL.each(CHANNEL_LIST_NAME, function(value, index) {
        if (value === "付费") {
            vipGroupIndex = index;
            return true;
        }
    });
    return vipGroupIndex;
}();

dateData();

function load() {
    $.reserve.all(function(data) {
        $.UTIL.each(data.data, function(value, index) {
            reserveData[value.channelId.channelId + "-" + value.startTime] = 1;
        });
        $.s.chanfav.all(null, {
            success: function(data) {
                if (data && data.data) {
                    $.UTIL.each(data.data, function(value, index) {
                        cfavData[value.channelId] = 1;
                    });
                }
                initEl();
            },
            error: function() {
                initEl();
            }
        });
    });
    $a_list = $("#a_list");
    $b_list = $("#b_list");
    $c_list = $("#c_list");
    $d_list = $("#d_list");
    $a_list_wrap = $("#a_list_wrap");
    $b_list_wrap = $("#b_list_wrap");
    $c_list_wrap = $("#c_list_wrap");
    $d_list_wrap = $("#d_list_wrap");
    $focus = $("#focus");
    $cfav = $("#cfav");
}

function initEl() {
    if (vipFlag) {
        listState = "a";
        initList(CHANNEL_LIST_DS[channelListMap[vipChanIndex][0]].channelId);
    } else {
        $.isBack()
            ? $.s.chanhis.query(null, {
                success: function(data) {
                    var initChannelId = "";
                    if (data && data.data && data.data[0] && data.data[0].channelId) {
                        initChannelId = data.data[0].channelId;
                    } else {
                        initChannelId = channelIdOriginal;
                    }
                    initList(initChannelId);
                },
                error: function() {
                    initList(channelIdOriginal);
                }
            })
            : initList(channelIdOriginal);
    }
}

function initList(chanId) {
    $.UTIL.each(CHANNEL_LIST_DS, function(value, index) {
        if (chanId && value.channelId === chanId) {
            b_list_index = index;
            return true;
        }
    });
    findAIndex();
    a_list_begin = Math.max(findInfo("a", "index") - findInfo("a", "fixed"), 0);
    b_list_begin = Math.max(channelListMap[findInfo("a", "index")][0], findInfo("b", "index") - findInfo("b", "fixed"));
    upCurrent();
    createList();
    setABCWrap();
    upCfav();
    moveList("b");
    removeListCurrent("a");
    removeListCurrent("b");
    removeListCurrent("c");
    addCurrent("#a_list" + findInfo("a", "index"));
    moveList("a");
    autoCreateD_list();
    $.pTool.active("channelList");
    if(!$.isBack()) pressLeft.b(), removeListCurrent("b");
    setTimeout(function() {
        $focus.css({
            transition: "0.3s"
        });
        $a_list_wrap.css({
            transition: "0.5s"
        });
        $b_list_wrap.css({
            transition: "0.5s"
        });
        $c_list_wrap.css({
            transition: "0.5s"
        });
    }, 100);
}

function findInfo(listState, type) {
    return window[listState + "_list_" + type];
}

function addCurrent(el) {
    $(el).addClass("current");
}

function removeListCurrent(listState) {
    $(".current", "#" + listState + "_list", true).removeClass("current");
}

function dateData() {
    for (var i = 0; i < c_list_total; i++) {
        var oDate = new $.Date();
        oDate.setDate(oDate.getDate() - i);
        date_ds.push(oDate);
    }
}

function createA_list() {
    var htmlTxt = "";
    for (var i = 0; i < CHANNEL_LIST_NAME.length; i++) {
        htmlTxt += '<div id="a_list' + i + '" class="a_list">' + CHANNEL_LIST_NAME[i] + "</div>";
    }
    $a_list_wrap.html(htmlTxt);
}

function createB_list() {
    var htmlTxt = "";
    for (var i = 0; i < CHANNEL_LIST_DS.length; i++) {
        var channelNum = "" + CHANNEL_LIST_DS[i].num;
        if (channelNum.length < 3) {
            channelNum = ("00" + channelNum).slice(-3);
        }
        htmlTxt += '<div id="b_list' + i + '" class="b_list' + ($.isVipChan(channelNum) ? " vip" : "") + '">' + '<div class="channelNum">' + channelNum + "</div>" + '<div class="channelName">' + CHANNEL_LIST_DS[i].name + "</div>" + "</div>";
    }
    $b_list_wrap.html(htmlTxt);
}

function createC_list() {
    var htmlTxt = "";
    $c_list_wrap.html("");
    for (var i = 0; i < (isVipChan() ? 1 : date_ds.length); i++) {
        var day = "";
        if (i === 0) {
            day = "今天";
        } else if (i === 1) {
            day = "昨天";
        } else if (i > 1) {
            day = date_ds[i].format("MM月dd日");
        }
        htmlTxt += '<div id="c_list' + i + '" class="c_list">' + day + "</div>";
    }
    $c_list_wrap.html(htmlTxt);
}

function isVipChan() {
    return $.isVipChan(CHANNEL_LIST_DS[findInfo("b", "index")].num);
}

var autoCreateC_list = function() {
    var preChanNum = 0;
    var isFirst = true;
    return function() {
        var nowChanNum = CHANNEL_LIST_DS[findInfo("b", "index")].num;
        if ($.isVipChan(nowChanNum) !== $.isVipChan(preChanNum) || isFirst) {
            createC_list();
        }
        isFirst = true;
        preChanNum = nowChanNum;
    };
}();

var timer = null;

function createD_list() {
    clearD_list();
    timer = setTimeout(function() {
        var hasLive = false; // 解决:有的直播没有当前播放的节目单,导致右移动无焦点
        var noLiveIndex; // 没有直播节目单时,获取 预约第一个节目.
        var channelId = CHANNEL_LIST_DS[findInfo("b", "index")].channelId;
        var day = date_ds[findInfo("c", "index")].format("yyyy-MM-dd");
        (function(bIndex, cIndex) {
            $.s.playbill.get({
                date: day,
                id: channelId
            }, {
                success: function(data) {
                    if (bIndex !== findInfo("b", "index") || cIndex !== findInfo("c", "index")) {
                        return;
                    }
                    schedule_ds = data.programs;
                    var htmlTxt = "";
                    var now = new $.Date().format("yyyy-MM-dd hh:mm:ss");
                    if (isVipChan()) {
                        for (var i = 0; i < schedule_ds.length; i++) {
                            if (now >= schedule_ds[i].endtime) {
                                schedule_ds.splice(i, 1);
                                i--;
                            }
                        }
                    }
                    $.UTIL.each(schedule_ds, function(v, i) {
                        var startTime = v.starttime;
                        var endTime = v.endtime;
                        var startTimeText = v.starttime.slice(11, 16);
                        var name = v.text;
                        var oStateText = "";
                        var type = "";
                        var stateClass = "";
                        var hasReserveClass = "";
                        if (now < startTime) {
                            noLiveIndex || (noLiveIndex = i + '');
                            startTime = startTime.split("-").join("").split(" ").join("").split(":").join("").slice(0, 12);
                            var stateText = "预约";
                            if (reserveData[CHANNEL_LIST_DS[bIndex].channelId + "-" + startTime]) {
                                stateText = "已预约";
                                hasReserveClass = " hasReserve";
                            }
                            stateClass = " reserve";
                            oStateText = '<div class="state' + hasReserveClass + '">' + stateText + "</div>";
                            type = "reserve";
                        } else if (now >= startTime && now < endTime) {
                            hasLive || (hasLive = true);
                            liveIndex = i;
                            if (findInfo("c", "index") === 0) {
                                d_list_begin = Math.max(liveIndex - findInfo("d", "fixed"), 0);
                            }
                            oStateText = '<div class="state">直播</div>';
                            type = "live";
                        } else {
                            oStateText = "";
                            type = "tvod";
                        }

                        if(!hasLive){
                            liveIndex = +noLiveIndex;
                            if (findInfo("c", "index") === 0) {
                                d_list_begin = Math.max(liveIndex - findInfo("d", "fixed"), 0);
                            }
                        }

                        htmlTxt += '<div id="d_list' + i + '" class="d_list' + stateClass + '" type="' + type + '"><div class="startTime">' + startTimeText + '</div><div class="name">' + name + "</div>" + oStateText + "</div>";
                    });
                    $d_list_wrap.html(htmlTxt);
                    setTimeout(function() {
                        $d_list_wrap.css({
                            transition: "0.5s"
                        });
                    }, 50);
                    setDWrap();
                    moveList("d");
                },
                error: function() {
                    $d_list_wrap.html('<div class="error">暂未获取到节目信息</div>');
                }
            });
        })(findInfo("b", "index"), findInfo("c", "index"));
    }, 200);
}

function autoCreateD_list() {
    clearTimeout(timer);
    upCurrent();
    createD_list();
    upCfav();
}

function clearD_list() {
    $d_list_wrap.html("");
    $d_list_wrap.css({
        transition: "none"
    });
    d_list_begin = 0;
    d_list_index = 0;
    moveList("d");
    c_d_list_map = undefined;
    schedule_ds = [];
}

function createList() {
    createA_list();
    createB_list();
    createC_list();
    createD_list();
}

function setABCWrap() {
    for (var i = 0; i < listStateArr.length - 1; i++) {
        listLineHeightObj[listStateArr[i]] = setOnelistWrap(listStateArr[i]);
    }
}

function setDWrap() {
    listLineHeightObj["d"] = setOnelistWrap("d");
}

function setOnelistWrap(listState) {
    var listId = listState + "_list";
    var listLineHeight = $("#" + listId + " ." + listId).clientHeight() + parseInt($("#" + listId + " ." + listId).css("margin-bottom"));
    var listHeight = listLineHeight * findInfo(listState, "size") + "px";
    window["$" + listState + "_list"].css({
        height: listHeight
    });
    return listLineHeight;
}

function upCfav() {
    var cfavText = "收藏频道";
    $cfav.removeClass("cfaved");
    if (cfavData[CHANNEL_LIST_DS[findInfo("b", "index")].channelId]) {
        $cfav.addClass("cfaved");
        cfavText = "已收藏";
    }
    $cfav.html(cfavText);
}

function upCurrent() {
    if (listState === "c") {
        return true;
    }
    removeListCurrent("c");
    $.isBack() && addCurrent("#c_list" + findInfo("c", "index"));
    if (listState === "b") {
        return true;
    }
    removeListCurrent("b");
    addCurrent("#b_list" + findInfo("b", "index"));
}

$.pTool.add("channelList", {
    key: "channelList",
    keysMap: {
        KEY_DOWN: function() {
            pressDown[listState] && pressDown[listState]();
            return true;
        },
        KEY_UP: function() {
            pressUp[listState] && pressUp[listState]();
            return true;
        },
        KEY_LEFT: function() {
            pressLeft[listState] && pressLeft[listState]();
            return true;
        },
        KEY_RIGHT: function() {
            pressRight[listState] && pressRight[listState]();
            return true;
        },
        KEY_PAGEUP: function() {
            pressPageUp[listState] && pressPageUp[listState]();
            return true;
        },
        KEY_PAGEDOWN: function() {
            pressPageDown[listState] && pressPageDown[listState]();
            return true;
        },
        KEY_OK: function() {
            pressOk[listState] && pressOk[listState]();
            return true;
        }
    },
    active: function() {
        focusTo();
    },
    deactive: function() {},
    cover: function() {
        return true;
    },
    uncover: function() {
        return true;
    }
});

function focusTo() {
    var listId = listState + "_list";
    var parentTop = window["$" + listId].offsetTop();
    var elLeft = window["$" + listId].offsetLeft();
    var elTop = parentTop + listLineHeightObj[listState] * (findInfo(listState, "index") - findInfo(listState, "begin"));
    var elWidth = $("." + listId).offsetWidth();
    var elHeight = $("." + listId).offsetHeight();
    if (listState === "d") {
        $focus.addClass("d_listF");
    } else {
        $focus.removeClass("d_listF");
    }
    var focusObj = {
        el: "#" + listId + findInfo(listState, "index"),
        marquee: [ "#" + listId + findInfo(listState, "index") + " .channelName" ]
    };
    if (isCfavF) {
        listId = "cfav";
        elTop = 12;
        elLeft = 580;
        elWidth = 180;
        elHeight = 122;
        focusObj = {
            el: "#cfav"
        };
    }
    $focus.css({
        top: elTop + "px",
        left: elLeft + "px",
        width: elWidth + "px",
        height: elHeight + "px"
    });
    $.focusTo(focusObj);
}

var pressDown = {
    a: function() {
        if (focusMoveMap.down("a", CHANNEL_LIST_NAME.length)) {
            return;
        }
        moveList("a");
        b_list_begin = channelListMap[a_list_index][0];
        moveList("b");
        b_list_index = b_list_begin;
        autoCreateC_list();
        autoCreateD_list();
        focusTo();
    },
    b: function() {
        if (focusMoveMap.down("b", CHANNEL_LIST_DS.length)) {
            return;
        }
        moveList("b");
        if (b_list_index === channelListMap[a_list_index][1]) {
            focusMoveMap.down("a", CHANNEL_LIST_NAME.length);
        }
        removeListCurrent("a");
        addCurrent("#a_list" + a_list_index);
        moveList("a");
        autoCreateC_list();
        autoCreateD_list();
        focusTo();
    },
    c: function() {
        if (isCfavF) {
            isCfavF = false;
        } else {
            if (isVipChan() || focusMoveMap.down("c", findInfo("c", "total"))) {
                return;
            }
            moveList("c");
            autoCreateD_list();
        }
        focusTo();
    },
    d: function() {
        if (focusMoveMap.down("d", schedule_ds.length)) {
            return;
        }
        moveList("d");
        focusTo();
    }
};

var pressUp = {
    a: function() {
        if (focusMoveMap.up("a")) {
            return;
        }
        moveList("a");
        b_list_begin = channelListMap[a_list_index][0];
        moveList("b");
        b_list_index = b_list_begin;
        autoCreateC_list();
        autoCreateD_list();
        focusTo();
    },
    b: function() {
        if (focusMoveMap.up("b")) {
            return;
        }
        moveList("b");
        if (b_list_index === channelListMap[a_list_index][0] - 1) {
            focusMoveMap.up("a", CHANNEL_LIST_NAME.length);
        }
        removeListCurrent("a");
        addCurrent("#a_list" + a_list_index);
        moveList("a");
        autoCreateC_list();
        autoCreateD_list();
        focusTo();
    },
    c: function() {
        if (focusMoveMap.up("c")) {
            isCfavF = true;
            focusTo();
        } else {
            moveList("c");
            autoCreateD_list();
            focusTo();
        }
    },
    d: function() {
        if (focusMoveMap.up("d")) {
            return;
        }
        moveList("d");
        focusTo();
    }
};

var pressLeft = {
    a: function() {},
    b: function() {
        listState = "a";
        removeListCurrent("a");
        addCurrent("#b_list" + findInfo("b", "index"));
        focusTo();
    },
    c: function() {
        listState = "b";
        removeListCurrent("b");
        if (c_list_index !== 0) {
            c_list_index = c_list_begin = 0;
            autoCreateD_list();
        } else {
            addCurrent("#c_list" + findInfo("c", "index"));
        }
        moveList("c");
        if (isCfavF) {
            isCfavF = false;
        }
        focusTo();
    },
    d: function() {
        listState = "c";
        removeListCurrent("c");
        c_d_list_map = findInfo("d", "index");
        focusTo();
    }
};

var pressRight = {
    a: function() {
        listState = "b";
        removeListCurrent("b");
        addCurrent("#a_list" + a_list_index);
        focusTo();
    },
    b: function() {
        listState = "c";
        removeListCurrent("c");
        addCurrent("#b_list" + b_list_index);
        focusTo();
    },
    c: function() {
        if (!schedule_ds.length) {
            return;
        }
        listState = "d";
        addCurrent("#c_list" + c_list_index);
        if (typeof c_d_list_map === "number") {
            d_list_index = c_d_list_map;
        } else {
            if (findInfo("c", "index") === 0) {
                d_list_index = liveIndex;
            } else {
                d_list_index = 0;
            }
        }
        if (isCfavF) {
            isCfavF = false;
        }
        focusTo();
    },
    d: function() {}
};

var pressPageUp = {
    a: function() {
        if (focusMoveMap.pageUp("a")) {
            return;
        }
        moveList("a");
        b_list_begin = channelListMap[a_list_index][0];
        moveList("b");
        b_list_index = b_list_begin;
        autoCreateC_list();
        autoCreateD_list();
        focusTo();
    },
    b: function() {
        if (focusMoveMap.pageUp("b")) {
            return;
        }
        moveList("b");
        findAIndex();
        a_list_begin = Math.max(findInfo("a", "index") - findInfo("a", "fixed"), 0);
        removeListCurrent("a");
        addCurrent("#a_list" + a_list_index);
        moveList("a");
        autoCreateC_list();
        autoCreateD_list();
        focusTo();
    },
    c: function() {
        if (focusMoveMap.pageUp("c") || isCfavF) {
            return;
        }
        moveList("c");
        autoCreateD_list();
        focusTo();
    },
    d: function() {
        if (focusMoveMap.pageUp("d")) {
            return;
        }
        moveList("d");
        focusTo();
    }
};

var pressPageDown = {
    a: function() {
        if (focusMoveMap.pageDown("a", CHANNEL_LIST_NAME.length)) {
            return;
        }
        moveList("a");
        b_list_begin = channelListMap[a_list_index][0];
        moveList("b");
        b_list_index = b_list_begin;
        autoCreateC_list();
        autoCreateD_list();
        focusTo();
    },
    b: function() {
        if (focusMoveMap.pageDown("b", CHANNEL_LIST_DS.length)) {
            return;
        }
        moveList("b");
        findAIndex();
        a_list_begin = Math.max(findInfo("a", "index") - findInfo("a", "fixed"), 0);
        removeListCurrent("a");
        addCurrent("#a_list" + a_list_index);
        moveList("a");
        autoCreateC_list();
        autoCreateD_list();
        focusTo();
    },
    c: function() {
        if (focusMoveMap.pageDown("c", c_list_total) || isCfavF) {
            return;
        }
        moveList("c");
        autoCreateD_list();
        focusTo();
    },
    d: function() {
        if (focusMoveMap.pageDown("d", schedule_ds.length)) {
            return;
        }
        moveList("d");
        focusTo();
    }
};

var pressOk = {
    b: function() {
        playLiveOrRec();
    },
    c: function() {
        if (isCfavF) {
            var nowChannelId = CHANNEL_LIST_DS[findInfo("b", "index")].channelId;
            if (cfavData[nowChannelId]) {
                $.s.chanfav.remove({
                    channelId: nowChannelId
                }, {
                    success: function(data) {
                        if (data.code === 0) {
                            cfavData[nowChannelId] = 0;
                            $cfav.removeClass("cfaved").html("收藏频道");
                        }
                    }
                });
            } else {
                $.s.chanfav.add({
                    channelId: nowChannelId
                }, {
                    success: function(data) {
                        if (data.code === 0) {
                            cfavData[nowChannelId] = 1;
                            $cfav.addClass("cfaved").html("已收藏");
                        }
                    }
                });
            }
        }
    },
    d: function() {
        var type = $("#d_list" + findInfo("d", "index")).attr("type");
        if (type === "live") {
            playLiveOrRec();
        } else if (type === "reserve") {
            var nowChannelInfo = CHANNEL_LIST_DS[findInfo("b", "index")];
            if (reserveData[nowChannelInfo.channelId + "-" + new $.Date(schedule_ds[findInfo("d", "index")].starttime).format("yyyyMMddhhmm")]) {
                (function(d_index) {
                    var startTimeText = new $.Date(schedule_ds[d_index].starttime).format("yyyyMMddhhmm");
                    $.reserve.remove(startTimeText, function(data) {
                        $("#d_list" + d_index + ".reserve .state").removeClass("hasReserve").html("预约");
                        reserveData[nowChannelInfo.channelId + "-" + startTimeText] = 0;
                    }, function() {});
                })(findInfo("d", "index"));
            } else {
                (function(d_index) {
                    var startTimeText = new $.Date(schedule_ds[d_index].starttime).format("yyyyMMddhhmm");
                    $.reserve.add(nowChannelInfo.channelId, schedule_ds[d_index].text, startTimeText, function(data) {
                        $("#d_list" + d_index + ".reserve .state").addClass("hasReserve").html("已预约");
                        reserveData[nowChannelInfo.channelId + "-" + startTimeText] = 1;
                    }, function() {}, function(data) {
                        $("#d_list" + d_index + ".reserve .state").addClass("hasReserve").html("已预约");
                        reserveData[nowChannelInfo.channelId + "-" + startTimeText] = 1;
                        reserveData[data.channelId.channelId + "-" + data.startTime] = 0;
                    }, function() {});
                })(findInfo("d", "index"));
            }
        } else {
            var data = schedule_ds[findInfo("d", "index")];
            data.starttime = data.starttime.split("-").join("").split(" ").join("").split(":").join("").slice(0, 12);
            data.endtime = data.endtime.split("-").join("").split(" ").join("").split(":").join("").slice(0, 12);
            $.playLiveOrRec({
                channelId: CHANNEL_LIST_DS[findInfo("b", "index")].channelId,
                startTime: data.starttime,
                endTime: data.endtime
            });
        }
    }
};

function playLiveOrRec() {
    $.playLiveOrRec({
        channelId: CHANNEL_LIST_DS[findInfo("b", "index")].channelId
    });
}

var focusMoveMap = {
    up: function(listState) {
        if (findInfo(listState, "index") === 0) {
            return true;
        }
        if (findInfo(listState, "index") === findInfo(listState, "begin") + findInfo(listState, "fixed") && findInfo(listState, "begin") > 0 || findInfo(listState, "index") === findInfo(listState, "begin")) {
            window[listState + "_list_begin"]--;
        }
        window[listState + "_list_index"]--;
    },
    down: function(listState, listLength) {
        if (findInfo(listState, "index") === listLength - 1) {
            return true;
        }
        if (findInfo(listState, "index") === findInfo(listState, "begin") + findInfo(listState, "fixed")) {
            window[listState + "_list_begin"]++;
        }
        window[listState + "_list_index"]++;
    },
    pageUp: function(listState) {
        if (findInfo(listState, "begin") === 0) {
            return true;
        }
        var preBegin = findInfo(listState, "begin");
        window[listState + "_list_begin"] -= findInfo(listState, "size") - findInfo(listState, "shadow");
        if (findInfo(listState, "begin") < 0) {
            window[listState + "_list_begin"] = 0;
        }
        var nowBegin = findInfo(listState, "begin");
        var dis = preBegin - nowBegin;
        window[listState + "_list_index"] -= dis;
    },
    pageDown: function(listState, listLength) {
        if (findInfo(listState, "begin") === listLength - findInfo(listState, "fixed") - 1) {
            return true;
        }
        var preBegin = findInfo(listState, "begin");
        window[listState + "_list_begin"] += findInfo(listState, "size") - findInfo(listState, "shadow");
        if (findInfo(listState, "begin") > listLength - findInfo(listState, "fixed") - 1) {
            window[listState + "_list_begin"] = listLength - findInfo(listState, "fixed") - 1;
        }
        var nowBegin = findInfo(listState, "begin");
        var dis = nowBegin - preBegin;
        window[listState + "_list_index"] += dis;
    }
};

function moveList(listState) {
    window["$" + listState + "_list_wrap"].css({
        "-webkit-transform": "translateY(" + -findInfo(listState, "begin") * listLineHeightObj[listState] + "px)"
    });
}

function findAIndex() {
    for (var i = 0; i < CHANNEL_LIST_NAME.length; i++) {
        if (findInfo("b", "index") >= channelListMap[i][0] && findInfo("b", "index") < channelListMap[i][1]) {
            a_list_index = i;
            break;
        }
    }
}