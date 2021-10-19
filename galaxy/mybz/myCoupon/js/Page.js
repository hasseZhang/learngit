var pageName = "myCouponPage";

var pageInfo = $.initPageInfo(pageName, ["menu", "mc", "firstFlag"], {
    menu: {
        isActive: false
    },
    mc: {
        isActive: false,
        focus: "mo_item0",
        firstLineIndex: 0,
        focusIndex: 0
    },
    firstFlag: false
});

function load() {
    menu.addToPtool();
    var firstFlag = pageInfo.firstFlag;
    var upDateAfter = function (con) {
        $.recodeData(pageName + "_" + con.current, "access");
        mc.initConfig(con);
        mc.setCallBack(menu.active);
        mc.renderPage(con, firstFlag);
    };
    mc.init({
        firstLineIndex: pageInfo.mc.firstLineIndex,
        focus: pageInfo.mc.focus,
        focusIndex: pageInfo.mc.focusIndex,
        left: menu.active
    });
    menu.init({
        right: function () {
            if ($("body").hasClass("nouse")) {
                $.pTool.active(mc.useRulesBtn);
                return;
            }else if (!mc.getNowObj().data.length) {
               return;
            }
            $.pTool.active(mc.key);
        },
        upDateAfter: upDateAfter
    });
    if (!pageInfo.menu.isActive && !pageInfo.mc.isActive) {
        mc.setCallBack(menu.active);
        menu.active();
        return;
    }
    // 判断是否是使用完优惠券返回
    if(Authentication.CTCGetConfig("coupon") == 1){
        mc.setCallBack(menu.active);
        menu.active();
        Authentication.CTCSetConfig("coupon",null);
        return;
    }
    if (!pageInfo.menu.isActive && pageInfo.mc.isActive && pageInfo.mc.focus) {
        mc.setCallBack(function () {
            menu.blur();
            mc.active();
        }, function () {
            mc.setConfig({
                current: pageInfo.menu.current,
                firstLineIndex: pageInfo.mc.firstLineIndex,
                focusIndex: pageInfo.mc.focusIndex
            });
        });
        return;
    }
}

function unload() {
    var saveInfo = {
        mc: mc.getState(),
        menu: menu.getState()
    };
    $.savePageInfo(pageName, saveInfo);
}