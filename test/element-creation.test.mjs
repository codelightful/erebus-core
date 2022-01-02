import { strict as assert } from 'assert';
await import('./setup/dom.mjs');
const Erebus = (await import('../src/erebus.mjs')).default;

describe('Erebus.element - Creation', function() {
	it('Contract', function() {
		assert.ok(Erebus.element);
	});

	it('HTML', function() {
		const element = Erebus.element('<div>Hello Erebus!</div>');
		assert.ok(element);
	});

	it('Existing ID', function() {
		document.body.innerHTML = '<div id="erebus-content"></div>';
		const element = Erebus.element('#erebus-content');
		assert.ok(element);
	});

	it('Non existing ID', function() {
		assert.throws(() => {
			Erebus.element('#some-id');
		}, {
			message: /erebus.element.unknown_element_id\[#some-id\]/
		});
	});

	it('Existing CSS Selector', function() {
		document.body.innerHTML = '<div class="erebus-class"></div>';
		const element = Erebus.element('.erebus-class');
		assert.ok(element);
	});

	it('Non existing Selector', function() {
		assert.throws(() => {
			Erebus.element('.some-selector');
		}, {
			message: /erebus.element.unknown_selector\[.some-selector\]/
		});
	});

	it('HTMLElement', function() {
		document.body.innerHTML = '<div id="element-identifier"></div>';
		const source = document.getElementById('element-identifier');
		const element = Erebus.element(source);
		assert.ok(element);
	});

	it('Body (string)', function() {
		const element = Erebus.element('body');
		assert.ok(element);
	});

	it('Body (object)', function() {
		const element = Erebus.element(document.body);
		assert.ok(element);
	});
});
