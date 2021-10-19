var RECODE_DATA_KEY = "buyPage";

var pageName = RECODE_DATA_KEY;
//存订购挽留页面数据key
var page_train = "buyTrain";

var btnFlag = false;
var pkgLength;
var pkgTypeTag;
var pkgFocus = "";
var promotionId = $.page.promotionId || '';
var trainTag = false;
var backTag = false;
var tzFlag = promotionId && promotionId.indexOf('tz') !== -1;
var couponId = $.page.couponId || '';
var isBlackListFlag = 1;
// 套装包获取活动角标begin
var productCorner = {};
var cornerId = $.getVariable("EPG:isTest") ? "1100007332" : "1100007546";
$.s.guidance.get({
    id: cornerId
}, {
    async: false,
    success: function (res) {
        $.UTIL.each(res, function (res) {
            var pics = $.getPic(res.pics, [0]);
            if (pics) {
                productCorner[res.contentName] = pics
            }
        })
    },
    error: function () { }
});
// 套餐包获取活动角标end
var PAGE_INFO = [{
    key: "retry",
    pressRight: "return",
    pressOk: function () {
        if (btnFlag) {
            isCouponFn();
            $("#error").hide();
        }
    }
}, {
    key: "return",
    pressLeft: "retry",
    pressOk: function () {
        $.back();
    }
}];
var type = 1;
var ACTIVE_OBJECT;

function loader(url, opt) {
    var cbName, _opt = {
        replace: opt && opt.replace || "CaLlBacK",
        charset: opt && opt.charset || "UTF-8",
        timeout: opt && opt.timeout || 2e3,
        loading: opt && opt.loading,
        success: opt && opt.success,
        error: opt && opt.error,
        jsonpName: opt && opt.jsonpName
    };
    if (cbName = _opt.jsonpName ? _opt.jsonpName : "callback_" + (new Date).getTime() + Math.random().toFixed(3).split(".")[1], !window[cbName] || !window[cbName].loading) {
        var script = document.createElement("script");
        script.type = "text/javascript",
            script.charset = _opt.charset,
            script.src = _opt.jsonpName ? url : url.replace(_opt.replace, cbName), document.head.appendChild(script), "function" == typeof _opt.loading && _opt.loading(),
            function (cbName, timeout, $script, success, error) {
                var f = function () {
                    $script && (f.abort ? error(arguments) : (clearTimeout(f.timeoutTimer), success(arguments)), delete window[f.cbName].loading, /callback_/.test(f.cbName) && delete window[f.cbName], $script.parentNode.removeChild($script), $script = success = error = timeout = f = null)
                };
                f = f.bind(f), window[cbName] = f, f.loading = !0, f.cbName = cbName, f.timeout = timeout, f.timeoutTimer = setTimeout(function () {
                    "function" == typeof window[cbName] && (window[cbName].abort = !0, window[cbName]())
                }, timeout)
            }(cbName, _opt.timeout, script, _opt.success, _opt.error)
    }
}
var preloadPicArr = ["./images/monthF.png", "./images/pieceF.png", "./images/renewMonthF.png", "./images/yearF.png", "./images/error.png"];
var promotiomMessage = '您的账号不满足该活动的参与条件';

