import $ from './element.mjs';
import handler from './handler.mjs';
import utils from './utils.mjs';

const $scope = {};
// Contains the default target area to load the content.  It can be a string with the selector for the DOM element
// or a reference to an HTMLElement.  If it is null then the body will be used as the target area. The method setDefaultTarget
// is used to define this value
$scope.defaultTarget = null;

/** Internal method to determine the target used in the execution of a controller */
function getEffectiveTarget(specs) {
	if (specs && !utils.isNonValue(specs.target)) {
		return specs.target;
	}
	if (!utils.isNonValue($scope.defaultTarget)) {
		return $scope.defaultTarget;
	}
	return document.body;
}

/**
 * Function that allows to define a handler to configure a routing specification that
 * loads content from a HTML fragment and executes a JavaScript action after the content
 * has been loaded.
 * @param {*} specs Object with the specifications to create the routing controller. It is composed by
 *          the following attributes:
 *          - fragment: String with the URL of the fragment to load, function returning the URL of the fragment to load
 * 				or promise with the content to load.  This parameter is mandatory.
 *          - target: String with the selector of the DOM element that will receive the content or reference to its HTMLElement.
 *              If it not provided, then the default target area will be used.  If no default target area is defined, then the
 *              document body will be used.  The function setDefaultTarget can be used to define the default target.
 *          - handler: Function to be invoked after the fragment has been loaded and the DOM has been updated with the content
 * @returns Function that can be used to configure a route
 */
const $module = function(specs) {
	return async function(params) {
		var effectiveTarget = getEffectiveTarget(specs);
		if (!specs) {
			$(effectiveTarget).content('<div class="erb-badge erb-error">erebus.controller.error.no_specs</div>');
			return;
		} else if (!specs.fragment) {
			$(effectiveTarget).content('<div class="erb-badge erb-error">erebus.controller.error.no_fragment</div>');
			return;
		}
		var effectiveFragment = specs.fragment;
		if (typeof(effectiveFragment) === 'function') {
			effectiveFragment = handler.trigger(effectiveFragment, params);
		}
		if (utils.isPromise(effectiveFragment)) {
			const content = await effectiveFragment;
			$(effectiveTarget).content(content);
		} else if (typeof(effectiveFragment) === 'string') {
			await $(effectiveTarget).load(effectiveFragment);
		} else {
			$(effectiveTarget).content('<div class="erb-badge erb-error">erebus.controller.invalid_fragment</div>');
		}
		if (typeof(specs.handler) === 'function') {
			try {
				specs.handler(params);
			} catch (ex) {
				const errorCode = 'erebus.controller.handler_error';
				console.error(errorCode, ex);
				throw new Error(errorCode);
			}
		}
	};
};

/**
 * Defines the default target area to be used by the controllers
 * @param {*} target String with the ID of the DOM element that will receive the content or a reference to an HTMLElement
 */
$module.setTarget = function(target) {
	$scope.defaultTarget = target;
};

export default $module;