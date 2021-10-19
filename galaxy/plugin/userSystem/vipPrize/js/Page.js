(function (factory) {
    $.pTool.add("us_vipPrize", factory());
})(function () {
    var key = "us_vipPrize";
    var activePop = "prize";
    var activeKey = "left";
    var $prize = null;
    var $address = null;
    var info = {};
    var upDataCb = function () {};
    var finishCb = function () {};
    var initDom = {
        prize: function () {
            if (!$prize) {
                $prize = $('<div id="us_vipPrize_prize" class="hide">' + '<div class="prizeName item"></div>' + '<div class="recCondition item">领取条件: <span></span></div>' + '<div class="recGrade item">领取等级: <span></span></div>' +
                    '<div class="remainNum item">剩余数量: <span></span></div>' + '<div class="prizeType item"></div>' + '<div class="des item">相关介绍: <span></span></div>' + '<div class="warning item">温馨提示: <span></span></div>' +
                    '<div class="left btn">确定领取</div>' + '<div class="right btn">取消领取</div>' + "</div>");
                $prize.appendTo("body");
            }
        },
        address: function () {
            if (!$address) {
                $address = $('<div id="us_vipPrize_address" class="hide">' + '<div class="address"></div>' + '<div class="tel"></div>' + '<div class="username"></div>' + '<div class="left btn">确认兑换</div>' + '<div class="right btn">修改信息</div>' + "</div>");
                $address.appendTo("body");
            }
        }
    };

    function focusTo() {
        $.focusTo({
            el: "#us_vipPrize_" + activePop + " ." + activeKey
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
        if (info.GIFTTYPE === "2" || info.GIFTTYPE === "3") {
            sucMsg = "恭喜领取成功，请到‘我的-我的卡券包’中查看使用！"
        } else if (info.GIFTTYPE === "4") {
            sucMsg = info.COUPONTYPE === '3' ? "恭喜领取成功，请到‘我的奖品’查看使用！" : "恭喜领取成功，请到‘我的消息’查看使用！";
        } else if (info.GIFTTYPE === "1") {
            sucMsg = "恭喜您领取成功，请注意查收快递！"
        }
        $.pTool.deactive(key);
        USER_SERVCICE.holdGift({
            giftid: info.GIFTINFO_ID
        }, {
            success: function (result) {
                console.log(result)
                if (result.code == 1e3) {
                    finishCb();
                    us_cue && us_cue.show({
                        type: 1,
                        text: sucMsg
                    });
                } else {
                    if (result.code == 1014) {
                        us_cue && us_cue.show({
                            type: 2,
                            text: "礼品不存在。"
                        });
                    } else if (result.code == 1015) {
                        us_cue && us_cue.show({
                            type: 2,
                            text: "会员礼品不足。"
                        });
                    } else if (result.code == 1016) {
                        us_cue && us_cue.show({
                            type: 2,
                            text: "不满足会员礼品领取条件。"
                        });
                    } else if (result.code == 1017) {
                        us_cue && us_cue.show({
                            type: 2,
                            text: "该奖品无法重复领取。"
                        });
                    } else if (result.code == 1018) {
                        us_cue && us_cue.show({
                            type: 2,
                            text: "达到礼品最多领取次数。"
                        });
                    } else if (result.code == 1023) {
                        us_cue && us_cue.show({
                            type: 2,
                            text: "卡券投放失败，请联系客服96655处理。"
                        });
                    } else {
                        us_cue && us_cue.show({
                            type: 2,
                            text: "领取失败，请您稍后重试。"
                        });
                    }
                }
            },
            error: function (res) {
                console.log('error', res)
                us_cue && us_cue.show({
                    type: 2,
                    text: "领取失败，请您稍后重试。"
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
                $.pTool.active("us_vipPrize");
                showAddress();
            },
            unFinishCb: function () {}
        });
        $.pTool.active("us_address");
    }

    function showAddress() {
        hide();
        show("address");
        $("#us_vipPrize_address .address").html(info.LINKADDRESS);
        $("#us_vipPrize_address .tel").html(info.LINKTEL);
        $("#us_vipPrize_address .username").html(info.LINKNAME);
        focusTo();
    }

    function renderInfo() {
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
        if (info.GIFTTYPE === "1") { // 实物
            prizeType = '发放方式: ' + '<span>' + sendType + '</span>';
            warnWrod = '兑换成功后请耐心等待，工作人员会尽快为您发放奖品，注意查收短信！'
        } else { // 虚拟
            prizeType = '使用有效期: ' + '<span>' + (info.ENDDATE && info.ENDDATE.slice(0, 10) || '') + '</span>';
            if (info.GIFTTYPE === "2") { //卡密
                warnWrod = '兑换成功后请到‘我的卡券包’中查看卡密并激活。'
            } else if (info.GIFTTYPE === "3") { // 优惠券
                warnWrod = '兑换成功后请到‘我的卡券包’中查看优惠券并激活。'
            } else if (info.GIFTTYPE === "4") { // 三方卡券
                warnWrod = info.COUPONTYPE === '3' ? '兑换成功后请及时到“我的奖品”中查看二维码领取使用。' : '兑换成功后请及时到“消息”中查看并领取。';
            }
        }
        var level = '';
        if (info.GIFTLEVEL === "1") {
            level = '青铜会员'
        } else if (info.GIFTLEVEL === "2" || info.GIFTLEVEL === "4") {
            level = '白银会员'
        } else if (info.GIFTLEVEL === "3" || info.GIFTLEVEL === "5") {
            level = '黄金会员'
        }
        var des = $.substringElLength(info.INTRODUCTION, "19px", "640px").last || "";
        $("#us_vipPrize_prize .prizeName").html((info.GIFTNAME || ''));
        $("#us_vipPrize_prize .recGrade span").html(level);
        $("#us_vipPrize_prize .recCondition span").html((info.GETCONDITION || ''));
        $("#us_vipPrize_prize .remainNum span").html((info.GIFTNUM || 0));
        $("#us_vipPrize_prize .prizeType").html(prizeType);
        $("#us_vipPrize_prize .des span").html(des);
        $("#us_vipPrize_prize .warning span").html(warnWrod);
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
                        if (info.GIFTLEVEL == 4) {
                            info.GIFTLEVEL = 2;
                        } else if (info.GIFTLEVEL == 5) {
                            info.GIFTLEVEL = 3;
                        }
                        if (info.GIFTLEVEL > info.LEVEL) {
                            us_cue && us_cue.show({
                                type: 2,
                                text: "不满足会员礼品领取条件"
                            });
                            $.pTool.deactive(key);
                        } else {
                            if (info.GIFTTYPE === '1') {
                                if (info.LINKADDRESS && info.LINKTEL && info.LINKNAME) {
                                    showAddress();
                                } else {
                                    editAddress();
                                }
                            } else if (info.GIFTTYPE === '2' || info.GIFTTYPE === '3' || info.GIFTTYPE === '4') {
                                getPrize();
                            }
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
        },
        active: function () {
            activePop = "prize";
            show(activePop);
            renderInfo();
            var prizeMarquee = new $.Marquee();
            setTimeout(function () {
                prizeMarquee({
                    el: $("#us_vipPrize_prize .prizeName")[0]
                });
            }, 50);
            focusTo();
        },
        deactive: function () {
            hide();
        },
        cover: function () {},
        uncover: function () {},
        destroy: function () {}
    };
});