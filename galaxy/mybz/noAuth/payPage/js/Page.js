$.forward = function (url) {
    if (forwardFlag) {
        $.getBackUrl(1);
    }
    $.redirect(url);
};

$.playVideoRedefine(true);

$.playLiveOrRecRedefine(true);

Query.prototype.hide = function () {
    return this.css({
        visibility: "hidden"
    }), this;
};

Query.prototype.show = function () {
    return this.css({
        visibility: "visible"
    }), this;
};

var pageName = "payPage.html";

var RECODE_DATA_KEY = "payPage.html";

var PAGE_INFO = [];

var ACTIVE_OBJECT;

var searchObj = $.search.get();

var productId = searchObj.product;

var isRenew = searchObj.renew === "1";

var cycleType = searchObj.cycleType;

var fee = searchObj.fee;

var couponId = searchObj.couponId || '';
// 传入的参数中带着活动id
var promotionId = searchObj.promotionid || '';
// 套装中的产品名称
var pkgNames = searchObj.pkgNames;
// 传入的参数中带着特价的活动id
var tFeeId = searchObj.tFeeId || '';

var authInfoObj = $.auth.getPkgInfo(productId);

var playDataObj = $.auth.getPlayData();

var isFromDetail = !!playDataObj.contentId;

var orderId = "";

var phoneNum = "";

var identCode = "";

var restPoint = 0;

var setIdentCodeTime = 120;

var identCodeTime = setIdentCodeTime;

var identCodeTimer = null;

var isIndentCodeActive = true;

var forwardFlag = true;

var vl = null;

var pageTypeArr = [];

var feeName = {
    1:"月包",
    2:"季包",
    3:"半年包",
    4:"年包",
    6:"3天卡",
    11:"连续包月",
    12:"连续包季",
    14:"连续包年"
} 

// 连续包月支持微信支付的套餐包
var isMonthRenewId = {
    '1100000241' : 1,
    '1100000761' : 1,
    '1100000381' : 1,
    '1100000181' : 1,
    '1100000121' : 1,
    '1100000542' : 1,
    '1100001321' : 1, // 优酷专区
    '1100001441' : 1, // 奇异影视

}

// 连续包季支持微信支付的套餐包
var isSeasonRenewId = {
    '1100000241' : 1,
    '1100000761' : 1,
    '1100000381' : 1,
    '1100000542' : 1
}
 
if (isRenew) {
    // 翼视达优品包，影视包，少儿包有微信支付 
    // var hasWxPayFlag = productId === '1100000241' || productId === '1100000761' || productId === '1100000381';
    // 符合条件的才有账单
    // 连续包季>>>手机
    cycleType === '2' && (pageTypeArr = isSeasonRenewId[productId] ? [1, 2, 6] : [2, 6]);
    // cycleType === '2' && (pageTypeArr = hasWxPayFlag ? [1, 2, 6] : [2, 6]);
    //连续包月>>>手机，翼支付。
    cycleType === '1' && (pageTypeArr = isMonthRenewId[productId] ? [1, 2, 6, 3] : [2, 6, 3]);
    // cycleType === '1' && (pageTypeArr = hasWxPayFlag ? [1, 2, 6, 3] : [2, 6, 3]);

    if (promotionId) {
        pageTypeArr = [6];
    }
    $.getVariable("EPG:isTest") && sort();
} else {
    pageTypeArr = [1, 2, 3];

    if (promotionId) {
        pageTypeArr = [1, 2, 3];
        // $.getVariable("EPG:isTest") &&  sort(); //9.10号套装单包不上账单，下次上
    }
}

var maxListLength = 5;

var typeMap = {
    1: {
        class: "wechat",
        name: "微信",
        qrUrl: ""
    },
    2: {
        class: "alipay",
        name: "支付宝",
        qrUrl: ""
    },
    3: {
        class: "bestpay",
        name: "翼支付",
        qrUrl: ""
    },
    4: {
        class: "billpay",
        name: "账单支付"
    },
    5: {
        class: "pointpay",
        name: "积分支付"
    },
    6: {
        class: "phonepay",
        name: "手机支付"
    }
};

var listIndex = 0;

var $payList = null;

var $payEntrance = null;

var $billPayCue = null;

var $pointPayCue = null;

var $paySuccess = null;

var $paySuccess2 = null;

var $payFail = null;

var $netError = null;

var $phone = null;

var $identCode = null;

var $getIdentCode = null;

var $phoneError = null;

var $identCodeError = null;

var $noBillPay = null;

var $pointPayFail = null;

var $pointFailInfo = null;

var $tokenError = null;

