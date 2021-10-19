var pageName = "medaList";

var DEFAULT_FOCUS = "pageDown";

var FOCUS_INFO = {
  pageUp: ["", "pageDown", "", ""],
  pageDown: ["", "", "", "pageUp"]
};
var active;

var actPage = 0;

var DATA = [];

var pageInfo = $.initPageInfo(pageName, ["Focus"], {
  'Focus': DEFAULT_FOCUS,
});
function load() {
  $.recodeData(pageName, "access");
  active = pageInfo['Focus'];
  USER_SERVCICE.pointsStream({}, {
    async: false,
    success: function (res) {
      if (res.code == 1e3 && res != "timeout") {
        DATA = res.data;
        if (DATA.length <= 5) {
          $("#page").hide();
        } else {
          $("#page").show();
        }
        page.renderList();
        $.pTool.active("pageFocus");
      }
    },
    error: function () {
      us_cue.show({
        type: 2,
        text: "数据请求超时，请返回重试。"
      });
    }
  });
  USER_SERVCICE.userinfo({}, {
    async: false,
    success: function (res) {
      if (res.code == 1e3 && res != "timeout") {
        $("#flag").html(res.data.POINTSUM);
        if (DATA.length != 0) {
          $("#delete").html(res.data.CLEANPOINTSDATE + "清零");
          $("#delete").show();
        }
      }
    },
    error: function () {
      us_cue.show({
        type: 2,
        text: "数据请求超时，请返回重试。"
      });
    }
  });
}

function unload() { 
$.savePageInfo(pageName, {
  'Focus': active
});
$.pTool.deactive("pageFocus");
}

var page = function () {
  var _renderList = function () {
    var html = "";
    var s = actPage * 5, e = (actPage + 1) * 5;
    for (var i = s, k = 0; i < e; i++ , k++) {
      if (!DATA[i]) break;
      html += ' <div id="list' + k + '">' + '<div class="access">' + DATA[i].POINTYPENAME + "</div>" + '<div class="number">' + DATA[i].POINTNUM + "</div>" + '<div class="times">' + _changeTime(DATA[i].TASKDATE) + "</div></div>";
    }
    $("#list").html(html);
    _pageNum();
  };
  var _changeTime = function (key) {
    var d = key.split(" ")[0];
    var t = key.split(" ")[1];
    return d.split("-")[0] + "年" + d.split("-")[1] + "月" + d.split("-")[2] + "日" + t.split(":")[0] + ":" + t.split(":")[1];
  };
  var _pageUp = function () {
    actPage > 0 && actPage--;
    _renderList();
  };
  var _pageDown = function () {
    if (DATA.length <= 5) {
      return;
    }
    actPage < Math.floor(DATA.length / 5) && actPage++;
    _renderList();
  };
  var _pageNum = function () {
    $("#pageNum").html(actPage + 1 + "/" + Math.ceil(DATA.length / 5));
    switch (actPage + 1) {
      case 1:
        $("#pageUp").addClass("dark");
        if (actPage + 1 != Math.ceil(DATA.length / 5)) {
          $("#pageDown").removeClass("dark");
        }
        break;

      case Math.ceil(DATA.length / 5):
        $("#pageDown").addClass("dark");
        if (actPage + 1 != 1) {
          $("#pageUp").removeClass("dark");
        }
        break;

      default:
        $("#pageUp").removeClass("dark");
        $("#pageDown").removeClass("dark");
    }
  };
  var _focusTo = function (key) {
    var focus = "";
    switch (key) {
      case "left":
        if (!$("#pageUp").hasClass("dark")) {
          focus = FOCUS_INFO[active][3];
        }
        break;

      case "right":
        if (!$("#pageDown").hasClass("dark")) {
          focus = FOCUS_INFO[active][1];
        }
        break;
    }
    if (focus) {
      $.focusTo({
        el: "#" + focus
      });
      active = focus;
    }
  };
  return {
    renderList: _renderList,
    focusTo: _focusTo,
    pageUp: _pageUp,
    pageDown: _pageDown,
    pageNum: _pageNum
  };
}();

$.pTool.add("pageFocus", function () {
  return {
    key: "pageFocus",
    keysMap: {
      KEY_UP: function () {
        if(active !== 'rulesBtn'){
          active = 'rulesBtn'
          $.focusTo({
            el: "#" + active
          });
        }
        return true;
      },
      KEY_DOWN: function () {
       if (DATA.length <= 5 || active !== 'rulesBtn'){
         return true
       }
      active = DEFAULT_FOCUS
      $.focusTo({
        el: "#" + DEFAULT_FOCUS
      });
      return true;
      },
      KEY_LEFT: function () {
        page.focusTo("left");
        return true;
      },
      KEY_RIGHT: function () {
        page.focusTo("right");
        return true;
      },
      KEY_PAGEUP: function () {
        if (!$("#pageUp").hasClass("dark")) {
          page.focusTo("left");
          page.pageUp();
        }
        return true;
      },
      KEY_PAGEDOWN: function () {
        if (!$("#pageDown").hasClass("dark")) {
          page.focusTo("right");
          page.pageDown();
        }
        return true;
      },
      KEY_OK: function () {
        switch (active) {
          case "pageUp":
            page.pageUp();
            break;

          case "pageDown":
            page.pageDown();
            break;

          case "rulesBtn":
            $.gotoDetail({
              contentType: "7",
              url: 'userSystem/rule/'
          });
          break;
        }
      }
    },
    active: function () {
      if(DATA.length <= 5 || active === 'rulesBtn'){
        active = 'rulesBtn';
        $.focusTo({
          el: "#" + active
        });
      }else{
        active = DEFAULT_FOCUS
        $.focusTo({
          el: "#" + active
        });
      }
    },
    deactive: function () { }
  };
}());