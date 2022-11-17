const $module = {};

/**
 * Allows to register a callback to be executed when the document ready state has been reached
 * @returns Promise to be fulfilled once the document is ready
 */
$module.documentReady = function() {
	if (document.readyState !== 'loading') {
		return Promise.resolve();
	}
	if (typeof (document.addEventListener) === 'function') {
		return new Promise(function(resolve) {
			document.addEventListener('DOMContentLoaded', resolve, false);
		});
	}
	if (typeof (document.attachEvent) === 'function') {
		return new Promise(function(resolve) {
			document.attachEvent('onreadystatechange', function () {
				if (document.readyState === 'complete') {
					resolve();
				}
			});
		});
	}
	console.log('The current browser event management is not supported by the Erebus framework');
	return Promise.reject('erebus.events.unsuported_browser');
};

/**
 * Internal method to assign an animation class to an element and invoke a callback when is completed
 * @param target Reference to the HTMLElement (or ErebusElement) to animate
 * @param animationClass String with the CSS animation name to apply
 */
$module.animate = function(target, animationClass) {
	if (!target) {
		return Promise.reject(Error('erebus.events.wait_animation.invalid_target'));
	} else if (!animationClass) {
		return Promise.reject(Error('erebus.events.wait_animation.invalid_animation'));
	}
	return new Promise(function(resolve) {
		// registers the event handler
		target.addEventListener('animationend', function () {
			resolve();
		}, { capture: false, once: true });

		// implements the animation
		if (target.className === '') {
			target.className = animationClass;
		} else if (target.classList) {
			target.classList.add(animationClass);
		} else if (typeof (target.addClass) === 'function') {
			target.addClass(animationClass);
		} else {
			target.className += ' ' + animationClass;
		}
	});
};

export default $module;