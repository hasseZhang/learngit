(function(root, func) {
    root.G_AUTH = func();
})(window, function() {
    var _pageAuth = function (func) { // 鉴权
        $.auth.auth({
            entrance: 'LQZQ',
            package: [{
                chargeId: $.auth.getId4Entrance("LQZQ")
            }],
            callback: func
        })
    };
    // var _pageAuthCallback = function(result) { // 鉴权回调
    //     if ('0' == result) {
    //         window.AUTH_FLAG = 0; // 未通过
    //         Authentication.CTCSetConfig('G_AUTH_FLAG', '0');
    //         // AUTH_LIB.forwardOrder();
    //     } else {
    //         window.AUTH_FLAG = 1; // 通过
    //         Authentication.CTCSetConfig('G_AUTH_FLAG', '1');
    //     }
    // }
    return function(opt) {
        opt = opt || {};
        typeof opt.success == 'function' ? _pageAuth(opt.success) : '';
    }
});