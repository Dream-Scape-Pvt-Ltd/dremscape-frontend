import test from 'node:test';
import assert from 'node:assert/strict';
import {getLatestYouTubeVideo} from '../src/lib/youtube-latest.ts';

const settings={featured_video_title:'A journey through Nepal',featured_video_description:'A preview from the trail.',featured_video_thumbnail:'/images/trek-memories/home-slide-3.jpg'};

test('latest film configuration, eligibility and service failures',async()=>{
 const originalFetch=globalThis.fetch;
 try {
 const fallback=await getLatestYouTubeVideo(settings,{ });assert.equal(fallback.status,'preview');assert.equal(fallback.channelUrl,'https://www.youtube.com/@Dreamscapetreks');
 assert.equal((await getLatestYouTubeVideo(settings,{YOUTUBE_CHANNEL_ID:'not-a-channel-id'})).status,'preview');
 const env={YOUTUBE_CHANNEL_ID:'UCabcdefghijklmnopqrstuv',YOUTUBE_API_KEY:'unit-test-key'};
 const requests:string[]=[];
 globalThis.fetch=async(input)=>{const url=new URL(String(input));requests.push(url.pathname);assert.equal(url.hostname,'www.googleapis.com');
 if(url.pathname.endsWith('/channels'))return Response.json({items:[{contentDetails:{relatedPlaylists:{uploads:'uploads'}}}]});
 if(url.pathname.endsWith('/playlistItems'))return Response.json({items:[{contentDetails:{videoId:'aaaaaaaaaaa'}},{contentDetails:{videoId:'bbbbbbbbbbb'}}]});
 return Response.json({items:[{id:'aaaaaaaaaaa',status:{embeddable:false,privacyStatus:'public'},snippet:{publishedAt:'2026-09-22',liveBroadcastContent:'none',title:'Blocked'}},{id:'bbbbbbbbbbb',status:{embeddable:true,privacyStatus:'public'},snippet:{publishedAt:'2026-09-21',liveBroadcastContent:'none',title:'Latest playable'}}]});};
 const result=await getLatestYouTubeVideo(settings,env,globalThis.fetch as never);assert.equal(result.videoId,'bbbbbbbbbbb');assert.equal(result.status,'ready');assert.equal(requests.length,3);assert(!JSON.stringify(result).includes('unit-test-key'));
 assert.equal((await getLatestYouTubeVideo(settings,env,async()=>{throw new Error('offline');})).status,'preview');
 }finally{globalThis.fetch=originalFetch;}
});
test('a channel saved in admin settings replaces the env channel',async()=>{
 const env={YOUTUBE_CHANNEL_ID:'UCabcdefghijklmnopqrstuv'};
 assert.equal((await getLatestYouTubeVideo({...settings,youtube_channel:'@HimalayaFilms'},env)).channelUrl,'https://www.youtube.com/@HimalayaFilms');
 assert.equal((await getLatestYouTubeVideo({...settings,youtube_channel:'UCzyxwvutsrqponmlkjihgfe'},env)).channelUrl,'https://www.youtube.com/channel/UCzyxwvutsrqponmlkjihgfe');
 assert.equal((await getLatestYouTubeVideo({...settings,youtube_channel:''},env)).channelUrl,'https://www.youtube.com/channel/UCabcdefghijklmnopqrstuv');
});
