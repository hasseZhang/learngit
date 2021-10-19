$.pTool.add("progress", function() {
    var key = "progress", autoHide, moveStatus, mp, paramCurr = 0, paramPercent = 0, videoName = "暂无信息", isTry = false, $panel, $title, $videoName, $progress, $try, $progressBar, $infos, $pointer, $pauseTip;
    var isShow = false;
    var hisCueIsShow = function() {
        return false;
    };
    function initDom() {
        if (!$panel) {
            $panel = $('<div class="control-panel hide"></div>').appendTo("body");
            $title = $('<div class="title"><span class="playing">正在播出：</span></div>').appendTo($panel);
            $videoName = $('<span class="videoName"></span>').appendTo($title);
            $progress = $('<div class="progress"></div>').appendTo($panel);
            $progressBar = $('<div class="progressBar"></div>').appendTo($progress);
            $infos = $('<div class="infos"></div>').appendTo($panel);
            $pointer = $('<div class="pointer"></div>').appendTo($panel);
            $pauseTip = $('<div class="pauseTip hide"></div>').appendTo("body");
            autoHide = $.AutoHide({
                dom: $panel,
                delay: 3e3,
                beforeShow: function() {
                    $.pTool.active(key);
                    $videoName.html(videoName);
                    isShow = true;
                    $pauseTip.hide();
                },
                afterHide: function() {
                    $.pTool.deactive(key);
                    isShow = false;
                    if ($.MP.state.seeking) {
                        $pointer.removeClass("forward rewind pause");
                    }
                    if (mp.isState($.MP.state.paused)) {
                        $pointer.removeClass("pause");
                        $pauseTip.show();
                    }
                }
            });
        }
        if ($pauseTip) {
            $pauseTip.hide();
        }
    }
    function transferTime(t) {
        return toTwo(Math.floor(t % 86400 / 3600)) + ":" + toTwo(Math.floor(t % 86400 % 3600 / 60)) + ":" + toTwo(t % 60);
    }
    function toTwo(n) {
        return n < 10 ? "0" + n : "" + n;
    }
    function updateProgress(param) {
        paramCurr = param.curr;
        paramPercent = param.percent;
        $progressBar.attr({
            nowTime: transferTime(param.curr)
        }).css({
            width: param.percent + "%"
        });
        if (mp.isState($.MP.state.progress)) {
            $pointer.removeClass("forward rewind");
        }
    }
    function updateSeeking(param) {
        if(isTry && (param.curr >= 360)){
            param.curr = 360;
            param.percent = (param.curr / param.total) * 100;
        }
        updateProgress(param);
        if (moveStatus === "rewind") {
            $pointer.removeClass("forward pause").addClass("rewind");
        } else if (moveStatus === "forward") {
            $pointer.removeClass("rewind pause").addClass("forward");
        }
    }
    function setTotal(total) {
        $infos.html(transferTime(total));
    }
    function pannelVisible(show) {
        if (show) {
            autoHide.show();
        } else {
            autoHide.hide();
        }
    }
    function rewind() {
        if (isPlayAd) {
            return true;
        }
        if (hisCueIsShow()) {
            playFromStart();
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
        if(volTag){$.pTool.get("advertVolume").deactive()}
        if(pauseTag){$.pTool.get("advertPause").deactive()}
        return true;
    }
    function forward() {
        if(isPlayAd){
            return true;
        }
        pannelVisible(true);
        $progressBar.removeClass("pauseBar");
        if(isTry && paramCurr >= 360){
            return true;
        }
        if (paramPercent !== 100) {
            moveStatus = "forward";
            mp.forward();
        }
        var volTag=$.pTool.get("advertVolume").getShowTag()
        var pauseTag=$.pTool.get("advertPause").getShowTag()
        if(volTag){$.pTool.get("advertVolume").deactive()}
        if(pauseTag){$.pTool.get("advertPause").deactive()}
        return true;
    }
    function hideplay() {
        $(".pauseTip").hide();
    }
    function playFromStart() {
        hideplay();
        if (paramPercent !== 0) {
            mp.playFromStart();
            pannelVisible(true);
        }
    }
    function playFromEnd() {
        hideplay();
        if (paramPercent !== 100) {
            mp.playFromEnd();
            pannelVisible(true);
        }
    }
    function pauseOrResume() {
        pannelVisible(true);
        mp.pauseOrResume();
        var volTag=$.pTool.get("advertVolume").getShowTag();
        if(volTag){$.pTool.get("advertVolume").deactive();} 
        if (mp.isState($.MP.state.paused)) {
            initPauseAd();                      		               
            $pointer.removeClass("forward rewind");                    
            $progressBar.addClass("pauseBar");	
            //$pointer.removeClass("forward rewind").addClass("pause");
        } else {
            $.pTool.get("advertPause").deactive();
            $progressBar.removeClass("pauseBar");
            $pointer.removeClass("pause");
        }
    }

    function initPauseAd(){
        //暂停	
        getCommonAd(4,function(data) {
            var obj = {}
            if (data && data.type=="1" && data.resourceid) {
                obj = {
                    type: 'pic',
                    mp: mp,
                    picPath: $.getVariable("EPG:pathPic") + '/' + top.getFTPFilePath(data.resourceid,data.extension),
                }
                $.pTool.get('advertPause').init(obj);
                $.pTool.get('advertPause').active();			
            }else{
                obj.picPath=""
                $.pTool.get('advertPause').init(obj);	
            }
        });						
    }
    function initVolumeAd(){
        //音量
        var obj={};
        var tag = $.pTool.get("advertPause").getShowTag();
		obj = {
			type: 'pic',
			mp: mp,
            picPath: ""
        }
        $.pTool.get('advertVolume').init(obj);		
        getCommonAd(3,function(data) {
            if (data && data.type=="1" && data.resourceid) {
                obj = {
                    type: 'pic',
                    mp: mp,
                    picPath: $.getVariable("EPG:pathPic") + '/' + top.getFTPFilePath(data.resourceid,data.extension),
                }					
                $.pTool.get('advertVolume').setPic(obj);
                $.pTool.get('advertVolume').active();
                if(tag){
                    $.pTool.get("advertPause").hidden();
                }else{
                    $.pTool.get("advertPause").deactive();
                }				
            }else{
                obj.picPath=""
                $.pTool.get('advertVolume').setPic(obj);	
            }
        });	
    }
    // 广告
    function getCommonAd(typ,cb) {
        // 1：视频前贴片广告
        // 2：换台标版广告
        // 3：音量标版广告
        // 4：暂停标版广告
        // 5：退出标版广告
        // 9：回看贴片广告
        $.getHelper("provider:ad").ad.getVodAd({
            action: typ,
            playType: 1,
            categoryid: $.page.categoryId?$.page.categoryId:"",
            contentid: $.page.seriesId?$.page.seriesId:$.page.contentId?$.page.contentId:"",
            callback: cb
        });
    }

    return {
        key: key,
        dft: true,
        keysDftMap: [ "KEY_RETURN", "KEY_LEFT", "KEY_FAST_REWIND", "KEY_RIGHT", "KEY_FAST_FORWARD", "KEY_VOLUME_UP", "KEY_VOLUME_DOWN", "KEY_MUTE","KEY_PAUSE_PLAY", "KEY_PAGEUP", "KEY_PAGEDOWN", "KEY_OK", "GK" ],
        keysMap: {
            KEY_LEFT: rewind,
            KEY_FAST_REWIND: rewind,
            KEY_RIGHT: forward,
            KEY_FAST_FORWARD: forward,
            KEY_VOLUME_UP: function(){
                var vol=mp.getVolume()+5;						
                if(vol<=0){
                    $.pTool.get("advertVolume").deactive();
                }else{
                    initVolumeAd();
                }
            },
            KEY_VOLUME_DOWN: function(){
                var vol=mp.getVolume()-5;						
                if(vol<=0){
                    $.pTool.get("advertVolume").deactive();
                }else{
                    initVolumeAd();
                }					
            },
            KEY_MUTE: function () {
                $.pTool.get("advertVolume").deactive();
                // if(!mp.getMuteFlag()){
                //     $.pTool.get("advertVolume").deactive();
                // }else{
                //     //setTimeout(function(){initVolumeAd()},100)
                //     $.pTool.get("advertPause").deactive();
                // }
            },
            KEY_PAUSE_PLAY: function() {
                if(isPlayAd){
                    return true;
                }                
                pauseOrResume();                
                return true;
            },
            KEY_OK: function() {
                if(isPlayAd){
                    return true;
                }
                if (isShow) {
                    if (mp.isState($.MP.state.paused)) {
                        mp.resume();
                        $.pTool.get("advertPause").deactive();
                        $progressBar.removeClass("pauseBar");
                        $pauseTip.hide();
                    }
                    pannelVisible(false);
                } else {
                    pauseOrResume();
                }
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
                if(isPlayAd){
                    return true;
                }
                pannelVisible(true);
                playFromStart();
                moveStatus = "rewind";
                return true;
            },
            KEY_PAGEDOWN: function() {
                if(isPlayAd){
                    return true;
                }
                pannelVisible(true);
                playFromEnd();
                moveStatus = "forward";
                return true;
            },
            GK: function(){
                  if(isPlayAd){
                    return true;
                }
            }
        },
        init: function(player) {
            initDom();
            mp = player;
            mp.sub($.MP.state.progress, updateProgress);
            mp.sub($.MP.state.seeking, updateSeeking);
            mp.once($.MP.state.loaded, function(param) {
                top.out("load:" + param.total);
                setTotal(param.total);
                if (isTry && !$try) {
                    $try = $('<div class="try"></div>').css({
                        left: 360 / param.total * 1652 - 14 + "px"
                    }).appendTo($progress);
                }
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
            opt && opt.videoName && (videoName = opt.videoName);
            opt && opt.isTry && (isTry = opt.isTry);
            opt && opt.hisCueIsShow && (hisCueIsShow = opt.hisCueIsShow);
            // opt && opt.isPlayAd && (isPlayAd = opt.isPlayAd);
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
        hidePauseTip: function() {
            if ($pauseTip) {
                $pauseTip.hide();
            }
        },
        c_forward: function(time) {
            if(isPlayAd){
                return true;
            }
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
            if(isPlayAd){
                return true;
            }
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
            if(isPlayAd){
                return true;
            }
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
            if(isPlayAd){
                return true;
            }
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

function p_trySee() {
    var key = "p_trySee";
    var gotoOrder = null;
    var $dom = null;
    var autoHide = null;
    var isShow = false;
    function initDom() {
        if (!$dom) {
            $dom = $('<div class="trySee hide"></div>').appendTo("body");
            autoHide = $.AutoHide({
                dom: $dom,
                delay: 6e3,
                beforeShow: function() {
                    isShow = true;
                },
                afterHide: function() {
                    isShow = false;
                }
            });
        }
    }
    return {
        key: key,
        dft: true,
        keysDftMap: [ "KEY_OK" ],
        keysMap: {
            KEY_OK: function() {
                gotoOrder && gotoOrder();
                return true;
            }
        },
        init: function(opt) {
            initDom();
            gotoOrder = opt.fn;
            return this;
        },
        hide: function() {
            autoHide.hide();
        },
        active: function() {
            autoHide.show();
        },
        deactive: function() {},
        cover: function() {},
        uncover: function() {},
        destroy: function() {},
        getInfo: function() {
            return {
                isShow: isShow
            };
        }
    };
}