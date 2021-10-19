var pageName = "vodDetail";

var RECODE_DATA_KEY = "vodDetail";

$.vs.invented();

var contentId = $.page.contentId;

var contentName = "";

var categoryId = $.page.categoryId || '999999';

var detailInfo = {};

var actorArr = [];

var $btnWrap = null;

var $actorName = null;

var $videoList = null;

var $twelve = null;

var $four = null;

var $windowCue = null;

var $windowText = null;

var $videoWindow = null;

var $tryTime = null;

var $wrap = null;

var modulesMap = ["detail", "twelve", "four"];

var vl = null;

var isHasBuy = false;

var isSubSynopsis = false;

var isFaved = false;

var isTryOver = false;

var tryTime = 60 * 6;

var playTime = 0;

var firstPlay = true;

var playTimer = null;

var saveHisTimer = null;

var isCanSaveHis = false;

var stoptime = false;

var isOpenLoading = false;

var isOpenId = $.getVariable("EPG:isTest") ? "1100005877" : "1100005903";

$.s.guidance.get({
    id: isOpenId
}, {
    async: false,
    success: function (res) {
        if (res[0].contentUri == "open") {
            isOpenLoading = true;
        }
    },
    error: function () { }
});
// 新增订购入口
var $orderEntry = null;
// 鉴权成功的导读
var orderSuccessId = $.getVariable("EPG:isTest") ? "1100008726" : "1100008790";
// 鉴权失败的导读
var orderErrorId = $.getVariable("EPG:isTest") ? "1100008727" : "1100008791";
// 配置跳转的url
var orderEntryUrl = "";
// 订购入口是否聚焦的标识
var canFocusOrder = false;

var detailCategoryId = '';
// 第三方SPshow不同风格页面
var isOtt = false;

var pageInfo = $.initPageInfo(pageName, ["isGotoFull", "btnIndex", "detailFp", "isHeader", "headerActiveKey"], {
    isGotoFull: false,
    btnIndex: "dft",
    detailFp: "btn",
    isHeader: false,
    headerActiveKey: "search"
});

var isGotoFull = pageInfo.isGotoFull;

var isHeader = pageInfo.isHeader;

var headerActiveKey = pageInfo.headerActiveKey;

var moduleIndex = 0;

var totalTime = 0;
// 广告参数
var intervalId = null;

var isHasAd = false;

var isPlayAd = false;

var isFirstBefore = true;

var picShowTime = null;

var savePrePicInfo = null;


function leaveHeader() {
    $.pTool.active("vodDetail");
}
function sendPageVs() {
    var page_name = isOtt ? pageName + '_YK' : pageName;
    $.recodeData(page_name, "access");
}

var dataRecommend = {};

