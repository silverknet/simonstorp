import React, { Fragment, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ArrowRight, Newspaper } from 'lucide-react';
import remarkBreaks from 'remark-breaks';
import { Link } from 'react-router-dom';

import ImageSlider from '../components/ImageSlider';
import useFetch from '../hooks/useFetch';
import useWindowDimensions from '../hooks/getWindowDimensions';
import apiBaseUrl from '../config/apiBaseUrl';
import { usePageMeta } from '../utils/pageMeta';
import { getNyhetSlug } from '../utils/utils';
import {
  formatEventDatumShort,
  formatPublishedForDisplay,
  getPlatsText,
  getPublishedTimestamp,
  hasDatumValue,
} from '../utils/newsDateFormat';
import { plainNewsTeaserText } from '../utils/newsPlainExcerpt';


const HOME_NEWS_URL = `${apiBaseUrl}/api/nyhets?populate=%2A&sort=createdAt:desc&pagination[page]=1&pagination[pageSize]=4`;

/** Shared heading row contract: both headings use items-start; Aktuellt adds pt-[15px] offset */
const headingRow =
  'mb-4 flex items-start max-[800px]:mb-4';

const singleColumnRow = 'mt-4 flex w-full flex-col max-[800px]:mt-0 max-[800px]:p-0';

/** The news column, now spanning the width the intro used to share. */
const columnNewsWide =
  "box-border mx-auto w-full max-w-[56rem] font-['Heebo',sans-serif] font-light leading-relaxed tracking-wide " +
  'transition-all duration-700 ease-out m-0 px-4 pb-10 pt-4 ' +
  'max-[800px]:px-[var(--mobile-side)] max-[800px]:pt-0';

/** Intro set over the photograph: white, kept to a readable column. */
const introOnImage =
  // text-white on the wrapper is not enough: the global stylesheet sets a colour on <p>
  // itself, which wins over inheritance.
  '[&_p]:m-0 [&_p]:text-white [&_p+p]:mt-3 [&_a]:text-white [&_a]:underline [&_strong]:font-semibold';



/* -------------------------------------------------------------------------- */
/*  News column — “Aktuellt” + cards + “Se alla”                                */
/* -------------------------------------------------------------------------- */

/** Stack: heading, cards, “Se alla” — tight gap under Aktuellt; compact gap between cards */
const newsSection = 'mt-0 flex flex-col gap-0';

const aktuelltHeadingWrap =
  `${headingRow} w-full items-start pt-[15px] gap-2 border-0 p-0 max-[800px]:pt-0 max-[800px]:mb-1`;

const aktuelltHeadingCluster = 'flex flex-1 items-end gap-2';

const aktuelltHeadingIcon =
  'mb-0.5 h-5 w-5 shrink-0 self-end text-[#131313] opacity-90';

const aktuelltHeading =
  'm-0 self-end text-lg font-light leading-tight text-[#131313]';

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
 * No thumbnail.
 *
 * The pictures come from Facebook posts and are whatever somebody happened to
 * photograph. Shrunk into a corner they read as an apology for themselves, and given
 * room they overpower the story. The list is text instead — headline, when and where,
 * a couple of lines — and the photograph appears on the article page, where the reader
 * has already chosen to look at it.
 */
const newsCardBase = 'flex w-full flex-col py-8 max-[800px]:py-6';

const newsCardDivider = 'h-px w-full shrink-0 bg-[var(--divider-color)]';

const newsCardBody = 'flex min-w-0 flex-1 flex-col text-left';



const newsCardTitle =
  'm-0 w-full min-w-0 max-w-[34ch] text-[1.6rem] font-light leading-[1.2] tracking-[-0.015em] ' +
  'transition-colors group-hover:text-[var(--main-text)]/60 max-[800px]:text-xl';

/* Title → meta → text → link all step by the same amount; the two meta values sit
   together on one line rather than stacking into a second block. */
const newsCardMeta =
  'm-0 mt-3 flex w-full min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1 text-left';

const newsCardMetaPrimary = 'text-sm leading-snug text-[var(--main-text)]/70';

const newsCardPubDate = 'text-sm leading-snug text-[var(--grey-text)]/55';

const newsCardExcerpt =
  'm-0 mt-3 max-w-[72ch] overflow-hidden text-[1rem] leading-[1.75] text-[var(--grey-text)] ' +
  '[display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]';

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
      <div className="box-border w-full">
        <ImageSlider
          home={props.homecontent}
          eyebrow="Välkommen till"
          title="Simonstorp"
          body={
            <ReactMarkdown className={introOnImage} remarkPlugins={[remarkBreaks]}>
              {homeData.Huvudtext}
            </ReactMarkdown>
          }
        />
      </div>

      <div className={singleColumnRow}>
        {/* News now owns the full width below the photograph */}
        <div
          className={`${columnNewsWide} ${newsColFade}`}
          style={{ transitionDelay: '260ms' }}
        >
          <div className={newsSection}>
            <div className={aktuelltHeadingWrap}>
              <div className={aktuelltHeadingCluster}>
                <Newspaper className={aktuelltHeadingIcon} strokeWidth={1.75} aria-hidden />
                <p className={aktuelltHeading}>Händer i Simonstorp</p>
              </div>
            </div>
            {showAktuelltMobileRules ? (
              <div className={newsCardDivider} aria-hidden />
            ) : null}

            {newsLoading || newsError
              ? null
              : (Array.isArray(newsTeaser?.data) ? newsTeaser.data : []).map((value, index) => {
                  const title = value.title ?? value.Rubrik ?? '';
                  const pathSlug = getNyhetSlug(value);
                  if (!pathSlug) return null;
                  const eventStr = hasDatumValue(value?.Datum)
                    ? formatEventDatumShort(value.Datum)
                    : null;
                  const platsStr = getPlatsText(value);
                  const pubStr = formatPublishedForDisplay(getPublishedTimestamp(value));

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
                          <div className={newsCardBody}>
                            <p className={newsCardTitle}>{title}</p>

                            {eventStr || platsStr || pubStr ? (
                              <p className={newsCardMeta}>
                                {eventStr || platsStr ? (
                                  <span className={newsCardMetaPrimary}>
                                    {[eventStr, platsStr].filter(Boolean).join(' · ')}
                                  </span>
                                ) : null}
                                {pubStr ? (
                                  <span className={newsCardPubDate}>Publicerad {pubStr}</span>
                                ) : null}
                              </p>
                            ) : null}
                            <p className={newsCardExcerpt}>
                              {plainNewsTeaserText(value.Beskrivning)}
                            </p>

                            <span className={newsReadMore}>
                              Läs mer
                              <ArrowRight className={newsReadMoreIcon} aria-hidden />
                            </span>
                          </div>
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
