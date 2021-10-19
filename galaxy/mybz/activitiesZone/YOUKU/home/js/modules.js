$.getElem = function (id) {
    return $("#" + id)[0];
};

function autoHeader(translateY) {
    if (translateY == 0) {
        $.pTool.get("header").show();
        $("body").removeClass("moveUp");
        $wrap.attr({
            translatey: "0"
        });
    } else {
        $.pTool.get("header").hide();
        $("body").addClass("moveUp");
        $wrap.attr({
            translatey: wrapTop
        });
    }
}
//新增
function removeOneSection() {
    $("#section" + $.pTool.get("p_module").getInfo().preSubIndex).html("")
}

function createAllEl() {
    var data = homeAllData;
    var $section = $("#section");
    createMenu();
    createAllSections();
    // createSections();

    function createMenu() {
        modules.menu.createEl();
    }

    function createAllSections() {
        for (var i = 0; i < data.length; i++) {
            var $nowSection = $('<div id="section' + i + '" class="sections"></div>');
            sectionTransYMap.push(0);
            $nowSection.appendTo($section);
        }
    }
    // function createSections() {
    // for (var i = 0; i < data.length; i++) {
    //     createOneSection(i);
    // }
    // }
}

function createOneSection(menuIndex) {
    try {
        var pageData = homeAllData[menuIndex].subContent;
        var $nowSection = $("#section" + menuIndex);
        liveWindowInfo[menuIndex] = null;
        authInfo[menuIndex] = null;
        authLock = false;
        vodWindowInfo[menuIndex] = null;
        $nowSection.html("");
        for (var i = 0; i < pageData.length; i++) {
            var moduleName = "module" + pageData[i].moduleType;
            var $module = $('<div class="modules ' + moduleName + '" id="m' + menuIndex + "m" + i + '"></div>');
            var $moduleTitle = null;
            var $moduleTitle2 = null;
            var $blockWrap = $('<div class="blockWrap"></div>');
            if (pageData[i].moduleTitle !== "null") {
                $moduleTitle = $('<div class="moduleTitle">' + pageData[i].moduleTitle + "</div>");
                $moduleTitle.appendTo($module);
            }
            if (pageData[i].moduleType === "vfav") {
                $moduleTitle2 = $('<div class="moduleTitle2">•点播节目</div>');
                $moduleTitle2.appendTo($module);
            } else if (pageData[i].moduleType === "cfav") {
                $moduleTitle2 = $('<div class="moduleTitle2">•直播节目</div>');
                $moduleTitle2.appendTo($module);
            } else if (pageData[i].moduleType === "23") {
                var infosHtml = "";
                for (var j = 0; j < modules["module" + pageData[i].moduleType].info.maxLen; j++) {
                    infosHtml += '<div class="infos"></div>';
                }
                $('<div class="info">' + infosHtml + "</div>").appendTo($module);
            }
            $blockWrap.html(modules[moduleName].createEl(menuIndex, i));
            $blockWrap.appendTo($module);
            $module.appendTo($nowSection);
        }
        var iReturnTop = modules.returnTop.createEl(menuIndex);
        iReturnTop.appendTo($nowSection);
        initLiveInfo();
        initVodInfo();
    } catch (e) {
        $.log.out.error = ["homeError:%s(%s)-%s", homeAllData[menuIndex].contentName, menuIndex, i, e];
    }
}
// 新增
// 直播模块频道的节目单展示
function getPlayBill(info, cb) {
    var playBillObj = {};
    var successCb = cb.success || function () {};
    var errorCb = cb.error || function () {};
    var key = info.date + "_" + info.id;
    if (playBillObj[key] && playBillObj[key] !== "loading" && playBillObj[key] !== "error") {
        successCb(playBillObj[key]);
    } else if (playBillObj[key] === "error") {
        errorCb();
    } else {
        if (playBillObj[key] !== "loading") {
            playBillObj[key] = "loading";
            $.s.playbill.get({
                date: info.date,
                id: info.id
            }, {
                success: function (data) {
                    playBillObj[key] = data;
                    successCb(data);
                },
                error: function () {
                    playBillObj[key] = "error";
                    errorCb();
                }
            });
        }
    }
}

function loadPageText(menuIndex) {
    var pageData = homeAllData[menuIndex].subContent;
    for (var i = 0; i < pageData.length; i++) {
        var nowId = "m" + menuIndex + "m" + i;
        var $aBlock = $("#" + nowId + " .blocks", "#" + nowId, true);
        for (var j = 0; j < $aBlock.length; j++) {
            var d = pageData[i].moduleContent[j] || {};
            var episodeText = "";
            var episodeArr = d.episodeStatus && /\//.test(d.episodeStatus) ? d.episodeStatus.split("/") : "";
            switch (+d.contentType) {
                case 2:
                    if (episodeArr) {
                        if (episodeArr[0] == episodeArr[1]) {
                            episodeText = episodeArr[0] + "集全";
                        } else {
                            episodeText = "更新至" + episodeArr[0] + "集";
                        }
                    }
                    break;

                case 3:
                    if (episodeArr) {
                        if (episodeArr[0] == episodeArr[1]) {
                            episodeText = episodeArr[0] + "期全";
                        } else {
                            if (d.topicSceneLastOnlineTime) {
                                episodeText = "更新至" + d.topicSceneLastOnlineTime.slice(0, 8) + "期";
                            } else {
                                episodeText = "已更" + episodeArr[0] + "期";
                            }
                        }
                    }
                    break;
            }
            var $nowEpisode = $aBlock.item(j).find(".episode");
            var $nowContentTitle = $aBlock.item(j).find(".contentTitle");
            if (episodeText) {
                $nowEpisode.html(episodeText);
                $nowEpisode.css({
                    visibility: "visible"
                });
            }
            if (JSON.stringify(d) === '{}') {
                if (pageData[i].moduleType !== '15' && pageData[i].moduleType !== "12") {
                    if (pageData[i].moduleType == "13") {
                        // $nowContentTitle.show();
                    } else {
                        // $nowContentTitle.show();
                        $nowContentTitle.addClass('contentTitileShaw');
                    }
                }
            } else if (d && d.contentName) {
                var contentName = d.contentName;
                if(pageData[i].moduleType == "4" && $aBlock.item(j).hasClass('ver') && /^#/.test(contentName)){
                    $aBlock.item(j).addClass('noContentTitle')
                }
                if (pageData[i].moduleType == "19") {
                    var $aOnlineTime = $("#" + nowId + " .onlineTimes", "#" + nowId, true);
                    var textArr = d.contentName.split("@");
                    contentName = textArr[0];
                    if ($aOnlineTime.item(j).length) {
                        $aOnlineTime.item(j).html(textArr[1] || "敬请期待");
                    }
                } else if (pageData[i].moduleType == "25") {
                    contentName = d.contentName.split("@")[0];
                }
                if (pageData[i].moduleType == "13") {
                    $nowContentTitle.show();
                }
                if (!/^#/.test(contentName) && $nowContentTitle.length) {
                    $nowContentTitle.html(contentName);
                    $nowContentTitle.show();
                }
            }
            if (episodeText && d.contentName && !/^#/.test(d.contentName) && /hor/.test($aBlock.item(j)[0].className)) {
                $nowEpisode.addClass("episodeMoveUp");
            }
        }
    }
}

var preTranslateY = 0;

var preModuleIndex = 0;

function setSectionTranslateY(el, menuIndex, isNoCheckScreenPic, isNoCheckScreenVideo) {
    if (!el) {
        return;
    }
    var moduleIndex = el.id.split("m")[2];
    if ($(el).hasClass("notrany")) {
        el = $("#m" + menuIndex + "m" + moduleIndex).find(".blocks")[0];
    }

    function getPositionTop() {
        var elTop = 0;
        var elem = el;
        var elHeight = "";
        var lastElemKey = "section";
        while (elem) {
            if (elem.id == lastElemKey) {
                break;
            }
            elTop += elem.offsetTop;
            elem = elem.offsetParent;
        }
        return -(elTop + elHeight);
    }
    var elHeight = el.offsetHeight;
    var translateYElem = $("#section" + menuIndex)[0];
    preTranslateY = -sectionTransYMap[menuIndex];
    var positionTop = getPositionTop();
    var baseY = 220;
    var translateY = positionTop + baseY;
    var translateYElemHeight = translateYElem.offsetHeight;
    var sectionHeight = $.getElem("section").offsetHeight;
    if (-positionTop + elHeight < 1080 - wrapTop - 10 || translateY > 0) {
        translateY = 0;
    } else {
        if (preTranslateY > 0 && -translateY - preTranslateY > 0 && 1080 - baseY - (-translateY - preTranslateY) - elHeight > 60 && preModuleIndex === $.pTool.get("p_module").getInfo().moduleIndex) {
            translateY = -preTranslateY;
        } else {
            if (translateY < sectionHeight - translateYElemHeight) {
                translateY = sectionHeight - translateYElemHeight;
            }
        }
    }
    sectionTransYMap[menuIndex] = translateY;
    preModuleIndex = $.pTool.get("p_module").getInfo().moduleIndex;
    if (!isNoCheckScreenPic) {
        showSubPicScreen(1);
    }
    if (!isNoCheckScreenVideo) {
        videoScreen.subPlay();
    }
    autoHeader(translateY);
    $(translateYElem).css({
        "-webkit-transform": "translateY(" + translateY + "px)"
    });
}

var preMenuIndex;

function setTranslateX(menuIndex, isFirst) {
    var sectionWidth = 1920;
    $("#section").css({
        "-webkit-transform": "translateX(" + -sectionWidth * menuIndex + "px)"
    });
    canvasBg(menuIndex);
    sendRecord(menuIndex, isFirst ? 0 : 400);
    if (isHasModLf) {
        if ($(".moduleliveInfo", "#section" + menuIndex).length) {
            modules.moduleliveInfo.beginTimer();
        } else {
            modules.moduleliveInfo.stopTimer();
        }
    }
    // var vodKey = "";
    // if (typeof preMenuIndex !== "undefined" && vodWindowInfo[preMenuIndex]) {
    //     $.UTIL.each(vodWindowInfo[preMenuIndex], function (value, key) {
    //         vodKey = key;
    //         return true;
    //     });
        // modules.module25.stopAutoPlay(preMenuIndex, vodKey.split("m")[2]);
    // }
    // if (vodWindowInfo[menuIndex]) {
    //     $.UTIL.each(vodWindowInfo[menuIndex], function (value, key) {

    //         vodKey = key;
    //         return true;
    //     });
        // modules.module25.autoPlay(menuIndex, vodKey.split("m")[2]);
    // }
    if (typeof preMenuIndex !== "undefined") {
        $.UTIL.each(homeAllData[preMenuIndex].subContent, function (value, index) {
            if (value.moduleType === "32") {
                modules["module" + value.moduleType].stopAutoPlay(preMenuIndex, index);
                vodPlayer && (vodPlayer.release(), vodPlayer = null);
            }
        });
    }
    $.UTIL.each(homeAllData[menuIndex].subContent, function (value, index) {
        if (value.moduleType === "32") {
            modules["module" + value.moduleType].info.vodPlaying = false;
            modules["module" + value.moduleType].autoPlay(menuIndex, index, true);
        }
    });
    preMenuIndex = menuIndex;
}

function resetTranslateY(nowMenuIndex) {
    setTimeout(function () {
        var $aSection = $("#section .sections", "#section", true);
        for (var i = 0; i < $aSection.length; i++) {
            if (nowMenuIndex == i) {
                continue;
            }
            sectionTransYMap[i] = 0;
            $aSection.item(i).css({
                "-webkit-transform": "translateY(0px)"
            });
        }
    }, 500);
}

var autoImgTimer = null;

function loadImg(menuIndex, isOther) {
    var $aModules = $("#section" + menuIndex + " .modules", "#section" + menuIndex, true);
    var sectionTranslateY = -sectionTransYMap[menuIndex];
    var oWrapBottom = $.getElem("wrap").clientHeight;
    var moduleIndexArr = [];

    function getPositionTop(el) {
        var elTop = 0;
        var elem = el;
        var elHeight = "";
        var lastElemKey = "wrap";
        while (elem) {
            if (elem.id == lastElemKey) {
                break;
            }
            elTop += elem.offsetTop;
            elem = elem.offsetParent;
        }
        return +(elTop + elHeight);
    }

    function showImg(menuIndex, moduleIndex) {
        var nowId = "m" + menuIndex + "m" + moduleIndex;
        var $nowEl = $("#" + nowId);
        if (!$nowEl.length) {
            return;
        }
        if ($nowEl.attr("isload")) {
            return;
        }
        var $aBlock = $("#" + nowId + " .blocks", "#" + nowId, true);
        for (var i = 0; i < $aBlock.length; i++) {
            var picType = $aBlock.item(i).attr("pictype");
            var nowPics = homeAllData[menuIndex].subContent[moduleIndex].moduleContent[i] && homeAllData[menuIndex].subContent[moduleIndex].moduleContent[i].pics;
            $aBlock.item(i).find(".images").addClass("noContent");
            if (nowPics && nowPics[picType]) {
                var picSrc = nowPics[picType];
                picSrc && $aBlock.item(i).find(".images img").length && $aBlock.item(i).find(".images img").attr("src", picSrc);
                (function (i) {
                    setTimeout(function () {
                        $aBlock.item(i).find(".images").removeClass("noContent");
                        $aBlock.item(i).find(".orderImg").removeClass("noContent");
                    }, 50)
                })(i);
            } else {
                // $aBlock.item(i).find(".orderImg").addClass("noContent");
                $aBlock.item(i).find(".images").addClass("noContent");
            }
            var $innerImg = $aBlock.item(i).find(".innerImg");
            if ($innerImg.length) {
                $innerImg.attr("src", nowPics[$innerImg.attr("innertype")]);
                $aBlock.item(i).addClass("hasInner");
            }
        }
        $nowEl.attr("isload", "1");
        loadService(menuIndex, moduleIndex);
        loadAuth(menuIndex, moduleIndex);
    }

    function loadService(menuIndex, moduleIndex) {
        var nowType = "module" + homeAllData[menuIndex].subContent[moduleIndex].moduleType;
        if (modules[nowType] && modules[nowType].loadService) {
            modules[nowType].loadService(menuIndex, moduleIndex);
        }
    }

    function loadAuth(menuIndex, moduleIndex) {
        var nowType = "module" + homeAllData[menuIndex].subContent[moduleIndex].moduleType;
        if (modules[nowType] && modules[nowType].auth) {
            modules[nowType].auth();
        }
    }
    for (var i = 0; i < $aModules.length; i++) {
        var nowId = "m" + menuIndex + "m" + i;
        var nowEl = $("#" + nowId)[0];
        var offTop = getPositionTop(nowEl);
        var offBottom = offTop + nowEl.offsetHeight;
        if (offBottom - sectionTranslateY > 0 && offTop - sectionTranslateY < oWrapBottom) {
            moduleIndexArr.push(i);
            showImg(menuIndex, i);
        }
    }
    if (isOther) {
        return;
    }
    showImg(menuIndex, moduleIndexArr[0] - 1);
    showImg(menuIndex, moduleIndexArr[moduleIndexArr.length - 1] + 1);
    loadImg(menuIndex - 1, true);
    loadImg(menuIndex + 1, true);
}

function autoLoadImg(menuIndex) {
    var info = checkLive(menuIndex);
    var vodInfo = checkVod(menuIndex);
    clearTimeout(autoImgTimer);
    isWillPlay = !!info;
    stopLive(menuIndex);
    stopVodPlay(menuIndex);
    autoImgTimer = setTimeout(function () {
        loadImg(menuIndex);
        if (info) {
            playChannel(info.menuIndex, info.key);
        } else if (vodInfo) {
            $.UTIL.each(homeAllData[menuIndex].subContent, function (value, index) {
                if (value.moduleType === "32") {
                    modules["module" + value.moduleType].info.vodPlaying = false;
                    modules["module" + value.moduleType].autoPlay(menuIndex, index, true);
                }
            });
        }
    }, 500);
}

function checkLive(menuIndex) {
    // var wrapTranslateY = +($wrap.attr("translatey") || 0);
    var nowLiveInfo = liveWindowInfo[menuIndex];
    var sectionTranslateY = -sectionTransYMap[menuIndex];
    var oWrapBottom = $.getElem("wrap").clientHeight;
    var playWindow = "";
    $.UTIL.each(nowLiveInfo, function (value, key) {
        if (value.offsetTop >= sectionTranslateY && value.offsetBottom - oWrapBottom <= sectionTranslateY) {
            playWindow = key;
        }
    });
    return playWindow ? {
        menuIndex: menuIndex,
        key: playWindow
    } : null;
}

function checkVod(menuIndex) {
    var nowVodInfo = vodWindowInfo[menuIndex];
    var sectionTranslateY = -sectionTransYMap[menuIndex];
    var oWrapBottom = $.getElem("wrap").clientHeight;
    var playVodWindow = "";
    $.UTIL.each(nowVodInfo, function (value, key) {
        if (value.offsetTop >= sectionTranslateY && value.offsetBottom - oWrapBottom <= sectionTranslateY) {
            playVodWindow = key;
        }
    });
    return playVodWindow ? {
        menuIndex: menuIndex,
        key: playVodWindow
    } : null;
}

function playChannel(menuIndex, key) {
    var nowChannelInfo = liveWindowInfo[menuIndex][key];
    var wrapTranslateY = +($wrap.attr("translatey") || 0);
    var sectionTranslateY = -sectionTransYMap[menuIndex];
    playLive(menuIndex, key, {
        left: nowChannelInfo.offsetLeft,
        top: nowChannelInfo.offsetTop - sectionTranslateY + (wrapTop - wrapTranslateY),
        width: nowChannelInfo.elWidth,
        height: nowChannelInfo.elHeight
    });
}

var livePlayer = null;

var isChanhisBack = false;

var isWillPlay = false;

var isChannelAuthBack = false;

var isBuyChannel = false;

var isGettingChanAuth = false;

var isHasNoBuy = false;

// 记默认返回小视频窗要播放的视频
var liveWindowInfoDefault;

function playLive(menuIndex, key, opt) {
    if (livingInfo && livingInfo.menuIndex === menuIndex && livingInfo.key === key) {
        return;
    }
    if (liveWindowInfo[menuIndex][key].isLock) {
        play();
    } else {
        if (isChanhisBack) {
            play();
        } else {
            $.s.chanhis.query(null, {
                success: function (ds) {
                    isChanhisBack = true;
                    if (ds && ds.data.length) {
                        liveWindowInfo[menuIndex][key].channelId = ds.data[0].channelId;
                    }
                    play();
                },
                error: function () {
                    isChanhisBack = true;
                    play();
                }
            });
        }
    }

    function play() {
        var channelId = liveWindowInfo[menuIndex][key].channelId;
        if (channelId) {
            if ($.isVipChan(channelId)) {
                if (isChannelAuthBack) {
                    if (isBuyChannel) {
                        beginPlay();
                    } else {
                        if (!isHasNoBuy) {
                            // noBuyChannel();
                            liveWindowInfo[menuIndex][key].channelId = liveWindowInfoDefault;
                            beginPlay();
                        }
                    }
                } else {
                    if (!isGettingChanAuth) {
                        isGettingChanAuth = true;
                        $.auth.authVipChannel("" + channelId, function (result) {
                            isGettingChanAuth = false;
                            isChannelAuthBack = true;
                            if (result) {
                                isBuyChannel = true;
                                beginPlay();
                            } else {
                                // noBuyChannel();
                                liveWindowInfo[menuIndex][key].channelId = liveWindowInfoDefault;
                                beginPlay();
                            }
                        });
                    }
                }
            } else {
                beginPlay();
            }
        }
    }

    function beginPlay() {
        if (!isWillPlay) {
            return;
        }
        canvasBg(menuIndex, [opt.left, opt.top, opt.width, opt.height]);
        var channelId = liveWindowInfo[menuIndex][key].channelId;
        livePlayer = $.playSizeLive(channelId, opt.left, opt.top, opt.width + 2, opt.height);
        $.initVolume(livePlayer);
        livingInfo = {
            menuIndex: menuIndex,
            key: key,
            channelId: channelId
        };
        modules.modulelive.addLiveIcon();
        livePlayer.show();
    }

    function noBuyChannel() {
        isHasNoBuy = true;
        var dataPos = key.replace("#", "").split("m").slice(1);
        $(key + " .noChannel").attr({
            src: homeAllData[dataPos[0]].subContent[dataPos[1]].moduleContent[dataPos[2]].pics["0"]
        });
    }
}

function stopLive(menuIndex) {
    var nowTranslateY = -sectionTransYMap[menuIndex];
    if (livingInfo && (livingInfo.menuIndex !== menuIndex || preTranslateY !== nowTranslateY && nowTranslateY > 0)) {
        livePlayer && livePlayer.hide();
        canvasBg(livingInfo.menuIndex);
        $(livingInfo.key).addClass("nolive");
        livingInfo = null;
        // if (!isWillPlay) {
        //     livingInfo = null;
        // }
    }
}

function stopVodPlay(menuIndex) {
    var nowTranslateY = -sectionTransYMap[menuIndex];
    if (preTranslateY !== nowTranslateY && nowTranslateY > 0) {
        vodPlayer && vodPlayer.stop();
        canvasBg(menuIndex);
    }
}

var windowPosition = {
    getPositionTop: function (el) {
        var elTop = 0;
        var elem = el;
        var lastElemKey = "wrap";
        while (elem) {
            if (elem.id == lastElemKey) {
                break;
            }
            elTop += elem.offsetTop;
            elem = elem.offsetParent;
        }
        return +elTop;
    },
    getPositionLeft: function (el, menuIndex) {
        var elLeft = 0;
        var elem = el;
        var lastElemKey = "section" + menuIndex;
        while (elem) {
            if (elem.id == lastElemKey) {
                break;
            }
            elLeft += elem.offsetLeft;
            elem = elem.offsetParent;
        }
        return +elLeft;
    }
};

function initLiveInfo() {
    $.UTIL.each(liveWindowInfo, function (value1, index) {
        $.UTIL.each(value1, function (value2, key) {
            value2.offsetTop = windowPosition.getPositionTop($(key)[0]);
            value2.offsetBottom = value2.offsetTop + $(key).offsetHeight();
            value2.offsetLeft = windowPosition.getPositionLeft($(key)[0], index);
            value2.elWidth = $(key).offsetWidth();
            value2.elHeight = $(key).offsetHeight();
        });
    });
}

function initVodInfo() {
    $.UTIL.each(vodWindowInfo, function (value1, index) {
        $.UTIL.each(value1, function (value2, key) {
            var $el = $("#" + key + " .vodWindow");
            value2.offsetTop = windowPosition.getPositionTop($el[0]);
            value2.offsetBottom = value2.offsetTop + $el.offsetHeight();
            value2.offsetLeft = windowPosition.getPositionLeft($el[0], index);
            value2.elWidth = $el.offsetWidth();
            value2.elHeight = $el.offsetHeight();
        });
    });
}

function findActiveIndex(dir, leftDistance, firstLineKey, lastLineKey, leftDistanceArr) {
    var nowDistanceArr = [];
    var nearestDistance = 0;
    var nearestDistanceIndex = 0;
    if (dir == "up") {
        for (var i = 0; i < lastLineKey.length; i++) {
            nowDistanceArr.push(Math.abs(leftDistanceArr[lastLineKey[i]] - leftDistance));
        }
        nearestDistance = Math.min.apply(Math, nowDistanceArr);
        for (var i = 0; i < lastLineKey.length; i++) {
            if (Math.abs(leftDistanceArr[lastLineKey[i]] - leftDistance) == nearestDistance) {
                nearestDistanceIndex = lastLineKey[i];
                break;
            }
        }
    } else if (dir == "down") {
        for (var i = 0; i < firstLineKey.length; i++) {
            nowDistanceArr.push(Math.abs(leftDistanceArr[firstLineKey[i]] - leftDistance));
        }
        nearestDistance = Math.min.apply(Math, nowDistanceArr);
        for (var i = 0; i < firstLineKey.length; i++) {
            if (Math.abs(leftDistanceArr[firstLineKey[i]] - leftDistance) == nearestDistance) {
                nearestDistanceIndex = firstLineKey[i];
                break;
            }
        }
    }
    return nearestDistanceIndex;
}

function findNowId(menuIndex, moduleIndex, activeNum) {
    return "m" + menuIndex + "m" + moduleIndex + "m" + activeNum;
}

function createNorEl(menuIndex, moduleIndex, maxLen, elType, className, picType, innerPicType) {
    var html = "";
    var data = homeAllData[menuIndex].subContent[moduleIndex].moduleContent;
    var vipCorner = "";
    data && (data = data.slice(0, maxLen));
    if (homeAllData[menuIndex].subContent[moduleIndex].moduleType == '1' || homeAllData[menuIndex].subContent[moduleIndex].moduleType == '2' || homeAllData[menuIndex].subContent[moduleIndex].moduleType == '3') {
        maxLen = data.length === 0 ? 1 : data.length
    }
    className = className ? " " + className : "";
    picType = picType && picType.length ? picType : [];
    innerPicType = innerPicType && innerPicType.length ? innerPicType : [];
    for (var i = 0; i < maxLen; i++) {
        vipCorner = "";
        var iType = elType && elType[i] || "";
        var bgName = "";
        var innerImgHtml = "";
        if (innerPicType[i] && data[i].pics[innerPicType[i]]) {
            innerImgHtml = '<img class="innerImg" innertype="' + innerPicType[i] + '">';
        }
        html += '<div pictype="' + picType[i] + '" class="' + iType + " blocks block" + i + className + '" id="m' + menuIndex + "m" + moduleIndex + "m" + i + '">' + '<div class="images"><img></div>' + innerImgHtml + '<div class="episode "></div>' + '<div class="contentTitle hide"></div>' + vipCorner + flashlightHtml + "</div>";
    }
    return html;
}

function createNorEl26(menuIndex, moduleIndex, maxLen, elType, className, picType, innerPicType) {
    var html = "";
    var data = homeAllData[menuIndex].subContent[moduleIndex].moduleContent;
    var vipCorner = "";
    data && (data = data.slice(0, maxLen));
    className = className ? " " + className : "";
    picType = picType && picType.length ? picType : [];
    innerPicType = innerPicType && innerPicType.length ? innerPicType : [];
    for (var i = 0; i < data.length; i++) {
        vipCorner = "";
        var iType = elType && elType[i] || "";
        var bgName = "";
        var innerImgHtml = "";
        if (innerPicType[i] && data[i].pics[innerPicType[i]]) {
            innerImgHtml = '<img class="innerImg" innertype="' + innerPicType[i] + '">';
        }
        html += '<div pictype="' + picType[i] + '"  style="left:' + (294 * i) + 'px;" class="' + iType + " blocks block" + i + className + '" id="m' + menuIndex + "m" + moduleIndex + "m" + i + '">' + '<div class="images"><img></div>' + innerImgHtml + '<div class="episode"></div>' + vipCorner + flashlightHtml + "</div>";
    }
    return html;
}

function createExtendEl(menuIndex, moduleIndex, className, picType) {
    var html = "";
    var data = homeAllData[menuIndex].subContent[moduleIndex].moduleContent;
    var vipCorner = "";
    for (var i = 0; i < data.length; i++) {
        vipCorner = "";
        html += '<div pictype="' + picType + '" class="' + className + " blocks block" + i + '" id="m' + menuIndex + "m" + moduleIndex + "m" + i + '">' + '<div class="images"><img></div>' + vipCorner + flashlightHtml + "</div>";
    }
    return html;
}

function createSmallEl(menuIndex, moduleIndex, maxLen, type, elType, picType) {
    var html = "";
    var data = homeAllData[menuIndex].subContent[moduleIndex].moduleContent;
    var contentTxt = "";
    if (type == 1) {
        contentTxt = '<div class="contentTitle hide"></div>';
    } else if (type == 2) {
        contentTxt = '<div class="images"><img></div>';
    }
    data && (data = data.slice(0, maxLen));
    picType = picType && picType.length ? picType : [];
    for (var i = 0; i < maxLen; i++) {
        var noContent = '';
        if (!data[i]) {
            noContent = 'noContent'
        } else {
            noContent = ''
        }
        var iType = elType && elType[i] || "";
        var picTypeTxt = "";
        if (type == 2) {
            picTypeTxt = ' pictype="' + picType[i] + '"';
        }
        html += "<div" + picTypeTxt + ' class="' + iType + " blocks block" + i + " " + noContent + '" id="m' + menuIndex + "m" + moduleIndex + "m" + i + '">' + contentTxt + flashlightHtml + "</div>";
    }
    return html;
}

function focusTo(isMove, menuIndex, moduleIndex, activeNum, marqueeEl, isNoCheckScreenPic, isNoCheckScreenVideo) {
    var elId = findNowId(menuIndex, moduleIndex, activeNum);
    if (isMove) {
        setSectionTranslateY($.getElem(elId), menuIndex, isNoCheckScreenPic, isNoCheckScreenVideo);
    }
    var $contentTitleId = "#" + elId + " ." + (marqueeEl || "contentTitle");
    var marqueeObj = {
        el: "#" + elId,
        marquee: [$contentTitleId]
    };
    $.focusTo(marqueeObj);
}

