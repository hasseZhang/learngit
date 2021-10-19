var menu = function () {
    var key = "p_menu4mine";
    var menuList = [];
    var typeName = "";
    var focusIndex = 0;
    var realIndex = 0;
    var pre = "menu";
    var menuListIndexMap = null;
    var init = function (opt) {
        opt = opt || {};
        $.pTool.add(key, p_menu());
        right = opt.right || right;
        up = opt.up || '';
        menuListIndexMap = opt.menuListIndexMap || null;
        upDateAfter = opt.upDateAfter || upDateAfter;
        focusIndex = +opt.focusIndex || 0;
        realIndex = focusIndex;
        typeName = opt.typeName || "";
        menuList = menuList.concat(opt.menuList);
        render();
    };
    var render = function () {
        var elStr = "";
        var editStr = "";
        for (var i = 0; i < menuList.length; i++) {
            elStr += '<li id="menu' + i + '" class="autoText">' + menuList[i] + "</li>";
        }
        $('<div id="menuContainer">' + '<div class="logo ' + typeName + '"></div>' + editStr + '<ul class="content"></ul>' + "</div>").appendTo("body");
        $("#menuContainer .content").html(elStr);
    };
    var p_menu = function () {
        var active = function () {
            focusTo();
        };
        var deactive = function () {
            $(getSelectorStr()).addClass("current");
        };
        var keysMap = {
            KEY_DOWN: function () {
                if (focusIndex < menuList.length - 1) {
                    focusIndex++;
                    focusTo();
                    upDateMenu(focusIndex);
                }
                return true;
            },
            KEY_UP: function () {
                if (focusIndex > 0) {
                    focusIndex--;
                    focusTo();
                    if (focusIndex >= 0) {
                        upDateMenu(focusIndex);
                    }
                } else {
                    up && up();
                }
                return true;
            },
            KEY_RIGHT: function () {
                right(focusIndex);
                return true;
            },
            KEY_OK: function () {
                if (realIndex === focusIndex) {
                    return true;
                }
                return true;
            }
        };
        return {
            key: key,
            active: active,
            deactive: deactive,
            keysMap: keysMap,
            cover: function () {
                return true;
            },
            uncover: function () {
                return true;
            },
            destroy: function () {
                return true;
            }
        };
    };
    var getSelectorStr = function () {
        return "#" + pre + focusIndex;
    };
    var focusTo = function () {
        var el = $(getSelectorStr());
        if (el.hasClass("current")) {
            el.removeClass("current");
        }
        $.focusTo({
            el: el
        });
    };
    var getState = function () {
        return {
            focusIndex: focusIndex
        };
    };
    var backAddCur = function () {
        $(getSelectorStr()).addClass("current");
    };
    var setFocusIndex = function (index) {
        focusIndex = index;
        realIndex = focusIndex;
    };
    var right = function () { };
    var upDateAfter = function () { };
    var upDateMenu = debounce(function (args) {
        upDateForMenu(args);
    }, 500);
    function upDateForMenu(index) {
        if (focusIndex === realIndex) {
            return;
        }
        realIndex = focusIndex;
        upDateAfter(focusIndex);
    }
    function debounce(fn, wait) {
        var timer;
        return function (args) {
            var context = this;
            clearTimeout(timer);
            timer = setTimeout(function () {
                fn.apply(context, [args]);
            }, wait);
        };
    }
    $.addBackUrlRedefine(function (url) {
        var opt = {
            menuIndex: focusIndex
        };
        if (menuListIndexMap) {
            opt.currentMenu = menuListIndexMap[focusIndex];
        }
        var leaveUrl = $.search.append(url, opt);
        return leaveUrl;
    });
    return {
        init: init,
        getState: getState,
        key: key,
        backAddCur: backAddCur,
        setFocusIndex: setFocusIndex
    };
}();