function reserveCallback() {};
window.PAGE_INFO = [];
var PAGE_LEFT = [];
var pageName = 'local2';
var ACTIVE_OBJECT;
var savedData = {};
var guidanceId = 1;
var table, menu, type, teamId;

var isAuth = false;
var throttle = false;
var reservation = [];

function initPage() {
    $.recodeData(pageName, "access");
    savedData = $.getGlobalData(pageName) || {};
    $.saveGlobalData(pageName);
    window.G_AUTH({
        success: function(result) {
            // window.AUTH_FLAG = result;
            window.AUTH_FLAG = 1;
            isAuth = AUTH_FLAG;
            authInit();
        }
    });
}

function backPage() {
    var key = ACTIVE_OBJECT.key;
    if (key.indexOf('nav') == -1) {
        if (key.indexOf('next') != -1 || key.indexOf('prev') != -1) {
            $$('#' + ACTIVE_OBJECT.key).removeClass(ACTIVE_OBJECT.key + '_F');
        } else {
            focusState();
        }
        // 返回到导航
        menu.enter();

    } else {
        // 返回到首页
        menu.index = 0;
        menu.moveTo();
        menu.jumpUrl();
    }
    return true;
}

function call(data) {}

function authInit() {
    if (AUTH_FLAG == 0) { // 鉴权未通过
        $$('#container').css('display', 'none');
        authMsg = window.G_MSG({
            type: 'else',
            msgType: '4',
            backFocus: function() {
                // var url = '../home/?POSITIVE';
                // $$.redirect(url);
                var key = ACTIVE_OBJECT.key;
                if (key.indexOf('nav') == -1) {
                    // 返回到导航
                    menu.enter();
                }
            },
            saveMsgFocus: function() {
                savePageInfo();
            },
            upTo: function() {
                menu.enter();
                return true;
            }
        });
        authMsg.init();
        menu = window.MENU({
            pressDown: function() {
                var data = LEFT_LIST.getData();
                if (data.length == 0) {
                    this.blur();
                    authMsg.enter();
                } else {
                    return;
                }
            }
        });
        menu.init();
        menu.enter();
    } else { // 鉴权通过
        $$('#container').css('display', 'block');
        menu = window.MENU({
            pressDown: function() {
                var data = LEFT_LIST.getData();
                if (data.length != 0) {
                    this.blur();
                    LEFT_LIST.enter();
                } else {
                    return;
                }
            }
        });
        menu.init();
        queryAllReservation();
    }

}

function queryAllReservation() {
    query_all_reservation('queryReserver');
}

function queryReserver(data) {
    if (window.location.href.indexOf('POSITIVE') == -1 && savedData['focus'] == '' && ACTIVE_OBJECT == undefined) {
        menu.enter();
    }
    reservation = data.data ? data.data : [];
    if (savedData['focus'] || PAGE_LEFT.length == 0) {
        LEFT_LIST.init();
    } else {
        LEFT_LIST.trans();

    }
}

function savePageInfo(opt) {
    $.savePageInfo(pageName, {
        'focus': opt.focus == '' ? opt.focus : ACTIVE_OBJECT.key,
        'position': opt._position || 0,
        'index': opt._index || 0,
        'pageIndex': opt._pageIndex || 0
    });
}