function saveData(activeNum) {
    var p_moduleInfo = $.pTool.get("p_module").getInfo();
    var headerInfo = $.pTool.get("header").getInfo();
    var saveObj = {
        type: p_moduleInfo.type,
        translatePosition: modules.menu.info.translatePosition,
        translateY: sectionTransYMap[p_moduleInfo.subIndex]
    };
    if (headerInfo.isActive) {
        saveObj.isHeader = headerInfo.isActive;
        saveObj.headerActiveKey = headerInfo.activeKey;
        saveObj.menuIndex = p_moduleInfo.subIndex;
    } else {
        saveObj.menuIndex = p_moduleInfo.subIndex;
        saveObj.moduleIndex = p_moduleInfo.moduleIndex;
        saveObj.activeNum = p_moduleInfo.activeNum;
        saveObj.moduleBegin = p_moduleInfo.moduleBegin;
        if (p_moduleInfo.type === "module25" && p_moduleInfo.activeNum > 5) {
            var infoKey = "m" + p_moduleInfo.subIndex + "m" + p_moduleInfo.moduleIndex;
            saveObj.module25Info = {};
            saveObj.module25Info[infoKey] = {};
            saveObj.module25Info[infoKey].listIndex = modules.module25.info.moduleInfo[infoKey].listIndex;
        } else if (p_moduleInfo.type === "module27") {
            var moduleId = "m" + p_moduleInfo.subIndex + "m" + p_moduleInfo.moduleIndex;
            saveObj.module27Index = modules.module27.info.moduleInfo[moduleId].index;
        } else if (p_moduleInfo.type === "module32") {
            saveObj.module32Index = modules.module32.info.playIndex;
        } else if (p_moduleInfo.type === "modulelive") {
            var moduleInfo = modules.modulelive.info;
            saveObj.moduleliveInfo = {
                lista_begin: moduleInfo.lista_begin,
                lista_index: moduleInfo.lista_index,
                listb_begin: moduleInfo.listb_begin,
                listb_index: moduleInfo.listb_index,
                listStatus: moduleInfo.listStatus
            }
        }
    }
    $.savePageInfo(pageName, saveObj);
}

var commonModules = {
    firstLineModule: {
        active: function (info) {
            this.info.direction = info.direction;
            this.info.leftDistance = info.leftDistance;
            this.info.menuIndex = info.menuIndex;
            this.info.moduleIndex = info.moduleIndex;
            this.info.data = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].moduleContent;
            this.info.data && (this.info.data = this.info.data.slice(0, this.info.maxLen));
            if (this.info.data.length == 1) {
                this.info.leftDistanceArr = [0];
            } else if (this.info.data.length == 2) {
                this.info.leftDistanceArr = [427, 1312];
            } else if (this.info.data.length == 3) {
                this.info.leftDistanceArr = [280, 870, 1460];
            }
            var firstLineKeyArr = [];
            var lastLineKeyArr = [];
            for (var i = 0; i < this.info.data.length; i++) {
                firstLineKeyArr.push(i);
                lastLineKeyArr.push(i);
            }
            this.info.firstLineKey = firstLineKeyArr;
            this.info.lastLineKey = lastLineKeyArr;
            this.info.activeNum = info.activeNum ? info.activeNum : findActiveIndex(this.info.direction, this.info.leftDistance, this.info.firstLineKey, this.info.lastLineKey, this.info.leftDistanceArr);
            this.focus(1);
        },
        deActive: function () {
            this.blur();
        },
        up: function () {
            return {
                direction: "up",
                leftDistance: this.info.leftDistanceArr[this.info.activeNum]
            };
        },
        down: function () {
            return {
                direction: "down",
                leftDistance: this.info.leftDistanceArr[this.info.activeNum]
            };
        },
        left: function () {
            if (this.info.activeNum == 0) {
                return {
                    direction: "down",
                    leftDistance: 1e4,
                    id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                };
            } else {
                this.info.activeNum--;
                this.focus();
                return false;
            }
        },
        right: function () {
            if (this.info.activeNum == this.info.data.length - 1) {
                return {
                    direction: "down",
                    leftDistance: 0,
                    id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                };
            } else {
                this.info.activeNum++;
                this.focus();
                return false;
            }
        },
        ok: function () {
            var nowData = this.info.data[this.info.activeNum];
            nowData.categoryId = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].categoryId;
            $.gotoDetail(nowData);
        },
        createEl: function (menuIndex, moduleIndex) {
            var maxLen = this.info.maxLen;
            var data = homeAllData[menuIndex].subContent[moduleIndex].moduleContent;
            data && (data = data.slice(0, maxLen));
            var picType = [];
            var innerImgArr = [];
            var iInnerImgType = "";
            if (this.info.picType && this.info.picType.length) {
                picType = this.info.picType;
                iInnerImgType = "81";
            } else {
                if (data.length === 1) {
                    picType = ["78"];
                    iInnerImgType = "107";
                } else if (data.length === 2) {
                    picType = ["62", "62"];
                    iInnerImgType = "108";
                } else if (data.length === 3) {
                    picType = ["63", "63", "63"];
                    iInnerImgType = "109";
                }
            }
            $.UTIL.each(data, function (value, index) {
                innerImgArr.push(iInnerImgType);
            });
            return createNorEl(menuIndex, moduleIndex, maxLen, this.info.elType, "h" + data.length, picType, innerImgArr);
        },
        focus: function (isMove) {
            focusTo(isMove, this.info.menuIndex, this.info.moduleIndex, this.info.activeNum);
        },
        blur: function () {}
    },
    fixListModule: {
        active: function (info) {
            this.info.direction = info.direction;
            this.info.leftDistance = info.leftDistance;
            this.info.menuIndex = info.menuIndex;
            this.info.moduleIndex = info.moduleIndex;
            this.info.data = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].moduleContent;
            this.info.data && (this.info.data = this.info.data.slice(0, this.info.maxLen));
            this.info.activeNum = info.activeNum ? info.activeNum : findActiveIndex(this.info.direction, this.info.leftDistance, this.info.firstLineKey, this.info.lastLineKey, this.info.leftDistanceArr);
            this.focus(1);
        },
        deActive: function () {
            this.blur();
        },
        up: function () {
            if (Math.floor(this.info.activeNum / this.info.col) == 0) {
                return {
                    direction: "up",
                    leftDistance: this.info.leftDistanceArr[this.info.activeNum]
                };
            } else {
                this.info.activeNum -= this.info.col;
                this.focus(1);
                return false;
            }
        },
        down: function () {
            if (Math.floor(this.info.activeNum / this.info.col) == this.info.row - 1) {
                return {
                    direction: "down",
                    leftDistance: this.info.leftDistanceArr[this.info.activeNum]
                };
            } else {
                this.info.activeNum += this.info.col;
                this.focus(1);
                return false;
            }
        },
        left: function () {
            if (this.info.activeNum % this.info.col == 0) {
                return {
                    direction: "down",
                    leftDistance: 1e4,
                    id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                };
            } else {
                this.info.activeNum--;
                this.focus();
                return false;
            }
        },
        right: function () {
            if (this.info.activeNum % this.info.col == this.info.col - 1) {
                return {
                    direction: "down",
                    leftDistance: 0,
                    id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                };
            } else {
                this.info.activeNum++;
                this.focus();
                return false;
            }
        },
        ok: function () {
            var nowData = this.info.data[this.info.activeNum];
            nowData.categoryId = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].categoryId;
            $.gotoDetail(nowData);
        },
        createEl: function (menuIndex, moduleIndex) {
            return createNorEl(menuIndex, moduleIndex, this.info.maxLen, this.info.elType, "", this.info.picType);
        },
        focus: function (isMove) {
            focusTo(isMove, this.info.menuIndex, this.info.moduleIndex, this.info.activeNum);
        },
        blur: function () {}
    },
    module3_6: {
        active: function (info) {
            this.info.direction = info.direction;
            this.info.leftDistance = info.leftDistance;
            this.info.menuIndex = info.menuIndex;
            this.info.moduleIndex = info.moduleIndex;
            this.info.data = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].moduleContent;
            this.info.data && (this.info.data = this.info.data.slice(0, this.info.maxLen));
            this.info.activeNum = info.activeNum ? info.activeNum : findActiveIndex(this.info.direction, this.info.leftDistance, this.info.firstLineKey, this.info.lastLineKey, this.info.leftDistanceArr);
            this.focus(1);
        },
        deActive: function () {
            this.blur();
        },
        up: function () {
            if (this.info.activeNum == 0 || this.info.activeNum == 1 || this.info.activeNum == 2) {
                return {
                    direction: "up",
                    leftDistance: this.info.leftDistanceArr[this.info.activeNum]
                };
            } else {
                if (this.info.activeNum == 3) {
                    this.info.activeNum -= 3;
                } else if (this.info.activeNum == 4 || this.info.activeNum == 5) {
                    this.info.activeNum -= 4;
                } else if (this.info.activeNum == 6 || this.info.activeNum == 7) {
                    this.info.activeNum -= 5;
                } else if (this.info.activeNum == 8) {
                    this.info.activeNum -= 6;
                }
                this.focus(1);
                return false;
            }
        },
        down: function () {
            if (this.info.activeNum == 3 || this.info.activeNum == 4 || this.info.activeNum == 5 || this.info.activeNum == 6 || this.info.activeNum == 7 || this.info.activeNum == 8) {
                return {
                    direction: "down",
                    leftDistance: this.info.leftDistanceArr[this.info.activeNum]
                };
            } else {
                if (this.info.activeNum == 0) {
                    this.info.activeNum += 3;
                } else if (this.info.activeNum == 1) {
                    this.info.activeNum += 4;
                } else if (this.info.activeNum == 2) {
                    this.info.activeNum += 5;
                }
                this.focus(1);
                return false;
            }
        },
        left: function () {
            if (this.info.activeNum == 0 || this.info.activeNum == 3) {
                return {
                    direction: "down",
                    leftDistance: 1e4,
                    id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                };
            } else {
                this.info.activeNum--;
                this.focus();
                return false;
            }
        },
        right: function () {
            if (this.info.activeNum == 2 || this.info.activeNum == 8) {
                return {
                    direction: "down",
                    leftDistance: 0,
                    id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                };
            } else {
                this.info.activeNum++;
                this.focus();
                return false;
            }
        },
        ok: function () {
            var nowData = this.info.data[this.info.activeNum];
            nowData.categoryId = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].categoryId;
            $.gotoDetail(nowData);
        },
        createEl: function (menuIndex, moduleIndex) {
            return createNorEl(menuIndex, moduleIndex, this.info.maxLen, this.info.elType, "", this.info.picType);
        },
        focus: function (isMove) {
            focusTo(isMove, this.info.menuIndex, this.info.moduleIndex, this.info.activeNum);
        },
        blur: function () {}
    },
    module2_6: {
        active: function (info) {
            this.info.direction = info.direction;
            this.info.leftDistance = info.leftDistance;
            this.info.menuIndex = info.menuIndex;
            this.info.moduleIndex = info.moduleIndex;
            this.info.data = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].moduleContent;
            this.info.data && (this.info.data = this.info.data.slice(0, this.info.maxLen));
            this.info.activeNum = info.activeNum ? info.activeNum : findActiveIndex(this.info.direction, this.info.leftDistance, this.info.firstLineKey, this.info.lastLineKey, this.info.leftDistanceArr);
            this.focus(1);
        },
        deActive: function () {
            this.blur();
        },
        up: function () {
            if (this.info.activeNum == 0 || this.info.activeNum == 1) {
                return {
                    direction: "up",
                    leftDistance: this.info.leftDistanceArr[this.info.activeNum]
                };
            } else {
                if (this.info.activeNum == 2) {
                    this.info.activeNum -= 2;
                } else if (this.info.activeNum == 3) {
                    this.info.activeNum -= 3;
                } else if (this.info.activeNum == 4 || this.info.activeNum == 5) {
                    this.info.activeNum -= 4;
                } else if (this.info.activeNum == 6) {
                    this.info.activeNum -= 5;
                } else if (this.info.activeNum == 7) {
                    this.info.activeNum -= 6;
                }
                this.focus(1);
                return false;
            }
        },
        down: function () {
            if (this.info.activeNum == 2 || this.info.activeNum == 3 || this.info.activeNum == 4 || this.info.activeNum == 5 || this.info.activeNum == 6 || this.info.activeNum == 7) {
                return {
                    direction: "down",
                    leftDistance: this.info.leftDistanceArr[this.info.activeNum]
                };
            } else {
                if (this.info.activeNum == 0) {
                    this.info.activeNum += 2;
                } else if (this.info.activeNum == 1) {
                    this.info.activeNum += 4;
                }
                this.focus(1);
                return false;
            }
        },
        left: function () {
            if (this.info.activeNum == 0 || this.info.activeNum == 2) {
                return {
                    direction: "down",
                    leftDistance: 1e4,
                    id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                };
            } else {
                this.info.activeNum--;
                this.focus();
                return false;
            }
        },
        right: function () {
            if (this.info.activeNum == 1 || this.info.activeNum == 7) {
                return {
                    direction: "down",
                    leftDistance: 0,
                    id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                };
            } else {
                this.info.activeNum++;
                this.focus();
                return false;
            }
        },
        ok: function () {
            var nowData = this.info.data[this.info.activeNum];
            nowData.categoryId = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].categoryId;
            $.gotoDetail(nowData);
        },
        createEl: function (menuIndex, moduleIndex) {
            return createNorEl(menuIndex, moduleIndex, this.info.maxLen, this.info.elType, "", this.info.picType);
        },
        focus: function (isMove) {
            focusTo(isMove, this.info.menuIndex, this.info.moduleIndex, this.info.activeNum);
        },
        blur: function () {}
    },
    module2_4: {
        active: function (info) {
            this.info.direction = info.direction;
            this.info.leftDistance = info.leftDistance;
            this.info.menuIndex = info.menuIndex;
            this.info.moduleIndex = info.moduleIndex;
            this.info.data = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].moduleContent;
            this.info.data && (this.info.data = this.info.data.slice(0, this.info.maxLen));
            this.info.activeNum = info.activeNum ? info.activeNum : findActiveIndex(this.info.direction, this.info.leftDistance, this.info.firstLineKey, this.info.lastLineKey, this.info.leftDistanceArr);
            this.focus(1);
        },
        deActive: function () {
            this.blur();
        },
        up: function () {
            if (this.info.activeNum == 0 || this.info.activeNum == 1) {
                return {
                    direction: "up",
                    leftDistance: this.info.leftDistanceArr[this.info.activeNum]
                };
            } else {
                if (this.info.activeNum == 2) {
                    this.info.activeNum -= 2;
                } else if (this.info.activeNum == 3 || this.info.activeNum == 4) {
                    this.info.activeNum -= 3;
                } else if (this.info.activeNum == 5) {
                    this.info.activeNum -= 4;
                }
                this.focus(1);
                return false;
            }
        },
        down: function () {
            if (this.info.activeNum == 2 || this.info.activeNum == 3 || this.info.activeNum == 4 || this.info.activeNum == 5) {
                return {
                    direction: "down",
                    leftDistance: this.info.leftDistanceArr[this.info.activeNum]
                };
            } else {
                if (this.info.activeNum == 0) {
                    this.info.activeNum += 2;
                } else if (this.info.activeNum == 1) {
                    this.info.activeNum += 3;
                }
                this.focus(1);
                return false;
            }
        },
        left: function () {
            if (this.info.activeNum == 0 || this.info.activeNum == 2) {
                return {
                    direction: "down",
                    leftDistance: 1e4,
                    id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                };
            } else {
                this.info.activeNum--;
                this.focus();
                return false;
            }
        },
        right: function () {
            if (this.info.activeNum == 1 || this.info.activeNum == 5) {
                return {
                    direction: "down",
                    leftDistance: 0,
                    id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                };
            } else {
                this.info.activeNum++;
                this.focus();
                return false;
            }
        },
        ok: function () {
            var nowData = this.info.data[this.info.activeNum];
            nowData.categoryId = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].categoryId;
            $.gotoDetail(nowData);
        },
        createEl: function (menuIndex, moduleIndex) {
            return createNorEl(menuIndex, moduleIndex, this.info.maxLen, this.info.elType, "", this.info.picType);
        },
        focus: function (isMove) {
            focusTo(isMove, this.info.menuIndex, this.info.moduleIndex, this.info.activeNum);
        },
        blur: function () {}
    },
    module2_3: {
        active: function (info) {
            this.info.direction = info.direction;
            this.info.leftDistance = info.leftDistance;
            this.info.menuIndex = info.menuIndex;
            this.info.moduleIndex = info.moduleIndex;
            this.info.data = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].moduleContent;
            this.info.data && (this.info.data = this.info.data.slice(0, this.info.maxLen));
            this.info.activeNum = info.activeNum ? info.activeNum : findActiveIndex(this.info.direction, this.info.leftDistance, this.info.firstLineKey, this.info.lastLineKey, this.info.leftDistanceArr);
            this.focus(1);
        },
        deActive: function () {
            this.blur();
        },
        up: function () {
            if (this.info.activeNum == 0 || this.info.activeNum == 1) {
                return {
                    direction: "up",
                    leftDistance: this.info.leftDistanceArr[this.info.activeNum]
                };
            } else {
                if (this.info.activeNum == 2) {
                    this.info.activeNum -= 2;
                } else if (this.info.activeNum == 3 || this.info.activeNum == 4) {
                    this.info.activeNum -= 3;
                }
                this.focus(1);
                return false;
            }
        },
        down: function () {
            if (this.info.activeNum == 2 || this.info.activeNum == 3 || this.info.activeNum == 4) {
                return {
                    direction: "down",
                    leftDistance: this.info.leftDistanceArr[this.info.activeNum]
                };
            } else {
                if (this.info.activeNum == 0) {
                    this.info.activeNum += 2;
                } else if (this.info.activeNum == 1) {
                    this.info.activeNum += 3;
                }
                this.focus(1);
                return false;
            }
        },
        left: function () {
            if (this.info.activeNum == 0 || this.info.activeNum == 2) {
                return {
                    direction: "down",
                    leftDistance: 1e4,
                    id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                };
            } else {
                this.info.activeNum--;
                this.focus();
                return false;
            }
        },
        right: function () {
            if (this.info.activeNum == 1 || this.info.activeNum == 4) {
                return {
                    direction: "down",
                    leftDistance: 0,
                    id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                };
            } else {
                this.info.activeNum++;
                this.focus();
                return false;
            }
        },
        ok: function () {
            var nowData = this.info.data[this.info.activeNum];
            nowData.categoryId = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].categoryId;
            $.gotoDetail(nowData);
        },
        createEl: function (menuIndex, moduleIndex) {
            return createNorEl(menuIndex, moduleIndex, this.info.maxLen, this.info.elType, "", this.info.picType);
        },
        focus: function (isMove) {
            focusTo(isMove, this.info.menuIndex, this.info.moduleIndex, this.info.activeNum);
        },
        blur: function () {}
    },
    module1_scroll: {
        active: function (info) {
            this.info.direction = info.direction;
            this.info.leftDistance = info.leftDistance;
            this.info.menuIndex = info.menuIndex;
            this.info.moduleIndex = info.moduleIndex;
            // this.info.data = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].moduleContent;
            // this.info.data && (this.info.data = this.info.data.slice(0, this.info.maxLen));
            this.scrollWarpId = '#m' + this.info.menuIndex + 'm' + this.info.moduleIndex + ' .blockWrap';
            if (info.moduleBegin) {
                var moduleBegin_ = info.moduleBegin;
                $(this.scrollWarpId).css({
                    "-webkit-transform": "translateX(" + (-294 * info.moduleBegin) + "px)",
                    "transition": "none"
                });
                this.info.star = moduleBegin_;
                this.info.end = moduleBegin_ + 5;
            }
            if (info.activeNum) {
                this.info.activeNum = info.activeNum;
            } else {
                if (info.id) {
                    this.info.activeNum = 5 + this.info.star;
                } else {
                    var index = findActiveIndex(this.info.direction, this.info.leftDistance, this.info.firstLineKey, this.info.lastLineKey, this.info.leftDistanceArr);
                    this.info.activeNum = this.info.star != 0 ? index + this.info.star : index;
                }
            }
            this.focus(1);
        },
        deActive: function () {
            this.blur();
        },
        up: function () {
            if (Math.floor(this.info.activeNum / this.info.col) == 0) {
                return {
                    direction: "up",
                    leftDistance: this.info.leftDistanceArr[this.info.activeNum - this.info.star]
                };
            } else {
                this.info.activeNum -= this.info.col;
                this.focus(1);
                return false;
            }
        },
        down: function () {
            if (Math.floor(this.info.activeNum / this.info.col) == this.info.row - 1) {
                return {
                    direction: "down",
                    leftDistance: this.info.leftDistanceArr[this.info.activeNum - this.info.star]
                };
            } else {
                this.info.activeNum += this.info.col;
                this.focus(1);
                return false;
            }
        },
        left: function () {
            if (this.info.activeNum % this.info.col == 0) {
                return {
                    direction: "down",
                    leftDistance: 1e4,
                    id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                };
            } else {
                this.info.activeNum--;
                if (this.info.activeNum < this.info.star) {
                    this.info.star--;
                    this.info.end = this.info.star + 5;
                    $(this.scrollWarpId).css({
                        "-webkit-transform": "translateX(" + -(294 * this.info.star) + "px)",
                        "transition": ".3s"
                    });
                }
                this.focus();
                return false;
            }
        },
        right: function () {
            if (this.info.activeNum % this.info.col == this.info.col - 1) {
                return {
                    direction: "down",
                    leftDistance: 0,
                    id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                };
            } else {
                this.info.activeNum++;
                if (this.info.activeNum > this.info.end) {
                    this.info.end = this.info.activeNum;
                    this.info.star++;
                    $(this.scrollWarpId).css({
                        "-webkit-transform": "translateX(" + -(294 * this.info.star) + "px)",
                        "transition": ".3s"
                    });
                }
                this.focus();
                return false;
            }
        },
        ok: function () {
            this.info.moduleBegin = this.info.star;
            var nowData = this.info.data[this.info.activeNum];
            nowData.categoryId = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].categoryId;
            $.gotoDetail(nowData);
        },
        createEl: function (menuIndex, moduleIndex) {
            this.info.data = homeAllData[menuIndex].subContent[moduleIndex].moduleContent;
            this.info.data && (this.info.data = this.info.data.slice(0, this.info.maxLen));
            var data = this.info.data;
            var firstLineKeyArr = [];
            var lastLineKeyArr = [];
            var picTypeArr = [];
            var leftDistanceArr_ = [];
            for (var i = 0; i < data.length; i++) {
                picTypeArr.push('67');
                firstLineKeyArr.push(i);
                lastLineKeyArr.push(i);
                leftDistanceArr_.push(133 + (294 * i));
            }
            this.info.firstLineKey = firstLineKeyArr;
            this.info.lastLineKey = lastLineKeyArr;
            this.info.picType = picTypeArr;
            this.info.leftDistanceArr = leftDistanceArr_;
            this.info.col = data.length;
            this.info.star = 0;
            this.info.end = 5;
            return createNorEl26(menuIndex, moduleIndex, this.info.maxLen, this.info.elType, "", this.info.picType);
        },
        focus: function (isMove) {
            focusTo(isMove, this.info.menuIndex, this.info.moduleIndex, this.info.activeNum);
        },
        blur: function () {}
    },
    extendOneLineModule: {
        active: function (info) {
            this.info.direction = info.direction;
            this.info.leftDistance = info.leftDistance;
            this.info.menuIndex = info.menuIndex;
            this.info.moduleIndex = info.moduleIndex;
            this.info.data = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].moduleContent;
            if (info.moduleBegin) {
                this.info.moduleBegin = info.moduleBegin;
                $("#m" + this.info.menuIndex + "m" + this.info.moduleIndex + " .blockWrap").attr("begin", this.info.moduleBegin).css({
                    "-webkit-transform": "translateX(" + -295 * this.info.moduleBegin + "px)"
                });
            } else {
                this.info.moduleBegin = +$("#m" + this.info.menuIndex + "m" + this.info.moduleIndex + " .blockWrap").attr("begin") || 0;
            }
            this.info.activeNum = info.activeNum ? info.activeNum : findActiveIndex(this.info.direction, this.info.leftDistance, this.info.firstLineKey, this.info.lastLineKey, this.info.leftDistanceArr) + this.info.moduleBegin;
            this.focus(1);
        },
        deActive: function () {
            this.blur();
        },
        up: function () {
            return {
                direction: "up",
                leftDistance: this.info.leftDistanceArr[this.info.activeNum - this.info.moduleBegin]
            };
        },
        down: function () {
            return {
                direction: "down",
                leftDistance: this.info.leftDistanceArr[this.info.activeNum - this.info.moduleBegin]
            };
        },
        left: function () {
            if (this.info.activeNum == 0) {
                return {
                    direction: "down",
                    leftDistance: 1e4,
                    id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                };
            }
            if (this.info.activeNum == this.info.moduleBegin) {
                this.info.activeNum--;
                this.info.moduleBegin--;
                $("#m" + this.info.menuIndex + "m" + this.info.moduleIndex + " .blockWrap").attr("begin", this.info.moduleBegin).css({
                    "-webkit-transform": "translateX(" + -295 * this.info.moduleBegin + "px)"
                });
            } else {
                this.info.activeNum--;
            }
            this.focus();
            return false;
        },
        right: function () {
            if (this.info.activeNum == this.info.data.length - 1) {
                return {
                    direction: "down",
                    leftDistance: 0,
                    id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                };
            }
            if (this.info.activeNum == this.info.moduleBegin + this.info.showLen - 1) {
                this.info.activeNum++;
                this.info.moduleBegin++;
                $("#m" + this.info.menuIndex + "m" + this.info.moduleIndex + " .blockWrap").attr("begin", this.info.moduleBegin).css({
                    "-webkit-transform": "translateX(" + -295 * this.info.moduleBegin + "px)"
                });
            } else {
                this.info.activeNum++;
            }
            this.focus();
            return false;
        },
        ok: function () {
            var nowData = this.info.data[this.info.activeNum];
            nowData.categoryId = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].categoryId;
            $.gotoDetail(nowData);
        },
        createEl: function (menuIndex, moduleIndex) {
            return createExtendEl(menuIndex, moduleIndex, "", this.info.picType);
        },
        focus: function (isMove) {
            focusTo(isMove, this.info.menuIndex, this.info.moduleIndex, this.info.activeNum);
        },
        blur: function () {}
    },
    extendListModule: {
        active: function (info) {
            this.info.direction = info.direction;
            this.info.leftDistance = info.leftDistance;
            this.info.menuIndex = info.menuIndex;
            this.info.moduleIndex = info.moduleIndex;
            this.info.data = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].moduleContent;
            this.info.totalLine = Math.ceil(this.info.data.length / this.info.col);
            var firstLineKeyArr = [];
            var lastLineKeyArr = [];
            for (var i = 0; i < Math.min(this.info.data.length, this.info.col); i++) {
                firstLineKeyArr.push(i);
            }
            for (var i = (this.info.totalLine - 1) * this.info.col; i < this.info.data.length; i++) {
                lastLineKeyArr.push(i);
            }
            var leftDistanceArr = [];
            for (var i = 0; i < this.info.data.length; i++) {
                leftDistanceArr.push(this.info.leftDistanceCol[i % this.info.col]);
            }
            this.info.firstLineKey = firstLineKeyArr;
            this.info.lastLineKey = lastLineKeyArr;
            this.info.leftDistanceArr = leftDistanceArr;
            this.info.activeNum = info.activeNum ? info.activeNum : findActiveIndex(this.info.direction, this.info.leftDistance, this.info.firstLineKey, this.info.lastLineKey, this.info.leftDistanceArr);
            this.focus(1);
        },
        deActive: function () {
            this.blur();
        },
        up: function () {
            if (Math.floor(this.info.activeNum / this.info.col) == 0) {
                return {
                    direction: "up",
                    leftDistance: this.info.leftDistanceArr[this.info.activeNum]
                };
            } else {
                this.info.activeNum -= this.info.col;
                this.focus(1);
                return false;
            }
        },
        down: function () {
            if (Math.floor(this.info.activeNum / this.info.col) == this.info.totalLine - 1) {
                return {
                    direction: "down",
                    leftDistance: this.info.leftDistanceArr[this.info.activeNum]
                };
            } else {
                this.info.activeNum += this.info.col;
                if (this.info.activeNum > this.info.data.length - 1) {
                    this.info.activeNum = this.info.data.length - 1;
                }
                this.focus(1);
                return false;
            }
        },
        left: function () {
            if (this.info.activeNum % this.info.col == 0) {
                return {
                    direction: "down",
                    leftDistance: 1e4,
                    id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                };
            } else {
                this.info.activeNum--;
                this.focus();
                return false;
            }
        },
        right: function () {
            if (this.info.activeNum % this.info.col == this.info.col - 1 || this.info.activeNum == this.info.data.length - 1) {
                return {
                    direction: "down",
                    leftDistance: 0,
                    id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                };
            } else {
                this.info.activeNum++;
                this.focus();
                return false;
            }
        },
        ok: function () {
            var nowData = this.info.data[this.info.activeNum];
            nowData.categoryId = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].categoryId;
            $.gotoDetail(nowData);
        },
        createEl: function (menuIndex, moduleIndex) {
            return createExtendEl(menuIndex, moduleIndex, "", this.info.picType);
        },
        focus: function (isMove) {
            focusTo(isMove, this.info.menuIndex, this.info.moduleIndex, this.info.activeNum);
        },
        blur: function () {}
    },
    bigScreenModule: {
        active: function (info) {
            this.info.direction = info.direction;
            this.info.leftDistance = info.leftDistance;
            this.info.menuIndex = info.menuIndex;
            this.info.moduleIndex = info.moduleIndex;
            this.info.data = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].moduleContent;
            this.info.data && (this.info.data = this.info.data.slice(0, this.info.maxLen));
            this.info.activeNum = info.activeNum ? info.activeNum : findActiveIndex(this.info.direction, this.info.leftDistance, this.info.firstLineKey, this.info.lastLineKey, this.info.leftDistanceArr);
            this.focus(1, true);
        },
        deActive: function () {
            this.blur();
        },
        up: function () {
            if (Math.floor(this.info.activeNum / this.info.col) == 0) {
                return {
                    direction: "up",
                    leftDistance: this.info.leftDistanceArr[this.info.activeNum]
                };
            }
        },
        down: function () {
            if (Math.floor(this.info.activeNum / this.info.col) == this.info.row - 1) {
                return {
                    direction: "down",
                    leftDistance: this.info.leftDistanceArr[this.info.activeNum]
                };
            }
        },
        left: function () {
            if (this.info.activeNum % this.info.col == 0) {
                return {
                    direction: "down",
                    leftDistance: 1e4,
                    id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                };
            } else {
                this.info.activeNum--;
                this.focus();
                return false;
            }
        },
        right: function () {
            if (this.info.activeNum % this.info.col == this.info.col - 1) {
                return {
                    direction: "down",
                    leftDistance: 0,
                    id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                };
            } else {
                this.info.activeNum++;
                this.focus();
                return false;
            }
        },
        ok: function () {
            var nowData = this.info.data[this.info.activeNum];
            nowData.categoryId = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].categoryId;
            $.gotoDetail(nowData);
        },
        createEl: function (menuIndex, moduleIndex, isCue) {
            var html = "";
            var data = homeAllData[menuIndex].subContent[moduleIndex].moduleContent;
            data && (data = data.slice(0, this.info.maxLen));
            for (var i = 0; i < this.info.maxLen; i++) {
                var iType = this.info.elType && this.info.elType[i] || "";
                html += '<div picType="' + this.info.picType[i] + '" class="' + iType + " blocks block" + i + '" id="m' + menuIndex + "m" + moduleIndex + "m" + i + '">' + '<div class="images"><img></div>' + flashlightHtml + (isCue ? '<div class="playingCue hide"></div>' : "") + "</div>";
            }
            return html;
        },
        focus: function (isMove, isNoCheckScreenPic, isNoCheckScreenVideo) {
            focusTo(isMove, this.info.menuIndex, this.info.moduleIndex, this.info.activeNum, undefined, isNoCheckScreenPic, isNoCheckScreenVideo);
        },
        blur: function () {}
    }
};

