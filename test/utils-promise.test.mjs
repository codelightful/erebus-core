import { strict as assert } from 'assert';
await import('./setup/dom.mjs');
const Erebus = (await import('../src/index.mjs')).default;

describe('Utils - Promise', function() {
	it('IsPromise with null', function() {
		const result = Erebus.utils.isPromise(null);
		assert.strictEqual(result, false);
	});

	it('IsPromise with non-promise', function() {
		const result = Erebus.utils.isPromise({});
		assert.strictEqual(result, false);
	});

	it('IsPromise with promise', function() {
		const result = Erebus.utils.isPromise(new Promise(function(resolve, reject) { resolve(); }));
		assert.strictEqual(result, true);
	});

	it('IsPromise with promise like', function() {
		const promiseLike = { then: function() {}, catch: function() {} };
		const result = Erebus.utils.isPromise(promiseLike);
		assert.strictEqual(result, true);
	});
});
