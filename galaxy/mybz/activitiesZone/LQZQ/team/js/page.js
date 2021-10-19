window.PAGE_INFO = [];
var ACTIVE_OBJECT;
var savedData = {};
var pageName = 'teamPage';
var recommendId = { // 导读
    id: window.G_GUIDEID['team']['content']
};
var menu;

function initPage() {
    $.recodeData(pageName, "access");
    savedData = $.getGlobalData(pageName);
    $.saveGlobalData(pageName);
    window.G_AUTH({
        success: function(result) {
            window.AUTH_FLAG = result;
            // window.AUTH_FLAG = 1;
            authInit();
        }
    });
}

function returnNav() { // 返回到导航
    var key = ACTIVE_OBJECT.key;
    if (key.indexOf('nav') == -1) {
        menu.enter();
    } else {
        menu.index = 0;
        menu.moveTo();
        menu.jumpUrl();
    }
    return true;
}

function authInit() {
    if (AUTH_FLAG == 0) {
        $$('.allTeam').css('display', 'none');
        $$('#noData').css('display', 'none');
        authMsg = window.G_MSG({
            type: 'else',
            msgType: '4',
            backFocus: function() {
                // var url = '../home/?POSITIVE';
                // $$.redirect(url);
                var key = ACTIVE_OBJECT.key;
                if (key.indexOf('nav') == -1) {
                    menu.enter();
                }
            },
            saveMsgFocus: function() {
                savePageInfo();
            }
        });
        authMsg.upTo = function() {
            menu.enter();
            return true;
        }
        authMsg.init();
        menu = window.MENU({
            pressDown: function() {
                this.blur();
                authMsg.enter();
            }
        });
        menu.init();
    } else {
        $$('.allTeam').css('display', 'block');
        if (savedData['focus'] == 'btnOk') {
            savedData['focus'] = '';
        }
        menu = window.MENU({
            pressDown: function() {
                var dataSize = CONTENT_BOX.getDataLen();
                if (dataSize == 0) {
                    return;
                }
                this.blur();
                CONTENT_BOX.enter();
            }
        });
        menu.init();
        CONTENT_BOX.init();
        $$.focusTo(savedData['focus']);
    }
}

