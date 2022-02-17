const originalConsole = {};
originalConsole.log = console.log;
originalConsole.debug = console.debug;
originalConsole.warn = console.warn;
originalConsole.error = console.error;

function collectConsole(type, message, ...params) {
	if(!message) {
		return;
	}
	const entry = { type: type, message: message };
	if(params && params.length > 0) {
		entry.params = params;
	} 
	entries.push(entry);
}

function collectLog(message, ...params) {
	collectConsole('log', message, ...params);
}

function collectDebug(message, ...params) {
	collectConsole('debug', message, ...params);
}

function collectWarn(message, ...params) {
	collectConsole('warn', message, ...params);
}

function collectError(message, ...params) {
	collectConsole('error', message, ...params);
}

/**
 * Allows to mock the console log methods while executes a specific test
 * @param {*} testImpl Function with the test to execute
 * @returns Function wrapping the console mocking/unmocking
 */
export function runWithMockedConsole(testImpl) {
	const entries = [];
	console.log = collectLog;
	console.debug = collectDebug;
	console.warn = collectWarn;
	console.error = collectError;
	try {
		testImpl();
	} finally {
		console.log = originalConsole.log;
		console.debug = originalConsole.debug;
		console.warn = originalConsole.warn;
		console.error = originalConsole.error;
	}
}
