$.addBackUrlRedefine(function () {});

$.playVideoRedefine(true);

$.playLiveOrRecRedefine(true);

var addPointsTime = 30 * 60 * 1e3;

//广告参数
var intervalId = null;

var picShowTime = null;

var isPlayAd = false;

var isFirstBefore = true;

var savePrePicInfo = null;

var isHasAd = $.page.isHasAd;

function getAd(cb) {
  $.getHelper("provider:ad").ad.getVideoAd({
    noAd: !isHasAd,
    categoryId: page.categoryId,
    contentId: page.contentId,
    contentName: vl.current() && vl.current().name,
    callback: cb
  });
}

setTimeout(function () {
  USER_SERVCICE.addPoints({
    pointtype: "102"
  }, {});
}, addPointsTime);

var page = {
  contentId: $.page.contentId,
  categoryId: $.page.categoryId,
  isTry: $.page.mediaType === "5" ? true : false,
  noHis: !!$.page.noHis,
  ztCategoryId: $.page.ztCategoryId
};

var isCanSaveHis = false;

var vl = null;

var totalTime = 0;

var isOnEnd = false;

function load() {
  vl = $.createVideoList({
    list: [],
    current: 0 ,
    loop: false,
    auto: false,
    multiVod: false,
    recovery: true,
    endPoint: undefined,
    onBeforePlay: function (playPreAd, goon, preAd) {
      if (!isHasAd) {
        goon();
      } else {
        if (preAd) {
          preAd.type === 'pic' ? goon() : playPreAd(preAd);
          // 以后支持图片打开注释代码即可
          // preAd.type === 'pic' ? playPrePic(preAd, playPreAd, goon) : playPreAd(preAd);
        } else {
          if (isFirstBefore) {
            goon();
          } else {
            getAd(function (data) {
                 // 目前只处理视频贴片，图片不处理
                 if(data && data.resourceid && !data.picPath){
                  playPreAd({
                      contentId: data.resourceid
                  });
              }else{
                  goon();
              }
              // 以后支持图片打开注释代码即可
              // if (data && data.picPath && parseInt(data.duration) > 0) {
              //   var obj = {
              //     type: 'pic',
              //     picShowTime: parseInt(data.duration),
              //     picPath: $.getVariable("EPG:pathPic") + '/' + data.picPath,
              //   }
              //   playPrePic(obj, playPreAd, goon);
              //   obj = null;
              // } else if (data && data.resourceid) {
              //   playPreAd({
              //     type: 'video',
              //     contentId: data.resourceid
              //   });
              // } else {
              //   goon();
              // }
            });
          }
        }
      }
      isFirstBefore = false;
    },
    loading: function (type, isPreVideo) {
      isCanSaveHis = false;
      if (type === "stream" && !isPreVideo) {
        vl.mp.sub($.MP.state.progress, function (param) {
          if ($.pTool.get("p_trySee") && $.pTool.get("p_trySee").getInfo().isShow) {
            return;
          }
          var total = page.isTry ? param.endPoint : param.total;
          if (total && total - param.curr <= 5) {
            EndTipPanel.show(total - param.curr);
            hisCue.hide();
          } else {
            EndTipPanel.hide();
          }
        });
        vl.mp.once($.MP.state.loaded, function (param) {
          totalTime = param.total;
          $.vs.vodPlay(page.contentId, totalTime, (page.isTry ? "TRY-" : "") + vl.current().name, page.categoryId, $.auth.getchargeSpIds(page.contentId), page.ztCategoryId);
          if ($.pTool.get("p_trySee") && $.pTool.get("p_trySee").getInfo().isShow) {
            return;
          }
          hisCue.show(param.curr);
        });
      }
    },
    onPlay: function (param, curInfo, isPreVideo) {
      $.initVolume(vl.mp);
      if (isPreVideo) {
        isPlayAd = true;
        var isFirstTimeConut = true
        vl.mp.sub($.MP.state.progress, function (param) {
          if (isPlayAd) {
            if(param.total  - param.curr < param.total || isFirstTimeConut){
                showAdTime.show(param.total - param.curr);
                isFirstTimeConut = false;
            }
        }
        });
      } else {
        isCanSaveHis = true;
      }
      $.pTool.get("progress").setInfo({
        videoName: vl.current().name,
        isTry: page.isTry,
        hisCueIsShow: hisCue.getIsShow,
        isPlayAd: isPlayAd
      });
      $.pTool.get("progress").init(vl.mp);
    },
    onEnd: function (current, info, isPreVideo) {
      if (isPreVideo) {
        showAdTime.hide();
        isPlayAd = false;
      } else {
        isOnEnd = true;
        if (page.isTry) {
          vl.diy({
            playCurrent: current,
            playTime: vl.mp.getCurrentTime()
          });
          gotoOrder();
        } else {
          vl.diy({
            goonBack: false
          });
          $.back();
        }
      }
    },
    onError: function (e) {
      // e => true 是 preVideo() 的返回值
        // e => null 是正常 vod 的返回值
        if(!e){
          $.gotoDetail($.urls.noVod, true);
      }
      return true;
    }
  }, page.categoryId);
  vl.play();
  if (page.isTry) {
    $.pTool.add("p_trySee", p_trySee());
    $.pTool.get("p_trySee").init({
      fn: gotoOrder
    });
    $.pTool.active("p_trySee");
  }
}

