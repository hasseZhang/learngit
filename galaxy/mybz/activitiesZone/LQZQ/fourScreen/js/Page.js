var channelList = [];
$.addBackUrlRedefine(function () {});
$.playVideoRedefine(true);
$.playLiveOrRecRedefine(true);
var bigVideoPosition = {
    width: 824,
    height: 464,
    left: 47,
    top: 130
};
var smallListPosition = [{
    left: 924,
    top: 58,
    width: 309,
    height: 174
}, {
    left: 924,
    top: 282,
    width: 309,
    height: 174
}, {
    left: 924,
    top: 510,
    width: 309,
    height: 174
}];
var backgroundImg = eval('epgData_' + window.G_GUIDEID['fourScreen']['backgroundImg']);

// 1. 先判断返回的数据，有没有储存的内容
var savedList = JSON.parse($.getGlobalData('fourScreen') ? $.getGlobalData('fourScreen') : '[]');
// 2. 检查储存的内容，和加载的内容有没有冲突
var guidData = eval('epgData_' + window.G_GUIDEID['fourScreen']['content']);
var guidDataList = guidData.map(function(item) { return item['contentUri'].match(/\d+/g)[0] });
var arr = [];
for(var i = 0 ; i < savedList.length; i++) {
    if(guidDataList.indexOf(savedList[i]) !== -1) {
        arr.push(guidData[guidDataList.indexOf(savedList[i])]);
    }else{
        arr = [];
        break;
    }
}
var channelIdArr = guidData;
if(arr.length > 0){
    channelIdArr = arr;
}  
// var channelIdArr = guidData;
$.saveGlobalData('fourScreen');
var bigVideoId = channelIdArr[0]['contentType'] == '3' ? channelIdArr[0]['contentUri'].match(/\d+/g)[0] :channelIdArr[0]['contentId'];
var bigVideoPlayer = null;
var videoIdArr = [];
var videoPlayerArr = [];
var $fullScreenEnter = null;
var $backCue = null;
for (var i = 1; i < channelIdArr.length; i++) {
    if(channelIdArr[i]['contentType'] == '3'){
        videoIdArr.push(channelIdArr[i]['contentUri'].match(/\d+/g)[0])
    }else{
        videoIdArr.push(channelIdArr[i]['contentId']);
    }
}
var keyPosition = 'bigVideo';
var videoIndex = 0;
var popUpIndex = 'confirm';
var saveKeyPosition = '';

