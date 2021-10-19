window.PAGE_INFO = [];
var ACTIVE_OBJECT;
var savedData = {
    "focus": '',
    "position": '',
    "top": '',
    "index": ''
};
var pageName = 'basketBallHome';
var recommendId = { // 左 中 右侧导读
    left_rec_id: window.G_GUIDEID['home']['left'],
    mid_rec_id: window.G_GUIDEID['home']['middle'],
    rig_rec_id: window.G_GUIDEID['home']['right'],
    scroll_id: window.G_GUIDEID['home']['scroll'],
    teamImg_id: window.G_GUIDEID['public']['teamImg'], // 球队图片
    program_id: window.G_GUIDEID['home']['program'],
    fourscreen_id: window.G_GUIDEID['fourScreen']['content']
};
var menu;
var reserData = []; // 预约节目
var reserSuccMsg, reserFailMsg, hasedReserMsg, playFailMsg, reserConflict, reserConflictSucc;
var livePlayer = null;
var channel32 = {
    '939': '30001110000000000000000000001421',
    '938': '30001110000000000000000000001422',
    '937': '30001110000000000000000000001423',
    '936': '30001110000000000000000000001424',
    '935': '30001110000000000000000000001425',
    '934': '30001110000000000000000000001426',
    '933': '30001110000000000000000000001427',
    '932': '30001110000000000000000000001428',
    '931': '30001110000000000000000000001429',
    '930': '30001110000000000000000000001430',
    '929': '30001110000000000000000000001562'
}

function del() {}

function initPage() {
    _test($.auth.getId4Entrance("LQZQ"));
    $.recodeData(pageName, "access");
    // del_all_reservation('del');
    // savedData = $.UTIL.merge(savedData, $.getGlobalData(pageName));
    savedData = $.initPageInfo(pageName, ["focus", "position", "top", "index"], {
        "focus": '',
        "position": '',
        "top": '',
        "index": ''
    });
    // $.saveGlobalData(pageName);
    $.initPage();
    joinMsgBox();
    query_all_reservation('queryReserver'); // 查询预约节目
    window.G_AUTH({ // 鉴权
        success: function(result) {
            window.AUTH_FLAG = result;
            // window.AUTH_FLAG = 1;
            LEFT_BOX.init();
            MIDDLE_BOX.init();
            RIGHT_BOX.init();
        }
    }); // 鉴权
    SCROLL_TEXT.init();
    menu = window.MENU({
        focusFlag: 1,
        pressDown: function() {
            this.blur();
            LEFT_BOX.focusTo('live');
        }
    });
    menu.init();
}

function joinMsgBox() {
    reserSuccMsg = window.G_MSG({
        type: 'home',
        msgType: '0',
        isBackFlag: 'Y',
        backFocus: function() {
            MIDDLE_BOX.enter();
            setBack();
        }
    });
    reserSuccMsg.init();
    reserFailMsg = window.G_MSG({
        type: 'home',
        msgType: '2',
        isBackFlag: 'Y',
        pressBack: function() {
            $$('#msgBox2').css('display', 'none');
            MIDDLE_BOX.enter();
            return true;
        },
        backFocus: function() {
            MIDDLE_BOX.enter();
            setBack();
        }
    });
    reserFailMsg.init();
    hasedReserMsg = window.G_MSG({
        type: 'home',
        msgType: '1',
        isBackFlag: 'Y',
        backFocus: function() {
            MIDDLE_BOX.enter();
            setBack();
        }
    });
    hasedReserMsg.init();
    playFailMsg = window.G_MSG({
        type: 'home',
        msgType: '3',
        isBackFlag: 'Y',
        backFocus: function() {
            MIDDLE_BOX.enter();
            setBack();
        }
    });
    playFailMsg.init();
}

function queryReserver(data) {
    reserData = data['code'] == 0 ? (data['data'] ? data['data']: []) : [];
}

function unLoad() { // 停止字幕滚动
    livePlayer.hide();
    SCROLL_TEXT.stop();
    // SIZE_PLAYER && (SIZE_PLAYER.destoryMP()); //高清小窗口停止视频流方法
    mp && mp.stop && (mp.stop());
    top.mp && top.mp.stop && (top.mp.stop());
}

function upTo() { // 移至导航
    $$('#orderTip').addClass('none');
    menu.enter();
}

