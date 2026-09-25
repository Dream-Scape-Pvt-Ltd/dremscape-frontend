import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';

// Plain Node ESM cannot resolve the extensionless imports (`next/server`,
// `./backend`) that Next's bundler handles for us; point them at real files.
registerHooks({resolve(specifier, context, next) {
  if (specifier === 'next/server') return next('next/server.js', context);
  if (/^\.\.?\//.test(specifier) && !/\.\w+$/.test(specifier) && context.parentURL?.endsWith('.ts')) return next(`${specifier}.ts`, context);
  return next(specifier, context);
}});

const {backend, BackendError, apiError, assertSameOrigin, readInput, requiredText, emailInput} = await import('../src/lib/backend.ts');
const {projectInquiry, projectInquiries, projectDepartures, projectCustomer} = await import('../src/lib/admin.ts');

const realFetch = globalThis.fetch;
function stubFetch(respond: (url: string, init: RequestInit) => Response | Promise<Response>) {
  const calls: {url: string; init: RequestInit}[] = [];
  globalThis.fetch = (async (url: string, init: RequestInit) => { calls.push({url, init}); return respond(url, init); }) as typeof fetch;
  return calls;
}
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {status, headers: {'Content-Type': 'application/json'}});
async function rejectsWith(promise: Promise<unknown>, status: number, message?: RegExp) {
  await assert.rejects(promise, (error: unknown) => {
    assert.ok(error instanceof BackendError);
    assert.equal(error.status, status);
    if (message) assert.match(error.message, message);
    return true;
  });
}

test.beforeEach(() => { process.env.BACKEND_API_URL = 'http://django.test/api/v1/'; });
test.afterEach(() => { globalThis.fetch = realFetch; });

test('backend unwraps the Django envelope and joins the base URL once', async () => {
  const calls = stubFetch(() => json({success: true, data: {count: 1}}));
  assert.deepEqual(await backend('inquiries/crm/funnel/'), {count: 1});
  assert.equal(calls[0].url, 'http://django.test/api/v1/inquiries/crm/funnel/');
  assert.equal(new Headers(calls[0].init.headers).get('Content-Type'), 'application/json');
});

test('backend without a configured URL is a 503', async () => {
  delete process.env.BACKEND_API_URL;
  await rejectsWith(backend('inquiries/'), 503, /not configured/);
});

test('backend forwards 4xx messages and field errors from Django', async () => {
  stubFetch(() => json({error: {message: 'Not Found', details: {}}}, 404));
  await rejectsWith(backend('content/guides/'), 404, /^Not Found$/);

  stubFetch(() => json({error: {message: 'Invalid input.', details: {lost_reason: ['Required when closing.']}}}, 400));
  await assert.rejects(backend('inquiries/INQ-1/', {method: 'PATCH'}), (error: InstanceType<typeof BackendError>) => {
    assert.deepEqual(error.fields, {lost_reason: ['Required when closing.']});
    return true;
  });
});

test('backend hides 5xx details and warns that a POST may have been saved', async () => {
  stubFetch(() => json({error: {message: 'IntegrityError at crm_tasks'}}, 500));
  await rejectsWith(backend('inquiries/'), 500, /temporarily unavailable/);
  await rejectsWith(backend('inquiries/', {method: 'POST'}), 500, /could not confirm/);
});

test('backend treats network failures and odd bodies as 502', async () => {
  stubFetch(() => { throw new TypeError('fetch failed'); });
  await rejectsWith(backend('inquiries/'), 502, /temporarily unavailable/);

  stubFetch(() => json({success: false, error: {message: 'Nope'}}));
  await rejectsWith(backend('inquiries/'), 502, /Nope/);

  stubFetch(() => json({results: []}));
  await rejectsWith(backend('inquiries/'), 502, /unexpected response/);
});

test('backend accepts 204 from deletes', async () => {
  stubFetch(() => new Response(null, {status: 204}));
  assert.deepEqual(await backend('inquiries/tasks/1/', {method: 'DELETE'}), {});
});

