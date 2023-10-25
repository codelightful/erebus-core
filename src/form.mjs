import format from './formats.mjs';
import validator from './validator.mjs';
import utils from './utils.mjs';
import handler from './handler.mjs';

/**
 * Extracts all the reference to the applicable fields that contains a model attribute
 * @param {string} containerId Identifier of the top DOM element from where all the model fields will be extracted
 */
function getModelFields(containerId) {
	const formElement = document.getElementById(containerId);
	if (!formElement) {
		console.warn(`erebus.form.container_not_found[${containerId}]`);
		return [];
	}
	return formElement.querySelectorAll('[model]');
}

/**
 * Extracts all the reference to the fields that contains a validation attribute
 * @param {string} containerId Identifier of the top DOM element from where all the applicable fields will be extracted
 */
function getValidationFields(containerId) {
	const formElement = document.getElementById(containerId);
	if (!formElement) {
		console.warn(`erebus.form.container_not_found[${containerId}]`);
		return [];
	}
	return formElement.querySelectorAll('[validation]');
}

/**
 * Extracts the applicable formatter according to the field specification
 * @param {object} fieldInstance Reference to the field instance to extract the formatter for it
 * @returns Formatter instance or null if the field does not have any formatter
 */
function getFieldFormatter(fieldInstance) {
	const formatCode = fieldInstance.getAttribute('format');
	return format(formatCode);
}

/**
 * Gets the value from a specific field
 * @param {HTMLElement} fieldInstance Reference to the HTMLElement DOM field instance to extract the value from it
 * @returns Field value
 */
function getFieldValue(fieldInstance) {
	const tagName = fieldInstance.tagName;
	if (tagName === 'INPUT') {
		const inputType = fieldInstance.getAttribute('type');
		if (inputType === 'checkbox' && fieldInstance.value === '@') {
			// NOTE: boolean value is not formatted, so it should not pass thru the formatter logic
			return fieldInstance.checked;
		}
	}
	const formatter = getFieldFormatter(fieldInstance);
	if (formatter) {
		return formatter.deformat(fieldInstance.value);
	}
	return fieldInstance.value;
}

/**
 * Sets the value on a specific field
 * @param {HTMLElement} fieldInstance Reference to the HTMLElement DOM field instance to set the value on it
 * @param {any} value Value to be set
 */
function setFieldValue(fieldInstance, value) {
	if (typeof (value) === 'undefined' || value === null) {
		value = '';
	}
	const tagName = fieldInstance.tagName;
	if (tagName === 'INPUT') {
		const inputType = fieldInstance.getAttribute('type');
		if (inputType === 'checkbox') {
			if (fieldInstance.value === '@') {
				fieldInstance.checked = value;
			} else {
				fieldInstance.checked = (fieldInstance.value === value);
			}
			return;
		} else if (inputType === 'radio') {
			fieldInstance.checked = (fieldInstance.value === value);
			return;
		}
	}
	const formatter = getFieldFormatter(fieldInstance);
	if (formatter) {
		value = formatter.format(value);
	}
	fieldInstance.value = value;
}

/**
 * Determines if a specific model field can be considered to collect its value or not
 * @param {HTMLElement} fieldInstance Reference to the HTMLElement DOM field instance to evaluate
 */
function canCollectField(fieldInstance) {
	const tagName = fieldInstance.tagName;
	if (tagName === 'INPUT') {
		const inputType = fieldInstance.getAttribute('type');
		if (inputType === 'checkbox') {
			if (fieldInstance.value === '@') {
				return true;
			}
			return fieldInstance.checked;
		} else if (inputType === 'radio' && !fieldInstance.checked) {
			return false;
		} else if (inputType === 'button') {
			return false;
		}
	}
	return true;
}

/**
 * Collects the value of a specific field and fills the corresponding model into a collector instance
 * @param {HTMLElement} fieldInstance Reference to the HTMLElement DOM field instance to collect its value
 * @param {object} collector Object in which the model properties and values are being collected into
 */
function collectField(fieldInstance, collector) {
	if (!canCollectField(fieldInstance)) {
		return;
	}
	var model = fieldInstance.getAttribute('model');
	if (!model) {
		return;
	}
	const value = getFieldValue(fieldInstance);
	if (typeof (value) === 'undefined' || value === null || value === '') {
		return;
	}
	model = model.split('.');
	for (var mdx = 0; mdx < model.length; mdx++) {
		var modelAttribute = model[mdx];
		if (mdx == model.length - 1) {
			collector[modelAttribute] = value;
			return;
		}
		if (!collector[modelAttribute]) {
			collector[modelAttribute] = {};
		}
		collector = collector[modelAttribute];
	}
}

/**
 * Allows to determine if a specific field instance is available to be validated
 * @param {HTMLElement} fieldInstance Reference to the field to evaluate
 * @returns Boolean value to determine if can be validated or not
 */
