import random from './random.mjs';

const $module = {};

/** Invokes a function with exception management */
$module.trigger = function(fnc, ...params) {
	if (fnc === null || fnc === undefined) {
		return;
	} else if (typeof(fnc) !== 'function') {
		throw new Error('erebus.handler.trigger.invalid_function');
	}
	try {
		return fnc.call(null, ...params);
	} catch (ex) {
		$module.handleError(ex, 'erebus.handlers.trigger.function_error');
	}
};

/** Invokes a function with exception management */
$module.triggerAsPromise = function(fnc, ...params) {
	if (fnc === null || fnc === undefined) {
		return Promise.resolve();
	} else if (typeof(fnc) !== 'function') {
		return Promise.reject('erebus.handler.trigger_promise_function.invalid_function');
	}
	return new Promise(function(resolve, reject) {
		try {
			const result = fnc.call(null, ...params);
			resolve(result);
		} catch (ex) {
			console.error('erebus.handlers.trigger_promise_function.function_error', ex);
			reject(ex);
		}
	});
};

/**
 * Handles the ocurrence of an error/exception in a standard way
 * @param {*} err Error or exception captured
 * @param {*} code String with the code to describe the error
 */
$module.handleError = function(err, code) {
	// TODO: implement a way to print the error in the UI in a standard way
	if (!err) {
		return;
	}
	if (code) {
		const guid = random.guid();
		const errorCode = `${code}[${guid}]`;
		console.error(errorCode, err);
		throw new Error(errorCode);
	}
	console.log(err);
	throw err;
};

export default $module;