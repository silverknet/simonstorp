import React from 'react';
import { CalendarClock, MapPin } from 'lucide-react';

import {
  eventDatumShowsTime,
  formatEventDatumForDisplay,
  formatEventDatumShort,
  formatPublishedForDisplay,
  getPlatsText,
  getPublishedTimestamp,
  hasDatumValue,
} from '../utils/newsDateFormat';

const teaser = {
  wrap: 'flex min-w-0 flex-col gap-0.5',
  pub: 'm-0 text-[11px] font-normal leading-snug tracking-[0.02em] text-neutral-500',
  eventBlock:
    'mt-0.5 flex flex-col gap-0 rounded-md border-l-2 border-[var(--accent-one)]/60 bg-[#829460]/[0.08] py-1 pl-2 pr-1',
  eventLabel:
    'text-[0.65rem] font-semibold uppercase tracking-[0.07em] text-[var(--accent-one)]',
  eventValue: 'text-sm font-medium leading-snug text-[var(--main-text)]',
  platsWrap: 'mt-1 flex flex-col gap-0 rounded-md border border-black/[0.08] bg-white/60 px-2 py-1',
  platsLabel: 'text-[0.6rem] font-semibold uppercase tracking-[0.06em] text-[var(--grey-text)]',
  platsValue: 'text-xs font-medium leading-snug text-[var(--main-text)]',
};

const list = {
  wrap: 'mt-1 flex min-w-0 flex-col gap-1',
  pub: 'm-0 text-[0.7rem] font-light leading-relaxed tracking-[0.04em] text-[rgba(34,34,34,0.45)]',
  eventBlock:
    'flex flex-col gap-0 rounded-md border-l-2 border-[var(--accent-one)]/60 bg-[#829460]/[0.08] py-1.5 pl-2.5 pr-2',
  eventLabel:
    'text-[0.65rem] font-semibold uppercase tracking-[0.07em] text-[var(--accent-one)]',
  eventValue: 'text-[0.95rem] font-medium leading-snug text-[var(--main-text)]',
  platsWrap: 'mt-0.5 flex flex-col gap-0 rounded-md border border-black/[0.08] bg-white/60 px-2 py-1',
  platsLabel: 'text-[0.6rem] font-semibold uppercase tracking-[0.06em] text-[var(--grey-text)]',
  platsValue: 'text-[0.85rem] font-medium leading-snug text-[var(--main-text)]',
};

const teaserCompact = {
  p: 'm-0 text-[10px] leading-snug text-neutral-500',
  event: 'm-0 mt-0.5 text-[10px] font-semibold leading-snug text-[var(--accent-one)]',
  plats: 'm-0 mt-0.5 text-[10px] leading-snug text-neutral-600',
};

const listCompact = {
  p: 'm-0 text-[0.7rem] leading-snug text-[rgba(34,34,34,0.5)]',
  event: 'm-0 mt-0.5 text-[0.7rem] font-semibold leading-snug text-[var(--accent-one)]',
  plats: 'm-0 mt-0.5 text-[0.65rem] leading-snug text-[var(--grey-text)]',
};

const article = {
  wrap: 'mb-6 mt-0 flex w-full flex-col gap-3',
  pub:
    'm-0 text-left font-[\'Lato\',sans-serif] text-[0.75rem] font-light leading-[160%] tracking-[0.04em] text-[rgba(34,34,34,0.45)] antialiased max-[800px]:text-[0.8rem]',
  /** Same shell + typography as platsBlock (border card, not green sidebar) */
  eventBlock:
    'flex flex-col gap-0.5 rounded-md border border-black/[0.1] bg-[var(--bg-white-accent)] px-3 py-2 max-[800px]:px-2.5',
  eventLabel:
    'font-[\'Lato\',sans-serif] text-xs font-semibold uppercase tracking-[0.08em] text-[var(--grey-text)]',
  eventValue:
    'font-[\'Lato\',sans-serif] text-[15px] font-medium leading-snug text-[var(--main-text)] max-[800px]:text-sm',
  platsBlock:
    'flex flex-col gap-0.5 rounded-md border border-black/[0.1] bg-[var(--bg-white-accent)] px-3 py-2 max-[800px]:px-2.5',
  platsLabel:
    'font-[\'Lato\',sans-serif] text-xs font-semibold uppercase tracking-[0.08em] text-[var(--grey-text)]',
  platsValue:
    'font-[\'Lato\',sans-serif] text-[15px] font-medium leading-snug text-[var(--main-text)] max-[800px]:text-sm',
};

