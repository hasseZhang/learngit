var pageName = "userSystem_home";

var pToolKey = "p_userSystem_home";

var pageInfo = $.initPageInfo(pageName, ["moduleBegin", "moduleIndex", "activeNum", "isHeader", "headerActiveKey"], {
    moduleBegin: 0,
    moduleIndex: 0,
    activeNum: 0,
    isHeader: false,
    headerActiveKey: "search"
});

var pg_activeNum = pageInfo.activeNum;

var pg_moduleBegin = pageInfo.moduleBegin;

var moduleIndex = pageInfo.moduleIndex;

var moduleLength = 5;

var $wrap = null;

var $section = null;

var wrapTop = "";

var moduleOnOff = [true, false, true, false, true];

var userInfo = null;

function load() {
    $.recodeData(pageName, "access");
    if (bgSrc) {
        $(".bg").attr({
            src: bgSrc
        });
    } else {
        $(".bg").attr({
            src: './images/bg.jpg'
        });
    }
    $wrap = $("#wrap");
    $section = $("#section");
    wrapTop = parseInt($wrap.css("top"));
    $.pTool.add(pToolKey, p_userSystem_home);
    $.pTool.get("header").init({
        isUserSystem: true,
        leaveHeader: function () {
            $.pTool.active("p_userSystem_home");
        },
        activeKey: pageInfo.headerActiveKey
    });
    createPageEl();
    loadTitle();
    loadService(0, 1);
    if (pageInfo.isHeader) {
        activeHeader();
    } else {
        $.pTool.active("p_userSystem_home");
    }
}

function activeHeader() {
    $.pTool.active("header");
}

function unload() {
    saveData();
}

function saveData() {
    var headerInfo = $.pTool.get("header").getInfo();
    var saveObj = {
        moduleIndex: moduleIndex,
        moduleBegin: modules["module" + moduleIndex].info.moduleBegin
    };
    if (headerInfo.isActive) {
        saveObj.isHeader = headerInfo.isActive;
        saveObj.headerActiveKey = headerInfo.activeKey;
    } else {
        saveObj.activeNum = pg_activeNum;
    }
    $.savePageInfo(pageName, saveObj);
}

function createPageEl() {
    for (var i = 0; i < moduleLength; i++) {
        var moduleName = "module" + i;
        var $module = $('<div class="modules ' + moduleName + '" id="m' + i + '"></div>');
        var $moduleTitle = null;
        var $blockWrap = $('<div class="blockWrap"></div>');
        if (i > 0 && i < moduleLength - 1) {
            $moduleTitle = $('<div class="moduleTitle"></div>');
            $moduleTitle.appendTo($module);
        }
        $blockWrap.html(modules[moduleName].createEl());
        $blockWrap.appendTo($module);
        $module.appendTo($section);
    }
}

function loadTitle() {
    USER_SERVCICE.growthTitle({}, {
        success: function (result) {
            if (result.code == 1e3 && result.data) {
                $.UTIL.each(result.data, function (value, index) {
                    $("#m" + value.TITLEORDER + " .moduleTitle").html(value.TITLENAME);
                });
            }
        }
    });
}

function loadService(begin, end) {
    for (var i = begin; i < end; i++) {
        var nowType = "module" + i;
        if (modules[nowType] && modules[nowType].loadService) {
            modules[nowType].loadService();
        }
    }
}

