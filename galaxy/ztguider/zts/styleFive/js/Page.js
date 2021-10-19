var ACTIVE_OBJECT,
    PAGE_NAME = "ZT_STYLEFIVE" + subjectId,
    DATA = DATALIST,
    PAGE_INFO = [{ key: "video", pressRight: _vRight, pressOk: _vOk },
    { key: "list", pressDown: _down, pressUp: _up, pressPageDown: _pageDown, pressPageUp: _pageUp, pressOk: _ok, pressLeft: _left }
    ],
    MAXSIZE = 20,
    LISTSIZE = 4,
    LISTPRE = "item",
    TIPHIDETIME = 5e3,
    TRYSEETIME = 360,
    categoryId = subjectId,
    isSuportKKKK = isSuport4K(),
    pageInfo = $.initPageInfo(PAGE_NAME, ["firstLineIndex", "focusIndex", "playIndex", "focus", "listFocus"],
        {
            firstLineIndex: 0,
            focusIndex: 0,
            playIndex: 0,
            focus: "item0",
            listFocus: "item0"
        }),
    firstLineIndex = pageInfo.firstLineIndex,
    focusIndex = pageInfo.focusIndex,
    playIndex = pageInfo.playIndex,
    total = 0,
    data = [],
    contentIdArr = [],
    oPlayInfo = {},
    listFocus = pageInfo.listFocus,
    $playTitle = null,
    $video = null,
    $list = null,
    $progressBar = null,
    $strip = null,
    startTime = 0,
    nowAuthContentId = "",
    authStaus = "pass",
    nowPlayIndex = "",
    vl = null;
