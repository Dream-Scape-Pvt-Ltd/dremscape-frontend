import test from 'node:test';
import assert from 'node:assert/strict';
import {BLOCK_MS,normaliseMapMode,readBlocked,resolveProvider,writeBlocked} from '../src/lib/map-provider.ts';

const memory=()=>{const data=new Map<string,string>();return {getItem:(k:string)=>data.get(k)??null,setItem:(k:string,v:string)=>{data.set(k,v);},removeItem:(k:string)=>{data.delete(k);},data};};

test('a Google failure blocks Google until the block expires',()=>{
  const store=memory();
  assert.equal(readBlocked(store,1000),false);
  writeBlocked(store,1000);
  assert.equal(readBlocked(store,1000+BLOCK_MS-1),true);
  assert.equal(readBlocked(store,1000+BLOCK_MS),false);
  assert.equal(store.data.size,0,'expired flag is cleared');
});

test('unavailable or throwing storage never blocks Google',()=>{
  assert.equal(readBlocked(null),false);
  const broken={getItem:()=>{throw new Error('denied');},setItem:()=>{throw new Error('denied');},removeItem:()=>{}};
  assert.doesNotThrow(()=>writeBlocked(broken));
  assert.equal(readBlocked(broken),false);
});

test('provider resolution follows the admin mode, key and block',()=>{
  assert.equal(resolveProvider({mode:'auto',hasKey:true,blocked:false}),'google');
  assert.equal(resolveProvider({mode:'auto',hasKey:true,blocked:true}),'free');
  assert.equal(resolveProvider({mode:'auto',hasKey:false,blocked:false}),'free');
  assert.equal(resolveProvider({mode:'free',hasKey:true,blocked:false}),'free');
  assert.equal(resolveProvider({mode:'google',hasKey:true,blocked:true}),'google');
  assert.equal(resolveProvider({mode:'google',hasKey:false,blocked:false}),'free');
});

test('unknown saved modes fall back to automatic',()=>{
  assert.equal(normaliseMapMode('free'),'free');
  assert.equal(normaliseMapMode(undefined),'auto');
  assert.equal(normaliseMapMode('bing'),'auto');
});
