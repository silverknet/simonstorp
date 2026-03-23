export const getCategoryFromPage = (pages, pageID) => {
    const page = pages.find((p) => p.id === pageID);
    const categories = Array.isArray(page?.categories)
        ? page.categories
        : Array.isArray(page?.categories?.data)
            ? page.categories.data
            : [];
    if (categories && categories.length > 0) {
        return categories[0].id;
    }
    return null;
};

export function getStrapiItems(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
}

export function toValidUrl(input) {
  return String(input)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")  
    .replace(/[^a-zA-Z0-9]/g, "")    
    .toLowerCase();
}

/** Trim, strip slashes, lowercase — for comparing path segment ↔ Strapi `url` */
export function normalizeNyhetUrlSegment(input) {
  if (input == null) return '';
  return String(input).trim().replace(/^\/+|\/+$/g, '').toLowerCase();
}

function getNyhetDateSlugPart(data) {
  const raw = data?.Datum ?? data?.publishedAt ?? data?.createdAt ?? null;
  if (!raw) return '';

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return '';

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Path segment for nyhet links: generate from title + date to avoid collisions
 * for recurring items like annual meetings. Falls back to documentId prefix when
 * no usable date exists.
 */
export function getNyhetSlug(data) {
  if (!data) return '';

  const title = data.title ?? data.Rubrik ?? '';
  const base = toValidUrl(title);
  const datePart = getNyhetDateSlugPart(data);
  const docPart =
    typeof data.documentId === 'string' ? data.documentId.trim().slice(0, 8).toLowerCase() : '';
  const uniquePart = datePart || docPart;

  if (base && uniquePart) return `${base}-${uniquePart}`;
  if (base) return base;
  return uniquePart;
}