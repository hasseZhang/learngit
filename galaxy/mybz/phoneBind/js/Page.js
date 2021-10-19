var pageName = "phoneBind";

var pageInfo = $.initPageInfo(pageName, ["menu"], {
    menu: {
        focusIndex: 0,
        // isActive: true
    }
    // PhoneBind: {
    //     isActive: !1,
    //     focus: "PhoneBind_item0",
    //     firstLineIndex: 0,
    //     focusIndex: 0
    // },
});
var gId = $.getVariable('EPG:isTest') ? '1100007038' : '1100007038';
var initPage = true;

function load() {
    menu.addToPtool();
    $.recodeData(pageName, "access");
    menu.init({
        menuList: [ "双屏绑定" ],
        focusIndex: pageInfo.menu.focusIndex,
        right: function() {
            $.pTool.active("phoneBind");
            // $.pTool.get("phoneBind").animate(0);
        }
    });
    // if(pageInfo.menu.isActive){
        menu.active();
    // }
    getImg();
    $.pTool.get("phoneBind").init();
}
function getImg(){
    $.s.guidance.get({
        id: gId
    }, {
        success: function (data) {
            data[0].pics.forEach((item,index) =>{
                if(item.picType === '0'){
                    $('#userIntro').find('img').item(0).attr("src", `/pic/${item.picPath}`)
                }else if(item.picType === '66'){
                    $('#GDCode').find('img').item(0).attr("src", `/pic/${item.picPath}`)
                }
                })
        },
        error: function () {
            
        }
    });
} 					

