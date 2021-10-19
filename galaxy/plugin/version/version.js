(function (factory) {
    $.pTool.add("version", factory());
})(function () {
    var config = {};
    var $version = null;
    var $young = null;
    var $old = null;
    var $children = null;
    var activeKey = "";
    var leaveVersion;
    var isActive = false;
    var isShow = false;
    var preActive = "";
    function createEl() {
        if ($version) {
            return;
        }
        $version = $('<div id="version" class="versionChange hide"></div>');
        $young = $('<div id="young" class="young"><div class="pic"><img src="" alt=""></div><div class="text">标准版</div></div>').appendTo($version);
        $old = $('<div id="old" class="old"><div class="pic"><img src=""  alt=""></div><div class="text">老年版</div></div>').appendTo($version);
        $children = $('<div id="children" class="children"><div class="pic"><img src=""  alt=""></div><div class="text">少儿版</div></div>').appendTo($version);
        $version.appendTo(config.wrap);
        renderImg()
    }
    // 获取图片内容填充
    function renderImg() {
        $.s.guidance.get({
            id: $.getVariable('EPG:isTest') ? '1100006022' : '1100006188',
        }, {
            success: function (res) {
                var versionChangeDat = res && res.length ? res : '';
                var imgEle = $('#version').find('img')
                versionChangeDat[0].pics.forEach((item, index) => {
                    if (item.picType === '62') {
                        imgEle.item(1).attr("src", `/pic/${item.picPath}`)
                    } else if (item.picType === '78') {
                        imgEle.item(0).attr("src", `/pic/${item.picPath}`)
                    } else if (item.picType === '63') {
                        imgEle.item(2).attr("src", `/pic/${item.picPath}`)
                    }
                })
            }
        });
    }
    return {
        key: "version",
        dft: false,
        silenceKeys: [],
        show: function () {
            isShow = true;
            $version.removeClass("hide");
        },
        hide: function () {
            isShow = false;
            $version.addClass("hide");
        },
        init: function (opt) {
            var version = top.$.linnEdition;
            var key = "young";
            version === "standardEdition" && (key = "young");
            version === "simplifiedEdition" && (key = "old");
            version === "childrenEdition" && (key = "children");
            activeKey = key;
            opt && opt.leaveVersion && (leaveVersion = opt.leaveVersion);
            opt && opt.isShow && (isShow = opt.isShow);
            opt && opt.wrap && (config.wrap = $(opt.wrap)) || (config.wrap = $("body"));
            createEl();
        },
        active: function () {
            this.show();
            isActive = true;
            $.focusTo({
                el: "#version ." + activeKey
            });
        },
        deactive: function () {
            isActive = false;
            $version.addClass("hide");
        },
        cover: function () {
            return true;
        },
        uncover: function () {
            activeKey = preActive;
            return true;
        },
        keysMap: {
            KEY_LEFT: function () {
                if (activeKey === "children") {
                    activeKey = "old";
                    $.focusTo({
                        el: "#version .old"
                    });
                } else if (activeKey === "old") {
                    activeKey = "young";
                    $.focusTo({
                        el: "#version .young"
                    });
                }
                return true;
            },
            KEY_RIGHT: function () {
                if (activeKey === "young") {
                    activeKey = "old";
                    $.focusTo({
                        el: "#version .old"
                    });
                } else if (activeKey === "old") {
                    activeKey = "children";
                    $.focusTo({
                        el: "#version .children"
                    });
                }
                return true;
            },
            KEY_DOWN: function () {
                return true;
            },
            KEY_OK: function () {
                var version = top.$.linnEdition;
                if (activeKey === "young" && version !== "standardEdition") {
                    $.recodeData("进入标准版(3.0+)", "access");
                    $.putEdition('standardEdition')
                }
                if (activeKey === "old" && version !== "simplifiedEdition") {
                    $.recodeData("进入老年版(3.0+)", "access");
                    $.putEdition('simplifiedEdition')
                }
                if (activeKey === "children" && version !== "childrenEdition") {
                    $.recodeData("进入少儿版(3.0+)", "access");
                    $.putEdition('childrenEdition')
                }
                return true;
            },
            KEY_RETURN: function () {
                if (leaveVersion) {
                    leaveVersion()
                } else {
                    $.pTool.deactive('version')
                }
                return true
            }
        }
    };
});