createPageInfo();

var billPayCue = {
    show: function () {
        hideWindow();
        $billPayCue.show();
        $.focusTo("billPayReturn");
    },
    hide: function () {
        $billPayCue.hide();
        if (pageTypeArr[listIndex] == 4) {
            $.focusTo("billOk");
        } else if (pageTypeArr[listIndex] == 6) {
            $.focusTo("pointOk");
        }
    }
};

var pointPayCue = {
    show: function () {
        hideWindow();
        $pointPayCue.show();
        $.focusTo("pointPayReturn");
    },
    hide: function () {
        $pointPayCue.hide();
        $.focusTo("pointOk");
    }
};

var paySuccess = {
    show: function () {
        hideWindow();
        $.auth.sendVS.success(authInfoObj.chargeId, pageTypeArr[listIndex], isRenew);
        $paySuccess.show();
        forwardFlag = false;
        $.getBackUrl(1);
        clearTimeout(autoTimer);
        $.focusTo("playVideo");
    }
};

var paySuccess2 = {
    show: function () {
        hideWindow();
        $.auth.sendVS.success(authInfoObj.chargeId, pageTypeArr[listIndex], isRenew);
        $paySuccess2.show();
        forwardFlag = false;
        $.getBackUrl(1);
        clearTimeout(autoTimer);
        $.focusTo("gotoPurchase2");
    }
};

var payFail = {
    show: function () {
        hideWindow();
        $payFail.show();
        clearTimeout(autoTimer);
        $.focusTo("rePay");
        $.auth.sendVS.sendVS({
            productId: authInfoObj.chargeId,
            state: "002",
            sourcetype: pageTypeArr[listIndex],
            productMode: isRenew
        });
    },
    hide: function () {
        $payFail.hide();
    }
};

var netError = {
    show: function () {
        hideWindow();
        $netError.show();
        $.focusTo("tryAgain");
    },
    hide: function () {
        $netError.hide();
    }
};

var noBillPay = {
    show: function () {
        hideWindow();
        $noBillPay.show();
        $.focusTo("noBillPayReturn");
    },
    hide: function () {
        $noBillPay.hide();
    }
};

var pointPayFail = {
    show: function (text) {
        hideWindow();
        $pointFailInfo.html(text);
        $pointPayFail.show();
        clearTimeout(autoTimer);
        $.focusTo("rePointPay");
    },
    hide: function () {
        $pointPayFail.hide();
    }
};

var tokenError = {
    show: function () {
        hideWindow();
        $tokenError.show();
        $.focusTo("tokenErrorReturn");
    },
    hide: function () {
        $tokenError.hide();
    }
}

function hideWindow() {
    $billPayCue.hide();
    $pointPayCue.hide();
    $paySuccess.hide();
    $paySuccess2.hide();
    $payFail.hide();
    $netError.hide();
    $noBillPay.hide();
    $pointPayFail.hide();
    $tokenError.hide();
}

function initPage() {
    $.initPage();
    $.recodeData(pageName, "access");
    $payList = $("#payList");
    $payEntrance = $("#payEntrance");
    $billPayCue = $("#billPayCue");
    $pointPayCue = $("#pointPayCue");
    $paySuccess = $("#paySuccess");
    $paySuccess2 = $("#paySuccess2");
    $payFail = $("#payFail");
    $netError = $("#netError");
    $noBillPay = $("#noBillPay");
    $pointPayFail = $("#pointPayFail");
    $pointFailInfo = $("#pointFailInfo");
    $tokenError = $("#tokenError");
    buy();
}

function couponUse(id) {
    Authentication.CTCSetConfig("coupon", 1);
    var ip = $.getVariable("EPG:isTest") ? '10.128.7.100:9088' : '10.128.7.5:5666';
    var url = 'http://' + ip + '/api/1.0/discountCoupon/use';
    $.post(url, {
        data: {
            'iptvAccount': $.getVariable("EPG:userId"),
            'discountCouponId': couponId,
            'orderId': id
        },
        success: function (res) {
        },
        error: function (res) {
        }
    }, true, true);

}

function addArrow() {
    $(".payList", "#payList", true).removeClass("current");
    $("#payList" + listIndex).addClass("current");
}

