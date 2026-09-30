import type {Trip} from './catalog.ts';
import {zoneForTrip} from './nepal-zones.ts';
/** Breadcrumbs return to the same public region collections as the menu. */
export function regionCollectionHref(trip:Pick<Trip,'slug'|'title'|'destination_slug'|'destination_name'>):string{
  const zone=zoneForTrip(trip);
  return zone?`/treks?kind=treks&zone=${zone}`:'/treks';
}
