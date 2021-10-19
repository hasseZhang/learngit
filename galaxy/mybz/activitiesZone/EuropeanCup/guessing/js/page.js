var pageName = "EuropeanCupGuessing";
// var serverUrl = "http://10.128.4.10:4000";
var ACTIVE_OBJECT
var oCanvas = null;
var oGc = null;
var focusIndex
var rightTotal = null
var leftTotal = null
var type
var tjIndex
var firstScreenIndex
var second = false
var $left = null
var $left = null
var $title = null
var $itemContent = null
var $itemList = null
var $content=null
var arrItem = []
var timearr = []
var teamarr = []
var init = false
var contentArr = []
var listContentArrSort = []
var reInter = false
var saveState = false
var bgId
var listId
var rightId
var teamId
var pageInfo = $.initPageInfo(pageName, ["focusIndex", "tjIndex", "type", "firstScreenIndex", "second","saveState"], {
    focusIndex: 0,
    tjIndex: 0,
    type: "right",
    firstScreenIndex: 0,
    second: false,
    saveState: false,
});
focusIndex = pageInfo.focusIndex;
tjIndex = pageInfo.tjIndex;
type = pageInfo.type;
tjIndex = pageInfo.tjIndex;
firstScreenIndex = pageInfo.firstScreenIndex;
second = pageInfo.second;
saveState = pageInfo.saveState
var PAGE_INFO = [
    {
        key: "list",
        pressLeft: _Left,
        pressRight: _Right,
        pressUp: _Up,
        pressDown: _Down,
        pressOk: _Ok,
    },
]
var ACTIVE_OBJECT = PAGE_INFO[0];
function _Ok() {
    if (type === "left") {
        savePageInfo()
        var content = contentArr[tjIndex]
        $.gotoDetail(content)     
    } else {
        savePageInfo()
        var content = listContentArrSort[focusIndex]
        $.gotoDetail(content)
    }
}
function _Left() {
    if (type === "left") {
        return
    } else {
        clearBtn()
        if (focusIndex < 1) {
            tjIndex = 0
            type = "left"
            focusTo()
        } else {
            if (firstScreenIndex === focusIndex) {
                tjIndex = 0
            } else {
                tjIndex = 1
            }
            type = "left"
            focusTo()
        }
    }
}
function _Right() {
    if (type === "right") {
        return
    } else {
        if (tjIndex < 1) {
            if (focusIndex > 0) {
                if (firstScreenIndex !== focusIndex) {
                    focusIndex = focusIndex - 1
                    firstScreenIndex = focusIndex
                    if (focusIndex === 1) {
                        second = true
                    }
                }
            }
            type = "right"
            focusTo()
        } else {
            if (focusIndex < 1) {
                focusIndex = 1
                firstScreenIndex = focusIndex - 1
                type = "right"
                focusTo()
            } else {
                if (firstScreenIndex === focusIndex) {
                    focusIndex = focusIndex + 1
                    firstScreenIndex = focusIndex - 1
                }
                type = "right"
                focusTo()
            }

        }
    }
}
function translate(){
    focusTo()
    if(saveState===false){
        if (focusIndex < 2) {
            firstScreenIndex = 0
            return
        }
    }
    $("#itemList").css({
        "-webkit-transform": "translateY(-" + 413 * (focusIndex - 1) + "px)"
    });
    if(saveState===false){
        firstScreenIndex = focusIndex - 1
    }

}
function _Down() {
    if (type === "right") {
        focusIndex++;
        if (focusIndex > rightTotal - 1) {
            focusIndex = rightTotal - 1
        }
        focusTo()
        if (focusIndex < 2) {
            firstScreenIndex = 0
            return
        }
        $("#itemList").css({
            "-webkit-transform": "translateY(-" + 413 * (focusIndex - 1) + "px)"
        });
        firstScreenIndex = focusIndex - 1
    } else {
            tjIndex++;
            if (tjIndex >= leftTotal - 1) {
                tjIndex = leftTotal - 1
            }
            focusTo()
    }
    if (init) {
        $itemList.addClass("move")
        init = false
    }
}
function _Up() {
    if (type === "right") {
        focusIndex--;
        if (focusIndex < 0) {
            focusIndex = 0
        }
        focusTo()
        if (focusIndex < 1) {
            firstScreenIndex = 0
            if (!second) {
                return
            }
        }
        if (second) {
            $("#itemList").css({
                "-webkit-transform": "translateY(0px)"
            });
        } else {
            $("#itemList").css({
                "-webkit-transform": "translateY(-" + 413 * (focusIndex - 1) + "px)"
            });
        }
        second = false
        firstScreenIndex = focusIndex - 1
    } else {
        tjIndex--;
        if (tjIndex < 0) {
            tjIndex = 0
        }
        focusTo()
    }
    if (init) {
        $itemList.addClass("move")
        init = false
    }
}
function load() {
    $.recodeData(pageName,"access");
    var isTest = $.getVariable("EPG:isTest");
    bgId=isTest ?'1100010484':'1100010537';
    listId=isTest ?'1100010470':'1100010535';
    rightId=isTest ?'1100010471':'1100010536';
    teamId=isTest?"1100010533":"1100010538";
    $left = $("#left")
    $right = $("#right")
    $title = $("#title")
    $itemContent = $("#$itemContent")
    $itemList = $("#itemList")
    $content=$("#content")
    drawBg(bgId)
    initLeftList(listId)
    initRightList(rightId)
}
function drawBg(id) {
    $.s.guidance.get({
        id: id
    }, {
        success: function (data) {
            $content.css({"background":"url(/pic/"+data[0].pics[0].picPath+"?20200602"})
        },
        error: function () { }
    });
}
function initLeftList(id) {
    $.s.guidance.get({
        id: id
    }, {
        success: function (data) {
            var list = data;
            var html = '';
            leftTotal = list.length
            if (leftTotal >= 3) {
                for (var i = 0; i < 3; i++) {
                    contentArr.push(list[i])
                    html += '<div class="url" id="url' + i + '"><img src=' + "/pic/" + list[i].pics[0].picPath + ' class="imgsize"></div>'
                }

            } else {
                for (var i = 0; i < 3; i++) {
                    if (i < leftTotal) {
                        contentArr.push(list[i])
                        html += '<div class="url" id="url' + i + '"><img src=' + "/pic/" + list[i].pics[0].picPath + ' class="imgsize"></div>'
                    } else {
                        contentArr.push(list[i])
                        html += '<div class="url" id="url' + i + '"><img src="" class="noPic imgsize" ></div>'
                    }
                }
            }
            $left.html(html)
        },
        error: function () {
        }
    });
}
function initRightList(id) {
        $.s.guidance.get({
            id:teamId
        }, {
            success: function (data) {
                var teamlist=data
                $.UTIL.each(teamlist, function (value, index) {
                    var name = value.contentName
                    var imgPath = value.pics[0].picPath
                    teamarr.push({ name: name, imgPath: imgPath })
                })
                $.s.guidance.get({
                    id: id
                }, {
                    success: function (data) {
                        var map = {}
                        var list = data;
                        var html = '';
                        var timeSortIndexArr = []
                        rightTotal = list.length
                        for (i = 0; i < list.length; i++) {
                            var allValue = list[i].contentName.split("@")
                            //修改时间的读取方式
                            var allday = allValue[2].substr(4, 8)
                            var zu = []
                            for (j = 0; j < 8; j = j + 2) {
                                zu.push(allday.substr(j, 2))
                            }
                            var day = zu[0] + "-" + zu[1];
                            var time = zu[2] + ":" + zu[3]
                            var matchTime = day + " " + time
                            timearr.push(matchTime)
                        }
                        //时间排序
                        for (i = 0; i < timearr.length - 1; i++) {
                            for (j = 0; j < timearr.length - i - 1; j++) {
                                if (new Date(timearr[j]) > new Date(timearr[j + 1])) {
                                    var swap = timearr[j];
                                    timearr[j] = timearr[j + 1];
                                    timearr[j + 1] = swap
                                }
                            }
                        }
                        for (var i = 0; i < timearr.length; i++) {
                            var ai = timearr[i];
                            if (!map[ai]) {
                                map[ai] = 1;
                            } else {
                                map[ai]++;
                            }
                        }
                        const clonemap = JSON.parse(JSON.stringify(map))
                        $.UTIL.each(list, function (value, index) {
                            var allValue = value.contentName.split("@")
                            var teamA = allValue[0]
                            var teamB = allValue[1]
                            var allday = allValue[2].substr(4, 8)
                            var zu = []
                            for (j = 0; j < 8; j = j + 2) {
                                zu.push(allday.substr(j, 2))
                            }
                            var day = zu[0] + "-" + zu[1];
                            var time = zu[2] + ":" + zu[3]
                            var nowTime = new $.Date().format("MM-dd hh:mm");
                            nowTime = new Date(nowTime)
                            var matchTime = new Date(day + " " + time)
                            var status = false
                            var item = {}
                            var html0 = null
                            if (nowTime >= matchTime) {
                                status = true
                            }
                            var teamNameArr = []
                            var guessStatus = status ? "竞猜结束" : "参与竞猜"
                            var checkTime = day + " " + time
                            var num = clonemap[checkTime]
                            var sortIndex = timearr.indexOf(checkTime)
                            var teamImgA = null
                            var teamImgB = null
                            sortIndex = sortIndex + (num - map[checkTime])
                            map[checkTime]--
                            timeSortIndexArr.push(sortIndex)
                            for (i = 0; i < teamarr.length; i++) {
                                teamNameArr.push(teamarr[i].name)
                            }
                            if (teamNameArr.indexOf(teamA) !== -1) {
                                var index = teamNameArr.indexOf(teamA)
                                teamImgA = teamarr[index].imgPath
                            }
                            if (teamNameArr.indexOf(teamB) !== -1) {
                                var index = teamNameArr.indexOf(teamB)
                                teamImgB = teamarr[index].imgPath
                            }
                            if (teamImgA && teamImgB) {
                                html0 = '<div class="item" id="item' + sortIndex + '"><div class="item_left"><img src="' + '' + "/pic/" + teamImgA + '"  class="item_image"><div class="item_name">' + teamA + '</div></div><div class="item_center"><div class="time"><span class="day">' + day + '</span><span>' + time + '</span></div><div class="vs">VS</div><div class="guess button" id="btn' + sortIndex + '">' + guessStatus + '</div></div><div class="item_right"><img src="' + '' + "/pic/" + teamImgB + '" class="item_image"/><div class="item_name">' + teamB + '</div></div></div>'
                            } else if (teamImgA && teamImgB === null) {
                                html0 = '<div class="item" id="item' + sortIndex + '"><div class="item_left"><img src="' + '' + "/pic/" + teamImgA + '"  class="item_image"><div class="item_name">' + teamA + '</div></div><div class="item_center"><div class="time"><span class="day">' + day + '</span><span>' + time + '</span></div><div class="vs">VS</div><div class="guess button" id="btn' + sortIndex + '">' + guessStatus + '</div></div><div class="item_right"><img src="" class="noPic item_image"/><div class="item_name">' + teamB + '</div></div></div>'
                            } else if (teamImgA === null && teamImgB) {
                                html0 = '<div class="item" id="item' + sortIndex + '"><div class="item_left"><img src=""  class="noPic item_image"><div class="item_name">' + teamA + '</div></div><div class="item_center"><div class="time"><span class="day">' + day + '</span><span>' + time + '</span></div><div class="vs">VS</div><div class="guess button" id="btn' + sortIndex + '">' + guessStatus + '</div></div><div class="item_right"><img src=" ' + '' + "/pic/" + teamImgB + ' " class="item_image"/><div class="item_name">' + teamB + '</div></div></div>'
                            } else {
                                html0 = '<div class="item" id="item' + sortIndex + '"><div class="item_left"><img src=""  class="noPic item_image"><div class="item_name">' + teamA + '</div></div><div class="item_center"><div class="time"><span class="day">' + day + '</span><span>' + time + '</span></div><div class="vs">VS</div><div class="guess button" id="btn' + sortIndex + '">' + guessStatus + '</div></div><div class="item_right"><img src="" class="noPic item_image"/><div class="item_name">' + teamB + '</div></div></div>'
                            }
                            item = {
                                matchTime: day + " " + time,
                                html: html0,
                                value: value,
                            }
                            arrItem.push(item)
                        })
                        for (i = 0; i < timeSortIndexArr.length; i++) {
                            for (j = 0; j < timeSortIndexArr.length; j++) {
                                if (i === timeSortIndexArr[j]) {
                                    html += arrItem[j].html
                                    listContentArrSort.push(arrItem[j].value)
                                }
                            }
                        }
                        $itemList.html(html)
                        initTitle()
                        initPosition()
                    },
                    error: function () { }
                });
            },
            error: function () {
            }
        })
}
function initTitle() {
    $('<div class="text">竞猜截止时间为比赛日当天比赛开始前</div><div class="line">' + (focusIndex + 1) + '/' + rightTotal + '场</div>').appendTo($("#title"))
}
function initPosition() {
    if (saveState === false) {
        var day = []
        var dayindex = null
        var date = new Date();
        var time = date.getTime();
        var oneDay = 1000 * 60 * 60 * 24;
        var after = time + oneDay
        date.setTime(after);
        var app = myGetDate(date);
        var timeArr = app.split("-")
        if (timeArr[1] < 10) {
            timeArr[1] = "0" + timeArr[1]
        }
        if (timeArr[2] < 10) {
            timeArr[2] = "0" + timeArr[2]
        }
        var afterDayFormat = timeArr[1] + "-" + timeArr[2]
        for (i = 0; i < timearr.length; i++) {
            var front = timearr[i].split(" ")
            day.push(front[0])
        }
        for (i = 0; i < day.length; i++) {
            if (new Date(afterDayFormat) <= new Date(day[i])) {
                dayindex = i
                break
            }
        }
        if (dayindex === null) {
            dayindex = day.length - 1
        }
        focusIndex = dayindex
        saveState = true;
    }
    translate()
    init = true

}
function myGetDate(d) {
    return d.getFullYear()+"-"+(d.getMonth() + 1)+"-"+d.getDate();
}
function changeBtn() {
    $("#btn" + focusIndex).addClass("focusBtn")
}
function clearBtn() {
    $("#itemList").find(".button").removeClass("focusBtn")
}
function focusTo() {
    if (type === "right") {
        $.focusTo({
            el: $("#btn" + focusIndex)
        })
        clearBtn()
        changeBtn()
        $(".line").html((focusIndex + 1) + '/' + rightTotal + '场')
    } else {
        $.focusTo({
            el: $("#url" + tjIndex)
        })
    }

}
function savePageInfo() {
    $.savePageInfo(pageName, { focusIndex: focusIndex, tjIndex: tjIndex, type: type, firstScreenIndex: firstScreenIndex, second: second, saveState: saveState })
}
function unload() {
}
