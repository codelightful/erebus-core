import handler from './handler.mjs';
import utils from './utils.mjs';

const $scope = {};
// Holds the language defined for the application
$scope.language = null;
// Holds all the resources defined
$scope.resources = {};

/** Allows to obtain the locale code in the client */
function getLocale() {
	if (navigator.language) {
		return navigator.language;
	} else if (navigator.browserLanguage) {
		return navigator.browserLanguage;
	}
	return 'en-US';
}

/** Obtains the default language defined for the current system */
function getSystemLanguage() {
	return getLocale().substr(0, 2);
}

/**
 * Allows to set the language used by the application
 * @param {string} value Two letter ISO language code
 */
function setLanguage(value) {
	$scope.language = value;
}

/** Obtains the language defined for the application */
function getLanguage() {
	if (!$scope.language) {
		return getSystemLanguage();
	}
	return $scope.language;
}

/**
 * Sets the resource bundle for a specific language
 * @param {*} resource Object with the labels and values, function providing the object with the label and values
 * 				or promise to be fulfilled with the label and values
 * @param {*} langCode String with the language code or omit to use the system default language
 */
function setResourceBundle(resource, langCode) {
	if (!resource) {
		return Promise.resolve();
	}
	if (!langCode) {
		langCode = getLanguage();
	}
	if (typeof (resource) === 'function') {
		const result = handler.trigger(resource);
		return setResourceBundle(result, langCode);
	} else if (utils.isPromise(resource)) {
		return resource.then(function (result) {
			return setResourceBundle(result, langCode);
		}).catch(function (ex) {
			const err = Error('erebus.i18n.promise_resource_error');
			err.cause = ex;
			throw err;
		});
	}
	const target = $scope.resources[langCode];
	if(!target) {
		$scope.resources[langCode] = resource;
	} else {
		Object.assign(target, resource);
	}
	return Promise.resolve();
}

/**
 * Obtains an i18n label for the language defined in the syste,
 * @param {*} key Key to obtain the value for it
 * @param {*} defaultValue Default value in case that no language resource has been set
 */
function getLabel(key, defaultValue) {
	const langCode = getLanguage();
	const resources = $scope.resources[langCode];
	if (!resources || !resources[key]) {
		return defaultValue ?? key;
	}
	return resources[key];
}

export default { getLocale, getSystemLanguage, setLanguage, getLanguage, setResourceBundle, getLabel };
