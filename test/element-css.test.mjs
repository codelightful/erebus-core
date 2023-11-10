import { strict as assert } from 'assert';
await import('./setup/dom.mjs');
const Erebus = (await import('../src/index.mjs')).default;

describe('Erebus.$ - CSS Methods', function() {
	it('Contract', function() {
		const erebusElement = Erebus.$(document.body);
		assert.ok(erebusElement);
		assert.ok(erebusElement.addClass);
	});

	it('addClass without arguments', function() {
		const htmlElement = document.createElement('div');
		const erebusElement = Erebus.$(htmlElement);
		erebusElement.addClass();
		assert.strictEqual(htmlElement.className, '');
	});

	it('addClass with empty string', function() {
		const htmlElement = document.createElement('div');
		const erebusElement = Erebus.$(htmlElement);
		erebusElement.addClass('');
		assert.strictEqual(htmlElement.className, '');
	});

	it('addClass with long empty string', function() {
		const htmlElement = document.createElement('div');
		const erebusElement = Erebus.$(htmlElement);
		erebusElement.addClass('  ');
		assert.strictEqual(htmlElement.className, '');
	});

	it('addClass with leading and trailing spaces ', function() {
		const htmlElement = document.createElement('div');
		const erebusElement = Erebus.$(htmlElement);
		erebusElement.addClass('  erb-one  ');
		assert.strictEqual(htmlElement.className, 'erb-one');
	});

	it('addClass with non-existing classes', function() {
		const htmlElement = document.createElement('div');
		const erebusElement = Erebus.$(htmlElement);
		erebusElement.addClass('erb-one', 'erb-two');
		assert.strictEqual(htmlElement.className, 'erb-one erb-two');
	});

	it('addClass with existing classes', function() {
		const htmlElement = document.createElement('div');
		htmlElement.className = 'erb-one-and-half';
		const erebusElement = Erebus.$(htmlElement);
		erebusElement.addClass('erb-one');
		assert.strictEqual(htmlElement.className, 'erb-one-and-half erb-one');
	});

	it('addClass with repeated classes', function() {
		const htmlElement = document.createElement('div');
		htmlElement.className = 'erb-one erb-two';
		const erebusElement = Erebus.$(htmlElement);
		erebusElement.addClass('erb-one', 'erb-two');
		assert.strictEqual(htmlElement.className, 'erb-one erb-two');
	});

	it('removeClass without arguments', function() {
		const htmlElement = document.createElement('div');
		htmlElement.className = 'erb-one';
		const erebusElement = Erebus.$(htmlElement);
		erebusElement.removeClass();
		assert.strictEqual(htmlElement.className, 'erb-one');
	});

	it('removeClass with empty string', function() {
		const htmlElement = document.createElement('div');
		htmlElement.className = 'erb-one';
		const erebusElement = Erebus.$(htmlElement);
		erebusElement.removeClass('');
		assert.strictEqual(htmlElement.className, 'erb-one');
	});

	it('removeClass with long empty string', function() {
		const htmlElement = document.createElement('div');
		htmlElement.className = 'erb-one';
		const erebusElement = Erebus.$(htmlElement);
		erebusElement.removeClass('   ');
		assert.strictEqual(htmlElement.className, 'erb-one');
	});

	it('removeClass from element without class', function() {
		const htmlElement = document.createElement('div');
		const erebusElement = Erebus.$(htmlElement);
		erebusElement.removeClass('   ');
		assert.strictEqual(htmlElement.className, '');
	});

	it('removeClass from element with class', function() {
		const htmlElement = document.createElement('div');
		htmlElement.className = 'erb-one erb-one-and-half erb-two-and-half erb-two';
		const erebusElement = Erebus.$(htmlElement);
		erebusElement.removeClass('erb-one', 'erb-two');
		assert.strictEqual(htmlElement.className, 'erb-one-and-half erb-two-and-half');
	});

	it('Set className', function() {
		const htmlElement = document.createElement('div');
		htmlElement.className = 'erb-one';
		const erebusElement = Erebus.$(htmlElement);
		erebusElement.className = 'erb-two';
		assert.strictEqual(htmlElement.className, 'erb-two');
	});
});
