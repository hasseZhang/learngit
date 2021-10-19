(function(root, func) {
    root.G_LOAD = func();
})(window, function() {
    var baseIp = 'http://10.128.4.45:30001';
    // var baseIp = 'http://100.100.100.127:9083';
    var all_Inter_face = {
        regular: baseIp + '/sport/stats/regular', // 常规赛 无参数
        playoff: baseIp + '/sport/stats/playoff', // 季后赛 无参数
        regularScore: baseIp + '/sport/stats/regular/points', // 常规赛得分 无参数
        regularRebounds: baseIp + '/sport/stats/regular/rebounds', // 常规赛篮板 无参数
        regularBlock: baseIp + '/sport/stats/regular/blocked', // 常规赛盖帽 无参数
        regularAssist: baseIp + '/sport/stats/regular/assist', // 常规赛助攻 无参数
        regularSteals: baseIp + '/sport/stats/regular/steals', // 常规赛抢断 无参数
        teamInfo: baseIp + '/sport/team/schedules', // 球队赛程信息 参数teamId = 23256 
        players: baseIp + '/sport/team/match/players', // 球队单场比赛球员信息 参数teamId = 23256 
        localPlayers: baseIp + '/sport/player/players', // 本地球员信息 参数teamId = 23256 
        basePlayer: baseIp + '/sport/player/basic/info', // 球员基本信息 参数teamId = 23256 playerId = 2344421  
    };

    function $ajax(options) {
        options = options || {};
        var type = (options.type || "GET").toUpperCase();
        var dataType = options.dataType || 'json';
        var async = options.async || true;
        var data = options.data || ''; // get 参数为 a=b&c=d post 为 {a:b, c:d}
        var loading = options || options.loading;
        var success = options.success || function() {};
        var fail = options.fail || function() {};
        var url = options.url || '';
        var xhr;
        if (window.XMLHttpRequest) {
            xhr = new XMLHttpRequest();
        } else {
            xhr = new ActiveXObject('Microsoft.XMLHTTP')
        }
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                var status = xhr.status;
                if (status == 200) {
                    success && success(JSON.parse(xhr.responseText));
                } else {
                    fail && fail(status);
                }
            }
        };
        if (type == 'GET') {
            var url1 = data ? (url + '?' + data) : url;
            xhr.open("GET", url1, async);
            xhr.send(null)
        } else if (type == 'POST') {
            xhr.open('POST', url, async);
            xhr.send(data);
        }
        typeof loading === 'function' && loading();
    }
    /**
     * 
     * @param {*} opt 
     * @example
     * getData({
     *   type: '',
     *   data: '',
     *   success: function(data) {
     * 
     *   }
     * })
     */
    function getData(opt) {
        opt = opt || {};
        var type = opt.type || '',
            data = opt.data || '',
            url = all_Inter_face[type];
        $ajax({
            url: url,
            data: data,
            success: function(data) {
                typeof opt.success == 'function' && opt.success(data);
            }
        })
    }
    return function(opt) {
        getData(opt);
    }
});
(function() {
    window.G_GUIDEID = {
        'home': {
            'left': '1100004082', // 首页左侧导读
            'middle': '1100004083', // 首页中部导读
            'right': '1100004084', // 首页右侧导读
            'scroll': '1100004085', // 滚动字幕  
            // 'teamImg': '1100004103', // 球队图片
            'program': '1100004086' // 中部赛事节目
        },
        'match': { // 赛事页面
            'left': '1100004099', // 左侧列表
        },
        'data': { // 数据页面
            'left': '1100004096', // 左侧导读
        },
        'team': { // 球队页面
            'content': '1100004097'
        },
        'teamDetail': { // 球队详情页

        },
        'local': { // 本地页面
            'left': '1100004202', // 左侧列表
        },
        'local2': { // 本地2页面
            'left': '1100004202',
        },
        'stars': { // 球星页面
            'stars': '1100004101' // 球星海报
        },
        'starDetail': { // 球员详情页
            'playerHighlight': '1100004105' // 星途导读
        },
        'plan': { // 策划页面
            'content': '1100004100'
        },
        'battleData': {

        },
        'public': {
            'teamImg': '1100004103', // 球队名和球队logo
            'playerImg': '1100004104', // 球员海报
            'allProgram': '1100004106', // 所有赛事
        },
        'fourScreen': {
            'content': '1100004858',
            'backgroundImg': '1100004941'
        }
    };
    //现网导读
    // window.G_GUIDEID = {
    //     'home': {
    //         'left': '1100004942', // 首页左侧导读
    //         'middle': '1100004237', // 首页中部导读
    //         'right': '1100004943', // 首页右侧导读
    //         'scroll': '1100004239', // 滚动字幕  
    //         // 'teamImg': '1100004103', // 球队图片
    //         'program': '1100004240' // 中部赛事节目
    //     },
    //     'match': { // 赛事页面
    //         'left': '1100004235', // 左侧列表
    //     },
    //     'data': { // 数据页面
    //         'left': '1100004241', // 左侧导读
    //     },
    //     'team': { // 球队页面
    //         'content': '1100004242'
    //     },
    //     'teamDetail': { // 球队详情页

    //     },
    //     'local': { // 本地页面
    //         'left': '1100004324', // 左侧列表
    //     },
    //     'local2': { // 本地2页面
    //         'left': '1100004480',
    //     },
    //     'stars': { // 球星页面
    //         'stars': '1100004247' // 球星海报
    //     },
    //     'starDetail': { // 球员详情页
    //         'playerHighlight': '1100004481' // 星途导读
    //     },
    //     'plan': { // 策划页面
    //         'content': '1100004248'
    //     },
    //     'battleData': {

    //     },
    //     'public': {
    //         'teamImg': '1100004250', // 球队名和球队logo
    //         'playerImg': '1100004251', // 球员海报
    //         'allProgram': '1100004249', // 所有赛事
    //     },
    //     'fourScreen': {
    //         'content': '1100004944',
    //         'backgroundImg': '1100004945'
    //     }
    // };
})();