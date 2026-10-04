// Content photos (treks, blog, team, trek-memories) live in Backblaze B2 and are
// served through the backend's /media/site/… redirect. Plain <img> tags can keep
// using /images/<folder>/… (next.config rewrites it), but next/image can't
// optimize a local path that turns into a redirect, so it needs the absolute URL.
const backendOrigin = (() => {
  try { return new URL(process.env.NEXT_PUBLIC_API_URL || '').origin; } catch { return ''; }
})();

const SITE_IMAGE = /^\/images\/(treks|blog|team|trek-memories)\/(.+)$/;

export function siteImage(src: string): string {
  // The supplied trek archive is packaged with the frontend, so its photos
  // must not depend on a running backend or a signed media redirect.
  if (src.startsWith('/images/trek-memories/')) return src;
  const match = backendOrigin ? SITE_IMAGE.exec(src) : null;
  return match ? `${backendOrigin}/media/site/${match[1]}/${match[2]}` : src;
}
