var RECODE_DATA_KEY = "myiptv";


var pageName = RECODE_DATA_KEY;

var pageInfo = $.initPageInfo(pageName, ["focusIndex"], {
    focusIndex: 0
});
var $iptvList = null;
var myIptvList = [];
var maxLen = 10;

function load() {
    $.recodeData(pageName, "access"),
    $iptvList = $("#iptvList");
    myIptvList = eval('epgData_'+($.getVariable('EPG:isTest') ? '1100006021':'1100006180'));
    iptvList.init({
        focusIndex:pageInfo.focusIndex
    })
    createMyIptv();
    $.getEdition(function(type){
        $.pTool.get("version").init({
            activeKey: type === 'simplifiedEdition' ? 'old' : 'children',
            leaveVersion:leaveVersion,
            avtiveVersion: type === 'simplifiedEdition' ? 'old' : 'children',
            isShow: true,
        });
    })
    $.pTool.add(iptvList.key,iptvList)
    $.pTool.active(iptvList.key)
}
var iptvList = function() {
    var focusIndx;
    var key = "iptvList";
    var getFocus =function (){
        return focusIndx;
    }
    var keysMap = {
        KEY_DOWN: function () {
           if(focusIndx < 5){
                focusIndx += 5;
           }else{
                return true;
           }   
            var nextEl = "#iptv_item" + focusIndx;
            $.focusTo({
                el: nextEl
            });
        },
        KEY_UP: function () {
            if(focusIndx < 5){
                return true
            }else{
                focusIndx -= 5
                var nextEl = "#iptv_item" + focusIndx;
                $.focusTo({
                    el: nextEl
                });
            }
        },
        KEY_LEFT: function () {
            if (focusIndx === 0 || focusIndx === 5) {
                return true
            } else {
                focusIndx -=1
                var nextEl = "#iptv_item" + focusIndx;
                $.focusTo({
                    el: nextEl
                });
                moFocus();
            }
        },
        KEY_RIGHT: function () {
            if (focusIndx === 4 || focusIndx === 9) {
                return true
            } else {
                focusIndx +=1
                var nextEl = "#iptv_item" + focusIndx;
                $.focusTo({
                    el: nextEl
                });
                moFocus();
            }
        },
        KEY_RETURN:function(){
                $.back()
        },
        KEY_OK: function () {
            saveData();
            if (/setting/.test(myIptvList[focusIndx].contentUri)) {
                $.gotoDetail({
                    contentType: "7",
                    url: "app://com.android.settings"
                });
            } else if (/currentMenu=sfb/.test(myIptvList[focusIndx].contentUri)) {
                $.gotoDetail($.urls.orderSfb);
            } else if (/currentMenu=nouse/.test(myIptvList[focusIndx].contentUri)) {
                $.gotoDetail($.urls.couponNouse);
            } else if (/currentMenu=kq/.test(myIptvList[focusIndx].contentUri)) {
                $.gotoDetail($.urls.orderkq);
            } else if (/email/.test(myIptvList[focusIndx].contentUri)) {
                $.gotoDetail($.urls.email);
            } else if (/block_changeVersion/.test(myIptvList[focusIndx].contentUri)) {
                $.pTool.get("version").show();
                $.pTool.active("version");
            } else if (/playHistory/.test(myIptvList[focusIndx].contentUri)) {
                $.gotoDetail($.urls.recent);
            }else if (/favorite/.test(myIptvList[focusIndx].contentUri)) {
                $.gotoDetail($.urls.favv);
            }else if (/liveNote/.test(myIptvList[focusIndx].contentUri)) {
                $.gotoDetail($.urls.reserve);
            }
            return true
        }
    };
    var active = function () {
        var el = "#iptv_item" + focusIndx;
            $.focusTo({
                el: el
            });
    };
    var deactive = function () {
    };
    var _init = function(options){
        focusIndx = options.focusIndex
    };
    return {
        getFocus:getFocus,
        init:_init,
        key: key,
        keysMap: keysMap,
        active: active,
        deactive: deactive
    };
}();
function createMyIptv(){
    myIptvList && (myIptvList = myIptvList.slice(0,maxLen))
    var html ='';
    myIptvList.forEach((element,index) => {
        var pics = $.getPic(element.pics, [ 69 ]);
        html +=`<li id='iptv_item${index}' class="iptvItem"><img src='${pics}'></li>`
    });
    if(maxLen > myIptvList.length){
        for(var i = myIptvList.length; i < maxLen; i++){
            html +=`<li id='iptv_item${i}' class="iptvItem"><img src='./images/default.png'></li>`
        }
    }
    $iptvList.html(html);
}
function unload() {
    saveData();
    myIptvList = null;
}
function saveData(){
    var saveObj = {
        focusIndex: iptvList.getFocus()
    };
    $.savePageInfo(pageName, saveObj);
}
function leaveVersion() {
    $.pTool.active("iptvList");
}