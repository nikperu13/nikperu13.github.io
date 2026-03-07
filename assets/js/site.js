"use strict";
(() => {
  // node_modules/animejs/dist/modules/core/consts.js
  var isBrowser = typeof window !== "undefined";
  var win = isBrowser ? (
    /** @type {AnimeJSWindow} */
    /** @type {unknown} */
    window
  ) : null;
  var doc = isBrowser ? document : null;
  var tweenTypes = {
    OBJECT: 0,
    ATTRIBUTE: 1,
    CSS: 2,
    TRANSFORM: 3,
    CSS_VAR: 4
  };
  var valueTypes = {
    NUMBER: 0,
    UNIT: 1,
    COLOR: 2,
    COMPLEX: 3
  };
  var tickModes = {
    NONE: 0,
    AUTO: 1,
    FORCE: 2
  };
  var compositionTypes = {
    replace: 0,
    none: 1,
    blend: 2
  };
  var isRegisteredTargetSymbol = /* @__PURE__ */ Symbol();
  var isDomSymbol = /* @__PURE__ */ Symbol();
  var isSvgSymbol = /* @__PURE__ */ Symbol();
  var transformsSymbol = /* @__PURE__ */ Symbol();
  var proxyTargetSymbol = /* @__PURE__ */ Symbol();
  var minValue = 1e-11;
  var maxValue = 1e12;
  var K = 1e3;
  var maxFps = 240;
  var emptyString = "";
  var cssVarPrefix = "var(";
  var shortTransforms = /* @__PURE__ */ (() => {
    const map = /* @__PURE__ */ new Map();
    map.set("x", "translateX");
    map.set("y", "translateY");
    map.set("z", "translateZ");
    return map;
  })();
  var validTransforms = [
    "translateX",
    "translateY",
    "translateZ",
    "rotate",
    "rotateX",
    "rotateY",
    "rotateZ",
    "scale",
    "scaleX",
    "scaleY",
    "scaleZ",
    "skew",
    "skewX",
    "skewY",
    "matrix",
    "matrix3d",
    "perspective"
  ];
  var transformsFragmentStrings = /* @__PURE__ */ validTransforms.reduce((a, v) => ({ ...a, [v]: v + "(" }), {});
  var noop = () => {
  };
  var validRgbHslRgx = /\)\s*[-.\d]/;
  var hexTestRgx = /(^#([\da-f]{3}){1,2}$)|(^#([\da-f]{4}){1,2}$)/i;
  var rgbExecRgx = /rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i;
  var rgbaExecRgx = /rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(-?\d+|-?\d*.\d+)\s*\)/i;
  var hslExecRgx = /hsl\(\s*(-?\d+|-?\d*.\d+)\s*,\s*(-?\d+|-?\d*.\d+)%\s*,\s*(-?\d+|-?\d*.\d+)%\s*\)/i;
  var hslaExecRgx = /hsla\(\s*(-?\d+|-?\d*.\d+)\s*,\s*(-?\d+|-?\d*.\d+)%\s*,\s*(-?\d+|-?\d*.\d+)%\s*,\s*(-?\d+|-?\d*.\d+)\s*\)/i;
  var digitWithExponentRgx = /[-+]?\d*\.?\d+(?:e[-+]?\d)?/gi;
  var unitsExecRgx = /^([-+]?\d*\.?\d+(?:e[-+]?\d+)?)([a-z]+|%)$/i;
  var lowerCaseRgx = /([a-z])([A-Z])/g;
  var transformsExecRgx = /(\w+)(\([^)]+\)+)/g;
  var relativeValuesExecRgx = /(\*=|\+=|-=)/;
  var cssVariableMatchRgx = /var\(\s*(--[\w-]+)(?:\s*,\s*([^)]+))?\s*\)/;

  // node_modules/animejs/dist/modules/core/globals.js
  var defaults = {
    id: null,
    keyframes: null,
    playbackEase: null,
    playbackRate: 1,
    frameRate: maxFps,
    loop: 0,
    reversed: false,
    alternate: false,
    autoplay: true,
    persist: false,
    duration: K,
    delay: 0,
    loopDelay: 0,
    ease: "out(2)",
    composition: compositionTypes.replace,
    modifier: (v) => v,
    onBegin: noop,
    onBeforeUpdate: noop,
    onUpdate: noop,
    onLoop: noop,
    onPause: noop,
    onComplete: noop,
    onRender: noop
  };
  var scope = {
    /** @type {Scope} */
    current: null,
    /** @type {Document|DOMTarget} */
    root: doc
  };
  var globals = {
    /** @type {DefaultsParams} */
    defaults,
    /** @type {Number} */
    precision: 4,
    /** @type {Number} equals 1 in ms mode, 0.001 in s mode */
    timeScale: 1,
    /** @type {Number} */
    tickThreshold: 200
  };
  var devTools = isBrowser && win.AnimeJSDevTools;
  var globalVersions = { version: "4.3.6", engine: null };
  if (isBrowser) {
    if (!win.AnimeJS) win.AnimeJS = [];
    win.AnimeJS.push(globalVersions);
  }

  // node_modules/animejs/dist/modules/core/helpers.js
  var toLowerCase = (str) => str.replace(lowerCaseRgx, "$1-$2").toLowerCase();
  var stringStartsWith = (str, sub) => str.indexOf(sub) === 0;
  var now = Date.now;
  var isArr = Array.isArray;
  var isObj = (a) => a && a.constructor === Object;
  var isNum = (a) => typeof a === "number" && !isNaN(a);
  var isStr = (a) => typeof a === "string";
  var isFnc = (a) => typeof a === "function";
  var isUnd = (a) => typeof a === "undefined";
  var isNil = (a) => isUnd(a) || a === null;
  var isSvg = (a) => isBrowser && a instanceof SVGElement;
  var isHex = (a) => hexTestRgx.test(a);
  var isRgb = (a) => stringStartsWith(a, "rgb");
  var isHsl = (a) => stringStartsWith(a, "hsl");
  var isCol = (a) => isHex(a) || (isRgb(a) || isHsl(a)) && (a[a.length - 1] === ")" || !validRgbHslRgx.test(a));
  var isKey = (a) => !globals.defaults.hasOwnProperty(a);
  var svgCssReservedProperties = ["opacity", "rotate", "overflow", "color"];
  var isValidSVGAttribute = (el, propertyName) => {
    if (svgCssReservedProperties.includes(propertyName)) return false;
    if (el.getAttribute(propertyName) || propertyName in el) {
      if (propertyName === "scale") {
        const elParentNode = (
          /** @type {SVGGeometryElement} */
          /** @type {DOMTarget} */
          el.parentNode
        );
        return elParentNode && elParentNode.tagName === "filter";
      }
      return true;
    }
  };
  var parseNumber = (str) => isStr(str) ? parseFloat(
    /** @type {String} */
    str
  ) : (
    /** @type {Number} */
    str
  );
  var pow = Math.pow;
  var sqrt = Math.sqrt;
  var sin = Math.sin;
  var cos = Math.cos;
  var abs = Math.abs;
  var floor = Math.floor;
  var asin = Math.asin;
  var max = Math.max;
  var PI = Math.PI;
  var _round = Math.round;
  var clamp = (v, min, max2) => v < min ? min : v > max2 ? max2 : v;
  var powCache = {};
  var round = (v, decimalLength) => {
    if (decimalLength < 0) return v;
    if (!decimalLength) return _round(v);
    let p = powCache[decimalLength];
    if (!p) p = powCache[decimalLength] = 10 ** decimalLength;
    return _round(v * p) / p;
  };
  var lerp = (start, end, factor) => start + (end - start) * factor;
  var clampInfinity = (v) => v === Infinity ? maxValue : v === -Infinity ? -maxValue : v;
  var normalizeTime = (v) => v <= minValue ? minValue : clampInfinity(round(v, 11));
  var cloneArray = (a) => isArr(a) ? [...a] : a;
  var mergeObjects = (o1, o2) => {
    const merged = (
      /** @type {T & U} */
      { ...o1 }
    );
    for (let p in o2) {
      const o1p = (
        /** @type {T & U} */
        o1[p]
      );
      merged[p] = isUnd(o1p) ? (
        /** @type {T & U} */
        o2[p]
      ) : o1p;
    }
    return merged;
  };
  var forEachChildren = (parent, callback, reverse, prevProp = "_prev", nextProp = "_next") => {
    let next = parent._head;
    let adjustedNextProp = nextProp;
    if (reverse) {
      next = parent._tail;
      adjustedNextProp = prevProp;
    }
    while (next) {
      const currentNext = next[adjustedNextProp];
      callback(next);
      next = currentNext;
    }
  };
  var removeChild = (parent, child, prevProp = "_prev", nextProp = "_next") => {
    const prev = child[prevProp];
    const next = child[nextProp];
    prev ? prev[nextProp] = next : parent._head = next;
    next ? next[prevProp] = prev : parent._tail = prev;
    child[prevProp] = null;
    child[nextProp] = null;
  };
  var addChild = (parent, child, sortMethod, prevProp = "_prev", nextProp = "_next") => {
    let prev = parent._tail;
    while (prev && sortMethod && sortMethod(prev, child)) prev = prev[prevProp];
    const next = prev ? prev[nextProp] : parent._head;
    prev ? prev[nextProp] = child : parent._head = child;
    next ? next[prevProp] = child : parent._tail = child;
    child[prevProp] = prev;
    child[nextProp] = next;
  };

  // node_modules/animejs/dist/modules/core/transforms.js
  var parseInlineTransforms = (target, propName, animationInlineStyles) => {
    const inlineTransforms = target.style.transform;
    let inlinedStylesPropertyValue;
    if (inlineTransforms) {
      const cachedTransforms = target[transformsSymbol];
      let t;
      while (t = transformsExecRgx.exec(inlineTransforms)) {
        const inlinePropertyName = t[1];
        const inlinePropertyValue = t[2].slice(1, -1);
        cachedTransforms[inlinePropertyName] = inlinePropertyValue;
        if (inlinePropertyName === propName) {
          inlinedStylesPropertyValue = inlinePropertyValue;
          if (animationInlineStyles) {
            animationInlineStyles[propName] = inlinePropertyValue;
          }
        }
      }
    }
    return inlineTransforms && !isUnd(inlinedStylesPropertyValue) ? inlinedStylesPropertyValue : stringStartsWith(propName, "scale") ? "1" : stringStartsWith(propName, "rotate") || stringStartsWith(propName, "skew") ? "0deg" : "0px";
  };

  // node_modules/animejs/dist/modules/core/colors.js
  var rgbToRgba = (rgbValue) => {
    const rgba2 = rgbExecRgx.exec(rgbValue) || rgbaExecRgx.exec(rgbValue);
    const a = !isUnd(rgba2[4]) ? +rgba2[4] : 1;
    return [
      +rgba2[1],
      +rgba2[2],
      +rgba2[3],
      a
    ];
  };
  var hexToRgba = (hexValue) => {
    const hexLength = hexValue.length;
    const isShort = hexLength === 4 || hexLength === 5;
    return [
      +("0x" + hexValue[1] + hexValue[isShort ? 1 : 2]),
      +("0x" + hexValue[isShort ? 2 : 3] + hexValue[isShort ? 2 : 4]),
      +("0x" + hexValue[isShort ? 3 : 5] + hexValue[isShort ? 3 : 6]),
      hexLength === 5 || hexLength === 9 ? +(+("0x" + hexValue[isShort ? 4 : 7] + hexValue[isShort ? 4 : 8]) / 255).toFixed(3) : 1
    ];
  };
  var hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p;
  };
  var hslToRgba = (hslValue) => {
    const hsla2 = hslExecRgx.exec(hslValue) || hslaExecRgx.exec(hslValue);
    const h = +hsla2[1] / 360;
    const s = +hsla2[2] / 100;
    const l = +hsla2[3] / 100;
    const a = !isUnd(hsla2[4]) ? +hsla2[4] : 1;
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = round(hue2rgb(p, q, h + 1 / 3) * 255, 0);
      g = round(hue2rgb(p, q, h) * 255, 0);
      b = round(hue2rgb(p, q, h - 1 / 3) * 255, 0);
    }
    return [r, g, b, a];
  };
  var convertColorStringValuesToRgbaArray = (colorString) => {
    return isRgb(colorString) ? rgbToRgba(colorString) : isHex(colorString) ? hexToRgba(colorString) : isHsl(colorString) ? hslToRgba(colorString) : [0, 0, 0, 1];
  };

  // node_modules/animejs/dist/modules/core/values.js
  var setValue = (targetValue, defaultValue) => {
    return isUnd(targetValue) ? defaultValue : targetValue;
  };
  var getFunctionValue = (value, target, index, total, store) => {
    let func;
    if (isFnc(value)) {
      func = () => {
        const computed = (
          /** @type {Function} */
          value(target, index, total)
        );
        return !isNaN(+computed) ? +computed : computed || 0;
      };
    } else if (isStr(value) && stringStartsWith(value, cssVarPrefix)) {
      func = () => {
        const match = value.match(cssVariableMatchRgx);
        const cssVarName = match[1];
        const fallbackValue = match[2];
        let computed = getComputedStyle(
          /** @type {HTMLElement} */
          target
        )?.getPropertyValue(cssVarName);
        if ((!computed || computed.trim() === emptyString) && fallbackValue) {
          computed = fallbackValue.trim();
        }
        return computed || 0;
      };
    } else {
      return value;
    }
    if (store) store.func = func;
    return func();
  };
  var getTweenType = (target, prop) => {
    return !target[isDomSymbol] ? tweenTypes.OBJECT : (
      // Handle SVG attributes
      target[isSvgSymbol] && isValidSVGAttribute(target, prop) ? tweenTypes.ATTRIBUTE : (
        // Handle CSS Transform properties differently than CSS to allow individual animations
        validTransforms.includes(prop) || shortTransforms.get(prop) ? tweenTypes.TRANSFORM : (
          // CSS variables
          stringStartsWith(prop, "--") ? tweenTypes.CSS_VAR : (
            // All other CSS properties
            prop in /** @type {DOMTarget} */
            target.style ? tweenTypes.CSS : (
              // Handle other DOM Attributes
              prop in target ? tweenTypes.OBJECT : tweenTypes.ATTRIBUTE
            )
          )
        )
      )
    );
  };
  var getCSSValue = (target, propName, animationInlineStyles) => {
    const inlineStyles = target.style[propName];
    if (inlineStyles && animationInlineStyles) {
      animationInlineStyles[propName] = inlineStyles;
    }
    const value = inlineStyles || getComputedStyle(target[proxyTargetSymbol] || target).getPropertyValue(propName);
    return value === "auto" ? "0" : value;
  };
  var getOriginalAnimatableValue = (target, propName, tweenType, animationInlineStyles) => {
    const type = !isUnd(tweenType) ? tweenType : getTweenType(target, propName);
    return type === tweenTypes.OBJECT ? target[propName] || 0 : type === tweenTypes.ATTRIBUTE ? (
      /** @type {DOMTarget} */
      target.getAttribute(propName)
    ) : type === tweenTypes.TRANSFORM ? parseInlineTransforms(
      /** @type {DOMTarget} */
      target,
      propName,
      animationInlineStyles
    ) : type === tweenTypes.CSS_VAR ? getCSSValue(
      /** @type {DOMTarget} */
      target,
      propName,
      animationInlineStyles
    ).trimStart() : getCSSValue(
      /** @type {DOMTarget} */
      target,
      propName,
      animationInlineStyles
    );
  };
  var getRelativeValue = (x, y, operator) => {
    return operator === "-" ? x - y : operator === "+" ? x + y : x * y;
  };
  var createDecomposedValueTargetObject = () => {
    return {
      /** @type {valueTypes} */
      t: valueTypes.NUMBER,
      n: 0,
      u: null,
      o: null,
      d: null,
      s: null
    };
  };
  var decomposeRawValue = (rawValue, targetObject) => {
    targetObject.t = valueTypes.NUMBER;
    targetObject.n = 0;
    targetObject.u = null;
    targetObject.o = null;
    targetObject.d = null;
    targetObject.s = null;
    if (!rawValue) return targetObject;
    const num = +rawValue;
    if (!isNaN(num)) {
      targetObject.n = num;
      return targetObject;
    } else {
      let str = (
        /** @type {String} */
        rawValue
      );
      if (str[1] === "=") {
        targetObject.o = str[0];
        str = str.slice(2);
      }
      const unitMatch = str.includes(" ") ? false : unitsExecRgx.exec(str);
      if (unitMatch) {
        targetObject.t = valueTypes.UNIT;
        targetObject.n = +unitMatch[1];
        targetObject.u = unitMatch[2];
        return targetObject;
      } else if (targetObject.o) {
        targetObject.n = +str;
        return targetObject;
      } else if (isCol(str)) {
        targetObject.t = valueTypes.COLOR;
        targetObject.d = convertColorStringValuesToRgbaArray(str);
        return targetObject;
      } else {
        const matchedNumbers = str.match(digitWithExponentRgx);
        targetObject.t = valueTypes.COMPLEX;
        targetObject.d = matchedNumbers ? matchedNumbers.map(Number) : [];
        targetObject.s = str.split(digitWithExponentRgx) || [];
        return targetObject;
      }
    }
  };
  var decomposeTweenValue = (tween, targetObject) => {
    targetObject.t = tween._valueType;
    targetObject.n = tween._toNumber;
    targetObject.u = tween._unit;
    targetObject.o = null;
    targetObject.d = cloneArray(tween._toNumbers);
    targetObject.s = cloneArray(tween._strings);
    return targetObject;
  };
  var decomposedOriginalValue = createDecomposedValueTargetObject();

  // node_modules/animejs/dist/modules/core/render.js
  var render = (tickable, time, muteCallbacks, internalRender, tickMode) => {
    const parent = tickable.parent;
    const duration = tickable.duration;
    const completed = tickable.completed;
    const iterationDuration = tickable.iterationDuration;
    const iterationCount = tickable.iterationCount;
    const _currentIteration = tickable._currentIteration;
    const _loopDelay = tickable._loopDelay;
    const _reversed = tickable._reversed;
    const _alternate = tickable._alternate;
    const _hasChildren = tickable._hasChildren;
    const tickableDelay = tickable._delay;
    const tickablePrevAbsoluteTime = tickable._currentTime;
    const tickableEndTime = tickableDelay + iterationDuration;
    const tickableAbsoluteTime = time - tickableDelay;
    const tickablePrevTime = clamp(tickablePrevAbsoluteTime, -tickableDelay, duration);
    const tickableCurrentTime = clamp(tickableAbsoluteTime, -tickableDelay, duration);
    const deltaTime = tickableAbsoluteTime - tickablePrevAbsoluteTime;
    const isCurrentTimeAboveZero = tickableCurrentTime > 0;
    const isCurrentTimeEqualOrAboveDuration = tickableCurrentTime >= duration;
    const isSetter = duration <= minValue;
    const forcedTick = tickMode === tickModes.FORCE;
    let isOdd = 0;
    let iterationElapsedTime = tickableAbsoluteTime;
    let hasRendered = 0;
    if (iterationCount > 1) {
      const currentIteration = ~~(tickableCurrentTime / (iterationDuration + (isCurrentTimeEqualOrAboveDuration ? 0 : _loopDelay)));
      tickable._currentIteration = clamp(currentIteration, 0, iterationCount);
      if (isCurrentTimeEqualOrAboveDuration) tickable._currentIteration--;
      isOdd = tickable._currentIteration % 2;
      iterationElapsedTime = tickableCurrentTime % (iterationDuration + _loopDelay) || 0;
    }
    const isReversed = _reversed ^ (_alternate && isOdd);
    const _ease = (
      /** @type {Renderable} */
      tickable._ease
    );
    let iterationTime = isCurrentTimeEqualOrAboveDuration ? isReversed ? 0 : duration : isReversed ? iterationDuration - iterationElapsedTime : iterationElapsedTime;
    if (_ease) iterationTime = iterationDuration * _ease(iterationTime / iterationDuration) || 0;
    const isRunningBackwards = (parent ? parent.backwards : tickableAbsoluteTime < tickablePrevAbsoluteTime) ? !isReversed : !!isReversed;
    tickable._currentTime = tickableAbsoluteTime;
    tickable._iterationTime = iterationTime;
    tickable.backwards = isRunningBackwards;
    if (isCurrentTimeAboveZero && !tickable.began) {
      tickable.began = true;
      if (!muteCallbacks && !(parent && (isRunningBackwards || !parent.began))) {
        tickable.onBegin(
          /** @type {CallbackArgument} */
          tickable
        );
      }
    } else if (tickableAbsoluteTime <= 0) {
      tickable.began = false;
    }
    if (!muteCallbacks && !_hasChildren && isCurrentTimeAboveZero && tickable._currentIteration !== _currentIteration) {
      tickable.onLoop(
        /** @type {CallbackArgument} */
        tickable
      );
    }
    if (forcedTick || tickMode === tickModes.AUTO && (time >= tickableDelay && time <= tickableEndTime || // Normal render
    time <= tickableDelay && tickablePrevTime > tickableDelay || // Playhead is before the animation start time so make sure the animation is at its initial state
    time >= tickableEndTime && tickablePrevTime !== duration) || iterationTime >= tickableEndTime && tickablePrevTime !== duration || iterationTime <= tickableDelay && tickablePrevTime > 0 || time <= tickablePrevTime && tickablePrevTime === duration && completed || // Force a render if a seek occurs on an completed animation
    isCurrentTimeEqualOrAboveDuration && !completed && isSetter) {
      if (isCurrentTimeAboveZero) {
        tickable.computeDeltaTime(tickablePrevTime);
        if (!muteCallbacks) tickable.onBeforeUpdate(
          /** @type {CallbackArgument} */
          tickable
        );
      }
      if (!_hasChildren) {
        const forcedRender = forcedTick || (isRunningBackwards ? deltaTime * -1 : deltaTime) >= globals.tickThreshold;
        const absoluteTime = tickable._offset + (parent ? parent._offset : 0) + tickableDelay + iterationTime;
        let tween = (
          /** @type {Tween} */
          /** @type {JSAnimation} */
          tickable._head
        );
        let tweenTarget;
        let tweenStyle;
        let tweenTargetTransforms;
        let tweenTargetTransformsProperties;
        let tweenTransformsNeedUpdate = 0;
        while (tween) {
          const tweenComposition = tween._composition;
          const tweenCurrentTime = tween._currentTime;
          const tweenChangeDuration = tween._changeDuration;
          const tweenAbsEndTime = tween._absoluteStartTime + tween._changeDuration;
          const tweenNextRep = tween._nextRep;
          const tweenPrevRep = tween._prevRep;
          const tweenHasComposition = tweenComposition !== compositionTypes.none;
          if ((forcedRender || (tweenCurrentTime !== tweenChangeDuration || absoluteTime <= tweenAbsEndTime + (tweenNextRep ? tweenNextRep._delay : 0)) && (tweenCurrentTime !== 0 || absoluteTime >= tween._absoluteStartTime)) && (!tweenHasComposition || !tween._isOverridden && (!tween._isOverlapped || absoluteTime <= tweenAbsEndTime) && (!tweenNextRep || (tweenNextRep._isOverridden || absoluteTime <= tweenNextRep._absoluteStartTime)) && (!tweenPrevRep || (tweenPrevRep._isOverridden || absoluteTime >= tweenPrevRep._absoluteStartTime + tweenPrevRep._changeDuration + tween._delay)))) {
            const tweenNewTime = tween._currentTime = clamp(iterationTime - tween._startTime, 0, tweenChangeDuration);
            const tweenProgress = tween._ease(tweenNewTime / tween._updateDuration);
            const tweenModifier = tween._modifier;
            const tweenValueType = tween._valueType;
            const tweenType = tween._tweenType;
            const tweenIsObject = tweenType === tweenTypes.OBJECT;
            const tweenIsNumber = tweenValueType === valueTypes.NUMBER;
            const tweenPrecision = tweenIsNumber && tweenIsObject || tweenProgress === 0 || tweenProgress === 1 ? -1 : globals.precision;
            let value;
            let number2;
            if (tweenIsNumber) {
              value = number2 = /** @type {Number} */
              tweenModifier(round(lerp(tween._fromNumber, tween._toNumber, tweenProgress), tweenPrecision));
            } else if (tweenValueType === valueTypes.UNIT) {
              number2 = /** @type {Number} */
              tweenModifier(round(lerp(tween._fromNumber, tween._toNumber, tweenProgress), tweenPrecision));
              value = `${number2}${tween._unit}`;
            } else if (tweenValueType === valueTypes.COLOR) {
              const fn = tween._fromNumbers;
              const tn = tween._toNumbers;
              const r = round(clamp(
                /** @type {Number} */
                tweenModifier(lerp(fn[0], tn[0], tweenProgress)),
                0,
                255
              ), 0);
              const g = round(clamp(
                /** @type {Number} */
                tweenModifier(lerp(fn[1], tn[1], tweenProgress)),
                0,
                255
              ), 0);
              const b = round(clamp(
                /** @type {Number} */
                tweenModifier(lerp(fn[2], tn[2], tweenProgress)),
                0,
                255
              ), 0);
              const a = clamp(
                /** @type {Number} */
                tweenModifier(round(lerp(fn[3], tn[3], tweenProgress), tweenPrecision)),
                0,
                1
              );
              value = `rgba(${r},${g},${b},${a})`;
              if (tweenHasComposition) {
                const ns = tween._numbers;
                ns[0] = r;
                ns[1] = g;
                ns[2] = b;
                ns[3] = a;
              }
            } else if (tweenValueType === valueTypes.COMPLEX) {
              value = tween._strings[0];
              for (let j = 0, l = tween._toNumbers.length; j < l; j++) {
                const n = (
                  /** @type {Number} */
                  tweenModifier(round(lerp(tween._fromNumbers[j], tween._toNumbers[j], tweenProgress), tweenPrecision))
                );
                const s = tween._strings[j + 1];
                value += `${s ? n + s : n}`;
                if (tweenHasComposition) {
                  tween._numbers[j] = n;
                }
              }
            }
            if (tweenHasComposition) {
              tween._number = number2;
            }
            if (!internalRender && tweenComposition !== compositionTypes.blend) {
              const tweenProperty = tween.property;
              tweenTarget = tween.target;
              if (tweenIsObject) {
                tweenTarget[tweenProperty] = value;
              } else if (tweenType === tweenTypes.ATTRIBUTE) {
                tweenTarget.setAttribute(
                  tweenProperty,
                  /** @type {String} */
                  value
                );
              } else {
                tweenStyle = /** @type {DOMTarget} */
                tweenTarget.style;
                if (tweenType === tweenTypes.TRANSFORM) {
                  if (tweenTarget !== tweenTargetTransforms) {
                    tweenTargetTransforms = tweenTarget;
                    tweenTargetTransformsProperties = tweenTarget[transformsSymbol];
                  }
                  tweenTargetTransformsProperties[tweenProperty] = value;
                  tweenTransformsNeedUpdate = 1;
                } else if (tweenType === tweenTypes.CSS) {
                  tweenStyle[tweenProperty] = value;
                } else if (tweenType === tweenTypes.CSS_VAR) {
                  tweenStyle.setProperty(
                    tweenProperty,
                    /** @type {String} */
                    value
                  );
                }
              }
              if (isCurrentTimeAboveZero) hasRendered = 1;
            } else {
              tween._value = value;
            }
          }
          if (tweenTransformsNeedUpdate && tween._renderTransforms) {
            let str = emptyString;
            for (let key2 in tweenTargetTransformsProperties) {
              str += `${transformsFragmentStrings[key2]}${tweenTargetTransformsProperties[key2]}) `;
            }
            tweenStyle.transform = str;
            tweenTransformsNeedUpdate = 0;
          }
          tween = tween._next;
        }
        if (!muteCallbacks && hasRendered) {
          tickable.onRender(
            /** @type {JSAnimation} */
            tickable
          );
        }
      }
      if (!muteCallbacks && isCurrentTimeAboveZero) {
        tickable.onUpdate(
          /** @type {CallbackArgument} */
          tickable
        );
      }
    }
    if (parent && isSetter) {
      if (!muteCallbacks && // (tickableAbsoluteTime > 0 instead) of (tickableAbsoluteTime >= duration) to prevent floating point precision issues
      // see: https://github.com/juliangarnier/anime/issues/1088
      (parent.began && !isRunningBackwards && tickableAbsoluteTime > 0 && !completed || isRunningBackwards && tickableAbsoluteTime <= minValue && completed)) {
        tickable.onComplete(
          /** @type {CallbackArgument} */
          tickable
        );
        tickable.completed = !isRunningBackwards;
      }
    } else if (isCurrentTimeAboveZero && isCurrentTimeEqualOrAboveDuration) {
      if (iterationCount === Infinity) {
        tickable._startTime += tickable.duration;
      } else if (tickable._currentIteration >= iterationCount - 1) {
        tickable.paused = true;
        if (!completed && !_hasChildren) {
          tickable.completed = true;
          if (!muteCallbacks && !(parent && (isRunningBackwards || !parent.began))) {
            tickable.onComplete(
              /** @type {CallbackArgument} */
              tickable
            );
            tickable._resolve(
              /** @type {CallbackArgument} */
              tickable
            );
          }
        }
      }
    } else {
      tickable.completed = false;
    }
    return hasRendered;
  };
  var tick = (tickable, time, muteCallbacks, internalRender, tickMode) => {
    const _currentIteration = tickable._currentIteration;
    render(tickable, time, muteCallbacks, internalRender, tickMode);
    if (tickable._hasChildren) {
      const tl = (
        /** @type {Timeline} */
        tickable
      );
      const tlIsRunningBackwards = tl.backwards;
      const tlChildrenTime = internalRender ? time : tl._iterationTime;
      const tlCildrenTickTime = now();
      let tlChildrenHasRendered = 0;
      let tlChildrenHaveCompleted = true;
      if (!internalRender && tl._currentIteration !== _currentIteration) {
        const tlIterationDuration = tl.iterationDuration;
        forEachChildren(tl, (child) => {
          if (!tlIsRunningBackwards) {
            if (!child.completed && !child.backwards && child._currentTime < child.iterationDuration) {
              render(child, tlIterationDuration, muteCallbacks, 1, tickModes.FORCE);
            }
            child.began = false;
            child.completed = false;
          } else {
            const childDuration = child.duration;
            const childStartTime = child._offset + child._delay;
            const childEndTime = childStartTime + childDuration;
            if (!muteCallbacks && childDuration <= minValue && (!childStartTime || childEndTime === tlIterationDuration)) {
              child.onComplete(child);
            }
          }
        });
        if (!muteCallbacks) tl.onLoop(
          /** @type {CallbackArgument} */
          tl
        );
      }
      forEachChildren(tl, (child) => {
        const childTime = round((tlChildrenTime - child._offset) * child._speed, 12);
        const childTickMode = child._fps < tl._fps ? child.requestTick(tlCildrenTickTime) : tickMode;
        tlChildrenHasRendered += render(child, childTime, muteCallbacks, internalRender, childTickMode);
        if (!child.completed && tlChildrenHaveCompleted) tlChildrenHaveCompleted = false;
      }, tlIsRunningBackwards);
      if (!muteCallbacks && tlChildrenHasRendered) tl.onRender(
        /** @type {CallbackArgument} */
        tl
      );
      if ((tlChildrenHaveCompleted || tlIsRunningBackwards) && tl._currentTime >= tl.duration) {
        tl.paused = true;
        if (!tl.completed) {
          tl.completed = true;
          if (!muteCallbacks) {
            tl.onComplete(
              /** @type {CallbackArgument} */
              tl
            );
            tl._resolve(
              /** @type {CallbackArgument} */
              tl
            );
          }
        }
      }
    }
  };

  // node_modules/animejs/dist/modules/core/styles.js
  var propertyNamesCache = {};
  var sanitizePropertyName = (propertyName, target, tweenType) => {
    if (tweenType === tweenTypes.TRANSFORM) {
      const t = shortTransforms.get(propertyName);
      return t ? t : propertyName;
    } else if (tweenType === tweenTypes.CSS || // Handle special cases where properties like "strokeDashoffset" needs to be set as "stroke-dashoffset"
    // but properties like "baseFrequency" should stay in lowerCamelCase
    tweenType === tweenTypes.ATTRIBUTE && (isSvg(target) && propertyName in /** @type {DOMTarget} */
    target.style)) {
      const cachedPropertyName = propertyNamesCache[propertyName];
      if (cachedPropertyName) {
        return cachedPropertyName;
      } else {
        const lowerCaseName = propertyName ? toLowerCase(propertyName) : propertyName;
        propertyNamesCache[propertyName] = lowerCaseName;
        return lowerCaseName;
      }
    } else {
      return propertyName;
    }
  };
  var cleanInlineStyles = (renderable) => {
    if (renderable._hasChildren) {
      forEachChildren(renderable, cleanInlineStyles, true);
    } else {
      const animation = (
        /** @type {JSAnimation} */
        renderable
      );
      animation.pause();
      forEachChildren(animation, (tween) => {
        const tweenProperty = tween.property;
        const tweenTarget = tween.target;
        if (tweenTarget[isDomSymbol]) {
          const targetStyle = (
            /** @type {DOMTarget} */
            tweenTarget.style
          );
          const originalInlinedValue = tween._inlineValue;
          const tweenHadNoInlineValue = isNil(originalInlinedValue) || originalInlinedValue === emptyString;
          if (tween._tweenType === tweenTypes.TRANSFORM) {
            const cachedTransforms = tweenTarget[transformsSymbol];
            if (tweenHadNoInlineValue) {
              delete cachedTransforms[tweenProperty];
            } else {
              cachedTransforms[tweenProperty] = originalInlinedValue;
            }
            if (tween._renderTransforms) {
              if (!Object.keys(cachedTransforms).length) {
                targetStyle.removeProperty("transform");
              } else {
                let str = emptyString;
                for (let key2 in cachedTransforms) {
                  str += transformsFragmentStrings[key2] + cachedTransforms[key2] + ") ";
                }
                targetStyle.transform = str;
              }
            }
          } else {
            if (tweenHadNoInlineValue) {
              targetStyle.removeProperty(toLowerCase(tweenProperty));
            } else {
              targetStyle[tweenProperty] = originalInlinedValue;
            }
          }
          if (animation._tail === tween) {
            animation.targets.forEach((t) => {
              if (t.getAttribute && t.getAttribute("style") === emptyString) {
                t.removeAttribute("style");
              }
            });
          }
        }
      });
    }
    return renderable;
  };

  // node_modules/animejs/dist/modules/core/clock.js
  var Clock = class {
    /** @param {Number} [initTime] */
    constructor(initTime = 0) {
      this.deltaTime = 0;
      this._currentTime = initTime;
      this._lastTickTime = initTime;
      this._startTime = initTime;
      this._lastTime = initTime;
      this._scheduledTime = 0;
      this._frameDuration = K / maxFps;
      this._fps = maxFps;
      this._speed = 1;
      this._hasChildren = false;
      this._head = null;
      this._tail = null;
    }
    get fps() {
      return this._fps;
    }
    set fps(frameRate) {
      const previousFrameDuration = this._frameDuration;
      const fr = +frameRate;
      const fps = fr < minValue ? minValue : fr;
      const frameDuration = K / fps;
      if (fps > defaults.frameRate) defaults.frameRate = fps;
      this._fps = fps;
      this._frameDuration = frameDuration;
      this._scheduledTime += frameDuration - previousFrameDuration;
    }
    get speed() {
      return this._speed;
    }
    set speed(playbackRate) {
      const pbr = +playbackRate;
      this._speed = pbr < minValue ? minValue : pbr;
    }
    /**
     * @param  {Number} time
     * @return {tickModes}
     */
    requestTick(time) {
      const scheduledTime = this._scheduledTime;
      this._lastTickTime = time;
      if (time < scheduledTime) return tickModes.NONE;
      const frameDuration = this._frameDuration;
      const frameDelta = time - scheduledTime;
      this._scheduledTime += frameDelta < frameDuration ? frameDuration : frameDelta;
      return tickModes.AUTO;
    }
    /**
     * @param  {Number} time
     * @return {Number}
     */
    computeDeltaTime(time) {
      const delta = time - this._lastTime;
      this.deltaTime = delta;
      this._lastTime = time;
      return delta;
    }
  };

  // node_modules/animejs/dist/modules/animation/additive.js
  var additive = {
    animation: null,
    update: noop
  };
  var addAdditiveAnimation = (lookups2) => {
    let animation = additive.animation;
    if (!animation) {
      animation = {
        duration: minValue,
        computeDeltaTime: noop,
        _offset: 0,
        _delay: 0,
        _head: null,
        _tail: null
      };
      additive.animation = animation;
      additive.update = () => {
        lookups2.forEach((propertyAnimation) => {
          for (let propertyName in propertyAnimation) {
            const tweens = propertyAnimation[propertyName];
            const lookupTween = tweens._head;
            if (lookupTween) {
              const valueType = lookupTween._valueType;
              const additiveValues = valueType === valueTypes.COMPLEX || valueType === valueTypes.COLOR ? cloneArray(lookupTween._fromNumbers) : null;
              let additiveValue = lookupTween._fromNumber;
              let tween = tweens._tail;
              while (tween && tween !== lookupTween) {
                if (additiveValues) {
                  for (let i = 0, l = tween._numbers.length; i < l; i++) additiveValues[i] += tween._numbers[i];
                } else {
                  additiveValue += tween._number;
                }
                tween = tween._prevAdd;
              }
              lookupTween._toNumber = additiveValue;
              lookupTween._toNumbers = additiveValues;
            }
          }
        });
        render(animation, 1, 1, 0, tickModes.FORCE);
      };
    }
    return animation;
  };

  // node_modules/animejs/dist/modules/engine/engine.js
  var engineTickMethod = /* @__PURE__ */ (() => isBrowser ? requestAnimationFrame : setImmediate)();
  var engineCancelMethod = /* @__PURE__ */ (() => isBrowser ? cancelAnimationFrame : clearImmediate)();
  var Engine = class extends Clock {
    /** @param {Number} [initTime] */
    constructor(initTime) {
      super(initTime);
      this.useDefaultMainLoop = true;
      this.pauseOnDocumentHidden = true;
      this.defaults = defaults;
      this.paused = true;
      this.reqId = 0;
    }
    update() {
      const time = this._currentTime = now();
      if (this.requestTick(time)) {
        this.computeDeltaTime(time);
        const engineSpeed = this._speed;
        const engineFps = this._fps;
        let activeTickable = (
          /** @type {Tickable} */
          this._head
        );
        while (activeTickable) {
          const nextTickable = activeTickable._next;
          if (!activeTickable.paused) {
            tick(
              activeTickable,
              (time - activeTickable._startTime) * activeTickable._speed * engineSpeed,
              0,
              // !muteCallbacks
              0,
              // !internalRender
              activeTickable._fps < engineFps ? activeTickable.requestTick(time) : tickModes.AUTO
            );
          } else {
            removeChild(this, activeTickable);
            this._hasChildren = !!this._tail;
            activeTickable._running = false;
            if (activeTickable.completed && !activeTickable._cancelled) {
              activeTickable.cancel();
            }
          }
          activeTickable = nextTickable;
        }
        additive.update();
      }
    }
    wake() {
      if (this.useDefaultMainLoop && !this.reqId) {
        this.requestTick(now());
        this.reqId = engineTickMethod(tickEngine);
      }
      return this;
    }
    pause() {
      if (!this.reqId) return;
      this.paused = true;
      return killEngine();
    }
    resume() {
      if (!this.paused) return;
      this.paused = false;
      forEachChildren(this, (child) => child.resetTime());
      return this.wake();
    }
    // Getter and setter for speed
    get speed() {
      return this._speed * (globals.timeScale === 1 ? 1 : K);
    }
    set speed(playbackRate) {
      this._speed = playbackRate * globals.timeScale;
      forEachChildren(this, (child) => child.speed = child._speed);
    }
    // Getter and setter for timeUnit
    get timeUnit() {
      return globals.timeScale === 1 ? "ms" : "s";
    }
    set timeUnit(unit) {
      const secondsScale = 1e-3;
      const isSecond = unit === "s";
      const newScale = isSecond ? secondsScale : 1;
      if (globals.timeScale !== newScale) {
        globals.timeScale = newScale;
        globals.tickThreshold = 200 * newScale;
        const scaleFactor = isSecond ? secondsScale : K;
        this.defaults.duration *= scaleFactor;
        this._speed *= scaleFactor;
      }
    }
    // Getter and setter for precision
    get precision() {
      return globals.precision;
    }
    set precision(precision) {
      globals.precision = precision;
    }
  };
  var engine = /* @__PURE__ */ (() => {
    const engine2 = new Engine(now());
    if (isBrowser) {
      globalVersions.engine = engine2;
      doc.addEventListener("visibilitychange", () => {
        if (!engine2.pauseOnDocumentHidden) return;
        doc.hidden ? engine2.pause() : engine2.resume();
      });
    }
    return engine2;
  })();
  var tickEngine = () => {
    if (engine._head) {
      engine.reqId = engineTickMethod(tickEngine);
      engine.update();
    } else {
      engine.reqId = 0;
    }
  };
  var killEngine = () => {
    engineCancelMethod(
      /** @type {NodeJS.Immediate & Number} */
      engine.reqId
    );
    engine.reqId = 0;
    return engine;
  };

  // node_modules/animejs/dist/modules/animation/composition.js
  var lookups = {
    /** @type {TweenReplaceLookups} */
    _rep: /* @__PURE__ */ new WeakMap(),
    /** @type {TweenAdditiveLookups} */
    _add: /* @__PURE__ */ new Map()
  };
  var getTweenSiblings = (target, property, lookup = "_rep") => {
    const lookupMap = lookups[lookup];
    let targetLookup = lookupMap.get(target);
    if (!targetLookup) {
      targetLookup = {};
      lookupMap.set(target, targetLookup);
    }
    return targetLookup[property] ? targetLookup[property] : targetLookup[property] = {
      _head: null,
      _tail: null
    };
  };
  var addTweenSortMethod = (p, c) => {
    return p._isOverridden || p._absoluteStartTime > c._absoluteStartTime;
  };
  var overrideTween = (tween) => {
    tween._isOverlapped = 1;
    tween._isOverridden = 1;
    tween._changeDuration = minValue;
    tween._currentTime = minValue;
  };
  var composeTween = (tween, siblings) => {
    const tweenCompositionType = tween._composition;
    if (tweenCompositionType === compositionTypes.replace) {
      const tweenAbsStartTime = tween._absoluteStartTime;
      addChild(siblings, tween, addTweenSortMethod, "_prevRep", "_nextRep");
      const prevSibling = tween._prevRep;
      if (prevSibling) {
        const prevParent = prevSibling.parent;
        const prevAbsEndTime = prevSibling._absoluteStartTime + prevSibling._changeDuration;
        if (
          // Check if the previous tween is from a different animation
          tween.parent.id !== prevParent.id && // Check if the animation has loops
          prevParent.iterationCount > 1 && // Check if _absoluteChangeEndTime of last loop overlaps the current tween
          prevAbsEndTime + (prevParent.duration - prevParent.iterationDuration) > tweenAbsStartTime
        ) {
          overrideTween(prevSibling);
          let prevPrevSibling = prevSibling._prevRep;
          while (prevPrevSibling && prevPrevSibling.parent.id === prevParent.id) {
            overrideTween(prevPrevSibling);
            prevPrevSibling = prevPrevSibling._prevRep;
          }
        }
        const absoluteUpdateStartTime = tweenAbsStartTime - tween._delay;
        if (prevAbsEndTime > absoluteUpdateStartTime) {
          const prevChangeStartTime = prevSibling._startTime;
          const prevTLOffset = prevAbsEndTime - (prevChangeStartTime + prevSibling._updateDuration);
          const updatedPrevChangeDuration = round(absoluteUpdateStartTime - prevTLOffset - prevChangeStartTime, 12);
          prevSibling._changeDuration = updatedPrevChangeDuration;
          prevSibling._currentTime = updatedPrevChangeDuration;
          prevSibling._isOverlapped = 1;
          if (updatedPrevChangeDuration < minValue) {
            overrideTween(prevSibling);
          }
        }
        let pausePrevParentAnimation = true;
        forEachChildren(prevParent, (t) => {
          if (!t._isOverlapped) pausePrevParentAnimation = false;
        });
        if (pausePrevParentAnimation) {
          const prevParentTL = prevParent.parent;
          if (prevParentTL) {
            let pausePrevParentTL = true;
            forEachChildren(prevParentTL, (a) => {
              if (a !== prevParent) {
                forEachChildren(a, (t) => {
                  if (!t._isOverlapped) pausePrevParentTL = false;
                });
              }
            });
            if (pausePrevParentTL) {
              prevParentTL.cancel();
            }
          } else {
            prevParent.cancel();
          }
        }
      }
    } else if (tweenCompositionType === compositionTypes.blend) {
      const additiveTweenSiblings = getTweenSiblings(tween.target, tween.property, "_add");
      const additiveAnimation = addAdditiveAnimation(lookups._add);
      let lookupTween = additiveTweenSiblings._head;
      if (!lookupTween) {
        lookupTween = { ...tween };
        lookupTween._composition = compositionTypes.replace;
        lookupTween._updateDuration = minValue;
        lookupTween._startTime = 0;
        lookupTween._numbers = cloneArray(tween._fromNumbers);
        lookupTween._number = 0;
        lookupTween._next = null;
        lookupTween._prev = null;
        addChild(additiveTweenSiblings, lookupTween);
        addChild(additiveAnimation, lookupTween);
      }
      const toNumber = tween._toNumber;
      tween._fromNumber = lookupTween._fromNumber - toNumber;
      tween._toNumber = 0;
      tween._numbers = cloneArray(tween._fromNumbers);
      tween._number = 0;
      lookupTween._fromNumber = toNumber;
      if (tween._toNumbers) {
        const toNumbers = cloneArray(tween._toNumbers);
        if (toNumbers) {
          toNumbers.forEach((value, i) => {
            tween._fromNumbers[i] = lookupTween._fromNumbers[i] - value;
            tween._toNumbers[i] = 0;
          });
        }
        lookupTween._fromNumbers = toNumbers;
      }
      addChild(additiveTweenSiblings, tween, null, "_prevAdd", "_nextAdd");
    }
    return tween;
  };
  var removeTweenSliblings = (tween) => {
    const tweenComposition = tween._composition;
    if (tweenComposition !== compositionTypes.none) {
      const tweenTarget = tween.target;
      const tweenProperty = tween.property;
      const replaceTweensLookup = lookups._rep;
      const replaceTargetProps = replaceTweensLookup.get(tweenTarget);
      const tweenReplaceSiblings = replaceTargetProps[tweenProperty];
      removeChild(tweenReplaceSiblings, tween, "_prevRep", "_nextRep");
      if (tweenComposition === compositionTypes.blend) {
        const addTweensLookup = lookups._add;
        const addTargetProps = addTweensLookup.get(tweenTarget);
        if (!addTargetProps) return;
        const additiveTweenSiblings = addTargetProps[tweenProperty];
        const additiveAnimation = additive.animation;
        removeChild(additiveTweenSiblings, tween, "_prevAdd", "_nextAdd");
        const lookupTween = additiveTweenSiblings._head;
        if (lookupTween && lookupTween === additiveTweenSiblings._tail) {
          removeChild(additiveTweenSiblings, lookupTween, "_prevAdd", "_nextAdd");
          removeChild(additiveAnimation, lookupTween);
          let shouldClean = true;
          for (let prop in addTargetProps) {
            if (addTargetProps[prop]._head) {
              shouldClean = false;
              break;
            }
          }
          if (shouldClean) {
            addTweensLookup.delete(tweenTarget);
          }
        }
      }
    }
    return tween;
  };

  // node_modules/animejs/dist/modules/timer/timer.js
  var resetTimerProperties = (timer) => {
    timer.paused = true;
    timer.began = false;
    timer.completed = false;
    return timer;
  };
  var reviveTimer = (timer) => {
    if (!timer._cancelled) return timer;
    if (timer._hasChildren) {
      forEachChildren(timer, reviveTimer);
    } else {
      forEachChildren(timer, (tween) => {
        if (tween._composition !== compositionTypes.none) {
          composeTween(tween, getTweenSiblings(tween.target, tween.property));
        }
      });
    }
    timer._cancelled = 0;
    return timer;
  };
  var timerId = 0;
  var Timer = class extends Clock {
    /**
     * @param {TimerParams} [parameters]
     * @param {Timeline} [parent]
     * @param {Number} [parentPosition]
     */
    constructor(parameters = {}, parent = null, parentPosition = 0) {
      super(0);
      ++timerId;
      const {
        id,
        delay,
        duration,
        reversed,
        alternate,
        loop,
        loopDelay,
        autoplay,
        frameRate,
        playbackRate,
        onComplete,
        onLoop,
        onPause,
        onBegin,
        onBeforeUpdate,
        onUpdate
      } = parameters;
      if (scope.current) scope.current.register(this);
      const timerInitTime = parent ? 0 : engine._lastTickTime;
      const timerDefaults = parent ? parent.defaults : globals.defaults;
      const timerDelay = (
        /** @type {Number} */
        isFnc(delay) || isUnd(delay) ? timerDefaults.delay : +delay
      );
      const timerDuration = isFnc(duration) || isUnd(duration) ? Infinity : +duration;
      const timerLoop = setValue(loop, timerDefaults.loop);
      const timerLoopDelay = setValue(loopDelay, timerDefaults.loopDelay);
      let timerIterationCount = timerLoop === true || timerLoop === Infinity || /** @type {Number} */
      timerLoop < 0 ? Infinity : (
        /** @type {Number} */
        timerLoop + 1
      );
      if (devTools) {
        const isInfinite = timerIterationCount === Infinity;
        const registered = devTools.register(this, parameters, isInfinite);
        if (registered && isInfinite) {
          const minIterations = alternate ? 2 : 1;
          const iterations = parent ? devTools.maxNestedInfiniteLoops : devTools.maxInfiniteLoops;
          timerIterationCount = Math.max(iterations, minIterations);
        }
      }
      let offsetPosition = 0;
      if (parent) {
        offsetPosition = parentPosition;
      } else {
        if (!engine.reqId) engine.requestTick(now());
        offsetPosition = (engine._lastTickTime - engine._startTime) * globals.timeScale;
      }
      this.id = !isUnd(id) ? id : timerId;
      this.parent = parent;
      this.duration = clampInfinity((timerDuration + timerLoopDelay) * timerIterationCount - timerLoopDelay) || minValue;
      this.backwards = false;
      this.paused = true;
      this.began = false;
      this.completed = false;
      this.onBegin = onBegin || timerDefaults.onBegin;
      this.onBeforeUpdate = onBeforeUpdate || timerDefaults.onBeforeUpdate;
      this.onUpdate = onUpdate || timerDefaults.onUpdate;
      this.onLoop = onLoop || timerDefaults.onLoop;
      this.onPause = onPause || timerDefaults.onPause;
      this.onComplete = onComplete || timerDefaults.onComplete;
      this.iterationDuration = timerDuration;
      this.iterationCount = timerIterationCount;
      this._autoplay = parent ? false : setValue(autoplay, timerDefaults.autoplay);
      this._offset = offsetPosition;
      this._delay = timerDelay;
      this._loopDelay = timerLoopDelay;
      this._iterationTime = 0;
      this._currentIteration = 0;
      this._resolve = noop;
      this._running = false;
      this._reversed = +setValue(reversed, timerDefaults.reversed);
      this._reverse = this._reversed;
      this._cancelled = 0;
      this._alternate = setValue(alternate, timerDefaults.alternate);
      this._prev = null;
      this._next = null;
      this._lastTickTime = timerInitTime;
      this._startTime = timerInitTime;
      this._lastTime = timerInitTime;
      this._fps = setValue(frameRate, timerDefaults.frameRate);
      this._speed = setValue(playbackRate, timerDefaults.playbackRate);
    }
    get cancelled() {
      return !!this._cancelled;
    }
    set cancelled(cancelled) {
      cancelled ? this.cancel() : this.reset(true).play();
    }
    get currentTime() {
      return clamp(round(this._currentTime, globals.precision), -this._delay, this.duration);
    }
    set currentTime(time) {
      const paused = this.paused;
      this.pause().seek(+time);
      if (!paused) this.resume();
    }
    get iterationCurrentTime() {
      return clamp(round(this._iterationTime, globals.precision), 0, this.iterationDuration);
    }
    set iterationCurrentTime(time) {
      this.currentTime = this.iterationDuration * this._currentIteration + time;
    }
    get progress() {
      return clamp(round(this._currentTime / this.duration, 10), 0, 1);
    }
    set progress(progress2) {
      this.currentTime = this.duration * progress2;
    }
    get iterationProgress() {
      return clamp(round(this._iterationTime / this.iterationDuration, 10), 0, 1);
    }
    set iterationProgress(progress2) {
      const iterationDuration = this.iterationDuration;
      this.currentTime = iterationDuration * this._currentIteration + iterationDuration * progress2;
    }
    get currentIteration() {
      return this._currentIteration;
    }
    set currentIteration(iterationCount) {
      this.currentTime = this.iterationDuration * clamp(+iterationCount, 0, this.iterationCount - 1);
    }
    get reversed() {
      return !!this._reversed;
    }
    set reversed(reverse) {
      reverse ? this.reverse() : this.play();
    }
    get speed() {
      return super.speed;
    }
    set speed(playbackRate) {
      super.speed = playbackRate;
      this.resetTime();
    }
    /**
     * @param  {Boolean} [softReset]
     * @return {this}
     */
    reset(softReset = false) {
      reviveTimer(this);
      if (this._reversed && !this._reverse) this.reversed = false;
      this._iterationTime = this.iterationDuration;
      tick(this, 0, 1, ~~softReset, tickModes.FORCE);
      resetTimerProperties(this);
      if (this._hasChildren) {
        forEachChildren(this, resetTimerProperties);
      }
      return this;
    }
    /**
     * @param  {Boolean} internalRender
     * @return {this}
     */
    init(internalRender = false) {
      this.fps = this._fps;
      this.speed = this._speed;
      if (!internalRender && this._hasChildren) {
        tick(this, this.duration, 1, ~~internalRender, tickModes.FORCE);
      }
      this.reset(internalRender);
      const autoplay = this._autoplay;
      if (autoplay === true) {
        this.resume();
      } else if (autoplay && !isUnd(
        /** @type {ScrollObserver} */
        autoplay.linked
      )) {
        autoplay.link(this);
      }
      return this;
    }
    /** @return {this} */
    resetTime() {
      const timeScale = 1 / (this._speed * engine._speed);
      this._startTime = now() - (this._currentTime + this._delay) * timeScale;
      return this;
    }
    /** @return {this} */
    pause() {
      if (this.paused) return this;
      this.paused = true;
      this.onPause(this);
      return this;
    }
    /** @return {this} */
    resume() {
      if (!this.paused) return this;
      this.paused = false;
      if (this.duration <= minValue && !this._hasChildren) {
        tick(this, minValue, 0, 0, tickModes.FORCE);
      } else {
        if (!this._running) {
          addChild(engine, this);
          engine._hasChildren = true;
          this._running = true;
        }
        this.resetTime();
        this._startTime -= 12;
        engine.wake();
      }
      return this;
    }
    /** @return {this} */
    restart() {
      return this.reset().resume();
    }
    /**
     * @param  {Number} time
     * @param  {Boolean|Number} [muteCallbacks]
     * @param  {Boolean|Number} [internalRender]
     * @return {this}
     */
    seek(time, muteCallbacks = 0, internalRender = 0) {
      reviveTimer(this);
      this.completed = false;
      const isPaused = this.paused;
      this.paused = true;
      tick(this, time + this._delay, ~~muteCallbacks, ~~internalRender, tickModes.AUTO);
      return isPaused ? this : this.resume();
    }
    /** @return {this} */
    alternate() {
      const reversed = this._reversed;
      const count = this.iterationCount;
      const duration = this.iterationDuration;
      const iterations = count === Infinity ? floor(maxValue / duration) : count;
      this._reversed = +(this._alternate && !(iterations % 2) ? reversed : !reversed);
      if (count === Infinity) {
        this.iterationProgress = this._reversed ? 1 - this.iterationProgress : this.iterationProgress;
      } else {
        this.seek(duration * iterations - this._currentTime);
      }
      this.resetTime();
      return this;
    }
    /** @return {this} */
    play() {
      if (this._reversed) this.alternate();
      return this.resume();
    }
    /** @return {this} */
    reverse() {
      if (!this._reversed) this.alternate();
      return this.resume();
    }
    // TODO: Move all the animation / tweens / children related code to Animation / Timeline
    /** @return {this} */
    cancel() {
      if (this._hasChildren) {
        forEachChildren(this, (child) => child.cancel(), true);
      } else {
        forEachChildren(this, removeTweenSliblings);
      }
      this._cancelled = 1;
      return this.pause();
    }
    /**
     * @param  {Number} newDuration
     * @return {this}
     */
    stretch(newDuration) {
      const currentDuration = this.duration;
      const normlizedDuration = normalizeTime(newDuration);
      if (currentDuration === normlizedDuration) return this;
      const timeScale = newDuration / currentDuration;
      const isSetter = newDuration <= minValue;
      this.duration = isSetter ? minValue : normlizedDuration;
      this.iterationDuration = isSetter ? minValue : normalizeTime(this.iterationDuration * timeScale);
      this._offset *= timeScale;
      this._delay *= timeScale;
      this._loopDelay *= timeScale;
      return this;
    }
    /**
      * Cancels the timer by seeking it back to 0 and reverting the attached scroller if necessary
      * @return {this}
      */
    revert() {
      tick(this, 0, 1, 0, tickModes.AUTO);
      const ap = (
        /** @type {ScrollObserver} */
        this._autoplay
      );
      if (ap && ap.linked && ap.linked === this) ap.revert();
      return this.cancel();
    }
    /**
      * Imediatly completes the timer, cancels it and triggers the onComplete callback
      * @param  {Boolean|Number} [muteCallbacks]
      * @return {this}
      */
    complete(muteCallbacks = 0) {
      return this.seek(this.duration, muteCallbacks).cancel();
    }
    /**
     * @typedef {this & {then: null}} ResolvedTimer
     */
    /**
     * @param  {Callback<ResolvedTimer>} [callback]
     * @return Promise<this>
     */
    then(callback = noop) {
      const then = this.then;
      const onResolve = () => {
        this.then = null;
        callback(
          /** @type {ResolvedTimer} */
          this
        );
        this.then = then;
        this._resolve = noop;
      };
      return new Promise((r) => {
        this._resolve = () => r(onResolve());
        if (this.completed) this._resolve();
        return this;
      });
    }
  };

  // node_modules/animejs/dist/modules/core/targets.js
  function getNodeList(v) {
    const n = isStr(v) ? scope.root.querySelectorAll(v) : v;
    if (n instanceof NodeList || n instanceof HTMLCollection) return n;
  }
  function parseTargets(targets) {
    if (isNil(targets)) return (
      /** @type {TargetsArray} */
      []
    );
    if (!isBrowser) return (
      /** @type {JSTargetsArray} */
      isArr(targets) && targets.flat(Infinity) || [targets]
    );
    if (isArr(targets)) {
      const flattened = targets.flat(Infinity);
      const parsed = [];
      for (let i = 0, l = flattened.length; i < l; i++) {
        const item = flattened[i];
        if (!isNil(item)) {
          const nodeList2 = getNodeList(item);
          if (nodeList2) {
            for (let j = 0, jl = nodeList2.length; j < jl; j++) {
              const subItem = nodeList2[j];
              if (!isNil(subItem)) {
                let isDuplicate = false;
                for (let k = 0, kl = parsed.length; k < kl; k++) {
                  if (parsed[k] === subItem) {
                    isDuplicate = true;
                    break;
                  }
                }
                if (!isDuplicate) {
                  parsed.push(subItem);
                }
              }
            }
          } else {
            let isDuplicate = false;
            for (let j = 0, jl = parsed.length; j < jl; j++) {
              if (parsed[j] === item) {
                isDuplicate = true;
                break;
              }
            }
            if (!isDuplicate) {
              parsed.push(item);
            }
          }
        }
      }
      return parsed;
    }
    const nodeList = getNodeList(targets);
    if (nodeList) return (
      /** @type {DOMTargetsArray} */
      Array.from(nodeList)
    );
    return (
      /** @type {TargetsArray} */
      [targets]
    );
  }
  function registerTargets(targets) {
    const parsedTargetsArray = parseTargets(targets);
    const parsedTargetsLength = parsedTargetsArray.length;
    if (parsedTargetsLength) {
      for (let i = 0; i < parsedTargetsLength; i++) {
        const target = parsedTargetsArray[i];
        if (!target[isRegisteredTargetSymbol]) {
          target[isRegisteredTargetSymbol] = true;
          const isSvgType = isSvg(target);
          const isDom = (
            /** @type {DOMTarget} */
            target.nodeType || isSvgType
          );
          if (isDom) {
            target[isDomSymbol] = true;
            target[isSvgSymbol] = isSvgType;
            target[transformsSymbol] = {};
          }
        }
      }
    }
    return parsedTargetsArray;
  }

  // node_modules/animejs/dist/modules/core/units.js
  var angleUnitsMap = { "deg": 1, "rad": 180 / PI, "turn": 360 };
  var convertedValuesCache = {};
  var convertValueUnit = (el, decomposedValue, unit, force = false) => {
    const currentUnit = decomposedValue.u;
    const currentNumber = decomposedValue.n;
    if (decomposedValue.t === valueTypes.UNIT && currentUnit === unit) {
      return decomposedValue;
    }
    const cachedKey = currentNumber + currentUnit + unit;
    const cached = convertedValuesCache[cachedKey];
    if (!isUnd(cached) && !force) {
      decomposedValue.n = cached;
    } else {
      let convertedValue;
      if (currentUnit in angleUnitsMap) {
        convertedValue = currentNumber * angleUnitsMap[currentUnit] / angleUnitsMap[unit];
      } else {
        const baseline = 100;
        const tempEl = (
          /** @type {DOMTarget} */
          el.cloneNode()
        );
        const parentNode = el.parentNode;
        const parentEl = parentNode && parentNode !== doc ? parentNode : doc.body;
        parentEl.appendChild(tempEl);
        const elStyle = tempEl.style;
        elStyle.width = baseline + currentUnit;
        const currentUnitWidth = (
          /** @type {HTMLElement} */
          tempEl.offsetWidth || baseline
        );
        elStyle.width = baseline + unit;
        const newUnitWidth = (
          /** @type {HTMLElement} */
          tempEl.offsetWidth || baseline
        );
        const factor = currentUnitWidth / newUnitWidth;
        parentEl.removeChild(tempEl);
        convertedValue = factor * currentNumber;
      }
      decomposedValue.n = convertedValue;
      convertedValuesCache[cachedKey] = convertedValue;
    }
    decomposedValue.t === valueTypes.UNIT;
    decomposedValue.u = unit;
    return decomposedValue;
  };

  // node_modules/animejs/dist/modules/easings/none.js
  var none = (t) => t;

  // node_modules/animejs/dist/modules/easings/eases/parser.js
  var easeInPower = (p = 1.68) => (t) => pow(t, +p);
  var easeTypes = {
    in: (easeIn) => (t) => easeIn(t),
    out: (easeIn) => (t) => 1 - easeIn(1 - t),
    inOut: (easeIn) => (t) => t < 0.5 ? easeIn(t * 2) / 2 : 1 - easeIn(t * -2 + 2) / 2,
    outIn: (easeIn) => (t) => t < 0.5 ? (1 - easeIn(1 - t * 2)) / 2 : (easeIn(t * 2 - 1) + 1) / 2
  };
  var halfPI = PI / 2;
  var doublePI = PI * 2;
  var easeInFunctions = {
    [emptyString]: easeInPower,
    Quad: easeInPower(2),
    Cubic: easeInPower(3),
    Quart: easeInPower(4),
    Quint: easeInPower(5),
    /** @type {EasingFunction} */
    Sine: (t) => 1 - cos(t * halfPI),
    /** @type {EasingFunction} */
    Circ: (t) => 1 - sqrt(1 - t * t),
    /** @type {EasingFunction} */
    Expo: (t) => t ? pow(2, 10 * t - 10) : 0,
    /** @type {EasingFunction} */
    Bounce: (t) => {
      let pow2, b = 4;
      while (t < ((pow2 = pow(2, --b)) - 1) / 11) ;
      return 1 / pow(4, 3 - b) - 7.5625 * pow((pow2 * 3 - 2) / 22 - t, 2);
    },
    /** @type {BackEasing} */
    Back: (overshoot = 1.7) => (t) => (+overshoot + 1) * t * t * t - +overshoot * t * t,
    /** @type {ElasticEasing} */
    Elastic: (amplitude = 1, period = 0.3) => {
      const a = clamp(+amplitude, 1, 10);
      const p = clamp(+period, minValue, 2);
      const s = p / doublePI * asin(1 / a);
      const e = doublePI / p;
      return (t) => t === 0 || t === 1 ? t : -a * pow(2, -10 * (1 - t)) * sin((1 - t - s) * e);
    }
  };
  var eases = /* @__PURE__ */ (() => {
    const list = { linear: none, none };
    for (let type in easeTypes) {
      for (let name in easeInFunctions) {
        const easeIn = easeInFunctions[name];
        const easeType = easeTypes[type];
        list[type + name] = /** @type {EasingFunctionWithParams|EasingFunction} */
        name === emptyString || name === "Back" || name === "Elastic" ? (a, b) => easeType(
          /** @type {EasingFunctionWithParams} */
          easeIn(a, b)
        ) : easeType(
          /** @type {EasingFunction} */
          easeIn
        );
      }
    }
    return (
      /** @type {EasesFunctions} */
      list
    );
  })();
  var easesLookups = { linear: none, none };
  var parseEaseString = (string) => {
    if (easesLookups[string]) return easesLookups[string];
    if (string.indexOf("(") <= -1) {
      const hasParams = easeTypes[string] || string.includes("Back") || string.includes("Elastic");
      const parsedFn = (
        /** @type {EasingFunction} */
        hasParams ? (
          /** @type {EasingFunctionWithParams} */
          eases[string]()
        ) : eases[string]
      );
      return parsedFn ? easesLookups[string] = parsedFn : none;
    } else {
      const split2 = string.slice(0, -1).split("(");
      const parsedFn = (
        /** @type {EasingFunctionWithParams} */
        eases[split2[0]]
      );
      return parsedFn ? easesLookups[string] = parsedFn(...split2[1].split(",")) : none;
    }
  };
  var deprecated = ["steps(", "irregular(", "linear(", "cubicBezier("];
  var parseEase = (ease) => {
    if (isStr(ease)) {
      for (let i = 0, l = deprecated.length; i < l; i++) {
        if (stringStartsWith(ease, deprecated[i])) {
          console.warn(`String syntax for \`ease: "${ease}"\` has been removed from the core and replaced by importing and passing the easing function directly: \`ease: ${ease}\``);
          return none;
        }
      }
    }
    const easeFunc = isFnc(ease) ? ease : isStr(ease) ? parseEaseString(
      /** @type {String} */
      ease
    ) : none;
    return easeFunc;
  };

  // node_modules/animejs/dist/modules/animation/animation.js
  var fromTargetObject = createDecomposedValueTargetObject();
  var toTargetObject = createDecomposedValueTargetObject();
  var inlineStylesStore = {};
  var toFunctionStore = { func: null };
  var fromFunctionStore = { func: null };
  var keyframesTargetArray = [null];
  var fastSetValuesArray = [null, null];
  var keyObjectTarget = { to: null };
  var tweenId = 0;
  var JSAnimationId = 0;
  var keyframes;
  var key;
  var generateKeyframes = (keyframes2, parameters) => {
    const properties = {};
    if (isArr(keyframes2)) {
      const propertyNames = [].concat(.../** @type {DurationKeyframes} */
      keyframes2.map((key2) => Object.keys(key2))).filter(isKey);
      for (let i = 0, l = propertyNames.length; i < l; i++) {
        const propName = propertyNames[i];
        const propArray = (
          /** @type {DurationKeyframes} */
          keyframes2.map((key2) => {
            const newKey = {};
            for (let p in key2) {
              const keyValue = (
                /** @type {TweenPropValue} */
                key2[p]
              );
              if (isKey(p)) {
                if (p === propName) {
                  newKey.to = keyValue;
                }
              } else {
                newKey[p] = keyValue;
              }
            }
            return newKey;
          })
        );
        properties[propName] = /** @type {ArraySyntaxValue} */
        propArray;
      }
    } else {
      const totalDuration = (
        /** @type {Number} */
        setValue(parameters.duration, globals.defaults.duration)
      );
      const keys2 = Object.keys(keyframes2).map((key2) => {
        return { o: parseFloat(key2) / 100, p: keyframes2[key2] };
      }).sort((a, b) => a.o - b.o);
      keys2.forEach((key2) => {
        const offset = key2.o;
        const prop = key2.p;
        for (let name in prop) {
          if (isKey(name)) {
            let propArray = (
              /** @type {Array} */
              properties[name]
            );
            if (!propArray) propArray = properties[name] = [];
            const duration = offset * totalDuration;
            let length = propArray.length;
            let prevKey = propArray[length - 1];
            const keyObj = { to: prop[name] };
            let durProgress = 0;
            for (let i = 0; i < length; i++) {
              durProgress += propArray[i].duration;
            }
            if (length === 1) {
              keyObj.from = prevKey.to;
            }
            if (prop.ease) {
              keyObj.ease = prop.ease;
            }
            keyObj.duration = duration - (length ? durProgress : 0);
            propArray.push(keyObj);
          }
        }
        return key2;
      });
      for (let name in properties) {
        const propArray = (
          /** @type {Array} */
          properties[name]
        );
        let prevEase;
        for (let i = 0, l = propArray.length; i < l; i++) {
          const prop = propArray[i];
          const currentEase = prop.ease;
          prop.ease = prevEase ? prevEase : void 0;
          prevEase = currentEase;
        }
        if (!propArray[0].duration) {
          propArray.shift();
        }
      }
    }
    return properties;
  };
  var JSAnimation = class extends Timer {
    /**
     * @param {TargetsParam} targets
     * @param {AnimationParams} parameters
     * @param {Timeline} [parent]
     * @param {Number} [parentPosition]
     * @param {Boolean} [fastSet=false]
     * @param {Number} [index=0]
     * @param {Number} [length=0]
     */
    constructor(targets, parameters, parent, parentPosition, fastSet = false, index = 0, length = 0) {
      super(
        /** @type {TimerParams & AnimationParams} */
        parameters,
        parent,
        parentPosition
      );
      ++JSAnimationId;
      const parsedTargets = registerTargets(targets);
      const targetsLength = parsedTargets.length;
      const kfParams = (
        /** @type {AnimationParams} */
        parameters.keyframes
      );
      const params = (
        /** @type {AnimationParams} */
        kfParams ? mergeObjects(generateKeyframes(
          /** @type {DurationKeyframes} */
          kfParams,
          parameters
        ), parameters) : parameters
      );
      const {
        id,
        delay,
        duration,
        ease,
        playbackEase,
        modifier,
        composition,
        onRender
      } = params;
      const animDefaults = parent ? parent.defaults : globals.defaults;
      const animEase = setValue(ease, animDefaults.ease);
      const animPlaybackEase = setValue(playbackEase, animDefaults.playbackEase);
      const parsedAnimPlaybackEase = animPlaybackEase ? parseEase(animPlaybackEase) : null;
      const hasSpring = !isUnd(
        /** @type {Spring} */
        animEase.ease
      );
      const tEasing = hasSpring ? (
        /** @type {Spring} */
        animEase.ease
      ) : setValue(ease, parsedAnimPlaybackEase ? "linear" : animDefaults.ease);
      const tDuration = hasSpring ? (
        /** @type {Spring} */
        animEase.settlingDuration
      ) : setValue(duration, animDefaults.duration);
      const tDelay = setValue(delay, animDefaults.delay);
      const tModifier = modifier || animDefaults.modifier;
      const tComposition = isUnd(composition) && targetsLength >= K ? compositionTypes.none : !isUnd(composition) ? composition : animDefaults.composition;
      const absoluteOffsetTime = this._offset + (parent ? parent._offset : 0);
      if (hasSpring) animEase.parent = this;
      let iterationDuration = NaN;
      let iterationDelay = NaN;
      let animationAnimationLength = 0;
      let shouldTriggerRender = 0;
      for (let targetIndex = 0; targetIndex < targetsLength; targetIndex++) {
        const target = parsedTargets[targetIndex];
        const ti = index || targetIndex;
        const tl = length || targetsLength;
        let lastTransformGroupIndex = NaN;
        let lastTransformGroupLength = NaN;
        for (let p in params) {
          if (isKey(p)) {
            const tweenType = getTweenType(target, p);
            const propName = sanitizePropertyName(p, target, tweenType);
            let propValue = params[p];
            const isPropValueArray = isArr(propValue);
            if (fastSet && !isPropValueArray) {
              fastSetValuesArray[0] = propValue;
              fastSetValuesArray[1] = propValue;
              propValue = fastSetValuesArray;
            }
            if (isPropValueArray) {
              const arrayLength = (
                /** @type {Array} */
                propValue.length
              );
              const isNotObjectValue = !isObj(propValue[0]);
              if (arrayLength === 2 && isNotObjectValue) {
                keyObjectTarget.to = /** @type {TweenParamValue} */
                /** @type {unknown} */
                propValue;
                keyframesTargetArray[0] = keyObjectTarget;
                keyframes = keyframesTargetArray;
              } else if (arrayLength > 2 && isNotObjectValue) {
                keyframes = [];
                propValue.forEach((v, i) => {
                  if (!i) {
                    fastSetValuesArray[0] = v;
                  } else if (i === 1) {
                    fastSetValuesArray[1] = v;
                    keyframes.push(fastSetValuesArray);
                  } else {
                    keyframes.push(v);
                  }
                });
              } else {
                keyframes = /** @type {Array.<TweenKeyValue>} */
                propValue;
              }
            } else {
              keyframesTargetArray[0] = propValue;
              keyframes = keyframesTargetArray;
            }
            let siblings = null;
            let prevTween = null;
            let firstTweenChangeStartTime = NaN;
            let lastTweenChangeEndTime = 0;
            let tweenIndex = 0;
            for (let l = keyframes.length; tweenIndex < l; tweenIndex++) {
              const keyframe = keyframes[tweenIndex];
              if (isObj(keyframe)) {
                key = keyframe;
              } else {
                keyObjectTarget.to = /** @type {TweenParamValue} */
                keyframe;
                key = keyObjectTarget;
              }
              toFunctionStore.func = null;
              fromFunctionStore.func = null;
              const computedToValue = getFunctionValue(key.to, target, ti, tl, toFunctionStore);
              let tweenToValue;
              if (isObj(computedToValue) && !isUnd(computedToValue.to)) {
                key = computedToValue;
                tweenToValue = computedToValue.to;
              } else {
                tweenToValue = computedToValue;
              }
              const tweenFromValue = getFunctionValue(key.from, target, ti, tl);
              const easeToParse = key.ease || tEasing;
              const easeFunctionResult = getFunctionValue(easeToParse, target, ti, tl);
              const keyEasing = isFnc(easeFunctionResult) || isStr(easeFunctionResult) ? easeFunctionResult : easeToParse;
              const hasSpring2 = !isUnd(keyEasing) && !isUnd(
                /** @type {Spring} */
                keyEasing.ease
              );
              const tweenEasing = hasSpring2 ? (
                /** @type {Spring} */
                keyEasing.ease
              ) : keyEasing;
              const tweenDuration = hasSpring2 ? (
                /** @type {Spring} */
                keyEasing.settlingDuration
              ) : getFunctionValue(setValue(key.duration, l > 1 ? getFunctionValue(tDuration, target, ti, tl) / l : tDuration), target, ti, tl);
              const tweenDelay = getFunctionValue(setValue(key.delay, !tweenIndex ? tDelay : 0), target, ti, tl);
              const computedComposition = getFunctionValue(setValue(key.composition, tComposition), target, ti, tl);
              const tweenComposition = isNum(computedComposition) ? computedComposition : compositionTypes[computedComposition];
              const tweenModifier = key.modifier || tModifier;
              const hasFromvalue = !isUnd(tweenFromValue);
              const hasToValue = !isUnd(tweenToValue);
              const isFromToArray = isArr(tweenToValue);
              const isFromToValue = isFromToArray || hasFromvalue && hasToValue;
              const tweenStartTime = prevTween ? lastTweenChangeEndTime + tweenDelay : tweenDelay;
              const absoluteStartTime = round(absoluteOffsetTime + tweenStartTime, 12);
              if (!shouldTriggerRender && (hasFromvalue || isFromToArray)) shouldTriggerRender = 1;
              let prevSibling = prevTween;
              if (tweenComposition !== compositionTypes.none) {
                if (!siblings) siblings = getTweenSiblings(target, propName);
                let nextSibling = siblings._head;
                while (nextSibling && !nextSibling._isOverridden && nextSibling._absoluteStartTime <= absoluteStartTime) {
                  prevSibling = nextSibling;
                  nextSibling = nextSibling._nextRep;
                  if (nextSibling && nextSibling._absoluteStartTime >= absoluteStartTime) {
                    while (nextSibling) {
                      overrideTween(nextSibling);
                      nextSibling = nextSibling._nextRep;
                    }
                  }
                }
              }
              if (isFromToValue) {
                decomposeRawValue(isFromToArray ? getFunctionValue(tweenToValue[0], target, ti, tl, fromFunctionStore) : tweenFromValue, fromTargetObject);
                decomposeRawValue(isFromToArray ? getFunctionValue(tweenToValue[1], target, ti, tl, toFunctionStore) : tweenToValue, toTargetObject);
                const originalValue = getOriginalAnimatableValue(target, propName, tweenType, inlineStylesStore);
                if (fromTargetObject.t === valueTypes.NUMBER) {
                  if (prevSibling) {
                    if (prevSibling._valueType === valueTypes.UNIT) {
                      fromTargetObject.t = valueTypes.UNIT;
                      fromTargetObject.u = prevSibling._unit;
                    }
                  } else {
                    decomposeRawValue(
                      originalValue,
                      decomposedOriginalValue
                    );
                    if (decomposedOriginalValue.t === valueTypes.UNIT) {
                      fromTargetObject.t = valueTypes.UNIT;
                      fromTargetObject.u = decomposedOriginalValue.u;
                    }
                  }
                }
              } else {
                if (hasToValue) {
                  decomposeRawValue(tweenToValue, toTargetObject);
                } else {
                  if (prevTween) {
                    decomposeTweenValue(prevTween, toTargetObject);
                  } else {
                    decomposeRawValue(parent && prevSibling && prevSibling.parent.parent === parent ? prevSibling._value : getOriginalAnimatableValue(target, propName, tweenType, inlineStylesStore), toTargetObject);
                  }
                }
                if (hasFromvalue) {
                  decomposeRawValue(tweenFromValue, fromTargetObject);
                } else {
                  if (prevTween) {
                    decomposeTweenValue(prevTween, fromTargetObject);
                  } else {
                    decomposeRawValue(parent && prevSibling && prevSibling.parent.parent === parent ? prevSibling._value : (
                      // No need to get and parse the original value if the tween is part of a timeline and has a previous sibling part of the same timeline
                      getOriginalAnimatableValue(target, propName, tweenType, inlineStylesStore)
                    ), fromTargetObject);
                  }
                }
              }
              if (fromTargetObject.o) {
                fromTargetObject.n = getRelativeValue(
                  !prevSibling ? decomposeRawValue(
                    getOriginalAnimatableValue(target, propName, tweenType, inlineStylesStore),
                    decomposedOriginalValue
                  ).n : prevSibling._toNumber,
                  fromTargetObject.n,
                  fromTargetObject.o
                );
              }
              if (toTargetObject.o) {
                toTargetObject.n = getRelativeValue(fromTargetObject.n, toTargetObject.n, toTargetObject.o);
              }
              if (fromTargetObject.t !== toTargetObject.t) {
                if (fromTargetObject.t === valueTypes.COMPLEX || toTargetObject.t === valueTypes.COMPLEX) {
                  const complexValue = fromTargetObject.t === valueTypes.COMPLEX ? fromTargetObject : toTargetObject;
                  const notComplexValue = fromTargetObject.t === valueTypes.COMPLEX ? toTargetObject : fromTargetObject;
                  notComplexValue.t = valueTypes.COMPLEX;
                  notComplexValue.s = cloneArray(complexValue.s);
                  notComplexValue.d = complexValue.d.map(() => notComplexValue.n);
                } else if (fromTargetObject.t === valueTypes.UNIT || toTargetObject.t === valueTypes.UNIT) {
                  const unitValue = fromTargetObject.t === valueTypes.UNIT ? fromTargetObject : toTargetObject;
                  const notUnitValue = fromTargetObject.t === valueTypes.UNIT ? toTargetObject : fromTargetObject;
                  notUnitValue.t = valueTypes.UNIT;
                  notUnitValue.u = unitValue.u;
                } else if (fromTargetObject.t === valueTypes.COLOR || toTargetObject.t === valueTypes.COLOR) {
                  const colorValue = fromTargetObject.t === valueTypes.COLOR ? fromTargetObject : toTargetObject;
                  const notColorValue = fromTargetObject.t === valueTypes.COLOR ? toTargetObject : fromTargetObject;
                  notColorValue.t = valueTypes.COLOR;
                  notColorValue.s = colorValue.s;
                  notColorValue.d = [0, 0, 0, 1];
                }
              }
              if (fromTargetObject.u !== toTargetObject.u) {
                let valueToConvert = toTargetObject.u ? fromTargetObject : toTargetObject;
                valueToConvert = convertValueUnit(
                  /** @type {DOMTarget} */
                  target,
                  valueToConvert,
                  toTargetObject.u ? toTargetObject.u : fromTargetObject.u,
                  false
                );
              }
              if (toTargetObject.d && fromTargetObject.d && toTargetObject.d.length !== fromTargetObject.d.length) {
                const longestValue = fromTargetObject.d.length > toTargetObject.d.length ? fromTargetObject : toTargetObject;
                const shortestValue = longestValue === fromTargetObject ? toTargetObject : fromTargetObject;
                shortestValue.d = longestValue.d.map((_, i) => isUnd(shortestValue.d[i]) ? 0 : shortestValue.d[i]);
                shortestValue.s = cloneArray(longestValue.s);
              }
              const tweenUpdateDuration = round(+tweenDuration || minValue, 12);
              let inlineValue = inlineStylesStore[propName];
              if (!isNil(inlineValue)) inlineStylesStore[propName] = null;
              const tween = {
                parent: this,
                id: tweenId++,
                property: propName,
                target,
                _value: null,
                _toFunc: toFunctionStore.func,
                _fromFunc: fromFunctionStore.func,
                _ease: parseEase(tweenEasing),
                _fromNumbers: cloneArray(fromTargetObject.d),
                _toNumbers: cloneArray(toTargetObject.d),
                _strings: cloneArray(toTargetObject.s),
                _fromNumber: fromTargetObject.n,
                _toNumber: toTargetObject.n,
                _numbers: cloneArray(fromTargetObject.d),
                // For additive tween and animatables
                _number: fromTargetObject.n,
                // For additive tween and animatables
                _unit: toTargetObject.u,
                _modifier: tweenModifier,
                _currentTime: 0,
                _startTime: tweenStartTime,
                _delay: +tweenDelay,
                _updateDuration: tweenUpdateDuration,
                _changeDuration: tweenUpdateDuration,
                _absoluteStartTime: absoluteStartTime,
                // NOTE: Investigate bit packing to stores ENUM / BOOL
                _tweenType: tweenType,
                _valueType: toTargetObject.t,
                _composition: tweenComposition,
                _isOverlapped: 0,
                _isOverridden: 0,
                _renderTransforms: 0,
                _inlineValue: inlineValue,
                _prevRep: null,
                // For replaced tween
                _nextRep: null,
                // For replaced tween
                _prevAdd: null,
                // For additive tween
                _nextAdd: null,
                // For additive tween
                _prev: null,
                _next: null
              };
              if (tweenComposition !== compositionTypes.none) {
                composeTween(tween, siblings);
              }
              if (isNaN(firstTweenChangeStartTime)) {
                firstTweenChangeStartTime = tween._startTime;
              }
              lastTweenChangeEndTime = round(tweenStartTime + tweenUpdateDuration, 12);
              prevTween = tween;
              animationAnimationLength++;
              addChild(this, tween);
            }
            if (isNaN(iterationDelay) || firstTweenChangeStartTime < iterationDelay) {
              iterationDelay = firstTweenChangeStartTime;
            }
            if (isNaN(iterationDuration) || lastTweenChangeEndTime > iterationDuration) {
              iterationDuration = lastTweenChangeEndTime;
            }
            if (tweenType === tweenTypes.TRANSFORM) {
              lastTransformGroupIndex = animationAnimationLength - tweenIndex;
              lastTransformGroupLength = animationAnimationLength;
            }
          }
        }
        if (!isNaN(lastTransformGroupIndex)) {
          let i = 0;
          forEachChildren(this, (tween) => {
            if (i >= lastTransformGroupIndex && i < lastTransformGroupLength) {
              tween._renderTransforms = 1;
              if (tween._composition === compositionTypes.blend) {
                forEachChildren(additive.animation, (additiveTween) => {
                  if (additiveTween.id === tween.id) {
                    additiveTween._renderTransforms = 1;
                  }
                });
              }
            }
            i++;
          });
        }
      }
      if (!targetsLength) {
        console.warn(`No target found. Make sure the element you're trying to animate is accessible before creating your animation.`);
      }
      if (iterationDelay) {
        forEachChildren(this, (tween) => {
          if (!(tween._startTime - tween._delay)) {
            tween._delay -= iterationDelay;
          }
          tween._startTime -= iterationDelay;
        });
        iterationDuration -= iterationDelay;
      } else {
        iterationDelay = 0;
      }
      if (!iterationDuration) {
        iterationDuration = minValue;
        this.iterationCount = 0;
      }
      this.targets = parsedTargets;
      this.id = !isUnd(id) ? id : JSAnimationId;
      this.duration = iterationDuration === minValue ? minValue : clampInfinity((iterationDuration + this._loopDelay) * this.iterationCount - this._loopDelay) || minValue;
      this.onRender = onRender || animDefaults.onRender;
      this._ease = parsedAnimPlaybackEase;
      this._delay = iterationDelay;
      this.iterationDuration = iterationDuration;
      if (!this._autoplay && shouldTriggerRender) this.onRender(this);
    }
    /**
     * @param  {Number} newDuration
     * @return {this}
     */
    stretch(newDuration) {
      const currentDuration = this.duration;
      if (currentDuration === normalizeTime(newDuration)) return this;
      const timeScale = newDuration / currentDuration;
      forEachChildren(this, (tween) => {
        tween._updateDuration = normalizeTime(tween._updateDuration * timeScale);
        tween._changeDuration = normalizeTime(tween._changeDuration * timeScale);
        tween._currentTime *= timeScale;
        tween._startTime *= timeScale;
        tween._absoluteStartTime *= timeScale;
      });
      return super.stretch(newDuration);
    }
    /**
     * @return {this}
     */
    refresh() {
      forEachChildren(this, (tween) => {
        const toFunc = tween._toFunc;
        const fromFunc = tween._fromFunc;
        if (toFunc || fromFunc) {
          if (fromFunc) {
            decomposeRawValue(fromFunc(), fromTargetObject);
            if (fromTargetObject.u !== tween._unit && tween.target[isDomSymbol]) {
              convertValueUnit(
                /** @type {DOMTarget} */
                tween.target,
                fromTargetObject,
                tween._unit,
                true
              );
            }
            tween._fromNumbers = cloneArray(fromTargetObject.d);
            tween._fromNumber = fromTargetObject.n;
          } else if (toFunc) {
            decomposeRawValue(getOriginalAnimatableValue(tween.target, tween.property, tween._tweenType), decomposedOriginalValue);
            tween._fromNumbers = cloneArray(decomposedOriginalValue.d);
            tween._fromNumber = decomposedOriginalValue.n;
          }
          if (toFunc) {
            decomposeRawValue(toFunc(), toTargetObject);
            tween._toNumbers = cloneArray(toTargetObject.d);
            tween._strings = cloneArray(toTargetObject.s);
            tween._toNumber = toTargetObject.o ? getRelativeValue(tween._fromNumber, toTargetObject.n, toTargetObject.o) : toTargetObject.n;
          }
        }
      });
      if (this.duration === minValue) this.restart();
      return this;
    }
    /**
     * Cancel the animation and revert all the values affected by this animation to their original state
     * @return {this}
     */
    revert() {
      super.revert();
      return cleanInlineStyles(this);
    }
    /**
     * @typedef {this & {then: null}} ResolvedJSAnimation
     */
    /**
     * @param  {Callback<ResolvedJSAnimation>} [callback]
     * @return Promise<this>
     */
    then(callback) {
      return super.then(callback);
    }
  };
  var animate = (targets, parameters) => new JSAnimation(targets, parameters, null, 0, false).init();

  // node_modules/animejs/dist/modules/timeline/position.js
  var getPrevChildOffset = (timeline2, timePosition) => {
    if (stringStartsWith(timePosition, "<")) {
      const goToPrevAnimationOffset = timePosition[1] === "<";
      const prevAnimation = (
        /** @type {Tickable} */
        timeline2._tail
      );
      const prevOffset = prevAnimation ? prevAnimation._offset + prevAnimation._delay : 0;
      return goToPrevAnimationOffset ? prevOffset : prevOffset + prevAnimation.duration;
    }
  };
  var parseTimelinePosition = (timeline2, timePosition) => {
    let tlDuration = timeline2.iterationDuration;
    if (tlDuration === minValue) tlDuration = 0;
    if (isUnd(timePosition)) return tlDuration;
    if (isNum(+timePosition)) return +timePosition;
    const timePosStr = (
      /** @type {String} */
      timePosition
    );
    const tlLabels = timeline2 ? timeline2.labels : null;
    const hasLabels = !isNil(tlLabels);
    const prevOffset = getPrevChildOffset(timeline2, timePosStr);
    const hasSibling = !isUnd(prevOffset);
    const matchedRelativeOperator = relativeValuesExecRgx.exec(timePosStr);
    if (matchedRelativeOperator) {
      const fullOperator = matchedRelativeOperator[0];
      const split2 = timePosStr.split(fullOperator);
      const labelOffset = hasLabels && split2[0] ? tlLabels[split2[0]] : tlDuration;
      const parsedOffset = hasSibling ? prevOffset : hasLabels ? labelOffset : tlDuration;
      const parsedNumericalOffset = +split2[1];
      return getRelativeValue(parsedOffset, parsedNumericalOffset, fullOperator[0]);
    } else {
      return hasSibling ? prevOffset : hasLabels ? !isUnd(tlLabels[timePosStr]) ? tlLabels[timePosStr] : tlDuration : tlDuration;
    }
  };

  // node_modules/animejs/dist/modules/utils/time.js
  var keepTime = (constructor) => {
    let tracked;
    return (...args) => {
      let currentIteration, currentIterationProgress, reversed, alternate;
      if (tracked) {
        currentIteration = tracked.currentIteration;
        currentIterationProgress = tracked.iterationProgress;
        reversed = tracked.reversed;
        alternate = tracked._alternate;
        tracked.revert();
      }
      const cleanup = constructor(...args);
      if (cleanup && !isFnc(cleanup) && cleanup.revert) tracked = cleanup;
      if (!isUnd(currentIterationProgress)) {
        tracked.currentIteration = currentIteration;
        tracked.iterationProgress = (alternate ? !(currentIteration % 2) ? reversed : !reversed : reversed) ? 1 - currentIterationProgress : currentIterationProgress;
      }
      return cleanup || noop;
    };
  };

  // node_modules/animejs/dist/modules/utils/random.js
  var random = (min = 0, max2 = 1, decimalLength = 0) => {
    const m = 10 ** decimalLength;
    return Math.floor((Math.random() * (max2 - min + 1 / m) + min) * m) / m;
  };
  var shuffle = (items) => {
    let m = items.length, t, i;
    while (m) {
      i = random(0, --m);
      t = items[m];
      items[m] = items[i];
      items[i] = t;
    }
    return items;
  };

  // node_modules/animejs/dist/modules/utils/stagger.js
  var stagger = (val, params = {}) => {
    let values = [];
    let maxValue2 = 0;
    const from = params.from;
    const reversed = params.reversed;
    const ease = params.ease;
    const hasEasing = !isUnd(ease);
    const hasSpring = hasEasing && !isUnd(
      /** @type {Spring} */
      ease.ease
    );
    const staggerEase = hasSpring ? (
      /** @type {Spring} */
      ease.ease
    ) : hasEasing ? parseEase(ease) : null;
    const grid = params.grid;
    const axis = params.axis;
    const customTotal = params.total;
    const fromFirst = isUnd(from) || from === 0 || from === "first";
    const fromCenter = from === "center";
    const fromLast = from === "last";
    const fromRandom = from === "random";
    const isRange = isArr(val);
    const useProp = params.use;
    const val1 = isRange ? parseNumber(val[0]) : parseNumber(val);
    const val2 = isRange ? parseNumber(val[1]) : 0;
    const unitMatch = unitsExecRgx.exec((isRange ? val[1] : val) + emptyString);
    const start = params.start || 0 + (isRange ? val1 : 0);
    let fromIndex = fromFirst ? 0 : isNum(from) ? from : 0;
    return (target, i, t, tl) => {
      const [registeredTarget] = registerTargets(target);
      const total = isUnd(customTotal) ? t : customTotal;
      const customIndex = !isUnd(useProp) ? isFnc(useProp) ? useProp(registeredTarget, i, total) : getOriginalAnimatableValue(registeredTarget, useProp) : false;
      const staggerIndex = isNum(customIndex) || isStr(customIndex) && isNum(+customIndex) ? +customIndex : i;
      if (fromCenter) fromIndex = (total - 1) / 2;
      if (fromLast) fromIndex = total - 1;
      if (!values.length) {
        for (let index = 0; index < total; index++) {
          if (!grid) {
            values.push(abs(fromIndex - index));
          } else {
            const fromX = !fromCenter ? fromIndex % grid[0] : (grid[0] - 1) / 2;
            const fromY = !fromCenter ? floor(fromIndex / grid[0]) : (grid[1] - 1) / 2;
            const toX = index % grid[0];
            const toY = floor(index / grid[0]);
            const distanceX = fromX - toX;
            const distanceY = fromY - toY;
            let value = sqrt(distanceX * distanceX + distanceY * distanceY);
            if (axis === "x") value = -distanceX;
            if (axis === "y") value = -distanceY;
            values.push(value);
          }
          maxValue2 = max(...values);
        }
        if (staggerEase) values = values.map((val3) => staggerEase(val3 / maxValue2) * maxValue2);
        if (reversed) values = values.map((val3) => axis ? val3 < 0 ? val3 * -1 : -val3 : abs(maxValue2 - val3));
        if (fromRandom) values = shuffle(values);
      }
      const spacing = isRange ? (val2 - val1) / maxValue2 : val1;
      const offset = tl ? parseTimelinePosition(tl, isUnd(params.start) ? tl.iterationDuration : start) : (
        /** @type {Number} */
        start
      );
      let output = offset + (spacing * round(values[staggerIndex], 2) || 0);
      if (params.modifier) output = params.modifier(output);
      if (unitMatch) output = `${output}${unitMatch[2]}`;
      return output;
    };
  };

  // node_modules/animejs/dist/modules/text/split.js
  var segmenter = typeof Intl !== "undefined" && Intl.Segmenter;
  var valueRgx = /\{value\}/g;
  var indexRgx = /\{i\}/g;
  var whiteSpaceGroupRgx = /(\s+)/;
  var whiteSpaceRgx = /^\s+$/;
  var lineType = "line";
  var wordType = "word";
  var charType = "char";
  var dataLine = `data-line`;
  var wordSegmenter = null;
  var graphemeSegmenter = null;
  var $splitTemplate = null;
  var isSegmentWordLike = (seg) => {
    return seg.isWordLike || seg.segment === " " || // Consider spaces as words first, then handle them diffrently later
    isNum(+seg.segment);
  };
  var setAriaHidden = ($el) => $el.setAttribute("aria-hidden", "true");
  var getAllTopLevelElements = ($el, type) => [.../** @type {*} */
  $el.querySelectorAll(`[data-${type}]:not([data-${type}] [data-${type}])`)];
  var debugColors = { line: "#00D672", word: "#FF4B4B", char: "#5A87FF" };
  var filterEmptyElements = ($el) => {
    if (!$el.childElementCount && !$el.textContent.trim()) {
      const $parent = $el.parentElement;
      $el.remove();
      if ($parent) filterEmptyElements($parent);
    }
  };
  var filterLineElements = ($el, lineIndex, bin) => {
    const dataLineAttr = $el.getAttribute(dataLine);
    if (dataLineAttr !== null && +dataLineAttr !== lineIndex || $el.tagName === "BR") {
      bin.add($el);
      const prev = $el.previousSibling;
      const next = $el.nextSibling;
      if (prev && prev.nodeType === 3 && whiteSpaceRgx.test(prev.textContent)) {
        bin.add(prev);
      }
      if (next && next.nodeType === 3 && whiteSpaceRgx.test(next.textContent)) {
        bin.add(next);
      }
    }
    let i = $el.childElementCount;
    while (i--) filterLineElements(
      /** @type {HTMLElement} */
      $el.children[i],
      lineIndex,
      bin
    );
    return bin;
  };
  var generateTemplate = (type, params = {}) => {
    let template = ``;
    const classString = isStr(params.class) ? ` class="${params.class}"` : "";
    const cloneType = setValue(params.clone, false);
    const wrapType = setValue(params.wrap, false);
    const overflow = wrapType ? wrapType === true ? "clip" : wrapType : cloneType ? "clip" : false;
    if (wrapType) template += `<span${overflow ? ` style="overflow:${overflow};"` : ""}>`;
    template += `<span${classString}${cloneType ? ` style="position:relative;"` : ""} data-${type}="{i}">`;
    if (cloneType) {
      const left = cloneType === "left" ? "-100%" : cloneType === "right" ? "100%" : "0";
      const top = cloneType === "top" ? "-100%" : cloneType === "bottom" ? "100%" : "0";
      template += `<span>{value}</span>`;
      template += `<span inert style="position:absolute;top:${top};left:${left};white-space:nowrap;">{value}</span>`;
    } else {
      template += `{value}`;
    }
    template += `</span>`;
    if (wrapType) template += `</span>`;
    return template;
  };
  var processHTMLTemplate = (htmlTemplate, store, node, $parentFragment, type, debug, lineIndex, wordIndex, charIndex) => {
    const isLine = type === lineType;
    const isChar = type === charType;
    const className = `_${type}_`;
    const template = isFnc(htmlTemplate) ? htmlTemplate(node) : htmlTemplate;
    const displayStyle = isLine ? "block" : "inline-block";
    $splitTemplate.innerHTML = template.replace(valueRgx, `<i class="${className}"></i>`).replace(indexRgx, `${isChar ? charIndex : isLine ? lineIndex : wordIndex}`);
    const $content = $splitTemplate.content;
    const $highestParent = (
      /** @type {HTMLElement} */
      $content.firstElementChild
    );
    const $split = (
      /** @type {HTMLElement} */
      $content.querySelector(`[data-${type}]`) || $highestParent
    );
    const $replacables = (
      /** @type {NodeListOf<HTMLElement>} */
      $content.querySelectorAll(`i.${className}`)
    );
    const replacablesLength = $replacables.length;
    if (replacablesLength) {
      $highestParent.style.display = displayStyle;
      $split.style.display = displayStyle;
      $split.setAttribute(dataLine, `${lineIndex}`);
      if (!isLine) {
        $split.setAttribute("data-word", `${wordIndex}`);
        if (isChar) $split.setAttribute("data-char", `${charIndex}`);
      }
      let i = replacablesLength;
      while (i--) {
        const $replace = $replacables[i];
        const $closestParent = $replace.parentElement;
        $closestParent.style.display = displayStyle;
        if (isLine) {
          $closestParent.innerHTML = /** @type {HTMLElement} */
          node.innerHTML;
        } else {
          $closestParent.replaceChild(node.cloneNode(true), $replace);
        }
      }
      store.push($split);
      $parentFragment.appendChild($content);
    } else {
      console.warn(`The expression "{value}" is missing from the provided template.`);
    }
    if (debug) $highestParent.style.outline = `1px dotted ${debugColors[type]}`;
    return $highestParent;
  };
  var TextSplitter = class {
    /**
     * @param  {HTMLElement|NodeList|String|Array<HTMLElement>} target
     * @param  {TextSplitterParams} [parameters]
     */
    constructor(target, parameters = {}) {
      if (!wordSegmenter) wordSegmenter = segmenter ? new segmenter([], { granularity: wordType }) : {
        segment: (text) => {
          const segments = [];
          const words2 = text.split(whiteSpaceGroupRgx);
          for (let i = 0, l = words2.length; i < l; i++) {
            const segment = words2[i];
            segments.push({
              segment,
              isWordLike: !whiteSpaceRgx.test(segment)
              // Consider non-whitespace as word-like
            });
          }
          return segments;
        }
      };
      if (!graphemeSegmenter) graphemeSegmenter = segmenter ? new segmenter([], { granularity: "grapheme" }) : {
        segment: (text) => [...text].map((char) => ({ segment: char }))
      };
      if (!$splitTemplate && isBrowser) $splitTemplate = doc.createElement("template");
      if (scope.current) scope.current.register(this);
      const { words, chars, lines, accessible, includeSpaces, debug } = parameters;
      const $target = (
        /** @type {HTMLElement} */
        (target = isArr(target) ? target[0] : target) && /** @type {Node} */
        target.nodeType ? target : (getNodeList(target) || [])[0]
      );
      const lineParams = lines === true ? {} : lines;
      const wordParams = words === true || isUnd(words) ? {} : words;
      const charParams = chars === true ? {} : chars;
      this.debug = setValue(debug, false);
      this.includeSpaces = setValue(includeSpaces, false);
      this.accessible = setValue(accessible, true);
      this.linesOnly = lineParams && (!wordParams && !charParams);
      this.lineTemplate = isObj(lineParams) ? generateTemplate(
        lineType,
        /** @type {SplitTemplateParams} */
        lineParams
      ) : lineParams;
      this.wordTemplate = isObj(wordParams) || this.linesOnly ? generateTemplate(
        wordType,
        /** @type {SplitTemplateParams} */
        wordParams
      ) : wordParams;
      this.charTemplate = isObj(charParams) ? generateTemplate(
        charType,
        /** @type {SplitTemplateParams} */
        charParams
      ) : charParams;
      this.$target = $target;
      this.html = $target && $target.innerHTML;
      this.lines = [];
      this.words = [];
      this.chars = [];
      this.effects = [];
      this.effectsCleanups = [];
      this.cache = null;
      this.ready = false;
      this.width = 0;
      this.resizeTimeout = null;
      const handleSplit = () => this.html && (lineParams || wordParams || charParams) && this.split();
      this.resizeObserver = new ResizeObserver(() => {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
          const currentWidth = (
            /** @type {HTMLElement} */
            $target.offsetWidth
          );
          if (currentWidth === this.width) return;
          this.width = currentWidth;
          handleSplit();
        }, 150);
      });
      if (this.lineTemplate && !this.ready) {
        doc.fonts.ready.then(handleSplit);
      } else {
        handleSplit();
      }
      $target ? this.resizeObserver.observe($target) : console.warn("No Text Splitter target found.");
    }
    /**
     * @param  {(...args: any[]) => Tickable | (() => void)} effect
     * @return this
     */
    addEffect(effect) {
      if (!isFnc(effect)) return console.warn("Effect must return a function.");
      const refreshableEffect = keepTime(effect);
      this.effects.push(refreshableEffect);
      if (this.ready) this.effectsCleanups[this.effects.length - 1] = refreshableEffect(this);
      return this;
    }
    revert() {
      clearTimeout(this.resizeTimeout);
      this.lines.length = this.words.length = this.chars.length = 0;
      this.resizeObserver.disconnect();
      this.effectsCleanups.forEach((cleanup) => isFnc(cleanup) ? cleanup(this) : cleanup.revert && cleanup.revert());
      this.$target.innerHTML = this.html;
      return this;
    }
    /**
     * Recursively processes a node and its children
     * @param {Node} node
     */
    splitNode(node) {
      const wordTemplate = this.wordTemplate;
      const charTemplate = this.charTemplate;
      const includeSpaces = this.includeSpaces;
      const debug = this.debug;
      const nodeType = node.nodeType;
      if (nodeType === 3) {
        const nodeText = node.nodeValue;
        if (nodeText.trim()) {
          const tempWords = [];
          const words = this.words;
          const chars = this.chars;
          const wordSegments = wordSegmenter.segment(nodeText);
          const $wordsFragment = doc.createDocumentFragment();
          let prevSeg = null;
          for (const wordSegment of wordSegments) {
            const segment = wordSegment.segment;
            const isWordLike = isSegmentWordLike(wordSegment);
            if (!prevSeg || isWordLike && (prevSeg && isSegmentWordLike(prevSeg))) {
              tempWords.push(segment);
            } else {
              const lastWordIndex = tempWords.length - 1;
              const lastWord = tempWords[lastWordIndex];
              if (!whiteSpaceGroupRgx.test(lastWord) && !whiteSpaceGroupRgx.test(segment)) {
                tempWords[lastWordIndex] += segment;
              } else {
                tempWords.push(segment);
              }
            }
            prevSeg = wordSegment;
          }
          for (let i = 0, l = tempWords.length; i < l; i++) {
            const word = tempWords[i];
            if (!word.trim()) {
              if (i && includeSpaces) continue;
              $wordsFragment.appendChild(doc.createTextNode(word));
            } else {
              const nextWord = tempWords[i + 1];
              const hasWordFollowingSpace = includeSpaces && nextWord && !nextWord.trim();
              const wordToProcess = word;
              const charSegments = charTemplate ? graphemeSegmenter.segment(wordToProcess) : null;
              const $charsFragment = charTemplate ? doc.createDocumentFragment() : doc.createTextNode(hasWordFollowingSpace ? word + "\xA0" : word);
              if (charTemplate) {
                const charSegmentsArray = [...charSegments];
                for (let j = 0, jl = charSegmentsArray.length; j < jl; j++) {
                  const charSegment = charSegmentsArray[j];
                  const isLastChar = j === jl - 1;
                  const charText = isLastChar && hasWordFollowingSpace ? charSegment.segment + "\xA0" : charSegment.segment;
                  const $charNode = doc.createTextNode(charText);
                  processHTMLTemplate(
                    charTemplate,
                    chars,
                    $charNode,
                    /** @type {DocumentFragment} */
                    $charsFragment,
                    charType,
                    debug,
                    -1,
                    words.length,
                    chars.length
                  );
                }
              }
              if (wordTemplate) {
                processHTMLTemplate(wordTemplate, words, $charsFragment, $wordsFragment, wordType, debug, -1, words.length, chars.length);
              } else if (charTemplate) {
                $wordsFragment.appendChild($charsFragment);
              } else {
                $wordsFragment.appendChild(doc.createTextNode(word));
              }
              if (hasWordFollowingSpace) i++;
            }
          }
          node.parentNode.replaceChild($wordsFragment, node);
        }
      } else if (nodeType === 1) {
        const childNodes = (
          /** @type {Array<Node>} */
          [.../** @type {*} */
          node.childNodes]
        );
        for (let i = 0, l = childNodes.length; i < l; i++) this.splitNode(childNodes[i]);
      }
    }
    /**
     * @param {Boolean} clearCache
     * @return {this}
     */
    split(clearCache = false) {
      const $el = this.$target;
      const isCached = !!this.cache && !clearCache;
      const lineTemplate = this.lineTemplate;
      const wordTemplate = this.wordTemplate;
      const charTemplate = this.charTemplate;
      const fontsReady = doc.fonts.status !== "loading";
      const canSplitLines = lineTemplate && fontsReady;
      this.ready = !lineTemplate || fontsReady;
      if (canSplitLines || clearCache) {
        this.effectsCleanups.forEach((cleanup) => isFnc(cleanup) && cleanup(this));
      }
      if (!isCached) {
        if (clearCache) {
          $el.innerHTML = this.html;
          this.words.length = this.chars.length = 0;
        }
        this.splitNode($el);
        this.cache = $el.innerHTML;
      }
      if (canSplitLines) {
        if (isCached) $el.innerHTML = this.cache;
        this.lines.length = 0;
        if (wordTemplate) this.words = getAllTopLevelElements($el, wordType);
      }
      if (charTemplate && (canSplitLines || wordTemplate)) {
        this.chars = getAllTopLevelElements($el, charType);
      }
      const elementsArray = this.words.length ? this.words : this.chars;
      let y, linesCount = 0;
      for (let i = 0, l = elementsArray.length; i < l; i++) {
        const $el2 = elementsArray[i];
        const { top, height } = $el2.getBoundingClientRect();
        if (!isUnd(y) && top - y > height * 0.5) linesCount++;
        $el2.setAttribute(dataLine, `${linesCount}`);
        const nested = $el2.querySelectorAll(`[${dataLine}]`);
        let c = nested.length;
        while (c--) nested[c].setAttribute(dataLine, `${linesCount}`);
        y = top;
      }
      if (canSplitLines) {
        const linesFragment = doc.createDocumentFragment();
        const parents = /* @__PURE__ */ new Set();
        const clones = [];
        for (let lineIndex = 0; lineIndex < linesCount + 1; lineIndex++) {
          const $clone = (
            /** @type {HTMLElement} */
            $el.cloneNode(true)
          );
          filterLineElements($clone, lineIndex, /* @__PURE__ */ new Set()).forEach(($el2) => {
            const $parent = $el2.parentNode;
            if ($parent) {
              if ($el2.nodeType === 1) parents.add(
                /** @type {HTMLElement} */
                $parent
              );
              $parent.removeChild($el2);
            }
          });
          clones.push($clone);
        }
        parents.forEach(filterEmptyElements);
        for (let cloneIndex = 0, clonesLength = clones.length; cloneIndex < clonesLength; cloneIndex++) {
          processHTMLTemplate(lineTemplate, this.lines, clones[cloneIndex], linesFragment, lineType, this.debug, cloneIndex);
        }
        $el.innerHTML = "";
        $el.appendChild(linesFragment);
        if (wordTemplate) this.words = getAllTopLevelElements($el, wordType);
        if (charTemplate) this.chars = getAllTopLevelElements($el, charType);
      }
      if (this.linesOnly) {
        const words = this.words;
        let w = words.length;
        while (w--) {
          const $word = words[w];
          $word.replaceWith($word.textContent);
        }
        words.length = 0;
      }
      if (this.accessible && (canSplitLines || !isCached)) {
        const $accessible = doc.createElement("span");
        $accessible.style.cssText = `position:absolute;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);width:1px;height:1px;white-space:nowrap;`;
        $accessible.innerHTML = this.html;
        $el.insertBefore($accessible, $el.firstChild);
        this.lines.forEach(setAriaHidden);
        this.words.forEach(setAriaHidden);
        this.chars.forEach(setAriaHidden);
      }
      this.width = /** @type {HTMLElement} */
      $el.offsetWidth;
      if (canSplitLines || clearCache) {
        this.effects.forEach((effect, i) => this.effectsCleanups[i] = effect(this));
      }
      return this;
    }
    refresh() {
      this.split(true);
    }
  };
  var splitText = (target, parameters) => new TextSplitter(target, parameters);

  // node_modules/gsap/gsap-core.js
  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }
    return self;
  }
  function _inheritsLoose(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;
    subClass.__proto__ = superClass;
  }
  var _config = {
    autoSleep: 120,
    force3D: "auto",
    nullTargetWarn: 1,
    units: {
      lineHeight: ""
    }
  };
  var _defaults = {
    duration: 0.5,
    overwrite: false,
    delay: 0
  };
  var _suppressOverwrites;
  var _reverting;
  var _context;
  var _bigNum = 1e8;
  var _tinyNum = 1 / _bigNum;
  var _2PI = Math.PI * 2;
  var _HALF_PI = _2PI / 4;
  var _gsID = 0;
  var _sqrt = Math.sqrt;
  var _cos = Math.cos;
  var _sin = Math.sin;
  var _isString = function _isString2(value) {
    return typeof value === "string";
  };
  var _isFunction = function _isFunction2(value) {
    return typeof value === "function";
  };
  var _isNumber = function _isNumber2(value) {
    return typeof value === "number";
  };
  var _isUndefined = function _isUndefined2(value) {
    return typeof value === "undefined";
  };
  var _isObject = function _isObject2(value) {
    return typeof value === "object";
  };
  var _isNotFalse = function _isNotFalse2(value) {
    return value !== false;
  };
  var _windowExists = function _windowExists2() {
    return typeof window !== "undefined";
  };
  var _isFuncOrString = function _isFuncOrString2(value) {
    return _isFunction(value) || _isString(value);
  };
  var _isTypedArray = typeof ArrayBuffer === "function" && ArrayBuffer.isView || function() {
  };
  var _isArray = Array.isArray;
  var _randomExp = /random\([^)]+\)/g;
  var _commaDelimExp = /,\s*/g;
  var _strictNumExp = /(?:-?\.?\d|\.)+/gi;
  var _numExp = /[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g;
  var _numWithUnitExp = /[-+=.]*\d+[.e-]*\d*[a-z%]*/g;
  var _complexStringNumExp = /[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi;
  var _relExp = /[+-]=-?[.\d]+/;
  var _delimitedValueExp = /[^,'"\[\]\s]+/gi;
  var _unitExp = /^[+\-=e\s\d]*\d+[.\d]*([a-z]*|%)\s*$/i;
  var _globalTimeline;
  var _win;
  var _coreInitted;
  var _doc;
  var _globals = {};
  var _installScope = {};
  var _coreReady;
  var _install = function _install2(scope2) {
    return (_installScope = _merge(scope2, _globals)) && gsap;
  };
  var _missingPlugin = function _missingPlugin2(property, value) {
    return console.warn("Invalid property", property, "set to", value, "Missing plugin? gsap.registerPlugin()");
  };
  var _warn = function _warn2(message, suppress) {
    return !suppress && console.warn(message);
  };
  var _addGlobal = function _addGlobal2(name, obj) {
    return name && (_globals[name] = obj) && _installScope && (_installScope[name] = obj) || _globals;
  };
  var _emptyFunc = function _emptyFunc2() {
    return 0;
  };
  var _startAtRevertConfig = {
    suppressEvents: true,
    isStart: true,
    kill: false
  };
  var _revertConfigNoKill = {
    suppressEvents: true,
    kill: false
  };
  var _revertConfig = {
    suppressEvents: true
  };
  var _reservedProps = {};
  var _lazyTweens = [];
  var _lazyLookup = {};
  var _lastRenderedFrame;
  var _plugins = {};
  var _effects = {};
  var _nextGCFrame = 30;
  var _harnessPlugins = [];
  var _callbackNames = "";
  var _harness = function _harness2(targets) {
    var target = targets[0], harnessPlugin, i;
    _isObject(target) || _isFunction(target) || (targets = [targets]);
    if (!(harnessPlugin = (target._gsap || {}).harness)) {
      i = _harnessPlugins.length;
      while (i-- && !_harnessPlugins[i].targetTest(target)) {
      }
      harnessPlugin = _harnessPlugins[i];
    }
    i = targets.length;
    while (i--) {
      targets[i] && (targets[i]._gsap || (targets[i]._gsap = new GSCache(targets[i], harnessPlugin))) || targets.splice(i, 1);
    }
    return targets;
  };
  var _getCache = function _getCache2(target) {
    return target._gsap || _harness(toArray(target))[0]._gsap;
  };
  var _getProperty = function _getProperty2(target, property, v) {
    return (v = target[property]) && _isFunction(v) ? target[property]() : _isUndefined(v) && target.getAttribute && target.getAttribute(property) || v;
  };
  var _forEachName = function _forEachName2(names, func) {
    return (names = names.split(",")).forEach(func) || names;
  };
  var _round2 = function _round3(value) {
    return Math.round(value * 1e5) / 1e5 || 0;
  };
  var _roundPrecise = function _roundPrecise2(value) {
    return Math.round(value * 1e7) / 1e7 || 0;
  };
  var _parseRelative = function _parseRelative2(start, value) {
    var operator = value.charAt(0), end = parseFloat(value.substr(2));
    start = parseFloat(start);
    return operator === "+" ? start + end : operator === "-" ? start - end : operator === "*" ? start * end : start / end;
  };
  var _arrayContainsAny = function _arrayContainsAny2(toSearch, toFind) {
    var l = toFind.length, i = 0;
    for (; toSearch.indexOf(toFind[i]) < 0 && ++i < l; ) {
    }
    return i < l;
  };
  var _lazyRender = function _lazyRender2() {
    var l = _lazyTweens.length, a = _lazyTweens.slice(0), i, tween;
    _lazyLookup = {};
    _lazyTweens.length = 0;
    for (i = 0; i < l; i++) {
      tween = a[i];
      tween && tween._lazy && (tween.render(tween._lazy[0], tween._lazy[1], true)._lazy = 0);
    }
  };
  var _isRevertWorthy = function _isRevertWorthy2(animation) {
    return !!(animation._initted || animation._startAt || animation.add);
  };
  var _lazySafeRender = function _lazySafeRender2(animation, time, suppressEvents, force) {
    _lazyTweens.length && !_reverting && _lazyRender();
    animation.render(time, suppressEvents, force || !!(_reverting && time < 0 && _isRevertWorthy(animation)));
    _lazyTweens.length && !_reverting && _lazyRender();
  };
  var _numericIfPossible = function _numericIfPossible2(value) {
    var n = parseFloat(value);
    return (n || n === 0) && (value + "").match(_delimitedValueExp).length < 2 ? n : _isString(value) ? value.trim() : value;
  };
  var _passThrough = function _passThrough2(p) {
    return p;
  };
  var _setDefaults = function _setDefaults2(obj, defaults3) {
    for (var p in defaults3) {
      p in obj || (obj[p] = defaults3[p]);
    }
    return obj;
  };
  var _setKeyframeDefaults = function _setKeyframeDefaults2(excludeDuration) {
    return function(obj, defaults3) {
      for (var p in defaults3) {
        p in obj || p === "duration" && excludeDuration || p === "ease" || (obj[p] = defaults3[p]);
      }
    };
  };
  var _merge = function _merge2(base, toMerge) {
    for (var p in toMerge) {
      base[p] = toMerge[p];
    }
    return base;
  };
  var _mergeDeep = function _mergeDeep2(base, toMerge) {
    for (var p in toMerge) {
      p !== "__proto__" && p !== "constructor" && p !== "prototype" && (base[p] = _isObject(toMerge[p]) ? _mergeDeep2(base[p] || (base[p] = {}), toMerge[p]) : toMerge[p]);
    }
    return base;
  };
  var _copyExcluding = function _copyExcluding2(obj, excluding) {
    var copy = {}, p;
    for (p in obj) {
      p in excluding || (copy[p] = obj[p]);
    }
    return copy;
  };
  var _inheritDefaults = function _inheritDefaults2(vars) {
    var parent = vars.parent || _globalTimeline, func = vars.keyframes ? _setKeyframeDefaults(_isArray(vars.keyframes)) : _setDefaults;
    if (_isNotFalse(vars.inherit)) {
      while (parent) {
        func(vars, parent.vars.defaults);
        parent = parent.parent || parent._dp;
      }
    }
    return vars;
  };
  var _arraysMatch = function _arraysMatch2(a1, a2) {
    var i = a1.length, match = i === a2.length;
    while (match && i-- && a1[i] === a2[i]) {
    }
    return i < 0;
  };
  var _addLinkedListItem = function _addLinkedListItem2(parent, child, firstProp, lastProp, sortBy) {
    if (firstProp === void 0) {
      firstProp = "_first";
    }
    if (lastProp === void 0) {
      lastProp = "_last";
    }
    var prev = parent[lastProp], t;
    if (sortBy) {
      t = child[sortBy];
      while (prev && prev[sortBy] > t) {
        prev = prev._prev;
      }
    }
    if (prev) {
      child._next = prev._next;
      prev._next = child;
    } else {
      child._next = parent[firstProp];
      parent[firstProp] = child;
    }
    if (child._next) {
      child._next._prev = child;
    } else {
      parent[lastProp] = child;
    }
    child._prev = prev;
    child.parent = child._dp = parent;
    return child;
  };
  var _removeLinkedListItem = function _removeLinkedListItem2(parent, child, firstProp, lastProp) {
    if (firstProp === void 0) {
      firstProp = "_first";
    }
    if (lastProp === void 0) {
      lastProp = "_last";
    }
    var prev = child._prev, next = child._next;
    if (prev) {
      prev._next = next;
    } else if (parent[firstProp] === child) {
      parent[firstProp] = next;
    }
    if (next) {
      next._prev = prev;
    } else if (parent[lastProp] === child) {
      parent[lastProp] = prev;
    }
    child._next = child._prev = child.parent = null;
  };
  var _removeFromParent = function _removeFromParent2(child, onlyIfParentHasAutoRemove) {
    child.parent && (!onlyIfParentHasAutoRemove || child.parent.autoRemoveChildren) && child.parent.remove && child.parent.remove(child);
    child._act = 0;
  };
  var _uncache = function _uncache2(animation, child) {
    if (animation && (!child || child._end > animation._dur || child._start < 0)) {
      var a = animation;
      while (a) {
        a._dirty = 1;
        a = a.parent;
      }
    }
    return animation;
  };
  var _recacheAncestors = function _recacheAncestors2(animation) {
    var parent = animation.parent;
    while (parent && parent.parent) {
      parent._dirty = 1;
      parent.totalDuration();
      parent = parent.parent;
    }
    return animation;
  };
  var _rewindStartAt = function _rewindStartAt2(tween, totalTime, suppressEvents, force) {
    return tween._startAt && (_reverting ? tween._startAt.revert(_revertConfigNoKill) : tween.vars.immediateRender && !tween.vars.autoRevert || tween._startAt.render(totalTime, true, force));
  };
  var _hasNoPausedAncestors = function _hasNoPausedAncestors2(animation) {
    return !animation || animation._ts && _hasNoPausedAncestors2(animation.parent);
  };
  var _elapsedCycleDuration = function _elapsedCycleDuration2(animation) {
    return animation._repeat ? _animationCycle(animation._tTime, animation = animation.duration() + animation._rDelay) * animation : 0;
  };
  var _animationCycle = function _animationCycle2(tTime, cycleDuration) {
    var whole = Math.floor(tTime = _roundPrecise(tTime / cycleDuration));
    return tTime && whole === tTime ? whole - 1 : whole;
  };
  var _parentToChildTotalTime = function _parentToChildTotalTime2(parentTime, child) {
    return (parentTime - child._start) * child._ts + (child._ts >= 0 ? 0 : child._dirty ? child.totalDuration() : child._tDur);
  };
  var _setEnd = function _setEnd2(animation) {
    return animation._end = _roundPrecise(animation._start + (animation._tDur / Math.abs(animation._ts || animation._rts || _tinyNum) || 0));
  };
  var _alignPlayhead = function _alignPlayhead2(animation, totalTime) {
    var parent = animation._dp;
    if (parent && parent.smoothChildTiming && animation._ts) {
      animation._start = _roundPrecise(parent._time - (animation._ts > 0 ? totalTime / animation._ts : ((animation._dirty ? animation.totalDuration() : animation._tDur) - totalTime) / -animation._ts));
      _setEnd(animation);
      parent._dirty || _uncache(parent, animation);
    }
    return animation;
  };
  var _postAddChecks = function _postAddChecks2(timeline2, child) {
    var t;
    if (child._time || !child._dur && child._initted || child._start < timeline2._time && (child._dur || !child.add)) {
      t = _parentToChildTotalTime(timeline2.rawTime(), child);
      if (!child._dur || _clamp(0, child.totalDuration(), t) - child._tTime > _tinyNum) {
        child.render(t, true);
      }
    }
    if (_uncache(timeline2, child)._dp && timeline2._initted && timeline2._time >= timeline2._dur && timeline2._ts) {
      if (timeline2._dur < timeline2.duration()) {
        t = timeline2;
        while (t._dp) {
          t.rawTime() >= 0 && t.totalTime(t._tTime);
          t = t._dp;
        }
      }
      timeline2._zTime = -_tinyNum;
    }
  };
  var _addToTimeline = function _addToTimeline2(timeline2, child, position, skipChecks) {
    child.parent && _removeFromParent(child);
    child._start = _roundPrecise((_isNumber(position) ? position : position || timeline2 !== _globalTimeline ? _parsePosition(timeline2, position, child) : timeline2._time) + child._delay);
    child._end = _roundPrecise(child._start + (child.totalDuration() / Math.abs(child.timeScale()) || 0));
    _addLinkedListItem(timeline2, child, "_first", "_last", timeline2._sort ? "_start" : 0);
    _isFromOrFromStart(child) || (timeline2._recent = child);
    skipChecks || _postAddChecks(timeline2, child);
    timeline2._ts < 0 && _alignPlayhead(timeline2, timeline2._tTime);
    return timeline2;
  };
  var _scrollTrigger = function _scrollTrigger2(animation, trigger) {
    return (_globals.ScrollTrigger || _missingPlugin("scrollTrigger", trigger)) && _globals.ScrollTrigger.create(trigger, animation);
  };
  var _attemptInitTween = function _attemptInitTween2(tween, time, force, suppressEvents, tTime) {
    _initTween(tween, time, tTime);
    if (!tween._initted) {
      return 1;
    }
    if (!force && tween._pt && !_reverting && (tween._dur && tween.vars.lazy !== false || !tween._dur && tween.vars.lazy) && _lastRenderedFrame !== _ticker.frame) {
      _lazyTweens.push(tween);
      tween._lazy = [tTime, suppressEvents];
      return 1;
    }
  };
  var _parentPlayheadIsBeforeStart = function _parentPlayheadIsBeforeStart2(_ref) {
    var parent = _ref.parent;
    return parent && parent._ts && parent._initted && !parent._lock && (parent.rawTime() < 0 || _parentPlayheadIsBeforeStart2(parent));
  };
  var _isFromOrFromStart = function _isFromOrFromStart2(_ref2) {
    var data = _ref2.data;
    return data === "isFromStart" || data === "isStart";
  };
  var _renderZeroDurationTween = function _renderZeroDurationTween2(tween, totalTime, suppressEvents, force) {
    var prevRatio = tween.ratio, ratio = totalTime < 0 || !totalTime && (!tween._start && _parentPlayheadIsBeforeStart(tween) && !(!tween._initted && _isFromOrFromStart(tween)) || (tween._ts < 0 || tween._dp._ts < 0) && !_isFromOrFromStart(tween)) ? 0 : 1, repeatDelay = tween._rDelay, tTime = 0, pt, iteration, prevIteration;
    if (repeatDelay && tween._repeat) {
      tTime = _clamp(0, tween._tDur, totalTime);
      iteration = _animationCycle(tTime, repeatDelay);
      tween._yoyo && iteration & 1 && (ratio = 1 - ratio);
      if (iteration !== _animationCycle(tween._tTime, repeatDelay)) {
        prevRatio = 1 - ratio;
        tween.vars.repeatRefresh && tween._initted && tween.invalidate();
      }
    }
    if (ratio !== prevRatio || _reverting || force || tween._zTime === _tinyNum || !totalTime && tween._zTime) {
      if (!tween._initted && _attemptInitTween(tween, totalTime, force, suppressEvents, tTime)) {
        return;
      }
      prevIteration = tween._zTime;
      tween._zTime = totalTime || (suppressEvents ? _tinyNum : 0);
      suppressEvents || (suppressEvents = totalTime && !prevIteration);
      tween.ratio = ratio;
      tween._from && (ratio = 1 - ratio);
      tween._time = 0;
      tween._tTime = tTime;
      pt = tween._pt;
      while (pt) {
        pt.r(ratio, pt.d);
        pt = pt._next;
      }
      totalTime < 0 && _rewindStartAt(tween, totalTime, suppressEvents, true);
      tween._onUpdate && !suppressEvents && _callback(tween, "onUpdate");
      tTime && tween._repeat && !suppressEvents && tween.parent && _callback(tween, "onRepeat");
      if ((totalTime >= tween._tDur || totalTime < 0) && tween.ratio === ratio) {
        ratio && _removeFromParent(tween, 1);
        if (!suppressEvents && !_reverting) {
          _callback(tween, ratio ? "onComplete" : "onReverseComplete", true);
          tween._prom && tween._prom();
        }
      }
    } else if (!tween._zTime) {
      tween._zTime = totalTime;
    }
  };
  var _findNextPauseTween = function _findNextPauseTween2(animation, prevTime, time) {
    var child;
    if (time > prevTime) {
      child = animation._first;
      while (child && child._start <= time) {
        if (child.data === "isPause" && child._start > prevTime) {
          return child;
        }
        child = child._next;
      }
    } else {
      child = animation._last;
      while (child && child._start >= time) {
        if (child.data === "isPause" && child._start < prevTime) {
          return child;
        }
        child = child._prev;
      }
    }
  };
  var _setDuration = function _setDuration2(animation, duration, skipUncache, leavePlayhead) {
    var repeat = animation._repeat, dur = _roundPrecise(duration) || 0, totalProgress = animation._tTime / animation._tDur;
    totalProgress && !leavePlayhead && (animation._time *= dur / animation._dur);
    animation._dur = dur;
    animation._tDur = !repeat ? dur : repeat < 0 ? 1e10 : _roundPrecise(dur * (repeat + 1) + animation._rDelay * repeat);
    totalProgress > 0 && !leavePlayhead && _alignPlayhead(animation, animation._tTime = animation._tDur * totalProgress);
    animation.parent && _setEnd(animation);
    skipUncache || _uncache(animation.parent, animation);
    return animation;
  };
  var _onUpdateTotalDuration = function _onUpdateTotalDuration2(animation) {
    return animation instanceof Timeline ? _uncache(animation) : _setDuration(animation, animation._dur);
  };
  var _zeroPosition = {
    _start: 0,
    endTime: _emptyFunc,
    totalDuration: _emptyFunc
  };
  var _parsePosition = function _parsePosition2(animation, position, percentAnimation) {
    var labels = animation.labels, recent = animation._recent || _zeroPosition, clippedDuration = animation.duration() >= _bigNum ? recent.endTime(false) : animation._dur, i, offset, isPercent;
    if (_isString(position) && (isNaN(position) || position in labels)) {
      offset = position.charAt(0);
      isPercent = position.substr(-1) === "%";
      i = position.indexOf("=");
      if (offset === "<" || offset === ">") {
        i >= 0 && (position = position.replace(/=/, ""));
        return (offset === "<" ? recent._start : recent.endTime(recent._repeat >= 0)) + (parseFloat(position.substr(1)) || 0) * (isPercent ? (i < 0 ? recent : percentAnimation).totalDuration() / 100 : 1);
      }
      if (i < 0) {
        position in labels || (labels[position] = clippedDuration);
        return labels[position];
      }
      offset = parseFloat(position.charAt(i - 1) + position.substr(i + 1));
      if (isPercent && percentAnimation) {
        offset = offset / 100 * (_isArray(percentAnimation) ? percentAnimation[0] : percentAnimation).totalDuration();
      }
      return i > 1 ? _parsePosition2(animation, position.substr(0, i - 1), percentAnimation) + offset : clippedDuration + offset;
    }
    return position == null ? clippedDuration : +position;
  };
  var _createTweenType = function _createTweenType2(type, params, timeline2) {
    var isLegacy = _isNumber(params[1]), varsIndex = (isLegacy ? 2 : 1) + (type < 2 ? 0 : 1), vars = params[varsIndex], irVars, parent;
    isLegacy && (vars.duration = params[1]);
    vars.parent = timeline2;
    if (type) {
      irVars = vars;
      parent = timeline2;
      while (parent && !("immediateRender" in irVars)) {
        irVars = parent.vars.defaults || {};
        parent = _isNotFalse(parent.vars.inherit) && parent.parent;
      }
      vars.immediateRender = _isNotFalse(irVars.immediateRender);
      type < 2 ? vars.runBackwards = 1 : vars.startAt = params[varsIndex - 1];
    }
    return new Tween(params[0], vars, params[varsIndex + 1]);
  };
  var _conditionalReturn = function _conditionalReturn2(value, func) {
    return value || value === 0 ? func(value) : func;
  };
  var _clamp = function _clamp2(min, max2, value) {
    return value < min ? min : value > max2 ? max2 : value;
  };
  var getUnit = function getUnit2(value, v) {
    return !_isString(value) || !(v = _unitExp.exec(value)) ? "" : v[1];
  };
  var clamp2 = function clamp3(min, max2, value) {
    return _conditionalReturn(value, function(v) {
      return _clamp(min, max2, v);
    });
  };
  var _slice = [].slice;
  var _isArrayLike = function _isArrayLike2(value, nonEmpty) {
    return value && _isObject(value) && "length" in value && (!nonEmpty && !value.length || value.length - 1 in value && _isObject(value[0])) && !value.nodeType && value !== _win;
  };
  var _flatten = function _flatten2(ar, leaveStrings, accumulator) {
    if (accumulator === void 0) {
      accumulator = [];
    }
    return ar.forEach(function(value) {
      var _accumulator;
      return _isString(value) && !leaveStrings || _isArrayLike(value, 1) ? (_accumulator = accumulator).push.apply(_accumulator, toArray(value)) : accumulator.push(value);
    }) || accumulator;
  };
  var toArray = function toArray2(value, scope2, leaveStrings) {
    return _context && !scope2 && _context.selector ? _context.selector(value) : _isString(value) && !leaveStrings && (_coreInitted || !_wake()) ? _slice.call((scope2 || _doc).querySelectorAll(value), 0) : _isArray(value) ? _flatten(value, leaveStrings) : _isArrayLike(value) ? _slice.call(value, 0) : value ? [value] : [];
  };
  var selector = function selector2(value) {
    value = toArray(value)[0] || _warn("Invalid scope") || {};
    return function(v) {
      var el = value.current || value.nativeElement || value;
      return toArray(v, el.querySelectorAll ? el : el === value ? _warn("Invalid scope") || _doc.createElement("div") : value);
    };
  };
  var shuffle2 = function shuffle3(a) {
    return a.sort(function() {
      return 0.5 - Math.random();
    });
  };
  var distribute = function distribute2(v) {
    if (_isFunction(v)) {
      return v;
    }
    var vars = _isObject(v) ? v : {
      each: v
    }, ease = _parseEase(vars.ease), from = vars.from || 0, base = parseFloat(vars.base) || 0, cache = {}, isDecimal = from > 0 && from < 1, ratios = isNaN(from) || isDecimal, axis = vars.axis, ratioX = from, ratioY = from;
    if (_isString(from)) {
      ratioX = ratioY = {
        center: 0.5,
        edges: 0.5,
        end: 1
      }[from] || 0;
    } else if (!isDecimal && ratios) {
      ratioX = from[0];
      ratioY = from[1];
    }
    return function(i, target, a) {
      var l = (a || vars).length, distances = cache[l], originX, originY, x, y, d, j, max2, min, wrapAt;
      if (!distances) {
        wrapAt = vars.grid === "auto" ? 0 : (vars.grid || [1, _bigNum])[1];
        if (!wrapAt) {
          max2 = -_bigNum;
          while (max2 < (max2 = a[wrapAt++].getBoundingClientRect().left) && wrapAt < l) {
          }
          wrapAt < l && wrapAt--;
        }
        distances = cache[l] = [];
        originX = ratios ? Math.min(wrapAt, l) * ratioX - 0.5 : from % wrapAt;
        originY = wrapAt === _bigNum ? 0 : ratios ? l * ratioY / wrapAt - 0.5 : from / wrapAt | 0;
        max2 = 0;
        min = _bigNum;
        for (j = 0; j < l; j++) {
          x = j % wrapAt - originX;
          y = originY - (j / wrapAt | 0);
          distances[j] = d = !axis ? _sqrt(x * x + y * y) : Math.abs(axis === "y" ? y : x);
          d > max2 && (max2 = d);
          d < min && (min = d);
        }
        from === "random" && shuffle2(distances);
        distances.max = max2 - min;
        distances.min = min;
        distances.v = l = (parseFloat(vars.amount) || parseFloat(vars.each) * (wrapAt > l ? l - 1 : !axis ? Math.max(wrapAt, l / wrapAt) : axis === "y" ? l / wrapAt : wrapAt) || 0) * (from === "edges" ? -1 : 1);
        distances.b = l < 0 ? base - l : base;
        distances.u = getUnit(vars.amount || vars.each) || 0;
        ease = ease && l < 0 ? _invertEase(ease) : ease;
      }
      l = (distances[i] - distances.min) / distances.max || 0;
      return _roundPrecise(distances.b + (ease ? ease(l) : l) * distances.v) + distances.u;
    };
  };
  var _roundModifier = function _roundModifier2(v) {
    var p = Math.pow(10, ((v + "").split(".")[1] || "").length);
    return function(raw) {
      var n = _roundPrecise(Math.round(parseFloat(raw) / v) * v * p);
      return (n - n % 1) / p + (_isNumber(raw) ? 0 : getUnit(raw));
    };
  };
  var snap = function snap2(snapTo, value) {
    var isArray = _isArray(snapTo), radius, is2D;
    if (!isArray && _isObject(snapTo)) {
      radius = isArray = snapTo.radius || _bigNum;
      if (snapTo.values) {
        snapTo = toArray(snapTo.values);
        if (is2D = !_isNumber(snapTo[0])) {
          radius *= radius;
        }
      } else {
        snapTo = _roundModifier(snapTo.increment);
      }
    }
    return _conditionalReturn(value, !isArray ? _roundModifier(snapTo) : _isFunction(snapTo) ? function(raw) {
      is2D = snapTo(raw);
      return Math.abs(is2D - raw) <= radius ? is2D : raw;
    } : function(raw) {
      var x = parseFloat(is2D ? raw.x : raw), y = parseFloat(is2D ? raw.y : 0), min = _bigNum, closest = 0, i = snapTo.length, dx, dy;
      while (i--) {
        if (is2D) {
          dx = snapTo[i].x - x;
          dy = snapTo[i].y - y;
          dx = dx * dx + dy * dy;
        } else {
          dx = Math.abs(snapTo[i] - x);
        }
        if (dx < min) {
          min = dx;
          closest = i;
        }
      }
      closest = !radius || min <= radius ? snapTo[closest] : raw;
      return is2D || closest === raw || _isNumber(raw) ? closest : closest + getUnit(raw);
    });
  };
  var random2 = function random3(min, max2, roundingIncrement, returnFunction) {
    return _conditionalReturn(_isArray(min) ? !max2 : roundingIncrement === true ? !!(roundingIncrement = 0) : !returnFunction, function() {
      return _isArray(min) ? min[~~(Math.random() * min.length)] : (roundingIncrement = roundingIncrement || 1e-5) && (returnFunction = roundingIncrement < 1 ? Math.pow(10, (roundingIncrement + "").length - 2) : 1) && Math.floor(Math.round((min - roundingIncrement / 2 + Math.random() * (max2 - min + roundingIncrement * 0.99)) / roundingIncrement) * roundingIncrement * returnFunction) / returnFunction;
    });
  };
  var pipe = function pipe2() {
    for (var _len = arguments.length, functions = new Array(_len), _key = 0; _key < _len; _key++) {
      functions[_key] = arguments[_key];
    }
    return function(value) {
      return functions.reduce(function(v, f) {
        return f(v);
      }, value);
    };
  };
  var unitize = function unitize2(func, unit) {
    return function(value) {
      return func(parseFloat(value)) + (unit || getUnit(value));
    };
  };
  var normalize = function normalize2(min, max2, value) {
    return mapRange(min, max2, 0, 1, value);
  };
  var _wrapArray = function _wrapArray2(a, wrapper, value) {
    return _conditionalReturn(value, function(index) {
      return a[~~wrapper(index)];
    });
  };
  var wrap = function wrap2(min, max2, value) {
    var range = max2 - min;
    return _isArray(min) ? _wrapArray(min, wrap2(0, min.length), max2) : _conditionalReturn(value, function(value2) {
      return (range + (value2 - min) % range) % range + min;
    });
  };
  var wrapYoyo = function wrapYoyo2(min, max2, value) {
    var range = max2 - min, total = range * 2;
    return _isArray(min) ? _wrapArray(min, wrapYoyo2(0, min.length - 1), max2) : _conditionalReturn(value, function(value2) {
      value2 = (total + (value2 - min) % total) % total || 0;
      return min + (value2 > range ? total - value2 : value2);
    });
  };
  var _replaceRandom = function _replaceRandom2(s) {
    return s.replace(_randomExp, function(match) {
      var arIndex = match.indexOf("[") + 1, values = match.substring(arIndex || 7, arIndex ? match.indexOf("]") : match.length - 1).split(_commaDelimExp);
      return random2(arIndex ? values : +values[0], arIndex ? 0 : +values[1], +values[2] || 1e-5);
    });
  };
  var mapRange = function mapRange2(inMin, inMax, outMin, outMax, value) {
    var inRange = inMax - inMin, outRange = outMax - outMin;
    return _conditionalReturn(value, function(value2) {
      return outMin + ((value2 - inMin) / inRange * outRange || 0);
    });
  };
  var interpolate = function interpolate2(start, end, progress2, mutate) {
    var func = isNaN(start + end) ? 0 : function(p2) {
      return (1 - p2) * start + p2 * end;
    };
    if (!func) {
      var isString = _isString(start), master = {}, p, i, interpolators, l, il;
      progress2 === true && (mutate = 1) && (progress2 = null);
      if (isString) {
        start = {
          p: start
        };
        end = {
          p: end
        };
      } else if (_isArray(start) && !_isArray(end)) {
        interpolators = [];
        l = start.length;
        il = l - 2;
        for (i = 1; i < l; i++) {
          interpolators.push(interpolate2(start[i - 1], start[i]));
        }
        l--;
        func = function func2(p2) {
          p2 *= l;
          var i2 = Math.min(il, ~~p2);
          return interpolators[i2](p2 - i2);
        };
        progress2 = end;
      } else if (!mutate) {
        start = _merge(_isArray(start) ? [] : {}, start);
      }
      if (!interpolators) {
        for (p in end) {
          _addPropTween.call(master, start, p, "get", end[p]);
        }
        func = function func2(p2) {
          return _renderPropTweens(p2, master) || (isString ? start.p : start);
        };
      }
    }
    return _conditionalReturn(progress2, func);
  };
  var _getLabelInDirection = function _getLabelInDirection2(timeline2, fromTime, backward) {
    var labels = timeline2.labels, min = _bigNum, p, distance, label;
    for (p in labels) {
      distance = labels[p] - fromTime;
      if (distance < 0 === !!backward && distance && min > (distance = Math.abs(distance))) {
        label = p;
        min = distance;
      }
    }
    return label;
  };
  var _callback = function _callback2(animation, type, executeLazyFirst) {
    var v = animation.vars, callback = v[type], prevContext = _context, context3 = animation._ctx, params, scope2, result;
    if (!callback) {
      return;
    }
    params = v[type + "Params"];
    scope2 = v.callbackScope || animation;
    executeLazyFirst && _lazyTweens.length && _lazyRender();
    context3 && (_context = context3);
    result = params ? callback.apply(scope2, params) : callback.call(scope2);
    _context = prevContext;
    return result;
  };
  var _interrupt = function _interrupt2(animation) {
    _removeFromParent(animation);
    animation.scrollTrigger && animation.scrollTrigger.kill(!!_reverting);
    animation.progress() < 1 && _callback(animation, "onInterrupt");
    return animation;
  };
  var _quickTween;
  var _registerPluginQueue = [];
  var _createPlugin = function _createPlugin2(config3) {
    if (!config3) return;
    config3 = !config3.name && config3["default"] || config3;
    if (_windowExists() || config3.headless) {
      var name = config3.name, isFunc = _isFunction(config3), Plugin = name && !isFunc && config3.init ? function() {
        this._props = [];
      } : config3, instanceDefaults = {
        init: _emptyFunc,
        render: _renderPropTweens,
        add: _addPropTween,
        kill: _killPropTweensOf,
        modifier: _addPluginModifier,
        rawVars: 0
      }, statics = {
        targetTest: 0,
        get: 0,
        getSetter: _getSetter,
        aliases: {},
        register: 0
      };
      _wake();
      if (config3 !== Plugin) {
        if (_plugins[name]) {
          return;
        }
        _setDefaults(Plugin, _setDefaults(_copyExcluding(config3, instanceDefaults), statics));
        _merge(Plugin.prototype, _merge(instanceDefaults, _copyExcluding(config3, statics)));
        _plugins[Plugin.prop = name] = Plugin;
        if (config3.targetTest) {
          _harnessPlugins.push(Plugin);
          _reservedProps[name] = 1;
        }
        name = (name === "css" ? "CSS" : name.charAt(0).toUpperCase() + name.substr(1)) + "Plugin";
      }
      _addGlobal(name, Plugin);
      config3.register && config3.register(gsap, Plugin, PropTween);
    } else {
      _registerPluginQueue.push(config3);
    }
  };
  var _255 = 255;
  var _colorLookup = {
    aqua: [0, _255, _255],
    lime: [0, _255, 0],
    silver: [192, 192, 192],
    black: [0, 0, 0],
    maroon: [128, 0, 0],
    teal: [0, 128, 128],
    blue: [0, 0, _255],
    navy: [0, 0, 128],
    white: [_255, _255, _255],
    olive: [128, 128, 0],
    yellow: [_255, _255, 0],
    orange: [_255, 165, 0],
    gray: [128, 128, 128],
    purple: [128, 0, 128],
    green: [0, 128, 0],
    red: [_255, 0, 0],
    pink: [_255, 192, 203],
    cyan: [0, _255, _255],
    transparent: [_255, _255, _255, 0]
  };
  var _hue = function _hue2(h, m1, m2) {
    h += h < 0 ? 1 : h > 1 ? -1 : 0;
    return (h * 6 < 1 ? m1 + (m2 - m1) * h * 6 : h < 0.5 ? m2 : h * 3 < 2 ? m1 + (m2 - m1) * (2 / 3 - h) * 6 : m1) * _255 + 0.5 | 0;
  };
  var splitColor = function splitColor2(v, toHSL, forceAlpha) {
    var a = !v ? _colorLookup.black : _isNumber(v) ? [v >> 16, v >> 8 & _255, v & _255] : 0, r, g, b, h, s, l, max2, min, d, wasHSL;
    if (!a) {
      if (v.substr(-1) === ",") {
        v = v.substr(0, v.length - 1);
      }
      if (_colorLookup[v]) {
        a = _colorLookup[v];
      } else if (v.charAt(0) === "#") {
        if (v.length < 6) {
          r = v.charAt(1);
          g = v.charAt(2);
          b = v.charAt(3);
          v = "#" + r + r + g + g + b + b + (v.length === 5 ? v.charAt(4) + v.charAt(4) : "");
        }
        if (v.length === 9) {
          a = parseInt(v.substr(1, 6), 16);
          return [a >> 16, a >> 8 & _255, a & _255, parseInt(v.substr(7), 16) / 255];
        }
        v = parseInt(v.substr(1), 16);
        a = [v >> 16, v >> 8 & _255, v & _255];
      } else if (v.substr(0, 3) === "hsl") {
        a = wasHSL = v.match(_strictNumExp);
        if (!toHSL) {
          h = +a[0] % 360 / 360;
          s = +a[1] / 100;
          l = +a[2] / 100;
          g = l <= 0.5 ? l * (s + 1) : l + s - l * s;
          r = l * 2 - g;
          a.length > 3 && (a[3] *= 1);
          a[0] = _hue(h + 1 / 3, r, g);
          a[1] = _hue(h, r, g);
          a[2] = _hue(h - 1 / 3, r, g);
        } else if (~v.indexOf("=")) {
          a = v.match(_numExp);
          forceAlpha && a.length < 4 && (a[3] = 1);
          return a;
        }
      } else {
        a = v.match(_strictNumExp) || _colorLookup.transparent;
      }
      a = a.map(Number);
    }
    if (toHSL && !wasHSL) {
      r = a[0] / _255;
      g = a[1] / _255;
      b = a[2] / _255;
      max2 = Math.max(r, g, b);
      min = Math.min(r, g, b);
      l = (max2 + min) / 2;
      if (max2 === min) {
        h = s = 0;
      } else {
        d = max2 - min;
        s = l > 0.5 ? d / (2 - max2 - min) : d / (max2 + min);
        h = max2 === r ? (g - b) / d + (g < b ? 6 : 0) : max2 === g ? (b - r) / d + 2 : (r - g) / d + 4;
        h *= 60;
      }
      a[0] = ~~(h + 0.5);
      a[1] = ~~(s * 100 + 0.5);
      a[2] = ~~(l * 100 + 0.5);
    }
    forceAlpha && a.length < 4 && (a[3] = 1);
    return a;
  };
  var _colorOrderData = function _colorOrderData2(v) {
    var values = [], c = [], i = -1;
    v.split(_colorExp).forEach(function(v2) {
      var a = v2.match(_numWithUnitExp) || [];
      values.push.apply(values, a);
      c.push(i += a.length + 1);
    });
    values.c = c;
    return values;
  };
  var _formatColors = function _formatColors2(s, toHSL, orderMatchData) {
    var result = "", colors = (s + result).match(_colorExp), type = toHSL ? "hsla(" : "rgba(", i = 0, c, shell, d, l;
    if (!colors) {
      return s;
    }
    colors = colors.map(function(color2) {
      return (color2 = splitColor(color2, toHSL, 1)) && type + (toHSL ? color2[0] + "," + color2[1] + "%," + color2[2] + "%," + color2[3] : color2.join(",")) + ")";
    });
    if (orderMatchData) {
      d = _colorOrderData(s);
      c = orderMatchData.c;
      if (c.join(result) !== d.c.join(result)) {
        shell = s.replace(_colorExp, "1").split(_numWithUnitExp);
        l = shell.length - 1;
        for (; i < l; i++) {
          result += shell[i] + (~c.indexOf(i) ? colors.shift() || type + "0,0,0,0)" : (d.length ? d : colors.length ? colors : orderMatchData).shift());
        }
      }
    }
    if (!shell) {
      shell = s.split(_colorExp);
      l = shell.length - 1;
      for (; i < l; i++) {
        result += shell[i] + colors[i];
      }
    }
    return result + shell[l];
  };
  var _colorExp = (function() {
    var s = "(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3,4}){1,2}\\b", p;
    for (p in _colorLookup) {
      s += "|" + p + "\\b";
    }
    return new RegExp(s + ")", "gi");
  })();
  var _hslExp = /hsl[a]?\(/;
  var _colorStringFilter = function _colorStringFilter2(a) {
    var combined = a.join(" "), toHSL;
    _colorExp.lastIndex = 0;
    if (_colorExp.test(combined)) {
      toHSL = _hslExp.test(combined);
      a[1] = _formatColors(a[1], toHSL);
      a[0] = _formatColors(a[0], toHSL, _colorOrderData(a[1]));
      return true;
    }
  };
  var _tickerActive;
  var _ticker = (function() {
    var _getTime = Date.now, _lagThreshold = 500, _adjustedLag = 33, _startTime = _getTime(), _lastUpdate = _startTime, _gap = 1e3 / 240, _nextTime = _gap, _listeners2 = [], _id, _req, _raf, _self, _delta, _i, _tick = function _tick2(v) {
      var elapsed = _getTime() - _lastUpdate, manual = v === true, overlap, dispatch, time, frame2;
      (elapsed > _lagThreshold || elapsed < 0) && (_startTime += elapsed - _adjustedLag);
      _lastUpdate += elapsed;
      time = _lastUpdate - _startTime;
      overlap = time - _nextTime;
      if (overlap > 0 || manual) {
        frame2 = ++_self.frame;
        _delta = time - _self.time * 1e3;
        _self.time = time = time / 1e3;
        _nextTime += overlap + (overlap >= _gap ? 4 : _gap - overlap);
        dispatch = 1;
      }
      manual || (_id = _req(_tick2));
      if (dispatch) {
        for (_i = 0; _i < _listeners2.length; _i++) {
          _listeners2[_i](time, _delta, frame2, v);
        }
      }
    };
    _self = {
      time: 0,
      frame: 0,
      tick: function tick2() {
        _tick(true);
      },
      deltaRatio: function deltaRatio(fps) {
        return _delta / (1e3 / (fps || 60));
      },
      wake: function wake() {
        if (_coreReady) {
          if (!_coreInitted && _windowExists()) {
            _win = _coreInitted = window;
            _doc = _win.document || {};
            _globals.gsap = gsap;
            (_win.gsapVersions || (_win.gsapVersions = [])).push(gsap.version);
            _install(_installScope || _win.GreenSockGlobals || !_win.gsap && _win || {});
            _registerPluginQueue.forEach(_createPlugin);
          }
          _raf = typeof requestAnimationFrame !== "undefined" && requestAnimationFrame;
          _id && _self.sleep();
          _req = _raf || function(f) {
            return setTimeout(f, _nextTime - _self.time * 1e3 + 1 | 0);
          };
          _tickerActive = 1;
          _tick(2);
        }
      },
      sleep: function sleep() {
        (_raf ? cancelAnimationFrame : clearTimeout)(_id);
        _tickerActive = 0;
        _req = _emptyFunc;
      },
      lagSmoothing: function lagSmoothing(threshold, adjustedLag) {
        _lagThreshold = threshold || Infinity;
        _adjustedLag = Math.min(adjustedLag || 33, _lagThreshold);
      },
      fps: function fps(_fps) {
        _gap = 1e3 / (_fps || 240);
        _nextTime = _self.time * 1e3 + _gap;
      },
      add: function add(callback, once, prioritize) {
        var func = once ? function(t, d, f, v) {
          callback(t, d, f, v);
          _self.remove(func);
        } : callback;
        _self.remove(callback);
        _listeners2[prioritize ? "unshift" : "push"](func);
        _wake();
        return func;
      },
      remove: function remove(callback, i) {
        ~(i = _listeners2.indexOf(callback)) && _listeners2.splice(i, 1) && _i >= i && _i--;
      },
      _listeners: _listeners2
    };
    return _self;
  })();
  var _wake = function _wake2() {
    return !_tickerActive && _ticker.wake();
  };
  var _easeMap = {};
  var _customEaseExp = /^[\d.\-M][\d.\-,\s]/;
  var _quotesExp = /["']/g;
  var _parseObjectInString = function _parseObjectInString2(value) {
    var obj = {}, split2 = value.substr(1, value.length - 3).split(":"), key2 = split2[0], i = 1, l = split2.length, index, val, parsedVal;
    for (; i < l; i++) {
      val = split2[i];
      index = i !== l - 1 ? val.lastIndexOf(",") : val.length;
      parsedVal = val.substr(0, index);
      obj[key2] = isNaN(parsedVal) ? parsedVal.replace(_quotesExp, "").trim() : +parsedVal;
      key2 = val.substr(index + 1).trim();
    }
    return obj;
  };
  var _valueInParentheses = function _valueInParentheses2(value) {
    var open = value.indexOf("(") + 1, close = value.indexOf(")"), nested = value.indexOf("(", open);
    return value.substring(open, ~nested && nested < close ? value.indexOf(")", close + 1) : close);
  };
  var _configEaseFromString = function _configEaseFromString2(name) {
    var split2 = (name + "").split("("), ease = _easeMap[split2[0]];
    return ease && split2.length > 1 && ease.config ? ease.config.apply(null, ~name.indexOf("{") ? [_parseObjectInString(split2[1])] : _valueInParentheses(name).split(",").map(_numericIfPossible)) : _easeMap._CE && _customEaseExp.test(name) ? _easeMap._CE("", name) : ease;
  };
  var _invertEase = function _invertEase2(ease) {
    return function(p) {
      return 1 - ease(1 - p);
    };
  };
  var _propagateYoyoEase = function _propagateYoyoEase2(timeline2, isYoyo) {
    var child = timeline2._first, ease;
    while (child) {
      if (child instanceof Timeline) {
        _propagateYoyoEase2(child, isYoyo);
      } else if (child.vars.yoyoEase && (!child._yoyo || !child._repeat) && child._yoyo !== isYoyo) {
        if (child.timeline) {
          _propagateYoyoEase2(child.timeline, isYoyo);
        } else {
          ease = child._ease;
          child._ease = child._yEase;
          child._yEase = ease;
          child._yoyo = isYoyo;
        }
      }
      child = child._next;
    }
  };
  var _parseEase = function _parseEase2(ease, defaultEase) {
    return !ease ? defaultEase : (_isFunction(ease) ? ease : _easeMap[ease] || _configEaseFromString(ease)) || defaultEase;
  };
  var _insertEase = function _insertEase2(names, easeIn, easeOut, easeInOut) {
    if (easeOut === void 0) {
      easeOut = function easeOut2(p) {
        return 1 - easeIn(1 - p);
      };
    }
    if (easeInOut === void 0) {
      easeInOut = function easeInOut2(p) {
        return p < 0.5 ? easeIn(p * 2) / 2 : 1 - easeIn((1 - p) * 2) / 2;
      };
    }
    var ease = {
      easeIn,
      easeOut,
      easeInOut
    }, lowercaseName;
    _forEachName(names, function(name) {
      _easeMap[name] = _globals[name] = ease;
      _easeMap[lowercaseName = name.toLowerCase()] = easeOut;
      for (var p in ease) {
        _easeMap[lowercaseName + (p === "easeIn" ? ".in" : p === "easeOut" ? ".out" : ".inOut")] = _easeMap[name + "." + p] = ease[p];
      }
    });
    return ease;
  };
  var _easeInOutFromOut = function _easeInOutFromOut2(easeOut) {
    return function(p) {
      return p < 0.5 ? (1 - easeOut(1 - p * 2)) / 2 : 0.5 + easeOut((p - 0.5) * 2) / 2;
    };
  };
  var _configElastic = function _configElastic2(type, amplitude, period) {
    var p1 = amplitude >= 1 ? amplitude : 1, p2 = (period || (type ? 0.3 : 0.45)) / (amplitude < 1 ? amplitude : 1), p3 = p2 / _2PI * (Math.asin(1 / p1) || 0), easeOut = function easeOut2(p) {
      return p === 1 ? 1 : p1 * Math.pow(2, -10 * p) * _sin((p - p3) * p2) + 1;
    }, ease = type === "out" ? easeOut : type === "in" ? function(p) {
      return 1 - easeOut(1 - p);
    } : _easeInOutFromOut(easeOut);
    p2 = _2PI / p2;
    ease.config = function(amplitude2, period2) {
      return _configElastic2(type, amplitude2, period2);
    };
    return ease;
  };
  var _configBack = function _configBack2(type, overshoot) {
    if (overshoot === void 0) {
      overshoot = 1.70158;
    }
    var easeOut = function easeOut2(p) {
      return p ? --p * p * ((overshoot + 1) * p + overshoot) + 1 : 0;
    }, ease = type === "out" ? easeOut : type === "in" ? function(p) {
      return 1 - easeOut(1 - p);
    } : _easeInOutFromOut(easeOut);
    ease.config = function(overshoot2) {
      return _configBack2(type, overshoot2);
    };
    return ease;
  };
  _forEachName("Linear,Quad,Cubic,Quart,Quint,Strong", function(name, i) {
    var power = i < 5 ? i + 1 : i;
    _insertEase(name + ",Power" + (power - 1), i ? function(p) {
      return Math.pow(p, power);
    } : function(p) {
      return p;
    }, function(p) {
      return 1 - Math.pow(1 - p, power);
    }, function(p) {
      return p < 0.5 ? Math.pow(p * 2, power) / 2 : 1 - Math.pow((1 - p) * 2, power) / 2;
    });
  });
  _easeMap.Linear.easeNone = _easeMap.none = _easeMap.Linear.easeIn;
  _insertEase("Elastic", _configElastic("in"), _configElastic("out"), _configElastic());
  (function(n, c) {
    var n1 = 1 / c, n2 = 2 * n1, n3 = 2.5 * n1, easeOut = function easeOut2(p) {
      return p < n1 ? n * p * p : p < n2 ? n * Math.pow(p - 1.5 / c, 2) + 0.75 : p < n3 ? n * (p -= 2.25 / c) * p + 0.9375 : n * Math.pow(p - 2.625 / c, 2) + 0.984375;
    };
    _insertEase("Bounce", function(p) {
      return 1 - easeOut(1 - p);
    }, easeOut);
  })(7.5625, 2.75);
  _insertEase("Expo", function(p) {
    return Math.pow(2, 10 * (p - 1)) * p + p * p * p * p * p * p * (1 - p);
  });
  _insertEase("Circ", function(p) {
    return -(_sqrt(1 - p * p) - 1);
  });
  _insertEase("Sine", function(p) {
    return p === 1 ? 1 : -_cos(p * _HALF_PI) + 1;
  });
  _insertEase("Back", _configBack("in"), _configBack("out"), _configBack());
  _easeMap.SteppedEase = _easeMap.steps = _globals.SteppedEase = {
    config: function config(steps, immediateStart) {
      if (steps === void 0) {
        steps = 1;
      }
      var p1 = 1 / steps, p2 = steps + (immediateStart ? 0 : 1), p3 = immediateStart ? 1 : 0, max2 = 1 - _tinyNum;
      return function(p) {
        return ((p2 * _clamp(0, max2, p) | 0) + p3) * p1;
      };
    }
  };
  _defaults.ease = _easeMap["quad.out"];
  _forEachName("onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt", function(name) {
    return _callbackNames += name + "," + name + "Params,";
  });
  var GSCache = function GSCache2(target, harness) {
    this.id = _gsID++;
    target._gsap = this;
    this.target = target;
    this.harness = harness;
    this.get = harness ? harness.get : _getProperty;
    this.set = harness ? harness.getSetter : _getSetter;
  };
  var Animation = /* @__PURE__ */ (function() {
    function Animation2(vars) {
      this.vars = vars;
      this._delay = +vars.delay || 0;
      if (this._repeat = vars.repeat === Infinity ? -2 : vars.repeat || 0) {
        this._rDelay = vars.repeatDelay || 0;
        this._yoyo = !!vars.yoyo || !!vars.yoyoEase;
      }
      this._ts = 1;
      _setDuration(this, +vars.duration, 1, 1);
      this.data = vars.data;
      if (_context) {
        this._ctx = _context;
        _context.data.push(this);
      }
      _tickerActive || _ticker.wake();
    }
    var _proto = Animation2.prototype;
    _proto.delay = function delay(value) {
      if (value || value === 0) {
        this.parent && this.parent.smoothChildTiming && this.startTime(this._start + value - this._delay);
        this._delay = value;
        return this;
      }
      return this._delay;
    };
    _proto.duration = function duration(value) {
      return arguments.length ? this.totalDuration(this._repeat > 0 ? value + (value + this._rDelay) * this._repeat : value) : this.totalDuration() && this._dur;
    };
    _proto.totalDuration = function totalDuration(value) {
      if (!arguments.length) {
        return this._tDur;
      }
      this._dirty = 0;
      return _setDuration(this, this._repeat < 0 ? value : (value - this._repeat * this._rDelay) / (this._repeat + 1));
    };
    _proto.totalTime = function totalTime(_totalTime, suppressEvents) {
      _wake();
      if (!arguments.length) {
        return this._tTime;
      }
      var parent = this._dp;
      if (parent && parent.smoothChildTiming && this._ts) {
        _alignPlayhead(this, _totalTime);
        !parent._dp || parent.parent || _postAddChecks(parent, this);
        while (parent && parent.parent) {
          if (parent.parent._time !== parent._start + (parent._ts >= 0 ? parent._tTime / parent._ts : (parent.totalDuration() - parent._tTime) / -parent._ts)) {
            parent.totalTime(parent._tTime, true);
          }
          parent = parent.parent;
        }
        if (!this.parent && this._dp.autoRemoveChildren && (this._ts > 0 && _totalTime < this._tDur || this._ts < 0 && _totalTime > 0 || !this._tDur && !_totalTime)) {
          _addToTimeline(this._dp, this, this._start - this._delay);
        }
      }
      if (this._tTime !== _totalTime || !this._dur && !suppressEvents || this._initted && Math.abs(this._zTime) === _tinyNum || !this._initted && this._dur && _totalTime || !_totalTime && !this._initted && (this.add || this._ptLookup)) {
        this._ts || (this._pTime = _totalTime);
        _lazySafeRender(this, _totalTime, suppressEvents);
      }
      return this;
    };
    _proto.time = function time(value, suppressEvents) {
      return arguments.length ? this.totalTime(Math.min(this.totalDuration(), value + _elapsedCycleDuration(this)) % (this._dur + this._rDelay) || (value ? this._dur : 0), suppressEvents) : this._time;
    };
    _proto.totalProgress = function totalProgress(value, suppressEvents) {
      return arguments.length ? this.totalTime(this.totalDuration() * value, suppressEvents) : this.totalDuration() ? Math.min(1, this._tTime / this._tDur) : this.rawTime() >= 0 && this._initted ? 1 : 0;
    };
    _proto.progress = function progress2(value, suppressEvents) {
      return arguments.length ? this.totalTime(this.duration() * (this._yoyo && !(this.iteration() & 1) ? 1 - value : value) + _elapsedCycleDuration(this), suppressEvents) : this.duration() ? Math.min(1, this._time / this._dur) : this.rawTime() > 0 ? 1 : 0;
    };
    _proto.iteration = function iteration(value, suppressEvents) {
      var cycleDuration = this.duration() + this._rDelay;
      return arguments.length ? this.totalTime(this._time + (value - 1) * cycleDuration, suppressEvents) : this._repeat ? _animationCycle(this._tTime, cycleDuration) + 1 : 1;
    };
    _proto.timeScale = function timeScale(value, suppressEvents) {
      if (!arguments.length) {
        return this._rts === -_tinyNum ? 0 : this._rts;
      }
      if (this._rts === value) {
        return this;
      }
      var tTime = this.parent && this._ts ? _parentToChildTotalTime(this.parent._time, this) : this._tTime;
      this._rts = +value || 0;
      this._ts = this._ps || value === -_tinyNum ? 0 : this._rts;
      this.totalTime(_clamp(-Math.abs(this._delay), this.totalDuration(), tTime), suppressEvents !== false);
      _setEnd(this);
      return _recacheAncestors(this);
    };
    _proto.paused = function paused(value) {
      if (!arguments.length) {
        return this._ps;
      }
      if (this._ps !== value) {
        this._ps = value;
        if (value) {
          this._pTime = this._tTime || Math.max(-this._delay, this.rawTime());
          this._ts = this._act = 0;
        } else {
          _wake();
          this._ts = this._rts;
          this.totalTime(this.parent && !this.parent.smoothChildTiming ? this.rawTime() : this._tTime || this._pTime, this.progress() === 1 && Math.abs(this._zTime) !== _tinyNum && (this._tTime -= _tinyNum));
        }
      }
      return this;
    };
    _proto.startTime = function startTime(value) {
      if (arguments.length) {
        this._start = _roundPrecise(value);
        var parent = this.parent || this._dp;
        parent && (parent._sort || !this.parent) && _addToTimeline(parent, this, this._start - this._delay);
        return this;
      }
      return this._start;
    };
    _proto.endTime = function endTime(includeRepeats) {
      return this._start + (_isNotFalse(includeRepeats) ? this.totalDuration() : this.duration()) / Math.abs(this._ts || 1);
    };
    _proto.rawTime = function rawTime(wrapRepeats) {
      var parent = this.parent || this._dp;
      return !parent ? this._tTime : wrapRepeats && (!this._ts || this._repeat && this._time && this.totalProgress() < 1) ? this._tTime % (this._dur + this._rDelay) : !this._ts ? this._tTime : _parentToChildTotalTime(parent.rawTime(wrapRepeats), this);
    };
    _proto.revert = function revert(config3) {
      if (config3 === void 0) {
        config3 = _revertConfig;
      }
      var prevIsReverting = _reverting;
      _reverting = config3;
      if (_isRevertWorthy(this)) {
        this.timeline && this.timeline.revert(config3);
        this.totalTime(-0.01, config3.suppressEvents);
      }
      this.data !== "nested" && config3.kill !== false && this.kill();
      _reverting = prevIsReverting;
      return this;
    };
    _proto.globalTime = function globalTime(rawTime) {
      var animation = this, time = arguments.length ? rawTime : animation.rawTime();
      while (animation) {
        time = animation._start + time / (Math.abs(animation._ts) || 1);
        animation = animation._dp;
      }
      return !this.parent && this._sat ? this._sat.globalTime(rawTime) : time;
    };
    _proto.repeat = function repeat(value) {
      if (arguments.length) {
        this._repeat = value === Infinity ? -2 : value;
        return _onUpdateTotalDuration(this);
      }
      return this._repeat === -2 ? Infinity : this._repeat;
    };
    _proto.repeatDelay = function repeatDelay(value) {
      if (arguments.length) {
        var time = this._time;
        this._rDelay = value;
        _onUpdateTotalDuration(this);
        return time ? this.time(time) : this;
      }
      return this._rDelay;
    };
    _proto.yoyo = function yoyo(value) {
      if (arguments.length) {
        this._yoyo = value;
        return this;
      }
      return this._yoyo;
    };
    _proto.seek = function seek(position, suppressEvents) {
      return this.totalTime(_parsePosition(this, position), _isNotFalse(suppressEvents));
    };
    _proto.restart = function restart(includeDelay, suppressEvents) {
      this.play().totalTime(includeDelay ? -this._delay : 0, _isNotFalse(suppressEvents));
      this._dur || (this._zTime = -_tinyNum);
      return this;
    };
    _proto.play = function play(from, suppressEvents) {
      from != null && this.seek(from, suppressEvents);
      return this.reversed(false).paused(false);
    };
    _proto.reverse = function reverse(from, suppressEvents) {
      from != null && this.seek(from || this.totalDuration(), suppressEvents);
      return this.reversed(true).paused(false);
    };
    _proto.pause = function pause(atTime, suppressEvents) {
      atTime != null && this.seek(atTime, suppressEvents);
      return this.paused(true);
    };
    _proto.resume = function resume() {
      return this.paused(false);
    };
    _proto.reversed = function reversed(value) {
      if (arguments.length) {
        !!value !== this.reversed() && this.timeScale(-this._rts || (value ? -_tinyNum : 0));
        return this;
      }
      return this._rts < 0;
    };
    _proto.invalidate = function invalidate() {
      this._initted = this._act = 0;
      this._zTime = -_tinyNum;
      return this;
    };
    _proto.isActive = function isActive() {
      var parent = this.parent || this._dp, start = this._start, rawTime;
      return !!(!parent || this._ts && this._initted && parent.isActive() && (rawTime = parent.rawTime(true)) >= start && rawTime < this.endTime(true) - _tinyNum);
    };
    _proto.eventCallback = function eventCallback(type, callback, params) {
      var vars = this.vars;
      if (arguments.length > 1) {
        if (!callback) {
          delete vars[type];
        } else {
          vars[type] = callback;
          params && (vars[type + "Params"] = params);
          type === "onUpdate" && (this._onUpdate = callback);
        }
        return this;
      }
      return vars[type];
    };
    _proto.then = function then(onFulfilled) {
      var self = this, prevProm = self._prom;
      return new Promise(function(resolve) {
        var f = _isFunction(onFulfilled) ? onFulfilled : _passThrough, _resolve = function _resolve2() {
          var _then = self.then;
          self.then = null;
          prevProm && prevProm();
          _isFunction(f) && (f = f(self)) && (f.then || f === self) && (self.then = _then);
          resolve(f);
          self.then = _then;
        };
        if (self._initted && self.totalProgress() === 1 && self._ts >= 0 || !self._tTime && self._ts < 0) {
          _resolve();
        } else {
          self._prom = _resolve;
        }
      });
    };
    _proto.kill = function kill() {
      _interrupt(this);
    };
    return Animation2;
  })();
  _setDefaults(Animation.prototype, {
    _time: 0,
    _start: 0,
    _end: 0,
    _tTime: 0,
    _tDur: 0,
    _dirty: 0,
    _repeat: 0,
    _yoyo: false,
    parent: null,
    _initted: false,
    _rDelay: 0,
    _ts: 1,
    _dp: 0,
    ratio: 0,
    _zTime: -_tinyNum,
    _prom: 0,
    _ps: false,
    _rts: 1
  });
  var Timeline = /* @__PURE__ */ (function(_Animation) {
    _inheritsLoose(Timeline2, _Animation);
    function Timeline2(vars, position) {
      var _this;
      if (vars === void 0) {
        vars = {};
      }
      _this = _Animation.call(this, vars) || this;
      _this.labels = {};
      _this.smoothChildTiming = !!vars.smoothChildTiming;
      _this.autoRemoveChildren = !!vars.autoRemoveChildren;
      _this._sort = _isNotFalse(vars.sortChildren);
      _globalTimeline && _addToTimeline(vars.parent || _globalTimeline, _assertThisInitialized(_this), position);
      vars.reversed && _this.reverse();
      vars.paused && _this.paused(true);
      vars.scrollTrigger && _scrollTrigger(_assertThisInitialized(_this), vars.scrollTrigger);
      return _this;
    }
    var _proto2 = Timeline2.prototype;
    _proto2.to = function to(targets, vars, position) {
      _createTweenType(0, arguments, this);
      return this;
    };
    _proto2.from = function from(targets, vars, position) {
      _createTweenType(1, arguments, this);
      return this;
    };
    _proto2.fromTo = function fromTo(targets, fromVars, toVars, position) {
      _createTweenType(2, arguments, this);
      return this;
    };
    _proto2.set = function set(targets, vars, position) {
      vars.duration = 0;
      vars.parent = this;
      _inheritDefaults(vars).repeatDelay || (vars.repeat = 0);
      vars.immediateRender = !!vars.immediateRender;
      new Tween(targets, vars, _parsePosition(this, position), 1);
      return this;
    };
    _proto2.call = function call(callback, params, position) {
      return _addToTimeline(this, Tween.delayedCall(0, callback, params), position);
    };
    _proto2.staggerTo = function staggerTo(targets, duration, vars, stagger2, position, onCompleteAll, onCompleteAllParams) {
      vars.duration = duration;
      vars.stagger = vars.stagger || stagger2;
      vars.onComplete = onCompleteAll;
      vars.onCompleteParams = onCompleteAllParams;
      vars.parent = this;
      new Tween(targets, vars, _parsePosition(this, position));
      return this;
    };
    _proto2.staggerFrom = function staggerFrom(targets, duration, vars, stagger2, position, onCompleteAll, onCompleteAllParams) {
      vars.runBackwards = 1;
      _inheritDefaults(vars).immediateRender = _isNotFalse(vars.immediateRender);
      return this.staggerTo(targets, duration, vars, stagger2, position, onCompleteAll, onCompleteAllParams);
    };
    _proto2.staggerFromTo = function staggerFromTo(targets, duration, fromVars, toVars, stagger2, position, onCompleteAll, onCompleteAllParams) {
      toVars.startAt = fromVars;
      _inheritDefaults(toVars).immediateRender = _isNotFalse(toVars.immediateRender);
      return this.staggerTo(targets, duration, toVars, stagger2, position, onCompleteAll, onCompleteAllParams);
    };
    _proto2.render = function render4(totalTime, suppressEvents, force) {
      var prevTime = this._time, tDur = this._dirty ? this.totalDuration() : this._tDur, dur = this._dur, tTime = totalTime <= 0 ? 0 : _roundPrecise(totalTime), crossingStart = this._zTime < 0 !== totalTime < 0 && (this._initted || !dur), time, child, next, iteration, cycleDuration, prevPaused, pauseTween, timeScale, prevStart, prevIteration, yoyo, isYoyo;
      this !== _globalTimeline && tTime > tDur && totalTime >= 0 && (tTime = tDur);
      if (tTime !== this._tTime || force || crossingStart) {
        if (prevTime !== this._time && dur) {
          tTime += this._time - prevTime;
          totalTime += this._time - prevTime;
        }
        time = tTime;
        prevStart = this._start;
        timeScale = this._ts;
        prevPaused = !timeScale;
        if (crossingStart) {
          dur || (prevTime = this._zTime);
          (totalTime || !suppressEvents) && (this._zTime = totalTime);
        }
        if (this._repeat) {
          yoyo = this._yoyo;
          cycleDuration = dur + this._rDelay;
          if (this._repeat < -1 && totalTime < 0) {
            return this.totalTime(cycleDuration * 100 + totalTime, suppressEvents, force);
          }
          time = _roundPrecise(tTime % cycleDuration);
          if (tTime === tDur) {
            iteration = this._repeat;
            time = dur;
          } else {
            prevIteration = _roundPrecise(tTime / cycleDuration);
            iteration = ~~prevIteration;
            if (iteration && iteration === prevIteration) {
              time = dur;
              iteration--;
            }
            time > dur && (time = dur);
          }
          prevIteration = _animationCycle(this._tTime, cycleDuration);
          !prevTime && this._tTime && prevIteration !== iteration && this._tTime - prevIteration * cycleDuration - this._dur <= 0 && (prevIteration = iteration);
          if (yoyo && iteration & 1) {
            time = dur - time;
            isYoyo = 1;
          }
          if (iteration !== prevIteration && !this._lock) {
            var rewinding = yoyo && prevIteration & 1, doesWrap = rewinding === (yoyo && iteration & 1);
            iteration < prevIteration && (rewinding = !rewinding);
            prevTime = rewinding ? 0 : tTime % dur ? dur : tTime;
            this._lock = 1;
            this.render(prevTime || (isYoyo ? 0 : _roundPrecise(iteration * cycleDuration)), suppressEvents, !dur)._lock = 0;
            this._tTime = tTime;
            !suppressEvents && this.parent && _callback(this, "onRepeat");
            if (this.vars.repeatRefresh && !isYoyo) {
              this.invalidate()._lock = 1;
              prevIteration = iteration;
            }
            if (prevTime && prevTime !== this._time || prevPaused !== !this._ts || this.vars.onRepeat && !this.parent && !this._act) {
              return this;
            }
            dur = this._dur;
            tDur = this._tDur;
            if (doesWrap) {
              this._lock = 2;
              prevTime = rewinding ? dur : -1e-4;
              this.render(prevTime, true);
              this.vars.repeatRefresh && !isYoyo && this.invalidate();
            }
            this._lock = 0;
            if (!this._ts && !prevPaused) {
              return this;
            }
            _propagateYoyoEase(this, isYoyo);
          }
        }
        if (this._hasPause && !this._forcing && this._lock < 2) {
          pauseTween = _findNextPauseTween(this, _roundPrecise(prevTime), _roundPrecise(time));
          if (pauseTween) {
            tTime -= time - (time = pauseTween._start);
          }
        }
        this._tTime = tTime;
        this._time = time;
        this._act = !timeScale;
        if (!this._initted) {
          this._onUpdate = this.vars.onUpdate;
          this._initted = 1;
          this._zTime = totalTime;
          prevTime = 0;
        }
        if (!prevTime && tTime && dur && !suppressEvents && !prevIteration) {
          _callback(this, "onStart");
          if (this._tTime !== tTime) {
            return this;
          }
        }
        if (time >= prevTime && totalTime >= 0) {
          child = this._first;
          while (child) {
            next = child._next;
            if ((child._act || time >= child._start) && child._ts && pauseTween !== child) {
              if (child.parent !== this) {
                return this.render(totalTime, suppressEvents, force);
              }
              child.render(child._ts > 0 ? (time - child._start) * child._ts : (child._dirty ? child.totalDuration() : child._tDur) + (time - child._start) * child._ts, suppressEvents, force);
              if (time !== this._time || !this._ts && !prevPaused) {
                pauseTween = 0;
                next && (tTime += this._zTime = -_tinyNum);
                break;
              }
            }
            child = next;
          }
        } else {
          child = this._last;
          var adjustedTime = totalTime < 0 ? totalTime : time;
          while (child) {
            next = child._prev;
            if ((child._act || adjustedTime <= child._end) && child._ts && pauseTween !== child) {
              if (child.parent !== this) {
                return this.render(totalTime, suppressEvents, force);
              }
              child.render(child._ts > 0 ? (adjustedTime - child._start) * child._ts : (child._dirty ? child.totalDuration() : child._tDur) + (adjustedTime - child._start) * child._ts, suppressEvents, force || _reverting && _isRevertWorthy(child));
              if (time !== this._time || !this._ts && !prevPaused) {
                pauseTween = 0;
                next && (tTime += this._zTime = adjustedTime ? -_tinyNum : _tinyNum);
                break;
              }
            }
            child = next;
          }
        }
        if (pauseTween && !suppressEvents) {
          this.pause();
          pauseTween.render(time >= prevTime ? 0 : -_tinyNum)._zTime = time >= prevTime ? 1 : -1;
          if (this._ts) {
            this._start = prevStart;
            _setEnd(this);
            return this.render(totalTime, suppressEvents, force);
          }
        }
        this._onUpdate && !suppressEvents && _callback(this, "onUpdate", true);
        if (tTime === tDur && this._tTime >= this.totalDuration() || !tTime && prevTime) {
          if (prevStart === this._start || Math.abs(timeScale) !== Math.abs(this._ts)) {
            if (!this._lock) {
              (totalTime || !dur) && (tTime === tDur && this._ts > 0 || !tTime && this._ts < 0) && _removeFromParent(this, 1);
              if (!suppressEvents && !(totalTime < 0 && !prevTime) && (tTime || prevTime || !tDur)) {
                _callback(this, tTime === tDur && totalTime >= 0 ? "onComplete" : "onReverseComplete", true);
                this._prom && !(tTime < tDur && this.timeScale() > 0) && this._prom();
              }
            }
          }
        }
      }
      return this;
    };
    _proto2.add = function add(child, position) {
      var _this2 = this;
      _isNumber(position) || (position = _parsePosition(this, position, child));
      if (!(child instanceof Animation)) {
        if (_isArray(child)) {
          child.forEach(function(obj) {
            return _this2.add(obj, position);
          });
          return this;
        }
        if (_isString(child)) {
          return this.addLabel(child, position);
        }
        if (_isFunction(child)) {
          child = Tween.delayedCall(0, child);
        } else {
          return this;
        }
      }
      return this !== child ? _addToTimeline(this, child, position) : this;
    };
    _proto2.getChildren = function getChildren(nested, tweens, timelines, ignoreBeforeTime) {
      if (nested === void 0) {
        nested = true;
      }
      if (tweens === void 0) {
        tweens = true;
      }
      if (timelines === void 0) {
        timelines = true;
      }
      if (ignoreBeforeTime === void 0) {
        ignoreBeforeTime = -_bigNum;
      }
      var a = [], child = this._first;
      while (child) {
        if (child._start >= ignoreBeforeTime) {
          if (child instanceof Tween) {
            tweens && a.push(child);
          } else {
            timelines && a.push(child);
            nested && a.push.apply(a, child.getChildren(true, tweens, timelines));
          }
        }
        child = child._next;
      }
      return a;
    };
    _proto2.getById = function getById2(id) {
      var animations = this.getChildren(1, 1, 1), i = animations.length;
      while (i--) {
        if (animations[i].vars.id === id) {
          return animations[i];
        }
      }
    };
    _proto2.remove = function remove(child) {
      if (_isString(child)) {
        return this.removeLabel(child);
      }
      if (_isFunction(child)) {
        return this.killTweensOf(child);
      }
      child.parent === this && _removeLinkedListItem(this, child);
      if (child === this._recent) {
        this._recent = this._last;
      }
      return _uncache(this);
    };
    _proto2.totalTime = function totalTime(_totalTime2, suppressEvents) {
      if (!arguments.length) {
        return this._tTime;
      }
      this._forcing = 1;
      if (!this._dp && this._ts) {
        this._start = _roundPrecise(_ticker.time - (this._ts > 0 ? _totalTime2 / this._ts : (this.totalDuration() - _totalTime2) / -this._ts));
      }
      _Animation.prototype.totalTime.call(this, _totalTime2, suppressEvents);
      this._forcing = 0;
      return this;
    };
    _proto2.addLabel = function addLabel(label, position) {
      this.labels[label] = _parsePosition(this, position);
      return this;
    };
    _proto2.removeLabel = function removeLabel(label) {
      delete this.labels[label];
      return this;
    };
    _proto2.addPause = function addPause(position, callback, params) {
      var t = Tween.delayedCall(0, callback || _emptyFunc, params);
      t.data = "isPause";
      this._hasPause = 1;
      return _addToTimeline(this, t, _parsePosition(this, position));
    };
    _proto2.removePause = function removePause(position) {
      var child = this._first;
      position = _parsePosition(this, position);
      while (child) {
        if (child._start === position && child.data === "isPause") {
          _removeFromParent(child);
        }
        child = child._next;
      }
    };
    _proto2.killTweensOf = function killTweensOf(targets, props, onlyActive) {
      var tweens = this.getTweensOf(targets, onlyActive), i = tweens.length;
      while (i--) {
        _overwritingTween !== tweens[i] && tweens[i].kill(targets, props);
      }
      return this;
    };
    _proto2.getTweensOf = function getTweensOf2(targets, onlyActive) {
      var a = [], parsedTargets = toArray(targets), child = this._first, isGlobalTime = _isNumber(onlyActive), children;
      while (child) {
        if (child instanceof Tween) {
          if (_arrayContainsAny(child._targets, parsedTargets) && (isGlobalTime ? (!_overwritingTween || child._initted && child._ts) && child.globalTime(0) <= onlyActive && child.globalTime(child.totalDuration()) > onlyActive : !onlyActive || child.isActive())) {
            a.push(child);
          }
        } else if ((children = child.getTweensOf(parsedTargets, onlyActive)).length) {
          a.push.apply(a, children);
        }
        child = child._next;
      }
      return a;
    };
    _proto2.tweenTo = function tweenTo(position, vars) {
      vars = vars || {};
      var tl = this, endTime = _parsePosition(tl, position), _vars = vars, startAt = _vars.startAt, _onStart = _vars.onStart, onStartParams = _vars.onStartParams, immediateRender = _vars.immediateRender, initted, tween = Tween.to(tl, _setDefaults({
        ease: vars.ease || "none",
        lazy: false,
        immediateRender: false,
        time: endTime,
        overwrite: "auto",
        duration: vars.duration || Math.abs((endTime - (startAt && "time" in startAt ? startAt.time : tl._time)) / tl.timeScale()) || _tinyNum,
        onStart: function onStart() {
          tl.pause();
          if (!initted) {
            var duration = vars.duration || Math.abs((endTime - (startAt && "time" in startAt ? startAt.time : tl._time)) / tl.timeScale());
            tween._dur !== duration && _setDuration(tween, duration, 0, 1).render(tween._time, true, true);
            initted = 1;
          }
          _onStart && _onStart.apply(tween, onStartParams || []);
        }
      }, vars));
      return immediateRender ? tween.render(0) : tween;
    };
    _proto2.tweenFromTo = function tweenFromTo(fromPosition, toPosition, vars) {
      return this.tweenTo(toPosition, _setDefaults({
        startAt: {
          time: _parsePosition(this, fromPosition)
        }
      }, vars));
    };
    _proto2.recent = function recent() {
      return this._recent;
    };
    _proto2.nextLabel = function nextLabel(afterTime) {
      if (afterTime === void 0) {
        afterTime = this._time;
      }
      return _getLabelInDirection(this, _parsePosition(this, afterTime));
    };
    _proto2.previousLabel = function previousLabel(beforeTime) {
      if (beforeTime === void 0) {
        beforeTime = this._time;
      }
      return _getLabelInDirection(this, _parsePosition(this, beforeTime), 1);
    };
    _proto2.currentLabel = function currentLabel(value) {
      return arguments.length ? this.seek(value, true) : this.previousLabel(this._time + _tinyNum);
    };
    _proto2.shiftChildren = function shiftChildren(amount, adjustLabels, ignoreBeforeTime) {
      if (ignoreBeforeTime === void 0) {
        ignoreBeforeTime = 0;
      }
      var child = this._first, labels = this.labels, p;
      amount = _roundPrecise(amount);
      while (child) {
        if (child._start >= ignoreBeforeTime) {
          child._start += amount;
          child._end += amount;
        }
        child = child._next;
      }
      if (adjustLabels) {
        for (p in labels) {
          if (labels[p] >= ignoreBeforeTime) {
            labels[p] += amount;
          }
        }
      }
      return _uncache(this);
    };
    _proto2.invalidate = function invalidate(soft) {
      var child = this._first;
      this._lock = 0;
      while (child) {
        child.invalidate(soft);
        child = child._next;
      }
      return _Animation.prototype.invalidate.call(this, soft);
    };
    _proto2.clear = function clear(includeLabels) {
      if (includeLabels === void 0) {
        includeLabels = true;
      }
      var child = this._first, next;
      while (child) {
        next = child._next;
        this.remove(child);
        child = next;
      }
      this._dp && (this._time = this._tTime = this._pTime = 0);
      includeLabels && (this.labels = {});
      return _uncache(this);
    };
    _proto2.totalDuration = function totalDuration(value) {
      var max2 = 0, self = this, child = self._last, prevStart = _bigNum, prev, start, parent;
      if (arguments.length) {
        return self.timeScale((self._repeat < 0 ? self.duration() : self.totalDuration()) / (self.reversed() ? -value : value));
      }
      if (self._dirty) {
        parent = self.parent;
        while (child) {
          prev = child._prev;
          child._dirty && child.totalDuration();
          start = child._start;
          if (start > prevStart && self._sort && child._ts && !self._lock) {
            self._lock = 1;
            _addToTimeline(self, child, start - child._delay, 1)._lock = 0;
          } else {
            prevStart = start;
          }
          if (start < 0 && child._ts) {
            max2 -= start;
            if (!parent && !self._dp || parent && parent.smoothChildTiming) {
              self._start += _roundPrecise(start / self._ts);
              self._time -= start;
              self._tTime -= start;
            }
            self.shiftChildren(-start, false, -Infinity);
            prevStart = 0;
          }
          child._end > max2 && child._ts && (max2 = child._end);
          child = prev;
        }
        _setDuration(self, self === _globalTimeline && self._time > max2 ? self._time : max2, 1, 1);
        self._dirty = 0;
      }
      return self._tDur;
    };
    Timeline2.updateRoot = function updateRoot(time) {
      if (_globalTimeline._ts) {
        _lazySafeRender(_globalTimeline, _parentToChildTotalTime(time, _globalTimeline));
        _lastRenderedFrame = _ticker.frame;
      }
      if (_ticker.frame >= _nextGCFrame) {
        _nextGCFrame += _config.autoSleep || 120;
        var child = _globalTimeline._first;
        if (!child || !child._ts) {
          if (_config.autoSleep && _ticker._listeners.length < 2) {
            while (child && !child._ts) {
              child = child._next;
            }
            child || _ticker.sleep();
          }
        }
      }
    };
    return Timeline2;
  })(Animation);
  _setDefaults(Timeline.prototype, {
    _lock: 0,
    _hasPause: 0,
    _forcing: 0
  });
  var _addComplexStringPropTween = function _addComplexStringPropTween2(target, prop, start, end, setter, stringFilter, funcParam) {
    var pt = new PropTween(this._pt, target, prop, 0, 1, _renderComplexString, null, setter), index = 0, matchIndex = 0, result, startNums, color2, endNum, chunk, startNum, hasRandom, a;
    pt.b = start;
    pt.e = end;
    start += "";
    end += "";
    if (hasRandom = ~end.indexOf("random(")) {
      end = _replaceRandom(end);
    }
    if (stringFilter) {
      a = [start, end];
      stringFilter(a, target, prop);
      start = a[0];
      end = a[1];
    }
    startNums = start.match(_complexStringNumExp) || [];
    while (result = _complexStringNumExp.exec(end)) {
      endNum = result[0];
      chunk = end.substring(index, result.index);
      if (color2) {
        color2 = (color2 + 1) % 5;
      } else if (chunk.substr(-5) === "rgba(") {
        color2 = 1;
      }
      if (endNum !== startNums[matchIndex++]) {
        startNum = parseFloat(startNums[matchIndex - 1]) || 0;
        pt._pt = {
          _next: pt._pt,
          p: chunk || matchIndex === 1 ? chunk : ",",
          //note: SVG spec allows omission of comma/space when a negative sign is wedged between two numbers, like 2.5-5.3 instead of 2.5,-5.3 but when tweening, the negative value may switch to positive, so we insert the comma just in case.
          s: startNum,
          c: endNum.charAt(1) === "=" ? _parseRelative(startNum, endNum) - startNum : parseFloat(endNum) - startNum,
          m: color2 && color2 < 4 ? Math.round : 0
        };
        index = _complexStringNumExp.lastIndex;
      }
    }
    pt.c = index < end.length ? end.substring(index, end.length) : "";
    pt.fp = funcParam;
    if (_relExp.test(end) || hasRandom) {
      pt.e = 0;
    }
    this._pt = pt;
    return pt;
  };
  var _addPropTween = function _addPropTween2(target, prop, start, end, index, targets, modifier, stringFilter, funcParam, optional) {
    _isFunction(end) && (end = end(index || 0, target, targets));
    var currentValue = target[prop], parsedStart = start !== "get" ? start : !_isFunction(currentValue) ? currentValue : funcParam ? target[prop.indexOf("set") || !_isFunction(target["get" + prop.substr(3)]) ? prop : "get" + prop.substr(3)](funcParam) : target[prop](), setter = !_isFunction(currentValue) ? _setterPlain : funcParam ? _setterFuncWithParam : _setterFunc, pt;
    if (_isString(end)) {
      if (~end.indexOf("random(")) {
        end = _replaceRandom(end);
      }
      if (end.charAt(1) === "=") {
        pt = _parseRelative(parsedStart, end) + (getUnit(parsedStart) || 0);
        if (pt || pt === 0) {
          end = pt;
        }
      }
    }
    if (!optional || parsedStart !== end || _forceAllPropTweens) {
      if (!isNaN(parsedStart * end) && end !== "") {
        pt = new PropTween(this._pt, target, prop, +parsedStart || 0, end - (parsedStart || 0), typeof currentValue === "boolean" ? _renderBoolean : _renderPlain, 0, setter);
        funcParam && (pt.fp = funcParam);
        modifier && pt.modifier(modifier, this, target);
        return this._pt = pt;
      }
      !currentValue && !(prop in target) && _missingPlugin(prop, end);
      return _addComplexStringPropTween.call(this, target, prop, parsedStart, end, setter, stringFilter || _config.stringFilter, funcParam);
    }
  };
  var _processVars = function _processVars2(vars, index, target, targets, tween) {
    _isFunction(vars) && (vars = _parseFuncOrString(vars, tween, index, target, targets));
    if (!_isObject(vars) || vars.style && vars.nodeType || _isArray(vars) || _isTypedArray(vars)) {
      return _isString(vars) ? _parseFuncOrString(vars, tween, index, target, targets) : vars;
    }
    var copy = {}, p;
    for (p in vars) {
      copy[p] = _parseFuncOrString(vars[p], tween, index, target, targets);
    }
    return copy;
  };
  var _checkPlugin = function _checkPlugin2(property, vars, tween, index, target, targets) {
    var plugin, pt, ptLookup, i;
    if (_plugins[property] && (plugin = new _plugins[property]()).init(target, plugin.rawVars ? vars[property] : _processVars(vars[property], index, target, targets, tween), tween, index, targets) !== false) {
      tween._pt = pt = new PropTween(tween._pt, target, property, 0, 1, plugin.render, plugin, 0, plugin.priority);
      if (tween !== _quickTween) {
        ptLookup = tween._ptLookup[tween._targets.indexOf(target)];
        i = plugin._props.length;
        while (i--) {
          ptLookup[plugin._props[i]] = pt;
        }
      }
    }
    return plugin;
  };
  var _overwritingTween;
  var _forceAllPropTweens;
  var _initTween = function _initTween2(tween, time, tTime) {
    var vars = tween.vars, ease = vars.ease, startAt = vars.startAt, immediateRender = vars.immediateRender, lazy = vars.lazy, onUpdate = vars.onUpdate, runBackwards = vars.runBackwards, yoyoEase = vars.yoyoEase, keyframes2 = vars.keyframes, autoRevert = vars.autoRevert, dur = tween._dur, prevStartAt = tween._startAt, targets = tween._targets, parent = tween.parent, fullTargets = parent && parent.data === "nested" ? parent.vars.targets : targets, autoOverwrite = tween._overwrite === "auto" && !_suppressOverwrites, tl = tween.timeline, cleanVars, i, p, pt, target, hasPriority, gsData, harness, plugin, ptLookup, index, harnessVars, overwritten;
    tl && (!keyframes2 || !ease) && (ease = "none");
    tween._ease = _parseEase(ease, _defaults.ease);
    tween._yEase = yoyoEase ? _invertEase(_parseEase(yoyoEase === true ? ease : yoyoEase, _defaults.ease)) : 0;
    if (yoyoEase && tween._yoyo && !tween._repeat) {
      yoyoEase = tween._yEase;
      tween._yEase = tween._ease;
      tween._ease = yoyoEase;
    }
    tween._from = !tl && !!vars.runBackwards;
    if (!tl || keyframes2 && !vars.stagger) {
      harness = targets[0] ? _getCache(targets[0]).harness : 0;
      harnessVars = harness && vars[harness.prop];
      cleanVars = _copyExcluding(vars, _reservedProps);
      if (prevStartAt) {
        prevStartAt._zTime < 0 && prevStartAt.progress(1);
        time < 0 && runBackwards && immediateRender && !autoRevert ? prevStartAt.render(-1, true) : prevStartAt.revert(runBackwards && dur ? _revertConfigNoKill : _startAtRevertConfig);
        prevStartAt._lazy = 0;
      }
      if (startAt) {
        _removeFromParent(tween._startAt = Tween.set(targets, _setDefaults({
          data: "isStart",
          overwrite: false,
          parent,
          immediateRender: true,
          lazy: !prevStartAt && _isNotFalse(lazy),
          startAt: null,
          delay: 0,
          onUpdate: onUpdate && function() {
            return _callback(tween, "onUpdate");
          },
          stagger: 0
        }, startAt)));
        tween._startAt._dp = 0;
        tween._startAt._sat = tween;
        time < 0 && (_reverting || !immediateRender && !autoRevert) && tween._startAt.revert(_revertConfigNoKill);
        if (immediateRender) {
          if (dur && time <= 0 && tTime <= 0) {
            time && (tween._zTime = time);
            return;
          }
        }
      } else if (runBackwards && dur) {
        if (!prevStartAt) {
          time && (immediateRender = false);
          p = _setDefaults({
            overwrite: false,
            data: "isFromStart",
            //we tag the tween with as "isFromStart" so that if [inside a plugin] we need to only do something at the very END of a tween, we have a way of identifying this tween as merely the one that's setting the beginning values for a "from()" tween. For example, clearProps in CSSPlugin should only get applied at the very END of a tween and without this tag, from(...{height:100, clearProps:"height", delay:1}) would wipe the height at the beginning of the tween and after 1 second, it'd kick back in.
            lazy: immediateRender && !prevStartAt && _isNotFalse(lazy),
            immediateRender,
            //zero-duration tweens render immediately by default, but if we're not specifically instructed to render this tween immediately, we should skip this and merely _init() to record the starting values (rendering them immediately would push them to completion which is wasteful in that case - we'd have to render(-1) immediately after)
            stagger: 0,
            parent
            //ensures that nested tweens that had a stagger are handled properly, like gsap.from(".class", {y: gsap.utils.wrap([-100,100]), stagger: 0.5})
          }, cleanVars);
          harnessVars && (p[harness.prop] = harnessVars);
          _removeFromParent(tween._startAt = Tween.set(targets, p));
          tween._startAt._dp = 0;
          tween._startAt._sat = tween;
          time < 0 && (_reverting ? tween._startAt.revert(_revertConfigNoKill) : tween._startAt.render(-1, true));
          tween._zTime = time;
          if (!immediateRender) {
            _initTween2(tween._startAt, _tinyNum, _tinyNum);
          } else if (!time) {
            return;
          }
        }
      }
      tween._pt = tween._ptCache = 0;
      lazy = dur && _isNotFalse(lazy) || lazy && !dur;
      for (i = 0; i < targets.length; i++) {
        target = targets[i];
        gsData = target._gsap || _harness(targets)[i]._gsap;
        tween._ptLookup[i] = ptLookup = {};
        _lazyLookup[gsData.id] && _lazyTweens.length && _lazyRender();
        index = fullTargets === targets ? i : fullTargets.indexOf(target);
        if (harness && (plugin = new harness()).init(target, harnessVars || cleanVars, tween, index, fullTargets) !== false) {
          tween._pt = pt = new PropTween(tween._pt, target, plugin.name, 0, 1, plugin.render, plugin, 0, plugin.priority);
          plugin._props.forEach(function(name) {
            ptLookup[name] = pt;
          });
          plugin.priority && (hasPriority = 1);
        }
        if (!harness || harnessVars) {
          for (p in cleanVars) {
            if (_plugins[p] && (plugin = _checkPlugin(p, cleanVars, tween, index, target, fullTargets))) {
              plugin.priority && (hasPriority = 1);
            } else {
              ptLookup[p] = pt = _addPropTween.call(tween, target, p, "get", cleanVars[p], index, fullTargets, 0, vars.stringFilter);
            }
          }
        }
        tween._op && tween._op[i] && tween.kill(target, tween._op[i]);
        if (autoOverwrite && tween._pt) {
          _overwritingTween = tween;
          _globalTimeline.killTweensOf(target, ptLookup, tween.globalTime(time));
          overwritten = !tween.parent;
          _overwritingTween = 0;
        }
        tween._pt && lazy && (_lazyLookup[gsData.id] = 1);
      }
      hasPriority && _sortPropTweensByPriority(tween);
      tween._onInit && tween._onInit(tween);
    }
    tween._onUpdate = onUpdate;
    tween._initted = (!tween._op || tween._pt) && !overwritten;
    keyframes2 && time <= 0 && tl.render(_bigNum, true, true);
  };
  var _updatePropTweens = function _updatePropTweens2(tween, property, value, start, startIsRelative, ratio, time, skipRecursion) {
    var ptCache = (tween._pt && tween._ptCache || (tween._ptCache = {}))[property], pt, rootPT, lookup, i;
    if (!ptCache) {
      ptCache = tween._ptCache[property] = [];
      lookup = tween._ptLookup;
      i = tween._targets.length;
      while (i--) {
        pt = lookup[i][property];
        if (pt && pt.d && pt.d._pt) {
          pt = pt.d._pt;
          while (pt && pt.p !== property && pt.fp !== property) {
            pt = pt._next;
          }
        }
        if (!pt) {
          _forceAllPropTweens = 1;
          tween.vars[property] = "+=0";
          _initTween(tween, time);
          _forceAllPropTweens = 0;
          return skipRecursion ? _warn(property + " not eligible for reset") : 1;
        }
        ptCache.push(pt);
      }
    }
    i = ptCache.length;
    while (i--) {
      rootPT = ptCache[i];
      pt = rootPT._pt || rootPT;
      pt.s = (start || start === 0) && !startIsRelative ? start : pt.s + (start || 0) + ratio * pt.c;
      pt.c = value - pt.s;
      rootPT.e && (rootPT.e = _round2(value) + getUnit(rootPT.e));
      rootPT.b && (rootPT.b = pt.s + getUnit(rootPT.b));
    }
  };
  var _addAliasesToVars = function _addAliasesToVars2(targets, vars) {
    var harness = targets[0] ? _getCache(targets[0]).harness : 0, propertyAliases = harness && harness.aliases, copy, p, i, aliases;
    if (!propertyAliases) {
      return vars;
    }
    copy = _merge({}, vars);
    for (p in propertyAliases) {
      if (p in copy) {
        aliases = propertyAliases[p].split(",");
        i = aliases.length;
        while (i--) {
          copy[aliases[i]] = copy[p];
        }
      }
    }
    return copy;
  };
  var _parseKeyframe = function _parseKeyframe2(prop, obj, allProps, easeEach) {
    var ease = obj.ease || easeEach || "power1.inOut", p, a;
    if (_isArray(obj)) {
      a = allProps[prop] || (allProps[prop] = []);
      obj.forEach(function(value, i) {
        return a.push({
          t: i / (obj.length - 1) * 100,
          v: value,
          e: ease
        });
      });
    } else {
      for (p in obj) {
        a = allProps[p] || (allProps[p] = []);
        p === "ease" || a.push({
          t: parseFloat(prop),
          v: obj[p],
          e: ease
        });
      }
    }
  };
  var _parseFuncOrString = function _parseFuncOrString2(value, tween, i, target, targets) {
    return _isFunction(value) ? value.call(tween, i, target, targets) : _isString(value) && ~value.indexOf("random(") ? _replaceRandom(value) : value;
  };
  var _staggerTweenProps = _callbackNames + "repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase,autoRevert";
  var _staggerPropsToSkip = {};
  _forEachName(_staggerTweenProps + ",id,stagger,delay,duration,paused,scrollTrigger", function(name) {
    return _staggerPropsToSkip[name] = 1;
  });
  var Tween = /* @__PURE__ */ (function(_Animation2) {
    _inheritsLoose(Tween2, _Animation2);
    function Tween2(targets, vars, position, skipInherit) {
      var _this3;
      if (typeof vars === "number") {
        position.duration = vars;
        vars = position;
        position = null;
      }
      _this3 = _Animation2.call(this, skipInherit ? vars : _inheritDefaults(vars)) || this;
      var _this3$vars = _this3.vars, duration = _this3$vars.duration, delay = _this3$vars.delay, immediateRender = _this3$vars.immediateRender, stagger2 = _this3$vars.stagger, overwrite = _this3$vars.overwrite, keyframes2 = _this3$vars.keyframes, defaults3 = _this3$vars.defaults, scrollTrigger = _this3$vars.scrollTrigger, yoyoEase = _this3$vars.yoyoEase, parent = vars.parent || _globalTimeline, parsedTargets = (_isArray(targets) || _isTypedArray(targets) ? _isNumber(targets[0]) : "length" in vars) ? [targets] : toArray(targets), tl, i, copy, l, p, curTarget, staggerFunc, staggerVarsToMerge;
      _this3._targets = parsedTargets.length ? _harness(parsedTargets) : _warn("GSAP target " + targets + " not found. https://gsap.com", !_config.nullTargetWarn) || [];
      _this3._ptLookup = [];
      _this3._overwrite = overwrite;
      if (keyframes2 || stagger2 || _isFuncOrString(duration) || _isFuncOrString(delay)) {
        vars = _this3.vars;
        tl = _this3.timeline = new Timeline({
          data: "nested",
          defaults: defaults3 || {},
          targets: parent && parent.data === "nested" ? parent.vars.targets : parsedTargets
        });
        tl.kill();
        tl.parent = tl._dp = _assertThisInitialized(_this3);
        tl._start = 0;
        if (stagger2 || _isFuncOrString(duration) || _isFuncOrString(delay)) {
          l = parsedTargets.length;
          staggerFunc = stagger2 && distribute(stagger2);
          if (_isObject(stagger2)) {
            for (p in stagger2) {
              if (~_staggerTweenProps.indexOf(p)) {
                staggerVarsToMerge || (staggerVarsToMerge = {});
                staggerVarsToMerge[p] = stagger2[p];
              }
            }
          }
          for (i = 0; i < l; i++) {
            copy = _copyExcluding(vars, _staggerPropsToSkip);
            copy.stagger = 0;
            yoyoEase && (copy.yoyoEase = yoyoEase);
            staggerVarsToMerge && _merge(copy, staggerVarsToMerge);
            curTarget = parsedTargets[i];
            copy.duration = +_parseFuncOrString(duration, _assertThisInitialized(_this3), i, curTarget, parsedTargets);
            copy.delay = (+_parseFuncOrString(delay, _assertThisInitialized(_this3), i, curTarget, parsedTargets) || 0) - _this3._delay;
            if (!stagger2 && l === 1 && copy.delay) {
              _this3._delay = delay = copy.delay;
              _this3._start += delay;
              copy.delay = 0;
            }
            tl.to(curTarget, copy, staggerFunc ? staggerFunc(i, curTarget, parsedTargets) : 0);
            tl._ease = _easeMap.none;
          }
          tl.duration() ? duration = delay = 0 : _this3.timeline = 0;
        } else if (keyframes2) {
          _inheritDefaults(_setDefaults(tl.vars.defaults, {
            ease: "none"
          }));
          tl._ease = _parseEase(keyframes2.ease || vars.ease || "none");
          var time = 0, a, kf, v;
          if (_isArray(keyframes2)) {
            keyframes2.forEach(function(frame2) {
              return tl.to(parsedTargets, frame2, ">");
            });
            tl.duration();
          } else {
            copy = {};
            for (p in keyframes2) {
              p === "ease" || p === "easeEach" || _parseKeyframe(p, keyframes2[p], copy, keyframes2.easeEach);
            }
            for (p in copy) {
              a = copy[p].sort(function(a2, b) {
                return a2.t - b.t;
              });
              time = 0;
              for (i = 0; i < a.length; i++) {
                kf = a[i];
                v = {
                  ease: kf.e,
                  duration: (kf.t - (i ? a[i - 1].t : 0)) / 100 * duration
                };
                v[p] = kf.v;
                tl.to(parsedTargets, v, time);
                time += v.duration;
              }
            }
            tl.duration() < duration && tl.to({}, {
              duration: duration - tl.duration()
            });
          }
        }
        duration || _this3.duration(duration = tl.duration());
      } else {
        _this3.timeline = 0;
      }
      if (overwrite === true && !_suppressOverwrites) {
        _overwritingTween = _assertThisInitialized(_this3);
        _globalTimeline.killTweensOf(parsedTargets);
        _overwritingTween = 0;
      }
      _addToTimeline(parent, _assertThisInitialized(_this3), position);
      vars.reversed && _this3.reverse();
      vars.paused && _this3.paused(true);
      if (immediateRender || !duration && !keyframes2 && _this3._start === _roundPrecise(parent._time) && _isNotFalse(immediateRender) && _hasNoPausedAncestors(_assertThisInitialized(_this3)) && parent.data !== "nested") {
        _this3._tTime = -_tinyNum;
        _this3.render(Math.max(0, -delay) || 0);
      }
      scrollTrigger && _scrollTrigger(_assertThisInitialized(_this3), scrollTrigger);
      return _this3;
    }
    var _proto3 = Tween2.prototype;
    _proto3.render = function render4(totalTime, suppressEvents, force) {
      var prevTime = this._time, tDur = this._tDur, dur = this._dur, isNegative = totalTime < 0, tTime = totalTime > tDur - _tinyNum && !isNegative ? tDur : totalTime < _tinyNum ? 0 : totalTime, time, pt, iteration, cycleDuration, prevIteration, isYoyo, ratio, timeline2, yoyoEase;
      if (!dur) {
        _renderZeroDurationTween(this, totalTime, suppressEvents, force);
      } else if (tTime !== this._tTime || !totalTime || force || !this._initted && this._tTime || this._startAt && this._zTime < 0 !== isNegative || this._lazy) {
        time = tTime;
        timeline2 = this.timeline;
        if (this._repeat) {
          cycleDuration = dur + this._rDelay;
          if (this._repeat < -1 && isNegative) {
            return this.totalTime(cycleDuration * 100 + totalTime, suppressEvents, force);
          }
          time = _roundPrecise(tTime % cycleDuration);
          if (tTime === tDur) {
            iteration = this._repeat;
            time = dur;
          } else {
            prevIteration = _roundPrecise(tTime / cycleDuration);
            iteration = ~~prevIteration;
            if (iteration && iteration === prevIteration) {
              time = dur;
              iteration--;
            } else if (time > dur) {
              time = dur;
            }
          }
          isYoyo = this._yoyo && iteration & 1;
          if (isYoyo) {
            yoyoEase = this._yEase;
            time = dur - time;
          }
          prevIteration = _animationCycle(this._tTime, cycleDuration);
          if (time === prevTime && !force && this._initted && iteration === prevIteration) {
            this._tTime = tTime;
            return this;
          }
          if (iteration !== prevIteration) {
            timeline2 && this._yEase && _propagateYoyoEase(timeline2, isYoyo);
            if (this.vars.repeatRefresh && !isYoyo && !this._lock && time !== cycleDuration && this._initted) {
              this._lock = force = 1;
              this.render(_roundPrecise(cycleDuration * iteration), true).invalidate()._lock = 0;
            }
          }
        }
        if (!this._initted) {
          if (_attemptInitTween(this, isNegative ? totalTime : time, force, suppressEvents, tTime)) {
            this._tTime = 0;
            return this;
          }
          if (prevTime !== this._time && !(force && this.vars.repeatRefresh && iteration !== prevIteration)) {
            return this;
          }
          if (dur !== this._dur) {
            return this.render(totalTime, suppressEvents, force);
          }
        }
        this._tTime = tTime;
        this._time = time;
        if (!this._act && this._ts) {
          this._act = 1;
          this._lazy = 0;
        }
        this.ratio = ratio = (yoyoEase || this._ease)(time / dur);
        if (this._from) {
          this.ratio = ratio = 1 - ratio;
        }
        if (!prevTime && tTime && !suppressEvents && !prevIteration) {
          _callback(this, "onStart");
          if (this._tTime !== tTime) {
            return this;
          }
        }
        pt = this._pt;
        while (pt) {
          pt.r(ratio, pt.d);
          pt = pt._next;
        }
        timeline2 && timeline2.render(totalTime < 0 ? totalTime : timeline2._dur * timeline2._ease(time / this._dur), suppressEvents, force) || this._startAt && (this._zTime = totalTime);
        if (this._onUpdate && !suppressEvents) {
          isNegative && _rewindStartAt(this, totalTime, suppressEvents, force);
          _callback(this, "onUpdate");
        }
        this._repeat && iteration !== prevIteration && this.vars.onRepeat && !suppressEvents && this.parent && _callback(this, "onRepeat");
        if ((tTime === this._tDur || !tTime) && this._tTime === tTime) {
          isNegative && !this._onUpdate && _rewindStartAt(this, totalTime, true, true);
          (totalTime || !dur) && (tTime === this._tDur && this._ts > 0 || !tTime && this._ts < 0) && _removeFromParent(this, 1);
          if (!suppressEvents && !(isNegative && !prevTime) && (tTime || prevTime || isYoyo)) {
            _callback(this, tTime === tDur ? "onComplete" : "onReverseComplete", true);
            this._prom && !(tTime < tDur && this.timeScale() > 0) && this._prom();
          }
        }
      }
      return this;
    };
    _proto3.targets = function targets() {
      return this._targets;
    };
    _proto3.invalidate = function invalidate(soft) {
      (!soft || !this.vars.runBackwards) && (this._startAt = 0);
      this._pt = this._op = this._onUpdate = this._lazy = this.ratio = 0;
      this._ptLookup = [];
      this.timeline && this.timeline.invalidate(soft);
      return _Animation2.prototype.invalidate.call(this, soft);
    };
    _proto3.resetTo = function resetTo(property, value, start, startIsRelative, skipRecursion) {
      _tickerActive || _ticker.wake();
      this._ts || this.play();
      var time = Math.min(this._dur, (this._dp._time - this._start) * this._ts), ratio;
      this._initted || _initTween(this, time);
      ratio = this._ease(time / this._dur);
      if (_updatePropTweens(this, property, value, start, startIsRelative, ratio, time, skipRecursion)) {
        return this.resetTo(property, value, start, startIsRelative, 1);
      }
      _alignPlayhead(this, 0);
      this.parent || _addLinkedListItem(this._dp, this, "_first", "_last", this._dp._sort ? "_start" : 0);
      return this.render(0);
    };
    _proto3.kill = function kill(targets, vars) {
      if (vars === void 0) {
        vars = "all";
      }
      if (!targets && (!vars || vars === "all")) {
        this._lazy = this._pt = 0;
        this.parent ? _interrupt(this) : this.scrollTrigger && this.scrollTrigger.kill(!!_reverting);
        return this;
      }
      if (this.timeline) {
        var tDur = this.timeline.totalDuration();
        this.timeline.killTweensOf(targets, vars, _overwritingTween && _overwritingTween.vars.overwrite !== true)._first || _interrupt(this);
        this.parent && tDur !== this.timeline.totalDuration() && _setDuration(this, this._dur * this.timeline._tDur / tDur, 0, 1);
        return this;
      }
      var parsedTargets = this._targets, killingTargets = targets ? toArray(targets) : parsedTargets, propTweenLookup = this._ptLookup, firstPT = this._pt, overwrittenProps, curLookup, curOverwriteProps, props, p, pt, i;
      if ((!vars || vars === "all") && _arraysMatch(parsedTargets, killingTargets)) {
        vars === "all" && (this._pt = 0);
        return _interrupt(this);
      }
      overwrittenProps = this._op = this._op || [];
      if (vars !== "all") {
        if (_isString(vars)) {
          p = {};
          _forEachName(vars, function(name) {
            return p[name] = 1;
          });
          vars = p;
        }
        vars = _addAliasesToVars(parsedTargets, vars);
      }
      i = parsedTargets.length;
      while (i--) {
        if (~killingTargets.indexOf(parsedTargets[i])) {
          curLookup = propTweenLookup[i];
          if (vars === "all") {
            overwrittenProps[i] = vars;
            props = curLookup;
            curOverwriteProps = {};
          } else {
            curOverwriteProps = overwrittenProps[i] = overwrittenProps[i] || {};
            props = vars;
          }
          for (p in props) {
            pt = curLookup && curLookup[p];
            if (pt) {
              if (!("kill" in pt.d) || pt.d.kill(p) === true) {
                _removeLinkedListItem(this, pt, "_pt");
              }
              delete curLookup[p];
            }
            if (curOverwriteProps !== "all") {
              curOverwriteProps[p] = 1;
            }
          }
        }
      }
      this._initted && !this._pt && firstPT && _interrupt(this);
      return this;
    };
    Tween2.to = function to(targets, vars) {
      return new Tween2(targets, vars, arguments[2]);
    };
    Tween2.from = function from(targets, vars) {
      return _createTweenType(1, arguments);
    };
    Tween2.delayedCall = function delayedCall(delay, callback, params, scope2) {
      return new Tween2(callback, 0, {
        immediateRender: false,
        lazy: false,
        overwrite: false,
        delay,
        onComplete: callback,
        onReverseComplete: callback,
        onCompleteParams: params,
        onReverseCompleteParams: params,
        callbackScope: scope2
      });
    };
    Tween2.fromTo = function fromTo(targets, fromVars, toVars) {
      return _createTweenType(2, arguments);
    };
    Tween2.set = function set(targets, vars) {
      vars.duration = 0;
      vars.repeatDelay || (vars.repeat = 0);
      return new Tween2(targets, vars);
    };
    Tween2.killTweensOf = function killTweensOf(targets, props, onlyActive) {
      return _globalTimeline.killTweensOf(targets, props, onlyActive);
    };
    return Tween2;
  })(Animation);
  _setDefaults(Tween.prototype, {
    _targets: [],
    _lazy: 0,
    _startAt: 0,
    _op: 0,
    _onInit: 0
  });
  _forEachName("staggerTo,staggerFrom,staggerFromTo", function(name) {
    Tween[name] = function() {
      var tl = new Timeline(), params = _slice.call(arguments, 0);
      params.splice(name === "staggerFromTo" ? 5 : 4, 0, 0);
      return tl[name].apply(tl, params);
    };
  });
  var _setterPlain = function _setterPlain2(target, property, value) {
    return target[property] = value;
  };
  var _setterFunc = function _setterFunc2(target, property, value) {
    return target[property](value);
  };
  var _setterFuncWithParam = function _setterFuncWithParam2(target, property, value, data) {
    return target[property](data.fp, value);
  };
  var _setterAttribute = function _setterAttribute2(target, property, value) {
    return target.setAttribute(property, value);
  };
  var _getSetter = function _getSetter2(target, property) {
    return _isFunction(target[property]) ? _setterFunc : _isUndefined(target[property]) && target.setAttribute ? _setterAttribute : _setterPlain;
  };
  var _renderPlain = function _renderPlain2(ratio, data) {
    return data.set(data.t, data.p, Math.round((data.s + data.c * ratio) * 1e6) / 1e6, data);
  };
  var _renderBoolean = function _renderBoolean2(ratio, data) {
    return data.set(data.t, data.p, !!(data.s + data.c * ratio), data);
  };
  var _renderComplexString = function _renderComplexString2(ratio, data) {
    var pt = data._pt, s = "";
    if (!ratio && data.b) {
      s = data.b;
    } else if (ratio === 1 && data.e) {
      s = data.e;
    } else {
      while (pt) {
        s = pt.p + (pt.m ? pt.m(pt.s + pt.c * ratio) : Math.round((pt.s + pt.c * ratio) * 1e4) / 1e4) + s;
        pt = pt._next;
      }
      s += data.c;
    }
    data.set(data.t, data.p, s, data);
  };
  var _renderPropTweens = function _renderPropTweens2(ratio, data) {
    var pt = data._pt;
    while (pt) {
      pt.r(ratio, pt.d);
      pt = pt._next;
    }
  };
  var _addPluginModifier = function _addPluginModifier2(modifier, tween, target, property) {
    var pt = this._pt, next;
    while (pt) {
      next = pt._next;
      pt.p === property && pt.modifier(modifier, tween, target);
      pt = next;
    }
  };
  var _killPropTweensOf = function _killPropTweensOf2(property) {
    var pt = this._pt, hasNonDependentRemaining, next;
    while (pt) {
      next = pt._next;
      if (pt.p === property && !pt.op || pt.op === property) {
        _removeLinkedListItem(this, pt, "_pt");
      } else if (!pt.dep) {
        hasNonDependentRemaining = 1;
      }
      pt = next;
    }
    return !hasNonDependentRemaining;
  };
  var _setterWithModifier = function _setterWithModifier2(target, property, value, data) {
    data.mSet(target, property, data.m.call(data.tween, value, data.mt), data);
  };
  var _sortPropTweensByPriority = function _sortPropTweensByPriority2(parent) {
    var pt = parent._pt, next, pt2, first, last;
    while (pt) {
      next = pt._next;
      pt2 = first;
      while (pt2 && pt2.pr > pt.pr) {
        pt2 = pt2._next;
      }
      if (pt._prev = pt2 ? pt2._prev : last) {
        pt._prev._next = pt;
      } else {
        first = pt;
      }
      if (pt._next = pt2) {
        pt2._prev = pt;
      } else {
        last = pt;
      }
      pt = next;
    }
    parent._pt = first;
  };
  var PropTween = /* @__PURE__ */ (function() {
    function PropTween2(next, target, prop, start, change, renderer, data, setter, priority) {
      this.t = target;
      this.s = start;
      this.c = change;
      this.p = prop;
      this.r = renderer || _renderPlain;
      this.d = data || this;
      this.set = setter || _setterPlain;
      this.pr = priority || 0;
      this._next = next;
      if (next) {
        next._prev = this;
      }
    }
    var _proto4 = PropTween2.prototype;
    _proto4.modifier = function modifier(func, tween, target) {
      this.mSet = this.mSet || this.set;
      this.set = _setterWithModifier;
      this.m = func;
      this.mt = target;
      this.tween = tween;
    };
    return PropTween2;
  })();
  _forEachName(_callbackNames + "parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger", function(name) {
    return _reservedProps[name] = 1;
  });
  _globals.TweenMax = _globals.TweenLite = Tween;
  _globals.TimelineLite = _globals.TimelineMax = Timeline;
  _globalTimeline = new Timeline({
    sortChildren: false,
    defaults: _defaults,
    autoRemoveChildren: true,
    id: "root",
    smoothChildTiming: true
  });
  _config.stringFilter = _colorStringFilter;
  var _media = [];
  var _listeners = {};
  var _emptyArray = [];
  var _lastMediaTime = 0;
  var _contextID = 0;
  var _dispatch = function _dispatch2(type) {
    return (_listeners[type] || _emptyArray).map(function(f) {
      return f();
    });
  };
  var _onMediaChange = function _onMediaChange2() {
    var time = Date.now(), matches = [];
    if (time - _lastMediaTime > 2) {
      _dispatch("matchMediaInit");
      _media.forEach(function(c) {
        var queries = c.queries, conditions = c.conditions, match, p, anyMatch, toggled;
        for (p in queries) {
          match = _win.matchMedia(queries[p]).matches;
          match && (anyMatch = 1);
          if (match !== conditions[p]) {
            conditions[p] = match;
            toggled = 1;
          }
        }
        if (toggled) {
          c.revert();
          anyMatch && matches.push(c);
        }
      });
      _dispatch("matchMediaRevert");
      matches.forEach(function(c) {
        return c.onMatch(c, function(func) {
          return c.add(null, func);
        });
      });
      _lastMediaTime = time;
      _dispatch("matchMedia");
    }
  };
  var Context = /* @__PURE__ */ (function() {
    function Context2(func, scope2) {
      this.selector = scope2 && selector(scope2);
      this.data = [];
      this._r = [];
      this.isReverted = false;
      this.id = _contextID++;
      func && this.add(func);
    }
    var _proto5 = Context2.prototype;
    _proto5.add = function add(name, func, scope2) {
      if (_isFunction(name)) {
        scope2 = func;
        func = name;
        name = _isFunction;
      }
      var self = this, f = function f2() {
        var prev = _context, prevSelector = self.selector, result;
        prev && prev !== self && prev.data.push(self);
        scope2 && (self.selector = selector(scope2));
        _context = self;
        result = func.apply(self, arguments);
        _isFunction(result) && self._r.push(result);
        _context = prev;
        self.selector = prevSelector;
        self.isReverted = false;
        return result;
      };
      self.last = f;
      return name === _isFunction ? f(self, function(func2) {
        return self.add(null, func2);
      }) : name ? self[name] = f : f;
    };
    _proto5.ignore = function ignore(func) {
      var prev = _context;
      _context = null;
      func(this);
      _context = prev;
    };
    _proto5.getTweens = function getTweens() {
      var a = [];
      this.data.forEach(function(e) {
        return e instanceof Context2 ? a.push.apply(a, e.getTweens()) : e instanceof Tween && !(e.parent && e.parent.data === "nested") && a.push(e);
      });
      return a;
    };
    _proto5.clear = function clear() {
      this._r.length = this.data.length = 0;
    };
    _proto5.kill = function kill(revert, matchMedia2) {
      var _this4 = this;
      if (revert) {
        (function() {
          var tweens = _this4.getTweens(), i2 = _this4.data.length, t;
          while (i2--) {
            t = _this4.data[i2];
            if (t.data === "isFlip") {
              t.revert();
              t.getChildren(true, true, false).forEach(function(tween) {
                return tweens.splice(tweens.indexOf(tween), 1);
              });
            }
          }
          tweens.map(function(t2) {
            return {
              g: t2._dur || t2._delay || t2._sat && !t2._sat.vars.immediateRender ? t2.globalTime(0) : -Infinity,
              t: t2
            };
          }).sort(function(a, b) {
            return b.g - a.g || -Infinity;
          }).forEach(function(o) {
            return o.t.revert(revert);
          });
          i2 = _this4.data.length;
          while (i2--) {
            t = _this4.data[i2];
            if (t instanceof Timeline) {
              if (t.data !== "nested") {
                t.scrollTrigger && t.scrollTrigger.revert();
                t.kill();
              }
            } else {
              !(t instanceof Tween) && t.revert && t.revert(revert);
            }
          }
          _this4._r.forEach(function(f) {
            return f(revert, _this4);
          });
          _this4.isReverted = true;
        })();
      } else {
        this.data.forEach(function(e) {
          return e.kill && e.kill();
        });
      }
      this.clear();
      if (matchMedia2) {
        var i = _media.length;
        while (i--) {
          _media[i].id === this.id && _media.splice(i, 1);
        }
      }
    };
    _proto5.revert = function revert(config3) {
      this.kill(config3 || {});
    };
    return Context2;
  })();
  var MatchMedia = /* @__PURE__ */ (function() {
    function MatchMedia2(scope2) {
      this.contexts = [];
      this.scope = scope2;
      _context && _context.data.push(this);
    }
    var _proto6 = MatchMedia2.prototype;
    _proto6.add = function add(conditions, func, scope2) {
      _isObject(conditions) || (conditions = {
        matches: conditions
      });
      var context3 = new Context(0, scope2 || this.scope), cond = context3.conditions = {}, mq, p, active;
      _context && !context3.selector && (context3.selector = _context.selector);
      this.contexts.push(context3);
      func = context3.add("onMatch", func);
      context3.queries = conditions;
      for (p in conditions) {
        if (p === "all") {
          active = 1;
        } else {
          mq = _win.matchMedia(conditions[p]);
          if (mq) {
            _media.indexOf(context3) < 0 && _media.push(context3);
            (cond[p] = mq.matches) && (active = 1);
            mq.addListener ? mq.addListener(_onMediaChange) : mq.addEventListener("change", _onMediaChange);
          }
        }
      }
      active && func(context3, function(f) {
        return context3.add(null, f);
      });
      return this;
    };
    _proto6.revert = function revert(config3) {
      this.kill(config3 || {});
    };
    _proto6.kill = function kill(revert) {
      this.contexts.forEach(function(c) {
        return c.kill(revert, true);
      });
    };
    return MatchMedia2;
  })();
  var _gsap = {
    registerPlugin: function registerPlugin() {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
      args.forEach(function(config3) {
        return _createPlugin(config3);
      });
    },
    timeline: function timeline(vars) {
      return new Timeline(vars);
    },
    getTweensOf: function getTweensOf(targets, onlyActive) {
      return _globalTimeline.getTweensOf(targets, onlyActive);
    },
    getProperty: function getProperty(target, property, unit, uncache) {
      _isString(target) && (target = toArray(target)[0]);
      var getter = _getCache(target || {}).get, format = unit ? _passThrough : _numericIfPossible;
      unit === "native" && (unit = "");
      return !target ? target : !property ? function(property2, unit2, uncache2) {
        return format((_plugins[property2] && _plugins[property2].get || getter)(target, property2, unit2, uncache2));
      } : format((_plugins[property] && _plugins[property].get || getter)(target, property, unit, uncache));
    },
    quickSetter: function quickSetter(target, property, unit) {
      target = toArray(target);
      if (target.length > 1) {
        var setters = target.map(function(t) {
          return gsap.quickSetter(t, property, unit);
        }), l = setters.length;
        return function(value) {
          var i = l;
          while (i--) {
            setters[i](value);
          }
        };
      }
      target = target[0] || {};
      var Plugin = _plugins[property], cache = _getCache(target), p = cache.harness && (cache.harness.aliases || {})[property] || property, setter = Plugin ? function(value) {
        var p2 = new Plugin();
        _quickTween._pt = 0;
        p2.init(target, unit ? value + unit : value, _quickTween, 0, [target]);
        p2.render(1, p2);
        _quickTween._pt && _renderPropTweens(1, _quickTween);
      } : cache.set(target, p);
      return Plugin ? setter : function(value) {
        return setter(target, p, unit ? value + unit : value, cache, 1);
      };
    },
    quickTo: function quickTo(target, property, vars) {
      var _setDefaults22;
      var tween = gsap.to(target, _setDefaults((_setDefaults22 = {}, _setDefaults22[property] = "+=0.1", _setDefaults22.paused = true, _setDefaults22.stagger = 0, _setDefaults22), vars || {})), func = function func2(value, start, startIsRelative) {
        return tween.resetTo(property, value, start, startIsRelative);
      };
      func.tween = tween;
      return func;
    },
    isTweening: function isTweening(targets) {
      return _globalTimeline.getTweensOf(targets, true).length > 0;
    },
    defaults: function defaults2(value) {
      value && value.ease && (value.ease = _parseEase(value.ease, _defaults.ease));
      return _mergeDeep(_defaults, value || {});
    },
    config: function config2(value) {
      return _mergeDeep(_config, value || {});
    },
    registerEffect: function registerEffect(_ref3) {
      var name = _ref3.name, effect = _ref3.effect, plugins = _ref3.plugins, defaults3 = _ref3.defaults, extendTimeline = _ref3.extendTimeline;
      (plugins || "").split(",").forEach(function(pluginName) {
        return pluginName && !_plugins[pluginName] && !_globals[pluginName] && _warn(name + " effect requires " + pluginName + " plugin.");
      });
      _effects[name] = function(targets, vars, tl) {
        return effect(toArray(targets), _setDefaults(vars || {}, defaults3), tl);
      };
      if (extendTimeline) {
        Timeline.prototype[name] = function(targets, vars, position) {
          return this.add(_effects[name](targets, _isObject(vars) ? vars : (position = vars) && {}, this), position);
        };
      }
    },
    registerEase: function registerEase(name, ease) {
      _easeMap[name] = _parseEase(ease);
    },
    parseEase: function parseEase2(ease, defaultEase) {
      return arguments.length ? _parseEase(ease, defaultEase) : _easeMap;
    },
    getById: function getById(id) {
      return _globalTimeline.getById(id);
    },
    exportRoot: function exportRoot(vars, includeDelayedCalls) {
      if (vars === void 0) {
        vars = {};
      }
      var tl = new Timeline(vars), child, next;
      tl.smoothChildTiming = _isNotFalse(vars.smoothChildTiming);
      _globalTimeline.remove(tl);
      tl._dp = 0;
      tl._time = tl._tTime = _globalTimeline._time;
      child = _globalTimeline._first;
      while (child) {
        next = child._next;
        if (includeDelayedCalls || !(!child._dur && child instanceof Tween && child.vars.onComplete === child._targets[0])) {
          _addToTimeline(tl, child, child._start - child._delay);
        }
        child = next;
      }
      _addToTimeline(_globalTimeline, tl, 0);
      return tl;
    },
    context: function context(func, scope2) {
      return func ? new Context(func, scope2) : _context;
    },
    matchMedia: function matchMedia(scope2) {
      return new MatchMedia(scope2);
    },
    matchMediaRefresh: function matchMediaRefresh() {
      return _media.forEach(function(c) {
        var cond = c.conditions, found, p;
        for (p in cond) {
          if (cond[p]) {
            cond[p] = false;
            found = 1;
          }
        }
        found && c.revert();
      }) || _onMediaChange();
    },
    addEventListener: function addEventListener(type, callback) {
      var a = _listeners[type] || (_listeners[type] = []);
      ~a.indexOf(callback) || a.push(callback);
    },
    removeEventListener: function removeEventListener(type, callback) {
      var a = _listeners[type], i = a && a.indexOf(callback);
      i >= 0 && a.splice(i, 1);
    },
    utils: {
      wrap,
      wrapYoyo,
      distribute,
      random: random2,
      snap,
      normalize,
      getUnit,
      clamp: clamp2,
      splitColor,
      toArray,
      selector,
      mapRange,
      pipe,
      unitize,
      interpolate,
      shuffle: shuffle2
    },
    install: _install,
    effects: _effects,
    ticker: _ticker,
    updateRoot: Timeline.updateRoot,
    plugins: _plugins,
    globalTimeline: _globalTimeline,
    core: {
      PropTween,
      globals: _addGlobal,
      Tween,
      Timeline,
      Animation,
      getCache: _getCache,
      _removeLinkedListItem,
      reverting: function reverting() {
        return _reverting;
      },
      context: function context2(toAdd) {
        if (toAdd && _context) {
          _context.data.push(toAdd);
          toAdd._ctx = _context;
        }
        return _context;
      },
      suppressOverwrites: function suppressOverwrites(value) {
        return _suppressOverwrites = value;
      }
    }
  };
  _forEachName("to,from,fromTo,delayedCall,set,killTweensOf", function(name) {
    return _gsap[name] = Tween[name];
  });
  _ticker.add(Timeline.updateRoot);
  _quickTween = _gsap.to({}, {
    duration: 0
  });
  var _getPluginPropTween = function _getPluginPropTween2(plugin, prop) {
    var pt = plugin._pt;
    while (pt && pt.p !== prop && pt.op !== prop && pt.fp !== prop) {
      pt = pt._next;
    }
    return pt;
  };
  var _addModifiers = function _addModifiers2(tween, modifiers) {
    var targets = tween._targets, p, i, pt;
    for (p in modifiers) {
      i = targets.length;
      while (i--) {
        pt = tween._ptLookup[i][p];
        if (pt && (pt = pt.d)) {
          if (pt._pt) {
            pt = _getPluginPropTween(pt, p);
          }
          pt && pt.modifier && pt.modifier(modifiers[p], tween, targets[i], p);
        }
      }
    }
  };
  var _buildModifierPlugin = function _buildModifierPlugin2(name, modifier) {
    return {
      name,
      headless: 1,
      rawVars: 1,
      //don't pre-process function-based values or "random()" strings.
      init: function init4(target, vars, tween) {
        tween._onInit = function(tween2) {
          var temp, p;
          if (_isString(vars)) {
            temp = {};
            _forEachName(vars, function(name2) {
              return temp[name2] = 1;
            });
            vars = temp;
          }
          if (modifier) {
            temp = {};
            for (p in vars) {
              temp[p] = modifier(vars[p]);
            }
            vars = temp;
          }
          _addModifiers(tween2, vars);
        };
      }
    };
  };
  var gsap = _gsap.registerPlugin({
    name: "attr",
    init: function init(target, vars, tween, index, targets) {
      var p, pt, v;
      this.tween = tween;
      for (p in vars) {
        v = target.getAttribute(p) || "";
        pt = this.add(target, "setAttribute", (v || 0) + "", vars[p], index, targets, 0, 0, p);
        pt.op = p;
        pt.b = v;
        this._props.push(p);
      }
    },
    render: function render2(ratio, data) {
      var pt = data._pt;
      while (pt) {
        _reverting ? pt.set(pt.t, pt.p, pt.b, pt) : pt.r(ratio, pt.d);
        pt = pt._next;
      }
    }
  }, {
    name: "endArray",
    headless: 1,
    init: function init2(target, value) {
      var i = value.length;
      while (i--) {
        this.add(target, i, target[i] || 0, value[i], 0, 0, 0, 0, 0, 1);
      }
    }
  }, _buildModifierPlugin("roundProps", _roundModifier), _buildModifierPlugin("modifiers"), _buildModifierPlugin("snap", snap)) || _gsap;
  Tween.version = Timeline.version = gsap.version = "3.14.2";
  _coreReady = 1;
  _windowExists() && _wake();
  var Power0 = _easeMap.Power0;
  var Power1 = _easeMap.Power1;
  var Power2 = _easeMap.Power2;
  var Power3 = _easeMap.Power3;
  var Power4 = _easeMap.Power4;
  var Linear = _easeMap.Linear;
  var Quad = _easeMap.Quad;
  var Cubic = _easeMap.Cubic;
  var Quart = _easeMap.Quart;
  var Quint = _easeMap.Quint;
  var Strong = _easeMap.Strong;
  var Elastic = _easeMap.Elastic;
  var Back = _easeMap.Back;
  var SteppedEase = _easeMap.SteppedEase;
  var Bounce = _easeMap.Bounce;
  var Sine = _easeMap.Sine;
  var Expo = _easeMap.Expo;
  var Circ = _easeMap.Circ;

  // node_modules/gsap/CSSPlugin.js
  var _win2;
  var _doc2;
  var _docElement;
  var _pluginInitted;
  var _tempDiv;
  var _tempDivStyler;
  var _recentSetterPlugin;
  var _reverting2;
  var _windowExists3 = function _windowExists4() {
    return typeof window !== "undefined";
  };
  var _transformProps = {};
  var _RAD2DEG = 180 / Math.PI;
  var _DEG2RAD = Math.PI / 180;
  var _atan2 = Math.atan2;
  var _bigNum2 = 1e8;
  var _capsExp = /([A-Z])/g;
  var _horizontalExp = /(left|right|width|margin|padding|x)/i;
  var _complexExp = /[\s,\(]\S/;
  var _propertyAliases = {
    autoAlpha: "opacity,visibility",
    scale: "scaleX,scaleY",
    alpha: "opacity"
  };
  var _renderCSSProp = function _renderCSSProp2(ratio, data) {
    return data.set(data.t, data.p, Math.round((data.s + data.c * ratio) * 1e4) / 1e4 + data.u, data);
  };
  var _renderPropWithEnd = function _renderPropWithEnd2(ratio, data) {
    return data.set(data.t, data.p, ratio === 1 ? data.e : Math.round((data.s + data.c * ratio) * 1e4) / 1e4 + data.u, data);
  };
  var _renderCSSPropWithBeginning = function _renderCSSPropWithBeginning2(ratio, data) {
    return data.set(data.t, data.p, ratio ? Math.round((data.s + data.c * ratio) * 1e4) / 1e4 + data.u : data.b, data);
  };
  var _renderCSSPropWithBeginningAndEnd = function _renderCSSPropWithBeginningAndEnd2(ratio, data) {
    return data.set(data.t, data.p, ratio === 1 ? data.e : ratio ? Math.round((data.s + data.c * ratio) * 1e4) / 1e4 + data.u : data.b, data);
  };
  var _renderRoundedCSSProp = function _renderRoundedCSSProp2(ratio, data) {
    var value = data.s + data.c * ratio;
    data.set(data.t, data.p, ~~(value + (value < 0 ? -0.5 : 0.5)) + data.u, data);
  };
  var _renderNonTweeningValue = function _renderNonTweeningValue2(ratio, data) {
    return data.set(data.t, data.p, ratio ? data.e : data.b, data);
  };
  var _renderNonTweeningValueOnlyAtEnd = function _renderNonTweeningValueOnlyAtEnd2(ratio, data) {
    return data.set(data.t, data.p, ratio !== 1 ? data.b : data.e, data);
  };
  var _setterCSSStyle = function _setterCSSStyle2(target, property, value) {
    return target.style[property] = value;
  };
  var _setterCSSProp = function _setterCSSProp2(target, property, value) {
    return target.style.setProperty(property, value);
  };
  var _setterTransform = function _setterTransform2(target, property, value) {
    return target._gsap[property] = value;
  };
  var _setterScale = function _setterScale2(target, property, value) {
    return target._gsap.scaleX = target._gsap.scaleY = value;
  };
  var _setterScaleWithRender = function _setterScaleWithRender2(target, property, value, data, ratio) {
    var cache = target._gsap;
    cache.scaleX = cache.scaleY = value;
    cache.renderTransform(ratio, cache);
  };
  var _setterTransformWithRender = function _setterTransformWithRender2(target, property, value, data, ratio) {
    var cache = target._gsap;
    cache[property] = value;
    cache.renderTransform(ratio, cache);
  };
  var _transformProp = "transform";
  var _transformOriginProp = _transformProp + "Origin";
  var _saveStyle = function _saveStyle2(property, isNotCSS) {
    var _this = this;
    var target = this.target, style = target.style, cache = target._gsap;
    if (property in _transformProps && style) {
      this.tfm = this.tfm || {};
      if (property !== "transform") {
        property = _propertyAliases[property] || property;
        ~property.indexOf(",") ? property.split(",").forEach(function(a) {
          return _this.tfm[a] = _get(target, a);
        }) : this.tfm[property] = cache.x ? cache[property] : _get(target, property);
        property === _transformOriginProp && (this.tfm.zOrigin = cache.zOrigin);
      } else {
        return _propertyAliases.transform.split(",").forEach(function(p) {
          return _saveStyle2.call(_this, p, isNotCSS);
        });
      }
      if (this.props.indexOf(_transformProp) >= 0) {
        return;
      }
      if (cache.svg) {
        this.svgo = target.getAttribute("data-svg-origin");
        this.props.push(_transformOriginProp, isNotCSS, "");
      }
      property = _transformProp;
    }
    (style || isNotCSS) && this.props.push(property, isNotCSS, style[property]);
  };
  var _removeIndependentTransforms = function _removeIndependentTransforms2(style) {
    if (style.translate) {
      style.removeProperty("translate");
      style.removeProperty("scale");
      style.removeProperty("rotate");
    }
  };
  var _revertStyle = function _revertStyle2() {
    var props = this.props, target = this.target, style = target.style, cache = target._gsap, i, p;
    for (i = 0; i < props.length; i += 3) {
      if (!props[i + 1]) {
        props[i + 2] ? style[props[i]] = props[i + 2] : style.removeProperty(props[i].substr(0, 2) === "--" ? props[i] : props[i].replace(_capsExp, "-$1").toLowerCase());
      } else if (props[i + 1] === 2) {
        target[props[i]](props[i + 2]);
      } else {
        target[props[i]] = props[i + 2];
      }
    }
    if (this.tfm) {
      for (p in this.tfm) {
        cache[p] = this.tfm[p];
      }
      if (cache.svg) {
        cache.renderTransform();
        target.setAttribute("data-svg-origin", this.svgo || "");
      }
      i = _reverting2();
      if ((!i || !i.isStart) && !style[_transformProp]) {
        _removeIndependentTransforms(style);
        if (cache.zOrigin && style[_transformOriginProp]) {
          style[_transformOriginProp] += " " + cache.zOrigin + "px";
          cache.zOrigin = 0;
          cache.renderTransform();
        }
        cache.uncache = 1;
      }
    }
  };
  var _getStyleSaver = function _getStyleSaver2(target, properties) {
    var saver = {
      target,
      props: [],
      revert: _revertStyle,
      save: _saveStyle
    };
    target._gsap || gsap.core.getCache(target);
    properties && target.style && target.nodeType && properties.split(",").forEach(function(p) {
      return saver.save(p);
    });
    return saver;
  };
  var _supports3D;
  var _createElement = function _createElement2(type, ns) {
    var e = _doc2.createElementNS ? _doc2.createElementNS((ns || "http://www.w3.org/1999/xhtml").replace(/^https/, "http"), type) : _doc2.createElement(type);
    return e && e.style ? e : _doc2.createElement(type);
  };
  var _getComputedProperty = function _getComputedProperty2(target, property, skipPrefixFallback) {
    var cs = getComputedStyle(target);
    return cs[property] || cs.getPropertyValue(property.replace(_capsExp, "-$1").toLowerCase()) || cs.getPropertyValue(property) || !skipPrefixFallback && _getComputedProperty2(target, _checkPropPrefix(property) || property, 1) || "";
  };
  var _prefixes = "O,Moz,ms,Ms,Webkit".split(",");
  var _checkPropPrefix = function _checkPropPrefix2(property, element, preferPrefix) {
    var e = element || _tempDiv, s = e.style, i = 5;
    if (property in s && !preferPrefix) {
      return property;
    }
    property = property.charAt(0).toUpperCase() + property.substr(1);
    while (i-- && !(_prefixes[i] + property in s)) {
    }
    return i < 0 ? null : (i === 3 ? "ms" : i >= 0 ? _prefixes[i] : "") + property;
  };
  var _initCore = function _initCore2() {
    if (_windowExists3() && window.document) {
      _win2 = window;
      _doc2 = _win2.document;
      _docElement = _doc2.documentElement;
      _tempDiv = _createElement("div") || {
        style: {}
      };
      _tempDivStyler = _createElement("div");
      _transformProp = _checkPropPrefix(_transformProp);
      _transformOriginProp = _transformProp + "Origin";
      _tempDiv.style.cssText = "border-width:0;line-height:0;position:absolute;padding:0";
      _supports3D = !!_checkPropPrefix("perspective");
      _reverting2 = gsap.core.reverting;
      _pluginInitted = 1;
    }
  };
  var _getReparentedCloneBBox = function _getReparentedCloneBBox2(target) {
    var owner = target.ownerSVGElement, svg = _createElement("svg", owner && owner.getAttribute("xmlns") || "http://www.w3.org/2000/svg"), clone = target.cloneNode(true), bbox;
    clone.style.display = "block";
    svg.appendChild(clone);
    _docElement.appendChild(svg);
    try {
      bbox = clone.getBBox();
    } catch (e) {
    }
    svg.removeChild(clone);
    _docElement.removeChild(svg);
    return bbox;
  };
  var _getAttributeFallbacks = function _getAttributeFallbacks2(target, attributesArray) {
    var i = attributesArray.length;
    while (i--) {
      if (target.hasAttribute(attributesArray[i])) {
        return target.getAttribute(attributesArray[i]);
      }
    }
  };
  var _getBBox = function _getBBox2(target) {
    var bounds, cloned;
    try {
      bounds = target.getBBox();
    } catch (error) {
      bounds = _getReparentedCloneBBox(target);
      cloned = 1;
    }
    bounds && (bounds.width || bounds.height) || cloned || (bounds = _getReparentedCloneBBox(target));
    return bounds && !bounds.width && !bounds.x && !bounds.y ? {
      x: +_getAttributeFallbacks(target, ["x", "cx", "x1"]) || 0,
      y: +_getAttributeFallbacks(target, ["y", "cy", "y1"]) || 0,
      width: 0,
      height: 0
    } : bounds;
  };
  var _isSVG = function _isSVG2(e) {
    return !!(e.getCTM && (!e.parentNode || e.ownerSVGElement) && _getBBox(e));
  };
  var _removeProperty = function _removeProperty2(target, property) {
    if (property) {
      var style = target.style, first2Chars;
      if (property in _transformProps && property !== _transformOriginProp) {
        property = _transformProp;
      }
      if (style.removeProperty) {
        first2Chars = property.substr(0, 2);
        if (first2Chars === "ms" || property.substr(0, 6) === "webkit") {
          property = "-" + property;
        }
        style.removeProperty(first2Chars === "--" ? property : property.replace(_capsExp, "-$1").toLowerCase());
      } else {
        style.removeAttribute(property);
      }
    }
  };
  var _addNonTweeningPT = function _addNonTweeningPT2(plugin, target, property, beginning, end, onlySetAtEnd) {
    var pt = new PropTween(plugin._pt, target, property, 0, 1, onlySetAtEnd ? _renderNonTweeningValueOnlyAtEnd : _renderNonTweeningValue);
    plugin._pt = pt;
    pt.b = beginning;
    pt.e = end;
    plugin._props.push(property);
    return pt;
  };
  var _nonConvertibleUnits = {
    deg: 1,
    rad: 1,
    turn: 1
  };
  var _nonStandardLayouts = {
    grid: 1,
    flex: 1
  };
  var _convertToUnit = function _convertToUnit2(target, property, value, unit) {
    var curValue = parseFloat(value) || 0, curUnit = (value + "").trim().substr((curValue + "").length) || "px", style = _tempDiv.style, horizontal = _horizontalExp.test(property), isRootSVG = target.tagName.toLowerCase() === "svg", measureProperty = (isRootSVG ? "client" : "offset") + (horizontal ? "Width" : "Height"), amount = 100, toPixels = unit === "px", toPercent = unit === "%", px, parent, cache, isSVG;
    if (unit === curUnit || !curValue || _nonConvertibleUnits[unit] || _nonConvertibleUnits[curUnit]) {
      return curValue;
    }
    curUnit !== "px" && !toPixels && (curValue = _convertToUnit2(target, property, value, "px"));
    isSVG = target.getCTM && _isSVG(target);
    if ((toPercent || curUnit === "%") && (_transformProps[property] || ~property.indexOf("adius"))) {
      px = isSVG ? target.getBBox()[horizontal ? "width" : "height"] : target[measureProperty];
      return _round2(toPercent ? curValue / px * amount : curValue / 100 * px);
    }
    style[horizontal ? "width" : "height"] = amount + (toPixels ? curUnit : unit);
    parent = unit !== "rem" && ~property.indexOf("adius") || unit === "em" && target.appendChild && !isRootSVG ? target : target.parentNode;
    if (isSVG) {
      parent = (target.ownerSVGElement || {}).parentNode;
    }
    if (!parent || parent === _doc2 || !parent.appendChild) {
      parent = _doc2.body;
    }
    cache = parent._gsap;
    if (cache && toPercent && cache.width && horizontal && cache.time === _ticker.time && !cache.uncache) {
      return _round2(curValue / cache.width * amount);
    } else {
      if (toPercent && (property === "height" || property === "width")) {
        var v = target.style[property];
        target.style[property] = amount + unit;
        px = target[measureProperty];
        v ? target.style[property] = v : _removeProperty(target, property);
      } else {
        (toPercent || curUnit === "%") && !_nonStandardLayouts[_getComputedProperty(parent, "display")] && (style.position = _getComputedProperty(target, "position"));
        parent === target && (style.position = "static");
        parent.appendChild(_tempDiv);
        px = _tempDiv[measureProperty];
        parent.removeChild(_tempDiv);
        style.position = "absolute";
      }
      if (horizontal && toPercent) {
        cache = _getCache(parent);
        cache.time = _ticker.time;
        cache.width = parent[measureProperty];
      }
    }
    return _round2(toPixels ? px * curValue / amount : px && curValue ? amount / px * curValue : 0);
  };
  var _get = function _get2(target, property, unit, uncache) {
    var value;
    _pluginInitted || _initCore();
    if (property in _propertyAliases && property !== "transform") {
      property = _propertyAliases[property];
      if (~property.indexOf(",")) {
        property = property.split(",")[0];
      }
    }
    if (_transformProps[property] && property !== "transform") {
      value = _parseTransform(target, uncache);
      value = property !== "transformOrigin" ? value[property] : value.svg ? value.origin : _firstTwoOnly(_getComputedProperty(target, _transformOriginProp)) + " " + value.zOrigin + "px";
    } else {
      value = target.style[property];
      if (!value || value === "auto" || uncache || ~(value + "").indexOf("calc(")) {
        value = _specialProps[property] && _specialProps[property](target, property, unit) || _getComputedProperty(target, property) || _getProperty(target, property) || (property === "opacity" ? 1 : 0);
      }
    }
    return unit && !~(value + "").trim().indexOf(" ") ? _convertToUnit(target, property, value, unit) + unit : value;
  };
  var _tweenComplexCSSString = function _tweenComplexCSSString2(target, prop, start, end) {
    if (!start || start === "none") {
      var p = _checkPropPrefix(prop, target, 1), s = p && _getComputedProperty(target, p, 1);
      if (s && s !== start) {
        prop = p;
        start = s;
      } else if (prop === "borderColor") {
        start = _getComputedProperty(target, "borderTopColor");
      }
    }
    var pt = new PropTween(this._pt, target.style, prop, 0, 1, _renderComplexString), index = 0, matchIndex = 0, a, result, startValues, startNum, color2, startValue, endValue, endNum, chunk, endUnit, startUnit, endValues;
    pt.b = start;
    pt.e = end;
    start += "";
    end += "";
    if (end.substring(0, 6) === "var(--") {
      end = _getComputedProperty(target, end.substring(4, end.indexOf(")")));
    }
    if (end === "auto") {
      startValue = target.style[prop];
      target.style[prop] = end;
      end = _getComputedProperty(target, prop) || end;
      startValue ? target.style[prop] = startValue : _removeProperty(target, prop);
    }
    a = [start, end];
    _colorStringFilter(a);
    start = a[0];
    end = a[1];
    startValues = start.match(_numWithUnitExp) || [];
    endValues = end.match(_numWithUnitExp) || [];
    if (endValues.length) {
      while (result = _numWithUnitExp.exec(end)) {
        endValue = result[0];
        chunk = end.substring(index, result.index);
        if (color2) {
          color2 = (color2 + 1) % 5;
        } else if (chunk.substr(-5) === "rgba(" || chunk.substr(-5) === "hsla(") {
          color2 = 1;
        }
        if (endValue !== (startValue = startValues[matchIndex++] || "")) {
          startNum = parseFloat(startValue) || 0;
          startUnit = startValue.substr((startNum + "").length);
          endValue.charAt(1) === "=" && (endValue = _parseRelative(startNum, endValue) + startUnit);
          endNum = parseFloat(endValue);
          endUnit = endValue.substr((endNum + "").length);
          index = _numWithUnitExp.lastIndex - endUnit.length;
          if (!endUnit) {
            endUnit = endUnit || _config.units[prop] || startUnit;
            if (index === end.length) {
              end += endUnit;
              pt.e += endUnit;
            }
          }
          if (startUnit !== endUnit) {
            startNum = _convertToUnit(target, prop, startValue, endUnit) || 0;
          }
          pt._pt = {
            _next: pt._pt,
            p: chunk || matchIndex === 1 ? chunk : ",",
            //note: SVG spec allows omission of comma/space when a negative sign is wedged between two numbers, like 2.5-5.3 instead of 2.5,-5.3 but when tweening, the negative value may switch to positive, so we insert the comma just in case.
            s: startNum,
            c: endNum - startNum,
            m: color2 && color2 < 4 || prop === "zIndex" ? Math.round : 0
          };
        }
      }
      pt.c = index < end.length ? end.substring(index, end.length) : "";
    } else {
      pt.r = prop === "display" && end === "none" ? _renderNonTweeningValueOnlyAtEnd : _renderNonTweeningValue;
    }
    _relExp.test(end) && (pt.e = 0);
    this._pt = pt;
    return pt;
  };
  var _keywordToPercent = {
    top: "0%",
    bottom: "100%",
    left: "0%",
    right: "100%",
    center: "50%"
  };
  var _convertKeywordsToPercentages = function _convertKeywordsToPercentages2(value) {
    var split2 = value.split(" "), x = split2[0], y = split2[1] || "50%";
    if (x === "top" || x === "bottom" || y === "left" || y === "right") {
      value = x;
      x = y;
      y = value;
    }
    split2[0] = _keywordToPercent[x] || x;
    split2[1] = _keywordToPercent[y] || y;
    return split2.join(" ");
  };
  var _renderClearProps = function _renderClearProps2(ratio, data) {
    if (data.tween && data.tween._time === data.tween._dur) {
      var target = data.t, style = target.style, props = data.u, cache = target._gsap, prop, clearTransforms, i;
      if (props === "all" || props === true) {
        style.cssText = "";
        clearTransforms = 1;
      } else {
        props = props.split(",");
        i = props.length;
        while (--i > -1) {
          prop = props[i];
          if (_transformProps[prop]) {
            clearTransforms = 1;
            prop = prop === "transformOrigin" ? _transformOriginProp : _transformProp;
          }
          _removeProperty(target, prop);
        }
      }
      if (clearTransforms) {
        _removeProperty(target, _transformProp);
        if (cache) {
          cache.svg && target.removeAttribute("transform");
          style.scale = style.rotate = style.translate = "none";
          _parseTransform(target, 1);
          cache.uncache = 1;
          _removeIndependentTransforms(style);
        }
      }
    }
  };
  var _specialProps = {
    clearProps: function clearProps(plugin, target, property, endValue, tween) {
      if (tween.data !== "isFromStart") {
        var pt = plugin._pt = new PropTween(plugin._pt, target, property, 0, 0, _renderClearProps);
        pt.u = endValue;
        pt.pr = -10;
        pt.tween = tween;
        plugin._props.push(property);
        return 1;
      }
    }
    /* className feature (about 0.4kb gzipped).
    , className(plugin, target, property, endValue, tween) {
    	let _renderClassName = (ratio, data) => {
    			data.css.render(ratio, data.css);
    			if (!ratio || ratio === 1) {
    				let inline = data.rmv,
    					target = data.t,
    					p;
    				target.setAttribute("class", ratio ? data.e : data.b);
    				for (p in inline) {
    					_removeProperty(target, p);
    				}
    			}
    		},
    		_getAllStyles = (target) => {
    			let styles = {},
    				computed = getComputedStyle(target),
    				p;
    			for (p in computed) {
    				if (isNaN(p) && p !== "cssText" && p !== "length") {
    					styles[p] = computed[p];
    				}
    			}
    			_setDefaults(styles, _parseTransform(target, 1));
    			return styles;
    		},
    		startClassList = target.getAttribute("class"),
    		style = target.style,
    		cssText = style.cssText,
    		cache = target._gsap,
    		classPT = cache.classPT,
    		inlineToRemoveAtEnd = {},
    		data = {t:target, plugin:plugin, rmv:inlineToRemoveAtEnd, b:startClassList, e:(endValue.charAt(1) !== "=") ? endValue : startClassList.replace(new RegExp("(?:\\s|^)" + endValue.substr(2) + "(?![\\w-])"), "") + ((endValue.charAt(0) === "+") ? " " + endValue.substr(2) : "")},
    		changingVars = {},
    		startVars = _getAllStyles(target),
    		transformRelated = /(transform|perspective)/i,
    		endVars, p;
    	if (classPT) {
    		classPT.r(1, classPT.d);
    		_removeLinkedListItem(classPT.d.plugin, classPT, "_pt");
    	}
    	target.setAttribute("class", data.e);
    	endVars = _getAllStyles(target, true);
    	target.setAttribute("class", startClassList);
    	for (p in endVars) {
    		if (endVars[p] !== startVars[p] && !transformRelated.test(p)) {
    			changingVars[p] = endVars[p];
    			if (!style[p] && style[p] !== "0") {
    				inlineToRemoveAtEnd[p] = 1;
    			}
    		}
    	}
    	cache.classPT = plugin._pt = new PropTween(plugin._pt, target, "className", 0, 0, _renderClassName, data, 0, -11);
    	if (style.cssText !== cssText) { //only apply if things change. Otherwise, in cases like a background-image that's pulled dynamically, it could cause a refresh. See https://gsap.com/forums/topic/20368-possible-gsap-bug-switching-classnames-in-chrome/.
    		style.cssText = cssText; //we recorded cssText before we swapped classes and ran _getAllStyles() because in cases when a className tween is overwritten, we remove all the related tweening properties from that class change (otherwise class-specific stuff can't override properties we've directly set on the target's style object due to specificity).
    	}
    	_parseTransform(target, true); //to clear the caching of transforms
    	data.css = new gsap.plugins.css();
    	data.css.init(target, changingVars, tween);
    	plugin._props.push(...data.css._props);
    	return 1;
    }
    */
  };
  var _identity2DMatrix = [1, 0, 0, 1, 0, 0];
  var _rotationalProperties = {};
  var _isNullTransform = function _isNullTransform2(value) {
    return value === "matrix(1, 0, 0, 1, 0, 0)" || value === "none" || !value;
  };
  var _getComputedTransformMatrixAsArray = function _getComputedTransformMatrixAsArray2(target) {
    var matrixString = _getComputedProperty(target, _transformProp);
    return _isNullTransform(matrixString) ? _identity2DMatrix : matrixString.substr(7).match(_numExp).map(_round2);
  };
  var _getMatrix = function _getMatrix2(target, force2D) {
    var cache = target._gsap || _getCache(target), style = target.style, matrix = _getComputedTransformMatrixAsArray(target), parent, nextSibling, temp, addedToDOM;
    if (cache.svg && target.getAttribute("transform")) {
      temp = target.transform.baseVal.consolidate().matrix;
      matrix = [temp.a, temp.b, temp.c, temp.d, temp.e, temp.f];
      return matrix.join(",") === "1,0,0,1,0,0" ? _identity2DMatrix : matrix;
    } else if (matrix === _identity2DMatrix && !target.offsetParent && target !== _docElement && !cache.svg) {
      temp = style.display;
      style.display = "block";
      parent = target.parentNode;
      if (!parent || !target.offsetParent && !target.getBoundingClientRect().width) {
        addedToDOM = 1;
        nextSibling = target.nextElementSibling;
        _docElement.appendChild(target);
      }
      matrix = _getComputedTransformMatrixAsArray(target);
      temp ? style.display = temp : _removeProperty(target, "display");
      if (addedToDOM) {
        nextSibling ? parent.insertBefore(target, nextSibling) : parent ? parent.appendChild(target) : _docElement.removeChild(target);
      }
    }
    return force2D && matrix.length > 6 ? [matrix[0], matrix[1], matrix[4], matrix[5], matrix[12], matrix[13]] : matrix;
  };
  var _applySVGOrigin = function _applySVGOrigin2(target, origin, originIsAbsolute, smooth, matrixArray, pluginToAddPropTweensTo) {
    var cache = target._gsap, matrix = matrixArray || _getMatrix(target, true), xOriginOld = cache.xOrigin || 0, yOriginOld = cache.yOrigin || 0, xOffsetOld = cache.xOffset || 0, yOffsetOld = cache.yOffset || 0, a = matrix[0], b = matrix[1], c = matrix[2], d = matrix[3], tx = matrix[4], ty = matrix[5], originSplit = origin.split(" "), xOrigin = parseFloat(originSplit[0]) || 0, yOrigin = parseFloat(originSplit[1]) || 0, bounds, determinant, x, y;
    if (!originIsAbsolute) {
      bounds = _getBBox(target);
      xOrigin = bounds.x + (~originSplit[0].indexOf("%") ? xOrigin / 100 * bounds.width : xOrigin);
      yOrigin = bounds.y + (~(originSplit[1] || originSplit[0]).indexOf("%") ? yOrigin / 100 * bounds.height : yOrigin);
    } else if (matrix !== _identity2DMatrix && (determinant = a * d - b * c)) {
      x = xOrigin * (d / determinant) + yOrigin * (-c / determinant) + (c * ty - d * tx) / determinant;
      y = xOrigin * (-b / determinant) + yOrigin * (a / determinant) - (a * ty - b * tx) / determinant;
      xOrigin = x;
      yOrigin = y;
    }
    if (smooth || smooth !== false && cache.smooth) {
      tx = xOrigin - xOriginOld;
      ty = yOrigin - yOriginOld;
      cache.xOffset = xOffsetOld + (tx * a + ty * c) - tx;
      cache.yOffset = yOffsetOld + (tx * b + ty * d) - ty;
    } else {
      cache.xOffset = cache.yOffset = 0;
    }
    cache.xOrigin = xOrigin;
    cache.yOrigin = yOrigin;
    cache.smooth = !!smooth;
    cache.origin = origin;
    cache.originIsAbsolute = !!originIsAbsolute;
    target.style[_transformOriginProp] = "0px 0px";
    if (pluginToAddPropTweensTo) {
      _addNonTweeningPT(pluginToAddPropTweensTo, cache, "xOrigin", xOriginOld, xOrigin);
      _addNonTweeningPT(pluginToAddPropTweensTo, cache, "yOrigin", yOriginOld, yOrigin);
      _addNonTweeningPT(pluginToAddPropTweensTo, cache, "xOffset", xOffsetOld, cache.xOffset);
      _addNonTweeningPT(pluginToAddPropTweensTo, cache, "yOffset", yOffsetOld, cache.yOffset);
    }
    target.setAttribute("data-svg-origin", xOrigin + " " + yOrigin);
  };
  var _parseTransform = function _parseTransform2(target, uncache) {
    var cache = target._gsap || new GSCache(target);
    if ("x" in cache && !uncache && !cache.uncache) {
      return cache;
    }
    var style = target.style, invertedScaleX = cache.scaleX < 0, px = "px", deg = "deg", cs = getComputedStyle(target), origin = _getComputedProperty(target, _transformOriginProp) || "0", x, y, z, scaleX, scaleY, rotation, rotationX, rotationY, skewX, skewY, perspective, xOrigin, yOrigin, matrix, angle, cos2, sin2, a, b, c, d, a12, a22, t1, t2, t3, a13, a23, a33, a42, a43, a32;
    x = y = z = rotation = rotationX = rotationY = skewX = skewY = perspective = 0;
    scaleX = scaleY = 1;
    cache.svg = !!(target.getCTM && _isSVG(target));
    if (cs.translate) {
      if (cs.translate !== "none" || cs.scale !== "none" || cs.rotate !== "none") {
        style[_transformProp] = (cs.translate !== "none" ? "translate3d(" + (cs.translate + " 0 0").split(" ").slice(0, 3).join(", ") + ") " : "") + (cs.rotate !== "none" ? "rotate(" + cs.rotate + ") " : "") + (cs.scale !== "none" ? "scale(" + cs.scale.split(" ").join(",") + ") " : "") + (cs[_transformProp] !== "none" ? cs[_transformProp] : "");
      }
      style.scale = style.rotate = style.translate = "none";
    }
    matrix = _getMatrix(target, cache.svg);
    if (cache.svg) {
      if (cache.uncache) {
        t2 = target.getBBox();
        origin = cache.xOrigin - t2.x + "px " + (cache.yOrigin - t2.y) + "px";
        t1 = "";
      } else {
        t1 = !uncache && target.getAttribute("data-svg-origin");
      }
      _applySVGOrigin(target, t1 || origin, !!t1 || cache.originIsAbsolute, cache.smooth !== false, matrix);
    }
    xOrigin = cache.xOrigin || 0;
    yOrigin = cache.yOrigin || 0;
    if (matrix !== _identity2DMatrix) {
      a = matrix[0];
      b = matrix[1];
      c = matrix[2];
      d = matrix[3];
      x = a12 = matrix[4];
      y = a22 = matrix[5];
      if (matrix.length === 6) {
        scaleX = Math.sqrt(a * a + b * b);
        scaleY = Math.sqrt(d * d + c * c);
        rotation = a || b ? _atan2(b, a) * _RAD2DEG : 0;
        skewX = c || d ? _atan2(c, d) * _RAD2DEG + rotation : 0;
        skewX && (scaleY *= Math.abs(Math.cos(skewX * _DEG2RAD)));
        if (cache.svg) {
          x -= xOrigin - (xOrigin * a + yOrigin * c);
          y -= yOrigin - (xOrigin * b + yOrigin * d);
        }
      } else {
        a32 = matrix[6];
        a42 = matrix[7];
        a13 = matrix[8];
        a23 = matrix[9];
        a33 = matrix[10];
        a43 = matrix[11];
        x = matrix[12];
        y = matrix[13];
        z = matrix[14];
        angle = _atan2(a32, a33);
        rotationX = angle * _RAD2DEG;
        if (angle) {
          cos2 = Math.cos(-angle);
          sin2 = Math.sin(-angle);
          t1 = a12 * cos2 + a13 * sin2;
          t2 = a22 * cos2 + a23 * sin2;
          t3 = a32 * cos2 + a33 * sin2;
          a13 = a12 * -sin2 + a13 * cos2;
          a23 = a22 * -sin2 + a23 * cos2;
          a33 = a32 * -sin2 + a33 * cos2;
          a43 = a42 * -sin2 + a43 * cos2;
          a12 = t1;
          a22 = t2;
          a32 = t3;
        }
        angle = _atan2(-c, a33);
        rotationY = angle * _RAD2DEG;
        if (angle) {
          cos2 = Math.cos(-angle);
          sin2 = Math.sin(-angle);
          t1 = a * cos2 - a13 * sin2;
          t2 = b * cos2 - a23 * sin2;
          t3 = c * cos2 - a33 * sin2;
          a43 = d * sin2 + a43 * cos2;
          a = t1;
          b = t2;
          c = t3;
        }
        angle = _atan2(b, a);
        rotation = angle * _RAD2DEG;
        if (angle) {
          cos2 = Math.cos(angle);
          sin2 = Math.sin(angle);
          t1 = a * cos2 + b * sin2;
          t2 = a12 * cos2 + a22 * sin2;
          b = b * cos2 - a * sin2;
          a22 = a22 * cos2 - a12 * sin2;
          a = t1;
          a12 = t2;
        }
        if (rotationX && Math.abs(rotationX) + Math.abs(rotation) > 359.9) {
          rotationX = rotation = 0;
          rotationY = 180 - rotationY;
        }
        scaleX = _round2(Math.sqrt(a * a + b * b + c * c));
        scaleY = _round2(Math.sqrt(a22 * a22 + a32 * a32));
        angle = _atan2(a12, a22);
        skewX = Math.abs(angle) > 2e-4 ? angle * _RAD2DEG : 0;
        perspective = a43 ? 1 / (a43 < 0 ? -a43 : a43) : 0;
      }
      if (cache.svg) {
        t1 = target.getAttribute("transform");
        cache.forceCSS = target.setAttribute("transform", "") || !_isNullTransform(_getComputedProperty(target, _transformProp));
        t1 && target.setAttribute("transform", t1);
      }
    }
    if (Math.abs(skewX) > 90 && Math.abs(skewX) < 270) {
      if (invertedScaleX) {
        scaleX *= -1;
        skewX += rotation <= 0 ? 180 : -180;
        rotation += rotation <= 0 ? 180 : -180;
      } else {
        scaleY *= -1;
        skewX += skewX <= 0 ? 180 : -180;
      }
    }
    uncache = uncache || cache.uncache;
    cache.x = x - ((cache.xPercent = x && (!uncache && cache.xPercent || (Math.round(target.offsetWidth / 2) === Math.round(-x) ? -50 : 0))) ? target.offsetWidth * cache.xPercent / 100 : 0) + px;
    cache.y = y - ((cache.yPercent = y && (!uncache && cache.yPercent || (Math.round(target.offsetHeight / 2) === Math.round(-y) ? -50 : 0))) ? target.offsetHeight * cache.yPercent / 100 : 0) + px;
    cache.z = z + px;
    cache.scaleX = _round2(scaleX);
    cache.scaleY = _round2(scaleY);
    cache.rotation = _round2(rotation) + deg;
    cache.rotationX = _round2(rotationX) + deg;
    cache.rotationY = _round2(rotationY) + deg;
    cache.skewX = skewX + deg;
    cache.skewY = skewY + deg;
    cache.transformPerspective = perspective + px;
    if (cache.zOrigin = parseFloat(origin.split(" ")[2]) || !uncache && cache.zOrigin || 0) {
      style[_transformOriginProp] = _firstTwoOnly(origin);
    }
    cache.xOffset = cache.yOffset = 0;
    cache.force3D = _config.force3D;
    cache.renderTransform = cache.svg ? _renderSVGTransforms : _supports3D ? _renderCSSTransforms : _renderNon3DTransforms;
    cache.uncache = 0;
    return cache;
  };
  var _firstTwoOnly = function _firstTwoOnly2(value) {
    return (value = value.split(" "))[0] + " " + value[1];
  };
  var _addPxTranslate = function _addPxTranslate2(target, start, value) {
    var unit = getUnit(start);
    return _round2(parseFloat(start) + parseFloat(_convertToUnit(target, "x", value + "px", unit))) + unit;
  };
  var _renderNon3DTransforms = function _renderNon3DTransforms2(ratio, cache) {
    cache.z = "0px";
    cache.rotationY = cache.rotationX = "0deg";
    cache.force3D = 0;
    _renderCSSTransforms(ratio, cache);
  };
  var _zeroDeg = "0deg";
  var _zeroPx = "0px";
  var _endParenthesis = ") ";
  var _renderCSSTransforms = function _renderCSSTransforms2(ratio, cache) {
    var _ref = cache || this, xPercent = _ref.xPercent, yPercent = _ref.yPercent, x = _ref.x, y = _ref.y, z = _ref.z, rotation = _ref.rotation, rotationY = _ref.rotationY, rotationX = _ref.rotationX, skewX = _ref.skewX, skewY = _ref.skewY, scaleX = _ref.scaleX, scaleY = _ref.scaleY, transformPerspective = _ref.transformPerspective, force3D = _ref.force3D, target = _ref.target, zOrigin = _ref.zOrigin, transforms = "", use3D = force3D === "auto" && ratio && ratio !== 1 || force3D === true;
    if (zOrigin && (rotationX !== _zeroDeg || rotationY !== _zeroDeg)) {
      var angle = parseFloat(rotationY) * _DEG2RAD, a13 = Math.sin(angle), a33 = Math.cos(angle), cos2;
      angle = parseFloat(rotationX) * _DEG2RAD;
      cos2 = Math.cos(angle);
      x = _addPxTranslate(target, x, a13 * cos2 * -zOrigin);
      y = _addPxTranslate(target, y, -Math.sin(angle) * -zOrigin);
      z = _addPxTranslate(target, z, a33 * cos2 * -zOrigin + zOrigin);
    }
    if (transformPerspective !== _zeroPx) {
      transforms += "perspective(" + transformPerspective + _endParenthesis;
    }
    if (xPercent || yPercent) {
      transforms += "translate(" + xPercent + "%, " + yPercent + "%) ";
    }
    if (use3D || x !== _zeroPx || y !== _zeroPx || z !== _zeroPx) {
      transforms += z !== _zeroPx || use3D ? "translate3d(" + x + ", " + y + ", " + z + ") " : "translate(" + x + ", " + y + _endParenthesis;
    }
    if (rotation !== _zeroDeg) {
      transforms += "rotate(" + rotation + _endParenthesis;
    }
    if (rotationY !== _zeroDeg) {
      transforms += "rotateY(" + rotationY + _endParenthesis;
    }
    if (rotationX !== _zeroDeg) {
      transforms += "rotateX(" + rotationX + _endParenthesis;
    }
    if (skewX !== _zeroDeg || skewY !== _zeroDeg) {
      transforms += "skew(" + skewX + ", " + skewY + _endParenthesis;
    }
    if (scaleX !== 1 || scaleY !== 1) {
      transforms += "scale(" + scaleX + ", " + scaleY + _endParenthesis;
    }
    target.style[_transformProp] = transforms || "translate(0, 0)";
  };
  var _renderSVGTransforms = function _renderSVGTransforms2(ratio, cache) {
    var _ref2 = cache || this, xPercent = _ref2.xPercent, yPercent = _ref2.yPercent, x = _ref2.x, y = _ref2.y, rotation = _ref2.rotation, skewX = _ref2.skewX, skewY = _ref2.skewY, scaleX = _ref2.scaleX, scaleY = _ref2.scaleY, target = _ref2.target, xOrigin = _ref2.xOrigin, yOrigin = _ref2.yOrigin, xOffset = _ref2.xOffset, yOffset = _ref2.yOffset, forceCSS = _ref2.forceCSS, tx = parseFloat(x), ty = parseFloat(y), a11, a21, a12, a22, temp;
    rotation = parseFloat(rotation);
    skewX = parseFloat(skewX);
    skewY = parseFloat(skewY);
    if (skewY) {
      skewY = parseFloat(skewY);
      skewX += skewY;
      rotation += skewY;
    }
    if (rotation || skewX) {
      rotation *= _DEG2RAD;
      skewX *= _DEG2RAD;
      a11 = Math.cos(rotation) * scaleX;
      a21 = Math.sin(rotation) * scaleX;
      a12 = Math.sin(rotation - skewX) * -scaleY;
      a22 = Math.cos(rotation - skewX) * scaleY;
      if (skewX) {
        skewY *= _DEG2RAD;
        temp = Math.tan(skewX - skewY);
        temp = Math.sqrt(1 + temp * temp);
        a12 *= temp;
        a22 *= temp;
        if (skewY) {
          temp = Math.tan(skewY);
          temp = Math.sqrt(1 + temp * temp);
          a11 *= temp;
          a21 *= temp;
        }
      }
      a11 = _round2(a11);
      a21 = _round2(a21);
      a12 = _round2(a12);
      a22 = _round2(a22);
    } else {
      a11 = scaleX;
      a22 = scaleY;
      a21 = a12 = 0;
    }
    if (tx && !~(x + "").indexOf("px") || ty && !~(y + "").indexOf("px")) {
      tx = _convertToUnit(target, "x", x, "px");
      ty = _convertToUnit(target, "y", y, "px");
    }
    if (xOrigin || yOrigin || xOffset || yOffset) {
      tx = _round2(tx + xOrigin - (xOrigin * a11 + yOrigin * a12) + xOffset);
      ty = _round2(ty + yOrigin - (xOrigin * a21 + yOrigin * a22) + yOffset);
    }
    if (xPercent || yPercent) {
      temp = target.getBBox();
      tx = _round2(tx + xPercent / 100 * temp.width);
      ty = _round2(ty + yPercent / 100 * temp.height);
    }
    temp = "matrix(" + a11 + "," + a21 + "," + a12 + "," + a22 + "," + tx + "," + ty + ")";
    target.setAttribute("transform", temp);
    forceCSS && (target.style[_transformProp] = temp);
  };
  var _addRotationalPropTween = function _addRotationalPropTween2(plugin, target, property, startNum, endValue) {
    var cap = 360, isString = _isString(endValue), endNum = parseFloat(endValue) * (isString && ~endValue.indexOf("rad") ? _RAD2DEG : 1), change = endNum - startNum, finalValue = startNum + change + "deg", direction, pt;
    if (isString) {
      direction = endValue.split("_")[1];
      if (direction === "short") {
        change %= cap;
        if (change !== change % (cap / 2)) {
          change += change < 0 ? cap : -cap;
        }
      }
      if (direction === "cw" && change < 0) {
        change = (change + cap * _bigNum2) % cap - ~~(change / cap) * cap;
      } else if (direction === "ccw" && change > 0) {
        change = (change - cap * _bigNum2) % cap - ~~(change / cap) * cap;
      }
    }
    plugin._pt = pt = new PropTween(plugin._pt, target, property, startNum, change, _renderPropWithEnd);
    pt.e = finalValue;
    pt.u = "deg";
    plugin._props.push(property);
    return pt;
  };
  var _assign = function _assign2(target, source) {
    for (var p in source) {
      target[p] = source[p];
    }
    return target;
  };
  var _addRawTransformPTs = function _addRawTransformPTs2(plugin, transforms, target) {
    var startCache = _assign({}, target._gsap), exclude = "perspective,force3D,transformOrigin,svgOrigin", style = target.style, endCache, p, startValue, endValue, startNum, endNum, startUnit, endUnit;
    if (startCache.svg) {
      startValue = target.getAttribute("transform");
      target.setAttribute("transform", "");
      style[_transformProp] = transforms;
      endCache = _parseTransform(target, 1);
      _removeProperty(target, _transformProp);
      target.setAttribute("transform", startValue);
    } else {
      startValue = getComputedStyle(target)[_transformProp];
      style[_transformProp] = transforms;
      endCache = _parseTransform(target, 1);
      style[_transformProp] = startValue;
    }
    for (p in _transformProps) {
      startValue = startCache[p];
      endValue = endCache[p];
      if (startValue !== endValue && exclude.indexOf(p) < 0) {
        startUnit = getUnit(startValue);
        endUnit = getUnit(endValue);
        startNum = startUnit !== endUnit ? _convertToUnit(target, p, startValue, endUnit) : parseFloat(startValue);
        endNum = parseFloat(endValue);
        plugin._pt = new PropTween(plugin._pt, endCache, p, startNum, endNum - startNum, _renderCSSProp);
        plugin._pt.u = endUnit || 0;
        plugin._props.push(p);
      }
    }
    _assign(endCache, startCache);
  };
  _forEachName("padding,margin,Width,Radius", function(name, index) {
    var t = "Top", r = "Right", b = "Bottom", l = "Left", props = (index < 3 ? [t, r, b, l] : [t + l, t + r, b + r, b + l]).map(function(side) {
      return index < 2 ? name + side : "border" + side + name;
    });
    _specialProps[index > 1 ? "border" + name : name] = function(plugin, target, property, endValue, tween) {
      var a, vars;
      if (arguments.length < 4) {
        a = props.map(function(prop) {
          return _get(plugin, prop, property);
        });
        vars = a.join(" ");
        return vars.split(a[0]).length === 5 ? a[0] : vars;
      }
      a = (endValue + "").split(" ");
      vars = {};
      props.forEach(function(prop, i) {
        return vars[prop] = a[i] = a[i] || a[(i - 1) / 2 | 0];
      });
      plugin.init(target, vars, tween);
    };
  });
  var CSSPlugin = {
    name: "css",
    register: _initCore,
    targetTest: function targetTest(target) {
      return target.style && target.nodeType;
    },
    init: function init3(target, vars, tween, index, targets) {
      var props = this._props, style = target.style, startAt = tween.vars.startAt, startValue, endValue, endNum, startNum, type, specialProp, p, startUnit, endUnit, relative, isTransformRelated, transformPropTween, cache, smooth, hasPriority, inlineProps, finalTransformValue;
      _pluginInitted || _initCore();
      this.styles = this.styles || _getStyleSaver(target);
      inlineProps = this.styles.props;
      this.tween = tween;
      for (p in vars) {
        if (p === "autoRound") {
          continue;
        }
        endValue = vars[p];
        if (_plugins[p] && _checkPlugin(p, vars, tween, index, target, targets)) {
          continue;
        }
        type = typeof endValue;
        specialProp = _specialProps[p];
        if (type === "function") {
          endValue = endValue.call(tween, index, target, targets);
          type = typeof endValue;
        }
        if (type === "string" && ~endValue.indexOf("random(")) {
          endValue = _replaceRandom(endValue);
        }
        if (specialProp) {
          specialProp(this, target, p, endValue, tween) && (hasPriority = 1);
        } else if (p.substr(0, 2) === "--") {
          startValue = (getComputedStyle(target).getPropertyValue(p) + "").trim();
          endValue += "";
          _colorExp.lastIndex = 0;
          if (!_colorExp.test(startValue)) {
            startUnit = getUnit(startValue);
            endUnit = getUnit(endValue);
            endUnit ? startUnit !== endUnit && (startValue = _convertToUnit(target, p, startValue, endUnit) + endUnit) : startUnit && (endValue += startUnit);
          }
          this.add(style, "setProperty", startValue, endValue, index, targets, 0, 0, p);
          props.push(p);
          inlineProps.push(p, 0, style[p]);
        } else if (type !== "undefined") {
          if (startAt && p in startAt) {
            startValue = typeof startAt[p] === "function" ? startAt[p].call(tween, index, target, targets) : startAt[p];
            _isString(startValue) && ~startValue.indexOf("random(") && (startValue = _replaceRandom(startValue));
            getUnit(startValue + "") || startValue === "auto" || (startValue += _config.units[p] || getUnit(_get(target, p)) || "");
            (startValue + "").charAt(1) === "=" && (startValue = _get(target, p));
          } else {
            startValue = _get(target, p);
          }
          startNum = parseFloat(startValue);
          relative = type === "string" && endValue.charAt(1) === "=" && endValue.substr(0, 2);
          relative && (endValue = endValue.substr(2));
          endNum = parseFloat(endValue);
          if (p in _propertyAliases) {
            if (p === "autoAlpha") {
              if (startNum === 1 && _get(target, "visibility") === "hidden" && endNum) {
                startNum = 0;
              }
              inlineProps.push("visibility", 0, style.visibility);
              _addNonTweeningPT(this, style, "visibility", startNum ? "inherit" : "hidden", endNum ? "inherit" : "hidden", !endNum);
            }
            if (p !== "scale" && p !== "transform") {
              p = _propertyAliases[p];
              ~p.indexOf(",") && (p = p.split(",")[0]);
            }
          }
          isTransformRelated = p in _transformProps;
          if (isTransformRelated) {
            this.styles.save(p);
            finalTransformValue = endValue;
            if (type === "string" && endValue.substring(0, 6) === "var(--") {
              endValue = _getComputedProperty(target, endValue.substring(4, endValue.indexOf(")")));
              if (endValue.substring(0, 5) === "calc(") {
                var origPerspective = target.style.perspective;
                target.style.perspective = endValue;
                endValue = _getComputedProperty(target, "perspective");
                origPerspective ? target.style.perspective = origPerspective : _removeProperty(target, "perspective");
              }
              endNum = parseFloat(endValue);
            }
            if (!transformPropTween) {
              cache = target._gsap;
              cache.renderTransform && !vars.parseTransform || _parseTransform(target, vars.parseTransform);
              smooth = vars.smoothOrigin !== false && cache.smooth;
              transformPropTween = this._pt = new PropTween(this._pt, style, _transformProp, 0, 1, cache.renderTransform, cache, 0, -1);
              transformPropTween.dep = 1;
            }
            if (p === "scale") {
              this._pt = new PropTween(this._pt, cache, "scaleY", cache.scaleY, (relative ? _parseRelative(cache.scaleY, relative + endNum) : endNum) - cache.scaleY || 0, _renderCSSProp);
              this._pt.u = 0;
              props.push("scaleY", p);
              p += "X";
            } else if (p === "transformOrigin") {
              inlineProps.push(_transformOriginProp, 0, style[_transformOriginProp]);
              endValue = _convertKeywordsToPercentages(endValue);
              if (cache.svg) {
                _applySVGOrigin(target, endValue, 0, smooth, 0, this);
              } else {
                endUnit = parseFloat(endValue.split(" ")[2]) || 0;
                endUnit !== cache.zOrigin && _addNonTweeningPT(this, cache, "zOrigin", cache.zOrigin, endUnit);
                _addNonTweeningPT(this, style, p, _firstTwoOnly(startValue), _firstTwoOnly(endValue));
              }
              continue;
            } else if (p === "svgOrigin") {
              _applySVGOrigin(target, endValue, 1, smooth, 0, this);
              continue;
            } else if (p in _rotationalProperties) {
              _addRotationalPropTween(this, cache, p, startNum, relative ? _parseRelative(startNum, relative + endValue) : endValue);
              continue;
            } else if (p === "smoothOrigin") {
              _addNonTweeningPT(this, cache, "smooth", cache.smooth, endValue);
              continue;
            } else if (p === "force3D") {
              cache[p] = endValue;
              continue;
            } else if (p === "transform") {
              _addRawTransformPTs(this, endValue, target);
              continue;
            }
          } else if (!(p in style)) {
            p = _checkPropPrefix(p) || p;
          }
          if (isTransformRelated || (endNum || endNum === 0) && (startNum || startNum === 0) && !_complexExp.test(endValue) && p in style) {
            startUnit = (startValue + "").substr((startNum + "").length);
            endNum || (endNum = 0);
            endUnit = getUnit(endValue) || (p in _config.units ? _config.units[p] : startUnit);
            startUnit !== endUnit && (startNum = _convertToUnit(target, p, startValue, endUnit));
            this._pt = new PropTween(this._pt, isTransformRelated ? cache : style, p, startNum, (relative ? _parseRelative(startNum, relative + endNum) : endNum) - startNum, !isTransformRelated && (endUnit === "px" || p === "zIndex") && vars.autoRound !== false ? _renderRoundedCSSProp : _renderCSSProp);
            this._pt.u = endUnit || 0;
            if (isTransformRelated && finalTransformValue !== endValue) {
              this._pt.b = startValue;
              this._pt.e = finalTransformValue;
              this._pt.r = _renderCSSPropWithBeginningAndEnd;
            } else if (startUnit !== endUnit && endUnit !== "%") {
              this._pt.b = startValue;
              this._pt.r = _renderCSSPropWithBeginning;
            }
          } else if (!(p in style)) {
            if (p in target) {
              this.add(target, p, startValue || target[p], relative ? relative + endValue : endValue, index, targets);
            } else if (p !== "parseTransform") {
              _missingPlugin(p, endValue);
              continue;
            }
          } else {
            _tweenComplexCSSString.call(this, target, p, startValue, relative ? relative + endValue : endValue);
          }
          isTransformRelated || (p in style ? inlineProps.push(p, 0, style[p]) : typeof target[p] === "function" ? inlineProps.push(p, 2, target[p]()) : inlineProps.push(p, 1, startValue || target[p]));
          props.push(p);
        }
      }
      hasPriority && _sortPropTweensByPriority(this);
    },
    render: function render3(ratio, data) {
      if (data.tween._time || !_reverting2()) {
        var pt = data._pt;
        while (pt) {
          pt.r(ratio, pt.d);
          pt = pt._next;
        }
      } else {
        data.styles.revert();
      }
    },
    get: _get,
    aliases: _propertyAliases,
    getSetter: function getSetter(target, property, plugin) {
      var p = _propertyAliases[property];
      p && p.indexOf(",") < 0 && (property = p);
      return property in _transformProps && property !== _transformOriginProp && (target._gsap.x || _get(target, "x")) ? plugin && _recentSetterPlugin === plugin ? property === "scale" ? _setterScale : _setterTransform : (_recentSetterPlugin = plugin || {}) && (property === "scale" ? _setterScaleWithRender : _setterTransformWithRender) : target.style && !_isUndefined(target.style[property]) ? _setterCSSStyle : ~property.indexOf("-") ? _setterCSSProp : _getSetter(target, property);
    },
    core: {
      _removeProperty,
      _getMatrix
    }
  };
  gsap.utils.checkPrefix = _checkPropPrefix;
  gsap.core.getStyleSaver = _getStyleSaver;
  (function(positionAndScale, rotation, others, aliases) {
    var all = _forEachName(positionAndScale + "," + rotation + "," + others, function(name) {
      _transformProps[name] = 1;
    });
    _forEachName(rotation, function(name) {
      _config.units[name] = "deg";
      _rotationalProperties[name] = 1;
    });
    _propertyAliases[all[13]] = positionAndScale + "," + rotation;
    _forEachName(aliases, function(name) {
      var split2 = name.split(":");
      _propertyAliases[split2[1]] = all[split2[0]];
    });
  })("x,y,z,scale,scaleX,scaleY,xPercent,yPercent", "rotation,rotationX,rotationY,skewX,skewY", "transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective", "0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY");
  _forEachName("x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective", function(name) {
    _config.units[name] = "px";
  });
  gsap.registerPlugin(CSSPlugin);

  // node_modules/gsap/index.js
  var gsapWithCSS = gsap.registerPlugin(CSSPlugin) || gsap;
  var TweenMaxWithCSS = gsapWithCSS.core.Tween;

  // node_modules/motion-utils/dist/es/clamp.mjs
  var clamp4 = (min, max2, v) => {
    if (v > max2)
      return max2;
    if (v < min)
      return min;
    return v;
  };

  // node_modules/motion-utils/dist/es/format-error-message.mjs
  function formatErrorMessage(message, errorCode) {
    return errorCode ? `${message}. For more information and steps for solving, visit https://motion.dev/troubleshooting/${errorCode}` : message;
  }

  // node_modules/motion-utils/dist/es/errors.mjs
  var warning = () => {
  };
  var invariant = () => {
  };
  if (typeof process !== "undefined" && true) {
    warning = (check, message, errorCode) => {
      if (!check && typeof console !== "undefined") {
        console.warn(formatErrorMessage(message, errorCode));
      }
    };
    invariant = (check, message, errorCode) => {
      if (!check) {
        throw new Error(formatErrorMessage(message, errorCode));
      }
    };
  }

  // node_modules/motion-utils/dist/es/global-config.mjs
  var MotionGlobalConfig = {};

  // node_modules/motion-utils/dist/es/is-object.mjs
  function isObject(value) {
    return typeof value === "object" && value !== null;
  }

  // node_modules/motion-utils/dist/es/memo.mjs
  // @__NO_SIDE_EFFECTS__
  function memo(callback) {
    let result;
    return () => {
      if (result === void 0)
        result = callback();
      return result;
    };
  }

  // node_modules/motion-utils/dist/es/noop.mjs
  var noop2 = /* @__NO_SIDE_EFFECTS__ */ (any) => any;

  // node_modules/motion-utils/dist/es/pipe.mjs
  var combineFunctions = (a, b) => (v) => b(a(v));
  var pipe3 = (...transformers) => transformers.reduce(combineFunctions);

  // node_modules/motion-utils/dist/es/progress.mjs
  var progress = /* @__NO_SIDE_EFFECTS__ */ (from, to, value) => {
    const toFromDifference = to - from;
    return toFromDifference === 0 ? 1 : (value - from) / toFromDifference;
  };

  // node_modules/motion-utils/dist/es/velocity-per-second.mjs
  function velocityPerSecond(velocity, frameDuration) {
    return frameDuration ? velocity * (1e3 / frameDuration) : 0;
  }

  // node_modules/motion-utils/dist/es/warn-once.mjs
  var warned = /* @__PURE__ */ new Set();
  function warnOnce(condition, message, errorCode) {
    if (condition || warned.has(message))
      return;
    console.warn(formatErrorMessage(message, errorCode));
    warned.add(message);
  }

  // node_modules/motion-dom/dist/es/frameloop/order.mjs
  var stepsOrder = [
    "setup",
    // Compute
    "read",
    // Read
    "resolveKeyframes",
    // Write/Read/Write/Read
    "preUpdate",
    // Compute
    "update",
    // Compute
    "preRender",
    // Compute
    "render",
    // Write
    "postRender"
    // Compute
  ];

  // node_modules/motion-dom/dist/es/stats/buffer.mjs
  var statsBuffer = {
    value: null,
    addProjectionMetrics: null
  };

  // node_modules/motion-dom/dist/es/frameloop/render-step.mjs
  function createRenderStep(runNextFrame, stepName) {
    let thisFrame = /* @__PURE__ */ new Set();
    let nextFrame = /* @__PURE__ */ new Set();
    let isProcessing = false;
    let flushNextFrame = false;
    const toKeepAlive = /* @__PURE__ */ new WeakSet();
    let latestFrameData = {
      delta: 0,
      timestamp: 0,
      isProcessing: false
    };
    let numCalls = 0;
    function triggerCallback(callback) {
      if (toKeepAlive.has(callback)) {
        step.schedule(callback);
        runNextFrame();
      }
      numCalls++;
      callback(latestFrameData);
    }
    const step = {
      /**
       * Schedule a process to run on the next frame.
       */
      schedule: (callback, keepAlive = false, immediate = false) => {
        const addToCurrentFrame = immediate && isProcessing;
        const queue = addToCurrentFrame ? thisFrame : nextFrame;
        if (keepAlive)
          toKeepAlive.add(callback);
        if (!queue.has(callback))
          queue.add(callback);
        return callback;
      },
      /**
       * Cancel the provided callback from running on the next frame.
       */
      cancel: (callback) => {
        nextFrame.delete(callback);
        toKeepAlive.delete(callback);
      },
      /**
       * Execute all schedule callbacks.
       */
      process: (frameData2) => {
        latestFrameData = frameData2;
        if (isProcessing) {
          flushNextFrame = true;
          return;
        }
        isProcessing = true;
        [thisFrame, nextFrame] = [nextFrame, thisFrame];
        thisFrame.forEach(triggerCallback);
        if (stepName && statsBuffer.value) {
          statsBuffer.value.frameloop[stepName].push(numCalls);
        }
        numCalls = 0;
        thisFrame.clear();
        isProcessing = false;
        if (flushNextFrame) {
          flushNextFrame = false;
          step.process(frameData2);
        }
      }
    };
    return step;
  }

  // node_modules/motion-dom/dist/es/frameloop/batcher.mjs
  var maxElapsed = 40;
  function createRenderBatcher(scheduleNextBatch, allowKeepAlive) {
    let runNextFrame = false;
    let useDefaultElapsed = true;
    const state = {
      delta: 0,
      timestamp: 0,
      isProcessing: false
    };
    const flagRunNextFrame = () => runNextFrame = true;
    const steps = stepsOrder.reduce((acc, key2) => {
      acc[key2] = createRenderStep(flagRunNextFrame, allowKeepAlive ? key2 : void 0);
      return acc;
    }, {});
    const { setup, read, resolveKeyframes, preUpdate, update, preRender, render: render4, postRender } = steps;
    const processBatch = () => {
      const timestamp = MotionGlobalConfig.useManualTiming ? state.timestamp : performance.now();
      runNextFrame = false;
      if (!MotionGlobalConfig.useManualTiming) {
        state.delta = useDefaultElapsed ? 1e3 / 60 : Math.max(Math.min(timestamp - state.timestamp, maxElapsed), 1);
      }
      state.timestamp = timestamp;
      state.isProcessing = true;
      setup.process(state);
      read.process(state);
      resolveKeyframes.process(state);
      preUpdate.process(state);
      update.process(state);
      preRender.process(state);
      render4.process(state);
      postRender.process(state);
      state.isProcessing = false;
      if (runNextFrame && allowKeepAlive) {
        useDefaultElapsed = false;
        scheduleNextBatch(processBatch);
      }
    };
    const wake = () => {
      runNextFrame = true;
      useDefaultElapsed = true;
      if (!state.isProcessing) {
        scheduleNextBatch(processBatch);
      }
    };
    const schedule = stepsOrder.reduce((acc, key2) => {
      const step = steps[key2];
      acc[key2] = (process2, keepAlive = false, immediate = false) => {
        if (!runNextFrame)
          wake();
        return step.schedule(process2, keepAlive, immediate);
      };
      return acc;
    }, {});
    const cancel = (process2) => {
      for (let i = 0; i < stepsOrder.length; i++) {
        steps[stepsOrder[i]].cancel(process2);
      }
    };
    return { schedule, cancel, state, steps };
  }

  // node_modules/motion-dom/dist/es/frameloop/frame.mjs
  var { schedule: frame, cancel: cancelFrame, state: frameData, steps: frameSteps } = /* @__PURE__ */ createRenderBatcher(typeof requestAnimationFrame !== "undefined" ? requestAnimationFrame : noop2, true);

  // node_modules/motion-dom/dist/es/animation/utils/is-css-variable.mjs
  var checkStringStartsWith = (token) => (key2) => typeof key2 === "string" && key2.startsWith(token);
  var startsAsVariableToken = /* @__PURE__ */ checkStringStartsWith("var(--");
  var isCSSVariableToken = (value) => {
    const startsWithToken = startsAsVariableToken(value);
    if (!startsWithToken)
      return false;
    return singleCssVariableRegex.test(value.split("/*")[0].trim());
  };
  var singleCssVariableRegex = /var\(--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)$/iu;

  // node_modules/motion-dom/dist/es/value/types/numbers/index.mjs
  var number = {
    test: (v) => typeof v === "number",
    parse: parseFloat,
    transform: (v) => v
  };
  var alpha = {
    ...number,
    transform: (v) => clamp4(0, 1, v)
  };
  var scale = {
    ...number,
    default: 1
  };

  // node_modules/motion-dom/dist/es/value/types/utils/sanitize.mjs
  var sanitize = (v) => Math.round(v * 1e5) / 1e5;

  // node_modules/motion-dom/dist/es/value/types/utils/float-regex.mjs
  var floatRegex = /-?(?:\d+(?:\.\d+)?|\.\d+)/gu;

  // node_modules/motion-dom/dist/es/value/types/utils/is-nullish.mjs
  function isNullish(v) {
    return v == null;
  }

  // node_modules/motion-dom/dist/es/value/types/utils/single-color-regex.mjs
  var singleColorRegex = /^(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))$/iu;

  // node_modules/motion-dom/dist/es/value/types/color/utils.mjs
  var isColorString = (type, testProp) => (v) => {
    return Boolean(typeof v === "string" && singleColorRegex.test(v) && v.startsWith(type) || testProp && !isNullish(v) && Object.prototype.hasOwnProperty.call(v, testProp));
  };
  var splitColor3 = (aName, bName, cName) => (v) => {
    if (typeof v !== "string")
      return v;
    const [a, b, c, alpha2] = v.match(floatRegex);
    return {
      [aName]: parseFloat(a),
      [bName]: parseFloat(b),
      [cName]: parseFloat(c),
      alpha: alpha2 !== void 0 ? parseFloat(alpha2) : 1
    };
  };

  // node_modules/motion-dom/dist/es/value/types/color/rgba.mjs
  var clampRgbUnit = (v) => clamp4(0, 255, v);
  var rgbUnit = {
    ...number,
    transform: (v) => Math.round(clampRgbUnit(v))
  };
  var rgba = {
    test: /* @__PURE__ */ isColorString("rgb", "red"),
    parse: /* @__PURE__ */ splitColor3("red", "green", "blue"),
    transform: ({ red, green, blue, alpha: alpha$1 = 1 }) => "rgba(" + rgbUnit.transform(red) + ", " + rgbUnit.transform(green) + ", " + rgbUnit.transform(blue) + ", " + sanitize(alpha.transform(alpha$1)) + ")"
  };

  // node_modules/motion-dom/dist/es/value/types/color/hex.mjs
  function parseHex(v) {
    let r = "";
    let g = "";
    let b = "";
    let a = "";
    if (v.length > 5) {
      r = v.substring(1, 3);
      g = v.substring(3, 5);
      b = v.substring(5, 7);
      a = v.substring(7, 9);
    } else {
      r = v.substring(1, 2);
      g = v.substring(2, 3);
      b = v.substring(3, 4);
      a = v.substring(4, 5);
      r += r;
      g += g;
      b += b;
      a += a;
    }
    return {
      red: parseInt(r, 16),
      green: parseInt(g, 16),
      blue: parseInt(b, 16),
      alpha: a ? parseInt(a, 16) / 255 : 1
    };
  }
  var hex = {
    test: /* @__PURE__ */ isColorString("#"),
    parse: parseHex,
    transform: rgba.transform
  };

  // node_modules/motion-dom/dist/es/value/types/numbers/units.mjs
  var createUnitType = /* @__NO_SIDE_EFFECTS__ */ (unit) => ({
    test: (v) => typeof v === "string" && v.endsWith(unit) && v.split(" ").length === 1,
    parse: parseFloat,
    transform: (v) => `${v}${unit}`
  });
  var percent = /* @__PURE__ */ createUnitType("%");

  // node_modules/motion-dom/dist/es/value/types/color/hsla.mjs
  var hsla = {
    test: /* @__PURE__ */ isColorString("hsl", "hue"),
    parse: /* @__PURE__ */ splitColor3("hue", "saturation", "lightness"),
    transform: ({ hue, saturation, lightness, alpha: alpha$1 = 1 }) => {
      return "hsla(" + Math.round(hue) + ", " + percent.transform(sanitize(saturation)) + ", " + percent.transform(sanitize(lightness)) + ", " + sanitize(alpha.transform(alpha$1)) + ")";
    }
  };

  // node_modules/motion-dom/dist/es/value/types/color/index.mjs
  var color = {
    test: (v) => rgba.test(v) || hex.test(v) || hsla.test(v),
    parse: (v) => {
      if (rgba.test(v)) {
        return rgba.parse(v);
      } else if (hsla.test(v)) {
        return hsla.parse(v);
      } else {
        return hex.parse(v);
      }
    },
    transform: (v) => {
      return typeof v === "string" ? v : v.hasOwnProperty("red") ? rgba.transform(v) : hsla.transform(v);
    },
    getAnimatableNone: (v) => {
      const parsed = color.parse(v);
      parsed.alpha = 0;
      return color.transform(parsed);
    }
  };

  // node_modules/motion-dom/dist/es/value/types/utils/color-regex.mjs
  var colorRegex = /(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))/giu;

  // node_modules/motion-dom/dist/es/value/types/complex/index.mjs
  function test(v) {
    return isNaN(v) && typeof v === "string" && (v.match(floatRegex)?.length || 0) + (v.match(colorRegex)?.length || 0) > 0;
  }
  var NUMBER_TOKEN = "number";
  var COLOR_TOKEN = "color";
  var VAR_TOKEN = "var";
  var VAR_FUNCTION_TOKEN = "var(";
  var SPLIT_TOKEN = "${}";
  var complexRegex = /var\s*\(\s*--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)|#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\)|-?(?:\d+(?:\.\d+)?|\.\d+)/giu;
  function analyseComplexValue(value) {
    const originalValue = value.toString();
    const values = [];
    const indexes = {
      color: [],
      number: [],
      var: []
    };
    const types = [];
    let i = 0;
    const tokenised = originalValue.replace(complexRegex, (parsedValue) => {
      if (color.test(parsedValue)) {
        indexes.color.push(i);
        types.push(COLOR_TOKEN);
        values.push(color.parse(parsedValue));
      } else if (parsedValue.startsWith(VAR_FUNCTION_TOKEN)) {
        indexes.var.push(i);
        types.push(VAR_TOKEN);
        values.push(parsedValue);
      } else {
        indexes.number.push(i);
        types.push(NUMBER_TOKEN);
        values.push(parseFloat(parsedValue));
      }
      ++i;
      return SPLIT_TOKEN;
    });
    const split2 = tokenised.split(SPLIT_TOKEN);
    return { values, split: split2, indexes, types };
  }
  function parseComplexValue(v) {
    return analyseComplexValue(v).values;
  }
  function createTransformer(source) {
    const { split: split2, types } = analyseComplexValue(source);
    const numSections = split2.length;
    return (v) => {
      let output = "";
      for (let i = 0; i < numSections; i++) {
        output += split2[i];
        if (v[i] !== void 0) {
          const type = types[i];
          if (type === NUMBER_TOKEN) {
            output += sanitize(v[i]);
          } else if (type === COLOR_TOKEN) {
            output += color.transform(v[i]);
          } else {
            output += v[i];
          }
        }
      }
      return output;
    };
  }
  var convertNumbersToZero = (v) => typeof v === "number" ? 0 : color.test(v) ? color.getAnimatableNone(v) : v;
  function getAnimatableNone(v) {
    const parsed = parseComplexValue(v);
    const transformer = createTransformer(v);
    return transformer(parsed.map(convertNumbersToZero));
  }
  var complex = {
    test,
    parse: parseComplexValue,
    createTransformer,
    getAnimatableNone
  };

  // node_modules/motion-dom/dist/es/value/types/color/hsla-to-rgba.mjs
  function hueToRgb(p, q, t) {
    if (t < 0)
      t += 1;
    if (t > 1)
      t -= 1;
    if (t < 1 / 6)
      return p + (q - p) * 6 * t;
    if (t < 1 / 2)
      return q;
    if (t < 2 / 3)
      return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }
  function hslaToRgba({ hue, saturation, lightness, alpha: alpha2 }) {
    hue /= 360;
    saturation /= 100;
    lightness /= 100;
    let red = 0;
    let green = 0;
    let blue = 0;
    if (!saturation) {
      red = green = blue = lightness;
    } else {
      const q = lightness < 0.5 ? lightness * (1 + saturation) : lightness + saturation - lightness * saturation;
      const p = 2 * lightness - q;
      red = hueToRgb(p, q, hue + 1 / 3);
      green = hueToRgb(p, q, hue);
      blue = hueToRgb(p, q, hue - 1 / 3);
    }
    return {
      red: Math.round(red * 255),
      green: Math.round(green * 255),
      blue: Math.round(blue * 255),
      alpha: alpha2
    };
  }

  // node_modules/motion-dom/dist/es/utils/mix/immediate.mjs
  function mixImmediate(a, b) {
    return (p) => p > 0 ? b : a;
  }

  // node_modules/motion-dom/dist/es/utils/mix/number.mjs
  var mixNumber = (from, to, progress2) => {
    return from + (to - from) * progress2;
  };

  // node_modules/motion-dom/dist/es/utils/mix/color.mjs
  var mixLinearColor = (from, to, v) => {
    const fromExpo = from * from;
    const expo = v * (to * to - fromExpo) + fromExpo;
    return expo < 0 ? 0 : Math.sqrt(expo);
  };
  var colorTypes = [hex, rgba, hsla];
  var getColorType = (v) => colorTypes.find((type) => type.test(v));
  function asRGBA(color2) {
    const type = getColorType(color2);
    warning(Boolean(type), `'${color2}' is not an animatable color. Use the equivalent color code instead.`, "color-not-animatable");
    if (!Boolean(type))
      return false;
    let model = type.parse(color2);
    if (type === hsla) {
      model = hslaToRgba(model);
    }
    return model;
  }
  var mixColor = (from, to) => {
    const fromRGBA = asRGBA(from);
    const toRGBA = asRGBA(to);
    if (!fromRGBA || !toRGBA) {
      return mixImmediate(from, to);
    }
    const blended = { ...fromRGBA };
    return (v) => {
      blended.red = mixLinearColor(fromRGBA.red, toRGBA.red, v);
      blended.green = mixLinearColor(fromRGBA.green, toRGBA.green, v);
      blended.blue = mixLinearColor(fromRGBA.blue, toRGBA.blue, v);
      blended.alpha = mixNumber(fromRGBA.alpha, toRGBA.alpha, v);
      return rgba.transform(blended);
    };
  };

  // node_modules/motion-dom/dist/es/utils/mix/visibility.mjs
  var invisibleValues = /* @__PURE__ */ new Set(["none", "hidden"]);
  function mixVisibility(origin, target) {
    if (invisibleValues.has(origin)) {
      return (p) => p <= 0 ? origin : target;
    } else {
      return (p) => p >= 1 ? target : origin;
    }
  }

  // node_modules/motion-dom/dist/es/utils/mix/complex.mjs
  function mixNumber2(a, b) {
    return (p) => mixNumber(a, b, p);
  }
  function getMixer(a) {
    if (typeof a === "number") {
      return mixNumber2;
    } else if (typeof a === "string") {
      return isCSSVariableToken(a) ? mixImmediate : color.test(a) ? mixColor : mixComplex;
    } else if (Array.isArray(a)) {
      return mixArray;
    } else if (typeof a === "object") {
      return color.test(a) ? mixColor : mixObject;
    }
    return mixImmediate;
  }
  function mixArray(a, b) {
    const output = [...a];
    const numValues = output.length;
    const blendValue = a.map((v, i) => getMixer(v)(v, b[i]));
    return (p) => {
      for (let i = 0; i < numValues; i++) {
        output[i] = blendValue[i](p);
      }
      return output;
    };
  }
  function mixObject(a, b) {
    const output = { ...a, ...b };
    const blendValue = {};
    for (const key2 in output) {
      if (a[key2] !== void 0 && b[key2] !== void 0) {
        blendValue[key2] = getMixer(a[key2])(a[key2], b[key2]);
      }
    }
    return (v) => {
      for (const key2 in blendValue) {
        output[key2] = blendValue[key2](v);
      }
      return output;
    };
  }
  function matchOrder(origin, target) {
    const orderedOrigin = [];
    const pointers = { color: 0, var: 0, number: 0 };
    for (let i = 0; i < target.values.length; i++) {
      const type = target.types[i];
      const originIndex = origin.indexes[type][pointers[type]];
      const originValue = origin.values[originIndex] ?? 0;
      orderedOrigin[i] = originValue;
      pointers[type]++;
    }
    return orderedOrigin;
  }
  var mixComplex = (origin, target) => {
    const template = complex.createTransformer(target);
    const originStats = analyseComplexValue(origin);
    const targetStats = analyseComplexValue(target);
    const canInterpolate = originStats.indexes.var.length === targetStats.indexes.var.length && originStats.indexes.color.length === targetStats.indexes.color.length && originStats.indexes.number.length >= targetStats.indexes.number.length;
    if (canInterpolate) {
      if (invisibleValues.has(origin) && !targetStats.values.length || invisibleValues.has(target) && !originStats.values.length) {
        return mixVisibility(origin, target);
      }
      return pipe3(mixArray(matchOrder(originStats, targetStats), targetStats.values), template);
    } else {
      warning(true, `Complex values '${origin}' and '${target}' too different to mix. Ensure all colors are of the same type, and that each contains the same quantity of number and color values. Falling back to instant transition.`, "complex-values-different");
      return mixImmediate(origin, target);
    }
  };

  // node_modules/motion-dom/dist/es/utils/mix/index.mjs
  function mix(from, to, p) {
    if (typeof from === "number" && typeof to === "number" && typeof p === "number") {
      return mixNumber(from, to, p);
    }
    const mixer = getMixer(from);
    return mixer(from, to);
  }

  // node_modules/motion-dom/dist/es/utils/interpolate.mjs
  function createMixers(output, ease, customMixer) {
    const mixers = [];
    const mixerFactory = customMixer || MotionGlobalConfig.mix || mix;
    const numMixers = output.length - 1;
    for (let i = 0; i < numMixers; i++) {
      let mixer = mixerFactory(output[i], output[i + 1]);
      if (ease) {
        const easingFunction = Array.isArray(ease) ? ease[i] || noop2 : ease;
        mixer = pipe3(easingFunction, mixer);
      }
      mixers.push(mixer);
    }
    return mixers;
  }
  function interpolate3(input, output, { clamp: isClamp = true, ease, mixer } = {}) {
    const inputLength = input.length;
    invariant(inputLength === output.length, "Both input and output ranges must be the same length", "range-length");
    if (inputLength === 1)
      return () => output[0];
    if (inputLength === 2 && output[0] === output[1])
      return () => output[1];
    const isZeroDeltaRange = input[0] === input[1];
    if (input[0] > input[inputLength - 1]) {
      input = [...input].reverse();
      output = [...output].reverse();
    }
    const mixers = createMixers(output, ease, mixer);
    const numMixers = mixers.length;
    const interpolator = (v) => {
      if (isZeroDeltaRange && v < input[0])
        return output[0];
      let i = 0;
      if (numMixers > 1) {
        for (; i < input.length - 2; i++) {
          if (v < input[i + 1])
            break;
        }
      }
      const progressInRange = progress(input[i], input[i + 1], v);
      return mixers[i](progressInRange);
    };
    return isClamp ? (v) => interpolator(clamp4(input[0], input[inputLength - 1], v)) : interpolator;
  }

  // node_modules/motion-dom/dist/es/animation/keyframes/offsets/fill.mjs
  function fillOffset(offset, remaining) {
    const min = offset[offset.length - 1];
    for (let i = 1; i <= remaining; i++) {
      const offsetProgress = progress(0, remaining, i);
      offset.push(mixNumber(min, 1, offsetProgress));
    }
  }

  // node_modules/motion-dom/dist/es/animation/keyframes/offsets/default.mjs
  function defaultOffset(arr) {
    const offset = [0];
    fillOffset(offset, arr.length - 1);
    return offset;
  }

  // node_modules/motion-dom/dist/es/utils/supports/flags.mjs
  var supportsFlags = {};

  // node_modules/motion-dom/dist/es/utils/supports/memo.mjs
  function memoSupports(callback, supportsFlag) {
    const memoized = memo(callback);
    return () => supportsFlags[supportsFlag] ?? memoized();
  }

  // node_modules/motion-dom/dist/es/utils/supports/scroll-timeline.mjs
  var supportsScrollTimeline = /* @__PURE__ */ memoSupports(() => window.ScrollTimeline !== void 0, "scrollTimeline");
  var supportsViewTimeline = /* @__PURE__ */ memoSupports(() => window.ViewTimeline !== void 0, "viewTimeline");

  // node_modules/motion-dom/dist/es/utils/resolve-elements.mjs
  function resolveElements(elementOrSelector, scope2, selectorCache) {
    if (elementOrSelector == null) {
      return [];
    }
    if (elementOrSelector instanceof EventTarget) {
      return [elementOrSelector];
    } else if (typeof elementOrSelector === "string") {
      let root = document;
      if (scope2) {
        root = scope2.current;
      }
      const elements = selectorCache?.[elementOrSelector] ?? root.querySelectorAll(elementOrSelector);
      return elements ? Array.from(elements) : [];
    }
    return Array.from(elementOrSelector).filter((element) => element != null);
  }

  // node_modules/motion-dom/dist/es/utils/is-html-element.mjs
  function isHTMLElement(element) {
    return isObject(element) && "offsetHeight" in element;
  }

  // node_modules/motion-dom/dist/es/utils/is-svg-element.mjs
  function isSVGElement(element) {
    return isObject(element) && "ownerSVGElement" in element;
  }

  // node_modules/motion-dom/dist/es/resize/handle-element.mjs
  var resizeHandlers = /* @__PURE__ */ new WeakMap();
  var observer;
  var getSize = (borderBoxAxis, svgAxis, htmlAxis) => (target, borderBoxSize) => {
    if (borderBoxSize && borderBoxSize[0]) {
      return borderBoxSize[0][borderBoxAxis + "Size"];
    } else if (isSVGElement(target) && "getBBox" in target) {
      return target.getBBox()[svgAxis];
    } else {
      return target[htmlAxis];
    }
  };
  var getWidth = /* @__PURE__ */ getSize("inline", "width", "offsetWidth");
  var getHeight = /* @__PURE__ */ getSize("block", "height", "offsetHeight");
  function notifyTarget({ target, borderBoxSize }) {
    resizeHandlers.get(target)?.forEach((handler) => {
      handler(target, {
        get width() {
          return getWidth(target, borderBoxSize);
        },
        get height() {
          return getHeight(target, borderBoxSize);
        }
      });
    });
  }
  function notifyAll(entries) {
    entries.forEach(notifyTarget);
  }
  function createResizeObserver() {
    if (typeof ResizeObserver === "undefined")
      return;
    observer = new ResizeObserver(notifyAll);
  }
  function resizeElement(target, handler) {
    if (!observer)
      createResizeObserver();
    const elements = resolveElements(target);
    elements.forEach((element) => {
      let elementHandlers = resizeHandlers.get(element);
      if (!elementHandlers) {
        elementHandlers = /* @__PURE__ */ new Set();
        resizeHandlers.set(element, elementHandlers);
      }
      elementHandlers.add(handler);
      observer?.observe(element);
    });
    return () => {
      elements.forEach((element) => {
        const elementHandlers = resizeHandlers.get(element);
        elementHandlers?.delete(handler);
        if (!elementHandlers?.size) {
          observer?.unobserve(element);
        }
      });
    };
  }

  // node_modules/motion-dom/dist/es/resize/handle-window.mjs
  var windowCallbacks = /* @__PURE__ */ new Set();
  var windowResizeHandler;
  function createWindowResizeHandler() {
    windowResizeHandler = () => {
      const info = {
        get width() {
          return window.innerWidth;
        },
        get height() {
          return window.innerHeight;
        }
      };
      windowCallbacks.forEach((callback) => callback(info));
    };
    window.addEventListener("resize", windowResizeHandler);
  }
  function resizeWindow(callback) {
    windowCallbacks.add(callback);
    if (!windowResizeHandler)
      createWindowResizeHandler();
    return () => {
      windowCallbacks.delete(callback);
      if (!windowCallbacks.size && typeof windowResizeHandler === "function") {
        window.removeEventListener("resize", windowResizeHandler);
        windowResizeHandler = void 0;
      }
    };
  }

  // node_modules/motion-dom/dist/es/resize/index.mjs
  function resize(a, b) {
    return typeof a === "function" ? resizeWindow(a) : resizeElement(a, b);
  }

  // node_modules/motion-dom/dist/es/scroll/observe.mjs
  function observeTimeline(update, timeline2) {
    let prevProgress;
    const onFrame = () => {
      const { currentTime } = timeline2;
      const percentage = currentTime === null ? 0 : currentTime.value;
      const progress2 = percentage / 100;
      if (prevProgress !== progress2) {
        update(progress2);
      }
      prevProgress = progress2;
    };
    frame.preUpdate(onFrame, true);
    return () => cancelFrame(onFrame);
  }

  // node_modules/framer-motion/dist/es/render/dom/scroll/utils/can-use-native-timeline.mjs
  function canUseNativeTimeline(target) {
    if (typeof window === "undefined")
      return false;
    return target ? supportsViewTimeline() : supportsScrollTimeline();
  }

  // node_modules/framer-motion/dist/es/render/dom/scroll/info.mjs
  var maxElapsed2 = 50;
  var createAxisInfo = () => ({
    current: 0,
    offset: [],
    progress: 0,
    scrollLength: 0,
    targetOffset: 0,
    targetLength: 0,
    containerLength: 0,
    velocity: 0
  });
  var createScrollInfo = () => ({
    time: 0,
    x: createAxisInfo(),
    y: createAxisInfo()
  });
  var keys = {
    x: {
      length: "Width",
      position: "Left"
    },
    y: {
      length: "Height",
      position: "Top"
    }
  };
  function updateAxisInfo(element, axisName, info, time) {
    const axis = info[axisName];
    const { length, position } = keys[axisName];
    const prev = axis.current;
    const prevTime = info.time;
    axis.current = Math.abs(element[`scroll${position}`]);
    axis.scrollLength = element[`scroll${length}`] - element[`client${length}`];
    axis.offset.length = 0;
    axis.offset[0] = 0;
    axis.offset[1] = axis.scrollLength;
    axis.progress = progress(0, axis.scrollLength, axis.current);
    const elapsed = time - prevTime;
    axis.velocity = elapsed > maxElapsed2 ? 0 : velocityPerSecond(axis.current - prev, elapsed);
  }
  function updateScrollInfo(element, info, time) {
    updateAxisInfo(element, "x", info, time);
    updateAxisInfo(element, "y", info, time);
    info.time = time;
  }

  // node_modules/framer-motion/dist/es/render/dom/scroll/offsets/inset.mjs
  function calcInset(element, container) {
    const inset = { x: 0, y: 0 };
    let current = element;
    while (current && current !== container) {
      if (isHTMLElement(current)) {
        inset.x += current.offsetLeft;
        inset.y += current.offsetTop;
        current = current.offsetParent;
      } else if (current.tagName === "svg") {
        const svgBoundingBox = current.getBoundingClientRect();
        current = current.parentElement;
        const parentBoundingBox = current.getBoundingClientRect();
        inset.x += svgBoundingBox.left - parentBoundingBox.left;
        inset.y += svgBoundingBox.top - parentBoundingBox.top;
      } else if (current instanceof SVGGraphicsElement) {
        const { x, y } = current.getBBox();
        inset.x += x;
        inset.y += y;
        let svg = null;
        let parent = current.parentNode;
        while (!svg) {
          if (parent.tagName === "svg") {
            svg = parent;
          }
          parent = current.parentNode;
        }
        current = svg;
      } else {
        break;
      }
    }
    return inset;
  }

  // node_modules/framer-motion/dist/es/render/dom/scroll/offsets/edge.mjs
  var namedEdges = {
    start: 0,
    center: 0.5,
    end: 1
  };
  function resolveEdge(edge, length, inset = 0) {
    let delta = 0;
    if (edge in namedEdges) {
      edge = namedEdges[edge];
    }
    if (typeof edge === "string") {
      const asNumber = parseFloat(edge);
      if (edge.endsWith("px")) {
        delta = asNumber;
      } else if (edge.endsWith("%")) {
        edge = asNumber / 100;
      } else if (edge.endsWith("vw")) {
        delta = asNumber / 100 * document.documentElement.clientWidth;
      } else if (edge.endsWith("vh")) {
        delta = asNumber / 100 * document.documentElement.clientHeight;
      } else {
        edge = asNumber;
      }
    }
    if (typeof edge === "number") {
      delta = length * edge;
    }
    return inset + delta;
  }

  // node_modules/framer-motion/dist/es/render/dom/scroll/offsets/offset.mjs
  var defaultOffset2 = [0, 0];
  function resolveOffset(offset, containerLength, targetLength, targetInset) {
    let offsetDefinition = Array.isArray(offset) ? offset : defaultOffset2;
    let targetPoint = 0;
    let containerPoint = 0;
    if (typeof offset === "number") {
      offsetDefinition = [offset, offset];
    } else if (typeof offset === "string") {
      offset = offset.trim();
      if (offset.includes(" ")) {
        offsetDefinition = offset.split(" ");
      } else {
        offsetDefinition = [offset, namedEdges[offset] ? offset : `0`];
      }
    }
    targetPoint = resolveEdge(offsetDefinition[0], targetLength, targetInset);
    containerPoint = resolveEdge(offsetDefinition[1], containerLength);
    return targetPoint - containerPoint;
  }

  // node_modules/framer-motion/dist/es/render/dom/scroll/offsets/presets.mjs
  var ScrollOffset = {
    Enter: [
      [0, 1],
      [1, 1]
    ],
    Exit: [
      [0, 0],
      [1, 0]
    ],
    Any: [
      [1, 0],
      [0, 1]
    ],
    All: [
      [0, 0],
      [1, 1]
    ]
  };

  // node_modules/framer-motion/dist/es/render/dom/scroll/offsets/index.mjs
  var point = { x: 0, y: 0 };
  function getTargetSize(target) {
    return "getBBox" in target && target.tagName !== "svg" ? target.getBBox() : { width: target.clientWidth, height: target.clientHeight };
  }
  function resolveOffsets(container, info, options) {
    const { offset: offsetDefinition = ScrollOffset.All } = options;
    const { target = container, axis = "y" } = options;
    const lengthLabel = axis === "y" ? "height" : "width";
    const inset = target !== container ? calcInset(target, container) : point;
    const targetSize = target === container ? { width: container.scrollWidth, height: container.scrollHeight } : getTargetSize(target);
    const containerSize = {
      width: container.clientWidth,
      height: container.clientHeight
    };
    info[axis].offset.length = 0;
    let hasChanged = !info[axis].interpolate;
    const numOffsets = offsetDefinition.length;
    for (let i = 0; i < numOffsets; i++) {
      const offset = resolveOffset(offsetDefinition[i], containerSize[lengthLabel], targetSize[lengthLabel], inset[axis]);
      if (!hasChanged && offset !== info[axis].interpolatorOffsets[i]) {
        hasChanged = true;
      }
      info[axis].offset[i] = offset;
    }
    if (hasChanged) {
      info[axis].interpolate = interpolate3(info[axis].offset, defaultOffset(offsetDefinition), { clamp: false });
      info[axis].interpolatorOffsets = [...info[axis].offset];
    }
    info[axis].progress = clamp4(0, 1, info[axis].interpolate(info[axis].current));
  }

  // node_modules/framer-motion/dist/es/render/dom/scroll/on-scroll-handler.mjs
  function measure(container, target = container, info) {
    info.x.targetOffset = 0;
    info.y.targetOffset = 0;
    if (target !== container) {
      let node = target;
      while (node && node !== container) {
        info.x.targetOffset += node.offsetLeft;
        info.y.targetOffset += node.offsetTop;
        node = node.offsetParent;
      }
    }
    info.x.targetLength = target === container ? target.scrollWidth : target.clientWidth;
    info.y.targetLength = target === container ? target.scrollHeight : target.clientHeight;
    info.x.containerLength = container.clientWidth;
    info.y.containerLength = container.clientHeight;
    if (true) {
      if (container && target && target !== container) {
        warnOnce(getComputedStyle(container).position !== "static", "Please ensure that the container has a non-static position, like 'relative', 'fixed', or 'absolute' to ensure scroll offset is calculated correctly.");
      }
    }
  }
  function createOnScrollHandler(element, onScroll, info, options = {}) {
    return {
      measure: (time) => {
        measure(element, options.target, info);
        updateScrollInfo(element, info, time);
        if (options.offset || options.target) {
          resolveOffsets(element, info, options);
        }
      },
      notify: () => onScroll(info)
    };
  }

  // node_modules/framer-motion/dist/es/render/dom/scroll/track.mjs
  var scrollListeners = /* @__PURE__ */ new WeakMap();
  var resizeListeners = /* @__PURE__ */ new WeakMap();
  var onScrollHandlers = /* @__PURE__ */ new WeakMap();
  var scrollSize = /* @__PURE__ */ new WeakMap();
  var dimensionCheckProcesses = /* @__PURE__ */ new WeakMap();
  var getEventTarget = (element) => element === document.scrollingElement ? window : element;
  function scrollInfo(onScroll, { container = document.scrollingElement, trackContentSize = false, ...options } = {}) {
    if (!container)
      return noop2;
    let containerHandlers = onScrollHandlers.get(container);
    if (!containerHandlers) {
      containerHandlers = /* @__PURE__ */ new Set();
      onScrollHandlers.set(container, containerHandlers);
    }
    const info = createScrollInfo();
    const containerHandler = createOnScrollHandler(container, onScroll, info, options);
    containerHandlers.add(containerHandler);
    if (!scrollListeners.has(container)) {
      const measureAll = () => {
        for (const handler of containerHandlers) {
          handler.measure(frameData.timestamp);
        }
        frame.preUpdate(notifyAll2);
      };
      const notifyAll2 = () => {
        for (const handler of containerHandlers) {
          handler.notify();
        }
      };
      const listener2 = () => frame.read(measureAll);
      scrollListeners.set(container, listener2);
      const target = getEventTarget(container);
      window.addEventListener("resize", listener2);
      if (container !== document.documentElement) {
        resizeListeners.set(container, resize(container, listener2));
      }
      target.addEventListener("scroll", listener2);
      listener2();
    }
    if (trackContentSize && !dimensionCheckProcesses.has(container)) {
      const listener2 = scrollListeners.get(container);
      const size = {
        width: container.scrollWidth,
        height: container.scrollHeight
      };
      scrollSize.set(container, size);
      const checkScrollDimensions = () => {
        const newWidth = container.scrollWidth;
        const newHeight = container.scrollHeight;
        if (size.width !== newWidth || size.height !== newHeight) {
          listener2();
          size.width = newWidth;
          size.height = newHeight;
        }
      };
      const dimensionCheckProcess = frame.read(checkScrollDimensions, true);
      dimensionCheckProcesses.set(container, dimensionCheckProcess);
    }
    const listener = scrollListeners.get(container);
    frame.read(listener, false, true);
    return () => {
      cancelFrame(listener);
      const currentHandlers = onScrollHandlers.get(container);
      if (!currentHandlers)
        return;
      currentHandlers.delete(containerHandler);
      if (currentHandlers.size)
        return;
      const scrollListener = scrollListeners.get(container);
      scrollListeners.delete(container);
      if (scrollListener) {
        getEventTarget(container).removeEventListener("scroll", scrollListener);
        resizeListeners.get(container)?.();
        window.removeEventListener("resize", scrollListener);
      }
      const dimensionCheckProcess = dimensionCheckProcesses.get(container);
      if (dimensionCheckProcess) {
        cancelFrame(dimensionCheckProcess);
        dimensionCheckProcesses.delete(container);
      }
      scrollSize.delete(container);
    };
  }

  // node_modules/framer-motion/dist/es/render/dom/scroll/utils/offset-to-range.mjs
  var presets = [
    [ScrollOffset.Enter, "entry"],
    [ScrollOffset.Exit, "exit"],
    [ScrollOffset.Any, "cover"],
    [ScrollOffset.All, "contain"]
  ];
  function matchesPreset(offset, preset) {
    if (offset.length !== 2)
      return false;
    for (let i = 0; i < 2; i++) {
      const o = offset[i];
      const p = preset[i];
      if (!Array.isArray(o) || o.length !== 2 || o[0] !== p[0] || o[1] !== p[1])
        return false;
    }
    return true;
  }
  function offsetToViewTimelineRange(offset) {
    if (!offset) {
      return { rangeStart: "contain 0%", rangeEnd: "contain 100%" };
    }
    for (const [preset, name] of presets) {
      if (matchesPreset(offset, preset)) {
        return { rangeStart: `${name} 0%`, rangeEnd: `${name} 100%` };
      }
    }
    return void 0;
  }

  // node_modules/framer-motion/dist/es/render/dom/scroll/utils/get-timeline.mjs
  var timelineCache = /* @__PURE__ */ new Map();
  function scrollTimelineFallback(options) {
    const currentTime = { value: 0 };
    const cancel = scrollInfo((info) => {
      currentTime.value = info[options.axis].progress * 100;
    }, options);
    return { currentTime, cancel };
  }
  function getTimeline({ source, container, ...options }) {
    const { axis } = options;
    if (source)
      container = source;
    let containerCache = timelineCache.get(container);
    if (!containerCache) {
      containerCache = /* @__PURE__ */ new Map();
      timelineCache.set(container, containerCache);
    }
    const targetKey = options.target ?? "self";
    let targetCache = containerCache.get(targetKey);
    if (!targetCache) {
      targetCache = {};
      containerCache.set(targetKey, targetCache);
    }
    const axisKey = axis + (options.offset ?? []).join(",");
    if (!targetCache[axisKey]) {
      if (options.target && canUseNativeTimeline(options.target)) {
        const range = offsetToViewTimelineRange(options.offset);
        if (range) {
          targetCache[axisKey] = new ViewTimeline({
            subject: options.target,
            axis
          });
        } else {
          targetCache[axisKey] = scrollTimelineFallback({
            container,
            ...options
          });
        }
      } else if (canUseNativeTimeline()) {
        targetCache[axisKey] = new ScrollTimeline({
          source: container,
          axis
        });
      } else {
        targetCache[axisKey] = scrollTimelineFallback({
          container,
          ...options
        });
      }
    }
    return targetCache[axisKey];
  }

  // node_modules/framer-motion/dist/es/render/dom/scroll/attach-animation.mjs
  function attachToAnimation(animation, options) {
    const timeline2 = getTimeline(options);
    const range = options.target ? offsetToViewTimelineRange(options.offset) : void 0;
    const useNative = options.target ? canUseNativeTimeline(options.target) && !!range : canUseNativeTimeline();
    return animation.attachTimeline({
      timeline: useNative ? timeline2 : void 0,
      ...range && useNative && {
        rangeStart: range.rangeStart,
        rangeEnd: range.rangeEnd
      },
      observe: (valueAnimation) => {
        valueAnimation.pause();
        return observeTimeline((progress2) => {
          valueAnimation.time = valueAnimation.iterationDuration * progress2;
        }, timeline2);
      }
    });
  }

  // node_modules/framer-motion/dist/es/render/dom/scroll/attach-function.mjs
  function isOnScrollWithInfo(onScroll) {
    return onScroll.length === 2;
  }
  function attachToFunction(onScroll, options) {
    if (isOnScrollWithInfo(onScroll)) {
      return scrollInfo((info) => {
        onScroll(info[options.axis].progress, info);
      }, options);
    } else {
      return observeTimeline(onScroll, getTimeline(options));
    }
  }

  // node_modules/framer-motion/dist/es/render/dom/scroll/index.mjs
  function scroll(onScroll, { axis = "y", container = document.scrollingElement, ...options } = {}) {
    if (!container)
      return noop2;
    const optionsWithDefaults = { axis, container, ...options };
    return typeof onScroll === "function" ? attachToFunction(onScroll, optionsWithDefaults) : attachToAnimation(onScroll, optionsWithDefaults);
  }

  // node_modules/framer-motion/dist/es/render/dom/viewport/index.mjs
  var thresholds = {
    some: 0,
    all: 1
  };
  function inView(elementOrSelector, onStart, { root, margin: rootMargin, amount = "some" } = {}) {
    const elements = resolveElements(elementOrSelector);
    const activeIntersections = /* @__PURE__ */ new WeakMap();
    const onIntersectionChange = (entries) => {
      entries.forEach((entry) => {
        const onEnd = activeIntersections.get(entry.target);
        if (entry.isIntersecting === Boolean(onEnd))
          return;
        if (entry.isIntersecting) {
          const newOnEnd = onStart(entry.target, entry);
          if (typeof newOnEnd === "function") {
            activeIntersections.set(entry.target, newOnEnd);
          } else {
            observer2.unobserve(entry.target);
          }
        } else if (typeof onEnd === "function") {
          onEnd(entry);
          activeIntersections.delete(entry.target);
        }
      });
    };
    const observer2 = new IntersectionObserver(onIntersectionChange, {
      root,
      rootMargin,
      threshold: typeof amount === "number" ? amount : thresholds[amount]
    });
    elements.forEach((element) => observer2.observe(element));
    return () => observer2.disconnect();
  }

  // src/ts/site.ts
  (() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const navToggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector(".nav");
    const brand = document.querySelector(".brand");
    const progress2 = document.querySelector(".scroll-progress span");
    const header = document.querySelector(".site-header");
    const hero = document.querySelector(".hero");
    if (navToggle && nav) {
      navToggle.addEventListener("click", () => {
        const isOpen = nav.classList.toggle("open");
        navToggle.setAttribute("aria-expanded", String(isOpen));
      });
      nav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
          nav.classList.remove("open");
          navToggle.setAttribute("aria-expanded", "false");
        });
      });
    }
    const sectionLinks = Array.from(
      document.querySelectorAll(".nav a[data-section]")
    );
    const sections = sectionLinks.map((link) => {
      const id = link.getAttribute("data-section");
      return id ? document.getElementById(id) : null;
    }).filter(
      (section) => section instanceof HTMLElement
    );
    function setActiveLink() {
      const headerHeight = header ? header.offsetHeight : 0;
      const marker = Math.max(
        headerHeight + 24,
        Math.round(window.innerHeight * 0.36)
      );
      let activeId = "";
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= marker && rect.bottom > marker) {
          activeId = section.id;
        }
      });
      if (!activeId && sections.length > 0) {
        activeId = sections[sections.length - 1].id;
        for (let i = 0; i < sections.length; i += 1) {
          if (sections[i].getBoundingClientRect().top > marker) {
            activeId = i === 0 ? sections[0].id : sections[i - 1].id;
            break;
          }
        }
      }
      sectionLinks.forEach((link) => {
        const isActive = link.getAttribute("data-section") === activeId;
        link.classList.toggle("active", isActive);
      });
    }
    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        setActiveLink();
        ticking = false;
      });
    }
    setActiveLink();
    window.addEventListener("scroll", onScroll, { passive: true });
    if (progress2) {
      scroll((value) => {
        progress2.style.transform = "scaleX(" + value.toFixed(3) + ")";
      });
    }
    if (brand && !prefersReducedMotion) {
      brand.addEventListener("click", () => {
        gsapWithCSS.killTweensOf(brand);
        gsapWithCSS.fromTo(
          brand,
          { scale: 1 },
          {
            scale: 1.08,
            duration: 0.24,
            ease: "power2.out",
            yoyo: true,
            repeat: 1,
            overwrite: true,
            clearProps: "transform"
          }
        );
      });
    }
    const titleSplitters = /* @__PURE__ */ new WeakMap();
    const sectionTitles = document.querySelectorAll(".section-head h2");
    sectionTitles.forEach((title) => {
      if (title.dataset.splitDone === "true") return;
      const splitter = splitText(title, {
        words: { class: "title-word" },
        chars: false,
        lines: false
      });
      titleSplitters.set(title, splitter.words);
      title.dataset.splitDone = "true";
    });
    function animateSectionTitle(sectionHead) {
      if (sectionHead.dataset.titleAnimated === "true") return;
      const title = sectionHead.querySelector("h2");
      const words = title ? titleSplitters.get(title) : null;
      if (!title || !words || words.length === 0) return;
      sectionHead.dataset.titleAnimated = "true";
      if (prefersReducedMotion) {
        words.forEach((word) => {
          word.style.opacity = "1";
          word.style.transform = "none";
        });
        return;
      }
      animate(words, {
        translateY: [10, 0],
        opacity: [0, 1],
        delay: stagger(58),
        duration: 420,
        ease: "outQuad"
      });
    }
    const impactValues = document.querySelectorAll(".impact-value");
    function parseCounterText(text) {
      const clean = text.replace(/\s+/g, "");
      let match = clean.match(/^~?(\d+)%$/);
      if (match) {
        return {
          from: 0,
          to: Number(match[1]),
          format: (value) => (clean.startsWith("~") ? "~" : "") + value + "%"
        };
      }
      match = clean.match(/^(\d+)-(\d+)x$/i);
      if (match) {
        const start = Number(match[1]);
        const end = Number(match[2]);
        return {
          from: start,
          to: end,
          format: (value) => start + "-" + value + "x"
        };
      }
      match = clean.match(/^(\d+)x$/i);
      if (match) {
        return {
          from: 0,
          to: Number(match[1]),
          format: (value) => value + "x"
        };
      }
      return null;
    }
    function animateCounter(el, config3) {
      if (!config3 || el.dataset.counted === "true") return;
      const state = { value: config3.from };
      el.dataset.counted = "true";
      el.classList.add("counting");
      gsapWithCSS.to(state, {
        value: config3.to,
        duration: 0.98,
        ease: "power3.out",
        overwrite: true,
        onUpdate: () => {
          el.textContent = config3.format(Math.round(state.value));
        },
        onComplete: () => {
          el.textContent = config3.format(config3.to);
          el.classList.remove("counting");
        }
      });
    }
    const spotlightCards = document.querySelectorAll(".project-card");
    if (!prefersReducedMotion) {
      spotlightCards.forEach((card) => {
        card.addEventListener("pointermove", (event) => {
          const rect = card.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width * 100;
          const y = (event.clientY - rect.top) / rect.height * 100;
          gsapWithCSS.to(card, {
            "--spot-x": x.toFixed(2) + "%",
            "--spot-y": y.toFixed(2) + "%",
            duration: 0.22,
            ease: "power2.out",
            overwrite: "auto"
          });
        });
        card.addEventListener("pointerenter", () => {
          card.classList.add("spotlight-on");
        });
        card.addEventListener("pointerleave", () => {
          card.classList.remove("spotlight-on");
        });
      });
      if (hero) {
        hero.addEventListener("pointermove", (event) => {
          const rect = hero.getBoundingClientRect();
          const nx = (event.clientX - rect.left) / rect.width - 0.5;
          const ny = (event.clientY - rect.top) / rect.height - 0.5;
          gsapWithCSS.to(hero, {
            "--hero-shift-x": (nx * 18).toFixed(1) + "px",
            "--hero-shift-y": (ny * 16).toFixed(1) + "px",
            duration: 0.3,
            ease: "power2.out",
            overwrite: "auto"
          });
        });
        hero.addEventListener("pointerleave", () => {
          gsapWithCSS.to(hero, {
            "--hero-shift-x": "0px",
            "--hero-shift-y": "0px",
            duration: 0.35,
            ease: "power2.out",
            overwrite: "auto"
          });
        });
      }
    }
    const revealTargets = document.querySelectorAll(
      ".card, .panel, .project-card, .role-card, .contact-card, .section-head"
    );
    revealTargets.forEach((el, idx) => {
      el.classList.add("reveal");
      el.classList.add("reveal-pending");
      el.style.setProperty("--reveal-delay", idx % 6 * 50 + "ms");
      inView(
        el,
        (element) => {
          const target = element;
          target.classList.add("in");
          target.classList.remove("reveal-pending");
          if (target.classList.contains("section-head")) {
            animateSectionTitle(target);
          }
        },
        { amount: 0.15, margin: "0px 0px -8% 0px" }
      );
    });
    impactValues.forEach((value) => {
      const tile = value.closest(".impact-tile");
      if (!tile) {
        animateCounter(value, parseCounterText(value.textContent ?? ""));
        return;
      }
      tile.classList.add("reveal");
      tile.classList.add("reveal-pending");
      inView(
        tile,
        (element) => {
          const target = element;
          target.classList.add("in");
          target.classList.remove("reveal-pending");
          animateCounter(value, parseCounterText(value.textContent ?? ""));
        },
        { amount: 0.2, margin: "0px 0px -8% 0px" }
      );
    });
    window.setTimeout(() => {
      revealTargets.forEach((el) => {
        if (el.classList.contains("reveal-pending")) {
          el.classList.remove("reveal-pending");
          if (el.classList.contains("section-head")) {
            animateSectionTitle(el);
          }
        }
      });
      impactValues.forEach((value) => {
        const tile = value.closest(".impact-tile");
        if (tile && tile.classList.contains("reveal-pending")) {
          tile.classList.remove("reveal-pending");
          animateCounter(value, parseCounterText(value.textContent ?? ""));
        }
      });
    }, 1400);
  })();
})();
/*! Bundled license information:

animejs/dist/modules/core/consts.js:
animejs/dist/modules/core/globals.js:
animejs/dist/modules/core/helpers.js:
animejs/dist/modules/core/transforms.js:
animejs/dist/modules/core/colors.js:
animejs/dist/modules/core/values.js:
animejs/dist/modules/core/render.js:
animejs/dist/modules/core/styles.js:
animejs/dist/modules/core/clock.js:
animejs/dist/modules/core/targets.js:
animejs/dist/modules/core/units.js:
  (**
   * Anime.js - core - ESM
   * @version v4.3.6
   * @license MIT
   * @copyright 2026 - Julian Garnier
   *)

animejs/dist/modules/animation/additive.js:
animejs/dist/modules/animation/composition.js:
animejs/dist/modules/animation/animation.js:
  (**
   * Anime.js - animation - ESM
   * @version v4.3.6
   * @license MIT
   * @copyright 2026 - Julian Garnier
   *)

animejs/dist/modules/engine/engine.js:
  (**
   * Anime.js - engine - ESM
   * @version v4.3.6
   * @license MIT
   * @copyright 2026 - Julian Garnier
   *)

animejs/dist/modules/timer/timer.js:
  (**
   * Anime.js - timer - ESM
   * @version v4.3.6
   * @license MIT
   * @copyright 2026 - Julian Garnier
   *)

animejs/dist/modules/easings/none.js:
animejs/dist/modules/easings/eases/parser.js:
  (**
   * Anime.js - easings - ESM
   * @version v4.3.6
   * @license MIT
   * @copyright 2026 - Julian Garnier
   *)

animejs/dist/modules/timeline/position.js:
  (**
   * Anime.js - timeline - ESM
   * @version v4.3.6
   * @license MIT
   * @copyright 2026 - Julian Garnier
   *)

animejs/dist/modules/utils/time.js:
animejs/dist/modules/utils/random.js:
animejs/dist/modules/utils/stagger.js:
  (**
   * Anime.js - utils - ESM
   * @version v4.3.6
   * @license MIT
   * @copyright 2026 - Julian Garnier
   *)

animejs/dist/modules/text/split.js:
  (**
   * Anime.js - text - ESM
   * @version v4.3.6
   * @license MIT
   * @copyright 2026 - Julian Garnier
   *)

animejs/dist/modules/index.js:
  (**
   * Anime.js - ESM
   * @version v4.3.6
   * @license MIT
   * @copyright 2026 - Julian Garnier
   *)

gsap/gsap-core.js:
  (*!
   * GSAP 3.14.2
   * https://gsap.com
   *
   * @license Copyright 2008-2025, GreenSock. All rights reserved.
   * Subject to the terms at https://gsap.com/standard-license
   * @author: Jack Doyle, jack@greensock.com
  *)

gsap/CSSPlugin.js:
  (*!
   * CSSPlugin 3.14.2
   * https://gsap.com
   *
   * Copyright 2008-2025, GreenSock. All rights reserved.
   * Subject to the terms at https://gsap.com/standard-license
   * @author: Jack Doyle, jack@greensock.com
  *)
*/
