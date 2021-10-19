var pageName = "playHistoryPage",
    pageInfo = $.initPageInfo(pageName, ["menu", "ph"], {
        menu: {
            isActive: !0
        },
        ph: {
            isActive: !1,
            focus: "ph_item0",
            firstLineIndex: 0,
            focusIndex: 0
        }
    });

function load() {
    menu.addToPtool(), $.recodeData(pageName, "access"), ph.addToPtool();
    var e = pageInfo.firstFlag;
    ph.init({
        firstLineIndex: pageInfo.ph.firstLineIndex,
        focus: pageInfo.ph.focus,
        focusIndex: pageInfo.ph.focusIndex,
        left: menu.active
    }), !pageInfo.menu.isActive && pageInfo.ph.isActive && pageInfo.ph.focus ? ph.setCallBack(function () {
        menu.blur(), ph.active()
    }, menu.active) : ph.setCallBack(menu.active, function () {
        menu.active()
    }), menu.init({
        right: ph.active,
        upDateAfter: function (a) {
            ph.renderPage(a, e)
        }
    })
}

function unload() {
    var e = {
        ph: ph.getState(),
        menu: menu.getState()
    };
    $.savePageInfo(pageName, e)
}