function load() {
    // 判断是否使用套装的样式
    if (tzFlag) {
        var promotionInfo = eval('epgData_' + ($.getVariable('EPG:isTest') ? '1100007346' : '1100007547'));
        $("#coordinateListStyle").css({
            'background': 'url(' + $.getPic(promotionInfo[0].pics, [121]) + ')'
        });
        $("#pkgListStyle").hide();
        $("#coordinateListStyle").show();
    } else {
        // var orderInfo = eval('epgData_' + ($.getVariable('EPG:isTest') ? '1100007351' : '1100007738'));
        // if (orderInfo && orderInfo[0].pics && $.getPic(orderInfo[0].pics, [121])) {
        //     $("#pkgListStyle").css({
        //         'background': 'url(' + $.getPic(orderInfo[0].pics, [121]) + ')'
        //     });
        // }
        $("#pkgListStyle").show();
        $("#coordinateListStyle").hide();
    }
    $.initPage();
    $.recodeData(RECODE_DATA_KEY, "access");
    $.pTool.add("noCoupon", {
        key: "noCoupon",
        keysMap: {
            KEY_OK: function () {
                $.back()
            }
        },
        active: function () {
            $("#noCoupon").show(),
                $.focusTo({
                    el: "#noCouponBack"
                })
        }
    });
    preloadImg(preloadPicArr);
    blackList.load(); // 判断黑名单
    setTimeout(function () {
        isCouponFn(); //只显示优惠券则已订购产品去掉
    }, 50)
    userAgreement.load();
    var orderRetainInfo = eval('epgData_' + ($.getVariable("EPG:isTest") ? '1100011657' : '1100011692'));   
    // 注册用户挽留插件
    $.pTool.add("orderRetain", {
        key: "orderRetain",
        keysMap: {
            KEY_RETURN: function(){
                $.pTool.deactive("orderRetain");
                $.focusTo(ACTIVE_OBJECT.key);
                return true;
            },
            KEY_OK: function () {
                var elem = $("#retainWrap .focusBorder")[0];
                if(elem.id=="retainBtn1"){
                    $.recodeData(pageName,"access",pageName+"_furtherOrderBtn")
                    if(orderRetainInfo.length>1){
                        $.gotoDetail({
                            contentType: '7',
                            url: orderRetainInfo[1].contentUri,
                        });
                    }else{
                        $.pTool.deactive("orderRetain");
                        $.focusTo(ACTIVE_OBJECT.key); 
                    }
                }else if(elem.id=="retainBtn2"){
                    $.recodeData(pageName,"access",pageName+"_gobackBtn")
                    $.back();                
                }
                return true;
            },
            KEY_UP: function(){return true;},
            KEY_DOWN: function(){return true;},
            KEY_LEFT: function(){
                var elem = $("#retainWrap .focusBorder")[0];
                if(elem.id=="retainBtn2"){
                    $.focusTo({
                        el: "#retainBtn1"
                    })
                }
                return true;
            },
            KEY_RIGHT: function(){
                var elem = $("#retainWrap .focusBorder")[0];
                if(elem.id=="retainBtn1"){
                    $.focusTo({
                        el: "#retainBtn2"
                    })
                }
                return true;
            }
        },
        init: function(res){
            // $html=$('<div class="orderRetain" id="retainWrap">'+
            //             '<img id="retainBg" src="" />'+
            //             '<div class="confirmBtn" id="retainBtn1"></div>'+
            //             '<div class="cancelBtn" id="retainBtn2">我要退出</div>'+
            //     '</div>');
            // $html.appendTo("body");
            var $confirmBtn = $("#retainBtn1");
            var $retainBg =  $("#retainBg");
            var picPath = $.getPic(res[0].pics,[121]);
            if(res.length==1){
                //没有抽奖的用户挽留 
                $confirmBtn.html("继续订购");
            }else if(res.length==2){
                //有抽奖的用户挽留
                $confirmBtn.html("获得优惠");
            }
            $retainBg.attr({src: picPath})
        },
        active: function () {
            trainTag = true;
            backTag = true;
            $("#retainWrap").show();
            $.focusTo({
                el: "#retainBtn1"
            })
        },
        deactive: function(){
            $("#retainWrap").hide();
        }
    });
    if(orderRetainInfo.length>0){
        $.pTool.get("orderRetain").init(orderRetainInfo)
    }
    var pageInfo = $.initPageInfo(page_train, ["trainTag"], {
        trainTag: false
    });
    backTag = pageInfo.trainTag
    if($.isBack()){trainTag = backTag}
    // $.pTool.add("orderRetain", function() {
    //     var $confirmBtn = null;
    //     var $retainBg = null;
    //     var toolKey = "orderRetain";
    //     return {
    //         key: toolKey,
    //         dft: true,
    //         keysDftMap: [],
    //         keysMap: {
    //             KEY_RETURN: function(){
    //                 $("#retainWrap").hide();
    //                 return true;
    //             },
    //             KEY_OK: function () {
    
    //             },
    //             KEY_LEFT: function(){
    //                 var elem = $("#retainWrap .focusBorder")[0];
    //                 if(elem.id=="retainBtn2"){
    //                     $.focusTo({
    //                         el: "#retainBtn1"
    //                     })
    //                 }
    //                 return true;
    //             },
    //             KEY_RIGHT: function(){
    //                 var elem = $("#retainWrap .focusBorder")[0];
    //                 if(elem.id=="retainBtn1"){
    //                     $.focusTo({
    //                         el: "#retainBtn2"
    //                     })
    //                 }
    //                 return true;
    //             }
    //         },
    //         init: function(res){
    //             // $html=$('<div class="orderRetain" id="retainWrap">'+
    //             //             '<img id="retainBg" src="" />'+
    //             //             '<div class="confirmBtn" id="retainBtn1"></div>'+
    //             //             '<div class="cancelBtn" id="retainBtn2">我要退出</div>'+
    //             //     '</div>');
    //             // $html.appendTo("body");
    //             $confirmBtn = $("#retainBtn1");
    //             $retainBg =  $("#retainBg");
    //             if(res.length==1){
    //                 //没有抽奖的用户挽留 
    //                 $confirmBtn.html("继续订购");
    //                 $retainBg.attr({src: $.getVariable("EPG:pathPic") + '/' + res[0].pics[0].picPath})
    //             }else if(res.length==2){
    //                 //有抽奖的用户挽留
    //                 $confirmBtn.html("获得优惠")
    //                 $retainBg.attr({src: $.getVariable("EPG:pathPic") + '/' + res[0].pics[0].picPath})
    //             }
    //         },
    //         active: function () {
    //             $("#retainWrap").show();
    //             $.focusTo({
    //                 el: "#retainBtn1"
    //             })
    //         },
    //         deactive: function(){
    //             $("#retainWrap").hide();
    //         }
    //     };
    // }());
}
function isCouponFn() {
    if (couponId) {
        type = 4;
        var pro_id = $.page.productId.split(',');
        var isbigPro = false;
        pro_id.indexOf('1100000381') > -1 || pro_id.indexOf('1100000761') > -1 && pro_id.push('1100000241');
        var package = [];
        for (var i = 0; i < pro_id.length; i++) {
            package.push({
                chargeId: pro_id[i]
            })
        }
        $.auth.auth4Pkg({
            entrance: "",
            package: package,
            callback: function (res) {
                var arr = [];
                var arr2 = [];
                res = res || {};
                $.UTIL.each(res, function (value, key) {
                    if (key === '1100000241' && value) {
                        isbigPro = true; //已购买翼视达
                    } else {
                        !value && arr2.push(key)
                    }
                });
                //已购翼视达，过滤掉少儿包影视包
                arr = isbigPro ? arr2.filter(function (item) {
                    return item !== '1100000381' && item !== '1100000761'
                }) : arr2;
                if (!arr.length) { //过滤后没有产品则弹框
                    $.pTool.active("noCoupon");
                    Authentication.CTCSetConfig("coupon", 1);
                    return true;
                }
                page.queryPrice(arr.join(','));
            }
        })
    } else if (promotionId) { //如果路由里传了活动id
        // 注册与活动相关的插件
        $.pTool.add("promotionMsg", {
            key: "promotionMsg",
            keysMap: {
                KEY_OK: function () {
                    $('#noActivity').hide();
                    $.back()
                }
            },
            active: function () {
                $('.text1').html(promotiomMessage);
                $('#noActivity').show();
                $.focusTo({
                    el: "#noActivityBack"
                })
            }
        });
        getPromotion(promotionId);
    } else {
        page.queryPrice();
    }
}

function unload() {
    $.savePageInfo(page_train, {
        trainTag: trainTag
    });
}

function preloadImg(imgArr) {
    for (var i = 0; i < imgArr.length; i++) {
        new Image().src = imgArr[i];
    }
}

