var G_PRELOAD_IMG = [
  "images/tipBox/buyFull.png",
  "images/tipBox/commit.png",
  "images/tipBox/fail.png",
  "images/tipBox/network.png",
  "images/tipBox/regret.png",
  "images/tipBox/runout.png",
  "images/tipBox/success.png",
  "images/tipBox/successCard.png",
  "images/tipBox/upper.png",
  "images/tipBox/nether.png",
  "images/tipBox/commit_cancel.png",
  "images/tipBox/commit_confirm.png",
  "images/tipBox/runout_cancel.png",
  "images/tipBox/runout_confirm.png",
  "images/tipBox/success_cancel.png",
  "images/tipBox/success_confirm.png",
  "images/tipBox/success_mycard.png",
  "images/tipBox/limit.png",
];
$$("body").load(function () {
  for (var i = 0; i < G_PRELOAD_IMG.length; i++) {
    new Image().src = G_PRELOAD_IMG[i];
  }
});

var ID,
  PHONE,
  BUY_FULL,
  ROLLING,
  RECODE_DATA_KEY = "turntable",
  PAGE_INFO = [],
  ACTIVE_OBJECT = null,
  PRODUCT = [],
  CHANCE = 0;

function load() {
  $.recodeData(RECODE_DATA_KEY, "access");
  var isError, authErr, chances = $$('<div class="chance"></div>').appendTo(), timeState = 0, a = "";
  // 走马灯
  new $$.Promise(function (resolve, reject) {
    $.s.guidance.get({
      id: GUIDENCE.marqueeId
    }, {
      success: function (res) {
        res && res[0] && (MARQUEE = res[0].contentUri), resolve();
      },
      error: function () {
        resolve();
      },
    });
  }).then(function () {
    return new $$.Promise(function (resolve, reject) {
      G_SERVICE.allRecords({ actvId: GUIDENCE.actvId }, function (res) {
        var defalutMarquee;
        if ("timeout" != res && 1 == res.code && res.data && res.data.length && res.data.length >= 10) {
          defalutMarquee = "";
          for (var partData = res.data.slice(0, 10), i = 0; i < partData.length; i++) {
            defalutMarquee += "恭喜" + partData[i].phone.replace(/(\d{3})\d{4}(\d{4})/, "$1XXXX$2") + "手机号用户获得" + partData[i].prize + "奖品; ";
          }
        }
        "~" != MARQUEE && (defalutMarquee = MARQUEE);
        defalutMarquee && $$('<div class="marquee"><marquee scrollamount="4">' + defalutMarquee + "</marquee></div>").appendTo();
      });
    });
  });
  TIP_TOOL.init();
  var pkgInfo, auth;
  var act = function () { // 点击抽奖时候，活动未开始弹窗
    var cl = "";
    return timeState < 0 && (cl = "upper"), timeState > 0 && (cl = "nether"), cl;
  };
  // var o = $.auth.getEpgBig();
  // var u = $.auth.getBigPhonePkg();
  // 套餐配置
  new $$.Promise(function (resolve, reject) { 
    $.s.guidance.get({
      id: GUIDENCE.packageId
    }, {
      success: function (res) {
        PACKAGE = [];
        PUS_COUNT = {};
        for (var i = 0; i < res.length; i++) {
          var arr = res[i].contentName.split("@");
          PACKAGE.push({ chargeName: arr[0], chargeId: arr[1] });
          PUS_COUNT[arr[1]] = true;
        }
        (pkgInfo = $$.deepCopy(PACKAGE)), (auth = $$.deepCopy(PUS_COUNT));
        // for (i = 0; i < pkgInfo.length; i++)
        //   if (pkgInfo[i].chargeId == o) {
        //     pkgInfo.push({ chargeId: u, chargeName: "沃视达尊享包(手机包)" }),
        //       (auth[u] = !0);
        //     break;
        //   }
        resolve();
      },
      error: function () {
        isError = true;
        resolve();
      },
    }
    );
  }).then(function () {
    // 右侧3个链接
    return new $$.Promise(function (resolve, reject) {
      LINK = [];
      $.s.guidance.get({
        id: GUIDENCE.linkId
      }, {
        success: function (res) {
          for (var i = 0; i < res.length; i++)
            LINK.push({
              url: res[i].contentUri,
              normal: $.getPic(res[i].pics, [0]),
              focus: $.getPic(res[i].pics, [1]),
            });
          resolve();
        },
        error: function () {
          resolve();
        },
      }
      );
    });
  }).then(function () {
    // 判断此次活动指定的套餐是否全部订购 BUY_FULL 接口报错则t=config.fake=true。都让抽不中
    return new $$.Promise(function (resolve, reject) {
      $.auth.auth4Pkg({
        package: $$.deepCopy(pkgInfo),
        callback: function (res) {
          if (res && "timeOut" !== res.code)
            $.UTIL.each(res, function (value, key) {
              if (value) {
                auth[key] && (auth[key] = false, PRODUCT.push(key));
              }
            });
          else for (var a in ((authErr = true), (isError = true), PUS_COUNT)) PRODUCT.push(a);
          PRODUCT.length == PACKAGE.length && (BUY_FULL = true), resolve();
        },
      });
    });
  }).then(function () {
    // 活动时间
    return new $$.Promise(function (resolve, reject) {
      $.s.guidance.get({
        id: GUIDENCE.intervalId
      }, {
        success: function (res) {
          res && res[0] && (INTERVAL = res[0].contentUri);
          var timeInterval = INTERVAL.split("-"),
            starTime = Date.getMsec(timeInterval[0]),
            endTime = Date.getMsec(timeInterval[1]),
            nowTime = new Date().getTime();
          // 定时器时间很长的话会立即执行，
          starTime - nowTime >= 0 && ((timeState = -1),
            setTimeout(function () {
              timeState = 0;
            }, (starTime - nowTime) > (24 * 60 * 60 * 1000) ? 24 * 60 * 60 * 1000 : (starTime - nowTime))); //(starTime - nowTime) | 0  超过10位数会解析成32位二进制数
          nowTime - endTime < 0 && nowTime - starTime > 0 && ((timeState = 0),
            setTimeout(function () {
              timeState = 1;
            }, (endTime - nowTime) > (24 * 60 * 60 * 1000) ? 24 * 60 * 60 * 1000 : (endTime - nowTime))); //(starTime - nowTime) | 0  超过10位数会解析成32位二进制数
          nowTime - endTime >= 0 && (timeState = 1);
          var starTimeFormat = new Date(starTime),
            endTimeFormat = new Date(endTime),
            timeInterval = starTimeFormat.format("yyyy.MM.dd hh:mm:ss") + "---" + endTimeFormat.format("yyyy.MM.dd hh:mm:ss");
          $$('<div class="interval">活动时间 : ' + timeInterval + "</div>").appendTo();
          a = starTimeFormat.format("yyyy.MM.dd") + "-" + endTimeFormat.format("yyyy.MM.dd");
          resolve();
        },
        error: function () {
          isError = true;
          resolve();
        },
      }
      );
    });
  }).then(function () {
    // 次数
    return new $$.Promise(function (resolve, reject) {
      G_SERVICE.getVote({
        actvId: GUIDENCE.actvId,
        product: PRODUCT.join(",")
      }, function (res) {
        "timeout" == res ? (isError = true) : (CHANCE = res.data || 0);
        resolve();
      }
      );
    });
  }).then(function () {
    // 奖品信息
    return new $$.Promise(function (resolve, reject) {
      $.s.guidance.get({
        id: GUIDENCE.prizeId
      }, {
        success: function (res) {
          8 == res.length ? (PRIZE = []) : (isError = true);
          var getFlag = '';
          for (var i = 0; i < res.length; i++) {
            getFlag = /\d{1}#/.test(res[i].contentUri);
            var picSrc_1, picSrc_2, itemPicArr = res[i].pics;
            if ((picSrc_1 = $.getPic(itemPicArr, [0]))) new Image().src = picSrc_1;
            if ((picSrc_2 = $.getPic(itemPicArr, [1]))) new Image().src = picSrc_2;
            PRIZE.push({
              flag: getFlag ? res[i].contentUri.split('#')[0] : res[i].contentUri,
              id: getFlag ? res[i].contentUri.split('#')[1] : '',
              name: res[i].contentName,
              prize: picSrc_1,
              pic: picSrc_2,
            });
          }
          resolve();
        },
        error: function () {
          isError = true;
          resolve();
        },
      }
      );
    });
  }).then(function () {
    // 左侧推荐位
    return new $$.Promise(function (resolve, reject) {
      $.s.guidance.get({
        id: GUIDENCE.suggestId
      }, {
        success: function (res) {
          res.length && (SUGGEST = []);
          for (var i = 0; i < res.length; i++) {
            var picsArr = res[i].pics;
            if (((res[i].pic = $.getPic(picsArr, [101])), res[i].pic))
              new Image().src = res[i].pic;
            SUGGEST.push(res[i]);
          }
          resolve();
        },
        error: function () {
          isError = true;
          resolve();
        },
      }
      );
    });
  }).then(function () {
    if ((chances.html(CHANCE), isError)) return TIP_TOOL.network();
    LOTTORY.init({
      radius: 248,
      clockwise: true,
      total: 8,
      prize: PRIZE,
      fake: authErr,
    });
    var linkInfo = function (e) {
      if (!ROLLING)
        for (var i = 0; i < 3; i++)
          i == e
            ? ($$("#link" + i).css({
              background: "url(" + LINK[i].focus + ") no-repeat",
              backgroundSize: "100% 100%"
            }), $.focusTo("link" + i))
            : $$("#link" + i).css({
              background: "url(" + LINK[i].normal + ") no-repeat",
              backgroundSize: "100% 100%"
            });
    };
    var sugInfo = function (e) {
      ROLLING || ($$(".suggest").removeClass("focusBorder").eq(e).addClass("focusBorder"), $.focusTo("suggest" + e));
    };
    var pointF = function () {
      linkInfo(-1), $.focusTo("pointer");
    };
    var toPage = function (e) {
      if ("~" != LINK[e].url) {
        saveInfo("link-" + e);
        var t = $$.search.set(
          {
            prizeId: GUIDENCE.prizeId,
            suggestId: GUIDENCE.suggestId,
            marqueeId: GUIDENCE.marqueeId,
            intervalId: GUIDENCE.intervalId,
            packageId: GUIDENCE.packageId,
            actvId: GUIDENCE.actvId,
            linkId: GUIDENCE.linkId,
            bgId: GUIDENCE.bgId,
          },
          "{{pathPage}}/" + LINK[e].url
        );
        $.gotoDetail(t);
      }
    };
    var saveInfo = function (e) {
      $.saveGlobalData(RECODE_DATA_KEY + "_focus", e);
    };
    PAGE_INFO.push({
      key: "pointer",
      pressLeft: function () {
        SUGGEST && SUGGEST.length && sugInfo(0);
      },
      pressRight: function () {
        linkInfo(0);
      },
      pressOk: function () {
        var e = act();
        if (e) return TIP_TOOL.timeout(e, a);
        ROLLING || ($.recodeData("点击抽奖", "access"), CHANCE ? ((ROLLING = true), chances.html(--CHANCE), LOTTORY.roll()) : BUY_FULL ? TIP_TOOL.buyFull() : TIP_TOOL.runout());
      },
    });
    $$('<div id="link0" class="link"></div>').appendTo();
    $$('<div id="link1" class="link"></div>').appendTo();
    $$('<div id="link2" class="link"></div>').appendTo();
    PAGE_INFO.push({
      key: "link0",
      pressLeft: pointF,
      pressDown: function () {
        linkInfo(1);
      },
      pressOk: function () {
        "nether" != act() && toPage(0);
      },
    });
    PAGE_INFO.push({
      key: "link1",
      pressUp: function () {
        linkInfo(0);
      },
      pressLeft: pointF,
      pressDown: function () {
        linkInfo(2);
      },
      pressOk: function () {
        toPage(1);
      },
    });
    PAGE_INFO.push({
      key: "link2",
      pressUp: function () {
        linkInfo(1);
      },
      pressLeft: pointF,
      pressOk: function () {
        toPage(2);
      },
    });
    linkInfo(-1);
    if (SUGGEST && SUGGEST.length) {
      for (var d = 0; d < SUGGEST.length; d++) {
        $$('<div id="suggest' + d + '" class="suggest"><img src="' + SUGGEST[d].pic + '"></div>').appendTo();
        (function (e) {
          PAGE_INFO.push({
            key: "suggest" + e,
            pressRight: pointF,
            pressUp: function () {
              var t = e - 1;
              SUGGEST[t] && sugInfo(t);
            },
            pressDown: function () {
              var t = e + 1;
              SUGGEST[t] && sugInfo(t);
            },
            pressOk: function () {
              saveInfo("suggest-" + e), $.gotoDetail(SUGGEST[e]);
            },
          });
        })(d);
      }
    }
    if ($.isBack()) {
      var focus = $.getGlobalData(RECODE_DATA_KEY + "_focus");
      "string" == typeof focus && "undefined" != focus && "null" != focus
        ? ("link" == (focus = focus.split("-"))[0] && linkInfo(focus[1]), "suggest" == focus[0] && sugInfo(focus[1]))
        : $.focusTo("pointer");
    } else $.focusTo("pointer");
    $.saveGlobalData(RECODE_DATA_KEY + "_focus", void 0);
  });
}

