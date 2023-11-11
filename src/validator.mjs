/* eslint-disable no-useless-escape */
import utils from './utils.mjs';

const $scope = {};

// Holds the reference to all the validators defined by the module
$scope.validators = {};

/** Validator to make sure a non-empty/non-null value was provided */
$scope.validators['required'] = function(value) {
	return (value !== null && value !== '' && typeof(value) !== 'undefined');
};

/** Validator to make sure a valid email address was provided */
$scope.validators['email'] = function(value) {
	// Since this validation is not implicetely requiring a value, then any empty value is considered valid
	if (value === null || value === undefined || (typeof(value) === 'string' && value.length === 0)) {
		return true;
	}
	var regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
	return typeof(value) === 'string' && regex.test(value);
};

/** Validator to make sure a valid URL was provided */
$scope.validators['url'] = function(value) {
	// Since this validation is not implicetely requiring a value, then any empty value is considered valid
	if (utils.isNonValue(value)) {
		return true;
	}
	var regex = /((http(s)?):\/\/){1}(www|\w{2,256})(\.{1}\w{2,256})+(\/{1}\w{2,256})*(\??\w{1,255}={1}\w{1,255}(&{1}\w{1,255}=\w{1,255})*)?/g;
	return typeof(value) === 'string' && regex.test(value);
};

/**
 * Internal utility method to execute a validation logic that is based on a single value parameter
 * @param {*} value Value to evaluate
 * @param {string} params String with a the single value parameter used as a reference for the validator
 * @param {string} valueType String with the type of the expected data type.  It is used to transform the parameter
 * @param {Function} evaluator Function with the validation logic
 * @returns Boolean value with the validation result
 */
function processParametrizedValidator(value, params, evaluator) {
	if (params === null || params === undefined) {
		throw new Error('erebus.validator.range.no_threshold');
	}
	var effectiveParam = params;
	if (typeof(params) === 'string') {
		if (params.indexOf('.') > 0) {
			effectiveParam = parseFloat(params);
		} else {
			effectiveParam = parseInt(params);
		}
		if (isNaN(effectiveParam)) {
			const errorCode = 'erebus.validator.range.unparseable';
			console.error(`${errorCode}[${typeof(params)}|${params}]`);
			throw new Error(errorCode);
		}
	}
	return evaluator(value, effectiveParam);
}

/** Validator to make sure an integer value is not less than the provided value */
$scope.validators['min'] = function(value, params) {
	// A null, an undefined value or an empty string cannot be evaluated against the threshold
	if (utils.isNonValue(value)) {
		return true;
	}
	if (params === '@now') {
		params = new Date();
	} else if (params === '@today') {
		params = new Date();
		params.setHours(0);
		params.setMinutes(0);
		params.setSeconds(0);
		params.setMilliseconds(0);
	}
	return processParametrizedValidator(value, params, function(value, range) {
		if (typeof(value) === 'string') {
			return value.length >= range;
		}
		return value >= range;
	});
};

/** Validator to make sure an integer value is not greater than the provided value */
$scope.validators['max'] = function(value, params) {
	// A null, an undefined value or an empty string cannot be evaluated against the threshold
	if (utils.isNonValue(value)) {
		return true;
	}
	if (params === '@now') {
		params = new Date();
	} else if (params === '@today') {
		params = new Date();
		params.setHours(23);
		params.setMinutes(59);
		params.setSeconds(59);
		params.setMilliseconds(999);
	}
	return processParametrizedValidator(value, params, function(value, range) {
		if (typeof(value) === 'string') {
			return value.length <= range;
		}
		return value <= range;
	});
};

const $module = {};

/**
 * Parses a validation specification and extract the tag, the parameters and the validator for it
 * @param {*} validator String with the validator specification
 * @returns Object containing the tag, the parameters and the validator reference or null if there is no validator defined for the tag
 */
function parseValidator(validation) {
	if (!validation || typeof(validation) !== 'string') {
		return null;
	}
	var result = null;
	const paramIndex = validation.indexOf('=');
	if (paramIndex < 0) {
		result = { tag: { name: utils.trim(validation) } };
	} else {
		result = { tag: { name: utils.trim(validation.substring(0, paramIndex)) } };
		result.tag.params = utils.trim(validation.substring(paramIndex + 1));
	}
	result.validator = $scope.validators[result.tag.name];
	if (!result.validator) {
		return null;
	}
	return result;
}

/**
 * Executes a specific validation
 * @param {string} validation String containing the validation specification.  The specification is composed by a tag
 * 		that identifies the validation to execute and optional parameters to provide context to the validation instruction.
 * 		The parameters are applicable depending on the needs of the validation.  The tag and the parameters are separated
 * 		by an equals symbol (=).
 * @param {*} value Value to validate using the validation specification. It should be provided using the valid type to
 * 		execute the validation.
 * @param {*} failCollector Array to collect the details about the possible validation failures or null if there is no
 * 		need to collect the failures.
 * @returns Boolean value with the result of the validation
 */
$module.validate = function(validation, value, failCollector) {
	if (!validation) {
		return true;
	}
	const parsed = parseValidator(validation);
	if (!parsed) {
		console.warn(`erebus.validator.invalid_validation[${validation}]`);
		return true;
	}
	if (!parsed.validator(value, parsed.tag.params)) {
		if (failCollector && Array.isArray(failCollector)) {
			failCollector.push(parsed.tag);
		}
		return false;
	}
	return true;
};

export default $module;
