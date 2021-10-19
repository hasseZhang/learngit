window.PAGE_INFO = [];
var ACTIVE_OBJECT;
var savedData = {};
var pageName = 'planPage';
var recommendId = { // 导读
    id: window.G_GUIDEID['plan']['content'],
    fourscreen_id: window.G_GUIDEID['fourScreen']['content']
};
var menu;

function initPage() {
    $.recodeData(pageName, "access");
    $.initPage();
    savedData = $.getGlobalData(pageName);
    $.saveGlobalData(pageName);
    window.G_AUTH({ // 鉴权
        success: function(result) {
            window.AUTH_FLAG = result;
        }
    }); // 鉴权
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
}

function savePageInfo(p, s) {
    $.savePageInfo(pageName, {
        "focus": ACTIVE_OBJECT.key,
        "position": p,
        "startIndex": s
    })
}
var CONTENT_BOX = (function() {
    var _startIndex = 0;
    var _position = 0;
    var _data = [];
    var _id = 0;
    var _elLen = 6;
    var _colLen = 3;
    var _currBtn = '';

    function _load() {
        _id = recommendId['id'];
        $$.loader4GuidanceContents(_id, {
            success: function(data) {
                for (var i = 0; i < data.length; i++) {
                    var type = data[i]['contentType'];
                    var channelType = data[i]['contentUri'].indexOf('channel://~'); // 直播频道
                    if (type == '3' && channelType != -1) { // url绑定的直播频道
                        var vipFlag = data[i]['contentUri'].indexOf('#'); // 有#号为免费
                        data[i]['vipFlag'] = (vipFlag != -1 ? 0 : 1);
                    }
                }
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
                key ? $$.focusTo(key) : '';
            }
        });
    }

    function _isHaveData(data) {
        if (data.length == 0) {
            $$('.allModel').addClass('none');
            $$('#noData').removeClass('none');
        } else {
            $$('.allModel').removeClass('none');
            $$('#noData').addClass('none');
        }
    }

    function _joinPage() {
        var out = [
            { key: 'pageUpBtn', pressUp: _enter, pressDown: '', pressLeft: '', pressRight: _chooseBtn, pressOk: _pageUp, pressBack: _pressBack },
            { key: 'pageDownBtn', pressUp: _enter, pressDown: '', pressLeft: _chooseBtn, pressRight: '', pressOk: _pageDown, pressBack: _pressBack }
        ];
        for (var i = 0; i < _elLen; i++) {
            out.push({
                key: 'page' + i,
                pressUp: _up,
                pressDown: _down,
                pressLeft: _left,
                pressRight: _right,
                pressOk: _ok,
                pressBack: _pressBack
            })
        }
        PAGE_INFO = PAGE_INFO.concat(out);
    }

    function _render() {
        var data = _data.slice(_startIndex, _startIndex + 6);
        for (var i = 0; i < _elLen; i++) {
            if (i < data.length) {
                var pics = data[i]['pics'] || '';
                var picPath = $$.getPic(pics, [0]);
                var name = data[i]['contentName'];
                var subStr_name = $$.substringElLength(name, '20px', '368px').last;
                picPath = picPath ? picPath : 'images/plan_default.jpg';
                name == '0' || name == undefined ? $$('#page' + i + ' .r-text').addClass('none') : '';
                $$('#page' + i).removeClass('none');
                $$('#page' + i + ' .r-text').html(subStr_name);
                $$('#page' + i + ' img')[0].src = picPath;
            } else {
                $$('#page' + i).addClass('none');
                $$('#page' + i + ' .r-text').html('');
                $$('#page' + i + ' img')[0].src = 'a';
            }
        }
    }

    function _movingTo() {
        $$.focusTo('page' + _position);
        var name = _data[_startIndex + _position]['contentName'];
        var flag = $$.substringElLength(name, '20px', '368px').flag;
        var key = ACTIVE_OBJECT.key;
        flag ? $$.Marquee({ el: $$('#' + key + ' .r-text')[0], all: name, width: '368px', height: '38px' }) : '';
    }

    function _up() {
        if (_position < _colLen) {
            menu.enter();
        } else {
            _position -= _colLen;
            _movingTo();
        }
    }

    function _down() {
        if ((_position >= _colLen || _position + _colLen > _data.length - _startIndex - 1) && _data.length > 6) { // 跳转翻页按钮
            _focusBtn();
        } else {
            if (_colLen < _data.length && _data.length <= _elLen && (_position + _colLen) + 1 > _data.length && _position <= 2) { // 小于一页
                _position = _data.length - 1;
            } else if (_data.length <= _colLen || (_data.length <= _elLen && _position > 2)) { // 只有一行
                return;
            } else {
                _position += _colLen;
            }
            _movingTo();
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
        if (_data.length <= 6 && _position + 1 >= _data.length) { // 不够一页的最后一个
            return;
        } else {
            if (_position == 5 || _position == (_data.length - _startIndex - 1)) {
                return;
            } else {
                _position += 1;
                _movingTo();
            }
        }
    }

    function _ok() {
        savePageInfo(_position, _startIndex);
        var contentObj = _data.slice(_startIndex)[_position];
        var livePlayer = null;

        if (AUTH_FLAG == 0 && contentObj['vipFlag'] != 0) {
            $.auth.forwardOrder();
        } else {
            var objUrl = contentObj.url || contentObj.contentUri || contentObj.contentUrl || "";
            if(contentObj['contentType'] == 3) {
                if(contentObj['contentUri'] == 'multiplePerspectives') {
                    // if(AUTH_FLAG == 0) {
                    //     $.auth.forwardOrder();
                    // } else {
                    //     // $.forward('../fourScreen/index.html');
                    //     // location.href = '../fourScreen/index.html';
                    //     $.gotoDetail({
                    //         contentType: '7',
                    //         url: 'activitiesZone/LQZQ/fourScreen/index.html'
                    //     }, false, savedData)
                    // }
                    $$.loader4GuidanceContents(recommendId.fourscreen_id , {
                        success: function(data) {
                            var flag = true;
                            for(var i = 0; i < data.length; i++) {
                                if(data[i]['contentUri'].indexOf('#') === -1) {
                                    flag = false;
                                    break;
                                }
                            }
                            if(AUTH_FLAG == 1){
                                flag = true;
                            }
                            flag ? location.href = '../fourScreen/index.html?from=plan' : $.auth.forwardOrder();
                        }
                    })
                    return true;
                } else {
                    contentObj.contentType = "7";
                    contentObj.channelNum = objUrl;
                }
            }
            if (contentObj['contentType'] == '5') {
                $.gotoDetail({
                    contentType: contentObj['contentType'],
                    channelNum: '~' + contentObj['channelNum'],
                }, false, savedData);
            } else if (contentObj['contentType'] == '0') {
                $.gotoDetail({
                    contentType: '7',
                    url: 'playControl/baseVod.html?contentId=' + contentObj['contentId'] + '&vl='+ _id +'&categoryId='+  _id + '&ztCategoryId&multiVod=false&mediaType=1&contentName=' + contentObj['contentName']
                })
            } else {
                $.gotoDetail(contentObj, false, savedData);
            }
        }
    }

    function _enter() {
        if (_startIndex + _position > _data.length - 1) {
            _position = 0;
        }
        _movingTo();
    }

    function _pressBack() {
        var key = ACTIVE_OBJECT.key;
        if (key.indexOf('nav') == -1) {
            _position = 0;
            menu.enter();
        } else {
            menu.index = 0;
            menu.moveTo();
            menu.jumpUrl();
        }
        return true;
    }

    function _renderBtn() { // 渲染翻页按钮
        var num = _data.length > 0 ? (Math.floor(_startIndex / _elLen) + 1) : 0;
        var count = Math.ceil(_data.length / _elLen);
        if (num == 0) {
            $$('#pageUpBtn').css('color', '#7a7474');
            $$('#pageDownBtn').css('color', '#7a7474');
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
        var btn = ACTIVE_OBJECT != undefined ? ACTIVE_OBJECT.key : '';
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
    }

    function _pageNum() {
        if (_data.length <= 6) {
            $$('#pageUpBtn').addClass('none');
            $$('#pageDownBtn').addClass('none');
            $$('#pageNumBox').addClass('none');
        } else {
            $$('#pageUpBtn').removeClass('none');
            $$('#pageDownBtn').removeClass('none');
            $$('#pageNumBox').removeClass('none');
            var num = _data.length > 0 ? (Math.floor(_startIndex / _elLen) + 1) : 0;
            $$('#pageNum').html(num);
            _isJumpBtn();
        }

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

function _test(msg) {
    if(typeof msg == 'object') {
        msg = JSON.stringify(msg,  function(key, val) {
            if (typeof val === 'function') {
              return val + '';
            }
            return val;
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