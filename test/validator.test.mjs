import { strict as assert } from 'assert';
import validator from '../src/validator.mjs';

describe('Cookies', function() {
	it('Test null validation specification', function() {
		const result = validator.validate(null, null);
		assert.strictEqual(result, true);
	});

	it('Test undefined validation specification', function() {
		const result = validator.validate(undefined, null);
		assert.strictEqual(result, true);
	});

	it('Test empty validation specification', function() {
		const result = validator.validate('', null);
		assert.strictEqual(result, true);
	});

	it('Test non-string validation specification', function() {
		const result = validator.validate({}, null);
		assert.strictEqual(result, true);
	});

	it('Test non-existing validation specification', function() {
		const result = validator.validate('xxx', null);
		assert.strictEqual(result, true);
	});

	it('Validates required with null', function() {
		const result = validator.validate('required', null);
		assert.strictEqual(result, false);
	});

	it('Validates required with empty string', function() {
		const result = validator.validate('required', '');
		assert.strictEqual(result, false);
	});

	it('Validates required with undefined', function() {
		const result = validator.validate('required', undefined);
		assert.strictEqual(result, false);
	});
});
