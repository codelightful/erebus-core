import i18n from './i18n.mjs';

const $scope = {};
// Holds the reference to all the formatters defined by the module
$scope.formatters = {};
// Holds the reference to the system formatter used to handle numbers with grouping and decimals
$scope.moneyFormatter = null;
// Holds the reference to the system formatter used to handle numbers with decimals without grouping
$scope.decimalFormatter = null;

/**
 * Internal utility method to make sure the number is represented by a two digit value
 * @param {int} value Value to evaluate and add the trailing zero
 * @returns String with the numeric value and a zero trailing whenever it is applicable
 */
function twoDigitNumber(value) {
	if (value && value < 10) {
		return `0${value}`;
	}
	return value;
}

/**
 * Internal method to adjust a formatted string with a numeric representation to use the proper
 * symbols according to the application configuration
 * @param {string} value String with the numeric representation
 */
function standardizeNumericSymbols(value) {
	if (value === null || typeof(value) !== 'string') {
		return value;
	}
	const systemThousands = i18n.getSystemThousandsSeparator();
	const systemDecimal = i18n.getSystemDecimalSymbol();
	var appThousands = i18n.getThousandsSeparator();
	const appDecimal = i18n.getDecimalSymbol();
	if (appThousands === appDecimal) {
		appThousands = '';
	}
	if (systemThousands !== appThousands || systemDecimal !== appDecimal) {
		value = value.replaceAll(systemThousands, 'T');
		value = value.replaceAll(systemDecimal, 'D');
		value = value.replaceAll('T', appThousands);
		value = value.replaceAll('D', appDecimal);
	}
	return value;
}

/**
 * Process a string representation of a number to deformat it by removing any symbol that is not
 * relevant for its parsing
 * @param {string} value String with the numeric representation to evaluate
 * @returns String with the numeric representation ready to be parsed
 */
function prepareNumberForParsing(value) {
	const appThousands = i18n.getThousandsSeparator();
	const appDecimal = i18n.getDecimalSymbol();
	if (appThousands !== appDecimal) {
		value = value.replaceAll(appThousands, '');
		const systemDecimal = i18n.getSystemDecimalSymbol();
		value = value.replaceAll(appDecimal, systemDecimal);
	}
	return value;
}

/**
 * Internal utility method that extracts portions of a date contained in a string
 * @param {string} value Value with the string representation of the date
 * @param {string} dateFormat Format in which the date is represented
 * @param {string} part Part that wants to be extracted
 * @returns Value for the required part
 */
function getDatePart(value, dateFormat, part) {
	var startIndex = dateFormat.indexOf(part);
	var endIndex = startIndex + part.length;
	var partValue = value.substring(startIndex, endIndex);
	return parseInt(partValue);
}

/** Class to define the methods to provide a formatting mechanism */
class Formatter {
	#name;
	#formatter;
	#deformatter;

	constructor(name, formatter, deformatter) {
		this.#name = name;
		this.#formatter = formatter;
		this.#deformatter = deformatter;
	}

	get name() {
		return this.#name;
	}

	/**
     * Method to transform a raw value into a representation to be shown in the UI
     * @param {any} value Raw value that will be transformed applying the corresponding format
     * @returns Formatted value
     */
	format(value) {
		return this.#formatter(value);
	}

	/**
     * Method to transform a formatted UI value into a raw value that can be used for operations
     * @param {string} value String with the formatted value
     * @returns Raw value transformed to be processed by the system
     */
	deformat(value) {
		return this.#deformatter(value);
	}
}

// ----------------
// BOOLEAN
// ----------------
/** Method to format a boolean value to create its UI representation */
function booleanFormatter(value) {
	if (value === null || typeof(value) === 'undefined' || value === '') {
		return null;
	} else if (typeof(value) !== 'boolean') {
		return `ERROR_NON_BOOLEAN[${value}]`;
	}
	return (value === true) ? 'true' : 'false';
}

