import { strict as assert } from 'assert';
await import('./setup/dom.mjs');
const Erebus = (await import('../src/index.mjs')).default;

describe('Base Test', function() {
	it('Environment Test', function() {
		assert.ok(window);
		assert.ok(document);
		assert.ok(HTMLElement);
		assert.ok(Erebus);
	});
});
