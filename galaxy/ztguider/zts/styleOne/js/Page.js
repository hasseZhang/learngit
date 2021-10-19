var ACTIVE_OBJECT,
    PAGE_INFO = [
        { key: "actor", pressDown: _down, pressLeft: _left, pressRight: _right },
        { key: "dvdList", pressUp: _up, pressLeft: dvdLeft, pressRight: dvdRight, pressOk: dvdOk }
    ],
    pageName = "ZT_STYLEONE_" + subjectId,
    actorKey = "#actorItem",
    actorDvdKey = "#actorDvdItem",
    width = 290, marW = 256, half = 145, bgW = 1920,
    actorsSet = [],
    imgSet = [],
    dvdSet = [],
    lock = !1,
    pageInfo = $.initPageInfo(pageName, ["actor", "dvdList"], { actor: { addT: 0, actorIndex: 0, actorDisIndex: 0, actorFocus: !1 }, dvdList: { addV: 0, actorDvdIndex: 0, dvdDisIndex: 0 } }),
    addT = pageInfo.actor.addT,
    actorIndex = pageInfo.actor.actorIndex,
    actorDisIndex = pageInfo.actor.actorDisIndex,
    actorFocus = pageInfo.actor.actorFocus,
    addV = pageInfo.dvdList.addV,
    actorDvdIndex = pageInfo.dvdList.actorDvdIndex,
    dvdDisIndex = pageInfo.dvdList.dvdDisIndex; 
