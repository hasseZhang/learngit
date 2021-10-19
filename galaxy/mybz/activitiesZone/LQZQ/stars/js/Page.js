window.PAGE_INFO = [];
var PAGE_LEFT = [];
//本页名字
var pageName = 'stars';
//本页数据key
// var PAGE_DATA_KEY = 'pageDataKey_' + pageName; //当页保存的焦点
var ACTIVE_OBJECT;
var savedData = {};
var menu;

function initPage() {
    $.recodeData(pageName, "access");
    savedData = $.getGlobalData(pageName);
    $.saveGlobalData(pageName);
    window.G_AUTH({
        success: function (result) {
            window.AUTH_FLAG = result;
            authInit();
        }
    }); // 鉴权
}

function authInit() {
    if (AUTH_FLAG == 0) { // 鉴权未通过
        $$('#container').css('display', 'none');
        authMsg = window.G_MSG({
            type: 'else',
            msgType: '4',
            backFocus: function () {
                // var url = '../home/?POSITIVE';
                // $$.redirect(url);
                var key = ACTIVE_OBJECT.key;
                if (key.indexOf('nav') == -1) {
                    menu.enter();
                }
            },
            saveMsgFocus: function () {
                savePageInfo();
            }
        });
        authMsg.upTo = function () {
            menu.enter();
            return true;
        }
        authMsg.init();
        menu = window.MENU({
            pressDown: function () {
                this.blur();
                authMsg.enter();
            }
        });
        menu.init();
    } else { // 鉴权通过
        $$('#container').css('display', 'block');
        if (savedData['focus'] == 'btnOk') {
            savedData['focus'] = '';
        }
        menu = window.MENU({
            pressDown: function () {
                var data = START.getData();
                if (data.length > 0) {
                    this.blur();
                    START.enter();
                }
            }
        });
        menu.init();
        START.init();
    }
}

function savePageInfo(index) {
    $.savePageInfo(pageName, {
        "focus": ACTIVE_OBJECT.key,
        "index": index
    })
}
var START = (function () {
    var _guidanceId = G_GUIDEID.stars.stars; // 球星导读
    var _data = 0;
    var _dataLen = 0;
    var _index = 0;

    function _init() {
        _index = savedData['index'] ? savedData['index'] : 0;
        _loadData();
    }

    function _loadData() {
        $$.loader4GuidanceContents(_guidanceId, {
            success: function (data) {
                _data = data;
                _dataLen = _data.length;
                _render();
            },
            loading: function () { },
            error: function (err) { }
        });
    }

    function _render() {
        var _d = _data.slice(0, 10);
        var _len = _d.length;
        var out = [];
        for (var i = 0; i < _len; i++) {
            var url = $$.getPic(_d[i].pics, [1]); // picType 1: 海报
            $$('#list_' + (i + 1) + ' img').attr('src', url);
            $$('#list_' + (i + 1) + ' .pName').html(_d[i].contentName);
            out.push({
                key: 'list_' + (i + 1),
                pressUp: _up,
                pressDown: _down,
                pressLeft: _left,
                pressRight: _right,
                pressOk: _ok,
                pressBack: _pressBack,
                args: [i]
            });
        }
        PAGE_INFO = PAGE_INFO.concat(out);
        if (savedData['focus']) {
            _focus();
        } else {
            $$.focusTo(savedData['focus']);
        }
    }

    function _onFocus() {
        $$('#list_' + (+_index + 1) + ' .pName').removeClass('none');
    }

    function _blur() {
        if (ACTIVE_OBJECT) {
            var index = ACTIVE_OBJECT['args'][0];
            $$('#list_' + (+index + 1) + ' .pName').addClass('none');
        }
    }

    function _focus() {
        _blur();
        var _all = _data[_index].contentName;
        var _width = '222px';
        var flag = $$.substringElLength(_all, '20px', _width).flag;
        $$.focusTo('list_' + (+_index + 1));
        flag ? $$.Marquee({ el: $$('#list_' + (+_index + 1) + ' .pName')[0], all: _all, width: _width, height: '50px' }) : '';
        _onFocus();
    }

    function _up() {
        if ((_index + 1) <= 5) {
            _blur();
            menu.enter();
        } else {
            _index = _index - 5;
            _focus();
        }
    }

    function _down() {
        if ((_index + 1) > 5) return;
        _index = _index + 5;
        _focus();
    }

    function _left() {
        if (_index == 0) {
            return;
        }
        _index--;
        _focus();
    }

    function _right() {
        if (_index == 9) return;
        _index++;
        _focus();
    }

    function _ok() {
        savePageInfo(_index);
        var url = window.location.href.replace('stars/', _data[_index].contentUri);
        $$.forward(url);
    }

    function _pressBack() {
        var key = ACTIVE_OBJECT.key;
        if (key.indexOf('nav') == -1) {
            // 返回到导航
            START.blur();
            menu.enter();

        } else {
            // 返回到首页
            menu.index = 0;
            menu.moveTo();
            menu.jumpUrl();
        }
        return true;
    }

    function _getData() {
        return _data;
    }
    return {
        init: _init,
        enter: _focus,
        blur: _blur,
        getData: _getData
    }
})();

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
        test_log.style.width = '1200px';
        test_log.style.color = 'white';
        test_log.style.wordWrap = 'break-word';
        test_log.style.wordBreak = 'break-all';
        test_log.style.fontSize = '20px';
        test_log.style.position = 'absolute';
        test_log.style.top = '10px';
        test_log.style.left = '10px';
        test_log.style.padding = '3px';
        test_log.style.border = 'solid 1px #ff0';
        test_log.style.zIndex = '999';
        test_log.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        document.body.appendChild(test_log);
        test_log.innerHTML = msg;
    }
}