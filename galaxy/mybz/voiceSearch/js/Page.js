var PAGENAME = "voiceSearch";

var CATEGORYID = "999999";

var $error = null;

var name = $.page.name && decodeURI($.page.name) || "", actor = $.page.actor && decodeURI($.page.actor) || "", director = $.page.director && decodeURI($.page.director) || "", tag = $.page.genreName && decodeURI($.page.genreName) || "";

var pageInfo = $.initPageInfo(PAGENAME, [ "focusIndex", "firstLineIndex" ], {
    focusIndex: 0,
    firstLineIndex: 0
});

var error = function() {
    var arr = [ name, actor, director, tag ];
    var out = [];
    for (var i in arr) {
        if (arr[i]) {
            out.push(arr[i]);
        }
    }
    title.init(1, out.join(" "));
    if (!$error) {
        $error = $('<div class="error"></div>').appendTo("body");
    }
};

function initBackGround() {
    $("body").attr("style", 'background:url("images/bg.jpg") no-repeat');
}

function Aplist(opt) {
    var that = this;
    this.firstLineIndex = opt.firstLineIndex;
    this.focusIndex = opt.focusIndex;
    this.columnSize = opt.columnSize;
    this.total = opt.total;
    this.showLine = opt.showLine;
    this.updateInfo = function(info) {
        that.firstLineIndex = info.firstLineIndex;
        if (info.turnLine) {
            that.focusIndex -= info.columnSize * info.turnLine;
            that.focusIndex = Math.max(Math.min(that.focusIndex, info.total - 1), 0);
        }
    };
    this.pre = opt.pre;
    var apCfg = {
        lineHeight: opt.lineHeight,
        shadowLine: opt.shadowLine,
        showLine: opt.showLine,
        columnSize: opt.columnSize,
        total: opt.total,
        firstLineIndex: that.firstLineIndex,
        className: opt.ap.className,
        paddingItem: opt.ap.paddingItem,
        transition: "all .6s",
        appendTo: opt.ap.appendTo || $("body"),
        render: opt.ap.render,
        update: opt.ap.updateInfo || that.updateInfo
    };
    this.ap = new $.AnimatePanel(apCfg);
    if (opt.fd) {
        this.fd = new $.FetchData(opt.fd);
    }
}

Aplist.prototype = {
    constructor: Aplist,
    focusTo: function() {
        $.focusTo({
            el: this.pre + this.focusIndex,
            marquee: [ this.pre + this.focusIndex + " .autoText" ]
        });
    },
    updateInfo: function(info) {
        this.firstLineIndex = this.firstLineIndex;
        if (info.turnLine) {
            this.focusIndex -= info.columnSize * info.turnLine;
            this.focusIndex = Math.max(Math.min(this.focusIndex, info.total - 1), 0);
        }
    },
    down: function() {
        if (Math.floor(this.focusIndex / this.columnSize) === Math.ceil(this.total / this.columnSize) - 1) {
            $(this.pre + this.focusIndex).addClass("public_shake");
            return true;
        }
        if (this.focusIndex >= (this.firstLineIndex + this.showLine - 1) * this.columnSize) {
            this.ap.dragUp();
        } else {
            if (this.focusIndex + this.columnSize < this.total) {
                this.focusIndex += this.columnSize;
            } else {
                if (Math.floor(this.focusIndex / this.columnSize) != Math.ceil(this.total / this.columnSize) - 1) {
                    this.focusIndex = this.total - 1;
                }
            }
        }
        this.focusTo();
        return true;
    },
    left: function() {
        if (this.focusIndex % this.columnSize === 0) {
            $(this.pre + this.focusIndex).addClass("public_shake");
            return true;
        }
        this.focusIndex--;
        this.focusTo();
        return true;
    },
    up: function() {
        if (this.focusIndex < this.columnSize) {
            return true;
        }
        if (this.focusIndex < (this.firstLineIndex + 1) * this.columnSize) {
            this.ap.dragDown();
        } else {
            this.focusIndex -= this.columnSize;
        }
        this.focusTo();
        return true;
    },
    right: function() {
        if ((this.focusIndex + 1) % this.columnSize != 0 && this.focusIndex + 1 !== this.total) {
            this.focusIndex++;
            this.focusTo();
            return true;
        }
        $(this.pre + this.focusIndex).addClass("public_shake");
        return true;
    },
    pageDown: function() {
        if (this.firstLineIndex >= Math.ceil(this.total / this.columnSize) - this.showLine) {
            return true;
        }
        this.ap.dragPageUp();
        this.focusTo();
        return true;
    },
    pageUp: function() {
        if (this.firstLineIndex == 0) {
            return true;
        }
        this.ap.dragPageDown();
        this.focusTo();
        return true;
    }
};

