var pageName = "youku_home";

var RECODE_DATA_KEY = pageName;

var $martext;

var $notice = null;

var isLoad = false;

var pageInfo = $.initPageInfo(pageName, ["moduleliveInfo", "moduleBegin", "module25Info", "module27Index", "module32Index", "menuIndex", "moduleIndex", "type", "activeNum", "isHeader", "headerActiveKey", "translateY", "translatePosition"], {
    moduleBegin: 0,
    moduleliveInfo: {},
    module25Info: {},
    module27Index: 0,
    module32Index: 0,
    menuIndex: 0,
    moduleIndex: 0,
    type: "menu",
    activeNum: 0,
    isHeader: false,
    headerActiveKey: "search",
    translateY: 0,
    translatePosition: 0
});

var typeToMenuIndex = {
    f4: 0,
    f3: 5,
    wd: 0,
    qb: 1,
    tj: 2,
    zb: 3,
    vip: 4,
    dy: 5,
    dsj: 6,
    zy: 7,
    se: 8,
    "4k": 9,
    jlp: 10,
    yy: 11
};

if (!$.isBack()) {
    if (typeToMenuIndex.hasOwnProperty($.page.type)) {
        pageInfo.menuIndex = typeToMenuIndex[$.page.type];
    }
}

var activePlugin = "";

var headerActiveKey = pageInfo.headerActiveKey;

var providerHome = $.getHelper("provider:home");

var homeAllData = ssk;

// var saveHomeAllData = null;

var homeMarquee = homeAllData.pop();

var menuMap = {};

var oCanvas = null;

var oGc = null;

var $picScreen = null;

var $menu = null;

var $wrap = null;

var imgBgArr = [];

var liveWindowInfo = [];

var livingInfo = null;

var authInfo = [];

var vodWindowInfo = [];

var vodPlayer = null;

var isHasModLf = false;

var flashlightHtml = '<div class="flashlightWrap"><div class="flashlight"></div></div>';

var isShowEmail = false;

var isCanShowEmail = "";

var sectionTransYMap = [];

var picScreenType = "121";

var wrapTop = "";

// function dealData(ds) {
//     if (ds) {
//         saveHomeAllData = ds;
//         homeMarquee = ds.pop();
//         pageInfo.menuIndex = Math.min(pageInfo.menuIndex, homeAllData.length - 1);
//         menuMap = {};
//         $.UTIL.each(ds, function (value, index) {
//             menuMap[value.contentName] = index;
//         });
//     }
// }
// providerHome.topic.once("error", dataFirstCallbackError);
// providerHome.margin(dataFirstCallback);

// function dataFirstCallbackError() {
//     if (homeAllData) return;
//     dataFirstCallback(providerHome.cache());
// }

// function dataFirstCallback(ds) {
//     if (homeAllData) return;
//     homeAllData = ds;
//     dealData(ds);
//     $(load);
// }
var noResetMenuIndex;

function dataChange(list, data) {
    dealData(data);
    var nowMenuIndex = $.pTool.get("p_module").getInfo().subIndex;
    $.UTIL.each(list, function (value, key) {
        var changeIndex = 0;
        if (key == "msg") {
            headerMarquee();
            return true;
        }
        if (value === "mod") {
            changeIndex = menuMap[key];
        }
        if (changeIndex === nowMenuIndex) {
            noResetMenuIndex = changeIndex;
        } else {
            homeAllData = saveHomeAllData;
            $.pTool.get("p_module").upHomeData();
            createOneSection(changeIndex);
            if (isHasModLf && !$(".moduleliveInfo").length) {
                isHasModLf = false;
                clearTimeout(modules.moduleliveInfo.info.timer);
            }
            loadImg(nowMenuIndex);
        }
    });
}

function menuChange(list, data) {
    $.UTIL.each(list, function (value, key) {
        if (value) {
            preloadBg(function () {
                modules.menu.createEl();
                if ($.pTool.get("p_module").getInfo().type === "menu") {
                    modules.menu.focus();
                } else {
                    modules.menu.blur($.pTool.get("p_module").getInfo().subIndex);
                }
            });
            return true;
        }
    });
}

var changeTimer = null;

