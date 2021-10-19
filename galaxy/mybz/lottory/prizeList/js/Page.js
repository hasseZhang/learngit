var RECODE_DATA_KEY = "prizeList",
  PAGE_INFO = [],
  ACTIVE_OBJECT = null;
function load() {
  $.recodeData(RECODE_DATA_KEY, "access"),
    G_SERVICE.records({
      actvId: $$.search.get("actvId")
    }, function (res) {
      if ("timeout" != res && 1 == res.code && res.data && res.data.length) {
        $$('<div class="listBg"></div>').appendTo(),
          $$('<div class="cover"></div>').appendTo();
        var e = res.data;
        LIST_TOOL.init({
          size: 7,
          data: e,
          total: e.length
        })
        if (e.length <= 7) return;
        SCROLL_TOOL.init({
          unit: 7,
          now: 0,
          total: e.length
        })
      } else $$('<div class="noData"></div>').appendTo(),
        $$('<div id="confirm"></div>').appendTo(),
        $$('<div id="cancel"></div>').appendTo(),
        PAGE_INFO.push({
          key: "confirm",
          pressOk: function () {
            var t = $$.search.set({
              prizeId: $$.search.get("prizeId"),
              suggestId: $$.search.get("suggestId"),
              marqueeId: $$.search.get("marqueeId"),
              intervalId: $$.search.get("intervalId"),
              packageId: $$.search.get("packageId"),
              actvId: $$.search.get("actvId"),
              linkId: $$.search.get("linkId"),
              bgId: $$.search.get("bgId")
            },
              "{{pathPage}}/lottory/package/");
            $.gotoDetail(t, !0)
          },
          pressRight: "cancel"
        }),
        PAGE_INFO.push({
          key: "cancel",
          pressOk: function () {
            $.back()
          },
          pressLeft: "confirm"
        }),
        $.focusTo("confirm")
    })
}
$$("body").ready(function () {
  $.s.guidance.get({
    id: $$.search.get("bgId")
  },
    {
      success: function (t) {
        for (var e = 0; e < t.length; e++) if ("prizeList" == t[e].contentName) {
          var s = new Image;
          s.src = $.getPic(t[e].pics, [0]),
            $$("body").css("background", "url(" + s.src + ") no-repeat")
        }
      },
      error: function () { }
    })
});
(function (t, e) {
  var s, i, a, up, down, pageUp, pageDown, d, l, p, ok;
  window.LIST_TOOL = (a = {
    size: 0,
    total: 0,
    first: 0,
    cursor: 0,
    gap: 0
  },
    ok = function () {
      var isok = i.find(".focus").exist() && i.find(".focus").find(".msg").length;
      console.log(i.find(".focus").find('.msg'));
      
      isok && $.gotoDetail($.urls.couponNouse);
    },
    up = function () {
      $$.throttle(function () {
        if (0 == a.cursor) {
          if (!(a.first > 0)) return $.focusTo("btn"),
            void d();
          a.first--
        } else a.cursor = Math.max(a.cursor - 1, 0);
        p()
      },
        300, "LIST_TOOL_MOVE")
    },
    down = function () {
      $$.throttle(function () {
        if (a.cursor == a.size - 1) {
          var t = a.first + a.cursor + 1,
            e = i.find("[index=" + t + "]");
          e.exist() && a.first++
        } else a.cursor = Math.min(a.cursor + 1, a.total - 1);
        p()
      },
        300, "LIST_TOOL_MOVE")
    },
    pageUp = function () {
      a.total <= a.size || (a.first = Math.max(0, a.first - a.size), p())
    },
    pageDown = function () {
      a.total <= a.size || (a.first = Math.min(a.total - a.size, a.first + a.size), p())
    },
    d = function () {
      var t = i.find(".focus");
      t.exist() && t.removeClass("focus")
    },
    l = function () {
      d(),
        i.find("[index=" + (a.first + a.cursor) + "]").addClass("focus")
    },
    p = function () {
      i.css("top", -a.gap * a.first + "px"),
        SCROLL_TOOL.proxy.pub("move", !1, a.first),
        l()
    },
  {
    init: function (t) {
      s = t.data,
        a.size = t.size,
        a.total = t.total,
        i = $$('<div class="inner"></div>').appendTo($$('<div id="list"></div>').appendTo()),
        $$('<div id="btn"></div>').appendTo(),
        PAGE_INFO.push({
          key: "list",
          pressOk: ok,
          pressUp: up,
          pressDown: down,
          pressPageUp: pageUp,
          pressPageDown: pageDown
        }),
        PAGE_INFO.push({
          key: "btn",
          pressOk: function () {
            var t = $.getBackUrl();
            /lottory\/turntable\//.test(t) && $.getBackUrl(!0);
            var e = $$.search.set({
              prizeId: $$.search.get("prizeId"),
              suggestId: $$.search.get("suggestId"),
              marqueeId: $$.search.get("marqueeId"),
              intervalId: $$.search.get("intervalId"),
              packageId: $$.search.get("packageId"),
              actvId: $$.search.get("actvId"),
              linkId: $$.search.get("linkId"),
              bgId: $$.search.get("bgId")
            },
              "{{pathPage}}/lottory/turntable/");
            $.gotoDetail(e, !0)
          },
          pressDown: function () {
            $.focusTo("list"),
              l()
          }
        });
      for (var e = [], d = 0; d < a.total; d++) {
        var p = s[d].commitTime.split(" ")[0].replace(/-/g, "/");
        var msg = /优惠|卡密|礼券/.test(s[d].prize) ? "<div class='msg'>点击查看详情</div>" : '';
        e.push('<div class="el" index="' + d + '"><div class="date">' + p + '</div><div class="prize">' + s[d].prize + "</div>"+msg+"</div>")
      }
      i.html(e.join(""));
      var u = i.find(".el").first();
      a.gap = u.offset("height");
      var f = (i.offset("width") - u.offset("width")) / 2 | 0;
      $$("#list .inner .el").each(function () {
        $$(this).css({
          left: f + "px",
          top: $$(this).offset("top") + "px"
        })
      }),
        $$("#list .inner .el").each(function () {
          $$(this).css({
            position: "absolute"
          })
        }),
        $.focusTo("list"),
        l()
    }
  })
})();
(function (t, e) {
  var s, i, a, o;
  window.SCROLL_TOOL = (a = {
    now: 0,
    unit: 0,
    total: 0
  }, {
    init: function (t) {
      i = $$('<div class="cursor"></div>').appendTo(s = $$('<div class="scroll"></div>').appendTo()),
        a.now = t.now,
        a.unit = t.unit,
        a.total = t.total;
      var e = +s.offset("height");
      i.css({
        height: (a.unit / a.total * e | 0) + "px",
        top: (a.now / a.total * e | 0) + "px"
      }),
        o.out("move"),
        o.sub("move",
          function (t) {
            i && i.exist() && (a.now = t, i.css({
              top: (a.now / a.total * e | 0) + "px"
            }))
          })
    },
    proxy: o = new $$.proxy
  })
})();