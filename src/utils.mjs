const $module = {};

/**
 * Allows to determine if a specific instance is a promise object (or a promise-like object)
 * @param {*} value Object to evaluate
 * @returns Boolean value to determine if the object is a promise or not
 */
$module.isPromise = function(value) {
	if (!value) {
		return false;
	}
	return (value instanceof Promise) || (typeof (value.then === 'function') && typeof (value.catch) === 'function');
};

/** Trims a string by removing leading and trailing white spaces  */
$module.trim = function (value) {
	if (typeof(value) !== 'string') {
		return value;
	}
	return value.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
};

/** Determines if a specific value is null, undefined or an empty string */
$module.isNonValue = function(value, trim) {
	if (trim === true && value && typeof(value) === 'string') {
		value = $module.trim(value);
	}
	return value === null || value === undefined || (typeof(value) === 'string' && value.length === 0);
};

export default $module;