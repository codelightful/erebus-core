import { strict as assert } from 'assert';
await import('./setup/dom.mjs');
const Erebus = (await import('../src/index.mjs')).default;

describe('Forms - Validations', function() {
	it('Test "required" validation with invalid values', function() {
		var htmlContent = '<div id="formContainer">';
		htmlContent += '<input type="text" id="fldOne" validation="required" value=""/>';
		htmlContent += '<input type="text" id="fldTwo" validation="required" value=""/>';
		htmlContent += '</div>';
		document.body.innerHTML = htmlContent;
		const failCollector = [];
		const result = Erebus.form('formContainer').validate(failCollector);
		assert.strictEqual(result, false);
		assert.deepStrictEqual(failCollector, [ 
			{ field: document.getElementById('fldOne'), failures: [{ name: 'required' }] },
			{ field: document.getElementById('fldTwo'), failures: [{ name: 'required' }] }
		]);
	});

	it('Test "required" validation with valid values', function() {
		document.body.innerHTML = '<div id="formContainer"><input type="text" id="fldFieldOne" validation="required" value="something"/></div>';
		const result = Erebus.form('formContainer').validate();
		assert.strictEqual(result, true);
	});

	const minScenarios = [
		{ dataType: 'integer', threshold: '10', invalid: '9', valid: '10' },
		{ dataType: 'decimal', threshold: '10', invalid: '9.99', valid: '10.00' },
		{ dataType: 'money', threshold: '10000', invalid: '9,999.99', valid: '10,000.00' },
		{ dataType: 'undefined', threshold: '9', invalid: 'some', valid: 'something' }
	];
	minScenarios.forEach(scenario => {
		const formatValue = (scenario.dataType === 'undefined') ? '' : scenario.dataType;

		it(`Test "min" validation with ${scenario.dataType} INVALID values`, function() {
			document.body.innerHTML = `<div id="formContainer"><input type="text" id="fldInteger" validation="min=${scenario.threshold}" format="${formatValue}" value="${scenario.invalid}"/></div>`;
			const failCollector = [];
			const result = Erebus.form('formContainer').validate(failCollector);
			assert.strictEqual(result, false);
			assert.deepStrictEqual(failCollector, [ 
				{ field: document.getElementById('fldInteger'), failures: [{ name: 'min', params: scenario.threshold }] }
			]);
		});

		it(`Test "min" validation with ${scenario.dataType} VALID values`, function() {
			document.body.innerHTML = `<div id="formContainer"><input type="text" id="fldInteger" validation="min=${scenario.threshold}" format="${formatValue}" value="${scenario.valid}"/></div>`;
			const failCollector = [];
			const result = Erebus.form('formContainer').validate(failCollector);
			assert.strictEqual(result, true);
			assert.deepStrictEqual(failCollector, []);
		});
	});

	const maxScenarios = [
		{ dataType: 'integer', threshold: '10', invalid: '11', valid: '10' },
		{ dataType: 'decimal', threshold: '10', invalid: '10.50', valid: '10.00' },
		{ dataType: 'money', threshold: '10000', invalid: '10,000.50', valid: '10,000.00' },
		{ dataType: 'undefined', threshold: '9', invalid: 'something else', valid: 'something' }
	];
	maxScenarios.forEach(scenario => {
		const formatValue = (scenario.dataType === 'undefined') ? '' : scenario.dataType;

		it(`Test "max" validation with ${scenario.dataType} INVALID values`, function() {
			document.body.innerHTML = `<div id="formContainer"><input type="text" id="fldInteger" validation="max=${scenario.threshold}" format="${formatValue}" value="${scenario.invalid}"/></div>`;
			const failCollector = [];
			const result = Erebus.form('formContainer').validate(failCollector);
			assert.strictEqual(result, false);
			assert.deepStrictEqual(failCollector, [ 
				{ field: document.getElementById('fldInteger'), failures: [{ name: 'max', params: scenario.threshold }] }
			]);
		});

		it(`Test "max" validation with ${scenario.dataType} VALID values`, function() {
			document.body.innerHTML = `<div id="formContainer"><input type="text" id="fldInteger" validation="max=${scenario.threshold}" format="${formatValue}" value="${scenario.valid}"/></div>`;
			const failCollector = [];
			const result = Erebus.form('formContainer').validate(failCollector);
			assert.strictEqual(result, true);
			assert.deepStrictEqual(failCollector, []);
		});
	});

	it('Test validatefield with no parameters', function() {
		const result = Erebus.form.validateField();
		assert.strictEqual(result, false);
	});

	it('Test validatefield with null field parameter', function() {
		const result = Erebus.form.validateField(null);
		assert.strictEqual(result, false);
	});

	it('Test validatefield with INPUT field without validations', function() {
		const field = document.createElement('input');
		const result = Erebus.form.validateField(field);
		assert.strictEqual(result, true);
	});

	it('Test validatefield with INPUT field with failed validation and no collector', function() {
		const field = document.createElement('input');
		field.setAttribute('validation', 'required');
		const result = Erebus.form.validateField(field);
		assert.strictEqual(result, false);
	});

	it('Test validatefield with INPUT field with failed validation and a collector function', function() {
		const field = document.createElement('input');
		field.setAttribute('validation', 'required');
		const collectedData = {};
		const result = Erebus.form.validateField(field, function(field, result, failures) {
			collectedData.field = field;
			collectedData.result = result;
			collectedData.failures = failures;
		});
		assert.strictEqual(result, false);
		assert.strictEqual(collectedData.field, field, 'The collected field does not match the expected value');
		assert.strictEqual(collectedData.result, false, 'The collected result does not match the expected value');
		assert.deepStrictEqual(collectedData.failures, [{name: 'required'}], 'The collected failures does not match the expected value');
	});

	it('Test validatefield with INPUT field with failed validation and a collector array', function() {
		const field = document.createElement('input');
		field.setAttribute('validation', 'required');
		const collector = [];
		const result = Erebus.form.validateField(field, collector);
		assert.strictEqual(result, false);
		assert.deepStrictEqual(collector, [{ field: field, failures: [{name: 'required'}] }], 'The collector does not match the expected value');
	});

	it('Test validatefield with INPUT field with successful validation and no collector', function() {
		const field = document.createElement('input');
		field.setAttribute('validation', 'required');
		field.setAttribute('value', 'somevalue');
		const result = Erebus.form.validateField(field);
		assert.strictEqual(result, true);
	});

	it('Test validatefield with INPUT field with successful validation and a collector function', function() {
		const field = document.createElement('input');
		field.setAttribute('validation', 'required');
		field.setAttribute('value', 'somevalue');
		const collectedData = {};
		const result = Erebus.form.validateField(field, function(field, result, failures) {
			collectedData.field = field;
			collectedData.result = result;
			collectedData.failures = failures;
		});
		assert.strictEqual(result, true);
		assert.strictEqual(collectedData.field, field, 'The collected field does not match the expected value');
		assert.strictEqual(collectedData.result, true, 'The collected result does not match the expected value');
		assert.deepStrictEqual(collectedData.failures, [], 'The collected failures does not match the expected value');
	});

	it('Test validatefield with INPUT field with successful validation and a collector array', function() {
		const field = document.createElement('input');
		field.setAttribute('validation', 'required');
		field.setAttribute('value', 'somevalue');
		const collector = [];
		const result = Erebus.form.validateField(field, collector);
		assert.strictEqual(result, true);
		assert.deepStrictEqual(collector, [], 'The collector does not match the expected value');
	});
});
