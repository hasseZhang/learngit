var PACKAGE = [],
  RECODE_DATA_KEY = "lottory_package",
  PAGE_INFO = [],
  ACTIVE_OBJECT = null,
  proxy = new $$.proxy;
function load() {
  $.recodeData(RECODE_DATA_KEY, "access");
  new $$.Promise(function (resolve, reject) {
    $.s.guidance.get({
      id: $$.search.get("packageId")
    }, {
      success: function (res) {
        for (var i = 0; i < res.length; i++) {
          var imgN, imgF, item = res[i],
            c = item.contentName.split("@"),
            r = res[i].pics;
          if (imgN = $.getPic(r, [0])) (new Image).src = imgN;
          if (imgF = $.getPic(r, [1])) (new Image).src = imgF;
          PACKAGE.push({
            chargeName: c[0],
            chargeId: c[1],
            url: item.contentUri,
            normal: imgN,
            focus: imgF,
            pass: false
          })
        }
        resolve()
      },
      error: function () {
        resolve()
      }
    })
  }).then(function () {
    return new $$.Promise(function (resolve, nreject) {
      var pkg = $$.deepCopy(PACKAGE)
      $.auth.auth4Pkg({
        package: pkg,
        callback: function (res) {
          if (res && "timeOut" !== res.code) {
            var data = res || {};
            $.UTIL.each(data, function (value1, key1) {
              $.UTIL.each(PACKAGE, function (value2, key2) {
                if (value1) {
                  var productId = key1;
                  value2.chargeId == productId && (value2.pass = true)
                }
              })
            })
          } else {
            for (var i = 0; i < PACKAGE.length; i++) PACKAGE[i].pass = true;
          }
          LIST_TOOL.init()
        }
      })
    })
  })
}
$$("body").ready(function () {
  $.s.guidance.get({
    id: $$.search.get("bgId")
  }, {
    success: function (res) {
      for (var i = 0; i < res.length; i++)
        if ("package" == res[i].contentName) {
          var img = new Image;
          img.src = $.getPic(res[i].pics, [0]),
            $$("body").css("background", "url(" + img.src + ") no-repeat")
        }
    },
    error: function () { }
  })
});

(window.LIST_TOOL = (function () {
  var a, info, right, left, ok, r;
  info = {
    index: 0,
    size: 0
  },
    right = function () {
      info.index + 1 >= info.size || (info.index++ , r())
    },
    left = function () {
      info.index <= 0 || (info.index-- , r())
    },
    ok = function () {
      var e = PACKAGE[info.index];
      $.saveGlobalData(RECODE_DATA_KEY + "info_index", info.index);
      e.pass ? $.gotoDetail({
        contentType: "7",
        url: e.url
      }) : $.auth.forwardOrder(0, 0, [e.chargeId])
    },
    r = function () {
      for (var e = 0; e < PACKAGE.length; e++) {
        var n = e == info.index,
          a = $$(".el[index=" + e + "]"),
          t = n ? PACKAGE[e].focus : PACKAGE[e].normal;
        a.css("background", "url(" + t + ") no-repeat"),
          n ? a.addClass("focus") : a.removeClass("focus")
      }
    };
  return {
    init: function () {
      info.size = PACKAGE.length,
        a = $$('<div id="list"></div>').appendTo();
      for (var e = [], n = 0; n < PACKAGE.length; n++) {
        var o = PACKAGE[n].pass ? " pass" : "";
        e.push('<div class="el' + o + '" index="' + n + '"></div>')
      }
      a.html(e.join(""));
      var g = $$("#list .el").first().offset("width"),
        u = a.offset("width") - g * PACKAGE.length,
        d = PACKAGE.length + 1,
        f = u / d | 0;
      $$("#list .el").each(function (e) {
        $$(this).css("left", (g + f) * e + f + "px")
      });
      PAGE_INFO.push({
        key: "list",
        pressRight: right,
        pressLeft: left,
        pressOk: ok
      });
      if ($.isBack()) {
        var focusIndex = $.getGlobalData(RECODE_DATA_KEY + 'info_index');
        info.index = focusIndex ? focusIndex : 0;
      }
      $.focusTo("list");
      r()
    }
  }
})())
