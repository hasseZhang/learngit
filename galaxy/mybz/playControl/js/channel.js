$.pTool.add("channel", function() {
    var $channelInfo = null;
    var $playingTime = null;
    var $playingName = null;
    var $nextTime = null;
    var $nextName = null;
    var autoHide;
    var toolKey = "channel";
    return {
        key: toolKey,
        dft: true,
        keysDftMap: [],
        keysMap: {
            KEY_RETURN: function() {
                autoHide.hide();
                channelCue.hide();
                return true;
            }
        },
        init: function(opt) {
            if (!$channelInfo) {
                $channelInfo = $(`<div class="channelInfo hide">
                                    <div class="cNum"></div>
                                    <div class="cName"></div>
                                    <div class="title">
                                        <div class="playing">
                                            <span class="ti">正在播放：</span><span class="playTime"></span><span class="channelName"></span>
                                        </div>
                                        <div class="nextChanenl">
                                            <span class="ti">下一节目：</span><span class="playTime"></span><span class="channelName"></span>
                                        </div>
                                    </div>
                                </div>`);
                $channelInfo.appendTo("body");
                $playingTime = $(".playing .playTime", $channelInfo);
                $playingName = $(".playing .channelName", $channelInfo);
                $nextTime = $(".title .nextChanenl .playTime", $channelInfo);
                $nextName = $(".title .nextChanenl .channelName", $channelInfo);
                autoHide = $.AutoHide({
                    dom: $channelInfo,
                    delay: 6e3,
                    beforeShow: function() {
                        var volTag=$.pTool.get("advertVolume").getShowTag()
                        var pauseTag=$.pTool.get("advertPause").getShowTag()
                        if(volTag){$.pTool.get("advertVolume").deactive()}
                        if(pauseTag){$.pTool.get("advertPause").deactive()}
                        $.pTool.active(toolKey);
                    },
                    afterHide: function() {
                        $.pTool.get("advertRightBottom").deactive();
                        $.pTool.deactive(toolKey);
                    }
                });
            }
            var channel = $.getChanById(opt.channelId);
            $(".cNum", $channelInfo).html(channel.num);
            $(".cName", $channelInfo).html(channel.name);
            channel = null;
            $playingTime.html(opt.playingTime);
            $playingName.html(opt.playingName);
            $nextTime.html(opt.nextTime);
            $nextName.html(opt.nextName);
            $.pTool.active(toolKey);
        },
        active: function() {
            autoHide.show();
        },
        deactive: function() {
            autoHide.hide();
        }
    };
}());

//暂停广告
$.pTool.add("advertPause", function() {
    var $pauseInfo = null;
    var $pausePic = null;
    var isShow = false;
    var picTag = false;
    var toolKey = "advertPause";
    return {
        key: toolKey,
        dft: true,
        keysDftMap: [],
        keysMap: {
            KEY_RETURN: function() {
                $("#advertPause").hide();
                isShow = false;
                return true;
            },
            KEY_OK: function(){
                return true;
            }
        },
        init: function(opt) {
            if(opt.picPath){picTag=true}
            if (!$pauseInfo) {
                $pauseInfo = $(`<div class="advertPause hide" id="advertPause">
                                    <img src="" class="pic">
                                    <div class="rightTip">
                                        返回键关闭广告
                                    </div>
                                </div>`);
                $pauseInfo.appendTo("body");
                $pausePic = $(".pic", $pauseInfo);
                $pausePic.attr({src: opt.picPath});  
            }else{
                $("#advertPause img").attr({src: opt.picPath})
            }
            // if(!opt.picPath){
            //     $.pTool.deactive(toolKey);
            // }else{
            //     $.pTool.active(toolKey);
            // }
            //$.pTool.active(toolKey);
        },
        hidden: function(){
            $("#advertPause").hide();
            isShow = true;            
        },
        active: function() {        
            $("#advertPause").show();
            isShow = true;
        },
        deactive: function() {            
            $("#advertPause").hide();
            isShow = false;
        },
        getShowTag: function(){
            return isShow;
        },
        getPicTag: function(){
            return picTag;
        }
    };
}());

//换台广告
$.pTool.add("advertRightBottom", function() {
    var $bottomInfo = null;
    var $bottomPic = null;
    var isShow = false;
    var autoHide;
    var picSrc="";
    var toolKey = "advertRightBottom";
    return {
        key: toolKey,
        dft: true,
        keysDftMap: [],
        keysMap: {
            KEY_RETURN: function() {
                $("#advertRightBottom").hide();
                return true;
            }
        },
        init: function(opt) {
            if (!$bottomInfo) {
                $bottomInfo = $(`<div class="advertRightBottom hide" id="advertRightBottom">
                                    <img src="" class="pic">
                                </div>`);
                $bottomInfo.appendTo("body");
                $bottomPic = $(".pic", $bottomInfo);
                //$bottomPic.attr({src: opt.picPath});  
                autoHide = $.AutoHide({
                    dom: $bottomInfo,
                    delay: 6e3
                });
            }
            //$.pTool.active(toolKey);
        },
        setPic: function(opt){
			if(picSrc!==opt.picPath){
				picSrc = opt.picPath;
				$bottomPic.attr({src: opt.picPath});
			}			
		},
        active: function() {
            autoHide.show();
            isShow = true;
        },
        deactive: function() {      
            autoHide.hide();
            isShow = false;
        },
        getShowTag: function(){
            return isShow;
        }
    };
}());

//音量广告
$.pTool.add("advertVolume", function() {
    var $volumeInfo = null;
    var $volumePic = null;
    var isShow = false;
    var autoHide;
    var picSrc="";
    var toolKey = "advertVolume";
    return {
        key: toolKey,
        dft: true,
        keysDftMap: [],
        keysMap: {
            KEY_RETURN: function() {
                $("#advertVolume").hide();
                return true;
            }
        },
        init: function(opt) {
            if (!$volumeInfo) {
                $volumeInfo = $(`<div class="advertVolume hide" id="advertVolume">
                                    <img src="" class="pic">
                                </div>`);
                $volumeInfo.appendTo("body");
                $volumePic = $(".pic", $volumeInfo);
                //$volumePic.attr({src: opt.picPath}); 
                autoHide = $.AutoHide({
                    dom: $volumeInfo,
                    delay: 6e3,
                    beforeShow: function() {},
                    afterHide: function() {
                        var tag = $.pTool.get("advertPause").getShowTag()
                        var picTag = $.pTool.get("advertPause").getPicTag()
                        if (tag&&picTag&&opt.mp.isState($.MP.state.paused)) {
                            $.pTool.get("advertPause").active();
                        }
                    }
                });
            }
            //$.pTool.active(toolKey);
        },
        setPic: function(opt){
			if(picSrc!==opt.picPath){
				picSrc = opt.picPath;
				$volumePic.attr({src: opt.picPath});
			}			
		},
        active: function() {
            autoHide.show();
            isShow = true;
        },
        deactive: function() {      
            autoHide.hide();
            isShow = false;
        },
        getShowTag: function(){
            return isShow;
        }
    };
}());

var channelCue = function() {
    var $channelCue = null;
    var autoHide = null;
    var isShow = false;
    return {
        show: function() {
            if (!$channelCue) {
                $channelCue = $('<div class="channelCue hide"></div>');
                $channelCue.appendTo("body");                
                autoHide = $.AutoHide({
                    dom: $channelCue,
                    delay: 6e3,
                    beforeShow: function() {
                        isShow = true;
                    },
                    afterHide: function() {
                        isShow = false;
                    }
                });
            }
            $channelCue.css({
                position: 'absolute',
                width: '759px',
                height: '59px',
                right: '30px',
                top: '26px',
                background: 'url("images/zhibo/cue/cue.png") 0 0 no-repeat',
                backgroundSize: '759px 59px'
            })
            autoHide.show();
        },
        hide: function() {
            if ($channelCue) {
                autoHide.hide();
            }
        },        
        oldCue: function(){
            if (!$channelCue) {
                $channelCue = $('<div class="channelCue hide"></div>');
                $channelCue.appendTo("body");                
                autoHide = $.AutoHide({
                    dom: $channelCue,
                    delay: 6e3,
                    beforeShow: function() {
                        isShow = true;
                    },
                    afterHide: function() {
                        isShow = false;
                    }
                });
            }
            $channelCue.css({
                position: 'absolute',
                width: '401px',
                height: '60px',
                right: '30px',
                top: '26px',
                background: 'url("images/zhibo/cue/oldCue.png") 0 0 no-repeat',
                backgroundSize: '401px 60px'
            })
            autoHide.show();            
        },
        getIsShow: function() {
            return isShow;
        }
    };
}();

