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
			{ field: document.getElementById('fldOne'), failure: [{ name: 'required' }] },
			{ field: document.getElementById('fldTwo'), failure: [{ name: 'required' }] }
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
		{ dataType: 'undefined', threshold: '100', invalid: '99', valid: '100' }
	];
	minScenarios.forEach(scenario => {
		const formatValue = (scenario.dataType === 'undefined') ? '' : scenario.dataType;

		it(`Test "min" validation with ${scenario.dataType} INVALID values`, function() {
			document.body.innerHTML = `<div id="formContainer"><input type="text" id="fldInteger" validation="min=${scenario.threshold}" format="${formatValue}" value="${scenario.invalid}"/></div>`;
			const failCollector = [];
			const result = Erebus.form('formContainer').validate(failCollector);
			assert.strictEqual(result, false);
			assert.deepStrictEqual(failCollector, [ 
				{ field: document.getElementById('fldInteger'), failure: [{ name: 'min', params: scenario.threshold }] }
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
		{ dataType: 'undefined', threshold: '100', invalid: '101', valid: '100' }
	];
	maxScenarios.forEach(scenario => {
		const formatValue = (scenario.dataType === 'undefined') ? '' : scenario.dataType;

		it(`Test "max" validation with ${scenario.dataType} INVALID values`, function() {
			document.body.innerHTML = `<div id="formContainer"><input type="text" id="fldInteger" validation="max=${scenario.threshold}" format="${formatValue}" value="${scenario.invalid}"/></div>`;
			const failCollector = [];
			const result = Erebus.form('formContainer').validate(failCollector);
			assert.strictEqual(result, false);
			assert.deepStrictEqual(failCollector, [ 
				{ field: document.getElementById('fldInteger'), failure: [{ name: 'max', params: scenario.threshold }] }
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
});