function initPage() {
        $.recodeData(subjectName, "zt");
        $playTitle = $("#playerTitle"),
        $video = $("#video"),
        $list = $(".right .list"),
        _initBackGround(),
        rederPageTitle(),
        loadData()
}
function _initBackGround() {
    $("body").css("background", 'url("' + bImgPath + '") no-repeat transparent')
}
function rederPageTitle() {
    $("#pageTitle").html(subjectName)
}
var list = {
    focus: function () {
        $.focusTo("list"),
            $(".list #item" + focusIndex).addClass("focusBorder"),
            titleScroll(), progress()
    },
    blur: function () {
        $(".list #item" + focusIndex).removeClass("focusBorder")
    }
};
function loadData() {
    data = DATA.valList.slice(0, MAXSIZE);
    for (var e = 0; e < data.length; e++)data[e].name = data[e].contentName.split("@")[0];
    total = data.length, progress(),
        renderPage(function () { initPlayer(initFocus) })
}
function savePageInfo() {
    $.savePageInfo(PAGE_NAME, { focusIndex: focusIndex, firstLineIndex: firstLineIndex, playIndex: playIndex, focus: ACTIVE_OBJECT.key, listFocus: listFocus || LISTPRE + focusIndex })
}
function renderPage(e) {
    contentIdArr = [];
    for (var t = data.length, a = 0; a < t; a++)"1" === data[a].vipFlag && contentIdArr.push(data[a].contentId);
    loadDataResource(contentIdArr, function (a) {
        for (var n = "", s = "", o = "", i = "", l = 0; l < t; l++)
            i = data[l].name,
                s = l == playIndex ? l == nowPlayIndex ? " play player" : " play" : "",
                picPath = data[l].imgPath,
                o = $.substringElLength(data[l].contentName.split("@")[1] || "", "30px", "350px").last,
                n += '<div id="' + LISTPRE + l + '" class="' + LISTPRE + s + '"><img class="pic" src="' + picPath + '" alt=""><div class="name autoText">' + i + '</div><div class="des">' + o + "</div></div>";
        $(".list").html(n), listMove(), e && e()
    })
}
function initFocus() {
    "video" === pageInfo.focus ? focusToVideo() : list.focus()
}
function listMove() {
    var e = -218 * firstLineIndex;
    $list.css("-webkit-transform", "translateY(" + e + "px)")
}
function titleScroll() {
    var e = $(".focusBorder .name"),
        t = e.html(),
        a = $(".focusBorder .name").attr("wt");
    t != a ? $.Marquee({ el: e[0], all: a }) : $.Marquee()
}
function renderPlayInfo() {
    var e = $.substringElLength(data[playIndex].name, "50px", "900px").last;
    $playTitle.html(e)
}
function _left() {
    list.blur(), focusToVideo()
}
function _up() {
    if (focusIndex - firstLineIndex == 0) {
        if (0 == firstLineIndex) return void $("#" + LISTPRE + focusIndex).addClass("public_shake"); firstLineIndex--
    }
    focusIndex--,
        listMove(),
        list.blur(), list.focus()
}
function _down() {
    focusIndex >= total - 1 ? $("#" + LISTPRE + focusIndex).addClass("public_shake") : (focusIndex == firstLineIndex + LISTSIZE - 1 && (firstLineIndex++, listMove()),
        focusIndex++,
        list.blur(),
        list.focus())
}
function _pageUp() {
    0 != firstLineIndex && (focusIndex -= firstLineIndex - (firstLineIndex = firstLineIndex - LISTSIZE < 0 ? 0 : firstLineIndex - LISTSIZE), list.blur(), list.focus(), listMove())
}
function _pageDown() {
    firstLineIndex < total - LISTSIZE && (firstLineIndex += LISTSIZE, focusIndex = focusIndex + LISTSIZE >= total ? total - 1 : focusIndex + LISTSIZE, list.blur(),
        list.focus(),
        listMove())
}
function _ok() {
    var e = is4KVod(data[playIndex].name) && !isSuportKKKK;
    if (playIndex !== focusIndex) {
        if (listRemoveClass(), playIndex = focusIndex, e) return stopMp(), void videoBg.noSupport4K(); play(null, !0)
    } else { if (e) return; _vOk() }
}
function _vRight() {
    tips.fullPlay.hide(),
        tips.order.hide(),
        firstLineIndex + LISTSIZE > playIndex && playIndex >= firstLineIndex && (focusIndex = playIndex), list.focus()
}
function _vOk() {
    switch (authStaus) {
        case "pass": fullPlay(); break;
        case "noPass": savePageInfo(), vl.save(), $.auth.forwardOrder()
    }
}
function focusToVideo() {
    switch (authStaus) { case "pass": tips.fullPlay.show(); break; case "noPass": tips.order.show() }$.focusTo("video")
}
var tips = {
    fullPlay: {
        timer: null,
        show: function () {
            this.hide(), $video.addClass("fullPlay"), tipHide.call(this)
        },
        hide: function () {
            clearTimeout(this.timer), $video.removeClass("fullPlay")
        }
    },
    order: {
        timer: null,
        show: function () {
            this.hide(), $video.addClass("order"), tipHide.call(this)
        },
        hide: function () {
            clearTimeout(this.timer), $video.removeClass("order")
        }
    },
    trySee: {
        show: function () { $video.addClass("trySee") },
        hide: function () { $video.removeClass("trySee") }
    },
    rm: function () { $video.removeClass("trySee").removeClass("fullPlay").removeClass("order") }
};
function tipHide() {
    this.timer = setTimeout(this.hide.bind(this), TIPHIDETIME)
}
var videoBg = {
    order: function () { tips.order.show(), $video.addClass("orderBg") },
    trySeeEnd: function () { tips.order.show(), $video.addClass("trySeeEnd") },
    noSupport4K: function () { $video.addClass("no4K") },
    rm: function () { $video.removeClass("orderBg").removeClass("trySeeEnd").removeClass("no4K") }
},
    loadDataResource = function () { var e = [], t = 0, a = null, n = [], s = function () { var o = e[t++]; if (!o) return a(n); oPlayInfo[o] ? (n.push(oPlayInfo[o]), arguments.callee.call(null, arguments)) : $.s.detail.get({ id: o }, { success: function (a) { var o = a.vodId; e[t - 1] == o && (oPlayInfo[o] = { package: a.jsVodChargesToCps }, n.push(oPlayInfo[o]), s()) }, error: function () { oPlayInfo[o] = { totalTime: "", package: "" }, n.push(oPlayInfo[o]), s() } }) }; return function (o, i) { t = 0, n = [], e = o, a = i, s() } }();