// 活动的业务逻辑
function getPromotion(promotionId) {
    if (!tzFlag) {
        // 走特价的逻辑
        page.queryPrice();
    } else {
        //   走套装的逻辑
        coordinates.init(promotionId)
    }
};
// 套装的逻辑功能
var coordinates = (function () {
    var pkgInfo = $.auth.getPkgInfo();
    var pageInfo = initFocus();
    var data, $promotionId;
    var pkgNames = [];
    var typeMonth = {
        '1': '元/1个月',
        '2': '元/1个月',
        '3': '元/3个月',
        '4': '元/6个月',
        '5': '元/12个月',
        '7': '元/72小时',
        '9': '元/3个月'
    };
    var typeProduction = {
        '1': '1个月',
        '2': '连续包月',
        '3': '3个月',
        '4': '6个月',
        '5': '12个月',
        '7': '三天卡',
        '9': '连续包季'
    };

    function init(promotionId) {
        $promotionId = promotionId;
        var istest = $.getVariable("EPG:isTest") || undefined;
        var ip = !istest ? 'http://10.128.7.2:8008' : 'http://10.128.7.100:8008';
        // 接受套装的数据，渲染页面
        $.get(ip + '/orders/getPromotionInfo?promotionId=' + promotionId + '&userId=' + $.getVariable("EPG:userId"), {
            success: function (res) {
                var blackFlag = blackList.enter();
                if (!blackFlag) {
                    return;
                }
                res = JSON.parse(res)
                // 系统错误
                data = res;
                if (res && res.code == 605) {
                    btnFlag = true;
                    errorShow();
                } else {
                    btnFlag = false;
                    res.code === 604 ? renderPage() : msgShow(res.code);
                }
            },
            error: function () {
                btnFlag = true;
                errorShow();
            }
        });

    };

    function msgShow(msgCode) {
        var codeMsg = {
            601: '您的账号不满足该活动的参与条件',
            602: '活动已结束',
            606: '您已达到活动参与上限',
            607: '该活动还未开始'
        }
        if (msgCode === 603) {
            promotiomMessage = '您已拥有' + data['product'][0]['productName'] + '权益'
        } else {
            promotiomMessage = codeMsg[msgCode];
        }
        $.pTool.active('promotionMsg')
    }

    function saveInfo() {
        $.savePageInfo(pageName, {
            focus: ACTIVE_OBJECT.key,
            currentIndex: 0,
            firstIndex: 0,
            count: 0
        });
    }

    function focusTo(key) {
        $.focusTo(key);
    }

    function initFocus() {
        var pageInfo = $.initPageInfo(pageName, ["focus", "firstIndex", "currentIndex", "count"], {
            focus: 'coordinatePrice',
            firstIndex: 0,
            count: 0
        });
        return pageInfo;
    }
    // 渲染套装的页面样式
    function renderPage() {
        var $coordinateList = $('<div class="wrap"></div>');
        var $arrowHead = $('<div class="arrowHead"></div>');
        var $coordinatePrice = $('<div id="coordinatePrice" class="coordinatePrice"><div class="tzName">特惠套餐</div></div>');
        $arrowHead.appendTo("#coordinateListStyle");
        $coordinatePrice.appendTo("#coordinateListStyle");
        var cls = data && data.product && data.product.length === 2 ? 'pkgItemlineTwo' : '';
        var html = '';
        var countPrice = 0;
        if (data && data.product && data.product.length) {
            data.product.forEach(element => {
                countPrice = accAdd(countPrice, element.price);
                // countPrice += element.price;
                pkgNames.push(element.productName);
                var des = $.substringElLength(pkgInfo[element.productId].description || '', "24px", "880px").last;
                html += '<div class="pkgItem ' + cls + '"><div class="pkgItemName"><p>' + element.productName + '</p></div><div class="pkgItemDes"><p>' + des + '</p></div><div class="pkgItemType">' + typeProduction[element.productType] + '</div><div class="pkgItemPrice"><span>' + element.price + '</span>&nbsp' + typeMonth[element.productType] + '</div></div>';
            });
        }
        $coordinateList.html(html);
        var $countPrice = $('<div class="countPrice">总价：&nbsp;&nbsp;<span>' + data.price + '</span>&nbsp;&nbsp;元<div>');
        var $primePrice = $('<div class="primePrice">原价：<span>' + countPrice + '</span>元<div>');
        $countPrice.appendTo("#coordinateListStyle .coordinatePrice");
        $primePrice.appendTo("#coordinateListStyle .coordinatePrice");
        $coordinateList.appendTo("#coordinateListStyle .coordinateList");
        PAGE_INFO = PAGE_INFO.concat({
            key: 'coordinatePrice',
            pressOk: function () {
                // var el = $(".focusBorder");
                var opt = {
                    promotionid: $promotionId,
                    renew: data.customerRenew,
                    fee: data.price,
                    pkgNames: pkgNames
                };
                saveInfo();
                $.auth.buy(opt);
            },
            pressDown: function () {
                $.focusTo('userAgreementEntey');
                return;
            }
        });
        focusTo(pageInfo.focus)
    }

    function errorShow() {
        $("#error").show();
        $.focusTo("retry");
    }

    return {
        init: init
    }
})();

