import test from 'node:test';
import assert from 'node:assert/strict';
import {destinationHref, guideHref, isUuid, storyHref, trekHref} from '../src/lib/links.ts';

const id = '4632d7df-d603-4675-a801-dfdc71983122';

test('only real UUIDs are accepted as content ids', () => {
  assert.equal(isUuid(id), true);
  assert.equal(isUuid(id.toUpperCase()), true);
  for (const bad of ['pach-pokhari', '', '4632d7df-d603-4675-a801', `${id}x`, `${id}/../admin`, 42, undefined, [id]]) {
    assert.equal(isUuid(bad), false, String(bad));
  }
});

test('content opens by id in a query parameter', () => {
  assert.equal(trekHref(id), `/treks?id=${id}`);
  assert.equal(trekHref(id, {departure: 'd1'}), `/treks?id=${id}&departure=d1`);
  assert.equal(trekHref(id, {departure: undefined}), `/treks?id=${id}`);
  assert.equal(guideHref(id), `/guides?id=${id}`);
  assert.equal(storyHref(id), `/blog?id=${id}`);
  assert.equal(destinationHref(id), `/destinations?id=${id}`);
});

test('Nepal as a whole keeps its own collection page', () => {
  assert.equal(destinationHref(id, 'nepal'), '/destinations/nepal');
  assert.equal(destinationHref(id, 'bhutan'), `/destinations?id=${id}`);
});