function createPageInfo() {
    for (var i = 0; i < maxListLength; i++) {
        PAGE_INFO.push({
            key: "payList" + i,
            pressUp: function () {
                if (listIndex === 0) {
                    return;
                }
                listIndex--;
                addArrow();
                if (isRenew) {
                    createBillOrPhone();
                } else {
                    if (promotionId) {
                        createBillOrPhone();
                    } else {
                        createQrOrPoint();
                    }
                }
                $.focusTo("payList" + listIndex);
            },
            pressDown: function () {
                if (listIndex === pageTypeArr.length - 1) {
                    return;
                }
                listIndex++;
                addArrow();
                if (isRenew) {
                    createBillOrPhone();
                } else {
                    if (promotionId) {
                        createBillOrPhone();
                    } else {
                        createQrOrPoint();
                    }
                }
                $.focusTo("payList" + listIndex);
            },
            pressRight: function () {
                if (pageTypeArr[listIndex] === 4) {
                    $.focusTo("randomCode");
                } else if (pageTypeArr[listIndex] === 5 || pageTypeArr[listIndex] === 6) {
                    $.focusTo("phone");
                }
            }
        });
    }
    PAGE_INFO.push({
        key: "phone",
        pressLeft: function () {
            $.focusTo("payList" + listIndex);
        },
        pressDown: function () {
            if (isIndentCodeActive) {
                $.focusTo("getIdentCode");
            } else {
                $.focusTo("identCode");
            }
        }
    });
    PAGE_INFO.push({
        key: "identCode",
        pressLeft: function () {
            $.focusTo("payList" + listIndex);
        },
        pressUp: function () {
            $.focusTo("phone");
        },
        pressRight: function () {
            if (isIndentCodeActive) {
                $.focusTo("getIdentCode");
            }
        },
        pressDown: function () {
            $.focusTo("pointOk");
        }
    });
    PAGE_INFO.push({
        key: "getIdentCode",
        pressLeft: function () {
            $.focusTo("identCode");
        },
        pressUp: function () {
            $.focusTo("phone");
        },
        pressLeft: function () {
            $.focusTo("identCode");
        },
        pressDown: function () {
            $.focusTo("pointReturn");
        },
        pressOk: function () {
            if (checkPhone(phoneNum)) {
                isIndentCodeActive = false;
                $getIdentCode.html(identCodeTime + "s");
                identCodeTimer = setInterval(function () {
                    identCodeTime--;
                    if (identCodeTime === 0) {
                        identCodeTime = setIdentCodeTime;
                        isIndentCodeActive = true;
                        $getIdentCode.html("获取验证码");
                        clearInterval(identCodeTimer);
                    } else {
                        $getIdentCode.html(identCodeTime + "s");
                    }
                }, 1e3);
                $.focusTo("identCode");
                $phoneError.hide();
                $.auth.getCheckCode({
                    phone: phoneNum,
                    callback: function () { }
                });
            } else {
                $phoneError.show();
            }
        }
    });
    var checkRestPointOnOff = true;
    PAGE_INFO.push({
        key: "pointOk",
        pressLeft: function () {
            $.focusTo("payList" + listIndex);
        },
        pressUp: function () {
            $.focusTo("identCode");
        },
        pressRight: function () {
            $.focusTo("pointReturn");
        },
        pressOk: function () {
            if (checkRestPointOnOff) {
                checkRestPointOnOff = false;
                $phoneError.hide();
                $identCodeError.hide();
                // 提示手机号错误
                if (!checkPhone(phoneNum)) {
                    $phoneError.show();
                }
                // 提示验证码错误
                if (identCode.length < 4) {
                    $identCodeError.show();
                }
                if (checkPhone(phoneNum) && identCode.length >= 4) {
                    if (pageTypeArr[listIndex] === 5) {
                        $.auth.queryPhoneScore({
                            phone: phoneNum,
                            checkCode: identCode,
                            callback: function (result, data) {
                                checkRestPointOnOff = true;
                                if (result) {
                                    restPoint = data.point;
                                    createPointPayCue();
                                    pointPayCue.show();
                                } else {
                                    $identCodeError.show();
                                }
                            }
                        });
                    } else if (pageTypeArr[listIndex] === 6) {
                        checkRestPointOnOff = true;
                        createBillPayCue();
                        billPayCue.show();
                    }
                } else {
                    checkRestPointOnOff = true;
                }
            }
        }
    });
    PAGE_INFO.push({
        key: "pointReturn",
        pressLeft: function () {
            $.focusTo("pointOk");
        },
        pressUp: function () {
            if (isIndentCodeActive) {
                $.focusTo("getIdentCode");
            } else {
                $.focusTo("identCode");
            }
        },
        pressOk: function () {
            $.back();
            return true;
        }
    });
    var pointPayOnOff = true;
    PAGE_INFO.push({
        key: "pointPayOk",
        pressRight: "pointPayReturn",
        pressOk: function () {
            if (pointPayOnOff) {
                pointPayOnOff = false;
                $.auth.payBill({
                    payType: 5,
                    orderId: orderId,
                    checkCode: identCode,
                    phone: phoneNum,
                    callback: function (code, data) {
                        pointPayOnOff = true;
                        if (code === 1) {
                            if (isFromDetail) {
                                paySuccess.show();
                            } else {
                                paySuccess2.show();
                            }
                            USER_SERVCICE.consume({
                                consume: fee,
                                orderid: productId,
                                orderinfo: authInfoObj['productName'] + feeName[isRenew * 10 + parseInt(cycleType)]
                            }, {});
                            couponId && couponUse(orderId);
                        } else {
                            if (data && data.msg) {
                                pointPayFail.show(data.msg + "!");
                            } else {
                                payFail.show();
                            }
                        }
                    }
                });
            }
        },
        pressBack: function () {
            pointPayCue.hide();
            return true;
        }
    });
    PAGE_INFO.push({
        key: "pointPayReturn",
        pressLeft: "pointPayOk",
        pressOk: function () {
            pointPayCue.hide();
        },
        pressBack: function () {
            pointPayCue.hide();
            return true;
        }
    });
    PAGE_INFO.push({
        key: "billOk",
        pressRight: "billReturn",
        pressUp: "randomCode",
        pressLeft: function () {
            $.focusTo("payList" + listIndex);
        },
        pressOk: function () {
            if (!checkCode()) {
                showErrorMsg();
                return;
            }
            if (buyOnOff) {
                createBillPayCue();
                billPayCue.show();
            }
        }
    });
    PAGE_INFO.push({
        key: "billReturn",
        pressLeft: "billOk",
        pressUp: "randomCode",
        pressOk: function () {
            $.back();
            return true;
        }
    });
    var billPayOnOff = true;
    var phonePayOnOff = true;
    PAGE_INFO.push({
        key: "billPayOk",
        pressRight: "billPayReturn",
        pressOk: function () {
            if (pageTypeArr[listIndex] === 4) {
                if (billPayOnOff) {
                    billPayOnOff = false;
                    $.auth.payBill({
                        payType: 4,
                        orderId: orderId,
                        callback: function (code) {
                            billPayOnOff = true;
                            if (code === 1) {
                                if (isFromDetail) {
                                    paySuccess.show();
                                } else {
                                    paySuccess2.show();
                                }
                                USER_SERVCICE.consume({
                                    consume: fee,
                                    orderid: productId,
                                    orderinfo: authInfoObj['productName'] + feeName[isRenew * 10 + parseInt(cycleType)]
                                }, {});
                                couponId && couponUse(orderId);
                            } else {
                                payFail.show();
                            }
                        }
                    });
                }
            } else if (pageTypeArr[listIndex] === 6) {
                if (phonePayOnOff) {
                    phonePayOnOff = false;
                    $.auth.payBill({
                        payType: 6,
                        orderId: orderId,
                        checkCode: identCode,
                        phone: phoneNum,
                        callback: function (code, data) {
                            phonePayOnOff = true;
                            if (code === 1) {
                                if (isFromDetail) {
                                    paySuccess.show();
                                } else {
                                    paySuccess2.show();
                                }
                                USER_SERVCICE.consume({
                                    consume: fee,
                                    orderid: productId,
                                    orderinfo: authInfoObj['productName'] + feeName[isRenew * 10 + parseInt(cycleType)]
                                }, {});
                                couponId && couponUse(orderId);
                            } else {
                                if (data && data.code === "107") {
                                    buy(1);
                                } else {
                                    payFail.show();
                                }
                            }
                        }
                    });
                }
            }
        },
        pressBack: function () {
            billPayCue.hide();
            return true;
        }
    });
    PAGE_INFO.push({
        key: "billPayReturn",
        pressLeft: "billPayOk",
        pressOk: function () {
            billPayCue.hide();
        },
        pressBack: function () {
            billPayCue.hide();
            return true;
        }
    });
    PAGE_INFO.push({
        key: "playVideo",
        pressRight: "gotoPurchase",
        pressOk: function () {
            play();
        }
    });
    PAGE_INFO.push({
        key: "gotoPurchase",
        pressLeft: "playVideo",
        pressOk: function () {
            $.auth.redirectPurchase(productId);
        }
    });
    PAGE_INFO.push({
        key: "gotoPurchase2",
        pressRight: "paySuccess2Return",
        pressOk: function () {
            $.auth.redirectPurchase(productId);
        }
    });
    PAGE_INFO.push({
        key: "paySuccess2Return",
        pressLeft: "gotoPurchase2",
        pressOk: function () {
            $.back();
        }
    });
    PAGE_INFO.push({
        key: "rePay",
        pressRight: "payFailReturn",
        pressOk: function () {
            if (buyOnOff) {
                hideWindow();
                buy();
                $.focusTo("payList" + listIndex);
            }
        }
    });
    PAGE_INFO.push({
        key: "payFailReturn",
        pressLeft: "rePay",
        pressOk: function () {
            $.back();
        }
    });
    PAGE_INFO.push({
        key: "tryAgain",
        pressRight: "netErrorReturn",
        pressOk: function () {
            if (buyOnOff) {
                hideWindow();
                buy();
                $.focusTo("payList" + listIndex);
            }
        }
    });
    PAGE_INFO.push({
        key: "netErrorReturn",
        pressLeft: "tryAgain",
        pressOk: function () {
            $.back();
        }
    });
    PAGE_INFO.push({
        key: "noBillPayReturn",
        pressOk: function () {
            $.back();
        }
    });
    PAGE_INFO.push({
        key: "rePointPay",
        pressRight: "pointPayFailReturn",
        pressOk: function () {
            if (buyOnOff) {
                hideWindow();
                buy();
                $.focusTo("payList" + listIndex);
            }
        }
    });
    PAGE_INFO.push({
        key: "pointPayFailReturn",
        pressLeft: "rePointPay",
        pressOk: function () {
            $.back();
        }
    });
    PAGE_INFO.push({
        key: "randomCode",
        pressLeft: function () {
            $.focusTo("payList" + listIndex);
        },
        pressDown: "billOk"
    });
    PAGE_INFO.push({
        key: "tokenErrorReturn",
        pressOk: function () {
            $.back();
        }
    });
}

