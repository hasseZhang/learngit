var pageName = "prizeList";

var pageInfo = $.initPageInfo(pageName, ["menu", "list", "vip"], {
  menu: {
    focusIndex: 0
  },
  list: {
    isActive: false,
    firstLineIndex: 0,
    focusIndex: 0,
    menuIndex: 0
  },
  vip: {
    isActive: false
  }
});

var menuList = ["福利兑换", "青铜会员", "白银会员", "黄金会员"];

var menuListIndexMap = ["WE","v1", "v2", "v3"];

var listDataMap = {
  WE: [],
  v1: [],
  v2: [],
  v3: []
};

var vipId = $.getVariable("EPG:isTest") ? "1100008348" : "1100009855";

var $vip = "";

var vipData = "";

var userInfo = null;

var menuCurrent = "";

var listData = "";

function load() {
  var menuCur = $.page.currentMenu;
  var menuIndex = menuListIndexMap.indexOf(menuCur);
  menu.init({
    menuList: menuList,
    menuListIndexMap: menuListIndexMap,
    focusIndex: menuIndex,
    typeName: pageName,
    right: function (index) {
      if (prizeList.canRight() && index === mineList.getState().menuIndex) {
        $.pTool.active(mineList.key);
      }
    },
    up: function () {
      $.pTool.active("activeVipPanel");
    },
    upDateAfter: function (index) {
      prizeList.destory();
      prizeList.renderPage(index);
    }
  });
  if (pageInfo.vip.isActive) {
    prizeList.init(+menuIndex, function () {
      prizeList.initPlug();
      $.pTool.active("activeVipPanel");
    });
    menu.backAddCur();
  } else {
    prizeList.initPlug();
    $.pTool.active(menu.key);
    prizeList.init(+menuIndex);
  }
}

function unload() {
  $.savePageInfo(pageName, {
    menu: menu.getState(),
    list: mineList.getState(),
    vip: {
      isActive: pageInfo.vip.isActive
    }
  });
}