function initFd(opt, success, error) {
    return new $.FetchData({
        type: opt.name,
        blockSize: 100,
        jsonp: function(type, num, onLoad, onError, isPreload) {
            (function(type, num, onLoad, onError, isPreload) {
                var sParma = {
                    name: opt.name || "",
                    actor: opt.actor || "",
                    tag: opt.tag || "",
                    director: opt.director || "",
                    pageNum: num,
                    pageSize: 100
                };
                $.s.search.getByContent(sParma, {
                    success: function(res) {
                        $.UTIL.apply(success);
                        $.UTIL.apply(onLoad, [ {
                            total: res.data.total,
                            data: res.data.list,
                            rangeMin: num * 100
                        } ]);
                    },
                    error: function() {
                        error();
                        onError();
                    }
                });
            })(type, num, onLoad, onError, isPreload);
        }
    });
}

function isVip() {
    if (arguments[0].vipFlag === "0") {
        return false;
    }
    return true;
}

var title = {
    getVal: function(num, key) {
        if (typeof num === "undefined") {
            num = "";
        } else {
            num = num > 0 ? "" : "<span>0</span>条";
        }
        return "为您找到" + num + "关于“" + key + "”相关的内容";
    },
    creat: function() {
        var $el = $(".title");
        if (!$el.length) {
            $el = $('<div class="title"></div>').appendTo("body");
        }
        return $el;
    },
    init: function(num, key) {
        this.creat().html(this.getVal(num, key));
    }
};

