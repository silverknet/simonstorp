import { useEffect, useState } from 'react';

import apiBaseUrl from '../config/apiBaseUrl';
import { getNyhetSlug, normalizeNyhetUrlSegment } from '../utils/utils';

/**
 * Resolve one nyhet by path segment (matches `getNyhetSlug` used in Link `to`).
 * Uses the same generated slug as links in the UI, so recurring posts with the
 * same title remain uniquely addressable.
 */
export function useNyhetBySlug(slug) {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(Boolean(slug));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) {
      setPage(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setPage(null);

      try {
        let pageNum = 1;
        const pageSize = 50;
        let res;
        let json;
        const want = normalizeNyhetUrlSegment(slug);

        while (true) {
          const paged = `${apiBaseUrl}/api/nyhets?populate=%2A&sort=publishedAt:desc&pagination[page]=${pageNum}&pagination[pageSize]=${pageSize}`;
          res = await fetch(paged);
          json = await res.json();

          if (cancelled) return;

          if (!res.ok) {
            throw new Error('Kunde inte ladda nyheter.');
          }

          const items = json.data || [];
          const hit = items.find((n) => getNyhetSlug(n) === want);

          if (hit) {
            setPage(hit);
            return;
          }

          const pageCount = json.meta?.pagination?.pageCount ?? 1;
          if (pageNum >= pageCount) break;
          pageNum += 1;
        }

        setPage(null);
      } catch (e) {
        if (!cancelled) {
          setError(e);
          setPage(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { page, loading, error };
}