function loadRecommend() {
    var recommendUrl = isOtt ? $.urls.dataRecommend0.replace('recommend0', 'recommendOtt/recommend0') : $.urls.dataRecommend0
    $.get(recommendUrl, {
        success: function (data) {
            dataRecommend = JSON.parse(data.replace(/\\(\;|\')/gm, "$1"));
        }
    }, false)
}

function loadOttPic(data) {
    var oC = $("#caBg")[0];
    var oGC = oC.getContext("2d");
    var url = data.vodPicMap[101] ? $.getVariable("EPG:pathPic") + '/' + data.vodPicMap[101] : '';
    $wrap && $wrap.addClass('isOtt');
    url && $("#videoBkg").css({
        background: "url(" + url + ") 0 0 no-repeat",
        backgroundSize: '100% 100%'
    }).show();
    oGC.width = 1920;
    oGC.height = 1080;
    oGC.clearRect(0, 0, 1920, 1080);
    $("body").css({
        background: "url(images/bg.png) 0 0 no-repeat",
        backgroundSize: '100% 100%'
    })
}

function load() {
    $btnWrap = $("#btnWrap");
    $actorName = $("#actorName");
    $videoList = $("#videoList");
    $twelve = $("#twelve");
    $four = $("#four");
    $windowCue = $("#videoWindow .cue");
    $windowText = $("#videoWindow .text");
    $videoWindow = $("#videoWindow");
    $wrap = $("#wrap");
    $orderEntry = $("#orderEntry");
    canvasBg();
    $.s.detail.get({
        id: contentId
    }, {
        success: function (data) {
            // vodIsOtt 2 爱奇艺
            if(data.vodIsOtt === "2"){
                $('body').hide();
                var path = "activitiesZone/AQY/apk/index.html";
                var opt = { contentId: contentId || '',  contentName: encodeURIComponent(data.vodName) || ''};
                var url = $.search.append(path, opt);
                $.gotoDetail({
                    contentType: "7",
                    url: url,
                }, true);
                return;
            }
            // vodIsOtt 1 优酷
            data.vodIsOtt === "1" && (isOtt = true);
            if (isOtt) {
                $wrap && $wrap.addClass('isOtt');
                var url = data.vodPicMap[101] ? $.getVariable("EPG:pathPic") + '/' + data.vodPicMap[101] : '';
                url && $("#videoBkg").css({
                    background: "url(" + url + ") 0 0 no-repeat",
                    backgroundSize: '100% 100%'
                }).show()
            }
            $.pTool.get("header").init({
                isHasTime: 1,
                wrap: "#wrap",
                showKmLogo: isOtt ? true : false,
                activeKey: headerActiveKey,
                leaveHeader: leaveHeader
            });
            isOtt && loadOttPic(data);
            loadRecommend();
            detailInfo = data;
            var cpInfo = [];
            $.UTIL.each(detailInfo.jsVodChargesToCps, function (value, index) {
                cpInfo.push(value.cpName);
            });
            for (var i = 0; i < cpInfo.length; i++) {
                for (var j = i + 1; j < cpInfo.length; j++) {
                    if (cpInfo[i] == cpInfo[j]) {
                        cpInfo.splice(j, 1);
                        j--;
                    }
                }
            }
            $('<div id="cpInfo"></div>').appendTo($wrap).html("视频内容提供方：" + cpInfo.join("、"));
            var videoNameHtml = "";
            if (data.vodName) {
                contentName = data.vodName;
                videoNameHtml = '<div id="videoName">' + data.vodName + "</div>";
            }
            var baseInfoHtml = "";
            isHasAd = !(detailInfo.vipFlag === "1");
            if (data.vipFlag && data.vipFlag === "1") {
                baseInfoHtml += '<div style="border-right: 0;padding-right: 0;"><img class="vip" src="images/vip.png"></div>';
            }
            var onlineYear = data.onlineTimes && data.onlineTimes.substring(0, 4);
            if (onlineYear && onlineYear !== "1970") {
                baseInfoHtml += "<div>" + onlineYear + "</div>";
            }
            if (data.vodTimes) {
                baseInfoHtml += "<div>" + parseInt(data.vodTimes) + "分钟</div>";
            }
            if (data.vodTags && data.vodTags.length) {
                baseInfoHtml += "<div>" + data.vodTags.join("、") + "</div>";
            }
            if (baseInfoHtml) {
                baseInfoHtml = '<div id="baseInfo">' + baseInfoHtml + "</div>";
            }
            //var directorHtml = "";
            var actorHtml = "";
            var packageHtml = "";
            var packageLength = "";
            if (/暂无/.test(data.vodDirector) || /暂无/.test(data.vodActordis)) {
                var packageStr = packageSort(data.jsVodChargesToCps);
                packageLength = packageStr.length;
                packageHtml = $.substringElLength(packageStr, "28px", "863px").last;
                if (packageHtml) {
                    packageHtml = '<div id="package"><div class="content">' + packageHtml + "</div></div>";
                }
            } else {
                var subStr = $.substringElLength(data.vodDirector + ' / ' + data.vodActordis, "28px", "863px").last;
                if (data.vodDirector&&data.vodActordis) {
                    actorHtml = '<div id="director"><div class="content">' + subStr + "</div></div>";
                }
                // if (data.vodActordis) {
                //     actorHtml = '<div id="actor"><div class="content">' + data.vodActordis + "</div></div>";
                // }
            }
            var synopsisHtml = "";
            var subObj = {};
            var subLength = "1590px";
            var moreBtnHtml = "";
            var allSynopsisHtml = "";
            if (packageLength || isOtt) {
                subLength = "1590px";
            }
            if (data.vodDescription) {
                subObj = $.substringElLength(data.vodDescription, "28px", subLength);
                if (subObj.flag) {
                    moreBtnHtml = '<div id="moreBtn">更&nbsp;多</div>';
                    allSynopsisHtml = '<div id="allSynopsis"><div class="tip">"<span>返回</span>"键关闭当前浮层</div><div class="allSynopsisWrap"><div class="content">' + $.substringElLength(data.vodDescription, "28px", "6000px").last + "</div></div></div>";
                    isSubSynopsis = true;
                }
                synopsisHtml = '<div id="synopsis"><div class="content">' + subObj.last + moreBtnHtml + "</div></div>";
            }
            $("#detailInfo").html(videoNameHtml + baseInfoHtml + actorHtml + packageHtml + synopsisHtml + allSynopsisHtml);
            var videoNameMarquee = new $.Marquee();
            videoNameMarquee({
                el: $("#videoName")[0]
            });
            modules.twelve.createEl();
            modules.four.createEl();
            getFav();
        },
        error: function () {
            if (isHeader) {
                $.pTool.active("header");
            } else {
                $.pTool.active("vodDetail");
            }
        }
    });
    saveHisTimer = setTimeout(function () {
        stoptime = true;
    }, 6e4);
}

function getFav() {
    if (isOpenLoading) {
        $("#loading").show();
    }
    $.s.fav.query({
        mediaId: contentId
    }, {
        success: function (data) {
            if (data.data) {
                isFaved = true;
            }
            auth();
        },
        error: function () {
            auth();
        }
    });
}

function auth() {
    if (isHasAd) {
        $.auth.auth4Pkg({
            entrance: "",
            package: [{
                chargeId: '1100000241'
            }, {
                chargeId: '1100000761'
            }, {
                chargeId: '1100000381'
            }],
            callback: function (res) {
                res = res || {};
                $.UTIL.each(res, function (value, key) {
                    if (key && value) {
                        isHasAd = false;
                        return;
                    }
                });
                res = null;
                authCallback(1);
            }
        })
    } else {
        $.auth.auth({
            entrance: $.page.entrance,
            playData: {
                contentId: contentId,
                vodName: contentName,
                categoryId: categoryId,
                contentType: "0",
                vodSeriesflag: detailInfo.vodSeriesflag,
                vodPicMap: detailInfo.vodPicMap
            },
            package: detailInfo.jsVodChargesToCps,
            callback: authCallback,
            timeout: isOpenLoading ? 6e3 : 3e3,
        });
    }
}

// 广告
function getAd(cb) {
    $.getHelper("provider:ad").ad.getVideoAd({
        noAd: !isHasAd,
        categoryId: categoryId,
        contentId: contentId,
        contentName: contentName,
        callback: cb
    });
}

var showAdTime = function () {
    var $tip;
    return {
        show: function (time) {
            if (!$tip) {
                $tip = $('<div id="adTime"></div>').appendTo($videoWindow);
            }
            $tip.show().html(time + "S");
        },
        hide: function () {
            $tip && $tip.hide();
            $tip && $tip.html("");
        }
    };
}();

function packageSort(packages) {
    if (packages.length == 0) {
        return "";
    }
    var allPackage = $.getHelper("provider:charge").cache();
    var shieldList = {};
    for (var i = 0; i < allPackage.shieldList && allPackage.shieldList.length; i++) {
        shieldList[allPackage.shieldList[i]] = 1;
    }
    var isShield = false;
    var n = {};
    for (var i = 0; i < packages.length; i++) {
        if (packages[i].chargeId == "1100000021") {
            return "免费";
        }
        var obj = allPackage[packages[i].chargeId];
        if (shieldList[packages[i].chargeId]) {
            isShield = true;
            continue;
        }
        if (obj) {
            if (obj.pkgType == undefined || obj.pkgType == '') obj.pkgType = "D";
            if (!n[obj.pkgType]&&obj.chargesId!=="1100000261"&&obj.chargesId!=="1100000262"&&obj.chargesId!=="1100000382") {
                n[obj.pkgType] = [];
                n[obj.pkgType].push(obj.chargesName);
            }
        }
    }
    var m = [];
    for (var key in n) {
        if (key.indexOf("V") != -1) {
            m.push(key);
        }
    }
    var res = [];
    m = m.sort();
    for (var i = 0; i < m.length; i++) {
        res.push(n[m[i]]);
    }
    if (n.B) {
        res = n.B.concat(res);
    }
    if (n.D) {
        res = res.concat(n.D);
    }
    if (n.S) {
        res = res.concat(n.S);
    }
    if (n.X) {
        res = res.concat(n.X);
    }
    if (isShield && res.length == 0) {
        return "影视会员";
    }
    return res.join("、");
}

function getOrderEntryInfo(cmsId) {
    $orderEntry.show()
    detailCategoryId = cmsId
    $.s.guidance.get({
        id: cmsId
    }, {
        success: function (res) {
            // 配置展示的图片
            var orderEntryImg = "";
            if (res && res.length) {
                if (/img/.test(res[0].contentUri)) {
                    orderEntryImg = $.getPic(res[0].pics, [0]);
                    orderEntryUrl = res[1] ? res[1] : "";
                } else {
                    orderEntryImg = "";
                    orderEntryUrl = res[0];
                }
            }
            if (orderEntryImg && orderEntryUrl && $orderEntry) {
                canFocusOrder = true;
                $orderEntry.html('<img src="' + orderEntryImg + '">');
            } else {
                canFocusOrder = false;
                $orderEntry.html('<img src="images/orderDefault.png">');
            }
        },
        error: function () { }
    });
}

function printAlert() {
    $("#alert").show();
    $.pTool.add("alertInfo", {
        key: "alertInfo",
        keysMap: {
            KEY_LEFT: function () {
                $.focusTo({
                    el: "#alertL"
                });
                return true;
            },
            KEY_RIGHT: function () {
                $.focusTo({
                    el: "#alertR"
                });
                return true;
            },
            KEY_OK: function () {
                if ($("#alertL").hasClass("focusBorder")) {
                    $("#alert").hide();
                    getFav();
                } else if ($("#alertR").hasClass("focusBorder")) {
                    $.back();
                }
                return true;
            },
            KEY_RETURN: function () {
                return $.back();
            }
        },
        active: function () {
            $.focusTo({
                el: "#alertL"
            });
        },
        deactive: function () { }
    });
    $.pTool.active("alertInfo");
}

function unload() {
    playPrePic.stop();
    clearTimeout(showCueTimer);
    clearTimeout(playTimer);
    clearTimeout(saveHisTimer);
    clearTimeout(modules.actor.info.timer);
    windowPlay = function () { };
    try {
        saveData();
        if (vl) {
            if (isCanSaveHis && !isGotoFull && stoptime && vl.mp) {
                $.s.his.add({
                    mediaId: contentId,
                    leaveTime: vl.mp.getCurrentTime(),
                    categoryId: categoryId,
                    mediaType: 0,
                    totalTime: totalTime
                });
            }
            if (isPlayAd && isGotoFull && savePrePicInfo) {
                savePrePicInfo(picShowTime)
            }
            vl.save();
        }
    } catch (e) { }
    vl && vl.release(), vl = null;
}

function authCallback(result) {
    $("#alert").hide();
    $("#loading").hide();
    if (result == "timeOut" && isOpenLoading) {
        return printAlert();
    }
    isHasBuy = !!result;
    var div = '<div id="%s" class="%s">%s</div>';
    var fullScreenHtmlTxt = $.Tps(div, "fullScreen", "", isOtt ? "播放" : "全屏");
    var buyHtmlTxt = $.Tps(div, "buy", "", "订购");
    var favHtmlTxt = $.Tps(div, "fav", isFaved ? "faved" : "", isFaved ? "已收藏" : "收藏");
    if (isHasBuy) {
        $btnWrap.html($.Tps("%s%s", fullScreenHtmlTxt, favHtmlTxt));
        !isOtt && getOrderEntryInfo(orderSuccessId)
    } else {
        if (isOtt) {
            $btnWrap.html($.Tps("%s%s", buyHtmlTxt, favHtmlTxt));
        } else {
            $btnWrap.html($.Tps("%s%s%s", fullScreenHtmlTxt, buyHtmlTxt, favHtmlTxt))
            getOrderEntryInfo(orderErrorId)
        }
    }
    if (isHeader) {
        $.pTool.active("header");
    } else {
        if (pageInfo.btnIndex === "dft") {
            if (isHasBuy) {
                pageInfo.btnIndex = 0;
            } else {
                pageInfo.btnIndex = isOtt ? 0 : 1
            }
        }
        if (!isHasBuy && pageInfo.btnIndex === 2 || isHasBuy && pageInfo.btnIndex === 1) {
            pageInfo.btnIndex--;
        }
        $.pTool.active("vodDetail");
    }
    if (isOtt) return sendPageVs();
    if (parseInt(detailInfo.vodTimes) <= 30 && !isHasBuy) {
        isTryOver = true;
        $videoWindow.removeClass("noPlayer").addClass("over");
        $windowText.show().html("付费内容需要订购后才可观看");
        showCue();
        initVl();
        sendPageVs();
    } else {
        if (isGotoFull) {
            isGotoFull = false;
            windowPlay();
        } else {
            $.s.his.query({
                mediaId: contentId
            }, {
                success: function (data) {
                    if (data && data.data) {
                        playTime = data.data.leaveTime;
                    }
                    windowPlay();
                },
                error: function () {
                    windowPlay();
                }
            });
        }
    }
}

var showCueTimer = null;

function showCue() {
    clearTimeout(showCueTimer);
    if (isTryOver) {
        $windowCue.removeClass("full").addClass("buy").show();
    } else {
        $windowCue.removeClass("buy").addClass("full").show();
    }
    showCueTimer = setTimeout(function () {
        $windowCue.hide();
    }, 5e3);
}

function hideCue() {
    clearTimeout(showCueTimer);
    $windowCue.hide();
}

function canvasBg(reset) {
    var oC = $("#caBg")[0];
    var oGC = oC.getContext("2d");
    var oImg = $("#" + (isOtt ? 'bgImgOtt' : 'bgImg'))[0];
    clearTimeout(playTimer);
    oGC.clearRect(0, 0, 1920, 1080);
    oGC.drawImage(oImg, 0, 0);
    if (!reset) {
        playTimer = setTimeout(function () {
            firstPlay = false;
            vl && vl.show();
            intervalId && isPlayAd && playPrePic();
            oGC.clearRect(90, 136, 840, 471);
        }, firstPlay ? 0 : 500);
    } else {
        vl && vl.hide();
        intervalId && isPlayAd && playPrePic.stop();
    }
}

function tryParts() {
    if (!isHasBuy && parseInt(detailInfo.vodTimes) > 30) {
        $tryTime = $('<div id="tryTime"></div>');
        $tryTime.appendTo($("#videoWindow")).html("试看" + tryTime / 60 + "分钟");
    }
}

function initVl() {
    vl = $.playSizeList({
        list: [{
            contentId: contentId,
            name: contentName
        }],
        current: 0,
        playTime: playTime,
        endPoint: isHasBuy ? undefined : tryTime,
        multiVod: false,
        auto: isHasBuy,
        onBeforePlay: function (playPreAd, goon, preAd) {
            if (!isHasAd) {
                goon();
            } else {
                if (preAd) {
                    // preVideo.type === 'pic' ? goon() : playPreAd(preVideo);
                    // 以后支持图片打开注释代码即可
                    preAd.type === 'pic' ? playPrePic(preAd, playPreAd, goon) : playPreAd(preAd);
                } else {
                    if ($.isBack() && isFirstBefore && (vl.diy() && vl.diy().goonBack)) {
                        goon();
                    } else {
                       
                        getAd(function (data) {
                            // 目前只处理视频贴片，图片不处理
                            if(data && data.resourceid && !data.picPath){
                                playPreAd({
                                    contentId: data.resourceid
                                });
                            }else{
                                goon();
                            }
                            // 以后支持图片打开注释代码即可
                            // if (data && data.picPath && parseInt(data.duration) > 0) {
                            //     var obj = {
                            //         type: 'pic',
                            //         picShowTime: parseInt(data.duration),
                            //         picPath: $.getVariable("EPG:pathPic") + '/' + data.picPath,
                            //     }
                            //     playPrePic(obj, playPreAd, goon);
                            //     obj = null;
                            // } else if (data && data.resourceid) {
                            //     playPreAd({
                            //         type: 'video',
                            //         contentId: data.resourceid
                            //     });
                            // } else {
                            //     goon();
                            // }
                        });
                    }
                }
            }
            isFirstBefore = false;
        },
        loading: function (type, isPreVideo) {
            isCanSaveHis = false;
            if (type === "stream" && !isPreVideo) {
                vl.mp.once($.MP.state.loaded, function (param) {
                    totalTime = param.total;
                });
            }
        },
        onPlay: function (param, curInfo, isPreVideo) {
            if (isPreVideo) {
                isPlayAd = true;
                var isFirstTimeConut = true
                vl.mp.sub($.MP.state.progress, function (param) {
                    if (isPlayAd) {
                        if(param.total  - param.curr < param.total || isFirstTimeConut){
                            showAdTime.show(param.total - param.curr);
                            isFirstTimeConut = false;
                        }
                    }
                });
            } else {
                isCanSaveHis = true;
            }
            tryParts();
            $videoWindow.removeClass("noPlayer");
            if (moduleIndex !== 0) {
                vl.hide();
            } else {
                showCue();
            }
        },
        onEnd: function (current, info, isPreVideo) {
            if (isPreVideo) {
                isPlayAd = false;
                showAdTime.hide();
            } else {
                isTryOver = true;
                $videoWindow.addClass("over");
                $windowText.show().html("试看结束<br>请订购后观看全片");
                showCue();
                $tryTime.hide();
            }
        },
        onError: function (e) {
            sendPageVs();
            return true;
        },
        left: 90,
        top: 136,
        width: 840,
        height: 471
    }, categoryId, $.auth.getchargeSpIds(contentId), $.page.ztCategoryId, null, null, function () {
        return !isHasBuy;
    });
}

function windowPlay() {
    initVl();
    vl.play();
}

$.pTool.add("vodDetail", {
    key: "vodDetail",
    keysMap: {
        KEY_LEFT: function () {
            $.UTIL.apply(modules[modulesMap[moduleIndex]].left, null, modules[modulesMap[moduleIndex]]);
            return true;
        },
        KEY_RIGHT: function () {
            $.UTIL.apply(modules[modulesMap[moduleIndex]].right, null, modules[modulesMap[moduleIndex]]);
            return true;
        },
        KEY_UP: function () {
            if (!modules[modulesMap[moduleIndex]].up) {
                return true;
            }
            var opt = modules[modulesMap[moduleIndex]].up();
            if (opt && moduleIndex > 0) {
                moduleIndex--;
                modules[modulesMap[moduleIndex]].active(opt);
            }
            return true;
        },
        KEY_DOWN: function () {
            if (!modules[modulesMap[moduleIndex]].down) {
                return true;
            }
            var opt = modules[modulesMap[moduleIndex]].down();
            if (opt && moduleIndex < modulesMap.length - 1) {
                moduleIndex++;
                modules[modulesMap[moduleIndex]].active(opt);
            }

            return true;
        },
        KEY_OK: function () {
            $.UTIL.apply(modules[modulesMap[moduleIndex]].ok, null, modules[modulesMap[moduleIndex]]);
            return true;
        },
        KEY_RETURN: function () {
            return $.UTIL.apply(modules[modulesMap[moduleIndex]].return, null, modules[modulesMap[moduleIndex]]);
        },
        KEY_PAGEDOWN: function () {
            if (!modules[modulesMap[moduleIndex]].pageDown) {
                return true;
            }
            var opt = modules[modulesMap[moduleIndex]].pageDown();
            if (opt && moduleIndex < modulesMap.length - 1) {
                moduleIndex++;
                modules[modulesMap[moduleIndex]].active(opt);
            }
            return true;
        },
        KEY_PAGEUP: function () {
            if (!modules[modulesMap[moduleIndex]].pageUp) {
                return true;
            }
            var opt = modules[modulesMap[moduleIndex]].pageUp();
            if (opt && moduleIndex > 0) {
                moduleIndex--;
                modules[modulesMap[moduleIndex]].active(opt);
            }
            return true;
        }
    },
    active: function () {
        pageInfo.index = pageInfo.btnIndex;
        pageInfo.focusPosition = pageInfo.detailFp;
        modules[modulesMap[moduleIndex]].active(pageInfo);
    },
    deactive: function () {
        if (moduleIndex === 0) {
            pageInfo.btnIndex = modules[modulesMap[0]].info.index;
            pageInfo.detailFp = modules[modulesMap[0]].info.focusPosition;
        }
    },
    cover: function () {
        return true;
    },
    uncover: function () {
        return true;
    },
    getInfo: function () {
        var saveObj = {
            btnIndex: modules[modulesMap[0]].info.index,
            detailFp: modules[modulesMap[0]].info.focusPosition
        };
        return saveObj;
    }
});

function gotoAPK() {
    $.gotoDetail('{{pathPage}}/detailPage/apkTransfer/?type=vod&contentId=' + contentId + '&categoryId=' + categoryId);
}

var modules = {
    detail: {
        info: {
            index: 0,
            focusPosition: "btn",
            prePosition: "btn"
        },
        active: function (opt) {
            opt && typeof opt.index === "number" && (this.info.index = opt.index);
            opt && typeof opt.focusPosition === "string" && (this.info.focusPosition = opt.focusPosition);
            this.focusTo();
        },
        left: function () {
            if (this.info.focusPosition === "moreBtn") {
                this.info.focusPosition = "video";
                this.info.index = 0;
            } else if (this.info.focusPosition === "btn") {
                if (this.info.index <= 0) {
                    this.info.focusPosition = "video";
                    this.info.prePosition = "btn";
                } else {
                    this.info.index--;
                }
            } else if (this.info.focusPosition === "orderEntry") {
                this.info.focusPosition = "video";
                this.info.prePosition = "orderEntry";
                this.info.index = 0;
            }
            this.focusTo();
        },
        right: function () {
            if (this.info.focusPosition === "video") {
                hideCue();
                this.info.index = 0;
                if (this.info.prePosition === "orderEntry") {
                    this.info.focusPosition = "orderEntry";
                } else {
                    this.info.focusPosition = "btn";
                }
            } else if (this.info.focusPosition === "btn") {
                if (this.info.index >= $("#btnWrap div", "#btnWrap", true).length - 1) {
                    $(".focusBorder").addClass("public_shake");
                    return;
                }
                this.info.index++;
            } else if (this.info.focusPosition === "moreBtn") {
                $(".focusBorder").addClass("public_shake");
            }
            this.focusTo();
        },
        up: function () {
            if (this.info.focusPosition === "moreBtn") {
                $.pTool.active("header");
                return;
            } else if (this.info.focusPosition === "btn") {
                if (canFocusOrder) {
                    this.info.focusPosition = "orderEntry";
                } else if (isSubSynopsis) {
                    this.info.focusPosition = "moreBtn";
                } else {
                    $.pTool.active("header");
                    return;
                }
            } else if (this.info.focusPosition === "video") {
                hideCue();
                $.pTool.active("header");
                return;
            } else if (this.info.focusPosition === "orderEntry") {
                if (isSubSynopsis) {
                    this.info.focusPosition = "moreBtn";
                } else {
                    $.pTool.active("header");
                    return;
                }
            }
            this.focusTo();
        },
        down: function () {
            if (this.info.focusPosition === "moreBtn") {
                if (canFocusOrder) {
                    this.info.focusPosition = "orderEntry";
                } else {
                    this.info.focusPosition = "btn";
                }
            } else if (this.info.focusPosition === "btn") {
                !isOtt && canvasBg(true);
                return {
                    focusPosition: "up"
                };
            } else if (this.info.focusPosition === "video") {
                !isOtt && canvasBg(true);
                return {
                    focusPosition: "up"
                };
            } else if (this.info.focusPosition === "orderEntry") {
                this.info.focusPosition = "btn";
            }
            this.focusTo();
        },
        pageDown: function () {
            !isOtt && canvasBg(true);
            return true;
        },
        ok: function () {
            var favLock = false;
            if (this.info.focusPosition === "moreBtn") {
                this.info.focusPosition = "allSynopsis";
                this.focusTo();
            } else if (this.info.focusPosition === "btn") {
                if ($.activeObj.el === "#fullScreen") {
                    if (isOtt) {
                        gotoAPK();
                        return;
                    }
                    if (isTryOver) {
                        $.auth.forwardOrder();
                    } else {
                        isGotoFull = true;
                        vl && vl.enter({
                            contentId: contentId,
                            mediaType: isHasBuy ? 1 : 5,
                            isHasAd: isHasAd
                        });
                    }
                    return;
                }
                if ($.activeObj.el === "#fav") {
                    if (favLock) {
                        return true;
                    }
                    favLock = true;
                    if (isFaved) {
                        $.s.fav.remove({
                            mediaId: contentId
                        }, {
                            success: function (data) {
                                if (data.code === 0) {
                                    isFaved = false;
                                    $("#fav").removeClass("faved").html("收藏");
                                }
                                favLock = false;
                            },
                            error: function () {
                                favLock = false;
                            }
                        });
                    } else {
                        $.s.fav.add({
                            mediaId: contentId,
                            mediaType: "0",
                            categoryId: categoryId
                        }, {
                            success: function (data) {
                                if (data.code === 0) {
                                    isFaved = true;
                                    $("#fav").addClass("faved").html("已收藏");
                                }
                                favLock = false;
                            },
                            error: function () {
                                favLock = false;
                            }
                        });
                    }
                } else if ($.activeObj.el === "#buy") {
                    $.auth.forwardOrder();
                }
            } else if (this.info.focusPosition === "video") {
                if (isOtt) {
                    if (isHasBuy) {
                        gotoAPK()
                    } else {
                        $.auth.forwardOrder();
                    }
                    return;
                }
                if (isTryOver) {
                    $.auth.forwardOrder();
                } else {
                    isGotoFull = true;
                    vl && vl.enter({
                        contentId: contentId,
                        mediaType: isHasBuy ? 1 : 5,
                        isHasAd: isHasAd
                    });
                    return;
                }
            } else if (this.info.focusPosition === "orderEntry") {
                this.info.index = 0;
                orderEntryUrl.categoryId = detailCategoryId;
                $.gotoDetail(orderEntryUrl);
            }
        },
        return: function () {
            if (this.info.focusPosition === "allSynopsis") {
                this.info.focusPosition = "moreBtn";
                this.focusTo();
                return true;
            }
        },
        focusTo: function () {
            var $focusEl = null;
            if (this.info.focusPosition === "btn") {
                $focusEl = $btnWrap.find("div").item(this.info.index);
            } else if (this.info.focusPosition === "moreBtn") {
                $focusEl = $("#moreBtn");
            } else if (this.info.focusPosition === "video") {
                showCue();
                $focusEl = $("#videoWindow");
            } else if (this.info.focusPosition === "allSynopsis") {
                $focusEl = $("#allSynopsis");
            } else if (this.info.focusPosition === "orderEntry") {
                $focusEl = $("#orderEntry");
            }
            $.focusTo({
                el: $focusEl
            });
        }
    },
    actor: {
        info: {
            actorIndex: 0,
            actorCurrent: 0,
            focusPosition: "up",
            maxActorLength: 6,
            videoIndex: 0,
            videoFixed: 5,
            videoBegin: 0,
            videoLength: 0,
            timer: null,
            isUpF: false,
            isDownF: false,
            videoData: [],
            allData: {}
        },
        active: function (opt) {
            opt && typeof opt.actorIndex === "number" && (this.info.actorIndex = opt.actorIndex);
            opt && typeof opt.focusPosition === "string" && (this.info.focusPosition = opt.focusPosition);
            opt && typeof opt.videoIndex === "number" && (this.info.videoIndex = opt.videoIndex);
            opt && typeof opt.videoBegin === "number" && (this.info.videoBegin = opt.videoBegin);
            if (this.info.focusPosition === "up") {
                this.info.isUpF = true;
                this.info.isDownF = false;
            } else if (this.info.focusPosition === "down") {
                this.info.isUpF = false;
                this.info.isDownF = true;
            }
            if ($videoList.find(".videoList").length) {
                if (this.info.videoIndex > this.info.videoLength - 1) {
                    this.info.videoIndex = this.info.videoLength - 1;
                }
            } else {
                if (this.info.focusPosition === "down") {
                    this.info.focusPosition = "up";
                }
            }
            this.focusTo();
        },
        left: function () {
            if (this.info.focusPosition === "up") {
                if (this.info.actorIndex === 0) {
                    return;
                }
                this.info.actorIndex--;
                this.addCurrent();
                this.focusTo();
                this.autoCreateVideoList();
            } else if (this.info.focusPosition === "down") {
                if (this.info.videoIndex === 0) {
                    return;
                }
                if (this.info.videoIndex === this.info.videoBegin) {
                    this.info.videoBegin--;
                    this.moveList();
                }
                this.info.videoIndex--;
                this.focusTo();
            }
        },
        right: function () {
            if (this.info.focusPosition === "up") {
                if (this.info.actorIndex === actorArr.length - 1) {
                    return;
                }
                this.info.actorIndex++;
                this.addCurrent();
                this.focusTo();
                this.autoCreateVideoList();
            } else if (this.info.focusPosition === "down") {
                if (this.info.videoIndex === this.info.videoLength - 1) {
                    return;
                }
                if (this.info.videoIndex === this.info.videoBegin + this.info.videoFixed) {
                    this.info.videoBegin++;
                    this.moveList();
                }
                this.info.videoIndex++;
                this.focusTo();
            }
        },
        up: function () {
            if (this.info.focusPosition === "up") {
                this.info.isUpF = false;
                this.addCurrent();
                !isOtt && canvasBg();
                setTranslateY("", true);
                return true;
            } else if (this.info.focusPosition === "down") {
                this.info.isDownF = false;
                this.info.focusPosition = "up";
                this.focusTo();
            }
        },
        down: function () {
            if (this.info.focusPosition === "up") {
                if ($videoList.find(".videoList").length) {
                    this.info.focusPosition = "down";
                    this.info.isUpF = false;
                    this.addCurrent();
                    this.focusTo();
                } else {
                    this.info.isUpF = false;
                    this.addCurrent();
                    return {
                        index: this.info.actorIndex
                    };
                }
            } else if (this.info.focusPosition === "down") {
                this.info.isDownF = false;
                return {
                    index: this.info.videoIndex - this.info.videoBegin
                };
            }
        },
        ok: function () {
            if (this.info.focusPosition === "up") {
                clearTimeout(this.info.timer);
                this.createVideoList();
            } else if (this.info.focusPosition === "down") {
                if (this.info.videoData[this.info.videoIndex].docType === "vod") {
                    $.gotoDetail({
                        contentType: this.info.videoData[this.info.videoIndex].seriesFlag,
                        contentId: this.info.videoData[this.info.videoIndex].id,
                        categoryId: "999999"
                    }, true);
                }
            }
        },
        focusTo: function () {
            var $focusEl = null;
            var marqueeEl = null;
            if (this.info.focusPosition === "up") {
                $focusEl = $actorName.find(".actor").item(this.info.actorIndex);
                this.info.isUpF = true;
                if ($focusEl.hasClass("current")) {
                    this.removeCurrent(this.info.actorIndex);
                }
                marqueeEl = $focusEl;
            } else if (this.info.focusPosition === "down") {
                this.info.isDownF = true;
                $focusEl = $videoList.find(".videoList").item(this.info.videoIndex);
                marqueeEl = $focusEl.find(".videoName");
            }
            $.focusTo({
                el: $focusEl,
                marquee: [marqueeEl]
            });
            setTranslateY($focusEl);
        },
        createVideoList: function () {
            if (this.info.allData[this.info.actorIndex]) {
                successCb(this.info.actorIndex, this, this.info.allData[this.info.actorIndex]);
                return;
            }
            (function (actorIndex, This) {
                $.s.search.getByActor({
                    actor: actorArr[actorIndex],
                    seriesFlag: 0
                }, {
                    success: function (data) {
                        if (data.data && data.data.list && data.data.list.length) {
                            successCb(actorIndex, This, data.data.list);
                        }
                    },
                    error: function () { }
                });
            })(this.info.actorIndex, this);

            function successCb(actorIndex, This, dataList) {
                if (actorIndex !== This.info.actorIndex) {
                    return;
                }
                $videoList.html("");
                This.info.videoBegin = 0;
                This.info.videoIndex = 0;
                This.info.actorCurrent = actorIndex;
                if (This.info.isUpF) {
                    This.removeCurrent();
                } else {
                    This.addCurrent();
                }
                This.moveList();
                var htmlText = "";
                This.info.videoLength = dataList.length;
                This.info.allData[actorIndex] = dataList;
                This.info.videoData = This.info.allData[actorIndex];
                $.UTIL.each(dataList, function (value, index) {
                    var pics = $.getPic(value.pics, [102], {
                        picType: "type",
                        picPath: "uri"
                    });
                    var imgHtml = pics ? "<img src=" + pics + ">" : "";
                    htmlText += '<div class="videoList"><div class="image noPic">' + imgHtml + '</div><div class="videoName">' + value.name + "</div></div>";
                });
                $videoList.html(htmlText);
                if (This.info.isDownF) {
                    This.focusTo();
                }
            }
        },
        autoCreateVideoList: function () {
            clearTimeout(this.info.timer);
            this.info.timer = setTimeout(this.createVideoList.bind(this), 500);
        },
        createActor: function () {
            var actorHtml = "";
            $.UTIL.each(actorArr.slice(0, this.info.maxActorLength), function (value, index) {
                actorHtml += '<div class="actor">' + value + "</div>";
            });
            $actorName.html(actorHtml);
        },
        moveList: function () {
            $videoList.css({
                "-webkit-transform": "translateX(" + -295 * this.info.videoBegin + "px)"
            });
        },
        addCurrent: function () {
            this.removeCurrent();
            $actorName.find(".actor").item(this.info.actorCurrent).addClass("current");
        },
        removeCurrent: function (index) {
            if (index) {
                $(".actor", $actorName, true).item(index).removeClass("current");
            } else {
                $(".actor", $actorName, true).removeClass("current");
            }
        }
    },
    twelve: {
        info: {
            index: 0,
            col: 6,
            row: 2,
            data: {},
            maxLen: 12
        },
        active: function (opt) {
            opt && typeof opt.index === "number" && (this.info.index = opt.index);
            this.focusTo();
        },
        up: function () {
            if (Math.floor(this.info.index / this.info.col) == 0) {
                !isOtt && canvasBg();
                setTranslateY("", true);
                return true;
            } else {
                this.info.index -= this.info.col;
                this.focusTo();
            }
        },
        pageUp: function () {
            !isOtt && canvasBg();
            setTranslateY("", true);
            return {
                index: 0,
                focusPosition: "btn"
            };
        },
        down: function () {
            if (Math.floor(this.info.index / this.info.col) == this.info.row - 1) {
                return {
                    index: function (This) {
                        var index = 0;
                        if (This.info.index % This.info.col === 0 || This.info.index % This.info.col === 1) {
                            index = 0;
                        } else if (This.info.index % This.info.col === 2) {
                            index = 1;
                        } else if (This.info.index % This.info.col === 3 || This.info.index % This.info.col === 4) {
                            index = 2;
                        } else if (This.info.index % This.info.col === 5) {
                            index = 3;
                        }
                        return index;
                    }(this)
                };
            } else {
                this.info.index += this.info.col;
                this.focusTo();
            }
        },
        pageDown: function () {
            return {
                index: function (This) {
                    var index = 0;
                    if (This.info.index % This.info.col === 0 || This.info.index % This.info.col === 1) {
                        index = 0;
                    } else if (This.info.index % This.info.col === 2) {
                        index = 1;
                    } else if (This.info.index % This.info.col === 3 || This.info.index % This.info.col === 4) {
                        index = 2;
                    } else if (This.info.index % This.info.col === 5) {
                        index = 3;
                    }
                    return index;
                }(this)
            };
        },
        left: function () {
            if (this.info.index % this.info.col == 0) {
                $(".focusBorder").addClass("public_shake");
                return true;
            } else {
                this.info.index--;
                this.focusTo();
            }
        },
        right: function () {
            if (this.info.index % this.info.col == this.info.col - 1) {
                $(".focusBorder").addClass("public_shake");
                return true;
            } else {
                this.info.index++;
                this.focusTo();
            }
        },
        ok: function () {
            var obj = this.info.data.data[this.info.index];
            obj.categoryId = dataRecommend.twelve.categoryId;
            $.gotoDetail(obj, true);
        },
        createEl: function () {
            this.info.data = dataRecommend.twelve;
            $twelve.find(".title").html(this.info.data.title);
            var htmlText = "";
            $.UTIL.each(this.info.data.data, function (value, index) {
                var imgHtml = value.picContent ? "<img src=" + value.picContent + ">" : "";
                var episodeText = transEpisode(value);
                var episodeHtml = "";
                if (episodeText) {
                    episodeHtml = '<div class="episodeText">' + episodeText + "</div>";
                }
                htmlText += '<div class="sections"><div class="image noContent">' + imgHtml + '</div><div class="videoName">' + value.contentName + "</div>" + episodeHtml + "</div>";
            });
            if (this.info.maxLen > this.info.data.data.length) {
                for (var i = this.info.data.data.length; i < this.info.maxLen; i++) {
                    htmlText += '<div class="sections"><div class="image noContent">' + '' + '</div><div class="videoName">' + '' + "</div>" + '' + '' + "</div>";
                }

            }
            $twelve.find(".section").html(htmlText);
        },
        focusTo: function () {
            var $focusEl = $twelve.find(".sections").item(this.info.index);
            $.focusTo({
                el: $focusEl,
                marquee: [$focusEl.find(".videoName")]
            });
            setTranslateY($focusEl);
        }
    },
    four: {
        info: {
            index: 0,
            col: 4,
            data: {},
            maxLen: 4
        },
        active: function (opt) {
            opt && typeof opt.index === "number" && (this.info.index = opt.index);
            this.focusTo();
        },
        up: function () {
            if (Math.floor(this.info.index / this.info.col) == 0) {
                return {
                    index: function (This) {
                        var index = 0;
                        if (This.info.index === 0) {
                            index = modules.twelve.info.col;
                        } else if (This.info.index === 1) {
                            index = modules.twelve.info.col + 2;
                        } else if (This.info.index === 2) {
                            index = modules.twelve.info.col + 3;
                        } else if (This.info.index === 3) {
                            index = modules.twelve.info.col + 5;
                        }
                        return index;
                    }(this)
                };
            }
        },
        pageUp: function () {
            return {
                index: function (This) {
                    var index = 0;
                    if (This.info.index === 0) {
                        index = 0;
                    } else if (This.info.index === 1) {
                        index = modules.twelve.info.col - 4;
                    } else if (This.info.index === 2) {
                        index = modules.twelve.info.col - 3;
                    } else if (This.info.index === 3) {
                        index = modules.twelve.info.col - 1;
                    }
                    return index;
                }(this)
            };
        },
        down: function () {
            $(".focusBorder").addClass("public_shake");
        },
        left: function () {
            if (this.info.index % this.info.col == 0) {
                $(".focusBorder").addClass("public_shake");
                return true;
            } else {
                this.info.index--;
                this.focusTo();
            }
        },
        right: function () {
            if (this.info.index % this.info.col == this.info.col - 1) {
                $(".focusBorder").addClass("public_shake");
                return true;
            } else {
                this.info.index++;
                this.focusTo();
            }
        },
        ok: function () {
            var obj = this.info.data.data[this.info.index];
            obj.categoryId = dataRecommend.four.categoryId;
            $.gotoDetail(obj, true);
        },
        createEl: function () {
            this.info.data = dataRecommend.four;
            $four.find(".title").html(this.info.data.title);
            var htmlText = "";
            $.UTIL.each(this.info.data.data, function (value, index) {
                var imgHtml = value.picContent ? "<img src=" + value.picContent + ">" : "";
                var episodeText = transEpisode(value);
                var episodeHtml = "";
                if (episodeText) {
                    episodeHtml = '<div class="episodeText">' + episodeText + "</div>";
                }
                htmlText += '<div class="sections"><div class="image noContent">' + imgHtml + '</div><div class="videoName">' + value.contentName + "</div>" + episodeHtml + "</div>";
            });
            if (this.info.maxLen > this.info.data.data.length) {
                for (var i = this.info.data.data.length; i < this.info.maxLen; i++) {
                    htmlText += '<div class="sections"><div class="image noContent">' + '' + '</div><div class="videoName">' + '' + "</div>" + '' + '' + "</div>";
                }
            }
            $four.find(".section").html(htmlText);
        },
        focusTo: function () {
            var $focusEl = $four.find(".sections").item(this.info.index);
            $.focusTo({
                el: $focusEl,
                marquee: [$focusEl.find(".videoName")]
            });
            setTranslateY($focusEl);
        }
    }
};

function transEpisode(value) {
    var episodeText = "";
    var episodeArr = value.episodeStatus && /\//.test(value.episodeStatus) ? value.episodeStatus.split("/") : "";
    switch (+value.contentType) {
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
                    if (value.topicSceneLastOnlineTime) {
                        episodeText = "更新至" + value.topicSceneLastOnlineTime.slice(0, 8) + "期";
                    } else {
                        episodeText = "已更" + episodeArr[0] + "期";
                    }
                }
            }
            break;
    }
    return episodeText;
}

function setTranslateY(el, reset) {
    function getPositionTop() {
        var elTop = 0;
        var elem = $(el);
        var elHeight = "";
        var lastElemKey = "body";
        while (elem.length) {
            if (elem[0].id == lastElemKey) {
                break;
            }
            elTop += elem.offsetTop();
            elem = elem.offsetParent();
        }
        return -(elTop + elHeight);
    }
    var translateYElem = $wrap;
    var translateY = 0;
    if (!reset) {
        translateY = getPositionTop() + ($("body").clientHeight() - el.offsetHeight()) / 2;
        if (-translateY < 713) {
            translateY = -713;
        }
    }
    $(translateYElem).css({
        "-webkit-transform": "translateY(" + translateY + "px)"
    });
}

function saveData(activeNum) {
    if (moduleIndex === 0) {
        var vodDetailInfo = $.pTool.get("vodDetail").getInfo();
        var headerInfo = $.pTool.get("header").getInfo();
        var saveObj = {
            isGotoFull: isGotoFull
        };
        if (headerInfo.isActive) {
            saveObj.isHeader = headerInfo.isActive;
            saveObj.headerActiveKey = headerInfo.activeKey;
        } else {
            saveObj.btnIndex = vodDetailInfo.btnIndex;
            saveObj.detailFp = vodDetailInfo.detailFp;
        }
        $.savePageInfo(pageName, saveObj);
    }
}

function getPlayInfo() {
    return {
        type: "pull",
        code: "1",
        playVideoType: "2",
        mediaID: "" + (contentId || ""),
        mediaName: "" + (vl && vl.current().name || ""),
        contentId: "" + (contentId || ""),
        categoryID: "" + (categoryId || ""),
        currentPlayTime: "" + (!isPlayAd && (vl && vl.mp && vl.mp.getCurrentTime()) || "0"),
        totalTime: "" + (totalTime || "0"),
        isSeries: false
    };
}
// 贴片广告--图片
function playPrePic(obj, playPreAd, goon) {
    if (obj && obj.type === "pic") {
        picShowTime = obj.picShowTime;
        $("#videoBkg").css({
            background: "url(" + obj.picPath + ") 0 0 no-repeat",
            backgroundSize: '100% 100%'
        }).show();
        isPlayAd = true;
        savePrePicInfo = function (time) {
            time >= 0 && (obj.picShowTime = time);
            playPreAd(obj);
            obj = null;
        }
    }
    var timer = function () {
        if (picShowTime <= 0) {
            playPrePic.stop();
            showAdTime.hide();
            $("#videoBkg").hide();
            isPlayAd = false;
            goon();
            return;
        }
        showAdTime.show(picShowTime);
        --picShowTime;
        return timer
    };
    intervalId = setInterval(timer(), 1000);
}
playPrePic.stop = function () {
    intervalId && (clearInterval(intervalId), intervalId = null);
}