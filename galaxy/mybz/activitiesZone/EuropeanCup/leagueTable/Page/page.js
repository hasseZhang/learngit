var pageName = "EuropeanCupLeagueTable";
var serverUrl = "http://10.128.4.10:4000";
var serverIp = $.getVariable("EPG:isTest") ? '10.128.46.129:30015' : '10.128.46.129:30015';
var ACTIVE_OBJECT
var oCanvas = null;
var oGc = null;
var focusIndex
var rightTotal = null
var leftTotal = null
var disableBtn
var type
var tjIndex
var btnIndex
var btnType
var pointIndex
var $left = null
var $itemList = null
var $error = null
var scrollH
var phoneNum = ""
var $progressBar = null
var $strip = null
var detialLen = 0
var detialIndex
var tjData = []
var scorex4Url = null
var pageInfo = $.initPageInfo(pageName, ["focusIndex", "tjIndex", "type", "btnIndex", "btnType","pointIndex","scrollH", "currentPage","disableBtn"], {
    focusIndex: 0,//当前焦点索引
    tjIndex: 0,//左侧推荐位索引
    type: "right",//进入默认焦点
    btnIndex: 0,//按钮焦点索引
    btnType: 1,//按钮状态
    disableBtn: 0,//翻倍按钮状态
    pointIndex: 0,//积分排行焦点索引
    scrollH: 0,//积分列表滚动距离
    currentPage: 0 //积分明细列表焦点页数
});
focusIndex = pageInfo.focusIndex;
tjIndex = pageInfo.tjIndex;
type = pageInfo.type;
btnIndex = pageInfo.btnIndex;
btnType = pageInfo.btnType;
disableBtn = pageInfo.disableBtn;
pointIndex = pageInfo.pointIndex;
scrollH = pageInfo.scrollH;
currentPage = pageInfo.currentPage;

