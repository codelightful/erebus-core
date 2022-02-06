/** Invokes a function with exception management */
function trigger(fnc, ...params) {
	if(fnc === null || fnc === undefined) {
		return Promise.resolve();
	} else if(typeof(fnc) !== 'function') {
		return Promise.reject('erebus.handler.trigger.invalid_function');
	}
	return new Promise(function(resolve, reject) {
		try {
			const result = fnc.call(null, ...params);
			resolve(result);
		} catch(ex) {
			console.error('erebus.handlers.trigger.function_error', ex);
			reject(ex);
		}
	});
}

export default { trigger };