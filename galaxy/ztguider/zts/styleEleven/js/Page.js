var ACTIVE_OBJECT
var total = null
var PAGE_NAME = "ZT_STYLEELEVEN" + subjectId
var DATA = DATALIST
var TIPHIDETIME = 5e3
var TRYSEETIME = 360
var categoryId = subjectId
var isSuportKKKK = isSuport4K()
var vl = null;
var $video = null
var $list = null
var focusIndex
var front
var back
var data = DATA[0].valData;
var oPlayInfo = {}
var nowAuthContentId = ""
var authStaus = "pass"
var title = []
var PAGE_INFO = [
  {
    key: "list",
    pressLeft: _vLeft,
    pressRight: _vRight,
    pressOk: _vOk,
  },
]

var ACTIVE_OBJECT = PAGE_INFO[0];
var pageInfo = $.initPageInfo(PAGE_NAME, ["focusIndex", "front", "back"], {
  focusIndex: 1,
  front: 0,
  back: 2,
});
focusIndex = pageInfo.focusIndex
front = pageInfo.front
back = pageInfo.back
function initPage() {
  $.recodeData(subjectName, "zt");
  $video = $("#video")
  $list = $(".list")
  _initBackGround();
  initVl();
  loadData();
  focusTo()
}
function _initBackGround() {
  $("body").css("background", 'url("' + bImgPath + '")  no-repeat transparent');
  $("body").css("background-size", 'cover');
}
function loadData() {
  for (var i = 0; i < data.length; i++) {
    data[i].name = data[i].contentName.split("@")[0];
  }
  total = data.length
  renderPage(function () { initPlayer() })
}
function initPlayer() {
  play(null, !0)
}
function play(e, t) {
  stopMp(), tips.rm();
  if (focusIndex > total - 1) {
    return
  }
  var a = data[focusIndex].contentId
  var n = data[focusIndex].name
  var s = "1" === data[focusIndex].vipFlag;
  if (s) {
    var o = oPlayInfo[a].package;
    return nowAuthContentId = a,
      authStaus = "pass",
      void $.auth.auth({
        entrance: "", playData: { contentId: a, vodName: n, categoryId: subjectId, contentType: "0", noFromDetail: !0 },
        package: o,
        callback: function (n) {
          if (nowAuthContentId !== a) return;
          n ? (authStaus = "pass", sizePlay(t)) :
            (authStaus = "noPass", trySeeOrOrder(t));
        }
      })
  }
  authStaus = "pass", sizePlay(t), e && e()
}
function sizePlay(e) {
  var t = 0;
  if (videoBg.rm(),
    ($.isBack() && (t = vl.valueOf().playTime)),
    vodName = data[focusIndex].name, id = data[focusIndex].contentId, is4KVod(vodName) && !isSuportKKKK)
    return stopMp(), void videoBg.noSupport4K();

  vl && vl.playBy({ playTime: t, val: focusIndex, endPoint: "pass" === authStaus ? void 0 : TRYSEETIME })
}
function initVl() {
  vl = $.playSizeList({
    left: 467,
    top: 374,
    width: 981,
    height: 549,
    list: data,
    current: 0,
    multiVod: !1,
    endPoint: "pass" === authStaus ? void 0 : TRYSEETIME, auto: !1,
    loading: function (e) {
      if ("url" === e) {
        if (!vl) return;
        $.initVolume(vl.mp)
      }
    },
    onPlay: function (e) {
      addPlayerClass()

    },
    onEnd: function (e) {
      if (vl.cfg.endPoint) return stopMp(), tips.trySee.hide(), void videoBg.trySeeEnd();
      _vRight(),
        play(null, !0)
    },
    onError: function (e) { return !0 }
  },
    categoryId,
    function () {
      return $.auth.getchargeSpIds(data[focusIndex].contentId)
    },
    categoryId
  )
}
function renderPage(e) {
  contentIdArr = [];
  for (var t = data.length, a = 0; a < t; a++) {
    "1" === data[a].vipFlag && contentIdArr.push(data[a].contentId)
  };
  loadDataResource(contentIdArr, function (a) {
    if (total > 3) {
      for (var n = "", s = "", o = "", titleName = "", l = 0; l < data.length; l++) {
        titleName = data[l].name;
        picPath = data[l].img;
        n +=
          '<div id="item' + l + '" class="item"><img src="' + picPath + '" alt="" class="pic" id="pic' + l + '"></div>'
        title.push(titleName)
      };
    } else {
      for (var n = "", s = "", o = "", titleName = "", l = 0; l < 3; l++) {
        if (l < data.length) {
          titleName = data[l].name;
          picPath = data[l].img;
          n +=
            '<div id="item' + l + '" class="item"><img src="' + picPath + '" alt="" class="pic" id="pic' + l + '"></div>'
          title.push(titleName)
        } else {
          n +=
            '<div id="item' + l + '" class="item noPic"></div>'
          title.push("暂无内容")
        }
      };
    }
    $(".list").html(n),
      showInitItem()
    addItemClass()
    titleScroll()
    e && e();
  })
}
function isSuport4K() {
  var e = Authentication.CUGetConfig("STBType"); return !/V9A|V6|E909|B760EV3/.test(e)
}
function is4KVod(e) {
  return /4k/i.test(e)
}
function _vLeft() {
  removeClass()
  if (total > 3) {
    --front < 0 ? front = total + front : null;
    --focusIndex < 0 ? focusIndex = total + focusIndex : null;
    --back < 0 ? back = total + back : null;
  } else {
    --front < 0 ? front = 3 + front : null;
    --focusIndex < 0 ? focusIndex = 3 + focusIndex : null;
    --back < 0 ? back = 3 + back : null;
  }

  showInitItem()
  addItemClass()
  titleScroll()
  if (focusIndex < total - 1) {
    var e = is4KVod(data[focusIndex].name) && !isSuportKKKK;
    if (e) {
      return stopMp(), void videoBg.noSupport4K();
    }
  }
  stopMp(),
    play(null, !0)
}

