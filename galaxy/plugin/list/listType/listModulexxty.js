var listModule = function () {
    var e = {
        key: "p_list",
        isActive: !1,
        focusIndex: 0,
        id: ""
    };

    function t() {
        /^TTXB/.test($.page.type) || $.page.type;
        $.gotoDetail($.UTIL.merge(function (e) {
            var t = e.contentUri || e.contentUrl || "";
            /channel:\/\//.test(t) && (t = t.replace(/(\d+)/, function () {
                return $.getChan(RegExp.$1) ? $.getChan(RegExp.$1).channelId : RegExp.$1
            }));
            return e.contentUri && (e.contentUri = t), e.contentUrl && (e.contentUrl = t), e
        }(e.data[e.focusIndex]), {
            categoryId: e.id,
            entrance: e.entrance
        }))
    }

    function i() {
        if (Math.floor(e.focusIndex / e.columnSize) !== Math.ceil(e.total / e.columnSize) - 1) e.focusIndex >= (e.firstLineIndex +
                e.showLine - 1) * e.columnSize ? u.dragUp() : e.focusIndex + e.columnSize < e.total ? e.focusIndex +=
            e.columnSize : Math.floor(e.focusIndex / e.columnSize) != Math.ceil(e.total / e.columnSize) - 1 && (e.focusIndex =
                e.total - 1), r();
        else {
            var t = e.pre + e.focusIndex;
            $("#" + t).addClass("public_shake")
        }
    }

    function n() {
        if ((e.focusIndex + 1) % e.columnSize != 0 && e.focusIndex + 1 != e.total) e.focusIndex++, r();
        else {
            var t = e.pre + e.focusIndex;
            $("#" + t).addClass("public_shake")
        }
    }

    function o() {
        if (e.focusIndex < e.columnSize) {
            $.UTIL.apply(e.up);
            var t = e.pre + e.focusIndex;
            $("#" + t).addClass("public_shake")
        } else e.focusIndex < e.firstLineIndex * e.columnSize + e.columnSize ? u.dragDown() : e.focusIndex -= e.columnSize,
            r()
    }

    function s() {
        e.focusIndex % e.columnSize == 0 ? (list.focus = e.pre + e.focusIndex, $.UTIL.apply(e.left)) : (e.focusIndex--,
            r())
    }

    function l() {
        e.firstLineIndex >= Math.ceil(e.total / e.columnSize) - e.showLine || (u.dragPageUp(), r())
    }

    function a() {
        0 != e.firstLineIndex && (u.dragPageDown(), r())
    }

    function r(t) {
        var i = e.pre + e.focusIndex;
        t && (i = t), $.focusTo({
            el: "#" + i,
            marquee: ["#" + i + " .poster-name"]
        }), !h().showNowLine || t || list.renderShowLine()
    }

    function d(t) {
        t && t !== e.id || (e.firstLoad && (e.firstLoad(), delete e.firstLoad), e.error && e.error(), L())
    }
    var c = null,
        u = null,
        v = !1;

    function f(t) {
        e.type = t.style, e.menuType = t.menuType, e.menuCurrent = t.menuCurrent, e.id = t.id, e.firstLineIndex = t
            .firstLineIndex || 0, e.error = e.error || t.error;
        var i = h();
        e.columnSize = i.columnSize, e.showLine = i.showLine, e.lineHeight = i.lineHeight, e.pre = i.pre, $.recodeData(
            PAGE_NAME, "access", e.id)
    }

    function h() {
        return _["style" + e.type]
    }

    function p() {
        $("#content #loading").hide(), I(), $("#pageNum").hide(), L(), e.error && e.error()
    }

    function m() {
        e.data = {};
        var t = e.id,
            i = h();
        return $("#loading").show(), new $.FetchData({
            type: t,
            blockSize: i.blockSize || 100,
            jsonp: function (t, n, o, s) {
                ! function (t, n, o, s) {
                    if (t && 32 === t.length) return i.isAll ? (delete e.allData, void $.s.category.asc({
                        id: t
                    }, {
                        success: function (t) {
                            e.allData = t, o({
                                total: t.length,
                                data: t,
                                rangeMin: 0
                            })
                        },
                        error: function () {
                            s(), p()
                        }
                    })) : void $.s.category.num({
                        id: t,
                        num: n
                    }, {
                        success: o,
                        error: function () {
                            s(), p()
                        }
                    });
                    t && 10 === t.length ? $.s.guidance.get({
                        id: t
                    }, {
                        success: function (t) {
                            e.allData = t, o({
                                total: t.length,
                                data: t,
                                rangeMin: 0
                            })
                        },
                        error: function () {
                            s(), p()
                        }
                    }) : (s(), p())
                }(t, n, o, s)
            }
        })
    }

    function g() {
        var t = $("#content .viewEl")[0] || $("#content")[0];
        return new $.AnimatePanel({
            lineHeight: e.lineHeight,
            shadowLine: 1,
            showLine: e.showLine,
            columnSize: e.columnSize,
            total: e.total,
            firstLineIndex: e.firstLineIndex,
            className: "listContent",
            paddingItem: '<div class="list_item"></div>',
            transition: "all .6s",
            appendTo: t,
            render: y,
            update: x,
            lockTime: 300
        })
    }

    function y(t, i) {
        var n = function (e, t) {
            try {
                return c.sync(e, t)
            } catch (e) {
                return []
            }
        }(t, i);
        for (var o in n) e.data[+t + +o] = n[o];
        return h().renderHtml(n, t)
    }

    function x(t) {
        e.firstLineIndex = t.firstLineIndex, t.turnLine && (e.focusIndex -= t.columnSize * t.turnLine, e.focusIndex =
            Math.max(Math.min(e.focusIndex, t.total - 1), 0));
        var i = h();
        i.hasProgress && L(), e.updateAfter && e.updateAfter(t, i.noHeader)
    }

    function I() {
        e.renderListAfter && e.renderListAfter()
    }

    function L() {
        var t = e.focusIndex || 0,
            i = $("#content #progressBar"),
            n = $("#content #progressBar #strip");
        if (!e.total || e.total <= e.showLine * e.columnSize) return i.hide(), void(e.total ? $("#noData").hide() :
            $("#noData").show());
        if (h().hasProgress) {
            $("#noData").hide(), i.show();
            var o = (i[0].clientHeight - 110) / (Math.ceil(e.total / e.columnSize) - 1),
                s = +t >= e.columnSize ? Math.floor(t / e.columnSize) : 0;
            n.css("top", o * s + "px")
        } else i.hide()
    }

    function S() {
        e.isActive = !e.isActive
    }

    function w() {
        var t, i = this;
        t = $("#content").hasClass("contentMoveR") ? {
            left: 599,
            top: 251,
            width: 996,
            height: 560
        } : i.video ? {
            left: 323,
            top: 269,
            width: 945,
            height: 533
        } : {
            left: 378,
            top: 251,
            width: 996,
            height: 560
        };
        var n = $("#video");
        for (var o in e.allData) e.allData[o] && e.allData[o].contentName && (e.allData[o].name = e.allData[o].contentName);
        return $.playSizeList($.UTIL.merge({
            list: e.allData,
            current: 0,
            multiVod: !1,
            loading: function (e) {
                "url" === e && (n.addClass("noPlayer"), i.vlRender && i.vlRender()), console.log(
                    "loading type is ", e)
            },
            onPlay: function (e) {
                n.removeClass("playError noPlayer"), i.playTipShow(), console.log("onPlay", e)
            },
            onEnd: function (e) {
                console.log("我调用了end", e)
            },
            onError: function (e) {
                return n.addClass("playError"), console.log("onError", e), !0
            }
        }, t), e.id)
    }

    function T() {
        (c = m()).preload(e.firstLineIndex * e.columnSize, (e.firstLineIndex + e.showLine + 1) * e.columnSize,
            function (t, i, n, o, s) {
                if (!t || t === e.id) {
                    var l = $("#content #loading");
                    e.total = s, s ? (e.data = {}, l.hide(), u = g(), I(), L(), e.firstLoad && (e.firstLoad(),
                        delete e.firstLoad)) : p && p()
                }
            }.bind(null, e.id), d.bind(null, e.id))
    }

    function z(e) {
        var t = "",
            i = e.episodeStatus && /\//.test(e.episodeStatus) ? e.episodeStatus.split("/") : "";
        switch (+e.contentType) {
            case 2:
                i && (t = i[0] == i[1] ? i[0] + "集全" : "更新至" + i[0] + "集");
                break;
            case 3:
                i && (t = i[0] == i[1] ? i[0] + "期全" : e.topicSceneLastOnlineTime ? "更新至" + e.topicSceneLastOnlineTime
                    .slice(0, 8) + "期" : "已更" + i[0] + "期")
        }
        return t ? '<div class="episode">' + t + "</div>" : ""
    }
    var _ = {
        style1: {
            columnSize: 5,
            showLine: 2,
            lineHeight: 459,
            pre: "list_item",
            hasProgress: !0,
            render: T,
            renderHtml: function (e, t) {
                for (var i = "", n = "", o = "", s = "", l = "", a = 0; a < e.length; a++) 
                n = "poster-name autoText", i = $.getPic(e[a].pics, [102]),
                s = v ? "" : "1" === e[a].vipFlag ? '<div class="vip"></div>' : "", 
                l = e[a].vodRatingNum && "null" !== e[a].vodRatingNum ? '<div class="rating">' + e[a].vodRatingNum + "</div>" : "", 
                o +='<div class="list_item" id="list_item' + (t + a) + '"><div class="list_content">' + (
                    '<div class="poster noPic">' + s + z(e[a]) + '<img src="' + i + '">' + l + "</div>"
                    ) + '<div class="' + n + '">' + e[a].contentName + "</div></div></div>";
                return o
            },
            active: r,
            deactive: S
        },
        style2: {
            columnSize: 3,
            lineHeight: 358,
            showLine: 2,
            blockSize: 999,
            pre: "list_item",
            focus: "list_item0",
            hasProgress: !0,
            render: T,
            renderHtml: function (e, t) {
                for (var i = "", n = "", o = "", s = 0; s < e.length; s++) n = "poster-name autoText", i =
                    $.getPic(e[s].pics, [101]), o += '<div class="list_item" id="list_item' + (t + s) +
                    '"><div class="list_content">' + ('<div class="poster noPic">' + z(e[s]) + '<img src="' +
                        i + '"></div>') + '<div class="' + n + '">' + e[s].contentName +
                    "</div></div></div>";
                return o
            },
            active: r,
            deactive: S
        },
        style3: {
            columnSize: 1,
            showLine: 5,
            pre: "list_item",
            focus: "video",
            dir: "left",
            blockSize: 500,
            lineHeight: 156,
            noHeader: !0,
            hasProgress: !0,
            isMove: !0,
            isAll: !0,
            renderHtml: function (e, t) {
                for (var i = "", n = "", o = 0; o < e.length; o++) n = "", this.vl && this.vl.currentIndex() ===
                    t + o && (n = " current"), "poster-name-style3", i += '<div class="list_item' + n +
                    '" id="list_item' + (t + o) +
                    '"><div class="list_content"><div class="poster-name-style3">' + $.substringElLength(e[
                        o].contentName, "30px", "1100px").last + "</div></div></div>";
                return i
            },
            active: function () {
                "left" === this.dir || "up_v" === this.dir ? (r("video"), this.playTipShow()) : r()
            },
            vlRender: function (t) {
                if (this.vl && ($("#content #video .title").html(""), !t)) {
                    $.initVolume(this.vl.mp);
                    var i = this.vl.current().contentName;
                    if (i)
                        if ($("#content #video .title").html(i), $(".title.autoText").length)(new $.Marquee)
                            ({
                                el: $(".title.autoText")[0],
                                speed: 70
                            });
                    var n = this.vl.currentIndex();
                    (this.lastIndex || 0 == this.lastIndex) && $("#" + this.pre + this.lastIndex).removeClass(
                        "current"), n != e.firstLineIndex + this.showLine || /#list_item/.test($.activeObj
                        .el) || u.dragUp(), this.lastIndex = n, $("#" + this.pre + n).addClass(
                        "current")
                }
            },
            render: function () {
                if (!$("#video").length || !$("#style3List").length) {
                    var t = $(
                            '<div id="video" class="noPlayer"><div class="title autoText"></div> <div class="playTip hide"></div></div>'
                        ),
                        i = $('<div id="style3List"><div class="listShadow"></div></div>');
                    t.appendTo($("#content")), i.appendTo($("#content"))
                }
                c = m();
                var n = this;
                c.preload(e.firstLineIndex * e.columnSize, (e.firstLineIndex + e.showLine + 1) * e.columnSize,
                    function (t, i, o, s, l) {
                        if (!t || t === e.id) {
                            var a = $("#content #loading");
                            e.total = l, e.data = {}, a.hide(), u = g(e.total), L(), I(), n.vl = w.call(
                                n), n.vl.play(), e.firstLoad && (e.firstLoad(), delete e.firstLoad)
                        }
                    }.bind(null, e.id), d.bind(null, e.id))
            },
            playTipShow: function (e) {
                clearTimeout(this.tiemr), e ? $(".playTip").hide() : (this.tiemr = setTimeout(function () {
                    $(".playTip").hide()
                }, 5e3), $(".playTip").show())
            },
            destroy: function () {
                this.vlRender(1), $.setVolumeUsability(), this.playTipShow(1), this.vl && $.UTIL.apply(this
                    .vl.release, null, this.vl), delete this.vl, $("#video").addClass("noPlayer")
            },
            move: function () {
                this.vl && $("#video").addClass("noPlayer")
            },
            deactive: function () {
                if (S(), "#video" === $.activeObj.el) return this.dir = "left", void this.playTipShow(1);
                this.dir = "up"
            },
            keysMap: {
                getFocus: function () {
                    return $.activeObj.el
                },
                down: function () {
                    "#video" !== this.getFocus() && i()
                },
                up: function () {
                    return "#video" === this.getFocus() ? (_.style3.dir = "up_v", void e.up()) : 0 === e.focusIndex ?
                        (_.style3.dir = "up", void e.up()) : void o()
                },
                left: function () {
                    if ("#video" === this.getFocus()) return _.style3.dir = "left", void(e.left && e.left());
                    $.focusTo({
                        el: "#video"
                    }), _.style3.playTipShow()
                },
                right: function () {
                    if ("#video" === this.getFocus()) {
                        var t = _.style3.vl.currentIndex();
                        t >= e.firstLineIndex && t < e.firstLineIndex + _.style3.showLine && (e.focusIndex =
                            t), r(), _.style3.playTipShow(1)
                    }
                },
                pageDown: function () {
                    "#video" === this.getFocus() || l()
                },
                pageUp: function () {
                    "#video" === this.getFocus() || a()
                },
                ok: function () {
                    var t = h();
                    if (t.vl.currentIndex() !== e.focusIndex && "#video" !== $.activeObj.el) t.vl.playBy({
                        val: e.focusIndex
                    });
                    else {
                        if ($("#video").hasClass("noPlayer")) return;
                        t.vl.enter({
                            multiVod: !0
                        })
                    }
                }
            }
        },
        stylexxty1: {
            columnSize: 5,
            showLine: 2,
            blockSize: 999,
            lineHeight: 444,
            pre: "list_item",
            hasProgress: !1,
            showNowLine: !0,
            render: T,
            renderHtml: function (e, t) {
                for (var i = "", n = "", o = "", s = "", l = 0; l < e.length; l++){
                    n ="poster-name autoText";
                    i = $.getPic(e[l].pics, [6]);
                    ChargesArray = e[l].contentCharges.split(",");
                    var haveSinglepoint = ChargesArray.indexOf("1100000184") > -1 || ChargesArray.indexOf("1100000383") > -1 || ChargesArray.indexOf("1100000185") > -1 || ChargesArray.indexOf("1100000781") > -1;
                    s = ChargesArray.indexOf("1100000761") > -1 ? '<div class="MoviesVip"></div>' : ChargesArray.indexOf("1100000381") > -1 ? '<div class="childrenVip"></div>' : haveSinglepoint == true ? '<div class="SinglepointVip"></div>' : ChargesArray.indexOf("1100000181") > -1 ? '<div class="Qiyivip"></div>' : ChargesArray.indexOf("1100000241") > -1 ? '<div class="MoviesVip"></div>' : '';
                    rating = "";
                    o +='<div class="list_item" id="list_item' + (t + l) + '"><div class="list_content">' + (
                        '<div class="poster noPic">' + s + '<img src="' + i + '"></div>') + '<div class="' +
                    n + '">' + e[l].contentName + "</div></div></div>"
                };
                return $("#pageNum").addClass("xxty"), o
            },
            active: r,
            deactive: S
        },
        stylexxty2: {
            columnSize: 1,
            showLine: 11,
            pre: "list_item",
            focus: "video",
            dir: "left",
            blockSize: 500,
            lineHeight: 74,
            noHeader: !0,
            hasProgress: !1,
            showNowLine: !0,
            isMove: !0,
            isAll: !0,
            video: !0,
            renderHtml: function (e, t) {
                for (var i = "", n = "", o = 0; o < e.length; o++) n = "", this.vl && this.vl.currentIndex() ===
                    t + o && (n = " current"), "poster-name autoText", i += '<div class="list_item' + n +
                    '" id="list_item' + (t + o) +
                    '"><div class="list_content"><div class="poster-name autoText">' + e[o].contentName +
                    "</div></div></div>";
                return $("#pageNum").addClass("xxty"), i
            },
            active: function () {
                "left" === this.dir || "up_v" === this.dir ? (r("video"), this.playTipShow()) : r()
            },
            vlRender: function (t) {
                if (this.vl && ($("#content #video .title").html(""), !t)) {
                    $.initVolume(this.vl.mp);
                    var i = this.vl.current().contentName;
                    if (i)
                        if ($("#content #video .title").html(i), $(".title.autoText").length)(new $.Marquee)
                            ({
                                el: $(".title.autoText")[0],
                                speed: 70
                            });
                    var n = this.vl.currentIndex();
                    (this.lastIndex || 0 == this.lastIndex) && $("#" + this.pre + this.lastIndex).removeClass(
                        "current"), n != e.firstLineIndex + this.showLine || /#list_item/.test($.activeObj
                        .el) || u.dragUp(), this.lastIndex = n, $("#" + this.pre + n).addClass(
                        "current"), list.renderShowLine(n + 1)
                }
            },
            render: function () {
                if (!$("#video").length || !$("#stylexxtyList").length) {
                    var t = $('<div id="video" class="noPlayer"></div>'),
                        i = $('<div id="stylexxtyList"><div class="listShadow"></div></div>');
                    t.appendTo($("#content")), i.appendTo($("#content"))
                }
                c = m();
                var n = this;
                c.preload(e.firstLineIndex * e.columnSize, (e.firstLineIndex + e.showLine + 1) * e.columnSize,
                    function (t, i, o, s, l) {
                        if (!t || t === e.id) {
                            var a = $("#content #loading");
                            e.total = l, e.data = {}, a.hide(), u = g(e.total), L(), I(), n.vl = w.call(
                                n), n.vl.play(), e.firstLoad && (e.firstLoad(), delete e.firstLoad)
                        }
                    }.bind(null, e.id), d.bind(null, e.id))
            },
            playTipShow: function (e) {
                clearTimeout(this.tiemr), e ? $(".playTip").hide() : (this.tiemr = setTimeout(function () {
                    $(".playTip").hide()
                }, 5e3), $(".playTip").show())
            },
            destroy: function () {
                this.vlRender(1), $.setVolumeUsability(), this.playTipShow(1), this.vl && $.UTIL.apply(this
                    .vl.release, null, this.vl), delete this.vl, $("#video").addClass("noPlayer")
            },
            move: function () {
                this.vl && $("#video").addClass("noPlayer")
            },
            deactive: function () {
                if (S(), "#video" === $.activeObj.el) return this.dir = "left", void this.playTipShow(1);
                this.dir = "up"
            },
            keysMap: {
                getFocus: function () {
                    return $.activeObj.el
                },
                down: function () {
                    "#video" !== this.getFocus() && i()
                },
                up: function () {
                    return "#video" === this.getFocus() ? (_.stylexxty2.dir = "up_v", void e.up()) : 0 ===
                        e.focusIndex ? (_.stylexxty2.dir = "up", void o()) : void o()
                },
                left: function () {
                    if ("#video" === this.getFocus()) return _.stylexxty2.dir = "left", void(e.left && e.left());
                    $.focusTo({
                        el: "#video"
                    }), _.stylexxty2.playTipShow()
                },
                right: function () {
                    if ("#video" === this.getFocus()) {
                        var t = _.stylexxty2.vl.currentIndex();
                        t >= e.firstLineIndex && t < e.firstLineIndex + _.stylexxty2.showLine && (e.focusIndex =
                            t), r(), _.stylexxty2.playTipShow(1)
                    }
                },
                pageDown: function () {
                    "#video" === this.getFocus() || l()
                },
                pageUp: function () {
                    "#video" === this.getFocus() || a()
                },
                ok: function () {
                    var t = h();
                    if (t.vl.currentIndex() !== e.focusIndex && "#video" !== $.activeObj.el) t.vl.playBy({
                        val: e.focusIndex
                    });
                    else {
                        if ($("#video").hasClass("noPlayer")) return;
                        t.vl.enter({
                            multiVod: !0
                        })
                    }
                }
            }
        }
    };
    return {
        getListStyle: function () {
            return _["style" + e.type]
        },
        init: function (t) {
            $.UTIL.merge(e, t);
            var i = /^TTXB/.test($.page.type) ? "TTXB" : $.page.type;
            v = "S" === $.auth.isSp(i);
            var n = _["style" + t.style];
            f(t), n && n.render && n.render()
        },
        getCon: function () {
            return e
        },
        initCon: f,
        resetCon: function () {
            e.total = null, e.firstLineIndex = 0, e.focusIndex = 0
        },
        getKeysMap: function () {
            var r = _["style" + e.type];
            return r.keysMap ? r.keysMap : {
                down: i,
                up: o,
                left: s,
                right: n,
                pageDown: l,
                pageUp: a,
                ok: t
            }
        },
        changeActive: S
    }
}();