var name = "provider:reserve",
    lg = Logger,
    KEY = "reserve",
    KEY_TIMER = "reserveTimer";

function encodeName(e) {
    if ($.UTIL.isString(e)) return e.replace(/:|\\|\//g, function (e) {
        return {
            ":": "%3A",
            "\\": "%5C",
            "/": "%2F"
        } [e]
    })
}

function decodeName(e) {
    return decodeURIComponent(decodeURIComponent(e))
}

function add(e, a, t, r, n) {
    a = encodeURIComponent(encodeName(a)), $.s.reserve.add({
        channelId: e,
        program: a,
        startTime: t
    }, {
        success: all.bind(null, r),
        error: n
    })
}

function checkAdd(e, a, t, r, n, o, l) {
    var s = getDataByTime(t);
    s ? replaceInfo(s, e, a, t, function (e) {
        apply(o, [e])
    }.bind(null, sclone(s)), l) : add(e, a, t, r, n)
}

function replace(e, a, t, r, n) {
    add(e, a, t, r, n)
}

function remove(e, a, t) {
    $.s.reserve.remove({
        startTime: e
    }, {
        success: all.bind(null, a),
        error: t
    })
}

function empty(e, a) {
    $.s.reserve.empty(null, {
        success: all.bind(null, e),
        error: a
    })
}

function all(e) {
    $.s.reserve.all(null, {
        success: function (e, a) {
            saveData(a), $.UTIL.apply(e, [a])
        }.bind(null, e),
        error: e
    })
}

function saveData(e) {
    var a = {
            length: 0
        },
        t = (new $.Date).format("yyyyMMddhhmm");
    if (e && e.data && e.data.length)
        for (var r = 0; r < e.data.length; r++) {
            var n = e.data[r];
            n && n.startTime >= t && (n.program = decodeName(n.program), a[n.startTime] = n, a.length++)
        }
    $.saveGlobalData(KEY, a), a.length ? startTimer() : stopTimer()
}

function getDataByTime(e) {
    var a = $.getGlobalData(KEY);
    return a && a[e]
}

function replaceInfo(e, a, t, r, n, o) {
    var l = $.pTool.get("g_sys_replace");
    l ? l.show(e.program, replace.bind(null, a, t, r, n, o)) : replace(a, t, r, n, o)
}

function showInfo() {
    var e = getDataByTime((new $.Date).format("yyyyMMddhhmm"));
    if (e) {
        lg.info(e);
        var a = $.pTool.get("g_sys_reserve");
        a && a.show(e.program, e.channelId.channelId);
        var t = $.getGlobalData(KEY);
        delete t[e.time], t.length--, $.saveGlobalData(KEY, t), t.length <= 0 && stopTimer(), t = a = e = null
    }
}

function startTimer() {
    stopTimer();
    var e = 1e3 * (60 - (new Date).getSeconds());
    e = setTimeout(startTimer2, e), $.saveGlobalData(KEY_TIMER, e)
}

function startTimer2() {
    showInfo();
    var e = setInterval(showInfo, 6e4);
    $.saveGlobalData(KEY_TIMER, e)
}

function stopTimer() {
    var e = $.getGlobalData(KEY_TIMER);
    e && (clearInterval(e), $.saveGlobalData(KEY_TIMER, void 0))
}
stopTimer(), expt.rev = 1, expt.expire = 0, expt.add = checkAdd, expt.remove = remove, expt.empty = empty, expt.all = all;