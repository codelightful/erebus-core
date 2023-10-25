import { strict as assert } from 'assert';
await import('./setup/dom.mjs');
const Erebus = (await import('../src/index.mjs')).default;
import mock from 'xhr-mock';

describe('Http-GET', function() {
	before(function() {
		mock.default.setup();
	});

	after(function() {
		mock.default.teardown();
	});

	beforeEach(function() {
		mock.default.reset();
	});

	it('Contract', function() {
		assert.ok(Erebus.http);
		assert.ok(Erebus.http.get);
	});

	it('GET HTTP method without arguments should be rejected', function() {
		assert.rejects(Erebus.http.get());
	});

	it('GET HTTP method with null URL should be rejected', function() {
		assert.rejects(Erebus.http.get(null));
	});

	it('GET HTTP method with empty URL should be rejected', function() {
		assert.rejects(Erebus.http.get(''));
	});

	it('GET HTTP method with successful response', function(done) {
		mock.default.get('/success', function name(request, response) {
			return response.status(200).body('SomeTextResponse');
		});
		Erebus.http.get('/success').then(function(response) {
			assert.strictEqual(response, 'SomeTextResponse');
			done();
		}).catch(function(err) {
			done(err);
		});
	});

	it('GET HTTP method with successful JSON response', function(done) {
		mock.default.get('/success', function name(request, response) {
			return response
				.status(200)
				.header('Content-Type', 'application/json')
				.body('{"success": true, "data": { "name": "John Doe" }}');
		});
		Erebus.http.get('/success', { 
			headers: { 
				'Accept': 'application/json'
			}
		}).then(function(response) {
			assert.deepEqual(response, { success: true, data: { name: 'John Doe' } });
			done();
		}).catch(function(err) {
			done(err);
		});
	});

	it('GET HTTP validating request headers', function(done) {
		mock.default.get('/success', function name(request, response) {
			try {
				assert.strictEqual(request.header('MyRequestHeader'), 'HeaderValue');
			} catch(err) {
				done(err);
			}
			return response.status(200).body('');
		});
		Erebus.http.get('/success', { 
			headers: { 
				'MyRequestHeader': 'HeaderValue'
			}
		}).then(function() {
			done();
		});
	});

	it('GET HTTP validating response headers', function(done) {
		mock.default.get('/success', function name(request, response) {
			return response
				.status(200)
				.header('MyResponseHeader', 'HeaderValue')
				.body('');
		});
		Erebus.http.get('/success', {
			interceptor: function(response, headers) {
				try {
					assert.ok(headers);
					assert.equal(headers['myresponseheader'], 'HeaderValue');
				} catch(err) {
					done(err);
				}
			}
		}).then(function() {
			done();
		}).catch(function(err) {
			done(err);
		});
	});

	it('GET HTTP method with bad formatted JSON response', function() {
		mock.default.get('/badresponse', function name(request, response) {
			return response
				.status(200)
				.header('Content-Type', 'application/json')
				.body('{"badjson: true');
		});
		return Erebus.http.get('/badresponse').then(function(response) {
			assert.fail();
		}).catch(function(err) {
			assert.ok(err);
			assert.strictEqual(err.message, 'erebus.http.json_parse_error');
		});
	});

	it('GET HTTP method with failed response', async function() {
		mock.default.get('/failure', function name(request, response) {
			return response.status(400).body('SomeErrorText');
		});
		return Erebus.http.get('/failure').then(function(response) {
			assert.fail();
		}).catch(function(err) {
			assert.ok(err);
			assert.strictEqual(err.status, 400);
			assert.strictEqual(err.response, 'SomeErrorText');
		});
	});
});
