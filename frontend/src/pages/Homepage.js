import React, { Fragment, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ArrowRight, Newspaper } from 'lucide-react';
import remarkBreaks from 'remark-breaks';
import { Link } from 'react-router-dom';

import ImageSlider from '../components/ImageSlider';
import useFetch from '../hooks/useFetch';
import useWindowDimensions from '../hooks/getWindowDimensions';
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

/** Latest two by publish time — never the full nyhets list */
const HOME_NEWS_URL = `${apiBaseUrl}/api/nyhets?populate=%2A&sort=createdAt:desc&pagination[page]=1&pagination[pageSize]=2`;

/* -------------------------------------------------------------------------- */
/*  Layout — two columns below hero; wraps at lg (matches old max-[1200px])   */
/* -------------------------------------------------------------------------- */

const twoColumnRow =
  'flex flex-row flex-nowrap justify-evenly max-[1200px]:flex-wrap max-[800px]:mt-0 max-[800px]:p-0';

/** Shared “home_B” column shell: half width desktop, full width mobile */
const columnShell =
  'box-border w-1/2 min-w-96 max-w-3xl font-light leading-relaxed tracking-wide transition-all duration-700 ease-out ' +
  'm-4 p-8 max-[1200px]:w-auto max-[800px]:m-0 max-[800px]:min-w-0 max-[800px]:w-full max-[800px]:max-w-none max-[800px]:p-0';

const columnIntro = `${columnShell} font-['Lato',sans-serif] max-[800px]:pb-12`;

const columnNews = `${columnShell} font-['Heebo',sans-serif] max-[800px]:m-2.5`;

/* -------------------------------------------------------------------------- */
/*  Intro column — title + markdown                                           */
/* -------------------------------------------------------------------------- */

const introTitle =
  'm-0 text-3xl font-light leading-tight max-[800px]:text-center max-[800px]:leading-snug';

/** Shared heading row contract: both headings use items-start; Aktuellt adds pt-[15px] offset */
const headingRow =
  'mb-4 flex items-start max-[800px]:mb-4';

const introHeadingRow = `${headingRow} max-[800px]:mx-[var(--mobile-side)] max-[800px]:mt-12`;

const introMarkdown =
  'text-left font-["Lato",sans-serif] text-base leading-relaxed tracking-wide text-[var(--main-text)] ' +
  '[&_p]:m-0 [&_a]:text-[var(--accent-one)] [&_strong]:font-semibold ' +
  'max-[800px]:px-[var(--mobile-side)] max-[800px]:mt-0 max-[800px]:text-lg';

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
const newsCardBase =
  'flex min-h-36 w-full flex-row items-stretch overflow-hidden rounded-lg bg-[#f9f9f9] ' +
  'text-[var(--main-text)] shadow-none transition-[transform,box-shadow] duration-200 ease-out ' +
  'hover:scale-[1.01] hover:shadow-lg';

/** Thumb stays h-28 and sits centered within the taller card */
const newsThumbCell = 'flex shrink-0 items-center justify-center self-stretch p-2';

const newsThumbWrap =
  'relative h-28 w-28 shrink-0 overflow-hidden rounded-sm bg-[var(--bg-white-accent)]';

/** Thin separator between home news cards / before “Se alla” */
const newsCardDivider = 'my-1.5 h-px w-full shrink-0 bg-[var(--divider-color)]';

const newsThumb = 'absolute inset-0 h-full w-full object-cover';

const newsCardBodyBase =
  'flex min-w-0 flex-1 flex-col justify-center gap-0.5 bg-[#f9f9f9] py-3 text-left';

/** Beside image: inner padding of the text column (after thumb). */
const newsCardBody = `${newsCardBodyBase} pl-2 pr-4`;

/** No image: full-width text — left inset matches image left edge (p-2 = 8px). */
const newsCardBodyTextOnly = `${newsCardBodyBase} pl-2 pr-4`;

/** Title row: title left (wraps freely), event meta right (wraps only if forced) */
const newsCardTitleRow =
  'flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0 text-[var(--main-text)]';

const newsCardTitle = 'm-0 min-w-0 flex-1 font-normal leading-snug';

/** Event date + optional place shown inline to the right of the title */
const newsCardMeta = 'shrink-0 text-[10px] font-normal leading-snug text-neutral-400';

/** Published date — small muted line below the title row */
const newsCardPubDate = 'm-0 text-[10px] leading-snug text-neutral-400';

const newsCardExcerpt =
  'm-0 mt-1 overflow-hidden pr-1 pb-px text-sm leading-normal text-[#403939] ' +
  '[display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]';

const seeAllWrap =
  'group w-fit px-1 py-0 text-neutral-700 no-underline transition-all duration-700 ease-out ' +
  'hover:cursor-pointer hover:bg-[#f9f9f9] hover:text-neutral-800';

const seeAllLink =
  'm-0 inline-flex w-fit items-center gap-1.5 text-sm text-neutral-600 no-underline transition-colors duration-300 ' +
  'group-hover:border-l-2 group-hover:border-[var(--accent-one)] group-hover:pl-1.5';

export default function Homepage(props) {
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

  const introFade = contentVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0';
  const newsColFade = contentVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0';
  const newsCardFade = contentVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0';
  const seeAllFade = contentVisible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0';

  return (
    <div className="min-h-[calc(100vh-437px)] pb-0">
      <div className="box-border w-full">
        <ImageSlider home={props.homecontent} />
      </div>

      <div className={twoColumnRow}>
        {/* Left: site intro */}
        <div
          className={`${columnIntro} ${introFade}`}
          style={{ transitionDelay: '140ms' }}
        >
          <div className={introHeadingRow}>
            <h1 className={introTitle}>{homeData.upper}</h1>
          </div>
          <ReactMarkdown className={introMarkdown} remarkPlugins={[remarkBreaks]}>
            {homeData.Huvudtext}
          </ReactMarkdown>
        </div>

        {/* Right: news teaser */}
        <div
          className={`${columnNews} ${newsColFade}`}
          style={{ transitionDelay: '260ms' }}
        >
          <div className={newsSection}>
            <div className={aktuelltHeadingWrap}>
              <div className={aktuelltHeadingCluster}>
                <Newspaper className={aktuelltHeadingIcon} strokeWidth={1.75} aria-hidden />
                <p className={aktuelltHeading}>Aktuellt</p>
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
                            <p className={newsCardExcerpt}>{value.Beskrivning}</p>
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
