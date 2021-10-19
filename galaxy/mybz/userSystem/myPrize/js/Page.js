var pageName = "myPrize";

var pageInfo = $.initPageInfo(pageName, ["menu", "list", "focus"], {
    list: {
        actPage: 0,
        focusIndex: 0,
        firstLineIndex: 0,
    },
    menu: {
        actTab: "tab1"
    },
    focus: "tab1"
});

var DEFAULT_FOCUS = pageInfo.focus;

var FOCUS_INFO = {
    address: ["", "", "goTab", ""],
    tab0: ["address", "tab1", "goList", ""],
    tab1: ["address", "", "goList", "tab0"],
    list: ["inList", "", "inList", ""]
};

var active = DEFAULT_FOCUS;

var actPage = pageInfo.list.actPage;

var DATA = [];

var userinfo = {};

var actTab = pageInfo.menu.actTab;

var bgId = $.getVariable("EPG:isTest") ? "1100008349" : "1100009856";

var ap = null;

var showLine = 5;

var columnSize = 1;

var focusIndex = pageInfo.list.focusIndex;

var firstLineIndex = pageInfo.list.firstLineIndex;

function load() {
    $.recodeData(pageName, "access");
    "tab0" == pageInfo.menu.actTab ? userGift() : getpointGift();
    $.s.guidance.get({
        id: bgId
    }, {
        async: false,
        success: function (data) {
            if (data) {
                addBg = $.getPic(data[0].pics, [0]);
                changeBg = $.getPic(data[1].pics, [0]);
                USER_SERVCICE.userinfo({}, {
                    success: function (res) {
                        if (res.code == 1e3 && res != "timeout") {
                            if (res.data.LINKADDRESS && res.data.LINKTEL && res.data.LINKNAME) {
                                $("#address").css("background", "url(" + changeBg + ") no-repeat transparent");
                                $("#linkAddress").html("地址：" + res.data.LINKADDRESS);
                                $("#linkTel").html("电话：" + res.data.LINKTEL);
                                $("#linkName").html("收货人：" + res.data.LINKNAME);
                            } else {
                                $("#address").css("background", "url(" + addBg + ") no-repeat transparent");
                            }
                        }
                    }
                });
            }
        },
        error: function () {
            us_cue.show({
                type: 2,
                text: "数据请求超时，请返回重试。"
            });
        }
    });
}

function userGift() {
    USER_SERVCICE.userGift({}, {
        success: function (res) {
            if (res.code == 1e3 && res != "timeout") {
                DATA = res.data;
                changeTab('hy');
            }
        },
        error: function () {
            us_cue.show({
                type: 2,
                text: "数据请求超时，请返回重试。"
            });
        }
    });
}

function changeTab(e) {
    if (0 === DATA.length) {
        $("#list").css("background", "url(images/empty.png) no-repeat transparent");
        $(".listWarp").length && $("#list .listWarp").addClass('hide');
    } else {
        $("#list").css("background", "url(images/listBg.png) no-repeat transparent");
        $(".listWarp").length && $("#list .listWarp").removeClass('hide');
        DATA.length <= 5 ? $("#progressBar").hide() : $("#progressBar").show();
        actPage = 0;
        page.renderList(e);
    }
    $.pTool.active("pageFocus");
}

function getpointGift(res) {
    USER_SERVCICE.pointGift({}, {
        success: function (res) {
            if (res.code == 1e3 && res != "timeout") {
                DATA = res.data;
                changeTab('jf');
            }
        }
    });
}
var progress = function () {
    var index = focusIndex || 0;
    var datalen = DATA.length;
    if (!datalen || datalen <= showLine * columnSize) {
        $("#progressBar").hide();
    } else {
        $("#progressBar").show();
    }
    var len = $("#progressBar")[0].clientHeight - 73;
    var everyMove = len / (Math.ceil(datalen / columnSize) - 1);
    var num = +index >= columnSize ? Math.floor(index / columnSize) : 0;
    $("#progressBar #strip").css("top", everyMove * num + "px");
}
var goPage = function () {
    if ($("#page").hasClass("hide")) {
        return;
    } else if (!$("#pageUp").hasClass("dark")) {
        active = "pageUp";
        $.focusTo({
            el: "#" + active
        });
    } else {
        active = "pageDown";
        $.focusTo({
            el: "#" + active
        });
    }
};
var inList = function (key) {
    if (key === "down" || key === "pageDown") {
        focusIndex >= DATA.length - 1 && (focusIndex = DATA.length - 1);
        if (focusIndex >= firstLineIndex + columnSize * (showLine - 1)) {
            ap.dragUp();
        } else {
            if (focusIndex + columnSize < DATA.length) {
                focusIndex += key === "down" ? columnSize : columnSize * 2;
            }
        }

    } else if (key === "up" || key === "pageUp") {
        if (focusIndex <= columnSize - 1) {
            focusIndex = 0;
            goTab();
            return true;
        }
        if (focusIndex < firstLineIndex + columnSize) {
            ap.dragDown();
        } else {
            focusIndex -= key === "up" ? columnSize : columnSize * 2;
        }
    }
    $.focusTo({
        el: "#list_item" + focusIndex
    });
    DATA.length > columnSize && progress();
    return true;
};

