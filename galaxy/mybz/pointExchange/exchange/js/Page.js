var PAGE_INFO = [];
var userId = $.getVariable("EPG:userId");
var verCodeTimer;
var orderId, identCode, phoneNumber;
var serverUrl = $.getVariable('EPG:isTest') ? '10.128.7.100:8008' : '10.128.7.2:8008'
var sendRequestFlag = false; //兑换结果回来之前，不在次发送请求

function genMoble() {
    var prefixArray = new Array("130", "131", "132", "133", "135", "137", "138", "170", "187", "189");
    var i = parseInt(10 * Math.random());
    var prefix = prefixArray[i];
    for (var j = 0; j < 8; j++) {
        prefix = prefix + Math.floor(Math.random() * 10);
    }
    return prefix;
}

function load() {

    // document.getElementById('phoneNumInput').innerHTML = 18904300137;// genMoble();

    createPageInfo();

    // 焦点移动到手机号输入框，激活数字输入
    $.focusTo("phoneNumInput");
    $.pTool.get("inputNum").show();

    // 添加一些ptool
    $.pTool.add('pointNotEnoughModal', pointNotEnoughModal());
    
}
function unload() { }

function createPageInfo() {
    PAGE_INFO.push({
        key: "phoneNumInput",
        pressDown: "phoneVerCodeInput"
    })
    PAGE_INFO.push({
        key: "phoneVerCodeInput",
        pressUp: "phoneNumInput",
        pressRight: function () {
            $.focusTo("getPhoneVerCode");
            enterVerCode();
            $.pTool.get("inputNum").hide();
        },
        pressDown: function () {
            $.focusTo("confirmVerCode");
            $.pTool.get("inputNum").hide();
        }
    })
    PAGE_INFO.push({
        key: "getPhoneVerCode",
        pressUp: function () {
            $.focusTo("phoneNumInput"),
                blurVerCode();
            $.pTool.get("inputNum").show();
        },
        pressLeft: function () {
            $.focusTo("phoneVerCodeInput");
            blurVerCode();
            $.pTool.get("inputNum").show();
        },
        pressDown: function () {
            $.focusTo("confirmVerCode");
            blurVerCode();
        },
        pressOk: function () {
            $.pTool.get("inputNum").show();
            getVerCode();
        }
    })
    PAGE_INFO.push({
        key: "confirmVerCode",
        pressUp: function () {
            $.focusTo("phoneVerCodeInput");
            $.pTool.get("inputNum").show();
        },
        pressRight: "cancleVerCode",
        pressOk: function () {
            confirmVerCode();
        }
    })
    PAGE_INFO.push({
        key: "cancleVerCode",
        pressUp: function () {
            $.focusTo("phoneVerCodeInput");
            $.pTool.get("inputNum").show();
        },
        pressLeft: "confirmVerCode",
        pressOk: function () {
            $.back();
        }
    })
    /* 网络错误弹窗 */
    PAGE_INFO.push({
        key: "tryAgain",
        pressRight: function () {
            $.focusTo("netErrorReturn");
        },
        pressOk: function () {
            $('#netError').hide();
            $.focusTo("confirmVerCode");
        }
    })
    PAGE_INFO.push({
        key: "netErrorReturn",
        pressLeft: function () {
            $.focusTo("tryAgain");
        },
        pressOk: function () {
            $.back();
        }
    })
}

$.pTool.add("inputNum", function () {
    var key = "inputNum", level = 9, _show = function () {
        $.pTool.active(key);
    }, _hide = function () {
        $.pTool.deactive();
    };
    return {
        key: key,
        level: level,
        show: _show,
        hide: _hide,
        keysMap: {
            KEY_RETURN: function () {
                delNum(ACTIVE_OBJECT.key, 'KEY_RETURN');
                return true;
            },
            KEY_0: function () {
                pressNO(ACTIVE_OBJECT.key, 0);
                return true;
            },
            KEY_1: function () {
                pressNO(ACTIVE_OBJECT.key, 1);
                return true;
            },
            KEY_2: function () {
                pressNO(ACTIVE_OBJECT.key, 2);
                return true;
            },
            KEY_3: function () {
                pressNO(ACTIVE_OBJECT.key, 3);
                return true;
            },
            KEY_4: function () {
                pressNO(ACTIVE_OBJECT.key, 4);
                return true;
            },
            KEY_5: function () {
                pressNO(ACTIVE_OBJECT.key, 5);
                return true;
            },
            KEY_6: function () {
                pressNO(ACTIVE_OBJECT.key, 6);
                return true;
            },
            KEY_7: function () {
                pressNO(ACTIVE_OBJECT.key, 7);
                return true;
            },
            KEY_8: function () {
                pressNO(ACTIVE_OBJECT.key, 8);
                return true;
            },
            KEY_9: function () {
                pressNO(ACTIVE_OBJECT.key, 9);
                return true;
            },
            KEY_DELETE: function () {
                delNum(ACTIVE_OBJECT.key, 'KEY_DELETE');
                return true;
            }
        }
    };
}());

