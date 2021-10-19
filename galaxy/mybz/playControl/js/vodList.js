$.addBackUrlRedefine(function () {}), $.playVideoRedefine(!0), $.playLiveOrRecRedefine(!0);
var page = {
        categoryId: $.page.categoryId
    },
    vl = null,
    playIndex = 0,
    listData = [],
    titleList = [],
    isShowHisCue = !1,
    isFirstLoad = !0,
    isOnEnd = !1,
    isCanSaveHis = !1,
    totalTime = 0;

function load() {
    vl = $.createVideoList({
        list: [],
        current: 0,
        loop: !1,
        auto: !0,
        multiVod: !1,
        recovery: !0,
        endPoint: void 0,
        loading: function (e) {
            console.log("loading type is ", e), isCanSaveHis = !1, "stream" === e && (playIndex = vl.currentIndex(), $.pTool.get("progress").setInfo({
                videoName: listData[playIndex].contentName,
                isTry: !1,
                hisCueIsShow: hisCue.getIsShow
            }), $.pTool.get("progress").init(vl.mp), $.pTool.get("vodList").initPlayer(vl.mp), $.pTool.get("vodList").setInfo({
                totalNum: listData.length,
                playing: playIndex + 1,
                title: titleList
            }), vl.mp.once($.MP.state.loaded, function (e) {
                totalTime = e.total, $.vs.vodPlay(vl.current().contentId, e.total, vl.current().name, page.categoryId)
            }))
        },
        onPlay: function () {
            $.initVolume(vl.mp), isCanSaveHis = !0, isFirstLoad || (resetPage(), selectCue.show()), isFirstLoad = !1
        },
        onEnd: function () {
            isOnEnd = !0, $.back()
        },
        onError: function (e) {
            return $.back(), !0
        }
    }, page.categoryId), listData = vl.all(), $.UTIL.each(listData, function (e, n) {
        titleList.push(e.contentName)
    }), isShowHisCue = !0, vl.play(), $.pTool.get("progress").setInfo({
        videoName: listData[vl.currentIndex()].contentName,
        isTry: !1,
        hisCueIsShow: hisCue.getIsShow
    }), $.pTool.get("vodList").initPlayer(vl.mp), $.pTool.get("vodList").setInfo({
        totalNum: listData.length,
        playing: vl.currentIndex() + 1,
        title: titleList
    }), $.pTool.get("vodList").init({
        playByIndex: playByIndex,
        hidePauseTip: $.pTool.get("progress").hidePauseTip
    }), vl.mp.sub($.MP.state.progress, function (e) {
        var n = e.total;
        n && n - e.curr <= 5 ? (EndTipPanel.show(n - e.curr), hisCue.hide(), selectCue.hide()) : EndTipPanel.hide()
    }), vl.mp.once($.MP.state.loaded, function (e) {
        isShowHisCue && hisCue.show(e.curr)
    })
}

function unload() {
    try {
        vl && ($.vs.playQuit(isOnEnd && "end"), isCanSaveHis && vl.mp && $.s.his.add({
            mediaId: vl.current().contentId,
            leaveTime: vl.mp.getCurrentTime(),
            categoryId: page.categoryId,
            mediaType: 0,
            totalTime: totalTime
        }), vl.save())
    } catch (e) {}
    vl.release()
}

function playByIndex(e) {
    vl.playBy({
        val: e
    })
}

function resetPage() {
    $.pTool.deactive(), EndTipPanel.hide(), hisCue.hide()
}
var EndTipPanel = function () {
    var e;
    return {
        show: function (n) {
            var t;
            e || (e = $('<div class="endBox"></div>').appendTo("body")), playIndex < listData.length - 1 ? (t = "即将播放: " + listData[playIndex + 1].contentName, e.addClass("normal")) : (e.removeClass("normal"), t = '<span class="time">' + n + '</span><span class="unit">S</span> 即将播放结束'), e.show().html(t)
        },
        hide: function () {
            e && e.hide(), e && e.html("")
        }
    }
}();

function gotoOrder() {
    $.auth.forwardOrder(1)
}
var hisCue = function () {
        var e, n = null,
            t = !1;

        function a() {
            e && e.hide(), t = !1
        }
        return {
            show: function (i) {
                if (0 == i) return selectCue.show(), !0;
                e || (e = $('<div class="hisCue hide">上次观看至' + transferTime(i) + "，</div>").appendTo("body")), clearTimeout(n), e.show(), t = !0, n = setTimeout(function () {
                    a()
                }, 6e3)
            },
            hide: function () {
                clearTimeout(n), a()
            },
            getIsShow: function () {
                return t
            }
        }
    }(),
    selectCue = function () {
        var e, n = null;

        function t() {
            e && e.hide()
        }
        return {
            show: function (a) {
                e || (e = $('<div class="selectCue hide"></div>').appendTo("body")), clearTimeout(n), e.show(), n = setTimeout(function () {
                    t()
                }, 6e3)
            },
            hide: function () {
                clearTimeout(n), t()
            }
        }
    }();

