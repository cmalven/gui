function ___$insertStyle(css2) {
  if (!css2) {
    return;
  }
  if (typeof window === "undefined") {
    return;
  }
  var style = document.createElement("style");
  style.setAttribute("type", "text/css");
  style.innerHTML = css2;
  document.head.appendChild(style);
  return css2;
}
function colorToString(color, forceCSSHex) {
  var colorFormat = color.__state.conversionName.toString();
  var r = Math.round(color.r);
  var g = Math.round(color.g);
  var b = Math.round(color.b);
  var a = color.a;
  var h = Math.round(color.h);
  var s = color.s.toFixed(1);
  var v = color.v.toFixed(1);
  if (forceCSSHex || colorFormat === "THREE_CHAR_HEX" || colorFormat === "SIX_CHAR_HEX") {
    var str = color.hex.toString(16);
    while (str.length < 6) {
      str = "0" + str;
    }
    return "#" + str;
  } else if (colorFormat === "CSS_RGB") {
    return "rgb(" + r + "," + g + "," + b + ")";
  } else if (colorFormat === "CSS_RGBA") {
    return "rgba(" + r + "," + g + "," + b + "," + a + ")";
  } else if (colorFormat === "HEX") {
    return "0x" + color.hex.toString(16);
  } else if (colorFormat === "RGB_ARRAY") {
    return "[" + r + "," + g + "," + b + "]";
  } else if (colorFormat === "RGBA_ARRAY") {
    return "[" + r + "," + g + "," + b + "," + a + "]";
  } else if (colorFormat === "RGB_OBJ") {
    return "{r:" + r + ",g:" + g + ",b:" + b + "}";
  } else if (colorFormat === "RGBA_OBJ") {
    return "{r:" + r + ",g:" + g + ",b:" + b + ",a:" + a + "}";
  } else if (colorFormat === "HSV_OBJ") {
    return "{h:" + h + ",s:" + s + ",v:" + v + "}";
  } else if (colorFormat === "HSVA_OBJ") {
    return "{h:" + h + ",s:" + s + ",v:" + v + ",a:" + a + "}";
  }
  return "unknown format";
}
var ARR_EACH = Array.prototype.forEach;
var ARR_SLICE = Array.prototype.slice;
var Common = {
  BREAK: {},
  extend: function extend(target) {
    this.each(ARR_SLICE.call(arguments, 1), function(obj) {
      var keys = this.isObject(obj) ? Object.keys(obj) : [];
      keys.forEach(function(key) {
        if (!this.isUndefined(obj[key])) {
          target[key] = obj[key];
        }
      }.bind(this));
    }, this);
    return target;
  },
  defaults: function defaults(target) {
    this.each(ARR_SLICE.call(arguments, 1), function(obj) {
      var keys = this.isObject(obj) ? Object.keys(obj) : [];
      keys.forEach(function(key) {
        if (this.isUndefined(target[key])) {
          target[key] = obj[key];
        }
      }.bind(this));
    }, this);
    return target;
  },
  compose: function compose() {
    var toCall = ARR_SLICE.call(arguments);
    return function() {
      var args = ARR_SLICE.call(arguments);
      for (var i = toCall.length - 1; i >= 0; i--) {
        args = [toCall[i].apply(this, args)];
      }
      return args[0];
    };
  },
  each: function each(obj, itr, scope) {
    if (!obj) {
      return;
    }
    if (ARR_EACH && obj.forEach && obj.forEach === ARR_EACH) {
      obj.forEach(itr, scope);
    } else if (obj.length === obj.length + 0) {
      var key = void 0;
      var l = void 0;
      for (key = 0, l = obj.length; key < l; key++) {
        if (key in obj && itr.call(scope, obj[key], key) === this.BREAK) {
          return;
        }
      }
    } else {
      for (var _key in obj) {
        if (itr.call(scope, obj[_key], _key) === this.BREAK) {
          return;
        }
      }
    }
  },
  defer: function defer(fnc) {
    setTimeout(fnc, 0);
  },
  debounce: function debounce(func, threshold, callImmediately) {
    var timeout = void 0;
    return function() {
      var obj = this;
      var args = arguments;
      function delayed() {
        timeout = null;
        if (!callImmediately)
          func.apply(obj, args);
      }
      var callNow = callImmediately || !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(delayed, threshold);
      if (callNow) {
        func.apply(obj, args);
      }
    };
  },
  toArray: function toArray(obj) {
    if (obj.toArray)
      return obj.toArray();
    return ARR_SLICE.call(obj);
  },
  isUndefined: function isUndefined(obj) {
    return obj === void 0;
  },
  isNull: function isNull(obj) {
    return obj === null;
  },
  isNaN: function(_isNaN) {
    function isNaN2(_x) {
      return _isNaN.apply(this, arguments);
    }
    isNaN2.toString = function() {
      return _isNaN.toString();
    };
    return isNaN2;
  }(function(obj) {
    return isNaN(obj);
  }),
  isArray: Array.isArray || function(obj) {
    return obj.constructor === Array;
  },
  isObject: function isObject(obj) {
    return obj === Object(obj);
  },
  isNumber: function isNumber(obj) {
    return obj === obj + 0;
  },
  isString: function isString(obj) {
    return obj === obj + "";
  },
  isBoolean: function isBoolean(obj) {
    return obj === false || obj === true;
  },
  isFunction: function isFunction(obj) {
    return obj instanceof Function;
  }
};
var INTERPRETATIONS = [
  {
    litmus: Common.isString,
    conversions: {
      THREE_CHAR_HEX: {
        read: function read(original) {
          var test = original.match(/^#([A-F0-9])([A-F0-9])([A-F0-9])$/i);
          if (test === null) {
            return false;
          }
          return {
            space: "HEX",
            hex: parseInt("0x" + test[1].toString() + test[1].toString() + test[2].toString() + test[2].toString() + test[3].toString() + test[3].toString(), 0)
          };
        },
        write: colorToString
      },
      SIX_CHAR_HEX: {
        read: function read2(original) {
          var test = original.match(/^#([A-F0-9]{6})$/i);
          if (test === null) {
            return false;
          }
          return {
            space: "HEX",
            hex: parseInt("0x" + test[1].toString(), 0)
          };
        },
        write: colorToString
      },
      CSS_RGB: {
        read: function read3(original) {
          var test = original.match(/^rgb\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\)/);
          if (test === null) {
            return false;
          }
          return {
            space: "RGB",
            r: parseFloat(test[1]),
            g: parseFloat(test[2]),
            b: parseFloat(test[3])
          };
        },
        write: colorToString
      },
      CSS_RGBA: {
        read: function read4(original) {
          var test = original.match(/^rgba\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\)/);
          if (test === null) {
            return false;
          }
          return {
            space: "RGB",
            r: parseFloat(test[1]),
            g: parseFloat(test[2]),
            b: parseFloat(test[3]),
            a: parseFloat(test[4])
          };
        },
        write: colorToString
      }
    }
  },
  {
    litmus: Common.isNumber,
    conversions: {
      HEX: {
        read: function read5(original) {
          return {
            space: "HEX",
            hex: original,
            conversionName: "HEX"
          };
        },
        write: function write(color) {
          return color.hex;
        }
      }
    }
  },
  {
    litmus: Common.isArray,
    conversions: {
      RGB_ARRAY: {
        read: function read6(original) {
          if (original.length !== 3) {
            return false;
          }
          return {
            space: "RGB",
            r: original[0],
            g: original[1],
            b: original[2]
          };
        },
        write: function write2(color) {
          return [color.r, color.g, color.b];
        }
      },
      RGBA_ARRAY: {
        read: function read7(original) {
          if (original.length !== 4)
            return false;
          return {
            space: "RGB",
            r: original[0],
            g: original[1],
            b: original[2],
            a: original[3]
          };
        },
        write: function write3(color) {
          return [color.r, color.g, color.b, color.a];
        }
      }
    }
  },
  {
    litmus: Common.isObject,
    conversions: {
      RGBA_OBJ: {
        read: function read8(original) {
          if (Common.isNumber(original.r) && Common.isNumber(original.g) && Common.isNumber(original.b) && Common.isNumber(original.a)) {
            return {
              space: "RGB",
              r: original.r,
              g: original.g,
              b: original.b,
              a: original.a
            };
          }
          return false;
        },
        write: function write4(color) {
          return {
            r: color.r,
            g: color.g,
            b: color.b,
            a: color.a
          };
        }
      },
      RGB_OBJ: {
        read: function read9(original) {
          if (Common.isNumber(original.r) && Common.isNumber(original.g) && Common.isNumber(original.b)) {
            return {
              space: "RGB",
              r: original.r,
              g: original.g,
              b: original.b
            };
          }
          return false;
        },
        write: function write5(color) {
          return {
            r: color.r,
            g: color.g,
            b: color.b
          };
        }
      },
      HSVA_OBJ: {
        read: function read10(original) {
          if (Common.isNumber(original.h) && Common.isNumber(original.s) && Common.isNumber(original.v) && Common.isNumber(original.a)) {
            return {
              space: "HSV",
              h: original.h,
              s: original.s,
              v: original.v,
              a: original.a
            };
          }
          return false;
        },
        write: function write6(color) {
          return {
            h: color.h,
            s: color.s,
            v: color.v,
            a: color.a
          };
        }
      },
      HSV_OBJ: {
        read: function read11(original) {
          if (Common.isNumber(original.h) && Common.isNumber(original.s) && Common.isNumber(original.v)) {
            return {
              space: "HSV",
              h: original.h,
              s: original.s,
              v: original.v
            };
          }
          return false;
        },
        write: function write7(color) {
          return {
            h: color.h,
            s: color.s,
            v: color.v
          };
        }
      }
    }
  }
];
var result = void 0;
var toReturn = void 0;
var interpret = function interpret2() {
  toReturn = false;
  var original = arguments.length > 1 ? Common.toArray(arguments) : arguments[0];
  Common.each(INTERPRETATIONS, function(family) {
    if (family.litmus(original)) {
      Common.each(family.conversions, function(conversion, conversionName) {
        result = conversion.read(original);
        if (toReturn === false && result !== false) {
          toReturn = result;
          result.conversionName = conversionName;
          result.conversion = conversion;
          return Common.BREAK;
        }
      });
      return Common.BREAK;
    }
  });
  return toReturn;
};
var tmpComponent = void 0;
var ColorMath = {
  hsv_to_rgb: function hsv_to_rgb(h, s, v) {
    var hi = Math.floor(h / 60) % 6;
    var f = h / 60 - Math.floor(h / 60);
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);
    var c = [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][hi];
    return {
      r: c[0] * 255,
      g: c[1] * 255,
      b: c[2] * 255
    };
  },
  rgb_to_hsv: function rgb_to_hsv(r, g, b) {
    var min = Math.min(r, g, b);
    var max = Math.max(r, g, b);
    var delta = max - min;
    var h = void 0;
    var s = void 0;
    if (max !== 0) {
      s = delta / max;
    } else {
      return {
        h: NaN,
        s: 0,
        v: 0
      };
    }
    if (r === max) {
      h = (g - b) / delta;
    } else if (g === max) {
      h = 2 + (b - r) / delta;
    } else {
      h = 4 + (r - g) / delta;
    }
    h /= 6;
    if (h < 0) {
      h += 1;
    }
    return {
      h: h * 360,
      s,
      v: max / 255
    };
  },
  rgb_to_hex: function rgb_to_hex(r, g, b) {
    var hex = this.hex_with_component(0, 2, r);
    hex = this.hex_with_component(hex, 1, g);
    hex = this.hex_with_component(hex, 0, b);
    return hex;
  },
  component_from_hex: function component_from_hex(hex, componentIndex) {
    return hex >> componentIndex * 8 & 255;
  },
  hex_with_component: function hex_with_component(hex, componentIndex, value) {
    return value << (tmpComponent = componentIndex * 8) | hex & ~(255 << tmpComponent);
  }
};
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function(obj) {
  return typeof obj;
} : function(obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};
var classCallCheck = function(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};
var createClass = function() {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor)
        descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  return function(Constructor, protoProps, staticProps) {
    if (protoProps)
      defineProperties(Constructor.prototype, protoProps);
    if (staticProps)
      defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();
var get = function get2(object, property, receiver) {
  if (object === null)
    object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);
  if (desc === void 0) {
    var parent = Object.getPrototypeOf(object);
    if (parent === null) {
      return void 0;
    } else {
      return get2(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;
    if (getter === void 0) {
      return void 0;
    }
    return getter.call(receiver);
  }
};
var inherits = function(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass)
    Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};
var possibleConstructorReturn = function(self2, call) {
  if (!self2) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return call && (typeof call === "object" || typeof call === "function") ? call : self2;
};
var Color = function() {
  function Color2() {
    classCallCheck(this, Color2);
    this.__state = interpret.apply(this, arguments);
    if (this.__state === false) {
      throw new Error("Failed to interpret color arguments");
    }
    this.__state.a = this.__state.a || 1;
  }
  createClass(Color2, [{
    key: "toString",
    value: function toString() {
      return colorToString(this);
    }
  }, {
    key: "toHexString",
    value: function toHexString() {
      return colorToString(this, true);
    }
  }, {
    key: "toOriginal",
    value: function toOriginal() {
      return this.__state.conversion.write(this);
    }
  }]);
  return Color2;
}();
function defineRGBComponent(target, component, componentHexIndex) {
  Object.defineProperty(target, component, {
    get: function get$$13() {
      if (this.__state.space === "RGB") {
        return this.__state[component];
      }
      Color.recalculateRGB(this, component, componentHexIndex);
      return this.__state[component];
    },
    set: function set$$13(v) {
      if (this.__state.space !== "RGB") {
        Color.recalculateRGB(this, component, componentHexIndex);
        this.__state.space = "RGB";
      }
      this.__state[component] = v;
    }
  });
}
function defineHSVComponent(target, component) {
  Object.defineProperty(target, component, {
    get: function get$$13() {
      if (this.__state.space === "HSV") {
        return this.__state[component];
      }
      Color.recalculateHSV(this);
      return this.__state[component];
    },
    set: function set$$13(v) {
      if (this.__state.space !== "HSV") {
        Color.recalculateHSV(this);
        this.__state.space = "HSV";
      }
      this.__state[component] = v;
    }
  });
}
Color.recalculateRGB = function(color, component, componentHexIndex) {
  if (color.__state.space === "HEX") {
    color.__state[component] = ColorMath.component_from_hex(color.__state.hex, componentHexIndex);
  } else if (color.__state.space === "HSV") {
    Common.extend(color.__state, ColorMath.hsv_to_rgb(color.__state.h, color.__state.s, color.__state.v));
  } else {
    throw new Error("Corrupted color state");
  }
};
Color.recalculateHSV = function(color) {
  var result2 = ColorMath.rgb_to_hsv(color.r, color.g, color.b);
  Common.extend(color.__state, {
    s: result2.s,
    v: result2.v
  });
  if (!Common.isNaN(result2.h)) {
    color.__state.h = result2.h;
  } else if (Common.isUndefined(color.__state.h)) {
    color.__state.h = 0;
  }
};
Color.COMPONENTS = ["r", "g", "b", "h", "s", "v", "hex", "a"];
defineRGBComponent(Color.prototype, "r", 2);
defineRGBComponent(Color.prototype, "g", 1);
defineRGBComponent(Color.prototype, "b", 0);
defineHSVComponent(Color.prototype, "h");
defineHSVComponent(Color.prototype, "s");
defineHSVComponent(Color.prototype, "v");
Object.defineProperty(Color.prototype, "a", {
  get: function get$$1() {
    return this.__state.a;
  },
  set: function set$$1(v) {
    this.__state.a = v;
  }
});
Object.defineProperty(Color.prototype, "hex", {
  get: function get$$12() {
    if (this.__state.space !== "HEX") {
      this.__state.hex = ColorMath.rgb_to_hex(this.r, this.g, this.b);
      this.__state.space = "HEX";
    }
    return this.__state.hex;
  },
  set: function set$$12(v) {
    this.__state.space = "HEX";
    this.__state.hex = v;
  }
});
var Controller = function() {
  function Controller2(object, property) {
    classCallCheck(this, Controller2);
    this.initialValue = object[property];
    this.domElement = document.createElement("div");
    this.object = object;
    this.property = property;
    this.__onChange = void 0;
    this.__onFinishChange = void 0;
  }
  createClass(Controller2, [{
    key: "onChange",
    value: function onChange(fnc) {
      this.__onChange = fnc;
      return this;
    }
  }, {
    key: "onFinishChange",
    value: function onFinishChange(fnc) {
      this.__onFinishChange = fnc;
      return this;
    }
  }, {
    key: "setValue",
    value: function setValue(newValue) {
      this.object[this.property] = newValue;
      if (this.__onChange) {
        this.__onChange.call(this, newValue);
      }
      this.updateDisplay();
      return this;
    }
  }, {
    key: "getValue",
    value: function getValue() {
      return this.object[this.property];
    }
  }, {
    key: "updateDisplay",
    value: function updateDisplay2() {
      return this;
    }
  }, {
    key: "isModified",
    value: function isModified() {
      return this.initialValue !== this.getValue();
    }
  }]);
  return Controller2;
}();
var EVENT_MAP = {
  HTMLEvents: ["change"],
  MouseEvents: ["click", "mousemove", "mousedown", "mouseup", "mouseover"],
  KeyboardEvents: ["keydown"]
};
var EVENT_MAP_INV = {};
Common.each(EVENT_MAP, function(v, k) {
  Common.each(v, function(e) {
    EVENT_MAP_INV[e] = k;
  });
});
var CSS_VALUE_PIXELS = /(\d+(\.\d+)?)px/;
function cssValueToPixels(val) {
  if (val === "0" || Common.isUndefined(val)) {
    return 0;
  }
  var match = val.match(CSS_VALUE_PIXELS);
  if (!Common.isNull(match)) {
    return parseFloat(match[1]);
  }
  return 0;
}
var dom = {
  makeSelectable: function makeSelectable(elem, selectable) {
    if (elem === void 0 || elem.style === void 0)
      return;
    elem.onselectstart = selectable ? function() {
      return false;
    } : function() {
    };
    elem.style.MozUserSelect = selectable ? "auto" : "none";
    elem.style.KhtmlUserSelect = selectable ? "auto" : "none";
    elem.unselectable = selectable ? "on" : "off";
  },
  makeFullscreen: function makeFullscreen(elem, hor, vert) {
    var vertical = vert;
    var horizontal = hor;
    if (Common.isUndefined(horizontal)) {
      horizontal = true;
    }
    if (Common.isUndefined(vertical)) {
      vertical = true;
    }
    elem.style.position = "absolute";
    if (horizontal) {
      elem.style.left = 0;
      elem.style.right = 0;
    }
    if (vertical) {
      elem.style.top = 0;
      elem.style.bottom = 0;
    }
  },
  fakeEvent: function fakeEvent(elem, eventType, pars, aux) {
    var params = pars || {};
    var className = EVENT_MAP_INV[eventType];
    if (!className) {
      throw new Error("Event type " + eventType + " not supported.");
    }
    var evt = document.createEvent(className);
    switch (className) {
      case "MouseEvents": {
        var clientX = params.x || params.clientX || 0;
        var clientY = params.y || params.clientY || 0;
        evt.initMouseEvent(eventType, params.bubbles || false, params.cancelable || true, window, params.clickCount || 1, 0, 0, clientX, clientY, false, false, false, false, 0, null);
        break;
      }
      case "KeyboardEvents": {
        var init = evt.initKeyboardEvent || evt.initKeyEvent;
        Common.defaults(params, {
          cancelable: true,
          ctrlKey: false,
          altKey: false,
          shiftKey: false,
          metaKey: false,
          keyCode: void 0,
          charCode: void 0
        });
        init(eventType, params.bubbles || false, params.cancelable, window, params.ctrlKey, params.altKey, params.shiftKey, params.metaKey, params.keyCode, params.charCode);
        break;
      }
      default: {
        evt.initEvent(eventType, params.bubbles || false, params.cancelable || true);
        break;
      }
    }
    Common.defaults(evt, aux);
    elem.dispatchEvent(evt);
  },
  bind: function bind(elem, event, func, newBool) {
    var bool = newBool || false;
    if (elem.addEventListener) {
      elem.addEventListener(event, func, bool);
    } else if (elem.attachEvent) {
      elem.attachEvent("on" + event, func);
    }
    return dom;
  },
  unbind: function unbind(elem, event, func, newBool) {
    var bool = newBool || false;
    if (elem.removeEventListener) {
      elem.removeEventListener(event, func, bool);
    } else if (elem.detachEvent) {
      elem.detachEvent("on" + event, func);
    }
    return dom;
  },
  addClass: function addClass(elem, className) {
    if (elem.className === void 0) {
      elem.className = className;
    } else if (elem.className !== className) {
      var classes = elem.className.split(/ +/);
      if (classes.indexOf(className) === -1) {
        classes.push(className);
        elem.className = classes.join(" ").replace(/^\s+/, "").replace(/\s+$/, "");
      }
    }
    return dom;
  },
  removeClass: function removeClass(elem, className) {
    if (className) {
      if (elem.className === className) {
        elem.removeAttribute("class");
      } else {
        var classes = elem.className.split(/ +/);
        var index = classes.indexOf(className);
        if (index !== -1) {
          classes.splice(index, 1);
          elem.className = classes.join(" ");
        }
      }
    } else {
      elem.className = void 0;
    }
    return dom;
  },
  hasClass: function hasClass(elem, className) {
    return new RegExp("(?:^|\\s+)" + className + "(?:\\s+|$)").test(elem.className) || false;
  },
  getWidth: function getWidth(elem) {
    var style = getComputedStyle(elem);
    return cssValueToPixels(style["border-left-width"]) + cssValueToPixels(style["border-right-width"]) + cssValueToPixels(style["padding-left"]) + cssValueToPixels(style["padding-right"]) + cssValueToPixels(style.width);
  },
  getHeight: function getHeight(elem) {
    var style = getComputedStyle(elem);
    return cssValueToPixels(style["border-top-width"]) + cssValueToPixels(style["border-bottom-width"]) + cssValueToPixels(style["padding-top"]) + cssValueToPixels(style["padding-bottom"]) + cssValueToPixels(style.height);
  },
  getOffset: function getOffset(el) {
    var elem = el;
    var offset = { left: 0, top: 0 };
    if (elem.offsetParent) {
      do {
        offset.left += elem.offsetLeft;
        offset.top += elem.offsetTop;
        elem = elem.offsetParent;
      } while (elem);
    }
    return offset;
  },
  isActive: function isActive(elem) {
    return elem === document.activeElement && (elem.type || elem.href);
  }
};
var BooleanController = function(_Controller) {
  inherits(BooleanController2, _Controller);
  function BooleanController2(object, property) {
    classCallCheck(this, BooleanController2);
    var _this2 = possibleConstructorReturn(this, (BooleanController2.__proto__ || Object.getPrototypeOf(BooleanController2)).call(this, object, property));
    var _this = _this2;
    _this2.__prev = _this2.getValue();
    _this2.__checkbox = document.createElement("input");
    _this2.__checkbox.setAttribute("type", "checkbox");
    function onChange() {
      _this.setValue(!_this.__prev);
    }
    dom.bind(_this2.__checkbox, "change", onChange, false);
    _this2.domElement.appendChild(_this2.__checkbox);
    _this2.updateDisplay();
    return _this2;
  }
  createClass(BooleanController2, [{
    key: "setValue",
    value: function setValue(v) {
      var toReturn2 = get(BooleanController2.prototype.__proto__ || Object.getPrototypeOf(BooleanController2.prototype), "setValue", this).call(this, v);
      if (this.__onFinishChange) {
        this.__onFinishChange.call(this, this.getValue());
      }
      this.__prev = this.getValue();
      return toReturn2;
    }
  }, {
    key: "updateDisplay",
    value: function updateDisplay2() {
      if (this.getValue() === true) {
        this.__checkbox.setAttribute("checked", "checked");
        this.__checkbox.checked = true;
        this.__prev = true;
      } else {
        this.__checkbox.checked = false;
        this.__prev = false;
      }
      return get(BooleanController2.prototype.__proto__ || Object.getPrototypeOf(BooleanController2.prototype), "updateDisplay", this).call(this);
    }
  }]);
  return BooleanController2;
}(Controller);
var OptionController = function(_Controller) {
  inherits(OptionController2, _Controller);
  function OptionController2(object, property, opts) {
    classCallCheck(this, OptionController2);
    var _this2 = possibleConstructorReturn(this, (OptionController2.__proto__ || Object.getPrototypeOf(OptionController2)).call(this, object, property));
    var options = opts;
    var _this = _this2;
    _this2.__select = document.createElement("select");
    if (Common.isArray(options)) {
      var map2 = {};
      Common.each(options, function(element) {
        map2[element] = element;
      });
      options = map2;
    }
    Common.each(options, function(value, key) {
      var opt = document.createElement("option");
      opt.innerHTML = key;
      opt.setAttribute("value", value);
      _this.__select.appendChild(opt);
    });
    _this2.updateDisplay();
    dom.bind(_this2.__select, "change", function() {
      var desiredValue = this.options[this.selectedIndex].value;
      _this.setValue(desiredValue);
    });
    _this2.domElement.appendChild(_this2.__select);
    return _this2;
  }
  createClass(OptionController2, [{
    key: "setValue",
    value: function setValue(v) {
      var toReturn2 = get(OptionController2.prototype.__proto__ || Object.getPrototypeOf(OptionController2.prototype), "setValue", this).call(this, v);
      if (this.__onFinishChange) {
        this.__onFinishChange.call(this, this.getValue());
      }
      return toReturn2;
    }
  }, {
    key: "updateDisplay",
    value: function updateDisplay2() {
      if (dom.isActive(this.__select))
        return this;
      this.__select.value = this.getValue();
      return get(OptionController2.prototype.__proto__ || Object.getPrototypeOf(OptionController2.prototype), "updateDisplay", this).call(this);
    }
  }]);
  return OptionController2;
}(Controller);
var StringController = function(_Controller) {
  inherits(StringController2, _Controller);
  function StringController2(object, property) {
    classCallCheck(this, StringController2);
    var _this2 = possibleConstructorReturn(this, (StringController2.__proto__ || Object.getPrototypeOf(StringController2)).call(this, object, property));
    var _this = _this2;
    function onChange() {
      _this.setValue(_this.__input.value);
    }
    function onBlur() {
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.getValue());
      }
    }
    _this2.__input = document.createElement("input");
    _this2.__input.setAttribute("type", "text");
    dom.bind(_this2.__input, "keyup", onChange);
    dom.bind(_this2.__input, "change", onChange);
    dom.bind(_this2.__input, "blur", onBlur);
    dom.bind(_this2.__input, "keydown", function(e) {
      if (e.keyCode === 13) {
        this.blur();
      }
    });
    _this2.updateDisplay();
    _this2.domElement.appendChild(_this2.__input);
    return _this2;
  }
  createClass(StringController2, [{
    key: "updateDisplay",
    value: function updateDisplay2() {
      if (!dom.isActive(this.__input)) {
        this.__input.value = this.getValue();
      }
      return get(StringController2.prototype.__proto__ || Object.getPrototypeOf(StringController2.prototype), "updateDisplay", this).call(this);
    }
  }]);
  return StringController2;
}(Controller);
function numDecimals(x) {
  var _x = x.toString();
  if (_x.indexOf(".") > -1) {
    return _x.length - _x.indexOf(".") - 1;
  }
  return 0;
}
var NumberController = function(_Controller) {
  inherits(NumberController2, _Controller);
  function NumberController2(object, property, params) {
    classCallCheck(this, NumberController2);
    var _this = possibleConstructorReturn(this, (NumberController2.__proto__ || Object.getPrototypeOf(NumberController2)).call(this, object, property));
    var _params = params || {};
    _this.__min = _params.min;
    _this.__max = _params.max;
    _this.__step = _params.step;
    if (Common.isUndefined(_this.__step)) {
      if (_this.initialValue === 0) {
        _this.__impliedStep = 1;
      } else {
        _this.__impliedStep = Math.pow(10, Math.floor(Math.log(Math.abs(_this.initialValue)) / Math.LN10)) / 10;
      }
    } else {
      _this.__impliedStep = _this.__step;
    }
    _this.__precision = numDecimals(_this.__impliedStep);
    return _this;
  }
  createClass(NumberController2, [{
    key: "setValue",
    value: function setValue(v) {
      var _v = v;
      if (this.__min !== void 0 && _v < this.__min) {
        _v = this.__min;
      } else if (this.__max !== void 0 && _v > this.__max) {
        _v = this.__max;
      }
      if (this.__step !== void 0 && _v % this.__step !== 0) {
        _v = Math.round(_v / this.__step) * this.__step;
      }
      return get(NumberController2.prototype.__proto__ || Object.getPrototypeOf(NumberController2.prototype), "setValue", this).call(this, _v);
    }
  }, {
    key: "min",
    value: function min(minValue) {
      this.__min = minValue;
      return this;
    }
  }, {
    key: "max",
    value: function max(maxValue) {
      this.__max = maxValue;
      return this;
    }
  }, {
    key: "step",
    value: function step(stepValue) {
      this.__step = stepValue;
      this.__impliedStep = stepValue;
      this.__precision = numDecimals(stepValue);
      return this;
    }
  }]);
  return NumberController2;
}(Controller);
function roundToDecimal(value, decimals) {
  var tenTo = Math.pow(10, decimals);
  return Math.round(value * tenTo) / tenTo;
}
var NumberControllerBox = function(_NumberController) {
  inherits(NumberControllerBox2, _NumberController);
  function NumberControllerBox2(object, property, params) {
    classCallCheck(this, NumberControllerBox2);
    var _this2 = possibleConstructorReturn(this, (NumberControllerBox2.__proto__ || Object.getPrototypeOf(NumberControllerBox2)).call(this, object, property, params));
    _this2.__truncationSuspended = false;
    var _this = _this2;
    var prevY = void 0;
    function onChange() {
      var attempted = parseFloat(_this.__input.value);
      if (!Common.isNaN(attempted)) {
        _this.setValue(attempted);
      }
    }
    function onFinish() {
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.getValue());
      }
    }
    function onBlur() {
      onFinish();
    }
    function onMouseDrag(e) {
      var diff = prevY - e.clientY;
      _this.setValue(_this.getValue() + diff * _this.__impliedStep);
      prevY = e.clientY;
    }
    function onMouseUp() {
      dom.unbind(window, "mousemove", onMouseDrag);
      dom.unbind(window, "mouseup", onMouseUp);
      onFinish();
    }
    function onMouseDown(e) {
      dom.bind(window, "mousemove", onMouseDrag);
      dom.bind(window, "mouseup", onMouseUp);
      prevY = e.clientY;
    }
    _this2.__input = document.createElement("input");
    _this2.__input.setAttribute("type", "text");
    dom.bind(_this2.__input, "change", onChange);
    dom.bind(_this2.__input, "blur", onBlur);
    dom.bind(_this2.__input, "mousedown", onMouseDown);
    dom.bind(_this2.__input, "keydown", function(e) {
      if (e.keyCode === 13) {
        _this.__truncationSuspended = true;
        this.blur();
        _this.__truncationSuspended = false;
        onFinish();
      }
    });
    _this2.updateDisplay();
    _this2.domElement.appendChild(_this2.__input);
    return _this2;
  }
  createClass(NumberControllerBox2, [{
    key: "updateDisplay",
    value: function updateDisplay2() {
      this.__input.value = this.__truncationSuspended ? this.getValue() : roundToDecimal(this.getValue(), this.__precision);
      return get(NumberControllerBox2.prototype.__proto__ || Object.getPrototypeOf(NumberControllerBox2.prototype), "updateDisplay", this).call(this);
    }
  }]);
  return NumberControllerBox2;
}(NumberController);
function map(v, i1, i2, o1, o2) {
  return o1 + (o2 - o1) * ((v - i1) / (i2 - i1));
}
var NumberControllerSlider = function(_NumberController) {
  inherits(NumberControllerSlider2, _NumberController);
  function NumberControllerSlider2(object, property, min, max, step) {
    classCallCheck(this, NumberControllerSlider2);
    var _this2 = possibleConstructorReturn(this, (NumberControllerSlider2.__proto__ || Object.getPrototypeOf(NumberControllerSlider2)).call(this, object, property, { min, max, step }));
    var _this = _this2;
    _this2.__background = document.createElement("div");
    _this2.__foreground = document.createElement("div");
    dom.bind(_this2.__background, "mousedown", onMouseDown);
    dom.bind(_this2.__background, "touchstart", onTouchStart);
    dom.addClass(_this2.__background, "slider");
    dom.addClass(_this2.__foreground, "slider-fg");
    function onMouseDown(e) {
      document.activeElement.blur();
      dom.bind(window, "mousemove", onMouseDrag);
      dom.bind(window, "mouseup", onMouseUp);
      onMouseDrag(e);
    }
    function onMouseDrag(e) {
      e.preventDefault();
      var bgRect = _this.__background.getBoundingClientRect();
      _this.setValue(map(e.clientX, bgRect.left, bgRect.right, _this.__min, _this.__max));
      return false;
    }
    function onMouseUp() {
      dom.unbind(window, "mousemove", onMouseDrag);
      dom.unbind(window, "mouseup", onMouseUp);
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.getValue());
      }
    }
    function onTouchStart(e) {
      if (e.touches.length !== 1) {
        return;
      }
      dom.bind(window, "touchmove", onTouchMove);
      dom.bind(window, "touchend", onTouchEnd);
      onTouchMove(e);
    }
    function onTouchMove(e) {
      var clientX = e.touches[0].clientX;
      var bgRect = _this.__background.getBoundingClientRect();
      _this.setValue(map(clientX, bgRect.left, bgRect.right, _this.__min, _this.__max));
    }
    function onTouchEnd() {
      dom.unbind(window, "touchmove", onTouchMove);
      dom.unbind(window, "touchend", onTouchEnd);
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.getValue());
      }
    }
    _this2.updateDisplay();
    _this2.__background.appendChild(_this2.__foreground);
    _this2.domElement.appendChild(_this2.__background);
    return _this2;
  }
  createClass(NumberControllerSlider2, [{
    key: "updateDisplay",
    value: function updateDisplay2() {
      var pct = (this.getValue() - this.__min) / (this.__max - this.__min);
      this.__foreground.style.width = pct * 100 + "%";
      return get(NumberControllerSlider2.prototype.__proto__ || Object.getPrototypeOf(NumberControllerSlider2.prototype), "updateDisplay", this).call(this);
    }
  }]);
  return NumberControllerSlider2;
}(NumberController);
var FunctionController = function(_Controller) {
  inherits(FunctionController2, _Controller);
  function FunctionController2(object, property, text) {
    classCallCheck(this, FunctionController2);
    var _this2 = possibleConstructorReturn(this, (FunctionController2.__proto__ || Object.getPrototypeOf(FunctionController2)).call(this, object, property));
    var _this = _this2;
    _this2.__button = document.createElement("div");
    _this2.__button.innerHTML = text === void 0 ? "Fire" : text;
    dom.bind(_this2.__button, "click", function(e) {
      e.preventDefault();
      _this.fire();
      return false;
    });
    dom.addClass(_this2.__button, "button");
    _this2.domElement.appendChild(_this2.__button);
    return _this2;
  }
  createClass(FunctionController2, [{
    key: "fire",
    value: function fire() {
      if (this.__onChange) {
        this.__onChange.call(this);
      }
      this.getValue().call(this.object);
      if (this.__onFinishChange) {
        this.__onFinishChange.call(this, this.getValue());
      }
    }
  }]);
  return FunctionController2;
}(Controller);
var ColorController = function(_Controller) {
  inherits(ColorController2, _Controller);
  function ColorController2(object, property) {
    classCallCheck(this, ColorController2);
    var _this2 = possibleConstructorReturn(this, (ColorController2.__proto__ || Object.getPrototypeOf(ColorController2)).call(this, object, property));
    _this2.__color = new Color(_this2.getValue());
    _this2.__temp = new Color(0);
    var _this = _this2;
    _this2.domElement = document.createElement("div");
    dom.makeSelectable(_this2.domElement, false);
    _this2.__selector = document.createElement("div");
    _this2.__selector.className = "selector";
    _this2.__saturation_field = document.createElement("div");
    _this2.__saturation_field.className = "saturation-field";
    _this2.__field_knob = document.createElement("div");
    _this2.__field_knob.className = "field-knob";
    _this2.__field_knob_border = "2px solid ";
    _this2.__hue_knob = document.createElement("div");
    _this2.__hue_knob.className = "hue-knob";
    _this2.__hue_field = document.createElement("div");
    _this2.__hue_field.className = "hue-field";
    _this2.__input = document.createElement("input");
    _this2.__input.type = "text";
    _this2.__input_textShadow = "0 1px 1px ";
    dom.bind(_this2.__input, "keydown", function(e) {
      if (e.keyCode === 13) {
        onBlur.call(this);
      }
    });
    dom.bind(_this2.__input, "blur", onBlur);
    dom.bind(_this2.__selector, "mousedown", function() {
      dom.addClass(this, "drag").bind(window, "mouseup", function() {
        dom.removeClass(_this.__selector, "drag");
      });
    });
    dom.bind(_this2.__selector, "touchstart", function() {
      dom.addClass(this, "drag").bind(window, "touchend", function() {
        dom.removeClass(_this.__selector, "drag");
      });
    });
    var valueField = document.createElement("div");
    Common.extend(_this2.__selector.style, {
      width: "122px",
      height: "102px",
      padding: "3px",
      backgroundColor: "#222",
      boxShadow: "0px 1px 3px rgba(0,0,0,0.3)"
    });
    Common.extend(_this2.__field_knob.style, {
      position: "absolute",
      width: "12px",
      height: "12px",
      border: _this2.__field_knob_border + (_this2.__color.v < 0.5 ? "#fff" : "#000"),
      boxShadow: "0px 1px 3px rgba(0,0,0,0.5)",
      borderRadius: "12px",
      zIndex: 1
    });
    Common.extend(_this2.__hue_knob.style, {
      position: "absolute",
      width: "15px",
      height: "2px",
      borderRight: "4px solid #fff",
      zIndex: 1
    });
    Common.extend(_this2.__saturation_field.style, {
      width: "100px",
      height: "100px",
      border: "1px solid #555",
      marginRight: "3px",
      display: "inline-block",
      cursor: "pointer"
    });
    Common.extend(valueField.style, {
      width: "100%",
      height: "100%",
      background: "none"
    });
    linearGradient(valueField, "top", "rgba(0,0,0,0)", "#000");
    Common.extend(_this2.__hue_field.style, {
      width: "15px",
      height: "100px",
      border: "1px solid #555",
      cursor: "ns-resize",
      position: "absolute",
      top: "3px",
      right: "3px"
    });
    hueGradient(_this2.__hue_field);
    Common.extend(_this2.__input.style, {
      outline: "none",
      textAlign: "center",
      color: "#fff",
      border: 0,
      fontWeight: "bold",
      textShadow: _this2.__input_textShadow + "rgba(0,0,0,0.7)"
    });
    dom.bind(_this2.__saturation_field, "mousedown", fieldDown);
    dom.bind(_this2.__saturation_field, "touchstart", fieldDown);
    dom.bind(_this2.__field_knob, "mousedown", fieldDown);
    dom.bind(_this2.__field_knob, "touchstart", fieldDown);
    dom.bind(_this2.__hue_field, "mousedown", fieldDownH);
    dom.bind(_this2.__hue_field, "touchstart", fieldDownH);
    function fieldDown(e) {
      setSV(e);
      dom.bind(window, "mousemove", setSV);
      dom.bind(window, "touchmove", setSV);
      dom.bind(window, "mouseup", fieldUpSV);
      dom.bind(window, "touchend", fieldUpSV);
    }
    function fieldDownH(e) {
      setH(e);
      dom.bind(window, "mousemove", setH);
      dom.bind(window, "touchmove", setH);
      dom.bind(window, "mouseup", fieldUpH);
      dom.bind(window, "touchend", fieldUpH);
    }
    function fieldUpSV() {
      dom.unbind(window, "mousemove", setSV);
      dom.unbind(window, "touchmove", setSV);
      dom.unbind(window, "mouseup", fieldUpSV);
      dom.unbind(window, "touchend", fieldUpSV);
      onFinish();
    }
    function fieldUpH() {
      dom.unbind(window, "mousemove", setH);
      dom.unbind(window, "touchmove", setH);
      dom.unbind(window, "mouseup", fieldUpH);
      dom.unbind(window, "touchend", fieldUpH);
      onFinish();
    }
    function onBlur() {
      var i = interpret(this.value);
      if (i !== false) {
        _this.__color.__state = i;
        _this.setValue(_this.__color.toOriginal());
      } else {
        this.value = _this.__color.toString();
      }
    }
    function onFinish() {
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.__color.toOriginal());
      }
    }
    _this2.__saturation_field.appendChild(valueField);
    _this2.__selector.appendChild(_this2.__field_knob);
    _this2.__selector.appendChild(_this2.__saturation_field);
    _this2.__selector.appendChild(_this2.__hue_field);
    _this2.__hue_field.appendChild(_this2.__hue_knob);
    _this2.domElement.appendChild(_this2.__input);
    _this2.domElement.appendChild(_this2.__selector);
    _this2.updateDisplay();
    function setSV(e) {
      if (e.type.indexOf("touch") === -1) {
        e.preventDefault();
      }
      var fieldRect = _this.__saturation_field.getBoundingClientRect();
      var _ref = e.touches && e.touches[0] || e, clientX = _ref.clientX, clientY = _ref.clientY;
      var s = (clientX - fieldRect.left) / (fieldRect.right - fieldRect.left);
      var v = 1 - (clientY - fieldRect.top) / (fieldRect.bottom - fieldRect.top);
      if (v > 1) {
        v = 1;
      } else if (v < 0) {
        v = 0;
      }
      if (s > 1) {
        s = 1;
      } else if (s < 0) {
        s = 0;
      }
      _this.__color.v = v;
      _this.__color.s = s;
      _this.setValue(_this.__color.toOriginal());
      return false;
    }
    function setH(e) {
      if (e.type.indexOf("touch") === -1) {
        e.preventDefault();
      }
      var fieldRect = _this.__hue_field.getBoundingClientRect();
      var _ref2 = e.touches && e.touches[0] || e, clientY = _ref2.clientY;
      var h = 1 - (clientY - fieldRect.top) / (fieldRect.bottom - fieldRect.top);
      if (h > 1) {
        h = 1;
      } else if (h < 0) {
        h = 0;
      }
      _this.__color.h = h * 360;
      _this.setValue(_this.__color.toOriginal());
      return false;
    }
    return _this2;
  }
  createClass(ColorController2, [{
    key: "updateDisplay",
    value: function updateDisplay2() {
      var i = interpret(this.getValue());
      if (i !== false) {
        var mismatch = false;
        Common.each(Color.COMPONENTS, function(component) {
          if (!Common.isUndefined(i[component]) && !Common.isUndefined(this.__color.__state[component]) && i[component] !== this.__color.__state[component]) {
            mismatch = true;
            return {};
          }
        }, this);
        if (mismatch) {
          Common.extend(this.__color.__state, i);
        }
      }
      Common.extend(this.__temp.__state, this.__color.__state);
      this.__temp.a = 1;
      var flip = this.__color.v < 0.5 || this.__color.s > 0.5 ? 255 : 0;
      var _flip = 255 - flip;
      Common.extend(this.__field_knob.style, {
        marginLeft: 100 * this.__color.s - 7 + "px",
        marginTop: 100 * (1 - this.__color.v) - 7 + "px",
        backgroundColor: this.__temp.toHexString(),
        border: this.__field_knob_border + "rgb(" + flip + "," + flip + "," + flip + ")"
      });
      this.__hue_knob.style.marginTop = (1 - this.__color.h / 360) * 100 + "px";
      this.__temp.s = 1;
      this.__temp.v = 1;
      linearGradient(this.__saturation_field, "left", "#fff", this.__temp.toHexString());
      this.__input.value = this.__color.toString();
      Common.extend(this.__input.style, {
        backgroundColor: this.__color.toHexString(),
        color: "rgb(" + flip + "," + flip + "," + flip + ")",
        textShadow: this.__input_textShadow + "rgba(" + _flip + "," + _flip + "," + _flip + ",.7)"
      });
    }
  }]);
  return ColorController2;
}(Controller);
var vendors = ["-moz-", "-o-", "-webkit-", "-ms-", ""];
function linearGradient(elem, x, a, b) {
  elem.style.background = "";
  Common.each(vendors, function(vendor) {
    elem.style.cssText += "background: " + vendor + "linear-gradient(" + x + ", " + a + " 0%, " + b + " 100%); ";
  });
}
function hueGradient(elem) {
  elem.style.background = "";
  elem.style.cssText += "background: -moz-linear-gradient(top,  #ff0000 0%, #ff00ff 17%, #0000ff 34%, #00ffff 50%, #00ff00 67%, #ffff00 84%, #ff0000 100%);";
  elem.style.cssText += "background: -webkit-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);";
  elem.style.cssText += "background: -o-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);";
  elem.style.cssText += "background: -ms-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);";
  elem.style.cssText += "background: linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);";
}
var css = {
  load: function load(url, indoc) {
    var doc = indoc || document;
    var link = doc.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = url;
    doc.getElementsByTagName("head")[0].appendChild(link);
  },
  inject: function inject(cssContent, indoc) {
    var doc = indoc || document;
    var injected = document.createElement("style");
    injected.type = "text/css";
    injected.innerHTML = cssContent;
    var head = doc.getElementsByTagName("head")[0];
    try {
      head.appendChild(injected);
    } catch (e) {
    }
  }
};
var saveDialogContents = `<div id="dg-save" class="dg dialogue">

  Here's the new load parameter for your <code>GUI</code>'s constructor:

  <textarea id="dg-new-constructor"></textarea>

  <div id="dg-save-locally">

    <input id="dg-local-storage" type="checkbox"/> Automatically save
    values to <code>localStorage</code> on exit.

    <div id="dg-local-explain">The values saved to <code>localStorage</code> will
      override those passed to <code>dat.GUI</code>'s constructor. This makes it
      easier to work incrementally, but <code>localStorage</code> is fragile,
      and your friends may not see the same values you do.

    </div>

  </div>

</div>`;
var ControllerFactory = function ControllerFactory2(object, property) {
  var initialValue = object[property];
  if (Common.isArray(arguments[2]) || Common.isObject(arguments[2])) {
    return new OptionController(object, property, arguments[2]);
  }
  if (Common.isNumber(initialValue)) {
    if (Common.isNumber(arguments[2]) && Common.isNumber(arguments[3])) {
      if (Common.isNumber(arguments[4])) {
        return new NumberControllerSlider(object, property, arguments[2], arguments[3], arguments[4]);
      }
      return new NumberControllerSlider(object, property, arguments[2], arguments[3]);
    }
    if (Common.isNumber(arguments[4])) {
      return new NumberControllerBox(object, property, { min: arguments[2], max: arguments[3], step: arguments[4] });
    }
    return new NumberControllerBox(object, property, { min: arguments[2], max: arguments[3] });
  }
  if (Common.isString(initialValue)) {
    return new StringController(object, property);
  }
  if (Common.isFunction(initialValue)) {
    return new FunctionController(object, property, "");
  }
  if (Common.isBoolean(initialValue)) {
    return new BooleanController(object, property);
  }
  return null;
};
function requestAnimationFrame(callback) {
  setTimeout(callback, 1e3 / 60);
}
var requestAnimationFrame$1 = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || requestAnimationFrame;
var CenteredDiv = function() {
  function CenteredDiv2() {
    classCallCheck(this, CenteredDiv2);
    this.backgroundElement = document.createElement("div");
    Common.extend(this.backgroundElement.style, {
      backgroundColor: "rgba(0,0,0,0.8)",
      top: 0,
      left: 0,
      display: "none",
      zIndex: "1000",
      opacity: 0,
      WebkitTransition: "opacity 0.2s linear",
      transition: "opacity 0.2s linear"
    });
    dom.makeFullscreen(this.backgroundElement);
    this.backgroundElement.style.position = "fixed";
    this.domElement = document.createElement("div");
    Common.extend(this.domElement.style, {
      position: "fixed",
      display: "none",
      zIndex: "1001",
      opacity: 0,
      WebkitTransition: "-webkit-transform 0.2s ease-out, opacity 0.2s linear",
      transition: "transform 0.2s ease-out, opacity 0.2s linear"
    });
    document.body.appendChild(this.backgroundElement);
    document.body.appendChild(this.domElement);
    var _this = this;
    dom.bind(this.backgroundElement, "click", function() {
      _this.hide();
    });
  }
  createClass(CenteredDiv2, [{
    key: "show",
    value: function show2() {
      var _this = this;
      this.backgroundElement.style.display = "block";
      this.domElement.style.display = "block";
      this.domElement.style.opacity = 0;
      this.domElement.style.webkitTransform = "scale(1.1)";
      this.layout();
      Common.defer(function() {
        _this.backgroundElement.style.opacity = 1;
        _this.domElement.style.opacity = 1;
        _this.domElement.style.webkitTransform = "scale(1)";
      });
    }
  }, {
    key: "hide",
    value: function hide3() {
      var _this = this;
      var hide4 = function hide5() {
        _this.domElement.style.display = "none";
        _this.backgroundElement.style.display = "none";
        dom.unbind(_this.domElement, "webkitTransitionEnd", hide5);
        dom.unbind(_this.domElement, "transitionend", hide5);
        dom.unbind(_this.domElement, "oTransitionEnd", hide5);
      };
      dom.bind(this.domElement, "webkitTransitionEnd", hide4);
      dom.bind(this.domElement, "transitionend", hide4);
      dom.bind(this.domElement, "oTransitionEnd", hide4);
      this.backgroundElement.style.opacity = 0;
      this.domElement.style.opacity = 0;
      this.domElement.style.webkitTransform = "scale(1.1)";
    }
  }, {
    key: "layout",
    value: function layout() {
      this.domElement.style.left = window.innerWidth / 2 - dom.getWidth(this.domElement) / 2 + "px";
      this.domElement.style.top = window.innerHeight / 2 - dom.getHeight(this.domElement) / 2 + "px";
    }
  }]);
  return CenteredDiv2;
}();
var styleSheet = ___$insertStyle(".dg ul{list-style:none;margin:0;padding:0;width:100%;clear:both}.dg.ac{position:fixed;top:0;left:0;right:0;height:0;z-index:0}.dg:not(.ac) .main{overflow:hidden}.dg.main{-webkit-transition:opacity .1s linear;-o-transition:opacity .1s linear;-moz-transition:opacity .1s linear;transition:opacity .1s linear}.dg.main.taller-than-window{overflow-y:auto}.dg.main.taller-than-window .close-button{opacity:1;margin-top:-1px;border-top:1px solid #2c2c2c}.dg.main ul.closed .close-button{opacity:1 !important}.dg.main:hover .close-button,.dg.main .close-button.drag{opacity:1}.dg.main .close-button{-webkit-transition:opacity .1s linear;-o-transition:opacity .1s linear;-moz-transition:opacity .1s linear;transition:opacity .1s linear;border:0;line-height:19px;height:20px;cursor:pointer;text-align:center;background-color:#000}.dg.main .close-button.close-top{position:relative}.dg.main .close-button.close-bottom{position:absolute}.dg.main .close-button:hover{background-color:#111}.dg.a{float:right;margin-right:15px;overflow-y:visible}.dg.a.has-save>ul.close-top{margin-top:0}.dg.a.has-save>ul.close-bottom{margin-top:27px}.dg.a.has-save>ul.closed{margin-top:0}.dg.a .save-row{top:0;z-index:1002}.dg.a .save-row.close-top{position:relative}.dg.a .save-row.close-bottom{position:fixed}.dg li{-webkit-transition:height .1s ease-out;-o-transition:height .1s ease-out;-moz-transition:height .1s ease-out;transition:height .1s ease-out;-webkit-transition:overflow .1s linear;-o-transition:overflow .1s linear;-moz-transition:overflow .1s linear;transition:overflow .1s linear}.dg li:not(.folder){cursor:auto;height:27px;line-height:27px;padding:0 4px 0 5px}.dg li.folder{padding:0;border-left:4px solid rgba(0,0,0,0)}.dg li.title{cursor:pointer;margin-left:-4px}.dg .closed li:not(.title),.dg .closed ul li,.dg .closed ul li>*{height:0;overflow:hidden;border:0}.dg .cr{clear:both;padding-left:3px;height:27px;overflow:hidden}.dg .property-name{cursor:default;float:left;clear:left;width:40%;overflow:hidden;text-overflow:ellipsis}.dg .c{float:left;width:60%;position:relative}.dg .c input[type=text]{border:0;margin-top:4px;padding:3px;width:100%;float:right}.dg .has-slider input[type=text]{width:30%;margin-left:0}.dg .slider{float:left;width:66%;margin-left:-5px;margin-right:0;height:19px;margin-top:4px}.dg .slider-fg{height:100%}.dg .c input[type=checkbox]{margin-top:7px}.dg .c select{margin-top:5px}.dg .cr.function,.dg .cr.function .property-name,.dg .cr.function *,.dg .cr.boolean,.dg .cr.boolean *{cursor:pointer}.dg .cr.color{overflow:visible}.dg .selector{display:none;position:absolute;margin-left:-9px;margin-top:23px;z-index:10}.dg .c:hover .selector,.dg .selector.drag{display:block}.dg li.save-row{padding:0}.dg li.save-row .button{display:inline-block;padding:0px 6px}.dg.dialogue{background-color:#222;width:460px;padding:15px;font-size:13px;line-height:15px}#dg-new-constructor{padding:10px;color:#222;font-family:Monaco, monospace;font-size:10px;border:0;resize:none;box-shadow:inset 1px 1px 1px #888;word-wrap:break-word;margin:12px 0;display:block;width:440px;overflow-y:scroll;height:100px;position:relative}#dg-local-explain{display:none;font-size:11px;line-height:17px;border-radius:3px;background-color:#333;padding:8px;margin-top:10px}#dg-local-explain code{font-size:10px}#dat-gui-save-locally{display:none}.dg{color:#eee;font:11px 'Lucida Grande', sans-serif;text-shadow:0 -1px 0 #111}.dg.main::-webkit-scrollbar{width:5px;background:#1a1a1a}.dg.main::-webkit-scrollbar-corner{height:0;display:none}.dg.main::-webkit-scrollbar-thumb{border-radius:5px;background:#676767}.dg li:not(.folder){background:#1a1a1a;border-bottom:1px solid #2c2c2c}.dg li.save-row{line-height:25px;background:#dad5cb;border:0}.dg li.save-row select{margin-left:5px;width:108px}.dg li.save-row .button{margin-left:5px;margin-top:1px;border-radius:2px;font-size:9px;line-height:7px;padding:4px 4px 5px 4px;background:#c5bdad;color:#fff;text-shadow:0 1px 0 #b0a58f;box-shadow:0 -1px 0 #b0a58f;cursor:pointer}.dg li.save-row .button.gears{background:#c5bdad url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAANCAYAAAB/9ZQ7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAQJJREFUeNpiYKAU/P//PwGIC/ApCABiBSAW+I8AClAcgKxQ4T9hoMAEUrxx2QSGN6+egDX+/vWT4e7N82AMYoPAx/evwWoYoSYbACX2s7KxCxzcsezDh3evFoDEBYTEEqycggWAzA9AuUSQQgeYPa9fPv6/YWm/Acx5IPb7ty/fw+QZblw67vDs8R0YHyQhgObx+yAJkBqmG5dPPDh1aPOGR/eugW0G4vlIoTIfyFcA+QekhhHJhPdQxbiAIguMBTQZrPD7108M6roWYDFQiIAAv6Aow/1bFwXgis+f2LUAynwoIaNcz8XNx3Dl7MEJUDGQpx9gtQ8YCueB+D26OECAAQDadt7e46D42QAAAABJRU5ErkJggg==) 2px 1px no-repeat;height:7px;width:8px}.dg li.save-row .button:hover{background-color:#bab19e;box-shadow:0 -1px 0 #b0a58f}.dg li.folder{border-bottom:0}.dg li.title{padding-left:16px;background:#000 url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlI+hKgFxoCgAOw==) 6px 10px no-repeat;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.2)}.dg .closed li.title{background-image:url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlGIWqMCbWAEAOw==)}.dg .cr.boolean{border-left:3px solid #806787}.dg .cr.color{border-left:3px solid}.dg .cr.function{border-left:3px solid #e61d5f}.dg .cr.number{border-left:3px solid #2FA1D6}.dg .cr.number input[type=text]{color:#2FA1D6}.dg .cr.string{border-left:3px solid #1ed36f}.dg .cr.string input[type=text]{color:#1ed36f}.dg .cr.function:hover,.dg .cr.boolean:hover{background:#111}.dg .c input[type=text]{background:#303030;outline:none}.dg .c input[type=text]:hover{background:#3c3c3c}.dg .c input[type=text]:focus{background:#494949;color:#fff}.dg .c .slider{background:#303030;cursor:ew-resize}.dg .c .slider-fg{background:#2FA1D6;max-width:100%}.dg .c .slider:hover{background:#3c3c3c}.dg .c .slider:hover .slider-fg{background:#44abda}\n");
css.inject(styleSheet);
var CSS_NAMESPACE = "dg";
var HIDE_KEY_CODE = 72;
var CLOSE_BUTTON_HEIGHT = 20;
var DEFAULT_DEFAULT_PRESET_NAME = "Default";
var SUPPORTS_LOCAL_STORAGE = function() {
  try {
    return !!window.localStorage;
  } catch (e) {
    return false;
  }
}();
var SAVE_DIALOGUE = void 0;
var autoPlaceVirgin = true;
var autoPlaceContainer = void 0;
var hide = false;
var hideableGuis = [];
var GUI = function GUI2(pars) {
  var _this = this;
  var params = pars || {};
  this.domElement = document.createElement("div");
  this.__ul = document.createElement("ul");
  this.domElement.appendChild(this.__ul);
  dom.addClass(this.domElement, CSS_NAMESPACE);
  this.__folders = {};
  this.__controllers = [];
  this.__rememberedObjects = [];
  this.__rememberedObjectIndecesToControllers = [];
  this.__listening = [];
  params = Common.defaults(params, {
    closeOnTop: false,
    autoPlace: true,
    width: GUI2.DEFAULT_WIDTH
  });
  params = Common.defaults(params, {
    resizable: params.autoPlace,
    hideable: params.autoPlace
  });
  if (!Common.isUndefined(params.load)) {
    if (params.preset) {
      params.load.preset = params.preset;
    }
  } else {
    params.load = { preset: DEFAULT_DEFAULT_PRESET_NAME };
  }
  if (Common.isUndefined(params.parent) && params.hideable) {
    hideableGuis.push(this);
  }
  params.resizable = Common.isUndefined(params.parent) && params.resizable;
  if (params.autoPlace && Common.isUndefined(params.scrollable)) {
    params.scrollable = true;
  }
  var useLocalStorage = SUPPORTS_LOCAL_STORAGE && localStorage.getItem(getLocalStorageHash(this, "isLocal")) === "true";
  var saveToLocalStorage = void 0;
  var titleRow = void 0;
  Object.defineProperties(this, {
    parent: {
      get: function get$$13() {
        return params.parent;
      }
    },
    scrollable: {
      get: function get$$13() {
        return params.scrollable;
      }
    },
    autoPlace: {
      get: function get$$13() {
        return params.autoPlace;
      }
    },
    closeOnTop: {
      get: function get$$13() {
        return params.closeOnTop;
      }
    },
    preset: {
      get: function get$$13() {
        if (_this.parent) {
          return _this.getRoot().preset;
        }
        return params.load.preset;
      },
      set: function set$$13(v) {
        if (_this.parent) {
          _this.getRoot().preset = v;
        } else {
          params.load.preset = v;
        }
        setPresetSelectIndex(this);
        _this.revert();
      }
    },
    width: {
      get: function get$$13() {
        return params.width;
      },
      set: function set$$13(v) {
        params.width = v;
        setWidth(_this, v);
      }
    },
    name: {
      get: function get$$13() {
        return params.name;
      },
      set: function set$$13(v) {
        params.name = v;
        if (titleRow) {
          titleRow.innerHTML = params.name;
        }
      }
    },
    closed: {
      get: function get$$13() {
        return params.closed;
      },
      set: function set$$13(v) {
        params.closed = v;
        if (params.closed) {
          dom.addClass(_this.__ul, GUI2.CLASS_CLOSED);
        } else {
          dom.removeClass(_this.__ul, GUI2.CLASS_CLOSED);
        }
        this.onResize();
        if (_this.__closeButton) {
          _this.__closeButton.innerHTML = v ? GUI2.TEXT_OPEN : GUI2.TEXT_CLOSED;
        }
      }
    },
    load: {
      get: function get$$13() {
        return params.load;
      }
    },
    useLocalStorage: {
      get: function get$$13() {
        return useLocalStorage;
      },
      set: function set$$13(bool) {
        if (SUPPORTS_LOCAL_STORAGE) {
          useLocalStorage = bool;
          if (bool) {
            dom.bind(window, "unload", saveToLocalStorage);
          } else {
            dom.unbind(window, "unload", saveToLocalStorage);
          }
          localStorage.setItem(getLocalStorageHash(_this, "isLocal"), bool);
        }
      }
    }
  });
  if (Common.isUndefined(params.parent)) {
    this.closed = params.closed || false;
    dom.addClass(this.domElement, GUI2.CLASS_MAIN);
    dom.makeSelectable(this.domElement, false);
    if (SUPPORTS_LOCAL_STORAGE) {
      if (useLocalStorage) {
        _this.useLocalStorage = true;
        var savedGui = localStorage.getItem(getLocalStorageHash(this, "gui"));
        if (savedGui) {
          params.load = JSON.parse(savedGui);
        }
      }
    }
    this.__closeButton = document.createElement("div");
    this.__closeButton.innerHTML = GUI2.TEXT_CLOSED;
    dom.addClass(this.__closeButton, GUI2.CLASS_CLOSE_BUTTON);
    if (params.closeOnTop) {
      dom.addClass(this.__closeButton, GUI2.CLASS_CLOSE_TOP);
      this.domElement.insertBefore(this.__closeButton, this.domElement.childNodes[0]);
    } else {
      dom.addClass(this.__closeButton, GUI2.CLASS_CLOSE_BOTTOM);
      this.domElement.appendChild(this.__closeButton);
    }
    dom.bind(this.__closeButton, "click", function() {
      _this.closed = !_this.closed;
    });
  } else {
    if (params.closed === void 0) {
      params.closed = true;
    }
    var titleRowName = document.createTextNode(params.name);
    dom.addClass(titleRowName, "controller-name");
    titleRow = addRow(_this, titleRowName);
    var onClickTitle = function onClickTitle2(e) {
      e.preventDefault();
      _this.closed = !_this.closed;
      return false;
    };
    dom.addClass(this.__ul, GUI2.CLASS_CLOSED);
    dom.addClass(titleRow, "title");
    dom.bind(titleRow, "click", onClickTitle);
    if (!params.closed) {
      this.closed = false;
    }
  }
  if (params.autoPlace) {
    if (Common.isUndefined(params.parent)) {
      if (autoPlaceVirgin) {
        autoPlaceContainer = document.createElement("div");
        dom.addClass(autoPlaceContainer, CSS_NAMESPACE);
        dom.addClass(autoPlaceContainer, GUI2.CLASS_AUTO_PLACE_CONTAINER);
        document.body.appendChild(autoPlaceContainer);
        autoPlaceVirgin = false;
      }
      autoPlaceContainer.appendChild(this.domElement);
      dom.addClass(this.domElement, GUI2.CLASS_AUTO_PLACE);
    }
    if (!this.parent) {
      setWidth(_this, params.width);
    }
  }
  this.__resizeHandler = function() {
    _this.onResizeDebounced();
  };
  dom.bind(window, "resize", this.__resizeHandler);
  dom.bind(this.__ul, "webkitTransitionEnd", this.__resizeHandler);
  dom.bind(this.__ul, "transitionend", this.__resizeHandler);
  dom.bind(this.__ul, "oTransitionEnd", this.__resizeHandler);
  this.onResize();
  if (params.resizable) {
    addResizeHandle(this);
  }
  saveToLocalStorage = function saveToLocalStorage2() {
    if (SUPPORTS_LOCAL_STORAGE && localStorage.getItem(getLocalStorageHash(_this, "isLocal")) === "true") {
      localStorage.setItem(getLocalStorageHash(_this, "gui"), JSON.stringify(_this.getSaveObject()));
    }
  };
  this.saveToLocalStorageIfPossible = saveToLocalStorage;
  function resetWidth() {
    var root = _this.getRoot();
    root.width += 1;
    Common.defer(function() {
      root.width -= 1;
    });
  }
  if (!params.parent) {
    resetWidth();
  }
};
GUI.toggleHide = function() {
  hide = !hide;
  Common.each(hideableGuis, function(gui) {
    gui.domElement.style.display = hide ? "none" : "";
  });
};
GUI.CLASS_AUTO_PLACE = "a";
GUI.CLASS_AUTO_PLACE_CONTAINER = "ac";
GUI.CLASS_MAIN = "main";
GUI.CLASS_CONTROLLER_ROW = "cr";
GUI.CLASS_TOO_TALL = "taller-than-window";
GUI.CLASS_CLOSED = "closed";
GUI.CLASS_CLOSE_BUTTON = "close-button";
GUI.CLASS_CLOSE_TOP = "close-top";
GUI.CLASS_CLOSE_BOTTOM = "close-bottom";
GUI.CLASS_DRAG = "drag";
GUI.DEFAULT_WIDTH = 245;
GUI.TEXT_CLOSED = "Close Controls";
GUI.TEXT_OPEN = "Open Controls";
GUI._keydownHandler = function(e) {
  if (document.activeElement.type !== "text" && (e.which === HIDE_KEY_CODE || e.keyCode === HIDE_KEY_CODE)) {
    GUI.toggleHide();
  }
};
dom.bind(window, "keydown", GUI._keydownHandler, false);
Common.extend(GUI.prototype, {
  add: function add(object, property) {
    return _add(this, object, property, {
      factoryArgs: Array.prototype.slice.call(arguments, 2)
    });
  },
  addColor: function addColor(object, property) {
    return _add(this, object, property, {
      color: true
    });
  },
  remove: function remove(controller) {
    this.__ul.removeChild(controller.__li);
    this.__controllers.splice(this.__controllers.indexOf(controller), 1);
    var _this = this;
    Common.defer(function() {
      _this.onResize();
    });
  },
  destroy: function destroy() {
    if (this.parent) {
      throw new Error("Only the root GUI should be removed with .destroy(). For subfolders, use gui.removeFolder(folder) instead.");
    }
    if (this.autoPlace) {
      autoPlaceContainer.removeChild(this.domElement);
    }
    var _this = this;
    Common.each(this.__folders, function(subfolder) {
      _this.removeFolder(subfolder);
    });
    dom.unbind(window, "keydown", GUI._keydownHandler, false);
    removeListeners(this);
  },
  addFolder: function addFolder(name) {
    if (this.__folders[name] !== void 0) {
      throw new Error('You already have a folder in this GUI by the name "' + name + '"');
    }
    var newGuiParams = { name, parent: this };
    newGuiParams.autoPlace = this.autoPlace;
    if (this.load && this.load.folders && this.load.folders[name]) {
      newGuiParams.closed = this.load.folders[name].closed;
      newGuiParams.load = this.load.folders[name];
    }
    var gui = new GUI(newGuiParams);
    this.__folders[name] = gui;
    var li = addRow(this, gui.domElement);
    dom.addClass(li, "folder");
    return gui;
  },
  removeFolder: function removeFolder(folder) {
    this.__ul.removeChild(folder.domElement.parentElement);
    delete this.__folders[folder.name];
    if (this.load && this.load.folders && this.load.folders[folder.name]) {
      delete this.load.folders[folder.name];
    }
    removeListeners(folder);
    var _this = this;
    Common.each(folder.__folders, function(subfolder) {
      folder.removeFolder(subfolder);
    });
    Common.defer(function() {
      _this.onResize();
    });
  },
  open: function open() {
    this.closed = false;
  },
  close: function close() {
    this.closed = true;
  },
  hide: function hide2() {
    this.domElement.style.display = "none";
  },
  show: function show() {
    this.domElement.style.display = "";
  },
  onResize: function onResize() {
    var root = this.getRoot();
    if (root.scrollable) {
      var top = dom.getOffset(root.__ul).top;
      var h = 0;
      Common.each(root.__ul.childNodes, function(node) {
        if (!(root.autoPlace && node === root.__save_row)) {
          h += dom.getHeight(node);
        }
      });
      if (window.innerHeight - top - CLOSE_BUTTON_HEIGHT < h) {
        dom.addClass(root.domElement, GUI.CLASS_TOO_TALL);
        root.__ul.style.height = window.innerHeight - top - CLOSE_BUTTON_HEIGHT + "px";
      } else {
        dom.removeClass(root.domElement, GUI.CLASS_TOO_TALL);
        root.__ul.style.height = "auto";
      }
    }
    if (root.__resize_handle) {
      Common.defer(function() {
        root.__resize_handle.style.height = root.__ul.offsetHeight + "px";
      });
    }
    if (root.__closeButton) {
      root.__closeButton.style.width = root.width + "px";
    }
  },
  onResizeDebounced: Common.debounce(function() {
    this.onResize();
  }, 50),
  remember: function remember() {
    if (Common.isUndefined(SAVE_DIALOGUE)) {
      SAVE_DIALOGUE = new CenteredDiv();
      SAVE_DIALOGUE.domElement.innerHTML = saveDialogContents;
    }
    if (this.parent) {
      throw new Error("You can only call remember on a top level GUI.");
    }
    var _this = this;
    Common.each(Array.prototype.slice.call(arguments), function(object) {
      if (_this.__rememberedObjects.length === 0) {
        addSaveMenu(_this);
      }
      if (_this.__rememberedObjects.indexOf(object) === -1) {
        _this.__rememberedObjects.push(object);
      }
    });
    if (this.autoPlace) {
      setWidth(this, this.width);
    }
  },
  getRoot: function getRoot() {
    var gui = this;
    while (gui.parent) {
      gui = gui.parent;
    }
    return gui;
  },
  getSaveObject: function getSaveObject() {
    var toReturn2 = this.load;
    toReturn2.closed = this.closed;
    if (this.__rememberedObjects.length > 0) {
      toReturn2.preset = this.preset;
      if (!toReturn2.remembered) {
        toReturn2.remembered = {};
      }
      toReturn2.remembered[this.preset] = getCurrentPreset(this);
    }
    toReturn2.folders = {};
    Common.each(this.__folders, function(element, key) {
      toReturn2.folders[key] = element.getSaveObject();
    });
    return toReturn2;
  },
  save: function save() {
    if (!this.load.remembered) {
      this.load.remembered = {};
    }
    this.load.remembered[this.preset] = getCurrentPreset(this);
    markPresetModified(this, false);
    this.saveToLocalStorageIfPossible();
  },
  saveAs: function saveAs(presetName) {
    if (!this.load.remembered) {
      this.load.remembered = {};
      this.load.remembered[DEFAULT_DEFAULT_PRESET_NAME] = getCurrentPreset(this, true);
    }
    this.load.remembered[presetName] = getCurrentPreset(this);
    this.preset = presetName;
    addPresetOption(this, presetName, true);
    this.saveToLocalStorageIfPossible();
  },
  revert: function revert(gui) {
    Common.each(this.__controllers, function(controller) {
      if (!this.getRoot().load.remembered) {
        controller.setValue(controller.initialValue);
      } else {
        recallSavedValue(gui || this.getRoot(), controller);
      }
      if (controller.__onFinishChange) {
        controller.__onFinishChange.call(controller, controller.getValue());
      }
    }, this);
    Common.each(this.__folders, function(folder) {
      folder.revert(folder);
    });
    if (!gui) {
      markPresetModified(this.getRoot(), false);
    }
  },
  listen: function listen(controller) {
    var init = this.__listening.length === 0;
    this.__listening.push(controller);
    if (init) {
      updateDisplays(this.__listening);
    }
  },
  updateDisplay: function updateDisplay() {
    Common.each(this.__controllers, function(controller) {
      controller.updateDisplay();
    });
    Common.each(this.__folders, function(folder) {
      folder.updateDisplay();
    });
  }
});
function addRow(gui, newDom, liBefore) {
  var li = document.createElement("li");
  if (newDom) {
    li.appendChild(newDom);
  }
  if (liBefore) {
    gui.__ul.insertBefore(li, liBefore);
  } else {
    gui.__ul.appendChild(li);
  }
  gui.onResize();
  return li;
}
function removeListeners(gui) {
  dom.unbind(window, "resize", gui.__resizeHandler);
  if (gui.saveToLocalStorageIfPossible) {
    dom.unbind(window, "unload", gui.saveToLocalStorageIfPossible);
  }
}
function markPresetModified(gui, modified) {
  var opt = gui.__preset_select[gui.__preset_select.selectedIndex];
  if (modified) {
    opt.innerHTML = opt.value + "*";
  } else {
    opt.innerHTML = opt.value;
  }
}
function augmentController(gui, li, controller) {
  controller.__li = li;
  controller.__gui = gui;
  Common.extend(controller, {
    options: function options(_options) {
      if (arguments.length > 1) {
        var nextSibling = controller.__li.nextElementSibling;
        controller.remove();
        return _add(gui, controller.object, controller.property, {
          before: nextSibling,
          factoryArgs: [Common.toArray(arguments)]
        });
      }
      if (Common.isArray(_options) || Common.isObject(_options)) {
        var _nextSibling = controller.__li.nextElementSibling;
        controller.remove();
        return _add(gui, controller.object, controller.property, {
          before: _nextSibling,
          factoryArgs: [_options]
        });
      }
    },
    name: function name(_name) {
      controller.__li.firstElementChild.firstElementChild.innerHTML = _name;
      return controller;
    },
    listen: function listen2() {
      controller.__gui.listen(controller);
      return controller;
    },
    remove: function remove2() {
      controller.__gui.remove(controller);
      return controller;
    }
  });
  if (controller instanceof NumberControllerSlider) {
    var box = new NumberControllerBox(controller.object, controller.property, { min: controller.__min, max: controller.__max, step: controller.__step });
    Common.each(["updateDisplay", "onChange", "onFinishChange", "step", "min", "max"], function(method) {
      var pc = controller[method];
      var pb = box[method];
      controller[method] = box[method] = function() {
        var args = Array.prototype.slice.call(arguments);
        pb.apply(box, args);
        return pc.apply(controller, args);
      };
    });
    dom.addClass(li, "has-slider");
    controller.domElement.insertBefore(box.domElement, controller.domElement.firstElementChild);
  } else if (controller instanceof NumberControllerBox) {
    var r = function r2(returned) {
      if (Common.isNumber(controller.__min) && Common.isNumber(controller.__max)) {
        var oldName = controller.__li.firstElementChild.firstElementChild.innerHTML;
        var wasListening = controller.__gui.__listening.indexOf(controller) > -1;
        controller.remove();
        var newController = _add(gui, controller.object, controller.property, {
          before: controller.__li.nextElementSibling,
          factoryArgs: [controller.__min, controller.__max, controller.__step]
        });
        newController.name(oldName);
        if (wasListening)
          newController.listen();
        return newController;
      }
      return returned;
    };
    controller.min = Common.compose(r, controller.min);
    controller.max = Common.compose(r, controller.max);
  } else if (controller instanceof BooleanController) {
    dom.bind(li, "click", function() {
      dom.fakeEvent(controller.__checkbox, "click");
    });
    dom.bind(controller.__checkbox, "click", function(e) {
      e.stopPropagation();
    });
  } else if (controller instanceof FunctionController) {
    dom.bind(li, "click", function() {
      dom.fakeEvent(controller.__button, "click");
    });
    dom.bind(li, "mouseover", function() {
      dom.addClass(controller.__button, "hover");
    });
    dom.bind(li, "mouseout", function() {
      dom.removeClass(controller.__button, "hover");
    });
  } else if (controller instanceof ColorController) {
    dom.addClass(li, "color");
    controller.updateDisplay = Common.compose(function(val) {
      li.style.borderLeftColor = controller.__color.toString();
      return val;
    }, controller.updateDisplay);
    controller.updateDisplay();
  }
  controller.setValue = Common.compose(function(val) {
    if (gui.getRoot().__preset_select && controller.isModified()) {
      markPresetModified(gui.getRoot(), true);
    }
    return val;
  }, controller.setValue);
}
function recallSavedValue(gui, controller) {
  var root = gui.getRoot();
  var matchedIndex = root.__rememberedObjects.indexOf(controller.object);
  if (matchedIndex !== -1) {
    var controllerMap = root.__rememberedObjectIndecesToControllers[matchedIndex];
    if (controllerMap === void 0) {
      controllerMap = {};
      root.__rememberedObjectIndecesToControllers[matchedIndex] = controllerMap;
    }
    controllerMap[controller.property] = controller;
    if (root.load && root.load.remembered) {
      var presetMap = root.load.remembered;
      var preset = void 0;
      if (presetMap[gui.preset]) {
        preset = presetMap[gui.preset];
      } else if (presetMap[DEFAULT_DEFAULT_PRESET_NAME]) {
        preset = presetMap[DEFAULT_DEFAULT_PRESET_NAME];
      } else {
        return;
      }
      if (preset[matchedIndex] && preset[matchedIndex][controller.property] !== void 0) {
        var value = preset[matchedIndex][controller.property];
        controller.initialValue = value;
        controller.setValue(value);
      }
    }
  }
}
function _add(gui, object, property, params) {
  if (object[property] === void 0) {
    throw new Error('Object "' + object + '" has no property "' + property + '"');
  }
  var controller = void 0;
  if (params.color) {
    controller = new ColorController(object, property);
  } else {
    var factoryArgs = [object, property].concat(params.factoryArgs);
    controller = ControllerFactory.apply(gui, factoryArgs);
  }
  if (params.before instanceof Controller) {
    params.before = params.before.__li;
  }
  recallSavedValue(gui, controller);
  dom.addClass(controller.domElement, "c");
  var name = document.createElement("span");
  dom.addClass(name, "property-name");
  name.innerHTML = controller.property;
  var container = document.createElement("div");
  container.appendChild(name);
  container.appendChild(controller.domElement);
  var li = addRow(gui, container, params.before);
  dom.addClass(li, GUI.CLASS_CONTROLLER_ROW);
  if (controller instanceof ColorController) {
    dom.addClass(li, "color");
  } else {
    dom.addClass(li, _typeof(controller.getValue()));
  }
  augmentController(gui, li, controller);
  gui.__controllers.push(controller);
  return controller;
}
function getLocalStorageHash(gui, key) {
  return document.location.href + "." + key;
}
function addPresetOption(gui, name, setSelected) {
  var opt = document.createElement("option");
  opt.innerHTML = name;
  opt.value = name;
  gui.__preset_select.appendChild(opt);
  if (setSelected) {
    gui.__preset_select.selectedIndex = gui.__preset_select.length - 1;
  }
}
function showHideExplain(gui, explain) {
  explain.style.display = gui.useLocalStorage ? "block" : "none";
}
function addSaveMenu(gui) {
  var div = gui.__save_row = document.createElement("li");
  dom.addClass(gui.domElement, "has-save");
  gui.__ul.insertBefore(div, gui.__ul.firstChild);
  dom.addClass(div, "save-row");
  var gears = document.createElement("span");
  gears.innerHTML = "&nbsp;";
  dom.addClass(gears, "button gears");
  var button = document.createElement("span");
  button.innerHTML = "Save";
  dom.addClass(button, "button");
  dom.addClass(button, "save");
  var button2 = document.createElement("span");
  button2.innerHTML = "New";
  dom.addClass(button2, "button");
  dom.addClass(button2, "save-as");
  var button3 = document.createElement("span");
  button3.innerHTML = "Revert";
  dom.addClass(button3, "button");
  dom.addClass(button3, "revert");
  var select = gui.__preset_select = document.createElement("select");
  if (gui.load && gui.load.remembered) {
    Common.each(gui.load.remembered, function(value, key) {
      addPresetOption(gui, key, key === gui.preset);
    });
  } else {
    addPresetOption(gui, DEFAULT_DEFAULT_PRESET_NAME, false);
  }
  dom.bind(select, "change", function() {
    for (var index = 0; index < gui.__preset_select.length; index++) {
      gui.__preset_select[index].innerHTML = gui.__preset_select[index].value;
    }
    gui.preset = this.value;
  });
  div.appendChild(select);
  div.appendChild(gears);
  div.appendChild(button);
  div.appendChild(button2);
  div.appendChild(button3);
  if (SUPPORTS_LOCAL_STORAGE) {
    var explain = document.getElementById("dg-local-explain");
    var localStorageCheckBox = document.getElementById("dg-local-storage");
    var saveLocally = document.getElementById("dg-save-locally");
    saveLocally.style.display = "block";
    if (localStorage.getItem(getLocalStorageHash(gui, "isLocal")) === "true") {
      localStorageCheckBox.setAttribute("checked", "checked");
    }
    showHideExplain(gui, explain);
    dom.bind(localStorageCheckBox, "change", function() {
      gui.useLocalStorage = !gui.useLocalStorage;
      showHideExplain(gui, explain);
    });
  }
  var newConstructorTextArea = document.getElementById("dg-new-constructor");
  dom.bind(newConstructorTextArea, "keydown", function(e) {
    if (e.metaKey && (e.which === 67 || e.keyCode === 67)) {
      SAVE_DIALOGUE.hide();
    }
  });
  dom.bind(gears, "click", function() {
    newConstructorTextArea.innerHTML = JSON.stringify(gui.getSaveObject(), void 0, 2);
    SAVE_DIALOGUE.show();
    newConstructorTextArea.focus();
    newConstructorTextArea.select();
  });
  dom.bind(button, "click", function() {
    gui.save();
  });
  dom.bind(button2, "click", function() {
    var presetName = prompt("Enter a new preset name.");
    if (presetName) {
      gui.saveAs(presetName);
    }
  });
  dom.bind(button3, "click", function() {
    gui.revert();
  });
}
function addResizeHandle(gui) {
  var pmouseX = void 0;
  gui.__resize_handle = document.createElement("div");
  Common.extend(gui.__resize_handle.style, {
    width: "6px",
    marginLeft: "-3px",
    height: "200px",
    cursor: "ew-resize",
    position: "absolute"
  });
  function drag(e) {
    e.preventDefault();
    gui.width += pmouseX - e.clientX;
    gui.onResize();
    pmouseX = e.clientX;
    return false;
  }
  function dragStop() {
    dom.removeClass(gui.__closeButton, GUI.CLASS_DRAG);
    dom.unbind(window, "mousemove", drag);
    dom.unbind(window, "mouseup", dragStop);
  }
  function dragStart(e) {
    e.preventDefault();
    pmouseX = e.clientX;
    dom.addClass(gui.__closeButton, GUI.CLASS_DRAG);
    dom.bind(window, "mousemove", drag);
    dom.bind(window, "mouseup", dragStop);
    return false;
  }
  dom.bind(gui.__resize_handle, "mousedown", dragStart);
  dom.bind(gui.__closeButton, "mousedown", dragStart);
  gui.domElement.insertBefore(gui.__resize_handle, gui.domElement.firstElementChild);
}
function setWidth(gui, w) {
  gui.domElement.style.width = w + "px";
  if (gui.__save_row && gui.autoPlace) {
    gui.__save_row.style.width = w + "px";
  }
  if (gui.__closeButton) {
    gui.__closeButton.style.width = w + "px";
  }
}
function getCurrentPreset(gui, useInitialValues) {
  var toReturn2 = {};
  Common.each(gui.__rememberedObjects, function(val, index) {
    var savedValues = {};
    var controllerMap = gui.__rememberedObjectIndecesToControllers[index];
    Common.each(controllerMap, function(controller, property) {
      savedValues[property] = useInitialValues ? controller.initialValue : controller.getValue();
    });
    toReturn2[index] = savedValues;
  });
  return toReturn2;
}
function setPresetSelectIndex(gui) {
  for (var index = 0; index < gui.__preset_select.length; index++) {
    if (gui.__preset_select[index].value === gui.preset) {
      gui.__preset_select.selectedIndex = index;
    }
  }
}
function updateDisplays(controllerArray) {
  if (controllerArray.length !== 0) {
    requestAnimationFrame$1.call(window, function() {
      updateDisplays(controllerArray);
    });
  }
  Common.each(controllerArray, function(c) {
    c.updateDisplay();
  });
}
var GUI$1 = GUI;
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
var webmidi_min = { exports: {} };
(function(module) {
  !function(scope) {
    function WebMidi2() {
      if (WebMidi2.prototype._singleton)
        throw new Error("WebMidi is a singleton, it cannot be instantiated directly.");
      (WebMidi2.prototype._singleton = this)._inputs = [], this._outputs = [], this._userHandlers = {}, this._stateChangeQueue = [], this._processingStateChange = false, this._midiInterfaceEvents = ["connected", "disconnected"], this._nrpnBuffer = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []], this._nrpnEventsEnabled = true, this._nrpnTypes = ["entry", "increment", "decrement"], this._notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"], this._semitones = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }, Object.defineProperties(this, { MIDI_SYSTEM_MESSAGES: { value: { sysex: 240, timecode: 241, songposition: 242, songselect: 243, tuningrequest: 246, sysexend: 247, clock: 248, start: 250, continue: 251, stop: 252, activesensing: 254, reset: 255, midimessage: 0, unknownsystemmessage: -1 }, writable: false, enumerable: true, configurable: false }, MIDI_CHANNEL_MESSAGES: { value: { noteoff: 8, noteon: 9, keyaftertouch: 10, controlchange: 11, channelmode: 11, nrpn: 11, programchange: 12, channelaftertouch: 13, pitchbend: 14 }, writable: false, enumerable: true, configurable: false }, MIDI_REGISTERED_PARAMETER: { value: { pitchbendrange: [0, 0], channelfinetuning: [0, 1], channelcoarsetuning: [0, 2], tuningprogram: [0, 3], tuningbank: [0, 4], modulationrange: [0, 5], azimuthangle: [61, 0], elevationangle: [61, 1], gain: [61, 2], distanceratio: [61, 3], maximumdistance: [61, 4], maximumdistancegain: [61, 5], referencedistanceratio: [61, 6], panspreadangle: [61, 7], rollangle: [61, 8] }, writable: false, enumerable: true, configurable: false }, MIDI_CONTROL_CHANGE_MESSAGES: { value: { bankselectcoarse: 0, modulationwheelcoarse: 1, breathcontrollercoarse: 2, footcontrollercoarse: 4, portamentotimecoarse: 5, dataentrycoarse: 6, volumecoarse: 7, balancecoarse: 8, pancoarse: 10, expressioncoarse: 11, effectcontrol1coarse: 12, effectcontrol2coarse: 13, generalpurposeslider1: 16, generalpurposeslider2: 17, generalpurposeslider3: 18, generalpurposeslider4: 19, bankselectfine: 32, modulationwheelfine: 33, breathcontrollerfine: 34, footcontrollerfine: 36, portamentotimefine: 37, dataentryfine: 38, volumefine: 39, balancefine: 40, panfine: 42, expressionfine: 43, effectcontrol1fine: 44, effectcontrol2fine: 45, holdpedal: 64, portamento: 65, sustenutopedal: 66, softpedal: 67, legatopedal: 68, hold2pedal: 69, soundvariation: 70, resonance: 71, soundreleasetime: 72, soundattacktime: 73, brightness: 74, soundcontrol6: 75, soundcontrol7: 76, soundcontrol8: 77, soundcontrol9: 78, soundcontrol10: 79, generalpurposebutton1: 80, generalpurposebutton2: 81, generalpurposebutton3: 82, generalpurposebutton4: 83, reverblevel: 91, tremololevel: 92, choruslevel: 93, celestelevel: 94, phaserlevel: 95, databuttonincrement: 96, databuttondecrement: 97, nonregisteredparametercoarse: 98, nonregisteredparameterfine: 99, registeredparametercoarse: 100, registeredparameterfine: 101 }, writable: false, enumerable: true, configurable: false }, MIDI_NRPN_MESSAGES: { value: { entrymsb: 6, entrylsb: 38, increment: 96, decrement: 97, paramlsb: 98, parammsb: 99, nullactiveparameter: 127 }, writable: false, enumerable: true, configurable: false }, MIDI_CHANNEL_MODE_MESSAGES: { value: { allsoundoff: 120, resetallcontrollers: 121, localcontrol: 122, allnotesoff: 123, omnimodeoff: 124, omnimodeon: 125, monomodeon: 126, polymodeon: 127 }, writable: false, enumerable: true, configurable: false }, octaveOffset: { value: 0, writable: true, enumerable: true, configurable: false } }), Object.defineProperties(this, { supported: { enumerable: true, get: function() {
        return "requestMIDIAccess" in navigator;
      } }, enabled: { enumerable: true, get: function() {
        return this.interface !== void 0;
      }.bind(this) }, inputs: { enumerable: true, get: function() {
        return this._inputs;
      }.bind(this) }, outputs: { enumerable: true, get: function() {
        return this._outputs;
      }.bind(this) }, sysexEnabled: { enumerable: true, get: function() {
        return !(!this.interface || !this.interface.sysexEnabled);
      }.bind(this) }, nrpnEventsEnabled: { enumerable: true, get: function() {
        return !!this._nrpnEventsEnabled;
      }.bind(this), set: function(enabled) {
        return this._nrpnEventsEnabled = enabled, this._nrpnEventsEnabled;
      } }, nrpnTypes: { enumerable: true, get: function() {
        return this._nrpnTypes;
      }.bind(this) }, time: { enumerable: true, get: function() {
        return performance.now();
      } } });
    }
    var wm = new WebMidi2();
    function Input(midiInput) {
      var that = this;
      this._userHandlers = { channel: {}, system: {} }, this._midiInput = midiInput, Object.defineProperties(this, { connection: { enumerable: true, get: function() {
        return that._midiInput.connection;
      } }, id: { enumerable: true, get: function() {
        return that._midiInput.id;
      } }, manufacturer: { enumerable: true, get: function() {
        return that._midiInput.manufacturer;
      } }, name: { enumerable: true, get: function() {
        return that._midiInput.name;
      } }, state: { enumerable: true, get: function() {
        return that._midiInput.state;
      } }, type: { enumerable: true, get: function() {
        return that._midiInput.type;
      } } }), this._initializeUserHandlers(), this._midiInput.onmidimessage = this._onMidiMessage.bind(this);
    }
    function Output(midiOutput) {
      var that = this;
      this._midiOutput = midiOutput, Object.defineProperties(this, { connection: { enumerable: true, get: function() {
        return that._midiOutput.connection;
      } }, id: { enumerable: true, get: function() {
        return that._midiOutput.id;
      } }, manufacturer: { enumerable: true, get: function() {
        return that._midiOutput.manufacturer;
      } }, name: { enumerable: true, get: function() {
        return that._midiOutput.name;
      } }, state: { enumerable: true, get: function() {
        return that._midiOutput.state;
      } }, type: { enumerable: true, get: function() {
        return that._midiOutput.type;
      } } });
    }
    WebMidi2.prototype.enable = function(callback, sysex) {
      this.enabled || (this.supported ? navigator.requestMIDIAccess({ sysex }).then(function(midiAccess) {
        var promiseTimeout, events = [], promises = [];
        this.interface = midiAccess, this._resetInterfaceUserHandlers(), this.interface.onstatechange = function(e) {
          events.push(e);
        };
        for (var inputs = midiAccess.inputs.values(), input = inputs.next(); input && !input.done; input = inputs.next())
          promises.push(input.value.open());
        for (var outputs = midiAccess.outputs.values(), output = outputs.next(); output && !output.done; output = outputs.next())
          promises.push(output.value.open());
        function onPortsOpen() {
          clearTimeout(promiseTimeout), this._updateInputsAndOutputs(), this.interface.onstatechange = this._onInterfaceStateChange.bind(this), typeof callback == "function" && callback.call(this), events.forEach(function(event) {
            this._onInterfaceStateChange(event);
          }.bind(this));
        }
        promiseTimeout = setTimeout(onPortsOpen.bind(this), 200), Promise && Promise.all(promises).catch(function(err) {
        }).then(onPortsOpen.bind(this));
      }.bind(this), function(err) {
        typeof callback == "function" && callback.call(this, err);
      }.bind(this)) : typeof callback == "function" && callback(new Error("The Web MIDI API is not supported by your browser.")));
    }, WebMidi2.prototype.disable = function() {
      if (!this.supported)
        throw new Error("The Web MIDI API is not supported by your browser.");
      this.enabled && (this.removeListener(), this.inputs.forEach(function(input) {
        input.removeListener();
      })), this.interface && (this.interface.onstatechange = void 0), this.interface = void 0, this._inputs = [], this._outputs = [], this._nrpnEventsEnabled = true, this._resetInterfaceUserHandlers();
    }, WebMidi2.prototype.addListener = function(type, listener) {
      if (!this.enabled)
        throw new Error("WebMidi must be enabled before adding event listeners.");
      if (typeof listener != "function")
        throw new TypeError("The 'listener' parameter must be a function.");
      if (!(0 <= this._midiInterfaceEvents.indexOf(type)))
        throw new TypeError("The specified event type is not supported.");
      return this._userHandlers[type].push(listener), this;
    }, WebMidi2.prototype.hasListener = function(type, listener) {
      if (!this.enabled)
        throw new Error("WebMidi must be enabled before checking event listeners.");
      if (typeof listener != "function")
        throw new TypeError("The 'listener' parameter must be a function.");
      if (!(0 <= this._midiInterfaceEvents.indexOf(type)))
        throw new TypeError("The specified event type is not supported.");
      for (var o = 0; o < this._userHandlers[type].length; o++)
        if (this._userHandlers[type][o] === listener)
          return true;
      return false;
    }, WebMidi2.prototype.removeListener = function(type, listener) {
      if (!this.enabled)
        throw new Error("WebMidi must be enabled before removing event listeners.");
      if (listener !== void 0 && typeof listener != "function")
        throw new TypeError("The 'listener' parameter must be a function.");
      if (0 <= this._midiInterfaceEvents.indexOf(type))
        if (listener)
          for (var o = 0; o < this._userHandlers[type].length; o++)
            this._userHandlers[type][o] === listener && this._userHandlers[type].splice(o, 1);
        else
          this._userHandlers[type] = [];
      else {
        if (type !== void 0)
          throw new TypeError("The specified event type is not supported.");
        this._resetInterfaceUserHandlers();
      }
      return this;
    }, WebMidi2.prototype.toMIDIChannels = function(channel) {
      var channels;
      if (channel === "all" || channel === void 0)
        channels = ["all"];
      else {
        if (channel === "none")
          return channels = [];
        channels = Array.isArray(channel) ? channel : [channel];
      }
      return -1 < channels.indexOf("all") && (channels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]), channels.map(function(ch) {
        return parseInt(ch);
      }).filter(function(ch) {
        return 1 <= ch && ch <= 16;
      });
    }, WebMidi2.prototype.getInputById = function(id) {
      if (!this.enabled)
        throw new Error("WebMidi is not enabled.");
      id = String(id);
      for (var i = 0; i < this.inputs.length; i++)
        if (this.inputs[i].id === id)
          return this.inputs[i];
      return false;
    }, WebMidi2.prototype.getOutputById = function(id) {
      if (!this.enabled)
        throw new Error("WebMidi is not enabled.");
      id = String(id);
      for (var i = 0; i < this.outputs.length; i++)
        if (this.outputs[i].id === id)
          return this.outputs[i];
      return false;
    }, WebMidi2.prototype.getInputByName = function(name) {
      if (!this.enabled)
        throw new Error("WebMidi is not enabled.");
      for (var i = 0; i < this.inputs.length; i++)
        if (~this.inputs[i].name.indexOf(name))
          return this.inputs[i];
      return false;
    }, WebMidi2.prototype.getOctave = function(number) {
      if (number != null && 0 <= number && number <= 127)
        return Math.floor(Math.floor(number) / 12 - 1) + Math.floor(wm.octaveOffset);
    }, WebMidi2.prototype.getOutputByName = function(name) {
      if (!this.enabled)
        throw new Error("WebMidi is not enabled.");
      for (var i = 0; i < this.outputs.length; i++)
        if (~this.outputs[i].name.indexOf(name))
          return this.outputs[i];
      return false;
    }, WebMidi2.prototype.guessNoteNumber = function(input) {
      var output = false;
      if (input && input.toFixed && 0 <= input && input <= 127 ? output = Math.round(input) : 0 <= parseInt(input) && parseInt(input) <= 127 ? output = parseInt(input) : (typeof input == "string" || input instanceof String) && (output = this.noteNameToNumber(input)), output === false)
        throw new Error("Invalid input value (" + input + ").");
      return output;
    }, WebMidi2.prototype.noteNameToNumber = function(name) {
      typeof name != "string" && (name = "");
      var matches = name.match(/([CDEFGAB])(#{0,2}|b{0,2})(-?\d+)/i);
      if (!matches)
        throw new RangeError("Invalid note name.");
      var semitones = wm._semitones[matches[1].toUpperCase()], result2 = 12 * (parseInt(matches[3]) + 1 - Math.floor(wm.octaveOffset)) + semitones;
      if (-1 < matches[2].toLowerCase().indexOf("b") ? result2 -= matches[2].length : -1 < matches[2].toLowerCase().indexOf("#") && (result2 += matches[2].length), result2 < 0 || 127 < result2)
        throw new RangeError("Invalid note name or note outside valid range.");
      return result2;
    }, WebMidi2.prototype._updateInputsAndOutputs = function() {
      this._updateInputs(), this._updateOutputs();
    }, WebMidi2.prototype._updateInputs = function() {
      for (var i = 0; i < this._inputs.length; i++) {
        for (var remove2 = true, updated = this.interface.inputs.values(), input = updated.next(); input && !input.done; input = updated.next())
          if (this._inputs[i]._midiInput === input.value) {
            remove2 = false;
            break;
          }
        remove2 && this._inputs.splice(i, 1);
      }
      this.interface && this.interface.inputs.forEach(function(nInput) {
        for (var add2 = true, j = 0; j < this._inputs.length; j++)
          this._inputs[j]._midiInput === nInput && (add2 = false);
        add2 && this._inputs.push(new Input(nInput));
      }.bind(this));
    }, WebMidi2.prototype._updateOutputs = function() {
      for (var i = 0; i < this._outputs.length; i++) {
        for (var remove2 = true, updated = this.interface.outputs.values(), output = updated.next(); output && !output.done; output = updated.next())
          if (this._outputs[i]._midiOutput === output.value) {
            remove2 = false;
            break;
          }
        remove2 && this._outputs.splice(i, 1);
      }
      this.interface && this.interface.outputs.forEach(function(nOutput) {
        for (var add2 = true, j = 0; j < this._outputs.length; j++)
          this._outputs[j]._midiOutput === nOutput && (add2 = false);
        add2 && this._outputs.push(new Output(nOutput));
      }.bind(this));
    }, WebMidi2.prototype._onInterfaceStateChange = function(e) {
      this._updateInputsAndOutputs();
      var event = { timestamp: e.timeStamp, type: e.port.state };
      this.interface && e.port.state === "connected" ? e.port.type === "output" ? event.port = this.getOutputById(e.port.id) : e.port.type === "input" && (event.port = this.getInputById(e.port.id)) : event.port = { connection: "closed", id: e.port.id, manufacturer: e.port.manufacturer, name: e.port.name, state: e.port.state, type: e.port.type }, this._userHandlers[e.port.state].forEach(function(handler) {
        handler(event);
      });
    }, WebMidi2.prototype._resetInterfaceUserHandlers = function() {
      for (var i = 0; i < this._midiInterfaceEvents.length; i++)
        this._userHandlers[this._midiInterfaceEvents[i]] = [];
    }, Input.prototype.on = Input.prototype.addListener = function(type, channel, listener) {
      var that = this;
      if (channel === void 0 && (channel = "all"), Array.isArray(channel) || (channel = [channel]), channel.forEach(function(item) {
        if (item !== "all" && !(1 <= item && item <= 16))
          throw new RangeError("The 'channel' parameter is invalid.");
      }), typeof listener != "function")
        throw new TypeError("The 'listener' parameter must be a function.");
      if (wm.MIDI_SYSTEM_MESSAGES[type] !== void 0)
        this._userHandlers.system[type] || (this._userHandlers.system[type] = []), this._userHandlers.system[type].push(listener);
      else {
        if (wm.MIDI_CHANNEL_MESSAGES[type] === void 0)
          throw new TypeError("The specified event type is not supported.");
        if (-1 < channel.indexOf("all")) {
          channel = [];
          for (var j = 1; j <= 16; j++)
            channel.push(j);
        }
        this._userHandlers.channel[type] || (this._userHandlers.channel[type] = []), channel.forEach(function(ch) {
          that._userHandlers.channel[type][ch] || (that._userHandlers.channel[type][ch] = []), that._userHandlers.channel[type][ch].push(listener);
        });
      }
      return this;
    }, Input.prototype.hasListener = function(type, channel, listener) {
      var that = this;
      if (typeof listener != "function")
        throw new TypeError("The 'listener' parameter must be a function.");
      if (channel === void 0 && (channel = "all"), channel.constructor !== Array && (channel = [channel]), wm.MIDI_SYSTEM_MESSAGES[type] !== void 0) {
        for (var o = 0; o < this._userHandlers.system[type].length; o++)
          if (this._userHandlers.system[type][o] === listener)
            return true;
      } else if (wm.MIDI_CHANNEL_MESSAGES[type] !== void 0) {
        if (-1 < channel.indexOf("all")) {
          channel = [];
          for (var j = 1; j <= 16; j++)
            channel.push(j);
        }
        return !!this._userHandlers.channel[type] && channel.every(function(chNum) {
          var listeners = that._userHandlers.channel[type][chNum];
          return listeners && -1 < listeners.indexOf(listener);
        });
      }
      return false;
    }, Input.prototype.removeListener = function(type, channel, listener) {
      var that = this;
      if (listener !== void 0 && typeof listener != "function")
        throw new TypeError("The 'listener' parameter must be a function.");
      if (channel === void 0 && (channel = "all"), channel.constructor !== Array && (channel = [channel]), wm.MIDI_SYSTEM_MESSAGES[type] !== void 0)
        if (listener === void 0)
          this._userHandlers.system[type] = [];
        else
          for (var o = 0; o < this._userHandlers.system[type].length; o++)
            this._userHandlers.system[type][o] === listener && this._userHandlers.system[type].splice(o, 1);
      else if (wm.MIDI_CHANNEL_MESSAGES[type] !== void 0) {
        if (-1 < channel.indexOf("all")) {
          channel = [];
          for (var j = 1; j <= 16; j++)
            channel.push(j);
        }
        if (!this._userHandlers.channel[type])
          return this;
        channel.forEach(function(chNum) {
          var listeners = that._userHandlers.channel[type][chNum];
          if (listeners)
            if (listener === void 0)
              that._userHandlers.channel[type][chNum] = [];
            else
              for (var l = 0; l < listeners.length; l++)
                listeners[l] === listener && listeners.splice(l, 1);
        });
      } else {
        if (type !== void 0)
          throw new TypeError("The specified event type is not supported.");
        this._initializeUserHandlers();
      }
      return this;
    }, Input.prototype._initializeUserHandlers = function() {
      for (var prop1 in wm.MIDI_CHANNEL_MESSAGES)
        Object.prototype.hasOwnProperty.call(wm.MIDI_CHANNEL_MESSAGES, prop1) && (this._userHandlers.channel[prop1] = {});
      for (var prop2 in wm.MIDI_SYSTEM_MESSAGES)
        Object.prototype.hasOwnProperty.call(wm.MIDI_SYSTEM_MESSAGES, prop2) && (this._userHandlers.system[prop2] = []);
    }, Input.prototype._onMidiMessage = function(e) {
      if (0 < this._userHandlers.system.midimessage.length) {
        var event = { target: this, data: e.data, timestamp: e.timeStamp, type: "midimessage" };
        this._userHandlers.system.midimessage.forEach(function(callback) {
          callback(event);
        });
      }
      e.data[0] < 240 ? (this._parseChannelEvent(e), this._parseNrpnEvent(e)) : e.data[0] <= 255 && this._parseSystemEvent(e);
    }, Input.prototype._parseNrpnEvent = function(e) {
      var data1, data2, command = e.data[0] >> 4, channelBufferIndex = 15 & e.data[0], channel = 1 + channelBufferIndex;
      if (1 < e.data.length && (data1 = e.data[1], data2 = 2 < e.data.length ? e.data[2] : void 0), wm.nrpnEventsEnabled && command === wm.MIDI_CHANNEL_MESSAGES.controlchange && (data1 >= wm.MIDI_NRPN_MESSAGES.increment && data1 <= wm.MIDI_NRPN_MESSAGES.parammsb || data1 === wm.MIDI_NRPN_MESSAGES.entrymsb || data1 === wm.MIDI_NRPN_MESSAGES.entrylsb)) {
        var ccEvent = { target: this, type: "controlchange", data: e.data, timestamp: e.timeStamp, channel, controller: { number: data1, name: this.getCcNameByNumber(data1) }, value: data2 };
        if (ccEvent.controller.number === wm.MIDI_NRPN_MESSAGES.parammsb && ccEvent.value != wm.MIDI_NRPN_MESSAGES.nullactiveparameter)
          wm._nrpnBuffer[channelBufferIndex] = [], wm._nrpnBuffer[channelBufferIndex][0] = ccEvent;
        else if (wm._nrpnBuffer[channelBufferIndex].length === 1 && ccEvent.controller.number === wm.MIDI_NRPN_MESSAGES.paramlsb)
          wm._nrpnBuffer[channelBufferIndex].push(ccEvent);
        else if (wm._nrpnBuffer[channelBufferIndex].length !== 2 || ccEvent.controller.number !== wm.MIDI_NRPN_MESSAGES.increment && ccEvent.controller.number !== wm.MIDI_NRPN_MESSAGES.decrement && ccEvent.controller.number !== wm.MIDI_NRPN_MESSAGES.entrymsb)
          if (wm._nrpnBuffer[channelBufferIndex].length === 3 && wm._nrpnBuffer[channelBufferIndex][2].number === wm.MIDI_NRPN_MESSAGES.entrymsb && ccEvent.controller.number === wm.MIDI_NRPN_MESSAGES.entrylsb)
            wm._nrpnBuffer[channelBufferIndex].push(ccEvent);
          else if (3 <= wm._nrpnBuffer[channelBufferIndex].length && wm._nrpnBuffer[channelBufferIndex].length <= 4 && ccEvent.controller.number === wm.MIDI_NRPN_MESSAGES.parammsb && ccEvent.value === wm.MIDI_NRPN_MESSAGES.nullactiveparameter)
            wm._nrpnBuffer[channelBufferIndex].push(ccEvent);
          else if (4 <= wm._nrpnBuffer[channelBufferIndex].length && wm._nrpnBuffer[channelBufferIndex].length <= 5 && ccEvent.controller.number === wm.MIDI_NRPN_MESSAGES.paramlsb && ccEvent.value === wm.MIDI_NRPN_MESSAGES.nullactiveparameter) {
            wm._nrpnBuffer[channelBufferIndex].push(ccEvent);
            var rawData = [];
            wm._nrpnBuffer[channelBufferIndex].forEach(function(ev) {
              rawData.push(ev.data);
            });
            var nrpnNumber = wm._nrpnBuffer[channelBufferIndex][0].value << 7 | wm._nrpnBuffer[channelBufferIndex][1].value, nrpnValue = wm._nrpnBuffer[channelBufferIndex][2].value;
            wm._nrpnBuffer[channelBufferIndex].length === 6 && (nrpnValue = wm._nrpnBuffer[channelBufferIndex][2].value << 7 | wm._nrpnBuffer[channelBufferIndex][3].value);
            var nrpnControllerType = "";
            switch (wm._nrpnBuffer[channelBufferIndex][2].controller.number) {
              case wm.MIDI_NRPN_MESSAGES.entrymsb:
                nrpnControllerType = wm._nrpnTypes[0];
                break;
              case wm.MIDI_NRPN_MESSAGES.increment:
                nrpnControllerType = wm._nrpnTypes[1];
                break;
              case wm.MIDI_NRPN_MESSAGES.decrement:
                nrpnControllerType = wm._nrpnTypes[2];
                break;
              default:
                throw new Error("The NPRN type was unidentifiable.");
            }
            var nrpnEvent = { timestamp: ccEvent.timestamp, channel: ccEvent.channel, type: "nrpn", data: rawData, controller: { number: nrpnNumber, type: nrpnControllerType, name: "Non-Registered Parameter " + nrpnNumber }, value: nrpnValue };
            wm._nrpnBuffer[channelBufferIndex] = [], this._userHandlers.channel[nrpnEvent.type] && this._userHandlers.channel[nrpnEvent.type][nrpnEvent.channel] && this._userHandlers.channel[nrpnEvent.type][nrpnEvent.channel].forEach(function(callback) {
              callback(nrpnEvent);
            });
          } else
            wm._nrpnBuffer[channelBufferIndex] = [];
        else
          wm._nrpnBuffer[channelBufferIndex].push(ccEvent);
      }
    }, Input.prototype._parseChannelEvent = function(e) {
      var data1, data2, command = e.data[0] >> 4, channel = 1 + (15 & e.data[0]);
      1 < e.data.length && (data1 = e.data[1], data2 = 2 < e.data.length ? e.data[2] : void 0);
      var event = { target: this, data: e.data, timestamp: e.timeStamp, channel };
      command === wm.MIDI_CHANNEL_MESSAGES.noteoff || command === wm.MIDI_CHANNEL_MESSAGES.noteon && data2 === 0 ? (event.type = "noteoff", event.note = { number: data1, name: wm._notes[data1 % 12], octave: wm.getOctave(data1) }, event.velocity = data2 / 127, event.rawVelocity = data2) : command === wm.MIDI_CHANNEL_MESSAGES.noteon ? (event.type = "noteon", event.note = { number: data1, name: wm._notes[data1 % 12], octave: wm.getOctave(data1) }, event.velocity = data2 / 127, event.rawVelocity = data2) : command === wm.MIDI_CHANNEL_MESSAGES.keyaftertouch ? (event.type = "keyaftertouch", event.note = { number: data1, name: wm._notes[data1 % 12], octave: wm.getOctave(data1) }, event.value = data2 / 127) : command === wm.MIDI_CHANNEL_MESSAGES.controlchange && 0 <= data1 && data1 <= 119 ? (event.type = "controlchange", event.controller = { number: data1, name: this.getCcNameByNumber(data1) }, event.value = data2) : command === wm.MIDI_CHANNEL_MESSAGES.channelmode && 120 <= data1 && data1 <= 127 ? (event.type = "channelmode", event.controller = { number: data1, name: this.getChannelModeByNumber(data1) }, event.value = data2) : command === wm.MIDI_CHANNEL_MESSAGES.programchange ? (event.type = "programchange", event.value = data1) : command === wm.MIDI_CHANNEL_MESSAGES.channelaftertouch ? (event.type = "channelaftertouch", event.value = data1 / 127) : command === wm.MIDI_CHANNEL_MESSAGES.pitchbend ? (event.type = "pitchbend", event.value = ((data2 << 7) + data1 - 8192) / 8192) : event.type = "unknownchannelmessage", this._userHandlers.channel[event.type] && this._userHandlers.channel[event.type][channel] && this._userHandlers.channel[event.type][channel].forEach(function(callback) {
        callback(event);
      });
    }, Input.prototype.getCcNameByNumber = function(number) {
      if (!(0 <= (number = Math.floor(number)) && number <= 119))
        throw new RangeError("The control change number must be between 0 and 119.");
      for (var cc in wm.MIDI_CONTROL_CHANGE_MESSAGES)
        if (Object.prototype.hasOwnProperty.call(wm.MIDI_CONTROL_CHANGE_MESSAGES, cc) && number === wm.MIDI_CONTROL_CHANGE_MESSAGES[cc])
          return cc;
    }, Input.prototype.getChannelModeByNumber = function(number) {
      if (!(120 <= (number = Math.floor(number)) && status <= 127))
        throw new RangeError("The control change number must be between 120 and 127.");
      for (var cm in wm.MIDI_CHANNEL_MODE_MESSAGES)
        if (Object.prototype.hasOwnProperty.call(wm.MIDI_CHANNEL_MODE_MESSAGES, cm) && number === wm.MIDI_CHANNEL_MODE_MESSAGES[cm])
          return cm;
    }, Input.prototype._parseSystemEvent = function(e) {
      var command = e.data[0], event = { target: this, data: e.data, timestamp: e.timeStamp };
      command === wm.MIDI_SYSTEM_MESSAGES.sysex ? event.type = "sysex" : command === wm.MIDI_SYSTEM_MESSAGES.timecode ? event.type = "timecode" : command === wm.MIDI_SYSTEM_MESSAGES.songposition ? event.type = "songposition" : command === wm.MIDI_SYSTEM_MESSAGES.songselect ? (event.type = "songselect", event.song = e.data[1]) : command === wm.MIDI_SYSTEM_MESSAGES.tuningrequest ? event.type = "tuningrequest" : command === wm.MIDI_SYSTEM_MESSAGES.clock ? event.type = "clock" : command === wm.MIDI_SYSTEM_MESSAGES.start ? event.type = "start" : command === wm.MIDI_SYSTEM_MESSAGES.continue ? event.type = "continue" : command === wm.MIDI_SYSTEM_MESSAGES.stop ? event.type = "stop" : command === wm.MIDI_SYSTEM_MESSAGES.activesensing ? event.type = "activesensing" : command === wm.MIDI_SYSTEM_MESSAGES.reset ? event.type = "reset" : event.type = "unknownsystemmessage", this._userHandlers.system[event.type] && this._userHandlers.system[event.type].forEach(function(callback) {
        callback(event);
      });
    }, Output.prototype.send = function(status2, data, timestamp) {
      if (!(128 <= status2 && status2 <= 255))
        throw new RangeError("The status byte must be an integer between 128 (0x80) and 255 (0xFF).");
      data === void 0 && (data = []), Array.isArray(data) || (data = [data]);
      var message = [];
      return data.forEach(function(item) {
        var parsed = Math.floor(item);
        if (!(0 <= parsed && parsed <= 255))
          throw new RangeError("Data bytes must be integers between 0 (0x00) and 255 (0xFF).");
        message.push(parsed);
      }), this._midiOutput.send([status2].concat(message), parseFloat(timestamp) || 0), this;
    }, Output.prototype.sendSysex = function(manufacturer, data, options) {
      if (!wm.sysexEnabled)
        throw new Error("Sysex message support must first be activated.");
      return options = options || {}, manufacturer = [].concat(manufacturer), data.forEach(function(item) {
        if (item < 0 || 127 < item)
          throw new RangeError("The data bytes of a sysex message must be integers between 0 (0x00) and 127 (0x7F).");
      }), data = manufacturer.concat(data, wm.MIDI_SYSTEM_MESSAGES.sysexend), this.send(wm.MIDI_SYSTEM_MESSAGES.sysex, data, this._parseTimeParameter(options.time)), this;
    }, Output.prototype.sendTimecodeQuarterFrame = function(value, options) {
      return options = options || {}, this.send(wm.MIDI_SYSTEM_MESSAGES.timecode, value, this._parseTimeParameter(options.time)), this;
    }, Output.prototype.sendSongPosition = function(value, options) {
      options = options || {};
      var msb = (value = Math.floor(value) || 0) >> 7 & 127, lsb = 127 & value;
      return this.send(wm.MIDI_SYSTEM_MESSAGES.songposition, [msb, lsb], this._parseTimeParameter(options.time)), this;
    }, Output.prototype.sendSongSelect = function(value, options) {
      if (options = options || {}, !(0 <= (value = Math.floor(value)) && value <= 127))
        throw new RangeError("The song number must be between 0 and 127.");
      return this.send(wm.MIDI_SYSTEM_MESSAGES.songselect, [value], this._parseTimeParameter(options.time)), this;
    }, Output.prototype.sendTuningRequest = function(options) {
      return options = options || {}, this.send(wm.MIDI_SYSTEM_MESSAGES.tuningrequest, void 0, this._parseTimeParameter(options.time)), this;
    }, Output.prototype.sendClock = function(options) {
      return options = options || {}, this.send(wm.MIDI_SYSTEM_MESSAGES.clock, void 0, this._parseTimeParameter(options.time)), this;
    }, Output.prototype.sendStart = function(options) {
      return options = options || {}, this.send(wm.MIDI_SYSTEM_MESSAGES.start, void 0, this._parseTimeParameter(options.time)), this;
    }, Output.prototype.sendContinue = function(options) {
      return options = options || {}, this.send(wm.MIDI_SYSTEM_MESSAGES.continue, void 0, this._parseTimeParameter(options.time)), this;
    }, Output.prototype.sendStop = function(options) {
      return options = options || {}, this.send(wm.MIDI_SYSTEM_MESSAGES.stop, void 0, this._parseTimeParameter(options.time)), this;
    }, Output.prototype.sendActiveSensing = function(options) {
      return options = options || {}, this.send(wm.MIDI_SYSTEM_MESSAGES.activesensing, [], this._parseTimeParameter(options.time)), this;
    }, Output.prototype.sendReset = function(options) {
      return options = options || {}, this.send(wm.MIDI_SYSTEM_MESSAGES.reset, void 0, this._parseTimeParameter(options.time)), this;
    }, Output.prototype.stopNote = function(note, channel, options) {
      if (note === "all")
        return this.sendChannelMode("allnotesoff", 0, channel, options);
      var nVelocity = 64;
      return (options = options || {}).rawVelocity ? !isNaN(options.velocity) && 0 <= options.velocity && options.velocity <= 127 && (nVelocity = options.velocity) : !isNaN(options.velocity) && 0 <= options.velocity && options.velocity <= 1 && (nVelocity = 127 * options.velocity), this._convertNoteToArray(note).forEach(function(item) {
        wm.toMIDIChannels(channel).forEach(function(ch) {
          this.send((wm.MIDI_CHANNEL_MESSAGES.noteoff << 4) + (ch - 1), [item, Math.round(nVelocity)], this._parseTimeParameter(options.time));
        }.bind(this));
      }.bind(this)), this;
    }, Output.prototype.playNote = function(note, channel, options) {
      var time, nVelocity = 64;
      if ((options = options || {}).rawVelocity ? !isNaN(options.velocity) && 0 <= options.velocity && options.velocity <= 127 && (nVelocity = options.velocity) : !isNaN(options.velocity) && 0 <= options.velocity && options.velocity <= 1 && (nVelocity = 127 * options.velocity), time = this._parseTimeParameter(options.time), this._convertNoteToArray(note).forEach(function(item) {
        wm.toMIDIChannels(channel).forEach(function(ch) {
          this.send((wm.MIDI_CHANNEL_MESSAGES.noteon << 4) + (ch - 1), [item, Math.round(nVelocity)], time);
        }.bind(this));
      }.bind(this)), !isNaN(options.duration)) {
        options.duration <= 0 && (options.duration = 0);
        var nRelease = 64;
        options.rawVelocity ? !isNaN(options.release) && 0 <= options.release && options.release <= 127 && (nRelease = options.release) : !isNaN(options.release) && 0 <= options.release && options.release <= 1 && (nRelease = 127 * options.release), this._convertNoteToArray(note).forEach(function(item) {
          wm.toMIDIChannels(channel).forEach(function(ch) {
            this.send((wm.MIDI_CHANNEL_MESSAGES.noteoff << 4) + (ch - 1), [item, Math.round(nRelease)], (time || wm.time) + options.duration);
          }.bind(this));
        }.bind(this));
      }
      return this;
    }, Output.prototype.sendKeyAftertouch = function(note, channel, pressure, options) {
      var that = this;
      if (options = options || {}, channel < 1 || 16 < channel)
        throw new RangeError("The channel must be between 1 and 16.");
      (isNaN(pressure) || pressure < 0 || 1 < pressure) && (pressure = 0.5);
      var nPressure = Math.round(127 * pressure);
      return this._convertNoteToArray(note).forEach(function(item) {
        wm.toMIDIChannels(channel).forEach(function(ch) {
          that.send((wm.MIDI_CHANNEL_MESSAGES.keyaftertouch << 4) + (ch - 1), [item, nPressure], that._parseTimeParameter(options.time));
        });
      }), this;
    }, Output.prototype.sendControlChange = function(controller, value, channel, options) {
      if (options = options || {}, typeof controller == "string") {
        if ((controller = wm.MIDI_CONTROL_CHANGE_MESSAGES[controller]) === void 0)
          throw new TypeError("Invalid controller name.");
      } else if (!(0 <= (controller = Math.floor(controller)) && controller <= 119))
        throw new RangeError("Controller numbers must be between 0 and 119.");
      if (!(0 <= (value = Math.floor(value) || 0) && value <= 127))
        throw new RangeError("Controller value must be between 0 and 127.");
      return wm.toMIDIChannels(channel).forEach(function(ch) {
        this.send((wm.MIDI_CHANNEL_MESSAGES.controlchange << 4) + (ch - 1), [controller, value], this._parseTimeParameter(options.time));
      }.bind(this)), this;
    }, Output.prototype._selectRegisteredParameter = function(parameter, channel, time) {
      var that = this;
      if (parameter[0] = Math.floor(parameter[0]), !(0 <= parameter[0] && parameter[0] <= 127))
        throw new RangeError("The control65 value must be between 0 and 127");
      if (parameter[1] = Math.floor(parameter[1]), !(0 <= parameter[1] && parameter[1] <= 127))
        throw new RangeError("The control64 value must be between 0 and 127");
      return wm.toMIDIChannels(channel).forEach(function() {
        that.sendControlChange(101, parameter[0], channel, { time }), that.sendControlChange(100, parameter[1], channel, { time });
      }), this;
    }, Output.prototype._selectNonRegisteredParameter = function(parameter, channel, time) {
      var that = this;
      if (parameter[0] = Math.floor(parameter[0]), !(0 <= parameter[0] && parameter[0] <= 127))
        throw new RangeError("The control63 value must be between 0 and 127");
      if (parameter[1] = Math.floor(parameter[1]), !(0 <= parameter[1] && parameter[1] <= 127))
        throw new RangeError("The control62 value must be between 0 and 127");
      return wm.toMIDIChannels(channel).forEach(function() {
        that.sendControlChange(99, parameter[0], channel, { time }), that.sendControlChange(98, parameter[1], channel, { time });
      }), this;
    }, Output.prototype._setCurrentRegisteredParameter = function(data, channel, time) {
      var that = this;
      if ((data = [].concat(data))[0] = Math.floor(data[0]), !(0 <= data[0] && data[0] <= 127))
        throw new RangeError("The msb value must be between 0 and 127");
      return wm.toMIDIChannels(channel).forEach(function() {
        that.sendControlChange(6, data[0], channel, { time });
      }), data[1] = Math.floor(data[1]), 0 <= data[1] && data[1] <= 127 && wm.toMIDIChannels(channel).forEach(function() {
        that.sendControlChange(38, data[1], channel, { time });
      }), this;
    }, Output.prototype._deselectRegisteredParameter = function(channel, time) {
      var that = this;
      return wm.toMIDIChannels(channel).forEach(function() {
        that.sendControlChange(101, 127, channel, { time }), that.sendControlChange(100, 127, channel, { time });
      }), this;
    }, Output.prototype.setRegisteredParameter = function(parameter, data, channel, options) {
      var that = this;
      if (options = options || {}, !Array.isArray(parameter)) {
        if (!wm.MIDI_REGISTERED_PARAMETER[parameter])
          throw new Error("The specified parameter is not available.");
        parameter = wm.MIDI_REGISTERED_PARAMETER[parameter];
      }
      return wm.toMIDIChannels(channel).forEach(function() {
        that._selectRegisteredParameter(parameter, channel, options.time), that._setCurrentRegisteredParameter(data, channel, options.time), that._deselectRegisteredParameter(channel, options.time);
      }), this;
    }, Output.prototype.setNonRegisteredParameter = function(parameter, data, channel, options) {
      var that = this;
      if (options = options || {}, !(0 <= parameter[0] && parameter[0] <= 127 && 0 <= parameter[1] && parameter[1] <= 127))
        throw new Error("Position 0 and 1 of the 2-position parameter array must both be between 0 and 127.");
      return data = [].concat(data), wm.toMIDIChannels(channel).forEach(function() {
        that._selectNonRegisteredParameter(parameter, channel, options.time), that._setCurrentRegisteredParameter(data, channel, options.time), that._deselectRegisteredParameter(channel, options.time);
      }), this;
    }, Output.prototype.incrementRegisteredParameter = function(parameter, channel, options) {
      var that = this;
      if (options = options || {}, !Array.isArray(parameter)) {
        if (!wm.MIDI_REGISTERED_PARAMETER[parameter])
          throw new Error("The specified parameter is not available.");
        parameter = wm.MIDI_REGISTERED_PARAMETER[parameter];
      }
      return wm.toMIDIChannels(channel).forEach(function() {
        that._selectRegisteredParameter(parameter, channel, options.time), that.sendControlChange(96, 0, channel, { time: options.time }), that._deselectRegisteredParameter(channel, options.time);
      }), this;
    }, Output.prototype.decrementRegisteredParameter = function(parameter, channel, options) {
      if (options = options || {}, !Array.isArray(parameter)) {
        if (!wm.MIDI_REGISTERED_PARAMETER[parameter])
          throw new TypeError("The specified parameter is not available.");
        parameter = wm.MIDI_REGISTERED_PARAMETER[parameter];
      }
      return wm.toMIDIChannels(channel).forEach(function() {
        this._selectRegisteredParameter(parameter, channel, options.time), this.sendControlChange(97, 0, channel, { time: options.time }), this._deselectRegisteredParameter(channel, options.time);
      }.bind(this)), this;
    }, Output.prototype.setPitchBendRange = function(semitones, cents, channel, options) {
      var that = this;
      if (options = options || {}, !(0 <= (semitones = Math.floor(semitones) || 0) && semitones <= 127))
        throw new RangeError("The semitones value must be between 0 and 127");
      if (!(0 <= (cents = Math.floor(cents) || 0) && cents <= 127))
        throw new RangeError("The cents value must be between 0 and 127");
      return wm.toMIDIChannels(channel).forEach(function() {
        that.setRegisteredParameter("pitchbendrange", [semitones, cents], channel, { time: options.time });
      }), this;
    }, Output.prototype.setModulationRange = function(semitones, cents, channel, options) {
      var that = this;
      if (options = options || {}, !(0 <= (semitones = Math.floor(semitones) || 0) && semitones <= 127))
        throw new RangeError("The semitones value must be between 0 and 127");
      if (!(0 <= (cents = Math.floor(cents) || 0) && cents <= 127))
        throw new RangeError("The cents value must be between 0 and 127");
      return wm.toMIDIChannels(channel).forEach(function() {
        that.setRegisteredParameter("modulationrange", [semitones, cents], channel, { time: options.time });
      }), this;
    }, Output.prototype.setMasterTuning = function(value, channel, options) {
      var that = this;
      if (options = options || {}, (value = parseFloat(value) || 0) <= -65 || 64 <= value)
        throw new RangeError("The value must be a decimal number larger than -65 and smaller than 64.");
      var coarse = Math.floor(value) + 64, fine = value - Math.floor(value), msb = (fine = Math.round((fine + 1) / 2 * 16383)) >> 7 & 127, lsb = 127 & fine;
      return wm.toMIDIChannels(channel).forEach(function() {
        that.setRegisteredParameter("channelcoarsetuning", coarse, channel, { time: options.time }), that.setRegisteredParameter("channelfinetuning", [msb, lsb], channel, { time: options.time });
      }), this;
    }, Output.prototype.setTuningProgram = function(value, channel, options) {
      var that = this;
      if (options = options || {}, !(0 <= (value = Math.floor(value)) && value <= 127))
        throw new RangeError("The program value must be between 0 and 127");
      return wm.toMIDIChannels(channel).forEach(function() {
        that.setRegisteredParameter("tuningprogram", value, channel, { time: options.time });
      }), this;
    }, Output.prototype.setTuningBank = function(value, channel, options) {
      var that = this;
      if (options = options || {}, !(0 <= (value = Math.floor(value) || 0) && value <= 127))
        throw new RangeError("The bank value must be between 0 and 127");
      return wm.toMIDIChannels(channel).forEach(function() {
        that.setRegisteredParameter("tuningbank", value, channel, { time: options.time });
      }), this;
    }, Output.prototype.sendChannelMode = function(command, value, channel, options) {
      if (options = options || {}, typeof command == "string") {
        if (!(command = wm.MIDI_CHANNEL_MODE_MESSAGES[command]))
          throw new TypeError("Invalid channel mode message name.");
      } else if (!(120 <= (command = Math.floor(command)) && command <= 127))
        throw new RangeError("Channel mode numerical identifiers must be between 120 and 127.");
      if ((value = Math.floor(value) || 0) < 0 || 127 < value)
        throw new RangeError("Value must be an integer between 0 and 127.");
      return wm.toMIDIChannels(channel).forEach(function(ch) {
        this.send((wm.MIDI_CHANNEL_MESSAGES.channelmode << 4) + (ch - 1), [command, value], this._parseTimeParameter(options.time));
      }.bind(this)), this;
    }, Output.prototype.sendProgramChange = function(program, channel, options) {
      var that = this;
      if (options = options || {}, program = Math.floor(program), isNaN(program) || program < 0 || 127 < program)
        throw new RangeError("Program numbers must be between 0 and 127.");
      return wm.toMIDIChannels(channel).forEach(function(ch) {
        that.send((wm.MIDI_CHANNEL_MESSAGES.programchange << 4) + (ch - 1), [program], that._parseTimeParameter(options.time));
      }), this;
    }, Output.prototype.sendChannelAftertouch = function(pressure, channel, options) {
      var that = this;
      options = options || {}, pressure = parseFloat(pressure), (isNaN(pressure) || pressure < 0 || 1 < pressure) && (pressure = 0.5);
      var nPressure = Math.round(127 * pressure);
      return wm.toMIDIChannels(channel).forEach(function(ch) {
        that.send((wm.MIDI_CHANNEL_MESSAGES.channelaftertouch << 4) + (ch - 1), [nPressure], that._parseTimeParameter(options.time));
      }), this;
    }, Output.prototype.sendPitchBend = function(bend, channel, options) {
      var that = this;
      if (options = options || {}, isNaN(bend) || bend < -1 || 1 < bend)
        throw new RangeError("Pitch bend value must be between -1 and 1.");
      var nLevel = Math.round((bend + 1) / 2 * 16383), msb = nLevel >> 7 & 127, lsb = 127 & nLevel;
      return wm.toMIDIChannels(channel).forEach(function(ch) {
        that.send((wm.MIDI_CHANNEL_MESSAGES.pitchbend << 4) + (ch - 1), [lsb, msb], that._parseTimeParameter(options.time));
      }), this;
    }, Output.prototype._parseTimeParameter = function(time) {
      var value, parsed = parseFloat(time);
      return typeof time == "string" && time.substring(0, 1) === "+" ? parsed && 0 < parsed && (value = wm.time + parsed) : parsed > wm.time && (value = parsed), value;
    }, Output.prototype._convertNoteToArray = function(note) {
      var notes = [];
      return Array.isArray(note) || (note = [note]), note.forEach(function(item) {
        notes.push(wm.guessNoteNumber(item));
      }), notes;
    }, module.exports ? module.exports = wm : scope.WebMidi || (scope.WebMidi = wm);
  }(commonjsGlobal);
})(webmidi_min);
var WebMidi = webmidi_min.exports;
var mousetrap = { exports: {} };
(function(module) {
  (function(window2, document2, undefined$1) {
    if (!window2) {
      return;
    }
    var _MAP = {
      8: "backspace",
      9: "tab",
      13: "enter",
      16: "shift",
      17: "ctrl",
      18: "alt",
      20: "capslock",
      27: "esc",
      32: "space",
      33: "pageup",
      34: "pagedown",
      35: "end",
      36: "home",
      37: "left",
      38: "up",
      39: "right",
      40: "down",
      45: "ins",
      46: "del",
      91: "meta",
      93: "meta",
      224: "meta"
    };
    var _KEYCODE_MAP = {
      106: "*",
      107: "+",
      109: "-",
      110: ".",
      111: "/",
      186: ";",
      187: "=",
      188: ",",
      189: "-",
      190: ".",
      191: "/",
      192: "`",
      219: "[",
      220: "\\",
      221: "]",
      222: "'"
    };
    var _SHIFT_MAP = {
      "~": "`",
      "!": "1",
      "@": "2",
      "#": "3",
      "$": "4",
      "%": "5",
      "^": "6",
      "&": "7",
      "*": "8",
      "(": "9",
      ")": "0",
      "_": "-",
      "+": "=",
      ":": ";",
      '"': "'",
      "<": ",",
      ">": ".",
      "?": "/",
      "|": "\\"
    };
    var _SPECIAL_ALIASES = {
      "option": "alt",
      "command": "meta",
      "return": "enter",
      "escape": "esc",
      "plus": "+",
      "mod": /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? "meta" : "ctrl"
    };
    var _REVERSE_MAP;
    for (var i = 1; i < 20; ++i) {
      _MAP[111 + i] = "f" + i;
    }
    for (i = 0; i <= 9; ++i) {
      _MAP[i + 96] = i.toString();
    }
    function _addEvent(object, type, callback) {
      if (object.addEventListener) {
        object.addEventListener(type, callback, false);
        return;
      }
      object.attachEvent("on" + type, callback);
    }
    function _characterFromEvent(e) {
      if (e.type == "keypress") {
        var character = String.fromCharCode(e.which);
        if (!e.shiftKey) {
          character = character.toLowerCase();
        }
        return character;
      }
      if (_MAP[e.which]) {
        return _MAP[e.which];
      }
      if (_KEYCODE_MAP[e.which]) {
        return _KEYCODE_MAP[e.which];
      }
      return String.fromCharCode(e.which).toLowerCase();
    }
    function _modifiersMatch(modifiers1, modifiers2) {
      return modifiers1.sort().join(",") === modifiers2.sort().join(",");
    }
    function _eventModifiers(e) {
      var modifiers = [];
      if (e.shiftKey) {
        modifiers.push("shift");
      }
      if (e.altKey) {
        modifiers.push("alt");
      }
      if (e.ctrlKey) {
        modifiers.push("ctrl");
      }
      if (e.metaKey) {
        modifiers.push("meta");
      }
      return modifiers;
    }
    function _preventDefault(e) {
      if (e.preventDefault) {
        e.preventDefault();
        return;
      }
      e.returnValue = false;
    }
    function _stopPropagation(e) {
      if (e.stopPropagation) {
        e.stopPropagation();
        return;
      }
      e.cancelBubble = true;
    }
    function _isModifier(key) {
      return key == "shift" || key == "ctrl" || key == "alt" || key == "meta";
    }
    function _getReverseMap() {
      if (!_REVERSE_MAP) {
        _REVERSE_MAP = {};
        for (var key in _MAP) {
          if (key > 95 && key < 112) {
            continue;
          }
          if (_MAP.hasOwnProperty(key)) {
            _REVERSE_MAP[_MAP[key]] = key;
          }
        }
      }
      return _REVERSE_MAP;
    }
    function _pickBestAction(key, modifiers, action) {
      if (!action) {
        action = _getReverseMap()[key] ? "keydown" : "keypress";
      }
      if (action == "keypress" && modifiers.length) {
        action = "keydown";
      }
      return action;
    }
    function _keysFromString(combination) {
      if (combination === "+") {
        return ["+"];
      }
      combination = combination.replace(/\+{2}/g, "+plus");
      return combination.split("+");
    }
    function _getKeyInfo(combination, action) {
      var keys;
      var key;
      var i2;
      var modifiers = [];
      keys = _keysFromString(combination);
      for (i2 = 0; i2 < keys.length; ++i2) {
        key = keys[i2];
        if (_SPECIAL_ALIASES[key]) {
          key = _SPECIAL_ALIASES[key];
        }
        if (action && action != "keypress" && _SHIFT_MAP[key]) {
          key = _SHIFT_MAP[key];
          modifiers.push("shift");
        }
        if (_isModifier(key)) {
          modifiers.push(key);
        }
      }
      action = _pickBestAction(key, modifiers, action);
      return {
        key,
        modifiers,
        action
      };
    }
    function _belongsTo(element, ancestor) {
      if (element === null || element === document2) {
        return false;
      }
      if (element === ancestor) {
        return true;
      }
      return _belongsTo(element.parentNode, ancestor);
    }
    function Mousetrap(targetElement) {
      var self2 = this;
      targetElement = targetElement || document2;
      if (!(self2 instanceof Mousetrap)) {
        return new Mousetrap(targetElement);
      }
      self2.target = targetElement;
      self2._callbacks = {};
      self2._directMap = {};
      var _sequenceLevels = {};
      var _resetTimer;
      var _ignoreNextKeyup = false;
      var _ignoreNextKeypress = false;
      var _nextExpectedAction = false;
      function _resetSequences(doNotReset) {
        doNotReset = doNotReset || {};
        var activeSequences = false, key;
        for (key in _sequenceLevels) {
          if (doNotReset[key]) {
            activeSequences = true;
            continue;
          }
          _sequenceLevels[key] = 0;
        }
        if (!activeSequences) {
          _nextExpectedAction = false;
        }
      }
      function _getMatches(character, modifiers, e, sequenceName, combination, level) {
        var i2;
        var callback;
        var matches = [];
        var action = e.type;
        if (!self2._callbacks[character]) {
          return [];
        }
        if (action == "keyup" && _isModifier(character)) {
          modifiers = [character];
        }
        for (i2 = 0; i2 < self2._callbacks[character].length; ++i2) {
          callback = self2._callbacks[character][i2];
          if (!sequenceName && callback.seq && _sequenceLevels[callback.seq] != callback.level) {
            continue;
          }
          if (action != callback.action) {
            continue;
          }
          if (action == "keypress" && !e.metaKey && !e.ctrlKey || _modifiersMatch(modifiers, callback.modifiers)) {
            var deleteCombo = !sequenceName && callback.combo == combination;
            var deleteSequence = sequenceName && callback.seq == sequenceName && callback.level == level;
            if (deleteCombo || deleteSequence) {
              self2._callbacks[character].splice(i2, 1);
            }
            matches.push(callback);
          }
        }
        return matches;
      }
      function _fireCallback(callback, e, combo, sequence) {
        if (self2.stopCallback(e, e.target || e.srcElement, combo, sequence)) {
          return;
        }
        if (callback(e, combo) === false) {
          _preventDefault(e);
          _stopPropagation(e);
        }
      }
      self2._handleKey = function(character, modifiers, e) {
        var callbacks = _getMatches(character, modifiers, e);
        var i2;
        var doNotReset = {};
        var maxLevel = 0;
        var processedSequenceCallback = false;
        for (i2 = 0; i2 < callbacks.length; ++i2) {
          if (callbacks[i2].seq) {
            maxLevel = Math.max(maxLevel, callbacks[i2].level);
          }
        }
        for (i2 = 0; i2 < callbacks.length; ++i2) {
          if (callbacks[i2].seq) {
            if (callbacks[i2].level != maxLevel) {
              continue;
            }
            processedSequenceCallback = true;
            doNotReset[callbacks[i2].seq] = 1;
            _fireCallback(callbacks[i2].callback, e, callbacks[i2].combo, callbacks[i2].seq);
            continue;
          }
          if (!processedSequenceCallback) {
            _fireCallback(callbacks[i2].callback, e, callbacks[i2].combo);
          }
        }
        var ignoreThisKeypress = e.type == "keypress" && _ignoreNextKeypress;
        if (e.type == _nextExpectedAction && !_isModifier(character) && !ignoreThisKeypress) {
          _resetSequences(doNotReset);
        }
        _ignoreNextKeypress = processedSequenceCallback && e.type == "keydown";
      };
      function _handleKeyEvent(e) {
        if (typeof e.which !== "number") {
          e.which = e.keyCode;
        }
        var character = _characterFromEvent(e);
        if (!character) {
          return;
        }
        if (e.type == "keyup" && _ignoreNextKeyup === character) {
          _ignoreNextKeyup = false;
          return;
        }
        self2.handleKey(character, _eventModifiers(e), e);
      }
      function _resetSequenceTimer() {
        clearTimeout(_resetTimer);
        _resetTimer = setTimeout(_resetSequences, 1e3);
      }
      function _bindSequence(combo, keys, callback, action) {
        _sequenceLevels[combo] = 0;
        function _increaseSequence(nextAction) {
          return function() {
            _nextExpectedAction = nextAction;
            ++_sequenceLevels[combo];
            _resetSequenceTimer();
          };
        }
        function _callbackAndReset(e) {
          _fireCallback(callback, e, combo);
          if (action !== "keyup") {
            _ignoreNextKeyup = _characterFromEvent(e);
          }
          setTimeout(_resetSequences, 10);
        }
        for (var i2 = 0; i2 < keys.length; ++i2) {
          var isFinal = i2 + 1 === keys.length;
          var wrappedCallback = isFinal ? _callbackAndReset : _increaseSequence(action || _getKeyInfo(keys[i2 + 1]).action);
          _bindSingle(keys[i2], wrappedCallback, action, combo, i2);
        }
      }
      function _bindSingle(combination, callback, action, sequenceName, level) {
        self2._directMap[combination + ":" + action] = callback;
        combination = combination.replace(/\s+/g, " ");
        var sequence = combination.split(" ");
        var info;
        if (sequence.length > 1) {
          _bindSequence(combination, sequence, callback, action);
          return;
        }
        info = _getKeyInfo(combination, action);
        self2._callbacks[info.key] = self2._callbacks[info.key] || [];
        _getMatches(info.key, info.modifiers, { type: info.action }, sequenceName, combination, level);
        self2._callbacks[info.key][sequenceName ? "unshift" : "push"]({
          callback,
          modifiers: info.modifiers,
          action: info.action,
          seq: sequenceName,
          level,
          combo: combination
        });
      }
      self2._bindMultiple = function(combinations, callback, action) {
        for (var i2 = 0; i2 < combinations.length; ++i2) {
          _bindSingle(combinations[i2], callback, action);
        }
      };
      _addEvent(targetElement, "keypress", _handleKeyEvent);
      _addEvent(targetElement, "keydown", _handleKeyEvent);
      _addEvent(targetElement, "keyup", _handleKeyEvent);
    }
    Mousetrap.prototype.bind = function(keys, callback, action) {
      var self2 = this;
      keys = keys instanceof Array ? keys : [keys];
      self2._bindMultiple.call(self2, keys, callback, action);
      return self2;
    };
    Mousetrap.prototype.unbind = function(keys, action) {
      var self2 = this;
      return self2.bind.call(self2, keys, function() {
      }, action);
    };
    Mousetrap.prototype.trigger = function(keys, action) {
      var self2 = this;
      if (self2._directMap[keys + ":" + action]) {
        self2._directMap[keys + ":" + action]({}, keys);
      }
      return self2;
    };
    Mousetrap.prototype.reset = function() {
      var self2 = this;
      self2._callbacks = {};
      self2._directMap = {};
      return self2;
    };
    Mousetrap.prototype.stopCallback = function(e, element) {
      var self2 = this;
      if ((" " + element.className + " ").indexOf(" mousetrap ") > -1) {
        return false;
      }
      if (_belongsTo(element, self2.target)) {
        return false;
      }
      if ("composedPath" in e && typeof e.composedPath === "function") {
        var initialEventTarget = e.composedPath()[0];
        if (initialEventTarget !== e.target) {
          element = initialEventTarget;
        }
      }
      return element.tagName == "INPUT" || element.tagName == "SELECT" || element.tagName == "TEXTAREA" || element.isContentEditable;
    };
    Mousetrap.prototype.handleKey = function() {
      var self2 = this;
      return self2._handleKey.apply(self2, arguments);
    };
    Mousetrap.addKeycodes = function(object) {
      for (var key in object) {
        if (object.hasOwnProperty(key)) {
          _MAP[key] = object[key];
        }
      }
      _REVERSE_MAP = null;
    };
    Mousetrap.init = function() {
      var documentMousetrap = Mousetrap(document2);
      for (var method in documentMousetrap) {
        if (method.charAt(0) !== "_") {
          Mousetrap[method] = function(method2) {
            return function() {
              return documentMousetrap[method2].apply(documentMousetrap, arguments);
            };
          }(method);
        }
      }
    };
    Mousetrap.init();
    window2.Mousetrap = Mousetrap;
    if (module.exports) {
      module.exports = Mousetrap;
    }
    if (typeof undefined$1 === "function" && undefined$1.amd) {
      undefined$1(function() {
        return Mousetrap;
      });
    }
  })(typeof window !== "undefined" ? window : null, typeof window !== "undefined" ? document : null);
})(mousetrap);
const clipboard = {};
clipboard.write = async (text) => {
  await navigator.clipboard.writeText(text);
};
clipboard.read = async () => navigator.clipboard.readText();
clipboard.readSync = () => {
  throw new Error("`.readSync()` is not supported in browsers!");
};
clipboard.writeSync = () => {
  throw new Error("`.writeSync()` is not supported in browsers!");
};
const Gui = function(options) {
  const self2 = Object.assign({}, {
    enabled: true,
    gui: new GUI$1(),
    midiPerColor: 4,
    midi: true,
    colors: [
      "#ee907b",
      "#2ed9c3",
      "#4888f5",
      "#aa82ff"
    ],
    add: function(...params) {
      const controller = currentFolder.add.apply(currentFolder, params);
      _updateControllerColors();
      self2.syncMidi();
      return controller;
    },
    addColor: function(target, key) {
      return currentFolder.addColor(target, key);
    },
    setFolder: function(name) {
      const folder = self2.gui.addFolder(name);
      folders.push(folder);
      currentFolder = folder;
      return folder;
    },
    getControllers: function(openOnly = false) {
      const allFolders = _getAllFolders();
      const targetFolders = openOnly ? allFolders.filter((folder) => !folder.closed) : allFolders;
      return targetFolders.reduce((acc, gui) => {
        return acc.concat(gui.__controllers);
      }, []);
    },
    removeFolder: function(folder) {
      const folderIdx = folders.findIndex((existingFolder) => existingFolder.name === folder.name);
      folders.splice(folderIdx, 1);
      self2.gui.removeFolder(folder);
      currentFolder = self2.gui;
    },
    connectMidiRange: function(start, end) {
      for (let idx = start, length = end + 1; idx < length; idx++) {
        midiConnectRange.push(idx);
      }
    },
    addControl: function(note, callback) {
      customControls[note] = callback;
    },
    destroy: function() {
      self2.gui.destroy();
      if (Midi) {
        Midi.inputs.forEach((input) => {
          input.removeListener("midimessage", "all");
        });
        Midi.disable();
      }
    },
    clear: function() {
      self2.gui.destroy();
      self2.gui = new GUI$1();
      currentFolder = self2.gui;
      customControls = {};
    },
    hide: function() {
      hidden = true;
      self2.gui.hide();
    },
    show: function() {
      hidden = false;
      self2.gui.show();
    },
    toggle: function() {
      hidden = !hidden;
      if (hidden) {
        self2.hide();
      } else {
        self2.show();
      }
    },
    update: function() {
      self2.getControllers().forEach((controller) => {
        controller.updateDisplay();
      });
    },
    configureDevice: function(deviceName) {
      const device = supportedMidiOutputDevices[deviceName];
      if (!device || !device.configure)
        return console.warn(`No built-in configuration is available for "${deviceName}"`);
      device.configure();
    },
    syncMidi: function() {
      if (!Midi)
        return;
      midiConnectRange.forEach((midiIdx, idx) => {
        const controller = self2._getNumericControllerAtIndex(idx);
        midiReady.then(() => {
          Midi.outputs.forEach((output) => {
            const device = supportedMidiOutputDevices[output.name];
            if (!device)
              return;
            if (controller) {
              const midiValue = self2._controllerValueToMidi(controller);
              if (device.sync)
                device.sync(output, midiIdx, midiValue);
            } else {
              if (device.clear)
                device.clear(output, midiIdx);
            }
          });
        });
      });
    },
    _mapRange: function(inMin, inMax, outMin, outMax, value) {
      return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    },
    _snap: function(snapIncrement, value) {
      return Math.round(value / snapIncrement) * snapIncrement;
    },
    _getNumericControllerAtIndex: function(idx, openOnly = false) {
      const allControllers = self2.getControllers(openOnly);
      const controllerAtIdx = allControllers[idx];
      return typeof controllerAtIdx !== "undefined" && typeof controllerAtIdx.min !== "undefined" && typeof controllerAtIdx.max !== "undefined" ? controllerAtIdx : null;
    },
    _getAggregatedSettings: function() {
      const allFolders = _getAllFolders();
      return allFolders.reduce((acc, folder) => {
        acc[folder.name] = folder.__controllers.reduce((controllerAcc, controller) => {
          controllerAcc[controller.property] = controller.getValue();
          return controllerAcc;
        }, {});
        return acc;
      }, {});
    },
    _controllerValueToMidi: function(controller) {
      const value = controller.getValue();
      const min = controller.__min;
      const max = controller.__max;
      const midiValue = self2._mapRange(min, max, 1, 127, value);
      return Math.round(midiValue);
    }
  }, options);
  const supportedMidiOutputDevices = {
    "Midi Fighter Twister": {
      sync: (output, midiIdx, midiValue) => {
        output.sendControlChange(midiIdx, midiValue, 1);
        output.sendControlChange(midiIdx, 47, 6);
      },
      clear: (output, midiIdx) => {
        output.sendControlChange(midiIdx, 0, 1);
        output.sendControlChange(midiIdx, 20, 6);
      },
      configure: () => {
        self2.connectMidiRange(0, 15);
      }
    },
    "nanoKONTROL2 CTRL": {
      configure: () => {
        self2.connectMidiRange(16, 23);
        self2.connectMidiRange(0, 7);
      }
    }
  };
  const folders = [];
  let currentFolder = self2.gui;
  const midiConnectRange = [];
  let customControls = {};
  let debugMidi = false;
  let hidden = false;
  let Midi = null;
  let midiReady;
  const _init = function() {
    _addMidi();
    _addEventListeners();
    _addSaveMarkup();
    _addSaveEventListeners();
    _addStyles();
  };
  const _addMidi = function() {
    if (!self2.midi)
      return;
    midiReady = new Promise((res) => {
      const webmidiEnabled = navigator.requestMIDIAccess;
      if (webmidiEnabled) {
        Midi = WebMidi;
        Midi.enable((err) => {
          if (err) {
            console.error("WebMIDI is not supported in this browser.");
          } else {
            console.log("MIDI devices successfully connected.");
            _setupMidiInputs();
            res(Midi);
          }
        }, true);
      }
    }).catch((err) => {
      console.error(err);
    });
  };
  const _addEventListeners = function() {
    document.addEventListener("keydown", ({ keyCode }) => {
      if (keyCode === 18)
        debugMidi = true;
    });
    document.addEventListener("keyup", ({ keyCode }) => {
      if (keyCode === 18)
        debugMidi = false;
    });
    document.addEventListener("keyup", ({ keyCode }) => {
      if (keyCode === 17)
        self2.toggle();
    });
  };
  const _addSaveMarkup = () => {
    const markup = `
      <div class="gui-save__inner">
        <span class="gui-save__close">&times;</span>
        <p class="gui-save__clipboard-notification">This code has been saved to your clipboard.</p>
        <textarea
          class="gui-save__textarea"
          name="gui-save-text"
          id="gui-save-text"
          autocomplete="off" autocapitalize="off" spellcheck="false"
        ></textarea>
      </div>
    `;
    const container = document.querySelector("body");
    const newEl = document.createElement("div");
    newEl.classList.add("gui-save");
    newEl.innerHTML = markup;
    container.appendChild(newEl);
    container.insertBefore(newEl, null);
    container.insertBefore(newEl, container.childNodes[0] || null);
  };
  const _addSaveEventListeners = () => {
    mousetrap.exports.bind("alt+s", _saveMarkup);
    mousetrap.exports.bind("esc", _closeSave);
    document.querySelector(".gui-save__close").addEventListener("click", _closeSave);
  };
  const _saveMarkup = () => {
    const allSettings = self2._getAggregatedSettings();
    const allSettingsJson = JSON.stringify(allSettings, null, 1);
    let allSettingsFormatted = allSettingsJson.replace(/\\"/g, "\uFFFF");
    allSettingsFormatted = allSettingsFormatted.replace(/"([^"]+)":/g, "$1:").replace(/\uFFFF/g, '\\"');
    allSettingsFormatted.replace(/"/g, "'");
    const textarea = document.querySelector(".gui-save__textarea");
    textarea.value = allSettingsFormatted;
    _openSave();
    _copySaveToClipboard();
  };
  const _openSave = () => {
    document.querySelector(".gui-save").classList.add("is-visible");
  };
  const _copySaveToClipboard = () => {
    const textarea = document.querySelector(".gui-save__textarea");
    clipboard.write(textarea.value);
    const clipboardNotificationEl = document.querySelector(".gui-save__clipboard-notification");
    clipboardNotificationEl.classList.add("is-visible");
    window.setTimeout(() => {
      clipboardNotificationEl.classList.remove("is-visible");
    }, 2e3);
  };
  const _closeSave = () => {
    document.querySelector(".gui-save").classList.remove("is-visible");
  };
  const _addStyles = function() {
    const css2 = document.createElement("style");
    css2.type = "text/css";
    css2.appendChild(document.createTextNode(`
      .dg.ac {
        z-index: 9999;
      }

      .gui-save {
        display: none;
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        justify-content: center;
        align-items: center;
        box-sizing: border-box;
        background-color: rgba(255, 255, 255, 0.1);
        z-index: 999;
      }

      .gui-save *, .gui-save *:before, .gui-save *:after {
        box-sizing: inherit;
      }

      .gui-save.is-visible {
        display: flex;
      }

      .gui-save__inner {
        position: relative;
        width: 100%;
        max-width: 400px;
        margin: 20px;
      }

      .gui-save__textarea {
        appearance: none;
        border-radius: 5px;
        border: none;
        background-color: #1f1f1f;
        width: 100%;
        height: 300px;
        padding: 25px 23px;
        border-left: 4px solid #5887da;
        font-family: 'Courier New', Courier, 'Lucida Sans Typewriter', 'Lucida Typewriter', monospace;
        font-size: 14px;
        line-height: 1.5;
        font-weight: normal;
        color: white;
        transition: border-color 0.2s;
      }

      .gui-save__textarea:focus {
        outline: none;
        border-color: #ee907b;
      }

      .gui-save__clipboard-notification {
        font-family: 'Courier New', Courier, 'Lucida Sans Typewriter', 'Lucida Typewriter', monospace;
        font-size: 13px;
        pointer-events: none;
        position: absolute;
        bottom: -45px;
        left: 0;
        right: 0;
        opacity: 0;
        color: #5887da;
        transition: opacity 0.4s;
      }

      .gui-save__clipboard-notification.is-visible {
        opacity: 1;
      }

      .gui-save__close {
        position: absolute;
        width: 35px;
        height: 35px;
        display: flex;
        justify-content: center;
        align-items: center;
        top: 0;
        right: 0;
        z-index: 1;
        font-size: 18px;
        cursor: pointer;
        color: #fff;
      }

      .gui-save__close:active {
        opacity: 0.7;
      }
    `));
    document.querySelector("head").appendChild(css2);
  };
  const _setupMidiInputs = function() {
    Midi.inputs.forEach((input) => {
      input.addListener("midimessage", "all", _onMidiMessage);
    });
  };
  const _onMidiMessage = function(message) {
    const [command, note, velocity] = message.data;
    if (debugMidi)
      console.log(`command: ${command} / note: ${note} / velocity: ${velocity}`);
    _controlRangeChange(note, velocity);
    _customControlChange(note, velocity);
  };
  const _controlRangeChange = function(note, velocity) {
    const controlIdx = midiConnectRange.indexOf(note);
    if (controlIdx < 0)
      return;
    const controller = self2._getNumericControllerAtIndex(controlIdx);
    if (!controller)
      return;
    const { __min: min, __max: max, __step: step } = controller;
    const adjustedStep = step ? step : (max - min) / 127;
    const scaledValue = self2._mapRange(0, 127, min, max, velocity);
    const snappedValue = self2._snap(adjustedStep.toFixed(5), scaledValue);
    controller.setValue(snappedValue);
  };
  const _customControlChange = function(note, velocity) {
    if (customControls[note]) {
      customControls[note].call(self2, velocity);
    }
  };
  const _getAllFolders = () => {
    return folders.length ? folders : [self2.gui];
  };
  const _updateControllerColors = function() {
    const allControllers = self2.getControllers(false);
    allControllers.forEach((controller, idx) => {
      const colorIdx = Math.floor(idx / self2.midiPerColor);
      const color = self2.colors[colorIdx];
      const el = controller.domElement;
      const rowEl = el.closest(".cr.number.has-slider");
      if (rowEl) {
        rowEl.style.borderLeftColor = `${color}`;
        const sliderEl = rowEl.querySelector(".slider-fg");
        sliderEl.style.backgroundColor = `${color}`;
      }
    });
  };
  _init();
  return self2;
};
export { Gui as default };
//# sourceMappingURL=gui.es.js.map