var isChanging = false;

function loadChangePage() {
    if ($.pTool.get("p_module").getInfo().subIndex === noResetMenuIndex) {
        isChanging = false;
        clearTimeout(changeTimer);
    }
    if ($.UTIL.isNumber(noResetMenuIndex) && noResetMenuIndex !== $.pTool.get("p_module").getInfo().subIndex) {
        if (!isChanging) {
            isChanging = true;
            changeTimer = setTimeout(function () {
                homeAllData = saveHomeAllData;
                $.pTool.get("p_module").upHomeData();
                createOneSection(noResetMenuIndex);
                if (isHasModLf && !$(".moduleliveInfo").length) {
                    isHasModLf = false;
                    clearTimeout(modules.moduleliveInfo.info.timer);
                }
                loadImg($.pTool.get("p_module").getInfo().subIndex);
                isChanging = false;
                noResetMenuIndex = undefined;
            }, 500);
        }
    }
}

function unload() {
    saveData();
    videoScreen.release();
    vodPlayer && vodPlayer.release();
    if (livingInfo) {
        livePlayer && livePlayer.release();
    }
    providerHome.data.clear();
    providerHome.topic.empty();
    providerHome = null;
}

function activeHeader() {
    modules.menu.blur(pageInfo.menuIndex);
    $.pTool.active("header");
    showSubPicScreen(1);
    videoScreen.subPlay();
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
        modules.menu.setTranslateX(pageInfo.translatePosition);
        initLiveInfo();
        initVodInfo();
        $.pTool.get("header").init({
            isHasTime: 1,
            activeKey: headerActiveKey,
            leaveHeader: leaveHeader,
            isKm: true,
        });
        $.pTool.add("p_module", p_module());
        $.pTool.get("p_module").init({
            moduleBegin: pageInfo.moduleBegin,
            activeNum: pageInfo.activeNum,
            subIndex: pageInfo.menuIndex,
            moduleIndex: pageInfo.moduleIndex,
            type: pageInfo.type
        });
        if ($.pTool.get("p_module").getInfo().type === "menu") {
            showSubPicScreen(1);
            videoScreen.subPlay();
        }
        if (pageInfo.isHeader) {
            if (headerActiveKey !== "email") {
                activeHeader();
            }
        } else {
            $.pTool.active("p_module");
        }
        loadImg(pageInfo.menuIndex);
        var liveInfo = checkLive(pageInfo.menuIndex);
        isWillPlay = !!liveInfo;
        if (liveInfo) {
            playChannel(liveInfo.menuIndex, liveInfo.key);
        }
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
        // providerHome.topic.sub("change", dataChange);
        // providerHome.topic.sub("change", menuChange);
        // providerHome.data.repeat(30 * 1e3 * 60); //17分钟更新一次
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

function preloadBg(cb) {
    var index = 0;
    imgBgArr = [];
    var srcArr = [];
    preImg();

    function preImg() {
        var preIndex = 0;
        var isHasPre = false;
        var imgSrc = homeAllData[index].bg;
        $.UTIL.each(srcArr, function (v, i) {
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
        } else {
            if (isCanShowEmail) {
                msg = isCanShowEmail;
            }
        }
    }
    showMarquee(msg);
}

function headerEmailMar() {
    $.s.email.top({}, {
        success: function (data) {
            if (data && data.code === 1 && data.config && data.result) {
                var emailArr = data.result.split("@@@@@@");
                var msg = "";
                $.UTIL.each(emailArr, function (value, index) {
                    var iMsgArr = value.split("@@@");
                    msg += (iMsgArr[1] || iMsgArr[0]) + (index < emailArr.length - 1 ? "<br/>" : "");
                });
                if (msg) {
                    if (data.config.priority === "1") {
                        isShowEmail = true;
                        showMarquee(msg);
                    } else if (data.config.priority === "0") {
                        isCanShowEmail = msg;
                        headerMarquee();
                    }
                }
            } else {
                headerMarquee();
            }
        },
        error: function () {
            headerMarquee();
        }
    });
}

function showMarquee(msg) {
    if (!$martext) {
        $martext = $("#header .mar .text");
        $notice = $("#header .notice");
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