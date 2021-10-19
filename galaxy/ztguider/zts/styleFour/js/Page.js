var ACTIVE_OBJECT,
    PAGE_NAME = "ZT_STYLEFOUR" + subjectId,
    PAGE_INFO = [],
    DATA = DATALIST,
    oDetailInfo = {};
function load() {
    $.recodeData(subjectName, "zt");
    $.initPage(), page.init()
}
var page = function () {
    var n = [],
        e = null,
        t = $.initPageInfo(PAGE_NAME, ["firstLineIndex", "focusIndex", "backObj"], {
            firstLineIndex: 0, focusIndex: 0, backObj: null
        }),
        i = null,
        o = t.firstLineIndex; t.backObj && (n = t.backObj);
    var s, a = t.focusIndex;
    s = $.focusTo,
        $.focusTo = function (n, t) {
            e && $(".valContainer", e[0]).html(""),
                e = $("#" + n), t ? I(L) : A(L), $.UTIL.apply(s, [n], $)
        };
    var c, l, f, r, u,
        d = function () {
            $("body").css("background", 'url("' + bImgPath + '") no-repeat')
        },
        v = function () { T() },
        T = function () {
            for (var n = DATA.length > 3 ? 3 : DATA.length, e = 0; e < n; e++)
                PAGE_INFO.push(
                    { key: "list" + e, pressDown: g, pressUp: h, pressRight: m, pressLeft: b, pressOk: C, index: e })
        },
        I = function (n) {
            for (var t = [], s = ["2", "7"], c = 0; c < DATA[a].valList.length; c++)
                s.indexOf(DATA[a].valList[c].contentType) > -1 && t.push(DATA[a].valList[c].contentId);
            O(t, function () {
                !function () {
                    clearTimeout(i);
                    for (var n = $(".valContainer", e[0]),
                        t = o + 3 < DATA.length ? o + 3 : DATA.length, s = o; s < t; s++)$("#list" + (s - o) + " .listTitle").addClass("hasVal").html(DATA[s].name);
                    D(),
                        (n = $(".valContainer", e[0])).removeClass("transition"), n.html(p()), i = setTimeout(function () { $(".valContainer", e[0]).addClass("transition") }, 100)
                }(), n && n()
            })
        },
        A = function (n, e) {
            var t; return function (i) {
                var o = this; clearTimeout(t),
                    t = setTimeout(function () { n.apply(o, [i]) }, e)
            }
        }(I, 200),
        p = function (e) {
            var t = DATA[e = e || a].valList || [], i = n[e]; if (!n[e]) {
                n[e] = {},
                    (i = n[e]).focusIndex = 0,
                    i.firstLineIndex = 0,
                    i.dataLen = t.length;
                for (var o = "", s = "", c = "", l = 0; l < t.length; l++)s = t[l].contentName,
                    o += '<div class="' + ((c = oDetailInfo[t[l].contentId] ? x(oDetailInfo[t[l].contentId]) : "") ? "val" : "val noTip") + '"><img class="poster" src="' + t[l].imgPath + '"/><div class="tCont"></div><div class="notip"></div><div class="episodes">' + c + '</div><div class="title autoText" t="' + t[l].contentName + '">' + s + "</div></div>"; i.el = o
            } return i.el
        },
        x = function (n) {
            var e = "", t = n.episodes && /\//.test(n.episodes) ? n.episodes.split("/") : "";
            switch (+n.contentType) {
                case 2: t && (e = t[0] == t[1] ? t[0] + "集全" : "更新至" + t[0] + "集")
                    ; break; case 3: t && (e = t[0] == t[1] ? t[0] + "期全" : n.topicSceneLastOnlineTime ? n.topicSceneLastOnlineTime.slice(0, 4) + "-" + n.topicSceneLastOnlineTime.slice(4, 6) + "-" + n.topicSceneLastOnlineTime.slice(6, 8) + "期" : "已更" + t[0] + "期")
            }return e || ""
        },
        D = function () {
            var t = -294, i = (n[a] || {}).firstLineIndex || 0, o = 146; 1 == i && (t = -146, o = 0); var s = i ? t * i + o : 0; $(".valContainer", e[0]).css("-webkit-transform", "translateX(" + s + "px)")
        },
        L = function () {
            for (var t = n[a].focusIndex,
                i = $(".val", e[0], !0), o = 0; o < i.length; o++)$(i[o]).removeClass("focus");
            $(i[t]).addClass("focus"); var s = $(".autoText", i[t]);
            $.Marquee({ el: s[0] })
        },
        g = function () {
            if (!(a >= DATA.length - 1)) {
                if (a++, !(DATA.length <= 3)) return a < DATA.length - 1 ? (a >= 2 && o++, void $.focusTo("list1")) : void $.focusTo("list2"); $.focusTo("list" + a)
            }
        },
        h = function () {
            if (a > 0) {
                if (a--, 0 == o) return void $.focusTo("list" + a);
                a <= DATA.length - 2 && (1 == ACTIVE_OBJECT.index && o--, $.focusTo("list1"))
            }
        },
        m = function () {
            var e = n[a]; if (e.focusIndex < e.dataLen - 1) return e.focusIndex++,
                6 < e.dataLen && e.focusIndex - e.firstLineIndex >= 3 && e.focusIndex + 3 <= e.dataLen && (e.firstLineIndex++, D())
                , void L(); y()
        },
        b = function () {
            var e = n[a];
            e.focusIndex <= 0 ? y() : (e.focusIndex--, e.focusIndex - e.firstLineIndex < 2 && e.firstLineIndex > 0 && e.focusIndex + 3 <= e.dataLen && (e.firstLineIndex--, D()), L())
        },
        C = function () {
            var e = DATA[a].valList[n[a].focusIndex], t = ["3", "7"];
            e.categoryId = subjectId,
                e.ztCategoryId = subjectId,
            $.savePageInfo(PAGE_NAME, { firstLineIndex: o, focusIndex: a, backObj: n }),
                t.indexOf(e.contentType) > -1 && (e.contentType == t[0] ? e.contentType = t[1] : e.contentType = t[0]), $.gotoDetail(e)
        },
        O = (c = [],
            l = 0,
            f = null,
            r = [],
            u = function () {
                var n = c[l++];
                if (!n) return f(r);
                oDetailInfo[n] ? arguments.callee.call(null, arguments) : $.s.detail.get({ id: n },
                    {
                        success: function (n) {
                            var e = n.vodId;
                            c[l - 1] == e && (n.currentNum ? oDetailInfo[e] = { contentType: n.vodSeriesflag, episodes: n.currentNum + "/" + n.totalNum } : oDetailInfo[e] = { contentType: "", episodes: "" }, r.push(oDetailInfo[e]), u())
                        },
                        error: function () {
                            oDetailInfo[n] = { contentType: "", episodes: "" },
                                r.push(oDetailInfo[n]), u()
                        }
                    })
            },
            function (n, e) {
                l = 0, r = [], c = n, f = e, u()
            }
        );
    function y() {
        $(".focus").addClass("public_shake")
    }
    return {
        init: function () {
            d(), v();
            var n = a;
            0 != o && (n = 1, a >= DATA.length - 1 && (n = 2)),
                $.focusTo("list" + n, !0)
        }
    }
}();