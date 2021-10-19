var listModule = function() {
    var cfg = {
        key: "p_list",
        isActive: false,
        focusIndex: 0,
        id: ""
    };

    function ok() {
        var entrance = /^TTXB/.test($.page.type) ? "TTXB" : $.page.type;
        $.gotoDetail($.UTIL.merge(cfg.data[cfg.focusIndex], {
            categoryId: cfg.id
            // entrance: entrance
        }));
    }
    function down() {
        if (Math.floor(cfg.focusIndex / cfg.columnSize) === Math.ceil(cfg.total / cfg.columnSize) - 1) {
            var el = cfg.pre + cfg.focusIndex;
            $("#" + el).addClass("public_shake");
            return;
        }
        if (cfg.focusIndex >= (cfg.firstLineIndex + cfg.showLine - 1) * cfg.columnSize) {
            ap.dragUp();
        } else {
            if (cfg.focusIndex + cfg.columnSize < cfg.total) {
                cfg.focusIndex += cfg.columnSize;
                currentRow ++;
                $("#pageTotalRow").html(currentRow +'/'+ totolRow + '行');
            } else {
                if (Math.floor(cfg.focusIndex / cfg.columnSize) != Math.ceil(cfg.total / cfg.columnSize) - 1) {
                    cfg.focusIndex = cfg.total - 1;
                    currentRow ++;
                    $("#pageTotalRow").html(currentRow +'/'+ totolRow + '行');
                }
            }
        }
        listFocus();
    }
    function right() {
        if ((cfg.focusIndex + 1) % cfg.columnSize != 0 && cfg.focusIndex + 1 != cfg.total) {
            cfg.focusIndex++;
            listFocus();
        } else {
            var el = cfg.pre + cfg.focusIndex;
            $("#" + el).addClass("public_shake");
        }
    }
    function up() {
        if (cfg.focusIndex < cfg.columnSize) {
            $.UTIL.apply(cfg.up);
            return;
        }
        if (cfg.focusIndex < cfg.firstLineIndex * cfg.columnSize + cfg.columnSize) {
            ap.dragDown();
        } else {
            cfg.focusIndex -= cfg.columnSize;
            currentRow --;
            $("#pageTotalRow").html(currentRow +'/'+ totolRow + '行')
        }
        listFocus();
    }
    function left() {
        if (cfg.focusIndex % cfg.columnSize == 0) {
            list.focus = cfg.pre + cfg.focusIndex;
            $.UTIL.apply(cfg.left);
        } else {
            cfg.focusIndex--;
            listFocus();
        }
    }
    function pageDown() {
        if (cfg.firstLineIndex >= Math.ceil(cfg.total / cfg.columnSize) - cfg.showLine) {
            return;
        }
        ap.dragPageUp();
        listFocus();
    }
    function pageUp() {
        if (cfg.firstLineIndex == 0) {
            return;
        }
        ap.dragPageDown();
        listFocus();
    }
    function listFocus(focus) {
        var el = cfg.pre + cfg.focusIndex;
        if (focus) {
            el = focus;
        }
        $.focusTo({
            el: "#" + el,
            marquee: [ "#" + el + " .poster-name" ]
        });
        progress();
    }
    function preLoadError(id) {
        if (id && id !== cfg.id) {
            return;
        }
        (function() {
            if (cfg.firstLoad) {
                cfg.firstLoad();
                delete cfg.firstLoad;
            }
        })();
        cfg.error && cfg.error();
        progress();
    }
    var fd = null, ap = null;
    var isSp = false;
    function init(opt) {
        $.UTIL.merge(cfg, opt);
        // var entrance = /^TTXB/.test($.page.type) ? "TTXB" : $.page.type;
        // isSp = $.auth.isSp(entrance) === "S";
        var m = Module["style" + opt.style];
        initCfg(opt);
        m && m.render && m.render();
    }
    function initCfg(opt) {
        cfg.type = opt.style;
        cfg.menuType = opt.menuType;
        cfg.menuCurrent = opt.menuCurrent;
        cfg.id = opt.id;
        cfg.firstLineIndex = opt.firstLineIndex || 0;
        cfg.error = cfg.error || opt.error;
        var m = getNowModule();
        cfg.columnSize = m.columnSize;
        cfg.showLine = m.showLine;
        cfg.lineHeight = m.lineHeight;
        cfg.pre = m.pre;
        $.recodeData(PAGE_NAME, "access", cfg.id);
    }
    function resetCfg() {
        cfg.total = null;
        cfg.firstLineIndex = 0;
        cfg.focusIndex = 0;
    }
    function getNowModule() {
        return Module["style" + cfg.type];
    }
    function error() {
        $("#content #loading").hide();
        renderListAfter();
        $("#pageNum").hide();
        progress();
        cfg.error && cfg.error();
    }
    function initFd() {
        cfg.data = {};
        var id = cfg.id;
        var m = getNowModule();
        $("#loading").show();
        var fd = new $.FetchData({
            type: id,
            blockSize: m.blockSize || 100,
            jsonp: function(id, num, onLoad, onError) {
                (function(id, num, onLoad, onError) {
                    if (id && id.length === 32) {
                        if (m.isAll) {
                            delete cfg.allData;
                            $.s.category.asc({
                                id: id
                            }, {
                                success: function(res) {
                                    cfg.allData = res;
                                    onLoad({
                                        total: res.length,
                                        data: res,
                                        rangeMin: 0
                                    });
                                },
                                error: function() {
                                    onError();
                                    error();
                                }
                            });
                            return;
                        }
                        $.s.category.num({
                            id: id,
                            num: num
                        }, {
                            success: onLoad,
                            error: function() {
                                onError();
                                error();
                            }
                        });
                        return;
                    }
                    if (id && id.length === 10) {
                        $.s.guidance.get({
                            id: id
                        }, {
                            success: function(res) {
                                onLoad({
                                    total: res.length,
                                    data: res,
                                    rangeMin: 0
                                });
                            },
                            error: function() {
                                onError();
                                error();
                            }
                        });
                        return;
                    }
                    onError();
                    error();
                })(id, num, onLoad, onError);
            }
        });
        return fd;
    }
    function initAP() {
        var content = $("#content .viewEl")[0] || $("#content")[0];
        var ap = new $.AnimatePanel({
            lineHeight: cfg.lineHeight,
            shadowLine: 1,
            showLine: cfg.showLine,
            columnSize: cfg.columnSize,
            total: cfg.total,
            firstLineIndex: cfg.firstLineIndex,
            className: "listContent",
            paddingItem: '<div class="list_item"></div>',
            transition: "all .6s",
            appendTo: content,
            render: renderList,
            update: updateInfo,
            lockTime: 300
        });
        return ap;
    }
    function renderList(begin, end) {
        var data = rederData(begin, end);
        for (var i in data) {
            cfg.data[+begin + +i] = data[i];
        }
        var m = getNowModule();
        var html = m.renderHtml(data, begin);
        return html;
    }
    function rederData(begin, end) {
        try {
            return fd.sync(begin, end);
        } catch (err) {
            return [];
        }
    }
    function updateInfo(info) {
        cfg.firstLineIndex = info.firstLineIndex;
        if (info.turnLine) {
            info.turnLine == -1 &&  currentRow ++;
            info.turnLine == 1 &&  currentRow --;
            $("#pageTotalRow").html(currentRow +'/'+ totolRow + '行');
            cfg.focusIndex -= info.columnSize * info.turnLine;
            cfg.focusIndex = Math.max(Math.min(cfg.focusIndex, info.total - 1), 0);
        }
        var m = getNowModule();
        if (m.hasProgress) {
            progress();
        }
        cfg.updateAfter && cfg.updateAfter(info, m.noHeader);
    }
    function fdPreload(id, ds, begin, end, total) {
        if (id && id !== cfg.id) {
            return;
        }
        var loading = $("#content #loading");
        cfg.total = total;
        if (!total) {
            error && error();
            return;
        }
        cfg.data = {};
        loading.hide();
        ap = initAP();
        renderListAfter();
        progress();
        (function() {
            if (cfg.firstLoad) {
                cfg.firstLoad();
                delete cfg.firstLoad;
            }
        })();
    }
    function renderListAfter() {
        cfg.renderListAfter && cfg.renderListAfter();
    }
    function progress() {
        var index = cfg.focusIndex || 0;
        var progressBar = $("#content #progressBar");
        var strip = $("#content #progressBar #strip");
        if (!cfg.total || cfg.total <= cfg.showLine * cfg.columnSize) {
            progressBar.hide();
            if (!cfg.total) {
                $("#noData").show();
            } else {
                $("#noData").hide();
            }
            return;
        }
        $("#noData").hide();
        progressBar.show();
        var len = progressBar[0].clientHeight - 110;
        var everyMove = len / (Math.ceil(cfg.total / cfg.columnSize) - 1);
        var num = +index >= cfg.columnSize ? Math.floor(index / cfg.columnSize) : 0;
        strip.css("top", everyMove * num + "px");
    }
    function changeActive() {
        cfg.isActive = !cfg.isActive;
    }
    function getNowKeyMap() {
        var m = Module["style" + cfg.type];
        if (m.keysMap) {
            return m.keysMap;
        }
        return {
            down: down,
            up: up,
            left: left,
            right: right,
            pageDown: pageDown,
            pageUp: pageUp,
            ok: ok
        };
    }
    function initVl() {
        var that = this;
        var con = null;
        var first = {
            left: 599,
            top: 251,
            width: 996,
            height: 560
        };
        var second = {
            left: 378,
            top: 251,
            width: 996,
            height: 560
        };
        if ($("#content").hasClass("contentMoveR")) {
            con = first;
        } else {
            con = second;
        }
        var $video = $("#video");
        for (var i in cfg.allData) {
            if (cfg.allData[i] && cfg.allData[i].contentName) {
                cfg.allData[i]["name"] = cfg.allData[i].contentName;
            }
        }
        var vl = $.playSizeList($.UTIL.merge({
            list: cfg.allData,
            current: 0,
            multiVod: false,
            loading: function(type) {
                if (type === "url") {
                    $video.addClass("noPlayer");
                    that.vlRender && that.vlRender();
                }
            },
            onPlay: function(e) {
                $video.removeClass("playError noPlayer");
                that.playTipShow();
            },
            onEnd: function(e) {
            },
            onError: function(e) {
                $video.addClass("playError");
                return true;
            }
        }, con), cfg.id);
        return vl;
    }
    function _getListStyle() {
        return Module["style" + cfg.type];
    }
    function render() {
        fd = initFd();
        fd.preload(cfg.firstLineIndex * cfg.columnSize, (cfg.firstLineIndex + cfg.showLine + 1) * cfg.columnSize, fdPreload.bind(null, cfg.id), preLoadError.bind(null, cfg.id));
    }
    function renderEpisode(d) {
        var episodeText = "";
        var episodeArr = d.episodeStatus && /\//.test(d.episodeStatus) ? d.episodeStatus.split("/") : "";
        switch (+d.contentType) {
          case 2:
            if (episodeArr) {
                if (episodeArr[0] == episodeArr[1]) {
                    episodeText = episodeArr[0] + "集全";
                } else {
                    episodeText = "更新至" + episodeArr[0] + "集";
                }
            }
            break;

          case 3:
            if (episodeArr) {
                if (episodeArr[0] == episodeArr[1]) {
                    episodeText = episodeArr[0] + "期全";
                } else {
                    if (d.topicSceneLastOnlineTime) {
                        episodeText = "更新至" + d.topicSceneLastOnlineTime.slice(0, 8) + "期";
                    } else {
                        episodeText = "已更" + episodeArr[0] + "期";
                    }
                }
            }
            break;
        }
        var episode = episodeText ? '<div class="episode">' + episodeText + "</div>" : "";
        return episode;
    }
    var Module = {
        style1: {
            columnSize: 5,
            showLine: 2,
            lineHeight: 459,
            pre: "list_item",
            hasProgress: true,
            render: render,
            renderHtml: function(data, begin) {
                var src = "", el = "", title = "", className = "", html = "", rating = ""
                for (var i = 0; i < data.length; i++) {
                    className = "poster-name autoText";
                    src = $.getPic(data[i].pics, [ 102 ]);
                    ChargesArray = data[i].contentCharges.split(",");
                    var haveSinglepoint = ChargesArray.indexOf("1100000184") > -1 || ChargesArray.indexOf("1100000383") > -1 || ChargesArray.indexOf("1100000185") > -1 || ChargesArray.indexOf("1100000781") > -1;
                    if(menu.getIconFlag() === "vip"){
                        vip = ''
                    } else {
                        vip = ChargesArray.indexOf("1100000761") > -1 ? '<div class="MoviesVip"></div>' : ChargesArray.indexOf("1100000381") > -1 ? '<div class="childrenVip"></div>' : haveSinglepoint == true ? '<div class="SinglepointVip"></div>' : ChargesArray.indexOf("1100000181") > -1 ? '<div class="Qiyivip"></div>' : ChargesArray.indexOf("1100000241") > -1 ? '<div class="MoviesVip"></div>' : '';
                    }
                    rating = data[i].vodRatingNum && data[i].vodRatingNum !== "null" ? '<div class="rating">' + data[i].vodRatingNum + "</div>" : "";
                    el = '<div class="poster noContent">' + vip + renderEpisode(data[i]) + '<img src="' + src + '">' + rating + "</div>";
                    title = data[i].contentName;
                    html += '<div class="list_item" id="list_item' + (begin + i) + '"><div class="list_content">' + el + '<div class="' + className + '">' + title + "</div></div></div>";
                }
                return html;
            },
            active: listFocus,
            deactive: changeActive
        },
        style2: {
            columnSize: 3,
            lineHeight: 358,
            showLine: 2,
            blockSize: 999,
            pre: "list_item",
            focus: "list_item0",
            hasProgress: true,
            render: render,
            renderHtml: function(data, begin) {
                var src = "", el = "", title = "", className = "", html = "";
                for (var i = 0; i < data.length; i++) {
                    className = "poster-name autoText";
                    src = $.getPic(data[i].pics, [ 101 ]);
                    el = '<div class="poster noContent">' + renderEpisode(data[i]) + '<img src="' + src + '"></div>';
                    title = data[i].contentName;
                    html += '<div class="list_item" id="list_item' + (begin + i) + '"><div class="list_content">' + el + '<div class="' + className + '">' + title + "</div></div></div>";
                }
                return html;
            },
            active: listFocus,
            deactive: changeActive
        },
        style3: {
            columnSize: 1,
            showLine: 5,
            pre: "list_item",
            focus: "video",
            dir: "left",
            blockSize: 500,
            lineHeight: 156,
            noHeader: true,
            hasProgress: true,
            isMove: true,
            isAll: true,
            renderHtml: function(data, begin) {
                var title = "", html = "", className, curName = "";
                for (var i = 0; i < data.length; i++) {
                    curName = "";
                    if (this.vl && this.vl.currentIndex() === begin + i) {
                        curName = " current";
                    }
                    className = "poster-name-style3";
                    title = $.substringElLength(data[i].contentName, "30px", "1100px").last;
                    html += '<div class="list_item' + curName + '" id="list_item' + (begin + i) + '"><div class="list_content">' + '<div class="' + className + '">' + title + "</div></div></div>";
                }
                return html;
            },
            active: function() {
                if (this.dir === "left" || this.dir === "up_v") {
                    listFocus("video");
                    this.playTipShow();
                } else {
                    listFocus();
                }
            },
            vlRender: function(empty) {
                if (!this.vl) {
                    return;
                }
                $("#content #video .title").html("");
                if (empty) {
                    return;
                }
                $.initVolume(this.vl.mp);
                var title = this.vl.current().contentName;
                if (title) {
                    $("#content #video .title").html(title);
                    if ($(".title.autoText").length) {
                        var marquee = new $.Marquee();
                        marquee({
                            el: $(".title.autoText")[0],
                            speed: 70
                        });
                    }
                }
                var index = this.vl.currentIndex();
                if (this.lastIndex || this.lastIndex == 0) {
                    $("#" + this.pre + this.lastIndex).removeClass("current");
                }
                if (index == cfg.firstLineIndex + this.showLine && !/#list_item/.test($.activeObj.el)) {
                    ap.dragUp();
                }
                this.lastIndex = index;
                $("#" + this.pre + index).addClass("current");
            },
            render: function() {
                if (!$("#video").length || !$("#style3List").length) {
                    var v = $('<div id="video" class="noPlayer"><div class="title autoText"></div> <div class="playTip hide"></div></div>');
                    var list = $('<div id="style3List"><div class="listShadow"></div></div>');
                    v.appendTo($("#content"));
                    list.appendTo($("#content"));
                }
                fd = initFd();
                var that = this;
                fd.preload(cfg.firstLineIndex * cfg.columnSize, (cfg.firstLineIndex + cfg.showLine + 1) * cfg.columnSize, function(id, ds, begin, end, total) {
                    if (id && id !== cfg.id) {
                        return;
                    }
                    var loading = $("#content #loading");
                    cfg.total = total;
                    cfg.data = {};
                    loading.hide();
                    ap = initAP(cfg.total);
                    progress();
                    renderListAfter();
                    that.vl = initVl.call(that);
                    that.vl.play();
                    (function() {
                        if (cfg.firstLoad) {
                            cfg.firstLoad();
                            delete cfg.firstLoad;
                        }
                    })();
                }.bind(null, cfg.id), preLoadError.bind(null, cfg.id));
            },
            playTipShow: function(hide) {
                clearTimeout(this.tiemr);
                if (hide) {
                    $(".playTip").hide();
                    return;
                }
                this.tiemr = setTimeout(function() {
                    $(".playTip").hide();
                }, 5e3);
                $(".playTip").show();
            },
            destroy: function() {
                this.vlRender(1);
                $.setVolumeUsability();
                this.playTipShow(1);
                this.vl && $.UTIL.apply(this.vl.release, null, this.vl);
                delete this.vl;
                $("#video").addClass("noPlayer");
            },
            move: function() {
                if (!this.vl) {
                    return;
                }
                $("#video").addClass("noPlayer");
            },
            deactive: function() {
                changeActive();
                var leaveFocus = $.activeObj.el;
                if (leaveFocus === "#video") {
                    this.dir = "left";
                    this.playTipShow(1);
                    return;
                }
                this.dir = "up";
            },
            keysMap: {
                getFocus: function() {
                    return $.activeObj.el;
                },
                down: function() {
                    if (this.getFocus() === "#video") {
                        return;
                    }
                    down();
                },
                up: function() {
                    if (this.getFocus() === "#video") {
                        Module.style3.dir = "up_v";
                        cfg.up();
                        return;
                    }
                    if (cfg.focusIndex === 0) {
                        Module.style3.dir = "up";
                        cfg.up();
                        return;
                    }
                    up();
                },
                left: function() {
                    if (this.getFocus() === "#video") {
                        Module.style3.dir = "left";
                        cfg.left && cfg.left();
                        return;
                    }
                    $.focusTo({
                        el: "#video"
                    });
                    Module.style3.playTipShow();
                    return;
                },
                right: function() {
                    var flag = this.getFocus() === "#video";
                    if (flag) {
                        var index = Module.style3.vl.currentIndex();
                        if (index >= cfg.firstLineIndex && index < cfg.firstLineIndex + Module.style3.showLine) {
                            cfg.focusIndex = index;
                        }
                        listFocus();
                        Module.style3.playTipShow(1);
                    }
                },
                pageDown: function() {
                    var flag = this.getFocus() === "#video";
                    if (flag) {
                        return;
                    }
                    pageDown();
                },
                pageUp: function() {
                    var flag = this.getFocus() === "#video";
                    if (flag) {
                        return;
                    }
                    pageUp();
                },
                ok: function() {
                    var that = getNowModule();
                    if (that.vl.currentIndex() === cfg.focusIndex || $.activeObj.el === "#video") {
                        if ($("#video").hasClass("noPlayer")) {
                            return;
                        }
                        that.vl.enter({
                            multiVod: true
                        });
                        return;
                    }
                    that.vl.playBy({
                        val: cfg.focusIndex
                    });
                }
            }
        },
        style4:{
            columnSize: 4,
            showLine: 3,
            lineHeight: 320,
            pre: "list_item",
            hasProgress: true,
            render: render,
            renderHtml: function(data, begin) {
                var src = "", el = "", title = "", className = "", html = ""
                for (var i = 0; i < data.length; i++) {
                    className = "poster-name autoText";
                    src = $.getPic(data[i].pics, [ 10 ]);
                    ChargesArray = data[i].contentCharges.split(",");
                    el = '<div class="poster noContent"><img src="' + src + '"></div>';
                    title = data[i].contentName;
                    html += '<div class="list_item" id="list_item' + (begin + i) + '"><div class="list_content">' + el + '<div class="' + className + '">' + title + "</div></div></div>";
                }
                return html;
            },
            active: listFocus,
            deactive: changeActive
        }
    };
    return {
        getListStyle: _getListStyle,
        init: init,
        getCon: function() {
            return cfg;
        },
        initCon: initCfg,
        resetCon: resetCfg,
        getKeysMap: getNowKeyMap,
        changeActive: changeActive,
    };
}();