import test from 'node:test';
import assert from 'node:assert/strict';
import {buildQueryString, parseApiError} from '../src/utils/api-helpers.ts';
import {tokenStorage} from '../src/utils/token-storage.ts';
import {ApiClientError, ApiClient} from '../src/services/api-client.ts';
import {API_ENDPOINTS} from '../src/constants/api-endpoints.ts';
import {ROUTES} from '../src/constants/routes.ts';
import {authService} from '../src/services/auth.service.ts';
import {tripsService} from '../src/services/trips.service.ts';
import {bookingsService} from '../src/services/bookings.service.ts';
import {inquiriesService} from '../src/services/inquiries.service.ts';
import {destinationsService} from '../src/services/destinations.service.ts';
import {reviewsService} from '../src/services/reviews.service.ts';

test('buildQueryString formats query params and strips empty values', () => {
  assert.equal(buildQueryString({}), '');
  assert.equal(buildQueryString(undefined), '');
  assert.equal(
    buildQueryString({page: 1, difficulty: 'MODERATE', search: 'Everest'}),
    '?page=1&difficulty=MODERATE&search=Everest'
  );
  assert.equal(
    buildQueryString({page: 2, empty: '', nil: null, undef: undefined}),
    '?page=2'
  );
  assert.equal(
    buildQueryString({tags: ['trekking', 'nepal']}),
    '?tags=trekking&tags=nepal'
  );
});

test('parseApiError handles various error shapes', () => {
  const drfError = {
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Invalid input.',
      details: {email: ['Email already exists.']},
    },
  };
  const parsedDrf = parseApiError(drfError);
  assert.equal(parsedDrf.code, 'VALIDATION_ERROR');
  assert.equal(parsedDrf.message, 'Invalid input.');
  assert.deepEqual(parsedDrf.details, {email: ['Email already exists.']});

  const parsedStr = parseApiError('Network request failed');
  assert.equal(parsedStr.message, 'Network request failed');

  const clientErr = new ApiClientError({
    message: 'Departure full',
    code: 'SEATS_UNAVAILABLE',
    status: 409,
    details: {seats: ['0 remaining']},
  });
  const parsedClient = parseApiError(clientErr);
  assert.equal(parsedClient.message, 'Departure full');
  assert.equal(parsedClient.code, 'SEATS_UNAVAILABLE');
  assert.equal(parsedClient.status, 409);
  assert.equal(clientErr.isUnauthorized, false);
  assert.equal(clientErr.isNotFound, false);
  assert.deepEqual(clientErr.getFieldErrors(), {seats: '0 remaining'});
});

test('API endpoints and Routes constants match expectations', () => {
  assert.equal(API_ENDPOINTS.CLIENT.AUTH.LOGIN, '/api/auth/login');
  assert.equal(API_ENDPOINTS.CLIENT.TRIPS.DETAIL('everest-base-camp'), '/api/trips/everest-base-camp');
  assert.equal(API_ENDPOINTS.BACKEND.AUTH.LOGIN, 'auth/login/');
  assert.equal(API_ENDPOINTS.BACKEND.TRIPS.DETAIL('annapurna-circuit'), 'trips/annapurna-circuit/');

  assert.equal(ROUTES.HOME, '/');
  assert.equal(ROUTES.TREK_DETAIL('everest'), '/treks/everest');
  assert.equal(ROUTES.BOOKING('everest', 'dep-123'), '/booking?trek=everest&departure=dep-123');
});

test('ApiClient normalizes trailing slashes and unrolls Django envelopes', async () => {
  let capturedUrl = '';
  let capturedHeaders: Record<string, string> = {};

  const mockFetch = async (url: string | URL | Request, init?: RequestInit) => {
    capturedUrl = String(url);
    capturedHeaders = (init?.headers || {}) as Record<string, string>;
    return new Response(
      JSON.stringify({
        success: true,
        data: {id: '123', title: 'Everest Circuit'},
        message: 'Resource retrieved',
      }),
      {status: 200, headers: {'Content-Type': 'application/json'}}
    );
  };

  const originalFetch = globalThis.fetch;
  globalThis.fetch = mockFetch as unknown as typeof fetch;

  try {
    const client = new ApiClient('http://127.0.0.1:8000/api/v1');
    const result = await client.get<{id: string; title: string}>('trips/everest', {
      token: 'test-mock-jwt-token',
    });

    assert.deepEqual(result, {id: '123', title: 'Everest Circuit'});
    // Verifies trailing slash was automatically appended
    assert.equal(capturedUrl, 'http://127.0.0.1:8000/api/v1/trips/everest/');
    // Verifies Authorization header was injected
    assert.equal(capturedHeaders.Authorization, 'Bearer test-mock-jwt-token');
  } finally {
    globalThis.fetch = originalFetch;
  }
});
