(function (factory) {
    $.pTool.add("header", factory());
})(function () {
    var config = {
        isHasMarquee: false,
        isKm: false,
        showKmLogo: false,
    };
    var $header = null;
    var $email = null;
    var $order = null;
    var $yun = null;
    var $version = null;
    var $user = null;
    var $floating = null;
    var $hotLine = null;
    var activeKey = "search";
    var leaveHeader = function () {};
    var isActive = false;
    var isShow = true;
    var preActive = "";
    var url = null;
    var floatLogoGid = $.getVariable("EPG:isTest") ? '1100008302' : '1100009849';
    var topArr = ["order", "search", "recent", "email", "yun", "user"];

    function createEl() {
        if ($header) {
            return;
        }
        var name = config.isHome ? "isHome" : config.isList ? "isList" : config.isUserSystem ? "isUser" : config.isKm ? 'isKm' : config.showKmLogo ? 'showKmLogo' : '';
        var aliasName = ''; // 专区别名 -> 默认情况下和优酷显示一致
        if (config.aliasName) {
            aliasName = config.aliasName;
            config.isKm = true;
        }
        $header = $('<div id="header" class="' + name + aliasName + '"></div>');
        if (config.showKmLogo) {
            $('<div class="logo"></div>').appendTo($header);
        } else if (config.isKm) {
            $('<div class="logo"></div>').appendTo($header);
            $('<div class="search"></div>').appendTo($header);
        } else {
            $('<div class="logo"></div>').appendTo($header);
            $('<div class="search"></div>').appendTo($header);
            $('<div class="companyLogo"></div>').appendTo($header);
            $('<div class="recent"></div>').appendTo($header);
            $('<div class="preSearch preload"></div>').appendTo($header);
            $('<div class="preRecent preload"></div>').appendTo($header);
        }
        $header.appendTo(config.wrap);
    }

    function initMarquee() {
        $('<div class="notice"><div class="icon"></div><div class="mar"><div class="text"></div></div></div>').appendTo($header);
    }

    function initTime() {
        var preTime = new $.Date().format("hh:mm");
        var oTime = $('<div class="time"></div>');
        oTime.html(preTime);
        oTime.appendTo($header);
        setInterval(function () {
            var nowTime = new $.Date().format("hh:mm");
            if (nowTime != preTime) {
                preTime = nowTime;
                oTime.html(nowTime);
            }
        }, 1e3);
    }

    function initEmail() {
        if (!$email) {
            $email = $('<div class="email"></div>').appendTo($header);
            $('<div class="preEmail preload"></div>').appendTo($header);
        }
    }

    function initVerison() {
        if (!$version) {
            $version = $('<div class="version"></div>').appendTo($header);
        }
    }

    function initUser() {
        if (!$user) {
            $user = $('<div class="user"></div>').appendTo($header);
            $.s.guidance.get({
                id: floatLogoGid
            }, {
                async: false,
                success: function (res) {
                    if (res && res.length) {
                        var srcPath = $.getPic(res[0].pics, [0]);
                        $floating || ($floating = $('<div class="floating"><img src="' + srcPath + '"/></div>').appendTo($user))
                    }
                }
            });
        }
    }

    function initOrder() {
        if (!$order && homeMarquee && homeMarquee.datatj[0]) {
            $order = $('<div class="order"><img class="noFocus" src=' + homeMarquee.datatj[0].pic + ">" + '<img class="focus hide" src=' + homeMarquee.datatj[0].picF + "></div>").appendTo($header);
        }
        if (!$yun) {
            $yun = $('<div class="yun"></div>').appendTo($header);
        }
        if (!$hotLine) {
            $hotLine = $('<div class="hotLine"></div>').appendTo($header);
        }
    }

    function orderF() {
        if ($order) {
            if (activeKey === "order" && isActive == true) {
                $(".noFocus").addClass("hide");
                $(".focus").removeClass("hide");
            } else {
                $(".focus").addClass("hide");
                $(".noFocus").removeClass("hide");
            }
        }
    }

    function sendVS(key) {
        if (/linn\/page\/homePage\//.test(location.href)) {
            var version = top.$.linnEdition;
            var ediType = "WE3U";
            version === "standardEdition" && (ediType = "WE3U");
            version === "simplifiedEdition" && (ediType = "SWE3U");
            version === "childrenEdition" && (ediType = "CWE3U");
            var index = topArr.indexOf(key) + 1;
            $.vs.eventTj({
                eventclick: ediType + "_top栏_TOP000" + index,
                eventcode: "05",
                eventdata: "TOP000" + index
            })
        }

    }
    return {
        key: "header",
        dft: false,
        silenceKeys: [],
        show: function () {
            isShow = true;
            $header.removeClass("hide");
        },
        hide: function () {
            isShow = false;
            $header.addClass("hide");
        },
        init: function (opt) {
            opt && opt.isHasMarquee && (config.isHasMarquee = opt.isHasMarquee);
            opt && opt.isHasTime && (config.isHasTime = opt.isHasTime);
            opt && opt.isHasEmail && (config.isHasEmail = opt.isHasEmail);
            opt && opt.activeKey && (activeKey = opt.activeKey);
            opt && opt.leaveHeader && (leaveHeader = opt.leaveHeader);
            opt && opt.isVersionChange && (config.isVersionChange = opt.isVersionChange);
            opt && opt.wrap && (config.wrap = $(opt.wrap)) || (config.wrap = $("body"));
            opt && opt.isHome && (config.isHome = true);
            opt && opt.isList && (config.isList = true);
            opt && opt.isKm && (config.isKm = true);
            opt && opt.showKmLogo && (config.showKmLogo = true);
            opt && opt.isUserSystem && (config.isUserSystem = true);
            opt && opt.aliasName && (config.aliasName = opt.aliasName);
            createEl();
            opt && opt.custom && this.custom(opt.custom);
            config.isKm && initOrder();
            config.isHasMarquee && initMarquee();
            config.isHasTime && initTime();
            config.isHasEmail && initEmail();
            config.isHome && initOrder();
            config.isVersionChange && initVerison();
            config.isHome && !config.isVersionChange && initUser();
        },
        active: function () {
            // 酷喵等sp没有搜索和历史，无法上移
            if ($("#header ." + activeKey).length === 0) return leaveHeader()
            isActive = true;
            $.focusTo({
                el: "#header ." + activeKey
            })
            orderF();
        },
        deactive: function () {
            isActive = false;
            preActive = activeKey;
            orderF();

        },
        cover: function () {
            return true;
        },
        uncover: function () {
            activeKey = preActive;
            return true;
        },
        keysMap: {
            KEY_LEFT: function () {
                if (config.isKm) {
                    if (activeKey === "order") {
                        activeKey = "search";
                        $.focusTo({
                            el: "#header .search"
                        });
                        orderF();
                    }
                    return true;
                }
                if (activeKey === "recent") {
                    activeKey = "search";
                    $.focusTo({
                        el: "#header .search"
                    });
                } else if (activeKey === "search" && $order) {
                    activeKey = "order";
                    $.focusTo({
                        el: "#header .order"
                    });
                    orderF();
                } else if (activeKey === "yun" && $email) {
                    activeKey = "email";
                    $.focusTo({
                        el: "#header .email"
                    });
                } else if (activeKey === "email") {
                    activeKey = "recent";
                    $.focusTo({
                        el: "#header .recent"
                    });
                } else if (activeKey === "version" && $yun) {
                    activeKey = "yun";
                    $.focusTo({
                        el: "#header .yun"
                    });
                } else if (activeKey === "user" && !$version) {
                    activeKey = "yun";
                    $.focusTo({
                        el: "#header .yun"
                    });
                }
                return true;
            },
            KEY_RIGHT: function () {
                if (config.isKm) {
                    if (activeKey === "search" && $order) {
                        activeKey = "order";
                        $.focusTo({
                            el: "#header .order"
                        });
                        orderF();
                    }
                    return true;
                }
                if (activeKey === "search") {
                    activeKey = "recent";
                    $.focusTo({
                        el: "#header .recent"
                    });
                } else if (activeKey === "recent" && $email) {
                    activeKey = "email";
                    $.focusTo({
                        el: "#header .email"
                    });
                } else if (activeKey === "email" && $yun) {
                    activeKey = "yun";
                    $.focusTo({
                        el: "#header .yun"
                    });
                } else if (activeKey === "yun" && $version) {
                    activeKey = "version";
                    $.focusTo({
                        el: "#header .version"
                    });
                } else if (activeKey === "order") {
                    activeKey = "search";
                    $.focusTo({
                        el: "#header .search"
                    });
                    orderF();
                } else if (activeKey === "yun" && !$version) {
                    activeKey = "user";
                    $.focusTo({
                        el: "#header .user"
                    });
                }
                return true;
            },
            KEY_DOWN: function () {
                leaveHeader();
                orderF();
                return true;
            },
            KEY_OK: function () {
                var key = activeKey === "version" ? 'user' : activeKey;
                sendVS(key);
                url = $.urls[activeKey];
                activeKey === "order" && (url = homeMarquee.datatj[0]);
                activeKey === "yun" && STBAppManager.startAppByName("com.android.smart.tv.cloud189");
                activeKey === "version" && $.pTool.active("version");
                activeKey === "user" && (url = $.urls.userSystem);
                url && $.gotoDetail(url);
                return true;
            }
        },
        custom: function (el) {
            $(el).appendTo($header);
        },
        addEmail: function (emailNum) {
            if ($email && emailNum > 0) {
                $('<div class="num">' + (emailNum > 99 ? "99+" : emailNum) + "</div>").appendTo($email);
            }
        },
        getInfo: function () {
            return {
                isActive: isActive,
                activeKey: activeKey,
                isShow: isShow
            };
        }
    };
});