function findNowId(moduleIndex, activeNum) {
    return "m" + moduleIndex + "m" + activeNum;
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

function focusTo(isMove, moduleIndex, activeNum, marqueeEl) {
    var elId = findNowId(moduleIndex, activeNum);
    if (isMove) {
        setSectionTranslateY($("#" + elId));
    }
    var $contentTitleId = "#" + elId + " ." + (marqueeEl || "contentTitle");
    var $contentTitle = $($contentTitleId);
    var marqueeObj = {
        el: "#" + elId,
        marquee: [$contentTitleId]
    };
    pg_activeNum = modules["module" + moduleIndex].info.activeNum;
    $.focusTo(marqueeObj);
}

function setSectionTranslateY(el) {
    if (!el.length) {
        return;
    }
    function getPositionTop() {
        var elTop = 0;
        var elem = el;
        var elHeight = "";
        var lastElemKey = "section";
        while (elem.length) {
            if (elem.attr("id") == lastElemKey) {
                break;
            }
            elTop += elem.offsetTop();
            elem = elem.offsetParent();
        }
        return -(elTop + elHeight);
    }
    var translateYElem = $("#section");
    var positionTop = getPositionTop();
    var translateY = positionTop + 95;
    var translateYElemHeight = translateYElem.offsetHeight();
    var sectionHeight = $("#wrap").offsetHeight();
    if (-positionTop + el.offsetHeight() < 720 - wrapTop - 7 || translateY > 0) {
        translateY = 0;
    } else {
        if (translateY < sectionHeight - translateYElemHeight) {
            translateY = sectionHeight - translateYElemHeight;
        }
    }
    autoHeader(translateY);
    translateYElem.css({
        "-webkit-transform": "translateY(" + translateY + "px)"
    });
}

function autoHeader(translateY) {
    if (translateY == 0) {
        $.pTool.get("header").show();
        $("body").removeClass("moveUp");
    } else {
        $.pTool.get("header").hide();
        $("body").addClass("moveUp");
    }
}

function returnToTop() {
    $("#section").css({
        "-webkit-transform": "translateY(0px)"
    });
    autoHeader(0);
}

var modules = {
    module0: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            moduleIndex: 0,
            firstLineKey: [0, 1, 2, 3, 4],
            lastLineKey: [0, 1, 2, 3, 4],
            leftDistanceArr: [354, 498, 641, 784, 928],
            data: []
        },
        active: function (info) {
            !$.UTIL.isUndefined(info.direction) && (this.info.direction = info.direction);
            !$.UTIL.isUndefined(info.leftDistance) && (this.info.leftDistance = info.leftDistance);
            this.info.activeNum = !$.UTIL.isUndefined(info.activeNum) ? info.activeNum : findActiveIndex(this.info.direction, this.info.leftDistance, this.info.firstLineKey, this.info.lastLineKey, this.info.leftDistanceArr);
            this.focus(1);
        },
        deActive: function () { },
        up: function () {
            return {
                direction: "up",
                // leftDistance: this.info.leftDistanceArr[this.info.activeNum] // 都改成左侧第一个
                leftDistance: 0
            };
        },
        down: function () {
            return {
                direction: "down",
                leftDistance: 0
            };
        },
        left: function () {
            if (this.info.activeNum > 0) {
                this.info.activeNum--;
                this.focus();
                return false;
            } else {
                return true;
            }
        },
        right: function () {
            if (this.info.activeNum < 4) {
                this.info.activeNum++;
                this.focus();
                return false;
            } else {
                return true;
            }
        },
        ok: function () {
            var urlArr = ["userSystem/memberGrade/", "userSystem/consumestrm/", "userSystem/rule/", "userSystem/medaList/", "userSystem/myPrize/"];
            $.gotoDetail({
                contentType: "7",
                url: urlArr[this.info.activeNum]
            });
        },
        createEl: function () {
            var html = '<div class="logo1 noPic">' + "<img>" + '<div class="userId"></div>' + "</div>" + '<div class="infoWrap">' + '<div class="info logo2 noPic"><img></div>' + '<div class="info medals">' + '<div class="title">当前勋章</div>' + '<div class="value">' + '<div class="pic"></div>' + '<div class="num"></div>' + "</div>" + "</div>" + '<div class="info points">' + '<div class="title">当前吉豆</div>' + '<div class="value">' + '<div class="pic"></div>' + '<div class="num"></div>' + "</div>" + "</div>" + '<div class="info phoneNum">' + '<div class="title">绑定手机</div>' + '<div class="value"></div>' + "</div>" + "</div>" + '<div class="blocks block0" id="m' + this.info.moduleIndex + 'm0">会员等级</div>' + '<div class="blocks block1" id="m' + this.info.moduleIndex + 'm1">勋章明细</div>' + '<div class="blocks block2" id="m' + this.info.moduleIndex + 'm2">吉豆规则</div>' + '<div class="blocks block3" id="m' + this.info.moduleIndex + 'm3">集豆明细</div>' + '<div class="blocks block4" id="m' + this.info.moduleIndex + 'm4">我的奖品</div>';
            return html;
        },
        loadService: function () {
            var This = this;
            USER_SERVCICE.userinfo({}, {
                success: function (result) {
                    if (result.code == 1e3 && result.data) {
                        userInfo = result.data;
                        $("#m" + This.info.moduleIndex + " .logo1 img").attr({
                            src: vipInfo["v" + userInfo.LEVEL].logo1
                        });
                        $("#m" + This.info.moduleIndex + " .logo1 .userId").html("您的ID : " + $.getVariable("EPG:userId"));
                        $("#m" + This.info.moduleIndex + " .logo2 img").attr({
                            src: vipInfo["v" + userInfo.LEVEL].logo2
                        });
                        $("#m" + This.info.moduleIndex + " .medals .num").html(userInfo.MEDALNUM);
                        $("#m" + This.info.moduleIndex + " .points .num").html(userInfo.POINTNUM);
                        $("#m" + This.info.moduleIndex + " .phoneNum .value").html(userInfo.PHONE || '未绑定');

                    }
                    loadService(1, moduleLength);
                },
                error: function () {
                    us_cue.show({
                        type: 2,
                        text: "数据请求超时，请返回重试。"
                    });
                }
            });
        },
        focus: function (isMove) {
            focusTo(isMove, this.info.moduleIndex, this.info.activeNum);
        },
        blur: function () { }
    },
    module1: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            moduleIndex: 1,
            moduleBegin: 0,
            showLen: 4,
            transX: 295,
            firstLineKey: [0, 1, 2, 3],
            lastLineKey: [0, 1, 2, 3],
            leftDistanceArr: [138, 433, 728, 1023],
            data: []
        },
        active: function (info) {
            !$.UTIL.isUndefined(info.direction) && (this.info.direction = info.direction);
            !$.UTIL.isUndefined(info.leftDistance) && (this.info.leftDistance = info.leftDistance);
            this.info.activeNum = !$.UTIL.isUndefined(info.activeNum) ? info.activeNum : findActiveIndex(this.info.direction, this.info.leftDistance, this.info.firstLineKey, this.info.lastLineKey, this.info.leftDistanceArr) + this.info.moduleBegin;
            if (this.info.data.length && this.info.activeNum > this.info.data.length - 1) {
                this.info.activeNum = Math.max(this.info.data.length - 1, 0);
            }
            this.focus(1);
        },
        deActive: function () { },
        up: function () {
            return {
                direction: "up",
                leftDistance: 0
            };
        },
        down: function () {
            return {
                direction: "down",
                leftDistance: 0
            };
        },
        left: function () {
            if (this.info.activeNum == 0) {
                return {
                    id: "#m" + this.info.moduleIndex + "m" + this.info.activeNum
                };
            }
            if (this.info.activeNum == this.info.moduleBegin) {
                this.info.activeNum--;
                this.info.moduleBegin--;
                $("#m" + this.info.moduleIndex + " .blockInner2").css({
                    "-webkit-transform": "translateX(" + -this.info.transX * this.info.moduleBegin + "px)"
                });
            } else {
                this.info.activeNum--;
            }
            this.focus();
            return false;
        },
        right: function () {
            if (this.info.activeNum >= this.info.data.length - 1) {
                return {
                    id: "#m" + this.info.moduleIndex + "m" + this.info.activeNum
                };
            }
            if (this.info.activeNum == this.info.moduleBegin + this.info.showLen - 1) {
                this.info.activeNum++;
                this.info.moduleBegin++;
                $("#m" + this.info.moduleIndex + " .blockInner2").css({
                    "-webkit-transform": "translateX(" + -this.info.transX * this.info.moduleBegin + "px)"
                });
            } else {
                this.info.activeNum++;
            }
            this.focus();
            return false;
        },
        ok: function () {
            var okActive = this.info.activeNum;
            var opt = $.UTIL.sclone(userInfo);
            var nowData = this.info.data[okActive];
            var This = this;
            if (okActive === this.info.data.length - 1) {
                $.gotoDetail({
                    contentType: "7",
                    url: "userSystem/prizeList/?currentMenu=v1"
                });
                return true;
            }
            // 剩余数量 实物取值GIFTNUM 虚拟取值COUPONNUM
            var num = nowData.GIFTTYPE === '1' ? +nowData.GIFTNUM : +nowData.COUPONNUM;
            if (nowData.STATUS === "未领取") {
                if (num > 0) {
                    opt.GIFTLEVEL = nowData.GIFTLEVEL;
                    opt.GIFTINFO_ID = nowData.GIFTINFO_ID;
                    opt.GIFTNAME = nowData.GIFTNAME;
                    opt.GIFTTYPE = nowData.GIFTTYPE;
                    opt.COUPONTYPE = nowData.COUPONTYPE;
                    opt.GETCONDITION = nowData.GETCONDITION;
                    opt.GRANTTYPE = nowData.GRANTTYPE;
                    opt.GIFTNUM = num;
                    opt.ENDDATE = nowData.ENDDATE;
                    opt.INTRODUCTION = nowData.INTRODUCTION;
                    opt.upDataCb = function (info) {
                        $.UTIL.merge(userInfo, info);
                    };
                    opt.finishCb = function () {
                        USER_SERVCICE.giftlist({}, {
                            success: function (result) {
                                if (result.code == 1e3 && result.data) {
                                    This.info.data = [];
                                    $.UTIL.each(result.data, function (value, index) {
                                        if (value.ISSHOW == 1) {
                                            This.info.data.push(value);
                                        }
                                    });
                                    This.sortData();
                                    This.initEl(This.info.moduleIndex);
                                    $("#m" + This.info.moduleIndex + " .blockInner2").css({
                                        "-webkit-transform": "translateX(" + -This.info.transX * This.info.moduleBegin + "px)"
                                    });
                                    if (moduleIndex == 1) {
                                        This.focus();
                                    }
                                }
                            },
                            error: function () {
                                us_cue.show({
                                    type: 2,
                                    text: "网络异常，请您稍后重试。"
                                });
                            }
                        });
                    };
                    $.pTool.get("us_vipPrize").init(opt);
                    $.pTool.active("us_vipPrize");
                } else {
                    us_cue.show({
                        type: 2,
                        text: "奖品已兑完，请查看其他奖品吧！"
                    });
                }

            } else {
                us_cue.show({
                    type: 2,
                    text: "该奖品无法重复领取！"
                });
            }
        },
        sortData: function () {
            var This = this;
            var oneData = [];
            for (var i = 0; i < this.info.data.length; i++) {
                if (This.info.data[i].STATUS === "已领取") {
                    var overData = This.info.data[i];
                    This.info.data.splice(i, 1);
                    oneData.push(overData);
                    i--;
                }
            }
            oneData.sort(function (a, b) {
                if (b.RECEIVEDATE > a.RECEIVEDATE) {
                    return 1;
                } else if (b.RECEIVEDATE < a.RECEIVEDATE) {
                    return -1;
                }
            });
            this.info.data = this.info.data.concat(oneData).concat({});
        },
        createEl: function () {
            var html = "";
            return html;
        },
        initEl: function () {
            var This = this;
            var parentEl = $("#m" + This.info.moduleIndex + " .blockWrap");
            var html = "";
            var sellOutHtml

            for (var i = 0; i < This.info.data.length; i++) {
                sellOutHtml = "";
                if (i === This.info.data.length - 1) {
                    html += '<div class="blocks block' + i + '" id="m' + This.info.moduleIndex + "m" + i + '"><div class="images noPic"><img src=' + allEntranceImg + "></div></div>"
                    break;
                }
                if (This.info.data[i].GIFTTYPE === "1") {
                    num = +This.info.data[i].GIFTNUM;
                    num === 0 && (sellOutHtml = '<div class="sellOut"></div>');
                } else {
                    num = +This.info.data[i].COUPONNUM;
                    num === 0 && (sellOutHtml = '<div class="sellOut"></div>');
                }
                html += '<div class="blocks block' + i + '" id="m' + This.info.moduleIndex + "m" + i + '"><div class="images noPic"><img src=' + (USER_SERVCICE.host + This.info.data[i].GIFTPICTURE) + "></div>" + '<div class="hasGet' + (This.info.data[i].STATUS === "未领取" ? " hide" : "") + '">已领取</div>' + (This.info.data[i].STATUS === "未领取" ? sellOutHtml : "") + "</div>";
            }
            html = '<div class="blockInner1"><div class="blockInner2">' + html + "</div></div>";
            parentEl.html(html);
        },
        loadService: function () {
            var This = this;
            USER_SERVCICE.giftlist({}, {
                success: function (result) {
                    if (result.code == 1e3 && result.data) {
                        $.UTIL.each(result.data, function (value, index) {
                            if (value.ISSHOW == 1) {
                                This.info.data.push(value);
                            }
                        });
                        if (This.info.data.length) {
                            This.sortData();
                            This.initEl();
                            moduleOnOff[1] = true;
                        }
                        if (moduleIndex == 1) {
                            This.info.moduleBegin = pg_moduleBegin;
                            $("#m" + This.info.moduleIndex + " .blockInner2").css({
                                "-webkit-transform": "translateX(" + -This.info.transX * This.info.moduleBegin + "px)"
                            });
                            This.focus();
                        }
                    }
                },
                error: function () {
                    us_cue.show({
                        type: 2,
                        text: "数据请求超时，请返回重试。"
                    });
                }
            });
        },
        focus: function (isMove) {
            focusTo(isMove, this.info.moduleIndex, this.info.activeNum);
        },
        blur: function () { }
    },
    module2: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            moduleIndex: 2,
            moduleBegin: 0,
            showLen: 4,
            transX: 295,
            firstLineKey: [0, 1, 2, 3],
            lastLineKey: [0, 1, 2, 3],
            leftDistanceArr: [138, 433, 728, 1023],
            data: [],
            reSignTime: 0
        },
        active: function (info) {
            !$.UTIL.isUndefined(info.direction) && (this.info.direction = info.direction);
            !$.UTIL.isUndefined(info.leftDistance) && (this.info.leftDistance = info.leftDistance);
            this.info.activeNum = !$.UTIL.isUndefined(info.activeNum) ? info.activeNum : findActiveIndex(this.info.direction, this.info.leftDistance, this.info.firstLineKey, this.info.lastLineKey, this.info.leftDistanceArr) + this.info.moduleBegin;
            if (this.info.data.length && this.info.activeNum > this.info.data.length - 1) {
                this.info.activeNum = Math.max(this.info.data.length - 1, 0);
            }
            this.focus(1);
        },
        deActive: function () { },
        up: function () {
            return {
                direction: "up",
                leftDistance: 0
            };
        },
        down: function () {
            return {
                direction: "down",
                leftDistance: 0
            };
        },
        left: function () {
            if (this.info.activeNum == 0) {
                return {
                    id: "#m" + this.info.moduleIndex + "m" + this.info.activeNum
                };
            }
            if (this.info.activeNum == this.info.moduleBegin) {
                this.info.activeNum--;
                this.info.moduleBegin--;
                $("#m" + this.info.moduleIndex + " .blockInner2").css({
                    "-webkit-transform": "translateX(" + -this.info.transX * this.info.moduleBegin + "px)"
                });
            } else {
                this.info.activeNum--;
            }
            this.focus();
            return false;
        },
        right: function () {
            if (this.info.activeNum >= this.info.data.length - 1) {
                return {
                    id: "#m" + this.info.moduleIndex + "m" + this.info.activeNum
                };
            }
            if (this.info.activeNum == this.info.moduleBegin + this.info.showLen - 1) {
                this.info.activeNum++;
                this.info.moduleBegin++;
                $("#m" + this.info.moduleIndex + " .blockInner2").css({
                    "-webkit-transform": "translateX(" + -this.info.transX * this.info.moduleBegin + "px)"
                });
            } else {
                this.info.activeNum++;
            }
            this.focus();
            return false;
        },
        ok: function () {
            var This = this;
            var okActive = this.info.activeNum;
            var nowData = this.info.data[okActive];
            if (nowData.status == "已完成") {
                us_cue.show({
                    type: 1,
                    text: "任务已经完成，请您继续加油！"
                });
                return;
            }
            if (nowData.bianma == "101") {
                if (nowData.status == "领取") {
                    This.holeSignIn(nowData.ptstrmid, function () { }, function () {
                        us_cue.show({
                            type: 2,
                            text: "领取失败，请您稍后重试。"
                        });
                    });
                } else if (nowData.status == "去完成") {
                    This.signIn(nowData.ptstrmid, function () { }, function () {
                        us_cue.show({
                            type: 2,
                            text: "领取失败，请您稍后重试。"
                        });
                    });
                }
            } else if (nowData.bianma == "102") {
                if (nowData.status == "领取") {
                    USER_SERVCICE.holePoints({
                        ptstrmid: nowData.ptstrmid
                    }, {
                        success: function (result) {
                            if (result && result.code == 1e3 && result.data) {
                                This.getFinish("102", result.data);
                            }
                        },
                        error: function () {
                            us_cue.show({
                                type: 2,
                                text: "领取失败，请您稍后重试。"
                            });
                        }
                    });
                } else if (nowData.status == "去完成") {
                    var arr = nowData.videolink.split("://");
                    var type = arr[0];
                    var contentId = arr[1];
                    var typeMap = {
                        vod: "0",
                        series: "2",
                        xilieju: "3",
                        zt: "4"
                    };
                    var contentType = typeMap[type] || "7";
                    var urlMap = {
                        4: "detailPage/" + (contentType === "4" && contentId ? top.getFTPFilePath(contentId, "").slice(0, -1) + "/index.html" : ""),
                        7: nowData.videolink
                    };
                    $.gotoDetail({
                        contentType: contentType,
                        contentUri: urlMap[contentType],
                        contentId: contentId,
                        categoryId: "userSystem_videoTask"
                    });
                }
            } else if (nowData.bianma == "103") {
                if (nowData.status == "领取") {
                    USER_SERVCICE.holePoints({
                        ptstrmid: nowData.ptstrmid
                    }, {
                        success: function (result) {
                            if (result && result.code == 1e3 && result.data) {
                                This.getFinish("103", result.data);
                            }
                        },
                        error: function () {
                            us_cue.show({
                                type: 2,
                                text: "领取失败，请您稍后重试。"
                            });
                        }
                    });
                } else if (nowData.status == "去完成") {
                    $.auth.forwardOrder(false, false, [nowData.productids]);
                }
            } else if (nowData.bianma == "104") {
                if (nowData.status == "领取") {
                    USER_SERVCICE.holePoints({
                        ptstrmid: nowData.ptstrmid
                    }, {
                        success: function (result) {
                            if (result && result.code == 1e3 && result.data) {
                                This.getFinish("104", result.data);
                            }
                        },
                        error: function () {
                            us_cue.show({
                                type: 2,
                                text: "领取失败，请您稍后重试。"
                            });
                        }
                    });
                } else {
                    $.pTool.get("us_bindPhone").init({
                        pointNum: nowData.info.match(/\d+/)[0],
                        finishCb: function (tel) {
                            userInfo.PHONE = tel;
                            $("#m0 .phoneNum .value").html(userInfo.PHONE);
                            USER_SERVCICE.addPoints({
                                pointtype: "104"
                            }, {
                                success: function (result) {
                                    if (result && result.code == 1e3 && result.data) {
                                        This.upStatus("104", "领取");
                                        This.info.data = result.data;
                                        This.sortData();
                                        $.UTIL.each(This.info.data, function (value, index) {
                                            if (value.bianma == "104") {
                                                ptstrmid = value.ptstrmid;
                                            }
                                        });
                                        USER_SERVCICE.holePoints({
                                            ptstrmid: ptstrmid
                                        }, {
                                            success: function (result) {
                                                if (result && result.code == 1e3 && result.data) {
                                                    This.getFinish("104", result.data, function (upPoint) {
                                                        us_cue.show({
                                                            type: 1,
                                                            text: "绑定成功，领取" + upPoint + "吉豆!"
                                                        });
                                                    });
                                                }
                                            },
                                            error: function () { }
                                        });
                                    }
                                },
                                error: function () { }
                            });
                        }
                    });
                    $.pTool.active("us_bindPhone");
                }
            }
        },
        createEl: function () {
            var html = "";
            return html;
        },
        sortData: function () {
            var This = this;
            var oneData = [];
            for (var i = 0; i < this.info.data.length; i++) {
                if (This.info.data[i].status == "已完成") {
                    var overData = This.info.data[i];
                    This.info.data.splice(i, 1);
                    oneData.push(overData);
                    i--;
                }
            }
            oneData.sort(function (a, b) {
                if (b.date > a.date) {
                    return 1;
                } else if (b.date < a.date) {
                    return -1;
                }
            });
            this.info.data = this.info.data.concat(oneData);
        },
        getFinish: function (type, pointNum, custom) {
            var This = this;
            var upPoint = pointNum - userInfo.POINTNUM;
            userInfo.POINTNUM = pointNum;
            $("#m0 .points .num").html(userInfo.POINTNUM);
            if (custom) {
                custom(upPoint);
            } else {
                us_cue.show({
                    type: 1,
                    text: "领取成功，吉豆+" + upPoint
                });
            }

            USER_SERVCICE.pointsTask({}, {
                success: function (result) {
                    if (result.code == 1e3 && result.data) {
                        This.info.data = result.data;
                        This.sortData();
                        This.initEl(This.info.moduleIndex);
                        if (moduleIndex == 2) {
                            This.focus();
                        }
                    }
                }
            });
        },
        signIn: function (ptstrmid, successCb, errorCb) {
            var This = this;
            USER_SERVCICE.addPoints({
                pointtype: "101"
            }, {
                success: function (result) {
                    if (result && result.code == 1e3 && result.data) {
                        This.upStatus("101", "领取");
                        This.info.data = result.data;
                        This.sortData();
                        $.UTIL.each(This.info.data, function (value, index) {
                            if (value.bianma == "101") {
                                ptstrmid = value.ptstrmid;
                            }
                        });
                        This.holeSignIn(ptstrmid, successCb, errorCb);
                    }
                },
                error: function () {
                    errorCb && errorCb();
                }
            });
        },
        holeSignIn: function (ptstrmid, successCb, errorCb) {
            var This = this;
            if (ptstrmid) {
                USER_SERVCICE.holePoints({
                    ptstrmid: ptstrmid
                }, {
                    success: function (result) {
                        if (result && result.code == 1e3 && result.data) {
                            This.getFinish("101", result.data);
                            successCb && successCb();
                        }
                    },
                    error: function () {
                        errorCb && errorCb();
                    }
                });
            } else {
                if (This.info.reSignTime < 1) {
                    This.info.reSignTime++;
                    USER_SERVCICE.pointsTask({}, {
                        success: function (result) {
                            if (result.code == 1e3 && result.data) {
                                This.info.data = result.data;
                                This.sortData();
                                $.UTIL.each(This.info.data, function (value, index) {
                                    if (value.bianma == "101") {
                                        ptstrmid = value.ptstrmid;
                                        This.holeSignIn(ptstrmid, successCb, errorCb);
                                    }
                                });
                            } else {
                                errorCb && errorCb();
                            }
                        },
                        error: function () {
                            errorCb && errorCb();
                        }
                    });
                } else {
                    errorCb && errorCb();
                }
            }
        },
        upStatus: function (type, status) {
            var This = this;
            $.UTIL.each(this.info.data, function (value, index) {
                if (value.bianma == type) {
                    value.status = status;
                    $("#m2m" + index + " .status img").attr({
                        src: This.getStatusPic(value.status)
                    });
                }
            });
        },
        loadService: function () {
            var This = this;
            USER_SERVCICE.pointsTask({}, {
                success: function (result) {
                    if (result.code == 1e3 && result.data) {
                        This.info.data = result.data;
                        This.sortData();
                        This.initEl();
                        $.UTIL.each(This.info.data, function (value, index) {
                            if (value.bianma == "101") {
                                if (value.status === "去完成") {
                                    This.signIn(value.ptstrmid);
                                } else if (value.status === "领取") {
                                    This.holeSignIn(value.ptstrmid);
                                }
                            }
                        });
                        if (moduleIndex == 2) {
                            This.info.moduleBegin = pg_moduleBegin;
                            $("#m" + This.info.moduleIndex + " .blockInner2").css({
                                "-webkit-transform": "translateX(" + -This.info.transX * This.info.moduleBegin + "px)"
                            });
                            This.focus();
                        }
                    }
                }
            });
        },
        getStatusPic: function (status) {
            var statusSrc = "";
            if (status === "去完成") {
                statusSrc = "images/unFinish.png";
            } else if (status === "领取") {
                statusSrc = "images/get.png";
            } else {
                statusSrc = "images/finished.png";
            }
            return statusSrc;
        },
        initEl: function () {
            var This = this;
            var parentEl = $("#m" + This.info.moduleIndex + " .blockWrap");
            var imgObj = {
                101: "images/signIn.png",
                102: "images/video.png",
                103: "images/order.png",
                104: "images/phone.png"
            };
            var html = "";
            parentEl.html(html);
            $.UTIL.each(This.info.data, function (value, index) {
                var pointTxt = "";
                var rateTxt = "";
                if (value.bianma == "102") {
                    rateTxt = '<div class="rate">' + value.videono + "/" + value.videosum + "</div>";
                }
                html += '<div class="blocks block' + index + '" id="m' + This.info.moduleIndex + "m" + index + '">' + '<img class="pic" src="' + imgObj[value.bianma] + '">' + '<div class="task">' + value.title + "</div>" + '<div class="point"><img src="images/pointLogo.png">' + pointTxt + value.info + "</div>" + '<img class="status" src="' + This.getStatusPic(value.status) + '">' + rateTxt + "</div>";
            });
            var html = '<div class="blockInner1"><div class="blockInner2">' + html + "</div></div>";
            parentEl.html(html);
        },
        focus: function (isMove) {
            focusTo(isMove, this.info.moduleIndex, this.info.activeNum);
        },
        blur: function () { }
    },
    module3: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            moduleIndex: 3,
            totalLine: 0,
            col: 3,
            firstLineKey: [],
            lastLineKey: [],
            leftDistanceCol: [187, 580, 973],
            leftDistanceArr: [],
            data: []
        },
        active: function (info) {
            !$.UTIL.isUndefined(info.direction) && (this.info.direction = info.direction);
            !$.UTIL.isUndefined(info.leftDistance) && (this.info.leftDistance = info.leftDistance);
            this.info.activeNum = !$.UTIL.isUndefined(info.activeNum) ? info.activeNum : findActiveIndex(this.info.direction, this.info.leftDistance, this.info.firstLineKey, this.info.lastLineKey, this.info.leftDistanceArr);
            this.focus(1);
        },
        deActive: function () { },
        up: function () {
            if (Math.floor(this.info.activeNum / this.info.col) == 0) {
                return {
                    direction: "up",
                    leftDistance: 0
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
                    leftDistance: 0
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
                    id: "#m" + this.info.moduleIndex + "m" + this.info.activeNum
                };
            } else {
                this.info.activeNum--;
                this.focus();
                return false;
            }
        },
        right: function () {
            if (this.info.activeNum % this.info.col == this.info.col - 1 || this.info.activeNum >= this.info.data.length - 1) {
                return {
                    id: "#m" + this.info.moduleIndex + "m" + this.info.activeNum
                };
            } else {
                this.info.activeNum++;
                this.focus();
                return false;
            }
        },
        ok: function () {
            var okActive = this.info.activeNum;
            var opt = $.UTIL.sclone(userInfo);
            var This = this;
            var nowData = this.info.data[okActive];
            // 剩余数量 实物取值GOODSSURPLUS 虚拟取值COUPONNUM
            var num = nowData.GOODSTYPE === '1' ? +nowData.GOODSSURPLUS : +nowData.COUPONNUM;
            if (num > 0) {
                opt.GOODSINFO_ID = nowData.GOODSINFO_ID;
                opt.GOODSNAME = nowData.GOODSNAME;
                opt.GRANTTYPE = nowData.GRANTTYPE;
                opt.GOODSSURPLUS = num;
                opt.ENDDATE = nowData.ENDDATE;
                opt.INTRODUCTION = nowData.INTRODUCTION;
                opt.GOODSTYPE = nowData.GOODSTYPE;
                opt.COUPONTYPE = nowData.COUPONTYPE;
                opt.GOODSNEEDPOINT = nowData.GOODSNEEDPOINT;
                opt.GOODSPICTURE = USER_SERVCICE.host + nowData.GOODSPICTURE;
                opt.upDataCb = function (info) {
                    $.UTIL.merge(userInfo, info);
                };
                opt.finishCb = function (pointNum) {
                    $("#m0 .points .num").html(pointNum);
                    USER_SERVCICE.goodsList({}, {
                        success: function (result) {
                            if (result.code == 1e3 && result.data) {
                                This.info.data = result.data;
                                This.sortData();
                                This.initEl(This.info.moduleIndex);
                                if (moduleIndex == 3) {
                                    This.focus();
                                }
                            }
                        },
                        error: function () {
                            us_cue.show({
                                type: 2,
                                text: "网络异常，请您稍后重试。"
                            });
                        }
                    });
                };
                $.pTool.get("us_pointPrize").init(opt);
                $.pTool.active("us_pointPrize");
            } else {
                us_cue.show({
                    type: 2,
                    text: "奖品已兑完，请查看其他奖品吧！"
                });
            }
        },
        createEl: function () {
            var html = "";
            return html;
        },
        sortData: function () {
            var This = this;
            var oneData = [];
            var num = '';
            for (var i = 0; i < this.info.data.length; i++) {
                num = This.info.data[i].GOODSTYPE === '1' ? +This.info.data[i].GOODSSURPLUS : +This.info.data[i].COUPONNUM;
                if (num == 0) {
                    var overData = This.info.data[i];
                    This.info.data.splice(i, 1);
                    oneData.push(overData);
                    i--;
                }
            }
            oneData.sort(function (a, b) {
                if (b.WITHOUTDATE > a.WITHOUTDATE) {
                    return 1;
                } else if (b.WITHOUTDATE < a.WITHOUTDATE) {
                    return -1;
                }
            });
            this.info.data = this.info.data.concat(oneData);
        },
        initEl: function () {
            var This = this;
            This.info.totalLine = Math.ceil(This.info.data.length / This.info.col);
            var firstLineKeyArr = [];
            var lastLineKeyArr = [];
            var leftDistanceArr = [];
            if (This.info.data.length) {
                for (var i = 0; i < Math.min(This.info.data.length, This.info.col); i++) {
                    firstLineKeyArr.push(i);
                }
                for (var i = (This.info.totalLine - 1) * This.info.col; i < This.info.data.length; i++) {
                    lastLineKeyArr.push(i);
                }
                for (var i = 0; i < This.info.data.length; i++) {
                    leftDistanceArr.push(This.info.leftDistanceCol[i % This.info.col]);
                }
            }
            This.info.firstLineKey = firstLineKeyArr;
            This.info.lastLineKey = lastLineKeyArr;
            This.info.leftDistanceArr = leftDistanceArr;
            var parentEl = $("#m" + This.info.moduleIndex + " .blockWrap");
            var html = "";
            parentEl.html(html);
            var sellOutHtml = "";
            var num = 0;
            for (var i = 0; i < This.info.data.length; i++) {
                sellOutHtml = "";
                if (This.info.data[i].GOODSTYPE === "1") {
                    num = +This.info.data[i].GOODSSURPLUS;
                    num === 0 && (sellOutHtml = '<div class="sellOut"></div>');
                } else {
                    num = +This.info.data[i].COUPONNUM;
                    num === 0 && (sellOutHtml = '<div class="sellOut"></div>');
                }
                html += '<div class="blocks block' + i + '" id="m' + This.info.moduleIndex + "m" + i + '">' + '<div class="prizeName">' + This.info.data[i].GOODSNAME + "</div>" + '<div class="prizePoint"><img src="images/pointLogo.png"><span>' + This.info.data[i].GOODSNEEDPOINT + "</span>吉豆</div>" + '<div class="prizeNum">剩余' + num + "</div>" + '<div class="prizePic noPic"><img src=' + (USER_SERVCICE.host + This.info.data[i].GOODSPICTURE) + "></div>" + sellOutHtml + "</div>";
            }
            parentEl.html(html);
        },
        loadService: function () {
            var This = this;
            USER_SERVCICE.goodsList({}, {
                success: function (result) {
                    if (result.code == 1e3 && result.data) {
                        This.info.data = result.data;
                        This.sortData();
                        This.initEl();
                        moduleOnOff[3] = true;
                        if (moduleIndex == 3) {
                            This.focus(1);
                        }
                    }
                },
                error: function () {
                    us_cue.show({
                        type: 2,
                        text: "数据请求超时，请返回重试。"
                    });
                }
            });
        },
        focus: function (isMove) {
            focusTo(isMove, this.info.moduleIndex, this.info.activeNum);
        },
        blur: function () { }
    },
    module4: {
        info: {
            direction: "down",
            leftDistance: 0,
            activeNum: 0,
            moduleIndex: 4,
            firstLineKey: [0],
            lastLineKey: [0],
            leftDistanceArr: [640],
            data: []
        },
        active: function (info) {
            !$.UTIL.isUndefined(info.direction) && (this.info.direction = info.direction);
            !$.UTIL.isUndefined(info.leftDistance) && (this.info.leftDistance = info.leftDistance);
            this.info.activeNum = !$.UTIL.isUndefined(info.activeNum) ? info.activeNum : findActiveIndex(this.info.direction, this.info.leftDistance, this.info.firstLineKey, this.info.lastLineKey, this.info.leftDistanceArr);
            this.focus(1);
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
            return true;
        },
        right: function () {
            return true;
        },
        ok: function () {
            returnToTop();
            return true;
        },
        createEl: function () {
            var html = '<div class="blocks block0" id="m' + this.info.moduleIndex + 'm0">返回顶部</div>';
            return html;
        },
        focus: function (isMove) {
            focusTo(isMove, this.info.moduleIndex, this.info.activeNum);
        },
        blur: function () { }
    }
};

