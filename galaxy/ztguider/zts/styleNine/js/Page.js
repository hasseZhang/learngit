var PAGE_NAME = "ZT_STYLENINE" + subjectId;

var PAGE_INFO = [ {
    key: "itemList",
    pressLeft: "",
    pressRight: "",
    pressUp: _up,
    pressDown: _down,
    pressOk: _ok,
    args: []
} ];

var ACTIVE_OBJECT = PAGE_INFO[0];

var pageInfo = $.initPageInfo(PAGE_NAME, [ "firstScreenIndex", "focusIndex" ], {
    firstScreenIndex: 0,
    focusIndex: 0
});

var valData = DATALIST[0].valData;

var bgData = DATALIST[1].bgData;

var timer = null;

var focusIndex = pageInfo.focusIndex, firstScreenIndex = pageInfo.firstScreenIndex, columnWidth = 86, total = valData.length, lock = false;
function initPage() {
    $.recodeData(subjectName, "zt");
    $.initPage();
    _initBackGround()
    renderPage();
    initFocus();
}

function _initBackGround() {
    $("body").css("background", 'url("' + bImgPath + '") no-repeat transparent');
}

function renderPage() {
    var $container;
    var $listContent;
    var str = "";
    var titleName = "";
    var contentTitle = "";
    var contentIntro = "";
    var direction = "";
    $container = $('<div class="container"></div>');
    for (var i = 0; i < total; i++) {
        titleName = valData[i].contentName.split("@")[0];
        direction = valData[i].contentName.split("@")[1] || "";
        str += '<div id="item' + i + '" class="item" style="top:' + columnWidth * i + 'px">' + '<div class="listTitle"><div class="titleName autoText">' + titleName + "</div></div></div>";
    }
    contentIntro = $.substringElLength(valData[focusIndex].intro, "35px", "5136px").last;
    contentTitle = valData[focusIndex].contentName.split("@")[0];
    $listContent = $('<div class="listContent"><div class="itemList">' + str + "</div></div>");
    $listContent.appendTo($container);
    var CLASS = bImgPath ? "noPic" : "";
    $('<div class="bgList' + CLASS + '"></div>').appendTo("body");
    $container.appendTo("body");
    $('<div id="pageNum"></div><div id="up"></div><div id="down"></div>').appendTo("body");
    translateX();
}

function focusTo() {
    var item = "#item" + focusIndex;
    $.focusTo(item);
    $(item).addClass("focusBorder");
    $("#pageNum").html("<span>" + (focusIndex + 1) + "</span>/" + total);
    textScroll();
    if (firstScreenIndex == 0) {
        $("#up").hide();
    } else {
        $("#up").show();
    }
    if (firstScreenIndex >= total - 10) {
        $("#down").hide();
    } else {
        $("#down").show();
    }
}

function initFocus() {
    focusTo();
}

function textScroll() {
    var el = $(".focusBorder .listTitle .titleName");
    $.Marquee({
        el: el[0]
    });
}

function translateX() {
    $(".itemList").css({
        "-webkit-transform": "translateY(-" + columnWidth * firstScreenIndex + "px)"
    });
}

function _up() {
    if (lock) return;
    clearTimeout(timer);
    if (focusIndex == 0) {
        return true;
    }
    if (focusIndex == firstScreenIndex + 4 && firstScreenIndex != 0) {
        firstScreenIndex--;
        focusIndex--;
        translateX();
        lock = true;
        timer = setTimeout(function() {
            lock = false;
        }, 500);
    } else {
        focusIndex -= 1;
    }
    focusTo();
    return true;
}

function _down() {
    if (lock) return;
    clearTimeout(timer);
    if (focusIndex == total - 1) {
        return true;
    }
    if (focusIndex == firstScreenIndex + 4 && focusIndex < total - 6) {
        firstScreenIndex++;
        focusIndex++;
        translateX();
        lock = true;
        timer = setTimeout(function() {
            lock = false;
        }, 500);
    } else {
        focusIndex += 1;
    }
    focusTo();
    return true;
}

function _ok() {
    var nextPage = valData[focusIndex];
    var type = [ "3", "7" ];
    nextPage["categoryId"] = subjectId;
    nextPage["ztCategoryId"] = subjectId;
    $.savePageInfo(PAGE_NAME, {
        firstScreenIndex: firstScreenIndex,
        focusIndex: focusIndex
    });
    if (type.indexOf(nextPage.contentType) > -1) {
        if (nextPage.contentType == type[0]) {
            nextPage.contentType = type[1];
        } else {
            nextPage.contentType = type[0];
        }
    }
    $.gotoDetail(nextPage);
}