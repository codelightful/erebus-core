import { strict as assert } from 'assert';
await import('./setup/dom.mjs');
const Erebus = (await import('../src/index.mjs')).default;

describe('Erebus.$ - events', function() {
	it('Contract', function() {
		const element = Erebus.$('<div>Hello Erebus!</div>');
		assert.ok(element);
		assert.ok(element.addEventListener);
		assert.ok(element.once);
		assert.ok(element.onClick);
	});

	it('Test addEventListener with no arguments', function() {
		assert.throws(() => {
			const htmlElement = document.createElement('div');
			const erebusElement = Erebus.$(htmlElement);
			erebusElement.addEventListener();
		}, {
			message: /erebus.element.add_listener.null_event_name/
		});
	});

	it('Test addEventListener with null event name', function() {
		assert.throws(() => {
			const htmlElement = document.createElement('div');
			const erebusElement = Erebus.$(htmlElement);
			erebusElement.addEventListener(null, function() {});
		}, {
			message: /erebus.element.add_listener.null_event_name/
		});
	});

	it('Test addEventListener valid handler', function() {
		const holder = { triggered: 0 };
		const htmlElement = document.createElement('div');
		const erebusElement = Erebus.$(htmlElement);
		erebusElement.addEventListener('click', function() {
			holder.triggered++;
		});
		htmlElement.click();
		htmlElement.click();
		htmlElement.click();
		assert.strictEqual(holder.triggered, 3);
	});

	it('Test once with valid handler', function() {
		const holder = { triggered: 0 };
		const htmlElement = document.createElement('div');
		const erebusElement = Erebus.$(htmlElement);
		erebusElement.once('click', function() {
			holder.triggered++;
		});
		htmlElement.click();
		htmlElement.click();
		htmlElement.click();
		assert.strictEqual(holder.triggered, 1);
	});

	it('Test onClick with valid handler', function() {
		const holder = { triggered: 0 };
		const htmlElement = document.createElement('div');
		const erebusElement = Erebus.$(htmlElement);
		erebusElement.onClick(function() {
			holder.triggered++;
		});
		htmlElement.click();
		htmlElement.click();
		htmlElement.click();
		assert.strictEqual(holder.triggered, 3);
	});

	it('Test onFocus/onBlur with valid handler', function() {
		const holder = { focusCount: 0, blurredCount: 0 };
		const htmlElement = document.createElement('input');
		document.body.appendChild(htmlElement);
		const anotherElement = document.createElement('input');
		document.body.appendChild(anotherElement);
		const erebusElement = Erebus.$(htmlElement);
		erebusElement.onFocus(function() {
			holder.focusCount++;
		});
		erebusElement.onBlur(function() {
			holder.blurredCount++;
		});
		anotherElement.focus();
		htmlElement.focus();
		anotherElement.focus();
		htmlElement.focus();
		anotherElement.focus();
		htmlElement.focus();
		assert.strictEqual(holder.focusCount, 3);
		assert.strictEqual(holder.blurredCount, 2);
	});
});
