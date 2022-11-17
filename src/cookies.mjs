import utils from './utils.mjs';

const $module = {};

/**
 * Sets a specific cookie
 * @param name Name of the cookie to set
 * @param value Value to set
 * @param timespan Timspan to maintain the cookie in seconds
 */
$module.set = function (name, value, timespan) {
	if (!name) {
		throw Error('erebus.cookies.set.null_cookie_name');
	}
	if (typeof (timespan) !== 'number') {
		timespan = 3600;
	}
	const expireDate = new Date();
	expireDate.setTime(expireDate.getTime() + (timespan * 1000));
	var cookie = utils.trim(name) + '=' + value + '; expires=' + expireDate.toGMTString() + '; path=/';
	document.cookie = cookie;
};

/**
 * Obtains the value from a cookie
 * @param name Name of the cookie to obtain
 * @returns Cookie value or null if it is not defined
 */
$module.get = function (name) {
	if (!name) {
		return null;
	}
	var cookiestring = RegExp(name + '=[^;]+').exec(document.cookie);
	if (cookiestring) {
		return decodeURIComponent(cookiestring.toString().replace(/^[^=]+./, ''));
	}
	return '';
};

export default $module;