import test from 'node:test';
import assert from 'node:assert/strict';
import {editorialTagOptions,normalizeEditorialTags} from '../src/lib/editorial-tags.ts';
import {previewTrips} from '../src/lib/catalog.ts';

test('secondary classification has stable unique slugs and does not replace geography',()=>{
  assert.equal(editorialTagOptions.length,11);
  assert.equal(new Set(editorialTagOptions.map(tag=>tag.value)).size,editorialTagOptions.length);
  const mustang=previewTrips.find(trip=>trip.slug==='upper-mustang')!;
  assert.equal(mustang.destination_slug,'annapurna');
  assert.deepEqual(mustang.editorial_tags,['restricted-area','monsoon-rainshadow','cultural']);
  assert.deepEqual(normalizeEditorialTags(['circuit','unknown','circuit',4]),['circuit']);
});