$.pTool.add("progress", function() {
    var key = "progress", autoHide, moveStatus, mp, paramPercent = 100, $panel, $playingTime, $playingName, $nextTime, $nextName, $progressBar, $infos, $pointer, $pauseTip;
    var isShow = false;
    var isNoControl = false;
    var isShouldBuy = false;
    var nowPlayingName = "";
    var getInfoFn = function() {
        return {};
    };
    function initDom() {
        if (!$panel) {
            $panel = $(`<div class="control-panel hide">
                                <div class="title">
                                    <div class="playing">
                                        <span class="ti">正在播放：</span><span class="playTime"></span><span class="channelName"></span>
                                    </div>
                                    <div class="nextChanenl">
                                        <span class="ti">下一节目：</span><span class="playTime"></span><span class="channelName"></span>
                                    </div>
                                </div>
                                <div class="progress">
                                    <div class="progressBar"></div>
                                </div>
                                <div class="infos"></div>
                                <div class="pointer"></div>
                            </div>`);
            $playingTime = $(".playing .playTime", $panel);
            $playingName = $(".playing .channelName", $panel);
            $nextTime = $(".title .nextChanenl .playTime", $panel);
            $nextName = $(".title .nextChanenl .channelName", $panel);
            $progressBar = $(".progressBar", $panel);
            $infos = $(".infos", $panel);
            $pointer = $(".pointer", $panel);
            $pauseTip = $('<div class="pauseTip hide"></div>').appendTo("body");
            $panel.appendTo("body");
            autoHide = $.AutoHide({
                dom: $panel,
                delay: 3e3,
                beforeShow: function() {
                    isShow = true;
                    $.pTool.active(key);
                    $pauseTip.hide();
                },
                afterHide: function() {
                    $.pTool.deactive(key);
                    isShow = false;
                    if ($.MP.state.seeking) {
                        $pointer.removeClass("forward rewind pause");
                    }
                    if (mp && mp.isState($.MP.state.paused)) {
                        $pointer.removeClass("pause");
                        $pauseTip.show();
                    }
                }
            });
        }
    }
    function transferTime(t) {
        return toTwo(Math.floor(t % 86400 / 3600)) + ":" + toTwo(Math.floor(t % 86400 % 3600 / 60)) + ":" + toTwo(t % 60);
    }
    function toTwo(n) {
        return n < 10 ? "0" + n : "" + n;
    }
    function updateProgress(param) {
        paramPercent = param.percent;
        var nowTime = new $.Date();
        var beginTime = new $.Date((nowTime / 1e3 - param.total) * 1e3);
        $progressBar.attr({
            nowTime: new $.Date((beginTime / 1e3 + param.curr) * 1e3).format("hh:mm:ss")
        }).css({
            width: param.percent + "%"
        });
        $infos.html(beginTime.format("hh:mm:ss") + "/" + nowTime.format("hh:mm:ss"));
        if (mp.isState($.MP.state.progress)) {
            $pointer.removeClass("forward rewind");
        }
        var info = getInfoFn(nowTime.format("yyyy-MM-dd"), nowTime.format("hh:mm:ss"));
        var playingTime = info.playingTime;
        var playingName = info.playingName;
        var nextTime = info.nextTime;
        var nextName = info.nextName;
        if (nowPlayingName !== playingName) {
            $playingTime.html(playingTime);
            $playingName.html(playingName);
            $nextTime.html(nextTime);
            $nextName.html(nextName);
            nowPlayingName = playingName;
        }
    }
    function updateSeeking(param) {
        updateProgress(param);
        if (moveStatus === "rewind") {
            $pointer.removeClass("forward pause").addClass("rewind");
        } else if (moveStatus === "forward") {
            $pointer.removeClass("rewind pause").addClass("forward");
        }
    }
    function pannelVisible(show) {
        if (show) {
            autoHide.show();
            //channelCue.show();
        } else {
            autoHide.hide();
            channelCue.hide();
        }
    }
    function rewind() {
        if (isNoControl) {
            return true;
        }
        pannelVisible(true);
        $progressBar.removeClass("pauseBar");
        if (paramPercent !== 0) {
            moveStatus = "rewind";
            mp.rewind();
        }
        var volTag=$.pTool.get("advertVolume").getShowTag()
        var pauseTag=$.pTool.get("advertPause").getShowTag()
        var channelTag=$.pTool.get("advertRightBottom").getShowTag()
        if(volTag){$.pTool.get("advertVolume").deactive()}
        if(pauseTag){$.pTool.get("advertPause").deactive()}
        if(channelTag){$.pTool.get("advertRightBottom").deactive()}
        return true;
    }
    function forward() {
        if (isNoControl) {
            return true;
        }
        pannelVisible(true);
        $progressBar.removeClass("pauseBar");
        if (paramPercent !== 100) {
            moveStatus = "forward";
            mp.forward();
        }
        var volTag=$.pTool.get("advertVolume").getShowTag()
        var pauseTag=$.pTool.get("advertPause").getShowTag()
        var channelTag=$.pTool.get("advertRightBottom").getShowTag()
        if(volTag){$.pTool.get("advertVolume").deactive()}
        if(pauseTag){$.pTool.get("advertPause").deactive()}
        if(channelTag){$.pTool.get("advertRightBottom").deactive()}
        return true;
    }
    return {
        key: key,
        dft: true,
        keysDftMap: [ "KEY_RETURN", "KEY_LEFT", "KEY_FAST_REWIND", "KEY_RIGHT", "KEY_FAST_FORWARD", "KEY_PAUSE_PLAY", "KEY_PAGEUP", "KEY_PAGEDOWN" ],
        keysMap: {
            KEY_LEFT: rewind,
            KEY_FAST_REWIND: rewind,
            KEY_RIGHT: function() {
                if (isNoControl) {
                    if (isShouldBuy || timer) {
                        forwardOrder();
                    }
                    return true;
                }
                forward();
                return true;
            },
            KEY_FAST_FORWARD: forward,            
            KEY_PAUSE_PLAY: function() {
                if (isNoControl) {
                    return true;
                }
                mp.pauseOrResume();
                pannelVisible(true);
                var volTag=$.pTool.get("advertVolume").getShowTag();
                var changeTag=$.pTool.get("advertRightBottom").getShowTag();
                if(volTag){$.pTool.get("advertVolume").deactive();}
                if(changeTag){$.pTool.get("advertRightBottom").deactive();}
                if (mp.isState($.MP.state.paused)) {
                    initPauseAd();                    					               
                    $pointer.removeClass("forward rewind");                    
                    $progressBar.addClass("pauseBar");
                    //setTimeout(function(){initPauseAd()},100);
                    //$pointer.removeClass("forward rewind").addClass("pause");
                } else {
                    $.pTool.get("advertPause").deactive();
                    $progressBar.removeClass("pauseBar");
                    $pointer.removeClass("pause");
                }
                return true;
            },
            KEY_OK: function() {
                if (isNoControl) {
                    return true;
                }
                if (mp.isState($.MP.state.paused)) {
                    $.pTool.get("advertPause").deactive();
                    $progressBar.removeClass("pauseBar");
                    mp.resume();
                }
                pannelVisible(false);
                return true;
            },
            KEY_RETURN: function() {
                var pauseTag=$.pTool.get("advertPause").getShowTag();
                if(pauseTag){
                    $.pTool.get("advertPause").deactive();
                    return true;
                }
                if (isShow) {
                    if (mp.isState($.MP.state.paused)) {
                        mp.resume();
                    }
                    pannelVisible(false);
                    return true;
                } else {
                    if (mp.isState($.MP.state.paused)) {
                        mp.resume();
                        $pauseTip.hide();
                        return true;
                    }
                }
            },
            KEY_PAGEUP: function() {
                if (isNoControl) {
                    return true;
                }
                if (paramPercent !== 0) {
                    mp.playFromStart();
                    pannelVisible(true);
                }
                moveStatus = "rewind";
                pannelVisible(true);
                return true;
            },
            KEY_PAGEDOWN: function() {
                if (isNoControl) {
                    return true;
                }
                if (paramPercent !== 100) {
                    mp.playFromEnd();
                    pannelVisible(true);
                }
                moveStatus = "forward";
                pannelVisible(true);
                return true;
            }
        },
        init: function(player, opt) {
            initDom();
            getInfoFn = opt.getInfo || function() {};
            forwardOrder = opt.forwardOrder || function() {};
            mp = player;
            mp.sub($.MP.state.progress, updateProgress);
            mp.sub($.MP.state.seeking, updateSeeking);
            mp.once($.MP.state.loaded, function(param) {
                $.initVolume(mp);
                //屏蔽音量组件按键逻辑
                $.pTool.get("g_sys_volume").keysMap={
                    KEY_VOLUME_UP: function () {},
                    KEY_VOLUME_DOWN: function () {},
                    KEY_MUTE: function(){}
                }
                updateProgress(param);
            });
            return this;
        },
        setInfo: function(opt) {
            if (opt.hasOwnProperty("isNoControl")) {
                isNoControl = opt.isNoControl;
            }
            if (opt.hasOwnProperty("isShouldBuy")) {
                isShouldBuy = opt.isShouldBuy;
            }
        },
        changePlayer: function(player) {
            mp = player;
        },
        hidePauseTip: function() {
            $pauseTip.hide();
        },
        active: function() {
            pannelVisible(true);
        },
        deactive: function() {
            pannelVisible(false);
        },
        cover: function() {},
        uncover: function() {},
        destroy: function() {},
        c_forward: function(time) {
            if (typeof time !== "undefined") {
                if (time > 0) {
                    pannelVisible(true);
                    moveStatus = "forward";
                    mp.seek(+time);
                }
            } else {
                forward();
            }
            return true;
        },
        c_rewind: function(time) {
            if (typeof time !== "undefined") {
                if (time > 0) {
                    pannelVisible(true);
                    moveStatus = "rewind";
                    mp.seek(-time);
                }
            } else {
                rewind();
            }
            return true;
        },
        c_seek: function(time) {
            var nowTime = mp.getCurrentTime();
            time = +time;
            if (time > nowTime) {
                moveStatus = "forward";
            } else if (time < nowTime) {
                moveStatus = "rewind";
            } else {
                return true;
            }
            pannelVisible(true);
            mp.seek(+time + "a");
            return true;
        },
        c_pause: function() {
            if (!mp.isState($.MP.state.paused)) {
                pannelVisible(true);
                mp.pause();
                $pointer.removeClass("pause");
            }
            return true;
        },
        c_play: function() {
            if (mp.isState($.MP.state.paused)) {
                pannelVisible(true);
                mp.resume();
                $pointer.removeClass("forward rewind").addClass("pause");
            }
            return true;
        }
    };
}());