function savePageInfo(opt) {
    opt = opt || {};
    $.savePageInfo(pageName, {
        "focus": ACTIVE_OBJECT.key,
        "position": opt.position || '',
        "top": opt.top || '',
        "index": opt.index || ''
    });
}
// 首页左侧推荐位
var LEFT_BOX = (function() {
    var _data = [];
    var _id = recommendId['left_rec_id'];
    var _index = 0;
    var _elIdArr = ['live', 'h_1', 'h_2', 'h_3', 'h_4'];

    function _load() {
        $$.loader4GuidanceContents(_id, {
            success: function(data) {
                for (var i = 0; i < 5; i++) {
                    var type = data[i]['contentType'];
                    if (type == '3') {
                        var vipFlag = data[i]['contentUri'].indexOf('#'); // 有#号为免费
                        var channelType = data[i]['contentUri'].indexOf('channel://~'); // 直播频道
                        if (i == 0) {
                            data[i]['channelNum'] = data[i]['contentUri'].match(/\d+/g)[0];
                            data[i]['contentType'] = '5';
                            data[i]['vipFlag'] = vipFlag != -1 ? 0 : 1;
                        }
                        if (channelType != -1) { // 左侧下方推荐位直播频道判断
                            data[i]['vipFlag'] = vipFlag != -1 ? 0 : 1;
                        }
                    }
                }
                _data = data;
                _play();
                _render();
            }
        });
    }

    function _render() {
        var out = [
            { 
                key: 'live', 
                pressUp: upTo, 
                pressDown: _down, 
                pressLeft: '', 
                pressRight: _right, 
                pressOk: _jump, 
                args: [0], 
                wholeMsg: _data[0]['contentName']
            },
        ];
        for (var i = 1, len = _data.length; i < len; i++) {
            if (i < 5) {
                var name = _data[i]['contentName'];
                var pics = _data[i]['pics'] || '';
                var picPath = $$.getPic(pics, [2]);
                var subStr_name = $$.substringElLength(name, '20px', '220px').last;
                picPath = picPath ? picPath : 'images/home_left_default.jpg';
                $$('#h_' + i + ' .r-text').html(subStr_name);
                name == '0' ? $$('#h_' + i + ' .r-text').addClass('none') : $$('#h_' + i + ' .r-text').removeClass('none');
                $$('#h_' + i + ' img')[0].src = picPath;
                out.push({
                    key: 'h_' + i,
                    pressUp: _up,
                    pressDown: _down,
                    pressLeft: _left,
                    pressRight: _right,
                    pressOk: _jump,
                    args: [i],
                    wholeMsg: _data[i]['contentName']
                })
            }
        }
        PAGE_INFO = PAGE_INFO.concat(out);
        if (savedData['focus']) {
            _index = savedData['index'];
            _enter(savedData['focus']);
        } else {
            _enter('live');
        }
    }

    function _play() {
        var name = _data[0]['contentName'];
        var subStr_name = $$.substringElLength(name, '25px', '370px').last;
        $$('#live .live-title').html(subStr_name);
        name == '0' ? $$('#live .live-title-box').addClass('none') : $$('#live .live-title-box').removeClass('none');
        var playData = _data[0];
        var channelNum = playData['channelNum'];
        var contentId = playData['contentId'];
        if (AUTH_FLAG == 0 && _data[0]['vipFlag'] != 0) {
            $$('#orderBox').css('display', 'block');
            $$('#orderBox').css('background', 'url(./images/order_bg.jpg) no-repeat');
            $$('#orderTip').css('background', 'url(./images/order_tip.png) no-repeat');
            $$('#orderTip').addClass('none');
            $$('.live-title-box').css('display', 'none');
        } else if (playData['contentType'] == '5') { // 直播
            name != '0' && $$('.live-title-box').css('display', 'block');
            $$('#orderBox').css('display', 'none');
            $$('#live .live-bg').html('直播');
            livePlayer = $.playSizeLive(channelNum, 60, 101, 503, 283);
            livePlayer.show();
        } else if (playData['contentType'] == '0') { // vod
            name != '0' && $$('.live-title-box').css('display', 'block');
            $$('#orderBox').css('display', 'none');
            $$('#live .live-bg').html('回看');
            livePlayer = $.playSizeList(
                {
                    left: 60,
                    top: 101,
                    width: 503,
                    height: 283,
                    list: [ {
                        contentId: contentId,
                        name: name
                    } ]
                },
                _id
            )            
            livePlayer.play();
        }
    }

    function _goChannel() {
        var channelNum = _data[0]['channelNum'] || '';
        var contentId = _data[0]['contentId'] || '';
        if (_data[0]['contentType'] == '5') {
            $.gotoDetail({
                contentType: _data[0]['contentType'],
                channelNum: '~' + channelNum,
            });
        } else {
            livePlayer.enter({
                contentId: contentId,
                mediaType: 1
            })
        }
    }
    
    function _goToUrl() {
        var index = ACTIVE_OBJECT.args[0];
        var contentObj = _data[index];
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
                        flag ? location.href = '../fourScreen/index.html' : $.auth.forwardOrder();
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
            $$.loader4DetailPageJs(contentObj['contentId'], {
                success:function(data) {
                    $.gotoDetail({
                        contentType: '7',
                        url: 'playControl/baseVod.html?contentId=' + contentObj['contentId'] + '&vl='+ contentObj['categoryId'] +'&categoryId='+  contentObj['categoryId'] + '&ztCategoryId&multiVod=false&mediaType=1&contentName=' + data['vodName']
                    })
                }
            })
        } else {
            $.gotoDetail(contentObj, false, savedData);
        }
    }

    function _jump() {
        var index = ACTIVE_OBJECT.args[0];
        savePageInfo({
            "index": index
        });
        if (index == '0') {
            if (AUTH_FLAG == 0 && _data[0]['vipFlag'] != 0) {
                $.auth.forwardOrder();
            } else {
                _goChannel();
            }
        } else {
            // 推荐位跳转
            if (AUTH_FLAG == 0 && _data[index]['vipFlag'] != 0) {
                $.auth.forwardOrder();
            } else {
                _goToUrl();
            }
        }
    }

    function _focusLeftBox(key) { // 从栏目移到下侧
        $$.focusTo(key);
        _index = ACTIVE_OBJECT && ACTIVE_OBJECT.args[0] || 0;
        if (key != 'live' && AUTH_FLAG == 0 && _data[0]['vipFlag'] != 0) {
            $$('#orderTip').addClass('none');
        }
        if (key == 'live' && AUTH_FLAG == 0 && _data[0]['vipFlag'] != 0) {
            $$('#orderTip').removeClass('none');
        }
        ACTIVE_OBJECT && ACTIVE_OBJECT.wholeMsg != '0' ? _marquees() : '';
    }

    function _enter(key) {
        var sourcePage = document.referrer;
        var currentPage = window.location.href;
         if( currentPage.indexOf('inner') != -1 && _elIdArr.indexOf(key) != -1){
             $$.focusTo(key)
         }else{
             sourcePage.indexOf('LQZQ') == -1 && _elIdArr.indexOf(key) != -1 ? $$.focusTo(key) : '';
         }
        var currKey = ACTIVE_OBJECT && ACTIVE_OBJECT.key;
        _index = ACTIVE_OBJECT && ACTIVE_OBJECT.args[0] || 0;
        if (currKey != 'live' && AUTH_FLAG == 0 && _data[0]['vipFlag'] != 0) {
            $$('#orderTip').addClass('none');
        }
        if (currKey == 'live' && AUTH_FLAG == 0 && _data[0]['vipFlag'] != 0) {
            $$('#orderTip').removeClass('none');
        }
        ACTIVE_OBJECT && ACTIVE_OBJECT.wholeMsg != '0' ? _marquees() : '';
    }

    function _marquees() {
        var lMarFlag = $$.substringElLength(ACTIVE_OBJECT.wholeMsg, '25px', '360px').flag;
        var hMarFlag = $$.substringElLength(ACTIVE_OBJECT.wholeMsg, '20px', '220px').flag;
        var key = ACTIVE_OBJECT.key;
        if (key == 'live') {
            lMarFlag ? $$.Marquee({ el: $$('#' + key + ' .live-title')[0], all: ACTIVE_OBJECT.wholeMsg, width: '370px', height: '43px' }) : '';
        } else {
            hMarFlag ? $$.Marquee({ el: $$('#' + key + ' .r-text')[0], all: ACTIVE_OBJECT.wholeMsg, width: '220px', height: '30px' }) : '';
        }
    }

    function _up() {
        if (_index == 1 || _index == 2) {
            _focusLeftBox('live');
        }
        if (_index == 3 || _index == 4) {
            _index -= 2;
            _focusLeftBox('h_' + _index);
        }
    }

    function _down() {
        if (ACTIVE_OBJECT.key == 'live') {
            _index = 1;
            _focusLeftBox('h_1');
        } else if (_index > 2) {
            return;
        } else {
            _index += 2;
            _focusLeftBox('h_' + _index);
        }
    }

    function _left() {
        if (_index == 2 || _index == 4) {
            _index -= 1;
            _focusLeftBox('h_' + _index);
        }
    }

    function _right() {
        if (ACTIVE_OBJECT.key == 'live') {
            if (AUTH_FLAG == 0 && _data[0]['vipFlag'] != 0) {
                $$('#orderTip').addClass('none');
            }
            MIDDLE_BOX.enter();
        }
        if (_index == 2 || _index == 4) {
            if (ACTIVE_OBJECT.key != 'live' && AUTH_FLAG == 0 && _data[0]['vipFlag'] != 0) {
                $$('#orderTip').addClass('none');
            }
            MIDDLE_BOX.enter();
        }
        if (_index == 1 || _index == 3) {
            _index += 1;
            _focusLeftBox('h_' + _index);
        }
    }
    return {
        init: _load,
        enter: _enter,
        focusTo: _focusLeftBox
    }
})();

