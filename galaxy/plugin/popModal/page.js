var userRights = function () {
    var $dialog = null;
    var activeKey = "";
    var focusMap = {};
    var key = "userRights";
    var isShow = false;
    var uuid = "";
    function focusTo(dir) {
        baseFocusTo(focusMap[activeKey][dir]);
    }
    function baseFocusTo(key) {
        if (key) {
            activeKey = key;
            $.focusTo({
                el: "#" + key
            });
        }
    }
    $.pTool.add(key, function () {
        return {
            key: key,
            dft: true,
            keysMap: {
                KEY_UP: function () {
                    focusTo("up");
                    return true;
                },
                KEY_DOWN: function () {
                    focusTo("down");
                    return true;
                },
                KEY_LEFT: function () {
                    focusTo("left");
                    return true;
                },
                KEY_RIGHT: function () {
                    focusTo("right");
                    return true;
                },
                KEY_OK: function () {
                    var btnData = focusMap[activeKey];
                    $.vs.event(uuid + "_" + activeKey, "10", true);
                    var btnType = btnData.type;
                    if (btnType === "redirect") {
                        var arr = btnData.url.split("://");
                        var type = arr[0];
                        var contentId = arr[1];
                        var typeMap = {
                            vod: "0",
                            series: "2",
                            xilieju: "3",
                            zt: "4",
                        };
                        var contentType = typeMap[type] || "7";
                        var urlMap = {
                            4: "detailPage/" + (contentType === "4" && contentId ? top.getFTPFilePath(contentId, "").slice(0, -1) + "/index.html" : ""),
                            7: btnData.url
                        };
                        $.gotoDetail({
                            contentType: contentType,
                            contentUri: urlMap[contentType],
                            contentId: contentId,
                            categoryId: "tanchuang"
                        });
                    } else if (btnType === "close") {
                        $.pTool.deactive(key);
                    }
                    return true;
                },
                KEY_RETURN: function () {
                    $.pTool.deactive(key);
                    return true;
                },
                KEY_DIBBLING: function () {
                    $.pTool.deactive(key);
                },
                KEY_INFORMATION: function () {
                    $.pTool.deactive(key);
                }
            },
            active: function () { },
            deactive: function () {
                $dialog.hide();
                isShow = false;
                $.pTool.get("p_module").upActiveNum();
            },
            cover: function () { },
            uncover: function () { },
            destroy: function () { }
        };
    }());
    return {
        show: function () {
            if (groupTool.getGroup()) {
                userGroup = groupTool.getGroup().join(",");
                top.popModal.modal({
                    groups: userGroup,
                    success: function (data) {
                        if (!$dialog && data && data.modal) {
                            data = data.modal;
                            isShow = true;
                            $dialog = $('<div id="dialog"><img src="/pic/' + data.backgroundImageUrl + '"></div>').css({
                                width: data.dimension.width + "px",
                                height: data.dimension.height + "px"
                            }).appendTo("body").show();
                            uuid = data.uuid;
                            $.vs.event(uuid + "_index", "10");
                            $.UTIL.each(data.buttons, function (value, index) {
                                $('<div id="' + value.key + '" class="dialogBtn"></div>').css({
                                    width: value.width,
                                    height: value.height,
                                    left: value.left,
                                    top: value.top,
                                    "-webkit-box-shadow": "0 0 0 4px " + value.borderColor,
                                    visibility: "hidden"
                                }).appendTo($dialog);
                                focusMap[value.key] = {
                                    left: value.relatedBtns.left,
                                    right: value.relatedBtns.right,
                                    up: value.relatedBtns.top,
                                    down: value.relatedBtns.bottom,
                                    url: value.url,
                                    type: value.type
                                };
                            });
                            $.pTool.active(key);
                            baseFocusTo(data.initFocusBtnIndex);
                        }
                    }
                });
            }
        },
        isShow: function () {
            return isShow;
        }
    };
}();