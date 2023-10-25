
import { strict as assert } from 'assert';
await import('./setup/dom.mjs');
const Erebus = (await import('../src/index.mjs')).default;

describe('Erebus.element - content', function() {
	it('Contract', function() {
		const element = Erebus.element('<div>Hello Erebus!</div>');
		assert.ok(element);
		assert.ok(element.content);
	});

	it('Plain string', function() {
		document.body.innerHTML = 'Hello';
		const element = Erebus.element('body');
		element.content('Bye bye');
		assert.strictEqual(document.body.innerHTML, 'Bye bye');
	});

	it('HTML content', function() {
		document.body.innerHTML = 'Hello';
		const element = Erebus.element('body');
		element.content('<span>Bye bye</span>');
		assert.strictEqual(document.body.innerHTML, '<span>Bye bye</span>');
	});

	it('HTMLElement', function() {
		document.body.innerHTML = 'Hello <span id="inner-element">Erebus HTMLElement</span>';
		const element = Erebus.element('body');
		element.content(document.getElementById('inner-element'));
		assert.strictEqual(document.body.innerHTML, '<span id="inner-element">Erebus HTMLElement</span>');
	});

	it('ErebusElement', function() {
		document.body.innerHTML = 'Hello';
		const element = Erebus.element('body');
		element.content(Erebus.element('<span>ErebusElement!</span>'));
		assert.strictEqual(document.body.innerHTML, '<span>ErebusElement!</span>');
	});
});
