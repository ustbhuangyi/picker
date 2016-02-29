'use strict';

var toString = Object.prototype.toString;

module.exports = function (obj) {
	var type;
	if (obj == null) {
		type = String(obj);
	} else {
		type = toString.call(obj).toLowerCase();
		type = type.substring(8, type.length - 1);
	}
	return type;
};