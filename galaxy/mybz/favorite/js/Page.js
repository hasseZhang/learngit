var pageName = "favoritePage",
    pageInfo = $.initPageInfo(pageName, ["menu", "fav", "firstFlag"], {
        menu: {
            isActive: !0
        },
        fav: {
            isActive: !1,
            focus: "fav_item0",
            firstLineIndex: 0,
            focusIndex: 0
        },
        firstFlag: !1
    });

function load() {
    menu.addToPtool(), fav.addToPtool();
    var e = pageInfo.firstFlag;
    menu.init({
        right: function () {
            fav.getDataLen() && fav.active()
        },
        upDateAfter: function (a) {
            $.recodeData(pageName + "_" + a.current, "access"), fav.resetConfig(), fav.setCallBack(menu.active),
                fav.renderPage(a, e)
        }
    }), fav.init({
        firstLineIndex: pageInfo.fav.firstLineIndex,
        focus: pageInfo.fav.focus,
        focusIndex: pageInfo.fav.focusIndex,
        left: menu.active
    }), !pageInfo.menu.isActive && pageInfo.fav.isActive && pageInfo.fav.focus ? fav.setCallBack(function () {
        menu.blur(), fav.active()
    }, menu.active) : fav.setCallBack(menu.active, menu.active)
}

function unload() {
    var e = {
        fav: fav.getState(),
        menu: menu.getState()
    };
    $.savePageInfo(pageName, e)
}