export function createDom(tpl) {
	let container = document.createElement('div');
	container.innerHTML = tpl;
	return container.childNodes[0];
};

export function addEvent(el, type, fn, capture) {
	el.addEventListener(type, fn, !!capture);
};

export function removeEvent(el, type, fn, capture) {
	el.removeEventListener(type, fn, !!capture);
};

export function hasClass(el, className) {
	let reg = new RegExp('(^|\\s)' + className + '(\\s|$)');
	return reg.test(el.className);
};

export function addClass(el, className) {
	if (hasClass(el, className)) {
		return;
	}

	let newClass = el.className.split(' ');
	newClass.push(className);
	el.className = newClass.join(' ');
};

export function removeClass(el, className) {
	if (!hasClass(el, className)) {
		return;
	}

	let reg = new RegExp('(^|\\s)' + className + '(\\s|$)', 'g');
	el.className = el.className.replace(reg, ' ');
};
