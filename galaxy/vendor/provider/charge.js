var name = "provider:charge";

var lg = Logger;

var topic = new $.Topic();

var last = getExptCache(name);

if (last && last.topic) {
    topic._NS_Topic_once = last.topic._NS_Topic_once;
    topic._NS_topic = last.topic._NS_topic;
}

var lastType;

function lastTypeNeedRestart() {
    return ("repeat" === lastType || "begin" === lastType) && lastType;
}

if (last && last.data) {
    lastType = last.data.type;
    if (lastTypeNeedRestart()) {
        last.data.clear();
    } else {
        lastType = null;
    }
}

last = null;

function callback(data) {
    lg.debug("callback", name);
    dealData(name, data, noChange, hasChange, callbackErr);
}

function complete() {
    lg.debug("complete", name);
    topic.pub("complete", cache());
}

function noChange(data) {
    lg.debug("noChange", name);
    topic.pub("none", data);
}

function hasChange(changeList, data) {
    lg.debug("hasChange", name);
    topic.pub("change", changeList, data);
}

function callbackErr() {
    Logger.out.error = [ "%s fetch error", name ];
    topic.pub("error");
}

var data = $.Timer(function() {
    lg.debug("fetchData", name);
    var CHARGE_INFO = {};
    $.s.guidance.get({
        id: getVariable("common.charge")
    }, {
        success: function(ds) {
            each(ds, function(d) {
                var infos = d.contentUri.split("#");
                var chargesId = infos[0];
                var entrance = infos[1] || "";
                var pkgType = infos[2] || "";
                var vipAreaUrl = d.contentName || "";
                CHARGE_INFO[chargesId] = {
                    chargesId: chargesId,
                    entrance: entrance,
                    pkgType: pkgType,
                    vipAreaUrl: vipAreaUrl,
                    pics: d.pics
                };
                infos = null;
                chargesId = null;
                entrance = null;
                pkgType = null;
                vipAreaUrl = null;
            });
            ds = null;
            $.s.charge.get(null, {
                success: function(distChargesInfo) {
                    each(distChargesInfo, function(d) {
                        if (d && CHARGE_INFO[d.chargesId]) {
                            each(d.disNodeChargesInfos, function(v) {
                                if (v.distNodeId == EPG.dnId) {
                                    CHARGE_INFO[d.chargesId].chargesName = +v.chargesType ? v.chargesName : "单片";
                                    CHARGE_INFO[d.chargesId].chargesType = v.chargesType;
                                    CHARGE_INFO[d.chargesId].chargesDescription = v.chargesDescription;
                                    CHARGE_INFO[d.chargesId].chargesSpId = v.chargesSpId;
                                    CHARGE_INFO[d.chargesId].jsChargesPicInfos = v.jsChargesPicInfos;
                                    return true;
                                }
                                v = null;
                            });
                        }
                        d = null;
                    });
                    distChargesInfo = null;
                    callback(JSON.stringify(CHARGE_INFO));
                },
                error: callbackErr,
                complete: function() {
                    CHARGE_INFO = null;
                    complete();
                },
                timeout: 2e3
            });
        },
        error: callbackErr,
        complete: complete,
        timeout: 1e3
    });
}, 1e3 * 60 * 43);

function cache() {
    return getFileInfoData(name);
}

if (lastTypeNeedRestart()) {
    data[lastTypeNeedRestart()]();
}

function padding(cb) {
    if ($.UTIL.isFunction(cb)) {
        topic.once("complete", cb);
        data.now().repeat();
        return true;
    }
}

expt.rev = 1;

expt.expire = 0;

expt.padding = padding;

expt.data = data;

expt.cache = cache;

expt.topic = topic;