$$("body").ready(function () {
  $.s.guidance.get({
    id: GUIDENCE.bgId
  }, {
    success: function (res) {
      for (var i = 0; i < res.length; i++)
        if ("turntable" == res[i].contentName) {
          var preImg = new Image();
          preImg.src = $.getPic(res[i].pics, [0]);
          $$("body").css("background", "url(" + preImg.src + ") no-repeat");
        }
    },
    error: function () { },
  });
});

(function () {
  var box_, panel_, lamp_, config, renderPart, renderLamp, addClass, getFake, bingo;
  window.LOTTORY =
    ((config = {
      unitDeg: 0,
      currentDeg: 0,
      current: 0,
      radius: 0,
      total: 0,
      lampTotal: 95,
      lampSpeed: 20,
      lampDeg: 20,
      clockwise: false,
      prize: {},
      fake: false,
    }),
      (renderPart = function () {
        for (
          var partHeight = (2 * config.radius * Math.sin((config.unitDeg * Math.PI) / 360)) | 0,
          partWidth = 0 | Math.sqrt(Math.pow(config.radius, 2) - Math.pow(partHeight / 2, 2)),
          partLeft = config.radius,
          partTop = (config.radius - partHeight / 2) | 0,
          i = 0; i < config.total; i++
        ) {
          var position = config.clockwise ? -i * config.unitDeg - 90 : i * config.unitDeg - 90;
          var picSrc = config.prize[i].pic;
          $$('<div class="part" index="' + i + '"></div>').css({
            top: partTop + "px",
            left: partLeft + "px",
            width: partWidth + "px",
            height: partHeight + "px",
            webkitTransform: "rotate(" + position + "deg)",
            zIndex: 2,
          }).appendTo(panel_).append(
            $$('<div class="img"></div>').css({
              top: ((partHeight / 4) | 0) + "px",
              left: ((partWidth / 3) | 0) + "px",
              width: ((partHeight / 2) | 0) + "px",
              height: ((partHeight / 2) | 0) + "px",
              webkitTransform: "rotate(90deg)",
              background: "url(" + picSrc + ") no-repeat",
              backgroundSize: "100%",
            })
          );
        }
      }),
      (renderLamp = function () {
        for (
          var lampRadius = config.radius - ((0.85 * config.border) | 0),
          lampNums = 360 / config.lampDeg,
          n = 0; n < lampNums; n++
        ) {
          var lampItemLeft = (config.radius + lampRadius * Math.cos(((n * config.lampDeg + config.lampDeg / 2) * Math.PI) / 180)) | 0,
            lampItemTop = (config.radius + lampRadius * Math.sin(((n * config.lampDeg + config.lampDeg / 2) * Math.PI) / 180)) | 0;
          $$('<div class="' + (n % 2 == 0 ? "even" : "odd") + '"></div>')
            .css({
              left: lampItemLeft - config.border / 2 + "px",
              top: lampItemTop - config.border / 2 + "px",
              width: config.border + "px",
              height: config.border + "px",
            }).appendTo(lamp_);
        }
      }),
      (addClass = function () {
        var odd_ = $$(".odd"),
          even_ = $$(".even");
        odd_.attr("class", "even"), even_.attr("class", "odd");
      }),
      (getFake = function (data) {
        for (var fake_, i = 0; i < config.prize.length; i++)
          if (0 == config.prize[i].flag) {
            fake_ = i;
            break;
          }
        for (var i = 0; i < config.prize.length; i++)
          if (data.name == config.prize[i].name) {
            fake_ = i;
            break;
          }
        return fake_;
      }),
      (bingo = function () {
        $('.part[index="' + config.current + '"]').addClass("bingo");
      }),
    {
      init: function (obj) {
        (config.radius = obj.radius),
          (config.prize = obj.prize),
          (config.unitDeg = 360 / (config.total = obj.total)),
          (config.border = (config.radius / 10) | 0),
          (config.clockwise = obj.clockwise),
          (config.fake = obj.fake || false),
          (box_ = $$('<div class="box"></div>')
            .css({ height: 2 * config.radius + "px", width: 2 * config.radius + "px" })
            .appendTo()),
          (panel_ = $$('<div class="panel"></div>')
            .css({ height: 2 * config.radius + "px", width: 2 * config.radius + "px" })
            .appendTo(box_)),
          $$('<div class="shadow"></div>')
            .css({ height: 2 * config.radius + "px", width: 2 * config.radius + "px" })
            .appendTo(box_),
          (lamp_ = $$('<div class="lamp"></div>')
            .css({ height: 2 * config.radius + "px", width: 2 * config.radius + "px" })
            .appendTo(box_)),
          $$('<div id="pointer"><div class="word"></div></div>').appendTo(box_),
          renderPart(),
          renderLamp(),
          addClass();
      },
      roll: function (e) {
        var getIndex;
        var cardAgain = false;
        config.lampTotal = 95;
        (function () {
          config.lampTotal <= 0 ||
            (
              config.lampTotal-- ,
              config.lampSpeed = 100,
              config.lampTotal > 50 && (config.lampSpeed = 200),
              config.lampTotal < 10 && (config.lampSpeed = 300),
              addClass(),
              setTimeout(arguments.callee, config.lampSpeed)
            );
        })();
        (function () {
          config.currentDeg += 720; // 1080 原来转的太久，改小一点儿
          var deg = config.clockwise ? config.currentDeg : -config.currentDeg;
          panel_.addClass("buffer").css("webkitTransform", "rotate(" + deg + "deg)");
        })();
        if (config.fake) {
          getIndex = getFake({ name: "谢谢参与" })
        } else {
          ID = "", PHONE = "";
          G_SERVICE.lottory({
            actvId: GUIDENCE.actvId,
            product: PRODUCT.join(",")
          }, function (e) {
            console.log(JSON.stringify(e));
            
            if ("timeout" != e) {
              0 == e.code && (e.data = { name: "谢谢参与" });
              ID = e.data && e.data.id;
              PHONE = e.data && e.data.phone || '';
              getIndex = getFake(e.data)
              // 是否是优惠券
              var isCard = config.prize[getIndex].flag === '3' ? true : false;
              if (isCard) {
                var id = config.prize[getIndex].id;
                G_SERVICE.checkHaveCard({
                  id: id
                }, function (res) {
                  res && res.respCode === -1 && (cardAgain = true)
                });
              }
            } else {
              getIndex = getFake({ name: "谢谢参与" })
            }
          });
        }
        setTimeout(function () {
          !(function (e) {
            var t = (e - config.current) * config.unitDeg;
            config.currentDeg += t + (t < 0 ? 1440 : 1080); // 2520  2160
            config.current = e;
            var n = config.clockwise ? config.currentDeg : -config.currentDeg;
            panel_.removeClass("buffer").css(
              "webkitTransform", "rotate(" + n + "deg)"
            );
          })(getIndex);
          setTimeout(function () {
            config.lampTotal = 0;
            +config.prize[config.current].flag
              ? (bingo(),
                setTimeout(function () {
                  ROLLING = false;
                  cardAgain
                    ? TIP_TOOL.cardAgained()
                    : TIP_TOOL.commit({
                      prize: config.prize[config.current].prize,
                      name: config.prize[config.current].name,
                      pic: config.prize[config.current].pic,
                      flag: config.prize[config.current].flag,
                      id: config.prize[config.current].id
                    });
                  $.recodeData("中奖", "access");
                }, 1e3))
              : ((ROLLING = false),
                CHANCE <= 0
                  ? BUY_FULL
                    ? TIP_TOOL.buyFull()
                    : TIP_TOOL.runout()
                  : ($.recodeData("未中奖", "access"),
                    TIP_TOOL.regret()));
          }, 5500); // 10500
        }, 3e3); // 6e3
      },
      bingoHide: function () {
        $('.part[index="' + config.current + '"]').removeClass("bingo");
      },
    });
})();

