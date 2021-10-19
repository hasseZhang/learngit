var listTj = function() {
    var kanbaData = {};
    var isFirstLoad = true;
    var $content = null;
    var $wrap = null;
    var $nowSection = null;
    var baseTranslateY = 0;
    var activeNum = 0;
    var moduleIndex = 0;
    var picIndex = 0;
    var listTjUp = function() {};
    var entrance = "";
    var createElTimer = null;
    var $progressBar = null;
    var $strip = null;
    var contentHeight = 0;
    function getData(menuObj) {
        function errorCb() {
            kanbaData = {};
            if (isFirstLoad) {
                menuObj.firstLoad();
                isFirstLoad = false;
            }
            menu.addCur();
            $("#loading").hide();
            $("#noData").show();
            $.pTool.get("header").show();
        }
        $.get($.urls.dataKanbaTj, {
            success: function(data) {
                data = JSON.parse(data.replace(/\/\*(\s|.)*?\*\//g, ""));
                kanbaData = data[menuObj.menuType + "_" + menuObj.id];
                $.recodeData(PAGE_NAME, "access", menuObj.id);
                if (kanbaData) {
                    $("#loading").hide();
                    $("#pageTotalRow").hide();
                    $.pTool.get("p_listTj").init({
                        activeNum: activeNum,
                        moduleIndex: moduleIndex,
                        moduleData: kanbaData.subContent,
                        modules: modules,
                        toLeft: menuObj.left,
                        autoLoadImg: autoLoadImg,
                        autoPlay: modules.module6.autoPlay.bind(modules.module6),
                        listTjUp: listTjUp
                    });
                    $.pTool.get("header").show();
                    createElTimer = setTimeout(function() {
                        $.UTIL.each(kanbaData.subContent, function(value, index) {
                            if (value.moduleType == "6") {
                                modules.module6.info.data = value.moduleContent.slice(0, modules.module6.info.maxLen);
                                modules.module6.info.moduleIndex = index;
                                return true;
                            }
                        });
                        createWrap();
                        createOneSection();
                        showProgressBar(0);
                        modules.module6.autoPlay();
                        setSectionTranslateY("", baseTranslateY);
                        loadPageText();
                        if (isFirstLoad) {
                            menuObj.firstLoad && menuObj.firstLoad();
                            isFirstLoad = false;
                        }
                        loadImg();
                        menu.addCur();
                    }, 100);
                } else {
                    errorCb();
                }
            },
            error: function() {
                $.recodeData(PAGE_NAME, "access", menuObj.id); 
                errorCb();
            }
        }, false);
    }
    function clearListDom() {
        hideListInfo();
        modules.module6.stopAuto();
        clearTimeout(createElTimer);
        if ($wrap && $wrap.length) {
            $wrap.remove();
        }
        $strip && $strip.length && $strip.css({
            top: "0px"
        });
        $progressBar && $progressBar.length && $progressBar.hide();
    }
    function hideListInfo() {
        if ($("#progressBar").length) {
            $("#progressBar").hide();
        }
        if ($("#pageNum").length) {
            $("#pageNum").hide();
        }
        if ($("#noData").length) {
            $("#noData").hide();
        }
    }
    $.getElem = function(id) {
        return $("#" + id)[0];
    };
    function createWrap() {
        $content = $("#content");
        $wrap = $('<div id="tjContentWrap"></div>');
        $wrap.appendTo($content);
    }
    function createOneSection() {
        try {
            var pageData = kanbaData.subContent;
            $nowSection = $('<div id="listTjContent"></div>');
            for (var i = 0; i < pageData.length; i++) {
                var moduleName = "module" + pageData[i].moduleType;
                var $module = $('<div class="modules ' + moduleName + '" id="m' + i + '"></div>');
                var $moduleTitle = null;
                var $blockWrap = $('<div class="blockWrap"></div>');
                if (pageData[i].moduleTitle !== "null") {
                    $moduleTitle = $('<div class="moduleTitle">' + pageData[i].moduleTitle + "</div>");
                    $moduleTitle.appendTo($module);
                }
                $blockWrap.html(modules[moduleName].createEl(i));
                $blockWrap.appendTo($module);
                $module.appendTo($nowSection);
            }
            $nowSection.appendTo($wrap);
            modules.module6.setTranslateX();
            contentHeight = $nowSection.offsetHeight() + baseTranslateY;
        } catch (e) {}
    }
    function loadPageText() {
        var pageData = kanbaData.subContent;
        for (var i = 0; i < pageData.length; i++) {
            var nowId = "m" + i;
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
                if (!episodeText || pageData[i].moduleType === '6' || pageData[i].moduleType === "5" || pageData[i].moduleType === "27") {
                    $nowEpisode.css({
                        visibility: "hidden"
                    });
                }
                if (d && d.contentName && !/^#/.test(d.contentName) && $nowContentTitle.length) {
                    $nowContentTitle.html(d.contentName);
                    $nowContentTitle.show();
                }
                if (episodeText && d.contentName && !/^#/.test(d.contentName) && /hor/.test($aBlock.item(j)[0].className)) {
                    $nowEpisode.addClass("episodeMoveUp");
                }
            }
        }
    }
    var preTranslateY = 0;
    function setSectionTranslateY(el, transY) {
        if (!el) {
            return;
        }
        function getPositionTop() {
            var elTop = 0;
            var elem = el;
            var elHeight = "";
            var lastElemKey = "tjContentWrap";
            while (elem) {
                if (elem.id == lastElemKey) {
                    break;
                }
                elTop += elem.offsetTop;
                elem = elem.offsetParent;
            }
            return -(elTop + elHeight);
        }
        preTranslateY = -($nowSection.attr("translatey") || baseTranslateY);
        var translateY = 0;
        if (typeof transY === "number") {
            translateY = transY;
        } else {
            var positionTop = getPositionTop();
            translateY = positionTop + ($wrap.clientHeight() - el.offsetHeight) / 2;
            var translateYElemHeight = $nowSection.offsetHeight();
            var wrapHeight = $wrap.offsetHeight();
            if (-positionTop + el.offsetHeight < 970 || translateY > baseTranslateY) {
                translateY = baseTranslateY;
            } else {
                if (translateY < wrapHeight - translateYElemHeight - 40) {
                    translateY = wrapHeight - translateYElemHeight - 40;
                }
            }
        }
        if (translateY === baseTranslateY) {
            $wrap.css({
                overflow: "visible"
            });
        } else {
            $wrap.css({
                overflow: "hidden"
            });
        }
        $nowSection.attr("translatey", translateY).css({
            "-webkit-transform": "translateY(" + translateY + "px)"
        });
        showProgressBar((translateY - baseTranslateY) / (wrapHeight - translateYElemHeight - 40 - baseTranslateY) * 840 + "px");
    }
    function showProgressBar(topPx) {
        if (contentHeight < 1080) {
            return;
        }
        if (!$progressBar) {
            $progressBar = $('<div id="progressBarTj"></div>').appendTo($content);
            $strip = $('<div id="stripTj"></div>').appendTo($progressBar);
        }
        $progressBar.show();
        $strip.css({
            top: topPx
        });
    }
    var autoImgTimer = null;
    function loadImg() {
        var $aModules = $("#listTjContent .modules", "#listTjContent", true);
        var sectionTranslateY = -($nowSection.attr("translatey") || 0);
        var oWrapBottom = $wrap.clientHeight();
        var moduleIndexArr = [];
        function getPositionTop(el) {
            var elTop = 0;
            var elem = el;
            var elHeight = "";
            var lastElemKey = "tjContentWrap";
            while (elem) {
                if (elem.id == lastElemKey) {
                    break;
                }
                elTop += elem.offsetTop;
                elem = elem.offsetParent;
            }
            return +(elTop + elHeight);
        }
        function showImg(moduleIndex) {
            var nowId = "m" + moduleIndex;
            var $nowEl = $("#" + nowId);
            if (!$nowEl.length) {
                return;
            }
            if ($nowEl.attr("isload")) {
                return;
            }
            var $aBlock = null;
            if (kanbaData.subContent && kanbaData.subContent[moduleIndex] && kanbaData.subContent[moduleIndex].moduleType == "6") {
                $aBlock = $("#" + nowId + " .lbBlocks", "#" + nowId, true);
            } else {
                $aBlock = $("#" + nowId + " .blocks", "#" + nowId, true);
            }
            for (var i = 0; i < $aBlock.length; i++) {
                var picType = $aBlock.item(i).attr("pictype");
                var nowData = kanbaData.subContent[moduleIndex].moduleContent[i];
                if (!nowData) {
                    nowData = {};
                    $aBlock.item(i).addClass("noData");
                }
                $aBlock.item(i).find(".images").addClass("noPic");
                var picSrc = nowData.pics && nowData.pics[picType];
                if (picSrc) {
                    picSrc && $aBlock.item(i).find(".images img").length && $aBlock.item(i).find(".images img").attr("src", picSrc);
                    (function(i) {
                        setTimeout(function() {
                            $aBlock.item(i).find(".images").removeClass("noPic");
                            $aBlock.item(i).find(".orderImg").removeClass("noPic");
                        }, 50)
                    })(i);
                }
                var $innerImg = $aBlock.item(i).find(".innerImg"); 
                if ($innerImg.length) {
                    $innerImg.attr("src", nowData.pics[$innerImg.attr("innertype")]);
                    $aBlock.item(i).addClass("hasInner");
                }
            }
            $nowEl.attr("isload", "1");
            loadService(moduleIndex);
        }
        function loadService(moduleIndex) {
            var nowType = "module" + kanbaData.subContent[moduleIndex].moduleType;
            if (modules[nowType] && modules[nowType].loadService) {
                modules[nowType].loadService(moduleIndex);
            }
        }
        for (var i = 0; i < $aModules.length; i++) {
            var nowId = "m" + i;
            var nowEl = $("#" + nowId)[0];
            var offTop = getPositionTop(nowEl);
            var offBottom = offTop + nowEl.offsetHeight;
            if (offBottom - sectionTranslateY > 0 && offTop - sectionTranslateY < oWrapBottom) {
                moduleIndexArr.push(i);
                showImg(i);
            }
        }
        showImg(moduleIndexArr[0] - 1);
        showImg(moduleIndexArr[moduleIndexArr.length - 1] + 1);
    }
    function autoLoadImg() {
        clearTimeout(autoImgTimer);
        autoImgTimer = setTimeout(function() {
            loadImg();
        }, 500);
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
    function findNowId(moduleIndex, activeNum) {
        return "m" + moduleIndex + "m" + activeNum;
    }
    function createNorEl(moduleIndex, maxLen, elType, className, picType, innerPicType) {
        var html = "";
        var data = kanbaData.subContent[moduleIndex].moduleContent;
        data && (data = data.slice(0, maxLen));
        className = className ? " " + className : "";
        picType = picType && picType.length ? picType : [];
        innerPicType = innerPicType && innerPicType.length ? innerPicType : [];
        for (var i = 0; i < maxLen; i++) {
            var iType = elType && elType[i] || "";
            var innerImgHtml = "";
            if(moduleIndex === 0){
                innerPicType[i] && data[i].pics[innerPicType[i]]
            }
            if (innerPicType[i] && data[i].pics[innerPicType[i]]) {
                innerImgHtml = '<img class="innerImg" innertype="' + innerPicType[i] + '">';
            }
            html += '<div pictype="' + picType[i] + '" class="' + iType + " blocks block" + i + className + '" id="m' + moduleIndex + "m" + i + '">' + '<div class="images"><img></div>' + innerImgHtml + '<div class="episode "></div>' + '<div class="contentTitle hide"></div>' + '' + '' + "</div>";
        }
        return html;
    }
    function focusTo(isMove, moduleIndex, activeNum, marqueeEl) {
        var elId = findNowId(moduleIndex, activeNum);
        if (isMove) {
            setSectionTranslateY($.getElem(elId));
        }
        var $contentTitleId = "#" + elId + " ." + (marqueeEl || "contentTitle");
        var $contentTitle = $($contentTitleId);
        var marqueeObj = {
            el: "#" + elId,
            marquee: [ $contentTitleId ]
        };
        $.focusTo(marqueeObj);
    }
    var commonModules = {
        firstLineModule: {
            active: function(info) {
                this.info.direction = info.direction;
                this.info.leftDistance = info.leftDistance;
                this.info.moduleIndex = info.moduleIndex;
                this.info.data =  kanbaData.subContent[this.info.moduleIndex].moduleContent;
                this.info.data && (this.info.data = this.info.data.slice(0, this.info.maxLen));
                if (this.info.data.length == 1) {
                    this.info.leftDistanceArr = [ 0 ];
                } else if (this.info.data.length == 2) {
                    this.info.leftDistanceArr = [ 427, 1312 ];
                } else if (this.info.data.length == 3) {
                    this.info.leftDistanceArr = [ 280, 870, 1460 ];
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
            deActive: function() {
                this.blur();
            },
            up: function() {
                return {
                    direction: "up",
                    leftDistance: this.info.leftDistanceArr[this.info.activeNum]
                };
            },
            down: function() {
                return {
                    direction: "down",
                    leftDistance: this.info.leftDistanceArr[this.info.activeNum]
                };
            },
            left: function() {
                if (this.info.activeNum == 0) {
                    return {
                        direction: "down",
                        leftDistance: 1e4,
                        id: findNowId(this.info.moduleIndex, this.info.activeNum)
                    };
                } else {
                    this.info.activeNum--;
                    this.focus();
                    return false;
                }
            },
            right: function() {
                if (this.info.activeNum == this.info.data.length - 1) {
                    return {
                        direction: "down",
                        leftDistance: 0,
                        id: findNowId(this.info.moduleIndex, this.info.activeNum)
                    };
                } else {
                    this.info.activeNum++;
                    this.focus();
                    return false;
                }
            },
            ok: function() {
                var nowData = this.info.data[this.info.activeNum];
                nowData.categoryId = kanbaData.subContent[this.info.moduleIndex].categoryId;
                $.gotoDetail(nowData);
            },
            createEl: function(moduleIndex) {
                var maxLen = this.info.maxLen;
                var data = kanbaData.subContent[moduleIndex].moduleContent;
                var moduyleType = kanbaData.subContent[moduleIndex].moduleType
                data && (data = data.slice(0, maxLen));
                var picType = [];
                var innerImgArr = [];
                var iInnerImgType = "";
                if (this.info.picType && this.info.picType.length) {
                    picType = this.info.picType;
                    iInnerImgType = "81";
                } else {
                    switch(moduyleType){
                        case '1':
                            if (data.length === 1) {
                                picType = [ "78" ]
                                iInnerImgType = "107";
                            } else if (data.length === 2) {
                                picType = [ "62", "62" ];
                                iInnerImgType = "108";
                            } else if (data.length === 3) {
                                picType = [ "63", "63", "63" ];
                                iInnerImgType = "109";
                            };
                            break;
                        case '2':  
                            if (data.length === 1) {
                                picType = [ "112" ]
                                iInnerImgType = "115";
                            } else if (data.length === 2) {
                                picType = [ "113", "113" ];
                                iInnerImgType = "116";
                            } else if (data.length === 3) {
                                picType = [ "114", "114", "114" ];
                                iInnerImgType = "117";
                            };
                            break; 
                    }
                }
                $.UTIL.each(data, function(value, index) {
                    innerImgArr.push(iInnerImgType);
                });
                return createNorEl(moduleIndex, data.length, this.info.elType, "h" + data.length, picType, innerImgArr);
            },
            focus: function(isMove) {
                focusTo(isMove, this.info.moduleIndex, this.info.activeNum);
            },
            blur: function() {}
        },
        fixListModule: {
            active: function(info) {
                this.info.direction = info.direction;
                this.info.leftDistance = info.leftDistance;
                this.info.moduleIndex = info.moduleIndex;
                this.info.data = kanbaData.subContent[this.info.moduleIndex].moduleContent;
                this.info.data && (this.info.data = this.info.data.slice(0, this.info.maxLen));
                this.info.activeNum = info.activeNum ? info.activeNum : findActiveIndex(this.info.direction, this.info.leftDistance, this.info.firstLineKey, this.info.lastLineKey, this.info.leftDistanceArr);
                this.focus(1);
            },
            deActive: function() {
                this.blur();
            },
            up: function() {
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
            down: function() {
                if (Math.floor(this.info.activeNum / this.info.col) == this.info.row - 1) {
                    return {
                        direction: "down",
                        leftDistance: this.info.leftDistanceArr[this.info.activeNum],
                        id: findNowId(this.info.moduleIndex, this.info.activeNum)
                    };
                } else {
                    this.info.activeNum += this.info.col;
                    this.focus(1);
                    return false;
                }
            },
            left: function() {
                if (this.info.activeNum % this.info.col == 0) {
                    return {
                        direction: "down",
                        leftDistance: 1e4,
                        id: findNowId(this.info.moduleIndex, this.info.activeNum)
                    };
                } else {
                    this.info.activeNum--;
                    this.focus();
                    return false;
                }
            },
            right: function() {
                if (this.info.activeNum % this.info.col == this.info.col - 1) {
                    return {
                        direction: "down",
                        leftDistance: 0,
                        id: findNowId(this.info.moduleIndex, this.info.activeNum)
                    };
                } else {
                    this.info.activeNum++;
                    this.focus();
                    return false;
                }
            },
            ok: function() {
                var nowData = this.info.data[this.info.activeNum];
                if (nowData) {
                    nowData.categoryId = kanbaData.subContent[this.info.moduleIndex].categoryId;
                    nowData.entrance = entrance;
                    $.gotoDetail(nowData);
                }
            },
            createEl: function(moduleIndex) {
                return createNorEl(moduleIndex, this.info.maxLen, this.info.elType, "", this.info.picType);
            },
            focus: function(isMove) {
                focusTo(isMove, this.info.moduleIndex, this.info.activeNum);
            },
            blur: function() {}
        },
        module3_5: {
            active: function(info) {
                this.info.direction = info.direction;
                this.info.leftDistance = info.leftDistance;
                this.info.moduleIndex = info.moduleIndex;
                this.info.data = kanbaData.subContent[this.info.moduleIndex].moduleContent;
                this.info.data && (this.info.data = this.info.data.slice(0, this.info.maxLen));
                this.info.activeNum = info.activeNum ? info.activeNum : findActiveIndex(this.info.direction, this.info.leftDistance, this.info.firstLineKey, this.info.lastLineKey, this.info.leftDistanceArr);
                this.focus(1);
            },
            deActive: function() {
                this.blur();
            },
            up: function() {
                if (this.info.activeNum == 0 || this.info.activeNum == 1 || this.info.activeNum == 2) {
                    return {
                        direction: "up",
                        leftDistance: this.info.leftDistanceArr[this.info.activeNum]
                    };
                } else {
                    if (this.info.activeNum == 3) {
                        this.info.activeNum -= 3;
                    } else if (this.info.activeNum == 4 || this.info.activeNum == 5 || this.info.activeNum == 6) {
                        this.info.activeNum -= 4;
                    } else if (this.info.activeNum == 7) {
                        this.info.activeNum -= 5;
                    }
                    this.focus(1);
                    return false;
                }
            },
            down: function() {
                if (this.info.activeNum == 3 || this.info.activeNum == 4 || this.info.activeNum == 5 || this.info.activeNum == 6 || this.info.activeNum == 7) {
                    return {
                        direction: "down",
                        leftDistance: this.info.leftDistanceArr[this.info.activeNum],
                        id: findNowId(this.info.moduleIndex, this.info.activeNum)
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
            left: function() {
                if (this.info.activeNum == 0 || this.info.activeNum == 3) {
                    return {
                        direction: "down",
                        leftDistance: 1e4,
                        id: findNowId(this.info.moduleIndex, this.info.activeNum)
                    };
                } else {
                    this.info.activeNum--;
                    this.focus();
                    return false;
                }
            },
            right: function() {
                if (this.info.activeNum == 2 || this.info.activeNum == 7) {
                    return {
                        direction: "down",
                        leftDistance: 0,
                        id: findNowId(this.info.moduleIndex, this.info.activeNum)
                    };
                } else {
                    this.info.activeNum++;
                    this.focus();
                    return false;
                }
            },
            ok: function() {
                var nowData = this.info.data[this.info.activeNum];
                if (nowData) {
                    nowData.categoryId = kanbaData.subContent[this.info.moduleIndex].categoryId;
                    nowData.entrance = entrance;
                    $.gotoDetail(nowData);
                }
            },
            createEl: function(moduleIndex) {
                return createNorEl(moduleIndex, this.info.maxLen, this.info.elType, "", this.info.picType);
            },
            focus: function(isMove) {
                focusTo(isMove, this.info.moduleIndex, this.info.activeNum);
            },
            blur: function() {}
        },
        module2_3: {
            active: function(info) {
                this.info.direction = info.direction;
                this.info.leftDistance = info.leftDistance;
                this.info.moduleIndex = info.moduleIndex;
                this.info.data = kanbaData.subContent[this.info.moduleIndex].moduleContent;
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
                    if (this.info.activeNum == 2) {
                        this.info.activeNum -= 2;
                    } else if (this.info.activeNum == 3 || this.info.activeNum == 4) {
                        this.info.activeNum -= 3;
                    }
                    this.focus(1);
                    return false;
                }
            },
            down: function() {
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
            left: function() {
                if (this.info.activeNum == 0 || this.info.activeNum == 2) {
                    return {
                        direction: "down",
                        leftDistance: 1e4,
                        id: findNowId(this.info.moduleIndex, this.info.activeNum)
                    };
                } else {
                    this.info.activeNum--;
                    this.focus();
                    return false;
                }
            },
            right: function() {
                if (this.info.activeNum == 1 || this.info.activeNum == 4) {
                    return {
                        direction: "down",
                        leftDistance: 0,
                        id: findNowId(this.info.moduleIndex, this.info.activeNum)
                    };
                } else {
                    this.info.activeNum++;
                    this.focus();
                    return false;
                }
            },
            ok: function() {
                var nowData = this.info.data[this.info.activeNum];
                nowData.categoryId = kanbaData.subContent[this.info.moduleIndex].categoryId;
                $.gotoDetail(nowData);
            },
            createEl: function(moduleIndex) {
                return createNorEl(moduleIndex, this.info.maxLen, this.info.elType, "", this.info.picType);
            },
            focus: function(isMove) {
                focusTo(isMove, this.info.moduleIndex, this.info.activeNum);
            },
            blur: function() {}
        },
    };
    var modules = {
        module1: {
            info: {
                direction: "down",
                leftDistance: 0,
                activeNum: 0,
                moduleIndex: 0,
                elType: [ "hor", "hor", "hor" ],
                picType: [],
                maxLen: 3,
                firstLineKey: [],
                lastLineKey: [],
                leftDistanceArr: [],
                data: []
            },
            active: function() {
                return commonModules.firstLineModule.active.apply(this, arguments);
            },
            deActive: function() {
                return commonModules.firstLineModule.deActive.apply(this, arguments);
            },
            up: function() {
                return commonModules.firstLineModule.up.apply(this, arguments);
            },
            down: function() {
                return commonModules.firstLineModule.down.apply(this, arguments);
            },
            left: function() {
                return commonModules.firstLineModule.left.apply(this, arguments);
            },
            right: function() {
                return commonModules.firstLineModule.right.apply(this, arguments);
            },
            ok: function() {
                return commonModules.firstLineModule.ok.apply(this, arguments);
            },
            createEl: function() {
                return commonModules.firstLineModule.createEl.apply(this, arguments);
            },
            focus: function() {
                return commonModules.firstLineModule.focus.apply(this, arguments);
            },
            blur: function() {
                return commonModules.firstLineModule.blur.apply(this, arguments);
            }
        },
        module2: {
            info: {
                direction: "down",
                leftDistance: 0,
                activeNum: 0,
                moduleIndex: 0,
                elType: [ "hor", "hor", "hor" ],
                picType: [],
                maxLen: 3,
                firstLineKey: [],
                lastLineKey: [],
                leftDistanceArr: [],
                data: []
            },
            active: function() {
                return commonModules.firstLineModule.active.apply(this, arguments);
            },
            deActive: function() {
                return commonModules.firstLineModule.deActive.apply(this, arguments);
            },
            up: function() {
                return commonModules.firstLineModule.up.apply(this, arguments);
            },
            down: function() {
                return commonModules.firstLineModule.down.apply(this, arguments);
            },
            left: function() {
                return commonModules.firstLineModule.left.apply(this, arguments);
            },
            right: function() {
                return commonModules.firstLineModule.right.apply(this, arguments);
            },
            ok: function() {
                return commonModules.firstLineModule.ok.apply(this, arguments);
            },
            createEl: function() {
                return commonModules.firstLineModule.createEl.apply(this, arguments);
            },
            focus: function() {
                return commonModules.firstLineModule.focus.apply(this, arguments);
            },
            blur: function() {
                return commonModules.firstLineModule.blur.apply(this, arguments);
            }
        },
        // 对应需求文档的类型40
        module3: {
            info: {
                direction: "down",
                leftDistance: 0,
                activeNum: 0,
                moduleIndex: 0,
                elType: [ "ver titleBg", "ver titleBg", "ver titleBg", "ver titleBg", "ver titleBg" ],
                picType: [ "102", "102", "102", "102", "102" ],
                col: 5,
                row: 1,
                maxLen: 5,
                firstLineKey: [ 0, 1, 2, 3, 4 ],
                lastLineKey: [ 0, 1, 2, 3, 4 ],
                leftDistanceArr: [ 0, 295, 590, 885, 1180 ],
                data: []
            },
            active: function() {
                return commonModules.fixListModule.active.apply(this, arguments);
            },
            deActive: function() {
                return commonModules.fixListModule.deActive.apply(this, arguments);
            },
            up: function() {
                return commonModules.fixListModule.up.apply(this, arguments);
            },
            down: function() {
                return commonModules.fixListModule.down.apply(this, arguments);
            },
            left: function() {
                return commonModules.fixListModule.left.apply(this, arguments);
            },
            right: function() {
                return commonModules.fixListModule.right.apply(this, arguments);
            },
            ok: function() {
                return commonModules.fixListModule.ok.apply(this, arguments);
            },
            createEl: function() {
                return commonModules.fixListModule.createEl.apply(this, arguments);
            },
            focus: function() {
                return commonModules.fixListModule.focus.apply(this, arguments);
            },
            blur: function() {
                return commonModules.fixListModule.blur.apply(this, arguments);
            }
        },
        // 对应需求文档的类型6
        module4: {
            info: {
                direction: "down",
                leftDistance: 0,
                activeNum: 0,
                moduleIndex: 0,
                elType: [ "hor", "hor", "hor", "hor", "hor", "hor" ],
                picType: [ "63", "63", "63", "63", "63", "63" ],
                col: 3,
                row: 2,
                maxLen: 6,
                firstLineKey: [ 0, 1, 2 ],
                lastLineKey: [ 3, 4, 5 ],
                leftDistanceArr: [ 228, 710, 1190, 228, 710, 1190 ],
                data: []
            },
            active: function() {
                return commonModules.fixListModule.active.apply(this, arguments);
            },
            deActive: function() {
                return commonModules.fixListModule.deActive.apply(this, arguments);
            },
            up: function() {
                return commonModules.fixListModule.up.apply(this, arguments);
            },
            down: function() {
                return commonModules.fixListModule.down.apply(this, arguments);
            },
            left: function() {
                return commonModules.fixListModule.left.apply(this, arguments);
            },
            right: function() {
                return commonModules.fixListModule.right.apply(this, arguments);
            },
            ok: function() {
                return commonModules.fixListModule.ok.apply(this, arguments);
            },
            createEl: function() {
                return commonModules.fixListModule.createEl.apply(this, arguments);
            },
            focus: function() {
                return commonModules.fixListModule.focus.apply(this, arguments);
            },
            blur: function() {
                return commonModules.fixListModule.blur.apply(this, arguments);
            }
        },
        module5: {
            info: {
                direction: "down",
                leftDistance: 0,
                activeNum: 0,
                moduleIndex: 0,
                elType: [ "circle", "circle", "circle", "circle", "circle",  "circle" ],
                picType: [ "67", "67", "67", "67", "67","67" ],
                col: 6,
                row: 1,
                maxLen: 6,
                firstLineKey: [ 0, 1, 2, 3, 4, 5],
                lastLineKey: [ 0, 1, 2, 3, 4, 5 ],
                leftDistanceArr: [ 100, 344, 588, 832, 1075, 1320],
                data: []
            },
            active: function() {
                return commonModules.fixListModule.active.apply(this, arguments);
            },
            deActive: function() {
                return commonModules.fixListModule.deActive.apply(this, arguments);
            },
            up: function() {
                return commonModules.fixListModule.up.apply(this, arguments);
            },
            down: function() {
                return commonModules.fixListModule.down.apply(this, arguments);
            },
            left: function() {
                return commonModules.fixListModule.left.apply(this, arguments);
            },
            right: function() {
                return commonModules.fixListModule.right.apply(this, arguments);
            },
            ok: function() {
                return commonModules.fixListModule.ok.apply(this, arguments);
            },
            createEl: function() {
                return commonModules.fixListModule.createEl.apply(this, arguments);
            },
            focus: function() {
                return commonModules.fixListModule.focus.apply(this, arguments);
            },
            blur: function() {
                return commonModules.fixListModule.blur.apply(this, arguments);
            }
        },
        module6: {
            info: {
                direction: "down",
                leftDistance: 0,
                activeNum: 0,
                moduleIndex: 0,
                picIndex: 0,
                elType: [],
                picType: [ "95" ],
                maxLen: 6,
                firstLineKey: [ 0 ],
                lastLineKey: [ 0 ],
                leftDistanceArr: [ 0 ],
                data: [],
                autoTimer: null
            },
            active: function(info) {
                this.info.direction = info.direction;
                this.info.leftDistance = info.leftDistance;
                this.info.moduleIndex = info.moduleIndex;
                this.info.activeNum = info.activeNum ? info.activeNum : findActiveIndex(this.info.direction, this.info.leftDistance, this.info.firstLineKey, this.info.lastLineKey, this.info.leftDistanceArr);
                this.focus(1);
            },
            deActive: function() {
                this.autoPlay();
            },
            up: function() {
                return {
                    direction: "up",
                    leftDistance: this.info.leftDistanceArr[this.info.activeNum]
                };
            },
            down: function() {
                return {
                    direction: "down",
                    leftDistance: this.info.leftDistanceArr[this.info.activeNum],
                    id: findNowId(this.info.moduleIndex, this.info.activeNum)
                };
            },
            left: function() {
                if (this.info.picIndex === 0) {
                    return {
                        direction: "down",
                        leftDistance: 1e4,
                        id: findNowId(this.info.moduleIndex, this.info.activeNum)
                    };
                } else {
                    this.info.picIndex--;
                    this.setTranslateX(this.info.moduleIndex);
                }
            },
            right: function() {
                if (this.info.picIndex >= this.info.data.length - 1) {
                    return {
                        direction: "down",
                        leftDistance: 0,
                        id: findNowId(this.info.moduleIndex, this.info.activeNum)
                    };
                } else {
                    this.info.picIndex++;
                }
                this.setTranslateX(this.info.moduleIndex);
            },
            ok: function() {
                var nowData = this.info.data[this.info.picIndex];
                if (nowData) {
                    nowData.categoryId = kanbaData.subContent[this.info.moduleIndex].categoryId;
                    nowData.entrance = entrance;
                    $.gotoDetail(nowData);
                }
            },
            createEl: function(moduleIndex) {
                var data = kanbaData.subContent[moduleIndex].moduleContent;
                data && (data = data.slice(0, this.info.maxLen));
                var lbTxt = "";
                var dotTxt = "";
                var This = this;
                $.UTIL.each(data, function(value, index) {
                    dotTxt += '<div class="dots dot' + index + (index == This.info.picIndex ? ' current' : "")+' "></div>';
                    lbTxt += '<div pictype="' + This.info.picType[0] + '" class="lbBlocks lbBlock' + index + '"><div class="images"><img></div></div>';
                });
                return '<div class="blocks block0' + (data.length ? "" : " noData noPic") + '" id="m' + moduleIndex + 'm0"><div class="dotWrap">' + dotTxt + '</div><div class="lbWrap">' + lbTxt + "</div></div>";
            },
            focus: function(isMove) {
                this.stopAuto();
                focusTo(isMove, this.info.moduleIndex, this.info.activeNum);
            },
            blur: function() {},
            setTranslateX: function() {
                var nowId = "#m" + this.info.moduleIndex + "m0";
                this.setDot();
                $(nowId + " .lbWrap").css({
                    "-webkit-transform": "translateX(" + (-1420) * this.info.picIndex + "px)"
                });
            },
            setDot: function() {
                var nowId = "#m" + this.info.moduleIndex + "m0";
                $(nowId + " .dots", nowId, true).removeClass("current");
                $(nowId + " .dot" + this.info.picIndex).addClass("current");
            },
            autoPlay: function() {
                var This = this;
                this.stopAuto();
                this.info.autoTimer = setInterval(function() {
                    if (This.info.picIndex >= This.info.data.length - 1) {
                        This.info.picIndex = 0;
                    } else {
                        This.info.picIndex++;
                    }
                    This.setTranslateX();
                }, 3e3);
            },
            stopAuto: function() {
                clearInterval(this.info.autoTimer);
            }
        },
        module8: {
            info: {
                direction: "down",
                leftDistance: 0,
                activeNum: 0,
                moduleIndex: 0,
                elType: [ "hor", "hor", "hor", "hor", "hor" ],
                picType: [ "62", "62", "63", "63", "63" ],
                maxLen: 5,
                firstLineKey: [ 0, 1 ],
                lastLineKey: [ 2, 3, 4 ],
                leftDistanceArr: [ 348, 1069, 228, 709, 1190 ],
                data: []
            },
            active: function() {
                return commonModules.module2_3.active.apply(this, arguments);
            },
            deActive: function() {
                return commonModules.module2_3.deActive.apply(this, arguments);
            },
            up: function() {
                return commonModules.module2_3.up.apply(this, arguments);
            },
            down: function() {
                return commonModules.module2_3.down.apply(this, arguments);
            },
            left: function() {
                return commonModules.module2_3.left.apply(this, arguments);
            },
            right: function() {
                return commonModules.module2_3.right.apply(this, arguments);
            },
            ok: function() {
                return commonModules.module2_3.ok.apply(this, arguments);
            },
            createEl: function() {
                return commonModules.module2_3.createEl.apply(this, arguments);
            },
            focus: function() {
                return commonModules.module2_3.focus.apply(this, arguments);
            },
            blur: function() {
                return commonModules.module2_3.blur.apply(this, arguments);
            }
        },
        module27: {
            info: {
                direction: "down",
                leftDistance: 0,
                activeNum: 0,
                moduleIndex: 0,
                elType: [ "hor", "hor", "hor", "hor" ],
                picType: [ "63", "6", "6"],
                listPicType: "63",
                maxLen: 8,
                norLen: 0,
                dotIndex: 0,
                firstLineKey: [ 0, 1, 2 ],
                lastLineKey: [ 0, 1, 2 ],
                leftDistanceArr: [ 348, 900, 1249],
                data: [],
                moveData:[],
                otherData:[],
                moduleInfo: {},
                isFocus: false
            },
            active: function(info) {
                this.info.direction = info.direction;
                this.info.leftDistance = info.leftDistance;
                this.info.moduleIndex = info.moduleIndex;
                this.info.data = kanbaData.subContent[this.info.moduleIndex].moduleContent;
                this.info.data && (this.info.data = this.info.data.slice(0, this.info.maxLen));
                this.info.activeNum = info.activeNum ? info.activeNum : findActiveIndex(this.info.direction, this.info.leftDistance, this.info.firstLineKey, this.info.lastLineKey, this.info.leftDistanceArr);
                this.focus(1,info.isFromVol);
            },
            deActive: function(isGotoOterPage) {
                this.blur(isGotoOterPage);
            },
            createEl: function(moduleIndex) {
                var info = this.info;
                if(this.info.moduleInfo && this.info.moduleInfo.index){
                    this.info.moduleInfo = {
                        index: this.info.moduleInfo.index,
                        dotsTimer: null
                    }; 
                } else {
                    this.info.moduleInfo = {
                        index: info.norLen,
                        dotsTimer: null
                    };
                }
                info.data = kanbaData.subContent[moduleIndex].moduleContent;
                if (info.data.length > 8){
                    info.data = info.data.slice(0,8)
                } else {
                    info.data = info.data
                }
                info.moveData = info.data.slice(0,info.data.length - 2);
                info.otherData = info.data.slice(-2)
                var newArr = info.moveData.slice(0,1).concat(info.otherData);
                var htmlTxt = '';
                htmlTxt += createNorEl(moduleIndex, info.norLen, info.elType, "notrany", info.picType);
                var lis = '';
                for( k in newArr){
                    // htmlTxt += '<div class="notrany lists blocks block' + k + '"  id="m' + moduleIndex  + "m" + k + '">' + '<img src="' + newArr[k].pics[info.picType[k]] + '">' + flashlightHtml + "</div>";
                    htmlTxt += '<div class="notrany lists blocks block' + k + ' noPic"  id="m' + moduleIndex  + "m" + k + '">' + '<img src="' + newArr[k].pics[info.picType[k]] + '">' + '' + "</div>";
                }
                for (var i = 0; i < info.moveData.length; i++) {
                    // lis += '<li class="dot '+ i + (i == 0 ? " current" : "") + '" id="m' + moduleIndex  + "m" + i + '">'+ flashlightHtml +'</li>';
                    lis += '<li class="dot '+ i + (i == 0 ? " current" : "") + '" id="m' + moduleIndex  + "m" + i + '">'+ '' +'</li>';
                }
                return htmlTxt + '<ul class="dots">' + lis + '</ul>';
            },
            loadService: function(moduleIndex){
                !this.info.isFocus && !this.info.moduleInfo.dotsTimer && this.autoPlay(moduleIndex);
            },
            left: function() {
                var info = this.info;
                if (info.activeNum == 0) {
                    return {
                        direction: "down",
                        leftDistance: 1e4,
                        id: findNowId( this.info.moduleIndex, this.info.activeNum)
                    };
                } else {
                    info.activeNum--;
                }
                this.focus(1);
                return false;
            },
            right: function() {
                var info = this.info;
                if (info.activeNum == 2) {
                    return {
                        direction: "down",
                        leftDistance: 0,
                        id: findNowId(this.info.moduleIndex, this.info.activeNum)
                    };
                } else {
                    if(info.activeNum == 0 || info.activeNum == 1){
                        this.info.activeNum++;
                    }
                    this.focus();
                    return false;
                }
            },
            up: function() {
                    return {
                        direction: "up",
                        leftDistance: this.info.leftDistanceArr[this.info.activeNum]
                    };
            },
            down: function() {
                    return {
                        direction: "down",
                        leftDistance: this.info.leftDistanceArr[this.info.activeNum]
                    };
            },
            ok: function() {
                var nowData = this.info.data[this.info.activeNum];
                if (this.info.activeNum == 0) {
                    var nowData = this.info.data[this.info.moduleInfo.index];
                } else {
                    var nowData = this.info.activeNum == 1 ? this.info.data[this.info.data.length - 3]: this.info.activeNum == 2 ? this.info.data[this.info.data.length - 2] : this.info.data[this.info.data.length - 1]
                }
                nowData.categoryId =kanbaData.subContent[this.info.moduleIndex].categoryId;
                $.gotoDetail(nowData);
            },
            addCurrent: function(moduleIndex) {
                var moduleId = "#m" + moduleIndex;
                var $aBlock = $(moduleId + " .dot", moduleId, true);
                $aBlock.removeClass("current");
                $aBlock.item(this.info.moduleInfo.index).addClass("current");
            },
            showPic: function(moduleIndex) {
                var info = this.info;
                var moduleId =  "m" + moduleIndex;
                this.addCurrent(moduleIndex);
                $("#" + moduleId + " .block0 img").attr({
                    src: info.data[this.info.moduleInfo.index].pics[this.info.listPicType]
                });
            },
            autoPlay: function(moduleIndex) {
                var info = this.info;
                var This = this;
                function playNext() {
                    if (info.moduleInfo.index === info.data.length - 3) {
                        info.moduleInfo.index = info.norLen;
                    } else {
                        info.moduleInfo.index++;
                    }
                    This.showPic(moduleIndex);
                }
                this.stopAutoPlay(moduleIndex);
                info.moduleInfo.dotsTimer = setInterval(playNext, 3e3);
            },
            stopAutoPlay: function(moduleIndex) {
                clearInterval(this.info.moduleInfo.dotsTimer);
                this.info.moduleInfo.dotsTimer = null;
            },
            focus: function(isMove,isFromVol) {
                this.info.isFocus = true;
                var info = this.info;
                var moduleId = "m" + info.moduleIndex;
                if (!isFromVol) {
                    if(info.activeNum == 0){
                        this.stopAutoPlay(info.moduleIndex);
                        this.showPic(info.moduleIndex);
                    } else {
                        if (!info.moduleInfo.dotsTimer) {
                            this.autoPlay(info.moduleIndex);
                            this.showPic(info.moduleIndex);
                        }
                    }
                }
                focusTo(isMove, info.moduleIndex, info.activeNum);
            },
            blur: function(isGotoOterPage) {
                var moduleInfo = this.info.moduleInfo;
                if (!moduleInfo.dotsTimer && !isGotoOterPage) {
                    this.autoPlay(this.info.moduleIndex);
                }
            }
        },
    };
    return {
        init: function(menuObj) {
            if (menuObj.listTjUp) {
                listTjUp = menuObj.listTjUp;
            }
            entrance = menuObj.menuType || "";
            activeNum = menuObj.activeNum || 0;
            moduleIndex = menuObj.moduleIndex || 0;
            picIndex = menuObj.picIndex || 0;
            modules.module6.info.picIndex = picIndex;
            modules.module27.info.moduleInfo = menuObj.module27Info || {};
            if ($.isBack() && !menuObj.listTjActive && moduleIndex > 0) {
                moduleIndex = 0;
                activeNum = 0;
            }
            hideListInfo();
            getData(menuObj);
        },
        render: function(menuObj) {
            entrance = menuObj.menuType || "";
            activeNum = 0;
            moduleIndex = 0;
            picIndex = 0;
            modules.module6.info.picIndex = picIndex;
            modules.module27.info.moduleInfo = {};
            getData(menuObj);
        },
        clearListDom: clearListDom,
        isHasContent: function() {
            return !!($nowSection && $nowSection.length && $nowSection.find(".modules").length && $("#m" + moduleIndex + "m" + activeNum).length);
        },
        getInfo: function() {
            var obj = $.pTool.get("p_listTj").getInfo();
            obj.picIndex = modules.module6.info.picIndex;
            obj.module27Info = modules.module27.info.moduleInfo
            return obj;
        }
    };
}();