function _vRight() {
  removeClass()
  if (total > 3) {
    ++front > total - 1 ? front = 0 : null;
    ++focusIndex > total - 1 ? focusIndex = 0 : null;
    ++back > total - 1 ? back = 0 : null;
  } else {
    ++front > 2 ? front = 0 : null;
    ++focusIndex > 2 ? focusIndex = 0 : null;
    ++back > 2 ? back = 0 : null;
  }

  showInitItem()
  addItemClass()
  titleScroll()
  if (focusIndex < total - 1) {
    var e = is4KVod(data[focusIndex].name) && !isSuportKKKK;
    if (e) {
      return stopMp(), void videoBg.noSupport4K();
    }
  }
  stopMp(),
    play(null, !0)
}
function _vOk() {
  switch (authStaus) {
    case "pass": fullPlay(); break;
    case "noPass": savePageInfo();
      if (vl) {
        var nowTime = 0;
        if (vl.mp) {
          nowTime = vl.mp.getCurrentTime();
        }
        vl.seek({
        val:focusIndex,
        playTime:nowTime
        }).save()
      };
      $.auth.forwardOrder()
  }
}
var loadDataResource = function () {
  var e = [], t = 0, a = null, n = [];
  var s = function () {
    var o = e[t++];
    if (!o) return a(n);
    oPlayInfo[o] ? (n.push(oPlayInfo[o]), arguments.callee.call(null, arguments)) : $.s.detail.get({ id: o }, { success: function (a) { var o = a.vodId; e[t - 1] == o && (oPlayInfo[o] = { package: a.jsVodChargesToCps }, n.push(oPlayInfo[o]), s()) }, error: function () { oPlayInfo[o] = { totalTime: "", package: "" }, n.push(oPlayInfo[o]), s() } })
  };
  return function (o, i) {
    t = 0, n = [], e = o, a = i, s()
  }
}();
function savePageInfo() {
  $.savePageInfo(PAGE_NAME, { focusIndex: focusIndex, front: front, back: back })
}
function fullPlay() {
  savePageInfo(), vl && vl.enter({ multiVod: !1, contentId: data[focusIndex].contentId, ztCategoryId: subjectId })
}
function trySeeOrOrder(e) {
  if (videoBg.rm(), +data[focusIndex].totalTime > 30) return stopMp(), sizePlay(e), void tips.trySee.show();
  videoBg.order()
}
var tips = {
  fullPlay: {
    timer: null,
    show: function () {
      this.hide();
      $video.addClass("fullPlay");
      tipHide.call(this)
    },
    hide: function () {
      clearTimeout(this.timer);
      $video.removeClass("fullPlay")
    }
  },
  order: {
    timer: null,
    show: function () {
      this.hide();
      $video.addClass("order");
      tipHide.call(this)
    },
    hide: function () {
      clearTimeout(this.timer);
      $video.removeClass("order")
    }
  },
  trySee: {
    show: function () {
      $video.addClass("trySee")
    },
    hide: function () {
      $video.removeClass("trySee")
    }
  },
  rm: function () {
    $video.removeClass("trySee").removeClass("fullPlay").removeClass("order")
  }
};
function tipHide() {
  this.timer = setTimeout(this.hide.bind(this), TIPHIDETIME)
}
var videoBg = {
  order: function () {
    tips.order.show();
    $video.addClass("orderBg")
  },
  trySeeEnd: function () {
    tips.order.show();
    $video.addClass("trySeeEnd")
  },
  noSupport4K: function () {
    $video.addClass("no4K")
  },
  rm: function () {
    $video.removeClass("orderBg").removeClass("trySeeEnd").removeClass("no4K")
  }
}
function addPlayerClass() {
  "pass" !== authStaus ? "noPass" === authStaus && tips.order.show() : tips.fullPlay.show()
}
function stopMp() {
  vl && vl.stop()
}
function focusTo() {
  $.focusTo({
    el: $video
  })
}
function titleScroll() {
  var e = $(".title");
  var t = e.html()
  $.Marquee({ el: e[0] })
}
function showInitItem() {
  $list.find(".item").hide()
  $("#item" + front).show()
  $("#item" + back).show()
}
function addItemClass() {
  $("#item" + front).addClass("front")
  $("#item" + back).addClass("back")
  $('<div class="title autoText">' + title[focusIndex] + '</div>').appendTo($list)
}
function removeClass() {
  $("#item" + front).removeClass("front")
  $("#item" + back).removeClass("back")
  $(".title").remove()
}

function unload() { vl && vl.release() }