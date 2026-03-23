import { getStrapiItems } from './utils';

export function getCurrentSeason(date = new Date()) {
  const month = date.getMonth();

  if (month === 11 || month === 0 || month === 1) return 'winter';
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  return 'fall';
}

export function getHomepageHeaderImages(homeData, date = new Date()) {
  const season = getCurrentSeason(date);
  const seasonalField = `headerimages_${season}`;
  const seasonalImages = getStrapiItems(homeData?.[seasonalField]);

  if (seasonalImages.length > 0) {
    return seasonalImages;
  }

  return getStrapiItems(homeData?.headerimages);
}
