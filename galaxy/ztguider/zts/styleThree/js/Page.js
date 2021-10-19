var PAGE_NAME="ZT_STYLETHREE"+subjectId,
PAGE_INFO=[
    {key:"itemList",pressLeft:_left,pressRight:_right,pressUp:"",pressDown:"",pressOk:_ok,args:[]}
],
ACTIVE_OBJECT=PAGE_INFO[0],
pageInfo=$.initPageInfo(
    PAGE_NAME,
    ["firstScreenIndex","focusIndex"],
    {firstScreenIndex:0,focusIndex:0}
    ),
    valData=DATALIST[0].valData,
    bgData=DATALIST[1].bgData,
    timer=null,
    focusIndex=pageInfo.focusIndex,
    firstScreenIndex=pageInfo.firstScreenIndex,
    columnWidth=356,
    total=valData.length,
    lock=!1;
    function initPage(){
        $.recodeData(subjectName, "zt");
        $.initPage(),renderPage(),
        initFocus()
    }
    function renderPage(){
        var t,e,n,a,s,o="",i="",c="",l="";
        t=$('<div class="container"></div>'),
        e=$('<div class="title">'+DATALIST[0].title+"</div>");
        for(var d=0;d<total;d++)i=valData[d].contentName.split("@")[0],
        c=valData[d].contentName.split("@")[1]||"",
        o+='<div id="item'+d+'" class="item" style="left:'+columnWidth*d+'px"><img src="'+valData[d].img+'" alt="" /><div class="listTitle"><div class="titleName autoText">'+i+'</div><div class="titleIntro">'+c+'</div></div><div class="titleShadow"></div></div>';
        if(bgData.length>=total)
        for(d=0;d<total;d++)l+='<img class="bgImg" src="'+bgData[d].bgImg+'" style="left:'+1920*d+'px"/>';
        s=$.substringElLength(valData[focusIndex].intro,"35px","5136px").last;
        var r=valData[focusIndex].contentName.split("@")[0];
        a=$('<div class="listContent"><div class="itemList transMove">'+o+"</div></div>"),
        n=$('<div class="content"><div class="contentTitle">'+r+'</div><div class="contentIntro">'+s+"</div></div>"),
        e.appendTo(t),
        a.appendTo(t),
        n.appendTo(t),
        l=bgData.length>=total?l:0===bgData.length?"":'<img class="bgImg" src="'+bgData[0].bgImg+'"/>';
        var f=0===bgData.length?" noPic":"";
        $('<div class="bgWrap"><div class="bgList transMove'+f+'">'+l+"</div></div>").appendTo("body"),
        t.appendTo("body"),translateX(),bgTranslate()
    }
    function focusTo(){
        var t="#item"+focusIndex;
        $.focusTo(t),
        $(t).addClass("focusBorder"),
        textScroll()
    }
    function initFocus(){
        focusTo()}function textScroll(){
            var t=$(".focusBorder .listTitle .titleName");
            $.Marquee({el:t[0]})
        }
    function translateX(){
        $(".itemList").css({"-webkit-transform":"translateX(-"+columnWidth*firstScreenIndex+"px)"})
    }
    function bgTranslate(){
        bgData.length>=total&&$(".bgList").css({"-webkit-transform":"translateX(-"+1920*focusIndex+"px)"})
    }
    function change(){
        var t=valData[focusIndex].contentName.split("@")[0],
        e=$.substringElLength(valData[focusIndex].intro,"35px","5136px").last;
        $(".contentTitle").html(t),$(".contentIntro").html(e)
    }
    function _left(){
        if(!lock)return timer&&clearTimeout(timer),
        0==focusIndex?($("#item0").addClass("public_shake"),!0):(focusIndex>firstScreenIndex+1?focusIndex>=total-2?focusIndex-=1:(firstScreenIndex--,focusIndex--,translateX(),lock=!0,timer=setTimeout(function(){lock=!1},500)):focusIndex-=1,focusTo(),change(),bgTranslate(),!0)}
    function _right(){
        if(!lock)return timer&&clearTimeout(timer),
        focusIndex==total-1?($("#item"+focusIndex).addClass("public_shake"),!0):(focusIndex>=firstScreenIndex+2?focusIndex>=total-3?focusIndex+=1:(firstScreenIndex++,focusIndex++,translateX(),lock=!0,timer=setTimeout(function(){lock=!1},500)):focusIndex+1<total?focusIndex+=1:focusIndex!=total-1&&(focusIndex=total-1),
        focusTo(),
        change(),
        bgTranslate(),
        !0)}
    function _ok(){
        var t=valData[focusIndex],
        e=["3","7"];
        t.categoryId=subjectId,
        t.ztCategoryId=subjectId,
        $.savePageInfo(PAGE_NAME,
            {firstScreenIndex:firstScreenIndex,focusIndex:focusIndex}
            ),
        e.indexOf(t.contentType)>-1&&(t.contentType==e[0]?t.contentType=e[1]:t.contentType=e[0]),$.gotoDetail(t)
    }