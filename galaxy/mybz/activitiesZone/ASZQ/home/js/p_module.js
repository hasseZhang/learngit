var p_module = function () {
    var key = "p_module";
    var isFromVol = false;
    var moduleData = modules;
    var keysMap = {}, activeModule = {}, activeMenu = [], moduleIndex = 0, moduleBegin = 0, activeNum = 0, subIndex = 1;
    var arr = [], p_pageInfo = [];
    upHomeData();
    function upHomeData() {
        arr = [];
        p_pageInfo = [];
        for (var i = 0; i < homeAllData.length; i++) {
            for (var j = 0; j < homeAllData[i].subContent.length; j++) {
                arr.push("module" + homeAllData[i].subContent[j].moduleType);
            }
            p_pageInfo.push(arr);
            arr = [];
        }
    }
    function loadSections(menuIndex) {
        // 爱尚专区专属判断.modules是否存在（非瀑布流情况下）
        if (!$('#section' + menuIndex + " .modules").length) {
            menuIndex >= 0 && menuIndex <= homeAllData.length - 1 && createOneSection(menuIndex)
        }
    }
    var m_event = {
        type: "",
        moveOnOff: false,
        id: "",
        shake: function () {
            $("#" + this.id).addClass("public_shake");
        },
        close: function () {
            this.moveOnOff = false;
        },
        crossMove: function (fn) {
            if (this.moveOnOff) {
                fn && fn();
                this.close();
                clearTimeout(this.timer);
            } else {
                this.shake();
                this.moveOnOff = true;
                this.timer = setTimeout(this.close.bind(this), 3e3);
            }
        },
        init: function (opt) {
            subIndex = opt && $.UTIL.isNumber(+opt.subIndex) ? opt.subIndex : subIndex;
            activeNum = opt && $.UTIL.isNumber(+opt.activeNum) ? opt.activeNum : activeNum;
            moduleBegin = opt && $.UTIL.isNumber(+opt.moduleBegin) ? opt.moduleBegin : moduleBegin;
            activeMenu = p_pageInfo[subIndex];
            if (opt && opt.type === "menu") {
                this.type = "menu";
            } else {
                moduleIndex = opt.moduleIndex;
                moduleData["menu"].blur(subIndex);
                this.type = activeMenu[moduleIndex];
            }
            activeModule = moduleData[this.type];
            // 标准版加载3栏。
            loadSections(pageInfo.menuIndex);
            loadSections(pageInfo.menuIndex + 1);
            loadSections(pageInfo.menuIndex - 1);
            setTranslateX(pageInfo.menuIndex, true);
            loadPageText(pageInfo.menuIndex);
        },
        active: function (info) {
            info.moduleIndex = moduleIndex;
            activeModule.active(info);
        },
        setKey: function (key) {
            activeModule[key] && this.ob(key, activeModule[key]());
        },
        ob: function (key, state) {
            if (this.type === "menu") {
                if (key === "up") {
                    activeModule.deActive();
                    moduleIndex = activeMenu.length - 1;
                    this.type = activeMenu[moduleIndex];
                    activeModule = moduleData[this.type];
                    this.active(state);
                } else if ((key === "left" || key === "right") && state) {
                    subIndex = state.menuIndex;
                    activeMenu = p_pageInfo[subIndex];
                    key === "right" && loadSections(subIndex + 1);
                    key === "left" && loadSections(subIndex - 1);
                    loadPageText(subIndex);
                    autoLoadImg(subIndex, 500);
                    setTranslateX(subIndex);
                }
            } else {
                if (!state) {
                    this.close();
                    return;
                } else {
                    this.id = state.id;
                }
                switch (key) {
                    case "up":
                         if (moduleIndex === 0) {
                            // this.type = "menu";
                            // activeModule.deActive();
                            // activeModule = moduleData[this.type];
                            // state.menuIndex = subIndex;
                            // state.from = "section";
                            // this.active(state);
                        } else {
                            if (this.type !== "returnTop") {
                                moduleIndex--;
                                this.swichModule(state);
                            } else {
                                activeModule.deActive();
                                this.type = activeMenu[moduleIndex];
                                activeModule = moduleData[this.type];
                                state.menuIndex = subIndex;
                                this.active(state);
                            }
                            autoLoadImg(subIndex, 500);
                        }
                        break;

                    case "down":
                        if (moduleIndex < activeMenu.length - 1) {
                            moduleIndex++;
                            this.swichModule(state);
                        } else {
                            this.type = "menu";
                            activeModule.deActive();
                            activeModule = moduleData[this.type];
                            state.menuIndex = subIndex;
                            state.from = "section";
                            this.active(state);
                        }
                        autoLoadImg(subIndex, 500);
                        break;

                    case "left":
                        if (subIndex == 0) {
                            this.shake();
                        } else {
                            var This = this;
                            this.crossMove(function () {
                                subIndex--;
                                moduleIndex = 0;
                                loadSections(subIndex - 1);
                                loadPageText(subIndex);
                                setTranslateX(subIndex);
                                This.swichModule(state, true);
                                autoLoadImg(subIndex, 500);
                                moduleData["menu"].blur(subIndex);
                            });
                        }
                        break;

                    case "right":
                        if (subIndex == p_pageInfo.length - 1) {
                            this.shake();
                        } else {
                            var This = this;
                            this.crossMove(function () {
                                subIndex++;
                                moduleIndex = 0;
                                loadSections(subIndex + 1);
                                loadPageText(subIndex);
                                setTranslateX(subIndex);
                                This.swichModule(state, true);
                                autoLoadImg(subIndex, 500);
                                moduleData["menu"].blur(subIndex);
                            });
                        }
                        break;
                }
            }
        },
        swichModule: function (state, isGotoOterPage) {
            activeModule.deActive(isGotoOterPage);
            activeMenu = p_pageInfo[subIndex];
            this.type = activeMenu[moduleIndex];
            activeModule = moduleData[this.type];
            state.moduleIndex = moduleIndex;
            state.menuIndex = subIndex;
            activeModule.active(state);
        }
    };
    function jump(wantIndex) {
        m_event.type = "menu";
        var isCanTransX = false;
        var isGotoOterPage = false;
        if (wantIndex !== subIndex) {
            isGotoOterPage = true;
            isCanTransX = true;
            subIndex = wantIndex;
            loadPageText(subIndex);
        }
        activeModule.deActive(isGotoOterPage);
        activeModule = moduleData[m_event.type];
        m_event.active({
            menuIndex: subIndex
        });
        activeMenu = p_pageInfo[subIndex];
    }
    //推荐位click埋点
    function sendClickVs(menuIndex, moduleIndex, index) {
        var subData = homeAllData[menuIndex];
        var moduleData = subData.subContent[moduleIndex];
        var edition = "WE3U_" + subData.contentName + '_';
        var eventClickCode = edition + ('00' + moduleIndex).slice(-2) + '_' + ('00' + index).slice(-2);
        $.vs.tj({
            eventclick: eventClickCode,
            gnid: subData.gnid,
            gid: moduleData.categoryId,
            gversion: moduleData.gVersion,
            gtid: moduleData.moduleType,
            gcorder: index
        }, true)
    }
    function upActiveNum() {
        activeNum = moduleData[m_event.type].info.activeNum;
    }
    $.pTool.add("jump", {
        key: "jump",
        dft: true,
        keysDftMap: ["KEY_RETURN"],
        keysMap: {
            KEY_RETURN: function () {
                if (m_event.type == "menu") {
                    if (subIndex == 1) {
                        $.back();
                        return true;
                    } else {
                        loadSections(1)
                        loadSections(0)
                        loadSections(2)
                        jump(1)
                        modules.menu.setTranslateX(0)
                        setTranslateX(subIndex);
                    }
                } else {
                    jump(subIndex);
                    isFirstActive = false;
                }
                return true;
            },
        }
    });
    return {
        key: key,
        keysMap: {
            KEY_DOWN: function () {
                m_event.setKey("down");
                return true;
            },
            KEY_UP: function () {
                m_event.setKey("up");
                return true;
            },
            KEY_LEFT: function () {
                m_event.setKey("left");
                return true;
            },
            KEY_RIGHT: function () {
                m_event.setKey("right");
                return true;
            },
            KEY_OK: function () {
                if (m_event.type !== 'menu' && m_event.type !== 'modulelive') {
                    sendClickVs(subIndex, moduleIndex, activeModule.info.activeNum);
                }
                activeModule.ok();
                return true;
            }
        },
        active: function () {
            m_event.active({
                menuIndex: subIndex,
                moduleIndex: moduleIndex,
                activeNum: activeNum,
                moduleBegin: moduleBegin,
                isFromVol: isFromVol
            });
            isFromVol = false;
        },
        deactive: function () {
            upActiveNum()
        },
        getInfo: function () {
            return {
                subIndex: subIndex,
                moduleIndex: moduleIndex,
                type: m_event.type,
                activeNum: moduleData[m_event.type].info.activeNum,
                moduleBegin: moduleData[m_event.type].info.moduleBegin
            };
        },
        cover: function () {
            return true;
        },
        uncover: function () {
            isFromVol = true;
            return true;
        },
        destroy: function () { },
        init: m_event.init.bind(m_event),
        upHomeData: upHomeData,
        sendClickVs: sendClickVs,
        upActiveNum: upActiveNum
    };
};