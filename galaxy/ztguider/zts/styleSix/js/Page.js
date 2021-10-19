var ACTIVE_OBJECT;
var PAGE_NAME = "ZT_STYLESIX" + subjectId;
var DATA = DATALIST;
var PAGE_INFO = [{ key: "video", pressRight: _vRight, pressOk: _vOk }, { key: "list", pressDown: _down, pressUp: _up, pressPageDown: _pageDown, pressPageUp: _pageUp, pressOk: _ok, pressLeft: _left }], LISTSIZE = 3, LISTPRE = "item", TIPHIDETIME = 5e3, TRYSEETIME = 360, categoryId = subjectId, isSuportKKKK = isSuport4K(), pageInfo = $.initPageInfo(PAGE_NAME, ["firstLineIndex", "focusIndex", "playIndex", "focus", "listFocus"], { firstLineIndex: 0, focusIndex: 0, playIndex: 0, focus: "item0", listFocus: "item0" });
var firstLineIndex = pageInfo.firstLineIndex, focusIndex = pageInfo.focusIndex, playIndex = pageInfo.playIndex, total = 0, data = [], contentIdArr = [], oPlayInfo = {}, listFocus = pageInfo.listFocus, $video = null, $list = null, $progressBar = null, $strip = null, startTime = 0, nowAuthContentId = "", authStaus = "pass", nowPlayIndex = "", vl = null;
var $ArrowUp,$ArrowDown;
var $oCanvas,oGC;
function initPage() {
    $.recodeData(subjectName, "zt");
    $video = $("#video");
    $list = $(".right .list");
    _initBackGround();
    initArrow();
    loadData();
}
function _initBackGround() {
    // $oCanvas = $("#caBg")[0];
    // oGC = $oCanvas.getContext("2d");
    // var oImg = new Image();
    // oImg.src = bImgPath;
    // oImg.onload = function(){
    //     oGC.drawImage(oImg, 0,0,1920, 1080);
    // };  
    $("body").css("background", 'url("' + bImgPath + '") no-repeat transparent');
}

