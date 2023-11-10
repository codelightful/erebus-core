import { strict as assert } from 'assert';
await import('./setup/dom.mjs');
const Erebus = (await import('../src/index.mjs')).default;

describe('Erebus.$ - Creation', function() {
	it('Contract', function() {
		assert.ok(Erebus.$);
	});

	it('HTML', function() {
		const erebusElement = Erebus.$('<div>Hello Erebus!</div>');
		assert.ok(erebusElement);
	});

	it('Existing ID', function() {
		document.body.innerHTML = '<div id="erebus-content"></div>';
		const erebusElement = Erebus.$('#erebus-content');
		assert.ok(erebusElement);
	});

	it('Non existing ID', function() {
		assert.throws(() => {
			Erebus.$('#some-id');
		}, {
			message: /erebus.element.unknown_element_id\[#some-id\]/
		});
	});

	it('Existing CSS Selector', function() {
		document.body.innerHTML = '<div class="erebus-class"></div>';
		const erebusElement = Erebus.$('.erebus-class');
		assert.ok(erebusElement);
	});

	it('Non existing Selector', function() {
		assert.throws(() => {
			Erebus.$('.some-selector');
		}, {
			message: /erebus.element.unknown_selector\[.some-selector\]/
		});
	});

	it('HTMLElement', function() {
		document.body.innerHTML = '<div id="element-identifier"></div>';
		const source = document.getElementById('element-identifier');
		const erebusElement = Erebus.$(source);
		assert.ok(erebusElement);
	});

	it('Body (string)', function() {
		const erebusElement = Erebus.$('body');
		assert.ok(erebusElement);
	});

	it('Body (object)', function() {
		const erebusElement = Erebus.$(document.body);
		assert.ok(erebusElement);
	});

	it('Body should be a singleton', function() {
		const one = Erebus.$(document.body);
		const two = Erebus.$('body');
		assert.ok(one === two);
	});
});
