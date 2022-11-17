/** Internal method to clear and stardardize a path */
function clearPath(path) {
	if (path && typeof (path) === 'string') {
		if (path.startsWith('#')) {
			path = path.substring(1);
		}
		if (path.startsWith('/')) {
			path = path.substring(1);
		}
	}
	return path;
}

/**
 * Compares a path against the routing path of a router
 * @param {string} routingPath Path of the router
 * @param {string} targetPath Path to compare
 * @returns Boolean value to determine if the route is equivalent to the path
 */
function compareStringPaths(routingPath, targetPath) {
	if (routingPath === '*' || routingPath === targetPath) {
		return true;
	}
	const routingParts = routingPath.split('/');
	const targetParts = targetPath.split('/');
	for (var idx = 0; idx < routingParts.length; idx++) {
		// ignore the parameter parts in the routing
		if (routingParts[idx].startsWith(':')) {
			continue;
		}
		if (routingParts[idx] !== '*' && routingParts[idx] !== targetParts[idx]) {
			return false;
		}
	}
	return true;
}

/**
 * Uses the pattern defined by a routing path to extract the parameters from it
 * @param {string} routingPath String with the routing path
 * @param {string} targetPath String with the path to extract the parameters from it
 */
function extractPathParameters(routingPath, targetPath) {
	const parameters = {};
	const routingParts = routingPath.split('/');
	const targetParts = targetPath.split('/');
	for (var idx = 0; idx < routingParts.length; idx++) {
		if (!routingParts[idx].startsWith(':')) {
			continue;
		}
		const paramName = routingParts[idx].substring(1);
		parameters[paramName] = targetParts[idx];
	}
	return parameters;
}

/** Object to represent a single route */
class Route {
	/** Path served by this route */
	#path;
	/** Handler used to serve the route represented by this instance */
	#handler;

	/**
	 * Creates a new route to serve a specific path
	 * @param {string} path String with the path to serve
	 * @param {function} handler Function to be invoked when this route is served
	 */
	constructor(path, handler) {
		this.#path = clearPath(path);
		if (typeof (handler) === 'function') {
			this.#handler = handler;
		}
	}

	/**
	 * Determines if the current route instance can match a specific path
	 * @param {string} path Path to evaluate
	 */
	match(path) {
		path = clearPath(path);
		if (typeof (this.#path) === 'string') {
			return compareStringPaths(this.#path, path);
		} else if (this.#path instanceof RegExp) {
			return this.#path.test(path);
		}
		return false;
	}

	/** Handles a request using this route instance */
	handle(path) {
		if (!this.#handler) {
			console.error('erebus.route.no_handler');
			return Promise.reject(new Error('erebus.route.no_handler'));
		}
		return new Promise((resolve, reject) => {
			path = clearPath(path);
			try {
				var parameters = extractPathParameters(this.#path, path);
				var result = this.#handler(parameters);
				if (result instanceof Promise) {
					result.then(resolve).catch(reject);
				} else {
					resolve();
				}
			} catch (ex) {
				console.error('erebus.route.handler_error', ex);
				reject(ex);
			}
		});
	}
}

/**
 * Internal method with the logic to identify the matching router from a list of possible routes
 * @param {array} routeList List containing the routes instances to evaluate
 * @param {string} path Path to match
 * @returns The matching route or null if no matching route is found
 */
function getMatchingRouter(routeList, path) {
	for (var rdx = 0; rdx < routeList.length; rdx++) {
		let route = routeList[rdx];
		if (route.match(path)) {
			return route;
		}
	}
	return null;
}

class RouterEngine {
	/** Hold the list of routes registered */
	#routes = [];
	/** Flag to determine if the routing engine has been started */
	#started = false;
	/** Reference to the default router registered */
	#defaultRouter;
	/** Reference to the error handler */
	#onError;

	/**
	 * Register a router to handle a specific path
	 * @param {string} path Path to handle
	 * @param {function} handler Handler to be triggered when the path is matched
	 * @returns Instance of the routing engine
	 */
	register(path, handler) {
		this.#routes.push(new Route(path, handler));
		return this;
	}

	/**
	 * Serves a specific path
	 * @param {string} path Path to serve
	 * @returns Promise to be fullfilled (or rejected) after the route is served
	 */
	serve(path) {
		if (typeof (path) === 'undefined') {
			path = null;
		}
		path = clearPath(path);
		return new Promise((resolve, reject) => {
			var effectiveRoute = getMatchingRouter(this.#routes, path);
			if (!effectiveRoute) {
				effectiveRoute = this.#defaultRouter;
			}
			if (!effectiveRoute) {
				reject('erebus.route.no_matching_route_or_default');
				return;
			}
			effectiveRoute.handle(path).then(function () {
				resolve(true);
			}).catch(reject);
		});
	}

	/** Internal method to trigger the routing process based on the current path */
	#triggerRouting() {
		// TODO: add beforeRoute event
		this.serve(window.location.hash).then(() => {
			// TODO: add afterRoute event
		}).catch((err) => {
			console.error('erebus.router.error', err);
			if (this.#onError) {
				this.#onError(err);
			}
		});
	}

	/** Initialize the route engine to start serving requests */
	start() {
		if (this.#started) {
			console.warn('erebus.router.already_started');
			return;
		}
		this.#started = true;
		window.addEventListener('popstate', () => {
			this.#triggerRouting();
		});
		this.#triggerRouting();
	}

	/**
	 * Defines the behavior for the default route (when no other route matches the path)
	 * @param {function} handler Funtion to be invoked when no other route matches the requested path
	 * @returns Instance of the routing engine
	 */
	default(handler) {
		this.#defaultRouter = new Route('*', handler);
		return this;
	}

	/**
	 * Defines the behavior when a route fails
	 * @param {function} handler Funtion to be invoked when the routing causes an error
	 * @returns Instance of the routing engine
	 */
	error(handler) {
		if (typeof (handler) === 'string') {
			this.#onError = handler;
		}
		return this;
	}
}

const router = new RouterEngine();
export default router;