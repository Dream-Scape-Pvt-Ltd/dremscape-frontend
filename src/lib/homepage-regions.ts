import {nepalZones} from './nepal-zones';

export const homepageRegions=nepalZones.map(region=>({
  value:region.value,
  label:region.label,
  description:region.intro,
  highlights:region.highlights.join(' · '),
  image:region.image,
  href:`/treks?kind=treks&zone=${region.value}`,
}));