function savePageInfo(p, s) {
    $.savePageInfo(pageName, {
        "focus": ACTIVE_OBJECT.key,
        "position": p,
        "startIndex": s
    });
}
var CONTENT_BOX = (function() {
    var _startIndex = 0;
    var _position = 0;
    var _data = [];
    var _id = recommendId['id'] || 0;
    var _elLen = 15;
    var _currBtn;

    function _returnNav() { // 返回到导航
        var key = ACTIVE_OBJECT.key;
        if (key.indexOf('nav') == -1) {
            _position = 0;
            _blur();
            menu.enter();
        } else {
            menu.index = 0;
            menu.moveTo();
            menu.jumpUrl();
        }
        return true;
    }

    function _load() {
        $$.loader4GuidanceContents(_id, {
            success: function(data) {
                _isHaveData(data);
                _position = savedData['position'] || 0;
                _startIndex = savedData['startIndex'] || 0;
                var key = savedData['focus'];
                _data = data;
                _render();
                _joinPage();
                _pageNum();
                _pageSize();
                _renderBtn();
                key ? _movingTo() : '';
            }
        });
    }

    function _isHaveData(data) {
        if (data.length == 0) {
            $$('.allTeam').addClass('none');
            $$('#noData').removeClass('none');
        } else {
            $$('.allTeam').removeClass('none');
            $$('#noData').addClass('none');
        }
    }

    function _joinPage() {
        var out = [
            { key: 'pageUpBtn', pressUp: _enter, pressDown: '', pressLeft: '', pressRight: _chooseBtn, pressOk: _pageUp, pressBack: _returnNav },
            { key: 'pageDownBtn', pressUp: _enter, pressDown: '', pressLeft: _chooseBtn, pressRight: '', pressOk: _pageDown, pressBack: _returnNav }
        ];
        for (var i = 0; i < _elLen; i++) {
            out.push({
                key: 'team' + i,
                pressUp: _up,
                pressDown: _down,
                pressLeft: _left,
                pressRight: _right,
                pressOk: _ok,
                pressBack: _returnNav,
                args: [i],
            })
        }
        PAGE_INFO = PAGE_INFO.concat(out);
    }

    function _render() {
        var data = _data.slice(_startIndex, _startIndex + 15);
        for (var i = 0; i < _elLen; i++) {
            if (i < data.length) {
                var pics = data[i]['pics'] || '';
                var picPath = $$.getPic(pics, [0]);
                // var name = _data[i]['contentName'];
                // var subStr_name = $$.substringElLength(name, '16px', '222px').last;
                picPath = picPath ? picPath : $$.getPic(pics, [1]);
                // name == '0' ? $$('#team' + i + ' .text').addClass('none') : '';
                $$('#team' + i).removeClass('none');
                $$('#team' + i + ' img')[0].src = picPath;
            } else {
                $$('#team' + i).addClass('none');
                $$('#team' + i + ' img')[0].src = '';
            }
        }
    }

    function _movingTo() {
        _blur();
        $$.focusTo('team' + _position);
        _onFocus();
        var name = _data[_startIndex + _position]['contentName'];
        var flag = $$.substringElLength(name, '20px', '208px').flag;
        var key = ACTIVE_OBJECT.key;
        flag ? $$.Marquee({ el: $$('#' + key + ' .text')[0], all: name, width: '212px', height: '50px' }) : ($$('#team' + _position + ' .text').html(name));
    }

    function _enter() {
        if (_startIndex + _position > _data.length - 1) {
            _position = 0;
        }
        _movingTo();
    }

    function _onFocus() {
        var pics = _data[_startIndex + _position]['pics'] || '';
        var picPath1 = $$.getPic(pics, [1]);
        picPath1 && ($$('#team' + _position + ' img')[0].src = picPath1);
        $$('#team' + _position + ' .text').removeClass('none');
    }

    function _blur() {
        if (ACTIVE_OBJECT) {
            var index = ACTIVE_OBJECT['args'] && ACTIVE_OBJECT['args'][0] || 0;
            var pics = _data[_startIndex + index]['pics'] || '';
            var picPath = $$.getPic(pics, [0]);
            $$('#team' + index + ' img')[0].src = picPath;
            $$('#team' + index + ' .text').addClass('none');
        }
    }

    function _up() {
        if (_position < 5) {
            _blur();
            menu.enter();
        } else {
            _position -= 5;
            _movingTo();
        }
    }

    function _down() {
        var pageNum = _startIndex / 15 + 1; //当前页
        var pageAll = Math.ceil(_data.length / 15) // 检查一共多少页
        if (pageNum == pageAll) {
            var lastIdx = (_data.length - _startIndex) - 1;
            var pageLineAll = Math.ceil((_data.length % 15) / 5) || 3;
            var currentLine = Math.ceil((_position + 1) / 5)
            if (_position + 5 <= lastIdx) {
                _position += 5;
                _movingTo();
            } else if (pageLineAll != currentLine) {
                // 当前行不是最后一行
                _position = lastIdx;
                _movingTo();
            } else {
                // 当前行是最后一行
                if (pageAll == 1) { // 只有1页的时候，不能翻页
                    return;
                }
                _blur();
                _focusBtn();
            }
        } else {
            if (_position > 9) {
                _blur();
                _focusBtn();
            } else {
                _position += 5;
                _movingTo();
            }
        }
    }

    function _left() {
        if (_position == 0) {
            return;
        } else {
            _position -= 1;
            _movingTo();
        }
    }

    function _right() {
        if (_position >= _data.length - _startIndex - 1 || _position == 14) {
            return;
        } else {
            _position += 1;
            _movingTo();
        }
    }

    function _renderBtn() { // 渲染翻页按钮
        var num = _data.length > 0 ? (Math.floor(_startIndex / _elLen) + 1) : 0;
        var count = Math.ceil(_data.length / _elLen);
        if (num == 0) {
            $$('#pageUpBtn').css('color', '#7a7474');
            $$('#pageDownBtn').css('color', '#7a7474');
        } else if (num == 1 && count == 1) { // 只有一页
            $$('#pageUpBtn').css('display', 'none');
            $$('#pageDownBtn').css('display', 'none');
            $$('#pageNumBox').css('display', 'none');
        } else if (num > 1 && num >= count) { // 最后一页
            $$('#pageUpBtn').css('color', 'white');
            $$('#pageDownBtn').css('color', '#7a7474');
        } else if (num == 1 && num < count) { // 第一页
            $$('#pageUpBtn').css('color', '#7a7474');
            $$('#pageDownBtn').css('color', 'white');
        } else if (num > 1 && num < count) { // 中间页
            $$('#pageUpBtn').css('color', 'white');
            $$('#pageDownBtn').css('color', 'white');
        } else {
            $$('#pageUpBtn').css('color', '#7a7474');
            $$('#pageDownBtn').css('color', '#7a7474');
        }
    }

    function _focusBtn() { // 从推荐位按下定焦到翻页按钮
        var num = _data.length > 0 ? (Math.floor(_startIndex / _elLen) + 1) : 0;
        var count = Math.ceil(_data.length / _elLen);
        if (num == 0) {
            return;
        } else if (num == 1 && num == count) {
            return;
        } else if (num > 1 && num < count) {
            _currBtn = _currBtn || 'pageDownBtn';
            $$.focusTo(_currBtn);
        } else if (num > 1 && num >= count) {
            $$.focusTo('pageUpBtn');
        } else if (num == 1) {
            $$.focusTo('pageDownBtn');
        }
    }

    function _chooseBtn() { // 翻页按钮切换
        var num = _data.length > 0 ? (Math.floor(_startIndex / _elLen) + 1) : 0;
        var count = Math.ceil(_data.length / _elLen);
        var btn = ACTIVE_OBJECT.key;
        if (btn == 'pageUpBtn' && num > 1 && num < count) { // 处于中间页
            $$.focusTo('pageDownBtn');
            _currBtn = 'pageDownBtn';
        } else if (btn == 'pageDownBtn' && num > 1 && num < count) { // 处于中间页
            $$.focusTo('pageUpBtn');
            _currBtn = 'pageUpBtn';
        } else if (btn == 'pageUpBtn' && num > 1 && num >= count) { // 处于最后页
            return;
        } else if (btn == 'pageDownBtn' && num == 1) { // 处于第一页
            return;
        }
    }

    function _isJumpBtn() {
        var btn = ACTIVE_OBJECT && ACTIVE_OBJECT.key || '';
        var num = _data.length > 0 ? (Math.floor(_startIndex / _elLen) + 1) : 0;
        var count = Math.ceil(_data.length / _elLen);
        if (btn == 'pageDownBtn' && num > 1 && num >= count) {
            _renderBtn(); // 处于最后一页，按钮状态
            $$.focusTo('pageUpBtn');
        } else if (btn == 'pageUpBtn' && num == 1) {
            _renderBtn(); // 处于第一页，按钮状态
            $$.focusTo('pageDownBtn');
        } else {
            _renderBtn(); // 处于中间页，按钮状态
        }
    }

    function _pageUp() {
        if (_startIndex == 0) {

        } else {
            _startIndex -= _elLen;
            _render();
            _pageNum();
        }
        _position = 0;
    }

    function _pageDown() {
        var pageSize = Math.ceil(_data.length / _elLen);
        if (_startIndex + _elLen >= pageSize * _elLen) {
            return;
        } else {
            _startIndex += _elLen;
            _render();
            _pageNum();
        }
        _position = 0;
    }

    function _ok() {
        savePageInfo(_position, _startIndex);
        var teamDetailUrl = _data.slice(_startIndex)[_position]['contentUri'];
        var baseUrl = '../';
        var resultUrl = baseUrl + teamDetailUrl;
        $$.forward(resultUrl);
    }

    function _pageNum() {
        var num = _data.length > 0 ? (Math.floor(_startIndex / _elLen) + 1) : 0;
        $$('#pageNum').html(num);
        _isJumpBtn();
    }

    function _pageSize() {
        var count = Math.ceil(_data.length / _elLen);
        $$('#pageSize').html(count);
    }

    function _getDataLen() {
        return _data.length;
    }
    return {
        init: _load,
        enter: _enter,
        getDataLen: _getDataLen
    }
})();