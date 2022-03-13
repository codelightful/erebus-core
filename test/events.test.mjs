import { strict as assert } from 'assert';
await import('./setup/dom.mjs');
const Erebus = (await import('../src/erebus.mjs')).default;

describe('Events', function() {
	before(function() {
		const css = document.createElement('style');
		css.innerHTML = '.erb-test { animation-name: erb-anim-test; animation-duration: 0.5s; } @keyframes erb-anim-test { 0%{opacity: 1;} 100%{opacity: 0;} }';
		document.head.appendChild(css);
	})

	it('Contract', function() {
		assert.ok(Erebus.events);
		assert.ok(Erebus.events.onReady);
		assert.ok(Erebus.events.waitAnimation);
	});

	it('onReady', function() {
		document.body.innerHTML = '';
		Erebus.events.onReady(function() {
			document.body.innerHTML = 'Ready!';
		});
		assert.strictEqual(document.body.innerHTML, 'Ready!');
	});

	it('waitAnimation without arguments', function() {
		assert.throws(function() {
			Erebus.events.waitAnimation();
		});
	});

	it('waitAnimation with null target', function() {
		assert.throws(function() {
			Erebus.events.waitAnimation(null, 'erb-test', function() {});
		});
	});

	it('waitAnimation with null animation', function() {
		const target = document.createElement('div');
		assert.throws(function() {
			Erebus.events.waitAnimation(target, null, function() {});
		});
	});

	it('waitAnimation with null callback', function() {
		const target = document.createElement('div');
		assert.throws(function() {
			Erebus.events.waitAnimation(target, 'erb-test', null);
		});
	});

	it('waitAnimation with plain HTMLElement without className', function() {
		const target = document.createElement('div');
		document.body.appendChild(target);
		Erebus.events.waitAnimation(target, 'erb-test', function() {
			// NOTE: on the simulated phantom browser the animation does not work
		});
		assert.strictEqual(target.className, 'erb-test');
	});

	it('waitAnimation with plain HTMLElement having className', function() {
		const target = document.createElement('div');
		target.className = 'erb-previous';
		document.body.appendChild(target);
		Erebus.events.waitAnimation(target, 'erb-test', function() {
			// NOTE: on the simulated phantom browser the animation does not work
		});
		assert.strictEqual(target.className, 'erb-previous erb-test');
	});

	it('waitAnimation with ErebusElement', function() {
		const target = document.createElement('div');
		target.className = 'erb-previous';
		const element = Erebus.element(target);
		Erebus.events.waitAnimation(element, 'erb-test', function() {
			// NOTE: on the simulated phantom browser the animation does not work
		});
		assert.strictEqual(target.className, 'erb-previous erb-test');
	});
});
