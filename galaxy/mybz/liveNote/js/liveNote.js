var ln = function() {
    var ap = null;
    var _config = {
        editActive: false,
        pre: "ln_item",
        firstLineIndex: 0,
        columnSize: 4,
        showLine: 3,
        lineHeight: 230,
        shadowLine: 1,
        shadowLineUp: 1,
        total: 0,
        focusIndex: 0
    };
    function _initConfig(type) {
        _config.type = type;
        loadShow();
        _getAll()
    }
    function loadShow() {
        $("#container  #noContent").hide();
        $("#listContainer #loading").show()
    }
    function loadHide() {
        $("#listContainer #loading").hide()
    }
    function clearApPanel() {
        if ($(".lnContent").length) {
            $("#container #listContainer")[0].removeChild($(".lnContent")[0])
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
            className: "lnContent",
            transition: "all .6s",
            paddingItem: '<div class="ln_item"></div>',
            appendTo: $("#listContainer")[0],
            render: _renderList,
            update: _updateInfo
        })
    }
    function _renderList(begin, end) {
        var data = _renderData(begin, end);
        return _renderItem(data, begin)
    }
    function _renderItem(data, begin) {
        var html = "";
        var program = "",
        num = "",
        time = "",
        name = "";
        var vipCorner = "";
        for (var i = 0; i < data.length; i++) {
            program = data[i].program;
            num = data[i].channelId.num;
            name = data[i].channelId.name;
            time = formatTime(data[i].startTime);
            vipCorner = $.isVipChan(num) ? '<div class="vipCorner"></div>': "";
            html += '<div id="ln_item' + (begin + i) + '" class="ln_item"><div class="ln_content">' + vipCorner + '<p class="title autoText"><span>' + num + "</span><span>" + name + '</span></p><p class="date">' + time + '</p><p class="pro autoText">' + program + '</p><div class="ln_delposter"></div></div></div></div>'
        }
        return html
    }
    function formatTime(time) {
        var month = time.substr(4, 2);
        var day = time.substr(6, 2);
        var h = time.substr(8, 2);
        var s = time.substr(10, 2);
        month = month.replace(/^0/, "");
        return month + "月" + day + "日  " + h + ":" + s
    }
    function _updateInfo(info) {
        _config.firstLineIndex = info.firstLineIndex;
        if (info.turnLine) {
            _config.focusIndex -= info.columnSize * info.turnLine;
            _config.focusIndex = Math.max(Math.min(_config.focusIndex, info.total - 1), 0);
            lnFocus()
        }
        if (info.total === 100) {
            if (_config.firstLineIndex + info.showLine >= info.totalLine) {
                $("#mostShow").show()
            } else {
                $("#mostShow").hide()
            }
        }
    }
    function _renderData(begin, end) {
        return _config.data.slice(begin, end)
    }
    function _getAll() {
        $.reserve.all(function(res) {
            _config.data = res.data || [];
            if (_config.data.length > 100) {
                _config.data = _config.data.splice(0, 100)
            }
            _config.total = _config.data.length;
            _autoShowNoContent();
            ap = _initAP();
            loadHide();
            _config.afterLoadData(_config.total);
            progress()
        })
    }
    function _renderPage(con) {
        if (con.current === _config.type) {
            return
        }
        clearApPanel();
        _initConfig(con.current);
        progress()
    }
    function _init(opt) {
        _config.firstLineIndex = opt.firstLineIndex || 0;
        _config.afterLoadData = opt.afterLoadData;
        _config.focusIndex = opt.focusIndex || 0;
        _config.left = opt.left ||
        function() {};
        ln.focus = opt.focus || ""
    }
    function shake() {
        $("#" + _config.pre + _config.focusIndex).addClass("public_shake")
    }
    function lnList() {
        var key = "ln_list";
        var keysMap = {
            getIndex: function() {
                return _config.focusIndex
            },
            getTotalLine: function() {
                return Math.ceil(_config.total / _config.columnSize)
            },
            getFirstIndex: function() {
                return _config.firstLineIndex * _config.columnSize
            },
            KEY_DOWN: function() {
                if(_config.editActive){
                    lnFocus();
                    _config.editActive = false;
                    return;
                };
                var i = this.getIndex();
                if (Math.floor(i / _config.columnSize) === this.getTotalLine() - 1) {
                    shake();
                    return true
                }
                if (i >= this.getFirstIndex() + _config.columnSize * (_config.showLine - 1)) {
                    ap.dragUp()
                } else {
                    if (i + _config.columnSize < _config.total) {
                        _config.focusIndex += _config.columnSize
                    } else {
                        if (Math.floor(i / _config.columnSize) != this.getTotalLine() - 1) {
                            _config.focusIndex = _config.total - 1
                        }
                    }
                    lnFocus()
                }
                return true
            },
            KEY_LEFT: function() {
                if(_config.editActive){
                    _config.left();
                    _config.editActive = false;
                    return true
                }
                var i = this.getIndex();
                if (i % _config.columnSize == 0) {
                    if (/del/.test($("#container")[0].className)) {
                        return true
                    }
                    ln.focus = _config.pre + _config.focusIndex;
                    _config.left();
                    return true
                }
                _config.focusIndex--;
                lnFocus();
                return true
            },
            KEY_RIGHT: function() {
                if(_config.editActive){
                    return true
                }
                var i = this.getIndex();
                if ((i + 1) % _config.columnSize != 0 && i + 1 != _config.total) {
                    _config.focusIndex++;
                    lnFocus()
                } else {
                    shake()
                }
                return true
            },
            KEY_UP: function() {
                var i = this.getIndex();
                if (i < _config.columnSize) {
                    if($("#container").hasClass("del")){
                        return true
                    }
                    $.focusTo({el:'#menuOption'});
                    _config.editActive = true;
                    return
                    return
                }
                if (i < this.getFirstIndex() + _config.columnSize) {
                    ap.dragDown()
                } else {
                    _config.focusIndex -= _config.columnSize;
                    lnFocus()
                }
                return true
            },
            KEY_PAGEDOWN: function() {
                if(_config.editActive){
                    return true
                }
                if (_config.firstLineIndex >= this.getTotalLine() - _config.showLine) {
                    shake();
                    return true
                }
                ap.dragPageUp();
                return true
            },
            KEY_PAGEUP: function() {
                if(_config.editActive){
                    return true
                }
                if (_config.firstLineIndex == 0) {
                    return true
                }
                ap.dragPageDown();
                return true
            },
            KEY_RETURN: function() {
                if ($("#container.del").length) {
                    $("#returnPrompt").hide();
                    _romoveDelOneClass();
                    _autoShowNoContent();
                    return true
                }
            },
            KEY_OK: function() {
                if(_config.editActive){
                    _activePanel();
                    return true
                }
                if ($("#container.del").length) {
                    delOne();
                    return true
                }
                return true
            }
        };
        return {
            key: key,
            keysMap: keysMap,
            active: _active,
            deactive: function() {
                _config.isActive = false
            },
            cover: function() {
                return true
            },
            decover: function() {
                return true
            }
        }
    }
    function lnFocus() {
        var pre = _config.pre,
        index = _config.focusIndex;
        $.focusTo({
            el: "#" + pre + index,
            marquee: ["#" + pre + index + " .pro.autoText"]
        });
        progress()
    }
    function progress() {
        var index = _config.focusIndex || 0;
        if (!_config.total || _config.total <= _config.columnSize * _config.showLine) {
            $("#progressBar").hide()
        } else {
            $("#progressBar").show()
        }
        var len = $("#progressBar")[0].clientHeight - 110;
        var everyMove = len / (Math.ceil(_config.total / _config.columnSize) - 1);
        var num = +index >= _config.columnSize ? Math.floor(index / _config.columnSize) : 0;
        $("#progressBar #strip").css("top", everyMove * num + "px")
    }
    function _active() {
        var el = "#" + _config.pre + _config.focusIndex;
        if (!_config.data.length) {
            return
        }
        if (!$(el).length) {
            _config.focusIndex = _config.data.length - 1
        }
        lnFocus();
        _config.isActive = true;
        _activPlug("ln_list", lnList)
    }
    function _blur() {
        _config.isActive = false
    }
    function _promptAuto() {
        var el = $("#container #listContainer .panel");
        var state = el.css("display");
        if (state === "none") {
            el.show()
        } else {
            el.hide()
        }
    }
    function _prompt_plug() {
        var key = "prompt_plug";
        var keysMap = {
            getFocusId: function(key) {
                var el = $(".focusBorder", "#container #listContainer .panel");
                if (el.length && el[0].id === key) {
                    return true
                }
                return false
            },
            KEY_LEFT: function() {
                if (this.getFocusId("rightBtn")) {
                    $.focusTo({
                        el: "#leftBtn"
                    })
                }
                return true
            },
            KEY_RIGHT: function() {
                if (this.getFocusId("leftBtn")) {
                    $.focusTo({
                        el: "#rightBtn"
                    })
                }
                return true
            },
            KEY_OK: function() {
                if (this.getFocusId("leftBtn")) {
                    _config.editActive = false;
                    delOneOk()
                }
                if (this.getFocusId("rightBtn")) {
                    delAllOk()
                }
                return true
            },
            KEY_RETURN: function() {
                _promptAuto();
                _activPlug("ln_list");
                _autoShowNoContent();
                $("#returnPrompt").hide();
                $.focusTo({el:'#menuOption'});
                return true
            }
        };
        return {
            key: key,
            keysMap: keysMap
        }
    }
    function _plugDelAll() {
        var key = "_plugDelAll";
        var keysMap = {
            getFocusId: function(key) {
                var el = $(".focusBorder", "#container #listContainer .panel");
                if (el.length && el[0].id === key) {
                    return true
                }
                return false
            },
            KEY_LEFT: function() {
                if (this.getFocusId("rightBtn")) {
                    $.focusTo({
                        el: "#leftBtn"
                    })
                }
                return true
            },
            KEY_RIGHT: function() {
                if (this.getFocusId("leftBtn")) {
                    $.focusTo({
                        el: "#rightBtn"
                    })
                }
                return true
            },
            KEY_RETURN: function() {
                _promptAuto();
                _activPlug("ln_list");
                $("#returnPrompt").hide();
                $.focusTo({
                    el: "#menuOption"
                });
                return true
            },
            KEY_OK: function() {
                if (this.getFocusId("leftBtn")) {
                    $.reserve.empty(function() {
                        _config.data = [];
                        _config.total = 0;
                        _config.firstLineIndex = 0;
                        ap.refresh(0, 0);
                        _autoShowNoContent();
                        _promptAuto();
                        menu.active()
                    })
                }
                if (this.getFocusId("rightBtn")) {
                    this.KEY_RETURN()
                }
                return true
            }
        };
        return {
            key: key,
            keysMap: keysMap
        }
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
        _activePanel(option)
    }
    function delOneOk() {
        _promptAuto();
        _addDelOneClass();
        _active();
        _autoShowNoContent()
    }
    function delOne() {
        $.reserve.remove(_config.data[_config.focusIndex].startTime,
        function() {
            _config.data.splice(_config.focusIndex, 1);
            if (_config.focusIndex === _config.data.length && _config.firstLineIndex > 0 && _config.focusIndex / _config.columnSize === _config.firstLineIndex) {
                _config.firstLineIndex--
            }
            ap.refresh(_config.firstLineIndex, _config.data.length);
            _config.total = _config.data.length;
            _config.focusIndex = _config.focusIndex === _config.total ? _config.focusIndex - 1 : _config.focusIndex;
            lnFocus();
            if (_config.data.length) {
                _activPlug("ln_list")
            } else {
                _config.left();
                _romoveDelOneClass()
            }
            _autoShowNoContent()
        },
        function() {})
    }
    function _addDelOneClass() {
        $("#container").addClass("del")
    }
    function _romoveDelOneClass() {
        $("#container").removeClass("del")
    }
    function _autoShowNoContent() {
        var $noContent = $("#container  #noContent"),
        $menuOpt = $("#container #listContainer #menuOption"),
        $pBar = $("#container #listContainer #progressBar"),
        $returnOption = $("#returnPrompt");
        if (!_config.data.length) {
            $noContent.show();
            $menuOpt.hide();
            $pBar.hide();
            return
        }
        $noContent.hide();
        if (!$("#container.del").length) {
            $menuOpt.show();
            $returnOption.hide();
        } else {
            $menuOpt.hide();
            $returnOption.show();
        }
        if (_config.total < 13) {
            $pBar.hide()
        } else {
            $pBar.show()
        }
    }
    function _activPlug(plug, fn) {
        if (!$.pTool.get(plug)) {
            $.pTool.add(plug, fn())
        }
        $.pTool.active(plug)
    }
    function _activePanel(option) {
        if (!option) {
            option = {}
        }
        var title = option.title || "删除预约记录?";
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
        })
    }
    function _addToPtool() {
        $.pTool.add("ln_list", lnList())
    }
    function _getState() {
        return {
            firstLineIndex: _config.firstLineIndex,
            isActive: _config.isActive,
            focus: ln.focus,
            focusIndex: _config.focusIndex
        }
    }
    function _resetConfig() {
        _config.focusIndex = 0;
        _config.firstLineIndex = 0;
        ln.focus = null
    }
    return {
        init: _init,
        active: _active,
        blur: _blur,
        addToPtool: _addToPtool,
        renderPage: _renderPage,
        getState: _getState,
        resetConfig: _resetConfig,
        setCallBack: function(fn) {
            _config.afterLoadData = fn
        }
    }
} ();