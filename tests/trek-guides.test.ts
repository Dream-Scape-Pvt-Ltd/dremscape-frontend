import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';

// Resolve the extensionless imports Next's bundler normally handles.
registerHooks({resolve(specifier, context, next) {
  if (specifier === 'next/server') return next('next/server.js', context);
  if (/^\.\.?\//.test(specifier) && !/\.\w+$/.test(specifier) && context.parentURL?.endsWith('.ts')) return next(`${specifier}.ts`, context);
  return next(specifier, context);
}});

const {adaptSummary, adaptGuide, photoUrl} = await import('../src/lib/trek-guides.ts');
const {trekGuideWritePayload} = await import('../src/lib/admin.ts');
const {BackendError} = await import('../src/lib/backend.ts');

const ID = '5c8aa2f8-9b15-4f5f-a842-a722747daf6d';
const REGION = '0eba86c7-e013-4985-a889-6280fe218961';
const TREK = '4632d7df-d603-4675-a801-dfdc71983122';

test('a guide with only a name keeps every other field empty', () => {
  assert.deepEqual(adaptSummary({id: ID, slug: 'pemba', name: ' Pemba Sherpa '}), {id: ID, slug: 'pemba', name: 'Pemba Sherpa', role: '', photo: undefined, yearsExperience: null, languages: [], regions: []});
});

test('missing or non-UUID ids, bad slugs, missing names and malformed lists are rejected or dropped', () => {
  assert.throws(() => adaptSummary({slug: 'x', name: 'X'}), BackendError);
  assert.throws(() => adaptSummary({id: 'not-a-uuid', slug: 'x', name: 'X'}), BackendError);
  assert.throws(() => adaptSummary({id: ID, slug: '../admin', name: 'X'}), BackendError);
  assert.throws(() => adaptSummary({id: ID, slug: 'x', name: '  '}), BackendError);
  const guide = adaptSummary({id: ID, slug: 'x', name: 'X', languages: ['English', 3, ' ', 'Nepali'], regions: [{id: REGION, slug: 'everest', name: 'Everest'}, {id: 'bad', slug: 'bad', name: 'Bad'}], years_experience: '12'});
  assert.deepEqual(guide.languages, ['English', 'Nepali']);
  assert.deepEqual(guide.regions, [{id: REGION, slug: 'everest', name: 'Everest'}]);
  assert.equal(guide.yearsExperience, null);
});

test('photos must be site-relative or http(s); dev hosts are stripped', () => {
  assert.equal(photoUrl('http://127.0.0.1:8000/media/media/p.jpg'), '/media/media/p.jpg');
  assert.equal(photoUrl('https://cdn.example.com/p.jpg'), 'https://cdn.example.com/p.jpg');
  assert.equal(photoUrl('javascript:alert(1)'), undefined);
  assert.equal(photoUrl('//evil.example/p.jpg'), undefined);
});

test('treks a guide leads become trek cards with their ids, skipping malformed rows', () => {
  const guide = adaptGuide({id: ID, slug: 'x', name: 'X', bio: 'First.\n\nSecond.', treks_led: [
    {id: TREK, destination_id: REGION, slug: 'ebc', title: 'Everest Base Camp', duration_days: 14, difficulty_grade: 'DIFFICULT', starting_price_usd: '2500.00', altitude_max_meters: 5364, hero_image_url: '', destination_name: 'Nepal Himalayas', destination_slug: 'nepal-himalayas', category_name: 'Trekking', category_slug: 'trekking'},
    {id: 'not-a-uuid', slug: 'bad', title: 'Bad'} as never,
  ]});
  assert.equal(guide.bio, 'First.\n\nSecond.');
  assert.deepEqual(guide.treks.map(t => t.id), [TREK]);
  assert.equal(guide.treks[0].destination_id, REGION);
  assert.equal(guide.treks[0].image, undefined);
});

test('the admin write payload keeps only guide fields', () => {
  assert.deepEqual(trekGuideWritePayload({name: 'X', slug: 'x', languages: ['English'], role: 'Guide', id: 'forged', created_at: 'now', is_staff: true}), {slug: 'x', name: 'X', role: 'Guide', languages: ['English']});
  assert.throws(() => trekGuideWritePayload({regions: 'everest'}), BackendError);
});
