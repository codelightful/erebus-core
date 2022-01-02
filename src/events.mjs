/**
 * Allows to register a callback to be executed when the document ready state has been reached
 * @param callback Function to be executed when the document ready is reached
 */
function onReady(callback) {
	if (document.readyState === 'complete') {
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

export default { onReady };