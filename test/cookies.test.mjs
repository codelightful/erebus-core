import { strict as assert } from 'assert';
await import('./setup/dom.mjs');
const Erebus = (await import('../src/erebus.mjs')).default;

describe('Cookies', function() {
	it('Contract', function() {
		assert.ok(Erebus.cookies);
		assert.ok(Erebus.cookies.set);
		assert.ok(Erebus.cookies.get);
	});

	it('Invoke set without arguments', function() {
		assert.throws(function() {
			Erebus.cookies.set(null, 'one');
		});
	});

	it('Invoke get without arguments', function() {
		const result = Erebus.cookies.get();
		assert.strictEqual(result, null);
	});

	it('Invoke get without any cookie being set', function() {
		const result = Erebus.cookies.get('cookie-name');
		assert.strictEqual(result, '');
	});

	it('Try to set and get a cookie', function() {
		Erebus.cookies.set('cookie-one', 'value=one');
		Erebus.cookies.set('cookie-two', 'value-two');
		var result = Erebus.cookies.get('cookie-one');
		assert.strictEqual(result, 'value=one');
		result = Erebus.cookies.get('cookie-two');
		assert.strictEqual(result, 'value-two');
	});
});
