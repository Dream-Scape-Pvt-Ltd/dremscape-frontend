import {getSiteSettings} from '@/lib/site-settings';
import {getLatestYouTubeVideo} from '@/lib/youtube-latest';
// Credentials stay on the server; the player receives only public video details.
export async function GET() {
  const settings=await getSiteSettings();
  const result=await getLatestYouTubeVideo(settings);
  return Response.json(result,{headers:{'Cache-Control':'no-store'}});
}
