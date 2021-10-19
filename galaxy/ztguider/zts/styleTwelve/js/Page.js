var ACTIVE_OBJECT
var total = null
var PAGE_NAME = "ZT_STYLETWELVE" + subjectId
var DATA = DATALIST
var categoryId = subjectId
var $content = null
var $list = null
var focusIndex = null
var data = DATA[0].valData
var imgs = DATA[1].bgData
var $arrowLeft = null
var $arrowRight = null
var init = false
var PAGE_INFO = [
  {
    key: "list",
    pressLeft: _Left,
    pressRight: _Right,
    pressOk: _Ok,
  },
]
var ACTIVE_OBJECT = PAGE_INFO[0];
var pageInfo = $.initPageInfo(PAGE_NAME, ["focusIndex"], {
  focusIndex: 0,
});
focusIndex = pageInfo.focusIndex
function initPage() {
  $.recodeData(subjectName, "zt");
  $content = $("#content")
  $list = $("#list")
  $arrowLeft = $("#arrowLeft")
  $arrowRight = $("#arrowRight")
  $.initPage();
  _initBackGround()
  renderPage()
  initArrow()
  initPageTips()
  init = true
  translateX()
}
function _initBackGround() {
  $("body").css("background", 'url("' + bImgPath + '") no-repeat transparent');
}
function addItemLeft() {
  for (var i = 0; i < total; i++) {
    $("#item" + i).css("left", 1920 * i + "px")
  }
}
function initArrow() {
  //以后改成图片
  $arrowLeft.html('<div class="arrowLeft">&lt; </div>')
  $arrowRight.html('<div class="arrowRight">&gt;</div>')
  if (total > 1) {
    tips.arrow.showAll()
  }
}
function initPageTips() {
  if (total > 1) {
    tips.pageTip.show()
  }
}
var tips = {
  arrow: {
    timer: null,
    showAll: function () {
      this.hide();
      $arrowLeft.show()
      $arrowRight.show()
      tipHide.call(this)

    },
    hide: function () {
      clearTimeout(this.timer);
      $arrowLeft.hide()
      $arrowRight.hide()
    },
  },
  pageTip: {
    timer: null,
    show: function () {
      $content.addClass("tips");
      tipHide.call(this)
    },
    hide: function () {
      clearTimeout(this.timer);
      $content.removeClass("tips")
    }
  }
}
function tipHide() {
  this.timer = setTimeout(this.hide.bind(this), 2000)
}
function renderPage() {
  total = data.length
  var titleName = ""
  var intro = ""
  var img = ""
  var str = ""
  var defaultImg = ""
  for (var i = 0; i < total; i++) {
    titleName = data[i].contentName
    intro = data[i].intro
    img = imgs[i] ? imgs[i].bgImg : null
    defaultImg = bImgPath
    if (img) {
      str += '<div id="item' + i + '" class="item"><img src="' + img + '" class="pic"/><div id="title' + i + '"class="title" >' + titleName + '</div><div id="intro' + i + '" class="intro">' + intro + '</div></div>'
    } else {
      str += '<div id="item' + i + '" class="item"><img src="' + defaultImg + '" class="pic"/><div id="title' + i + '"class="title" >' + titleName + '</div><div id="intro' + i + '" class="intro">' + intro + '</div></div>'
    }

  }
  $list.html(str)
  addItemLeft()
}
function _Left() {
  if (focusIndex === 0) {
    focusIndex = total - 1
    translateX()
  } else {
    focusIndex--
    translateX()
  }
}
function _Right() {
  if (focusIndex === total - 1) {
    focusIndex = 0
    translateX()
  } else {
    focusIndex++
    translateX()
  }
}
function _Ok() {
  var nextPage = data[focusIndex];
  var type = ["3", "7"];
  nextPage["categoryId"] = subjectId;
  nextPage["ztCategoryId"] = subjectId;
  $.savePageInfo(PAGE_NAME, {
    focusIndex: focusIndex,
  });
  if (nextPage.contentType) {
    if (type.indexOf(nextPage.contentType) > -1) {
      if (nextPage.contentType == type[0]) {
        nextPage.contentType = type[1];
      } else {
        nextPage.contentType = type[0];
      }
    }
    $.gotoDetail(nextPage);
  }
}
function translateX() {
  if (init === false) {
    clearTimeout(tips.arrow.timer)
    clearTimeout(tips.pageTip.timer)
  }
  init = false
  if (total > 1) {
    tips.arrow.showAll()
    tips.pageTip.show()
  }
  $("#list").css({
    "-webkit-transform": "translateX(" + (-1920 * focusIndex) + "px)"
  });
}