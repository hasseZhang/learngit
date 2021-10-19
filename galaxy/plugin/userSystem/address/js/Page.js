(function(factory) {
    $.pTool.add("us_address", factory());
})(function() {
    var key = "us_address";
    var $pop = null;
    var yesTxt = "";
    var noTxt = "";
    var finishCb = function() {};
    var unFinishCb = function() {};
    var activeKey = "yes";
    function initDom() {
        if (!$pop) {
            $pop = $('<div id="us_address" class="hide">' + '<img class="QRCode">' + '<div class="yes btn">' + yesTxt + "</div>" + '<div class="no btn">' + noTxt + "</div>" + "</div>");
            $pop.appendTo("body");
        }
    }
    function focusTo() {
        $.focusTo({
            el: "#us_address ." + activeKey
        });
    }
    function show() {
        if ($pop) {
            $pop.show();
        }
    }
    function hide() {
        if ($pop) {
            activeKey = "yes";
            $pop.hide();
        }
    }
    function getQRCode() {
        USER_SERVCICE.postQRcode({}, {
            success: function(result) {
                if (result.code == 1e3 && result.data) {
                    $("#us_address .QRCode").attr({
                        src: USER_SERVCICE.host + result.data
                    });
                }
            }
        });
    }
    return {
        key: key,
        keysMap: {
            KEY_LEFT: function() {
                if (activeKey === "no") {
                    activeKey = "yes";
                    focusTo();
                }
                return true;
            },
            KEY_RIGHT: function() {
                if (activeKey === "yes") {
                    activeKey = "no";
                    focusTo();
                }
                return true;
            },
            KEY_OK: function() {
                if (activeKey === "yes") {
                    $.pTool.deactive(key);
                    USER_SERVCICE.userinfo({}, {
                        success: function(result) {
                            if (result.code == 1e3 && result.data) {
                                var addInfo = {
                                    LINKNAME: result.data.LINKNAME,
                                    LINKTEL: result.data.LINKTEL,
                                    LINKADDRESS: result.data.LINKADDRESS
                                };
                                if (addInfo.LINKNAME && addInfo.LINKTEL && addInfo.LINKADDRESS) {
                                    finishCb(addInfo);
                                } else {
                                    us_cue && us_cue.show({
                                        type: 2,
                                        text: "尚未完善地址，请完善后重新进行提交。"
                                    });
                                    unFinishCb();
                                }
                            }
                        },
                        error: function() {
                            us_cue && us_cue.show({
                                type: 2,
                                text: "数据请求超时，请返回重试。"
                            });
                            unFinishCb();
                        }
                    });
                } else if (activeKey === "no") {
                    $.pTool.deactive(key);
                }
                return true;
            },
            KEY_RETURN: function() {
                $.pTool.deactive(key);
                return true;
            }
        },
        init: function(opt) {
            if (opt.type == "1") {
                yesTxt = "完成";
                noTxt = "取消";
            } else if (opt.type == "2") {
                yesTxt = "填写完成";
                noTxt = "放弃领奖";
            }
            opt.finishCb && (finishCb = opt.finishCb);
            opt.unFinishCb && (unFinishCb = opt.unFinishCb);
            initDom();
            getQRCode();
        },
        active: function() {
            show();
            focusTo();
        },
        deactive: function() {
            hide();
        },
        cover: function() {},
        uncover: function() {},
        destroy: function() {}
    };
});