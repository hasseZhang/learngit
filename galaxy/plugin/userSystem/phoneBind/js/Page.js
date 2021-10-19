(function (factory) {
    $.pTool.add("us_bindPhone", factory());
})(function () {
    var key = "us_bindPhone";
    var $pop = null;
    var pointNum = 0;
    var finishCb = function () { };
    var unFinishCb = function () { };
    var activeKey = "phoneNum";
    var preFocus = 'veriCode';
    var setVeriCodeTime = 60;
    var veriCodeTime = setVeriCodeTime;
    var veriCodeTimer = null;
    var isCanSendVeriCode = true;
    var nowPhoneNum = "";
    function initDom() {
        if (!$pop) {
            $pop = $('<div id="us_bindPhone" class="hide">' + '<div class="phoneNum"></div>' + '<div class="errTel hide">请输入正确的手机号</div>' + '<div class="veriCode"></div>' + '<div class="getVeriCode">获取验证码</div>' + '<div class="errVeriCode hide">请输入验证码</div>' + '<div class="yes btn">确定</div>' + '<div class="no btn">取消</div>' + "</div>");
            $pop.appendTo("body");
        }
    }
    function focusTo() {
        $.focusTo({
            el: "#us_bindPhone ." + activeKey
        });
    }
    function show() {
        if ($pop) {
            $pop.show();
        }
    }
    function hide() {
        if ($pop) {
            $pop.hide();
        }
    }
    function printNum(num) {
        var lengthLimit = {
            phoneNum: 11,
            veriCode: 4
        };
        if (activeKey === "phoneNum" || activeKey === "veriCode") {
            var nowInput = getInput(activeKey);
            if (nowInput.length < lengthLimit[activeKey]) {
                $("#us_bindPhone ." + activeKey).html(nowInput + num);
            }
            if (activeKey === "phoneNum") {
                $("#us_bindPhone .errTel").hide();
            } else {
                $("#us_bindPhone .errVeriCode").hide();
            }
        }
    }
    function delInput() {
        if (activeKey === "phoneNum" || activeKey === "veriCode") {
            var nowInput = getInput(activeKey);
            if (nowInput.length > 0) {
                $("#us_bindPhone ." + activeKey).html(nowInput.substring(0, nowInput.length - 1));
                $("#us_bindPhone .errTel").hide();
            } else {
                return true;
            }
        } else {
            return true;
        }
    }
    function getInput(type) {
        return $("#us_bindPhone ." + type).html();
    }
    function reset() {
        $("#us_bindPhone .veriCode").html("");
        $("#us_bindPhone .errTel").hide();
        $("#us_bindPhone .errVeriCode").hide();
    }
    return {
        key: key,
        keysMap: {
            GN: function (key, num) {
                printNum(num);
                return true;
            },
            KEY_LEFT: function () {
                if (activeKey === "no") {
                    activeKey = "yes";
                } else if (activeKey === "getVeriCode") {
                    activeKey = "veriCode";
                    preFocus = "veriCode";
                }
                focusTo();
                return true;
            },
            KEY_RIGHT: function () {
                if (activeKey === "yes") {
                    activeKey = "no";
                } else if (activeKey === "veriCode") {
                    activeKey = "getVeriCode";
                    preFocus = "getVeriCode";
                }
                focusTo();
                return true;
            },
            KEY_UP: function () {
                if (activeKey === "yes") {
                    activeKey = "veriCode";
                } else if (activeKey === "veriCode" || activeKey === "getVeriCode") {
                    activeKey = "phoneNum";
                } else if (activeKey === "no") {
                    activeKey = "getVeriCode";
                }
                focusTo();
                return true;
            },
            KEY_DOWN: function () {
                if (activeKey === "phoneNum") {
                    activeKey = preFocus;
                } else if (activeKey === "veriCode" || activeKey === "getVeriCode") {
                    activeKey = "yes";
                }
                focusTo();
                return true;
            },
            KEY_OK: function () {
                if (activeKey === "yes") {
                    var isCanOk = true;
                    if ($("#us_bindPhone .veriCode").html().length) {
                        $("#us_bindPhone .errVeriCode").hide();
                    } else {
                        $("#us_bindPhone .errVeriCode").show();
                        isCanOk = false;
                    }
                    if (/^1[3456789]\d{9}$/.test($("#us_bindPhone .phoneNum").html())) {
                        $("#us_bindPhone .errTel").hide();
                    } else {
                        $("#us_bindPhone .errTel").show();
                        isCanOk = false;
                    }
                    if (isCanOk) {
                        nowPhoneNum = $("#us_bindPhone .phoneNum").html();
                        USER_SERVCICE.blindPhone({
                            phone: nowPhoneNum,
                            checkcode: $("#us_bindPhone .veriCode").html()
                        }, {
                            success: function (result) {
                                if (result.code == 1e3) {
                                    finishCb(nowPhoneNum);
                                }else if(result.code == 1005){
                                    us_cue && us_cue.show({
                                        type: 2,
                                        text: "手机号已绑定其他机顶盒。"
                                    });
                                    unFinishCb();
                                } else if(result.code == 1004){
                                    us_cue && us_cue.show({
                                        type: 2,
                                        text: "手机验证码无效。"
                                    });
                                    unFinishCb();
                                }else if(result.code == 1003){
                                    us_cue && us_cue.show({
                                        type: 2,
                                        text: "手机验证码已过期。"
                                    });
                                    unFinishCb();
                                }else if(result.code == 1006){
                                    us_cue && us_cue.show({
                                        type: 2,
                                        text: "手机号绑定机顶盒已存在"
                                    });
                                    unFinishCb();
                                }else{
                                    us_cue && us_cue.show({
                                        type: 2,
                                        text: "绑定失败，请您稍后重试。"
                                    });
                                    unFinishCb();
                                }
                            },
                            error: function () {
                                us_cue && us_cue.show({
                                    type: 2,
                                    text: "绑定失败，请您稍后重试。"
                                });
                                unFinishCb();
                            }
                        });
                        $.pTool.deactive(key);
                    }
                } else if (activeKey === "no") {
                    $.pTool.deactive(key);
                } else if (activeKey === "getVeriCode" && isCanSendVeriCode) {
                    if (/^1[3456789]\d{9}$/.test($("#us_bindPhone .phoneNum").html())) {
                        USER_SERVCICE.sendCode({
                            phone: $("#us_bindPhone .phoneNum").html()
                        }, {});
                        isCanSendVeriCode = false;
                        $("#us_bindPhone .getVeriCode").html(veriCodeTime + "s");
                        clearInterval(veriCodeTimer);
                        veriCodeTimer = setInterval(function () {
                            veriCodeTime--;
                            if (veriCodeTime === 0) {
                                veriCodeTime = setVeriCodeTime;
                                isCanSendVeriCode = true;
                                $("#us_bindPhone .getVeriCode").html("获取验证码");
                                clearInterval(veriCodeTimer);
                            } else {
                                $("#us_bindPhone .getVeriCode").html(veriCodeTime + "s");
                            }
                        }, 1e3);
                        activeKey = "veriCode";
                        focusTo();
                        $("#us_bindPhone .errTel").hide();
                    } else {
                        $("#us_bindPhone .errTel").show();
                    }
                }
                return true;
            },
            KEY_RETURN: function () {
                if (delInput()) {
                    $.pTool.deactive(key);
                }
                return true;
            }
        },
        init: function (opt) {
            pointNum = opt.pointNum;
            opt.finishCb && (finishCb = opt.finishCb);
            opt.unFinishCb && (unFinishCb = opt.unFinishCb);
            initDom();
        },
        active: function () {
            activeKey = "phoneNum";
            show();
            focusTo();
        },
        deactive: function () {
            reset();
            hide();
        },
        cover: function () { },
        uncover: function () { },
        destroy: function () { }
    };
});