function activeModule(info) {
    modules["module" + moduleIndex].active(info);
}

function runModule(type) {
    return modules["module" + moduleIndex][type]();
}

function shake($id) {
    if (moduleIndex > 0 && moduleIndex < moduleLength - 1) {
        var $noEl = $($id);
        if (!$noEl.hasClass("public_shake")) {
            $noEl.addClass("public_shake");
            clearTimeout($noEl.shakeTimer);
            $noEl.shakeTimer = setTimeout(function () {
                $noEl.removeClass("public_shake");
            }, 500);
        }
    }
}

var p_userSystem_home = {
    key: pToolKey,
    keysMap: {
        KEY_DOWN: function () {
            var info = runModule("down");
            if (info && moduleIndex < moduleLength - 1 && moduleOnOff[moduleIndex + 1]) {
                moduleIndex++;
                activeModule(info);
            }
            return true;
        },
        KEY_UP: function () {
            var info = runModule("up");
            if (info) {
                if (moduleIndex === 0) {
                    pg_activeNum = 0;
                    activeHeader();
                } else {
                    if (moduleOnOff[moduleIndex - 1]) {
                        moduleIndex--;
                        activeModule(info);
                    }
                }
            }
            return true;
        },
        KEY_LEFT: function () {
            var moduleInfo = runModule("left");
            if (moduleInfo) {
                shake(moduleInfo.id);
            }
            return true;
        },
        KEY_RIGHT: function () {
            var moduleInfo = runModule("right");
            if (moduleInfo) {
                shake(moduleInfo.id);
            }
            return true;
        },
        KEY_OK: function () {
            runModule("ok");
            if (moduleIndex === moduleLength - 1) {
                pg_activeNum = 0;
                moduleIndex = 0;
                activeModule({
                    activeNum: pg_activeNum
                });
            }
            return true;
        }
    },
    active: function () {
        activeModule({
            activeNum: pg_activeNum
        });
    },
    deactive: function () { },
    cover: function () {
        return true;
    },
    uncover: function () {
        return true;
    },
    destroy: function () { },
    init: function () { }
};