function initPage() {
    $.recodeData(subjectName, "zt");
    $.initPage(),
        $.isBack() && ($("#imgList").css("transition", "none"),
            $("#actorDvdList").css("transition", "none"),
            $("#actorsList").css("transition", "none"),
            setTimeout(function () {
                $("#imgList").css("transition", "transform .6s"),
                    $("#actorDvdList").css("transition", "transform .6s"),
                    $("#actorsList").css("transition", "transform .6s")
            }, 0)),
        data && data.length && (dealData(), renderPage()), initFocus()
}
function clearTranstion() {
    $("#actorDvdList").css("transition", "none"),
        setTimeout(function () { $("#actorDvdList").css("transition", "transform .6s") }, 0)
}
function dealData() {
    for (var t = 1; t < data.length; t++)
        data[t].name && data[t].vod && data[t].vod.length > 1 && (actorsSet.push(data[t].name), dvdSet.push(data[t].vod.slice(1)), imgSet.push(data[t].vod[0].img))
}
function renderPage() {
    imgSet.length && (getImg(imgSet), actorIndex && $("#imgList").css("webkitTransform", "translateX(-" + bgW * actorIndex + "px)")), actorsSet.length && (getBtn(actorsSet), actorIndex && translateX("#actorsList", actorDisIndex - actorIndex, addT)), dvdSet.length && getDvd(), actorDvdIndex && translateX("#actorDvdList", dvdDisIndex - actorDvdIndex, addV)
}
function getImg(t) {
    for (var a = "", d = 0; d < t.length; d++)a += '<img id="actorBg' + d + '" class="actorBg" src="' + t[d] + '" style="left:' + bgW * d + 'px">'; $("#imgList").html(a)
}
function getBtn(t) {
    var a = ""; if (t.length < 2) $(".actorDvd").addClass("noBtn"); else { for (var d = 0; d < t.length; d++)a += '<div id="actorItem' + d + '" class="actor_item autoText" style="left:' + width * d + 'px">' + t[d] + "</div>"; $("#actorsList").html(a) }
}
function getDvd() {
    var t = dvdSet[actorIndex]; if (t && t.length) { for (var a = "", d = 0; d < t.length; d++)a += '<div id="actorDvdItem' + d + '" class="actor_dvd_item" style="left:' + width * d + 'px"><img class="poster" src="' + t[d].img + '" /><div class="title autoText">' + t[d].contentName + "</div></div>"; $("#actorDvdList").html(a) }
}
function initFocus() {
    dvdSet[actorIndex] && (actorFocus = !1, actorsSet.length > 1 && $(actorKey + actorIndex).addClass("stay")), focusTo(), setTimeout(function () { $("#actorsList").addClass("trans"), $("#actorDvdList").addClass("trans") }, 500)
}
function _left() {
    if (!lock) {
        if (0 == actorIndex) return shake(actorKey, actorIndex), !0;
        if (actorIndex--, actorDisIndex--, chagePic(), actorDisIndex < 4)
            actorDisIndex != actorIndex ? translateX("#actorsList", (actorDisIndex = 3) - actorIndex, addT = 1) : 2 == actorIndex && translateX("#actorsList", (actorDisIndex = 2) - actorIndex, addT = 0); paintDvd(), focusTo()
    }
}
function _right() {
    if (!lock) {
        var t = $(".actor_item", "#actorsList", !0) && $(".actor_item", "#actorsList", !0).length;
        if (actorIndex == t - 1) return shake(actorKey, actorIndex), !0;
        if (actorIndex++, actorDisIndex++, chagePic(), actorDisIndex > 2) actorsSet.length > 6 && (actorIndex <= t - 4 ? translateX("#actorsList", (actorDisIndex = 3) - actorIndex, addT = 1) : actorIndex == t - 3 && translateX("#actorsList", actorDisIndex - actorIndex, addT = 2)); paintDvd(), focusTo()
    }
}
function chagePic() {
    $("#actorDvdList").html(""),
        $("#actorDvdList").css("webkitTransform", "translateX(0px)")
}
function paintDvd() {
    clearTranstion(), actorDvdIndex = 0, dvdDisIndex = 0, getDvd()
}
function translateX(t, a, d) {
    var o = width * a - half * d; $(t).css("webkitTransform", "translateX(" + o + "px)"), lock = !0, setTimeout(function () { lock = !1 }, 500)
}
function _down() {
    dvdSet[actorIndex] && (actorFocus = !1, $(".focusBorder").addClass("stay"), focusTo(),
        $("#actorsList").addClass("trans"), $("#actorDvdList").addClass("trans"))
}
function dvdLeft() {
    if (!lock) {
        if (0 == actorDvdIndex) return shake(actorDvdKey, actorDvdIndex), !0;
        if (actorDvdIndex--, --dvdDisIndex < 4) dvdDisIndex != actorDvdIndex ? translateX("#actorDvdList", (dvdDisIndex = 3) - actorDvdIndex, addV = 1) : 2 == actorDvdIndex && translateX("#actorDvdList", (dvdDisIndex = 2) - actorDvdIndex, addV = 0); focusTo()
    }
}
function dvdRight() {
    if (!lock) {
        var t = $(".actor_dvd_item", "#actorDvdList", !0) && $(".actor_dvd_item", "#actorDvdList", !0).length;
        if (actorDvdIndex == t - 1) return shake(actorDvdKey, actorDvdIndex), !0;
        if (actorDvdIndex++, ++dvdDisIndex > 2) dvdSet[actorIndex].length > 6 && (actorDvdIndex <= t - 4 ? translateX("#actorDvdList", (dvdDisIndex = 3) - actorDvdIndex, addV = 1) : actorDvdIndex == t - 3 && translateX("#actorDvdList", dvdDisIndex - actorDvdIndex, addV = 2)); focusTo()
    }
} function _up() {
actorsSet.length < 2 || (actorFocus = !0, $(".stay").removeClass("stay"), focusTo(), $("#actorDvdList").removeClass("trans"))
}
function dvdOk() {
    var t = dvdSet[actorIndex][actorDvdIndex];
    t.categoryId = subjectId,
    t.ztCategoryId = subjectId,
    "7" == t.contentType ? t.contentType = "3" : "3" == t.contentType && (t.contentType = "7"), 
    $.gotoDetail(t)
}
function focusTo() {
    var t; $(".focusBorder").removeClass("focusBorder"),
        actorFocus ? ($.focusTo("actor"), t = actorKey + actorIndex,
            $("#imgList").css("webkitTransform", "translateX(-" + bgW * actorIndex + "px)")) : ($.focusTo("dvdList"),
                t = actorDvdKey + actorDvdIndex),
        $(t)[0] ? $(t).addClass("focusBorder") : $.focusTo("actor"), textScroll()
}
function shake(t, a) {
    $(t + a).addClass("public_shake")
}
function textScroll() {
    var t = $(".focusBorder .title")[0] || $(".focusBorder")[0]; t ? $.Marquee({ el: t }) : $.Marquee()
}
function unload() {
    var t = {
        actor: { addT: addT, actorIndex: actorIndex, actorDisIndex: actorDisIndex, actorFocus: actorFocus },
        dvdList: { actorDvdIndex: actorDvdIndex, dvdDisIndex: dvdDisIndex, addV: addV }
    };
    $.saveGlobalData(pageName, t)
}