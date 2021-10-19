$.getElem = function (id) {
    return $("#" + id)[0];
};

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
        $nowSection.html("");
        for (var i = 0; i < pageData.length; i++) {
            var moduleName = "module" + pageData[i].moduleType;
            var $module = $('<div class="modules ' + moduleName + '" id="m' + menuIndex + "m" + i + '"></div>');
            var $moduleTitle = null;
            var $blockWrap = $('<div class="blockWrap"></div>');
            if (pageData[i].moduleTitle !== "null") {
                $moduleTitle = $('<div class="moduleTitle">' + pageData[i].moduleTitle + "</div>");
                $moduleTitle.appendTo($module);
            }
            $blockWrap.html(modules[moduleName].createEl(menuIndex, i));
            $blockWrap.appendTo($module);
            $module.appendTo($nowSection);
        }
    } catch (e) {
        $.log.out.error = ["homeError:%s(%s)-%s", homeAllData[menuIndex].contentName, menuIndex, i, e];
    }         
}

function autoSizePlay(menuIndex) {
    var typeMap = {
        32: 1,
        33: 1,
        34: 1,
        // 35: 1,
        39: 1,
        40: 1,
        51: 1,
        54: 1,
        55: 1,
        56: 1,
        41: 1
    };
    var sizeMap = {
        32: {
            left: 94,
            top: 135,
            width: 849,
            height: 491
        },
        33: {
            left: 538,
            top: 135,
            width: 888,
            height: 500
        },
        34: {
            left: 90,
            top: 135,
            width: 899,
            height: 500
        },
        39: {
            left: 90,
            top: 135,
            width: 1263,
            height: 714
        },
        40: {
            left: 373,
            top: 215,
            width: 1173,
            height: 665
        },
        51: {
            left: 95,
            top: 135,
            width: 880,
            height: 503
        },
        54: {
            left: 90,
            top: 135,
            width: 1077,
            height: 500
        },
        55: {
            left: 94,
            top: 135,
            width: 849,
            height: 491
        },
        56: {
            left: 90,
            top: 135,
            width: 1077,
            height: 500
        },
        41:{
            left: 530,
            top: 148,
            width: 862,
            height: 484
        }
    };
    var moduleInfo = null;
    $.UTIL.each(typeMap, function(value, key) {
        var moduleData = findModule(key);
        if (moduleData) {
            moduleInfo = moduleData;
            return true;
        }
    });
    var vodMap = {
        32: 1,
        33: 1,
        34: 1,
        51: 1,
        55: 1,
        41: 1
    };
    var liveMap = {
        39: 1
    };
    var picMap = {
        54: 1,
        56: 1
    };
    var vodOrLive = {
        40: 1
    }
    if (moduleInfo) {
        if (sizeMap[moduleInfo.moduleType]) {
            var $size = $("#m" + menuIndex + "m" + moduleInfo.index + " .sizeVideo");
            sizeMap[moduleInfo.moduleType].top = windowPosition.getPositionTop($size[0]) + wrapTop;
        }
        if (vodMap[moduleInfo.moduleType]) {
            playVod();
            modules["module" + moduleInfo.moduleType].moveList && modules["module" + moduleInfo.moduleType].moveList()
        } else if (liveMap[moduleInfo.moduleType]) {
            playLive();
        } else if (picMap[moduleInfo.moduleType]) {
            playPic();
        } else if (vodOrLive[moduleInfo.moduleType]) {
            isLiveOrVod();
        }
    } else {
        sizeVideo.release();
    }

    function isLiveOrVod(){
        var begin = modules["module" + moduleInfo.moduleType].info.begin;
        var nowData = moduleInfo.data[begin + sizePlayIndex];
        var nowModule = modules["module" + moduleInfo.moduleType];
        if(/^channel:\/\/(.*)/.test(nowData.contentUri)){
            var channelId = nowModule.info.channelId = RegExp.$1;
            if(/^~/.test(channelId)){
                var channelNum = channelId.replace("~", "");
                nowModule.info.activeChannelNum = channelNum;
                playLive(channelNum);
                return true;
            }
            playLive()
        } else if(/^vodId:\/\/(.*)/.test(nowData.contentUri)){
            var contentid = RegExp.$1;
            nowModule.info.vodId = RegExp.$1;
            playVod(contentid)
        } 
    }
    function playVod(contentid) {
        var opt = {};
        var begin = modules["module" + moduleInfo.moduleType].info.begin;
        // var end = Math.min(moduleInfo.data.length, modules["module" + moduleInfo.moduleType].info.maxLen - modules["module" + moduleInfo.moduleType].info.noListLength) - 1;
        var end = Math.min(moduleInfo.data.length, modules["module" + moduleInfo.moduleType].info.maxLen) - modules["module" + moduleInfo.moduleType].info.noListLength - 1;
        var nowData = moduleInfo.data[begin + sizePlayIndex];
        var nameArr = nowData.contentName.split("@");
        var type = "";
        var contentId = contentid || nameArr[(moduleInfo.moduleType == 32 || moduleInfo.moduleType == 41 ) ? 2 : 1];
        if (contentId) {
            type = "vod";
        } else {
            type = "pic";
        }
        opt = {
            type: type,
            left: sizeMap[moduleInfo.moduleType].left,
            top: sizeMap[moduleInfo.moduleType].top,
            width: sizeMap[moduleInfo.moduleType].width,
            height: sizeMap[moduleInfo.moduleType].height,
            categoryId: moduleInfo.categoryId,
            moduleIndex: moduleInfo.index,
            list: [ {
                contentId: contentId,
                name: nameArr[0]
            } ],
            picSrc: nowData.pics && nowData.pics[127],
            onPlay: function() {
                var nowModuleId = "#m" + menuIndex + "m" + moduleInfo.index;
                var $infos = $(nowModuleId + ' .lists', nowModuleId + " .list_wrap", true);
                $(nowModuleId + " .current").removeClass("current");
                $infos.item(sizePlayIndex).addClass("current");
            },
            onEnd: function() {
                sizePlayIndex++;
                if (sizePlayIndex > end-begin) {
                    sizePlayIndex = 0;
                }
                playVod();
            }
        };
        sizeVideo.subPlay(opt);
    }
    function playLive(ChannelNum) {
        var opt = {};
        var begin = modules["module" + moduleInfo.moduleType].info.begin;
        var nowData = moduleInfo.data[begin + sizePlayIndex];
        var type = "channel";
        var channelId = nowData.contentUri.replace(/^channel:\/\/~?(\d+)/, function(result) {
            return RegExp.$1;
        });
        opt = {
            type: type,
            left: sizeMap[moduleInfo.moduleType].left,
            top: sizeMap[moduleInfo.moduleType].top,
            width: sizeMap[moduleInfo.moduleType].width,
            height: sizeMap[moduleInfo.moduleType].height,
            categoryId: moduleInfo.categoryId,
            moduleIndex: moduleInfo.index,
            channelNum: ChannelNum || $.getChanById(channelId).num,
            onPlay: function() {
                var $el = $("#m" + menuIndex + "m" + moduleInfo.index + "m" + (begin + sizePlayIndex));
                $("#m" + menuIndex + "m" + moduleInfo.index + " .current").removeClass("current");
                if (!$el.hasClass("focusBorder")) {
                    $el.addClass("current");
                }
            }
        };
        sizeVideo.subPlay(opt);
    }
    function playPic() {
        var opt = {};
        // var nowModule = modules["module" + moduleInfo.moduleType];
        // var end = Math.min(moduleInfo.data.length, nowModule.info.maxEnd);
        // var nowData = nowModule.info.data[sizePlayIndex];
        var begin = modules["module" + moduleInfo.moduleType].info.begin;
        // var end = Math.min(moduleInfo.data.length, modules["module" + moduleInfo.moduleType].info.maxLen - modules["module" + moduleInfo.moduleType].info.noListLength) - 1;
        var end = Math.min(moduleInfo.data.length, modules["module" + moduleInfo.moduleType].info.maxLen) - modules["module" + moduleInfo.moduleType].info.noListLength - 1;
        var nowData = moduleInfo.data[begin + sizePlayIndex];
        var type = "pic";
        opt = {
            type: type,
            categoryId: moduleInfo.categoryId,
            picSrc: nowData.pics && nowData.pics[78],
            moduleIndex: moduleInfo.index,
            onPlay: function() {
                var nowModuleId = "#m" + menuIndex + "m" + moduleInfo.index;
                var $infos = $(nowModuleId + ' .lists', nowModuleId + " .list_wrap", true);
                $(nowModuleId + " .current").removeClass("current");
                $infos.item(sizePlayIndex).addClass("current");
            },
            onEnd: function() {
                sizePlayIndex++;
                if (sizePlayIndex > end) {
                    sizePlayIndex = 0;
                }
                playPic();
            }
        };
        sizeVideo.subPlay(opt);
    }
}

