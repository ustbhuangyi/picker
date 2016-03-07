'use strict';

var pickerTemplate = require('./picker.handlebars');
var Wheel = require('../util/wheel.js');

require('./picker.styl');

(function (gmu, $, undefined) {

	gmu.define('picker', {
		options: {
			data: [],
			showCls: 'show'
		},
		_create: function () {
			this.$picker = $(pickerTemplate(this._options.data)).appendTo($(document.body));
			this.$mask = $('.mask-hook', this.$picker);
			this.$wheel = $('.wheel-hook', this.$picker);
			this.$panel = $('.panel-hook', this.$picker);
			this.$confirm = $('.confirm-hook', this.$picker);
			this.$cancel = $('.cancel-hook', this.$picker);
			this.$choose = $('.choose-hook', this.$picker);
			this.$wrapper = $('.wheel-wrapper-hook', this.$picker);
			this.$footer = $('.footer-hook', this.$picker);

			this._bindEvent();
		},
		_init: function () {
			this.length = this._options.data.length;

			this.selectedIndex = [];
			for (var i = 0; i < this.length; i++) {
				this.selectedIndex[i] = 0;
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

				for (var i = 0; i < me.length; i++) {
					me.selectedIndex[i] = me.wheels[i].getSelectedIndex();
				}

				me.trigger('select', me.selectedIndex);
			});

			this.$cancel.on('click', function () {
				me.hide();
			});

		},
		show: function () {
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
					}
				} else {
					for (var i = 0; i < this.length; i++) {
						this.wheels[i].goTo(this.selectedIndex[i]);
					}
				}

			}.bind(this), 0);
		},
		hide: function () {
			var showCls = this._options.showCls;
			this.$mask.removeClass(showCls);
			this.$panel.removeClass(showCls);

			setTimeout(function () {
				this.$picker.hide();
			}.bind(this), 500);
		}
	});

})(gmu, gmu.$);