var pageName = "memberGrade";

var pageInfo = $.initPageInfo(pageName, ["headerActive", "headerActiveKey", "focusIndex"], {
    headerActive: false,
    headerActiveKey: "search",
    focusIndex: 0
});
var memberId = $.getVariable("EPG:isTest") ? ["1100008313", "1100008314", "1100008315"] : ["1100009852", "1100009853", "1100009854"];

var headerActiveKey = pageInfo.headerActiveKey;

var focusIndex = pageInfo.focusIndex;

var memberList = [];

var memberInfo = "";

var pre = "grade";

var $wrap = "";

var lastPlug = "";

function load() {
    $.recodeData(pageName, "access");
    $wrap = $(".wrap");
    page.renderHeader();
    if (pageInfo.headerActive) {
        page.init();
        $.pTool.active("header");
    } else {
        page.init(function () {
            $.pTool.active("memberList");
        });
    }
}
function unload() {
    savePageInfo()
}
function savePageInfo() {
    var headerInfo = $.pTool.get("header").getInfo();
    var info = {
        headerActive: headerInfo.isActive,
        headerActiveKey: headerInfo.activeKey,
        focusIndex: focusIndex
    };
    $.savePageInfo(pageName, info)
}
var page = function () {
    var renderHeader = function () {
        $.pTool.get("header").init({
            activeKey: headerActiveKey,
            isUserSystem: true,
            leaveHeader: function () {
                lastPlug = "header";
                $.pTool.active("memberList");
            }
        });
    };
    var renderLeft = function () {
        var gradeHtml = "";
        var src = "";
        var activeState = "";
        for (var i = 0; i < memberList.length; i++) {
            src = memberList[i].picPath;
            activeState = hasInfo() ? '<div class="activeState">' + memberInfo.status[i] + "</div>" : "";
            gradeHtml += '<div id="grade' + i + '" class="grade noPic">' + '<img src="' + src + '">' + activeState + '<div class="arrow"></div></div>';
        }
        $(gradeHtml).appendTo($("#left"));
    };
    var renderRight = function (index) {
        $wrap.html("");
        var cardDetail = memberList[index].textList;
        var len = cardDetail.length;
        var el = "";
        var name = "";
        var brief = "";
        for (var i = 0; i < len; i++) {
            name = cardDetail[i].contentName;
            brief = $.substringElLength(cardDetail[i].contentUri, "17px", "2800px").last;
            el += '<div id="detail' + i + '" class="detail">' + '<div class="name">' + name + "</div>" + '<div class="brief">' + brief + "</div></div>";
        }
        $(el).appendTo($wrap);
    };
    function renderNum() {
        var num = hasInfo() ? memberInfo.medalNum : "";
        var time = hasInfo() ? memberInfo.level === "0" ? "" : "有效期：" + memberInfo.validTime : "有效期：";
        $(".num").html(num);
        $(".time").html(time);
    }
    function getMemberDetail(callback) {
        $.UTIL.each(memberId, function (value, index) {
            $.s.guidance.get({
                id: value
            }, {
                async: false,
                success: function (data) {
                    if (data) {
                        memberList[index] = {
                            picPath: $.getPic(data[0].pics, [3]),
                            urlData: data.slice(0, 1),
                            textList: data.slice(1)
                        };
                    }
                },
                error: function () {
                    $.pTool.active("header");
                }
            });
        });
        if (memberList.length) {
            renderLeft();
            renderRight(getLevel());
        } else {
            $.pTool.active("header");
        }
    }
    function getMemberInfo(callback) {
        USER_SERVCICE.userinfo(null, {
            success: function (res) {
                if (res.code == 1e3 && res.data) {
                    memberInfo = {
                        level: res.data.LEVEL,
                        medalNum: res.data.MEDALNUM,
                        validTime: res.data.VALIDDATE,
                        status: [res.data.V1STATUS, res.data.V2STATUS, res.data.V3STATUS]
                    };
                } else {
                    us_cue.show({
                        type: 2,
                        text: "数据请求超时，请返回重试"
                    });
                }
                callback && callback();
            },
            error: function () {
                us_cue.show({
                    type: 2,
                    text: "数据请求超时，请返回重试"
                });
                callback && callback();
            }
        });
    }
    function hasInfo() {
        return !!memberInfo;
    }
    function init(callback) {
        getMemberInfo(function () {
            renderNum();
            getMemberDetail();
            callback && callback();
        });
    }
    return {
        renderHeader: renderHeader,
        renderNum: renderNum,
        renderRight: renderRight,
        init: init
    };
}();

function getLevel() {
    var idx = 0;
    if ($.isBack()) {
        idx = focusIndex;
    } else {
        if (!parseInt(memberInfo.level)) {
            idx = 0;
        } else {
            idx = parseInt(memberInfo.level) - 1;
        }
    }
    return idx;
}

$.pTool.add("memberList", function () {
    function focusTo() {
        $.focusTo({
            el: "#" + pre + focusIndex
        });
    }
    return {
        key: "memberList",
        keysMap: {
            KEY_UP: function () {
                if (focusIndex === 0) {
                    $.pTool.active("header");
                    return;
                }
                focusIndex--;
                focusTo();
                page.renderRight(focusIndex);
                return true;
            },
            KEY_DOWN: function () {
                if (focusIndex === memberList.length - 1) {
                    return;
                }
                focusIndex++;
                focusTo();
                page.renderRight(focusIndex);
                return true;
            },
            KEY_OK: function () {
                var url = memberList[focusIndex].urlData[0].contentUri;
                $.gotoDetail(url);
                return true;
            },
            KEY_RETURN: function () {
                $.back();
                return true;
            }
        },
        active: function () {
            if (lastPlug === "header") {
                focusIndex = 0;
                focusTo();
                return;
            }
            focusIndex = getLevel();
            focusTo();
        },
        deactive: function () {
            lastPlug = "";
        }
    };
}());