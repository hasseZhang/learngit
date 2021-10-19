var pageName = "aishangHome";

var $martext;

var $notice = null;

var isLoad = false;

var pageInfo = $.initPageInfo(pageName, [ "sizeListIndex", "sizePlayIndex", "menuTranslateX", "moduleBegin", "menuIndex", "moduleIndex", "type", "activeNum","module35Index","module41RightListIndex" ], {
    sizeListIndex: 0,
    sizePlayIndex: 0,
    menuTranslateX: 0,
    moduleBegin: 0,
    menuIndex: 1,
    moduleIndex: 0,
    type: "menu",
    activeNum: 0,
    module35Index:0,
    module41RightListIndex:0
});

var sizeListIndex = pageInfo.sizeListIndex;

var sizePlayIndex = pageInfo.sizePlayIndex;

var homeAllData = ssk;

var homeMarquee = homeAllData.pop();

var menuMap = {};

var oCanvas = null;

var oGc = null;

var $menu = null;

var $wrap = null;

var imgBgArr = [];

var flashlightHtml = '<div class="flashlightWrap"><div class="flashlight"></div></div>';

var isShowEmail = false;

var isCanShowEmail = "";

var sectionTransYMap = [];

var wrapTop = "";

var isFirstActive = true;

var noResetMenuIndex;

function unload() {
    sizeVideo.release();
    saveData();
}

function load() {
    if (!homeAllData || isLoad) return;
    $menu = $("#menu");
    $wrap = $("#wrap");
    isLoad = true;
    oCanvas = $("#caBg")[0];
    oGC = oCanvas.getContext("2d");
    preload();
    preloadBg(function () {
        createAllEl();
        wrapTop = parseInt($("#wrap").css("top"));
        modules.menu.setTranslateX(pageInfo.menuTranslateX);
        initHeader();
        $.pTool.add("p_module", p_module());
        $.pTool.get("p_module").init({
            moduleBegin: pageInfo.moduleBegin,
            activeNum: pageInfo.activeNum,
            subIndex: pageInfo.menuIndex,
            moduleIndex: pageInfo.moduleIndex,
            type: pageInfo.type
        });
        $.pTool.active("p_module");
        // 初始话跑马灯
        headerMarquee();
        loadImg(pageInfo.menuIndex);
        isFirstActive = false;
        setTimeout(function () {
            $("#section").css({
                "-webkit-transition": "0.5s linear"
            });
            $("#section .sections", "#section", true).css({
                "-webkit-transition": "0.5s linear"
            });
            $("#menu").css({
                "-webkit-transition": "0.5s"
            });
            $("#moveMenu").css({
                "-webkit-transition": "0.5s"
            });
            $("#wrap").css({
                "-webkit-transition": "0.5s"
            });
        }, 50);
    });
}

function preload() {
    for (var i = 0; i < homeAllData.length; i++) {
        if (homeAllData[i].navIcon) {
            var onImg0 = new Image();
            onImg0.src = homeAllData[i].navIcon;
        }
        if (homeAllData[i].navIconF) {
            var onImg1 = new Image();
            onImg1.src = homeAllData[i].navIconF;
        }
        if (homeAllData[i].navIconC) {
            var onImg2 = new Image();
            onImg2.src = homeAllData[i].navIconC;
        }
    }
}
function initHeader(){
    var $header = $("#header");
    initTime($header);
    initWeek($header);
}
function initTime($header) {
    var preTime = new $.Date().format("hh:mm");
    var oTime = $('<div class="time"></div>');
    oTime.html(preTime);
    oTime.appendTo($header);
    headerTimeId = setInterval(function () {
        var nowTime = new $.Date().format("hh:mm");
        if (nowTime != preTime) {
            preTime = nowTime;
            oTime.html(nowTime);
        }
    }, 1e3);
}
function initWeek($header){
    var weekDay = $('<div class="weekday"></div>');
    var weeks = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六']
    var weekIndex = new $.Date().getDay();
    var today = weeks[weekIndex];
    weekDay.html(today);
    weekDay.appendTo($header);

}
function preloadBg(cb) {
    var index = 0;
    imgBgArr = [];
    var srcArr = [];
    preImg();
    function preImg() {
        var preIndex = 0;
        var isHasPre = false;
        var imgSrc = homeAllData[index].bg;
        $.UTIL.each(srcArr, function(v, i) {
            if (v === imgSrc) {
                preIndex = i;
                isHasPre = true;
                return true;
            }
        });
        if (isHasPre) {
            loadFn.apply(imgBgArr[preIndex]);
            srcArr.push(imgBgArr[preIndex].src);
        } else {
            var oImg = new Image();
            oImg.onload = loadFn;
            oImg.onerror = loadFn;
            oImg.src = imgSrc + "?20200602";
            srcArr.push(imgSrc);
        }
    }
    function loadFn() {
        imgBgArr.push(this);
        this.onload = null;
        this.error = null;
        index++;
        if (index > homeAllData.length - 1) {
            cb && cb();
            return;
        }
        preImg();
    }
}

function canvasBg(index, clearArr) {
    if (imgBgArr[index] && imgBgArr[index].naturalHeight) {
        oGC.clearRect(0, 0, 1920, 1080);
        oGC.drawImage(imgBgArr[index], 0, 0);
        if (clearArr) {
            oGC.clearRect(clearArr[0], clearArr[1], clearArr[2], clearArr[3]);
        }
    }
}

function savePageInfo() {
    $.savePageInfo(pageName, {
        focus: ACTIVE_OBJECT.key
    });
}
function leaveHeader() {
    $.pTool.active("p_module");
}

function headerMarquee() {
    if (isShowEmail) {
        return;
    }
    var msg = "";
    if (homeMarquee && homeMarquee.data && homeMarquee.data.length) {
        var tmp = homeMarquee.data[0];
        if (tmp && !/^#/.test(tmp)) {
            msg = tmp;
            showMarquee(msg);
        }
    }
}


function showMarquee(msg) {
    var $marquee = $('#marquee')
    $('<div class="icon"></div><div class="notice"><div class="mar"><div class="text"></div></div></div>').appendTo($marquee);
    if (!$martext) {
        $martext = $("#marquee .mar .text");
        $notice = $("#marquee .notice");
    }
    if (msg) {
        $martext.html(msg + "<br/>" + msg);
        $notice.css("visibility", "visible");
        autoMarquee();
    }
}

function autoMarquee() {
    var lineHeight = parseInt($martext.css("line-height"));
    var totalHeight = $martext.clientHeight();
    var totalLine = Math.round(totalHeight / lineHeight);
    lineHeight = totalHeight / totalLine;
    var lineIndex = 0;
    var timer = null;
    var realTotalLine = totalLine / 2;
    if (realTotalLine < 2) {
        return;
    }
    function aotoGo() {
        timer = setTimeout(function () {
            addTransition();
            lineIndex++;
            setTransY();
            if (lineIndex === realTotalLine) {
                setTimeout(function () {
                    removeTransition();
                    lineIndex = 0;
                    setTransY();
                }, 500);
            }
            aotoGo();
        }, 3e3);
    }
    function setTransY() {
        $martext.css({
            "-webkit-transform": "translateY(-" + lineHeight * lineIndex + "px)"
        });
    }
    function addTransition() {
        $martext.css({
            "-webkit-transition": "0.5s"
        });
    }
    function removeTransition() {
        $martext.css({
            "-webkit-transition": "none"
        });
    }
    clearTimeout(timer);
    aotoGo();
}
