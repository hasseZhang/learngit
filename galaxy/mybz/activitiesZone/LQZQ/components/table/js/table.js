(function(root, func) {
    var relativePath = '../components/table/'
    document.write('<link rel="stylesheet" href="' + relativePath + 'css/table.css">');
    root.G_TABLE = func();
})(window, function() {
    function Table(opt) {
        var obj = opt || {};
        this.data = opt.data || []; // 数据容器
        this.url = opt.url; // 请求地址
        this.el = opt.el; // 外层元素
        this.size = opt.data.length || 0; // 数据容器长度
        this.position = opt.position || 0; // 下标
        this.startIndex = opt.startIndex || 0; // 翻页起始位置
        this.focusEl = opt.focusEl || '';
        this.lines = opt.lines || 10; // 行数
        this.pageFlag = opt.pageFlag && 1; // 是否显示分页
        this.tableSize = opt.tableSize || {}; // 表格的属性
        this.cols = opt.cols; // [{filed: '绑定字段', width: '', height, '', align: '', title: '头部标题'}]
        this.currBtn = '';
        this.upToTableFlagObj = opt.upToTableFlagObj || {}; // Y or N
        this.returnNav = opt.returnNav || function() {};
        return this;
    }
    Table.prototype = {
        constructor: Table,
        init: function() {
            var self = this;
            // $.loader(self.url, {
            //     success: function(data) {
            // self.data = data;
            // this.size = this.data.length;
            this.render();
            this.pageNum();
            this.pageSize();
            this.focusEl ? $.focusTo(this.focusEl) : '';
            //     }
            // })
        },
        render: function() {
            var tableSize = this.tableSize;
            var background = tableSize['background'] ? ';background:' + tableSize['background'] : '';
            var noDataItem = '<div id="noData" style="width:' + tableSize['width'] + ';height:' + tableSize['height'] + ';line-height:' + tableSize['height'] + '">暂无数据<div>';
            var item = '<div class="tableList" style="width:' + tableSize['width'] + ';height:' + tableSize['height'] + background + '"><div class="row table-head">';
            var tds = '';
            var headList = this.cols; // 头部list 自定义
            var dataList = this.data.slice(this.startIndex); // 数据list
            var tables = '';
            var el = this.el;
            var lines = this.lines;
            for (var i = 0; i < headList.length; i++) {
                var tdWidth = headList[i]['width'];
                var tdHeight = headList[i]['height'] || '';
                item += '<div style="width:' + tdWidth + ';height:' + tdHeight + ';line-height:' + tdHeight + '">' + headList[i]['title'] + '</div>';
            }
            item += '</div>';
            for (var j = 0; j < lines; j++) {
                tds += '<div id="tr' + j + '" class="row">';
                for (var k = 0; k < headList.length; k++) {
                    if (j < dataList.length) {
                        var value = dataList[j] ? dataList[j][headList[k]['filed']] : "";
                        var temlate = headList[k]['templated'];
                        var currLineData = dataList[j];
                        value = (temlate ? temlate(currLineData) : (value + '')) || '';
                        tds += '<div id="td' + j + '_' + k + '" style="width:' + headList[k]['width'] + ';height:' + headList[k]['height'] + ';line-height:' + tdHeight + ';text-align:' + headList[k]['align'] + ';">' + value + '</div>';
                    } else {
                        tds += '<div id="td' + j + '_' + k + '" style="width:' + headList[k]['width'] + ';height:' + headList[k]['height'] + ';line-height:' + tdHeight + ';text-align:' + headList[k]['align'] + ';"></div>';
                    }
                }
                tds += '</div>';
            }
            tds += '</div>';
            tables = item + tds;
            if (this.pageFlag && this.size > this.lines) {
                tables += '<div id="conctrolBox"><span id="pageUpBtn">上一页</span><span id="pageNum"></span>/<span id="pageSize"></span><span id="pageDownBtn">下一页</span></div>';
            }

            this.size == 0 ? ($('#' + el).html(noDataItem)) : ($('#' + el).html(tables));
            this.renderBtn();
            this.joinObj();
        },
        renderData: function() { // dom已知的情况，只渲染数据
            var dataList = this.data.slice(this.startIndex); // 数据list
            var headList = this.cols; // 头部list 自定义
            var lines = this.lines;
            for (var j = 0; j < lines; j++) {
                for (var k = 0; k < headList.length; k++) {
                    if (j < dataList.length) {
                        $('#td' + j + '_' + k).html();
                        var value = dataList[j][headList[k]['filed']];
                        var currLineData = dataList[j];
                        var temlate = headList[k]['templated'];
                        value = temlate ? temlate(currLineData) : value;
                        $('#td' + j + '_' + k).html(value);
                    } else {
                        $('#td' + j + '_' + k).html('');
                    }
                }
            }

        },
        renderBtn: function() { // 渲染翻页按钮
            var num = this.size > 0 ? (Math.floor(this.startIndex / this.lines) + 1) : 0;
            var count = Math.ceil(this.size / this.lines);
            if (num == 0) {
                $('#pageUpBtn').css('color', '#7a7474');
                $('#pageDownBtn').css('color', '#7a7474');
            } else if (num > 1 && num >= count) { // 最后一页
                $('#pageUpBtn').css('color', 'white');
                $('#pageDownBtn').css('color', '#7a7474');
            } else if (num == 1 && num < count) { // 第一页
                $('#pageUpBtn').css('color', '#7a7474');
                $('#pageDownBtn').css('color', 'white');
            } else if (num > 1 && num < count) { // 中间页
                $('#pageUpBtn').css('color', 'white');
                $('#pageDownBtn').css('color', 'white');
            } else {
                $('#pageUpBtn').css('color', '#7a7474');
                $('#pageDownBtn').css('color', '#7a7474');
            }
        },
        focusBtn: function() { // 从推荐位按下定焦到翻页按钮
            var num = this.size > 0 ? (Math.floor(this.startIndex / this.lines) + 1) : 0;
            var count = Math.ceil(this.size / this.lines);
            if (num == 0) {
                return;
            } else if (num < count) {
                $.focusTo('pageDownBtn');
            } else if (num > 1 && num >= count) {
                $.focusTo('pageUpBtn');
            } else if (num == 1 && num == count) {
                return;
            } else {
                $.focusTo(this.currBtn);
            }
        },
        leftSide: function() {
            if (this.upToTableFlagObj['flag'] == 'N' && this.upToTableFlagObj['fun']) {
                this.upToTableFlagObj['fun']();
            }
        },
        chooseBtn: function() { // 翻页按钮切换
            var num = this.size > 0 ? (Math.floor(this.startIndex / this.lines) + 1) : 0;
            var count = Math.ceil(this.size / this.lines);
            var btn = ACTIVE_OBJECT.key;
            if (btn == 'pageUpBtn' && num > 1 && num < count) { // 处于中间页
                $.focusTo('pageDownBtn');
                this.currBtn = 'pageDownBtn';
            } else if (btn == 'pageDownBtn' && num > 1 && num < count) { // 处于中间页
                $.focusTo('pageUpBtn');
                this.currBtn = 'pageUpBtn';
            } else if (btn == 'pageUpBtn' && num > 1 && num >= count) { // 处于最后页
                this.leftSide();
                return;
            } else if (btn == 'pageDownBtn' && num == 1) { // 处于第一页
                this.leftSide();
                return;
            }
        },
        isJumpBtn: function() {
            var btn = window.ACTIVE_OBJECT ? window.ACTIVE_OBJECT.key : '';
            var num = this.size > 0 ? (Math.floor(this.startIndex / this.lines) + 1) : 0;
            var count = Math.ceil(this.size / this.lines);
            if (btn == 'pageDownBtn' && num > 1 && num >= count) {
                this.renderBtn(); // 处于最后一页，按钮状态
                $.focusTo('pageUpBtn');
            } else if (btn == 'pageUpBtn' && num == 1) {
                this.renderBtn(); // 处于第一页，按钮状态
                $.focusTo('pageDownBtn');
            } else {
                this.renderBtn(); // 处于中间页，按钮状态
            }
        },
        joinObj: function() {
            var out = [];
            var btnArr = [
                { key: 'pageUpBtn', pressUp: this.enter.bind(this), pressLeft: this.leftSide.bind(this), pressRight: this.chooseBtn.bind(this), pressOk: this.pageUp.bind(this), pressBack: this.returnNav.bind(this) },
                { key: 'pageDownBtn', pressUp: this.enter.bind(this), pressLeft: this.chooseBtn.bind(this), pressRight: '', pressOk: this.pageDown.bind(this), pressBack: this.returnNav.bind(this) }
            ]
            for (var i = 0; i < this.lines; i++) {
                out.push({
                    key: 'tr' + i,
                    pressUp: this.up.bind(this),
                    pressDown: this.down.bind(this),
                    pressLeft: this.left.bind(this),
                    pressRight: this.right.bind(this),
                    pressOk: this.ok.bind(this),
                    pressBack: this.returnNav.bind(this)
                })
            }
            out = out.concat(btnArr);
            if (window.PAGE_INFO.listFlag == 1) {
                window.PAGE_INFO.splice(-(this.lines + 2));
                window.PAGE_INFO.listFlag = 0;
            }
            window.PAGE_INFO = window.PAGE_INFO.concat(out);
            window.PAGE_INFO.listFlag = 1;
        },
        enter: function() {
            if (this.startIndex + this.position > this.size - 1) {
                this.position = this.size - this.startIndex - 1;
            }
            if (this.upToTableFlagObj['flag'] == 'N') {
                menu && menu.enter();
                // this.focusBtn();
            } else {
                $.focusTo('tr' + this.position);
                this.marquee();
            }
        },
        up: function() {
            if (this.position == 0) {
                menu.enter();
            } else {
                this.position -= 1;
                $.focusTo('tr' + this.position);
            }
        },
        down: function() {
            if (this.position == 9 || (this.position == this.data.length - this.startIndex - 1)) {
                this.focusBtn();
            } else {
                this.position += 1;
                $.focusTo('tr' + this.position);
            }
            this.marquee();
        },
        left: function() {

        },
        right: function() {

        },
        pageUp: function() {
            if (this.startIndex == 0) {

            } else {
                this.startIndex -= this.lines;
                if (this.size - (this.startIndex + 1) >= this.lines) {
                    this.position = this.lines - 1;
                } else {
                    this.position = this.size - (this.startIndex + 1) - 1;
                }
                this.renderData();
                this.pageNum();
            }
        },
        pageDown: function() {
            var pageSize = Math.ceil(this.size / this.lines);
            if (this.startIndex + this.lines >= pageSize * this.lines) {
                return;
            } else {
                this.startIndex += this.lines;
                this.renderData();
                this.pageNum();
            }
        },
        ok: function() {

        },
        pageNum: function() {
            var num = Math.floor(this.startIndex / this.lines) + 1;
            $('#pageNum').html(num);
            this.isJumpBtn();
        },
        pageSize: function() {
            var count = Math.ceil(this.size / this.lines);
            $('#pageSize').html(count);
        },
        marquee: function() {
            var len = this.cols.length;
            var rowData = this.data[this.startIndex + this.position];
            for (var i = 0; i < len; i++) {
                var _width = this.cols[i].width;
                var _all = rowData[this.cols[i]['filed']] || '';
                if (_width) {
                    var flag = $.substringElLength(_all, '16px', _width).flag;
                    flag ? $.Marquee({ el: $('#td' + this.position + '_' + i)[0], all: _all, width: _width, height: '48px' }) : '';
                }
            }
        }
    }
    return function(opt) {
        return new Table(opt);
    }
})