var list = {
    focus: function () {
        $.focusTo("list");
        $(".list #item" + focusIndex).addClass("focusBorder");
        // $(".list #item" + focusIndex + " .name").removeClass("hide");
        titleScroll();
    },
    blur: function () {
        $(".list #item" + focusIndex).removeClass("focusBorder");
        // $(".list #item" + focusIndex + " .name").addClass("hide");
        // $(".list #item" + focusIndex).hasClass('play')  ?   "" : $(".list #item" + focusIndex + " .name").addClass("hide");
    }
};
function loadData() {
    data = DATA.valList;
    // _test(data)
    for (var e = 0; e < data.length; e++) {
        data[e].name = data[e].contentName.split("@")[0];
    }
    total = data.length;
    // progress();
    renderPage(function () { initPlayer(initFocus) })
}
function savePageInfo() {
    $.savePageInfo(PAGE_NAME, { focusIndex: focusIndex, firstLineIndex: firstLineIndex, playIndex: playIndex, focus: ACTIVE_OBJECT.key, listFocus: listFocus || LISTPRE + focusIndex })
}
function renderPage(e) {
    contentIdArr = [];
    for (var t = data.length, a = 0; a < t; a++) {
        "1" === data[a].vipFlag && contentIdArr.push(data[a].contentId)
    };
    loadDataResource(contentIdArr, function (a) {
        for (var n = "", s = "", o = "", i = "", l = 0; l < t; l++) { 
            i = data[l].name;
             s = l == playIndex ? l == nowPlayIndex ? " play player" : " play" : "";
             picPath = data[l].imgPath;
            o = $.substringElLength(data[l].contentName.split("@")[1] || "", "33px", "407px").last; 
            n += '<div id="' + LISTPRE + l + '" class="' + LISTPRE + s + '"><img class="pic" src="' + picPath + '" alt=""><div class="bgText"><div class="name autoText">' + i + '</div></div></div>'
        };       
        $(".list").html(n), listMove(), e && e()
    })
}
function initArrow(){
    $("<div id='arrowUp' class='hide'></div><div id='arrowDown' class='hide'></div>").appendTo($("body"));
    $ArrowUp = $("#arrowUp");
    $ArrowDown = $("#arrowDown");
}
function arrowShow(){
    firstLineIndex > 0 ? $ArrowUp.removeClass('hide') : $ArrowUp.addClass('hide');
    firstLineIndex < total - LISTSIZE ? $ArrowDown.removeClass('hide') :  $ArrowDown.addClass('hide');
}
function initFocus() {
    "video" === pageInfo.focus ? focusToVideo() : list.focus()
}
function listMove() {
    arrowShow();
    var e = -266 * firstLineIndex;
    $list.css("-webkit-transform", "translateY(" + e + "px)");
}
function titleScroll() {
    var e = $(".focusBorder .name");
    t = e.html();
    a = $(".focusBorder .name").attr("wt");
    t != a ? $.Marquee({ el: e[0], all: a }) : $.Marquee()
}
function renderPlayInfo() {
    var e = $.substringElLength(data[playIndex].name, "50px", "900px").last; 
    // $playTitle.html(e)
}
function _left() {
    list.blur();
    focusToVideo()
}
function _up() {
    if (focusIndex - firstLineIndex == 0) {
        if (0 == firstLineIndex) {
            return void $("#" + LISTPRE + focusIndex).addClass("public_shake");
        }
        firstLineIndex--;
        listMove();
    }
    list.blur();
    focusIndex--;
    list.focus()
}
function _down() {
    focusIndex >= total - 1 ? $("#" + LISTPRE + focusIndex).addClass("public_shake") : (focusIndex == firstLineIndex + LISTSIZE - 1 && (firstLineIndex++, listMove()),  list.blur(), focusIndex++,  list.focus())
}
function _pageUp() {
    0 != firstLineIndex && (focusIndex -= firstLineIndex - (firstLineIndex = firstLineIndex - LISTSIZE < 0 ? 0 : firstLineIndex - LISTSIZE), list.blur(), list.focus(), listMove())
}
function _pageDown() {
    firstLineIndex < total - LISTSIZE && (firstLineIndex += LISTSIZE, focusIndex = focusIndex + LISTSIZE >= total ? total - 1 : focusIndex + LISTSIZE, list.blur(), list.focus(), listMove())
}
function _ok() {
    var e = is4KVod(data[playIndex].name) && !isSuportKKKK;
    if (playIndex !== focusIndex) {
        if (listRemoveClass(), playIndex = focusIndex, e) return stopMp(), void videoBg.noSupport4K();
        play(null, !0)
    } else {
        if (e) return; _vOk()
    }
}
function _vRight() {
    tips.fullPlay.hide();
    tips.order.hide();
    firstLineIndex + LISTSIZE > playIndex && playIndex >= firstLineIndex && (focusIndex = playIndex), list.focus()
}
function _vOk() {
    switch (authStaus) {
        case "pass": fullPlay(); break;
        case "noPass": savePageInfo(), vl.save(), $.auth.forwardOrder()
    }
}
function focusToVideo() {
    switch (authStaus) {
        case "pass": tips.fullPlay.show(); break;
        case "noPass": tips.order.show()
    }
    $.focusTo("video")
}
var tips = {
    fullPlay: {
        timer: null,
        show: function () {
            this.hide();
            $video.addClass("fullPlay");
            tipHide.call(this)
        },
        hide: function () {
            clearTimeout(this.timer);
            $video.removeClass("fullPlay")
        }
    },
    order: {
        timer: null,
        show: function () {
            this.hide();
            $video.addClass("order");
            tipHide.call(this)
        },
        hide: function () {
            clearTimeout(this.timer);
            $video.removeClass("order")
        }
    },
    trySee: {
        show: function () {
            $video.addClass("trySee")
        },
        hide: function () {
            $video.removeClass("trySee")
        }
    },
    rm: function () {
        $video.removeClass("trySee").removeClass("fullPlay").removeClass("order")
    }
};
function tipHide() {
    this.timer = setTimeout(this.hide.bind(this), TIPHIDETIME)
}
var videoBg = {
    order: function () {
        tips.order.show();
        $video.addClass("orderBg")
    },
    trySeeEnd: function () {
        tips.order.show();
        $video.addClass("trySeeEnd")
    },
    noSupport4K: function () {
        $video.addClass("no4K")
    },
    rm: function () {
        $video.removeClass("orderBg").removeClass("trySeeEnd").removeClass("no4K")
    }
}
var loadDataResource = function () {
    var e = [], t = 0, a = null, n = [];
    var s = function () {
        var o = e[t++];
        if (!o) return a(n);
        oPlayInfo[o] ? (n.push(oPlayInfo[o]), arguments.callee.call(null, arguments)) : $.s.detail.get({ id: o }, { success: function (a) { var o = a.vodId; e[t - 1] == o && (oPlayInfo[o] = { package: a.jsVodChargesToCps }, n.push(oPlayInfo[o]), s()) }, error: function () { oPlayInfo[o] = { totalTime: "", package: "" }, n.push(oPlayInfo[o]), s() } })

    };
    return function (o, i) {
        t = 0, n = [], e = o, a = i, s()
    }

}();
function initPlayer(e) {
    play(e)
}
function play(e, t) {
    stopMp(), tips.rm();
    var a = data[playIndex].contentId, n = data[playIndex].name, s = "1" === data[playIndex].vipFlag;
    if (renderPlayInfo(), s) {
        var o = oPlayInfo[a].package;
        return nowAuthContentId = a, authStaus = "pass", void $.auth.auth({ entrance: "", playData: { contentId: a, vodName: n, categoryId: subjectId, contentType: "0", noFromDetail: !0 }, package: o, callback: function (n) { if (nowAuthContentId !== a) return; n ? (authStaus = "pass", sizePlay(t)) : (authStaus = "noPass", trySeeOrOrder(t)); e && e() } })
    }
    authStaus = "pass", sizePlay(t), e && e()
}
function sizePlay(e) {
    var t = 0;
    if (videoBg.rm(), vl || (
        vl = $.playSizeList({
            left: 157,
            top: 318,
            width: 1098,
            height: 616,
            list: data,
            current: 0,
            multiVod: !1,
            endPoint: "pass" === authStaus ? void 0 : TRYSEETIME, auto: !1,
            loading: function (e) {
                if ("url" === e) {
                    if (!vl) return;
                    $.initVolume(vl.mp)
                }
            },
            onPlay: function (e) {
                // canvasBg([157, 318, 1098, 616])
                addPlayerClass()
            },
            onEnd: function (e) {
                if (vl.cfg.endPoint) return stopMp(), tips.trySee.hide(), void videoBg.trySeeEnd();
                listRemoveClass();
                ++playIndex === total && (playIndex = 0), play()
            },
            onError: function (e) { return !0 }
        },
            categoryId,
            function () {
                return $.auth.getchargeSpIds(data[playIndex].contentId)
            },
            categoryId
        ), $.isBack() && (t = vl.valueOf().playTime)), vodName = data[playIndex].name, id = data[playIndex].contentId, is4KVod(vodName) && !isSuportKKKK
        )
    return stopMp(), void videoBg.noSupport4K();
    $("#" + LISTPRE + playIndex).addClass("play");
    vl.playBy({ playTime: t, val: playIndex, endPoint: "pass" === authStaus ? void 0 : TRYSEETIME }) 
}
function listRemoveClass() {
    $("#" + LISTPRE + playIndex).removeClass("play")
}
function fullPlay() {
    savePageInfo(), vl && vl.enter({ multiVod: !1, contentId: data[playIndex].contentId, ztCategoryId: subjectId })
}
function stopMp() {
    $("#" + LISTPRE + playIndex).removeClass("player"), vl && vl.stop()
}
function trySeeOrOrder(e) {
    if (videoBg.rm(), +data[playIndex].totalTime > 30) return stopMp(), sizePlay(e), void tips.trySee.show();
    listRemoveClass();
    $("#" + LISTPRE + playIndex).addClass("play");
    videoBg.order()
}
function isSuport4K() {
    var e = Authentication.CUGetConfig("STBType"); return !/V9A|V6|E909|B760EV3/.test(e)
}
function is4KVod(e) {
    return /4k/i.test(e)
}
function addPlayerClass() {
    $("#" + LISTPRE + playIndex).addClass("player");
    nowPlayIndex = playIndex;
    "pass" !== authStaus ? "noPass" === authStaus && tips.order.show() : tips.fullPlay.show()
}

// function canvasBg(clearArr){
//         if (clearArr) {
//             oGC.clearRect(clearArr[0], clearArr[1], clearArr[2], clearArr[3]);
//         }
// }
function unload() { vl && vl.release() }