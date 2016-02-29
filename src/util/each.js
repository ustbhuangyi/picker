'use strict';

var t = require('./type'),
	hasOwn = Object.prototype.hasOwnProperty;

module.exports = function (obj, iterator, context) {
	var i, l, type;
	if (typeof obj !== 'object') return;

	type = t(obj);
	context = context || obj;
	if (type === 'array' || type === 'arguments' || type === 'nodelist') {
		for (i = 0, l = obj.length; i < l; i++) {
			if (iterator.call(context, obj[i], i, obj) === false) return;
		}
	} else {
		for (i in obj) {
			if (hasOwn.call(obj, i)) {
				if (iterator.call(context, obj[i], i, obj) === false) return;
			}
		}
	}
};