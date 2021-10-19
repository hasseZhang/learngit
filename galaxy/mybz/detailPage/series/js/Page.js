var pageName = "seriesDetail";

var RECODE_DATA_KEY = "seriesDetail";

$.vs.invented();

var contentId = $.page.contentId;

var contentName = "";

var categoryId = $.page.categoryId || '999999';

var detailInfo = {};

var actorArr = [];

var $btnWrap = null;

var $episode = null;

var $epNavi = null;

var $actorName = null;

var $arrow = null;

var $videoList = null;

var $twelve = null;

var $four = null;

var $windowCue = null;

var $windowText = null;

var $videoWindow = null;

var $tryTime = null;

var $wrap = null;

var modulesMap = ["detail", "select", "twelve", "four"];

var vl = null;

var isHasBuy = false;

var isSubSynopsis = false;

var isFaved = false;

var isTryOver = false;

var tryTime = 9;

var playTime = 0;

var firstPlay = true;

var playTimer = null;

var saveHisTimer = null;

var isCanSaveHis = false;

var playIndex = 0;

var stoptime = false;

var isFirstLoad = true;

var isFirstOnPlay = true;

var pageTranslateY = 0;

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
    error: function () {}
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

var pageInfo = $.initPageInfo(pageName, ["isGotoFull", "moduleIndex", "btnIndex", "detailFp", "isHeader", "headerActiveKey"], {
    isGotoFull: false,
    moduleIndex: 0,
    btnIndex: "dft",
    detailFp: "btn",
    isHeader: false,
    headerActiveKey: "search"
});

var isGotoFull = pageInfo.isGotoFull;

var isHeader = pageInfo.isHeader;

var headerActiveKey = pageInfo.headerActiveKey;

var moduleIndex = pageInfo.moduleIndex;

var totalTime = 0;

var saveSceneId = "";

var totalNum;

var isFirstBefore = true;

var isHasAd = false;

var picShowTime = null;

var savePrePicInfo = null;

var timer;


function leaveHeader() {
    $.pTool.active("seriesDetail");
}

function sendPageVs() {
    var page_name = isOtt ? pageName + '_YK' : pageName;
    $.recodeData(page_name, "access");
}

var dataRecommend = {};

