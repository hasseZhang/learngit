$.pTool.add("activitiesChannel", function() {
    var $channelName = null;
    var autoHide;
    var toolKey = "activitiesChannel";
    return {
        key: toolKey,
        dft: true,
        keysDftMap: ["KEY_LEFT", "KEY_OK", "KEY_UP", "KEY_DOWN", "KEY_RIGHT"],
        keysMap: {
            KEY_RETURN: function() {
                autoHide.hide();
                return true;
            },
            KEY_RIGHT: function() {
                if(doVipChannel.isWillBuy()){
                    $.auth.forwardOrder(false, false, [isAuth]);
                    return;
                }
                autoHide.show();
                return true;
            },
            KEY_OK: function() {
                autoHide.show();
                return true;
            },
            KEY_LEFT: function() {
                autoHide.show();
                return true;
            },
            KEY_UP: function() {
                autoHide.show();
                return true;
            },
            KEY_DOWN: function() {
                autoHide.show();
                return true;
            },
        },
        init: function(opt) {
            if (!$channelInfo) {
                $channelInfo = $(`<div class="channelName hide">
                                            <span class="ti">正在播放：</span><span class="name"></span>
                                </div>`);
                $channelInfo.appendTo("body");
                $channelName = $(".channelName .name", $channelInfo);
                autoHide = $.AutoHide({
                    dom: $channelInfo,
                    delay: 4e3,
                    beforeShow: function() {
                        $.pTool.active(toolKey);
                    },
                    afterHide: function() {
                        $.pTool.deactive(toolKey);
                    }
                });
            }
            $channelName.html(opt.channelName);
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
 var doVipChannel = (function () {
    var isWillBuy = false;
    var timer;

    function auth(package,channelNum){
        $.auth.auth4Pkg({
            entrance: "",
            package: package,
            callback: function(res) {
                res = res || {};
                $.UTIL.each(res,function(value, key) {
                    // if(key === '1100000241' && value){
                    //     isbigPro = true; //已购买翼视达
                    // }else{
                    //     !value && arr2.push(key)
                    // }
                    if( key && value ){
                        // 订购了
                        mpLoad();
                    }else{
                        // 没有订购
                        isWillBuy = true;
                        channelTry.setCount('');
                        channelTry.show();
                        channelTry.getTryWatch(channelNum);
                        clearInterval(timer);
                      timer = setInterval(function () {
                          channelTry.setCount(channelTry.getTryTime);
                          if (channelTry.getTryTime <= 0) {
                              clearInterval(timer);
                              channelTry.hide();
                              mpStop();
                              $.auth.forwardOrder(false, false, [package[0].chargeId]);
                          }
                          channelTry.getTryTime--;
                      }, 1000);
                      mpLoad();
                    }
                });
                //已购翼视达，过滤掉少儿包影视包
                // arr = isbigPro ? arr2.filter(function(item){
                //     return item !== '1100000381' && item !== '1100000761' 
                // }) : arr2;
                // if(!arr.length){//过滤后没有产品则弹框
                //     $.pTool.active("noCoupon");
                //     Authentication.CTCSetConfig("coupon",1);
                //     return true;
                // }
            }
        })
    }
    return {
        auth,
        isWillBuy: function () {
            return isWillBuy;
        }
    };
})();

var channelTry = (function () {
    var getTryTime = 60;
    function hide(){
        document.getElementById('channelTry').className = 'hide'
    }
    function show() {
        document.getElementById('channelTry').className = ''
    }
    function setCount(value) {
        document.getElementById('channelTry').innerHTML = '<span class="count">' + value + '</span>'
    }
    return {
        hide,
        show,
        setCount,
        getTryTime,
        getTryWatch: function (channelNum) {
            var _this = this;
            var gId = $.getVariable('EPG:isTest') ? '1100003754' : '1100005629';
            $.s.guidance.get({
                id: gId
            }, {
                success: function (data) {
                        var hasId = data.some(function (item) {
                            return item['contentName'] == channelNum
                        })
                        if (!hasId) { 
                            _this.getTryTime = 60
                            return;
                        }
                        for (var i = 0; i < data.length; i++) {
                            if (data[i]['contentName'] == channelNum) {
                                if (!data[i]['contentUri'] || isNaN(data[i]['contentUri'] - 0) || (data[i]['contentUri'] -
                                        0) > 999) {
                                            _this.getTryTime = 60
                                } else {
                                    _this.getTryTime = data[i]['contentUri']
                                }
                                break;
                            }
                        }
                },
                error: function () {
                    _this.getTryTime = 60
                }
            });
        }
    }
}())