function canValidateField(fieldInstance) {
	const tagName = fieldInstance.tagName;
	return tagName === 'INPUT' || tagName === 'SELECT';
}

/**
 * Extracts an array with the validations or null if the field does not have applicable validations
 * @param {HTMLElement} fieldInstance Reference to the field to extract the validations from it
 * @returns Array with the validations or null if there are not applicable validations
 */
function getEffectiveFieldValidations(fieldInstance) {
	if (!canValidateField(fieldInstance)) {
		return null;
	}
	var fieldValidations = fieldInstance.getAttribute('validation');
	if (fieldValidations === '') {
		return null;
	}
	return fieldValidations.split(';');
}

/**
 * Collects the result from a field and execute any post-process required to include the
 * result into the generic fail collector.
 * @param {*} fieldInstance Instance of the field for which the result was produced
 * @param {*} fieldFailCollector Collector with the failures received from the field validation
 * @param {*} failCollector General collector
 */
function processFieldResult(fieldInstance, fieldFailCollector, failCollector) {
	if (fieldFailCollector.length > 0 && failCollector && Array.isArray(failCollector)) {
		failCollector.push({ field: fieldInstance, failure: fieldFailCollector });
	}
}

/**
 * Implements the validation of a specific form field
 * @param {HTMLElement} fieldInstance Reference to the field to be validated
 * @param {Array} failCollector Optional array to collect the detail of the failures or null to avoid collecting it
 * @param {Funcion} onFieldValidation Function to be invoked with the result of the validation
 * @returns Boolean value to determine if the field passed the validations (true) or not (false)
 */
function validateField(fieldInstance, failCollector, onFieldValidation) {
	const fieldValidations = getEffectiveFieldValidations(fieldInstance);
	if (!fieldValidations) {
		return true;
	}
	var result = true;
	const fieldValue = getFieldValue(fieldInstance);
	const fieldFormat = fieldInstance.getAttribute('format');
	const fieldFailCollector = [];
	for (var vdx=0; vdx < fieldValidations.length; vdx++) {
		const validation = utils.trim(fieldValidations[vdx]);
		if (validation === '') {
			continue;
		}
		result = validator.validate(validation, fieldValue, fieldFormat, fieldFailCollector) && result;
	}
	handler.trigger(onFieldValidation, fieldInstance, result, fieldFailCollector);
	processFieldResult(fieldInstance, fieldFailCollector, failCollector);
	return result;
}

/** Object wrapping the logic to interact with a conceptual form and its fields */
class FormWrapper {
	/** String with the identifier of the top HTMLElement containing the form fields */
	#containerId;

	/**
     * Creates the representation of a wrapping object using an identifier to contextualize the field extraction
     * @param {*} containerId String with the identifier of the top HTMLElement containing the form fields
     */
	constructor(containerId) {
		this.#containerId = containerId;
	}

	/** Cleans all the model fields inside the HTMLElement container */
	clean() {
		const modelFields = getModelFields(this.#containerId);
		for (var fdx = 0; fdx < modelFields.length; fdx++) {
			setFieldValue(modelFields[fdx]);
		}
	}

	/**
     * Extracts all fields inside the HTMLElement container and collects its values into an object.
     * Each field to be collected should contain a model attribute with the name of the property that will hold the field value.
     * @returns Object containing the field values
     */
	collect() {
		const output = {};
		const modelFields = getModelFields(this.#containerId);
		for (var fdx = 0; fdx < modelFields.length; fdx++) {
			collectField(modelFields[fdx], output);
		}
		return output;
	}

	fill(values) {
		if (!values) {
			this.clean();
		}
		const modelFields = getModelFields(this.#containerId);
		for (var fdx = 0; fdx < modelFields.length; fdx++) {
			const fieldInstance = modelFields[fdx];
			var model = fieldInstance.getAttribute('model');
			if (!model) {
				continue;
			}
			var fieldValue = values;
			model = model.split('.');
			for (var mdx = 0; mdx < model.length; mdx++) {
				var modelAttribute = model[mdx];
				if (fieldValue) {
					fieldValue = fieldValue[modelAttribute];
				}
			}
			setFieldValue(fieldInstance, fieldValue);
		}
	}

	/**
	 * Validates the fields in the form container with applicable validations
	 * @param {*} failCollector Optional array to collect the details of the validation failures or null if does not want to be collected
	 * @param {*} onFieldValidation Optional function to receive the result of each field validation
	 * @returns
	 */
	validate(failCollector, onFieldValidation) {
		var result = true;
		const fieldList = getValidationFields(this.#containerId);
		for (var fdx = 0; fdx < fieldList.length; fdx++) {
			result = validateField(fieldList[fdx], failCollector, onFieldValidation) && result;
		}
		return result;
	}
}

const $module = function (formId) {
	return new FormWrapper(formId);
};

export default $module;
