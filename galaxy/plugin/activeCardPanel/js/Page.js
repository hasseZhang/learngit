(function (factory) {
  function nouseTime() {
    var $el = '';
    var key = "nouseTime";
    var keysMap = {
      KEY_OK: function () {
        $.pTool.deactive('nouseTime');
        return true;
      },
      KEY_RETURN: function () {
        $.pTool.deactive('nouseTime');
        return true;
      }
    };
    var init = function () {
      $el || ($el = $('<div class="nouseTime hide"></div>').appendTo('body'))
    }
    return {
      key: key,
      keysMap: keysMap,
      active: function () {
        init();
        $(".nouseTime").show();
        $.focusTo({
          el: ".nouseTime"
        });
      },
      deactive: function () {
        $(".nouseTime").hide();
      }
    };
  }
  $.pTool.add('activeCard', factory());
  $.pTool.add('nouseTime', nouseTime());
})(function () {
  var $el = null;
  var $el2 = null;
  var $OneClickAt = null;
  var isResetFlag = false;
  var isOneClick = false;
  var callback = null;
  var oneClickCardId = null;
  var activeKey = null;  //判断是否从插件跳过来的
  function _init(cb, opt, active_key) {

    active_key && (activeKey = active_key);

    opt && (isOneClick = true);

    typeof cb === 'function' && (callback = cb, cb = null);

    $el || ($el = $('<div class="activeCardPanel hide"><div class="input" id="cardNum"></div><div class="input" id="password"></div><div class="btn" id="active">激活</div><div class="btn" id="back">返回</div><div id="hint"></div></div>').appendTo($('body')))

    $OneClickAt || ($OneClickAt = $('<div class="OneClickPanel hide"><div class="OneClickName"></div><div class="OneClickNum"></div><div class="OneClickTime"></div><div class="btn" id="OneClickAc">确认激活</div><div class="btn" id="OneClickBack">返回</div><div id="hint"></div></div>').appendTo($('body')))

    setTimeout(function () {
      isOneClick && $OneClickAt && (oneClickCardId = opt.card_id, $('.OneClickName').html(opt.card_productName + ' ' + opt.card_typename), $('.OneClickNum').html('卡号 : ' + opt.card_id), $('.OneClickTime').html('激活有效期至 : ' + opt.expiredTime), opt = null);
      //一键激活panel 赋值
      $.pTool.active('activeCard');
      //注册激活返回弹窗插件
      $.pTool.add('cardResul', cardResul());
      //加载返回弹窗dom
      cardResultPanel();
    }, 200)
  }
  function cardResultPanel() {
    $el2 || ($el2 = $('<div class="cardError hide"><div class="cardInfo"></div><div class="btn ensure">确定</div></div>').appendTo($('body')))
  }
  function cardResul() {
    return {
      key: 'cardResul',
      active: function () {
        $('.cardError').removeClass('hide');
        isResetFlag ? $('.ensure').html('重试') : $('.ensure').html('确定');
        $.focusTo({
          el: '.ensure'
        })
      },
      deactive: function () {
        $('.cardError').addClass('hide');
      },
      keysMap: {
        KEY_OK: function () {
          activeKey && ($.pTool.active(activeKey), activeKey = null);
          //需重新渲染页面时，执行回调
          isResetFlag ? $.pTool.active('activeCard') : ($.pTool.deactive('cardResul'), callback && (callback(), callback = null));
          return true;
        },
        KEY_RETURN: function () {
          this.KEY_OK();
          return true;
        }
      }
    }
  }
  function printNum(num) {
    var id = $.activeObj.el;
    var el = $(id);
    if (!el.hasClass("input")) {
      return;
    }
    var $hint = $("#hint");
    if (el.length) {
      var content = el.html();
      if (id === "#cardNum" && content.length >= 19 || id === "#password" && content.length >= 10) {
        return;
      } else {
        $hint.html("");
      }
      el.html(content + num);
    }
  }
  function resetInput() {
    $("#password").html("");
    $("#cardNum").html("");
    $("#hint").html("");
  }
  function delNum() {
    if ($("#hint").html().length) {
      $("#hint").html("");
    }
    var el = $($.activeObj.el);
    el.html(el.html().substring(0, el.html().length - 1));
  }
  function getCardResult(cardId, password) {
    var obj = {
      'CARDID': cardId,
      'CUSTOMERID': $.getVariable("EPG:userId")
    };
    password && (obj['CARDPASSWORD'] = password);
    $.auth.activeCardServer(JSON.stringify(obj), function (code, res) {
      isResetFlag = false;
      if (code) {
        var result = res;
        if (result.code === 2) {
          $hint.html("请输入正确的卡号或密码");
          return true
        } else if (result.code === 0) {
          $('.cardInfo').html('恭喜您，激活成功');
        } else if (result.code === 3) {
          $('.cardInfo').html('该卡已过期')
        } else if (result.code === 4) {
          $('.cardInfo').html('该卡已使用');
        } else if (result.code === 5) {
          $('.cardInfo').html('活动赠送礼券每名用户仅支持激活' + result.message + '张')
        } else if (result.code === 7) {
          $('.cardInfo').html('恭喜您，激活成功')
        } else if (result.code === 9) {
          $('.cardInfo').html('其他卡券正在添加中,请稍后再试')
        } else if (result.code === 8) {
          $('.cardInfo').html('该套餐自动续费中，请先取消自动续费后再激活礼券')
        } else if (result.code === 10) {
          $('.cardInfo').html('激活操作过于频繁，请稍后再试')
        } else {
          $('.cardInfo').html('系统异常，请稍后重试');
          isResetFlag = true;
        }
      } else {
        $('.cardInfo').html('系统异常，请稍后重试')
        isResetFlag = true;
      }
      $.pTool.active(cardResul().key);
      !isResetFlag && resetInput();
    });
  }
  return {
    key: 'activeCard',
    init: _init,
    active: function () {
      isOneClick ? $OneClickAt.removeClass("hide") : $el.removeClass("hide");
      $.focusTo({
        el: (isResetFlag ? isOneClick ? '#OneClickAc' : '#active' : isOneClick ? '#OneClickAc' : '#cardNum')
      })
    },
    deactive: function () {
      isOneClick ? $OneClickAt.addClass("hide") : $el.addClass("hide");
    },
    keysMap: {
      GN: function (key, num) {
        printNum(num);
        return true;
      },
      KEY_UP: function () {
        if (isOneClick) {
          return true;
        }
        var focusId = null;
        focusId = $($.activeObj.el).hasClass("btn") ? '#password' : '#cardNum';
        focusId && $.focusTo({
          el: focusId
        });
        return true;
      },
      KEY_DOWN: function () {
        if (isOneClick) {
          return true;
        }
        var focusId = null;
        focusId = $.activeObj.el === "#cardNum" ? '#password' : $.activeObj.el === "#password" ? '#active' : '';
        focusId && $.focusTo({
          el: focusId
        });
        return true;
      },
      KEY_RIGHT: function () {
        if ($($.activeObj.el).hasClass("btn")) {
          $.focusTo({
            el: isOneClick ? "#OneClickBack" : "#back"
          });
        }
        return true;
      },
      KEY_LEFT: function () {
        if ($($.activeObj.el).hasClass("btn")) {
          $.focusTo({
            el: isOneClick ? "#OneClickAc" : "#active"
          });
        }
        return true;
      },
      KEY_OK: function () {
        // 一键激活
        if (isOneClick) {
          if ($.activeObj.el === '#OneClickAc') {
            getCardResult(oneClickCardId);
            oneClickCardId = null; //清空
          } else {
            this.KEY_RETURN();
          }
          return true;
        }
        // 输入用户密码激活
        if ($($.activeObj.el).hasClass("input")) {
          this.KEY_DOWN();
          return true;
        }
        var cardId = $("#cardNum").html(), password = $("#password").html(), $hint = $("#hint");
        if ($.activeObj.el === "#active") {
          if (cardId.length === 0 || password.length === 0) {
            $hint.html("卡号或密码不能为空");
            return true;
          }
          if ((cardId.length > 0 && cardId.length !== 16) || (password.length > 0 && password.length !== 10)) {
            $hint.html("请输入正确的卡号或密码");
            return true;
          }
          //激活礼券
          getCardResult(cardId, password);
          return true;
        }
        this.KEY_RETURN();
        return true;
      },
      KEY_RETURN: function () {
        var el = $($.activeObj.el);
        if (el.hasClass("input") && el.html().length) {
          delNum();
          return true;
        }
        resetInput();
        // 插件跳插件，返回到插件
        activeKey && ($.pTool.active(activeKey), activeKey = null);
        $.pTool.deactive('activeCard');
        return true;
      }
    }
  }
});