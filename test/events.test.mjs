import { strict as assert } from 'assert';
await import('./setup/dom.mjs');
const Erebus = (await import('../src/index.mjs')).default;

describe('Events', function() {
	before(function() {
		const css = document.createElement('style');
		css.innerHTML = '.erb-test { animation-name: erb-anim-test; animation-duration: 0.5s; } @keyframes erb-anim-test { 0%{opacity: 1;} 100%{opacity: 0;} }';
		document.head.appendChild(css);
	})

	it('Contract', function() {
		assert.ok(Erebus.events);
		assert.ok(Erebus.events.documentReady);
		assert.ok(Erebus.events.animate);
	});

	it('documentReady', async function() {
		document.body.innerHTML = '';
		await Erebus.events.documentReady();
		document.body.innerHTML = 'Ready!';
		assert.strictEqual(document.body.innerHTML, 'Ready!');
	});

	it('animate without arguments', async function() {
		assert.rejects(Erebus.events.animate());
	});

	it('animate with null target', function() {
		assert.rejects(Erebus.events.animate(null, 'erb-test'));
	});

	it('animate with null animation', function() {
		const target = document.createElement('div');
		assert.rejects(Erebus.events.animate(target, null));
	});

	it('animate with null callback', function() {
		const target = document.createElement('div');
		assert.rejects(Erebus.events.animate(target, 'erb-test'));
	});

	/*
	// NOTE: on the simulated phantom browser the animation does not work. We need to research how to trigger it
	it('animate with plain HTMLElement without className', async function() {
		const target = document.createElement('div');
		document.body.appendChild(target);
		await Erebus.events.animate(target, 'erb-test');
		assert.strictEqual(target.className, 'erb-test');
	});

	it('animate with plain HTMLElement having className', async function() {
		const target = document.createElement('div');
		target.className = 'erb-previous';
		document.body.appendChild(target);
		await Erebus.events.animate(target, 'erb-test');
		assert.strictEqual(target.className, 'erb-previous erb-test');
	});

	it('animate with ErebusElement', async function() {
		const target = document.createElement('div');
		target.className = 'erb-previous';
		const element = Erebus.$(target);
		await Erebus.events.animate(element, 'erb-test');
		assert.strictEqual(target.className, 'erb-previous erb-test');
	});
	*/
});