function createList() {
    $payList.html("");
    var htmlTxt = "";
    $.UTIL.each(pageTypeArr, function (value, index) {
        var lastTxt = index === pageTypeArr.length - 1 ? " last" : "";
        htmlTxt += '<div id="payList' + index + '" class="payList ' + typeMap[value].class + lastTxt + '">' + typeMap[value].name + "</div>";
    });
    $payList.html(htmlTxt);
}

//微信 支付宝 翼支付 付款模块
function createQrCode(isRenew) {
    var typeTxt = cycleType === '2' ? '季' : '月';
    $payEntrance.html("");
    $payEntrance[0].className = "";
    $payEntrance.addClass("qrCode");
    if (promotionId) {
        $payEntrance.html('<div class="cue"></div>' + '<div class="cueContentPro">您正在购买 “特惠套装” ,支付成功后将获得套装内包含的所有产品权益，请' + typeMap[pageTypeArr[listIndex]].name + '扫码支付' + fee + '元完成订购。</div>' + '<div id="qrCodeImg" class="renew"><img></div>');
    } else {
        if (isRenew) {
            $payEntrance.html('<div class="cue"></div>' + '<div class="cueContent">您正在购买"<span class="packageName">' + authInfoObj.productName + '</span>"<span class="autoPay">连续包' + typeTxt + '</span>服务，' + typeMap[pageTypeArr[listIndex]].name + '扫码支付<span class="price autoPay">' + fee / 100 + "</span>元。次" + typeTxt + "将自动扣除相应费用，订购48小时后，可随时取消续订。</div>" + '<div id="qrCodeImg" class="renew"><img></div>');
        } else {
            $payEntrance.html('<div class="cue"></div>' + '<div class="cueContent">您正在购买"<span class="packageName">' + authInfoObj.productName + '</span>",请使用<span class="payType">' + typeMap[pageTypeArr[listIndex]].name + '</span>扫码支付<span class="price">' + fee / 100 + "</span>元!</div>" + '<div id="qrCodeImg"><img></div>');
        }
    }
    addQrCodeImg();
}

