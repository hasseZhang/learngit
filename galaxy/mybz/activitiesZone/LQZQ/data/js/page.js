window.PAGE_INFO = [];
var ACTIVE_OBJECT;
window.savedData = {};
var pageName = 'dataPage';
var recommendId = { // 左 
    left_rec_id: window.G_GUIDEID['data']['left'],
    team_img_id: window.G_GUIDEID['public']['teamImg']
};
var menu;
var authMsg;

function initPage() {
    $.recodeData(pageName, "access");
    savedData = $.getGlobalData(pageName);
    $.saveGlobalData(pageName);
    window.G_AUTH({
        success: function(result) {
            window.AUTH_FLAG = result;
            authInit();
        }
    });
}

function returnNav() {
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

function authInit() {
    if (AUTH_FLAG == 0) {
        $$('#main').css('display', 'none');
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
        $$('#main').css('display', 'block');
        if (savedData['focus'] == 'btnOk') {
            savedData['focus'] = '';
        }
        menu = window.MENU({
            pressDown: function() {
                this.blur();
                LEFT_BOX.enter();
            }
        });
        menu.init();
        LEFT_BOX.init();
    }
}

function savePageInfo(opt) {
    var obj = opt || {};
    $.savePageInfo(pageName, {
        "focus": ACTIVE_OBJECT.key,
        "position": obj.position || 0,
        "startIndex": obj.startIndex || 0,
        "leftIndex": obj.leftIndex || 0
    });
}
var LEFT_BOX = (function() {
    var _position = 0;
    var _data = [];
    var _id = recommendId['left_rec_id'];
    var _imgId = recommendId['team_img_id'];
    var _updateTableStatus = 0;
    var table;
    var _teamImgData = [];

    function _init() {
        $$.loader4GuidanceContents(_imgId, {
            success: function(data) {
                _teamImgData = data;
                $$.loader4GuidanceContents(_id, {
                    success: function(data) {
                        var out = [];
                        for (var i = 0; i < data.length; i++) {
                            var name = data[i]['contentName'];
                            if (name != '0') {
                                out.push(data[i]);
                            }
                        }
                        _position = savedData['leftIndex'] || 0; // 初始左侧栏目下标
                        _data = out;
                        _updateTable();
                        _render();
                    }
                });
            }
        })
    }

    function _render() {
        var out = [],
            keyArrs = [];
        for (var i = 0; i < 7; i++) {
            if (i < _data.length) {
                $$('#side' + i).html(_data[i]['contentName']);
                out.push({
                    key: 'side' + i,
                    pressUp: _up,
                    pressDown: _down,
                    pressLeft: _left,
                    pressRight: _right,
                    pressOk: _ok,
                    pressBack: returnNav
                });
                keyArrs.push('side' + i);
            }
        }
        window.PAGE_INFO = window.PAGE_INFO.concat(out);
        if (savedData['leftIndex'] !== undefined && savedData['leftIndex'] !== '') {
            _onActive();
        }
        // _onActive();
        // keyArrs.indexOf(savedData['focus']) >= 0 ? $$.focusTo(savedData['focus']) : '';
    }

    function _enter() {
        _unblur();
        $$.focusTo('side' + _position);
    }

    function _up() {
        if (!_updateTableStatus) {
            if (_position == 0) {
                menu.enter();
            } else {
                _position -= 1;
                $$.focusTo('side' + _position);
                _updateTable();
            }
        }
    }

    function _down() {
        if (!_updateTableStatus) {
            if (_position == 6 || _position == _data.length - 1) {
                return;
            } else {
                _position += 1;
                $$.focusTo('side' + _position);
                _updateTable();
            }
        }
    }

    function _left() {}

    function _right() {
        var parms = _data[_position]['contentUri'];
        var rightFlag = $$.search.get('rightFlag', parms);
        if (rightFlag == 1 && table.size > 0) {
            _onActive();
            table.enter();
        } else if (table.size > 10) {
            _onActive();
            table.focusBtn();
        }
    }

    function _onActive() {
        $$('#side' + _position).addClass('active');
    }

    function _unblur() {
        $$('#side' + _position).removeClass('active');
    }

    function _updateTable() {
        _updateTableStatus = 1;
        var objCol = {
            regular: [ // 常规赛
                { filed: 'cbarank', width: '59px', title: '排名' },
                {
                    filed: 'teamCNAlias',
                    width: '300px',
                    title: '球队',
                    align: 'left',
                    templated: function(data) {
                        for (var i = 0, len = _teamImgData.length; i < len; i++) {
                            var pics = _teamImgData[i]['pics'] || '';
                            var picPath = $$.getPic(pics, [106]);
                            var contentUri = _teamImgData[i]['contentUri'];
                            var currId = data['teamID'];
                            // console.log()
                            if (contentUri == currId) {
                                return '<img style="margin-left:44px;width: 40px;height:40px;vertical-align:middle;" src="' + picPath + '"> ' +
                                    '<span style="display: inline-block; width: 150px;text-align:center;">' + $$.substringElLength(data['teamCNAlias'], '16px', '150px').last + '</span>';
                            }
                        }
                    }
                },
                { filed: 'matchPlayed', width: '59px', title: '场数' },
                { filed: 'winsLosses', width: '84px', title: '胜负' },
                { filed: 'pointsAgainst', width: '147px', title: '场均失分' },
                { filed: 'winningPercentage', width: '88px', title: '胜率' },
                { filed: 'points', width: '120px', title: '场均得分' },
                {
                    filed: 'streakNumber',
                    width: '135px',
                    title: '连胜/连负',
                    templated: function(data) {
                        return data['streakNumber'] + (data['streakType'] ? '连胜' : '连负');
                    }
                },
            ],
            playoff: [ // 季后赛
                {
                    filed: 'teamCNAlias',
                    width: '300px',
                    title: '球队',
                    align: 'left',
                    templated: function(data) {
                        for (var i = 0, len = _teamImgData.length; i < len; i++) {
                            var pics = _teamImgData[i]['pics'] || '';
                            var picPath = $$.getPic(pics, [106]);
                            var contentUri = _teamImgData[i]['contentUri'];
                            var currId = data['teamID'];
                            if (contentUri == currId) {
                                return '<img style="margin-left:50px;width: 40px;height:40px;vertical-align:middle;" src="' + picPath + '"> ' +
                                    '<span style="display: inline-block; width: 150px;text-align:center;">' + $$.substringElLength(data['teamCNAlias'], '16px', '150px').last + '</span>';
                            }
                        }
                    }
                },
                { filed: 'matchPlayed', width: '72px', title: '场数' },
                { filed: 'winsLosses', width: '72px', title: '胜负' },
                { filed: 'pointsAverage', width: '146px', title: '场均得分' },
                { filed: 'rebounds', width: '73px', title: '篮板' },
                { filed: 'assists', width: '73px', title: '助攻' },
                { filed: 'personalFouls', width: '73px', title: '犯规' },
                { filed: 'steals', width: '73px', title: '抢断' },
                { filed: 'threePointGoals', width: '110px', title: '三分球' },
            ],
            regularScore: [ // 得分
                { filed: 'rank', width: '63px', title: '排名' },
                { filed: 'cnalias', width: '136px', title: '球员' },
                { filed: 'games', width: '53px', title: '场数' },
                { filed: 'pointsAverage', width: '115px', title: '场均得分' },
                { filed: 'points', width: '80px', title: '总得分' },
                { filed: 'fieldGoalsPercentage', width: '163px', title: '投篮命中率' },
                { filed: 'threePointPercentage', width: '164px', title: '三分命中率' },
                {
                    filed: 'teamCNAlias',
                    width: '217px',
                    title: '球队',
                    templated: function(data) {
                        for (var i = 0, len = _teamImgData.length; i < len; i++) {
                            var pics = _teamImgData[i]['pics'] || '';
                            var picPath = $$.getPic(pics, [106]);
                            var contentUri = _teamImgData[i]['contentUri'];
                            var currId = data['teamID'];
                            if (contentUri == currId) {
                                return '<img style="width: 40px;height:40px;vertical-align:middle;" src="' + picPath + '"> ' + '<span style="display: inline-block; width: 150px;text-align:center;">' + $$.substringElLength(data['teamCNAlias'], '16px', '150px').last + '</span>';
                            }
                        }
                    }
                },
            ],
            regularRebounds: [ // 篮板
                { filed: 'rank', width: '64px', title: '排名' },
                { filed: 'cnalias', width: '157px', title: '球员' },
                { filed: 'games', width: '54px', title: '场数' },
                { filed: 'reboundsAverage', width: '139px', title: '场均篮板' },
                { filed: 'reboundsOffensive', width: '140px', title: '前场篮板' },
                { filed: 'reboundsDefensive', width: '140px', title: '后场篮板' },
                { filed: 'rebounds', width: '82px', title: '总篮板' },
                {
                    filed: 'teamCNAlias',
                    width: '216px',
                    title: '球队',
                    templated: function(data) {
                        for (var i = 0, len = _teamImgData.length; i < len; i++) {
                            var pics = _teamImgData[i]['pics'] || '';
                            var picPath = $$.getPic(pics, [106]);
                            var contentUri = _teamImgData[i]['contentUri'];
                            var currId = data['teamID'];
                            if (contentUri == currId) {
                                return '<img style="width: 40px;height:40px;vertical-align:middle;" src="' + picPath + '"> ' + '<span style="display: inline-block; width: 150px;text-align:center;">' + $$.substringElLength(data['teamCNAlias'], '16px', '150px').last + '</span>';
                            }
                        }
                    }
                },
            ],
            regularBlock: [ // 盖帽 
                { filed: 'rank', width: '103px', title: '排名' },
                { filed: 'cnalias', width: '188px', title: '球员' },
                { filed: 'games', width: '95px', title: '场数' },
                { filed: 'minutes', width: '100px', title: '上场时间' },
                { filed: 'blockedAverage', width: '135px', title: '场均盖帽' },
                { filed: 'blocked', width: '115px', title: '总盖帽' },
                {
                    filed: 'teamCNAlias',
                    width: '216px',
                    title: '球队',
                    templated: function(data) {
                        for (var i = 0, len = _teamImgData.length; i < len; i++) {
                            var pics = _teamImgData[i]['pics'] || '';
                            var picPath = $$.getPic(pics, [106]);
                            var contentUri = _teamImgData[i]['contentUri'];
                            var currId = data['teamID'];
                            if (contentUri == currId) {
                                return '<img style="width: 40px;height:40px;vertical-align:middle;" src="' + picPath + '"> ' + '<span style="display: inline-block; width: 150px;text-align:center;">' + $$.substringElLength(data['teamCNAlias'], '16px', '150px').last + '</span>';
                            }
                        }
                    }
                },
            ],
            regularAssist: [ // 助攻
                { filed: 'rank', width: '68px', title: '排名' },
                { filed: 'cnalias', width: '130px', title: '球员' },
                { filed: 'games', width: '68px', title: '场数' },
                { filed: 'minutes', width: '170px', title: '上场时间' },
                { filed: 'assistsAverage', width: '170px', title: '场均助攻' },
                { filed: 'assists', width: '170px', title: '总助攻数' },
                {
                    filed: 'teamCNAlias',
                    width: '216px',
                    title: '球队',
                    templated: function(data) {
                        for (var i = 0, len = _teamImgData.length; i < len; i++) {
                            var pics = _teamImgData[i]['pics'] || '';
                            var picPath = $$.getPic(pics, [106]);
                            var contentUri = _teamImgData[i]['contentUri'];
                            var currId = data['teamID'];
                            if (contentUri == currId) {
                                return '<img style="width: 40px;height:40px;vertical-align:middle;" src="' + picPath + '"> ' + '<span style="display: inline-block; width: 150px;text-align:center;">' + $$.substringElLength(data['teamCNAlias'], '16px', '150px').last + '</span>';
                            }
                        }
                    }
                },
            ],
            regularSteals: [ // 抢断
                { filed: 'rank', width: '68px', title: '排名' },
                { filed: 'cnalias', width: '130px', title: '球员' },
                { filed: 'games', width: '68px', title: '场数' },
                { filed: 'minutes', width: '170px', title: '上场时间' },
                { filed: 'stealsAverage', width: '170px', title: '场均抢断' },
                { filed: 'steals', width: '170px', title: '总抢断数' },
                {
                    filed: 'teamCNAlias',
                    width: '216px',
                    title: '球队',
                    templated: function(data) {
                        for (var i = 0, len = _teamImgData.length; i < len; i++) {
                            var pics = _teamImgData[i]['pics'] || '';
                            var picPath = $$.getPic(pics, [106]);
                            var contentUri = _teamImgData[i]['contentUri'];
                            var currId = data['teamID'];
                            if (contentUri == currId) {
                                return '<img style="width: 40px;height:40px;vertical-align:middle;" src="' + picPath + '"> ' + '<span style="display: inline-block; width: 150px;text-align:center;">' + $$.substringElLength(data['teamCNAlias'], '16px', '150px').last + '</span>';
                            }
                        }
                    }
                },
            ],
        };
        var parms = _data[_position]['contentUri'];
        var urlType = $$.search.get('type', parms);
        var tableCol = objCol[urlType];
        var upToTableFlag = urlType == 'regular' || urlType == 'playoff' ? '' : 'N';
        window.G_LOAD({
            type: urlType,
            success: function(data) {
                var position = savedData['position'] || 0;
                var startIndex = savedData['startIndex'] || 0;
                var activeEl = savedData['focus'] || '';
                var tableData = data.data;
                table = window.G_TABLE({
                    data: tableData,
                    el: 'rightBox',
                    cols: tableCol,
                    position: position,
                    startIndex: startIndex,
                    focusEl: activeEl,
                    pageFlag: 1,
                    upToTableFlagObj: {
                        flag: upToTableFlag, // 翻页能否移动到表格开关
                        fun: function() {
                            LEFT_BOX.enter()
                        }
                    },
                    returnNav: function() {
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
                });
                table.left = function() {
                    LEFT_BOX.enter();
                }
                table.ok = function() {
                    savePageInfo({
                        "position": table.position,
                        "startIndex": table.startIndex,
                        "leftIndex": _position
                    });
                    var baseUrl = '../';
                    var teamId = table['data'].slice(table['startIndex'])[table['position']]['teamID'];
                    var resultUrl = baseUrl + 'teamDetail/?teamId=' + teamId;
                    $$.forward(resultUrl);
                }
                table.init();
                _clearSavedData();
                _updateTableStatus = 0;
            }
        });
    }

    function _clearSavedData() {
        savedData = {
            "focus": '',
            "position": '',
            "startIndex": '',
            "leftIndex": '',
        }
    }

    function _ok() {

    }
    return {
        init: _init,
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
        test_log.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        document.body.appendChild(test_log);
        test_log.innerHTML = msg;
    }
}