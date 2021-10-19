(function (factory) {
    $.pTool.add("us_pointPrize", factory());
})(function () {
    var key = "us_pointPrize";
    var activePop = "prize";
    var activeKey = "left";
    var $prize = null;
    var $address = null;
    var info = {};
    var upDataCb = function () { };
    var finishCb = function () { };
    var noPointCb = function () { };
    var initDom = {
        prize: function () {
            if (!$prize) {
                $prize = $('<div id="us_pointPrize_prize" class="hide">' + '<img class="prizeImg noPic">' + '<div class="prizeName item"></div>' + '<div class="prizePoint item">所需吉豆: <span></span></div>' +
                    '<div class="remainNum item">剩余数量: <span></span></div>' + '<div class="prizeType item"></div>' + '<div class="des item">相关介绍: <span></span></div>' +
                    '<div class="warning item">温馨提示: <span></span></div>' + '<div class="left btn">确定兑换</div>' + '<div class="right btn">取消兑换</div>' + "</div>");
                $prize.appendTo("body");
            }
        },
        address: function () {
            if (!$address) {
                $address = $('<div id="us_pointPrize_address" class="hide">' + '<div class="address"></div>' + '<div class="tel"></div>' + '<div class="username"></div>' + '<div class="left btn">确认兑换</div>' + '<div class="right btn">修改信息</div>' + "</div>");
                $address.appendTo("body");
            }
        }
    };
    function focusTo() {
        $.focusTo({
            el: "#us_pointPrize_" + activePop + " ." + activeKey
        });
    }
    function show(type) {
        activeKey = "left";
        activePop = type;
        initDom[type]();
        if (type === "prize") {
            $prize && $prize.show();
        } else if (type === "address") {
            $address && $address.show();
        }
    }
    function hide() {
        $prize && $prize.hide();
        $address && $address.hide();
    }
    function getPrize() {
        var sucMsg = '兑换成功，请您注意查收消息！';
        var failMsg = '兑换失败，请您稍后重试。';
        if (info.GOODSTYPE === "2" || info.GOODSTYPE === "3") {
            sucMsg = "恭喜兑换成功，请到“我的-我的卡券包”中查看使用！"
        } else if (info.GOODSTYPE === "4") {
            sucMsg = info.COUPONTYPE === '3' ? "恭喜兑换成功，请到“我的奖品”查看使用！" : "恭喜兑换成功，请到“我的消息”查看使用！";
        } else if (info.GOODSTYPE === "1") {
            sucMsg = "恭喜您领取成功，请注意查收快递！"
            failMsg = "领取失败，请您稍后重试。！"
        }
        $.pTool.deactive(key);
        USER_SERVCICE.changePoints({
            goodsId: info.GOODSINFO_ID,
            points: info.GOODSNEEDPOINT
        }, {
            success: function (result) {
                console.log(result)
                if (result.code == 1e3 && result.data) {
                    finishCb(result.data.POINTSUM);
                    us_cue && us_cue.show({
                        type: 1,
                        text: sucMsg
                    });
                } else {
                    if (result.code == 1011) {
                        noPointCb();
                        us_cue && us_cue.show({
                            type: 2,
                            text: "奖品已兑完，请查看其他奖品吧！"
                        });
                    } else if (result.code == 1018 || result.code == 1017) {
                        us_cue && us_cue.show({
                            type: 2,
                            text: "兑换次数已用完，请查看其他奖品吧！"
                        });
                    } else if (result.code == 1010) {
                        us_cue && us_cue.show({
                            type: 2,
                            text: "兑换失败，您的吉豆不足。"
                        });
                    } else if (result.code == 1023) {
                        us_cue && us_cue.show({
                            type: 2,
                            text: "卡券投放失败，请联系客服96655处理。"
                        });
                    } else {
                        us_cue && us_cue.show({
                            type: 2,
                            text: failMsg
                        });
                    }
                }
            },
            error: function () {
                us_cue && us_cue.show({
                    type: 2,
                    text: failMsg
                });
            }
        });
    }
    function editAddress() {
        $.pTool.get("us_address").init({
            type: 2,
            finishCb: function (addInfo) {
                $.UTIL.merge(info, addInfo);
                upDataCb({
                    LINKADDRESS: info.LINKADDRESS,
                    LINKTEL: info.LINKTEL,
                    LINKNAME: info.LINKNAME
                });
                $.pTool.active("us_pointPrize");
                showAddress();
            },
            unFinishCb: function () { }
        });
        $.pTool.active("us_address");
    }
    function showAddress() {
        hide();
        show("address");
        $("#us_pointPrize_address .address").html(info.LINKADDRESS);
        $("#us_pointPrize_address .tel").html(info.LINKTEL);
        $("#us_pointPrize_address .username").html(info.LINKNAME);
        focusTo();
    }
    function renderInfo() {
        console.log(info)
        var des = $.substringElLength(info.INTRODUCTION, "19px", "520px").last || "";
        var sendType = '';
        if (info.GRANTTYPE === "1") {
            sendType = '快递包邮'
        } else if (info.GRANTTYPE === "2") {
            sendType = '快递到付'
        } else if (info.GRANTTYPE === "3") {
            sendType = '邮件'
        } else if (info.GRANTTYPE === "4") {
            sendType = '短信'
        }
        var prizeType = '';
        var warnWrod = '';
        if (info.GOODSTYPE === "1") { // 实物
            prizeType = '发放方式: ' + '<span>' + sendType + '</span>';
            warnWrod = '兑换成功后请耐心等待，工作人员会尽快为您发放奖品，注意查收短信！'
        } else { // 虚拟
            prizeType = '使用有效期: ' + '<span>' + (info.ENDDATE && info.ENDDATE.slice(0, 10) || '') + '</span>';
            if (info.GOODSTYPE === "2") { //卡密
                warnWrod = '兑换成功后请到‘我的卡券包’中查看卡密并激活。'
            } else if (info.GOODSTYPE === "3") { // 优惠券
                warnWrod = '兑换成功后请到‘我的卡券包’中查看优惠券并激活。'
            } else if (info.GOODSTYPE === "4") { // 三方卡券
                warnWrod = info.COUPONTYPE === '3' ? '兑换成功后请及时到“我的奖品”中查看二维码领取使用。' : '兑换成功后请及时到“消息”中查看并领取。';
            }
        }
        $("#us_pointPrize_prize .prizeName").html(info.GOODSNAME);
        $("#us_pointPrize_prize .prizePoint span").html(info.GOODSNEEDPOINT);
        $("#us_pointPrize_prize .remainNum span").html((info.GOODSSURPLUS || 0));
        $("#us_pointPrize_prize .prizeType").html(prizeType);
        $("#us_pointPrize_prize .des span").html(des);
        $("#us_pointPrize_prize .warning span").html(warnWrod);
        $("#us_pointPrize_prize .prizeImg").attr({
            src: info.GOODSPICTURE
        });
    }
    return {
        key: key,
        keysMap: {
            KEY_LEFT: function () {
                if (activeKey === "right") {
                    activeKey = "left";
                    focusTo();
                }
                return true;
            },
            KEY_RIGHT: function () {
                if (activeKey === "left") {
                    activeKey = "right";
                    focusTo();
                }
                return true;
            },
            KEY_OK: function () {
                if (activeKey === "left") {
                    if (activePop === "prize") {
                        if (info.GOODSTYPE === '1') {
                            if (info.LINKADDRESS && info.LINKTEL && info.LINKNAME) {
                                showAddress();
                            } else {
                                editAddress();
                            }
                        } else if (info.GOODSTYPE === '2' || info.GOODSTYPE === '3' || info.GOODSTYPE === '4') {
                            getPrize();
                        }
                    } else if (activePop === "address") {
                        getPrize();
                    }
                } else if (activeKey === "right") {
                    if (activePop === "prize") {
                        $.pTool.deactive(key);
                    } else if (activePop === "address") {
                        editAddress();
                    }
                }
                return true;
            },
            KEY_RETURN: function () {
                $.pTool.deactive(key);
                return true;
            }
        },
        init: function (opt) {
            $.UTIL.merge(info, opt);
            opt.upDataCb && (upDataCb = opt.upDataCb);
            opt.finishCb && (finishCb = opt.finishCb);
            opt.noPointCb && (noPointCb = opt.noPointCb);
        },
        active: function () {
            activePop = "prize";
            show(activePop);
            renderInfo();
            var prizeMarquee = new $.Marquee();
            setTimeout(function () {
                prizeMarquee({
                    el: $("#us_pointPrize_prize .prizeName")[0]
                });
            }, 50);
            focusTo();
        },
        deactive: function () {
            hide();
        },
        cover: function () { },
        uncover: function () { },
        destroy: function () { }
    };
});