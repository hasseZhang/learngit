var fav = function() {
    var ap = null;
    var _config = {
        editActive: false,
        pre: "fav_item",
        firstLineIndex: 0,
        columnSize: 5,
        showLine: 2,
        lineHeight: 470,
        total: 0,
        focusIndex: 0
    };
    function _initConfig(type, flag) {
        if (!flag) {
            _config.firstLineIndex = 0;
            fav.focus = null;
        }
        if (type === "dbjm") {
            $("#container").removeClass("channel");
            _config.lineHeight = 470;
            _config.showLine = 2;
            _getAll();
        }
        if (type === "zbpd") {
            $("#container").addClass("channel");
            _config.lineHeight = 206;
            _config.showLine = 4;
            chanAll();
        }
        loadShow();
        _config.type = type;
    }
    function loadShow() {
        $("#container  #noFav").hide();
        $("#listContainer #loading").show();
    }
    function loadHide() {
        $("#listContainer #loading").hide();
    }
    function clearApPanel() {
        if ($(".favContent").length) {
            $(".favContent").remove();
        }
    }
    function _initAP() {
        return new $.AnimatePanel({
            lineHeight: _config.lineHeight,
            shadowLine: 1,
            showLine: _config.showLine,
            columnSize: _config.columnSize,
            total: _config.total,
            firstLineIndex: _config.firstLineIndex,
            className: "favContent",
            paddingItem: '<div class="fav_item"></div>',
            appendTo: $("#listContainer")[0],
            render: _renderList,
            update: _updateInfo
        });
    }
    function _renderList(begin, end) {
        var data = _renderData(begin, end);
        return _renderItem(data, begin);
    }
    function _renderItem(data, begin) {
        var html = "";
        var src = "";
        var title = "";
        var num = "";
        var vip = "";
        for (var i = 0; i < data.length; i++) {
            if (_config.type == "dbjm") {
                src = $.getPic(data[i].picInfos, [ 102, 6 ], {
                    picType: "type",
                    picPath: "url"
                });
                title = data[i].name;
                var chargesIds = data[i].chargeCpInfos.map(function (item) {
                    return item.chargesId;
                })
                var haveSinglepoint = chargesIds.indexOf("1100000184") > -1 || chargesIds.indexOf("1100000383") > -1 || chargesIds.indexOf("1100000185") > -1 || chargesIds.indexOf("1100000781") > -1;
                vip = chargesIds.indexOf("1100000761") > -1 ? '<div class="MoviesVip"></div>' : chargesIds.indexOf("1100000381") > -1 ? '<div class="childrenVip"></div>' : haveSinglepoint == true ? '<div class="SinglepointVip"></div>' : chargesIds.indexOf("1100000181") > -1 ? '<div class="Qiyivip"></div>' : chargesIds.indexOf("1100000241") > -1 ? '<div class="MoviesVip"></div>'  : '';
                html += '<div id="fav_item' + (begin + i) + '" class="fav_item"><div class="fav_content"><div class="fav_poster noPic">' + vip + '<img src="' + src + '"><div class="fav_delposter"></div></div><div class="fav_delposter"></div><div class="fav_poster_name autoText">' + title + "</div></div></div></div>";
            }
            if (_config.type == "zbpd") {
                title = data[i].name;
                num = data[i].num;
                vip = $.isVipChan(num) ? '<div class="vip"></div>' : "";
                html += '<div id="fav_item' + (begin + i) + '" class="fav_item"><div class="fav_content">' + vip + '<div class="chan_num">' + num + '</div><div class="channelName">' + title + '</div><div class="fav_mask"></div></div></div>';
            }
        }
        function isVip() {
            if (arguments[0].vipFlag === "1") {
                return true;
            }
            return false;
        }
        return html;
    }
    function _updateInfo(info) {
        _config.firstLineIndex = info.firstLineIndex;
        if (info.turnLine) {
            _config.focusIndex -= info.columnSize * info.turnLine;
            _config.focusIndex = Math.max(Math.min(_config.focusIndex, info.total - 1), 0);
            favFocus();
        }
        if ($("#container.channel").length) {
            if (info.total >= 20) {
                $("#mostShow").show();
            } else {
                $("#mostShow").hide();
            }
        } else {
            if (info.total === 100 && _config.firstLineIndex + info.showLine >= info.totalLine) {
                $("#mostShow").show();
            } else {
                $("#mostShow").hide();
            }
        }
    }
    function _renderData(begin, end) {
        return _config.data.slice(begin, end);
    }
    function _getAll(cb) {
        _config.data = [];
        $("#container #listContainer #menuOption").hide();
        $.s.fav.all(null, {
            success: function(res) {
                if (_config.type === "dbjm") {
                    if (res && res.data && res.data.length) {
                        _config.data = res.data;
                        if (_config.data.length > 100) {
                            _config.data = _config.data.splice(0, 100);
                        }
                        _config.total = _config.data.length;
                        _autoShowNoFav();
                        ap = _initAP();
                        loadHide();
                    } else {
                        _config.total = 0;
                        _config.data = [];
                        _autoShowNoFav();
                        loadHide();
                    }
                    if (_config.total === 0) {
                        _config.error();
                    } else {
                        $.UTIL.apply(_config.afterLoadData);
                    }
                    progress();
                    cb && cb();
                }
            },
            error: function() {
                if (_config.type === "dbjm") {
                    _config.total = 0;
                    _config.data = [];
                    _autoShowNoFav();
                    loadHide();
                    cb && cb();
                    _config.error();
                }
            }
        });
    }
    function _renderPage(con, flag) {
        if (con.current === _config.type) {
            return;
        }
        clearApPanel();
        _initConfig(con.current, flag);
        progress();
    }
    function _init(opt) {
        _config.firstLineIndex = opt.firstLineIndex || 0;
        _config.afterLoadData = opt.afterLoadData;
        _config.focusIndex = opt.focusIndex || 0;
        _config.left = opt.left || function() {};
        fav.focus = opt.focus || "";
    }
    function chanAll(cb) {
        _config.data = [];
        $("#container #listContainer #menuOption").hide();
        $.s.chanfav.all(null, {
            success: function(res) {
                if (_config.type === "zbpd") {
                    if (res && res.data) {
                        _config.data = res.data;
                        if (_config.data.length > 20) {
                            _config.data = _config.data.splice(0, 20);
                        }
                        _config.total = _config.data.length;
                        _autoShowNoFav();
                        ap = _initAP();
                        loadHide();
                        cb && cb();
                    } else {
                        _config.total = 0;
                        _config.data = [];
                        _autoShowNoFav();
                        loadHide();
                        cb && cb();
                    }
                    progress();
                    if (_config.total === 0) {
                        _config.error();
                    } else {
                        $.UTIL.apply(_config.afterLoadData);
                    }
                }
            },
            error: function() {
                if (_config.type === "zbpd") {
                    _config.total = 0;
                    _config.data = [];
                    _autoShowNoFav();
                    loadHide();
                    progress();
                    _config.error();
                }
            }
        });
    }
    function shake() {
        $("#" + _config.pre + _config.focusIndex).addClass("public_shake");
    }
    function favList() {
        var key = "fav_list";
        var keysMap = {
            getIndex: function() {
                return _config.focusIndex;
            },
            getTotalLine: function() {
                return Math.ceil(_config.total / _config.columnSize);
            },
            getFirstIndex: function() {
                return _config.firstLineIndex * _config.columnSize;
            },
            KEY_DOWN: function() {
                if(_config.editActive){
                    favFocus();
                    _config.editActive = false;
                    return;
                };
                var i = this.getIndex();
                if (Math.floor(i / _config.columnSize) === this.getTotalLine() - 1) {
                    shake();
                    return true;
                }
                if (i >= this.getFirstIndex() + _config.columnSize * (_config.showLine - 1)) {
                    ap.dragUp();
                } else {
                    if (i + _config.columnSize < _config.total) {
                        _config.focusIndex += _config.columnSize;
                    } else {
                        if (Math.floor(i / _config.columnSize) != this.getTotalLine() - 1) {
                            _config.focusIndex = _config.total - 1;
                        }
                    }
                    favFocus();
                }
                return true;
            },
            KEY_LEFT: function() {
                if(_config.editActive){
                    _config.left();
                    _config.editActive = false;
                    return true
                }
                var i = this.getIndex();
                if (i % _config.columnSize == 0) {
                    if ($("#container").hasClass("del")) {
                        return true;
                    }
                    fav.focus = _config.pre + _config.focusIndex;
                    _config.left();
                } else {
                    _config.focusIndex--;
                    favFocus();
                }
                return true;
            },
            KEY_RIGHT: function() {
                if(_config.editActive){
                    return true
                }
                var i = this.getIndex();
                if ((i + 1) % _config.columnSize != 0 && i + 1 != _config.total) {
                    _config.focusIndex++;
                    favFocus();
                } else {
                    shake();
                }
                return true;
            },
            KEY_UP: function() {
                var i = this.getIndex();
                if (i < _config.columnSize) {
                    if($("#container").hasClass("del")){
                        return true;
                    }
                    $.focusTo({el:'#menuOption'});
                    _config.editActive = true;
                    return true
                }
                if (i < this.getFirstIndex() + _config.columnSize) {
                    ap.dragDown();
                } else {
                    _config.focusIndex -= _config.columnSize;
                    favFocus();
                }
                return true;
            },
            KEY_PAGEDOWN: function() {
                if(_config.editActive){
                    return true
                }
                if (_config.firstLineIndex >= this.getTotalLine() - _config.showLine) {
                    shake();
                    return true;
                }
                ap.dragPageUp();
                return true;
            },
            KEY_PAGEUP: function() {
                if(_config.editActive){
                    return true
                }
                if (_config.firstLineIndex == 0) {
                    return true;
                }
                ap.dragPageDown();
                return true;
            },
            KEY_RETURN: function() {
                if ($("#container.del").length) {
                    _romoveDelOneClass();
                    $("#returnPrompt").hide();
                    $("#container #listContainer #menuOption").show();
                    return true;
                }
            },
            KEY_OK: function() {
                if(_config.editActive){
                    _activePanel();
                    return true
                }
                if ($("#container.del").length) {
                    delOne();
                    return true;
                }
                fav.focus = _config.pre + _config.focusIndex;
                if (_config.type === "zbpd") {
                    $.playLiveOrRec({
                        channelId: _config.data[_config.focusIndex].channelId
                    });
                } else {
                    $.gotoDetail({
                        contentId: _config.data[_config.focusIndex].mediaId,
                        categoryId: _config.data[_config.focusIndex].categoryId,
                        contentType: _config.data[_config.focusIndex].mediaType
                    });
                }
                return true;
            }
        };
        return {
            key: key,
            keysMap: keysMap,
            active: _active,
            deactive: _deactvie,
            cover: function() {
                return true;
            },
            uncover: function() {
                return true;
            }
        };
    }
    function _deactvie() {
        _config.isActive = false;
    }
    function favFocus() {
        var pre = _config.pre, index = _config.focusIndex;
        $.focusTo({
            el: "#" + pre + index,
            marquee: [ "#" + pre + index + " .fav_poster_name" ]
        });
        progress();
    }
    function progress() {
        var index = _config.focusIndex || 0;
        if (!_config.total || _config.total <= _config.showLine * _config.columnSize) {
            $("#progressBar").hide();
            return;
        } else {
            $("#progressBar").show();
        }
        var len = $("#progressBar").clientHeight() - 110;
        var everyMove = len / (Math.ceil(_config.total / _config.columnSize) - 1);
        var num = +index >= _config.columnSize ? Math.floor(index / _config.columnSize) : 0;
        $("#progressBar #strip").css("top", everyMove * num + "px");
    }
    function _active() {
        var el = "#" + _config.pre + _config.focusIndex;
        if (!_getDataLen()) {
            return;
        }
        if (!$(el).length) {
            _config.focusIndex = _config.data.length - 1;
        }
        favFocus();
        _config.isActive = true;
        _activPlug("fav_list", favList);
    }
    function _promptAuto() {
        var el = $("#container #listContainer .panel");
        var state = el.css("display");
        if (state === "none") {
            el.show();
        } else {
            el.hide();
        }
    }
    function _prompt_plug() {
        var key = "prompt_plug";
        var keysMap = {
            getFocusId: function(key) {
                var el = $(".focusBorder", "#container #listContainer .panel");
                if (el.length && el[0].id === key) {
                    return true;
                }
                return false;
            },
            KEY_LEFT: function() {
                if (this.getFocusId("rightBtn")) {
                    $.focusTo({
                        el: "#leftBtn"
                    });
                }
                return true;
            },
            KEY_RIGHT: function() {
                if (this.getFocusId("leftBtn")) {
                    $.focusTo({
                        el: "#rightBtn"
                    });
                }
                return true;
            },
            KEY_OK: function() {
                if (this.getFocusId("leftBtn")) {
                    _config.editActive = false;
                    delOneOk();
                }
                if (this.getFocusId("rightBtn")) {
                    delAllOk();
                }
                return true;
            },
            KEY_RETURN: function() {
                _promptAuto();
                $("#returnPrompt").hide();
                _autoShowNoFav();
                _activPlug("fav_list");
                $.focusTo({el:'#menuOption'});
                return true
            }
        };
        return {
            key: key,
            keysMap: keysMap
        };
    }
    function _plugDelAll() {
        var key = "_plugDelAll";
        var keysMap = {
            getFocusId: function(key) {
                var el = $(".focusBorder", "#container #listContainer .panel");
                if (el.length && el[0].id === key) {
                    return true;
                }
                return false;
            },
            KEY_LEFT: function() {
                if (this.getFocusId("rightBtn")) {
                    $.focusTo({
                        el: "#leftBtn"
                    });
                }
                return true;
            },
            KEY_RIGHT: function() {
                if (this.getFocusId("leftBtn")) {
                    $.focusTo({
                        el: "#rightBtn"
                    });
                }
                return true;
            },
            KEY_RETURN: function() {
                _promptAuto();
                $("#returnPrompt").hide();
                _autoShowNoFav();
                _activPlug("fav_list");
                $.focusTo({
                    el: "#menuOption"
                });
                return true;
            },
            KEY_OK: function() {
                var This = this;
                if (this.getFocusId("leftBtn")) {
                    if (_config.type === "zbpd") {
                        $.s.chanfav.empty(null, {
                            success: function(res) {
                                if (res.code == 0) {
                                    This.delDom();
                                }
                            }
                        });
                    } else {
                        $.s.fav.empty(null, {
                            success: function(res) {
                                if (res.code == 0) {
                                    This.delDom();
                                }
                            }
                        });
                    }
                }
                if (this.getFocusId("rightBtn")) {
                    this.KEY_RETURN();
                }
                return true;
            },
            delDom: function() {
                _config.data = [];
                _config.total = 0;
                _config.firstLineIndex = 0;
                ap.refresh(0, 0);
                _autoShowNoFav();
                _promptAuto();
                _config.left();
            }
        };
        return {
            key: key,
            keysMap: keysMap
        };
    }
    function delAllOk() {
        _promptAuto();
        var option = {
            title: "确定要删除全部内容?",
            leftValue: "确定",
            rightValue: "取消",
            plug: "_plugDelAll",
            fn: _plugDelAll
        };
        _activePanel(option);
    }
    function delOneOk() {
        _promptAuto();
        _addDelOneClass();
        _active();
        _autoShowNoFav();
    }
    function delOne() {
        if (_config.type === "zbpd") {
            $.s.chanfav.remove({
                channelId: _config.data[_config.focusIndex].channelId
            }, {
                success: function(res) {
                    if (res.code == 0) {
                        delOneCallBack();
                    }
                }
            });
        } else {
            $.s.fav.remove({
                mediaId: _config.data[_config.focusIndex].mediaId
            }, {
                success: function(res) {
                    if (res.code == 0) {
                        delOneCallBack();
                    }
                }
            });
        }
    }
    function delOneCallBack() {
        _config.data.splice(_config.focusIndex, 1);
        if (_config.focusIndex === _config.data.length && _config.firstLineIndex > 0 && _config.focusIndex / _config.columnSize === _config.firstLineIndex) {
            _config.firstLineIndex--;
        }
        ap.refresh(_config.firstLineIndex, _config.data.length);
        _config.total = _config.data.length;
        _config.focusIndex = _config.focusIndex === _config.total ? _config.focusIndex - 1 : _config.focusIndex;
        favFocus();
        if (_config.data.length) {
            _activPlug("fav_list");
        } else {
            _config.left();
            _romoveDelOneClass();
        }
        _autoShowNoFav();
    }
    function _addDelOneClass() {
        $("#container").addClass("del");
    }
    function _romoveDelOneClass() {
        $("#container").removeClass("del");
    }
    function _autoShowNoFav() {
        var $pBar = $("#container #listContainer #progressBar"), $noContent = $("#container  #noFav"), $menuOption = $("#container #listContainer #menuOption"), $returnOption = $("#returnPrompt");
        if (!_config.data.length) {
            $noContent.show();
            $menuOption.hide();
            $pBar.hide();
            $returnOption.hide();
            return;
        }
        $noContent.hide();
        if (!$("#container.del").length) {
            $menuOption.show();
        } else {
            $menuOption.hide();
        }
    }
    function _activPlug(plug, fn) {
        if (!$.pTool.get(plug)) {
            $.pTool.add(plug, fn());
        }
        $.pTool.active(plug);
    }
    function _activePanel(option) {
        if (!option) {
            option = {};
        }
        var title = option.title || "删除收藏记录?";
        var left = option.leftValue || "单个删除";
        var right = option.rightValue || "全部删除";
        var plug = option.plug || "prompt_plug";
        var fn = option.fn || _prompt_plug;
        $("#container #listContainer .panel .title").html(title);
        $("#container #listContainer .panel #leftBtn").html(left);
        $("#container #listContainer .panel #rightBtn").html(right);
        _promptAuto();
        _activPlug(plug, fn);
        $.focusTo({
            el: $("#container #listContainer .panel #leftBtn")
        });
    }
    function _blur() {
        _config.isActive = false;
    }
    function _addToPtool() {
        $.pTool.add("fav_list", favList());
    }
    function _getState() {
        return {
            firstLineIndex: _config.firstLineIndex,
            isActive: _config.isActive,
            focus: fav.focus,
            focusIndex: _config.focusIndex
        };
    }
    function _getDataLen() {
        var len = _config.data ? _config.data.length : 0;
        return len;
    }
    function _resetConfig() {
        _config.focusIndex = 0;
        _config.firstLineIndex = 0;
        fav.focus = null;
    }
    return {
        init: _init,
        active: _active,
        blur: _blur,
        addToPtool: _addToPtool,
        getState: _getState,
        renderPage: _renderPage,
        getDataLen: _getDataLen,
        setCallBack: function(fn, error) {
            _config.afterLoadData = fn;
            _config.error = error || function() {};
        },
        resetConfig: _resetConfig,
        getDataLen: function() {
            return _config.data.length;
        }
    };
}();