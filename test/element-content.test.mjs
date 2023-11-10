
import { strict as assert } from 'assert';
await import('./setup/dom.mjs');
const Erebus = (await import('../src/index.mjs')).default;

describe('Erebus.$ - content', function() {
	it('Contract', function() {
		const erebusElement = Erebus.$('<div>Hello Erebus!</div>');
		assert.ok(erebusElement);
		assert.ok(erebusElement.content);
	});

	it('Plain string', function() {
		document.body.innerHTML = 'Hello';
		const erebusElement = Erebus.$('body');
		erebusElement.content('Bye bye');
		assert.strictEqual(document.body.innerHTML, 'Bye bye');
	});

	it('HTML content', function() {
		document.body.innerHTML = 'Hello';
		const erebusElement = Erebus.$('body');
		erebusElement.content('<span>Bye bye</span>');
		assert.strictEqual(document.body.innerHTML, '<span>Bye bye</span>');
	});

	it('HTMLElement', function() {
		document.body.innerHTML = 'Hello <span id="inner-element">Erebus HTMLElement</span>';
		const erebusElement = Erebus.$('body');
		erebusElement.content(document.getElementById('inner-element'));
		assert.strictEqual(document.body.innerHTML, '<span id="inner-element">Erebus HTMLElement</span>');
	});

	it('ErebusElement', function() {
		document.body.innerHTML = 'Hello';
		const erebusElement = Erebus.$('body');
		erebusElement.content(Erebus.$('<span>ErebusElement!</span>'));
		assert.strictEqual(document.body.innerHTML, '<span>ErebusElement!</span>');
	});
});
