typeof Function.prototype.bind === "function" || (Function.prototype.bind = function (scope) {
    var args = $.UTIL.slice(arguments, 1);
    var that = this;
    return function () {
        return that.apply(scope, args.concat($.UTIL.slice(arguments, 0)));
    };
});

function Query(selector, parent, all) {
    if (!(this instanceof Query)) {
        return new Query(selector, parent, all);
    }
    if (! selector) 
        return this;
    
    var root = parent || document,
        out = [];
    typeof parent == "string" && (root = document.querySelector(parent));
    if (typeof selector === "string") {
        if (/\</.test(selector)) {
            var tmpEl = document.createElement("div");
            tmpEl.innerHTML = selector;
            for (var i = 0; i < tmpEl.childNodes.length; i++) {
                out.push(tmpEl.childNodes[i]);
            }
        } else if (root) {
            try {
                var tmp = root["querySelector" + (
                    all ? "All" : ""
                )].call(root, selector);
                if (all) {
                    tmp.length && (out =[].slice.call(tmp));
                } else {
                    tmp && out.push(tmp);
                }
            } catch (e) {}
        }
    } else if (selector instanceof Query) {
        out = selector;
    } else if ("nodeType" in selector) {
        out.push(selector);
    }
    for (var i = 0; i < out.length; i++) {
        this[i] = out[i];
    }
    this.length = out.length;
    return this;
}

Query.isDOM = function (obj) {
    if (typeof HTMLElement === "function") {
        this.isDOM = function (obj) {
            return !!(obj instanceof HTMLElement);
        };
    } else {
        this.isDOM = function (obj) {
            return !!(obj && typeof obj !== "undefined" && obj.nodeType === 1 && typeof obj.nodeName === "string");
        };
    }
    return this.isDOM(obj);
};

Query.isEqualNode = function (dom, dom2) {
    if ("isEqualNode" in document.documentElement) {
        this.isEqualNode = function (dom, dom2) {
            return dom === dom2;
        };
    } else {
        this.isEqualNode = function (dom, dom2) {
            if (this.isDOM(dom) && this.isDOM(dom2)) {
                try {
                    var r = dom.nodeName === dom2.nodeName && dom.nodeType === dom2.nodeType && dom.nodeValue === dom2.nodeValue && dom.innerHTML === dom2.innerHTML;
                    if (r) {
                        if (this.isDOM(dom.previousSibling) && this.isDOM(dom2.previousSibling)) {
                            return _isEqualNode(dom.previousSibling, dom2.previousSibling);
                        } else {
                            return dom.previousSibling === dom2.previousSibling;
                        }
                    }
                    return !! r;
                } catch (e) {
                    return false;
                }
            }
            return false;
        };
    }
    return this.isEqualNode(dom, dom2);
};

Query.toPx = function (value) {
    return /%(\d+(\.\d+)*)px/.test(value) && (document.body || document.documentElement).clientWidth / 100 * RegExp.$1 + "px";
};

