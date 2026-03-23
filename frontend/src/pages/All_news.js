import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ErrorScreen from '../components/ErrorScreen';
import NewsMetaDates from '../components/NewsMetaDates';
import useFetch from '../hooks/useFetch';
import apiBaseUrl from '../config/apiBaseUrl';
import { getOptimizedDisplayUrl } from '../utils/strapiMedia';
import { getNyhetSlug } from '../utils/utils';

const PAGE_SIZE = 6;

function buildNyheterUrl(page) {
  return (
    `${apiBaseUrl}/api/nyhets?populate=%2A&sort=publishedAt:desc&pagination[page]=${page}&pagination[pageSize]=${PAGE_SIZE}`
  );
}

function listImageUrl(item) {
  return getOptimizedDisplayUrl(item?.Bild);
}

const pageTitleClasses =
  'mb-8 w-full text-center font-[\'Lato\',sans-serif] text-[25px] font-normal leading-[1.28] tracking-[0.04rem] text-[var(--grey-text)] antialiased ' +
  'max-[800px]:mb-6 max-[800px]:text-[29px] max-[800px]:font-light';

const cardClassesBase =
  'flex w-full overflow-hidden rounded-lg border border-black/[0.08] bg-[var(--bg-white-accent)] p-4 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] ' +
  'transition-[transform,box-shadow] duration-200 ease-out no-underline text-inherit ' +
  'hover:scale-[1.005] hover:shadow-[0_4px_14px_rgba(0,0,0,0.06)]';

const cardClassesWithImage =
  `${cardClassesBase} flex-col gap-4 sm:flex-row sm:items-stretch sm:gap-4`;

const cardClassesTextOnly = `${cardClassesBase} flex-col gap-2`;

const cardMediaWrap =
  'relative w-full shrink-0 overflow-hidden rounded-md min-h-[10rem] sm:min-h-0 sm:w-48 sm:max-w-[12rem] sm:self-stretch';

const cardImgCover = 'absolute inset-0 h-full w-full object-cover';

const cardTitleClasses =
  'm-0 font-[\'Lato\',sans-serif] text-[17px] font-medium leading-snug tracking-[1px] text-[var(--main-text)]';

const cardExcerptClasses =
  'm-0 mt-2 overflow-hidden font-[\'Lato\',sans-serif] text-[15px] font-light leading-[180%] tracking-[0.5px] text-[var(--main-text)] ' +
  '[display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]';

const paginationWrapClasses =
  'mt-10 flex flex-col items-center justify-center gap-4 border-t border-black/[0.08] pt-8 max-[800px]:mt-8 max-[800px]:pt-6';

const paginationInfoClasses =
  'm-0 font-[\'Lato\',sans-serif] text-sm font-light tracking-[1px] text-[var(--grey-text)]';

const pageBtnClasses =
  'inline-flex min-w-[7rem] items-center justify-center rounded-md border border-black/[0.12] bg-white px-4 py-2 font-[\'Lato\',sans-serif] text-sm font-light ' +
  'text-[var(--main-text)] transition-colors hover:border-[var(--accent-one)]/40 hover:bg-[var(--bg-white-accent)] disabled:cursor-not-allowed disabled:opacity-40';

export default function All_news() {
  const [page, setPage] = useState(1);
  const listUrl = useMemo(() => buildNyheterUrl(page), [page]);
  const { loading, error, data } = useFetch(listUrl);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  if (error) {
    return (
      <ErrorScreen
        title="Kunde inte ladda nyheter"
        description="Nyhetslistan kunde inte hämtas. Kontrollera anslutningen och försök igen."
      />
    );
  }

  if (loading || !data) {
    return (
      <div
        className="mx-auto max-w-[1100px] px-4 py-16 text-center font-['Lato',sans-serif] text-[var(--grey-text)]"
        aria-live="polite"
      >
        Laddar nyheter…
      </div>
    );
  }

  const items = data.data ?? [];
  const pagination = data.meta?.pagination;
  const pageCount = pagination?.pageCount ?? 1;
  const current = pagination?.page ?? page;
  const total = pagination?.total ?? items.length;

  return (
    <div className="w-full pb-12 pt-4">
      <div className="mx-auto flex w-full max-w-[900px] flex-col items-stretch px-4 pt-5 max-[800px]:pt-4">
        <h1 className={pageTitleClasses}>Alla nyheter i Simonstorp</h1>

        <ul className="m-0 flex list-none flex-col gap-4 p-0">
          {items.map((value) => {
            const img = listImageUrl(value);
            const title = value.title ?? value.Rubrik ?? '';
            const pathSlug = getNyhetSlug(value);
            if (!pathSlug) {
              return null;
            }
            return (
              <li key={value.id}>
                <Link
                  className={img ? cardClassesWithImage : cardClassesTextOnly}
                  to={`/${pathSlug}`}
                  state={{ newsFrom: 'list' }}
                >
                  {img ? (
                    <div className={cardMediaWrap}>
                      <img className={cardImgCover} src={img} alt="" />
                    </div>
                  ) : null}
                  <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
                    <p className={cardTitleClasses}>{title}</p>
                    <NewsMetaDates data={value} variant="listCompact" />
                    <p className={cardExcerptClasses}>{value.Beskrivning}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

        {pageCount > 1 ? (
          <nav className={paginationWrapClasses} aria-label="Sidnumrering">
            <p className={paginationInfoClasses}>
              Sida {current} av {pageCount}
              {typeof total === 'number' ? ` · ${total} nyheter` : null}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                className={pageBtnClasses}
                disabled={current <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Föregående
              </button>
              <button
                type="button"
                className={pageBtnClasses}
                disabled={current >= pageCount}
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              >
                Nästa
              </button>
            </div>
          </nav>
        ) : null}
      </div>
    </div>
  );
}
