$.pTool.add("p_listTj", function() {
    var key = "p_listTj";
    var modules = null;
    var keysMap = {}, activeModule = {}, activeMenu = [], moduleIndex = 0, activeNum = 0;
    var isActive = false;
    var toLeft = function() {};
    var autoLoadImg = function() {};
    var autoPlay = function() {};
    var listTjUp = function() {};
    var m_event = {
        type: "",
        moveOnOff: false,
        id: "",
        shake: function () {
            $("#" + this.id).addClass("public_shake");
        },
        close: function() {
            this.moveOnOff = false;
        },
        crossMove: function(fn) {
            if (this.moveOnOff) {
                fn && fn();
                this.close();
                clearTimeout(this.timer);
            } else {
                this.shake();
                this.moveOnOff = true;
                this.timer = setTimeout(this.close.bind(this), 1e3);
            }
        },
        init: function(opt) {
            if (!modules) {
                modules = opt.modules;
            }
            if (opt.toLeft) {
                toLeft = opt.toLeft;
            }
            if (opt.autoLoadImg) {
                autoLoadImg = opt.autoLoadImg;
            }
            if (opt.autoPlay) {
                autoPlay = opt.autoPlay;
            }
            if (opt.listTjUp) {
                listTjUp = opt.listTjUp;
            }
            activeMenu = [];
            $.UTIL.each(opt.moduleData || [], function(value, index) {
                activeMenu.push("module" + value.moduleType);
            });
            activeNum = opt && $.UTIL.isNumber(+opt.activeNum) ? opt.activeNum : activeNum;
            moduleIndex = opt.moduleIndex;
            this.type = activeMenu[moduleIndex];
            activeModule = modules[this.type];
        },
        active: function(info) {
            info.moduleIndex = moduleIndex;
            activeModule.active(info);
        },
        setKey: function(key) {
            activeModule[key] && this.ob(key, activeModule[key]());
        },
        ob: function(key, state) {
            if (!state) {
                this.close();
                return;
            } else {
                this.id = state.id;
            }
            switch (key) {
              case "up":
                if (moduleIndex === 0) {
                    listTjUp();
                    $.pTool.active("header");
                } else {
                    moduleIndex--;
                    this.swichModule(state);
                    autoLoadImg();
                }
                break;

              case "down":
                if (moduleIndex < activeMenu.length - 1) {
                    moduleIndex++;
                    this.swichModule(state);
                } else {
                    this.shake();
                }
                autoLoadImg();
                break;

              case "left":
                toLeft();
                break;

              case "right":
                this.shake();
                break;
            }
        },
        swichModule: function(state) {
            activeModule.deActive();
            this.type = activeMenu[moduleIndex];
            activeModule = modules[this.type];
            state.moduleIndex = moduleIndex;
            activeModule.active(state);
        }
    };
    return {
        key: key,
        keysMap: {
            KEY_DOWN: function() {
                m_event.setKey("down");
                return true;
            },
            KEY_UP: function() {
                m_event.setKey("up");
                return true;
            },
            KEY_LEFT: function() {
                m_event.setKey("left");
                return true;
            },
            KEY_RIGHT: function() {
                m_event.setKey("right");
                return true;
            },
            KEY_OK: function() {
                activeModule.ok();
                return true;
            }
        },
        active: function() {
            isActive = true;
            m_event.active({
                moduleIndex: moduleIndex,
                activeNum: activeNum
            });
        },
        deactive: function() {
            isActive = false;
            activeNum = modules[m_event.type].info.activeNum;
            
        },
        getInfo: function() {
            return {
                moduleIndex: moduleIndex,
                type: m_event.type,
                activeNum: modules && modules[m_event.type] && modules[m_event.type].info.activeNum || 0,
                isActive: isActive
            };
        },
        cover: function() {
            return true;
        },
        uncover: function() {
            return true;
        },
        destroy: function() {},
        init: m_event.init.bind(m_event)
    };
}());