window.PAGE_INFO = [];
var ACTIVE_OBJECT;
var pageName = 'battleDataPage';
var parms_scheduleId = $$.search.get('scheduleID'); // url参数teamID
var recommendId = { // 导读
	id: window.G_GUIDEID['public']['teamImg']
};
function initPage() {
    $.recodeData(pageName, "access");
    $.initPage();
    TABEL_BOX.init();
    // $$.focusTo('chooseBtn');
}  
var TABEL_BOX = (function() {
    var _isFlag = 0; // 切换主客场
    var _table1;
    var _table2;
    var _data = [];
    function _load() {
        window.G_LOAD({
            type: 'players',
            data: 'scheduleId=' + parms_scheduleId,
            success: function(data) {
                _data = data.data;
                _getPicData();
                _render();
                _joinObj();
            }
        });
    }
    function _getPicData() {
        var id = recommendId['id'];
        var teamInfo = _data['teamScheduleMatchlVo'];
        var homeTeamId = teamInfo['homeTeamID'];
        var otherTeamID = teamInfo['visitingTeamID']; 
        var homeTeamPic = '';
        var otherTeamPic = '';
        $$.loader4GuidanceContents(id, {
            success: function(data) {
                for(var i = 0; i < data.length; i++) {
                    var pics = data[i]['pics'] || '';
                    if (homeTeamId == data[i]['contentUri']) {
                        homeTeamPic = $$.getPic(pics, [ 106 ]);
                    }
                    if (otherTeamID == data[i]['contentUri']) {
                        otherTeamPic = $$.getPic(pics, [ 106 ]);
                    }
                }
                _renderTitle(teamInfo, homeTeamPic, otherTeamPic);
            }
        })
    }
    function _joinObj() {
        window.PAGE_INFO = [
            {
                key: 'chooseBtn', 
                pressOk: chooseData, 
                pressBack: function() {
                    window.history.back(-1);
                    return true;
                }}
        ];
        $$.focusTo('chooseBtn');
    }
    function _renderTitle(d, p, p2) {
        for (var k in d) {
            d[k] = d[k] == null ? '' : d[k];
        }
        var dates = d['date'] && d['date'].split('-');
        var date = dates && (dates[0] + '年' + dates[1] + '月' + dates[2] + '日');
        var headText = d['scheduleType'] && (d['scheduleType'] + (d['round'] != 0 ? ('第' + d['round'] +'轮') : ''));
        var title = date + ' ' + d['time'] + ' ' + headText;
        var score = d['homeTeamScore'] + ' : ' + d['visitingTeamScore'];
        var ourName = d['homeTeamCNAlias'] + '(主)';
        var otherName = '(客)'+d['visitingTeamCNAlias'];
        $$('#title').html(title);
        $$('#secord').html(score);
        $$('#ourName').html(ourName);
        $$('#otherName').html(otherName);
        $$('#ourImg img')[0].src = p;
        $$('#otherImg img')[0].src = p2;
    }
    function _noData(d) {
        if (d.length == 0) {
            $$('#tableBox').addClass('none');
            $$('#otherTable').addClass('none');
            $$('#noAllData').removeClass('none');
        } else {
            $$('#tableBox').removeClass('none');
            $$('#otherTable').removeClass('none');
            $$('#noAllData').addClass('none');
        }
    }
    function _render() { // 主场
        var data = _data['homePlayerList'];
        var firstData = []; // 首发数据
        var secondData = []; // 替补数据
        for(var i = 0,len=data.length; i < len; i++) {
            if(data[i]['gameStart'] == '1') {
                firstData.push(data[i]);
            } else {
                secondData.push(data[i]);
            }
        }
        _noData(firstData);
        _table1 = window.G_TABLE({
            url: '0', 
            el: 'tableBox', 
            data: firstData,
            lines: 5,
            pageFlag: 0,
            tableSize: {width:'1159px', height:'230px', background: "url('')"},
            cols: [
                {filed: 'cnname', width: '200px', height: '40px', title: '主队首发'},
                {filed: 'positionDescription', width: '70px',  height: '40px',title: '位置'},
                {filed: 'minutes', width: '70px', height: '40px', title: '时间'},
                {filed: 'fieldGoals', width: '70px', height: '40px', title: '投篮'},
                {filed: 'threePointGoals', width: '80px', height: '40px', title: '三分球'},
                {filed: 'freeThrows', width: '70px', height: '40px', title: '罚球'},
                {filed: 'rebounds', width: '80px', height: '40px', title: '总篮板'},
                {filed: 'assists', width: '70px', height: '40px', title: '助攻'},
                {filed: 'personalFouls', width: '70px', height: '40px', title: '犯规'},
                {filed: 'steals', width: '70px', height: '40px', title: '抢断'},
                {filed: 'turnovers', width: '70px', height: '40px', title: '失误'},
                {filed: 'blocked', width: '70px', height: '40px', title: '封盖'},
                {filed: 'points', width: '70px', height: '40px', title: '得分'},
                {filed: 'plusMinus', width: '80px', height: '40px', title: '正负值'},
            ]
        });
        _table1.init();
        _table2 = window.G_TABLE({
            url: '0', 
            el: 'otherTable', 
            data: secondData,
            lines: 7,
            pageFlag: 0,
            tableSize: {width:'1159px', height:'230px', background: "url('')"},
            cols: [
                {filed: 'cnname', width: '200px', height: '40px', title: '主队替补'},
                {filed: 'positionDescription', width: '70px',  height: '40px',title: '位置'},
                {filed: 'minutes', width: '70px', height: '40px', title: '时间'},
                {filed: 'fieldGoals', width: '70px', height: '40px', title: '投篮'},
                {filed: 'threePointGoals', width: '80px', height: '40px', title: '三分球'},
                {filed: 'freeThrows', width: '70px', height: '40px', title: '罚球'},
                {filed: 'rebounds', width: '80px', height: '40px', title: '总篮板'},
                {filed: 'assists', width: '70px', height: '40px', title: '助攻'},
                {filed: 'personalFouls', width: '70px', height: '40px', title: '犯规'},
                {filed: 'steals', width: '70px', height: '40px', title: '抢断'},
                {filed: 'turnovers', width: '70px', height: '40px', title: '失误'},
                {filed: 'blocked', width: '70px', height: '40px', title: '封盖'},
                {filed: 'points', width: '70px', height: '40px', title: '得分'},
                {filed: 'plusMinus', width: '80px', height: '40px', title: '正负值'},
            ]
        });
        _table2.init();
    }
    function _render2() { // 客队
        var data = _data['visitPlayerList'];
        var firstData = []; // 首发数据
        var secondData = []; // 替补数据
        for(var i = 0,len=data.length; i < len; i++) {
            if(data[i]['gameStart'] == '1') {
                firstData.push(data[i]);
            } else {
                secondData.push(data[i]);
            }
        }
        _noData(firstData);
        _table1 = window.G_TABLE({
            url: '0', 
            el: 'tableBox',
            data: firstData, 
            lines: 5,
            pageFlag: 0,
            tableSize: {width:'1159px', height:'230px', background: "url('a')"},
            cols: [
                {filed: 'cnname', width: '200px', height: '40px', title: '客队首发'},
                {filed: 'positionDescription', width: '70px',  height: '40px',title: '位置'},
                {filed: 'minutes', width: '70px', height: '40px', title: '时间'},
                {filed: 'fieldGoals', width: '70px', height: '40px', title: '投篮'},
                {filed: 'threePointGoals', width: '80px', height: '40px', title: '三分球'},
                {filed: 'freeThrows', width: '70px', height: '40px', title: '罚球'},
                {filed: 'rebounds', width: '80px', height: '40px', title: '总篮板'},
                {filed: 'assists', width: '70px', height: '40px', title: '助攻'},
                {filed: 'personalFouls', width: '70px', height: '40px', title: '犯规'},
                {filed: 'steals', width: '70px', height: '40px', title: '抢断'},
                {filed: 'turnovers', width: '70px', height: '40px', title: '失误'},
                {filed: 'blocked', width: '70px', height: '40px', title: '封盖'},
                {filed: 'points', width: '70px', height: '40px', title: '得分'},
                {filed: 'plusMinus', width: '80px', height: '40px', title: '正负值'},
            ]
        });
        _table1.init();
        _table2 = window.G_TABLE({
            url: '0', 
            el: 'otherTable', 
            data: secondData,
            lines: 7,
            pageFlag: 0,
            tableSize: {width:'1159px', height:'230px', background: "url('a')"},
            cols: [
                {filed: 'cnname', width: '200px', height: '40px', title: '客队替补'},
                {filed: 'positionDescription', width: '70px',  height: '40px',title: '位置'},
                {filed: 'minutes', width: '70px', height: '40px', title: '时间'},
                {filed: 'fieldGoals', width: '70px', height: '40px', title: '投篮'},
                {filed: 'threePointGoals', width: '80px', height: '40px', title: '三分球'},
                {filed: 'freeThrows', width: '70px', height: '40px', title: '罚球'},
                {filed: 'rebounds', width: '80px', height: '40px', title: '总篮板'},
                {filed: 'assists', width: '70px', height: '40px', title: '助攻'},
                {filed: 'personalFouls', width: '70px', height: '40px', title: '犯规'},
                {filed: 'steals', width: '70px', height: '40px', title: '抢断'},
                {filed: 'turnovers', width: '70px', height: '40px', title: '失误'},
                {filed: 'blocked', width: '70px', height: '40px', title: '封盖'},
                {filed: 'points', width: '70px', height: '40px', title: '得分'},
                {filed: 'plusMinus', width: '80px', height: '40px', title: '正负值'},
            ]
        });
        _table2.init();
    }
    function _chooseTableData() {
        if(_isFlag == 0) {
            _isFlag = 1;
            _render2();
        } else {
            _isFlag = 0;
            _render();
        }
    }
    return {
        init: _load,
        choose: _chooseTableData
    }
})();
function chooseData() {
    TABEL_BOX.choose();
}

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