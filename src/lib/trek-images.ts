/**
 * Region photo used when a trek has no cover image of its own, so trek pages
 * and cards never render an empty picture.
 */
export const FALLBACK_PHOTO='/images/trek-memories/mountain-amphitheatre.jpg';
export function fallbackTrekImage(slug?: string, destinationSlug?: string): string {
  const s = `${slug || ''} ${destinationSlug || ''}`.toLowerCase();
  if (/everest|khumbu|gokyo|cho-?la/.test(s)) return '/images/222-242-imgEverestBaseCampChoLaPassTrekkingRoute.png';
  if (/annapurna|tilicho|poon/.test(s)) return '/images/222-242-imgAnnapurnaCircuitAndTilichoLakeHighGlacialLake.png';
  if (/manaslu|larkya|tsum|langtang/.test(s)) return '/images/222-242-imgManasluCircuitLarkyaPassRemoteHimalayas.png';
  if (/mustang|lo-manthang/.test(s)) return '/images/222-242-imgUpperMustangLoManthangWalledCityRedCliffs.png';
  if (/dolpo|phoksundo/.test(s)) return '/images/151-31-imgDolpoAndSheyPhoksundoDeepWilderness.png';
  return '/images/151-31-imgNepalHimalayanRangeWithAmaDablam.png';
}