Query.prototype = {
    constructor: Query,
    isDOM: Query.isDOM,
    length: 0,
    item: function (index) {
        return Query(this[index]);
    },
    first: function () {
        return this.item(0);
    },
    last: function () {
        return this.item(this.length - 1);
    },
    hide: function () {
        this.addClass("hide");
        return this;
    },
    show: function () {
        this.removeClass("hide");
        return this;
    },
    html: function (html) {
        var el = this[0];
        if (el) {
            if (typeof html !== "undefined") {
                for (var i = 0; i < this.length; i++) {
                    this[i].innerHTML = html;
                }
            } else {
                return el.innerHTML || "";
            }
        }
    },
    attr: function (key, value) {
        if (arguments.length === 1) {
            if (typeof key === "string") {
                if (!this.length) {
                    return null;
                }
                return this[0].getAttribute(key);
            } else {
                for (var i = 0; i < this.length; i++) {
                    for (var j in key) {
                        if (key.hasOwnProperty(j)) {
                            var value = key[j];
                            if (value === null) {
                                this[i].removeAttribute(j);
                            } else {
                                if (typeof value === "undefined") {
                                    value = "";
                                }
                                this[i].setAttribute(j, key[j]);
                            }
                        }
                    }
                }
                return this;
            }
        } else {
            for (var i = 0; i < this.length; i++) {
                this[i].setAttribute(key, value);
            }
            return this;
        }
    },
    hasClass: function (value) {
        if (value && this.length) {
            var t = this[0];
            var classList = t.className ? t.className.split(" ") : [];
            if (classList.length) {
                for (var i = 0; i < classList.length; i++) {
                    if (value === classList[i]) {
                        return true;
                    }
                }
            }
        }
        return false;
    },
    addClass: function (value) {
        var supportClassList = false;
        if ("classList" in document.documentElement) {
            supportClassList = true;
        }
        this.addClass = function (value) {
            var list = typeof value === "string" ? value === "" ? [] : value.split(" ") : value;
            if (list && list.length) {
                for (var i = 0; i < this.length; i++) {
                    var t = this[i];
                    if (t) {
                        var classList = [];
                        if (! supportClassList) {
                            classList = t.className ? t.className.split(" ") : [];
                        }
                        for (var j in list) {
                            if (list.hasOwnProperty(j)) {
                                if (supportClassList) {
                                    t.classList.add(list[j]);
                                } else {
                                    classList.push(list[j]);
                                }
                            }
                        }
                        if (! supportClassList) {
                            t.className = classList.join(" ");
                        }
                    }
                }
            }
            return this;
        };
        return this.addClass.apply(this, arguments);
    },
    removeClass: function (value) {
        var supportClassList = false;
        if ("classList" in document.documentElement) {
            supportClassList = true;
        }
        this.removeClass = function (value) {
            var list = typeof value === "string" ? value === "" ? [] : value.split(" ") : value;
            for (var i = 0; i < this.length; i++) {
                var t = this[i];
                if (list && list.length) {
                    if (t) {
                        if (supportClassList) {
                            for (var j in list) {
                                if (list.hasOwnProperty(j)) {
                                    t.classList.remove(list[j]);
                                }
                            }
                        } else {
                            var classList = t.className ? t.className.split(" ") : [];
                            var map = {};
                            for (var key in list) {
                                map[list[key]] = 1;
                            }
                            var out = [];
                            for (var key in classList) {
                                var tmp = classList[key];
                                if (! map[tmp]) {
                                    out.push(tmp);
                                }
                            }
                            t.className = out.join(" ");
                        }
                    }
                } else {
                    if (t && t.className) {
                        t.className = "";
                    }
                }
            }
            return this;
        };
        return this.removeClass.apply(this, arguments);
    },
    css: function () {
        function _css() {
            var key = arguments[0],
                val = arguments[1];
            if (!arguments.length) {
                return _getCssObj.call(this, this[0]);
            } else if (arguments.length === 1) {
                if (typeof key === "string") {
                    var computedStyle = _getCssObj.call(this, this[0]);
                    return computedStyle && computedStyle[key];
                } else {
                    var reg1 = /%|px/;
                    for (var i = 0; i < this.length; i++) {
                        for (var j in key) {
                            if (key.hasOwnProperty(j)) {
                                var value = key[j];
                                var keys = {
                                    width: 1,
                                    height: 1,
                                    left: 1,
                                    top: 1,
                                    right: 1,
                                    bottom: 1
                                };
                                if (keys[j]) {
                                    if (! reg1.test(value)) {
                                        value += "px";
                                    }
                                }
                                this[i].style[j] = value;
                            }
                        }
                    }
                }
            } else {
                for (var i = 0; i < this.length; i++) {
                    this[i].style[key] = val;
                }
            }
            return this;
        }
        var _getCssObj;
        if (window.getComputedStyle) {
            _getCssObj = function (el) {
                if (document && document.defaultView && this.isDOM(el)) {
                    return document.defaultView.getComputedStyle(el, null);
                }
            };
        } else {
            _getCssObj = function (el) {
                if (this.isDOM(el)) {
                    return el.style;
                }
            };
        }
        this.css = _css;
        return _css.apply(this, arguments);
    },
    appendTo: function (selector) {
        var parent = Query(selector)[0];
        if (parent) {
            for (var i = 0; i < this.length; i++) {
                var el = this[i];
                parent.appendChild(el);
            }
        }
        return ths;
    },
    remove: function () {
        for (var i = 0; i < this.length; i++) {
            var el = this[i];
            if (el) {
                if (el.remove) {
                    el.remove();
                } else {
                    el.parentNode && el.parentNode.removeChild && el.parentNode.removeChild(el);
                }
            }
        }
        return this;
    },
    find: function (selector) {
        return Query(selector, this[0], true);
    },
    offsetParent: function () {
        return this[0] && Query(this[0].offsetParent);
    },
    clientWidth: function () {
        return this.length ? this[0].clientWidth : NaN;
    },
    clientHeight: function () {
        return this.length ? this[0].clientHeight : NaN;
    },
    offsetWidth: function () {
        return this.length ? this[0].offsetWidth : NaN;
    },
    offsetHeight: function () {
        return this.length ? this[0].offsetHeight : NaN;
    },
    offsetTop: function () {
        return this.length ? this[0].offsetTop : NaN;
    },
    offsetLeft: function () {
        return this.length ? this[0].offsetLeft : NaN;
    }
};

window.referrer = parent.referrer;