function returnToTop(menuIndex) {
    sectionTransYMap[menuIndex] = 0;
    $("#section" + menuIndex).css({
        "-webkit-transform": "translateY(0px)"
    });
}
var modules = {
    returnTop: {
        info: {
            menuIndex: 0
        },
        active: function (info) {
            this.info.menuIndex = info.menuIndex;
            this.focus();
        },
        deActive: function (key) {
            this.blur();
        },
        up: function () {
            return {
                direction: "up",
                leftDistance: 870
            };
        },
        down: function () {},
        left: function () {},
        right: function () {},
        ok: function () {
            returnToTop(this.info.menuIndex);
            showSubPicScreen(1);
            videoScreen.subPlay();
            autoHeader(0);
        },
        init: function () {},
        createEl: function (menuIndex) {
            var $returnTopWrap = $('<div class="returnTopWraps"><div id="returnTop' + menuIndex + '"></div></div>');
            return $returnTopWrap;
        },
        focus: function () {
            var elId = "returnTop" + this.info.menuIndex;
            setSectionTranslateY($.getElem(elId), this.info.menuIndex);
            $.focusTo({
                el: "#" + elId
            });
        },
        blur: function () {}
    },
    menu: {
        info: {
            menuIndex: 0,
            fixPosition: 60,
            menuWidth: 0,
            preMenuIndex: 0,
            translatePosition: 0,
            paddingWidth: 58,
            position: []
        },
        active: function (info) {
            info && typeof info.menuIndex !== "undefined" && (this.info.menuIndex = info.menuIndex);
            this.focus(this.info.menuIndex);
            $("#menu div", "#menu", true).removeClass("disappear");
            this.checkLeft(this.info.menuIndex);
            this.checkRight(this.info.menuIndex);
        },
        deActive: function () {
            showPicScreen.hide();
            this.blur(this.info.menuIndex);
        },
        checkLeft: function (i) {
            "left" === this.checkOver(i) && (0 === i ? this.setTranslateX(0) : this.setTranslateX(this.info.position[i].left - this.info.fixPosition))
        },
        checkRight: function (i) {
            "right" === this.checkOver(i) && (i === homeAllData.length - 1 ? this.setTranslateX(this.info.menuWidth - 2 * this.info.paddingWidth - 1740) : this.setTranslateX(this.info.position[i].right - 1740 + this.info.fixPosition))
        },
        left: function () {
            return 0 != this.info.menuIndex && (this.info.menuIndex--, this.focus(), this.checkLeft(this.info.menuIndex), {
                menuIndex: this.info.menuIndex
            })
        },
        right: function () {
            return this.info.menuIndex != homeAllData.length - 1 && (this.info.menuIndex++, this.focus(), this.checkRight(this.info.menuIndex), {
                menuIndex: this.info.menuIndex
            })
        },
        up: function () {
            this.blur(this.info.menuIndex);
            $.pTool.active("header");
        },
        down: function () {
            return {
                direction: "down",
                leftDistance: 0,
                menuIndex: this.info.menuIndex
            };
        },
        ok: function () {},
        checkOver: function (i) {
            return this.info.position[i].right - this.info.translatePosition > 1740 ? "right" : this.info.position[i].left - this.info.translatePosition < 0 ? "left" : undefined
        },
        setTranslateX: function (i) {
            this.info.translatePosition = i,
                $("#menu").css({
                    "-webkit-transform": "translateX(-" + i + "px)"
                })
        },
        init: function () {},
        createEl: function () {
            var menuWidth = 0;
            var menuIndexWidth = 0;
            $("#menu").html("");
            for (var i = 0; i < homeAllData.length; i++) {
                var html = "";
                if (homeAllData[i].navIcon) {
                    html = '<div id="menu' + i + '" class="hasimg"><img class="navIcon" src="' + homeAllData[i].navIcon + '"></div>';
                    $(html).appendTo("#menu");
                    $("#menu" + i).css({
                        width: homeAllData[i].navIconWidth
                    });
                    menuWidth += menuIndexWidth = Number(homeAllData[i].navIconWidth) + 2 * this.info.paddingWidth;
                } else {
                    html = '<div id="menu' + i + '">' + homeAllData[i].contentName + "</div>";
                    $(html).appendTo("#menu");
                    menuWidth += menuIndexWidth = $("#menu" + i).offsetWidth();
                }
                this.info.position.push({
                    left: menuWidth - menuIndexWidth,
                    right: menuWidth - 2 * this.info.paddingWidth
                })
                if (homeAllData[i].navIconF) {
                    $('<img class="navIconF" src="' + homeAllData[i].navIconF + '">').appendTo("#menu" + i);
                    if (homeAllData[i].navIconC) {
                        $('<img class="navIconC" src="' + homeAllData[i].navIconC + '">').appendTo("#menu" + i);
                    } else {
                        $('<img class="navIconC" src="' + homeAllData[i].navIconF + '">').appendTo("#menu" + i);
                    }
                }
            }
            this.info.menuWidth = menuWidth;
        },
        focus: function () {
            $("#menu div", "#menu", true).removeClass("current");
            $("#menu" + this.info.menuIndex).removeClass("active");
            $.focusTo({
                el: $("#menu div", "#menu", true).item(this.info.menuIndex)
            });
        },
        blur: function (menuIndex, dir) {
            var $aMenu = $("#menu div", "#menu", true);
            if (homeAllData[menuIndex].navIcon) {
                $("#menu" + menuIndex).addClass("active");
            }
            $aMenu.removeClass("current");
            $aMenu.item(menuIndex).addClass("current");
            "left" === dir ? this.checkLeft(menuIndex) : "right" === dir && this.checkRight(menuIndex),
                $.UTIL.each(homeAllData, function (value, index) {
                    if (menuIndex === index) {
                        $aMenu.item(index).removeClass("disappear");
                    } else {
                        $aMenu.item(index).addClass("disappear");
                    }
                });
        }
    },
    module1: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            elType: ["hor", "hor", "hor"],
            picType: [],
            maxLen: 3,
            firstLineKey: [],
            lastLineKey: [],
            leftDistanceArr: [],
            data: []
        },
        active: function () {
            return commonModules.firstLineModule.active.apply(this, arguments);
        },
        deActive: function () {
            return commonModules.firstLineModule.deActive.apply(this, arguments);
        },
        up: function () {
            return commonModules.firstLineModule.up.apply(this, arguments);
        },
        down: function () {
            return commonModules.firstLineModule.down.apply(this, arguments);
        },
        left: function () {
            return commonModules.firstLineModule.left.apply(this, arguments);
        },
        right: function () {
            return commonModules.firstLineModule.right.apply(this, arguments);
        },
        ok: function () {
            return commonModules.firstLineModule.ok.apply(this, arguments);
        },
        createEl: function () {
            return commonModules.firstLineModule.createEl.apply(this, arguments);
        },
        focus: function () {
            return commonModules.firstLineModule.focus.apply(this, arguments);
        },
        blur: function () {
            return commonModules.firstLineModule.blur.apply(this, arguments);
        }
    },
    module2: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            elType: ["hor", "hor", "hor"],
            picType: [],
            maxLen: 3,
            firstLineKey: [],
            lastLineKey: [],
            leftDistanceArr: [],
            data: []
        },
        active: function () {
            return commonModules.firstLineModule.active.apply(this, arguments);
        },
        deActive: function () {
            return commonModules.firstLineModule.deActive.apply(this, arguments);
        },
        up: function () {
            return commonModules.firstLineModule.up.apply(this, arguments);
        },
        down: function () {
            return commonModules.firstLineModule.down.apply(this, arguments);
        },
        left: function () {
            return commonModules.firstLineModule.left.apply(this, arguments);
        },
        right: function () {
            return commonModules.firstLineModule.right.apply(this, arguments);
        },
        ok: function () {
            return commonModules.firstLineModule.ok.apply(this, arguments);
        },
        createEl: function () {
            return commonModules.firstLineModule.createEl.apply(this, arguments);
        },
        focus: function () {
            return commonModules.firstLineModule.focus.apply(this, arguments);
        },
        blur: function () {
            return commonModules.firstLineModule.blur.apply(this, arguments);
        }
    },
    module3: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            elType: ["hor"],
            picType: ["79"],
            col: 1,
            row: 1,
            maxLen: 3,
            firstLineKey: [0],
            lastLineKey: [0],
            leftDistanceArr: [0],
            data: []
        },
        active: function () {
            return commonModules.fixListModule.active.apply(this, arguments);
        },
        deActive: function () {
            return commonModules.fixListModule.deActive.apply(this, arguments);
        },
        up: function () {
            return commonModules.fixListModule.up.apply(this, arguments);
        },
        down: function () {
            return commonModules.fixListModule.down.apply(this, arguments);
        },
        left: function () {
            return commonModules.fixListModule.left.apply(this, arguments);
        },
        right: function () {
            return commonModules.fixListModule.right.apply(this, arguments);
        },
        ok: function () {
            return commonModules.fixListModule.ok.apply(this, arguments);
        },
        createEl: function () {
            return commonModules.fixListModule.createEl.apply(this, arguments);
        },
        focus: function () {
            return commonModules.fixListModule.focus.apply(this, arguments);
        },
        blur: function () {
            return commonModules.fixListModule.blur.apply(this, arguments);
        }
    },
    module4: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            elType: ["hor", "hor", "hor", "ver", "ver", "ver", "ver", "ver", "ver"],
            picType: ["63", "63", "63", "65", "65", "65", "65", "65", "65"],
            maxLen: 9,
            firstLineKey: [0, 1, 2],
            lastLineKey: [3, 4, 5, 6, 7, 8],
            leftDistanceArr: [280, 870, 1460, 133, 428, 723, 1018, 1313, 1608],
            data: []
        },
        active: function () {
            return commonModules.module3_6.active.apply(this, arguments);
        },
        deActive: function () {
            return commonModules.module3_6.deActive.apply(this, arguments);
        },
        up: function () {
            return commonModules.module3_6.up.apply(this, arguments);
        },
        down: function () {
            return commonModules.module3_6.down.apply(this, arguments);
        },
        left: function () {
            return commonModules.module3_6.left.apply(this, arguments);
        },
        right: function () {
            return commonModules.module3_6.right.apply(this, arguments);
        },
        ok: function () {
            return commonModules.module3_6.ok.apply(this, arguments);
        },
        createEl: function () {
            return commonModules.module3_6.createEl.apply(this, arguments);
        },
        focus: function () {
            return commonModules.module3_6.focus.apply(this, arguments);
        },
        blur: function () {
            return commonModules.module3_6.blur.apply(this, arguments);
        }
    },
    module5: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            elType: ["hor", "hor", "ver", "ver", "ver", "ver", "ver", "ver"],
            picType: ["62", "62", "65", "65", "65", "65", "65", "65"],
            maxLen: 8,
            firstLineKey: [0, 1],
            lastLineKey: [2, 3, 4, 5, 6, 7],
            leftDistanceArr: [427, 1312, 133, 428, 723, 1018, 1313, 1608],
            data: []
        },
        active: function () {
            return commonModules.module2_6.active.apply(this, arguments);
        },
        deActive: function () {
            return commonModules.module2_6.deActive.apply(this, arguments);
        },
        up: function () {
            return commonModules.module2_6.up.apply(this, arguments);
        },
        down: function () {
            return commonModules.module2_6.down.apply(this, arguments);
        },
        left: function () {
            return commonModules.module2_6.left.apply(this, arguments);
        },
        right: function () {
            return commonModules.module2_6.right.apply(this, arguments);
        },
        ok: function () {
            return commonModules.module2_6.ok.apply(this, arguments);
        },
        createEl: function () {
            return commonModules.module2_6.createEl.apply(this, arguments);
        },
        focus: function () {
            return commonModules.module2_6.focus.apply(this, arguments);
        },
        blur: function () {
            return commonModules.module2_6.blur.apply(this, arguments);
        }
    },
    module6: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            elType: ["hor", "hor", "hor", "hor", "hor", "hor"],
            picType: ["63", "63", "63", "63", "63", "63"],
            col: 3,
            row: 2,
            maxLen: 6,
            firstLineKey: [0, 1, 2],
            lastLineKey: [3, 4, 5],
            leftDistanceArr: [280, 870, 1460, 280, 870, 1460],
            data: []
        },
        active: function () {
            return commonModules.fixListModule.active.apply(this, arguments);
        },
        deActive: function () {
            return commonModules.fixListModule.deActive.apply(this, arguments);
        },
        up: function () {
            return commonModules.fixListModule.up.apply(this, arguments);
        },
        down: function () {
            return commonModules.fixListModule.down.apply(this, arguments);
        },
        left: function () {
            return commonModules.fixListModule.left.apply(this, arguments);
        },
        right: function () {
            return commonModules.fixListModule.right.apply(this, arguments);
        },
        ok: function () {
            return commonModules.fixListModule.ok.apply(this, arguments);
        },
        createEl: function () {
            return commonModules.fixListModule.createEl.apply(this, arguments);
        },
        focus: function () {
            return commonModules.fixListModule.focus.apply(this, arguments);
        },
        blur: function () {
            return commonModules.fixListModule.blur.apply(this, arguments);
        }
    },
    module7: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            elType: ["hor", "hor", "hor", "hor", "hor", "hor"],
            picType: ["62", "62", "64", "64", "64", "64"],
            maxLen: 6,
            firstLineKey: [0, 1],
            lastLineKey: [2, 3, 4, 5],
            leftDistanceArr: [427, 1312, 206, 649, 1091, 1534],
            data: []
        },
        active: function () {
            return commonModules.module2_4.active.apply(this, arguments);
        },
        deActive: function () {
            return commonModules.module2_4.deActive.apply(this, arguments);
        },
        up: function () {
            return commonModules.module2_4.up.apply(this, arguments);
        },
        down: function () {
            return commonModules.module2_4.down.apply(this, arguments);
        },
        left: function () {
            return commonModules.module2_4.left.apply(this, arguments);
        },
        right: function () {
            return commonModules.module2_4.right.apply(this, arguments);
        },
        ok: function () {
            return commonModules.module2_4.ok.apply(this, arguments);
        },
        createEl: function () {
            return commonModules.module2_4.createEl.apply(this, arguments);
        },
        focus: function () {
            return commonModules.module2_4.focus.apply(this, arguments);
        },
        blur: function () {
            return commonModules.module2_4.blur.apply(this, arguments);
        }
    },
    module8: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            elType: ["hor", "hor", "hor", "hor", "hor"],
            picType: ["62", "62", "63", "63", "63"],
            maxLen: 5,
            firstLineKey: [0, 1],
            lastLineKey: [2, 3, 4],
            leftDistanceArr: [427, 1312, 280, 870, 1460],
            data: []
        },
        active: function () {
            return commonModules.module2_3.active.apply(this, arguments);
        },
        deActive: function () {
            return commonModules.module2_3.deActive.apply(this, arguments);
        },
        up: function () {
            return commonModules.module2_3.up.apply(this, arguments);
        },
        down: function () {
            return commonModules.module2_3.down.apply(this, arguments);
        },
        left: function () {
            return commonModules.module2_3.left.apply(this, arguments);
        },
        right: function () {
            return commonModules.module2_3.right.apply(this, arguments);
        },
        ok: function () {
            return commonModules.module2_3.ok.apply(this, arguments);
        },
        createEl: function () {
            return commonModules.module2_3.createEl.apply(this, arguments);
        },
        focus: function () {
            return commonModules.module2_3.focus.apply(this, arguments);
        },
        blur: function () {
            return commonModules.module2_3.blur.apply(this, arguments);
        }
    },
    module9: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            elType: ["hor", "hor", "hor", "hor"],
            picType: ["64", "64", "64", "64"],
            col: 4,
            row: 1,
            maxLen: 4,
            firstLineKey: [0, 1, 2, 3],
            lastLineKey: [0, 1, 2, 3],
            leftDistanceArr: [206, 649, 1091, 1534],
            data: []
        },
        active: function () {
            return commonModules.fixListModule.active.apply(this, arguments);
        },
        deActive: function () {
            return commonModules.fixListModule.deActive.apply(this, arguments);
        },
        up: function () {
            return commonModules.fixListModule.up.apply(this, arguments);
        },
        down: function () {
            return commonModules.fixListModule.down.apply(this, arguments);
        },
        left: function () {
            return commonModules.fixListModule.left.apply(this, arguments);
        },
        right: function () {
            return commonModules.fixListModule.right.apply(this, arguments);
        },
        ok: function () {
            return commonModules.fixListModule.ok.apply(this, arguments);
        },
        createEl: function () {
            return commonModules.fixListModule.createEl.apply(this, arguments);
        },
        focus: function () {
            return commonModules.fixListModule.focus.apply(this, arguments);
        },
        blur: function () {
            return commonModules.fixListModule.blur.apply(this, arguments);
        }
    },
    module10: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            elType: ["ver", "ver", "ver", "ver", "ver", "ver"],
            picType: ["65", "65", "65", "65", "65", "65"],
            col: 6,
            row: 1,
            maxLen: 6,
            firstLineKey: [0, 1, 2, 3, 4, 5],
            lastLineKey: [0, 1, 2, 3, 4, 5],
            leftDistanceArr: [133, 428, 723, 1018, 1313, 1608],
            data: []
        },
        active: function () {
            return commonModules.fixListModule.active.apply(this, arguments);
        },
        deActive: function () {
            return commonModules.fixListModule.deActive.apply(this, arguments);
        },
        up: function () {
            return commonModules.fixListModule.up.apply(this, arguments);
        },
        down: function () {
            return commonModules.fixListModule.down.apply(this, arguments);
        },
        left: function () {
            return commonModules.fixListModule.left.apply(this, arguments);
        },
        right: function () {
            return commonModules.fixListModule.right.apply(this, arguments);
        },
        ok: function () {
            return commonModules.fixListModule.ok.apply(this, arguments);
        },
        createEl: function () {
            return commonModules.fixListModule.createEl.apply(this, arguments);
        },
        focus: function () {
            return commonModules.fixListModule.focus.apply(this, arguments);
        },
        blur: function () {
            return commonModules.fixListModule.blur.apply(this, arguments);
        }
    },
    module11: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            elType: ["ver first", "ver second", "ver third", "ver", "ver", "ver"],
            picType: ["65", "65", "65", "65", "65", "65"],
            col: 6,
            row: 1,
            maxLen: 6,
            firstLineKey: [0, 1, 2, 3, 4, 5],
            lastLineKey: [0, 1, 2, 3, 4, 5],
            leftDistanceArr: [133, 428, 723, 1018, 1313, 1608],
            data: []
        },
        active: function () {
            return commonModules.fixListModule.active.apply(this, arguments);
        },
        deActive: function () {
            return commonModules.fixListModule.deActive.apply(this, arguments);
        },
        up: function () {
            return commonModules.fixListModule.up.apply(this, arguments);
        },
        down: function () {
            return commonModules.fixListModule.down.apply(this, arguments);
        },
        left: function () {
            return commonModules.fixListModule.left.apply(this, arguments);
        },
        right: function () {
            return commonModules.fixListModule.right.apply(this, arguments);
        },
        ok: function () {
            return commonModules.fixListModule.ok.apply(this, arguments);
        },
        createEl: function () {
            return commonModules.fixListModule.createEl.apply(this, arguments);
        },
        focus: function () {
            return commonModules.fixListModule.focus.apply(this, arguments);
        },
        blur: function () {
            return commonModules.fixListModule.blur.apply(this, arguments);
        }
    },
    module12: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            elType: ["small", "small", "small", "small", "small", "small"],
            col: 6,
            row: 1,
            maxLen: 6,
            firstLineKey: [0, 1, 2, 3, 4, 5],
            lastLineKey: [0, 1, 2, 3, 4, 5],
            leftDistanceArr: [133, 428, 723, 1018, 1313, 1608],
            data: []
        },
        active: function () {
            return commonModules.fixListModule.active.apply(this, arguments);
        },
        deActive: function () {
            return commonModules.fixListModule.deActive.apply(this, arguments);
        },
        up: function () {
            return commonModules.fixListModule.up.apply(this, arguments);
        },
        down: function () {
            return commonModules.fixListModule.down.apply(this, arguments);
        },
        left: function () {
            return commonModules.fixListModule.left.apply(this, arguments);
        },
        right: function () {
            return commonModules.fixListModule.right.apply(this, arguments);
        },
        ok: function () {
            return commonModules.fixListModule.ok.apply(this, arguments);
        },
        createEl: function (menuIndex, moduleIndex) {
            return createSmallEl(menuIndex, moduleIndex, this.info.maxLen, 1, this.info.elType);
        },
        focus: function () {
            return commonModules.fixListModule.focus.apply(this, arguments);
        },
        blur: function () {
            return commonModules.fixListModule.blur.apply(this, arguments);
        }
    },
    module13: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            elType: ["circle", "circle", "circle", "circle", "circle", "circle", "circle"],
            picType: ["67", "67", "67", "67", "67", "67", "67"],
            col: 7,
            row: 1,
            maxLen: 7,
            firstLineKey: [0, 1, 2, 3, 4, 5, 6],
            lastLineKey: [0, 1, 2, 3, 4, 5, 6],
            leftDistanceArr: [96, 354, 612, 870, 1128, 1386, 1644],
            data: []
        },
        active: function () {
            return commonModules.fixListModule.active.apply(this, arguments);
        },
        deActive: function () {
            return commonModules.fixListModule.deActive.apply(this, arguments);
        },
        up: function () {
            return commonModules.fixListModule.up.apply(this, arguments);
        },
        down: function () {
            return commonModules.fixListModule.down.apply(this, arguments);
        },
        left: function () {
            return commonModules.fixListModule.left.apply(this, arguments);
        },
        right: function () {
            return commonModules.fixListModule.right.apply(this, arguments);
        },
        ok: function () {
            return commonModules.fixListModule.ok.apply(this, arguments);
        },
        createEl: function () {
            return commonModules.fixListModule.createEl.apply(this, arguments);
        },
        focus: function () {
            return commonModules.fixListModule.focus.apply(this, arguments);
        },
        blur: function () {
            return commonModules.fixListModule.blur.apply(this, arguments);
        }
    },
    module14: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            elType: ["circle", "circle", "circle", "circle", "circle", "circle", "circle"],
            picType: ["67", "67", "67", "67", "67", "67", "67"],
            col: 7,
            row: 1,
            maxLen: 7,
            firstLineKey: [0, 1, 2, 3, 4, 5, 6],
            lastLineKey: [0, 1, 2, 3, 4, 5, 6],
            leftDistanceArr: [96, 354, 612, 870, 1128, 1386, 1644],
            data: []
        },
        active: function () {
            return commonModules.fixListModule.active.apply(this, arguments);
        },
        deActive: function () {
            return commonModules.fixListModule.deActive.apply(this, arguments);
        },
        up: function () {
            return commonModules.fixListModule.up.apply(this, arguments);
        },
        down: function () {
            return commonModules.fixListModule.down.apply(this, arguments);
        },
        left: function () {
            return commonModules.fixListModule.left.apply(this, arguments);
        },
        right: function () {
            return commonModules.fixListModule.right.apply(this, arguments);
        },
        ok: function () {
            return commonModules.fixListModule.ok.apply(this, arguments);
        },
        createEl: function () {
            return commonModules.fixListModule.createEl.apply(this, arguments);
        },
        focus: function () {
            return commonModules.fixListModule.focus.apply(this, arguments);
        },
        blur: function () {
            return commonModules.fixListModule.blur.apply(this, arguments);
        }
    },
    module15: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            elType: ["circle2", "circle2", "circle2", "circle2", "circle2", "circle2", "circle2"],
            picType: ["67", "67", "67", "67", "67", "67", "67"],
            col: 7,
            row: 1,
            maxLen: 7,
            firstLineKey: [0, 1, 2, 3, 4, 5, 6],
            lastLineKey: [0, 1, 2, 3, 4, 5, 6],
            leftDistanceArr: [96, 354, 612, 870, 1128, 1386, 1644],
            data: []
        },
        active: function () {
            return commonModules.fixListModule.active.apply(this, arguments);
        },
        deActive: function () {
            return commonModules.fixListModule.deActive.apply(this, arguments);
        },
        up: function () {
            return commonModules.fixListModule.up.apply(this, arguments);
        },
        down: function () {
            return commonModules.fixListModule.down.apply(this, arguments);
        },
        left: function () {
            return commonModules.fixListModule.left.apply(this, arguments);
        },
        right: function () {
            return commonModules.fixListModule.right.apply(this, arguments);
        },
        ok: function () {
            return commonModules.fixListModule.ok.apply(this, arguments);
        },
        createEl: function () {
            return commonModules.fixListModule.createEl.apply(this, arguments);
        },
        focus: function () {
            return commonModules.fixListModule.focus.apply(this, arguments);
        },
        blur: function () {
            return commonModules.fixListModule.blur.apply(this, arguments);
        }
    },
    module16: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            elType: ["circle2", "circle2", "circle2", "circle2", "circle2", "circle2", "circle2"],
            picType: ["67", "67", "67", "67", "67", "67", "67"],
            col: 7,
            row: 1,
            maxLen: 7,
            firstLineKey: [0, 1, 2, 3, 4, 5, 6],
            lastLineKey: [0, 1, 2, 3, 4, 5, 6],
            leftDistanceArr: [96, 354, 612, 870, 1128, 1386, 1644],
            data: []
        },
        active: function () {
            return commonModules.fixListModule.active.apply(this, arguments);
        },
        deActive: function () {
            return commonModules.fixListModule.deActive.apply(this, arguments);
        },
        up: function () {
            return commonModules.fixListModule.up.apply(this, arguments);
        },
        down: function () {
            return commonModules.fixListModule.down.apply(this, arguments);
        },
        left: function () {
            return commonModules.fixListModule.left.apply(this, arguments);
        },
        right: function () {
            return commonModules.fixListModule.right.apply(this, arguments);
        },
        ok: function () {
            return commonModules.fixListModule.ok.apply(this, arguments);
        },
        createEl: function () {
            return commonModules.fixListModule.createEl.apply(this, arguments);
        },
        focus: function () {
            return commonModules.fixListModule.focus.apply(this, arguments);
        },
        blur: function () {
            return commonModules.fixListModule.blur.apply(this, arguments);
        }
    },
    module17: {
        info: {
            direction: "down",
            leftDistance: 0,
            moduleBegin: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            elType: [],
            picType: "6",
            showLen: 6,
            firstLineKey: [0, 1, 2, 3, 4, 5],
            lastLineKey: [0, 1, 2, 3, 4, 5],
            leftDistanceArr: [133, 428, 723, 1018, 1313, 1608],
            data: []
        },
        active: function () {
            return commonModules.extendOneLineModule.active.apply(this, arguments);
        },
        deActive: function () {
            return commonModules.extendOneLineModule.deActive.apply(this, arguments);
        },
        up: function () {
            return commonModules.extendOneLineModule.up.apply(this, arguments);
        },
        down: function () {
            return commonModules.extendOneLineModule.down.apply(this, arguments);
        },
        left: function () {
            return commonModules.extendOneLineModule.left.apply(this, arguments);
        },
        right: function () {
            return commonModules.extendOneLineModule.right.apply(this, arguments);
        },
        ok: function () {
            return commonModules.extendOneLineModule.ok.apply(this, arguments);
        },
        createEl: function () {
            return commonModules.extendOneLineModule.createEl.apply(this, arguments);
        },
        focus: function () {
            return commonModules.extendOneLineModule.focus.apply(this, arguments);
        },
        blur: function () {
            return commonModules.extendOneLineModule.blur.apply(this, arguments);
        }
    },
    module18: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            col: 6,
            elType: [],
            picType: "6",
            firstLineKey: [],
            lastLineKey: [],
            leftDistanceCol: [133, 428, 723, 1018, 1313, 1608],
            leftDistanceArr: [],
            data: []
        },
        active: function () {
            return commonModules.extendListModule.active.apply(this, arguments);
        },
        deActive: function () {
            return commonModules.extendListModule.deActive.apply(this, arguments);
        },
        up: function () {
            return commonModules.extendListModule.up.apply(this, arguments);
        },
        down: function () {
            return commonModules.extendListModule.down.apply(this, arguments);
        },
        left: function () {
            return commonModules.extendListModule.left.apply(this, arguments);
        },
        right: function () {
            return commonModules.extendListModule.right.apply(this, arguments);
        },
        ok: function () {
            return commonModules.extendListModule.ok.apply(this, arguments);
        },
        createEl: function () {
            return commonModules.extendListModule.createEl.apply(this, arguments);
        },
        focus: function () {
            return commonModules.extendListModule.focus.apply(this, arguments);
        },
        blur: function () {
            return commonModules.extendListModule.blur.apply(this, arguments);
        }
    },
    module19: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            elType: ["ver", "ver", "ver", "ver", "ver", "ver"],
            col: 6,
            row: 1,
            maxLen: 6,
            firstLineKey: [0, 1, 2, 3, 4, 5],
            lastLineKey: [0, 1, 2, 3, 4, 5],
            leftDistanceArr: [133, 428, 723, 1018, 1313, 1608],
            data: []
        },
        active: function () {
            return commonModules.fixListModule.active.apply(this, arguments);
        },
        deActive: function () {
            return commonModules.fixListModule.deActive.apply(this, arguments);
        },
        up: function () {
            return commonModules.fixListModule.up.apply(this, arguments);
        },
        down: function () {
            return commonModules.fixListModule.down.apply(this, arguments);
        },
        left: function () {
            return commonModules.fixListModule.left.apply(this, arguments);
        },
        right: function () {
            return commonModules.fixListModule.right.apply(this, arguments);
        },
        ok: function () {
            return commonModules.fixListModule.ok.apply(this, arguments);
        },
        createEl: function (menuIndex, moduleIndex) {
            var html = "";
            var data = homeAllData[menuIndex].subContent[moduleIndex].moduleContent;
            var vipCorner = "";
            data && (data = data.slice(0, this.info.maxLen));
            html = '<div class="fenge"><img src="/pub/galaxy/mybz/home/images/jjsxfenge.png"></div>';
            for (var i = 0; i < this.info.maxLen; i++) {
                var iType = this.info.elType && this.info.elType[i] || "";
                vipCorner = "";
                html += '<div class="onlineTimes onlineTime' + i + '"></div>';
                html += '<div picType="6" class="' + iType + " blocks block" + i + '" id="m' + menuIndex + "m" + moduleIndex + "m" + i + '">' + '<div class="images"><img></div>' + '<div class="episode"></div>' + '<div class="contentTitle hide"></div>' + vipCorner + flashlightHtml + "</div>";
            }
            return html;
        },
        focus: function () {
            return commonModules.fixListModule.focus.apply(this, arguments);
        },
        blur: function () {
            return commonModules.fixListModule.blur.apply(this, arguments);
        }
    },
    module20: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            elType: ["small", "small", "small", "small", "small", "small"],
            picType: ["67", "67", "67", "67", "67", "67"],
            col: 6,
            row: 1,
            maxLen: 6,
            firstLineKey: [0, 1, 2, 3, 4, 5],
            lastLineKey: [0, 1, 2, 3, 4, 5],
            leftDistanceArr: [133, 428, 723, 1018, 1313, 1608],
            data: []
        },
        active: function () {
            return commonModules.fixListModule.active.apply(this, arguments);
        },
        deActive: function () {
            return commonModules.fixListModule.deActive.apply(this, arguments);
        },
        up: function () {
            return commonModules.fixListModule.up.apply(this, arguments);
        },
        down: function () {
            return commonModules.fixListModule.down.apply(this, arguments);
        },
        left: function () {
            return commonModules.fixListModule.left.apply(this, arguments);
        },
        right: function () {
            return commonModules.fixListModule.right.apply(this, arguments);
        },
        ok: function () {
            return commonModules.fixListModule.ok.apply(this, arguments);
        },
        createEl: function (menuIndex, moduleIndex) {
            return createSmallEl(menuIndex, moduleIndex, this.info.maxLen, 2, this.info.elType, this.info.picType);
        },
        focus: function () {
            return commonModules.fixListModule.focus.apply(this, arguments);
        },
        blur: function () {
            return commonModules.fixListModule.blur.apply(this, arguments);
        }
    },
    module21: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            elType: ["small", "small", "small", "small"],
            picType: ["67", "67", "67", "67"],
            col: 4,
            row: 1,
            maxLen: 4,
            firstLineKey: [0, 1, 2, 3],
            lastLineKey: [0, 1, 2, 3],
            leftDistanceArr: [206, 649, 1091, 1534],
            data: []
        },
        active: function () {
            return commonModules.fixListModule.active.apply(this, arguments);
        },
        deActive: function () {
            return commonModules.fixListModule.deActive.apply(this, arguments);
        },
        up: function () {
            return commonModules.fixListModule.up.apply(this, arguments);
        },
        down: function () {
            return commonModules.fixListModule.down.apply(this, arguments);
        },
        left: function () {
            return commonModules.fixListModule.left.apply(this, arguments);
        },
        right: function () {
            return commonModules.fixListModule.right.apply(this, arguments);
        },
        ok: function () {
            return commonModules.fixListModule.ok.apply(this, arguments);
        },
        createEl: function (menuIndex, moduleIndex) {
            return createSmallEl(menuIndex, moduleIndex, this.info.maxLen, 2, this.info.elType, this.info.picType);
        },
        focus: function () {
            return commonModules.fixListModule.focus.apply(this, arguments);
        },
        blur: function () {
            return commonModules.fixListModule.blur.apply(this, arguments);
        }
    },
    module22: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            elType: ["hor", "hor", "hor", "hor"],
            picType: ["103", "103", "103", "103"],
            col: 4,
            row: 1,
            maxLen: 4,
            firstLineKey: [0, 1, 2, 3],
            lastLineKey: [0, 1, 2, 3],
            leftDistanceArr: [206, 649, 1091, 1534],
            data: []
        },
        active: function () {
            return commonModules.bigScreenModule.active.apply(this, arguments);
        },
        deActive: function () {
            return commonModules.bigScreenModule.deActive.apply(this, arguments);
        },
        up: function () {
            return commonModules.bigScreenModule.up.apply(this, arguments);
        },
        down: function () {
            return commonModules.bigScreenModule.down.apply(this, arguments);
        },
        left: function () {
            return commonModules.bigScreenModule.left.apply(this, arguments);
        },
        right: function () {
            return commonModules.bigScreenModule.right.apply(this, arguments);
        },
        ok: function () {
            return commonModules.bigScreenModule.ok.apply(this, arguments);
        },
        createEl: function () {
            return commonModules.bigScreenModule.createEl.apply(this, arguments);
        },
        focus: function (isMove) {
            showPicScreen.show(this.info.data[this.info.activeNum].pics[picScreenType], true);
            return commonModules.bigScreenModule.focus.apply(this, [isMove, true]);
        },
        blur: function () {
            return commonModules.bigScreenModule.blur.apply(this, arguments);
        }
    },
    module23: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            elType: ["hor", "hor", "hor", "hor"],
            picType: ["103", "103", "103", "103"],
            col: 4,
            row: 1,
            maxLen: 4,
            firstLineKey: [0, 1, 2, 3],
            lastLineKey: [0, 1, 2, 3],
            leftDistanceArr: [206, 649, 1091, 1534],
            data: []
        },
        active: function () {
            return commonModules.bigScreenModule.active.apply(this, arguments);
        },
        deActive: function () {
            return commonModules.bigScreenModule.deActive.apply(this, arguments);
        },
        up: function () {
            return commonModules.bigScreenModule.up.apply(this, arguments);
        },
        down: function () {
            return commonModules.bigScreenModule.down.apply(this, arguments);
        },
        left: function () {
            return commonModules.bigScreenModule.left.apply(this, arguments);
        },
        right: function () {
            return commonModules.bigScreenModule.right.apply(this, arguments);
        },
        ok: function () {
            return commonModules.bigScreenModule.ok.apply(this, arguments);
        },
        loadService: function (menuIndex, moduleIndex) {
            var nowHomeData = homeAllData[menuIndex].subContent[moduleIndex].moduleContent;
            nowHomeData = nowHomeData.slice(0, this.info.maxLen);
            var loadIndex = 0;
            var $infos = $(".infos", "#m" + menuIndex + "m" + moduleIndex + " .info", true);
            loadDetail();

            function loadDetail() {
                if (nowHomeData[loadIndex].contentType == "0") {
                    $.s.detail.get({
                        id: nowHomeData[loadIndex].contentId
                    }, {
                        success: function (data) {
                            $infos.item(loadIndex).html('<div class="title">' + data.vodName + "</div>" + '<div class="description">' + (nowHomeData[loadIndex].contentName.split("@")[1] || "") + "</div>" + '<div class="other">' + (data.vodCountry || "") + "/" + data.onlineTimes.substring(0, 4) + "/" + data.vodTags.join("/") + "</div>" + '<div class="actors">' + data.vodActordis.split("、").join("/") + "</div>");
                            loadNext();
                        },
                        error: function () {
                            loadNext();
                        }
                    });
                } else {
                    loadNext();
                }
            }

            function loadNext() {
                if (loadIndex == nowHomeData.length - 1) {
                    return;
                }
                loadIndex++;
                loadDetail();
            }
        },
        createEl: function (menuIndex, moduleIndex) {
            return commonModules.bigScreenModule.createEl.apply(this, [menuIndex, moduleIndex, true]);
        },
        focus: function (isMove, isActive) {
            if (!(videoScreen.checkPlaying(this.info.menuIndex, this.info.activeNum) && isActive)) {
                var nowSubData = homeAllData[this.info.menuIndex].subContent;
                var nowModuleData = nowSubData[0].moduleContent;
                showPicScreen.show(nowModuleData[this.info.activeNum].pics[picScreenType], true);
                videoScreen.init(function () {
                    var info = [];
                    $.UTIL.each(nowModuleData, function (value, index) {
                        info.push({
                            contentId: value.contentName.split("@")[0]
                        });
                    });
                    return info;
                }(), nowSubData[0].categoryId);
                videoScreen.play(this.info.menuIndex, this.info.activeNum);
            }
            return commonModules.bigScreenModule.focus.apply(this, [isMove, true, true]);
        },
        blur: function () {
            return commonModules.bigScreenModule.blur.apply(this, arguments);
        }
    },
    module24: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            maxLen: 6,
            picType: ["68", "68", "68", "68", "68", "68"],
            firstLineKey: [0, 2, 3, 4, 5],
            lastLineKey: [1, 2, 3, 4, 5],
            leftDistanceArr: [158, 158, 484, 845, 1199, 1568],
            data: [],
        },
        active: function (info) {
            this.info.direction = info.direction;
            this.info.leftDistance = info.leftDistance;
            this.info.menuIndex = info.menuIndex;
            this.info.moduleIndex = info.moduleIndex;
            this.info.data = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].moduleContent;
            this.info.data && (this.info.data = this.info.data.slice(0, this.info.maxLen));
            this.info.activeNum = info.activeNum ? info.activeNum : findActiveIndex(this.info.direction, this.info.leftDistance, this.info.firstLineKey, this.info.lastLineKey, this.info.leftDistanceArr);
            this.focus(1);
        },
        deActive: function () {},
        up: function () {
            if (this.info.activeNum == 1) {
                this.info.activeNum -= 1;
                this.focus(1);
                return false;
            } else {
                return {
                    direction: "up",
                    leftDistance: this.info.leftDistanceArr[this.info.activeNum]
                };
            }
        },
        down: function () {
            if (this.info.activeNum == 0) {
                this.info.activeNum += 1;
                this.focus(1);
                return false;
            } else {
                return {
                    direction: "down",
                    leftDistance: this.info.leftDistanceArr[this.info.activeNum]
                };
            }
        },
        left: function () {
            if (this.info.activeNum == 0 || this.info.activeNum == 1) {
                return {
                    direction: "down",
                    leftDistance: 1e4,
                    id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                };
            } else {
                this.info.activeNum === 2 ? this.info.activeNum -= 2 : this.info.activeNum--;
            }
            this.focus();
            return false;
        },
        right: function () {
            if (this.info.activeNum == 5) {
                return {
                    direction: "down",
                    leftDistance: 0,
                    id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                };
            } else {
                if (this.info.activeNum == 0) {
                    this.info.activeNum += 2;
                } else {
                    this.info.activeNum++;
                }
                this.focus();
                return false;
            }
        },
        ok: function () {
            if (/com.android.settings/.test(this.info.data[this.info.activeNum].contentUri)) {
                $.gotoDetail({
                    contentType: "7",
                    url: "app://com.android.settings"
                });
            } else if (/^email$/.test(this.info.data[this.info.activeNum].contentUri)) {
                $.gotoDetail($.urls.email);
            } else if (/playHistory/.test(this.info.data[this.info.activeNum].contentUri)) {
                $.gotoDetail($.urls.recent);
            } else {
                var nowData = this.info.data[this.info.activeNum];
                nowData.categoryId = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].categoryId;
                $.gotoDetail(nowData);
            }
        },
        createEl: function (menuIndex, moduleIndex) {
            return createNorEl(menuIndex, moduleIndex, this.info.maxLen, this.info.elType, "", this.info.picType)
        },
        focus: function (isMove) {
            focusTo(isMove, this.info.menuIndex, this.info.moduleIndex, this.info.activeNum);
        },
        blur: function () {}
    },
    module25: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            elType: ["hor", "hor", "hor", "hor", "hor", "hor"],
            picType: ["103", "103", "103", "103", "103", "103"],
            listPicType: "127",
            maxLen: 12,
            norLen: 6,
            listLen: 6,
            firstLineKey: [0, 6, 12],
            lastLineKey: [2, 3, 4, 5],
            leftDistanceArr: [206, 206, 206, 649, 1091, 1534, 1534, 1534, 1534, 1534, 1534, 1534, 960],
            data: [],
            moduleInfo: {}
        },
        active: function (info) {
            this.info.direction = info.direction;
            this.info.leftDistance = info.leftDistance;
            this.info.menuIndex = info.menuIndex;
            this.info.moduleIndex = info.moduleIndex;
            this.info.data = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].moduleContent;
            this.info.data && (this.info.data = this.info.data.slice(0, this.info.maxLen));
            this.info.activeNum = info.activeNum ? info.activeNum : findActiveIndex(this.info.direction, this.info.leftDistance, this.info.firstLineKey, this.info.lastLineKey, this.info.leftDistanceArr);
            this.focus(1, info.isFromVol);
        },
        deActive: function (isGotoOterPage) {
            this.blur(isGotoOterPage);
        },
        up: function () {
            if (this.info.activeNum == 0 || this.info.activeNum == 6 || this.info.activeNum == 12) {
                return {
                    direction: "up",
                    leftDistance: this.info.leftDistanceArr[this.info.activeNum]
                };
            } else {
                if (this.info.activeNum == 1 || this.info.activeNum == 2 || this.info.activeNum > 6) {
                    this.info.activeNum--;
                } else if (this.info.activeNum == 3 || this.info.activeNum == 4) {
                    this.info.activeNum = 12;
                } else if (this.info.activeNum == 5) {
                    this.info.activeNum = 11;
                }
                this.focus(1);
                return false;
            }
        },
        down: function () {
            if (this.info.activeNum == 2 || this.info.activeNum == 3 || this.info.activeNum == 4 || this.info.activeNum == 5) {
                return {
                    direction: "down",
                    leftDistance: this.info.leftDistanceArr[this.info.activeNum]
                };
            } else {
                if (this.info.activeNum == 0 || this.info.activeNum == 1 || this.info.activeNum > 5 && this.info.activeNum < this.info.maxLen - 1) {
                    this.info.activeNum++;
                } else if (this.info.activeNum == this.info.maxLen - 1) {
                    this.info.activeNum = 5;
                } else if (this.info.activeNum == 12) {
                    this.info.activeNum = 3;
                }
                this.focus(1);
                return false;
            }
        },
        left: function () {
            if (this.info.activeNum < 3) {
                return {
                    direction: "down",
                    leftDistance: 1e4,
                    id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                };
            } else {
                if (this.info.activeNum < 6) {
                    this.info.activeNum--;
                } else if (this.info.activeNum == 6 || this.info.activeNum == 7 || this.info.activeNum == 8 || this.info.activeNum == 9 || this.info.activeNum == 10 || this.info.activeNum == 11) {
                    this.info.activeNum = 12;
                } else if (this.info.activeNum == 12) {
                    this.info.activeNum = 0;
                }
                this.focus();
                return false;
            }
        },
        right: function () {
            return this.info.activeNum > 4 ? 12 == this.info.activeNum ? (this.info.activeNum = this.info.moduleInfo[
                "m" + this.info.menuIndex + "m" + this.info.moduleIndex].listIndex, this.focus(), !1) : {
                direction: "down",
                leftDistance: 0,
                id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
            } : (this.info.activeNum > 1 ? this.info.activeNum++ : 0 != this.info.activeNum && 1 != this.info
                .activeNum || (this.info.activeNum = 12), this.focus(), !1)
        },
        ok: function () {
            var nowData = this.info.data[this.info.activeNum];
            if (this.info.activeNum == 12) {
                // $.saveGlobalData('listIndex',this.info.moduleInfo["m" + this.info.menuIndex + "m" + this.info.moduleIndex].listIndex)
                var nowData = this.info.data[this.info.moduleInfo["m" + this.info.menuIndex + "m" + this.info.moduleIndex].listIndex];
            }
            nowData.categoryId = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].categoryId;
            $.gotoDetail(nowData);
        },
        createEl: function (menuIndex, moduleIndex) {
            var info = this.info,
                moduleId = "m" + menuIndex + "m" + moduleIndex;
            if (pageInfo.module25Info[moduleId]) {
                info.moduleInfo[moduleId] = {
                    listIndex: pageInfo.$Info[moduleId].listIndex,
                    listTimer: null,
                }
            } else {
                info.moduleInfo[moduleId] = {
                    listIndex: info.norLen,
                    listTimer: null,
                    vl: null
                }
            }
            var htmlTxt = '<div class="listBg"></div>';
            htmlTxt += createNorEl(menuIndex, moduleIndex, info.norLen, info.elType, "notrany", info.picType);
            for (var i = 0, j = 6; i < info.listLen; i++, j++) {
                htmlTxt += '<div class="notrany lists blocks block' + j + (j == 6 ? " current" : "") + '" id="m' + menuIndex + "m" + moduleIndex + "m" + j + '">' + '<div class="contentTitle hide"></div>' + flashlightHtml + "</div>";
            }
            if (!vodWindowInfo[menuIndex]) {
                vodWindowInfo[menuIndex] = {};
            }
            vodWindowInfo[menuIndex]["m" + menuIndex + "m" + moduleIndex] = {};
            var srcTxt = homeAllData[menuIndex].subContent[moduleIndex].moduleContent[info.norLen].pics[info.listPicType] || '';
            htmlTxt += '<div class="vodWindow noContent block12" id="m' + menuIndex + "m" + moduleIndex + "m" + j + '"><img src="' + srcTxt + '"></div>';
            return htmlTxt;
        },
        addCurrent: function (menuIndex, moduleIndex) {
            var moduleId = "#m" + menuIndex + "m" + moduleIndex;
            var $aBlock = $(moduleId + " .blocks", moduleId, !0);
            $aBlock.removeClass("current");
            $aBlock.item(this.info.moduleInfo["m" + menuIndex + "m" + moduleIndex].listIndex).addClass("current");
        },
        showVodPic: function (menuIndex, moduleIndex) {
            var moduleId = "m" + menuIndex + "m" + moduleIndex;
            this.addCurrent(menuIndex, moduleIndex);
            var nowData = homeAllData[menuIndex].subContent[moduleIndex].moduleContent[this.info.moduleInfo[moduleId].listIndex];
            $("#" + moduleId + " .vodWindow img").show().attr({
                src: nowData && nowData.pics[this.info.listPicType] || ''
            });
        },
        autoPlay: function (menuIndex, moduleIndex) {
            var info = this.info;
            var moduleId = "m" + menuIndex + "m" + moduleIndex;
            var This = this;

            function playNext() {
                if (info.moduleInfo[moduleId].listIndex === info.maxLen - 1) {
                    info.moduleInfo[moduleId].listIndex = info.norLen;
                } else {
                    info.moduleInfo[moduleId].listIndex++;
                }
                This.showVodPic(menuIndex, moduleIndex);
            }
            this.stopAutoPlay(menuIndex, moduleIndex);
            info.moduleInfo[moduleId].listTimer = setInterval(playNext, 3e3);
        },
        stopAutoPlay: function (menuIndex, moduleIndex) {
            var moduleId = "m" + menuIndex + "m" + moduleIndex;
            clearInterval(this.info.moduleInfo[moduleId].listTimer);
            this.info.moduleInfo[moduleId].listTimer = null;
        },
        focus: function (isMove, isFromVol) {
            var info = this.info,
                moduleId = "m" + info.menuIndex + "m" + info.moduleIndex;
            if (isFromVol || info.activeNum > info.norLen - 1) {
                this.stopAutoPlay(info.menuIndex, info.moduleIndex);
                info.activeNum != 12 && (info.moduleInfo[moduleId].listIndex = info.activeNum);
                this.showVodPic(info.menuIndex, info.moduleIndex);
            } else {
                if (!info.moduleInfo[moduleId].listTimer) {
                    this.autoPlay(info.menuIndex, info.moduleIndex);
                }
            }
            focusTo(isMove, info.menuIndex, info.moduleIndex, info.activeNum);
        },
        blur: function (isGotoOterPage) {
            var moduleInfo = this.info.moduleInfo["m" + this.info.menuIndex + "m" + this.info.moduleIndex];
            if (!moduleInfo.listTimer && !isGotoOterPage) {
                this.autoPlay(this.info.menuIndex, this.info.moduleIndex);
            }
        }
    },
    module26: {
        info: {
            end: 5,
            star: 0,
            moduleBegin: 0,
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            elType: ["small", "small", "small", "small", "small", "small", "small", "small"],
            picType: [],
            col: 8,
            row: 1,
            maxLen: 12,
            firstLineKey: [],
            lastLineKey: [],
            leftDistanceArr: [],
            data: []
        },
        active: function () {
            return commonModules.module1_scroll.active.apply(this, arguments);
        },
        deActive: function () {
            return commonModules.module1_scroll.deActive.apply(this, arguments);
        },
        up: function () {
            return commonModules.module1_scroll.up.apply(this, arguments);
        },
        down: function () {
            return commonModules.module1_scroll.down.apply(this, arguments);
        },
        left: function () {
            return commonModules.module1_scroll.left.apply(this, arguments);
        },
        right: function () {
            return commonModules.module1_scroll.right.apply(this, arguments);
        },
        ok: function () {
            return commonModules.module1_scroll.ok.apply(this, arguments);
        },
        createEl: function (menuIndex, moduleIndex) {
            return commonModules.module1_scroll.createEl.apply(this, arguments);
        },
        focus: function () {
            return commonModules.module1_scroll.focus.apply(this, arguments);
        },
        blur: function () {
            return commonModules.module1_scroll.blur.apply(this, arguments);
        }
    },
    module27: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            elType: ["hor", "hor", "hor", "hor"],
            picType: ["63", "6", "64", "64"],
            maxLen: 9,
            norLen: 0,
            dotIndex: 0,
            firstLineKey: [0, 1, 2],
            lastLineKey: [0, 1, 3],
            leftDistanceArr: [205, 1183, 1525, 1525],
            data: [],
            moduleInfo: {},
            isFocus: false
        },
        active: function (info) {
            this.info.direction = info.direction;
            this.info.leftDistance = info.leftDistance;
            this.info.menuIndex = info.menuIndex;
            this.info.moduleIndex = info.moduleIndex;
            this.info.activeNum = info.activeNum ? info.activeNum : findActiveIndex(this.info.direction, this.info.leftDistance, this.info.firstLineKey, this.info.lastLineKey, this.info.leftDistanceArr);
            this.focus(1, info.isFromVol);
        },
        deActive: function (isGotoOterPage) {
            this.blur(isGotoOterPage);
        },
        createEl: function (menuIndex, moduleIndex) {
            var info = this.info;
            var moduleId = "m" + menuIndex + "m" + moduleIndex;
            info.moduleInfo[moduleId] = {
                index: pageInfo.module27Index,
                dotsTimer: null
            };
            var data = homeAllData[menuIndex].subContent[moduleIndex].moduleContent;
            data && (info.data = data.slice(0, Math.min(data.length, this.info.maxLen)))
            var moveData = info.data.slice(0, info.data.length - 3);
            var otherData = info.data.slice(-3);
            var newArr = moveData.slice(0, 1).concat(otherData);
            var htmlTxt = '';
            // 多余
            htmlTxt += createNorEl(menuIndex, moduleIndex, info.norLen, info.elType, "notrany", info.picType);
            var lis = '';
            for (k in newArr) {
                htmlTxt += '<div class="notrany lists blocks block' + k + '"  id="m' + menuIndex + "m" + moduleIndex + "m" + k + '">' + '<img src="' + (newArr[k].pics[info.picType[k]] || '') + '">' + flashlightHtml + "</div>";
            }
            for (var i = 0; i < moveData.length; i++) {
                lis += '<li class="dot ' + i + (i == 0 ? " current" : "") + '" id="m' + menuIndex + "m" + moduleIndex + "m" + i + '">' + flashlightHtml + '</li>';
            }
            return htmlTxt + '<ul class="dots">' + lis + '</ul>';
        },
        loadService: function (menuIndex, moduleIndex) {
            var moduleId = "m" + menuIndex + "m" + moduleIndex;
            !this.info.isFocus && !this.info.moduleInfo[moduleId].dotsTimer && this.autoPlay(menuIndex, moduleIndex);
        },
        left: function () {
            var info = this.info;
            if (info.activeNum == 0) {
                return {
                    direction: "down",
                    leftDistance: 1e4,
                    id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                };
            } else {
                info.activeNum === 3 ? info.activeNum -= 2 : info.activeNum--;
            }
            this.focus(1);
            return false;
        },
        right: function () {
            var info = this.info;
            if (info.activeNum == 2 || info.activeNum == 3) {
                return {
                    direction: "down",
                    leftDistance: 0,
                    id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                };
            } else {

                if (info.activeNum == 0 || info.activeNum == 1) {
                    this.info.activeNum++;
                }
                this.focus();
                return false;
            }
        },
        up: function () {
            var info = this.info;
            if (info.activeNum == 3) {
                info.activeNum--;
                this.focus(1);
                return false;
            } else {
                return {
                    direction: "up",
                    leftDistance: this.info.leftDistanceArr[this.info.activeNum]
                };
            }
        },
        down: function () {
            var info = this.info;
            if (info.activeNum == 2) {
                info.activeNum += 1;
                this.focus(1);
                return false;
            } else {
                return {
                    direction: "down",
                    leftDistance: this.info.leftDistanceArr[this.info.activeNum]
                };
            }
        },
        ok: function () {
            var nowData = this.info.data[this.info.activeNum];
            if (this.info.activeNum == 0) {
                var nowData = this.info.data[this.info.moduleInfo["m" + this.info.menuIndex + "m" + this.info.moduleIndex].index];
            } else {
                var nowData = this.info.activeNum == 1 ? this.info.data[this.info.data.length - 3] : this.info.activeNum == 2 ? this.info.data[this.info.data.length - 2] : this.info.data[this.info.data.length - 1]
            }
            nowData.categoryId = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].categoryId;
            $.gotoDetail(nowData);
        },
        addCurrent: function (menuIndex, moduleIndex) {
            var moduleId = "#m" + menuIndex + "m" + moduleIndex;
            var $aBlock = $(moduleId + " .dot", moduleId, true);
            $aBlock.removeClass("current");
            $aBlock.item(this.info.moduleInfo["m" + menuIndex + "m" + moduleIndex].index).addClass("current");
        },
        showPic: function (menuIndex, moduleIndex) {
            var info = this.info;
            var moduleId = "m" + menuIndex + "m" + moduleIndex;
            var picType = +this.info.picType[0];
            var src = info.data[info.moduleInfo[moduleId].index].pics;
            this.addCurrent(menuIndex, moduleIndex);
            $("#" + moduleId + " .block0 img").attr({
                src: src && src[picType] && src[picType] || ""
            });
        },
        autoPlay: function (menuIndex, moduleIndex) {
            var moduleId = "m" + menuIndex + "m" + moduleIndex;
            var that = this;
            this.stopAutoPlay(menuIndex, moduleIndex);
            this.info.moduleInfo[moduleId].dotsTimer = setInterval(that.playNext.bind(that, menuIndex, moduleIndex), 3e3);
        },
        playNext: function (menuIndex, moduleIndex) {
            var info = this.info;
            var moduleId = "m" + menuIndex + "m" + moduleIndex;
            if (info.moduleInfo[moduleId].index === info.data.length - 4) {
                info.moduleInfo[moduleId].index = info.norLen;
            } else {
                info.moduleInfo[moduleId].index++;
            }
            this.showPic(menuIndex, moduleIndex);
        },
        stopAutoPlay: function (menuIndex, moduleIndex) {
            var moduleId = "m" + menuIndex + "m" + moduleIndex;
            clearInterval(this.info.moduleInfo[moduleId].dotsTimer);
            this.info.moduleInfo[moduleId].dotsTimer = null;
        },
        focus: function (isMove, isFromVol) {
            this.info.isFocus = true;
            var info = this.info;
            var moduleId = "m" + info.menuIndex + "m" + info.moduleIndex;
            if (!isFromVol) {
                if (info.activeNum == 0) {
                    this.stopAutoPlay(info.menuIndex, info.moduleIndex);
                    this.showPic(info.menuIndex, info.moduleIndex);
                } else {
                    if (!info.moduleInfo[moduleId].dotsTimer) {
                        this.autoPlay(info.menuIndex, info.moduleIndex);
                        this.showPic(info.menuIndex, info.moduleIndex);
                    }
                }
            }
            focusTo(isMove, info.menuIndex, info.moduleIndex, info.activeNum);
        },
        blur: function (isGotoOterPage) {
            var moduleInfo = this.info.moduleInfo["m" + this.info.menuIndex + "m" + this.info.moduleIndex];
            if (!moduleInfo.dotsTimer && !isGotoOterPage) {
                this.autoPlay(this.info.menuIndex, this.info.moduleIndex);
            }
        }
    },
    module29: {
        info: {
            end: 5,
            star: 0,
            moduleBegin: 0,
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            elType: ["small", "small", "small", "small", "small", "small", "small", "small"],
            picType: [],
            col: 8,
            row: 1,
            maxLen: 12,
            firstLineKey: [],
            lastLineKey: [],
            leftDistanceArr: [],
            data: []
        },
        active: function () {
            return commonModules.module1_scroll.active.apply(this, arguments);
        },
        deActive: function () {
            return commonModules.module1_scroll.deActive.apply(this, arguments);
        },
        up: function () {
            return commonModules.module1_scroll.up.apply(this, arguments);
        },
        down: function () {
            return commonModules.module1_scroll.down.apply(this, arguments);
        },
        left: function () {
            return commonModules.module1_scroll.left.apply(this, arguments);
        },
        right: function () {
            return commonModules.module1_scroll.right.apply(this, arguments);
        },
        ok: function () {
            return commonModules.module1_scroll.ok.apply(this, arguments);
        },
        createEl: function (menuIndex, moduleIndex) {
            return commonModules.module1_scroll.createEl.apply(this, arguments);
        },
        focus: function () {
            return commonModules.module1_scroll.focus.apply(this, arguments);
        },
        blur: function () {
            return commonModules.module1_scroll.blur.apply(this, arguments);
        }
    },
    module32: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            // picType: ["127", "67"],
            picType: ["101", "102"],
            maxLen: 8,
            moduleBegin: 0,
            list_fixed: 2,
            list_height: 133,
            firstLineKey: [0, 1, 2],
            lastLineKey: [0, 1, 2],
            leftDistanceArr: [471, 1135, 1608],
            playIndex: 0,
            playTimer: null,
            listTimer: null,
            listIsPic: [],
            vodPlaying: false,
            data: [],
            rightData: [],
        },
        active: function (info) {
            this.info.direction = info.direction;
            this.info.leftDistance = info.leftDistance;
            this.info.menuIndex = info.menuIndex;
            this.info.moduleIndex = info.moduleIndex;
            info.moduleBegin && (this.info.moduleBegin = info.moduleBegin);
            this.info.activeNum = info.activeNum ? info.activeNum : findActiveIndex(this.info.direction, this.info.leftDistance, this.info.firstLineKey, this.info.lastLineKey, this.info.leftDistanceArr);
            this.moveList();
            this.focus(1, info.isFromVol);
        },
        deActive: function () {
            this.blur();
        },
        createEl: function (menuIndex, moduleIndex) {
            var info = this.info;
            var moduleId = "m" + menuIndex + "m" + moduleIndex;
            if (pageInfo.module32Index) {
                info.playIndex = pageInfo.module32Index;
            }
            var data = homeAllData[menuIndex].subContent[moduleIndex].moduleContent;
            var sliceData = data.length && data.slice(0, Math.min(data.length, this.info.maxLen));
            sliceData.length && (info.data = sliceData.slice(0, sliceData.length - 1));
            sliceData.length && (info.rightData = sliceData.slice(-1));
            data = sliceData = null;

            var htmlTxt = '';
            var leftSrcTxt = info.data[info.playIndex].pics[info.picType[0]] || '';
            var leftWrap = '<div class="vodWindow noPlayer blocks block0" id="' + moduleId + 'm' + 0 + '"><img src="' + leftSrcTxt + '"></div>';
            var rightDes = info.rightData[0].contentName || '';
            var rightSrcTxt = info.rightData[0].pics[info.picType[1]] || '';
            var rightWrap = '<div class="blocks block2" id="' + moduleId + 'm' + 2 + '"><div class="images"><img src="' + rightSrcTxt + '"></div><div class="des">' + rightDes + '</div></div>';
            var middleWrap = '';
            var listTitle = '';
            var listSubTitle = '';
            if (!vodWindowInfo[menuIndex]) {
                vodWindowInfo[menuIndex] = {};
            }
            vodWindowInfo[menuIndex]["m" + menuIndex + "m" + moduleIndex] = {};

            $.UTIL.each(info.data, function (value, index) {
                listTitle = '';
                listSubTitle = '';
                if (value.contentName) {
                    if (/@/.test(value.contentName)) {
                        listTitle = value.contentName.split('@')[0];
                        listSubTitle = value.contentName.split('@')[1];
                        value.contentName.split('@')[2] && info.listIsPic.push(0);
                    } else {
                        listTitle = value.contentName;
                        info.listIsPic.push(1);
                    }
                }
                middleWrap += '<div class="lists list' + index + (index === info.playIndex ? ' current' : '') + '">' + '<div class="mainTitle">' + listTitle + '</div><div class="subTitles">' + listSubTitle + '</div>' + flashlightHtml + '</div>';
            })
            htmlTxt = leftWrap + '<div class="blocks block1" id="' + moduleId + 'm' + 1 + '"><div id="list_wrap">' + middleWrap + '</div></div>' + rightWrap;
            return htmlTxt;
        },
        loadService: function () {
            ;
        },
        left: function () {
            if (this.info.activeNum == 0) {
                return {
                    direction: "down",
                    leftDistance: 1e4,
                    id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                };
            } else {
                this.info.activeNum--;
            }
            this.focus();
            return false;
        },
        right: function () {
            if (this.info.activeNum === 2) {
                return {
                    direction: "down",
                    leftDistance: 0,
                    id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                };
            } else {
                this.info.activeNum++;
                this.focus();
                return false;
            }
        },
        up: function () {
            if (this.info.activeNum === 1 && this.info.moduleBegin > 0) {
                this.info.moduleBegin--;
                this.moveList();
                this.focus();
            } else {
                return {
                    direction: "up",
                    leftDistance: this.info.leftDistanceArr[this.info.activeNum]
                };
            }
        },
        down: function () {
            if (this.info.activeNum === 1 && this.info.moduleBegin + 1 < this.info.data.length) {
                this.info.moduleBegin++;
                this.moveList();
                this.focus();
            } else {
                return {
                    direction: "down",
                    leftDistance: this.info.leftDistanceArr[this.info.activeNum]
                };
            }

        },
        ok: function () {
            var nowData = null;
            if (this.info.activeNum === 2) {
                nowData = this.info.rightData[0];
                nowData.categoryId = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].categoryId;
            } else {
                if (this.info.activeNum === 1 && this.info.playIndex !== this.info.moduleBegin) {
                    this.info.playIndex = this.info.moduleBegin;
                    vodPlayer && vodPlayer.stop();
                    this.info.vodPlaying && (this.info.vodPlaying = false);
                    this.autoPlay(this.info.menuIndex, this.info.moduleIndex);
                    return;
                }
                nowData = this.info.data[this.info.moduleBegin];
                nowData.categoryId = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].categoryId;
            }
            $.gotoDetail(nowData);
        },
        moveList: function () {
            var list_begin = this.info.moduleBegin - this.info.list_fixed;
            var list_begin_length = this.info.data.length - this.info.list_fixed - 1;
            if (list_begin >= 0 && list_begin <= list_begin_length) {
                list_begin === list_begin_length && (list_begin = list_begin_length - 1);
                $("#list_wrap").css({
                    top: -list_begin * this.info.list_height + "px"
                })
            } else if (list_begin < 0) {
                $("#list_wrap").css({
                    top: 0
                })
            }
        },
        addCurrent: function () {
            var $infos = $('.lists', "#list_wrap", true);
            $infos.removeClass("current");
            $infos.item(this.info.playIndex).addClass("current");
        },
        showVodPic: function (menuIndex, moduleIndex) {
            var moduleId = "m" + menuIndex + "m" + moduleIndex;
            var $img = $("#" + moduleId + " .vodWindow img");
            var $vodWindow = $("#" + moduleId + " .vodWindow");
            var nowData = homeAllData[menuIndex].subContent[moduleIndex].moduleContent[this.info.playIndex];
            this.addCurrent();
            $img.attr({
                src: nowData && nowData.pics[this.info.picType[0]] || ''
            }).css({
                opacity: "1"
            });
            if(!$vodWindow.hasClass('noPlayer')){
                $vodWindow.addClass("noPlayer");
            }
        },
        playVod: function (menuIndex, moduleIndex) {
            var This = this;
            this.info.playTimer && clearTimeout(this.info.playTimer)
            this.info.playTimer = setTimeout(function () {
                !vodPlayer && (vodPlayer = initVl.apply(This, [menuIndex, moduleIndex]));
                vodPlayer.playBy({
                    val: This.info.playIndex
                });
            }, 1000);
        },
        autoPlay: function (menuIndex, moduleIndex) {
            if (this.info.vodPlaying) {
                return true;
            }
            this.stopAutoPlay();
            this.showVodPic(menuIndex, moduleIndex);
            var info = this.info;
            var This = this;
            var isPic = info.listIsPic[info.playIndex];
            if (isPic) {
                if (!info.listTimer) {
                    info.listTimer = setInterval(This.playNext.bind(This, menuIndex, moduleIndex), 4e3);
                }
            } else {
                this.playVod(menuIndex, moduleIndex);
            }
        },
        playNext(menuIndex, moduleIndex) {
            var info = this.info;
            if (info.playIndex === info.data.length - 1) {
                info.playIndex = 0;
            } else {
                info.playIndex++;
            }
            this.autoPlay(menuIndex, moduleIndex);
        },
        stopAutoPlay: function () {
            if (this.info.listTimer) {
                clearInterval(this.info.listTimer);
                this.info.listTimer = null;
            }
            if (this.info.playTimer) {
                clearTimeout(this.info.playTimer)
                this.info.playTimer = null;
            }
        },
        focus: function (isMove, isFromVol) {
            this.autoPlay(this.info.menuIndex, this.info.moduleIndex);
            if (this.info.activeNum === 1) {
                var findIndex = "list_wrap " + '.list' + this.info.moduleBegin;
                var nowId = findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                isMove && !isFromVol && setSectionTranslateY($.getElem(nowId), this.info.menuIndex)
                var focusHtml = {
                    el: "#" + findIndex,
                    marquee: ["#" + findIndex + " .mainTitle"]
                };
                $.focusTo(focusHtml)
            } else {
                focusTo(isMove, this.info.menuIndex, this.info.moduleIndex, this.info.activeNum);
            }
        },
        blur: function () {}
    },
    moduletj: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            elType: ["hor", "hor", "hor"],
            maxLen: 3,
            historyData: [],
            firstLineKey: [2, 3, 4, 5],
            lastLineKey: [2, 3, 4, 5],
            leftDistanceArr: [206, 206, 206, 649, 1091, 1534],
            data: [],
            saveActiveNum: undefined
        },
        active: function (info) {
            this.info.direction = info.direction;
            this.info.leftDistance = info.leftDistance;
            this.info.menuIndex = info.menuIndex;
            this.info.moduleIndex = info.moduleIndex;
            this.info.data = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].moduleContent;
            this.info.data && (this.info.data = this.info.data.slice(0, this.info.maxLen));
            if (info.activeNum && info.activeNum < 2) {
                this.info.activeNum = 2;
                this.info.saveActiveNum = info.activeNum;
            } else {
                this.info.activeNum = info.activeNum ? info.activeNum : findActiveIndex(this.info.direction, this.info.leftDistance, this.info.firstLineKey, this.info.lastLineKey, this.info.leftDistanceArr);
            }
            this.focus(1);
        },
        deActive: function () {},
        up: function () {
            switch (this.info.historyData.length) {
                case 0:
                    return {
                        direction: "up",
                            leftDistance: this.info.leftDistanceArr[this.info.activeNum]
                    };
                    break;

                case 1:
                    if ({
                            0: 1,
                            3: 1,
                            4: 1,
                            5: 1
                        } [this.info.activeNum]) {
                        return {
                            direction: "up",
                            leftDistance: this.info.leftDistanceArr[this.info.activeNum]
                        };
                    } else {
                        this.info.activeNum -= 2;
                        this.focus(1);
                    }
                    break;

                case 2:
                    if ({
                            0: 1,
                            3: 1,
                            4: 1,
                            5: 1
                        } [this.info.activeNum]) {
                        return {
                            direction: "up",
                            leftDistance: this.info.leftDistanceArr[this.info.activeNum]
                        };
                    } else {
                        this.info.activeNum -= 1;
                        this.focus(1);
                    }
                    break;
            }
            return false;
        },
        down: function () {
            switch (this.info.historyData.length) {
                case 0:
                    return {
                        direction: "down",
                            leftDistance: this.info.leftDistanceArr[this.info.activeNum]
                    };
                    break;

                case 1:
                    if ({
                            2: 1,
                            3: 1,
                            4: 1,
                            5: 1
                        } [this.info.activeNum]) {
                        return {
                            direction: "down",
                            leftDistance: this.info.leftDistanceArr[this.info.activeNum]
                        };
                    } else {
                        this.info.activeNum += 2;
                        this.focus(1);
                    }
                    break;

                case 2:
                    if ({
                            2: 1,
                            3: 1,
                            4: 1,
                            5: 1
                        } [this.info.activeNum]) {
                        return {
                            direction: "down",
                            leftDistance: this.info.leftDistanceArr[this.info.activeNum]
                        };
                    } else {
                        this.info.activeNum += 1;
                        this.focus(1);
                    }
                    break;
            }
            return false;
        },
        left: function () {
            switch (this.info.historyData.length) {
                case 0:
                    if ({
                            2: 1
                        } [this.info.activeNum]) {
                        return {
                            direction: "down",
                            leftDistance: 1e4,
                            id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                        };
                    } else {
                        this.info.activeNum -= 1;
                    }
                    break;

                case 1:
                    if ({
                            0: 1,
                            2: 1
                        } [this.info.activeNum]) {
                        return {
                            direction: "down",
                            leftDistance: 1e4,
                            id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                        };
                    } else {
                        this.info.activeNum -= {
                            3: 3
                        } [this.info.activeNum] || 1;
                    }
                    break;

                case 2:
                    if ({
                            0: 1,
                            1: 1,
                            2: 1
                        } [this.info.activeNum]) {
                        return {
                            direction: "down",
                            leftDistance: 1e4,
                            id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                        };
                    } else {
                        this.info.activeNum -= {
                            3: 3
                        } [this.info.activeNum] || 1;
                    }
                    break;
            }
            this.focus();
            return false;
        },
        right: function () {
            switch (this.info.historyData.length) {
                case 0:
                    if ({
                            5: 1
                        } [this.info.activeNum]) {
                        return {
                            direction: "down",
                            leftDistance: 0,
                            id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                        };
                    } else {
                        this.info.activeNum += 1;
                    }
                    break;

                case 1:
                    if ({
                            5: 1
                        } [this.info.activeNum]) {
                        return {
                            direction: "down",
                            leftDistance: 0,
                            id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                        };
                    } else {
                        this.info.activeNum += {
                            0: 3
                        } [this.info.activeNum] || 1;
                    }
                    break;

                case 2:
                    if ({
                            5: 1
                        } [this.info.activeNum]) {
                        return {
                            direction: "down",
                            leftDistance: 0,
                            id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                        };
                    } else {
                        this.info.activeNum += {
                            0: 3,
                            1: 2
                        } [this.info.activeNum] || 1;
                    }
                    break;
            }
            this.focus();
            return false;
        },
        ok: function () {
            switch (this.info.activeNum) {
                case 0:
                case 1:
                    $.gotoDetail({
                        contentType: this.info.historyData[this.info.activeNum].mediaType,
                        contentId: this.info.historyData[this.info.activeNum].mediaId,
                        categoryId: this.info.historyData[this.info.activeNum].categoryId
                    });
                    break;

                case 2:
                    $.gotoDetail($.urls.recent);
                    break;

                default:
                    var nowData = this.info.data[this.info.activeNum - 3];
                    nowData.categoryId = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].categoryId;
                    $.gotoDetail(nowData);
            }
        },
        loadService: function (menuIndex, moduleIndex) {
            var This = this;
            (function () {
                $.s.his.all({
                    pieceSize: 2
                }, {
                    success: function (data) {
                        var $aHistoryBlocks = null;
                        if (data.data && data.data.length) {
                            data.data.splice(2);
                            This.info.historyData = data.data;
                            $aHistoryBlocks = $(".historyBlocks", "#m" + menuIndex + "m" + moduleIndex, true);
                            if (data.data.length === 1) {
                                This.info.firstLineKey = [0, 3, 4, 5];
                                $aHistoryBlocks.item(0).html('<div class="recordName">' + data.data[0].name + "</div>" + '<div class="record">' + doRecord(data.data[0]) + "</div>" + flashlightHtml);
                                $aHistoryBlocks.addClass("two");
                            } else if (data.data.length > 1) {
                                This.info.firstLineKey = [0, 3, 4, 5];
                                $aHistoryBlocks.item(0).html('<div class="recordName">' + data.data[0].name + "</div>" + '<div class="record">' + doRecord(data.data[0]) + "</div>" + flashlightHtml);
                                $aHistoryBlocks.item(1).html('<div class="recordName">' + data.data[1].name + "</div>" + '<div class="record">' + doRecord(data.data[1]) + "</div>" + flashlightHtml);
                                $aHistoryBlocks.addClass("three");
                            }
                        }
                        var p_moduleInfo = $.pTool.get("p_module").getInfo();
                        if (p_moduleInfo.subIndex === menuIndex && p_moduleInfo.moduleIndex === moduleIndex && p_moduleInfo.type === "moduletj") {
                            if (This.info.historyData.length > 0 && typeof This.info.saveActiveNum === "number") {
                                var saveActiveNum = This.info.saveActiveNum;
                                if (saveActiveNum > This.info.historyData.length - 1) {
                                    saveActiveNum = This.info.historyData.length - 1;
                                }
                                This.info.activeNum = saveActiveNum;
                                if (!userRights.isShow()) {
                                    $.focusTo({
                                        el: "#m" + menuIndex + "m" + moduleIndex + "m" + saveActiveNum,
                                        marquee: ["#m" + menuIndex + "m" + moduleIndex + "m" + saveActiveNum + " .recordName"]
                                    });
                                }
                            }
                        }
                    },
                    error: function () {}
                });
            })(menuIndex, moduleIndex);
        },
        createEl: function (menuIndex, moduleIndex) {
            var html = "";
            var data = homeAllData[menuIndex].subContent[moduleIndex].moduleContent;
            var vipCorner = "";
            data && (data = data.slice(0, this.info.maxLen));
            for (var i = 0; i < data.length + 3; i++) {
                if (i < 3) {
                    html += '<div class="historyBlocks block' + i + '" id="m' + menuIndex + "m" + moduleIndex + "m" + i + '">' + (i === 2 ? "全部观看历史" : "") + flashlightHtml + "</div>";
                } else {
                    vipCorner = "";
                    var iType = this.info.elType && this.info.elType[i - 3] || "";
                    html += '<div pictype="66" class="' + iType + " blocks block" + i + '" id="m' + menuIndex + "m" + moduleIndex + "m" + i + '">' + '<div class="images"><img></div>' + '<div class="episode"></div>' + '<div class="contentTitle hide"></div>' + vipCorner + flashlightHtml + "</div>";
                }
            }
            return html;
        },
        focus: function (isMove) {
            focusTo(isMove, this.info.menuIndex, this.info.moduleIndex, this.info.activeNum, this.info.activeNum > 2 ? "" : "recordName");
        },
        blur: function () {}
    },
    modulerecent: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            maxLen: 6,
            firstLineKey: [0],
            lastLineKey: [0],
            historyData: [],
            saveActiveNum: 0,
            leftDistanceArr: [133, 428, 723, 1018, 1313, 1608],
            data: []
        },
        active: function (info) {
            this.info.direction = info.direction;
            this.info.leftDistance = info.leftDistance;
            this.info.menuIndex = info.menuIndex;
            this.info.moduleIndex = info.moduleIndex;
            this.info.data = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].moduleContent;
            this.info.data && (this.info.data = this.info.data.slice(0, this.info.maxLen));
            if (info.activeNum) {
                this.info.activeNum = 0;
                this.info.saveActiveNum = info.activeNum;
            } else {
                this.info.activeNum = findActiveIndex(this.info.direction, this.info.leftDistance, this.info.firstLineKey, this.info.lastLineKey, this.info.leftDistanceArr);
            }
            this.focus(1);
        },
        deActive: function () {},
        up: function () {
            return {
                direction: "up",
                leftDistance: this.info.leftDistanceArr[this.info.activeNum]
            };
        },
        down: function () {
            return {
                direction: "down",
                leftDistance: this.info.leftDistanceArr[this.info.activeNum]
            };
        },
        left: function () {
            if (this.info.activeNum === 0) {
                return {
                    direction: "down",
                    leftDistance: 1e4,
                    id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                };
            } else {
                this.info.activeNum--;
                this.focus();
                return false;
            }
        },
        right: function () {
            if (this.info.activeNum === this.info.historyData.length) {
                return {
                    direction: "down",
                    leftDistance: 0,
                    id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                };
            } else {
                this.info.activeNum++;
                this.focus();
                return false;
            }
        },
        ok: function () {
            if (this.info.activeNum === this.info.historyData.length) {
                $.gotoDetail($.urls.recent);
                return;
            }
            $.gotoDetail({
                contentType: this.info.historyData[this.info.activeNum].mediaType,
                contentId: this.info.historyData[this.info.activeNum].mediaId,
                categoryId: this.info.historyData[this.info.activeNum].categoryId
            });
        },
        loadService: function (menuIndex, moduleIndex) {
            var This = this;
            $.s.his.all({
                pieceSize: 5
            }, {
                success: function (data) {
                    var parentEl = $("#m" + menuIndex + "m" + moduleIndex + " .blockWrap");
                    var htmlTxt = "";
                    if (data.data && data.data.length) {
                        data.data.splice(5);
                        This.info.historyData = data.data;
                        This.info.firstLineKey = [];
                        This.info.lastLineKey = [];
                        $.UTIL.each(This.info.historyData, function (value, index) {
                            This.info.firstLineKey.push(index);
                            This.info.lastLineKey.push(index);
                            htmlTxt += '<div class="ver recent block' + index + '" id="m' + menuIndex + "m" + moduleIndex + "m" + index + '">' + '<div class="images"><img src="' + $.getPic(value.picInfos, [102], {
                                picType: "type",
                                picPath: "url"
                            }) + '"></div>' + '<div class="contentTitle">' + value.name + "</div>" + '<div class="upDataInfo">' + doRecord(value) + "</div>" + flashlightHtml + "</div>";
                        });
                    }
                    This.info.firstLineKey.push(This.info.historyData.length);
                    This.info.lastLineKey.push(This.info.historyData.length);
                    htmlTxt += '<div class="' + (This.info.historyData.length > 0 ? "hasHistory" : "") + " ver recentEntrance recent block" + This.info.historyData.length + '" id="m' + menuIndex + "m" + moduleIndex + "m" + This.info.historyData.length + '">' + flashlightHtml + "</div>";
                    parentEl.html(htmlTxt);
                    var p_moduleInfo = $.pTool.get("p_module").getInfo();
                    if (p_moduleInfo.subIndex === menuIndex && p_moduleInfo.moduleIndex === moduleIndex && p_moduleInfo.type === "modulerecent") {
                        var saveActiveNum = This.info.saveActiveNum;
                        if (saveActiveNum > This.info.historyData.length) {
                            saveActiveNum = This.info.historyData.length;
                        }
                        This.info.activeNum = saveActiveNum;
                        if (!userRights.isShow()) {
                            $.focusTo({
                                el: "#m" + menuIndex + "m" + moduleIndex + "m" + saveActiveNum,
                                marquee: ["#m" + menuIndex + "m" + moduleIndex + "m" + saveActiveNum + " .contentTitle"]
                            });
                        }
                    }
                },
                error: function () {}
            });
        },
        createEl: function (menuIndex, moduleIndex) {
            var html = '<div class="ver recentEntrance recent block0" id="m' + menuIndex + "m" + moduleIndex + 'm0">' + flashlightHtml + "</div>";
            return html;
        },
        focus: function (isMove) {
            focusTo(isMove, this.info.menuIndex, this.info.moduleIndex, this.info.activeNum);
        },
        blur: function () {}
    },
    modulevfav: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            maxLen: 6,
            firstLineKey: [0],
            lastLineKey: [0],
            vfavData: [],
            saveActiveNum: 0,
            leftDistanceArr: [133, 428, 723, 1018, 1313, 1608],
            data: []
        },
        active: function (info) {
            this.info.direction = info.direction;
            this.info.leftDistance = info.leftDistance;
            this.info.menuIndex = info.menuIndex;
            this.info.moduleIndex = info.moduleIndex;
            this.info.data = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].moduleContent;
            this.info.data && (this.info.data = this.info.data.slice(0, this.info.maxLen));
            if (info.activeNum) {
                this.info.activeNum = 0;
                this.info.saveActiveNum = info.activeNum;
            } else {
                this.info.activeNum = findActiveIndex(this.info.direction, this.info.leftDistance, this.info.firstLineKey, this.info.lastLineKey, this.info.leftDistanceArr);
            }
            this.focus(1);
        },
        deActive: function () {},
        up: function () {
            return {
                direction: "up",
                leftDistance: this.info.leftDistanceArr[this.info.activeNum]
            };
        },
        down: function () {
            return {
                direction: "down",
                leftDistance: this.info.leftDistanceArr[this.info.activeNum]
            };
        },
        left: function () {
            if (this.info.activeNum === 0) {
                return {
                    direction: "down",
                    leftDistance: 1e4,
                    id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                };
            } else {
                this.info.activeNum--;
                this.focus();
                return false;
            }
        },
        right: function () {
            if (this.info.activeNum === this.info.vfavData.length) {
                return {
                    direction: "down",
                    leftDistance: 0,
                    id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                };
            } else {
                this.info.activeNum++;
                this.focus();
                return false;
            }
        },
        ok: function () {
            if (this.info.activeNum === this.info.vfavData.length) {
                $.gotoDetail($.urls.favv);
                return;
            }
            $.gotoDetail({
                contentType: this.info.vfavData[this.info.activeNum].mediaType,
                contentId: this.info.vfavData[this.info.activeNum].mediaId,
                categoryId: this.info.vfavData[this.info.activeNum].categoryId
            });
        },
        loadService: function (menuIndex, moduleIndex) {
            var This = this;
            $.s.fav.all({
                pieceSize: 5
            }, {
                success: function (data) {
                    var parentEl = $("#m" + menuIndex + "m" + moduleIndex + " .blockWrap");
                    var htmlTxt = "";
                    if (data.data && data.data.length) {
                        data.data.splice(5);
                        This.info.vfavData = data.data;
                        This.info.firstLineKey = [];
                        This.info.lastLineKey = [];
                        $.UTIL.each(This.info.vfavData, function (value, index) {
                            This.info.firstLineKey.push(index);
                            This.info.lastLineKey.push(index);
                            htmlTxt += '<div class="ver vfav block' + index + '" id="m' + menuIndex + "m" + moduleIndex + "m" + index + '">' + '<div class="images"><img src="' + $.getPic(value.picInfos, [102], {
                                picType: "type",
                                picPath: "url"
                            }) + '"></div>' + '<div class="contentTitle">' + value.name + "</div>" + flashlightHtml + "</div>";
                        });
                    }
                    This.info.firstLineKey.push(This.info.vfavData.length);
                    This.info.lastLineKey.push(This.info.vfavData.length);
                    htmlTxt += '<div class="' + (This.info.vfavData.length > 0 ? "hasvfav" : "") + " ver vfavEntrance vfav block" + This.info.vfavData.length + '" id="m' + menuIndex + "m" + moduleIndex + "m" + This.info.vfavData.length + '">' + flashlightHtml + "</div>";
                    parentEl.html(htmlTxt);
                    var p_moduleInfo = $.pTool.get("p_module").getInfo();
                    if (p_moduleInfo.subIndex === menuIndex && p_moduleInfo.moduleIndex === moduleIndex && p_moduleInfo.type === "modulevfav") {
                        var saveActiveNum = This.info.saveActiveNum;
                        if (saveActiveNum > This.info.vfavData.length) {
                            saveActiveNum = This.info.vfavData.length;
                        }
                        This.info.activeNum = saveActiveNum;
                        if (!userRights.isShow()) {
                            $.focusTo({
                                el: "#m" + menuIndex + "m" + moduleIndex + "m" + saveActiveNum,
                                marquee: ["#m" + menuIndex + "m" + moduleIndex + "m" + saveActiveNum + " .contentTitle"]
                            });
                        }
                    }
                },
                error: function () {}
            });
        },
        createEl: function (menuIndex, moduleIndex) {
            var html = '<div class="ver vfavEntrance vfav block0" id="m' + menuIndex + "m" + moduleIndex + 'm0">' + flashlightHtml + "</div>";
            return html;
        },
        focus: function (isMove) {
            focusTo(isMove, this.info.menuIndex, this.info.moduleIndex, this.info.activeNum);
        },
        blur: function () {}
    },
    modulecfav: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            maxLen: 6,
            firstLineKey: [0],
            lastLineKey: [0],
            cfavData: [],
            saveActiveNum: 0,
            leftDistanceArr: [133, 428, 723, 1018, 1313, 1608],
            data: []
        },
        active: function (info) {
            this.info.direction = info.direction;
            this.info.leftDistance = info.leftDistance;
            this.info.menuIndex = info.menuIndex;
            this.info.moduleIndex = info.moduleIndex;
            this.info.data = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].moduleContent;
            this.info.data && (this.info.data = this.info.data.slice(0, this.info.maxLen));
            if (info.activeNum) {
                this.info.activeNum = 0;
                this.info.saveActiveNum = info.activeNum;
            } else {
                this.info.activeNum = findActiveIndex(this.info.direction, this.info.leftDistance, this.info.firstLineKey, this.info.lastLineKey, this.info.leftDistanceArr);
            }
            this.focus(1);
        },
        deActive: function () {},
        up: function () {
            return {
                direction: "up",
                leftDistance: this.info.leftDistanceArr[this.info.activeNum]
            };
        },
        down: function () {
            return {
                direction: "down",
                leftDistance: this.info.leftDistanceArr[this.info.activeNum]
            };
        },
        left: function () {
            if (this.info.activeNum === 0) {
                return {
                    direction: "down",
                    leftDistance: 1e4,
                    id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                };
            } else {
                this.info.activeNum--;
                this.focus();
                return false;
            }
        },
        right: function () {
            if (this.info.activeNum === this.info.cfavData.length) {
                return {
                    direction: "down",
                    leftDistance: 0,
                    id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                };
            } else {
                this.info.activeNum++;
                this.focus();
                return false;
            }
        },
        ok: function () {
            if (this.info.activeNum === this.info.cfavData.length) {
                $.gotoDetail($.urls.favc);
            } else {
                $.playLiveOrRec({
                    channelId: this.info.cfavData[this.info.activeNum].channelId
                });
            }
        },
        loadService: function (menuIndex, moduleIndex) {
            var This = this;
            $.s.chanfav.all(null, {
                success: function (data) {
                    var parentEl = $("#m" + menuIndex + "m" + moduleIndex + " .blockWrap");
                    var htmlTxt = "";
                    if (data && data.data && data.data.length) {
                        data.data = data.data.slice(0, 5);
                        This.info.cfavData = data.data;
                        This.info.firstLineKey = [];
                        This.info.lastLineKey = [];
                        $.UTIL.each(This.info.cfavData, function (value, index) {
                            This.info.firstLineKey.push(index);
                            This.info.lastLineKey.push(index);
                            var vipFlagTxt = "";
                            if ($.isVipChan(value.num)) {
                                vipFlagTxt = '<div class="vipCorner2"></div>';
                            }
                            htmlTxt += '<div class="cfav block' + index + '" id="m' + menuIndex + "m" + moduleIndex + "m" + index + '">' + '<div class="channelNum">' + value.num + "</div>" + '<div class="channelName" style="visibility:visible;">' + value.name + "</div>" + vipFlagTxt + flashlightHtml + "</div>";
                        });
                    }
                    This.info.firstLineKey.push(This.info.cfavData.length);
                    This.info.lastLineKey.push(This.info.cfavData.length);
                    htmlTxt += '<div class="' + (This.info.cfavData.length > 0 ? "" : "nocfav ") + "cfav block" + This.info.cfavData.length + '" id="m' + menuIndex + "m" + moduleIndex + "m" + This.info.cfavData.length + '">' + (This.info.cfavData.length > 0 ? "全部直播收藏" : "暂无直播收藏") + flashlightHtml + "</div>";
                    parentEl.html(htmlTxt);
                    var p_moduleInfo = $.pTool.get("p_module").getInfo();
                    if (p_moduleInfo.subIndex === menuIndex && p_moduleInfo.moduleIndex === moduleIndex && p_moduleInfo.type === "modulecfav") {
                        var saveActiveNum = This.info.saveActiveNum;
                        if (saveActiveNum > This.info.cfavData.length) {
                            saveActiveNum = This.info.cfavData.length;
                        }
                        This.info.activeNum = saveActiveNum;
                        if (!userRights.isShow()) {
                            $.focusTo({
                                el: "#m" + menuIndex + "m" + moduleIndex + "m" + saveActiveNum,
                                marquee: ["#m" + menuIndex + "m" + moduleIndex + "m" + saveActiveNum + " .channelName"]
                            });
                        }
                    }
                },
                error: function () {}
            });
        },
        createEl: function (menuIndex, moduleIndex) {
            var html = '<div class="nocfav cfav block0" id="m' + menuIndex + "m" + moduleIndex + 'm0">暂无直播收藏' + flashlightHtml + "</div>";
            return html;
        },
        focus: function (isMove) {
            focusTo(isMove, this.info.menuIndex, this.info.moduleIndex, this.info.activeNum, "channelName");
        },
        blur: function () {}
    },
    modulereserve: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            maxLen: 4,
            firstLineKey: [0],
            lastLineKey: [0],
            reserveData: [],
            saveActiveNum: 0,
            leftDistanceArr: [206, 649, 1091, 1534],
            data: []
        },
        active: function (info) {
            this.info.direction = info.direction;
            this.info.leftDistance = info.leftDistance;
            this.info.menuIndex = info.menuIndex;
            this.info.moduleIndex = info.moduleIndex;
            this.info.data = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].moduleContent;
            this.info.data && (this.info.data = this.info.data.slice(0, this.info.maxLen));
            if (info.activeNum) {
                this.info.activeNum = 0;
                this.info.saveActiveNum = info.activeNum;
            } else {
                this.info.activeNum = findActiveIndex(this.info.direction, this.info.leftDistance, this.info.firstLineKey, this.info.lastLineKey, this.info.leftDistanceArr);
            }
            this.focus(1);
        },
        deActive: function () {},
        up: function () {
            return {
                direction: "up",
                leftDistance: this.info.leftDistanceArr[this.info.activeNum]
            };
        },
        down: function () {
            return {
                direction: "down",
                leftDistance: this.info.leftDistanceArr[this.info.activeNum]
            };
        },
        left: function () {
            if (this.info.activeNum === 0) {
                return {
                    direction: "down",
                    leftDistance: 1e4,
                    id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                };
            } else {
                this.info.activeNum--;
                this.focus();
                return false;
            }
        },
        right: function () {
            if (this.info.activeNum === this.info.reserveData.length) {
                return {
                    direction: "down",
                    leftDistance: 0,
                    id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                };
            } else {
                this.info.activeNum++;
                this.focus();
                return false;
            }
        },
        ok: function () {
            if (this.info.activeNum === this.info.reserveData.length) {
                $.gotoDetail($.urls.reserve);
            } else {
                $.playLiveOrRec({
                    channelId: this.info.reserveData[this.info.activeNum].channelId.channelId
                });
            }
        },
        loadService: function (menuIndex, moduleIndex) {
            var This = this;
            $.reserve.all(function (data) {
                var parentEl = $("#m" + menuIndex + "m" + moduleIndex + " .blockWrap");
                var htmlTxt = "";
                if (data && data.data && data.data.length) {
                    data.data.splice(This.info.maxLen - 1);
                    This.info.reserveData = data.data;
                    This.info.firstLineKey = [];
                    This.info.lastLineKey = [];
                    $.UTIL.each(This.info.reserveData, function (value, index) {
                        This.info.firstLineKey.push(index);
                        This.info.lastLineKey.push(index);
                        var vipFlagTxt = "";
                        if ($.isVipChan(value.channelId.num)) {
                            vipFlagTxt = '<div class="vipCorner2"></div>';
                        }
                        htmlTxt += '<div class="reserve block' + index + '" id="m' + menuIndex + "m" + moduleIndex + "m" + index + '">' + '<div class="channelName" style="visibility:visible;">' + value.channelId.num + " " + value.channelId.name + "</div>" + '<div class="liveTime">' + new $.Date().parse(value.startTime, "yyyyMMddhhmm").format("MM月dd日 hh:mm") + "</div>" + '<div class="liveName">' + value.program + "</div>" + vipFlagTxt + flashlightHtml + "</div>";
                    });
                }
                This.info.firstLineKey.push(This.info.reserveData.length);
                This.info.lastLineKey.push(This.info.reserveData.length);
                htmlTxt += '<div class="' + (This.info.reserveData.length > 0 ? "hasreserve" : "noreserve") + " reserve block" + This.info.reserveData.length + '" id="m' + menuIndex + "m" + moduleIndex + "m" + This.info.reserveData.length + '">' + flashlightHtml + "</div>";
                parentEl.html(htmlTxt);
                var p_moduleInfo = $.pTool.get("p_module").getInfo();
                if (p_moduleInfo.subIndex === menuIndex && p_moduleInfo.moduleIndex === moduleIndex && p_moduleInfo.type === "modulereserve") {
                    var saveActiveNum = This.info.saveActiveNum;
                    if (saveActiveNum > This.info.reserveData.length) {
                        saveActiveNum = This.info.reserveData.length;
                    }
                    This.info.activeNum = saveActiveNum;
                    if (!userRights.isShow()) {
                        $.focusTo({
                            el: "#m" + menuIndex + "m" + moduleIndex + "m" + saveActiveNum,
                            marquee: ["#m" + menuIndex + "m" + moduleIndex + "m" + saveActiveNum + " .liveName"]
                        });
                    }
                }
            });
        },
        createEl: function (menuIndex, moduleIndex) {
            var html = '<div class="noreserve reserve block0" id="m' + menuIndex + "m" + moduleIndex + 'm0">' + flashlightHtml + "</div>";
            return html;
        },
        focus: function (isMove) {
            focusTo(isMove, this.info.menuIndex, this.info.moduleIndex, this.info.activeNum, "liveName");
        },
        blur: function () {}
    },
    modulemyOrder: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            maxLen1: 4,
            maxLen2: 5,
            len1: 5,
            len2: 6,
            firstLineKey: [0],
            lastLineKey: [5],
            packageData: [],
            simpleData: [],
            saveActiveNum: 0,
            leftDistanceArr: [138, 504, 870, 1236, 1602, 133, 428, 723, 1018, 1313, 1608],
            isNoSfbData: false,
            isNoDpData: false
        },
        active: function (info) {
            this.info.direction = info.direction;
            this.info.leftDistance = info.leftDistance;
            this.info.menuIndex = info.menuIndex;
            this.info.moduleIndex = info.moduleIndex;
            if (info.activeNum) {
                if (info.activeNum < this.info.len1) {
                    this.info.activeNum = 0;
                } else {
                    this.info.activeNum = this.info.len1;
                }
                this.info.saveActiveNum = info.activeNum;
            } else {
                this.info.activeNum = findActiveIndex(this.info.direction, this.info.leftDistance, this.info.firstLineKey, this.info.lastLineKey, this.info.leftDistanceArr);
            }
            this.focus(1);
        },
        deActive: function () {},
        up: function () {
            if (this.info.activeNum < this.info.len1) {
                return {
                    direction: "up",
                    leftDistance: this.info.leftDistanceArr[this.info.activeNum]
                };
            } else {
                if (this.info.activeNum > 7) {
                    this.info.activeNum -= this.info.len1 + 1;
                } else {
                    this.info.activeNum -= this.info.len1;
                }
                if (this.info.activeNum > this.info.firstLineKey.length - 1) {
                    this.info.activeNum = this.info.firstLineKey.length - 1;
                }
                this.focus(1);
                return false;
            }
        },
        down: function () {
            if (this.info.activeNum > this.info.len1 - 1) {
                return {
                    direction: "down",
                    leftDistance: this.info.leftDistanceArr[this.info.activeNum]
                };
            } else {
                if (this.info.activeNum < 3) {
                    this.info.activeNum += this.info.len1;
                } else {
                    this.info.activeNum += this.info.len1 + 1;
                }
                if (this.info.activeNum > this.info.len1 + this.info.lastLineKey.length - 1) {
                    this.info.activeNum = this.info.len1 + this.info.lastLineKey.length - 1;
                }
                this.focus(1);
                return false;
            }
        },
        left: function () {
            if (this.info.activeNum === 0 || this.info.activeNum === this.info.len1) {
                return {
                    direction: "down",
                    leftDistance: 1e4,
                    id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                };
            } else {
                this.info.activeNum--;
                this.focus();
                return false;
            }
        },
        right: function () {
            var activeNum = this.info.activeNum;
            var firstLineKeyLength = this.info.firstLineKey.length;
            var lastLineKeyLength = this.info.lastLineKey.length;
            if (activeNum === firstLineKeyLength - 1 || activeNum === this.info.len1 + lastLineKeyLength - 1) {
                return {
                    direction: "down",
                    leftDistance: 0,
                    id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                };
            } else {
                this.info.activeNum++;
                this.focus();
                return false;
            }
        },
        ok: function () {
            var index = 0;
            if (index = this.info.activeNum > this.info.maxLen1 ? this.info.activeNum - (this.info.maxLen1 + 1) : this.info.activeNum, this.info.isNoSfbData && 1 === this.info.activeNum) {
                return $.gotoDetail({
                    contentType: "7",
                    contentUri: "menu://VIPDY.0"
                })
            }
            if (this.info.isNoDpData && 6 === this.info.activeNum) {
                return $.gotoDetail({
                    contentType: "7",
                    contentUri: "menu://VIPDY.0"
                });
            }
            if (this.info.activeNum === this.info.packageData.length) {
                $.gotoDetail($.urls.orderSfb);
            } else if (this.info.activeNum === this.info.len1 + this.info.simpleData.length) {
                $.gotoDetail($.urls.orderDp);
            } else {
                if (this.info.activeNum < this.info.len1) {
                    var contentUrl = $.auth.getPkgInfo(this.info.packageData[this.info.activeNum].productId).url;
                    if (/{{.*}}/.test(contentUrl)) {
                        $.gotoDetail(contentUrl);
                    } else {
                        $.gotoDetail({
                            url: contentUrl,
                            contentType: "7"
                        });
                    }
                } else {
                    var nowData = this.info.simpleData[this.info.activeNum - this.info.len1];
                    var isJw = $.auth.jw.isJW(nowData.productId);
                    if (isJw) {
                        $.auth.jw.gotoJW();
                    } else {
                        $.gotoDetail({
                            contentType: "0",
                            contentId: nowData.contentId,
                            categoryId: nowData.columnId
                        });
                    }
                }
            }
        },
        loadService: function (menuIndex, moduleIndex) {
            var This = this;
            $.auth.queryOrderInfo(function (code, res) {
                if (code !== 0) {
                    var parentEl = $("#m" + menuIndex + "m" + moduleIndex + " .blockWrap");
                    var htmlTxt = "";
                    This.info.packageData = filteData(res.package);
                    This.info.packageData.splice(This.info.maxLen1);
                    This.info.firstLineKey = [];
                    $.UTIL.each(This.info.packageData, function (value, index) {
                        var pkgInfo = $.auth.getPkgInfo(value.productId);
                        This.info.firstLineKey.push(index);
                        var cue = value.tzInfo ? '套装' + "<span>" + value.tzPrice + '</span>元' : value.fee ? "<span>" + value.fee / 100 + "</span>元/" + $.auth.getPidUnit(value.cycleType) : '<span class="act">激活日期 :</span><span class="time">' + value.payTime.slice(0, 10) + '</span>';
                        htmlTxt += '<div class="myOrder package block' + index + '" id="m' + menuIndex + "m" + moduleIndex + "m" + index + '">' + '<div class="orderName"><img src="' + pkgInfo.picPath + '"></div><div class="price">' + cue + '</div><div class="endTime">' + (value.status == 0 ? "已过期" : "有效期至 : " + value.endTime.split(" ")[0]) + "</div>" + flashlightHtml + "</div>";
                    });
                    This.info.packageData.length ? This.info.firstLineKey.push(This.info.packageData.length) : (This.info.isNoSfbData = true, This.info.leftDistanceArr[1] = 1644, This.info.firstLineKey = [0, 1], htmlTxt += '<div class="packageCue noDataCue">还没有订购过任何内容，快去订购喜欢的内容吧</div><div class="packageBtn noDataBtn" id="m' + menuIndex + "m" + moduleIndex + 'm1">去订购</div>')
                    htmlTxt += '<div class="' + (This.info.packageData.length > 0 ? "hasorder" : "noorder") + " myOrderEntrance myOrder package block" + This.info.packageData.length + '" id="m' + menuIndex + "m" + moduleIndex + "m" + This.info.packageData.length + '">' + flashlightHtml + "</div>";
                    This.info.simpleData = filteData(res.simple);
                    This.info.simpleData.splice(This.info.maxLen2);
                    This.info.lastLineKey = [];
                    for (var i = This.info.len1, j = 0; i < This.info.len1 + This.info.simpleData.length; i++,
                        j++) {
                        This.info.lastLineKey.push(i);
                        var value = This.info.simpleData[j];
                        var isJw = $.auth.jw.isJW(value.productId);
                        var endTimeTxt = "有效期至 : " + value.endTime.split(" ")[0];
                        if (value.status == 0) {
                            endTimeTxt = "已过期";
                        } else {
                            if (isJw) {
                                endTimeTxt = "本场直播结束";
                            }
                        }
                        var srcTxt = "";
                        if (isJw) {
                            srcTxt = ' src="' + $.auth.jw.detailInfo.pic + '"';
                        }
                        htmlTxt += '<div class="myOrder ver simple block' + i + '" id="m' + menuIndex + "m" + moduleIndex + "m" + i + '">' + '<div class="orderName"><img' + srcTxt + "></div>" + '<div class="price"><span>' + value.fee / 100 + "</span>元/" + (isJw ? "" : "<span>72</span>小时") + "</div>" + '<div class="endTime">' + endTimeTxt + "</div>" + '<div class="contentTitle">' + (value.vodName || '') + "</div>" + flashlightHtml + "</div>";
                    }

                    This.info.simpleData.length ? This.info.lastLineKey.push(This.info.len1 + This.info.simpleData.length) : (This.info.isNoDpData = true, This.info.leftDistanceArr[6] = 1644, This.info.lastLineKey = [5, 6], htmlTxt += '<div class="simpleCue noDataCue">还没有订购过任何内容，快去订购喜欢的内容吧</div><div class="simpleBtn noDataBtn" id="m' + menuIndex + "m" + moduleIndex + 'm6">去订购</div>')
                    htmlTxt += '<div class="' + (This.info.simpleData.length > 0 ? "hasorder" : "noorder") + " myOrderEntrance myOrder simple block" + (This.info.len1 + This.info.simpleData.length) + '" id="m' + menuIndex + "m" + moduleIndex + "m" + (This.info.len1 + This.info.simpleData.length) + '">' + flashlightHtml + "</div>";
                    htmlTxt += '<div class="packageTitle">•收费包</div><div class="simpleTitle">•单片</div>';
                    parentEl.html(htmlTxt);
                    $.UTIL.each(This.info.simpleData, function (value, index) {
                        (function (value, index) {
                            if ($.auth.jw.isJW(value.productId)) {
                                return;
                            }
                            $.s.detail.get({
                                id: value.contentId
                            }, {
                                success: function (data) {
                                    parentEl.find(".simple .orderName img").item(index).attr({
                                        src: "/pic/" + data.vodPicMap[6]
                                    });
                                }
                            });
                        })(value, index);
                    });
                    var p_moduleInfo = $.pTool.get("p_module").getInfo();
                    if (p_moduleInfo.subIndex === menuIndex && p_moduleInfo.moduleIndex === moduleIndex && p_moduleInfo.type === "modulemyOrder") {
                        var saveActiveNum = This.info.saveActiveNum;
                        if (saveActiveNum < This.info.len1) {
                            if (saveActiveNum > This.info.packageData.length) {
                                saveActiveNum = This.info.packageData.length + This.info.isNoSfbData;
                            }
                        } else {
                            if (saveActiveNum > This.info.len1 + This.info.simpleData.length) {
                                saveActiveNum = This.info.len1 + This.info.simpleData.length + This.info.isNoDpData;
                            }
                        }
                        This.info.activeNum = saveActiveNum;
                        if (!userRights.isShow()) {
                            This.focus(false)
                        }
                    }
                }
            });

            function filteData(arr) {
                var out0 = [],
                    out1 = [],
                    out2 = [],
                    out3 = [];
                for (var i in arr) {
                    if (arr[i].status == 0) {
                        out1.push(arr[i]);
                    } else {
                        out0.push(arr[i]);
                    }
                }
                out0.sort(function (a, b) {
                    return getTime(b.payTime) - getTime(a.payTime);
                });
                out1.sort(function (a, b) {
                    return getTime(b.payTime) - getTime(a.payTime);
                });
                for (var i in out0) {
                    if (out0[i].continueType == 1 || out0[i].orderChannel != "1") {
                        out2.push(out0[i]);
                    } else {
                        out3.push(out0[i]);
                    }
                }
                return out2.concat(out3).concat(out1);
            }

            function getTime(str) {
                return new Date(str).getTime();
            }
        },
        createEl: function (menuIndex, moduleIndex) {
            var div = '<div class="myOrderEntrance noorder myOrder %s block%s" id="m' + menuIndex + "m" + moduleIndex + 'm%s">' + flashlightHtml + "</div>";
            var html = $.Tps(div, "package", "0", "0") + $.Tps(div, "simple", "5", "5");
            html += '<div class="packageTitle">•收费包</div><div class="simpleTitle">•单片</div>';
            return html;
        },
        focus: function (isMove) {
            focusTo(isMove, this.info.menuIndex, this.info.moduleIndex, this.info.activeNum);
        },
        blur: function () {}
    },
    // 我的优惠券模块
    modulemyCoupon: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            maxLen: 4,
            firstLineKey: [0],
            lastLineKey: [0],
            myCouponData: [],
            saveActiveNum: 0,
            leftDistanceArr: [206, 649, 1091, 1534]
        },
        active: function (info) {
            this.info.direction = info.direction;
            this.info.leftDistance = info.leftDistance;
            this.info.menuIndex = info.menuIndex;
            this.info.moduleIndex = info.moduleIndex;
            if (info.activeNum) {
                !info.isFromVol && (this.info.activeNum = 0);
                this.info.saveActiveNum = info.activeNum;
            } else {
                this.info.activeNum = findActiveIndex(this.info.direction, this.info.leftDistance, this.info.firstLineKey, this.info.lastLineKey, this.info.leftDistanceArr);
            }
            this.focus(1);
        },
        deActive: function () {},
        up: function () {
            return {
                direction: "up",
                leftDistance: this.info.leftDistanceArr[this.info.activeNum]
            };
        },
        down: function () {
            return {
                direction: "down",
                leftDistance: this.info.leftDistanceArr[this.info.activeNum]
            };
        },
        left: function () {
            if (this.info.activeNum === 0) {
                return {
                    direction: "down",
                    leftDistance: 1e4,
                    id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                };
            } else {
                this.info.activeNum--;
                this.focus();
                return false;
            }
        },
        right: function () {
            if (this.info.activeNum === this.info.myCouponData.length) {
                return {
                    direction: "down",
                    leftDistance: 0,
                    id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                };
            } else {
                this.info.activeNum++;
                this.focus();
                return false;
            }
        },
        ok: function () {
            if (this.info.activeNum === this.info.myCouponData.length) {
                $.gotoDetail($.urls.couponNouse);
            } else {
                if (this.info.myCouponData[this.info.activeNum].cstatus === '1') {
                    if (this.info.myCouponData[this.info.activeNum].ctype === 1) {
                        function anginRender() {
                            modules.modulemyCoupon.loadService(this.info.menuIndex, this.info.moduleIndex);
                        }
                        $.pTool.get("activeCard").init(anginRender.bind(this), this.info.myCouponData[this.info.activeNum]);
                        return;
                    } else {
                        var useValid = this.info.myCouponData[this.info.activeNum].useValid;
                        var canUse = useValid && useValid === '1' ? true : false;
                        !canUse ? $.pTool.active('nouseTime') : $.gotoDetail({
                            contentType: "7",
                            url: "/noAuth/buyPage/index.html?couponId=" + this.info.myCouponData[this.info.activeNum].discount_id + "&productId=" + this.info.myCouponData[this.info.activeNum].discount_productIdGroup.split(",")
                        });
                        return
                    }
                }
                if (this.info.myCouponData[this.info.activeNum].cstatus === "2") {
                    $.gotoDetail($.urls.couponUsed);
                    return
                }
                if (this.info.myCouponData[this.info.activeNum].cstatus === "3") {
                    $.gotoDetail($.urls.couponExpire);
                    return
                }
            }
        },
        loadService: function (menuIndex, moduleIndex) {
            var This = this;
            $.myCoupon.all(function (res) {
                var parentEl = $("#m" + menuIndex + "m" + moduleIndex + " .blockWrap");
                var htmlTxt = "";
                var data = JSON.parse(res);
                if (data && data.data && data.data.length) {
                    data.data.splice(This.info.maxLen - 1);
                    This.info.myCouponData = data.data;
                    This.info.firstLineKey = [];
                    This.info.lastLineKey = [];
                    $.UTIL.each(This.info.myCouponData, function (value, index) {
                        This.info.firstLineKey.push(index);
                        This.info.lastLineKey.push(index);
                        var stateFlag = '';
                        var flag = value.cstatus === "2" ? 'usedFlag' : value.cstatus === "3" ? 'expiredFlag' : value.willExpire && value.willExpire === "1" ? 'almostexpiredFlag' : ''
                        if (flag) {
                            stateFlag = "<span class='" + flag + "'><span>";
                        }
                        var worth = value.ctype === 1 ? '<div class="cardTypeName">' + value.card_typename : '<div class="couponprice"><span class="singal">￥</span>' + value.discount_worth / 100;
                        var useLimit = value.ctype === 1 ? '' : '满' + value.discount_useLimit / 100 + '可用';
                        var expiredTxt = value.ctype === 1 ? '<div class="CardvalueDate">激活有效期:</div>' + '<div class="CardendTime">' + dataValidation(value.expiredTime) + '</div>' : '<div class="valueDate">有效期至:</div>' + '<div class="endTime">' + dataValidation(value.expiredTime) + '</div>';
                        var name = value.ctype === 1 ? value.card_productName : value.discount_name;
                        htmlTxt += '<div class="myCoupon block' + index + '" id="m' + menuIndex + "m" + moduleIndex + "m" + index + '">' +
                            '' + worth + "</div>" + '<div class="useCondition"> ' + useLimit + '</div>' + expiredTxt +
                            '<div class="couponName">' + name + "</div>" + stateFlag + flashlightHtml + "</div>";
                    });
                }
                var nocouponContent = '<div>暂无卡券</div>';
                var hascouponContent = '<div>全部卡券</div>';
                This.info.firstLineKey.push(This.info.myCouponData.length);
                This.info.lastLineKey.push(This.info.myCouponData.length);
                htmlTxt += '<div class="' + (This.info.myCouponData.length > 0 ? "hascoupon" : "nocoupon") + " myCoupon block" + This.info.myCouponData.length + '" id="m' + menuIndex + "m" + moduleIndex + "m" + This.info.myCouponData.length + '">' + flashlightHtml + (This.info.myCouponData.length > 0 ? hascouponContent : nocouponContent) + "</div>";
                parentEl.html(htmlTxt);
                var p_moduleInfo = $.pTool.get("p_module").getInfo();
                if (p_moduleInfo.subIndex === menuIndex && p_moduleInfo.moduleIndex === moduleIndex && p_moduleInfo.type === "modulemyCoupon") {
                    var saveActiveNum = This.info.saveActiveNum;
                    if (saveActiveNum > This.info.myCouponData.length) {
                        saveActiveNum = This.info.myCouponData.length;
                    }
                    This.info.activeNum = saveActiveNum;
                    if (!userRights.isShow()) {
                        This.focus(false)
                    }
                }
            });
        },
        createEl: function (menuIndex, moduleIndex) {
            var content = '<div>暂无卡券</div>'
            var html = '<div class="nocoupon myCoupon block0" id="m' + menuIndex + "m" + moduleIndex + 'm0">' + flashlightHtml + content + "</div>";
            return html;
        },
        focus: function (isMove) {
            focusTo(isMove, this.info.menuIndex, this.info.moduleIndex, this.info.activeNum);
        },
        blur: function () {}
    },
    // 直播页
    modulelive: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            maxLen: 13,
            channelMaxLen: 10,
            isFirstLoad: true,
            listStatus: "a",
            lista_index: 0,
            lista_begin: 0,
            lista_fixed: 3,
            lista_size: 6,
            listb_index: 0,
            listb_begin: 0,
            listb_fixed: 3,
            listb_size: 6,
            favData: [],
            CHANNEL_LIST_DS: null,
            CHANNEL_LIST_NAME: null,
            channelListMap: null,
            leftDistanceMap: {
                a: 0,
                b: 367,
                c: 1207
            },
            lineHeightMap: {
                a: 113,
                b: 113
            },
            channelRecommendData: [{}, {}, {}, {}, {}, {}],
            isFirstBack: false,
            billTimer: null,
            liveInfoLock: {},
            isInitPageInfo: false,
        },
        active: function (info) {
            this.info.direction = info.direction;
            this.info.leftDistance = info.leftDistance;
            this.info.menuIndex = info.menuIndex;
            this.info.moduleIndex = info.moduleIndex;
            if (this.info.isFirstBack) {
                this.info.isFirstBack = false;
                this.moveList("a");
                this.moveList("b");
                if (this.info.listStatus !== "a") {
                    $("#a_list .current").removeClass("current");
                    $("#a_list" + this.findInfo("a", "index")).addClass("current")
                }
            } else {
                if (!info.isFromVol) {
                    if (info.leftDistance < 430) {
                        this.info.listStatus = "a";
                    } else if (info.leftDistance > 762) {
                        this.info.listStatus = "c";
                    } else {
                        this.info.listStatus = "b";
                    }
                }
            }
            if (!info.isFromVol && this.info.listStatus === "a") {
                $("#a_list .current").removeClass("current")
            }
            this.focus(1, info.isFromVol)
        },
        deActive: function () {
            $(".channelF", "#m" + this.info.menuIndex + "m" + this.info.moduleIndex, true).css({
                visibility: "hidden"
            });
            if (this.info.listStatus === "a") {
                $("#a_list" + this.findInfo("a", "index")).addClass("current")
            }
        },
        up: function () {
            var listStatus = this.info.listStatus;
            if (listStatus === "a") {
                if (this.focusMoveUp(listStatus)) {
                    return {
                        direction: "up",
                        leftDistance: this.info.leftDistanceMap[this.info.listStatus]
                    }
                }
                this.moveList("a");
                this.info.listb_begin = this.info.channelListMap[this.findInfo("a", "index")][0];
                this.moveList("b");
                this.info.listb_index = this.findInfo("b", "begin");
                this.focus();
                return false;
            } else if (listStatus === "b") {
                if (this.focusMoveUp(listStatus)) {
                    return {
                        direction: "down",
                        leftDistance: this.info.leftDistanceMap[listStatus]
                    }
                } else {
                    this.moveList("b");
                    if (this.findInfo("b", "index") === this.info.channelListMap[this.findInfo("a", "index")][0] - 1) {
                        this.findAIndex();
                        this.findABegin();
                        $("#a_list .current").removeClass("current");
                        $("#a_list" + this.findInfo("a", "index")).addClass("current");
                        this.moveList("a");
                    }
                    this.focus();
                    return false;
                }
            } else if (listStatus === "c") {
                return {
                    direction: "up",
                    leftDistance: this.info.leftDistanceMap[this.info.listStatus]
                }
            }
        },
        down: function () {
            var listStatus = this.info.listStatus;
            if (listStatus === "a") {
                if (this.focusMoveDown(listStatus, this.info.CHANNEL_LIST_NAME.length)) {
                    return {
                        direction: "down",
                        leftDistance: this.info.leftDistanceMap[listStatus]
                    }
                } else {
                    this.moveList("a");
                    this.info.listb_begin = this.info.channelListMap[this.findInfo("a", "index")][0];
                    if (this.findInfo("b", "begin") + this.findInfo("b", "size") > this.info.CHANNEL_LIST_DS.length) {
                        this.info.listb_begin = this.info.CHANNEL_LIST_DS.length - this.findInfo("b", "size");
                    }
                    this.moveList("b");
                    this.info.listb_index = this.findInfo("b", "begin");
                    this.focus();
                    return false;
                }
            } else if (listStatus === "b") {
                if (this.focusMoveDown(listStatus, this.info.CHANNEL_LIST_DS.length)) {
                    return {
                        direction: "down",
                        leftDistance: this.info.leftDistanceMap[listStatus]
                    }
                } else {
                    this.moveList("b");
                    if (this.findInfo("b", "index") === this.info.channelListMap[this.findInfo("a", "index")][1]) {
                        this.findAIndex();
                        this.findABegin();
                        $("#a_list .current").removeClass("current");
                        $("#a_list" + this.findInfo("a", "index")).addClass("current");
                        this.moveList("a");
                    }
                    this.focus();
                    return false;
                }
            } else if (listStatus === "c") {
                return {
                    direction: "down",
                    leftDistance: this.info.leftDistanceMap[listStatus]
                }
            }
        },
        left: function () {
            var i = this.info.listStatus;
            if ("a" === i) {
                return {
                    direction: "down",
                    leftDistance: 1e4,
                    id: "a_list" + this.findInfo("a", "index")
                }
            } else {
                if (i === "b") {
                    this.info.listStatus = "a",
                        $("#a_list .current").removeClass("current")
                } else {
                    this.info.listStatus = "b"
                }
                this.focus();
                return false;
            }
        },
        right: function () {
            var i = this.info.listStatus;
            if ("c" === i) {
                return {
                    direction: "down",
                    leftDistance: 0,
                    id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                }
            } else {
                if ("a" === i) {
                    this.info.listStatus = "b",
                        $("#" + i + "_list" + this.findInfo("a", "index")).addClass("current")
                } else {
                    this.info.listStatus = "c"
                }
                this.focus()
                return false;
            }
        },
        ok: function () {
            var listStatus = this.info.listStatus,
                info = this.info,
                data = homeAllData[info.menuIndex].subContent[info.moduleIndex].moduleContent[0];
            if (data) {
                var key = "#" + findNowId(info.menuIndex, info.moduleIndex, 0),
                    channelId = liveWindowInfo[info.menuIndex][key].channelId;
                if ("c" === listStatus) {
                    $.pTool.get("p_module").sendClickVs(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum),
                        $.gotoDetail({
                            contentUri: channelId ? "channel://" + channelId : "#",
                            contentType: "7"
                        });
                } else if ("b" === listStatus) {
                    var channelInfo = info.CHANNEL_LIST_DS[this.findInfo("b", "index")].channelId;
                    if (channelInfo === channelId) {
                        $.pTool.get("p_module").sendClickVs(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum, this.findInfo("b", "index") + 1);
                        $.gotoDetail({
                            contentUri: channelId ? "channel://" + channelId : "#",
                            contentType: "7"
                        })
                    } else {
                        if ($.isVipChan(channelInfo)) {
                            channelInfo = homeAllData[info.menuIndex].subContent[info.moduleIndex].moduleContent[0].contentUri.replace(/^channel:\/\/~?(\d+)/, function (i) {
                                return RegExp.$1
                            })
                        }
                        liveWindowInfo[info.menuIndex][key].channelId = channelInfo,
                            livePlayer.load($.getChanNum(channelInfo)),
                            livingInfo = {
                                menuIndex: info.menuIndex,
                                key: "#m" + info.menuIndex + "m" + info.moduleIndex + "m0",
                                channelId: channelInfo
                            },
                            this.addLiveIcon()
                    }
                }
            }
        },
        createEl: function (menuIndex, moduleIndex) {
            var e = $.getHelper("data:channel"),
                n = this;
            //a_list 左侧
            isChanhisBack = false;
            isChannelAuthBack = false;
            isBuyChannel = false;
            isGettingChanAuth = false;
            this.info.CHANNEL_LIST_DS = this.info.channelRecommendData.concat(e.CHANNEL_LIST_DS);
            this.info.CHANNEL_LIST_NAME = ["热播收藏"].concat(e.CHANNEL_LIST_NAME);
            this.info.channelListMap = [
                [0, 6]
            ];
            $.UTIL.each(e.channelListMap, function (menuIndex, moduleIndex) {
                n.info.channelListMap.push([menuIndex[0] + 6, menuIndex[1] + 6]);
            });
            //付费列表
            this.info.CHANNEL_LIST_DS.splice(this.info.channelListMap[this.info.channelListMap.length - 1][0]);
            this.info.CHANNEL_LIST_NAME.splice(this.info.CHANNEL_LIST_NAME.length - 1);
            this.info.channelListMap.splice(this.info.channelListMap.length - 1);
            pageInfo.moduleliveInfo && !this.info.isInitPageInfo && (
                $.UTIL.each(
                    pageInfo.moduleliveInfo,
                    function (menuIndex, moduleIndex) {
                        n.info[moduleIndex] = menuIndex
                    }),
                this.info.isInitPageInfo = true,
                this.info.isFirstBack = true
            );
            for (var leftTxt = "", middleTxt = "", a = 0; a < this.info.CHANNEL_LIST_NAME.length; a++) {
                leftTxt += '<div id="a_list' + a + '" class="a_list' + (a < 1 ? " current" : "") + '">' + this.info.CHANNEL_LIST_NAME[a] + "</div>";
            }
            for (a = 0; a < this.info.CHANNEL_LIST_DS.length; a++) {
                var f = "" + (this.info.CHANNEL_LIST_DS[a].num || "");
                if (f && f.length < 3) {
                    f = ("00" + f).slice(-3)
                }
                middleTxt += '<div id="b_list' + a + '" class="b_list' + ($.isVipChan(f) ? " vip" : "") + '"><div class="channelTitle"><div class="channelNum">' + (f || "") + '</div><div class="channelName"">' + (this.info.CHANNEL_LIST_DS[a].name || "") + '</div></div><div class="liveInfo"></div></div>'
            };
            var html = '<div id="a_listBg"></div><div id="b_listBg"></div><div id="line_bg"><div></div><div></div><div></div><div></div><div></div></div><div class="liveWindow nolive blocks block0" id="m' + menuIndex + "m" + moduleIndex + 'm0"><img class="noChannel"></div><div id="a_list"><div id="a_list_wrap">' + leftTxt + '</div></div><div id="b_list"><div id="b_list_wrap">' + middleTxt + "</div></div>",
                data = homeAllData[menuIndex].subContent[moduleIndex].moduleContent;
            // d == isLock channelId == channelId
            if (!liveWindowInfo[menuIndex]) {
                liveWindowInfo[menuIndex] = {};
            }
            var channelId = data[0].contentUri && data[0].contentUri.replace(/^(channel:\/\/)/, ""),
                d = false;
            if (/(\d+)!$/.test(channelId)) {
                channelId = RegExp.$1;
                d = true;
            }
            liveWindowInfo[menuIndex]["#" + findNowId(menuIndex, moduleIndex, 0)] = {
                channelId: channelId,
                isLock: d
            }
            return html
        },
        loadService: function (menuIndex, moduleIndex) {
            var That = this;
            $.s.chanfav.all(null, {
                success: function (data) {
                    var favDataAll = data.data,
                        sData = {},
                        newObjArr = [];
                    for (var i = 0; i < favDataAll.length; i++) { // 剔除vip频道
                        if ((!sData[favDataAll[i].vip]) && favDataAll[i].vip != 1) {
                            favDataAll[i]['fav'] = 1;
                            newObjArr.push(favDataAll[i]);
                        }
                    }
                    if (newObjArr.length == 6) {
                        That.info.channelRecommendData = newObjArr;
                    } else if (newObjArr.length > 6) {
                        That.info.channelRecommendData = newObjArr.slice(0, 6);
                    } else {
                        var datas = homeAllData[menuIndex].subContent[moduleIndex].moduleContent.slice(0, 6); //该导读下所有live配置的频道
                        var newArr = [];
                        for (var i = 0; i < datas.length; i++) {
                            contentUri = datas[i].contentUri.replace("!", "").replace("channel://", "");
                            newArr.push(contentUri);
                        };
                        var removeRepeat = newObjArr.concat($.getChanById(newArr));
                        var newArray = [];
                        var newArrId = {};
                        for (var i = 0; i < removeRepeat.length; i++) {
                            if (!newArrId[removeRepeat[i].num]) {
                                newArray.push(removeRepeat[i]);
                                newArrId[removeRepeat[i].num] = true;
                            }
                            if (newArray.length == 6) {
                                That.info.channelRecommendData = newArray;
                            } else {
                                That.info.channelRecommendData = newArray.slice(0, 6);
                            }
                        }
                    }
                    $.UTIL.each(That.info.channelRecommendData, function (value, moduleIndex) {
                        var addfav = {},
                            newaddfav = [];
                        for (var i = 0; i < That.info.channelRecommendData.length; i++) {
                            if ((!addfav[That.info.channelRecommendData[i].fav]) && That.info.channelRecommendData[i].fav == 1) {
                                newaddfav.push(That.info.channelRecommendData[i]);
                                $("#b_list" + i).addClass('cfaved');
                            }
                        }
                        That.info.CHANNEL_LIST_DS[moduleIndex] = value;
                        var channelNum = '' + value.num || '';
                        if (channelNum && channelNum.length < 3) {
                            channelNum = ("00" + channelNum).slice(-3)
                        }
                        $("#b_list" + moduleIndex + " .channelNum").html(channelNum);
                        $("#b_list" + moduleIndex + " .channelName").html(value.name);
                        That.addLiveIcon();
                        That.getLiveInfo()
                    });
                },
                error: function () {}
            })
        },
        preImg: function (i, t) {
            (new Image).src = "images/aListF.png", (new Image).src = "images/bListF.png"
        },
        getLiveInfo: function () {
            var That = this,
                begin = this.findInfo("b", "begin"),
                end = Math.min(begin + this.findInfo("b", "size"), this.info.CHANNEL_LIST_DS.length),
                index = begin,
                newDate = new $.Date;

            function beginPlay() {
                if (That.info.liveInfoLock["#b_list" + index]) {
                    nextBill();
                } else {
                    var chanId = That.info.CHANNEL_LIST_DS[index].channelId,
                        now = newDate.format("yyyy-MM-dd hh:mm:ss"),
                        dates = newDate.format("yyyy-MM-dd");
                    That.info.billTimer = setTimeout(function () {
                        getPlayBill({
                            date: dates,
                            id: chanId
                        }, {
                            success: function (data) {
                                $.UTIL.each(data.programs, function (t, i) {
                                        var startTime = t.starttime,
                                            endTime = t.endtime;
                                        if (now >= startTime && now < endTime) {
                                            $("#b_list" + index + " .liveInfo").html(t.text);
                                            That.info.liveInfoLock["#b_list" + index] = true
                                        }
                                    }),
                                    nextBill()
                            },
                            error: function () {
                                $("#b_list" + index + " .liveInfo").html("暂无信息");
                                That.info.liveInfoLock["#b_list" + index] = true;
                                nextBill()
                            }
                        })
                    }, 4e2)
                }
            }

            function nextBill() {
                index++;
                if (index > end - 1) {
                    return true;
                }
                beginPlay();
            }
            beginPlay();
        },
        addLiveIcon: function () {
            // 添加播放状态
            if (livingInfo) {
                var key = livingInfo.key.split("m"),
                    t = key[1],
                    e = key[2];
                $("#b_list .current", "#m" + t + "m" + e, true).removeClass("current"),
                    $.UTIL.each(this.info.CHANNEL_LIST_DS,
                        function (menuIndex, moduleIndex) {
                            menuIndex.channelId && (menuIndex.channelId.replace("channel://", "") === livingInfo.channelId && $("#b_list" + moduleIndex).addClass("current"))
                        }
                    )
            }
        },
        findInfo: function (menuIndex, moduleIndex) {
            return this.info["list" + menuIndex + "_" + moduleIndex]
        },
        focusMoveUp: function (menuIndex) {
            if (0 === this.findInfo(menuIndex, "index")) {
                return true;
            } else {
                (this.findInfo(menuIndex, "index") === this.findInfo(menuIndex, "begin") + this.findInfo(menuIndex, "fixed") ||
                    this.findInfo(menuIndex, "index") === this.findInfo(menuIndex, "begin")) && this.findInfo(menuIndex, "begin") > 0 &&
                    this.info["list" + menuIndex + "_begin"]--,
                    this.info["list" + menuIndex + "_index"]--
            }
        },
        focusMoveDown: function (menuIndex, moduleIndex) {
            //moduleIndex = a,b列表的length
            if (this.findInfo(menuIndex, "index") === moduleIndex - 1) {
                return true;
            } else {
                this.findInfo(menuIndex, "index") === this.findInfo(menuIndex, "begin") + this.findInfo(menuIndex, "fixed") &&
                    this.findInfo(menuIndex, "begin") + this.findInfo(menuIndex, "size") < moduleIndex &&
                    this.info["list" + menuIndex + "_begin"]++,
                    this.info["list" + menuIndex + "_index"]++
            }
        },
        moveList: function (menuIndex) {
            // menuIndex = a b
            menuIndex && this.getLiveInfo() === "b",
                $("#" + menuIndex + "_list_wrap").css({
                    top: -this.findInfo(menuIndex, "begin") * this.info.lineHeightMap[menuIndex] + "px"
                })
        },
        findAIndex: function () {
            for (var i = 0; i < this.info.CHANNEL_LIST_NAME.length; i++) {
                if (this.findInfo("b", "index") >= this.info.channelListMap[i][0] && this.findInfo("b", "index") < this.info.channelListMap[i][1]) {
                    this.info.lista_index = i;
                    break
                }
            }
        },
        findABegin: function () {
            this.info.lista_begin = this.findInfo("a", "index") - this.findInfo("a", "fixed"),
                this.info.lista_begin < 0 ? this.info.lista_begin = 0 : this.findInfo("a", "begin") + this.findInfo("a", "size") > this
                .info.CHANNEL_LIST_NAME.length && (this.info.lista_begin = this.info.CHANNEL_LIST_NAME.length -
                    this.findInfo("a", "size"))
        },
        focus: function (isMove, isFromVol) {
            var info = this.info,
                listStatus = info.listStatus;
            if (listStatus === 'c') {
                focusTo(isMove, info.menuIndex, info.moduleIndex, info.activeNum, "liveInfo");
            } else {
                var findIndex = listStatus + "_list" + this.findInfo(listStatus, "index");
                if (isMove && !isFromVol) {
                    setSectionTranslateY($.getElem(findIndex), info.menuIndex)
                }
                var focusHtml = {
                    el: "#" + findIndex,
                    marquee: ["#" + findIndex + " .liveInfo"]
                };
                $.focusTo(focusHtml)
            }
        }
    },
    modulelive2: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            maxLen: 5,
            firstLineKey: [0, 1, 2],
            lastLineKey: [0, 3, 4],
            leftDistanceArr: [200, 1072, 1534, 1072, 1534],
            data: []
        },
        active: function (info) {
            this.info.direction = info.direction;
            this.info.leftDistance = info.leftDistance;
            this.info.menuIndex = info.menuIndex;
            this.info.moduleIndex = info.moduleIndex;
            this.info.data = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].moduleContent;
            this.info.data && (this.info.data = this.info.data.slice(0, this.info.maxLen));
            this.info.activeNum = info.activeNum ? info.activeNum : findActiveIndex(this.info.direction, this.info.leftDistance, this.info.firstLineKey, this.info.lastLineKey, this.info.leftDistanceArr);
            this.focus(1);
        },
        deActive: function () {},
        up: function () {
            if (this.info.activeNum == 0 || this.info.activeNum == 1 || this.info.activeNum == 2) {
                return {
                    direction: "up",
                    leftDistance: this.info.leftDistanceArr[this.info.activeNum]
                };
            } else {
                if (this.info.activeNum == 3) {
                    this.info.activeNum -= 2;
                } else if (this.info.activeNum == 4) {
                    this.info.activeNum -= 2;
                }
                this.focus(1);
                return false;
            }
        },
        down: function () {
            if (this.info.activeNum == 0 || this.info.activeNum == 3 || this.info.activeNum == 4) {
                return {
                    direction: "down",
                    leftDistance: this.info.leftDistanceArr[this.info.activeNum]
                };
            } else {
                if (this.info.activeNum == 1) {
                    this.info.activeNum += 2;
                } else if (this.info.activeNum == 2) {
                    this.info.activeNum += 2;
                }
                this.focus(1);
                return false;
            }
        },
        left: function () {
            if (this.info.activeNum == 0) {
                return {
                    direction: "down",
                    leftDistance: 1e4,
                    id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                };
            } else if (this.info.activeNum == 3) {
                this.info.activeNum -= 3;
            } else {
                this.info.activeNum--;
            }
            this.focus();
            return false;
        },
        right: function () {
            if (this.info.activeNum == 2 || this.info.activeNum == 4) {
                return {
                    direction: "down",
                    leftDistance: 0,
                    id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                };
            } else {
                this.info.activeNum++;
                this.focus();
                return false;
            }
        },
        ok: function () {
            var nowData = this.info.data[this.info.activeNum];
            if (this.info.activeNum === 0) {
                var chanId = liveWindowInfo[this.info.menuIndex]["#" + findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)].channelId;
                nowData.contentUri = chanId ? "channel://" + chanId : "#";
            } else {
                nowData.categoryId = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].categoryId;
            }
            $.gotoDetail(nowData);
        },
        createEl: function (menuIndex, moduleIndex) {
            isChanhisBack = false;
            isChannelAuthBack = false;
            isBuyChannel = false;
            isGettingChanAuth = false;
            isHasNoBuy = false;
            var html = "";
            // var countDowm = '<div id="countdown" class="countdown hide">若无操作，<span id="miao">15</span>S后自动进入全屏</div>' 
            var data = homeAllData[menuIndex].subContent[moduleIndex].moduleContent;
            data && (data = data.slice(0, this.info.maxLen));
            for (var i = 0; i < data.length; i++) {
                if (i < 1) {
                    html += '<div class="liveWindow blocks block' + i + '" id="m' + menuIndex + "m" + moduleIndex + "m" + i + '"><img class="noChannel"></div>';
                    if (!liveWindowInfo[menuIndex]) {
                        liveWindowInfo[menuIndex] = {};
                    }
                    var channelId = data[i].contentUri && data[i].contentUri.replace(/^(channel:\/\/)/, "");
                    var isLock = false;
                    if (/(\d+)!$/.test(channelId)) {
                        channelId = RegExp.$1;
                        isLock = true;
                    }
                    liveWindowInfo[menuIndex]["#" + findNowId(menuIndex, moduleIndex, i)] = {
                        channelId: channelId,
                        isLock: isLock
                    }
                    liveWindowInfoDefault = channelId;
                } else {
                    var innerImgHtml = "";
                    var innertype = "110";
                    if (data[i].pics && data[i].pics[innertype]) {
                        innerImgHtml = '<img class="innerImg" innertype="' + innertype + '">';
                    }
                    html += '<div pictype="68" class="blocks block' + i + '" id="m' + menuIndex + "m" + moduleIndex + "m" + i + '">' + '<div class="images"><img></div>' + innerImgHtml + flashlightHtml + "</div>";
                }
            }
            return html;
        },
        focus: function (isMove) {
            focusTo(isMove, this.info.menuIndex, this.info.moduleIndex, this.info.activeNum);
        },
        blur: function () {}
    },
    modulelive3: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            maxLen: 6,
            firstLineKey: [0, 1, 2],
            lastLineKey: [0, 3, 4, 5],
            leftDistanceArr: [427, 1072, 1534, 998, 1313, 1607],
            data: []
        },
        active: function (info) {
            this.info.direction = info.direction;
            this.info.leftDistance = info.leftDistance;
            this.info.menuIndex = info.menuIndex;
            this.info.moduleIndex = info.moduleIndex;
            this.info.data = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].moduleContent;
            this.info.data && (this.info.data = this.info.data.slice(0, this.info.maxLen));
            this.info.activeNum = info.activeNum ? info.activeNum : findActiveIndex(this.info.direction, this.info.leftDistance, this.info.firstLineKey, this.info.lastLineKey, this.info.leftDistanceArr);
            this.focus(1);
        },
        deActive: function () {},
        up: function () {
            if (this.info.activeNum == 0 || this.info.activeNum == 1 || this.info.activeNum == 2) {
                return {
                    direction: "up",
                    leftDistance: this.info.leftDistanceArr[this.info.activeNum]
                };
            } else {
                if (this.info.activeNum == 3) {
                    this.info.activeNum -= 2;
                } else if (this.info.activeNum == 4 || this.info.activeNum == 5) {
                    this.info.activeNum -= 3;
                }
                this.focus(1);
                return false;
            }
        },
        down: function () {
            if (this.info.activeNum == 0 || this.info.activeNum == 3 || this.info.activeNum == 4 || this.info.activeNum == 5) {
                return {
                    direction: "down",
                    leftDistance: this.info.leftDistanceArr[this.info.activeNum]
                };
            } else {
                if (this.info.activeNum == 1) {
                    this.info.activeNum += 2;
                } else if (this.info.activeNum == 2) {
                    this.info.activeNum += 3;
                }
                this.focus(1);
                return false;
            }
        },
        left: function () {
            if (this.info.activeNum == 0) {
                return {
                    direction: "down",
                    leftDistance: 1e4,
                    id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                };
            } else if (this.info.activeNum == 3) {
                this.info.activeNum -= 3;
            } else {
                this.info.activeNum--;
            }
            this.focus();
            return false;
        },
        right: function () {
            if (this.info.activeNum == 2 || this.info.activeNum == 5) {
                return {
                    direction: "down",
                    leftDistance: 0,
                    id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                };
            } else {
                this.info.activeNum++;
                this.focus();
                return false;
            }
        },
        ok: function () {
            var nowData = this.info.data[this.info.activeNum];
            if (this.info.activeNum === 0) {
                var chanId = liveWindowInfo[this.info.menuIndex]["#" + findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)].channelId;
                nowData.contentUri = chanId ? "channel://" + chanId : "#";
            } else {
                nowData.categoryId = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].categoryId;
            }
            $.gotoDetail(nowData);
        },
        createEl: function (menuIndex, moduleIndex) {
            isChanhisBack = false;
            isChannelAuthBack = false;
            isBuyChannel = false;
            isGettingChanAuth = false;
            isHasNoBuy = false;
            var html = "";
            var data = homeAllData[menuIndex].subContent[moduleIndex].moduleContent;
            data && (data = data.slice(0, this.info.maxLen));
            for (var i = 0; i < data.length; i++) {
                if (i < 1) {
                    html += '<div class="liveWindow blocks block' + i + '" id="m' + menuIndex + "m" + moduleIndex + "m" + i + '"><img class="noChannel"></div>';
                    if (!liveWindowInfo[menuIndex]) {
                        liveWindowInfo[menuIndex] = {};
                    }
                    var channelId = data[i].contentUri && data[i].contentUri.replace(/^(channel:\/\/)/, "");
                    var isLock = false;
                    if (/(\d+)!$/.test(channelId)) {
                        channelId = RegExp.$1;
                        isLock = true;
                    }
                    liveWindowInfo[menuIndex]["#" + findNowId(menuIndex, moduleIndex, i)] = {
                        channelId: channelId,
                        isLock: isLock
                    };
                    liveWindowInfoDefault = channelId;
                } else {
                    var innerImgHtml = '';
                    var innertype = "86";
                    if (data[i].pics && data[i].pics[innertype]) {
                        innerImgHtml = '<img class="innerImg" innertype="' + innertype + '">';
                    }
                    html += '<div pictype="68" class="blocks block' + i + '" id="m' + menuIndex + "m" + moduleIndex + "m" + i + '">' + '<div class="images"><img></div>' + innerImgHtml + flashlightHtml + "</div>";
                }
            }
            return html
        },
        focus: function (isMove) {
            focusTo(isMove, this.info.menuIndex, this.info.moduleIndex, this.info.activeNum);
        },
        blur: function () {}
    },
    moduleliveInfo: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            maxLen: 4,
            firstLineKey: [0, 1, 2, 3],
            lastLineKey: [0, 1, 2, 3],
            leftDistanceArr: [206, 649, 1091, 1534],
            data: [],
            timer: null
        },
        active: function (info) {
            this.info.direction = info.direction;
            this.info.leftDistance = info.leftDistance;
            this.info.menuIndex = info.menuIndex;
            this.info.moduleIndex = info.moduleIndex;
            this.info.data = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].moduleContent;
            this.info.data && (this.info.data = this.info.data.slice(0, this.info.maxLen));
            this.info.activeNum = info.activeNum ? info.activeNum : findActiveIndex(this.info.direction, this.info.leftDistance, this.info.firstLineKey, this.info.lastLineKey, this.info.leftDistanceArr);
            this.focus(1);
        },
        deActive: function () {},
        up: function () {
            return {
                direction: "up",
                leftDistance: this.info.leftDistanceArr[this.info.activeNum]
            };
        },
        down: function () {
            return {
                direction: "down",
                leftDistance: this.info.leftDistanceArr[this.info.activeNum]
            };
        },
        left: function () {
            if (this.info.activeNum === 0) {
                return {
                    direction: "down",
                    leftDistance: 1e4,
                    id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                };
            } else {
                this.info.activeNum--;
                this.focus();
                return false;
            }
        },
        right: function () {
            if (this.info.activeNum === this.info.data.length - 1) {
                return {
                    direction: "down",
                    leftDistance: 0,
                    id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                };
            } else {
                this.info.activeNum++;
                this.focus();
                return false;
            }
        },
        ok: function () {
            $.gotoDetail(this.info.data[this.info.activeNum]);
        },
        beginTimer: function () {},
        stopTimer: function () {},
        loadService: function (menuIndex, moduleIndex) {
            var nowHomeData = homeAllData[menuIndex].subContent[moduleIndex].moduleContent;
            nowHomeData = nowHomeData.slice(0, this.info.maxLen);
            var isCanUpLineInfo = [true, true, true, true];
            var isGetPlaybill = [false, false, false, false];
            var nowDate = getNowDate();
            var nowDateStr = nowDate.format("yyyy-MM-dd hh:mm:ss");
            var liveInfoArr = [];
            var This = this;
            var isLoadOver = false;
            clearTimeout(this.info.timer);

            function showLiveInfo() {
                clearTimeout(This.info.timer);
                var now = getNowDate();
                $.UTIL.each(nowHomeData, function (value, index) {
                    if (liveInfoArr[index] && now >= liveInfoArr[index].endTime) {
                        if (liveInfoArr[index].liveIndex === liveInfoArr[index].data.length - 1) {
                            isCanUpLineInfo = [true, true, true, true];
                            isGetPlaybill = [false, false, false, false];
                            nowDate = now;
                            nowDateStr = nowDate.format("yyyy-MM-dd hh:mm:ss");
                            liveInfoArr = [];
                            initPlaybill();
                            return true;
                        } else {
                            liveInfoArr[index] = {
                                liveIndex: liveInfoArr[index].liveIndex + 1,
                                startTime: transTime(liveInfoArr[index].data[liveInfoArr[index].liveIndex + 1].starttime),
                                endTime: transTime(liveInfoArr[index].data[liveInfoArr[index].liveIndex + 1].endtime),
                                text: liveInfoArr[index].data[liveInfoArr[index].liveIndex + 1].text,
                                data: liveInfoArr[index].data
                            };
                            isCanUpLineInfo[index] = true;
                        }
                    }
                    if (isGetPlaybill[index]) {
                        var $dom = $("#m" + menuIndex + "m" + moduleIndex + "m" + index);
                        if (isCanUpLineInfo[index]) {
                            isCanUpLineInfo[index] = false;
                            $dom.find(".liveName").html(liveInfoArr[index].text);
                            $dom.find(".liveTime").html(liveInfoArr[index].startTime.format("hh:mm") + "-" + liveInfoArr[index].endTime.format("hh:mm"));
                        }
                        $dom.find(".progress").css({
                            width: Math.ceil(getNowDate() - liveInfoArr[index].startTime) / (liveInfoArr[index].endTime - liveInfoArr[index].startTime) * 100 + "%"
                        });
                        $dom = null;
                    }
                });
                This.info.timer = setTimeout(showLiveInfo, 6e3);
            }
            this.beginTimer = function () {
                if (isLoadOver) {
                    clearTimeout(This.info.timer);
                    showLiveInfo();
                }
            };
            this.stopTimer = function () {
                if (isLoadOver) {
                    clearTimeout(This.info.timer);
                }
            };

            function initPlaybill() {
                var index = 0;
                isLoadOver = false;
                getBill();

                function getBill() {
                    var value = nowHomeData[index];
                    $.s.playbill.get({
                        id: value.contentUri.replace(/^(channel:\/\/)/, ""),
                        date: nowDate.format("yyyy-MM-dd")
                    }, {
                        success: function (data) {
                            var _data = data.programs || [];
                            if (_data.length) {
                                isGetPlaybill[index] = true;
                                var preEndtime = "";
                                for (var i = 0; i < _data.length; i++) {
                                    if (preEndtime && preEndtime < _data[i].starttime) {
                                        _data.splice(i, 0, {
                                            id: "",
                                            text: "暂无信息",
                                            starttime: preEndtime,
                                            endtime: _data[i].starttime
                                        });
                                    }
                                    if (i === _data.length - 1 && _data[i].endtime.split(" ")[1] < "24:00:00") {
                                        _data.push({
                                            id: "",
                                            text: "暂无信息",
                                            starttime: _data[i].endtime,
                                            endtime: _data[i].endtime.split(" ")[0] + " 24:00:00"
                                        });
                                        break;
                                    }
                                    preEndtime = _data[i].endtime;
                                }
                                $.UTIL.each(_data, function (v, i) {
                                    var startTime = v.starttime;
                                    var endTime = v.endtime;
                                    if (nowDateStr >= startTime && nowDateStr < endTime) {
                                        liveInfoArr[index] = {
                                            liveIndex: i,
                                            startTime: transTime(startTime),
                                            endTime: transTime(endTime),
                                            text: v.text,
                                            data: _data
                                        };
                                        return true;
                                    }
                                });
                            } else {
                                isGetPlaybill[index] = true;
                                liveInfoArr[index] = {
                                    liveIndex: 0,
                                    startTime: transTime(nowDate.format("yyyy-MM-dd") + " 00:00:00"),
                                    endTime: transTime(nowDate.format("yyyy-MM-dd") + " 24:00:00"),
                                    text: "暂无信息",
                                    data: [{
                                        id: "",
                                        text: "暂无信息",
                                        starttime: nowDate.format("yyyy-MM-dd") + " 00:00:00",
                                        endtime: nowDate.format("yyyy-MM-dd") + " 24:00:00"
                                    }]
                                };
                            }
                            getNext();
                        },
                        error: function () {
                            isGetPlaybill[index] = true;
                            liveInfoArr[index] = {
                                liveIndex: 0,
                                startTime: transTime(nowDate.format("yyyy-MM-dd") + " 00:00:00"),
                                endTime: transTime(nowDate.format("yyyy-MM-dd") + " 24:00:00"),
                                text: "暂无信息",
                                data: [{
                                    id: "",
                                    text: "暂无信息",
                                    starttime: nowDate.format("yyyy-MM-dd") + " 00:00:00",
                                    endtime: nowDate.format("yyyy-MM-dd") + " 24:00:00"
                                }]
                            };
                            getNext();
                        }
                    });
                }

                function getNext() {
                    index++;
                    if (index > nowHomeData.length - 1) {
                        isLoadOver = true;
                        if (isHasModLf && $(".moduleliveInfo", "#section" + $.pTool.get("p_module").getInfo().subIndex).length) {
                            showLiveInfo();
                        }
                    } else {
                        setTimeout(getBill, 20);
                    }
                }
            }
            initPlaybill();
        },
        createEl: function (menuIndex, moduleIndex) {
            var html = "";
            var data = homeAllData[menuIndex].subContent[moduleIndex].moduleContent;
            data && (data = data.slice(0, this.info.maxLen));
            for (var i = 0; i < data.length; i++) {
                html += '<div pictype="68" class="blocks block' + i + '" id="m' + menuIndex + "m" + moduleIndex + "m" + i + '">' + '<div class="images"><img></div>' + '<div class="progressBar"><div class="progress"></div></div>' + '<div class="liveInfo"><div class="liveName"></div><div class="liveTime"></div></div>' + flashlightHtml + "</div>";
            }
            return isHasModLf = true, html;
        },
        focus: function (isMove) {
            focusTo(isMove, this.info.menuIndex, this.info.moduleIndex, this.info.activeNum, "liveName");
        },
        blur: function () {}
    },
    moduleorder1: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            maxLen: 1,
            firstLineKey: [0],
            lastLineKey: [0],
            leftDistanceArr: [0],
            data: []
        },
        active: function (info) {
            this.info.direction = info.direction;
            this.info.leftDistance = info.leftDistance;
            this.info.menuIndex = info.menuIndex;
            this.info.moduleIndex = info.moduleIndex;
            this.info.data = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].moduleContent;
            this.info.data && (this.info.data = this.info.data.slice(0, this.info.maxLen));
            this.info.activeNum = info.activeNum ? info.activeNum : findActiveIndex(this.info.direction, this.info.leftDistance, this.info.firstLineKey, this.info.lastLineKey, this.info.leftDistanceArr);
            this.focus(1);
        },
        deActive: function () {},
        up: function () {
            return {
                direction: "up",
                leftDistance: this.info.leftDistanceArr[this.info.activeNum]
            };
        },
        down: function () {
            return {
                direction: "down",
                leftDistance: this.info.leftDistanceArr[this.info.activeNum]
            };
        },
        left: function () {
            return {
                direction: "down",
                leftDistance: 1e4,
                id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
            };
        },
        right: function () {
            return {
                direction: "down",
                leftDistance: 0,
                id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
            };
        },
        ok: function () {
            if (this.info.activeNum === 0) {
                if ($("#" + findNowId(this.info.menuIndex, this.info.moduleIndex, 0)).attr("isCanOrder")) {
                    $.auth.forwardOrder(false, false, [authInfo[this.info.menuIndex][findNowId(this.info.menuIndex, this.info.moduleIndex, 0)].chargeId]);
                }
            }
        },
        auth: auth,
        createEl: function (menuIndex, moduleIndex) {
            var html = "";
            var data = homeAllData[menuIndex].subContent[moduleIndex].moduleContent;
            data && (data = data.slice(0, this.info.maxLen));
            for (var i = 0; i < data.length; i++) {
                html += '<div class="blocks block' + i + '" id="m' + menuIndex + "m" + moduleIndex + "m" + i + '">' + '<div class="orderImg"><img></div>' + flashlightHtml + "</div>";
                if (!authInfo[menuIndex]) {
                    authInfo[menuIndex] = {};
                }
                authInfo[menuIndex][findNowId(menuIndex, moduleIndex, i)] = {
                    chargeId: data[i].contentUri.replace(/^(chargeId:\/\/)/, ""),
                    state: "loading",
                    picBuy: data[i].picBuy,
                    picUnbuy: data[i].picUnbuy
                };
            }
            return html;
        },
        focus: function (isMove) {
            focusTo(isMove, this.info.menuIndex, this.info.moduleIndex, this.info.activeNum);
        },
        blur: function () {}
    },
    moduleorder2: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            col: 4,
            row: 1,
            maxLen: 4,
            firstLineKey: [0, 1, 2, 3],
            lastLineKey: [0, 1, 2, 3],
            leftDistanceArr: [206, 649, 1091, 1534],
            data: []
        },
        active: function () {
            return commonModules.fixListModule.active.apply(this, arguments);
        },
        deActive: function () {
            return commonModules.fixListModule.deActive.apply(this, arguments);
        },
        up: function () {
            return commonModules.fixListModule.up.apply(this, arguments);
        },
        down: function () {
            return commonModules.fixListModule.down.apply(this, arguments);
        },
        left: function () {
            return commonModules.fixListModule.left.apply(this, arguments);
        },
        right: function () {
            return commonModules.fixListModule.right.apply(this, arguments);
        },
        ok: function () {
            var activeKey = findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum);
            var $active = $("#" + activeKey);
            if ($active.attr("orderBtn")) {
                if ($active.attr("isCanOrder")) {
                    $.auth.forwardOrder(false, false, [authInfo[this.info.menuIndex][activeKey].chargeId]);
                }
            } else {
                var nowData = this.info.data[this.info.activeNum];
                nowData.categoryId = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].categoryId;
                $.gotoDetail(nowData);
            }
        },
        auth: auth,
        createEl: function (menuIndex, moduleIndex) {
            var html = "";
            var data = homeAllData[menuIndex].subContent[moduleIndex].moduleContent;
            data && (data = data.slice(0, this.info.maxLen));
            var orderIndex = 0;
            $.UTIL.each(data, function (value, index) {
                if (/^(chargeId:\/\/)/.test(value.contentUri)) {
                    orderIndex = index;
                    return true;
                }
            });
            var vipCorner = "";
            for (var i = 0; i < data.length; i++) {
                if (i === orderIndex) {
                    html += '<div orderBtn="1" class="blocks block' + i + '" id="m' + menuIndex + "m" + moduleIndex + "m" + i + '">' + '<div class="orderImg"><img></div>' + flashlightHtml + "</div>";
                    if (!authInfo[menuIndex]) {
                        authInfo[menuIndex] = {};
                    }
                    authInfo[menuIndex][findNowId(menuIndex, moduleIndex, i)] = {
                        chargeId: data[i].contentUri.replace(/^(chargeId:\/\/)/, ""),
                        state: "loading",
                        picBuy: data[i].picBuy,
                        picUnbuy: data[i].picUnbuy
                    };
                } else {
                    vipCorner = "";
                    html += '<div pictype="66" class="hor blocks block' + i + '" id="m' + menuIndex + "m" + moduleIndex + "m" + i + '">' + '<div class="images"><img></div>' + '<div class="episode"></div>' + '<div class="contentTitle hide"></div>' + vipCorner + flashlightHtml + "</div>";
                }
            }
            return html;
        },
        focus: function (isMove) {
            focusTo(isMove, this.info.menuIndex, this.info.moduleIndex, this.info.activeNum);
        },
        blur: function () {}
    },
    modulesystem: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            elType: [],
            col: 4,
            row: 1,
            maxLen: 4,
            firstLineKey: [0, 1, 2, 3],
            lastLineKey: [0, 1, 2, 3],
            leftDistanceArr: [280, 772, 1169, 1563],
            data: []
        },
        active: function () {
            return commonModules.fixListModule.active.apply(this, arguments);
        },
        deActive: function () {
            return commonModules.fixListModule.deActive.apply(this, arguments);
        },
        up: function () {
            return commonModules.fixListModule.up.apply(this, arguments);
        },
        down: function () {
            return commonModules.fixListModule.down.apply(this, arguments);
        },
        left: function () {
            return commonModules.fixListModule.left.apply(this, arguments);
        },
        right: function () {
            return commonModules.fixListModule.right.apply(this, arguments);
        },
        ok: function () {
            var activeKey = findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum);
            var $active = $("#" + activeKey);
            if (/^setting$/.test(this.info.data[this.info.activeNum].contentUri)) {
                // $.gotoDetail({
                //     contentType: "7",
                //     url: "app://com.android.settings"
                // });
                // 跳转到双屏绑定页面  
                $.gotoDetail($.urls.phoneBind);
                // $.gotoDetail($.urls.userSystem);
            } else if ($active.attr("orderBtn")) {
                if ($active.attr("isCanOrder")) {
                    $.auth.forwardOrder(false, false, [authInfo[this.info.menuIndex][activeKey].chargeId]);
                }
            } else if (/^email$/.test(this.info.data[this.info.activeNum].contentUri)) {
                $.gotoDetail($.urls.email);
            } else if (/^block_activeCard$/.test(this.info.data[this.info.activeNum].contentUri)) {
                $.pTool.get("activeCard").init();
            } else if (/^block_changeVersion$/.test(this.info.data[this.info.activeNum].contentUri)) {
                $.pTool.active("version");
            } else {
                var nowData = this.info.data[this.info.activeNum];
                nowData.categoryId = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].categoryId;
                $.gotoDetail(nowData);
            }
        },
        auth: auth,
        createEl: function (menuIndex, moduleIndex) {
            var html = "";
            var data = homeAllData[menuIndex].subContent[moduleIndex].moduleContent;
            data && (data = data.slice(0, this.info.maxLen));
            var orderIndex = 0;
            $.UTIL.each(data, function (value, index) {
                if (/^(chargeId:\/\/)/.test(value.contentUri)) {
                    orderIndex = index;
                    return true;
                }
            });
            $.UTIL.each(data, function (value, index) {
                var innerImgHtml = "";
                var innertype = "87";
                if (value.pics && value.pics[innertype]) {
                    innerImgHtml = '<img class="innerImg" innertype="' + innertype + '">';
                }
                if (/^setting$/.test(value.contentUri)) {
                    html += '<div pictype="80" class="blocks block' + index + '" id="m' + menuIndex + "m" + moduleIndex + "m" + index + '">' + '<div class="images"><img></div>' + '<div class="userId">用户ID：' + $.getVariable("EPG:userId") + "</div>" + innerImgHtml + flashlightHtml + "</div>";
                } else if (index === orderIndex) {
                    html += '<div pictype="80" orderBtn="1" class="blocks block' + index + '" id="m' + menuIndex + "m" + moduleIndex + "m" + index + '">' + '<div class="orderImg"><img></div>' + innerImgHtml + flashlightHtml + "</div>";
                    if (!authInfo[menuIndex]) {
                        authInfo[menuIndex] = {};
                    }
                    authInfo[menuIndex][findNowId(menuIndex, moduleIndex, index)] = {
                        chargeId: value.contentUri.replace(/^(chargeId:\/\/)/, ""),
                        state: "loading",
                        picBuy: data[index].picBuy,
                        picUnbuy: data[index].picUnbuy
                    };
                } else {
                    html += '<div pictype="80" class="blocks block' + index + '" id="m' + menuIndex + "m" + moduleIndex + "m" + index + '">' + '<div class="images"><img></div>' + innerImgHtml + flashlightHtml + "</div>";
                }
            });
            return html;
        },
        focus: function (isMove) {
            focusTo(isMove, this.info.menuIndex, this.info.moduleIndex, this.info.activeNum);
        },
        blur: function () {}
    }
};

