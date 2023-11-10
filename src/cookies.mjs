import utils from './utils.mjs';

const $module = {};

/**
 * Sets the value for a cookie entry
 * @param name Name of the cookie to set
 * @param value Value to set. Omit or set to null to clean the cookie
 * @param timespan Timespan to maintain the cookie (in seconds)
 */
$module.set = function (name, value, timespan) {
	if (!name) {
		throw new Error('erebus.cookies.set.null_cookie_name');
	}
	if (typeof (timespan) !== 'number') {
		timespan = 3600;
	}
	var expireDate = new Date();
	if (value === null || value === undefined) {
		value = '';
		expireDate.setTime(expireDate.getTime() - 1000);
	} else {
		expireDate.setTime(expireDate.getTime() + (timespan * 1000));
	}
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