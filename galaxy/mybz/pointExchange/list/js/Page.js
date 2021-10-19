var pageName = "pointExchangeList";
var PAGE_INFO = [];

var pageInfo = $.initPageInfo(pageName, ["focusIndex", "scorllLength", "pagePos"], {
    focusIndex: 0,
    scorllLength: 0,
    pagePos: 0
});

// 获取全部包信息
var allPkgInfo = $.auth.getPkgInfo();
// 获取用户ID
var userId = $.getVariable("EPG:userId");
// 获取用户Token
var token = Authentication.CUGetConfig("AuthToken") || ""
    // 获取可兑换导读数据
var gId = $.getVariable('EPG:isTest') ? '1100007325' : '1100005902';
// 服务器地址
var serverUrl = $.getVariable('EPG:isTest') ? '10.128.7.100:8008' : '10.128.7.2:8008'

var focusIndex = 0;
var pageData = [];
var scorllLength = 0;
var pagePos = 0;
var subscribed;
var alreadyMsg = '';

var exchangeList = function() {
    var key = "exchangeList";
    var keysMap = {
        KEY_UP: function() {
            if (!focusIndex) return false;
            focusIndex--;
            if (!pagePos) {
                scorllLength += 320;
                var itemDom = document.getElementsByClassName('exchangeItem')
                for (var i = 0; i < itemDom.length; i++) {
                    document.getElementsByClassName('exchangeItem')[i].style['-webkit-transform'] = 'translateY(' + scorllLength + 'px)';
                }
            }
            $.focusTo({ el: "#exchangeBtn" + focusIndex });
            pagePos = 0; // 这种写法有坑，如果一页超过两条内容的时候就得重新写了，不信你试试。
            progress();
        },
        KEY_DOWN: function() {
            if (pageData.length - 1 == focusIndex) return false;
            focusIndex++;
            if (pagePos) {
                scorllLength -= 320;
                var itemDom = document.getElementsByClassName('exchangeItem')
                for (var i = 0; i < itemDom.length; i++) {
                    document.getElementsByClassName('exchangeItem')[i].style['-webkit-transform'] = 'translateY(' + scorllLength + 'px)';
                }
            }
            $.focusTo({ el: "#exchangeBtn" + focusIndex });
            pagePos = 1;
            progress();
        },
        KEY_OK: function() {
            if ($('#exchangeBtn' + focusIndex).hasClass('subscribed')) return false;
            $.pTool.deactive('exchangeList');
            $.get('http://' + ($.getVariable('EPG:isTest') ? '10.128.7.100:9080' : '10.128.7.43:8288') + '/valuedas/api/1.0/whiteblack/checkblack?iptvid=' + userId, {
                success: function(res) {
                    if (JSON.parse(res)['data']) {
                        $.get('http://' + serverUrl + '/verify/token/validate?userId=' + userId + '&token=' + token, {
                            success: function(res) {
                                var flag = JSON.parse(res)['flag'];
                                if (flag) {
                                    var arrListStatus = ['1100000381', '1100000761'].indexOf(pageData[focusIndex]['chargeId']) > -1;
                                    // var chargeId = arrListStatus ? [pageData[focusIndex]['chargeId'], '1100000241'] : pageData[focusIndex]['chargeId'];
                                    var packageArr = arrListStatus ? [{ chargeId: pageData[focusIndex]['chargeId'] }, { chargeId: '1100000241' }] : [{ chargeId: pageData[focusIndex]['chargeId'] }]
                                    $.auth.auth({
                                        package: packageArr,
                                        callback: function(res) {
                                            if (res == "timeOut") {
                                                $.pTool.active(netError().key);
                                                return;
                                            }
                                            if (res) {
                                                var subObj = subscribed.reduce(function(acc, cur) {
                                                    acc[cur.productId] = cur.name
                                                    return acc
                                                }, {})
                                                var name = pageData.filter(function(item) {
                                                    return item.chargeId == pageData[focusIndex]['chargeId']
                                                })[0]['productName']
                                                alreadyMsg = subObj.hasOwnProperty(chargeId) ?
                                                    '您已购买' + subObj[chargeId] :
                                                    '您已拥有' + name + '权益，可直接观看'
                                                $.pTool.active('alreadyBuy')
                                            } else {
                                                // 鉴权失败，未购买
                                                savePageInfo();
                                                $.forward($.getVariable("EPG:pathPage") + '/pointExchange/exchange/index.html?chargeId=' + pageData[focusIndex]['chargeId'] + '&price=' + pageData[focusIndex]['fee']);
                                            }
                                        }
                                    })
                                } else {
                                    $.pTool.active('tokenError');
                                }
                            },
                            error: function() {
                                savePageInfo();
                                $.forward($.getVariable("EPG:pathPage") + '/pointExchange/exchange/index.html?chargeId=' + pageData[focusIndex]['chargeId'] + '&price=' + pageData[focusIndex]['fee']);
                            }
                        })
                    } else {
                        // 在黑名单
                        $.pTool.active('blackList');
                    }
                },
                error: function() {
                    savePageInfo();
                    $.forward($.getVariable("EPG:pathPage") + '/pointExchange/exchange/index.html?chargeId=' + pageData[focusIndex]['chargeId'] + '&price=' + pageData[focusIndex]['fee']);
                }
            })
            return true;
        }
    };
    var active = function() {};
    var deactive = function() {};
    return {
        key: key,
        keysMap: keysMap,
        active: active,
        deactive: deactive
    };
}