function doRecord(re) {
    var record = "";
    var pre = "观看至";
    var n = "";
    var unit = "";
    var leaveTime = re.leaveTime;
    var totalTime = re.totalTime;
    var num = leaveTime / totalTime * 100;
    var percent = num > 1 ? Math.floor(num) + "%" : "不足1%";
    if (re.mediaType !== "0") {
        n = Number(re.sceneInfo);
        if (re.mediaType === "2") {
            pre += "第";
            unit = "集";
        } else if (re.mediaType === "3") {
            if ((n + "").length !== 8) {
                pre += "第";
            }
            unit = "期";
        }
    }
    record = pre + n + unit + percent;
    return record;
}

function toTwo(n) {
    return n < 10 ? "0" + n : "" + n;
}

function getNowDate() {
    return new $.Date();
}

var authLock = false;

function auth() {
    if (authLock) {
        return;
    }
    authLock = true;
    var package = [];
    var chargeIdArr = [$.auth.getBigId()];
    $.UTIL.each(authInfo, function (value1, index) {
        if (value1) {
            $.UTIL.each(value1, function (value2, key) {
                chargeIdArr.push(value2.chargeId);
            });
        }
    });
    for (var i = 0; i < chargeIdArr.length - 1; i++) {
        for (var j = i + 1; j < chargeIdArr.length; j++) {
            if (chargeIdArr[i] == chargeIdArr[j]) {
                chargeIdArr.splice(j, 1);
                j--;
            }
        }
    }
    $.UTIL.each(chargeIdArr, function (value, index) {
        package.push({
            chargeId: value
        });
    });
    $.auth.auth4Pkg({
        entrance: "",
        package: package,
        callback: function (result) {
            var isBuyBig = false;
            if (result && result[$.auth.getBigId()]) {
                isBuyBig = true;
            }
            var isTimeout = !!(result && result.code === "timeOut");
            $.UTIL.each(authInfo, function (value1, index) {
                $.UTIL.each(value1, function (value2, key) {
                    var chargeId = value2.chargeId;
                    value2.state = result[chargeId] || isBuyBig || isTimeout ? "hasBuy" : "noBuy";
                });
            });
            $.UTIL.each(authInfo, function (value1, index) {
                $.UTIL.each(value1, function (value2, key) {
                    if (value2.state === "noBuy") {
                        $("#" + key).attr("isCanOrder", "1");
                        $("#" + key + " .orderImg img").attr({
                            src: authInfo[index][key].picUnbuy
                        });
                    } else if (value2.state === "hasBuy") {
                        $("#" + key + " .orderImg img").attr({
                            src: authInfo[index][key].picBuy
                        });
                    }
                });
            });
        }
    });
}

