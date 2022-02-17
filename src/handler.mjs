/** Invokes a function with exception management */
function trigger(fnc, ...params) {
	if(fnc === null || fnc === undefined) {
		return;
	} else if(typeof(fnc) !== 'function') {
		throw new Error('erebus.handler.trigger.invalid_function');
	}
	try {
		return fnc.call(null, ...params);
	} catch(ex) {
		throw new Error('erebus.handlers.trigger.function_error', ex);
	}
}

/** Invokes a function with exception management */
function triggerAsPromise(fnc, ...params) {
	if(fnc === null || fnc === undefined) {
		return Promise.resolve();
	} else if(typeof(fnc) !== 'function') {
		return Promise.reject('erebus.handler.trigger_promise_function.invalid_function');
	}
	return new Promise(function(resolve, reject) {
		try {
			const result = fnc.call(null, ...params);
			resolve(result);
		} catch(ex) {
			console.error('erebus.handlers.trigger_promise_function.function_error', ex);
			reject(ex);
		}
	});
}

export default { trigger, triggerAsPromise };