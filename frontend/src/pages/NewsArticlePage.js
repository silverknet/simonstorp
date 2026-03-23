import React from 'react';
import { SearchX } from 'lucide-react';
import { useParams } from 'react-router-dom';

import ErrorScreen from '../components/ErrorScreen';
import { useNyhetBySlug } from '../hooks/useNyhetBySlug';
import FullNews from './Full_news';

const loadingClasses =
  'flex min-h-[min(50vh,400px)] w-full flex-col items-center justify-center px-4 py-16 text-center font-[\'Lato\',sans-serif] text-[var(--grey-text)]';

/**
 * Catch-all for `/:slug` when the slug is not a static page route.
 * Loads a single nyhet by slug (see useNyhetBySlug).
 */
export default function NewsArticlePage() {
  const { slug } = useParams();
  const { page, loading, error } = useNyhetBySlug(slug);

  if (loading) {
    return (
      <div className={loadingClasses} aria-live="polite">
        Laddar …
      </div>
    );
  }

  if (error) {
    return (
      <ErrorScreen
        title="Kunde inte ladda artikeln"
        description="Ett fel uppstod när artikeln skulle hämtas. Försök igen om en stund."
      />
    );
  }

  if (!page) {
    return (
      <ErrorScreen
        title="Artikeln hittades inte"
        description="Det finns ingen nyhet med den här adressen. Den kan ha flyttats eller tagits bort."
        icon={SearchX}
      />
    );
  }

  return <FullNews page={page} />;
}
