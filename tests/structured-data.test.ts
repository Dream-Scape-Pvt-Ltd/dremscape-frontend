import test from 'node:test';
import assert from 'node:assert/strict';
import {serializeJsonLd} from '../src/lib/structured-data.ts';
test('CMS structured data cannot terminate its script element',()=>{
 const value={headline:'</script><script>alert(1)</script>\u2028'};
 const serialized=serializeJsonLd(value);
 assert.equal(serialized.includes('<'),false);
 assert.equal(serialized.includes('\u2028'),false);
 assert.deepEqual(JSON.parse(serialized),value);
});