function addQrCodeImg() {
    $("#qrCodeImg img").attr({
        src: typeMap[pageTypeArr[listIndex]].qrUrl ? $.auth.qrCode + typeMap[pageTypeArr[listIndex]].qrUrl : "images/qrError.png"
    })
}

function createQrOrPoint() {
    if (pageTypeArr[listIndex] === 5) {
        createPoint();
    } else {
        createQrCode();
    }
}

function createBillOrPhone() {
    if (pageTypeArr[listIndex] === 4) {
        createBill();
    } else if (pageTypeArr[listIndex] === 6) {
        createPoint();
    } else {
        createQrCode(1);
    }
}

// 手机支付模块
function createPoint() {
    $payEntrance.html("");
    identCode = "";
    $payEntrance[0].className = "";
    $payEntrance.addClass("point");
    var cueTxt = "";
    var typeTxt1 = cycleType === '2' ? '连续包季' : '连续包月';
    var typeTxt2 = cycleType === '2' ? '季' : '月';
    if (pageTypeArr[listIndex] == 5) {
        cueTxt = '<div class="cueContent">您正在购买"<span class="packageName">' + authInfoObj.productName + '</span>",需支付<span class="price">' + fee / 100 + '</span>元,使用手机<span class="payUser">积分</span>支付,请输入电信手机号码:</div>';
    } else {
        if (promotionId) {
            cueTxt = '<div class="cueContent">您正在购买 “特惠套装” ,支付成功后将获得套装内包含的所有产品权益，请输入电信手机号码，支付' + fee + '元完成订购。</div>';
        } else {
            cueTxt = '<div class="cueContent">您正在购买 "<span class="packageName">' + authInfoObj.productName + '</span>"<span class="autoPay"> ' + typeTxt1 + '</span>服务,次' + typeTxt2 + '将自动扣除手机账户费用,订购48小时后,可随时取消续订,请输入电信手机号码:</div>';
        }
    }
    $payEntrance.html('<div class="cue"></div>' + cueTxt + '<div id="phone">' + phoneNum + "</div>" + '<div id="phoneError"></div>' + '<div id="identCode"></div>' + '<div id="identCodeError"></div>' + '<div id="getIdentCode" class="btn">' + (isIndentCodeActive ? "获取验证码" : identCodeTime + "s") + "</div>" + '<div id="pointOk" class="btn">确认</div>' + '<div id="pointReturn" class="btn">返回</div>');
    $phone = $("#phone");
    $identCode = $("#identCode");
    $getIdentCode = $("#getIdentCode");
    $phoneError = $("#phoneError");
    $identCodeError = $("#identCodeError");
}

