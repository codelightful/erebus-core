import utils from './utils.mjs';
import formats from './formats.mjs';

const $scope = {};

// Holds the reference to all the validators defined by the module
$scope.validators = {};

/** Validator to make sure a non-empty/non-null value was provided */
$scope.validators['required'] = function(value) {
	return (value !== null && value !== '' && typeof(value) !== 'undefined');
};

/**
 * Internal utility method to execute a validation logic that is based on a single value parameter
 * @param {*} value Value to evaluate
 * @param {string} params String with a the single value parameter used as a reference for the validator
 * @param {string} valueType String with the type of the expected data type.  It is used to transform the parameter
 * @param {Function} evaluator Function with the validation logic
 * @returns Boolean value with the validation result
 */
function processParametrizedValidator(value, params, valueType, evaluator) {
	if (valueType && utils.trim(valueType) !== '') {
		params = formats(valueType).deformat(params);
	} else if (typeof(value) === 'string' && typeof(params) === 'string') {
		value = parseInt(value);
		params = parseInt(params);
		if (isNaN(value) || isNaN(params)) {
			console.warn('erebus.validator.range.unparseable_string_values', { value: value, range: params });
			return false;
		}
	}
	return evaluator(value, params);
}

/** Validator to make sure an integer value is not less than the provided value */
$scope.validators['min'] = function(value, params, valueType) {
	return processParametrizedValidator(value, params, valueType, function(value, range) {
		return value >= range;
	});
};

/** Validator to make sure an integer value is not greater than the provided value */
$scope.validators['max'] = function(value, params, valueType) {
	return processParametrizedValidator(value, params, valueType, function(value, range) {
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
 * @param {*} value Value to validate using the validation specification
 * @param {string} valueType Optional string to describe the type of value provided.  It allows the method to do a more
 * 		accurate validations when type definition is relevant.  If no value is provided, then default rules will be applicable
 * 		in the execution of the validation.  The possible types are the same defined for Erebus formatters.
 * @param {*} failCollector Array to collect the details about the possible validation failures or null if there is no
 * 		need to collect the failures.
 * @returns Boolean value with the result of the validation
 */
$module.validate = function(validation, value, valueType, failCollector) {
	if (!validation) {
		return true;
	}
	const parsed = parseValidator(validation);
	if (!parsed) {
		console.warn(`erebus.validator.invalid_validation[${validation}]`);
		return true;
	}
	if (!parsed.validator(value, parsed.tag.params, valueType)) {
		if (failCollector && Array.isArray(failCollector)) {
			failCollector.push(parsed.tag);
		}
		return false;
	}
	return true;
};

export default $module;
