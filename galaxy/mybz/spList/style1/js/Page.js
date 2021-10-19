var pageName = "listOne";

var fd = null;

var ap = null;

var $reCa = null;

var pageInfo = $.initPageInfo(pageName, [ "firstLineIndex", "focusIndex" ], {
    firstLineIndex: 0,
    focusIndex: 0
});

var cfg = {
    id: $.page.id,
    firstLineIndex: pageInfo.firstLineIndex,
    focusIndex: pageInfo.focusIndex,
    showLine: 2,
    columnSize: 3,
    total: 0,
    totalLine: 0,
    lineHeight: 408
};

function request(id,success,error){
	$.s.guidance.get(
		{
			id: id
		}, {
			success: success,
            error: error
		}
	);
}

function load() {
	$.initPage();
	request($.page.bgId,function(res){
		if (res && res.length) {
			var src = $.getPic(res[0].pics, [0]);
			$("body").css('background','url("'+src+'") no-repeat');
		};
		init();
	},function(){
		init();
	});
}

function init() {
    render();
}

function unload() {
    $.savePageInfo(pageName, {
        focusIndex: cfg.focusIndex,
        firstLineIndex: cfg.firstLineIndex
    });
}

function render() {
    fd = initFd();
    fd.preload(cfg.firstLineIndex * cfg.columnSize, (cfg.firstLineIndex + cfg.showLine + 1) * cfg.columnSize, fdPreload.bind(null, cfg.id), preLoadError.bind(null, cfg.id));
}

function fdPreload(id, ds, begin, end, total) {
    if (id && id !== cfg.id) {
        return;
    }
    cfg.total = total;
    cfg.data = {};
    if (!cfg.total) {
        preLoadError();
        return;
    }
    ap = initAP();
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
}

function getNowModule() {
    return {
        columnSize: 3,
        showLine: 2,
		blockSize: 999,
		pre: "list_item",
        hasProgress: true,
        render: render,
        renderHtml: function(data, begin) {
            var src = "", el = "", title = "", className = "", html = "";
            for (var i = 0; i < data.length; i++) {
                className = "poster-name autoText";
                src = $.getPic(data[i].pics, [ 101 ]);
				el = '<div class="poster noContent">' + renderEpisode(data[i]) + '<img src="' + src + '"></div>';
                title = data[i].contentName;
                html += '<div class="list_item" id="list_item' + (begin + i) + '">' + el + '<div class="' + className + '">' + title + "</div></div>";
            }
            return html;
        },
        active: function() {
            $.pTool.active("listFocus");
        },
        deactive: function() {}
    };
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

var pageList = function() {
    var _left = function() {
        if (cfg.focusIndex % cfg.columnSize == 0) {
            return;
        } else {
            cfg.focusIndex--;
            listFocus(cfg.focusIndex);
        }
    };
    var _right = function() {
        if ((cfg.focusIndex + 1) % cfg.columnSize != 0 && cfg.focusIndex + 1 != cfg.total) {
            cfg.focusIndex++;
            listFocus(cfg.focusIndex);
        }
    };
    var _up = function() {
        if (cfg.focusIndex < cfg.columnSize) {
            return;
        }
        if (cfg.focusIndex < cfg.firstLineIndex * cfg.columnSize + cfg.columnSize) {
            ap.dragDown();
        } else {
            cfg.focusIndex -= cfg.columnSize;
        }
        $("#pageTotalRow").html(Math.floor(cfg.focusIndex / cfg.columnSize) + 1 + "/" + cfg.totalLine + "行");
        listFocus(cfg.focusIndex);
    };
    var _down = function() {
        if (Math.floor(cfg.focusIndex / cfg.columnSize) === Math.ceil(cfg.total / cfg.columnSize) - 1) {
            return;
        }
        if (cfg.focusIndex >= (cfg.firstLineIndex + cfg.showLine - 1) * cfg.columnSize) {
            ap.dragUp();
        } else {
            if (cfg.focusIndex + cfg.columnSize < cfg.total) {
                cfg.focusIndex += cfg.columnSize;
            } else {
                if (Math.floor(cfg.focusIndex / cfg.columnSize) != Math.ceil(cfg.total / cfg.columnSize) - 1) {
                    cfg.focusIndex = cfg.total - 1;
                }
            }
        }
        $("#pageTotalRow").html(Math.floor(cfg.focusIndex / cfg.columnSize) + 1 + "/" + cfg.totalLine + "行");
        listFocus(cfg.focusIndex);
    };
    var _pgDown = function() {
        if (cfg.firstLineIndex >= Math.ceil(cfg.total / cfg.columnSize) - cfg.showLine) {
            return;
        }
        ap.dragPageUp();
        listFocus(cfg.focusIndex);
    };
    var _pgUp = function() {
        if (cfg.firstLineIndex == 0) {
            return;
        }
        ap.dragPageDown();
        listFocus(cfg.focusIndex);
    };
    var _ok = function() {
        var obj = cfg.data[cfg.focusIndex];
        obj.categoryId = cfg.id;
        $.gotoDetail(obj);
    };
    return {
        left: _left,
        right: _right,
        up: _up,
        down: _down,
        pgUp: _pgUp,
        pgDown: _pgDown,
        ok: _ok
    };
}();

function listFocus(index) {
    $.focusTo({
        el: "#list_item" + index + " .poster",
        marquee: [ "#list_item" + index + " .poster-name" ]
    });
}

$.pTool.add("listFocus", function() {
    return {
        key: "listFocus",
        keysMap: {
            KEY_LEFT: function() {
                pageList.left();
                return true;
            },
            KEY_RIGHT: function() {
                pageList.right();
                return true;
            },
            KEY_UP: function() {
                pageList.up();
                return true;
            },
            KEY_DOWN: function() {
                pageList.down();
                return true;
            },
            KEY_PAGEUP: function() {
                pageList.pgUp();
                return true;
            },
            KEY_PAGEDOWN: function() {
                pageList.pgDown();
                return true;
            },
            KEY_OK: function() {
                pageList.ok();
                return true;
            }
        },
        active: function() {
            listFocus(cfg.focusIndex);
        },
        deactive: function() {},
        cover: function() {
            return true;
        },
        uncover: function() {
            return true;
        }
    };
}());

function initFd() {
    cfg.data = {};
    var id = cfg.id;
    var m = getNowModule();
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
                        }
                    });
                    return;
                }
                onError();
            })(id, num, onLoad, onError);
        }
    });
    return fd;
}
function initAP() {
    var content = $("#content .viewEl")[0] || $("#content")[0];
    var ap = new $.AnimatePanel({
        lineHeight: cfg.lineHeight,
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
function rederData(begin, end) {
	try {
		return fd.sync(begin, end);
	} catch (err) {
		return [];
	}
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
function updateInfo(info) {
	cfg.firstLineIndex = info.firstLineIndex;
    cfg.totalLine = info.totalLine;
    cfg.total = info.total;
	if (info.turnLine) {
		cfg.focusIndex -= info.columnSize * info.turnLine;
		cfg.focusIndex = Math.max(Math.min(cfg.focusIndex, info.total - 1), 0);
	}
	var m = getNowModule();
    m.active();
	cfg.updateAfter && cfg.updateAfter(info, m.noHeader);
    $("#pageTotalRow").html(Math.floor(cfg.focusIndex / cfg.columnSize) + 1 + "/" + cfg.totalLine + "行");
}