function unload() {
    $.savePageInfo(pageName, {
        menu: menu.getState()
    });
    top.rc.shouldOnlineStop();
}
// 手机遥控页面的插件
$.pTool.add("phoneBind", function() {
    var cfg = {
        data: [],
        initkey: !0,
        btnIndex: 0,
        btnSign: 0,
        keyArr: [ ".open", ".untying" ],
        phoneListLength: 0,
        maxSize: 3,
        first: false
    };
    var codeText = {
        "#GDCode" : "扫码下载，吉智app",
        "#QRCode" : "扫描二维码，绑定IPTV"
    };
    var _init = function(callback) {
        getQRCode(0);
        queryBindingNum();
    };
    function getQRCode(timeout) {
        setTimeout(function() {
            top.rc.qrcode(function(data) {
                $("#QRCode img").attr({
                    src: data.filePath
                });
                getQRCode(data.lifeCycle);
            }, function() {
                getQRCode(6e4);
            });
        }, timeout);
    }
    function queryBindingNum() {
        top.rc.getMobileInfos(function(res) {
            sendToFrame(res);
            if (res.code && res.data && res.data.length) {
                $("#moreBindNum").hide();
                cfg.data = reverse(res.data);
                _renderList();
                cfg.first = true;
            } else {
                $("#totalNum .txt").html("0");
                $("#totalNum .txt").css('color','red');
                $("#moreBindNum").show();
                $.pTool.active(menu.key);
            }
        }, function() {
            $("#totalNum .txt").html("0");
            $("#totalNum .txt").css('color','red');
            $("#moreBindNum").show();
            $.pTool.active(menu.key);
            sendToFrame({});
        });
    }
    function sendToFrame(data) {
        top.rc.mobileInfosCallback(data || {
            code: 1,
            data: cfg.data
        });
        top.rc.shouldOnlineStart();
    }
    function reverse(result) {
        var arr = [];
        for (var i = result.length - 1; i >= 0; i--) {
            arr.push(result[i]);
        }
        return arr;
    }
    function _renderList() {
        var html = "";
        $("#phoneList").html("");
        cfg.phoneListLength = Math.min(cfg.data.length, cfg.maxSize);
        for (var i = 0; i < cfg.phoneListLength; i++) {
            html += '<div class="phoneList" id="phoneList' + i + '"><div class="phoneNum">' + cfg.data[i].mobileName + '</div><div class="open'+ (cfg.data[i].active ? ' active' : '') +'"><div class="text">' + (cfg.data[i].active ? "开启" : "关闭") + '</div></div><div class="untying"><div class="text">解绑定</div></div></div>';
        }
        $("#totalNum .txt").html(cfg.phoneListLength);
        $("#phoneList").html(html);
    }
    function focusTo() {
        var key = "#phoneList" + cfg.btnIndex + " " + cfg.keyArr[cfg.btnSign];
        _focusTo(key);
    }
    function removePhone() {
        var id = cfg.data[cfg.btnIndex].mobileId;
        top.rc.unbind(id, function(res) {
            if (res && res.code && res.code == 1) {
                cfg.data.splice(cfg.btnIndex, 1);
                if (cfg.data.length) {
                    _renderList();
                    if (cfg.btnIndex == cfg.data.length) {
                        cfg.btnIndex = cfg.data.length - 1;
                    }
                    focusTo();
                } else {
                    $("#phoneList").html("");
                    $("#totalNum .txt").html("0");
                    $("#totalNum .txt").css('color','red');
                    $("#moreBindNum").show();
                    _focusTo("#QRCode");
                }
                sendToFrame();
            }
        }, function(err) {});
    }
    function gotoOpenOrOff() {
        var id = cfg.data[cfg.btnIndex].mobileId;
        var sign = cfg.data[cfg.btnIndex].active;
        if (sign) {
            top.rc.unactive(id, function(res) {
                if (res && res.code) {
                    cfg.data[cfg.btnIndex].active = !sign;
                }
                ChangeState(cfg.data[cfg.btnIndex].active);
                sendToFrame();
            }, function(err) {});
        } else {
            var name = cfg.data[cfg.btnIndex].mobileName;
            top.rc.bind(id, name, function(res) {
                if (res && res.code && res.code == 1) {
                    cfg.data[cfg.btnIndex].active = !sign;
                }
                ChangeState(cfg.data[cfg.btnIndex].active);
                sendToFrame();
            }, function(err) {});
        }
    }
    function ChangeState(sign) {
        var key = "#phoneList" + cfg.btnIndex + " " + cfg.keyArr[cfg.btnSign] + " .text";
        var text = "";
        if (sign) {
            text = "开启";
            $("#phoneList" + cfg.btnIndex + " " + cfg.keyArr[cfg.btnSign]).addClass('active')
        } else {
            text = "关闭";
            $("#phoneList" + cfg.btnIndex + " " + cfg.keyArr[cfg.btnSign]).removeClass('active')
        }
        $(key).html(text);
    }
    function _focusTo(key) {
        $.focusTo({
            el: key
        });
    }
    function _active() {
        // if (!cfg.data.length || cfg.first) {
        //     _focusTo("#GDCode");
        // } else {
        //     focusTo();
        // }
        _focusTo("#GDCode");
    }
    return {
        key: "phoneBind",
        dft: false,
        keysDftMap: [ "KEY_UP", "KEY_DOWN", "KEY_LEFT", "KEY_RIGHT", "KEY_OK" ],
        keysMap: {
            KEY_UP: function() {
                if ($.activeObj.el == "#GDCode" || $.activeObj.el == "#QRCode") return;
                if (cfg.btnIndex == 0) {
                    if(cfg.btnSign == 0){
                        _focusTo("#GDCode");
                    }else{
                        _focusTo("#QRCode");
                    }   
                } else {
                    cfg.btnIndex--;
                    focusTo();
                }
            },
            KEY_DOWN: function() {
                if( cfg.data.length ){
                    if($.activeObj.el == "#GDCode"){
                        cfg.btnSign = 0;
                        focusTo();
                        return;
                    }
                    if($.activeObj.el == "#QRCode"){
                        cfg.btnSign = 1;
                        focusTo();
                        return;
                    }
                    cfg.btnIndex++;
                    if (cfg.btnIndex == cfg.data.length) {
                        cfg.btnIndex = cfg.data.length - 1;
                    }
                    focusTo();
                }
            },
            KEY_LEFT: function() {
                if($.activeObj.el == "#GDCode") {
                    // var cls = $(".focusBorder").attr("class").replace(/focusBorder/, "");
                    // $(".focusBorder").attr("class", cls);
                    $.pTool.active(menu.key);
                    return;
                }
                if($.activeObj.el == "#QRCode") {
                   _focusTo("#GDCode");
                   return;
                }
                cfg.btnSign = 0;
                focusTo();
                //     focusTo();
                // if (cfg.btnSign == 0 || !cfg.data.length) {
                //     var cls = $(".focusBorder").attr("class").replace(/focusBorder/, "");
                //     $(".focusBorder").attr("class", cls);
                //     cfg.btnIndex = 0;
                //     $.pTool.active(menu.key);
                // } else {
                //     cfg.btnSign = 0;
                //     focusTo();
                // }
            },
            KEY_RIGHT: function() {
                if ($.activeObj.el == "#GDCode") {
                    _focusTo("#QRCode");
                    return;
                }
                if ($.activeObj.el == "#QRCode") {
                    return;
                }
                cfg.btnSign = 1;
                focusTo();
            },
            KEY_OK: function() {
                if ($.activeObj.el == "#QRCode" || $.activeObj.el == "#GDCode"){
                    $(".codeImg").find('img').item(0).attr('src',$($.activeObj.el).find('img').item(0).attr('src'));
                    $(".codeText").html(codeText[$.activeObj.el]);
                    $.pTool.active('biggerCode');
                    return;
                };
                if (cfg.btnSign == 0) {
                    gotoOpenOrOff();
                } else {
                    removePhone();
                }
            }
        },
        init: _init,
        active: _active
    };
}());
// 点击ok，放大二位码的插件
$.pTool.add('biggerCode',function(){
    var focusObj;
    function _active(){
        focusObj = $.activeObj.el;
        $('#biggerCode').show();
        $.focusTo({
            el: '.codeImg'
        })
    }
    function _deactive(){
        $('#biggerCode').hide();
    }
    return {
        key:'biggerCode',
        dft: false,
        keysDftMap: [ "KEY_RETURN", "KEY_OK" ],
        keysMap: {
            KEY_OK:function(){
                $.pTool.active('phoneBind');
                $.focusTo({
                    el: focusObj
                })
                return true;
            },
            KEY_RETURN:function(){
                $.pTool.active('phoneBind');
                $.focusTo({
                    el: focusObj
                })
                return true;
            },
        },
        active:_active,
        deactive:_deactive
    }
}());

function refreshOrder() {
    location.reload(true);
}