// var PAGE_INFO = [
//     {
//         key: "list",
//         pressLeft: _Left,
//         pressRight: _Right,
//         pressUp: _Up,
//         pressDown: _Down,
//         pressOk: _Ok
//     }
// ]
// var ACTIVE_OBJECT = PAGE_INFO[0];
$.pTool.add("detialPop", {
    key: "detialPop",
    keysMap: {
        KEY_UP: function(){
            if(detialLen>7 && currentPage>0){
                currentPage--;
                moveDetialList(0);
            }            
            return true;
        },
        KEY_DOWN: function(){
            if(detialLen>7 && currentPage<Math.floor(detialLen/7)){
                currentPage++;
                moveDetialList(1);
            }            
            return true;
        },
        KEY_RETURN: function(){
            $("#detialActivity").hide();
            detialIndex = 0;
            $.pTool.deactive('detialPop');
            $.pTool.active('homepage');
            $.focusTo({
                el: $("#point2")
            })
            return true;
        }
    },
    active: function () {
        $('#detialActivity').show();        
        $.pTool.deactive('homepage');
        initDetialList();
    }
});
$.pTool.add("telPop", {
    key: "telPop",
    keysMap: {
        KEY_0: function(){
            pressNO(0);
            return true;
        },
        KEY_1: function(){
            pressNO(1);
            return true;
        },
        KEY_2: function(){
            pressNO(2);
            return true;
        },
        KEY_3: function(){
            pressNO(3);
            return true;
        },
        KEY_4: function(){
            pressNO(4);
            return true;
        },
        KEY_5: function(){
            pressNO(5);
            return true;
        },
        KEY_6: function(){
            pressNO(6);
            return true;
        },
        KEY_7: function(){
            pressNO(7);
            return true;
        },
        KEY_8: function(){
            pressNO(8);
            return true;
        },
        KEY_9: function(){
            pressNO(9);
            return true;
        },
        KEY_RETURN: function () {
            var elem = $(".focusBorder")[0];
            if(phoneNum && elem.id=="inputArea"){
                delNum();
            }else{
                phoneNum="";
                $("#inputArea").html("请按数字键输入手机号");
                $('#telActivity').hide();            
                initPoints();
                initRightList();
                $("#telActivityOk").removeClass("active");
                $("#telActivityBack").removeClass("active");
                $.pTool.deactive('telPop');
                $.focusTo({
                    el: "#point0"
                })
                $.pTool.active('homepage');
            }
            return true;
        },
        KEY_DELETE: function () {
            delNum();
            return true;
        },
        KEY_PAGEUP: function () {
            return true;
        },
        KEY_PAGEDOWN: function () {
            return true;
        },
        KEY_UP: function(){
            var elem = $(".focusBorder")[0];
            if(elem.id=="telActivityBack"){
                $.focusTo({
                    el: "#inputArea"
                })
            }else if(elem.id=="telActivityOk"){
                $.focusTo({
                    el: "#inputArea"
                })
            }else if(elem.id=="inputArea"){
                return
            }
            $("#telActivityOk").removeClass("active");
            $("#telActivityBack").removeClass("active");
        },
        KEY_DOWN: function(){
            var elem = $(".focusBorder")[0];
            if(elem.id=="telActivityBack"){
                return
            }else if(elem.id=="telActivityOk"){
                return
            }else if(elem.id=="inputArea"){
                $("#telActivityOk").removeClass("active");
                $("#telActivityBack").removeClass("active");
                $.focusTo({
                    el: "#telActivityOk"
                })
                $("#telActivityOk").addClass("active");
            }
        },
        KEY_LEFT: function(){
            var elem = $(".focusBorder")[0];
            if(elem.id=="telActivityBack"){
                $("#telActivityOk").removeClass("active");
                $("#telActivityBack").removeClass("active");
                $.focusTo({
                    el: "#telActivityOk"
                })
                $("#telActivityOk").addClass("active");
            }else if(elem.id=="telActivityOk"){
                return
            }else if(elem.id=="inputArea"){
                return
            }
        },
        KEY_RIGHT: function(){
            var elem = $(".focusBorder")[0];
            if(elem.id=="telActivityBack"){
                return
            }else if(elem.id=="telActivityOk"){
                $("#telActivityOk").removeClass("active");
                $("#telActivityBack").removeClass("active");
                $.focusTo({
                    el: "#telActivityBack"
                })
                $("#telActivityBack").addClass("active");
            }else if(elem.id=="inputArea"){
                return
            }
        },
        KEY_OK: function () {
            var elem = $(".focusBorder")[0];
            if(elem.id=="point0"||elem.id=="inputArea"){return}
            if(elem.id=="telActivityBack"){
                phoneNum="";
                $("#inputArea").html("请按数字键输入手机号");
                $('#telActivity').hide();
                initPoints();
                $.pTool.deactive('telPop');
                $.focusTo({
                    el: "#point0"
                })
                $.pTool.active('homepage');
            }else if(elem.id=="telActivityOk"){
                var tag= checkPhone(phoneNum)
                if(tag){
                    var callback=function(){
                        //手机号正确
                        btnType = 0;                        
                        phoneNum="";
                        $("#inputArea").html("请按数字键输入手机号");
                        initPoints();
                        initRightList();
                        if(disableBtn){
                            $.focusTo({
                                el: "#point2"
                            })
                        }else{
                            $.focusTo({
                                el: "#point1"
                            })
                        }    
                    }
                    postPhone(callback)                                    
                }else{
                    $("#inputArea").addClass("public_shake");
                    $error.show()
                    return;     
                }
                $('#telActivity').hide();
                $.pTool.deactive('telPop');                
                $.pTool.active('homepage');
            }           
            $("#telActivityOk").removeClass("active");
            $("#telActivityBack").removeClass("active");
        }
    },
    active: function () {
        $("#phoneError").hide();
        $('#telActivity').show();
        $.focusTo({
            el: "#inputArea"
        })
        $.pTool.deactive('homepage');
    }
});
$.pTool.add("homepage", {
    key: "homepage",
    keysMap: {
        KEY_UP: function(){
            if (type === "right") {
                return;
            }else if(type === "left"){
                if(tjIndex>0){
                    tjIndex--;
                    focusTo();
                }else{
                    return;
                }
            }else{
                if(pointIndex==0){
                    type = "right"
                    focusTo();
                }else{
                    pointIndex--;
                    $("#currentLine").html(pointIndex+1)
                    moveList();
                    focusTo();
                }
                
            }
        },
        KEY_DOWN: function(){
            if (type === "right") {
                type = "list";
                focusTo();
            }else if(type === "left"){
                if(tjIndex<2){
                    tjIndex++;
                    focusTo();
                }else{
                    return;
                }
            }else{
                if(pointIndex<rightTotal-1){
                    pointIndex++;
                    $("#currentLine").html(pointIndex+1)
                    moveList();
                    focusTo();
                }        
            }
        },
        KEY_LEFT: function(){
            if (type === "left") {
                return;
            }else if(type === "right"){
                if(btnIndex==0){
                    type='left';
                    tjIndex=0;
                    focusTo();
                }else{
                    if(btnType){
                        btnIndex--;
                        // if(disableBtn){
                        //     btnIndex-=2;                    
                        // }else{
                        //     btnIndex--;
                        // }
                    }else{
                        if(btnIndex>1){
                            btnIndex--;
                        }else{
                            type='left';
                            tjIndex=0;
                            focusTo();
                        }     
                        // if(disableBtn){
                        //     type='left';
                        //     tjIndex=0;
                        //     focusTo();
                        // }else{
                        //     if(btnIndex>1){
                        //         btnIndex--;
                        //     }else{
                        //         type='left';
                        //         tjIndex=0;
                        //         focusTo();
                        //     }                    
                        // }
                    }
                    focusTo();
                }
            }else{
                var offTop=getPositionTop();
                if(offTop<400){
                    type='left';
                    tjIndex=0;
                    focusTo();
                }else if(offTop<700){
                    type='left';
                    tjIndex=1;
                    focusTo();
                }else{
                    type='left';
                    tjIndex=2;
                    focusTo();
                }
            }
        },
        KEY_RIGHT: function(){
            if (type === "right") {
                if(btnIndex==2){
                    return;
                }else{   
                    btnIndex++;         
                    // if(disableBtn){
                    //     btnIndex+=2;                    
                    // }else{
                    //     btnIndex++;
                    // }
                    focusTo();
                }        
            }else{
                type='list';            
                focusTo();
                // if(tjIndex<1){
                //     if(btnType){
                //         btnIndex=0;
                //     }else{
                //         btnIndex=1;
                //         // if(disableBtn){
                //         //     btnIndex=2;
                //         // }else{
                //         //     btnIndex=1;
                //         // }
                //     }
                //     type='right';
                //     focusTo();
                // }else{
                //     type='list';            
                //     focusTo();
                // }
            }
        },
        KEY_OK: function(){
            var elem = $(".focusBorder")[0];
            if(elem.id==="point0"){
                $.pTool.active('telPop');
            }else if(elem.id==="point1"){
                if(!disableBtn){$.gotoDetail(scorex4Url);}
            }else if(elem.id==="point2"){
                $.pTool.active('detialPop');
            }else if(elem.id==="url0"){
                $.gotoDetail(tjData[0]);
                //$.redirect($.getVariable("EPG:pathPage")+'/'+tjData[0].contentUri,true)
            }else if(elem.id==="url1"){
                $.gotoDetail(tjData[1]);
            }else if(elem.id==="url2"){
                $.gotoDetail(tjData[2]);
            }
        }
    }
})
function getScorex4Url(id){
    $.s.guidance.get({
        id: id
    }, {
        success: function (data) {
            scorex4Url = data[0]
        },
        error: function () { }
    });
}
function getPositionTop(){
    var elTop = 0;
    var elem = $(".focusBorder")[0];
    var elHeight = "";
    var lastElemKey = "itemContent";
    while (elem) {
        if (elem.id == lastElemKey) {
            elTop += elem.offsetTop; 
            break;
        }
        elTop += elem.offsetTop;
        elem = elem.offsetParent;
    }
    return elTop + elHeight - scrollH;
}
function postPhone(callback){
    var url = 'http://' + serverIp + '/euro/cup/bindPhone/'+$.getVariable("EPG:userId")+'/'+3;
    $.post(url, {
        data: JSON.stringify({
            mobile: phoneNum
        }),
        timeout: 8e3,
        success: function (res) {
            var json = JSON.parse(res)
            if(json.code==200){
                callback();

            }else{
                us_cue && us_cue.show({
                    type: 2,
                    text: "绑定失败，请您稍后重试。"
                });
            }
            
        },
        error: function (e) {
            us_cue && us_cue.show({
                type: 2,
                text: "绑定失败，请您稍后重试。"
            });
        }
    });
}
function progress() {
    var $content = $("#detialContent")[0];
    var step = Math.ceil(detialLen/7);
    $progressBar = $('<div id="progressBar"><div class="strip"></div></div>').appendTo($content);    
    var stripHeight=$("#progressBar").clientHeight()/step;
    $strip = $("#progressBar .strip");
    $strip.css("height", stripHeight + "px");
    // var e = ($progressBar[0].clientHeight - 109) / (Math.ceil(detialLen / 1) - 1),
    //     t = +focusIndex >= 1 ? Math.floor(focusIndex / 1) : 0; 
    //     $strip.css("top", e * t + "px") 
} 
function initDetialList(){
    var html = "";
    //detialLen = 15;
    var url = 'http://' + serverIp + '/euro/cup/detail/'+$.getVariable("EPG:userId")+'/'+3;
    $.get(url, {
        timeout: 8e3,
        success: function (res) {
            var json = JSON.parse(res)
            var str='',arr=[],res='';
            detialLen = json.data.length;
            if(detialLen>7 && $("#progressBar").length==0){progress();}
            if(json.data&&json.data.length>0){
                for(var k=0;k<detialLen;k++){
                    str=json.data[k].createTime
                    arr=str.split("-")
                    res=arr.length>0?(arr[0]+"年"+arr[1]+"月"+arr[2]+"日"):""
                    html+='<div class="innerDetial" id="detial'+ k +'">'+
                            '<div class="method">'+ (json.data[k].type=="guessing"?"欧洲杯竞猜":"") +'</div>'+
                            '<div class="score">+'+ json.data[k].score  +'</div>'+
                            '<div class="vip">'+ (json.data[k].vip?"x4":"无") +'</div>'+
                            '<div class="time">'+ res +'</div>'+
                        '</div>'
                }
            }else{
                html = '<div class="noDetialList"></div>'
            }
            
            $("#detialList").html(html)
        },
        error: function (e) {
        }
    });   
    
    
}
function checkPhone(phoneNum) {
    return /1(\w)\d{9}/.test(phoneNum);
}
function delNum() {
    if (phoneNum) {
        phoneNum = phoneNum.substring(0, phoneNum.length - 1);
        if(phoneNum){
            $("#inputArea").html(phoneNum);
        }else{
            $("#inputArea").html("请按数字键输入手机号");
        }        
    } else {        
        //$.back();
    }
}
function pressNO(num) {
    var elem = $(".focusBorder")[0];
    if(elem.id!=="inputArea"){
        return;
    }
    if (phoneNum.length > 10) {
        var tag = checkPhone(phoneNum);
        if(tag){$error.hide()}
        return;
    } else {
        phoneNum = phoneNum + num;
        $("#inputArea").html(phoneNum);
    }
}
var offLen = 0;
function moveDetialList(tag){
    var step = Math.ceil(detialLen/7);
    var stripHeight=$("#progressBar").clientHeight()/step;
    if(tag){
        //下
        offLen += (detialLen - currentPage * 7) > 7 ? 7*92 : (detialLen - currentPage * 7) * 92;
        $("#detialList").css({
            "-webkit-transform": "translateY(" + -offLen + "px)"
        })
        $strip.css("top", currentPage*stripHeight + "px");  
    }else{
        //上
        offLen = currentPage<1?0:offLen-(detialLen-(currentPage+1)*7)*92;
        $("#detialList").css({
            "-webkit-transform": "translateY(" + -offLen + "px)"
        })
        $strip.css("top", currentPage*stripHeight + "px");  
    }
      
    // var fix_end_index = 7 - 1 - 1
    // var list_begin = detialIndex - 1;
    // var list_begin_length = detialLen - 1 - fix_end_index;
    // var top = 0;
    // if(list_begin <= 0){
    //     top = 0;
    // } else if(list_begin >= list_begin_length){
    //     top = - (list_begin_length - 1) * 62;
    // }else{
    //     top = - list_begin * 62;
    // }
    // $("#detialList").css({
    //     "-webkit-transform": "translateY(" + top + "px)"
    // })
}
function moveList(){
    var fix_end_index = 9 - 3 - 1
    var list_begin = pointIndex - 3;
    var list_begin_length = rightTotal - 3 - fix_end_index;
    var top = 0;
    if(list_begin <= 0){
        top = 0;
    } else if(list_begin >= list_begin_length){
        top = - (list_begin_length - 1) * 80;
    }else{
        top = - list_begin * 80;
    }
    scrollH=rightTotal>9?Math.abs(top)<=80?0:Math.abs(top):0;
    $("#itemList").css({
        "-webkit-transform": "translateY(" + (rightTotal>9?top:0) + "px)"
    })
}
function load() {
    var saveObj=$.getGlobalData(pageName);
    var isTest = $.getVariable("EPG:isTest");
    var bgId=isTest ?'1100010611':'1100010656';
    var listId=isTest ?'1100010626':'1100010657';
    var scoreId=isTest ?'1100010653':'1100010658';
    if(saveObj){
        btnIndex=saveObj.btnIndex,
        btnType=saveObj.btnType,
        disableBtn=saveObj.disableBtn,
        //currentPage=saveObj.currentPage,
        focusIndex=saveObj.focusIndex,
        pointIndex=saveObj.pointIndex,
        scrollH=saveObj.scrollH,
        tjIndex=saveObj.tjIndex,
        type=saveObj.type
    }
    $left = $("#left")
    $itemList = $("#itemList")
    $error = $("#phoneError")    
    oCanvas = $("#caBg")[0];
    oGC = oCanvas.getContext("2d");
    drawBg(bgId)
    initLeftList(listId)
    getScorex4Url(scoreId)
    initRightList();
    initPoints();
    $.pTool.active('homepage');
    setTimeout(function(){
        $("#itemList").addClass("transition")
    },500)
    $.recodeData(pageName, "access");
}
function initPoints(){    
    // btnType = 1;
    // disableBtn = 1;
    var url = 'http://' + serverIp + '/euro/cup/summary/'+$.getVariable("EPG:userId")+'/'+3;
    $.get(url, {
        timeout: 8e3,
        success: function (res) {
            var json = JSON.parse(res)
            if(json.data.mobile){
                btnType = 0                
            }else {
                btnType = 1
            }
            if(json.data.vip){
                disableBtn = 1
            }else{
                disableBtn = 0
            }
            if(!btnType){
                if(disableBtn){
                    btnIndex=2
                }else{
                    btnIndex=1
                }
            }
            phoneHtml(json.data.mobile,json.data.score,json.data.rank)
            focusTo();
        },
        error: function (e) {
        }
    });   
    
}
function phoneHtml(phone,score,rank){
    var html=''
    var defaultClass=btnType?"":" has"
    var point1HTml=btnType?'填写手机号后可加入榜单排名':'我的排名：' + (rank == "9999" ? "" :rank)
    var point2HTml=btnType?'<div class="telBtn button">填写手机号</div>':'手机号：' + phone
    var disBtn = disableBtn?"disabled":""
    html='<div class="point1'+ defaultClass +'">'+point1HTml+'</div>'+
            '<div id="point0" class="point2'+ defaultClass +'">'+point2HTml+'</div>'+
            '<div class="point3">我的积分: '+ score +'</div>'+
            '<div id="point1" class="point4"><div class="fourFold button '+ disBtn +'">'+(disableBtn?"已翻倍x4":"点我积分x4")+'</div></div>'+
            '<div id="point2" class="point5"><div class="pointDetial button">积分明细</div></div>'
    $("#myPoints").html(html);
    $("#myPoints").css("border","5px solid #225eb4")
}
function drawBg(id) {
    $.s.guidance.get({
        id: id
    }, {
        success: function (data) {
            canvasBg(data[0].pics[0].picPath)
        },
        error: function () { }
    });
}
function initLeftList(id) {
    $.s.guidance.get({
        id: id
    }, {
        success: function (data) {
            var list = data;
            var html = '';
            tjData = list;
            leftTotal = list.length;
            if (leftTotal >= 3) {
                $.UTIL.each(list, function (value, index) {
                    html += '<div class="url" id="url' + index + '"><img src="/pic/' + value.pics[0].picPath + '"></div>'
                })

            } else {
                for (var i = 0; i < 3; i++) {
                    if (i < leftTotal) {
                        html += '<div class="url" id="url' + i + '"><img src="/pic/' + list[i].pics[0].picPath + '"></div>'
                    } else {
                        html += '<div class="url" id="url' + i + '"><img src="" class="noPic"></div>'
                    }
                }
            }
            $left.html(html)
        },
        error: function () {
        }
    });
}
function initRightList() {
    var html = '';
    var nam = "";
    //rightTotal = 20;
    var url = 'http://' + serverIp + '/euro/cup/rank';
    $.get(url, {
        timeout: 8e3,
        success: function (res) {
            var json = JSON.parse(res)
            rightTotal = json.data.length
            if(json.data&&json.data.length>0){
                for(var i=0;i<rightTotal;i++){
                    nam=i==0?"champion":i==1?"secondWin":i==2?"thirdWin":""
                    html+='<div class="inner" id="innerItem'+ i +'"><div class="'+nam+' num">'+(i+1)+'</div><div class="tel">'+json.data[i].identify+'</div><div class="count">'+json.data[i].score+'分</div></div>'
                }                
            }else{
                html = '<div class="noScoreList"></div>'
            }
            $itemList.html(html);
            $("#itemContent").css("border","5px solid #225eb4");
            initTitle();
            if(scrollH>0){moveList()}
        },
        error: function (e) {
        }
    });
    
}
function initTitle(){
    if(rightTotal>0){
        $('<div class="text">积分排行榜每日00：00更新</div><div class="line"><span id="currentLine">' + (pointIndex + 1) + '</span>/' + rightTotal + '</div>').appendTo($("#title"))
    }else{
        $('<div class="text">积分排行榜每日00：00更新</div><div class="line"></div>').appendTo($("#title"))
    }
}
function focusTo() {
    if (type === "right") {
        $.focusTo({
            el: $("#point"+btnIndex)
        })
        
    } else if(type === "left"){
        $.focusTo({
            el: $("#url" + tjIndex)
        })
    } else {
        $.focusTo({
            el: $("#innerItem" + pointIndex)
        })
    }

}
function canvasBg(src) {
    var oImg = new Image();
    oImg.src = "/pic/" + src + "?20200602";
    oGC.clearRect(0, 0, 1920, 1080);
    oImg.onload = function () {
        oGC.drawImage(oImg, 0, 0);
    }
}
function saveData(){
    var saveObj={
        btnIndex: btnIndex,
        btnType: btnType,
        disableBtn: disableBtn,
        //currentPage: currentPage,
        focusIndex: focusIndex,
        pointIndex: pointIndex,
        scrollH: scrollH,
        tjIndex: tjIndex,
        type: type
    }
    $.savePageInfo(pageName, saveObj);
}
function unload() {
    saveData()
}
