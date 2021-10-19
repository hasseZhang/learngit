var p_module = function () {
    var key = "p_module";
    var isFromVol = false;
    var moduleData = modules;
    var keysMap = {}, activeModule = {}, activeMenu = [], moduleIndex = 0, moduleBegin = 0, activeNum = 0, subIndex = 1;
    var arr = [], p_pageInfo = [];
    upHomeData();
    (function () {
        top.voice_order.register({
            cover: true,
            action: {
                browseNavigate_open_home: function () {
                    autoJump(2);
                    return true;
                },
                browseNavigate_open_homeWd: function () {
                    autoJump(0);
                    return true;
                },
                browseNavigate_open_homeQb: function () {
                    autoJump(1);
                    return true;
                },
                browseNavigate_open_homeTj: function () {
                    autoJump(2);
                    return true;
                },
                browseNavigate_open_homeZb: function () {
                    autoJump(3);
                    return true;
                },
                browseNavigate_open_homeVip: function () {
                    autoJump(4);
                    return true;
                },
                browseNavigate_open_homeDy: function () {
                    autoJump(5);
                    return true;
                },
                browseNavigate_open_homeDsj: function () {
                    autoJump(6);
                    return true;
                },
                browseNavigate_open_homeZy: function () {
                    autoJump(7);
                    return true;
                },
                browseNavigate_open_homeSe: function () {
                    autoJump(8);
                    return true;
                },
                browseNavigate_open_home4k: function () {
                    autoJump(9);
                    return true;
                },
                browseNavigate_open_homeJlp: function () {
                    autoJump(10);
                    return true;
                },
                browseNavigate_open_homeYy: function () {
                    autoJump(11);
                    return true;
                }
            }
        });
    })();
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
        if (!$('#section' + menuIndex + " .returnTopWraps").length) {
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
            if (isStanded()) {
                loadSections(pageInfo.menuIndex + 1);
                loadSections(pageInfo.menuIndex - 1);
            }
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
                if (key === "down") {
                    activeModule.deActive();
                    moduleIndex = 0;
                    this.type = activeMenu[moduleIndex];
                    activeModule = moduleData[this.type];
                    this.active(state);
                } else if ((key === "left" || key === "right") && state) {
                    subIndex = state.menuIndex;
                    activeMenu = p_pageInfo[subIndex];
                    key === "right" && loadSections(subIndex + 1);
                    key === "left" && loadSections(subIndex - 1);
                    loadPageText(subIndex);
                    autoLoadImg(subIndex);
                    setTranslateX(subIndex);
                    showSubPicScreen(1, true);
                    videoScreen.subPlay();
                    loadChangePage();
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
                        if (moduleIndex === 0 && this.type !== "returnTop") {
                            this.type = "menu";
                            activeModule.deActive();
                            activeModule = moduleData[this.type];
                            state.menuIndex = subIndex;
                            state.from = "section";
                            this.active(state);
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
                            autoLoadImg(subIndex);
                        }
                        break;

                    case "down":
                        if (moduleIndex < activeMenu.length - 1) {
                            moduleIndex++;
                            this.swichModule(state);
                        } else {
                            this.type = "returnTop";
                            activeModule.deActive();
                            activeModule = moduleData[this.type];
                            state.menuIndex = subIndex;
                            this.active(state);
                        }
                        autoLoadImg(subIndex);
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
                                autoLoadImg(subIndex);
                                resetTranslateY(subIndex);
                                loadChangePage();
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
                                autoLoadImg(subIndex);
                                resetTranslateY(subIndex);
                                loadChangePage();
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
            loadChangePage();
            resetTranslateY(subIndex);
        }
        activeModule.deActive(isGotoOterPage);
        activeModule = moduleData[m_event.type];
        m_event.active({
            menuIndex: subIndex
        });
        activeMenu = p_pageInfo[subIndex];
        var saveTranslateY = sectionTransYMap[wantIndex];
        returnToTop(subIndex);
        if (!(!isCanTransX && saveTranslateY == 0)) {
            showSubPicScreen(1);
            videoScreen.subPlay();
        }
        autoHeader(0);
        autoLoadImg(subIndex);
        if (isCanTransX) {
            setTranslateX(subIndex);
        }
    }
    function autoJump(index) {
        if ($.pTool.get("header").getInfo().isActive) {
            moduleIndex = 0;
            activeNum = 0;
            $.pTool.active("p_module");
            jump(index);
        } else {
            if (!(subIndex == index && m_event.type == "menu")) {
                jump(index);
            }
        }
    }
    function regenPage(subIndex) {
        // homeAllData = saveHomeAllData;
        upHomeData();
        createOneSection(subIndex);
        loadPageText(subIndex);
        if (isHasModLf && !$(".moduleliveInfo").length) {
            isHasModLf = false;
            clearTimeout(modules.moduleliveInfo.info.timer);
        }
        loadImg(subIndex);
    }
    //推荐位click埋点
    function sendClickVs(menuIndex, moduleIndex, index) {
        var subData = homeAllData[menuIndex];
        var moduleData = subData.subContent[moduleIndex];
        var edition;
        top.$.linnEdition === "standardEdition" && (edition = 'WE3U_' + subData.contentName + '_');
        top.$.linnEdition === "simplifiedEdition" && (edition = 'SWE3U_首页_');
        top.$.linnEdition === "childrenEdition" && (edition = 'CWE3U_首页_');
        var eventClickCode = edition + ('00' + moduleIndex).slice(-2) + '_' + ('00' + index).slice(-2);
        $.vs.tj({
            eventclick: eventClickCode,
            gnid: subData.gnid,
            gid: moduleData.categoryId,
            gversion: moduleData.gVersion,
            gtid: moduleData.moduleType,
            gcorder: index
        })
    }
    function upActiveNum() {
        activeNum = moduleData[m_event.type].info.activeNum;
    }
    $.pTool.add("jump", {
        key: "jump",
        dft: true,
        keysDftMap: ["KEY_DIBBLING", "KEY_INFORMATION", "KEY_RETURN", "KEY_HOME"],
        keysMap: {
            KEY_DIBBLING: function () {
                if (isStanded()) {
                    loadSections(5);
                    loadSections(6);
                    loadSections(4);
                    autoJump(5);
                }
                return true;
            },
            KEY_INFORMATION: function () {
                if (isStanded()) {
                    loadSections(0);
                    loadSections(1);
                    autoJump(0);
                }
                return true;
            },
            KEY_RETURN: function () {
                if ($.pTool.get("header").getInfo().isActive) {
                    //-top返回
                    moduleIndex = 0;
                    activeNum = 0;
                    $.pTool.active("p_module");
                    jump(subIndex);
                } else {
                    if (m_event.type == "menu") {
                        if (subIndex == 2) {
                            // 推荐-推荐
                            regenPage(subIndex);
                        } else {
                            // -推荐页
                            $('#menu').css({
                                "-webkit-transform": "translateX(0)",
                                "transition": "none"
                            });
                            moduleData.menu.info.translatePosition = 0;
                            loadSections(2)
                            loadSections(1)
                            loadSections(3)
                            jump(2);
                        }
                    } else {
                        jump(subIndex);
                        isFirstActive = false
                    }
                }
                return true;
            },
            KEY_HOME: function () {
                if (subIndex == 2) {
                    regenPage(subIndex);
                }
                if ($.pTool.get("header").getInfo().isActive) {
                    moduleIndex = 0;
                    activeNum = 0;
                    $.pTool.active("p_module");
                    jump(2);
                } else {
                    if (m_event.type == "menu" && subIndex == 2) {
                        return true;
                    } else {
                        returnToTop(subIndex);
                        autoHeader(0);
                        jump(2);
                    }
                }
                return true;
            }
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
                if (m_event.type === "returnTop") {
                    activeModule.deActive();
                    m_event.type = "menu";
                    activeModule.ok();
                    activeModule = moduleData["menu"];
                    activeModule.active({
                        menuIndex: subIndex
                    });
                    autoLoadImg(subIndex);
                } else {
                    if (m_event.type !== 'menu' && m_event.type !== 'modulelive') {
                        sendClickVs(subIndex, moduleIndex, activeModule.info.activeNum);
                    }
                    activeModule.ok();
                }
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
            // activeNum = moduleData[m_event.type].info.activeNum;
            upActiveNum()
        },
        getInfo: function () {
            return {
                subIndex: subIndex,
                moduleIndex: moduleIndex,
                type: m_event.type,
                activeNum: moduleData[m_event.type] && moduleData[m_event.type].info.activeNum,
                moduleBegin:  moduleData[m_event.type] && moduleData[m_event.type].info.moduleBegin,
                sizePlayIndex:  moduleData[m_event.type] && moduleData[m_event.type].info.sizePlayIndex
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
        upActiveNum: upActiveNumx
    };
};