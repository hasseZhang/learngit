var pageName = "userSystem_rule",
    pToolKey = "p_userSystem_rule",
    innerHeight = 0,
    contentHeight = 0,
    progressBarHeight = 0,
    stripHeight = 0,
    oneLineHeight = 0,
    totalLine = 0,
    onPageLine = 0,
    firstLineIndex = 0,
    isShowBar = !1;

function load() {
    isError && us_cue.show({
        type: 2,
        text: "数据请求超时，请返回重试。"
    });
    $.recodeData(pageName, "access"), 
    $.pTool.add(pToolKey, p_userSystem_rule), $.pTool.active(pToolKey), 
    $("#content").html(content); 
    innerHeight = $("#inner").clientHeight(); 
    (contentHeight = $("#content").clientHeight()) > innerHeight && ($("#progressBar").show(),
    progressBarHeight = $("#progressBar").clientHeight(),
    stripHeight = Math.round(innerHeight / contentHeight * progressBarHeight),
    $("#strip").css({
        height: stripHeight + "px"
    }), isShowBar = !0);
    var e = parseInt($("#content").css("line-height"));
    totalLine = Math.round(contentHeight / e), oneLineHeight = contentHeight / totalLine, onPageLine = Math.floor(innerHeight / oneLineHeight)
}

function progress() {
    if (isShowBar) {
        var e = Math.ceil(firstLineIndex / (totalLine - onPageLine) * 100) / 100;
        $("#strip").css({
            top: (progressBarHeight - stripHeight) * e + "px"
        })
    }
}

function moveContent() {
    $("#content").css({
        "-webkit-transform": "translateY(-" + firstLineIndex * oneLineHeight + "px)"
    })
}

function unload() {}

function pageUp() {
    firstLineIndex > 0 && ((firstLineIndex -= onPageLine) < 0 && (firstLineIndex = 0), moveContent(), progress())
}

function pageDown() {
    firstLineIndex < totalLine - onPageLine && ((firstLineIndex += onPageLine) > totalLine - onPageLine && (firstLineIndex = totalLine - onPageLine), moveContent(), progress())
}
var p_userSystem_rule = {
    key: pToolKey,
    keysMap: {
        KEY_DOWN: function () {
            return pageDown(), !0
        },
        KEY_UP: function () {
            return pageUp(), !0
        },
        KEY_PAGEUP: function () {
            return pageUp(), !0
        },
        KEY_PAGEDOWN: function () {
            return pageDown(), !0
        }
    },
    active: function () {},
    deactive: function () {},
    destroy: function () {},
    init: function () {}
};