function focusStyle() {
    var list = document.querySelectorAll('.d');
    var reg = /tvod_F|tvod_|whole_F|whole_|info_F|info_|order_F|order_|block/g;
    for (var i = 0; i < list.length; i++) {
        var classList = $$(list[i]).attr('class');
        if (reg.test(classList)) {
            classList = classList.replace(reg, '')
            $$(list[i]).attr('class', classList)
        }
    }
    var s = document.querySelectorAll('.rows');
    for (var i = 0; i < s.length; i++) {
        $$(s[i]).addClass('nones');
    }
}
// 当前按钮显示样式
function focusState(currFocus) {
    var focus = {
        '1': 'whole',
        '2': 'info',
        '3': 'tvod',
        '4': 'order',
    }
    if (typeof currFocus != 'undefined') {
        var i = currFocus.slice(-1);
        if (ACTIVE_OBJECT.key == 'next') {
            if (currFocus.indexOf('next') != -1) {
                $$('#' + ACTIVE_OBJECT.key).addClass('next_F');
            } else {
                $$('#' + ACTIVE_OBJECT.key).removeClass('next_F');
            }
        } else if (ACTIVE_OBJECT.key == 'prev') {
            if (currFocus.indexOf('prev') != -1) {
                $$('#' + ACTIVE_OBJECT.key).addClass('prev_F');
            } else {
                $$('#' + ACTIVE_OBJECT.key).removeClass('prev_F');
            }
        } else if (/list/.test(currFocus)) { // 移向左侧列表
            $$('#' + currFocus).removeClass('left');
            if (ACTIVE_OBJECT.args) {
                $$('#' + ACTIVE_OBJECT.key).removeClass(focus[ACTIVE_OBJECT.args[2]] + '_F')
            }
            return;
        } else if (/list/.test(ACTIVE_OBJECT.key)) { // 当前焦点在左侧列表
            $$('#' + ACTIVE_OBJECT.key).addClass('left');
        } else if (ACTIVE_OBJECT.key == 'close') {
            $$('#' + currFocus).addClass(currFocus + '_F');
        } else {
            $$('#' + ACTIVE_OBJECT.key).removeClass(focus[ACTIVE_OBJECT.args[2]] + '_F');
        }
        if (currFocus == 'next' || currFocus == 'prev') {
            $$('#' + currFocus).addClass(currFocus + '_F');
        } else {
            $$('#' + currFocus).addClass(focus[i] + '_F');
        }
    } else {
        if (currFocus == 'server') {
            $$('#' + ACTIVE_OBJECT.key).removeClass(focus[ACTIVE_OBJECT.args[2]] + '_F');
        } else {
            $$('#' + ACTIVE_OBJECT.key).removeClass(focus[ACTIVE_OBJECT.args[2]] + '_F');
        }
    }

}
var previous = 0;
var betterFn = function(fn, wait) {
    new Throttle(fn, wait)();

    function Throttle(fn, wait) {
        return function(e) {
            var now = +new Date();
            if (now - previous > wait) {
                previous = now;
                fn.apply(this, e);
            }
        }
    };
};
var LEFT_LIST = (function() {

    var _listId = G_GUIDEID.local2.left; // 左侧列表ID
    var _data = [];
    var _position = 0;
    var _dataLen = 0;
    var _saveData = {
        _position: _position,
    };
    // 全部数据
    function _loadData() {
        $$.loader4GuidanceContents(_listId, {
            success: function(data) {
                _dataLen = data.length;
                for (var i = 0; i < _dataLen; i++) {
                    if (data[i].contentName != '0') {
                        _data.push(data[i]);
                    }
                }
                if (_dataLen == 0 || _data.length == 0) {
                    $$('.no').removeClass('nones');
                    $$('.sidebar').removeClass('sidebarBg');
                    return;
                } else {
                    _dataLen = _data.length;
                    $$('.no').addClass('nones');
                    $$('.sidebar').addClass('sidebarBg');
                    _trans();
                    _render();
                }
            },
            loading: function() {},
            error: function(err) {}
        });
    }

    function _init() {
        _position = savedData['position'] ? savedData['position'] : 0;
        _loadData();
    }

    function _trans() {
        type = $$.search.get('type', _data[_position].contentUri);
        teamId = $$.search.get('teamId', _data[_position].contentUri);
        guidanceId = _data[_position].contentUri.split('?')[0];
        if (type == 'match') { //guidanceList[1] == guidanceId
            $$('.main1').css('display', 'none');
            $$('.main2').css('display', 'inline-block');
            RIGHT_LIST.init();
        } else {
            $$('.noData').addClass('nones');
            $$('.main2').css('display', 'none');
            $$('.main1').css('display', 'inline-block');
            RIGHT_LIST_T.init();
        }
    }

    function _render() {
        PAGE_LEFT = [];
        var out = [];
        var arr = [];
        var html = $$('.sidebar');
        for (var i = 0; i < _dataLen; i++) {
            arr.push('<li id="list_' + (i + 1) + '" class="list list' + (i + 1) + '">' + _data[i].contentName + '</li>')
            out.push({
                key: 'list_' + (i + 1),
                pressUp: _up,
                pressDown: _down,
                pressLeft: _left,
                pressRight: _right,
                pressOk: function() {},
                args: [],
                pressBack: backPage
            });
        }
        $$(html).html(arr.join(''));
        if (savedData['focus']) {
            $$('#list_' + (_position + 1)).addClass('left');
        }
        PAGE_INFO = PAGE_INFO.concat(out);
        PAGE_LEFT = PAGE_INFO.slice(0, PAGE_INFO.length);
    }

    function _enter() {
        var key = 'list_' + (_position + 1);
        focusState(key);
        $$.focusTo(key);
    }

    function _up() {
        betterFn(function() {
            if (_position == 0) {
                menu.enter();
                return;
            };
            _position--;
            RIGHT_LIST.save({ '_position': _position });
            savedData['focus'] = '';
            $$.focusTo('list_' + (_position + 1));
            if ($$.search.get('type', _data[_position].contentUri) == 'match') {
                queryAllReservation();
            } else {
                _trans();
            }
            throttle = false;
        }, 3e2);
    }

    function _down() {
        betterFn(function() {
            if (_position == (_dataLen - 1)) return;
            _position++;
            RIGHT_LIST.save({ '_position': _position });
            savedData['focus'] = '';
            if ($$.search.get('type', _data[_position].contentUri) == 'match') {
                queryAllReservation();
            } else {
                _trans();
            }
            $$.focusTo('list_' + (_position + 1));
            throttle = false;
        }, 3e2);
    }

    function _left() {}

    function _right() {
        if (!throttle) return;
        if (type == 'match') { //guidanceList[1] == guidanceId
            RIGHT_LIST.save({ '_position': _position });
            RIGHT_LIST.enter();
        } else {
            RIGHT_LIST_T.save({ '_position': _position });
            $$('#' + ACTIVE_OBJECT.key).addClass('left');
            table.enter();
        }
    }

    function _getData() {
        return _data;
    }
    return {
        init: _init,
        trans: _trans,
        getData: _getData,
        enter: _enter
    }
})()