function loadRecommend() {
    var recommendUrl = isOtt ? $.urls.dataRecommend2.replace('recommend2', 'recommendOtt/recommend2') : $.urls.dataRecommend2
    $.get(recommendUrl, {
        success: function (data) {
            dataRecommend = JSON.parse(data.replace(/\\(\;|\')/gm, "$1"));
        }
    }, false);
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
    $episode = $("#episode");
    $epNavi = $("#epNavi");
    $actorName = $("#actorName");
    $arrow = $("#select .arrow");
    $videoList = $("#videoList");
    $twelve = $("#twelve");
    $four = $("#four");
    $windowCue = $("#videoWindow .cue");
    $windowText = $("#videoWindow .text");
    $videoWindow = $("#videoWindow");
    $tryTime = $("#tryTime");
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
            $.UTIL.each(detailInfo.jsSerChargesToCps, function (value, index) {
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
            $.UTIL.each(detailInfo.sceneIdList, function (value, index) {
                value.contentId = value.sceneId;
                value.contentName = value.sceneNum;
                value.name = data.vodName + "第" + value.sceneNum + "集";
                value.contentType = "2";
            });
            var videoNameHtml = "";
            if (data.vodName) {
                contentName = data.vodName;
                videoNameHtml = '<div id="videoName">' + data.vodName + "</div>";
            }
            detailInfo.sceneIdList[0].seriesName = contentName;
            var baseInfoHtml = "";
            isHasAd = !(detailInfo.vipFlag === "1");
            if (data.vipFlag && data.vipFlag === "1") {
                baseInfoHtml += '<div style="border-right: 0;padding-right: 0;"><img class="vip" src="images/vip.png"></div>';
            }
            var onlineYear = data.onlineTimes && data.onlineTimes.substring(0, 4);
            if (onlineYear && onlineYear !== "1970") {
                baseInfoHtml += "<div>" + onlineYear + "</div>";
            }
            if (data.seriesTags && data.seriesTags.length) {
                baseInfoHtml += "<div>" + data.seriesTags.join("、") + "</div>";
            }
            if (baseInfoHtml) {
                baseInfoHtml = '<div id="baseInfo">' + baseInfoHtml + "</div>";
            }
            //var directorHtml = "";
            var actorHtml = "";
            var packageHtml = "";
            var packageLength = "";
            if (/暂无/.test(data.vodDirector) || /暂无/.test(data.vodActordis)) {
                var packageStr = packageSort(data.jsSerChargesToCps);
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
                $.pTool.active("seriesDetail");
            }
        }
    });
    saveHisTimer = setTimeout(function () {
        stoptime = true;
    }, 6e4);
}
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
    if(isHasAd){
        $.auth.auth4Pkg({
            entrance: "",
            package: [{ chargeId: '1100000241' }, { chargeId: '1100000761' }, { chargeId: '1100000381' }],
            callback: function (res) {
                res = res || {};
                $.UTIL.each(res, function (value, key) {
                    if (key && value) {
                        // 订购了
                        isHasAd = false;

                        return
                    }
                });
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
                contentType: "2",
                vodSeriesflag: detailInfo.vodSeriesflag,
                vodPicMap: detailInfo.vodPicMap
            },
            package: detailInfo.jsSerChargesToCps,
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


function unload() {
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
                    mediaType: 2,
                    sceneId: detailInfo.sceneIdList[playIndex].sceneId,
                    sceneInfo: playIndex + 1,
                    totalTime: totalTime
                });
            }
            if (isHasAd && isGotoFull && savePrePicInfo) {
                savePrePicInfo(picShowTime)
            }
            vl.save();
        }
    } catch (e) {}
    timer && timer.pause();
    vl && vl.release(), vl = null;
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

function getOrderEntryInfo(cmsId) {
    detailCategoryId = cmsId;
    $.s.guidance.get({
        id: cmsId
    }, {
        success: function (res) {
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
    if (!isOtt) {
        modules.select.createEpisode();
        modules.select.createEpNavi();
    }

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
                pageInfo.btnIndex = 0
            } else {
                pageInfo.btnIndex = isOtt ? 0 : 1
            }
        }
        if (!isHasBuy && pageInfo.btnIndex === 2 || isHasBuy && pageInfo.btnIndex === 1) {
            pageInfo.btnIndex--;
        }
        if ((moduleIndex === 0 && isFirstLoad) || (moduleIndex === 1 && isFirstLoad)) {
            isFirstLoad = false;
            $.pTool.active("seriesDetail");
        }
    }
    if (isOtt) {
        $.s.his.query({
            mediaId: contentId
        }, {
            success: function (data) {
                if (data && data.data) {
                    playIndex = data.data.sceneInfo - 1;
                }
                modules.select.createEpisode();
                modules.select.createEpNavi();
                modules.select.upCurrent();
            },
            error: function () {
                modules.select.createEpisode();
                modules.select.createEpNavi();
                modules.select.upCurrent();
            }
        });
        sendPageVs();
        return;
    }
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
                    saveSceneId = data.data.sceneId;
                }
                windowPlay();
            },
            error: function () {
                windowPlay();
            }
        });
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
    var oImg = $("#bgImg")[0];
    clearTimeout(playTimer);
    oGC.width = 1920;
    oGC.height = 1080;
    oGC.clearRect(0, 0, 1920, 1080);
    oGC.drawImage(oImg, 0, 0);
    if (!reset) {
        playTimer = setTimeout(function () {
            firstPlay = false;
            vl && vl.show();
            oGC.clearRect(90, 136, 840, 471);
        }, firstPlay ? 0 : 500);
    } else {
        vl && vl.hide();
    }
}

function tryParts() {
    if (!isHasBuy) {
        $tryTime.show().html("正在试看第" + (playIndex + 1) + "集");
    }
}

