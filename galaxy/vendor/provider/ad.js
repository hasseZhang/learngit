var name = "provider:ad";

var lg = Logger;

var adObj = {};

function enable() {
    var SDK = AD_SDK.get;
    var adInfo = {};
    var exitTimer = locker(ad, 300);
    var volumeTimer = locker(ad, 300);
    var pauseTimer = locker(ad, 300);
    var channelDeBounce = debounce(ad, 200);
    function ad() {
        // var authFlag = getBigInfo();
        // var now = new $.Date().format();
        var opt = adInfo.opt;
        // if (!!authFlag && (opt.action == 1 || opt.action == 9) && authFlag > now) {
        //     opt.callback && opt.callback("");
        //     return;
        // }
        SDK({
            action: opt.action,
            playtype: opt.playType,
            channel: opt.channel || "",
            categoryId: opt.categoryId || "",
            contentId: opt.contentId || "",
            contentName: opt.contentName || "",
            programName: opt.programName || ""
        }, {
            success: function(data) {
                data = data[0]; 
                var type = data.type;
                if (!type) {
                    opt.callback && opt.callback("");
                    return;
                }
                if (type == 1) {
                    var picPath = "" + getFTPFilePath(data.resourceid, data.extension);
                    data.picPath = picPath
                    opt.callback && opt.callback(data);
                    return;
                }
                if (type == 2) {
                    opt.callback && opt.callback(data);
                }
            },
            error: function() {
                opt.callback && opt.callback("");
                return;
            }
        });
    }
    function adDelay(opt) {
        adInfo.opt = opt;
        var action = +opt.action;
        switch (action) {
          case 2:
            channelDeBounce();
            break;

          case 3:
            volumeTimer();
            break;

          case 4:
            pauseTimer();
            break;

          case 5:
            exitTimer();
            break;
        }
    }
    function getVideoAd(opt) {
        if (opt.noAd) {
            opt.callback("");
            return;
        }
        adInfo.opt = {
            action: 1,
            playType: 1,
            categoryId: opt.categoryId,
            contentId: opt.contentId,
            contentName: opt.contentName,
            callback: opt.callback
        };
        ad();
    }
    function getOtherAd(opt) {   
        adInfo.opt = {
            action: opt.action,
            playType: opt.playType,
            channel: opt.channel,
            callback: opt.callback
        };
        ad();
    }
    function getVodAd(opt) {   
        adInfo.opt = {
            action: opt.action,
            playType: opt.playType,
            categoryId: opt.categoryid,
            contentId: opt.contentid,
            callback: opt.callback
        };
        ad();
    }
    function getTvodAd(opt) {
        var time1 = new $.Date().parse(opt.startTime);
        var time2 = new $.Date().parse(opt.endTime);
        if (time2 - time1 <= 12e5 || opt.noAd) {
            opt.callback("");
            return;
        }
        adInfo.opt = {
            action: 9,
            playType: 2,
            channel: opt.channelNum,
            rollStartTime: opt.startTime,
            rollEndTime: opt.endTime,
            callback: opt.callback
        };
        ad();
    }
    function locker(func, wait) {
        var timeout;
        return function() {
            var context = this;
            args = arguments;
            if (!timeout) {
                timeout = setTimeout(function() {
                    timeout = null;
                }, wait);
                func.apply(context, args);
            }
        };
    }
    function debounce(func, wait) {
        var timeout;
        return function() {
            var context = this;
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                func.apply(context);
            }, wait);
        };
    }
    $.UTIL.merge(adObj, {
        getAdInfo: adDelay,
        getVideoAd: getVideoAd,
        getOtherAd: getOtherAd,
        getVodAd: getVodAd,
        getTvodAd: getTvodAd
    });
}

expt.rev = 1;

expt.expire = 0;

expt.ad = adObj;

expt.enable = enable;