function transTime(timestr) {
    return new $.Date().parse(timestr, "yyyy-MM-dd hh:mm:ss");
}

var recordTimer = null;

function sendRecord(menuIndex, delay) {
    clearTimeout(recordTimer);
    var sectionName = homeAllData[menuIndex].contentName ? "_" + homeAllData[menuIndex].contentName : "";
    recordTimer = setTimeout(function () {
        $.recodeData(pageName + sectionName, "access");
    }, delay);
}

var showPicScreen = function () {
    var isShow = false;
    var timer = null;
    return {
        show: function (picSrc, isIn) {
            clearTimeout(timer);

            function show() {
                if (isShow && !isIn) {
                    return;
                }
                if (!$picScreen) {
                    $picScreen = $("#picScreen");
                }
                $picScreen.css({
                    background: "url(" + picSrc + ") 0 0 no-repeat",
                    opacity: "1",
                    "background-size": "100% 100%"
                });
                isShow = true;
            }
            show();
        },
        hide: function () {
            clearTimeout(timer);
            if (isShow) {
                $picScreen.css({
                    background: "none",
                    opacity: "0"
                });
                isShow = false;
            }
        }
    };
}();

function showSubPicScreen(isSrc, isIn) {
    var menuIndex = $.pTool.get("p_module").getInfo().subIndex;
    var nowSubData = homeAllData[menuIndex].subContent;
    var typeMap = {
        22: 1,
        23: 1
    };
    var picSrc = "";
    if (nowSubData[0] && typeMap[nowSubData[0].moduleType] && sectionTransYMap[menuIndex] == 0) {
        if (isSrc) {
            picSrc = nowSubData[0].moduleContent[0] && nowSubData[0].moduleContent[0].pics[picScreenType];
        }
        picSrc && showPicScreen.show(picSrc, isIn);
    } else {
        showPicScreen.hide();
    }
}

