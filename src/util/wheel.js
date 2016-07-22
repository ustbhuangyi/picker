'use strict';

var _ = require('./util');

var TOUCH_EVENT = 1;

(function (window, document, Math) {

	function Wheel(el, options) {
		this.wrapper = typeof el === 'string' ? document.querySelector(el) : el;
		this.scroller = this.wrapper.querySelector('.wheel-scroll');
		this.items = this.wrapper.querySelectorAll('.wheel-item');

		this.scrollerStyle = this.scroller.style;

		this.options = {
			selectedIndex: 0,
			rotate: 25,
			swipeTime: 2500,
			bounceTime: 700,
			adjustTime: 400,
			swipeBounceTime: 1200,
			resizePolling: 60,
			deceleration: 0.001,
			momentumLimitTime: 300,
			momentumLimitDistance: 15
		};

		_.extend(this.options, options);

		//if (this.options.tap === true) {
		//	this.options.tap = 'tap';
		//}
		this.translateZ = _.hasPerspective ? ' translateZ(0)' : '';

		this._init();

		this.refresh();

		this.scrollTo(this.y);

		this.enable();

	}

	Wheel.prototype = {
		_init: function () {
			this._events = {};

			this._addEvents();
		},
		_addEvents: function () {
			var eventOperation = _.addEvent;
			this._handleEvents(eventOperation);
		},
		_removeEvents: function () {
			var eventOperation = _.removeEvent;
			this._handleEvents(eventOperation);
		},
		_handleEvents: function (eventOperation) {

			var target = this.options.bindToWrapper ? this.wrapper : window;

			eventOperation(window, 'orientationchange', this);
			eventOperation(window, 'resize', this);

			if (this.options.click) {
				eventOperation(this.wrapper, 'click', this, true);
			}

			if (_.hasTouch) {

				eventOperation(this.wrapper, 'touchstart', this);
				eventOperation(target, 'touchmove', this);
				eventOperation(target, 'touchcancel', this);
				eventOperation(target, 'touchend', this);
			}

			eventOperation(this.scroller, _.style.transitionEnd, this);
		},
		_start: function (e) {
			var eventType = _.eventType[e.type];
			if (eventType !== TOUCH_EVENT) {
				return;
			}

			if (!this.enabled || (this.initiated && this.initiated !== eventType))
				return;

			this.initiated = eventType;

			if (!_.isBadAndroid) {
				e.preventDefault();
			}

			this.moved = false;
			this.distY = 0;

			this._transitionTime();

			this.startTime = +new Date;

			this.target = e.target;

			if (this.isInTransition) {
				this.isInTransition = false;
				var pos = this.getComputedPosition();
				this._translate(Math.round(pos.y));
				this.target = this.items[Math.round(-pos.y / this.itemHeight)];
				//this._trigger('scrollEnd');
			}

			var point = e.touches ? e.touches[0] : e;

			this.startY = this.y;

			this.pointY = point.pageY;

			this._trigger('beforeScrollStart');
		},
		_move: function (e) {
			if (!this.enabled || _.eventType[e.type] !== this.initiated)
				return;

			if (this.options.preventDefault) {
				e.preventDefault();
			}

			var point = e.touches ? e.touches[0] : e;

			var deltaY = point.pageY - this.pointY;

			this.pointY = point.pageY;

			this.distY += deltaY;

			var absDistY = Math.abs(this.distY);
			var timestamp = +new Date;

			// We need to move at least 15 pixels for the scrolling to initiate
			if (timestamp - this.startTime > this.options.momentumLimitTime && (absDistY < this.options.momentumLimitDistance)) {
				return;
			}

			var newY = this.y + deltaY;

			// Slow down if outside of the boundaries
			if (newY > 0 || newY < this.maxScrollY) {
				newY = this.y + deltaY / 3;
			}

			if (!this.moved) {
				this.moved = true;
				this._trigger('scrollStart');
			}

			this._translate(newY);

			if (timestamp - this.startTime > this.options.momentumLimitTime) {
				this.startTime = timestamp;
				this.startY = this.y;
			}

			var scrollTop = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
			var pY = this.pointY - scrollTop;

			if (pY < this.options.momentumLimitDistance || pY > document.documentElement.clientHeight - this.options.momentumLimitDistance) {
				this._end(e);
			}

		},
		_end: function (e) {
			if (!this.enabled || _.eventType[e.type] !== this.initiated)
				return;
			this.initiated = false;

			e.preventDefault();
			// reset if we are outside of the boundaries
			if (this.resetPosition(this.options.bounceTime, _.ease.bounce)) {
				return;
			}

			// ensures that the last position is rounded
			var newY = Math.round(this.y);
			var absDistY = Math.abs(newY - this.startY);
			var easing = _.ease.swipe;
			var time = 0;

			// we scrolled less than 15 pixels
			if (!this.moved) {
				time = this.options.adjustTime;
				if (this.target.className === 'wheel-scroll') {
					var index = Math.abs(Math.round(newY / this.itemHeight));
					var offset = Math.round((this.pointY + _.offset(this.target).top - this.itemHeight / 2) / this.itemHeight);
					this.target = this.items[index + offset];
				}
				this.scrollToElement(this.target, time, easing);

				this._trigger('scrollCancel');
				return;
			}

			this.isInTransition = false;
			this.endTime = +new Date;
			this.scrollTo(newY);

			var duration = this.endTime - this.startTime;

			// start momentum animation if needed
			if (duration < this.options.momentumLimitTime && absDistY > this.options.momentumLimitDistance) {
				var momentumY = _.momentum(this.y, this.startY, duration, this.maxScrollY, this.wrapperHeight, this.options);
				newY = momentumY.destination;
				time = momentumY.duration;

			} else {
				newY = Math.round(newY / this.itemHeight) * this.itemHeight;
				time = this.options.adjustTime;
			}

			if (newY !== this.y) {
				// change easing function when scroller goes out of the boundaries
				if (newY > 0 || newY < this.maxScrollY) {
					easing = _.ease.swipeBounce;
				}
				this.scrollTo(newY, time, easing);
				return;
			}

			this.selectedIndex = Math.abs(this.y / this.itemHeight) | 0;
			this._trigger('scrollEnd');
		},
		_resize: function () {
			if (!this.enabled)
				return;

			clearTimeout(this.resizeTimeout);

			this.resizeTimeout = setTimeout(function () {
				this.refresh();
			}.bind(this), this.options.resizePolling);
		},
		_trigger: function (type) {
			var events = this._events[type];
			if (!events)
				return;

			for (var i = 0; i < events.length; i++) {
				events[i].apply(this, [].slice.call(arguments, 1));
			}
		},
		_transitionTime: function (time) {
			time = time || 0;

			this.scrollerStyle[_.style.transitionDuration] = time + 'ms';

			if (!_.isBadAndroid) {
				for (var i = 0; i < this.itemLen; i++) {
					this.items[i].style[_.style.transitionDuration] = time + 'ms';
				}
			}

			if (!time && _.isBadAndroid) {
				this.scrollerStyle[_.style.transitionDuration] = '0.001s';

				if (!_.isBadAndroid) {
					for (var i = 0; i < this.itemLen; i++) {
						this.items[i].style[_.style.transitionDuration] = '0.001s';
					}
				}
			}
		},
		_transitionTimingFunction: function (easing) {
			this.scrollerStyle[_.style.transitionTimingFunction] = easing;

			if (!_.isBadAndroid) {
				for (var i = 0; i < this.itemLen; i++) {
					this.items[i].style[_.style.transitionTimingFunction] = easing;
				}
			}
		},
		_transitionEnd: function (e) {
			if (e.target !== this.scroller || !this.isInTransition) {
				return;
			}

			this._transitionTime();
			if (!this.resetPosition(this.options.bounceTime, _.ease.bounce)) {
				this.isInTransition = false;
				this._trigger('scrollEnd');
			}
		},
		_translate: function (y) {
			this.scrollerStyle[_.style.transform] = 'translateY(' + y + 'px)' + this.translateZ;

			if (!_.isBadAndroid) {
				for (var i = 0; i < this.itemLen; i++) {
					var deg = this.options.rotate * (y / this.itemHeight + i);
					this.items[i].style[_.style.transform] = 'rotateX(' + deg + 'deg)';
				}
			}

			this.y = y;
		},
		enable: function () {
			this.enabled = true;
		},
		disable: function () {
			this.enabled = false;
		},
		on: function (type, fn) {
			if (!this._events[type]) {
				this._events[type] = [];
			}

			this._events[type].push(fn);
		},
		off: function (type, fn) {
			var _events = this._events[type];
			if (!_events) {
				return;
			}

			var count = _events.length;

			while (count--) {
				if (_events[count] === fn) {
					_events[count] = undefined;
				}
			}
		},
		refresh: function () {
			//force reflow
			var rf = this.wrapper.offsetHeight;

			this.wrapperHeight = parseInt(this.wrapper.style.height) || this.wrapper.clientHeight;

			this.items = this.wrapper.querySelectorAll('.wheel-item');
			//this.scrollerHeight = parseInt(this.scroller.style.height) || this.scroller.clientHeight;
			this.options.itemHeight = this.itemHeight = this.items.length ? this.items[0].clientHeight : 0;

			if (this.selectedIndex === undefined) {
				this.selectedIndex = this.options.selectedIndex;
			}
			this.y = -this.selectedIndex * this.itemHeight;

			this.itemLen = this.items.length;

			this.maxScrollY = -this.itemHeight * (this.itemLen - 1);

			this.endTime = 0;

			this.scrollOffset = _.offset(this.scroller);

			this._trigger('refresh');

			this.resetPosition();
		},
		resetPosition: function (time, easeing) {
			time = time || 0;

			var y = this.y;

			if (y > 0) {
				y = 0;
			} else if (y < this.maxScrollY) {
				y = this.maxScrollY;
			}

			if (y === this.y)
				return false;

			this.scrollTo(y, time, easeing);

			return true;

		},
		goTo: function (selectIndex) {
			this.y = -selectIndex * this.itemHeight;
			this.scrollTo(this.y);
		},
		scrollTo: function (y, time, easing) {

			easing = easing || _.ease.bounce;

			this.isInTransition = time > 0 && this.y !== y;

			this._transitionTimingFunction(easing.style);
			this._transitionTime(time);
			this._translate(y);

			if (y > 0) {
				this.selectedIndex = 0;
			} else if (y < this.maxScrollY) {
				this.selectedIndex = this.itemLen - 1;
			} else {
				this.selectedIndex = Math.abs(this.y / this.itemHeight) | 0;
			}

		},
		scrollToElement: function (el, time, easing) {
			el = el.nodeType ? el : this.scroller.querySelector(el);

			if (!el || el.className !== 'wheel-item')
				return;
			var pos = _.offset(el);

			pos.top -= this.scrollOffset.top;
			if (pos.top > 0 || pos.top < this.maxScrollY) {
				return;
			}
			pos.top = Math.round(pos.top / this.itemHeight) * this.itemHeight;

			this.scrollTo(pos.top, time, easing);
		},
		getComputedPosition: function () {
			var matrix = window.getComputedStyle(this.scroller, null);

			matrix = matrix[_.style.transform].split(')')[0].split(', ');
			var x = +(matrix[12] || matrix[4]);
			var y = +(matrix[13] || matrix[5]);

			return {
				x: x,
				y: y
			};
		},
		getSelectedIndex: function () {
			return this.selectedIndex;
		},
		destroy: function () {
			this._removeEvents();

			this._trigger('destroy');
		},
		handleEvent: function (e) {
			switch (e.type) {
				case 'touchstart':
					this._start(e);
					break;
				case 'touchmove':
					this._move(e);
					break;
				case 'touchend':
				case 'touchcancel':
					this._end(e);
					break;
				case 'orientationchange':
				case 'resize':
					this._resize();
					break;
				case 'transitionend':
				case 'webkitTransitionEnd':
				case 'oTransitionEnd':
				case 'MSTransitionEnd':
					this._transitionEnd(e);
					break;
				case 'click':
					if (!e._constructed) {
						e.preventDefault();
						e.stopPropagation();
					}
					break;
			}
		}
	};

	module.exports = Wheel;

})(window, document, Math);