function transferTime(e) {
    return toTwo(Math.floor(e % 86400 / 3600)) + ":" + toTwo(Math.floor(e % 86400 % 3600 / 60)) + ":" + toTwo(e % 60)
}

function toTwo(e) {
    return e < 10 ? "0" + e : "" + e
}
$.pTool.add("vodList", function () {
    var e, n = "vodList",
        t = null,
        a = 0,
        i = {
            vipFlag: 1,
            totalNum: 0,
            playing: 1,
            title: []
        },
        o = 4,
        l = 0,
        s = {
            menu: 1,
            nav: 0,
            index: 0
        },
        r = 240,
        u = 7,
        v = null,
        d = null,
        c = null;

    function f(n) {
        n ? e.show() : e.hide()
    }

    function m() {
        if (0 == s.menu) {
            for (var e = 0; e < l; e++) $("#nav" + e).removeClass("current");
            return "#nav" + s.nav
        }
        if (1 == s.menu) {
            for (e = 0; e < l; e++) $("#nav" + e).removeClass("current");
            return $("#nav" + s.nav).addClass("current"), "#list" + s.index
        }
    }

    function p() {
        $(".list").html("");
        for (var e = (s.nav + 1) * o < i.totalNum ? o : i.totalNum - s.nav * o, n = 0; n < e; n++) {
            if ($('<div id="list' + n + '"><div id="mar" class="marquee">' + i.title[s.nav * o + n] + "</div></div>").appendTo(".list"), i.vipFlag) {
                $('<div class="vip"><img src="images/dianbo/select/vip.png" alt=""></div>').appendTo("#list" + n)
            }
            var t = 0,
                l = 0;
            a >= o - 1 ? (a + 1) % o == 0 ? (t = parseInt(a / o), l = o - 1) : (t = parseInt(a / o), l = a % o) : (t = 0, l = a), t == s.nav && $("#list" + l).addClass("current")
        }
    }
    var T = 0;

    function h() {
        s.menu = 1, a >= o - 1 ? (a + 1) % o == 0 ? (s.nav = parseInt(a / o), s.index = o - 1) : (s.nav = parseInt(a / o), s.index = a % o) : (s.nav = 0, s.index = a)
    }
    return {
        key: n,
        dft: !0,
        keysDftMap: ["KEY_DOWN", "KEY_OPTION"],
        keysMap: {
            KEY_LEFT: function () {
                return 0 == s.index && 0 == s.nav || (0 == s.menu && (s.index = 0, s.nav--, s.nav = s.nav < 0 ? 0 : s.nav, $.focusTo({
                    el: m(),
                    marquee: ["#list" + s.index + " #mar"]
                }), p(), 0 == (T = --T < 0 ? 0 : T) && $(".nav").css({
                    left: -r * s.nav
                })), 1 == s.menu && (0 == s.index && ($("#nav" + s.nav).removeClass("current"), s.index = 0 == s.nav ? 0 : o, s.nav--, s.nav = s.nav < 0 ? 0 : s.nav, p(), 0 == (T = --T < 0 ? 0 : T) && $(".nav").css({
                    left: -r * s.nav
                })), s.index--, s.index = s.index < 0 ? 0 : s.index, $.focusTo({
                    el: m(),
                    marquee: ["#list" + s.index + " #mar"]
                })), f(!0), !0)
            },
            KEY_RIGHT: function () {
                if (0 == s.menu && (s.index = 0, s.nav++, s.nav = s.nav > l - 1 ? l - 1 : s.nav, $.focusTo({
                        el: m(),
                        marquee: ["#list" + s.index + " #mar"]
                    }), p(), T = ++T > u ? u : T, $(".nav").offsetLeft() > -r * (l - 8) && T == u && $(".nav").css({
                        left: -r * (s.nav - u)
                    })), 1 == s.menu) {
                    if (s.index++, s.nav == l - 1 && (s.index = s.index > i.totalNum - s.nav * o - 1 ? i.totalNum - s.nav * o - 1 : s.index), s.index > o - 1 && (s.index = 0, $("#nav" + s.nav).removeClass("current"), s.nav++, s.nav = s.nav > l - 1 ? l - 1 : s.nav, p(), T = ++T > u ? u : T, $(".nav").offsetLeft() > -r * (l - u - 1) && T == u && $(".nav").css({
                            left: -r * (s.nav - u)
                        })), s.nav == l - 1 && s.index == i.totalNum - s.nav * o) return !0;
                    $.focusTo({
                        el: m(),
                        marquee: ["#list" + s.index + " #mar"]
                    })
                }
                return f(!0), !0
            },
            KEY_UP: function () {
                return 1 == s.menu && (s.menu = 0, $.focusTo({
                    el: m(),
                    marquee: ["#list" + s.index + " #mar"]
                })), f(!0), !0
            },
            KEY_DOWN: function () {
                return i.totalNum > 0 && (0 == s.menu && (s.menu = 1, p(), $.focusTo({
                    el: m(),
                    marquee: ["#list" + s.index + " #mar"]
                })), t.hasClass("hide") && (f(!0), h(), p(), $.focusTo({
                    el: m(),
                    marquee: ["#list" + s.index + " #mar"]
                }))), !0
            },
            KEY_OK: function () {
                if (1 == s.menu) {
                    var e = s.nav * o + s.index;
                    a === e ? (d(), c.playFromStart()) : v(e), f(!1)
                }
                return !0
            },
            KEY_PAGEDOWN: function () {
                return s.nav != l - 1 && (s.nav == l - 2 && i.totalNum % o != 0 && (s.index = s.index > i.totalNum % o - 1 ? i.totalNum % o - 1 : s.index), $("#nav" + s.nav).removeClass("current"), s.nav++, s.nav = s.nav > l - 1 ? l - 1 : s.nav, p(), T = ++T > u ? u : T, $(".nav").offsetLeft() > -r * (l - u - 1) && T == u && $(".nav").css({
                    left: -r * (s.nav - u)
                }), $.focusTo({
                    el: m(),
                    marquee: ["#list" + s.index + " #mar"]
                }), f(!0)), !0
            },
            KEY_PAGEUP: function () {
                return 0 != s.nav && ($("#nav" + s.nav).removeClass("current"), s.nav--, s.nav = s.nav < 0 ? 0 : s.nav, p(), 0 == (T = --T < 0 ? 0 : T) && $(".nav").css({
                    left: -r * s.nav
                }), $.focusTo({
                    el: m(),
                    marquee: ["#list" + s.index + " #mar"]
                })), !0
            },
            KEY_OPTION: function () {
                return i.totalNum > 0 && (f(!0), h(), p(), $.focusTo({
                    el: m(),
                    marquee: ["#list" + s.index + " #mar"]
                })), !0
            },
            KEY_RETURN: function () {
                return f(!1), !0
            }
        },
        init: function (a) {
            a.gotoOrder, v = a.playByIndex, d = a.hidePauseTip, t = $('<div class="vodListContent"></div>').appendTo("body"), $('<div class="title">选期</div>').appendTo(t), l = i.totalNum % o == 0 ? i.totalNum / o : parseInt(i.totalNum / o) + 1, $('<div class="nav"></div>').appendTo(t), $(".nav").css({
                width: l * r + "px"
            });
            for (var u = 0; u < l; u++) {
                var c = i.totalNum - o * u,
                    x = i.totalNum - (o * (u + 1) - 1);
                x = x < 1 ? 1 : x, $('<div id="nav' + u + '">' + (c == x ? c : c + "-" + x) + "</div>").appendTo(".nav")
            }
            $('<div class="list"></div>').appendTo(t), h(), p(), s.nav > 4 ? (T = 4, $(".nav").css({
                left: -r * (s.nav - 4) + "px"
            })) : T = s.nav, $.focusTo({
                el: m(),
                marquee: ["#list" + s.index + " #mar"]
            }), e = $.AutoHide({
                dom: t,
                delay: 6e3,
                beforeShow: function () {
                    $.pTool.active(n)
                },
                afterHide: function () {
                    $.pTool.deactive(n)
                }
            }), f(!1)
        },
        initPlayer: function (e) {
            c = e
        },
        setInfo: function (e) {
            i.totalNum = +e.totalNum, i.playing = +e.playing, i.vipFlag = !!e.vipFlag, i.title = e.title, a = i.playing - 1
        },
        active: function () {
            h(), s.nav > 4 ? (T = 4, $(".nav").css({
                left: -r * (s.nav - 4) + "px"
            })) : (T = s.nav, $(".nav").css({
                left: "0px"
            })), f(!0)
        },
        deactive: function () {
            $(".list .current").removeClass("current"), f(!1)
        },
        cover: function () {},
        uncover: function () {},
        destroy: function () {}
    }
}());
function getPlayInfo() {
    var nowInfo = vl && vl.current();
    return {
        type: "pull",
        code: "1",
        playVideoType: "2",
        mediaID: "" + (nowInfo && nowInfo.contentId || ""),
        mediaName: "" + (nowInfo && nowInfo.name || ""),
        categoryID: "" + (page.categoryId || ""),
        currentPlayTime: "" + (vl && vl.mp && vl.mp.getCurrentTime() || "0"),
        totalTime: "" + (totalTime || "0"),
        isSeries: false
    };
}