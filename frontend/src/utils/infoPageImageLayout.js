/**
 * Infopage image layout: readable column width + minimal, intentional cropping.
 * r = width / height (CSS aspect-ratio is width / height).
 */

/** Taller than ~1:1.7 portrait → frame at 1:1.7 with light crop (was e.g. 1:2) */
export const PORTRAIT_FRAME_W_OVER_H = 1 / 1.7;

/** Very wide pano → cap frame so the column doesn’t become a hairline */
export const LANDSCAPE_FRAME_W_OVER_H = 2.25;

/**
 * @param {number} w
 * @param {number} h
 * @returns {{ aspectRatio: string, objectFit: 'contain' | 'cover' }}
 */
export function getImageFrame(w, h) {
  if (!w || !h) {
    return { aspectRatio: '3 / 2', objectFit: 'contain' };
  }
  const r = w / h;

  if (r < PORTRAIT_FRAME_W_OVER_H) {
    return {
      aspectRatio: '1 / 1.7',
      objectFit: 'cover',
    };
  }

  if (r > LANDSCAPE_FRAME_W_OVER_H) {
    return {
      aspectRatio: `${LANDSCAPE_FRAME_W_OVER_H} / 1`,
      objectFit: 'contain',
    };
  }

  return {
    aspectRatio: `${w} / ${h}`,
    objectFit: 'contain',
  };
}

/**
 * Average w/h across images → drives media column width between 30% and 50%.
 * @param {Record<string, { w: number, h: number }>} dimsById
 * @returns {number} percent 30–50
 */
export function mediaColumnPercentFromDimensions(dimsById) {
  const dims = Object.values(dimsById).filter(Boolean);
  if (!dims.length) return 40;

  const avgR =
    dims.reduce((sum, { w, h }) => sum + w / h, 0) / dims.length;

  // Tall portraits (~0.5) → ~30%; wide shots (~1.7+) → ~50%
  const lo = 0.5;
  const hi = 1.75;
  const t = Math.min(Math.max(avgR, lo), hi);
  return 30 + ((t - lo) / (hi - lo)) * 20;
}