// 账单支付模块
function createBill() {
    var typeTxt1 = cycleType === '2' ? '连续包季' : '连续包月';
    var typeTxt2 = cycleType === '2' ? '季' : '月';
    $payEntrance.html("");
    $payEntrance[0].className = "";
    $payEntrance.addClass("bill");
    if (promotionId) {
        $payEntrance.html('<div class="cue pro"></div>' + '<div class="cueContentPro">您正在购买 “特惠套装” ,支付成功后将获得套装内包含的所有产品权益，请确认支付' + fee + '元完成订购。</div>' + '<div id="randomCodeBox">' + '<div id="accountCode">账户验证码为：' + '<span id="randomNum">' + createCode() + "</span>" + "</div>" + '<div id="inputCode">请输入获取的验证码：</div>' + '<div id="randomCode"></div>' + '<div id="errorMsg" class="hide"></div>' + "</div>" + '<div id="billOk" class="btn">确认</div>' + '<div id="billReturn" class="btn">返回</div>');
    } else {
        $payEntrance.html('<div class="cue"></div>' + '<div class="cueContent">您正在购买 "<span class="packageName">' + authInfoObj.productName + '</span>"<span class="autoPay"> ' + typeTxt1 + '</span>服务,次' + typeTxt2 + '将自动扣除通信账户费用,订购48小时后,可随时取消续订。对于单宽用户可能造成提前欠停的情况,请及时缴费!</div>' + '<div id="randomCodeBox">' + '<div id="accountCode">账户验证码为：' + '<span id="randomNum">' + createCode() + "</span>" + "</div>" + '<div id="inputCode">请输入获取的验证码：</div>' + '<div id="randomCode"></div>' + '<div id="errorMsg" class="hide"></div>' + "</div>" + '<div id="billOk" class="btn">确认</div>' + '<div id="billReturn" class="btn">返回</div>');
    }
}

function createBillPayCue() {
    $billPayCue.html("");
    var cueTxt = "";
    var typeTxt = cycleType === '2' ? '季' : '月';
    // if(promotionId){
    //     authInfoObj.productName = '特惠套装';
    //     fee = fee * 100;
    // }
    if (pageTypeArr[listIndex] == 4) {
        cueTxt = '<div class="cueContent">您正在购买"<span class="packageName">' + (promotionId ? '特惠套装' : authInfoObj.productName) + '</span>",点击"确认支付"扣减<span class="payUser">通信账户</span><span class="price">' + (promotionId ? fee : fee / 100) + "</span>元。</div>" + '<div id="billPayOk" class="tipsBtn">确认支付</div>' + '<div id="billPayReturn" class="tipsBtn">返回</div>';
    } else if (pageTypeArr[listIndex] == 6) {
        cueTxt = '<div class="cueContent">您正在购买"<span class="packageName">' + (promotionId ? '特惠套装' : authInfoObj.productName) + '</span>",需支付<span class="price">' + (promotionId ? fee : fee / 100) + "</span>元（" + (promotionId ? "" : "每" + typeTxt) + "自动续费），是否确认购买？</div>" + '<div id="billPayOk" class="tipsBtn">确认支付</div>' + '<div id="billPayReturn" class="tipsBtn">返回</div>';
    }
    $billPayCue.html(cueTxt);
}

