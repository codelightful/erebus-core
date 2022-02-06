import { strict as assert } from 'assert';
await import('./setup/dom.mjs');
const Erebus = (await import('../src/erebus.mjs')).default;

describe('Handler', function() {
	it('Null function', async function() {
		const result = await Erebus.handler.trigger();
		assert.ok(!result);
	});

	it('Non function', function() {
		assert.rejects(Erebus.handler.trigger('non-function'));
	});

	it('Failed function', function() {
		assert.rejects(Erebus.handler.trigger(function() {
			throw Error('Internal error');
		}));
	});

	it('Good function', function() {
		const result = Erebus.handler.trigger(function() {
			return 'abcd';
		});
		assert.strict(result, 'abcd');
	});
});