var videoScreen = function () {
    var vl = null;
    var playTimer = null;
    var screenPlayingMap = "";
    var isWillOrNowPlay = false;
    var $screenShadow = null;
    var isShadowShow = false;
    var playIndex = 0;
    var $playingCues = null;
    var $videoInfos = null;

    function init(opt, categoryId) {
        if (vl) {
            return;
        }
        vl = $.createVideoList({
            list: opt,
            auto: false,
            loading: function (type) {},
            onPlay: function () {
                $.initVolume(vl.mp);
            },
            onEnd: function () {
                var info = $.pTool.get("p_module").getInfo();
                var nowSubData = homeAllData[info.subIndex].subContent;
                var nowModuleData = nowSubData[0].moduleContent;
                showPicScreen.show(nowModuleData[playIndex].pics[picScreenType], true);
                play(info.subIndex, playIndex);
            },
            onError: function (e) {
                return true;
            },
            left: 0,
            top: 0,
            width: 1920,
            height: 1080
        }, "sv" + categoryId);
    }

    function play(playingMenu, index) {
        showShadow();
        clearTimeout(playTimer);
        isWillOrNowPlay = true;
        screenPlayingMap = playingMenu + "@" + index;
        $playingCues = $(".playingCue", "#m" + playingMenu + "m0", true);
        $playingCues.hide();
        $playingCues.item(index).show();
        $videoInfos = $(".infos", "#m" + playingMenu + "m0 .info", true);
        $videoInfos.hide();
        $videoInfos.item(index).show();
        if (vl) {
            vl.stop();
            $.setVolumeUsability(false);
        }
        playTimer = setTimeout(function () {
            showPicScreen.hide();
            $(oCanvas).hide();
            vl && vl.playBy({
                val: index
            });
            playIndex = index;
        }, 1500);
    }

    function subPlay() {
        var menuIndex = $.pTool.get("p_module").getInfo().subIndex;
        var nowSubData = homeAllData[menuIndex].subContent;
        var typeMap = {
            23: 1
        };
        if (nowSubData[0] && typeMap[nowSubData[0].moduleType] && sectionTransYMap[menuIndex] == 0) {
            release();
            if (!isWillOrNowPlay) {
                init(function () {
                    var info = [];
                    $.UTIL.each(nowSubData[0].moduleContent, function (value, index) {
                        info.push({
                            contentId: value.contentName.split("@")[0]
                        });
                    });
                    return info;
                }(), nowSubData[0].categoryId);
                play(menuIndex, 0);
            }
        } else {
            release();
        }
    }

    function release() {
        if (vl) {
            clearTimeout(playTimer);
            hideShadow();
            $playingCues && $playingCues.hide();
            $videoInfos && $videoInfos.hide();
            $(oCanvas).show();
            screenPlayingMap = "";
            $.setVolumeUsability(false);
            vl && vl.release();
            vl = null;
            isWillOrNowPlay = false;
        }
    }

    function checkPlaying(playingMenu, playingIndex) {
        return screenPlayingMap == playingMenu + "@" + playingIndex;
    }

    function showShadow() {
        if (isShadowShow) {
            return;
        }
        if (!$screenShadow) {
            $screenShadow = $("#screenShadow");
        }
        $screenShadow.show();
        isShadowShow = true;
    }

    function hideShadow() {
        $screenShadow && $screenShadow.hide();
        isShadowShow = false;
    }
    return {
        init: init,
        play: play,
        subPlay: subPlay,
        release: release,
        checkPlaying: checkPlaying
    };
}();

