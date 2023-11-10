import utils from './utils.mjs';

const $module = {};
/** Internal scoped variable holders */
const $scope = {};
/** Holds all the estandard parsers defined for the library */
$scope.parsers = {};

/** Creates the underlying XMLHTTP object used to execute ajax calls */
function createXmlHttp() {
	if (window.XMLHttpRequest) {
		return new window.XMLHttpRequest();
	}
	try {
		return new ActiveXObject('Msxml2.XMLHTTP');
	} catch (ex) {
		try {
			return new ActiveXObject('Microsoft.XMLHTTP');
		} catch (ex) {
			throw Error('erebus.http.xmlhttp_error');
		}
	}
}

/**
 * Internal method to extract the response headers associated with a particular XMLHTTP request
 * @param request Instance of the XMLHTTP that initiated the request
 * @returns Object with all the headers as attributes
 */
function getResponseHeaders(request) {
	const headers = {};
	let rawHeaders = request.getAllResponseHeaders();
	if (rawHeaders) {
		rawHeaders = rawHeaders.split('\r\n');
		for (let idx = 0; idx < rawHeaders.length; idx++) {
			if (!rawHeaders[idx]) {
				continue;
			}
			const parts = rawHeaders[idx].split(':');
			// NOTE: on older browsers the header name can have mixed case, on recent browsers it is only lowercase
			const headerName = utils.trim(parts[0]).toLowerCase();
			const headerValue = utils.trim(parts[1]);
			if (headerName && headerValue) {
				headers[headerName] = headerValue;
			}
		}
	}
	return headers;
}

/**
 * Internal utility method to set request headers
 * @param {*} request XHR object representing the request
 * @param {*} headers Object with the headers to set. Each header is an attribute in the object
 */
function setRequestHeaders(request, headers) {
	if (headers) {
		for (var headerName in headers) {
			request.setRequestHeader(headerName, headers[headerName]);
		}
	}
}

/** Parses a response as a JSON */
$scope.parsers['json'] = function (response) {
	try {
		return JSON.parse(response);
	} catch (ex) {
		const err = new Error('erebus.http.json_parse_error');
		err.cause = ex;
		err.response = response;
		throw err;
	}
};

/** Internal method to obtain the proper parser according to the content type or null if no transformations are required */
function getResponseParser(headers) {
	const contentType = (headers && typeof(headers['content-type']) === 'string') ? headers['content-type'] : null;
	if (contentType && contentType.startsWith('application/json')) {
		return $scope.parsers['json'];
	}
	return null;
}

/**
 *
 * @param url String with the resource URL to be requested
 * @param options Object with the options to execute the request. The values are:
 * 					- method: String with the HTTP method to execute: GET, POST, PUT, DELETE. If this is not provided, GET will be used by default.
 * 					- async: Boolean value to determine if the request should be asynchronous (true) or not. By default it is true.
 *                  - data: Data to be included in a POST, PUT or DELETE request
 * @returns Promise to be fulfilled according to the HTTP request result
 */
function executeRequest(method, url, options) {
	if (typeof (url) !== 'string' || !url) {
		return Promise.reject('erebus.http.null_url');
	}
	if (!options) {
		options = {};
	}
	if (!method) {
		method = 'GET';
	}
	return new Promise(function (resolve, reject) {
		const request = createXmlHttp();
		request.onreadystatechange = function () {
			if (request.readyState == 4 || request.readyState === 'complete') {
				if (request.status === 0) {
					const err = new Error('erebus.http.connection_refused');
					err.code = 'http';
					err.status = 'connection_error';
					err.response = null;
					reject(err);
				} else if (request.status !== 200) {
					const err = new Error('erebus.http.error.' + request.status);
					err.code = 'http';
					err.status = request.status;
					err.response = request.responseText;
					reject(err);
				} else {
					var response = request.responseText;
					const headers = getResponseHeaders(request);
					const parser = getResponseParser(headers);
					if (parser) {
						try {
							response = parser(response);
						} catch (ex) {
							reject(ex);
							return;
						}
					}
					if (typeof (options.interceptor) === 'function') {
						const result = options.interceptor(response, headers);
						if (result !== undefined) {
							response = result;
						}
					}
					resolve(response);
				}
			}
		};
		request.open(method, url, options.async !== false);
		setRequestHeaders(request, options.headers);
		if (method === 'GET' || !options.data) {
			request.send();
		} else {
			request.send(options.data);
		}
	});
}

/**
 * Executes a HTTP GET request
 * @param {string} url String with the resource URL to request
 * @param {object} options Object with the options to execute the request.  The attributes are:
 * 			- headers: Object with the headers to pass
 * 			- interceptor: Optional function to capture and process the response received.  The function will receive
 * 					two parameters: the response content and the response headers
 * 			- async: Optional boolean value to determine if the call should be asynchronous or not. By default all
 * 					requests are asynchronous
 * @returns Promise to be fullfilled or rejecting according to the executed request
 */
$module.get = function (url, options) {
	return executeRequest('GET', url, options);
};

/**
 * Executes a HTTP POST request
 * @param {string} url String with the resource URL to request
 * @param {object} options Object with the options to execute the request.  The attributes are:
 * 			- headers: Object with the headers to pass
 * 			- interceptor: Optional function to capture and process the response received.  The function will receive
 * 					two parameters: the response content and the response headers
 * 			- async: Optional boolean value to determine if the call should be asynchronous or not. By default all
 * 					requests are asynchronous
 * 			- data: Data to include in the post request
 * @returns Promise to be fullfilled or rejecting according to the executed request
 */
$module.post = function (url, options) {
	return executeRequest('POST', url, options);
};

/**
 * Executes a HTTP PUT request
 * @param {string} url String with the resource URL to request
 * @param {object} options Object with the options to execute the request.  The attributes are:
 * 			- headers: Object with the headers to pass
 * 			- interceptor: Optional function to capture and process the response received.  The function will receive
 * 					two parameters: the response content and the response headers
 * 			- async: Optional boolean value to determine if the call should be asynchronous or not. By default all
 * 					requests are asynchronous
 * 			- data: Data to include in the post request
 * @returns Promise to be fullfilled or rejecting according to the executed request
 */
$module.put = function (url, options) {
	return executeRequest('PUT', url, options);
};

/**
 * Executes a HTTP DELETE request
 * @param {string} url String with the resource URL to request
 * @param {object} options Object with the options to execute the request.  The attributes are:
 * 			- headers: Object with the headers to pass
 * 			- interceptor: Optional function to capture and process the response received.  The function will receive
 * 					two parameters: the response content and the response headers
 * 			- async: Optional boolean value to determine if the call should be asynchronous or not. By default all
 * 					requests are asynchronous
 * 			- data: Data to include in the post request
 * @returns Promise to be fullfilled or rejecting according to the executed request
 */
$module.delete = function (url, options) {
	return executeRequest('DELETE', url, options);
};

/**
 * Loads a JavaScript resource dynamically
 * @param url URL to load the script from it
 * @returns Promise that allows to handle the script loading actions
 */
$module.loadScript = function (url) {
	return new Promise((resolve) => {
		var element = document.createElement('script');
		element.src = url;
		element.type = 'text/javascript';
		element.async = false;
		element.onerror = () => {
			/*
			reject(errorHandler.create({
				module: $moduleName,
				code: `erebus.http.load_script_error[${url}]`
			})); // TODO: collect error info
			*/
		};
		element.onload = () => {
			resolve();
		};
		document.head.appendChild(element);
	});
};

export default $module;