function unload() {
  intervalId && clearInterval(intervalId);
  try {
    if (vl) {
      $.vs.playQuit(isOnEnd && "end");
      if (isCanSaveHis && vl.mp) {
        var leaveTime = vl.mp.getCurrentTime();
        if (isOnEnd && !page.isTry) {
          leaveTime = 0;
        }
        if (!page.noHis) {
          $.s.his.add({
            mediaId: page.contentId,
            leaveTime: leaveTime,
            categoryId: page.categoryId,
            mediaType: 0,
            totalTime: totalTime
          });
        }
      }
      if (isPlayAd && savePrePicInfo) {
        savePrePicInfo(picShowTime)
      }
      if (isHasAd && !isPlayAd && !isOnEnd) {
        vl.diy({
          goonBack: true
        });
      }
      vl.save();
    }
  } catch (e) {}
  vl && vl.release();
}

var EndTipPanel = function () {
  var $tip;
  var htmlText = page.isTry ? "试看" : "播放";
  return {
    show: function (time) {
      if (!$tip) {
        $tip = $('<div class="endBox"></div>').appendTo("body");
      }
      var endText = '<span class="time">' + time + "</span>" + '<span class="unit">S</span> 即将' + htmlText + "结束";
      $tip.show().html(endText);
    },
    hide: function () {
      $tip && $tip.hide();
      $tip && $tip.html("");
    }
  };
}();

function gotoOrder() {
  $.auth.forwardOrder(1);
}

var hisCue = function () {
  var $tip;
  var timer = null;
  var isShow = false;

  function hide() {
    $tip && $tip.hide();
    isShow = false;
  }
  return {
    show: function (time) {
      if (time == 0) {
        return true;
      }
      if (!$tip) {
        $tip = $('<div class="hisCue hide">上次观看至' + transferTime(time) + "，</div>").appendTo("body");
      }
      clearTimeout(timer);
      $tip.show();
      isShow = true;
      timer = setTimeout(function () {
        hide();
      }, 6e3);
    },
    hide: function () {
      clearTimeout(timer);
      hide();
    },
    getIsShow: function () {
      return isShow;
    }
  };
}();

function transferTime(t) {
  return toTwo(Math.floor(t % 86400 / 3600)) + ":" + toTwo(Math.floor(t % 86400 % 3600 / 60)) + ":" + toTwo(t % 60);
}

function toTwo(n) {
  return n < 10 ? "0" + n : "" + n;
}

var showAdTime = function () {
  var $tip;
  return {
    show: function (time) {
      if (!$tip) {
        $tip = $('<div class="adTime"></div>').appendTo("body");
      }
      var endText = '<span class="time">' + time + '</span><span class="unit">S</span>';
      $tip.show().html(endText);
    },
    hide: function () {
      $tip && $tip.hide();
      $tip && $tip.html("");
    }
  };
}();

// 贴片广告--图片
function playPrePic(obj, playPreAd, goon) {
  if (obj && obj.type === "pic") {
    picShowTime = obj.picShowTime;
    $("#AdpicBg").css({
      background: "url(" + obj.picPath + ") 0 0 no-repeat",
      backgroundSize: '100% 100%'
    }).show();
    isPlayAd = true;
    savePrePicInfo = function (time) {
      time && (obj.picShowTime = time);
      playPreAd(obj);
      obj = null;
    }
  }
  var timer = function () {
    if (picShowTime <= 0) {
      clearInterval(intervalId);
      showAdTime.hide();
      $("#AdpicBg").hide();
      isPlayAd = false;
      goon();
      return;
    }
    showAdTime.show(picShowTime);
    --picShowTime;
    return timer
  };
  intervalId = setInterval(timer(), 1000);
}

function getPlayInfo() {
  return {
    type: "pull",
    code: "1",
    playVideoType: "2",
    mediaID: "" + (page.contentId || ""),
    mediaName: "" + (vl && vl.current().name || ""),
    categoryID: "" + (page.categoryId || ""),
    currentPlayTime: "" + (!isPlayAd && (vl && vl.mp && vl.mp.getCurrentTime()) || "0"),
    totalTime: "" + (totalTime || "0"),
    isSeries: false
  };
}