function initVl(menuIndex, moduleIndex) {
    menuIndex && (this.info.menuIndex = menuIndex);
    moduleIndex && (this.info.moduleIndex = moduleIndex);
    var This = this;
    var info = this.info;
    var moduleId = "m" + info.menuIndex + "m" + info.moduleIndex;
    var nowVodInfo = vodWindowInfo[info.menuIndex]["m" + info.menuIndex + "m" + info.moduleIndex];
    var wrapTranslateY = +($wrap.attr("translatey") || 0);
    var sectionTranslateY = -sectionTransYMap[info.menuIndex];
    var elleft = nowVodInfo.offsetLeft;
    var elTop = nowVodInfo.offsetTop - sectionTranslateY + (wrapTop - wrapTranslateY);
    var elWidth = nowVodInfo.elWidth;
    var elHeight = nowVodInfo.elHeight;
    var vl = $.playSizeList({
        list: function () {
            var data = [];
            $.UTIL.each(This.info.data, function (value, index) {
                data.push({
                    contentId: value.contentId
                });
            });
            return data;
        }(),
        auto: false,
        current: 0,
        loading: function (type) {},
        onPlay: function () {
            This.info.vodPlaying = true;
            canvasBg(info.menuIndex, [elleft, elTop, elWidth, elHeight]);
            $("#" + moduleId + " .vodWindow").removeClass("noPlayer");
            $("#" + moduleId + " .vodWindow img").css({
                opacity: "0"
            })
        },
        onEnd: function () {
            _test('---onEnd');
            This.info.vodPlaying = false;
            canvasBg(This.info.menuIndex);
            $("#" + moduleId + " .vodWindow").addClass("noPlayer");
            This.playNext(This.info.menuIndex, This.info.moduleIndex);
        },
        onError: function (e) {
           this.onEnd();
            return true;
        },
        left: elleft,
        top: elTop,
        width: elWidth,
        height: elHeight
    }, "svList" + homeAllData[info.menuIndex].subContent[info.moduleIndex].categoryId);
    return vl;
}

var getDetailData = function () {
    var detailDataObj = {};
    var detailDataArr = [];

    function deleteArr(key) {
        detailDataArr.unshift(key);
        if (detailDataArr.length > 10) {
            delete detailDataObj[detailDataArr.pop()];
        }
    }
    return function (info, cb) {
        var successCb = cb.success || function () {};
        var errorCb = cb.error || function () {};
        var key = info.id;
        if (detailDataObj[key] && detailDataObj[key] !== "loading" && detailDataObj[key] !== "error") {
            successCb(detailDataObj[key]);
        } else if (detailDataObj[key] === "error") {
            errorCb();
        } else {
            if (detailDataObj[key] !== "loading") {
                detailDataObj[key] = "loading";
                $.s.detail.get({
                    id: info.id
                }, {
                    success: function (data) {
                        detailDataObj[key] = data;
                        deleteArr(key);
                        successCb(data);
                    },
                    error: function () {
                        detailDataObj[key] = "error";
                        deleteArr(key);
                        errorCb();
                    }
                });
            }
        }
    };
}();
// 时间格式方法：将2020-05-07 23:59:59转换为2020.05.07
function dataValidation(dataTime) {
    var data = dataTime.slice(0, 10).replace(/-/g, ".");
    return data;
}