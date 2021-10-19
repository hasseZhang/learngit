[[
    [
        {
            "guidance" : {
                "get" : "{{origin}}/pub/dataSource/GuidanceContents/{{id}}/index.js"
            },
            "category" : {
                "get" : "{{origin}}/pub/dataSource/CategoryContents/{{id}}/index.js"
                ,
                "asc" : "{{origin}}/pub/dataSource/CategoryContents/{{id}}/index_asc.js"
                ,
                "num" : "{{origin}}/pub/dataSource/CategoryContents/{{id}}/index_{{num}}.js"
            },
            "charge" : {
                "get" : "{{origin}}/pub/dataSource/chargesInfoJs/{{ddId}}/index.js"
            },
            "playbill" : {
                "get" : "{{origin}}/pub/json/{{date}}/{{id}}.js"
            }
        }, null, {
            "cue" : function(tips){
                Logger.out.error = ["missing parameters", tips];
            },
            "filter" : function(txt){
                var arr = [
                    "var data = []",
                    "function GuidanceContentListCallback(ds, id){if(ds){for(var i=0;i<ds.length;i++){if(ds[i]){if(ds[i].contentType==='3'){ds[i].contentType='7'}else if(ds[i].contentType==='7'){ds[i].contentType='3'}}}}data.push(ds, id);}",
                    "function categoryContentListCallback(ds){data.push(ds);}",
                    "function getscheduleInfo(){}function _scheduleInfoCallback(ds){data.push(ds);}",
                    "function callbackChargesInfo(){data.push(distChargesInfo);}"
                ];
                arr.push(txt);
                arr.push("return data");
                return Function(arr.join(";"))();
            },
            "success" : function(ds, id){
                Logger.out.error = ["no success handler!", ds, id];
            },
            "error" : function(e){
                Logger.out.error = ["no error handler!", "error", e];
            }
        }
    ]
    ,
    [
        {
            "detail" : {
                "get" : "{{origin}}/pub/dataSource/detailPageJs/{{ddId}}/({{id}})"
            }
            ,
            "castInfos" : {
                "get" : "{{origin}}/pub/dataSource/castInfos/{{ddId}}/({{id}})"
            }
        }, null, {
            "fixUrl" : function(url){
                return url.replace(/\((.*)\)/, function(){
                    return getFTPFilePath(arguments[1], "js");
                });
            },
            "cue" : function(tips){
                Logger.out.error = ["missing parameters", tips];
            },
            "filter" : function(txt){
                var arr = [
                    "var data = []",
                    "function dataResourceLoadFinish(){data.push(detailInfo)}function castInfoCallback(ds){data.push(ds)}"
                ];
                arr.push(txt);
                arr.push("return data");
                return Function(arr.join(";"))();
            },
            "success" : function(ds){
                Logger.out.error = ["no success handler!", ds];
            },
            "error" : function(e){
                Logger.out.error = ["no error handler!", "error", e];
            }
        }
    ]
    ,
    [
        {
            "onLineHeartbeat" : {
                "now" : "{{origin}}/VSP/V3/OnLineHeartbeat"
            },
            "vod" : {
                "query" : "{{origin}}/VSP/V3/QueryVOD#VODID={{id}}&IDType=1",
                "play" : "{{origin}}/VSP/V3/PlayVOD#VODID={{id}}&mediaID={{mediaId}}"
            },
            "tvod" : {
                "query" : {
                    "url" : "{{origin}}/VSP/V3/QueryPlaybillList?userPlaybillListFilter={{filter}}"
                    ,
                    "_" : {
                        "filter" : ""
                    }
                },
                "play" : "{{origin}}/VSP/V3/PlayChannel#businessType=CUTV&isReturnProduct=1&channelID={{channelId}}&mediaID={{mediaId}}&playbillID={{playbillId}}"
            }
        }, {
            origin : "EPG:domain"
        }, {
            "method" : "POST",
            "cue" : function(tips){
                Logger.out.error = ["missing parameters", tips];
            },
            "filter" : function(txt){
                try{
                    txt = JSON.parse(txt);
                }catch(e){
                    Logger.out.error = ["parse error", txt];
                }
                return [txt];
            },
            "success" : function(ds){
                Logger.out.error = ["no success handler!", ds];
            },
            "error" : function(e){
                Logger.out.error = ["no error handler!", "error", e];
            }
        }
    ]
    ,
    [
        {
            "search" : {
                "topN" : {
                    "url" : "{{origin}}/es/1/topN/?categoryIds={{categoryIds}}&size={{size}}&callback={{callback}}"
                    ,
                    "_" : {
                        "categoryIds" : "",
                        "size" : 24,
                        "callback" : ""
                    }
                }
                ,
                "getByN" : {
                    "url" : "{{origin}}/es/1/search/{{name}}?categoryIds={{categoryIds}}&cat={{cat}}&pageNum={{pageNum}}&pageSize={{pageSize}}&callback={{callback}}&sid={{sid}}&userId={{userId}}"
                    ,
                    "_" : {
                        "categoryIds" : "",
                        "cat" : "",
                        "pageNum" : 0,
                        "pageSize" : 100,
                        "callback" : "",
                        "sid" : ""
                    }
                }
                ,
                "getByActor" : {
                    "url" : "{{origin}}/es/1/searchByActor/{{actor}}?categoryIds={{categoryIds}}&cat={{cat}}&seriesFlag={{seriesFlag}}&pageNum={{pageNum}}&pageSize={{pageSize}}&callback={{callback}}&sid={{sid}}"
                    ,
                    "_" : {
                        "seriesFlag" : -1,
                        "categoryIds" : "",
                        "cat" : "",
                        "pageNum" : 0,
                        "pageSize" : 100,
                        "callback" : "",
                        "sid" : ""
                    }
                }
                ,
                "getByContent" : {
                    "url" : "{{origin}}/es/1/searchByContent?name={{name}}&description={{description}}&actorId={{actorId}}&actor={{actor}}&directorId={{directorId}}&director={{director}}&column={{column}}&category={{category}}&tag={{tag}}&matchType={{matchType}}&sort={{sort}}&pageNum={{pageNum}}&pageSize={{pageSize}}&callback={{callback}}&sid={{sid}}"
                    ,
                    "_" : {
                        "name" : "",
                        "description" : "",
                        "actorId" : "",
                        "actor" : "",
                        "directorId" : "",
                        "director" : "",
                        "column" : "",
                        "category" : "",
                        "tag" : "",
                        "matchType" : "",
                        "sort" : "",
                        "pageNum" : 0,
                        "pageSize" : 10,
                        "callback" : "",
                        "sid" : ""
                    }
                }
            }
        }, {
            "origin" : "vari:common.es"
            ,
            "callback" : ""
        }, {
            "cue" : function(tips){
                Logger.out.error = ["missing parameters", tips];
            },
            "filter" : function(txt){
                try{
                    txt = JSON.parse(txt);
                }catch(e){
                    Logger.out.error = ["parse error", txt];
                }
                return [txt];
            },
            "success" : function(d){
                Logger.out.error = ["no success handler!", d];
            },
            "error" : function(e){
                Logger.out.error = ["no error handler!", "error", e];
            }
        }
    ]
    ,
    [
        {
            "fav" : {
                "query" : "{{origin}}/favorite/media/get/{{userId}}/{{node}}/{{mediaId}}/{{platform}}"
                ,
                "all" : "{{origin}}/favorite/media/get/{{userId}}/{{node}}"
                ,
                "add" : "{{origin}}/favorite/media/put/{{userId}}/{{node}}/{{mediaId}}/{{platform}}/{{categoryId}}/{{mediaType}}"
                ,
                "remove" : "{{origin}}/favorite/media/delete/{{userId}}/{{node}}/{{mediaId}}/{{platform}}"
                ,
                "empty" : "{{origin}}/favorite/media/delete/{{userId}}/{{node}}"
            }
            ,
            "his" : {
                "query" : "{{origin}}/history/media/get/{{userId}}/{{node}}/{{mediaId}}/{{platform}}"
                ,
                "all" : "{{origin}}/history/media/get/{{userId}}/{{node}}"
                ,
                "add" : {
                    "url" : "{{origin}}/history/media/put/{{userId}}/{{node}}/{{mediaId}}/{{platform}}/{{leaveTime}}/{{categoryId}}/{{mediaType}}?sceneId={{sceneId}}&totalTime={{totalTime}}&sceneInfo={{sceneInfo}}"
                    ,
                    "_" : {
                        "sceneId" : ""
                        ,
                        "totalTime" : ""
                        ,
                        "sceneInfo" : ""
                    }
                }
                ,
                "remove" : "{{origin}}/history/media/delete/{{userId}}/{{node}}/{{mediaId}}/{{platform}}"
                ,
                "empty" : "{{origin}}/history/media/delete/{{userId}}/{{node}}"
            }
            ,
            "chanfav" : {
                "query" : "{{origin}}/favorite/channel/get/{{userId}}/{{node}}/{{channelId}}"
                ,
                "add" : "{{origin}}/favorite/channel/put/{{userId}}/{{node}}/{{channelId}}"
                ,
                "remove" : "{{origin}}/favorite/channel/delete/{{userId}}/{{node}}/{{channelId}}"
                ,
                "empty" : "{{origin}}/favorite/channel/delete/{{userId}}/{{node}}"
            }
            ,
            "chanhis" : {
                "add" : "{{origin}}/history/channel/put/{{userId}}/{{node}}/{{channelId}}"
            }
            ,
            "reserve" : {
                "add" : "{{origin}}/reserve/channel/put/{{userId}}/{{node}}/{{program}}/{{startTime}}/{{channelId}}"
                ,
                "remove" : "{{origin}}/reserve/channel/delete/{{userId}}/{{node}}/{{startTime}}"
                ,
                "empty" : "{{origin}}/reserve/channel/delete/{{userId}}/{{node}}"
            }
            ,
            "chanpiphis" : {
                "add" : "{{origin}}/history/mini_channel/put/{{userId}}/{{node}}/{{channelId}}"
                ,
                "empty" : "{{origin}}/history/mini_channel/delete/{{userId}}/{{node}}"
            }
            ,
            "kb" : {
                "query" : "{{origin}}/history/keyboard_type/get/{{userId}}/{{node}}"
                ,
                "add" : "{{origin}}/history/keyboard_type/put/{{userId}}/{{node}}/{{keyboardType}}"
            }
        }, {
            "origin" : "vari:common.userInfo"
        }, {
            "cue" : function(tips){
                Logger.out.error = ["missing parameters", tips];
            },
            "filter" : function(txt){
                try{
                    txt = JSON.parse(txt);
                }catch(e){
                    Logger.out.error = ["parse error", txt];
                }
                return [txt];
            },
            "success" : function(ds){
                Logger.out.error = ["no success handler!", ds];
            },
            "error" : function(e){
                Logger.out.error = ["no error handler!", "error", e];
            }
        }
    ]
    ,
    [
        {
            "email" : {
                "count" : "{{origin}}/search/email/getUnreadNum/userId/{{userId}}/{{callback}}"
                ,
                "detail" : "{{origin}}/search/email/getEmailInfosById/Id/{{id}}/userEmailId/{{userEmailId}}/{{callback}}"
                ,
                "query" : "{{origin}}/search/email/getGuidanceName/emailId/{{emailId}}/{{callback}}"
                ,
                "all" : "{{origin}}/search/email/getEmailInfosByUserId/userId/{{userId}}/beginNum/{{beginNum}}/endNum/{{endNum}}/{{callback}}"
                ,
                "read" : {
                    "url" : "{{origin}}/update/email/updateEmailStatusById/Id/{{id}}/userId/{{userId}}/status/{{status}}/{{callback}}"
                    ,
                    "_" : {
                        "status" : "read"
                    }
                }
                ,
                "remove" : {
                    "url" : "{{origin}}/update/email/updateEmailStatusById/Id/{{id}}/userId/{{userId}}/status/{{status}}/{{callback}}"
                    ,
                    "_" : {
                        "status" : "delete"
                    }
                }
                ,
                "empty" : "{{origin}}/delete/email/deleteAllInfoByUserId/userId/{{userId}}/{{callback}}"
                ,
                "top" : "{{origin}}/search/email/topEmail/userId/{{userId}}/{{callback}}"
            }
        }, {
            "origin" : "vari:common.email"
            ,
            "callback" : ""
        }, {
            "cue" : function(tips){
                Logger.out.error = ["missing parameters", tips];
            },
            "filter" : function(txt){
                try{
                    txt = JSON.parse(txt);
                }catch(e){
                    Logger.out.error = ["parse error", txt];
                }
                return [txt];
            },
            "success" : function(d){
                Logger.out.error = ["no success handler!", d];
            },
            "error" : function(e){
                Logger.out.error = ["no error handler!", "error", e];
            }
        }
    ]
    ,
    [
        {
            "chanfav" : {
                "all" : "{{origin}}/favorite/channel/get/{{userId}}/{{node}}"
            }
            ,
            "chanhis" : {
                "query" : "{{origin}}/history/channel/get/{{userId}}/{{node}}"
            }
            ,
            "chanpiphis" : {
                "query" : "{{origin}}/history/mini_channel/get/{{userId}}/{{node}}"
            }
        }, {
            "origin" : "vari:common.userInfo"
        }, {
            "cue" : function(tips){
                Logger.out.error = ["missing parameters", tips];
            },
            "filter" : function(txt){
                var code = 0;
                try{
                    var ds = JSON.parse(txt);
                    code = ds.code;
                    if(ds && ds.data){
                        txt = $.getChanById(ds.data);
                        if(txt && !$.UTIL.isArray(txt)){
                            txt = [txt];
                        }
                    }else{
                        txt = [];
                    }
                }catch(e){
                    Logger.out.error = ["parse error", txt];
                }
                return [{code:code,data:txt}];
            },
            "success" : function(ds){
                Logger.out.error = ["no success handler!", ds];
            },
            "error" : function(e){
                Logger.out.error = ["no error handler!", "error", e];
            }
        }
    ]
    ,
    [
        {
            "reserve" : {
                "all" : "{{origin}}/reserve/channel/get/{{userId}}/{{node}}"
            }
        }, {
            "origin" : "vari:common.userInfo"
        }, {
            "cue" : function(tips){
                Logger.out.error = ["missing parameters", tips];
            },
            "filter" : function(txt){
                try{
                    txt = JSON.parse(txt);
                    if(txt && txt.data && txt.data.length){
                        each(txt.data, function(v, k) {
                            txt.data[k].channelId = $.getChanById(v.channelId);
                        });
                    }
                }catch(e){
                    Logger.out.error = ["parse error", txt];
                }
                return [txt];
            },
            "success" : function(ds){
                Logger.out.error = ["no success handler!", ds];
            },
            "error" : function(e){
                Logger.out.error = ["no error handler!", "error", e];
            }
        }
    ]
    ,
    [
        {
            "auth" : {
                "queryOrderInfo" : "{{origin}}/orders/user/{{userId}}"
                ,
                "queryOrderResult" : "{{origin}}/orders/status/{{orderId}}"
                ,
                "creatOrderForm" : {
                    "url" : "{{origin}}/orders/service_order?spId={{spId}}&productId={{productId}}&userId={{userId}}&productName={{productName}}&columnId={{columnId}}&contentId={{contentId}}&chargesType={{chargesType}}&cpId={{cpId}}&vodName={{vodName}}&productType={{productType}}&serialNum={{serialNum}}&areaId={{areaId}}&customerRenew={{customerRenew}}&cycleType={{cycleType}}&fee={{fee}}(&token={{token}}&promotionid={{tFeeId}}&discountCouponId={{discountCouponId}})"
                    ,
                    "_" : {
                        "productName" : "",
                        "columnId" : "",
                        "contentId" : "",
                        "cpId" : "",
                        "vodName" : "",
                        "productType" : "",
                        "serialNum" : "",
                        "customerRenew" : 0,
                        "cycleType" : 1,
                        "fee" : 1,
                        "promotionid":"",
                        "discountCouponId":""
                    }
                }
                ,
                "cancel" : "{{origin}}/orders/cancel/{{orderId}}/{{userId}}"
                ,
                "payBill" : {
                    "url" : "{{origin}}/orders/payBill/{{orderId}}?payType={{payType}}&orderId={{orderId}}&checkCode={{checkCode}}&phone={{phone}}&cdkey={{cdkey}}&callback={{callback}}"
                    ,
                    "_" : {
                        "checkCode" : "",
                        "phone" : "",
                        "cdkey" : "",
                        "callback" : ""
                    }
                }
                ,
                "queryPkgPrice" : "{{origin}}/orders/fees/{{userId}}/{{productIds}}"
                ,
                "getCheckCode" : "{{origin}}/orders/checkcode/{{phone}}/{{userId}}"
                ,
                "queryPhoneScore" : "{{origin}}/orders/point/{{phone}}/{{userId}}?checkCode={{checkCode}}"
                ,
                "productAuth" : "{{originAuth}}/auth/serviceAuth?productId={{productId}}&userId={{userId}}&contentId={{contentId}}&chargesType={{chargesType}}(&token={{token}})"
            }
        }, {
            "origin" : "vari:common.orders"
            ,
            "originAuth" : "vari:common.auth"
        }, {
            "fixUrl" : function(url){
                return url.replace(/\((.*)\)/, function(){
                    if(/{{token}}/.test(arguments[1])){
                        return '';
                    }else{
                        return arguments[1];
                    }
                });
            },
            "cue" : function(tips){
                Logger.out.error = ["missing parameters", tips];
            },
            "filter" : function(txt){
                try{
                    txt = JSON.parse(txt);
                }catch(e){
                    Logger.out.error = ["parse error", txt];
                }
                return [txt];
            },
            "success" : function(ds){
                Logger.out.error = ["no success handler!", ds];
            },
            "error" : function(e){
                Logger.out.error = ["no error handler!", "error", e];
            }
        }
    ],
    [
        {
            "rc":{
                "checkActive":"{{origin}}/user/mobileInfo/{{bindId}}/{{callback}}",
                "getMobileInfos":"{{origin}}/user/mobileInfos/{{bindId}}/{{callback}}",
                "shouldOnline":"{{origin}}/user/shouldOnline/{{bindId}}/{{callback}}",
                "setOffline":"{{origin}}/user/setOffline/bindId/{{bindId}}/{{callback}}",
                "bind":"{{origin}}/user/qrcode/bind/{{area}}/{{cp}}/{{userId}}/{{node}}/{{bindId}}/{{mobileId}}/{{mobileName}}/{{callback}}",
                "unactive":"{{origin}}/user/qrcode/unactive/{{bindId}}/{{mobileId}}/{{callback}}",
                "unbind":"{{origin}}/user/qrcode/unbind/{{bindId}}/{{mobileId}}/{{callback}}",
                "qrcode":"{{originQr}}/user/qrcode/get/{{area}}/{{cp}}/{{userId}}/{{node}}/{{bindId}}/{{callback}}"
            }
        }, 
        {"origin":"vari:common.bind","originQr":"vari:common.qr","callback":""}, 
        {
            "filter":function(txt){
                try{txt = JSON.parse(txt);
            }catch(e){}return [txt];},
            "success":function(ds){},
            "error":function(e){}
        }
    ]
]]