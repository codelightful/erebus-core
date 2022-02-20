import { strict as assert } from 'assert';
await import('./setup/dom.mjs');
const Erebus = (await import('../src/erebus.mjs')).default;

describe('Erebus.element - CSS Methods', function() {
	it('Contract', function() {
		const element = Erebus.element(document.body);
		assert.ok(element);
		assert.ok(element.addClass);
	});

	it('addClass without arguments', function() {
		const htmlElement = document.createElement('div');
		const element = Erebus.element(htmlElement);
		element.addClass();
		assert.strictEqual(htmlElement.className, '');
	});

	it('addClass with empty string', function() {
		const htmlElement = document.createElement('div');
		const element = Erebus.element(htmlElement);
		element.addClass('');
		assert.strictEqual(htmlElement.className, '');
	});

	it('addClass with long empty string', function() {
		const htmlElement = document.createElement('div');
		const element = Erebus.element(htmlElement);
		element.addClass('  ');
		assert.strictEqual(htmlElement.className, '');
	});

	it('addClass with leading and trailing spaces ', function() {
		const htmlElement = document.createElement('div');
		const element = Erebus.element(htmlElement);
		element.addClass('  erb-one  ');
		assert.strictEqual(htmlElement.className, 'erb-one');
	});

	it('addClass with non-existing classes', function() {
		const htmlElement = document.createElement('div');
		const element = Erebus.element(htmlElement);
		element.addClass('erb-one', 'erb-two');
		assert.strictEqual(htmlElement.className, 'erb-one erb-two');
	});

	it('addClass with existing classes', function() {
		const htmlElement = document.createElement('div');
		htmlElement.className = 'erb-one-and-half';
		const element = Erebus.element(htmlElement);
		element.addClass('erb-one');
		assert.strictEqual(htmlElement.className, 'erb-one-and-half erb-one');
	});

	it('addClass with repeated classes', function() {
		const htmlElement = document.createElement('div');
		htmlElement.className = 'erb-one erb-two';
		const element = Erebus.element(htmlElement);
		element.addClass('erb-one', 'erb-two');
		assert.strictEqual(htmlElement.className, 'erb-one erb-two');
	});

	it('removeClass without arguments', function() {
		const htmlElement = document.createElement('div');
		htmlElement.className = 'erb-one';
		const element = Erebus.element(htmlElement);
		element.removeClass();
		assert.strictEqual(htmlElement.className, 'erb-one');
	});

	it('removeClass with empty string', function() {
		const htmlElement = document.createElement('div');
		htmlElement.className = 'erb-one';
		const element = Erebus.element(htmlElement);
		element.removeClass('');
		assert.strictEqual(htmlElement.className, 'erb-one');
	});

	it('removeClass with long empty string', function() {
		const htmlElement = document.createElement('div');
		htmlElement.className = 'erb-one';
		const element = Erebus.element(htmlElement);
		element.removeClass('   ');
		assert.strictEqual(htmlElement.className, 'erb-one');
	});

	it('removeClass from element without class', function() {
		const htmlElement = document.createElement('div');
		const element = Erebus.element(htmlElement);
		element.removeClass('   ');
		assert.strictEqual(htmlElement.className, '');
	});

	it('removeClass from element with class', function() {
		const htmlElement = document.createElement('div');
		htmlElement.className = 'erb-one erb-one-and-half erb-two-and-half erb-two';
		const element = Erebus.element(htmlElement);
		element.removeClass('erb-one', 'erb-two');
		assert.strictEqual(htmlElement.className, 'erb-one-and-half erb-two-and-half');
	});

	it('Set className', function() {
		const htmlElement = document.createElement('div');
		htmlElement.className = 'erb-one';
		const element = Erebus.element(htmlElement);
		element.className = 'erb-two';
		assert.strictEqual(htmlElement.className, 'erb-two');
	});
});
