'use strict';

var _ = module.exports;

var TOUCH_EVENT = 1;

var elementStyle = document.createElement('div').style;

var vendor = (function () {

	var transformNames = {
		webkit: 'webkitTransform',
		Moz: 'MozTransform',
		O: 'OTransform',
		ms: 'msTransform',
		standard: 'transform'
	};

	for (var key in transformNames) {
		if (elementStyle[transformNames[key]] !== undefined) {
			return key;
		}
	}

	return false;
})();

function prefixStyle(style) {
	if (vendor === false)
		return false;

	if (vendor === 'standard') {
		return style;
	}

	return vendor + style.charAt(0).toUpperCase() + style.substr(1);
}

_.extend = function (target, obj) {
	for (var key in obj) {
		target[key] = obj[key];
	}
};

_.addEvent = function (el, type, fn, capture) {
	el.addEventListener(type, fn, !!capture);
};

_.removeEvent = function (el, type, fn, capture) {
	el.removeEventListener(type, fn, !!capture);
};  

_.offset = function (el) {
	var left = 0;
	var top = 0;

	while (el) {
		left -= el.offsetLeft;
		top -= el.offsetTop;
		el = el.offsetParent;
	}

	return {
		left: left,
		top: top
	};
};

_.momentum = function (current, start, time, lowerMargin, wrapperSize, options) {
	var distance = current - start;
	var speed = Math.abs(distance) / time;

	var deceleration = options.deceleration;
	var duration = options.swipeTime;

	var destination = current + speed / deceleration * ( distance < 0 ? -1 : 1 );

	destination = Math.round(destination / options.itemHeight) * options.itemHeight;

	if (destination < lowerMargin) {
		destination = wrapperSize ? lowerMargin - ( wrapperSize / 4 * speed ) : lowerMargin;
		duration = options.swipeBounceTime - options.bounceTime;
	} else if (destination > 0) {
		destination = wrapperSize ? wrapperSize / 4 * speed : 0;
		duration = options.swipeBounceTime - options.bounceTime;
	}

	return {
		destination: Math.round(destination),
		duration: duration
	};
};


// This should find all Android browsers lower than build 535.19 (both stock browser and webview)
_.isBadAndroid = /Android /.test(window.navigator.appVersion) && !(/Chrome\/\d/.test(window.navigator.appVersion));

var transform = prefixStyle('transform');

_.extend(_, {
	hasTransform: transform !== false,
	hasPerspective: prefixStyle('perspective') in elementStyle,
	hasTouch: 'ontouchstart' in window,
	hasTransition: prefixStyle('transition') in elementStyle
});

_.style = {};

_.extend(_.style, {
	transform: transform,
	transitionTimingFunction: prefixStyle('transitionTimingFunction'),
	transitionDuration: prefixStyle('transitionDuration'),
	transitionDelay: prefixStyle('transitionDelay'),
	transformOrigin: prefixStyle('transformOrigin'),
	transitionEnd: prefixStyle('transitionEnd')
});

_.eventType = {};

_.extend(_.eventType, {
	touchstart: TOUCH_EVENT,
	touchmove: TOUCH_EVENT,
	touchend: TOUCH_EVENT
});

_.ease = {};

_.extend(_.ease, {
	//easeOutQuint
	swipe: {
		style: 'cubic-bezier(0.23, 1, 0.32, 1)',
		fn: function (t) {
			return 1 + ( --t * t * t * t * t);
		}
	},
	//easeOutQuard
	swipeBounce: {
		style: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
		fn: function (t) {
			return t * (2 - t);
		}
	},
	//easeOutQuart
	bounce: {
		style: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
		fn: function (t) {
			return 1 - ( --t * t * t * t);
		}
	}
});
