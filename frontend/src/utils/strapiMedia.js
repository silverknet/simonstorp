import apiBaseUrl from '../config/apiBaseUrl';

export function getStrapiMedia(media) {
  return media?.data ?? media ?? null;
}

/**
 * Absolute URL for a Strapi media path (handles relative /uploads/... paths).
 */
export function absoluteMediaUrl(path) {
  if (!path) return '';
  if (typeof path !== 'string') return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return path.startsWith('/') ? `${apiBaseUrl}${path}` : `${apiBaseUrl}/${path}`;
}

/**
 * Best URL for on-page display (large → medium → small → original).
 * @param {object} attrs - flattened media object from Strapi
 */
export function getOptimizedDisplayUrl(attrs) {
  const media = getStrapiMedia(attrs);
  if (!media) return '';
  if (media.formats?.large?.url) return absoluteMediaUrl(media.formats.large.url);
  if (media.formats?.medium?.url) return absoluteMediaUrl(media.formats.medium.url);
  if (media.formats?.small?.url) return absoluteMediaUrl(media.formats.small.url);
  return absoluteMediaUrl(media.url);
}

export function getHeroDisplayUrl(attrs, { preferOriginal = false } = {}) {
  const media = getStrapiMedia(attrs);
  if (!media) return '';

  if (preferOriginal && media.url) return absoluteMediaUrl(media.url);
  if (media.formats?.large?.url) return absoluteMediaUrl(media.formats.large.url);
  if (media.formats?.medium?.url) return absoluteMediaUrl(media.formats.medium.url);
  if (media.formats?.small?.url) return absoluteMediaUrl(media.formats.small.url);
  return absoluteMediaUrl(media.url);
}

/**
 * Largest available file — Strapi stores the original at `url`; formats are smaller derivatives.
 * @param {object} attrs - flattened media object
 */
export function getFullSizeImageUrl(attrs) {
  const media = getStrapiMedia(attrs);
  if (!media) return '';
  return absoluteMediaUrl(media.url);
}
