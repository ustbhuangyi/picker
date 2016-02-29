var each = require('./each');

var DEBUG = true;

var myConsole;

if (DEBUG) {

	myConsole = documentCreateElement("ul", null, {
		cssText: 'position:fixed;_position:absolute;top:0;left:0;z-index:999;border:1px solid #ddd;border-bottom:none;font-family:monospace;background:#000;color:#dadada;height:70%;overflow:scroll;font-size:1.8rem;'
	});

	appendToBody(myConsole);
}

function documentCreateElement(tagName, attribute, styles) {
	var element, style;
	element = document.createElement(tagName);
	style = element.style;

	attribute && each(attribute, function (value, key) {
		element[key] = value;
	});

	style && styles && each(styles, function (value, key) {
		style[key] = value;
	});

	return element;
}

function appendToBody(element) {
	var body = document.body;
	body.appendChild(element);
}

function encodeHTML(str) {
	if (!str || 'string' != typeof str) return str;
	return str.replace(/["'<>\\\/`]/g, function ($0) {
		return '&#' + $0.charCodeAt(0) + ';';
	});
}

module.exports = function () {
	if (!DEBUG) return;
	var count, index, html;
	if (!myConsole) return;
	for (index = 0, count = arguments.length, html = []; index < count; index++) {
		html.push(encodeHTML(String(arguments[index])));
	}
	myConsole.appendChild(documentCreateElement("li", {
		innerHTML: html.join(' ')
	}, {
		cssText: "border-bottom:1px solid #ddd"
	}));
};
