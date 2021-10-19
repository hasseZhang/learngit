var PAGE_NAME = "ZT_STYLETWO" + subjectId,
    PAGE_INFO = [{
        key: "carousel",
        pressLeft: _left,
        pressRight: _right,
        pressUp: "",
        pressDown: "",
        pressOk: _ok,
        args: []
    }
    ],
    ACTIVE_OBJECT = PAGE_INFO[0],
    VALLIST = DATALIST[0].valData,
    BGLIST = DATALIST[1].bgData,
    pageInfo = $.initPageInfo(PAGE_NAME, ["index", "pageObj", "bgObj"],
        { index: 2, pageObj: [], bgObj: [] }),
    classNameArr = [],
    $el = null,
    index = pageInfo.index,
    pageObj = pageInfo.pageObj,
    bgObj = pageInfo.bgObj,
    timer = null,
    timer_light = null,
    lock = !1,
    $wrap = "",
    $bgEl = "";       
function initPage() {
    $.recodeData(subjectName, "zt");
    $.initPage(),
    renderPage(),
    initFocus()
}
function renderPage() {
    var e = "", t = "",
        i = BGLIST.length > VALLIST.length ? BGLIST.slice(1) : BGLIST;
    $wrap = $('<div class="wrap"></div>');
    for (var a = 0; a < VALLIST.length; a++)t = VALLIST[a].contentName,
        e += '<div id="item' + a + '" class="item' + a + ' item"><img src="' + i[a].pic + '" alt="" /><div class="title hide autoText">' + t + "</div></div>";
    $('<div class="bgWrap"><div class="bgList">' + bgList.getBgPic() + "</div></div>").appendTo($wrap),
        $('<div class="container"><div class="bgCircle"></div><div id="carousel" class="carousel">' + e + '</div><div class="light"></div></div>').appendTo($wrap);
    $wrap.appendTo("body"),
        $el = $(".item", ".carousel", !0),
        $bgEl = $(".bgImg", ".bgList", !0),
        getPageInfo(),
        bgList.getBgInfo(),
        initclass(),
        bgList.initClass()
}
function getPageInfo() {
    for (var e = 0; e < $el.length; e++)classNameArr.push($($el[e]).attr("class"))
}
function initclass() {
    if (pageObj && pageObj.length > 0) for (var e = 0; e < VALLIST.length; e++)$el.item(e).attr("class", pageObj[e]);
    classNameArr = [], getPageInfo()
}
function focus() {
    clearTimeout(timer_light);
    var e = "#item" + index; $.focusTo(e),
        $(e).addClass("focusBorder"),
        timer_light = setTimeout(function () { $(".title", e).addClass("titleShow"), textScroll() }, 500)
}
function initFocus() { focus() }
function textScroll() {
    var e = $(".focusBorder .title");
    $.Marquee({ el: e[0] })
}
var bgList = function () {
    var e = [];
    function t() {
        for (var t = 0; t < $bgEl.length; t++)e.push($($bgEl[t]).attr("class"))
    }
    return {
        getBgPic: function () {
            var e = ""; if (BGLIST.length === VALLIST.length) for (var t = 0; t < VALLIST.length; t++)e += '<img class="bgImg bgImg' + t + '" src="' + BGLIST[t].bgPic + '""/>';
            return e = BGLIST.length > VALLIST.length ? '<img class="bgImg only" src="' + BGLIST[0].bgPic + '""/>' : e
        },
        initClass: function () {
            if (bgObj && bgObj.length > 0) for (var i = 0; i < VALLIST.length; i++)$bgEl.item(i).attr("class", bgObj[i]);
            e = [], t()
        },
        getBgInfo: t,
        left: function () {
            e.push(e.shift()),
            bgObj = e;
            for (var t = 0; t < $bgEl.length; t++)$bgEl.item(t).attr("class", e[t])
        },
        right: function () {
            e.unshift(e.pop()),
                bgObj = e; for (var t = 0; t < $bgEl.length; t++)$bgEl.item(t).attr("class", e[t])
        }
    }
}();
function _left() {
    if (!lock) {
    clearTimeout(timer),
        --index < 0 && (index = VALLIST.length - 1),
        bgList.left(),
        classNameArr.push(classNameArr.shift()),
        pageObj = classNameArr;
        for (var e = 0; e < $el.length; e++)$el.item(e).attr("class", classNameArr[e] + " anim");
        $(".item0").removeClass("anim"),
            lock = !0, timer = setTimeout(function () { lock = !1 }, 1e3),
            $(".titleShow").removeClass("titleShow"),
            focus()
    }
}
function _right() {
    if (!lock) {
        clearTimeout(timer),
            ++index > VALLIST.length - 1 && (index = 0),
            bgList.right(),
            classNameArr.unshift(classNameArr.pop()),
            pageObj = classNameArr;
        for (var e = 0; e < $el.length; e++)$el.item(e).attr("class", classNameArr[e] + " anim");
        $(".item" + ($el.length - 1)).removeClass("anim"),
            lock = !0,
            timer = setTimeout(function () { lock = !1 }, 1e3),
            $(".titleShow").removeClass("titleShow"), focus()
    }
}
function _ok() {
    var e = VALLIST[index],
        t = ["3", "7"];
    e.categoryId = subjectId,
        e.ztCategoryId = subjectId,
        $.savePageInfo(PAGE_NAME,
            { index: index, pageObj: pageObj, bgObj: bgObj }
        ),
        t.indexOf(e.contentType) > -1 && (e.contentType == t[0] ? e.contentType = t[1] : e.contentType = t[0]),
        $.gotoDetail(e)
}