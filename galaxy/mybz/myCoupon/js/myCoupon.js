var couponServerUrl = $.getVariable('EPG:isTest') ? '10.128.7.100:9088' : '10.128.7.5:5666';
var cardServerUrl = $.getVariable('EPG:isTest') ? '10.128.7.100:8087' : '10.128.7.5:8087';
var mc = function () {
    var focusIndex = 0, columnSize = 1, showLine = 4, type = "nouse", ap = null;
    var flag = false;
    function getNowState() {
        var map = {
            nouse: nouseCoupon,
            used: usedCoupon,
            expire: expireCoupon
        };
        return map[type];
    }
    function initContainer() {
        var $container = $('<div id="container"><div id="listContainer"></div><div id="loading" class="hide"></div><div id="progressBar" class="hide"><div id="strip"></div></div><div id="noMc" class="hide"></div></div>');
        $container.appendTo($("body"));
    }
    function loadData() {
        var args = arguments;
        $("#loading").show();
        $.myCoupon.all(function (res) {
            var data = JSON.parse(res);
            $("#loading").hide();
            if (!data) {
                flag = false;
                return;
            }
            flag = true;
            resData = data.data;
            nouseCoupon.data = filteData(1, resData);
            usedCoupon.data = filteData(2, resData);
            expireCoupon.data = filteData(3, resData);
            for (var i in args) {
                args[i] && args[i]();
            }
        })
    }
    function filteData(state, arr) {
        var cardData = [];
        function sortData(ctypeO, ctypeT) {
            return ctypeO.ctype - ctypeT.ctype
        }
        for (var i in arr) {
            if (Number(arr[i].cstatus) === state) {
                cardData.push(arr[i]);
                cardData.sort(sortData)
            }
        }
        return cardData;
    }
    function getTime(str) {
        return new Date(str).getTime();
    }
    function initAP() {
        return new $.AnimatePanel({
            lineHeight: this.lineHeight,
            shadowLine: 1,
            showLine: showLine,
            columnSize: columnSize,
            total: this.data.length,
            firstLineIndex: this.firstLineIndex,
            className: "moContent",
            paddingItem: '<div class="mo_item"></div>',
            transition: "all .6s",
            appendTo: $("#listContainer")[0],
            render: this.renderList.bind(this),
            update: updateInfo
        });
    }
    function updateInfo(info) {
        getNowState().firstLineIndex = info.firstLineIndex;
        if (info.turnLine) {
            focusIndex -= info.columnSize * info.turnLine;
            focusIndex = Math.max(Math.min(focusIndex, info.total - 1), 0);
        }
    }
    function clearAP() {
        if ($(".moContent").length) {
            $("#container #listContainer").html("");
        }
    }
    var nouseCoupon = {
        data: [],
        firstLineIndex: 0,
        lineHeight: 233,
        renderList: function (begin, end) {
            var html = "";
            noPic = "";
            var data = this.data;
            for (var i = begin; i < end; i++) {
                var stateFlag = '';
                if (data[i].willExpire && data[i].willExpire === "1") {
                    stateFlag = "<span class='almostExpired'><span>";
                }
                var worth = data[i].ctype === 1 ? '<div class="cardTypeName">' + data[i].card_typename : '<div class="couponPrice"><span class="signal">￥</span>' + (data[i].discount_worth) / 100;
                var useLimit = data[i].ctype === 1 ? data[i].card_productName : '满' + (data[i].discount_useLimit) / 100 + '可用';
                var name = data[i].ctype === 1 ? data[i].card_productName + ' ' + data[i].card_typename : data[i].discount_name;
                var cardidTime = data[i].ctype === 1 ? '卡号 : ' + data[i].card_id + '' : '有效时间 : ' + data[i].discount_startTime + ' — ' + data[i].expiredTime + '';
                var expiredTxt = data[i].ctype === 1 ? '<span>激活有效期至 : </span><div id="expiredTime' + i + '" class="expiredTime">' + data[i].expiredTime + '</div>' : '<span>适用产品 : </span><div id="productNameGroup' + i + '" class="productNameGroup">' + data[i].discount_productNameGroup + '</div>';
                var useBtn = data[i].ctype === 1 ? '<div class="useBtn" id="useBtn' + i + '">一键激活</div></div>' : '<div class="useBtn" id="useBtn' + i + '">立即使用</div></div>';
                var div = '<div class="mo_item" id="mo_item"' + i + '">' +
                    '<div class="poster">' + worth +
                    '</div><div class="useCondition">' + useLimit + '</div>' + stateFlag + '</div>' +
                    '<div class="name text">' + name + '<span></span></div>' +
                    '<div class="price text"><span>' + cardidTime + '</span></div>' +
                    '<div class="endTime text">' + expiredTxt + '</div>' + useBtn + '';
                html += div;
            }
            return html;
        }
    };
    var usedCoupon = {
        data: [],
        firstLineIndex: 0,
        lineHeight: 233,
        renderList: function (begin, end) {
            var html = "";
            noPic = "";
            var data = this.data;
            for (var i = begin; i < end; i++) {
                var worth = data[i].ctype === 1 ? '<div class="cardTypeName">' + data[i].card_typename : '<div class="couponPrice"><span class="signal">￥</span>' + (data[i].discount_worth) / 100;
                var useLimit = data[i].ctype === 1 ? data[i].card_productName : '满' + (data[i].discount_useLimit) / 100 + '可用';
                var name = data[i].ctype === 1 ? data[i].card_productName + ' ' + data[i].card_typename : data[i].discount_name;
                var cardidTime = data[i].ctype === 1 ? '卡号 : ' + data[i].card_id + '' : '有效时间 : ' + data[i].discount_startTime + ' — ' + data[i].expiredTime + '';
                var expiredTxt = data[i].ctype === 1 ? '<span>使用时间 : </span><div id="expiredTime' + i + '" class="useTime">' + data[i].useTime + '</div>' : '<span>适用产品 : </span><div id="productNameGroup' + i + '" class="productNameGroup">' + data[i].discount_productNameGroup + '</div>';
                var useBtn = data[i].ctype === 1 ? '<div class="useBtn" id="useBtn' + i + '">删除</div></div>' : '<div class="useBtn" id="useBtn' + i + '">删除</div></div>';
                var div = '<div class="mo_item" id="mo_item"' + i + '">' +
                    '<div class="poster">' + worth +
                    '</div><div class="useCondition">' + useLimit + '</div></div>' +
                    '<div class="name text">' + name + '<span></span></div>' +
                    '<div class="price text"><span>' + cardidTime + '</span></div>' +
                    '<div class="endTime text">' + expiredTxt + '</div>' + useBtn + '';
                html += div;
            }
            return html;
        }
    };
    var expireCoupon = {
        data: [],
        firstLineIndex: 0,
        lineHeight: 233,
        renderList: function (begin, end) {
            var html = "";
            noPic = "";
            var data = this.data;
            for (var i = begin; i < end; i++) {
                var worth = data[i].ctype === 1 ? '<div class="cardTypeName">' + data[i].card_typename : '<div class="couponPrice"><span class="signal">￥</span>' + (data[i].discount_worth) / 100;
                var useLimit = data[i].ctype === 1 ? data[i].card_productName : '满' + (data[i].discount_useLimit) / 100 + '可用';
                var name = data[i].ctype === 1 ? data[i].card_productName + ' ' + data[i].card_typename : data[i].discount_name;
                var cardidTime = data[i].ctype === 1 ? '卡号 : ' + data[i].card_id + '' : '有效时间 : ' + data[i].discount_startTime + ' — ' + data[i].expiredTime + '';
                var expiredTxt = data[i].ctype === 1 ? '<span>激活有效期至 : </span><div id="expiredTime' + i + '" class="expiredTime">已过期</div>' : '<span>适用产品 : </span><div id="productNameGroup' + i + '" class="productNameGroup">' + data[i].discount_productNameGroup + '</div>';
                var useBtn = data[i].ctype === 1 ? '<div class="useBtn" id="useBtn' + i + '">删除</div></div>' : '<div class="useBtn" id="useBtn' + i + '">删除</div></div>';
                var div = '<div class="mo_item" id="mo_item"' + i + '">' +
                    '<div class="poster">' + worth +
                    '</div><div class="useCondition">' + useLimit + '</div></div>' +
                    '<div class="name text">' + name + '<span></span></div>' +
                    '<div class="price text"><span>' + cardidTime + '</span></div>' +
                    '<div class="endTime text">' + expiredTxt + '</div>' + useBtn + '';
                html += div;
            }
            return html;
        }
    };
    function moFocus() {
        var el = "#" + "useBtn" + focusIndex;
        var marqueeObj = {
            el: el,
            marquee: ["#productNameGroup" + focusIndex]
        };
        $.focusTo(marqueeObj);
        progress();
    }
    function shake() {
        var el = $($.activeObj.el);
        if (el.length) {
            $("#" + "useBtn" + focusIndex).addClass("public_shake");
        } else {
            $("#" + "useBtn" + focusIndex).addClass("public_shake");
        }
    }
    function p_pkgList() {
        var key = "p_pkgList";
        function getTotalLine() {
            return Math.ceil(getNowState().data.length / columnSize);
        }
        function getFirstIndex() {
            return getNowState().firstLineIndex * columnSize;
        }
        var keysMap = {
            KEY_DOWN: function () {
                var el = $($.activeObj.el);
                if (Math.floor(focusIndex / columnSize) === getTotalLine() - 1) {
                    shake();
                    return true;
                }
                if (focusIndex >= getFirstIndex() + columnSize * (showLine - 1)) {
                    ap.dragUp();
                } else {
                    if (focusIndex + columnSize < getNowState().data.length) {
                        focusIndex += columnSize;
                    } else {
                        if (Math.floor(focusIndex / columnSize) != getTotalLine() - 1) {
                            focusIndex = getNowObj().data.length - 1;
                        }
                    }
                }
                if (el.length) {
                    moFocus();
                }
                return true;
            },
            KEY_UP: function () {
                var el = $($.activeObj.el);
                if (type === 'nouse' && focusIndex === 0) {
                    $.pTool.active(mc.useRulesBtn);
                    return
                }
                if (focusIndex < columnSize) {
                    return;
                }
                if (focusIndex < getFirstIndex() + columnSize) {
                    ap.dragDown();
                } else {
                    focusIndex -= columnSize;
                }

                if (el.length) {
                    moFocus();
                }
                return true;
            },
            KEY_LEFT: function () {
                if (type === 'nouse' && focusIndex === 0) {
                    $.pTool.active(mc.useRulesBtn);
                    return
                }
                if ($($.activeObj.el).length) {
                    mc.left && mc.left();
                } else {
                    moFocus();
                }
            },
            KEY_RIGHT: function () {
                return;
            },
            KEY_OK: function () {
                if (type === "used" || type === "expire") {
                    // 弹出确定删除弹框
                    $.pTool.active("deleteCoupon");
                    return;
                }
                if (type === "nouse") {
                    var nouseData = nouseCoupon.data[focusIndex];
                    if (nouseData.ctype === 1) {
                        $.pTool.get("activeCard").init(mc.init_renderPage, nouseData, 'p_pkgList');
                    } else {
                        var useValid = nouseData.useValid;
                        var canUse = useValid && useValid === '1' ? true : false;
                        !canUse ? $.pTool.active('nouseTime') : $.gotoDetail({
                            contentType: "7",
                            url: "/noAuth/buyPage/index.html?couponId=" + nouseCoupon.data[focusIndex].discount_id + "&productId=" + nouseCoupon.data[focusIndex].discount_productIdGroup.split(",")
                        });
                    }
                }
            },
            KEY_PAGEDOWN: function () {
                var el = $($.activeObj.el);
                if (getFirstIndex() >= getTotalLine() - showLine) {
                    shake();
                    return true;
                }
                ap.dragPageUp();
                if (el.length) {
                    moFocus();
                }
                return true;
            },
            KEY_PAGEUP: function () {
                var el = $($.activeObj.el);
                if (getFirstIndex() == 0) {
                    return true;
                }
                ap.dragPageDown();
                if (el.length) {
                    moFocus();
                }
                return true;
            }
        };
        var active = function () {
            mc.isActive = true;
            moFocus();
        };
        var deactive = function () {
            mc.isActive = false;
        };
        return {
            key: key,
            keysMap: keysMap,
            active: active,
            deactive: deactive,
            cover: function () {
                return true;
            },
            decover: function () {
                return true;
            },
            destroy: function () {
                return true;
            }
        };
    }
    var _active = function () {
        $.pTool.active(p_pkgList().key);
    };
    function renderAp(cb) {
        progress();
        clearAP();
        if (!getNowState().data.length) {
            $("#noMc").show();
            return;
        } else {
            $("#noMc").hide();
        }
        ap = initAP.call(getNowState());
        cb && cb();
    }
    var init = function (opt) {
        $.pTool.add(p_pkgList().key, p_pkgList());
        $.pTool.add(activeBtnPlug.key, activeBtnPlug);
        $.pTool.add(deleteCoupon().key, deleteCoupon());
        $.pTool.add(rulesPupon().key, rulesPupon());
        $.pTool.add(nouseTime().key, nouseTime());
        initContainer();
        this.left = opt.left;
    };
    function renderPage() {
        initConfig(arguments[0] || {});
        if (flag) {
            renderAp(mc.loadAfter);
        } else {
            loadData(function () {
                mc.loadBefore();
                renderAp(mc.loadAfter);
            });
        }
    }
    function init_renderPage() {
        mc.initConfig({
            current: type
        })
        loadData(function () {
            renderAp(mc.loadAfter);
        });
        mc.left && mc.left();
    }
    function initConfig(con) {
        type = con.current;
        $("#useRules").hide();
        if (type === "nouse") {
            $("#noMc").html('您还没有可用的卡券记录哟~')
            $("body").removeClass("used").removeClass("expire").addClass('nouse');
            $("#useRules").show();
        }
        if (type === "used") {
            $("#noMc").html('您还没有使用的卡券记录哟~')
            $("body").removeClass("nouse").removeClass("expire").addClass('used');
        }
        if (type === "expire") {
            $("#noMc").html('您还没有过期的卡券记录哟~')
            $("body").removeClass("nouse").removeClass("used").addClass('expire');
        }
        getNowState().firstLineIndex = 0;
        focusIndex = 0;
    }
    function _getState() {
        var nObj = getNowState();
        return {
            firstLineIndex: nObj.firstLineIndex,
            isActive: mc.isActive,
            focus: "mo_item" + focusIndex,
            focusIndex: focusIndex
        };
    }
    function progress() {
        var index = focusIndex || 0;
        var nowObj = getNowState();
        var datalen = nowObj.data.length;
        if (!datalen || datalen <= showLine * columnSize) {
            $("#progressBar").hide();
        } else {
            $("#progressBar").show();
        }
        var len = $("#progressBar")[0].clientHeight - 110;
        var everyMove = len / (Math.ceil(datalen / columnSize) - 1);
        var num = +index >= columnSize ? Math.floor(index / columnSize) : 0;
        $("#progressBar #strip").css("top", everyMove * num + "px");
    }
    function setConfig(cfg) {
        type = cfg.current;
        getNowState().firstLineIndex = cfg.firstLineIndex;
        focusIndex = cfg.focusIndex;
    }
    var activeBtnPlug = {
        key: "activeBtnPlug",
        keysMap: {
            KEY_DOWN: function () {
                if (getNowState().data.length > 0) {
                    $.pTool.active(mc.key);
                }
            },
            KEY_LEFT: function () {
                mc.left && mc.left();
            },
            KEY_RIGHT: function () {
                if (getNowState().data.length > 0) {
                    $.pTool.active(mc.key);
                }
            },
            KEY_OK: function () {
                $.pTool.active(rulesPupon().key);
            }
        },
        active: function () {
            $.focusTo({
                el: "#useRules"
            });
        },
        deactive: function () {
        }
    };
    function deleteCoupon() {
        var key = "deleteCoupon";
        var keysMap = {
            KEY_LEFT: function () {
                $.focusTo({
                    el: "#deleteCoupon .delBtnEns"
                });
            },
            KEY_RIGHT: function () {
                $.focusTo({
                    el: "#deleteCoupon .delBtnCan"
                });
            },
            KEY_OK: function () {
                var delcardUrl;
                var userId = $.getVariable("EPG:userId");
                var method;
                if ($.activeObj.el === '#delBtnEns') {
                    var delusedData = usedCoupon.data[focusIndex];
                    var delexpireData = expireCoupon.data[focusIndex];
                    if (type === 'used') {
                        method = delusedData.ctype === 1 ? 'GET' : 'DELETE';
                        delcardUrl = delusedData.ctype === 1 ? cardServerUrl + '/cardApi2/delCard?CARDID=' + delusedData.card_id + '&CUSTOMERID=' + userId : couponServerUrl + '/api/1.0/discountCoupon/' + userId + '/' + delusedData.discount_id;
                    } else if (type === 'expire') {
                        method = delexpireData.ctype === 1 ? 'GET' : 'DELETE';
                        delcardUrl = delexpireData.ctype === 1 ? cardServerUrl + '/cardApi2/delCard?CARDID=' + delexpireData.card_id + '&CUSTOMERID=' + userId : couponServerUrl + '/api/1.0/discountCoupon/' + userId + '/' + delexpireData.discount_id;
                    }
                    var that = this;
                    // 根据id删除数据
                    ajax({
                        url: 'http://' + delcardUrl,
                        method: method,
                        success: function (data) {
                            data = JSON.parse(data)
                            // 调取删除接口，删除成功后刷新页面
                            if (data.respCode === 0 || data.code === 0) {
                                mc.initConfig({
                                    current: type
                                })
                                loadData(function () {
                                    renderAp(mc.loadAfter);
                                });
                                mc.left && mc.left();
                            }
                        },
                        error: function () {
                            mc.left && mc.left();
                        }
                    })
                } else {
                    this.KEY_RETURN();
                }
            },
            KEY_RETURN: function () {
                $.pTool.active(mc.key);
                return true;
            }
        };
        return {
            key: key,
            keysMap: keysMap,
            active: function () {
                $("#deleteCoupon").show();
                $.focusTo({
                    el: "#deleteCoupon .delBtnEns"
                });
            },
            deactive: function () {
                $("#deleteCoupon").hide();
            }
        };
    };
    function rulesPupon() {
        var key = "rulesPupon";
        var keysMap = {
            KEY_OK: function () {
                $.pTool.active(activeBtnPlug.key);
                return true;
            },
            KEY_RETURN: function () {
                $.pTool.active(activeBtnPlug.key);
                return true;
            }
        };
        return {
            key: key,
            keysMap: keysMap,
            active: function () {
                $("#rulesPupon").show();
                $.focusTo({
                    el: "#rulesPupon .ruleEnsure"
                });
            },
            deactive: function () {
                $("#rulesPupon").hide();
            }
        };
    };
    function nouseTime() {
        var key = "nouseTime";
        var keysMap = {
            KEY_OK: function () {
                $.pTool.active(p_pkgList().key);
                return true;
            },
            KEY_RETURN: function () {
                $.pTool.active(p_pkgList().key);
                return true;
            }
        };
        return {
            key: key,
            keysMap: keysMap,
            active: function () {
                $(".nouseTime").show();
                $.focusTo({
                    el: ".nouseTime"
                });
            },
            deactive: function () {
                $(".nouseTime").hide();
            }
        };
    }
    return {
        key: p_pkgList().key,
        init: init,
        active: _active,
        loadAfter: function () { },
        left: function () {
            this.left = arguments[0];
        },
        setCallBack: function () {
            if (arguments[0]) {
                this.loadAfter = arguments[0];
            }
            if (arguments[1]) {
                this.loadBefore = arguments[1];
            }
        },
        loadBefore: function () { },
        renderPage: renderPage,
        initConfig: initConfig,
        loadData: loadData,
        init_renderPage: init_renderPage,
        getState: _getState,
        getNowObj: getNowState,
        setConfig: setConfig,
        useRulesBtn: activeBtnPlug.key,
        deleteCoupon: deleteCoupon.key,
        rulesPupon: rulesPupon.key
    };
}();
function ajax(opt) {
    opt = opt || {};
    opt.loading && opt.loading();
    opt.method = opt.method && opt.method.toUpperCase() || "GET";
    opt.url = opt.url || "";
    opt.async = $.UTIL.isUndefined(opt.async) ? true : opt.async;
    opt.cache = $.UTIL.isUndefined(opt.cache) ? false : opt.cache;
    opt.data = opt.data || null;
    if (opt.method === "POST" && !opt.data && /#/.test(opt.url)) {
        var urls = opt.url.split("#");
        if (urls[1]) {
            try {
                var data = {};
                var datas = urls[1].split("&");
                for (var i = 0; i < datas.length; i++) {
                    var tmp = datas[i].split("=");
                    data[tmp[0]] = tmp[1];
                }
                opt.data = JSON.stringify(data);
            } catch (e) { }
        }
        opt.url = urls[0];
    }
    var timeout = opt && opt.timeout || 3e3;
    var xmlHttp = new XMLHttpRequest();
    // xmlHttp.tokens = $.getTokens();
    xmlHttp.open(opt.method, opt.url, opt.async);
    if (!opt.cache) {
        xmlHttp.setRequestHeader("Cache-Control", "no-cache");
    }
    if (opt.method === "POST") {
        xmlHttp.setRequestHeader("Content-Type", "application/json");
    }
    xmlHttp.onreadystatechange = function () {
        if (!opt || !xmlHttp) {
            return;
        }
        // if (xmlHttp.tokens && xmlHttp.tokens !== getTokens()) {
        //     if (xmlHttp.timeoutTimer) {
        //         clearTimeout(xmlHttp.timeoutTimer);
        //     }
        //     opt = xmlHttp.onreadystatechange = null;
        //     xmlHttp.abort();
        //     xmlHttp = null;
        //     return;
        // }
        if (xmlHttp && xmlHttp.readyState == 4) {
            if (opt.async) {
                clearTimeout(xmlHttp.timeoutTimer);
            }
            var txt = "";
            if (xmlHttp.status >= 200 && xmlHttp.status < 300 || xmlHttp.status == 304) {
                txt = xmlHttp.responseText;
                opt.success && opt.success(txt);
            } else {
                txt = new Error("ajax error, code is " + xmlHttp.status + ", url is " + opt.url);
                opt.error && opt.error(txt);
            }
            opt.complete && opt.complete(txt);
            txt = xmlHttp.onreadystatechange = xmlHttp = opt = null;
        }
    };
    if (opt.async) {
        xmlHttp.timeoutTimer = setTimeout(function () {
            xmlHttp && xmlHttp.abort();
        }, timeout);
    }
    xmlHttp.send(JSON.stringify(opt.data));
}
// 时间格式方法：将2020-05-07 23:59:59转换为2020.05.07
function dataValidation(dataTime) {
    var data = dataTime.slice(0, 16);
    return data;
}