function pressNO(type, num) {
    var phoneNum = $('#phoneNumInput').html();
    var phoneVerCodeInput = $('#phoneVerCodeInput').html();
    switch (type) {
        case 'phoneNumInput':
            if (phoneNum == "请输入电信手机号") {
                $('#phoneNumInput').html("");
                phoneNum = $('#phoneNumInput').html();
            }
            if (phoneNum.length < 11) {
                $('#phoneNumInput').html(phoneNum + JSON.stringify(num));
            }
            break;
        case 'phoneVerCodeInput':
            if (phoneVerCodeInput == "请输入验证码") {
                $('#phoneVerCodeInput').html("");
                phoneVerCodeInput = $('#phoneVerCodeInput').html();
            }
            if (phoneVerCodeInput.length < 4) {
                $('#phoneVerCodeInput').html(phoneVerCodeInput + JSON.stringify(num));
            }
            break;
    }
}

function delNum(type, keyType) {
    var phoneNum = $('#phoneNumInput').html();
    var phoneVerCodeInput = $('#phoneVerCodeInput').html();
    switch (type) {
        case 'phoneNumInput':
            if(phoneNum == "请输入电信手机号") return $.back();
            if (phoneNum.length > 0) {
                $('#phoneNumInput').html(phoneNum.substr(0, phoneNum.length - 1));
                if (!(phoneNum.length - 1)) {
                    $('#phoneNumInput').html("请输入电信手机号");
                }
            } else if (phoneNum.length == 0 && keyType == "KEY_RETURN") {
                $.back();
            }
            return true;
        case 'phoneVerCodeInput':
            if(phoneVerCodeInput == "请输入验证码") return $.back();
            if (phoneVerCodeInput.length > 0) {
                $('#phoneVerCodeInput').html(phoneVerCodeInput.substr(0, phoneVerCodeInput.length - 1));
                if (!(phoneVerCodeInput.length - 1)) {
                    $('#phoneVerCodeInput').html("请输入验证码");
                }
            } else if (phoneVerCodeInput.length == 0 && keyType == "KEY_RETURN") {
                $.back();
            }
            break;
        default:
            $.back();
            break;
    }
}

function getVerCode() {
    var phoneNum = $('#phoneNumInput').html();
    if (phoneNum.length != 11) {
        $('#phoneNumDanger').css('display', 'inline-block');
        return false;
    } else {
        $('#phoneNumDanger').css('display', 'none');
    }
    if (!verCodeTimer) {
        $.auth.getCheckCode({
            phone: phoneNum,
            callback: function (res) {
                res ? getCodeSucc() : getCodeFail();
            }
        });
    }
    var getCodeSucc = function () {
        $('#verCodeFrequently').css('display', "none");
        $.focusTo("phoneVerCodeInput");
        document.getElementById("verCodeImg").src = "images/countBg.png";
        var identCodeTimer = 120;
        $('#getPhoneVerCode').html(identCodeTimer + 's');
        verCodeTimer = setInterval(function () {
            identCodeTimer--;
            if (identCodeTimer === 0) {
                $('#getPhoneVerCode').html('');
                document.getElementById("verCodeImg").src = $('#getPhoneVerCode').hasClass("focusBorder") ? "images/getVerCodeFocus.png" : "images/getVerCode.png";
                clearInterval(verCodeTimer);
                verCodeTimer = undefined;
            } else {
                $('#getPhoneVerCode').html(identCodeTimer + 's');
                document.getElementById("verCodeImg").src = "images/countBg.png";
            }
        }, 1e3);
    }
    var getCodeFail = function () {
        $('#verCodeDanger').css('display', "none");
        $('#verCodeFrequently').css('display', "inline-block");
    }
}

function pointNotEnoughModal() {
    var key = "pointNotEnoughModal";
    var keysMap = {
        KEY_RETURN: function () {
            $.forward($.getVariable("EPG:pathPage") + '/pointExchange/list/index.html')
            return true;
        },
        KEY_OK: function () {
            $.forward($.getVariable("EPG:pathPage") + '/pointExchange/list/index.html')
            return true;
        }
    };
    var active = function () {
        $('#cannotPay').css({ display: 'inline-block' });
    };
    return {
        key: key,
        keysMap: keysMap,
        active: active
    };
}