var alreadyBuy = function() {
    var key = "alreadyBuy";
    var keysMap = {
        KEY_OK: function() {
            deactive();
            return true;
        },
        KEY_RETURN: function() {
            deactive();
            return true;
        }
    };
    var active = function() {
        $('#showInfo').html(alreadyMsg);
        $('#alreadyBuy').css('display', 'block');
    };
    var deactive = function() {
        alreadyMsg = "";
        $('#alreadyBuy').css('display', 'none');
        $.focusTo({ el: "#exchangeBtn" + focusIndex });
        $.pTool.active('exchangeList');
    };
    return {
        key: key,
        keysMap: keysMap,
        active: active,
        deactive: deactive
    };
}

var blackList = function() {
    var key = "blackList";
    var keysMap = {
        KEY_OK: function() {
            $.pTool.active(exchangeList().key, exchangeList());
            deactive();
            return true;
        },
        KEY_RETURN: function() {
            $.pTool.active(exchangeList().key, exchangeList());
            deactive();
            return true;
        }
    };
    var active = function() {
        $('#blackList').css('display', 'block');
    };
    var deactive = function() {
        $('#blackList').css('display', 'none');
    };
    return {
        key: key,
        keysMap: keysMap,
        active: active,
        deactive: deactive
    };
}

function progress() {
    var index = focusIndex || 0;
    var datalen = pageData.length;
    if (datalen <= 2) {
        $("#progressBar").hide();
    } else {
        $("#progressBar").show();
    }
    var len = $("#progressBar")[0].clientHeight - 110;
    var everyMove = len / (Math.ceil(datalen) - 1);
    $("#progressBar #strip").css("top", everyMove * index + "px");
}

var tokenError = function() {
    var key = "tokenError";
    var keysMap = {
        KEY_OK: function() {
            $.pTool.active(exchangeList().key, exchangeList());
            deactive();
            return true;
        },
        KEY_RETURN: function() {
            $.pTool.active(exchangeList().key, exchangeList());
            deactive();
            return true;
        }
    };
    var active = function() {
        $('#tokenError').css('display', 'block');
    };
    var deactive = function() {
        $('#tokenError').css('display', 'none');
    };
    return {
        key: key,
        keysMap: keysMap,
        active: active,
        deactive: deactive
    };
}