function initPlayer(e) { play(e) }
function play(e, t) {
    stopMp(), tips.rm(); var a = data[playIndex].contentId, n = data[playIndex].name, s = "1" === data[playIndex].vipFlag; if (renderPlayInfo(), s) {
        var o = oPlayInfo[a].package; return nowAuthContentId = a, authStaus = "pass", void $.auth.auth({
            entrance: "", playData: { contentId: a, vodName: n, categoryId: subjectId, contentType: "0", noFromDetail: !0 }, package: o,
            callback: function (n) { if (nowAuthContentId !== a) return; n ? (authStaus = "pass", sizePlay(t)) : (authStaus = "noPass", trySeeOrOrder(t)); e && e() }
        })
    } authStaus = "pass", sizePlay(t), e && e()
}
function sizePlay(e) {
    var t = 0; if (videoBg.rm(), vl || (vl = $.playSizeList({
        left: 90, top: 280, width: 903, height: 537, list: data, current: 0, multiVod: !1, endPoint: "pass" === authStaus ? void 0 : TRYSEETIME, auto: !1,
        loading: function (e) {
            if ("url" === e) { if (!vl) return; $.initVolume(vl.mp) }
        },
        onPlay: function (e) { addPlayerClass() },
        onEnd: function (e) {
            if (vl.cfg.endPoint) return stopMp(),
                tips.trySee.hide(), void videoBg.trySeeEnd(); listRemoveClass(), ++playIndex === total && (playIndex = 0), play()
        },
        onError: function (e) { return !0 }
    }, categoryId,
        function () {
            return $.auth.getchargeSpIds(data[playIndex].contentId)
        }, categoryId),
        $.isBack() && (t = vl.valueOf().playTime)),
        vodName = data[playIndex].name,
        id = data[playIndex].contentId,
        is4KVod(vodName) && !isSuportKKKK) return stopMp(),
            void videoBg.noSupport4K();
    $("#" + LISTPRE + playIndex).addClass("play"),
        vl.playBy({ playTime: t, val: playIndex, endPoint: "pass" === authStaus ? void 0 : TRYSEETIME })
}
function listRemoveClass() { $("#" + LISTPRE + playIndex).removeClass("play") }
function fullPlay() { savePageInfo(), vl && vl.enter({ multiVod: !1, contentId: data[playIndex].contentId, ztCategoryId: subjectId }) }
function stopMp() { $("#" + LISTPRE + playIndex).removeClass("player"), vl && vl.stop() }
function trySeeOrOrder(e) { if (videoBg.rm(), +data[playIndex].totalTime > 30) return stopMp(), sizePlay(e), void tips.trySee.show(); listRemoveClass(), $("#" + LISTPRE + playIndex).addClass("play"), videoBg.order() }
function isSuport4K() { var e = Authentication.CUGetConfig("STBType"); return !/V9A|V6|E909|B760EV3/.test(e) }
function is4KVod(e) { return /4k/i.test(e) } function addPlayerClass() { $("#" + LISTPRE + playIndex).addClass("player"), nowPlayIndex = playIndex, "pass" !== authStaus ? "noPass" === authStaus && tips.order.show() : tips.fullPlay.show() }
function progress() { $progressBar || (($progressBar = $('<div id="progressBar"><div class="strip"></div></div>')).appendTo("body"), $strip = $("#progressBar .strip")); var e = ($progressBar[0].clientHeight - 109) / (Math.ceil(total / 1) - 1), t = +focusIndex >= 1 ? Math.floor(focusIndex / 1) : 0; $strip.css("top", e * t + "px") } function unload() { vl && vl.release() }