function createPointPayCue() {
    $pointPayCue.html("");
    $pointPayCue.html('<div class="cueContent">您剩余' + restPoint + '积分,本次购买需支付<span class="price">' + fee + '</span>积分,是否<span class="payType">积分</span>支付?</div>' + '<div id="pointPayOk" class="tipsBtn">确认支付</div>' + '<div id="pointPayReturn" class="tipsBtn">返回</div>');
}

// 加入账单支付 并重排序 => 微信始在第一个
function sort() {
    pageTypeArr.push(4)
    // var isHasWx = pageTypeArr.indexOf(1) > -1 ? true : false;
    // if (isHasWx) {
    //     pageTypeArr.splice(1, 0, 4)
    // } else {
    //     pageTypeArr.push(4)
    // }
}

var buyOnOff = true;

function buy(isErrorCode) {
    if (!buyOnOff) {
        return;
    }
    buyOnOff = false;
    var obj;
    var callback = buyCallback;
    if (isErrorCode) {
        callback = function (a, b) {
            buyOnOff = true;
            hideWindow();
            if (a == 1 && b.code == 0) {
                if (b.userType == 1) {
                    sort();
                }
                if (promotionId) {
                    orderId = b.orderIds
                } else {
                    orderId = b.orderId;
                }
                $identCodeError.show();
                $.focusTo("identCode");
            } else {
                netError.show();
            }
        };
    }
    if (authInfoObj.type == "1") {
        obj = {
            spId: authInfoObj.spId,
            productId: authInfoObj.chargeId,
            chargesType: authInfoObj.type,
            customerRenew: searchObj.renew,
            callback: callback,
            cycleType: cycleType,
            fee: fee,
            tFeeId: tFeeId,
            discountCouponId: couponId
        };
    } else if (authInfoObj.type == "0") {
        obj = {
            spId: authInfoObj.spId,
            productId: authInfoObj.chargeId,
            chargesType: authInfoObj.type,
            callback: callback,
            productType: 0,
            contentId: playDataObj.contentId,
            columnId: playDataObj.categoryId,
            customerRenew: searchObj.renew,
            cycleType: cycleType,
            fee: fee,
            tFeeId: tFeeId,
            discountCouponId: couponId
        };
        // 套装的情况下没有authInfoObj信息
    } else {
        obj = {
            promotionid: promotionId,
            callback: callback,
            customerRenew: searchObj.renew,
            fee: fee
        };
    }
    if (promotionId) {
        $.auth.createPromotionOrderForm(obj);
    } else {
        $.auth.creatOrderForm(obj);
    }
}

function buyCallback(a, b) {
    buyOnOff = true;
    if (a == 1 && b.code == 0) {
        if (isRenew) {
            if (b.userType == 1) {
                sort();
            }
            typeMap["1"].qrUrl = b.wechatQrUrl;
            typeMap["2"].qrUrl = b.alipayQrUrl;
            typeMap["3"].qrUrl = b.bestpayQrUrl;
            if (promotionId) {
                orderId = b.orderIds;
            } else {
                orderId = b.orderId;
            }
            createList();
            createBillOrPhone();
            addArrow();
            $.focusTo("payList" + listIndex);
        } else {
            // if (b.userType == 1 && !(productId == $.auth.getBigId() && cycleType == "4")) {
            //     pageTypeArr = [ 1, 2, 5, 3 ];
            // }
            typeMap["1"].qrUrl = b.wechatQrUrl;
            typeMap["2"].qrUrl = b.fusionpayQrUrl;
            typeMap["3"].qrUrl = b.bestpayQrUrl;
            if (promotionId) {
                if (b.userType == 1) {
                    // sort(); //9.10号套装单包不上账单，下次上
                }
                orderId = b.orderIds;
                createList();
                createBillOrPhone();
            } else {
                orderId = b.orderId;
                createList();
                createQrOrPoint();
            }
            addArrow();
            $.focusTo("payList" + listIndex);
        }
        payfor();
    } else if (b.code == 401) {
        tokenError.show();
    } else {
        netError.show();
    }
}

