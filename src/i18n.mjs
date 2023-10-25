import handler from './handler.mjs';
import utils from './utils.mjs';

const $module = {};
const $scope = {};
// Holds the language defined for the application
$scope.language = null;
// Holds all the resources defined
$scope.resources = {};
// Holds the symbol used by the system to group the thousands
$scope.systemThousandSymbol = null;
// Holds the symbol used by the application to group the thousands
$scope.appThousandSymbol = null;
// Holds the symbol used by the system to separate the decimal part of a number
$scope.systemDecimalSymbol = null;
// Holds the symbol used by the application to separate the decimal part of a number
$scope.appDecimalSymbol = null;
// Holds the date format defined for the locale
$scope.dateFormat = null;
// Holds the date+time format defined for the locale
$scope.dateTimeFormat = null;

/** Allows to obtain the locale code in the client */
$module.getLocale = function() {
	if (navigator.language) {
		return navigator.language;
	} else if (navigator.browserLanguage) {
		return navigator.browserLanguage;
	}
	return 'en-US';
};

/** Obtains the default language defined for the current system */
$module.getSystemLanguage = function() {
	return $module.getLocale().substr(0, 2);
};

/**
 * Allows to set the language used by the application
 * @param {string} value Two letter ISO language code
 */
$module.setLanguage = function(value) {
	$scope.language = value;
};

/** Obtains the language defined for the application */
$module.getLanguage = function() {
	if (!$scope.language) {
		return $module.getSystemLanguage();
	}
	return $scope.language;
};

/**
 * Sets the resource bundle for a specific language
 * @param {*} resource Object with the labels and values, function providing the object with the label and values
 * 				or promise to be fulfilled with the label and values
 * @param {*} langCode String with the language code or omit to use the system default language
 */
$module.setResourceBundle = function(resource, langCode) {
	if (!resource) {
		return Promise.resolve();
	}
	if (!langCode) {
		langCode = $module.getLanguage();
	}
	if (typeof (resource) === 'function') {
		const result = handler.trigger(resource);
		return $module.setResourceBundle(result, langCode);
	} else if (utils.isPromise(resource)) {
		return resource.then(function (result) {
			return $module.setResourceBundle(result, langCode);
		}).catch(function (ex) {
			const err = Error('erebus.i18n.promise_resource_error');
			err.cause = ex;
			throw err;
		});
	}
	const target = $scope.resources[langCode];
	if (!target) {
		$scope.resources[langCode] = resource;
	} else {
		Object.assign(target, resource);
	}
	return Promise.resolve();
};

/**
 * Obtains an i18n label for the language defined in the syste,
 * @param {*} key Key to obtain the value for it
 * @param {*} defaultValue Default value in case that no language resource has been set
 */
$module.getLabel = function(key, defaultValue) {
	const langCode = $module.getLanguage();
	const resources = $scope.resources[langCode];
	if (!resources || !resources[key]) {
		return defaultValue ?? key;
	}
	return resources[key];
};

/** Allows to get the thousands grouping separator used by the system */
$module.getSystemThousandsSeparator = function () {
	if ($scope.systemThousandSymbol === null) {
		const numericFormatter = new Intl.NumberFormat($module.getLanguage(), { useGrouping: true, minimumFractionDigits: 2, maximumFractionDigits: 2 });
		var value = numericFormatter.format('123456.1');
		$scope.systemThousandSymbol = value.substring(3, 4);
	}
	return $scope.systemThousandSymbol;
};

/** Allows to get the thousands grouping separator used by the application */
$module.getThousandsSeparator = function () {
	if ($scope.appThousandSymbol === null) {
		$scope.appThousandSymbol = $module.getSystemThousandsSeparator();
	}
	return $scope.appThousandSymbol;
};

/** Allows to set the thousands grouping separator used by the application */
$module.setThousandsSeparator = function (value) {
	$scope.appThousandSymbol = value;
};

/** Allows to get the decimal symbol used by the application */
$module.getSystemDecimalSymbol = function () {
	if ($scope.systemDecimalSymbol === null) {
		const numericFormatter = new Intl.NumberFormat($module.getLanguage(), { useGrouping: true, minimumFractionDigits: 2, maximumFractionDigits: 2 });
		var value = numericFormatter.format('1.99');
		$scope.systemDecimalSymbol = value.substring(1, 2);
	}
	return $scope.systemDecimalSymbol;
};

/** Allows to get the decimal symbol used by the application */
$module.getDecimalSymbol = function () {
	if ($scope.appDecimalSymbol === null) {
		$scope.appDecimalSymbol = $module.getSystemDecimalSymbol();
	}
	return $scope.appDecimalSymbol;
};

/** Allows to set the decimal symbol used by the application */
$module.setDecimalSymbol = function (value) {
	$scope.appDecimalSymbol = value;
};

/**
 * Allows to obtain the date format defined by the system locale configuration
 */
$module.getSystemDateFormat = function() {
	const dummyDate = new Date(1980, 10, 20);
	const locale = $module.getLocale();
	var formattedDate = dummyDate.toLocaleDateString(locale, { year: 'numeric', month: 'numeric', day: 'numeric' });
	formattedDate = formattedDate.replace('1980', 'yyyy');
	formattedDate = formattedDate.replace('11', 'mm');
	return formattedDate.replace('20', 'dd');
};

/**
 * Allows to obtain the date format defined for the application
 */
$module.getDateFormat = function() {
	if (!$scope.dateFormat) {
		$scope.dateFormat = $module.getSystemDateFormat();
	}
	return $scope.dateFormat;
};

/**
 * Allows to define the date format for the application
 * @param {string} format String with the date format to define, using the following elements:
 * 			- yyyy: year
 * 			- mm: month
 * 			- dd: day
 */
$module.setDateFormat = function(format) {
	$scope.dateFormat = format;
};

/**
 * Allows to obtain the date and time format defined by the system locale configuration
 */
$module.getDateTimeFormat = function() {
	if (!$scope.dateTimeFormat) {
		const dateFormat = $module.getDateFormat();
		$scope.dateTimeFormat = `${dateFormat} hh:MM:ss`;
	}
	return $scope.dateTimeFormat;
};

/**
 * Allows to define the date and time format for the application
 * @param {string} format String with the date and time format to define, using the following elements:
 * 			- yyyy: year
 * 			- mm: month
 * 			- dd: day
 * 			- hh: Hour of the day
 * 			- MM: minutes
 * 			- ss: Seconds
 */
$module.setDateTimeFormat = function(format) {
	$scope.dateTimeFormat = format;
};

export default $module;