const VARIANT_STYLES = { teaser, list, article };

function InlineCompactDates({ data, styles }) {
  const pubStr = formatPublishedForDisplay(getPublishedTimestamp(data));
  const showEvent = hasDatumValue(data?.Datum);
  const eventStr = showEvent ? formatEventDatumShort(data.Datum) : null;
  const platsStr = getPlatsText(data);

  if (!pubStr && !eventStr && !platsStr) return null;

  return (
    <div className="min-w-0">
      {pubStr ? (
        <p className={styles.p}>
          Publicerad <time dateTime={getPublishedTimestamp(data) || undefined}>{pubStr}</time>
        </p>
      ) : null}
      {eventStr ? (
        <p className={styles.event}>{eventStr}</p>
      ) : null}
      {platsStr ? (
        <p className={styles.plats}>
          <span className="font-semibold text-[var(--grey-text)]">Plats: </span>
          {platsStr}
        </p>
      ) : null}
    </div>
  );
}

function PlatsBlock({ v, platsStr, variant }) {
  if (!platsStr) return null;
  const isArticle = variant === 'article';
  const shell = v.platsWrap || v.platsBlock;
  const label = (
    <>
      <span className={v.platsLabel}>Plats</span>
      <span className={`${v.platsValue} block`}>{platsStr}</span>
    </>
  );
  return (
    <div className={shell}>
      {isArticle ? (
        <div className="flex items-start gap-2.5">
          <MapPin
            className="mt-0.5 h-[1.05rem] w-[1.05rem] shrink-0 text-[var(--accent-one)]"
            strokeWidth={2.25}
            aria-hidden
          />
          <div className="flex min-w-0 flex-col gap-0.5">{label}</div>
        </div>
      ) : (
        label
      )}
    </div>
  );
}

/** Full article: datum/händelse — same layout as PlatsBlock (icon + label + value). */
function ArticleEventBlock({ v, eventStr, datumIso }) {
  if (!eventStr) return null;
  const dt =
    typeof datumIso === 'string' && datumIso.trim() !== '' ? datumIso.trim() : undefined;
  const showsTime = eventDatumShowsTime(datumIso);
  const headingLabel = showsTime ? 'Datum & tid' : 'Datum';
  const label = (
    <>
      <span className={v.eventLabel}>{headingLabel}</span>
      {dt ? (
        <time className={`${v.eventValue} block`} dateTime={dt}>
          {eventStr}
        </time>
      ) : (
        <span className={`${v.eventValue} block`}>{eventStr}</span>
      )}
    </>
  );
  return (
    <div className={v.eventBlock}>
      <div className="flex items-start gap-2.5">
        <CalendarClock
          className="mt-0.5 h-[1.05rem] w-[1.05rem] shrink-0 text-[var(--accent-one)]"
          strokeWidth={2.25}
          aria-hidden
        />
        <div className="flex min-w-0 flex-col gap-0.5">{label}</div>
      </div>
    </div>
  );
}

/**
 * Published + optional händelsedatum + optional plats (efter händelsedatum).
 */
export default function NewsMetaDates({ data, variant = 'teaser' }) {
  if (variant === 'teaserCompact') {
    return <InlineCompactDates data={data} styles={teaserCompact} />;
  }
  if (variant === 'listCompact') {
    return <InlineCompactDates data={data} styles={listCompact} />;
  }

  const v = VARIANT_STYLES[variant] ?? VARIANT_STYLES.teaser;
  const pubStr = formatPublishedForDisplay(getPublishedTimestamp(data));
  const showEvent = hasDatumValue(data?.Datum);
  const eventStr = showEvent ? formatEventDatumForDisplay(data.Datum) : null;
  const platsStr = getPlatsText(data);

  if (!pubStr && !eventStr && !platsStr) return null;

  return (
    <div className={v.wrap}>
      {pubStr ? (
        <p className={v.pub}>
          Publicerad <time dateTime={getPublishedTimestamp(data) || undefined}>{pubStr}</time>
        </p>
      ) : null}
      {eventStr ? (
        variant === 'article' ? (
          <ArticleEventBlock v={v} eventStr={eventStr} datumIso={data?.Datum} />
        ) : (
          <div className={v.eventBlock}>
            <span className={v.eventValue}>{eventStr}</span>
          </div>
        )
      ) : null}
      <PlatsBlock v={v} platsStr={platsStr} variant={variant} />
    </div>
  );
}
