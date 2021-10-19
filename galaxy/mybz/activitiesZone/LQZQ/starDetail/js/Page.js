var PAGE_INFO = [];
var PAGE_LEFT = [];
//本页名字
var pageName = 'starDetail';
//本页数据key
var PAGE_DATA_KEY = 'pageDataKey_' + pageName; //当页保存的焦点
var ACTIVE_OBJECT;
var savedData = {};
var teamId = '';
var playerId = '';

function initPage() {
    $.recodeData(pageName, "access");
    var location = window.location.href;
    teamId = $$.search.get('teamId', location);
    playerId = $$.search.get('starId', location);
    savedData = $.initPageInfo(pageName, ['focus', 'index'], {
        'focus': '',
        'index': ''
    });
    START_DETAIL.init();
}

function savePageInfo(opt) {
    $.savePageInfo({
        'focus': ACTIVE_OBJECT.key,
        'index': opt._index
    })
}
var START_DETAIL = (function() {
    // 获取海报和球队信息
    var _guidanceId = {
        'teamInfo': G_GUIDEID.public.teamImg,
        'playerInfo': G_GUIDEID.public.playerImg
    }
    var _dTeam = [];
    var _dPlayer = [];
    var _data = [];
    var pGuidanceVodId = G_GUIDEID.starDetail.playerHighlight; // 球员的vod导读Id
    var vodUrl = [];
    // 球队海报
    function _loadDataTeam() {
        $$.loader4GuidanceContents(_guidanceId['teamInfo'], {
            success: function(data) {
                var _dataLen = data.length;
                _loadDataPlayer();
                for (var i = 0; i < _dataLen; i++) {
                    if (data[i].contentUri == teamId) {
                        _dTeam = data[i];
                        break;
                    }
                }
            }
        });
    }
    // 球员海报
    function _loadDataPlayer() {
        $$.loader4GuidanceContents(_guidanceId['playerInfo'], {
            success: function(data) {
                var _dataLen = data.length;
                for (var i = 0; i < _dataLen; i++) {
                    if (data[i].contentUri == playerId) {
                        _dPlayer = data[i];
                        break;
                    }
                }
                _playerVod();
            }
        });
    }
    // 球员vod
    function _playerVod() {
        $$.loader4GuidanceContents(pGuidanceVodId, {
            success: function(data) {
                // _test(JSON.stringify(data))
                var _dataLen = data.length;
                if (_dataLen == 0) {
                    PAGE_INFO = [];
                    $$('#pStory').addClass('none');
                } else {
                    for (var i = 0; i < _dataLen; i++) {
                        if (data[i].contentName == playerId) {
                            // vodUrl = data[i];
                            vodUrl.push(data[i])
                            $$('#pStory').removeClass('none');
                            break;
                        }
                    }
                    if (vodUrl.length == 0) {
                        $$('#pStory').addClass('none');
                    }
                }
                _playerInfo();
            },
        });
    }

    function _init() {
        _loadDataTeam();
    }
    // 获取球员信息
    function _playerInfo() {
        G_LOAD({
            type: 'basePlayer',
            data: 'teamId=' + teamId + '&playerId=' + playerId,
            success: function(data) {
                _data = data.data;
               for(let key in _data){
                   if(_data[key] === null){
                    _data[key] = ''
                   }
               }
                _render();
            },
            error: function(err) {},
            loading: function() {}
        })
    }

    function _render() {
        var _dT = _dTeam;
        var _dP = _dPlayer;
        var out = [];
        var playerPic;
        var teamPic = $$.getPic(_dT.pics, [0]);
        if (_dP.length != 0 && _dP.pics.length != 0) {
            playerPic = $$.getPic(_dP.pics, [1]);
        } else {
            playerPic = './images/noPlayer.jpg';
        }
        $$('.teamLogo img').attr('src', teamPic);
        $$('#poster img').attr('src', playerPic);
        $$('.pName').html(_data.cnalias);
        var domsLeft = $$('.pInfo')[0].querySelectorAll('span:nth-child(2n)');
        var domsRight = $$('.content')[0].querySelectorAll('td.d');
        _data.birthDate = _data.birthDate.split(' ')[0];
        $$(domsLeft[0]).html(_data.position);
        $$(domsLeft[1]).html(_data.height + 'cm');
        $$(domsLeft[2]).html(_data.weight + 'kg');
        $$(domsLeft[3]).html(_data.number);
        $$(domsLeft[4]).html(_data.age);
        $$(domsLeft[5]).html(_data.birthDate);
        $$(domsLeft[6]).html(_data.teamCNAlias);
        $$(domsRight[0]).html(_data.pointsAverage); // 得分
        $$(domsRight[1]).html(_data.pointsAverageRank);
        $$(domsRight[2]).html(_data.assistsAverage); // 助攻
        $$(domsRight[3]).html(_data.assistsAverageRank);
        $$(domsRight[4]).html(_data.reboundsAverage); // 篮板
        $$(domsRight[5]).html(_data.reboundsAverageRank);
        $$(domsRight[6]).html(_data.blockedAverage); // 盖帽 
        $$(domsRight[7]).html(_data.blockedAverageRank);
        $$(domsRight[8]).html(_data.stealsAverage); // 抢断
        $$(domsRight[9]).html(_data.stealsAverageRank); // 抢断
        $$(domsRight[10]).html(_data.fieldGoalsPercentageAverage); // 投篮
        $$(domsRight[11]).html(_data.fieldGoalsPercentageAverageRank); // 投篮命中率
        $$(domsRight[12]).html(_data.threePointPercentageAverage); // 三分
        $$(domsRight[13]).html(_data.threePointPercentageAverageRank); // 三分命中率
        $$(domsRight[14]).html(_data.freeThrowsPercentageAverage); // 罚球
        $$(domsRight[15]).html(_data.freeThrowsPercentageAverageRank); // 罚球命中率
        for (var i = 0; i < 10; i++) {
            if (!$$(domsLeft[i]).html() || !$$(domsRight[i]).html()) {
                $$(domsLeft[i]).html('未知信息');
            }
        }
        if($.search.append(document.referrer.replace('?POSITIVE', '')).indexOf('LQZQ') > -1) {
            $.saveGlobalData('starDetailBack', $.search.append(document.referrer.replace('?POSITIVE', '')));
        }
        out.push({
            key: 'pStory',
            pressOk: vodUrl.length && _ok,
            pressBack: function() {
                window.location.href = $.getGlobalData('starDetailBack');
                return true;
            },
            args: []
        });
        PAGE_INFO = [].concat(out);
        $$.focusTo('pStory');
    }

    function _ok() {
        var contentId = vodUrl[0].contentId;
        var colid = pGuidanceVodId;
        $$.loader4DetailPageJs(contentId, {
            success:function(data) {
                $.gotoDetail({
                    contentType: '7',
                    url: 'playControl/baseVod.html?contentId=' + contentId + '&vl='+ colid +'&categoryId='+  colid + '&ztCategoryId&multiVod=false&mediaType=1&contentName=' + data['vodName']
                })
            }
        })
    }
    return {
        init: _init
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