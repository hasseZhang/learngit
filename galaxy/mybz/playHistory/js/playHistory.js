var ph = function() {
    var ap = null;
    var _config = {
        editActive: false,
        pre: "ph_item",
        firstLineIndex: 0,
        columnSize: 5,
        showLine: 2,
        lineHeight: 460,
        total: 0,
        focusIndex: 0
    };
    function _initConfig(type) {
        _config.type = type;
        loadShow();
        _getAll();
    }
    function loadShow() {
        $("#container  #noContent").hide();
        $("#listContainer #loading").show();
    }
    function loadHide() {
        $("#listContainer #loading").hide();
    }
    function clearApPanel() {
        if ($(".phContent").length) {
            $(".phContent").remove();
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
            className: "phContent",
            paddingItem: '<div class="ph_item"></div>',
            transition: "all .6s",
            appendTo: $("#listContainer")[0],
            render: _renderList,
            update: _updateInfo
        });
    }
    function _renderList(begin, end) {
        var data = _renderData(begin, end);
        return _renderItem(data, begin);
    }
    function doRecord(re) {
        var record = "";
        var pre = "观看至";
        var n = "";
        var unit = "";
        var leaveTime = re.leaveTime;
        var totalTime = re.totalTime;
        var num = leaveTime / totalTime * 100;
        var percent = num > 1 ? Math.floor(num) + "%" : "不足1%";
        if (re.mediaType !== "0") {
            n = Number(re.sceneInfo);
            if (re.mediaType === "2") {
                pre += "第";
                unit = "集";
            } else if (re.mediaType === "3") {
                if ((n + "").length !== 8) {
                    pre += "第";
                }
                unit = "期";
            }
        }
        record = pre + n + unit + percent;
        return record;
    }
    function _renderItem(data, begin) {
        var html = "";
        var src = "";
        var title = "";
        var vip = "";
        var playTime = "";
        for (var i = 0; i < data.length; i++) {
            src = $.getPic(data[i].picInfos, [ 102 ], {
                picType: "type",
                picPath: "url"
            });
            title = data[i].name;
            if ("chargeCpInfos" in data[i]) {
                var chargesIds = data[i].chargeCpInfos.map(obj => {
                    return obj.chargesId
                })
                var haveSinglepoint = chargesIds.indexOf("1100000184") > -1 || chargesIds.indexOf("1100000383") > -1 || chargesIds.indexOf("1100000185") > -1|| chargesIds.indexOf("1100000781") > -1;
                vip = chargesIds.indexOf("1100000761") > -1 ? '<div class="MoviesVip"></div>' : chargesIds.indexOf("1100000381") > -1 ? '<div class="childrenVip"></div>' : haveSinglepoint == true ? '<div class="SinglepointVip"></div>' : chargesIds.indexOf("1100000181") > -1 ? '<div class="Qiyivip"></div>' : chargesIds.indexOf("1100000241") > -1 ? '<div class="MoviesVip"></div>' : '';
            } else {
                vip = "";
            }
            playTime = doRecord(data[i]);
            html += '<div id="ph_item' + (begin + i) + '" class="ph_item"><div class="ph_content"><div class="ph_poster noPic">' + vip + '<img src="' + src + '"><div class="ph_delposter"></div><div class="ph_playTime">' + playTime + '</div></div><div class="ph_delposter"></div><div class="ph_poster_name autoText">' + title + "</div></div></div></div>";
        }
        return html;
    }
    function _updateInfo(info) {
        _config.firstLineIndex = info.firstLineIndex;
        if (info.turnLine) {
            _config.focusIndex -= info.columnSize * info.turnLine;
            _config.focusIndex = Math.max(Math.min(_config.focusIndex, info.total - 1), 0);
            phFocus();
        }
        if (info.total === 100) {
            if (_config.firstLineIndex + info.showLine >= info.totalLine) {
                $("#mostShow").show();
            } else {
                $("#mostShow").hide();
            }
        }
    }
    function _renderData(begin, end) {
        return _config.data.slice(begin, end);
    }
    function _getAll() {
        $.s.his.all(null, {
            success: function(res) {
                if (res && res.data) {
                    _config.data = res.data;
                    if (_config.data.length > 100) {
                        _config.data = _config.data.splice(0, 100);
                    }
                    _config.total = _config.data.length;
                    _autoShowNoContent();
                    ap = _initAP();
                    loadHide();
                    progress();
                } else {
                    _config.total = 0;
                    _config.data = [];
                    progress();
                    _autoShowNoContent();
                    loadHide();
                }
                $.UTIL.apply(_config.afterLoadData);
            },
            error: function() {
                _config.total = 0;
                _config.data = [];
                _autoShowNoContent();
                loadHide();
                $.UTIL.apply(_config.error);
            }
        });
    }
    function _renderPage(con) {
        if (con.current === _config.type) {
            return;
        }
        clearApPanel();
        _initConfig(con.current);
        progress();
    }
    function _init(opt) {
        _config.firstLineIndex = opt.firstLineIndex || 0;
        _config.afterLoadData = opt.afterLoadData;
        _config.focusIndex = opt.focusIndex || 0;
        _config.left = opt.left || function() {};
        ph.focus = opt.focus || "";
    }
    function shake() {
        $("#" + _config.pre + _config.focusIndex).addClass("public_shake");
    }
    function phList() {
        var key = "ph_list";
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
                    phFocus();
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
                    phFocus();
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
                    ph.focus = _config.pre + _config.focusIndex;
                    _config.left();
                    return true;
                }
                _config.focusIndex--;
                phFocus();
                return true;
            },
            KEY_RIGHT: function() {
                if(_config.editActive){
                    return true
                }
                var i = this.getIndex();
                if ((i + 1) % _config.columnSize != 0 && i + 1 != _config.total) {
                    _config.focusIndex++;
                    phFocus();
                } else {
                    shake();
                }
                return true;
            },
            KEY_UP: function() {
                var i = this.getIndex();
                if (i < _config.columnSize) {
                    if($("#container").hasClass("del")){
                        return true
                    }
                    $.focusTo({el:'#menuOption'});
                    _config.editActive = true;
                    return;
                }
                if (i < this.getFirstIndex() + _config.columnSize) {
                    ap.dragDown();
                } else {
                    _config.focusIndex -= _config.columnSize;
                    phFocus();
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
                    $("#menuOption").show();
                    $("#returnPrompt").hide();
                    _romoveDelOneClass();
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
                var i = this.getIndex();
                var data = _config.data[i];
                var obj = {
                    contentType: data.mediaType,
                    contentId: data.mediaId,
                    categoryId: data.categoryId
                };
                ph.focus = _config.pre + _config.focusIndex;
                $.gotoDetail(obj);
                return true;
            }
        };
        return {
            key: key,
            keysMap: keysMap,
            active: _active,
            deactive: function() {
                _config.isActive = false;
            },
            cover: function() {
                return true;
            },
            decover: function() {
                return true;
            }
        };
    }
    function phFocus() {
        var pre = _config.pre, index = _config.focusIndex;
        $.focusTo({
            el: "#" + pre + index,
            marquee: [ "#" + pre + index + " .ph_poster_name" ]
        });
        progress();
    }
    function progress() {
        var index = _config.focusIndex || 0;
        if (!_config.total || _config.total <= _config.columnSize * _config.showLine) {
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
        if (!_config.data.length) {
            return;
        }
        if (!$(el).length) {
            _config.focusIndex = _config.data.length - 1;
        }
        phFocus();
        _config.isActive = true;
        _activPlug("ph_list", phList);
    }
    function _blur() {
        _config.isActive = false;
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
                _activPlug("ph_list");
                if(_config.editActive){
                    $.focusTo({
                        el: "#menuOption"
                    });
                }else{
                    $.focusTo({
                        el: "#" + ph.focus,
                        marquee: [ "#" + ph.focus + " .ph_poster_name" ]
                    });
                }
                $("#menuOption").show();
                $("#returnPrompt").hide();
                return true;
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
                _activPlug("ph_list");
                $.focusTo({
                    el: "#menuOption"
                });
                $("#menuOption").show();
                $("#returnPrompt").hide();
                return true;
            },
            KEY_OK: function() {
                if (this.getFocusId("leftBtn")) {
                    $.s.his.empty(null, {
                        success: function(res) {
                            if (res.code == 0) {
                                _config.data = [];
                                _config.total = 0;
                                _config.firstLineIndex = 0;
                                ap.refresh(0, 0);
                                _autoShowNoContent();
                                _promptAuto();
                                menu.active();
                            }
                        }
                    });
                }
                if (this.getFocusId("rightBtn")) {
                    this.KEY_RETURN();
                }
                return true;
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
        _autoShowNoContent();
    }
    function delOne() {
        $.s.his.remove({
            mediaId: _config.data[_config.focusIndex].mediaId
        }, {
            success: function(res) {
                if (res.code == 0) {
                    _config.data.splice(_config.focusIndex, 1);
                    if (_config.focusIndex === _config.data.length && _config.firstLineIndex > 0 && _config.focusIndex / _config.columnSize === _config.firstLineIndex) {
                        _config.firstLineIndex--;
                    }
                    ap.refresh(_config.firstLineIndex, _config.data.length);
                    _config.total = _config.data.length;
                    _config.focusIndex = _config.focusIndex === _config.total ? _config.focusIndex - 1 : _config.focusIndex;
                    phFocus();
                    if (_config.data.length) {
                        _activPlug("ph_list");
                    } else {
                        _config.left();
                        _romoveDelOneClass();
                    }
                    _autoShowNoContent();
                }
            },
            error: function() {}
        });
    }
    function _addDelOneClass() {
        $("#container").addClass("del");
    }
    function _romoveDelOneClass() {
        $("#container").removeClass("del");
    }
    function _autoShowNoContent() {
        var $pBar = $("#container #listContainer #progressBar"), $noContent = $("#container  #noContent"), $menuOption = $("#container #listContainer #menuOption"), $returnOption = $("#returnPrompt");
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
            $returnOption.hide();
        } else {
            $menuOption.hide();
            $returnOption.show();
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
        var title = option.title || "删除观看历史?";
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
    function _addToPtool() {
        $.pTool.add("ph_list", phList());
    }
    function _getState() {
        return {
            firstLineIndex: _config.firstLineIndex,
            isActive: _config.isActive,
            focus: ph.focus,
            focusIndex: _config.focusIndex
        };
    }
    function _resetConfig() {
        _config.focusIndex = 0;
        _config.firstLineIndex = 0;
        ph.focus = null;
    }
    return {
        init: _init,
        active: _active,
        blur: _blur,
        addToPtool: _addToPtool,
        renderPage: _renderPage,
        getState: _getState,
        resetConfig: _resetConfig,
        setCallBack: function(fn, error) {
            _config.afterLoadData = fn;
            _config.error = error;
        }
    };
}();