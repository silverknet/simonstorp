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
  'relative -ml-1 block w-full cursor-pointer no-underline text-inherit transition-[opacity,transform] duration-700 ease-out max-[800px]:ml-0';

/** Hover lives here so it isn’t delayed by the entrance `transitionDelay` on the Link */
/*
 * The pictures come from Facebook posts, so they are whatever somebody happened to
 * photograph — dark, blurry, badly framed. The row is built so a weak image costs
 * little: the headline leads, the picture is small, square and consistently cropped,
 * and it sits at the end of the row rather than opening it.
 */
const newsCardBase = 'flex w-full items-start gap-6 py-7 max-[800px]:gap-4 max-[800px]:py-5';

const newsThumbCell = 'order-2 shrink-0';

/** One fixed square, whatever the source aspect ratio. */
const newsThumbWrap =
  'relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-[var(--bg-white-accent)] ' +
  'max-[800px]:h-16 max-[800px]:w-16';

const newsThumb = 'absolute inset-0 h-full w-full object-cover';

/** Hairlines between stories; no boxes. */
const newsCardDivider = 'h-px w-full shrink-0 bg-[var(--divider-color)]';

const newsCardBodyBase = 'order-1 flex min-w-0 flex-1 flex-col text-left';
const newsCardBody = newsCardBodyBase;
const newsCardBodyTextOnly = newsCardBodyBase;

const newsCardLeadBlock = 'flex min-w-0 flex-col';

const newsCardTitleRow = 'flex w-full min-w-0 flex-col text-[var(--main-text)]';

const newsCardTitle =
  'm-0 w-full min-w-0 overflow-hidden text-[1.35rem] font-normal leading-snug tracking-[-0.01em] ' +
  'transition-colors [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] ' +
  'max-[800px]:text-lg';

const newsCardMeta =
  'm-0 mt-1 block w-full min-w-0 break-words text-left text-xs font-normal leading-snug text-[var(--grey-text)]/70';

const newsCardPubDate = 'm-0 text-xs leading-snug text-[var(--grey-text)]/55';

const newsCardExcerpt =
  'm-0 mt-3 max-w-[68ch] overflow-hidden text-[0.95rem] leading-[1.7] text-[var(--grey-text)] ' +
  '[display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]';

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
                  const imgUrl = getOptimizedDisplayUrl(value.Bild) || null;
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
                          {imgUrl ? (
                            <div className={newsThumbCell}>
                              <div className={newsThumbWrap}>
                                <img className={newsThumb} src={imgUrl} alt="" />
                              </div>
                            </div>
                          ) : null}
                          <div className={imgUrl ? newsCardBody : newsCardBodyTextOnly}>
                            <div className={newsCardLeadBlock}>
                              <div className={newsCardTitleRow}>
                                <p className={newsCardTitle}>{title}</p>
                                {(eventStr || platsStr) ? (
                                  <span className={newsCardMeta}>
                                    {eventStr ?? ''}
                                    {eventStr && platsStr ? <span aria-hidden> · </span> : null}
                                    {platsStr ?? ''}
                                  </span>
                                ) : null}
                              </div>
                              {pubStr ? (
                                <p className={newsCardPubDate}>Publicerad {pubStr}</p>
                              ) : null}
                            </div>
                            <p className={newsCardExcerpt}>
                              {plainNewsTeaserText(value.Beskrivning)}
                            </p>
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
