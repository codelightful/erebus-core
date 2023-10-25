import { strict as assert } from 'assert';
await import('./setup/dom.mjs');
const Erebus = (await import('../src/index.mjs')).default;

describe('Utils - Strings', function() {
	it('Trim with null', function() {
		const result = Erebus.utils.trim(null)
		assert.strictEqual(result, null);
	});

	it('Trim with only spaces', function() {
		const result = Erebus.utils.trim('    ')
		assert.strictEqual(result, '');
	});

	it('Trim with leading spaces', function() {
		const result = Erebus.utils.trim('    a a a')
		assert.strictEqual(result, 'a a a');
	});

	it('Trim with trailing spaces', function() {
		const result = Erebus.utils.trim('a a a    ')
		assert.strictEqual(result, 'a a a');
	});

	it('Trim with leading and trailing spaces', function() {
		const result = Erebus.utils.trim('    a a a    ')
		assert.strictEqual(result, 'a a a');
	});
});