function windowPlay() {
    var saveIndex = 0;
    $.UTIL.each(detailInfo.sceneIdList, function (value, index) {
        if (value.contentId == saveSceneId) {
            saveIndex = index;
            return true;
        }
    });
    vl = $.playSizeList({
        list: detailInfo.sceneIdList,
        current: saveIndex,
        playTime: playTime,
        endPoint: undefined,
        multiVod: false,
        auto: isHasBuy,
        onBeforePlay: function(playPreVideo, goon, preVideo) {
            if (!isHasAd) {
                goon();
            } else {
                if (preVideo) {
                    preVideo.type === 'pic' ? goon() : playPreVideo(preVideo);
                    // 以后支持图片打开注释代码即可
                    // preVideo.type === 'pic' ? playPrePic(preVideo,playPreVideo,goon) : playPreVideo(preVideo);
                } else {
                    if (($.isBack() && isFirstBefore && (vl.diy() && vl.diy().goonBack))) {
                        goon();
                    } else {
                        getAd(function(data) {
                            // 目前只处理视频贴片，图片不处理
                            if(data && data.resourceid && !data.picPath){
                                playPreVideo({
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
                            //     playPrePic(obj,playPreVideo, goon);
                            // } else if(data && data.resourceid && !data.picPath){
                            //     playPreVideo({
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
            $videoWindow.addClass("noPlayer");
        },
        onPlay: function (param, curInfo, isPreVideo) {
            $.initVolume(vl.mp);
            $videoWindow.removeClass("noPlayer");
            if (isPreVideo) {
                isPlayAd = true;
                var isFirstTimeConut = true
                vl.mp.sub($.MP.state.progress, function(param) {
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
            isCanSaveHis = true;
            tryParts();
            if (isFirstLoad && moduleIndex === 1) {
                isFirstLoad = false;
                $.pTool.active("seriesDetail");
            }
            if (isFirstOnPlay) {
                isFirstOnPlay = false;
            } else {
                playIndex = vl.currentIndex();
                modules.select.upCurrent();
            }
            if (moduleIndex !== 0 && moduleIndex !== 1) {
                vl.hide();
            } else {
                showCue();
            }
        },
        onEnd: function (current, info, isPreVideo) {
            if (isPreVideo) {
                showAdTime.hide();
                isPlayAd = false;
            } else {
                isTryOver = true;
                $videoWindow.addClass("over");
                $windowText.show().html("付费内容需要订购后才可观看");
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
    playIndex = vl.currentIndex();
    if (!isHasBuy && playIndex > 1) {
        playIndex = 0;
        vl.seek({
            val: playIndex
        });
    }
    modules.select.upCurrent();
    vl.play();
}

$.pTool.add("seriesDetail", {
    key: "seriesDetail",
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
            moduleIndex = moduleIndex == 0 ? 1 : moduleIndex;
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
        if (moduleIndex === 0) {
            pageInfo.index = pageInfo.btnIndex;
            pageInfo.focusPosition = pageInfo.detailFp;
        }
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
        $.UTIL.apply(modules[modulesMap[moduleIndex]].uncover, null, modules[modulesMap[moduleIndex]]);
        return true;
    },
    getInfo: function () {
        var saveObj = {
            btnIndex: modules[modulesMap[0]].info.index,
            detailFp: modules[modulesMap[0]].info.focusPosition
        };
        return saveObj;
    },
    c_playOne: function (index) {
        if (pageTranslateY < 0) {
            return false;
        } else {
            var playIndex = 0;
            totalNum = +detailInfo.sceneIdList.length;
            index = +index;
            if (index >= 0) {
                playIndex = index - 1;
            } else if (index < 0) {
                playIndex = totalNum + index;
            }
            if (playIndex > totalNum - 1 || playIndex < 0) {
                return false;
            }
            playOrOrder(playIndex);
            return true;
        }
    }
});

function playOrOrder(willPlayIndex) {
    if (isTryOver && playIndex === willPlayIndex || !isHasBuy && willPlayIndex > 1) {
        gotoOrder(willPlayIndex);
    } else {
        isGotoFull = true;
        var enterObj = {
            seriesId: contentId,
            categoryId: categoryId,
            mediaType: isHasBuy ? 1 : 5,
            isHasAd: isHasAd
        };
        if (playIndex !== willPlayIndex) {
            enterObj.contentId = detailInfo.sceneIdList[willPlayIndex].contentId;
            enterObj.current = willPlayIndex;
            enterObj.playFromStart = true;
        }
        vl && vl.enter(enterObj);
    }
}
// 跳转酷喵apk
function gotoAPK(willPlayIndex) {
    $.gotoDetail('{{pathPage}}/detailPage/apkTransfer/?type=series&playIndex=' + willPlayIndex + '&contentId=' + contentId + '&categoryId=' + categoryId);
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
                if (this.info.prePosition === "orderEntry") {
                    this.info.focusPosition = "orderEntry";
                } else {
                    this.info.focusPosition = "btn";
                }
                this.info.index = 0;
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
                return {
                    focusPosition: "up"
                };
            } else if (this.info.focusPosition === "video") {
                return {
                    focusPosition: "up"
                };
            } else if (this.info.focusPosition === "orderEntry") {
                this.info.focusPosition = "btn";
            }
            this.focusTo();
        },
        ok: function () {
            var favLock = false;
            if (this.info.focusPosition === "moreBtn") {
                this.info.focusPosition = "allSynopsis";
                this.focusTo();
            } else if (this.info.focusPosition === "btn") {
                if ($.activeObj.el === "#fullScreen") {
                    if (isOtt) {
                        gotoAPK(playIndex)
                        return;
                    }
                    if (isTryOver) {
                        gotoOrder(playIndex)
                    } else {
                        isGotoFull = true;
                        vl && vl.enter({
                            seriesId: contentId,
                            categoryId: categoryId,
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
                            mediaType: "2",
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
                    gotoOrder(playIndex);
                }
            } else if (this.info.focusPosition === "video") {
                if (isOtt) {
                    if (isHasBuy) {
                        gotoAPK(playIndex)
                    } else {
                        gotoOrder(playIndex)
                    }
                    return;
                }
                if (isTryOver) {
                    gotoOrder(playIndex);
                } else {
                    isGotoFull = true;
                    vl && vl.enter({
                        seriesId: contentId,
                        categoryId: categoryId,
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
    select: {
        info: {
            episodeIndex: 0,
            episodeCurPre: 0,
            episodeCur: 0,
            episodeFixed: 14,
            episodeBegin: 0,
            focusPosition: "up",
            isNotFromVol: true,
            epNaviIndex: 0,
            epNaviCurPre: 0,
            epNaviCur: 0,
            epNaviFixed: 6,
            epNaviBegin: 0,
            epNaviSpace: 15
        },
        active: function (opt) {
            if (this.info.isNotFromVol && this.info.focusPosition === "up") {
                if (this.info.episodeCur >= this.info.episodeBegin && this.info.episodeCur < this.info.episodeBegin + this.info.epNaviSpace) {
                    this.info.episodeIndex = this.info.episodeCur;
                } else {
                    this.info.episodeIndex = this.info.episodeBegin;
                }
            }
            this.info.isNotFromVol = true;
            this.focusTo();
        },
        uncover: function () {
            this.info.isNotFromVol = false;
        },
        left: function () {
            if (this.info.focusPosition === "up") {
                if (this.info.episodeIndex === 0) {
                    $(".focusBorder").addClass("public_shake");
                    return;
                }
                if (this.info.episodeIndex === this.info.episodeBegin) {
                    this.info.episodeBegin -= this.info.epNaviSpace;
                    this.moveEpisode();
                    this.info.epNaviBegin--;
                    if (this.info.epNaviBegin < 0) {
                        this.info.epNaviBegin = 0;
                    }
                    this.moveEpNavi();
                }
                this.info.episodeIndex--;
                this.focusTo();
                this.addEpisodeCur();
                this.info.epNaviCur = this.info.episodeBegin / this.info.epNaviSpace;
                this.addEpNaviCur();
            } else if (this.info.focusPosition === "down") {
                if (this.info.epNaviIndex === 0) {
                    $(".focusBorder").addClass("public_shake");
                    return;
                }
                if (this.info.epNaviIndex === this.info.epNaviBegin) {
                    this.info.epNaviBegin--;
                    this.moveEpNavi();
                }
                this.info.epNaviIndex--;
                this.info.episodeBegin = this.info.epNaviIndex * this.info.epNaviSpace;
                this.moveEpisode();
                this.focusTo();
            }
        },
        right: function () {
            if (this.info.focusPosition === "up") {
                if (this.info.episodeIndex === detailInfo.sceneIdList.length - 1) {
                    $(".focusBorder").addClass("public_shake");
                    return;
                }
                if (this.info.episodeIndex === this.info.episodeBegin + this.info.episodeFixed) {
                    this.info.episodeBegin += this.info.epNaviSpace;
                    this.moveEpisode();
                    if (Math.ceil(detailInfo.sceneIdList.length / this.info.epNaviSpace) > this.info.epNaviFixed + 1) {
                        this.info.epNaviBegin++;
                        if (this.info.epNaviBegin > Math.ceil(detailInfo.sceneIdList.length / this.info.epNaviSpace) - this.info.epNaviFixed - 1) {
                            this.info.epNaviBegin = Math.ceil(detailInfo.sceneIdList.length / this.info.epNaviSpace) - this.info.epNaviFixed - 1;
                        }
                        this.moveEpNavi();
                    }
                }
                this.info.episodeIndex++;
                this.focusTo();
                this.addEpisodeCur();
                this.info.epNaviCur = this.info.episodeBegin / this.info.epNaviSpace;
                this.addEpNaviCur();
            } else if (this.info.focusPosition === "down") {
                if (this.info.epNaviIndex === Math.ceil(detailInfo.sceneIdList.length / this.info.epNaviSpace) - 1) {
                    $(".focusBorder").addClass("public_shake");
                    return;
                }
                if (this.info.epNaviIndex === this.info.epNaviBegin + this.info.epNaviFixed) {
                    this.info.epNaviBegin++;
                    this.moveEpNavi();
                }
                this.info.epNaviIndex++;
                this.info.episodeBegin = this.info.epNaviIndex * this.info.epNaviSpace;
                this.moveEpisode();
                this.focusTo();
            }
        },
        up: function () {
            if (this.info.focusPosition === "up") {
                this.addEpisodeCur(true);
                return true;
            } else if (this.info.focusPosition === "down") {
                this.info.focusPosition = "up";
                if (this.info.episodeCur >= this.info.episodeBegin && this.info.episodeCur < this.info.episodeBegin + this.info.epNaviSpace) {
                    this.info.episodeIndex = this.info.episodeCur;
                } else {
                    this.info.episodeIndex = this.info.episodeBegin;
                }
                this.focusTo();
                this.info.epNaviCur = this.info.episodeBegin / this.info.epNaviSpace;
                this.addEpNaviCur();
            }
        },
        down: function () {
            if (this.info.focusPosition === "up") {
                this.info.focusPosition = "down";
                this.info.epNaviIndex = this.info.epNaviCur;
                this.addEpisodeCur(true);
                this.focusTo();
            } else if (this.info.focusPosition === "down") {
                !isOtt && canvasBg(true);
                !isOtt && timer && timer.pause();
                return true;
            }
        },
        pageDown: function () {
            !isOtt && canvasBg(true);
            !isOtt && timer && timer.pause();
            return true;
        },
        ok: function () {
            if (this.info.focusPosition === "down") {
                return;
            }
            if (isOtt) {
                if (isHasBuy) {
                    gotoAPK(this.info.episodeIndex)
                } else {
                    gotoOrder(playIndex)
                }
                return;
            }
            playOrOrder(this.info.episodeIndex);
        },
        focusTo: function () {
            var $focusEl = null;
            if (this.info.focusPosition === "up") {
                $focusEl = $episode.find(".episode").item(this.info.episodeIndex);
            } else if (this.info.focusPosition === "down") {
                $focusEl = $epNavi.find(".epNavi").item(this.info.epNaviIndex);
            }
            if ($focusEl) {
                if ($focusEl.hasClass("current")) {
                    $focusEl.removeClass("current");
                }
                $.focusTo({
                    el: $focusEl
                });
            }
        },
        createEpisode: function () {
            var episodeHtml = "";
            $.UTIL.each(detailInfo.sceneIdList, function (value, index) {
                episodeHtml += '<div class="episode ' + (!isHasBuy && !(index > 1) && !isOtt ? "freeCorner" : detailInfo.sceneIdList.length>2&&value.sceneLatestStatus=="1"?"newCorner":"") + '">' + value.sceneNum + "</div>";
            });
            $episode.html(episodeHtml);
        },
        createEpNavi: function () {
            var epNaviHtml = "";
            var epNaviContent = "";
            var This = this;
            var newTag = false;
            $.UTIL.each(detailInfo.sceneIdList, function (value, index) {
                if (value.sceneNum % This.info.epNaviSpace === 1) {
                    epNaviContent += "" + value.sceneNum;
                    if (index === detailInfo.sceneIdList.length - 1) {
                        epNaviHtml += '<div class="epNavi '+ ((detailInfo.sceneIdList.length>2&&value.sceneLatestStatus=="1")?"newCorner":"")+'">' + epNaviContent + '</div>';
                    }
                } else if (value.sceneNum % This.info.epNaviSpace === 0 || index === detailInfo.sceneIdList.length - 1) {
                    epNaviContent += "-" + value.sceneNum;
                    newTag = false;
                    for(var q=Number(epNaviContent.split("-")[0])-1;q<value.sceneNum;q++){                        
                        if(detailInfo.sceneIdList[q]&&detailInfo.sceneIdList[q].sceneLatestStatus&&detailInfo.sceneIdList[q].sceneLatestStatus=="1"){
                            newTag = true;
                        }
                    }
                    if(!!epNaviContent&&detailInfo.sceneIdList.length>2&&newTag){
                        epNaviHtml += '<div class="epNavi newCorner">' + epNaviContent + '</div>';
                        epNaviContent = "";
                    }else{
                        epNaviHtml += '<div class="epNavi">' + epNaviContent + '</div>';
                        epNaviContent = "";
                    }
                                    
                }
            });
            $epNavi.html(epNaviHtml);
        },
        moveEpisode: function () {
            if (this.info.episodeBegin + this.info.epNaviSpace < detailInfo.sceneIdList.length) {
                $arrow.show();
            } else {
                $arrow.hide();
            }
            $episode.css({
                "-webkit-transform": "translateX(" + -114 * this.info.episodeBegin + "px)"
            });
        },
        moveEpNavi: function () {
            $epNavi.css({
                "-webkit-transform": "translateX(" + -228 * this.info.epNaviBegin + "px)"
            });
        },
        addEpisodeCur: function (noConflict) {
            $episode.find(".episode").item(this.info.episodeCurPre).removeClass("current");
            if (noConflict || !$episode.find(".episode").item(this.info.episodeCur).hasClass("focusBorder")) {
                $episode.find(".episode").item(this.info.episodeCur).addClass("current");
            }
            this.info.episodeCurPre = this.info.episodeCur;
        },
        rmEpisodeCur: function () {
            $(".episode", $episode, true).item(this.info.episodeCur).removeClass("current");
        },
        addEpNaviCur: function (noConflict) {
            $epNavi.find(".epNavi").item(this.info.epNaviCurPre).removeClass("current");
            if (noConflict || !$epNavi.find(".epNavi").item(this.info.epNaviCur).hasClass("focusBorder")) {
                $epNavi.find(".epNavi").item(this.info.epNaviCur).addClass("current");
            }
            this.info.epNaviCurPre = this.info.epNaviCur;
        },
        rmEpNaviCur: function (index) {
            $(".epNavi", $epNavi, true).item(this.info.epNaviCur).removeClass("current");
        },
        upCurrent: function () {
            this.info.episodeCur = playIndex;
            this.info.epNaviCur = Math.floor(this.info.episodeCur / this.info.epNaviSpace);
            this.addEpisodeCur();
            this.addEpNaviCur();
            if (moduleIndex === 1) {
                if (this.info.focusPosition === "up") {
                    this.info.episodeIndex = this.info.episodeCur;
                } else if (this.info.focusPosition === "down") {
                    this.info.epNaviIndex = this.info.epNaviCur;
                }
                this.focusTo();
            }
            this.info.episodeBegin = this.info.epNaviCur * this.info.epNaviSpace;
            this.info.epNaviBegin = Math.max(this.info.epNaviCur - this.info.epNaviFixed, 0);
            this.moveEpisode();
            this.moveEpNavi();
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
                !isOtt && timer && timer.resume(picShowTime);
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
                !isOtt && timer && timer.resume(picShowTime);
                setTranslateY("", true);
                return {
                    focusPosition: "down",
                    videoIndex: modules.actor.info.videoBegin + this.info.index
                };
            } else {
                this.info.index -= this.info.col;
                this.focusTo();
            }
        },
        pageUp: function () {
            !isOtt && canvasBg();
            !isOtt && timer && timer.resume(picShowTime);
            setTranslateY("", true);
            moduleIndex--;
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
                htmlText += '<div class="sections"><div class="image noContent">' + imgHtml + '</div><div class="videoName">' + (value.contentName || '') + "</div>" + episodeHtml + "</div>";
            });
            if (this.info.maxLen > this.info.data.data.length) {
                for (var i = this.info.data.data.length; i < this.info.maxLen; i++) {
                    htmlText += "<div class='sections'><div class='image noContent'></div><div class='videoName'></div></div>";
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
                htmlText += '<div class="sections"><div class="image noContent">' + imgHtml + '</div><div class="videoName">' + (value.contentName || '') + "</div>" + episodeHtml + "</div>";
            })
            if (this.info.maxLen > this.info.data.data.length) {
                for (var i = this.info.data.data.length; i < this.info.maxLen; i++) {
                    htmlText += "<div class='sections'><div class='image noContent'></div><div class='videoName'></div></div>";
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
        if (-translateY < 986) {
            translateY = -986;
        }
    }
    $(translateYElem).css({
        "-webkit-transform": "translateY(" + translateY + "px)"
    });
    pageTranslateY = translateY;
}

function saveData(activeNum) {
    if (moduleIndex === 0) {
        var seriesDetailInfo = $.pTool.get("seriesDetail").getInfo();
        var headerInfo = $.pTool.get("header").getInfo();
        var saveObj = {
            isGotoFull: isGotoFull
        };
        if (headerInfo.isActive) {
            saveObj.isHeader = headerInfo.isActive;
            saveObj.headerActiveKey = headerInfo.activeKey;
        } else {
            saveObj.btnIndex = seriesDetailInfo.btnIndex;
            saveObj.detailFp = seriesDetailInfo.detailFp;
        }
        $.savePageInfo(pageName, saveObj);
    } else if (moduleIndex === 1) {
        $.savePageInfo(pageName, {
            moduleIndex: 1,
            isGotoFull: isGotoFull
        });
    }
}

function gotoOrder(index) {
    if (vl) {
        var nowTime = 0;
        if (index === playIndex && vl.mp) {
            nowTime = vl.mp.getCurrentTime();
        }
        vl.seek({
            val: index,
            playTime: nowTime
        }).save();
    }
    $.auth.forwardOrder();
}

// 贴片广告--图片
function playPrePic(obj, playPreVideo, goon) {
    isPlayAd = true;
    var url;
    if (obj && obj.type === 'pic') {
        picShowTime = obj.picShowTime;
        url = obj.picPath;
        savePrePicInfo = function (time) {
            time >= 0 && (obj.picShowTime = time)
            playPreVideo(obj)
        }
    }
    timer = new Timer(url, goon);
    timer.resume(picShowTime);
}

function Timer(url, goon) {
    var url = url;
    var goon = goon;
    var intervalId = null;
    return {
        resume: function (remainTime) {
            picShowTime = remainTime;
            if (picShowTime > 0) {
                url && $("#videoBkg").css({
                    background: "url(" + url + ") 0 0 no-repeat",
                    backgroundSize: '100% 100%'
                }).show();
            }
            intervalId = setInterval(function () {
                if (picShowTime <= 0) {
                    clearInterval(intervalId);
                    showAdTime.hide();
                    $("#videoBkg").hide();
                    isPlayAd = false;
                    savePrePicInfo(picShowTime);
                    goon();
                    return;
                }
                showAdTime.show(picShowTime)
                --picShowTime;
            }, 1000);
        },
        // 暂停方法
        pause: function () {
            intervalId && clearInterval(intervalId);
        },
        intervalId: intervalId
    }
}

var showAdTime = function () {
    var $tip;
    return {
        show: function (time) {
            if (!$tip) {
                $tip = $('<div id="adTime"></div>').appendTo($("#videoWindow"));
            }
            $tip.show().html(time + "S");
        },
        hide: function () {
            $tip && $tip.hide();
            $tip && $tip.html("");
        }
    };
}();

function getPlayInfo() {
    var nowInfo = vl && vl.current();
    return {
        type: "pull",
        code: "1",
        playVideoType: "2",
        mediaID: "" + (nowInfo && nowInfo.contentId || ""),
        mediaName: "" + (nowInfo && nowInfo.name || ""),
        categoryID: "" + (categoryId || ""),
        currentPlayTime: "" + (!isPlayAd && (vl && vl.mp && vl.mp.getCurrentTime()) || "0"),
        totalTime: "" + (totalTime || "0"),
        isSeries: true,
        seriesID: "" + (contentId || ""),
        seriesName: "" + (contentName || ""),
        currentSeriesNum: "" + (nowInfo && nowInfo.sceneNum || ""),
        seriesTotalNum: "" + totalNum
    };
}