/** Method to parse a formatted value containing a boolean representation coming from the UI */
function booleanDeformatter(value) {
	if (typeof(value) === 'undefined' || value === null) {
		return null;
	} else if (typeof(value) !== 'string') {
		return value;
	}
	return value === 'true';
}

$scope.formatters['boolean'] = new Formatter('boolean', booleanFormatter, booleanDeformatter);

// ----------------
// INTEGER
// ----------------
/** Method to format a numeric integer value to create its UI representation */
function integerFormatter(value) {
	if (value === null || typeof(value) === 'undefined' || value === '') {
		return null;
	} else if (typeof(value) !== 'number') {
		return `ERROR_NAN[${value}]`;
	}
	return String(value);
}

/** Method to parse a formatted value containing an integer representation coming from the UI */
function integerDeformatter(value) {
	if (typeof(value) === 'undefined' || value === null || value === '') {
		return null;
	} else if (typeof(value) !== 'string') {
		return value;
	}
	return parseInt(value);
}

$scope.formatters['integer'] = new Formatter('integer', integerFormatter, integerDeformatter);

// ----------------
// DECIMAL
// ----------------
/** Method to format a numeric decimal value to create its UI representation */
function decimalFormatter(value) {
	if (value === null || typeof(value) === 'undefined' || value === '') {
		return null;
	} else if (typeof(value) !== 'number') {
		return `ERROR_NAN[${value}]`;
	}
	if ($scope.decimalFormatter === null) {
		$scope.decimalFormatter = Intl.NumberFormat(i18n.getLanguage(), { useGrouping: false, minimumFractionDigits: 2, maximumFractionDigits: 4 });
	}
	var formatted = $scope.decimalFormatter.format(value);
	formatted = standardizeNumericSymbols(formatted);
	return formatted;
}

/** Method to parse a formatted value containing a decimal representation coming from the UI */
function decimalDeformatter(value) {
	if (typeof(value) === 'undefined' || value === null || value === '') {
		return null;
	} else if (typeof(value) !== 'string') {
		return value;
	}
	if ($scope.decimalFormatter === null) {
		$scope.decimalFormatter = Intl.NumberFormat(i18n.getLanguage(), { useGrouping: false, minimumFractionDigits: 2, maximumFractionDigits: 4 });
	}
	value = prepareNumberForParsing(value);
	return parseFloat(value);
}

$scope.formatters['decimal'] = new Formatter('decimal', decimalFormatter, decimalDeformatter);

// ----------------
// MONEY
// ----------------
/** Method to format a numeric value to create its UI representation as money */
function moneyFormatter(value) {
	if (value === null || typeof(value) === 'undefined' || value === '') {
		return null;
	} else if (typeof(value) !== 'number') {
		return `ERROR_NAN[${value}]`;
	}
	if ($scope.moneyFormatter === null) {
		$scope.moneyFormatter = Intl.NumberFormat(i18n.getLanguage(), { useGrouping: true, minimumFractionDigits: 2, maximumFractionDigits: 2 });
	}
	var formatted = $scope.moneyFormatter.format(value);
	formatted = standardizeNumericSymbols(formatted);
	return formatted;
}

/** Method to parse a formatted value containing an numeric representation coming from the UI with money format */
function moneyDeformatter(value) {
	if (typeof(value) === 'undefined' || value === null || value === '') {
		return null;
	} else if (typeof(value) !== 'string') {
		return value;
	}
	value = prepareNumberForParsing(value);
	return parseFloat(value);
}

$scope.formatters['money'] = new Formatter('money', moneyFormatter, moneyDeformatter);

