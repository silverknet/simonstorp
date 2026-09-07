import { useEffect } from 'react';

const SITE_NAME = 'Simonstorp';
const SITE_URL = 'https://simonstorp.se';
const DEFAULT_DESCRIPTION =
  'På vår hemsida hittar du information om aktiviteter, turism, boende, föreningar och organisationer i Simonstorp.';

function setMeta(selector, attr, value) {
  let el = document.head.querySelector(selector);

  if (!value) {
    if (el) el.remove();
    return;
  }

  if (!el) {
    el = document.createElement(selector.startsWith('link') ? 'link' : 'meta');
    const [, key, val] = selector.match(/\[(.+?)="(.+?)"\]/) ?? [];
    if (key) el.setAttribute(key, val);
    document.head.appendChild(el);
  }

  el.setAttribute(attr, value);
}

/**
 * The site is client-rendered, so every route otherwise shares the one <title>
 * and description baked into index.html. Search engines and Facebook both read
 * the rendered DOM, so setting them per route is what makes results and shared
 * links show the actual page rather than "Simonstorp" every time.
 */
export function usePageMeta({ title, description, path, image, noIndex } = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} – ${SITE_NAME}` : SITE_NAME;
    const desc = description || DEFAULT_DESCRIPTION;
    const url = `${SITE_URL}${path ?? window.location.pathname}`;

    document.title = fullTitle;
    setMeta('meta[name="description"]', 'content', desc);
    setMeta('link[rel="canonical"]', 'href', url);

    setMeta('meta[property="og:title"]', 'content', fullTitle);
    setMeta('meta[property="og:description"]', 'content', desc);
    setMeta('meta[property="og:url"]', 'content', url);
    setMeta('meta[property="og:type"]', 'content', 'website');
    setMeta('meta[property="og:site_name"]', 'content', SITE_NAME);
    setMeta('meta[property="og:image"]', 'content', image || null);

    setMeta('meta[name="twitter:card"]', 'content', image ? 'summary_large_image' : 'summary');
    setMeta('meta[name="robots"]', 'content', noIndex ? 'noindex,nofollow' : null);
  }, [title, description, path, image, noIndex]);
}

/** First plain-text sentence(s) of a body, trimmed to a length search results will show. */
export function metaExcerpt(text, max = 160) {
  const clean = String(text ?? '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#*_>`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (clean.length <= max) return clean;

  return `${clean.slice(0, clean.lastIndexOf(' ', max) || max)}…`;
}
