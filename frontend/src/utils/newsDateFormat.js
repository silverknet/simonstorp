/** Strapi `Datum` (date only) or any value — truthy string after trim */
export function hasDatumValue(datum) {
  if (datum == null) return false;
  if (typeof datum === 'string' && datum.trim() === '') return false;
  return true;
}

/** Prefer `publishedAt` when Draft & Publish is on */
export function getPublishedTimestamp(attributes) {
  if (!attributes) return null;
  return attributes.publishedAt ?? attributes.createdAt ?? null;
}

/** Small, neutral line for “Publicerad …” */
export function formatPublishedForDisplay(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat('sv-SE', { dateStyle: 'medium' }).format(d);
}

/**
 * Strapi “datum utan tid” sparas ofta som 00:00 UTC → visas som 00:00–02:00 i Sverige (CET/CEST).
 * Då ska bara datum visas, inte tid.
 */
export function shouldOmitEventTimePlaceholder(d) {
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return true;
  if (d.getUTCHours() === 0 && d.getUTCMinutes() === 0 && d.getUTCSeconds() === 0) {
    return true;
  }
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Stockholm',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  }).formatToParts(d);
  const hour = Number(parts.find((p) => p.type === 'hour')?.value);
  const minute = Number(parts.find((p) => p.type === 'minute')?.value);
  const second = Number(parts.find((p) => p.type === 'second')?.value);
  if (minute !== 0 || second !== 0) return false;
  return hour === 0 || hour === 1 || hour === 2;
}

/** Händelsedatum (Strapi datetime) — tid bara om den är “riktigt” angiven */
export function formatEventDatumForDisplay(datum) {
  if (!hasDatumValue(datum)) return null;
  const raw = typeof datum === 'string' ? datum.trim() : datum;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) {
    return String(raw);
  }
  const omitTime = shouldOmitEventTimePlaceholder(d);
  return new Intl.DateTimeFormat(
    'sv-SE',
    omitTime
      ? { dateStyle: 'long' }
      : { dateStyle: 'long', timeStyle: 'short' }
  ).format(d);
}

/** Kompakt rad (lista / startsida) */
export function formatEventDatumShort(datum) {
  if (!hasDatumValue(datum)) return null;
  const raw = typeof datum === 'string' ? datum.trim() : datum;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) {
    return String(raw);
  }
  const omitTime = shouldOmitEventTimePlaceholder(d);
  return new Intl.DateTimeFormat(
    'sv-SE',
    omitTime
      ? { dateStyle: 'medium' }
      : { dateStyle: 'medium', timeStyle: 'short' }
  ).format(d);
}

function rawPlatsField(attributes) {
  if (!attributes || typeof attributes !== 'object') return null;
  return (
    attributes.Plats ??
    attributes.plats ??
    attributes.Location ??
    attributes.location ??
    attributes['Plats'] ??
    attributes['plats']
  );
}

/** Strapi `Plats` — frivillig */
export function hasPlatsValue(attributes) {
  const p = rawPlatsField(attributes);
  if (p == null) return false;
  if (typeof p === 'string' && p.trim() === '') return false;
  return true;
}

export function getPlatsText(attributes) {
  if (!hasPlatsValue(attributes)) return null;
  const p = rawPlatsField(attributes);
  return typeof p === 'string' ? p.trim() : String(p);
}