var $ = new top.Common(window, Query, {
    substringElLength: function (name, size, width) {
        this.substringElLengthFns || (this.substringElLengthFns =
            {});
        var key = "key_" + size + "_" + width;
        var fn = this.substringElLengthFns[key];
        if (! fn) {
            fn = this.substringElLengthFns[key] = this.Lathe({
                style: {
                    "font-size": size,
                    width: width
                }
            });
        }
        return fn(name);
    },
    focusToOld: function (key) {
        if (! key) 
            return;
        
        this.hideFocus();
        if (typeof PAGE_INFO !== "undefined") {
            $.UTIL.each(PAGE_INFO, function (obj) {
                if (obj.key === key) {
                    window.ACTIVE_OBJECT = obj;
                    return true;
                }
            });
        }
        var txt_all,
            txt_el,
            txt_width,
            txt_height;
        if (window.ACTIVE_OBJECT && ACTIVE_OBJECT.marquee && ACTIVE_OBJECT.marquee.length) {
            txt_all = ACTIVE_OBJECT.wholeMsg;
            if (txt_all && ACTIVE_OBJECT.marquee && ACTIVE_OBJECT.marquee[0]) {
                txt_el = $(ACTIVE_OBJECT.marquee[1])[0];
                txt_width = ACTIVE_OBJECT.marquee[2];
                txt_height = ACTIVE_OBJECT.marquee[3];
            }
        }
        $.Marquee({all: txt_all, el: txt_el, width: txt_width, height: txt_height});
        if (window.ACTIVE_OBJECT) {
            var activeObj = $("#" + ACTIVE_OBJECT.key);
            if (activeObj.length) {
                var focusType = ACTIVE_OBJECT.focusImg && ACTIVE_OBJECT.focusImg[0];
                if (focusType == "~") {
                    return;
                }
                if (! focusType || focusType === ".") {
                    this.showFocus(activeObj);
                } else {
                    var css = activeObj.css();
                    var divImgBorder = $("#divImgBorder");
                    if (! divImgBorder.length) {
                        divImgBorder = $('<div id="divImgBorder" class="hide">').css({position: "absolute", zIndex: 30});
                        divImgBorder.html('<img style="width:0; height:0;">');
                        document.body.appendChild(divImgBorder[0]);
                    }
                    var imgBorder = $("img", divImgBorder[0]);
                    divImgBorder.hide();
                    var divYellowBorder = $("#divYellowBorder");
                    if (! divYellowBorder.length) {
                        divYellowBorder = $('<div id="divYellowBorder" class="hide">').css({position: "absolute", zIndex: 30});
                        divYellowBorder.html('<img style="width:0; height:0;">');
                        document.body.appendChild(divYellowBorder[0]);
                    }
                    var yellowBorder = $("img", divYellowBorder[0]);
                    divYellowBorder.hide();
                    if (focusType === "#") {
                        yellowBorder.css({width: css.width, height: css.height});
                        divYellowBorder.css({
                            left: parseInt(css.left) - 4 + "px",
                            top: parseInt(css.top) - 4 + "px"
                        });
                        divYellowBorder.show();
                    } else {
                        imgBorder.css({width: css.width, height: css.height});
                        imgBorder[0].src = focusType;
                        divImgBorder.css({left: css.left, top: css.top});
                        divImgBorder.show();
                    }
                }
            }
        }
    },
    focusTo: function (options) {
        if (! options) 
            return;
        
        if ($.UTIL.isString(options)) {
            return this.focusToOld(options);
        }
        this.hideFocus();
        var txt_el,
            txt_speed,
            txt_animate;
        var marquee = options.marquee;
        if (marquee && marquee.length) {
            txt_el = $(marquee[0])[0];
            txt_speed = marquee[1];
            txt_animate = marquee[2];
        }
        $.Marquee({el: txt_el, speed: txt_speed, animate: txt_animate});
        if ($.UTIL.apply(options.focusTo, arguments)) {
            return;
        }
        this.activeObj = {
            el: "#" + $(options.el).attr("id"),
            marquee: options.marquee
        };
        this.showFocus($(options.el)[0]);
    },
    hideFocus: function () {
        $(".focusBorder").removeClass("focusBorder");
        $("#divImgBorder").hide();
    },
    showFocus: function (el) {
        if (el) {
            $(el).addClass("focusBorder");
        } else {
            $("#divImgBorder").show();
        }
    },
    initPageInfo: function (pageName, input, dft) {
        var out = {};
        if (this.isBack()) {
            var tmpObj = this.getGlobalData(pageName) || {};

            if (! input || input === "*") {
                out = tmpObj;
                $.UTIL.each(dft, function (value, key) {
                    var val = tmpObj[key];
                    if (typeof val === "undefined") {
                        val = value;
                    }
                    out[key] = val;
                });
            } else {
                $.UTIL.each(input, function (key) {
                    var val = tmpObj[key];
                    if (typeof val === "undefined") {
                        val = dft && dft[key];
                    }
                    out[key] = val;
                });
            }
        } else {
            $.UTIL.each(input, function (key) {
                out[key] = dft && dft[key];
            });
        }
        this.saveGlobalData(pageName, undefined);
        return out;
    },
    savePageInfo: function (pageName, input) {
        this.saveGlobalData(pageName, input);
    },
    savePageInfoRedefine: function () {
        this.savePageInfo = function (pageName) {
            $.log.out.info = ["%s page not save data!", pageName];
        };
    },
    getPic: function (ds, types, opt) {
        var out = "";
        var picType = opt && opt.picType || "picType";
        var picPath = opt && opt.picPath || "picPath";
        $.UTIL.each(types, function (t) {
            return $.UTIL.each(ds, function (d) {
                if (d[picType] == t) {
                    out = d[picPath];
                    return true;
                }
            });
        });
        if (out) {
            out = "/pic/" + out;
        }
        return out;
    },
    gotoDetail: function (param, redirect, savePageInfo, urlHandle) {
        var url = "";
        var objUrl = param.url || param.contentUri || param.contentUrl || "";
        var contentType = "" + param.contentType;
        if ($.UTIL.isString(param)) {
            contentType = "7";
            url = param;
            objUrl = "";
        } else {
            if (contentType == "7") {
                if (/^#/.test(objUrl)) {
                    return;
                } else if (/^menu:\/\/(.*)\.(.*)/.test(objUrl)) {
                    objUrl = $.getMenu(RegExp.$1, RegExp.$2, true);
                } else if (/^(app:\/\/)/.test(objUrl)) {
                    contentType = param.contentType = "app";
                    objUrl = objUrl.replace(RegExp.$1, "");
                    param.url = param.contentUri = param.contentUrl = objUrl;
                } else if (/^(channel:\/\/)/.test(objUrl)) {
                    contentType = param.contentType = "5";
                    param.channelNum = objUrl.replace(RegExp.$1, "").replace("!", "");
                } else if (/^zhuanqu:\/\/(.*)/.test(objUrl)) {
                    objUrl = $.getVariable("EPG:pathSite") + "/linn/page/" + RegExp.$1 + "Page/"
                }
            }
        }
        switch (contentType) {
            case "0": url = $.Tpl($.urls.detailPageVod).compile($.UTIL.merge({
                    pathPage: $.getVariable("EPG:pathPage"),
                    categoryId: "",
                    contentId: "",
                    entrance: "",
                    ztCategoryId: "",
                    playModel: "",
                    groupId: ""
                }, param), true);
                break;

            case "2": url = $.Tpl($.urls.detailPageSeries).compile($.UTIL.merge({
                    pathPage: $.getVariable("EPG:pathPage"),
                    categoryId: "",
                    contentId: "",
                    entrance: "",
                    ztCategoryId: "",
                    playModel: "",
                    groupId: ""
                }, param), true);
                break;

            case "3": url = $.Tpl($.urls.detailPageXilieju).compile($.UTIL.merge({
                    pathPage: $.getVariable("EPG:pathPage"),
                    categoryId: "",
                    contentId: "",
                    entrance: "",
                    ztCategoryId: "",
                    playModel: "",
                    groupId: ""
                }, param), true);
                break;

            case "4": url = this.Tps("%s/%s/%s", $.getVariable("EPG:pathPub"), $.getVariable("EPG:ddname"), objUrl);
                break;

            case "5":
                if (/^~/.test(param.channelNum)) {
                    url = $.Tpl($.urls.playActiveChannel).compile({
                        pathPage: $.getVariable("EPG:pathPage"),
                        channelNum: param.channelNum.replace("~", "")
                    }, true);
                    break;
                } else {
                    param = {
                        channelNum: param.channelNum,
                        startTime: param.startTime || null,
                        endTime: null
                    };
                }

            case "6": $.UTIL.apply(savePageInfo);
                $.playLiveOrRec({
                    channelId: param.channelNum,
                    startTime: param.startTime,
                    endTime: param.endTime
                }, redirect);
                break;

            case "7":
                if (/^https?/.test(objUrl)) {
                    url = objUrl.replace("{pathSite}", $.getVariable("EPG:pathSite")).replace("httphttp", "http").replace("{STBType}", $.getVariable("EPG:STBType")).replace("{node}", $.getVariable("EPG:node") == "huawei" ? "hw" : "zte").replace("{backUrl}", encodeURIComponent($.search.append(location.href, {POSITIVE: null}))).replace("{userId}", $.getVariable("EPG:userId"));
                } else {
                    if (objUrl && ! url) {
                        if (/^home/.test(objUrl)) {
                            url = $.urls.home;
                        } else {
                            url = $.getVariable("EPG:pathPage") + "/" + objUrl.replace(/^\//, "");
                        }
                    } else {
                        url = $.Tpl(url).compile({
                            pathPage: $.getVariable("EPG:pathPage")
                        }, true);
                    }
                }
                break;

            case "app":
                STBAppManager.startAppByName(objUrl);
                return;
        }
        url && urlHandle && (url = $.UTIL.apply(urlHandle, [url]));
        if (! url) 
            return;
        
        $.UTIL.apply(savePageInfo);
        if (redirect) {
            $.redirect(url);
        } else {
            $.forward(url);
        }
    },
    playLiveOrRec: function (param, redirect, playHandle) {
        var url = "";
        if (param.endTime) {
            url = $.urls.playTvod;
        } else {
            url = $.urls.playChannel;
        }
        if (! $.UTIL.apply(playHandle, [param, url])) {
            url = $.search.append(url, param);
            $.gotoDetail(url, redirect);
        }
    },
    playLiveOrRecRedefine: function (redirect, playHandle) {
        var playLiveOrRec = this.playLiveOrRec;
        this.playLiveOrRec = function (param) {
            $.UTIL.apply(playLiveOrRec, [
                param, redirect, playHandle
            ], $);
        };
        this.playLiveOrRecRedefine = function () {};
    },
    playSizeLive: function (channelId, left, top, width, height) {
        var channelNum = $.getChanNum(channelId);
        if ($.UTIL.isNumber(channelNum)) {
            var mp = new $.MP({
                left: left,
                top: top,
                width: width,
                height: height,
                videoDisplayMode: 0
            });
            $.vs.liveSizePlay(channelNum);
            mp.load(channelNum, null, $.MP.mediaType.TYPE_CHANNEL);
            $.initVolume(mp);
            mp.enter = $.playLiveOrRec.bind($, {channelId: channelId});
            mp.hide = function () {
                if (mp) {
                    mp.release();
                    $.setVolumeUsability(false);
                }
            };
            mp.show = function () {
                if (mp) {
                    $.setVolumeUsability(true);
                }
            };
            return mp;
        }
    },
    playSizeList: function (param, categoryId, chargeSpIds, ztCategoryId, playModel, groupId, checkTry) {
        var tmp = $.UTIL.merge({
            left: 0,
            top: 0,
            width: 0,
            height: 0,
            videoDisplayMode: 0
        }, param);
        if (tmp.onPlay) {
            tmp._onPlay = tmp.onPlay;
        }
        tmp.onPlay = function (_onPlay, params, info, isPreVideo) {
            $.initVolume(vl.mp);
            if (! isPreVideo) {
                var isTry = $.UTIL.apply(checkTry);
                var fns = "vodSizePlay";
                var name = (isTry ? "TRY-" : "") + info.name;
                var chargeSpIdsDiy = "";
                if (typeof chargeSpIds === "function") {
                    chargeSpIdsDiy = chargeSpIds() || "";
                } else {
                    chargeSpIdsDiy = chargeSpIds;
                }
                var arr = [
                    info.contentId,
                    params.total,
                    name,
                    categoryId,
                    chargeSpIdsDiy,
                    ztCategoryId,
                    playModel,
                    groupId
                ];
                if (info.contentType == "2") {
                    fns = "serialSizePlay";
                    arr = [
                        info.contentId,
                        params.total,
                        name,
                        categoryId,
                        info.sceneNum,
                        chargeSpIdsDiy,
                        ztCategoryId,
                        playModel,
                        groupId
                    ];
                }
                $.UTIL.apply($.vs[fns], arr, $.vs);
            }
            $.UTIL.apply(_onPlay, $.UTIL.slice(arguments, 1), this);
        }.bind(tmp, tmp.onPlay);
        var vl = $.createVideoList(tmp, categoryId);
        tmp = null;
        vl.enter = function (params) {
            this.save();
            $.playVideo($.UTIL.merge({
                categoryId: categoryId,
                ztCategoryId: ztCategoryId,
                playModel: playModel,
                groupId: groupId,
                vl: categoryId,
                multiVod: $.UTIL.owns(param, "multiVod") ? param.multiVod : true
            }, params));
        };
        vl.hide = function () {
            if (vl.mp) {
                vl.mp.pause();
                $.setVolumeUsability(false);
            }
        };
        vl.show = function () {
            if (vl.mp) {
                vl.mp.resume();
                $.setVolumeUsability(true);
            }
        };
        return vl;
    },
    createVideoList: function (param, categoryId) {
        var savedParam;
        var vlId = "vlId_" + categoryId;
        if (categoryId) {
            if ($.isBack() || param.recovery) {
                savedParam = $.getGlobalData(vlId);
            }
            $.saveGlobalData(vlId, undefined);
        }
        var opt = $.UTIL.merge({
            list: null,
            current: 0,
            loop: true,
            auto: true,
            loading: null,
            onPlay: null,
            onEnd: null,
            onError: null
        }, param, savedParam);
        if (param.cleanEndPoint) {
            delete opt.cleanEndPoint;
            delete opt.endPoint;
        }
        var vl = new $.VideoList(opt);
        opt = null;
        vl.save = function () {
            if (this.mp && this.mp.player) {
                $.UTIL.apply(this.mp.player.pause, null, this.mp.player);
            }
            $.saveGlobalData(vlId, this.valueOf());
        };
        return vl;
    },
    playVideo: function (param, redirect, playHandle) {
        param = $.UTIL.merge({
            contentId: "",
            vl: null,
            categoryId: "",
            ztCategoryId: "",
            seriesId: null,
            multiVod: null,
            playTime: null,
            mediaType: 1
        }, param);
        var url = "";
        if (! url && param.seriesId && ! param.multiVod) {
            url = $.urls.playSeries;
        }
        if (! url && param.seriesId && param.multiVod) {
            url = $.urls.playXilieju;
        }
        if (! url && ! param.seriesId && param.multiVod) {
            url = $.urls.playVodList;
        }
        if (! url) {
            url = $.urls.playVod;
        }
        if (! $.UTIL.apply(playHandle, [param, url])) {
            url = $.search.append(url, param);
            $.gotoDetail(url, redirect);
        }
    },
    playVideoRedefine: function (redirect, playHandle) {
        var playVideo = this.playVideo;
        this.playVideo = function (param) {
            $.UTIL.apply(playVideo, [
                param, redirect, playHandle
            ], $);
        };
        this.playVideoRedefine = function () {};
    },
    initVolume: function (mp) {
        $.pTool.get("g_sys_volume").init(mp);
    },
    setVolumeUsability: function (enable) {
        var vol = $.pTool.get("g_sys_volume");
        if (vol) {
            vol.setUsability(!! enable);
            vol = null;
        }
    },
    addBackUrl: function () {
        $.UTIL.apply(this.saveBackUrl, arguments, this);
    },
    addBackUrlRedefine: function (urlHandle) {
        var addBackUrl = this.addBackUrl;
        this.addBackUrl = function (url, nextUrl) {
            $.UTIL.apply(addBackUrl, [
                url, nextUrl, urlHandle
            ], $);
        };
        this.addBackUrlRedefine = function () {};
    },
    recodeData: function (currentPage, analysisType, columnId) {
        var referpage = (window.referrer || "").split("?")[0];
        if ("zt" == analysisType) {
            $.vs.zt(currentPage, window.subjectId);
        } else {
            $.vs.page(referpage, window.location.href.split("?")[0], columnId || currentPage);
        }
    },
    reserve: top.getHelper("provider:reserve"),
    auth: top.$.getAuth(),
    castInfos: function (ds) {
        ds = $.UTIL.merge({
            castName: "",
            castGender: "",
            castDescription: "",
            castPicMap: {},
            height: "",
            bloodType: "",
            constellation: "",
            weight: "",
            castBirthday: "",
            castNativePlace: "",
            occupation: ""
        }, ds);
        if (ds) {
            ds.castGender = {
                1: "男",
                2: "女"
            }[ds.castGender] || "";
            ds.bloodType = {
                0: "A",
                1: "B",
                2: "AB",
                3: "O",
                4: "稀有血型"
            }[ds.bloodType] || "";
            ds.constellation = {
                1: "水瓶座",
                2: "双鱼座",
                3: "白羊座",
                4: "金牛座",
                5: "双子座",
                6: "巨蟹座",
                7: "狮子座",
                8: "处女座",
                9: "天秤座",
                10: "天蝎座",
                11: "射手座",
                12: "摩羯座"
            }[ds.constellation] || "";
        }
        return ds;
    }
});

$.urls.add({
    detailPageVod: "{{pathPage}}/detailPage/vod/?categoryId= {{categoryId}}&contentId= {{contentId}}&entrance= {{entrance}}&ztCategoryId= {{ztCategoryId}}&groupId= {{groupId}}&playModel= {{playModel}}",
    detailPageSeries: "{{pathPage}}/detailPage/series/?categoryId= {{categoryId}}&contentId= {{contentId}}&entrance= {{entrance}}&ztCategoryId= {{ztCategoryId}}&groupId= {{groupId}}&playModel= {{playModel}}",
    detailPageXilieju: "{{pathPage}}/detailPage/xilieju/?categoryId= {{categoryId}}&contentId= {{contentId}}&entrance= {{entrance}}&ztCategoryId= {{ztCategoryId}}&groupId= {{groupId}}&playModel= {{playModel}}",
    playTvod: "{{pathPage}}/playControl/tvod.html",
    noTvod: "{{pathPage}}/playControl/noTvod.html",
    noVod: "{{pathPage}}/playControl/noVod.html",
    playChannel: "{{pathPage}}/playControl/channel.html",
    playBaseChannel: "{{pathPage}}/playControl/baseChannel.html?channelNum= {{channelNum}}",
    playActiveChannel: "{{pathPage}}/playControl/activitiesChannel.html?channelNum= {{channelNum}}",
    playFourScreen: "{{pathPage}}/playControl/fourScreen.html",
    playVod: "{{pathPage}}/playControl/vod.html",
    playVodList: "{{pathPage}}/playControl/vodList.html",
    playSeries: "{{pathPage}}/playControl/series.html",
    playXilieju: "{{pathPage}}/playControl/xilieju.html",
    search: "{{pathPage}}/search/",
    voiceSearch: "{{pathPage}}/voiceSearch/",
    recent: "{{pathPage}}/playHistory/?type=PH&currentMenu=qbls",
    email: "{{pathPage}}/email/list/?type=EMAIL&currentMenu=qbyj",
    phoneBind: "{{pathPage}}/phoneBind/?type=PhoneBind&currentMenu=ph",
    userSystem: "{{pathPage}}/userSystem/home/",
    old: "{{pathPage}}/voiceSearch/",
    favv: "{{pathPage}}/favorite/?type=FAV&currentMenu=dbjm",
    favc: "{{pathPage}}/favorite/?type=FAV&currentMenu=zbpd",
    reserve: "{{pathPage}}/liveNote/?type=LN&currentMenu=qbls",
    orderSfb: "{{pathPage}}/myOrder/?type=MO&currentMenu=sfb",
    orderDp: "{{pathPage}}/myOrder/?type=MO&currentMenu=dp",
    orderkq: "{{pathPage}}/myOrder/?type=MO&currentMenu=kq",
    couponNouse: "{{pathPage}}/myCoupon/?type=MC&currentMenu=nouse",
    couponUsed: "{{pathPage}}/myCoupon/?type=MC&currentMenu=used",
    couponExpire: "{{pathPage}}/myCoupon/?type=MC&currentMenu=expire",
    nineScreen: "{{pathPage}}/nineScreen/",
    multiview: "{{pathPage}}/fourScreen/",
    f1: "{{pathPage}}/playControl/channel.html",
    f2: "{{pathPage}}/channelList/",
    f3: $.urls.home + "?type=f3",
    f4: $.urls.home + "?type=f4"
});

$(top.startPage);

$(function () {
    function removeShake(e) {
        if (e.animationName === "public_shake") {
            var el = e.target;
            $(el).removeClass("public_shake");
        }
    }
    document.addEventListener("webkitAnimationEnd", removeShake);
});

$.pTool.add("g_sys_num", function () {
    var key = "g_sys_num";
    var NUM = {
        max: 3,
        nums: [],
        delay: 3e3,
        press: function (num) {
            if (this.nums.length >= this.max) {
                this.nums = [];
            }
            this.nums.push(num);
            this.timer.begin();
            this.toast({msg: this.nums.join("")});
        },
        showMsg: function (num) {
            this.toast({msg: num, delay: 3e3});
        },
        init: function () {
            this.timer = new $.Timer(function () {
                var channelNum = + this.nums.join("");
                var channelInfo = $.getHelper("data:channel").channelMap[channelNum];
                if (channelInfo) {
                    var channelId = channelInfo.channelId;
                    channelInfo = null;
                    this.nums = [];
                    $.playLiveOrRec({channelId: channelId});
                } else {
                    this.nums.length = this.max;
                    this.toast({
                        msg: "无此频道" + channelNum,
                        delay: this.delay
                    });
                }
            }.bind(this), this.delay);
            this.toast = new $.Toast({
                delay: this.delay,
                create: function () {
                    var _dom = $("<div class=sys_num><div class=sys_num_msg></div></div>");
                    NUM.dom = _dom;
                    return _dom;
                },
                setMsg: function (msg, el) {
                    var $el = $(".sys_num_msg", el);
                    if (msg.length > this.max) {} else {} $el.html(msg);
                }.bind(this)
            });
            return this;
        }
    };
    NUM.init();
    return {
        key: key,
        show: function (num) {
            NUM.showMsg(num);
        },
        hide: function () {
            NUM.toast({delay: 0});
        },
        press: function (num) {
            NUM.press(num);
        }
    };
}());

$.pTool.add("g_sys_fn", function () {
    return {
        key: "g_sys_fn",
        press: function (name) {
            var url = $.urls[name];
            if (top.$.linnEdition !== "standardEdition" && (name == "f3" || name == "f4")) {
                return;
            }
            if (url) {
                $.savePageInfoRedefine();
                $.gotoDetail(url, true);
            }
        }
    };
}());

$.pTool.add("g_sys_volume", function () {
    var key = "g_sys_volume",
        enable = false,
        mp,
        notMpInstance,
        autoHide,
        step = 5,
        $panel,
        $num,
        $mute,
        $p;

    function initDom() {
        if (! $panel) {
            $panel = $('<div class="sys_volume hide"><div class="proWrap"><div class="progress"></div></div><div class="num"></div></div>');
            $mute = $('<div class="sys_volume_mute hide"></div>');
            $num = $(".num", $panel);
            $p = $(".progress", $panel);
            $(function () {
                $panel.appendTo(document.body);
                $mute.appendTo(document.body);
            });
            autoHide = $.AutoHide({
                dom: $panel,
                delay: 6e3,
                beforeShow: function () {
                    $.pTool.active(key);
                },
                afterHide: function () {
                    $.pTool.deactive(key);
                }
            });
        }
    }

    function pannelVisible(show) {
        if (show) {
            autoHide.show();
        } else {
            autoHide.hide();
        }
    }

    function setUsability(val) {
        enable = val;
        if (mp) {
            if (enable) {
                var volume = mp.getVolume();
                var currMute = mp.getMuteFlag() || ! volume;
                if (currMute) {
                    $mute.show();
                }
            } else {
                $panel.hide();
                $mute.hide();
            }
        }
    }

    function updateState(volume, mute) {
        setProgress(volume);
        setMute(mute || ! volume);
        if (notMpInstance) {
            $.MP.cache.volume.mute = mute || ! volume;
            $.MP.cache.volume.value = volume;
        }
    }

    function setProgress(volume) {
        $num.html(volume);
        $p.css({
            width: volume + "%"
        });
    }

    function setMute(mute) {
        if (mute) {
            $panel.addClass("mute");
            $mute.show();
        } else {
            $panel.removeClass("mute");
            $mute.hide();
        }
    }

    function exec(v) {
        if (! enable) 
            return;
        
        var volume = mp.getVolume();
        var mute = mp.getMuteFlag();
        var reset = false;
        var vadd = v > 0;
        var vminus = v < 0;
        var canAdd = vadd && volume < 100;
        var canMinus = vminus && volume > 0;
        if (mute) {
            if (vminus && ! canMinus) {
                return;
            }
            canMinus = canAdd = false;
            reset = true;
            volume = Math.max(volume, step);
        }
        if (canMinus || canAdd) {
            reset = true;
            var tmp = volume + step * v;
            if (vadd) {
                volume = Math.min(tmp, 100);
            }
            if (vminus) {
                volume = Math.max(tmp, 0);
            }
        }
        if (reset) {
            mp.setVolume(volume);
            mp.setMuteFlag(! volume);
            updateState(volume, ! volume);
        }
        pannelVisible(volume);
        return true;
    }

    function toggleMute(mute) {
        if (! enable) 
            return;
        
        var volume,
            currMute;
        if (mute === 1) {
            currMute = false;
        } else {
            volume = mp.getVolume();
            if (mute === 2) {
                currMute = true;
            } else {
                currMute = mp.getMuteFlag() || ! volume;
            }
        }
        var toMute = ! currMute;
        mp.setMuteFlag(toMute);
        if (currMute && ! volume) {
            volume = Math.max(volume, step);
            mp.setVolume(volume);
        }
        updateState(volume, toMute);
        if (toMute) {
            pannelVisible(false);
        }
        return true;
    }

    function setVolume(volume, x) {
        if (! enable) 
            return;
        
        volume = Math.round(volume);
        if (x) {
            if (!(volume >= 0 && volume <= 100)) {
                volume = step;
            }
            volume = mp.getVolume() + volume * x;
        }
        volume = Math.min(Math.max(volume, 0), 100);
        mp.setVolume(volume);
        mp.setMuteFlag(! volume);
        updateState(volume, ! volume);
        pannelVisible(volume);
        return true;
    }
    return {
        key: key,
        type: "weak",
        press: function (name) {
            switch (mp && name) {
                case "v+":
                    {
                        exec(1);
                        break;
                    }

                case "v-":
                    {
                        exec(-1);
                        break;
                    }

                case "vm":
                    {
                        toggleMute();
                        break;
                    }

                case "vt":
                    {
                        break;
                    }
            }
        },
        init: function (player) {
            enable = true;
            mp = player;
            var volume;
            var currMute;
            notMpInstance = !(mp instanceof $.MP);
            if (notMpInstance) {
                volume = $.MP.cache.volume.value;
                currMute = $.MP.cache.volume.mute || ! volume;
                if (currMute) {
                    mp.setVolume(volume);
                    mp.setMuteFlag(currMute);
                } else {
                    mp.setMuteFlag(currMute);
                    mp.setVolume(volume);
                }
            } else {
                volume = mp.getVolume();
                currMute = mp.getMuteFlag();
            } initDom();
            updateState(volume, currMute);
        },
        setUsability: setUsability,
        setMute: function (toMute) {
            return toggleMute(!! toMute ? 1 : 2);
        },
        setVolume: setVolume,
        keysMap: {
            KEY_VOLUME_UP: function () {
                return exec(1);
            },
            KEY_VOLUME_DOWN: function () {
                return exec(-1);
            },
            KEY_MUTE: function () {
                return toggleMute();
            },
            KEY_RETURN: function () {
                pannelVisible(false);
                return true;
            },
            GA: function (keyName) {
                pannelVisible(false);
                return $.KB.respond(keyName);
            }
        },
        deactive: function () {
            pannelVisible(false);
        }
    };
}());

(function () {
    var playingChannelId;
    var channelId;
    var replaceFn;
    var currKey;
    var key = "g_sys_reserve";
    var key2 = "g_sys_replace";
    var $panel;

    function pressLeft() {
        $.focusTo({el: $panel.find(".left")});
        pannelVisible(true);
        return true;
    }

    function pressRight() {
        $.focusTo({el: $panel.find(".right")});
        pannelVisible(true);
        return true;
    }

    function pannelVisible(show) {
        if (show) {
            $panel.show();
        } else {
            $panel.hide();
            $.pTool.deactive(currKey);
        }
    }

    function pressOk() {
        if ($(".focusBorder").hasClass("left")) {
            $.playLiveOrRec({channelId: channelId});
        }
        pannelVisible(false);
        return true;
    }

    function pressOk2() {
        if ($(".focusBorder", $panel).hasClass("left")) {
            replaceFn();
        }
        pannelVisible(false);
        return true;
    }

    function pressReturn() {
        pannelVisible(false);
        return true;
    }

    function pressAll(key, name) {
        return "FORBIDDEN";
    }
    var keysMap1 = {
        KEY_LEFT: pressLeft,
        KEY_RIGHT: pressRight,
        KEY_OK: pressOk,
        KEY_RETURN: pressReturn,
        GA1: pressAll
    };
    var keysMap2 = {
        KEY_LEFT: pressLeft,
        KEY_RIGHT: pressRight,
        KEY_OK: pressOk2,
        KEY_RETURN: pressReturn,
        GA1: pressAll
    };
    var plugin = {
        init: function () {
            if (! $panel) {
                $panel = $('<div class="sys_reserve"><div class="title"></div><div class="programWrap"><div class="program"></div></div><div class="hint">即将开始播放，请注意观看。</div><div class="left dft"></div><div class="right dft"></div></div>');
                $panel.appendTo("body");
            }
        },
        active: function () {
            $.pTool.active(this.key);
            currKey = this.key;
            pannelVisible(true);
        },
        show: function (program, channelIdOrReplaceFn) {
            var inPlayControl = /(playControl\/(channel|series|tvod|vod|vodList|xilieju))/.test(location.href);
            var inChannelList = /channelList/.test(location.href);
            var isReplace = this.key === key2;
            if (!(inPlayControl || inChannelList && isReplace)) {
                return;
            }
            if (! isReplace && playingChannelId === channelIdOrReplaceFn) {
                return;
            }
            this.init();
            this.active();
            if (isReplace) {
                $panel.addClass("replace");
                $panel.find(".title").html("当前时间您已预约");
                $panel.find(".left").html("替换");
                $panel.find(".right").html("取消");
                replaceFn = channelIdOrReplaceFn;
            } else {
                channelId = channelIdOrReplaceFn;
                if ($.isVipChan(channelId)) {
                    $panel.addClass("vip");
                } else {
                    $panel.removeClass("vip");
                } $panel.removeClass("replace");
                $panel.find(".title").html("您预约的节目");
                $panel.find(".left").html("立即收看");
                $panel.find(".right").html("返回");
            } $panel.find(".program").html($.substringElLength(program, $panel.find(".program").css("font-size"), $panel.css("min-width")).last);
            $.focusTo({el: $panel.find(".left")});
            pannelVisible(true);
        },
        setChannelId: function (id) {
            playingChannelId = id;
        },
        deactive: function () {
            pannelVisible(false);
            $.pTool.deactive(this.key);
        },
        cover: function () {},
        uncover: function () {},
        destroy: function () {}
    };
    var plugin1 = $.UTIL.merge({
        key: key,
        keysMap: keysMap1
    }, plugin);
    $.pTool.add(key, plugin1);
    var plugin2 = $.UTIL.merge({
        key: key2,
        keysMap: keysMap2
    }, plugin);
    $.pTool.add(key2, plugin2);
    plugin = null;
})();
try {
    if (window.contentUrl && window.subjectId && window.subjectName) {
        $('<meta name="page-view-size" content="1280*720">').appendTo("head");
        $($.Tps('<link rel="stylesheet" href="%s%s">', $.getVariable("EPG:pathRes"), "/css/public.css")).appendTo("head");
    }
} catch (e) {}$.initPage = function (pageType) {
    $.VS = {};
    $.VS.zt = $.getConstant = function (key) {};
    $.keyPressSettiing = function (opt) {
        $.keyTool.setDftRes({
            KEY_OK: function () {
                if (window.contentUrl) {
                    FOCUS_BACKUP = indexOfFocus(PAGE_INFO, ACTIVE_OBJECT.key);
                    $.saveGlobalData("subjectInfoBackUp" + subjectId, FOCUS_BACKUP);
                    var obj = contentUrl[FOCUS_BACKUP];
                    if (obj) {
                        var type = obj.type;
                        var contentId = obj.id;
                        var categoryId = window.subjectId;
                        var url = obj.url;
                        var channelNum = obj.channelNumber;
                        var startTime = obj.TvodStartTime;
                        var endTime = obj.TvodEndTime;
                        if (type == "3") {
                            type = "7";
                            if (contentUrl[FOCUS_BACKUP].status == "1") {} else {
                                $.forward(ACTIVE_OBJECT.pressOk);
                            }
                        } else if (type == "7") {
                            type = "3";
                        }
                        $.gotoDetail({
                            contentType: type,
                            categoryId: categoryId,
                            contentId: contentId,
                            url: url,
                            channelNum: channelNum,
                            startTime: startTime,
                            endTime: endTime,
                            ztCategoryId: categoryId
                        });
                    }
                }
            }
        });
    };
    $.showFocusBorder = function () {
        $.focusTo("#" + ACTIVE_OBJECT.key);
        $("#divYellowBorder").css("visibility", "visible");
    };
};
// 在屏幕上打log，用于不支持alert confirm的情况
function _test(msg) {
    if (typeof msg == 'object') {
        msg = JSON.stringify(msg, function (key, val) {
            if (typeof val === 'function') {
                return val + '';
            }
            return val;
        })
    }
    var test_log = document.getElementById('testDiv');
    if (test_log) {
        var testText = test_log.innerHTML,
            testContents = testText.split('<br>');
        if (testContents.length < 15) {
            testContents.push(msg);
        } else {
            testContents.shift();
            testContents.push(msg);
        }
        var testResult = testContents.join('<br>');
        test_log.innerHTML = testResult;
    } else {
        test_log = document.createElement('div');
        test_log.setAttribute('id', 'testDiv');
        test_log.style.width = '1890px';
        test_log.style.color = 'yellow';
        test_log.style.wordWrap = 'break-word';
        test_log.style.wordBreak = 'break-all';
        test_log.style.fontSize = '30px';
        test_log.style.position = 'absolute';
        test_log.style.top = '10px';
        test_log.style.left = '10px';
        test_log.style.padding = '3px';
        test_log.style.border = 'solid 1px #ff0';
        test_log.style.zIndex = '999';
        test_log.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
        document.body.appendChild(test_log);
        test_log.innerHTML = msg;
    }
}