var goTab = function () {
    active = actTab;
    $.focusTo({
        el: "#" + actTab
    });
    removeCurrent(actTab)
};

var addCurrent = function (focus) {
    $("#" + focus).addClass('current');
}

var removeCurrent = function (focus) {
    $("#" + focus).removeClass('current');
}

function unload() {
    $.savePageInfo(pageName, {
        list: {
            actPage: actPage,
            focusIndex: focusIndex,
            firstLineIndex: firstLineIndex,
        },
        menu: {
            actTab: actTab
        },
        focus: active
    })
}

var page = function () {
    var updateInfo = function (info) {
        firstLineIndex = info.firstLineIndex;
        if (info.turnLine) {
            focusIndex -= info.columnSize * info.turnLine;
            focusIndex = Math.max(Math.min(focusIndex, info.total - 1), 0);
        }
    }
    var initAp = function () {
        return new $.AnimatePanel({
            lineHeight: 68,
            shadowLine: 0,
            showLine: showLine,
            columnSize: columnSize,
            total: DATA.length,
            firstLineIndex: firstLineIndex,
            className: "listWarp",
            paddingItem: '<div class="list_item"></div>',
            transition: "all .6s",
            appendTo: $("#list")[0],
            render: _renderTitle,
            update: updateInfo
        })
    }
    var _renderList = function (key) {
        if ($(".listWarp").length) {
            $("#list .listWarp").remove()
        }
        progress();
        ap = initAp();
    };
    var _renderTitle = function (begin, end) {
        var html = "";
        var isHy = actTab === "tab0" ? true : false;

        var imgSrc = '';
        var sendState = '';
        var name = '';
        var des = '';
        var type = '';
        for (var i = begin; i < end; i++) {
            if (!DATA[i]) break;
            imgSrc = isHy ? USER_SERVCICE.host + DATA[i].GIFTPICTURE : USER_SERVCICE.host + DATA[i].GOODSPICTURE;
            type = isHy ? DATA[i].GIFTTYPE : DATA[i].GOODSTYPE;
            sendState = type === "1" ? DATA[i].POSTNO ? '已发放' : '未发放' : '已发放';
            name = isHy ? DATA[i].GIFTNAME : DATA[i].GOODSNAME;
            des = isHy ? _changeTime(DATA[i].DATE) : _changeTime(DATA[i].CONVERTDATE);
            html += '<div id="list_item' + i + '" class="list_item"><div class="t0 noPic"><img src="' + imgSrc + '"></div>' + '<div class="t1">' + name + '</div><div class="t2">' + sendState + '</div>' + '<div class="t3">' + des + "</div></div>";
        }
        return html;
    };
    var _printBtn = function () {};
    var _changeTime = function (key) {
        var d = key.split(" ")[0];
        var t = key.split(" ")[1];
        return d.split("-")[0] + "." + d.split("-")[1] + "." + d.split("-")[2] + " " + t.split(":")[0] + ":" + t.split(":")[1];
    };
    var _focusTo = function (key) {
        var focus = "";
        switch (key) {
            case "left":
                if (active == "tab1") {
                    focus = "tab0";
                } else if (!$("#page").hasClass("hide") && $("#pageUp").hasClass("dark") && (active == "pageUp" || active == "pageDown")) {
                    break;
                } else {
                    focus = FOCUS_INFO[active][3];
                }
                break;

            case "right":
                if (active == "tab0") {
                    focus = "tab1";
                } else if (!$("#page").hasClass("hide") && $("#pageDown").hasClass("dark") && (active != "pageUp" || active != "pageDown")) {
                    break;
                } else {
                    focus = FOCUS_INFO[active][1];
                }
                break;

            case "up":
                focus = FOCUS_INFO[active][0];
                break;

            case "down":
                focus = FOCUS_INFO[active][2];
                break;
        }
        if (focus == "goList") {
            if (DATA.length === 0) return true;
            active = "list";
            $.focusTo({
                el: "#list_item" + focusIndex
            });
            addCurrent(actTab)
        } else if (focus == "inList") {
            inList(key)
        } else if (focus == "goTab") {
            goTab();
        } else if (focus == "tab0") {
            $.focusTo({
                el: "#" + focus
            });
            active = focus;
            actTab = "tab0";
            userGift();
        } else if (focus == "tab1") {
            $.focusTo({
                el: "#" + focus
            });
            active = focus;
            actTab = "tab1";
            getpointGift();
        } else if (focus) {
            $.focusTo({
                el: "#" + focus
            });
            active = focus;
        }
    };
    var _address = function () {
        $.pTool.get("us_address").init({
            type: 1,
            finishCb: function (addInfo) {
                $("#address").css("background", "url(" + changeBg + ") no-repeat transparent");
                $("#linkAddress").html("地址：" + addInfo.LINKADDRESS);
                $("#linkTel").html("电话：" + addInfo.LINKTEL);
                $("#linkName").html("收货人：" + addInfo.LINKNAME);
            },
            unFinishCb: function () {
                $.pTool.active("pageFocus");
            }
        });
        $.pTool.active("us_address");
    };
    return {
        renderList: _renderList,
        printBtn: _printBtn,
        focusTo: _focusTo,
        address: _address
    };
}();

