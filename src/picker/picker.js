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
			this.$wheel = $('.wheel-hook', this.$picker);
			this.$panel = $('.panel-hook', this.$picker);
			this._bindEvent();
		},
		_init: function () {

		},
		_bindEvent: function () {
			this.$picker.on('touchstart', function () {
				return false;
			})
		},
		show: function () {
			this.$picker.show();
			var showCls = this._options.showCls;

			setTimeout(function () {
				this.$picker.addClass(showCls);
				this.$panel.addClass(showCls);

				if (!this.wheel) {
					this.wheel = new Wheel(this.$wheel[0]);
				} else {
					this.wheel.refresh();
				}

			}.bind(this), 0);
		}
	});

})(gmu, gmu.$);