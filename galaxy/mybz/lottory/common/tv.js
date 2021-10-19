! function (t) {
  if (!t) throw new Error("no Array class");
  t.isArray || (t.isArray = function (t) {
    return "[object Array]" === Object.prototype.toString.call(t)
  }), t.prototype.indexOf || Object.defineProperty(t.prototype, "indexOf", {
    value: function (t, e) {
      if (!this) throw new TypeError('"this" is null or not defined');
      e ? e < 0 && (e = Math.max(0, this.length + e)) : e = 0;
      for (var r = e; r < this.length; r++)
        if (this[r] === t) return r;
      return -1
    },
    writable: !1,
    enumerable: !1
  }), t.prototype.lastIndexOf || Object.defineProperty(t.prototype, "lastIndexOf", {
    value: function (t, e) {
      if (!this) throw new TypeError('"this" is null or not defined');
      e ? e < 0 && (e = Math.max(0, this.length + e)) : e = this.length - 1;
      for (var r = e; r >= 0; r--)
        if (this[r] === t) return r;
      return -1
    },
    writable: !1,
    enumerable: !1
  }), t.prototype.forEach || Object.defineProperty(t.prototype, "forEach", {
    value: function (t) {
      if (!this) throw new TypeError('"this" is null or not defined');
      var e = this.length;
      if ("function" != typeof t) throw new TypeError;
      for (var r = arguments[1], n = 0; n < e; n++) n in this && t.call(r, this[n], n, this)
    },
    writable: !1,
    enumerable: !1
  }), t.prototype.filter || Object.defineProperty(t.prototype, "filter", {
    value: function (t) {
      if (!this) throw new TypeError('"this" is null or not defined');
      var e = this.length;
      if ("function" != typeof t) throw new TypeError;
      for (var r = [], n = arguments[1], i = 0; i < e; i++)
        if (i in this) {
          var o = this[i];
          t.call(n, o, i, this) && r.push(o)
        } return r
    },
    writable: !1,
    enumerable: !1
  }), t.prototype.some || Object.defineProperty(t.prototype, "some", {
    value: function (t) {
      if (!this) throw new TypeError('"this" is null or not defined');
      var e = this.length;
      if ("function" != typeof t) throw new TypeError;
      for (var r = arguments[1], n = 0; n < e; n++)
        if (n in this && t.call(r, this[n], n, this)) return !0;
      return !1
    },
    writable: !1,
    enumerable: !1
  }), t.prototype.map || Object.defineProperty(t.prototype, "map", {
    value: function (e) {
      if (!this) throw new TypeError('"this" is null or not defined');
      var r = this.length;
      if ("function" != typeof e) throw new TypeError;
      for (var n = new t(r), i = arguments[1], o = 0; o < r; o++) o in this && (n[o] = e.call(i, this[o], o, this));
      return n
    },
    writable: !1,
    enumerable: !1
  }), t.prototype.every || Object.defineProperty(t.prototype, "every", {
    value: function (t) {
      if (!this) throw new TypeError('"this" is null or not defined');
      var e = this.length;
      if ("function" != typeof t) throw new TypeError;
      for (var r = arguments[1], n = 0; n < e; n++)
        if (n in this && !t.call(r, this[n], n, this)) return !1;
      return !0
    },
    writable: !1,
    enumerable: !1
  }), t.prototype.reduce || Object.defineProperty(t.prototype, "reduce", {
    value: function (t) {
      if (!this) throw new TypeError('"this" is null or not defined');
      var e, r = this.length || 0;
      if ("function" != typeof t) throw new TypeError;
      if (0 === r && 1 === arguments.length) throw new TypeError;
      var n = 0;
      if (arguments.length >= 2) e = arguments[1];
      else
        for (;;) {
          if (n in this) {
            e = this[n++];
            break
          }
          if (++n >= r) throw new TypeError
        }
      for (; n < r; n++) n in this && (e = t.call(null, e, this[n], n, this));
      return e
    },
    writable: !1,
    enumerable: !1
  }), t.prototype.reduceRight || Object.defineProperty(t.prototype, "reduceRight", {
    value: function (t) {
      if (!this) throw new TypeError('"this" is null or not defined');
      var e = this.length || 0;
      if ("function" != typeof t) throw new TypeError;
      if (0 === e && 1 === arguments.length) throw new TypeError;
      var r, n = e - 1;
      if (arguments.length >= 2) r = arguments[1];
      else
        for (;;) {
          if (n in this) {
            r = this[n--];
            break
          }
          if (--n < 0) throw new TypeError
        }
      for (; n >= 0; n--) n in this && (r = t.call(null, r, this[n], n, this));
      return r
    },
    writable: !1,
    enumerable: !1
  }), t.prototype.replace || Object.defineProperty(t.prototype, "replace", {
    value: function (t, e) {
      if (!this) throw new TypeError('"this" is null or not defined');
      var r;
      for (r = 0; r < this.length; r++)
        if (this[r] === t) return this[r] = e, !0;
      return !1
    },
    writable: !1,
    enumerable: !1
  }), t.prototype.insert || Object.defineProperty(t.prototype, "insert", {
    value: function (t, e) {
      if (!this) throw new TypeError('"this" is null or not defined');
      var r = this.slice(0, t),
        n = this.slice(t);
      return r.push(e), r.concat(n)
    },
    writable: !1,
    enumerable: !1
  }), t.prototype.find || Object.defineProperty(t.prototype, "find", {
    value: function (t) {
      if (null == this) throw new TypeError('"this" is null or not defined');
      var e = Object(this),
        r = e.length >>> 0;
      if ("function" != typeof t) throw new TypeError("predicate must be a function");
      for (var n = arguments[1], i = 0; i < r;) {
        var o = e[i];
        if (t.call(n, o, i, e)) return o;
        i++
      }
    },
    writable: !1,
    enumerable: !1
  }), t.prototype.findIndex || Object.defineProperty(t.prototype, "findIndex", {
    value: function (t) {
      if (null == this) throw new TypeError('"this" is null or not defined');
      var e = Object(this),
        r = e.length >>> 0;
      if ("function" != typeof t) throw new TypeError("predicate must be a function");
      for (var n = arguments[1], i = 0; i < r;) {
        var o = e[i];
        if (t.call(n, o, i, e)) return i;
        i++
      }
      return -1
    },
    writable: !1,
    enumerable: !1
  }), t.bubbleSort || (t.bubbleSort = function (t) {
    if (!this) throw new TypeError('"this" is null or not defined');
    t = t || function (t, e) {
      return t - e
    };
    for (var e, r, n = this.length, i = 0; i < n - 1; i++) {
      r = !1;
      for (var o = n - 1; o > i; o--) t(this[o], this[o - 1]) < 0 && (r = !0, e = this[o - 1], this[o - 1] = this[o], this[o] = e);
      if (!r) break
    }
    return this
  }), t.binarySearch || (t.binarySearch = function (t, e) {
    if (!this) throw new TypeError('"this" is null or not defined');
    for (var r = 0, n = this.length, i = Math.floor(this.length / 2); n !== i;) e(t, this[i]) > 0 ? r = i + 1 : n = i, i = Math.floor((r + n) / 2);
    return i
  }), t.prototype.includes || Object.defineProperty(t.prototype, "includes", {
    value: function (t) {
      if (!this) throw new TypeError('"this" is null or not defined');
      return this.indexOf(t) > -1
    },
    writable: !1,
    enumerable: !1
  }), t.uniquelize || (t.uniquelize = function () {
    if (!this) throw new TypeError('"this" is null or not defined');
    for (var t = [], e = 0, r = this.length; e < r; e++) t.includes(this[e]) || t.push(this[e]);
    return t
  }), t.intersect || (t.intersect = function (t, e) {
    for (var r = [], n = 0, i = t.length; n < i; n++) e.includes(t[n]) && r.push(t[n]);
    return r
  }), t.minus || (t.minus = function (t, e) {
    for (var r = [], n = 0, i = t.length; n < i; n++) e.includes(t[n]) || r.push(t[n]);
    return r
  }), t.union || (t.union = function (e, r) {
    return t.uniquelize.call(e.concat(r))
  }), t.prototype.fill || Object.defineProperty(t.prototype, "fill", {
    value: function (t) {
      if (null == this) throw new TypeError("this is null or not defined");
      for (var e = Object(this), r = e.length >>> 0, n = arguments[1] >> 0, i = n < 0 ? Math.max(r + n, 0) : Math.min(n, r), o = arguments[2], l = void 0 === o ? r : o >> 0, a = l < 0 ? Math.max(r + l, 0) : Math.min(l, r); i < a;) e[i] = t, i++;
      return e
    }
  })
}(Array),
function (t) {
  if (!t) throw new Error("no Date class");
  t.prototype.format || Object.defineProperty(t.prototype, "format", {
    value: function (t) {
      var e = this.getFullYear(),
        r = ("0" + (this.getMonth() + 1)).slice(-2),
        n = ("0" + this.getDate()).slice(-2),
        i = ("0" + this.getHours()).slice(-2),
        o = ("0" + this.getMinutes()).slice(-2),
        l = ("0" + this.getSeconds()).slice(-2),
        a = "星期" + ["日", "一", "二", "三", "四", "五", "六"][this.getDay()],
        s = this.getMilliseconds();
      return t.replace("yyyy", e).replace("MM", r).replace("dd", n).replace("hh", i).replace("mm", o).replace("ss", l).replace("S", s).replace("week", a)
    },
    writable: !1,
    enumerable: !1
  }), t.prototype.add || Object.defineProperty(t.prototype, "add", {
    value: function (t, e) {
      return this["set" + (e = {
        ms: "Milliseconds",
        t: "Time",
        s: "Seconds",
        m: "Minutes",
        h: "Hours",
        d: "Date",
        M: "Month",
        y: "FullYear"
      } [e || "d"])](this["get" + e]() + t), this
    },
    writable: !1,
    enumerable: !1
  }), t.getMsec || (t.getMsec = function (e) {
    return new t(("" + e).replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, "$1/$2/$3 $4:$5:$6")).getTime()
  });
  var e = t.parse;
  t.parse = function (t) {
    return t = String.isString(t) ? t.replace(/-/g, "/") : t, e(t)
  }
}(Date),
function (t) {
  t.prototype.bind || Object.defineProperty(t.prototype, "bind", {
    value: function (t) {
      return function (e) {
        var r = this;
        if (1 < arguments.length) {
          var n = t.call(arguments, 1);
          return function () {
            return r.apply(e, arguments.length ? n.concat(t.call(arguments)) : n)
          }
        }
        return function () {
          return arguments.length ? r.apply(e, arguments) : r.call(e)
        }
      }
    }(Array.prototype.slice),
    writable: !1,
    enumerable: !1
  })
}(Function),
function (t) {
  if (!t) throw new Error("no Number class");
  t.isNumber || (t.isNumber = function (e) {
    return (0 === e || !!e) && e.constructor === t
  }), t.isDigits || (t.isDigits = function (e) {
    return t.isNumber(e) && isFinite(e) && Math.floor(e) === e
  }), t.isDecimal || (t.isDecimal = function (t) {
    return /^[1-9]?[0-9]*\.[0-9]*$/.test(t)
  }), t.format = function (t, e) {
    for (var r = t ? t.toString().split(".") : ["0"], n = e ? e.split(".") : [""], i = "", o = r[0], l = n[0], a = o.length - 1, s = !1, u = l.length - 1; u >= 0; u--) switch (l.substr(u, 1)) {
      case "":
        a >= 0 && (i = o.substr(a--, 1) + i);
        break;
      case "0":
        i = a >= 0 ? o.substr(a--, 1) + i : "0" + i;
        break;
      case ",":
        s = !0, i = "," + i
    }
    if (a >= 0)
      if (s)
        for (var c = o.length; a >= 0; a--) i = o.substr(a, 1) + i, a > 0 && (c - a) % 3 == 0 && (i = "," + i);
      else i = o.substr(0, a + 1) + i;
    i += ".", o = r.length > 1 ? r[1] : "", l = n.length > 1 ? n[1] : "", a = 0;
    for (u = 0; u < l.length; u++) switch (l.substr(u, 1)) {
      case "":
        a < o.length && (i += o.substr(a++, 1));
        break;
      case "0":
        a < o.length ? i += o.substr(a++, 1) : i += "0"
    }
    return i.replace(/^,+/, "").replace(/\.$/, "")
  }
}(Number);
var _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (t) {
  return typeof t
} : function (t) {
  return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
};
! function (t) {
  var e, r, n, i, o;
  if (!t) throw new Error("no Object class");
  t.isObject || (t.isObject = function (e) {
    return !!e && (e.constructor === t || "[object Object]" === t.prototype.toString.call(e))
  }), "function" != typeof t.assign && (t.assign = function (e, r) {
    if (null === e) throw new TypeError("Cannot convert undefined or null to object");
    for (var n = t(e), i = 1; i < arguments.length; i++) {
      var o = arguments[i];
      if (null !== o)
        for (var l in o) t.prototype.hasOwnProperty.call(o, l) && (n[l] = o[l])
    }
    return n
  }), "function" != typeof t.is && t.defineProperty(t.prototype, "is", {
    value: function (t, e) {
      return t === e ? 0 !== t || 1 / t == 1 / e : t != t && e != e
    },
    writable: !1,
    enumerable: !1
  }), "function" != typeof t.create && (t.create = (e = function () {}, function (r, n) {
    if (r !== t(r) && null !== r) throw TypeError("Argument must be an object, or null");
    e.prototype = r || {};
    var i = new e;
    return e.prototype = null, void 0 !== n && t.defineProperties(i, n), null === r && (i.__proto__ = null), i
  })), t.keys || (t.keys = (r = t.prototype.hasOwnProperty, n = !{
    toString: null
  }.propertyIsEnumerable("toString"), o = (i = ["toString", "toLocaleString", "valueOf", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "constructor"]).length, function (t) {
    if ("object" !== (void 0 === t ? "undefined" : _typeof(t)) && ("function" != typeof t || null === t)) throw new TypeError("Object.keys called on non-object");
    var e, l, a = [];
    for (e in t) r.call(t, e) && a.push(e);
    if (n)
      for (l = 0; l < o; l++) r.call(t, i[l]) && a.push(i[l]);
    return a
  }));
  var l, a = Function.bind.call(Function.call, Array.prototype.reduce),
    s = Function.bind.call(Function.call, t.prototype.propertyIsEnumerable),
    u = Function.bind.call(Function.call, Array.prototype.concat);
  l = Reflect ? Reflect.ownKeys : function (e) {
    var r = [];
    if ("[object Object]" !== t.prototype.toString.call(e)) throw new TypeError("ILLEGAL ARGUMENTS ERROR!");
    for (var n in e) e.hasOwnProperty(n) && r.push(n);
    return r
  }, t.values || (t.values = function (t) {
    return a(l(t), function (e, r) {
      return u(e, "string" == typeof r && s(t, r) ? [t[r]] : [])
    }, [])
  }), t.entries || (t.entries = function (t) {
    return a(l(t), function (e, r) {
      return u(e, "string" == typeof r && s(t, r) ? [
        [r, t[r]]
      ] : [])
    }, [])
  }), t.getPrototypeOf || (t.getPrototypeOf = function (e) {
    if ((void 0 === e ? "undefined" : _typeof(e)) !== t) throw new TypeError("Typeof Error");
    return e.prototype
  }), t.reflector || (t.reflector = function (t, e) {
    var r = t;
    for (var n in r)
      if (r[n] === e) return n
  }), t.O2S || (t.O2S = function (e) {
    var r = [],
      n = "",
      i = function (e) {
        var r = t.prototype.toString.call(e).slice(8, -1);
        return /global/.test(r) && (r = void 0 === e ? "Undefined" : "Null"), /DOMWindow/.test(r) && (r = void 0 === e ? "Undefined" : "Null"), r
      }(e);
    if ("String" == i) {
      var o = e.match(/^(object|undefined|null|false|true|function|string)$/i);
      o && (e = '"' + o[0] + '"'), "" == e && (e = '""'), n = '"' + e + '"'
    }
    if ("Null" == i && (n = "null"), "Undefined" == i && (n = "undefined"), ("Date" == i || navigator.appCodeName.indexOf("iPanel") > 0 && e instanceof Date) && (n = "new Date(" + e.getTime() + ")"), ("Boolean" == i || "Number" == i || "RegExp" == i || "Function" == i || /^HTML/.test(i)) && (n = e.toString()), "Array" == i) {
      for (var l = 0; l < e.length; l++) r.push(t.O2S(e[l]));
      n = "[" + r.join(",") + "]"
    }
    if ("Object" == i) {
      for (var a in e) e.hasOwnProperty(a) && r.push('"' + a + '":' + t.O2S(e[a]));
      n = "{" + r.join(",") + "}"
    }
    return n
  })
}(Object),
function (t) {
  if (!t) throw new Error("no String class");
  t.isString || (t.isString = function (e) {
    return ("" === e || !!e) && e.constructor === t
  }), t.prototype.trim || Object.defineProperty(t.prototype, "trim", {
    value: function () {
      return this.replace(/^\s+|\s+$/g, "")
    },
    writable: !1,
    enumerable: !1
  }), t.prototype.includes || Object.defineProperty(t.prototype, "includes", {
    value: function (t, e) {
      return "number" != typeof e && (e = 0), !(e + t.length > this.length) && -1 !== this.indexOf(t, e)
    },
    writable: !1,
    enumerable: !1
  }), t.prototype.startsWith || Object.defineProperty(t.prototype, "startsWith", {
    value: function (t, e) {
      return "number" != typeof e && (e = 0), this.slice(e, t.length) === t
    },
    writable: !1,
    enumerable: !1
  }), t.prototype.endsWith || Object.defineProperty(t.prototype, "endsWith", {
    value: function (t, e) {
      return "number" != typeof e && (e = this.length), this.substring(0, e).slice(-t.length, e) === t
    },
    writable: !1,
    enumerable: !1
  }), t.prototype.repeat || Object.defineProperty(t.prototype, "repeat", {
    value: function (t) {
      if (null === this) throw new TypeError("can't convert " + this + " to object");
      var e = "" + this;
      if ((t = +t) != t && (t = 0), t < 0) throw new RangeError("repeat count must be non-negative");
      if (t === 1 / 0) throw new RangeError("repeat count must be less than infinity");
      if (t = Math.floor(t), 0 === e.length || 0 === t) return "";
      if (e.length * t >= 1 << 28) throw new RangeError("repeat count must not overflow maximum string size");
      for (var r = ""; 1 == (1 & t) && (r += e), 0 !== (t >>>= 1);) e += e;
      return r
    },
    writable: !1,
    enumerable: !1
  });
  var e = function (t) {
    var e = Number.MAX_SAFE_INTEGER || Math.pow(2, 53) - 1,
      r = Number(t);
    return Number.isNaN(r) || r < 0 ? 0 : r > e ? e : r
  };
  t.prototype.pad || Object.defineProperty(t.prototype, "pad", {
    value: function (t, r, n) {
      if (null == this) throw new TypeError('"this" value must not be null or undefined');
      var i = this.toString(),
        o = e(t),
        l = e(i.length);
      if (o <= l) return this;
      if ("" === (n = void 0 === n ? " " : n.toString())) return this;
      for (var a = o - l; n.length < a;) {
        var s = n.length,
          u = a - s;
        n += s > u ? n.slice(0, u) : n
      }
      var c = n.slice(0, a);
      return "R" === r ? i + c : c + i
    },
    writable: !1,
    enumerable: !1
  }), t.prototype.padEnd || Object.defineProperty(t.prototype, "padEnd", {
    value: function (e, r) {
      return e >>= 0, r = t(void 0 !== r ? r : ""), this.length > e ? t(this) : ((e -= this.length) > r.length && (r += r.repeat(e / r.length)), t(this) + r.slice(0, e))
    },
    writable: !1,
    enumerable: !1
  }), t.prototype.padStart || Object.defineProperty(t.prototype, "padStart", {
    value: function (e, r) {
      return e >>= 0, r = t(void 0 !== r ? r : " "), this.length > e ? t(this) : ((e -= this.length) > r.length && (r += r.repeat(e / r.length)), r.slice(0, e) + t(this))
    },
    writable: !1,
    enumerable: !1
  })
}(String),
function (t) {
  function e(t, r) {
    if (!t) return this.length = 0, this;
    if (t instanceof e) return t;
    var n = [];
    "String" == e.util.type(t) && (n = /^</.test(t) ? e.init.create(t) : e.init.query(t, r)), /(^HTML)|NodeList|Array/.test(e.util.type(t)) && (n = e.init.element(t, r));
    for (var i = 0; i < n.length; i++) this[i] = n[i];
    this.length = n.length;
    var o = this[0] && this[0].id;
    return o && (e.epgEvent[o] && e.util.map(e.epgEvent[o], function (t, e) {
      this[e] = t
    }, this), e.data[o] && (this.data = e.data[o]), e.activeEl[o] && (this.activeEl = e.activeEl[o])), this
  }
  e.util = {
    type: function (t) {
      var e = Object.prototype.toString.call(t).slice(8, -1);
      return /global/.test(e) && (e = void 0 === t ? "Undefined" : "Null"), /DOMWindow/.test(e) && (e = void 0 === t ? "Undefined" : "Null"), e
    },
    map: function (t, e, r) {
      for (var n in t) t.hasOwnProperty(n) && e.apply(r || t, [t[n], n])
    },
    isNative: function (t) {
      return /\[native code\]/.test(Object.toString.call(t))
    },
    toArray: function (t) {
      return Array.prototype.slice.call(t)
    },
    dom2Array: function (t) {
      return t = 1 == t.nodeType || 9 == t.nodeType ? [t] : e.util.toArray(t)
    },
    getQueryString: function (t) {
      for (var e = [], r = this, n = t.id && "#" + t.id || t.className.replace(/\s*(\w+)\s*/g, ".$1") || t.tagName.toLocaleLowerCase(); e.unshift(n) && r.parentElement !== document.body && (r = r.parentElement););
      return e.join(" ")
    },
    outerHTML: function (t) {
      if (t.nodeType && 9 == t.nodeType) return "document";
      var e = "";
      if (t.outerHTML) e = t.outerHTML.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "");
      else {
        var r = document.createElement("div");
        r.appendChild(t), e = r.innerHTML.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "")
      }
      return e
    },
    cloneNode: function (t) {
      if ("Function" == e.util.type(t.cloneNode)) return t.cloneNode(!0);
      var r = e.util.outerHTML(t);
      return new e(r)[0]
    },
    dereplicate: function (t) {
      if (!t.length) return [];
      for (var e = [t[0]], r = 1; r < t.length; r++) {
        for (var n = !1, i = 0; i < e.length; i++)
          if (t[r] == e[i]) {
            n = !0;
            break
          }! n && e.push(t[r])
      }
      return e
    }
  }, e.init = {
    create: function (t) {
      var e = t.replace(/^<[^>]+>/, "").replace(/<\/?\w+>$/, ""),
        r = t.replace(e, "").replace(/^</, "").replace(/>(.*<\/?\w+>)?$/, "").split(" "),
        n = document.createElement(r.shift());
      if (n.innerHTML = e, r.length) {
        var i = (document.createDocumentFragment ? document.createDocumentFragment() : document.createElement("div")).appendChild(document.createElement("div"));
        i.innerHTML = t, i = i.lastChild;
        for (var o = 0; o < r.length; o++) {
          var l = r[o].match(/^[^=]+/) && r[o].match(/^[^=]+/)[0];
          if (l && "Null" != $$.getType(i.getAttribute(l))) {
            var a = i.getAttribute(l);
            n.setAttribute(l, a)
          }
        }
      }
      return [n]
    },
    query: function (t, r) {
      return e.util.dom2Array(e.findByQueryString(t, r))
    },
    element: function (t, r) {
      return e.util.dom2Array(t, r)
    }
  }, e._querySelectorAll = function (t, r) {
    var n = t.replace(/^\s+/, "").replace(/\s+/g, " ").split(" "),
      i = [];
    return function (t, r) {
      r = e.util.dom2Array(r || document);
      if (!n[t]) return i = i.concat(r);
      for (var o = n[t], l = o.match(/(?:#([\w-]+))/) && o.match(/(?:#([\w-]+))/)[1], a = o.match(/(\.[\w-]+)/g) && o.match(/(\.[\w-]+)/g).join(" ").replace(/\./g, ""), s = !/#|\./.test(o) && o, u = 0; u < r.length; u++) o = l && document.getElementById(l) || a && r[u].getElementsByClassName(a) || s && r[u].getElementsByTagName(s), arguments.callee.call(null, t + 1, o)
    }(0, r), i
  }, e.findByQueryString = function (t, r) {
    var n, i, o, l;
    if (_selector = t.match(/^(?:#([\w-]+)|\.([\w-]+)|(\w+))$/), r = r || document, _selector && _selector[1] && (n = "id", i = r === document ? document.getElementById(_selector[1]) : document.getElementById(_selector[1]) && e.findByElements(document.getElementById(_selector[1]), r) || []), _selector && _selector[2] && (n = "class", i = r === document ? document.getElementsByClassName(_selector[2]) : document.getElementsByClassName(_selector[2]) && e.findByElements(document.getElementsByClassName(_selector[2]), r) || []), _selector && _selector[3] && (n = "tagName", i = r === document ? document.getElementsByTagName(_selector[3]) : document.getElementsByTagName(_selector[3]) && e.findByElements(document.getElementsByTagName(_selector[3]), r) || []), !n)
      if (/:not/.test(t)) {
        o = (a = t.split(":not"))[0].replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "") || "*", l = a[1].replace(/^\(|\)$/g, "").replace(/\s+/g, " ").replace(/^\s+|\s+$/g, ""), i = r.querySelectorAll ? r.querySelectorAll(o) : e._querySelectorAll(o, r), i = e.filtByPostfix.not.call(i, l, o)
      } else {
        if (/:|\[/.test(t)) {
          /^(:|\[)/.test(t) && (t = "*" + t);
          var a = t.match(/([^:\[]*)((?::|\[).+)/);
          t = a[1], l = a[2], /\s$/.test(t) && (t += "*")
        }
        if (i = r.querySelectorAll ? r.querySelectorAll(t) : e._querySelectorAll(t, r), l) return e.filter(i, l)
      } return "document" == t && (i = document), "Null" == e.util.type(i) && (i = []), e.util.dom2Array(i)
  }, e.findByElements = function (t, r) {
    t = 1 == t.nodeType ? [t] : e.util.toArray(t);
    for (var n = e.util.toArray(r.getElementsByTagName("*")), i = [], o = 0; o < n.length; o++)
      for (var l = 0; l < t.length; l++) n[o] == t[l] && (i.push(n[o]), n[o] = null);
    return i
  }, e.filter = function (t, r) {
    var n, i, o = attr = r;
    if ((i = r.match(/^(:[^\[]+)(\[.+)$/)) && (o = i[1], attr = i[2]), /^:/.test(o) && ((n = o.match(/^(?::)(first|last|(eq|gt|lt)\((-?\d+)\))$/)) && n[2] && n[3] && (t = e.filtByPostfix[n[2]].call(t, n[3])), !n || n[2] || n[3] || (t = e.filtByPostfix[n[1]].call(t))), /^\[/.test(attr)) {
      (n = attr.replace(/^\[|\]$/g, "").match(/([\w-]+)(!|\^|\$|\*)?(?:=)?([\w-\/\.]+)?/))[2] || n[3] || (n[2] = "all"), !n[2] && n[3] && (n[2] = "=");
      var l = n[1],
        a = n[2],
        s = n[3] && n[3].replace(/'|"/g, "");
      t = e.filtByAttr(t, l, a, s)
    }
    return t
  }, e.filtByAttr = function (t, e, r, n) {
    for (var i = [], o = 0; o < t.length; o++) {
      var l, a = t[o].getAttribute(e);
      switch (r) {
        case "=":
          l = n == a && !0;
          break;
        case "!":
          l = n != a && !0;
          break;
        case "^":
          l = new RegExp("^" + n).test(a);
          break;
        case "$":
          l = new RegExp(n + "$").test(a);
          break;
        case "*":
          l = new RegExp(n).test(a);
          break;
        case "all":
          l = "String" == $$.getType(a) && !0
      }
      l && i.push(t[o])
    }
    return i
  }, e.each = function (t) {
    for (var e = 0; e < this.length; e++) t.call(this[e], e);
    return this
  }, e.filtByPostfix = {
    first: function () {
      return new e(this[0])
    },
    last: function () {
      return new e(this[this.length - 1])
    },
    eq: function (t) {
      return new e(this[t])
    },
    gt: function (t) {
      return new e(e.util.toArray(this).slice(+t + 1))
    },
    lt: function (t) {
      return new e(e.util.toArray(this).slice(0, +t + 1))
    },
    prev: function (t) {
      return new e(e.util.dom2Array(this.prevAll(t)).slice(-1))
    },
    next: function (t) {
      return new e(e.util.dom2Array(this.nextAll(t)).slice(0, 1))
    },
    prevAll: function (t) {
      var r = [];
      return t = t || "*", e.each.call(this, function () {
        for (var n = 0, i = this, o = []; i.previousElementSibling && (i = i.previousElementSibling) && (n += 1););
        var l = e.util.dom2Array(new e(this.parentElement).children("*")).slice(0, n),
          a = e.util.dom2Array(new e(this.parentElement).children(t));
        e.util.map(l, function (t, r) {
          e.util.map(a, function (e) {
            t == e && (o.push(t), t[r] = null)
          })
        }), r = r.concat(o)
      }), new e(r)
    },
    nextAll: function (t) {
      var r = [];
      return t = t || "*", e.each.call(this, function () {
        for (var n = 1, i = this, o = []; i.previousElementSibling && (i = i.previousElementSibling) && (n += 1););
        var l = e.util.dom2Array(new e(this.parentElement).children("*")).slice(n),
          a = e.util.dom2Array(new e(this.parentElement).children(t));
        e.util.map(l, function (t, r) {
          e.util.map(a, function (e) {
            t == e && (o.push(t), t[r] = null)
          })
        }), r = r.concat(o)
      }), new e(r)
    },
    not: function (t, r) {
      var n = e.util.toArray(this);
      if ("String" == e.util.type(t)) {
        /^(:|\[)/.test(t) && (t = r ? r + t : "*" + t);
        var i = t.match(/^([^:\[]*)([:\[].*)?$/),
          o = i[1],
          l = i[2]
      }
      for (var a = 0; a < n.length; a++) {
        var s = n[a];
        if (s) {
          if ("String" == e.util.type(t)) {
            if ("String" == e.util.type(o)) {
              var u = s.parentElement || document;
              s = e.findByQueryString(o, u)
            }
            "String" == e.util.type(l) && (s = e.util.toArray(e.filter(s, l)))
          }
          /(^HTML)|NodeList|Array/.test(e.util.type(t)) && (s = e.util.dom2Array(t)), e.util.map(s, function (t) {
            e.util.map(n, function (e, r) {
              t == e && (n[r] = null)
            })
          })
        }
      }
      for (a = 0; a < n.length; a++) null == n[a] && (n.splice(a, 1), a--);
      return new e(n)
    }
  }, e.dealDom = function (t, r, n, i) {
    var o = e.util.type(n),
      l = e.util.type(i);
    if ("Object" !== o) {
      if ("Function" === e.util.type(r))
        for (var a = 0; a < t.length; a++) {
          if ("String" == o && /String|Number/.test(l) && r(t[a], n, i), /String|Number|Boolean/.test(o) && "Undefined" == l && r(t[a], n), "String" == o && "Function" == l) {
            var s = r(t[a], n);
            i.call(t[a], a, s)
          }
          if ("Function" == o) {
            var u = arguments.callee.caller.flag;
            s = t[a][u];
            e.util.isNative(n) ? r(t[a], n) : n.call(t[a], a, s)
          }
        }
    } else
      for (a in n) e.dealDom(t, r, a, n[a])
  }, e.prototype = {
    constructor: e,
    find: function (t) {
      "Undefined" == e.util.type(t) && (t = "*");
      for (var r = [], n = 0; n < this.length; n++) {
        if (t instanceof e || /(^HTML)|NodeList|Array/.test(e.util.type(t))) {
          var i = e.findByElements(t, this[n]);
          r = r.concat(i)
        }
        if ("String" == e.util.type(t)) {
          i = e.findByQueryString(t, this[n]);
          r = r.concat(e.util.toArray(i))
        }
      }
      return new e(e.util.dereplicate(r))
    },
    children: function (t) {
      "Undefined" == e.util.type(t) && (t = "*");
      for (var r = [], n = this, i = 0; i < n.length; i++) {
        var o = n[i].children && e.util.dom2Array(n[i].children),
          l = [];
        if ("Undefined" == e.util.type(o) && (o = [], e.util.map(n[i].childNodes, function (t) {
            1 == t.nodeType && o.push(t)
          })), t instanceof e || /(^HTML)|NodeList|Array/.test(e.util.type(t))) var a = e.findByElements(t, n[i]);
        if ("String" == e.util.type(t)) a = e.findByQueryString(t, n[i]);
        e.util.map(a, function (t) {
          (t.parentElement || t.parentNode) == n[i] && l.push(t)
        }), r = r.concat(l)
      }
      return new e(r)
    },
    parent: function (t) {
      return new e(this[0].parentElement)
    },
    css: function (t, r) {
      return e.dealDom(this, function (t, e, r) {
        if (arguments.length <= 2) return window.getComputedStyle ? "" + getComputedStyle(t, null)[e] : "" + t.style[e];
        t.style[e] = r
      }, t, r), "String" == e.util.type(t) && 1 == arguments.length ? window.getComputedStyle ? "" + getComputedStyle(this[0], null)[t] : "" + this[0].style[t] : this
    },
    attr: function (t, r) {
      return e.dealDom(this, function (t, e, r) {
        if (arguments.length <= 2) return t.getAttribute(e) || "";
        t.setAttribute(e, r)
      }, t, r), "String" == e.util.type(t) && 1 == arguments.length ? this[0].getAttribute(t) : this
    },
    html: function (t) {
      !arguments.callee.flag && (arguments.callee.flag = "innerHTML");
      return e.dealDom(this, function (t, e) {
        if (arguments.length <= 1) return t.innerHTML;
        t.innerHTML = e
      }, t), arguments.length ? this : this[0].innerHTML
    },
    text: function (t) {
      !arguments.callee.flag && (arguments.callee.flag = "innerText");
      return e.dealDom(this, function (t, e) {
        if (arguments.length <= 1) return t.innerText;
        t.innerText = e
      }, t), arguments.length ? this : this[0].innerText
    },
    addClass: function (t) {
      !arguments.callee.flag && (arguments.callee.flag = "className");
      return e.dealDom(this, function (t, e) {
        if (arguments.length <= 1) return t.className || "";
        new RegExp("\\b" + e + "\\b").test(t.className) || (t.className = (t.className + " " + e).replace(/\s+/g, " ").replace(/^\s+|\s+$/g, ""))
      }, t), this
    },
    removeClass: function (t) {
      !arguments.callee.flag && (arguments.callee.flag = "className"), !t && (t = "*");
      return e.dealDom(this, function (t, e) {
        if ("*" == e) return t.className = "";
        var r = new RegExp("\\b" + e + "\\b");
        r.test(t.className) && (t.className = t.className.replace(r, "").replace(/\s+/g, " ").replace(/^\s+|\s+$/g, ""))
      }, t), this
    },
    offset: function (t) {
      var e = (e = t.match(/left|top|width|height/)) && "offset" + e[0].replace(/^./, e[0][0].toUpperCase()) || "";
      return this[0][e] || 0
    },
    client: function (t) {
      var e = (e = t.match(/left|top|width|height/)) && "client" + e[0].replace(/^./, e[0][0].toUpperCase()) || "";
      return this[0][e] || 0
    },
    appendTo: function (t) {
      t = new e(t || document.body);
      var r = this[0],
        n = [];
      return 1 == t.length ? (t[0].appendChild(r), n.push(r)) : ($$(e.util.getQueryString(r)).each(function () {
        r == this && (r.parentElement || document.body).removeChild(r)
      }), t.each(function () {
        var t = e.util.cloneNode(r);
        this.appendChild(t), n.push(t)
      })), new e(n)
    },
    insertTo: function (t, r) {
      t = new e(t || document.body);
      var n = this[0],
        i = [];
      return 1 == t.length ? (r = r && new e(r)[0] || t[0].firstElementChild, t[0].insertBefore(n, r), i.push(n)) : ($$(e.util.getQueryString(n)).each(function () {
        n == this && (n.parentElement || document.body).removeChild(n)
      }), t.each(function () {
        var t = e.util.cloneNode(n);
        r = r && new e(r)[0] || this.firstElementChild, this.insertBefore(t, r), i.push(t)
      })), new e(i)
    },
    append: function (t) {
      var r = new e(t)[0];
      return 1 == this.length ? this[0].appendChild(r) : ($$(e.util.getQueryString(r)).each(function () {
        r == this && (r.parentElement || document.body).removeChild(r)
      }), this.each(function () {
        var t = e.util.cloneNode(r);
        this.appendChild(t)
      })), this
    },
    insert: function (t, r) {
      var n = new e(t)[0];
      return 1 == this.length ? (r = r && new e(r)[0] || this[0].firstElementChild, this[0].insertBefore(n, r)) : ($$(e.util.getQueryString(n)).each(function () {
        n == this && (n.parentElement || document.body).removeChild(n)
      }), this.each(function () {
        var t = e.util.cloneNode(n);
        r = r && new e(r)[0] || this.firstElementChild, this.insertBefore(t, r)
      })), this
    },
    remove: function () {
      var t = [];
      return this.each(function () {
        t.push(this.parentElement), this.parentElement.removeChild(this)
      }), new e(t)
    },
    ready: function (t) {
      var r = this.length && this[0] || document;
      document.body ? "Function" == e.util.type(t) && t.call(null) : r.addEventListener("DOMContentLoaded", function () {
        "Function" == e.util.type(t) && t.call(null), r.removeEventListener("DOMContentLoaded", arguments.callee, !1)
      })
    },
    load: function (t) {
      var r = this.length && this[0] || window;
      document.body ? "Function" == e.util.type(t) && t.call(null) : r.addEventListener("load", function () {
        "Function" == e.util.type(t) && t.call(null)
      })
    }
  }, e.extend = e.prototype.extend = function (t) {
    for (var r in t) e.prototype[r] || (e.prototype[r] = t[r])
  }, e.rewrite = e.prototype.rewrite = function (t) {
    for (var r in t) e.prototype[r] && (e.prototype[r] = t[r])
  }, e.extend({
    each: e.each
  }), e.extend(e.filtByPostfix), e.epgEvent = {}, e.data = {}, e.activeEl = {}, e.extend({
    getId: function () {
      return this[0] && this[0].id || ""
    },
    getClass: function () {
      return this[0] && this[0].className || ""
    },
    isQuery: function () {
      return !0
    },
    exist: function () {
      return !!this.length
    },
    bindEvent: function (t, r) {
      if ("Function" != e.util.type(r) || !t) return this;
      var n = this[0] && this[0].id;
      return n ? (e.epgEvent[n] || (e.epgEvent[n] = {}), e.epgEvent[n][t] = r, new e(this[0])) : void 0
    },
    bindData: function (t) {
      if (!/Array|Object/.test(e.util.type(t))) return this;
      var r = this[0] && this[0].id;
      return r ? (e.data[r] = t, new e(this[0])) : void 0
    },
    focusTo: function (t) {
      var r = this[0] && this[0].id;
      r && (this.activeEl && this.activeEl.exist() && this.activeEl.removeClass("focus"), "String" == e.util.type(t) && (t = "#" + t.replace(/^#?/, "")), t ? (this.activeEl = e.activeEl[r] = new e(t), e.activeEl[r].addClass("focus"), $$.marquee(this.activeEl.children(".title"))) : $$.marquee())
    },
    renderList: function (t, e, r, n) {
      n = n || this.data;
      var i = t.replace(/{{[^{}]+}}/g, "").match(/({+[^{}]+}+)/g);
      i && (i = i.join(" ").replace(/{|}/g, "").split(" "));
      for (var o = [], l = 0, a = e; l < r && n[a]; l++, a++) {
        var s;
        s = t.replace(/{{[^{}]+}}/g, function () {
          return arguments[0] = l
        });
        var u = 0;
        s = s.replace(/{[^{}]+}/g, function () {
          return arguments[0] = n[l][i[u++]]
        }), o.push(s)
      }
      return this.html(o.join("")), this
    },
    renderAfter: function () {
      return e.util.type("Function" == arguments[0]) && arguments[0].apply(this, Array.prototype.slice.call(arguments, 1)), this
    }
  }), t.$$ = new function () {
    return function (t, r) {
      return new e(t, r)
    }
  }, $$.extend = e.extend, $$.printer = function (t) {
    var e = $$('<div id="global_printer"></div>').appendTo().css({
      position: "absolute",
      left: "45px",
      top: "45px",
      width: "1190px",
      fontSize: "24px",
      zIndex: 999,
      color: "cyan",
      backgroundColor: "rgba(0, 0, 0, .8)",
      wordBreak: "break-all"
    });
    $$.printer = function (t) {
      if (/Array/i.test($$.getType(t)))
        for (var r = 0; r < t.length; r++) arguments.callee.call($$, t[r]);
      else !arguments.length && (t = "码农童鞋 你好像忘传参数了啊 ⊙﹏⊙"), t = Object.O2S(t), e.text(e.text() ? e.text() + "\n" + t : t), e.offset("height") > 660 && e.text(t)
    }, $$.printer(t)
  }, $$.getType = function (t) {
    var e = Object.prototype.toString.call(t).slice(8, -1);
    return /global/.test(e) && (e = void 0 === t ? "Undefined" : "Null"), /DOMWindow/.test(e) && (e = void 0 === t ? "Undefined" : "Null"), e
  }, $$.foreach = function (t, e, r) {
    for (var n in t) t.hasOwnProperty(n) && e.apply(r || t, [t[n], n])
  }, $$.search = {
    get: function (e, r) {
      var n = {},
        i = [];
      r = r || t.location.href;
      /\?/.test(r) && (i = r.replace(/.*\?/, "").split("&"));
      for (var o = 0; o < i.length; o++) {
        var l = i[o].split("=");
        n[l[0]] = l[1]
      }
      return e ? n[e] || "" : n
    },
    set: function (e, r) {
      r = (r || t.location.href).replace(/[\?&](POSITIVE|direction=1)/, "");
      var n = $$.search.get("", r);
      $$.foreach(e, function (t, e) {
        n[e] = t
      });
      var i = [];
      $$.foreach(n, function (t, e) {
        i.push(e + "=" + t)
      });
      var o = r.replace(/\?.*/, "");
      return i.length ? o + "?" + i.join("&") : o
    }
  }, $$.Promise = function (t) {
    this.scope = null, this.data = null, this.mission = [], this.status = "pending", this.proxy = new $$.proxy;
    var e = this;
    setTimeout(function () {
      t(e.resolve.bind(e), e.reject.bind(e))
    }, 0)
  }, $$.Promise.all = function (t) {
    var e, r = new $$.Promise(function (t, e) {}),
      n = t.length,
      i = 0;
    r.data = [];
    for (var o = 0; o < n; o++) ! function (o) {
      t[o].proxy.sub("resolve", function () {
        e || (r.data[o] = t[o].data, ++i == n && r.proxy.pub("all", !0))
      }), t[o].proxy.sub("reject", function () {
        e = !0, r._catch && r._catch(t[o].data), e || (r.data[o] = t[o].data, ++i == n && r.proxy.pub("all", !0))
      })
    }(o);
    return r.proxy.once("all", function () {
      r.resolve(r.data)
    }), r
  }, $$.Promise.race = function (t) {
    for (var e, r = new $$.Promise(function (t, e) {}), n = t.length, i = 0; i < n; i++) ! function (n) {
      t[n].proxy.sub("resolve", function () {
        e || (r.data = t[n].data, r.proxy.pub("race", !0))
      }), t[n].proxy.sub("reject", function () {
        e = !0, r._catch && r._catch(t[n].data), e || (r.data = t[n].data, r.proxy.pub("race", !0))
      })
    }(i);
    return r.proxy.once("race", function () {
      r.resolve(r.data)
    }), r
  };
  var r, n = function (t, e) {
    if (this.scope !== this) {
      if (!this.scope) return this.data = t, this.proxy.pub(e);
      this.scope.data = t, this.scope.proxy.pub(e)
    }
  };
  $$.Promise.prototype = {
    resolve: function (t) {
      if ("pending" == this.status) {
        "pending" == this.status && (this.status = "resolve");
        var e = this.mission.shift();
        e ? e.call(null, t, "resolve") : n.call(this, t, "resolve")
      }
    },
    reject: function (t) {
      if ("pending" == this.status) {
        "pending" == this.status && (this.status = "reject");
        var e = this.mission.shift();
        e ? e.call(null, t, "reject") : n.call(this, t, "reject")
      }
    },
    then: function (t, e) {
      var r = this,
        n = function (t, e) {
          var n = arguments.callee,
            i = "resolve" == e && n.success.call(null, t) || "reject" == e && n.error.call(null, t);
          r.status = "pending", i instanceof $$.Promise ? (r.proxy.outAll(), r.proxy.sub("resolve", function () {
            r.resolve(r.data)
          }), r.proxy.sub("reject", function () {
            if ("Function" == $$.getType(n.error)) return n.error.call(this, r.data)
          }), i.scope = r) : (r.data = i, "resolve" == e && r.resolve(r.data), "reject" == e && r.reject(r.data))
        };
      return "Function" == $$.getType(t) && (n.success = t), "Function" == $$.getType(e) && (n.error = e), this.mission.push(n), this
    },
    catch: function (t) {
      for (var e in this._catch = t, this.mission) this.mission[e].error || (this.mission[e].error = t);
      return this
    }
  }, $$.proxy = function () {
    return {
      namespace: {},
      oncespace: {},
      sub: function (t, e, r) {
        return this.namespace[t] || (this.namespace[t] = []), "Function" == $$.getType(e) && this.namespace[t].push(r ? e.bind(r) : e), this
      },
      once: function (t, e, r) {
        return this.oncespace[t] || (this.oncespace[t] = []), "Function" == $$.getType(e) && this.oncespace[t].push(r ? e.bind(r) : e), this
      },
      pub: function (t, e, r) {
        if ("Array" == $$.getType(this.namespace[t]) && !e)
          for (var n = 0, i = (o = this.namespace[t]).length; n < i; n++) o[n](r);
        if ("Array" == $$.getType(this.oncespace[t]) && e) {
          var o;
          for (n = 0, i = (o = this.oncespace[t]).length; n < i; n++) o[n](r);
          this.out(t, !0)
        }
        return this
      },
      out: function (t, e) {
        return e ? delete this.oncespace[t] : delete this.namespace[t], this
      },
      pubAll: function (t) {
        $$.foreach(this.namespace, function (e, r) {
          $$.foreach(e, function (e) {
            e(t)
          })
        })
      },
      outAll: function () {
        this.namespace = {}
      }
    }
  }, $$.loader = function (e) {
    var r = $$.search.set({
        t: (new Date).getTime()
      }, e.url),
      n = e.cbName,
      i = e.success,
      o = e.error,
      l = e.timeout || 3e3,
      a = null,
      s = null;
    n && (t[n] = function () {
      clearTimeout(a), "function" == typeof i && i.apply(null, Array.prototype.slice.call(arguments)), s.remove(), delete t[n]
    }), s = $$('<script src="' + r + '" type="text/javascript" charset="UTF-8"><\/script>').appendTo("head"), o && (a = setTimeout(function () {
      s.remove(), delete t[n], o()
    }, l))
  }, $$.throttle = function (t, e, r) {
    $$.throttle.mission || ($$.throttle.mission = {});
    return function (t, e, r) {
      var n = (new Date).getTime(),
        i = $$.throttle.mission[r || "0"];
      if (!i) return $$.throttle.mission[r || "0"] = n, t();
      n - i < e || ($$.throttle.mission[r || "0"] = n, t())
    }(t, e, r || "0")
  }, $$.debounce = ((r = function (t, e, r) {
    clearTimeout($$.debounce.mission[r || "0"]), $$.debounce.mission[r || "0"] = setTimeout(function () {
      "Function" == $$.getType(t) && t.call(null)
    }, e)
  }).mission = {}, r.cancel = function (t) {
    clearTimeout($$.debounce.mission[t || "0"])
  }, r), $$.check = {
    phone: function (t) {
      return /1(3|4|5|6|7|8|9)\d{9}/.test("" + t)
    }
  }, $$.deepCopy = function (t) {
    var e;
    for (var r in "Array" == $$.getType(t) && (e = []), "Object" == $$.getType(t) && (e = {}), t) {
      var n = t[r];
      "Object" == $$.getType(e) && (/Object|Array/.test($$.getType(n)) ? e[r] = arguments.callee(n) : e[r] = t[r]), "Array" == $$.getType(e) && (/Object|Array/.test($$.getType(n)) ? e.push(arguments.callee(n)) : e.push(t[r]))
    }
    return e
  }
}(window);