test('apiError keeps known statuses and masks unknown errors', async () => {
  const known = apiError(new BackendError('Invalid inquiry reference.', 400));
  assert.equal(known.status, 400);
  assert.equal((await known.json()).error, 'Invalid inquiry reference.');
  assert.equal(known.headers.get('Cache-Control'), 'no-store');

  const unknown = apiError(new Error('secret stack detail'));
  assert.equal(unknown.status, 500);
  assert.equal((await unknown.json()).error, 'The request could not be completed.');
});

const post = (body: string, headers: Record<string, string> = {}) => new Request('http://127.0.0.1:3000/api/admin/inquiries/INQ-1/notes', {
  method: 'POST', body, headers: {host: '127.0.0.1:3000', 'content-type': 'application/json', ...headers},
});

test('staff writes are refused from another origin', () => {
  assert.doesNotThrow(() => assertSameOrigin(post('{}', {origin: 'http://127.0.0.1:3000'})));
  assert.doesNotThrow(() => assertSameOrigin(post('{}')));
  assert.throws(() => assertSameOrigin(post('{}', {origin: 'https://evil.example'})), (error: InstanceType<typeof BackendError>) => error.status === 403);
});

test('readInput rejects the wrong content type, oversized, malformed and non-object bodies', async () => {
  await rejectsWith(readInput(post('{}', {'content-type': 'text/plain'})), 415);
  await rejectsWith(readInput(post(JSON.stringify({body: 'x'.repeat(60001)}))), 413);
  await rejectsWith(readInput(post('{not json')), 400);
  await rejectsWith(readInput(post('[1,2]')), 400);
  assert.deepEqual(await readInput(post('{"title":"Call back"}')), {title: 'Call back'});
});

test('requiredText and emailInput validate and trim', () => {
  assert.equal(requiredText({title: '  Call back  '}, 'title'), 'Call back');
  assert.throws(() => requiredText({title: '   '}, 'title'), /Please check title/);
  assert.throws(() => requiredText({title: 'x'.repeat(256)}, 'title'), BackendError);
  assert.throws(() => requiredText({due_at: 5}, 'due_at'), /Please check due at/);
  assert.equal(emailInput({email: 'pemba@example.com'}), 'pemba@example.com');
  assert.throws(() => emailInput({email: 'not-an-email'}), /valid email/);
});

test('inquiry projections drop fields staff screens should not receive', () => {
  const inquiry = projectInquiry({inquiry_number: 'INQ-1', status: 'NEW', phone: '+977', customer: {id: 'c1'}, password_hash: 'x'});
  assert.deepEqual(Object.keys(inquiry).sort(), ['inquiry_number', 'phone', 'status']);

  const page = projectDepartures({count: 3, next: 'http://django/internal?page=2', results: [{id: 'd1', password_hash: 'x'}]});
  assert.deepEqual(page, {count: 3, next: 'http://django/internal?page=2', previous: null, results: [{id: 'd1'}]});

  const inquiries = projectInquiries({results: [{inquiry_number: 'INQ-1', status: 'NEW', sla_breached: true, customer: {id: 'c1'}}]});
  assert.deepEqual(inquiries.results, [{inquiry_number: 'INQ-1', status: 'NEW', sla_breached: true}]);
});

test('customer 360 filters nested inquiries and bookings', () => {
  const customer = projectCustomer({
    email: 'repeat@example.com', linked_user: 'u1', lifetime_value_usd: '1800.00',
    inquiries: [{inquiry_number: 'INQ-1', message: 'private message'}],
    bookings: [{booking_reference: 'DS-1', access_token: 'secret-token'}],
  });
  assert.equal('linked_user' in customer, false);
  assert.deepEqual(customer.inquiries, [{inquiry_number: 'INQ-1'}]);
  assert.deepEqual(customer.bookings, [{booking_reference: 'DS-1'}]);
});

test('malformed staff responses become a 502 instead of crashing the dashboard', () => {
  for (const bad of [null, 'oops', [1]]) assert.throws(() => projectInquiry(bad), BackendError);
  assert.throws(() => projectInquiries({results: 'nope'}), BackendError);
  assert.throws(() => projectCustomer([]), BackendError);
});
