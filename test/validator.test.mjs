import { strict as assert } from 'assert';
import validator from '../src/validator.mjs';

describe('Validators', function() {
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

	//-----------------------------------
	//------------ REQUIRED -------------
	//-----------------------------------
	it('Validates "required" with null', function() {
		const result = validator.validate('required', null);
		assert.strictEqual(result, false);
	});

	it('Validates "required" with empty string', function() {
		const result = validator.validate('required', '');
		assert.strictEqual(result, false);
	});

	it('Validates "required" with undefined value', function() {
		const result = validator.validate('required');
		assert.strictEqual(result, false);
	});

	//-----------------------------------
	//-------------- EMAIL --------------
	//-----------------------------------
	it('Validates "email" with undefined value', function() {
		const result = validator.validate('email');
		assert.strictEqual(result, true);
	});

	it('Validates "email" with null', function() {
		const result = validator.validate('email', null);
		assert.strictEqual(result, true);
	});

	it('Validates "email" with empty string', function() {
		const result = validator.validate('email', '');
		assert.strictEqual(result, true);
	});

	it('Validates "email" with invalid strings', function() {
		const invalidStrings = [
			' ',
			'  ',
			'something', 
			'someone@',
			'someone@something',
			'someone.something'
		];
		for (let idx=0; idx < invalidStrings.length; idx++) {
			const result = validator.validate('email', invalidStrings[idx]);
			assert.strictEqual(result, false, `The value "${invalidStrings[idx]}" should be an invalid email`);
		}
	});

	it('Validates "email" with valid strings', function() {
		const invalidStrings = [
			'someone@something.com',
			'someone@something.com.co',
			'john.doe@something.com',
			'john.doe@something.com.co',
			'john_doe@something.com'
		];
		for (let idx=0; idx < invalidStrings.length; idx++) {
			const result = validator.validate('email', invalidStrings[idx]);
			assert.strictEqual(result, true, `The value "${invalidStrings[idx]}" should be a valid email`);
		}
	});

	//-----------------------------------
	//--------------- URL ---------------
	//-----------------------------------
	it('Validates "url" with undefined value', function() {
		const result = validator.validate('url');
		assert.strictEqual(result, true);
	});

	it('Validates "url" with null', function() {
		const result = validator.validate('url', null);
		assert.strictEqual(result, true);
	});

	it('Validates "url" with empty string', function() {
		const result = validator.validate('url', '');
		assert.strictEqual(result, true);
	});

	it('Validates "url" with invalid strings', function() {
		const invalidStrings = [
			' ',
			'  ',
			'something', 
			'http', 
			'http://', 
			'http://www', 
			'wwww.something.com', 
			'something.com', 
			'com', 
			'.com', 
			'.com.co', 
			'com.co'
		];
		for (let idx=0; idx < invalidStrings.length; idx++) {
			const result = validator.validate('url', invalidStrings[idx]);
			assert.strictEqual(result, false, `The value "${invalidStrings[idx]}" should be an invalid url`);
		}
	});

	it('Validates "url" with valid strings', function() {
		const invalidStrings = [
			'http://google.com',
			'http://something.google.com',
			'http://something.google.com.co',
			'http://www.google.com',
			'http://www.google.com.co',
			'https://www.google.com', 
			'http://www.google.com/resource', 
			'http://www.google.com/resource/resource', 
			'http://www.google.com/', 
			'http://www.google.com?param=value', 
			'http://www.google.com?param=value&param=value', 
			'http://www.google.com/resource?param=value', 
			'http://www.google.com/resource/resource?param=value'
		];
		for (let idx=0; idx < invalidStrings.length; idx++) {
			const result = validator.validate('url', invalidStrings[idx]);
			assert.strictEqual(result, true, `The value "${invalidStrings[idx]}" should be a valid url`);
		}
	});

	//-----------------------------------
	//--------------- MIN ---------------
	//-----------------------------------
	it('Validates "min" with non numeric threshold', function() {
		assert.throws(() => {
			validator.validate('min=xxx', 333);
		}, {
			message: /erebus.validator.range.unparseable/
		});
	});

	it('Validates "min" with undefined value', function() {
		const result = validator.validate('min=1');
		assert.strictEqual(result, true);
	});

	it('Validates "min" with null value', function() {
		const result = validator.validate('min=1', null);
		assert.strictEqual(result, true);
	});

	it('Validates "min" with empty string', function() {
		const result = validator.validate('min=1', '');
		assert.strictEqual(result, true);
	});

	it('Validates "min" with float threshold and float value under the threshold', function() {
		const result = validator.validate('min=2.5', 2.45);
		assert.strictEqual(result, false);
	});

	it('Validates "min" with float threshold and integer value under the threshold', function() {
		const result = validator.validate('min=2.5', 2);
		assert.strictEqual(result, false);
	});

	it('Validates "min" with float threshold and float value on the threshold', function() {
		const result = validator.validate('min=2.5', 2.5);
		assert.strictEqual(result, true);
	});

	it('Validates "min" with float threshold and integer value on the threshold', function() {
		const result = validator.validate('min=2.5', 3);
		assert.strictEqual(result, true);
	});

	it('Validates "min" with integer threshold and a string value under the threshold', function() {
		const result = validator.validate('min=12', 'something');
		assert.strictEqual(result, false);
	});

	it('Validates "min" with integer threshold and a string value in the threshold', function() {
		const result = validator.validate('min=9', 'something');
		assert.strictEqual(result, true);
	});

	it('Validates "min" with @today and a Date value under the threshold', function() {
		const result = validator.validate('min=@today', new Date(2020, 1, 1));
		assert.strictEqual(result, false);
	});

	it('Validates "min" with @today and a Date value in the threshold', function() {
		var todayDate = new Date();
		todayDate.setHours(0);
		todayDate.setMinutes(0);
		todayDate.setSeconds(0);
		todayDate.setMilliseconds(0);
		const result = validator.validate('min=@today', todayDate);
		assert.strictEqual(result, true);
	});

	it('Validates "min" with @now and a Date value under the threshold', function() {
		var pastDate = new Date();
		pastDate.setSeconds(pastDate.getSeconds() - 1);
		const result = validator.validate('min=@now', pastDate);
		assert.strictEqual(result, false);
	});

	it('Validates "min" with @now and a Date value in the threshold', function() {
		var futureDate = new Date();
		futureDate.setMinutes(futureDate.getMinutes() + 1);
		const result = validator.validate('min=@now', futureDate);
		assert.strictEqual(result, true);
	});

	//-----------------------------------
	//--------------- MAX ---------------
	//-----------------------------------
	it('Validates "max" with non numeric threshold', function() {
		assert.throws(() => {
			validator.validate('max=xxx', 333);
		}, {
			message: /erebus.validator.range.unparseable/
		});
	});

	it('Validates "max" with undefined value', function() {
		const result = validator.validate('max=1');
		assert.strictEqual(result, true);
	});

	it('Validates "max" with null value', function() {
		const result = validator.validate('max=1', null);
		assert.strictEqual(result, true);
	});

	it('Validates "max" with empty string', function() {
		const result = validator.validate('max=1', '');
		assert.strictEqual(result, true);
	});

	it('Validates "max" with float threshold and float value over the threshold', function() {
		const result = validator.validate('max=2.5', 2.55);
		assert.strictEqual(result, false);
	});

	it('Validates "max" with float threshold and integer value over the threshold', function() {
		const result = validator.validate('max=2.5', 3);
		assert.strictEqual(result, false);
	});

	it('Validates "max" with float threshold and float value on the threshold', function() {
		const result = validator.validate('max=2.5', 2.5);
		assert.strictEqual(result, true);
	});

	it('Validates "max" with float threshold and integer value on the threshold', function() {
		const result = validator.validate('max=2.5', 2);
		assert.strictEqual(result, true);
	});

	it('Validates "max" with integer threshold and a string value over the threshold', function() {
		const result = validator.validate('max=6', 'something');
		assert.strictEqual(result, false);
	});

	it('Validates "max" with integer threshold and a string value in the threshold', function() {
		const result = validator.validate('max=9', 'something');
		assert.strictEqual(result, true);
	});

	it('Validates "max" with @today and a Date value over the threshold', function() {
		var futureDate = new Date();
		futureDate.setDate(futureDate.getDate() + 1);
		futureDate.setHours(0);
		futureDate.setMinutes(0);
		futureDate.setSeconds(0);
		futureDate.setMilliseconds(0);
		const result = validator.validate('max=@today', futureDate);
		assert.strictEqual(result, false);
	});

	it('Validates "max" with @today and a Date value in the threshold', function() {
		var todayDate = new Date();
		//todayDate.setHours(23);
		//todayDate.setMinutes(59);
		//todayDate.setSeconds(59);
		//todayDate.setMilliseconds(0);
		const result = validator.validate('max=@today', todayDate);
		assert.strictEqual(result, true);
	});

	it('Validates "max" with @now and a Date value over the threshold', function() {
		var futureDate = new Date();
		futureDate.setMinutes(futureDate.getMinutes() + 1);
		const result = validator.validate('max=@now', futureDate);
		assert.strictEqual(result, false);
	});

	it('Validates "max" with @now and a Date value in the threshold', function() {
		var pastDate = new Date();
		pastDate.setMinutes(pastDate.getMinutes() - 1);
		const result = validator.validate('max=@now', pastDate);
		assert.strictEqual(result, true);
	});
});
