import test from 'node:test';
import assert from 'node:assert/strict';
import {ROUTES} from '../src/constants/routes.ts';

test('Routes constants build id-based detail and booking links', () => {
  assert.equal(ROUTES.HOME, '/');
  const trekId = '4632d7df-d603-4675-a801-dfdc71983122';
  assert.equal(ROUTES.TREK_DETAIL(trekId), `/treks?id=${trekId}`);
  assert.equal(ROUTES.BOOKING(trekId, 'dep-123'), `/treks?id=${trekId}&departure=dep-123#book`);
  assert.equal(ROUTES.BOOKING('everest', 'dep-123'), '/treks/everest?departure=dep-123#book');
});