var load = function() {

    // 初始化内容部分
    $.pTool.add(exchangeList().key, exchangeList());
    $.pTool.add(alreadyBuy().key, alreadyBuy());
    $.pTool.add(blackList().key, blackList());
    $.pTool.add(tokenError().key, tokenError());
    $.pTool.add(netError().key, netError());

    $.s.guidance.get({
        id: gId
    }, {
        success: function(data) {
            var supportPkg = data[0].contentUri.split('&');
            supportPkg.length > 2 && ($('<div id="progressBar" class="hide"><div id="strip"></div>').appendTo($("body")),
                setTimeout(function() {
                    $("#progressBar #strip").css("webkitTransition", '.5s');
                }, 500));
            var ListInfo = supportPkg.filter(function(item) {
                return Object.keys(allPkgInfo).indexOf(item) > -1;
            })
            $.get('http://' + serverUrl + '/orders/fees/' + userId + '/' + ListInfo.join('-'), {
                success: function(res) {
                    JSON.parse(res)['products'].forEach(function(v, i) {
                        allPkgInfo[v.productId]['fee'] = v.fees.filter(function(item) { return item.cycleType })[0]['fee']
                    })
                    $.get('http://' + serverUrl + '/orders/user/' + userId, {
                        success: function(res) {
                            subscribed = JSON.parse(res).package;
                            renderList({
                                allPkgInfo: allPkgInfo,
                                ListInfo: ListInfo,
                                subscribed: JSON.parse(res).package.reduce(function(acc, cur) {
                                    return (cur.payType == 5 && (new Date(cur.expiredTime) > new Date())) ? [...acc, cur.productId] : acc
                                }, [])
                            })
                        }
                    })
                },
                error: function() {
                    // 请求出错
                }
            })
        },
        error: function() {
            // errorCb();
        }
    });

}

var unload = function() {
    // savePageInfo();
}

var savePageInfo = function() {
    var saveInfo = {
        focusIndex: focusIndex,
        scorllLength: scorllLength,
        pagePos: pagePos
    }
    $.savePageInfo(pageName, saveInfo);
}

var renderList = function(Obj) {
    var strHtml = "";
    Obj.ListInfo.forEach(function(v, i) {
        var item = Obj.allPkgInfo[v];
        pageData.push(item);
        strHtml += '<div class="exchangeItem">' +
            '<div class="pic"><img src="' + item.picPath + '" id="img' + i + '"></div>' +
            '<span class="name">名称：' + item.productName + '</span>' +
            '<span class="price">价格：' + item.fee + ' 积分/1个月</span>' +
            '<div class="description">' +
            '<span class="descriptionLabel">简介：</span>' +
            '<span class="descriptionInfo">' + item.description + '</span>' +
            '</div>' +
            '<div class="exchangeBtn ' + (Obj.subscribed.indexOf(v) > -1 ? 'subscribed' : '') + '" id="exchangeBtn' + i + '"></div>' +
            '</div>';
    })
    $('#exchangeList').html(strHtml);
    focusIndex = parseInt(pageInfo.focusIndex);
    $.focusTo({ el: "#exchangeBtn" + focusIndex });
    var itemDom = document.getElementsByClassName('exchangeItem')
    scorllLength = pageInfo.scorllLength;
    for (var i = 0; i < itemDom.length; i++) {
        itemDom[i].style['-webkit-transform'] = 'translateY(' + scorllLength + 'px)';
    }
    pagePos = pageInfo.pagePos;
    $.pTool.active('exchangeList');
    progress();
}

function netError() {
    var key = "netError";
    var keysMap = {
        KEY_RETURN: function() {
            $.pTool.deactive('netError');
            return true;
        },
        KEY_OK: function() {
            $.pTool.deactive('netError');
            return true;
        }
    };
    var active = function() {
        $.focusTo('netError');
        $('#netError').css({ display: 'inline-block' });
    };
    var deactive = function() {
        $.focusTo({ el: "#exchangeBtn" + focusIndex });
        $('#netError').css({ display: 'none' });
        $.pTool.active('exchangeList');
    };
    return {
        key: key,
        keysMap: keysMap,
        active: active,
        deactive: deactive
    };
}


// document.addEventListener('keydown', function (e) {
//     if (e.keyCode == 288) {
//         location.href = location.href;
//     }
// })