$.pTool.add("channelList", function() {
    var key = "channelList";
    var dataChannel = $.getHelper("data:channel");
    var args = {
        $a_list: null,
        $a_list_wrap: null,
        a_list_begin: 0,
        a_list_index: 0,
        a_list_size: 7,
        a_list_fixed: 3,
        a_list_shadow: 1,
        $b_list: null,
        $b_list_wrap: null,
        b_list_begin: 0,
        b_list_index: 0,
        b_list_playing_index: 0,
        b_list_playing_content: "",
        b_list_size: 8,
        b_list_fixed: 4,
        b_list_shadow: 1,
        $c_list: null,
        $c_list_wrap: null,
        c_list_begin: 0,
        c_list_index: 0,
        c_list_size: 7,
        c_list_fixed: 3,
        c_list_total: 7,
        c_list_shadow: 1,
        c_list_fixIndex: 0,
        $d_list: null,
        $d_list_wrap: null,
        d_list_begin: 0,
        d_list_index: 0,
        d_list_playing_id: "f_D_list_0",
        d_list_size: 7,
        d_list_fixed: 3,
        d_list_shadow: 1
    };
    var mp = null;
    var pipPlay = null;
    var pipShow = null;
    var isActive = false;
    var $focus = null;
    var cfavData = {};
    var reserveData = {};
    var saveArgs = {
        a_list_index: 0,
        a_list_begin: 0,
        b_list_index: 0,
        b_list_begin: 0
    };
    var iListHeight = 110;
    var isCanShow = false;
    var isCfavF = false;
    var tvodStartTime = "";
    var channelRecommend = [{}, {}, {}, {}, {}, {}, {}, {}];
    var CHANNEL_LIST_DS = null;
    var secondClickB = false;
    var channelListMap = [[0, 8]];
    $.UTIL.each(dataChannel.channelListMap, function (i) {
        channelListMap.push([i[0] + 8, i[1] + 8]);
    });
    var CHANNEL_LIST_DS = channelRecommend.concat(dataChannel.CHANNEL_LIST_DS), 
        CHANNEL_LIST_NAME = ['热播收藏'].concat(dataChannel.CHANNEL_LIST_NAME),
        date_ds = [], /* date_ds_return = [], */
        schedule_ds = [], 
        listState = "a", 
        listStateArr = [ "a", "b", "c", "d" ], 
        liveIndex = 0, 
        tvodIndex, 
        autoHide = null, 
        $channelListWrap = null, 
        c_d_list_map = undefined,
        listLineHeightObj = {};
    var playBillObj = {};
    var liveInfoLock = {};
    var today = new $.Date().format("yyyy-MM-dd");
    var gId = $.getVariable('EPG:isTest') ? '1100006258' : '1100006673';
    dateData();
    function loadCfav() {
        var newArr = []; //读取cms导读配置的直播频道
        $.s.guidance.get({
            id: gId
        }, {
            async: false,
            success: function (datas) {
                for (var i = 0; i < datas.length; i++) {
                    contentUri = datas[i].contentUri.replace("!", "").replace("channel://", "");
                    newArr.push(contentUri);
                };
            }
        })
        $.s.chanfav.all(null, {
            success: function(data) {
                isCanShow = true;
                var favDataAll = data.data;
                if (favDataAll.length == 8) {
                    channelRecommend = favDataAll;
                } else if (favDataAll.length > 8) {
                    channelRecommend = favDataAll.slice(0, 8);
                } else {
                    var removeRepeat = favDataAll.concat($.getChanById(newArr));
                    var newArray = [];
                    var newArrId = {};
                    for (var i = 0; i < removeRepeat.length; i++) { //去重
                        if (!newArrId[removeRepeat[i].num]) {
                            newArray.push(removeRepeat[i]);
                            newArrId[removeRepeat[i].num] = true;
                        }
                        if (newArray.length == 8) {
                            channelRecommend = newArray;
                        } else {
                            channelRecommend = newArray.slice(0, 8);
                        }
                    }
                }
                $.UTIL.each(channelRecommend, function (value, moduleIndex) {   
                    $("#b_list" + moduleIndex).removeClass("recomCfav current");
                    $("#b_list" + moduleIndex + " .vip").remove();
                    if (cfavData[value.channelId]) {
                        $("#b_list" + moduleIndex).addClass("recomCfav");
                    }
                    var channelNum = '' + value.num || '';
                    if (channelNum && channelNum.length < 3) {
                        channelNum = ("00" + channelNum).slice(-3)
                    }
                    if(channelId == value.channelId){
                        $("#b_list" + moduleIndex).addClass("current");
                    }
                    if($.isVipChan(channelNum)){
                        $('<div class="vip"></div>').appendTo($("#b_list" + moduleIndex));
                    } 
                    var channelLength = channelRecommend.length;       
                    if(channelLength < 8){
                        $("#b_list" + channelLength + " .channelNum").html('');
                        $("#b_list" + channelLength + " .channelName").html('');
                        CHANNEL_LIST_DS[channelLength] = {}; 
                    }
                    $("#b_list" + moduleIndex + " .channelNum").html(channelNum);
                    $("#b_list" + moduleIndex + " .channelName").html(value.name);      
                    CHANNEL_LIST_DS[moduleIndex] = value;       
                });
                upCfav();
                addIcon();
                getLiveInfo();
            },
            error: function () { }
        });
    }
    function initDom() {
        if (!$channelListWrap) {
            $channelListWrap = $(`<div id="channelListWrap" class="left hide">
                                                <div id="focus"></div>
                                                <div id="channelList">
                                                    <div id="a_list">
                                                        <div id="a_list_wrap"></div>
                                                    </div>
                                                    <div id="b_list">
                                                        <div id="b_list_wrap">
                                                        </div>
                                                    </div>
                                                    <div id="c_list">
                                                        <div id="c_list_wrap"></div>
                                                    </div>
                                                    <div id="d_list">
                                                        <div id="d_list_wrap"></div>
                                                    </div>
                                                </div>
                                                <div class="shadow"></div>
                                            </div>`);
            args["$a_list"] = $("#a_list", $channelListWrap);
            args["$b_list"] = $("#b_list", $channelListWrap);
            args["$c_list"] = $("#c_list", $channelListWrap);
            args["$d_list"] = $("#d_list", $channelListWrap);
            args["$a_list_wrap"] = $("#a_list_wrap", $channelListWrap);
            args["$b_list_wrap"] = $("#b_list_wrap", $channelListWrap);
            args["$c_list_wrap"] = $("#c_list_wrap", $channelListWrap);
            args["$d_list_wrap"] = $("#d_list_wrap", $channelListWrap);
            $focus = $("#focus", $channelListWrap);
            $channelListWrap.appendTo("body");
            autoHide = $.AutoHide({
                dom: $channelListWrap,
                delay: 1e4,
                beforeShow: function() {
                    listState = "b";
                    $channelListWrap.removeClass("right").addClass("left");
                    isCfavF = false;
                },
                afterHide: function() {
                    $("#b_list" + args.b_list_index + " .moreSelect").hide();
                    $.pTool.deactive(key);
                    pipPlay(false);
                    args.a_list_index = saveArgs.a_list_index;
                    args.a_list_begin = saveArgs.a_list_begin;
                    args.b_list_index = saveArgs.b_list_index;
                    args.b_list_begin = saveArgs.b_list_begin;
                    $focus.css({
                        transition: "none"
                    });
                    liveInfoLock = {};
                }
            });
            createList();
            upCurrent();
            setABCWrap();
        }
    }
    function addIcon(){
        for(var i = 0; i < CHANNEL_LIST_DS.length; i++){
            $("#b_list" + i).removeClass("recomCfav current liveCorn tvodCorn");
            liveInfoLock = {};
            if (cfavData[CHANNEL_LIST_DS[i].channelId]) {
                $("#b_list" + i).addClass("recomCfav");
            }
            if(channelId == CHANNEL_LIST_DS[i].channelId){
                $("#b_list" + i).addClass("current");
                if(tvodStartTime) {
                    $("#b_list" + i).removeClass("liveCorn");
                    $("#b_list" + i).addClass("tvodCorn");
                } else {
                    $("#b_list" + i).removeClass("tvodCorn");
                    $("#b_list" + i).addClass("liveCorn");
                }
            }
        };
    }
    function addLiveIcon(){
        args.c_list_index = findInfo("c", "fixIndex");
        $.UTIL.each(CHANNEL_LIST_DS, function(value, index) {
            if (value.channelId === channelId) {
                args.b_list_index = index;
                return true;
            }
        });
        findAIndex();
        args.a_list_begin = Math.max(findInfo("a", "index") - findInfo("a", "fixed"), 0);
        args.b_list_begin = Math.max(channelListMap[findInfo("a", "index")][0], findInfo("b", "index") - findInfo("b", "fixed"));
        var cornName = "liveCorn";
        if (tvodStartTime) {
            cornName = "tvodCorn";
        }
        if (saveArgs) {
            $("#b_list" + saveArgs.b_list_index).length && $("#b_list" + saveArgs.b_list_index).removeClass(cornName);
        }
        saveArgs = {
            a_list_begin: findInfo("a", "begin"),
            a_list_index: findInfo("a", "index"),
            b_list_index: findInfo("b", "index"),
            b_list_begin: findInfo("b", "begin")
        };
        $("#b_list" + saveArgs.b_list_index).length && $("#b_list" + saveArgs.b_list_index).addClass(cornName);
    }
    function getPlayBill(info, cb) {
        var nowDay = new $.Date().format("yyyy-MM-dd");
        if (nowDay !== today) {
            today = nowDay;
            playBillObj = {};
        }
        var successCb = cb.success || function() {};
        var errorCb = cb.error || function() {};
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
                    success: function(data) {
                        playBillObj[key] = data;
                        successCb(data);
                    },
                    error: function() {
                        playBillObj[key] = "error";
                        errorCb();
                    }
                });
            }
        }
    }
    function findInfo(listState, type) {
        return args[listState + "_list_" + type];
    }
    function addCurrent(el) {
        $(el).addClass("current");
    }
    function removeListCurrent(listState) {
        $(".current", "#" + listState + "_list", true).removeClass("current");
    }
    function dateData() {
        date_ds = [];
        for (var i = 0; i < findInfo("c", "total"); i++) {
            var oDate = new $.Date();
            oDate.setDate(oDate.getDate() - i);
            date_ds.push(oDate);
        }
    }    
    function createA_list() {
        var htmlTxt = "";
        for (var i = 0; i < CHANNEL_LIST_NAME.length; i++) {
            htmlTxt += '<div id="a_list' + i + '" class="a_list">' + CHANNEL_LIST_NAME[i] + "</div>";
        }
        args["$a_list_wrap"].html(htmlTxt);
    }
    function createB_list() {
        var htmlTxt = "";
        var cfavClass = "";
        for (var i = 0; i < CHANNEL_LIST_DS.length; i++) {
            var channelNum =  "" + (CHANNEL_LIST_DS[i].num || "");
            if (channelNum &&channelNum.length < 3) {
                channelNum = ("00" + channelNum).slice(-3);
            }
            var cornClass = "";
            var liveCornClass = "";
            if(channelId == CHANNEL_LIST_DS[i].channelId){
                liveCornClass = " current";
                if (tvodStartTime) {
                    cornClass = " tvodCorn";
                } else {
                    cornClass = " liveCorn";
                }
            }
            if (cfavData[CHANNEL_LIST_DS[i].channelId]) {
                cfavClass = " recomCfav";
            } else {
                cfavClass = "";
            }
            htmlTxt += '<div id="b_list' + i + '" class="b_list' + cfavClass + cornClass + liveCornClass + '"><div class="channelTitle">' + '<div class="channelNum">' + (channelNum || "") + "</div>" + '<div class="channelName">' + (CHANNEL_LIST_DS[i].name || "") + "</div>" + "</div>" + '<div class="' + ($.isVipChan(channelNum) ? "vip" : "") + '"></div><div class="liveInfo"></div><div class="moreSelect hide"><div class="guides">节目单</div><div class="cfav"></div></div>' + "</div>";
        }
        args["$b_list_wrap"].html(htmlTxt);
    }
    function createC_list() {
        var htmlTxt = "";
        args["$c_list_wrap"].html("");
        for (var i = 0; i < (isVipChan() ? 1 : date_ds.length); i++) {
            var day = "";
            if (i === 0) {
                day = "今天";
            } else if (i === 1) {
                day = "昨天";
            } else if (i > 1) {
                day = date_ds[i].format("MM月dd日");
            }
            htmlTxt += '<div id="c_list' + i + '" class="c_list">' + day + "</div>";
        }
        args["$c_list_wrap"].html(htmlTxt);
    }
    function isVipChan() {
        return $.isVipChan(CHANNEL_LIST_DS[findInfo("b", "index")].num);
    }
    var autoCreateC_list = function() {
        var preChanNum = 0;
        var isFirst = true;
        return function() {
            var nowChanNum = CHANNEL_LIST_DS[findInfo("b", "index")].num;
            if ($.isVipChan(nowChanNum) !== $.isVipChan(preChanNum) || isFirst) {
                createC_list();
            }
            isFirst = true;
            preChanNum = nowChanNum;
        };
    }();
    var timer = null;
    function createD_list() {
        clearD_list();
        timer = setTimeout(function() {
            var hasLive = false; // 解决:有的直播没有当前播放的节目单,导致右移动黑屏
            var noLiveIndex; // 没有直播节目单时,获取 预约第一个节目.
            var channelIdB = CHANNEL_LIST_DS[findInfo("b", "index")].channelId;
            var day = date_ds[findInfo("c", "index")].format("yyyy-MM-dd");
            (function(bIndex, cIndex) {
                getPlayBill({
                    date: day,
                    id: channelIdB
                }, {
                    success: function(data) {
                        autoGetLiveInfo();
                        if (bIndex !== findInfo("b", "index") || cIndex !== findInfo("c", "index")) {
                            return;
                        }
                        schedule_ds = data.programs;
                        var htmlTxt = "";
                        var now = new $.Date().format("yyyy-MM-dd hh:mm:ss");
                        if (isVipChan()) {
                            for (var i = 0; i < schedule_ds.length; i++) {
                                if (now >= schedule_ds[i].endtime) {
                                    schedule_ds.splice(i, 1);
                                    i--;
                                }
                            }
                        }
                        $.UTIL.each(schedule_ds, function(v, i) {
                            var startTime = v.starttime;
                            var endTime = v.endtime;
                            var name = v.text;
                            var startTimeText = v.starttime.slice(11, 16);
                            var oStateText = "";
                            var type = "";
                            var tvodClass = "";
                            var liveClass = "";
                            var stateClass = "";
                            var hasReserveClass = "";
                            if (now < startTime) {
                                noLiveIndex || (noLiveIndex = i + '');
                                startTime = startTime.split("-").join("").split(" ").join("").split(":").join("").slice(0, 12);
                                var stateText = "预约";
                                if (reserveData[CHANNEL_LIST_DS[bIndex].channelId + "-" + startTime]) {
                                    stateText = "已预约";
                                    hasReserveClass = " hasReserve";
                                }
                                stateClass = " reserve";
                                oStateText = '<div class="state' + hasReserveClass + '">' + stateText + "</div>";
                                type = "reserve";
                            } else if (now >= startTime && now < endTime) {
                                hasLive || (hasLive = true);
                                liveIndex = i;
                                if (findInfo("c", "index") === 0) {
                                    args.d_list_begin = Math.max(liveIndex - findInfo("d", "fixed"), 0);
                                }
                                oStateText = "";
                                type = "live";
                                startTimeText = "直播";
                                liveClass = " live";
                                if (channelId != channelIdB || typeof tvodIndex === "number"){
                                    liveClass = "";
                                }
                            } else {
                                oStateText = "";
                                type = "tvod";
                            }

                            if(!hasLive){
                                liveIndex = +noLiveIndex;
                                if (findInfo("c", "index") === 0) {
                                    args.d_list_begin = Math.max(liveIndex - findInfo("d", "fixed"), 0);
                                }
                            }

                            if (channelIdB === channelId && findInfo("c", "index") === findInfo("c", "fixIndex") && tvodStartTime) {
                                liveClass = "";
                                if (typeof tvodIndex !== "number") {
                                    var tvodDate = new $.Date().parse(tvodStartTime, "yyyyMMddhhmmss").format("yyyy-MM-dd hh:mm:ss");
                                    if (tvodDate >= startTime && tvodDate < endTime) {
                                        tvodIndex = i;
                                    }
                                }
                                args.d_list_begin = Math.max(tvodIndex - findInfo("d", "fixed"), 0);
                                if (tvodIndex === i) {
                                    tvodClass = " tvod";
                                }
                            }
                            htmlTxt += '<div id="d_list' + i + '" class="d_list' + tvodClass + stateClass + liveClass +'" type="' + type + '"><div class="startTime">' + startTimeText + '</div><div class="name">' + name + "</div>" + oStateText + "</div>";
                        });
                        args["$d_list_wrap"].html(htmlTxt);
                        setTimeout(function() {
                            args["$d_list_wrap"].css({
                                transition: "0.5s"
                            });
                        }, 50);
                        setDWrap();
                        moveList("d");
                    },
                    error: function() {
                        args["$d_list_wrap"].html('<div class="error">暂未获取到节目信息</div>');
                        autoGetLiveInfo();
                    }
                });
            })(findInfo("b", "index"), findInfo("c", "index"));
        }, 200);
    }
    function autoCreateD_list() {
        clearTimeout(timer);
        upCurrent();
        createD_list();
    }
    function clearD_list() {
        args["$d_list_wrap"].html("");
        args["$d_list_wrap"].css({
            transition: "none"
        });
        args.d_list_begin = 0;
        args.d_list_index = 0;
        moveList("d");
        c_d_list_map = undefined;
        schedule_ds = [];
    }
    function createList() {
        createA_list();
        createB_list();
        createC_list();
        createD_list();
    }
    function setABCWrap() {
        for (var i = 0; i < listStateArr.length - 1; i++) {
            listLineHeightObj[listStateArr[i]] = setOnelistWrap(listStateArr[i]);
        }
    }
    function setDWrap() {
        listLineHeightObj["d"] = setOnelistWrap("d");
    }
    function setOnelistWrap(listState) {
        var listId = listState + "_list";
        var listLineHeight = iListHeight + parseInt($("#" + listId + " ." + listId).css("margin-bottom"));
        var listHeight = listLineHeight * findInfo(listState, "size") + "px";
        args["$" + listState + "_list"].css({
            height: listHeight
        });
        return listLineHeight;
    }
    function upCfav() {
        var cfavText = "收藏";
        $cfav = $("#b_list" + findInfo("b", "index") + " .moreSelect .cfav");
        $cfav.removeClass("cfaved");
        $cfav.css("padding-right","45px");
        if (cfavData[CHANNEL_LIST_DS[findInfo("b", "index")].channelId]) {
            $cfav.addClass("cfaved");
            cfavText = "已收藏";
            $cfav.css("padding-right","25px");
        }
        $cfav.html(cfavText);
    }
    function upCurrent() {
        if (listState === "c") {
            return true;
        }
        removeListCurrent("c");
        addCurrent("#c_list" + findInfo("c", "index"));
        if (listState === "b") {
            return true;
        }
    }
    function focusTo() {
        var listId = listState + "_list";
        var parentTop = args["$" + listId].offsetTop();
        var elLeft = args["$" + listId].offsetLeft();
        var elTop = parentTop + listLineHeightObj[listState] * (findInfo(listState, "index") - findInfo(listState, "begin"));
        var elWidth = $("." + listId).offsetWidth();
        var elHeight = $("." + listId).offsetHeight();
        if (listState === "d") {
            $focus.addClass("d_listF");
        } else {
            $focus.removeClass("d_listF");
        } 
        if (listState === "b" && CHANNEL_LIST_DS[findInfo("b", "index")].channelId !== channelId || listState === "d" && findInfo("d", "index") < liveIndex) {
            pipPlay(true);
        } else {
            pipPlay(false);
        }
    
   
       
        var focusObj = {
            el: "#" + listId + findInfo(listState, "index"),
            marquee: [ "#" + listId + findInfo(listState, "index") + (listState === "b" ? " .liveInfo" : " .name") ]
        };
        if (isCfavF) {
            listId = "cfav";
            elTop = 12;
            elLeft = 481;
            elWidth = 180;
            elHeight = 122;
            focusObj = {
                el: "#cfav"
            };
        }
        $focus.css({
            top: elTop + "px",
            left: elLeft + "px",
            width: elWidth + "px",
            height: elHeight + "px"
        });
        $.focusTo(focusObj);
    }
    function b_Right(){
        $focus.hide();
        var guidesBtn = $(".focusBorder.guides");
        var cfavBtn = $(".focusBorder.cfav");
        if(guidesBtn.length == 0 && cfavBtn.length == 0){
            $.focusTo({
                el: "#b_list" + findInfo("b", "index")  + " .moreSelect .guides"
            })
        } else if (guidesBtn.length == 1 && cfavBtn.length == 0) {
            $.focusTo({
                el: "#b_list" + findInfo("b", "index")  + " .moreSelect .cfav"
            })
            return
        }
    }
    function b_Left(){
        var b_listBtn = $(".focusBorder.b_list");
        var guidesBtn = $(".focusBorder.guides");
        var cfavBtn = $(".focusBorder.cfav");
        if(guidesBtn.length == 0 && cfavBtn.length == 1){
            $.focusTo({
                el: "#b_list" + findInfo("b", "index")  + " .moreSelect .guides"
            });
        } else if (guidesBtn.length == 1 && cfavBtn.length == 0) {
            $focus.show();
            focusTo()
        } else if (b_listBtn.length == 1){
            listState = "a";
            removeListCurrent("a");
            secondClickB = false;
            $channelListWrap.removeClass("right").addClass("left");
            $("#b_list" + (findInfo("b", "index")) + " .moreSelect").hide();
            focusTo();
        }
    }
    function b_listOk(){
        var nowChannelId = CHANNEL_LIST_DS[findInfo("b", "index")].channelId;
        var b_listBtn = $(".focusBorder.b_list");
        var guidesBtn = $(".focusBorder.guides");
        var cfavBtn = $(".focusBorder.cfav");
            var nowChannelId = CHANNEL_LIST_DS[findInfo("b", "index")].channelId;
        if(b_listBtn.length == 1 && guidesBtn.length == 0 && cfavBtn.length == 0){
            if(!secondClickB && nowChannelId){
                playLiveOrRec();
            }
        } else if (b_listBtn.length == 0 && guidesBtn.length == 1 && cfavBtn.length == 0) {
            if(!nowChannelId) {
                return;
            }
            $focus.show();
            listState = "c";
            removeListCurrent("c");
            $channelListWrap.removeClass("left").addClass("right");
            focusTo();
        } else if(b_listBtn.length == 0 && guidesBtn.length == 0 && cfavBtn.length == 1) {
            if(!nowChannelId) {
                return;
            }
            var $cfav = $("#b_list" + findInfo("b", "index") + " .moreSelect .cfav");
            if (cfavData[nowChannelId]) {
                $.s.chanfav.remove({
                    channelId: nowChannelId
                }, {
                    success: function(data) {
                        if (data.code === 0) {
                            args.b_list_index = findInfo("b", "index");
                            cfavData[nowChannelId] = 0;
                            $cfav.removeClass("cfaved").html("收藏");
                            $cfav.css("padding-right","45px");
                            $("#b_list" + findInfo("b", "index")).removeClass("recomCfav");
                            addIcon();
                            loadCfav();
                            $.focusTo({
                                el: $cfav
                            });
                        }
                    }
                });
            } else {
                $.s.chanfav.add({
                    channelId: nowChannelId
                }, {
                    success: function(data) {
                        if (data.code === 0) {
                            args.b_list_index = findInfo("b", "index");
                            cfavData[nowChannelId] = 1;
                            $cfav.addClass("cfaved").html("已收藏");
                            $("#b_list" + findInfo("b", "index")).addClass("recomCfav");
                            $cfav.css("padding-right","25px");
                            addIcon();
                            loadCfav();
                            $.focusTo({
                                el: $cfav
                            });
                        }
                    }
                });
            }
            $.focusTo({
                el:$cfav
            })
        }
    }
    var pressDown = {
        a: function() {
            if (focusMoveMap.down("a", CHANNEL_LIST_NAME.length)) {
                return;
            }
            moveList("a");
            args.b_list_begin = channelListMap[findInfo("a", "index")][0];
            moveList("b");
            args.b_list_index = findInfo("b", "begin");
            autoCreateC_list();
            autoCreateD_list();
            focusTo();
        },
        b: function() {
            $focus.show();
            if (focusMoveMap.down("b", CHANNEL_LIST_DS.length)) {
                return;
            }
            moveList("b");
            if (findInfo("b", "index") === channelListMap[findInfo("a", "index")][1]) {
                focusMoveMap.down("a", CHANNEL_LIST_NAME.length);
            }
            removeListCurrent("a");
            removeListCurrent("c");
            addCurrent("#a_list" + findInfo("a", "index"));
            moveList("a");
            $("#b_list" + findInfo("b", "index") + " .moreSelect").show();
            $("#b_list" + (findInfo("b", "index")-1) + " .moreSelect").hide();
            secondClickB = false;
            if(findInfo("b","index") === saveArgs.b_list_index){
                secondClickB = true; 
            }
            upCfav();
            if (findInfo("b", "index") === saveArgs.b_list_index && tvodStartTime) {
                if (findInfo("c", "index") !== findInfo("c", "fixIndex")) {
                    args.c_list_index = findInfo("c", "fixIndex");
                    args.c_list_begin = Math.max(findInfo("c", "index") - findInfo("c", "fixed"), 0);
                }
            } else {
                if (findInfo("c", "index") !== 0) {
                    args.c_list_index = args.c_list_begin = 0;
                }
            }
            moveList("c");
            autoCreateC_list();
            autoCreateD_list();
            focusTo();
        },
        c: function() {
            if (isCfavF) {
                isCfavF = false;
            } else {
                if (isVipChan() || focusMoveMap.down("c", findInfo("c", "total"))) {
                    return;
                }
                moveList("c");
                autoCreateD_list();
            }
            focusTo();
        },
        d: function() {
            if (focusMoveMap.down("d", schedule_ds.length)) {
                return;
            }
            moveList("d");
            focusTo();
        } 
    };
    var pressUp = { 
        a: function() {
            if (focusMoveMap.up("a")) {
                return;
            }
            moveList("a");
            args.b_list_begin = channelListMap[findInfo("a", "index")][0];
            moveList("b");
            args.b_list_index = findInfo("b", "begin");
            autoCreateC_list();
            autoCreateD_list();
            focusTo();
        },
        b: function() {
            $focus.show();
            if (focusMoveMap.up("b")) {
                return;
            }
            moveList("b");
            if (findInfo("b", "index") === channelListMap[findInfo("a", "index")][0] - 1) {
                focusMoveMap.up("a", CHANNEL_LIST_NAME.length);
            }
            removeListCurrent("a");
            removeListCurrent("c");
            addCurrent("#a_list" + findInfo("a", "index"));
            $("#b_list" + findInfo("b", "index") + " .moreSelect").show();
            $("#b_list" + (findInfo("b", "index")+1) + " .moreSelect").hide();
            secondClickB = false;
            if(findInfo("b","index") === saveArgs.b_list_index){
                secondClickB = true; 
            }
            upCfav();
            moveList("a");
            if (findInfo("b", "index") === args.b_list_index && tvodStartTime) {
                if (findInfo("c", "index") !== findInfo("c", "fixIndex")) {
                    args.c_list_index = findInfo("c", "fixIndex");
                    args.c_list_begin = Math.max(findInfo("c", "index") - findInfo("c", "fixed"), 0);
                }
            } else {
                if (findInfo("c", "index") !== 0) {
                    args.c_list_index = args.c_list_begin = 0;
                }
            }
            moveList("c");
            autoCreateC_list();
            autoCreateD_list();
            focusTo();
        },
        c: function() {
            if (focusMoveMap.up("c")) {
                isCfavF = false;
                focusTo();
            } else {
                moveList("c");
                autoCreateD_list();
                focusTo();
            }
        },
        d: function() {
            if (focusMoveMap.up("d")) {
                return;
            }
            moveList("d");
            focusTo();
        }
    };
    var pressLeft = {
        a: function() {},
        b: function() {
            listState = "b";
            b_Left();
        },
        c: function() {
            listState = "b";
            $channelListWrap.removeClass("right").addClass("left");
            if (findInfo("b", "index") === saveArgs.b_list_index && tvodStartTime) {
                if (findInfo("c", "index") !== findInfo("c", "fixIndex")) {
                    args.c_list_index = findInfo("c", "fixIndex");
                    args.c_list_begin = Math.max(findInfo("c", "index") - findInfo("c", "fixed"), 0);
                    autoCreateD_list();
                } else {
                    addCurrent("#c_list" + findInfo("c", "index"));
                }
            } else {
                if (findInfo("c", "index") !== 0) {
                    args.c_list_index = args.c_list_begin = 0;
                    autoCreateD_list();
                } else {
                    addCurrent("#c_list" + findInfo("c", "index"));
                }
            }
            moveList("c");
            if (isCfavF) {
                isCfavF = false;
            }
            focusTo();
        },
        d: function() {
            listState = "c";
            removeListCurrent("c");
            addCurrent("#d_list" + findInfo("d", "index"));
            c_d_list_map = findInfo("d", "index");
            focusTo();
        }
    }; 
    var pressRight = {
        a: function() {
            if(findInfo("b", "index") === saveArgs.b_list_index){
                secondClickB = true;
            }
            listState = "b";
            addCurrent("#a_list" + findInfo("a", "index"));
            $("#b_list" + findInfo("b", "index") + " .moreSelect").show();
            upCfav();
            focusTo();
        },
        b: function() {
            listState = "b";
            b_Right();
        },
        c: function() {
            if (!schedule_ds.length) {
                return;
            }
            listState = "d";
            removeListCurrent("d");
            addCurrent("#c_list" + findInfo("c", "index"));
            if (typeof c_d_list_map === "number") {
                args.d_list_index = c_d_list_map;
            } else {
                if (CHANNEL_LIST_DS[findInfo("b","index")].channelId === CHANNEL_LIST_DS[saveArgs.b_list_index].channelId && tvodStartTime) {
                    if (findInfo("c", "index") === findInfo("c", "fixIndex")) {
                        args.d_list_index = tvodIndex;
                    } else {
                        if (findInfo("c", "fixIndex") !== 0) {
                            if (findInfo("c", "index") === 0) {
                                args.d_list_index = liveIndex;
                            } else {
                                args.d_list_index = 0;
                            }
                        }
                    }
                } else {
                    if (findInfo("c", "index") === 0) {
                        args.d_list_index = liveIndex;
                    } else {
                        args.d_list_index = 0;
                    }
                }
            }
            if (isCfavF) {
                isCfavF = false;
            }
            focusTo();
        },
        d: function() {},
    };
    var pressPageUp = {
        a: function() {
            if (focusMoveMap.pageUp("a")) {
                return;
            }
            moveList("a");
            args.b_list_begin = channelListMap[findInfo("a", "index")][0];
            moveList("b");
            args.b_list_index = findInfo("b", "begin");
            autoCreateC_list();
            autoCreateD_list();
            focusTo();
        },
        b: function() {
            if (focusMoveMap.pageUp("b")) {
                return;
            }
            moveList("b");
            findAIndex();
            args.a_list_begin = Math.max(findInfo("a", "index") - findInfo("a", "fixed"), 0);
            removeListCurrent("a");
            addCurrent("#a_list" + findInfo("a", "index"));
            moveList("a");
            autoCreateC_list();
            autoCreateD_list();
            focusTo();
        },
        c: function() {
            if (focusMoveMap.pageUp("c") || isCfavF) {
                return;
            }
            moveList("c");
            autoCreateD_list();
            focusTo();
        },
        d: function() {
            if (focusMoveMap.pageUp("d")) {
                return;
            }
            moveList("d");
            focusTo();
        }
    };
    var pressPageDown = {
        a: function() {
            if (focusMoveMap.pageDown("a", CHANNEL_LIST_NAME.length)) {
                return;
            }
            moveList("a");
            args.b_list_begin = channelListMap[findInfo("a", "index")][0];
            moveList("b");
            args.b_list_index = findInfo("b", "begin");
            addCurrent("#b_list" + findInfo("b", "index"))
            autoCreateC_list();
            autoCreateD_list();
            focusTo();
        },
        b: function() {
            if (focusMoveMap.pageDown("b", CHANNEL_LIST_DS.length)) {
                return;
            }
            moveList("b");
            findAIndex();
            args.a_list_begin = Math.max(findInfo("a", "index") - findInfo("a", "fixed"), 0);
            removeListCurrent("a");
            addCurrent("#a_list" + findInfo("a", "index"));
            moveList("a");
            autoCreateC_list();
            autoCreateD_list();
            focusTo();
        },
        c: function() {
            if (focusMoveMap.pageDown("c", findInfo("c", "total")) || isCfavF) {
                return;
            }
            moveList("c");
            autoCreateD_list();
            focusTo();
        },
        d: function() {
            if (focusMoveMap.pageDown("d", schedule_ds.length)) {
                return;
            }
            moveList("d");
            focusTo();
        }
    };
    var pressOk = {
        b: function() {
            b_listOk();
        },
        c: function() {},
        d: function() {
            var type = $("#d_list" + findInfo("d", "index")).attr("type");
            if (type === "live") {
                playLiveOrRec();
            } else if (type === "reserve") {
                var nowChannelInfo = CHANNEL_LIST_DS[findInfo("b", "index")];
                if (reserveData[nowChannelInfo.channelId + "-" + new $.Date(schedule_ds[findInfo("d", "index")].starttime).format("yyyyMMddhhmm")]) {
                    (function(d_index) {
                        var startTimeText = new $.Date(schedule_ds[d_index].starttime).format("yyyyMMddhhmm");
                        $.reserve.remove(startTimeText, function(data) {
                            $("#d_list" + d_index + ".reserve .state").removeClass("hasReserve").html("预约");
                            reserveData[nowChannelInfo.channelId + "-" + startTimeText] = 0;
                        }, function() {});
                    })(findInfo("d", "index"));
                } else {
                    (function(d_index) {
                        var startTimeText = new $.Date(schedule_ds[d_index].starttime).format("yyyyMMddhhmm");
                        $.reserve.add(nowChannelInfo.channelId, schedule_ds[d_index].text, startTimeText, function(data) {
                            $("#d_list" + d_index + ".reserve .state").addClass("hasReserve").html("已预约");
                            reserveData[nowChannelInfo.channelId + "-" + startTimeText] = 1;
                        }, function() {}, function(data) {
                            $("#d_list" + d_index + ".reserve .state").addClass("hasReserve").html("已预约");
                            reserveData[nowChannelInfo.channelId + "-" + startTimeText] = 1;
                            reserveData[data.channelId.channelId + "-" + data.startTime] = 0;
                        }, function() {});
                    })(findInfo("d", "index"));
                }
            } else {
                var data = schedule_ds[findInfo("d", "index")];
                data.starttime = data.starttime.split("-").join("").split(" ").join("").split(":").join("").slice(0, 12);
                data.endtime = data.endtime.split("-").join("").split(" ").join("").split(":").join("").slice(0, 12);
                // return
                $.playLiveOrRec({
                    channelId: CHANNEL_LIST_DS[findInfo("b", "index")].channelId,
                    startTime: data.starttime,
                    endTime: data.endtime
                });
            }
        }
    };
    function playLiveOrRec() {
        var channelId = CHANNEL_LIST_DS[findInfo("b", "index")].channelId;
        if(!channelId) {
            return;
        }
        $.playLiveOrRec({
            channelId: channelId
        });
    }
    var focusMoveMap = {
        up: function(listState) {
            if (listState === "b" && findInfo("b", "index") === 0) {
                args["a_list_begin"] = CHANNEL_LIST_NAME.length - 4;
                args["b_list_begin"] =(CHANNEL_LIST_DS.length - 4) - 1;
                $("#b_list" + args.b_list_index  + " .moreSelect").hide();
                args.a_list_index = CHANNEL_LIST_NAME.length - 1;
                args.b_list_index = (CHANNEL_LIST_DS.length - 1) + 1;
            } else if(findInfo(listState, "index") === 0){
                return true;
            }                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
            if (findInfo(listState, "index") === findInfo(listState, "begin") + findInfo(listState, "fixed") && findInfo(listState, "begin") > 0 || findInfo(listState, "index") === findInfo(listState, "begin")) {
                args[listState + "_list_begin"]--;
            }
            args[listState + "_list_index"]--;
        },
        down: function(listState, listLength) {
            if (listState === "b" && findInfo("b", "index") === listLength - 1) {
                args["b_list_begin"] = args["a_list_begin"] = args.a_list_index = 0;
                $("#b_list" + args.b_list_index  + " .moreSelect").hide();
                args.b_list_index = -1;
            } else if(findInfo(listState, "index") === listLength - 1) {
                return true;
            }
            if (findInfo(listState, "index") === findInfo(listState, "begin") + findInfo(listState, "fixed")) {
                args[listState + "_list_begin"]++;
            }
            args[listState + "_list_index"]++;
        },
        pageUp: function(listState) {
            if (findInfo(listState, "begin") === 0) {
                return true;
            }
            var preBegin = findInfo(listState, "begin");
            args[listState + "_list_begin"] -= findInfo(listState, "size") - findInfo(listState, "shadow");
            if (findInfo(listState, "begin") < 0) {
                args[listState + "_list_begin"] = 0;
            }
            var nowBegin = findInfo(listState, "begin");
            var dis = preBegin - nowBegin;
            args[listState + "_list_index"] -= dis;
        },
        pageDown: function(listState, listLength) {
            if (findInfo(listState, "begin") === listLength - findInfo(listState, "fixed") - 1) {
                return true;
            }
            var preBegin = findInfo(listState, "begin");
            args[listState + "_list_begin"] += findInfo(listState, "size") - findInfo(listState, "shadow");
            if (findInfo(listState, "begin") > listLength - findInfo(listState, "fixed") - 1) {
                args[listState + "_list_begin"] = listLength - findInfo(listState, "fixed") - 1;
            }
            var nowBegin = findInfo(listState, "begin");
            var dis = nowBegin - preBegin;
            args[listState + "_list_index"] += dis;
        }
    };
    function moveList(listState) {                                                                                                                              
        args["$" + listState + "_list_wrap"].css({
            "-webkit-transform": "translateY(" + -findInfo(listState, "begin") * listLineHeightObj[listState] + "px)"
        });
    }
    var getBillTimer = null;
    function autoGetLiveInfo() {
        clearTimeout(getBillTimer);
        getBillTimer = setTimeout(function() {
            getLiveInfo();
        }, 500);
    }
    function getLiveInfo() {
        var begin = findInfo("b", "begin");
        var end = Math.min(begin + findInfo("b", "size"), CHANNEL_LIST_DS.length);
        var index = begin;
        function getBill() {
            if (liveInfoLock["#b_list" + index]) {
                nextBill();
            } else {
                var chanId = CHANNEL_LIST_DS[index].channelId;
                var now = "";
                var billDate = "";
                if (chanId === channelId && tvodStartTime) {
                    var preDate = new $.Date().parse(tvodStartTime + "00", "yyyyMMddhhmmss");
                    now = preDate.format("yyyy-MM-dd hh:mm:ss");
                    billDate = preDate.format("yyyy-MM-dd");
                } else {
                    var nowDate = new $.Date();
                    now = nowDate.format("yyyy-MM-dd hh:mm:ss");
                    billDate = nowDate.format("yyyy-MM-dd");
                }
                getPlayBill({
                    date: billDate,
                    id: chanId
                }, {
                    success: function(data) {
                        $.UTIL.each(data.programs, function(v, i) {
                            var startTime = v.starttime;
                            var endTime = v.endtime;
                            if (now >= startTime && now < endTime) {
                                $("#b_list" + index + " .liveInfo").html(v.text);
                                liveInfoLock["#b_list" + index] = true;
                            }
                        });
                        nextBill();
                    },
                    error: function() {
                        $("#b_list" + index + " .liveInfo").html("暂无信息");
                        liveInfoLock["#b_list" + index] = true;
                        nextBill();
                    }
                });
            }
        }
        function nextBill() {
            index++;
            if (index > end - 1) {
                return true;
            }
            getBill();
        }
        getBill();
    }
    function findAIndex() {
        for (var i = 0; i < CHANNEL_LIST_NAME.length; i++) {
            if (findInfo("b", "index") >= channelListMap[i][0] && findInfo("b", "index") < channelListMap[i][1]) {
                args.a_list_index = i;
                break;
            }
        }
    }
    function pannelVisible(show) {
        if (show) {
            autoHide.show();
        } else {
            autoHide.hide();
        }
    }
    function setInfo(opt) {
        loadCfav()
        tvodIndex = undefined;
        tvodStartTime = opt.tvodStartTime || "";
        if (tvodStartTime) {
            var now = new $.Date().setHours(0, 0, 0, 0);
            var curr = new $.Date().parse(tvodStartTime, "yyyyMMdd").getTime();
            args.c_list_fixIndex = (now - curr) / (1e3 * 60 * 60 * 24);
        }
    }
    var transDate = {
        getYear: function(t) {
            return t.substring(0, 4);
        },
        getMonth: function(t) {
            return t.substring(4, 6);
        },
        getDay: function(t) {
            return t.substring(6, 8);
        },
        getHour: function(t) {
            return t.substring(8, 10);
        },
        getMinute: function(t) {
            return t.substring(10, 12);
        }
    };
    return {
        key: key,
        dft: true,
        keysDftMap: [ "KEY_OK" ],
        keysMap: {
            KEY_LEFT: function() {
                pannelVisible(true);
                pressLeft[listState] && pressLeft[listState]();
                return true;
            },
            KEY_RIGHT: function() {
                pannelVisible(true);
                pressRight[listState] && pressRight[listState]();
                return true;
            },
            KEY_UP: function() {
                pannelVisible(true);
                pressUp[listState] && pressUp[listState]();
                return true;
            },
            KEY_DOWN: function() {
                pannelVisible(true);
                pressDown[listState] && pressDown[listState]();
                return true;
            },
            KEY_PAGEUP: function() {
                pannelVisible(true);
                pressPageUp[listState] && pressPageUp[listState]();
                return true;
            },
            KEY_PAGEDOWN: function() {
                pannelVisible(true);
                pressPageDown[listState] && pressPageDown[listState]();
                return true;
            },
            KEY_OK: function() {
                if (mp.isState($.MP.state.paused)) {
                    $.pTool.get("advertPause").deactive();
                    $.pTool.get("progress").hidePauseTip();
                    mp.resume();                    
                    return true;
                }
                if (isActive) {
                    if (pressOk[listState] && pressOk[listState]()) {
                        pannelVisible(true);
                    }
                } else {
                    if (isCanShow) {
                        secondClickB = true;
                        $focus.show();
                        addLiveIcon();
                        addIcon();
                        pannelVisible(true);
                        $.pTool.active(key);
                        addCurrent("#b_list" + args.b_list_index);
                        $("#b_list" + args.b_list_index  + " .moreSelect").show();
                        upCfav();
                    }
                }
                return true;
            },
            KEY_RETURN: function() {
                pannelVisible(false);
                return true;
            }
        },
        changeMp: function(player) {
            mp = player;
        },
        init: function(pipPlayer) {
            pipPlay = pipPlayer;
            $.reserve.all(function(data) {
                $.UTIL.each(data.data, function(value, index) {
                    reserveData[value.channelId.channelId + "-" + value.startTime] = 1;
                });
                $.s.chanfav.all(null, {
                    success: function(data) {
                        isCanShow = true;
                        var favDataAll = data.data;
                        if (data && favDataAll) {
                            $.UTIL.each(favDataAll, function(value, index) {
                                cfavData[value.channelId] = 1;
                            });
                        }
                        initDom();
                    },
                    error: function() {
                        isCanShow = true;
                        initDom();
                    }
                });
            });
            return this;
        },
        setInfo: setInfo,
        active: function() {
            var volTag=$.pTool.get("advertVolume").getShowTag()
            var pauseTag=$.pTool.get("advertPause").getShowTag()
            var channelTag=$.pTool.get("advertRightBottom").getShowTag()
            if(volTag){$.pTool.get("advertVolume").deactive()}
            if(pauseTag){$.pTool.get("advertPause").deactive()}
            if(channelTag){$.pTool.get("advertRightBottom").deactive()}
            isActive = true;
            moveList("b");
            removeListCurrent("a");
            removeListCurrent("c");
            addCurrent("#a_list" + findInfo("a", "index"));
            moveList("a");
            dateData();
            args.c_list_index = tvodStartTime ? findInfo("c", "fixIndex") : 0;
            args.c_list_begin = Math.max(findInfo("c", "index") - findInfo("c", "fixed"), 0);
            createC_list();
            moveList("c");
            autoCreateD_list();
            focusTo();
            setTimeout(function() {
                $focus.css({
                    transition: "0.3s"
                });
            }, 100);
        },
        deactive: function() {
            isActive = false;
            pannelVisible(false);
        },
        cover: function() {},
        uncover: function() {},
        destroy: function() {},
        getInfo: function() {
            return {
                isActive: isActive,
                channelInfo: CHANNEL_LIST_DS[findInfo("b", "index")],
                liveChannelInfo: CHANNEL_LIST_DS[saveArgs.b_list_index]
            };
        }
    };
}());

$.pTool.add("changeChannel", function() {
    var toolKey = "changeChannel";
    var preChannel = "";
    return {
        key: toolKey,
        dft: true,
        keysDftMap: [ "KEY_RELIVE" ],
        keysMap: {
            KEY_RELIVE: function() {
                if (preChannel) {
                    $.playLiveOrRec({
                        channelId: preChannel
                    });
                }
                return true;
            }
        },
        addPreChannel: function(channelId) {
            preChannel = channelId;
        },
        init: function(opt) {},
        active: function() {},
        deactive: function() {}
    };
}());