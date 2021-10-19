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

function createAllEl() {
    var data = homeAllData;
    var $section = $("#section");
    createMenu();
    createAllSections();

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
}

function createOneSection(menuIndex) {
    try {
        var pageData = homeAllData[menuIndex].subContent;
        var $nowSection = $("#section" + menuIndex);
        authInfo[menuIndex] = null;
        authLock = false;
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
           if (pageData[i].moduleType === "23") {
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
    } catch (e) {
        $.log.out.error = ["homeError:%s(%s)-%s", homeAllData[menuIndex].contentName, menuIndex, i, e];
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

// var preMenuIndex;
// 所有含有定时器的模块，切换导航是要清除
var carouseTimer = ['module25', 'module52'];

function setTranslateX(menuIndex, isFirst) {
    var sectionWidth = 1920;
    $("#section").css({
        "-webkit-transform": "translateX(" + -sectionWidth * menuIndex + "px)"
    });
    canvasBg(menuIndex);
    sendRecord(menuIndex, isFirst ? 0 : 400);
    // 切换导航清除所有定时器
    $.UTIL.each(carouseTimer, function (value) {
        modules[value].stopAutoPlay && modules[value].stopAutoPlay();
    });
    // preMenuIndex = menuIndex;
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
            // 只有渲染当前 menuIndex, 才可以开始滚动.
            if($.pTool.get("p_module").getInfo().subIndex === menuIndex){
                keepService(menuIndex, moduleIndex);
            }
            return;
        }
        var $aBlock = $("#" + nowId + " .blocks", "#" + nowId, true);
        var moduleType = homeAllData[menuIndex].subContent[moduleIndex].moduleType;
        for (var i = 0; i < $aBlock.length; i++) {
            var picType = $aBlock.item(i).attr("pictype");
            var nowPics = homeAllData[menuIndex].subContent[moduleIndex].moduleContent[i] && homeAllData[menuIndex].subContent[moduleIndex].moduleContent[i].pics;
            var picSrc = nowPics && nowPics[picType];
            if (picSrc) {
                $aBlock.item(i).find(".images img").length && $aBlock.item(i).find(".images img").attr("src", picSrc);
            } else {
                $aBlock.item(i).find(".orderImg").addClass("noContent");
                $aBlock.item(i).find(".images").addClass("noContent");
            }
            if (moduleType === '13' && !picSrc) {
                $aBlock.item(i).find(".images").addClass("noBgColor"); //13模块去掉白色bg
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
        preImg(menuIndex, moduleIndex);
    }
    function keepService(menuIndex, moduleIndex){
        var nowType = "module" + homeAllData[menuIndex].subContent[moduleIndex].moduleType;
        if (modules[nowType] && modules[nowType].keepService) {
            modules[nowType].keepService(menuIndex, moduleIndex);
        }
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
    function preImg(menuIndex, moduleIndex) {
        var nowType = "module" + homeAllData[menuIndex].subContent[moduleIndex].moduleType;
        if (modules[nowType] && modules[nowType].preImg) {
            modules[nowType].preImg(menuIndex, moduleIndex)
        }
    }
    for (var i = 0; i < $aModules.length; i++) {
        var nowId = "m" + menuIndex + "m" + i;
        var nowEl = $("#" + nowId)[0];
        var offTop = getPositionTop(nowEl);
        var offBottom = offTop + nowEl.offsetHeight;
        if (offBottom - sectionTranslateY > 0 && offTop - sectionTranslateY < oWrapBottom - 224) {
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
    clearTimeout(autoImgTimer);
    autoImgTimer = setTimeout(function () {
        loadImg(menuIndex);
    }, 500);
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
        if(p_moduleInfo.hasOwnProperty('carouseIndex')){
            saveObj.carouseIndex = p_moduleInfo.carouseIndex;
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
                    iInnerImgType = "82";
                } else if (data.length === 2) {
                    picType = ["62", "62"];
                    iInnerImgType = "83";
                } else if (data.length === 3) {
                    picType = ["63", "63", "63"];
                    iInnerImgType = "84";
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
            var $returnTopWrap = $('<div class="returnTopWraps"><div id="returnTop' + menuIndex + '">返回顶部</div></div>');
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
            picType: ["66", "66", "66"],
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
            maxLen: 1,
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
            carouseIndex: 6, // 用来记录当前的轮播图索引
            isAct: false, // 返回是否落焦
            carouseInfo: {
                timer: null
            },
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
            return this.info.activeNum > 4 ? 12 == this.info.activeNum ? (this.info.activeNum = this.info.carouseIndex, this.focus(), !1) : {
                direction: "down",
                leftDistance: 0,
                id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
            } : (this.info.activeNum > 1 ? this.info.activeNum++ : 0 != this.info.activeNum && 1 != this.info
                .activeNum || (this.info.activeNum = 12), this.focus(), !1)
        },
        ok: function () {
            var nowData = this.info.data[this.info.activeNum];
            if (this.info.activeNum == 12) {
                var nowData = this.info.data[this.info.carouseIndex];
            }
            nowData.categoryId = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].categoryId;
            $.gotoDetail(nowData);
        },
        keepService: function(menuIndex, moduleIndex){
            this.loadService(menuIndex, moduleIndex);
        },
        loadService: function (menuIndex, moduleIndex) {
            if(!this.info.isAct){
                this.autoPlay(menuIndex, moduleIndex);
            }
        },
        createEl: function (menuIndex, moduleIndex) {
            var info = this.info;
            if (pageInfo && /@/.test(pageInfo.carouseIndex)) {
                var type = pageInfo.carouseIndex.split('@')[0];
                var index = pageInfo.carouseIndex.split('@')[1];
                if(type === "module25"){
                    this.info.carouseIndex = +index;
                    pageInfo.carouseIndex = 0;
                }
            }else {
                this.info.carouseIndex = 6;
            }
            var htmlTxt = '<div class="listBg"></div>';
            htmlTxt += createNorEl(menuIndex, moduleIndex, info.norLen, info.elType, "notrany", info.picType);
            for (var i = 0, j = 6; i < info.listLen; i++, j++) {
                htmlTxt += '<div class="notrany lists blocks block' + j + (j == 6 ? " current" : "") + '" id="m' + menuIndex + "m" + moduleIndex + "m" + j + '">' + '<div class="contentTitle hide"></div>' + flashlightHtml + "</div>";
            }
            var srcTxt = homeAllData[menuIndex].subContent[moduleIndex].moduleContent[info.norLen].pics[info.listPicType] || '';
            htmlTxt += '<div class="vodWindow noContent block12" id="m' + menuIndex + "m" + moduleIndex + "m" + j + '"><img src="' + srcTxt + '"></div>';
            return htmlTxt;
        },
        addCurrent: function (menuIndex, moduleIndex) {
            var moduleId = "#m" + menuIndex + "m" + moduleIndex;
            var $aBlock = $(moduleId + " .blocks", moduleId, !0);
            $aBlock.removeClass("current");
            $aBlock.item(this.info.carouseIndex).addClass("current");
        },
        showVodPic: function (menuIndex, moduleIndex) {
            var moduleId = "m" + menuIndex + "m" + moduleIndex;
            this.addCurrent(menuIndex, moduleIndex);
            var nowData = homeAllData[menuIndex].subContent[moduleIndex].moduleContent[this.info.carouseIndex];
            $("#" + moduleId + " .vodWindow img").show().attr({
                src: nowData && nowData.pics[this.info.listPicType] || ''
            });
        },
        autoPlay: function (menuIndex, moduleIndex) {
            if(!this.info.carouseInfo.timer){
                var that = this;
                this.info.carouseInfo.timer = setInterval(that.playNext.bind(that, menuIndex, moduleIndex), 3e3);
            }
        },
        playNext: function (menuIndex, moduleIndex) {
            if (this.info.carouseIndex === this.info.maxLen - 1) {
                this.info.carouseIndex = this.info.norLen;
            } else {
                this.info.carouseIndex++;
            }
            this.showVodPic(menuIndex, moduleIndex);
        },
        stopAutoPlay: function (menuIndex, moduleIndex) {
            if(this.info.carouseInfo.timer){
                clearInterval(this.info.carouseInfo.timer);
                this.info.carouseInfo.timer = null;
            }
        },
        focus: function (isMove, isFromVol) {
            var info = this.info;
            info.isAct = true;
            if (info.activeNum > info.norLen - 1) {
                info.activeNum != 12 && (info.carouseIndex = info.activeNum);
                this.showVodPic(info.menuIndex, info.moduleIndex);
                this.stopAutoPlay(info.menuIndex, info.moduleIndex);
            } else {
                this.autoPlay(info.menuIndex, info.moduleIndex);
            }
            focusTo(isMove, info.menuIndex, info.moduleIndex, info.activeNum);
        },
        blur: function (isGotoOterPage) {
            this.info.isAct = false;
            this.autoPlay(this.info.menuIndex, this.info.moduleIndex);
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
    module52: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            carouseIndex: 0, // 用来记录当前的轮播图索引
            isAct: false, // 返回是否落焦
            carouseInfo: {
                block: 1, // 模块内轮播开始的位置.
                data: null,
                dataLength: 0,
                timer: null
            },
            picType: ['3', '127', '64', '64'],
            maxLen: 7,
            firstLineKey: [0, 1, 2],
            lastLineKey: [0, 1, 3],
            leftDistanceArr: [204,  960, 1534, 1534],
            data: null,
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
        deActive: function () { 
            this.blur();
        },
        createEl: function (menuIndex, moduleIndex) {
            var info = this.info;
            if (pageInfo && /@/.test(pageInfo.carouseIndex)) {
                var type = pageInfo.carouseIndex.split('@')[0];
                var index = pageInfo.carouseIndex.split('@')[1];
                if(type === "module52"){
                    info.carouseIndex = +index;
                    pageInfo.carouseIndex = 0;
                }
            }else {
                info.carouseIndex = 0;
            }
            var data = homeAllData[menuIndex].subContent[moduleIndex].moduleContent || [];
            data && (info.data = data.slice(0, Math.min(data.length, info.maxLen)));
            var carouseData = data.slice(info.carouseInfo.block, -2);
            // 初始化轮播数据
            info.carouseInfo.data = carouseData;
            info.carouseInfo.dataLength = carouseData.length;
            // 拼接需要渲染的数据
            var renderData = data.slice(0, 1).concat([carouseData[info.carouseIndex]]).concat(data.slice(-2));
            var htmlTxt = '';
            var docItem = '';
            for (var i = 0; i < carouseData.length; i++) {
                docItem += '<div class="dot'+(i === info.carouseIndex ? ' current': '')+'"></div>';
            }
            for (k in renderData) {
                var Imgsrc = renderData[k].pics && renderData[k].pics[info.picType[k]] || '';
                htmlTxt += '<div class="noContent blocks block' + k + (k == info.carouseInfo.block ? " carouse" : "") +'"  id="m' + menuIndex + "m" + moduleIndex + "m" + k + '"><img src="' + Imgsrc + '">'
                + (k == info.carouseInfo.block ? '<div class="dots">' + docItem + '</div>' : '')
                +'</div>';
            };
            return htmlTxt;
        },
        left: function () {
            var info = this.info;
            if (info.activeNum === 0) {
                return {
                    direction: "down",
                    leftDistance: 1e4,
                    id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                };
            } else if(info.activeNum === 3){
                info.activeNum = 1;
            } else {
                info.activeNum--;
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
                this.info.activeNum++;
                this.focus();
                return false;
            }
        },
        up: function () {
            if (this.info.activeNum === 3) {
                this.info.activeNum--;
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
            if (this.info.activeNum === 2) {
                this.info.activeNum++;
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
            var info = this.info;
            var nowData = null;
            var compare = info.activeNum - info.carouseInfo.block;
            if( compare < 0 ){
                nowData = info.data[info.activeNum]
            } else if(compare === 0 ){
                nowData = info.data[info.activeNum + info.carouseIndex];
            } else{
                nowData = info.data[info.carouseInfo.block + info.carouseInfo.dataLength + compare - 1 ];
            }
            nowData.categoryId = homeAllData[info.menuIndex].subContent[info.moduleIndex].categoryId;
            $.gotoDetail(nowData);
        },
        loadService: function (menuIndex, moduleIndex) {
            if(!this.info.isAct){
                this.autoPlay(menuIndex, moduleIndex);
            }
        },
        // 3.0+盒子左右移不会清空 DOM.要实现左右移暂停定时器, 移回来之后继续开始,用此方法
        keepService: function(menuIndex, moduleIndex){
            var info = this.info;
            var data = homeAllData[menuIndex].subContent[moduleIndex].moduleContent || [];
            data && (info.data = data.slice(0, Math.min(data.length, info.maxLen)));
            var carouseData = data.slice(info.carouseInfo.block, -2);
            // 更新轮播数据
            info.carouseInfo.data = carouseData;
            info.carouseInfo.dataLength = carouseData.length;
            this.loadService(menuIndex, moduleIndex);
        },
        addCurrent: function (menuIndex, moduleIndex) {
            var moduleId = "#m" + menuIndex + "m" + moduleIndex;
            var $curBot = $(moduleId + " .dot", moduleId, true);
            $curBot.removeClass("current");
            $curBot.item(this.info.carouseIndex).addClass("current");
        },
        showPic: function (menuIndex, moduleIndex) {
            var info = this.info;
            var moduleId = "m" + menuIndex + "m" + moduleIndex;
            var picType = +info.picType[info.carouseInfo.block];
            var pics =  info.carouseInfo.data[info.carouseIndex].pics;
            this.addCurrent(menuIndex, moduleIndex);
            $("#" + moduleId + " .carouse img").attr({
                src: pics && pics[picType] || ""
            });
        },
        autoPlay: function (menuIndex, moduleIndex) {
            if(!this.info.carouseInfo.timer && this.info.carouseInfo.dataLength > 1){
                var that = this;
                this.info.carouseInfo.timer = setInterval(that.playNext.bind(that, menuIndex, moduleIndex), 3e3);
            }
        },
        playNext: function (menuIndex, moduleIndex) {
            var info = this.info;
            if (info.carouseIndex >= info.carouseInfo.dataLength - 1) {
                info.carouseIndex = 0;
            } else {
                info.carouseIndex++;
            }
            this.showPic(menuIndex, moduleIndex);
        },
        stopAutoPlay: function () {
            if(this.info.carouseInfo.timer){
                clearInterval(this.info.carouseInfo.timer);
                this.info.carouseInfo.timer = null;
            }
        },
        focus: function (isMove) {
            var info = this.info;
            info.isAct = true;
            if(info.activeNum === info.carouseInfo.block){
                this.stopAutoPlay();
            } else {
                this.autoPlay(info.menuIndex, info.moduleIndex);
            }
            focusTo(isMove, info.menuIndex, info.moduleIndex, info.activeNum);
        },
        blur: function () {
            this.info.isAct = false;
            this.autoPlay(this.info.menuIndex, this.info.moduleIndex);
        }
    },
};

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
            picSrc && show();
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