var prizeList = function () {
  var cfg = {
    pre: "prize_item",
    focusIndex: pageInfo.list.focusIndex,
    firstLineIndex: pageInfo.list.firstLineIndex,
    menuIndex: pageInfo.list.menuIndex,
    lineHeight: 196,
    showLine: 3,
    shadowLine: 1,
    columnSize: 3,
    data: [],
    total: 0,
    renderList: _renderItem,
    paddingItem: '<div class="prize_item"></div>',
    hasProgress: false,
    hasLine: true,
    noContentClass: "prize",
    left: function () {
      $.pTool.active(menu.key);
    },
    up: function () {
      $.pTool.active("activeVipPanel");
    },
    ok: ok
  };
  function ok(opt) {
    USER_SERVCICE.userinfo({}, {
      success: function (res) {
        if (res.code == 1e3 && res.data) {
          userInfo = res.data;
          // 剩余数量 实物取值GIFTNUM 虚拟取值COUPONNUM
          var num = opt.GIFTTYPE === '1' ? +opt.GIFTNUM : +opt.COUPONNUM;
          var option = $.UTIL.sclone(userInfo);
          if (opt.STATUS === "未领取") {
            if (num > 0) {
              option.GIFTLEVEL = opt.GIFTLEVEL;
              option.GIFTINFO_ID = opt.GIFTINFO_ID;
              option.GIFTNAME = opt.GIFTNAME;
              option.GIFTTYPE = opt.GIFTTYPE;
              option.COUPONTYPE = opt.COUPONTYPE;
              option.GETCONDITION = opt.GETCONDITION;
              option.GRANTTYPE = opt.GRANTTYPE;
              option.GIFTNUM = num;
              option.ENDDATE = opt.ENDDATE;
              option.INTRODUCTION = opt.INTRODUCTION;
              option.LEVLE = userInfo.LEVLE;
              option.upDataCb = function (info) {
                $.UTIL.merge(userInfo, info);
              };
              option.finishCb = function () {
                var DATE = new $.Date().format("", "yyyy-MM-dd hh-mm-ss");
                listDataMap[menuCurrent][cfg.focusIndex].STATUS = "已领取";
                listDataMap[menuCurrent][cfg.focusIndex].RECEIVEDATE = DATE;
                listData = listDataMap[menuCurrent];
                cfg.data = sortData(listData);
                $("#listWrap").remove();
                mineList.init(cfg);
                $.focusTo({
                  el: "#" + cfg.pre + cfg.focusIndex
                });
              };
              $.pTool.get("us_vipPrize").init(option);
              $.pTool.active("us_vipPrize");
            } else {
              us_cue.show({
                type: 2,
                text: "奖品已兑完，请查看其他奖品吧！"
              });
            }
          } else {
            us_cue.show({
              type: 2,
              text: "该奖品无法重复领取。"
            });
          }
        }
      }
    });
  }
  function WEok(opt){
    USER_SERVCICE.userinfo({}, {
      success: function (res) {
        if (res.code == 1e3 && res.data) {
          userInfo = res.data;
          // 剩余数量 实物取值GIFTNUM 虚拟取值COUPONNUM
          var num = opt.GOODSTYPE === '1' ? +opt.GOODSSURPLUS : +opt.COUPONNUM;
          var option = $.UTIL.sclone(userInfo);
          if (num > 0) {
              option.GOODSINFO_ID = opt.GOODSINFO_ID;
              option.GOODSNAME = opt.GOODSNAME;
              option.GRANTTYPE = opt.GRANTTYPE;
              option.GOODSSURPLUS = num;
              option.ENDDATE = opt.ENDDATE;
              option.INTRODUCTION = opt.INTRODUCTION;
              option.GOODSTYPE = opt.GOODSTYPE;
              option.COUPONTYPE = opt.COUPONTYPE;
              option.GOODSNEEDPOINT = opt.GOODSNEEDPOINT;
              option.GOODSPICTURE = USER_SERVCICE.host + opt.GOODSPICTURE;
              option.upDataCb = function (info) {
                  $.UTIL.merge(userInfo, info);
              };
              option.finishCb = function (pointNum) {
                  $("#m0 .points .num").html(pointNum);
                  USER_SERVCICE.goodsList({}, {
                      success: function (result) {
                          if (result.code == 1e3 && result.data) {
                              This.info.data = result.data;
                              This.sortData();
                              This.initEl(This.info.moduleIndex);
                              if (moduleIndex == 3) {
                                  This.focus();
                              }
                          }
                      },
                      error: function () {
                          us_cue.show({
                              type: 2,
                              text: "网络异常，请您稍后重试。"
                          });
                      }
                  });
              };
              $.pTool.get("us_pointPrize").init(option);
              $.pTool.active("us_pointPrize");
          } else {
              us_cue.show({
                  type: 2,
                  text: "奖品已兑完，请查看其他奖品吧！"
              });
          }
        }
      }
    });
   
  }
  function getData(index, callback) {
    USER_SERVCICE.goodsList({}, {
      success: function (result) {
          if (result.code == 1e3 && result.data) {
           var oneData = [];
              for (var i = 0; i < result.data.length; i++) {
                num = result.data[i].GOODSTYPE === '1' ? +result.data[i].GOODSSURPLUS : +result.data[i].COUPONNUM;
                if (num == 0) {
                    var overData = result.data[i];
                    result.data.splice(i, 1);
                    oneData.push(overData);
                    i--;
                }
            }
            oneData.sort(function (a, b) {
                if (b.WITHOUTDATE > a.WITHOUTDATE) {
                    return 1;
                } else if (b.WITHOUTDATE < a.WITHOUTDATE) {
                    return -1;
                }
            });
            result.data = result.data.concat(oneData)
            listDataMap["WE"] = result.data;
          }
      },
      error: function () {
          us_cue.show({
              type: 2,
              text: "数据请求超时，请返回重试。"
          });
      }
  });
    USER_SERVCICE.giftlist(null, {
      success: function (res) {
        if (res.code == 1e3) {
          if (res.data.length) {
            var list = res.data;
            var giftLevel = "";
            $.UTIL.each(list, function (item, idx) {
              giftLevel = item.GIFTLEVEL == "4" ? "2" : item.GIFTLEVEL == "5" ? "3" : item.GIFTLEVEL;
              switch (giftLevel) {
                case "1":
                  listDataMap["v1"].push(item);
                  break;

                case "2":
                  listDataMap["v2"].push(item);
                  break;

                case "3":
                  listDataMap["v3"].push(item);
                  break;

                default:
                  listDataMap = listDataMap;
                  break;
              }
            });
          }
        } else {
          listDataMap = {};
          us_cue.show({
            type: 2,
            text: "数据请求超时，请返回重试"
          });
          return;
        }
      },
      error: function () {
        listDataMap = {};
        us_cue.show({
          type: 2,
          text: "数据请求超时，请返回重试"
        });
      }
    });
    setTimeout(function(){
      renderPage(index);
          callback && callback();
    },500)
  }
  function _renderItem(data, begin, end) {
    var html = "";
    var picPath = "";
    var exch = "";
    var sellOutHtml = "";
    for (var i = begin; i < end; i++) {
      console.log(data[i])
      picPath = USER_SERVCICE.host + data[i].GIFTPICTURE;
      exch = hasExch(data[i]) ? '<div class="exch"></div>' : "";
      sellOutHtml = "";
      if (data[i].GIFTTYPE === "1") {
        num = +data[i].GIFTNUM;
        num === 0 && (sellOutHtml = '<div class="sellOut"></div>');
      } else {
        num = +data[i].COUPONNUM;
        num === 0 && (sellOutHtml = '<div class="sellOut"></div>');
      }
      html += '<div id="prize_item' + i + '" class="prize_item">' + '<div class="prize_content">' + '<div class="prize_poster noPic">' + exch + '<img src="' + picPath + '">' + "</div>" + (data[i].STATUS === "未领取" ? sellOutHtml : "") + "</div></div>";
    }
    return html;
  }
  function _renderWEItem(data, begin, end){
    var html = "";
    var picPath = "";
    var sellOutHtml = "";
    for (var i = begin; i < end; i++) {
      picPath = USER_SERVCICE.host + data[i].GOODSPICTURE;
      sellOutHtml = "";
      if (data[i].GOODSTYPE === "1") {
        num = +data[i].GOODSSURPLUS;
        num === 0 && (sellOutHtml = '<div class="sellOut"></div>');
      } else {
        num = +data[i].COUPONNUM;
        num === 0 && (sellOutHtml = '<div class="sellOut"></div>');
      }
      html += '<div id="prize_item' + i + '" class="prize_item">' + '<div class="WE_prize_content">' + '<div class="prizeName">' + ($.substringElLength(data[i].GOODSNAME, "24px", '150px').last || '') + "</div>" + '<div class="prizePoint"><img src="images/prizeY.png"><span>' + data[i].GOODSNEEDPOINT + "</span>吉豆</div>" + '<div class="prizeNum">剩余' + num + "</div>" + '<div class="prizePic noPic"><img src=' + picPath + "></div>" + sellOutHtml + "</div></div>";
    }
    return html;
  }
  function renderPage(index) {
    $.recodeData(pageName + "_" + menuListIndexMap[index], "access");
    if (listDataMap[menuListIndexMap[index]] === undefined) {
      us_cue && us_cue.show({
        type: 2,
        text: "数据请求超时，请返回重试"
      });
      return;
    }
    initCfg(index);
    showVipPanel();
    removeDom();
    mineList.init(cfg);
  }
  function initCfg(index) {
    menuCurrent = menuListIndexMap[index];
    listData = listDataMap[menuCurrent];
    cfg.data = index > 0 ? sortData(listData) : listData;
    cfg.renderList = index > 0 ? _renderItem : _renderWEItem;
    cfg.ok = index > 0 ? ok : WEok;
    cfg.total = cfg.data.length;
    cfg.menuIndex = index;
  }
  function removeDom() {
    var $listWrap = $("#listWrap");
    var $noContent = $(".no_content");
    var $pageNum = $("#pageNum");
    if (cfg.total && $noContent) {
      $noContent.hide();
    }
    if (!cfg.total && $pageNum) {
      $pageNum.hide();
    }
    if ($listWrap) {
      $listWrap.remove();
    }
  }
  function destory() {
    cfg.focusIndex = 0;
    cfg.firstLineIndex = 0;
  }
  function init(index, callback) {
    getData(index, callback);
  }
  function showVipPanel() {
    if (!$vip) {
      $.s.guidance.get({
        id: vipId
      }, {
        async: false,
        success: function (data) {
          var src = "";
          if (data) {
            vipData = data;
            src = $.getPic(vipData[0].pics, [3]);
          }
          renderVipPanel(src);
        },
        error: function () {
          var src = "";
          renderVipPanel(src);
        }
      });
    }
    if (cfg.total) {
      $vip.show();
    } else {
      $vip.hide();
    }
  }
  function renderVipPanel(src) {
    $vip = $('<div id="vipPanel" class="hide"><img src="' + src + '" alt="" /></div>');
    $vip.appendTo("body");
  }
  function activeVipPanel() {
    var key = "activeVipPanel";
    var keysMap = {
      KEY_DOWN: function () {
        $.pTool.active(mineList.key);
        return true;
      },
      KEY_OK: function () {
        var url = vipData[1];
        $.gotoDetail(url);
        return true;
      }
    };
    var active = function () {
      pageInfo.vip.isActive = true;
      $.focusTo({
        el: "#vipPanel"
      });
    };
    var deactive = function () {
      pageInfo.vip.isActive = false;
    };
    return {
      key: key,
      keysMap: keysMap,
      active: active,
      deactive: deactive
    };
  }
  function initPlug() {
    $.pTool.add("activeVipPanel", activeVipPanel());
  }
  function canRight() {
    return !!cfg.total;
  }
  function hasExch() {
    if (arguments[0].STATUS === "已领取") {
      return true;
    }
    return false;
  }
  function sortData(data) {
    var moveData = [];
    for (var i = 0; i < data.length; i++) {
      if (hasExch(data[i])) {
        moveData.push(data[i]);
        data.splice(i, 1);
        i--;
      }
    }
    if (moveData.length) {
      var newData = moveData.sort(function (a, b) {
        return a.RECEIVEDATE < b.RECEIVEDATE ? 1 : -1;
      });
      data.push.apply(data, newData);
    }
    return data;
  }
  return {
    init: init,
    renderPage: renderPage,
    destory: destory,
    initPlug: initPlug,
    canRight: canRight
  };
}();