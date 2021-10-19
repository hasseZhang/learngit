var phoneNum = '';
var checkNum = '';
var cancelOrderUrl = 'http://' + ($.getVariable('EPG:isTest') ? '10.128.7.100:8200' : '10.128.7.40:8200'); //判断取消续订操作是否在48小时外
var noPackage = false;
var recGuidanceId = $.getVariable("EPG:isTest") ? "1100006917" : "1100007274";
var isPointFocusflag = null; //积分兑换是否落焦flag
var defaultMenuRight = true; //true跳到按钮false到内容
var mo = function() {
    var focusIndex = 0,
        columnSize = 1,
        showLine = 2,
        type = "sfb",
        ap = null,
        lastPlug = "";
    var flag = false;
    var $noOrder = $recTitle = null;

    function getNowState() {
        var map = {
            sfb: pkg,
            dp: simple
        };
        return map[type];
    }

    function initContainer() {
        var $container = $('<div id="container"><div id="listContainer"></div><div id="loading" class="hide"></div><div id="progressBar" class="hide"><div id="strip"></div></div><div id="noMo" class="hide"></div><div id="mostShow" class="hide"></div></div>');
        $container.appendTo($("body"));
    }

    function loadData() {
        var args = Array.prototype.slice.apply(arguments);
        $("#loading").show();
        $.auth.queryOrderInfo(function(code, res) {
            $("#loading").hide();
            if (code === 0) {
                flag = false;
                return;
            }
            flag = true;
            pkg.data = res.package //filteData(res.package); 后台排序好了
            simple.data = filteData(res.simple);
            if (pkg.data && pkg.data.length) {
                noPackage = false;
                for (var i in args) {
                    args[i] && args[i]();
                }
            } else {
                noPackage = true;
                $.s.guidance.get({
                    id: recGuidanceId
                }, {
                    success: function(res) {
                        if (res && res.length) {
                            var arr = [];
                            $.UTIL.each(res, function(value, key) {
                                arr.push(value.contentUri)
                            });
                            $.auth.queryPkgPrice(arr.join("-"), function(code, res) {
                                if (code === 1 && res && res.code == 0) {
                                    var data_ = res;
                                    pkg.data = data_.products;
                                    data_ = res = null;
                                    for (var i in args) {
                                        args[i] && args[i]();
                                    }
                                } else {
                                    $("#noMo").show();
                                    // $("#mostShow").hide();
                                    return;
                                }
                            });
                        }
                    },
                    error: function() {
                        for (var i in args) {
                            args[i] && args[i]();
                        }
                    }
                });
            }
        });
    }

    function filteData(arr) {
        var out0 = [],
            out1 = [],
            out2 = [],
            out3 = [];
        for (var i in arr) {
            if (arr[i].status == 0) {
                out1.push(arr[i]);
            } else {
                out0.push(arr[i]);
            }
        }
        out0.sort(function(a, b) {
            return getTime(b.payTime) - getTime(a.payTime);
        });
        out1.sort(function(a, b) {
            return getTime(b.payTime) - getTime(a.payTime);
        });
        for (var i in out0) {
            if (out0[i].continueType == 1 || out0[i].orderChannel != "1") {
                out2.push(out0[i]);
            } else {
                out3.push(out0[i]);
            }
        }
        return out2.concat(out3).concat(out1);
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
        // if (getNowState().firstLineIndex + info.showLine >= info.totalLine) {
        //     $("#mostShow").show();
        // } else {
        //     $("#mostShow").hide();
        // }
    }

    function clearAP() {
        if ($(".moContent").length) {
            $("#listContainer .moContent").remove()
        }
    }
    var pkgInfo = function() {
        return $.auth.getPkgInfo();
    };

    var pkg = {
        data: [],
        firstLineIndex: 0,
        lineHeight: 313,
        renderList: function(begin, end) {
            var html = "",
                picPath = "",
                name = "",
                info = null,
                useDate = "",
                strPr = "",
                price = "",
                unit = "",
                des = "",
                mask = "",
                btn = "",
                isLine = "",
                noPic = "",
                btnHis = "",
                payType = "";
            var btnDiv = '<div class="orderBtn" id="orderBtn%s">%s</div>'
            var npsp = $.getVariable("EPG:STBType") === 'B860AV2.1-T' ? '&nbsp;&nbsp;&nbsp;&nbsp;' : '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
            if (noPackage) {
                var div = '<div class="mo_item noPackage" id="mo_item%s"><div class="poster %s"><img src="%s" alt="">%s</div><div class="name text"><span>名' + npsp + '称 : </span> %s</div><div class="price text"><span>价' + npsp + '格 : </span> %s</div><div class="des text"><span>简' + npsp + '介 : </span><div class="desContent">%s</div></div>%s</div>';
                var data = this.data;
                var arr = [];
                var arrCou = [];
                for (var i = begin; i < end; i++) {
                    arr = [];
                    arrCou = [];
                    for (var k in data[i].fees) {
                        if (data[i].fees[k].fee > 0) {
                            arr.push(data[i].fees[k].fee);
                        }
                        if (data[i].fees[k].feeRenew > 0) {
                            arr.push(data[i].fees[k].feeRenew);
                        }
                        if (data[i].fees[k].discountCouponFee > 0 && data[i].fees[k].cycleType != 3) { //半年包后台有，epg不显示
                            arrCou.push(data[i].fees[k].discountCouponFee);
                        }
                        if (data[i].fees[k].discountCouponFeeRenew > 0 && data[i].fees[k].feeRenew === data[i].fees[k].firstFeeRenew) {
                            arrCou.push(data[i].fees[k].discountCouponFeeRenew);
                        }
                        if (data[i].fees[k].firstFeeRenew > 0) {
                            arr.push(data[i].fees[k].firstFeeRenew);
                        }
                    }
                    data[i].minPrice = Math.min.apply(null, arr.concat(arrCou));
                    info = pkgInfo()[data[i].productId];
                    mask = info.url ? "" : '<div class="mask"></div>';
                    picPath = info.picPath;
                    noPic = picPath ? "" : "noPic";
                    name = info.productName || "";
                    price = data[i].minPrice / 100 + "元起";
                    des = $.substringElLength(info.description, "26px", "1800px").last || '暂无';
                    btnHis = $.Tps(btnDiv, i, '立即订购');
                    html += $.Tps(div, i, noPic, picPath, mask, name, price, des, btnHis);
                }
            } else {
                var div = '<div class="mo_item" id="mo_item%s"><div class="poster %s"><img src="%s" alt="">%s</div><div class="name text"><span>名' + npsp + '称 : </span> %s<span>%s</span></div><div class="price text"><span> %s</span> %s</div><div class="endTime text"><span>有效期至 : </span> %s</div><div class="des text"><span>简' + npsp + '介 : </span><div class="desContent">%s</div></div>%s <div></div>%s</div>';
                var data = this.data;
                var cancelBtn = '<div class="cancelBtn" renew = "%s">%s</div>';
                for (var i = begin; i < end; i++) {
                    info = pkgInfo()[data[i].productId];
                    data[i].productId === '0' && (info.productName = data[i].name, info.description = data[i].description); //全部产品,没有配置cms只能写死
                    mask = info.url ? "" : '<div class="mask"></div>';
                    picPath = info.picPath;
                    noPic = picPath ? "" : "noPic";
                    name = info.productName || "";
                    payType = data[i].payType == 5 ? '<div class="poionExchange"></div>' : data[i].orderType == "c" ? '<div class="cardType cardType' + data[i].columnId + '"></div>' : '';
                    isLine = data[i].orderChannel == "1" ? payType : '<div class="underLine"></div>';
                    useDate = data[i].status == 0 ? "<span class='end'>已过期</span>" : data[i].orderChannel == "0" ? "自动续费" : data[i].endTime.substring(0, 16);
                    unit = $.auth.getPidUnit(data[i].cycleType);
                    strPr = data[i].orderType == "c" ? '激活时间 : ' : '价' + npsp + '格 : ';
                    price = data[i].orderType == "c" ? data[i].payTime : data[i].tzInfo ? data[i].tzInfo : data[i].fee / 100 + "元/" + unit;
                    des = $.substringElLength(info.description, "26px", "1800px").last || "暂无";
                    btn = data[i].continueType === "0" || isLine || data[i].orderType == "c" ? "" : data[i].continueType === "1" ? $.Tps(cancelBtn, "0", "取消续订") : $.Tps(cancelBtn, "2", "已取消续订");
                    if (data[i].status == 2) {
                        btn = $.Tps(cancelBtn, "1", "续订中");
                    }
                    btnHis = $.Tps(btnDiv, i, '订购历史');
                    html += $.Tps(div, i, noPic, picPath, mask, name, isLine, strPr, price, useDate, des, btn, btnHis);
                }
            }
            return html;
        }
    };
    var simple = {
        data: [],
        firstLineIndex: 0,
        lineHeight: 342,
        detailData: [],
        detail: function() {
            var ids = [];
            for (var i = 0; i < this.data.length; i++) {
                ids.push(this.data[i].contentId);
            }
            return ids;
        },
        renderList: function(begin, end) {
            var npsp = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
            var html = "",
                info = null,
                useDate = "",
                price = "",
                noPic = "";
            var div = '<div class="mo_item" id="mo_item%s"><div class="poster %s"><img src="%s" alt=""><div class="vip"></div></div><div class="name text">%s</div><div class="price text"><span>价' + npsp + '格 : </span> %s </div><div class="endTime text"><span>有效期至 : </span>%s</div><div class="des text"><span>简' + npsp + '介 : </span><div class="desContent">%s</div></div></div>';
            var data = this.data;
            var detailData = this.detailData;
            for (var i = begin; i < end; i++) {
                info = pkgInfo()[data[i].productId];
                picPath = info.picPath;
                noPic = detailData[i].pic ? "" : "noPic";
                name = info.productName || '';
                useDate = data[i].status == 0 ? "<span class='end'>已过期</span>" : data[i].endTime.substring(0, 16);
                price = data[i].fee / 100 + "元/72小时";
                if ($.auth.jw.isJW(info.chargeId)) {
                    price = data[i].fee / 100 + "元";
                    useDate = data[i].status == 0 ? "本场直播结束" : "<span class='end'>已过期</span>";
                }
                html += $.Tps(div, i, noPic, detailData[i].pic, detailData[i].name, price, useDate, detailData[i].des || '暂无');
            }
            return html;
        },
        renderDetail: function(callback) {
            if (getNowState() === this) {
                var This = this;
                if (This.detailData.length !== This.data.length) {
                    This.detailData = [];
                    loadDataResource(this.detail(), function(res) {
                        if (getNowState() !== This) return;
                        for (var i = 0; i < res.length; i++) {
                            This.detailData.push({
                                pic: res[i].pic,
                                name: res[i].name,
                                des: $.substringElLength(res[i].des, "26px", "1800px").last
                            });
                        }
                        ap = initAP.call(getNowState());
                        callback && callback();
                    });
                } else {
                    ap = initAP.call(getNowState());
                    callback && callback();
                }
            }
        }
    };

    function renderAp(cb) {
        progress();
        clearAP();
        if (!getNowState().data.length) {
            $("#noMo").show();
            // $("#mostShow").hide();
            return;
        } else {
            $("#noMo").hide();
            // $("#mostShow").show();
        }
        if (type === "sfb") {
            ap = initAP.call(getNowState());
            cb && typeof cb === 'function' && cb();
        } else {
            simple.renderDetail(cb);
        }
    }
    var init = function(opt) {
        $.pTool.add('p_pkgList', p_pkgList());
        $.pTool.add('hoursCancelOrder', hoursCancelOrder());
        $.pTool.add('cancelOrder', cancelOrder());
        $.pTool.add('purchaseError', purchaseError());
        $.pTool.add('activeBtnPlug', activeBtnPlug);
        $.pTool.add('pointExchangeBtnPlug', pointExchangeBtnPlug);
        $.pTool.add("toWatchPanel", toWatchPanel());
        $.pTool.add("pkgOrderListPanel", pkgOrderListPanel());
        initContainer();
        isPointFocusflag = pageInfo.isPointFocus;
        defaultMenuRight = pageInfo.menuRight;
        this.left = opt.left;
    };

    function renderPage() {
        initConfig(arguments[0] || {});
        if (flag) {
            renderAp(mo.loadAfter);
            renderNoOrder();
            autoCard(focusIndex);
        } else {
            loadData(function() {
                mo.loadBefore();
                renderAp(mo.loadAfter);
                renderNoOrder();
                autoCard(focusIndex);
            });
        }
    }

    function renderNoOrder() {
        type == 'sfb' && noPackage && ($noOrder || ($noOrder = $('<div class="noOrder"></div>')), $recTitle || ($recTitle = $('<div class="recTitle"></div>')), $noOrder.appendTo($("#listContainer")).show(), $recTitle.appendTo($("#listContainer")).show()),
            type !== 'sfb' && ($noOrder && $noOrder.hide(), $recTitle && $recTitle.hide())
    }

    function showCard() {
        var el = $(".moContent");
        type == 'sfb' && noPackage && ($noOrder.show(), $recTitle.show(), el.addClass("move"))
        $('#activeCardBtn').show();
        $('#pointExchangeBtn').show();
    };

    function hideCard() {
        var el = $(".moContent");
        type == 'sfb' && noPackage && ($noOrder.hide(), $recTitle.hide(), el.removeClass("move"))
        $('#activeCardBtn').hide();
        $('#pointExchangeBtn').hide();
    };

    function autoCard(e) {
        getNowState().firstLineIndex > 0 ? hideCard() : showCard();
    };

    function initConfig(con) {
        type = con.current;
        if (type === "sfb") {
            $("body").removeClass("dp").addClass(type);
        }
        if (type === "dp") {
            $("body").removeClass("sfb").addClass(type);
        }
        getNowState().firstLineIndex = 0;
        focusIndex = 0;
    }

    function _getState() {
        var nObj = getNowState();
        return {
            firstLineIndex: nObj.firstLineIndex,
            isActive: mo.isActive,
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
        if (focusIndex > pkg.data.length) { //如果推荐订购的话，返回到左侧
            focusIndex = pkg.data.length;
        }
    }

    function shake() {
        var el = $($.activeObj.el);
        if (el.length) {
            var id = /orderBtn/.test($.activeObj.el) ? "#orderBtn" + focusIndex : "#" + "mo_item" + focusIndex + " .poster";
            $(id).addClass("public_shake");
        } else {
            $("#" + "mo_item" + focusIndex + " .cancelBtn").addClass("public_shake");
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
            upOrdownEvent: function() {
                var el = $($.activeObj.el);
                type === 'sfb' && autoCard(focusIndex) //隐藏没内容时的提示订购图
                var active = $("#" + "mo_item" + focusIndex)
                var nextEl = $("#" + "mo_item" + focusIndex + " .cancelBtn");
                var nextEl2 = $("#" + "mo_item" + focusIndex + " .orderBtn");
                if (el.length) { // pic 和 立即订购
                    /order/.test($.activeObj.el) ? $.focusTo({ el: nextEl2 }) : $.focusTo({ el: active });
                } else {
                    if (nextEl.length && nextEl.attr("renew") === "0") { // 取消续订下移
                        $.focusTo({
                            el: nextEl
                        });
                    } else {
                        $.focusTo({ el: active })
                    }
                }
                progress();
            },
            KEY_DOWN: function() {
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
                this.upOrdownEvent();
                return true;
            },
            KEY_UP: function() {
                if (focusIndex < columnSize) {
                    if (type === "sfb") {
                        $.pTool.active('pointExchangeBtnPlug');
                    }
                    return;
                }
                if (focusIndex < getFirstIndex() + columnSize) {
                    ap.dragDown();
                } else {
                    focusIndex -= columnSize;
                }
                this.upOrdownEvent();
                return true;
            },
            KEY_LEFT: function() {
                if (noPackage) mo.left && mo.left();
                else {
                    var el = $("#mo_item" + focusIndex + " .cancelBtn");
                    var el2 = $("#mo_item" + focusIndex);
                    /order/.test($.activeObj.el) ? el.length && el.attr('renew') === '0' ? $.focusTo({ el: el }) : $.focusTo({ el: el2 }) : /item/.test($.activeObj.el) ? mo.left && mo.left() : $.focusTo({ el: el2 });
                }
            },
            KEY_RIGHT: function() {
                var activeEl = $($.activeObj.el);
                var el = $("#mo_item" + focusIndex + " .cancelBtn");
                var el2 = $("#mo_item" + focusIndex + " .orderBtn");
                /item/.test($.activeObj.el) ? type === 'sfb' && el.length && el.attr("renew") === "0" ? $.focusTo({ el: el }) : type === 'sfb' && $.focusTo({ el: el2 }) : activeEl.length || $.focusTo({ el: el2 });
            },
            KEY_OK: function() {
                if (type === "dp") {
                    if (simple.data[focusIndex] && $.auth.jw.isJW(simple.data[focusIndex].productId)) {
                        $.auth.jw.gotoJW();
                        return;
                    }
                    $.gotoDetail({
                        contentId: simple.data[focusIndex].contentId,
                        categoryId: simple.data[focusIndex].columnId,
                        contentType: "0"
                    });
                    return;
                }
                if (type === "sfb") {
                    var productId = pkg.data[focusIndex].productId;
                    if (noPackage) {
                        $.auth.auth4Pkg({
                            entrance: "p_pkgList",
                            package: [{
                                chargeId: productId
                            }],
                            callback: function(res) {
                                res[productId] ? $.pTool.active("toWatchPanel") : ($.auth.forwardOrder(0, 1, [productId]))
                            }
                        })
                        return true;
                    }
                    var btn = $(".focusBorder.cancelBtn");
                    var btn2 = $(".focusBorder.orderBtn");
                    //弹窗：取消续订
                    if (btn.length && btn.attr("renew") === "0") {
                        var orderId = pkg.data[focusIndex]['id']; //订单id
                        $.get(cancelOrderUrl + '/checkReOrder?orderId=' + orderId, {
                            success: function(res) {
                                var code = res && JSON.parse(res)['code'];
                                if (code == '1') {
                                    $.pTool.active("cancelOrder");
                                    return true;
                                } else if (code == '0') {
                                    $.pTool.active("hoursCancelOrder");
                                    return true;
                                } else {
                                    $.pTool.active("purchaseError");
                                    lastPlug = 'cancelOrder';
                                }
                            },
                            errror: function() {
                                $.pTool.active("purchaseError");
                                lastPlug = 'cancelOrder';
                            }
                        });
                    }
                    if (btn.length) {
                        return true;
                    }
                    //订购历史
                    if (btn2.length) {
                        var pkgName = pkg.data[focusIndex].name;
                        $.pTool.active("pkgOrderListPanel");
                        $.pTool.get("pkgOrderListPanel").init(pkgName, productId)
                        return;
                    }
                    //pic跳转
                    var contentUrl = pkgInfo()[productId].url;
                    if (/{{.*}}/.test(contentUrl)) {
                        $.gotoDetail(contentUrl);
                    } else {
                        $.gotoDetail({
                            url: contentUrl,
                            contentType: "7"
                        });
                    }
                }
            },
            KEY_PAGEDOWN: function() {
                if (getFirstIndex() >= getTotalLine() - showLine) {
                    shake();
                    return true;
                }
                ap.dragPageUp();
                this.upOrdownEvent();
                return true;
            },
            KEY_PAGEUP: function() {
                if (getFirstIndex() == 0) {
                    return true;
                }
                ap.dragPageDown();
                this.upOrdownEvent();
                return true;
            }
        };
        var active = function() {
            mo.isActive = true;
            if (lastPlug === "cancelOrder") {
                var el = "#mo_item" + focusIndex + " .cancelBtn";
                if ($(el).attr("renew") == "2") {
                    el = "#mo_item" + focusIndex;
                }
                $.focusTo({
                    el: el
                });
                lastPlug = "";
            } else if (lastPlug == 'hisPanel' || (type == 'sfb' && noPackage)) {
                $.focusTo({ el: "#orderBtn" + focusIndex });
                lastPlug = "";
            } else {
                $.focusTo({ el: "#mo_item" + focusIndex });
                progress();
            }
        };
        var deactive = function() {
            mo.isActive = false;
        };
        return {
            key: key,
            keysMap: keysMap,
            active: active,
            deactive: deactive,
            cover: function() {
                return true;
            },
            decover: function() {
                return true;
            },
            destroy: function() {
                return true;
            }
        };
    }
    var _active = function() {
        $.pTool.active('p_pkgList');
    };
    var loadDataResource = function() {
        var data = {};
        var tank = [];
        var count = 0;
        var callback = null;
        var result = [];
        var loadNext = function() {
            var id = tank[count++];
            if (!id) return callback(result);
            if (data[id]) {
                result.push(data[id]);
                arguments.callee.call(null, arguments);
            } else {
                if (id.length < 32) {
                    result.push($.auth.jw.detailInfo);
                    loadNext();
                    return;
                }
                $.s.detail.get({
                    id: id
                }, {
                    success: function(e) {
                        var id = e.vodId;
                        if (tank[count - 1] != id) return;
                        if (e.vodSeriesflag == "0") {
                            var type = "0";
                        } else if (e.vodSeriesflag == "1") {
                            var type = "2";
                        } else {
                            var type = "0";
                        }
                        data[id] = {
                            name: e.vodName,
                            des: e.vodDescription,
                            pic: e.vodPicMap[102] || e.vodPicMap[6] ? "/pic/" + (e.vodPicMap[102] || e.vodPicMap[6]) : "",
                            type: type
                        };
                        result.push(data[id]);
                        loadNext();
                    }
                });
            }
        };
        return function(ids, cb) {
            count = 0;
            result = [];
            tank = ids;
            callback = cb;
            loadNext();
        };
    }();
    //48小时后取消续订
    function hoursCancelOrder() {
        var key = "hoursCancelOrder";
        var keysMap = {
            KEY_OK: function() {
                $.pTool.active("p_pkgList");
                $.focusTo({
                    el: $($.activeObj.el + " .cancelBtn")
                })
                return true;
            },
            KEY_RETURN: function() {
                $.pTool.active("p_pkgList");
                $.focusTo({
                    el: $($.activeObj.el + " .cancelBtn")
                })
                return true;
            },
        };
        var active = function() {
            $(".orderHours").show();
            $.focusTo({
                el: ".orderHours #hoursBack"
            });
        };
        var deactive = function() {
            $(".orderHours").hide();
        }
        return {
            key: key,
            keysMap: keysMap,
            active: active,
            deactive: deactive
        };
    }

    function cancelOrder() {
        var key = "cancelOrder";
        var keysMap = {
            KEY_LEFT: function() {
                $.focusTo({
                    el: ".panel #ensure"
                });
                return true;
            },
            KEY_RIGHT: function() {
                $.focusTo({
                    el: ".panel #cancel"
                });
                return true;
            },
            KEY_RETURN: function() {
                $.pTool.active("p_pkgList");
                return true;
            },
            KEY_UP: function() {
                $.focusTo({
                    el: ".panel #ensureBox"
                });
                $.pTool.get("inputNum").show();
                return true;
            },
            KEY_DOWN: function() {
                $.focusTo({
                    el: ".panel #cancel"
                });
                return true;
            },
            KEY_OK: function() {
                if ($("#cancel.focusBorder").length) {
                    if (checkNum === phoneNum) {
                        $("#errMsg").hide();
                        var payType = pkg.data[focusIndex]['payType'];
                        var orderId = pkg.data[focusIndex].id;
                        var productId = pkg.data[focusIndex].productId;
                        if (payType === 1) { //微信，连续包月取消续订
                            $.auth.cancelOrder2(orderId, function(code, res) {
                                $.auth.sendVS.cancelOrderVs(code, productId);
                                if (code && res.code && res.code == "0") {
                                    $("#mo_item" + focusIndex + " .cancelBtn").attr("renew", "2").html("已取消续订");
                                    $.pTool.active("p_pkgList");
                                } else {
                                    $.pTool.active("purchaseError");
                                    lastPlug = key;
                                }
                            })
                        } else { //支付宝，账单，手机, 翼支付 
                            $.auth.cancelOrder({
                                orderId: orderId,
                                callback: function(code, res) {
                                    $.auth.sendVS.cancelOrderVs(code, productId);
                                    if (code && res.code && res.code == "0") {
                                        $("#mo_item" + focusIndex + " .cancelBtn").attr("renew", "2").html("已取消续订");
                                        $.pTool.active("p_pkgList");
                                    } else {
                                        $.pTool.active("purchaseError");
                                        lastPlug = key;
                                    }
                                }
                            });
                        }

                    } else {
                        $("#errMsg").show();
                        $.focusTo({
                            el: ".panel #ensureBox"
                        });
                        $.pTool.get("inputNum").show();
                        return true;
                    }
                }
                if ($("#ensure.focusBorder").length) {
                    $.pTool.active("p_pkgList");
                }
                return true;
            }
        };
        var active = function() {
            if ($.activeObj.el !== '#ensureBox') {
                $(".panel").show();
                $("#resetMsg").show();
                $("#ensureBox").html('');
                phoneNum = '';
                checkNum = getRandomCode();
                $("#randomCode").html(checkNum);
                $("#errMsg").hide();
                lastPlug = key;
            }
            $.focusTo({
                el: ".panel #ensure"
            });
        };
        var deactive = function() {
            if ($.activeObj.el !== '#ensureBox') {
                $(".panel").hide();
            }
        };
        return {
            key: key,
            keysMap: keysMap,
            active: active,
            deactive: deactive
        };
    }

    function purchaseError() {
        var key = "purchaseError";
        var keysMap = {
            KEY_RETURN: function() {
                $.pTool.active("p_pkgList");
            },
            KEY_OK: function() {
                if (lastPlug === "cancelOrder") {
                    $.pTool.active("p_pkgList");
                    return;
                }
                $.pTool.active(lastPlug);
            }
        };
        var active = function() {
            $(".error").show();
            $.focusTo({
                el: ".error"
            });
        };
        var deactive = function() {
            $(".error").hide();
        };
        return {
            key: key,
            keysMap: keysMap,
            active: active,
            deactive: deactive
        };
    }
    var activeBtnPlug = {
        key: "activeBtnPlug",
        keysMap: {
            KEY_DOWN: function() {
                if (getNowState().data.length) {
                    isPointFocusflag = false;
                    defaultMenuRight = false;
                    $.pTool.active('p_pkgList');
                }
            },
            KEY_LEFT: function() {
                mo.left();
                $.pTool.active(pointExchangeBtnPlug.key);
            },
            KEY_OK: function() {
                //激活礼券弹窗回调函数
                function fn() {
                    mo.loadData(function() {
                        mo.loadBefore();
                        renderAp(mo.loadAfter);
                        !noPackage && $noOrder && $noOrder.hide();
                        !noPackage && $recTitle && $recTitle.hide();
                    })
                }
                $.pTool.get('activeCard').init(fn, null, 'activeBtnPlug');
            }
        },
        active: function() {
            $.focusTo({
                el: "#activeCardBtn"
            });
        },
        deactive: function() {}
    };
    var pointExchangeBtnPlug = {
        key: "pointExchangeBtnPlug",
        keysMap: {
            KEY_DOWN: function() {
                if (getNowState().data.length) {
                    isPointFocusflag = false;
                    defaultMenuRight = false;
                    $.pTool.active('p_pkgList');
                }
            },
            KEY_LEFT: function() {
                mo.left();
            },
            KEY_RIGHT: function() {
                $.pTool.active(activeBtnPlug.key);
            },
            KEY_OK: function() {
                $.gotoDetail($.getVariable("EPG:pathPage") + '/pointExchange/list/index.html');
            }
        },
        active: function() {
            isPointFocusflag = true;
            defaultMenuRight = true;
            $.focusTo({
                el: "#pointExchangeBtn"
            });
        },
        deactive: function() {}
    };

    function toWatchPanel() {
        var obj = {
            key: 'toWatchPanel',
            keysMap: {
                KEY_RIGHT: function() {
                    "#toWatch" === $.activeObj.el && $.focusTo({
                        el: "#return"
                    });
                    return true;
                },
                KEY_LEFT: function() {
                    "#return" === $.activeObj.el && $.focusTo({
                        el: "#toWatch"
                    });
                    return true;
                },
                KEY_OK: function() {
                    if ("#toWatch" === $.activeObj.el) {
                        var path = pkgInfo()[pkg.data[focusIndex].productId].url;
                        path && $.gotoDetail({
                            url: path,
                            contentType: "7"
                        })
                    } else this.KEY_RETURN();
                    return true;
                },
                KEY_RETURN: function() {
                    $.pTool.active("p_pkgList");
                    return true;
                }
            },
            active: function() {
                $(".toWatchPanel").show();
                $.focusTo({
                    el: "#toWatch"
                })
            },
            deactive: function() {
                $(".toWatchPanel").hide()
            }
        }
        return obj;
    }

    function pkgOrderListPanel() {
        var key = "pkgOrderListPanel";
        var conDiv = $(".pkgContent");
        var barDiv = "",
            stripDiv = "";
        var data = '';
        var maxLength = 5;
        var pageNum = 0;
        var clcleType = { 1: '1个月', 2: '3个月', 3: '6个月', 4: '12个月', 5: '周包', 6: '三天包', };
        var cTypeRenew = { 1: '连续包月', 2: '连续包季', 4: '连续包年' };
        var keysMap = {
            KEY_UP: function() {
                if (pageNum <= 0) return true;
                pageNum--;
                renderList();
                return true;
            },
            KEY_DOWN: function() {
                if (pageNum >= Math.ceil(data.length / maxLength) - 1) return true;
                pageNum++;
                renderList();
                return true;
            },
            KEY_RETURN: function() {
                $.pTool.active("p_pkgList");
                return true;
            }
        };
        var renderList = function() {
            if (!data.length) return true;
            var html = "",
                way = "",
                type = "",
                timeS = "",
                timeE = "";
            var pageMin = Math.min(data.length, pageNum * maxLength + maxLength);
            var index = pageNum * maxLength;
            for (var i = index; i < pageMin; i++) {
                timeS = data[i].startTime.slice(0, 10).replace(/-/g, ".");
                timeE = data[i].endTime.slice(0, 10).replace(/-/g, ".");
                data[i].orderType === "c" && (way = '礼券激活');
                data[i].orderType === "o" && (way = data[i].payType === 5 ? '积分兑换' : data[i].orderChannel === 1 ? '电视端订购' : '营业厅办理');
                type = data[i].orderType === "o" ? data[i].continueType !== "0" ? cTypeRenew[data[i].cycleType] : clcleType[data[i].cycleType] : data[i].columnId;
                html += '<div class="orderInfo"><div class="orderWay">' + way + '</div><div class="orderType">' + type + '</div><div class="orderTime">' + timeS + '<span>-</span>' + timeE + '</div></div>';
            }
            conDiv.html(html);
            (function() {
                barDiv || (barDiv = $('<div id="pkgProgressBar" class="hide"><div class="strip"></div></div>').appendTo($(".pkgOrderListPanel")), stripDiv = $("#pkgProgressBar .strip"));
                if (data.length <= maxLength) return barDiv.hide();
                barDiv.show();
                var dis = (conDiv.clientHeight() - 120) / (Math.ceil(data.length / maxLength) - 1)
                stripDiv.css("top", dis * pageNum + "px")
            })()
        };
        var init = function(name, productId) {
            $(".pkgName").html(name);
            pageNum = 0;
            $.auth.queryOrderHis(productId, function(res) {
                data = res && res.package || '';
                renderList();
            })
        };
        var active = function() {
            $(".pkgOrderListPanel").show();
        };
        var deactive = function() {
            lastPlug = "hisPanel";
            data = '';
            conDiv.html('');
            barDiv && barDiv.hide();
            $(".pkgOrderListPanel").hide();
        };
        return {
            init: init,
            key: key,
            keysMap: keysMap,
            active: active,
            deactive: deactive
        };
    }

    function getFocusId() {
        return isPointFocusflag;
    }

    function menuRight() {
        return defaultMenuRight;
    }
    return {
        key: function() {
            if (type == 'dp') {
                return 'p_pkgList';
            } else {
                return defaultMenuRight ? 'pointExchangeBtnPlug' : 'p_pkgList';
            }

        },
        init: init,
        active: _active,
        loadAfter: function() {},
        left: function() {
            this.left = arguments[0];
        },
        setCallBack: function() {
            if (arguments[0]) {
                this.loadAfter = arguments[0];
            }
            if (arguments[1]) {
                this.loadBefore = arguments[1];
            }
        },
        loadBefore: function() {},
        renderPage: renderPage,
        loadData: loadData,
        initConfig: initConfig,
        getState: _getState,
        getNowObj: getNowState,
        setConfig: setConfig,
        getFocusId: getFocusId,
        menuRight: menuRight
    };
}();

function getRandomCode() {
    var randomCode = '';
    for (var i = 0; i < 6; i++) {
        randomCode += parseInt(Math.random() * 9 + 1);
    }
    return randomCode;
}
$.pTool.add("inputNum", function() {
    var key = "inputNum",
        level = 9,
        _show = function() {
            $.pTool.active(key);
        },
        _hide = function() {
            $.pTool.deactive();
        };
    return {
        key: key,
        level: level,
        show: _show,
        hide: _hide,
        keysMap: {
            KEY_DOWN: function() {
                // if ($.activeObj.el === "#cardNum") {
                //     $.focusTo({
                //         el: "#password"
                //     });
                //     return true;
                // }
                $.pTool.active('cancelOrder');
                $.focusTo({
                    el: ".panel #cancel"
                });
                return true;
            },
            KEY_RETURN: function() {
                delNum($.activeObj.el);
                return true;
            },
            KEY_0: function() {
                pressNO($.activeObj.el, 0);
                return true;
            },
            KEY_1: function() {
                pressNO($.activeObj.el, 1);
                return true;
            },
            KEY_2: function() {
                pressNO($.activeObj.el, 2);
                return true;
            },
            KEY_3: function() {
                pressNO($.activeObj.el, 3);
                return true;
            },
            KEY_4: function() {
                pressNO($.activeObj.el, 4);
                return true;
            },
            KEY_5: function() {
                pressNO($.activeObj.el, 5);
                return true;
            },
            KEY_6: function() {
                pressNO($.activeObj.el, 6);
                return true;
            },
            KEY_7: function() {
                pressNO($.activeObj.el, 7);
                return true;
            },
            KEY_8: function() {
                pressNO($.activeObj.el, 8);
                return true;
            },
            KEY_9: function() {
                pressNO($.activeObj.el, 9);
                return true;
            },
            KEY_DELETE: function() {
                delNum($.activeObj.el);
                return true;
            },
            KEY_PAGEUP: function() {
                return true;
            },
            KEY_PAGEDOWN: function() {
                return true;
            }
        }
    };
}());

function pressNO(type, num) {
    if (type === "#ensureBox") {
        if (phoneNum.length > 5 && phoneNum.length !== '请输入右侧验证码') {
            return;
        } else {
            phoneNum = phoneNum + num;
            if (phoneNum) {
                $("#resetMsg").hide();
            }
            $("#ensureBox").html(phoneNum);
        }
    }
}

function delNum(type) {
    if (type === "#ensureBox") {
        if (phoneNum) {
            phoneNum = phoneNum.substring(0, phoneNum.length - 1);
            $("#ensureBox").html(phoneNum);
        } else {
            $(".panel").hide();
            $.pTool.active("p_pkgList");
        }
    }
}