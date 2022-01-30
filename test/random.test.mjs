import { strict as assert } from 'assert';
await import('./setup/dom.mjs');
const Erebus = (await import('../src/erebus.mjs')).default;

describe('Random', function() {
	it('TinyId', function() {
		const value1 = Erebus.random.tinyId();
		const value2 = Erebus.random.tinyId();
		assert.ok(value1);
		assert.strictEqual(typeof(value1), 'string');
		assert.strictEqual(value1.length, 4);
		assert.notEqual(value1, value2);
	});

	it('ShortId', function() {
		const value1 = Erebus.random.shortId();
		const value2 = Erebus.random.shortId();
		assert.ok(value1);
		assert.strictEqual(typeof(value1), 'string');
		assert.strictEqual(value1.length, 8);
		assert.notEqual(value1, value2);
	});

	it('GUID', function() {
		const value1 = Erebus.random.guid();
		const value2 = Erebus.random.guid();
		assert.ok(value1);
		assert.strictEqual(typeof(value1), 'string');
		assert.strictEqual(value1.length, 23);
		assert.notEqual(value1, value2);
	});
});