var RIGHT_LIST = (function() {
    var _index = 0;
    var _data = [];
    var _dataLen = 0;
    var _pageNum = 1;
    var _pageIndex = 0;
    var matchIdArr = [];
    var prevKey = "";
    var _id = '';
    var _saveData = {
        '_index': _index,
        '_pageIndex': _pageIndex,
        "_position": 0
    };
    var _matchGuidanceId = '';
    var _teamGuidanceId = G_GUIDEID.public.teamImg;
    var _allMatchGuidanceId = G_GUIDEID.public.allProgram;
    var _matchData = [];
    var _teamsData = [];
    var arr = []; // 焦点数据
    var out = [];
    var PAGE_BTN = [];
    var close_btn = [];
    var reorganizingData = []; // 重组数据
    var is = false; // 是否有重复预约
    // 重组数据
    function _reorganizingData(ds) {
        reorganizingData = []; // 重组数据
        var dataLen = _data.length;
        var matchLen = ds.length;
        for (var i = 0; i < matchLen; i++) {
            var obj = {};
            var _matchId = $$.search.get('schuId', ds[i].contentUri); // 当前赛事
            var _hTeamId = $$.search.get('ourTeamId', ds[i].contentUri);
            var _vTeamId = $$.search.get('otherTeamId', ds[i].contentUri);
            var _startTime = $$.search.get('startTime', ds[i].contentUri);
            var _endTime = $$.search.get('endTime', ds[i].contentUri);
            var _vipFlag = ds[i].contentUri.indexOf('#') != -1 ? 0 : 1;
            obj.titleName = ds[i].contentName;
            obj.contentUri = ds[i].contentUri;
            obj.startTime = _startTime;
            obj.endTime = _endTime;
            var vipArr = [];
            for (var j = 0; j < dataLen; j++) {
                var c = {};
                var matchId = _data[j].contentName.split('@')[0];
                var type = _data[j].contentName.split('@')[1];
                if (matchId == _matchId) {
                    if (type == 1) {
                        c.channelNum = _data[j].channelNum;
                        c.contentType = _data[j].contentType;
                        c.contentName = _data[j].contentDescription;
                        c.pics = _data[j].pics;
                        if (c.contentType == '5') {
                            c.vipFlag = _vipFlag;
                        } else {
                            c.vipFlag = _data[j].vipFlag;
                        }
                        c.matchId = matchId;
                        c.vodContentUri = _data[j].contentUri;
                        c.contentId = _data[j].contentId;
                        vipArr[0] = c;
                    }
                    if (type == 2) {
                        c.channelNum = _data[j].channelNum;
                        c.contentType = _data[j].contentType;
                        c.contentName = _data[j].contentDescription;
                        c.pics = _data[j].pics;
                        if (c.contentType == '5') {
                            c.vipFlag = _vipFlag;
                        } else {
                            c.vipFlag = _data[j].vipFlag;
                        }
                        c.matchId = matchId;
                        c.vodContentUri = _data[j].contentUri;
                        c.contentId = _data[j].contentId;
                        vipArr[1] = c;
                    }
                }
            }
            obj.isvip = vipArr;
            for (var o = 0; o < _teamsData.length; o++) {
                var _teamId = _teamsData[o].contentUri;
                var log = $$.getPic(_teamsData[o].pics, [106]);
                if (_teamId && _teamId == _hTeamId) {
                    obj.hteamName = _teamsData[o].contentName;
                    obj.hteamLogo = log;
                }
                if (_teamId && _teamId == _vTeamId) {
                    obj.vteamName = _teamsData[o].contentName;
                    obj.vteamLogo = log;
                }
            }
            reorganizingData.push(obj);
        }

        return reorganizingData;
    }
    // 获取节目单数据 跳转使用
    function _loadData() {
        $$.loader4GuidanceContents(_allMatchGuidanceId, {
            success: function(data) {
                _data = data;
                _render();
            }
        });
    }
    // 获取对战信息
    function _getMatchData() {
        var i;
        if (savedData['position']) {
            i = savedData['position'];
            _saveData['_position'] = i;
            savedData['position'] = '';
        } else {
            i = _saveData['_position'];
        }
        _matchGuidanceId = LEFT_LIST.getData()[i].contentUri.split('?')[0];
        $$.loader4GuidanceContents(_matchGuidanceId, {
            success: function(data) {
                _matchData = data;
                _dataLen = _matchData.length;
                _getTeamsInfo()
            }
        });
    }
    // 获取球队信息
    function _getTeamsInfo() {
        $$.loader4GuidanceContents(_teamGuidanceId, {
            success: function(data) {
                _teamsData = data;
                _loadData();
            }
        });
    }

    function _init() {
        _pageIndex = savedData['pageIndex'] ? savedData['pageIndex'] : 0;
        _index = savedData['index'] ? savedData['index'] : 0;
        savedData['pageIndex'] = '';
        savedData['index'] = '';
        _getMatchData()
    }

    function _render() {
        focusStyle();
        arr = []; // 焦点数据
        matchIdArr = [];
        var _d = _matchData.slice(_pageIndex * 8, _pageIndex * 8 + 8);
        _d = _reorganizingData(_d);
        var _len = _d.length;
        var li = $$('.main2 ul')[0].children;
        var state = document.getElementsByClassName('state');
        var nowDate = new Date().format('yyyyMMddhhmm');
        for (var i = 0; i < _len; i++) {
            $$('.li' + (i + 1)).removeClass('nones');
            $$('.li' + (i + 1) + ' .free').addClass('nones');
            var title = document.querySelectorAll('.li' + (i + 1) + ' .line1 span');
            var teamName = document.querySelectorAll('.li' + (i + 1) + ' .teamName');
            var teamLogo = document.querySelectorAll('.li' + (i + 1) + ' .team img');
            var span = li[i].getElementsByClassName('d');
            var startTime = _d[i].startTime ? _d[i].startTime.slice(0, 12) : null;
            // var endTime = _d[i].endTime ? _d[i].endTime.slice(0, 12) : null;
            var channelNum = $$.search.get('channel', _d[i].contentUri);
            if (startTime > nowDate) { // 预约
                $$(span[0]).removeClass('block');
                $$(span[1]).removeClass('block');
                $$(span[2]).removeClass('block');
                $$(span[3]).addClass('block');
                $$(state[i]).html('预约');
                arr.push(span[3]);
                // _test('reservation => ' + JSON.stringify(reservation));
                for (var l = 0; l < reservation.length; l++) {
                    if (reservation[l] && (reservation[l].startTime == startTime) && reservation[l]['channelId'].num == channelNum) {
                        $$(span[3]).addClass('order_');
                        $$(state[i]).html('已预约');
                        arr.pop();
                    }
                }
            } else { // 直播 回看
                $$(span[0]).addClass('block');
                $$(span[1]).addClass('block');
                $$(span[2]).addClass('block');
                arr.push(span[0], span[1], span[2]);
                // 未绑定集锦VOD按钮置灰
                if (_d[i].isvip[1] == undefined || startTime != null) {
                    $$(span[2]).addClass('tvod_');
                    arr.pop();
                }
                if (startTime == null) {
                    $$(state[i]).html('回看');
                } else { // 直播
                    $$(state[i]).html('直播');
                }
            }
            // 免费小图标
            if ((_d[i].isvip.length == 1 && _d[i].isvip[0]['vipFlag'] == 0) || (_d[i].isvip[0] && _d[i].isvip[0]['vipFlag'] == 0 && _d[i].isvip[1] && _d[i].isvip[1]['vipFlag'] == 0)) { // 是否收费 
                $$('.li' + (i + 1) + ' .free').removeClass('nones');
            } else {
                $$('.li' + (i + 1) + ' .free').addClass('nones');
            }
            $$(title[0]).html(_d[i].titleName);
            $$(teamName[0]).html(_d[i].hteamName);
            $$(teamLogo[0]).attr('src', _d[i].hteamLogo);
            $$(teamName[1]).html(_d[i].vteamName);
            $$(teamLogo[1]).attr('src', _d[i].vteamLogo);
            matchIdArr.push($$.search.get('schuId', _d[i].contentUri));
        }
        _pageNum = Math.ceil(_dataLen / 8);
        if (_dataLen == 0) {
            $$('#noData').removeClass('nones');
            focusStyle();
        } else {
            $$('#noData').addClass('nones');
            if (_dataLen <= 8) {
                $$('.page')[0].style.display = 'none';
            } else {
                $$('.page')[0].style.display = 'block';
            }
        }
        $$('.curr').html(_pageIndex + 1);
        $$('.total').html(_pageNum);
        _refresh();
        // 反向进入的焦点
        if (savedData['focus']) {
            $$.focusTo(savedData['focus']);
            focusState(savedData['focus']);
            savedData['focus'] = '';
        }
        throttle = true;
    }

    function _refresh() {
        PAGE_INFO = [];
        close_btn = [];
        PAGE_BTN = [];
        out = [];
        for (var k = 0; k < arr.length; k++) {
            var id = $$(arr[k]).attr('id');
            var row = id.slice(2, 3);
            var col = id.slice(-1);
            out.push({
                key: id,
                pressUp: _up,
                pressDown: _down,
                pressLeft: _left,
                pressRight: _right,
                pressPageUp: _pageUp,
                pressPageDown: _pageDown,
                args: [k, row, col],
                pressOk: _ok,
                pressBack:backPage
            });
        }
        PAGE_BTN = [
            { key: 'prev', pressUp: _up, pressDown: _down, pressLeft: _left, pressRight: _right, pressOk: _pageUp, pressBack: backPage, args: ['prev'] },
            { key: 'next', pressUp: _up, pressDown: _down, pressLeft: _left, pressRight: _right, pressOk: _pageDown, pressBack: backPage, args: ['next'] },
        ]
        close_btn = [
            { key: 'close', pressUp: '', pressDown: '', pressLeft: '', pressRight: '', pressOk: close, pressBack: function() { close(); return true; }, args: ['close'] }
        ]
        if (_pageNum == 1) {
            PAGE_BTN = [];
        } else {
            if (_pageIndex == 0) {
                PAGE_BTN.shift();
                $$('.prev').addClass('prev_');
            } else if (_pageNum == _pageIndex + 1) {
                PAGE_BTN.pop();
                $$('.next').addClass('next_');
            }
        }
        PAGE_INFO = PAGE_INFO.concat(out, PAGE_BTN, close_btn, PAGE_LEFT);
    }

    function _enter() {
        if (reorganizingData.length == 0) return;
        if (_index == 'next' || _index == 'prev') {
            var key = _index;
        } else {
            var key = PAGE_INFO[_index].key;
        }
        focusState(key);
        if (type == 'match') { //guidanceList[1] == guidanceId
            $$.focusTo(key);
        } else {
            table.enter();
        }
    }
    // 获取从上移的目标id
    function getItemUp(d) {
        var len = arr.length;
        var index = ACTIVE_OBJECT.args[1];
        var start = ACTIVE_OBJECT.args[0];
        if (d && (d == 'next' || d == 'prev')) {
            len = len - 1;
        } else {
            len = start - 1;
        }
        for (var i = len; i >= 0; i--) {
            var row = Math.floor(+PAGE_INFO[i].args[1] / 2) * 2;
            if (Math.floor(index / 2) * 2 == index) { // 第二列
                if (PAGE_INFO[i] && row == PAGE_INFO[i].args[1] && PAGE_INFO[i].args[1] != index) { // 存在
                    if (PAGE_INFO[i].args[2] == 4) {
                        return PAGE_INFO[i];
                    } else {
                        if (PAGE_INFO[i].args[2] == 1) {
                            return PAGE_INFO[i];
                        }
                    }
                }
            } else { // 第一列
                if (PAGE_INFO[i] && row != PAGE_INFO[i].args[1] && PAGE_INFO[i].args[1] != index) { // 存在
                    if (PAGE_INFO[i].args[2] == 4) {
                        return PAGE_INFO[i];
                    } else {
                        if (PAGE_INFO[i].args[2] == 1) {
                            return PAGE_INFO[i];
                        }
                    }
                }

            }
        }
        if (!PAGE_INFO[i]) {
            focusState();
            menu.enter();
            return;
        }
    }

    function _up() {
        var key = ACTIVE_OBJECT.key;
        var row = ACTIVE_OBJECT.args[1];
        var prevKey = '';
        var focusObj = {};
        if (key == 'next') {
            focusObj = getItemUp('next');
        } else if (key == 'prev') {
            focusObj = getItemUp('prev');
        } else if (row == 1 || row == 2) {
            focusState();
            menu.enter();
            return;
        } else {
            focusObj = getItemUp();
        }
        if (focusObj) {
            _index = focusObj.args[0];
            prevKey = focusObj.key;
            focusState(prevKey);
            $$.focusTo(prevKey);
        }
    }
    // 获取从下移的目标id
    function getItemDown() {
        var len = arr.length;
        var index = +ACTIVE_OBJECT.args[1];
        var start = +ACTIVE_OBJECT.args[0];
        if (index + 2 > reorganizingData.length && _pageNum == 1) {
            return;
        } else {
            if (start + 1 == len) { // 本页最后一个向下
                if (_pageIndex + 1 == _pageNum) {
                    return 'prev';
                } else {
                    return 'next';
                }
            }
            for (var i = start + 1; i < len; i++) {
                var row = Math.floor(+PAGE_INFO[i].args[1] / 2) * 2;
                if (index == Math.floor(index / 2) * 2) { // 第二列
                    if (PAGE_INFO[i] && PAGE_INFO[i].args[1] == row && PAGE_INFO[i].args[1] != index) { // 第二列向下存在可聚焦的按钮
                        return PAGE_INFO[i];
                    } else {
                        if (_pageNum == 1 && (PAGE_INFO[i + 1].args[1] % 2) == 0 && PAGE_INFO[i].args[1] != index && $$(arr[i + 1]).css('display') == 'none') { // 第二列向下不存在可聚焦按钮
                            return;
                        } else {
                            if (PAGE_INFO[i + 1] && PAGE_INFO[i + 1].key == 'next') {
                                return PAGE_INFO[i + 1];
                            }
                            if (PAGE_INFO[i + 1] && PAGE_INFO[i + 1].key == 'prev') {
                                return PAGE_INFO[i + 1];
                            }
                        }
                    }
                } else {
                    if (PAGE_INFO[i] && PAGE_INFO[i].args[1] != row && PAGE_INFO[i].args[1] != index) { // 第一列向下存在可聚焦的按钮
                        return PAGE_INFO[i];
                    } else {
                        if (_pageNum == 1 && (PAGE_INFO[i + 1].args[1] % 2) == 1 && PAGE_INFO[i].args[1] != index && $$(arr[i + 1]).css('display') == 'none') { // 第一列向下不存在可聚焦按钮
                            return;
                        } else {
                            if (PAGE_INFO[i + 1] && PAGE_INFO[i + 1].key == 'next') {
                                return PAGE_INFO[i + 1];
                            }
                            if (PAGE_INFO[i + 1] && PAGE_INFO[i + 1].key == 'prev') {
                                return PAGE_INFO[i + 1];
                            }
                        }
                    }
                }
            }
        }
    }

    function _down() {
        var key = ACTIVE_OBJECT.key;
        var nextKey = '';
        var focusObj = {};
        if (key == 'next' || key == 'prev') return;
        focusObj = getItemDown();
        if (typeof focusObj == 'string') {
            nextKey = focusObj;
        } else if (typeof focusObj == 'undefined') {
            return;
        } else {
            _index = focusObj.args[0];
            nextKey = focusObj.key;
        }
        focusState(nextKey);
        $$.focusTo(nextKey);
    }

    function _left() {
        var key = ACTIVE_OBJECT.key;
        var focusKey = '';
        _index = ACTIVE_OBJECT.args[0];
        var row = ACTIVE_OBJECT.args[1];
        var col = ACTIVE_OBJECT.args[2];
        if (key == 'next' && !(_pageIndex == 0)) { // 中间页
            _index++;
            focusKey = 'prev';
        } else if (key == 'next') { // 第一页
            return;
        } else if ((Math.floor(+row / 2) * 2 != row || row - 1 != PAGE_INFO[_index - 1].args[1]) && (col == 1 || col == 4)) { // 当前焦点的左侧没有按钮 
            LEFT_LIST.enter();
            return;
        } else {
            _index--;
            focusKey = PAGE_INFO[_index].key
        }
        focusState(focusKey);
        $$.focusTo(focusKey);

    }

    function _right() {
        var key = ACTIVE_OBJECT.key;
        _index = ACTIVE_OBJECT.args[0];
        var focusKey = ''
        if (key == 'next' || (key == 'prev' && ((_pageIndex + 1) == _pageNum))) { // 最后一页的上一页按钮 或者 最后一页
            return;
        } else if (ACTIVE_OBJECT.key == 'prev') {
            _index++;
            focusKey = 'next';
        } else {
            _index = ACTIVE_OBJECT.args[0];
            if (_index + 1 >= arr.length) {
                return;
            }
            _index++;
            focusKey = PAGE_INFO[_index].key
        }
        focusState(focusKey);
        $$.focusTo(focusKey);

    }

    function _pageUp() {
        if (ACTIVE_OBJECT.key.indexOf('d_') != -1) return;
        _pageIndex--;
        if (_pageIndex == 0) {
            focusState('next');
            _render();
            _index = 'next';
            $$.focusTo('next');
        } else {
            _index = 'prev';
            _render();
        }
        $$('.next').removeClass('next_');
    }

    function _pageDown() {
        if (ACTIVE_OBJECT.key.indexOf('d_') != -1) return;
        _pageIndex++;
        if ((_pageIndex + 1) == _pageNum) {
            focusState('prev');
            _render();
            _index = 'prev';
            $$.focusTo('prev');
        } else {
            _render();
            _index = 'next';
        }
        $$('.prev').removeClass('prev_');
    }

    function _ok() {
        var _ds = reorganizingData;
        _save({
            "_index": _index,
            "_pageIndex": _pageIndex
        })
        savePageInfo(_saveData);
        var col = ACTIVE_OBJECT.args[2];
        var row = ACTIVE_OBJECT.args[1];
        var index = +row - 1;
        var channelNum = $$.search.get('channel', _ds[index].contentUri);
        var matchData = _ds[index];
        var isvip = _ds[index].isvip;
        var colid = _allMatchGuidanceId;
        switch (col) {
            case '1':
                if (isvip[0].contentType == '5') {
                    $.gotoDetail({
                        contentType: _data[0]['contentType'],
                        channelNum: '~' + isvip[0].channelNum,
                    });
                } else {
                    var contentId = isvip[0].contentId;
                    $.gotoDetail({
                        contentType: '7',
                        url: 'playControl/baseVod.html?contentId=' + contentId + '&vl='+ colid +'&categoryId='+  colid + '&ztCategoryId&multiVod=false&mediaType=1&contentName=' + isvip[0]['contentName']
                    })
                }
                break;
            case '2':
                // 统计 弹出框
                savePageInfo({
                    'focus': '',
                });
                _info();
                break;
            case '3':
                // 集锦  进入回看播控
                var contentId = isvip[1].contentId;
                $.gotoDetail({
                    contentType: '7',
                    url: 'playControl/baseVod.html?contentId=' + contentId + '&vl='+ colid +'&categoryId='+  colid + '&ztCategoryId&multiVod=false&mediaType=1&contentName=' + isvip[1]['contentName']
                })
                break;
            case '4':
                // 预约
                var row = +ACTIVE_OBJECT.args[1];
                var hteamName = $$('.li' + row + ' .hteam').html();
                var vteamName = $$('.li' + row + ' .vteam').html();
                var channelNum = $$.search.get('channel', _ds[index].contentUri);
                var time = matchData.startTime.slice(0, 12);
                var name = matchData.titleName.split(' ');
                var name = matchData.titleName.replace(/(^\s*)|(\s*$)/g, '').split(' ');
                name = name[name.length - 1] + '&nbsp;' + hteamName + '&nbsp;VS&nbsp;' + vteamName;
                var text = '';
                var i = 0;
                // 预约重复查询
                for (; i < reservation.length; i++) { // 查询重复预约
                    if (reservation[i].startTime == time) { // 有重复预约
                        text = reservation[i].program;
                        is = true;
                        break;
                    }
                }
                if (is) { // 删除重复预约
                    var order = G_MSG({
                        type: 'home',
                        msgType: '5', // code
                        pressBack: function() {
                            is = false;
                            $$('#msgBox4').css('display', 'none');
                            _enter();
                            // backPage();
                            return true;
                        },
                        backFocus: function() {
                            if (ACTIVE_OBJECT.key == 'btnOk5') { // 确定替换
                                window.reserveCallback = function(data) {
                                    if (data.code == 0 || data.code == 1) {
                                        is = false;
                                        var order = G_MSG({
                                            type: 'home',
                                            msgType: '6', // code
                                            pressBack: function() {
                                                _order();
                                                $$('#msgBox5').css('display', 'none');
                                                _enter();
                                                // backPage();
                                                return true;
                                            },
                                            backFocus: function() {
                                                _order();
                                            }
                                        });
                                        focusState();
                                        order.init();
                                        order.enter();
                                    }
                                }
                                make_reservation(isvip[0]['contentId'], name, time, 'reserveCallback');
                            } else {
                                // 返回 不做替换预约
                                is = false;
                                $$('#msgBox4').css('display', 'none');
                                _enter();
                            }
                        }
                    });
                    focusState();
                    order.init();
                    order.enter();
                    var flag = $$.substringElLength(text, '26px', '430px').flag;
                    flag ? $$.Marquee({ el: $$('#text')[0], all: text, width: '456px', height: '70px' }) : $$('#text').html(text);
                } else { // 直接预约
                    window.reserveCallback = function(data) {
                        var code = data.code;
                        var order = G_MSG({
                            type: 'home',
                            msgType: '0', // code
                            pressBack: function() {
                                $$('#msgBox').css('display', 'none');
                                _order();
                                backPage();
                                return true;
                            },
                            backFocus: function() {
                                if (code == 0 || code == 1) {
                                    _order();
                                } else {
                                    _enter();
                                }
                            }
                        });
                        focusState();
                        order.init();
                        order.enter();
                    };
                    make_reservation(isvip[0]['contentId'], name, time, 'reserveCallback');
                }
                break;
        }
    }


    function _order() {
        _index = 0;
        _pageIndex = 0;
        window.queryReserver1 = function(data) {
            reservation = data.data;
            LEFT_LIST.enter();
            _render();
            // backPage();
            savePageInfo({
                "focus": "",
                "index": _index,
                "pageIndex": _pageIndex,
                "position": ""
            });
        }
        query_all_reservation('queryReserver1');
    }

    function _save(obj) {
        for (var p in obj) {
            if (_saveData.hasOwnProperty(p)) {
                _saveData[p] = obj[p];
            }
        }
    }
    // 弹窗 
    function _info() {
        var row = +ACTIVE_OBJECT.args[1];
        var hTeam = $$('.record')[0].querySelectorAll('.left');
        var vTeam = $$('.record')[0].querySelectorAll('.right');
        var hteamText = $$('.li' + row + ' .hteam').html();
        var vteamText = $$('.li' + row + ' .vteam').html();
        var hteamLogo = $$('.li' + row + ' .team1 img').attr('src');
        var vteamLogo = $$('.li' + row + ' .team2 img').attr('src');
        var vsTime = $$('.li' + row + ' .line1 span').html();
        vsTime = vsTime.split(' ')[0];
        if (vsTime.indexOf('月') != -1) {
            vsTime = vsTime.indexOf('年') != -1 ? vsTime = vsTime.split('年')[1] : vsTime.split('年')[0];
        } else {
            vsTime = ''
        };
        $$('#tips .hteam').html(hteamText);
        $$('#tips .vteam').html(vteamText);
        $$('#tips .date').html(vsTime);
        $$('#tips .team1 img').attr('src', hteamLogo);
        $$('#tips .team2 img').attr('src', vteamLogo);
        if (matchIdArr[row - 1]) {
            window.G_LOAD({
                type: 'players',
                data: 'scheduleId=' + matchIdArr[row - 1],
                success: function(data) {
                    var hData = data.data.homeTeam;
                    var vData = data.data.visitTeam;
                    $$(hTeam[0]).html(hData.points);
                    $$(hTeam[1]).html(hData.rebounds);
                    $$(hTeam[2]).html(hData.reboundsOffensive);
                    $$(hTeam[3]).html(hData.assists);
                    $$(hTeam[4]).html(hData.steals);
                    $$(hTeam[5]).html(hData.turnovers);
                    $$(hTeam[6]).html(hData.freeThrows);
                    $$(hTeam[7]).html(hData.threePointGoals);
                    $$(hTeam[8]).html(hData.personalFouls);
                    $$(hTeam[9]).html(hData.biggestLead);
                    $$(hTeam[10]).html(hData.fieldGoalsPercentage);
                    $$(vTeam[0]).html(vData.points);
                    $$(vTeam[1]).html(vData.rebounds);
                    $$(vTeam[2]).html(vData.reboundsOffensive);
                    $$(vTeam[3]).html(vData.assists);
                    $$(vTeam[4]).html(vData.steals);
                    $$(vTeam[5]).html(vData.turnovers);
                    $$(vTeam[6]).html(vData.freeThrows);
                    $$(vTeam[7]).html(vData.threePointGoals);
                    $$(vTeam[8]).html(vData.personalFouls);
                    $$(vTeam[9]).html(vData.biggestLead);
                    $$(vTeam[10]).html(vData.fieldGoalsPercentage);
                    $$('#tips').show();
                }
            });
        } else {
            $$('#tips').show();
        }
        prevKey = ACTIVE_OBJECT.key;
        // 请求球队对战数据
        rewriteBack(close);
        focusState();
        $$.focusTo('close');
    }

    function close() {
        $$('#tips').hide();
        focusState(prevKey);
        $$.focusTo(prevKey);
    }


    function _getData() {
        return _matchData;
    }

    function rewriteBack(func) {
        $$.keyPressSettiing({
            KEY_RETURN: function() {
                func();
            }
        });
    }

    return {
        init: _init,
        gID: _id,
        getData: _getData,
        enter: _enter,
        save: _save
    }
})()
var RIGHT_LIST_T = (function() {
    var _data = [];
    var _dataLen = 0;
    var _pageNum = 0;
    var _pageIndex = 0;
    var _index = 0;
    var cols = [];
    var _position = '';
    var scheduleTypeID = {
        '1': '常规赛',
        '2': '季后赛',
        '3': '季前赛',
        '4': '全明星、新锐',
    }
    var _saveData = {
        '_index': _index,
        '_pageIndex': _pageIndex,
        '_position': 0
    };

    function trunc(whole, size, width) {
        var text = '';
        var r = $$.substringElLength(whole, size, width);
        if (r.flag) {
            text = r.last;
        } else {
            text = r.all;
        }
        return text;
    }

    function _render() {
        PAGE_INFO = [];
        for (var i = 0; i < _data.length; i++) {
            if (_data[i].birthDate) {
                _data[i].birthDate = _data[i].birthDate.slice(0, 10);
            }
        }
        var obj = {
            // 球员名单
            playerList: [
                { filed: 'number', width: '132px', title: '号码' },
                {
                    filed: 'cnalias',
                    width: '200px',
                    title: '姓名',
                    templated: function(val) {
                        val = val.cnalias;
                        var html = trunc(val, '18', '200px');
                        return html;
                    }
                },
                { filed: 'positionDescription', width: '132px', title: '位置' },
                { filed: 'height', width: '132px', title: '身高(CM)' },
                { filed: 'weight', width: '132px', title: '体重(KG)' },
                { filed: 'age', width: '112px', title: '年龄' },
                { filed: 'birthDate', width: '152px', title: '出生日期' },
            ],
            // 技术统计
            statisticsData: [{
                    filed: 'cnalias',
                    width: '200px',
                    height: '',
                    title: '姓名',
                    templated: function(val) {
                        val = val.cnalias;
                        var html = trunc(val, '18', '200px');
                        return html;
                    }
                },
                { filed: 'number', width: '113px', title: '号码' },
                { filed: 'positionDescription', width: '113px', title: '位置' },
                { filed: 'pointsAverage', width: '113px', title: '场均得分' },
                { filed: 'assistsAverage', width: '113px', title: '场均助攻' },
                { filed: 'reboundsAverage', width: '113px', title: '场均篮板' },
                { filed: 'blockedAverage', width: '113px', title: '场均盖帽' },
                { filed: 'stealsAverage', width: '113px', title: '场均抢断' },
            ],
            // 交战汇总
            battleSummary: [
                { filed: 'date', width: '198px', title: '比赛日期' },
                {
                    filed: 'teamVS',
                    width: '400px',
                    height: '',
                    title: '交战双方',
                    templated: function(val) {
                        var hTeam = val.homeTeamName;
                        var vTeam = val.visitingTeamName;
                        var html = '<span class="hTeam">' + hTeam + '</span><span class="hVSv">VS</span><span class="vTeam">' + vTeam + '</span>';
                        return html;
                    }
                },
                {
                    filed: 'pointsVs',
                    width: '197px',
                    title: '比分',
                    templated: function(val) {
                        var hScore = val.homeTeamScore;
                        var vScore = val.visitingTeamScore;
                        var html = '<span class="hScore">' + hScore + '</span><span class="hScorev">:</span><span class="vScore">' + vScore + '</span>';
                        return html;
                    }
                },
                {
                    filed: 'scheduleTypeID',
                    width: '197px',
                    title: '比赛类型',
                    templated: function(val) {
                        val = val.scheduleTypeID;
                        if (val) {
                            return scheduleTypeID[val];
                        } else {
                            return '';
                        }
                    }
                },
            ]
        }
        cols = obj[type];
        var index = savedData['index'] || 0;
        var activeEl = savedData['focus'] || '';
        var pageIndex = savedData['pageIndex'] || 0;
        table = window.G_TABLE({
            el: 'main1',
            data: _data,
            cols: cols,
            pageFlag: 1,
            position: index,
            startIndex: +pageIndex * 10,
            focusEl: activeEl,
            returnNav: function() {
                var key = ACTIVE_OBJECT.key;
                if (key.indexOf('nav') == -1) {
                    // 返回到导航
                    menu.enter();
                } else {
                    // 返回到首页
                    menu.index = 0;
                    menu.moveTo();
                    menu.jumpUrl();
                }
                return true;
            }
        });

        table.left = function() {
            LEFT_LIST.enter();
        }
        table.ok = function() {
            _ok();
        }
        table.init();
        _clearSavedData();
        PAGE_INFO = PAGE_INFO.concat(PAGE_LEFT);
        if (_dataLen <= 10) {
            $$('#conctrolBox')[0].style.display = 'none';
        } else {
            $$('#conctrolBox')[0].style.display = 'block';
        }
        throttle = true;
    }

    function _clearSavedData() {
        savedData = {
            'focus': '',
            'position': 0,
            'index': 0,
            'pageIndex': 0
        }
    }

    function _save(obj) {
        for (var p in obj) {
            if (_saveData.hasOwnProperty(p)) {
                _saveData[p] = obj[p];
            }
        }
        _position = _saveData['_position'];

    }

    function _ok() {
        _index = table.position;
        _pageIndex = table.startIndex / 10;
        _save({
            '_index': table.position,
            '_pageIndex': table.startIndex / 10,
            '_position': _position
        });
        savePageInfo(_saveData);
        var data = _data[(_pageIndex * 10) + _index];
        if (type == 'battleSummary') {
            var scheduleId = data.scheduleID;
            var url = $$.search.append(window.location.href.replace('local2/', 'battleData/'), { 'scheduleId': scheduleId });
            $$.forward(url);
        } else {
            var teamId = data.teamID;
            var playerId = data.playerID;
            var url = $$.search.append(window.location.href.replace('local2/', 'starDetail/'), { 'teamId': teamId, 'starId': playerId });
            $$.forward(url)
        }
    }
    // localPlayers teamInfo
    function _loadData() {
        var interFace = '';
        if (type == 'battleSummary') {
            interFace = 'teamInfo'
        } else {
            interFace = 'localPlayers';
        }
        window.G_LOAD({
            type: interFace,
            data: 'teamId=' + teamId,
            success: function(data) {
                _data = data.data;
                _dataLen = _data.length;
                _pageNum = Math.ceil(_dataLen / 10);
                _render();
            }
        });
    }

    function _init() {
        _pageIndex = savedData['pageIndex'] ? savedData['pageIndex'] : 0;
        _index = savedData['index'] ? savedData['index'] : 0;
        _position = savedData['position'] ? savedData['position'] : 0;
        _loadData();
    }
    return {
        init: _init,
        save: _save
    }
})()

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
        test_log.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        document.body.appendChild(test_log);
        test_log.innerHTML = msg;
    }
}