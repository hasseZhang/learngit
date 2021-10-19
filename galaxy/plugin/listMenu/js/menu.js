var NEED_VIP_FLAG = "1";
var menu = function() {
    var allMenu = $.getHelper("provider:menu").cache();
    var isUnCover = false;
    var _config = {
        key: "p_menu",
        isActive: false,
        type: $.page.type,
        currentMenu: $.page.currentMenu,
        shadowItem: 1,
        isBuyBtnleave: false,
        isBuy: false,
        first: {
            pre: "f_li",
            firstIndex: 0,
            focus: "f_li0",
            size: 6,
            height: 150
        },
        second: {
            pre: "s_li",
            firstIndex: 0,
            focus: "s_li0",
            size: 6,
            height: 150
        },
        nowInfo: {
            type: undefined
        }
    };
    var isDouble = allMenu[_config.type]["father"];
    $.addBackUrlRedefine(function(url) {
        var stateObj = _getState();
        url = $.search.append(location.href, {
            type: stateObj.type,
            currentMenu: stateObj.currentMenu,
            POSITIVE: null
        });
        return url;
    });
    function _renderMenuContent() {
        NEED_VIP_FLAG = allMenu[_config.type] && parseInt(allMenu[_config.type]['needVip']);
		var needMask = allMenu[_config.type] && allMenu[_config.type]['needMask'];
        var arrow = isDouble ? '<div class="arrow"></div>' : "";
        var menuContent = '<div class="menu">' + (parseInt(needMask) ? '<div class="shadow"></div>' : '') + arrow + '<div class="logo"></div><div class="menuLine"></div><div class="secondClass "></div><div class="firstClass "></div></div>';
        $(menuContent).appendTo($("#content"));
    }
    function _renderMenuList() {
        var secondList = allMenu[_config.type]["subList"];
        _renderSmenu(secondList);
        _renderFirstList();
    }
    function _renderFirstList() {
        var firstList = allMenu[_config.type]["father"];
        if (!firstList) {
            $(".menu").addClass("simpleList");
            return;
        }
        if (/^TTXB/.test(_config.type)) {
            $("<div class='logo ttxb'><div>").appendTo($("body"));
        }
        $('<ul id ="firstContent"></ul>').appendTo($(".firstClass"));
        var els = [];
        $.UTIL.each(firstList, function(item, index) {
            els.push('<li id="f_li' + index + '" class="autoText" index="' + index + '" name="' + item + '">' + item + "</li>");
        });
        $(els.join("")).appendTo($("#firstContent"));
        var index = firstList.indexOf(allMenu[_config.type].name);
        if (index === -1) {
            return;
        }
        if (index - _config.first.firstIndex >= _config.first.size - 1) {
            _config.first.firstIndex = index - _config.first.size + 1 + _config.shadowItem;
        }
        $("#firstContent").css("-webkit-transform", "translateY(" + _config.first.firstIndex * -_config.first.height + "px)");
    }
    function _renderSmenu(list) {
        $(".secondClass").html("");
        $('<ul id ="secondContent"></ul>').appendTo($(".secondClass"));
        var elArr = [];
        $.UTIL.each(list, function(item, index) {
            elArr.push('<li id="s_li' + index + '" class="autoText" index="' + index + '">' + item.name + "</li>");
        });
        if (!isDouble) {
           renderBg();  
        }
		renderLogo();
        var index = _getCurrentMenuIndex();
        if (index) {
            index = +index;
        } else {
            $("#secondContent").html(elArr.join(""));
            return;
        }
        if (allMenu[_config.type].subList[0] && allMenu[_config.type].subList[0].key === "order") {
            var package = [];
            var pkg = allMenu[_config.type].subList[0].id.split(",");
            for (var i in pkg) {
                package.push({
                    chargeId: pkg[i]
                });
            }
            (function(key) {
                $.auth.auth4Pkg({
                    entrance: key,
                    package: package,
                    callback: function(result) {
                        if (_config.type !== key) {
                            return;
                        }
                        var isTimeout = !!(result && result.code === "timeOut");
                        if (isTimeout) {
                            _config.isBuy = true;
                            return;
                        }
                        _config.isBuy = false;
                        for (var i = 0; i < package.length; i++) {
                            if (result[package[i].chargeId]) {
                                _config.isBuy = true;
                            }
                        }
                        if (_config.isBuy) {
                            $("#" + _config.second.pre + 0).html("已订购");
                        } else {
                            $("#" + _config.second.pre + 0).html("立即订购");
                        }
                    }
                });
            })(_config.type);
        }
        if (index - _config.second.firstIndex >= _config.second.size - 1) {
            _config.second.firstIndex = index - _config.second.size + 1 + _config.shadowItem;
        }
        $("#secondContent").css("-webkit-transform", "translateY(" + _config.second.firstIndex * -_config.second.height + "px)");
        $("#secondContent").html(elArr.join(""));
    }
    function renderLogo() {
        var $logo = $("#content .menu .logo");
        if (allMenu[_config.type].logo) {
            $logo.html('');
            $logo.css("backgroundImage", 'url("' + allMenu[_config.type].logo + '")');
        } else {
            if (/^TTXB/.test(_config.type)) {
                $logo.html(allMenu[_config.type].name);
                $logo.css("backgroundImage", 'url("../../plugin/listMenu/images/logo/logo_ttxb.png")');
            }else{
                $logo.css("backgroundImage", '');
            }
		}
    }
    function renderBg() {
        if (allMenu[_config.type].bg) {
            var $content = $("#content");
            $content.css("background", 'url("' + allMenu[_config.type].bg + '") no-repeat top right');
        }
    }
    var _active = function() {
        $.pTool.active("p_menu");
        if (isUnCover) {
            isUnCover = false;
            return;
        }
        var index = _config.isBuyBtnleave ? 0 : _getCurrentMenuIndex();
        var el = index ? "#s_li" + index : "#s_li0";
        isKm  &&  $(el).addClass('ykzq');
        $.focusTo({
            el: el,
            marquee: [ el + ".autoText" ]
        });
        _config.isBuyBtnleave = false;
    };
    var _deactive = function() {
        _config.isActive = false;
    };
    function getTypeObj() {
        var index = _getCurrentMenuIndex();
        var nowStyle = allMenu[_config.type];
        var id = nowStyle.subList[index].id;
        var style = nowStyle.subList[index].pageType;
        var type = nowStyle.className[1];
        return {
            style: style,
            id: id,
            type: type,
            menuType: _config.type,
            menuCurrent: _config.currentMenu
        };
    }
    function changeContentClass(opt) {
        if ($("#content").hasClass("contentMoveR")) {
            $("#content")[0].className = "style" + opt.style + " " + opt.type + " contentMoveR";
        } else {
            $("#content")[0].className = "style" + opt.style + " " + opt.type;
        }
    }
    var _timerInitList = debounce(function(args) {
        upDateCurrentMenu(args);
    }, 800);
    function _getCurrentMenuIndex() {
        var obj = allMenu[_config.type].subList;
        var index = $.UTIL.lookupIndex(obj, _config.currentMenu, "key");
        if (index === -1) {
            return null;
        } else {
            return index;
        }
    }
    function _menuLineAutoShow() {
        var $content = $("#content");
        if ($content.hasClass("contentMoveR")) {
            $(".menu .menuLine").show();
            $(".menu .arrow").hide();
        } else {
            $(".menu .menuLine").hide();
            $(".menu .arrow").show();
            $(".menu .arrow").addClass("pulse");
        }
    }
    function _resetSecond() {
        _config.second.focus = "s_li0";
        _config.second.firstIndex = 0;
        _config.currentMenu = allMenu[_config.type].subList[0].key;
        $("#secondContent").css("-webkit-transform", "translateY(0px)");
    }
    function _addCurrent() {
        for (var i = 0; i < allMenu[_config.type]["subList"].length; i++) {
            $("#" + _config.second.pre + i).removeClass("current");
        }
        if(isKm){
            $("#" + _config.second.pre + _getCurrentMenuIndex()).addClass("ykzq current");
        }else{
            $("#" + _config.second.pre + _getCurrentMenuIndex()).addClass("current");
        }
    }
    function upDateCurrentMenu(index) {
		if (allMenu[_config.type].subList[0] && allMenu[_config.type].subList[0].key === "order") {
			var package = [];
			var pkg = allMenu[_config.type].subList[0].id.split(",");
			for (var i in pkg) {
				package.push({
					chargeId: pkg[i]
				});
			}
			(function(key) {
				$.auth.auth4Pkg({
					entrance: key,
					package: package,
					callback: function(result) {
						if (_config.type !== key) {
							return;
						}
						var isTimeout = !!(result && result.code === "timeOut");
						if (isTimeout) {
							_config.isBuy = true;
							return;
						}
						_config.isBuy = false;
						for (var i = 0; i < package.length; i++) {
							if (result[package[i].chargeId]) {
								_config.isBuy = true;
							}
						}
						if (_config.isBuy) {
							$("#" + _config.second.pre + 0).html("已订购");
						} else {
							$("#" + _config.second.pre + 0).html("立即订购");
						}
					}
				});
			})(_config.type);
		}

        if (_config.type === _config.nowInfo.type && _config.currentMenu === allMenu[_config.type].subList[index].key) {
            $("#" + _config.second.pre + _getCurrentMenuIndex()).addClass("current");
            return;
        }
        _config.nowInfo.type = _config.type;
        _config.currentMenu = allMenu[_config.type].subList[index].key;
        var typeObj = getTypeObj();
        _config.updateCallBack && _config.updateCallBack(typeObj);
        $.isBackRedefine(false);
        changeContentClass(typeObj);
    }
    var p_menu = function() {
        var getParent = function() {
            return $($.activeObj.el)[0].parentNode;
        };
        var getIndex = function() {
            return $($.activeObj.el).attr("index");
        };
        var getKey = function() {
            return $.activeObj.el;
        };
        var key = "p_menu";
        var keysMap = {
            KEY_DOWN: function() {
                var index = +getIndex();
                if (index >= getParent().children.length - 1) {
                    return true;
                }
                index++;
                var el = getKey().replace(/\d+$/, index);
                (isKm) &&  $(el).addClass('ykzq');
                $.focusTo({
                    el: el,
                    marquee: [ el + ".autoText" ]
                });
                var firstIndex = /first/.test(getParent().id) ? _config.first.firstIndex : _config.second.firstIndex;
                var size = /first/.test(getParent().id) ? _config.first.size : _config.second.size;
                var height = /first/.test(getParent().id) ? _config.first.height : _config.second.height;
                if (index - firstIndex >= size - _config.shadowItem) {
                    firstIndex++;
                    if (/first/.test(getParent().id)) {
                        _config.first.firstIndex++;
                    }
                    if (/second/.test(getParent().id)) {
                        _config.second.firstIndex++;
                    }
                    $(getParent()).css("-webkit-transform", "translateY(" + firstIndex * -height + "px)");
                }
                if (/first/.test(getParent().id)) {
                    var arr = null;
                    var key = $(el).attr("name");
                    for (var i in allMenu) {
                        if (allMenu[i].name === key) {
                            arr = allMenu[i].subList;
                            _config.type = i;
                        }
                    }
                    if (arr) {
                        _renderSmenu(arr);
                    }
                    _resetSecond();
                    if((arr.length > 0) && arr[0]['key'] == 'order') {
                        _timerInitList(1);
                    } else {
                        _timerInitList(0);
                    }
                } else {
                    _timerInitList(index);
                }
                currentRow = 1;
                return true;
            },
            KEY_UP: function() {
                var index = +getIndex();
                if (index <= 0) {
                    if (/second/.test(getParent().id)) {
                        if (/current/.test($($.activeObj.el)[0].className) || _isBuyBtn()) {
                            if (_isBuyBtn()) {
                                _config.isBuyBtnleave = true;
                            }
                            _config.up && _config.up();
                        }
                    }
                    return true;
                }
                var firstIndex = /first/.test(getParent().id) ? _config.first.firstIndex : _config.second.firstIndex;
                var height = /first/.test(getParent().id) ? _config.first.height : _config.second.height;
                if (index === firstIndex) {
                    firstIndex--;
                    if (/first/.test(getParent().id)) {
                        _config.first.firstIndex--;
                    }
                    if (/second/.test(getParent().id)) {
                        _config.second.firstIndex--;
                    }
                    $(getParent()).css("-webkit-transform", "translateY(" + firstIndex * -height + "px)");
                }
                index--;
                if (_isBuyBtn("" + index)) {
                    if (1 !== _getCurrentMenuIndex()) {
                        return true;
                    }
                }
                var el = getKey().replace(/\d+/, index);
                isKm &&  $(el).addClass('ykzq');
                $.focusTo({
                    el: el,
                    marquee: [ el + ".autoText" ]
                });
                if (/first/.test(getParent().id)) {
                    var arr = null;
                    var key = $(el).attr("name");
                    for (var i in allMenu) {
                        if (allMenu[i].name === key) {
                            arr = allMenu[i].subList;
                            _config.type = i;
                        }
                    }
                    if (arr) {
                        _renderSmenu(arr);
                    }
                    _resetSecond();
                    if((arr.length > 0) && arr[0]['key'] == 'order') {
                        _timerInitList(1);
                    } else {
                        _timerInitList(0);
                    }
                } else {
                    if (!_isBuyBtn()) {
                        _timerInitList(index);
                    }
                }
                currentRow = 1;
                return true;
            },
            KEY_LEFT: function() {
                if (!isDouble) {
                    return true;
                }
                var liParent = getParent().id;
                if (/second/.test(liParent)) {
                    $("#content").addClass("contentMoveR");
                    _config.second.focus = getKey().replace("#", "");
                    if (!allMenu[_config.type].father) {
                        return;
                    }
                    var index = allMenu[_config.type].father.indexOf(allMenu[_config.type].name);
                    if (index === -1) {
                        return true;
                    }
                    isKm &&  $("#f_li" + index).addClass('ykzq');
                    $.focusTo({
                        el: "#f_li" + index,
                        marquee: [ "#f_li" + index + ".autoText" ]
                    });
                    if (index - _config.first.firstIndex >= _config.first.size) {
                        _config.first.firstIndex = index - _config.first.size + 2;
                        $(getParent()).css("-webkit-transform", "translateY(" + _config.first.firstIndex * -_config.first.height + "px)");
                    }
                    $("#video").addClass("noPlayer");
                    _config.move && _config.move();
                }
                _menuLineAutoShow();
                _addCurrent();
                return true;
            },
            KEY_RIGHT: function() {
                var liParent = $(getParent()).attr("id");
                var opt = getTypeObj()
                if (/second/.test(liParent)) {
                    if (getIndex() != _getCurrentMenuIndex() && !_isBuyBtn()) {
                        return;
                    }
                    _config.right && _config.right(opt);
                } else {
                    $("#content").removeClass("contentMoveR");
                    _config.first.focus = getKey();
                    var index = _getCurrentMenuIndex() || 0;
                    var el = "#" + _config.second.pre + index;
                    $.focusTo({
                        el: el,
                        marquee: [ el + ".autoText" ]
                    });
                    _config.move && _config.move();
                    _menuLineAutoShow();
                }
                return true;
            },
            KEY_OK: function() {
                if (_isBuyBtn() && !_config.isBuy) {
                    _config.isBuyBtnleave = true;
                    $.auth.forwardOrder(false, false, [ allMenu[_config.type].subList[$($.activeObj.el).attr("index")].id ]);
                }
                return true;
            }
        };
        return {
            key: key,
            keysMap: keysMap,
            active: _active,
            deactive: _deactive,
            blur: _blur,
            cover: function() {
                return true;
            },
            uncover: function() {
                isUnCover = true;
                return true;
            }
        };
    };
    function _initMenuInfo(opt) {
        _config.right = opt.right || function() {};
        _config.up = opt.up || function() {};
        _config.updateCallBack = opt.updateCallBack;
        _config.first.firstIndex = opt.first || _config.first.firstIndex;
        _config.second.firstIndex = opt.second || _config.second.firstIndex;
        _config.move = opt.move || function() {};
        _config.isBuyBtnleave = opt.isBuyBtnleave || false;
    }
    function _isBuyBtn(index) {
        var o = allMenu[_config.type].subList[index || $($.activeObj.el).attr("index")];
        return o && o.index < 0 && o.key === "order";
    }
    function _init(opt) {
        $.pTool.add(_config.key, p_menu());
        _initMenuInfo(opt);
        _renderMenuContent();
        _renderMenuList();
        changeContentClass(getTypeObj());
        return getTypeObj();
    }
    function _getCurrentName() {
        var index = _getCurrentMenuIndex() || 0;
        return allMenu[_config.type].subList[index].name;
    }
    function _getCurrentIcon() {
        return allMenu[_config.type].iconFlag;
    }
    function _blur() {
        _config.isActive = false;
        var index = _getCurrentMenuIndex();
        isKm ? $("#s_li" + index).addClass("current ykzq") :  $("#s_li" + index).addClass("current");
    }
    function debounce(fn, wait) {
        var timer;
        return function(args) {
            var context = this;
            clearTimeout(timer);
            timer = setTimeout(function() {
                fn.apply(context, [ args ]);
            }, wait);
        };
    }
    function _getState() {
        var state = {
            type: _config.type,
            currentMenu: _config.currentMenu,
            first: _config.first.firstIndex,
            second: _config.second.firstIndex,
            isActive: _config.isActive,
            isBuyBtnleave: _config.isBuyBtnleave
        };
        return state;
    }
    var menu = {
        init: _init,
        active: _active,
        renderContent: _renderMenuContent,
        getIconFlag: _getCurrentIcon,
        renderList: _renderMenuList,
        getCurrentName: _getCurrentName,
        initMenuInfo: _initMenuInfo,
        blur: _blur,
        getState: _getState,
        addCur: _addCurrent,
        addTransition: function() {
            $("#content").css("-webkit-transition", "all 0.6s ease 0s");
        }
    };
    return menu;
}();