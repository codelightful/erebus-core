import { strict as assert } from 'assert';
await import('./setup/dom.mjs');
const Erebus = (await import('../src/erebus.mjs')).default;

describe('Erebus.element - appendChild', function() {
	it('Contract', function() {
		const element = Erebus.element('<div>Hello Erebus!</div>');
		assert.ok(element);
		assert.ok(element.appendChild);
	});

	it('Plain string', function() {
		document.body.innerHTML = 'Hello';
		const element = Erebus.element('body');
		element.appendChild(' Erebus!');
		assert.strictEqual(document.body.innerHTML, 'Hello Erebus!');
	});

	it('HTML content', function() {
		document.body.innerHTML = 'Hello';
		const element = Erebus.element('body');
		element.appendChild('<span>Erebus HTML Content!</span>');
		assert.strictEqual(document.body.innerHTML, 'Hello<span>Erebus HTML Content!</span>');
	});

	it('HTMLElement', function() {
		document.body.innerHTML = '<span id="inner-element">Erebus HTMLElement!</span>Hello';
		const element = Erebus.element('body');
		element.appendChild(document.getElementById('inner-element'));
		assert.strictEqual(document.body.innerHTML, 'Hello<span id="inner-element">Erebus HTMLElement!</span>');
	});

	it('ErebusElement', function() {
		document.body.innerHTML = 'Hello';
		const element = Erebus.element('body');
		element.appendChild(Erebus.element('<span>ErebusElement!</span>'));
		assert.strictEqual(document.body.innerHTML, 'Hello<span>ErebusElement!</span>');
	});
});
