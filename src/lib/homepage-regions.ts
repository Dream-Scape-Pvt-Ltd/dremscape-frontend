import {trekkingRegions} from './navigation.ts';

const photographs:Record<string,string>={
  everest:'222-78-imgNepalEverestBaseCampAndAmaDablamPeak',
  langtang:'222-78-imgManasluAndLangtangSacredValleyPeaksNepal',
  annapurna:'222-78-imgAnnapurnaRangeAndHighGlacialLakesNepal',
  manaslu:'151-31-imgManasluAndTsumValleySanctuary',
  mustang:'/images/treks/dhakmar-village.jpg',
  'off-the-beaten':'151-31-imgDolpoAndSheyPhoksundoDeepWilderness',
};

export const homepageRegions=trekkingRegions.map(region=>({
  ...region,
  image:photographs[region.value],
  href:`/treks?kind=treks&region=${region.value}`,
}));
