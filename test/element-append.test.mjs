import { strict as assert } from 'assert';
await import('./setup/dom.mjs');
const Erebus = (await import('../src/index.mjs')).default;

describe('Erebus.$ - appendChild', function() {
	it('Contract', function() {
		const erebusElement = Erebus.$('<div>Hello Erebus!</div>');
		assert.ok(erebusElement);
		assert.ok(erebusElement.appendChild);
	});

	it('Plain string', function() {
		document.body.innerHTML = 'Hello';
		const erebusElement = Erebus.$('body');
		erebusElement.appendChild(' Erebus!');
		assert.strictEqual(document.body.innerHTML, 'Hello Erebus!');
	});

	it('HTML content', function() {
		document.body.innerHTML = 'Hello';
		const erebusElement = Erebus.$('body');
		erebusElement.appendChild('<span>Erebus HTML Content!</span>');
		assert.strictEqual(document.body.innerHTML, 'Hello<span>Erebus HTML Content!</span>');
	});

	it('HTMLElement', function() {
		document.body.innerHTML = '<span id="inner-element">Erebus HTMLElement!</span>Hello';
		const erebusElement = Erebus.$('body');
		erebusElement.appendChild(document.getElementById('inner-element'));
		assert.strictEqual(document.body.innerHTML, 'Hello<span id="inner-element">Erebus HTMLElement!</span>');
	});

	it('ErebusElement', function() {
		document.body.innerHTML = 'Hello';
		const erebusElement = Erebus.$('body');
		erebusElement.appendChild(Erebus.$('<span>ErebusElement!</span>'));
		assert.strictEqual(document.body.innerHTML, 'Hello<span>ErebusElement!</span>');
	});
});
