var APK = function () {

    var time = null;

    var $msg = null;

    var appName = '';

    var downloadUrl = '';

    var apkVersion = '';

    var loading = false;

    var serverUrl = 'http://10.128.46.126:9001/app/version/check/';

    var params = null;

    var callback = null;

    var check = function () {
        if (STBAppManager.isAppInstalled(appName)) {
            if (parseInt(STBAppManager.getAppVersion(appName).substring(0, 5).replace(/\./, "").replace(/\./, "")) === apkVersion) {
                if (!!params) {
                    STBAppManager.startAppByIntent(params);
                } else {
                    STBAppManager.startAppByName(appName);
                }
                callback && callback();
                time && clearInterval(time);
                return true;
            } else {
                if (!loading) {
                    loading = true;
                    $msg.html('升级APK...');
                    STBAppManager.installApp(downloadUrl);
                }
            }
        } else {
            if (!loading) {
                loading = true;
                $msg.html('下载APK...');
                STBAppManager.installApp(downloadUrl);
            }
        }
        return check;
    };
    var pull_apk = function (sign, name, data, cb) {

        $msg || ($msg = $('<div id="msg"></div>').appendTo($('body')));

        appName = name, params = data, cb && (callback = cb);

        $.get(serverUrl + sign, {
            success: function (res) {
                var result = JSON.parse(res)
                res = null
                if (result && result.code === 200 && result.data) {
                    downloadUrl = result.data.downloadUrl
                    apkVersion = parseInt((result.data.versionName + '').substring(0, 5).replace(/\./, "").replace(/\./, ""))
                }
                time = setInterval(check(), 1000)
            },
            error: function () {
                $.back();
            }
        });

    };
    var clear_time = function () {
        time && clearInterval(time);
    };
    return {
        pullApk: pull_apk,
        clearTime: clear_time,

    }
}();