var noneVal = function() {
    var $recommend = null;
    var data = null;
    var cfg = {};
    var total = 0, picType = [ 102, 6 ], firstLineIndex = pageInfo.firstLineIndex, focusIndex = pageInfo.focusIndex;
    var size = 36;
    var _init = function() {
        $.pTool.add("recommend", r_plug);
        if (!$recommend) {
            $recommend = $('<div class="recommend"><div class="r_title">其他推荐</div></div>').appendTo("body");
        }
        if (!data) {
            $.s.search.topN({
                size: size
            }, {
                success: _success,
                error: error
            });
            return;
        }
        $.pTool.active("recommend");
    };
    var _success = function(res) {
        if (res.code == 0) {
            data = res.data.list;
            total = data.length;
            cfg = new Aplist({
                pre: "#r_item",
                focusIndex: focusIndex,
                columnSize: 6,
                lineHeight: 430,
                shadowLine: 1,
                showLine: 2,
                total: total,
                firstLineIndex: firstLineIndex,
                ap: {
                    className: "container",
                    paddingItem: '<div class="r_item"></div>',
                    transition: "all .6s",
                    appendTo: $recommend[0],
                    render: _renderList
                }
            });
            ap = cfg.ap || null;
            $.pTool.active("recommend");
            return;
        }
        data = [];
    };
    var _renderList = function(begin, end) {
        var html = "", src = "", title = "", vip = "",haveSinglepoint = false;
        for (var i = begin; i < end; i++) {
            src = $.getPic(data[i].pics, picType, {
                picType: "type",
                picPath: "uri"
            });
            title = data[i].name;
            haveSinglepoint = data[i].chargeIds.indexOf("1100000184") > -1 || data[i].chargeIds.indexOf("1100000383") > -1 || data[i].chargeIds.indexOf("1100000185") > -1 || data[i].chargeIds.indexOf("1100000781") > -1;
            vip = data[i].chargeIds.indexOf("1100000761") > -1 ? '<div class="MoviesVip"></div>' : data[i].chargeIds.indexOf("1100000381") > -1 ? '<div class="childrenVip"></div>' : haveSinglepoint == true ? '<div class="SinglepointVip"></div>' : data[i].chargeIds.indexOf("1100000181") > -1 ? '<div class="Qiyivip"></div>' : data[i].chargeIds.indexOf("1100000241") > -1 ? '<div class="MoviesVip"></div>' : ''      
            
            //vip = isVip(data[i]) ? '<div class="vip"></div>' : "";
            html += '<div class="r_item" id="r_item' + i + '"><div class="r_content"><div class="poster noPic"><img src="' + src + '">' + vip + '</div><div class="poster_name autoText">' + title + "</div></div></div>";
        }
        return html;
    };
    var r_plug = {
        key: "recommend",
        keysMap: {
            KEY_DOWN: function() {
                return cfg.down.call(cfg);
            },
            KEY_LEFT: function() {
                return cfg.left.call(cfg);
            },
            KEY_UP: function() {
                return cfg.up.call(cfg);
            },
            KEY_RIGHT: function() {
                return cfg.right.call(cfg);
            },
            KEY_PAGEDOWN: function() {
                return cfg.pageDown.call(cfg);
            },
            KEY_PAGEUP: function() {
                return cfg.pageUp.call(cfg);
            },
            KEY_OK: function() {
                var d = data[cfg.focusIndex];
                $.savePageInfo(PAGENAME, {
                    focusIndex: cfg.focusIndex,
                    firstLineIndex: cfg.firstLineIndex
                });
                $.gotoDetail({
                    contentId: d.id,
                    contentName: d.name,
                    categoryId: CATEGORYID,
                    contentType: d.seriesFlag
                });
                return true;
            }
        },
        active: function() {
            cfg.focusTo();
            return true;
        },
        deActive: function() {
            return true;
        }
    };
    return {
        init: _init
    };
}();