function confirmVerCode() {
    var phoneNum = $('#phoneNumInput').html();
    var phoneVerCodeInput = $('#phoneVerCodeInput').html();
    if (phoneNum.length != 11) {
        $('#phoneNumDanger').css('display', 'inline-block');
        return false;
    } else {
        $('#phoneNumDanger').css('display', 'none');
    }
    if (phoneVerCodeInput.length != 4) {
        $('#verCodeFrequently').css('display', 'none');
        $('#verCodeDanger').css('display', 'inline-block');
        return false;
    } else {
        $('#verCodeDanger').css('display', 'none');
    }
    $.post("http://" + serverUrl + "/orders/checkcode/validate", {
        data: JSON.stringify({
            phoneNumber: phoneNum,
            checkCode: phoneVerCodeInput,
            iptvAccount: userId,
            productId: parseInt($.page.chargeId),
            areaId: top.EPG.areaId,
            price: parseInt($.page.price),
            cycleType: 1
        }),
        timeout: 8e3,
        success: function (res) {
            var res = JSON.parse(res);
            var responseCode = res.responseCode;
            switch (responseCode) {
                case 0:
                    // 成功;
                    var resData = JSON.parse(res.data);
                    orderId = resData.orderId;
                    identCode = phoneVerCodeInput;
                    phoneNumber = phoneNum;
                    comfirmChange(resData);
                    break;
                case 100:
                    // 积分余额不足
                    pointNotEnough(JSON.parse(res.data));
                    break;
                case 602:
                    // 验证码错误
                    $('#verCodeFrequently').css('display', 'none');
                    $('#verCodeDanger').css('display', 'inline-block');
                    break;
                default:
                    $('#netError').show();
                    $.focusTo('tryAgain');
                    break;
            }
        },
        error: function (err) {
            $('#netError').show();
            $.focusTo('tryAgain');
        }
    })
}

function enterVerCode() {
    if (!verCodeTimer) {
        document.getElementById("verCodeImg").src = "images/getVerCodeFocus.png";
    }
}

function blurVerCode() {
    document.getElementById("verCodeImg").src = verCodeTimer ? "images/countBg.png" : "images/getVerCode.png"
}

function pointNotEnough(data) {
    $('#showInfo').html('非常遗憾，您剩余 ' + data.point + ' 积分，本次购买需要支付 <span>' + data.price + '</span> 积分，无法支付！')
    $.pTool.active("pointNotEnoughModal");
}

function comfirmChange(data) {
    $("#showPayShowInfo").html('您剩余 ' + data.point + ' 积分，本次购买需要支付 <span>' + data.price + '</span> 积分呢，是否积分支付？');
    $('#showPay').css({ display: 'inline-block' });
    PAGE_INFO.push({
        key: "confirmOk",
        pressRight: function () {
            $.focusTo("confirmCancle");
        },
        pressBack: function () {
            $('#showPay').css({ display: 'none' });
            $.focusTo('confirmVerCode');
            return true;
        },
        pressOk: function () {
            $('#showPay').css({ display: 'none' });
            confirmChangeOk();
        }
    })
    PAGE_INFO.push({
        key: "confirmCancle",
        pressLeft: function () {
            $.focusTo("confirmOk");
        },
        pressOk: function () {
            $('#showPay').css({ display: 'none' });
            $.focusTo('confirmVerCode');
        },
        pressBack: function () {
            $('#showPay').css({ display: 'none' });
            $.focusTo('confirmVerCode');
            return true;
        }
    })
    $.focusTo('confirmOk');
}

function confirmChangeOk() {
    if(sendRequestFlag) return true;
    sendRequestFlag = true;
    $.auth.payBill({
        payType: 5,
        orderId: orderId,
        checkCode: identCode,
        phone: phoneNumber,
        callback: function (code, data) {
            $.focusTo('phoneNumInput'); // 改变焦点
            sendRequestFlag = false; // 重置状态
            switch (code) {
                case 1:
                    exchangeSuccess();
                    break;
                default:
                    // 兑换失败的逻辑
                    $('#netError').show();
                    $.focusTo('tryAgain');
                    break;
            }
        }
    });
}

function exchangeSuccess() {
    $('#exchangeSuccess').css({ display: 'inline-block' });
    PAGE_INFO.push({
        key: "myOrder",
        pressRight: function () {
            $.focusTo("exchangeSuccessBack");
        },
        pressBack: function () {
            $.forward($.getVariable("EPG:pathPage") + '/pointExchange/list/index.html')
            return true;
        },
        pressOk: function () {
            $.forward($.getVariable("EPG:pathPage") + '/myOrder/?type=MO&currentMenu=sfb')
        }
    })
    PAGE_INFO.push({
        key: "exchangeSuccessBack",
        pressLeft: function () {
            $.focusTo("myOrder");
        },
        pressOk: function () {
            $.forward($.getVariable("EPG:pathPage") + '/pointExchange/list/index.html')
        },
        pressBack: function () {
            $.forward($.getVariable("EPG:pathPage") + '/pointExchange/list/index.html')
            return true;
        }
    })
    $.focusTo("myOrder");
}

// document.addEventListener('keydown', function (e) {
//     if (e.keyCode == 288) {
//         location.href = location.href;
//     }
// })