(window.TIP_TOOL = (function () {
  var e, t, n, i, a, r;
  (a = function () {
    return n.find(".focus").exist() && n.find(".focus").attr("activeNum");
  }),
    (r = function (e) {
      TIP_TOOL.input(e);
    }),
    $.keyTool.setDftRes({
      KEY_0: function () {
        if (a()) return r(0), !0;
      },
      KEY_1: function () {
        if (a()) return r(1), !0;
      },
      KEY_2: function () {
        if (a()) return r(2), !0;
      },
      KEY_3: function () {
        if (a()) return r(3), !0;
      },
      KEY_4: function () {
        if (a()) return r(4), !0;
      },
      KEY_5: function () {
        if (a()) return r(5), !0;
      },
      KEY_6: function () {
        if (a()) return r(6), !0;
      },
      KEY_7: function () {
        if (a()) return r(7), !0;
      },
      KEY_8: function () {
        if (a()) return r(8), !0;
      },
      KEY_9: function () {
        if (a()) return r(9), !0;
      },
      KEY_RETURN: function () {
        if (ACTIVE_OBJECT.pressReturn) return ACTIVE_OBJECT.pressReturn(), !0;
      },
    });
  var c = function () {
    var e = n.find(".input"),
      t = e.html();
    if (!t) return m();
    e.html((PHONE = t.slice(0, Math.max(t.length - 1, 0))));
  },
    s = function (e) {
      n.find(".focus").removeClass("focus"),
        n.find("." + e).addClass("focus");
    },
    up = function () {
      switch (t) {
        case "commit":
          if (e) return;
          s("input");
      }
    },
    right = function () {
      switch (t) {
        case "runout":
        case "success":
        case "success_card":
        case "cardAgained":
          s("cancel");
          break;
        case "commit":
          if (e) return;
          if (n.find(".focus").attr("activeNum")) return;
          s("cancel");
      }
    },
    down = function () {
      switch (t) {
        case "commit":
          s("confirm");
      }
    },
    left = function () {
      switch (t) {
        case "runout":
        case "success":
        case "success_card":
        case "cardAgained":
          s("confirm");
          break;
        case "commit":
          if (e) return;
          if (n.find(".focus").attr("activeNum")) return;
          s("confirm");
      }
    },
    ok = function () {
      var i = n.find(".focus").exist() && n.find(".focus").attr("flag");
      switch (t) {
        case "upper":
          $.back();
          break;
        case "nether":
        case "regret":
        case "buyFull":
          m();
          break;
        case "fail":
          m(), receive();
          break;
        case "commit":
          if (e) return;
          if ("confirm" == i) {
            var getPhone = $$.check.phone(PHONE);
            getPhone ? ((e = true),
              G_SERVICE.commit({ actvId: GUIDENCE.actvId, id: ID, phone: PHONE }, function (res) {
                "timeout" != res && 1 == res.code
                  ? ($.recodeData("手机号录入成功", "access"),
                    TIP_TOOL.success())
                  : TIP_TOOL.fail(),
                  (e = false);
              })
            )
              : (n.find(".tip").css("display", "block"),
                $$.debounce(function () {
                  n.find(".tip").exist() &&
                    n.find(".tip").css("display", "none");
                }, 3e3, "tip_show")
              );
          }
          "cancel" == i && m();
          break;
        case "runout":
          if ("confirm" == i) {
            var r = $$.search.set(
              {
                prizeId: GUIDENCE.prizeId,
                suggestId: GUIDENCE.suggestId,
                marqueeId: GUIDENCE.marqueeId,
                intervalId: GUIDENCE.intervalId,
                packageId: GUIDENCE.packageId,
                actvId: GUIDENCE.actvId,
                linkId: GUIDENCE.linkId,
                bgId: GUIDENCE.bgId,
              },
              "{{pathPage}}/lottory/package/"
            );
            $.gotoDetail(r);
          }
          "cancel" == i && m();
          break;
        case "success":
        case "cardAgained":
          if ("confirm" == i) {
            var r = $$.search.set(
              {
                prizeId: GUIDENCE.prizeId,
                suggestId: GUIDENCE.suggestId,
                marqueeId: GUIDENCE.marqueeId,
                intervalId: GUIDENCE.intervalId,
                packageId: GUIDENCE.packageId,
                actvId: GUIDENCE.actvId,
                linkId: GUIDENCE.linkId,
                bgId: GUIDENCE.bgId,
              },
              "{{pathPage}}/lottory/prizeList/"
            );
            $.gotoDetail(r);
          }
          "cancel" == i && m();
          break;
        case "success_card":
          if ("confirm" == i) {
            $.gotoDetail($.urls.couponNouse);
          }
          "cancel" == i && m();
          break;
        case "network":
          $.back();
      }
    },
    back = function () {
      switch (t) {
        case "upper":
        case "nether":
        case "success":
        case "success_card":
        case "buyFull":
        case "regret":
        case "runout":
        case "cardAgained":
          m();
          break;
        case "fail":
          m(), receive();
          break;
        case "commit":
          if (e) return;
          n.find(".focus").attr("activeNum") ? c() : m();
          break;
        case "network":
          $.back();
      }
      return !0;
    },
    g = function (e) {
      (t = e),
        n.html("").attr("class", ""),
        n.css("display", "block"),
        $.focusTo("tipBox");
    },
    m = function () {
      (t = ""),
        n.css("display", "none"),
        LOTTORY.bingoHide(),
        $.focusTo("pointer");
    },
    // 领奖弹窗
    receive = function (obj) {
      obj ? (i = obj) : (obj = i);
      g("commit");
      n.addClass("commit").html(
        '<img src="' + obj.prize + '"><div class="name">' + obj.name +
        '</div><div class="input" activeNum="1" flag="input">' + PHONE +
        '</div><div class="confirm" flag="confirm"></div><div class="cancel" flag="cancel"></div><div class="tip"></div>'
      );
      s(PHONE ? "confirm" : "input");
    };
  return {
    init: function () {
      (n = $$('<div id="tipBox"></div>').appendTo()),
        PAGE_INFO.push({
          key: "tipBox",
          pressUp: up,
          pressRight: right,
          pressDown: down,
          pressLeft: left,
          pressOk: ok,
          pressReturn: back,
        });
    },
    input: function (e) {
      var t = n.find(".input"),
        i = t.html();
      t.html((PHONE = (i + e).slice(0, 11)));
    },
    reduce: c,
    timeout: function (e, t) {
      g(e);
      n.addClass(e).html('<div class="interval">活动时间 : ' + t + "</div>");
    },
    success: function () {
      var getFlag = i ? i.flag : '1'; //1实物,2 3虚拟
      var cls = '';
      if (getFlag === '1') {
        cls = 'success'
      } else if (getFlag === '2') { // 2 礼券
        cls = 'success_card'
        G_SERVICE.getCardLq(
          { id: i.id }, function (res) { }
        )
      } else { // 3 优惠券
        cls = 'success_card'
        G_SERVICE.getCard(
          { id: i.id }, function (res) { }
        )
      }
      g(cls);
      n.addClass(cls).html(
        '<div class="confirm" flag="confirm"></div><div class="cancel" flag="cancel"></div>'
      );
      s("confirm");
    },
    fail: function () {
      g("fail"), n.addClass("fail");
    },
    buyFull: function () {
      g("buyFull"), n.addClass("buyFull");
    },
    regret: function () {
      g("regret"), n.addClass("regret");
    },
    commit: receive,
    cardAgained: function () {
      g("cardAgained");
      n.addClass('cardAgained').html(
        '<div class="confirm" flag="confirm"></div><div class="cancel" flag="cancel"></div>'
      );
      s("confirm");

    },
    runout: function () {
      g("runout");
      n.addClass("runout").html(
        '<div class="confirm" flag="confirm"></div><div class="cancel" flag="cancel"></div>'
      );
      s("confirm");
    },
    network: function () {
      g("network"), n.addClass("network");
    },
  };
})());
