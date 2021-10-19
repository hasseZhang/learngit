function getAutoSignStatus(){
    return top.$.autoSignStatus;
}
(function (factory) {
    $.pTool.add("signIn", factory());
})(function () {
    var config = {};
    var $signIn = null;
    var activeKey = "";
    var isActive = false;
    var isShow = false;
    var preActive = "";
    var dates;
    var today;
    var $dailySignIn = null;
    var ptstrmid = null;
    var refreshPage = function(){}
    function createEl() {
        if ($signIn) {
            return;
        }
        $signIn = $('<div id="signIn" class="signIn hide"><div class="returnTip">[返回]<span>键关闭</span></div></div>');
        $datesContainer = $('<div id="datesContainer" class="datesContainer"></div>');
        var date = new Date();
        today = date.getDate();
        // 获取当月的天数
        dates = new Date('' + date.getFullYear(), '' + (date.getMonth() + 1), 0).getDate();
        // 根据日期绘制日期数字
        let html = '';
        for (var i = 1; i <= dates; i++) {

            if (i < today) {
                html += '<div id="data' + (i) + '" class="date"><span class="last">' + (i) + '</span></div>'
            } else if (i === today) {
                html += '<div id="data' + (i) + '" class="date"><span class="today">' + (i) + '</span></div>'
            } else {
                html += '<div id="data' + (i) + '" class="date"><span>' + (i) + '</span></div>'
            }
        }
        for (var j = 1; j <= 35 - dates; j++) {
            html += '<div class="date"><span class="nextMonthDay">' + (j) + '</span></div>'
        }
        $(html).appendTo($datesContainer);
        $datesContainer.appendTo($signIn);
        $signIn.appendTo(config.wrap);
    }
    function signRecordData() {
        USER_SERVCICE.signRecord({}, {
            success: function (result) {
                if (result.code == 1e3 && result.data) {
                    // 拿到签到的日期
                    var signDay = result.data.thisMonth && result.data.thisMonth.split(',')
                    console.log(result.data)
                    console.log(signDay)
                    for (var i = 0; i < signDay.length; i++) {
                        if (signDay[i] != today) {
                            $('#data' + signDay[i]).html('<img src="/pub/galaxy/plugin/signIn/images/signed.png" />');
                        }
                    }
                }
            }
        });
    }
    function holeSignIn(ptstrmid) {
        if (ptstrmid) {
            USER_SERVCICE.holePoints({
                ptstrmid: ptstrmid
            }, {
                success: function (result) {
                    console.log('holePoints:', result)
                    // 状态为1000表示签到成功
                    if (result && result.code == 1e3 && result.data) {
                        getFinish("101", result.data);
                        // 签到成功
                    }
                },
                error: function () {
                    // 处理接口报错的逻辑
                }
            });
        }
    }
    function getFinish() {
        USER_SERVCICE.pointsTask({}, {
            success: function (result) {
                console.log('pointsTask:', result)
                if (result.code == 1e3 && result.data) {
                    $.UTIL.each(result.data, function (value, index) {
                        if (value.bianma == "101") {
                            // bianma: "101"
                            // date: "2021-07-07 17:24:54"
                            // info: "明日+12吉豆"
                            // info2: "今日+11吉豆"
                            // status: "已完成"
                            // title: "连续签到1天"
                            // 展示签到完成的信息
                            console.log(activeKey)
                            if($dailySignIn){
                                console.log(activeKey)
                                $.focusTo({
                                    el: "#" + activeKey
                                });
                                return
                            }
                            $dailySignIn = $('<div id="dailySignIn" class="descContainer"></div>');
                            $('<div class="dailySignInInfo">' + value.title + '</div>').appendTo($dailySignIn)
                            $('<div class="tomorrowSignIn"><img src="/pub/galaxy/plugin/signIn/images/bean.png" />' + value.info + '</div>').appendTo($dailySignIn)
                            $('<div class="todaySignIn"><div class="score">' + value.info2.replace(/[^+0-9]/ig, "") + '</div><div class="sussSign">签到成功</div></div>').appendTo($dailySignIn)
                            if(getAutoSignStatus() === '1'){
                                $('<div id="ifDailySignIn" class="ifDailySignIn"><span class="pick picked"></span><span class="dailySignIn"></span></div>').appendTo($dailySignIn)
                            }else{
                                $('<div id="ifDailySignIn" class="ifDailySignIn"><span class="pick"></span><span class="dailySignIn"></span></div>').appendTo($dailySignIn)
                            }
                            $('<div id="welfareExchange" class="welfareExchange"></div>').appendTo($dailySignIn);
                            $dailySignIn.appendTo($signIn)
                        }
                    });
                    $.focusTo({
                        el: "#" + activeKey
                    });
                }
            }
        });
    }
    return {
        key: "signIn",
        dft: false,
        silenceKeys: [],
        show: function () {
            isShow = true;
            $signIn.removeClass("hide");
        },
        hide: function () {
            isShow = false;
            $signIn.addClass("hide");
        },
        init: function (opt) {
            opt && opt.wrap && (config.wrap = $(opt.wrap)) || (config.wrap = $('body'));
            createEl();
            signRecordData();
        },
        active: function () {
            activeKey = 'welfareExchange';
            this.show();
            isActive = true;
            // 签到任务完成后，即去完成领取积分
            holeSignIn(ptstrmid);
            // getFinish();
        },
        preActive:function(callback,id,refresh){
            var This = this;
            refreshPage = refresh;
            // 有id表示签到已完成，但积分未领取状态
            if(id){
                ptstrmid = id;
                $.pTool.active(This.key);
            }else{
                 // 当开启这个组件的时候，需要判断是否已经签到
               USER_SERVCICE.addPoints({
                pointtype: "101"
            }, {
                success: function (result) {
                    // 调取完成任务接口，若完成操作正常，即表明之前未签到，展示组件
                   if (result && result.code == 1e3 && result.data) {
                        $.UTIL.each(result.data, function (value, index) {
                            if (value.bianma == "101") {
                                ptstrmid = value.ptstrmid;
                                $.pTool.active(This.key)
                            }
                        });
                        // 其余情况该组件都不展示
                    } else {
                        // 1021这个状态表示任务已完成
                        //  任务已完成或着接口异常的时候，该组件不需要展示了
                        $.pTool.deactive('signIn');
                        callback && callback();
                        return true;
                    } 
                },
                error: function () {
                    $.pTool.deactive('signIn');
                     callback && callback();
                        return true;
                }
            });
            }
        },
        deactive: function () {
            this.hide();
            activeKey = '';
            isActive = false;
        },
        isShow:function(){
            return isShow
        },
        cover: function () {
            return true;
        },
        uncover: function () {
            activeKey = preActive;
            return true;
        },
        keysMap: {
            KEY_LEFT: function () {
                return true;
            },
            KEY_RIGHT: function () {
                return true;
            },
            KEY_DOWN: function () {
                if (activeKey === "welfareExchange") {
                    return true
                } else {
                    activeKey = "welfareExchange";
                    $.focusTo({
                        el: "#" + activeKey
                    });

                }
            },
            KEY_UP: function () {
                if (activeKey === "ifDailySignIn") {
                    return true
                } else {
                    activeKey = "ifDailySignIn";
                    $.focusTo({
                        el: "#" + activeKey
                    });

                }
            },
            KEY_OK: function () {
                if (activeKey === "welfareExchange") {
                    //  跳转到福利领取页面
                    $.gotoDetail({
                        contentType: "7",
                        url: "userSystem/prizeList/?currentMenu=WE"
                    });
                }
                if(activeKey === "ifDailySignIn"){
                    // 修改自动签到状态
                    if(getAutoSignStatus() === '1'){
                        $.putAutoSignStatus('0',function(type){
                            if(type === '1'){
                                $("#ifDailySignIn .pick").addClass('picked')
                            }else{
                                $("#ifDailySignIn .pick").removeClass('picked')
                            }
                        })
                    }else{
                        $.putAutoSignStatus('1',function(type){
                            if(type === '1'){
                                $("#ifDailySignIn .pick").addClass('picked')
                            }else{
                                $("#ifDailySignIn .pick").removeClass('picked')
                            }
                    })
                }
            }
                return true;
            },
            KEY_RETURN: function () {
                refreshPage && refreshPage();
                $.pTool.deactive('signIn')
                return true
            }
        }
    };
});