function payfor() {
    $.auth.queryOrderResult({
        orderId: orderId,
        callback: payforCallBack
    });
}

var autoTimer = null;

function payforCallBack(a, d) {
    if (a == 0) {
        autoTimer = setTimeout(payfor, 3e3);
        return;
    }
    if (d.code == 0) {
        if (d.status == 3) {
            autoTimer = setTimeout(payfor, 3e3);
        } else if (d.status == 1) {
            if (isFromDetail) {
                paySuccess.show();
            } else {
                paySuccess2.show();
            }
            USER_SERVCICE.consume({
                consume: fee,
                orderid: productId,
                orderinfo: authInfoObj['productName'] + feeName[isRenew * 10 + parseInt(cycleType)]
            }, {});
            couponId && couponUse(orderId);
        } else {
            payFail.show();
        }
    } else {
        payFail.show();
    }
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
                delNum(ACTIVE_OBJECT.key);
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
                delNum(ACTIVE_OBJECT.key);
                return true;
            },
            KEY_PAGEUP: function () {
                return true;
            },
            KEY_PAGEDOWN: function () {
                return true;
            }
        }
    };
}());

function delNum(type) {
    if (type === "phone") {
        if (phoneNum) {
            phoneNum = phoneNum.substring(0, phoneNum.length - 1);
            $("#phone").html(phoneNum);
        } else {
            $.back();
        }
    } else if (type === "identCode") {
        if (identCode) {
            identCode = identCode.substring(0, identCode.length - 1);
            $("#identCode").html(identCode);
        } else {
            $.back();
        }
    } else if (type === "randomCode") {
        if (randomCode) {
            randomCode = randomCode.substring(0, randomCode.length - 1);
            $("#randomCode").html(randomCode);
            $("#errorMsg").addClass("hide");
        } else {
            $.back();
        }
    }
}

function pressNO(type, num) {
    if (type === "phone") {
        if (phoneNum.length > 10) {
            return;
        } else {
            phoneNum = phoneNum + num;
            $("#phone").html(phoneNum);
        }
    } else if (type === "identCode") {
        if (identCode.length > 3) {
            return;
        } else {
            identCode = identCode + num;
            $("#identCode").html(identCode);
        }
    } else if (type === "randomCode") {
        if (randomCode.length > 3) {
            return;
        } else {
            $("#errorMsg").addClass("hide");
            randomCode = randomCode + num;
            $("#randomCode").html(randomCode);
        }
    }
}

(function (fn) {
    $.focusTo = function () {
        if (arguments[0] === "phone" || arguments[0] === "identCode" || arguments[0] === "randomCode") {
            $.pTool.get("inputNum").show();
        } else {
            $.pTool.get("inputNum").hide();
        }
        $.UTIL.apply(fn, arguments, $);
    };
})($.focusTo);

function checkPhone(phoneNum) {
    return /1(\w)\d{9}/.test(phoneNum);
}

var randomCode = "";

function createCode() {
    randomCode = "";
    var code = "";
    var codeLength = 4;
    var selectChar = new Array(0, 1, 2, 3, 4, 5, 6, 7, 8, 9);
    for (var i = 0; i < codeLength; i++) {
        var charIndex = Math.floor(Math.random() * 10);
        code += selectChar[charIndex];
    }
    return code;
}

function checkCode() {
    var verificationCode = $("#randomNum")[0].innerHTML;
    return randomCode.length == 4 && randomCode == verificationCode;
}

function showErrorMsg() {
    $("#errorMsg").removeClass("hide");
}

function play() {
    if (playDataObj.channelNum) {
        $.playLiveOrRec({
            channelId: playDataObj.channelNum
        });
        return;
    }
    vl = $.playSizeList({
        recovery: true,
        cleanEndPoint: true
    }, playDataObj.categoryId);
    var diyInfo = vl.diy();
    if ($.auth.jw.isJW(productId)) {
        $.auth.jw.backJW();
        return;
    }
    if (diyInfo && "" + diyInfo.playCurrent && "" + diyInfo.playTime) {
        vl.seek({
            val: diyInfo.playCurrent,
            playTime: diyInfo.playTime
        }).save();
    }
    if (playDataObj.contentType == "0") {
        vl.enter({
            contentId: playDataObj.contentId,
            multiVod: false
        });
    } else {
        vl.enter({
            seriesId: playDataObj.contentId,
            multiVod: playDataObj.contentType == "3"
        });
    }
    return;
}

function unload() {
    if (vl) {
        vl.save();
        vl.release();
    }
}