import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ErrorScreen from '../components/ErrorScreen';
import useFetch from '../hooks/useFetch';
import apiBaseUrl from '../config/apiBaseUrl';
import { getOptimizedDisplayUrl } from '../utils/strapiMedia';
import { getNyhetSlug } from '../utils/utils';
import {
  formatEventDatumShort,
  formatPublishedForDisplay,
  getPlatsText,
  getPublishedTimestamp,
  hasDatumValue,
} from '../utils/newsDateFormat';
import { plainNewsTeaserText } from '../utils/newsPlainExcerpt';

const PAGE_SIZE = 4;

function buildNyheterUrl(page) {
  return (
    `${apiBaseUrl}/api/nyhets?populate=%2A&sort=createdAt:desc&pagination[page]=${page}&pagination[pageSize]=${PAGE_SIZE}`
  );
}

const pageTitleClasses =
  'mb-8 w-full text-center font-[\'Lato\',sans-serif] text-[25px] font-normal leading-[1.28] tracking-[0.04rem] text-[var(--grey-text)] antialiased ' +
  'max-[800px]:mb-6 max-[800px]:text-[29px] max-[800px]:font-light';

/* -------------------------------------------------------------------------- */
/*  Card — matches Homepage news card design                                   */
/* -------------------------------------------------------------------------- */

/**
 * ≤800px: column, image on top.
 * ≥801px: row, image height = text column height (stretch), fixed width w-52, even p-3.
 */
const cardBase =
  'flex w-full flex-col items-stretch overflow-hidden rounded-lg bg-[#f9f9f9] ' +
  'no-underline text-inherit shadow-none ' +
  'transition-[transform,box-shadow] duration-200 ease-out ' +
  'hover:scale-[1.01] hover:shadow-lg ' +
  'min-[801px]:flex-row min-[801px]:items-stretch';

const thumbCell =
  'flex w-full shrink-0 p-3 max-[800px]:pb-0 ' +
  'min-[801px]:w-auto min-[801px]:self-stretch min-[801px]:p-3';

/** Mobile: hero strip. Desktop: full row height, fixed width (landscape crop via object-cover). */
const thumbWrap =
  'relative w-full shrink-0 overflow-hidden rounded-sm bg-[var(--bg-white-accent)] ' +
  'aspect-[16/10] min-h-[11rem] max-h-56 ' +
  'min-[801px]:aspect-auto min-[801px]:h-full min-[801px]:w-52 min-[801px]:min-h-0 min-[801px]:max-h-none';

const thumbImg = 'absolute inset-0 h-full w-full object-cover';

/** Desktop: same as pre–mobile-stack (py-3 pr-4 + pl-0 / pl-3). Mobile: padded block under image. */
const cardBodyBase =
  'flex min-w-0 flex-1 flex-col justify-start gap-0.5 bg-[#f9f9f9] text-left ' +
  'max-[800px]:px-3 max-[800px]:py-3 ' +
  'min-[801px]:py-3 min-[801px]:pr-4';

const cardBody = `${cardBodyBase} min-[801px]:pl-0`;

const cardBodyTextOnly = `${cardBodyBase} min-[801px]:pl-3`;

const cardTitleRow =
  'flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0 text-[var(--main-text)]';

const cardTitle =
  "m-0 min-w-0 flex-1 font-['Lato',sans-serif] text-[17px] font-medium leading-snug tracking-[0.5px] text-[var(--main-text)]";

const cardMeta = 'shrink-0 text-[10px] font-normal leading-snug text-neutral-400';

const cardPubDate = 'm-0 text-[10px] leading-snug text-neutral-400';

const cardExcerpt =
  "m-0 mt-1 overflow-hidden font-['Lato',sans-serif] text-[15px] font-light leading-[180%] text-[var(--main-text)] " +
  '[display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:5]';

/* -------------------------------------------------------------------------- */

const paginationWrapClasses =
  'mt-10 flex flex-col items-center justify-center gap-4 border-t border-black/[0.08] pt-8 max-[800px]:mt-8 max-[800px]:pt-6';

const paginationInfoClasses =
  "m-0 font-['Lato',sans-serif] text-sm font-light tracking-[1px] text-[var(--grey-text)]";

const pageBtnClasses =
  "inline-flex min-w-[7rem] items-center justify-center rounded-md border border-black/[0.12] bg-white px-4 py-2 font-['Lato',sans-serif] text-sm font-light " +
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

        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {items.map((value) => {
            const img = getOptimizedDisplayUrl(value?.Bild) || null;
            const title = value.title ?? value.Rubrik ?? '';
            const pathSlug = getNyhetSlug(value);
            if (!pathSlug) return null;

            const eventStr = hasDatumValue(value?.Datum)
              ? formatEventDatumShort(value.Datum)
              : null;
            const platsStr = getPlatsText(value);
            const pubStr = formatPublishedForDisplay(getPublishedTimestamp(value));

            return (
              <li key={value.id}>
                <Link
                  className={cardBase}
                  to={`/${pathSlug}`}
                  state={{ newsFrom: 'list' }}
                >
                  {img ? (
                    <div className={thumbCell}>
                      <div className={thumbWrap}>
                        <img className={thumbImg} src={img} alt="" />
                      </div>
                    </div>
                  ) : null}
                  <div className={img ? cardBody : cardBodyTextOnly}>
                    <div className={cardTitleRow}>
                      <p className={cardTitle}>{title}</p>
                      {(eventStr || platsStr) ? (
                        <span className={cardMeta}>
                          {eventStr ?? ''}
                          {eventStr && platsStr ? <span aria-hidden> · </span> : null}
                          {platsStr ?? ''}
                        </span>
                      ) : null}
                    </div>
                    {pubStr ? (
                      <p className={cardPubDate}>Publicerad {pubStr}</p>
                    ) : null}
                    <p className={cardExcerpt}>{plainNewsTeaserText(value.Beskrivning)}</p>
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