var searchList = function() {
    var $pageNum = null, $searchPanel = null;
    $error = null;
    $pageNum = null;
    $searchPanel = null, $pageLine = null, $totalLine = null, $shadow = null;
    var columnSize = 6;
    var fd = null;
    var ap = null;
    var firstLineIndex = pageInfo.firstLineIndex;
    var focusIndex = pageInfo.focusIndex;
    var total = 0;
    var _initPageNum = function() {
        if (!$pageNum) {
            $pageNum = $('<div class="pageNum"><div class="pageLine"></div>/<div class="totalLine"></div>行</div>').appendTo("body");
            $pageLine = $(".pageNum .pageLine");
            $totalLine = $(".pageNum .totalLine");
        }
        $totalLine.html(Math.ceil(total / columnSize));
        _upDateNowLine();
    };
    var _upDateNowLine = function() {
        $pageLine.html(Math.floor(ap.focusIndex / columnSize) + 1);
        _showShadow();
    };
    var _showShadow = function() {
        if (!$shadow) {
            $shadow = $('<div class="shadow hide"></div>').appendTo("body");
        }
        if (Math.ceil(total / columnSize) - ap.firstLineIndex > ap.showLine) {
            $shadow.show();
        } else {
            $shadow.hide();
        }
    };
    var _init = function(cfg) {
        if (!$searchPanel) {
            $searchPanel = $('<div class="searchPanel"></div>').appendTo("body");
        }
        fd = initFd(cfg, function() {}, error);
        fd.preload(firstLineIndex, 100, function preloadCb(ds, begin, end, t) {
            total = t;
            var out = [];
            for (var i in cfg) {
                if (cfg[i]) {
                    out.push(cfg[i]);
                }
            }
            if (t == 1) {
                var d = ds[0];
                $.gotoDetail({
                    categoryId: CATEGORYID,
                    contentId: d.id,
                    contentName: d.name,
                    contentType: d.seriesFlag
                }, true);
                return;
            }
            initBackGround();
            title.init(t, out.join(" "));
            if (t == 0) {
                noneVal.init();
                return;
            }
            ap = new Aplist({
                pre: "#s_item",
                focusIndex: focusIndex,
                columnSize: 6,
                lineHeight: 430,
                shadowLine: 1,
                showLine: 2,
                total: t,
                firstLineIndex: firstLineIndex,
                ap: {
                    className: "container",
                    paddingItem: '<div class="s_item"></div>',
                    transition: "all .6s",
                    appendTo: $searchPanel[0],
                    render: _renderList
                }
            });
            _initPageNum();
            _showShadow();
            $.pTool.add("searchList", s_plug);
            $.pTool.active("searchList");
        });
    };
    var _renderList = function(begin, end) {
        var data = fd.sync(begin, end);
        var html = "", src = "", title = "", vip = "", haveSinglepoint = false;
        for (var i = 0; i < data.length; i++) {
            src = $.getPic(data[i].pics, [ 102, 6 ], {
                picType: "type",
                picPath: "uri"
            });
            title = data[i].name;
            haveSinglepoint = data[i].chargeIds.indexOf("1100000184") > -1 || data[i].chargeIds.indexOf("1100000383") > -1 || data[i].chargeIds.indexOf("1100000185") > -1 || data[i].chargeIds.indexOf("1100000781") > -1;
            vip = data[i].chargeIds.indexOf("1100000761") > -1 ? '<div class="MoviesVip"></div>' : data[i].chargeIds.indexOf("1100000381") > -1 ? '<div class="childrenVip"></div>' : haveSinglepoint == true ? '<div class="SinglepointVip"></div>' : data[i].chargeIds.indexOf("1100000181") > -1 ? '<div class="Qiyivip"></div>' : data[i].chargeIds.indexOf("1100000241") > -1 ? '<div class="MoviesVip"></div>' : ''      
            
            //vip = isVip(data[i]) ? '<div class="vip"></div>' : "";
            html += '<div class="s_item" id="s_item' + (begin + i) + '"><div class="s_content"><div class="poster noPic"><img src="' + src + '">' + vip + '</div><div class="poster_name autoText">' + title + "</div></div></div>";
        }
        return html;
    };
    var s_plug = {
        key: "searchList",
        keysMap: {
            KEY_DOWN: function() {
                ap.down.call(ap);
                _upDateNowLine();
                return true;
            },
            KEY_LEFT: function() {
                ap.left.call(ap);
                return true;
            },
            KEY_UP: function() {
                ap.up.call(ap);
                _upDateNowLine();
                return true;
            },
            KEY_RIGHT: function() {
                ap.right.call(ap);
                return true;
            },
            KEY_PAGEDOWN: function() {
                ap.pageDown.call(ap);
                _upDateNowLine();
                return true;
            },
            KEY_PAGEUP: function() {
                ap.pageUp.call(ap);
                _upDateNowLine();
                return true;
            },
            KEY_OK: function() {
                var d = fd.sync(ap.focusIndex, ap.focusIndex + 1)[0];
                $.savePageInfo(PAGENAME, {
                    focusIndex: ap.focusIndex,
                    firstLineIndex: ap.firstLineIndex
                });
                $.gotoDetail({
                    contentId: d.id,
                    contentName: d.name,
                    categoryId: CATEGORYID,
                    contentType: d.seriesFlag
                });
                return true;
            }
        },
        active: function() {
            ap.focusTo();
        },
        deActive: function() {}
    };
    return {
        init: _init
    };
}();

function load() {
    $.recodeData(PAGENAME, "access");
    searchList.init({
        name: name,
        actor: actor,
        director: director,
        tag: tag
    });
}

function unload() {}