var pageName = "myOrderPage";

var pageInfo = $.initPageInfo(pageName, ["menu", "mo", "firstFlag", "isPointFocus", "menuRight"], {
  menu: {
    isActive: false
  },
  mo: {
    isActive: false,
    focus: "mo_item0",
    firstLineIndex: 0,
    focusIndex: 0
  },
  firstFlag: false,
  isPointFocus: false,
  menuRight: true
});

function load() {
  menu.addToPtool();
  var firstFlag = pageInfo.firstFlag;
  var upDateAfter = function (con) {
    $.recodeData(pageName + "_" + con.current, "access");
    mo.initConfig(con);
    mo.setCallBack(menu.active);
    mo.renderPage(con, firstFlag);
  };
  mo.init({
    left: menu.active
  });
  menu.init({
    right: function () {
      if (!mo.getNowObj().data.length) return true;
      $.pTool.active(mo.key());
    },
    upDateAfter: upDateAfter
  });
  if (!pageInfo.menu.isActive && !pageInfo.mo.isActive && !pageInfo.isPointFocus) {
    mo.setCallBack(menu.active);
    menu.active();
  }
  if (!pageInfo.menu.isActive && !pageInfo.mo.isActive && pageInfo.isPointFocus) {
    mo.setCallBack($.pTool.active('pointExchangeBtnPlug'));
    menu.blur();
  }
  if (!pageInfo.menu.isActive && pageInfo.mo.isActive && pageInfo.mo.focus) {
    mo.setCallBack(function () {
      menu.blur();
      mo.active();
    }, function () {
      mo.setConfig({
        current: pageInfo.menu.current,
        firstLineIndex: pageInfo.mo.firstLineIndex,
        focusIndex: pageInfo.mo.focusIndex
      });
    });
    return;
  }
  // if(!pageInfo.mo.isActive){
  //     mo.setCallBack(menu.active);
  //     menu.active();
  // }
}

function unload() {
  var saveInfo = {
    mo: mo.getState(),
    menu: menu.getState(),
    isPointFocus: mo.getFocusId(),
    menuRight: mo.menuRight()
  };
  $.savePageInfo(pageName, saveInfo);
}
