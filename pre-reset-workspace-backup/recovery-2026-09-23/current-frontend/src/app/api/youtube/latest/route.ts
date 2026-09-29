// Credentials stay on the server; the player receives only public video details.
export async function GET() {
  const channelId=process.env.YOUTUBE_CHANNEL_ID?.trim();
  const handle=(process.env.YOUTUBE_CHANNEL_HANDLE || '@Dreamscapetreks').trim();
  const key=process.env.YOUTUBE_API_KEY;
  if(channelId&&!/^UC[\w-]{22}$/.test(channelId))return Response.json({status:'unconfigured'},{headers:{'Cache-Control':'no-store'}});
  if(!channelId&&!/^@[\w.-]{3,30}$/.test(handle))return Response.json({status:'unconfigured'},{headers:{'Cache-Control':'no-store'}});
  const channelUrl=channelId?`https://www.youtube.com/channel/${channelId}`:`https://www.youtube.com/${handle}`;
  if(!key)return Response.json({status:'unavailable',channelUrl},{headers:{'Cache-Control':'no-store'}});
  try {
    async function youtube(resource:string,params:Record<string,string>) {
      const url=new URL(`https://www.googleapis.com/youtube/v3/${resource}`);
      url.search=new URLSearchParams({...params,key:key!}).toString();
      const response=await fetch(url,{next:{revalidate:300},signal:AbortSignal.timeout(8000)});
      if(!response.ok)throw new Error('Video service unavailable');
      return response.json();
    }
    const channel=await youtube('channels',{part:'contentDetails',...(channelId?{id:channelId}:{forHandle:handle})});
    const uploads=channel.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if(typeof uploads!=='string')throw new Error('No uploads');
    const playlist=await youtube('playlistItems',{part:'contentDetails',playlistId:uploads,maxResults:'10'});
    const ids=(playlist.items||[]).map((item:{contentDetails?:{videoId?:string}})=>item.contentDetails?.videoId).filter((id:unknown)=>typeof id==='string'&&/^[\w-]{11}$/.test(id)).join(',');
    if(!ids)throw new Error('No videos');
    const videos=await youtube('videos',{part:'snippet,status',id:ids});
    const eligible=(videos.items||[]).filter((video:{status?:{embeddable?:boolean;privacyStatus?:string};snippet?:{liveBroadcastContent?:string}})=>video.status?.embeddable&&video.status.privacyStatus==='public'&&video.snippet?.liveBroadcastContent==='none');
    eligible.sort((a:{snippet:{publishedAt:string}},b:{snippet:{publishedAt:string}})=>Date.parse(b.snippet.publishedAt)-Date.parse(a.snippet.publishedAt));
    const latest=eligible[0];
    if(!latest)throw new Error('No playable videos');
    return Response.json({status:'ready',videoId:latest.id,title:latest.snippet.title,channelUrl},{headers:{'Cache-Control':'no-store'}});
  } catch {
    return Response.json({status:'unavailable',channelUrl},{headers:{'Cache-Control':'no-store'}});
  }
}
