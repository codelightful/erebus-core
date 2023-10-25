import { strict as assert } from 'assert';
await import('./setup/dom.mjs');
const Erebus = (await import('../src/index.mjs')).default;

describe('Formats', function() {
	it('Validate formatter existence', function() {
		const formatterList = ['integer', 'decimal', 'money', 'date', 'datetime'];
		for (let fdx=0; fdx < formatterList.length; fdx++) {
			const result = Erebus.formats(formatterList[fdx]);
			assert.ok(result, `Missing formatter (${formatterList[fdx]})`);
			assert.strictEqual(result.name, formatterList[fdx]);
		}
	});

	it('Format/deformat valid boolean', function() {
		const formatter = Erebus.formats('boolean');
		const inputValue = true;
		const formatted = formatter.format(inputValue);
		assert.strictEqual(typeof(formatted), 'string');
		assert.strictEqual(formatted, 'true', 'The formatted value does not match the expected');
		const deformatted = formatter.deformat(formatted);
		assert.strictEqual(deformatted, inputValue, 'The deformatted value does not match the expected');
	});

	it('Format/deformat valid integer', function() {
		const formatter = Erebus.formats('integer');
		const inputValue = 12345678;
		const formatted = formatter.format(inputValue);
		assert.strictEqual(typeof(formatted), 'string');
		assert.strictEqual(formatted, '12345678', 'The formatted value does not match the expected');
		const deformatted = formatter.deformat(formatted);
		assert.strictEqual(deformatted, inputValue, 'The deformatted value does not match the expected');
	});

	it('Format/deformat valid decimal', function() {
		Erebus.i18n.setDecimalSymbol('d');
		const formatter = Erebus.formats('decimal');
		const inputValue = 12345678.9876;
		const formatted = formatter.format(inputValue);
		assert.strictEqual(typeof(formatted), 'string');
		assert.strictEqual(formatted, '12345678d9876', 'The formatted value does not match the expected');
		const deformatted = formatter.deformat(formatted);
		assert.strictEqual(deformatted, inputValue, 'The deformatted value does not match the expected');
	});

	it('Format/deformat valid money', function() {
		Erebus.i18n.setThousandsSeparator('x');
		Erebus.i18n.setDecimalSymbol('d');
		const formatter = Erebus.formats('money');
		const inputValue = 7654321.85;
		const formatted = formatter.format(inputValue);
		assert.strictEqual(typeof(formatted), 'string');
		assert.strictEqual(formatted, `7x654x321d85`, 'The formatted value does not match the expected');
		const deformatted = formatter.deformat(formatted);
		assert.strictEqual(deformatted, inputValue, 'The deformatted value does not match the expected');
	});

	it('Format/deformat valid date', function() {
		Erebus.i18n.setDateFormat('yyyymmdd');
		const formatter = Erebus.formats('date');
		const inputValue = new Date(2010, 5, 15, 14, 35, 20);
		const formatted = formatter.format(inputValue);
		assert.strictEqual(typeof(formatted), 'string');
		assert.strictEqual(formatted, '20100615', 'The formatted value does not match the expected');
		const deformatted = formatter.deformat(formatted);
		assert.strictEqual(deformatted.getFullYear(), inputValue.getFullYear());
		assert.strictEqual(deformatted.getMonth(), inputValue.getMonth());
		assert.strictEqual(deformatted.getDate(), inputValue.getDate());
		assert.strictEqual(deformatted.getHours(), 0);
		assert.strictEqual(deformatted.getMinutes(), 0);
		assert.strictEqual(deformatted.getSeconds(), 0);
	});

	it('Format/deformat valid datetime', function() {
		Erebus.i18n.setDateTimeFormat('yyyymmddhhMMss');
		const formatter = Erebus.formats('datetime');
		const inputValue = new Date(2010, 5, 15, 14, 35, 20);
		const formatted = formatter.format(inputValue);
		assert.strictEqual(typeof(formatted), 'string');
		assert.strictEqual(formatted, '20100615143520', 'The formatted value does not match the expected');
		const deformatted = formatter.deformat(formatted);
		assert.strictEqual(deformatted.getFullYear(), inputValue.getFullYear());
		assert.strictEqual(deformatted.getMonth(), inputValue.getMonth());
		assert.strictEqual(deformatted.getDate(), inputValue.getDate());
		assert.strictEqual(deformatted.getHours(), 14);
		assert.strictEqual(deformatted.getMinutes(), 35);
		assert.strictEqual(deformatted.getSeconds(), 20);
	});
});
