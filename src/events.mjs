import handler from './handler.mjs';

/**
 * Allows to register a callback to be executed when the document ready state has been reached
 * @param callback Function to be executed when the document ready is reached
 */
function onReady(callback) {
	if (document.readyState !== 'loading') {
		callback();
	} else if (typeof (document.addEventListener) === 'function') {
		document.addEventListener('DOMContentLoaded', callback, false);
	} else if (typeof (document.attachEvent) === 'function') {
		document.attachEvent('onreadystatechange', function () {
			if (document.readyState === 'complete') {
				callback();
			}
		});
	}
}

/**
 * Internal method to assign an animation class to an element and invoke a callback when is completed
 * @param target Reference to the HTMLElement (or ErebusElement) to animate
 * @param animationClass String with the CSS animation name to apply
 * @param callback Function to invoked when the animation is completed 
 */
function waitAnimation(target, animationClass, callback) {
	if (!target) {
		throw new Error('erebus.events.wait_animation.invalid_target');
	} else if (!animationClass) {
		throw new Error('erebus.events.wait_animation.invalid_animation');
	} else if (typeof (callback) !== 'function') {
		throw new Error('erebus.events.wait_animation.invalid_callback');
	}
	target.addEventListener('animationend', function () {
		handler.trigger(callback);
	}, { capture: false, once: true });
	if (target.className === '') {
		target.className = animationClass;
	} else if (typeof (target.addClass) === 'function') {
		target.addClass(animationClass);
	} else {
		target.className += ' ' + animationClass;
	}
}

export default { onReady, waitAnimation };