createBigPlayer();
$.pTool.add('fourScreen', {
    key: 'fourScreen',
    keysMap: {
        'KEY_DOWN': function () {
            if (keyPosition === 'video') {
                if (videoIndex === videoIdArr.length - 1) {
                    return true;
                }
                videoIndex++;
                $.focusTo({
                    el: '#video' + videoIndex
                });
            } else if (keyPosition === 'f_popUp' && popUpIndex === 'confirm') {
                popUpIndex = 'return';
                $.focusTo({
                    el: '#fullScreenEnter .' + popUpIndex
                });
            } else if (keyPosition === 'b_popUp' && popUpIndex === 'confirm') {
                popUpIndex = 'return';
                $.focusTo({
                    el: '#backCue .' + popUpIndex
                });
            }
            return true;
        },
        'KEY_UP': function () {
            if (keyPosition === 'video') {
                if (videoIndex === 0) {
                    return true;
                }
                videoIndex--;
                $.focusTo({
                    el: '#video' + videoIndex
                });
            } else if (keyPosition === 'f_popUp' && popUpIndex === 'return') {
                popUpIndex = 'confirm';
                $.focusTo({
                    el: '#fullScreenEnter .' + popUpIndex
                });
            } else if (keyPosition === 'b_popUp' && popUpIndex === 'return') {
                popUpIndex = 'confirm';
                $.focusTo({
                    el: '#backCue .' + popUpIndex
                });
            }
            return true;
        },
        'KEY_LEFT': function () {
            if (keyPosition === 'video') {
                keyPosition = 'bigVideo';
                $.focusTo({
                    el: '#bigVideo'
                });
            }
            return true;
        },
        'KEY_RIGHT': function () {
            if (keyPosition === 'bigVideo') {
                keyPosition = 'video';
                $.focusTo({
                    el: '#video' + videoIndex
                });
            }
            return true;
        },
        'KEY_OK': function () {
            if (keyPosition === 'bigVideo') {
                keyPosition = 'f_popUp';
                $fullScreenEnter.style.display='block';
                popUpIndex = 'confirm';
                $.focusTo({
                    el: '#fullScreenEnter .' + popUpIndex
                });
            } else if (keyPosition === 'video') {
                chooseBigVideo(videoIndex);
            } else if (keyPosition === 'f_popUp') {
                if (popUpIndex === 'confirm') {
                    //     $.gotoDetail({
                    //         contentType: '5',
                    //         // url: 'channel://~' + bigVideoId,
                    //         channelNum: '~' + bigVideoId['contentId'],
                    //     }, false, savedData);
                    // }
                    $.saveGlobalData('fourScreen', JSON.stringify([ bigVideoId, videoIdArr[0], videoIdArr[1], videoIdArr[2]]))
                    $.saveBackUrl(location.href);
                    $.gotoDetail({
                        contentType: '7',
                        url: 'channel://~' + bigVideoId,
                    });
                }else if(popUpIndex === 'return'){
                    returnToBigVideo();
                }
            } else if (keyPosition === 'b_popUp') {
                if (popUpIndex === 'confirm') {
                    if($.search.get('from') === 'plan' ) {
                        window.location.href = $.search.append('../plan/', { POSITIVE: null, inner: 1 });
                    } else {
                        window.location.href = $.search.append('../home/', {POSITIVE: null,inner: 1 });
                    }
                    // window.location.href = $.search.append(document.referrer, {POSITIVE: null,inner: 1 });
                } else if (popUpIndex === 'return') {
                    returnToPage();
                }
            }
            return true;
        },
        'KEY_RETURN': function () {
            if (keyPosition === 'f_popUp') {
                returnToBigVideo();
            } else if (keyPosition === 'b_popUp') {
                returnToPage();
            } else {
                saveKeyPosition = keyPosition;
                keyPosition = 'b_popUp';
                $backCue.style.display = 'block';
                popUpIndex = 'confirm';
                $.focusTo({
                    el: '#backCue .' + popUpIndex
                });
            }
            return true;
        },
        "KEY_VOLUME_UP": function() {
            var v = mp.getVolume();
            if (v > 0 || v === 0) {
                $('#timg').addClass('none');
            }
            v += 5;
            if (v > 100) {
                v = 100;
            }
            mp.setMuteFlag(0)
            mp.setVolume(v);
            updateVolume(v)
        },
        "KEY_VOLUME_DOWN": function() {
            var v = mp.getVolume();
            v -= 5;
            if (v <= 0) {
                v = 0;
                // Authentication.CUSetConfig('volFlag1', 'b');
                $('#timg').addClass('none');
                mp.setVolume(v);
                mp.setMuteFlag(1);
            } else {
                $('#timg').addClass('none');
                // Authentication.CUSetConfig('volFlag1', 'a');
                mp.setVolume(v);
                mp.setMuteFlag(0)
            }
            updateVolume(v)
        },
        "KEY_MUTE": function() {
            $('.vol').removeClass('block');
            if (mp.getMuteFlag() == 0) {
                $('#timg').removeClass('none');
                mp.setMuteFlag(1);
                // Authentication.CUSetConfig('volFlag1', 'b');
            } else if (mp.getMuteFlag() == 1) {
                $('#timg').addClass('none');
                mp.setMuteFlag(0);
                // Authentication.CUSetConfig('volFlag1', 'a');
            }
        },
    },
    init: function () {

    },
    active: function () {

    },
    deactive: function () {

    },
    cover: function () {
        return true;
    },
    uncover: function () {
        return true;
    },
    destroy: function () {

    }
})

function returnToBigVideo() {
    keyPosition = 'bigVideo';
    $fullScreenEnter.style.display = 'none';
    $.focusTo({
        el: '#bigVideo'
    });
}

function returnToPage() {
    $backCue.style.display = 'none';
    if (saveKeyPosition === 'bigVideo') {
        $.focusTo({
            el: '#bigVideo'
        });
    } else if (saveKeyPosition === 'video') {
        $.focusTo({
            el: '#video' + videoIndex
        });
    }
    keyPosition = saveKeyPosition;
}

$.UTIL.each(videoIdArr, function (value, index) {
    createPlayer(index);
});

function load(){
    var pageName = 'fourScreen';
    $.recodeData(pageName, "access");
    initPage();
    // channelIdArr.forEach(function(element) {
    //     if(element['contentUri'].indexOf('#') === -1){
    //         flag = false;
    //     }
    // });
    // if(channelIdArr) {
    //     for(var i = 0; i < channelIdArr.length; i++) {
    //         if(channelIdArr[i]['contentUri'].indexOf('#') === -1){
    //             flag = false;
    //             break;
    //         }
    //     }
    // }
    // if(flag){
    //     initPage()
    // }else{
        // window.G_AUTH({ // 鉴权
        //     success: function (result) {
        //         result
        //             ? initPage()
        //             : $.auth.forwardOrder();
    
        //     }
        // });
    // }
}

function unload() {

}

