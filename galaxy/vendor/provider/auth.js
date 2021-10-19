var name = "provider:auth";

var lg = Logger;

var authObj = {};

var CHARGE_INFO = null;

function enable() {
    var SDK = $.s.auth;
    var newSDK = AUTH_LIB_SDK;
    var USER_ID = EPG.userId;
    $.getHelper("provider:charge").topic.sub("change", function () {
        CHARGE_INFO = null;
    });

    function createChargeInfo() {
        var chargeInfo = $.getHelper("provider:charge").cache() || {};
        var pkg = {},
            type = {};
        if (chargeInfo) {
            for (var k in chargeInfo) {
                var v = chargeInfo[k];
                pkg[k] = {
                    spId: v.chargesSpId,
                    type: v.chargesType,
                    productName: v.chargesName,
                    description: v.chargesDescription,
                    chargeId: k,
                    pkgType: v.pkgType,
                    url: v.vipAreaUrl,
                    picPath: getPic(v.pics, [73]),
                    bgPath: getPic(v.pics, [121]),
                    picCornerPath: getPic(v.jsChargesPicInfos, [0]), //套餐包活动角标
                    entrance: v.entrance
                };
                type[v.entrance] = k + "|" + v.pkgType;
            }
        }
        return {
            PACKAGE: pkg,
            TYPE: type
        };
    }

    function upDateChargeInfo() {
        if (!CHARGE_INFO) {
            CHARGE_INFO = createChargeInfo();
        }
        return CHARGE_INFO;
    }

    function getPic(e, t, i) {
        var n = "",
            s = i && i.picType || "picType",
            a = i && i.picPath || "picPath";
        return $.UTIL.each(t, function (t) {
            return $.UTIL.each(e, function (e) {
                if (e[s] == t) return n = e[a], !0;
            });
        }), n && (n = "/pic/" + n), n;
    }
    var PACKAGE = function () {
        var p = upDateChargeInfo().PACKAGE;
        if (JSON.stringify(p) === "{}") {
            CHARGE_INFO = null;
            p = upDateChargeInfo().PACKAGE;
        }
        return p || {};
    };
    var TYPE = function () {
        return upDateChargeInfo().TYPE || {};
    };
    var areaId = EPG["areaId"];
    var pageUrl = EPG.pathPage;
    var qrCodeUrl = $.getVariable("common.orders") + "/orders";
    var cfg = {
        spId: "",
        entrance: "",
        finish: false,
        callback: null,
        authData: null,
        chargeData: null,
        cpData: null,
        playData: {},
        contentId: "",
        serialFlag: "",
        contentType: "",
        simple: [],
        vertical: [],
        sp: [],
        big: [],
        channel: []
    };
    var cpIds = [];
    var cycleTypeMap = {
        1: "1个月",
        2: "3个月",
        3: "6个月",
        4: "12个月",
        5: "7天",
        6: "72小时",
        7: "天"
    };
    var URLS = {
        purchase: pageUrl + "/myOrder/",
        buyPage: pageUrl + "/noAuth/buyPage/index.html",
        resultPage: pageUrl + "/noAuth/payResult/index.html",
        jwPage: pageUrl + "/activitiesZone/HIPHOP/home/",
        payPage: pageUrl + "/noAuth/payPage/index.html"
    };
    var isInPack = function (id) {
        var package = PACKAGE();
        if (package[id]) {
            return !0;
        }
        return !!0;
    };
    var transData = function (opt) {
        var chargeData = [];
        var authData = [];
        var cpData = {};
        for (var i in opt) {
            var id = opt[i].chargeId;
            if (isInPack(id)) {
                chargeData.push(opt[i].chargeId);
                authData.push(id);
                opt[i].cpId && (cpData[id] = opt[i].chargeId + "|" + opt[i].cpId);
            }
        }
        return {
            authData: authData,
            cpData: cpData,
            chargeData: chargeData
        };
    };
    var clearData = function () {
        cfg = {
            spId: "",
            entrance: "",
            finish: false,
            callback: null,
            authData: null,
            chargeData: null,
            cpData: null,
            playData: {},
            contentId: "",
            serialFlag: "",
            contentType: "",
            simple: [],
            vertical: [],
            sp: [],
            big: [],
            channel: []
        };
        cpIds = [];
    };
    var getBigInPkg = function (packs) {
        var package = PACKAGE();
        var pack = "";
        for (var i = 0; i < packs.length; i++) {
            pack = packs[i];
            if (package[pack] && package[pack].pkgType === "B") {
                return pack;
            }
        }
        return "";
    };
    var outChargesType = function (pIds) {
        var out = [],
            package = PACKAGE();
        for (var i = 0; i < pIds.length; i++) {
            if (package[pIds[i]].type == 0) {
                out.push(0);
            } else {
                out.push(1);
            }
        }
        return out;
    };
    var tasks = {
        serviceAuthNew: function (key, callback) {
            var contentId = cfg.playData.seriesId || cfg.playData.contentId || "";
            var productId = cfg.authData + "";
            var chargesType = outChargesType(cfg.authData) + "";
            SDK.productAuth({
                productId: productId,
                contentId: contentId,
                chargesType: chargesType,
                token: Authentication.CUGetConfig("AuthToken") || ""
            }, {
                success: function (res) {
                    var reslut = res;
                    if (reslut.hasOwnProperty('code')) { // 有code则返回错误msg
                        reslut = {
                            code: "timeOut"
                        }
                    }
                    serviceAuthNewCallback(reslut, callback);
                    callback = res = null;
                },
                error: function () {
                    serviceAuthNewCallback({
                        code: 'timeOut'
                    }, callback);
                    callback = null;
                },
                timeout: cfg.timeout
            });
            cfg.timeout = null
        },
        serviceAuthNewbyP: function (key, callback) {
            var contentId = cfg.playData.seriesId || cfg.playData.contentId || "";
            var productId = cfg.authData + "";
            var chargesType = outChargesType(cfg.authData) + "";
            SDK.productAuth({
                productId: productId,
                contentId: contentId,
                chargesType: chargesType,
                token: Authentication.CUGetConfig("AuthToken") || ""
            }, {
                success: function (res) {
                    var out = {};
                    var list = res || {};
                    $.UTIL.each(list, function (item, index) {
                        if (item.result == "0") {
                            out[index] = true;
                        } else {
                            out[index] = false;
                        }
                    });
                    callback && callback(out);
                    callback = null;
                },
                error: function () {
                    callback && callback({
                        code: "timeOut"
                    });
                    callback = null;
                }
            });
        }
    };
    var queryPkgPrice = function (productIds, cb) {
        $.s.auth.queryPkgPrice({
            productIds: productIds
        }, {
            success: function (res) {
                cb(1, res);
            },
            error: function () {
                cb(0);
            }
        });
    };
    var isPPV = function (pId) {
        if (isInPack(pId) && PACKAGE()[pId].type === "0") {
            return !0;
        }
        return !!0;
    };
    var _judgeEntrance = function () {
        switch (cfg.entrance.replace(/\d+$/, "")) {
            case "V":
                _reorder("V");
                break;

            case "S":
                _reorder("S");
                break;

            default:
                _reorder();
                break;
        }
    };
    var _doNextStep = function (key) {
        tasks[key] && tasks[key].apply(null, arguments);
    };
    var _reorder = function (type) {
        var ids = cfg.authData,
            pType = "",
            package = PACKAGE();
        for (var i in ids) {
            pType = package[ids[i]].pkgType;
            if (pType == "") {
                cfg.simple.push(ids[i]);
                continue;
            }
            if (/V/.test(pType)) {
                cfg.vertical.push(ids[i]);
                continue;
            }
            if (pType == "S") {
                cfg.sp.push(ids[i]);
                continue;
            }
            if (pType == "B") cfg.big.push(ids[i]);
            if (pType == "C") cfg.channel.push(ids[i]);
            if (pType == "underLine") {
                cfg.vertical.push(ids[i]);
                cfg.chargeData.splice(i, 1);
            }
        }
        switch (type) {
            case "V":
                cfg.authData = cfg.big.concat(sortVertical(cfg.vertical), cfg.simple, cfg.sp);
                break;

            case "S":
                cfg.sp = [cfg.entranceId];
                cfg.bigAuthId = getBigInPkg(cfg.authData);
                cfg.bigAuthId && cfg.sp.push(cfg.bigAuthId);
                cfg.authData = cfg.sp.concat(cfg.simple, cfg.vertical);
                break;

            default:
                cfg.authData = cfg.big.concat(sortVertical(cfg.vertical), cfg.simple, cfg.sp, cfg.channel);
                break;
        }
    };
    var sortVertical = function (arr) {
        if (arr.length <= 1) {
            return arr;
        }
        var package = PACKAGE();
        return arr.sort(function (a, b) {
            return package[a].pkgType.replace("V", "") - package[b].pkgType.replace("V", "");
        });
    };
    var isErrorBind = function (entranceId, pIds) {
        for (var i in pIds) {
            if (pIds[i] == entranceId) return !!0;
        }
        return !0;
    };
    var isFree = function (pIds) {
        var package = PACKAGE();
        for (var i in pIds) {
            if (package[pIds[i]]) return !!0;
        }
        return !0;
    };
    var isBig = function (id) {
        var p = PACKAGE();
        if (p[id] && p[id].pkgType === "B") {
            return !0;
        }
        return !!0;
    };
    var auth = function (opt) {
        clearData();
        var data = transData(opt.package || []);
        cfg.authData = data.authData;
        cfg.cpData = data.cpData;
        cfg.chargeData = data.chargeData;
        var entrance = TYPE()[opt.entrance] ? TYPE()[opt.entrance].split("|") : ["", ""];
        cfg.entranceId = entrance[0];
        cfg.entrance = isErrorBind(cfg.entranceId, cfg.authData) ? "" : entrance[1];
        if (opt.playData && opt.playData.contentType === "5") {
            cfg.serialFlag = opt.playData.serialFlag;
        }
        opt.timeout && (cfg.timeout = opt.timeout);
        cfg.playData = opt.playData || {};
        if (isFree(cfg.authData)) return opt.callback(1);
        _judgeEntrance();
        _doNextStep("serviceAuthNew", opt.callback);
    };
    var auth4Pkg = function (opt) {
        clearData();
        var data = transData(opt.package || []);
        cfg.authData = data.authData;
        cfg.playData = opt.playData || {};
        _doNextStep("serviceAuthNewbyP", opt.callback);
    };
    var _forwardOrder = function (isRedirect, noSendVS, pkgArr) {
        if (pkgArr) {
            cfg.chargeData = pkgArr;
        }
        if (!noSendVS) {
            vs.beforOrder();
        }
        var url = $.search.append(URLS["buyPage"], {
            productId: pkgArr && pkgArr.join(",") || cfg.chargeData.join(","),
            firstIndex: cfg.firstIndex || null,
            focusIndex: cfg.focusIndex || null
        });
        isRedirect ? $.redirect(url) : $.forward(url);
    };
    var saveFocusIndex = function (opt) {
        cfg.firstIndex = opt.firstIndex;
        cfg.focusIndex = opt.focusIndex;
    };
    var creatOrderForm = function (opt) {
        opt.vodName = cfg.playData.vodName || "";
        opt.areaId = areaId;
        opt.token = Authentication.CUGetConfig("AuthToken") || "";
        opt.customerRenew = opt.customerRenew || "0";
        if (opt.chargesType === "0") {
            opt.productType = cfg.playData.vodSeriesflag || cfg.playData.contentType;
            opt.contentId = cfg.playData.contentId;
            opt.columnId = cfg.playData.categoryId;
            opt.cycleType = "6";
        }
        SDK.creatOrderForm(opt, {
            success: function (res) {
                opt.callback && opt.callback(1, res);
            },
            error: function () {
                opt.callback && opt.callback(0);
            }
        });
    };
    var createPromotionOrderForm = function (opt) {
        opt.areaId = areaId;
        opt.token = Authentication.CUGetConfig("AuthToken") || "";
        opt.userId = USER_ID;
        newSDK.createPromotionOrderForm(opt);
    }
    var queryOrderResult = function (opt) {
        SDK.queryOrderResult({
            orderId: opt.orderId
        }, {
            success: function (res) {
                opt.callback && opt.callback(1, res);
            },
            error: function () {
                opt.callback && opt.callback(0);
            }
        });
    };
    var queryOrderInfo = function (cb) {
        SDK.queryOrderInfo(null, {
            success: function (res) {
                cb && cb(1, res);
            },
            error: function () {
                cb && cb(0);
            }
        });
    };
    var redirectPurchase = function (id) {
        clearData();
        var cur = isPPV(id) ? "dp" : "sfb";
        var url = $.search.append(URLS["purchase"], {
            type: "MO",
            currentMenu: cur
        });
        $.redirect(url);
    };
    var redirectPayResult = function (result, isPlay, pid) {
        var url = $.search.append(URLS["resultPage"], {
            result: !!result,
            isPlay: !!isPlay,
            productId: pid
        });
        if (result && cfg.cpData && cfg.cpData[pid]) {
            cpIds.push(cfg.cpData[pid]);
        }
        $.redirect(url);
    };
    var getPkgInfo = function () {
        var p = PACKAGE() || {};
        if (arguments[0]) return p[arguments[0]];
        return p;
    };
    var getPidUnit = function (type) {
        return cycleTypeMap[type];
    };
    var _saveCp4PlayVideo = function (opt) {
        cpIds = [];
        var cps = opt || cfg.cpData || {};
        for (var cpId in cps) {
            cpIds.push(cps[cpId]);
        }
    };
    var serviceAuthNewCallback = function (authResult, callback) {
        if (authResult.code == 'timeOut') {
            callback && callback('timeOut');
            callback = null;
            return;
        }
        if (authResult.code) {
            vs.authFailed();
            callback && callback(1);
            callback = null;
            return;
        }
        var list = authResult || {};
        var authData = [];
        var cpData = {};
        for (var id in list) {
            if (list[id].result == "0") {
                authData.push(id);
                cpData[id] = cfg.cpData[id];
            }
        }
        var chargeData = [];
        if (cfg.entrance === "S") {
            chargeData = chargeData.concat(cfg.simple, [cfg.entranceId]);
        } else {
            chargeData = chargeData.concat(cfg.authData);
            for (var i = 0; i < chargeData.length; i++) {
                if (PACKAGE()[chargeData[i]].pkgType === "underLine") {
                    chargeData.splice(i, 1);
                    i--;
                }
            }
        }
        cfg.chargeData = chargeData;
        if (authData.length) {
            cfg.authData = authData;
            cfg.cpData = cpData;
            _saveCp4PlayVideo();
        }
        cfg.contentId = cfg.playData.contentId || cfg.contentId;
        cfg.serialFlag = (cfg.playData.vodSeriesflag == 2 ? 1 : cfg.playData.vodSeriesflag) || "";
        callback && callback(authData.length, authData);
        callback = null;
    };
    var getPlayData = function () {
        return cfg.playData;
    };
    var getBigId = function () {
        var p = PACKAGE();
        for (var i in p) {
            if (p[i] && p[i].pkgType === "B") {
                return i;
            }
        }
        return null;
    };
    var getchargeSpIds = function (id) {
        var ids = [cfg.playData.seriesId, cfg.playData.contentId];
        if (ids.indexOf(id) > -1 && cpIds.length) {
            return cpIds.join(",");
        }
        return "";
    };
    var getId4Entrance = function (entrance) {
        for (var i in PACKAGE()) {
            if (PACKAGE()[i].entrance == entrance) {
                return i;
            }
        }
    };
    var vs = {
        sendVS: function (opt) {
            $.vs.product(opt.productId, opt.state, opt.sourcetype, opt.referpage, opt.productMode);
        },
        beforOrder: function () {
            this.sendVS({
                productId: cfg.chargeData.join(","),
                state: "14",
                referpage: cwindow.location.href.split("?")[0]
            });
        },
        orderReturn: function (id, type) {
            this.sendVS({
                productId: id || "",
                productMode: type || "",
                state: "001"
            });
        },
        success: function (id, payType, productMode) {
            this.sendVS({
                productId: id,
                state: "16",
                sourcetype: payType,
                productMode: productMode || ""
            });
        },
        authFailed: function () {
            this.sendVS({
                productId: cfg.authData.join(","),
                productMode: "",
                state: "11"
            });
        },
        cancelOrderVs: function (result, productId) {
            if (result) {
                this.sendVS({
                    productId: productId || "",
                    state: "31",
                });
            } else {
                this.sendVS({
                    productId: productId || "",
                    state: "32",
                });
            }
        }
    };
    var _jw = {
        chargeId: "1100000541",
        gotoJW: function () {
            var url = URLS["jwPage"];
            $.forward(url);
        },
        backJW: function () {
            $.back();
        },
        isJW: function (id) {
            return id === this.chargeId;
        },
        detailInfo: {
            name: "吉林IPTV街舞大赛-决赛直播",
            des: "本收费包为“2019HHI街舞锦标赛中国赛吉林赛区暨第二届吉林IPTV街舞大赛”决赛指定付费包，仅限观看该直播内容。",
            pic: getPkgInfo("1100000541") && getPkgInfo("1100000541").picPath,
            type: "3"
        },
        authInfo: function (opt) {
            var opt = opt || {};
            return {
                playData: {
                    contentId: 9100,
                    vodName: "吉林IPTV街舞大赛-决赛直播",
                    categoryId: opt.categoryId || "",
                    contentType: "5",
                    vodSeriesflag: "0",
                    vodPicMap: [],
                    vodDescription: ""
                },
                package: [{
                    chargeId: "1100000541"
                }],
                callback: opt.callback
            };
        }
    };

    function _isVipChannelPid(id) {
        var p = PACKAGE();
        return p[id] && p[id].pkgType === "C";
    }

    function _isSp(entrance) {
        var t = TYPE();
        return t[entrance] && t[entrance].split("|")[1];
    }

    function _getVipChannelPid() {
        var out = [];
        var p = PACKAGE();
        for (var i in p) {
            if (_isVipChannelPid(i)) {
                out.push(p[i]);
            }
        }
        return out;
    }

    function _authVipChannel(channelNum, callback) {
        auth({
            package: _getVipChannelPid(),
            playData: {
                channelNum: channelNum
            },
            callback: function (res) {
                callback && callback(res);
            }
        });
    }

    function _buy(opt) {
        if (_isVipChannelPid(opt.id)) {
            cfg.playData.noFromDetail = true;
        }
        if (cfg.cpData) {
            _saveCp4PlayVideo({
                id: cfg.cpData[opt.id]
            });
        }
        var url = $.search.append(URLS["payPage"], {
            product: opt.id,
            renew: opt.renew,
            cycleType: opt.cycleType,
            fee: opt.fee,
            couponId: opt.couponId,
            promotionid: opt.promotionid,
            tFeeId: opt.tFeeId,
            pkgNames: opt.pkgNames
        });
        $.forward(url);
    }
    var _getCheckCode = function (opt) {
        SDK.getCheckCode(opt, {
            success: function (res) {
                if (res.code == 0) {
                    opt.callback(1);
                } else {
                    opt.callback(0);
                }
            },
            error: function () {
                opt.callback(0);
            }
        });
    };
    var _queryPhoneScore = function (opt) {
        SDK.queryPhoneScore(opt, {
            success: function (res) {
                if (res.code == 0) {
                    opt.callback(1, res);
                } else {
                    opt.callback(0, res);
                }
            },
            error: function () {
                opt.callback();
            }
        });
    };
    var _payBill = function (opt) {
        var args = $.UTIL.sclone(opt);
        delete args.callback;
        SDK.payBill(args, {
            success: function (res) {
                if (res.code == 0) {
                    opt.callback(1, res);
                } else {
                    opt.callback(0, res);
                }
            },
            error: function () {
                opt.callback(0);
            },
            timeout: 8e3
        });
    };
    var _cancelOrder = function (opt) {
        var args = $.UTIL.sclone(opt);
        delete args.callback;
        SDK.cancel(args, {
            success: function (res) {
                opt.callback && opt.callback(1, res);
            },
            error: function () {
                opt.callback && opt.callback(0);
            }
        });
    };
    var _queryOrderHis = function (productId, callback) {
        newSDK.queryOrderHis(USER_ID, productId, callback);
    };
    var _activeCardServer = function (obj, callback) {
        newSDK.activeCardServer(obj, callback);
    };
    var _cancelOrder2 = function (orderId, callback) {
        newSDK.cancelOrder2(USER_ID, orderId, callback);
    };
    $.UTIL.merge(authObj, {
        auth: auth,
        sendVS: vs,
        isPPV: isPPV,
        isBig: isBig,
        getBigId: getBigId,
        forwardOrder: _forwardOrder,
        getPlayData: getPlayData,
        getPkgInfo: getPkgInfo,
        queryPkgPrice: queryPkgPrice,
        getPidUnit: getPidUnit,
        creatOrderForm: creatOrderForm,
        createPromotionOrderForm: createPromotionOrderForm,
        queryOrderResult: queryOrderResult,
        qrCode: qrCodeUrl,
        redirectPayResult: redirectPayResult,
        saveFocusIndex: saveFocusIndex,
        redirectPurchase: redirectPurchase,
        queryOrderInfo: queryOrderInfo,
        auth4Pkg: auth4Pkg,
        getchargeSpIds: getchargeSpIds,
        jw: _jw,
        authVipChannel: _authVipChannel,
        buy: _buy,
        getCheckCode: _getCheckCode,
        queryPhoneScore: _queryPhoneScore,
        payBill: _payBill,
        cancelOrder: _cancelOrder,
        cancelOrder2: _cancelOrder2,
        getId4Entrance: getId4Entrance,
        isSp: _isSp,
        queryOrderHis: _queryOrderHis,
        activeCardServer: _activeCardServer
    });
}

expt.rev = 1;

expt.expire = 0;

expt.auth = authObj;

expt.enable = enable;