$.pTool.add("pageFocus", function () {
    return {
        key: "pageFocus",
        keysMap: {
            KEY_LEFT: function () {
                page.focusTo("left");
                return true;
            },
            KEY_RIGHT: function () {
                page.focusTo("right");
                return true;
            },
            KEY_UP: function () {
                page.focusTo("up");
                return true;
            },
            KEY_DOWN: function () {
                page.focusTo("down");
                return true;
            },
            KEY_PAGEUP: function () {
                return true;
            },
            KEY_PAGEDOWN: function () {
                return true;
            },
            KEY_OK: function () {
                switch (active) {
                    case "list":
                        $.pTool.get('prize').init(DATA[focusIndex]);
                        $.pTool.active('prize')
                        break;

                    case "pageUp":
                        // page.pageUp();
                        break;

                    case "pageDown":
                        // page.pageDown();
                        break;

                    case "address":
                        page.address();
                        break;

                    case "tab0":
                        userGift();
                        break;

                    case "tab1":
                        getpointGift();
                        break;
                }
            }
        },
        active: function () {
            if (DEFAULT_FOCUS === 'list') {
                addCurrent(actTab)
                $.focusTo({
                    el: "#list_item" + focusIndex
                });
                return true;
            }
            $.focusTo({
                el: "#" + DEFAULT_FOCUS
            });
        },
        deactive: function () {
            DEFAULT_FOCUS = active;
        },
        init: function () {},
        cover: function () {
            return true;
        },
        uncover: function () {
            return true;
        },
        destroy: function () {}
    };
}());

