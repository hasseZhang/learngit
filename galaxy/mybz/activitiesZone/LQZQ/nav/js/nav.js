(function(root, func) {
    var relativePath = '../nav/'
    document.write('<link rel="stylesheet" href="' + relativePath + 'css/nav.css">');
    root.MENU = func();
})(window, function() {
    function Menu(o) {
        var obj = o || {};
        this.down = obj.pressDown;
        this.data = []; // 数据容器
        this.logoData = ''; // 数据容器
        this.size = 0; // 数据长度
        this.index = 0; // nav下标
        this.focusFlag = obj['focusFlag'] || 0;
        return this;
    }
    Menu.prototype = {
        init: function() { // 初始化数据
            var that = this;
            var url = window.location.href;
            var id = '1100004230';
            $$.loader4GuidanceContents(id, {
                success: function(data) {
                    var _data = [];
                    for (var i = 1, len = data.length; i < len; i++) {
                        var contentName = data[i].contentName;
                        if (contentName != 0) {
                            _data.push(data[i]);
                        }
                    }
                    for (var j = 0; j < _data.length; j++) {
                        var mainId = _data[j].contentUri;
                        if (url.indexOf(mainId) >= 0) {
                            that.index = j;
                        }
                    }
                    that.logoData = data[0];
                    that.size = _data.length;
                    that.data = _data;
                    that.compile();
                    that.initFocus();
                }
            });
        },
        renderNavItemList: function () {
            var data = this.data;
            var listItem = [];
            var widthAll = 0;
            var len = data.length > 9 ? 9 : data.length;
            for (var i = 0; i < len; i++) {
                var name = data[i].contentName.split("&");
                // 文字的话只匹配第一个参数
                if (name.length <= 1) {
                    widthAll += 100;
                    listItem.push('<div id="nav' + i + '" class="navGap" style="width: 100px">' + name[0] + '</div>');
                } else {
                    widthAll += parseInt(name[1]);
                    // 这里有第二个参数，第二个参数作为宽度
                    var pics = data[i]['pics'] || [];
                    var picPath = $$.getPic(pics, [1]);
                    listItem.push('<div id="nav' + i + '" class="navGap"><img src="' + picPath + '" style="width: ' + parseInt(name[1]) + 'px;"></div>');
                }
            }
            
            return {
                renderHtml: "<div class='navItemContainer'>" + listItem.join("") + "</div>",
                navListGap: parseInt((970 - widthAll) / data.length),
                restPX: parseFloat((((970 - widthAll) / data.length) - parseInt((970 - widthAll) / data.length)) * data.length)
            }
        },
        compile: function () { // 渲染模板
            var out = [];
            var pics = this.logoData['pics'] || '';
            var picPath = $$.getPic(pics, [0]);
            var html = ['<div id="logo" style="background: url(' + picPath + ') no-repeat; background-size: 100% 100%;"></div>'];
            var menu = document.createElement('div');
            menu.id = 'nav';
            document.body.appendChild(menu);
            var renderRes = this.renderNavItemList();
            menu.innerHTML = html.concat(renderRes.renderHtml).join("")
            var navGap = document.getElementsByClassName('navGap');
            // 设置marginLeft，同时添加OUT
            for (var i = 0; i < navGap.length; i++) {
                navGap[i].style.marginLeft = (!i ? renderRes.restPX : 0) + renderRes.navListGap + 'px';
                out.push({
                    key: 'nav' + i,
                    pressUp: this.up.bind(this),
                    pressDown: this.down.bind(this),
                    pressLeft: this.left.bind(this),
                    pressRight: this.right.bind(this),
                    pressOk: '',
                    pressBack: this.pressBack.bind(this, i),
                    args: []
                })
            }
            PAGE_INFO = window.PAGE_INFO.concat(out);
        },
        initFocus: function() { // 初始化焦点
            var url = window.location.href;
            var sourcePage = document.referrer;
            if (this.focusFlag) {
                sourcePage.indexOf('LQZQ') == -1 
                    ? this.blur() 
                    : this.moveTo(); 
            } else if (url.indexOf('POSITIVE') != -1) {
                this.moveTo();
            } else {
                if (window.savedData['focus'] == '') {
                    this.moveTo();
                } else {
                    this.blur();
                }
                
            }
        },
        moveTo: function() {
            var name = this.data[this.index]['contentName'];
            name = name.split('&')[0];
            if(name == '1') {
                var pics = this.data[this.index]['pics'];
                var picPath = $$.getPic(pics, [ 0 ]); // 落焦
                $$('#nav' + this.index + ' img')[0].src = picPath;
                $$('#nav' + this.index + ' img').addClass('nav-img-height');
                $$.focusTo('nav' + this.index);
                // $$('#nav' + this.index).removeClass('focusBorder');
            } else {
                $$.focusTo('nav' + this.index);
            }
        },
        blur: function() { // 驻焦元素
            var name = this.data[this.index]['contentName'];
            name = name.split('&')[0];
            var index = this.index;
            if(name == '1') {
                var pics = this.data[index]['pics'];
                var picPath = $$.getPic(pics, [ 106 ]); // 落焦
                $$('#nav' + index).addClass('active');
                $$('#nav' + this.index + ' img')[0].src = picPath;
            } else {
                $$('#nav' + index).addClass('active');
            }
        },
        enter: function() {
            $$('#nav' + this.index).removeClass('active');
            this.moveTo();
        },
        up: function() {
            return;
        },
        left: function() {
            if (this.index <= 0) return;
            this.index--;
            this.moveTo();
            this.jumpUrl();
        },
        right: function() { // 移动焦点
            if (this.index >= this.size - 1) return;
            this.index++;
            this.moveTo();
            this.jumpUrl();
        },
        pressBack: function(i) {
            if(i) {
                this.index = 0;
                this.moveTo();
                this.jumpUrl();
                return true;
            }
        },
        jumpUrl: function() { // 跳转
            var baseUrl = '../';
            var url = this.data[this.index].contentUri;
            $$.redirect(baseUrl + url);
        }
    }
    return function(o) {
        return new Menu(o);
    }
});
// 在屏幕上打log，用于不支持alert confirm的情况
function _test(msg) {
	var test_log = document.getElementById('testDiv');
	if (test_log) {
		var testText = test_log.innerHTML,
			testContents = testText.split('<br>');
		if (testContents.length < 15) {
			testContents.push(msg);
		} else {
			testContents.shift();
			testContents.push(msg);
		}
		var testResult = testContents.join('<br>');
		test_log.innerHTML = testResult;
	} else {
		test_log = document.createElement('div');
		test_log.setAttribute('id', 'testDiv');
		test_log.style.color = 'yellow';
		test_log.style.fontSize = '20px';
		test_log.style.position = 'absolute';
		test_log.style.top = '10px';
		test_log.style.left = '50px';
		test_log.style.width = '1100px'
		test_log.style.padding = '3px';
		test_log.style.border = 'solid 1px #ff0';
		test_log.style.zIndex = '999';
		test_log.style.backgroundColor = 'rgba(0,0,0,0.75)'
		document.body.appendChild(test_log);
		test_log.innerHTML = msg;
	}
}