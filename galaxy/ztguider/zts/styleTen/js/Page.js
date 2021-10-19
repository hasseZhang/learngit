var ACTIVE_OBJECT
var total = null
var PAGE_NAME = "ZT_STYLETEN" + subjectId
var DATA = DATALIST
var categoryId = subjectId
var $content = null
var $list = null
var focusIndex = null
var data = DATA[0].valData
var front1 = null
var front2 = null
var front3 = null
var back3 = null
var back2 = null
var back1 = null
var title = []
var PAGE_INFO = [
  {
    key: "list",
    pressLeft: _Left,
    pressRight: _Right,
    pressOk: _Ok,
  },
]
var ACTIVE_OBJECT = PAGE_INFO[0];
var pageInfo = $.initPageInfo(PAGE_NAME, ["focusIndex", "front1", "front2", "front3", "back1", "back2", "back3"], {
  focusIndex: 3,
  front1: 0,
  front2: 1,
  front3: 2,
  back1: 6,
  back2: 5,
  back3: 4,
});
focusIndex = pageInfo.focusIndex
front1 = pageInfo.front1
front2 = pageInfo.front2
front3 = pageInfo.front3
back1 = pageInfo.back1
back2 = pageInfo.back2
back3 = pageInfo.back3
function initPage() {
  $.recodeData(subjectName, "zt");
  $content = $("#content")
  $list = $("#list")
  _initBackGround()
  renderPage()
}
function _initBackGround() {
  $("body").css("background", 'url("' + bImgPath + '") no-repeat transparent');
}
function renderPage() {
  total = data.length
  var titleName = ""
  var img = ""
  var str = ""
  if(total>7){
    for (var i = 0; i < total; i++) {
      titleName = data[i].contentName
      img = data[i].img
      str += '<img src="' + img + '" class="item" id="item' + i + '"/>'
      title.push(data[i].contentName)
    }
  }else{
    for (var i = 0; i < 7; i++) {
      if(i<data.length){
        titleName = data[i].contentName
        img = data[i].img
        str += '<img src="' + img + '" class="item" id="item' + i + '"/>'
        title.push(data[i].contentName)
      }else{
        str += '<img src=" " class="item noPic" id="item' + i + '"/>'
        title.push("暂无内容")
      } 
    }
  }

  $list.html(str)
  showInitItem()
  addItemClass()
  focusTo()
  titleScroll()
}
function showInitItem() {
  $(".list").find(".item").hide()
  $("#item" + front1).show()
  $("#item" + front2).show()
  $("#item" + front3).show()
  $("#item" + back1).show()
  $("#item" + back2).show()
  $("#item" + back3).show()
  $("#item" + focusIndex).show()
}
function removeClass() {
  $("#item" + front1).removeClass("front1")
  $("#item" + front2).removeClass("front2")
  $("#item" + front3).removeClass("front3")
  $("#item" + focusIndex).removeClass("active")
  $("#item" + back3).removeClass("back3")
  $("#item" + back2).removeClass("back2")
  $("#item" + back1).removeClass("back1")
  $(".title").remove()
}
function addItemClass() {
  $("#item" + front1).addClass("front1")
  $("#item" + front2).addClass("front2")
  $("#item" + front3).addClass("front3")
  $("#item" + focusIndex).addClass("active")
  $("#item" + back3).addClass("back3")
  $("#item" + back2).addClass("back2")
  $("#item" + back1).addClass("back1")
  focusTo()
  $('<div class="title autoText">' + title[focusIndex] + '</div>').appendTo($list)
}

function _Right() {
  removeClass()
  if(total>7){
  ++focusIndex > total - 1 ? focusIndex = 0 : null;
  ++front3 > total - 1 ? front3 = 0 : null;
  ++front2 > total - 1 ? front2 = 0 : null;
  ++front1 > total - 1 ? front1 = 0 : null;
  ++back3 > total - 1 ? back3 = 0 : null;
  ++back2 > total - 1 ? back2 = 0 : null;
  ++back1 > total - 1 ? back1 = 0 : null;
  }else{
    ++focusIndex >6? focusIndex = 0 : null;
  ++front3 > 6 ? front3 = 0 : null;
  ++front2 > 6 ? front2 = 0 : null;
  ++front1 > 6 ? front1 = 0 : null;
  ++back3 > 6 ? back3 = 0 : null;
  ++back2 > 6 ? back2 = 0 : null;
  ++back1 > 6 ? back1 = 0 : null;
  }

  showInitItem()
  addItemClass()
  titleScroll()
}
function _Left() {
  removeClass()
  if(total>7){
  --focusIndex < 0 ? focusIndex = total + focusIndex : null;
  --front3 < 0 ? front3 = total + front3 : null;
  --front2 < 0 ? front2 = total + front2 : null;
  --front1 < 0 ? front1 = total + front1 : null;
  --back3 < 0 ? back3 = total + back3 : null;
  --back2 < 0 ? back2 = total + back2 : null;
  --back1 < 0 ? back1 = total + back1 : null;
  }else{
  --focusIndex < 0 ? focusIndex = 7 + focusIndex : null;
  --front3 < 0 ? front3 = 7 + front3 : null;
  --front2 < 0 ? front2 = 7 + front2 : null;
  --front1 < 0 ? front1 = 7 + front1 : null;
  --back3 < 0 ? back3 = 7 + back3 : null;
  --back2 < 0 ? back2 = 7 + back2 : null;
  --back1 < 0 ? back1 = 7 + back1 : null;
  }

  showInitItem()
  addItemClass()
  titleScroll()
}
function _Ok() {
  var nextPage = data[focusIndex];
  var type = ["3", "7"];
  nextPage["categoryId"] = subjectId;
  nextPage["ztCategoryId"] = subjectId;
  $.savePageInfo(PAGE_NAME, {
    focusIndex: focusIndex,
    front1: front1,
    front2: front2,
    front3: front3,
    back1: back1,
    back2: back2,
    back3: back3,
  });

  if (type.indexOf(nextPage.contentType) > -1) {
    if (nextPage.contentType == type[0]) {
      nextPage.contentType = type[1];
    } else {
      nextPage.contentType = type[0];
    }
  }
  $.gotoDetail(nextPage);
}
function focusTo() {
  $.focusTo({
    el: $("#item" + focusIndex)
  })
}
function titleScroll() {
  var e = $("#list .title");
  $.Marquee({ el: e[0]})
}