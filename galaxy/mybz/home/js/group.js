var groupTool = function () {
    var initFtpFile = "";
    var groupArr = [];
    var groupData = null;
    var insertNum = 3;
    return {
        init: function (cb) {
            var guideId = $.getVariable("EPG:isTest") ? '1100008447' : '1100008836';
            function getGroup() {
                top.popModal.userGroup({
                    success: function (res) {
                        res && res.data && (groupArr = res.data);
                        $.globalStorage.set('userGroup',groupArr.join(","))
                        if (groupArr.length) {
                            for (var i = 0; i < groupArr.length; i++) {
                                if (/^group(\d)$/.test(groupArr[i])) {
                                    initFtpFile = RegExp.$1;
                                    break
                                }
                            }
                        }
                        getGroupData();
                    },
                    error: function () {
                        getGroupData();
                    }
                });
            }
            function getGroupData() {
                if (initFtpFile) {
                    $.get($.getVariable("EPG:pathSite") + "/linn/group/" + initFtpFile + "/", {
                        success: function (res) {
                            var getGnid = (groupData = JSON.parse(res.replace(/\/\*.*\*\//g, ""))).gnid.split("@");
                            groupData.contentName = getGnid[0];
                            groupData.gnid = getGnid[1];
                            cb && cb();
                        },
                        error: function () {
                            cb && cb();
                        }
                    })
                } else {
                    cb && cb();
                }
            }
            $.s.guidance.get({
                id: guideId
            }, {
                success: function (res) {
                    res && res[0] && res[0].contentUri ? (insertNum = res[0].contentUri, getGroup()) : getGroup();
                },
                error: function () {
                    getGroup()
                }
            })
        },
        getGroup: function () {
            return groupArr
        },
        getData: function () {
            return groupData
        },
        getSort: function () {
            return insertNum
        }
    }
}()