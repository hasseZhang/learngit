var RECODE_DATA_KEY = "rules",
PAGE_INFO = [],
ACTIVE_OBJECT = null;
function load() {
    $.recodeData(RECODE_DATA_KEY, "access"),
    $$('<div id="confirm"></div>').appendTo(),
    PAGE_INFO.push({
        key: "confirm",
        pressOk: function() {
            $.back()
        }
    }),
    $.focusTo("confirm")
}
$$("body").ready(function() {
    $.s.guidance.get({
        id: $$.search.get("bgId")
    },
    {
        success: function(c) {
            for (var e = 0; e < c.length; e++) if ("rules" == c[e].contentName) {
                var n = new Image;
                n.src = $.getPic(c[e].pics, [0]),
                $$("body").css("background", "url(" + n.src + ") no-repeat")
            }
        },
        error: function() {}
    })
});