$.pTool.add("prize", function () {
    var renderPrize = function (opt) {
        $("#prize") && $("#prize").remove();
        var isHy = actTab === "tab0" ? true : false;
        var cls = "";
        var list = "";
        var imgSrc = USER_SERVCICE.host + (isHy ? opt.GIFTPICTURE : opt.GOODSPICTURE);
        var name = isHy ? opt.GIFTNAME : opt.GOODSNAME;
        var getTime = isHy ? opt.DATE && opt.DATE.slice(0, 16) : opt.CONVERTDATE && opt.CONVERTDATE.slice(0, 16); // 领取时间
        var codeNum = opt.CODENUM || ''; // 三方卡双列-卡号
        var codePassWord = opt.CODEPASSWORD || ''; // 三方卡双列-密码
        var endTime = opt.OUTOFDATE === "未过期" ? opt.ENDDATE && opt.ENDDATE.slice(0, 16) : '已过期'; // 过期时间
        var des = $.substringElLength(opt.INTRODUCTION, "19px", "509px").last || ""; // 描述
        var listNum = opt.POSTNO || ''; // 实物-快递单号
        var sendState = listNum ? '已发放' : '未发放'; // 实物-发放状态
        var type = isHy ? opt.GIFTTYPE : opt.GOODSTYPE;
        if (type === "1") { //实物
            cls = 'actual';
            list = '<div>领取时间: ' + getTime + '</div><div>发放状态: ' + sendState + '</div><div>快递单号: ' + listNum + '</div><div>所属活动: 福利社奖品兑换</div><div class="des"><p>相关介绍:&nbsp;</p><p>' + des + '</p></div>';
        } else if (type === "2" || type === "3") { //卡密 优惠券
            cls = 'card';
            list = '<div>领取时间: ' + getTime + '</div><div>有效期: ' + endTime + '</div><div>所属活动: 福利社奖品兑换</div><div class="des"><p>相关介绍:&nbsp;</p><p>' + des + '</p></div>';
        } else if (type === "4") { //三方
            if (opt.COUPONTYPE === '1') { //单列
                cls = 'singleCard';
                list = '<div>领取时间: ' + getTime + '</div><div>卡号: ' + codeNum + '</div><div>有效期: ' + endTime + '</div><div>所属活动: 福利社奖品兑换</div><div class="des"><p>相关介绍:&nbsp;</p><p>' + des + '</p></div>';
            } else if (opt.COUPONTYPE === '2') { //双列
                cls = 'doubleCard';
                des = $.substringElLength(opt.INTRODUCTION, "19px", "370px").last || "";
                list = '<div>领取时间: ' + getTime + '</div><div>卡号: ' + codeNum + '</div><div>密码: ' + codePassWord + '</div><div>有效期: ' + endTime + '</div><div>所属活动: 福利社奖品兑换</div><div class="des"><p>相关介绍:&nbsp;</p><p>' + des + '</p></div>';
            } else if (opt.COUPONTYPE === '3') { //二维码
                imgSrc = USER_SERVCICE.host + opt.QRCODEPATH;
                cls = 'qr';
                list = '<div>领取时间: ' + getTime + '</div><div>有效期: ' + endTime + '</div><div>所属活动: 福利社奖品兑换</div><div class="des"><p>相关介绍:&nbsp;</p><p>' + des + '</p></div>';
            }
        }
        var isHasUse = cls === 'card' ? 'hasUse' : 'noUse';
        var button = '<div id="button" class="' + isHasUse + '"><div class="goUse">去使用</div><div class="back">返&nbsp;&nbsp;&nbsp;回</div></div>'
        var $prize = $('<div id="prize" class=""><div class="prizeName">' + name + '</div>' + '<div class="prizeImg noPic"><img src="' + imgSrc + '"></div>' + '<div class="prizeList ' + cls + '">' + list + '</div>' + button + '</div>');

        $prize.appendTo($('#prizeWarp')[0]);

        var prizeMarquee = new $.Marquee();
        setTimeout(function () {
            prizeMarquee({
                el: $("#prize .prizeName")[0]
            });
        }, 50);
    }
    return {
        key: "prize",
        keysMap: {
            KEY_LEFT: function () {
                var isHasUse = $('#button').hasClass('hasUse');
                isHasUse && $.focusTo({
                    el: "#button .goUse"
                });
                return true;
            },
            KEY_RIGHT: function () {
                var isHasUse = $('#button').hasClass('hasUse');
                isHasUse && $.focusTo({
                    el: "#button .back"
                });
                return true;
            },
            KEY_UP: function () {
                return true;
            },
            KEY_DOWN: function () {
                return true;
            },
            KEY_RETURN: function () {
                $.pTool.active('pageFocus');
                return true;
            },
            KEY_OK: function () {
                var backFocus = $('#button .back').hasClass('focusBorder');
                backFocus ? $.pTool.active('pageFocus') : $.gotoDetail($.urls.couponNouse);
            }
        },
        active: function () {
            $('#prizeWarp').show();
            var isHasUse = $('#button').hasClass('hasUse');
            $.focusTo({
                el: isHasUse ? "#button .goUse" : "#button .back"
            });
        },
        deactive: function () {
            $('#prizeWarp').hide();
        },
        init: renderPrize,
        cover: function () {
            return true;
        },
        uncover: function () {
            return true;
        },
        destroy: function () {}
    };
}());