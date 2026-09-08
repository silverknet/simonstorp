import React, { Fragment, useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import ImageSlider from '../components/ImageSlider';
import FontLab from '../components/FontLab';
import useFetch from '../hooks/useFetch';
import useWindowDimensions from '../hooks/getWindowDimensions';
import apiBaseUrl from '../config/apiBaseUrl';
import { usePageMeta } from '../utils/pageMeta';
import { getOptimizedDisplayUrl } from '../utils/strapiMedia';
import { getNyhetSlug } from '../utils/utils';
import {
  eventDatumShowsTime,
  formatPublishedForDisplay,
  getPlatsText,
  getPublishedTimestamp,
  hasDatumValue,
} from '../utils/newsDateFormat';
import { plainNewsTeaserText } from '../utils/newsPlainExcerpt';


const HOME_NEWS_URL = `${apiBaseUrl}/api/nyhets?populate=%2A&sort=createdAt:desc&pagination[page]=1&pagination[pageSize]=4`;


const singleColumnRow = 'mt-4 flex w-full flex-col max-[800px]:mt-0 max-[800px]:p-0';

/** The news column, now spanning the width the intro used to share. */
const columnNewsWide =
  "box-border mx-auto w-full max-w-[56rem] font-['Heebo',sans-serif] font-light leading-relaxed tracking-wide " +
  'transition-all duration-700 ease-out m-0 px-4 pb-10 pt-4 ' +
  'max-[800px]:px-[var(--mobile-side)] max-[800px]:pt-0';




/* -------------------------------------------------------------------------- */
/*  News column — “Aktuellt” + cards + “Se alla”                                */
/* -------------------------------------------------------------------------- */

/** Stack: heading, cards, “Se alla” — tight gap under Aktuellt; compact gap between cards */
const newsSection = 'mt-0 flex flex-col gap-0';





/** Page-load fade only on the outer Link — avoids transition-delay slowing hover */
const newsCardLink =
  'group relative block w-full cursor-pointer no-underline text-inherit ' +
  'transition-[opacity,transform] duration-700 ease-out';

/** Hover lives here so it isn’t delayed by the entrance `transitionDelay` on the Link */
/*
 * The pictures come from Facebook posts, so they are whatever somebody happened to
 * photograph — dark, blurry, badly framed. The row is built so a weak image costs
 * little: the headline leads, the picture is small, square and consistently cropped,
 * and it sits at the end of the row rather than opening it.
 */
/*
 * A dated notice, not a magazine card.
 *
 * What people scan this list for is when something happens — valborg, årsmöte, byamöte
 * — so the date leads, set as a stamp in its own column with a rule beside it. The
 * empty space that column leaves is where the air comes from, and it demotes the
 * photograph from the thing carrying the row to a detail beside it, which is what makes
 * an ordinary snapshot harmless here.
 */
const newsCardBase = 'flex w-full items-start gap-6 py-8 max-[800px]:gap-4 max-[800px]:py-6';

const newsStampCell = 'flex shrink-0 items-stretch gap-6 max-[800px]:gap-4';

const newsStamp = 'w-16 shrink-0 pt-px text-center tabular-nums max-[800px]:w-14';

const newsStampDay =
  "m-0 font-['Lato',sans-serif] text-[2rem] font-normal leading-none tracking-[-0.03em] " +
  'text-[var(--main-text)] max-[800px]:text-2xl';

const newsStampMonth =
  "m-0 mt-1.5 font-['Lato',sans-serif] text-xs uppercase tracking-[0.16em] [text-indent:0.16em] " +
  'text-[var(--main-text)]/55';

const newsStampYear =
  "m-0 mt-0.5 font-['Lato',sans-serif] text-[11px] tracking-[0.08em] [text-indent:0.08em] " +
  'text-[var(--grey-text)]/40';

const newsStampRule = 'w-px self-stretch bg-[var(--divider-color)]';

const newsCardDivider = 'h-px w-full shrink-0 bg-[var(--divider-color)]';

const newsCardBody = 'flex min-w-0 flex-1 flex-col text-left';

const newsCardTitle =
  "m-0 w-full min-w-0 max-w-[32ch] font-['Karla',sans-serif] text-[1.625rem] font-normal " +
  'leading-[1.1] transition-colors group-hover:text-[var(--main-text)]/60 max-[800px]:text-xl';

const newsCardMeta =
  'm-0 mt-2 flex w-full min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1 text-left';

const newsCardMetaPrimary = 'text-sm leading-snug text-[var(--main-text)]/70';

const newsCardPubDate = 'text-sm leading-snug text-[var(--grey-text)]/55';

const newsCardExcerpt =
  "m-0 mt-3 max-w-[72ch] overflow-hidden font-['Source_Serif_4',serif] text-[0.875rem] font-light " +
  'leading-[1.65] text-[var(--grey-text)] ' +
  '[display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:4]';

/* Small, and last: the date and the headline carry the row. */
const newsThumbCell = 'ml-auto shrink-0 pl-4 max-[800px]:hidden';

/*
 * White, not the page's own off-white: a mat the same colour as what surrounds it is
 * not a mat at all. Square corners and a wider board, so it reads as a mounted print
 * rather than a rounded UI card, with a shadow just heavy enough to lift it off the page.
 */
const newsThumbWrap =
  'relative shrink-0 rounded-[3px] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_6px_16px_rgba(0,0,0,0.05)] ' +
  'transition-shadow duration-300 group-hover:shadow-[0_2px_6px_rgba(0,0,0,0.08),0_10px_26px_rgba(0,0,0,0.08)]';

const newsThumbInner = 'relative h-[192px] w-[124px] overflow-hidden rounded-[3px] bg-black/[0.04]';

/* Desaturated at rest, its own colour on hover: a column of mismatched snapshots reads
 * as one set, and the photo still rewards the reader who reaches for it. */
const newsThumbImg =
  'block h-full w-full object-cover grayscale transition-[filter,transform] duration-500 ease-out ' +
  'group-hover:scale-[1.04] group-hover:grayscale-0';

const newsReadMore =
  'mt-3 inline-flex items-center gap-2 text-sm text-[var(--main-text)] transition-colors';

const newsReadMoreIcon = 'h-4 w-4 transition-transform group-hover:translate-x-1';

const seeAllWrap =
  'group w-fit px-1 py-0 text-neutral-700 no-underline transition-all duration-700 ease-out ' +
  'hover:cursor-pointer hover:bg-[#f9f9f9] hover:text-neutral-800 ' +
  'max-[800px]:pl-0 max-[800px]:pr-0';

const seeAllLink =
  'm-0 inline-flex w-fit items-center gap-1.5 text-sm text-neutral-600 no-underline transition-colors duration-300 ' +
  'group-hover:border-l-2 group-hover:border-[var(--accent-one)] group-hover:pl-1.5';

/** Day and month for the stamp: the event date where there is one, else when it was posted. */
function stampParts(item) {
  const iso = hasDatumValue(item?.Datum) ? item.Datum : getPublishedTimestamp(item);
  const date = iso ? new Date(iso) : null;

  if (!date || Number.isNaN(date.getTime())) return null;

  return {
    day: new Intl.DateTimeFormat('sv-SE', { day: 'numeric' }).format(date),
    month: new Intl.DateTimeFormat('sv-SE', { month: 'short' }).format(date).replace('.', ''),
    year: date.getFullYear(),
  };
}

export default function Homepage(props) {
  usePageMeta({
    title: null,
    description:
      'Simonstorp i Kolmården — nyheter, evenemang, föreningar, boende och naturupplevelser i socknen.',
    path: '/',
  });

  const { data: newsTeaser, loading: newsLoading, error: newsError } = useFetch(HOME_NEWS_URL);
  const homeData = props.homecontent?.data?.data ?? {};
  const { width: viewportWidth } = useWindowDimensions();
  const showAktuelltMobileRules = viewportWidth <= 800;

  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setContentVisible(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const newsColFade = contentVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0';
  const newsCardFade = contentVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0';
  const seeAllFade = contentVisible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0';

  return (
    <div className="min-h-[calc(100vh-437px)] pb-0">
      {/* TEMPORARY: font experimentation panel, remove with the component. */}
      <FontLab />
      <div className="box-border w-full">
        <ImageSlider
          home={props.homecontent}
          eyebrow="Välkommen till"
          title="Simonstorp"
          bodyText={homeData.Huvudtext}
        />
      </div>

      <div className={singleColumnRow}>
        {/* News now owns the full width below the photograph */}
        <div
          className={`${columnNewsWide} ${newsColFade}`}
          style={{ transitionDelay: '260ms' }}
        >
          <div className={newsSection}>
            {showAktuelltMobileRules ? (
              <div className={newsCardDivider} aria-hidden />
            ) : null}

            {newsLoading || newsError
              ? null
              : (Array.isArray(newsTeaser?.data) ? newsTeaser.data : []).map((value, index) => {
                  const title = value.title ?? value.Rubrik ?? '';
                  const imgUrl = getOptimizedDisplayUrl(value.Bild) || null;
                  const pathSlug = getNyhetSlug(value);
                  if (!pathSlug) return null;
                  // The stamp shows the day; this line adds only what it cannot — the
                  // time and the place — so the date is not printed twice.
                  const timeStr =
                    hasDatumValue(value?.Datum) && eventDatumShowsTime(value.Datum)
                      ? new Intl.DateTimeFormat('sv-SE', {
                          hour: '2-digit',
                          minute: '2-digit',
                        }).format(new Date(value.Datum))
                      : null;
                  const platsStr = getPlatsText(value);
                  const pubStr = formatPublishedForDisplay(getPublishedTimestamp(value));
                  const stamp = stampParts(value);
                  // Where the stamp is already the publication date, saying it again adds nothing.
                  const showPublished = Boolean(pubStr) && hasDatumValue(value?.Datum);

                  return (
                    <Fragment key={value.id}>
                      {index > 0 ? <div className={newsCardDivider} aria-hidden /> : null}
                      <Link
                        className={`${newsCardLink} ${newsCardFade}`}
                        style={{ transitionDelay: `${340 + index * 140}ms` }}
                        to={'/' + pathSlug}
                        state={{ newsFrom: 'home' }}
                      >
                        <div className={newsCardBase}>
                          {stamp ? (
                            <div className={newsStampCell}>
                              <div className={newsStamp}>
                                <p data-font="stamp" className={newsStampDay}>{stamp.day}</p>
                                <p className={newsStampMonth}>{stamp.month}</p>
                                {stamp.year !== new Date().getFullYear() ? (
                                  <p className={newsStampYear}>{stamp.year}</p>
                                ) : null}
                              </div>
                              <div className={newsStampRule} aria-hidden />
                            </div>
                          ) : null}

                          <div className={newsCardBody}>
                            <p data-font="newstitle" className={newsCardTitle}>{title}</p>

                            {timeStr || platsStr || showPublished ? (
                              <p className={newsCardMeta}>
                                {timeStr || platsStr ? (
                                  <span className={newsCardMetaPrimary}>
                                    {[timeStr, platsStr].filter(Boolean).join(' · ')}
                                  </span>
                                ) : null}
                                {showPublished ? (
                                  <span className={newsCardPubDate}>Publicerad {pubStr}</span>
                                ) : null}
                              </p>
                            ) : null}
                            <p data-font="newsbody" className={newsCardExcerpt}>
                              {plainNewsTeaserText(value.Beskrivning)}
                            </p>

                            <span className={newsReadMore}>
                              Läs mer
                              <ArrowRight className={newsReadMoreIcon} aria-hidden />
                            </span>
                          </div>

                          {imgUrl ? (
                            <div className={newsThumbCell}>
                              <div data-newsimg="wrap" className={newsThumbWrap}>
                                <div data-newsimg="inner" className={newsThumbInner}>
                                  <img
                                    data-newsimg="img"
                                    className={newsThumbImg}
                                    src={imgUrl}
                                    alt=""
                                    loading="lazy"
                                  />
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </Link>
                    </Fragment>
                  );
                })}

            {!newsLoading && !newsError && Array.isArray(newsTeaser?.data) && newsTeaser.data.length > 0 ? (
              <div className={newsCardDivider} aria-hidden />
            ) : null}

            <div
              className={`${seeAllWrap} ${seeAllFade}`}
              style={{ transitionDelay: '620ms' }}
            >
              <Link className={seeAllLink} to="/allanyheter">
                <span>Se alla nyheter</span>
                <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2.1} aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