var page = function () {
    var firstIndex = 0;
    var currentIndex = "";
    var maxLen = 3;
    var param = $.search.get();
    var vodName = $.auth.getPlayData()["vodName"] || "";
    var productId;
    var pkgInfo = $.auth.getPkgInfo();
    var $up, $down;
    var $priceBtnUp, $priceBtnDown;
    var priceData = {};
    var count = 0,
        priceLen = 0;
    var elArr = [];

    function _queryPrice(proStr) {
        var istest = $.getVariable("EPG:isTest") || undefined;
        var ip = !istest ? 'http://10.128.7.2:8008' : 'http://10.128.7.100:8008';
        var userId = $.getVariable("EPG:userId");
        var queryPkgPriceUrl;
        var filterIds = eval('epgData_' + ($.getVariable("EPG:isTest") ? '1100005457' : '1100005476'));
        if (filterIds[0].contentUri.length > 0) {
            filterIds = filterIds[0].contentUri.split('&');
        } else {
            filterIds = [];
        }
        if (promotionId) {
            queryPkgPriceUrl = ip + '/orders/newfees/' + userId + '/3/' + promotionId + '?callback=CaLlBacK';
        } else {
            var strPros = proStr ? proStr : param.productId;
            productId = strPros.split(",").filter(item => {
                return filterIds.indexOf(item) === -1;
            })
            pkgLength = productId.length;
            //传couponId参数返回券后计费点，否则返全部计费点
            var pro = couponId ? '2/' + productId.join("-") + '/' + couponId : '1/' + productId.join("-");
            queryPkgPriceUrl = ip + '/orders/newfees/' + userId + '/' + pro + '?callback=CaLlBacK';
        }
        var arr_pro = [];
        loader(queryPkgPriceUrl, {
            success: function (res) {
                // 先校验黑名单，在黑名单不执行
                var blackFlag = blackList.enter();
                if (!blackFlag) {
                    return;
                }
                if (res && res[0] && res[0].code == 0) {
                    var data = res[0];
                    if (data.products && data.products.length) {
                        var products = data.products;
                        var productArr = [];
                        for (var i in products) {
                            productArr.push(products[i].productId);
                            if (products[i].chargesType == 0) {
                                priceData[products[i].productId] = {
                                    type: "0",
                                    discountFee: products[i].discountFee,
                                    fee: products[i].fee
                                };
                            }
                            if (products[i].chargesType == 1) {
                                priceData[products[i].productId] = {
                                    type: "1",
                                    fee: products[i].fees
                                };
                                if (couponId && products[i].fees.length !== 1 || products[i].fees[0].cycleType !== 1 || products[i].fees[0].discountCouponFeeRenew <= 0 || products[i].fees[0].firstFeeRenew === products[i].fees[0].feeRenew) {
                                    arr_pro.push(products[i].productId)
                                }
                            }
                        }
                        if (couponId) { //没有优惠券和已订购的去掉之后，重赋值length和productId
                            productId = arr_pro; //左侧列表根据产品id个数渲染
                            pkgLength = productId.length;
                            if (pkgLength === 0) { //包月特殊，首月优惠不支持券后.这儿得判断一下
                                $.pTool.active("noCoupon");
                                Authentication.CTCSetConfig("coupon", 1); //解决我的优惠券焦点问题
                                return;
                            }
                        }
                        // if (promotionId) {
                            productId = productArr;
                            pkgLength = productId.length;
                        // }
                    } else { //抱歉,没有能是用该优惠券的产品
                        if (couponId) {
                            $.pTool.active("noCoupon");
                            Authentication.CTCSetConfig("coupon", 1); //解决我的优惠券焦点问题
                            return;
                        }
                    }
                    for (var i in priceData) {
                        if (priceData[i].type === "0") {
                            priceData[i].minPrice = priceData[i].fee;
                        } else {
                            var arr = [];
                            var arrCou = [];
                            // 如果有特价价格，产品价格就是按照特价价格起
                            var arrPro = [];
                            for (var k in priceData[i].fee) {
                                if (priceData[i].fee[k].fee > 0) {
                                    arr.push(priceData[i].fee[k].fee);
                                }
                                if (priceData[i].fee[k].feeRenew > 0) {
                                    arr.push(priceData[i].fee[k].feeRenew);
                                }
                                if (priceData[i].fee[k].discountCouponFee > 0 && priceData[i].fee[k].cycleType != 3) { //半年包后台有，epg不显示
                                    arrCou.push(priceData[i].fee[k].discountCouponFee);
                                }
                                if (priceData[i].fee[k].discountCouponFeeRenew > 0 && priceData[i].fee[k].feeRenew === priceData[i].fee[k].firstFeeRenew) {
                                    arrCou.push(priceData[i].fee[k].discountCouponFeeRenew);
                                }
                                if (priceData[i].fee[k].teFee && priceData[i].fee[k].teFee > 0) {
                                    arrPro.push(priceData[i].fee[k].teFee);
                                }
                                if (priceData[i].fee[k].firstFeeRenew > 0) {
                                    arr.push(priceData[i].fee[k].firstFeeRenew);
                                }
                            }
                            if (couponId && !arrCou.length) {
                                $.pTool.active("noCoupon");
                                Authentication.CTCSetConfig("coupon", 1); //解决我的优惠券焦点问题
                                return;
                            }
                            couponId ? priceData[i].minPrice = Math.min.apply(null, arrCou) : promotionId ? priceData[i].minPrice = Math.min.apply(null, arrPro) : priceData[i].minPrice = Math.min.apply(null, arr.concat(arrPro));
                        }
                    }
                    btnFlag = false;
                    _init();
                } else if (res && res[0] && res[0].code == 605) {
                    btnFlag = true;
                    errorShow();
                } else {
                    var codeMsg = {
                        601: '您的账号不满足该活动的参与条件',
                        602: '活动已结束',
                        606: '您已达到活动参与上限',
                        607: '该活动还未开始'
                    }
                    promotiomMessage = res[0].code === 603 ? '您已拥有' + res[0].productName + '权益' : codeMsg[res[0].code]
                    $.pTool.active('promotionMsg');
                }
            },
            error: function () {
                btnFlag = true;
                errorShow();
            }
        });
    }

    function errorShow() {
        $("#error").show();
        $.focusTo("retry");
    }

    function loadEl(feeType, className, data, id) {
        var arr = {
            'fee': 'discountCouponFee',
            'feeRenew': 'discountCouponFeeRenew'
        }
        var typeMonth = {
            renewMonth: '元/1个月',
            month: '元/1个月',
            threeMonth: '元/3个月',
            renewSeason: '元/3个月',
            year: '元/12个月',
            renewYear: '元/12个月',
            month1: '元/72小时'
        }
        // 如果是特价活动，只展示特价计费点
        var isPromotion = data['teFee'] && data['teFee'] > 0 && feeType !== 'feeRenew' ? true : false;
        var type = arr[feeType];
        var isCoupon = data[type] > 0 ? true : false; //是否有券后优惠
        var cycleType = data.cycleType;
        var renewStr = feeType === "feeRenew" ? '1' : '0';
        var price1 = null; //券后价
        var couId = null; //优惠券id详情页跳转需要带着，
        var promoId = '';
        if (feeType === 'fee' && isCoupon) {
            price1 = data.discountCouponFee;
            couId = data.discountCouponFee_id;
        } else if (feeType === 'feeRenew' && isCoupon) {
            price1 = data.discountCouponFeeRenew;
            couId = data.discountCouponFeeRenew_id;
        }
        var price2 = feeType === 'fee' ? data.fee : data.feeRenew; //正常价格
        var feeStr = isPromotion ? data['teFee'] : (isCoupon ? price1 : price2);
        // var feeStr = isCoupon ? price1 : price2;
        // 计费点活动角标+img
        var disStr = '<div class="corner"><img src="' + productCorner.coupon + '"></div><b>券后 :</b><span class="num">' + price1 / 100 + '</span>' + typeMonth[className] + '<p class="num2">原价 : ' + price2 / 100 + '元</p>';
        var proStr = '<div class="corner"><img src="' + productCorner.promation + '"></div><b>特价 :</b><span class="num">' + feeStr / 100 + '</span>' + typeMonth[className] + '<p class="num2">原价 : ' + price2 / 100 + '元</p>';
        var elStr = '';
        if (couponId) {
            elStr = disStr;
        } else {
            elStr = isPromotion ? proStr : (isCoupon ? disStr : '<span class="num">' + price2 / 100 + '</span>' + typeMonth[className]);
            promoId = promotionId ? promotionId : data['promotionid'] ? data['promotionid'] : '';
        }
        var el = '<div class="pkgTypeBtn ' + className + (isCoupon || isPromotion ? ' isDiscount' : '') + '" fee=' + feeStr + ' renew=' + renewStr + ' cycleType=' + cycleType + ' pId=' + id + ' couId=' + couId + ' promoId=' + promoId + '>' + elStr + '</div>';
        return el;
    }

    function renderPriceEl(id) {
        elArr = [];
        var nowData = priceData[id];
        var ringhtIndex = nowData.fee.length - 1;
        var PriceElFirstIndex = 0;
        pkgTypeTag = "pkgTypeBtn" + ringhtIndex
        if (!nowData) {
            return;
        }
        var el = "",
            el1 = "",
            elFlagArr = [];
        var couponFlag = null;
        var showFlag = null;
        var elArr_1 = [],
            elArr_2 = [],
            elArr_3 = [],
            elArr_4 = [],
            elArr_5 = [],
            elArr_6 = [];
        if (nowData.type === "0") {
            priceLen = 1;
            var unit = "元/72小时";
            var originalPrice = nowData.discountFee&&typeof nowData.discountFee=="number"?('<p class="singOrigin">原价：'+ nowData.fee / 100 + unit+'</p>'):""
            el = '<div class="pkgTypeBtn piece" id="pkgTypeBtn0" fee=' + (originalPrice?nowData.discountFee:nowData.fee) + '  renew="0" cycleType="6" pId= "' + id + '"><span>' + (originalPrice?nowData.discountFee:nowData.fee) / 100 + "</span>" + unit + originalPrice +'</div>';
            elArr.push(el)
        } else {
            var nowFee = nowData.fee;
            for (var i in nowFee) {
                el = "", el1 = "", couponFlag = 0, showFlag = 0;
                if (nowFee[i].cycleType == 1) {
                    if (nowFee[i].feeRenew > 0 && !promotionId) {
                        if (couponId) { //只显示优惠券计费点
                            if (nowFee[i].discountCouponFeeRenew > 0 && nowFee[i].feeRenew == nowFee[i].firstFeeRenew) {
                                el = loadEl('feeRenew', 'renewMonth', nowFee[i], id);
                            }
                        } else { //正常都显示
                            if (nowFee[i].feeRenew == nowFee[i].firstFeeRenew) {
                                el = loadEl('feeRenew', 'renewMonth', nowFee[i], id);
                            } else {
                                // 计费点活动角标+img
                                el = '<div class="pkgTypeBtn firstRenewMonth" fee=' + nowFee[i].firstFeeRenew + ' renew="1" cycleType=' + nowFee[i].cycleType + ' pId= "' + id + '"><div class="corner"><img src="' + productCorner.firstMonth + '"></div><span class="num">' + nowFee[i].firstFeeRenew / 100 + "</span>元/1个月<p>次月：" + nowFee[i].feeRenew / 100 + "元</p></div>";
                            }
                        }
                    }
                    if (nowFee[i].fee > 0) {
                        if (couponId) {
                            if (nowFee[i].discountCouponFee > 0) {
                                el1 = loadEl('fee', 'month', nowFee[i], id)
                            }
                        } else if (promotionId) {
                            if (nowFee[i].teFee && nowFee[i].teFee > 0) {
                                el1 = loadEl('fee', 'month', nowFee[i], id)
                            }
                        } else {
                            el1 = loadEl('fee', 'month', nowFee[i], id);
                        }
                    }
                } else if (nowFee[i].cycleType == 2) {
                    if (nowFee[i].feeRenew > 0 && !promotionId) {
                        if (couponId) {
                            if (nowFee[i].discountCouponFeeRenew > 0 && nowFee[i].feeRenew == nowFee[i].firstFeeRenew) {
                                el = loadEl('feeRenew', 'renewSeason', nowFee[i], id);
                            }
                        } else {
                            if (nowFee[i].feeRenew == nowFee[i].firstFeeRenew) {
                                el = loadEl('feeRenew', 'renewSeason', nowFee[i], id)
                            } else {
                                el = '<div class="pkgTypeBtn firstRenewSeason" fee=' + nowFee[i].firstFeeRenew + ' renew="1" cycleType=' + nowFee[i].cycleType + ' pId= "' + id + '"><div class="corner"><img src="' + productCorner.firstSeason + '"></div><span class="num">' + nowFee[i].firstFeeRenew / 100 + "</span>元/3个月<p>次季：" + nowFee[i].feeRenew / 100 + "元</p></div>";
                            }
                        }
                    }
                    if (nowFee[i].fee > 0) {
                        if (couponId) {
                            if (nowFee[i].discountCouponFee > 0) {
                                el1 = loadEl('fee', 'threeMonth', nowFee[i], id)
                            }
                        } else if (promotionId) {
                            if (nowFee[i].teFee && nowFee[i].teFee > 0) {
                                el1 = loadEl('fee', 'threeMonth', nowFee[i], id)
                            }
                        } else {
                            el1 = loadEl('fee', 'threeMonth', nowFee[i], id);
                        }
                    }
                } else if (nowFee[i].cycleType == 4) {
                    if (nowFee[i].feeRenew > 0) {
                        el = loadEl('feeRenew', 'renewYear', nowFee[i], id);
                    }
                    if (nowFee[i].fee > 0) {
                        if (promotionId) {
                            if (nowFee[i].teFee && nowFee[i].teFee > 0) {
                                el1 = loadEl('fee', 'year', nowFee[i], id)
                            }
                        } else {
                            el1 = loadEl('fee', 'year', nowFee[i], id);
                        }
                    }
                } else if (nowFee[i].cycleType == 6) {
                    if (promotionId) {
                        if (nowFee[i].teFee && nowFee[i].teFee > 0) {
                            el1 = loadEl('fee', 'month1', nowFee[i], id)
                        }
                    } else {
                        el1 = loadEl('fee', 'month1', nowFee[i], id);
                    }
                }
                couponFlag = nowFee[i].feeRenew != nowFee[i].firstFeeRenew ? 5 : nowFee[i].discountCouponFeeRenew > 0 ? 4 : 3; // 连续计费点
                showFlag = nowFee[i].teFee > 0 ? 2 : (nowFee[i].discountCouponFee > 0 ? 1 : 0); // 不连续 
                if (el) { //连续产品 => 有优惠 4，没有 3
                    elArr.push(el);
                    elFlagArr.push(couponFlag)
                }
                if (el1) { //单包产品 => 特价 2 有优惠 1 没优惠 0 ~~~~页面展示为 4 3 2 1 0  
                    elArr.push(el1);
                    elFlagArr.push(showFlag)
                }
            }
            //重新排序：连续 > 特价 > 有优惠 > 没有优惠
            for (var i in elFlagArr) {
                elFlagArr[i] === 5 && elArr_1.push(elArr[i]);
                elFlagArr[i] === 4 && elArr_2.push(elArr[i]);
                elFlagArr[i] === 3 && elArr_3.push(elArr[i]);
                elFlagArr[i] === 2 && elArr_4.push(elArr[i]);
                elFlagArr[i] === 1 && elArr_5.push(elArr[i]);
                elFlagArr[i] === 0 && elArr_6.push(elArr[i]);
            }
            elArr = null;
            elArr = elArr_1.concat(elArr_2).concat(elArr_3).concat(elArr_4).concat(elArr_5).concat(elArr_6);
        }
        priceLen = elArr.length;
        renderpkgList(0, elArr);
        var pkgMaxSize = priceLen > 3 ? 3 : priceLen;
        var pre = "pkgTypeBtn";
        var pkgTypeBtnD = function () {
            var index = +ACTIVE_OBJECT.index + 1;
            if (index > 2 && priceLen > 3) {
                PriceElFirstIndex++;
                renderpkgList(PriceElFirstIndex);
                focusTo(ACTIVE_OBJECT.key);
                return;
            }
            focusToP(index);
        };
        var pkgTypeBtnU = function () {
            var index = +ACTIVE_OBJECT.index - 1;
            if (index < 0 && priceLen > 3) {
                PriceElFirstIndex--;
                if (PriceElFirstIndex < 0) {
                    PriceElFirstIndex = priceLen - 1;
                }
                renderpkgList(PriceElFirstIndex);
                focusTo(ACTIVE_OBJECT.key);
                return;
            }
            focusToP(index);
        };
        var pkgTypeBtnL = function () {
            focusTo(pkgFocus);
        };
        var focusToP = function (index) {
            var el = $("#" + pre + index);
            if (el.length) {
                $.focusTo(pre + index);
            }
        };
        var priceInfo = [];
        // var pkgList = [];
        for (var i = 0; i < pkgMaxSize; i++) {
            // pkgList.push(elArr[i])
            priceInfo.push({
                key: pre + i,
                pressUp: pkgTypeBtnU,
                pressDown: pkgTypeBtnD,
                pressLeft: pkgTypeBtnL,
                pressOk: btnOk,
                pressBack: function(){
                    var orderRetainInfo = eval('epgData_' + ($.getVariable("EPG:isTest") ? '1100011657' : '1100011692'));
                    var tag = $.isBack()?backTag:trainTag;
                    var picType = !!$.getPic(orderRetainInfo[0].pics,[121])
                    if(($.isBack()&&!tag&&orderRetainInfo.length>0&&orderRetainInfo[0].pics.length>0&&picType)||(!$.isBack()&&!tag&&orderRetainInfo.length>0&&orderRetainInfo[0].pics.length>0&&picType)){
                        $.pTool.active("orderRetain");return true;
                    }
                },
                index: i
            });
        }
        PAGE_INFO = PAGE_INFO.concat(priceInfo);

        // $(".pkgTypeContainer").html(pkgList.join(""));
        if (!$priceBtnDown) {
            $priceBtnDown = $("<div id='priceBtnDown' class='priceBtnArrow hide'></div>");
            $priceBtnDown.appendTo("body");
        }
        if (!$priceBtnUp) {
            $priceBtnUp = $("<div id='priceBtnUp' class='priceBtnArrow hide'></div>");
            $priceBtnUp.appendTo("body");
        }
        if (priceLen > 3) {
            $("#priceBtnUp").show();
            $("#priceBtnDown").show();
        } else {
            $("#priceBtnUp").hide();
            $("#priceBtnDown").hide();
        }
        // setPriceStyle(pkgList.length);
    }

    function setPriceStyle(len) {
        if (!len) {
            return;
        }
        var margin = 31,
            h = 162;
        var mTop = (h * len + (len - 1) * margin) / -2;
        $(".pkgTypeContainer").css("marginTop", mTop * 1.5 + "px");
    }

    function renderpkgList(index) {
        var pkgList = [];
        var pkgMaxSize = elArr.length > 3 ? 3 : elArr.length;
        for (var i = 0; i < pkgMaxSize; i++) {
            pkgList.push(elArr[(i + index) % elArr.length])
        }
        $(".pkgTypeContainer").html(pkgList.join(""));
        var nodeArr = $(".pkgTypeContainer")[0].children;
        for (var i = 0; i < nodeArr.length; i++) {
            nodeArr[i].id = "pkgTypeBtn" + i;
        }
        setPriceStyle(pkgList.length);
    }

    function creatPkgList() {
        var len = productId.length >= 3 ? 3 : productId.length;
        var elArr = [],
            el = "";
        var cur = "";
        for (var i = 0; i < len; i++) {
            if (i == currentIndex) {
                cur = "current";
            } else {
                cur = "";
            }
            // 计费点活动角标+img
            el = '<div class="pkgListWrap ' + cur + '" id = "pkg' + i + '"><div class="pkgList" >' + '<div class="pCorner hide" id="pCorner' + i + '"><img></div>' + '<div class="pName" id="pName' + i + '"></div>' + '<div class="pMarquee" id="pMarquee' + i + '"></div>' + '<div class="pPrice" id="pPrice' + i + '"></div>' + '<div class ="pDes" id="pDes' + i + '"></div>' + '</div> <div class="ar"></div></div>';
            elArr.push(el);
        }
        $(elArr.join("")).appendTo($("#pkgListContainter .wrap"));
        if(pkgInfo[productId[0]].bgPath){
            $("#pkgListStyle").css({
                'background': 'url(' + pkgInfo[productId[0]].bgPath + ') no-repeat',
                'backgroundSize': '1920px 1080px'
            });
        } 
    }

    function arrowAutoShow() {
        if (!$down) {
            $down = $("<div id='down' class='arrow hide'></div>");
            $down.appendTo("body");
        }
        if (!$up) {
            $up = $("<div id='up' class='arrow hide'></div>");
            $up.appendTo("body");
        }
        if (productId.length > 3) {
            $("#up").show();
            $("#down").show();
        } else {
            $("#up").hide();
            $("#down").hide();
        }
    }

    function creatPageInfo() {
        var len = productId.length >= maxLen ? maxLen : productId.length;
        var info = {};
        for (var i = 0; i < len; i++) {
            info = {
                key: "pkg" + i,
                index: i,
                pressDown: down,
                pressUp: up,
                pressRight: right,
                pressOk: right,
                pressBack: function(){
                    var orderRetainInfo = eval('epgData_' + ($.getVariable("EPG:isTest") ? '1100011657' : '1100011692'));
                    var tag = $.isBack()?backTag:trainTag;
                    var picType = !!$.getPic(orderRetainInfo[0].pics,[121])
                    if(($.isBack()&&!tag&&orderRetainInfo.length>0&&orderRetainInfo[0].pics.length>0&&picType)||(!$.isBack()&&!tag&&orderRetainInfo.length>0&&orderRetainInfo[0].pics.length>0&&picType)){
                        $.pTool.active("orderRetain");return true;
                    }
                },
                pre: "pkg"
            };
            PAGE_INFO.push(info);
        }
    }

    function addCurrent(key) {
        $("#" + key).addClass("current");
    }

    function btnOk() {
        var el = $(".focusBorder");
        var cou_id = couponId ? couponId : el.attr("couId");
        var opt = {
            id: el.attr("pId"),
            cycleType: el.attr("cycleType"),
            renew: el.attr("renew"),
            fee: el.attr("fee"),
            couponId: cou_id,
            tFeeId: el.attr("promoId")
        };
        saveInfo();
        $.auth.buy(opt);
    }

    function down() {
        var index = ACTIVE_OBJECT.index,
            length = productId.length;
        if (count === length - 1) {
            $.focusTo('userAgreementEntey');
            return;
        }
        count++;
        index++;
        if(pkgInfo[productId[count]].bgPath){
            $("#pkgListStyle").css({
                'background': 'url(' + pkgInfo[productId[count]].bgPath + ') no-repeat',
                'backgroundSize': '1920px 1080px'
            });
        }else{
            $("#pkgListStyle").css({
                'background': 'url(./images/bg.jpg) no-repeat',
                'backgroundSize': '1920px 1080px'
            });            
        }   
        if (count === productId.length - 1 || (index == 1 && count >= length - 2)) {
            $("#down").hide();
        } else {
            $("#down").show();
        }
        if (count < 3) {
            $("#up").hide();
        } else {
            $("#up").show();
        }
        if (index > maxLen - 1) {
            firstIndex++;
            renderContent(firstIndex);
            focusTo(ACTIVE_OBJECT.key);
            return;
        }
        // if(index >=2 && count < 4 ){
        //     $("#down").show();
        // }
        var pre = ACTIVE_OBJECT.pre;
        focusTo(pre + index);

    }

    function up() {
        var index = ACTIVE_OBJECT.index,
            length = productId.length;
        if (count === 0) {
            return;
        }
        if (index === 0 && length <= maxLen) {
            return;
        }
        count--;
        index--;
        if(pkgInfo[productId[count]].bgPath){
            $("#pkgListStyle").css({
                'background': 'url(' + pkgInfo[productId[count]].bgPath + ') no-repeat',
                'backgroundSize': '1920px 1080px'
            });
        }else{
            $("#pkgListStyle").css({
                'background': 'url(./images/bg.jpg) no-repeat',
                'backgroundSize': '1920px 1080px'
            });            
        }
        if (count < length - 3) {
            $("#down").show();
        } else {
            $("#down").hide();
        }
        if (index < 0) {
            firstIndex--;
            if (firstIndex < 0) {
                firstIndex = length - 1;
            }
            renderContent(firstIndex);
            focusTo(ACTIVE_OBJECT.key);
            return;
        }
        var pre = ACTIVE_OBJECT.pre;
        focusTo(pre + index);
    }

    function right() {
        pkgFocus = ACTIVE_OBJECT.key;
        currentIndex = ACTIVE_OBJECT.index;
        addCurrent(pkgFocus);
        if ($(".pkgTypeContainer")[0].children.length) {
            $.focusTo("pkgTypeBtn0");
        }
    }

    function renderContent(index) {
        var len = productId.length > maxLen ? maxLen : productId.length;
        var length = productId.length;
        var name = "";
        var p = {};
        var flag = false;
        var nPrice = "";
        var des = "";
        var subName = "";
        var pId = "";
        var originalPrice = "";
        for (var i = 0; i < len; i++) {
            p = pkgInfo[productId[(i + index) % length]];
            if (p) {
                if (p.type !== "0") {
                    name = p.productName;
                } else {
                    name = decodeURI(vodName) + "( 单片 )";
                }
                name = $.substringElLength(name, "26px", "430px");
                subName = name.last;
                pId = p.chargeId;
                flag = name.flag;
                originalPrice = priceData[pId].discountFee&&typeof priceData[pId].discountFee=="number"?priceData[pId].discountFee:priceData[pId].minPrice;
                nPrice = originalPrice / 100 + "元起";
                des = $.substringElLength(p.description, "18px", "1250px").last;
            }
            if (p.pkgType === "B") {
                $("#pkg" + i).addClass("vip");
            } else {
                $("#pkg" + i).removeClass("vip");
            }
            // 套餐包活动角标begin
            if (p.picCornerPath == "") {
                $("#pkg" + i + " .pCorner").hide();
            } else {
                var picCorner = p.picCornerPath;
                $("#pkg" + i + " .pCorner").show();
                $("#pkg" + i + " .pCorner").find("img").attr({
                    src: picCorner
                });
            }
            // 套餐包活动角标end
            $("#pkg" + i).attr("des", des);
            $("#pkg" + i).attr("pId", pId);
            PAGE_INFO[i].marquee = [flag, "#pkg" + i + " .pName", "78%"];
            PAGE_INFO[i].wholeMsg = name.all;
            $("#pkg" + i + " .pName").html(subName);
            $("#pkg" + i + " .pPrice").html(nPrice);
            $("#pkg" + i + " .pDes").html(des);
        }
    }

    function initFocus() {
        // var iffocu = 'pkg0';
        // if(!isBlackListFlag){
        //     iffocu = 'efreturn';
        // }
        var pageInfo = $.initPageInfo(pageName, ["focus", "firstIndex", "currentIndex", "count"], {
            focus: 'pkg0',
            firstIndex: 0,
            count: 0,
            currentIndex: 0
        });
        return pageInfo;
    }

    function focusTo(key) {
        if (productId.length > 3) {
            if (count === 0) {
                $("#up").hide();
            }
        }
        $.focusTo(key);
        $(".focusBorder").removeClass("current");
        if (!/pkgTypeBtn/.test(key)) {
            var id = $(".focusBorder").attr("pId");
            renderPriceEl(id);
        }
    }

    function _init() {
        var pageInfo = initFocus();
        firstIndex = pageInfo.firstIndex;
        currentIndex = pageInfo.currentIndex;
        count = pageInfo.count;
        creatPkgList();
        creatPageInfo();
        arrowAutoShow();
        renderContent(firstIndex);
        if ($.isBack()) {
            renderPriceEl(productId[firstIndex + currentIndex]);
            pkgFocus = "pkg" + currentIndex;
        }
        focusTo(pageInfo.focus);

    }

    function saveInfo() {
        $.savePageInfo(pageName, {
            focus: ACTIVE_OBJECT.key,
            currentIndex: currentIndex,
            firstIndex: firstIndex,
            count: count
        });
    }
    return {
        init: _init,
        queryPrice: _queryPrice
    };
}();
// 黑名单逻辑功能
var blackList = (function () {
    var _userId = $.getVariable("EPG:userId");
    var _siteIp = $.getVariable("EPG:isTest") ? 'http://10.128.7.100:9080' : 'http://10.128.7.43:8288'; // 测试地址http://10.128.7.100:9080  现网http://10.128.7.43:8288
    var _blackListUrl = _siteIp + '/valuedas/api/1.0/whiteblack/checkblack?callback=blackData&iptvid=' + _userId;
    var _btnObj = {};

    function _load() {
        _isBlackList();
        _joinObj();
    }

    function _isBlackList() {
        loader(_blackListUrl, {
            success: function (res) {
                if (res && res[0]) {
                    res = res[0]
                }
                if (res && res.code == 0) {
                    isBlackListFlag = res.data == 0 ? 0 : 1; // res.data -> 0 在黑名单，1 不在
                    if (isBlackListFlag == 0) {
                        _showTip();
                    }
                }
            },
            error: function () {
                isBlackListFlag = 1;
            },
            jsonpName: 'blackData',
            timeout: 3000
        });
    }

    function _joinObj() {
        _btnObj = {
            key: 'efreturn',
            pressUp: '',
            pressDown: '',
            pressLeft: '',
            pressOk: _ok,
        };
        PAGE_INFO = PAGE_INFO.concat(_btnObj);
    }

    function _enter() {
        isBlackListFlag == '0' ? $.focusTo('efreturn') : '';
        return isBlackListFlag;
    }

    function _ok() {
        $.back();
    }

    function _showTip() {
        $('#elasticFrame').show();
        $.focusTo('efreturn');
    }
    return {
        isBlackList: _isBlackList,
        load: _load,
        enter: _enter
    }
})();
// 用户协议逻辑功能
var userAgreement = (function () {
    var divHeight, contentHeight;
    var diff;
    var moveCount = 0;
    var maxCount;
    var _btnObj = {};
    var moveHeight = 42;
    var scrollMove;

    function _load() {
        _isUserAgreement();
    }

    function _isUserAgreement() {
        // 根据导读号获取到配置的用户协议内容
        var userAgreementInfo = eval('epgData_' + ($.getVariable('EPG:isTest') ? '1100004975' : '1100005063'));
        // 如果用户协议里配置的内容不为空，则展示用户协议的点击按钮
        if (userAgreementInfo[0].contentUri.length > 0 && userAgreementInfo[0].contentUri != '1') {
            // 匹配@@和##字符 @@：表示换行
            userAgreementInfo[0].contentUri = userAgreementInfo[0].contentUri.replace(/\#\#/g, "　　").replace(/\@\@/g, "<br>");
            $("#innerContent").html(userAgreementInfo[0].contentUri);
            _showUserAgreementEntey();
            _joinKeyObj();
        }
    }
    // 封装一个滚动条的代码
    function _init() {
        //获取展示区域的高度
        divHeight = document.getElementById('outContent').clientHeight;
        // 获取内容得实际高度
        contentHeight = document.getElementById('innerContent').scrollHeight;
        // 判断内容高度和展示区域高度，如果内容高度大于展示区域高度，则滚动条显示
        if (contentHeight > divHeight) {
            diff = contentHeight - divHeight;
            maxCount = Math.ceil(diff / moveHeight);
            $('#scrollBorder').show();
            $('#scroll').show();
            _initScrollBar()
        }
    }

    function _initScrollBar() {
        // 获取滚动条槽的高度
        var scrollBorderHeight = $('#scrollBorder')[0].clientHeight;
        var scrollHeight = $('#scroll')[0].clientHeight;
        if (maxCount > 0) {
            // 计算得出滚动条每次移动的距离
            scrollMove = (scrollBorderHeight - scrollHeight) / maxCount
        }
    }

    function _showInfo() {
        $('#userAgreement').show();
        $.focusTo('userAgreement');
    }

    function _showUserAgreementEntey() {
        $('#userAgreementEntey').show();
        $.focusTo('userAgreementEntey');
    }

    function _joinKeyObj() {
        var _btnObj1 = {
            key: 'userAgreementEntey',
            pressUp: _keyPressUp,
            pressRight: _keyRight,
            pressOk: _keyOk,
            pressBack: function(){
                var orderRetainInfo = eval('epgData_' + ($.getVariable("EPG:isTest") ? '1100011657' : '1100011692'));
                var tag = $.isBack()?backTag:trainTag;
                var picType = !!$.getPic(orderRetainInfo[0].pics,[121])
                if(($.isBack()&&!tag&&orderRetainInfo.length>0&&orderRetainInfo[0].pics.length>0&&picType)||(!$.isBack()&&!tag&&orderRetainInfo.length>0&&orderRetainInfo[0].pics.length>0&&picType)){
                    $.pTool.active("orderRetain");return true;
                }              
            }
        };
        PAGE_INFO = PAGE_INFO.concat(_btnObj1);
    }

    function _keyOk() {
        _joinObj();
        _showInfo();
        _init();
    }

    function _keyPressUp() {
        var upIndex = pkgLength - 1;
        if (pkgLength > 2) {
            upIndex = 2
        }
        if (tzFlag) {
            $.focusTo('coordinatePrice');
        } else {
            $.focusTo('pkg' + upIndex);
        }
    }

    function _keyRight() {
        var rightIndex = pkgLength - 1;
        if (pkgLength > 2) {
            rightIndex = 2
        }
        pkgFocus = 'pkg' + rightIndex;
        $("#" + pkgFocus).addClass("current");
        if ($(".pkgTypeContainer")[0].children.length) {
            $.focusTo("pkgTypeBtn" + --$(".pkgTypeContainer")[0].children.length);
        }
    }

    function _joinObj() {
        _btnObj = {
            key: 'userAgreement',
            pressUp: _pressUp,
            pressDown: _pressDown,
            pressOk: _ok,
            pressBack: _back
        };
        PAGE_INFO = PAGE_INFO.concat(_btnObj);
    }

    function _back() {
        $('#userAgreement').hide();
        $.focusTo('userAgreementEntey');
        return true;
    }

    function _ok() {
        $('#userAgreement').hide();
        $.focusTo('userAgreementEntey');
    }

    function _pressUp() {
        if (moveCount > 0) {
            moveCount--;
            $("#innerContent").css({
                "-webkit-transform": "translateY(" + -(moveCount * moveHeight) + "px)"
            });
            $("#scroll").css({
                "-webkit-transform": "translateY(" + (moveCount * scrollMove) + "px)"
            });
            diff += moveHeight;
        } else {
            return;
        }
    }

    function _pressDown() {
        if (moveCount >= maxCount) {
            return;
        }
        if (diff > 0) {
            moveCount++;
            $("#innerContent").css({
                "-webkit-transform": "translateY(" + -(moveCount * moveHeight) + "px)"
            });
            $("#scroll").css({
                "-webkit-transform": "translateY(" + (moveCount * scrollMove) + "px)"
            });
            diff -= moveHeight;
        } else {
            return;
        }
    }
    return {
        load: _load
    }
})();
// 处理小数计算的失真方法
function accAdd(arg1, arg2) {
    var r1, r2, m;
    try { r1 = arg1.toString().split(".")[1].length || 0 } catch (e) { r1 = 0 }
    try { r2 = arg2.toString().split(".")[1].length || 0 } catch (e) { r2 = 0 }
    m = Math.pow(10, Math.max(r1, r2));
    var n = (r1 >= r2) ? r1 : r2;
    return ((arg1 * m + arg2 * m) / m).toFixed(n)
}