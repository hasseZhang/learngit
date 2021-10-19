window.PAGE_INFO = [];
var ACTIVE_OBJECT;
var savedData = {
    "focus": 'btn1',
    "position": '',
    "startIndex": '',
    "index": ''
};
var pageName = 'teamDetail';
var recommendId = { // 导读
    id: window.G_GUIDEID['public']['teamImg'],
    program_id: window.G_GUIDEID['public']['allProgram']
};
var parms_teamId = $$.search.get('teamId'); // url参数teamID
function initPage() {
    $.recodeData(pageName, "access");
    savedData = $.UTIL.merge(savedData, $.getGlobalData(pageName));
    $.saveGlobalData(pageName);
    TEAM_DETAIL.init();
    $$.focusTo('btn1');
}

function savePageInfo(obj) {
    obj = obj || {};
    $.savePageInfo(pageName, {
        "focus": ACTIVE_OBJECT.key,
        "position": obj.position || 0,
        "startIndex": obj.startIndex || 0,
        "index": obj.index || 0
    });
}
var TEAM_DETAIL = (function() {
    var _data = [];
    var _picData = [];
    var _programData = [];
    var _programArr = [];
    var _startIndex = 0;
    var _position = 0;
    var _index = 1;
    var _elLen = 5;
    var _currBtn;

    function _load() {
        var id = recommendId['id'];
        var program_id = recommendId['program_id'];
        $$.loader4GuidanceContents(program_id, { // 获取节目单
            success: function(data) {
                _programData = data;
                $$.loader4GuidanceContents(id, {
                    success: function(data) {
                        _picData = data;
			for (var i = 0, len = data.length; i < len; i++) {
                            var pics = data[i]['pics'] || '';
                            if (data[i]['contentUri'] == '0') {
                                var logoPath = $$.getPic(pics, [0]);
                                _renderLogo(logoPath);
                            }
                            if (data[i]['contentUri'] == parms_teamId) {
                                var picPath105 = $$.getPic(pics, [105]);
                                _renderImg(picPath105);
                            }
                        }
                        window.G_LOAD({
                            type: 'teamInfo',
                            data: 'teamId=' + parms_teamId,
                            success: function(data) {
                                _data = data.data;
                                _position = savedData['position'] || 0;
                                _startIndex = savedData['startIndex'] || 0;
                                _index = savedData['index'] || 1;
                                var key = savedData['focus'];
                                // 处理URL跳转
                                if($.search.append(document.referrer.replace('?POSITIVE', '')).indexOf('LQZQ') > -1) {
                                    $.saveGlobalData('teamDetailBack', $.search.append(document.referrer.replace('?POSITIVE', '')));
                                }
                                _render();
                                _isShowPageBtn();
                                _joinObj();
                                _pageNum();
                                _pageSize();
                                _renderBtn();
                                // _renderListBtn();
                                key ? _moveTo() : '';
                            }
                        });
                        for (var i = 0, len = data.length; i < len; i++) {
                            var pics = data[i]['pics'] || '';
                            if (data[i]['contentUri'] == '0') {
                                var logoPath = $$.getPic(pics, [0]);
                                _renderLogo(logoPath);
                            }
                            if (data[i]['contentUri'] == parms_teamId) {
                                var picPath105 = $$.getPic(pics, [105]);
                                _renderImg(picPath105);
                            }
                        }
                    }
                });
            }
        });

    }

    function _renderListBtn(j) {
        var index = _startIndex + j;
        var scheduleID = _data[index]['scheduleID'];
        if (_programData.length == 0) {
            $$('#btn' + j + '_3').css('color', 'rgb(122, 116, 116)');
        }
        for (var i = 0, len = _programData.length; i < len; i++) {
            var id = _programData[i]['contentName'].split('@')[0];
            var qc = _programData[i]['contentName'].split('@')[1];
            if (scheduleID == id) {
                if (qc == 2) {
                    $$('#btn' + j + '_3').attr('toFlag', '1');
                    $$('#btn' + j + '_3').css('color', 'white');
                    break;
                }
            } else {
                $$('#btn' + j + '_3').attr('toFlag', '0');
                $$('#btn' + j + '_3').css('color', 'rgb(122, 116, 116)');
            }
        }
        // 判断集锦按钮
        // $$('#btn' + i + '_1 img')[0].src = 'images/qc.png';
        // $$('#btn' + i + '_2 img')[0].src = 'images/tj.png';
        // $$('#btn' + i + '_3 img')[0].src = 'images/jj.png';
    }

    function _renderLogo(p) {
        $$('#logo').css('background', 'url("' + p + '") no-repeat');
    }

    function _renderImg(p3) {
        $$('body').css('background', 'url("' + p3 + '") no-repeat');
    }

    function _renderTeamIcon(d, index) { // 渲染表格球队logo
        var homeTeamId = d['homeTeamID'];
        var visitingTeamID = d['visitingTeamID'];
        for (var i = 0, len = _picData.length; i < len; i++) {
            var pics = _picData[i]['pics'] || '';
            var id = _picData[i]['contentUri'];
            if (homeTeamId == id) {
                var pic = $$.getPic(pics, [106]) || '';
                var homeName = _picData[i]['contentName'];
                $$('#c' + index + '_1 img')[0].src = pic;
                $$('#c' + index + '_1 span').html(homeName);
            }
            if (visitingTeamID == id) {
                var pic2 = $$.getPic(pics, [106]) || '';
                var visitingName = _picData[i]['contentName'];
                $$('#c' + index + '_2 img')[0].src = pic2;
                $$('#c' + index + '_2 span').html(visitingName);
            }
        }
    }

    function _render() {
        var data = _data.slice(_startIndex);
        for (var i = 0; i < 5; i++) {
            if (i < data.length) {
                var date = data[i]['date'].split('-');
                var dateTime = date[1] + '月' + date[2] + '日' + ' ' + data[i]['time'];
                var title = $$.substringElLength(data[i]['scheduleTypeRound'], '19px', '143px').last;
                var homeTeamName = $$.substringElLength(data[i]['homeTeamName'], '19px', '100px').last;
                var visitingTeamName = $$.substringElLength(data[i]['visitingTeamName'], '19px', '100px').last;
                $$('#l' + i).removeClass('none');
                $$('#l' + i + ' .time').html(dateTime);
                $$('#l' + i + ' .title').html(title);
                // $$('#c' + i + '_1 span').html(homeTeamName);
                $$('#l' + i + ' .scord').html(data[i]['pointsVs']);
                // $$('#c' + i + '_2 span').html(visitingTeamName);
                _renderTeamIcon(data[i], i);
                _renderListBtn(i);
            } else {
                $$('#l' + i).addClass('none');
                // $$('#l' + i + ' .time').html('');
                // $$('#l' + i + ' .title').html('');
                // $$('#c' + i + '_1 .span').html('');
                // $$('#l' + i + ' .scord').html('');
                // $$('#c' + i + '_2 .span').html('');
                // $$('#btn' + i + '_1 img')[0].src = '';
                // $$('#btn' + i + '_2 img')[0].src = '';
                // $$('#btn' + i + '_3 img')[0].src = '';
            }
        }
    }

    function _joinObj() {
        var out = [
            { key: 'pageUpBtn', pressUp: _enter, pressDown: '', pressLeft: '', pressRight: _chooseBtn, pressOk: _pageUp, pressBack: _back },
            { key: 'pageDownBtn', pressUp: _enter, pressDown: '', pressLeft: _chooseBtn, pressRight: '', pressOk: _pageDown, pressBack: _back }
        ];
        for (var i = 0; i < 5; i++) {
            for (var j = 1; j < 4; j++) {
                out.push({
                    key: 'btn' + i + '_' + j,
                    pressUp: _up,
                    pressDown: _down,
                    pressLeft: _left,
                    pressRight: _right,
                    pressOk: _ok,
                    pressBack: _back
                })
            }
        }
        PAGE_INFO = PAGE_INFO.concat(out);
    }

    function _enter() {
        if(_position < 4){
            _position = 4;
        }
        if (_startIndex + _position > _data.length - 1) {
            _position = parseInt(_data.length - _startIndex - 1);
        }
        _moveTo();
    }

    function _moveTo() {
        $$.focusTo('btn' + _position + '_' + _index);
    }

    function _up() {
        if (_position == 0) {
            return;
        } else {
            _position -= 1;
            var elCss = $$('#btn' + _position + '_' + _index).attr('toFlag');
            if (elCss == '0') {
                _index = 2;
            }
            _moveTo();
        }
    }

    function _down() {
        var pageCount = _data.length - _startIndex - 1;
        if (_position >= 4 || _position >= pageCount) {
            _focusBtn();
        } else {
            _position += 1;
            var elCss = $$('#btn' + _position + '_' + _index).attr('toFlag');
            if (elCss == '0') {
                _index = 2;
            }
            _moveTo();
        }
    }

    function _left() {
        if (_index == 1) {
            return;
        } else {
            _index -= 1;
            _moveTo();
        }
    }

    function _right() {
        if (_index == 3) {
            return;
        } else {
            _index += 1;
            var elCss = $$('#btn' + _position + '_' + _index).attr('toFlag');
            if (elCss == '0') {
                _index -= 1;
                return;
            }
            _moveTo();
        }
    }

    function _back() {
        window.location.href = $.getGlobalData('teamDetailBack');
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
        var btn = ACTIVE_OBJECT == undefined ? '' : ACTIVE_OBJECT.key;
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


    function _ok() {
        var index = _startIndex + _position;
        var scheduleID = _data[index]['scheduleID'];
        var content1Id, content2Id;
        for (var i = 0, len = _programData.length; i < len; i++) {
            var id = _programData[i]['contentName'].split('@')[0];
            var qc = _programData[i]['contentName'].split('@')[1];
            if (scheduleID == id) {
                if (qc == 2) {
                    content2Id = _programData[i]['contentId'];
                    content2Name =  _programData[i]['contentDescription'];
                } else if (qc == 1) {
                    content1Id = _programData[i]['contentId'];
                    content1Name =  _programData[i]['contentDescription'];
                }
            }
        }
        var url = '../' + 'battleData/?scheduleID=' + _data.slice(_startIndex)[_position]['scheduleID'];
        savePageInfo({
            "position": _position,
            "startIndex": _startIndex,
            "index": _index
        });
        if (_index == 1) {
            if(content1Id){
                $$.loader4DetailPageJs(content1Id, {
                    success:function(data) {
                        $.gotoDetail({
                            contentType: '7',
                            url: 'playControl/baseVod.html?contentId=' + content1Id + '&vl='+ recommendId.program_id +'&categoryId='+  recommendId.program_id + '&ztCategoryId&multiVod=false&mediaType=1&contentName=' + data.vodName
                        })
                    }
                })
            }
        } else if (_index == 2) {
            $.forward(url);
        } else {
            if(content2Id){
                $$.loader4DetailPageJs(content2Id, {
                    success:function(data) {
                        $.gotoDetail({
                            contentType: '7',
                            url: 'playControl/baseVod.html?contentId=' + content2Id + '&vl='+ recommendId.program_id +'&categoryId='+  recommendId.program_id + '&ztCategoryId&multiVod=false&mediaType=1&contentName=' + data.vodName
                        })
                    }
                })
            }
        }
    }

    function _clearSavedData() {
        savedData = {
            "focus": '',
            "position": '',
            "startIndex": '',
            "index": ''
        }
    }

    function _pageUp() {
        if (_startIndex == 0) {
            return;
        } else {
            _startIndex -= 5;
            _pageNum();
            _render();
        }
    }

    function _pageDown() {
        var pageSize = Math.ceil(_data.length / 5);
        if (_startIndex + 5 >= pageSize * 5) {
            return;
        } else {
            _startIndex += 5;
            _pageNum();
            _render();
        }
    }

    function _isShowPageBtn() {
        if (_data.length == 0 || _data.length == 5) {
            $$('#controlPage').addClass('none');
        } else {
            $$('#controlPage').removeClass('none');
        }
    }

    function _pageNum() {
        _clearSavedData();
        var num = _data.length > 0 ? (Math.floor(_startIndex / 5) + 1) : 0;
        $$('#pageNum').html(num);
        _isJumpBtn();
    }

    function _pageSize() {
        var count = Math.ceil(_data.length / 5);
        $$('#pageSize').html(count);
    }
    return {
        init: _load,
        enter: _enter
    }
})();

// 在屏幕上打log，用于不支持alert confirm的情况
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
        test_log.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        document.body.appendChild(test_log);
        test_log.innerHTML = msg;
    }
}