import { strict as assert } from 'assert';
import { runWithMockedConsole } from './setup/test-utils.mjs';
await import('./setup/dom.mjs');
const Erebus = (await import('../src/erebus.mjs')).default;

describe('Handler', function () {
	it('Trigger Null function', function () {
		const result = Erebus.handler.trigger();
		assert.strictEqual(result, undefined);
	});

	it('Trigger Non-function', function () {
		assert.throws(function() {
			Erebus.handler.trigger('non-function');
		});
	});

	it('Trigger Failed function', function () {
		runWithMockedConsole(function() {
			assert.throws(function() {
				Erebus.handler.trigger(function () {
					throw new Error('Some error');
				})
			});
		});
	});

	it('Trigger Good function', function () {
		const result = Erebus.handler.trigger(function () {
			return 'abcd';
		});
		assert.strict(result, 'abcd');
	});

	it('Trigger Null function as a promise', async function () {
		const result = await Erebus.handler.triggerAsPromise();
		assert.strictEqual(result, undefined);
	});

	it('Trigger Non-function as a promise', function () {
		assert.rejects(Erebus.handler.triggerAsPromise('non-function'));
	});

	it('Failed promise function', function () {
		runWithMockedConsole(function() {
			assert.rejects(Erebus.handler.triggerAsPromise(function () {
				throw new Error('Some error');
			}));
		});
	});

	it('Trigger Good function as a promise', async function () {
		const result = await Erebus.handler.triggerAsPromise(function () {
			return 'abcd';
		});
		assert.strictEqual(result, 'abcd');
	});
});
