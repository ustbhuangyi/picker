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

			this._bindEvent();
		},
		_init: function () {
			this.selectedIndex = 0;
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

			this.$confirm.on('click', function () {
				me.hide();

				me.selectedIndex = me.wheel.getSelectedIndex();
				me.trigger('select', me._options.data[me.selectedIndex]);
			});

			this.$cancel.on('click', function () {
				me.hide();
			});

			this.$wheel.on('wheelTap', function (e) {
				console.log(e.target);
			})

		},
		show: function () {
			this.$picker.show();
			var showCls = this._options.showCls;

			setTimeout(function () {
				this.$mask.addClass(showCls);
				this.$panel.addClass(showCls);

				if (!this.wheel) {
					this.wheel = new Wheel(this.$wheel[0], {
						tap: 'wheelTap',
						selectedIndex: this.selectedIndex
					});
				} else {
					this.wheel.goTo(this.selectedIndex);
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