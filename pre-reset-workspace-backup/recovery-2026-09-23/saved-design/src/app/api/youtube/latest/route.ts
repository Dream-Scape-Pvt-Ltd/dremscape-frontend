import {getSiteSettings} from '@/lib/site-settings';
// Credentials stay on the server; the player receives only public video details.
export async function GET() {
  const settings=await getSiteSettings();
  const preview={status:'preview',videoTitle:settings.featured_video_title,videoDescription:settings.featured_video_description,thumbnail:settings.featured_video_thumbnail};
  const channelId=process.env.YOUTUBE_CHANNEL_ID?.trim();
  const handle=(process.env.YOUTUBE_CHANNEL_HANDLE || '@Dreamscapetreks').trim();
  const key=process.env.YOUTUBE_API_KEY;
  const validChannelId=channelId&&/^UC[\w-]{22}$/.test(channelId)?channelId:undefined;
  const validHandle=/^@[\w.-]{3,30}$/.test(handle)?handle:'@Dreamscapetreks';
  const channelUrl=validChannelId?`https://www.youtube.com/channel/${validChannelId}`:`https://www.youtube.com/${validHandle}`;
  if(!key)return Response.json({...preview,channelUrl},{headers:{'Cache-Control':'no-store'}});
  try {
    async function youtube(resource:string,params:Record<string,string>) {
      const url=new URL(`https://www.googleapis.com/youtube/v3/${resource}`);
      url.search=new URLSearchParams({...params,key:key!}).toString();
      const response=await fetch(url,{next:{revalidate:300},signal:AbortSignal.timeout(8000)});
      if(!response.ok)throw new Error('Video service unavailable');
      return response.json();
    }
    const channel=await youtube('channels',{part:'contentDetails',...(validChannelId?{id:validChannelId}:{forHandle:validHandle})});
    const uploads=channel.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if(typeof uploads!=='string')throw new Error('No uploads');
    const playlist=await youtube('playlistItems',{part:'contentDetails',playlistId:uploads,maxResults:'10'});
    const ids=(playlist.items||[]).map((item:{contentDetails?:{videoId?:string}})=>item.contentDetails?.videoId).filter((id:unknown)=>typeof id==='string'&&/^[\w-]{11}$/.test(id)).join(',');
    if(!ids)throw new Error('No videos');
    const videos=await youtube('videos',{part:'snippet,status',id:ids});
    const eligible=(videos.items||[]).filter((video:{status?:{embeddable?:boolean;privacyStatus?:string};snippet?:{liveBroadcastContent?:string}})=>video.status?.embeddable&&video.status.privacyStatus==='public'&&video.snippet?.liveBroadcastContent==='none');
    eligible.sort((a:{snippet:{publishedAt:string}},b:{snippet:{publishedAt:string}})=>Date.parse(b.snippet.publishedAt)-Date.parse(a.snippet.publishedAt));
    const latest=eligible[0];
    if(!latest)return Response.json({...preview,channelUrl},{headers:{'Cache-Control':'no-store'}});
    return Response.json({status:'ready',videoId:latest.id,title:latest.snippet.title,channelUrl},{headers:{'Cache-Control':'no-store'}});
  } catch {
    return Response.json({...preview,channelUrl},{headers:{'Cache-Control':'no-store'}});
  }
}
