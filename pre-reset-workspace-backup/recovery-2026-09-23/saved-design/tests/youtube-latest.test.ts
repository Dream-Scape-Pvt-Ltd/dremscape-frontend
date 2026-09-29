import test from 'node:test';
import assert from 'node:assert/strict';
import {GET} from '../src/app/api/youtube/latest/route.ts';

test('latest film configuration, eligibility and service failures',async()=>{
 const oldId=process.env.YOUTUBE_CHANNEL_ID,oldKey=process.env.YOUTUBE_API_KEY,originalFetch=globalThis.fetch;
 try {
 delete process.env.YOUTUBE_CHANNEL_ID;delete process.env.YOUTUBE_API_KEY;
 const fallback=await (await GET()).json();assert.equal(fallback.status,'unavailable');assert.equal(fallback.channelUrl,'https://www.youtube.com/@Dreamscapetreks');
 process.env.YOUTUBE_CHANNEL_ID='UCabcdefghijklmnopqrstuv';
 assert.equal((await (await GET()).json()).status,'unavailable');
 process.env.YOUTUBE_API_KEY='unit-test-key';
 const requests:string[]=[];
 globalThis.fetch=async(input)=>{const url=new URL(String(input));requests.push(url.pathname);assert.equal(url.hostname,'www.googleapis.com');
 if(url.pathname.endsWith('/channels'))return Response.json({items:[{contentDetails:{relatedPlaylists:{uploads:'uploads'}}}]});
 if(url.pathname.endsWith('/playlistItems'))return Response.json({items:[{contentDetails:{videoId:'aaaaaaaaaaa'}},{contentDetails:{videoId:'bbbbbbbbbbb'}}]});
 return Response.json({items:[{id:'aaaaaaaaaaa',status:{embeddable:false,privacyStatus:'public'},snippet:{publishedAt:'2026-09-22',liveBroadcastContent:'none',title:'Blocked'}},{id:'bbbbbbbbbbb',status:{embeddable:true,privacyStatus:'public'},snippet:{publishedAt:'2026-09-21',liveBroadcastContent:'none',title:'Latest playable'}}]});};
 const result=await (await GET()).json();assert.equal(result.videoId,'bbbbbbbbbbb');assert.equal(result.status,'ready');assert.equal(requests.length,3);assert(!JSON.stringify(result).includes('unit-test-key'));
 globalThis.fetch=async()=>{throw new Error('offline');};assert.equal((await (await GET()).json()).status,'unavailable');
 }finally{globalThis.fetch=originalFetch;if(oldId===undefined)delete process.env.YOUTUBE_CHANNEL_ID;else process.env.YOUTUBE_CHANNEL_ID=oldId;if(oldKey===undefined)delete process.env.YOUTUBE_API_KEY;else process.env.YOUTUBE_API_KEY=oldKey;}
});
