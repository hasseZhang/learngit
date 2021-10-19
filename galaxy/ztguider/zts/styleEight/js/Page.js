var PAGE_NAME = "ZT_STYLEEIGHT" + subjectId;

var PAGE_INFO = [ {
    key: "itemList",
    pressLeft: _left,
    pressRight: _right,
    pressUp: "",
    pressDown: "",
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

var focusIndex = pageInfo.focusIndex, firstScreenIndex = pageInfo.firstScreenIndex, columnWidth = 436, total = valData.length, lock = false;


function initPage() {
    $.recodeData(subjectName, "zt");
    $.initPage();
    _initBackGround();
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
    var wholeTitle = "";
    var contentTitle = "";
    var contentIntro = "";
    var direction = ""; 
    
    $container = $('<div class="container"></div>');
    for (var i = 0; i < total; i++) {
        titleName = valData[i].contentName.split("@")[0];
        direction = valData[i].contentName.split("@")[1] || "";
        str += '<div id="item' + i + '" class="item" style="left:' + columnWidth * i + 'px">' + '<img src="' + valData[i].img + '" alt="" />' + '<div class="listTitle"><div class="titleName autoText">' + titleName + "</div>" + '<div class="titleIntro">' + direction + '</div></div><div class="titleShadow"></div></div>';
    }
    contentIntro = $.substringElLength(valData[focusIndex].intro, "35px", "5136px").last;
    contentTitle = valData[focusIndex].contentName.split("@")[0];
    $listContent = $('<div class="listContent"><div class="itemList">' + str + "</div></div>");
    $listContent.appendTo($container);
    var CLASS = bImgPath  ? "noPic" : "";
    $('<div class="bgList' + CLASS + '"></div>').appendTo("body");
    $container.appendTo("body");
    translateX();
}

function focusTo() {
    var item = "#item" + focusIndex;
    $.focusTo(item);
    $(item).addClass("focusBorder");
    textScroll();
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
        "-webkit-transform": "translateX(-" + columnWidth * firstScreenIndex + "px)"
    });
}

function bgChange() {
    if (bgData.length < total) return;
    var bgImg = bgData[focusIndex].bgImg;
    $(".bgImg", ".bgList").attr("src", bgImg);
}

function change() {
    var title = valData[focusIndex].contentName.split("@")[0];
    var intro = $.substringElLength(valData[focusIndex].intro, "35px", "5136px").last;
    $(".contentTitle").html(title);
    $(".contentIntro").html(intro);
    bgChange();
}

function _left() {
    if (lock) return;
    clearTimeout(timer);
    if (focusIndex == 0) {
        return true;
    }
    if (focusIndex > firstScreenIndex) {
        focusIndex -= 1;
    } else {
        firstScreenIndex--;
        focusIndex--;
        translateX();
        lock = true;
        timer = setTimeout(function() {
            lock = false;
        }, 500);
    }
    focusTo();
    change();
    return true;
}

function _right() {
    if (lock) return;
    clearTimeout(timer);
    if (focusIndex == total - 1) {
        return true;
    }
    if (focusIndex >= firstScreenIndex + 3) {
        firstScreenIndex++;
        focusIndex++;
        translateX();
        lock = true;
        timer = setTimeout(function() {
            lock = false;
        }, 500);
    } else {
        if (focusIndex + 1 < total) {
            focusIndex += 1;
        } else {
            if (focusIndex != total - 1) {
                focusIndex = total - 1;
            }
        }
    }
    focusTo();
    change();
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