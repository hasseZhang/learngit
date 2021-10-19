(function(root, func) {
    var relativePath = '../components/msgBox/'
    document.write('<link rel="stylesheet" href="' + relativePath + 'css/msg.css">');
    root.G_MSG = func();
})(window, function() {
    function Msg(opt) {
        this.pagType = opt.type;
        this.msgType = opt.msgType;
        this.backFocus = opt.backFocus || function() {};
        this.upTo = opt.upTo || function() {};
        this.saveFocus = opt.saveMsgFocus || function() {};
        this.isBackFlag = opt.isBackFlag || '';
        this.pressBack = opt.pressBack || function() {};
        return this;
    }
    Msg.prototype = {
        init: function() {
            var type = this.pagType;
            type == 'home' ? this.render() : this.renderOther();
        },
        focusTo: function(e, flag) {
            if (e) {
                $$.hideFocus();
                var t = $;
                "undefined" != typeof PAGE_INFO && foreach(PAGE_INFO, function(t) { if (t.key === e) return window.ACTIVE_OBJECT = t, !0 });
                var n, i, a, r;
                if (window.ACTIVE_OBJECT && ACTIVE_OBJECT.marquee && ACTIVE_OBJECT.marquee.length && (n = ACTIVE_OBJECT.wholeMsg) && ACTIVE_OBJECT.marquee && ACTIVE_OBJECT.marquee[0] && (i = t(ACTIVE_OBJECT.marquee[1])[0], a = ACTIVE_OBJECT.marquee[2], r = ACTIVE_OBJECT.marquee[3]), !flag ? $$.Marquee({ all: n, el: i, width: a, height: r }) : '', window.ACTIVE_OBJECT) {
                    var o = t("#" + ACTIVE_OBJECT.key);
                    if (o.length) {
                        var s = ACTIVE_OBJECT.focusImg && ACTIVE_OBJECT.focusImg[0];
                        if ("~" == s) return;
                        if (s && "." !== s) {
                            var l = o.css(),
                                c = t("#divImgBorder");
                            c.length || ((c = t("<div>").attr("id", "divImgBorder").css({ position: "absolute", visibility: "hidden", zIndex: 30 })).html('<img style="width:0; height:0;">'), document.body.appendChild(c[0]));
                            var u = t("img", c[0]);
                            c.hide();
                            var d = t("#divYellowBorder");
                            d.length || ((d = t("<div>").attr("id", "divYellowBorder").css({ position: "absolute", visibility: "hidden", zIndex: 30 })).html('<img style="width:0; height:0;">'), document.body.appendChild(d[0]));
                            var p = t("img", d[0]);
                            d.hide(), "#" === s ? (p.css({ width: l.width, height: l.height }), d.css({ left: parseInt(l.left) - 4 + "px", top: parseInt(l.top) - 4 + "px" }), d.show()) : (u.css({ width: l.width, height: l.height }), u[0].src = s, c.css({ left: l.left, top: l.top }), c.show())
                        } else $$.showFocus(o)
                    }
                }
            }
        },
        render: function() {
            var msgType = this.msgType;
            var html = [];
            var msg;
            if (msgType == '0') { // 预约成功
                msg = document.createElement('div');
                msg.id = 'msgBox';
                document.body.appendChild(msg);
                html.push('<div class="tip-box succ-bg"><div class="btns sub-btn" id="btnOk1">确认</div></div>');
            }
            if (msgType == '1') { // 已经预约
                msg = document.createElement('div');
                msg.id = 'msgBox1';
                document.body.appendChild(msg);
                html.push('<div class="tip-box succed-bg"><div class="btns sub-btn" id="btnOk2">确认</div></div>');
            }
            if (msgType == '2') { // 预约失败 
                msg = document.createElement('div');
                msg.id = 'msgBox2';
                document.body.appendChild(msg);
                html.push('<div class="tip-box fail-bg"><div id="middle-text">篮球专区</div><div class="btns order-btn" id="btnOk3">立即订购</div><div class="btns back-btns" id="backBtn1">返回</div></div>');
            }
            if (msgType == '3') { // 播放失败
                msg = document.createElement('div');
                msg.id = 'msgBox3';
                document.body.appendChild(msg);
                html.push('<div class="tip-box play-fail-bg"><div id="middle-text">篮球专区</div><div class="btns order-btn" id="btnOk4">立即订购</div><div class="btns back-btns" id="backBtn2">返回</div></div>');
            }
            if (msgType == '5') { // 替换预约
                msg = document.createElement('div');
                msg.id = 'msgBox4';
                document.body.appendChild(msg);
                html.push('<div class="tip-box repeatMsg repeatBg"><span id="text"></span><span class="btns order-btn repeatSucc" id="btnOk5">替换</span><span class="btns back-btns isRepeat" id="backBtn3">返回</span></div>');
            }
            if (msgType == '6') { // 替换预约
                msg = document.createElement('div');
                msg.id = 'msgBox5';
                document.body.appendChild(msg);
                html.push('<div class="tip-box repeatMsg repeatSuccBg"><div class="btns sub-btn" id="btnOk6">确认</div></div>');
            }
            msg.innerHTML = html.join('');
            this.joinObj();
        },
        hiddenMsg: function() {
            var msgType = this.msgType;
            var that = this;
            var isBackFlag = this.isBackFlag;
            if (isBackFlag == 'Y') {
                $$.keyPressSetting({
                    KEY_RETURN: function() {
                        if (msgType == '0') { // 预约成功
                            $$('#msgBox').css('display', 'none');
                        }
                        if (msgType == '1') { // 已经预约
                            $$('#msgBox1').css('display', 'none');
                        }
                        if (msgType == '2') { // 预约失败 
                            $$('#msgBox2').css('display', 'none');
                        }
                        if (msgType == '3') { // 播放失败
                            $$('#msgBox3').css('display', 'none');
                        }
                        that.backFocus();
                    }
                })
            }
        },
        renderOther: function() {
            var html = [];
            var msg = document.createElement('div');
            msg.id = 'msgOtherBox';
            document.body.appendChild(msg);
            html.push('<div class="tip-box"><div id="middle-text2">开通篮球专区，查看更多内容！</div><div class="btns order-btn" id="btnOk">立即订购</div><div class="btns back-btns" id="backBtn">返回</div></div>');
            msg.innerHTML = html.join('');
            this.joinObj();
            if (Authentication.CTCGetConfig('G_OTHER_FLAG') == '0' && $$.isBack()) {
                $$.focusTo('btnOk');
            }
        },
        joinObj: function() {
            var out = [];
            var msgType = this.msgType;
            var that = this;
            if (msgType == '0') { // 预约成功
                out.push({
                    key: 'btnOk1',
                    pressLeft: function() {},
                    pressRight: function() {},
                    pressOk: this.ok.bind(this),
                    pressBack: this.ok.bind(this),
                    args: ['', 'ok'] // 关闭弹框
                })
            }
            if (msgType == '1') { // 已经预约
                out.push({
                    key: 'btnOk2',
                    pressLeft: function() {},
                    pressRight: function() {},
                    pressOk: this.ok.bind(this),
                    pressBack: this.ok.bind(this),
                    args: ['', 'ok'] // 关闭弹框
                })
            }
            if (msgType == '2') { // 预约失败 
                out = [
                    { key: 'btnOk3', pressLeft: '', pressRight: 'backBtn1', pressOk: this.ok.bind(this), pressBack: this.pressBack.bind(this), args: ['', 'order'] }, // 订购
                    { key: 'backBtn1', pressLeft: 'btnOk3', pressRight: '', pressOk: this.ok.bind(this), pressBack: this.pressBack.bind(this), args: ['', 'ok'] }
                ];
            }
            if (msgType == '3') { // 播放失败
                out = [
                    { key: 'btnOk4', pressLeft: '', pressRight: 'backBtn2', pressOk: this.ok.bind(this), pressBack: this.pressBack.bind(this), args: ['', 'order'] }, // 订购
                    { key: 'backBtn2', pressLeft: 'btnOk4', pressRight: '', pressOk: this.ok.bind(this), pressBack: this.pressBack.bind(this), args: ['', 'ok'] }
                ];
            }
            if (msgType == '4') { // 其他页面鉴权
                out = [
                    { key: 'btnOk', pressLeft: '', pressUp: this.upTo.bind(this), pressRight: 'backBtn', pressOk: this.ok.bind(this), pressBack: this.upTo.bind(this), args: ['', 'order'] }, // 订购
                    { key: 'backBtn', pressUp: this.upTo.bind(this), pressLeft: 'btnOk', pressRight: '', pressOk: this.ok.bind(this), pressBack: this.ok.bind(this), args: ['', 'ok'] }
                ];
            }
            if (msgType == '5') { // 替换预约 
                out = [{
                        key: 'btnOk5',
                        pressLeft: '',
                        pressRight: function() {
                            that.focusTo('backBtn3', true);
                        },
                        pressOk: this.ok.bind(this),
                        pressBack: this.pressBack.bind(this),
                        args: ['', 'repeat']
                    }, // 订购
                    {
                        key: 'backBtn3',
                        pressLeft: function() {
                            that.focusTo('btnOk5', true);
                        },
                        pressRight: '',
                        pressOk: this.ok.bind(this),
                        pressBack: this.pressBack.bind(this),
                        args: ['', 'ok']
                    }
                ];
            }
            if (msgType == '6') { // 替换预约 
                out.push({
                    key: 'btnOk6',
                    pressLeft: function() {},
                    pressRight: function() {},
                    pressOk: this.ok.bind(this),
                    pressBack: this.pressBack.bind(this),
                    args: ['', 'ok'] // 关闭弹框
                })
            }
            window.PAGE_INFO = window.PAGE_INFO.concat(out);
        },
        enter: function() {
            var key = '';
            var msgType = this.msgType;
            if (msgType == '0') { // 预约成功
                this.hiddenMsg();
                $$('#msgBox').css('display', 'block');
                key = 'btnOk1';
            }
            if (msgType == '1') { // 已经预约
                this.hiddenMsg();
                $$('#msgBox1').css('display', 'block');
                key = 'btnOk2';
            }
            if (msgType == '2') { // 预约失败 
                this.hiddenMsg();
                $$('#msgBox2').css('display', 'block');
                key = 'btnOk3';
            }
            if (msgType == '3') { // 播放失败
                this.hiddenMsg();
                $$('#msgBox3').css('display', 'block');
                key = 'btnOk4';
            }
            if (msgType == '4') { // 其他页面
                $$('#msgBox3').css('display', 'block');
                key = 'btnOk';
            }
            if (msgType == '5') { // 替换页面
                this.hiddenMsg();
                $$('#msgBox4').css('display', 'block');
                key = 'btnOk5';
            }
            if (msgType == '6') { // 替换成功
                this.hiddenMsg();
                $$('#msgBox5').css('display', 'block');
                key = 'btnOk6';
            }
            $$.focusTo(key);
        },
        ok: function() {
            var type = ACTIVE_OBJECT && ACTIVE_OBJECT['args'][1] || '';
            var msgType = this.msgType;
            if (type == 'order') {
                this.saveFocus();
                Authentication.CTCSetConfig('G_OTHER_FLAG', '0');
                $.auth.forwardOrder()
            } else {
                if (msgType == '0') { // 预约成功
                    $$('#msgBox').css('display', 'none');
                }
                if (msgType == '1') { // 已经预约
                    $$('#msgBox1').css('display', 'none');
                }
                if (msgType == '2') { // 预约失败 
                    $$('#msgBox2').css('display', 'none');
                }
                if (msgType == '3') { // 播放失败
                    $$('#msgBox3').css('display', 'none');
                }
                if (msgType == '4') { // 其他页面
                    $$('#msgBox3').css('display', 'none');
                }
                if (msgType == '5') { // 替换预约
                    // $$('#msgBox4').css('display', 'none');
                    $$('#msgBox4').remove();
                }
                if (msgType == '6') { // 替换成功
                    // $$('#msgBox5').css('display', 'none');
                    $$('#msgBox5').remove();
                }
                this.backFocus();
                return true;
            }
        }
    }
    return function(opt) {
        return new Msg(opt);
    }
})