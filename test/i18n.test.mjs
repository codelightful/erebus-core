import { strict as assert } from 'assert';
await import('./setup/dom.mjs');
const Erebus = (await import('../src/index.mjs')).default;

describe('I18N (Internationalization)', function() {
	it('getLocale', function() {
		const result = Erebus.i18n.getLocale();
		assert.strictEqual(result, 'en-US');
	});

	it('getSystemLanguage', function() {
		const result = Erebus.i18n.getSystemLanguage();
		assert.strictEqual(result, 'en');
	});

	it('getLanguage when it is unset', function() {
		Erebus.i18n.setLanguage(null)
		const result = Erebus.i18n.getLanguage();
		assert.strictEqual(result, 'en');
	});

	it('getLanguage when it is set', function() {
		Erebus.i18n.setLanguage('es');
		const result = Erebus.i18n.getLanguage();
		assert.strictEqual(result, 'es');
	});

	it('getLabel with unset resource and no default value defined', function() {
		Erebus.i18n.setLanguage('fr');
		const result = Erebus.i18n.getLabel('some.key');
		assert.strictEqual(result, 'some.key');		
	});

	it('getLabel with not existing key and a default value defined', function() {
		Erebus.i18n.setLanguage('en');
		Erebus.i18n.setResourceBundle({ 'key.entry': 'key.value' }, 'en');
		const result = Erebus.i18n.getLabel('some.key', 'default.value');
		assert.strictEqual(result, 'default.value');
	});

	it('getLabel with set resource and default value defined', function() {
		Erebus.i18n.setLanguage('ca');
		Erebus.i18n.setResourceBundle({ 'valid.key': 'valid.value' });
		var result = Erebus.i18n.getLabel('valid.key', 'default.value');
		assert.strictEqual(result, 'valid.value');
		// check a language where the resource bundle was not set
		Erebus.i18n.setLanguage('fr');
		result = Erebus.i18n.getLabel('valid.key', 'default.value');
		assert.strictEqual(result, 'default.value');
	});

	it('Set resources without arguments', function() {
		Erebus.i18n.setLanguage('po');
		Erebus.i18n.setResourceBundle();
	});

	it('Set resources with null', function() {
		Erebus.i18n.setLanguage('po');
		Erebus.i18n.setResourceBundle(null);
	});

	it('Set resources from a function', function() {
		Erebus.i18n.setLanguage('po');
		Erebus.i18n.setResourceBundle(function() {
			return { 'function.key': 'function.value' };
		}, 'po');
		const result = Erebus.i18n.getLabel('function.key');
		assert.strictEqual(result, 'function.value');
	});

	it('Set resources from a successful promise', function(done) {
		Erebus.i18n.setLanguage('ja');
		const somePromise = new Promise(function(resolve) {
			resolve({ 'promise.key': 'promise.value' });
		});
		Erebus.i18n.setResourceBundle(somePromise, 'ja').then(function() {
			const result = Erebus.i18n.getLabel('promise.key');
			assert.strictEqual(result, 'promise.value');
			done();
		}).catch(function(err) {
			done(err);
		});
	});

	it('Set resources from a failed promise', function() {
		Erebus.i18n.setLanguage('ko');
		const somePromise = new Promise(function(resolve, reject) {
			reject('CauseOfTheRejecttion');
		});
		assert.rejects(Erebus.i18n.setResourceBundle(somePromise, 'ja'));
	});

	it('Overwriting resources', function() {
		Erebus.i18n.setLanguage('en');
		Erebus.i18n.setResourceBundle({ 'key.1': 'value.1', 'key.2': 'value.2' }, 'en');
		Erebus.i18n.setResourceBundle(function() {
			return { 'key.2': 'value.XX', 'key.3': 'value.3' }
		}, 'en');
		var result = Erebus.i18n.getLabel('key.1');
		assert.strictEqual(result, 'value.1');
		result = Erebus.i18n.getLabel('key.2');
		assert.strictEqual(result, 'value.XX');
		result = Erebus.i18n.getLabel('key.3');
		assert.strictEqual(result, 'value.3');
	});

	it('Gets the system thousands separator', function() {
		const result = Erebus.i18n.getSystemThousandsSeparator();
		assert.ok(result);
	});

	it('Gets the system decimal separator', function() {
		const result = Erebus.i18n.getSystemDecimalSymbol();
		assert.ok(result);
	});

	it('Gets the system date format', function() {
		const result = Erebus.i18n.getSystemDateFormat();
		assert.ok(result);
		assert.ok(result.indexOf('yyyy') >= 0);
		assert.ok(result.indexOf('mm') >= 0);
		assert.ok(result.indexOf('dd') >= 0);
	});

	it('Gets the default application date format', function() {
		Erebus.i18n.setDateFormat(null);
		const result = Erebus.i18n.getDateFormat();
		assert.ok(result);
		const systemFormat = Erebus.i18n.getSystemDateFormat();
		assert.strictEqual(result, systemFormat);
	});

	it('Gets the overrided date format', function() {
		Erebus.i18n.setDateFormat('yyyymmdd');
		const result = Erebus.i18n.getDateFormat();
		assert.strictEqual(result, 'yyyymmdd');
	});

	it('Gets the default application date/time format', function() {
		Erebus.i18n.setDateFormat(null);
		const result = Erebus.i18n.getDateTimeFormat();
		assert.ok(result);
		assert.ok(result.indexOf('yyyy') >= 0);
		assert.ok(result.indexOf('mm') >= 0);
		assert.ok(result.indexOf('dd') >= 0);
		assert.ok(result.indexOf('hh') >= 0);
		assert.ok(result.indexOf('MM') >= 0);
		assert.ok(result.indexOf('ss') >= 0);
	});
});
