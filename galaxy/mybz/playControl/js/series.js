$.addBackUrlRedefine(function() {});

$.playVideoRedefine(true);

$.playLiveOrRecRedefine(true);

var addPointsTime = 30 * 60 * 1e3;

setTimeout(function () {
  USER_SERVCICE.addPoints({
    pointtype: "102"
  }, {});
}, addPointsTime);

var page = {
    categoryId: $.page.categoryId,
    current: $.page.current,
    contentId: $.page.contentId,
    seriesId: $.page.seriesId,
    seriesName: $.page.seriesName,
    isTry: $.page.mediaType === "5" ? true : false,
    ztCategoryId: $.page.ztCategoryId
};

var isCanSaveHis = false;

var vl = null;

var playIndex = 0;

var listData = [];

var isShowHisCue = false;

var isFirstLoad = true;

var totalTime = 0;

var freeTotal = 2;

var isOnEnd = false;

var intervalId = null;

var picShowTime = null;

var isPlayAd = false;

var isHasAd = $.page.isHasAd;

var isFirstBefore = true;

var savePrePicInfo = null;

function getAd(cb) {
    $.getHelper("provider:ad").ad.getVideoAd({
        noAd: !isHasAd,
        categoryId: page.categoryId,
        contentId: page.seriesId,
        contentName: listData[0] && listData[0].seriesName,
        callback: cb
    });
}

