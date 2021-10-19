var categoryId = $.search.get().id,
    bgId = $.search.get().bgId, 
    pageName = "list3" + categoryId, 
    pageInfo = $.initPageInfo(pageName, ["leftIndex", "rightIndex", "leftBegin", "rightBegin", "type", "videoRight"], { 
        leftIndex: 0, 
        rightIndex: 0, 
        leftBegin: 0, 
        rightBegin: 0, 
        type: "left", 
        videoRight: 0 
    }), 
    info = { 
        leftIndex: pageInfo.leftIndex,
        rightIndex: pageInfo.rightIndex, 
        // leftBegin: pageInfo.leftBegin, 
        leftBegin: 0, 
        rightBegin: pageInfo.rightBegin, 
        leftTotal: 0, rightTotal: 0 
    }; 
    info.leftCurrent = info.leftIndex, info.rightCurrent = info.rightIndex; 
  var type = pageInfo.type, 
      fixIndex = 4, 
      showLine = 9, 
      lineHeight = 95, 
      videoSize = { 
          width: 940, 
          height: 529, 
          top: 316, 
          left: 879 
        }, 
      leftData = [], 
      fd = null, 
      vl = null, 
      isFirstInit = !0, 
      rightListTimer = null, 
      fdRandom = 0, 
      detailRandom = 0, 
      authRandom = 0, 
      isLoadingRight = !0, 
      saveLeftBegin = 0, 
      TIPHIDETIME = 5e3, 
      tryTime = 360, 
    //   isPlayAd = !1, 
      isFirstBefore = !0, 
      videoInfo = { left: info.leftCurrent || 0, right: pageInfo.videoRight }, 
      $windowCue = null, 
      $windowText = null, 
      $videoWindow = null, 
      $tryTime = null, 
      $nodubi = null, 
      nodubiTimer = null, 
      isTryOver = !1, 
      isNoSk = !1, 
      isPass = !0, 
      isVip = !1; 
  function load() {    
    //   top.screensaver.close(); 
      $windowCue = $("#videoWindow .cue"); 
      $windowText = $("#videoWindow .text"); 
      $videoWindow = $("#videoWindow"); 
      $nodubi = $("#videoWindow .nodubi"); 
      $.recodeData(pageName, "access"); 
      $.s.guidance.get({ 
          id: bgId 
        }, { 
            success: function (e) { 
                // 通过canvas绘制背景图
                var oCanvas = $("#caBg")[0];
                var oGC = oCanvas.getContext("2d");
                oGC.clearRect(0, 0, 1920, 1080);
                var oImg = new Image();
                oImg.src = $.getPic(e[0].pics, [0]);
                oImg.onload = function(){
                    oGC.drawImage(oImg, 0, 0);
                    oGC.clearRect( videoSize.left, videoSize.top, videoSize.width, videoSize.height);
                }
                // e && (bgsrc = $.getPic(e[0].pics, [0]), $("body").css("background", "url(" + bgsrc + ") no-repeat transparent")) 
            }, 
            error: function () { } 
        }); 
        $.s.guidance.get({
             id: categoryId 
            }, { 
                success: function (e) { 
                    leftData = e, info.leftTotal = leftData.length, renderLeft() 
                } 
            }) 
    } 
    function renderLeft() { 
        var e = ""; 
        $.UTIL.each(leftData, function (i, t) { 
            e += '<div id="leftList' + t + '" class="iList"><div class="contentTitle">' + i.contentName + "</div></div>" 
        }); 
        $("#leftList .wrap").html(e), renderRight() 
    } 
    function createRightEl() { 
        $("#rightList .wrap").html(""); 
        var e = info.rightBegin, i = e + showLine; 
        i > info.rightTotal && (i = info.rightTotal); 
        var t = fd.sync(e, i), n = ""; 
        $.UTIL.each(t, function (i, t) { 
            n += '<div id="rightList' + (e + t) + '" class="iList"><div class="contentTitle">' + i.contentName + "</div></div>" 
        }); 
        $("#rightList .wrap").html(n); 
        info.leftCurrent == videoInfo.left && (addRightCurrent(), addPlayingCur()) 
    } 
    function renderRight() { 
        function e(e) { 
            isFirstInit && (e || "right" !== type && "video" !== type || (type = "left", info.rightBegin = 0, info.rightIndex = 0), $.pTool.active("spList_list3"), play(videoInfo.right)) 
        }; 
        function i() { }; 
        initFd(); 
        var t = fdRandom = Math.random(); 
        fd.preload(info.rightBegin, info.rightBegin + showLine, function (i, n, o, r) { 
            fdRandom === t && (isLoadingRight = !1, info.leftCurrent = info.leftIndex, isFirstInit || (info.rightBegin = 0, info.rightIndex = 0), addLeftCurrent(), info.rightTotal = r, info.rightTotal ? (createRightEl(), e(!0)) : e(!1), isFirstInit = !1) 
        }, i) 
    } ;
    function focusTo() { 
        var e = "#" + type + "List" + info[type + "Index"]; 
        $(e).hasClass("current") && $(e).removeClass("current"); 
        var i = { el: e, marquee: [e + " .contentTitle"] }; 
        $.focusTo(i);
    } 
    function unload() { 
        clearVl(); 
        $.savePageInfo(pageName, { 
            leftIndex: info.leftIndex, 
            rightIndex: info.rightIndex, 
            leftBegin: info.leftBegin, 
            rightBegin: info.rightBegin, 
            type: type, 
            videoRight: videoInfo.right 
        }) 
    } 
    function moveLeftList() { 
        $("#leftList .wrap").css({ "-webkit-transform": "translateY(-" + info.leftBegin * lineHeight + "px)" }) 
    } 
    function lazyRenderRight() { 
        isLoadingRight || (isLoadingRight = !0, saveLeftBegin = info.leftBegin); 
        fdRandom = Math.random(); 
        clearTimeout(rightListTimer); 
        rightListTimer = setTimeout(function () { 
            renderRight() 
        }, 500) 
    } 
    function addLeftCurrent() { 
        $("#leftList .current").removeClass("current"), $("#leftList" + info.leftCurrent).hasClass("focusBorder") || $("#leftList" + info.leftCurrent).addClass("current") 
    } 
    function addRightCurrent() { 
        if(info.leftIndex === videoInfo.left){
            $("#rightList .current").removeClass("current"), $("#rightList" + info.rightCurrent).hasClass("focusBorder") || $("#rightList" + info.rightCurrent).addClass("current") 
        }
    } 
    function addPlayingCur() { 
        $("#rightList .playing").removeClass("playing"), $("#rightList" + videoInfo.right).addClass("playing") 
    } 
    var locker = function () { 
        var e = 300, i = !1; 
        return function () { 
            return !!i || (i = !0, setTimeout(function () { i = !1 }, e), !1) 
        } 
    }(), locker2 = function () { 
        var e = 600, i = !1; 
        return function () { 
            return !!i || (i = !0, setTimeout(function () { i = !1 }, e), !1) 
        } 
    }(); 
    function findRightCurrent() { 
        info.leftCurrent == videoInfo.left && info.rightCurrent >= info.rightBegin && info.rightCurrent < info.rightBegin + showLine && (info.rightIndex = info.rightCurrent, info.rightCurrent > info.rightBegin + fixIndex && info.rightTotal > showLine && (info.rightBegin = info.rightIndex - fixIndex, createRightEl())) 
    } 
    function initFd() { 
        var e = leftData[info.leftIndex].contentUri; 
        fd = new $.FetchData({ type: e, blockSize: 100, jsonp: function (e, i, t, n) { !function (e, i, t, n) { e && 32 === e.length ? $.s.category.num({ id: e, num: i }, { success: t, error: function () { n() } }) : n() }(e, i, t, n) } }) 
    } 
    function findData(e) { 
        return fd.sync(e, e + 1)[0] 
    } 
    function clearVl() { 
        vl && (vl.release(), vl = null) 
    } 
    function play(e) { 
        clearVl(); 
        showAdTime.hide(); 
        $tryTime && $tryTime.hide(); 
        $videoWindow.addClass("noPlayer"); 
        $videoWindow.removeClass("over");
        $windowText.hide(); 
        isTryOver = !1, isNoSk = !1, isPass = !0, isVip = !1; 
        clearTimeout(nodubiTimer);
        // $nodubi.hide(), 
        hideCue();
         var i = findData(e); 
         showPageInfo(e + 1 + "/" + info.rightTotal), showDescription(i.contentDescription); 
         var t = leftData[info.leftCurrent].contentUri; 
         videoInfo.left = info.leftCurrent, videoInfo.right = e, info.rightCurrent = e, addRightCurrent(), addPlayingCur(); var n = detailRandom = Math.random(), o = authRandom = Math.random(); 
         $.s.detail.get({ id: i.contentId }, { 
             success: function (i) { 
                 if (n == detailRandom) { 
                     if (isVip = "1" === i.vipFlag, !$.getVariable("EPG:skill").is4k && /4k/i.test(i.vodName) && (isNoSk = !0), isNoSk) return $videoWindow.removeClass("noPlayer").addClass("over"), void $windowText.show().html("尊敬的用户：<br>您好！该机顶盒不支持观看4K节目，请谅解。"); 
                     $.auth.auth({ 
                         entrance: "", 
                         playData: { 
                             contentId: i.vodId, 
                             vodName: i.contentName, 
                             categoryId: t, 
                             contentType: "0", 
                             noFromDetail: !0 
                            }, 
                            package: i.jsVodChargesToCps, 
                            callback: function (n) { 
                                if (o == authRandom) { 
                                    if (isPass = !!n, parseInt(i.vodTimes) <= 30 && !isPass) return isTryOver = !0, $videoWindow.removeClass("noPlayer").addClass("over"), $windowText.show().html("付费内容需要订购后才可观看"), void showCue(); 
                                    (vl = $.playSizeList({ 
                                        list: [{ contentId: i.vodId, name: i.vodName }], 
                                        current: 0, 
                                        endPoint: isPass ? void 0 : tryTime, 
                                        multiVod: !1, 
                                        auto: !1, 
                                        // onBeforePlay: function (e, n, o) { 
                                        //     isVip ? n() : o ? e(o) : $.isBack() && isFirstBefore && vl.diy() && vl.diy().goonBack ? n() : getAd(t, i.vodId, i.contentName, function (i) { i && i.resourceid ? e({ contentId: i.resourceid }) : n() }), isFirstBefore = !1 
                                        // }, 
                                        loading: function (e, i) { }, 
                                        onPlay: function (e, t, n) { 
                                            // n ? (vl.mp.sub($.MP.state.progress, function (e) { isPlayAd && showAdTime.show(e.total - e.curr) }), isPlayAd = !0) : 
                                            !$.getVariable("EPG:skill").is51 && /5\.1声道/.test(i.vodName) && ($nodubi.show(), clearTimeout(nodubiTimer), nodubiTimer = setTimeout(function () { $nodubi.hide() }, 5e3)), !isPass && parseInt(i.vodTimes) > 30 && ($tryTime || ($tryTime = $('<div id="tryTime"></div>')).appendTo($("#videoWindow")), $tryTime.show().html("试看" + tryTime / 60 + "分钟")), $videoWindow.removeClass("noPlayer"), showCue() 
                                        }, 
                                        onEnd: function (i, t, n) { 
                                            if( isVip && !isPass){
                                                isTryOver = !0;
                                                $videoWindow.addClass("over");
                                                $windowText.show().html("试看结束<br>请订购后观看全片");
                                                showCue();
                                                $tryTime.hide();
                                            }else{
                                                info.leftCurrent != videoInfo.left ? play(0) : e == info.rightTotal - 1 ? play(0) : play(e + 1)
                                            }
                                        }, 
                                        onError: function (e) { 
                                            return !0 
                                        }, 
                                        left: videoSize.left, 
                                        top: videoSize.top, 
                                        width: videoSize.width, 
                                        height: videoSize.height + 3
                                    }, t, $.auth.getchargeSpIds(i.vodId), $.page.ztCategoryId, $.page.playModel, $.page.groupId, function () { return !isPass })).playBy({ playTime: 0, val: 0, endPoint: isPass ? void 0 : tryTime }) 
                                } 
                            } 
                        }) 
                    } 
                }, 
                error: function () { } 
            }) 
        } 
        // 广告业务，先不添加
    // function getAd(e, i, t, n) { 
    //     $.getHelper("provider:ad").ad.getVideoAd({ 
    //         categoryId: e, 
    //         contentId: i, 
    //         contentName: t, 
    //         callback: n }) 
    // } 
    $.pTool.add("spList_list3", { 
        key: "spList_list3", 
        keysMap: { 
            KEY_LEFT: function () { 
                return "right" == type ? (type = "left", focusTo(), info.leftCurrent == videoInfo.left && addRightCurrent()) : "video" == type && (hideCue(), type = "right", findRightCurrent(), focusTo()), !0 
            }, 
            KEY_RIGHT: function () { 
                return "left" == type ? (type = "right", findRightCurrent(), focusTo(), addLeftCurrent(), clearTimeout(rightListTimer), fdRandom = Math.random(), info.leftIndex = info.leftCurrent, isLoadingRight && (info.leftBegin = saveLeftBegin, moveLeftList(), isLoadingRight = !1)) : "right" == type && (type = "video", $.focusTo({ el: "#videoWindow" }), addRightCurrent(), showCue()), !0 
            }, 
            KEY_UP: function () { 
                if ("video" != type && !("right" == type && locker() || info[type + "Index"] <= 0)) { info[type + "Index"]--; var e = info[type + "Begin"]; return info[type + "Total"] > showLine && info[type + "Index"] < info[type + "Begin"] && (info[type + "Begin"] = info[type + "Index"], info[type + "Begin"] < 0 && (info[type + "Begin"] = 0), e != info[type + "Begin"] && ("left" == type ? moveLeftList() : "right" == type && createRightEl())), focusTo(), "left" == type && (addLeftCurrent(), lazyRenderRight()), "right" == type && info.leftCurrent == videoInfo.left && addRightCurrent(), !0 } 
            }, 
            KEY_DOWN: function () { 
                if ("video" != type && !("right" == type && locker() || info[type + "Index"] >= info[type + "Total"] - 1)) { info[type + "Index"]++; var e = info[type + "Begin"]; return info[type + "Total"] > showLine && info[type + "Index"] > info[type + "Begin"] + fixIndex && (info[type + "Begin"] = info[type + "Index"] - fixIndex, e != info[type + "Begin"] && ("left" == type ? moveLeftList() : "right" == type && createRightEl())), focusTo(), "left" == type && (addLeftCurrent(), lazyRenderRight()), "right" == type && info.leftCurrent == videoInfo.left && addRightCurrent(), !0 } 
            }, 
            KEY_PAGEUP: function () { 
                if ("video" != type && !("right" == type && locker2() || info[type + "Total"] <= showLine || info[type + "Begin"] <= 0)) { var e = info[type + "Index"] - info[type + "Begin"]; return info[type + "Begin"] -= showLine, info[type + "Begin"] <= 0 && (info[type + "Begin"] = 0), info[type + "Index"] = info[type + "Begin"] + e, "left" == type ? moveLeftList() : "right" == type && createRightEl(), focusTo(), "left" == type && (addLeftCurrent(), lazyRenderRight()), !0 } 
            }, 
            KEY_PAGEDOWN: function () { 
                if ("video" != type && !("right" == type && locker2() || info[type + "Total"] <= showLine || info[type + "Begin"] >= info[type + "Total"] - fixIndex - 1)) { var e = info[type + "Index"] - info[type + "Begin"]; return info[type + "Begin"] += showLine, info[type + "Begin"] > info[type + "Total"] - fixIndex - 1 && (info[type + "Begin"] = info[type + "Total"] - fixIndex - 1), info[type + "Index"] = info[type + "Begin"] + e, "left" == type ? moveLeftList() : "right" == type && createRightEl(), focusTo(), "left" == type && (addLeftCurrent(), lazyRenderRight()), !0 } 
            }, 
            KEY_OK: function () { 
                return "right" == type ? info.leftCurrent == videoInfo.left && info.rightIndex == videoInfo.right ? isTryOver ? $.auth.forwardOrder() : gotoFull() : play(info.rightIndex) : "video" == type && (isTryOver ? $.auth.forwardOrder() : gotoFull()), !0 
            } 
        }, 
        active: function () { 
            "video" == type ? $.focusTo({ el: "#videoWindow" }) : focusTo() 
        }, 
        deactive: function () { }, 
        init: function () { }, 
        cover: function () { 
            return !0 
        }, 
        uncover: function () { 
            return !0 
        }, 
        destroy: function () { } 
    }); 
    var showAdTime = function () { 
        var e; 
        return { 
            show: function (i) { 
                e || (e = $('<div id="adTime"></div>').appendTo($videoWindow)), e.show().html(i + "S") 
            }, 
            hide: function () { 
                e && e.hide(), e && e.html("") 
            } 
        }
    }(), showCueTimer = null; 
    function showCue() { 
        isNoSk || (clearTimeout(showCueTimer), isTryOver ? $windowCue.removeClass("full").addClass("buy").show() : $windowCue.removeClass("buy").addClass("full").show(), showCueTimer = setTimeout(function () { $windowCue.hide() }, 5e3)) 
    } 
    function hideCue() { 
        clearTimeout(showCueTimer), $windowCue.hide() 
    } 
    function gotoFull() { 
        vl && vl.enter({ 
            contentId: findData(videoInfo.right).contentId, 
            mediaType: isPass ? 1 : 5, 
            vipFlag: isVip 
        }) 
    } 
    function showPageInfo(e) { 
        $("#pageInfo .content").html(e) 
    } 
    function showDescription(e) { 
        e = $.substringElLength(e, "28px", "2480px").last; 
        $("#description .content").html(e) 
    }