function initPage() {
    var bgImgUrl = $.getPic(backgroundImg[0].pics, [0]);
    if(bgImgUrl) {
        // document.getElementById('bgImg').src = $.getPic(backgroundImg[0].pics, [0]);
        document.getElementById('bgImg').setAttribute('src', bgImgUrl);
    }
    document.getElementById('bgImg').onload = (function(){
         // 初始化之后加载标题
    $('#bigVideoName')[0].innerText = channelIdArr[0]['contentName'] || '';
    for (var i = 1; i < channelIdArr.length; i++) {
        $('#video' + (i - 1) + 'Name')[0].innerText = channelIdArr[i]['contentName'] || '';
    }
    var oC = $('#caBg')[0];
    var oGC = oC.getContext('2d');
    var oImg = $('#bgImg')[0];
    $fullScreenEnter =document.getElementById('fullScreenEnter');
    $backCue = document.getElementById('backCue');
    oGC.drawImage(oImg, 0, 0);
    oGC.clearRect(bigVideoPosition.left, bigVideoPosition.top, bigVideoPosition.width, bigVideoPosition.height);
    $.UTIL.each(smallListPosition, function (value, index) {
        oGC.clearRect(value.left, value.top, value.width, value.height);
    });
    $.UTIL.each(videoIdArr, function (value, index) {
        $('#video' + index).addClass('transparent');
    });
    $.pTool.active('fourScreen');
    $.focusTo({
        el: '#bigVideo'
    });
    })
   
}
function createBigPlayer() {
    var player = new MediaPlayer('MOSAIC');
    player.setNativeUIFlag(0);
    player.set('HaveorNoVoice', 1);
    player.setVideoDisplayMode(0);
    player.setVideoDisplayArea(bigVideoPosition.left, bigVideoPosition.top, bigVideoPosition.width, bigVideoPosition.height);
    player.refreshVideoDisplay();
    // player.setMuteFlag(0);
    bigVideoPlayer = player;
    var validChannel = channelObj[bigVideoId];
    if (validChannel) {
        var mediaObj = {
            mediaCode: validChannel.mediaId + '',
            mediaURL: validChannel.num,
            mediaType: 1,
            streamType: 2
        };
        player.setSingleMedia(JSON.stringify(mediaObj));
        player.playFromStart();
        // window.mp = player;
        setTimeout(function () {
            window.mp = player;
            mp.setMuteFlag(0);
        }, 100);
    }
}

function createPlayer(index) {
    var player = new MediaPlayer('MOSAIC');
     player.setNativeUIFlag(0);
     player.set('HaveorNoVoice', 1);
     player.setVideoDisplayMode(0);
     player.setVideoDisplayArea(smallListPosition[index].left, smallListPosition[index].top, smallListPosition[index].width, smallListPosition[index].height);
     player.refreshVideoDisplay();
     player.setMuteFlag(1);
     videoPlayerArr.push(player);

    /*if (index === 0) {
        playerList[0].enableSQMMonitor();
    }*/
     var validChannel = channelObj[videoIdArr[index]];
     if (validChannel) {
         var mediaObj = {
            mediaCode: validChannel.mediaId + '',
            mediaURL: validChannel.num,
            mediaType: 1,
            streamType: 2
        };
         player.setSingleMedia(JSON.stringify(mediaObj));
         player.playFromStart();
     }
   
   
}

function chooseBigVideo(index) {
    var saveBigVideoPlayer = bigVideoPlayer;
    var saveBigVideoId = bigVideoId;
    bigVideoPlayer.setMuteFlag(true);
    bigVideoPlayer = videoPlayerArr[index];
    bigVideoId = videoIdArr[index];
    videoPlayerArr[index] = saveBigVideoPlayer;
    videoIdArr[index] = saveBigVideoId;

    // 设置大窗口的标题
    var bigVideoName = $('#bigVideoName')[0].innerText;
    var smallVideoName = $('#video' + index + 'Name')[0].innerHTML;
    $('#bigVideoName')[0].innerText = smallVideoName;
    $('#video' + index + 'Name')[0].innerHTML = bigVideoName;

    bigVideoPlayer.setVideoDisplayArea(bigVideoPosition.left, bigVideoPosition.top, bigVideoPosition.width, bigVideoPosition.height);
    bigVideoPlayer.refreshVideoDisplay();

    videoPlayerArr[index].setVideoDisplayArea(smallListPosition[index].left, smallListPosition[index].top, smallListPosition[index].width, smallListPosition[index].height);
    videoPlayerArr[index].refreshVideoDisplay();
    // $.initVolume(bigVideoPlayer);
    window.mp = bigVideoPlayer;
    mp.setMuteFlag(0);
}
var volumeTimer;
function updateVolume(precent) {
    clearTimeout(volumeTimer);
    $('.vol').addClass('block');
    var width = precent / 5 * 28;
    $('#pBar').css({
        width: width + 'px'
    });
    $('#volNum').html(precent / 5);
    if (precent === 0) {
        $('.icon').addClass('silence');
    } else {
        $('.icon').removeClass('silence');
    }
    $('#warning').addClass('none');
    volumeTimer = setTimeout(function() {
        $('.vol').removeClass('block');
    }, 3000);
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