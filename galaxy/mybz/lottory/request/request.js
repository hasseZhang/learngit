window.G_SERVICE = function (t, o) {
  var c = "globalLottoryCallback_",
    e = $.getVariable("EPG:userId"),
    n = 0;
  var cardUrl = $.getVariable('EPG:isTest') ? 'http://10.128.7.100:9088/' : 'http://10.128.7.5:5666/'
  var cardServerUrl = $.getVariable('EPG:isTest') ? 'http://10.128.7.100:8087/' : 'http://10.128.7.5:8087/'
  return {
    //判断优惠券是否领取过
    checkHaveCard: function (obj, cb) {
      var url = cardUrl + 'api/1.0/discountCoupon/check/' + e + '/' + obj.id;
      $.get(url, {
        success: function (res) {
          "function" == typeof cb && cb(JSON.parse(res))
        },
        error: function (res) {
          "function" == typeof cb && cb("timeout")
        }
      })
    },
    // 礼券
    getCardLq: function (obj, cb) {
      var url = cardServerUrl + 'cardApi2/receiveCard';
      var data_ = {
        'CARDSET': obj.id,
        'CUSTOMERID': e
      }
      $.post(url, {
        data: JSON.stringify(data_),
        success: function (res) {
          "function" == typeof cb && cb(res)
        },
        error: function (res) {
          "function" == typeof cb && cb("timeout")
        }
      })
    },
    // 优惠券
    getCard: function (obj, cb) {
      var url = cardUrl + "api/1.0/discountCoupon/get/" + e + "/" + obj.id;
      $.get(url, {
        success: function (res) {
          console.log(res);
          "function" == typeof cb && cb(res)
        },
        error: function (res) {
          console.log(res);
          "function" == typeof cb && cb("timeout")
        }
      })
    },
    lottory: function (r, a) {
      new $$.Promise(function (t, c) {
        $$.loader({
          cbName: "voteCallback",
          url: o + "vote/do?activityId=" + r.actvId + "&productInfo=" + r.product + "&stbId=" + e + "&categoryId=1&vodId=1&vodName=1&categoryName=1&callback=voteCallback",
          success: function (o) {
            t("timeout" != o)
          },
          error: function () {
            t()
          }
        })
      }).then(function (o) {
        if (!o) return "function" == typeof a && a("timeout");
        var u = c + n++;
        $$.loader({
          cbName: u,
          url: t + "v1/" + r.actvId + "/lottery?userId=" + e + "&tags.a=1&tags.b=2&callback=" + u,
          success: function (t) {
            "function" == typeof a && a(t)
          },
          error: function () {
            "function" == typeof a && a("timeout")
          }
        })
      })
    },
    commit: function (o, r) {
      var a = c + n++;
      $$.loader({
        cbName: a,
        url: t + "v1/" + o.actvId + "/commit/" + o.id + "?userId=" + e + "&phone=" + o.phone + "&tags.a=1&tags.b=2&callback=" + a,
        success: function (t) {
          "function" == typeof r && r(t)
        },
        error: function () {
          "function" == typeof r && r("timeout")
        }
      })
    },
    records: function (o, r) {
      var a = c + n++;
      $$.loader({
        cbName: a,
        url: t + "v1/" + o.actvId + "/records?userId=" + e + "&pageSize=9999&callback=" + a,
        success: function (t) {
          "function" == typeof r && r(t)
        },
        error: function () {
          "function" == typeof r && r("timeout")
        }
      })
    },
    allRecords: function (o, e) {
      var r = c + n++;
      $$.loader({
        cbName: r,
        url: t + "v1/" + o.actvId + "/records?callback=" + r,
        success: function (t) {
          "function" == typeof e && e(t)
        },
        error: function () {
          "function" == typeof e && e("timeout")
        }
      })
    },
    getVote: function (t, r) {
      var a = c + n++;
      $$.loader({
        cbName: a,
        url: o + "vote/rest?activityId=" + t.actvId + "&stbId=" + e + "&productInfo=" + t.product + "&voteDate=" + (new Date).format("yyyyMMdd") + "&callback=" + a,
        success: function (t) {
          "function" == typeof r && r(t)
        },
        error: function () {
          "function" == typeof r && r("timeout")
        }
      })
    },
    prize: function (o, e) {
      var r = c + n++;
      $$.loader({
        cbName: r,
        url: t + "v1/" + o.actvId + "/prize?callback=" + r,
        success: function (t) {
          "function" == typeof e && e(t)
        },
        error: function () {
          "function" == typeof e && e("timeout")
        }
      })
    }
  }
}("http://10.128.4.84:20002/", "http://10.128.4.84:20001/");