'use strict';

var pickerTemplate = require('./picker.handlebars');
var itemTemplate = require('./item.handlebars');
var Wheel = require('../util/wheel.js');

require('./picker.styl');

(function (gmu, $, undefined) {

	gmu.define('picker', {
		options: {
			data: [],
			title: '',
			selectIndex: null,
			showCls: 'show'
		},
		_create: function () {
			this.data = this._options.data;

			this.$picker = $(pickerTemplate({
				data: this.data,
				title: this._options.title
			})).appendTo($(document.body));
			this.$mask = $('.mask-hook', this.$picker);
			this.$wheel = $('.wheel-hook', this.$picker);
			this.$panel = $('.panel-hook', this.$picker);
			this.$confirm = $('.confirm-hook', this.$picker);
			this.$cancel = $('.cancel-hook', this.$picker);
			this.$choose = $('.choose-hook', this.$picker);
			this.$wrapper = $('.wheel-wrapper-hook', this.$picker);
			this.$scroll = $('.wheel-scroll-hook', this.$picker);
			this.$footer = $('.footer-hook', this.$picker);

			this._bindEvent();
		},
		_init: function () {
			this.length = this.data.length;

			this.selectedIndex = [];
			this.selectedVal = [];
			if (this._options.selectIndex) {
				this.selectedIndex = this._options.selectIndex;
			} else {
				for (var i = 0; i < this.length; i++) {
					this.selectedIndex[i] = 0;
				}
			}
		},
		_bindEvent: function () {
			var me = this;

			this.$mask.on('touchmove', function () {
				return false;
			});

			this.$choose.on('touchmove', function () {
				return false;
			});

			this.$mask.on('touchstart', function () {
				return false;
			});

			this.$wrapper.on('touchstart', function () {
				return false;
			});

			this.$footer.on('touchstart', function () {
				return false;
			});

			this.$confirm.on('click', function () {
				me.hide();

				var changed = false;
				for (var i = 0; i < me.length; i++) {
					var index = me.wheels[i].getSelectedIndex();
					me.selectedIndex[i] = index;

					var value = null;
					if (me.data[i].length) {
						value = me.data[i][index].value;
					}
					if (me.selectedVal[i] !== value) {
						changed = true;
					}
					me.selectedVal[i] = value;
				}

				me.trigger('picker.select', me.selectedVal, me.selectedIndex);

				if (changed) {
					me.trigger('picker.valuechange', me.selectedVal, me.selectedIndex);
				}
			});

			this.$cancel.on('click', function () {
				me.hide();
				me.trigger('picker.cancel');
			});
		},
		show: function (next) {
			this.$picker.show();
			var showCls = this._options.showCls;

			setTimeout(function () {
				this.$mask.addClass(showCls);
				this.$panel.addClass(showCls);

				if (!this.wheels) {
					this.wheels = [];
					for (var i = 0; i < this.length; i++) {
						this.wheels[i] = new Wheel(this.$wheel[i], {
							tap: 'wheelTap',
							selectedIndex: this.selectedIndex[i]
						});
						(function (index) {
							this.wheels[index].on('scrollEnd', function () {
								this.trigger('picker.change', index, this.wheels[index].getSelectedIndex());
							}.bind(this));
						}.bind(this))(i);
					}
				} else {
					for (var i = 0; i < this.length; i++) {
						this.wheels[i].enable();
						this.wheels[i].goTo(this.selectedIndex[i]);
					}
				}
				next && next();
			}.bind(this), 0);
		},
		hide: function () {
			var showCls = this._options.showCls;
			this.$mask.removeClass(showCls);
			this.$panel.removeClass(showCls);

			setTimeout(function () {
				this.$picker.hide();
				for (var i = 0; i < this.length; i++) {
					this.wheels[i].disable();
				}
			}.bind(this), 500);
		},
		refill: function (data, index) {
			var $scroll = this.$scroll.eq(index);
			var wheel = this.wheels[index];
			if ($scroll && wheel) {
				var oldData = this.data[index];
				this.data[index] = data;
				$scroll.html(itemTemplate(data));

				var selectedIndex = wheel.getSelectedIndex();
				var dist = 0;
				if (oldData.length) {
					var oldValue = oldData[selectedIndex].value;
					for (var i = 0; i < data.length; i++) {
						if (data[i].value === oldValue) {
							dist = i;
							break;
						}
					}
				}
				this.selectedIndex[index] = dist;
				wheel.refresh();
				wheel.goTo(dist);
				return dist;
			}
		}
	});

})(gmu, gmu.$);