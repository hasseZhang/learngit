(function (root) {
    var APIService = $.getVariable("EPG:isTest") ?
        {
            service: "http://10.128.7.100:8083",
            outService: "http://10.128.7.100:8083"
        } : {
            service: "http://10.128.4.63:8083",
            outService: "http://10.128.4.63:8083"
        };
    var defaults = {
        // boxid: 'gdtest1002'
        boxid: $.getVariable("EPG:userId"),
    };
    root.USER_SERVCICE = function (apiServe, defaults, apis) {
        return function (apiPoints, pointsSclones) {
            for (var item in pointsSclones) {
                (function (item) {
                    pointsSclones[item] = function (dataSource, obj) {
                        var method = "GET", url = apiPoints[item], data = null;
                        // 处理请求方法
                        /^P:/.test(url) && (method = "POST", url = url.replace(/^P:/, ""));
                        // 处理请求参数
                        var server = url.match(/^[^\?&\/]+/)[0];
                        url = url.replace(server, apiServe[server]).replace(/{[\w-]+}/g, function () {
                            var i = arguments[0].replace(/^{|}$/g, "");
                            return defaults[i] && (arguments[0] = defaults[i]) || arguments[0]
                        })
                        var params = url.match(/{[\w-]+}/g) || [];
                        for (var i = 0; i < params.length; i++) {
                            var param = params[i].replace(/^{|}$/g, "");
                            url = url.replace(params[i], function () {
                                return dataSource[param] && (arguments[0] = dataSource[param]) || "";
                            })
                        }
                        if (method === 'POST') {
                            data = JSON.stringify($.search.get("", url));
                            url = url.split("?")[0];
                        }
                        $.ajax({
                            url: url,
                            method: method,
                            data: data,
                            timeout:5e3,
                            async: !obj.hasOwnProperty("async") || obj.async,
                            success: function (result) {
                                result = JSON.parse(result), obj.success && obj.success && obj.success.call(null, result)
                            },
                            error: function (res) {
                                obj.error && obj.error && obj.error.call(null, res)
                            }
                        })
                    }
                })(item);
            }
            return pointsSclones
        }(apis, $.UTIL.sclone(apis))
    }(APIService, defaults, {
        consume: "P:service/growthApi/consume?boxid={boxid}&consume={consume}&orderid={orderid}&orderinfo={orderinfo}",
        userinfo: "service/growthApi/userinfo?boxid={boxid}",
        logout: "service/pointsApi/logout?boxid={boxid}",
        consumestrm: "service/growthApi/consumestrm?boxid={boxid}",
        userGift: "service/growthApi/userGift?boxid={boxid}",
        pointsStream: "service/pointsApi/pointsStream?boxid={boxid}",
        pointGift: "service/pointsApi/pointGift?boxid={boxid}",
        addPoints: "P:service/pointsApi/addPoints?boxid={boxid}&pointtype={pointtype}",
        holePoints: "service/pointsApi/holePoints?ptstrmid={ptstrmid}",
        changePoints: "P:service/pointsApi/changePoints?boxid={boxid}&points={points}&goodsId={goodsId}",
        goodsList: "service/pointsApi/goodsList",
        sendCode: "outService/pointsApi/sendCode?phone={phone}",
        blindPhone: "P:service/pointsApi/blindPhone?boxid={boxid}&phone={phone}&checkcode={checkcode}",
        pointsTask: "service/pointsApi/pointsTask?boxid={boxid}",
        growthTitle: "service/growthApi/growthTitle",
        giftlist: "service/growthApi/giftList?boxid={boxid}",
        holdGift: "P:service/growthApi/holdGift?boxid={boxid}&giftid={giftid}",
        pointRule: "service/pointsApi/pointRule",
        postQRcode: "outService/growthApi/postQRcode?boxid={boxid}",
        signRecord: "service/pointsApi/signRecord?boxid={boxid}",
        getAutoSignStatus:"service/pointsApi/getAutoSignStatus?boxid={boxid}"
    })
    root.USER_SERVCICE.host = $.getVariable("EPG:isTest") ? "http://10.128.7.100:8190" : "http://10.128.4.63:8190";

})(window);