function findModule(moduleType) {
    var moduleData = null;
    var menuIndex = $.pTool.get("p_module").getInfo().subIndex;
    var nowSubData = homeAllData[menuIndex].subContent;
    $.UTIL.each(nowSubData, function(value, index) {
        if (value.moduleType == moduleType) {
            moduleData = {
                index: index,
                data: value.moduleContent,
                moduleType: moduleType,
                categoryId: value.categoryId
            };
            return true;
        }
    });
    return moduleData;
}
function removeOneSection() {
    $("#section" + $.pTool.get("p_module").getInfo().preSubIndex).html("");
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
            if (d && d.contentName) {
                var contentName = d.contentName;
                if(pageData[i].moduleType == "4" && $aBlock.item(j).hasClass('ver') && /^#/.test(contentName)){
                    $aBlock.item(j).addClass('noContentTitle')
                }
                if (pageData[i].moduleType == "39") {
                    var channelId = d.contentUri.replace(/^channel:\/\/~?(\d+)/, function(result) {
                        return RegExp.$1;
                    });
                    contentName = $.getChanById(channelId) && $.getChanById(channelId).name;
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

var firstSizePlay = true;
var stopPicPlay = false;

function setTranslateX(menuIndex, isFirst) {
    var sectionWidth = 1920;
    $("#section").css({
        "-webkit-transform": "translateX(" + -sectionWidth * menuIndex + "px)"
    });
    canvasBg(menuIndex);
    sendRecord(menuIndex, isFirst ? 0 : 400);
    if (firstSizePlay) {
        firstSizePlay = false;
    } else {
        sizePlayIndex = 0;
        sizeListIndex = 0;
    }
    autoSizePlay(menuIndex);
}

var autoImgTimer = null;

function loadImg(menuIndex, isOther) {
    var $aModules = $("#section" + menuIndex + " .modules", "#section" + menuIndex, true);
    function showImg(menuIndex, moduleIndex) {
        var nowId = "m" + menuIndex + "m" + moduleIndex;
        var $nowEl = $("#" + nowId);
        if (!$nowEl.length) {
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
                $aBlock.item(i).find(".images").addClass("noContent");
            }
            var $innerImg = $aBlock.item(i).find(".innerImg");
            if ($innerImg.length) {
                $innerImg.attr("src", nowPics[$innerImg.attr("innertype")]);
                $aBlock.item(i).addClass("hasInner");
            }
        }
        loadService(menuIndex, moduleIndex);
        loadAuth(menuIndex, moduleIndex);
        loadPreImg(menuIndex, moduleIndex);
    }

    function loadService(menuIndex, moduleIndex) {
        var nowType = "module" + homeAllData[menuIndex].subContent[moduleIndex].moduleType;
        if (modules[nowType] && modules[nowType].loadService) {
            modules[nowType].loadService(menuIndex, moduleIndex);
        }
    }
    function loadAuth() {}
    function loadPreImg(menuIndex, moduleIndex) {
        var nowType = "module" + homeAllData[menuIndex].subContent[moduleIndex].moduleType;
        if (modules[nowType] && modules[nowType].preImg) {
            modules[nowType].preImg(menuIndex, moduleIndex);
        }
    }
    for (var i = 0; i < $aModules.length; i++) {
        showImg(menuIndex, i);
    }
    if (isOther) {
        return;
    }
    loadImg(menuIndex - 1, true);
    loadImg(menuIndex + 1, true);
}

function autoLoadImg(menuIndex, time) {
    clearTimeout(autoImgTimer);
    autoImgTimer = setTimeout(function() {
        loadImg(menuIndex);
    }, time);
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
    var $contentTitleId = "#" + elId + " ." + (marqueeEl || "contentTitle");
    var marqueeObj = {
        el: "#" + elId,
        marquee: [$contentTitleId]
    };
    $.focusTo(marqueeObj);
}

function saveData(activeNum) {
    var p_moduleInfo = $.pTool.get("p_module").getInfo();
    var saveObj = {
        type: p_moduleInfo.type,
        menuTranslateX: modules.menu.info.translatePosition,
    };
    saveObj.menuIndex = p_moduleInfo.subIndex;
    saveObj.moduleIndex = p_moduleInfo.moduleIndex;
    saveObj.activeNum = p_moduleInfo.activeNum;
    saveObj.sizePlayIndex = sizePlayIndex;
    saveObj.sizeListIndex = sizeListIndex;
    //图片暂停播放状态重置
    stopPicPlay = false;
    if (p_moduleInfo.type === "module35") {
        var moduleId = "m" + p_moduleInfo.subIndex + "m" + p_moduleInfo.moduleIndex;
        saveObj.module35Index = modules.module35.info.moduleInfo[moduleId].index;
    }
    if(p_moduleInfo.type === 'module41'){
        saveObj.module41RightListIndex = modules.module41.info.rightListIndex
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
        blur: function () { }
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
        blur: function () { }
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
        blur: function () { }
    },
    
};

var modules = {
    menu: {
        info: {
            menuIndex: 0,
            fixPosition: 60,
            menuWidth: 0,
            translatePosition: 0,
            paddingWidth: 60,
            position: [],
        },
        active: function (info) {
            info && typeof info.menuIndex !== "undefined" && (this.info.menuIndex = info.menuIndex);
            this.focus(this.info.menuIndex);
            $("#menu div", "#menu", true).removeClass("disappear");
            this.checkLeft(this.info.menuIndex);
            this.checkRight(this.info.menuIndex);
        },
        deActive: function () {
            this.blur(this.info.menuIndex);
        },
        checkLeft: function (i) {
            "left" === this.checkOver(i) && (0 === i ? this.setTranslateX(0) : this.setTranslateX(this.info.position[i].left - this.info.fixPosition))
        },
        checkRight: function (i) {
            "right" === this.checkOver(i) && (i === homeAllData.length - 1 ? this.setTranslateX(this.info.menuWidth - 2 * this.info.paddingWidth - 1740) : this.setTranslateX(this.info.position[i].right - 1740 + this.info.fixPosition))
        },
        left: function () {
            return 0 != this.info.menuIndex && (this.info.menuIndex-- , this.focus(), this.checkLeft(this.info.menuIndex), {
                menuIndex: this.info.menuIndex
            })
        },
        right: function () {
            return this.info.menuIndex != homeAllData.length - 1 && (this.info.menuIndex++ , this.focus(), this.checkRight(this.info.menuIndex), {
                menuIndex: this.info.menuIndex
            })
        },
        up: function () {
            this.blur(this.info.menuIndex);
            return {
                direction: "up",
                leftDistance: 0,
                menuIndex: this.info.menuIndex
            };
        },
        down: function () {},
        ok: function () { },
        checkOver: function (i) {
            return this.info.position[i].right - this.info.translatePosition > 1740 ? "right" : this.info.position[i].left - this.info.translatePosition < 0 ? "left" : undefined
        },
        setTranslateX: function (translateX) {
            if(this.info.menuWidth < 1920){
                $("#menu").css({
                    "-webkit-transform": "translateX(-50%)",
                    "left": (1920 - this.info.fixPosition - this.info.paddingWidth)/2 + 'px'
                });
                return true;
            }
            this.info.translatePosition = translateX;
            $("#menu").css({
                "-webkit-transform": "translateX(-" + translateX + "px)",
            })
        },
        init: function () { },
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
    module32: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            picType: ["","","67"],
            begin: 0,
            noListLength: 1,
            maxLen: 9,
            list_fixed: 2,
            list_length: 4,
            list_height: 123,
            firstLineKey: [0, 1, 2],
            lastLineKey: [0, 1, 2],
            leftDistanceArr: [471, 1135, 1608],
            data: [],
            oneData: [],
        },
        active: function (info) {
            this.info.direction = info.direction;
            this.info.leftDistance = info.leftDistance;
            this.info.menuIndex = info.menuIndex;
            this.info.moduleIndex = info.moduleIndex;
            this.info.data = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].moduleContent;
            var sliceData = this.info.data.length && this.info.data.slice(0, Math.min(this.info.data.length, this.info.maxLen));
            this.info.data && (this.info.data = sliceData.slice(0, sliceData.length - 1));
            this.info.oneData && (this.info.oneData = sliceData.slice(-1));
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
            var data = homeAllData[menuIndex].subContent[moduleIndex].moduleContent;
            var sliceData = data.length && data.slice(0, Math.min(data.length, this.info.maxLen));
            sliceData.length && (info.data = sliceData.slice(0, sliceData.length - 1));
            sliceData.length && (info.oneData = sliceData.slice(-1));
            data = sliceData = null;

            var htmlTxt = '';
            var leftWrap = '<div class="sizeVideo noPlayer blocks block0" id="' + moduleId + 'm' + 0 + '"><img src=""></div>';
            var rightDes = $.substringElLength(info.oneData[0].contentName, "26", '890px').last || '';
            var rightSrcTxt = info.oneData[0].pics[info.picType[2]] || '';
            var rightWrap = '<div class="blocks block2" id="' + moduleId + 'm' + 2 + '"><div class="images"><img src="' + rightSrcTxt + '"></div><div class="des">' + rightDes + '</div></div>';
            var middleWrap = '';
            var listTitle = '';
            var listSubTitle = '';

            $.UTIL.each(info.data, function (value, index) {
                listTitle = '';
                listSubTitle = '';
                if (value.contentName) {
                    if (/@/.test(value.contentName)) {
                        listTitle = /#/.test(value.contentName.split('@')[0]) ? '' : value.contentName.split('@')[0];
                        listSubTitle = /#/.test(value.contentName.split('@')[1]) ? '' : value.contentName.split('@')[1];
                    } else {
                        listTitle = /#/.test(value.contentName) ? '' : value.contentName;
                    }
                }
                middleWrap += '<div class="lists list' + index + (index === sizePlayIndex ? ' current' : '') + '">' + '<div class="mainTitle">' + listTitle + '</div><div class="subTitles">' + listSubTitle + '</div>' + flashlightHtml + '</div>';
            })
            htmlTxt = leftWrap + '<div class="blocks block1" id="' + moduleId + 'm' + 1 + '"><div class="list_wrap">' + middleWrap + '</div></div>' + rightWrap;
            return htmlTxt;
        },
        loadService: function () {
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
            if (this.info.activeNum === 1 && sizeListIndex > 0) {
                sizeListIndex--;
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
            if (this.info.activeNum === 1 && sizeListIndex + 1 < this.info.data.length) {
                sizeListIndex++;
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
                nowData = this.info.oneData[0];
                nowData.categoryId = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].categoryId;
            } else {
                if (this.info.activeNum === 1 && sizePlayIndex !== sizeListIndex) {
                    sizePlayIndex = sizeListIndex;
                    this.info.vodPlaying && (this.info.vodPlaying = false);
                    autoSizePlay(this.info.menuIndex);
                    return true;
                }
                nowData = this.info.data[sizePlayIndex];
                nowData.categoryId = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].categoryId;
            }
            $.gotoDetail(nowData);
        },
        moveList: function () {
            var moduleId = "#m" + this.info.menuIndex + "m" + this.info.moduleIndex;
            var fix_end_index = this.info.list_length - this.info.list_fixed - 1
            var list_begin = sizeListIndex - this.info.list_fixed;
            var list_begin_length = this.info.data.length - this.info.list_fixed - fix_end_index;
            var top = 0;
            if(list_begin <= 0){
                top = 0;
            } else if(list_begin >= list_begin_length){
                top = - (list_begin_length - 1) * this.info.list_height;
            }else{
                top = - list_begin * this.info.list_height
            }
            $(moduleId + " .list_wrap").css({
                top: top + "px"
            })
        },
        focus: function (isMove) {
            var moduleId = "#m" + this.info.menuIndex + "m" + this.info.moduleIndex;
            if (this.info.activeNum === 1) {
                var findIndex = moduleId + " .list_wrap " + '.list' + sizeListIndex;
                var focusHtml = {
                    el: findIndex,
                    marquee: [findIndex + " .mainTitle"]
                };
                $.focusTo(focusHtml)
            } else {
                focusTo(isMove, this.info.menuIndex, this.info.moduleIndex, this.info.activeNum);
            }
        },
        blur: function () {}
    },
    module33: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            picType: ["3","",""],
            maxLen: 9,
            begin: 1,
            noListLength: 0,
            list_fixed: 3,
            list_length: 6,
            list_height: 83,
            firstLineKey: [0, 1, 2],
            lastLineKey: [0, 1, 2],
            leftDistanceArr: [204, 1000, 1608],
            data: [],
            oneData: [],
        },
        active: function (info) {
            this.info.direction = info.direction;
            this.info.leftDistance = info.leftDistance;
            this.info.menuIndex = info.menuIndex;
            this.info.moduleIndex = info.moduleIndex;
            this.info.data = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].moduleContent;
            var sliceData = this.info.data.length && this.info.data.slice(0, Math.min(this.info.data.length, this.info.maxLen));
            this.info.data && (this.info.data = sliceData.slice(1, sliceData.length));
            this.info.oneData && (this.info.oneData = sliceData.slice(0, 1));
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
            var data = homeAllData[menuIndex].subContent[moduleIndex].moduleContent;
            var sliceData = data.length && data.slice(0, Math.min(data.length, this.info.maxLen));
            sliceData.length && (info.data = sliceData.slice(1, sliceData.length));
            sliceData.length && (info.oneData = sliceData.slice(0, 1));
            data = sliceData = null;

            var htmlTxt = '';
            var el_video = '<div class="sizeVideo noPlayer blocks block1" id="' + moduleId + 'm' + 1 + '"><img src=""></div>';
            var picSrcTxt = info.oneData[0].pics[info.picType[0]] || '';
            var el_pic = '<div class="blocks block0" id="' + moduleId + 'm' + 0 + '"><div class="images"><img src="' + picSrcTxt + '"></div></div>';
            var el_list = '';
            var listTitle = '';

            $.UTIL.each(info.data, function (value, index) {
                listTitle = '';
                if (value.contentName) {
                    if (/@/.test(value.contentName)) {
                        listTitle = /#/.test(value.contentName.split('@')[0]) ? '' : value.contentName.split('@')[0];
                    } else {
                        listTitle = /#/.test(value.contentName) ? '' : value.contentName;
                    }
                }
                el_list += '<div class="lists list' + index + (index === sizePlayIndex ? ' current' : '') + '">' + '<div class="mainTitle">' + listTitle + '</div>' + flashlightHtml + '</div>';
            })
            htmlTxt = el_pic + el_video + '<div class="blocks block2" id="' + moduleId + 'm' + 2 + '"><div class="list_wrap">' + el_list + '</div></div>';
            return htmlTxt;
        },
        loadService: function () {
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
            if (this.info.activeNum === 2 && sizeListIndex > 0) {
                sizeListIndex--;
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
            if (this.info.activeNum === 2 && sizeListIndex + 1 < this.info.data.length) {
                sizeListIndex++;
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
            if (this.info.activeNum === 0) {
                nowData = this.info.oneData[0];
                nowData.categoryId = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].categoryId;
            } else {
                if (this.info.activeNum === 2 && sizePlayIndex !== sizeListIndex) {
                    sizePlayIndex = sizeListIndex;
                    this.info.vodPlaying && (this.info.vodPlaying = false);
                    autoSizePlay(this.info.menuIndex);
                    return true;
                }
                nowData = this.info.data[sizePlayIndex];
                nowData.categoryId = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].categoryId;
            }
            $.gotoDetail(nowData);
        },
        moveList: function () {
            var moduleId = "#m" + this.info.menuIndex + "m" + this.info.moduleIndex;
            var fix_end_index = this.info.list_length - this.info.list_fixed - 1
            var list_begin = sizeListIndex - this.info.list_fixed;
            var list_begin_length = this.info.data.length - this.info.list_fixed - fix_end_index;
            var top = 0;
            if(list_begin <= 0){
                top = 0;
            } else if(list_begin >= list_begin_length){
                top = - (list_begin_length - 1) * this.info.list_height;
            }else{
                top = - list_begin * this.info.list_height
            }
            $(moduleId + " .list_wrap").css({
                top: top + "px"
            })
        },
        focus: function (isMove) {
            var moduleId = "#m" + this.info.menuIndex + "m" + this.info.moduleIndex;
            if (this.info.activeNum === 2) {
                var findIndex = moduleId + " .list_wrap " + '.list' + sizeListIndex;
                var focusHtml = {
                    el: findIndex,
                    marquee: [findIndex + " .mainTitle"]
                };
                $.focusTo(focusHtml)
            } else {
                focusTo(isMove, this.info.menuIndex, this.info.moduleIndex, this.info.activeNum);
            }
        },
        blur: function () {}
    },
    module34: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            picType: [""],
            maxLen: 8,
            begin: 0,
            noListLength: 0,
            list_fixed: 2,
            list_length: 6,
            list_height: 83,
            firstLineKey: [0, 1],
            lastLineKey: [0, 1],
            leftDistanceArr: [400, 1294],
            data: [],
        },
        active: function (info) {
            this.info.direction = info.direction;
            this.info.leftDistance = info.leftDistance;
            this.info.menuIndex = info.menuIndex;
            this.info.moduleIndex = info.moduleIndex;
            this.info.data = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].moduleContent;
            var sliceData = this.info.data.length && this.info.data.slice(0, Math.min(this.info.data.length, this.info.maxLen));
            this.info.data && (this.info.data = sliceData.slice(0, sliceData.length));
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
            var data = homeAllData[menuIndex].subContent[moduleIndex].moduleContent;
            var sliceData = data.length && data.slice(0, Math.min(data.length, this.info.maxLen));
            sliceData.length && (info.data = sliceData.slice(0, sliceData.length));
            data = sliceData = null;

            var htmlTxt = '';
            var el_video = '<div class="sizeVideo noPlayer blocks block0" id="' + moduleId + 'm' + 0 + '"><img src=""></div>';
            var el_list = '';
            var listTitle = '';

            $.UTIL.each(info.data, function (value, index) {
                listTitle = '';
                if (value.contentName) {
                    if (/@/.test(value.contentName)) {
                        listTitle = /#/.test(value.contentName.split('@')[0]) ? '' : value.contentName.split('@')[0];
                    } else {
                        listTitle = /#/.test(value.contentName) ? '' : value.contentName;
                    }
                }
                el_list += '<div class="lists list' + index + (index === sizePlayIndex ? ' current' : '') + '">' + '<div class="mainTitle">' + listTitle + '</div>' + flashlightHtml + '</div>';
            })
            htmlTxt = el_video + '<div class="blocks block1" id="' + moduleId + 'm' + 1 + '"><div class="list_wrap">' + el_list + '</div></div>';
            return htmlTxt;
        },
        loadService: function () {
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
            if (this.info.activeNum === 1) {
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
            if (this.info.activeNum === 1 && sizeListIndex > 0) {
                sizeListIndex--;
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
            if (this.info.activeNum === 1 && sizeListIndex + 1 < this.info.data.length) {
                sizeListIndex++;
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
            if (this.info.activeNum === 1 && sizePlayIndex !== sizeListIndex) {
                sizePlayIndex = sizeListIndex;
                this.info.vodPlaying && (this.info.vodPlaying = false);
                autoSizePlay(this.info.menuIndex);
                return true;
            }
            nowData = this.info.data[sizePlayIndex];
            nowData.categoryId = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].categoryId;
            $.gotoDetail(nowData);
        },
        moveList: function () {
            var moduleId = "#m" + this.info.menuIndex + "m" + this.info.moduleIndex;
            var fix_end_index = this.info.list_length - this.info.list_fixed - 1
            var list_begin = sizeListIndex - this.info.list_fixed;
            var list_begin_length = this.info.data.length - this.info.list_fixed - fix_end_index;
            var top = 0;
            if(list_begin <= 0){
                top = 0;
            } else if(list_begin >= list_begin_length){
                top = - (list_begin_length - 1) * this.info.list_height;
            }else{
                top = - list_begin * this.info.list_height
            }
            $(moduleId + " .list_wrap").css({
                top: top + "px"
            })
        },
        focus: function (isMove) {
            var moduleId = "#m" + this.info.menuIndex + "m" + this.info.moduleIndex;
            if (this.info.activeNum === 1) {
                var findIndex = moduleId + " .list_wrap " + '.list' + sizeListIndex;
                var focusHtml = {
                    el: findIndex,
                    marquee: [findIndex + " .mainTitle"]
                };
                $.focusTo(focusHtml)
            } else {
                focusTo(isMove, this.info.menuIndex, this.info.moduleIndex, this.info.activeNum);
            }
        },
        blur: function () {}
    },
    module35:{
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            elType: ["hor", "hor", "hor", "hor"],
            picType: ["63", "64", "64", "64","64"],
            maxLen: 7,
            norLen: 0,
            dotIndex: 0,
            firstLineKey: [0, 1, 2],
            lastLineKey: [0, 3, 4],   
            leftDistanceArr: [422, 1077, 1514, 1077, 1514],
            data: [],
            moduleInfo: {},
            isFocus: false
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
        createEl: function (menuIndex, moduleIndex) {
            var info = this.info;
            var moduleId = "m" + menuIndex + "m" + moduleIndex;
            info.moduleInfo[moduleId] = { 
                index: pageInfo.module35Index,
                dotsTimer: null
            };
            var data = homeAllData[menuIndex].subContent[moduleIndex].moduleContent;
            data && (info.data = data.slice(0, Math.min(data.length, this.info.maxLen)))
            var moveData = info.data.slice(0, info.data.length - 4);
            var otherData = info.data.slice(-4);
            var newArr = moveData.slice(0, 1).concat(otherData);
            var htmlTxt = '';
            htmlTxt += createNorEl(menuIndex, moduleIndex, info.norLen, info.elType, "notrany", info.picType);
            var lis = '';
            for (k in newArr) {
                htmlTxt += '<div class="notrany lists noContent blocks block' + k + '"  id="m' + menuIndex + "m" + moduleIndex + "m" + k + '">' + '<img src="' + (newArr[k].pics[info.picType[k]] || '') + '">' + flashlightHtml + "</div>";
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
                info.activeNum === 3 ? info.activeNum -= 3 : info.activeNum--;
            }
            this.focus(1);
            return false;
        },
        right: function () {
            var info = this.info;
            if (info.activeNum == 2 || info.activeNum == 4) {
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
            var info = this.info;
            if (info.activeNum == 3 || info.activeNum == 4) {
                info.activeNum -= 2;
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
            if (info.activeNum == 1 || info.activeNum == 2) {
                info.activeNum += 2;
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
                var nowData = this.info.activeNum == 1 ? this.info.data[this.info.data.length - 4] : this.info.activeNum == 2 ? this.info.data[this.info.data.length - 3] : this.info.activeNum == 3 ? this.info.data[this.info.data.length - 2] : this.info.data[this.info.data.length - 1]
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
            var src = info.data[info.moduleInfo[moduleId].index] && info.data[info.moduleInfo[moduleId].index].pics;
            this.addCurrent(menuIndex, moduleIndex);
            $("#" + moduleId + " .block0 img").attr({
                src: src && src[picType] && src[picType] || ""
            });
        },
        autoPlay: function (menuIndex, moduleIndex) {
            var moduleId = "m" + menuIndex + "m" + moduleIndex;
            var that = this;
            this.stopAutoPlay(menuIndex, moduleIndex);
            this.info.moduleInfo[moduleId].dotsTimer = setInterval(that.playNext.bind(that, menuIndex, moduleIndex), 4e3);
        },
        playNext: function (menuIndex, moduleIndex) {
            var info = this.info;
            var moduleId = "m" + menuIndex + "m" + moduleIndex;
            if (info.moduleInfo[moduleId].index === info.data.length - 5) {
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
    module36: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            elType: ["hor", "hor", "hor", "hor", "hor", "hor"],
            picType: ["4", "4", "3", "1", "1"],
            col: 3,
            row: 2,
            maxLen: 5,
            firstLineKey: [0, 1, 2],
            lastLineKey: [3, 4, 2],
            leftDistanceArr: [305, 930, 1485, 305, 930],
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
            if (Math.floor(this.info.activeNum / this.info.col) == this.info.row - 1 || (this.info.activeNum === this.info.firstLineKey[this.info.activeNum] && this.info.activeNum === this.info.lastLineKey[this.info.activeNum])) {
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
                if(this.info.activeNum == this.info.maxLen -1){
                    this.info.activeNum = this.info.activeNum - this.info.col + 1
                }else{
                    this.info.activeNum++;
                }
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
        blur: function () { }
    },
    module37:{
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            elType: ["hor", "hor", "hor"],
            picType: ["1", "1", "1"],
            col: 3,
            row: 1,
            maxLen: 3,
            firstLineKey: [0, 1, 2],
            lastLineKey: [0, 1, 2],
            leftDistanceArr: [277, 870, 1450],
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
    module38:{
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            elType: ["hor", "hor", "hor", "hor", "hor", "hor"],
            picType: ["67", "67", "67", "67","67","67"],
            col: 6,
            row: 1,
            maxLen: 6,
            firstLineKey: [0, 1, 2, 3, 4, 5],
            lastLineKey: [0, 1, 2, 3, 4, 5],
            leftDistanceArr: [107, 408, 709, 1010, 1311, 1612],
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
    module39: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            elType: [],
            picType: [],
            maxLen: 6,
            listLen: 5,
            begin: 1,
            end: 6,
            firstLineKey: [ 0, 1 ],
            lastLineKey: [ 0, 5 ],
            leftDistanceArr: [ 0, 1501, 1501, 1501, 1501, 1501 ],
            data: []
        },
        active: function(info) {
            this.info.direction = info.direction;
            this.info.leftDistance = info.leftDistance;
            this.info.menuIndex = info.menuIndex;
            this.info.moduleIndex = info.moduleIndex;
            this.info.data = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].moduleContent;
            this.info.data && (this.info.data = this.info.data.slice(0, this.info.maxLen));
            this.info.activeNum = info.activeNum ? info.activeNum : findActiveIndex(this.info.direction, this.info.leftDistance, this.info.firstLineKey, this.info.lastLineKey, this.info.leftDistanceArr);
            this.focus(1);
        },
        deActive: function() {
            this.blur();
        },
        up: function() {
            if (this.info.activeNum == 0 || this.info.activeNum == 1) {
                return {
                    direction: "up",
                    leftDistance: this.info.leftDistanceArr[this.info.activeNum]
                };
            } else {
                this.info.activeNum--;
                this.focus(1);
                return false;
            }
        },
        down: function() {
            if (this.info.activeNum == 0 || this.info.activeNum == 5) {
                return {
                    direction: "down",
                    leftDistance: this.info.leftDistanceArr[this.info.activeNum]
                };
            } else {
                this.info.activeNum++;
                this.focus(1);
                return false;
            }
        },
        left: function() {
            if (this.info.activeNum == 0) {
                return {
                    direction: "down",
                    leftDistance: 1e4,
                    id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                };
            } else {
                this.info.activeNum = 0;
                this.focus();
                return false;
            }
        },
        right: function() {
            if (this.info.activeNum > 0) {
                return {
                    direction: "down",
                    leftDistance: 0,
                    id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                };
            } else {
                this.info.activeNum = this.info.begin + sizePlayIndex;
                this.focus();
                return false;
            }
        },
        ok: function() {
            var nowData = null;
            if (this.info.activeNum == 0) {
                nowData = this.info.data[sizePlayIndex + this.info.begin];
            } else if (this.info.activeNum >= this.info.begin && this.info.activeNum < this.info.end) {
                if (this.info.activeNum == sizePlayIndex + this.info.begin) {
                    nowData =  nowData = this.info.data[this.info.activeNum];
                } else {
                    sizePlayIndex = this.info.activeNum - this.info.begin;
                    autoSizePlay(this.info.menuIndex);
                    return true;
                }
            }
            $.gotoDetail(nowData);
        },
        createEl: function(menuIndex, moduleIndex) {
            var html = "";
            var data = homeAllData[menuIndex].subContent[moduleIndex].moduleContent;
            data && (data = data.slice(0, this.info.maxLen));
            for (var i = 0; i < this.info.maxLen; i++) {
                if (data[i]) {
                    if (i == 0) {
                        html += '<div class="sizeVideo blocks noVideo block' + i + '" id="m' + menuIndex + "m" + moduleIndex + "m" + i + '">' + "</div>";
                    } else {
                        html += '<div class="blocks block' + i + '" id="m' + menuIndex + "m" + moduleIndex + "m" + i + '">' + '<div class="contentTitle hide"></div>' + "</div>";
                    }
                } else {
                    html += '<div class="blocks noPic block' + i + '" id="m' + menuIndex + "m" + moduleIndex + "m" + i + '">' + "</div>";
                }
            }
            return html;
        },
        focus: function(isMove) {
            var $el = $("#" + findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum));
            if ($el.hasClass("current")) {
                $el.removeClass("current");
            } else {
                if (this.info.activeNum != this.info.begin + sizePlayIndex) {
                    $("#" + findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.begin + sizePlayIndex)).addClass("current");
                }
            }
            focusTo(isMove, this.info.menuIndex, this.info.moduleIndex, this.info.activeNum);
        },
        blur: function() {
            $("#" + findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.begin + sizePlayIndex)).addClass("current");
        }
    },
    // 视频窗居中模块
    module40:{
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            maxLen: 1,
            begin: 0,
            end: 0,
            firstLineKey: [0],
            lastLineKey: [0],
            leftDistanceArr: [0],
            data: [],
            channelId: null,
            vodId: null,
            activeChannelNum: null,
        },
        active: function (info) {
            this.info.direction = info.direction;
            this.info.leftDistance = info.leftDistance;
            this.info.menuIndex = info.menuIndex;
            this.info.moduleIndex = info.moduleIndex;
            this.info.data = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].moduleContent;
            this.info.data && (this.info.data = this.info.data.slice(0, this.info.maxLen));
            this.info.activeNum = info.activeNum ? info.activeNum : findActiveIndex(this.info.direction, this.info.leftDistance, this.info.firstLineKey, this.info.lastLineKey, this.info.leftDistanceArr);
            this.focus();
        },
        deActive: function () { },
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
            var nowData = this.info.data[this.info.activeNum];
            if(this.info.vodId){
                nowData.contentType = "0";
                nowData.contentId = this.info.vodId;
                nowData.categoryId = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].categoryId;
            }
            $.gotoDetail(nowData);
        },
        createEl: function (menuIndex, moduleIndex) {
            var info = this.info;
            var html = "";
            var data = homeAllData[menuIndex].subContent[moduleIndex].moduleContent;
            data && (info.data = data.slice(0, this.info.maxLen));
            for (var i = 0; i < data.length; i++) {
                html += '<div class="sizeVideo blocks noPlayer block' + i + '" id="m' + menuIndex + "m" + moduleIndex + "m" + i + '"><img src=""></div>';
            }
            return html;
        },
        focus: function () {
            focusTo(1,this.info.menuIndex, this.info.moduleIndex, this.info.activeNum);
        },      
        blur: function () { }
    },
    // 新增41模块
    // 左列表 下、右推荐模块
    module41:{
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            picType: ["","","","","2","2","2","0","119"],
            maxLen: 13,
            begin: 0,
            moveLen:4,
            noListLength: 9,
            firstLineKey: [ 0, 1, 5 ],
            lastLineKey: [ 2, 3, 4, 5],
            leftDistanceArr: [300, 777, 300, 740, 1180, 1350],
            data: [],
            leftData:[],
            rightData: [],
            recommendData:[],
            rightListIndex:0
        },
        active: function (info) {
            this.info.direction = info.direction;
            this.info.leftDistance = info.leftDistance;
            this.info.menuIndex = info.menuIndex;
            this.info.moduleIndex = info.moduleIndex;
            this.info.data = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].moduleContent;
            var sliceData = this.info.data.length && this.info.data.slice(0, Math.min(this.info.data.length, this.info.maxLen));
            this.info.data && (this.info.data = sliceData.slice(0, sliceData.length));
            this.info.leftData && (this.info.leftData = sliceData.slice(0, 4));
            this.info.recommendData && (this.info.recommendData = sliceData.slice(4,7))
            this.info.rightData && (this.info.rightData = sliceData.slice(8, sliceData.length));
            this.info.activeNum = info.activeNum ? info.activeNum : findActiveIndex(this.info.direction, this.info.leftDistance, this.info.firstLineKey, this.info.lastLineKey, this.info.leftDistanceArr);
            this.focus();
        },
        deActive: function () {
            this.blur();
        },
        createEl: function (menuIndex, moduleIndex) {
            var info = this.info;
            var moduleId = "m" + menuIndex + "m" + moduleIndex;
            var data = homeAllData[menuIndex].subContent[moduleIndex].moduleContent;
            var sliceData = data.length && data.slice(0, Math.min(data.length, this.info.maxLen));
            sliceData.length && (info.data = sliceData.slice(0, sliceData.length));
            // sliceData.length && (info.leftData = sliceData.slice(0, 4));
            // sliceData.length && (info.recommendData = sliceData.slice(4, 7));
            // sliceData.length && (info.rightData = sliceData.slice(8, info.maxLen));
            data = sliceData = null;
            info.rightListIndex = pageInfo.module41RightListIndex || 0;
            var htmlTxt = '';
            var el_video = '<div class="sizeVideo noPlayer blocks block1" id="' + moduleId + 'm' + 1 + '"><img src=""></div>';
            var left_el_list = '';
            var listTitle = '';
            var listSubTitle = '';
            var recommend_html = '';
            var right_el_list = '';
            var recommend_sign = '';

            $.UTIL.each(info.data, function (value, index) {
                listTitle = '';
                listSubTitle = '';
                if (value.contentName) {
                    if (/@/.test(value.contentName)) {
                        listTitle = /#/.test(value.contentName.split('@')[0]) ? '' : value.contentName.split('@')[0];
                        listSubTitle = /#/.test(value.contentName.split('@')[1]) ? '' : value.contentName.split('@')[1];
                    } else {
                        listTitle = /#/.test(value.contentName) ? '' : value.contentName;
                    }
                }
                if(index < 4){
                    left_el_list += '<div class="lists list' + index + (index === sizePlayIndex ? ' current' : '') + '">' + '<div class="mainTitle '+(listSubTitle.length ? 'topTitle': '')+'">' + listTitle + '</div>'+ ( listSubTitle.length ?  '<div class="subTitle">'+ listSubTitle +'</div>' : '' ) +'</div>';
                }else if(index >= 4 && index < 7){
                    recommend_html += '<div class="' + '' + " blocks block" + (index - 2) + '" id="m' + menuIndex + "m" + moduleIndex + "m" + (index - 2) + '">' + '<div class="images"><img src="'+ (value.pics[info.picType[index]] || '')+'"></div></div>';
                }else if(index == 7){
                    recommend_sign = '<div class="recommend_sign"><img src="'+(value.pics[info.picType[index]] || '')+'"></div>'
                }else if(index >= 8){
                    right_el_list +=  index === 8 ? '<div class="lists list' + (index - 8) + ' recommend_pic">' + '<div class="images noContent"><img src="'+ (value.pics[info.picType[index]] || '') +'"></div></div>' : '<div class="lists list' + (index - 8) + '">' + '<div class="mainTitle '+(listSubTitle.length ? 'topTitle': '')+'">'+listTitle+'</div>'+ ( listSubTitle.length ?  '<div class="subTitle">'+ listSubTitle +'</div>' : '' ) +'</div>';
                } 
            })
            if(info.data.length < info.maxLen){
                listTitle = '';
                listSubTitle = '';
                for(var i = info.data.length; i < info.maxLen; i++){
                    right_el_list += '<div class="lists list' + (i-8) + '">' + '<div class="mainTitle '+(listSubTitle.length ? 'topTitle': '')+'">'+listTitle+'</div>'+ ( listSubTitle.length ?  '<div class="subTitle">'+ listSubTitle +'</div>' : '' ) +'</div>';
                }
            }
            htmlTxt = '<div class="blocks block0" id="' + moduleId + 'm' + 0 + '"><div class="list_wrap">' + left_el_list + '</div></div>' + el_video + recommend_html + '<div class="blocks block5" id="' + moduleId + 'm' + 5 + '">'+ recommend_sign+'<div class="list_wrap_right">' + right_el_list + '</div></div>';
            return htmlTxt;
        },
        loadService: function () {
        },
        left: function () {
            if (this.info.activeNum == 0 || this.info.activeNum == 2) {
                return {
                    direction: "down",
                    leftDistance: 1e4,
                    id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                };
            } else if(this.info.activeNum === 5 && this.info.rightListIndex < 3){
                this.info.activeNum = 1;
            }else{
                this.info.activeNum--;
                this.info.activeNum === 0 ? (sizeListIndex = sizePlayIndex) : null;
            }
            this.focus();
            return false;
        },
        right: function () {
            if (this.info.activeNum === 5) {
                return {
                    direction: "down",
                    leftDistance: 0,
                    id: findNowId(this.info.menuIndex, this.info.moduleIndex, this.info.activeNum)
                };
            } else if(this.info.activeNum === 1 || this.info.activeNum === 4){
                this.info.activeNum === 1 ? (this.info.rightListIndex = 0) : (this.info.rightListIndex = 3)
                this.info.activeNum = 5;
            }else{
                this.info.activeNum++; 
            }
            this.focus();
            return false;
        },
        up: function () {
            if (this.info.activeNum === 0 && sizeListIndex > 0) {
                sizeListIndex--;
            } else if(this.info.activeNum === 5 && this.info.rightListIndex > 0){
                this.info.rightListIndex --;
            }else if(this.info.activeNum > 1 && this.info.activeNum < 5 ){
               switch(this.info.activeNum){
                   case 2:
                       this.info.activeNum = 0;
                       sizeListIndex = 3;
                       break;
                    case 3:
                        this.info.activeNum = 1;
                        break;
                    case 4:
                        this.info.activeNum = 1;
                        break;
                    default:
                        break;
               }
            }else{
                return {
                    direction: "up",
                    leftDistance: this.info.leftDistanceArr[this.info.activeNum]
                };
            }
            this.focus();
            return false;
        },
        down: function () {
            if (this.info.activeNum === 0 && sizeListIndex + 1 < this.info.moveLen) {
                sizeListIndex++;
            } else if(this.info.activeNum === 0){
                this.info.activeNum = 2 
            }else if(this.info.activeNum === 1){
                this.info.activeNum = 3 
            }else if(this.info.activeNum === 5 && this.info.rightListIndex + 1 < 5){
                this.info.rightListIndex ++;
            }else {
                return {
                    direction: "down",
                    leftDistance: this.info.leftDistanceArr[this.info.activeNum]
                };
            }
            this.focus();
            return false;
        },
        ok: function () {
            var nowData = null;
            if (this.info.activeNum === 0 || this.info.activeNum === 1) {
                if (this.info.activeNum === 0 && sizePlayIndex !== sizeListIndex) {
                    sizePlayIndex = sizeListIndex;
                    this.info.vodPlaying && (this.info.vodPlaying = false);
                    autoSizePlay(this.info.menuIndex);
                    return true;
                }
                nowData = this.info.data[sizePlayIndex];
            } else if(this.info.activeNum === 5) {
                nowData = this.info.rightData[this.info.rightListIndex];
            } else {
                nowData = this.info.recommendData[this.info.activeNum - 2]
            }
            nowData.categoryId = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].categoryId;
            $.gotoDetail(nowData);
        },
        moveList: function () {
        },
        focus: function (isMove) {
            var moduleId = "#m" + this.info.menuIndex + "m" + this.info.moduleIndex;
            if (this.info.activeNum === 0) {
                var findIndex = moduleId + " .list_wrap " + '.list' + sizeListIndex;
                var focusHtml = {
                    el: findIndex,
                    marquee: [findIndex + " .mainTitle"]
                };
                $.focusTo(focusHtml)
            } else if(this.info.activeNum === 5){
                var findIndex = moduleId + " .list_wrap_right " + '.list' + this.info.rightListIndex;
                var focusHtml = {
                    el: findIndex,
                    marquee: [findIndex + " .mainTitle"]
                };
                $.focusTo(focusHtml)
            } else {
                focusTo(isMove, this.info.menuIndex, this.info.moduleIndex, this.info.activeNum);
            }
        },
        blur: function () {}
    },
    module50: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            elType: ["hor","hor"],
            picType: ["79", "64"],
            col: 2,
            row: 1,
            maxLen: 2,
            firstLineKey: [0, 1],
            lastLineKey: [0, 1],
            leftDistanceArr: [637, 859],
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
    module51: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            picType: ["","","3"],
            maxLen: 5,
            begin: 0,
            noListLength: 1,
            list_height: 125,
            firstLineKey: [0, 1, 2],
            lastLineKey: [0, 1, 2],
            leftDistanceArr: [471, 1135, 1608],
            data: [],
            oneData: [],
        },
        active: function (info) {
            this.info.direction = info.direction;
            this.info.leftDistance = info.leftDistance;
            this.info.menuIndex = info.menuIndex;
            this.info.moduleIndex = info.moduleIndex;
            this.info.data = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].moduleContent;
            var sliceData = this.info.data.length && this.info.data.slice(0, Math.min(this.info.data.length, this.info.maxLen));
            this.info.data && (this.info.data = sliceData.slice(0, sliceData.length - 1));
            this.info.oneData && (this.info.oneData = sliceData.slice(-1));
            this.info.activeNum = info.activeNum ? info.activeNum : findActiveIndex(this.info.direction, this.info.leftDistance, this.info.firstLineKey, this.info.lastLineKey, this.info.leftDistanceArr);
            this.focus(1, info.isFromVol);
        },
        deActive: function () {
            this.blur();
        },
        createEl: function (menuIndex, moduleIndex) {
            var info = this.info;
            var moduleId = "m" + menuIndex + "m" + moduleIndex;
            var data = homeAllData[menuIndex].subContent[moduleIndex].moduleContent;
            var sliceData = data.length && data.slice(0, Math.min(data.length, this.info.maxLen));
            sliceData.length && (info.data = sliceData.slice(0, sliceData.length - 1));
            sliceData.length && (info.oneData = sliceData.slice(-1));
            data = sliceData = null;

            var htmlTxt = '';
            var leftWrap = '<div class="sizeVideo noPlayer blocks block0" id="' + moduleId + 'm' + 0 + '"><img src=""></div>';
            var rightSrcTxt = info.oneData[0].pics[info.picType[2]] || '';
            var rightWrap = '<div class="blocks block2" id="' + moduleId + 'm' + 2 + '"><div class="images"><img src="' + rightSrcTxt + '"></div></div>';
            var middleWrap = '';
            var listTitle = '';

            $.UTIL.each(info.data, function (value, index) {
                listTitle = '';
                if (value.contentName) {
                    if (/@/.test(value.contentName)) {
                        listTitle = /#/.test(value.contentName.split('@')[0]) ? '' : value.contentName.split('@')[0];
                    } else {
                        listTitle = /#/.test(value.contentName) ? '' : value.contentName;
                    }
                    listTitle = $.substringElLength(listTitle, "30px", '720px').last
                }
                middleWrap += '<div class="lists list' + index + (index === sizePlayIndex ? ' current' : '') + '">' + '<div class="mainTitle">' + listTitle + '</div>' + flashlightHtml + '</div>';
            })
            htmlTxt = leftWrap + '<div class="blocks block1" id="' + moduleId + 'm' + 1 + '"><div class="list_wrap">' + middleWrap + '</div></div>' + rightWrap;
            return htmlTxt;
        },
        loadService: function () {
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
            if (this.info.activeNum === 1 && sizeListIndex > 0) {
                sizeListIndex--;
                this.focus();
            } else {
                return {
                    direction: "up",
                    leftDistance: this.info.leftDistanceArr[this.info.activeNum]
                };
            }
        },
        down: function () {
            if (this.info.activeNum === 1 && sizeListIndex + 1 < this.info.data.length) {
                sizeListIndex++;
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
                nowData = this.info.oneData[0];
                nowData.categoryId = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].categoryId;
            } else {
                if (this.info.activeNum === 1 && sizePlayIndex !== sizeListIndex) {
                    sizePlayIndex = sizeListIndex;
                    this.info.vodPlaying && (this.info.vodPlaying = false);
                    autoSizePlay(this.info.menuIndex);
                    return true;
                }
                nowData = this.info.data[sizePlayIndex];
                nowData.categoryId = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].categoryId;
            }
            $.gotoDetail(nowData);
        },
        focus: function (isMove) {
            var moduleId = "#m" + this.info.menuIndex + "m" + this.info.moduleIndex;
            if (this.info.activeNum === 1) {
                var findIndex = moduleId + " .list_wrap " + '.list' + sizeListIndex;
                var focusHtml = {
                    el: findIndex,
                };
                $.focusTo(focusHtml)
            } else {
                focusTo(isMove, this.info.menuIndex, this.info.moduleIndex, this.info.activeNum);
            }
        },
        blur: function () {}
    },
    module53:{
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
            leftDistanceArr: [277, 870, 1450, 277, 870, 1450],
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
            return createNorEl(menuIndex, moduleIndex, this.info.maxLen, this.info.elType, "", this.info.picType);
        },
        focus: function () {
            return commonModules.fixListModule.focus.apply(this, arguments);
        },
        blur: function () {
        }
    },
    module54: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            picType: ["78"],
            maxLen: 8,
            begin: 0,
            noListLength: 0,
            list_fixed: 0,
            list_length: 8,
            list_height: 63,
            firstLineKey: [0, 1],
            lastLineKey: [0, 1],
            leftDistanceArr: [400, 1294],
            data: [],
        },
        active: function (info) {            
            this.info.direction = info.direction;
            this.info.leftDistance = info.leftDistance;
            this.info.menuIndex = info.menuIndex;
            this.info.moduleIndex = info.moduleIndex;            
            this.info.data = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].moduleContent;
            var sliceData = this.info.data.length && this.info.data.slice(0, Math.min(this.info.data.length, this.info.maxLen));
            this.info.data && (this.info.data = sliceData.slice(0, sliceData.length));
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
            var data = homeAllData[menuIndex].subContent[moduleIndex].moduleContent;
            var sliceData = data.length && data.slice(0, Math.min(data.length, this.info.maxLen));
            sliceData.length && (info.data = sliceData.slice(0, sliceData.length));
            data = sliceData = null;

            var htmlTxt = '';
            var el_video = '<div class="sizeVideo noPlayer blocks block0" id="' + moduleId + 'm' + 0 + '"><img src=""></div>';
            var el_list = '';
            var listTitle = '';
            $.UTIL.each(info.data, function (value, index) {
                listTitle = '';
                if (value.contentName) {
                    if (/@/.test(value.contentName)) {
                        listTitle = /#/.test(value.contentName.split('@')[0]) ? '' : value.contentName.split('@')[0];
                    } else {
                        listTitle = /#/.test(value.contentName) ? '' : value.contentName;
                    }
                }
                el_list += '<div class="lists list' + index + (index === info.sizePlayIndex ? ' current' : '') + '">' + '<div class="mainTitle">' + listTitle + '</div>' + flashlightHtml + '</div>';
            })
            htmlTxt = el_video + '<div class="blocks block1" id="' + moduleId + 'm' + 1 + '"><div class="list_wrap">' + el_list + '</div></div>'; 
            return htmlTxt;
        },
        loadService: function () {
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
            if (this.info.activeNum === 1) {
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
            if (this.info.activeNum === 1 && sizeListIndex > 0) {
                sizeListIndex--;
                sizePlayIndex = sizeListIndex;
                this.info.vodPlaying && (this.info.vodPlaying = false);
                autoSizePlay(this.info.menuIndex);
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
            if (this.info.activeNum === 1 && sizeListIndex + 1 < this.info.data.length) {
                sizeListIndex++;
                sizePlayIndex = sizeListIndex;
                this.info.vodPlaying && (this.info.vodPlaying = false);
                autoSizePlay(this.info.menuIndex);
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
            if (this.info.activeNum === 1 && sizePlayIndex !== sizeListIndex) {
                // sizePlayIndex = sizeListIndex;
                // this.info.vodPlaying && (this.info.vodPlaying = false);
                // autoSizePlay(this.info.menuIndex);
                return true;
            }
            nowData = this.info.data[sizePlayIndex];
            nowData.categoryId = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].categoryId;
            $.gotoDetail(nowData);
        },
        moveList: function () {
            var moduleId = "#m" + this.info.menuIndex + "m" + this.info.moduleIndex;
            var fix_end_index = this.info.list_length - this.info.list_fixed - 1
            var list_begin = sizeListIndex - this.info.list_fixed;
            var list_begin_length = this.info.data.length - this.info.list_fixed - fix_end_index;
            var top = 0;
            if(list_begin <= 0){
                top = 0;
            } else if(list_begin >= list_begin_length){
                top = - (list_begin_length - 1) * this.info.list_height;
            }else{
                top = - list_begin * this.info.list_height
            }
            $(moduleId + " .list_wrap").css({
                top: top + "px"
            })
        },
        focus: function (isMove) {
            sizePlayIndex = sizeListIndex;
            this.info.vodPlaying && (this.info.vodPlaying = false);
            autoSizePlay(this.info.menuIndex);
            stopPicPlay = true;
            sizeVideo.pausePic();
            var moduleId = "#m" + this.info.menuIndex + "m" + this.info.moduleIndex;
            if (this.info.activeNum === 1) {
                var findIndex = moduleId + " .list_wrap " + '.list' + sizeListIndex;
                var focusHtml = {
                    el: findIndex,
                    marquee: [findIndex + " .mainTitle"]
                };
                $.focusTo(focusHtml)
            } else {
                focusTo(isMove, this.info.menuIndex, this.info.moduleIndex, this.info.activeNum);
            }
        },
        blur: function () {            
            stopPicPlay = false;
            autoSizePlay(this.info.menuIndex);
        }
    },
    module55: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            picType: ["","","67"],
            begin: 0,
            noListLength: 1,
            maxLen: 9,
            list_fixed: 2,
            list_length: 4,
            list_height: 123,
            firstLineKey: [0, 1, 2],
            lastLineKey: [0, 1, 2],
            leftDistanceArr: [471, 1135, 1608],
            data: [],
            oneData: [],
        },
        active: function (info) {
            this.info.direction = info.direction;
            this.info.leftDistance = info.leftDistance;
            this.info.menuIndex = info.menuIndex;
            this.info.moduleIndex = info.moduleIndex;
            this.info.data = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].moduleContent;
            var sliceData = this.info.data.length && this.info.data.slice(0, Math.min(this.info.data.length, this.info.maxLen));
            this.info.data && (this.info.data = sliceData.slice(0, sliceData.length - 1));
            this.info.oneData && (this.info.oneData = sliceData.slice(-1));
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
            var data = homeAllData[menuIndex].subContent[moduleIndex].moduleContent;
            var sliceData = data.length && data.slice(0, Math.min(data.length, this.info.maxLen));
            sliceData.length && (info.data = sliceData.slice(0, sliceData.length - 1));
            sliceData.length && (info.oneData = sliceData.slice(-1));
            data = sliceData = null;

            var htmlTxt = '';
            var leftWrap = '<div class="sizeVideo noPlayer blocks block0" id="' + moduleId + 'm' + 0 + '"><img src=""></div>';
            var rightDes = $.substringElLength(info.oneData[0].contentName, "26", '890px').last || '';
            var rightSrcTxt = info.oneData[0].pics[info.picType[2]] || '';
            var rightWrap = '<div class="blocks block2" id="' + moduleId + 'm' + 2 + '"><div class="images"><img src="' + rightSrcTxt + '"></div><div class="des">' + rightDes + '</div></div>';
            var middleWrap = '';
            var listTitle = '';
            var listSubTitle = '';
            var listTitleReDefined = '';
            $.UTIL.each(info.data, function (value, index) {
                listTitle = '';
                listSubTitle = '';
                if (value.contentName) {
                    if (/@/.test(value.contentName)) {
                        listTitle = /#/.test(value.contentName.split('@')[0]) ? '' : value.contentName.split('@')[0];
                        listSubTitle = /#/.test(value.contentName.split('@')[1]) ? '' : value.contentName.split('@')[1];
                    } else {
                        listTitle = /#/.test(value.contentName) ? '' : value.contentName;
                    }
                }
                var reg=/(^\s+)|(\s+$)|\s+/g;
                var len=listTitle.match(reg);
                var gap=len?len.length*10+335+'px':'335px';
                listTitleReDefined = $.substringElLength(listTitle, "33", gap).last || '';
                middleWrap += '<div class="lists list' + index + (index === info.sizePlayIndex ? ' current' : '') + '">' + '<div class="subTitles">' + listTitleReDefined + '</div>' + flashlightHtml + '</div>';
            })
            htmlTxt = leftWrap + '<div class="blocks block1" id="' + moduleId + 'm' + 1 + '"><div class="list_wrap">' + middleWrap + '</div></div>' + rightWrap;
            return htmlTxt;
        },
        loadService: function () {
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
            if (this.info.activeNum === 1 && sizeListIndex > 0) {
                sizeListIndex--;
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
            if (this.info.activeNum === 1 && sizeListIndex + 1 < this.info.data.length) {
                sizeListIndex++;
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
                nowData = this.info.oneData[0];
                nowData.categoryId = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].categoryId;
            } else {
                if (this.info.activeNum === 1 && sizePlayIndex !== sizeListIndex) {
                    sizePlayIndex = sizeListIndex;
                    this.info.vodPlaying && (this.info.vodPlaying = false);
                    autoSizePlay(this.info.menuIndex);
                    return true;
                }
                nowData = this.info.data[sizePlayIndex];
                nowData.categoryId = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].categoryId;
            }
            $.gotoDetail(nowData);
        },
        moveList: function () {
            var moduleId = "#m" + this.info.menuIndex + "m" + this.info.moduleIndex;
            var fix_end_index = this.info.list_length - this.info.list_fixed - 1
            var list_begin = sizeListIndex - this.info.list_fixed;
            var list_begin_length = this.info.data.length - this.info.list_fixed - fix_end_index;
            var top = 0;
            if(list_begin <= 0){
                top = 0;
            } else if(list_begin >= list_begin_length){
                top = - (list_begin_length - 1) * this.info.list_height;
            }else{
                top = - list_begin * this.info.list_height
            }
            $(moduleId + " .list_wrap").css({
                top: top + "px"
            })
        },
        focus: function (isMove) {
            var moduleId = "#m" + this.info.menuIndex + "m" + this.info.moduleIndex;
            if (this.info.activeNum === 1) {
                var findIndex = moduleId + " .list_wrap " + '.list' + sizeListIndex;
                var focusHtml = {
                    el: findIndex,
                    marquee: [findIndex + " .mainTitle"]
                };
                $.focusTo(focusHtml)
            } else {
                focusTo(isMove, this.info.menuIndex, this.info.moduleIndex, this.info.activeNum);
            }
        },
        blur: function () {}
    },
    module56: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            menuIndex: 0,
            moduleIndex: 0,
            picType: ["78"],
            maxLen: 4,
            begin: 0,
            noListLength: 0,
            list_fixed: 0,
            list_length: 4,
            list_height: 125,
            firstLineKey: [0, 1],
            lastLineKey: [0, 1],
            leftDistanceArr: [400, 1294],
            data: [],
        },
        active: function (info) {            
            this.info.direction = info.direction;
            this.info.leftDistance = info.leftDistance;
            this.info.menuIndex = info.menuIndex;
            this.info.moduleIndex = info.moduleIndex;            
            this.info.data = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].moduleContent;
            var sliceData = this.info.data.length && this.info.data.slice(0, Math.min(this.info.data.length, this.info.maxLen));
            this.info.data && (this.info.data = sliceData.slice(0, sliceData.length));
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
            var data = homeAllData[menuIndex].subContent[moduleIndex].moduleContent;
            var sliceData = data.length && data.slice(0, Math.min(data.length, this.info.maxLen));
            sliceData.length && (info.data = sliceData.slice(0, sliceData.length));
            data = sliceData = null;

            var htmlTxt = '';
            var el_video = '<div class="sizeVideo noPlayer blocks block0" id="' + moduleId + 'm' + 0 + '"><img src=""></div>';
            var el_list = '';
            var listTitle = '';
            $.UTIL.each(info.data, function (value, index) {
                listTitle = '';
                if (value.contentName) {
                    if (/@/.test(value.contentName)) {
                        listTitle = /#/.test(value.contentName.split('@')[0]) ? '' : value.contentName.split('@')[0];
                    } else {
                        listTitle = /#/.test(value.contentName) ? '' : value.contentName;
                    }
                }
                listTitle = $.substringElLength(listTitle, "32", '590px').last || '';
                el_list += '<div class="lists list' + index + (index === info.sizePlayIndex ? ' current' : '') + '">' + '<div class="mainTitle">' + listTitle + '</div>' + flashlightHtml + '</div>';
            })
            htmlTxt = el_video + '<div class="blocks block1" id="' + moduleId + 'm' + 1 + '"><div class="list_wrap">' + el_list + '</div></div>'; 
            return htmlTxt;
        },
        loadService: function () {
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
            if (this.info.activeNum === 1) {
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
            if (this.info.activeNum === 1 && sizeListIndex > 0) {
                sizeListIndex--;
                sizePlayIndex = sizeListIndex;
                this.info.vodPlaying && (this.info.vodPlaying = false);
                autoSizePlay(this.info.menuIndex);
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
            if (this.info.activeNum === 1 && sizeListIndex + 1 < this.info.data.length) {
                sizeListIndex++;
                sizePlayIndex = sizeListIndex;
                this.info.vodPlaying && (this.info.vodPlaying = false);
                autoSizePlay(this.info.menuIndex);
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
            if (this.info.activeNum === 1 && sizePlayIndex !== sizeListIndex) {
                // sizePlayIndex = sizeListIndex;
                // this.info.vodPlaying && (this.info.vodPlaying = false);
                // autoSizePlay(this.info.menuIndex);
                return true;
            }
            nowData = this.info.data[sizePlayIndex];
            nowData.categoryId = homeAllData[this.info.menuIndex].subContent[this.info.moduleIndex].categoryId;
            $.gotoDetail(nowData);
        },
        moveList: function () {
            var moduleId = "#m" + this.info.menuIndex + "m" + this.info.moduleIndex;
            var fix_end_index = this.info.list_length - this.info.list_fixed - 1
            var list_begin = sizeListIndex - this.info.list_fixed;
            var list_begin_length = this.info.data.length - this.info.list_fixed - fix_end_index;
            var top = 0;
            if(list_begin <= 0){
                top = 0;
            } else if(list_begin >= list_begin_length){
                top = - (list_begin_length - 1) * this.info.list_height;
            }else{
                top = - list_begin * this.info.list_height
            }
            $(moduleId + " .list_wrap").css({
                top: top + "px"
            })
        },
        focus: function (isMove) {
            this.info.vodPlaying && (this.info.vodPlaying = false);
            autoSizePlay(this.info.menuIndex);
            stopPicPlay = true;
            sizeVideo.pausePic();
            var moduleId = "#m" + this.info.menuIndex + "m" + this.info.moduleIndex;
            if (this.info.activeNum === 1) {
                var findIndex = moduleId + " .list_wrap " + '.list' + sizeListIndex;
                var focusHtml = {
                    el: findIndex,
                    marquee: [findIndex + " .mainTitle"]
                };
                $.focusTo(focusHtml)
            } else {
                focusTo(isMove, this.info.menuIndex, this.info.moduleIndex, this.info.activeNum);
            }
        },
        blur: function () {            
            stopPicPlay = false;
            autoSizePlay(this.info.menuIndex);
        }
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

var sizeVideo = function() {
    var vl = null;
    var playTimer = null;
    var playIndex = 0;
    var playingType = "";
    var playMenuIndex;
    var canPs = {};
    var videoPs = {};
    var cfg = null;
    var picTime = 4e3;
    var play = {
        vod: function() {
            vl = $.playSizeList({
                list: cfg.list,
                auto: false,
                multiVod: false,
                current: playIndex,
                loading: function(type) {},
                onPlay: function() {
                    canvasBg(playMenuIndex, [videoPs.left, videoPs.top, videoPs.width, videoPs.height])
                    $.initVolume(vl.mp);
                },
                onEnd: function() {
                    cfg.onEnd && cfg.onEnd();
                },
                onError: function(e) {
                    cfg.onError && cfg.onError();
                    return true;
                },
                left: videoPs.left,
                top: videoPs.top,
                width: videoPs.width,
                height: videoPs.height
            }, "size_" + cfg.categoryId + "_" + new Date().getTime());
            vl.play();
        },
        channel: function() {
            vl = new $.MP({
                left: videoPs.left,
                top: videoPs.top,
                width: videoPs.width,
                height: videoPs.height,
                videoDisplayMode: 0
            });
            canvasBg(playMenuIndex, [videoPs.left, videoPs.top, videoPs.width, videoPs.height])
            $.vs.liveSizePlay(cfg.channelNum);
            vl.load(cfg.channelNum, null, $.MP.mediaType.TYPE_CHANNEL);
            $.initVolume(vl);
        },
        pic: function() {
            canvasBg(playMenuIndex);
            clearTimeout(vl);
            if(!stopPicPlay){
                vl = setTimeout(function() {
                    stopPic();
                    cfg.onEnd && cfg.onEnd();
                }, picTime);
            }
            cfg.picSrc && $("#m" + playMenuIndex + "m" + cfg.moduleIndex + " .sizeVideo").html('<img src="' + cfg.picSrc + '">');
            cfg.onPlay && cfg.onPlay();
        }
    };
    function stopPic() {
        $("#m" + playMenuIndex + "m" + cfg.moduleIndex + " .sizeVideo").html("");
    }
    function subPlay(opt) {
        var menuIndex = $.pTool.get("p_module").getInfo().subIndex;
        release();
        cfg = opt;
        canPs = {
            left: cfg.left,
            top: cfg.top,
            width: cfg.width,
            height: cfg.height
        };
        videoPs = {
            left: canPs.left - 5,
            top: canPs.top + 2,
            width: canPs.width + 4,
            height: canPs.height - 1
        };
        clearTimeout(playTimer);
        function playFn() {
            playingType = cfg.type;
            playMenuIndex = menuIndex;
            play[playingType]();
            $("#m" + menuIndex + "m" + cfg.moduleIndex + " .sizeVideo").removeClass("noPlayer");
        }
        if (cfg.type === "pic") {
            playFn();
            if(!cfg.picSrc){
                $("#m" + menuIndex + "m" + cfg.moduleIndex + " .sizeVideo").addClass('noContent');
                $("#m" + menuIndex + "m" + cfg.moduleIndex + " .sizeVideo img").attr('src',"");
            }
            //!cfg.picSrc && $("#m" + menuIndex + "m" + cfg.moduleIndex + " .sizeVideo").addClass('noContent')
        } else {
            playTimer = setTimeout(function() {
                playFn();
            }, 500);
            $("#m" + menuIndex + "m" + cfg.moduleIndex + " .sizeVideo").removeClass("noContent");
        }
        cfg.onPlay && cfg.onPlay();
    }
    var stop = {
        vod: function() {
            $.setVolumeUsability(false);
            vl && vl.release();
            vl = null;
        },
        channel: function() {
            $.setVolumeUsability(false);
            vl && vl.release();
            vl = null;
        },
        pic: function() {
            vl && clearTimeout(vl);
            stopPic();
            vl = null;
        }
    };
    function release() {
        clearTimeout(playTimer);
        if (vl) {
            stop[playingType]();
            cfg && $("#m" + playMenuIndex + "m" + cfg.moduleIndex + " .sizeVideo").length && $("#m" + playMenuIndex + "m" + cfg.moduleIndex + " .sizeVideo").addClass("noPlayer");
            playingType = "";
        }
        cfg = null;
    }
    function pausePic() {
        if (playingType == "pic") {
            vl && clearTimeout(vl);
        }
    }
    function resumePic() {
        if (playingType == "pic") {
            clearTimeout(vl);
            vl = setTimeout(function() {
                stopPic();
                cfg.onEnd && cfg.onEnd();
            }, picTime);
        }
    }
    return {
        subPlay: subPlay,
        release: release,
        pausePic: pausePic,
        resumePic: resumePic
    };
}();