import { strict as assert } from 'assert';
await import('./setup/dom.mjs');
const Erebus = (await import('../src/index.mjs')).default;

function countAttributes(obj) {
	if (!obj) {
		return -1;
	}
	var attributeCount = 0;
	for (var attribute in obj) {
		attributeCount++;
	}
	return attributeCount;
}

function assertFieldValue(fieldId, expected, message) {
	var field = document.getElementById(fieldId);
	assert.strictEqual(field.value, expected, message);
}

function assertFieldChecked(fieldId, expected, message) {
	var field = document.getElementById(fieldId);
	assert.strictEqual(field.checked, expected, message);
}

describe('Forms', function() {
	it('Extract form from NON existing value', function() {
		const formInstance = Erebus.form('NonExistingElementId');
		assert.ok(formInstance);
		const result = formInstance.collect();
		assert.strictEqual(countAttributes(result), 0, 'The collected value from an unexisting form should not have any attribute');
	});

	it('Collects form fields from empty form', function() {
		document.body.innerHTML = '<div id="emptyFormContainer"></div>';
		const result = Erebus.form('emptyFormContainer').collect();
		assert.ok(result);
		assert.strictEqual(countAttributes(result), 0, 'The collected value from an empty form should not have any attribute');
	});

	it('Buttons should not be collected', function() {
		document.body.innerHTML = '<div id="validFormContainer"><input type="button" model="collected" value="someValue"/></div>';
		const result = Erebus.form('validFormContainer').collect();
		assert.ok(result);
		assert.strictEqual(countAttributes(result), 0, 'A button field should not be collected does not matter if it has model');
	});

	it('Fields with empty value should not be collected', function() {
		document.body.innerHTML = '<div id="validFormContainer"><input type="text" model="collected" value=""/></div>';
		const result = Erebus.form('validFormContainer').collect();
		assert.ok(result);
		assert.strictEqual(countAttributes(result), 0, 'An INPUT field with empty value should not be collected');
	});

	it('Collects hierarchical model', function() {
		document.body.innerHTML = '<div id="validFormContainer"><input type="text" model="person.name" value="John Doe"/></div>';
		const result = Erebus.form('validFormContainer').collect();
		assert.ok(result);
		assert.deepStrictEqual(result, { person: { name: 'John Doe' } });
	});

	it('Collects values from INPUT text field', function() {
		document.body.innerHTML = '<div id="validFormContainer"><input type="text" model="one" value="Value1"/><input type="text" model="two" value="Value2"/></div>';
		const result = Erebus.form('validFormContainer').collect();
		assert.ok(result);
		assert.deepStrictEqual(result, { one: 'Value1', two: 'Value2' });
	});

	it('Collects values from INPUT text field formatted as integer', function() {
		document.body.innerHTML = '<div id="validFormContainer"><input type="text" model="collected" value="123456" format="integer"/></div>';
		const result = Erebus.form('validFormContainer').collect();
		assert.ok(result);
		assert.deepStrictEqual(result, { collected: 123456 });
	});

	it('Collects values from INPUT text field formatted as decimal', function() {
		Erebus.i18n.setDecimalSymbol('x');
		document.body.innerHTML = '<div id="validFormContainer"><input type="text" model="collected" value="123456x45" format="decimal"/></div>';
		const result = Erebus.form('validFormContainer').collect();
		assert.ok(result);
		assert.deepStrictEqual(result, { collected: 123456.45 });
	});

	it('Collects values from INPUT text field formatted as money', function() {
		Erebus.i18n.setThousandsSeparator('.');
		Erebus.i18n.setDecimalSymbol(',');
		document.body.innerHTML = '<div id="validFormContainer"><input type="text" model="collected" value="7.654.321,45" format="decimal"/></div>';
		const result = Erebus.form('validFormContainer').collect();
		assert.ok(result);
		assert.deepStrictEqual(result, { collected: 7654321.45 });
	});

	it('Collects values from INPUT text field formatted as date', function() {
		Erebus.i18n.setDateFormat('dd/mm/yyyy');
		document.body.innerHTML = '<div id="validFormContainer"><input type="text" model="collected" value="20/11/2023" format="date"/></div>';
		const result = Erebus.form('validFormContainer').collect();
		assert.ok(result);
		assert.deepStrictEqual(result, { collected: new Date(2023, 10, 20, 0, 0, 0) });
	});

	it('Collects values from INPUT text field formatted as date/time', function() {
		Erebus.i18n.setDateTimeFormat('yyyymmddhhMMss');
		document.body.innerHTML = '<div id="validFormContainer"><input type="text" model="collected" value="20231120143545" format="datetime"/></div>';
		const result = Erebus.form('validFormContainer').collect();
		assert.ok(result);
		assert.deepStrictEqual(result, { collected: new Date(2023, 10, 20, 14, 35, 45) });
	});

	it('Collects values from INPUT checkbox regular field', function() {
		document.body.innerHTML = '<div id="validFormContainer"><input type="checkbox" model="one" value="Value1" checked="true"/><input type="checkbox" model="two" value="Value2"/></div>';
		const result = Erebus.form('validFormContainer').collect();
		assert.ok(result);
		assert.deepStrictEqual(result, { one: 'Value1' });
	});

	it('Collects values from INPUT checkbox boolean field', function() {
		document.body.innerHTML = '<div id="validFormContainer"><input type="checkbox" model="one" value="@" checked="true"/><input type="checkbox" model="two" value="@"/></div>';
		const result = Erebus.form('validFormContainer').collect();
		assert.ok(result);
		assert.deepStrictEqual(result, { one: true, two: false });
	});

	it('Collects values from INPUT radio button', function() {
		document.body.innerHTML = '<div id="validFormContainer"><input type="radio" name="radioOne" model="radio" value="One"/><input type="radio" name="radioOne" model="radio" value="Two" checked="true"/><input type="radio" name="radioOne" model="radio" value="Three"/></div>';
		const result = Erebus.form('validFormContainer').collect();
		assert.ok(result);
		assert.deepStrictEqual(result, { radio: 'Two' });
	});

	it('Fills a form with a null value', function() {
		document.body.innerHTML = '<div id="validFormContainer"><input type="text" id="fldOne" model="one" value="OriginalOne"/></div>';
		Erebus.form('validFormContainer').fill(null);
		assertFieldValue('fldOne', '', 'The INPUT text field should be clean when a null value was used to fill it');
	});

	it('Fills INPUT text', function() {
		document.body.innerHTML = '<div id="validFormContainer"><input type="text" id="fldOne" model="one" value="OriginalOne"/><input type="text" id="fldTwo" model="two" value="OriginalTwo"/></div>';
		Erebus.form('validFormContainer').fill({ one: 'NewOne' });
		assertFieldValue('fldOne', 'NewOne', 'The INPUT text field value was not set by the fill method');
		assertFieldValue('fldTwo', '', 'The INPUT text field value was not set by the fill method');
	});

	it('Fills INPUT text formatted as integer', function() {
		document.body.innerHTML = '<div id="validFormContainer"><input type="text" id="fldTest" format="integer" model="consume" value="OriginalValue"/></div>';
		Erebus.form('validFormContainer').fill({ consume: 1234567 });
		assertFieldValue('fldTest', '1234567', 'The integer INPUT text field value was not properly set by the fill method');
	});

	it('Fills INPUT text formatted as decimal', function() {
		Erebus.i18n.setDecimalSymbol('x');
		document.body.innerHTML = '<div id="validFormContainer"><input type="text" id="fldTest" format="decimal" model="consume" value="OriginalValue"/></div>';
		Erebus.form('validFormContainer').fill({ consume: 654321.85 });
		assertFieldValue('fldTest', '654321x85', 'The decimal INPUT text field value was not properly set by the fill method');
	});

	it('Fills INPUT text formatted as money', function() {
		Erebus.i18n.setThousandsSeparator('.');
		Erebus.i18n.setDecimalSymbol(',');
		document.body.innerHTML = '<div id="validFormContainer"><input type="text" id="fldTest" format="money" model="consume" value="OriginalValue"/></div>';
		Erebus.form('validFormContainer').fill({ consume: 7654321.85 });
		assertFieldValue('fldTest', '7.654.321,85', 'The money INPUT text field value was not properly set by the fill method');
	});

	it('Fills INPUT text formatted as date', function() {
		Erebus.i18n.setDateFormat('dd/mm/yyyy');
		document.body.innerHTML = '<div id="validFormContainer"><input type="text" id="fldTest" format="date" model="consume" value="OriginalValue"/></div>';
		Erebus.form('validFormContainer').fill({ consume: new Date(2023, 10, 20) });
		assertFieldValue('fldTest', '20/11/2023', 'The date INPUT text field value was not properly set by the fill method');
	});

	it('Fills INPUT text formatted as datetime', function() {
		Erebus.i18n.setDateTimeFormat('yyyymmddhhMMss');
		document.body.innerHTML = '<div id="validFormContainer"><input type="text" id="fldTest" format="datetime" model="consume" value="OriginalValue"/></div>';
		Erebus.form('validFormContainer').fill({ consume: new Date(2023, 10, 20, 14, 35, 45) });
		assertFieldValue('fldTest', '20231120143545', 'The datetime INPUT text field value was not properly set by the fill method');
	});

	it('Fills INPUT checkbox regular field', function() {
		document.body.innerHTML = '<div id="validFormContainer"><input id="fldPositive" type="checkbox" model="positive" value="YES"/><input id="fldNegative" type="checkbox" model="negative" value="NO" checked="true"/></div>';
		Erebus.form('validFormContainer').fill({ positive: 'YES', negative: 'YES' });
		assertFieldChecked('fldPositive', true, 'The checked flag of a matching checkbox was not properly set');
		assertFieldChecked('fldNegative', false, 'The checked flag of an UNmatching checkbox was not properly set');
	});

	it('Fills INPUT checkbox boolean field', function() {
		document.body.innerHTML = '<div id="validFormContainer"><input id="fldPositive" type="checkbox" model="positive" value="@"/><input id="fldNegative" type="checkbox" model="negative" value="@" checked="true"/></div>';
		Erebus.form('validFormContainer').fill({ positive: true, negative: false });
		assertFieldChecked('fldPositive', true, 'The checked flag of a matching checkbox was not properly set');
		assertFieldChecked('fldNegative', false, 'The checked flag of an UNmatching checkbox was not properly set');
	});

	it('Fills INPUT radio field', function() {
		document.body.innerHTML = '<div id="validFormContainer"><input type="radio" id="fldRadioOne" name="consume" model="consume" value="One"/><input type="radio" id="fldRadioTwo" name="consume" model="consume" value="Two"/><input type="radio" id="fldRadioThree" name="consume" model="consume" value="Three" checked="true"/></div>';
		Erebus.form('validFormContainer').fill({ consume: 'Two' });
		assertFieldChecked('fldRadioOne', false, 'The checked flag of an UNmatching radio was not properly set');
		assertFieldChecked('fldRadioTwo', true, 'The checked flag of a matching checkbox was not properly set');
		assertFieldChecked('fldRadioThree', false, 'The checked flag of an UNmatching radio was not properly set');
	});
});