// 首页中间推荐位
var MIDDLE_BOX = (function() {
    var _data = [];
    var _teamImgData = [];
    var _programData = [];
    var _recommData = [];
    var _id = recommendId['mid_rec_id'];
    var _position = 1;
    var _index = 1;
    var _top = 0;
    var _elHeight = 78;
    var _msgBox1;
    var _msgBox2;
    var _msgBox3;
    var reserConflictData = {}; //预约有冲突的节目
    var reserConflict = window.G_MSG({
        type: 'home',
        msgType: '5',
        isBackFlag: 'N',
        pressBack: function() {
            $$('#msgBox4').remove();
            MIDDLE_BOX.enter();
            return true;
        },
        backFocus: function() {
            if (ACTIVE_OBJECT.key == 'btnOk5') { // 确定替换
                // 替换预约
                var channelNum = _data[_position]['channelNum'] || '';
                var name = _data[_position]['cName'] || '';
                var time = _data[_position]['startTime'] || '';
                var channelContentId = _data[_position]['contentId'] || '';
                name = transTeamName(name);
                window.reserveCallback = function(data) {
                    if (data['code'] == 0) {
                        var removeIdx = -1;
                        for (var i = 0; i < reserData.length; i++) {
                            if (reserData[i].time == time) {
                                reserData[i] = {
                                    channel: channelNum,
                                    program: name,
                                    time: time
                                }
                                break;
                            }
                        }
                        $$('#l' + _position + ' .state').html('已预约');
                        _data[_position]['playStateFlag'] = 2;
                        $$.focusTo('l' + _position);
                        for (var k = 0; k < _data.length; k++) {
                            if (_data[k].startTime == time && _position != k && _data[k]['playStateFlag'] == 2) {
                                removeIdx = k;
                                break;
                            }
                        }
                        _data[removeIdx]['playStateFlag'] = 0;
                        $$('#l' + removeIdx + ' .state').html('预约');
                        var reserConflictSucc = G_MSG({
                            type: 'home',
                            msgType: '6', // code
                            isBackFlag: 'Y',
                            pressBack: function() {
                                $$('#msgBox5').remove();
                                MIDDLE_BOX.enter();
                                return true;
                            },
                            backFocus: function() {
                                $$('#msgBox5').remove();
                                MIDDLE_BOX.enter();
                                $$.keyPressSetting({
                                    KEY_RETURN: function() {
                                        $$.back();
                                    }
                                })
                            }
                        });
                        reserConflictSucc.init();
                        reserConflictSucc.enter();
                    }
                }
                make_reservation(channelContentId, name, time, 'reserveCallback');
            } else {
                // 返回 不做替换预约
                $$('#msgBox4').remove();
                MIDDLE_BOX.enter();
            }
        }
    });


    function _load() {
        var teamImg_id = recommendId['teamImg_id'];
        var program_id = recommendId['program_id'];
        $$.loader4GuidanceContents(_id, {
            success: function(data) {
                _index = _position;
                _recommData = data;
                $$.loader4GuidanceContents(teamImg_id, {
                    success: function(data) {
                        _teamImgData = data;
                        $$.loader4GuidanceContents(program_id, { // 获取节目单
                            success: function(data) {
                                _programData = data;
                                if (savedData['position']) {
                                    _position = savedData['position'];
                                    _top = savedData['top'];
                                    _index = savedData['index'];
                                    _initData();
                                    _enter();
                                } else {
                                    _initData();
                                }
                            }
                        });
                    }
                });
            }
        });

    }

    function _initData() {
        var out = [];
        var now = new Date();
        var nowTime = now.format('yyyyMMddhhmm');
        for (var i = 0, len1 = _recommData.length; i < len1 - 1; i++) {
            var ourTeamId = $$.search.get('ourTeamId', _recommData[i]['contentUri']);
            var otherTeamId = $$.search.get('otherTeamId', _recommData[i]['contentUri']);
            var gameId = $$.search.get('schuId', _recommData[i]['contentUri']);
            var startTime = $$.search.get('startTime', _recommData[i]['contentUri']);
            var endTime = $$.search.get('endTime', _recommData[i]['contentUri']);
            var sName = _recommData[i]['contentName'].split(/[\u4e00-\u9fa5]/) || [];
            var vipFlag = _recommData[i]['contentUri'].indexOf('#');
            var channelNum = $$.search.get('channel', _recommData[i]['contentUri']);
            sName = sName[1] + '月' + sName[2] + '日';
            var cName = _recommData[i]['contentName'].split(' ')[2] || '';
            out.push({
                sName: sName,
                name: _recommData[i]['contentName'] || '',
                cName: cName,
                gameId: gameId,
                channelNum: channelNum,
                url: i == 0 ? _recommData[i]['contentUri'] : ''
            })
            for (var j = 0, len2 = _teamImgData.length; j < len2; j++) {
                var pics = _teamImgData[j]['pics'] || '';
                var picPath = $$.getPic(pics, [106]);
                if (ourTeamId == _teamImgData[j]['contentUri']) {
                    out[i]['ourTeamName'] = _teamImgData[j]['contentName'] || '';
                    out[i]['ourImgPath'] = picPath || '';
                }
                if (otherTeamId == _teamImgData[j]['contentUri']) {
                    out[i]['otherTeamName'] = _teamImgData[j]['contentName'] || '';
                    out[i]['otherImgPath'] = picPath || '';
                }
            }
            for (var k = 0, len3 = _programData.length; k < len3; k++) {
                if (gameId == _programData[k]['contentName'].split('@')[0]) {
                    if (_programData[k]['contentType'] == 5) {
                        out[i]['channelNum'] = _programData[k]['channelNum'] || '';
                        out[i]['vipFlag'] = (vipFlag != -1 ? 0 : 1);
                        out[i]['contentType'] = _programData[k]['contentType'] || '';
                        out[i]['contentId'] = _programData[k]['contentId'] || '';
                        out[i]['startTime'] = startTime || '';
                        out[i]['endTime'] = endTime || '';
                        if (nowTime >= startTime) {
                            out[i]['playState'] = '直播';
                            out[i]['playStateFlag'] = 1;
                        } else {
                            if (!reserData.length) {
                                out[i]['playState'] = '预约';
                                out[i]['playStateFlag'] = 0;
                            }
                            for (var l = 0, len = reserData.length; l < len; l++) {
                                if (_programData[k]['channelNum'] == reserData[l]['channelId']['num'] && reserData[l]['startTime'] == startTime) {
                                    out[i]['playState'] = '已预约';
                                    out[i]['playStateFlag'] = 2;
                                    break;
                                } else {
                                    out[i]['playState'] = '预约';
                                    out[i]['playStateFlag'] = 0;
                                }
                            }
                        }
                        break;
                    } else {
                        out[i]['playState'] = '回看';
                        out[i]['vipFlag'] = _programData[k]['vipFlag'] || '';
                        out[i]['contentId'] = _programData[k]['contentId'] || '';
                        out[i]['contentType'] = _programData[k]['contentType'] || '';
                    }
                }
            }
        }
        if (_recommData.length > 6) {
            out[out.length] = {
                name: '全部赛程',
                gameId: '',
                url: _recommData[_recommData.length - 1]['contentUri']
            };
        }
        _data = out;
        _render();
        _isShowIcon();
        // TODO
        // reservationBsk.fetch();
    }

    function _render() {
        var html = [];
        var out = [];
        for (var i = 0, len = _data.length; i < len; i++) {
            if (i == 0) {
                html.push('<li id="l' + i + '" class="list1-bg"><img src="images/seeAll.png"></li>');
            } else if (len > 6 && i == len - 1) {
                if (len > 6 && i % 2 == 1) {
                    html.push('<li id="l' + i + '" class="list2-bg"><img src="images/seeAll.png"></li>');
                }
                if (len > 6 && i % 2 != 1) {
                    html.push('<li id="l' + i + '" class="list1-bg"><img src="images/seeAll.png"></li>');
                }
            } else {
                var subOtherName = _data[i]['otherTeamName'] || '';
                var subOurName = _data[i]['ourTeamName'] || '';   
                subOtherName = $$.substringElLength(subOtherName, '18px', '70px').last;
                subOurName = $$.substringElLength(subOurName, '18px', '70px').last;
                if (i % 2 == 1) {
                    html.push('<li id="l' + i + '" class="list2-bg">' + (_data[i]['vipFlag'] == 0 ? '<div class="vipIcon"></div>' : '') + '<div class="first-line">' + (_data[i]['sName'] || '') + '</div><div class="second-line"><div class="ourImg"><img src="' + _data[i]['ourImgPath'] + '"></div><div class="ourName ourName' + i + '">' + subOurName + '</div><div class="state">' + (_data[i]['playState'] || '') + '</div><div class="otherName otherName' + i + '">' + subOtherName + '</div><div class="otherImg"><img src="' + _data[i]['otherImgPath'] + '"></div></div></li>');
                } else {
                    html.push('<li id="l' + i + '" class="list1-bg">' + (_data[i]['vipFlag'] == 0 ? '<div class="vipIcon"></div>' : '') + '<div class="first-line">' + (_data[i]['sName'] || '') + '</div><div class="second-line"><div class="ourImg"><img src="' + _data[i]['ourImgPath'] + '"></div><div class="ourName ourName' + i + '">' + subOurName + '</div><div class="state">' + (_data[i]['playState'] || '') + '</div><div class="otherName otherName' + i + '">' + subOtherName + '</div><div class="otherImg"><img src="' + _data[i]['otherImgPath'] + '"></div></div></li>');
                }
            }
            out.push({
                key: 'l' + i,
                pressUp: _up,
                pressDown: _down,
                pressLeft: _left,
                pressRight: _right,
                pressOk: _ok,
                args: [i]
            });
        }
        $$('#middleBox').html(html.join(''));
        _transTop();
        PAGE_INFO = PAGE_INFO.concat(out);
    }

    function _appointment() { // 预约
        var channelNum = _data[_position]['channelNum'] || '';
        var name = _data[_position]['cName'] || '';
        var time = _data[_position]['startTime'] || '';
        var channelContentId = _data[_position]['contentId'] || '';
        var subOurName, subOtherName;
        // 检查当前时间段有没有预约
        reserConflictData = {};
        for (var i = 0; i < reserData.length; i++) {
            if (reserData[i]['startTime'] == time) {
                // 这里是已经预约的
                reserConflictData = reserData[i];
                for (var j = 0; j < _data.length; j++) {
                    if (_data[j].channelNum == reserData[i]['channelId']['num']) {
                        subOurName = _data[j]['ourTeamName'] || '';
                        subOtherName = _data[j]['otherTeamName'] || '';
                        reserConflictData.program = reserConflictData.program;
                    }
                }
                break;
            }
        }
        if (reserConflictData['startTime']) {
            reserConflict.init();
            reserConflict.enter();
            var _all = reserConflictData.program;
            var flag = $$.substringElLength(_all, '26px', '456px').flag;
            flag ? $$.Marquee({ el: $$('#msgBox4 #text')[0], all: _all, width: '456px', height: '70px' }) : $$('#msgBox4 #text').html(_all);
        } else if (_data[_position]['contentType'] == 5 && _data[_position]['playStateFlag'] == 0) {
            name = transTeamName(name);
            make_reservation(channelContentId, name, time, 'MIDDLE_BOX.reserCallback');
        }
    }

    function _reserCallback(data) { // 预约回调
        if (data['code'] == 0) {
            $$('#l' + _position + ' .state').html('已预约');
            _data[_position]['playStateFlag'] = 2;
            reserData.push({
                channel: _data[_position]['channelNum'],
                program: transTeamName(_data[_position]['cName']),
                time: _data[_position]['startTime']
            });
            reserSuccMsg.enter();
        }
    }
    // 预约program添加对战球队名
    function transTeamName(name) {
        var subOurName = $$('.ourName' + _position).html();
        var subOtherName = $$('.otherName' + _position).html();
        return name + '&nbsp;' + subOurName + '&nbsp;VS&nbsp;' + subOtherName;
    }

    function _removeAppointment() { // 删除预约
        var channelNum = _data[_position]['channelNum'] || '';
        var name = _data[_position]['name'] || '';
        var time = _data[_position]['startTime'] || '';
        del_reservation(channelNum, name, time, 'MIDDLE_BOX.removeAppCallback');
    }

    function _removeAppCallback(data) { // 删除预约回调
        if (data[code] == 1) {
            $$('#l' + _position + ' .state').html('预约');
            _data[_position]['playStateFlag'] = 0;
        }
    }

    function _moveTo() {
        var currIndex = ACTIVE_OBJECT && ACTIVE_OBJECT.args[0] || 0;
        var otherTeamName = _data[_position]['otherTeamName'] || '';
        var ourTeamName = _data[_position]['ourTeamName'] || '';
        if (_data[currIndex]['gameId'] != undefined) {
            $$('#l' + currIndex + ' .first-line').html(_data[currIndex]['sName']);
        }
        $$.focusTo('l' + _position);
        if (_data[_position]['gameId']) {
            var topName = _data[_position]['name'] || '';
            var topNameFlag = $$.substringElLength(topName, '15px', '318px').flag;
            if (topNameFlag) {
                $$.Marquee({ el: $$('#l' + _position + ' .first-line')[0], all: topName, width: '318px', height: '31px' });
            } else {
                $$('#l' + _position + ' .first-line').html(topName);
            }
        }
        var flag = $$.substringElLength(ourTeamName, '18px', '70px').flag;
        flag ? $$.Marquee({ el: $$('#l' + _position + ' .ourName')[0], all: ourTeamName, width: '70px', height: '40px' }) : '';
        var flag1 = $$.substringElLength(otherTeamName, '18px', '70px').flag;
        flag1 ? $$.Marquee({ el: $$('#l' + _position + ' .otherName')[0], all: otherTeamName, width: '70px', height: '40px' }) : '';
    }

    function _renewTitle() { // 往左或往右，恢复标题日期
        var currIndex = ACTIVE_OBJECT.args[0] || 0;
        if (_data[currIndex]['gameId'] != undefined) {
            $$('#l' + currIndex + ' .first-line').html(_data[currIndex]['sName']);
        }
    }

    function _enter() {
        var len = _data.length;
        if (len > 0) {
            if (len == 1) {
                _position = 0;
                _moveTo();
            } else {
                _moveTo();
            }
        } else {
            return;
        }
    }

    function _up() {
        _index -= 1;
        _position -= 1;
        if (_index < 0 && _position >= 0) {
            _index = 0;
            _top += _elHeight;
            _transTop();
        } else if (_index < 0 && _position < 0) {
            _index = 0;
            _position = 0;
            upTo();
            return;
        }
        _moveTo()
    }

    function _down() {
        _index += 1;
        _position += 1;
        if (_position >= _data.length) {
            if (_index > 6) {
                _index = 6;
            }
            _position = _data.length - 1;
            return;
        } else if (_position > 6 && _index > 6) {
            _index = 6;
            _top -= _elHeight;
            _transTop();
        }
        _moveTo()
    }

    function _left() {
        _renewTitle();
        if (_index < 4) {
            LEFT_BOX.focusTo('live');
        } else if (_index < 6) {
            LEFT_BOX.focusTo('h_2');
        } else {
            LEFT_BOX.focusTo('h_4');
        }
    }

    function _right() {
        _renewTitle();
        if (_index < 2) {
            RIGHT_BOX.enter('h_15');
        } else if (_index < 5) {
            RIGHT_BOX.enter('h_16');
        } else {
            RIGHT_BOX.enter('h_17');
        }
    }

    function _ok() {
        savePageInfo({
            position: _position,
            top: _top,
            index: _index
        });
        if (AUTH_FLAG == 0 && _data[_position]['playStateFlag'] == 0) {
            reserFailMsg.enter();
            return;
        }
        if (_data[_position]['vipFlag'] != 0 && AUTH_FLAG == 0 && _data[_position]['contentType'] == 5) {
            playFailMsg.enter();
            return;
        }
        if (_data[_position]['vipFlag'] != 0 && AUTH_FLAG == 0 && _data[_position]['contentType'] == 0) {
            playFailMsg.enter();
            return;
        }
        if (_data[_position]['url']) {
            var url = _data[_position]['url'];
            $$.redirect('../' + url);
            return;
        }
        if (_data[_position]['contentType'] == 5) {
            var channelNum = _data[_position]['channelNum'];
            if (_data[_position]['playStateFlag'] == 1) { // 跳转直播播控
                $.gotoDetail({
                    contentType: '7',
                    url: 'channel://~'  + channel32[_data[_position]['channelNum']]
                }, false, savedData);
            } else if (_data[_position]['playStateFlag'] == 0) { // 预约
                _appointment();
            } else if (_data[_position]['playStateFlag'] == 2) { // 已预约
                hasedReserMsg.enter();
            } else { // 跳转
                // $$.playLiveBase(channelNum);
                $.gotoDetail(contentObj, false, savedData);
            }
        } else { //  跳转vod播控
            var contentId = _data[_position]['contentId'];
            $$.loader4DetailPageJs(contentId, {
                success:function(data) {
                    $.gotoDetail({
                        contentType: '7',
                        url: 'playControl/baseVod.html?contentId=' + contentId + '&vl='+ recommendId['program_id'] +'&categoryId='+  recommendId['program_id'] + '&ztCategoryId&multiVod=false&mediaType=1&contentName=' +  data['vodName']
                    })
                }
            })
        }
    }

    function _isShowIcon() {
        var top = _elHeight * (_data.length - 7);
        if (_top == 0) {
            $$('#upIcon').addClass('none');
            $$('#downIcon').removeClass('none');
        } else if (_top < 0) {
            if (_top == -top) {
                $$('#upIcon').removeClass('none');
                $$('#downIcon').addClass('none');
            } else {
                $$('#upIcon').removeClass('none');
                $$('#downIcon').removeClass('none');
            }
        }
    }

    function _transTop() {
        _isShowIcon();
        $$('#middleBox').css('-webkit-transform', 'translateY(' + _top + 'px)');
    }

    return {
        init: _load,
        enter: _enter,
        reserCallback: _reserCallback,
        removeAppCallback: _removeAppCallback
    }
})();
// 首页右侧推荐位
var RIGHT_BOX = (function() {
    var _data = [];
    var _id = recommendId['rig_rec_id'];
    var _elIdArr = ['h_15', 'h_16', 'h_17']

    function _load() {
        $$.loader4GuidanceContents(_id, {
            success: function(data) {
                for (var i = 0; i < 3; i++) {
                    var type = data[i]['contentType'];
                    var channelType = data[i]['contentUri'].indexOf('channel://~'); // 直播频道
                    if (type == '3' && channelType != -1) {
                        var vipFlag = data[i]['contentUri'].indexOf('#'); // 有#号为免费
                        data[i]['vipFlag'] = (vipFlag != -1 ? 0 : 1);
                    }
                }
                _data = data;
                _render();
                savedData['focus'] ? _enter(savedData['focus']) : '';
            }
        });
    }

    function _render() {
        var out = [];
        for (var i = 0, elIndex = 15; i < 3; i++, elIndex++) {
            var name = _data[i]['contentName']; // name为0时 隐藏蒙层
            var pics = _data[i]['pics'] || '';
            var picPath = $$.getPic(pics, [2]);
            var subStr_name = $$.substringElLength(name, '20px', '289px').last;
            picPath = picPath ? picPath : 'images/home_right_default.jpg';
            $$('#h_' + elIndex + ' .r-text').html(subStr_name);
            name == '0' ? $$('#h_' + elIndex + ' .r-text').addClass('none') : $$('#h_' + elIndex + ' .r-text').removeClass('none');
            $$('#h_' + elIndex + ' img')[0].src = picPath;
            out.push({
                key: 'h_' + elIndex,
                pressUp: _up,
                pressDown: _down,
                pressLeft: _left,
                pressRight: '',
                pressOk: _jump,
                args: [i],
                wholeMsg: name
            });
        }
        PAGE_INFO = PAGE_INFO.concat(out);
    }

    function _up() {
        var key = ACTIVE_OBJECT.key;
        if (key == 'h_15') {
            menu.enter();
        }
        if (key == 'h_16') {
            _enter('h_15');
        }
        if (key == 'h_17') {
            _enter('h_16');
        }
    }

    function _down() {
        var key = ACTIVE_OBJECT.key;
        if (key == 'h_15') {
            _enter('h_16');
        }
        if (key == 'h_16') {
            _enter('h_17');
        }
    }

    function _left() {
        MIDDLE_BOX.enter();
    }

    function _enter(key) {
        if (_elIdArr.indexOf(key) != -1) {
            $$.focusTo(key);
            if (ACTIVE_OBJECT.wholeMsg != 0) {
                var flag = $$.substringElLength(ACTIVE_OBJECT.wholeMsg, '20px', '289px').flag;
                flag ? $$.Marquee({ el: $$('#' + key + ' .r-text')[0], all: ACTIVE_OBJECT.wholeMsg, width: '289px', height: '30px' }) : '';
            }
        }
    }

    function _jump() {
        savePageInfo();
        var index = ACTIVE_OBJECT.args[0];
        var contentObj = _data[index];
        contentObj['categoryId'] = _id;
        // _test(contentObj);
        if (AUTH_FLAG == 0 && _data[index]['vipFlag'] != 0) {
            $.auth.forwardOrder();
        } else {
            var objUrl = contentObj.url || contentObj.contentUri || contentObj.contentUrl || "";
            if(contentObj['contentType'] == 3) {
                if(contentObj['contentUri'] == 'multiplePerspectives') {
                    // if(AUTH_FLAG == 0) {
                    //     $.auth.forwardOrder();
                    // } else {
                    //     // location.href = '../fourScreen/index.html';
                    //     $.gotoDetail({
                    //         contentType: '7',
                    //         url: 'activitiesZone/LQZQ/fourScreen/index.html'
                    //     }, false, savedData)
                    // }
                    // $.gotoDetail({
                    //     contentType: '7',
                    //     url: 'activitiesZone/LQZQ/fourScreen/index.html'
                    // }, false, savedData)
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
                            flag ? location.href = '../fourScreen/index.html' : $.auth.forwardOrder();
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
                $$.loader4DetailPageJs(contentObj['contentId'], {
                    success:function(data) {
                        $.gotoDetail({
                            contentType: '7',
                            url: 'playControl/baseVod.html?contentId=' + contentObj['contentId'] + '&vl='+ contentObj['categoryId'] +'&categoryId='+  contentObj['categoryId'] + '&ztCategoryId&multiVod=false&mediaType=1&contentName=' + data['vodName']
                        })
                    }
                })
            } else {
                $.gotoDetail(contentObj, false, savedData);
            }
        }
    }
    return {
        init: _load,
        enter: _enter
    }
})();
var SCROLL_TEXT = (function() {
    var _id = recommendId['scroll_id'];
    var _data = [];
    var _scrollHeight = 20;
    var _timout;
    var _delay = 6000;
    var _transTopHeight = 0;
    var _textBoxHeight = 0;

    function _withOut() { // 适配
        var stbType = Authentication.CTCGetConfig('STBType');
        if (stbType == 'B860AV2.2U' || stbType == 'B760EV3' || stbType.indexOf('B860') != -1) {
            $$('#scrollText').css('height', '17px');
            $$('#volueIcon').css('height', '17px');
            _scrollHeight = 16;
        }
        if (stbType == 'B860AV1.1') {
            $$('#scrollText').css('height', '16px');
            $$('#volueIcon').css('height', '16px');
            _scrollHeight = 16;
        }
        if(stbType.indexOf('Q21A') != -1) {
            $$('#scrollText').css('height', '20px');
            _scrollHeight = 22;
        }
    }

    function _load() {
        _withOut();
        $$.loader4GuidanceContents(_id, {
            success: function(data) {
                _data = data;
                _render();
                _transTop();
            }
        });
    }

    function _render() {
        var html = [];
        for (var i = 0, len = _data.length; i < len; i++) {
            var name = _data[i]['contentName'];
            html.push('<div>' + name + '</div>');
        }
        $$('#textBox').html(html.join(''));
    }

    function _transTop() {
        _textBoxHeight = parseInt($$('#textBox').css('height'));
        _timout = setInterval(function() {
            if (-(_transTopHeight) >= _textBoxHeight - _scrollHeight) {
                _transTopHeight = 0;
                $$('#textBox').css('display', 'none');
                $$('#textBox').css('-webkit-transform', 'transLateY(' + _transTopHeight + 'px)');
                setTimeout(function() {
                    $$('#textBox').css('display', 'block');
                }, _delay / 3)
            } else {
                _transTopHeight -= _scrollHeight;
                $$('#textBox').css('-webkit-transform', 'transLateY(' + _transTopHeight + 'px)');
            }
        }, _delay)
    }

    function _stopScroll() {
        clearInterval(_timout);
    }
    return {
        init: _load,
        stop: _stopScroll
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