function load() {
    vl = $.createVideoList({
        list: [],
        current: 0,
        loop: false,
        auto: true,
        multiVod: false,
        auto: !page.isTry,
        recovery: true,
        endPoint: undefined,
        onBeforePlay: function(playPreVideo, goon, preVideo) {
            $.pTool.get("progress").hidePauseTip();
            if (!isHasAd) {
                goon();
            } else {
                if (preVideo) {
                    preVideo.type === 'pic' ? goon() : playPreVideo(preVideo);
                    // 以后支持图片打开注释代码即可
                    // preVideo.type === 'pic' ? playPrePic(preVideo,playPreVideo,goon): playPreVideo(preVideo);
                } else {
                    if ((isFirstBefore && !$.page.playFromStart)) {
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
                            //     selectCue.hide();
                            //     var obj = {
                            //         type: 'pic',
                            //         picShowTime: parseInt(data.duration),
                            //         picPath: $.getVariable("EPG:pathPic") + '/' + data.picPath,
                            //     }
                            //     playPrePic(obj,playPreVideo, goon);
                            // } else if(data && data.resourceid && !data.picPath){
                            //     selectCue.hide();
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
        loading: function(type,isPreVideo) {
            isCanSaveHis = false;
            if (type === "stream") {
                $.initVolume(vl.mp);
                playIndex = vl.currentIndex();
                if(isPreVideo){
                    isPlayAd = true;
                    EndTipPanel.hide();
                }else{
                    $.pTool.get("progress").setInfo({
                        videoName: listData[0].seriesName + "第" + listData[playIndex].sceneNum + "集",
                        isTry: false,
                        hisCueIsShow: hisCue.getIsShow,
                        // isPlayAd:isPlayAd
                    });
                    $.pTool.get("seriesList").initPlayer(vl);
                    $.pTool.get("seriesList").setInfo({
                        totalNum: listData.length,
                        playing: playIndex + 1,
                        vipFlag: page.isTry,
                        // isPlayAd:isPlayAd
                    });
                    vl.mp.sub($.MP.state.progress, function(param) {
                        if ($.pTool.get("p_trySee") && $.pTool.get("p_trySee").getInfo().isShow) {
                            return;
                        }
                        var total = param.total;
                        if (total && total - param.curr <= 5) {
                            EndTipPanel.show(total - param.curr);
                            hisCue.hide();
                            selectCue.hide();
                        } else {
                            EndTipPanel.hide();
                        }
                    });
                    vl.mp.once($.MP.state.loaded, function(param) {
                        totalTime = param.total;
                        $.vs.serialPlay(listData[playIndex].contentId, totalTime, (page.isTry ? "TRY-" : "") + listData[0].seriesName + "第" + listData[playIndex].sceneNum + "集", page.categoryId, listData[playIndex].sceneNum, $.auth.getchargeSpIds(page.seriesId), page.ztCategoryId);
                        if ($.pTool.get("p_trySee") && $.pTool.get("p_trySee").getInfo().isShow) {
                            return;
                        }
                        if (isShowHisCue) {
                            hisCue.show(param.curr);
                        }
                    });
                }
                $.pTool.get("progress").init(vl.mp);
            }
            // console.log("loading type is ", type);
        },
        onPlay: function(param, curInfo, isPreVideo) {
            if (isPreVideo) {
                isPlayAd = true
                var isFirstTimeConut = true
                vl.mp.sub($.MP.state.progress, function(param) {
                    if (isPlayAd) {
                            if(param.total  - param.curr < param.total || isFirstTimeConut){
                                showAdTime.show(param.total - param.curr);
                                isFirstTimeConut = false;
                            }
                    }
                });
            }else{
            if (!isFirstLoad) { 
                resetPage();
                selectCue.show();
            }
            isFirstLoad = false;
            isCanSaveHis = true;
        }
        },
        onEnd: function(current, info, isPreVideo) {
            if (isPreVideo) {
                showAdTime.hide();
                isPlayAd = false;
            } else {
            isOnEnd = true;
            if (page.isTry) {
                var playTime = 0;
                var buyCurrent = current;
                var noBuyCurrent = current;
                buyCurrent++;
                noBuyCurrent++;
                if (buyCurrent > listData.length - 1) {
                    buyCurrent = 0;
                }
                if (noBuyCurrent > freeTotal - 1) {
                    noBuyCurrent = 0;
                }
                vl.seek({
                    val: noBuyCurrent,
                    playTime: playTime,
                    diy: {
                        playCurrent: buyCurrent,
                        playTime: playTime
                    }
                }).save();
                gotoOrder();
            } else {
                vl.diy({
                    goonBack: false
                });
                $.back();
            }
        }
        },
        onError: function(e) {
            // e => true 是 preVideo() 的返回值
            // e => null 是正常 vod 的返回值
            if(!e){
                $.gotoDetail($.urls.noVod, true);
            }
            return true;
        }
    }, page.categoryId);
    listData = vl.all();
    if (page.current) {
        playByIndex(page.current);
        if (!page.isTry && !isHasAd) {
            selectCue.show();
        }
    } else {
        isShowHisCue = true;
        vl.play();
    }
    $.pTool.get("progress").setInfo({
        videoName: "第" + listData[vl.currentIndex()].sceneNum + "集",
        isTry: false,
        // isPlayAd: isHasAd
    });
    $.pTool.get("seriesList").initPlayer(vl);
    $.pTool.get("seriesList").setInfo({
        totalNum: listData.length,
        playing: vl.currentIndex() + 1,
        vipFlag: page.isTry,
        // isPlayAd: isHasAd
    });
    $.pTool.get("seriesList").init({
        gotoOrder: gotoOrder,
        playByIndex: playByIndex,
        hidePauseTip: $.pTool.get("progress").hidePauseTip
    });
    if (page.isTry) {
        $.pTool.add("p_trySee", p_trySee());
        $.pTool.get("p_trySee").init({
            fn: gotoOrder
        });
        $.pTool.active("p_trySee");
    }
}

function unload() {
    try {
        if (vl) {
            $.vs.playQuit(isOnEnd && "end");
            if (isCanSaveHis && vl.mp) {
                var leaveTime = vl.mp.getCurrentTime();
                var saveIndex = playIndex;
                if (isOnEnd && playIndex === listData.length - 1 && !page.isTry) {
                    leaveTime = 0;
                    saveIndex = 0;
                }
                $.s.his.add({
                    mediaId: page.seriesId,
                    leaveTime: leaveTime,
                    categoryId: page.categoryId,
                    mediaType: 2,
                    sceneId: listData[saveIndex].sceneId,
                    sceneInfo: saveIndex + 1,
                    totalTime: totalTime
                });
            }
            if(isHasAd && savePrePicInfo){
                savePrePicInfo(picShowTime);
            }
            if (isHasAd && !isPlayAd && !isOnEnd) {
                vl.diy({
                  goonBack: true
                });
              }
            vl.save();
        }
    } catch (e) {}
    vl && vl.release();
    clearInterval(intervalId);
}

function playByIndex(index) {
    clearInterval(intervalId);
    vl.playBy({
        val: index
    });
}

function resetPage() {
    $.pTool.deactive();
    EndTipPanel.hide();
    hisCue.hide();
}

var EndTipPanel = function() {
    var $tip;
    return {
        show: function(time) {
            if (!$tip) {
                $tip = $('<div class="endBox"></div>').appendTo("body");
            }
            var endText;
            if (page.isTry) {
                endText = '<span class="time">' + time + "</span>" + '<span class="unit">S</span> 即将试看结束';
                $tip.removeClass("normal");
            } else {
                if (playIndex < listData.length - 1) {
                    endText = "即将播放: 第" + listData[playIndex + 1].sceneNum + "集";
                    $tip.addClass("normal");
                } else {
                    $tip.removeClass("normal");
                    endText = '<span class="time">' + time + "</span>" + '<span class="unit">S</span> 即将播放结束';
                }
            }
            $tip.show().html(endText);
        },
        hide: function() {
            $tip && $tip.hide();
            $tip && $tip.html("");
        }
    };
}();

function gotoOrder() {
    $.auth.forwardOrder(1);
}

var hisCue = function() {
    var $tip;
    var timer = null;
    var isShow = false;
    function hide() {
        $tip && $tip.hide();
        isShow = false;
    }
    return {
        show: function(time) {
            if (time == 0) {
                selectCue.show();
                return true;
            }
            if (!$tip) {
                $tip = $('<div class="hisCue hide">上次观看至' + transferTime(time) + "，</div>").appendTo("body");
            }
            clearTimeout(timer);
            $tip.show();
            isShow = true;
            timer = setTimeout(function() {
                hide();
            }, 6e3);
        },
        hide: function() {
            clearTimeout(timer);
            hide();
        },
        getIsShow: function() {
            return isShow;
        }
    };
}();

var selectCue = function() {
    var $tip;
    var timer = null;
    function hide() {
        $tip && $tip.hide();
    }
    return {
        show: function(time) {
            if (!$tip) {
                $tip = $('<div class="selectCue hide"></div>').appendTo("body");
            }
            clearTimeout(timer);
            $tip.show();
            timer = setTimeout(function() {
                hide();
            }, 6e3);
        },
        hide: function() {
            clearTimeout(timer);
            hide();
        }
    };
}();

function transferTime(t) {
    return toTwo(Math.floor(t % 86400 / 3600)) + ":" + toTwo(Math.floor(t % 86400 % 3600 / 60)) + ":" + toTwo(t % 60);
}

function toTwo(n) {
    return n < 10 ? "0" + n : "" + n;
}

$.pTool.add("seriesList", function() {
    var key = "seriesList";
    var autoHide;
    var $content = null;
    var playingIndex = 0;
    var data = {
        vipFlag: 1,
        totalNum: 0,
        playing: 1,
        // isPlayAd:false
    };
    var moIndex = 4;
    var navLength = 7;
    var navWidth = 244;
    var listLength = 15;
    var num = 0;
    var focus = {
        menu: 1,
        nav: 0,
        index: 0
    };
    var gotoOrder = null;
    var playByIndex = null;
    var hidePauseTip = null;
    var vl = null;
    function pannelVisible(show) {
        if (show) {
            autoHide.show();
            $.focusTo({
                el: focusto()
            });
        } else {
            autoHide.hide();
        }
    }
    function focusto() {
        if (focus.menu == 0) {
            for (var i = 0; i < num; i++) {
                $("#nav" + i).removeClass("current");
            }
            return "#nav" + focus.nav;
        } else if (focus.menu == 1) {
            for (var i = 0; i < num; i++) {
                $("#nav" + i).removeClass("current");
            }
            $("#nav" + focus.nav).addClass("current");
            return "#list" + focus.index;
        }
    }
    function list() {
        $(".list").html("");
        var num1 = (focus.nav + 1) * listLength < data.totalNum ? listLength : data.totalNum - focus.nav * listLength;
        for (var i = 0; i < num1; i++) {
            var newTag=listData[i+(focus.nav*listLength)]&&listData[i+(focus.nav*listLength)].sceneLatestStatus?listData[i+(focus.nav*listLength)].sceneLatestStatus:null;
            $('<div id="list' + i + '">' + (focus.nav * listLength + 1 + i) + "</div>").appendTo(".list");
            if (data.vipFlag) {
                var html = '<div class="vip"><img src="images/dianbo/select/freeCorner.png" alt=""></div>';
                $(html).appendTo("#list" + i);
                if (focus.nav == 0) {
                    $("#list0 .vip img").css({
                        display: "inline"
                    });
                    $("#list1 .vip img").css({
                        display: "inline"
                    });
                }
            }
            if((data.totalNum>2&&newTag=="1"&&data.vipFlag&&i>1)||(data.totalNum>2&&newTag=="1"&&!data.vipFlag&&i>=0)){
                var corHtml = '<div class="newCorner"><img src="images/dianbo/select/newCorner.png" alt=""></div>';
                $(corHtml).appendTo("#list" + i);
            }
            var nav = 0;
            var index = 0;
            if (data.playing > listLength) {
                if (data.playing % listLength == 0) {
                    nav = parseInt(data.playing / listLength) - 1;
                    index = listLength - 1;
                } else {
                    nav = parseInt(data.playing / listLength);
                    index = data.playing % listLength - 1;
                }
            } else {
                nav = 0;
                index = data.playing - 1;
            }
            if (nav == focus.nav) {
                $("#list" + index).addClass("current");
            }
        }
    }
    function reset() {
        if (data.playing > listLength) {
            focus.menu = 1;
            if (data.playing % listLength == 0) {
                focus.nav = parseInt(data.playing / listLength) - 1;
                focus.index = listLength - 1;
            } else {
                focus.nav = parseInt(data.playing / listLength);
                focus.index = data.playing % listLength - 1;
            }
        } else {
            focus.menu = 1;
            focus.nav = 0;
            focus.index = data.playing - 1;
        }
    }
    var navs = 0;
    function pressLeft() {
        if(isPlayAd){
            return true
        }
        if (focus.index == 0 && focus.nav == 0) {
            return true;
        }
        if (focus.menu == 0) {
            focus.index = 0;
            focus.nav--;
            focus.nav = focus.nav < 0 ? 0 : focus.nav;
            $.focusTo({
                el: focusto()
            });
            list();
            navs--;
            navs = navs < 0 ? 0 : navs;
            if (navs == 0) {
                $(".nav").css({
                    left: -(navWidth * focus.nav)
                });
            }
        }
        if (focus.menu == 1) {
            if (focus.index == 0) {
                $("#nav" + focus.nav).removeClass("current");
                focus.index = focus.nav == 0 ? 0 : listLength;
                focus.nav--;
                focus.nav = focus.nav < 0 ? 0 : focus.nav;
                list();
                navs--;
                navs = navs < 0 ? 0 : navs;
                if (navs == 0) {
                    $(".nav").css({
                        left: -(navWidth * focus.nav)
                    });
                }
            }
            focus.index--;
            focus.index = focus.index < 0 ? 0 : focus.index;
            $.focusTo({
                el: focusto()
            });
        }
        pannelVisible(true);
        return true;
    }
    function pressRight() {
        if(isPlayAd){
            return true
        }
        if (focus.menu == 0) {
            focus.index = 0;
            focus.nav++;
            focus.nav = focus.nav > num - 1 ? num - 1 : focus.nav;
            $.focusTo({
                el: focusto()
            });
            list();
            navs++;
            navs = navs > navLength ? navLength : navs;
            if ($(".nav").offsetLeft() > -(navWidth * (num - 7))) {
                if (navs == navLength) {
                    $(".nav").css({
                        left: -(navWidth * (focus.nav - navLength))-129
                    });
                }
            }
        }
        if (focus.menu == 1) {
            focus.index++;
            if (focus.nav == num - 1) {
                focus.index = focus.index > data.totalNum - focus.nav * listLength - 1 ? data.totalNum - focus.nav * listLength - 1 : focus.index;
            }
            if (focus.index > listLength - 1) {
                focus.index = 0;
                $("#nav" + focus.nav).removeClass("current");
                focus.nav++;
                focus.nav = focus.nav > num - 1 ? num - 1 : focus.nav;
                list();
                navs++;
                navs = navs > navLength ? navLength : navs;
                if ($(".nav").offsetLeft() > -(navWidth * (num - navLength - 1))) {
                    if (navs == navLength) {
                        $(".nav").css({
                            left: -(navWidth * (focus.nav - navLength))
                        });
                    }
                }
            }
            if (focus.nav == num - 1 && focus.index == data.totalNum - focus.nav * listLength) {
                return true;
            }
            $.focusTo({
                el: focusto()
            });
        }
        pannelVisible(true);
        return true;
    }
    function pressUp() {
        if(isPlayAd){
            return true
        }
        if (focus.menu == 1) {
            focus.menu = 0;
            $.focusTo({
                el: focusto()
            });
        }
        pannelVisible(true);
        return true;
    }
    function pressDown() {
        if(isPlayAd){
            return true
        }
        var volTag=$.pTool.get("advertVolume").getShowTag()
        if(volTag){$.pTool.get("advertVolume").deactive()}
        if (data.totalNum > 0) {
            if (focus.menu == 0) {
                focus.menu = 1;
                list();
                $.focusTo({
                    el: focusto()
                });
            }
            if ($content.hasClass("hide")) {
                pannelVisible(true);
                reset();
                list();
                $.focusTo({
                    el: focusto()
                });
            }
        }
        return true;
    }
    function pressOk() {
        if(isPlayAd){
            return true
        }
        if (focus.menu == 1) {
            var playIndex = focus.nav * listLength + focus.index;
            playOrOrder(playIndex);
            pannelVisible(false);
        }
        return true;
    }
    function playOrOrder(playIndex) {
        var volTag=$.pTool.get("advertVolume").getShowTag()
        var pauseTag=$.pTool.get("advertPause").getShowTag()
        if(volTag){$.pTool.get("advertVolume").deactive()}
        if(pauseTag){$.pTool.get("advertPause").deactive()}
        if (playingIndex === playIndex) {
            hidePauseTip();
            vl.mp.playFromStart();
        } else {
            if (data.vipFlag) {
                if (playIndex < 2) {
                    playByIndex(playIndex);
                } else {
                    vl.seek({
                        val: playIndex,
                        playTime: 0
                    }).save();
                    gotoOrder();
                }
            } else {
                playByIndex(playIndex);
            }
        }
    }
    return {
        key: key,
        dft: true,
        keysDftMap: [ "KEY_DOWN", "KEY_OPTION" ],
        keysMap: {
            KEY_LEFT: pressLeft,
            KEY_RIGHT: pressRight,
            KEY_UP: pressUp,
            KEY_DOWN: pressDown,
            KEY_OK: pressOk,
            KEY_PAGEDOWN: function() {
                if(isPlayAd){
                    return true
                }
                if (focus.nav != num - 1) {
                    if (focus.nav == num - 2) {
                        if (data.totalNum % listLength != 0) {
                            focus.index = focus.index > data.totalNum % listLength - 1 ? data.totalNum % listLength - 1 : focus.index;
                        }
                    }
                    $("#nav" + focus.nav).removeClass("current");
                    focus.nav++;
                    focus.nav = focus.nav > num - 1 ? num - 1 : focus.nav;
                    list();
                    navs++;
                    navs = navs > navLength ? navLength : navs;
                    if ($(".nav").offsetLeft() > -(navWidth * (num - navLength - 1))) {
                        if (navs == navLength) {
                            $(".nav").css({
                                left: -(navWidth * (focus.nav - navLength))
                            });
                        }
                    }
                    $.focusTo({
                        el: focusto()
                    });
                    pannelVisible(true);
                }
                return true;
            },
            KEY_PAGEUP: function() {
                if(isPlayAd){
                    return true
                }
                if (focus.nav != 0) {
                    $("#nav" + focus.nav).removeClass("current");
                    focus.nav--;
                    focus.nav = focus.nav < 0 ? 0 : focus.nav;
                    list();
                    navs--;
                    navs = navs < 0 ? 0 : navs;
                    if (navs == 0) {
                        $(".nav").css({
                            left: -(navWidth * focus.nav)
                        });
                    }
                    $.focusTo({
                        el: focusto()
                    });
                }
                return true;
            },
            KEY_OPTION: function() {
                if(isPlayAd){
                    return true
                }
                if (data.totalNum > 0) {
                    pannelVisible(true);
                    reset();
                    list();
                    $.focusTo({
                        el: focusto()
                    });
                }
                return true;
            },
            KEY_RETURN: function() {
                if(isPlayAd){
                    return true
                }
                pannelVisible(false);
                return true;
            }
        },
        init: function(opt) {
            gotoOrder = opt.gotoOrder;
            playByIndex = opt.playByIndex;
            hidePauseTip = opt.hidePauseTip;
            $content = $('<div class="seriesContent"></div>').appendTo("body");
            $('<div class="title">选集</div>').appendTo($content);
            num = data.totalNum % listLength == 0 ? data.totalNum / listLength : parseInt(data.totalNum / listLength) + 1;
            $('<div class="nav"></div>').appendTo($content);
            $(".nav").css({
                width: num * navWidth * 1.5 + "px"
            });
            for (var i = 0; i < num; i++) {
                var num1 = i * listLength + 1;
                var num2 = num1 + (listLength - 1);
                var tag = false;
                num2 = num2 > data.totalNum ? data.totalNum : num2;
                var content = num1 == num2 ? num1 : num1 + "-" + num2;
                for(var h=num1-1;h<num2;h++){
                    if(listData[h]&&listData[h].sceneLatestStatus&&listData[h].sceneLatestStatus=="1"){
                        tag = true;
                    }
                }
                if(num2>2&&tag){
                    $('<div id="nav' + i + '">' + content + '<div class="newCorner"><img src="images/dianbo/select/newCorner.png" alt=""></div></div>').appendTo(".nav");
                }else{
                    $('<div id="nav' + i + '">' + content + '</div>').appendTo(".nav");
                }
                
            }
            $('<div class="list"></div>').appendTo($content);
            reset();
            list();
            if (focus.nav > moIndex) {
                navs = moIndex;
                $(".nav").css({
                    left: -(navWidth * (focus.nav - moIndex)) + "px"
                });
            } else {
                navs = focus.nav;
            }
            $.focusTo({
                el: focusto()
            });
            autoHide = $.AutoHide({
                dom: $content,
                delay: 6e3,
                beforeShow: function() {
                    $.pTool.active(key);
                },
                afterHide: function() {
                    $.pTool.deactive(key);
                }
            });
            pannelVisible(false);
        },
        initPlayer: function(playerObj) {
            vl = playerObj;
        },
        setInfo: function(opt) {
            data.totalNum = +opt.totalNum;
            data.playing = +opt.playing;
            data.vipFlag = !!opt.vipFlag;
            playingIndex = data.playing - 1;
            // data.isPlayAd = opt.isPlayAd
        },
        active: function() {
            reset();
            if (focus.nav > moIndex) {
                navs = moIndex;
                $(".nav").css({
                    left: -(navWidth * (focus.nav - moIndex)) + "px"
                });
            } else {
                navs = focus.nav;
                $(".nav").css({
                    left: 0 + "px"
                });
            }
            pannelVisible(true);
        },
        deactive: function() {
            $(".list .current").removeClass("current");
            pannelVisible(false);
        },
        cover: function() {},
        uncover: function() {},
        destroy: function() {},
        c_playPrev: function() {
            var playIndex = playingIndex - 1;
            var totalNum = +data.totalNum;
            if (playIndex > totalNum - 1 || playIndex < 0) {
                return false;
            }
            playOrOrder(playIndex);
            pannelVisible(false);
            return true;
        },
        c_playNext: function() {
            var playIndex = playingIndex + 1;
            var totalNum = +data.totalNum;
            if (playIndex > totalNum - 1 || playIndex < 0) {
                return false;
            }
            playOrOrder(playIndex);
            pannelVisible(false);
            return true;
        },
        c_playOne: function(index) {
            var playIndex = 0;
            var totalNum = +data.totalNum;
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
    };
}());

var showAdTime = function() {
    var $tip;
    return {
        show: function(time) {
            if (!$tip) {
                $tip = $('<div class="adTime"></div>').appendTo("body");
            }
            var endText = '<span class="time">' + time + '</span><span class="unit">S</span>';
            $tip.show().html(endText);
        },
        hide: function() {
            $tip && $tip.hide();
            $tip && $tip.html("");
        }
    };
}();

// 贴片广告--图片
function playPrePic(obj,playPreVideo,goon){
    isPlayAd = true;
    var url;
    if(obj && obj.type === 'pic'){
        picShowTime = obj.picShowTime;
        url = obj.picPath;
        savePrePicInfo = function (time) {
            time >=0 && (obj.picShowTime = time)
            playPreVideo(obj)
        }
    }
 intervalId =  setInterval(() => {
    if(picShowTime <= 0) {
        clearInterval(intervalId);
        showAdTime.hide();
        $("#AdpicBg").hide();
        isPlayAd = false;
        savePrePicInfo(picShowTime)
        goon();
        return;
    }
    url && $("#AdpicBg").css({
        background: "url(" + url + ") 0 0 no-repeat",
        backgroundSize: '100% 100%'
    }).show();  
    showAdTime.show(picShowTime)
    --picShowTime;
    }, 1000);     
}

function getPlayInfo() {
    var nowInfo = vl && vl.current();
    return {
        type: "pull",
        code: "1",
        playVideoType: "2",
        mediaID: "" + (nowInfo && nowInfo.contentId || ""),
        mediaName: "" + (nowInfo && nowInfo.name || ""),
        categoryID: "" + (page.categoryId || ""),
        currentPlayTime: "" + (!isPlayAd && (vl && vl.mp && vl.mp.getCurrentTime()) || "0"),
        totalTime: "" + (totalTime || "0"),
        isSeries: true,
        seriesID: "" + (page.seriesId || ""),
        seriesName: "" + (listData[0] && listData[0].seriesName || ""),
        currentSeriesNum: "" + (nowInfo && nowInfo.sceneNum || ""),
        seriesTotalNum: "" + page.totalNum
    };
}