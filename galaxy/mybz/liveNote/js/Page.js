var pageName = "liveNotePage",
    pageInfo = $.initPageInfo(pageName, [
        "menu", "ln", "firstFlag"
    ], {
        menu: {
            isActive: !0
        },
        ln: {
            isActive: !1,
            focus: "ln_item0",
            firstLineIndex: 0,
            focusIndex: 0
        }
    });
function load() {
    menu.addToPtool(),
    $.recodeData(pageName, "access"),
    ln.addToPtool();
    var e = pageInfo.firstFlag;
    ln.init({firstLineIndex: pageInfo.ln.firstLineIndex, focus: pageInfo.ln.focus, focusIndex: pageInfo.ln.focusIndex, left: menu.active}),
    ! pageInfo.menu.isActive && pageInfo.ln.isActive && pageInfo.ln.focus ? ln.setCallBack(function (e) {
        e ? (menu.blur(), ln.active()) : menu.active()
    }) : ln.setCallBack(menu.active),
    menu.init({
        right: ln.active,
        upDateAfter: function (n) {
            ln.renderPage(n, e)
        }
    })
}
function unload() {
    var e = {
        ln: ln.getState(),
        menu: menu.getState()
    };
    $.savePageInfo(pageName, e);
}
