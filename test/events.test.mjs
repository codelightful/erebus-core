import { strict as assert } from 'assert';
await import('./setup/dom.mjs');
const Erebus = (await import('../src/erebus.mjs')).default;

describe('Events', function() {
	it('Contract', function() {
		assert.ok(Erebus.events);
		assert.ok(Erebus.events.onReady);
	});

	it('onReady', function() {
		document.body.innerHTML = '';
		Erebus.events.onReady(function() {
			document.body.innerHTML = 'Ready!';
		});
	});
});