// ----------------
// DATE
// ----------------
/** Method to format a date value to create its UI representation with date part */
function dateFormatter(value) {
	if (value === null || typeof(value) === 'undefined') {
		return null;
	}
	if (value instanceof Date) {
		var dateFormat = i18n.getDateFormat();
		if (!dateFormat) {
			return value.toLocaleDateString(null, { year: 'numeric', month: 'numeric', day: 'numeric' });
		}
		dateFormat = dateFormat.replace('yyyy', value.getFullYear());
		dateFormat = dateFormat.replace('mm', twoDigitNumber(value.getMonth() + 1));
		dateFormat = dateFormat.replace('dd', twoDigitNumber(value.getDate()));
		return dateFormat;
	}
	return value;
}

/** Method to parse a formatted value containing an date representation coming from the UI */
function dateDeformatter(value) {
	if (typeof(value) === 'undefined' || value === null || value === '') {
		return null;
	} else if (typeof(value) !== 'string') {
		return value;
	}
	var dateFormat = i18n.getDateFormat();
	var year = getDatePart(value, dateFormat, 'yyyy');
	var month = getDatePart(value, dateFormat, 'mm');
	var day = getDatePart(value, dateFormat, 'dd');
	const dateValue = new Date(year, month - 1, day);
	return dateValue;
}

$scope.formatters['date'] = new Formatter('date', dateFormatter, dateDeformatter);

// ----------------
// DATE TIME
// ----------------
/** Method to format a date value to create its UI representation with date and time parts */
function dateTimeFormatter(value) {
	if (value === null || typeof(value) === 'undefined') {
		return null;
	}
	if (value instanceof Date) {
		var dateFormat = i18n.getDateTimeFormat();
		if (!dateFormat) {
			return value.toLocaleDateString(null, { year: 'numeric', month: 'numeric', day: 'numeric' });
		}
		dateFormat = dateFormat.replace('yyyy', value.getFullYear());
		dateFormat = dateFormat.replace('mm', twoDigitNumber(value.getMonth() + 1));
		dateFormat = dateFormat.replace('dd', twoDigitNumber(value.getDate()));
		dateFormat = dateFormat.replace('hh', twoDigitNumber(value.getHours()));
		dateFormat = dateFormat.replace('MM', twoDigitNumber(value.getMinutes()));
		dateFormat = dateFormat.replace('ss', twoDigitNumber(value.getSeconds()));
		return dateFormat;
	}
	return value;
}

/** Method to parse a formatted value containing an date/time representation coming from the UI */
function dateTimeDeformatter(value) {
	if (typeof(value) === 'undefined' || value === null || value === '') {
		return null;
	} else if (typeof(value) !== 'string') {
		return value;
	}
	var dateFormat = i18n.getDateTimeFormat();
	var year = getDatePart(value, dateFormat, 'yyyy');
	var month = getDatePart(value, dateFormat, 'mm');
	var day = getDatePart(value, dateFormat, 'dd');
	var hour = getDatePart(value, dateFormat, 'hh');
	var minute = getDatePart(value, dateFormat, 'MM');
	var second = getDatePart(value, dateFormat, 'ss');
	const dateValue = new Date(year, month - 1, day, hour, minute, second);
	return dateValue;
}

$scope.formatters['datetime'] = new Formatter('datetime', dateTimeFormatter, dateTimeDeformatter);

/**
 * Allows to obtain a specific formatter
 * @param {string} formatName String with the code of the formatter to obtain. The possible values are:
 * 			- integer: Formatter to create and parse representation of integer values
 * 			- decimal: Formatter to create and parse representation of decimal values
 * 			- money: Formatter to create and parse representation of numeric values adding grouping and two decimals
 * 			- date: Formatter to create and parse representation of date values
 * 			- datetime: Formatter to create and parse representation of date and time values
 * @returns
 */
const $module = function(formatName) {
	if (!formatName) {
		return null;
	}
	if (!$scope.formatters[formatName]) {
		console.warn(`erebus.formats.unknown_formatter[${formatName}]`);
		return null;
	}
	return $scope.formatters[formatName];
};

export default $module;