(function (factory) {
    $.pTool.add("us_bindPhone", factory());
})(function () {
    var key = "us_bindPhone";
    var $pop = null;
    var pointNum = 0;
    var finishCb = function () { };
    var unFinishCb = function () { };
    var activeKey = "phoneNum";
    var preFocus = 'veriCode';
    var setVeriCodeTime = 60;
    var veriCodeTime = setVeriCodeTime;
    var veriCodeTimer = null;
    var isCanSendVeriCode = true;
    var nowPhoneNum = "";
    function initDom() {
        if (!$pop) {
            $pop = $('<div id="us_bindPhone" class="hide">' + '<div class="phoneNum"></div>' + '<div class="errTel hide">请输入正确的手机号</div>' + '<div class="veriCode"></div>' + '<div class="getVeriCode">获取验证码</div>' + '<div class="errVeriCode hide">请输入验证码</div>' + '<div class="yes btn">确定</div>' + '<div class="no btn">取消</div>' + "</div>");
            $pop.appendTo("body");
        }
    }
    function focusTo() {
        $.focusTo({
            el: "#us_bindPhone ." + activeKey
        });
    }
    function show() {
        if ($pop) {
            $pop.show();
        }
    }
    function hide() {
        if ($pop) {
            $pop.hide();
        }
    }
    function printNum(num) {
        var lengthLimit = {
            phoneNum: 11,
            veriCode: 4
        };
        if (activeKey === "phoneNum" || activeKey === "veriCode") {
            var nowInput = getInput(activeKey);
            if (nowInput.length < lengthLimit[activeKey]) {
                $("#us_bindPhone ." + activeKey).html(nowInput + num);
            }
            if (activeKey === "phoneNum") {
                $("#us_bindPhone .errTel").hide();
            } else {
                $("#us_bindPhone .errVeriCode").hide();
            }
        }
    }
    function delInput() {
        if (activeKey === "phoneNum" || activeKey === "veriCode") {
            var nowInput = getInput(activeKey);
            if (nowInput.length > 0) {
                $("#us_bindPhone ." + activeKey).html(nowInput.substring(0, nowInput.length - 1));
                $("#us_bindPhone .errTel").hide();
            } else {
                return true;
            }
        } else {
            return true;
        }
    }
    function getInput(type) {
        return $("#us_bindPhone ." + type).html();
    }
    function reset() {
        $("#us_bindPhone .veriCode").html("");
        $("#us_bindPhone .errTel").hide();
        $("#us_bindPhone .errVeriCode").hide();
    }
    return {
        key: key,
        keysMap: {
            GN: function (key, num) {
                printNum(num);
                return true;
            },
            KEY_LEFT: function () {
                if (activeKey === "no") {
                    activeKey = "yes";
                } else if (activeKey === "getVeriCode") {
                    activeKey = "veriCode";
                    preFocus = "veriCode";
                }
                focusTo();
                return true;
            },
            KEY_RIGHT: function () {
                if (activeKey === "yes") {
                    activeKey = "no";
                } else if (activeKey === "veriCode") {
                    activeKey = "getVeriCode";
                    preFocus = "getVeriCode";
                }
                focusTo();
                return true;
            },
            KEY_UP: function () {
                if (activeKey === "yes") {
                    activeKey = "veriCode";
                } else if (activeKey === "veriCode" || activeKey === "getVeriCode") {
                    activeKey = "phoneNum";
                } else if (activeKey === "no") {
                    activeKey = "getVeriCode";
                }
                focusTo();
                return true;
            },
            KEY_DOWN: function () {
                if (activeKey === "phoneNum") {
                    activeKey = preFocus;
                } else if (activeKey === "veriCode" || activeKey === "getVeriCode") {
                    activeKey = "yes";
                }
                focusTo();
                return true;
            },
            KEY_OK: function () {
                if (activeKey === "yes") {
                    var isCanOk = true;
                    if ($("#us_bindPhone .veriCode").html().length) {
                        $("#us_bindPhone .errVeriCode").hide();
                    } else {
                        $("#us_bindPhone .errVeriCode").show();
                        isCanOk = false;
                    }
                    if (/^1[3456789]\d{9}$/.test($("#us_bindPhone .phoneNum").html())) {
                        $("#us_bindPhone .errTel").hide();
                    } else {
                        $("#us_bindPhone .errTel").show();
                        isCanOk = false;
                    }
                    if (isCanOk) {
                        nowPhoneNum = $("#us_bindPhone .phoneNum").html();
                        USER_SERVCICE.blindPhone({
                            phone: nowPhoneNum,
                            checkcode: $("#us_bindPhone .veriCode").html()
                        }, {
                            success: function (result) {
                                if (result.code == 1e3) {
                                    finishCb(nowPhoneNum);
                                }else if(result.code == 1005){
                                    us_cue && us_cue.show({
                                        type: 2,
                                        text: "手机号已绑定其他机顶盒。"
                                    });
                                    unFinishCb();
                                } else if(result.code == 1004){
                                    us_cue && us_cue.show({
                                        type: 2,
                                        text: "手机验证码无效。"
                                    });
                                    unFinishCb();
                                }else if(result.code == 1003){
                                    us_cue && us_cue.show({
                                        type: 2,
                                        text: "手机验证码已过期。"
                                    });
                                    unFinishCb();
                                }else if(result.code == 1006){
                                    us_cue && us_cue.show({
                                        type: 2,
                                        text: "手机号绑定机顶盒已存在"
                                    });
                                    unFinishCb();
                                }else{
                                    us_cue && us_cue.show({
                                        type: 2,
                                        text: "绑定失败，请您稍后重试。"
                                    });
                                    unFinishCb();
                                }
                            },
                            error: function () {
                                us_cue && us_cue.show({
                                    type: 2,
                                    text: "绑定失败，请您稍后重试。"
                                });
                                unFinishCb();
                            }
                        });
                        $.pTool.deactive(key);
                    }
                } else if (activeKey === "no") {
                    $.pTool.deactive(key);
                } else if (activeKey === "getVeriCode" && isCanSendVeriCode) {
                    if (/^1[3456789]\d{9}$/.test($("#us_bindPhone .phoneNum").html())) {
                        USER_SERVCICE.sendCode({
                            phone: $("#us_bindPhone .phoneNum").html()
                        }, {});
                        isCanSendVeriCode = false;
                        $("#us_bindPhone .getVeriCode").html(veriCodeTime + "s");
                        clearInterval(veriCodeTimer);
                        veriCodeTimer = setInterval(function () {
                            veriCodeTime--;
                            if (veriCodeTime === 0) {
                                veriCodeTime = setVeriCodeTime;
                                isCanSendVeriCode = true;
                                $("#us_bindPhone .getVeriCode").html("获取验证码");
                                clearInterval(veriCodeTimer);
                            } else {
                                $("#us_bindPhone .getVeriCode").html(veriCodeTime + "s");
                            }
                        }, 1e3);
                        activeKey = "veriCode";
                        focusTo();
                        $("#us_bindPhone .errTel").hide();
                    } else {
                        $("#us_bindPhone .errTel").show();
                    }
                }
                return true;
            },
            KEY_RETURN: function () {
                if (delInput()) {
                    $.pTool.deactive(key);
                }
                return true;
            }
        },
        init: function (opt) {
            pointNum = opt.pointNum;
            opt.finishCb && (finishCb = opt.finishCb);
            opt.unFinishCb && (unFinishCb = opt.unFinishCb);
            initDom();
        },
        active: function () {
            activeKey = "phoneNum";
            show();
            focusTo();
        },
        deactive: function () {
            reset();
            hide();
        },
        cover: function () { },
        uncover: function () { },
        destroy: function () { }
    };
});