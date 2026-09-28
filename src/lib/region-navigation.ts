import type {Trip} from './catalog.ts';
/** Breadcrumbs return to the same public region collections as the menu. */
export function regionCollectionHref(trip:Pick<Trip,'slug'|'title'|'destination_slug'|'destination_name'>):string{
  const route=`${trip.slug} ${trip.title}`.toLowerCase();
  const place=`${route} ${trip.destination_slug} ${trip.destination_name}`.toLowerCase();
  const region=/mustang|lo.manthang/.test(route)?'mustang':/everest|khumbu|gokyo/.test(place)?'everest':/langtang/.test(place)?'langtang':/manaslu|tsum/.test(place)?'manaslu':/annapurna|tilicho/.test(place)?'annapurna':/dolpo|kanchen|makalu|rolwaling/.test(place)?'off-the-beaten':'';
  return region?`/treks?kind=treks&region=${region}`:'/treks';
}
